var RANDOM_EVENTS = [
  { id:'oil_up', name:'油价上涨', desc:'未来3天维护成本+20%', icon:'⛽', effect:{maintenanceMultiplier:1.2}, duration:3 },
  { id:'oil_down', name:'油价下跌', desc:'未来3天油耗成本-15%', icon:'📉', effect:{fuelMultiplier:0.85}, duration:3 },
  { id:'car_show', name:'车展活动', desc:'跑车/超跑需求翻倍', icon:'🏎️', effect:{typeDemandMultiplier:{'跑车':2,'超跑':2}}, duration:3 },
  { id:'holiday', name:'旅游旺季', desc:'SUV和MPV需求+50%', icon:'🏖️', effect:{typeDemandMultiplier:{'SUV':1.5,'MPV':1.5}}, duration:3 },
  { id:'biz_boom', name:'商务出差高峰', desc:'轿车和豪华车需求+60%', icon:'💼', effect:{typeDemandMultiplier:{'轿车':1.6,'豪华车':1.6}}, duration:3 },
  { id:'rainy', name:'雨季来临', desc:'SUV需求+30%，跑车需求-40%', icon:'🌧️', effect:{typeDemandMultiplier:{'SUV':1.3,'跑车':0.6}}, duration:3 },
  { id:'new_comp', name:'新竞争对手', desc:'市场系数-10%', icon:'🏪', effect:{marketCoeffDelta:-0.1}, duration:3 },
  { id:'subsidy', name:'新能源补贴', desc:'电动车需求+40%', icon:'🔋', effect:{fuelDemandMultiplier:{'纯电':1.4,'插电混动':1.3,'增程':1.2}}, duration:3 },
  { id:'downturn', name:'经济下行', desc:'所有需求-20%', icon:'📉', effect:{demandMultiplier:0.8}, duration:3 },
  { id:'festival', name:'节日促销', desc:'所有需求+25%', icon:'🎉', effect:{demandMultiplier:1.25}, duration:3 }
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
  var effects = { maintenanceMultiplier:1, fuelMultiplier:1, demandMultiplier:1, typeDemandMultiplier:{}, fuelDemandMultiplier:{}, marketCoeffDelta:0 };
  gameState.activeEvents.forEach(function(e){
    if (e.effect.maintenanceMultiplier) effects.maintenanceMultiplier *= e.effect.maintenanceMultiplier;
    if (e.effect.fuelMultiplier) effects.fuelMultiplier *= e.effect.fuelMultiplier;
    if (e.effect.demandMultiplier) effects.demandMultiplier *= e.effect.demandMultiplier;
    if (e.effect.marketCoeffDelta) effects.marketCoeffDelta += e.effect.marketCoeffDelta;
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
  var base = vehicle.dailyRate;
  var typeMultiplier = getRateMultiplier(vehicle.type);
  var marketCoeff = gameState.marketCoefficient;
  return Math.round(base * typeMultiplier * marketCoeff);
}
