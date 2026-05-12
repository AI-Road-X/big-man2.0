var RANDOM_EVENTS = [
  { id:'oil_up', name:'油价上涨', desc:'未来3天维护成本+20%', icon:'⛽', effect:{maintenanceMultiplier:1.2}, duration:3 },
  { id:'oil_down', name:'油价下跌', desc:'未来3天油耗成本-15%', icon:'📉', effect:{fuelMultiplier:0.85}, duration:3 },
  { id:'car_show', name:'车展活动', desc:'跑车/超跑需求翻倍', icon:'🏎️', effect:{typeDemandMultiplier:{'跑车':2,'超跑':2}}, duration:3 },
  { id:'holiday', name:'旅游旺季', desc:'SUV和MPV需求+50%', icon:'🏖️', effect:{typeDemandMultiplier:{'SUV':1.5,'MPV':1.5}}, duration:3 },
  { id:'biz_boom', name:'商务出差高峰', desc:'轿车和豪华车需求+60%', icon:'💼', effect:{typeDemandMultiplier:{'轿车':1.6,'豪华车':1.6}}, duration:3 },
  { id:'rainy', name:'雨季来临', desc:'SUV需求+30%，跑车需求-40%', icon:'🌧️', effect:{typeDemandMultiplier:{'SUV':1.3,'跑车':0.6}}, duration:3 },
  { id:'new_comp', name:'新竞争对手', desc:'市场系数-10%', icon:'🏪', effect:{marketCoeffDelta:-0.1}, duration:3 },
  { id:'subsidy', name:'新能源补贴', desc:'电动车需求+40%', icon:'🔋', effect:{fuelDemandMultiplier:{'纯电':1.4,'插电混动':1.3,'增程':1.2,'混动':1.2}}, duration:3 },
  { id:'downturn', name:'经济下行', desc:'所有需求-20%', icon:'📉', effect:{demandMultiplier:0.8}, duration:3 },
  { id:'festival', name:'节日促销', desc:'所有需求+25%', icon:'🎉', effect:{demandMultiplier:1.25}, duration:3 },
  { id:'energy_crisis', name:'能源短缺', desc:'油价+40%，电价+30%', icon:'⚡', effect:{oilPriceDelta:0.4, electricityPriceDelta:0.3}, duration:3 },
  { id:'oil_glut', name:'原油过剩', desc:'油价-25%', icon:'🛢️', effect:{oilPriceDelta:-0.25}, duration:3 },
  { id:'power_surplus', name:'电力充裕', desc:'电价-20%', icon:'💡', effect:{electricityPriceDelta:-0.2}, duration:3 },
  { id:'oil_crisis', name:'石油危机', desc:'油价暴涨30%！', icon:'🔥', effect:{oilPriceDelta:0.3, demandMultiplier:0.9}, duration:3 },
  { id:'green_energy', name:'绿色能源革命', desc:'电价-30%，电动车需求+50%', icon:'🌱', effect:{electricityPriceDelta:-0.3, fuelDemandMultiplier:{'纯电':1.5,'插电混动':1.4,'增程':1.3,'混动':1.3}}, duration:3 }
];

function checkRandomEvent() {
  if (Math.random() > 0.20) return null;
  var available = RANDOM_EVENTS.filter(function(e){
    return !gameState.activeEvents.some(function(ae){ return ae.id === e.id; });
  });
  if (available.length === 0) return null;
  var event = available[Math.floor(Math.random() * available.length)];
  var activeEvent = {
    id: event.id, name: event.name, desc: event.desc, icon: event.icon,
    effect: JSON.parse(JSON.stringify(event.effect)),
    startDay: gameState.currentDay, endDay: gameState.currentDay + event.duration
  };
  gameState.activeEvents.push(activeEvent);
  return activeEvent;
}

function processEventExpiry() {
  var expired = gameState.activeEvents.filter(function(e){ return gameState.currentDay >= e.endDay; });
  gameState.activeEvents = gameState.activeEvents.filter(function(e){ return gameState.currentDay < e.endDay; });
  expired.forEach(function(e){
    addMessage(e.icon + ' 事件「' + e.name + '」效果已恢复', 'warn');
  });
}

function getEventEffects() {
  var effects = { maintenanceMultiplier:1, fuelMultiplier:1, demandMultiplier:1, typeDemandMultiplier:{}, fuelDemandMultiplier:{}, marketCoeffDelta:0, oilPriceDelta:0, electricityPriceDelta:0 };
  gameState.activeEvents.forEach(function(e){
    if (e.effect.maintenanceMultiplier) effects.maintenanceMultiplier *= e.effect.maintenanceMultiplier;
    if (e.effect.fuelMultiplier) effects.fuelMultiplier *= e.effect.fuelMultiplier;
    if (e.effect.demandMultiplier) effects.demandMultiplier *= e.effect.demandMultiplier;
    if (e.effect.marketCoeffDelta) effects.marketCoeffDelta += e.effect.marketCoeffDelta;
    if (e.effect.oilPriceDelta) effects.oilPriceDelta += e.effect.oilPriceDelta;
    if (e.effect.electricityPriceDelta) effects.electricityPriceDelta += e.effect.electricityPriceDelta;
    if (e.effect.typeDemandMultiplier) {
      Object.keys(e.effect.typeDemandMultiplier).forEach(function(k){
        effects.typeDemandMultiplier[k] = (effects.typeDemandMultiplier[k] || 1) * e.effect.typeDemandMultiplier[k];
      });
    }
    if (e.effect.fuelDemandMultiplier) {
      Object.keys(e.effect.fuelDemandMultiplier).forEach(function(k){
        effects.fuelDemandMultiplier[k] = (effects.fuelDemandMultiplier[k] || 1) * e.effect.fuelDemandMultiplier[k];
      });
    }
  });
  return effects;
}

