var ACHIEVEMENT_CATEGORIES = {
  fleet: { name: '车队收藏', icon: '🚗', color: '#ff6b35' },
  business: { name: '商业帝国', icon: '💰', color: '#4ade80' },
  service: { name: '服务之星', icon: '⭐', color: '#fbbf24' },
  facility: { name: '设施大师', icon: '🏗️', color: '#a855f7' },
  staff: { name: '团队领袖', icon: '👥', color: '#60a5fa' },
  special: { name: '隐藏成就', icon: '🔮', color: '#f472b6' }
};

var ACHIEVEMENTS = [
  { id:'first_car', cat:'fleet', name:'第一辆车', desc:'购买第一辆车', icon:'🚗', check: function(){ return gameState.ownedVehicles.length >= 1; }, reward: { cash: 10000 }, claimed: false },
  { id:'fleet_5', cat:'fleet', name:'小车队', desc:'拥有5辆车', icon:'🚙', check: function(){ return gameState.ownedVehicles.length >= 5; }, reward: { cash: 50000 }, claimed: false },
  { id:'fleet_15', cat:'fleet', name:'中型车队', desc:'拥有15辆车', icon:'🚐', check: function(){ return gameState.ownedVehicles.length >= 15; }, reward: { cash: 100000, reputation: 5 }, claimed: false },
  { id:'fleet_30', cat:'fleet', name:'大型车队', desc:'拥有30辆车', icon:'🚌', check: function(){ return gameState.ownedVehicles.length >= 30; }, reward: { cash: 200000, reputation: 10 }, claimed: false },
  { id:'fleet_50', cat:'fleet', name:'超级车队', desc:'拥有50辆车', icon:'🚀', check: function(){ return gameState.ownedVehicles.length >= 50; }, reward: { cash: 500000, reputation: 20 }, claimed: false },
  { id:'luxury_owner', cat:'fleet', name:'豪车收藏家', desc:'拥有3辆豪华车/超跑', icon:'💎', check: function(){ return gameState.ownedVehicles.filter(function(v){ return v.type==='豪华车'||v.type==='超跑'; }).length >= 3; }, reward: { reputation: 15 }, claimed: false },
  { id:'ev_pioneer', cat:'fleet', name:'新能源先锋', desc:'拥有5辆混动车/电车', icon:'🌱', check: function(){ return gameState.ownedVehicles.filter(function(v){ return v.fuelType==='electric'||v.fuelType==='hybrid'; }).length >= 5; }, reward: { reputation: 10 }, claimed: false },
  { id:'type_collector', cat:'fleet', name:'全类型收藏', desc:'拥有7种不同车型', icon:'🏆', check: function(){ var types = {}; gameState.ownedVehicles.forEach(function(v){ types[v.type]=1; }); return Object.keys(types).length >= 7; }, reward: { cash: 100000 }, claimed: false },

  { id:'first_order', cat:'business', name:'第一单', desc:'完成第一个订单', icon:'📝', check: function(){ return gameState.orderHistory && gameState.orderHistory.length >= 1; }, reward: { cash: 5000 }, claimed: false },
  { id:'orders_50', cat:'business', name:'稳定经营', desc:'完成50个订单', icon:'📊', check: function(){ return gameState.orderHistory && gameState.orderHistory.length >= 50; }, reward: { cash: 50000 }, claimed: false },
  { id:'orders_200', cat:'business', name:'生意兴隆', desc:'完成200个订单', icon:'📈', check: function(){ return gameState.orderHistory && gameState.orderHistory.length >= 200; }, reward: { cash: 200000 }, claimed: false },
  { id:'orders_500', cat:'business', name:'行业巨头', desc:'完成500个订单', icon:'👑', check: function(){ return gameState.orderHistory && gameState.orderHistory.length >= 500; }, reward: { cash: 500000, reputation: 25 }, claimed: false },
  { id:'revenue_1m', cat:'business', name:'百万营收', desc:'累计收入超过100万', icon:'💵', check: function(){ return gameState.totalRevenue >= 1000000; }, reward: { reputation: 10 }, claimed: false },
  { id:'revenue_10m', cat:'business', name:'千万营收', desc:'累计收入超过1000万', icon:'💰', check: function(){ return gameState.totalRevenue >= 10000000; }, reward: { reputation: 25 }, claimed: false },
  { id:'cash_5m', cat:'business', name:'现金充裕', desc:'现金超过500万', icon:'🏦', check: function(){ return gameState.cash >= 5000000; }, reward: { reputation: 10 }, claimed: false },
  { id:'outlet_3', cat:'business', name:'连锁经营', desc:'拥有3个网点', icon:'🏢', check: function(){ return gameState.outlets.filter(function(o){return o.owned;}).length >= 3; }, reward: { cash: 200000 }, claimed: false },
  { id:'outlet_5', cat:'business', name:'全城覆盖', desc:'拥有5个网点', icon:'🌍', check: function(){ return gameState.outlets.filter(function(o){return o.owned;}).length >= 5; }, reward: { cash: 500000, reputation: 20 }, claimed: false },
  { id:'profit_30', cat:'business', name:'持续盈利', desc:'连续30天盈利', icon:'📈', check: function(){ return gameState.consecutiveProfitDays >= 30; }, reward: { cash: 100000 }, claimed: false },

  { id:'member_10', cat:'service', name:'会员基础', desc:'拥有10名会员', icon:'👤', check: function(){ return gameState.members && gameState.members.length >= 10; }, reward: { cash: 20000 }, claimed: false },
  { id:'member_50', cat:'service', name:'会员俱乐部', desc:'拥有50名会员', icon:'👥', check: function(){ return gameState.members && gameState.members.length >= 50; }, reward: { cash: 100000 }, claimed: false },
  { id:'satisfaction_90', cat:'service', name:'客户之友', desc:'满意度达到90', icon:'😊', check: function(){ return typeof getOverallSatisfaction === 'function' && getOverallSatisfaction() >= 90; }, reward: { reputation: 15 }, claimed: false },
  { id:'service_income_100k', cat:'service', name:'增值服务达人', desc:'增值服务总收入超10万', icon:'🏷️', check: function(){ return gameState.serviceStats && gameState.serviceStats.total && gameState.serviceStats.total.totalIncome >= 100000; }, reward: { cash: 50000 }, claimed: false },

  { id:'facility_5', cat:'facility', name:'设施齐全', desc:'安装5个设施', icon:'🏗️', check: function(){ var total=0; gameState.outlets.forEach(function(o){ total+=(o.facilities||[]).length; }); return total >= 5; }, reward: { cash: 30000 }, claimed: false },
  { id:'facility_all', cat:'facility', name:'设施大满贯', desc:'安装全部14种设施', icon:'🏆', check: function(){ var all = new Set(); gameState.outlets.forEach(function(o){ (o.facilities||[]).forEach(function(f){ all.add(f); }); }); return all.size >= 14; }, reward: { cash: 200000, reputation: 15 }, claimed: false },
  { id:'parking_max', cat:'facility', name:'车位大师', desc:'任一网点停车位扩建满', icon:'🅿️', check: function(){ return gameState.outlets.some(function(o){ return o.parkingSpots && (o.parkingSpots.customer >= 20 || o.parkingSpots.internal >= 30); }); }, reward: { cash: 50000 }, claimed: false },
  { id:'decor_all', cat:'facility', name:'室内设计师', desc:'购买全部装饰', icon:'🌿', check: function(){ return gameState.decorations && gameState.decorations.length >= 3; }, reward: { reputation: 10 }, claimed: false },

  { id:'staff_5', cat:'staff', name:'小团队', desc:'拥有5名员工', icon:'👔', check: function(){ return gameState.employees && gameState.employees.length >= 5; }, reward: { cash: 20000 }, claimed: false },
  { id:'staff_15', cat:'staff', name:'大团队', desc:'拥有15名员工', icon:'👥', check: function(){ return gameState.employees && gameState.employees.length >= 15; }, reward: { cash: 100000 }, claimed: false },
  { id:'staff_morale', cat:'staff', name:'士气高昂', desc:'平均士气>80', icon:'🔥', check: function(){ if(!gameState.employees||gameState.employees.length===0) return false; var avg=gameState.employees.reduce(function(s,e){return s+(e.morale||50);},0)/gameState.employees.length; return avg>=80; }, reward: { reputation: 10 }, claimed: false },

  { id:'day_100', cat:'special', name:'百日经营', desc:'经营100天', icon:'📅', check: function(){ return gameState.currentDay >= 100; }, reward: { cash: 100000 }, claimed: false },
  { id:'day_365', cat:'special', name:'周年庆典', desc:'经营365天', icon:'🎂', check: function(){ return gameState.currentDay >= 365; }, reward: { cash: 500000, reputation: 30 }, claimed: false },
  { id:'survive_crisis', cat:'special', name:'危机幸存者', desc:'现金曾低于1万后恢复到50万', icon:'💪', check: function(){ return gameState._hadCrisis && gameState.cash >= 500000; }, reward: { reputation: 20 }, claimed: false },
  { id:'speed_demon', cat:'special', name:'速度与激情', desc:'单日完成10个订单', icon:'⚡', check: function(){ var today = (gameState.orderHistory||[]).filter(function(o){ return o.acceptedDay === gameState.currentDay; }).length; return today >= 10; }, reward: { cash: 50000 }, claimed: false }
];

