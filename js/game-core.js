var SAVE_KEY = 'rentalCompanyGame_v3';

var OUTLET_CONFIGS = [
  { id:0, name:'总部网点', citySize:'large', cityLabel:'大型城市', position:{x:12,z:12}, unlockCost:0 },
  { id:1, name:'城东分店', citySize:'medium', cityLabel:'中型城市', position:{x:67,z:12}, unlockCost:500000 },
  { id:2, name:'城西分店', citySize:'small', cityLabel:'小型城市', position:{x:-43,z:-12}, unlockCost:300000 },
  { id:3, name:'城北分店', citySize:'large', cityLabel:'大型城市', position:{x:12,z:67}, unlockCost:800000 },
  { id:4, name:'城南分店', citySize:'medium', cityLabel:'中型城市', position:{x:-12,z:-67}, unlockCost:600000 }
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

var CITY_SIZE_MULTIPLIERS = { small:0.8, medium:1.2, large:1.8 };

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
  rateMultipliers: { '轿车':1.0,'SUV':1.3,'跑车':1.8,'MPV':1.2,'紧凑型':0.85,'豪华车':1.6,'超跑':2.5,'旅行车':0.95,'皮卡':1.4,'面包车':0.9,'轿跑':1.7,'小型SUV':1.15,'大型SUV':1.5,'大型MPV':1.35,'敞篷':2.0,'两厢':0.8 },
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
  hostileTakeoverRisk: 0,
  marketing: {
    channels: {
      advertising: { spend:0, customers:0, cac:0, conversion:0.05 },
      referral: { spend:0, customers:0, cac:0, conversion:0.15 },
      member: { spend:0, customers:0, cac:0, conversion:0.12 },
      organic: { spend:0, customers:0, cac:0, conversion:0.02 }
    },
    totalSpend:0, totalNewCustomers:0, overallCAC:0,
    brand: { awareness:20, reputation:50, equity:0, premiumPriceBonus:0, crisisLevel:0, lastCrisisDay:0 },
    campaigns: [],
    funnel: { visitors:0, browsed:0, inquired:0, ordered:0, paid:0, pickedUp:0, returned:0, reviewed:0 },
    abTests: [],
    abandonedCartRecovery: []
  },
  insurance: {
    policies: [],
    totalAnnualPremium: 0,
    pendingClaims: [],
    claimsHistory: [],
    providers: ['平安保险','人保财险','太平洋保险','大地保险','阳光保险']
  },
  vendors: {},
  fleetAnalytics: { lastCalculatedDay:0 }
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
  'car': { desc: '免费1辆随机车', fn: function(){ if(typeof vehicleDatabase!=='undefined'&&vehicleDatabase.length>0){ var v=vehicleDatabase[Math.floor(Math.random()*vehicleDatabase.length)]; var plate=typeof generateLicensePlate==='function'?generateLicensePlate():('京A'+Math.floor(Math.random()*90000+10000)); gameState.ownedVehicles.push(Object.assign({},v,{licensePlate:plate,outletId:0,purchasePrice:0,purchaseDay:gameState.currentDay,rentedUntil:0})); addMessage('🚗 免费获得 '+v.brand+' '+v.model,'good'); } } },
  'cars': { desc: '免费5辆随机车', fn: function(){ if(typeof vehicleDatabase!=='undefined'){ for(var i=0;i<5;i++){var v=vehicleDatabase[Math.floor(Math.random()*vehicleDatabase.length)]; var plate=typeof generateLicensePlate==='function'?generateLicensePlate():('京A'+Math.floor(Math.random()*90000+10000)); gameState.ownedVehicles.push(Object.assign({},v,{licensePlate:plate,outletId:0,purchasePrice:0,purchaseDay:gameState.currentDay,rentedUntil:0})); } addMessage('🚗 免费获得5辆车','good'); } } },
  'level': { desc: '网点+1级', fn: function(){ var os=getOutletState(0); if(os.level<5){os.level++;addMessage('⬆️ 网点Lv.'+os.level,'good');} } },
  'max': { desc: '网点满级', fn: function(){ getOutletState(0).level=5; addMessage('⭐ 网点满级','good'); } },
  'parking': { desc: '停车位满', fn: function(){ var os=getOutletState(0); os.parkingSpots={customer:20,internal:30}; os.parkingUpgradeLevel={customer:8,internal:4}; addMessage('🅿️ 停车位满','good'); } },
  'fuel': { desc: '能源满', fn: function(){ if(gameState.energy){gameState.energy.oilStorage=gameState.energy.maxOilCapacity;gameState.energy.batteryStorage=gameState.energy.maxBatteryCapacity;} addMessage('⛽ 能源已补满','good'); } },
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
      if (!gameState.rateMultipliers || Object.keys(gameState.rateMultipliers).length === 0) gameState.rateMultipliers = { '轿车':1.0,'SUV':1.3,'跑车':1.8,'MPV':1.2,'紧凑型':0.85,'豪华车':1.6,'超跑':2.5,'旅行车':0.95,'皮卡':1.4,'面包车':0.9,'轿跑':1.7,'小型SUV':1.15,'大型SUV':1.5,'大型MPV':1.35,'敞篷':2.0,'两厢':0.8 };
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
  if (!gameState.schedules) gameState.schedules = { currentWeek: [], overtimeHours: 0, laborCostThisWeek: 0 };
  if (!gameState.schedules.currentWeek) gameState.schedules.currentWeek = [];
  if (!gameState.performanceReviews) gameState.performanceReviews = [];
  if (!gameState.unionStatus) gameState.unionStatus = { formed: false, demands: [], lastDemandDay: 0 };
  if (!gameState.cashFlow) gameState.cashFlow = { operatingInflow:0, operatingOutflow:0, investingOutflow:0, financingInflow:0, financingOutflow:0, dailyLog:[], forecast:[] };
  if (!gameState.taxes) gameState.taxes = { ytdProfit:0, ytdTaxPaid:0, vatCollected:0, vatOwed:0, propertyTaxOwed:0, lastFilingDay:0, corporateTaxRate:0.25, vatRate:0.06, propertyTaxRate:0.01, quarterlyEstimates:[], taxPenalties:0, depreciationMethod:'straight' };
  if (!gameState.budget) gameState.budget = { monthlyRevenueTarget:100000, salariesCap:50000, marketingCap:20000, maintenanceCap:15000, monthActuals:{}, varianceHistory:[], lastClosingDay:0 };
  if (!gameState.kpiCache) gameState.kpiCache = {};
  if (!gameState.marketing) gameState.marketing = { channels:{advertising:{spend:0,customers:0,cac:0,conversion:0.05},referral:{spend:0,customers:0,cac:0,conversion:0.15},member:{spend:0,customers:0,cac:0,conversion:0.12},organic:{spend:0,customers:0,cac:0,conversion:0.02}},totalSpend:0,totalNewCustomers:0,overallCAC:0,brand:{awareness:20,reputation:50,equity:0,premiumPriceBonus:0,crisisLevel:0,lastCrisisDay:0},campaigns:[],funnel:{visitors:0,browsed:0,inquired:0,ordered:0,paid:0,pickedUp:0,returned:0,reviewed:0},abTests:[],abandonedCartRecovery:[] };
  if (!gameState.marketing.channels) gameState.marketing.channels = {advertising:{spend:0,customers:0,cac:0,conversion:0.05},referral:{spend:0,customers:0,cac:0,conversion:0.15},member:{spend:0,customers:0,cac:0,conversion:0.12},organic:{spend:0,customers:0,cac:0,conversion:0.02}};
  if (!gameState.marketing.brand) gameState.marketing.brand = {awareness:20,reputation:50,equity:0,premiumPriceBonus:0,crisisLevel:0,lastCrisisDay:0};
  if (!gameState.marketing.campaigns) gameState.marketing.campaigns = [];
  if (!gameState.marketing.funnel) gameState.marketing.funnel = {visitors:0,browsed:0,inquired:0,ordered:0,paid:0,pickedUp:0,returned:0,reviewed:0};
  if (!gameState.marketing.abTests) gameState.marketing.abTests = [];
  if (!gameState.marketing.abandonedCartRecovery) gameState.marketing.abandonedCartRecovery = [];
  if (gameState.marketing.totalSpend === undefined) gameState.marketing.totalSpend = 0;
  if (gameState.marketing.totalNewCustomers === undefined) gameState.marketing.totalNewCustomers = 0;
  if (gameState.marketing.overallCAC === undefined) gameState.marketing.overallCAC = 0;
  if (!gameState.insurance) gameState.insurance = {policies:[],totalAnnualPremium:0,pendingClaims:[],claimsHistory:[],providers:['平安保险','人保财险','太平洋保险','大地保险','阳光保险']};
  if (!gameState.insurance.policies) gameState.insurance.policies = [];
  if (!gameState.insurance.pendingClaims) gameState.insurance.pendingClaims = [];
  if (!gameState.insurance.claimsHistory) gameState.insurance.claimsHistory = [];
  if (!gameState.insurance.providers) gameState.insurance.providers = ['平安保险','人保财险','太平洋保险','大地保险','阳光保险'];
  if (gameState.insurance.totalAnnualPremium === undefined) gameState.insurance.totalAnnualPremium = 0;
  if (!gameState.vendors) gameState.vendors = {};
  if (!gameState.fleetAnalytics) gameState.fleetAnalytics = { lastCalculatedDay:0 };
if (!gameState.dailyChallenge) gameState.dailyChallenge = null;
  if (!gameState.challengeStreak) gameState.challengeStreak = 0;
  if (!gameState.autoManage) gameState.autoManage = {};
  if (!gameState.customerLoyalty) gameState.customerLoyalty = { returnRate: 0, totalReturns: 0, totalNewCustomers: 0, complaints: 0, referralCount: 0 };
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
    if (o.autoManageEnabled === undefined) o.autoManageEnabled = false;
    if (o.autoProfitThreshold === undefined) o.autoProfitThreshold = 100;
  });
  gameState.ownedVehicles.forEach(function(v){
    if (v.condition === undefined) v.condition = 100;
  });
  if (!gameState.npsSystem) gameState.npsSystem = { scores:[], trend30d:0, trend7d:0, byOutlet:{}, byType:{}, byEmployee:{}, detractorsRecovery:[], promoterReferrals:[], industryBenchmark:32, revenueCorrelationData:[] };
  if (!gameState.complaintSystem) gameState.complaintSystem = { complaints:[], stats:{ total:0, resolved:0, breached:0, avgResolutionTime:0, totalCompensation:0 }, categories:{} };
  if (!gameState.marketAnalysis) gameState.marketAnalysis = { totalMarketSize:1000000, yourShare:0.12, competitorShares:{'神州租车':0.25,'一嗨租车':0.20,'首汽租车':0.10,'联动云':0.07,'其他':0.26}, segmentBreakdown:{ Economy:{your:0.08,total:400000}, Standard:{your:0.15,total:350000}, Premium:{your:0.10,total:180000}, Luxury:{your:0.05,total:70000} }, trend:'stable', trendHistory:[], competitorMoves:[], marketGrowthRate:0.02 };
  if (!gameState.competitorIntel) gameState.competitorIntel = { pricingData:{}, promotionAlerts:[], swotAnalysis:null, weaknessSuggestions:[], lastUpdateDay:1 };
  if (!gameState.memberPoints) gameState.memberPoints = {};
  if (!gameState.familyAccounts) gameState.familyAccounts = [];
  if (!gameState.corporateAccounts) gameState.corporateAccounts = [];
  if (!gameState.memberBenefitsLog) gameState.memberBenefitsLog = [];
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

