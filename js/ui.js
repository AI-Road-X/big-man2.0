var currentTab = 'myvehicles';
var myFleetSort = { field: 'name', asc: true };

function updateUI() {
  var date = getGameDate();
  document.getElementById('dayDisplay').textContent = formatDate(date) + ' ' + getWeekDay(date);
  document.getElementById('cash').textContent = formatCurrency(gameState.cash);
  document.getElementById('fleet').textContent = gameState.ownedVehicles.length + ' 辆';
  document.getElementById('todayIncome').textContent = formatCurrency(gameState.todayIncome);
  document.getElementById('todayExpense').textContent = formatCurrency(gameState.todayExpense);
  document.getElementById('orderBadge').textContent = gameState.pendingOrders.length || '';
  var eventEl = document.getElementById('activeEventsBar');
  if (eventEl) {
    if (gameState.activeEvents.length > 0) {
      eventEl.style.display = 'flex';
      eventEl.innerHTML = gameState.activeEvents.map(function(e){
        var remain = e.endDay - gameState.currentDay;
        return '<span class="event-tag">' + e.icon + ' ' + e.name + '(' + remain + '天)</span>';
      }).join('');
    } else { eventEl.style.display = 'none'; }
  }
  var coeffEl = document.getElementById('marketCoeffDisplay');
  if (coeffEl) {
    var coeff = gameState.marketCoefficient;
    var rep = gameState.reputation || 50;
    var stage = gameState.companyStage || 1;
    coeffEl.textContent = '市场系数: ' + coeff.toFixed(2) + ' | 声誉: ' + rep + ' | 阶段: ' + stage;
    coeffEl.style.color = coeff > 1.0 ? '#4ade80' : coeff < 1.0 ? '#f87171' : 'rgba(255,255,255,0.6)';
  }
  var en = gameState.energy;
  var oilEl = document.getElementById('oilPriceDisplay');
  if (oilEl) {
    var oilTrend = en.oilPrice > en.prevOilPrice + 0.01 ? ' ⬆' : en.oilPrice < en.prevOilPrice - 0.01 ? ' ⬇' : '';
    oilEl.textContent = '⛽ ' + en.oilPrice.toFixed(2) + oilTrend;
    oilEl.style.color = en.oilPrice > en.prevOilPrice ? '#f87171' : en.oilPrice < en.prevOilPrice ? '#4ade80' : 'rgba(255,255,255,0.6)';
  }
  var elecEl = document.getElementById('elecPriceDisplay');
  if (elecEl) {
    var elecTrend = en.electricityPrice > en.prevElectricityPrice + 0.01 ? ' ⬆' : en.electricityPrice < en.prevElectricityPrice - 0.01 ? ' ⬇' : '';
    elecEl.textContent = '🔋 ' + en.electricityPrice.toFixed(2) + elecTrend;
    elecEl.style.color = en.electricityPrice > en.prevElectricityPrice ? '#f87171' : en.electricityPrice < en.prevElectricityPrice ? '#4ade80' : 'rgba(255,255,255,0.6)';
  }
  var oilStEl = document.getElementById('oilStorageDisplay');
  if (oilStEl) {
    var oilPct = Math.round(en.oilStorage / en.maxOilCapacity * 100);
    oilStEl.textContent = '⛽库存 ' + en.oilStorage + '/' + en.maxOilCapacity;
    oilStEl.style.color = oilPct > 50 ? '#4ade80' : oilPct > 20 ? '#fbbf24' : '#f87171';
  }
  var elecStEl = document.getElementById('elecStorageDisplay');
  if (elecStEl) {
    var batPct = Math.round(en.batteryStorage / en.maxBatteryCapacity * 100);
    elecStEl.textContent = '🔋库存 ' + en.batteryStorage + '/' + en.maxBatteryCapacity;
    elecStEl.style.color = batPct > 50 ? '#60a5fa' : batPct > 20 ? '#fbbf24' : '#f87171';
  }
}

function addMessage(text, type) {
  var time = 'D' + gameState.currentDay;
  gameState.messages.unshift({ time: time, text: text, type: type || 'normal' });
  if (gameState.messages.length > 100) gameState.messages.length = 100;
  renderMessages();
  saveGame();
}

function renderMessages() {
  var body = document.getElementById('messageBody');
  if (!body) return;
  body.innerHTML = '';
  gameState.messages.slice(0, 50).forEach(function(m){
    var div = document.createElement('div');
    div.className = 'msg-item';
    var cls = m.type === 'good' ? 'msg-highlight' : m.type === 'warn' ? 'msg-warn' : m.type === 'bad' ? 'msg-bad' : '';
    div.innerHTML = '<span class="msg-time">[' + m.time + ']</span> <span class="' + cls + '">' + m.text + '</span>';
    body.appendChild(div);
  });
}

function clearMessages() { gameState.messages = []; renderMessages(); saveGame(); }

function showToast(message, type) {
  var toast = document.getElementById('toast');
  toast.className = 'toast ' + (type || 'success');
  toast.innerHTML = (type === 'success' ? '✓ ' : type === 'error' ? '✕ ' : '⚠ ') + message;
  toast.classList.add('show');
  setTimeout(function(){ toast.classList.remove('show'); }, 3000);
}

function updateTableHeader(headers, sortable) {
  var thead = document.querySelector('#vehicleTable thead tr');
  if (!thead) return;
  var tableWrapper = document.querySelector('.vehicle-table-wrapper');
  var tableEl = document.getElementById('vehicleTable');
  if (sortable) {
    thead.innerHTML = headers.map(function(h){
      var arrow = '';
      if (myFleetSort.field === h.field) arrow = myFleetSort.asc ? ' ↑' : ' ↓';
      return '<th onclick="sortMyFleet(\'' + h.field + '\')">' + h.label + arrow + '</th>';
    }).join('');
    if (tableEl) tableEl.style.display = '';
  } else {
    thead.innerHTML = headers.map(function(h){ return '<th>' + h + '</th>'; }).join('');
  }
}

function openFleetModal() {
  document.getElementById('fleetModal').classList.add('active');
  updateVehicleCounts();
  switchTab(currentTab);
}
function closeFleetModal() { document.getElementById('fleetModal').classList.remove('active'); }

function updateVehicleCounts() {
  var el1 = document.getElementById('localCount'); if (el1) el1.textContent = getVehiclesByMarket(MARKET_TYPES.LOCAL_DEALER).length + '辆';
  var el2 = document.getElementById('usedCount'); if (el2) el2.textContent = gameState.usedCarMarketList.length + '辆';
  var el3 = document.getElementById('overseasCount'); if (el3) el3.textContent = getVehiclesByMarket(MARKET_TYPES.OVERSEAS).length + '辆';
  var el4 = document.getElementById('myFleetCount'); if (el4) el4.textContent = gameState.ownedVehicles.length + '辆';
  var el5 = document.getElementById('outletCount'); if (el5) el5.textContent = gameState.outlets.filter(function(o){ return o.owned; }).length + '个';
}

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.market-tab').forEach(function(t){ t.classList.toggle('active', t.dataset.tab === tab); });
  var infoBar = document.getElementById('marketInfoBar');
  var descEl = document.getElementById('marketDescription');
  var timeEl = document.getElementById('deliveryTime');
  var refreshBtn = document.getElementById('refreshUsedBtn');
  var marketSubTabs = document.getElementById('marketSubTabs');

  if (tab === 'myvehicles') {
    infoBar.style.display = 'none';
    if (marketSubTabs) marketSubTabs.style.display = 'none';
    updateTableHeader([
      {label:'车型',field:'name'},{label:'车牌',field:'name'},{label:'类型',field:'type'},
      {label:'网点',field:'outlet'},{label:'状态',field:'status'},{label:'日租金',field:'rate'},{label:'操作',field:'name'}
    ], true);
    renderMyFleet();
  } else if (tab === 'market') {
    infoBar.style.display = 'flex';
    if (marketSubTabs) marketSubTabs.style.display = 'flex';
    switchMarketSubTab(currentMarketSub || 'local');
  } else if (tab === 'status') {
    infoBar.style.display = 'none';
    if (marketSubTabs) marketSubTabs.style.display = 'none';
    updateTableHeader(['统计项','数值','','','','','']);
    renderVehicleStatus();
  } else if (tab === 'outlets') {
    infoBar.style.display = 'none';
    if (marketSubTabs) marketSubTabs.style.display = 'none';
    updateTableHeader(['网点名称','状态','等级','车位','今日订单','升级费用','操作']);
    renderOutlets();
  } else if (tab === 'pricing') {
    infoBar.style.display = 'none';
    if (marketSubTabs) marketSubTabs.style.display = 'none';
    updateTableHeader(['车型','数量','租金倍率','范围','生效','操作','']);
    renderPricing();
  }
}

var currentMarketSub = 'local';

function switchMarketSubTab(sub) {
  currentMarketSub = sub;
  document.querySelectorAll('.market-sub-tab').forEach(function(t){ t.classList.toggle('active', t.dataset.sub === sub); });
  var refreshBtn = document.getElementById('refreshUsedBtn');
  refreshBtn.style.display = sub === 'used' ? 'flex' : 'none';
  var market = getMarketInfo()[sub];
  if (market) {
    document.getElementById('marketDescription').innerHTML = market.icon + ' ' + market.description;
    document.getElementById('deliveryTime').textContent = '⏱️ ' + market.deliveryTime;
  }
  updateTableHeader(['车型信息','车牌','类型','保值率','采购价格','日租金','操作']);
  if (sub === 'local') renderMarketVehicles(getVehiclesByMarket(MARKET_TYPES.LOCAL_DEALER), 'local');
  else if (sub === 'used') renderUsedCarMarket();
  else if (sub === 'overseas') renderMarketVehicles(getVehiclesByMarket(MARKET_TYPES.OVERSEAS), 'overseas');
}

function renderMarketVehicles(vehicles, marketType) {
  var tbody = document.getElementById('vehicleTableBody');
  tbody.innerHTML = '';
  vehicles.forEach(function(v){
    var fuelInfo = getFuelTypeInfo(v.fuelType);
    var typeInfo = getVehicleTypeInfo(v.type);
    var residualInfo = getResidualValueInfo(v.residualValue);
    var canAfford = gameState.cash >= v.purchasePrice;
    var hasCapacity = gameState.outlets.filter(function(o){ return o.owned; }).some(function(o){ return getVehiclesAtOutlet(o.id).length < getOutletCapacity(o.id); });
    var row = document.createElement('tr');
    row.innerHTML =
      '<td><div class="vehicle-info"><span class="vehicle-name">' + v.brand + ' ' + v.model + '</span><span class="vehicle-brand">' + v.year + '款 · ' + v.fuelConsumption + (v.fuelType === FUEL_TYPES.ELECTRIC ? 'kWh' : 'L') + '/100km</span></div></td>' +
      '<td><span style="color:rgba(255,255,255,0.3);font-size:11px;">购买后生成</span></td>' +
      '<td><span class="tag tag-type">' + typeInfo.text + '</span> <span class="tag tag-fuel">' + fuelInfo.icon + ' ' + fuelInfo.text + '</span>' + (v.isExclusive ? ' <span class="tag tag-exclusive">⭐ 独家</span>' : '') + '</td>' +
      '<td><div class="residual-value"><div class="residual-bar"><div class="residual-fill" style="width:' + residualInfo.percentage + '%;background:' + residualInfo.color + ';"></div></div><span class="residual-text" style="color:' + residualInfo.color + ';">' + residualInfo.percentage + '% · ' + residualInfo.level + '</span></div></td>' +
      '<td><span class="price">' + formatCurrency(v.purchasePrice) + '</span></td>' +
      '<td><span class="daily-rate">' + formatCurrency(getEffectiveDailyRate(v)) + '/天</span></td>' +
      '<td>' + renderBuyButton(v.id, v.purchasePrice, marketType, canAfford, hasCapacity) + '</td>';
    tbody.appendChild(row);
  });
}

function renderBuyButton(vehicleId, price, marketType, canAfford, hasCapacity) {
  var ownedOutlets = gameState.outlets.filter(function(o){ return o.owned; });
  if (ownedOutlets.length === 0 || !canAfford || !hasCapacity) {
    return '<button class="action-btn btn-buy" disabled>' + (!canAfford ? '资金不足' : !hasCapacity ? '车位已满' : '无法购买') + '</button>';
  }
  var outletOptions = ownedOutlets.map(function(o){
    var cfg = OUTLET_CONFIGS[o.id];
    var count = getVehiclesAtOutlet(o.id).length;
    var cap = getOutletCapacity(o.id);
    return '<option value="' + o.id + '">' + cfg.name + ' (' + count + '/' + cap + ')</option>';
  }).join('');
  return '<div><select class="outlet-select" id="outletSelect_' + vehicleId + '">' + outletOptions + '</select><button class="action-btn btn-buy" onclick="buyVehicle(\'' + vehicleId + '\',\'' + marketType + '\')" style="margin-top:4px;">购买</button></div>';
}

function renderUsedCarMarket() {
  var tbody = document.getElementById('vehicleTableBody');
  if (gameState.usedCarMarketList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><div class="icon">🚗</div><div class="text">点击「刷新市场」浏览二手车</div></div></td></tr>';
    return;
  }
  tbody.innerHTML = '';
  gameState.usedCarMarketList.forEach(function(v){
    var fuelInfo = getFuelTypeInfo(v.fuelType);
    var typeInfo = getVehicleTypeInfo(v.type);
    var residualInfo = getResidualValueInfo(v.residualValue);
    var canAfford = gameState.cash >= v.estimatedValue;
    var hasCapacity = gameState.outlets.filter(function(o){ return o.owned; }).some(function(o){ return getVehiclesAtOutlet(o.id).length < getOutletCapacity(o.id); });
    var cc = 'condition-good';
    if (v.condition === CONDITION_LEVELS.EXCELLENT) cc = 'condition-excellent';
    else if (v.condition === CONDITION_LEVELS.AVERAGE) cc = 'condition-average';
    else if (v.condition === CONDITION_LEVELS.POOR) cc = 'condition-poor';
    var row = document.createElement('tr');
    row.innerHTML =
      '<td><div class="vehicle-info"><span class="vehicle-name">' + v.brand + ' ' + v.model + '</span><span class="vehicle-brand">' + v.year + '款 · ' + v.mileage.toLocaleString() + 'km · ' + v.age + '年车龄</span></div></td>' +
      '<td><span class="license-plate">' + v.licensePlate + '</span></td>' +
      '<td><span class="tag tag-type">' + typeInfo.text + '</span> <span class="tag tag-fuel">' + fuelInfo.icon + ' ' + fuelInfo.text + '</span> <span class="tag tag-used">二手</span> <span class="condition-tag ' + cc + '">' + v.condition + '</span></td>' +
      '<td><div class="residual-value"><div class="residual-bar"><div class="residual-fill" style="width:' + residualInfo.percentage + '%;background:' + residualInfo.color + ';"></div></div><span class="residual-text" style="color:' + residualInfo.color + ';">' + residualInfo.percentage + '% · ' + residualInfo.level + '</span></div></td>' +
      '<td><span class="price">' + formatCurrency(v.estimatedValue) + '</span></td>' +
      '<td><span class="daily-rate">' + formatCurrency(getEffectiveDailyRate(v)) + '/天</span></td>' +
      '<td>' + renderBuyButton(v.id, v.estimatedValue, 'used', canAfford, hasCapacity) + '</td>';
    tbody.appendChild(row);
  });
}

