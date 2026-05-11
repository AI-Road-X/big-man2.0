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

var defaultGameState = {
  cash: 1000000,
  currentDay: 1,
  outlets: [{ id:0, level:1, owned:true }],
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
  lastTeamBuildingDay: 0
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
      return true;
    }
  } catch(e) { console.error('加载失败:', e); }
  return false;
}

function unlockOutlet(outletId) {
  var cfg = OUTLET_CONFIGS.find(function(c){ return c.id === outletId; });
  if (!cfg || gameState.cash < cfg.unlockCost) return;
  gameState.cash -= cfg.unlockCost;
  gameState.outlets.push({ id: outletId, level: 1, owned: true });
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