var TECH_TREE = {
  branches: {
    efficiency: {
      name: '运营效率', icon: '⚙️', color: '#3b82f6',
      techs: [
        { id: 'fast_checkin', name: '快速入住', desc: '订单处理速度+15%', cost: 50000, researchDays: 3, requires: [], effect: { orderSpeedBonus: 0.15 } },
        { id: 'auto_dispatch', name: '智能调度', desc: '车辆调度时间-30%', cost: 80000, researchDays: 5, requires: ['fast_checkin'], effect: { dispatchSpeedBonus: 0.3 } },
        { id: 'ai_pricing', name: 'AI动态定价', desc: '收入+8%', cost: 150000, researchDays: 7, requires: ['auto_dispatch'], effect: { incomeBonus: 0.08 } },
        { id: 'auto_pilot', name: '无人驾驶调度', desc: '调度成本-50%', cost: 300000, researchDays: 10, requires: ['ai_pricing'], effect: { dispatchCostReduction: 0.5 } }
      ]
    },
    comfort: {
      name: '客户体验', icon: '❤️', color: '#f472b6',
      techs: [
        { id: 'loyalty_prog', name: '忠诚度计划', desc: '会员复购率+20%', cost: 40000, researchDays: 3, requires: [], effect: { memberReturnBonus: 0.2 } },
        { id: 'premium_service', name: '尊享服务', desc: '满意度+10', cost: 80000, researchDays: 5, requires: ['loyalty_prog'], effect: { satisfactionBonus: 10 } },
        { id: 'smart_recommend', name: '智能推荐', desc: '增值服务购买率+25%', cost: 120000, researchDays: 7, requires: ['premium_service'], effect: { serviceProbBonus: 0.25 } },
        { id: 'concierge', name: '私人管家', desc: 'VIP客户收入+30%', cost: 250000, researchDays: 10, requires: ['smart_recommend'], effect: { vipIncomeBonus: 0.3 } }
      ]
    },
    green: {
      name: '绿色能源', icon: '🌱', color: '#4ade80',
      techs: [
        { id: 'solar_panel', name: '太阳能充电', desc: '充电成本-30%', cost: 60000, researchDays: 4, requires: [], effect: { chargeCostReduction: 0.3 } },
        { id: 'regen_brake', name: '能量回收', desc: '电动车续航+20%', cost: 100000, researchDays: 5, requires: ['solar_panel'], effect: { evRangeBonus: 0.2 } },
        { id: 'carbon_credit', name: '碳积分交易', desc: '每日额外收入+2%', cost: 180000, researchDays: 8, requires: ['regen_brake'], effect: { dailyIncomeBonus: 0.02 } },
        { id: 'green_brand', name: '绿色品牌', desc: '声誉+30, 新能源客户+40%', cost: 300000, researchDays: 10, requires: ['carbon_credit'], effect: { reputationBonus: 30, evCustomerBonus: 0.4 } }
      ]
    },
    expansion: {
      name: '扩张战略', icon: '🌍', color: '#fbbf24',
      techs: [
        { id: 'market_research', name: '市场调研', desc: '解锁竞品分析', cost: 30000, researchDays: 2, requires: [], effect: { unlockRivalInfo: true } },
        { id: 'brand_franchise', name: '品牌加盟', desc: '新网点成本-20%', cost: 100000, researchDays: 5, requires: ['market_research'], effect: { outletCostReduction: 0.2 } },
        { id: 'cross_city', name: '跨城运营', desc: '解锁新城市', cost: 200000, researchDays: 7, requires: ['brand_franchise'], effect: { unlockNewCity: true } },
        { id: 'global_chain', name: '全球连锁', desc: '所有收入+15%', cost: 500000, researchDays: 14, requires: ['cross_city'], effect: { globalIncomeBonus: 0.15 } }
      ]
    }
  }
};

