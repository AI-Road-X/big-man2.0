var facilitiesConfig = [
  { id:'waiting_room', name:'顾客休息室', baseLevel:2, cost:20000, dailyMaintenance:15, satisfactionBonus:5, incomeBonusPercent:8, icon:'🛋️', category:'amenity', requiredStaff:null },
  { id:'premium_lounge', name:'高级休息室', baseLevel:3, cost:50000, dailyMaintenance:35, satisfactionBonus:10, incomeBonusPercent:12, icon:'🪑', category:'amenity', requiredStaff:null },
  { id:'shower', name:'冲凉房', baseLevel:4, cost:80000, dailyMaintenance:60, satisfactionBonus:15, incomeBonusPercent:15, icon:'🚿', category:'amenity', requiredStaff:null },
  { id:'spa', name:'SPA间', baseLevel:4, cost:120000, dailyMaintenance:80, satisfactionBonus:20, incomeBonusPercent:20, icon:'💆', category:'amenity', requiredStaff:null },
  { id:'kids_zone', name:'儿童玩乐中心', baseLevel:5, cost:150000, dailyMaintenance:70, satisfactionBonus:18, incomeBonusPercent:18, icon:'🎠', category:'amenity', requiredStaff:null },
  { id:'business_center', name:'商务中心', baseLevel:4, cost:60000, dailyMaintenance:50, satisfactionBonus:12, incomeBonusPercent:12, icon:'💻', category:'amenity', requiredStaff:null },
  { id:'coffee_bar', name:'咖啡吧', baseLevel:3, cost:30000, dailyMaintenance:25, satisfactionBonus:8, incomeBonusPercent:10, icon:'☕', category:'amenity', requiredStaff:null },
  { id:'vip_lounge', name:'VIP休息室', baseLevel:5, cost:200000, dailyMaintenance:100, satisfactionBonus:25, incomeBonusPercent:25, icon:'👑', category:'amenity', requiredStaff:null },
  { id:'car_wash', name:'洗车房', baseLevel:2, cost:25000, dailyMaintenance:20, satisfactionBonus:3, incomeBonusPercent:5, icon:'🚗', category:'operational', requiredStaff:'car_washer', effect:'cleanliness' },
  { id:'express_repair', name:'快修车间', baseLevel:3, cost:40000, dailyMaintenance:30, satisfactionBonus:2, incomeBonusPercent:8, icon:'🔧', category:'operational', requiredStaff:'mechanic', effect:'repair' },
  { id:'staff_lounge', name:'员工休息室', baseLevel:2, cost:15000, dailyMaintenance:10, satisfactionBonus:0, incomeBonusPercent:0, icon:'🍵', category:'operational', requiredStaff:null, effect:'morale' },
  { id:'self_return', name:'自助还车机', baseLevel:3, cost:20000, dailyMaintenance:15, satisfactionBonus:2, incomeBonusPercent:3, icon:'📱', category:'operational', requiredStaff:null, effect:'order_capacity' },
  { id:'slow_charger', name:'慢充电桩', baseLevel:2, cost:18000, dailyMaintenance:12, satisfactionBonus:2, incomeBonusPercent:5, icon:'🔌', category:'operational', requiredStaff:null, effect:'ev_charge' },
  { id:'fast_charger', name:'快充电桩', baseLevel:4, cost:50000, dailyMaintenance:40, satisfactionBonus:5, incomeBonusPercent:12, icon:'⚡', category:'operational', requiredStaff:null, effect:'ev_charge' }
];

var CUSTOMER_FACILITY_PREFS = {
  business: ['business_center', 'vip_lounge', 'premium_lounge'],
  tourist: ['kids_zone', 'coffee_bar', 'spa'],
  commuter: ['shower', 'waiting_room']
};

var FACILITY_SERVICE_FEES = {
  business_center: 30,
  vip_lounge: 50,
  premium_lounge: 20,
  coffee_bar: 15,
  spa: 40,
  kids_zone: 25,
  shower: 10,
  waiting_room: 5
};

