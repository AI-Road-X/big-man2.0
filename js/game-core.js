var SAVE_KEY = 'rentalCompanyGame_v3';

var OUTLET_CONFIGS = [
  { id:0, name:'总部网点', citySize:'large', cityLabel:'大型城市', position:{x:0,z:0}, unlockCost:0 },
  { id:1, name:'城东分店', citySize:'medium', cityLabel:'中型城市', position:{x:55,z:0}, unlockCost:500000 },
  { id:2, name:'城西分店', citySize:'small', cityLabel:'小型城市', position:{x:-55,z:0}, unlockCost:300000 },
  { id:3, name:'城北分店', citySize:'large', cityLabel:'大型城市', position:{x:0,z:55}, unlockCost:800000 },
  { id:4, name:'城南分店', citySize:'medium', cityLabel:'中型城市', position:{x:0,z:-55}, unlockCost:600000 }
];

var OUTLET_LEVELS = [
  { level:1, capacity:20, upgradeCost:0 },
  { level:2, capacity:35, upgradeCost:200000 },
  { level:3, capacity:50, upgradeCost:500000 },
  { level:4, capacity:75, upgradeCost:1200000 },
  { level:5, capacity:100, upgradeCost:2500000 }
];

var PARKING_CONFIG = {
  customer: { base: 5, perUpgrade: 2, max: 20, upgradeCost: 10000, dailyRent: 5 },
  internal: { base: 10, perUpgrade: 5, max: 30, upgradeCost: 20000, dailyRent: 5 }
};

var PARKING_PRESSURE_THRESHOLD = 0.9;
var PARKING_EMERGENCY_FEE = 5000;
var PARKING_RESERVATION_FEE = 50;

var CITY_SIZE_MULTIPLIERS = { small:0.6, medium:1.0, large:1.5 };

var CUSTOMER_TYPE_PREFS = {
  business: { '轿车':3,'SUV':1.5,'MPV':2,'豪华车':2.5,'跑车':1,'超跑':0.5,'紧凑型':1 },
  tourist:  { '轿车':1,'SUV':3,'MPV':2.5,'豪华车':1,'跑车':1.5,'超跑':0.5,'紧凑型':2 }
};

var CUSTOMER_NAMES_BUSINESS = ['王经理','李总','张董','陈主管','刘总监','赵助理','周客户','吴商务','郑代表','孙顾问','朱行长','马主任','胡总裁','林经理','何总监'];
var CUSTOMER_NAMES_TOURIST = ['小王','阿李','张同学','陈先生','刘女士','赵一家','周游客','吴旅人','郑背包客','孙家庭','朱度假','马旅行','胡探险','林观光','何周末'];

var SERVICE_PRICES = {
  insurance: 50,
  wifi: 20,
  gps: 15,
  refuelLiters: 20,
  rechargeKwh: 30,
  delivery: 80,
  refuelMargin: 1.0,
  rechargeMargin: 1.0
};

var SERVICE_PROBABILITIES = {
  insurance: 0.30,
  wifi: 0.25,
  gps: 0.20,
  delivery: 0.10,
  refuel: 0.15,
  recharge: 0.15
};

var ENERGY_UPGRADE_COST = 5000;
var ENERGY_UPGRADE_AMOUNT = 2000;
var ENERGY_MAX_CAPACITY = 50000;
var ENERGY_LOW_THRESHOLD = 500;

var defaultOutletState = {
  id: 0, level: 1, owned: true, facilities: [], disabledFacilities: [], brokenFacilities: {},
  upgradeProgress: { profitableDays: 0, maxProfit: 0 },
  parkingSpots: { customer: 5, internal: 10 },
  parkingUpgradeLevel: { customer: 0, internal: 0 },
  facilityZones: {},
  occupiedCustomerSpots: 0,
  reservedSpots: 0,
  parkingPressureDays: 0,
  lastReservationRec: false
};

