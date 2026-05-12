function generateCustomers() {
  var customers = [];
  var eventEffects = getEventEffects();
  gameState.outlets.filter(function(o){ return o.owned; }).forEach(function(outlet){
    var cfg = OUTLET_CONFIGS[outlet.id];
    var mult = CITY_SIZE_MULTIPLIERS[cfg.citySize] || 1;
    var demandMult = eventEffects.demandMultiplier || 1;
    var base = Math.floor(Math.random() * 10 * mult * demandMult) + 1;
    if (typeof hasPreferredFacility === 'function') {
      var hasBiz = hasPreferredFacility(outlet.id, 'business');
      var hasTour = hasPreferredFacility(outlet.id, 'tourist');
      if (hasBiz || hasTour) base = Math.ceil(base * 1.2);
    }
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
      var memberId = null;
      if (gameState.members.length > 0 && Math.random() < 0.4) {
        var activeMembers = gameState.members.filter(function(m){ return m.isActive; });
        if (activeMembers.length > 0) {
          var member = activeMembers[Math.floor(Math.random() * activeMembers.length)];
          memberId = member.id;
        }
      }
      customers.push({
        id: 'C' + Date.now() + '_' + Math.random().toString(36).substr(2,5),
        name: memberId ? gameState.members.find(function(m){ return m.id === memberId; }).name : names[Math.floor(Math.random() * names.length)],
        type: type, outletId: outlet.id, outletName: cfg.name,
        preferences: prefs, rentalDays: rentalDays, memberId: memberId
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
    if (customer.memberId) {
      var member = gameState.members.find(function(m){ return m.id === customer.memberId; });
      if (member) {
        var levelInfo = getMemberLevelInfo(member.level);
        effectiveRate = Math.round(effectiveRate * levelInfo.discount);
      }
    }
    return { vehicle: v, score: pref * (1000 / Math.max(effectiveRate, 1)), effectiveRate: effectiveRate };
  });
  scored.sort(function(a,b){ return b.score - a.score; });
  return scored[0];
}

function nextDay() {
  gameState.todayIncome = 0;
  gameState.todayExpense = 0;
  gameState.outletOrderCounts = {};
  gameState.serviceStats.today = { insurance:0, wifi:0, gps:0, delivery:0, refuel:0, recharge:0, totalIncome:0 };

  processRentalCosts();
  processTransfers();
  processEventExpiry();

  var totalWages = processDailyEmployeeEffects();
  if (totalWages > 0) {
    gameState.cash -= totalWages;
    gameState.todayExpense += totalWages;
    addMessage('💼 员工工资支出 ' + formatCurrency(totalWages), 'warn');
  }

  if (typeof processLoanInterest === 'function') processLoanInterest();
  if (typeof processDailyFinance === 'function') processDailyFinance();

  if (typeof processFacilityMaintenance === 'function') {
    var maintCost = processFacilityMaintenance();
    if (maintCost > 0) addMessage('🔧 设施维护支出 ' + formatCurrency(maintCost), 'warn');
  }
  if (typeof processFacilityEvents === 'function') processFacilityEvents();

  var energyMessages = updateEnergyPrices();
  energyMessages.forEach(function(msg){
    addMessage('⛽ ' + msg, 'warn');
  });

  checkEnergyLowStock();

  var eventResult = checkRandomEvent();
  if (eventResult) {
    addMessage(eventResult.icon + ' 随机事件：' + eventResult.name + ' — ' + eventResult.desc, 'warn');
  }

  var compResult = updateCompetitorPricing();
  if (compResult) {
    var dir = compResult.newCoeff > compResult.oldCoeff ? '上涨' : '下降';
    addMessage('🏪 竞争对手调价：市场系数' + dir + '至 ' + compResult.newCoeff.toFixed(2) + '，请注意调整租金！', 'warn');
  }

  if (gameState.currentDay % 5 === 0 && gameState.members.length < 200) {
    var newMember = addNewMember();
    addMessage('👤 新会员注册：' + newMember.name + '（' + getMemberLevelInfo(newMember.level).name + '）', 'good');
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
        memberId: customer.memberId,
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

  if (gameState.currentDay % 7 === 0 && typeof generateJobCandidates === 'function') {
    gameState.jobCandidates = generateJobCandidates(5);
    addMessage('👔 人才市场已刷新，5名候选人等待录用', 'good');
  }

  if (typeof recordDailyFinancials === 'function') recordDailyFinancials();

  if (gameState.financials && gameState.financials.dailyProfit.length > 0) {
    var lastProfit = gameState.financials.dailyProfit[gameState.financials.dailyProfit.length - 1];
    if (lastProfit > 0) gameState.consecutiveProfitDays++;
    else gameState.consecutiveProfitDays = 0;
  }

  if (typeof checkMilestones === 'function') {
    var newMilestones = checkMilestones();
    newMilestones.forEach(function(m){
      addMessage('🎉 里程碑达成：' + m.icon + ' ' + m.name + '！' + (m.rewards.message || ''), 'good');
      if (typeof showMilestoneCelebration === 'function') showMilestoneCelebration(m);
    });
  }

  if (typeof checkWinCondition === 'function' && checkWinCondition()) {
    addMessage('🏆 恭喜！你已成为传奇租车帝国！', 'good');
    if (typeof showWinScreen === 'function') showWinScreen();
  }

  updateUI(); saveGame();
}

function checkEnergyLowStock() {
  var en = gameState.energy;
  if (en.oilStorage < ENERGY_LOW_THRESHOLD) {
    addMessage('⚠️ 油罐储量过低（' + en.oilStorage + '升），请尽快购买燃油！', 'bad');
  }
  if (en.batteryStorage < ENERGY_LOW_THRESHOLD) {
    addMessage('⚠️ 电池储量过低（' + en.batteryStorage + '度），请尽快购买电力！', 'bad');
  }
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

  var serviceResult = applyValueAddedServices(vehicle, order.rentalDays);
  var facilityFee = 0;
  if (typeof getFacilityServiceFee === 'function') {
    facilityFee = getFacilityServiceFee(order.outletId, order.customerType);
  }
  var incomeBonusPct = 0;
  if (typeof getOutletIncomeBonusPercent === 'function') {
    incomeBonusPct = getOutletIncomeBonusPercent(order.outletId);
  }
  var baseIncome = order.totalIncome;
  var bonusIncome = Math.round(baseIncome * incomeBonusPct / 100);
  var totalIncome = baseIncome + serviceResult.serviceIncome + facilityFee + bonusIncome;

  gameState.cash += totalIncome;
  gameState.todayIncome += totalIncome;
  vehicle.rentedUntil = gameState.currentDay + order.rentalDays - 1;

  if (!gameState.outletOrderCounts[order.outletId]) gameState.outletOrderCounts[order.outletId] = 0;
  gameState.outletOrderCounts[order.outletId]++;

  gameState.totalDaysRented += order.rentalDays;
  gameState.totalRevenue += totalIncome;

  if (order.memberId) {
    updateMemberAfterRental(order.memberId, totalIncome);
  }

  if (typeof showDollarSign === 'function') showDollarSign(order.outletId);

  gameState.pendingOrders.splice(idx, 1);
  var typeLabel = order.customerType === 'business' ? '商务' : '旅游';
  var memberTag = order.memberId ? '👤' : '';
  var serviceMsg = serviceResult.serviceNames.length > 0 ? '，购买 ' + serviceResult.serviceNames.join(' + ') : '';
  var facilityMsg = facilityFee > 0 ? '，设施服务 +' + formatCurrency(facilityFee) : '';
  var bonusMsg = bonusIncome > 0 ? '，加成 +' + formatCurrency(bonusIncome) : '';
  addMessage(memberTag + typeLabel + '客户 <span class="msg-highlight">' + order.customerName + '</span> 租用 ' + order.vehicleName + ' ' + order.rentalDays + '天' + serviceMsg + facilityMsg + bonusMsg + '，共支付 ' + formatCurrency(totalIncome), 'good');

  order.acceptedDay = gameState.currentDay;
  order.actualIncome = totalIncome;
  order.serviceIncome = serviceResult.serviceIncome;
  order.services = serviceResult.serviceNames;
  gameState.orderHistory.push(order);
  if (gameState.orderHistory.length > 500) gameState.orderHistory.shift();

  if (gameState.tutorialStep < 7) { gameState.tutorialStep = 7; saveGame(); }
  renderOrders(); updateUI(); saveGame();
}

function applyValueAddedServices(vehicle, rentalDays) {
  var result = { serviceIncome: 0, serviceNames: [], energyCost: 0 };
  var en = gameState.energy;
  var stats = gameState.serviceStats;
  var sp = gameState.servicePricing;

  if (Math.random() < getEffectiveServiceProbability('insurance')) {
    var income = sp.insurance * rentalDays;
    result.serviceIncome += income;
    result.serviceNames.push('保险');
    stats.today.insurance++;
    stats.total.insurance++;
  }

  if (Math.random() < getEffectiveServiceProbability('wifi')) {
    var income = sp.wifi * rentalDays;
    result.serviceIncome += income;
    result.serviceNames.push('WiFi');
    stats.today.wifi++;
    stats.total.wifi++;
  }

  if (Math.random() < getEffectiveServiceProbability('gps')) {
    var income = sp.gps * rentalDays;
    result.serviceIncome += income;
    result.serviceNames.push('GPS');
    stats.today.gps++;
    stats.total.gps++;
  }

  if (Math.random() < getEffectiveServiceProbability('delivery')) {
    result.serviceIncome += sp.delivery;
    result.serviceNames.push('送车上门');
    stats.today.delivery++;
    stats.total.delivery++;
  }

  if (isFuelVehicle(vehicle.fuelType) && Math.random() < SERVICE_PROBABILITIES.refuel) {
    var liters = isHybridVehicle(vehicle.fuelType) ? 15 : SERVICE_PRICES.refuelLiters;
    var serviceCharge = Math.round(en.oilPrice * liters * sp.refuelMargin);
    if (en.oilStorage >= liters) {
      en.oilStorage -= liters;
      result.serviceIncome += serviceCharge;
      result.serviceNames.push(isHybridVehicle(vehicle.fuelType) ? '加油(混动)' : '加油');
    } else {
      var emergencyCost = Math.round(en.oilPrice * liters);
      gameState.cash -= emergencyCost;
      gameState.todayExpense += emergencyCost;
      result.serviceNames.push('加油(紧急采购)');
    }
    stats.today.refuel++;
    stats.total.refuel++;
  }

  if (isElectricVehicle(vehicle.fuelType) && Math.random() < SERVICE_PROBABILITIES.recharge) {
    var kwh = isHybridVehicle(vehicle.fuelType) ? 20 : SERVICE_PRICES.rechargeKwh;
    var serviceCharge = Math.round(en.electricityPrice * kwh * sp.rechargeMargin);
    if (en.batteryStorage >= kwh) {
      en.batteryStorage -= kwh;
      result.serviceIncome += serviceCharge;
      result.serviceNames.push(isHybridVehicle(vehicle.fuelType) ? '充电(混动)' : '充电');
    } else {
      var emergencyCost = Math.round(en.electricityPrice * kwh);
      gameState.cash -= emergencyCost;
      gameState.todayExpense += emergencyCost;
      result.serviceNames.push('充电(紧急采购)');
    }
    stats.today.recharge++;
    stats.total.recharge++;
  }

  result.serviceIncome = Math.round(result.serviceIncome);
  stats.today.totalIncome += result.serviceIncome;
  stats.total.totalIncome += result.serviceIncome;

  return result;
}

function rejectOrder(orderId) {
  var idx = gameState.pendingOrders.findIndex(function(o){ return o.id === orderId; });
  if (idx === -1) return;
  var order = gameState.pendingOrders[idx];
  gameState.pendingOrders.splice(idx, 1);
  addMessage('已拒绝 ' + order.customerName + ' 的租车订单', 'bad');
  renderOrders(); updateUI(); saveGame();
}