function migrateFixDuplicateOutlets() {
  var seenOutletIds = {};
  gameState.outlets = gameState.outlets.filter(function(o){
    if (!o.owned) return true;
    if (seenOutletIds[o.id]) {
      console.warn('移除重复网点:', o.id);
      return false;
    }
    seenOutletIds[o.id] = true;
    return true;
  });
}

function unlockOutlet(outletId) {
  var cfg = OUTLET_CONFIGS.find(function(c){ return c.id === outletId; });
  if (!cfg || gameState.cash < cfg.unlockCost) return;
  if (gameState.outlets.some(function(o){ return o.id === outletId && o.owned; })) { addMessage('该网点已解锁', 'warn'); return; }
  var hasManager = gameState.employees && gameState.employees.some(function(e){ return e.role === '店长'; });
  if (!hasManager) {
    addMessage('⚠️ 解锁新网点需要先招聘一名【店长】！请前往人才市场', 'bad');
    showToast('需要店长才能解锁新网点', 'error');
    updateUI(); saveGame();
    return;
  }
  var managerCount = (gameState.employees || []).filter(function(e){ return e.role === '店长'; }).length;
  var ownedOutletCount = gameState.outlets.filter(function(o){ return o.owned; }).length;
  var requiredManagers = Math.max(1, ownedOutletCount);
  if (managerCount < requiredManagers) {
    addMessage('⚠️ 当前拥有 ' + managerCount + ' 名店长，解锁第 ' + (ownedOutletCount + 1) + ' 个网点至少需要 ' + requiredManagers + ' 名店长', 'bad');
    showToast('店长不足（需' + requiredManagers + '名）', 'error');
    updateUI(); saveGame();
    return;
  }
  gameState.cash -= cfg.unlockCost;
  gameState.outlets.push({ id: outletId, level: 1, owned: true, facilities: [], disabledFacilities: [], brokenFacilities: {}, upgradeProgress: {profitableDays:0,maxProfit:0} });
  addMessage('🏢 解锁新网点：' + cfg.name + '（' + cfg.cityLabel + '）', 'good');
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

var SEASONAL_CAMPAIGNS = [
  { id:'spring_festival', name:'🧧 春节特惠', months:[1,2], discount:0.85, demandMultiplier:2.0, targetTypes:['轿车','SUV','MPV'], minBudget:3000, description:'春节期间85折优惠，需求暴增200%' },
  { id:'summer_drive', name:'🏖️ 暑期自驾游', months:[7,8], discount:0.90, demandMultiplier:1.5, targetTypes:['SUV','大型SUV','MPV'], minBudget:5000, description:'暑期SUV/MPV聚焦，需求+150%' },
  { id:'national_day', name:'🇨🇳 国庆长假', months:[10], discount:0.95, demandMultiplier:1.8, targetTypes:['豪华车','SUV','大型MPV'], minBudget:8000, description:'国庆长租/高端车，需求+180%' },
  { id:'year_end_clearance', name:'🎊 年终清仓', months:[12], discount:0.75, demandMultiplier:1.3, targetTypes:['紧凑型','两厢','轿车'], minBudget:2000, description:'清库存75折，全类型适用' },
  { id:'double11', name:'🛒 双11狂欢', months:[11], discount:0.80, demandMultiplier:2.2, targetTypes:['轿车','SUV','新能源'], minBudget:6000, description:'会员专属8折，需求暴增220%', memberExclusive:true },
  { id:'mid_year', name:'🌸 中春促销', months:[4,5], discount:0.88, demandMultiplier:1.2, targetTypes:['轿车','紧凑型','小型SUV'], minBudget:2500, description:'春季出行88折' }
];

function getMarketingCAC(channelKey) {
  var mkt = gameState.marketing;
  var ch = mkt.channels[channelKey];
  if (!ch) return 0;
  if (ch.customers > 0) {
    ch.cac = Math.round(ch.spend / ch.customers);
  } else {
    ch.cac = ch.spend > 0 ? ch.spend : 0;
  }
  return ch.cac;
}

function recalculateOverallCAC() {
  var mkt = gameState.marketing;
  var totalCustomers = 0;
  Object.keys(mkt.channels).forEach(function(k){ totalCustomers += (mkt.channels[k].customers || 0); });
  mkt.totalNewCustomers = totalCustomers;
  mkt.overallCAC = totalCustomers > 0 ? Math.round(mkt.totalSpend / totalCustomers) : 0;
  return mkt.overallCAC;
}

function spendMarketing(channelKey, amount) {
  amount = parseInt(amount) || 0;
  if (amount <= 0) return { ok:false, reason:'金额无效' };
  if (gameState.cash < amount) return { ok:false, reason:'资金不足' };
  var mkt = gameState.marketing;
  if (!mkt.channels[channelKey]) return { ok:false, reason:'渠道不存在' };
  gameState.cash -= amount;
  gameState.todayExpense += amount;
  mkt.channels[channelKey].spend += amount;
  mkt.totalSpend += amount;
  var channelNames = { advertising:'广告投放', referral:'口碑推荐', member:'会员转介', organic:'自然流量' };
  addMessage('📢 营销投入：' + (channelNames[channelKey] || channelKey) + ' ' + formatCurrency(amount), 'warn');
  saveGame();
  return { ok:true, spent:amount };
}

function recordMarketingConversion(channelKey, count) {
  count = parseInt(count) || 1;
  var mkt = gameState.marketing;
  if (!mkt.channels[channelKey]) return;
  mkt.channels[channelKey].customers += count;
  mkt.totalNewCustomers += count;
  recalculateOverallCAC();
}

function getBrandEquity() {
  var brand = gameState.marketing.brand;
  var awareness = brand.awareness || 20;
  var reputation = brand.reputation || 50;
  var marketShare = typeof getMarketShare === 'function' ? getMarketShare() : 1;
  brand.equity = Math.round(awareness * reputation * marketShare / 100);
  return brand.equity;
}

function updateBrandAwareness(delta) {
  var brand = gameState.marketing.brand;
  brand.awareness = Math.max(0, Math.min(100, (brand.awareness || 20) + delta));
  if (delta > 0) addMessage('📈 品牌知名度 +' + delta + '，当前：' + brand.awareness, 'good');
  else if (delta < 0) addMessage('📉 品牌知名度 ' + delta + '，当前：' + brand.awareness, 'bad');
  getBrandEquity();
  saveGame();
}

function getPremiumPriceBonus() {
  var brand = gameState.marketing.brand;
  if ((brand.awareness || 20) >= 70 && (brand.reputation || 50) >= 70) {
    brand.premiumPriceBonus = 15;
  } else if ((brand.awareness || 20) >= 50 && (brand.reputation || 50) >= 60) {
    brand.premiumPriceBonus = 10;
  } else {
    brand.premiumPriceBonus = 0;
  }
  return brand.premiumPriceBonus;
}

function triggerCrisisEvent(severity) {
  var brand = gameState.marketing.brand;
  brand.crisisLevel = severity || 3;
  brand.lastCrisisDay = gameState.currentDay;
  var repLoss = severity * 5;
  var awareLoss = severity * 8;
  brand.reputation = Math.max(0, (brand.reputation || 50) - repLoss);
  brand.awareness = Math.max(0, (brand.awareness || 20) - awareLoss);
  var crisisDescs = ['⚠️ 车辆故障频发被曝光','⚠️ 客户投诉服务质量','⚠️ 竞对手恶意抹黑','⚠️ 交通事故负面新闻','⚠️ 价格欺诈指控'];
  addMessage('🚨 品牌危机！' + (crisisDescs[severity-1]||'负面事件') + '，声誉-' + repLoss + ' 知名度-' + awareLoss, 'bad');
  saveGame();
  return { reputationLoss: repLoss, awarenessLoss: awareLoss };
}

function handleCrisisPRResponse(cost) {
  cost = parseInt(cost) || 0;
  var brand = gameState.marketing.brand;
  if (brand.crisisLevel <= 0) return { ok:false, reason:'无危机需要处理' };
  if (gameState.cash < cost) return { ok:false, reason:'资金不足' };
  gameState.cash -= cost;
  gameState.todayExpense += cost;
  var recovery = Math.min(brand.crisisLevel * 3, 15);
  brand.reputation = Math.min(100, (brand.reputation || 50) + recovery);
  brand.awareness = Math.min(100, (brand.awareness || 20) + Math.round(recovery * 0.5));
  brand.crisisLevel = Math.max(0, brand.crisisLevel - 2);
  addMessage('🛡️ 危机公关处理：声誉恢复 +' + recovery + '，花费 ' + formatCurrency(cost), 'good');
  saveGame();
  return { ok:true, recovered: recovery };
}

function launchCampaign(campaignData) {
  var mkt = gameState.marketing;
  var budget = parseInt(campaignData.budget) || 0;
  if (budget <= 0) return { ok:false, reason:'预算无效' };
  if (gameState.cash < budget) return { ok:false, reason:'资金不足' };
  var activeCount = mkt.campaigns.filter(function(c){ return c.status === 'active'; }).length;
  if (activeCount >= 3) return { ok:false, reason:'最多同时进行3个活动' };
  gameState.cash -= budget;
  gameState.todayExpense += budget;
  var campaign = {
    id: 'CMP_' + Date.now(),
    type: campaignData.type || 'custom',
    name: campaignData.name || '自定义活动',
    discount: parseFloat(campaignData.discount) || 1.0,
    demandMultiplier: parseFloat(campaignData.demandMultiplier) || 1.0,
    targetTypes: campaignData.targetTypes || [],
    budget: budget,
    spent: 0,
    dailySpend: Math.ceil(budget / (campaignData.durationDays || 14)),
    customersAcquired: 0,
    roi: 0,
    startDay: gameState.currentDay,
    endDay: gameState.currentDay + (campaignData.durationDays || 14),
    status: 'active',
    channel: campaignData.channel || 'advertising',
    description: campaignData.description || ''
  };
  mkt.campaigns.push(campaign);
  addMessage('🎯 启动营销活动：' + campaign.name + '（预算 ' + formatCurrency(budget) + '，持续 ' + (campaignData.durationDays || 14) + ' 天）', 'good');
  saveGame();
  return { ok:true, campaign: campaign };
}

function processDailyMarketing() {
  var mkt = gameState.marketing;
  mkt.campaigns.forEach(function(cmp){
    if (cmp.status !== 'active') return;
    if (gameState.currentDay > cmp.endDay) {
      cmp.status = 'completed';
      cmp.roi = cmp.budget > 0 ? Math.round((cmp.customersAcquired * 500 - cmp.spent) / cmp.spent * 100) : 0;
      addMessage('🏁 营销活动结束：' + cmp.name + ' — 获客 ' + cmp.customersAcquired + ' 人，ROI ' + cmp.roi + '%', cmp.roi >= 0 ? 'good' : 'bad');
      return;
    }
    var todaySpend = cmp.dailySpend;
    if (gameState.cash >= todaySpend) {
      gameState.cash -= todaySpend;
      gameState.todayExpense += todaySpend;
      cmp.spent += todaySpend;
      mkt.channels[cmp.channel] = mkt.channels[cmp.channel] || { spend:0,customers:0,cac:0,conversion:0.05 };
      mkt.channels[cmp.channel].spend += todaySpend;
      mkt.totalSpend += todaySpend;
    }
  });
  if (mkt.brand.crisisLevel > 0 && gameState.currentDay - (mkt.brand.lastCrisisDay || 0) > 7) {
    var naturalRecovery = Math.min(mkt.brand.crisisLevel, 1);
    mkt.brand.crisisLevel -= naturalRecovery;
  }
  var organicGrowth = Math.round((mkt.brand.awareness || 20) * 0.02 * (Math.random() * 0.5 + 0.5));
  if (organicGrowth > 0 && Math.random() < 0.3) {
    mkt.channels.organic.customers += 1;
    mkt.totalNewCustomers = (mkt.totalNewCustomers || 0) + 1;
  }
  recalculateOverallCAC();
  getBrandEquity();
  getPremiumPriceBonus();
}

function getCampaignDemandMultiplier() {
  var mkt = gameState.marketing;
  var maxMult = 1.0;
  mkt.campaigns.forEach(function(cmp){
    if (cmp.status === 'active') maxMult = Math.max(maxMult, cmp.demandMultiplier || 1.0);
  });
  return maxMult;
}

function getCampaignDiscount(vehicleType) {
  var mkt = gameState.marketing;
  var bestDiscount = 1.0;
  mkt.campaigns.forEach(function(cmp){
    if (cmp.status !== 'active') return;
    if (cmp.targetTypes && cmp.targetTypes.length > 0 && cmp.targetTypes.indexOf(vehicleType) === -1) return;
    bestDiscount = Math.min(bestDiscount, cmp.discount || 1.0);
  });
  return bestDiscount;
}

function trackFunnelStage(stage) {
  var funnel = gameState.marketing.funnel;
  if (!funnel[stage] && stage !== 'visitors') return;
  if (stage === 'visitors') funnel.visitors = (funnel.visitors || 0) + 1;
  else if (funnel[stage] !== undefined) funnel[stage]++;
}

function getFunnelConversionRates() {
  var f = gameState.marketing.funnel;
  var stages = ['visitors','browsed','inquired','ordered','paid','pickedUp','returned','reviewed'];
  var rates = [];
  for (var i = 1; i < stages.length; i++) {
    var prev = f[stages[i-1]] || 1;
    var curr = f[stages[i]] || 0;
    rates.push({ from: stages[i-1], to: stages[i], rate: prev > 0 ? Math.round(curr / prev * 100) : 0 });
  }
  return rates;
}

function createABTest(name, optionA, optionB) {
  var test = {
    id: 'AB_' + Date.now(),
    name: name,
    optionA: optionA,
    optionB: optionB,
    trafficA: 0, conversionsA: 0,
    trafficB: 0, conversionsB: 0,
    startDay: gameState.currentDay,
    durationDays: 14,
    status: 'running'
  };
  gameState.marketing.abTests.push(test);
  return test;
}

function recoverAbandonedCart(orderId) {
  var mkt = gameState.marketing;
  var existing = mkt.abandonedCartRecovery.find(function(r){ return r.orderId === orderId && !r.recovered; });
  if (existing) {
    existing.recovered = true;
    existing.recoveryDay = gameState.currentDay;
    return true;
  }
  return false;
}

function initVehicleLifecycle(vehicle) {
  if (!vehicle.lifecycle) {
    vehicle.lifecycle = {
      phase: 'active',
      purchaseDate: gameState.currentDay,
      totalRevenueGenerated: 0,
      totalOperatingCost: 0,
      totalRentalDays: 0,
      averageDailyRevenue: 0,
      roi: 0,
      disposalReason: '',
      disposalDate: null,
      disposalPrice: 0
    };
  }
  return vehicle.lifecycle;
}

function updateVehicleLifecycleStats(vehicleId, revenue, cost, rentalDays) {
  var vehicle = gameState.ownedVehicles.find(function(v){ return v.id === vehicleId; });
  if (!vehicle) return;
  var lc = initVehicleLifecycle(vehicle);
  lc.totalRevenueGenerated += (revenue || 0);
  lc.totalOperatingCost += (cost || 0);
  lc.totalRentalDays += (rentalDays || 0);
  if (lc.totalRentalDays > 0) {
    lc.averageDailyRevenue = Math.round(lc.totalRevenueGenerated / lc.totalRentalDays);
  }
  var purchaseCost = vehicle.purchasePrice || vehicle.estimatedValue || 200000;
  lc.roi = purchaseCost > 0 ? Math.round((lc.totalRevenueGenerated - lc.totalOperatingCost - purchaseCost) / purchaseCost * 100) : 0;
}

function setVehiclePhase(vehicleId, phase, reason) {
  var vehicle = gameState.ownedVehicles.find(function(v){ return v.id === vehicleId; });
  if (!vehicle) return;
  var lc = initVehicleLifecycle(vehicle);
  lc.phase = phase;
  if (phase === 'disposal' || phase === 'disposed') {
    lc.disposalReason = reason || '';
  }
  if (phase === 'disposed') {
    lc.disposalDate = gameState.currentDay;
  }
  var phaseNames = { active:'服役中', maintenance:'维护中', disposal:'待处置', disposed:'已处置' };
  addMessage('🔄 ' + vehicle.brand + ' ' + vehicle.model + ' → ' + (phaseNames[phase] || phase), phase === 'disposed' ? 'bad' : 'warn');
}

function getFleetPhaseSummary() {
  var summary = { active:0, maintenance:0, disposal:0, disposed:0, total:0 };
  gameState.ownedVehicles.forEach(function(v){
    var phase = (v.lifecycle && v.lifecycle.phase) || 'active';
    summary[phase] = (summary[phase] || 0) + 1;
    summary.total++;
  });
  return summary;
}

function disposeVehicle(vehicleId, method, price) {
  var vehicle = gameState.ownedVehicles.find(function(v){ return v.id === vehicleId; });
  if (!vehicle) return { ok:false, reason:'车辆不存在' };
  var lc = initVehicleLifecycle(vehicle);
  setVehiclePhase(vehicleId, 'disposed', method || 'sold');
  lc.disposalPrice = price || 0;
  if (price > 0) {
    gameState.cash += price;
    gameState.todayIncome += price;
  }
  var idx = gameState.ownedVehicles.indexOf(vehicle);
  if (idx > -1) {
    gameState.ownedVehicles.splice(idx, 1);
  }
  addMessage('🗑️ 已处置 ' + vehicle.brand + ' ' + vehicle.model + '（' + (method||'出售') + '，' + formatCurrency(price || 0) + '）', 'warn');
  saveGame();
  return { ok:true, price: price };
}

function issueInsurancePolicy(vehicleId, policyType, deductible) {
  var vehicle = gameState.ownedVehicles.find(function(v){ return v.id === vehicleId; });
  if (!vehicle) return { ok:false, reason:'车辆不存在' };
  var existing = gameState.insurance.policies.find(function(p){ return p.vehicleId === vehicleId && p.status !== 'expired' });
  if (existing) return { ok:false, reason:'该车辆已有有效保单' };
  var vehicleValue = calculateVehicleValue(vehicle);
  var basePremium = policyType === 'comprehensive' ? 2000 : 800;
  var valueFactor = vehicleValue / 200000;
  var dedFactor = deductible === 0 ? 1.5 : (deductible === 500 ? 1.0 : 0.8);
  var annualPremium = Math.round(basePremium * valueFactor * dedFactor);
  var coverage = policyType === 'comprehensive' ? Math.round(vehicleValue * 0.8) : 200000;
  var providerIdx = Math.floor(Math.random() * (gameState.insurance.providers.length || 5));
  var provider = (gameState.insurance.providers || ['平安保险','人保财险','太平洋保险','大地保险','阳光保险'])[providerIdx] || '平安保险';
  if (gameState.cash < annualPremium) return { ok:false, reason:'资金不足，需 ' + formatCurrency(annualPremium) };
  gameState.cash -= annualPremium;
  gameState.todayExpense += annualPremium;
  var policy = {
    id: 'INS_' + Date.now(),
    vehicleId: vehicleId,
    vehicleName: vehicle.brand + ' ' + vehicle.model,
    type: policyType,
    provider: provider,
    annualPremium: annualPremium,
    deductible: deductible || 500,
    coverage: coverage,
    claims: [],
    noClaimsYears: 0,
    issueDay: gameState.currentDay,
    expiryDay: gameState.currentDay + 365,
    nextRenewalDay: gameState.currentDay + 365,
    status: 'active'
  };
  gameState.insurance.policies.push(policy);
  gameState.insurance.totalAnnualPremium = (gameState.insurance.totalAnnualPremium || 0) + annualPremium;
  addMessage('🛡️ 为 ' + vehicle.brand + ' ' + vehicle.model + ' 投保' + (policyType === 'comprehensive' ? '商业险' : '交强险') + '（' + provider + '，年费 ' + formatCurrency(annualPremium) + '）', 'good');
  saveGame();
  return { ok:true, policy: policy };
}

function renewInsurancePolicy(policyId) {
  var policy = gameState.insurance.policies.find(function(p){ return p.id === policyId });
  if (!policy) return { ok:false, reason:'保单不存在' };
  if (policy.noClaimsYears > 0) {
    var bonus = Math.min(policy.noClaimsYears * 10, 50);
    policy.annualPremium = Math.round(policy.annualPremium * (1 - bonus / 100));
  }
  if (gameState.cash < policy.annualPremium) return { ok:false, reason:'资金不足' };
  gameState.cash -= policy.annualPremium;
  gameState.todayExpense += policy.annualPremium;
  policy.issueDay = gameState.currentDay;
  policy.expiryDay = gameState.currentDay + 365;
  policy.nextRenewalDay = gameState.currentDay + 365;
  policy.noClaimsYears++;
  policy.claims = [];
  addMessage('🔄 续保 ' + policy.vehicleName + '（' + policy.provider + '，' + formatCurrency(policy.annualPremium) + '/年）', 'warn');
  saveGame();
  return { ok:true };
}

function fileInsuranceClaim(policyId, claimType, amount) {
  var policy = gameState.insurance.policies.find(function(p){ return p.id === policyId });
  if (!policy) return { ok:false, reason:'保单不存在' };
  if (policy.status !== 'active') return { ok:false, reason:'保单已失效' };
  if (amount <= policy.deductible) return { ok:false, reason:'金额低于免赔额' };
  var claim = {
    id: 'CLM_' + Date.now(),
    policyId: policyId,
    type: claimType,
    claimedAmount: amount,
    approvedAmount: 0,
    status: 'pending',
    filedDay: gameState.currentDay,
    assessedDay: null,
    paidDay: null
  };
  policy.claims.push(claim);
  gameState.insurance.pendingClaims.push(claim);
  setVehiclePhase(policy.vehicleId, 'maintenance', '事故理赔');
  addMessage('📋 提交理赔申请：' + policy.vehicleName + ' — ' + claimType + '，金额 ' + formatCurrency(amount), 'warn');
  saveGame();
  return { ok:true, claim: claim };
}

function processPendingClaims() {
  var pending = gameState.insurance.pendingClaims.filter(function(c){ return c.status === 'pending'; });
  pending.forEach(function(claim){
    if (Math.random() < 0.6) {
      claim.status = 'approved';
      claim.assessedDay = gameState.currentDay;
      var policy = gameState.insurance.policies.find(function(p){ return p.id === claim.policyId });
      var payout = Math.max(0, claim.claimedAmount - (policy ? policy.deductible : 500));
      claim.approvedAmount = payout;
      gameState.cash += payout;
      gameState.todayIncome += payout;
      claim.paidDay = gameState.currentDay;
      claim.status = 'paid';
      if (policy) {
        policy.noClaimsYears = 0;
        var vehicle = gameState.ownedVehicles.find(function(v){ return v.id === policy.vehicleId });
        if (vehicle) {
          var cond = getVehicleCondition(vehicle);
          if (cond < 40) vehicle.condition = Math.min(100, vehicle.condition + 20);
          setVehiclePhase(policy.vehicleId, 'active', '');
        }
      }
      addMessage('✅ 理赔到账：' + formatCurrency(payout), 'good');
    } else {
      claim.status = 'rejected';
      claim.assessedDay = gameState.currentDay;
      addMessage('❌ 理赔被拒：' + claim.type + '（材料不全）', 'bad');
    }
  });
  gameState.insurance.pendingClaims = gameState.insurance.pendingClaims.filter(function(c){ return c.status === 'pending'; });
  gameState.insurance.pendingClaims.forEach(function(c){
    if (c.status === 'paid' || c.status === 'rejected') {
      gameState.insurance.claimsHistory.push(c);
    }
  });
  gameState.insurance.pendingClaims = gameState.insurance.pendingClaims.filter(function(c){ return c.status === 'pending'; });
}

function processInsuranceRenewals() {
  gameState.insurance.policies.forEach(function(policy){
    if (policy.status === 'active' && gameState.currentDay >= policy.nextRenewalDay) {
      if (gameState.cash >= policy.annualPremium) {
        renewInsurancePolicy(policy.id);
      } else {
        policy.status = 'lapsed';
        addMessage('⚠️ ' + policy.vehicleName + ' 保险到期未续保！', 'bad');
      }
    }
  });
}

function triggerAccident(vehicleId) {
  var vehicle = gameState.ownedVehicles.find(function(v){ return v.id === vehicleId });
  if (!vehicle) return null;
  if (vehicle.rentedUntil && vehicle.rentedUntil < gameState.currentDay) return null;
  var accidentTypes = [
    { type:'minor_fender', name:'轻微刮擦', repairMin:200, repairMax:1000, downtimeMin:1, downtimeMax:3 },
    { type:'major_accident', name:'严重事故', repairMin:3000, repairMax:15000, downtimeMin:7, downtimeMax:21 },
    { type:'theft', name:'车辆被盗', repairMin:0, repairMax:0, downtimeMin:999, downtimeMax:999, isTheft:true },
    { type:'dispute', name:'客户纠纷', repairMin:500, repairMax:2000, downtimeMin:0, downtimeMax:2, isDispute:true }
  ];
  var roll = Math.random();
  var accIdx = roll < 0.5 ? 0 : (roll < 0.8 ? 1 : (roll < 0.92 ? 2 : 3));
  var acc = accidentTypes[accIdx];
  var repairCost = Math.floor(Math.random() * (acc.repairMax - acc.repairMin + 1)) + acc.repairMin;
  var downtime = Math.floor(Math.random() * (acc.downtimeMax - acc.downtimeMin + 1)) + acc.downtimeMin;
  var incident = {
    id: 'INC_' + Date.now(),
    vehicleId: vehicleId,
    vehicleName: vehicle.brand + ' ' + vehicle.model,
    type: acc.type,
    name: acc.name,
    repairCost: repairCost,
    downtime: downtime,
    day: gameState.currentDay,
    resolved: false,
    insuranceClaimed: false,
    customerCompensated: false
  };
  setVehiclePhase(vehicleId, 'maintenance', acc.name);
  if (acc.isTheft) {
    setVehiclePhase(vehicleId, 'disposed', 'theft');
    var policy = gameState.insurance.policies.find(function(p){ return p.vehicleId === vehicleId && p.status === 'active' && p.type === 'comprehensive' });
    if (policy) {
      var theftPayout = calculateVehicleValue(vehicle) - (policy.deductible || 500);
      fileInsuranceClaim(policy.id, '车辆盗抢', calculateVehicleValue(vehicle));
    } else {
      addMessage('🚨 ' + vehicle.brand + ' ' + vehicle.model + ' 遭遇盗抢！无商业险保障，全额损失！', 'bad');
    }
  } else {
    var hasComprehensive = gameState.insurance.policies.some(function(p){ return p.vehicleId === vehicleId && p.status === 'active' && p.type === 'comprehensive' });
    if (hasComprehensive && repairCost > 500) {
      var compPolicy = gameState.insurance.policies.find(function(p){ return p.vehicleId === vehicleId && p.status === 'active' && p.type === 'comprehensive' });
      if (compPolicy) {
        fileInsuranceClaim(compPolicy.id, acc.name, repairCost);
        incident.insuranceClaimed = true;
      }
    }
    if (acc.isDispute) {
      addReputation(-3);
      var loyalty = gameState.customerLoyalty;
      if (loyalty) { loyalty.complaints = (loyalty.complaints || 0) + 1; }
    }
    var condDamage = acc.isDispute ? 0 : Math.floor(downtime * 3 + Math.random() * 10);
    vehicle.condition = Math.max(0, (vehicle.condition || 100) - condDamage);
    var compensation = Math.min(repairCost * 0.3, 500);
    if (compensation > 0 && gameState.cash >= compensation) {
      gameState.cash -= compensation;
      gameState.todayExpense += compensation;
      incident.customerCompensated = true;
    }
  }
  addMessage('⚠️ 事故报告：' + vehicle.brand + ' ' + vehicle.model + ' — ' + acc.name + '，维修 ' + formatCurrency(repairCost) + '，停运 ' + downtime + ' 天', 'bad');
  if (!gameState.incidents) gameState.incidents = [];
  gameState.incidents.push(incident);
  saveGame();
  return incident;
}

function checkRandomAccident() {
  var rentedVehicles = gameState.ownedVehicles.filter(function(v){
    return v.rentedUntil && v.rentedUntil >= gameState.currentDay;
  });
  if (rentedVehicles.length === 0) return null;
  var accidentChance = 0.02;
  rentedVehicles.forEach(function(v){
    var cond = getVehicleCondition(v);
    if (cond < 30) accidentChance += 0.05;
    else if (cond < 50) accidentChance += 0.02;
  });
  if (Math.random() < accidentChance) {
    var targetVehicle = rentedVehicles[Math.floor(Math.random() * rentedVehicles.length)];
    return triggerAccident(targetVehicle.id);
  }
  return null;
}

function resolveIncident(incidentId) {
  var incident = (gameState.incidents || []).find(function(i){ return i.id === incidentId; });
  if (!incident || incident.resolved) return { ok:false };
  var vehicle = gameState.ownedVehicles.find(function(v){ return v.id === incident.vehicleId; });
  if (vehicle && incident.type !== 'theft') {
    setVehiclePhase(incident.vehicleId, 'active', '');
  }
  incident.resolved = true;
  incident.resolvedDay = gameState.currentDay;
  return { ok:true };
}

function getIncidentCount() {
  return (gameState.incidents || []).filter(function(i){ return !i.resolved; }).length;
}

function getFleetAnalytics() {
  var analytics = { byType:{}, ageDistribution:{ under3:0, threeTo5:0, over5:0 }, utilizationByType:{}, revenuePerDayByType:{}, tcoByType:{}, replacementSuggestions:[] };
  var types = {};
  gameState.ownedVehicles.forEach(function(v){
    var t = v.type || '未知';
    types[t] = (types[t] || 0) + 1;
    var ageInDays = gameState.currentDay - (v.purchaseDay || v.lifecycle ? v.lifecycle.purchaseDate : gameState.currentDay);
    var ageInYears = Math.floor(ageInDays / 365);
    if (ageInYears < 3) analytics.ageDistribution.under3++;
    else if (ageInYears <= 5) analytics.ageDistribution.threeTo5++;
    else analytics.ageDistribution.over5++;
    var lc = v.lifecycle;
    if (lc) {
      if (!analytics.utilizationByType[t]) analytics.utilizationByType[t] = { totalDays:0, rentedDays:0, vehicles:0 };
      analytics.utilizationByType[t].totalDays += (gameState.currentDay - lc.purchaseDate);
      analytics.utilizationByType[t].rentedDays += (lc.totalRentalDays || 0);
      analytics.utilizationByType[t].vehicles++;
      if (!analytics.revenuePerDayByType[t]) analytics.revenuePerDayByType[t] = { totalRevenue:0, totalDays:0 };
      analytics.revenuePerDayByType[t].totalRevenue += (lc.totalRevenueGenerated || 0);
      analytics.revenuePerDayByType[t].totalDays += (lc.totalRentalDays || 0);
    }
  });
  analytics.byType = types;
  Object.keys(analytics.revenuePerDayByType).forEach(function(t){
    var d = analytics.revenuePerDayByType[t];
    d.avgRevenuePerDay = d.totalDays > 0 ? Math.round(d.totalRevenue / d.totalDays) : 0;
  });
  Object.keys(analytics.utilizationByType).forEach(function(t){
    var u = analytics.utilizationByType[t];
    u.utilRate = u.totalDays > 0 ? Math.round(u.rentedDays / u.totalDays * 100) : 0;
  });
  gameState.ownedVehicles.forEach(function(v){
    var t = v.type || '未知';
    var lc = v.lifecycle;
    if (!lc) return;
    var purchaseCost = v.purchasePrice || v.estimatedValue || 200000;
    var maintCost = lc.totalOperatingCost || 0;
    var insCost = 0;
    var pol = gameState.insurance.policies.find(function(p){ return p.vehicleId === v.id && p.status === 'active'; });
    if (pol) insCost = pol.annualPremium;
    var fuelEstimate = (v.fuelCostPerDay || 50) * (lc.totalRentalDays || 0);
    var depreciation = Math.max(0, purchaseCost - calculateVehicleValue(v));
    var residual = calculateVehicleValue(v);
    var tco = purchaseCost + maintCost + insCost + fuelEstimate + depreciation - residual;
    if (!analytics.tcoByType[t]) analytics.tcoByType[t] = { totalTCO:0, count:0, avgTCO:0 };
    analytics.tcoByType[t].totalTCO += tco;
    analytics.tcoByType[t].count++;
  });
  Object.keys(analytics.tcoByType).forEach(function(t){
    var tc = analytics.tcoByType[t];
    tc.avgTCO = tc.count > 0 ? Math.round(tc.totalTCO / tc.count) : 0;
  });
  gameState.ownedVehicles.forEach(function(v){
    var lc = v.lifecycle;
    if (!lc || lc.phase !== 'active') return;
    var ageInDays = gameState.currentDay - (lc.purchaseDate || gameState.currentDay);
    var ageInYears = ageInDays / 365;
    var cond = getVehicleCondition(v);
    if (ageInYears > 4 || cond < 25) {
      analytics.replacementSuggestions.push({
        vehicleId: v.id,
        name: v.brand + ' ' + v.model,
        type: v.type,
        ageYears: Math.round(ageInYears * 10) / 10,
        condition: cond,
        reason: ageInYears > 4 ? '车龄过长' : '车况过低',
        priority: ageInYears > 5 || cond < 20 ? 'high' : 'medium'
      });
    }
  });
  analytics.replacementSuggestions.sort(function(a,b){ return b.ageYears - a.ageYears; });
  gameState.fleetAnalytics.lastCalculatedDay = gameState.currentDay;
  return analytics;
}

function getBulkPurchaseDiscount(count, basePrice) {
  if (count >= 10) return { discount: 0.85, finalPrice: Math.round(basePrice * 0.85 * count), savings: Math.round(basePrice * 0.15 * count) };
  if (count >= 5) return { discount: 0.93, finalPrice: Math.round(basePrice * 0.93 * count), savings: Math.round(basePrice * 0.07 * count) };
  if (count >= 3) return { discount: 0.95, finalPrice: Math.round(basePrice * 0.95 * count), savings: Math.round(basePrice * 0.05 * count) };
  return { discount: 1.0, finalPrice: Math.round(basePrice * count), savings: 0 };
}

function getVendorLoyaltyDiscount(vendorKey) {
  if (!vendorKey) return 0;
  var vendor = gameState.vendors[vendorKey];
  if (!vendor) return 0;
  var orderCount = vendor.orderCount || 0;
  var totalSpent = vendor.totalSpent || 0;
  if (orderCount >= 20 && totalSpent >= 5000000) return 8;
  if (orderCount >= 10 && totalSpent >= 2000000) return 5;
  if (orderCount >= 5 && totalSpent >= 800000) return 3;
  return 0;
}

function recordVendorPurchase(vendorKey, amount) {
  if (!vendorKey) return;
  if (!gameState.vendors[vendorKey]) {
    gameState.vendors[vendorKey] = { orderCount:0, totalSpent:0, firstPurchaseDay:gameState.currentDay, level:1 };
  }
  var v = gameState.vendors[vendorKey];
  v.orderCount = (v.orderCount || 0) + 1;
  v.totalSpent = (v.totalSpent || 0) + amount;
  if (v.orderCount >= 20) v.level = 5;
  else if (v.orderCount >= 10) v.level = 4;
  else if (v.orderCount >= 5) v.level = 3;
  else if (v.orderCount >= 2) v.level = 2;
}

function calculateTradeInValue(oldVehicleId) {
  var oldVehicle = gameState.ownedVehicles.find(function(v){ return v.id === oldVehicleId; });
  if (!oldVehicle) return 0;
  var baseValue = calculateVehicleValue(oldVehicle);
  var tradeInRate = 0.9;
  var lc = oldVehicle.lifecycle;
  if (lc && lc.totalRentalDays > 100) tradeInRate += 0.05;
  return Math.round(baseValue * tradeInRate);
}

function getFleetReplacementAdvice() {
  var advice = [];
  var summary = getFleetPhaseSummary();
  var total = summary.total || 1;
  var disposalRatio = (summary.disposal || 0) / total;
  if (disposalRatio > 0.15) {
    advice.push({ level:'warning', message:'待处置车辆占比 ' + Math.round(disposalRatio*100) + '%，建议尽快清理库存' });
  }
  var analytics = getFleetAnalytics();
  var under3Pct = Math.round(analytics.ageDistribution.under3 / total * 100) || 0;
  if (under3Pct < 50) {
    advice.push({ level:'warning', message:'3年内新车仅占 ' + under3Pct + '%，建议更新车队' });
  }
  if (analytics.replacementSuggestions.length > 3) {
    advice.push({ level:'info', message:analytics.replacementSuggestions.length + ' 辆车建议更换，优先处理高优先级车辆' });
  }
  var lowCondCount = gameState.ownedVehicles.filter(function(v){ return (getVehicleCondition(v)) < 30; }).length;
  if (lowCondCount > total * 0.1) {
    advice.push({ level:'danger', message:lowCondCount + ' 辆车况危险(<30%)，存在安全隐患' });
  }
  return advice;
}

function getVehicleCondition(vehicle) {
  if (vehicle.condition === undefined) vehicle.condition = 100;
  return vehicle.condition;
}

function getConditionLabel(cond) {
  if (cond >= 80) return { text: '优秀', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' };
  if (cond >= 50) return { text: '良好', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' };
  if (cond >= 20) return { text: '一般', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
  return { text: '较差', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
}

function getConditionPenaltyMultiplier(vehicle) {
  var cond = getVehicleCondition(vehicle);
  if (cond < 20) return { fuelMult: 1.2, satisfactionPenalty: 0.85, acceptPenalty: 0.9, breakdownRisk: true };
  if (cond < 50) return { fuelMult: 1.15, satisfactionPenalty: 0.9, acceptPenalty: 0.95, breakdownRisk: false };
  if (cond < 80) return { fuelMult: 1.08, satisfactionPenalty: 0.95, acceptPenalty: 0.98, breakdownRisk: false };
  return { fuelMult: 1.0, satisfactionPenalty: 1.0, acceptPenalty: 1.0, breakdownRisk: false };
}

function maintainVehicle(vehicleId) {
  var vehicle = gameState.ownedVehicles.find(function(v){ return v.id === vehicleId; });
  if (!vehicle) return { ok: false, reason: '车辆不存在' };
  if (isInTransit(vehicleId)) return { ok: false, reason: '车辆正在调度中' };
  var cond = getVehicleCondition(vehicle);
  if (cond >= 100) return { ok: false, reason: '车况已满，无需保养' };
  var purchasePrice = vehicle.purchasePrice || vehicle.estimatedValue || 200000;
  var cost = Math.round(purchasePrice * 0.02 * (1 - cond / 100));
  cost = Math.max(200, cost);
  if (gameState.cash < cost) return { ok: false, reason: '资金不足，需要 ' + formatCurrency(cost) };
  gameState.cash -= cost;
  gameState.todayExpense += cost;
  var restoreAmount = Math.min(30, 100 - cond);
  vehicle.condition = Math.min(100, cond + restoreAmount);
  gameState._todayMaintainCount = (gameState._todayMaintainCount || 0) + 1;
  var newLabel = getConditionLabel(vehicle.condition);
  addMessage('🔧 保养 ' + vehicle.brand + ' ' + vehicle.model + '（' + vehicle.licensePlate + '），花费 ' + formatCurrency(cost) + '，车况 → ' + newLabel.text + '(' + vehicle.condition + '%)', 'good');
  updateUI(); saveGame();
  return { ok: true, cost: cost, restored: restoreAmount, newCondition: vehicle.condition };
}

function degradeAllVehicles() {
  gameState.ownedVehicles.forEach(function(v){
    if (v.condition === undefined) v.condition = 100;
    if (v.rentedUntil && v.rentedUntil >= gameState.currentDay) {
      v.condition = Math.max(0, v.condition - Math.round(Math.random() * 3 + 1));
    } else {
      v.condition = Math.max(0, v.condition - Math.round(Math.random() * 1 + 0.3));
    }
    v.condition = Math.max(0, v.condition);
  });
}

var DAILY_CHALLENGES = [
  { id:'orders_3', name:'完成订单', desc:'今日目标：完成3个订单', type:'orders', target:3, rewardMin:200, rewardMax:800, repMin:1, repMax:2 },
  { id:'orders_5', name:'高效运营', desc:'今日目标：完成5个订单', type:'orders', target:5, rewardMin:500, rewardMax:1500, repMin:1, repMax:2 },
  { id:'orders_8', name:'超级效率', desc:'今日目标：完成8个订单', type:'orders', target:8, rewardMin:1000, rewardMax:2000, repMin:2, repMax:3 },
  { id:'income_3000', name:'稳定收入', desc:'今日目标：收入超过$3000', type:'income', target:3000, rewardMin:300, rewardMax:1000, repMin:1, repMax:2 },
  { id:'income_5000', name:'业绩达标', desc:'今日目标：收入超过$5000', type:'income', target:5000, rewardMin:500, rewardMax:1500, repMin:1, repMax:3 },
  { id:'income_8000', name:'高收入日', desc:'今日目标：收入超过$8000', type:'income', target:8000, rewardMin:800, rewardMax:2000, repMin:2, repMax:3 },
  { id:'income_12000', name:'财富巅峰', desc:'今日目标：收入超过$12000', type:'income', target:12000, rewardMin:1200, rewardMax:2000, repMin:2, repMax:3 },
  { id:'suv_all', name:'SUV专精', desc:'今日目标：出租所有SUV', type:'vehicleType', targetType:'SUV', target:-1, rewardMin:400, rewardMax:1200, repMin:1, repMax:2 },
  { id:'sedan_all', name:'轿车专精', desc:'今日目标：出租所有轿车', type:'vehicleType', targetType:'轿车', target:-1, rewardMin:300, rewardMax:1000, repMin:1, repMax:2 },
  { id:'zero_reject', name:'完美服务', desc:'今日目标：零拒绝', type:'zeroReject', target:0, rewardMin:600, rewardMax:1800, repMin:2, repMax:3 },
  { id:'profit_2000', name:'盈利专家', desc:'今日目标：净利润超$2000', type:'profit', target:2000, rewardMin:400, rewardMax:1200, repMin:1, repMax:2 },
  { id:'profit_5000', name:'利润之王', desc:'今日目标：净利润超$5000', type:'profit', target:5000, rewardMin:800, rewardMax:2000, repMin:2, repMax:3 },
  { id:'maintain_3', name:'勤于保养', desc:'今日目标：保养3辆车', type:'maintain', target:3, rewardMin:300, rewardMax:900, repMin:1, repMax:2 },
  { id:'no_breakdown', name:'安全运营', desc:'今日目标：无车辆故障风险（车况均≥30%）', type:'noBreakdown', target:30, rewardMin:500, rewardMax:1500, repMin:1, repMax:2 },
  { id:'utilization_70', name:'高效利用', desc:'今日目标：车队利用率≥70%', type:'utilization', target:70, rewardMin:400, rewardMax:1200, repMin:1, repMax:2 },
  { id:'utilization_90', name:'满负荷运转', desc:'今日目标：车队利用率≥90%', type:'utilization', target:90, rewardMin:1000, rewardMax:2500, repMin:2, repMax:3 },
  { id:'new_member_2', name:'会员增长', desc:'今日目标：获得2名新会员', type:'newMember', target:2, rewardMin:300, rewardMax:800, repMin:1, repMax:2 },
  { id:'review_avg4', name:'口碑之星', desc:'今日目标：平均评价≥4星', type:'reviewScore', target:4, rewardMin:500, rewardMax:1500, repMin:1, repMax:3 },
  { id:'outlet_orders_5', name:'多网点运营', desc:'今日目标：各网点共完成5单', type:'totalOutletOrders', target:5, rewardMin:400, rewardMax:1200, repMin:1, repMax:2 },
  { id:'vip_orders_2', name:'VIP服务', desc:'今日目标：完成2笔会员订单', type:'vipOrders', target:2, rewardMin:350, rewardMax:1000, repMin:1, repMax:2 },
  { id:'fleet_10', name:'规模扩张', desc:'今日目标：拥有10辆以上可用车', type:'availableFleet', target:10, rewardMin:300, rewardMax:800, repMin:1, repMax:1 }
];

function generateDailyChallenge() {
  var challenge = DAILY_CHALLENGES[Math.floor(Math.random() * DAILY_CHALLENGES.length)];
  gameState.dailyChallenge = {
    id: challenge.id,
    name: challenge.name,
    desc: challenge.desc,
    type: challenge.type,
    targetType: challenge.targetType || null,
    target: challenge.target,
    progress: 0,
    completed: false,
    claimed: false,
    rewardCash: Math.floor(Math.random() * (challenge.rewardMax - challenge.rewardMin + 1)) + challenge.rewardMin,
    rewardRep: Math.floor(Math.random() * (challenge.repMax - challenge.repMin + 1)) + challenge.repMin
  };
  return gameState.dailyChallenge;
}

function checkChallengeProgress() {
  var ch = gameState.dailyChallenge;
  if (!ch || ch.completed || ch.claimed) return;
  switch(ch.type) {
    case 'orders':
      ch.progress = (gameState.outletOrderCounts ? Object.values(gameState.outletOrderCounts).reduce(function(s,v){return s+v;},0) : 0);
      break;
    case 'income':
      ch.progress = gameState.todayIncome || 0;
      break;
    case 'profit':
      ch.progress = Math.max(0, (gameState.todayIncome || 0) - (gameState.todayExpense || 0));
      break;
    case 'vehicleType': {
      var targetVehicles = gameState.ownedVehicles.filter(function(v){ return v.type === ch.targetType; });
      var rentedCount = targetVehicles.filter(function(v){ return v.rentedUntil && v.rentedUntil >= gameState.currentDay; }).length;
      ch.progress = rentedCount;
      ch.target = targetVehicles.length;
      break;
    }
    case 'zeroReject':
      ch.progress = 1;
      break;
    case 'maintain':
      ch.progress = gameState._todayMaintainCount || 0;
      break;
    case 'noBreakdown': {
      var lowCond = gameState.ownedVehicles.filter(function(v){ return (v.condition||100) < ch.target; }).length;
      ch.progress = lowCond === 0 ? 1 : 0;
      break;
    }
    case 'utilization': {
      var total = gameState.ownedVehicles.length;
      var rented = total > 0 ? gameState.ownedVehicles.filter(function(v){ return v.rentedUntil && v.rentedUntil >= gameState.currentDay; }).length : 0;
      var utilRate = total > 0 ? Math.round(rented / total * 100) : 0;
      ch.progress = utilRate;
      break;
    }
    case 'newMember':
      ch.progress = gameState._todayNewMembers || 0;
      break;
    case 'reviewScore': {
      var todayReviews = (gameState.customerReviews || []).filter(function(r){ return r.day === gameState.currentDay; });
      var avg = todayReviews.length > 0 ? todayReviews.reduce(function(s,r){return s+r.score;},0) / todayReviews.length : 0;
      ch.progress = avg;
      break;
    }
    case 'totalOutletOrders':
      ch.progress = (gameState.outletOrderCounts ? Object.values(gameState.outletOrderCounts).reduce(function(s,v){return s+v;},0) : 0);
      break;
    case 'vipOrders':
      ch.progress = gameState._todayVipOrders || 0;
      break;
    case 'availableFleet':
      ch.progress = gameState.ownedVehicles.filter(function(v){ return (!v.rentedUntil || v.rentedUntil < gameState.currentDay) && !isInTransit(v.id); }).length;
      break;
  }
  if (ch.type !== 'zeroReject' && ch.type !== 'noBreakdown') {
    if (ch.progress >= ch.target && !ch.completed) {
      ch.completed = true;
    }
  } else {
    if (ch.progress >= 1 && !ch.completed) {
      ch.completed = true;
    }
  }
}

function claimChallengeReward() {
  var ch = gameState.dailyChallenge;
  if (!ch || !ch.completed || ch.claimed) return { ok: false, reason: '无可领取奖励' };
  var streak = gameState.challengeStreak || 0;
  var multiplier = streak >= 6 ? 3 : streak >= 4 ? 2 : streak >= 2 ? 1.5 : 1;
  var cashReward = Math.round(ch.rewardCash * multiplier);
  var repReward = Math.min(3, Math.round(ch.rewardRep * (multiplier > 1 ? multiplier * 0.5 + 0.5 : 1)));
  gameState.cash += cashReward;
  gameState.todayIncome += cashReward;
  addReputation(repReward);
  ch.claimed = true;
  addMessage('🎯 挑战完成！' + ch.desc + ' — 奖金 ' + formatCurrency(cashReward) + (multiplier > 1 ? '（连续' + streak + '天 ×' + multiplier.toFixed(1) + '）' : '') + '，声誉 +' + repReward, 'good');
  updateUI(); saveGame();
  return { ok: true, cash: cashReward, rep: repReward, multiplier: multiplier };
}

function toggleAutoManage(outletId) {
  var os = getOutletState(outletId);
  if (!os) return;
  os.autoManageEnabled = !os.autoManageEnabled;
  addMessage(os.autoManageEnabled ? '🤖 ' + OUTLET_CONFIGS.find(function(c){ return c.id === outletId; }).name + ' 自动管理已开启' : '🤖 ' + OUTLET_CONFIGS.find(function(c){ return c.id === outletId; }).name + ' 自动管理已关闭', 'warn');
  saveGame();
  return os.autoManageEnabled;
}

function setAutoProfitThreshold(outletId, value) {
  var os = getOutletState(outletId);
  if (!os) return;
  os.autoProfitThreshold = Math.max(0, parseInt(value) || 100);
  saveGame();
}

function processAutoManagement() {
  var managedOutlets = gameState.outlets.filter(function(o){ return o.owned && o.autoManageEnabled; });
  if (managedOutlets.length === 0) return;
  var autoAccepted = 0;
  var autoRejected = 0;
  var autoMaintained = 0;
  var autoDispatched = 0;
  managedOutlets.forEach(function(outlet){
    var threshold = outlet.autoProfitThreshold || 100;
    var ordersToProcess = gameState.pendingOrders.filter(function(o){ return o.outletId === outlet.id; });
    ordersToProcess.forEach(function(order){
      if ((order.netIncome || 0) >= threshold) {
        try { acceptOrder(order.id); autoAccepted++; } catch(e) {}
      } else {
        try { rejectOrder(order.id); autoRejected++; } catch(e) {}
      }
    });
    var vehiclesAtOutlet = getVehiclesAtOutlet(outlet.id);
    vehiclesAtOutlet.forEach(function(v){
      var cond = getVehicleCondition(v);
      if (cond < 60 && cond > 0 && !(v.rentedUntil && v.rentedUntil >= gameState.currentDay) && !isInTransit(v.id)) {
        var result = maintainVehicle(v.id);
        if (result.ok) autoMaintained++;
      }
    });
    var availableHere = vehiclesAtOutlet.filter(function(v){ return (!v.rentedUntil || v.rentedUntil < gameState.currentDay) && !isInTransit(v.id); }).length;
    var capacity = getOutletCapacity(outlet.id);
    if (availableHere < capacity * 0.3 && gameState.outlets.filter(function(o){ return o.owned && o.id !== outlet.id; }).length > 0) {
      var otherOutlets = gameState.outlets.filter(function(o){ return o.owned && o.id !== outlet.id; });
      otherOutlets.forEach(function(otherO){
        var otherAvailable = getVehiclesAtOutlet(otherO.id).filter(function(vv){ return (!vv.rentedUntil || vv.rentedUntil < gameState.currentDay) && !isInTransit(vv.id); }).length;
        var otherCap = getOutletCapacity(otherO.id);
        if (otherAvailable > otherCap * 0.5) {
          var spareVehicles = getVehiclesAtOutlet(otherO.id).filter(function(vv){ return (!vv.rentedUntil || vv.rentedUntil < gameState.currentDay) && !isInTransit(vv.id); }).slice(0, 2);
          spareVehicles.forEach(function(sv){
            var dist = getDistanceBetweenOutlets(otherO.id, outlet.id);
            if (dist > 0 && gameState.cash >= dist * 100) {
              gameState.cash -= Math.round(dist * 100);
              gameState.transfers.push({ vehicleId: sv.id, fromOutletId: otherO.id, toOutletId: outlet.id, daysRemaining: Math.max(1, Math.ceil(dist / 25)), cost: Math.round(dist * 100) });
              autoDispatched++;
            }
          });
        }
      });
    }
  });
  if (autoAccepted > 0 || autoRejected > 0 || autoMaintained > 0 || autoDispatched > 0) {
    var msgParts = [];
    if (autoAccepted > 0) msgParts.push('自动接单 ' + autoAccepted);
    if (autoRejected > 0) msgParts.push('自动拒单 ' + autoRejected);
    if (autoMaintained > 0) msgParts.push('自动保养 ' + autoMaintained);
    if (autoDispatched > 0) msgParts.push('自动调度 ' + autoDispatched);
    addMessage('🤖 自动管理：' + msgParts.join(' / '), 'warn');
  }
}

function processCustomerLoyalty() {
  var loyalty = gameState.customerLoyalty;
  if (!loyalty) gameState.customerLoyalty = { returnRate: 0, totalReturns: 0, totalNewCustomers: 0, complaints: 0, referralCount: 0 };
  loyalty = gameState.customerLoyalty;
  var yesterdayOrders = (gameState.orderHistory || []).filter(function(o){ return o.acceptedDay === gameState.currentDay - 1; });
  var returningCustomers = 0;
  yesterdayOrders.forEach(function(order){
    if (order.memberId) {
      var member = gameState.members.find(function(m){ return m.id === order.memberId; });
      if (member && member.totalTrips > 1) returningCustomers++;
    }
  });
  loyalty.totalReturns += returningCustomers;
  var totalCustomers = yesterdayOrders.length || 1;
  loyalty.returnRate = Math.round(returningCustomers / totalCustomers * 100);
  if (Math.random() < loyalty.returnRate / 100 * 0.3) {
    loyalty.referralCount++;
    loyalty.totalNewCustomers++;
  }
}

function applyCustomerComplaints(customerName, rejectedCount) {
  var loyalty = gameState.customerLoyalty;
  if (!loyalty) gameState.customerLoyalty = { returnRate: 0, totalReturns: 0, totalNewCustomers: 0, complaints: 0, referralCount: 0 };
  loyalty = gameState.customerLoyalty;
  if (rejectedCount >= 3) {
    loyalty.complaints++;
    var penalty = Math.min(5, rejectedCount);
    addReputation(-penalty);
    addMessage('😠 客户投诉：' + customerName + ' 被拒绝' + rejectedCount + '次，声誉 -' + penalty, 'bad');
    return { complained: true, penalty: penalty };
  }
  return { complained: false, penalty: 0 };
}

function calculateVipTip(memberLevel, orderIncome) {
  if (memberLevel >= 4) {
    var tipRate = 0.05 + Math.random() * 0.10;
    return Math.round(orderIncome * tipRate);
  }
  if (memberLevel >= 3) {
    if (Math.random() < 0.3) {
      var tipRate = 0.03 + Math.random() * 0.07;
      return Math.round(orderIncome * tipRate);
    }
  }
  return 0;
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