var RIVAL_COMPANIES = [
  { id: 'speed_rent', name: '速达租车', style: 'aggressive', color: '#ef4444', icon: '🔴', baseStrength: 0.3 },
  { id: 'green_drive', name: '绿行出行', style: 'eco', color: '#22c55e', icon: '🟢', baseStrength: 0.2 },
  { id: 'luxury_wheels', name: '尊轮豪车', style: 'premium', color: '#a855f7', icon: '🟣', baseStrength: 0.15 }
];

var DAILY_CHALLENGES_POOL = [
  { id: 'earn_50k', desc: '单日收入超过5万', target: 50000, type: 'income', reward: { cash: 20000 }, difficulty: 1 },
  { id: 'earn_100k', desc: '单日收入超过10万', target: 100000, type: 'income', reward: { cash: 50000 }, difficulty: 2 },
  { id: 'orders_5', desc: '完成5个订单', target: 5, type: 'orders', reward: { cash: 15000 }, difficulty: 1 },
  { id: 'orders_8', desc: '完成8个订单', target: 8, type: 'orders', reward: { cash: 30000, reputation: 3 }, difficulty: 2 },
  { id: 'service_3', desc: '售出3次增值服务', target: 3, type: 'services', reward: { cash: 10000 }, difficulty: 1 },
  { id: 'no_reject', desc: '不拒绝任何订单', target: 0, type: 'no_reject', reward: { reputation: 5 }, difficulty: 1 },
  { id: 'member_signup', desc: '新增2名会员', target: 2, type: 'members', reward: { cash: 15000 }, difficulty: 2 },
  { id: 'maintain_morale', desc: '所有员工士气>60', target: 60, type: 'morale', reward: { cash: 10000 }, difficulty: 1 }
];

