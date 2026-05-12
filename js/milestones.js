var MILESTONE_CONFIGS = [
  { id:1, name:'小店铺', desc:'初始阶段', icon:'🏪',
    conditions:{},
    rewards:{ reputation:5 },
    unlocks:[]
  },
  { id:2, name:'大店铺', desc:'现金>50万 且 连续30天盈利', icon:'🏬',
    conditions:{ cash:500000, consecutiveProfitDays:30 },
    rewards:{ reputation:10, message:'全国媒体曝光→声誉+10' },
    unlocks:['outlet_capacity_upgrade']
  },
  { id:3, name:'连锁经营', desc:'现金>200万 且 拥有>=3个网点', icon:'🏢',
    conditions:{ cash:2000000, outletCount:3 },
    rewards:{ reputation:15, message:'品牌影响力扩大→声誉+15' },
    unlocks:['brand_management', 'parking_upgrade']
  },
  { id:4, name:'跨地区', desc:'现金>1000万 且 声誉>80', icon:'🌍',
    conditions:{ cash:10000000, reputation:80 },
    rewards:{ reputation:20, message:'全国布局→声誉+20' },
    unlocks:['new_city']
  },
  { id:5, name:'旗舰店铺', desc:'拥有Lv.5网点', icon:'⭐',
    conditions:{ flagshipOutlet:true },
    rewards:{ reputation:15, message:'旗舰店铺开业→声誉+15' },
    unlocks:['interior_decoration']
  },
  { id:6, name:'上市', desc:'满足IPO条件', icon:'📈',
    conditions:{ ipoEligible:true },
    rewards:{ reputation:25, message:'上市成功→声誉+25' },
    unlocks:['stock_system','investor_relations']
  }
];

var CITIES = [
  { id:'home', name:'本城', demandMultiplier:1.0, competitionLevel:1.0, unlockCost:0 },
  { id:'coastal', name:'海滨城', demandMultiplier:1.2, competitionLevel:0.8, unlockCost:1000000 },
  { id:'industrial', name:'工业城', demandMultiplier:0.9, competitionLevel:1.3, unlockCost:1000000 },
  { id:'tech', name:'科技城', demandMultiplier:1.4, competitionLevel:0.9, unlockCost:1000000 }
];

function checkMilestones() {
  if (!gameState.achievedMilestones) gameState.achievedMilestones = [];
  if (gameState.reputation === undefined) gameState.reputation = 0;
  if (!gameState.companyStage) gameState.companyStage = '';
  if (!gameState.unlockedCities) gameState.unlockedCities = ['home'];
  if (!gameState.currentCity) gameState.currentCity = 'home';

  var newlyAchieved = [];
  var consecutiveProfitDays = getConsecutiveProfitDays();
  var ownedOutletCount = gameState.outlets.filter(function(o){ return o.owned; }).length;
  var ipoEligible = typeof checkIPOEligibility === 'function' ? checkIPOEligibility() : false;
  var hasFlagship = gameState.outlets.some(function(o){ return o.owned && o.level >= 5; });

  for (var i = 0; i < MILESTONE_CONFIGS.length; i++) {
    var m = MILESTONE_CONFIGS[i];
    if (isMilestoneAchieved(m.id)) continue;

    var met = true;
    var conds = m.conditions;
    if (conds.cash !== undefined && gameState.cash < conds.cash) met = false;
    if (conds.consecutiveProfitDays !== undefined && consecutiveProfitDays < conds.consecutiveProfitDays) met = false;
    if (conds.outletCount !== undefined && ownedOutletCount < conds.outletCount) met = false;
    if (conds.reputation !== undefined && gameState.reputation < conds.reputation) met = false;
    if (conds.ipoEligible !== undefined && conds.ipoEligible && !ipoEligible) met = false;
    if (conds.flagshipOutlet !== undefined && conds.flagshipOutlet && !hasFlagship) met = false;

    if (met) {
      gameState.achievedMilestones.push(m.id);
      gameState.companyStage = m.name;

      if (m.rewards.reputation) {
        addReputation(m.rewards.reputation);
      }

      if (m.unlocks) {
        m.unlocks.forEach(function(unlock) {
          if (unlock === 'interior_decoration') {
            gameState.interiorDecorUnlocked = true;
          }
        });
      }

      var celebrationMsg = m.icon + ' 里程碑达成：' + m.name + ' — ' + m.desc;
      if (m.rewards.message) {
        celebrationMsg += ' | ' + m.rewards.message;
      }
      if (typeof addMessage === 'function') {
        addMessage(celebrationMsg, 'good');
      }

      newlyAchieved.push(m);
    }
  }

  if (newlyAchieved.length > 0) {
    saveGame();
  }

  return newlyAchieved;
}