function updateCompetitorPricing() {
  if ((gameState.currentDay - gameState.lastCompetitorUpdate) % 7 !== 0) return false;
  var oldCoeff = gameState.marketCoefficient;
  gameState.marketCoefficient = Math.round((0.8 + Math.random() * 0.4) * 100) / 100;
  gameState.lastCompetitorUpdate = gameState.currentDay;
  return { oldCoeff: oldCoeff, newCoeff: gameState.marketCoefficient };
}

function initRateMultipliers() {
  var types = Object.values(VEHICLE_TYPES);
  types.forEach(function(t){
    if (gameState.rateMultipliers[t] === undefined) gameState.rateMultipliers[t] = 1.0;
  });
}

function setRateMultiplier(type, multiplier) {
  multiplier = Math.max(0.5, Math.min(2.0, multiplier));
  gameState.rateMultipliers[type] = Math.round(multiplier * 100) / 100;
  saveGame();
}

function getRateMultiplier(type) {
  return gameState.rateMultipliers[type] || 1.0;
}

function getEffectiveDailyRate(vehicle) {
  var base = vehicle.dailyRate || 200;
  var typeMultiplier = getRateMultiplier(vehicle.type) || 1.0;
  var marketCoeff = gameState.marketCoefficient || 1.0;
  return Math.round(base * typeMultiplier * marketCoeff);
}

function updateEnergyPrices() {
  var en = gameState.energy;
  en.prevOilPrice = en.oilPrice;
  en.prevElectricityPrice = en.electricityPrice;

  var oilFactor = 0.95 + Math.random() * 0.10;
  var elecFactor = 0.95 + Math.random() * 0.10;

  en.oilPrice = Math.round(en.oilPrice * oilFactor * 100) / 100;
  en.electricityPrice = Math.round(en.electricityPrice * elecFactor * 100) / 100;

  var eventEffects = getEventEffects();
  if (eventEffects.oilPriceDelta) {
    en.oilPrice = Math.round(en.oilPrice * (1 + eventEffects.oilPriceDelta) * 100) / 100;
  }
  if (eventEffects.electricityPriceDelta) {
    en.electricityPrice = Math.round(en.electricityPrice * (1 + eventEffects.electricityPriceDelta) * 100) / 100;
  }

  en.oilPrice = Math.max(3, Math.min(20, en.oilPrice));
  en.electricityPrice = Math.max(0.3, Math.min(5, en.electricityPrice));

  if (!gameState.priceHistory) gameState.priceHistory = { oil:[], electricity:[] };
  gameState.priceHistory.oil.push(en.oilPrice);
  gameState.priceHistory.electricity.push(en.electricityPrice);
  if (gameState.priceHistory.oil.length > 30) gameState.priceHistory.oil.shift();
  if (gameState.priceHistory.electricity.length > 30) gameState.priceHistory.electricity.shift();

  var messages = [];
  if (en.oilPrice > en.prevOilPrice + 0.01) {
    messages.push('油价上涨至 ' + en.oilPrice.toFixed(2) + ' 元/升 ⬆');
  } else if (en.oilPrice < en.prevOilPrice - 0.01) {
    messages.push('油价下跌至 ' + en.oilPrice.toFixed(2) + ' 元/升 ⬇');
  }
  if (en.electricityPrice > en.prevElectricityPrice + 0.01) {
    messages.push('电价上涨至 ' + en.electricityPrice.toFixed(2) + ' 元/度 ⬆');
  } else if (en.electricityPrice < en.prevElectricityPrice - 0.01) {
    messages.push('电价下跌至 ' + en.electricityPrice.toFixed(2) + ' 元/度 ⬇');
  }
  return messages;
}

function isFuelVehicle(fuelType) {
  return fuelType === FUEL_TYPES.GASOLINE || fuelType === FUEL_TYPES.DIESEL || fuelType === FUEL_TYPES.HYBRID;
}

function isElectricVehicle(fuelType) {
  return fuelType === FUEL_TYPES.ELECTRIC || fuelType === FUEL_TYPES.PLUGIN_HYBRID || fuelType === FUEL_TYPES.RANGE_EXTENDER;
}

function isHybridVehicle(fuelType) {
  return fuelType === FUEL_TYPES.HYBRID || fuelType === FUEL_TYPES.PLUGIN_HYBRID || fuelType === FUEL_TYPES.RANGE_EXTENDER;
}