function refreshUsedCarMarket() {
  gameState.usedCarMarketList = generateUsedCarListing(20);
  updateVehicleCounts();
  switchMarketSubTab('used');
  addMessage('二手车市场已刷新，共 <span class="msg-highlight">20</span> 辆车', 'warn');
  saveGame();
}

function renderMyFleet() {
  var tbody = document.getElementById('vehicleTableBody');
  if (gameState.ownedVehicles.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><div class="icon">🚗</div><div class="text">暂无车辆，前往市场购买吧！</div></div></td></tr>';
    return;
  }
  var sorted = gameState.ownedVehicles.slice();
  sorted.sort(function(a, b) {
    var va, vb;
    switch (myFleetSort.field) {
      case 'name': va = a.brand + a.model; vb = b.brand + b.model; break;
      case 'type': va = a.type; vb = b.type; break;
      case 'rate': va = a.dailyRate; vb = b.dailyRate; break;
      case 'outlet': va = a.outletId; vb = b.outletId; break;
      case 'status':
        va = (a.rentedUntil && a.rentedUntil >= gameState.currentDay) ? 1 : isInTransit(a.id) ? 2 : 0;
        vb = (b.rentedUntil && b.rentedUntil >= gameState.currentDay) ? 1 : isInTransit(b.id) ? 2 : 0;
        break;
      default: va = a.brand + a.model; vb = b.brand + b.model;
    }
    if (va < vb) return myFleetSort.asc ? -1 : 1;
    if (va > vb) return myFleetSort.asc ? 1 : -1;
    return 0;
  });

  tbody.innerHTML = '';
  sorted.forEach(function(v){
    var fuelInfo = getFuelTypeInfo(v.fuelType);
    var typeInfo = getVehicleTypeInfo(v.type);
    var currentValue = calculateVehicleValue(v);
    var sellPrice = Math.round(currentValue * 0.85);
    var outletCfg = OUTLET_CONFIGS.find(function(c){ return c.id === v.outletId; });
    var inTransit = isInTransit(v.id);
    var transfer = gameState.transfers.find(function(t){ return t.vehicleId === v.id; });

    var statusHtml, outletLabel;
    if (inTransit) {
      statusHtml = '<span class="transit-badge">🚚 调度中(' + transfer.daysRemaining + '天)</span>';
      outletLabel = OUTLET_CONFIGS.find(function(c){ return c.id === transfer.fromOutletId; }).name + ' → ' + OUTLET_CONFIGS.find(function(c){ return c.id === transfer.toOutletId; }).name;
    } else if (v.rentedUntil && v.rentedUntil >= gameState.currentDay) {
      var remain = v.rentedUntil - gameState.currentDay + 1;
      statusHtml = '<span class="rented-badge">已租(' + remain + '天)</span>';
      outletLabel = outletCfg ? outletCfg.name : '未知';
    } else {
      statusHtml = '<span class="available-badge">可用</span>';
      outletLabel = outletCfg ? outletCfg.name : '未知';
    }

    var canDispatch = !inTransit && !(v.rentedUntil && v.rentedUntil >= gameState.currentDay) && gameState.outlets.filter(function(o){ return o.owned && o.id !== v.outletId; }).length > 0;

    var row = document.createElement('tr');
    row.innerHTML =
      '<td><div class="vehicle-info"><span class="vehicle-name">' + v.brand + ' ' + v.model + '</span><span class="vehicle-brand">' + v.year + '款 · ' + (v.isNew ? '新车' : v.mileage.toLocaleString() + 'km') + ' · 估值' + formatCurrency(currentValue) + '</span></div></td>' +
      '<td><span class="license-plate">' + v.licensePlate + '</span></td>' +
      '<td><span class="tag tag-type">' + typeInfo.text + '</span> <span class="tag tag-fuel">' + fuelInfo.icon + ' ' + fuelInfo.text + '</span>' + (!v.isNew && v.condition ? ' <span class="condition-tag condition-' + v.condition.charAt(0) + '">' + v.condition + '</span>' : '') + '</td>' +
      '<td><span style="font-size:11px;color:rgba(255,255,255,0.5);">' + outletLabel + '</span></td>' +
      '<td>' + statusHtml + '</td>' +
      '<td><span class="daily-rate">' + formatCurrency(getEffectiveDailyRate(v)) + '/天</span><br><span style="font-size:10px;color:rgba(255,255,255,0.3);">倍率 ' + getRateMultiplier(v.type).toFixed(1) + 'x</span></td>' +
      '<td><button class="action-btn btn-sell" onclick="sellVehicle(\'' + v.id + '\')" style="margin-bottom:4px;">出售 ' + formatCurrency(sellPrice) + '</button>' + (canDispatch ? '<button class="action-btn btn-dispatch" onclick="openDispatchModal(\'' + v.id + '\')">调度</button>' : '') + '</td>';
    tbody.appendChild(row);
  });
}

function sortMyFleet(field) {
  if (myFleetSort.field === field) myFleetSort.asc = !myFleetSort.asc;
  else { myFleetSort.field = field; myFleetSort.asc = true; }
  updateTableHeader([
    {label:'车型',field:'name'},{label:'车牌',field:'name'},{label:'类型',field:'type'},
    {label:'网点',field:'outlet'},{label:'状态',field:'status'},{label:'日租金',field:'rate'},{label:'操作',field:'name'}
  ], true);
  renderMyFleet();
}

function renderVehicleStatus() {
  var tbody = document.getElementById('vehicleTableBody');
  var total = gameState.ownedVehicles.length;
  var available = gameState.ownedVehicles.filter(function(v){ return (!v.rentedUntil || v.rentedUntil < gameState.currentDay) && !isInTransit(v.id); }).length;
  var rented = gameState.ownedVehicles.filter(function(v){ return v.rentedUntil && v.rentedUntil >= gameState.currentDay; }).length;
  var inTransit = gameState.ownedVehicles.filter(function(v){ return isInTransit(v.id); }).length;
  var avgRate = total > 0 ? Math.round(gameState.ownedVehicles.reduce(function(s,v){ return s + getEffectiveDailyRate(v); }, 0) / total) : 0;

  tbody.innerHTML = '';

  var statsRow = document.createElement('tr');
  statsRow.innerHTML = '<td colspan="7"><div class="status-grid">' +
    '<div class="status-card"><div class="status-label">总车队</div><div class="status-value" style="color:#60a5fa;">' + total + ' 辆</div></div>' +
    '<div class="status-card"><div class="status-label">可用</div><div class="status-value" style="color:#4ade80;">' + available + ' 辆</div></div>' +
    '<div class="status-card"><div class="status-label">已租出</div><div class="status-value" style="color:#fbbf24;">' + rented + ' 辆</div></div>' +
    '<div class="status-card"><div class="status-label">调度中</div><div class="status-value" style="color:#60a5fa;">' + inTransit + ' 辆</div></div>' +
    '<div class="status-card"><div class="status-label">平均日租金</div><div class="status-value" style="color:#a78bfa;">' + formatCurrency(avgRate) + '</div></div>' +
    '<div class="status-card"><div class="status-label">市场系数</div><div class="status-value" style="color:' + (gameState.marketCoefficient >= 1.0 ? '#4ade80' : '#f87171') + ';">' + gameState.marketCoefficient.toFixed(2) + '</div></div>' +
    '<div class="status-card"><div class="status-label">累计营收</div><div class="status-value" style="color:#4ade80;">' + formatCurrency(gameState.totalRevenue || 0) + '</div></div>' +
    '<div class="status-card"><div class="status-label">累计出租天数</div><div class="status-value" style="color:#fbbf24;">' + (gameState.totalDaysRented || 0) + ' 天</div></div>' +
    '</div></td>';
  tbody.appendChild(statsRow);

  var typeCounts = {};
  gameState.ownedVehicles.forEach(function(v){ typeCounts[v.type] = (typeCounts[v.type] || 0) + 1; });
  Object.keys(typeCounts).forEach(function(type){
    var count = typeCounts[type];
    var typeVehicles = gameState.ownedVehicles.filter(function(v){ return v.type === type; });
    var typeAvailable = typeVehicles.filter(function(v){ return (!v.rentedUntil || v.rentedUntil < gameState.currentDay) && !isInTransit(v.id); }).length;
    var typeRented = typeVehicles.filter(function(v){ return v.rentedUntil && v.rentedUntil >= gameState.currentDay; }).length;
    var typeAvgRate = typeVehicles.length > 0 ? Math.round(typeVehicles.reduce(function(s,v){ return s + getEffectiveDailyRate(v); }, 0) / typeVehicles.length) : 0;
    var row = document.createElement('tr');
    row.innerHTML =
      '<td><span class="tag tag-type">' + type + '</span></td>' +
      '<td>' + count + ' 辆</td>' +
      '<td>可用 ' + typeAvailable + ' / 已租 ' + typeRented + '</td>' +
      '<td>—</td><td>—</td>' +
      '<td>均价 ' + formatCurrency(typeAvgRate) + '/天</td>' +
      '<td><span style="font-size:10px;color:rgba(255,255,255,0.4);">倍率 ' + getRateMultiplier(type).toFixed(1) + 'x</span></td>';
    tbody.appendChild(row);
  });

  if (gameState.activeEvents.length > 0) {
    var eventRow = document.createElement('tr');
    eventRow.innerHTML = '<td colspan="7" style="padding:12px;"><div style="font-size:11px;color:#fbbf24;font-weight:600;margin-bottom:6px;">⚡ 当前活跃事件</div>' +
      gameState.activeEvents.map(function(e){
        var remain = e.endDay - gameState.currentDay;
        return '<div style="font-size:10px;color:rgba(255,255,255,0.6);padding:3px 0;">' + e.icon + ' ' + e.name + ' — ' + e.desc + '（剩余' + remain + '天）</div>';
      }).join('') + '</td>';
    tbody.appendChild(eventRow);
  }
}

function renderOutlets() {
  var tbody = document.getElementById('vehicleTableBody');
  tbody.innerHTML = '';
  OUTLET_CONFIGS.forEach(function(cfg){
    var os = getOutletState(cfg.id);
    var isOwned = os && os.owned;
    var lvl = isOwned ? OUTLET_LEVELS.find(function(l){ return l.level === os.level; }) : OUTLET_LEVELS[0];
    var cap = lvl ? lvl.capacity : 20;
    var vehCount = isOwned ? getVehiclesAtOutlet(cfg.id).length : 0;
    var nextLevel = isOwned ? OUTLET_LEVELS.find(function(l){ return l.level === os.level + 1; }) : null;
    var row = document.createElement('tr');
    row.innerHTML =
      '<td><div class="vehicle-info"><span class="vehicle-name">' + (isOwned ? '🏢' : '🔒') + ' ' + cfg.name + '</span><span class="vehicle-brand">' + cfg.cityLabel + '</span></div></td>' +
      '<td><span style="color:' + (isOwned ? '#4ade80' : 'rgba(255,255,255,0.3)') + ';">' + (isOwned ? '运营中' : '未解锁') + '</span></td>' +
      '<td>' + (isOwned ? 'Lv.' + os.level : '-') + '</td>' +
      '<td>' + (isOwned ? vehCount + ' / ' + cap : '-') + '</td>' +
      '<td>' + (isOwned ? (gameState.outletOrderCounts[cfg.id] || 0) + ' 单' : '-') + '</td>' +
      '<td>' + (nextLevel ? formatCurrency(nextLevel.upgradeCost) : (isOwned ? '已满级' : formatCurrency(cfg.unlockCost))) + '</td>' +
      '<td>' + (isOwned
        ? (nextLevel ? '<button class="action-btn btn-buy" onclick="upgradeOutlet(' + cfg.id + ')" ' + (gameState.cash < nextLevel.upgradeCost ? 'disabled' : '') + '>升级 Lv.' + nextLevel.level + '</button>' : '<span style="color:rgba(255,255,255,0.3);font-size:11px;">已满级</span>')
        : '<button class="action-btn btn-buy" onclick="unlockOutlet(' + cfg.id + ')" ' + (gameState.cash < cfg.unlockCost ? 'disabled' : '') + '>🔓 解锁</button>') + '</td>';
    tbody.appendChild(row);
  });
}