var FACILITY_POSITIVE_EVENTS = [
  { facilityMinLevel:4, text:'VIP客户在SPA间消费额外 $500', reward:500, prob:0.05 },
  { facilityMinLevel:4, text:'商务客户在商务中心签下大单，奖励 $1000', reward:1000, prob:0.05 },
  { facilityMinLevel:3, text:'咖啡吧今日爆满，额外收入 $300', reward:300, prob:0.04 },
  { facilityMinLevel:5, text:'VIP休息室接待贵宾，小费 $800', reward:800, prob:0.03 }
];

var FACILITY_NEGATIVE_EVENTS = [
  { text:'设施管道故障，紧急维修花费 $500', cost:500, duration:3, prob:0.02 },
  { text:'空调系统损坏，维修费用 $800', cost:800, duration:3, prob:0.015 },
  { text:'电路短路，修复费用 $300', cost:300, duration:2, prob:0.02 }
];

function getFacilityConfig(facilityId) {
  return facilitiesConfig.find(function(f){ return f.id === facilityId; });
}

function getOutletFacilities(outletId) {
  var os = getOutletState(outletId);
  if (!os) return [];
  return (os.facilities || []).map(function(fid){
    var cfg = getFacilityConfig(fid);
    var disabled = os.disabledFacilities && os.disabledFacilities.indexOf(fid) !== -1;
    var broken = os.brokenFacilities && os.brokenFacilities[fid] && os.brokenFacilities[fid] > gameState.currentDay;
    return { id: fid, config: cfg, disabled: disabled, broken: broken };
  }).filter(function(f){ return f.config; });
}

function getActiveFacilities(outletId) {
  return getOutletFacilities(outletId).filter(function(f){ return !f.disabled && !f.broken; });
}

function getOutletSatisfactionBonus(outletId) {
  return getActiveFacilities(outletId).reduce(function(s,f){ return s + f.config.satisfactionBonus; }, 0);
}

function getOutletIncomeBonusPercent(outletId) {
  return getActiveFacilities(outletId).reduce(function(s,f){ return s + f.config.incomeBonusPercent; }, 0);
}

function getOutletDailyMaintenance(outletId) {
  return getActiveFacilities(outletId).reduce(function(s,f){ return s + f.config.dailyMaintenance; }, 0);
}

function canPurchaseFacility(outletId, facilityId) {
  var os = getOutletState(outletId);
  if (!os) return { ok:false, reason:'网点不存在' };
  var cfg = getFacilityConfig(facilityId);
  if (!cfg) return { ok:false, reason:'设施不存在' };
  if (os.level < cfg.baseLevel) return { ok:false, reason:'网点等级不足（需要Lv.' + cfg.baseLevel + '）' };
  if (os.facilities && os.facilities.indexOf(facilityId) !== -1) return { ok:false, reason:'已拥有此设施' };
  if (gameState.cash < cfg.cost) return { ok:false, reason:'资金不足' };
  return { ok:true };
}

function purchaseFacility(outletId, facilityId) {
  var check = canPurchaseFacility(outletId, facilityId);
  if (!check.ok) return check;
  var os = getOutletState(outletId);
  var cfg = getFacilityConfig(facilityId);
  gameState.cash -= cfg.cost;
  if (!os.facilities) os.facilities = [];
  os.facilities.push(facilityId);
  addMessage(cfg.icon + ' ' + OUTLET_CONFIGS.find(function(c){return c.id===outletId;}).name + ' 购买了 ' + cfg.name + '，花费 ' + formatCurrency(cfg.cost), 'good');
  updateUI(); saveGame();
  return { ok:true };
}