var defaultGameState = {
  cash: 1000000,
  currentDay: 1,
  outlets: [Object.assign({}, defaultOutletState)],
  autoRecommendReservation: false,
  interiorDecorUnlocked: false,
  decorations: [],
  customerReviews: [],
  npsScore: 50,
  advertising: { campaigns: [], dailySpend: 0 },
  ownedVehicles: [],
  pendingOrders: [],
  todayIncome: 0,
  todayExpense: 0,
  messages: [],
  usedCarMarketList: [],
  transfers: [],
  outletOrderCounts: {},
  activeEvents: [],
  marketCoefficient: 1.0,
  rateMultipliers: {},
  lastCompetitorUpdate: 1,
  tutorialStep: 0,
  totalDaysRented: 0,
  totalRevenue: 0,
  energy: {
    oilStorage: 5000,
    batteryStorage: 5000,
    oilPrice: 5.0,
    electricityPrice: 0.8,
    maxOilCapacity: 10000,
    maxBatteryCapacity: 10000,
    prevOilPrice: 5.0,
    prevElectricityPrice: 0.8
  },
  serviceStats: {
    today: { insurance:0, wifi:0, gps:0, delivery:0, refuel:0, recharge:0, totalIncome:0 },
    total: { insurance:0, wifi:0, gps:0, delivery:0, refuel:0, recharge:0, totalIncome:0 }
  },
  members: [],
  servicePricing: {
    insurance: 50,
    wifi: 20,
    gps: 15,
    delivery: 80,
    refuelMargin: 1.0,
    rechargeMargin: 1.0
  },
  priceHistory: {
    oil: [],
    electricity: []
  },
  employees: [],
  jobCandidates: [],
  orderHistory: [],
  financials: {
    dailyRevenue: [],
    dailyExpenses: [],
    dailyProfit: []
  },
  loans: [],
  stocks: {
    isPublic: false,
    ticker: 'RENT',
    sharePrice: 0,
    playerShares: 60,
    publicShares: 40,
    totalShares: 100,
    portfolio: [],
    stockHistory: [],
    virtualPrices: {}
  },
  lastTeamBuildingDay: 0,
  companyStage: 1,
  achievedMilestones: [],
  reputation: 50,
  unlockedCities: ['home'],
  currentCity: 'home',
  gameSpeed: 1,
  brandName: '',
  brandSlogan: '',
  consecutiveProfitDays: 0,
  lastQuarterDay: 0,
  hostileTakeoverRisk: 0
};

var gameState = JSON.parse(JSON.stringify(defaultGameState));

function getOutletState(outletId) {
  return gameState.outlets.find(function(o){ return o.id === outletId; });
}

function getOutletCapacity(outletId) {
  var os = getOutletState(outletId);
  if (!os) return 0;
  var lvl = OUTLET_LEVELS.find(function(l){ return l.level === os.level; }) || OUTLET_LEVELS[0];
  return lvl.capacity;
}

function getVehiclesAtOutlet(outletId) {
  return gameState.ownedVehicles.filter(function(v){ return v.outletId === outletId; });
}

function getAvailableVehiclesAtOutlet(outletId) {
  return gameState.ownedVehicles.filter(function(v){
    return v.outletId === outletId && (!v.rentedUntil || v.rentedUntil < gameState.currentDay) && !isInTransit(v.id);
  });
}

function isInTransit(vehicleId) {
  return gameState.transfers.some(function(t){ return t.vehicleId === vehicleId; });
}

function getDistanceBetweenOutlets(id1, id2) {
  var c1 = OUTLET_CONFIGS.find(function(c){ return c.id === id1; });
  var c2 = OUTLET_CONFIGS.find(function(c){ return c.id === id2; });
  if (!c1 || !c2) return 0;
  return Math.sqrt(Math.pow(c1.position.x - c2.position.x, 2) + Math.pow(c1.position.z - c2.position.z, 2));
}

function formatCurrency(amount) {
  return '$' + Math.round(amount).toLocaleString('en-US');
}

function getGameDate() {
  var startDate = new Date(2023, 0, 1);
  return new Date(startDate.getTime() + (gameState.currentDay - 1) * 86400000);
}

function formatDate(date) {
  return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日';
}

function getWeekDay(date) {
  return ['周日','周一','周二','周三','周四','周五','周六'][date.getDay()];
}

function saveGame() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(gameState)); } catch(e) { console.error('保存失败:', e); }
}