function renderPricing() {
  var tbody = document.getElementById('vehicleTableBody');
  tbody.innerHTML = '';
  var types = Object.values(VEHICLE_TYPES);
  var hasAny = false;
  types.forEach(function(type){
    var mult = getRateMultiplier(type);
    var count = gameState.ownedVehicles.filter(function(v){ return v.type === type; }).length;
    if (count === 0 && mult === 1.0) return;
    hasAny = true;
    var row = document.createElement('tr');
    row.innerHTML =
      '<td><span class="tag tag-type">' + type + '</span></td>' +
      '<td>' + count + ' 辆</td>' +
      '<td><div style="display:flex;align-items:center;gap:8px;"><input type="range" min="50" max="200" value="' + Math.round(mult * 100) + '" class="rate-slider" id="rateSlider_' + type + '" oninput="updateRateDisplay(\'' + type + '\',this.value)"><span id="rateDisplay_' + type + '" style="font-family:JetBrains Mono,monospace;font-size:14px;font-weight:700;color:#4ade80;min-width:40px;">' + mult.toFixed(1) + 'x</span></div></td>' +
      '<td><span style="font-size:10px;color:rgba(255,255,255,0.4);">0.5x ~ 2.0x</span></td>' +
      '<td><span style="font-size:10px;color:rgba(255,255,255,0.4);">次日生效</span></td>' +
      '<td><button class="action-btn btn-buy" onclick="confirmRateChange(\'' + type + '\')">确认调价</button></td>' +
      '<td></td>';
    tbody.appendChild(row);
  });
  if (!hasAny) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><div class="icon">💰</div><div class="text">购买车辆后可调整租金倍率</div></div></td></tr>';
  }
  var tipRow = document.createElement('tr');
  tipRow.innerHTML = '<td colspan="7" style="padding:12px;"><div style="padding:10px;background:rgba(255,255,255,0.04);border-radius:8px;font-size:10px;color:rgba(255,255,255,0.4);line-height:1.6;">💡 竞争对手每周调整市场系数（0.8~1.2），当前: <span style="color:' + (gameState.marketCoefficient >= 1.0 ? '#4ade80' : '#f87171') + ';">' + gameState.marketCoefficient.toFixed(2) + '</span>。合理定价可提高客户下单率。</div></td>';
  tbody.appendChild(tipRow);
}

function updateRateDisplay(type, value) {
  var display = document.getElementById('rateDisplay_' + type);
  if (display) display.textContent = (value / 100).toFixed(1) + 'x';
}

function confirmRateChange(type) {
  var slider = document.getElementById('rateSlider_' + type);
  if (!slider) return;
  var newMult = parseInt(slider.value) / 100;
  setRateMultiplier(type, newMult);
  addMessage('💰 ' + type + ' 租金倍率调整为 ' + newMult.toFixed(1) + 'x，次日生效', 'warn');
  showToast(type + ' 租金倍率已调整为 ' + newMult.toFixed(1) + 'x', 'success');
  saveGame();
}

function buyVehicle(vehicleId, marketType) {
  var vehicle, purchasePrice;
  if (marketType === 'used') {
    vehicle = gameState.usedCarMarketList.find(function(v){ return v.id === vehicleId; });
    if (!vehicle) return;
    purchasePrice = vehicle.estimatedValue;
  } else {
    vehicle = getVehicleById(vehicleId);
    if (!vehicle) return;
    purchasePrice = vehicle.purchasePrice;
  }
  var selectEl = document.getElementById('outletSelect_' + vehicleId);
  if (!selectEl) { showToast('请选择交付网点', 'error'); return; }
  var outletId = parseInt(selectEl.value);
  var outletState = getOutletState(outletId);
  if (!outletState || !outletState.owned) { showToast('无效网点', 'error'); return; }
  if (gameState.cash < purchasePrice) { showToast('资金不足！', 'error'); return; }
  var currentCount = getVehiclesAtOutlet(outletId).length;
  var capacity = getOutletCapacity(outletId);
  if (currentCount >= capacity) { showToast(OUTLET_CONFIGS.find(function(c){ return c.id === outletId; }).name + '车位已满！', 'error'); return; }

  gameState.cash -= purchasePrice;
  var plate = vehicle.isNew ? generateLicensePlate() : (vehicle.licensePlate || generateLicensePlate());
  var ownedVehicle = Object.assign({}, vehicle, { licensePlate: plate, outletId: outletId, purchasePrice: purchasePrice, purchaseDay: gameState.currentDay, rentedUntil: 0 });
  delete ownedVehicle.market;
  gameState.ownedVehicles.push(ownedVehicle);

  if (marketType === 'used') {
    gameState.usedCarMarketList = gameState.usedCarMarketList.filter(function(v){ return v.id !== vehicleId; });
  }

  addMessage('购入 ' + vehicle.brand + ' ' + vehicle.model + '（' + plate + '）→ ' + OUTLET_CONFIGS.find(function(c){ return c.id === outletId; }).name + '，花费 ' + formatCurrency(purchasePrice), 'good');
  if (gameState.tutorialStep < 2) { gameState.tutorialStep = 2; saveGame(); }
  updateUI(); updateVehicleCounts(); switchTab(currentTab);
  showToast('成功购买 ' + vehicle.brand + ' ' + vehicle.model + '！', 'success');
}

function sellVehicle(vehicleId) {
  var index = gameState.ownedVehicles.findIndex(function(v){ return v.id === vehicleId; });
  if (index === -1) return;
  var vehicle = gameState.ownedVehicles[index];
  if (isInTransit(vehicleId)) { showToast('车辆正在调度中，无法出售', 'error'); return; }
  if (vehicle.rentedUntil && vehicle.rentedUntil >= gameState.currentDay) { showToast('车辆已被租出，无法出售', 'error'); return; }
  var currentValue = calculateVehicleValue(vehicle);
  var sellPrice = Math.round(currentValue * 0.85);
  gameState.cash += sellPrice;
  gameState.ownedVehicles.splice(index, 1);
  gameState.pendingOrders = gameState.pendingOrders.filter(function(o){ return o.vehicleId !== vehicleId; });
  addMessage('出售 ' + vehicle.brand + ' ' + vehicle.model + '（' + vehicle.licensePlate + '），获得 ' + formatCurrency(sellPrice), 'warn');
  updateUI(); updateVehicleCounts(); switchTab('myvehicles');
  showToast('成功出售！+ ' + formatCurrency(sellPrice), 'success');
}

function openOrdersModal() { document.getElementById('ordersModal').classList.add('active'); renderOrders(); }
function closeOrdersModal() { document.getElementById('ordersModal').classList.remove('active'); }

function renderOrders() {
  var wrapper = document.getElementById('orderListWrapper');
  if (gameState.pendingOrders.length === 0) {
    wrapper.innerHTML = '<div class="empty-state"><div class="icon">📭</div><div class="text">暂无待处理订单</div></div>';
    return;
  }
  wrapper.innerHTML = '';
  gameState.pendingOrders.forEach(function(order){
    var typeIcon = order.customerType === 'business' ? '💼' : '🏖️';
    var typeClass = order.customerType === 'business' ? 'business' : 'tourist';
    var typeLabel = order.customerType === 'business' ? '商务客户' : '旅游客户';
    var netClass = order.netIncome >= 0 ? 'msg-highlight' : 'msg-bad';
    var card = document.createElement('div');
    card.className = 'order-card';
    card.innerHTML =
      '<div class="order-top"><div class="order-customer"><div class="order-avatar ' + typeClass + '">' + typeIcon + '</div><div class="order-customer-info"><span class="order-customer-name">' + order.customerName + '</span><span class="order-customer-type">' + typeLabel + ' · ' + order.outletName + '</span></div></div><span class="order-price">' + formatCurrency(order.totalIncome) + '</span></div>' +
      '<div class="order-details"><div class="order-detail-item"><div class="order-detail-label">租用车型</div><div class="order-detail-value">' + order.vehicleName + '</div></div><div class="order-detail-item"><div class="order-detail-label">租期</div><div class="order-detail-value">' + order.rentalDays + ' 天</div></div><div class="order-detail-item"><div class="order-detail-label">净利润</div><div class="order-detail-value ' + netClass + '">' + formatCurrency(order.netIncome) + '</div></div></div>' +
      '<div class="order-actions"><button class="action-btn btn-accept" onclick="acceptOrder(\'' + order.id + '\')">✓ 接单</button><button class="action-btn btn-reject" onclick="rejectOrder(\'' + order.id + '\')">✕ 拒绝</button></div>';
    wrapper.appendChild(card);
  });
}

function openDispatchModal(vehicleId) {
  var vehicle = gameState.ownedVehicles.find(function(v){ return v.id === vehicleId; });
  if (!vehicle) return;
  var currentOutlet = OUTLET_CONFIGS.find(function(c){ return c.id === vehicle.outletId; });
  var otherOutlets = gameState.outlets.filter(function(o){ return o.owned && o.id !== vehicle.outletId; });
  if (otherOutlets.length === 0) { showToast('没有其他可用网点', 'error'); return; }
  var content = document.getElementById('dispatchContent');
  var options = otherOutlets.map(function(o){
    var cfg = OUTLET_CONFIGS[o.id];
    var count = getVehiclesAtOutlet(o.id).length;
    var cap = getOutletCapacity(o.id);
    var dist = getDistanceBetweenOutlets(vehicle.outletId, o.id);
    var cost = Math.round(dist * 100);
    var days = Math.max(1, Math.ceil(dist / 25));
    return '<option value="' + o.id + '" data-cost="' + cost + '" data-days="' + days + '">' + cfg.name + ' (' + count + '/' + cap + ') · ' + formatCurrency(cost) + ' · ' + days + '天</option>';
  }).join('');
  content.innerHTML =
    '<div class="dispatch-info"><div class="dispatch-row"><span class="dispatch-label">车辆</span><span class="dispatch-value">' + vehicle.brand + ' ' + vehicle.model + '（' + vehicle.licensePlate + '）</span></div>' +
    '<div class="dispatch-row"><span class="dispatch-label">当前网点</span><span class="dispatch-value">' + currentOutlet.name + '</span></div></div>' +
    '<div class="dispatch-select-wrap"><label>目标网点</label><select class="dispatch-select" id="dispatchTarget" onchange="updateDispatchInfo(\'' + vehicleId + '\')">' + options + '</select></div>' +
    '<div class="dispatch-info" id="dispatchCostInfo"></div>' +
    '<div class="dispatch-actions"><button class="action-btn btn-confirm-dispatch" id="dispatchConfirmBtn" onclick="confirmDispatch(\'' + vehicleId + '\')">确认调度</button><button class="action-btn btn-cancel-dispatch" onclick="closeDispatchModal()">取消</button></div>';
  updateDispatchInfo(vehicleId);
  document.getElementById('dispatchModal').classList.add('active');
}

function updateDispatchInfo(vehicleId) {
  var select = document.getElementById('dispatchTarget');
  if (!select) return;
  var option = select.options[select.selectedIndex];
  var cost = parseInt(option.dataset.cost);
  var days = parseInt(option.dataset.days);
  var info = document.getElementById('dispatchCostInfo');
  info.innerHTML =
    '<div class="dispatch-row"><span class="dispatch-label">调度费用</span><span class="dispatch-value cost">' + formatCurrency(cost) + '</span></div>' +
    '<div class="dispatch-row"><span class="dispatch-label">运输时间</span><span class="dispatch-value time">' + days + ' 天</span></div>' +
    '<div class="dispatch-row"><span class="dispatch-label">车辆状态</span><span class="dispatch-value" style="color:#f87171;">调度期间无法出租</span></div>';
  var btn = document.getElementById('dispatchConfirmBtn');
  btn.disabled = gameState.cash < cost;
}

function confirmDispatch(vehicleId) {
  var vehicle = gameState.ownedVehicles.find(function(v){ return v.id === vehicleId; });
  if (!vehicle) return;
  var select = document.getElementById('dispatchTarget');
  var option = select.options[select.selectedIndex];
  var targetOutletId = parseInt(select.value);
  var cost = parseInt(option.dataset.cost);
  var days = parseInt(option.dataset.days);
  if (gameState.cash < cost) { showToast('资金不足！', 'error'); return; }
  var targetCap = getOutletCapacity(targetOutletId);
  var targetCount = getVehiclesAtOutlet(targetOutletId).length;
  if (targetCount >= targetCap) { showToast('目标网点车位已满！', 'error'); return; }
  gameState.cash -= cost;
  gameState.todayExpense += cost;
  gameState.transfers.push({ vehicleId: vehicleId, fromOutletId: vehicle.outletId, toOutletId: targetOutletId, daysRemaining: days, cost: cost });
  var targetName = OUTLET_CONFIGS.find(function(c){ return c.id === targetOutletId; }).name;
  addMessage('🚚 调度 ' + vehicle.brand + ' ' + vehicle.model + ' → ' + targetName + '，费用 ' + formatCurrency(cost) + '，预计 ' + days + ' 天到达', 'warn');
  closeDispatchModal();
  updateUI(); saveGame();
  if (currentTab === 'myvehicles') switchTab('myvehicles');
}

function closeDispatchModal() { document.getElementById('dispatchModal').classList.remove('active'); }

function showOutletPopup(outletId, px, py) {
  var popup = document.getElementById('outlet-popup');
  var cfg = OUTLET_CONFIGS.find(function(c){ return c.id === outletId; });
  var os = getOutletState(outletId);
  document.getElementById('popupName').textContent = cfg.name;
  document.getElementById('popupCity').textContent = cfg.cityLabel;
  if (os && os.owned) {
    var cap = getOutletCapacity(outletId);
    var vehs = getVehiclesAtOutlet(outletId);
    document.getElementById('popupCapacity').textContent = vehs.length + ' / ' + cap;
    document.getElementById('popupOrders').textContent = (gameState.outletOrderCounts[outletId] || 0) + ' 单';
    document.getElementById('popupLevel').textContent = 'Lv.' + os.level;
    var vList = document.getElementById('popupVehicles');
    if (vehs.length === 0) {
      vList.innerHTML = '<div style="font-size:12px;color:rgba(255,255,255,0.3);padding:8px 0;">暂无车辆</div>';
    } else {
      vList.innerHTML = vehs.map(function(v){
        var status = (v.rentedUntil && v.rentedUntil >= gameState.currentDay) ? ' 🔴已租' : '';
        return '<div class="popup-vehicle-item"><span>' + v.brand + ' ' + v.model + '</span><span>' + v.licensePlate + status + '</span></div>';
      }).join('');
    }
    var nextLevel = OUTLET_LEVELS.find(function(l){ return l.level === os.level + 1; });
    var actionsEl = document.getElementById('popupActions');
    if (nextLevel) {
      actionsEl.innerHTML = '<button class="popup-btn" style="background:linear-gradient(135deg,#ff6b35,#f7931e);color:#fff;" onclick="hideOutletPopup();enterInterior(' + outletId + ')">🏠 进入店铺</button><button class="popup-btn popup-btn-upgrade" onclick="upgradeOutlet(' + outletId + ')" ' + (gameState.cash < nextLevel.upgradeCost ? 'disabled' : '') + '>⬆ 升级</button><button class="popup-btn" style="background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;" onclick="openFacilityModal(' + outletId + ')">🏗️ 设施</button>';
    } else {
      actionsEl.innerHTML = '<button class="popup-btn" style="background:linear-gradient(135deg,#ff6b35,#f7931e);color:#fff;" onclick="hideOutletPopup();enterInterior(' + outletId + ')">🏠 进入店铺</button><button class="popup-btn popup-btn-upgrade" disabled>已满级</button><button class="popup-btn" style="background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;" onclick="openFacilityModal(' + outletId + ')">🏗️ 设施</button>';
    }
  } else {
    document.getElementById('popupCapacity').textContent = '-';
    document.getElementById('popupOrders').textContent = '-';
    document.getElementById('popupLevel').textContent = '未解锁';
    document.getElementById('popupVehicles').innerHTML = '';
    document.getElementById('popupActions').innerHTML = '<button class="popup-btn popup-btn-unlock" onclick="unlockOutlet(' + outletId + ')" ' + (gameState.cash < cfg.unlockCost ? 'disabled' : '') + '>🔓 解锁 (' + formatCurrency(cfg.unlockCost) + ')</button>';
  }
  popup.style.left = Math.min(px + 15, window.innerWidth - 360) + 'px';
  popup.style.top = Math.min(py - 20, window.innerHeight - 400) + 'px';
  popup.classList.add('active');
}

