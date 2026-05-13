function generateCustomers() {
  var customers = [];
  var eventEffects = getEventEffects();
  var ownedOutlets = gameState.outlets.filter(function(o){ return o.owned; });
  var totalOwnedVehicles = gameState.ownedVehicles.length;
  var companyStage = gameState.companyStage || 1;

  ownedOutlets.forEach(function(outlet){
    var cfg = OUTLET_CONFIGS.find(function(c){ return c.id === outlet.id; }) || OUTLET_CONFIGS[0];

    var baseCount = Math.floor((CITY_SIZE_MULTIPLIERS[cfg.citySize] || 1) * 25);

    var os = getOutletState(outlet.id);
    baseCount = Math.floor(baseCount * (1 + (os.level - 1) * 0.25));

    var availVehicles = getAvailableVehiclesAtOutlet(outlet.id);
    var availCount = availVehicles.length;
    var vehicleMult = availCount <= 3 ? 0.5 : availCount <= 8 ? 0.7 : availCount <= 15 ? 0.9 : availCount <= 30 ? 1.1 : availCount <= 50 ? 1.3 : availCount <= 80 ? 1.5 : 1.8;
    baseCount = Math.floor(baseCount * vehicleMult);

    var rep = gameState.reputation || 50;
    var repMult = rep < 30 ? 0.6 : rep < 50 ? 0.75 : rep < 70 ? 0.95 : rep < 85 ? 1.15 : rep < 95 ? 1.35 : 1.5;
    baseCount = Math.floor(baseCount * repMult);

    if (typeof getAdDemandMultiplier === 'function') {
      baseCount = Math.ceil(baseCount * getAdDemandMultiplier());
    }
    var campaignMult = typeof getCampaignDemandMultiplier === 'function' ? getCampaignDemandMultiplier() : 1.0;
    if (campaignMult > 1.0) {
      baseCount = Math.ceil(baseCount * campaignMult);
    }

    if (typeof getReviewImpactOnOrders === 'function') {
      var reviewImpact = getReviewImpactOnOrders();
      baseCount = Math.ceil(baseCount * (1 + reviewImpact.bonus));
    }

    if (typeof hasPreferredFacility === 'function') {
      var hasBiz = hasPreferredFacility(outlet.id, 'business');
      var hasTour = hasPreferredFacility(outlet.id, 'tourist');
      if (hasBiz || hasTour) baseCount = Math.ceil(baseCount * 1.15);
    }

    var memberCount = gameState.members.length || 0;
    var memberMult = memberCount <= 10 ? 1.0 : memberCount <= 30 ? 1.08 : memberCount <= 60 ? 1.15 : memberCount <= 100 ? 1.22 : memberCount <= 200 ? 1.3 : 1.4;
    baseCount = Math.ceil(baseCount * memberMult);

    var stageMult = companyStage <= 1 ? 1.0 : companyStage === 2 ? 1.2 : companyStage === 3 ? 1.4 : companyStage === 4 ? 1.6 : 1.8;
    baseCount = Math.ceil(baseCount * stageMult);

    var dayOfWeek = gameState.currentDay % 7;
    var weekendBoost = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.2 : 1.0;

    var seasonVar = 0.88 + Math.random() * 0.28;
    baseCount = Math.max(3, Math.round(baseCount * weekendBoost * seasonVar));

    var count = Math.min(baseCount, Math.max(availCount * 2, availCount + 10));
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

function generateEasterEggOrder(excludeVehicleIds) {
  if (Math.random() > 0.45) return null;
  var available = [];
  gameState.outlets.filter(function(o){ return o.owned; }).forEach(function(outlet){
    available = available.concat(getAvailableVehiclesAtOutlet(outlet.id));
  });
  if (excludeVehicleIds && excludeVehicleIds.length > 0) {
    available = available.filter(function(v){ return excludeVehicleIds.indexOf(v.id) === -1; });
  }
  if (available.length === 0) return null;
  var vehicle = available[Math.floor(Math.random() * available.length)];
  var outlet = OUTLET_CONFIGS.find(function(c){ return c.id === (vehicle.outletId || 0); }) || OUTLET_CONFIGS[0];
  var EGG_SCENARIOS = [
    { name: '🎬 电影剧组', desc: '某电影需要拍摄用车', bonus: 2.5, days: [3,7], customer: '张导演' },
    { name: '👑 明星出行', desc: '知名艺人低调租车', bonus: 3.0, days: [1,3], customer: '神秘明星' },
    { name: '🏢 企业高管', desc: '跨国公司CEO来访', bonus: 2.0, days: [5,10], customer: '王总' },
    { name: '💒 婚礼车队', desc: '新人婚庆包车需求', bonus: 2.8, days: [1,2], customer: '李先生' },
    { name: '📺 综艺节目', desc: '热门综艺外景拍摄', bonus: 2.3, days: [4,6], customer: '节目组' },
    { name: '🎤 歌手巡演', desc: '演唱会巡演后勤用车', bonus: 3.5, days: [7,14], customer: '巡演团队' },
    { name: '🏥 医疗急救', desc: '医院紧急转运任务', bonus: 4.0, days: [1,1], customer: '急救中心' },
    { name: '🎮 游戏主播', desc: '百万粉丝UP主探店', bonus: 1.8, days: [2,4], customer: '游戏酱' },
    { name: '🌍 外国使团', desc: '外国代表团访问用车', bonus: 3.2, days: [5,8], customer: 'Smith大使' },
    { name: '🏆 体育赛事', desc: '国家队集训接送', bonus: 2.6, days: [14,21], customer: '体育总局' },
    { name: '🚀 科技公司', desc: '科技巨头发布会用车', bonus: 2.2, days: [2,3], customer: '产品经理' },
    { name: '🎭 戏曲名家', desc: '非遗传承人巡演用车', bonus: 1.9, days: [3,5], customer: '梅老师' }
  ];
  var scenario = EGG_SCENARIOS[Math.floor(Math.random() * EGG_SCENARIOS.length)];
  var rentalDays = scenario.days[0] + Math.floor(Math.random() * (scenario.days[1] - scenario.days[0] + 1));
  var effectiveRate = getEffectiveDailyRate(vehicle);
  var totalIncome = Math.round(effectiveRate * rentalDays * scenario.bonus);
  var eventEffects = getEventEffects();
  var fuelCost = vehicle.fuelCostPerDay * (eventEffects.fuelMultiplier || 1);
  var maintCost = vehicle.maintenanceCostPerDay * (eventEffects.maintenanceMultiplier || 1);
  var totalCost = Math.round((fuelCost + maintCost) * rentalDays * 0.5);
  return {
    id: 'EGG_' + Date.now() + '_' + Math.random().toString(36).substr(2,6),
    customerId: 'egg_' + Date.now(), customerName: scenario.customer, customerType: Math.random() > 0.5 ? 'business' : 'tourist',
    memberId: null,
    outletId: vehicle.outletId, outletName: outlet.name,
    vehicleId: vehicle.id, vehicleName: vehicle.brand + ' ' + vehicle.model,
    vehicleType: vehicle.type, dailyRate: effectiveRate,
    rentalDays: rentalDays, totalIncome: totalIncome,
    fuelCostPerDay: Math.round(fuelCost), maintenanceCostPerDay: Math.round(maintCost),
    totalCost: totalCost, netIncome: Math.round(totalIncome - totalCost),
    createdDay: gameState.currentDay,
    isEasterEgg: true, eggBonus: scenario.bonus, eggScenario: scenario.name, eggDesc: scenario.desc
  };
}

function matchVehicleForCustomer(customer) {
  if (!gameState._dayMatchedVehicles) gameState._dayMatchedVehicles = {};
  if (!gameState._vehicleRentHistory) gameState._vehicleRentHistory = {};
  var available = getAvailableVehiclesAtOutlet(customer.outletId);
  available = available.filter(function(v){ return !gameState._dayMatchedVehicles[v.id]; });
  if (available.length === 0) return null;
  
  var eventEffects = getEventEffects();
  var today = gameState.currentDay;
  
  var typePrefScores = {};
  available.forEach(function(v){
    var pref = customer.preferences[v.type] || 1;
    if (eventEffects.fuelDemandMultiplier && eventEffects.fuelDemandMultiplier[v.fuelType]) {
      pref *= eventEffects.fuelDemandMultiplier[v.fuelType];
    }
    typePrefScores[v.id] = pref;
  });
  
  var highPref = available.filter(function(v){ return typePrefScores[v.id] >= 0.8; });
  var midPref = available.filter(function(v){ return typePrefScores[v.id] >= 0.4 && typePrefScores[v.id] < 0.8; });
  var lowPref = available.filter(function(v){ return typePrefScores[v.id] < 0.4; });
  
  var pool = highPref.length > 0 ? highPref : (midPref.length > 0 ? midPref : lowPref);
  
  var scored = pool.map(function(v){
    var lastRented = gameState._vehicleRentHistory[v.id] || 0;
    var daysSince = Math.max(0, today - lastRented);
    var cooldownBonus = daysSince * 15;
    var prefBonus = typePrefScores[v.id] * 8;
    var effectiveRate = getEffectiveDailyRate(v);
    if (customer.memberId) {
      var member = gameState.members.find(function(m){ return m.id === customer.memberId; });
      if (member) {
        var levelInfo = getMemberLevelInfo(member.level);
        effectiveRate = Math.round(effectiveRate * levelInfo.discount);
      }
    }
    var ratePenalty = Math.max(0, (effectiveRate - 200) / 20);
    
    return { vehicle: v, score: cooldownBonus + prefBonus - ratePenalty + (Math.random() * 30), effectiveRate: effectiveRate };
  });
  
  scored.sort(function(a,b){ return b.score - a.score; });
  
  var pickRange = Math.min(Math.ceil(scored.length / 2), 5);
  var pickIdx = Math.floor(Math.random() * pickRange);
  var chosen = scored[pickIdx];
  
  gameState._vehicleRentHistory[chosen.vehicle.id] = today;
  gameState._dayMatchedVehicles[chosen.vehicle.id] = true;
  return chosen;
}

function nextDay() {
  gameState.todayIncome = 0;
  gameState.todayExpense = 0;
  gameState.outletOrderCounts = {};
  gameState.serviceStats.today = { insurance:0, wifi:0, gps:0, delivery:0, refuel:0, recharge:0, totalIncome:0 };
  gameState._dayMatchedVehicles = {};
  if (!gameState._vehicleRentHistory) gameState._vehicleRentHistory = {};
  gameState._todayMaintainCount = 0;
  gameState._todayNewMembers = 0;
  gameState._todayVipOrders = 0;
  gameState._todayRejectCounts = {};

  processRentalCosts();
  processTransfers();
  processEventExpiry();
  processParkingReturns();
  processParkingPressure();
  processParkingRent();
  processCarWashAllOutlets();

  if (typeof degradeAllVehicles === 'function') degradeAllVehicles();

  var totalWages = processDailyEmployeeEffects();
  if (totalWages > 0) {
    gameState.cash -= totalWages;
    gameState.todayExpense += totalWages;
    addMessage('💼 员工工资支出 ' + formatCurrency(totalWages), 'warn');
  }

  if (typeof processDailyFinance === 'function') processDailyFinance();
  if (typeof processLoanInterest === 'function') processLoanInterest();
  if (typeof initEnterpriseFinance === 'function') initEnterpriseFinance();
  if (typeof calculateCashFlow === 'function') calculateCashFlow();
  if (typeof processTaxes === 'function') processTaxes();

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
    gameState._todayNewMembers = (gameState._todayNewMembers || 0) + 1;
    addMessage('👤 新会员注册：' + newMember.name + '（' + getMemberLevelInfo(newMember.level).name + '）', 'good');
  }

  var customers = generateCustomers();
  var date = getGameDate();
  var factorParts = [];
  var firstOutlet = gameState.outlets.find(function(o){ return o.owned; });
  if (firstOutlet) {
    var fcfg = OUTLET_CONFIGS[firstOutlet.id];
    var baseVal = Math.floor((CITY_SIZE_MULTIPLIERS[fcfg.citySize] || 1) * 25);
    var fos = getOutletState(firstOutlet.id);
    baseVal = Math.floor(baseVal * (1 + (fos.level - 1) * 0.25));
    factorParts.push('基础:' + baseVal);
    var favail = getAvailableVehiclesAtOutlet(firstOutlet.id).length;
    var fvm = favail <= 3 ? 0.5 : favail <= 8 ? 0.7 : favail <= 15 ? 0.9 : favail <= 30 ? 1.1 : favail <= 50 ? 1.3 : favail <= 80 ? 1.5 : 1.8;
    factorParts.push('车辆' + fvm.toFixed(1) + '×');
    var frep = gameState.reputation || 50;
    var frm = frep < 30 ? 0.6 : frep < 50 ? 0.75 : frep < 70 ? 0.95 : frep < 85 ? 1.15 : frep < 95 ? 1.35 : 1.5;
    factorParts.push('声誉' + frm.toFixed(1) + '×');
    if (typeof getAdDemandMultiplier === 'function') {
      var fam = getAdDemandMultiplier();
      if (fam !== 1) factorParts.push('广告' + fam.toFixed(2) + '×');
    }
    var fmc = gameState.members.length || 0;
    var fmm = fmc <= 10 ? 1.0 : fmc <= 30 ? 1.08 : fmc <= 60 ? 1.15 : fmc <= 100 ? 1.22 : fmc <= 200 ? 1.3 : 1.4;
    if (fmm !== 1.0) factorParts.push('会员' + fmm.toFixed(1) + '×');
    var fstage = gameState.companyStage || 1;
    var fsm = fstage <= 1 ? 1.0 : fstage === 2 ? 1.2 : fstage === 3 ? 1.4 : fstage === 4 ? 1.6 : 1.8;
    if (fsm !== 1.0) factorParts.push('阶段' + fsm.toFixed(1) + '×');
  }
  var factorStr = factorParts.length > 0 ? ' (' + factorParts.join(' × ') + ')' : '';
  addMessage('📅 ' + formatDate(date) + ' ' + getWeekDay(date) + ' — 到店客户 <span class="msg-highlight">' + customers.length + '</span> 人' + factorStr, 'good');

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
    var eggCount = 0;
    var maxEggs = Math.min(3, Math.ceil(newOrders.length / 5) + 1);
    var usedVehicleIds = newOrders.map(function(o){ return o.vehicleId; });
    for (var ei = 0; ei < maxEggs; ei++) {
      var eggOrder = generateEasterEggOrder(usedVehicleIds);
      if (eggOrder) {
        usedVehicleIds.push(eggOrder.vehicleId);
        gameState.pendingOrders.push(eggOrder);
        eggCount++;
        addMessage('🎁 彩蛋订单！' + eggOrder.customerName + ' — ' + eggOrder.eggScenario + ' 收入×' + eggOrder.eggBonus, 'good');
      }
    }
    if (eggCount > 1) {
      addMessage('🎊 今日运气爆棚！共获得 <span class="msg-highlight">' + eggCount + '</span> 个彩蛋订单！', 'good');
    }
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

  if (typeof processProgressionDaily === 'function') processProgressionDaily();

  if (typeof processDailyReviews === 'function') processDailyReviews();
  if (typeof processDailyAdvertising === 'function') processDailyAdvertising();

  if (typeof generateDailyChallenge === 'function' && (!gameState.dailyChallenge || gameState.dailyChallenge.claimed)) {
    generateDailyChallenge();
    if (gameState.dailyChallenge) {
      addMessage('🎯 今日挑战：' + gameState.dailyChallenge.desc + '（奖励 $' + formatCurrency(gameState.dailyChallenge.rewardCash) + '，声誉 +' + gameState.dailyChallenge.rewardRep + '）', 'good');
    }
    gameState.challengeStreak = (gameState.challengeStreak || 0) + (gameState.dailyChallenge && gameState.dailyChallenge.completed ? 1 : 0);
  }

  if (typeof checkChallengeProgress === 'function') checkChallengeProgress();
  if (typeof processAutoManagement === 'function') processAutoManagement();
  if (typeof processCustomerLoyalty === 'function') processCustomerLoyalty();
  if (typeof processMemberTierDowngradeCheck === 'function') processMemberTierDowngradeCheck();
  if (typeof resetMonthlyBenefits === 'function') resetMonthlyBenefits();
  if (typeof processDailyMarketing === 'function') processDailyMarketing();
  if (typeof processInsuranceRenewals === 'function') processInsuranceRenewals();
  if (typeof processPendingClaims === 'function') processPendingClaims();

  var accident = typeof checkRandomAccident === 'function' ? checkRandomAccident() : null;

  gameState.ownedVehicles.forEach(function(v){
    initVehicleLifecycle(v);
    if (v.rentedUntil && v.rentedUntil >= gameState.currentDay) {
      var dailyRate = getEffectiveDailyRate(v);
      updateVehicleLifecycleStats(v.id, dailyRate, v.fuelCostPerDay + v.maintenanceCostPerDay, 1);
    }
  });
  trackFunnelStage('visitors');
  customers.forEach(function(){ trackFunnelStage('browsed'); });
  newOrders.forEach(function(){ trackFunnelStage('inquired'); trackFunnelStage('ordered'); });

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

  releaseParkingSpot(order.outletId);

  var serviceResult = applyValueAddedServices(vehicle, order.rentalDays);
  var facilityFee = 0;
  if (typeof getFacilityServiceFee === 'function') {
    facilityFee = getFacilityServiceFee(order.outletId, order.customerType);
  }
  var incomeBonusPct = 0;
  if (typeof getOutletIncomeBonusPercent === 'function') {
    incomeBonusPct = getOutletIncomeBonusPercent(order.outletId);
  }
  var zoneBonus = 0;
  if (typeof getZoneEfficiencyBonus === 'function') {
    zoneBonus = getZoneEfficiencyBonus(order.outletId);
  }
  incomeBonusPct += zoneBonus * 100;

  var conditionPenalty = typeof getConditionPenaltyMultiplier === 'function' ? getConditionPenaltyMultiplier(vehicle) : { fuelMult: 1.0, satisfactionPenalty: 1.0, acceptPenalty: 1.0 };
  var baseIncome = order.totalIncome * conditionPenalty.acceptPenalty;
  var bonusIncome = Math.round(baseIncome * incomeBonusPct / 100);
  var totalIncome = baseIncome + serviceResult.serviceIncome + facilityFee + bonusIncome;

  var outletState = getOutletState(order.outletId);
  if (outletState && outletState.autoManageEnabled) {
    var managementFee = Math.round(baseIncome * 0.05);
    totalIncome -= managementFee;
  }

  gameState.cash += totalIncome;
  gameState.todayIncome += totalIncome;
  vehicle.rentedUntil = gameState.currentDay + order.rentalDays - 1;

  var conflicts = gameState.pendingOrders.filter(function(o){ return o.id !== orderId && o.vehicleId === order.vehicleId; });
  conflicts.forEach(function(c){
    var cidx = gameState.pendingOrders.indexOf(c);
    if (cidx > -1) {
      gameState.pendingOrders.splice(cidx, 1);
      addMessage('⚠️ 自动取消：' + c.customerName + ' 的订单（' + c.vehicleName + ' 已被租出）', 'warn');
    }
  });

  if (!gameState.outletOrderCounts[order.outletId]) gameState.outletOrderCounts[order.outletId] = 0;
  gameState.outletOrderCounts[order.outletId]++;

  gameState.totalDaysRented += order.rentalDays;
  gameState.totalRevenue += totalIncome;
  trackFunnelStage('paid');
  if (typeof recordMarketingConversion === 'function') {
    var convChannel = Math.random() < 0.05 ? 'referral' : (Math.random() < 0.1 ? 'member' : (Math.random() < 0.3 ? 'advertising' : 'organic'));
    recordMarketingConversion(convChannel, 1);
    var activeCampaigns = (gameState.marketing.campaigns || []).filter(function(c){ return c.status === 'active'; });
    activeCampaigns.forEach(function(c){ c.customersAcquired = (c.customersAcquired || 0) + 1; });
  }

  if (order.memberId) {
    updateMemberAfterRental(order.memberId, totalIncome);
    gameState._todayVipOrders = (gameState._todayVipOrders || 0) + 1;
    var member = gameState.members.find(function(m){ return m.id === order.memberId; });
    if (member && typeof calculateVipTip === 'function') {
      var tip = calculateVipTip(member.level || 1, totalIncome);
      if (tip > 0) {
        gameState.cash += tip;
        gameState.todayIncome += tip;
        addMessage('💎 ' + order.customerName + '(VIP) 小费 +' + formatCurrency(tip), 'good');
      }
    }
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
  if (typeof applyCustomerComplaints === 'function') {
    var prevRejects = gameState._todayRejectCounts[order.customerName] || 0;
    gameState._todayRejectCounts[order.customerName] = prevRejects + 1;
    applyCustomerComplaints(order.customerName, gameState._todayRejectCounts[order.customerName]);
  }
  if (typeof gameState.marketing !== 'undefined' && gameState.marketing.abandonedCartRecovery) {
    gameState.marketing.abandonedCartRecovery.push({ orderId: order.id, customerName: order.customerName, vehicleName: order.vehicleName, day: gameState.currentDay, recovered: false });
  }
  addMessage('已拒绝 ' + order.customerName + ' 的租车订单', 'bad');
  renderOrders(); updateUI(); saveGame();
}

function processParkingReturns() {
  gameState.outlets.filter(function(o){ return o.owned; }).forEach(function(outlet) {
    var returningVehicles = gameState.ownedVehicles.filter(function(v) {
      return v.outletId === outlet.id && v.rentedUntil && v.rentedUntil < gameState.currentDay && !isInTransit(v.id);
    });
    var occ = outlet.occupiedCustomerSpots || 0;
    var total = outlet.parkingSpots ? outlet.parkingSpots.customer : PARKING_CONFIG.customer.base;
    var reserved = outlet.reservedSpots || 0;
    var available = total - occ;
    var unsatisfiedCount = 0;
    returningVehicles.forEach(function(v) {
      if (available > reserved) {
        occ++;
        available--;
      } else {
        unsatisfiedCount++;
        if (v.cleanliness !== undefined && v.cleanliness < 30) {
          unsatisfiedCount++;
        }
      }
    });
    outlet.occupiedCustomerSpots = Math.min(occ, total);
    if (unsatisfiedCount > 0) {
      addMessage('⚠️ ' + OUTLET_CONFIGS.find(function(c){ return c.id === outlet.id; }).name + '：' + unsatisfiedCount + '辆车位不足，满意度下降', 'warn');
    }
  });
}

function processParkingPressure() {
  gameState.outlets.filter(function(o){ return o.owned; }).forEach(function(outlet) {
    if (!outlet.parkingSpots) return;
    var occ = outlet.occupiedCustomerSpots || 0;
    var total = outlet.parkingSpots.customer;
    if (total === 0) return;
    var pressure = occ / total;
    if (pressure >= PARKING_PRESSURE_THRESHOLD) {
      outlet.parkingPressureDays = (outlet.parkingPressureDays || 0) + 1;
      if (outlet.parkingPressureDays >= 3) {
        addMessage('⚠️ ' + OUTLET_CONFIGS.find(function(c){ return c.id === outlet.id; }).name + '：车位紧张持续' + outlet.parkingPressureDays + '天，满意度临时-10', 'bad');
      }
      if (outlet.parkingPressureDays >= 5) {
        gameState.cash -= PARKING_EMERGENCY_FEE;
        gameState.todayExpense += PARKING_EMERGENCY_FEE;
        addMessage('🚨 ' + OUTLET_CONFIGS.find(function(c){ return c.id === outlet.id; }).name + '：被迫租用额外停车位，花费 ' + formatCurrency(PARKING_EMERGENCY_FEE), 'bad');
        outlet.parkingPressureDays = 0;
      }
    } else {
      outlet.parkingPressureDays = 0;
    }
  });
}

function processParkingRent() {
  gameState.outlets.filter(function(o){ return o.owned; }).forEach(function(outlet) {
    var rent = getDailyParkingRent(outlet.id);
    if (rent > 0) {
      gameState.cash -= rent;
      gameState.todayExpense += rent;
    }
  });
}

function processCarWashAllOutlets() {
  gameState.outlets.filter(function(o){ return o.owned; }).forEach(function(outlet) {
    if (typeof processCarWashReturn === 'function') {
      var washed = processCarWashReturn(outlet.id);
      if (washed > 0) {
        console.log('洗车房清洗了 ' + washed + ' 辆车');
      }
    }
  });
}

function releaseParkingSpot(outletId) {
  var os = getOutletState(outletId);
  if (!os || !os.parkingSpots) return;
  os.occupiedCustomerSpots = Math.max(0, (os.occupiedCustomerSpots || 0) - 1);
}

function occupyParkingSpot(outletId) {
  var os = getOutletState(outletId);
  if (!os || !os.parkingSpots) return false;
  var occ = os.occupiedCustomerSpots || 0;
  var total = os.parkingSpots.customer;
  if (occ >= total) return false;
  os.occupiedCustomerSpots = occ + 1;
  return true;
}

function hasAvailableParkingSpot(outletId) {
  var os = getOutletState(outletId);
  if (!os || !os.parkingSpots) return false;
  var occ = os.occupiedCustomerSpots || 0;
  var total = os.parkingSpots.customer;
  return occ < total;
}

function checkCleanlinessPenalty(outletId) {
  var penalty = 0;
  var vehicles = getVehiclesAtOutlet(outletId);
  vehicles.forEach(function(v) {
    if (v.cleanliness !== undefined && v.cleanliness < 30) {
      penalty += 10;
    }
  });
  return Math.min(penalty, 30);
}

function processReservationForOrder(order) {
  var outletId = order.outletId;
  var os = getOutletState(outletId);
  if (!os) return 0;
  if (gameState.autoRecommendReservation || Math.random() < 0.2) {
    os.reservedSpots = (os.reservedSpots || 0) + 1;
    return PARKING_RESERVATION_FEE;
  }
  return 0;
}