function isMilestoneAchieved(milestoneId) {
  if (!gameState.achievedMilestones) return false;
  return gameState.achievedMilestones.indexOf(milestoneId) !== -1;
}

function getConsecutiveProfitDays() {
  if (!gameState.financials || !gameState.financials.dailyProfit) return 0;
  var profits = gameState.financials.dailyProfit;
  var count = 0;
  for (var i = profits.length - 1; i >= 0; i--) {
    if (profits[i] > 0) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

function unlockCity(cityId) {
  if (!gameState.unlockedCities) gameState.unlockedCities = ['home'];
  if (isCityUnlocked(cityId)) return { success: false, message: '城市已解锁' };

  var city = CITIES.find(function(c){ return c.id === cityId; });
  if (!city) return { success: false, message: '未知城市' };
  if (gameState.cash < city.unlockCost) return { success: false, message: '资金不足' };

  gameState.cash -= city.unlockCost;
  gameState.unlockedCities.push(cityId);
  addMessage('🌍 解锁新城市：' + city.name + '，需求系数 ' + city.demandMultiplier + '，竞争系数 ' + city.competitionLevel, 'good');
  if (typeof updateUI === 'function') updateUI();
  saveGame();
  return { success: true, city: city };
}

function isCityUnlocked(cityId) {
  if (!gameState.unlockedCities) return cityId === 'home';
  return gameState.unlockedCities.indexOf(cityId) !== -1;
}

function getCurrentCity() {
  return gameState.currentCity || 'home';
}

function switchCity(cityId) {
  if (!isCityUnlocked(cityId)) return { success: false, message: '城市未解锁' };
  var city = CITIES.find(function(c){ return c.id === cityId; });
  if (!city) return { success: false, message: '未知城市' };

  gameState.currentCity = cityId;
  addMessage('🗺️ 切换至：' + city.name, 'good');

  if (typeof createOutletBuildings === 'function') {
    createOutletBuildings();
  }
  if (typeof updateUI === 'function') updateUI();
  saveGame();
  return { success: true, city: city };
}

function getCompanyReputation() {
  return gameState.reputation || 0;
}

function addReputation(amount) {
  if (gameState.reputation === undefined) gameState.reputation = 0;
  gameState.reputation = Math.max(0, Math.min(100, gameState.reputation + amount));
  return gameState.reputation;
}

function checkWinCondition() {
  if (getCompanyReputation() < 95) return false;
  if (getMarketCap() < 1000000000) return false;
  return true;
}

function getMarketShare() {
  var outletCount = gameState.outlets.filter(function(o){ return o.owned; }).length;
  var vehicleCount = gameState.ownedVehicles.length;
  var reputation = getCompanyReputation();

  var outletScore = Math.min(outletCount / 5, 1) * 30;
  var vehicleScore = Math.min(vehicleCount / 100, 1) * 40;
  var reputationScore = (reputation / 100) * 30;

  return Math.min(outletScore + vehicleScore + reputationScore, 100);
}

function getMarketCap() {
  if (gameState.stocks && gameState.stocks.isPublic) {
    return gameState.stocks.sharePrice * gameState.stocks.totalShares;
  }
  var totalRevenue = gameState.totalRevenue || 0;
  return totalRevenue * 5;
}

function processQuarterlyBoard() {
  if (!gameState.stocks || !gameState.stocks.isPublic) return;
  if (gameState.currentDay % 90 !== 0) return;

  var pnl = typeof getPnL === 'function' ? getPnL('month') : { netProfit: 0 };
  var strategy;

  if (pnl.netProfit > 100000) {
    strategy = 'expansion';
    addMessage('📋 董事会决议：近期盈利良好，执行扩张战略', 'good');
  } else if (pnl.netProfit > 0) {
    strategy = 'stable';
    addMessage('📋 董事会决议：经营稳定，维持当前战略', 'good');
  } else {
    strategy = 'cost_cutting';
    addMessage('📋 董事会决议：近期亏损，执行降本增效战略', 'warn');
  }

  gameState.boardStrategy = strategy;
  saveGame();
  return strategy;
}