function hideOutletPopup() { document.getElementById('outlet-popup').classList.remove('active'); }

function showTutorial() {
  if (gameState.tutorialStep >= 7) return;
  var overlay = document.getElementById('tutorialOverlay');
  if (!overlay) return;
  overlay.classList.add('active');
  renderTutorialStep();
}

function renderTutorialStep() {
  var steps = [
    { title: '👋 欢迎！', text: '你拥有 $1,000,000 启动资金，开始经营你的租车帝国吧！', action: '开始' },
    { title: '🚗 第一步：购买车辆', text: '打开「车队管理」→「车辆市场」→「本地经销商」，选择一辆性价比高的车（推荐丰田凯美瑞或比亚迪秦PLUS），选择交付到总部网点。', action: '知道了' },
    { title: '🏢 第二步：扩展网点', text: '初始只有总部网点（容量20辆）。随着车队扩大，可以解锁更多网点（城东、城西等），每个网点独立运营。', action: '知道了' },
    { title: '⏭ 第三步：开始经营', text: '点击「下一日」推进时间，客户会自动到店。新订单需要你确认接受或拒绝。', action: '知道了' },
    { title: '💰 第四步：调整租金', text: '在「车队管理」→「调价管理」中，可以按车型调整租金倍率（0.5x~2.0x）。注意竞争对手每周调价！', action: '知道了' },
    { title: '⚡ 注意随机事件', text: '每天有20%概率触发随机事件（油价上涨、车展活动等），会影响成本和需求，持续3天。留意消息栏！', action: '知道了' },
    { title: '🚚 车辆调度', text: '在「我的车辆」中可以将车辆调度到不同网点，按距离收费和耗时。调度期间车辆无法出租。', action: '开始游戏！' }
  ];
  var step = Math.min(gameState.tutorialStep, steps.length - 1);
  var s = steps[step];
  document.getElementById('tutorialTitle').textContent = s.title;
  document.getElementById('tutorialText').textContent = s.text;
  document.getElementById('tutorialAction').textContent = s.action;
  document.getElementById('tutorialDots').innerHTML = steps.map(function(_, i){
    return '<span class="dot ' + (i === step ? 'active' : (i < step ? 'done' : '')) + '"></span>';
  }).join('');
  document.getElementById('tutorialStepNum').textContent = (step + 1) + ' / ' + steps.length;
}

function nextTutorialStep() {
  gameState.tutorialStep++;
  if (gameState.tutorialStep >= 7) {
    document.getElementById('tutorialOverlay').classList.remove('active');
    gameState.tutorialStep = 7;
  } else {
    renderTutorialStep();
  }
  saveGame();
}

function skipTutorial() {
  gameState.tutorialStep = 7;
  document.getElementById('tutorialOverlay').classList.remove('active');
  saveGame();
}

function openEnergyModal() {
  document.getElementById('energyModal').classList.add('active');
  renderEnergyModal();
}

function closeEnergyModal() {
  document.getElementById('energyModal').classList.remove('active');
}

function renderEnergyModal() {
  var en = gameState.energy;
  var oilPct = Math.round(en.oilStorage / en.maxOilCapacity * 100);
  var batPct = Math.round(en.batteryStorage / en.maxBatteryCapacity * 100);
  var oilTrend = en.oilPrice > en.prevOilPrice + 0.01 ? '<span style="color:#f87171;">⬆ 上涨</span>' : en.oilPrice < en.prevOilPrice - 0.01 ? '<span style="color:#4ade80;">⬇ 下跌</span>' : '<span style="color:rgba(255,255,255,0.4);">— 持平</span>';
  var elecTrend = en.electricityPrice > en.prevElectricityPrice + 0.01 ? '<span style="color:#f87171;">⬆ 上涨</span>' : en.electricityPrice < en.prevElectricityPrice - 0.01 ? '<span style="color:#4ade80;">⬇ 下跌</span>' : '<span style="color:rgba(255,255,255,0.4);">— 持平</span>';
  var oilBarColor = oilPct > 50 ? '#4ade80' : oilPct > 20 ? '#fbbf24' : '#f87171';
  var batBarColor = batPct > 50 ? '#60a5fa' : batPct > 20 ? '#fbbf24' : '#f87171';
  var sellOilPrice = Math.round(en.oilPrice * 0.8 * 100) / 100;
  var sellElecPrice = Math.round(en.electricityPrice * 0.8 * 100) / 100;

  var content = document.getElementById('energyContent');
  content.innerHTML =
    '<div class="energy-section">' +
      '<div class="energy-header"><span class="energy-icon">⛽</span><span class="energy-title">燃油储备</span></div>' +
      '<div class="energy-bar-wrap"><div class="energy-bar"><div class="energy-bar-fill" style="width:' + oilPct + '%;background:' + oilBarColor + ';"></div></div><span class="energy-bar-text">' + en.oilStorage + ' / ' + en.maxOilCapacity + ' 升</span></div>' +
      '<div class="energy-price-row"><span class="energy-label">当前油价</span><span class="energy-price">' + en.oilPrice.toFixed(2) + ' 元/升</span><span class="energy-trend">' + oilTrend + '</span></div>' +
      '<div class="energy-trade-row">' +
        '<div class="energy-trade"><label>购买燃油（升）</label><div class="energy-input-wrap"><input type="number" id="buyOilAmount" min="1" max="' + (en.maxOilCapacity - en.oilStorage) + '" value="100" class="energy-input"><button class="energy-trade-btn buy" onclick="buyOil()">购买</button></div><div class="energy-trade-info">花费: <span id="buyOilCost">' + formatCurrency(Math.round(100 * en.oilPrice)) + '</span> · 上限可购 ' + (en.maxOilCapacity - en.oilStorage) + ' 升</div></div>' +
        '<div class="energy-trade"><label>出售燃油（升）</label><div class="energy-input-wrap"><input type="number" id="sellOilAmount" min="1" max="' + en.oilStorage + '" value="100" class="energy-input"><button class="energy-trade-btn sell" onclick="sellOil()">出售</button></div><div class="energy-trade-info">回收: <span id="sellOilRevenue">' + formatCurrency(Math.round(100 * sellOilPrice)) + '</span> · 出售价 ' + sellOilPrice.toFixed(2) + ' 元/升</div></div>' +
      '</div>' +
    '</div>' +
    '<div class="energy-section">' +
      '<div class="energy-header"><span class="energy-icon">🔋</span><span class="energy-title">电力储备</span></div>' +
      '<div class="energy-bar-wrap"><div class="energy-bar"><div class="energy-bar-fill" style="width:' + batPct + '%;background:' + batBarColor + ';"></div></div><span class="energy-bar-text">' + en.batteryStorage + ' / ' + en.maxBatteryCapacity + ' 度</span></div>' +
      '<div class="energy-price-row"><span class="energy-label">当前电价</span><span class="energy-price">' + en.electricityPrice.toFixed(2) + ' 元/度</span><span class="energy-trend">' + elecTrend + '</span></div>' +
      '<div class="energy-trade-row">' +
        '<div class="energy-trade"><label>购买电力（度）</label><div class="energy-input-wrap"><input type="number" id="buyElecAmount" min="1" max="' + (en.maxBatteryCapacity - en.batteryStorage) + '" value="100" class="energy-input"><button class="energy-trade-btn buy" onclick="buyElec()">购买</button></div><div class="energy-trade-info">花费: <span id="buyElecCost">' + formatCurrency(Math.round(100 * en.electricityPrice)) + '</span> · 上限可购 ' + (en.maxBatteryCapacity - en.batteryStorage) + ' 度</div></div>' +
        '<div class="energy-trade"><label>出售电力（度）</label><div class="energy-input-wrap"><input type="number" id="sellElecAmount" min="1" max="' + en.batteryStorage + '" value="100" class="energy-input"><button class="energy-trade-btn sell" onclick="sellElec()">出售</button></div><div class="energy-trade-info">回收: <span id="sellElecRevenue">' + formatCurrency(Math.round(100 * sellElecPrice)) + '</span> · 出售价 ' + sellElecPrice.toFixed(2) + ' 元/度</div></div>' +
      '</div>' +
    '</div>' +
    '<div class="energy-section">' +
      '<div class="energy-header"><span class="energy-icon">⬆</span><span class="energy-title">容量升级</span></div>' +
      '<div class="energy-trade-row">' +
        '<div class="energy-trade"><label>油罐容量: ' + en.maxOilCapacity + ' 升</label><button class="energy-trade-btn buy" onclick="upgradeEnergyCapacity(\'oil\')"' + (en.maxOilCapacity >= ENERGY_MAX_CAPACITY ? ' disabled' : '') + '>升级 (+' + ENERGY_UPGRADE_AMOUNT + '升, ' + formatCurrency(ENERGY_UPGRADE_COST) + ')</button></div>' +
        '<div class="energy-trade"><label>电池容量: ' + en.maxBatteryCapacity + ' 度</label><button class="energy-trade-btn buy" onclick="upgradeEnergyCapacity(\'battery\')"' + (en.maxBatteryCapacity >= ENERGY_MAX_CAPACITY ? ' disabled' : '') + '>升级 (+' + ENERGY_UPGRADE_AMOUNT + '度, ' + formatCurrency(ENERGY_UPGRADE_COST) + ')</button></div>' +
      '</div>' +
    '</div>' +
    '<div class="energy-section">' +
      '<div class="energy-header"><span class="energy-icon">📈</span><span class="energy-title">价格走势（近7期）</span></div>' +
      '<canvas id="priceChartCanvas" width="560" height="200" style="width:100%;max-width:560px;height:200px;margin-top:8px;"></canvas>' +
    '</div>';

  var buyOilInput = document.getElementById('buyOilAmount');
  if (buyOilInput) buyOilInput.addEventListener('input', function(){ updateEnergyTradeCost('buyOil', en.oilPrice); });
  var sellOilInput = document.getElementById('sellOilAmount');
  if (sellOilInput) sellOilInput.addEventListener('input', function(){ updateEnergyTradeCost('sellOil', sellOilPrice); });
  var buyElecInput = document.getElementById('buyElecAmount');
  if (buyElecInput) buyElecInput.addEventListener('input', function(){ updateEnergyTradeCost('buyElec', en.electricityPrice); });
  var sellElecInput = document.getElementById('sellElecAmount');
  if (sellElecInput) sellElecInput.addEventListener('input', function(){ updateEnergyTradeCost('sellElec', sellElecPrice); });
  drawPriceChart();
}

function updateEnergyTradeCost(prefix, unitPrice) {
  var input = document.getElementById(prefix + 'Amount');
  if (!input) return;
  var amount = parseInt(input.value) || 0;
  var cost = Math.round(amount * unitPrice);
  var elId = prefix === 'buyOil' ? 'buyOilCost' : prefix === 'sellOil' ? 'sellOilRevenue' : prefix === 'buyElec' ? 'buyElecCost' : 'sellElecRevenue';
  var el = document.getElementById(elId);
  if (el) el.textContent = formatCurrency(cost);
}

function drawPriceChart() {
  var canvas = document.getElementById('priceChartCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var w = canvas.width;
  var h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  ctx.fillRect(0, 0, w, h);
  var ph = gameState.priceHistory || { oil: [], electricity: [] };
  var oilData = ph.oil.slice(-7);
  var elecData = ph.electricity.slice(-7);
  if (oilData.length === 0 && elecData.length === 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('暂无历史价格数据', w / 2, h / 2);
    return;
  }
  var padL = 50, padR = 20, padT = 20, padB = 30;
  var chartW = w - padL - padR;
  var chartH = h - padT - padB;
  var allVals = oilData.concat(elecData);
  var minV = Math.floor(Math.min.apply(null, allVals) * 0.9 * 10) / 10;
  var maxV = Math.ceil(Math.max.apply(null, allVals) * 1.1 * 10) / 10;
  if (minV === maxV) { minV -= 1; maxV += 1; }
  var maxLen = Math.max(oilData.length, elecData.length);
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  for (var i = 0; i <= 4; i++) {
    var y = padT + chartH * i / 4;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + chartW, y); ctx.stroke();
    var val = maxV - (maxV - minV) * i / 4;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(val.toFixed(1), padL - 6, y + 3);
  }
  function drawLine(data, color) {
    if (data.length < 2) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var j = 0; j < data.length; j++) {
      var x = padL + (j / (maxLen - 1)) * chartW;
      var yy = padT + (1 - (data[j] - minV) / (maxV - minV)) * chartH;
      if (j === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
    }
    ctx.stroke();
    for (var j = 0; j < data.length; j++) {
      var x = padL + (j / (maxLen - 1)) * chartW;
      var yy = padT + (1 - (data[j] - minV) / (maxV - minV)) * chartH;
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(x, yy, 3, 0, Math.PI * 2); ctx.fill();
    }
  }
  drawLine(oilData, '#f97316');
  drawLine(elecData, '#3b82f6');
  ctx.fillStyle = '#f97316';
  ctx.fillRect(padL + 10, h - 16, 12, 3);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('油价', padL + 26, h - 12);
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(padL + 60, h - 16, 12, 3);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText('电价', padL + 76, h - 12);
}

