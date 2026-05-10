function generateCustomers() {
  var customers = [];
  var eventEffects = getEventEffects();
  gameState.outlets.filter(function(o){ return o.owned; }).forEach(function(outlet){
    var cfg = OUTLET_CONFIGS[outlet.id];
    var mult = CITY_SIZE_MULTIPLIERS[cfg.citySize] || 1;
    var demandMult = eventEffects.demandMultiplier || 1;
    var base = Math.floor(Math.random() * 10 * mult * demandMult) + 1;
    var count = Math.min(base, 12);
    for (var i = 0; i < count; i++) {
      var isBusiness = Math.random() < 0.45;
      var type = isBusiness ? 'business' : 'tourist';
      var names = isBusiness ? CUSTOMER_NAMES_BUSINESS : CUSTOMER_NAMES_TOURIST;
      var prefs = JSON.parse(JSON.stringify(CUSTOMER_TYPE_PREFS[type]));
      Object.keys(eventEffects.typeDemandMultiplier || {}).forEach(function(k){
        if (prefs[k] !== undefined) prefs[k] *= eventEffects.typeDemandMultiplier[k];
      });
      var rentalDays = isBusiness ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 5) + 3;
      customers.push({
        id: 'C' + Date.now() + '_' + Math.random().toString(36).substr(2,5),
        name: names[Math.floor(Math.random() * names.length)],
        type: type, outletId: outlet.id, outletName: cfg.name,
        preferences: prefs, rentalDays: rentalDays
      });
    }
  });
  return customers;
}

function matchVehicleForCustomer(customer) {
  var available = getAvailableVehiclesAtOutlet(customer.outletId);
  if (available.length === 0) return null;
  var eventEffects = getEventEffects();
  var scored = available.map(function(v){
    var pref = customer.preferences[v.type] || 1;
    if (eventEffects.fuelDemandMultiplier && eventEffects.fuelDemandMultiplier[v.fuelType]) {
      pref *= eventEffects.fuelDemandMultiplier[v.fuelType];
    }
    var effectiveRate = getEffectiveDailyRate(v);
    return { vehicle: v, score: pref * (1000 / Math.max(effectiveRate, 1)), effectiveRate: effectiveRate };
  });
  scored.sort(function(a,b){ return b.score - a.score; });
  return scored[0];
}

function nextDay() {
  gameState.todayIncome = 0;
  gameState.todayExpense = 0;
  gameState.outletOrderCounts = {};

  processRentalCosts();
  processTransfers();
  processEventExpiry();

  var eventResult = checkRandomEvent();
  if (eventResult) {
    addMessage(eventResult.icon + ' 随机事件：' + eventResult.name + ' — ' + eventResult.desc, 'warn');
  }

  var compResult = updateCompetitorPricing();
  if (compResult) {
    var dir = compResult.newCoeff > compResult.oldCoeff ? '上涨' : '下降';
    addMessage('🏪 竞争对手调价：市场系数' + dir + '至 ' + compResult.newCoeff.toFixed(2) + '，请注意调整租金！', 'warn');
  }

  var customers = generateCustomers();
  var date = getGameDate();
  addMessage('📅 ' + formatDate(date) + ' ' + getWeekDay(date) + ' — 到店客户 <span class="msg-highlight">' + customers.length + '</span> 人', 'good');

  var newOrders = [];
  customers.forEach(function(customer){
    var match = matchVehicleForCustomer(customer);
    if (match) {
      var rentalDays = customer.rentalDays;
      var totalIncome = match.effectiveRate * rentalDays;
      var eventEffects = getEventEffects();
      var fuelCost = match.vehicle.fuelCostPerDay * (eventEffects.fuelMultiplier || 1);
      var maintCost = match.vehicle.maintenanceCostPerDay * (eventEffects.maintenanceMultiplier || 1);
      var totalCost = (fuelCost + maintCost) * rentalDays;
      newOrders.push({
        id: 'O' + Date.now() + '_' + Math.random().toString(36).substr(2,6),
        customerId: customer.id, customerName: customer.name, customerType: customer.type,
        outletId: customer.outletId, outletName: customer.outletName,
        vehicleId: match.vehicle.id, vehicleName: match.vehicle.brand + ' ' + match.vehicle.model,
        vehicleType: match.vehicle.type, dailyRate: match.effectiveRate,
        rentalDays: rentalDays, totalIncome: totalIncome,
        fuelCostPerDay: Math.round(fuelCost), maintenanceCostPerDay: Math.round(maintCost),
        totalCost: Math.round(totalCost), netIncome: Math.round(totalIncome - totalCost),
        createdDay: gameState.currentDay
      });
    }
  });

  if (newOrders.length > 0) {
    gameState.pendingOrders = gameState.pendingOrders.concat(newOrders);
    addMessage('收到 <span class="msg-highlight">' + newOrders.length + '</span> 个新订单，请及时处理！', 'warn');
  } else {
    addMessage('今日无客户下单', 'bad');
  }

  var idleVehicles = gameState.ownedVehicles.filter(function(v){
    return (!v.rentedUntil || v.rentedUntil < gameState.currentDay) && !isInTransit(v.id);
  });
  var idleCost = idleVehicles.reduce(function(s,v){
    return s + v.fuelCostPerDay * 0.3 + v.maintenanceCostPerDay * 0.3;
  }, 0);
  if (idleCost > 0) {
    gameState.todayExpense += Math.round(idleCost);
    gameState.cash -= Math.round(idleCost);
  }

  gameState.currentDay++;
  updateUI(); saveGame();
}