var CHEAT_CODES = {
  'money': { desc: '+100万', fn: function(){ gameState.cash += 1000000; addMessage('💰 +100万','good'); } },
  'cash': { desc: '+50万', fn: function(){ gameState.cash += 500000; addMessage('💰 +50万','good'); } },
  'rich': { desc: '+1000万', fn: function(){ gameState.cash += 10000000; addMessage('💰 +1000万','good'); } },
  'car': { desc: '免费1辆随机车', fn: function(){ var types=Object.keys(VEHICLE_CATALOG); var type=types[Math.floor(Math.random()*types.length)]; var model=VEHICLE_CATALOG[type]; if(model&&model.models){ var m=model.models[Math.floor(Math.random()*model.models.length)]; if(m) purchaseVehicle(type,m.name,0); } addMessage('🚗 免费获得1辆车','good'); } },
  'cars': { desc: '免费5辆随机车', fn: function(){ for(var i=0;i<5;i++){var types=Object.keys(VEHICLE_CATALOG);var type=types[Math.floor(Math.random()*types.length)];var model=VEHICLE_CATALOG[type];if(model&&model.models){var m=model.models[Math.floor(Math.random()*model.models.length)];if(m)purchaseVehicle(type,m.name,0);}} addMessage('🚗 免费获得5辆车','good'); } },
  'level': { desc: '网点+1级', fn: function(){ var os=getOutletState(0); if(os.level<5){os.level++;addMessage('⬆️ 网点Lv.'+os.level,'good');} } },
  'max': { desc: '网点满级', fn: function(){ getOutletState(0).level=5; addMessage('⭐ 网点满级','good'); } },
  'parking': { desc: '停车位满', fn: function(){ var os=getOutletState(0); os.parkingSpots={customer:20,internal:30}; os.parkingUpgradeLevel={customer:8,internal:4}; addMessage('🅿️ 停车位满','good'); } },
  'fuel': { desc: '能源满', fn: function(){ gameState.oilStorage=10000; gameState.elecStorage=10000; if(gameState.energy){gameState.energy.oilStorage=10000;gameState.energy.batteryStorage=10000;} addMessage('⛽ 能源满','good'); } },
  'rep': { desc: '声誉+50', fn: function(){ addReputation(50); addMessage('⭐ 声誉+50','good'); } },
  'fac': { desc: '全部设施', fn: function(){ facilitiesConfig.forEach(function(fc){ if(gameState.outlets[0].facilities.indexOf(fc.id)===-1) gameState.outlets[0].facilities.push(fc.id); }); addMessage('🏗️ 全部设施','good'); } },
  'decor': { desc: '全部装饰', fn: function(){ gameState.interiorDecorUnlocked=true; gameState.decorations=[{outletId:0,id:'plant',name:'绿植',icon:'🪴',satisfactionBonus:2},{outletId:0,id:'aquarium',name:'鱼缸',icon:'🐠',satisfactionBonus:3},{outletId:0,id:'fountain',name:'室内喷泉',icon:'⛲',satisfactionBonus:5}]; addMessage('🌿 全部装饰','good'); } },
  'tech': { desc: '全部科技', fn: function(){ if(typeof TECH_TREE!=='undefined'){Object.keys(TECH_TREE.branches).forEach(function(bk){TECH_TREE.branches[bk].techs.forEach(function(t){gameState.techResearched[t.id]=true;});});addMessage('🔬 全部科技','good');} } },
  'pp': { desc: '+5声望点', fn: function(){ gameState.prestigePoints=(gameState.prestigePoints||0)+5; addMessage('✨ +5声望点','good'); } },
  'rival': { desc: '对手强化', fn: function(){ if(gameState.rivals){gameState.rivals.forEach(function(r){r.strength=Math.min(1,r.strength+0.2);});addMessage('⚔️ 对手强化','good');} } },
  'member': { desc: '+10会员', fn: function(){ if(typeof generateRandomMember==='function'){for(var i=0;i<10;i++){var m=generateRandomMember();if(m)gameState.members.push(m);}} addMessage('👤 +10会员','good'); } },
  'staff': { desc: '+5员工', fn: function(){ var types=['店长','销售员','维修工','司机','洗车工']; for(var i=0;i<5;i++){gameState.employees.push({type:types[Math.floor(Math.random()*types.length)],name:'员工'+Math.floor(Math.random()*1000),morale:70+Math.floor(Math.random()*30),salary:40,outletId:0});} addMessage('👔 +5员工','good'); } },
  'day': { desc: '快进30天', fn: function(){ for(var i=0;i<30;i++){if(typeof nextDay==='function')nextDay();} addMessage('📅 快进30天','good'); } },
  'win': { desc: '直接胜利', fn: function(){ gameState.cash=50000000; gameState.totalRevenue=50000000; gameState.reputation=100; addMessage('🏆 直接胜利','good'); } },
  'reset': { desc: '重置游戏', fn: function(){ localStorage.removeItem(SAVE_KEY); location.reload(); } }
};