function buyOil() {
  var amount = parseInt(document.getElementById('buyOilAmount').value) || 0;
  var en = gameState.energy;
  if (amount <= 0) { showToast('请输入有效数量', 'error'); return; }
  if (amount > en.maxOilCapacity - en.oilStorage) { showToast('超出油罐容量上限！', 'error'); return; }
  var cost = Math.round(amount * en.oilPrice);
  if (gameState.cash < cost) { showToast('资金不足！', 'error'); return; }
  gameState.cash -= cost;
  gameState.todayExpense += cost;
  en.oilStorage += amount;
  addMessage('⛽ 购入燃油 ' + amount + ' 升，花费 ' + formatCurrency(cost), 'warn');
  updateUI(); renderEnergyModal(); saveGame();
  showToast('成功购入 ' + amount + ' 升燃油', 'success');
}

function sellOil() {
  var amount = parseInt(document.getElementById('sellOilAmount').value) || 0;
  var en = gameState.energy;
  if (amount <= 0) { showToast('请输入有效数量', 'error'); return; }
  if (amount > en.oilStorage) { showToast('库存不足！', 'error'); return; }
  var revenue = Math.round(amount * en.oilPrice * 0.8);
  gameState.cash += revenue;
  gameState.todayIncome += revenue;
  en.oilStorage -= amount;
  addMessage('⛽ 出售燃油 ' + amount + ' 升，获得 ' + formatCurrency(revenue), 'good');
  updateUI(); renderEnergyModal(); saveGame();
  showToast('成功出售 ' + amount + ' 升燃油', 'success');
}

function buyElec() {
  var amount = parseInt(document.getElementById('buyElecAmount').value) || 0;
  var en = gameState.energy;
  if (amount <= 0) { showToast('请输入有效数量', 'error'); return; }
  if (amount > en.maxBatteryCapacity - en.batteryStorage) { showToast('超出电池容量上限！', 'error'); return; }
  var cost = Math.round(amount * en.electricityPrice);
  if (gameState.cash < cost) { showToast('资金不足！', 'error'); return; }
  gameState.cash -= cost;
  gameState.todayExpense += cost;
  en.batteryStorage += amount;
  addMessage('🔋 购入电力 ' + amount + ' 度，花费 ' + formatCurrency(cost), 'warn');
  updateUI(); renderEnergyModal(); saveGame();
  showToast('成功购入 ' + amount + ' 度电力', 'success');
}

function sellElec() {
  var amount = parseInt(document.getElementById('sellElecAmount').value) || 0;
  var en = gameState.energy;
  if (amount <= 0) { showToast('请输入有效数量', 'error'); return; }
  if (amount > en.batteryStorage) { showToast('库存不足！', 'error'); return; }
  var revenue = Math.round(amount * en.electricityPrice * 0.8);
  gameState.cash += revenue;
  gameState.todayIncome += revenue;
  en.batteryStorage -= amount;
  addMessage('🔋 出售电力 ' + amount + ' 度，获得 ' + formatCurrency(revenue), 'good');
  updateUI(); renderEnergyModal(); saveGame();
  showToast('成功出售 ' + amount + ' 度电力', 'success');
}

var memberSortField = 'level';
var memberSortAsc = false;
var memberPage = 1;
var MEMBER_PAGE_SIZE = 20;

function openMemberModal() {
  document.getElementById('memberModal').classList.add('active');
  memberPage = 1;
  renderMemberModal();
}

function closeMemberModal() {
  document.getElementById('memberModal').classList.remove('active');
}

function renderMemberModal() {
  var members = gameState.members || [];
  var content = document.getElementById('memberContent');
  var total = members.length;
  var active = members.filter(function(m){ return m.isActive; }).length;
  var dist = getMemberLevelDistribution();
  var distHtml = MEMBER_LEVELS.map(function(l){
    return '<span style="color:' + l.color + ';font-weight:600;">' + l.name + ':' + (dist[l.level] || 0) + '</span>';
  }).join(' &nbsp; ');

  var sorted = members.slice();
  sorted.sort(function(a, b){
    var va, vb;
    switch(memberSortField) {
      case 'level': va = a.level; vb = b.level; break;
      case 'trips': va = a.totalTrips; vb = b.totalTrips; break;
      case 'spent': va = a.totalSpent; vb = b.totalSpent; break;
      default: va = a.level; vb = b.level;
    }
    if (va < vb) return memberSortAsc ? -1 : 1;
    if (va > vb) return memberSortAsc ? 1 : -1;
    return 0;
  });

  var totalPages = Math.max(1, Math.ceil(sorted.length / MEMBER_PAGE_SIZE));
  if (memberPage > totalPages) memberPage = totalPages;
  var start = (memberPage - 1) * MEMBER_PAGE_SIZE;
  var pageMembers = sorted.slice(start, start + MEMBER_PAGE_SIZE);

  var sortArrow = function(field) {
    if (memberSortField !== field) return '';
    return memberSortAsc ? ' ↑' : ' ↓';
  };

  var html = '<div class="member-summary" style="display:flex;gap:16px;margin-bottom:12px;flex-wrap:wrap;">' +
    '<div style="padding:8px 14px;background:rgba(255,255,255,0.04);border-radius:8px;"><span style="color:rgba(255,255,255,0.5);">总会员</span> <span style="color:#60a5fa;font-weight:700;">' + total + '</span></div>' +
    '<div style="padding:8px 14px;background:rgba(255,255,255,0.04);border-radius:8px;"><span style="color:rgba(255,255,255,0.5);">活跃</span> <span style="color:#4ade80;font-weight:700;">' + active + '</span></div>' +
    '<div style="padding:8px 14px;background:rgba(255,255,255,0.04);border-radius:8px;font-size:11px;line-height:1.6;">' + distHtml + '</div></div>';

  html += '<table style="width:100%;border-collapse:collapse;font-size:11px;">' +
    '<thead><tr style="border-bottom:1px solid rgba(255,255,255,0.1);">' +
    '<th style="text-align:left;padding:6px 8px;color:rgba(255,255,255,0.5);cursor:pointer;" onclick="sortMembers(\'level\')">等级' + sortArrow('level') + '</th>' +
    '<th style="text-align:left;padding:6px 8px;color:rgba(255,255,255,0.5);">姓名</th>' +
    '<th style="text-align:left;padding:6px 8px;color:rgba(255,255,255,0.5);">卡号</th>' +
    '<th style="text-align:right;padding:6px 8px;color:rgba(255,255,255,0.5);cursor:pointer;" onclick="sortMembers(\'trips\')">总出行' + sortArrow('trips') + '</th>' +
    '<th style="text-align:right;padding:6px 8px;color:rgba(255,255,255,0.5);cursor:pointer;" onclick="sortMembers(\'spent\')">总消费' + sortArrow('spent') + '</th>' +
    '<th style="text-align:left;padding:6px 8px;color:rgba(255,255,255,0.5);">手机</th>' +
    '<th style="text-align:left;padding:6px 8px;color:rgba(255,255,255,0.5);">注册日期</th>' +
    '</tr></thead><tbody>';

  pageMembers.forEach(function(m){
    var lv = getMemberLevelInfo(m.level);
    html += '<tr style="border-bottom:1px solid rgba(255,255,255,0.04);">' +
      '<td style="padding:6px 8px;"><span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;background:' + lv.color + '22;color:' + lv.color + ';">' + lv.name + '</span></td>' +
      '<td style="padding:6px 8px;color:rgba(255,255,255,0.8);">' + m.name + '</td>' +
      '<td style="padding:6px 8px;color:rgba(255,255,255,0.4);font-family:JetBrains Mono,monospace;font-size:10px;">' + m.id + '</td>' +
      '<td style="padding:6px 8px;text-align:right;color:rgba(255,255,255,0.7);">' + m.totalTrips + '</td>' +
      '<td style="padding:6px 8px;text-align:right;color:#4ade80;">' + formatCurrency(m.totalSpent) + '</td>' +
      '<td style="padding:6px 8px;color:rgba(255,255,255,0.4);font-size:10px;">' + m.phone + '</td>' +
      '<td style="padding:6px 8px;color:rgba(255,255,255,0.4);font-size:10px;">D' + m.registerDay + '</td>' +
      '</tr>';
  });

  html += '</tbody></table>';

  if (totalPages > 1) {
    html += '<div style="display:flex;justify-content:center;align-items:center;gap:8px;margin-top:12px;">';
    html += '<button class="action-btn" style="padding:4px 12px;font-size:11px;" onclick="memberPage=1;renderMemberModal();"' + (memberPage <= 1 ? ' disabled' : '') + '>首页</button>';
    html += '<button class="action-btn" style="padding:4px 12px;font-size:11px;" onclick="memberPage--;renderMemberModal();"' + (memberPage <= 1 ? ' disabled' : '') + '>上一页</button>';
    html += '<span style="color:rgba(255,255,255,0.5);font-size:11px;">' + memberPage + ' / ' + totalPages + '</span>';
    html += '<button class="action-btn" style="padding:4px 12px;font-size:11px;" onclick="memberPage++;renderMemberModal();"' + (memberPage >= totalPages ? ' disabled' : '') + '>下一页</button>';
    html += '<button class="action-btn" style="padding:4px 12px;font-size:11px;" onclick="memberPage=' + totalPages + ';renderMemberModal();"' + (memberPage >= totalPages ? ' disabled' : '') + '>末页</button>';
    html += '</div>';
  }

  content.innerHTML = html;
}

function sortMembers(field) {
  if (memberSortField === field) memberSortAsc = !memberSortAsc;
  else { memberSortField = field; memberSortAsc = false; }
  renderMemberModal();
}

function openServiceStatsModal() {
  document.getElementById('serviceStatsModal').classList.add('active');
  renderServiceStats();
}

function closeServiceStatsModal() {
  document.getElementById('serviceStatsModal').classList.remove('active');
}

function openServicePricingModal() {
  document.getElementById('servicePricingModal').classList.add('active');
  renderServicePricingModal();
}

function closeServicePricingModal() {
  document.getElementById('servicePricingModal').classList.remove('active');
}

function renderServicePricingModal() {
  var sp = gameState.servicePricing || { insurance:50, wifi:20, gps:15, delivery:80, refuelMargin:1.0, rechargeMargin:1.0 };
  var content = document.getElementById('servicePricingContent');
  var fixedServices = [
    { key:'insurance', name:'基础保险', icon:'🛡️', unit:'元/天', min:10, max:200 },
    { key:'wifi', name:'WiFi热点', icon:'📶', unit:'元/天', min:5, max:100 },
    { key:'gps', name:'GPS导航', icon:'🧭', unit:'元/天', min:5, max:100 },
    { key:'delivery', name:'送车上门', icon:'🚗', unit:'元/次', min:20, max:300 }
  ];
  var marginServices = [
    { key:'refuelMargin', name:'加油服务加价', icon:'⛽', unit:'倍', min:0.5, max:3.0, step:0.1 },
    { key:'rechargeMargin', name:'充电服务加价', icon:'🔋', unit:'倍', min:0.5, max:3.0, step:0.1 }
  ];

  var html = '<div style="margin-bottom:16px;">' +
    '<div style="font-size:13px;font-weight:600;color:rgba(255,255,255,0.7);margin-bottom:10px;">固定价格服务</div>';
  fixedServices.forEach(function(s){
    var currentVal = sp[s.key];
    var prob = getEffectiveServiceProbability(s.key);
    html += '<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);">' +
      '<span style="font-size:16px;">' + s.icon + '</span>' +
      '<span style="min-width:80px;color:rgba(255,255,255,0.7);font-size:12px;">' + s.name + '</span>' +
      '<input type="number" id="sp_' + s.key + '" min="' + s.min + '" max="' + s.max + '" value="' + currentVal + '" style="width:70px;padding:4px 8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#fff;font-size:12px;text-align:right;" oninput="updateServicePricingProb()">' +
      '<span style="color:rgba(255,255,255,0.4);font-size:11px;">' + s.unit + '</span>' +
      '<span style="color:rgba(255,255,255,0.3);font-size:10px;margin-left:auto;">生效概率: <span class="sp-prob" data-key="' + s.key + '" style="color:#4ade80;font-weight:600;">' + Math.round(prob * 100) + '%</span></span>' +
      '</div>';
  });
  html += '</div>';

  html += '<div style="margin-bottom:16px;">' +
    '<div style="font-size:13px;font-weight:600;color:rgba(255,255,255,0.7);margin-bottom:10px;">能源加价倍率</div>';
  marginServices.forEach(function(s){
    var currentVal = sp[s.key];
    html += '<div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);">' +
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:4px;">' +
      '<span style="font-size:16px;">' + s.icon + '</span>' +
      '<span style="min-width:80px;color:rgba(255,255,255,0.7);font-size:12px;">' + s.name + '</span>' +
      '<input type="range" id="sp_' + s.key + '" min="' + s.min + '" max="' + s.max + '" step="' + s.step + '" value="' + currentVal + '" style="flex:1;" oninput="document.getElementById(\'sp_' + s.key + '_val\').textContent=parseFloat(this.value).toFixed(1)+\'x\';updateServicePricingProb()">' +
      '<span id="sp_' + s.key + '_val" style="min-width:40px;text-align:right;color:#4ade80;font-weight:700;font-size:13px;">' + currentVal.toFixed(1) + 'x</span>' +
      '</div></div>';
  });
  html += '</div>';

  html += '<div style="text-align:right;"><button class="action-btn btn-buy" onclick="confirmServicePricing()">确认保存</button></div>';
  content.innerHTML = html;
}

function updateServicePricingProb() {
  var fixedKeys = ['insurance', 'wifi', 'gps', 'delivery'];
  fixedKeys.forEach(function(key){
    var el = document.querySelector('.sp-prob[data-key="' + key + '"]');
    if (!el) return;
    var input = document.getElementById('sp_' + key);
    if (!input) return;
    var tempPrice = parseFloat(input.value) || SERVICE_PRICES[key];
    var sp = gameState.servicePricing || { insurance:50, wifi:20, gps:15, delivery:80, refuelMargin:1.0, rechargeMargin:1.0 };
    var savedPrice = sp[key];
    sp[key] = tempPrice;
    var prob = getEffectiveServiceProbability(key);
    sp[key] = savedPrice;
    el.textContent = Math.round(prob * 100) + '%';
    el.style.color = prob >= SERVICE_PROBABILITIES[key] ? '#4ade80' : '#f87171';
  });
}