var STORY_EVENTS = [
  { id: 'celebrity', name: '名人租车', desc: '一位知名明星来租车！如果服务好，品牌曝光大增。', icon: '🌟', probability: 0.02,
    choices: [
      { text: '提供VIP升级（花费5000）', cost: 5000, outcome: { reputation: 15, cashBonus: 0 }, msg: '🌟 明星在社交媒体推荐了你们！声誉+15' },
      { text: '正常服务', cost: 0, outcome: { reputation: 3, cashBonus: 0 }, msg: '🌟 明星正常租车离开，声誉+3' }
    ]
  },
  { id: 'flood', name: '暴雨预警', desc: '气象台发布暴雨预警，可能影响运营。', icon: '🌧️', probability: 0.03,
    choices: [
      { text: '购买车辆保险（花费10000）', cost: 10000, outcome: { reputation: 5, cashBonus: 0 }, msg: '🌧️ 提前投保，客户感到安心，声誉+5' },
      { text: '忽略预警', cost: 0, outcome: { reputation: -5, cashBonus: -20000 }, msg: '🌧️ 暴雨导致车辆受损，维修费2万，声誉-5' }
    ]
  },
  { id: 'expo', name: '展会商机', desc: '大型展会即将举办，商务客户需求暴增！', icon: '🎪', probability: 0.025,
    choices: [
      { text: '赞助展会（花费30000）', cost: 30000, outcome: { reputation: 10, cashBonus: 50000 }, msg: '🎪 展会赞助带来大量订单！收入+5万，声誉+10' },
      { text: '仅准备更多车辆', cost: 0, outcome: { reputation: 0, cashBonus: 20000 }, msg: '🎪 展会带来一些订单，收入+2万' }
    ]
  },
  { id: 'scandal', name: '竞品丑闻', desc: '竞争对手被曝出安全隐患！', icon: '📰', probability: 0.015,
    choices: [
      { text: '借机宣传安全标准（花费5000）', cost: 5000, outcome: { reputation: 20, cashBonus: 30000 }, msg: '📰 宣传效果极佳！客户转向你们，声誉+20' },
      { text: '保持沉默', cost: 0, outcome: { reputation: 5, cashBonus: 10000 }, msg: '📰 部分客户自然转向你们，声誉+5' }
    ]
  },
  { id: 'employee_star', name: '员工之星', desc: '一名员工表现突出，获得行业认可。', icon: '🏅', probability: 0.02,
    choices: [
      { text: '颁发奖金（花费8000）', cost: 8000, outcome: { reputation: 8, cashBonus: 0 }, msg: '🏅 员工士气大振！声誉+8' },
      { text: '公开表彰', cost: 0, outcome: { reputation: 3, cashBonus: 0 }, msg: '🏅 员工受到鼓舞，声誉+3' }
    ]
  },
  { id: 'gov_contract', name: '政府招标', desc: '政府需要长期租车服务，这是一笔大单！', icon: '🏛️', probability: 0.01,
    choices: [
      { text: '投标（花费20000保证金）', cost: 20000, outcome: { reputation: 25, cashBonus: 100000 }, msg: '🏛️ 中标！政府合同带来10万收入，声誉+25' },
      { text: '放弃', cost: 0, outcome: { reputation: 0, cashBonus: 0 }, msg: '🏛️ 放弃了这次机会' }
    ]
  }
];