function processRentalCosts() {
  gameState.ownedVehicles.forEach(function(v){
    if (v.rentedUntil && v.rentedUntil >= gameState.currentDay) {
      var eventEffects = getEventEffects();
      var fuelCost = Math.round(v.fuelCostPerDay * (eventEffects.fuelMultiplier || 1));
      var maintCost = Math.round(v.maintenanceCostPerDay * (eventEffects.maintenanceMultiplier || 1));
      gameState.cash -= (fuelCost + maintCost);
      gameState.todayExpense += (fuelCost + maintCost);
    }
  });
}

function processTransfers() {
  gameState.transfers.forEach(function(t){ t.daysRemaining--; });
  var arrived = gameState.transfers.filter(function(t){ return t.daysRemaining <= 0; });
  arrived.forEach(function(t){
    var v = gameState.ownedVehicles.find(function(ov){ return ov.id === t.vehicleId; });
    if (v) {
      v.outletId = t.toOutletId;
      addMessage('🚚 ' + v.brand + ' ' + v.model + ' 已到达 ' + OUTLET_CONFIGS.find(function(c){ return c.id === t.toOutletId; }).name, 'good');
    }
  });
  gameState.transfers = gameState.transfers.filter(function(t){ return t.daysRemaining > 0; });
}

function acceptOrder(orderId) {
  var idx = gameState.pendingOrders.findIndex(function(o){ return o.id === orderId; });
  if (idx === -1) return;
  var order = gameState.pendingOrders[idx];
  var vehicle = gameState.ownedVehicles.find(function(v){ return v.id === order.vehicleId; });

  if (!vehicle) { addMessage('订单取消：' + order.vehicleName + ' 已出售', 'bad'); gameState.pendingOrders.splice(idx,1); renderOrders(); updateUI(); saveGame(); return; }
  if (vehicle.rentedUntil && vehicle.rentedUntil >= gameState.currentDay) { addMessage('订单取消：' + order.vehicleName + ' 已被租出', 'bad'); gameState.pendingOrders.splice(idx,1); renderOrders(); saveGame(); return; }
  if (isInTransit(vehicle.id)) { addMessage('订单取消：' + order.vehicleName + ' 正在调度中', 'bad'); gameState.pendingOrders.splice(idx,1); renderOrders(); saveGame(); return; }

  gameState.cash += order.totalIncome;
  gameState.todayIncome += order.totalIncome;
  vehicle.rentedUntil = gameState.currentDay + order.rentalDays - 1;

  if (!gameState.outletOrderCounts[order.outletId]) gameState.outletOrderCounts[order.outletId] = 0;
  gameState.outletOrderCounts[order.outletId]++;

  gameState.totalDaysRented += order.rentalDays;
  gameState.totalRevenue += order.totalIncome;

  if (typeof showDollarSign === 'function') showDollarSign(order.outletId);

  gameState.pendingOrders.splice(idx, 1);
  var typeLabel = order.customerType === 'business' ? '商务' : '旅游';
  addMessage(typeLabel + '客户 <span class="msg-highlight">' + order.customerName + '</span> 租用 ' + order.vehicleName + ' ' + order.rentalDays + '天，收入 ' + formatCurrency(order.totalIncome), 'good');

  if (gameState.tutorialStep < 7) { gameState.tutorialStep = 7; saveGame(); }
  renderOrders(); updateUI(); saveGame();
}

function rejectOrder(orderId) {
  var idx = gameState.pendingOrders.findIndex(function(o){ return o.id === orderId; });
  if (idx === -1) return;
  var order = gameState.pendingOrders[idx];
  gameState.pendingOrders.splice(idx, 1);
  addMessage('已拒绝 ' + order.customerName + ' 的租车订单', 'bad');
  renderOrders(); updateUI(); saveGame();
}