function confirmServicePricing() {
  var keys = ['insurance', 'wifi', 'gps', 'delivery', 'refuelMargin', 'rechargeMargin'];
  keys.forEach(function(key){
    var input = document.getElementById('sp_' + key);
    if (!input) return;
    var val = key === 'refuelMargin' || key === 'rechargeMargin' ? parseFloat(input.value) : parseInt(input.value);
    if (!isNaN(val)) setServicePrice(key, val);
  });
  showToast('服务定价已保存', 'success');
  addMessage('📋 增值服务定价已更新', 'warn');
  renderServicePricingModal();
}

function renderServiceStats() {
  var today = gameState.serviceStats.today;
  var total = gameState.serviceStats.total;
  var content = document.getElementById('serviceStatsContent');
  var sp = gameState.servicePricing || { insurance:50, wifi:20, gps:15, delivery:80, refuelMargin:1.0, rechargeMargin:1.0 };
  var services = [
    { key:'insurance', name:'基础保险', icon:'🛡️', unitPrice: sp.insurance + '元/天' },
    { key:'wifi', name:'WiFi热点', icon:'📶', unitPrice: sp.wifi + '元/天' },
    { key:'gps', name:'GPS导航', icon:'🧭', unitPrice: sp.gps + '元/天' },
    { key:'delivery', name:'送车上门', icon:'🚗', unitPrice: sp.delivery + '元/次' },
    { key:'refuel', name:'加油服务', icon:'⛽', unitPrice: '油价×' + SERVICE_PRICES.refuelLiters + '升×' + sp.refuelMargin.toFixed(1) + '倍' },
    { key:'recharge', name:'充电服务', icon:'🔋', unitPrice: '电价×' + SERVICE_PRICES.rechargeKwh + '度×' + sp.rechargeMargin.toFixed(1) + '倍' }
  ];

  var html = '<div class="service-stats-section"><div class="service-stats-title">📊 今日增值服务</div>' +
    '<div class="service-stats-grid">';
  services.forEach(function(s){
    html += '<div class="service-stat-card"><div class="service-stat-icon">' + s.icon + '</div><div class="service-stat-name">' + s.name + '</div>' +
      '<div class="service-stat-count">' + (today[s.key] || 0) + ' 次</div><div class="service-stat-price">' + s.unitPrice + '</div></div>';
  });
  html += '<div class="service-stat-card total"><div class="service-stat-icon">💰</div><div class="service-stat-name">今日服务总收入</div>' +
    '<div class="service-stat-count" style="color:#4ade80;">' + formatCurrency(today.totalIncome || 0) + '</div><div class="service-stat-price"></div></div>';
  html += '</div></div>';

  html += '<div class="service-stats-section"><div class="service-stats-title">📈 累计增值服务</div>' +
    '<div class="service-stats-grid">';
  services.forEach(function(s){
    html += '<div class="service-stat-card"><div class="service-stat-icon">' + s.icon + '</div><div class="service-stat-name">' + s.name + '</div>' +
      '<div class="service-stat-count">' + (total[s.key] || 0) + ' 次</div><div class="service-stat-price">' + s.unitPrice + '</div></div>';
  });
  html += '<div class="service-stat-card total"><div class="service-stat-icon">💰</div><div class="service-stat-name">累计服务总收入</div>' +
    '<div class="service-stat-count" style="color:#4ade80;">' + formatCurrency(total.totalIncome || 0) + '</div><div class="service-stat-price"></div></div>';
  html += '</div></div>';

  html += '<div class="service-prob-section"><div class="service-stats-title">🎲 服务触发概率</div><div class="service-prob-grid">';
  services.forEach(function(s){
    var prob = Math.round((typeof getEffectiveServiceProbability === 'function' ? getEffectiveServiceProbability(s.key) : SERVICE_PROBABILITIES[s.key]) * 100);
    html += '<div class="service-prob-item"><span>' + s.icon + ' ' + s.name + '</span><span style="color:#4ade80;font-weight:600;">' + prob + '%</span></div>';
  });
  html += '</div></div>';

  content.innerHTML = html;
}
var orderSortField = 'day';
var orderSortAsc = false;
var orderPage = 1;
var ORDER_PAGE_SIZE = 15;