function toggleFacility(outletId, facilityId) {
  var os = getOutletState(outletId);
  if (!os || !os.facilities || os.facilities.indexOf(facilityId) === -1) return;
  if (!os.disabledFacilities) os.disabledFacilities = [];
  var idx = os.disabledFacilities.indexOf(facilityId);
  if (idx === -1) {
    os.disabledFacilities.push(facilityId);
    addMessage('⏸️ ' + getFacilityConfig(facilityId).name + ' 已停用', 'warn');
  } else {
    os.disabledFacilities.splice(idx, 1);
    addMessage('▶️ ' + getFacilityConfig(facilityId).name + ' 已启用', 'good');
  }
  saveGame();
}

function hasPreferredFacility(outletId, customerType) {
  var prefs = CUSTOMER_FACILITY_PREFS[customerType] || [];
  var active = getActiveFacilities(outletId);
  return active.some(function(f){ return prefs.indexOf(f.id) !== -1; });
}

function getFacilityServiceFee(outletId, customerType) {
  var prefs = CUSTOMER_FACILITY_PREFS[customerType] || [];
  var active = getActiveFacilities(outletId);
  var fee = 0;
  active.forEach(function(f){
    if (prefs.indexOf(f.id) !== -1) {
      fee += FACILITY_SERVICE_FEES[f.id] || 0;
    }
  });
  return fee;
}

function processFacilityEvents() {
  var totalBonus = 0;
  var totalCost = 0;
  gameState.outlets.filter(function(o){ return o.owned; }).forEach(function(outlet){
    var active = getActiveFacilities(outlet.id);
    var hasHighLevel = active.some(function(f){ return f.config.baseLevel >= 4; });
    if (hasHighLevel && Math.random() < 0.05) {
      var eligible = FACILITY_POSITIVE_EVENTS.filter(function(e){ return hasHighLevel; });
      if (eligible.length > 0) {
        var evt = eligible[Math.floor(Math.random() * eligible.length)];
        totalBonus += evt.reward;
        addMessage('🎉 ' + OUTLET_CONFIGS.find(function(c){return c.id===outlet.id;}).name + '：' + evt.text, 'good');
      }
    }
    if (active.length > 0 && Math.random() < 0.02) {
      var negEvt = FACILITY_NEGATIVE_EVENTS[Math.floor(Math.random() * FACILITY_NEGATIVE_EVENTS.length)];
      totalCost += negEvt.cost;
      if (!outlet.brokenFacilities) outlet.brokenFacilities = {};
      var randomFacility = active[Math.floor(Math.random() * active.length)];
      outlet.brokenFacilities[randomFacility.id] = gameState.currentDay + negEvt.duration;
      addMessage('⚠️ ' + OUTLET_CONFIGS.find(function(c){return c.id===outlet.id;}).name + '：' + negEvt.text + '（' + randomFacility.config.name + '暂停' + negEvt.duration + '天）', 'bad');
    }
  });
  if (totalBonus > 0) { gameState.cash += totalBonus; gameState.todayIncome += totalBonus; }
  if (totalCost > 0) { gameState.cash -= totalCost; gameState.todayExpense += totalCost; }
  return { bonus: totalBonus, cost: totalCost };
}

function processFacilityMaintenance() {
  var total = 0;
  gameState.outlets.filter(function(o){ return o.owned; }).forEach(function(outlet){
    var maint = getOutletDailyMaintenance(outlet.id);
    total += maint;
  });
  if (total > 0) {
    gameState.cash -= total;
    gameState.todayExpense += total;
  }
  return total;
}

function getFacilityIncomeReport() {
  var report = {};
  gameState.outlets.filter(function(o){ return o.owned; }).forEach(function(outlet){
    var active = getActiveFacilities(outlet.id);
    active.forEach(function(f){
      if (!report[f.id]) report[f.id] = { name: f.config.name, icon: f.config.icon, totalFee: 0, outlets: [] };
      report[f.id].outlets.push(outlet.id);
    });
  });
  return report;
}

function hasOperationalFacility(outletId, effectType) {
  var active = getActiveFacilities(outletId);
  return active.some(function(f){ return f.config.effect === effectType; });
}