var PRESTIGE_PERKS = [
  { id: 'xp_boost_1', name: '经验加速 I', desc: '科技研究速度+20%', cost: 1, effect: { researchSpeedBonus: 0.2 } },
  { id: 'xp_boost_2', name: '经验加速 II', desc: '科技研究速度+40%', cost: 2, effect: { researchSpeedBonus: 0.4 }, requires: ['xp_boost_1'] },
  { id: 'start_cash', name: '启动资金+', desc: '重生后初始现金+50万', cost: 1, effect: { startCashBonus: 500000 } },
  { id: 'start_outlet', name: '网点传承', desc: '重生后自动拥有2个网点', cost: 2, effect: { startOutlets: 2 }, requires: ['start_cash'] },
  { id: 'rep_retain', name: '声誉传承', desc: '重生保留50%声誉', cost: 2, effect: { reputationRetain: 0.5 } },
  { id: 'tech_retain', name: '科技传承', desc: '重生保留1项科技', cost: 3, effect: { techRetain: 1 }, requires: ['rep_retain'] },
  { id: 'vehicle_discount', name: '购车折扣', desc: '购车费用-15%', cost: 1, effect: { vehicleDiscount: 0.15 } },
  { id: 'facility_discount', name: '设施折扣', desc: '设施购买费用-20%', cost: 2, effect: { facilityDiscount: 0.2 }, requires: ['vehicle_discount'] },
  { id: 'golden_touch', name: '点石成金', desc: '所有收入+10%', cost: 3, effect: { globalIncomeBonus: 0.1 }, requires: ['facility_discount'] }
];

function initProgressionState() {
  if (!gameState.achievements) gameState.achievements = {};
  if (!gameState.techResearched) gameState.techResearched = {};
  if (!gameState.techResearching) gameState.techResearching = null;
  if (!gameState.rivals) {
    gameState.rivals = RIVAL_COMPANIES.map(function(r) {
      return { id: r.id, strength: r.baseStrength, marketShare: 0.1, vehicles: 5, reputation: 30 };
    });
  }
  if (!gameState.dailyChallenge) gameState.dailyChallenge = null;
  if (!gameState.weeklyProgress) gameState.weeklyProgress = { orders: 0, income: 0, day: 0 };
  if (!gameState.prestigeLevel) gameState.prestigeLevel = 0;
  if (!gameState.prestigePoints) gameState.prestigePoints = 0;
  if (!gameState.prestigePerks) gameState.prestigePerks = [];
  if (!gameState.storyEventActive) gameState.storyEventActive = null;
  if (!gameState.totalPrestiges) gameState.totalPrestiges = 0;
  if (gameState._hadCrisis === undefined) gameState._hadCrisis = false;
}

function checkAchievements() {
  var newUnlocked = [];
  ACHIEVEMENTS.forEach(function(a) {
    if (gameState.achievements[a.id]) return;
    try {
      if (a.check()) {
        gameState.achievements[a.id] = { unlocked: true, claimed: false, day: gameState.currentDay };
        newUnlocked.push(a);
        addMessage('🏆 成就解锁: ' + a.icon + ' ' + a.name + ' — ' + a.desc, 'good');
      }
    } catch(e) {}
  });
  return newUnlocked;
}

function claimAchievement(achievementId) {
  var record = gameState.achievements[achievementId];
  if (!record || record.claimed) return { ok: false, reason: '无法领取' };
  var ach = ACHIEVEMENTS.find(function(a){ return a.id === achievementId; });
  if (!ach) return { ok: false, reason: '成就不存在' };
  record.claimed = true;
  if (ach.reward.cash) { gameState.cash += ach.reward.cash; }
  if (ach.reward.reputation) { addReputation(ach.reward.reputation); }
  addMessage('🎁 领取成就奖励: ' + ach.icon + ' ' + ach.name + (ach.reward.cash ? ' +' + formatCurrency(ach.reward.cash) : '') + (ach.reward.reputation ? ' 声誉+' + ach.reward.reputation : ''), 'good');
  updateUI(); saveGame();
  return { ok: true };
}

