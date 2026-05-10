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
    coeffEl.textContent = '市场系数: ' + coeff.toFixed(2);
    coeffEl.style.color = coeff > 1.0 ? '#4ade80' : coeff < 1.0 ? '#f87171' : 'rgba(255,255,255,0.6)';
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

function updateTableHeader(headers) {
  var thead = document.querySelector('#vehicleTable thead tr');
  if (thead) thead.innerHTML = headers.map(function(h){ return '<th>' + h + '</th>'; }).join('');
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
    updateTableHeader(['车型','车牌','类型','网点','状态','日租金','操作']);
    renderMyFleet();
  } else if (tab === 'market') {
    infoBar.style.display = 'flex';
    if (marketSubTabs) marketSubTabs.style.display = 'flex';
    switchMarketSubTab(currentMarketSub || 'local');
  } else if (tab === 'status') {
    infoBar.style.display = 'none';
    if (marketSubTabs) marketSubTabs.style.display = 'none';
    renderVehicleStatus();
  } else if (tab === 'outlets') {
    infoBar.style.display = 'none';
    if (marketSubTabs) marketSubTabs.style.display = 'none';
    updateTableHeader(['网点名称','状态','等级','车位','今日订单','升级费用','操作']);
    renderOutlets();
  } else if (tab === 'pricing') {
    infoBar.style.display = 'none';
    if (marketSubTabs) marketSubTabs.style.display = 'none';
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
  renderMyFleet();
}

function renderVehicleStatus() {
  var tbody = document.getElementById('vehicleTableBody');
  var total = gameState.ownedVehicles.length;
  var available = gameState.ownedVehicles.filter(function(v){ return (!v.rentedUntil || v.rentedUntil < gameState.currentDay) && !isInTransit(v.id); }).length;
  var rented = gameState.ownedVehicles.filter(function(v){ return v.rentedUntil && v.rentedUntil >= gameState.currentDay; }).length;
  var inTransit = gameState.ownedVehicles.filter(function(v){ return isInTransit(v.id); }).length;

  var typeCounts = {};
  gameState.ownedVehicles.forEach(function(v){ typeCounts[v.type] = (typeCounts[v.type] || 0) + 1; });

  var avgRate = total > 0 ? Math.round(gameState.ownedVehicles.reduce(function(s,v){ return s + getEffectiveDailyRate(v); }, 0) / total) : 0;

  tbody.innerHTML = '';
  var stats = [
    { label: '总车队', value: total + ' 辆', color: '#60a5fa' },
    { label: '可用', value: available + ' 辆', color: '#4ade80' },
    { label: '已租出', value: rented + ' 辆', color: '#fbbf24' },
    { label: '调度中', value: inTransit + ' 辆', color: '#60a5fa' },
    { label: '平均日租金', value: formatCurrency(avgRate), color: '#a78bfa' },
    { label: '市场系数', value: gameState.marketCoefficient.toFixed(2), color: gameState.marketCoefficient >= 1.0 ? '#4ade80' : '#f87171' },
    { label: '累计营收', value: formatCurrency(gameState.totalRevenue || 0), color: '#4ade80' },
    { label: '累计出租天数', value: (gameState.totalDaysRented || 0) + ' 天', color: '#fbbf24' }
  ];

  var statsRow = document.createElement('tr');
  statsRow.innerHTML = '<td colspan="7"><div class="status-grid">' +
    stats.map(function(s){ return '<div class="status-card"><div class="status-label">' + s.label + '</div><div class="status-value" style="color:' + s.color + ';">' + s.value + '</div></div>'; }).join('') +
    '</div></td>';
  tbody.appendChild(statsRow);

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
      '<td><span style="font-size:11px;color:rgba(255,255,255,0.4);">倍率 ' + getRateMultiplier(type).toFixed(1) + 'x</span></td>';
    tbody.appendChild(row);
  });

  if (gameState.activeEvents.length > 0) {
    var eventRow = document.createElement('tr');
    eventRow.innerHTML = '<td colspan="7" style="padding:12px;"><div style="font-size:12px;color:#fbbf24;font-weight:600;margin-bottom:8px;">⚡ 当前活跃事件</div>' +
      gameState.activeEvents.map(function(e){
        var remain = e.endDay - gameState.currentDay;
        return '<div style="font-size:11px;color:rgba(255,255,255,0.6);padding:4px 0;">' + e.icon + ' ' + e.name + ' — ' + e.desc + '（剩余' + remain + '天）</div>';
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
  types.forEach(function(type){
    var mult = getRateMultiplier(type);
    var count = gameState.ownedVehicles.filter(function(v){ return v.type === type; }).length;
    if (count === 0 && mult === 1.0) return;
    var row = document.createElement('tr');
    row.innerHTML =
      '<td><span class="tag tag-type">' + type + '</span></td>' +
      '<td>' + count + ' 辆</td>' +
      '<td colspan="2"><div style="display:flex;align-items:center;gap:8px;"><input type="range" min="50" max="200" value="' + Math.round(mult * 100) + '" class="rate-slider" id="rateSlider_' + type + '" oninput="updateRateDisplay(\'' + type + '\',this.value)"><span id="rateDisplay_' + type + '" style="font-family:JetBrains Mono,monospace;font-size:14px;font-weight:700;color:#4ade80;min-width:40px;">' + mult.toFixed(1) + 'x</span></div></td>' +
      '<td><span style="font-size:11px;color:rgba(255,255,255,0.4);">0.5x ~ 2.0x</span></td>' +
      '<td><span style="font-size:11px;color:rgba(255,255,255,0.4);">次日生效</span></td>' +
      '<td><button class="action-btn btn-buy" onclick="confirmRateChange(\'' + type + '\')">确认调价</button></td>';
    tbody.appendChild(row);
  });
  if (tbody.children.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><div class="icon">💰</div><div class="text">购买车辆后可调整租金倍率</div></div></td></tr>';
  }
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
      actionsEl.innerHTML = '<button class="popup-btn popup-btn-upgrade" onclick="upgradeOutlet(' + outletId + ')" ' + (gameState.cash < nextLevel.upgradeCost ? 'disabled' : '') + '>⬆ 升级 Lv.' + nextLevel.level + ' (' + formatCurrency(nextLevel.upgradeCost) + ')</button>';
    } else {
      actionsEl.innerHTML = '<button class="popup-btn popup-btn-upgrade" disabled>已满级</button>';
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