function getOperationalFacilityEffectiveness(outletId, facilityId) {
  var active = getActiveFacilities(outletId);
  var facility = active.find(function(f){ return f.id === facilityId; });
  if (!facility) return 0;
  if (!facility.config.requiredStaff) return 1.0;
  var employees = getEmployeesAtOutlet(outletId);
  var hasRequiredStaff = employees.some(function(e){ return e.type === facility.config.requiredStaff; });
  return hasRequiredStaff ? 1.0 : 0.5;
}

function getOutletOrderCapacityBonus(outletId) {
  var active = getActiveFacilities(outletId);
  var baseBonus = active.reduce(function(s, f){ return s + f.config.incomeBonusPercent; }, 0);
  var selfReturnActive = active.some(function(f){ return f.id === 'self_return' && !f.disabled && !f.broken; });
  if (selfReturnActive) {
    var eff = getOperationalFacilityEffectiveness(outletId, 'self_return');
    baseBonus += 20 * eff;
  }
  return baseBonus;
}

function getOutletMoraleDecayReduction(outletId) {
  var active = getActiveFacilities(outletId);
  var hasStaffLounge = active.some(function(f){ return f.id === 'staff_lounge' && !f.disabled && !f.broken; });
  return hasStaffLounge ? 3 : 5;
}

function getOutletEVChargeBonus(outletId) {
  var active = getActiveFacilities(outletId);
  var bonus = 0;
  var slowCharger = active.find(function(f){ return f.id === 'slow_charger' && !f.disabled && !f.broken; });
  var fastCharger = active.find(function(f){ return f.id === 'fast_charger' && !f.disabled && !f.broken; });
  if (slowCharger) bonus += 5 * getOperationalFacilityEffectiveness(outletId, 'slow_charger');
  if (fastCharger) bonus += 15 * getOperationalFacilityEffectiveness(outletId, 'fast_charger');
  return bonus;
}

function processCarWashReturn(outletId) {
  var active = getActiveFacilities(outletId);
  var carWash = active.find(function(f){ return f.id === 'car_wash' && !f.disabled && !f.broken; });
  if (!carWash) return 0;
  var vehicles = getVehiclesAtOutlet(outletId);
  var returningVehicles = vehicles.filter(function(v){ return v.rentedUntil && v.rentedUntil < gameState.currentDay && !isInTransit(v.id); });
  var maxCarsPerDay = 20;
  var washed = 0;
  var effectiveness = getOperationalFacilityEffectiveness(outletId, 'car_wash');
  returningVehicles.slice(0, maxCarsPerDay).forEach(function(v) {
    if (!v.cleanliness) v.cleanliness = 80;
    v.cleanliness = Math.min(100, v.cleanliness + 20 * effectiveness);
    washed++;
  });
  return washed;
}

function getRepairCostReduction(outletId) {
  var active = getActiveFacilities(outletId);
  var expressRepair = active.find(function(f){ return f.id === 'express_repair' && !f.disabled && !f.broken; });
  if (!expressRepair) return 0;
  var effectiveness = getOperationalFacilityEffectiveness(outletId, 'express_repair');
  return 0.3 * effectiveness;
}

function getRepairTimeReduction(outletId) {
  var active = getActiveFacilities(outletId);
  var expressRepair = active.find(function(f){ return f.id === 'express_repair' && !f.disabled && !f.broken; });
  if (!expressRepair) return 0;
  var effectiveness = getOperationalFacilityEffectiveness(outletId, 'express_repair');
  return 0.5 * effectiveness;
}

function getDecorationSatisfactionBonus(outletId) {
  if (!gameState.decorations) return 0;
  return gameState.decorations.filter(function(d){ return d.outletId === outletId; }).reduce(function(s, d){ return s + d.satisfactionBonus; }, 0);
}

function addOperationalFacility(outletId, facilityId) {
  var os = getOutletState(outletId);
  if (!os) return;
  if (!os.facilities) os.facilities = [];
  if (os.facilities.indexOf(facilityId) === -1) {
    os.facilities.push(facilityId);
    saveGame();
  }
}