function getAchievementProgress() {
  var total = ACHIEVEMENTS.length;
  var unlocked = Object.keys(gameState.achievements || {}).length;
  var claimed = 0;
  Object.keys(gameState.achievements || {}).forEach(function(k) { if (gameState.achievements[k].claimed) claimed++; });
  return { total: total, unlocked: unlocked, claimed: claimed };
}

function startResearch(techId) {
  if (gameState.techResearching) return { ok: false, reason: '正在研究其他科技' };
  if (gameState.techResearched[techId]) return { ok: false, reason: '已研究完成' };
  var tech = null;
  Object.keys(TECH_TREE.branches).forEach(function(bk) {
    TECH_TREE.branches[bk].techs.forEach(function(t) { if (t.id === techId) tech = t; });
  });
  if (!tech) return { ok: false, reason: '科技不存在' };
  for (var i = 0; i < tech.requires.length; i++) {
    if (!gameState.techResearched[tech.requires[i]]) return { ok: false, reason: '前置科技未完成' };
  }
  if (gameState.cash < tech.cost) return { ok: false, reason: '资金不足' };
  gameState.cash -= tech.cost;
  var speedBonus = getPrestigeEffect('researchSpeedBonus');
  var days = Math.max(1, Math.ceil(tech.researchDays * (1 - speedBonus)));
  gameState.techResearching = { id: techId, startDay: gameState.currentDay, totalDays: days, remaining: days };
  addMessage('🔬 开始研究: ' + tech.name + '（' + days + '天）', 'good');
  updateUI(); saveGame();
  return { ok: true };
}

function processResearch() {
  if (!gameState.techResearching) return;
  gameState.techResearching.remaining--;
  if (gameState.techResearching.remaining <= 0) {
    var techId = gameState.techResearching.id;
    gameState.techResearched[techId] = true;
    var tech = null;
    Object.keys(TECH_TREE.branches).forEach(function(bk) {
      TECH_TREE.branches[bk].techs.forEach(function(t) { if (t.id === techId) tech = t; });
    });
    gameState.techResearching = null;
    if (tech) {
      addMessage('🔬 研究完成: ' + tech.icon + ' ' + tech.name + ' — ' + tech.desc, 'good');
      if (tech.effect.reputationBonus) addReputation(tech.effect.reputationBonus);
    }
  }
}

function isTechResearched(techId) {
  return !!gameState.techResearched[techId];
}

function getTechEffect(effectKey) {
  var total = 0;
  Object.keys(gameState.techResearched || {}).forEach(function(tid) {
    if (!gameState.techResearched[tid]) return;
    var tech = null;
    Object.keys(TECH_TREE.branches).forEach(function(bk) {
      TECH_TREE.branches[bk].techs.forEach(function(t) { if (t.id === tid) tech = t; });
    });
    if (tech && tech.effect[effectKey]) total += tech.effect[effectKey];
  });
  return total;
}

function getPrestigeEffect(effectKey) {
  var total = 0;
  (gameState.prestigePerks || []).forEach(function(pid) {
    var perk = PRESTIGE_PERKS.find(function(p){ return p.id === pid; });
    if (perk && perk.effect[effectKey]) total += perk.effect[effectKey];
  });
  return total;
}

function processRivals() {
  if (gameState.currentDay % 7 !== 0) return;
  gameState.rivals.forEach(function(rival) {
    var growth = 0.01 + Math.random() * 0.03;
    if (rival.strength < 0.8) rival.strength += growth;
    rival.vehicles = Math.floor(rival.strength * 50);
    rival.marketShare = Math.min(0.3, rival.strength * 0.3);
    rival.reputation = Math.floor(20 + rival.strength * 60);
  });
}

function getRivalInfo(rivalId) {
  var rival = (gameState.rivals || []).find(function(r){ return r.id === rivalId; });
  if (!rival) return null;
  var template = RIVAL_COMPANIES.find(function(r){ return r.id === rivalId; });
  return {
    name: template.name,
    icon: template.icon,
    color: template.color,
    style: template.style,
    strength: rival.strength,
    vehicles: rival.vehicles,
    marketShare: rival.marketShare,
    reputation: rival.reputation
  };
}