function openOrderHistoryModal() {
  document.getElementById('orderHistoryModal').classList.add('active');
  orderPage = 1;
  renderOrderHistory();
}
function closeOrderHistoryModal() {
  document.getElementById('orderHistoryModal').classList.remove('active');
}
function sortOrders(field) {
  if (orderSortField === field) orderSortAsc = !orderSortAsc;
  else { orderSortField = field; orderSortAsc = false; }
  renderOrderHistory();
}
function renderOrderHistory() {
  var orders = gameState.orderHistory || [];
  var content = document.getElementById('orderHistoryContent');
  var sorted = orders.slice();
  sorted.sort(function(a,b){
    var va,vb;
    switch(orderSortField) {
      case 'day': va=a.acceptedDay||a.createdDay; vb=b.acceptedDay||b.createdDay; break;
      case 'income': va=a.actualIncome||a.totalIncome; vb=b.actualIncome||b.totalIncome; break;
      case 'days': va=a.rentalDays; vb=b.rentalDays; break;
      case 'vehicle': va=a.vehicleName; vb=b.vehicleName; break;
      default: va=a.acceptedDay||a.createdDay; vb=b.acceptedDay||b.createdDay;
    }
    if (va < vb) return orderSortAsc ? -1 : 1;
    if (va > vb) return orderSortAsc ? 1 : -1;
    return 0;
  });
  var totalPages = Math.max(1, Math.ceil(sorted.length / ORDER_PAGE_SIZE));
  if (orderPage > totalPages) orderPage = totalPages;
  var start = (orderPage - 1) * ORDER_PAGE_SIZE;
  var pageOrders = sorted.slice(start, start + ORDER_PAGE_SIZE);
  var sa = function(f){ return orderSortField===f ? (orderSortAsc?' ↑':' ↓') : ''; };
  var html = '<div style="margin-bottom:10px;font-size:12px;color:rgba(255,255,255,0.5);">共 '+orders.length+' 条历史订单</div>';
  html += '<table style="width:100%;border-collapse:collapse;font-size:11px;"><thead><tr style="border-bottom:1px solid rgba(255,255,255,0.1);">';
  html += '<th style="text-align:left;padding:6px 8px;color:rgba(255,255,255,0.5);cursor:pointer;" onclick="sortOrders(\'day\')">日期'+sa('day')+'</th>';
  html += '<th style="text-align:left;padding:6px 8px;color:rgba(255,255,255,0.5);">客户</th>';
  html += '<th style="text-align:left;padding:6px 8px;color:rgba(255,255,255,0.5);cursor:pointer;" onclick="sortOrders(\'vehicle\')">车型'+sa('vehicle')+'</th>';
  html += '<th style="text-align:right;padding:6px 8px;color:rgba(255,255,255,0.5);cursor:pointer;" onclick="sortOrders(\'days\')">天数'+sa('days')+'</th>';
  html += '<th style="text-align:right;padding:6px 8px;color:rgba(255,255,255,0.5);cursor:pointer;" onclick="sortOrders(\'income\')">收入'+sa('income')+'</th>';
  html += '<th style="text-align:left;padding:6px 8px;color:rgba(255,255,255,0.5);">增值服务</th>';
  html += '<th style="text-align:left;padding:6px 8px;color:rgba(255,255,255,0.5);">网点</th>';
  html += '</tr></thead><tbody>';
  pageOrders.forEach(function(o){
    var svc = (o.services && o.services.length > 0) ? o.services.join(', ') : '—';
    html += '<tr style="border-bottom:1px solid rgba(255,255,255,0.04);">';
    html += '<td style="padding:6px 8px;color:rgba(255,255,255,0.5);">D'+(o.acceptedDay||o.createdDay)+'</td>';
    html += '<td style="padding:6px 8px;color:rgba(255,255,255,0.7);">'+o.customerName+'</td>';
    html += '<td style="padding:6px 8px;color:rgba(255,255,255,0.7);">'+o.vehicleName+'</td>';
    html += '<td style="padding:6px 8px;text-align:right;color:rgba(255,255,255,0.7);">'+o.rentalDays+'</td>';
    html += '<td style="padding:6px 8px;text-align:right;color:#4ade80;">'+formatCurrency(o.actualIncome||o.totalIncome)+'</td>';
    html += '<td style="padding:6px 8px;color:rgba(255,255,255,0.5);font-size:10px;">'+svc+'</td>';
    html += '<td style="padding:6px 8px;color:rgba(255,255,255,0.5);">'+o.outletName+'</td>';
    html += '</tr>';
  });
  html += '</tbody></table>';
  if (totalPages > 1) {
    html += '<div style="display:flex;justify-content:center;align-items:center;gap:8px;margin-top:12px;">';
    html += '<button class="action-btn" style="padding:4px 12px;font-size:11px;" onclick="orderPage=1;renderOrderHistory();"'+(orderPage<=1?' disabled':'')+'>首页</button>';
    html += '<button class="action-btn" style="padding:4px 12px;font-size:11px;" onclick="orderPage--;renderOrderHistory();"'+(orderPage<=1?' disabled':'')+'>上一页</button>';
    html += '<span style="color:rgba(255,255,255,0.5);font-size:11px;">'+orderPage+' / '+totalPages+'</span>';
    html += '<button class="action-btn" style="padding:4px 12px;font-size:11px;" onclick="orderPage++;renderOrderHistory();"'+(orderPage>=totalPages?' disabled':'')+'>下一页</button>';
    html += '<button class="action-btn" style="padding:4px 12px;font-size:11px;" onclick="orderPage='+totalPages+';renderOrderHistory();"'+(orderPage>=totalPages?' disabled':'')+'>末页</button>';
    html += '</div>';
  }
  content.innerHTML = html;
}
function openEmployeeModal() {
  document.getElementById('employeeModal').classList.add('active');
  renderEmployeeModal();
}
function closeEmployeeModal() {
  document.getElementById('employeeModal').classList.remove('active');
}
function renderEmployeeModal() {
  var emps = gameState.employees || [];
  var content = document.getElementById('employeeContent');
  var totalSalary = emps.reduce(function(s,e){ return s + e.salary * 8; }, 0);
  var striking = emps.filter(function(e){ return e.onStrike; }).length;
  var html = '<div style="display:flex;gap:12px;margin-bottom:14px;flex-wrap:wrap;">';
  html += '<div style="padding:8px 14px;background:rgba(255,255,255,0.04);border-radius:8px;"><span style="color:rgba(255,255,255,0.5);">员工总数</span> <span style="color:#60a5fa;font-weight:700;">'+emps.length+'</span></div>';
  html += '<div style="padding:8px 14px;background:rgba(255,255,255,0.04);border-radius:8px;"><span style="color:rgba(255,255,255,0.5);">日工资总额</span> <span style="color:#fbbf24;font-weight:700;">'+formatCurrency(totalSalary)+'</span></div>';
  html += '<div style="padding:8px 14px;background:rgba(255,255,255,0.04);border-radius:8px;"><span style="color:rgba(255,255,255,0.5);">罢工</span> <span style="color:#f87171;font-weight:700;">'+striking+'</span></div>';
  html += '<div style="padding:8px 14px;background:rgba(255,255,255,0.04);border-radius:8px;"><button class="action-btn btn-buy" style="padding:4px 10px;font-size:10px;" onclick="openTalentMarket()">👔 人才市场</button></div>';
  html += '<div style="padding:8px 14px;background:rgba(255,255,255,0.04);border-radius:8px;"><button class="action-btn" style="padding:4px 10px;font-size:10px;background:linear-gradient(135deg,#e67e22,#f39c12);color:#fff;" onclick="doTeamBuilding()"'+(gameState.currentDay - (gameState.lastTeamBuildingDay||0) < 7?' disabled':'')+'>🎉 团建($5000)</button></div>';
  html += '</div>';
  if (emps.length === 0) {
    html += '<div class="empty-state"><div class="icon">👔</div><div class="text">暂无员工，前往人才市场招聘</div></div>';
  } else {
    html += '<table style="width:100%;border-collapse:collapse;font-size:11px;"><thead><tr style="border-bottom:1px solid rgba(255,255,255,0.1);">';
    html += '<th style="text-align:left;padding:6px 8px;color:rgba(255,255,255,0.5);">姓名</th>';
    html += '<th style="text-align:left;padding:6px 8px;color:rgba(255,255,255,0.5);">角色</th>';
    html += '<th style="text-align:left;padding:6px 8px;color:rgba(255,255,255,0.5);">网点</th>';
    html += '<th style="text-align:right;padding:6px 8px;color:rgba(255,255,255,0.5);">时薪</th>';
    html += '<th style="text-align:center;padding:6px 8px;color:rgba(255,255,255,0.5);">士气</th>';
    html += '<th style="text-align:center;padding:6px 8px;color:rgba(255,255,255,0.5);">技能</th>';
    html += '<th style="text-align:center;padding:6px 8px;color:rgba(255,255,255,0.5);">操作</th>';
    html += '</tr></thead><tbody>';
    emps.forEach(function(e){
      var moraleColor = e.morale > 80 ? '#4ade80' : e.morale > 30 ? '#fbbf24' : '#f87171';
      var strikeTag = e.onStrike ? ' <span style="color:#f87171;font-weight:700;">⚠罢工</span>' : '';
      var outletName = OUTLET_CONFIGS.find(function(c){ return c.id === e.outletId; });
      html += '<tr style="border-bottom:1px solid rgba(255,255,255,0.04);">';
      html += '<td style="padding:6px 8px;color:rgba(255,255,255,0.8);">'+e.name+strikeTag+'</td>';
      html += '<td style="padding:6px 8px;"><span style="padding:2px 6px;border-radius:4px;font-size:10px;background:rgba(52,152,219,0.15);color:#3498db;">'+e.type+'</span></td>';
      html += '<td style="padding:6px 8px;color:rgba(255,255,255,0.5);">'+(outletName?outletName.name:'—')+'</td>';
      html += '<td style="padding:6px 8px;text-align:right;color:rgba(255,255,255,0.7);">$'+e.salary+'/h</td>';
      html += '<td style="padding:6px 8px;text-align:center;color:'+moraleColor+';">'+e.morale+'</td>';
      html += '<td style="padding:6px 8px;text-align:center;color:rgba(255,255,255,0.7);">'+e.skillLevel+'</td>';
      html += '<td style="padding:6px 8px;text-align:center;"><button class="action-btn" style="padding:2px 6px;font-size:9px;background:linear-gradient(135deg,#3498db,#2980b9);color:#fff;margin:1px;" onclick="trainEmployee(\''+e.id+'\')">培训$3K</button><button class="action-btn" style="padding:2px 6px;font-size:9px;background:linear-gradient(135deg,#27ae60,#2ecc71);color:#fff;margin:1px;" onclick="raiseSalary(\''+e.id+'\')">加薪</button><button class="action-btn" style="padding:2px 6px;font-size:9px;background:rgba(231,76,60,0.2);color:#e74c3c;border:1px solid #e74c3c;margin:1px;" onclick="fireEmployee(\''+e.id+'\');renderEmployeeModal();">解雇</button></td>';
      html += '</tr>';
    });
    html += '</tbody></table>';
  }
  content.innerHTML = html;
}
function openTalentMarket() {
  document.getElementById('talentModal').classList.add('active');
  renderTalentMarket();
}
function closeTalentMarket() {
  document.getElementById('talentModal').classList.remove('active');
}
function renderTalentMarket() {
  var candidates = gameState.jobCandidates || [];
  var content = document.getElementById('talentContent');
  if (candidates.length === 0) {
    content.innerHTML = '<div class="empty-state"><div class="icon">👔</div><div class="text">暂无候选人，每周刷新5名</div></div>';
    return;
  }
  var html = '<table style="width:100%;border-collapse:collapse;font-size:11px;"><thead><tr style="border-bottom:1px solid rgba(255,255,255,0.1);">';
  html += '<th style="text-align:left;padding:6px 8px;color:rgba(255,255,255,0.5);">姓名</th>';
  html += '<th style="text-align:left;padding:6px 8px;color:rgba(255,255,255,0.5);">角色</th>';
  html += '<th style="text-align:right;padding:6px 8px;color:rgba(255,255,255,0.5);">期望时薪</th>';
  html += '<th style="text-align:center;padding:6px 8px;color:rgba(255,255,255,0.5);">士气</th>';
  html += '<th style="text-align:center;padding:6px 8px;color:rgba(255,255,255,0.5);">技能</th>';
  html += '<th style="text-align:center;padding:6px 8px;color:rgba(255,255,255,0.5);">录用到</th>';
  html += '</tr></thead><tbody>';
  candidates.forEach(function(c,i){
    var moraleColor = c.morale > 80 ? '#4ade80' : c.morale > 30 ? '#fbbf24' : '#f87171';
    var ownedOutlets = gameState.outlets.filter(function(o){ return o.owned; });
    var opts = ownedOutlets.map(function(o){ return '<option value="'+o.id+'">'+OUTLET_CONFIGS.find(function(c){return c.id===o.id;}).name+'</option>'; }).join('');
    html += '<tr style="border-bottom:1px solid rgba(255,255,255,0.04);">';
    html += '<td style="padding:6px 8px;color:rgba(255,255,255,0.8);">'+c.name+'</td>';
    html += '<td style="padding:6px 8px;"><span style="padding:2px 6px;border-radius:4px;font-size:10px;background:rgba(52,152,219,0.15);color:#3498db;">'+c.type+'</span></td>';
    html += '<td style="padding:6px 8px;text-align:right;color:rgba(255,255,255,0.7);">$'+c.salary+'/h</td>';
    html += '<td style="padding:6px 8px;text-align:center;color:'+moraleColor+';">'+c.morale+'</td>';
    html += '<td style="padding:6px 8px;text-align:center;color:rgba(255,255,255,0.7);">'+c.skillLevel+'</td>';
    html += '<td style="padding:6px 8px;text-align:center;"><select id="talentOutlet_'+i+'" style="padding:4px 6px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:4px;color:#fff;font-size:10px;min-height:30px;">'+opts+'</select><button class="action-btn btn-buy" style="padding:2px 8px;font-size:9px;margin-left:4px;" onclick="hireCandidate('+i+')">录用$2K</button></td>';
    html += '</tr>';
  });
  html += '</tbody></table>';
  content.innerHTML = html;
}
function hireCandidate(index) {
  var candidates = gameState.jobCandidates;
  if (!candidates || !candidates[index]) return;
  var c = candidates[index];
  var selectEl = document.getElementById('talentOutlet_'+index);
  if (!selectEl) { showToast('请选择网点','error'); return; }
  var outletId = parseInt(selectEl.value);
  if (gameState.cash < 2000) { showToast('资金不足！','error'); return; }
  gameState.cash -= 2000;
  hireEmployee(c, outletId);
  candidates.splice(index, 1);
  addMessage('👔 录用 '+c.name+'（'+c.type+'）→ '+OUTLET_CONFIGS.find(function(cfg){return cfg.id===outletId;}).name, 'good');
  showToast('成功录用 '+c.name, 'success');
  updateUI(); saveGame();
  renderTalentMarket();
}
function doTeamBuilding() {
  if (gameState.currentDay - (gameState.lastTeamBuildingDay||0) < 7) { showToast('团建冷却中（7天一次）','error'); return; }
  if (gameState.cash < 5000) { showToast('资金不足！','error'); return; }
  teamBuildingActivity();
  showToast('团建活动完成，全员士气+10','success');
  updateUI(); saveGame();
  renderEmployeeModal();
}
var financeTab = 'pnl';
function openFinanceModal() {
  document.getElementById('financeModal').classList.add('active');
  financeTab = 'pnl';
  renderFinanceModal();
}
function closeFinanceModal() {
  document.getElementById('financeModal').classList.remove('active');
}
function switchFinanceTab(tab) {
  financeTab = tab;
  renderFinanceModal();
}
function renderFinanceModal() {
  var content = document.getElementById('financeContent');
  var tabs = '<div style="display:flex;gap:6px;margin-bottom:14px;">';
  var tabDefs = [{key:'pnl',label:'📊 损益表'},{key:'balance',label:'📋 资产负债'},{key:'cashflow',label:'💸 现金流'},{key:'loans',label:'🏦 贷款'},{key:'stocks',label:'📈 股票'}];
  tabDefs.forEach(function(t){
    tabs += '<button style="padding:8px 14px;border:none;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;min-height:36px;'+(financeTab===t.key?'background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;':'background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.6);border:1px solid rgba(255,255,255,0.1);')+'" onclick="switchFinanceTab(\''+t.key+'\')">'+t.label+'</button>';
  });
  tabs += '</div>';
  var body = '';
  if (financeTab === 'pnl') body = renderPnL();
  else if (financeTab === 'balance') body = renderBalanceSheet();
  else if (financeTab === 'cashflow') body = renderCashFlow();
  else if (financeTab === 'loans') body = renderLoans();
  else if (financeTab === 'stocks') body = renderStocks();
  content.innerHTML = tabs + body;
}
function renderPnL() {
  var today = getPnL('today');
  var month = getPnL('month');
  var total = getPnL('total');
  var html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">';
  [{label:'今日',data:today},{label:'本月(30天)',data:month},{label:'累计',data:total}].forEach(function(p){
    html += '<div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:14px;">';
    html += '<div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:8px;">'+p.label+'</div>';
    html += '<div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:4px;">收入: <span style="color:#4ade80;">'+formatCurrency(p.data.revenue)+'</span></div>';
    html += '<div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:4px;">支出: <span style="color:#f87171;">'+formatCurrency(p.data.expenses)+'</span></div>';
    html += '<div style="font-size:11px;color:rgba(255,255,255,0.5);">净利润: <span style="color:'+(p.data.netProfit>=0?'#4ade80':'#f87171')+';font-weight:700;">'+formatCurrency(p.data.netProfit)+'</span></div>';
    html += '</div>';
  });
  html += '</div>';
  if (typeof gameState.financials !== 'undefined' && gameState.financials.dailyProfit.length > 0) {
    html += '<div style="margin-top:14px;"><div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:8px;">利润走势(近30天)</div>';
    html += '<canvas id="profitChartCanvas" width="560" height="160" style="width:100%;max-width:560px;height:160px;"></canvas></div>';
    setTimeout(drawProfitChart, 50);
  }
  return html;
}
function renderBalanceSheet() {
  var bs = getBalanceSheet();
  var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">';
  html += '<div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:14px;">';
  html += '<div style="font-size:12px;font-weight:700;color:#4ade80;margin-bottom:8px;">资产</div>';
  html += '<div style="font-size:11px;color:rgba(255,255,255,0.6);margin-bottom:3px;">现金: '+formatCurrency(bs.assets.cash)+'</div>';
  html += '<div style="font-size:11px;color:rgba(255,255,255,0.6);margin-bottom:3px;">车辆净值: '+formatCurrency(bs.assets.vehicles)+'</div>';
  html += '<div style="font-size:11px;color:rgba(255,255,255,0.6);margin-bottom:3px;">能源库存: '+formatCurrency(bs.assets.energy)+'</div>';
  html += '<div style="font-size:11px;color:rgba(255,255,255,0.6);">股票持仓: '+formatCurrency(bs.assets.stocks)+'</div>';
  html += '<div style="font-size:13px;font-weight:700;color:#fff;margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.1);">总资产: '+formatCurrency(bs.assets.total)+'</div></div>';
  html += '<div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:14px;">';
  html += '<div style="font-size:12px;font-weight:700;color:#f87171;margin-bottom:8px;">负债</div>';
  html += '<div style="font-size:11px;color:rgba(255,255,255,0.6);">贷款: '+formatCurrency(bs.liabilities.loans)+'</div>';
  html += '<div style="font-size:13px;font-weight:700;color:#fff;margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.1);">总负债: '+formatCurrency(bs.liabilities.total)+'</div>';
  html += '<div style="font-size:12px;font-weight:700;color:#60a5fa;margin-top:12px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.1);">所有者权益: '+formatCurrency(bs.equity)+'</div></div>';
  html += '</div>';
  return html;
}
function renderCashFlow() {
  var cf = getCashFlow();
  var html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">';
  [{label:'经营活动',data:cf.operating,color:'#4ade80'},{label:'投资活动',data:cf.investing,color:'#60a5fa'},{label:'筹资活动',data:cf.financing,color:'#fbbf24'}].forEach(function(p){
    html += '<div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:14px;">';
    html += '<div style="font-size:12px;font-weight:700;color:'+p.color+';margin-bottom:8px;">'+p.label+'</div>';
    html += '<div style="font-size:14px;font-weight:700;color:'+(p.data>=0?'#4ade80':'#f87171')+';">'+formatCurrency(p.data)+'</div>';
    html += '</div>';
  });
  html += '</div>';
  return html;
}
function renderLoans() {
  var loans = gameState.loans || [];
  var bs = getBalanceSheet();
  var maxLoan = Math.round(bs.assets.total * 0.5);
  var existingDebt = loans.reduce(function(s,l){ return s + l.remainingAmount; }, 0);
  var available = Math.max(0, maxLoan - existingDebt);
  var html = '<div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:14px;margin-bottom:14px;">';
  html += '<div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:8px;">🏦 申请贷款</div>';
  html += '<div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:6px;">可贷额度: '+formatCurrency(available)+' (总资产50% - 已贷)</div>';
  html += '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">';
  html += '<input type="number" id="loanAmount" min="10000" step="10000" value="100000" style="width:120px;padding:6px 10px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:6px;color:#fff;font-size:12px;min-height:36px;">';
  html += '<select id="loanTerm" style="padding:6px 10px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:6px;color:#fff;font-size:12px;min-height:36px;"><option value="30">30天(8%)</option><option value="90">90天(11%)</option><option value="180">180天(15%)</option></select>';
  html += '<button class="action-btn btn-buy" onclick="doApplyLoan()">申请贷款</button></div></div>';
  if (loans.length === 0) {
    html += '<div class="empty-state"><div class="icon">🏦</div><div class="text">暂无贷款</div></div>';
  } else {
    html += '<table style="width:100%;border-collapse:collapse;font-size:11px;"><thead><tr style="border-bottom:1px solid rgba(255,255,255,0.1);">';
    html += '<th style="text-align:left;padding:6px 8px;color:rgba(255,255,255,0.5);">贷款ID</th>';
    html += '<th style="text-align:right;padding:6px 8px;color:rgba(255,255,255,0.5);">剩余金额</th>';
    html += '<th style="text-align:right;padding:6px 8px;color:rgba(255,255,255,0.5);">日利息</th>';
    html += '<th style="text-align:center;padding:6px 8px;color:rgba(255,255,255,0.5);">到期日</th>';
    html += '<th style="text-align:center;padding:6px 8px;color:rgba(255,255,255,0.5);">操作</th>';
    html += '</tr></thead><tbody>';
    loans.forEach(function(l){
      var overdue = gameState.currentDay > l.dueDay;
      html += '<tr style="border-bottom:1px solid rgba(255,255,255,0.04);'+(overdue?'background:rgba(231,76,60,0.1);':'')+'">';
      html += '<td style="padding:6px 8px;color:rgba(255,255,255,0.7);">'+l.id+(overdue?' <span style="color:#f87171;">⚠逾期</span>':'')+'</td>';
      html += '<td style="padding:6px 8px;text-align:right;color:#fbbf24;">'+formatCurrency(Math.round(l.remainingAmount))+'</td>';
      html += '<td style="padding:6px 8px;text-align:right;color:rgba(255,255,255,0.5);">'+formatCurrency(Math.round(l.dailyInterest))+'</td>';
      html += '<td style="padding:6px 8px;text-align:center;color:rgba(255,255,255,0.5);">D'+l.dueDay+'</td>';
      html += '<td style="padding:6px 8px;text-align:center;"><button class="action-btn btn-buy" style="padding:2px 8px;font-size:9px;" onclick="doRepayLoan(\''+l.id+'\')">还款</button></td>';
      html += '</tr>';
    });
    html += '</tbody></table>';
  }
  return html;
}
function renderStocks() {
  var st = gameState.stocks || {};
  var html = '';
  if (!st.isPublic) {
    html += '<div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:16px;margin-bottom:14px;">';
    html += '<div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:8px;">🏢 IPO上市</div>';
    html += '<div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:6px;">上市条件：现金 > $50M 且 累计营收 > $5M</div>';
    var eligible = typeof checkIPOEligibility === 'function' && checkIPOEligibility();
    html += '<div style="font-size:11px;color:'+(eligible?'#4ade80':'#f87171')+';">当前状态：'+(eligible?'✓ 满足条件':'✕ 不满足条件')+'</div>';
    if (eligible) {
      html += '<div style="margin-top:8px;display:flex;gap:8px;align-items:center;">';
      html += '<span style="font-size:11px;color:rgba(255,255,255,0.5);">发行价:</span>';
      html += '<input type="number" id="ipoPrice" min="10" max="500" value="50" style="width:80px;padding:6px 10px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:6px;color:#fff;font-size:12px;min-height:36px;">';
      html += '<button class="action-btn btn-buy" onclick="doIPO()">执行IPO</button></div>';
    }
    html += '</div>';
  } else {
    html += '<div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:14px;margin-bottom:14px;">';
    html += '<div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:8px;">📈 RENT 股票</div>';
    html += '<div style="font-size:11px;color:rgba(255,255,255,0.6);">当前股价: <span style="color:#4ade80;font-weight:700;">$'+(st.sharePrice||0).toFixed(2)+'</span> · 持有: '+st.playerShares+'股(锁定) · 流通: '+st.publicShares+'股</div>';
    html += '</div>';
  }
  html += '<div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:14px;">';
  html += '<div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:8px;">📊 虚拟股票市场</div>';
  var vStocks = typeof VIRTUAL_STOCKS !== 'undefined' ? VIRTUAL_STOCKS : [];
  vStocks.forEach(function(vs){
    var price = (st.virtualPrices && st.virtualPrices[vs.ticker]) || vs.basePrice;
    html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04);">';
    html += '<div><span style="color:#fff;font-weight:600;">'+vs.ticker+'</span> <span style="color:rgba(255,255,255,0.5);font-size:10px;">'+vs.name+'</span></div>';
    html += '<div style="display:flex;gap:6px;align-items:center;">';
    html += '<span style="color:#4ade80;font-weight:700;">$'+price.toFixed(2)+'</span>';
    html += '<input type="number" id="stockQty_'+vs.ticker+'" min="1" value="10" style="width:60px;padding:4px 6px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:4px;color:#fff;font-size:10px;min-height:30px;">';
    html += '<button class="action-btn" style="padding:2px 6px;font-size:9px;background:linear-gradient(135deg,#27ae60,#2ecc71);color:#fff;" onclick="doBuyStock(\''+vs.ticker+'\')">买</button>';
    html += '<button class="action-btn" style="padding:2px 6px;font-size:9px;background:rgba(231,76,60,0.2);color:#e74c3c;border:1px solid #e74c3c;" onclick="doSellStock(\''+vs.ticker+'\')">卖</button>';
    html += '</div></div>';
  });
  html += '</div>';
  var portfolio = st.portfolio || [];
  if (portfolio.length > 0) {
    html += '<div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:14px;margin-top:10px;">';
    html += '<div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:8px;">💼 我的持仓</div>';
    portfolio.forEach(function(p){
      var curPrice = (st.virtualPrices && st.virtualPrices[p.ticker]) || 0;
      var val = Math.round(p.shares * curPrice);
      html += '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:11px;color:rgba(255,255,255,0.6);">';
      html += '<span>'+p.ticker+' × '+p.shares+'</span><span style="color:#4ade80;">'+formatCurrency(val)+'</span></div>';
    });
    html += '</div>';
  }
  return html;
}
function drawProfitChart() {
  var canvas = document.getElementById('profitChartCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var w = canvas.width; var h = canvas.height;
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  ctx.fillRect(0,0,w,h);
  var data = (gameState.financials && gameState.financials.dailyProfit) ? gameState.financials.dailyProfit.slice(-30) : [];
  if (data.length < 2) { ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='12px sans-serif'; ctx.textAlign='center'; ctx.fillText('数据不足',w/2,h/2); return; }
  var padL=50,padR=20,padT=20,padB=20;
  var cW=w-padL-padR; var cH=h-padT-padB;
  var maxV=Math.max.apply(null,data.map(Math.abs)); if(maxV===0)maxV=1;
  var scale=cH/(maxV*2.5);
  var zeroY=padT+cH/2;
  ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(padL,zeroY); ctx.lineTo(padL+cW,zeroY); ctx.stroke();
  ctx.strokeStyle='rgba(74,222,128,0.8)'; ctx.lineWidth=2;
  ctx.beginPath();
  for(var i=0;i<data.length;i++){
    var x=padL+(i/(data.length-1))*cW;
    var yy=zeroY-data[i]*scale;
    if(i===0)ctx.moveTo(x,yy);else ctx.lineTo(x,yy);
  }
  ctx.stroke();
}
function doApplyLoan() {
  var amount=parseInt(document.getElementById('loanAmount').value)||0;
  var term=parseInt(document.getElementById('loanTerm').value)||30;
  if(amount<10000){showToast('最低贷款$10,000','error');return;}
  if(typeof applyLoan==='function')applyLoan(amount,term);
  showToast('贷款申请成功','success');
  updateUI();saveGame();renderFinanceModal();
}
function doRepayLoan(loanId) {
  if(typeof repayLoan==='function')repayLoan(loanId,Infinity);
  showToast('贷款已还清','success');
  updateUI();saveGame();renderFinanceModal();
}
function doIPO() {
  var price=parseFloat(document.getElementById('ipoPrice').value)||50;
  if(typeof executeIPO==='function')executeIPO(price);
  showToast('IPO成功！RENT已上市','success');
  addMessage('🎉 公司成功上市！股票代码 RENT，发行价 $'+price.toFixed(2),'good');
  updateUI();saveGame();renderFinanceModal();
}
function doBuyStock(ticker) {
  var qty=parseInt(document.getElementById('stockQty_'+ticker).value)||0;
  if(qty<=0){showToast('请输入数量','error');return;}
  if(typeof buyStock==='function')buyStock(ticker,qty);
  showToast('买入成功','success');
  updateUI();saveGame();renderFinanceModal();
}
function doSellStock(ticker) {
  var qty=parseInt(document.getElementById('stockQty_'+ticker).value)||0;
  if(qty<=0){showToast('请输入数量','error');return;}
  if(typeof sellStock==='function')sellStock(ticker,qty);
  showToast('卖出成功','success');
  updateUI();saveGame();renderFinanceModal();
}
function openFacilityModal(outletId) {
  window._facilityOutletId = outletId;
  document.getElementById('facilityModal').classList.add('active');
  renderFacilityModal();
}
function closeFacilityModal() {
  document.getElementById('facilityModal').classList.remove('active');
}
function renderFacilityModal() {
  var outletId = window._facilityOutletId;
  var os = getOutletState(outletId);
  if (!os) return;
  var outletCfg = OUTLET_CONFIGS.find(function(c){return c.id===outletId;});
  var content = document.getElementById('facilityContent');
  var satBonus = typeof getOutletSatisfactionBonus === 'function' ? getOutletSatisfactionBonus(outletId) : 0;
  var incBonus = typeof getOutletIncomeBonusPercent === 'function' ? getOutletIncomeBonusPercent(outletId) : 0;
  var maintCost = typeof getOutletDailyMaintenance === 'function' ? getOutletDailyMaintenance(outletId) : 0;
  var html = '<div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap;">';
  html += '<div style="padding:8px 14px;background:rgba(255,255,255,0.04);border-radius:8px;"><span style="color:rgba(255,255,255,0.5);">网点</span> <span style="color:#60a5fa;font-weight:700;">'+outletCfg.name+' Lv.'+os.level+'</span></div>';
  html += '<div style="padding:8px 14px;background:rgba(255,255,255,0.04);border-radius:8px;"><span style="color:rgba(255,255,255,0.5);">满意度加成</span> <span style="color:#4ade80;font-weight:700;">+'+satBonus+'</span></div>';
  html += '<div style="padding:8px 14px;background:rgba(255,255,255,0.04);border-radius:8px;"><span style="color:rgba(255,255,255,0.5);">收入加成</span> <span style="color:#fbbf24;font-weight:700;">+'+incBonus+'%</span></div>';
  html += '<div style="padding:8px 14px;background:rgba(255,255,255,0.04);border-radius:8px;"><span style="color:rgba(255,255,255,0.5);">日维护费</span> <span style="color:#f87171;font-weight:700;">'+formatCurrency(maintCost)+'</span></div>';
  html += '</div>';
  html += '<div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:10px;">已安装设施</div>';
  var facilities = typeof getOutletFacilities === 'function' ? getOutletFacilities(outletId) : [];
  if (facilities.length === 0) {
    html += '<div style="text-align:center;padding:20px;color:rgba(255,255,255,0.3);font-size:12px;">暂无设施，从下方购买</div>';
  } else {
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">';
    facilities.forEach(function(f){
      var statusTag = f.broken ? '<span style="color:#f87171;font-size:9px;">⚠故障中</span>' : f.disabled ? '<span style="color:rgba(255,255,255,0.3);font-size:9px;">⏸已停用</span>' : '<span style="color:#4ade80;font-size:9px;">●运行中</span>';
      var toggleLabel = f.disabled ? '启用' : '停用';
      var toggleColor = f.disabled ? 'background:linear-gradient(135deg,#27ae60,#2ecc71);color:#fff;' : 'background:rgba(231,76,60,0.2);color:#e74c3c;border:1px solid #e74c3c;';
      html += '<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:12px;">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">';
      html += '<span style="font-size:14px;">'+f.config.icon+'</span>'+statusTag+'</div>';
      html += '<div style="font-size:12px;font-weight:600;color:#fff;">'+f.config.name+'</div>';
      html += '<div style="font-size:9px;color:rgba(255,255,255,0.4);margin-top:2px;">满意度+'+f.config.satisfactionBonus+' · 收入+'+f.config.incomeBonusPercent+'% · 维护$'+f.config.dailyMaintenance+'/天</div>';
      html += '<button style="margin-top:6px;padding:4px 10px;border:none;border-radius:4px;font-size:9px;cursor:pointer;'+toggleColor+'" onclick="toggleFacility('+outletId+',\''+f.id+'\');renderFacilityModal();">'+toggleLabel+'</button>';
      html += '</div>';
    });
    html += '</div>';
  }
  html += '<div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:10px;">可购买设施</div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">';
  facilitiesConfig.forEach(function(fc){
    var owned = os.facilities && os.facilities.indexOf(fc.id) !== -1;
    if (owned) return;
    var canBuy = typeof canPurchaseFacility === 'function' ? canPurchaseFacility(outletId, fc.id) : {ok:false};
    var levelOk = os.level >= fc.baseLevel;
    html += '<div style="background:rgba(255,255,255,0.03);border:1px solid '+(levelOk?'rgba(255,255,255,0.08)':'rgba(255,255,255,0.04)')+';border-radius:10px;padding:12px;'+(levelOk?'':'opacity:0.5;')+'">';
    html += '<div style="font-size:14px;margin-bottom:2px;">'+fc.icon+'</div>';
    html += '<div style="font-size:12px;font-weight:600;color:#fff;">'+fc.name+'</div>';
    html += '<div style="font-size:9px;color:rgba(255,255,255,0.4);margin-top:2px;">需要Lv.'+fc.baseLevel+' · 费用 '+formatCurrency(fc.cost)+'</div>';
    html += '<div style="font-size:9px;color:rgba(255,255,255,0.4);">满意度+'+fc.satisfactionBonus+' · 收入+'+fc.incomeBonusPercent+'% · 维护$'+fc.dailyMaintenance+'/天</div>';
    if (levelOk) {
      var estPayback = fc.dailyMaintenance > 0 || fc.incomeBonusPercent > 0 ? Math.ceil(fc.cost / Math.max(1, (fc.incomeBonusPercent * 40 + (FACILITY_SERVICE_FEES[fc.id]||0) - fc.dailyMaintenance))) : '—';
      html += '<button style="margin-top:6px;padding:4px 12px;border:none;border-radius:4px;font-size:9px;cursor:pointer;background:linear-gradient(135deg,#27ae60,#2ecc71);color:#fff;" onclick="purchaseFacility('+outletId+',\''+fc.id+'\');renderFacilityModal();">'+(gameState.cash>=fc.cost?'购买':'资金不足')+'</button>';
      html += '<div style="margin-top:4px;font-size:8px;color:rgba(255,255,255,0.3);">预估回本: ~'+estPayback+'天</div>';
    } else {
      html += '<div style="margin-top:6px;font-size:9px;color:#f87171;">网点等级不足</div>';
    }
    html += '</div>';
  });
  html += '</div>';
  var incomeReport = typeof getFacilityIncomeReport === 'function' ? getFacilityIncomeReport() : {};
  var reportKeys = Object.keys(incomeReport);
  if (reportKeys.length > 0) {
    html += '<div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:10px;margin-top:16px;">📊 设施收入报告</div>';
    html += '<div style="background:rgba(255,255,255,0.03);border-radius:10px;padding:12px;">';
    html += '<table style="width:100%;border-collapse:collapse;">';
    html += '<tr style="border-bottom:1px solid rgba(255,255,255,0.08);"><th style="text-align:left;padding:6px 8px;font-size:9px;color:rgba(255,255,255,0.4);">设施</th><th style="text-align:left;padding:6px 8px;font-size:9px;color:rgba(255,255,255,0.4);">服务费</th><th style="text-align:left;padding:6px 8px;font-size:9px;color:rgba(255,255,255,0.4);">覆盖网点</th></tr>';
    reportKeys.forEach(function(fid){
      var r = incomeReport[fid];
      var fee = FACILITY_SERVICE_FEES[fid] || 0;
      html += '<tr style="border-bottom:1px solid rgba(255,255,255,0.04);"><td style="padding:6px 8px;font-size:11px;color:#fff;">'+r.icon+' '+r.name+'</td><td style="padding:6px 8px;font-size:11px;color:#4ade80;">+$'+fee+'/次</td><td style="padding:6px 8px;font-size:11px;color:rgba(255,255,255,0.5);">'+r.outlets.length+'个网点</td></tr>';
    });
    html += '</table></div>';
  }
  content.innerHTML = html;
}