function enterCheatCode(code) {
  var c = code.toLowerCase().replace(/\s/g,'');
  var cheat = CHEAT_CODES[c];
  if (cheat) {
    cheat.fn();
    updateUI(); saveGame();
    return true;
  }
  addMessage('❌ 无效作弊码: ' + code, 'bad');
  return false;
}

function loadGame() {
  try {
    var raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      var data = JSON.parse(raw);
      gameState = Object.assign(JSON.parse(JSON.stringify(defaultGameState)), data);
      if (!gameState.transfers) gameState.transfers = [];
      if (!gameState.usedCarMarketList) gameState.usedCarMarketList = [];
      if (!gameState.outletOrderCounts) gameState.outletOrderCounts = {};
      if (!gameState.activeEvents) gameState.activeEvents = [];
      if (!gameState.rateMultipliers) gameState.rateMultipliers = {};
      if (gameState.marketCoefficient === undefined) gameState.marketCoefficient = 1.0;
      if (gameState.lastCompetitorUpdate === undefined) gameState.lastCompetitorUpdate = 1;
      if (gameState.tutorialStep === undefined) gameState.tutorialStep = 0;
      if (!gameState.totalDaysRented) gameState.totalDaysRented = 0;
      if (!gameState.totalRevenue) gameState.totalRevenue = 0;
      if (!gameState.energy) {
        gameState.energy = { oilStorage:5000, batteryStorage:5000, oilPrice:5.0, electricityPrice:0.8, maxOilCapacity:10000, maxBatteryCapacity:10000, prevOilPrice:5.0, prevElectricityPrice:0.8 };
      }
      if (gameState.energy.maxOilCapacity === undefined) gameState.energy.maxOilCapacity = 10000;
      if (gameState.energy.maxBatteryCapacity === undefined) gameState.energy.maxBatteryCapacity = 10000;
      if (gameState.energy.prevOilPrice === undefined) gameState.energy.prevOilPrice = gameState.energy.oilPrice;
      if (gameState.energy.prevElectricityPrice === undefined) gameState.energy.prevElectricityPrice = gameState.energy.electricityPrice;
      if (!gameState.serviceStats) {
        gameState.serviceStats = { today:{insurance:0,wifi:0,gps:0,delivery:0,refuel:0,recharge:0,totalIncome:0}, total:{insurance:0,wifi:0,gps:0,delivery:0,refuel:0,recharge:0,totalIncome:0} };
      }
      if (!gameState.members) gameState.members = [];
      if (!gameState.servicePricing) {
        gameState.servicePricing = { insurance:50, wifi:20, gps:15, delivery:80, refuelMargin:1.0, rechargeMargin:1.0 };
      }
      if (!gameState.priceHistory) gameState.priceHistory = { oil:[], electricity:[] };
      if (!gameState.employees) gameState.employees = [];
      if (!gameState.jobCandidates) gameState.jobCandidates = [];
      if (!gameState.orderHistory) gameState.orderHistory = [];
      if (!gameState.financials) gameState.financials = { dailyRevenue:[], dailyExpenses:[], dailyProfit:[] };
      if (!gameState.loans) gameState.loans = [];
      if (!gameState.stocks) gameState.stocks = { isPublic:false, ticker:'RENT', sharePrice:0, playerShares:60, publicShares:40, totalShares:100, portfolio:[], stockHistory:[], virtualPrices:{} };
      if (!gameState.stocks.virtualPrices) gameState.stocks.virtualPrices = {};
      if (!gameState.lastTeamBuildingDay) gameState.lastTeamBuildingDay = 0;
      if (!gameState.companyStage) gameState.companyStage = 1;
      if (!gameState.achievedMilestones) gameState.achievedMilestones = [];
      if (gameState.reputation === undefined) gameState.reputation = 50;
      if (!gameState.unlockedCities) gameState.unlockedCities = ['home'];
      if (!gameState.currentCity) gameState.currentCity = 'home';
      if (!gameState.gameSpeed) gameState.gameSpeed = 1;
      if (gameState.brandName === undefined) gameState.brandName = '';
      if (gameState.brandSlogan === undefined) gameState.brandSlogan = '';
      if (!gameState.consecutiveProfitDays) gameState.consecutiveProfitDays = 0;
      if (!gameState.lastQuarterDay) gameState.lastQuarterDay = 0;
      if (!gameState.hostileTakeoverRisk) gameState.hostileTakeoverRisk = 0;
      gameState.outlets.forEach(function(o){
        if (!o.facilities) o.facilities = [];
        if (!o.disabledFacilities) o.disabledFacilities = [];
        if (!o.brokenFacilities) o.brokenFacilities = {};
        if (!o.upgradeProgress) o.upgradeProgress = {profitableDays:0,maxProfit:0};
        if (!o.parkingSpots) o.parkingSpots = { customer: PARKING_CONFIG.customer.base, internal: PARKING_CONFIG.internal.base };
        if (!o.parkingUpgradeLevel) o.parkingUpgradeLevel = { customer: 0, internal: 0 };
        if (!o.facilityZones) o.facilityZones = {};
        if (o.occupiedCustomerSpots === undefined) o.occupiedCustomerSpots = 0;
        if (o.reservedSpots === undefined) o.reservedSpots = 0;
        if (o.parkingPressureDays === undefined) o.parkingPressureDays = 0;
        if (o.lastReservationRec === undefined) o.lastReservationRec = false;
      });
      if (gameState.autoRecommendReservation === undefined) gameState.autoRecommendReservation = false;
      if (gameState.interiorDecorUnlocked === undefined) gameState.interiorDecorUnlocked = false;
      if (!gameState.decorations) gameState.decorations = [];
      if (!gameState.customerReviews) gameState.customerReviews = [];
      if (gameState.npsScore === undefined) gameState.npsScore = 50;
      if (!gameState.advertising) gameState.advertising = { campaigns: [], dailySpend: 0 };
      return true;
    }
  } catch(e) { console.error('加载失败:', e); }
  return false;
}