function generateDailyChallenge() {
  if (gameState.dailyChallenge && gameState.dailyChallenge.day === gameState.currentDay) return;
  var available = DAILY_CHALLENGES_POOL.filter(function(c) {
    return c.difficulty <= Math.min(3, 1 + Math.floor(gameState.currentDay / 30));
  });
  if (available.length === 0) return;
  var challenge = available[Math.floor(Math.random() * available.length)];
  gameState.dailyChallenge = {
    id: challenge.id,
    desc: challenge.desc,
    type: challenge.type,
    target: challenge.target,
    reward: challenge.reward,
    difficulty: challenge.difficulty,
    day: gameState.currentDay,
    progress: 0,
    completed: false,
    claimed: false
  };
}

function updateDailyChallengeProgress(type, value) {
  if (!gameState.dailyChallenge || gameState.dailyChallenge.completed) return;
  if (gameState.dailyChallenge.type !== type) return;
  if (type === 'income') {
    gameState.dailyChallenge.progress = gameState.todayIncome || 0;
  } else if (type === 'orders') {
    gameState.dailyChallenge.progress = (gameState.outletOrderCounts ? Object.values(gameState.outletOrderCounts).reduce(function(s,v){return s+v;},0) : 0);
  } else if (type === 'services') {
    gameState.dailyChallenge.progress = (gameState.serviceStats && gameState.serviceStats.today) ? (gameState.serviceStats.today.insurance + gameState.serviceStats.today.wifi + gameState.serviceStats.today.gps + gameState.serviceStats.today.delivery + gameState.serviceStats.today.refuel + gameState.serviceStats.today.recharge) : 0;
  } else if (type === 'members') {
    gameState.dailyChallenge.progress = value || 0;
  } else if (type === 'morale') {
    var avg = (gameState.employees && gameState.employees.length > 0) ? gameState.employees.reduce(function(s,e){return s+(e.morale||50);},0)/gameState.employees.length : 0;
    gameState.dailyChallenge.progress = Math.round(avg);
  } else if (type === 'no_reject') {
    gameState.dailyChallenge.progress = 0;
  }
  if (gameState.dailyChallenge.progress >= gameState.dailyChallenge.target) {
    gameState.dailyChallenge.completed = true;
    addMessage('🎯 每日挑战完成: ' + gameState.dailyChallenge.desc, 'good');
  }
}

function claimDailyChallenge() {
  if (!gameState.dailyChallenge || !gameState.dailyChallenge.completed || gameState.dailyChallenge.claimed) return;
  gameState.dailyChallenge.claimed = true;
  var r = gameState.dailyChallenge.reward;
  if (r.cash) gameState.cash += r.cash;
  if (r.reputation) addReputation(r.reputation);
  addMessage('🎁 每日挑战奖励: ' + (r.cash ? formatCurrency(r.cash) : '') + (r.reputation ? ' 声誉+' + r.reputation : ''), 'good');
  updateUI(); saveGame();
}

function checkStoryEvents() {
  if (gameState.storyEventActive) return;
  STORY_EVENTS.forEach(function(evt) {
    if (Math.random() < evt.probability) {
      gameState.storyEventActive = { id: evt.id, name: evt.name, desc: evt.desc, icon: evt.icon, choices: evt.choices };
      addMessage(evt.icon + ' 特殊事件: ' + evt.name + ' — ' + evt.desc, 'good');
    }
  });
}

function resolveStoryEvent(choiceIndex) {
  if (!gameState.storyEventActive) return;
  var choice = gameState.storyEventActive.choices[choiceIndex];
  if (!choice) return;
  if (choice.cost > 0 && gameState.cash < choice.cost) {
    addMessage('❌ 资金不足，无法选择此选项', 'bad');
    return;
  }
  gameState.cash -= choice.cost;
  if (choice.outcome.reputation) addReputation(choice.outcome.reputation);
  if (choice.outcome.cashBonus) gameState.cash += choice.outcome.cashBonus;
  addMessage(choice.msg, choice.outcome.reputation >= 0 ? 'good' : 'bad');
  gameState.storyEventActive = null;
  updateUI(); saveGame();
}

function dismissStoryEvent() {
  gameState.storyEventActive = null;
  saveGame();
}

function canPrestige() {
  return gameState.reputation >= 80 && gameState.currentDay >= 100;
}

