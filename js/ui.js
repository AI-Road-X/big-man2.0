var currentTab = 'myvehicles';
var myFleetSort = { field: 'name', asc: true };
var marketSort = { field: 'price', asc: true };
var selectedVehicles = new Set();

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
  var challengeEl = document.getElementById('challengeDisplay');
  if (challengeEl) {
    var ch = gameState.dailyChallenge;
    if (ch && !ch.claimed) {
      challengeEl.style.display = 'flex';
      var progressPct = ch.target > 0 ? Math.min(100, Math.round(ch.progress / ch.target * 100)) : (ch.progress >= 1 ? 100 : 0);
      var statusColor = ch.completed ? '#22c55e' : '#3b82f6';
      var statusText = ch.completed ? '✅ 已完成' : '进行中 ' + progressPct + '%';
      var streakInfo = (gameState.challengeStreak || 0) > 0 ? ' | 🔥连续' + gameState.challengeStreak + '天' : '';
      challengeEl.innerHTML = '<span style="color:#f59e0b;font-weight:700;">🎯</span> <span style="font-size:11px;color:#1e293b;">' + ch.desc + '</span>' +
        '<span style="margin-left:auto;font-size:10px;padding:2px 8px;border-radius:4px;background:' + (ch.completed ? 'rgba(34,197,94,0.1)' : 'rgba(59,130,246,0.1)') + ';color:' + statusColor + ';font-weight:600;cursor:' + (ch.completed ? 'pointer' : 'default') + ';" ' + (ch.completed ? 'onclick="claimChallengeReward();"' : '') + '>' + statusText + '</span>' +
        '<span style="font-size:9px;color:#94a3b8;margin-left:4px;">$' + formatCurrency(ch.rewardCash) + ' +' + ch.rewardRep + '★' + streakInfo + '</span>';
    } else { challengeEl.style.display = 'none'; }
  }
  var loyaltyEl = document.getElementById('loyaltyDisplay');
  if (loyaltyEl) {
    var loy = gameState.customerLoyalty;
    if (loy) {
      loyaltyEl.style.display = 'flex';
      loyaltyEl.innerHTML = '<span style="color:#a78bfa;font-weight:700;">💜</span> 回头客率:<strong style="color:#7c3aed;">' + (loy.returnRate || 0) + '%</strong> | 投诉:<strong style="color:' + (loy.complaints > 5 ? '#ef4444' : '#94a3b8') + ';">' + (loy.complaints || 0) + '</strong> | 推荐:<strong style="color:#22c55e;">' + (loy.referralCount || 0) + '</strong>';
    } else { loyaltyEl.style.display = 'none'; }
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

function updateMarketTableHeader() {
  var thead = document.querySelector('#vehicleTable thead tr');
  if (!thead) return;
  var headers = [
    {label:'<input type="checkbox" class="veh-checkbox" id="selectAllCheckbox" onchange="toggleSelectAll(this.checked)">',field:'_check',sortable:false},
    {label:'车型信息',field:'name',sortable:false},
    {label:'车牌/来源',field:'source',sortable:false},
    {label:'类型',field:'type',sortable:true},
    {label:'保值率',field:'residual',sortable:true},
    {label:'采购价格',field:'price',sortable:true},
    {label:'日租金',field:'rate',sortable:true},
    {label:'操作',field:'action',sortable:false}
  ];
  thead.innerHTML = headers.map(function(h){
    if (!h.sortable && h.field !== '_check') return '<th>' + h.label + '</th>';
    if (h.field === '_check') return '<th class="select-all-cell">' + h.label + '</th>';
    var arrow = '';
    if (marketSort.field === h.field) arrow = marketSort.asc ? ' ↑' : ' ↓';
    return '<th onclick="sortMarketVehicles(\'' + h.field + '\')" style="cursor:pointer;user-select:none;">' + h.label + arrow + '</th>';
  }).join('');
}

function sortMarketVehicles(field) {
  if(marketSort.field === field) marketSort.asc = !marketSort.asc;
  else { marketSort.field = field; marketSort.asc = true; }
  updateMarketTableHeader();
  if(currentMarketSub === 'used') {
    var catId = currentSubCategory || 'all';
    switchSubCategory(catId);
  } else {
    renderFilteredMarketVehicles(
      currentMarketSub === 'local' ? MARKET_TYPES.LOCAL_DEALER : MARKET_TYPES.OVERSEAS,
      currentMarketSub
    );
  }
}

function applyMarketSort(vehicles, priceField) {
  var arr = vehicles.slice();
  arr.sort(function(a, b){
    var va, vb;
    switch(marketSort.field) {
      case 'price': va = a[priceField] || 0; vb = b[priceField] || 0; break;
      case 'rate': va = getEffectiveDailyRate(a); vb = getEffectiveDailyRate(b); break;
      case 'name': va = (a.brand || '') + ' ' + (a.model || ''); vb = (b.brand || '') + ' ' + (b.model || ''); break;
      case 'type': va = a.type || ''; vb = b.type || ''; break;
      case 'residual': va = a.residualValue || 0; vb = b.residualValue || 0; break;
      default: va = a[priceField] || 0; vb = b[priceField] || 0;
    }
    if(va < vb) return marketSort.asc ? -1 : 1;
    if(va > vb) return marketSort.asc ? 1 : -1;
    return 0;
  });
  return arr;
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
    clearBatchSelection();
    infoBar.style.display = 'none';
    if (marketSubTabs) marketSubTabs.style.display = 'none';
    updateTableHeader([
      {label:'车型信息',field:'name'},{label:'车牌',field:'plate'},{label:'类型',field:'type'},
      {label:'购车成本',field:'cost'},{label:'车龄/里程',field:'age'},{label:'保值率',field:'residual'},
      {label:'🔧车况',field:'condition'},
      {label:'日租金',field:'rate'},{label:'累计利润',field:'profit'},{label:'利润率',field:'margin'},{label:'网点',field:'outlet'},{label:'状态',field:'status'},{label:'操作',field:'action'}
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
    updateTableHeader(['网点名称','状态','等级','车位','今日订单','升级费用','操作','自动管理']);
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
  marketSort = { field: 'price', asc: true };
  clearBatchSelection();
  document.querySelectorAll('.market-sub-tab').forEach(function(t){ t.classList.toggle('active', t.dataset.sub === sub); });
  var refreshBtn = document.getElementById('refreshUsedBtn');
  refreshBtn.style.display = sub === 'used' ? 'flex' : 'none';
  var market = getMarketInfo()[sub];
  if (market) {
    document.getElementById('marketDescription').innerHTML = market.icon + ' ' + market.description;
    document.getElementById('deliveryTime').textContent = '⏱️ ' + market.deliveryTime;
  }
  renderSubCategoryBar(sub);
  updateMarketTableHeader();
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
  vehicles = applyMarketSort(vehicles, 'purchasePrice');
  renderMarketVehicles(vehicles, marketKey);
}

function renderMarketVehicles(vehicles, marketType) {
  var tbody = document.getElementById('vehicleTableBody');
  var ownedOutlets = gameState.outlets.filter(function(o){ return o.owned; });
  var hasCapacity = ownedOutlets.some(function(o){ return getVehiclesAtOutlet(o.id).length < getOutletCapacity(o.id); });
  var fragment = document.createDocumentFragment();
  vehicles.forEach(function(v){
    var fuelInfo = getFuelTypeInfo(v.fuelType);
    var typeInfo = getVehicleTypeInfo(v.type);
    var residualInfo = getResidualValueInfo(v.residualValue);
    var canAfford = gameState.cash >= v.purchasePrice;
    var isChecked = selectedVehicles.has(v.id);
    var row = document.createElement('tr');
    row.innerHTML =
      '<td class="select-all-cell"><input type="checkbox" class="veh-checkbox" data-vid="' + v.id + '" data-price="' + v.purchasePrice + '" data-mtype="' + marketType + '"' + (isChecked ? ' checked' : '') + ' onchange="toggleVehicleSelection(\'' + v.id + '\',' + v.purchasePrice + ',\'' + marketType + '\',this.checked)"></td>' +
      '<td><div class="vehicle-info"><span class="vehicle-name">' + v.brand + ' ' + v.model + '</span><span class="vehicle-brand">' + v.year + '款 · ' + v.fuelConsumption + (v.fuelType === FUEL_TYPES.ELECTRIC ? 'kWh' : 'L') + '/100km</span></div></td>' +
      '<td><span style="color:#94a3b8;font-size:11px;">购买后生成</span></td>' +
      '<td><span class="tag tag-type">' + typeInfo.text + '</span> <span class="tag tag-fuel">' + fuelInfo.icon + ' ' + fuelInfo.text + '</span>' + (v.isExclusive ? ' <span class="tag tag-exclusive">⭐ 独家</span>' : '') + '</td>' +
      '<td><div class="residual-value"><div class="residual-bar"><div class="residual-fill" style="width:' + residualInfo.percentage + '%;background:' + residualInfo.color + ';"></div></div><span class="residual-text" style="color:' + residualInfo.color + ';">' + residualInfo.percentage + '% · ' + residualInfo.level + '</span></div></td>' +
      '<td><span class="price">' + formatCurrency(v.purchasePrice) + '</span></td>' +
      '<td><span class="daily-rate">' + formatCurrency(getEffectiveDailyRate(v)) + '/天</span></td>' +
      '<td>' + renderBuyButton(v.id, v.purchasePrice, marketType, canAfford, hasCapacity) + '</td>';
    fragment.appendChild(row);
  });
  tbody.innerHTML = '';
  tbody.appendChild(fragment);
}

function renderBuyButton(vehicleId, price, marketType, canAfford, hasCapacity) {
  var ownedOutlets = gameState.outlets.filter(function(o){ return o.owned; });
  if (ownedOutlets.length === 0 || !canAfford || !hasCapacity) {
    return '<button class="action-btn btn-buy" disabled>' + (!canAfford ? '资金不足' : !hasCapacity ? '车位已满' : '无法购买') + '</button>';
  }
  var outletOptions = ownedOutlets.map(function(o){
    var cfg = OUTLET_CONFIGS.find(function(c){ return c.id === o.id; }) || OUTLET_CONFIGS[0];
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
    tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><div class="icon">🚗</div><div class="text">' + (filteredList ? '该分类下暂无二手车' : '点击「刷新市场」浏览二手车') + '</div></div></td></tr>';
    return;
  }
  vehicles = applyMarketSort(vehicles.slice(), 'estimatedValue');
  var ownedOutlets = gameState.outlets.filter(function(o){ return o.owned; });
  var hasCapacity = ownedOutlets.some(function(o){ return getVehiclesAtOutlet(o.id).length < getOutletCapacity(o.id); });
  var fragment = document.createDocumentFragment();
  vehicles.forEach(function(v){
    var fuelInfo = getFuelTypeInfo(v.fuelType);
    var typeInfo = getVehicleTypeInfo(v.type);
    var residualInfo = getResidualValueInfo(v.residualValue);
    var canAfford = gameState.cash >= v.estimatedValue;
    var cc = 'condition-good';
    if (v.condition === CONDITION_LEVELS.EXCELLENT) cc = 'condition-excellent';
    else if (v.condition === CONDITION_LEVELS.AVERAGE) cc = 'condition-average';
    else if (v.condition === CONDITION_LEVELS.POOR) cc = 'condition-poor';
    var isChecked = selectedVehicles.has(v.id);
    var row = document.createElement('tr');
    row.innerHTML =
      '<td class="select-all-cell"><input type="checkbox" class="veh-checkbox" data-vid="' + v.id + '" data-price="' + v.estimatedValue + '" data-mtype="used"' + (isChecked ? ' checked' : '') + ' onchange="toggleVehicleSelection(\'' + v.id + '\',' + v.estimatedValue + ',\'used\',this.checked)"></td>' +
      '<td><div class="vehicle-info"><span class="vehicle-name">' + v.brand + ' ' + v.model + '</span><span class="vehicle-brand">' + v.year + '款 · ' + v.mileage.toLocaleString() + 'km · ' + v.age + '年车龄</span></div></td>' +
      '<td><span class="license-plate">' + v.licensePlate + '</span></td>' +
      '<td><span class="tag tag-type">' + typeInfo.text + '</span> <span class="tag tag-fuel">' + fuelInfo.icon + ' ' + fuelInfo.text + '</span> <span class="tag tag-used">二手</span> <span class="condition-tag ' + cc + '">' + v.condition + '</span></td>' +
      '<td><div class="residual-value"><div class="residual-bar"><div class="residual-fill" style="width:' + residualInfo.percentage + '%;background:' + residualInfo.color + ';"></div></div><span class="residual-text" style="color:' + residualInfo.color + ';">' + residualInfo.percentage + '% · ' + residualInfo.level + '</span></div></td>' +
      '<td><span class="price">' + formatCurrency(v.estimatedValue) + '</span></td>' +
      '<td><span class="daily-rate">' + formatCurrency(getEffectiveDailyRate(v)) + '/天</span></td>' +
      '<td>' + renderBuyButton(v.id, v.estimatedValue, 'used', canAfford, hasCapacity) + '</td>';
    fragment.appendChild(row);
  });
  tbody.innerHTML = '';
  tbody.appendChild(fragment);
}

function refreshUsedCarMarket() {
  gameState.usedCarMarketList = generateUsedCarListing(100);
  updateVehicleCounts();
  switchMarketSubTab('used');
  addMessage('二手车市场已刷新，共 <span class="msg-highlight">100</span> 辆车', 'warn');
  saveGame();
}

function toggleVehicleSelection(vid, price, marketType, checked) {
  if (checked) selectedVehicles.add(vid);
  else selectedVehicles.delete(vid);
  updateBatchBar();
}
function toggleSelectAll(checked) {
  var checkboxes = document.querySelectorAll('#vehicleTableBody .veh-checkbox');
  checkboxes.forEach(function(cb){
    var vid = cb.dataset.vid;
    if (checked) selectedVehicles.add(vid);
    else selectedVehicles.delete(vid);
    cb.checked = checked;
  });
  updateBatchBar();
}
function updateBatchBar() {
  var bar = document.getElementById('batchBar');
  if (!bar) return;
  if (selectedVehicles.size === 0 || currentTab !== 'market') {
    bar.classList.remove('show');
    return;
  }
  bar.classList.add('show');
  document.getElementById('batchCount').textContent = selectedVehicles.size;
  var total = 0;
  document.querySelectorAll('#vehicleTableBody .veh-checkbox:checked').forEach(function(cb){
    total += parseInt(cb.dataset.price) || 0;
  });
  document.getElementById('batchTotal').textContent = formatCurrency(total);
  var selectEl = document.getElementById('batchOutletSelect');
  var ownedOutlets = gameState.outlets.filter(function(o){ return o.owned; });
  if (selectEl.children.length === 0 || parseInt(selectEl.dataset.outletCount || 0) !== ownedOutlets.length) {
    selectEl.innerHTML = '';
    ownedOutlets.forEach(function(o){
      var cfg = OUTLET_CONFIGS[o.id];
      var count = getVehiclesAtOutlet(o.id).length;
      var cap = getOutletCapacity(o.id);
      var opt = document.createElement('option');
      opt.value = o.id;
      opt.textContent = cfg.name + ' (' + count + '/' + cap + ')';
      selectEl.appendChild(opt);
    });
    selectEl.dataset.outletCount = ownedOutlets.length;
  }
  var buyBtn = document.getElementById('batchBuyBtn');
  buyBtn.disabled = (ownedOutlets.length === 0 || gameState.cash < total);
  var saEl = document.getElementById('selectAllCheckbox');
  if (saEl) {
    var allCb = document.querySelectorAll('#vehicleTableBody .veh-checkbox');
    var checkedCb = document.querySelectorAll('#vehicleTableBody .veh-checkbox:checked');
    saEl.checked = allCb.length > 0 && allCb.length === checkedCb.length;
    saEl.indeterminate = checkedCb.length > 0 && checkedCb.length < allCb.length;
  }
}
function executeBatchBuy() {
  if (selectedVehicles.size === 0) return;
  var outletId = parseInt(document.getElementById('batchOutletSelect').value);
  var outletState = getOutletState(outletId);
  if (!outletState || !outletState.owned) { showToast('请选择有效的交付网点', 'error'); return; }
  var capacity = getOutletCapacity(outletId);
  var currentAtOutlet = getVehiclesAtOutlet(outletId).length;
  var toBuy = [];
  var totalPrice = 0;
  selectedVehicles.forEach(function(vid){
    var cb = document.querySelector('.veh-checkbox[data-vid="' + vid + '"]');
    if (!cb) return;
    var price = parseInt(cb.dataset.price) || 0;
    var mtype = cb.dataset.mtype || 'local';
    var vehicle = null;
    if (mtype === 'used') vehicle = gameState.usedCarMarketList.find(function(v){ return v.id === vid; });
    else vehicle = getVehicleById(vid);
    if (!vehicle) return;
    toBuy.push({vehicle:vehicle, price:price, marketType:mtype});
    totalPrice += price;
  });
  if (toBuy.length === 0) { showToast('没有可购买的车辆', 'error'); return; }
  if (gameState.cash < totalPrice) { showToast('资金不足！需要 ' + formatCurrency(totalPrice), 'error'); return; }
  var availableSlots = capacity - currentAtOutlet;
  if (toBuy.length > availableSlots) { showToast(OUTLET_CONFIGS[outletId].name + '车位不足！只能再停 ' + availableSlots + ' 辆', 'error'); return; }
  gameState.cash -= totalPrice;
  var boughtCount = 0;
  toBuy.forEach(function(item){
    var v = item.vehicle;
    var plate = v.isNew ? generateLicensePlate() : (v.licensePlate || generateLicensePlate());
    var ownedVehicle = Object.assign({}, v, { licensePlate: plate, outletId: outletId, purchasePrice: item.price, purchaseDay: gameState.currentDay, rentedUntil: 0 });
    delete ownedVehicle.market;
    gameState.ownedVehicles.push(ownedVehicle);
    if (item.marketType === 'used') {
      gameState.usedCarMarketList = gameState.usedCarMarketList.filter(function(cv){ return cv.id !== v.id; });
    }
    boughtCount++;
  });
  addMessage('🛒 批量购入 ' + boughtCount + ' 辆车 → ' + OUTLET_CONFIGS[outletId].name + '，总花费 ' + formatCurrency(totalPrice), 'good');
  selectedVehicles.clear();
  var bar = document.getElementById('batchBar');
  if (bar) bar.classList.remove('show');
  updateUI(); updateVehicleCounts();
  switchTab(currentTab);
  showToast('成功批量购买 ' + boughtCount + ' 辆车！', 'success');
}
function clearBatchSelection() {
  selectedVehicles.clear();
  var bar = document.getElementById('batchBar');
  if (bar) bar.classList.remove('show');
  document.querySelectorAll('#vehicleTableBody .veh-checkbox').forEach(function(cb){ cb.checked = false; });
  var saEl = document.getElementById('selectAllCheckbox');
  if (saEl) { saEl.checked = false; saEl.indeterminate = false; }
}
function getVehicleTotalProfit(vehicleId) {
  var totalProfit = 0;
  if (gameState.completedOrders) {
    gameState.completedOrders.forEach(function(o){
      if (o.vehicleId === vehicleId && o.netIncome) totalProfit += o.netIncome;
    });
  }
  if (totalProfit === 0) {
    var v = gameState.ownedVehicles.find(function(v){ return v.id === vehicleId; });
    if (v) {
      var daysOwned = Math.max(1, gameState.currentDay - (v.purchaseDay || gameState.currentDay));
      var estRentDays = Math.floor(daysOwned * 0.5);
      totalProfit = Math.round(estRentDays * getEffectiveDailyRate(v) * 0.55);
    }
  }
  return totalProfit;
}
function getVehicleProfitMargin(vehicleId) {
  var v = gameState.ownedVehicles.find(function(v){ return v.id === vehicleId; });
  if (!v) return 0;
  var cost = v.purchasePrice || v.estimatedValue || 1;
  var profit = getVehicleTotalProfit(vehicleId);
  return Math.round(profit / cost * 1000) / 10;
}
function renderMyFleet() {
  var tbody = document.getElementById('vehicleTableBody');
  if (gameState.ownedVehicles.length === 0) {
    tbody.innerHTML = '<tr><td colspan="13"><div class="empty-state"><div class="icon">🚗</div><div class="text">暂无车辆，前往市场购买吧！</div></div></td></tr>';
    return;
  }

  var totalV = gameState.ownedVehicles.length;
  var availV = gameState.ownedVehicles.filter(function(v){ return (!v.rentedUntil || v.rentedUntil < gameState.currentDay) && !isInTransit(v.id); }).length;
  var rentedV = gameState.ownedVehicles.filter(function(v){ return v.rentedUntil && v.rentedUntil >= gameState.currentDay; }).length;
  var transitV = gameState.ownedVehicles.filter(function(v){ return isInTransit(v.id); }).length;
  var utilRate = totalV > 0 ? Math.round(rentedV / totalV * 100) : 0;
  var totalValue = gameState.ownedVehicles.reduce(function(s,v){ return s + calculateVehicleValue(v); }, 0);
  var totalProfitAll = gameState.ownedVehicles.reduce(function(s,v){ return s + getVehicleTotalProfit(v.id); }, 0);

  var toolbarRow = document.createElement('tr');
  var filterStatus = window._fleetFilter || 'all';
  toolbarRow.innerHTML = '<td colspan="13"><div style="padding:10px 12px;background:linear-gradient(135deg,rgba(34,197,94,0.05),rgba(59,130,246,0.05));border-radius:10px;border:1px solid rgba(203,213,225,0.4);margin-bottom:6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
    '<span style="font-size:11px;font-weight:700;color:#1e293b;">🔍 筛选:</span>' +
    '<button style="padding:4px 10px;border-radius:6px;font-size:10px;font-weight:600;cursor:pointer;border:1px solid ' + (filterStatus==='all'?'#3b82f6':'rgba(203,213,225,1)') + ';background:' + (filterStatus==='all'?'rgba(59,130,246,0.1)':'transparent') + ';color:' + (filterStatus==='all'?'#3b82f6':'#64748b') + ';" onclick="_fleetFilter=\'all\';renderMyFleet();">全部(' + totalV + ')</button>' +
    '<button style="padding:4px 10px;border-radius:6px;font-size:10px;font-weight:600;cursor:pointer;border:1px solid ' + (filterStatus==='available'?'#22c55e':'rgba(203,213,225,1)') + ';background:' + (filterStatus==='available'?'rgba(34,197,94,0.1)':'transparent') + ';color:' + (filterStatus==='available'?'#22c55e':'#64748b') + ';" onclick="_fleetFilter=\'available\';renderMyFleet();">✅ 可用(' + availV + ')</button>' +
    '<button style="padding:4px 10px;border-radius:6px;font-size:10px;font-weight:600;cursor:pointer;border:1px solid ' + (filterStatus==='rented'?'#f59e0b':'rgba(203,213,225,1)') + ';background:' + (filterStatus==='rented'?'rgba(245,158,11,0.1)':'transparent') + ';color:' + (filterStatus==='rented'?'#f59e0b':'#64748b') + ';" onclick="_fleetFilter=\'rented\';renderMyFleet();">📋 已租(' + rentedV + ')</button>' +
    '<button style="padding:4px 10px;border-radius:6px;font-size:10px;font-weight:600;cursor:pointer;border:1px solid ' + (filterStatus==='transit'?'#60a5fa':'rgba(203,213,225,1)') + ';background:' + (filterStatus==='transit'?'rgba(96,165,250,0.1)':'transparent') + ';color:' + (filterStatus==='transit'?'#60a5fa':'#64748b') + ';" onclick="_fleetFilter=\'transit\';renderMyFleet();">🚚 调度中(' + transitV + ')</button>' +
    '<div style="width:1px;height:18px;background:rgba(203,213,225,0.5);"></div>' +
    '<span style="font-size:9px;color:#94a3b8;">利用率 <strong style="color:#3b82f6;">' + utilRate + '%</strong> | 车队总值 <strong style="color:#22c55e;">' + formatCurrency(totalValue) + '</strong> | 累计利润 <strong style="color:#f59e0b;">' + formatCurrency(totalProfitAll) + '</strong></span>' +
    '</div></td>';
  tbody.appendChild(toolbarRow);

  var sorted = gameState.ownedVehicles.slice();
  sorted.sort(function(a, b) {
    var va, vb;
    switch (myFleetSort.field) {
      case 'name': va = a.brand + a.model; vb = b.brand + b.model; break;
      case 'plate': va = a.licensePlate || ''; vb = b.licensePlate || ''; break;
      case 'type': va = a.type; vb = b.type; break;
      case 'cost': va = a.purchasePrice || 0; vb = b.purchasePrice || 0; break;
      case 'age': va = a.age || (gameState.currentDay - (a.purchaseDay || gameState.currentDay)); vb = b.age || (gameState.currentDay - (b.purchaseDay || gameState.currentDay)); break;
      case 'residual': va = a.residualValue || 0.5; vb = b.residualValue || 0.5; break;
      case 'rate': va = getEffectiveDailyRate(a); vb = getEffectiveDailyRate(b); break;
      case 'profit':
        var pa = typeof getVehicleTotalProfit === 'function' ? getVehicleTotalProfit(a.id) : 0;
        var pb = typeof getVehicleTotalProfit === 'function' ? getVehicleTotalProfit(b.id) : 0;
        va = pa; vb = pb; break;
      case 'margin':
        var ma = typeof getVehicleProfitMargin === 'function' ? getVehicleProfitMargin(a.id) : 0;
        var mb = typeof getVehicleProfitMargin === 'function' ? getVehicleProfitMargin(b.id) : 0;
        va = ma; vb = mb; break;
      case 'outlet': va = a.outletId; vb = b.outletId; break;
      case 'condition':
        var ca = typeof getVehicleCondition === 'function' ? getVehicleCondition(a) : (a.condition || 100);
        var cb = typeof getVehicleCondition === 'function' ? getVehicleCondition(b) : (b.condition || 100);
        va = ca; vb = cb; break;
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

  var ownedOutlets = gameState.outlets.filter(function(o){ return o.owned; });
  var filterStatus = window._fleetFilter || 'all';
  var fragment = document.createDocumentFragment();
  sorted.forEach(function(v){
    if (filterStatus === 'available' && (v.rentedUntil && v.rentedUntil >= gameState.currentDay || isInTransit(v.id))) return;
    if (filterStatus === 'rented' && !(v.rentedUntil && v.rentedUntil >= gameState.currentDay)) return;
    if (filterStatus === 'transit' && !isInTransit(v.id)) return;
    var fuelInfo = getFuelTypeInfo(v.fuelType);
    var typeInfo = getVehicleTypeInfo(v.type);
    var currentValue = calculateVehicleValue(v);
    var sellPrice = Math.round(currentValue * 0.85);
    var voutletId = typeof v.outletId !== 'undefined' && v.outletId !== null ? v.outletId : 0;
    var outletCfg = OUTLET_CONFIGS.find(function(c){ return c.id === voutletId; }) || OUTLET_CONFIGS[0];
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

    var canDispatch = !inTransit && !(v.rentedUntil && v.rentedUntil >= gameState.currentDay);

    var totalProfit = getVehicleTotalProfit(v.id);
    var profitMargin = getVehicleProfitMargin(v.id);
    var marginColor = profitMargin > 50 ? '#22c55e' : profitMargin >= 20 ? '#eab308' : '#ef4444';
    var costDisplay = v.isNew ? formatCurrency(v.purchasePrice || currentValue) : formatCurrency(v.estimatedValue || currentValue);
    var ageDisplay = v.isNew ? '新车 · D' + (v.purchaseDay || gameState.currentDay) + '购入' : (v.age || '?') + '年车龄 · ' + (v.mileage || 0).toLocaleString() + 'km';
    var residualInfo = typeof getResidualValueInfo === 'function' ? getResidualValueInfo(v.residualValue || (v.isNew ? 1.0 : 0.6)) : { percentage: Math.round((v.residualValue || 0.6) * 100), level: '-', color: '#94a3b8' };
    var residualBarColor = residualInfo.color || '#94a3b8';

    var resWarn = residualInfo.percentage < 20 ? '<div style="margin-top:2px;padding:2px 6px;background:rgba(239,68,68,0.08);border-radius:4px;font-size:9px;color:#ef4444;font-weight:600;">⚠️ 保值率过低·建议售出</div>' : (residualInfo.percentage < 30 ? '<div style="margin-top:2px;font-size:9px;color:#f59e0b;">⚡ 保值率偏低</div>' : '');

    var vehicleCond = typeof getVehicleCondition === 'function' ? getVehicleCondition(v) : (v.condition || 100);
    var condLabel = typeof getConditionLabel === 'function' ? getConditionLabel(vehicleCond) : { text: '' + vehicleCond + '%', color: '#22c55e' };
    var condPenalty = typeof getConditionPenaltyMultiplier === 'function' ? getConditionPenaltyMultiplier(v) : null;
    var condWarnHtml = '';
    if (vehicleCond < 20) condWarnHtml = '<span style="color:#ef4444;font-weight:700;">⚠️ 故障风险!</span>';
    else if (vehicleCond < 50) condWarnHtml = '<span style="color:#f59e0b;font-size:9px;">需保养</span>';
    var canMaintain = !inTransit && !(v.rentedUntil && v.rentedUntil >= gameState.currentDay);

    var row = document.createElement('tr');
    row.innerHTML =
      '<td><div class="vehicle-info"><span class="vehicle-name">' + v.brand + ' ' + v.model + '</span><span class="vehicle-brand">' + v.year + '款</span></div></td>' +
      '<td><span class="license-plate">' + (v.licensePlate || '-') + '</span></td>' +
      '<td><span class="tag tag-type">' + typeInfo.text + '</span> <span class="tag tag-fuel">' + fuelInfo.icon + ' ' + fuelInfo.text + '</span>' + (!v.isNew && v.condition ? ' <span class="condition-tag condition-' + v.condition.charAt(0) + '">' + v.condition + '</span>' : '') + '</td>' +
      '<td><span style="font-size:12px;font-weight:600;color:#1e293b;">' + costDisplay + '</span></td>' +
      '<td><span style="font-size:11px;color:#475569;">' + ageDisplay + '</span></td>' +
      '<td><div style="display:flex;align-items:center;gap:4px;"><div style="flex:1;height:14px;background:#e2e8f0;border-radius:3px;overflow:hidden;min-width:40px;"><div style="height:100%;width:' + residualInfo.percentage + '%;background:' + residualBarColor + ';border-radius:3px;"></div></div><span style="font-size:9px;color:' + residualBarColor + ';font-weight:600;white-space:nowrap;">' + residualInfo.percentage + '%</span></div>' + resWarn + '</td>' +
      '<td><div style="display:flex;align-items:center;gap:4px;"><div style="flex:1;height:14px;background:#e2e8f0;border-radius:3px;overflow:hidden;min-width:35px;"><div style="height:100%;width:' + vehicleCond + '%;background:' + condLabel.color + ';border-radius:3px;"></div></div><span style="font-size:9px;color:' + condLabel.color + ';font-weight:600;">' + vehicleCond + '%</span></div>' + (condPenalty && condPenalty.fuelMult > 1 ? '<br><span style="font-size:8px;color:#ef4444;">油耗+' + Math.round((condPenalty.fuelMult-1)*100) + '%</span>' : '') + condWarnHtml + (canMaintain && vehicleCond < 100 ? '<br><button style="margin-top:2px;padding:1px 6px;border:none;border-radius:3px;font-size:9px;cursor:pointer;background:linear-gradient(135deg,#059669,#10b981);color:#fff;" onclick="maintainVehicle(\'' + v.id + '\');renderMyFleet();">🔧保养</button>' : '') + '</td>' +
      '<td><span class="daily-rate">' + formatCurrency(getEffectiveDailyRate(v)) + '/天</span><br><span style="font-size:10px;color:#94a3b8;">倍率 ' + getRateMultiplier(v.type).toFixed(1) + 'x</span></td>' +
      '<td><span style="font-size:12px;font-weight:700;color:#1e293b;">' + formatCurrency(totalProfit) + '</span></td>' +
      '<td><span style="font-size:12px;font-weight:700;color:' + marginColor + ';">' + profitMargin + '%</span></td>' +
      '<td><span style="font-size:11px;color:#64748b;">' + outletLabel + '</span></td>' +
      '<td>' + statusHtml + '</td>' +
      '<td><button class="action-btn btn-sell" onclick="sellVehicle(\'' + v.id + '\')" style="margin-bottom:4px;">出售 ' + formatCurrency(sellPrice) + '</button>' + (canDispatch ? '<button class="action-btn btn-dispatch" onclick="openDispatchModal(\'' + v.id + '\')">调度</button>' : '') + '</td>';
    fragment.appendChild(row);
  });
  tbody.innerHTML = '';
  tbody.appendChild(fragment);
}

function sortMyFleet(field) {
  if (myFleetSort.field === field) myFleetSort.asc = !myFleetSort.asc;
  else { myFleetSort.field = field; myFleetSort.asc = true; }
  updateTableHeader([
    {label:'车型信息',field:'name'},{label:'车牌',field:'plate'},{label:'类型',field:'type'},
    {label:'购车成本',field:'cost'},{label:'车龄/里程',field:'age'},{label:'保值率',field:'residual'},
    {label:'🔧车况',field:'condition'},
    {label:'日租金',field:'rate'},{label:'累计利润',field:'profit'},{label:'利润率',field:'margin'},{label:'网点',field:'outlet'},{label:'状态',field:'status'},{label:'操作',field:'action'}
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

  var utilRate = total > 0 ? Math.round(rented / total * 100) : 0;
  var totalValue = gameState.ownedVehicles.reduce(function(s,v){ return s + calculateVehicleValue(v); }, 0);
  var totalProfitAll = gameState.ownedVehicles.reduce(function(s,v){ return s + getVehicleTotalProfit(v.id); }, 0);
  var avgMargin = total > 0 ? Math.round(totalProfitAll / (totalValue || 1) * 1000) / 10 : 0;

  var statsRow = document.createElement('tr');
  statsRow.innerHTML = '<td colspan="7"><div class="status-grid">' +
    '<div class="status-card"><div class="status-label">总车队</div><div class="status-value" style="color:#60a5fa;">' + total + ' 辆</div></div>' +
    '<div class="status-card"><div class="status-label">可用</div><div class="status-value" style="color:#4ade80;">' + available + ' 辆</div></div>' +
    '<div class="status-card"><div class="status-label">已租出</div><div class="status-value" style="color:#fbbf24;">' + rented + ' 辆</div></div>' +
    '<div class="status-card"><div class="status-label">调度中</div><div class="status-value" style="color:#60a5fa;">' + inTransit + ' 辆</div></div>' +
    '<div class="status-card"><div class="status-label">利用率</div><div class="status-value" style="color:' + (utilRate >= 70 ? '#22c55e' : utilRate >= 40 ? '#f59e0b' : '#ef4444') + ';">' + utilRate + '%</div></div>' +
    '<div class="status-card"><div class="status-label">平均日租金</div><div class="status-value" style="color:#a78bfa;">' + formatCurrency(avgRate) + '</div></div>' +
    '<div class="status-card"><div class="status-label">车队总值</div><div class="status-value" style="color:#22c55e;">' + formatCurrency(totalValue) + '</div></div>' +
    '<div class="status-card"><div class="status-label">累计利润率</div><div class="status-value" style="color:' + (avgMargin >= 30 ? '#22c55e' : avgMargin >= 10 ? '#f59e0b' : '#ef4444') + ';">' + avgMargin + '%</div></div>' +
    (function(){ var avgCond = total > 0 ? Math.round(gameState.ownedVehicles.reduce(function(s,v){ return s + (v.condition||100); }, 0) / total) : 100; var lowCondCount = gameState.ownedVehicles.filter(function(v){ return (v.condition||100) < 30; }).length; return '<div class="status-card"><div class="status-label">🔧平均车况</div><div class="status-value" style="color:' + (avgCond >= 80 ? '#22c55e' : avgCond >= 50 ? '#3b82f6' : avgCond >= 20 ? '#f59e0b' : '#ef4444') + ';">' + avgCond + '%' + (lowCondCount > 0 ? ' <span style="font-size:9px;color:#ef4444;">(' + lowCondCount + '辆危险)</span>' : '') + '</div></div>'; })() +
    (function(){ var loy = gameState.customerLoyalty; if (!loy) return ''; return '<div class="status-card"><div class="status-label">💜回头客率</div><div class="status-value" style="color:#7c3aed;">' + (loy.returnRate || 0) + '%</div></div>'; })() +
    '</div></td>';
  tbody.appendChild(statsRow);

  var actionRow = document.createElement('tr');
  actionRow.innerHTML = '<td colspan="7"><div style="display:flex;gap:6px;padding:8px;background:rgba(248,250,252,1);border-radius:8px;flex-wrap:wrap;margin-bottom:6px;">' +
    '<button class="action-btn" style="padding:5px 12px;font-size:10px;" onclick="switchTab(\'myvehicles\')">🚗 查看车队详情</button>' +
    '<button class="action-btn" style="padding:5px 12px;font-size:10px;" onclick="switchTab(\'pricing\')">💰 调整定价</button>' +
    '<button class="action-btn" style="padding:5px 12px;font-size:10px;" onclick="switchTab(\'outlets\')">🏢 网点管理</button>' +
    (gameState.ownedVehicles.some(function(v){ return !v.rentedUntil || v.rentedUntil < gameState.currentDay; }) ?
      '<button class="action-btn" style="padding:5px 12px;font-size:10px;background:linear-gradient(135deg,#059669,#10b981);" onclick="switchTab(\'market\')">🛒 购买新车</button>' : '') +
    '</div></td>';
  tbody.appendChild(actionRow);

  if (total > 0) {
    var profitRanking = gameState.ownedVehicles.slice().sort(function(a,b){ return getVehicleTotalProfit(b.id) - getVehicleTotalProfit(a.id); }).slice(0, 5);
    var rankRow = document.createElement('tr');
    var rankHtml = '<td colspan="7"><div style="padding:10px;background:linear-gradient(135deg,rgba(245,158,11,0.06),rgba(239,68,68,0.04));border-radius:10px;border:1px solid rgba(203,213,225,0.3);margin-bottom:6px;">';
    rankHtml += '<div style="font-size:11px;font-weight:700;color:#1e293b;margin-bottom:6px;">🏆 利润排行榜 TOP5</div>';
    rankHtml += '<div style="display:flex;gap:8px;flex-wrap:wrap;">';
    profitRanking.forEach(function(v, i){
      var medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i+1)+'.';
      var profit = getVehicleTotalProfit(v.id);
      var margin = getVehicleProfitMargin(v.id);
      var marginColor = margin > 50 ? '#22c55e' : margin >= 20 ? '#f59e0b' : '#ef4444';
      rankHtml += '<div style="flex:1;min-width:140px;padding:8px;background:#fff;border-radius:8px;border:1px solid rgba(226,232,240,0.8);">';
      rankHtml += '<div style="font-size:10px;font-weight:600;color:#1e293b;">' + medal + ' ' + v.brand + ' ' + v.model + ' <span style="color:#94a3b8;font-weight:400;">' + (v.licensePlate||'') + '</span></div>';
      rankHtml += '<div style="display:flex;gap:8px;margin-top:4px;"><span style="font-size:9px;color:#22c55e;">利润 $' + formatCurrency(profit) + '</span><span style="font-size:9px;color:' + marginColor + ';">' + margin + '%</span></div>';
      rankHtml += '</div>';
    });
    rankHtml += '</div></div></td>';
    rankRow.innerHTML = rankHtml;
    tbody.appendChild(rankRow);
  }

  var typeCounts = {};
  gameState.ownedVehicles.forEach(function(v){ typeCounts[v.type] = (typeCounts[v.type] || 0) + 1; });
  Object.keys(typeCounts).forEach(function(type){
    var count = typeCounts[type];
    var typeVehicles = gameState.ownedVehicles.filter(function(v){ return v.type === type; });
    var typeAvailable = typeVehicles.filter(function(v){ return (!v.rentedUntil || v.rentedUntil < gameState.currentDay) && !isInTransit(v.id); }).length;
    var typeRented = typeVehicles.filter(function(v){ return v.rentedUntil && v.rentedUntil >= gameState.currentDay; }).length;
    var typeAvgRate = typeVehicles.length > 0 ? Math.round(typeVehicles.reduce(function(s,v){ return s + getEffectiveDailyRate(v); }, 0) / typeVehicles.length) : 0;
    var typeUtil = count > 0 ? Math.round(typeRented / count * 100) : 0;
    var typeAvgResidual = count > 0 ? Math.round(typeVehicles.reduce(function(s,v){ return s + (v.residualValue || (v.isNew ? 1 : 0.6)); }, 0) / count * 100) : 60;
    var resWarnColor = typeAvgResidual < 20 ? '#ef4444' : typeAvgResidual < 30 ? '#f59e0b' : '#94a3b8';
    var resWarnText = typeAvgResidual < 20 ? ' ⚠️偏低·建议售出' : typeAvgResidual < 30 ? ' ⚡注意' : '';
    var row = document.createElement('tr');
    row.innerHTML =
      '<td><span class="tag tag-type">' + type + '</span></td>' +
      '<td>' + count + ' 辆</td>' +
      '<td>可用 <b style="color:#22c55e;">' + typeAvailable + '</b> / 租出 <b style="color:#f59e0b;">' + typeRented + '</b> <span style="font-size:9px;color:' + (typeUtil >= 70 ? '#22c55e' : typeUtil >= 40 ? '#f59e0b' : '#94a3b8') + ';">(利用率' + typeUtil + '%)</span></td>' +
      '<td>—</td><td><span style="font-size:11px;color:' + resWarnColor + ';font-weight:600;">保值' + typeAvgResidual + '%' + resWarnText + '</span></td>' +
      '<td>均价 ' + formatCurrency(typeAvgRate) + '/天</td>' +
      '<td><span style="font-size:10px;color:#94a3b8;">倍率 ' + getRateMultiplier(type).toFixed(1) + 'x</span></td>';
    tbody.appendChild(row);
  });

  if (gameState.activeEvents.length > 0) {
    var eventRow = document.createElement('tr');
    eventRow.innerHTML = '<td colspan="8" style="padding:12px;"><div style="font-size:11px;color:#fbbf24;font-weight:600;margin-bottom:6px;">⚡ 当前活跃事件</div>' +
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
  var managerCount = (gameState.employees || []).filter(function(e){ return e.role === '店长'; }).length;
  var ownedOutletCount = gameState.outlets.filter(function(o){ return o.owned; }).length;
  OUTLET_CONFIGS.forEach(function(cfg){
    var os = getOutletState(cfg.id);
    var isOwned = os && os.owned;
    var lvl = isOwned ? OUTLET_LEVELS.find(function(l){ return l.level === os.level; }) : OUTLET_LEVELS[0];
    var cap = lvl ? lvl.capacity : 20;
    var vehCount = isOwned ? getVehiclesAtOutlet(cfg.id).length : 0;
    var nextLevel = isOwned ? OUTLET_LEVELS.find(function(l){ return l.level === os.level + 1; }) : null;
    var requiredManagersForUnlock = Math.max(1, ownedOutletCount);
    var canUnlockByManager = managerCount >= requiredManagersForUnlock || isOwned;
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
        : (!canUnlockByManager
          ? '<button class="action-btn btn-buy" disabled title="需要' + requiredManagersForUnlock + '名店长（当前' + managerCount + '名）">🔓 需店长(' + managerCount + '/' + requiredManagersForUnlock + ')</button>'
          : '<button class="action-btn btn-buy" onclick="unlockOutlet(' + cfg.id + ')" ' + (gameState.cash < cfg.unlockCost ? 'disabled' : '') + '>🔓 解锁</button>')) + '</td>' +
      '<td>' + (isOwned ? '<div><label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:10px;color:#64748b;"><input type="checkbox" ' + (os.autoManageEnabled ? 'checked' : '') + ' onchange="toggleAutoManage(' + cfg.id + ');renderOutlets();" style="cursor:pointer;"> 自动管理</label>' +
        (os.autoManageEnabled ? '<div style="margin-top:3px;font-size:9px;display:flex;align-items:center;gap:2px;"><span>利润门槛:</span><input type="number" value="' + (os.autoProfitThreshold || 100) + '" min="0" max="5000" step="50" style="width:55px;padding:1px 3px;border:1px solid #cbd5e1;border-radius:3px;font-size:9px;" onchange="setAutoProfitThreshold(' + cfg.id + ',this.value);"><span style="color:#94a3b8;">$</span></div>' : '') + '</div>' : '-') + '</td>';
    tbody.appendChild(row);
  });
  if (!isOwned || ownedOutletCount > 1) {
    var tipRow = document.createElement('tr');
    tipRow.innerHTML = '<td colspan="8"><div style="padding:10px;background:rgba(245,158,11,0.06);border-radius:8px;font-size:10px;color:#92400e;line-height:1.7;">' +
      '<div style="font-weight:700;color:#b45309;margin-bottom:4px;">👔 网点解锁规则</div>' +
      '• 每个新网点需要 <strong>1名店长</strong> 管理（当前：' + managerCount + ' 名店长 / ' + ownedOutletCount + ' 个已开网点）<br>' +
      '• 第2个网点需1名店长，第3个需2名...以此类推<br>' +
      '• 店长可在「人才市场」招聘，建议优先招聘店长再扩张网点</div></td>';
    tbody.appendChild(tipRow);
  }
}

function renderPricing() {
  var tbody = document.getElementById('vehicleTableBody');
  tbody.innerHTML = '';
  var types = Object.values(VEHICLE_TYPES);
  var hasAnyVehicle = gameState.ownedVehicles.length > 0;

  var toolbarRow = document.createElement('tr');
  var toolbarHtml = '<td colspan="7"><div style="padding:14px;background:linear-gradient(135deg,rgba(99,102,241,0.06),rgba(168,85,247,0.06));border-radius:12px;border:1px solid rgba(168,85,247,0.15);margin-bottom:4px;">';
  toolbarHtml += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-wrap:wrap;"><span style="font-size:13px;font-weight:700;color:#7c3aed;">⚡ 一键调价</span>';
  toolbarHtml += '<button class="action-btn" style="padding:5px 12px;font-size:10px;background:linear-gradient(135deg,#059669,#10b981);color:#fff;border:none;" onclick="batchSetAllPrices(80)">📉 全部8折</button>';
  toolbarHtml += '<button class="action-btn" style="padding:5px 12px;font-size:10px;background:linear-gradient(135deg,#2563eb,#3b82f6);color:#fff;border:none;" onclick="batchSetAllPrices(100)">↩️ 恢复原价</button>';
  toolbarHtml += '<button class="action-btn" style="padding:5px 12px;font-size:10px;background:linear-gradient(135deg,#d97706,#f59e0b);color:#fff;border:none;" onclick="batchSetAllPrices(120)">📈 加价20%</button>';
  toolbarHtml += '<button class="action-btn" style="padding:5px 12px;font-size:10px;background:linear-gradient(135deg,#dc2626,#ef4444);color:#fff;border:none;" onclick="batchSetAllPrices(150)">🚀 加价50%</button>';
  toolbarHtml += '<div style="width:1px;height:20px;background:rgba(203,213,225,0.6);"></div>';
  toolbarHtml += '<span style="font-size:11px;color:#94a3b8;">策略预设：</span>';
  toolbarHtml += '<button class="action-btn" style="padding:5px 10px;font-size:10px;background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.3);" onclick="applyPriceStrategy(\'aggressive\')">🔥 激进高价</button>';
  toolbarHtml += '<button class="action-btn" style="padding:5px 10px;font-size:10px;background:rgba(59,130,246,0.1);color:#3b82f6;border:1px solid rgba(59,130,246,0.3);" onclick="applyPriceStrategy(\'balanced\')">⚖️ 平衡策略</button>';
  toolbarHtml += '<button class="action-btn" style="padding:5px 10px;font-size:10px;background:rgba(16,185,129,0.1);color:#10b981;border:1px solid rgba(16,185,129,0.3);" onclick="applyPriceStrategy(\'volume\')">🏃 薄利多销</button>';
  toolbarHtml += '<button class="action-btn" style="padding:5px 10px;font-size:10px;background:rgba(168,85,247,0.1);color:#a855f7;border:1px solid rgba(168,85,247,0.3);" onclick="applyPriceStrategy(\'premium\')">💎 高端溢价</button>';
  toolbarHtml += '</div>';

  if (hasAnyVehicle) {
    var avgMult = 0;
    var typeCount = 0;
    types.forEach(function(t){ var m = getRateMultiplier(t); var c = gameState.ownedVehicles.filter(function(v){ return v.type === t; }).length; if(c>0){ avgMult+=m; typeCount++; } });
    avgMult = typeCount > 0 ? avgMult / typeCount : 1;
    var estDailyRevenue = 0;
    gameState.ownedVehicles.forEach(function(v){ if(!v.rentedUntil || v.rentedUntil < gameState.currentDay) estDailyRevenue += getEffectiveDailyRate(v); });
    toolbarHtml += '<div style="display:flex;gap:16px;flex-wrap:wrap;padding-top:8px;border-top:1px dashed rgba(168,85,247,0.2);">';
    toolbarHtml += '<div><span style="font-size:10px;color:#94a3b8;">平均倍率</span><br><span style="font-family:JetBrains Mono,monospace;font-size:15px;font-weight:700;color:#7c3aed;">' + avgMult.toFixed(2) + 'x</span></div>';
    toolbarHtml += '<div><span style="font-size:10px;color:#94a3b8;">市场系数</span><br><span style="font-family:JetBrains Mono,monospace;font-size:15px;font-weight:700;color:' + (gameState.marketCoefficient >= 1 ? '#10b981' : '#f87171') + ';">' + gameState.marketCoefficient.toFixed(2) + '</span></div>';
    toolbarHtml += '<div><span style="font-size:10px;color:#94a3b8;">预估日收</span><br><span style="font-family:JetBrains Mono,monospace;font-size:15px;font-weight:700;color:#059669;">' + formatCurrency(estDailyRevenue) + '</span></div>';
    toolbarHtml += '<div><span style="font-size:10px;color:#94a3b8;">声誉加成</span><br><span style="font-family:JetBrains Mono,monospace;font-size:15px;font-weight:700;color:#f59e0b;">' + ((gameState.reputation||50) < 70 ? '偏低' : (gameState.reputation||50) < 90 ? '良好' : '优秀') + '</span></div>';
    toolbarHtml += '</div>';
  }
  toolbarHtml += '</div></td>';
  toolbarRow.innerHTML = toolbarHtml;
  tbody.appendChild(toolbarRow);

  if (!hasAnyVehicle) {
    var emptyRow = document.createElement('tr');
    emptyRow.innerHTML = '<td colspan="7"><div class="empty-state"><div class="icon">💰</div><div class="text">购买车辆后可调整租金倍率</div></div></td>';
    tbody.appendChild(emptyRow);
    return;
  }

  var hasAny = false;
  types.forEach(function(type){
    var mult = getRateMultiplier(type);
    var count = gameState.ownedVehicles.filter(function(v){ return v.type === type; }).length;
    if (count === 0 && mult === 1.0) return;
    hasAny = true;
    var recMult = getRecommendedRateMultiplier(type);
    var recDiff = Math.abs(mult - recMult);
    var recLabel = recDiff < 0.1 ? '✅ 合理' : mult > recMult ? '⬇️ 偏高' : '⬆️ 偏低';
    var recColor = recDiff < 0.1 ? '#22c55e' : mult > recMult ? '#f59e0b' : '#3b82f6';

    var vehiclesOfType = gameState.ownedVehicles.filter(function(v){ return v.type === type; });
    var avgDailyRate = vehiclesOfType.length > 0 ? Math.round(vehiclesOfType.reduce(function(s,v){ return s + getEffectiveDailyRate(v); }, 0) / vehiclesOfType.length) : 0;

    var row = document.createElement('tr');
    row.innerHTML =
      '<td><span class="tag tag-type">' + type + '</span></td>' +
      '<td>' + count + ' 辆<br><span style="font-size:9px;color:#94a3b8;">均$' + avgDailyRate + '/天</span></td>' +
      '<td><div style="display:flex;align-items:center;gap:8px;"><input type="range" min="50" max="200" value="' + Math.round(mult * 100) + '" class="rate-slider" id="rateSlider_' + type + '" oninput="updateRateDisplay(\'' + type + '\',this.value)" style="flex:1;"><span id="rateDisplay_' + type + '" style="font-family:JetBrains Mono,monospace;font-size:14px;font-weight:700;color:#4ade80;min-width:44px;text-align:right;">' + mult.toFixed(1) + 'x</span></div></td>' +
      '<td><span style="font-size:10px;color:#94a3b8;">0.5x~2.0x</span></td>' +
      '<td><span style="font-size:10px;' + 'color:' + recColor + ';font-weight:600;">' + recLabel + '</span><br><span style="font-size:9px;color:#94a3b8;">推荐' + recMult.toFixed(1) + 'x</span></td>' +
      '<td><button class="action-btn btn-buy" onclick="confirmRateChange(\'' + type + '\')">确认调价</button></td>' +
      '<td><button class="action-btn" style="padding:2px 8px;font-size:9px;background:rgba(59,130,246,0.1);color:#3b82f6;border:1px solid rgba(59,130,246,0.3);" onclick="applyRecommendedPrice(\'' + type + '\')">🎯 推荐</button></td>';
    tbody.appendChild(row);
  });

  if (!hasAny) {
    var emptyRow2 = document.createElement('tr');
    emptyRow2.innerHTML = '<td colspan="7"><div class="empty-state"><div class="icon">💰</div><div class="text">暂无车辆数据</div></div></td>';
    tbody.appendChild(emptyRow2);
  }

  var tipRow = document.createElement('tr');
  tipRow.innerHTML = '<td colspan="7" style="padding:12px;"><div style="padding:10px;background:rgba(248,250,252,1);border-radius:8px;font-size:10px;color:#94a3b8;line-height:1.8;">' +
    '<div style="font-weight:600;color:#64748b;margin-bottom:4px;">💡 定价策略指南</div>' +
    '• 竞争对手每周调整市场系数（<span style="color:' + (gameState.marketCoefficient >= 1.0 ? '#22c55e' : '#ef4444') + ';">' + gameState.marketCoefficient.toFixed(2) + '</span>），影响所有车辆基础租金<br>' +
    '• 声誉越高客户对高价的接受度越高（当前声誉：<span style="color:#f59e0b;font-weight:600;">' + (gameState.reputation||50) + '</span>）<br>' +
    '• 🎯 推荐价基于车型需求、市场系数、库存量综合计算<br>' +
    '• 调价后次日生效，合理定价可提高客户下单率</div></td>';
  tbody.appendChild(tipRow);
}

function getRecommendedRateMultiplier(type) {
  var baseMult = getRateMultiplier(type);
  var marketCoeff = gameState.marketCoefficient || 1.0;
  var reputation = gameState.reputation || 50;
  var typeVehicles = gameState.ownedVehicles.filter(function(v){ return v.type === type && (!v.rentedUntil || v.rentedUntil < gameState.currentDay) && !isInTransit(v.id); });
  var availableCount = typeVehicles.length;
  var totalCount = gameState.ownedVehicles.filter(function(v){ return v.type === type; }).length;
  var stockRatio = totalCount > 0 ? availableCount / totalCount : 1;

  var demandBonus = 0;
  if (gameState.activeEvents.length > 0) {
    gameState.activeEvents.forEach(function(e){
      if (e.effect && e.effect.typeDemandMultiplier && e.effect.typeDemandMultiplier[type]) {
        demandBonus += (e.effect.typeDemandMultiplier[type] - 1) * 0.3;
      }
    });
  }

  var repBonus = reputation > 90 ? 0.15 : reputation > 70 ? 0.08 : reputation > 50 ? 0 : -0.05;
  var stockPenalty = stockRatio > 0.8 ? -0.1 : stockRatio > 0.5 ? 0 : 0.1;
  var marketAdjust = marketCoeff > 1.1 ? 0.08 : marketCoeff < 0.9 ? -0.08 : 0;

  var defaultMults = { '轿车':1.0,'SUV':1.3,'跑车':1.8,'MPV':1.2,'紧凑型':0.85,'豪华车':1.6,'超跑':2.5,'旅行车':0.95,'皮卡':1.4,'面包车':0.9,'轿跑':1.7,'小型SUV':1.15,'大型SUV':1.5,'大型MPV':1.35,'敞篷':2.0,'两厢':0.8 };
  var baseForType = defaultMults[type] || 1.0;
  var recommended = baseForType * (1 + repBonus + stockPenalty + marketAdjust + demandBonus);
  return Math.max(0.5, Math.min(2.0, Math.round(recommended * 100) / 100));
}

function applyRecommendedPrice(type) {
  var rec = getRecommendedRateMultiplier(type);
  setRateMultiplier(type, rec);
  addMessage('🎯 ' + type + ' 已应用推荐倍率 ' + rec.toFixed(1) + 'x', 'good');
  showToast(type + ' → ' + rec.toFixed(1) + 'x (智能推荐)', 'success');
  saveGame();
  switchTab('pricing');
}

function batchSetAllPrices(percent) {
  var types = Object.values(VEHICLE_TYPES);
  var changed = 0;
  var targetMult = percent / 100;
  types.forEach(function(type){
    var count = gameState.ownedVehicles.filter(function(v){ return v.type === type; }).length;
    if (count > 0) {
      setRateMultiplier(type, targetMult);
      changed++;
    }
  });
  if (changed > 0) {
    var label = percent === 80 ? '全部8折' : percent === 100 ? '恢复原价' : percent === 120 ? '加价20%' : '加价50%';
    addMessage('⚡ 一键调价：' + label + '，影响 ' + changed + ' 种车型', 'warn');
    showToast(label + '已应用！影响' + changed + '种车型', 'success');
    saveGame();
    switchTab('pricing');
  } else {
    showToast('没有可调整的车辆', 'error');
  }
}

function applyPriceStrategy(strategy) {
  var strategies = {
    aggressive: { name:'激进高价', mults:{'轿车':1.4,'SUV':1.7,'跑车':2.0,'MPV':1.5,'紧凑型':1.1,'豪华车':2.0,'超跑':2.5,'旅行车':1.2,'皮卡':1.8,'面包车':1.2,'轿跑':2.0,'小型SUV':1.4,'大型SUV':1.9,'大型MPV':1.7,'敞篷':2.2,'两厢':1.1} },
    balanced:   { name:'平衡策略', mults:{'轿车':1.0,'SUV':1.3,'跑车':1.8,'MPV':1.2,'紧凑型':0.85,'豪华车':1.6,'超跑':2.5,'旅行车':0.95,'皮卡':1.4,'面包车':0.9,'轿跑':1.7,'小型SUV':1.15,'大型SUV':1.5,'大型MPV':1.35,'敞篷':2.0,'两厢':0.8} },
    volume:     { name:'薄利多销', mults:{'轿车':0.75,'SUV':0.95,'跑车':1.3,'MPV':0.9,'紧凑型':0.65,'豪华车':1.2,'超跑':1.8,'旅行车':0.75,'皮卡':1.1,'面包车':0.7,'轿跑':1.25,'小型SUV':0.85,'大型SUV':1.15,'大型MPV':1.0,'敞篷':1.5,'两厢':0.65} },
    premium:    { name:'高端溢价', mults:{'轿车':1.6,'SUV':1.9,'跑车':2.0,'MPV':1.7,'紧凑型':1.2,'豪华车':2.0,'超跑':2.5,'旅行车':1.3,'皮卡':1.9,'面包车':1.3,'轿跑':2.0,'小型SUV':1.5,'大型SUV':2.0,'大型MPV':1.8,'敞篷':2.2,'两厢':1.2} }
  };
  var s = strategies[strategy];
  if (!s) return;
  var types = Object.keys(s.mults);
  var changed = 0;
  types.forEach(function(type){
    var count = gameState.ownedVehicles.filter(function(v){ return v.type === type; }).length;
    if (count > 0) {
      setRateMultiplier(type, s.mults[type]);
      changed++;
    }
  });
  addMessage('📋 已应用「' + s.name + '」策略，影响 ' + changed + ' 种车型', 'good');
  showToast(s.name + '策略已应用！', 'success');
  saveGame();
  switchTab('pricing');
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
  var fragment = document.createDocumentFragment();
  var headerBar = document.createElement('div');
  headerBar.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding:8px 12px;background:rgba(241,245,249,1);border-radius:8px;border:1px solid rgba(226,232,240,1);';
  headerBar.innerHTML = '<span style="font-size:13px;font-weight:700;color:#1e293b;">待处理订单 <span style="color:#2563eb;">' + gameState.pendingOrders.length + '</span> 条</span>' +
    '<button style="padding:7px 18px;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#059669,#10b981);color:#fff;box-shadow:0 2px 8px rgba(5,150,105,0.25);" onclick="acceptAllOrders()">✅ 一键全部接单</button>';
  fragment.appendChild(headerBar);
  var sortedOrders = gameState.pendingOrders.slice().sort(function(a,b){
    if (a.isEasterEgg && !b.isEasterEgg) return -1;
    if (!a.isEasterEgg && b.isEasterEgg) return 1;
    return (b.totalIncome || 0) - (a.totalIncome || 0);
  });
  sortedOrders.forEach(function(order){
    var typeIcon = order.customerType === 'business' ? '💼' : '🏖️';
    var typeClass = order.customerType === 'business' ? 'business' : 'tourist';
    var typeLabel = order.customerType === 'business' ? '商务客户' : '旅游客户';
    var netClass = order.netIncome >= 0 ? 'msg-highlight' : 'msg-bad';
    var isEgg = order.isEasterEgg;

    var memberInfo = null;
    if (order.memberId && gameState.members) {
      memberInfo = gameState.members.find(function(m){ return m.id === order.memberId; });
    }
    var memberBadge = '';
    if (memberInfo) {
      var levelInfo = typeof getMemberLevelInfo === 'function' ? getMemberLevelInfo(memberInfo.level || 1) : { name:'会员', color:'#94a3b8', discount:1.0 };
      memberBadge = '<span style="font-size:9px;padding:1px 7px;background:linear-gradient(135deg,' + levelInfo.color + '22,' + levelInfo.color + '11);color:' + levelInfo.color + ';border-radius:4px;font-weight:700;margin-left:6px;border:1px solid ' + levelInfo.color + '33;">💎 ' + levelInfo.name + '</span>';
    } else {
      memberBadge = '<span style="font-size:9px;color:#94a3b8;margin-left:6px;">非会员</span>';
    }

    var baseRent = Math.round((order.dailyRate || 0) * (order.rentalDays || 1));
    var fuelTotal = Math.round((order.fuelCostPerDay || 0) * (order.rentalDays || 1));
    var maintTotal = Math.round((order.maintenanceCostPerDay || 0) * (order.rentalDays || 1));
    var costBreakdownHtml = '<div style="margin-top:5px;padding:8px 10px;background:rgba(241,245,249,1);border-radius:8px;font-size:10px;line-height:1.8;">' +
      '<div style="display:flex;justify-content:space-between;"><span style="color:#94a3b8;">基础租金 (' + formatCurrency(order.dailyRate||0) + '×' + (order.rentalDays||1) + '天)</span><span style="color:#1e293b;font-weight:600;">' + formatCurrency(baseRent) + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;"><span style="color:#94a3b8;">燃油成本</span><span style="color:#ef4444;">-' + formatCurrency(fuelTotal) + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;"><span style="color:#94a3b8;">维护成本</span><span style="color:#f59e0b;">-' + formatCurrency(maintTotal) + '</span></div>' +
      '<div style="border-top:1px dashed rgba(203,213,225,0.8);margin:4px 0;padding-top:4px;display:flex;justify-content:space-between;"><span style="font-weight:600;color:#1e293b;">净利润</span><span style="font-weight:700;color:' + (order.netIncome >= 0 ? '#22c55e' : '#ef4444') + ';">' + formatCurrency(order.netIncome) + '</span></div>' +
      '</div>';

    var card = document.createElement('div');
    card.className = 'order-card';
    if (isEgg) {
      card.style.cssText = 'border-left:4px solid #f59e0b;background:linear-gradient(135deg,rgba(245,158,11,0.08),rgba(251,191,36,0.04));box-shadow:0 2px 12px rgba(245,158,11,0.15);';
    }
    var eggBadge = isEgg ? '<span style="font-size:9px;padding:2px 8px;background:linear-gradient(135deg,#f59e0b,#fbbf24);color:#fff;border-radius:4px;font-weight:700;margin-left:6px;animation:pulse-egg 1.5s infinite;">🎁 彩蛋</span>' : '';
    var eggDescHtml = isEgg ? '<div style="margin-top:4px;padding:4px 8px;background:rgba(245,158,11,0.1);border-radius:6px;font-size:10px;color:#b45309;font-weight:600;">📌 ' + (order.eggDesc || '') + '</div>' : '';
    card.innerHTML =
      '<div class="order-top"><div class="order-customer"><div class="order-avatar ' + typeClass + '">' + (isEgg ? '🌟' : typeIcon) + '</div><div class="order-customer-info"><span class="order-customer-name" style="' + (isEgg ? 'color:#b45309;font-weight:800;' : '') + '">' + order.customerName + eggBadge + '</span>' + memberBadge + '<br><span class="order-customer-type">' + typeLabel + ' · ' + order.outletName + (isEgg ? ' · <strong style="color:#f59e0b;">' + (order.eggScenario || '') + '</strong>' : '') + '</span></div></div><span class="order-price" style="' + (isEgg ? 'color:#d97706;font-size:16px;' : '') + '">' + formatCurrency(order.totalIncome) + (isEgg ? '<br><span style="font-size:10px;color:#f59e0b;font-weight:700;">×' + (order.eggBonus || 1) + ' 超额奖励</span>' : '') + '</span></div>' +
      '<div class="order-details"><div class="order-detail-item"><div class="order-detail-label">租用车型</div><div class="order-detail-value">' + order.vehicleName + '</div></div><div class="order-detail-item"><div class="order-detail-label">租期</div><div class="order-detail-value">' + order.rentalDays + ' 天</div></div><div class="order-detail-item"><div class="order-detail-label">总成本/净利</div><div class="order-detail-value">' + formatCurrency(order.totalCost || 0) + ' / <strong style="color:' + (order.netIncome >= 0 ? '#22c55e' : '#ef4444') + ';">' + formatCurrency(order.netIncome) + '</strong></div></div></div>' +
      costBreakdownHtml +
      eggDescHtml +
      '<div class="order-actions"><button class="action-btn btn-accept" onclick="acceptOrder(\'' + order.id + '\')" style="' + (isEgg ? 'background:linear-gradient(135deg,#f59e0b,#fbbf24);' : '') + '">✓ 接单</button><button class="action-btn btn-reject" onclick="rejectOrder(\'' + order.id + '\')">✕ 拒绝</button></div>';
    fragment.appendChild(card);
  });
  wrapper.appendChild(fragment);
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
  if (!vehicle) { showToast('车辆信息不存在', 'error'); return; }
  if (isInTransit(vehicleId)) { showToast('该车辆正在调度中', 'warn'); return; }
  if (vehicle.rentedUntil && vehicle.rentedUntil >= gameState.currentDay) { showToast('该车辆已租出，无法调度', 'warn'); return; }
  var vid = typeof vehicle.outletId !== 'undefined' && vehicle.outletId !== null ? vehicle.outletId : 0;
  var currentOutlet = OUTLET_CONFIGS.find(function(c){ return c.id === vid; }) || OUTLET_CONFIGS[0];
  var otherOutlets = gameState.outlets.filter(function(o){
    return o.owned && o.id !== vid;
  });
  if (otherOutlets.length === 0) {
    var ownedCount = gameState.outlets.filter(function(o){ return o.owned; }).length;
    var allOutlets = OUTLET_CONFIGS.filter(function(c){ return c.id !== vid; });
    var lockedOutlets = allOutlets.filter(function(c){ return !gameState.outlets.some(function(o){ return o.id === c.id && o.owned; }); });
    if (ownedCount <= 1) {
      var hint = lockedOutlets.length > 0 ? '可解锁：' + lockedOutlets.map(function(c){ return c.name + '(' + formatCurrency(c.unlockCost) + ')'; }).join('、') : '无更多网点';
      showToast('当前只有1个网点，无法调度。' + hint, 'warn');
    } else {
      showToast('没有其他可用网点', 'error');
    }
    return;
  }
  var content = document.getElementById('dispatchContent');
  var options = otherOutlets.map(function(o){
    var cfg = OUTLET_CONFIGS[o.id];
    var count = getVehiclesAtOutlet(o.id).length;
    var cap = getOutletCapacity(o.id);
    var dist = getDistanceBetweenOutlets(vid, o.id);
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
  if (gameState.cash < cost) { showToast('资金不足！需要 ' + formatCurrency(cost), 'error'); return; }
  var targetCap = getOutletCapacity(targetOutletId);
  var targetCount = getVehiclesAtOutlet(targetOutletId).length;
  if (targetCount >= targetCap) { showToast('目标网点车位已满！', 'error'); return; }
  var fromOutletId = typeof vehicle.outletId !== 'undefined' && vehicle.outletId !== null ? vehicle.outletId : 0;
  gameState.cash -= cost;
  gameState.todayExpense += cost;
  gameState.transfers.push({ vehicleId: vehicleId, fromOutletId: fromOutletId, toOutletId: targetOutletId, daysRemaining: days, cost: cost });
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

function openMarketingModal() {
  document.getElementById('marketingModal').classList.add('active');
  renderMarketingModal();
}
function closeMarketingModal() { document.getElementById('marketingModal').classList.remove('active'); }

function renderMarketingModal() {
  var content = document.getElementById('marketingContent');
  var mkt = gameState.marketing;
  var html = '';
  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px;">';
  html += '<div style="background:linear-gradient(135deg,rgba(6,182,212,0.08),rgba(8,145,178,0.06));border:1px solid rgba(6,182,212,0.2);border-radius:10px;padding:12px;text-align:center;"><div style="font-size:9px;color:#94a3b8;">总营销投入</div><div style="font-size:18px;font-weight:700;color:#06b6d4;">' + formatCurrency(mkt.totalSpend || 0) + '</div></div>';
  html += '<div style="background:linear-gradient(135deg,rgba(139,92,246,0.08),rgba(124,58,237,0.06));border:1px solid rgba(139,92,246,0.2);border-radius:10px;padding:12px;text-align:center;"><div style="font-size:9px;color:#94a3b8;">整体CAC</div><div style="font-size:18px;font-weight:700;color:#8b5cf6;">' + formatCurrency(mkt.overallCAC || 0) + '</div></div>';
  html += '<div style="background:linear-gradient(135deg,rgba(34,197,94,0.08),rgba(22,163,74,0.06));border:1px solid rgba(34,197,94,0.2);border-radius:10px;padding:12px;text-align:center;"><div style="font-size:9px;color:#94a3b8;">新客户总数</div><div style="font-size:18px;font-weight:700;color:#22c55e;">' + (mkt.totalNewCustomers || 0) + '</div></div>';
  html += '<div style="background:linear-gradient(135deg,rgba(245,158,11,0.08),rgba(217,119,6,0.06));border:1px solid rgba(245,158,11,0.2);border-radius:10px;padding:12px;text-align:center;"><div style="font-size:9px;color:#94a3b8;">品牌价值</div><div style="font-size:18px;font-weight:700;color:#f59e0b;">' + (getBrandEquity() || 0) + '</div></div>';
  html += '</div>';

  html += '<div style="display:flex;gap:8px;margin-bottom:14px;border-bottom:2px solid #e2e8f0;padding-bottom:10px;">';
  html += '<button class="market-tab" style="' + (!window._mktTab || window._mktTab === 'cac' ? 'background:linear-gradient(135deg,#06b6d4,#0891b2);color:#fff;border-color:#06b6d4;' : '') + 'flex:1;" onclick="_mktTab=\'cac\';renderMarketingModal()">📊 CAC分析</button>';
  html += '<button class="market-tab" style="' + (window._mktTab === 'brand' ? 'background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;border-color:#f59e0b;' : '') + 'flex:1;" onclick="_mktTab=\'brand\';renderMarketingModal()">🏆 品牌管理</button>';
  html += '<button class="market-tab" style="' + (window._mktTab === 'campaigns' ? 'background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;border-color:#22c55e;' : '') + 'flex:1;" onclick="_mktTab=\'campaigns\';renderMarketingModal()">🎯 营销活动</button>';
  html += '<button class="market-tab" style="' + (window._mktTab === 'funnel' ? 'background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:#fff;border-color:#8b5cf6;' : '') + 'flex:1;" onclick="_mktTab=\'funnel\';renderMarketingModal()">🔄 转化漏斗</button>';
  html += '</div>';

  if (!window._mktTab || window._mktTab === 'cac') {
    html += '<div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:10px;">📊 客户获取成本 (CAC) 分析</div>';
    html += '<table class="vehicle-table"><thead><tr><th>渠道</th><th>投入</th><th>获客数</th><th>CAC</th><th>转化率</th><th>操作</th></tr></thead><tbody>';
    var channelNames = { advertising:'📺 广告投放', referral:'💬 口碑推荐', member:'👤 会员转介', organic:'🌿 自然流量' };
    var channelIcons = { advertising:'#e74c3c', referral:'#22c55e', member:'#3b82f6', organic:'#94a3b8' };
    Object.keys(mkt.channels).forEach(function(k){
      var ch = mkt.channels[k];
      getMarketingCAC(k);
      html += '<tr><td><span style="color:' + (channelIcons[k]||'#64748b') + ';font-weight:600;">' + (channelNames[k]||k) + '</span></td>';
      html += '<td>' + formatCurrency(ch.spend||0) + '</td><td>' + (ch.customers||0) + '</td>';
      html += '<td style="font-weight:700;color:' + ((ch.cac||0) < 200 ? '#22c55e' : (ch.cac||0) < 500 ? '#f59e0b' : '#ef4444') + ';">' + formatCurrency(ch.cac||0) + '</td>';
      html += '<td>' + Math.round((ch.conversion||0)*100) + '%</td>';
      html += '<td><input type="number" id="mktSpend_' + k + '" placeholder="金额" style="width:70px;padding:4px 6px;border:1px solid #cbd5e1;border-radius:4px;font-size:11px;"> <button style="padding:4px 8px;border:none;border-radius:4px;font-size:9px;cursor:pointer;background:#06b6d4;color:#fff;" onclick="var v=document.getElementById(\'mktSpend_'+k+'\').value;spendMarketing(\''+k+'\',v);renderMarketingModal();">投入</button></td></tr>';
    });
    html += '</tbody></table>';
    var cacBenchmark = gameState.companyStage <= 2 ? 300 : (gameState.companyStage <= 3 ? 500 : 800);
    html += '<div style="margin-top:10px;padding:10px;background:rgba(248,250,252,1);border-radius:8px;font-size:11px;color:#64748b;">💡 行业阶段' + gameState.companyStage + '的CAC基准线：' + formatCurrency(cacBenchmark) + ' | 当前' + ((mkt.overallCAC||0) <= cacBenchmark ? '✅ 低于基准' : '⚠️ 高于基准') + '</div>';
  }

  if (window._mktTab === 'brand') {
    var brand = mkt.brand;
    html += '<div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:10px;">🏆 品牌价值系统</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;">';
    html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px;text-align:center;"><div style="font-size:9px;color:#94a3b8;">品牌知名度</div><div style="font-size:28px;font-weight:700;color:' + ((brand.awareness||20)>=70?'#22c55e':(brand.awareness||20)>=40?'#f59e0b':'#ef4444') + ';">' + (brand.awareness||20) + '</div><div style="height:6px;background:#e2e8f0;border-radius:3px;margin-top:6px;overflow:hidden;"><div style="width:'+(brand.awareness||20)+'%;height:100%;background:linear-gradient(90deg,#f59e0b,#d97706);border-radius:3px;"></div></div></div>';
    html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px;text-align:center;"><div style="font-size:9px;color:#94a3b8;">品牌声誉</div><div style="font-size:28px;font-weight:700;color:' + ((brand.reputation||50)>=70?'#22c55e':(brand.reputation||50)>=40?'#f59e0b':'#ef4444') + ';">' + (brand.reputation||50) + '</div><div style="height:6px;background:#e2e8f0;border-radius:3px;margin-top:6px;overflow:hidden;"><div style="width:'+(brand.reputation||50)+'%;height:100%;background:linear-gradient(90deg,#22c55e,#16a34a);border-radius:3px;"></div></div></div>';
    var premium = getPremiumPriceBonus();
    html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px;text-align:center;"><div style="font-size:9px;color:#94a3b8;">溢价能力</div><div style="font-size:28px;font-weight:700;color:' + (premium > 0 ? '#22c55e' : '#94a3b8') + ';">' + (premium > 0 ? '+'+premium+'%' : '-') + '</div><div style="font-size:9px;color:#94a3b8;margin-top:4px;">' + (premium > 0 ? '可溢价' : '未达标') + '</div></div>';
    html += '</div>';
    html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px;margin-bottom:14px;">';
    html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:10px;">🛡️ 危机管理</div>';
    if (brand.crisisLevel > 0) {
      html += '<div style="padding:10px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:8px;margin-bottom:10px;"><div style="font-size:12px;font-weight:700;color:#ef4444;">🚨 当前危机等级：' + brand.crisisLevel + '/5</div><div style="font-size:10px;color:#94a3b8;margin-top:4px;">已持续 ' + (gameState.currentDay - (brand.lastCrisisDay||0)) + ' 天</div>';
      html += '<div style="margin-top:8px;display:flex;gap:6px;"><button style="padding:6px 12px;border:none;border-radius:6px;font-size:10px;cursor:pointer;background:#3b82f6;color:#fff;" onclick="handleCrisisPRResponse(5000);renderMarketingModal();">公关处理 $5K</button><button style="padding:6px 12px;border:none;border-radius:6px;font-size:10px;cursor:pointer;background:#1d4ed8;color:#fff;" onclick="handleCrisisPRResponse(15000);renderMarketingModal();">强力公关 $15K</button></div></div>';
    } else {
      html += '<div style="text-align:center;padding:16px;color:#22c55e;font-size:12px;">✅ 无活跃危机事件</div>';
      html += '<div style="margin-top:8px;display:flex;gap:6px;justify-content:center;"><button style="padding:6px 12px;border:none;border-radius:6px;font-size:10px;cursor:pointer;background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.3);" onclick="triggerCrisisEvent(1);renderMarketingModal();">🎲 模拟轻微危机</button><button style="padding:6px 12px;border:none;border-radius:6px;font-size:10px;cursor:pointer;background:rgba(239,68,68,0.15);color:#dc2626;border:1px solid rgba(239,68,68,0.3);" onclick="triggerCrisisEvent(3);renderMarketingModal();">🎲 模拟严重危机</button></div>';
    }
    html += '<div style="margin-top:10px;display:flex;gap:6px;align-items:center;"><span style="font-size:11px;color:#64748b;">品牌建设：</span><button style="padding:5px 10px;border:none;border-radius:5px;font-size:9px;cursor:pointer;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;" onclick="updateBrandAwareness(3);renderMarketingModal()">📢 PR活动 $2K</button><button style="padding:5px 10px;border:none;border-radius:5px;font-size:9px;cursor:pointer;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;" onclick="updateBrandAwareness(5);renderMarketingModal();">🤝 赞助 $5K</button><button style="padding:5px 10px;border:none;border-radius:5px;font-size:9px;cursor:pointer;background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;" onclick="updateBrandAwareness(8);renderMarketingModal();">🌟 CSR $10K</button></div>';
    html += '</div>';
  }

  if (window._mktTab === 'campaigns') {
    html += '<div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:10px;">🎯 季节性营销活动</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;">';
    SEASONAL_CAMPAIGNS.forEach(function(sc){
      var currentMonth = new Date(getGameDate()).getMonth();
      var isSeason = sc.months.indexOf(currentMonth) !== -1;
      var activeCount = mkt.campaigns.filter(function(c){ return c.status === 'active' && c.id === sc.id; }).length;
      html += '<div style="background:' + (isSeason ? 'rgba(34,197,94,0.06)' : 'rgba(248,250,252,1)') + ';border:1px solid ' + (isSeason ? 'rgba(34,197,94,0.2)' : '#e2e8f0') + ';border-radius:10px;padding:12px;">';
      html += '<div style="font-size:12px;font-weight:700;color:#1e293b;">' + sc.name + '</div>';
      html += '<div style="font-size:9px;color:#94a3b8;margin:4px 0;">' + sc.description + '</div>';
      html += '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px;">';
      html += '<span style="font-size:9px;padding:2px 6px;border-radius:4px;background:rgba(34,197,94,0.1);color:#22c55e;">需求×' + sc.demandMultiplier + '</span>';
      html += '<span style="font-size:9px;padding:2px 6px;border-radius:4px;background:rgba(245,158,11,0.1);color:#d97706;">' + Math.round((1-sc.discount)*100) + '%折</span>';
      if (isSeason) html += '<span style="font-size:9px;padding:2px 6px;border-radius:4px;background:rgba(34,197,94,0.15);color:#16a34a;">🔥 当季</span>';
      if (activeCount > 0) html += '<span style="font-size:9px;padding:2px 6px;border-radius:4px;background:rgba(59,130,246,0.15);color:#2563eb;">进行中</span>';
      html += '</div>';
      if (activeCount === 0 && gameState.cash >= sc.minBudget) {
        html += '<button style="margin-top:8px;width:100%;padding:6px;border:none;border-radius:6px;font-size:10px;cursor:pointer;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;" onclick="launchCampaign({name:\''+sc.name+'\',type:\'seasonal\',discount:'+sc.discount+',demandMultiplier:'+sc.demandMultiplier+',targetTypes:'+JSON.stringify(sc.targetTypes)+',budget:'+sc.minBudget+',durationDays:14,channel:\'advertising\',description:\''+sc.description+'\'});renderMarketingModal();">启动 $'+(sc.minBudget/1000)+'K</button>';
      }
      html += '</div>';
    });
    html += '</div>';

    html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:8px;margin-top:14px;">🛠️ 自定义活动</div>';
    html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px;">';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">';
    html += '<div><label style="font-size:10px;color:#64748b;display:block;margin-bottom:4px;">活动名称</label><input id="cmpName" value="自定义促销" style="width:100%;padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px;font-size:11px;"></div>';
    html += '<div><label style="font-size:10px;color:#64748b;display:block;margin-bottom:4px;">预算 ($)</label><input id="cmpBudget" type="number" value="3000" min="500" style="width:100%;padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px;font-size:11px;"></div>';
    html += '<div><label style="font-size:10px;color:#64748b;display:block;margin-bottom:4px;">折扣 (如0.85=85折)</label><input id="cmpDiscount" type="number" value="0.90" step="0.05" min="0.5" max="1" style="width:100%;padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px;font-size:11px;"></div>';
    html += '<div><label style="font-size:10px;color:#64748b;display:block;margin-bottom:4px;">需求倍率</label><input id="cmpDemand" type="number" value="1.3" step="0.1" min="1" max="3" style="width:100%;padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px;font-size:11px;"></div>';
    html += '<div><label style="font-size:10px;color:#64748b;display:block;margin-bottom:4px;">持续时间(天)</label><input id="cmpDuration" type="number" value="14" min="3" max="60" style="width:100%;padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px;font-size:11px;"></div>';
    html += '<div><label style="font-size:10px;color:#64748b;display:block;margin-bottom:4px;">渠道</label><select id="cmpChannel" style="width:100%;padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px;font-size:11px;"><option value="advertising">广告投放</option><option value="referral">口碑推荐</option><option value="member">会员转介</option></select></div>';
    html += '</div>';
    html += '<button style="padding:8px 16px;border:none;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;width:100%;" onclick="launchCampaign({name:document.getElementById(\'cmpName\').value,type:\'custom\',discount:parseFloat(document.getElementById(\'cmpDiscount\').value)||0.9,demandMultiplier:parseFloat(document.getElementById(\'cmpDemand\').value)||1.3,targetTypes:[],budget:parseInt(document.getElementById(\'cmpBudget\').value)||3000,durationDays:parseInt(document.getElementById(\'cmpDuration\').value)||14,channel:document.getElementById(\'cmpChannel\').value});renderMarketingModal();">🚀 启动自定义活动</button>';
    html += '</div>';

    html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin:14px 0 8px;">📋 活动历史</div>';
    html += '<table class="vehicle-table"><thead><tr><th>活动名</th><th>状态</th><th>预算/已花</th><th>获客</th><th>ROI</th></tr></thead><tbody>';
    mkt.campaigns.forEach(function(c){
      var statusTag = c.status === 'active' ? '<span style="color:#22c55e;font-weight:600;">运行中</span>' : (c.status === 'completed' ? '<span style="color:#64748b;">已结束</span>' : c.status);
      html += '<tr><td>' + c.name + '</td><td>' + statusTag + '</td><td>' + formatCurrency(c.budget||0) + '/' + formatCurrency(c.spent||0) + '</td><td>' + (c.customersAcquired||0) + '</td><td style="color:' + ((c.roi||0)>=0?'#22c55e':'#ef4444') + ';">' + (c.roi||0) + '%</td></tr>';
    });
    if (mkt.campaigns.length === 0) html += '<tr><td colspan="5" style="text-align:center;color:#94a3b8;">暂无活动记录</td></tr>';
    html += '</tbody></table>';
  }

  if (window._mktTab === 'funnel') {
    html += '<div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:10px;">🔄 转化漏斗分析</div>';
    var f = mkt.funnel;
    var stages = [
      { key:'visitors', label:'访客', icon:'👀' },
      { key:'browsed', label:'浏览车型', icon:'🚗' },
      { key:'inquired', label:'询价', icon:'💬' },
      { key:'ordered', label:'下单', icon:'📝' },
      { key:'paid', label:'支付', icon:'💳' },
      { key:'pickedUp', label:'取车', icon:'🔑' },
      { key:'returned', label:'还车', icon:'↩️' },
      { key:'reviewed', label:'评价', icon:'⭐' }
    ];
    var rates = getFunnelConversionRates();
    stages.forEach(function(s, i){
      var val = f[s.key] || 0;
      var rate = rates[i] ? rates[i].rate : 0;
      var barW = i === 0 ? 100 : Math.min(100, Math.max(5, val / Math.max(1,f[stages[0].key]||1) * 100));
      var rateColor = rate >= 50 ? '#22c55e' : rate >= 25 ? '#f59e0b' : '#ef4444';
      html += '<div style="display:flex;align-items:center;gap:10px;padding:8px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:4px;">';
      html += '<span style="font-size:18px;width:30px;text-align:center;">' + s.icon + '</span>';
      html += '<span style="font-size:12px;font-weight:600;color:#1e293b;width:70px;">' + s.label + '</span>';
      html += '<span style="font-family:JetBrains Mono,monospace;font-size:14px;font-weight:700;color:#06b6d4;width:50px;text-align:right;">' + val + '</span>';
      html += '<div style="flex:1;height:16px;background:#e2e8f0;border-radius:8px;overflow:hidden;position:relative;"><div style="width:' + barW + '%;height:100%;background:linear-gradient(90deg,' + (i%2===0?'#06b6d4,#0891b2':'#8b5cf6,#7c3aed') + ');border-radius:8px;"></div></div>';
      if (i > 0) html += '<span style="font-size:11px;font-weight:700;color:' + rateColor + ';width:50px;text-align:right;">' + rate + '%</span>';
      html += '</div>';
    });

    html += '<div style="margin-top:14px;padding:12px;background:rgba(139,92,246,0.04);border:1px solid rgba(139,92,246,0.15);border-radius:10px;">';
    html += '<div style="font-size:11px;font-weight:700;color:#1e293b;margin-bottom:8px;">🧪 A/B 测试</div>';
    if (mkt.abTests.length === 0) {
      html += '<div style="font-size:10px;color:#94a3b8;text-align:center;padding:10px;">暂无A/B测试</div>';
      html += '<button style="margin-top:6px;padding:6px 12px;border:none;border-radius:6px;font-size:10px;cursor:pointer;background:#8b5cf6;color:#fff;" onclick="createABTest(\'定价策略A vs B\',{name:\'方案A\',priceMult:1.1},{name:\'方案B\',priceMult:0.95});renderMarketingModal();">创建新测试</button>';
    } else {
      mkt.abTests.forEach(function(t){
        html += '<div style="padding:8px;background:#fff;border-radius:6px;margin-bottom:6px;"><div style="font-size:11px;font-weight:600;">' + t.name + ' — ' + (t.status==='running'?'<span style="color:#22c55e;">运行中</span>':'已完成') + '</div>';
        html += '<div style="display:flex;gap:12px;margin-top:4px;font-size:10px;"><span>A: '+(t.conversionsA||0)+'/'+(t.trafficA||0)+' 转化</span><span>B: '+(t.conversionsB||0)+'/'+(t.trafficB||0)+' 转化</span></div></div>';
      });
    }
    html += '</div>';

    html += '<div style="margin-top:10px;padding:12px;background:rgba(239,68,68,0.03);border:1px solid rgba(239,68,68,0.12);border-radius:10px;">';
    html += '<div style="font-size:11px;font-weight:700;color:#1e293b;margin-bottom:8px;">🛒 废弃购物车恢复</div>';
    var abandoned = mkt.abandonedCartRecovery.filter(function(r){ return !r.recovered; });
    html += '<div style="font-size:10px;color:#64748b;">待恢复订单: ' + abandoned.length + ' 个</div>';
    if (abandoned.length > 0) {
      abandoned.slice(-5).forEach(function(r){
        html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 6px;border-bottom:1px solid #f1f5f9;font-size:10px;"><span>' + r.customerName + ' → ' + r.vehicleName + '</span><button style="padding:2px 8px;border:none;border-radius:4px;font-size:9px;cursor:pointer;background:#3b82f6;color:#fff;" onclick="recoverAbandonedCart(\''+r.orderId+'\');renderMarketingModal();">恢复</button></div>';
      });
    }
    html += '</div>';
  }

  content.innerHTML = html;
}

function openFleetMgmtModal() {
  document.getElementById('fleetMgmtModal').classList.add('active');
  renderFleetMgmtModal();
}
function closeFleetMgmtModal() { document.getElementById('fleetMgmtModal').classList.remove('active'); }

function renderFleetMgmtModal() {
  var content = document.getElementById('fleetMgmtContent');
  var summary = getFleetPhaseSummary();
  var analytics = getFleetAnalytics();
  var html = '';

  html += '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:12px;">';
  html += '<div style="background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.15);border-radius:8px;padding:10px;text-align:center;"><div style="font-size:9px;color:#94a3b8;">服役中</div><div style="font-size:20px;font-weight:700;color:#22c55e;">' + (summary.active||0) + '</div></div>';
  html += '<div style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.15);border-radius:8px;padding:10px;text-align:center;"><div style="font-size:9px;color:#94a3b8;">维护中</div><div style="font-size:20px;font-weight:700;color:#f59e0b;">' + (summary.maintenance||0) + '</div></div>';
  html += '<div style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.15);border-radius:8px;padding:10px;text-align:center;"><div style="font-size:9px;color:#94a3b8;">待处置</div><div style="font-size:20px;font-weight:700;color:#ef4444;">' + (summary.disposal||0) + '</div></div>';
  html += '<div style="background:rgba(148,163,184,0.06);border:1px solid rgba(148,163,184,0.15);border-radius:8px;padding:10px;text-align:center;"><div style="font-size:9px;color:#94a3b8;">车队总计</div><div style="font-size:20px;font-weight:700;color:#64748b;">' + (summary.total||0) + '</div></div>';
  html += '<div style="background:rgba(99,102,241,0.06);border:1px solid rgba(99,102,241,0.15);border-radius:8px;padding:10px;text-align:center;"><div style="font-size:9px;color:#94a3b8;">事故处理中</div><div style="font-size:20px;font-weight:700;color:#6366f1;">' + getIncidentCount() + '</div></div>';
  html += '</div>';

  html += '<div style="display:flex;gap:6px;margin-bottom:12px;border-bottom:2px solid #e2e8f0;padding-bottom:8px;">';
  html += '<button class="market-tab" style="' + (!window._fleetTab || window._fleetTab === 'lifecycle' ? 'background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;border-color:#22c55e;' : '') + 'flex:1;" onclick="_fleetTab=\'lifecycle\';renderFleetMgmtModal()">🔄 全生命周期</button>';
  html += '<button class="market-tab" style="' + (window._fleetTab === 'analytics' ? 'background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;border-color:#3b82f6;' : '') + 'flex:1;" onclick="_fleetTab=\'analytics\';renderFleetMgmtModal()">📊 车队分析</button>';
  html += '<button class="market-tab" style="' + (window._fleetTab === 'procurement' ? 'background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;border-color:#f59e0b;' : '') + 'flex:1;" onclick="_fleetTab=\'procurement\';renderFleetMgmtModal()">🛒 采购优化</button>';
  html += '<button class="market-tab" style="' + (window._fleetTab === 'incidents' ? 'background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;border-color:#ef4444;' : '') + 'flex:1;" onclick="_fleetTab=\'incidents\';renderFleetMgmtModal()">⚠️ 事故记录</button>';
  html += '</div>';

  if (!window._fleetTab || window._fleetTab === 'lifecycle') {
    html += '<div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:10px;">🔄 车辆全生命周期管理</div>';
    html += '<table class="vehicle-table"><thead><tr><th>车辆</th><th>车牌</th><th>类型</th><th>阶段</th><th>累计收入</th><th>运营成本</th><th>租出天数</th><th>日均收入</th><th>ROI</th><th>操作</th></tr></thead><tbody>';
    var phaseColors = { active:'#22c55e', maintenance:'#f59e0b', disposal:'#ef4444', disposed:'#94a3b8' };
    var phaseNames = { active:'服役中', maintenance:'维护中', disposal:'待处置', disposed:'已处置' };
    gameState.ownedVehicles.slice(0, 20).forEach(function(v){
      initVehicleLifecycle(v);
      var lc = v.lifecycle;
      html += '<tr>';
      html += '<td><span style="font-weight:600;">' + v.brand + ' ' + v.model + '</span></td>';
      html += '<td><span class="license-plate">' + (v.licensePlate||'-') + '</span></td>';
      html += '<td>' + (v.type||'-') + '</td>';
      html += '<td><span style="color:' + (phaseColors[lc.phase]||'#64748b') + ';font-weight:600;">' + (phaseNames[lc.phase]||lc.phase) + '</span></td>';
      html += '<td style="color:#22c55e;">' + formatCurrency(lc.totalRevenueGenerated||0) + '</td>';
      html += '<td style="color:#ef4444;">' + formatCurrency(lc.totalOperatingCost||0) + '</td>';
      html += '<td>' + (lc.totalRentalDays||0) + '天</td>';
      html += '<td>' + formatCurrency(lc.averageDailyRevenue||0) + '</td>';
      html += '<td style="font-weight:700;color:' + ((lc.roi||0)>=0?'#22c55e':'#ef4444') + ';">' + (lc.roi||0) + '%</td>';
      if (lc.phase !== 'disposed') {
        html += '<td>';
        if (lc.phase === 'disposal') html += '<button style="padding:3px 8px;border:none;border-radius:4px;font-size:9px;cursor:pointer;background:#ef4444;color:#fff;" onclick="disposeVehicle(\''+v.id+'\',\'sold\','+Math.round(calculateVehicleValue(v)*0.85)+');renderFleetMgmtModal();">出售</button>';
        else if (lc.phase === 'maintenance') html += '<button style="padding:3px 8px;border:none;border-radius:4px;font-size:9px;cursor:pointer;background:#22c55e;color:#fff;" onclick="setVehiclePhase(&apos;'+v.id+'&apos;,&apos;active&apos;,&apos;&apos;);renderFleetMgmtModal();">恢复</button>';
        html += '</td>';
      } else { html += '<td>-</td>'; }
      html += '</tr>';
    });
    if (gameState.ownedVehicles.length === 0) html += '<tr><td colspan="10" style="text-align:center;color:#94a3b8;">暂无车辆</td></tr>';
    else if (gameState.ownedVehicles.length > 20) html += '<tr><td colspan="10" style="text-align:center;color:#94a3b8;">显示前20辆车（共' + gameState.ownedVehicles.length + '辆）</td></tr>';
    html += '</tbody></table>';
  }

  if (window._fleetTab === 'analytics') {
    html += '<div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:10px;">📊 车队配置优化分析</div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">';
    html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px;"><div style="font-size:11px;font-weight:700;color:#1e293b;margin-bottom:10px;">📊 车型分布</div>';
    Object.keys(analytics.byType).forEach(function(t){
      var count = analytics.byType[t];
      var pct = summary.total > 0 ? Math.round(count / summary.total * 100) : 0;
      var u = analytics.utilizationByType[t];
      html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;"><span style="width:60px;font-size:11px;font-weight:600;">' + t + '</span>';
      html += '<div style="flex:1;height:18px;background:#f1f5f9;border-radius:4px;overflow:hidden;"><div style="width:' + pct + '%;height:100%;background:linear-gradient(90deg,#3b82f6,#6366f1);"></div></div>';
      html += '<span style="font-size:11px;font-weight:600;width:30px;">' + count + '</span>';
      html += '<span style="font-size:9px;color:' + (u&&u.utilRate>=60?'#22c55e':(u&&u.utilRate>=30?'#f59e0b':'#ef4444')) + ';">' + (u?u.utilRate+'%':'-') + '</span></div>';
    });
    html += '</div>';

    html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px;"><div style="font-size:11px;font-weight:700;color:#1e293b;margin-bottom:10px;">📅 车龄分布</div>';
    var totalAge = (analytics.ageDistribution.under3||0)+(analytics.ageDistribution.threeTo5||0)+(analytics.ageDistribution.over5||0)||1;
    var ageData = [
      { label:'&lt;3年', value:analytics.ageDistribution.under3||0, target:60, color:'#22c55e' },
      { label:'3-5年', value:analytics.ageDistribution.threeTo5||0, target:30, color:'#f59e0b' },
      { label:'&gt;5年', value:analytics.ageDistribution.over5||0, target:10, color:'#ef4444' }
    ];
    ageData.forEach(function(a){
      var pct = Math.round(a.value / totalAge * 100);
      var targetPct = a.target;
      var ok = pct <= targetPct + 10;
      html += '<div style="margin-bottom:8px;"><div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:3px;"><span>' + a.label + ': ' + a.value + '辆 (' + pct + '%)</span><span style="color:' + (ok?'#22c55e':'#ef4444') + ';">目标≤' + targetPct + '% ' + (ok?'✅':'⚠️') + '</span></div>';
      html += '<div style="height:12px;background:#f1f5f9;border-radius:6px;overflow:hidden;"><div style="width:' + pct + '%;height:100%;background:' + a.color + ';"></div></div></div>';
    });
    html += '</div></div>';

    html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px;margin-bottom:14px;"><div style="font-size:11px;font-weight:700;color:#1e293b;margin-bottom:10px;">💰 各车型TCO (总拥有成本)</div>';
    html += '<table class="vehicle-table"><thead><tr><th>车型</th><th>数量</th><th>平均TCO</th><th>日均营收</th></tr></thead><tbody>';
    Object.keys(analytics.tcoByType).forEach(function(t){
      var tc = analytics.tcoByType[t];
      var rd = analytics.revenuePerDayByType[t];
      html += '<tr><td>' + t + '</td><td>' + tc.count + '</td><td style="color:#ef4444;">' + formatCurrency(tc.avgTCO||0) + '</td><td style="color:#22c55e;">' + formatCurrency(rd?rd.avgRevenuePerDay:0) + '</td></tr>';
    });
    html += '</tbody></table></div>';

    var advice = getFleetReplacementAdvice();
    if (advice.length > 0) {
      html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px;"><div style="font-size:11px;font-weight:700;color:#1e293b;margin-bottom:8px;">💡 更换建议</div>';
      advice.forEach(function(a){
        var lvlColor = a.level==='danger'?'#ef4444':a.level==='warning'?'#f59e0b':'#3b82f6';
        html += '<div style="padding:6px 10px;margin-bottom:4px;border-radius:6px;font-size:11px;background:' + (a.level==='danger'?'rgba(239,68,68,0.05)':(a.level==='warning'?'rgba(245,158,11,0.05)':'rgba(59,130,246,0.05)')) + ';border-left:3px solid ' + lvlColor + ';color:#334155;">' + a.message + '</div>';
      });
      html += '</div>';
    }

    if (analytics.replacementSuggestions.length > 0) {
      html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px;"><div style="font-size:11px;font-weight:700;color:#1e293b;margin-bottom:8px;">🔧 建议更换车辆 TOP' + Math.min(5, analytics.replacementSuggestions.length) + '</div>';
      analytics.replacementSuggestions.slice(0, 5).forEach(function(r){
        html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;border-bottom:1px solid #f1f5f9;font-size:11px;"><div><span style="font-weight:600;">' + r.name + '</span> <span style="color:#94a3b8;">' + r.ageYears + '年/' + r.condition + '%</span></div><span style="color:' + (r.priority==='high'?'#ef4444':'#f59e0b') + ';">' + r.reason + '</span></div>';
      });
      html += '</div>';
    }
  }

  if (window._fleetTab === 'procurement') {
    html += '<div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:10px;">🛒 采购与供应商管理</div>';
    html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px;margin-bottom:14px;"><div style="font-size:11px;font-weight:700;color:#1e293b;margin-bottom:10px;">📦 批量采购优惠</div>';
    html += '<table class="vehicle-table"><thead><tr><th>数量</th><th>折扣</th><th>示例($200K车)</th><th>节省</th></tr></thead><tbody>';
    [3,5,10].forEach(function(n){
      var d = getBulkPurchaseDiscount(n, 200000);
      html += '<tr><td>' + n + '+ 辆</td><td style="color:#22c55e;font-weight:700;">' + Math.round(d.discount*100) + '%</td><td>' + formatCurrency(d.finalPrice) + '</td><td style="color:#f59e0b;">-' + formatCurrency(d.savings) + '</td></tr>';
    });
    html += '</tbody></table></div>';

    html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px;margin-bottom:14px;"><div style="font-size:11px;font-weight:700;color:#1e293b;margin-bottom:10px;">🏭 供应商关系</div>';
    var vendorKeys = Object.keys(gameState.vendors);
    if (vendorKeys.length === 0) {
      html += '<div style="text-align:center;color:#94a3b8;font-size:11px;padding:16px;">暂无采购记录，购车后将自动建立供应商关系</div>';
    } else {
      vendorKeys.forEach(function(vk){
        var vd = gameState.vendors[vk];
        var loyalty = getVendorLoyaltyDiscount(vk);
        html += '<div style="padding:8px;border-bottom:1px solid #f1f5f9;"><div style="display:flex;justify-content:space-between;font-size:11px;"><span style="font-weight:600;">' + vk + '</span><span style="color:#22c55e;">忠诚度 Lv.' + (vd.level||1) + ' | 忠惠 +' + loyalty + '%</span></div>';
        html += '<div style="font-size:9px;color:#94a3b8;">采购' + (vd.orderCount||0) + '次 | 总额 ' + formatCurrency(vd.totalSpent||0) + '</div></div>';
      });
    }
    html += '</div>';

    html += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px;"><div style="font-size:11px;font-weight:700;color:#1e293b;margin-bottom:10px;">🔄 置换计划</div>';
    var tradeInVehicles = gameState.ownedVehicles.filter(function(v){ var lc=v.lifecycle; return lc && lc.purchaseDate && (gameState.currentDay - lc.purchaseDate) > 365*3; });
    if (tradeInVehicles.length === 0) {
      html += '<div style="text-align:center;color:#94a3b8;font-size:11px;padding:16px;">暂无达到置换条件的车辆（需车龄&gt;3年）</div>';
    } else {
      html += '<table class="vehicle-table"><thead><tr><th>车辆</th><th>车龄</th><th>当前估值</th><th>置换估值</th><th>操作</th></tr></thead><tbody>';
      tradeInVehicles.slice(0, 8).forEach(function(v){
        var tiv = calculateTradeInValue(v.id);
        var cv = calculateVehicleValue(v);
        html += '<tr><td>' + v.brand + ' ' + v.model + '</td><td>' + Math.floor((gameState.currentDay-(v.lifecycle?v.lifecycle.purchaseDate:v.purchaseDay||gameState.currentDay))/365) + '年</td><td>' + formatCurrency(cv) + '</td><td style="color:#22c55e;">' + formatCurrency(tiv) + '</td><td><button style="padding:3px 8px;border:none;border-radius:4px;font-size:9px;cursor:pointer;background:#f59e0b;color:#fff;" onclick="console.log(&apos;置换 &apos;+v.id)">置换</button></td></tr>';
      });
      html += '</tbody></table>';
    }
    html += '</div>';
  }

  if (window._fleetTab === 'incidents') {
    html += '<div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:10px;">⚠️ 事故与事件记录</div>';
    var incidents = gameState.incidents || [];
    if (incidents.length === 0) {
      html += '<div style="text-align:center;padding:30px;color:#94a3b8;font-size:12px;">✅ 暂无事故记录</div>';
    } else {
      html += '<table class="vehicle-table"><thead><tr><th>日期</th><th>车辆</th><th>类型</th><th>维修费</th><th>停运天</th><th>状态</th><th>操作</th></tr></thead><tbody>';
      incidents.slice(-15).reverse().forEach(function(inc){
        var statusStyle = inc.resolved ? 'color:#22c55e;' : 'color:#ef4444;';
        var statusText = inc.resolved ? '✅ 已解决' : '⏳ 处理中';
        html += '<tr><td>D' + inc.day + '</td><td>' + inc.vehicleName + '</td><td>' + inc.name + '</td><td style="color:#ef4444;">' + formatCurrency(inc.repairCost) + '</td><td>' + inc.downtime + '天</td><td style="'+statusStyle+'font-weight:600;">' + statusText + '</td>';
        if (!inc.resolved) html += '<td><button style="padding:3px 8px;border:none;border-radius:4px;font-size:9px;cursor:pointer;background:#22c55e;color:#fff;" onclick="resolveIncident(\''+inc.id+'\');renderFleetMgmtModal();">解决</button></td>';
        else html += '<td>-</td>';
        html += '</tr>';
      });
      html += '</tbody></table>';
    }
    html += '<div style="margin-top:12px;padding:10px;background:rgba(239,68,68,0.04);border:1px solid rgba(239,68,68,0.12);border-radius:8px;font-size:11px;color:#64748b;">💡 提示：车况低于30%的车辆事故概率显著增加，建议及时保养或更换</div>';
  }

  content.innerHTML = html;
}

function openInsuranceModal() {
  document.getElementById('insuranceModal').classList.add('active');
  renderInsuranceModal();
}
function closeInsuranceModal() { document.getElementById('insuranceModal').classList.remove('active'); }

function renderInsuranceModal() {
  var content = document.getElementById('insuranceContent');
  var ins = gameState.insurance;
  var html = '';
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;">';
  html += '<div style="background:linear-gradient(135deg,rgba(239,68,68,0.06),rgba(220,38,38,0.04));border:1px solid rgba(239,68,68,0.15);border-radius:10px;padding:12px;text-align:center;"><div style="font-size:9px;color:#94a3b8;">年保费总额</div><div style="font-size:18px;font-weight:700;color:#ef4444;">' + formatCurrency(ins.totalAnnualPremium || 0) + '</div></div>';
  html += '<div style="background:linear-gradient(135deg,rgba(59,130,246,0.06),rgba(37,99,235,0.04));border:1px solid rgba(59,130,246,0.15);border-radius:10px;padding:12px;text-align:center;"><div style="font-size:9px;color:#94a3b8;">有效保单</div><div style="font-size:18px;font-weight:700;color:#3b82f6;">' + (ins.policies ? ins.policies.filter(function(p){return p.status==='active'}).length : 0) + ' 份</div></div>';
  html += '<div style="background:linear-gradient(135deg,rgba(245,158,11,0.06),rgba(217,119,6,0.04));border:1px solid rgba(245,158,11,0.15);border-radius:10px;padding:12px;text-align:center;"><div style="font-size:9px;color:#94a3b8;">待处理理赔</div><div style="font-size:18px;font-weight:700;color:#f59e0b;">' + (ins.pendingClaims ? ins.pendingClaims.length : 0) + ' 件</div></div>';
  html += '</div>';

  html += '<div style="display:flex;gap:6px;margin-bottom:12px;border-bottom:2px solid #e2e8f0;padding-bottom:8px;">';
  html += '<button class="market-tab" style="' + (!window._insTab || window._insTab === 'policies' ? 'background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;border-color:#3b82f6;' : '') + 'flex:1;" onclick="_insTab=\'policies\';renderInsuranceModal()">📋 保单管理</button>';
  html += '<button class="market-tab" style="' + (window._insTab === 'claims' ? 'background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;border-color:#ef4444;' : '') + 'flex:1;" onclick="_insTab=\'claims\';renderInsuranceModal()">📝 理赔记录</button>';
  html += '<button class="market-tab" style="' + (window._insTab === 'buy' ? 'background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;border-color:#22c55e;' : '') + 'flex:1;" onclick="_insTab=\'buy\';renderInsuranceModal()">🛡️ 投保</button>';
  html += '</div>';

  if (!window._insTab || window._insTab === 'policies') {
    html += '<div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:10px;">📋 有效保单列表</div>';
    var activePolicies = (ins.policies || []).filter(function(p){ return p.status === 'active'; });
    if (activePolicies.length === 0) {
      html += '<div style="text-align:center;padding:30px;color:#94a3b8;font-size:12px;">暂无有效保单，请为车辆投保以降低风险</div>';
    } else {
      html += '<table class="vehicle-table"><thead><tr><th>车辆</th><th>类型</th><th>保险公司</th><th>年保费</th><th>免赔额</th><th>保额</th><th>无赔年限</th><th>到期日</th><th>操作</th></tr></thead><tbody>';
      activePolicies.forEach(function(p){
        var daysLeft = p.expiryDay - gameState.currentDay;
        var urgent = daysLeft < 30;
        html += '<tr><td style="font-weight:600;">' + p.vehicleName + '</td><td>' + (p.type === 'comprehensive' ? '<span style="color:#3b82f6;">商业险</span>' : '<span style="color:#64748b;">交强险</span>') + '</td><td>' + p.provider + '</td><td>' + formatCurrency(p.annualPremium) + '</td><td>' + formatCurrency(p.deductible) + '</td><td>' + formatCurrency(p.coverage) + '</td><td>' + (p.noClaimsYears || 0) + '年' + ((p.noClaimsYears||0)>0?' <span style="color:#22c55e;font-size:9px;">(-'+Math.min(p.noClaimsYears*10,50)+'%)</span>':'') + '</td><td style="color:' + (urgent?'#ef4444':'#64748b') + ';">' + daysLeft + '天后</td><td><button style="padding:3px 8px;border:none;border-radius:4px;font-size:9px;cursor:pointer;background:rgba(59,130,246,0.1);color:#3b82f6;border:1px solid rgba(59,130,246,0.3);" onclick="renewInsurancePolicy(\''+p.id+'\');renderInsuranceModal();">续保</button></td></tr>';
      });
      html += '</tbody></table>';
    }
  }

  if (window._insTab === 'claims') {
    html += '<div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:10px;">📝 理赔历史记录</div>';
    var allClaims = (ins.claimsHistory || []).concat(ins.pendingClaims || []);
    if (allClaims.length === 0) {
      html += '<div style="text-align:center;padding:30px;color:#94a3b8;font-size:12px;">暂无理赔记录</div>';
    } else {
      html += '<table class="vehicle-table"><thead><tr><th>类型</th><th>申请金额</th><th>赔付金额</th><th>状态</th><th>申请日</th></tr></thead><tbody>';
      allClaims.slice(-20).reverse().forEach(function(c){
        var st = c.status === 'paid' ? '<span style="color:#22c55e;">已赔付</span>' : (c.status === 'approved' ? '<span style="color:#3b82f6;">已批准</span>' : (c.status === 'rejected' ? '<span style="color:#ef4444;">被拒</span>' : '<span style="color:#f59e0b;">处理中</span>'));
        html += '<tr><td>' + (c.type||'-') + '</td><td>' + formatCurrency(c.claimedAmount||0) + '</td><td>' + formatCurrency(c.approvedAmount||0) + '</td><td>' + st + '</td><td>D' + (c.filedDay||gameState.currentDay) + '</td></tr>';
      });
      html += '</tbody></table>';
    }
  }

  if (window._insTab === 'buy') {
    html += '<div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:10px;">🛡️ 为车辆购买保险</div>';
    var uninsuredVehicles = gameState.ownedVehicles.filter(function(v){
      return !ins.policies.some(function(p){ return p.vehicleId === v.id && p.status === 'active'; });
    });
    if (uninsuredVehicles.length === 0) {
      html += '<div style="text-align:center;padding:30px;color:#94a3b8;font-size:12px;">所有车辆均已投保 ✅</div>';
    } else {
      html += '<table class="vehicle-table"><thead><tr><th>车辆</th><th>估值</th><th>保险类型</th><th>免赔额</th><th>预估年费</th><th>操作</th></tr></thead><tbody>';
      uninsuredVehicles.forEach(function(v){
        var val = calculateVehicleValue(v);
        var compPrem = Math.round(2000 * (val/200000));
        var thirdPrem = Math.round(800 * (val/200000));
        html += '<tr><td style="font-weight:600;">' + v.brand + ' ' + v.model + ' <span class="license-plate">' + (v.licensePlate||'-') + '</span></td><td>' + formatCurrency(val) + '</td>';
        html += '<td><select id="insType_' + v.id + '" style="padding:4px 6px;border:1px solid #cbd5e1;border-radius:4px;font-size:11px;"><option value="comprehensive">商业险 (全保)</option><option value="third_party">交强险 (基础)</option></select></td>';
        html += '<td><select id="insDed_' + v.id + '" style="padding:4px 6px;border:1px solid #cbd5e1;border-radius:4px;font-size:11px;"><option value="0">$0 (高保费)</option><option value="500" selected>$500</option><option value="1000">$1000 (低保费)</option></select></td>';
        html += '<td id="insEst_' + v.id + '">' + formatCurrency(compPrem) + '</td>';
        html += '<td><button style="padding:5px 10px;border:none;border-radius:6px;font-size:10px;cursor:pointer;background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;" onclick="issueInsurancePolicy(&apos;'+v.id+'&apos;,document.getElementById(&apos;insType_'+v.id+'&apos;).value,parseInt(document.getElementById(&apos;insDed_'+v.id+'&apos;).value));renderInsuranceModal();">投保</button></td></tr>';
      });
      html += '</tbody></table>';
    }
    html += '<div style="margin-top:12px;padding:12px;background:rgba(59,130,246,0.04);border:1px solid rgba(59,130,246,0.12);border-radius:10px;font-size:11px;color:#64748b;line-height:1.6;">';
    html += '💡 <strong>保险建议：</strong>商业险覆盖盗抢、碰撞、自然灾害等，强烈建议为高价车辆投保。无保险车辆发生事故将全额自付损失。连续无理赔可享受最高<strong>50%</strong>保费优惠。</div>';
  }

  content.innerHTML = html;
}

var crmTab = 'overview';
function renderMarketAnalysisTab() {
  var html = '';
  if (typeof getMarketPosition === 'function') {
    var pos = getMarketPosition();
    html += '<div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:10px;">📊 市场地位</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;">';
    html += '<div style="background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.3);border-radius:10px;padding:12px;text-align:center;"><div style="font-size:22px;font-weight:700;color:#06b6d4;">#' + pos.rank + '</div><div style="font-size:9px;color:#64748b;">行业排名/' + pos.totalPlayers + '</div></div>';
    html += '<div style="background:' + (pos.trend === 'growing' ? 'rgba(74,222,128,0.1)' : pos.trend === 'declining' ? 'rgba(239,68,68,0.1)' : 'rgba(241,245,249,0.8)') + ';border-radius:10px;padding:12px;text-align:center;"><div style="font-size:18px;font-weight:700;color:' + (pos.trend === 'growing' ? '#22c55e' : pos.trend === 'declining' ? '#ef4444' : '#64748b') + ';">' + (pos.share * 100).toFixed(1) + '%</div><div style="font-size:9px;color:#64748b;">市场份额</div></div>';
    html += '<div style="background:rgba(248,250,252,1);border-radius:10px;padding:12px;text-align:center;"><div style="font-size:14px;font-weight:700;color:#1e293b;">$' + (pos.marketSize / 10000).toFixed(0) + '万</div><div style="font-size:9px;color:#64748b;">日市场规模</div></div>';
    html += '</div>';
  }
  if (typeof getSegmentPerformance === 'function') {
    var segs = getSegmentPerformance();
    html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:8px;margin-top:12px;">📦 细分市场表现</div>';
    html += '<div style="display:flex;flex-direction:column;gap:6px;">';
    Object.keys(segs).forEach(function(segKey){
      var s = segs[segKey];
      var shareColor = s.yourShare >= 15 ? '#22c55e' : s.yourShare >= 8 ? '#f59e0b' : '#ef4444';
      html += '<div style="display:flex;align-items:center;gap:10px;background:rgba(248,250,252,1);border-radius:8px;padding:10px;">';
      html += '<div style="min-width:50px;font-size:11px;font-weight:600;color:#1e293b;">' + s.name + '</div>';
      html += '<div style="flex:1;height:8px;background:rgba(226,232,240,1);border-radius:4px;overflow:hidden;"><div style="width:' + Math.min(100, s.yourShare * 5) + '%;height:100%;background:' + shareColor + ';border-radius:4px;"></div></div>';
      html += '<span style="min-width:45px;text-align:right;font-size:11px;font-weight:700;color:' + shareColor + ';">' + s.yourShare + '%</span>';
      html += '<span style="min-width:35px;font-size:9px;color:#94a3b8;">' + s.competitionLevel + '</span>';
      html += '</div>';
    });
    html += '</div>';
  }
  if (gameState.competitorIntel && gameState.competitorIntel.promotionAlerts && gameState.competitorIntel.promotionAlerts.length > 0) {
    html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:8px;margin-top:12px;">⚠️ 竞争动态</div>';
    gameState.competitorIntel.promotionAlerts.slice(0,5).forEach(function(alert){
      var impactColor = alert.move.impact === 'negative' ? '#ef4444' : alert.move.impact === 'warning' ? '#f59e0b' : '#64748b';
      html += '<div style="padding:6px 10px;border-left:3px solid ' + impactColor + ';background:rgba(248,250,252,0.5);font-size:10px;color:#475569;margin-bottom:4px;border-radius:0 6px 6px 0;">D' + alert.day + ': ' + alert.move.desc + '</div>';
    });
  }
  if (typeof getCompetitorPricing === 'function') {
    html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:8px;margin-top:12px;">💰 竞品价格对比（标准型）</div>';
    var pricing = getCompetitorPricing('Standard');
    html += '<table style="width:100%;border-collapse:collapse;font-size:10px;"><thead><tr style="background:rgba(241,245,249,1);"><th style="padding:5px;text-align:left;">竞品</th><th style="padding:5px;text-align:right;">日租金</th><th style="padding:5px;text-align:center;">趋势</th></tr></thead><tbody>';
    pricing.forEach(function(p){
      html += '<tr style="border-bottom:1px solid rgba(226,232,240,0.6);' + (p.isMe ? 'background:rgba(6,182,212,0.08);font-weight:700;' : '') + '">';
      html += '<td style="padding:5px;">' + (p.isMe ? '🔵 ' : '') + p.competitor + '</td>';
      html += '<td style="padding:5px;text-align:right;color:' + (p.isMe ? '#06b6d4' : '#1e293b') + ';">$' + p.price + '/天</td>';
      html += '<td style="padding:5px;text-align:center;" style="color:' + (p.trend === 'up' ? '#ef4444' : p.trend === 'down' ? '#22c55e' : '#94a3b8') + ';">' + (p.trend === 'up' ? '↑' : p.trend === 'down' ? '↓' : '→') + '</td></tr>';
    });
    html += '</tbody></table>';
  }
  if (gameState.competitorIntel && gameState.competitorIntel.swotAnalysis) {
    var swot = gameState.competitorIntel.swotAnalysis;
    html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:12px;">';
    var swotItems = [
      { key:'strengths', label:'🟢 优势', color:'#22c55e', bg:'rgba(34,197,94,0.08)' },
      { key:'weaknesses', label:'🔴 劣势', color:'#ef4444', bg:'rgba(239,68,68,0.08)' },
      { key:'opportunities', label:'🟡 机会', color:'#f59e0b', bg:'rgba(245,158,11,0.08)' },
      { key:'threats', label:'🟠 威胁', color:'#f97316', bg:'rgba(249,115,22,0.08)' }
    ];
    swotItems.forEach(function(item){
      html += '<div style="background:' + item.bg + ';border:1px solid ' + item.color + '30;border-radius:10px;padding:10px;">';
      html += '<div style="font-size:11px;font-weight:700;color:' + item.color + ';margin-bottom:6px;">' + item.label + '</div>';
      (swot[item.key] || []).forEach(function(s){ html += '<div style="font-size:9px;color:#475569;padding:2px 0;">• ' + s.text + (s.potential ? ' <span style="color:' + item.color + ';">(' + s.potential + ')</span>' : '') + '</div>'; });
      if ((swot[item.key] || []).length === 0) html += '<div style="font-size:9px;color:#94a3b8;">暂无</div>';
      html += '</div>';
    });
    html += '</div>';
  }
  if (!html) html = '<div style="text-align:center;padding:40px;color:#94a3b8;">市场分析数据加载中...</div>';
  return html;
}

function renderStrategicKPITab() {
  var html = '<div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:10px;">📈 战略KPI仪表盘</div>';
  var revs = gameState.financials ? gameState.financials.dailyRevenue : [];
  var exps = gameState.financials ? gameState.financials.dailyExpenses : [];
  var profits = gameState.financials ? gameState.financials.dailyProfit : [];
  var avgRevenue7d = revs.length >= 7 ? revs.slice(-7).reduce(function(s,r){return s+r;},0)/7 : 0;
  var avgRevenue30d = revs.length >= 30 ? revs.slice(-30).reduce(function(s,r){return s+r;},0)/30 : 0;
  var momGrowth = avgRevenue30d > 0 && revs.length >= 30 ? ((avgRevenue7d / Math.max(1,avgRevenue30d) - 1) * 100) : 0;
  var totalEmployees = (gameState.employees || []).length;
  var fleetCount = (gameState.ownedVehicles || []).length;
  var revenuePerEmployee = totalEmployees > 0 ? avgRevenue7d / totalEmployees : 0;
  var revenuePerVehicle = fleetCount > 0 ? avgRevenue7d / fleetCount : 0;
  var grossMargin = avgRevenue7d > 0 ? Math.max(-1, Math.min(1, (avgRevenue7d - (exps.length>=7?exps.slice(-7).reduce(function(s,e){return s+e;},0)/7:0)) / avgRevenue7d)) : 0;
  var npsVal = (gameState.npsSystem && gameState.npsSystem.trend30d) || gameState.npsScore || 50;
  var memberCount = (gameState.members || []).length;
  var churnEstimate = memberCount > 0 ? Math.round((getAtRiskCustomers ? getAtRiskCustomers(60).length : 0) / memberCount * 100) : 0;
  var marketShare = (gameState.marketAnalysis && gameState.marketAnalysis.yourShare) || 0.12;
  var kpiGroups = [
    { name:'增长指标', color:'#3b82f6', items:[
      { label:'月收入增长率(MoM)', value:momGrowth, unit:'%', target:10, format:'pct', good:5, bad:-5 },
      { label:'客户增长率', value:memberCount > 0 ? Math.round(memberCount/Math.max(1,gameState.currentDay/30)*10)/10 : 0, unit:'%/月', target:15, format:'pct', good:10, bad:-5 },
      { label:'车队增长率', value:fleetCount > 0 ? Math.round(fleetCount/Math.max(1,gameState.currentDay)*100)/100 : 0, unit:'辆/天', target:0.5, format:'number', good:0.3, bad:0.1 }
    ]},
    { name:'效率指标', color:'#8b5cf6', items:[
      { label:'人均营收', value:revenuePerEmployee, unit:'$/人/天', target:500, format:'currency', good:400, bad:200 },
      { label:'单车营收', value:revenuePerVehicle, unit:'$/车/天', target:300, format:'currency', good:250, bad:100 }
    ]},
    { name:'盈利指标', color:'#22c55e', items:[
      { label:'毛利率', value:grossMargin*100, unit:'%', target:35, format:'pct', good:25, bad:5 },
      { label:'净利润率', value:profits.length>=7?(profits.slice(-7).reduce(function(s,p){return s+p;},0)/7)/Math.max(1,avgRevenue7d)*100:0, unit:'%', target:20, format:'pct', good:15, bad:-5 }
    ]},
    { name:'健康指标', color:'#f59e0b', items:[
      { label:'流动比率', value:gameState.cash > 0 ? Math.min(10, gameState.cash / Math.max(1,(exps.length>=7?exps.slice(-7).reduce(function(s,e){return s+e;},0)/7*7:1))) : 0, unit:'', target:1.5, format:'number', good:1.2, bad:0.5 },
      { label:'现金储备天数', value:(exps.length>=7&&exps.slice(-7).reduce(function(s,e){return s+e;},0)>0)?Math.round(gameState.cash/(exps.slice(-7).reduce(function(s,e){return s+e;},0)/7)):0, unit:'天', target:90, format:'number', good:60, bad:20 }
    ]},
    { name:'客户指标', color:'#ec4899', items:[
      { label:'NPS评分', value:npsVal, unit:'', target:50, format:'number', good:40, bad:20 },
      { label:'流失率预估', value:churnEstimate, unit:'%', target:10, format:'pct_invert', good:15, bad:30 },
      { label:'市场份额', value:marketShare*100, unit:'%', target:20, format:'pct', good:15, bad:5 }
    ]}
  ];
  kpiGroups.forEach(function(group){
    html += '<div style="margin-bottom:12px;"><div style="font-size:11px;font-weight:700;color:' + group.color + ';margin-bottom:6px;">' + group.name + '</div>';
    html += '<div style="display:flex;flex-direction:column;gap:4px;">';
    group.items.forEach(function(kpi){
      var val = kpi.value;
      var displayVal = kpi.format === 'currency' ? formatCurrency(val) : kpi.format === 'pct' ? val.toFixed(1) + '%' : kpi.format === 'pct_invert' ? val.toFixed(1) + '%' : typeof val === 'number' ? Math.round(val * 10) / 10 : val;
      var meetsTarget = kpi.format === 'pct_invert' ? val <= kpi.target : kpi.format === 'pct' || kpi.format === 'number' ? val >= kpi.target : val >= kpi.target;
      var isGood = kpi.format === 'pct_invert' ? val <= kpi.good : val >= kpi.good;
      var isBad = kpi.format === 'pct_invert' ? val >= kpi.bad : val <= kpi.bad;
      var lightColor = isGood ? '#22c55e' : isBad ? '#ef4444' : '#f59e0b';
      var arrow = (kpi.format === 'pct' || kpi.format === 'pct_invert') ? (val > 0 ? '↑' : val < 0 ? '↓' : '→') : (val >= kpi.target ? '↑' : '↓');
      html += '<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:rgba(248,250,252,1);border-radius:6px;border-left:3px solid ' + lightColor + ';">';
      html += '<span style="width:8px;height:8px;border-radius:50%;background:' + lightColor + ';"></span>';
      html += '<span style="flex:1;font-size:10px;color:#475569;">' + kpi.label + '</span>';
      html += '<span style="font-size:11px;font-weight:700;color:#1e293b;">' + displayVal + '</span>';
      html += '<span style="font-size:10px;color:' + lightColor + ';">' + arrow + '</span>';
      html += '</div>';
    });
    html += '</div></div>';
  });
  return html;
}

function renderStrategyToolsTab() {
  var html = '<div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:10px;">🎯 战略规划工具</div>';
  html += '<div style="font-size:12px;font-weight:700;color:#ec4899;margin-bottom:8px;">📊 盈亏平衡分析</div>';
  var dailyFixedCost = 0;
  if (gameState.employees) gameState.employees.forEach(function(e){ dailyFixedCost += (e.salary||0)/30; });
  if (gameState.outlets) gameState.outlets.filter(function(o){return o.owned;}).forEach(function(o){
    var oc = OUTLET_CONFIGS.find(function(c){return c.id===o.id;});
    if (oc) dailyFixedCost += oc.unlockCost / 365 * 0.05;
  });
  var avgDailyRev = (gameState.financials && gameState.financials.dailyRevenue && gameState.financials.dailyRevenue.length > 0)
    ? gameState.financials.dailyRevenue.slice(-7).reduce(function(s,r){return s+r;},0)/7 : 1000;
  var contributionMargin = Math.max(0.1, Math.min(0.8, 1 - (dailyFixedCost > 0 ? Math.min(1, (gameState.todayExpense||0)/Math.max(1,avgDailyRev)) : 0.4)));
  var breakEvenDays = contributionMargin > 0 ? Math.ceil(dailyFixedCost / (avgDailyRev * contributionMargin)) : 999;
  var breakEvenOrders = contributionMargin > 0 ? Math.ceil(dailyFixedCost / (avgDailyRev * contributionMax)) : 999;
  var avgOrderValue = (gameState.orderHistory && gameState.orderHistory.length > 0)
    ? gameState.orderHistory.reduce(function(s,o){return s+(o.actualIncome||o.totalIncome||0);},0) / gameState.orderHistory.length : 500;
  breakEvenOrders = avgOrderValue > 0 ? Math.ceil(dailyFixedCost / (avgOrderValue * contributionMargin)) : 999;
  html += '<div style="background:rgba(236,72,153,0.08);border:1px solid rgba(236,72,153,0.2);border-radius:10px;padding:12px;margin-bottom:12px;">';
  html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">';
  html += '<div>日均固定成本<br><span style="font-size:16px;font-weight:700;color:#ec4899;">' + formatCurrency(dailyFixedCost) + '</span></div>';
  html += '<div>边际贡献率<br><span style="font-size:16px;font-weight:700;color:#ec4899;">' + (contributionMargin*100).toFixed(0) + '%</span></div>';
  html += '<div>盈亏平衡天数<br><span style="font-size:16px;font-weight:700;color:' + (breakEvenDays <= 30 ? '#22c55e' : breakEvenDays <= 90 ? '#f59e0b' : '#ef4444') + ';">' + breakEvenDays + '天</span></div>';
  html += '<div>盈亏平衡订单<br><span style="font-size:16px;font-weight:700;color:' + (breakEvenOrders <= 5 ? '#22c55e' : breakEverOrders <= 15 ? '#f59e0b' : '#ef4444') + ';">' + breakEvenOrders + '单/天</span></div>';
  html += '</div></div>';
  html += '<div style="font-size:12px;font-weight:700;color:#ec4899;margin-bottom:8px;">🔮 敏感性分析</div>';
  var scenarios = [
    { label:'需求-10%', demandChange:-0.1, revenueImpact: avgDailyRev * -0.1, profitImpact: avgDailyRev * -0.1 * contributionMargin - dailyFixedCost * 0.02 },
    { label:'需求+10%', demandChange:0.1, revenueImpact: avgDailyRev * 0.1, profitImpact: avgDailyRev * 0.1 * contributionMargin - dailyFixedCost * -0.01 },
    { label:'成本+10%', demandChange:0, revenueImpact: 0, profitImpact: -dailyFixedCost * 0.1 },
    { label:'价格-10%', demandChange:0.15, revenueImpact: avgDailyRev * 0.035, profitImpact: avgDailyRev * 0.035 * contributionMargin }
  ];
  html += '<div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px;">';
  scenarios.forEach(function(sc){
    var profitColor = sc.profitImpact >= 0 ? '#22c55e' : '#ef4444';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:rgba(248,250,252,1);border-radius:6px;">';
    html += '<span style="font-size:10px;color:#475569;">' + sc.label + '</span>';
    html += '<span style="font-size:10px;color:#64748b;">收入' + (sc.revenueImpact >= 0 ? '+' : '') + formatCurrency(sc.revenueImpact) + '</span>';
    html += '<span style="font-size:10px;font-weight:700;color:' + profitColor + ';">利润' + (sc.profitImpact >= 0 ? '+' : '') + formatCurrency(sc.profitImpact) + '</span>';
    html += '</div>';
  });
  html += '</div>';
  html += '<div style="font-size:12px;font-weight:700;color:#ec4899;margin-bottom:8px;">🏗️ 扩张ROI计算器</div>';
  var outletCosts = OUTLET_CONFIGS.filter(function(c){ return c.unlockCost > 0; }).slice(0,3);
  html += '<div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px;">';
  outletCosts.forEach(function(oc){
    var estDailyRevenue = (oc.citySize === 'large' ? 8000 : oc.citySize === 'medium' ? 4500 : 2500);
    var estDailyCost = estDailyRevenue * 0.55;
    var estDailyProfit = estDailyRevenue - estDailyCost;
    var paybackDays = Math.ceil(oc.unlockCost / Math.max(1, estDailyProfit));
    var annualROI = Math.round(estDailyProfit * 365 / oc.unlockCost * 100);
    html += '<div style="background:rgba(248,250,252,1);border-radius:8px;padding:10px;">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;"><span style="font-size:11px;font-weight:600;color:#1e293b;">' + oc.name + '</span><span style="font-size:9px;color:#94a3b8;">' + oc.cityLabel + '</span></div>';
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;font-size:9px;text-align:center;">';
    html += '<div>投资<br><b>' + formatCurrency(oc.unlockCost) + '</b></div>';
    html += '<div>日利润<br><b style="color:#22c55e;">' + formatCurrency(estDailyProfit) + '</b></div>';
    html += '<div>回本<br><b>' + paybackDays + '天</b></div>';
    html += '<div>年ROI<br><b style="color:' + (annualROI >= 50 ? '#22c55e' : annualROI >= 20 ? '#f59e0b' : '#ef4444') + ';">' + annualROI + '%</b></div>';
    html += '</div></div>';
  });
  html += '</div>';
  html += '<div style="font-size:12px;font-weight:700;color:#ec4899;margin-bottom:8px;">⚡ 场景规划器</div>';
  var scenarioInputs = [
    { desc:'购买10辆新SUV', cost:10*120000, extraDailyRevenue:10*350, extraDailyCost:10*80, payback:null },
    { desc:'开设城东分店', cost:OUTLET_CONFIGS[1]?OUTLET_CONFIGS[1].unlockCost:500000, extraDailyRevenue:3500, extraDailyCost:1900, payback:null },
    { desc:'全员培训计划', cost:20000, extraDailyRevenue:0.05*avgDailyRev, extraDailyCost:200, payback:null }
  ];
  html += '<div style="display:flex;flex-direction:column;gap:6px;">';
  scenarioInputs.forEach(function(si){
    si.payback = si.extraDailyRevenue > si.extraDailyCost ? Math.ceil(si.cost / Math.max(1, si.extraDailyRevenue - si.extraDailyCost)) : 999;
    var roi = si.payback < 365 ? Math.round((si.extraDailyRevenue - si.extraDailyCost) * 365 / si.cost * 100) : -1;
    html += '<div style="padding:8px 10px;background:rgba(248,250,252,1);border-radius:8px;border-left:3px solid ' + (si.payback <= 180 ? '#22c55e' : si.payback <= 365 ? '#f59e0b' : '#ef4444') + ';">';
    html += '<div style="font-size:11px;font-weight:600;color:#1e293b;">' + si.desc + '</div>';
    html += '<div style="display:flex;gap:12px;margin-top:4px;font-size:9px;color:#64748b;">';
    html += '<span>投资:' + formatCurrency(si.cost) + '</span>';
    html += '<span>日增收:+$' + Math.round(si.extraDailyRevenue) + '</span>';
    html += '<span>日增支:$' + Math.round(si.extraDailyCost) + '</span>';
    html += '<span>回本:<b style="color:' + (si.payback<=180?'#22c55e':si.payback<=365?'#f59e0b':'#ef4444') + ';">' + si.payback + '天</b></span>';
    if (roi >= 0) html += '<span>年ROI:<b style="color:#22c55e;">' + roi + '%</b></span>';
    html += '</div></div>';
  });
  html += '</div>';
  return html;
}

function renderNPSDashboard() {
  initNPSSystem();
  var ns = gameState.npsSystem;
  var html = '<div style="font-size:14px;font-weight:700;color:#1e293b;margin-bottom:12px;">📊 NPS实时仪表盘</div>';
  var bench = typeof getNPSBenchmarkComparison === 'function' ? getNPSBenchmarkComparison() : null;
  if (bench) {
    html += '<div style="background:' + bench.color + '15;border:1px solid ' + bench.color + '40;border-radius:12px;padding:16px;margin-bottom:14px;text-align:center;">';
    html += '<div style="font-size:36px;font-weight:700;color:' + bench.color + ';">' + bench.myNPS + '</div>';
    html += '<div style="font-size:11px;color:#64748b;">当前NPS（30天） | 行业基准: ' + bench.benchmark + ' | ' + bench.status + '</div>';
    html += '<div style="font-size:10px;color:#94a3b8;margin-top:4px;">' + bench.desc + '</div>';
    html += '</div>';
  }
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;">';
  html += '<div style="background:rgba(59,130,246,0.08);border-radius:10px;padding:12px;text-align:center;"><div style="font-size:18px;font-weight:700;color:#3b82f6;">' + ns.trend7d + '</div><div style="font-size:9px;color:#64748b;">7日NPS</div></div>';
  html += '<div style="background:rgba(168,85,247,0.08);border-radius:10px;padding:12px;text-align:center;"><div style="font-size:18px;font-weight:700;color:#a855f7;">' + (ns.scores||[]).length + '</div><div style="font-size:9px;color:#64748b;">总评价数</div></div>';
  html += '<div style="background:rgba(34,197,94,0.08);border-radius:10px;padding:12px;text-align:center;"><div style="font-size:18px;font-weight:700;color:#22c55e;">' + (ns.promoterReferrals||[]).length + '</div><div style="font-size:9px;color:#64748b;">推荐奖励</div></div>';
  html += '</div>';
  var trendLine = typeof getNPSTrendLine === 'function' ? getNPSTrendLine(14) : [];
  if (trendLine.length > 0) {
    html += '<div style="font-size:11px;font-weight:700;color:#1e293b;margin-bottom:6px;">📈 NPS趋势线（近14天）</div>';
    html += '<div style="display:flex;align-items:flex-end;gap:2px;height:60px;background:rgba(241,245,249,1);border-radius:8px;padding:6px;">';
    var maxNPS = Math.max(100, Math.max.apply(null, trendLine.map(function(t){return Math.abs(t.nps);}))+10);
    trendLine.forEach(function(t){
      var barH = Math.max(2, Math.abs(t.nps) / maxNPS * 48);
      var barColor = t.nps >= 40 ? '#22c55e' : t.nps >= 20 ? '#3b82f6' : t.nps >= 0 ? '#f59e0b' : '#ef4444';
      html += '<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;height:100%;">';
      html += '<div style="width:100%;max-width:16px;height:' + barH + 'px;background:' + barColor + ';border-radius:2px 2px 0 0;min-height:2px;"></div>';
      html += '</div>';
    });
    html += '</div>';
  }
  var breakdownByType = typeof getNPSBreakdown === 'function' ? getNPSBreakdown('type') : {};
  if (Object.keys(breakdownByType).length > 0) {
    html += '<div style="font-size:11px;font-weight:700;color:#1e293b;margin-top:12px;margin-bottom:6px;">🚗 按车型NPS分布</div>';
    Object.keys(breakdownByType).forEach(function(key){
      var d = breakdownByType[key];
      var color = d.nps >= 40 ? '#22c55e' : d.nps >= 20 ? '#3b82f6' : d.nps >= 0 ? '#f59e0b' : '#ef4444';
      html += '<div style="display:flex;align-items:center;gap:8px;padding:4px 0;"><span style="min-width:45px;font-size:10px;color:#475569;">' + key + '</span>';
      html += '<div style="flex:1;height:6px;background:rgba(226,232,240,1);border-radius:3px;"><div style="width:' + Math.min(100, Math.abs(d.nps) + 50) + '%;height:100%;background:' + color + ';border-radius:3px;"></div></div>';
      html += '<span style="min-width:28px;text-align:right;font-size:10px;font-weight:700;color:' + color + ';">' + d.nps + '</span>';
      html += '<span style="min-width:20px;font-size:9px;color:#94a3b8;">(' + d.count + ')</span></div>';
    });
  }
  if (ns.detractorsRecovery && ns.detractorsRecovery.length > 0) {
    var pendingRecoveries = ns.detractorsRecovery.filter(function(r){ return r.status !== 'Recovered' && r.status !== 'Lost'; });
    var recovered = ns.detractorsRecovery.filter(function(r){ return r.status === 'Recovered'; }).length;
    html += '<div style="font-size:11px;font-weight:700;color:#1e293b;margin-top:12px;margin-bottom:6px;">🔄 贬低者挽回</div>';
    html += '<div style="display:flex;gap:8px;">';
    html += '<div style="flex:1;background:rgba(34,197,94,0.08);border-radius:8px;padding:10px;text-align:center;"><div style="font-size:18px;font-weight:700;color:#22c55e;">' + recovered + '</div><div style="font-size:9px;color:#64748b;">已挽回</div></div>';
    html += '<div style="flex:1;background:rgba(245,158,11,0.08);border-radius:8px;padding:10px;text-align:center;"><div style="font-size:18px;font-weight:700;color:#f59e0b;">' + pendingRecoveries.length + '</div><div style="font-size:9px;color:#64748b;">跟进中</div></div>';
    html += '</div>';
  }
  return html;
}

function renderComplaintDashboard() {
  initComplaintSystem();
  var stats = typeof getComplaintStats === 'function' ? getComplaintStats() : { total:0, resolved:0, breached:0, openCount:0 };
  var html = '<div style="font-size:14px;font-weight:700;color:#1e293b;margin-bottom:12px;">⚠️ 投诉管理中心</div>';
  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:14px;">';
  html += '<div style="background:rgba(59,130,246,0.08);border-radius:8px;padding:10px;text-align:center;"><div style="font-size:18px;font-weight:700;color:#3b82f6;">' + stats.total + '</div><div style="font-size:9px;color:#64748b;">总投诉</div></div>';
  html += '<div style="background:rgba(34,197,94,0.08);border-radius:8px;padding:10px;text-align:center;"><div style="font-size:18px;font-weight:700;color:#22c55e;">' + stats.resolved + '</div><div style="font-size:9px;color:#64748b;">已解决</div></div>';
  html += '<div style="background:rgba(239,68,68,0.08);border-radius:8px;padding:10px;text-align:center;"><div style="font-size:18px;font-weight:700;color:#ef4444;">' + stats.breached + '</div><div style="font-size:9px;color:#64748b;">SLA违约</div></div>';
  html += '<div style="background:rgba(245,158,11,0.08);border-radius:8px;padding:10px;text-align:center;"><div style="font-size:18px;font-weight:700;color:#f59e0b;">' + stats.openCount + '</div><div style="font-size:9px;color:#64748b;">处理中</div></div>';
  html += '</div>';
  var complaints = (gameState.complaintSystem && gameState.complaintSystem.complaints) || [];
  var activeComplaints = complaints.filter(function(c){ return c.status !== 'Closed'; }).slice(-8);
  if (activeComplaints.length > 0) {
    html += '<div style="font-size:11px;font-weight:700;color:#1e293b;margin-bottom:6px;">📋 活跃投诉列表</div>';
    activeComplaints.forEach(function(c){
      var priorityColors = { Critical:'#ef4444', High:'#f97316', Normal:'#3b82f6', Low:'#64748b' };
      var statusColors = { Received:'#94a3b8', Categorized:'#f59e0b', Prioritized:'#f59e0b', Assigned:'#3b82f6', Resolved:'#22c55e', FollowedUp:'#22c55e', Closed:'#64748b' };
      var pc = priorityColors[c.priority] || '#64748b';
      var sc = statusColors[c.status] || '#94a3b8';
      html += '<div style="display:flex;align-items:center;gap:8px;padding:8px;background:rgba(248,250,252,1);border-radius:8px;margin-bottom:4px;border-left:3px solid ' + pc + ';">';
      html += '<div style="flex:1;"><div style="font-size:11px;font-weight:600;color:#1e293b;">' + c.title + '</div>';
      html += '<div style="font-size:9px;color:#64748b;">' + c.customerName + ' | D' + c.createdDay + ' | 赔偿 $' + c.compensation + '</div></div>';
      html += '<span style="font-size:8px;padding:2px 6px;border-radius:4px;background:' + pc + '20;color:' + pc + ';font-weight:600;">' + c.priority + '</span>';
      html += '<span style="font-size:8px;padding:2px 6px;border-radius:4px;background:' + sc + '20;color:' + sc + ';">' + c.status + '</span>';
      if (c.status === 'Received' || c.status === 'Categorized' || c.status === 'Prioritized') {
        html += '<button style="padding:2px 8px;border:none;border-radius:4px;font-size:8px;cursor:pointer;background:#3b82f6;color:#fff;" onclick="quickProcessComplaint(\'' + c.id + '\')">处理</button>';
      } else if (c.status === 'Assigned') {
        html += '<button style="padding:2px 8px;border:none;border-radius:4px;font-size:8px;cursor:pointer;background:#22c55e;color:#fff;" onclick="resolveComplaint(\'' + c.id + '\')">解决</button>';
      } else if (c.status === 'Resolved') {
        html += '<button style="padding:2px 8px;border:none;border-radius:4px;font-size:8px;cursor:pointer;background:#a855f7;color:#fff;" onclick="followUpComplaint(\'' + c.id + '\')">回访</button>';
      }
      html += '</div>';
    });
  } else {
    html += '<div style="text-align:center;padding:20px;color:#94a3b8;font-size:12px;">✅ 暂无活跃投诉</div>';
  }
  if (stats.totalCompensation > 0) {
    html += '<div style="margin-top:10px;padding:8px;background:rgba(239,68,68,0.06);border-radius:8px;font-size:10px;color:#ef4444;">累计赔偿支出: $' + formatCurrency(stats.totalCompensation) + (stats.breached > 0 ? ' | SLA违约罚款: $' + formatCurrency(stats.breached * 150) : '') + '</div>';
  }
  return html;
}

function quickProcessComplaint(complaintId) {
  categorizeComplaint(complaintId);
  prioritizeComplaint(complaintId);
  var employees = (gameState.employees || []).filter(function(e){ return e.role === '店长' || e.role === '销售员'; });
  if (employees.length > 0) assignComplaint(complaintId, employees[Math.floor(Math.random() * employees.length)].id);
  renderProgressionModal();
}

function renderCRMDashboard() {
  var members = gameState.members || [];
  var html = '<div style="font-size:14px;font-weight:700;color:#1e293b;margin-bottom:12px;">💜 CRM客户关系管理</div>';
  var topCustomers = typeof getTopCustomers === 'function' ? getTopCustomers(10) : [];
  if (topCustomers.length > 0) {
    html += '<div style="font-size:11px;font-weight:700;color:#1e293b;margin-bottom:6px;">🏆 客户终身价值 TOP10</div>';
    html += '<div style="display:flex;flex-direction:column;gap:3px;">';
    topCustomers.forEach(function(m, idx){
      var lv = typeof getMemberLevelInfo === 'function' ? getMemberLevelInfo(m.level) : {name:'会员',color:'#94a3b8'};
      var churnScore = typeof predictChurnScore === 'function' ? predictChurnScore(m.id) : 30;
      var riskColor = churnScore >= 60 ? '#ef4444' : churnScore >= 40 ? '#f59e0b' : '#22c55e';
      html += '<div style="display:flex;align-items:center;gap:8px;padding:5px 8px;background:' + (idx < 3 ? 'rgba(168,85,247,0.06)' : 'rgba(248,250,252,1)') + ';border-radius:6px;">';
      html += '<span style="min-width:16px;font-size:10px;color:#94a3b8;">#' + (idx+1) + '</span>';
      html += '<span style="min-width:50px;font-size:11px;font-weight:600;color:#1e293b;">' + m.name + '</span>';
      html += '<span style="padding:1px 6px;border-radius:8px;font-size:8px;font-weight:600;background:' + lv.color + '20;color:' + lv.color + ';">' + lv.name.substring(0,2) + '</span>';
      html += '<span style="flex:1;text-align:right;font-size:11px;font-weight:700;color:#a855f7;">' + formatCurrency(m.ltv) + '</span>';
      html += '<span style="font-size:8px;color:' + riskColor + ';">风险' + churnScore + '</span>';
      html += '</div>';
    });
    html += '</div>';
  }
  var atRisk = typeof getAtRiskCustomers === 'function' ? getAtRiskCustomers(60) : [];
  if (atRisk.length > 0) {
    html += '<div style="font-size:11px;font-weight:700;color:#1e293b;margin-top:12px;margin-bottom:6px;">⚠️ 流失风险客户 (' + atRisk.length + '人)</div>';
    html += '<div style="display:flex;flex-direction:column;gap:3px;">';
    atRisk.slice(0,5).forEach(function(m){
      html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:5px 8px;background:rgba(239,68,68,0.05);border-radius:6px;border-left:2px solid ' + (m.riskLevel === 'high' ? '#ef4444' : '#f59e0b') + ';">';
      html += '<span style="font-size:10px;color:#1e293b;">' + m.name + '</span>';
      html += '<span style="font-size:9px;color:#94a3b8;">' + m.daysSinceLast + '天未租</span>';
      html += '<button style="padding:1px 8px;border:none;border-radius:4px;font-size:8px;cursor:pointer;background:#f97316;color:#fff;" onclick="sendWinBackOffer(\'' + m.id + '\')">挽回</button>';
      html += '</div>';
    });
    html += '</div>';
  }
  var segments = typeof getCustomerSegmentAnalysis === 'function' ? getCustomerSegmentAnalysis() : null;
  if (segments) {
    html += '<div style="font-size:11px;font-weight:700;color:#1e293b;margin-top:12px;margin-bottom:6px;">👥 客户细分</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;">';
    var segmentItems = [
      { label:'商务客户', count:segments.business.count, pct:segments.business.pct, color:'#3b82f6' },
      { label:'旅游客户', count:segments.leisure.count, pct:segments.leisure.pct, color:'#22c55e' },
      { label:'高频客户', count:segments.frequent.count, pct:segments.frequent.pct, color:'#f59e0b' },
      { label:'低频客户', count:segments.occasional.count, pct:segments.occasional.pct, color:'#64748b' }
    ];
    segmentItems.forEach(function(s){
      html += '<div style="background:rgba(248,250,252,1);border-radius:8px;padding:10px;text-align:center;">';
      html += '<div style="font-size:16px;font-weight:700;color:' + s.color + ';">' + s.count + '</div>';
      html += '<div style="font-size:9px;color:#64748b;">' + s.label + ' (' + s.pct + '%)</div>';
      html += '</div>';
    });
    html += '</div>';
  }
  return html;
}

function sendWinBackOffer(memberId) {
  var member = gameState.members.find(function(m){ return m.id === memberId; });
  if (!member) return;
  var offerCost = 50 + member.level * 30;
  if (gameState.cash < offerCost) { showToast('资金不足','error'); return; }
  gameState.cash -= offerCost;
  gameState.todayExpense += offerCost;
  member.lastRentalDay = gameState.currentDay;
  member.isActive = true;
  addMessage('🎁 已向 ' + member.name + ' 发送挽回优惠（-$' + offerCost + '）', 'good');
  renderProgressionModal(); saveGame();
}
function renderKPIDashboard() {
  if (typeof getKPIDashboard !== 'function') return '<div style="padding:20px;text-align:center;color:#94a3b8;">KPI模块未加载</div>';
  var kpi = getKPIDashboard();
  var runway = kpi.cashRunway;
  var runwayColor = runway < 7 ? '#ef4444' : runway < 30 ? '#f59e0b' : '#22c55e';
  var wc = kpi.workingCapital;
  var wcColor = wc.workingCapital >= 0 ? '#22c55e' : '#ef4444';
  var html = '';
  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px;">';
  var quickStats = [
    {label:'💰 现金跑道', value: runway === 999 ? '∞天' : runway + '天', color:runwayColor},
    {label:'📊 营收增长(月)', value:(kpi.revenueGrowth.mom >= 0 ? '+' : '') + kpi.revenueGrowth.mom + '%', color:kpi.revenueGrowth.mom >= 0 ? '#22c55e' : '#ef4444'},
    {label:'📈 净利润率', value:kpi.profitMargins.net + '%', color:kpi.profitMargins.net >= 10 ? '#22c55e' : kpi.profitMargins.net >= 0 ? '#f59e0b' : '#ef4444'},
    {label:'🏭 EBITDA', value:_fmt(kpi.ebitda), color:'#3b82f6'}
  ];
  quickStats.forEach(function(s) {
    html += '<div style="background:#ffffff;border-radius:10px;padding:12px;border:1px solid rgba(226,232,240,0.6);text-align:center;">';
    html += '<div style="font-size:9px;color:#94a3b8;margin-bottom:4px;">'+s.label+'</div>';
    html += '<div style="font-size:16px;font-weight:700;color:'+s.color+';">'+s.value+'</div>';
    html += '</div>';
  });
  html += '</div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">';
  html += '<div style="background:#ffffff;border-radius:10px;padding:14px;border:1px solid rgba(226,232,240,0.6);">';
  html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:10px;border-bottom:2px solid rgba(59,130,246,0.3);padding-bottom:6px;">📈 增长指标</div>';
  html += '<table style="width:100%;border-collapse:collapse;font-size:11px;"><tbody>';
  var growthRows = [
    ['本月营收', _fmt(kpi.revenueGrowth.thisMonth), '上月', _fmt(kpi.revenueGrowth.lastMonth)],
    ['本季营收', _fmt(kpi.revenueGrowth.thisQuarter), '上季', _fmt(kpi.revenueGrowth.lastQuarter)],
    ['月增长率(MoM)', (kpi.revenueGrowth.mom >= 0 ? '+' : '') + kpi.revenueGrowth.mom + '%', '', ''],
    ['季增长率(QoQ)', (kpi.revenueGrowth.qoq >= 0 ? '+' : '') + kpi.revenueGrowth.qoq + '%', '', '']
  ];
  growthRows.forEach(function(r,i){
    var bg = i%2===0?'#ffffff':'rgba(248,250,252,0.5)';
    html += '<tr style="'+bg+'"><td style="padding:5px 8px;color:#475569;">'+r[0]+'</td><td style="padding:5px 8px;text-align:right;font-weight:600;color:#1e293b;">'+r[1]+'</td><td style="padding:5px 8px;color:#94a3b8;">'+r[2]+'</td><td style="padding:5px 8px;text-align:right;color:#64748b;">'+r[3]+'</td></tr>';
  });
  html += '</tbody></table></div>';
  html += '<div style="background:#ffffff;border-radius:10px;padding:14px;border:1px solid rgba(226,232,240,0.6);">';
  html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:10px;border-bottom:2px solid rgba(168,85,247,0.3);padding-bottom:6px;">💹 利润率分析</div>';
  html += '<table style="width:100%;border-collapse:collapse;font-size:11px;"><tbody>';
  var marginRows = [
    ['毛利率', kpi.profitMargins.gross + '%', Math.abs(kpi.profitMargins.gross)],
    ['营业利润率', kpi.profitMargins.operating + '%', Math.abs(kpi.profitMargins.operating)],
    ['净利润率', kpi.profitMargins.net + '%', Math.abs(kpi.profitMargins.net)]
  ];
  marginRows.forEach(function(m,i){
    var barW = Math.min(100, m[2] * 3);
    var barColor = m[2] >= 15 ? '#22c55e' : m[2] >= 5 ? '#f59e0b' : '#ef4444';
    html += '<tr><td style="padding:5px 0;color:#475569;width:80px;">'+m[0]+'</td><td style="padding:5px 8px;font-weight:700;color:'+barColor+';width:50px;">'+m[1]+'</td><td style="padding:5px 0;"><div style="width:100%;height:8px;background:rgba(226,232,240,1);border-radius:4px;overflow:hidden;"><div style="width:'+barW+'%;height:100%;background:'+barColor+';border-radius:4px;"></div></td></tr>';
  });
  html += '</tbody></table></div></div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">';
  html += '<div style="background:#ffffff;border-radius:10px;padding:14px;border:1px solid rgba(226,232,240,0.6);">';
  html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:10px;border-bottom:2px solid rgba(34,197,94,0.3);padding-bottom:6px;">🚗 运营效率</div>';
  html += '<div style="margin-bottom:8px;display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(226,232,240,0.4);"><span style="font-size:11px;color:#475569;">车队利用率</span><span style="font-size:13px;font-weight:700;color:#3b82f6;">'+kpi.fleetUtilization+'%</span></div>';
  html += '<div style="margin-bottom:8px;display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(226,232,240,0.4);"><span style="font-size:11px;color:#475569;">资产周转率</span><span style="font-size:13px;font-weight:700;color:#3b82f6;">'+kpi.assetTurnover+'x</span></div>';
  html += '<div style="display:flex;justify-content:space-between;padding:6px 0;"><span style="font-size:11px;color:#475569;">盈亏平衡天数</span><span style="font-size:13px;font-weight:700;color:'+(kpi.breakEvenAnalysis.breakEvenDays<=30?'#22c55e':kpi.breakEvenAnalysis.breakEvenDays<=60?'#f59e0b':'#ef4444')+';">'+kpi.breakEvenAnalysis.breakEvenDays+'天</span></div>';
  html += '</div>';
  html += '<div style="background:#ffffff;border-radius:10px;padding:14px;border:1px solid rgba(226,232,240,0.6);">';
  html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:10px;border-bottom:2px solid rgba(245,158,11,0.3);padding-bottom:6px;">👥 客户价值</div>';
  html += '<div style="margin-bottom:8px;display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(226,232,240,0.4);"><span style="font-size:11px;color:#475569;">客户获取成本(CAC)</span><span style="font-size:13px;font-weight:700;color:#f59e0b;">'+_fmt(kpi.customerAcquisitionCost)+'</span></div>';
  html += '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(226,232,240,0.4);"><span style="font-size:11px;color:#475569;">客户生命周期价值(CLV)</span><span style="font-size:13px;font-weight:700;color:#22c55e;">'+_fmt(kpi.customerLifetimeValue)+'</span></div>';
  var clvcacRatio = kpi.customerAcquisitionCost > 0 ? Math.round(kpi.customerLifetimeValue / kpi.customerAcquisitionCost * 10) / 10 : 0;
  html += '<div style="display:flex;justify-content:space-between;padding:6px 0;"><span style="font-size:11px;color:#475569;">CLV/CAC 比值</span><span style="font-size:13px;font-weight:700;color:'+(clvcacRatio>=3?'#22c55e':clvcacRatio>=1?'#f59e0b':'#ef4444')+';">'+clvcacRatio+'x</span></div>';
  html += '</div></div>';
  html += '<div style="background:#ffffff;border-radius:10px;padding:14px;border:1px solid rgba(226,232,240,0.6);margin-bottom:14px;">';
  html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:10px;border-bottom:2px solid rgba(99,102,241,0.3);padding-bottom:6px;">⚖️ 财务健康度</div>';
  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">';
  var ratioItems = [
    {label:'流动比率', value:kpi.balanceRatios.currentRatio, good: kpi.balanceRatios.currentRatio >= 1.5, desc:'>1.5 健康'},
    {label:'资产负债率', value:(kpi.balanceRatios.debtToEquity*100).toFixed(1)+'%', good: kpi.balanceRatios.debtToEquity <= 1, desc:'<100% 安全'},
    {label:'ROA(资产回报)', value:kpi.balanceRatios.roa+'%', good: kpi.balanceRatios.roa > 0, desc:'>0 盈利'},
    {label:'ROE(权益回报)', value:kpi.balanceRatios.roe+'%', good: kpi.balanceRatios.roe > 5, desc:'>5% 良好'}
  ];
  ratioItems.forEach(function(r) {
    html += '<div style="background:rgba(248,250,252,1);border-radius:8px;padding:10px;text-align:center;">';
    html += '<div style="font-size:9px;color:#94a3b8;margin-bottom:4px;">'+r.label+'</div>';
    html += '<div style="font-size:15px;font-weight:700;color:'+(r.good?'#22c55e':'#ef4444')+';">'+r.value+'</div>';
    html += '<div style="font-size:8px;color:#cbd5e1;">'+r.desc+'</div></div>';
  });
  html += '</div>';
  html += '<div style="margin-top:10px;display:flex;gap:8px;">';
  html += '<div style="flex:1;background:rgba(248,250,252,1);border-radius:8px;padding:10px;text-align:center;"><div style="font-size:9px;color:#94a3b8;">营运资本</div><div style="font-size:14px;font-weight:700;color:'+wcColor+';">'+_fmt(wc.workingCapital)+'</div></div>';
  html += '<div style="flex:1;background:rgba(248,250,252,1);border-radius:8px;padding:10px;text-align:center;"><div style="font-size:9px;color:#94a3b8;">流动资产</div><div style="font-size:14px;font-weight:700;color:#3b82f6;">'+_fmt(wc.currentAssets)+'</div></div>';
  html += '<div style="flex:1;background:rgba(248,250,252,1);border-radius:8px;padding:10px;text-align:center;"><div style="font-size:9px;color:#94a3b8;">流动负债</div><div style="font-size:14px;font-weight:700;color:#f87171;">'+_fmt(wc.currentLiabilities)+'</div></div>';
  html += '</div></div>';
  return html;
}
function renderTaxCenter() {
  if (typeof getTaxSummary !== 'function') return '<div style="padding:20px;text-align:center;color:#94a3b8;">税务模块未加载</div>';
  var tax = getTaxSummary();
  var html = '';
  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px;">';
  var taxCards = [
    {label:'📊 本年累计利润', value:_fmt(tax.ytdProfit), color:tax.ytdProfit>=0?'#22c55e':'#ef4444'},
    {label:'🧾 已缴税款', value:_fmt(tax.ytdTaxPaid), color:'#3b82f6'},
    {label:'⚠️ 应缴税金', value:_fmt(tax.totalOwed), color:tax.totalOwed>0?'#f59e0b':'#22c55e'},
    {label:'📅 已申报季度', value:tax.quartersFiled+'/4', color:tax.quartersFiled>=2?'#22c55e':'#f59e0b'}
  ];
  taxCards.forEach(function(c) {
    html += '<div style="background:#ffffff;border-radius:10px;padding:12px;border:1px solid rgba(226,232,240,0.6);text-align:center;">';
    html += '<div style="font-size:9px;color:#94a3b8;margin-bottom:4px;">'+c.label+'</div>';
    html += '<div style="font-size:15px;font-weight:700;color:'+c.color+';">'+c.value+'</div>';
    html += '</div>';
  });
  html += '</div>';
  html += '<div style="background:#ffffff;border-radius:10px;padding:14px;border:1px solid rgba(226,232,240,0.6);margin-bottom:14px;">';
  html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:10px;border-bottom:2px solid rgba(239,68,68,0.3);padding-bottom:6px;">📋 税种明细</div>';
  html += '<table style="width:100%;border-collapse:collapse;font-size:11px;"><tbody>';
  var taxTypes = [
    ['企业所得税 ('+(tax.corporateTaxRate*100)+'%)', tax.ytdProfit*tax.corporateTaxRate, '年度利润计征'],
    ['增值税/VAT ('+(tax.vatRate*100)+'%)', tax.vatCollected, '租金收入计征'],
    ['财产税 ('+(tax.propertyTaxRate*100)+'%/年)', tax.propertyTaxOwed, '车队净值计征'],
    ['滞纳金/罚款', tax.taxPenalties, '逾期产生']
  ];
  taxTypes.forEach(function(t,i){
    var bg = i%2===0?'#ffffff':'rgba(248,250,252,0.5)';
    html += '<tr style="'+bg+'"><td style="padding:6px 10px;color:#1e293b;font-weight:600;">'+t[0]+'</td><td style="padding:6px 10px;text-align:right;color:#f87171;">'+_fmt(t[1])+'</td><td style="padding:6px 10px;color:#94a3b8;font-size:10px;">'+t[2]+'</td></tr>';
  });
  html += '</tbody></table></div>';
  if (tax.nextFiling) {
    html += '<div style="background:'+(tax.nextFiling.daysLeft<=0?'rgba(239,68,68,0.08)':tax.nextFiling.daysLeft<=7?'rgba(245,158,11,0.08)':'rgba(34,197,94,0.05)')+';border-radius:10px;padding:14px;border:1px solid '+(tax.nextFiling.daysLeft<=0?'rgba(239,68,68,0.3)':tax.nextFiling.daysLeft<=7?'rgba(245,158,11,0.3)':'rgba(34,197,94,0.2)')+';margin-bottom:14px;">';
    html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:8px;">⏰ 下次报税截止</div>';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;">';
    html += '<div><span style="font-size:18px;font-weight:700;color:'+(tax.nextFiling.daysLeft<=0?'#ef4444':tax.nextFiling.daysLeft<=7?'#f59e0b':'#22c55e')+';">第'+tax.nextFiling.quarter+'季度</span>';
    html += '<span style="font-size:11px;color:#64748b;margin-left:8px;">应缴 '+_fmt(tax.nextFiling.amount)+' · 剩余 '+Math.max(0,tax.nextFiling.daysLeft)+' 天</span></div>';
    html += '<button class="action-btn btn-buy" onclick="doPayTaxes()">立即缴税</button></div></div>';
  }
  html += '<div style="background:#ffffff;border-radius:10px;padding:14px;border:1px solid rgba(226,232,240,0.6);margin-bottom:14px;">';
  html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:10px;border-bottom:2px solid rgba(168,85,247,0.3);padding-bottom:6px;">📉 折旧方法优化</div>';
  html += '<div style="display:flex;gap:10px;align-items:center;margin-bottom:8px;">';
  html += '<button style="flex:1;padding:10px;border:none;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;'+(tax.depreciationMethod==='straight'?'background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;':'background:rgba(241,245,249,1);color:#475569;border:1px solid rgba(203,213,225,1);')+'" onclick="doSwitchDepreciation(\'straight\')">直线折旧法<br><span style="font-size:9px;font-weight:400;">均匀分摊，税负平稳</span></button>';
  html += '<button style="flex:1;padding:10px;border:none;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;'+(tax.depreciationMethod==='accelerated'?'background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;':'background:rgba(241,245,249,1);color:#475569;border:1px solid rgba(203,213,225,1);')+'" onclick="doSwitchDepreciation(\'accelerated\')">加速折旧法<br><span style="font-size:9px;font-weight:400;">前两年双倍，前期少交税</span></button>';
  html += '</div>';
  html += '<div style="font-size:10px;color:#64748b;line-height:1.6;">当前使用: <strong>'+(tax.depreciationMethod==='straight'?'直线法（每年等额）':'加速法（前两年双倍余额递减）')+'</strong>。加速折旧可延迟纳税，改善现金流。</div>';
  html += '</div>';
  html += '<div style="display:flex;gap:8px;">';
  html += '<button class="action-btn btn-buy" style="flex:1;" onclick="doPayTaxes()" '+(tax.totalOwed<=0?'disabled style="opacity:0.5;"':'')+'>💰 缴纳所有税款 ('+_fmt(tax.totalOwed)+')</button>';
  html += '</div>';
  return html;
}
function doPayTaxes() {
  if (typeof payTaxes === 'function') {
    var result = payTaxes();
    if (!result.success) showToast(result.message || '无需缴税', result.success ? 'success' : 'warn');
    else showToast('成功缴税 ' + formatCurrency(result.paid), 'success');
    updateUI(); saveGame(); renderFinanceModal();
  }
}
function doSwitchDepreciation(method) {
  if (typeof optimizeDepreciationMethod === 'function') {
    optimizeDepreciationMethod(method);
    updateUI(); saveGame(); renderFinanceModal();
  }
}
function renderDepreciationSchedule() {
  if (typeof getFleetDepreciationReport !== 'function') return '<div style="padding:20px;text-align:center;color:#94a3b8;">折旧模块未加载</div>';
  var report = getFleetDepreciationReport();
  var html = '';
  html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px;">';
  var depCards = [
    {label:'🚗 车队原值', value:_fmt(report.totalOriginalCost), color:'#3b82f6'},
    {label:'📉 累计折旧', value:_fmt(report.totalAccumulated), color:'#f59e0b'},
    {label:'💎 车队账面净值', value:_fmt(report.totalBookValue), color:'#22c55e'},
    {label:'📅 月折旧费', value:_fmt(report.totalMonthlyExpense), color:'#f87171'}
  ];
  depCards.forEach(function(c) {
    html += '<div style="background:#ffffff;border-radius:10px;padding:12px;border:1px solid rgba(226,232,240,0.6);text-align:center;">';
    html += '<div style="font-size:9px;color:#94a3b8;margin-bottom:4px;">'+c.label+'</div>';
    html += '<div style="font-size:15px;font-weight:700;color:'+c.color+';">'+c.value+'</div>';
    html += '</div>';
  });
  html += '</div>';
  var totalDepreciatedPct = report.totalOriginalCost > 0 ? Math.round(report.totalAccumulated / report.totalOriginalCost * 10000) / 100 : 0;
  html += '<div style="background:rgba(248,250,252,1);border-radius:10px;padding:14px;margin-bottom:14px;">';
  html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:8px;">📊 折旧进度</div>';
  html += '<div style="width:100%;height:12px;background:rgba(226,232,240,1);border-radius:6px;overflow:hidden;margin-bottom:6px;">';
  html += '<div style="width:'+totalDepreciatedPct+'%;height:100%;background:linear-gradient(90deg,#3b82f6,#8b5cf6);border-radius:6px;"></div></div>';
  html += '<div style="font-size:10px;color:#64748b;">已折旧 '+totalDepreciatedPct+'% · 剩余账面价值 '+_fmt(report.totalBookValue)+'</div></div>';
  if (report.vehicleDetails.length > 0) {
    html += '<div style="background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid rgba(226,232,240,0.6);">';
    html += '<table style="width:100%;border-collapse:collapse;font-size:10px;"><thead><tr style="background:rgba(241,245,249,1);">';
    html += '<th style="padding:8px 10px;text-align:left;color:#1e293b;">车辆</th><th style="padding:8px 6px;text-align:right;color:#1e293b;">原值</th><th style="padding:8px 6px;text-align:right;color:#1e293b;">累计折旧</th><th style="padding:8px 6px;text-align:right;color:#1e293b;">账面净值</th><th style="padding:8px 6px;text-align:right;color:#1e293b;">月折旧</th><th style="padding:8px 6px;text-align:center;color:#1e293b;">方法</th><th style="padding:8px 6px;text-align:center;color:#1e293b;">车龄</th></tr></thead><tbody>';
    report.vehicleDetails.forEach(function(v,i){
      var bg = i%2===0?'#ffffff':'rgba(248,250,252,0.5)';
      var methodLabel = v.method==='accelerated'?'加速':'直线';
      var ageDisplay = v.ageMonths<12?v.ageMonths+'个月':Math.floor(v.ageMonths/12)+'年'+(v.ageMonths%12)+'月';
      html += '<tr style="'+bg+';border-bottom:1px solid rgba(226,232,240,0.4);">';
      html += '<td style="padding:6px 10px;color:#1e293b;font-weight:500;">'+v.name+'<br><span style="color:#94a3b8;font-size:9px;">'+(v.licensePlate||'—')+'</span></td>';
      html += '<td style="padding:6px 6px;text-align:right;color:#3b82f6;">'+_fmt(v.originalCost)+'</td>';
      html += '<td style="padding:6px 6px;text-align:right;color:#f59e0b;">'+_fmt(v.accumulated)+'</td>';
      html += '<td style="padding:6px 6px;text-align:right;font-weight:600;color:#22c55e;">'+_fmt(v.bookValue)+'</td>';
      html += '<td style="padding:6px 6px;text-align:right;color:#f87171;">'+_fmt(v.monthlyExpense)+'</td>';
      html += '<td style="padding:6px 6px;text-align:center;"><span style="padding:2px 6px;border-radius:3px;font-size:9px;background:'+(v.method==='accelerated'?'rgba(168,85,247,0.15);color:#a855f7':'rgba(59,130,246,0.15);color:#3b82f6')+';">'+methodLabel+'</span></td>';
      html += '<td style="padding:6px 6px;text-align:center;color:#64748b;">'+ageDisplay+'</td></tr>';
    });
    html += '</tbody></table></div>';
  } else {
    html += '<div class="empty-state"><div class="icon">🚗</div><div class="text">暂无车辆数据</div></div>';
  }
  return html;
}
function renderBudgetManagement() {
  if (typeof getBudgetVariance !== 'function') return '<div style="padding:20px;text-align:center;color:#94a3b8;">预算模块未加载</div>';
  var variance = getBudgetVariance();
  var b = gameState.budget || {};
  var html = '';
  html += '<div style="background:rgba(248,250,252,1);border-radius:10px;padding:14px;margin-bottom:14px;">';
  html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:10px;">🎯 月度预算设置</div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">';
  html += '<div><label style="font-size:10px;color:#64748b;display:block;margin-bottom:4px;">收入目标</label><input type="number" id="budgetRevenueTarget" value="'+b.monthlyRevenueTarget+'" style="width:100%;padding:8px;background:rgba(226,232,240,0.8);border:1px solid rgba(203,213,225,1);border-radius:6px;color:#1e293b;font-size:12px;"></div>';
  html += '<div><label style="font-size:10px;color:#64748b;display:block;margin-bottom:4px;">工资上限</label><input type="number" id="budgetSalariesCap" value="'+b.salariesCap+'" style="width:100%;padding:8px;background:rgba(226,232,240,0.8);border:1px solid rgba(203,213,225,1);border-radius:6px;color:#1e293b;font-size:12px;"></div>';
  html += '<div><label style="font-size:10px;color:#64748b;display:block;margin-bottom:4px;">营销上限</label><input type="number" id="budgetMarketingCap" value="'+b.marketingCap+'" style="width:100%;padding:8px;background:rgba(226,232,240,0.8);border:1px solid rgba(203,213,225,1);border-radius:6px;color:#1e293b;font-size:12px;"></div>';
  html += '<div><label style="font-size:10px;color:#64748b;display:block;margin-bottom:4px;">维护上限</label><input type="number" id="budgetMaintenanceCap" value="'+b.maintenanceCap+'" style="width:100%;padding:8px;background:rgba(226,232,240,0.8);border:1px solid rgba(203,213,225,1);border-radius:6px;color:#1e293b;font-size:12px;"></div>';
  html += '</div>';
  html += '<button class="action-btn btn-buy" style="width:100%;margin-top:10px;" onclick="doSaveBudget()">保存预算设置</button>';
  html += '</div>';
  html += '<div style="background:#ffffff;border-radius:10px;padding:14px;border:1px solid rgba(226,232,240,0.6);margin-bottom:14px;">';
  html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:10px;border-bottom:2px solid rgba(59,130,246,0.3);padding-bottom:6px;">📊 预算执行差异分析（本月）</div>';
  html += '<table style="width:100%;border-collapse:collapse;font-size:11px;"><thead><tr style="background:rgba(241,245,249,1);"><th style="padding:8px 10px;text-align:left;color:#1e293b;">项目</th><th style="padding:8px 10px;text-align:right;color:#1e293b;">预算</th><th style="padding:8px 10px;text-align:right;color:#1e293b;">实际</th><th style="padding:8px 10px;text-align:right;color:#1e293b;">差异</th><th style="padding:8px 10px;text-align:right;color:#1e293b;">偏差%</th></tr></thead><tbody>';
  var budgetRows = [
    {name:'营业收入', target:variance.revenue.target, actual:variance.revenue.actual, variance:variance.revenue.varianceance, pct:variance.revenue.variancePct, inverse:false},
    {name:'员工工资', target:variance.salaries.target, actual:variance.salaries.actual, variance:variance.salaries.variance, pct:variance.salaries.target>0?Math.round(variance.salaries.variance/variance.salaries.target*10000)/100:0, inverse:true},
    {name:'营销费用', target:variance.marketing.target, actual:variance.marketing.actual, variance:variance.marketing.variance, pct:variance.marketing.target>0?Math.round(variance.marketing.variance/variance.marketing.target*10000)/100:0, inverse:true},
    {name:'维护费用', target:variance.maintenance.target, actual:variance.maintenance.actual, variance:variance.maintenance.variance, pct:variance.maintenance.target>0?Math.round(variance.maintenance.variance/variance.maintenance.target*10000)/100:0, inverse:true}
  ];
  budgetRows.forEach(function(row,i){
    var bg = i%2===0?'#ffffff':'rgba(248,250,252,0.5)';
    var isGood = row.inverse ? row.variance <= 0 : row.variance >= 0;
    var vColor = isGood ? '#22c55e' : '#ef4444';
    var vPrefix = (row.variance>=0 && !row.inverse || row.variance<0 && row.inverse)?'+':'';
    html += '<tr style="'+bg+';border-bottom:1px solid rgba(226,232,240,0.4);">';
    html += '<td style="padding:7px 10px;color:#1e293b;font-weight:500;">'+row.name+'</td>';
    html += '<td style="padding:7px 10px;text-align:right;color:#64748b;">'+_fmt(row.target)+'</td>';
    html += '<td style="padding:7px 10px;text-align:right;color:#1e293b;">'+_fmt(row.actual)+'</td>';
    html += '<td style="padding:7px 10px;text-align:right;font-weight:600;color:'+vColor+';">'+vPrefix+_fmt(Math.abs(row.variance))+'</td>';
    html += '<td style="padding:7px 10px;text-align:right;"><span style="color:'+vColor+';font-weight:600;">'+(row.pct>=0?'+':'')+row.pct+'%</span></td></tr>';
  });
  html += '</tbody></table></div>';
  html += '<div style="background:'+(variance.overallStatus==='favorable'?'rgba(34,197,94,0.06)':'rgba(239,68,68,0.06)')+';border:1px solid '+(variance.overallStatus==='favorable'?'rgba(34,197,94,0.2)':'rgba(239,68,68,0.2)')+';border-radius:10px;padding:14px;margin-bottom:14px;">';
  html += '<div style="display:flex;justify-content:space-between;align-items:center;">';
  html += '<div><span style="font-size:13px;font-weight:700;color:'+(variance.overallStatus==='favorable'?'#22c55e':'#ef4444')+';">'+(variance.overallStatus==='favorable'?'✅ 预算执行良好':'❌ 预算超支警告')+'</span>';
  html += '<span style="font-size:11px;color:#64748b;margin-left:8px;">收入差异 '+_fmt(variance.revenue.varianceance)+'</span></div>';
  html += '<button class="action-btn '+(variance.overallStatus==='favorable'?'btn-buy':'btn-sell')+'" onclick="doMonthEndClosing()">📊 月度结账</button></div></div>';
  if (b.varianceHistory && b.varianceHistory.length > 0) {
    html += '<div style="background:#ffffff;border-radius:10px;padding:14px;border:1px solid rgba(226,232,240,0.6);">';
    html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:10px;border-bottom:2px solid rgba(139,92,246,0.3);padding-bottom:6px;">📜 结账历史</div>';
    b.varianceHistory.slice(-3).forEach(function(h,i){
      html += '<div style="padding:8px;background:'+(i%2===0?'#ffffff':'rgba(248,250,252,0.5)')+';border-radius:6px;margin-bottom:6px;">';
      html += '<div style="display:flex;justify-content:space-between;font-size:11px;"><span style="font-weight:600;color:#1e293b;">'+h.period+' (D'+h.closingDay+')</span><span style="color:'+(h.incomeStatement.netIncome>=0?'#22c55e':'#ef4444')+';font-weight:700;">净利润 '+_fmt(h.incomeStatement.netIncome)+'</span></div>';
      html += '<div style="font-size:9px;color:#94a3b8;margin-top:2px;">EBITDA: '+_fmt(h.kpis.ebitda)+' · 收入: '+_fmt(h.incomeStatement.revenue.total)+'</div></div>';
    });
    html += '</div>';
  }
  return html;
}
function doSaveBudget() {
  if (typeof setBudget === 'function') {
    setBudget({
      monthlyRevenueTarget: parseInt(document.getElementById('budgetRevenueTarget').value)||100000,
      salariesCap: parseInt(document.getElementById('budgetSalariesCap').value)||50000,
      marketingCap: parseInt(document.getElementById('budgetMarketingCap').value)||20000,
      maintenanceCap: parseInt(document.getElementById('budgetMaintenanceCap').value)||15000
    });
    showToast('预算设置已保存','success');
    renderFinanceModal();
  }
}
function doMonthEndClosing() {
  if (typeof runMonthEndClosing === 'function') {
    var result = runMonthEndClosing();
    if (!result.success) showToast(result.message, 'warn');
    else showToast('结账完成！净利润 '+formatCurrency(result.report.incomeStatement.netIncome),'success');
    updateUI(); saveGame(); renderFinanceModal();
  }
}
function renderCashForecastUI() {
  if (typeof generateCashForecast !== 'function') return '<div style="padding:20px;text-align:center;color:#94a3b8;">预测模块未加载</div>';
  var forecast = generateCashForecast(7);
  var runway = typeof getCashRunway === 'function' ? getCashRunway() : 999;
  var runwayColor = runway < 7 ? '#ef4444' : runway < 30 ? '#f59e0b' : '#22c55e';
  var html = '';
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;">';
  html += '<div style="background:#ffffff;border-radius:10px;padding:12px;border:1px solid rgba(226,232,240,0.6);text-align:center;"><div style="font-size:9px;color:#94a3b8;margin-bottom:4px;">当前现金</div><div style="font-size:18px;font-weight:700;color:#22c55e;">'+_fmt(gameState.cash||0)+'</div></div>';
  html += '<div style="background:#ffffff;border-radius:10px;padding:12px;border:1px solid rgba(226,232,240,0.6);text-align:center;"><div style="font-size:9px;color:#94a3b8;margin-bottom:4px;">现金跑道</div><div style="font-size:18px;font-weight:700;color:'+runwayColor+';">'+(runway===999?'∞':runway)+'天</div></div>';
  html += '<div style="background:#ffffff;border-radius:10px;padding:12px;border:1px solid rgba(226,232,240,0.6);text-align:center;"><div style="font-size:9px;color:#94a3b8;margin-bottom:4px;">预测周期</div><div style="font-size:18px;font-weight:700;color:#3b82f6;">7天</div></div>';
  html += '</div>';
  html += '<div style="background:#ffffff;border-radius:10px;padding:14px;border:1px solid rgba(226,232,240,0.6);margin-bottom:14px;">';
  html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:10px;border-bottom:2px solid rgba(59,130,246,0.3);padding-bottom:6px;">🔮 未来7日现金预测</div>';
  html += '<table style="width:100%;border-collapse:collapse;font-size:11px;"><thead><tr style="background:rgba(241,245,249,1);"><th style="padding:8px 10px;text-align:left;color:#1e293b;">日期</th><th style="padding:8px 10px;text-align:right;color:#1e293b;">预计余额</th><th style="padding:8px 10px;text-align:right;color:#1e293b;">流入</th><th style="padding:8px 10px;text-align:right;color:#1e293b;">流出</th><th style="padding:8px 10px;text-align:right;color:#1e293b;">净变动</th></tr></thead><tbody>';
  forecast.forEach(function(f,i){
    var bg = i%2===0?'#ffffff':'rgba(248,250,252,0.5)';
    var balColor = f.projectedBalance >= 0 ? '#22c55e' : '#ef4444';
    var netColor = f.netChange >= 0 ? '#22c55e' : '#ef4444';
    var netPrefix = f.netChange >= 0 ? '+' : '';
    html += '<tr style="'+bg+';border-bottom:1px solid rgba(226,232,240,0.4);">';
    html += '<td style="padding:7px 10px;color:#1e293b;font-weight:500;">D'+f.day+'</td>';
    html += '<td style="padding:7px 10px;text-align:right;font-weight:600;color:'+balColor+';">'+_fmt(f.projectedBalance)+'</td>';
    html += '<td style="padding:7px 10px;text-align:right;color:#22c55e;">'+_fmt(f.opInflow)+'</td>';
    html += '<td style="padding:7px 10px;text-align:right;color:#ef4444;">'+_fmt(f.opOutflow)+'</td>';
    html += '<td style="padding:7px 10px;text-align:right;font-weight:600;color:'+netColor+';">'+netPrefix+_fmt(f.netChange)+'</td></tr>';
  });
  html += '</tbody></table></div>';
  var minBalance = Math.min.apply(null, forecast.map(function(f){return f.projectedBalance;}));
  var maxBalance = Math.max.apply(null, forecast.map(function(f){return f.projectedBalance;}));
  var trendDirection = forecast.length >= 2 ? (forecast[forecast.length-1].projectedBalance >= forecast[0].projectedBalance ? '上升 ↗️' : '下降 ↘️') : '—';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">';
  html += '<div style="background:rgba(248,250,252,1);border-radius:8px;padding:10px;text-align:center;"><div style="font-size:9px;color:#94a3b8;">预测最低点</div><div style="font-size:14px;font-weight:700;color:'+(minBalance>=0?'#22c55e':'#ef4444')+';">'+_fmt(minBalance)+'</div></div>';
  html += '<div style="background:rgba(248,250,252,1);border-radius:8px;padding:10px;text-align:center;"><div style="font-size:9px;color:#94a3b8;">预测最高点</div><div style="font-size:14px;font-weight:700;color:#22c55e;">'+_fmt(maxBalance)+'</div></div>';
  html += '<div style="background:rgba(248,250,252,1);border-radius:8px;padding:10px;text-align:center;"><div style="font-size:9px;color:#94a3b8;">趋势方向</div><div style="font-size:14px;font-weight:700;color:#3b82f6;">'+trendDirection+'</div></div>';
  html += '</div>';
  if (minBalance < 0) {
    html += '<div style="margin-top:10px;padding:10px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.3);border-radius:8px;text-align:center;"><span style="color:#ef4444;font-weight:700;">⚠️ 预测未来可能出现现金赤字！建议及时融资或削减开支。</span></div>';
  } else if (minBalance < gameState.cash * 0.3) {
    html += '<div style="margin-top:10px;padding:10px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.3);border-radius:8px;text-align:center;"><span style="color:#f59e0b;font-weight:700;">⚡ 现金储备将大幅下降，请注意监控。</span></div>';
  }
  return html;
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
    var opts = ownedOutlets.map(function(o){ var oc = OUTLET_CONFIGS.find(function(c){return c.id===o.id;}); return '<option value="'+o.id+'">'+(oc?oc.name:'网点')+'</option>'; }).join('');
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
  var tabDefs = [{key:'overview',label:'📑 概览'},{key:'pnl',label:'📊 损益表'},{key:'balance',label:'📋 资产负债'},{key:'cashflow',label:'💸 现金流'},{key:'kpi',label:'📈 KPI仪表盘'},{key:'tax',label:'🧾 税务中心'},{key:'depreciation',label:'📉 折旧表'},{key:'budget',label:'🎯 预算管理'},{key:'cashforecast',label:'🔮 现金预测'},{key:'loans',label:'🏦 贷款'},{key:'stocks',label:'📈 股票'}];
  tabDefs.forEach(function(t){
    tabs += '<button style="padding:8px 14px;border:none;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;min-height:36px;'+(financeTab===t.key?'background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;':'background:rgba(241,245,249,1);color:#475569;border:1px solid rgba(203,213,225,1);')+'" onclick="switchFinanceTab(\''+t.key+'\')">'+t.label+'</button>';
  });
  tabs += '</div>';
  var body = '';
  if (financeTab === 'overview') body = renderOverview();
  else if (financeTab === 'pnl') body = renderPnL();
  else if (financeTab === 'balance') body = renderBalanceSheet();
  else if (financeTab === 'cashflow') body = renderCashFlow();
  else if (financeTab === 'kpi') body = renderKPIDashboard();
  else if (financeTab === 'tax') body = renderTaxCenter();
  else if (financeTab === 'depreciation') body = renderDepreciationSchedule();
  else if (financeTab === 'budget') body = renderBudgetManagement();
  else if (financeTab === 'cashforecast') body = renderCashForecastUI();
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
    html += '<div style="margin-top:14px;"><div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:8px;">利润走势(近30天)</div>';
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
    { id:'prestige', name:'✨ 重生', color:'#a855f7' },
    { id:'market', name:'📊 市场', color:'#06b6d4' },
    { id:'kpi', name:'📈 KPI', color:'#f97316' },
    { id:'strategy', name:'🎯 战略', color:'#ec4899' }
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
  else if (progressionTab === 'market') html += renderMarketAnalysisTab();
  else if (progressionTab === 'kpi') html += renderStrategicKPITab();
  else if (progressionTab === 'strategy') html += renderStrategyToolsTab();
  content.innerHTML = html;
}

function renderAchievementsTab() {
  var prog = typeof getAchievementProgress === 'function' ? getAchievementProgress() : {total:0,unlocked:0,claimed:0};
  var html = '<div style="display:flex;gap:12px;margin-bottom:14px;align-items:center;">';
  html += '<div style="font-size:24px;font-weight:700;color:#fbbf24;">' + prog.unlocked + '/' + prog.total + '</div>';
  html += '<div><div style="font-size:11px;color:#1e293b;">成就解锁</div><div style="font-size:9px;color:#94a3b8;">已领取 ' + prog.claimed + ' 个奖励</div></div>';
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
      html += '<div style="font-size:11px;font-weight:600;color:#1e293b;">' + a.name + '</div>';
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
      html += '<div style="font-size:11px;font-weight:700;color:#1e293b;">' + tech.name + '</div>';
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
  var html = '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:10px;">⚔️ 竞争对手</div>';
  html += '<div style="font-size:10px;color:#64748b;margin-bottom:14px;">竞争对手每周成长，抢夺市场份额。保持优势！</div>';
  rivals.forEach(function(r) {
    var info = typeof getRivalInfo === 'function' ? getRivalInfo(r.id) : null;
    if (!info) return;
    var strengthPct = Math.round(r.strength * 100);
    html += '<div style="background:rgba(248,250,252,1);border:1px solid ' + info.color + '30;border-radius:10px;padding:14px;margin-bottom:8px;">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">';
    html += '<div><span style="font-size:16px;">' + info.icon + '</span> <span style="font-size:13px;font-weight:700;color:#1e293b;">' + info.name + '</span> <span style="font-size:9px;color:#94a3b8;">(' + info.style + ')</span></div>';
    html += '<span style="font-size:10px;color:' + info.color + ';font-weight:700;">实力 ' + strengthPct + '%</span>';
    html += '</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">';
    html += '<div style="text-align:center;"><div style="font-size:14px;font-weight:700;color:#1e293b;">' + r.vehicles + '</div><div style="font-size:9px;color:#94a3b8;">车辆</div></div>';
    html += '<div style="text-align:center;"><div style="font-size:14px;font-weight:700;color:#1e293b;">' + Math.round(r.marketShare * 100) + '%</div><div style="font-size:9px;color:#94a3b8;">市场份额</div></div>';
    html += '<div style="text-align:center;"><div style="font-size:14px;font-weight:700;color:#1e293b;">' + r.reputation + '</div><div style="font-size:9px;color:#94a3b8;">声誉</div></div>';
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
  var html = '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:10px;">📋 每日挑战</div>';
  var ch = gameState.dailyChallenge;
  if (!ch) {
    html += '<div style="text-align:center;padding:20px;color:#94a3b8;font-size:12px;">今日暂无挑战</div>';
  } else {
    var pct = ch.target > 0 ? Math.min(100, Math.round(ch.progress / ch.target * 100)) : 0;
    html += '<div style="background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.2);border-radius:10px;padding:14px;">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">';
    html += '<div style="font-size:12px;font-weight:700;color:#1e293b;">' + ch.desc + '</div>';
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
      html += '<button style="display:block;width:100%;text-align:left;padding:8px 12px;margin-bottom:4px;border:1px solid rgba(203,213,225,1);border-radius:6px;background:rgba(248,250,252,1);color:#1e293b;font-size:10px;cursor:pointer;" onclick="resolveStoryEvent(' + i + ');renderProgressionModal();">' + c.text + (c.cost > 0 ? ' <span style="color:#f87171;">(-' + formatCurrency(c.cost) + ')</span>' : '') + '</button>';
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
  html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:8px;">✨ 声望天赋</div>';
  var perks = typeof PRESTIGE_PERKS !== 'undefined' ? PRESTIGE_PERKS : [];
  html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;">';
  perks.forEach(function(perk) {
    var owned = (gameState.prestigePerks || []).indexOf(perk.id) !== -1;
    var canBuy = !owned && gameState.prestigePoints >= perk.cost;
    var requiresMet = !perk.requires || perk.requires.every(function(r){ return (gameState.prestigePerks||[]).indexOf(r)!==-1; });
    var locked = !owned && !requiresMet;
    html += '<div style="background:' + (owned ? 'rgba(168,85,247,0.15)' : 'rgba(241,245,249,0.8)') + ';border:1px solid ' + (owned ? 'rgba(168,85,247,0.4)' : 'rgba(203,213,225,0.8)') + ';border-radius:8px;padding:10px;' + (locked ? 'opacity:0.4;' : '') + '">';
    html += '<div style="font-size:11px;font-weight:700;color:#1e293b;">' + perk.name + '</div>';
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
  var totalAssets = typeof bs.assets === 'number' ? bs.assets : (bs.assets && bs.assets.total) || 0;
  var maxLoan = Math.round(totalAssets * 0.5);
  var existingDebt = loans.reduce(function(s,l){ return s + l.remainingAmount; }, 0);
  var available = Math.max(0, maxLoan - existingDebt);
  var html = '<div style="background:rgba(248,250,252,1);border-radius:10px;padding:14px;margin-bottom:14px;">';
  html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:8px;">🏦 申请贷款</div>';
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
    html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:8px;">🏢 IPO上市</div>';
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
    html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:8px;">📈 RENT 股票</div>';
    html += '<div style="font-size:11px;color:#475569;">当前股价: <span style="color:#4ade80;font-weight:700;">$'+(st.sharePrice||0).toFixed(2)+'</span> · 持有: '+st.playerShares+'股(锁定) · 流通: '+st.publicShares+'股</div>';
    html += '</div>';
  }
  html += '<div style="background:rgba(248,250,252,1);border-radius:10px;padding:14px;">';
  html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:8px;">📊 虚拟股票市场</div>';
  var vStocks = typeof VIRTUAL_STOCKS !== 'undefined' ? VIRTUAL_STOCKS : [];
  var lastPrices = {};
  if (st.stockHistory && st.stockHistory.length > 0) {
    var lastSnapshot = st.stockHistory[st.stockHistory.length - 1];
    vStocks.forEach(function(vs) { lastPrices[vs.ticker] = lastSnapshot[vs.ticker] || vs.basePrice; });
  }
  vStocks.forEach(function(vs){
    var price = lastPrices[vs.ticker] || vs.basePrice;
    html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(226,232,240,0.6);">';
    html += '<div><span style="color:#1e293b;font-weight:600;">'+vs.ticker+'</span> <span style="color:#64748b;font-size:10px;">'+vs.name+'</span></div>';
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
    html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:8px;">💼 我的持仓</div>';
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
  if(typeof applyLoan==='function'){
    var result = applyLoan(amount,term);
    if(!result || !result.success){
      showToast(result && result.message ? result.message : '贷款申请失败','error');
      return;
    }
    showToast('贷款申请成功：'+formatCurrency(amount)+'，期限'+term+'天','success');
    updateUI();saveGame();renderFinanceModal();
  }
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
  html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:10px;">已安装设施</div>';
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
      html += '<div style="font-size:12px;font-weight:600;color:#1e293b;">'+f.config.name+'</div>';
      html += '<div style="font-size:9px;color:#94a3b8;margin-top:2px;">满意度+'+f.config.satisfactionBonus+' · 收入+'+f.config.incomeBonusPercent+'% · 维护$'+f.config.dailyMaintenance+'/天</div>';
      html += '<button style="margin-top:6px;padding:4px 10px;border:none;border-radius:4px;font-size:9px;cursor:pointer;'+toggleColor+'" onclick="toggleFacility('+outletId+',\''+f.id+'\');renderFacilityModal();">'+toggleLabel+'</button>';
      html += '</div>';
    });
    html += '</div>';
  }
  html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:10px;">可购买设施</div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">';
  facilitiesConfig.forEach(function(fc){
    var owned = os.facilities && os.facilities.indexOf(fc.id) !== -1;
    if (owned) return;
    var canBuy = typeof canPurchaseFacility === 'function' ? canPurchaseFacility(outletId, fc.id) : {ok:false};
    var levelOk = os.level >= fc.baseLevel;
    html += '<div style="background:rgba(241,245,249,0.8);border:1px solid '+(levelOk?'rgba(203,213,225,0.8)':'rgba(226,232,240,0.6)')+';border-radius:10px;padding:12px;'+(levelOk?'':'opacity:0.5;')+'">';
    html += '<div style="font-size:14px;margin-bottom:2px;">'+fc.icon+'</div>';
    html += '<div style="font-size:12px;font-weight:600;color:#1e293b;">'+fc.name+'</div>';
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
    html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:10px;margin-top:16px;">📊 设施收入报告</div>';
    html += '<div style="background:rgba(241,245,249,0.8);border-radius:10px;padding:12px;">';
    html += '<table style="width:100%;border-collapse:collapse;">';
    html += '<tr style="border-bottom:1px solid rgba(203,213,225,0.8);"><th style="text-align:left;padding:6px 8px;font-size:9px;color:#94a3b8;">设施</th><th style="text-align:left;padding:6px 8px;font-size:9px;color:#94a3b8;">服务费</th><th style="text-align:left;padding:6px 8px;font-size:9px;color:#94a3b8;">覆盖网点</th></tr>';
    reportKeys.forEach(function(fid){
      var r = incomeReport[fid];
      var fee = FACILITY_SERVICE_FEES[fid] || 0;
      html += '<tr style="border-bottom:1px solid rgba(226,232,240,0.6);"><td style="padding:6px 8px;font-size:11px;color:#1e293b;">'+r.icon+' '+r.name+'</td><td style="padding:6px 8px;font-size:11px;color:#4ade80;">+$'+fee+'/次</td><td style="padding:6px 8px;font-size:11px;color:#64748b;">'+r.outlets.length+'个网点</td></tr>';
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
  
  var html = '<div style="margin-bottom:14px;"><div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:12px;">📐 店铺平面图</div>';
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
  html += '<div style="background:rgba(96,165,250,0.1);border:1px solid rgba(96,165,250,0.2);border-radius:8px;padding:10px;text-align:center;"><div style="font-size:16px;font-weight:700;color:#60a5fa;">🛎️</div><div style="font-size:10px;color:#64748b;margin-top:2px;">接待大厅</div></div>';
  html += '<div style="background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.2);border-radius:8px;padding:10px;text-align:center;"><div style="font-size:16px;font-weight:700;color:#fbbf24;">' + occ.customer.used + '/' + occ.customer.total + '</div><div style="font-size:10px;color:#64748b;margin-top:2px;">顾客车位</div></div>';
  html += '<div style="background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.2);border-radius:8px;padding:10px;text-align:center;"><div style="font-size:16px;font-weight:700;color:#4ade80;">' + occ.internal.used + '/' + occ.internal.total + '</div><div style="font-size:10px;color:#64748b;margin-top:2px;">内部车库</div></div>';
  html += '<div style="background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.2);border-radius:8px;padding:10px;text-align:center;"><div style="font-size:16px;font-weight:700;color:#a855f7;">' + facilities.length + '</div><div style="font-size:10px;color:#64748b;margin-top:2px;">已装设施</div></div>';
  html += '</div>';
  
  if (gameState.interiorDecorUnlocked && typeof renderDecorations === 'function') {
    html += renderDecorations(outletId);
  }
  return html;
}
function renderLayoutParking(outletId, os) {
  var html = '<div style="margin-bottom:14px;"><div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:10px;">🅿️ 停车位管理</div>';
  var occ = getParkingOccupancy(outletId);
  var dailyRent = getDailyParkingRent(outletId);
  var pressure = getParkingPressureLevel(outletId);
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;">';
  html += '<div style="background:rgba(248,250,252,1);border-radius:10px;padding:14px;"><div style="font-size:11px;color:#64748b;margin-bottom:6px;">顾客停车位</div><div style="font-size:24px;font-weight:700;color:#fbbf24;">' + os.parkingSpots.customer + '</div><div style="font-size:9px;color:#94a3b8;">当前 / 最大 ' + PARKING_CONFIG.customer.max + '</div><div style="margin-top:8px;"><div style="width:100%;height:6px;background:rgba(226,232,240,1);border-radius:3px;overflow:hidden;"><div style="width:' + (pressure * 100) + '%;height:100%;background:' + (pressure >= 0.9 ? '#f87171' : pressure >= 0.7 ? '#fbbf24' : '#4ade80') + ';border-radius:3px;"></div></div></div><div style="font-size:9px;color:#94a3b8;margin-top:4px;">占用率 ' + Math.round(pressure * 100) + '%</div></div>';
  html += '<div style="background:rgba(248,250,252,1);border-radius:10px;padding:14px;"><div style="font-size:11px;color:#64748b;margin-bottom:6px;">内部车库</div><div style="font-size:24px;font-weight:700;color:#4ade80;">' + os.parkingSpots.internal + '</div><div style="font-size:9px;color:#94a3b8;">当前 / 最大 ' + PARKING_CONFIG.internal.max + '</div><div style="font-size:10px;color:#64748b;margin-top:8px;">已用 ' + occ.internal.used + ' / 可用 ' + occ.internal.available + '</div></div>';
  html += '<div style="background:rgba(248,250,252,1);border-radius:10px;padding:14px;"><div style="font-size:11px;color:#64748b;margin-bottom:6px;">日租金</div><div style="font-size:24px;font-weight:700;color:#f87171;">' + formatCurrency(dailyRent) + '</div><div style="font-size:9px;color:#94a3b8;">每车位 +' + PARKING_CONFIG.customer.dailyRent + '元/天</div></div>';
  html += '</div>';
  html += '<div style="font-size:12px;font-weight:600;color:#1e293b;margin-bottom:8px;">扩建停车场</div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">';
  var canUpgradeCustomer = os.parkingSpots.customer < PARKING_CONFIG.customer.max && gameState.cash >= PARKING_CONFIG.customer.upgradeCost;
  var canUpgradeInternal = os.parkingSpots.internal < PARKING_CONFIG.internal.max && gameState.cash >= PARKING_CONFIG.internal.upgradeCost;
  html += '<div style="background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.2);border-radius:10px;padding:14px;"><div style="font-size:12px;font-weight:600;color:#fbbf24;margin-bottom:4px;">🚗 顾客停车区</div><div style="font-size:10px;color:#64748b;margin-bottom:8px;">扩建 +' + PARKING_CONFIG.customer.perUpgrade + '个车位 (当前' + os.parkingSpots.customer + '/' + PARKING_CONFIG.customer.max + ')</div><button style="width:100%;padding:8px;border:none;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;" onclick="upgradeParkingSpot(' + outletId + ',\'customer\');renderInternalLayoutModal();" ' + (!canUpgradeCustomer ? 'disabled' : '') + '>' + formatCurrency(PARKING_CONFIG.customer.upgradeCost) + ' 元</button></div>';
  html += '<div style="background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.2);border-radius:10px;padding:14px;"><div style="font-size:12px;font-weight:600;color:#4ade80;margin-bottom:4px;">🏠 内部车库</div><div style="font-size:10px;color:#64748b;margin-bottom:8px;">扩建 +' + PARKING_CONFIG.internal.perUpgrade + '个车位 (当前' + os.parkingSpots.internal + '/' + PARKING_CONFIG.internal.max + ')</div><button style="width:100%;padding:8px;border:none;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;background:linear-gradient(135deg,#27ae60,#2ecc71);color:#fff;" onclick="upgradeParkingSpot(' + outletId + ',\'internal\');renderInternalLayoutModal();" ' + (!canUpgradeInternal ? 'disabled' : '') + '>' + formatCurrency(PARKING_CONFIG.internal.upgradeCost) + ' 元</button></div>';
  html += '</div>';
  html += '<div style="background:rgba(248,250,252,1);border-radius:10px;padding:14px;margin-bottom:14px;"><div style="font-size:12px;font-weight:600;color:#1e293b;margin-bottom:8px;">📝 车位预约设置</div>';
  html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(226,232,240,0.8);"><div><div style="font-size:11px;color:#1e293b;">自动推荐预约停车</div><div style="font-size:9px;color:#94a3b8;">额外+50元/单，优先预留车位</div></div><label style="position:relative;display:inline-block;width:44px;height:24px;"><input type="checkbox" id="autoReservationToggle" style="opacity:0;width:0;height:0;" ' + (gameState.autoRecommendReservation ? 'checked' : '') + ' onchange="setAutoRecommendReservation(this.checked);"><span style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:' + (gameState.autoRecommendReservation ? '#3b82f6' : '#ccc') + ';transition:.3s;border-radius:24px;"></span><span style="position:absolute;content:"";height:18px;width:18px;left:' + (gameState.autoRecommendReservation ? '22px' : '3px') + ';bottom:3px;background-color:white;transition:.3s;border-radius:50%;"></span></label></div>';
  html += '</div>';
  html += '<div style="background:rgba(248,250,252,1);border-radius:10px;padding:14px;"><div style="font-size:12px;font-weight:600;color:#1e293b;margin-bottom:8px;">📊 车位压力</div>';
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
  var html = '<div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:10px;">' + (category === 'amenity' ? '🛋️ 客户舒适设施' : '⚙️ 运营设施') + '</div>';
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
      html += '<div style="background:rgba(248,250,252,1);border:1px solid rgba(203,213,225,0.8);border-radius:10px;padding:12px;"><div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="font-size:20px;">' + f.config.icon + '</span><span style="font-size:9px;padding:2px 6px;border-radius:4px;background:' + (f.disabled ? 'rgba(226,232,240,1)' : f.broken ? 'rgba(248,113,113,0.2)' : 'rgba(74,222,128,0.2)') + ';color:' + (f.disabled ? '#64748b' : f.broken ? '#f87171' : '#4ade80') + ';">' + (f.disabled ? '已停用' : f.broken ? '故障中' : '运行中') + '</span></div><div style="font-size:12px;font-weight:600;color:#1e293b;margin-bottom:4px;">' + f.config.name + '</div><div style="font-size:9px;color:#94a3b8;">所在区域: ' + getZoneName(zone) + '</div>' + staffReq + '<div style="font-size:9px;color:#94a3b8;">满意度+' + f.config.satisfactionBonus + ' · 收入+' + f.config.incomeBonusPercent + '%</div><button style="margin-top:6px;padding:4px 8px;border:none;border-radius:4px;font-size:9px;cursor:pointer;background:' + (f.disabled ? 'linear-gradient(135deg,#27ae60,#2ecc71)' : 'rgba(231,76,60,0.2)') + ';color:' + (f.disabled ? '#fff' : '#e74c3c') + ';" onclick="toggleFacility(' + outletId + ',\'' + f.id + '\');renderInternalLayoutModal();">' + (f.disabled ? '启用' : '停用') + '</button></div>';
    });
    html += '</div></div>';
  }
  html += '<div style="font-size:11px;font-weight:600;color:#64748b;margin-bottom:8px;">可购买</div>';
  html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">';
  facilitiesConfig.filter(function(fc) { return fc.category === category; }).forEach(function(fc) {
    if (owned.indexOf(fc.id) !== -1) return;
    var canBuy = typeof canPurchaseFacility === 'function' ? canPurchaseFacility(outletId, fc.id) : {ok: false};
    var levelOk = os.level >= fc.baseLevel;
    html += '<div style="background:rgba(241,245,249,0.8);border:1px solid ' + (levelOk ? 'rgba(203,213,225,0.8)' : 'rgba(226,232,240,0.6)') + ';border-radius:10px;padding:12px;' + (levelOk ? '' : 'opacity:0.5;') + '><div style="font-size:20px;margin-bottom:4px;">' + fc.icon + '</div><div style="font-size:12px;font-weight:600;color:#1e293b;margin-bottom:4px;">' + fc.name + '</div>';
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
  
  var html = '<div style="margin-bottom:14px;"><div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:8px;">📐 设施布局编辑</div>';
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
  
  html += '<div style="font-size:11px;font-weight:600;color:#1e293b;margin-bottom:8px;">⚙️ 拖动设施到区域</div>';
  html += '<div style="display:flex;flex-wrap:wrap;gap:8px;">';
  facilities.forEach(function(f) {
    var currentZone = getFacilityZone(outletId, f.id);
    html += '<div style="background:rgba(248,250,252,1);border:1px solid rgba(203,213,225,1);border-radius:8px;padding:10px;min-width:140px;">';
    html += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;"><span style="font-size:18px;">' + f.config.icon + '</span><span style="font-size:11px;color:#1e293b;">' + f.config.name + '</span></div>';
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
  var html = '<div style="margin-top:14px;"><div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:10px;">🌿 室内装饰 <span style="font-size:10px;color:#f1c40f;">(旗舰店铺解锁)</span></div>';
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
    html += '<div style="background:rgba(241,245,249,0.8);border:1px solid rgba(203,213,225,0.8);border-radius:8px;padding:12px;text-align:center;' + (owned ? 'opacity:0.5;' : '') + '"><div style="font-size:24px;margin-bottom:4px;">' + d.icon + '</div><div style="font-size:11px;font-weight:600;color:#1e293b;">' + d.name + '</div><div style="font-size:9px;color:#94a3b8;">满意度+' + d.satisfactionBonus + '</div>';
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
  html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:10px;">📈 近7天评分趋势</div>';
  html += '<canvas id="ratingTrendCanvas" width="600" height="180" style="width:100%;max-width:600px;height:180px;"></canvas>';
  html += '</div>';
  html += '<div style="background:rgba(248,250,252,1);border:1px solid rgba(226,232,240,0.8);border-radius:10px;padding:14px;margin-bottom:14px;">';
  html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:10px;">💬 最近评价</div>';
  if (recent.length === 0) {
    html += '<div style="text-align:center;padding:20px;color:#94a3b8;font-size:12px;">暂无评价，完成订单后将自动生成</div>';
  } else {
    recent.forEach(function(r) {
      var stars = '';
      for (var i = 1; i <= 5; i++) stars += i <= r.score ? '⭐' : '☆';
      var scoreColor = r.score >= 4 ? '#4ade80' : r.score >= 3 ? '#fbbf24' : '#f87171';
      html += '<div style="background:rgba(241,245,249,0.8);border-radius:8px;padding:10px 12px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">';
      html += '<div style="flex:1;"><div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;"><span style="font-size:11px;font-weight:600;color:#1e293b;">' + (r.customerName || '匿名') + '</span><span style="font-size:9px;color:#94a3b8;">D' + r.day + '</span>' + (r.isReturnCustomer ? '<span style="font-size:8px;padding:1px 4px;background:rgba(74,222,128,0.15);color:#4ade80;border-radius:3px;">回头客</span>' : '') + '</div>';
      html += '<div style="font-size:11px;color:#475569;">' + r.text + '</div></div>';
      html += '<div style="text-align:right;min-width:80px;"><div style="font-size:12px;font-weight:700;color:' + scoreColor + ';">' + stars + '</div><div style="font-size:9px;color:#94a3b8;">' + (r.vehicleName || '') + '</div></div>';
      html += '</div>';
    });
  }
  html += '</div>';
  html += '<div style="background:rgba(248,250,252,1);border:1px solid rgba(226,232,240,0.8);border-radius:10px;padding:14px;">';
  html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:8px;">📊 口碑影响</div>';
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
      html += '<div><span style="font-size:14px;">' + c.icon + '</span> <span style="font-size:11px;color:#1e293b;font-weight:600;">' + c.name + '</span> <span style="font-size:9px;color:#94a3b8;">D' + c.startDay + '开始</span></div>';
      html += '<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:10px;color:#fbbf24;">' + formatCurrency(c.costPerDay) + '/天</span><span style="font-size:10px;color:#4ade80;">需求×' + c.effectMult.toFixed(2) + '</span>';
      html += '<button style="padding:4px 10px;border:none;border-radius:4px;font-size:9px;font-weight:600;cursor:pointer;background:rgba(231,76,60,0.2);color:#f87171;" onclick="stopAdCampaign(\'' + c.type + '\',\'' + c.cityId + '\');renderAdModal();">停止</button></div>';
      html += '</div>';
    });
    html += '</div>';
  }
  html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:10px;">📢 选择广告投放</div>';
  html += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:14px;">';
  AD_TYPES.forEach(function(ad) {
    var isActive = activeCampaigns.some(function(c){ return c.type === ad.id; });
    var canAfford = gameState.cash >= ad.costPerDay;
    html += '<div style="background:rgba(248,250,252,1);border:1px solid ' + (isActive ? 'rgba(74,222,128,0.3)' : 'rgba(203,213,225,0.8)') + ';border-radius:12px;padding:14px;' + (isActive ? 'box-shadow:0 0 12px rgba(74,222,128,0.1);' : '') + '">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">';
    html += '<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:24px;">' + ad.icon + '</span><div><div style="font-size:13px;font-weight:700;color:#1e293b;">' + ad.name + '</div><div style="font-size:10px;color:#94a3b8;">' + ad.desc + '</div></div></div>';
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
  html += '<div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:8px;">💡 广告效果预估</div>';
  html += '<div style="font-size:11px;color:#64748b;line-height:1.6;">';
  html += '• 当前广告带来约 <span style="color:#4ade80;font-weight:700;">+' + estimatedExtra + '</span> 个额外客户/天<br>';
  html += '• 多个广告效果叠加计算（乘法）<br>';
  html += '• 对手监测到你的广告后可能采取反制措施<br>';
  html += '• 明星代言覆盖所有城市，其余仅限本地</div>';
  html += '</div>';
  content.innerHTML = html;
}