function unlockOutlet(outletId) {
  var cfg = OUTLET_CONFIGS.find(function(c){ return c.id === outletId; });
  if (!cfg || gameState.cash < cfg.unlockCost) return;
  gameState.cash -= cfg.unlockCost;
  gameState.outlets.push({ id: outletId, level: 1, owned: true, facilities: [], disabledFacilities: [], brokenFacilities: {}, upgradeProgress: {profitableDays:0,maxProfit:0} });
  addMessage('解锁新网点：' + cfg.name + '（' + cfg.cityLabel + '）', 'good');
  if (typeof createOutletBuildings === 'function') createOutletBuildings();
  updateUI(); saveGame();
}

function upgradeOutlet(outletId) {
  var os = getOutletState(outletId);
  if (!os) return;
  var nextLevel = OUTLET_LEVELS.find(function(l){ return l.level === os.level + 1; });
  if (!nextLevel || gameState.cash < nextLevel.upgradeCost) return;
  gameState.cash -= nextLevel.upgradeCost;
  os.level = nextLevel.level;
  addMessage(OUTLET_CONFIGS.find(function(c){ return c.id === outletId; }).name + ' 升级到 Lv.' + os.level + '，容量 ' + nextLevel.capacity + ' 辆', 'good');
  updateUI(); saveGame();
}

