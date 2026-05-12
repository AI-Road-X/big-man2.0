var currentTab = 'myvehicles';
var myFleetSort = { field: 'name', asc: true };

function togglePanelSection(header) {
  var body = header.nextElementSibling;
  var arrow = header.querySelector('.section-arrow');
  if (body.style.display === 'none') {
    body.style.display = 'flex';
    arrow.style.transform = 'rotate(0deg)';
  } else {
    body.style.display = 'none';
    arrow.style.transform = 'rotate(-90deg)';
  }
}

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
    coeffEl.style.color = coeff > 1.0 ? '#4ade80' : coeff < 1.0 ? '#f87171' : '#475569';
  }
  var en = gameState.energy;
  var oilEl = document.getElementById('oilPriceDisplay');
  if (oilEl) {
    var oilTrend = en.oilPrice > en.prevOilPrice + 0.01 ? ' ⬆' : en.oilPrice < en.prevOilPrice - 0.01 ? ' ⬇' : '';
    oilEl.textContent = '⛽ ' + en.oilPrice.toFixed(2) + oilTrend;
    oilEl.style.color = en.oilPrice > en.prevOilPrice ? '#f87171' : en.oilPrice < en.prevOilPrice ? '#4ade80' : '#475569';
  }
  var elecEl = document.getElementById('elecPriceDisplay');
  if (elecEl) {
    var elecTrend = en.electricityPrice > en.prevElectricityPrice + 0.01 ? ' ⬆' : en.electricityPrice < en.prevElectricityPrice - 0.01 ? ' ⬇' : '';
    elecEl.textContent = '🔋 ' + en.electricityPrice.toFixed(2) + elecTrend;
    elecEl.style.color = en.electricityPrice > en.prevElectricityPrice ? '#f87171' : en.electricityPrice < en.prevElectricityPrice ? '#4ade80' : '#475569';
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
var currentSubCategory = 'all';

function switchMarketSubTab(sub) {
  currentMarketSub = sub;
  currentSubCategory = 'all';
  document.querySelectorAll('.market-sub-tab').forEach(function(t){ t.classList.toggle('active', t.dataset.sub === sub); });
  var refreshBtn = document.getElementById('refreshUsedBtn');
  refreshBtn.style.display = sub === 'used' ? 'flex' : 'none';
  var market = getMarketInfo()[sub];
  if (market) {
    document.getElementById('marketDescription').innerHTML = market.icon + ' ' + market.description;
    document.getElementById('deliveryTime').textContent = '⏱️ ' + market.deliveryTime;
  }
  renderSubCategoryBar(sub);
  updateTableHeader(['车型信息','车牌','类型','保值率','采购价格','日租金','操作']);
  if (sub === 'local') renderFilteredMarketVehicles(MARKET_TYPES.LOCAL_DEALER, 'local');
  else if (sub === 'used') renderUsedCarMarket();
  else if (sub === 'overseas') renderFilteredMarketVehicles(MARKET_TYPES.OVERSEAS, 'overseas');
}

function renderSubCategoryBar(marketSub) {
  var container = document.getElementById('subCategoryBar');
  if (!container) return;
  var catalog;
  if (marketSub === 'local') catalog = MARKET_CATALOG[MARKET_TYPES.LOCAL_DEALER];
  else if (marketSub === 'overseas') catalog = MARKET_CATALOG[MARKET_TYPES.OVERSEAS];
  else if (marketSub === 'used') catalog = MARKET_CATALOG[MARKET_TYPES.USED_CAR];
  if (!catalog || !catalog.subcategories) {
    container.style.display = 'none';
    container.innerHTML = '';
    return;
  }
  container.style.display = 'flex';
  container.innerHTML = '';
  catalog.subcategories.forEach(function(cat){
    var btn = document.createElement('button');
    btn.className = 'sub-cat-btn' + (cat.id === currentSubCategory ? ' active' : '');
    btn.dataset.cat = cat.id;
    var count = 0;
    if (cat.typeFilter && marketSub === 'used') count = gameState.usedCarMarketList.filter(function(v){ return cat.typeFilter.indexOf(v.type) !== -1; }).length;
    else if (cat.vehicleIds) count = cat.vehicleIds.length;
    else if (marketSub === 'used') count = gameState.usedCarMarketList.length;
    else count = getVehiclesByMarket(marketSub === 'local' ? MARKET_TYPES.LOCAL_DEALER : MARKET_TYPES.OVERSEAS).length;
    btn.innerHTML = cat.icon + ' ' + cat.name + '<span class="sub-cat-count">' + count + '辆</span>';
    btn.onclick = function(){ switchSubCategory(cat.id); };
    container.appendChild(btn);
  });
}

function switchSubCategory(catId) {
  currentSubCategory = catId;
  document.querySelectorAll('.sub-cat-btn').forEach(function(b){ b.classList.toggle('active', b.dataset.cat === catId); });
  if (currentMarketSub === 'used') {
    var catalog = MARKET_CATALOG[MARKET_TYPES.USED_CAR];
    var cat = null;
    if (catalog && catalog.subcategories) cat = catalog.subcategories.find(function(c){ return c.id === catId; });
    if (catId === 'all' || !cat || !cat.typeFilter) { renderUsedCarMarket(); }
    else {
      var filtered = gameState.usedCarMarketList.filter(function(v){ return cat.typeFilter.indexOf(v.type) !== -1; });
      renderUsedCarMarket(filtered);
    }
  } else {
    var marketType = currentMarketSub === 'local' ? MARKET_TYPES.LOCAL_DEALER : MARKET_TYPES.OVERSEAS;
    var marketKey = currentMarketSub;
    renderFilteredMarketVehicles(marketType, marketKey);
  }
}

function renderFilteredMarketVehicles(marketType, marketKey) {
  var allVehicles = getVehiclesByMarket(marketType);
  var vehicles = allVehicles;
  if (currentSubCategory && currentSubCategory !== 'all') {
    var catalog = MARKET_CATALOG[marketType];
    if (catalog && catalog.subcategories) {
      var cat = catalog.subcategories.find(function(c){ return c.id === currentSubCategory; });
      if (cat && cat.vehicleIds && cat.vehicleIds.length > 0) {
        var idSet = new Set(cat.vehicleIds);
        vehicles = allVehicles.filter(function(v){ return idSet.has(v.id); });
      }
    }
  }
  renderMarketVehicles(vehicles, marketKey);
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
      '<td><span style="color:#94a3b8;font-size:11px;">购买后生成</span></td>' +
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

function renderUsedCarMarket(filteredList) {
  var tbody = document.getElementById('vehicleTableBody');
  var vehicles = filteredList || gameState.usedCarMarketList;
  if (vehicles.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><div class="icon">🚗</div><div class="text">' + (filteredList ? '该分类下暂无二手车' : '点击「刷新市场」浏览二手车') + '</div></div></td></tr>';
    return;
  }
  tbody.innerHTML = '';
  vehicles.forEach(function(v){
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
      '<td><span style="font-size:11px;color:#64748b;">' + outletLabel + '</span></td>' +
      '<td>' + statusHtml + '</td>' +
      '<td><span class="daily-rate">' + formatCurrency(getEffectiveDailyRate(v)) + '/天</span><br><span style="font-size:10px;color:#94a3b8;">倍率 ' + getRateMultiplier(v.type).toFixed(1) + 'x</span></td>' +
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
      '<td><span style="font-size:10px;color:#94a3b8;">倍率 ' + getRateMultiplier(type).toFixed(1) + 'x</span></td>';
    tbody.appendChild(row);
  });

  if (gameState.activeEvents.length > 0) {
    var eventRow = document.createElement('tr');
    eventRow.innerHTML = '<td colspan="7" style="padding:12px;"><div style="font-size:11px;color:#fbbf24;font-weight:600;margin-bottom:6px;">⚡ 当前活跃事件</div>' +
      gameState.activeEvents.map(function(e){
        var remain = e.endDay - gameState.currentDay;
        return '<div style="font-size:10px;color:#475569;padding:3px 0;">' + e.icon + ' ' + e.name + ' — ' + e.desc + '（剩余' + remain + '天）</div>';
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
      '<td><span style="color:' + (isOwned ? '#4ade80' : '#94a3b8') + ';">' + (isOwned ? '运营中' : '未解锁') + '</span></td>' +
      '<td>' + (isOwned ? 'Lv.' + os.level : '-') + '</td>' +
      '<td>' + (isOwned ? vehCount + ' / ' + cap : '-') + '</td>' +
      '<td>' + (isOwned ? (gameState.outletOrderCounts[cfg.id] || 0) + ' 单' : '-') + '</td>' +
      '<td>' + (nextLevel ? formatCurrency(nextLevel.upgradeCost) : (isOwned ? '已满级' : formatCurrency(cfg.unlockCost))) + '</td>' +
      '<td>' + (isOwned
        ? (nextLevel ? '<button class="action-btn btn-buy" onclick="upgradeOutlet(' + cfg.id + ')" ' + (gameState.cash < nextLevel.upgradeCost ? 'disabled' : '') + '>升级 Lv.' + nextLevel.level + '</button>' : '<span style="color:#94a3b8;font-size:11px;">已满级</span>')
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
      '<td><span style="font-size:10px;color:#94a3b8;">0.5x ~ 2.0x</span></td>' +
      '<td><span style="font-size:10px;color:#94a3b8;">次日生效</span></td>' +
      '<td><button class="action-btn btn-buy" onclick="confirmRateChange(\'' + type + '\')">确认调价</button></td>' +
      '<td></td>';
    tbody.appendChild(row);
  });
  if (!hasAny) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><div class="icon">💰</div><div class="text">购买车辆后可调整租金倍率</div></div></td></tr>';
  }
  var tipRow = document.createElement('tr');
  tipRow.innerHTML = '<td colspan="7" style="padding:12px;"><div style="padding:10px;background:rgba(248,250,252,1);border-radius:8px;font-size:10px;color:#94a3b8;line-height:1.6;">💡 竞争对手每周调整市场系数（0.8~1.2），当前: <span style="color:' + (gameState.marketCoefficient >= 1.0 ? '#4ade80' : '#f87171') + ';">' + gameState.marketCoefficient.toFixed(2) + '</span>。合理定价可提高客户下单率。</div></td>';
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
  var headerBar = document.createElement('div');
  headerBar.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding:8px 12px;background:rgba(241,245,249,1);border-radius:8px;border:1px solid rgba(226,232,240,1);';
  headerBar.innerHTML = '<span style="font-size:13px;font-weight:700;color:#1e293b;">待处理订单 <span style="color:#2563eb;">' + gameState.pendingOrders.length + '</span> 条</span>' +
    '<button style="padding:7px 18px;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#059669,#10b981);color:#fff;box-shadow:0 2px 8px rgba(5,150,105,0.25);" onclick="acceptAllOrders()">✅ 一键全部接单</button>';
  wrapper.appendChild(headerBar);
  gameState.pendingOrders.forEach(function(order){
    var typeIcon = order.customerType === 'business' ? '💼' : '🏖️';
    var typeClass = order.customerType === 'business' ? 'business' : 'tourist';
    var typeLabel = order.customerType === 'business' ? '商务客户' : '旅游客户';
    var netClass = order.netIncome >= 0 ? 'msg-highlight' : 'msg-bad';
    var isEgg = order.isEasterEgg;
    var card = document.createElement('div');
    card.className = 'order-card';
    if (isEgg) card.style.borderLeft = '4px solid #f59e0b';
    var eggBadge = isEgg ? '<span style="font-size:9px;padding:1px 6px;background:linear-gradient(135deg,#f59e0b,#fbbf24);color:#fff;border-radius:4px;font-weight:700;margin-left:6px;">🎁 彩蛋订单</span>' : '';
    card.innerHTML =
      '<div class="order-top"><div class="order-customer"><div class="order-avatar ' + typeClass + '">' + typeIcon + '</div><div class="order-customer-info"><span class="order-customer-name">' + order.customerName + eggBadge + '</span><span class="order-customer-type">' + typeLabel + ' · ' + order.outletName + '</span></div></div><span class="order-price">' + formatCurrency(order.totalIncome) + (isEgg ? '<br><span style="font-size:9px;color:#f59e0b;">×' + (order.eggBonus || 1) + ' 奖励</span>' : '') + '</span></div>' +
      '<div class="order-details"><div class="order-detail-item"><div class="order-detail-label">租用车型</div><div class="order-detail-value">' + order.vehicleName + '</div></div><div class="order-detail-item"><div class="order-detail-label">租期</div><div class="order-detail-value">' + order.rentalDays + ' 天</div></div><div class="order-detail-item"><div class="order-detail-label">净利润</div><div class="order-detail-value ' + netClass + '">' + formatCurrency(order.netIncome) + '</div></div></div>' +
      '<div class="order-actions"><button class="action-btn btn-accept" onclick="acceptOrder(\'' + order.id + '\')">✓ 接单</button><button class="action-btn btn-reject" onclick="rejectOrder(\'' + order.id + '\')">✕ 拒绝</button></div>';
    wrapper.appendChild(card);
  });
}

function acceptAllOrders() {
  var count = gameState.pendingOrders.length;
  if (count === 0) return;
  var ids = gameState.pendingOrders.map(function(o){ return o.id; });
  var accepted = 0;
  ids.forEach(function(id){
    try { acceptOrder(id); accepted++; } catch(e) {}
  });
  addMessage('⚡ 一键接单：成功接下 ' + accepted + '/' + count + ' 个订单', 'good');
  showToast('已接单 ' + accepted + ' 个', 'success');
  updateUI(); saveGame();
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
    var occ = getParkingOccupancy(outletId);
    document.getElementById('popupLevel').textContent = 'Lv.' + os.level + ' | 🅿️ ' + occ.customer.used + '/' + occ.customer.total;
    var vList = document.getElementById('popupVehicles');
    if (vehs.length === 0) {
      vList.innerHTML = '<div style="font-size:12px;color:#94a3b8;padding:8px 0;">暂无车辆</div>';
    } else {
      vList.innerHTML = vehs.map(function(v){
        var status = (v.rentedUntil && v.rentedUntil >= gameState.currentDay) ? ' 🔴已租' : '';
        return '<div class="popup-vehicle-item"><span>' + v.brand + ' ' + v.model + '</span><span>' + v.licensePlate + status + '</span></div>';
      }).join('');
    }
    var nextLevel = OUTLET_LEVELS.find(function(l){ return l.level === os.level + 1; });
    var actionsEl = document.getElementById('popupActions');
    if (nextLevel) {
      actionsEl.innerHTML = '<button class="popup-btn" style="background:linear-gradient(135deg,#ff6b35,#f7931e);color:#fff;" onclick="hideOutletPopup();enterInterior(' + outletId + ')">🏠 3D视图</button><button class="popup-btn" style="background:linear-gradient(135deg,#10b981,#059669);color:#fff;" onclick="hideOutletPopup();openInternalLayoutModal(' + outletId + ')">📋 店铺内部</button><button class="popup-btn popup-btn-upgrade" onclick="upgradeOutlet(' + outletId + ')" ' + (gameState.cash < nextLevel.upgradeCost ? 'disabled' : '') + '>⬆ 升级</button><button class="popup-btn" style="background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;" onclick="openFacilityModal(' + outletId + ')">🏗️ 设施</button>';
    } else {
      actionsEl.innerHTML = '<button class="popup-btn" style="background:linear-gradient(135deg,#ff6b35,#f7931e);color:#fff;" onclick="hideOutletPopup();enterInterior(' + outletId + ')">🏠 3D视图</button><button class="popup-btn" style="background:linear-gradient(135deg,#10b981,#059669);color:#fff;" onclick="hideOutletPopup();openInternalLayoutModal(' + outletId + ')">📋 店铺内部</button><button class="popup-btn popup-btn-upgrade" disabled>已满级</button><button class="popup-btn" style="background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;" onclick="openFacilityModal(' + outletId + ')">🏗️ 设施</button>';
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
  var oilTrend = en.oilPrice > en.prevOilPrice + 0.01 ? '<span style="color:#f87171;">⬆ 上涨</span>' : en.oilPrice < en.prevOilPrice - 0.01 ? '<span style="color:#4ade80;">⬇ 下跌</span>' : '<span style="color:#94a3b8;">— 持平</span>';
  var elecTrend = en.electricityPrice > en.prevElectricityPrice + 0.01 ? '<span style="color:#f87171;">⬆ 上涨</span>' : en.electricityPrice < en.prevElectricityPrice - 0.01 ? '<span style="color:#4ade80;">⬇ 下跌</span>' : '<span style="color:#94a3b8;">— 持平</span>';
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
  ctx.fillStyle = 'rgba(241,245,249,1)';
  ctx.fillRect(0, 0, w, h);
  var ph = gameState.priceHistory || { oil: [], electricity: [] };
  var oilData = ph.oil.slice(-7);
  var elecData = ph.electricity.slice(-7);
  if (oilData.length === 0 && elecData.length === 0) {
    ctx.fillStyle = '#94a3b8';
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
  ctx.strokeStyle = 'rgba(226,232,240,1)';
  ctx.lineWidth = 1;
  for (var i = 0; i <= 4; i++) {
    var y = padT + chartH * i / 4;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + chartW, y); ctx.stroke();
    var val = maxV - (maxV - minV) * i / 4;
    ctx.fillStyle = '#94a3b8';
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
  ctx.fillStyle = '#64748b';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('油价', padL + 26, h - 12);
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(padL + 60, h - 16, 12, 3);
  ctx.fillStyle = '#64748b';
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
    '<div style="padding:8px 14px;background:rgba(248,250,252,1);border-radius:8px;"><span style="color:#64748b;">总会员</span> <span style="color:#60a5fa;font-weight:700;">' + total + '</span></div>' +
    '<div style="padding:8px 14px;background:rgba(248,250,252,1);border-radius:8px;"><span style="color:#64748b;">活跃</span> <span style="color:#4ade80;font-weight:700;">' + active + '</span></div>' +
    '<div style="padding:8px 14px;background:rgba(248,250,252,1);border-radius:8px;font-size:11px;line-height:1.6;">' + distHtml + '</div></div>';

  html += '<table style="width:100%;border-collapse:collapse;font-size:11px;">' +
    '<thead><tr style="border-bottom:1px solid rgba(203,213,225,1);">' +
    '<th style="text-align:left;padding:6px 8px;color:#64748b;cursor:pointer;" onclick="sortMembers(\'level\')">等级' + sortArrow('level') + '</th>' +
    '<th style="text-align:left;padding:6px 8px;color:#64748b;">姓名</th>' +
    '<th style="text-align:left;padding:6px 8px;color:#64748b;">卡号</th>' +
    '<th style="text-align:right;padding:6px 8px;color:#64748b;cursor:pointer;" onclick="sortMembers(\'trips\')">总出行' + sortArrow('trips') + '</th>' +
    '<th style="text-align:right;padding:6px 8px;color:#64748b;cursor:pointer;" onclick="sortMembers(\'spent\')">总消费' + sortArrow('spent') + '</th>' +
    '<th style="text-align:left;padding:6px 8px;color:#64748b;">手机</th>' +
    '<th style="text-align:left;padding:6px 8px;color:#64748b;">注册日期</th>' +
    '</tr></thead><tbody>';

  pageMembers.forEach(function(m){
    var lv = getMemberLevelInfo(m.level);
    html += '<tr style="border-bottom:1px solid rgba(226,232,240,0.6);">' +
      '<td style="padding:6px 8px;"><span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;background:' + lv.color + '22;color:' + lv.color + ';">' + lv.name + '</span></td>' +
      '<td style="padding:6px 8px;color:#94a3b8;">' + m.name + '</td>' +
      '<td style="padding:6px 8px;color:#94a3b8;font-family:JetBrains Mono,monospace;font-size:10px;">' + m.id + '</td>' +
      '<td style="padding:6px 8px;text-align:right;color:#64748b;">' + m.totalTrips + '</td>' +
      '<td style="padding:6px 8px;text-align:right;color:#4ade80;">' + formatCurrency(m.totalSpent) + '</td>' +
      '<td style="padding:6px 8px;color:#94a3b8;font-size:10px;">' + m.phone + '</td>' +
      '<td style="padding:6px 8px;color:#94a3b8;font-size:10px;">D' + m.registerDay + '</td>' +
      '</tr>';
  });

  html += '</tbody></table>';

  if (totalPages > 1) {
    html += '<div style="display:flex;justify-content:center;align-items:center;gap:8px;margin-top:12px;">';
    html += '<button class="action-btn" style="padding:4px 12px;font-size:11px;" onclick="memberPage=1;renderMemberModal();"' + (memberPage <= 1 ? ' disabled' : '') + '>首页</button>';
    html += '<button class="action-btn" style="padding:4px 12px;font-size:11px;" onclick="memberPage--;renderMemberModal();"' + (memberPage <= 1 ? ' disabled' : '') + '>上一页</button>';
    html += '<span style="color:#64748b;font-size:11px;">' + memberPage + ' / ' + totalPages + '</span>';
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
    '<div style="font-size:13px;font-weight:600;color:#64748b;margin-bottom:10px;">固定价格服务</div>';
  fixedServices.forEach(function(s){
    var currentVal = sp[s.key];
    var prob = getEffectiveServiceProbability(s.key);
    html += '<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid rgba(226,232,240,0.6);">' +
      '<span style="font-size:16px;">' + s.icon + '</span>' +
      '<span style="min-width:80px;color:#64748b;font-size:12px;">' + s.name + '</span>' +
      '<input type="number" id="sp_' + s.key + '" min="' + s.min + '" max="' + s.max + '" value="' + currentVal + '" style="width:70px;padding:4px 8px;background:rgba(241,245,249,1);border:1px solid rgba(203,213,225,1);border-radius:6px;color:#1e293b;font-size:12px;text-align:right;" oninput="updateServicePricingProb()">' +
      '<span style="color:#94a3b8;font-size:11px;">' + s.unit + '</span>' +
      '<span style="color:#94a3b8;font-size:10px;margin-left:auto;">生效概率: <span class="sp-prob" data-key="' + s.key + '" style="color:#4ade80;font-weight:600;">' + Math.round(prob * 100) + '%</span></span>' +
      '</div>';
  });
  html += '</div>';

  html += '<div style="margin-bottom:16px;">' +
    '<div style="font-size:13px;font-weight:600;color:#64748b;margin-bottom:10px;">能源加价倍率</div>';
  marginServices.forEach(function(s){
    var currentVal = sp[s.key];
    html += '<div style="padding:8px 0;border-bottom:1px solid rgba(226,232,240,0.6);">' +
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:4px;">' +
      '<span style="font-size:16px;">' + s.icon + '</span>' +
      '<span style="min-width:80px;color:#64748b;font-size:12px;">' + s.name + '</span>' +
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
  var html = '<div style="margin-bottom:10px;font-size:12px;color:#64748b;">共 '+orders.length+' 条历史订单</div>';
  html += '<table style="width:100%;border-collapse:collapse;font-size:11px;"><thead><tr style="border-bottom:1px solid rgba(203,213,225,1);">';
  html += '<th style="text-align:left;padding:6px 8px;color:#64748b;cursor:pointer;" onclick="sortOrders(\'day\')">日期'+sa('day')+'</th>';
  html += '<th style="text-align:left;padding:6px 8px;color:#64748b;">客户</th>';
  html += '<th style="text-align:left;padding:6px 8px;color:#64748b;cursor:pointer;" onclick="sortOrders(\'vehicle\')">车型'+sa('vehicle')+'</th>';
  html += '<th style="text-align:right;padding:6px 8px;color:#64748b;cursor:pointer;" onclick="sortOrders(\'days\')">天数'+sa('days')+'</th>';
  html += '<th style="text-align:right;padding:6px 8px;color:#64748b;cursor:pointer;" onclick="sortOrders(\'income\')">收入'+sa('income')+'</th>';
  html += '<th style="text-align:left;padding:6px 8px;color:#64748b;">增值服务</th>';
  html += '<th style="text-align:left;padding:6px 8px;color:#64748b;">网点</th>';
  html += '<th style="text-align:center;padding:6px 8px;color:#64748b;">评价</th>';
  html += '</tr></thead><tbody>';
  pageOrders.forEach(function(o){
    var svc = (o.services && o.services.length > 0) ? o.services.join(', ') : '—';
    var review = (gameState.customerReviews || []).find(function(r){ return r.orderId === o.id; });
    var reviewHtml = '—';
    if (review) {
      var stars = '';
      for (var si = 1; si <= 5; si++) stars += si <= review.score ? '⭐' : '☆';
      reviewHtml = '<span style="color:' + (review.score >= 4 ? '#4ade80' : review.score >= 3 ? '#fbbf24' : '#f87171') + ';">' + stars + '</span>';
    }
    html += '<tr style="border-bottom:1px solid rgba(226,232,240,0.6);">';
    html += '<td style="padding:6px 8px;color:#64748b;">D'+(o.acceptedDay||o.createdDay)+'</td>';
    html += '<td style="padding:6px 8px;color:#64748b;">'+o.customerName+'</td>';
    html += '<td style="padding:6px 8px;color:#64748b;">'+o.vehicleName+'</td>';
    html += '<td style="padding:6px 8px;text-align:right;color:#64748b;">'+o.rentalDays+'</td>';
    html += '<td style="padding:6px 8px;text-align:right;color:#4ade80;">'+formatCurrency(o.actualIncome||o.totalIncome)+'</td>';
    html += '<td style="padding:6px 8px;color:#64748b;font-size:10px;">'+svc+'</td>';
    html += '<td style="padding:6px 8px;color:#64748b;">'+o.outletName+'</td>';
    html += '<td style="padding:6px 8px;text-align:center;font-size:10px;">'+reviewHtml+'</td>';
    html += '</tr>';
  });
  html += '</tbody></table>';
  if (totalPages > 1) {
    html += '<div style="display:flex;justify-content:center;align-items:center;gap:8px;margin-top:12px;">';
    html += '<button class="action-btn" style="padding:4px 12px;font-size:11px;" onclick="orderPage=1;renderOrderHistory();"'+(orderPage<=1?' disabled':'')+'>首页</button>';
    html += '<button class="action-btn" style="padding:4px 12px;font-size:11px;" onclick="orderPage--;renderOrderHistory();"'+(orderPage<=1?' disabled':'')+'>上一页</button>';
    html += '<span style="color:#64748b;font-size:11px;">'+orderPage+' / '+totalPages+'</span>';
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
  html += '<div style="padding:8px 14px;background:rgba(248,250,252,1);border-radius:8px;"><span style="color:#64748b;">员工总数</span> <span style="color:#60a5fa;font-weight:700;">'+emps.length+'</span></div>';
  html += '<div style="padding:8px 14px;background:rgba(248,250,252,1);border-radius:8px;"><span style="color:#64748b;">日工资总额</span> <span style="color:#fbbf24;font-weight:700;">'+formatCurrency(totalSalary)+'</span></div>';
  html += '<div style="padding:8px 14px;background:rgba(248,250,252,1);border-radius:8px;"><span style="color:#64748b;">罢工</span> <span style="color:#f87171;font-weight:700;">'+striking+'</span></div>';
  html += '<div style="padding:8px 14px;background:rgba(248,250,252,1);border-radius:8px;"><button class="action-btn btn-buy" style="padding:4px 10px;font-size:10px;" onclick="openTalentMarket()">👔 人才市场</button></div>';
  html += '<div style="padding:8px 14px;background:rgba(248,250,252,1);border-radius:8px;"><button class="action-btn" style="padding:4px 10px;font-size:10px;background:linear-gradient(135deg,#e67e22,#f39c12);color:#fff;" onclick="doTeamBuilding()"'+(gameState.currentDay - (gameState.lastTeamBuildingDay||0) < 7?' disabled':'')+'>🎉 团建($5000)</button></div>';
  html += '</div>';
  if (emps.length === 0) {
    html += '<div class="empty-state"><div class="icon">👔</div><div class="text">暂无员工，前往人才市场招聘</div></div>';
  } else {
    html += '<table style="width:100%;border-collapse:collapse;font-size:11px;"><thead><tr style="border-bottom:1px solid rgba(203,213,225,1);">';
    html += '<th style="text-align:left;padding:6px 8px;color:#64748b;">姓名</th>';
    html += '<th style="text-align:left;padding:6px 8px;color:#64748b;">角色</th>';
    html += '<th style="text-align:left;padding:6px 8px;color:#64748b;">网点</th>';
    html += '<th style="text-align:right;padding:6px 8px;color:#64748b;">时薪</th>';
    html += '<th style="text-align:center;padding:6px 8px;color:#64748b;">士气</th>';
    html += '<th style="text-align:center;padding:6px 8px;color:#64748b;">技能</th>';
    html += '<th style="text-align:center;padding:6px 8px;color:#64748b;">操作</th>';
    html += '</tr></thead><tbody>';
    emps.forEach(function(e){
      var moraleColor = e.morale > 80 ? '#4ade80' : e.morale > 30 ? '#fbbf24' : '#f87171';
      var strikeTag = e.onStrike ? ' <span style="color:#f87171;font-weight:700;">⚠罢工</span>' : '';
      var outletName = OUTLET_CONFIGS.find(function(c){ return c.id === e.outletId; });
      html += '<tr style="border-bottom:1px solid rgba(226,232,240,0.6);">';
      html += '<td style="padding:6px 8px;color:#94a3b8;">'+e.name+strikeTag+'</td>';
      html += '<td style="padding:6px 8px;"><span style="padding:2px 6px;border-radius:4px;font-size:10px;background:rgba(52,152,219,0.15);color:#3498db;">'+e.type+'</span></td>';
      html += '<td style="padding:6px 8px;color:#64748b;">'+(outletName?outletName.name:'—')+'</td>';
      html += '<td style="padding:6px 8px;text-align:right;color:#64748b;">$'+e.salary+'/h</td>';
      html += '<td style="padding:6px 8px;text-align:center;color:'+moraleColor+';">'+e.morale+'</td>';
      html += '<td style="padding:6px 8px;text-align:center;color:#64748b;">'+e.skillLevel+'</td>';
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
  var html = '<table style="width:100%;border-collapse:collapse;font-size:11px;"><thead><tr style="border-bottom:1px solid rgba(203,213,225,1);">';
  html += '<th style="text-align:left;padding:6px 8px;color:#64748b;">姓名</th>';
  html += '<th style="text-align:left;padding:6px 8px;color:#64748b;">角色</th>';
  html += '<th style="text-align:right;padding:6px 8px;color:#64748b;">期望时薪</th>';
  html += '<th style="text-align:center;padding:6px 8px;color:#64748b;">士气</th>';
  html += '<th style="text-align:center;padding:6px 8px;color:#64748b;">技能</th>';
  html += '<th style="text-align:center;padding:6px 8px;color:#64748b;">录用到</th>';
  html += '</tr></thead><tbody>';
  candidates.forEach(function(c,i){
    var moraleColor = c.morale > 80 ? '#4ade80' : c.morale > 30 ? '#fbbf24' : '#f87171';
    var ownedOutlets = gameState.outlets.filter(function(o){ return o.owned; });
    var opts = ownedOutlets.map(function(o){ return '<option value="'+o.id+'">'+OUTLET_CONFIGS.find(function(c){return c.id===o.id;}).name+'</option>'; }).join('');
    html += '<tr style="border-bottom:1px solid rgba(226,232,240,0.6);">';
    html += '<td style="padding:6px 8px;color:#94a3b8;">'+c.name+'</td>';
    html += '<td style="padding:6px 8px;"><span style="padding:2px 6px;border-radius:4px;font-size:10px;background:rgba(52,152,219,0.15);color:#3498db;">'+c.type+'</span></td>';
    html += '<td style="padding:6px 8px;text-align:right;color:#64748b;">$'+c.salary+'/h</td>';
    html += '<td style="padding:6px 8px;text-align:center;color:'+moraleColor+';">'+c.morale+'</td>';
    html += '<td style="padding:6px 8px;text-align:center;color:#64748b;">'+c.skillLevel+'</td>';
    html += '<td style="padding:6px 8px;text-align:center;"><select id="talentOutlet_'+i+'" style="padding:4px 6px;background:rgba(226,232,240,0.8);border:1px solid rgba(203,213,225,1);border-radius:4px;color:#1e293b;font-size:10px;min-height:30px;">'+opts+'</select><button class="action-btn btn-buy" style="padding:2px 8px;font-size:9px;margin-left:4px;" onclick="hireCandidate('+i+')">录用$2K</button></td>';
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
  var tabs = '<div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;">';
  var tabDefs = [{key:'overview',label:'📑 概览'},{key:'pnl',label:'📊 损益表'},{key:'balance',label:'📋 资产负债'},{key:'cashflow',label:'💸 现金流'},{key:'loans',label:'🏦 贷款'},{key:'stocks',label:'📈 股票'}];
  tabDefs.forEach(function(t){
    tabs += '<button style="padding:8px 14px;border:none;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;min-height:36px;'+(financeTab===t.key?'background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;':'background:rgba(241,245,249,1);color:#475569;border:1px solid rgba(203,213,225,1);')+'" onclick="switchFinanceTab(\''+t.key+'\')">'+t.label+'</button>';
  });
  tabs += '</div>';
  var body = '';
  if (financeTab === 'overview') body = renderOverview();
  else if (financeTab === 'pnl') body = renderPnL();
  else if (financeTab === 'balance') body = renderBalanceSheet();
  else if (financeTab === 'cashflow') body = renderCashFlow();
  else if (financeTab === 'loans') body = renderLoans();
  else if (financeTab === 'stocks') body = renderStocks();
  content.innerHTML = tabs + body;
}
function _aggDetail(period) {
  var f = gameState.financials;
  if (!f || !f.todayDetail) return { rentalIncome:0, serviceIncome:0, adBonusIncome:0, vehicleSales:0, investmentIncome:0, fuelCost:0, maintenanceCost:0, wages:0, energyCost:0, facilityMaint:0, advertisingCost:0, loanInterest:0, taxes:0, vehiclePurchases:0, stockPurchases:0, stockSales:0, loanProceeds:0, loanRepayments:0 };
  if (period === 'today') {
    var td = f.todayDetail;
    return { rentalIncome:td.rentalIncome||0, serviceIncome:td.serviceIncome||0, adBonusIncome:td.adBonusIncome||0, vehicleSales:td.vehicleSales||0, investmentIncome:td.investmentIncome||0, fuelCost:td.fuelCost||0, maintenanceCost:td.maintenance||0, wages:td.wages||0, energyCost:td.energyCost||0, facilityMaint:td.facilityMaint||0, advertisingCost:td.advertisingCost||0, loanInterest:td.loanInterest||0, taxes:td.taxes||0, vehiclePurchases:td.vehiclePurchases||0, stockPurchases:td.stockPurchases||0, stockSales:td.stockSales||0, loanProceeds:td.loanProceeds||0, loanRepayments:td.loanRepayments||0 };
  }
  var days = period === 'month' ? Math.min((f.dailyDetails||[]).length, 30) : (f.dailyDetails||[]).length;
  var startIdx = (f.dailyDetails||[]).length - days;
  var result = { rentalIncome:0, serviceIncome:0, adBonusIncome:0, vehicleSales:0, investmentIncome:0, fuelCost:0, maintenanceCost:0, wages:0, energyCost:0, facilityMaint:0, advertisingCost:0, loanInterest:0, taxes:0, vehiclePurchases:0, stockPurchases:0, stockSales:0, loanProceeds:0, loanRepayments:0 };
  for (var i = startIdx; i < (f.dailyDetails||[]).length; i++) {
    var d = f.dailyDetails[i];
    result.rentalIncome += d.rentalIncome||0; result.serviceIncome += d.serviceIncome||0; result.adBonusIncome += d.adBonusIncome||0;
    result.vehicleSales += d.vehicleSales||0; result.investmentIncome += d.investmentIncome||0;
    result.fuelCost += d.fuelCost||0; result.maintenanceCost += d.maintenance||0; result.wages += d.wages||0;
    result.energyCost += d.energyCost||0; result.facilityMaint += d.facilityMaint||0; result.advertisingCost += d.advertisingCost||0;
    result.loanInterest += d.loanInterest||0; result.taxes += d.taxes||0;
    result.vehiclePurchases += d.vehiclePurchases||0; result.stockPurchases += d.stockPurchases||0; result.stockSales += d.stockSales||0;
    result.loanProceeds += d.loanProceeds||0; result.loanRepayments += d.loanRepayments||0;
  }
  return result;
}
function _fmt(v) { return formatCurrency(Math.round(v)); }
function _fc(v,c) { return '<span style="color:'+c+';font-weight:600;">'+_fmt(v)+'</span>'; }
function _finRow(label,t,m,total,labelStyle,valStyle,isSection,isTotal) {
  var ls = labelStyle || 'color:#1e293b;font-size:12px;';
  var vs = valStyle || '';
  var cls = isSection ? 'background:rgba(241,245,249,1);font-weight:700;' : (isTotal ? 'font-weight:700;border-top:2px solid rgba(226,232,240,0.6);' : '');
  var bg = isSection ? 'background:rgba(248,250,252,1);' : (total%2===0 ? 'background:#ffffff;' : 'background:rgba(248,250,252,0.4);');
  var pl = isSection ? '28px' : (label.indexOf('  ')===0?'40px':'16px');
  return '<tr style="'+bg+cls+'">'+
    '<td style="padding:7px '+pl+' 7px 16px;font-size:11px;'+ls+(isSection?'':'border-bottom:1px solid rgba(226,232,240,0.4);')+'">'+label+'</td>'+
    '<td style="padding:7px 12px;text-align:right;font-size:11px;'+vs+(isSection?'':'border-bottom:1px solid rgba(226,232,240,0.4);')+'">'+(t>=0?_fc(t,'#059669'):_fc(t,'#dc2626'))+'</td>'+
    '<td style="padding:7px 12px;text-align:right;font-size:11px;'+vs+(isSection?'':'border-bottom:1px solid rgba(226,232,240,0.4);')+'">'+(m>=0?_fc(m,'#059669'):_fc(m,'#dc2626'))+'</td>'+
    '<td style="padding:7px 12px;text-align:right;font-size:11px;'+vs+(isSection?'':'border-bottom:1px solid rgba(226,232,240,0.4);')+'">'+(total>=0?_fc(total,'#059669'):_fc(total,'#dc2626'))+'</td></tr>';
}
function _secRow(label) {
  return '<tr style="background:rgba(241,245,249,1);"><td colspan="4" style="padding:9px 16px;font-size:13px;font-weight:700;color:#1e293b;border-bottom:2px solid rgba(226,232,240,0.6);">'+label+'</td></tr>';
}
function renderOverview() {
  var today = getPnL('today');
  var month = getPnL('month');
  var total = getPnL('total');
  var td = _aggDetail('today');
  var html = '';
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px;">';
  [{label:'今日',data:today},{label:'本月(30天)',data:month},{label:'累计',data:total}].forEach(function(p){
    var profitColor = p.data.netProfit >= 0 ? '#059669' : '#dc2626';
    html += '<div style="background:#ffffff;border-radius:10px;padding:14px;border:1px solid rgba(226,232,240,0.6);">';
    html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:10px;">'+p.label+'</div>';
    html += '<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(226,232,240,0.4);"><span style="font-size:11px;color:#475569;">营业收入</span><span style="font-size:11px;font-weight:600;color:#059669;">'+_fmt(p.data.revenue)+'</span></div>';
    html += '<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(226,232,240,0.4);"><span style="font-size:11px;color:#475569;">营业支出</span><span style="font-size:11px;font-weight:600;color:#dc2626;">'+_fmt(p.data.expenses)+'</span></div>';
    html += '<div style="display:flex;justify-content:space-between;padding:8px 0 0;"><span style="font-size:12px;font-weight:700;color:#1e293b;">净利润</span><span style="font-size:13px;font-weight:700;color:'+profitColor+';">'+_fmt(p.data.netProfit)+'</span></div>';
    html += '</div>';
  });
  html += '</div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">';
  html += '<div style="background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid rgba(226,232,240,0.6);">';
  html += '<div style="padding:10px 14px;background:rgba(241,245,249,1);border-bottom:1px solid rgba(226,232,240,0.6);"><span style="font-size:12px;font-weight:700;color:#1e293b;">📈 收入明细 (今日)</span></div>';
  html += '<table style="width:100%;border-collapse:collapse;"><tbody>';
  var incomeItems = [
    {label:'租车收入',val:td.rentalIncome},
    {label:'增值服务收入',val:td.serviceIncome},
    {label:'广告加成收入',val:td.adBonusIncome},
    {label:'车辆出售收入',val:td.vehicleSales},
    {label:'投资收益',val:td.investmentIncome}
  ];
  incomeItems.forEach(function(item,idx){
    var bg = idx%2===0?'#ffffff':'rgba(248,250,252,0.4)';
    html += '<tr style="'+bg+'"><td style="padding:6px 14px;font-size:11px;color:#475569;border-bottom:1px solid rgba(226,232,240,0.4);">'+item.label+'</td><td style="padding:6px 14px;text-align:right;font-size:11px;font-weight:600;color:#059669;border-bottom:1px solid rgba(226,232,240,0.4);">'+_fmt(item.val)+'</td></tr>';
  });
  var totalInc = td.rentalIncome+td.serviceIncome+td.adBonusIncome+td.vehicleSales+td.investmentIncome;
  html += '<tr style="border-top:2px solid rgba(226,232,240,0.6);"><td style="padding:7px 14px;font-size:11px;font-weight:700;color:#1e293b;">收入合计</td><td style="padding:7px 14px;text-align:right;font-size:11px;font-weight:700;color:#059669;">'+_fmt(totalInc)+'</td></tr>';
  html += '</tbody></table></div>';
  html += '<div style="background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid rgba(226,232,240,0.6);">';
  html += '<div style="padding:10px 14px;background:rgba(241,245,249,1);border-bottom:1px solid rgba(226,232,240,0.6);"><span style="font-size:12px;font-weight:700;color:#1e293b;">📉 支出明细 (今日)</span></div>';
  html += '<table style="width:100%;border-collapse:collapse;"><tbody>';
  var expenseItems = [
    {label:'员工工资',val:td.wages},
    {label:'燃油成本',val:td.fuelCost},
    {label:'维护保养',val:td.maintenanceCost},
    {label:'能源采购',val:td.energyCost},
    {label:'设施维护费',val:td.facilityMaint},
    {label:'广告支出',val:td.advertisingCost},
    {label:'贷款利息',val:td.loanInterest},
    {label:'税金',val:td.taxes}
  ];
  expenseItems.forEach(function(item,idx){
    var bg = idx%2===0?'#ffffff':'rgba(248,250,252,0.4)';
    html += '<tr style="'+bg+'"><td style="padding:6px 14px;font-size:11px;color:#475569;border-bottom:1px solid rgba(226,232,240,0.4);">'+item.label+'</td><td style="padding:6px 14px;text-align:right;font-size:11px;font-weight:600;color:#dc2626;border-bottom:1px solid rgba(226,232,240,0.4);">'+_fmt(item.val)+'</td></tr>';
  });
  var totalExp = td.wages+td.fuelCost+td.maintenanceCost+td.energyCost+td.facilityMaint+td.advertisingCost+td.loanInterest+td.taxes;
  html += '<tr style="border-top:2px solid rgba(226,232,240,0.6);"><td style="padding:7px 14px;font-size:11px;font-weight:700;color:#1e293b;">支出合计</td><td style="padding:7px 14px;text-align:right;font-size:11px;font-weight:700;color:#dc2626;">'+_fmt(totalExp)+'</td></tr>';
  html += '</tbody></table></div>';
  html += '</div>';
  var netProfitToday = totalInc - totalExp;
  html += '<div style="margin-top:10px;background:#ffffff;border-radius:10px;padding:14px;border:1px solid rgba(226,232,240,0.6);display:flex;justify-content:space-between;align-items:center;">';
  html += '<span style="font-size:13px;font-weight:700;color:#1e293b;">📊 今日净利润</span>';
  html += '<span style="font-size:18px;font-weight:700;color:'+(netProfitToday>=0?'#059669':'#dc2626')+';">'+_fmt(netProfitToday)+'</span>';
  html += '</div>';
  return html;
}
function renderPnL() {
  var t = _aggDetail('today');
  var m = _aggDetail('month');
  var tt = _aggDetail('total');
  var html = '';
  html += '<div style="background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid rgba(226,232,240,0.6);">';
  html += '<table style="width:100%;border-collapse:collapse;">';
  html += '<thead><tr style="background:rgba(241,245,249,1);">';
  html += '<th style="padding:10px 16px;text-align:left;font-size:12px;font-weight:700;color:#1e293b;border-bottom:2px solid rgba(226,232,240,0.6);">项目</th>';
  html += '<th style="padding:10px 12px;text-align:right;font-size:12px;font-weight:700;color:#1e293b;border-bottom:2px solid rgba(226,232,240,0.6);width:18%;">今日</th>';
  html += '<th style="padding:10px 12px;text-align:right;font-size:12px;font-weight:700;color:#1e293b;border-bottom:2px solid rgba(226,232,240,0.6);width:22%;">本月(30天)</th>';
  html += '<th style="padding:10px 12px;text-align:right;font-size:12px;font-weight:700;color:#1e293b;border-bottom:2px solid rgba(226,232,240,0.6);width:22%;">累计</th>';
  html += '</tr></thead><tbody>';
  var rn=0;
  html += _secRow('一、营业收入');
  html += _finRow('  租车收入', t.rentalIncome, m.rentalIncome, tt.rentalIncome, 'color:#475569;', '', false, rn++);
  html += _finRow('  增值服务收入', t.serviceIncome, m.serviceIncome, tt.serviceIncome, 'color:#475569;', '', false, rn++);
  html += _finRow('  广告加成收入', t.adBonusIncome, m.adBonusIncome, tt.adBonusIncome, 'color:#475569;', '', false, rn++);
  html += _finRow('  车辆出售收入', t.vehicleSales, m.vehicleSales, tt.vehicleSales, 'color:#475569;', '', false, rn++);
  html += _finRow('  投资收益', t.investmentIncome, m.investmentIncome, tt.investmentIncome, 'color:#475569;', '', false, rn++);
  var tRev=t.rentalIncome+t.serviceIncome+t.adBonusIncome+t.vehicleSales+t.investmentIncome;
  var mRev=m.rentalIncome+m.serviceIncome+m.adBonusIncome+m.vehicleSales+m.investmentIncome;
  var ttRev=tt.rentalIncome+tt.serviceIncome+tt.adBonusIncome+tt.vehicleSales+tt.investmentIncome;
  html += _finRow('营业收入合计', tRev, mRev, ttRev, 'color:#1e293b;font-weight:700;', '', true, rn++);
  rn++;
  html += _secRow('二、营业成本');
  html += _finRow('  燃油成本', t.fuelCost, m.fuelCost, tt.fuelCost, 'color:#475569;', '', false, rn++);
  html += _finRow('  维护保养成本', t.maintenanceCost, m.maintenanceCost, tt.maintenanceCost, 'color:#475569;', '', false, rn++);
  html += _finRow('  员工工资', t.wages, m.wages, tt.wages, 'color:#475569;', '', false, rn++);
  html += _finRow('  能源采购成本', t.energyCost, m.energyCost, tt.energyCost, 'color:#475569;', '', false, rn++);
  html += _finRow('  设施维护费', t.facilityMaint, m.facilityMaint, tt.facilityMaint, 'color:#475569;', '', false, rn++);
  html += _finRow('  广告支出', -t.advertisingCost, -m.advertisingCost, -tt.advertisingCost, 'color:#475569;', '', false, rn++);
  var tExp=t.fuelCost+t.maintenanceCost+t.wages+t.energyCost+t.facilityMaint+t.advertisingCost;
  var mExp=m.fuelCost+m.maintenanceCost+m.wages+m.energyCost+m.facilityMaint+m.advertisingCost;
  var ttExp=tt.fuelCost+tt.maintenanceCost+tt.wages+tt.energyCost+tt.facilityMaint+tt.advertisingCost;
  html += _finRow('营业成本合计', -tExp, -mExp, -ttExp, 'color:#1e293b;font-weight:700;', '', true, rn++);
  rn++;
  html += _secRow('三、财务费用');
  html += _finRow('  贷款利息', -t.loanInterest, -m.loanInterest, -tt.loanInterest, 'color:#475569;', '', false, rn++);
  html += _finRow('  税金', -t.taxes, -m.taxes, -tt.taxes, 'color:#475569;', '', false, rn++);
  var tFin=t.loanInterest+t.taxes;
  var mFin=m.loanInterest+m.taxes;
  var ttFin=tt.loanInterest+tt.taxes;
  html += _finRow('财务费用合计', -tFin, -mFin, -ttFin, 'color:#1e293b;font-weight:700;', '', true, rn++);
  rn++;
  html += _secRow('四、营业利润（亏损）');
  var tOp=tRev-tExp-tFin;
  var mOp=mRev-mExp-mFin;
  var ttOp=ttRev-ttExp-ttFin;
  html += _finRow('营业利润', tOp, mOp, ttOp, 'color:#1e293b;font-size:13px;', 'font-size:13px;', true, 0);
  html += '</tbody></table></div>';
  if (typeof gameState.financials !== 'undefined' && gameState.financials.dailyProfit.length > 0) {
    html += '<div style="margin-top:14px;"><div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:8px;">利润走势(近30天)</div>';
    html += '<canvas id="profitChartCanvas" width="560" height="160" style="width:100%;max-width:560px;height:160px;"></canvas></div>';
    setTimeout(drawProfitChart, 50);
  }
  return html;
}

var progressionTab = 'achievements';
function openProgressionModal() {
  progressionTab = 'achievements';
  document.getElementById('progressionModal').classList.add('active');
  renderProgressionModal();
}
function closeProgressionModal() {
  document.getElementById('progressionModal').classList.remove('active');
}
function switchProgressionTab(tab) {
  progressionTab = tab;
  renderProgressionModal();
}
function renderProgressionModal() {
  if (typeof initProgressionState === 'function') initProgressionState();
  var content = document.getElementById('progressionContent');
  var tabs = [
    { id:'achievements', name:'🏆 成就', color:'#fbbf24' },
    { id:'techtree', name:'🔬 科技', color:'#3b82f6' },
    { id:'rivals', name:'⚔️ 竞争', color:'#ef4444' },
    { id:'daily', name:'📋 挑战', color:'#4ade80' },
    { id:'prestige', name:'✨ 重生', color:'#a855f7' }
  ];
  var html = '<div style="display:flex;gap:4px;margin-bottom:14px;flex-wrap:wrap;">';
  tabs.forEach(function(t) {
    var active = progressionTab === t.id;
    html += '<button style="padding:6px 12px;border:none;border-radius:6px;font-size:10px;font-weight:700;cursor:pointer;min-height:32px;background:' + (active ? t.color : 'rgba(241,245,249,1)') + ';color:' + (active ? '#fff' : '#64748b') + ';" onclick="switchProgressionTab(\'' + t.id + '\')">' + t.name + '</button>';
  });
  html += '</div>';
  if (progressionTab === 'achievements') html += renderAchievementsTab();
  else if (progressionTab === 'techtree') html += renderTechTreeTab();
  else if (progressionTab === 'rivals') html += renderRivalsTab();
  else if (progressionTab === 'daily') html += renderDailyTab();
  else if (progressionTab === 'prestige') html += renderPrestigeTab();
  content.innerHTML = html;
}

function renderAchievementsTab() {
  var prog = typeof getAchievementProgress === 'function' ? getAchievementProgress() : {total:0,unlocked:0,claimed:0};
  var html = '<div style="display:flex;gap:12px;margin-bottom:14px;align-items:center;">';
  html += '<div style="font-size:24px;font-weight:700;color:#fbbf24;">' + prog.unlocked + '/' + prog.total + '</div>';
  html += '<div><div style="font-size:11px;color:#fff;">成就解锁</div><div style="font-size:9px;color:#94a3b8;">已领取 ' + prog.claimed + ' 个奖励</div></div>';
  html += '<div style="flex:1;height:6px;background:rgba(226,232,240,1);border-radius:3px;overflow:hidden;"><div style="width:' + (prog.total>0?Math.round(prog.unlocked/prog.total*100):0) + '%;height:100%;background:linear-gradient(90deg,#fbbf24,#f59e0b);border-radius:3px;"></div></div>';
  html += '</div>';
  var cats = typeof ACHIEVEMENT_CATEGORIES !== 'undefined' ? ACHIEVEMENT_CATEGORIES : {};
  Object.keys(cats).forEach(function(catKey) {
    var cat = cats[catKey];
    var catAchs = (typeof ACHIEVEMENTS !== 'undefined' ? ACHIEVEMENTS : []).filter(function(a){ return a.cat === catKey; });
    html += '<div style="margin-bottom:14px;"><div style="font-size:12px;font-weight:700;color:' + cat.color + ';margin-bottom:8px;">' + cat.icon + ' ' + cat.name + '</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;">';
    catAchs.forEach(function(a) {
      var record = (gameState.achievements || {})[a.id];
      var unlocked = !!record;
      var claimed = record && record.claimed;
      html += '<div style="background:' + (unlocked ? 'rgba(241,245,249,1)' : 'rgba(241,245,249,0.5)') + ';border:1px solid ' + (unlocked ? cat.color + '40' : 'rgba(241,245,249,1)') + ';border-radius:8px;padding:10px;' + (unlocked ? '' : 'opacity:0.5;') + '">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;"><span style="font-size:14px;">' + a.icon + '</span>';
      if (claimed) html += '<span style="font-size:8px;color:#4ade80;">已领取</span>';
      else if (unlocked) html += '<button style="padding:2px 8px;border:none;border-radius:4px;font-size:8px;font-weight:700;cursor:pointer;background:' + cat.color + ';color:#fff;" onclick="claimAchievement(\'' + a.id + '\');renderProgressionModal();">领取</button>';
      html += '</div>';
      html += '<div style="font-size:11px;font-weight:600;color:#fff;">' + a.name + '</div>';
      html += '<div style="font-size:9px;color:#94a3b8;">' + a.desc + '</div>';
      if (a.reward.cash) html += '<div style="font-size:8px;color:#4ade80;margin-top:2px;">奖励: ' + formatCurrency(a.reward.cash) + '</div>';
      if (a.reward.reputation) html += '<div style="font-size:8px;color:#fbbf24;">声誉+' + a.reward.reputation + '</div>';
      html += '</div>';
    });
    html += '</div></div>';
  });
  return html;
}

function renderTechTreeTab() {
  var branches = typeof TECH_TREE !== 'undefined' ? TECH_TREE.branches : {};
  var html = '';
  if (gameState.techResearching) {
    var rt = gameState.techResearching;
    var pct = rt.totalDays > 0 ? Math.round((1 - rt.remaining / rt.totalDays) * 100) : 100;
    html += '<div style="background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.3);border-radius:8px;padding:12px;margin-bottom:14px;">';
    html += '<div style="font-size:11px;color:#60a5fa;font-weight:700;">🔬 研究中: ' + rt.id + '</div>';
    html += '<div style="margin-top:6px;height:8px;background:rgba(226,232,240,1);border-radius:4px;overflow:hidden;"><div style="width:' + pct + '%;height:100%;background:linear-gradient(90deg,#3b82f6,#6366f1);border-radius:4px;"></div></div>';
    html += '<div style="font-size:9px;color:#94a3b8;margin-top:4px;">剩余 ' + rt.remaining + ' 天 (' + pct + '%)</div>';
    html += '</div>';
  }
  Object.keys(branches).forEach(function(bk) {
    var branch = branches[bk];
    html += '<div style="margin-bottom:16px;"><div style="font-size:12px;font-weight:700;color:' + branch.color + ';margin-bottom:8px;">' + branch.icon + ' ' + branch.name + '</div>';
    html += '<div style="display:flex;gap:6px;flex-wrap:wrap;">';
    branch.techs.forEach(function(tech, idx) {
      var researched = gameState.techResearched && gameState.techResearched[tech.id];
      var researching = gameState.techResearching && gameState.techResearching.id === tech.id;
      var canResearch = !researched && !researching && (!tech.requires || tech.requires.every(function(r){ return gameState.techResearched && gameState.techResearched[r]; }));
      var locked = !researched && !researching && !canResearch;
      html += '<div style="background:' + (researched ? branch.color + '20' : 'rgba(241,245,249,0.8)') + ';border:1px solid ' + (researched ? branch.color + '60' : researching ? '#3b82f6' : 'rgba(203,213,225,0.8)') + ';border-radius:8px;padding:10px;min-width:140px;' + (locked ? 'opacity:0.4;' : '') + '">';
      if (idx > 0) html += '<div style="font-size:8px;color:#cbd5e1;margin-bottom:2px;">↑ 前置</div>';
      html += '<div style="font-size:11px;font-weight:700;color:#fff;">' + tech.name + '</div>';
      html += '<div style="font-size:9px;color:#64748b;margin:2px 0;">' + tech.desc + '</div>';
      html += '<div style="font-size:8px;color:#94a3b8;">费用 ' + formatCurrency(tech.cost) + ' · ' + tech.researchDays + '天</div>';
      if (researched) html += '<div style="font-size:9px;color:#4ade80;font-weight:700;margin-top:4px;">✓ 已完成</div>';
      else if (researching) html += '<div style="font-size:9px;color:#3b82f6;font-weight:700;margin-top:4px;">⏳ 研究中</div>';
      else if (canResearch) html += '<button style="margin-top:4px;padding:4px 8px;border:none;border-radius:4px;font-size:9px;font-weight:700;cursor:pointer;background:' + branch.color + ';color:#fff;" onclick="startResearch(\'' + tech.id + '\');renderProgressionModal();">' + (gameState.cash >= tech.cost ? '研究' : '资金不足') + '</button>';
      else html += '<div style="font-size:9px;color:#94a3b8;margin-top:4px;">🔒 需前置</div>';
      html += '</div>';
    });
    html += '</div></div>';
  });
  return html;
}

function renderRivalsTab() {
  var rivals = gameState.rivals || [];
  var html = '<div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:10px;">⚔️ 竞争对手</div>';
  html += '<div style="font-size:10px;color:#64748b;margin-bottom:14px;">竞争对手每周成长，抢夺市场份额。保持优势！</div>';
  rivals.forEach(function(r) {
    var info = typeof getRivalInfo === 'function' ? getRivalInfo(r.id) : null;
    if (!info) return;
    var strengthPct = Math.round(r.strength * 100);
    html += '<div style="background:rgba(248,250,252,1);border:1px solid ' + info.color + '30;border-radius:10px;padding:14px;margin-bottom:8px;">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">';
    html += '<div><span style="font-size:16px;">' + info.icon + '</span> <span style="font-size:13px;font-weight:700;color:#fff;">' + info.name + '</span> <span style="font-size:9px;color:#94a3b8;">(' + info.style + ')</span></div>';
    html += '<span style="font-size:10px;color:' + info.color + ';font-weight:700;">实力 ' + strengthPct + '%</span>';
    html += '</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">';
    html += '<div style="text-align:center;"><div style="font-size:14px;font-weight:700;color:#fff;">' + r.vehicles + '</div><div style="font-size:9px;color:#94a3b8;">车辆</div></div>';
    html += '<div style="text-align:center;"><div style="font-size:14px;font-weight:700;color:#fff;">' + Math.round(r.marketShare * 100) + '%</div><div style="font-size:9px;color:#94a3b8;">市场份额</div></div>';
    html += '<div style="text-align:center;"><div style="font-size:14px;font-weight:700;color:#fff;">' + r.reputation + '</div><div style="font-size:9px;color:#94a3b8;">声誉</div></div>';
    html += '</div>';
    html += '<div style="margin-top:8px;height:4px;background:rgba(226,232,240,1);border-radius:2px;overflow:hidden;"><div style="width:' + strengthPct + '%;height:100%;background:' + info.color + ';border-radius:2px;"></div></div>';
    html += '</div>';
  });
  var myShare = Math.max(0, 1 - rivals.reduce(function(s,r){return s+r.marketShare;},0));
  html += '<div style="background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.3);border-radius:10px;padding:14px;text-align:center;">';
  html += '<div style="font-size:11px;color:#4ade80;font-weight:700;">你的市场份额</div>';
  html += '<div style="font-size:28px;font-weight:700;color:#4ade80;">' + Math.round(myShare * 100) + '%</div>';
  html += '</div>';
  return html;
}

function renderDailyTab() {
  var html = '<div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:10px;">📋 每日挑战</div>';
  var ch = gameState.dailyChallenge;
  if (!ch) {
    html += '<div style="text-align:center;padding:20px;color:#94a3b8;font-size:12px;">今日暂无挑战</div>';
  } else {
    var pct = ch.target > 0 ? Math.min(100, Math.round(ch.progress / ch.target * 100)) : 0;
    html += '<div style="background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.2);border-radius:10px;padding:14px;">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">';
    html += '<div style="font-size:12px;font-weight:700;color:#fff;">' + ch.desc + '</div>';
    html += '<span style="font-size:9px;padding:2px 8px;border-radius:4px;background:' + (ch.completed ? 'rgba(74,222,128,0.2);color:#4ade80' : 'rgba(251,191,36,0.2);color:#fbbf24') + ';">' + (ch.completed ? '已完成' : '进行中') + '</span>';
    html += '</div>';
    html += '<div style="height:8px;background:rgba(226,232,240,1);border-radius:4px;overflow:hidden;margin-bottom:6px;"><div style="width:' + pct + '%;height:100%;background:linear-gradient(90deg,#4ade80,#22c55e);border-radius:4px;"></div></div>';
    html += '<div style="display:flex;justify-content:space-between;font-size:9px;color:#94a3b8;">';
    html += '<span>进度: ' + ch.progress + '/' + ch.target + '</span><span>' + pct + '%</span></div>';
    if (ch.reward.cash) html += '<div style="font-size:9px;color:#4ade80;margin-top:4px;">奖励: ' + formatCurrency(ch.reward.cash) + '</div>';
    if (ch.reward.reputation) html += '<div style="font-size:9px;color:#fbbf24;">声誉+' + ch.reward.reputation + '</div>';
    if (ch.completed && !ch.claimed) html += '<button style="margin-top:8px;padding:6px 14px;border:none;border-radius:6px;font-size:10px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#4ade80,#22c55e);color:#fff;" onclick="claimDailyChallenge();renderProgressionModal();">领取奖励</button>';
    if (ch.claimed) html += '<div style="margin-top:8px;font-size:9px;color:#4ade80;">✓ 已领取</div>';
    html += '</div>';
  }
  if (gameState.storyEventActive) {
    var evt = gameState.storyEventActive;
    html += '<div style="margin-top:14px;background:rgba(244,114,182,0.1);border:1px solid rgba(244,114,182,0.3);border-radius:10px;padding:14px;">';
    html += '<div style="font-size:13px;font-weight:700;color:#f472b6;margin-bottom:6px;">' + evt.icon + ' ' + evt.name + '</div>';
    html += '<div style="font-size:11px;color:#475569;margin-bottom:10px;">' + evt.desc + '</div>';
    evt.choices.forEach(function(c, i) {
      html += '<button style="display:block;width:100%;text-align:left;padding:8px 12px;margin-bottom:4px;border:1px solid rgba(203,213,225,1);border-radius:6px;background:rgba(248,250,252,1);color:#fff;font-size:10px;cursor:pointer;" onclick="resolveStoryEvent(' + i + ');renderProgressionModal();">' + c.text + (c.cost > 0 ? ' <span style="color:#f87171;">(-' + formatCurrency(c.cost) + ')</span>' : '') + '</button>';
    });
    html += '<button style="margin-top:4px;padding:4px 8px;border:none;border-radius:4px;font-size:9px;cursor:pointer;background:rgba(241,245,249,1);color:#94a3b8;" onclick="dismissStoryEvent();renderProgressionModal();">忽略</button>';
    html += '</div>';
  }
  return html;
}

function renderPrestigeTab() {
  var canP = typeof canPrestige === 'function' ? canPrestige() : false;
  var points = typeof getPrestigePointsEarned === 'function' ? getPrestigePointsEarned() : 0;
  var html = '<div style="text-align:center;margin-bottom:16px;">';
  html += '<div style="font-size:36px;font-weight:700;color:#a855f7;">Lv.' + (gameState.prestigeLevel || 0) + '</div>';
  html += '<div style="font-size:11px;color:#64748b;">声望等级 · 可用点数: <span style="color:#a855f7;font-weight:700;">' + (gameState.prestigePoints || 0) + '</span></div>';
  html += '</div>';
  html += '<div style="background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.2);border-radius:10px;padding:14px;margin-bottom:14px;text-align:center;">';
  html += '<div style="font-size:11px;color:#a855f7;font-weight:700;margin-bottom:6px;">🔄 声望重生</div>';
  html += '<div style="font-size:10px;color:#64748b;margin-bottom:8px;">重置游戏进度，获得永久声望加成</div>';
  html += '<div style="font-size:10px;color:#94a3b8;margin-bottom:4px;">条件: 声誉≥80 且 经营≥100天</div>';
  html += '<div style="font-size:10px;color:#94a3b8;margin-bottom:8px;">预计获得: <span style="color:#a855f7;font-weight:700;">' + points + '</span> 声望点数</div>';
  html += '<button style="padding:8px 20px;border:none;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;background:' + (canP ? 'linear-gradient(135deg,#a855f7,#7c3aed)' : 'rgba(226,232,240,1)') + ';color:' + (canP ? '#fff' : '#94a3b8') + ';" onclick="if(confirm(' + "'" + '确定要声望重生吗？这将重置大部分游戏进度！' + "'" + ')){doPrestige();renderProgressionModal();}" ' + (!canP ? 'disabled' : '') + '>🔄 声望重生</button>';
  html += '</div>';
  html += '<div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:8px;">✨ 声望天赋</div>';
  var perks = typeof PRESTIGE_PERKS !== 'undefined' ? PRESTIGE_PERKS : [];
  html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;">';
  perks.forEach(function(perk) {
    var owned = (gameState.prestigePerks || []).indexOf(perk.id) !== -1;
    var canBuy = !owned && gameState.prestigePoints >= perk.cost;
    var requiresMet = !perk.requires || perk.requires.every(function(r){ return (gameState.prestigePerks||[]).indexOf(r)!==-1; });
    var locked = !owned && !requiresMet;
    html += '<div style="background:' + (owned ? 'rgba(168,85,247,0.15)' : 'rgba(241,245,249,0.8)') + ';border:1px solid ' + (owned ? 'rgba(168,85,247,0.4)' : 'rgba(203,213,225,0.8)') + ';border-radius:8px;padding:10px;' + (locked ? 'opacity:0.4;' : '') + '">';
    html += '<div style="font-size:11px;font-weight:700;color:#fff;">' + perk.name + '</div>';
    html += '<div style="font-size:9px;color:#64748b;margin:2px 0;">' + perk.desc + '</div>';
    html += '<div style="font-size:8px;color:#a855f7;">费用: ' + perk.cost + ' 点</div>';
    if (owned) html += '<div style="font-size:9px;color:#4ade80;font-weight:700;margin-top:4px;">✓ 已解锁</div>';
    else if (canBuy && requiresMet) html += '<button style="margin-top:4px;padding:3px 8px;border:none;border-radius:4px;font-size:8px;font-weight:700;cursor:pointer;background:#a855f7;color:#fff;" onclick="purchasePrestigePerk(\'' + perk.id + '\');renderProgressionModal();">解锁</button>';
    else if (!requiresMet) html += '<div style="font-size:8px;color:#94a3b8;margin-top:4px;">🔒 需前置</div>';
    html += '</div>';
  });
  html += '</div>';
  return html;
}
function _bsRow(label,value,labelStyle,valStyle,isSection,isTotal,isSub) {
  var ls = labelStyle || 'color:#475569;font-size:11px;';
  var vs = valStyle || '';
  var cls = isTotal ? 'font-weight:700;border-top:2px solid rgba(226,232,240,0.6);' : (isSection ? 'font-weight:700;' : '');
  var bg = isSection ? 'background:rgba(248,250,252,1);' : (isSub ? 'background:rgba(248,250,252,0.3);' : '#ffffff');
  var pl = isSection ? '16px' : (isSub ? '36px' : '20px');
  return '<tr style="'+bg+cls+'">'+
    '<td style="padding:6px '+pl+' 6px 16px;font-size:11px;'+ls+(isSection?'':'border-bottom:1px solid rgba(226,232,240,0.4);')+'">'+label+'</td>'+
    '<td style="padding:6px 16px;text-align:right;font-size:11px;'+vs+(isSection?'':'border-bottom:1px solid rgba(226,232,240,0.4);')+'">'+(value>=0?_fc(value,'#059669'):_fc(value,'#dc2626'))+'</td></tr>';
}
function _bsSecRow(label) {
  return '<tr style="background:rgba(241,245,249,1);"><td colspan="2" style="padding:8px 16px;font-size:12px;font-weight:700;color:#1e293b;border-bottom:2px solid rgba(226,232,240,0.6);">'+label+'</td></tr>';
}
function _bsSubRow(label) {
  return '<tr style="background:rgba(248,250,252,0.5);"><td colspan="2" style="padding:5px 16px 5px 32px;font-size:11px;font-weight:600;color:#64748b;">'+label+'</td></tr>';
}
function renderBalanceSheet() {
  var cash = gameState.cash || 0;
  var vehicleValue = 0;
  (gameState.ownedVehicles||[]).forEach(function(v) {
    var age = v.age || 0;
    var basePrice = v.purchasePrice || v.estimatedValue || 200000;
    vehicleValue += basePrice * Math.pow(0.95, age);
  });
  vehicleValue = Math.round(vehicleValue);
  var oilVal = 0, elecVal = 0, oilQty = 0, elecQty = 0, oilPrice = 0, elecPrice = 0;
  if (gameState.energy) {
    oilQty = gameState.energy.oilStorage || 0; elecQty = gameState.energy.batteryStorage || 0;
    oilPrice = gameState.energy.oilPrice || 0; elecPrice = gameState.energy.electricityPrice || 0;
    oilVal = Math.round(oilQty * oilPrice);
    elecVal = Math.round(elecQty * elecPrice);
  }
  var portfolioValue = 0;
  if (gameState.stocks && gameState.stocks.portfolio) {
    gameState.stocks.portfolio.forEach(function(h) {
      var price = typeof getCurrentStockPrice === 'function' ? getCurrentStockPrice(h.ticker) : 0;
      portfolioValue += price * h.shares;
    });
  }
  portfolioValue = Math.round(portfolioValue);
  var outletValue = 0;
  (gameState.outlets||[]).filter(function(o){return o.owned;}).forEach(function(o){
    var lvl = o.level || 1;
    outletValue += [0, 500000, 1200000, 3000000, 8000000, 20000000][lvl] || 0;
  });
  var facilityValue = 0;
  (gameState.outlets||[]).filter(function(o){return o.owned;}).forEach(function(outlet){
    var os = (typeof getOutletState === 'function') ? getOutletState(outlet.id) : outlet;
    if (os && os.facilities) {
      os.facilities.forEach(function(fid) {
        var cfg = (typeof getFacilityConfig === 'function') ? getFacilityConfig(fid) : null;
        if (cfg) facilityValue += cfg.cost;
      });
    }
  });
  var decorationValue = 0;
  if (gameState.decorations) {
    gameState.decorations.forEach(function(d) { decorationValue += d.cost || 0; });
  }
  var totalAssets = cash + vehicleValue + oilVal + elecVal + portfolioValue + outletValue + facilityValue + decorationValue;
  var loanTotal = 0;
  (gameState.loans||[]).forEach(function(l){ loanTotal += l.remainingAmount || 0; });
  loanTotal = Math.round(loanTotal);
  var totalRevenue = gameState.totalRevenue || 0;
  var totalExpenses = (gameState.financials && gameState.financials.totalExpenses) || 0;
  if (totalExpenses === 0 && gameState.financials && gameState.financials.dailyExpenses && gameState.financials.dailyExpenses.length > 0) {
    totalExpenses = gameState.financials.dailyExpenses.reduce(function(s,e){return s+e;},0);
  }
  var retainedEarnings = totalRevenue - totalExpenses;
  var initialCapital = 1000000;
  var totalEquity = totalAssets - loanTotal;
  var html = '';
  html += '<div style="background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid rgba(226,232,240,0.6);">';
  html += '<table style="width:100%;border-collapse:collapse;">';
  html += '<thead><tr style="background:rgba(241,245,249,1);">';
  html += '<th style="padding:10px 16px;text-align:left;font-size:12px;font-weight:700;color:#1e293b;border-bottom:2px solid rgba(226,232,240,0.6);">项目</th>';
  html += '<th style="padding:10px 16px;text-align:right;font-size:12px;font-weight:700;color:#1e293b;border-bottom:2px solid rgba(226,232,240,0.6);width:40%;">金额</th>';
  html += '</tr></thead><tbody>';
  html += _bsSecRow('资产');
  html += _bsSubRow('流动资产');
  html += _bsRow('现金', cash, 'color:#475569;', '', false, false, true);
  html += _bsRow('应收账款(待收)', 0, 'color:#475569;', '', false, false, true);
  html += _bsRow('库存能源(油)', oilVal, 'color:#475569;', '', false, false, true) + (oilQty > 0 ? '<tr style="background:#ffffff;"><td style="padding:0 16px 6px 44px;font-size:10px;color:#94a3b8;border-bottom:1px solid rgba(226,232,240,0.4);">'+oilQty.toFixed(0)+' L @ $'+oilPrice.toFixed(2)+'/L</td><td></td></tr>' : '');
  html += _bsRow('库存能源(电)', elecVal, 'color:#475569;', '', false, false, true) + (elecQty > 0 ? '<tr style="background:#ffffff;"><td style="padding:0 16px 6px 44px;font-size:10px;color:#94a3b8;border-bottom:1px solid rgba(226,232,240,0.4);">'+elecQty.toFixed(0)+' kWh @ $'+elecPrice.toFixed(2)+'/kWh</td><td></td></tr>' : '');
  var currentAssets = cash + oilVal + elecVal;
  html += _bsRow('流动资产合计', currentAssets, 'color:#1e293b;font-size:11px;', '', true, true, false);
  html += _bsSubRow('非流动资产');
  html += _bsRow('车队净值', vehicleValue, 'color:#475569;', '', false, false, true);
  html += _bsRow('网点价值', outletValue, 'color:#475569;', '', false, false, true);
  html += _bsRow('设施价值', facilityValue, 'color:#475569;', '', false, false, true);
  html += _bsRow('装饰价值', decorationValue, 'color:#475569;', '', false, false, true);
  html += _bsRow('股票持仓', portfolioValue, 'color:#475569;', '', false, false, true);
  var nonCurrentAssets = vehicleValue + outletValue + facilityValue + decorationValue + portfolioValue;
  html += _bsRow('非流动资产合计', nonCurrentAssets, 'color:#1e293b;font-size:11px;', '', true, true, false);
  html += _bsRow('资产总计', totalAssets, 'color:#1e293b;font-size:13px;', 'font-size:13px;', true, true, false);
  html += _bsSecRow('负债');
  html += _bsSubRow('流动负债');
  html += _bsRow('短期贷款', loanTotal, 'color:#475569;', '', false, false, true);
  html += _bsRow('应付账款', 0, 'color:#475569;', '', false, false, true);
  html += _bsRow('负债合计', loanTotal, 'color:#1e293b;font-size:11px;', '', true, true, false);
  html += _bsSecRow('所有者权益');
  html += _bsRow('初始资本', initialCapital, 'color:#475569;', '', false, false, true);
  html += _bsRow('累计利润', retainedEarnings, 'color:#475569;', '', false, false, true);
  var undistributed = totalEquity - initialCapital - retainedEarnings;
  html += _bsRow('未分配利润', undistributed, 'color:#475569;', '', false, false, true);
  html += _bsRow('权益总计', totalEquity, 'color:#1e293b;font-size:13px;', 'font-size:13px;', true, true, false);
  html += '</tbody></table></div>';
  return html;
}
function _cfRow(label,value,labelStyle,valStyle,isSection,isTotal) {
  var ls = labelStyle || 'color:#475569;font-size:11px;';
  var vs = valStyle || '';
  var cls = isTotal ? 'font-weight:700;border-top:2px solid rgba(226,232,240,0.6);' : (isSection ? 'font-weight:700;' : '');
  var bg = isSection ? 'background:rgba(248,250,252,1);' : '#ffffff';
  var pl = isSection ? '16px' : (label.indexOf('  ')===0?'40px':'20px');
  var displayVal = value;
  var valColor = value >= 0 ? '#059669' : '#dc2626';
  return '<tr style="'+bg+cls+'">'+
    '<td style="padding:6px '+pl+' 6px 16px;font-size:11px;'+ls+(isSection?'':'border-bottom:1px solid rgba(226,232,240,0.4);')+'">'+label+'</td>'+
    '<td style="padding:6px 16px;text-align:right;font-size:11px;'+vs+(isSection?'':'border-bottom:1px solid rgba(226,232,240,0.4);')+'"><span style="color:'+valColor+';font-weight:600;">'+_fmt(displayVal)+'</span></td></tr>';
}
function _cfSecRow(label) {
  return '<tr style="background:rgba(241,245,249,1);"><td colspan="2" style="padding:8px 16px;font-size:12px;font-weight:700;color:#1e293b;border-bottom:2px solid rgba(226,232,240,0.6);">'+label+'</td></tr>';
}
function renderCashFlow() {
  var t = _aggDetail('today');
  var opInflow = t.rentalIncome + t.serviceIncome;
  var opOutflow = t.wages + t.fuelCost + t.maintenanceCost + t.energyCost + t.advertisingCost + t.facilityMaint + t.loanInterest + t.taxes;
  var opNet = opInflow - opOutflow;
  var invNet = t.vehicleSales - t.vehiclePurchases + t.stockSales - t.stockPurchases;
  var finNet = t.loanProceeds - t.loanRepayments;
  var ipoProceeds = 0;
  if (gameState.stocks && gameState.stocks.isPublic) {
    ipoProceeds = (gameState.stocks.sharePrice || 0) * (gameState.stocks.publicShares || 0);
  }
  finNet += ipoProceeds;
  var netChange = opNet + invNet + finNet;
  var beginningCash = (gameState.cash || 0) - netChange;
  var endingCash = gameState.cash || 0;
  var html = '';
  html += '<div style="background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid rgba(226,232,240,0.6);">';
  html += '<table style="width:100%;border-collapse:collapse;">';
  html += '<thead><tr style="background:rgba(241,245,249,1);">';
  html += '<th style="padding:10px 16px;text-align:left;font-size:12px;font-weight:700;color:#1e293b;border-bottom:2px solid rgba(226,232,240,0.6);">项目</th>';
  html += '<th style="padding:10px 16px;text-align:right;font-size:12px;font-weight:700;color:#1e293b;border-bottom:2px solid rgba(226,232,240,0.6);width:40%;">金额</th>';
  html += '</tr></thead><tbody>';
  html += _cfSecRow('经营活动现金流');
  html += _cfRow('  租车收入流入', t.rentalIncome, 'color:#475569;', '', false, false);
  html += _cfRow('  服务收入流入', t.serviceIncome, 'color:#475569;', '', false, false);
  html += _cfRow('  支出员工工资', -t.wages, 'color:#475569;', '', false, false);
  html += _cfRow('  支出燃油费用', -t.fuelCost, 'color:#475569;', '', false, false);
  html += _cfRow('  支出维护费用', -t.maintenanceCost, 'color:#475569;', '', false, false);
  html += _cfRow('  支出能源采购', -t.energyCost, 'color:#475569;', '', false, false);
  html += _cfRow('  支出广告费用', -t.advertisingCost, 'color:#475569;', '', false, false);
  html += _cfRow('  支出设施维护', -t.facilityMaint, 'color:#475569;', '', false, false);
  html += _cfRow('  支出贷款利息', -t.loanInterest, 'color:#475569;', '', false, false);
  html += _cfRow('  支出税金', -t.taxes, 'color:#475569;', '', false, false);
  html += _cfRow('经营活动净现金流', opNet, 'color:#1e293b;font-size:11px;', 'font-size:11px;', true, true);
  html += _cfSecRow('投资活动现金流');
  html += _cfRow('  购买车辆', -t.vehiclePurchases, 'color:#475569;', '', false, false);
  html += _cfRow('  出售车辆', t.vehicleSales, 'color:#475569;', '', false, false);
  html += _cfRow('  购买设施', 0, 'color:#475569;', '', false, false);
  html += _cfRow('  购买装饰', 0, 'color:#475569;', '', false, false);
  html += _cfRow('  投资股票', -t.stockPurchases, 'color:#475569;', '', false, false);
  html += _cfRow('  卖出股票', t.stockSales, 'color:#475569;', '', false, false);
  html += _cfRow('投资活动净现金流', invNet, 'color:#1e293b;font-size:11px;', 'font-size:11px;', true, true);
  html += _cfSecRow('筹资活动现金流');
  html += _cfRow('  取得贷款', t.loanProceeds, 'color:#475569;', '', false, false);
  html += _cfRow('  偿还贷款', -t.loanRepayments, 'color:#475569;', '', false, false);
  html += _cfRow('  IPO融资', ipoProceeds, 'color:#475569;', '', false, false);
  html += _cfRow('筹资活动净现金流', finNet, 'color:#1e293b;font-size:11px;', 'font-size:11px;', true, true);
  html += _cfRow('现金净增加额', netChange, 'color:#1e293b;font-size:11px;', 'font-size:11px;', true, true);
  html += _cfRow('期初现金', beginningCash, 'color:#475569;', '', false, false);
  html += _cfRow('期末现金', endingCash, 'color:#1e293b;font-size:13px;', 'font-size:13px;', true, true);
  html += '</tbody></table></div>';
  return html;
}
function renderLoans() {
  var loans = gameState.loans || [];
  var bs = getBalanceSheet();
  var maxLoan = Math.round(bs.assets.total * 0.5);
  var existingDebt = loans.reduce(function(s,l){ return s + l.remainingAmount; }, 0);
  var available = Math.max(0, maxLoan - existingDebt);
  var html = '<div style="background:rgba(248,250,252,1);border-radius:10px;padding:14px;margin-bottom:14px;">';
  html += '<div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:8px;">🏦 申请贷款</div>';
  html += '<div style="font-size:11px;color:#64748b;margin-bottom:6px;">可贷额度: '+formatCurrency(available)+' (总资产50% - 已贷)</div>';
  html += '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">';
  html += '<input type="number" id="loanAmount" min="10000" step="10000" value="100000" style="width:120px;padding:6px 10px;background:rgba(226,232,240,0.8);border:1px solid rgba(203,213,225,1);border-radius:6px;color:#1e293b;font-size:12px;min-height:36px;">';
  html += '<select id="loanTerm" style="padding:6px 10px;background:rgba(226,232,240,0.8);border:1px solid rgba(203,213,225,1);border-radius:6px;color:#1e293b;font-size:12px;min-height:36px;"><option value="30">30天(8%)</option><option value="90">90天(11%)</option><option value="180">180天(15%)</option></select>';
  html += '<button class="action-btn btn-buy" onclick="doApplyLoan()">申请贷款</button></div></div>';
  if (loans.length === 0) {
    html += '<div class="empty-state"><div class="icon">🏦</div><div class="text">暂无贷款</div></div>';
  } else {
    html += '<table style="width:100%;border-collapse:collapse;font-size:11px;"><thead><tr style="border-bottom:1px solid rgba(203,213,225,1);">';
    html += '<th style="text-align:left;padding:6px 8px;color:#64748b;">贷款ID</th>';
    html += '<th style="text-align:right;padding:6px 8px;color:#64748b;">剩余金额</th>';
    html += '<th style="text-align:right;padding:6px 8px;color:#64748b;">日利息</th>';
    html += '<th style="text-align:center;padding:6px 8px;color:#64748b;">到期日</th>';
    html += '<th style="text-align:center;padding:6px 8px;color:#64748b;">操作</th>';
    html += '</tr></thead><tbody>';
    loans.forEach(function(l){
      var overdue = gameState.currentDay > l.dueDay;
      html += '<tr style="border-bottom:1px solid rgba(226,232,240,0.6);'+(overdue?'background:rgba(231,76,60,0.1);':'')+'">';
      html += '<td style="padding:6px 8px;color:#64748b;">'+l.id+(overdue?' <span style="color:#f87171;">⚠逾期</span>':'')+'</td>';
      html += '<td style="padding:6px 8px;text-align:right;color:#fbbf24;">'+formatCurrency(Math.round(l.remainingAmount))+'</td>';
      html += '<td style="padding:6px 8px;text-align:right;color:#64748b;">'+formatCurrency(Math.round(l.dailyInterest))+'</td>';
      html += '<td style="padding:6px 8px;text-align:center;color:#64748b;">D'+l.dueDay+'</td>';
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
    html += '<div style="background:rgba(248,250,252,1);border-radius:10px;padding:16px;margin-bottom:14px;">';
    html += '<div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:8px;">🏢 IPO上市</div>';
    html += '<div style="font-size:11px;color:#64748b;margin-bottom:6px;">上市条件：现金 > $50M 且 累计营收 > $5M</div>';
    var eligible = typeof checkIPOEligibility === 'function' && checkIPOEligibility();
    html += '<div style="font-size:11px;color:'+(eligible?'#4ade80':'#f87171')+';">当前状态：'+(eligible?'✓ 满足条件':'✕ 不满足条件')+'</div>';
    if (eligible) {
      html += '<div style="margin-top:8px;display:flex;gap:8px;align-items:center;">';
      html += '<span style="font-size:11px;color:#64748b;">发行价:</span>';
      html += '<input type="number" id="ipoPrice" min="10" max="500" value="50" style="width:80px;padding:6px 10px;background:rgba(226,232,240,0.8);border:1px solid rgba(203,213,225,1);border-radius:6px;color:#1e293b;font-size:12px;min-height:36px;">';
      html += '<button class="action-btn btn-buy" onclick="doIPO()">执行IPO</button></div>';
    }
    html += '</div>';
  } else {
    html += '<div style="background:rgba(248,250,252,1);border-radius:10px;padding:14px;margin-bottom:14px;">';
    html += '<div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:8px;">📈 RENT 股票</div>';
    html += '<div style="font-size:11px;color:#475569;">当前股价: <span style="color:#4ade80;font-weight:700;">$'+(st.sharePrice||0).toFixed(2)+'</span> · 持有: '+st.playerShares+'股(锁定) · 流通: '+st.publicShares+'股</div>';
    html += '</div>';
  }
  html += '<div style="background:rgba(248,250,252,1);border-radius:10px;padding:14px;">';
  html += '<div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:8px;">📊 虚拟股票市场</div>';
  var vStocks = typeof VIRTUAL_STOCKS !== 'undefined' ? VIRTUAL_STOCKS : [];
  var lastPrices = {};
  if (st.stockHistory && st.stockHistory.length > 0) {
    var lastSnapshot = st.stockHistory[st.stockHistory.length - 1];
    vStocks.forEach(function(vs) { lastPrices[vs.ticker] = lastSnapshot[vs.ticker] || vs.basePrice; });
  }
  vStocks.forEach(function(vs){
    var price = lastPrices[vs.ticker] || vs.basePrice;
    html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(226,232,240,0.6);">';
    html += '<div><span style="color:#fff;font-weight:600;">'+vs.ticker+'</span> <span style="color:#64748b;font-size:10px;">'+vs.name+'</span></div>';
    html += '<div style="display:flex;gap:6px;align-items:center;">';
    html += '<span style="color:#4ade80;font-weight:700;">$'+price.toFixed(2)+'</span>';
    html += '<input type="number" id="stockQty_'+vs.ticker+'" min="1" value="10" style="width:60px;padding:4px 6px;background:rgba(226,232,240,0.8);border:1px solid rgba(203,213,225,1);border-radius:4px;color:#1e293b;font-size:10px;min-height:30px;">';
    html += '<button class="action-btn" style="padding:2px 6px;font-size:9px;background:linear-gradient(135deg,#27ae60,#2ecc71);color:#fff;" onclick="doBuyStock(\''+vs.ticker+'\')">买</button>';
    html += '<button class="action-btn" style="padding:2px 6px;font-size:9px;background:rgba(231,76,60,0.2);color:#e74c3c;border:1px solid #e74c3c;" onclick="doSellStock(\''+vs.ticker+'\')">卖</button>';
    html += '</div></div>';
  });
  html += '</div>';
  var portfolio = st.portfolio || [];
  if (portfolio.length > 0) {
    html += '<div style="background:rgba(248,250,252,1);border-radius:10px;padding:14px;margin-top:10px;">';
    html += '<div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:8px;">💼 我的持仓</div>';
    portfolio.forEach(function(p){
      var curPrice = lastPrices[p.ticker] || 0;
      var val = Math.round(p.shares * curPrice);
      html += '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:11px;color:#475569;">';
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
  ctx.fillStyle = 'rgba(241,245,249,1)';
  ctx.fillRect(0,0,w,h);
  var data = (gameState.financials && gameState.financials.dailyProfit) ? gameState.financials.dailyProfit.slice(-30) : [];
  if (data.length < 2) { ctx.fillStyle='#94a3b8'; ctx.font='12px sans-serif'; ctx.textAlign='center'; ctx.fillText('数据不足',w/2,h/2); return; }
  var padL=50,padR=20,padT=20,padB=20;
  var cW=w-padL-padR; var cH=h-padT-padB;
  var maxV=Math.max.apply(null,data.map(Math.abs)); if(maxV===0)maxV=1;
  var scale=cH/(maxV*2.5);
  var zeroY=padT+cH/2;
  ctx.strokeStyle='rgba(226,232,240,1)'; ctx.lineWidth=1;
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
  if(typeof executeIPO==='function'){
    var result=executeIPO(price);
    if(result&&result.success===false){showToast(result.message||'IPO失败','error');return;}
  }
  showToast('IPO成功！RENT已上市','success');
  addMessage('🎉 公司成功上市！股票代码 RENT，发行价 $'+price.toFixed(2),'good');
  updateUI();saveGame();renderFinanceModal();
}
function doBuyStock(ticker) {
  var qty=parseInt(document.getElementById('stockQty_'+ticker).value)||0;
  if(qty<=0){showToast('请输入数量','error');return;}
  if(typeof buyStock==='function'){
    var result=buyStock(ticker,qty);
    if(result&&!result.success){showToast(result.message||'买入失败','error');return;}
  }
  showToast('买入成功','success');
  updateUI();saveGame();renderFinanceModal();
}
function doSellStock(ticker) {
  var qty=parseInt(document.getElementById('stockQty_'+ticker).value)||0;
  if(qty<=0){showToast('请输入数量','error');return;}
  if(typeof sellStock==='function'){
    var result=sellStock(ticker,qty);
    if(result&&!result.success){showToast(result.message||'卖出失败','error');return;}
  }
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
  html += '<div style="padding:8px 14px;background:rgba(248,250,252,1);border-radius:8px;"><span style="color:#64748b;">网点</span> <span style="color:#60a5fa;font-weight:700;">'+outletCfg.name+' Lv.'+os.level+'</span></div>';
  html += '<div style="padding:8px 14px;background:rgba(248,250,252,1);border-radius:8px;"><span style="color:#64748b;">满意度加成</span> <span style="color:#4ade80;font-weight:700;">+'+satBonus+'</span></div>';
  html += '<div style="padding:8px 14px;background:rgba(248,250,252,1);border-radius:8px;"><span style="color:#64748b;">收入加成</span> <span style="color:#fbbf24;font-weight:700;">+'+incBonus+'%</span></div>';
  html += '<div style="padding:8px 14px;background:rgba(248,250,252,1);border-radius:8px;"><span style="color:#64748b;">日维护费</span> <span style="color:#f87171;font-weight:700;">'+formatCurrency(maintCost)+'</span></div>';
  html += '</div>';
  html += '<div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:10px;">已安装设施</div>';
  var facilities = typeof getOutletFacilities === 'function' ? getOutletFacilities(outletId) : [];
  if (facilities.length === 0) {
    html += '<div style="text-align:center;padding:20px;color:#94a3b8;font-size:12px;">暂无设施，从下方购买</div>';
  } else {
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">';
    facilities.forEach(function(f){
      var statusTag = f.broken ? '<span style="color:#f87171;font-size:9px;">⚠故障中</span>' : f.disabled ? '<span style="color:#94a3b8;font-size:9px;">⏸已停用</span>' : '<span style="color:#4ade80;font-size:9px;">●运行中</span>';
      var toggleLabel = f.disabled ? '启用' : '停用';
      var toggleColor = f.disabled ? 'background:linear-gradient(135deg,#27ae60,#2ecc71);color:#fff;' : 'background:rgba(231,76,60,0.2);color:#e74c3c;border:1px solid #e74c3c;';
      html += '<div style="background:rgba(248,250,252,1);border:1px solid rgba(203,213,225,0.8);border-radius:10px;padding:12px;">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">';
      html += '<span style="font-size:14px;">'+f.config.icon+'</span>'+statusTag+'</div>';
      html += '<div style="font-size:12px;font-weight:600;color:#fff;">'+f.config.name+'</div>';
      html += '<div style="font-size:9px;color:#94a3b8;margin-top:2px;">满意度+'+f.config.satisfactionBonus+' · 收入+'+f.config.incomeBonusPercent+'% · 维护$'+f.config.dailyMaintenance+'/天</div>';
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
    html += '<div style="background:rgba(241,245,249,0.8);border:1px solid '+(levelOk?'rgba(203,213,225,0.8)':'rgba(226,232,240,0.6)')+';border-radius:10px;padding:12px;'+(levelOk?'':'opacity:0.5;')+'">';
    html += '<div style="font-size:14px;margin-bottom:2px;">'+fc.icon+'</div>';
    html += '<div style="font-size:12px;font-weight:600;color:#fff;">'+fc.name+'</div>';
    html += '<div style="font-size:9px;color:#94a3b8;margin-top:2px;">需要Lv.'+fc.baseLevel+' · 费用 '+formatCurrency(fc.cost)+'</div>';
    html += '<div style="font-size:9px;color:#94a3b8;">满意度+'+fc.satisfactionBonus+' · 收入+'+fc.incomeBonusPercent+'% · 维护$'+fc.dailyMaintenance+'/天</div>';
    if (levelOk) {
      var estPayback = fc.dailyMaintenance > 0 || fc.incomeBonusPercent > 0 ? Math.ceil(fc.cost / Math.max(1, (fc.incomeBonusPercent * 40 + (FACILITY_SERVICE_FEES[fc.id]||0) - fc.dailyMaintenance))) : '—';
      html += '<button style="margin-top:6px;padding:4px 12px;border:none;border-radius:4px;font-size:9px;cursor:pointer;background:linear-gradient(135deg,#27ae60,#2ecc71);color:#fff;" onclick="purchaseFacility('+outletId+',\''+fc.id+'\');renderFacilityModal();">'+(gameState.cash>=fc.cost?'购买':'资金不足')+'</button>';
      html += '<div style="margin-top:4px;font-size:8px;color:#94a3b8;">预估回本: ~'+estPayback+'天</div>';
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
    html += '<div style="background:rgba(241,245,249,0.8);border-radius:10px;padding:12px;">';
    html += '<table style="width:100%;border-collapse:collapse;">';
    html += '<tr style="border-bottom:1px solid rgba(203,213,225,0.8);"><th style="text-align:left;padding:6px 8px;font-size:9px;color:#94a3b8;">设施</th><th style="text-align:left;padding:6px 8px;font-size:9px;color:#94a3b8;">服务费</th><th style="text-align:left;padding:6px 8px;font-size:9px;color:#94a3b8;">覆盖网点</th></tr>';
    reportKeys.forEach(function(fid){
      var r = incomeReport[fid];
      var fee = FACILITY_SERVICE_FEES[fid] || 0;
      html += '<tr style="border-bottom:1px solid rgba(226,232,240,0.6);"><td style="padding:6px 8px;font-size:11px;color:#fff;">'+r.icon+' '+r.name+'</td><td style="padding:6px 8px;font-size:11px;color:#4ade80;">+$'+fee+'/次</td><td style="padding:6px 8px;font-size:11px;color:#64748b;">'+r.outlets.length+'个网点</td></tr>';
    });
    html += '</table></div>';
  }
  content.innerHTML = html;
}

var internalLayoutTab = 'overview';
function openInternalLayoutModal(outletId) {
  window._layoutOutletId = outletId;
  internalLayoutTab = 'overview';
  document.getElementById('internalLayoutModal').classList.add('active');
  var cfg = OUTLET_CONFIGS.find(function(c){ return c.id === outletId; });
  document.getElementById('layoutOutletName').textContent = cfg.name + ' 内部布局';
  renderInternalLayoutModal();
}
function closeInternalLayoutModal() {
  document.getElementById('internalLayoutModal').classList.remove('active');
}
function switchLayoutTab(tab) {
  internalLayoutTab = tab;
  renderInternalLayoutModal();
}
function renderInternalLayoutModal() {
  var outletId = window._layoutOutletId;
  var os = getOutletState(outletId);
  if (!os) return;
  var content = document.getElementById('internalLayoutContent');
  var html = '<div style="display:flex;gap:6px;margin-bottom:14px;">';
  html += '<button style="padding:8px 14px;border:none;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;min-height:40px;' + (internalLayoutTab === 'overview' ? 'background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;' : 'background:rgba(241,245,249,1);color:#475569;border:1px solid rgba(203,213,225,1);') + '" onclick="switchLayoutTab(\'overview\')">📋 概览</button>';
  html += '<button style="padding:8px 14px;border:none;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;min-height:40px;' + (internalLayoutTab === 'parking' ? 'background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;' : 'background:rgba(241,245,249,1);color:#475569;border:1px solid rgba(203,213,225,1);') + '" onclick="switchLayoutTab(\'parking\')">🅿️ 停车位</button>';
  html += '<button style="padding:8px 14px;border:none;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;min-height:40px;' + (internalLayoutTab === 'amenity' ? 'background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;' : 'background:rgba(241,245,249,1);color:#475569;border:1px solid rgba(203,213,225,1);') + '" onclick="switchLayoutTab(\'amenity\')">🛋️ 客户设施</button>';
  html += '<button style="padding:8px 14px;border:none;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;min-height:40px;' + (internalLayoutTab === 'operational' ? 'background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;' : 'background:rgba(241,245,249,1);color:#475569;border:1px solid rgba(203,213,225,1);') + '" onclick="switchLayoutTab(\'operational\')">⚙️ 运营设施</button>';
  html += '<button style="padding:8px 14px;border:none;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;min-height:40px;' + (internalLayoutTab === 'layout' ? 'background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;' : 'background:rgba(241,245,249,1);color:#475569;border:1px solid rgba(203,213,225,1);') + '" onclick="switchLayoutTab(\'layout\')">📐 布局编辑</button>';
  html += '</div>';
  if (internalLayoutTab === 'overview') {
    html += renderLayoutOverview(outletId, os);
  } else if (internalLayoutTab === 'parking') {
    html += renderLayoutParking(outletId, os);
  } else if (internalLayoutTab === 'amenity') {
    html += renderLayoutFacilities(outletId, os, 'amenity');
  } else if (internalLayoutTab === 'operational') {
    html += renderLayoutFacilities(outletId, os, 'operational');
  } else if (internalLayoutTab === 'layout') {
    html += renderLayoutZones(outletId, os);
  }
  content.innerHTML = html;
}
function renderLayoutOverview(outletId, os) {
  var facilities = typeof getOutletFacilities === 'function' ? getOutletFacilities(outletId) : [];
  var occ = getParkingOccupancy(outletId);
  var amenityFacs = facilities.filter(function(f){ return f.config.category === 'amenity'; });
  var opFacs = facilities.filter(function(f){ return f.config.category === 'operational'; });
  
  var html = '<div style="margin-bottom:14px;"><div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:12px;">📐 店铺平面图</div>';
  html += '<div style="background:#0d1117;border:3px solid rgba(203,213,225,1);border-radius:12px;overflow:hidden;">';
  
  html += '<svg width="100%" viewBox="0 0 680 420" style="display:block;font-family:\'JetBrains Mono\',monospace;">';
  
  html += '<rect x="0" y="0" width="680" height="420" fill="#0d1117"/>';
  
  html += '<rect x="20" y="20" width="640" height="380" fill="none" stroke="#cbd5e1" stroke-width="4" rx="2"/>';
  
  html += '<rect x="24" y="24" width="180" height="140" fill="rgba(96,165,250,0.08)" stroke="#60a5fa" stroke-width="2"/>';
  html += '<text x="114" y="55" text-anchor="middle" fill="#60a5fa" font-size="13" font-weight="bold">🛎️ 接待大厅</text>';
  html += '<line x1="44" y1="65" x2="184" y2="65" stroke="rgba(96,165,250,0.3)" stroke-width="1"/>';
  html += '<rect x="40" y="75" width="60" height="30" fill="rgba(96,165,250,0.15)" stroke="rgba(96,165,250,0.4)" stroke-width="1" rx="2"/>';
  html += '<text x="70" y="95" text-anchor="middle" fill="#475569" font-size="9">总台</text>';
  html += '<rect x="110" y="75" width="80" height="30" fill="rgba(96,165,250,0.15)" stroke="rgba(96,165,250,0.4)" stroke-width="1" rx="2"/>';
  html += '<text x="150" y="95" text-anchor="middle" fill="#475569" font-size="9">等候区</text>';
  html += '<rect x="40" y="115" width="150" height="35" fill="rgba(96,165,250,0.1)" stroke="rgba(96,165,250,0.3)" stroke-width="1" rx="2"/>';
  html += '<text x="115" y="137" text-anchor="middle" fill="#94a3b8" font-size="8">客户设施区</text>';
  amenityFacs.slice(0, 4).forEach(function(f, i) {
    var fx = 50 + (i % 4) * 36;
    html += '<text x="' + fx + '" y="132" fill="#64748b" font-size="12">' + f.config.icon + '</text>';
  });
  
  html += '<rect x="24" y="168" width="180" height="228" fill="rgba(74,222,128,0.06)" stroke="#4ade80" stroke-width="2"/>';
  html += '<text x="114" y="198" text-anchor="middle" fill="#4ade80" font-size="13" font-weight="bold">🏠 内部车库</text>';
  html += '<line x1="44" y1="208" x2="184" y2="208" stroke="rgba(74,222,128,0.3)" stroke-width="1"/>';
  html += '<text x="114" y="228" text-anchor="middle" fill="#64748b" font-size="10">' + os.parkingSpots.internal + ' 个车位 · ' + occ.internal.used + ' 已租</text>';
  var garageRows = Math.ceil(Math.min(os.parkingSpots.internal, 20) / 5);
  for (var gi = 0; gi < Math.min(os.parkingSpots.internal, 20); gi++) {
    var gx = 38 + (gi % 5) * 32;
    var gy = 240 + Math.floor(gi / 5) * 28;
    var gUsed = gi < occ.internal.used;
    html += '<rect x="' + gx + '" y="' + gy + '" width="26" height="20" fill="' + (gUsed ? 'rgba(74,222,128,0.4)' : 'rgba(74,222,128,0.1)') + '" stroke="rgba(74,222,128,0.4)" stroke-width="1" rx="2"/>';
    if (gUsed) html += '<text x="' + (gx + 13) + '" y="' + (gy + 14) + '" text-anchor="middle" fill="#fff" font-size="8">🚗</text>';
  }
  
  html += '<rect x="208" y="24" width="448" height="140" fill="rgba(251,191,36,0.06)" stroke="#fbbf24" stroke-width="2"/>';
  html += '<text x="432" y="55" text-anchor="middle" fill="#fbbf24" font-size="13" font-weight="bold">🅿️ 顾客停车区</text>';
  html += '<line x1="228" y1="65" x2="636" y2="65" stroke="rgba(251,191,36,0.3)" stroke-width="1"/>';
  html += '<text x="432" y="82" text-anchor="middle" fill="#64748b" font-size="10">' + os.parkingSpots.customer + ' 个车位 · ' + occ.customer.used + ' 已用</text>';
  for (var pi = 0; pi < Math.min(os.parkingSpots.customer, 15); pi++) {
    var ppx = 222 + (pi % 5) * 86;
    var ppy = 92 + Math.floor(pi / 5) * 24;
    var pUsed = pi < occ.customer.used;
    html += '<rect x="' + ppx + '" y="' + ppy + '" width="78" height="18" fill="' + (pUsed ? 'rgba(251,191,36,0.35)' : 'rgba(251,191,36,0.08)') + '" stroke="rgba(251,191,36,0.4)" stroke-width="1" rx="3"/>';
    html += '<text x="' + (ppx + 39) + '" y="' + (ppy + 13) + '" text-anchor="middle" fill="' + (pUsed ? '#fff' : '#cbd5e1') + '" font-size="8">' + (pUsed ? '🚗 P' + (pi+1) : 'P' + (pi+1)) + '</text>';
  }
  
  html += '<rect x="208" y="168" width="224" height="228" fill="rgba(168,85,247,0.06)" stroke="#a855f7" stroke-width="2"/>';
  html += '<text x="320" y="198" text-anchor="middle" fill="#a855f7" font-size="13" font-weight="bold">📦 后勤区</text>';
  html += '<line x1="228" y1="208" x2="412" y2="208" stroke="rgba(168,85,247,0.3)" stroke-width="1"/>';
  html += '<text x="320" y="228" text-anchor="middle" fill="#64748b" font-size="10">维修 · 充电 · 仓储</text>';
  var logiFacs = opFacs.filter(function(f){ return getFacilityZone(outletId, f.id) === 'logistics'; });
  logiFacs.forEach(function(f, i) {
    var lx = 228 + (i % 2) * 100;
    var ly = 240 + Math.floor(i / 2) * 50;
    html += '<rect x="' + lx + '" y="' + ly + '" width="90" height="40" fill="rgba(168,85,247,0.12)" stroke="rgba(168,85,247,0.4)" stroke-width="1" rx="4"/>';
    html += '<text x="' + (lx + 45) + '" y="' + (ly + 16) + '" text-anchor="middle" font-size="14">' + f.config.icon + '</text>';
    html += '<text x="' + (lx + 45) + '" y="' + (ly + 32) + '" text-anchor="middle" fill="#475569" font-size="7">' + f.config.name + '</text>';
  });
  if (logiFacs.length === 0) {
    html += '<text x="320" y="270" text-anchor="middle" fill="#cbd5e1" font-size="9">暂无设施</text>';
  }
  
  html += '<rect x="436" y="168" width="220" height="228" fill="rgba(244,114,182,0.06)" stroke="#f472b6" stroke-width="2"/>';
  html += '<text x="546" y="198" text-anchor="middle" fill="#f472b6" font-size="13" font-weight="bold">🛋️ 设施区</text>';
  html += '<line x1="456" y1="208" x2="636" y2="208" stroke="rgba(244,114,182,0.3)" stroke-width="1"/>';
  html += '<text x="546" y="228" text-anchor="middle" fill="#64748b" font-size="10">客户舒适 · 运营支持</text>';
  var otherFacs = facilities.filter(function(f){ return getFacilityZone(outletId, f.id) !== 'logistics'; });
  otherFacs.forEach(function(f, i) {
    var fx = 448 + (i % 2) * 100;
    var fy = 240 + Math.floor(i / 2) * 50;
    html += '<rect x="' + fx + '" y="' + fy + '" width="90" height="40" fill="rgba(244,114,182,0.12)" stroke="rgba(244,114,182,0.4)" stroke-width="1" rx="4"/>';
    html += '<text x="' + (fx + 45) + '" y="' + (fy + 16) + '" text-anchor="middle" font-size="14">' + f.config.icon + '</text>';
    html += '<text x="' + (fx + 45) + '" y="' + (fy + 32) + '" text-anchor="middle" fill="#475569" font-size="7">' + f.config.name + '</text>';
  });
  if (otherFacs.length === 0) {
    html += '<text x="546" y="270" text-anchor="middle" fill="#cbd5e1" font-size="9">暂无设施</text>';
  }
  
  html += '<rect x="110" y="140" width="40" height="28" fill="#0d1117" stroke="none"/>';
  html += '<line x1="110" y1="140" x2="150" y2="140" stroke="#60a5fa" stroke-width="2" stroke-dasharray="6,3"/>';
  html += '<text x="130" y="157" text-anchor="middle" fill="#94a3b8" font-size="7">通道</text>';
  
  html += '<rect x="296" y="140" width="40" height="28" fill="#0d1117" stroke="none"/>';
  html += '<line x1="296" y1="140" x2="336" y2="140" stroke="#fbbf24" stroke-width="2" stroke-dasharray="6,3"/>';
  html += '<text x="316" y="157" text-anchor="middle" fill="#94a3b8" font-size="7">入口</text>';
  
  html += '<rect x="24" y="388" width="80" height="12" fill="#0d1117" stroke="none"/>';
  html += '<line x1="24" y1="394" x2="104" y2="394" stroke="#94a3b8" stroke-width="3"/>';
  html += '<text x="64" y="410" text-anchor="middle" fill="#94a3b8" font-size="8">大门 🚪</text>';
  
  html += '</svg></div></div>';
  
  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px;">';
  html += '<div style="background:rgba(96,165,250,0.1);border:1px solid rgba(96,165,250,0.2);border-radius:8px;padding:10px;text-align:center;"><div style="font-size:16px;font-weight:700;color:#60a5fa;">🛎️</div><div style="font-size:10px;color:#fff;margin-top:2px;">接待大厅</div></div>';
  html += '<div style="background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.2);border-radius:8px;padding:10px;text-align:center;"><div style="font-size:16px;font-weight:700;color:#fbbf24;">' + occ.customer.used + '/' + occ.customer.total + '</div><div style="font-size:10px;color:#fff;margin-top:2px;">顾客车位</div></div>';
  html += '<div style="background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.2);border-radius:8px;padding:10px;text-align:center;"><div style="font-size:16px;font-weight:700;color:#4ade80;">' + occ.internal.used + '/' + occ.internal.total + '</div><div style="font-size:10px;color:#fff;margin-top:2px;">内部车库</div></div>';
  html += '<div style="background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.2);border-radius:8px;padding:10px;text-align:center;"><div style="font-size:16px;font-weight:700;color:#a855f7;">' + facilities.length + '</div><div style="font-size:10px;color:#fff;margin-top:2px;">已装设施</div></div>';
  html += '</div>';
  
  if (gameState.interiorDecorUnlocked && typeof renderDecorations === 'function') {
    html += renderDecorations(outletId);
  }
  return html;
}
function renderLayoutParking(outletId, os) {
  var html = '<div style="margin-bottom:14px;"><div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:10px;">🅿️ 停车位管理</div>';
  var occ = getParkingOccupancy(outletId);
  var dailyRent = getDailyParkingRent(outletId);
  var pressure = getParkingPressureLevel(outletId);
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;">';
  html += '<div style="background:rgba(248,250,252,1);border-radius:10px;padding:14px;"><div style="font-size:11px;color:#64748b;margin-bottom:6px;">顾客停车位</div><div style="font-size:24px;font-weight:700;color:#fbbf24;">' + os.parkingSpots.customer + '</div><div style="font-size:9px;color:#94a3b8;">当前 / 最大 ' + PARKING_CONFIG.customer.max + '</div><div style="margin-top:8px;"><div style="width:100%;height:6px;background:rgba(226,232,240,1);border-radius:3px;overflow:hidden;"><div style="width:' + (pressure * 100) + '%;height:100%;background:' + (pressure >= 0.9 ? '#f87171' : pressure >= 0.7 ? '#fbbf24' : '#4ade80') + ';border-radius:3px;"></div></div></div><div style="font-size:9px;color:#94a3b8;margin-top:4px;">占用率 ' + Math.round(pressure * 100) + '%</div></div>';
  html += '<div style="background:rgba(248,250,252,1);border-radius:10px;padding:14px;"><div style="font-size:11px;color:#64748b;margin-bottom:6px;">内部车库</div><div style="font-size:24px;font-weight:700;color:#4ade80;">' + os.parkingSpots.internal + '</div><div style="font-size:9px;color:#94a3b8;">当前 / 最大 ' + PARKING_CONFIG.internal.max + '</div><div style="font-size:10px;color:#64748b;margin-top:8px;">已用 ' + occ.internal.used + ' / 可用 ' + occ.internal.available + '</div></div>';
  html += '<div style="background:rgba(248,250,252,1);border-radius:10px;padding:14px;"><div style="font-size:11px;color:#64748b;margin-bottom:6px;">日租金</div><div style="font-size:24px;font-weight:700;color:#f87171;">' + formatCurrency(dailyRent) + '</div><div style="font-size:9px;color:#94a3b8;">每车位 +' + PARKING_CONFIG.customer.dailyRent + '元/天</div></div>';
  html += '</div>';
  html += '<div style="font-size:12px;font-weight:600;color:#fff;margin-bottom:8px;">扩建停车场</div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">';
  var canUpgradeCustomer = os.parkingSpots.customer < PARKING_CONFIG.customer.max && gameState.cash >= PARKING_CONFIG.customer.upgradeCost;
  var canUpgradeInternal = os.parkingSpots.internal < PARKING_CONFIG.internal.max && gameState.cash >= PARKING_CONFIG.internal.upgradeCost;
  html += '<div style="background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.2);border-radius:10px;padding:14px;"><div style="font-size:12px;font-weight:600;color:#fbbf24;margin-bottom:4px;">🚗 顾客停车区</div><div style="font-size:10px;color:#64748b;margin-bottom:8px;">扩建 +' + PARKING_CONFIG.customer.perUpgrade + '个车位 (当前' + os.parkingSpots.customer + '/' + PARKING_CONFIG.customer.max + ')</div><button style="width:100%;padding:8px;border:none;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;" onclick="upgradeParkingSpot(' + outletId + ',\'customer\');renderInternalLayoutModal();" ' + (!canUpgradeCustomer ? 'disabled' : '') + '>' + formatCurrency(PARKING_CONFIG.customer.upgradeCost) + ' 元</button></div>';
  html += '<div style="background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.2);border-radius:10px;padding:14px;"><div style="font-size:12px;font-weight:600;color:#4ade80;margin-bottom:4px;">🏠 内部车库</div><div style="font-size:10px;color:#64748b;margin-bottom:8px;">扩建 +' + PARKING_CONFIG.internal.perUpgrade + '个车位 (当前' + os.parkingSpots.internal + '/' + PARKING_CONFIG.internal.max + ')</div><button style="width:100%;padding:8px;border:none;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;background:linear-gradient(135deg,#27ae60,#2ecc71);color:#fff;" onclick="upgradeParkingSpot(' + outletId + ',\'internal\');renderInternalLayoutModal();" ' + (!canUpgradeInternal ? 'disabled' : '') + '>' + formatCurrency(PARKING_CONFIG.internal.upgradeCost) + ' 元</button></div>';
  html += '</div>';
  html += '<div style="background:rgba(248,250,252,1);border-radius:10px;padding:14px;margin-bottom:14px;"><div style="font-size:12px;font-weight:600;color:#fff;margin-bottom:8px;">📝 车位预约设置</div>';
  html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(226,232,240,0.8);"><div><div style="font-size:11px;color:#fff;">自动推荐预约停车</div><div style="font-size:9px;color:#94a3b8;">额外+50元/单，优先预留车位</div></div><label style="position:relative;display:inline-block;width:44px;height:24px;"><input type="checkbox" id="autoReservationToggle" style="opacity:0;width:0;height:0;" ' + (gameState.autoRecommendReservation ? 'checked' : '') + ' onchange="setAutoRecommendReservation(this.checked);"><span style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:' + (gameState.autoRecommendReservation ? '#3b82f6' : '#ccc') + ';transition:.3s;border-radius:24px;"></span><span style="position:absolute;content:"";height:18px;width:18px;left:' + (gameState.autoRecommendReservation ? '22px' : '3px') + ';bottom:3px;background-color:white;transition:.3s;border-radius:50%;"></span></label></div>';
  html += '</div>';
  html += '<div style="background:rgba(248,250,252,1);border-radius:10px;padding:14px;"><div style="font-size:12px;font-weight:600;color:#fff;margin-bottom:8px;">📊 车位压力</div>';
  if (pressure >= 0.9) {
    html += '<div style="padding:10px;background:rgba(248,113,113,0.1);border-radius:8px;border:1px solid rgba(248,113,113,0.3);"><div style="font-size:11px;color:#f87171;font-weight:600;margin-bottom:4px;">⚠️ 车位紧张！</div><div style="font-size:10px;color:#475569;">已连续' + (os.parkingPressureDays || 0) + '天超90%</div><div style="font-size:10px;color:#475569;">建议扩建或开启预约停车</div></div>';
  } else if (pressure >= 0.7) {
    html += '<div style="padding:10px;background:rgba(251,191,36,0.1);border-radius:8px;border:1px solid rgba(251,191,36,0.3);"><div style="font-size:11px;color:#fbbf24;font-weight:600;margin-bottom:4px;">⚡ 车位偏紧</div><div style="font-size:10px;color:#475569;">建议关注车位使用情况</div></div>';
  } else {
    html += '<div style="padding:10px;background:rgba(74,222,128,0.1);border-radius:8px;border:1px solid rgba(74,222,128,0.3);"><div style="font-size:11px;color:#4ade80;font-weight:600;margin-bottom:4px;">✓ 车位充足</div><div style="font-size:10px;color:#475569;">当前车位充裕，运营正常</div></div>';
  }
  html += '</div>';
  return html;
}
function renderLayoutFacilities(outletId, os, category) {
  var html = '<div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:10px;">' + (category === 'amenity' ? '🛋️ 客户舒适设施' : '⚙️ 运营设施') + '</div>';
  var owned = os.facilities || [];
  var ownedInCategory = owned.map(function(fid) {
    var cfg = getFacilityConfig(fid);
    if (!cfg || cfg.category !== category) return null;
    var f = { id: fid, config: cfg };
    f.disabled = os.disabledFacilities && os.disabledFacilities.indexOf(fid) !== -1;
    f.broken = os.brokenFacilities && os.brokenFacilities[fid] && os.brokenFacilities[fid] > gameState.currentDay;
    return f;
  }).filter(function(f){ return f; });
  if (ownedInCategory.length > 0) {
    html += '<div style="margin-bottom:14px;"><div style="font-size:11px;font-weight:600;color:#64748b;margin-bottom:8px;">已安装</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">';
    ownedInCategory.forEach(function(f) {
      var zone = getFacilityZone(outletId, f.id);
      var eff = getOperationalFacilityEffectiveness(outletId, f.id);
      var staffReq = f.config.requiredStaff ? '<div style="font-size:9px;color:' + (eff >= 1 ? '#4ade80' : '#fbbf24') + ';">员工效果:' + Math.round(eff * 100) + '%</div>' : '';
      html += '<div style="background:rgba(248,250,252,1);border:1px solid rgba(203,213,225,0.8);border-radius:10px;padding:12px;"><div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="font-size:20px;">' + f.config.icon + '</span><span style="font-size:9px;padding:2px 6px;border-radius:4px;background:' + (f.disabled ? 'rgba(226,232,240,1)' : f.broken ? 'rgba(248,113,113,0.2)' : 'rgba(74,222,128,0.2)') + ';color:' + (f.disabled ? '#64748b' : f.broken ? '#f87171' : '#4ade80') + ';">' + (f.disabled ? '已停用' : f.broken ? '故障中' : '运行中') + '</span></div><div style="font-size:12px;font-weight:600;color:#fff;margin-bottom:4px;">' + f.config.name + '</div><div style="font-size:9px;color:#94a3b8;">所在区域: ' + getZoneName(zone) + '</div>' + staffReq + '<div style="font-size:9px;color:#94a3b8;">满意度+' + f.config.satisfactionBonus + ' · 收入+' + f.config.incomeBonusPercent + '%</div><button style="margin-top:6px;padding:4px 8px;border:none;border-radius:4px;font-size:9px;cursor:pointer;background:' + (f.disabled ? 'linear-gradient(135deg,#27ae60,#2ecc71)' : 'rgba(231,76,60,0.2)') + ';color:' + (f.disabled ? '#fff' : '#e74c3c') + ';" onclick="toggleFacility(' + outletId + ',\'' + f.id + '\');renderInternalLayoutModal();">' + (f.disabled ? '启用' : '停用') + '</button></div>';
    });
    html += '</div></div>';
  }
  html += '<div style="font-size:11px;font-weight:600;color:#64748b;margin-bottom:8px;">可购买</div>';
  html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">';
  facilitiesConfig.filter(function(fc) { return fc.category === category; }).forEach(function(fc) {
    if (owned.indexOf(fc.id) !== -1) return;
    var canBuy = typeof canPurchaseFacility === 'function' ? canPurchaseFacility(outletId, fc.id) : {ok: false};
    var levelOk = os.level >= fc.baseLevel;
    html += '<div style="background:rgba(241,245,249,0.8);border:1px solid ' + (levelOk ? 'rgba(203,213,225,0.8)' : 'rgba(226,232,240,0.6)') + ';border-radius:10px;padding:12px;' + (levelOk ? '' : 'opacity:0.5;') + '><div style="font-size:20px;margin-bottom:4px;">' + fc.icon + '</div><div style="font-size:12px;font-weight:600;color:#fff;margin-bottom:4px;">' + fc.name + '</div>';
    html += '<div style="font-size:9px;color:#94a3b8;margin-bottom:2px;">需要Lv.' + fc.baseLevel + ' · 费用 ' + formatCurrency(fc.cost) + '</div>';
    if (fc.requiredStaff) html += '<div style="font-size:9px;color:#a855f7;margin-bottom:2px;">需要:' + (fc.requiredStaff === 'car_washer' ? '洗车工' : '维修技师') + '</div>';
    if (fc.effect) html += '<div style="font-size:9px;color:#64748b;margin-bottom:4px;">效果:' + (fc.effect === 'cleanliness' ? '自动清洗' : fc.effect === 'repair' ? '维修折扣' : fc.effect === 'morale' ? '士气维护' : fc.effect === 'order_capacity' ? '订单+20%' : fc.effect === 'ev_charge' ? '充电加成' : fc.effect) + '</div>';
    html += '<div style="font-size:9px;color:#94a3b8;margin-bottom:6px;">满意度+' + fc.satisfactionBonus + ' · 收入+' + fc.incomeBonusPercent + '% · 维护$' + fc.dailyMaintenance + '/天</div>';
    if (levelOk) {
      html += '<button style="width:100%;padding:6px;border:none;border-radius:4px;font-size:10px;font-weight:600;cursor:pointer;background:linear-gradient(135deg,#27ae60,#2ecc71);color:#fff;" onclick="purchaseFacility(' + outletId + ',\'' + fc.id + '\');renderInternalLayoutModal();" ' + (gameState.cash < fc.cost ? 'disabled' : '') + '>' + (gameState.cash >= fc.cost ? '购买' : '资金不足') + '</button>';
    } else {
      html += '<div style="text-align:center;font-size:9px;color:#f87171;padding:6px 0;">网点等级不足</div>';
    }
    html += '</div>';
  });
  html += '</div>';
  return html;
}
function renderLayoutZones(outletId, os) {
  var facilities = typeof getOutletFacilities === 'function' ? getOutletFacilities(outletId) : [];
  var zoneBonus = typeof getZoneEfficiencyBonus === 'function' ? getZoneEfficiencyBonus(outletId) : 0;
  
  var html = '<div style="margin-bottom:14px;"><div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:8px;">📐 设施布局编辑</div>';
  html += '<div style="font-size:11px;color:#64748b;margin-bottom:12px;">将设施放置在不同区域可获得效率加成</div>';
  
  html += '<div style="position:relative;background:rgba(241,245,249,0.5);border:2px solid rgba(203,213,225,1);border-radius:12px;padding:16px;min-height:200px;margin-bottom:14px;">';
  html += '<svg width="100%" height="180" viewBox="0 0 500 180" style="display:block;">';
  
  var zoneColors = {
    reception: { fill: 'rgba(96,165,250,0.15)', stroke: '#60a5fa', label: '接待区' },
    parking: { fill: 'rgba(251,191,36,0.15)', stroke: '#fbbf24', label: '停车区' },
    logistics: { fill: 'rgba(168,85,247,0.15)', stroke: '#a855f7', label: '后勤区' }
  };
  
  html += '<rect x="10" y="10" width="150" height="160" fill="' + zoneColors.reception.fill + '" stroke="' + zoneColors.reception.stroke + '" stroke-width="2" rx="6"/>';
  html += '<text x="85" y="90" text-anchor="middle" fill="' + zoneColors.reception.stroke + '" font-size="10" font-weight="bold">接待区</text>';
  html += '<text x="85" y="105" text-anchor="middle" fill="#94a3b8" font-size="8">客户设施+10%</text>';
  
  html += '<rect x="175" y="10" width="160" height="160" fill="' + zoneColors.parking.fill + '" stroke="' + zoneColors.parking.stroke + '" stroke-width="2" rx="6"/>';
  html += '<text x="255" y="90" text-anchor="middle" fill="' + zoneColors.parking.stroke + '" font-size="10" font-weight="bold">停车区</text>';
  html += '<text x="255" y="105" text-anchor="middle" fill="#94a3b8" font-size="8">洗车房+5%</text>';
  
  html += '<rect x="350" y="10" width="140" height="160" fill="' + zoneColors.logistics.fill + '" stroke="' + zoneColors.logistics.stroke + '" stroke-width="2" rx="6"/>';
  html += '<text x="420" y="90" text-anchor="middle" fill="' + zoneColors.logistics.stroke + '" font-size="10" font-weight="bold">后勤区</text>';
  html += '<text x="420" y="105" text-anchor="middle" fill="#94a3b8" font-size="8">维修/充电+5%</text>';
  
  var zonePositions = { reception: {x: 55, y: 130}, parking: {x: 225, y: 130}, logistics: {x: 400, y: 130} };
  var zoneOffsets = { reception: 0, parking: 0, logistics: 0 };
  
  facilities.forEach(function(f) {
    var zone = getFacilityZone(outletId, f.id);
    var pos = zonePositions[zone] || zonePositions.parking;
    var offsetY = zoneOffsets[zone] * 25;
    zoneOffsets[zone]++;
    
    html += '<circle cx="' + pos.x + '" cy="' + (pos.y - offsetY) + '" r="10" fill="' + zoneColors[zone].stroke + '"/>';
    html += '<text x="' + pos.x + '" y="' + (pos.y - offsetY + 4) + '" text-anchor="middle" font-size="10">' + f.config.icon + '</text>';
  });
  
  html += '</svg></div>';
  
  if (facilities.length === 0) {
    html += '<div style="text-align:center;padding:20px;color:#94a3b8;font-size:12px;">暂无设施可布局</div>';
    return html;
  }
  
  html += '<div style="font-size:11px;font-weight:600;color:#fff;margin-bottom:8px;">⚙️ 拖动设施到区域</div>';
  html += '<div style="display:flex;flex-wrap:wrap;gap:8px;">';
  facilities.forEach(function(f) {
    var currentZone = getFacilityZone(outletId, f.id);
    html += '<div style="background:rgba(248,250,252,1);border:1px solid rgba(203,213,225,1);border-radius:8px;padding:10px;min-width:140px;">';
    html += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;"><span style="font-size:18px;">' + f.config.icon + '</span><span style="font-size:11px;color:#fff;">' + f.config.name + '</span></div>';
    html += '<div style="display:flex;gap:4px;">';
    ['reception', 'parking', 'logistics'].forEach(function(zone) {
      var selected = currentZone === zone;
      var color = zoneColors[zone].stroke;
      html += '<button style="flex:1;padding:4px 6px;border:none;border-radius:4px;font-size:8px;font-weight:600;cursor:pointer;background:' + (selected ? color : 'rgba(203,213,225,0.8)') + ';color:' + (selected ? '#fff' : '#64748b') + ';" onclick="setFacilityZone(' + outletId + ',\'' + f.id + '\',\'' + zone + '\');renderInternalLayoutModal();">' + getZoneName(zone) + '</button>';
    });
    html += '</div></div>';
  });
  html += '</div>';
  
  if (zoneBonus > 0) {
    html += '<div style="margin-top:14px;padding:12px;background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.2);border-radius:8px;text-align:center;"><div style="font-size:14px;color:#4ade80;font-weight:bold;">✓ 布局优化生效</div><div style="font-size:11px;color:#475569;">当前效率加成: +' + Math.round(zoneBonus * 100) + '%</div></div>';
  }
  return html;
}
function renderDecorations(outletId) {
  var html = '<div style="margin-top:14px;"><div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:10px;">🌿 室内装饰 <span style="font-size:10px;color:#f1c40f;">(旗舰店铺解锁)</span></div>';
  var DECORATIONS = [
    { id: 'plant', name: '绿植', cost: 5000, satisfactionBonus: 2, icon: '🪴' },
    { id: 'aquarium', name: '鱼缸', cost: 8000, satisfactionBonus: 3, icon: '🐠' },
    { id: 'fountain', name: '室内喷泉', cost: 15000, satisfactionBonus: 5, icon: '⛲' }
  ];
  var ownedDecos = (gameState.decorations || []).filter(function(d){ return d.outletId === outletId; });
  if (ownedDecos.length > 0) {
    html += '<div style="display:flex;gap:6px;margin-bottom:10px;">';
    ownedDecos.forEach(function(d) {
      html += '<div style="background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.2);border-radius:8px;padding:8px 12px;text-align:center;"><span style="font-size:20px;">' + d.icon + '</span><div style="font-size:9px;color:#4ade80;">' + d.name + '</div></div>';
    });
    html += '</div>';
    var totalBonus = ownedDecos.reduce(function(s, d){ return s + d.satisfactionBonus; }, 0);
    html += '<div style="font-size:10px;color:#4ade80;margin-bottom:10px;">装饰满意度加成: +' + totalBonus + '</div>';
  }
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">';
  DECORATIONS.forEach(function(d) {
    var owned = ownedDecos.some(function(od){ return od.id === d.id; });
    html += '<div style="background:rgba(241,245,249,0.8);border:1px solid rgba(203,213,225,0.8);border-radius:8px;padding:12px;text-align:center;' + (owned ? 'opacity:0.5;' : '') + '"><div style="font-size:24px;margin-bottom:4px;">' + d.icon + '</div><div style="font-size:11px;font-weight:600;color:#fff;">' + d.name + '</div><div style="font-size:9px;color:#94a3b8;">满意度+' + d.satisfactionBonus + '</div>';
    if (!owned) {
      html += '<button style="margin-top:6px;padding:6px;border:none;border-radius:4px;font-size:9px;font-weight:600;cursor:pointer;background:linear-gradient(135deg,#27ae60,#2ecc71);color:#fff;width:100%;" onclick="purchaseDecoration(' + outletId + ',\'' + d.id + '\');renderInternalLayoutModal();">' + formatCurrency(d.cost) + '</button>';
    } else {
      html += '<div style="margin-top:6px;font-size:9px;color:#4ade80;">已购买</div>';
    }
    html += '</div>';
  });
  html += '</div></div>';
  return html;
}

function openReviewModal() {
  document.getElementById('reviewModal').classList.add('active');
  renderReviewModal();
}
function closeReviewModal() {
  document.getElementById('reviewModal').classList.remove('active');
}
function renderReviewModal() {
  var content = document.getElementById('reviewContent');
  var todayAvg = getAverageRating(1);
  var weekAvg = getAverageRating(7);
  var monthAvg = getAverageRating(30);
  var nps = gameState.npsScore || 50;
  var impact = getReviewImpactOnOrders();
  var recent = getRecentReviews(10);
  var npsColor = nps >= 70 ? '#4ade80' : nps >= 50 ? '#fbbf24' : '#f87171';
  var html = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px;">';
  html += '<div style="background:rgba(248,250,252,1);border:1px solid rgba(226,232,240,0.8);border-radius:10px;padding:12px;text-align:center;"><div style="font-size:9px;color:#94a3b8;">今日评分</div><div style="font-size:22px;font-weight:700;color:#f472b6;">' + (todayAvg > 0 ? todayAvg : '—') + '</div></div>';
  html += '<div style="background:rgba(248,250,252,1);border:1px solid rgba(226,232,240,0.8);border-radius:10px;padding:12px;text-align:center;"><div style="font-size:9px;color:#94a3b8;">近7天</div><div style="font-size:22px;font-weight:700;color:#60a5fa;">' + (weekAvg > 0 ? weekAvg : '—') + '</div></div>';
  html += '<div style="background:rgba(248,250,252,1);border:1px solid rgba(226,232,240,0.8);border-radius:10px;padding:12px;text-align:center;"><div style="font-size:9px;color:#94a3b8;">近30天</div><div style="font-size:22px;font-weight:700;color:#4ade80;">' + (monthAvg > 0 ? monthAvg : '—') + '</div></div>';
  html += '<div style="background:rgba(248,250,252,1);border:1px solid rgba(226,232,240,0.8);border-radius:10px;padding:12px;text-align:center;"><div style="font-size:9px;color:#94a3b8;">NPS净推荐值</div><div style="font-size:22px;font-weight:700;color:' + npsColor + ';">' + nps + '</div></div>';
  html += '</div>';
  html += '<div style="background:rgba(248,250,252,1);border:1px solid rgba(226,232,240,0.8);border-radius:10px;padding:14px;margin-bottom:14px;">';
  html += '<div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:10px;">📈 近7天评分趋势</div>';
  html += '<canvas id="ratingTrendCanvas" width="600" height="180" style="width:100%;max-width:600px;height:180px;"></canvas>';
  html += '</div>';
  html += '<div style="background:rgba(248,250,252,1);border:1px solid rgba(226,232,240,0.8);border-radius:10px;padding:14px;margin-bottom:14px;">';
  html += '<div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:10px;">💬 最近评价</div>';
  if (recent.length === 0) {
    html += '<div style="text-align:center;padding:20px;color:#94a3b8;font-size:12px;">暂无评价，完成订单后将自动生成</div>';
  } else {
    recent.forEach(function(r) {
      var stars = '';
      for (var i = 1; i <= 5; i++) stars += i <= r.score ? '⭐' : '☆';
      var scoreColor = r.score >= 4 ? '#4ade80' : r.score >= 3 ? '#fbbf24' : '#f87171';
      html += '<div style="background:rgba(241,245,249,0.8);border-radius:8px;padding:10px 12px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">';
      html += '<div style="flex:1;"><div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;"><span style="font-size:11px;font-weight:600;color:#fff;">' + (r.customerName || '匿名') + '</span><span style="font-size:9px;color:#94a3b8;">D' + r.day + '</span>' + (r.isReturnCustomer ? '<span style="font-size:8px;padding:1px 4px;background:rgba(74,222,128,0.15);color:#4ade80;border-radius:3px;">回头客</span>' : '') + '</div>';
      html += '<div style="font-size:11px;color:#475569;">' + r.text + '</div></div>';
      html += '<div style="text-align:right;min-width:80px;"><div style="font-size:12px;font-weight:700;color:' + scoreColor + ';">' + stars + '</div><div style="font-size:9px;color:#94a3b8;">' + (r.vehicleName || '') + '</div></div>';
      html += '</div>';
    });
  }
  html += '</div>';
  html += '<div style="background:rgba(248,250,252,1);border:1px solid rgba(226,232,240,0.8);border-radius:10px;padding:14px;">';
  html += '<div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:8px;">📊 口碑影响</div>';
  var impactColor = impact.bonus > 0 ? '#4ade80' : impact.bonus < 0 ? '#f87171' : '#fbbf24';
  html += '<div style="font-size:13px;font-weight:700;color:' + impactColor + ';margin-bottom:6px;">' + impact.desc + '</div>';
  html += '<div style="font-size:10px;color:#94a3b8;line-height:1.6;">';
  html += '• 评分4~5星客户有30%概率成为回头客<br>';
  html += '• 近30天平均评分直接影响订单量<br>';
  html += '• NPS > 70 为优秀，50~70 为良好，< 50 需改善<br>';
  html += '• 提升车辆状况、员工士气、店铺设施可提高评分</div>';
  html += '</div>';
  content.innerHTML = html;
  setTimeout(drawRatingTrendChart, 50);
}

function drawRatingTrendChart() {
  var canvas = document.getElementById('ratingTrendCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var trend = getRatingTrend(7);
  var w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(241,245,249,1)';
  ctx.fillRect(0, 0, w, h);
  var padL = 40, padR = 20, padT = 20, padB = 30;
  var chartW = w - padL - padR, chartH = h - padT - padB;
  ctx.strokeStyle = 'rgba(226,232,240,0.8)';
  ctx.lineWidth = 1;
  for (var i = 0; i <= 5; i++) {
    var y = padT + chartH - (i / 5) * chartH;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + chartW, y); ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px JetBrains Mono';
    ctx.textAlign = 'right';
    ctx.fillText(i.toString(), padL - 6, y + 3);
  }
  var dataPoints = trend.filter(function(d){ return d.avg > 0; });
  if (dataPoints.length < 2) {
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText('数据不足，至少需要2天评分', w / 2, h / 2);
    return;
  }
  var stepX = chartW / (trend.length - 1);
  ctx.beginPath();
  ctx.strokeStyle = '#f472b6';
  ctx.lineWidth = 2;
  var started = false;
  trend.forEach(function(d, idx) {
    var x = padL + idx * stepX;
    var y = padT + chartH - (d.avg / 5) * chartH;
    if (d.avg > 0) {
      if (!started) { ctx.moveTo(x, y); started = true; }
      else ctx.lineTo(x, y);
    }
  });
  ctx.stroke();
  trend.forEach(function(d, idx) {
    if (d.avg <= 0) return;
    var x = padL + idx * stepX;
    var y = padT + chartH - (d.avg / 5) * chartH;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#f472b6';
    ctx.fill();
    ctx.fillStyle = '#64748b';
    ctx.font = '9px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.fillText(d.avg.toFixed(1), x, y - 8);
  });
  ctx.fillStyle = '#94a3b8';
  ctx.font = '9px JetBrains Mono';
  ctx.textAlign = 'center';
  trend.forEach(function(d, idx) {
    var x = padL + idx * stepX;
    ctx.fillText('D' + d.day, x, h - 8);
  });
}

function openAdModal() {
  document.getElementById('adModal').classList.add('active');
  renderAdModal();
}
function closeAdModal() {
  document.getElementById('adModal').classList.remove('active');
}
function renderAdModal() {
  var content = document.getElementById('adContent');
  var activeCampaigns = getActiveCampaigns();
  var adMult = getAdDemandMultiplier();
  var dailySpend = gameState.advertising ? gameState.advertising.dailySpend : 0;
  var html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;">';
  html += '<div style="background:rgba(248,250,252,1);border:1px solid rgba(226,232,240,0.8);border-radius:10px;padding:12px;text-align:center;"><div style="font-size:9px;color:#94a3b8;">投放中广告</div><div style="font-size:22px;font-weight:700;color:#f59e0b;">' + activeCampaigns.length + '</div></div>';
  html += '<div style="background:rgba(248,250,252,1);border:1px solid rgba(226,232,240,0.8);border-radius:10px;padding:12px;text-align:center;"><div style="font-size:9px;color:#94a3b8;">每日广告费</div><div style="font-size:22px;font-weight:700;color:#f87171;">' + formatCurrency(dailySpend) + '</div></div>';
  html += '<div style="background:rgba(248,250,252,1);border:1px solid rgba(226,232,240,0.8);border-radius:10px;padding:12px;text-align:center;"><div style="font-size:9px;color:#94a3b8;">需求加成</div><div style="font-size:22px;font-weight:700;color:#4ade80;">×' + adMult.toFixed(2) + '</div></div>';
  html += '</div>';
  if (activeCampaigns.length > 0) {
    html += '<div style="background:rgba(74,222,128,0.06);border:1px solid rgba(74,222,128,0.15);border-radius:10px;padding:14px;margin-bottom:14px;">';
    html += '<div style="font-size:12px;font-weight:700;color:#4ade80;margin-bottom:8px;">✅ 当前投放</div>';
    activeCampaigns.forEach(function(c) {
      html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(226,232,240,0.6);">';
      html += '<div><span style="font-size:14px;">' + c.icon + '</span> <span style="font-size:11px;color:#fff;font-weight:600;">' + c.name + '</span> <span style="font-size:9px;color:#94a3b8;">D' + c.startDay + '开始</span></div>';
      html += '<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:10px;color:#fbbf24;">' + formatCurrency(c.costPerDay) + '/天</span><span style="font-size:10px;color:#4ade80;">需求×' + c.effectMult.toFixed(2) + '</span>';
      html += '<button style="padding:4px 10px;border:none;border-radius:4px;font-size:9px;font-weight:600;cursor:pointer;background:rgba(231,76,60,0.2);color:#f87171;" onclick="stopAdCampaign(\'' + c.type + '\',\'' + c.cityId + '\');renderAdModal();">停止</button></div>';
      html += '</div>';
    });
    html += '</div>';
  }
  html += '<div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:10px;">📢 选择广告投放</div>';
  html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:14px;">';
  AD_TYPES.forEach(function(ad) {
    var isActive = activeCampaigns.some(function(c){ return c.type === ad.id; });
    var canAfford = gameState.cash >= ad.costPerDay;
    html += '<div style="background:rgba(248,250,252,1);border:1px solid ' + (isActive ? 'rgba(74,222,128,0.3)' : 'rgba(203,213,225,0.8)') + ';border-radius:12px;padding:14px;' + (isActive ? 'box-shadow:0 0 12px rgba(74,222,128,0.1);' : '') + '">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">';
    html += '<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:24px;">' + ad.icon + '</span><div><div style="font-size:13px;font-weight:700;color:#fff;">' + ad.name + '</div><div style="font-size:10px;color:#94a3b8;">' + ad.desc + '</div></div></div>';
    if (isActive) html += '<span style="font-size:9px;padding:2px 6px;background:rgba(74,222,128,0.2);color:#4ade80;border-radius:4px;font-weight:600;">投放中</span>';
    html += '</div>';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">';
    html += '<span style="font-size:11px;color:#64748b;">每日费用</span><span style="font-size:13px;font-weight:700;color:#fbbf24;">' + formatCurrency(ad.costPerDay) + '</span></div>';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">';
    html += '<span style="font-size:11px;color:#64748b;">需求倍率</span><span style="font-size:13px;font-weight:700;color:#4ade80;">×' + ad.effectMult.toFixed(2) + '</span></div>';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">';
    html += '<span style="font-size:11px;color:#64748b;">覆盖范围</span><span style="font-size:11px;color:#64748b;">' + (ad.target === 'global' ? '🌍 全国' : '🏙️ 城市') + '</span></div>';
    if (ad.minDays) {
      html += '<div style="font-size:9px;color:#94a3b8;margin-bottom:6px;">⚠️ 最少投放' + ad.minDays + '天</div>';
    }
    if (!isActive) {
      html += '<button style="width:100%;padding:8px;border:none;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;' + (canAfford ? 'background:linear-gradient(135deg,#27ae60,#2ecc71);color:#fff;' : 'background:rgba(226,232,240,0.8);color:#94a3b8;cursor:not-allowed;') + '" onclick="' + (canAfford ? 'startAdCampaign(\'' + ad.id + '\',\'home\');renderAdModal();' : '') + '">' + (canAfford ? '开始投放' : '资金不足') + '</button>';
    } else {
      html += '<button style="width:100%;padding:8px;border:none;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;background:rgba(231,76,60,0.2);color:#f87171;" onclick="stopAdCampaign(\'' + ad.id + '\',\'home\');renderAdModal();">停止投放</button>';
    }
    html += '</div>';
  });
  html += '</div>';
  var estimatedExtra = Math.round((adMult - 1) * 10);
  html += '<div style="background:rgba(248,250,252,1);border:1px solid rgba(226,232,240,0.8);border-radius:10px;padding:14px;">';
  html += '<div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:8px;">💡 广告效果预估</div>';
  html += '<div style="font-size:11px;color:#64748b;line-height:1.6;">';
  html += '• 当前广告带来约 <span style="color:#4ade80;font-weight:700;">+' + estimatedExtra + '</span> 个额外客户/天<br>';
  html += '• 多个广告效果叠加计算（乘法）<br>';
  html += '• 对手监测到你的广告后可能采取反制措施<br>';
  html += '• 明星代言覆盖所有城市，其余仅限本地</div>';
  html += '</div>';
  content.innerHTML = html;
}