function getPrestigePointsEarned() {
  return Math.floor(gameState.reputation / 20) + Math.floor(gameState.currentDay / 100) + (gameState.outlets.filter(function(o){return o.owned&&o.level>=5;}).length * 2);
}

function doPrestige() {
  if (!canPrestige()) return { ok: false, reason: '条件不满足（需声誉80+且经营100天+）' };
  var points = getPrestigePointsEarned();
  gameState.prestigePoints = (gameState.prestigePoints || 0) + points;
  gameState.prestigeLevel = (gameState.prestigeLevel || 0) + 1;
  gameState.totalPrestiges = (gameState.totalPrestiges || 0) + 1;
  var retainedPerks = gameState.prestigePerks || [];
  var retainedTechs = {};
  if (getPrestigeEffect('techRetain') > 0) {
    var researched = Object.keys(gameState.techResearched || {});
    for (var i = 0; i < Math.min(getPrestigeEffect('techRetain'), researched.length); i++) {
      retainedTechs[researched[i]] = true;
    }
  }
  var retainedRep = Math.floor(gameState.reputation * (getPrestigeEffect('reputationRetain') || 0));
  var startCash = 1000000 + (getPrestigeEffect('startCashBonus') || 0);
  var startOutlets = 1 + (getPrestigeEffect('startOutlets') || 0);
  gameState.cash = startCash;
  gameState.currentDay = 1;
  gameState.ownedVehicles = [];
  gameState.pendingOrders = [];
  gameState.orderHistory = [];
  gameState.outlets = [Object.assign({}, defaultOutletState)];
  if (startOutlets >= 2 && OUTLET_CONFIGS.length >= 2) {
    var second = Object.assign({}, defaultOutletState);
    second.id = 1; second.owned = true;
    gameState.outlets.push(second);
  }
  gameState.reputation = retainedRep;
  gameState.techResearched = retainedTechs;
  gameState.techResearching = null;
  gameState.prestigePerks = retainedPerks;
  gameState.achievements = {};
  gameState.rivals = RIVAL_COMPANIES.map(function(r) {
    return { id: r.id, strength: r.baseStrength * (1 + gameState.totalPrestiges * 0.2), marketShare: 0.1, vehicles: 5, reputation: 30 };
  });
  gameState.dailyChallenge = null;
  gameState.storyEventActive = null;
  gameState.consecutiveProfitDays = 0;
  gameState.totalRevenue = 0;
  gameState.totalDaysRented = 0;
  gameState.financials = { dailyRevenue: [], dailyExpenses: [], dailyProfit: [] };
  gameState.employees = [];
  gameState.members = [];
  gameState.loans = [];
  gameState.activeEvents = [];
  gameState.interiorDecorUnlocked = false;
  gameState.decorations = [];
  gameState.autoRecommendReservation = false;
  addMessage('🔄 声望重生！获得 ' + points + ' 声望点数，当前等级: ' + gameState.prestigeLevel, 'good');
  updateUI(); saveGame();
  return { ok: true };
}

function purchasePrestigePerk(perkId) {
  var perk = PRESTIGE_PERKS.find(function(p){ return p.id === perkId; });
  if (!perk) return { ok: false, reason: '天赋不存在' };
  if (gameState.prestigePerks.indexOf(perkId) !== -1) return { ok: false, reason: '已拥有' };
  if (perk.requires) {
    for (var i = 0; i < perk.requires.length; i++) {
      if (gameState.prestigePerks.indexOf(perk.requires[i]) === -1) return { ok: false, reason: '前置天赋未解锁' };
    }
  }
  if (gameState.prestigePoints < perk.cost) return { ok: false, reason: '声望点数不足' };
  gameState.prestigePoints -= perk.cost;
  gameState.prestigePerks.push(perkId);
  addMessage('✨ 解锁天赋: ' + perk.name + ' — ' + perk.desc, 'good');
  updateUI(); saveGame();
  return { ok: true };
}

function processProgressionDaily() {
  initProgressionState();
  if (gameState.cash < 10000) gameState._hadCrisis = true;
  processResearch();
  processRivals();
  generateDailyChallenge();
  checkStoryEvents();
  checkAchievements();
  updateDailyChallengeProgress('income', 0);
  updateDailyChallengeProgress('orders', 0);
  updateDailyChallengeProgress('services', 0);
  updateDailyChallengeProgress('morale', 0);
}