function upgradeEnergyCapacity(type) {
  var en = gameState.energy;
  if (type === 'oil') {
    if (en.maxOilCapacity >= ENERGY_MAX_CAPACITY) { showToast('油罐已达最大容量', 'error'); return; }
    if (gameState.cash < ENERGY_UPGRADE_COST) { showToast('资金不足！', 'error'); return; }
    gameState.cash -= ENERGY_UPGRADE_COST;
    en.maxOilCapacity += ENERGY_UPGRADE_AMOUNT;
    addMessage('⛽ 油罐容量升级至 ' + en.maxOilCapacity + ' 升', 'good');
  } else {
    if (en.maxBatteryCapacity >= ENERGY_MAX_CAPACITY) { showToast('电池已达最大容量', 'error'); return; }
    if (gameState.cash < ENERGY_UPGRADE_COST) { showToast('资金不足！', 'error'); return; }
    gameState.cash -= ENERGY_UPGRADE_COST;
    en.maxBatteryCapacity += ENERGY_UPGRADE_AMOUNT;
    addMessage('🔋 电池容量升级至 ' + en.maxBatteryCapacity + ' 度', 'good');
  }
  updateUI(); saveGame();
  if (typeof renderEnergyModal === 'function') renderEnergyModal();
  showToast('容量升级成功！', 'success');
}

function getServicePrice(serviceKey) {
  var sp = gameState.servicePricing;
  switch(serviceKey) {
    case 'insurance': return sp.insurance;
    case 'wifi': return sp.wifi;
    case 'gps': return sp.gps;
    case 'delivery': return sp.delivery;
    case 'refuelMargin': return sp.refuelMargin;
    case 'rechargeMargin': return sp.rechargeMargin;
    default: return 0;
  }
}

function setServicePrice(serviceKey, value) {
  if (!gameState.servicePricing) gameState.servicePricing = { insurance:50, wifi:20, gps:15, delivery:80, refuelMargin:1.0, rechargeMargin:1.0 };
  gameState.servicePricing[serviceKey] = value;
  saveGame();
}

function getEffectiveServiceProbability(serviceKey) {
  var baseProb = SERVICE_PROBABILITIES[serviceKey];
  if (serviceKey === 'insurance' || serviceKey === 'wifi' || serviceKey === 'gps' || serviceKey === 'delivery') {
    var defaultPrice = SERVICE_PRICES[serviceKey];
    var currentPrice = getServicePrice(serviceKey);
    var ratio = currentPrice / defaultPrice;
    return Math.max(0.05, Math.min(0.6, baseProb / Math.pow(ratio, 0.5)));
  }
  return baseProb;
}

function upgradeParkingSpot(outletId, spotType) {
  var os = getOutletState(outletId);
  if (!os) return { ok: false, reason: '网点不存在' };
  var cfg = PARKING_CONFIG[spotType];
  if (!cfg) return { ok: false, reason: '无效的停车位类型' };
  var currentLevel = os.parkingUpgradeLevel[spotType] || 0;
  var currentSpots = os.parkingSpots[spotType];
  if (currentSpots >= cfg.max) return { ok: false, reason: spotType === 'customer' ? '顾客停车位已达上限' : '内部车库已达上限' };
  if (gameState.cash < cfg.upgradeCost) return { ok: false, reason: '资金不足' };
  gameState.cash -= cfg.upgradeCost;
  os.parkingSpots[spotType] += cfg.perUpgrade;
  os.parkingUpgradeLevel[spotType] = currentLevel + 1;
  var spotLabel = spotType === 'customer' ? '顾客停车位' : '内部车库';
  addMessage('🅿️ ' + OUTLET_CONFIGS.find(function(c){ return c.id === outletId; }).name + ' 扩建' + spotLabel + '至 ' + os.parkingSpots[spotType] + ' 个，花费 ' + formatCurrency(cfg.upgradeCost), 'good');
  updateUI(); saveGame();
  return { ok: true };
}

function getParkingOccupancy(outletId) {
  var os = getOutletState(outletId);
  if (!os) return { customer: { used: 0, total: 5 }, internal: { used: 0, total: 10 } };
  var vehicles = getVehiclesAtOutlet(outletId);
  var rented = vehicles.filter(function(v){ return v.rentedUntil && v.rentedUntil >= gameState.currentDay; }).length;
  return {
    customer: { used: os.occupiedCustomerSpots || 0, total: os.parkingSpots.customer, reserved: os.reservedSpots || 0 },
    internal: { used: rented, total: os.parkingSpots.internal, available: os.parkingSpots.internal - rented }
  };
}

function getParkingPressureLevel(outletId) {
  var os = getOutletState(outletId);
  if (!os || !os.parkingSpots) return 0;
  var occ = getParkingOccupancy(outletId);
  if (occ.customer.total === 0) return 0;
  return occ.customer.used / occ.customer.total;
}

function getDailyParkingRent(outletId) {
  var os = getOutletState(outletId);
  if (!os || !os.parkingSpots) return 0;
  var rent = 0;
  rent += os.parkingSpots.customer * PARKING_CONFIG.customer.dailyRent;
  rent += os.parkingSpots.internal * PARKING_CONFIG.internal.dailyRent;
  return rent;
}

function setAutoRecommendReservation(value) {
  gameState.autoRecommendReservation = value;
  saveGame();
}

function setFacilityZone(outletId, facilityId, zone) {
  var os = getOutletState(outletId);
  if (!os) return;
  if (!os.facilityZones) os.facilityZones = {};
  os.facilityZones[facilityId] = zone;
  saveGame();
  addMessage('📍 ' + getFacilityConfig(facilityId).name + ' 已移至 ' + getZoneName(zone), 'good');
}

function getFacilityZone(outletId, facilityId) {
  var os = getOutletState(outletId);
  if (!os || !os.facilityZones) return 'parking';
  return os.facilityZones[facilityId] || 'parking';
}

function getZoneName(zone) {
  var names = { reception: '接待区', parking: '停车区', logistics: '后勤区' };
  return names[zone] || zone;
}

function getZoneEfficiencyBonus(outletId) {
  var os = getOutletState(outletId);
  if (!os || !os.facilityZones) return 0;
  var bonus = 0;
  var activeFacilities = getActiveFacilities(outletId);
  activeFacilities.forEach(function(f) {
    var zone = os.facilityZones[f.id] || 'parking';
    if (f.id === 'car_wash' && zone === 'parking') bonus += 0.05;
    if (f.id === 'express_repair' && zone === 'logistics') bonus += 0.05;
    if (f.id === 'slow_charger' && zone === 'logistics') bonus += 0.03;
    if (f.id === 'fast_charger' && zone === 'logistics') bonus += 0.03;
  });
  return bonus;
}

function purchaseDecoration(outletId, decoId) {
  var DECORATIONS = [
    { id: 'plant', name: '绿植', cost: 5000, satisfactionBonus: 2, icon: '🪴' },
    { id: 'aquarium', name: '鱼缸', cost: 8000, satisfactionBonus: 3, icon: '🐠' },
    { id: 'fountain', name: '室内喷泉', cost: 15000, satisfactionBonus: 5, icon: '⛲' }
  ];
  var deco = DECORATIONS.find(function(d){ return d.id === decoId; });
  if (!deco) return { ok: false, reason: '装饰不存在' };
  if (!gameState.interiorDecorUnlocked) return { ok: false, reason: '需要旗舰店铺解锁' };
  if (gameState.cash < deco.cost) return { ok: false, reason: '资金不足' };
  if (!gameState.decorations) gameState.decorations = [];
  if (gameState.decorations.some(function(d){ return d.outletId === outletId && d.id === decoId; })) {
    return { ok: false, reason: '该装饰已购买' };
  }
  gameState.cash -= deco.cost;
  gameState.decorations.push({ outletId: outletId, id: decoId, name: deco.name, icon: deco.icon, satisfactionBonus: deco.satisfactionBonus });
  addMessage('🏠 ' + OUTLET_CONFIGS.find(function(c){ return c.id === outletId; }).name + ' 购买 ' + deco.icon + ' ' + deco.name + '，满意度 +' + deco.satisfactionBonus, 'good');
  updateUI(); saveGame();
  return { ok: true };
}
