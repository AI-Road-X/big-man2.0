var EMPLOYEE_TYPES = { MANAGER: '店长', SALESPERSON: '销售员', MECHANIC: '维修工', DRIVER: '司机', CAR_WASHER: '洗车工' };

var DEFAULT_SALARIES = {};
DEFAULT_SALARIES[EMPLOYEE_TYPES.MANAGER] = 80;
DEFAULT_SALARIES[EMPLOYEE_TYPES.SALESPERSON] = 50;
DEFAULT_SALARIES[EMPLOYEE_TYPES.MECHANIC] = 45;
DEFAULT_SALARIES[EMPLOYEE_TYPES.DRIVER] = 40;
DEFAULT_SALARIES[EMPLOYEE_TYPES.CAR_WASHER] = 35;

var RECRUITMENT_FEE = 2000;
var TRAINING_COST = 3000;
var TEAM_BUILDING_COST = 5000;
var TEAM_BUILDING_COOLDOWN = 7;

function generateEmployeeId() {
  var prefix = 'EMP';
  var ts = Date.now().toString(36).toUpperCase();
  var rand = Math.random().toString(36).substr(2, 4).toUpperCase();
  return prefix + ts.slice(-4) + rand;
}

function generateEmployeeName() {
  var surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
  var given = GIVEN_NAMES[Math.floor(Math.random() * GIVEN_NAMES.length)];
  return surname + given;
}

function generateEmployee(type) {
  return {
    id: generateEmployeeId(),
    name: generateEmployeeName(),
    type: type,
    outletId: null,
    salary: DEFAULT_SALARIES[type] || 50,
    morale: Math.floor(Math.random() * 41) + 50,
    skillLevel: Math.floor(Math.random() * 3) + 1,
    hireDay: gameState.currentDay,
    onStrike: false
  };
}

function generateJobCandidates(count) {
  var types = [EMPLOYEE_TYPES.MANAGER, EMPLOYEE_TYPES.SALESPERSON, EMPLOYEE_TYPES.MECHANIC, EMPLOYEE_TYPES.DRIVER, EMPLOYEE_TYPES.CAR_WASHER];
  var candidates = [];
  for (var i = 0; i < count; i++) {
    var type = types[Math.floor(Math.random() * types.length)];
    var baseSalary = DEFAULT_SALARIES[type] || 50;
    var expectedSalary = Math.round(baseSalary * (0.8 + Math.random() * 0.6));
    var candidate = generateEmployee(type);
    candidate.expectedSalary = expectedSalary;
    candidate.salary = expectedSalary;
    candidates.push(candidate);
  }
  return candidates;
}

function hireEmployee(candidate, outletId) {
  if (gameState.cash < RECRUITMENT_FEE) {
    showToast('资金不足，无法招聘！', 'error');
    return null;
  }
  if (!gameState.employees) gameState.employees = [];
  gameState.cash -= RECRUITMENT_FEE;
  candidate.outletId = outletId;
  candidate.hireDay = gameState.currentDay;
  candidate.onStrike = false;
  gameState.employees.push(candidate);
  addMessage('👷 招聘 ' + candidate.name + '（' + candidate.type + '）加入网点，招聘费 ' + formatCurrency(RECRUITMENT_FEE), 'good');
  updateUI(); saveGame();
  return candidate;
}

function fireEmployee(employeeId) {
  if (!gameState.employees) return;
  var idx = gameState.employees.findIndex(function(e){ return e.id === employeeId; });
  if (idx === -1) return;
  var emp = gameState.employees[idx];
  gameState.employees.splice(idx, 1);
  addMessage('👷 解雇 ' + emp.name + '（' + emp.type + '）', 'bad');
  updateUI(); saveGame();
}

function trainEmployee(employeeId) {
  if (!gameState.employees) return;
  var emp = gameState.employees.find(function(e){ return e.id === employeeId; });
  if (!emp) return;
  if (emp.skillLevel >= 5) {
    showToast('该员工技能已满级！', 'error');
    return;
  }
  if (gameState.cash < TRAINING_COST) {
    showToast('资金不足，无法培训！', 'error');
    return;
  }
  gameState.cash -= TRAINING_COST;
  emp.skillLevel = Math.min(5, emp.skillLevel + 1);
  emp.morale = Math.min(100, emp.morale + 5);
  addMessage('📚 培训 ' + emp.name + '，技能提升至 Lv.' + emp.skillLevel + '，花费 ' + formatCurrency(TRAINING_COST), 'good');
  updateUI(); saveGame();
}

function raiseSalary(employeeId) {
  if (!gameState.employees) return;
  var emp = gameState.employees.find(function(e){ return e.id === employeeId; });
  if (!emp) return;
  emp.salary = Math.round(emp.salary * 1.1);
  emp.morale = Math.min(100, emp.morale + 15);
  addMessage('💰 为 ' + emp.name + ' 加薪至 ' + formatCurrency(emp.salary) + '/hr，士气提升', 'good');
  updateUI(); saveGame();
}

function teamBuildingActivity() {
  if (!gameState.employees || gameState.employees.length === 0) {
    showToast('没有员工可以团建！', 'error');
    return;
  }
  if (gameState.lastTeamBuildingDay !== undefined && gameState.lastTeamBuildingDay !== null) {
    var daysSince = gameState.currentDay - gameState.lastTeamBuildingDay;
    if (daysSince < TEAM_BUILDING_COOLDOWN) {
      showToast('团建冷却中，还需等待 ' + (TEAM_BUILDING_COOLDOWN - daysSince) + ' 天', 'error');
      return;
    }
  }
  if (gameState.cash < TEAM_BUILDING_COST) {
    showToast('资金不足，无法团建！', 'error');
    return;
  }
  gameState.cash -= TEAM_BUILDING_COST;
  gameState.lastTeamBuildingDay = gameState.currentDay;
  gameState.employees.forEach(function(emp){
    emp.morale = Math.min(100, emp.morale + 10);
  });
  addMessage('🎉 团建活动！全体员工士气+10，花费 ' + formatCurrency(TEAM_BUILDING_COST), 'good');
  updateUI(); saveGame();
}

function getEmployeesAtOutlet(outletId) {
  if (!gameState.employees) return [];
  return gameState.employees.filter(function(e){ return e.outletId === outletId; });
}

function getOutletServiceEfficiency(outletId) {
  var employees = getEmployeesAtOutlet(outletId);
  var vehicles = getVehiclesAtOutlet(outletId);
  var vehicleCount = vehicles.length;
  var efficiency = 1.0;

  var hasManager = employees.some(function(e){ return e.type === EMPLOYEE_TYPES.MANAGER; });
  if (hasManager) efficiency += 0.1;

  var salesCount = employees.filter(function(e){ return e.type === EMPLOYEE_TYPES.SALESPERSON; }).length;
  var salesNeeded = Math.ceil(vehicleCount / 10);
  if (salesNeeded > 0) {
    efficiency += Math.floor(salesCount / salesNeeded) * 0.1;
  }

  var driverCount = employees.filter(function(e){ return e.type === EMPLOYEE_TYPES.DRIVER; }).length;

  if (employees.length > 0) {
    var totalMorale = employees.reduce(function(s, e){ return s + e.morale; }, 0);
    var avgMorale = totalMorale / employees.length;
    if (avgMorale > 80) efficiency += 0.1;
    if (avgMorale < 30) efficiency -= 0.2;

    var totalSkill = employees.reduce(function(s, e){ return s + e.skillLevel; }, 0);
    var avgSkill = totalSkill / employees.length;
    efficiency += avgSkill * 0.02;
  }

  efficiency = Math.max(0.8, Math.min(1.2, efficiency));

  return {
    efficiency: efficiency,
    hasManager: hasManager,
    salesCount: salesCount,
    mechanicCount: employees.filter(function(e){ return e.type === EMPLOYEE_TYPES.MECHANIC; }).length,
    driverCount: driverCount,
    deliveryCapacity: driverCount * 5,
    maintenanceCostReduction: Math.floor(employees.filter(function(e){ return e.type === EMPLOYEE_TYPES.MECHANIC; }).length / 5) * 0.05
  };
}

function processDailyEmployeeEffects() {
  if (!gameState.employees) return 0;
  var totalWages = 0;

  gameState.employees.forEach(function(emp){
    var moraleChange = Math.floor(Math.random() * 11) - 5;
    emp.morale = Math.max(0, Math.min(100, emp.morale + moraleChange));

    var defaultSalary = DEFAULT_SALARIES[emp.type] || 50;
    if (emp.salary < defaultSalary * 0.8) {
      emp.morale = Math.max(0, emp.morale - 5);
    }

    if (emp.morale < 30) {
      emp.onStrike = true;
    } else {
      emp.onStrike = false;
    }

    totalWages += emp.salary;
  });

  gameState.cash -= totalWages;
  gameState.todayExpense += totalWages;

  return totalWages;
}

function getRecommendedStaffing(outletId) {
  var vehicles = getVehiclesAtOutlet(outletId);
  var vehicleCount = vehicles.length;
  return {
    managers: 1,
    salespersons: Math.ceil(vehicleCount / 10),
    mechanics: Math.ceil(vehicleCount / 5),
    drivers: Math.max(1, Math.ceil(vehicleCount / 15))
  };
}

var SHIFT_TYPES = {
  EARLY: { id: 'early', name: '早班', hours: [6, 14], duration: 8 },
  MIDDLE: { id: 'middle', name: '中班', hours: [14, 22], duration: 8 },
  NIGHT: { id: 'night', name: '晚班', hours: [22, 6], duration: 8 },
  FULLDAY: { id: 'fullday', name: '全天', hours: [6, 22], duration: 16 }
};

var SHIFT_NAMES = { early: '早班(6-14)', middle: '中班(14-22)', night: '晚班(22-6)', fullday: '全天(6-22)' };

var MIN_STAFF_PER_SHIFT = {
  managers: 1,
  salespersons: 2,
  mechanics: 1,
  drivers: 1,
  car_washers: 1
};

var TRAINING_PROGRAMS = {
  sales: { name: '销售培训', cost: 500, duration: 3, skillGain: 10, skillKey: 'salesSkill', icon: '💰' },
  service: { name: '服务礼仪', cost: 300, duration: 2, skillGain: 10, skillKey: 'serviceSkill', icon: '🤝' },
  repair: { name: '维修认证', cost: 800, duration: 5, skillGain: 20, skillKey: 'repairSkill', icon: '🔧' },
  management: { name: '管理进修', cost: 1500, duration: 7, skillGain: 15, skillKey: 'managementSkill', icon: '📊' }
};

var CERTIFICATION_LEVELS = ['初级', '中级', '高级', '专家'];

var PERFORMANCE_RATINGS = [
  { grade: 'S', label: 'S - 卓越', bonusPercent: 0.5, color: '#f59e0b', desc: '奖金50%月薪 + 晋升考虑' },
  { grade: 'A', label: 'A - 优秀', bonusPercent: 0.25, color: '#22c55e', desc: '奖金25%月薪' },
  { grade: 'B', label: 'B - 良好', bonusPercent: 0, color: '#3b82f6', desc: '正常薪资' },
  { grade: 'C', label: 'C - 待改进', bonusPercent: 0, color: '#f59e0b', desc: '无奖金，警告一次' },
  { grade: 'D', label: 'D - 不合格', bonusPercent: 0, color: '#ef4444', desc: '降职风险，可能解雇讨论' }
];

var ROLE_BASE_SKILLS = {
  '店长': { salesSkill: 40, serviceSkill: 50, repairSkill: 15, managementSkill: 60 },
  '销售员': { salesSkill: 50, serviceSkill: 45, repairSkill: 10, managementSkill: 20 },
  '维修工': { salesSkill: 15, serviceSkill: 30, repairSkill: 60, managementSkill: 10 },
  '司机': { salesSkill: 25, serviceSkill: 35, repairSkill: 25, managementSkill: 15 },
  '洗车工': { salesSkill: 10, serviceSkill: 55, repairSkill: 20, managementSkill: 10 }
};

function initEmployeeSkills(emp) {
  if (!emp.skills) {
    var base = ROLE_BASE_SKILLS[emp.type] || ROLE_BASE_SKILLS['销售员'];
    emp.skills = {
      salesSkill: base.salesSkill + Math.floor(Math.random() * 16) - 8,
      serviceSkill: base.serviceSkill + Math.floor(Math.random() * 16) - 8,
      repairSkill: base.repairSkill + Math.floor(Math.random() * 16) - 8,
      managementSkill: base.managementSkill + Math.floor(Math.random() * 16) - 8
    };
    Object.keys(emp.skills).forEach(function(k){ emp.skills[k] = Math.max(0, Math.min(100, emp.skills[k])); });
  }
  if (!emp.certifications) emp.certifications = [];
  if (!emp.trainingHistory) emp.trainingHistory = [];
  if (!emp.preferredShifts) emp.preferredShifts = ['middle'];
  if (emp.maxConsecutiveDays === undefined) emp.maxConsecutiveDays = 5;
  if (emp.restRequired === undefined) emp.restRequired = 1;
  if (emp.performanceKPIs === undefined) emp.performanceKPIs = {};
  if (emp.totalOrdersClosed === undefined) emp.totalOrdersClosed = 0;
  if (emp.totalRepairsDone === undefined) emp.totalRepairsDone = 0;
  if (emp.totalDeliveries === undefined) emp.totalDeliveries = 0;
  if (emp.totalCarsWashed === undefined) emp.totalCarsWashed = 0;
  if (emp.accidentCount === undefined) emp.accidentCount = 0;
  if (emp.upsellCount === undefined) emp.upsellCount = 0;
  if (emp.hireDay === undefined) emp.hireDay = gameState.currentDay;
}

function generateEmployee(type) {
  var emp = {
    id: generateEmployeeId(),
    name: generateEmployeeName(),
    type: type,
    outletId: null,
    salary: DEFAULT_SALARIES[type] || 50,
    morale: Math.floor(Math.random() * 41) + 50,
    skillLevel: Math.floor(Math.random() * 3) + 1,
    hireDay: gameState.currentDay,
    onStrike: false
  };
  initEmployeeSkills(emp);
  return emp;
}

function ensureAllEmployeesHaveSkills() {
  if (!gameState.employees) return;
  gameState.employees.forEach(function(emp){ initEmployeeSkills(emp); });
}

if (!gameState.schedules) gameState.schedules = { currentWeek: [], overtimeHours: 0, laborCostThisWeek: 0 };
if (!gameState.schedules.currentWeek) gameState.schedules.currentWeek = [];
if (!gameState.performanceReviews) gameState.performanceReviews = [];

function generateWeeklySchedule() {
  if (!gameState.employees || gameState.employees.length === 0) {
    showToast('没有员工可排班', 'error');
    return null;
  }
  var schedule = [];
  var ownedOutlets = gameState.outlets.filter(function(o){ return o.owned; });
  ownedOutlets.forEach(function(outlet){
    for (var day = 0; day < 7; day++) {
      var shiftKeys = ['EARLY', 'MIDDLE', 'NIGHT'];
      shiftKeys.forEach(function(shiftKey){
        var shiftType = SHIFT_TYPES[shiftKey].id;
        var outletEmps = gameState.employees.filter(function(e){
          return e.outletId === outlet.id && !e.onStrike && !e.trainingActive;
        });
        var assigned = [];
        var neededSales = Math.max(1, Math.floor(outletEmps.filter(function(e){ return e.type === '销售员'; }).length / 3));
        var neededMechanics = Math.max(1, Math.floor(outletEmps.filter(function(e){ return e.type === '维修工'; }).length / 3));
        var neededDrivers = Math.max(1, Math.floor(outletEmps.filter(function(e){ return e.type === '司机'; }).length / 3));
        var neededWashers = Math.max(1, Math.floor(outletEmps.filter(function(e){ return e.type === '洗车工'; }).length / 3));
        var managerOnShift = false;
        var shuffled = outletEmps.slice().sort(function(){ return Math.random() - 0.5; });
        shuffled.forEach(function(emp){
          if (managerOnShift && emp.type === '店长') return;
          var alreadyAssignedToday = schedule.some(function(s){
            return s.outletId === outlet.id && s.day === day && s.employeeIds.indexOf(emp.id) !== -1;
          });
          if (alreadyAssignedToday) return;
          var consecutiveCount = 0;
          for (var d = day - 1; d >= 0 && d >= day - emp.maxConsecutiveDays; d--) {
            var workingThatDay = schedule.some(function(s){
              return s.outletId === outlet.id && s.day === d && s.employeeIds.indexOf(emp.id) !== -1;
            });
            if (workingThatDay) consecutiveCount++;
            else break;
          }
          if (consecutiveCount >= emp.maxConsecutiveDays) return;
          var prefMatch = emp.preferredShifts && emp.preferredShifts.indexOf(shiftType) !== -1;
          if (Math.random() < (prefMatch ? 0.9 : 0.4)) {
            if (emp.type === '店长' && !managerOnShift) { assigned.push(emp.id); managerOnShift = true; }
            else if (emp.type === '销售员' && assigned.filter(function(id){
              var e = gameState.employees.find(function(x){ return x.id === id; }); return e && e.type === '销售员';
            }).length < neededSales) { assigned.push(emp.id); }
            else if (emp.type === '维修工' && assigned.filter(function(id){
              var e = gameState.employees.find(function(x){ return x.id === id; }); return e && e.type === '维修工';
            }).length < neededMechanics) { assigned.push(emp.id); }
            else if (emp.type === '司机' && assigned.filter(function(id){
              var e = gameState.employees.find(function(x){ return x.id === id; }); return e && e.type === '司机';
            }).length < neededDrivers) { assigned.push(emp.id); }
            else if (emp.type === '洗车工' && assigned.filter(function(id){
              var e = gameState.employees.find(function(x){ return x.id === id; }); return e && e.type === '洗车工';
            }).length < neededWashers) { assigned.push(emp.id); }
          }
        });
        if (assigned.length > 0) {
          schedule.push({ outletId: outlet.id, day: day, shiftType: shiftType, employeeIds: assigned });
        }
      });
    }
  });
  gameState.schedules.currentWeek = schedule;
  var result = calculateLaborCost(schedule);
  gameState.schedules.laborCostThisWeek = result.totalCost;
  gameState.schedules.overtimeHours = result.overtimeHours;
  addMessage('📅 已生成本周排班表，人力成本 ' + formatCurrency(result.totalCost) + '，加班 ' + result.overtimeHours + ' 小时', 'good');
  saveGame();
  return schedule;
}

function getScheduleForOutlet(outletId, day) {
  if (day === undefined) {
    var date = getGameDate();
    day = date.getDay();
  }
  return (gameState.schedules.currentWeek || []).filter(function(s){
    return s.outletId === outletId && s.day === day;
  });
}

function calculateLaborCost(schedule) {
  var totalCost = 0;
  var overtimeHours = 0;
  var weeklyHoursPerEmp = {};
  (schedule || gameState.schedules.currentWeek || []).forEach(function(slot){
    var shiftInfo = Object.values(SHIFT_TYPES).find(function(s){ return s.id === slot.shiftType; });
    if (!shiftInfo) return;
    slot.employeeIds.forEach(function(empId){
      var emp = (gameState.employees || []).find(function(e){ return e.id === empId; });
      if (!emp) return;
      var hours = shiftInfo.duration || 8;
      var dayOfWeek = slot.day;
      var isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      var hourlyRate = emp.salary || DEFAULT_SALARIES[emp.type] || 50;
      var dailyOvertime = Math.max(0, hours - 8);
      var normalPay = Math.min(hours, 8) * hourlyRate;
      var otPay = 0;
      if (dailyOvertime > 0) {
        otPay += dailyOvertime * hourlyRate * 1.5;
        overtimeHours += dailyOvertime;
      }
      if (isWeekend) {
        normalPay *= 1.5;
        otPay *= 1.5;
      }
      weeklyHoursPerEmp[empId] = (weeklyHoursPerEmp[empId] || 0) + hours;
      totalCost += normalPay + otPay;
    });
  });
  Object.keys(weeklyHoursPerEmp).forEach(function(empId){
    var totalHrs = weeklyHoursPerEmp[empId];
    if (totalHrs > 40) {
      var extraOt = totalHrs - 40;
      var emp = (gameState.employees || []).find(function(e){ return e.id === empId; });
      if (emp) {
        totalCost += extraOt * (emp.salary || 50);
        overtimeHours += extraOt;
      }
    }
  });
  return { totalCost: Math.round(totalCost), overtimeHours: overtimeHours };
}

function validateSchedule() {
  var issues = [];
  var warnings = [];
  var schedule = gameState.schedules.currentWeek || [];
  var ownedOutlets = gameState.outlets.filter(function(o){ return o.owned; });
  ownedOutlets.forEach(function(outlet){
    for (var day = 0; day < 7; day++) {
      var daySlots = schedule.filter(function(s){ return s.outletId === outlet.id && s.day === day; });
      var shiftsCovered = daySlots.map(function(s){ return s.shiftType; });
      ['early','middle','night'].forEach(function(st){
        if (shiftsCovered.indexOf(st) === -1) {
          issues.push({ outletId: outlet.id, day: day, shiftType: st, severity: 'critical', message: OUTLET_CONFIGS.find(function(c){ return c.id === outlet.id; }).name + ' 第' + (day+1) + '天 ' + SHIFT_NAMES[st] + ' 无员工' });
        } else {
          var slot = daySlots.find(function(s){ return s.shiftType === st; });
          if (slot && slot.employeeIds.length === 0) {
            warnings.push({ outletId: outlet.id, day: day, shiftType: st, severity: 'warning', message: OUTLET_CONFIGS.find(function(c){ return c.id === outlet.id; }).name + ' 第' + (day+1) + '天 ' + SHIFT_NAMES[st] + ' 空岗' });
          }
        }
      });
      var empsWorkingToday = [];
      daySlots.forEach(function(s){ s.employeeIds.forEach(function(id){ if (empsWorkingToday.indexOf(id) === -1) empsWorkingToday.push(id); }); });
      if (empsWorkingToday.length === 0) {
        issues.push({ outletId: outlet.id, day: day, shiftType: 'all', severity: 'critical', message: OUTLET_CONFIGS.find(function(c){ return c.id === outlet.id; }).name + ' 第' + (day+1) + '天 完全无人值班' });
      }
    }
  });
  var overstaffed = [];
  schedule.forEach(function(slot){
    if (slot.employeeIds.length > 5) {
      overstaffed.push({ slot: slot, count: slot.employeeIds.length, message: '过剩: ' + SHIFT_NAMES[slot.shiftType] + ' 有' + slot.employeeIds.length + '人（建议≤5）' });
    }
  });
  return { issues: issues, warnings: warnings, overstaffed: overstaffed, score: Math.max(0, 100 - issues.length * 15 - warnings.length * 5 - overstaffed.length * 3) };
}

function startTraining(employeeId, trainingType) {
  var program = TRAINING_PROGRAMS[trainingType];
  if (!program) { showToast('无效的培训类型', 'error'); return null; }
  var emp = (gameState.employees || []).find(function(e){ return e.id === employeeId; });
  if (!emp) { showToast('员工不存在', 'error'); return null; }
  if (emp.trainingActive) { showToast('该员工正在培训中', 'error'); return null; }
  if (emp.skills[program.skillKey] >= 100) { showToast('该技能已满级！', 'error'); return null; }
  if (gameState.cash < program.cost) { showToast('资金不足，需要 ' + formatCurrency(program.cost), 'error'); return null; }
  gameState.cash -= program.cost;
  emp.trainingActive = true;
  emp.trainingType = trainingType;
  emp.trainingEndDay = gameState.currentDay + program.duration;
  emp.trainingCost = program.cost;
  addMessage('📚 ' + emp.name + ' 开始' + program.name + '，花费 ' + formatCurrency(program.cost) + '，需 ' + program.duration + ' 天完成', 'good');
  updateUI(); saveGame();
  return { ok: true, program: program, endDay: emp.trainingEndDay };
}

function completeTraining(employeeId) {
  var emp = (gameState.employees || []).find(function(e){ return e.id === employeeId; });
  if (!emp || !emp.trainingActive) return null;
  if (gameState.currentDay < emp.trainingEndDay) return null;
  var program = TRAINING_PROGRAMS[emp.trainingType];
  if (!program) return null;
  var oldLevel = emp.skills[program.skillKey];
  emp.skills[program.skillKey] = Math.min(100, emp.skills[program.skillKey] + program.skillGain);
  var newLevel = emp.skills[program.skillKey];
  var certLevel = getCertificationLevel(newLevel);
  if (emp.certifications.indexOf(emp.trainingType + '_' + certLevel) === -1) {
    emp.certifications.push(emp.trainingType + '_' + certLevel);
  }
  emp.trainingHistory.push({
    type: emp.trainingType,
    name: program.name,
    startDay: emp.trainingEndDay - program.duration,
    endDay: gameState.currentDay,
    cost: program.cost,
    skillBefore: oldLevel,
    skillAfter: newLevel
  });
  emp.trainingActive = false;
  delete emp.trainingType;
  delete emp.trainingEndDay;
  delete emp.trainingCost;
  addMessage('🎓 ' + emp.name + ' 完成' + program.name + '，' + program.skillKey + ': ' + oldLevel + ' → ' + newLevel + ' (' + certLevel + ')', 'good');
  updateUI(); saveGame();
  return { ok: true, skillFrom: oldLevel, skillTo: newLevel, certLevel: certLevel };
}

function processAllTrainingCompletion() {
  if (!gameState.employees) return;
  var completed = 0;
  gameState.employees.forEach(function(emp){
    if (emp.trainingActive && emp.trainingEndDay && gameState.currentDay >= emp.trainingEndDay) {
      completeTraining(emp.id);
      completed++;
    }
  });
  if (completed > 0) {
    addMessage('📚 本日有 ' + completed + ' 名员工完成培训', 'good');
  }
}

function getTrainingOptions() {
  var options = [];
  Object.keys(TRAINING_PROGRAMS).forEach(function(key){
    var p = TRAINING_PROGRAMS[key];
    options.push({
      key: key,
      name: p.name,
      cost: p.cost,
      duration: p.duration,
      skillGain: p.skillGain,
      skillKey: p.skillKey,
      icon: p.icon
    });
  });
  return options;
}

function getCertificationLevel(skillValue) {
  if (skillValue >= 80) return CERTIFICATION_LEVELS[3];
  if (skillValue >= 60) return CERTIFICATION_LEVELS[2];
  if (skillValue >= 35) return CERTIFICATION_LEVELS[1];
  return CERTIFICATION_LEVELS[0];
}

function getEmployeeEffectiveness(emp) {
  if (!emp || !emp.skills) return 1.0;
  var moraleFactor = (emp.morale || 50) / 100;
  var avgSkill = (emp.skills.salesSkill + emp.skills.serviceSkill + emp.skills.repairSkill + emp.skills.managementSkill) / 4;
  var skillFactor = 0.7 + (avgSkill / 100) * 0.5;
  var effectiveness = moraleFactor * skillFactor;
  effectiveness = Math.max(0.3, Math.min(1.5, effectiveness));
  return Math.round(effectiveness * 100) / 100;
}

function getRoleSpecificEffectiveness(emp) {
  if (!emp || !emp.skills) return { conversionBonus: 0, speedBonus: 0, qualityBonus: 0, reviewBonus: 0 };
  var moraleMult = (emp.morale || 50) / 100;
  var result = {};
  switch(emp.type) {
    case '店长':
      result.profitBonus = (emp.skills.managementSkill / 100) * 0.15 * moraleMult;
      result.retentionBonus = (emp.skills.managementSkill / 100) * 0.1 * moraleMult;
      result.satisfactionBonus = (emp.skills.serviceSkill / 100) * 0.08 * moraleMult;
      break;
    case '销售员':
      result.conversionBonus = (emp.skills.salesSkill / 100) * 0.25 * moraleMult;
      result.upsellBonus = (emp.skills.salesSkill / 100) * 0.15 * moraleMult;
      result.dealValueBonus = (emp.skills.salesSkill / 100) * 0.1 * moraleMult;
      break;
    case '维修工':
      result.speedBonus = (emp.skills.repairSkill / 100) * 0.3 * moraleMult;
      result.qualityBonus = (emp.skills.repairSkill / 100) * 0.2 * moraleMult;
      result.costReduction = (emp.skills.repairSkill / 100) * 0.08 * moraleMult;
      break;
    case '司机':
      result.deliverySpeed = (emp.skills.serviceSkill / 100) * 0.15 * moraleMult;
      result.fuelEfficiency = (emp.skills.serviceSkill / 100) * 0.1 * moraleMult;
      result.accidentReduction = (emp.skills.serviceSkill / 100) * 0.12 * moraleMult;
      break;
    case '洗车工':
      result.washSpeed = (emp.skills.serviceSkill / 100) * 0.25 * moraleMult;
      result.washQuality = (emp.skills.repairSkill / 100) * 0.2 * moraleMult;
      break;
    default:
      break;
  }
  return result;
}

function conductPerformanceReview(employeeId) {
  var emp = (gameState.employees || []).find(function(e){ return e.id === employeeId; });
  if (!emp) return null;
  var daysEmployed = gameState.currentDay - (emp.hireDay || 1);
  if (daysEmployed < 30) { showToast('该员工入职不足30天，暂不考核', 'warn'); return null; }
  var quarter = Math.floor(gameState.currentDay / 90);
  var existingReview = (gameState.performanceReviews || []).find(function(r){
    return r.employeeId === employeeId && r.quarter === quarter;
  });
  if (existingReview) return existingReview;
  var kpis = calculateKPIs(emp);
  var overallScore = calculateOverallScore(kpis, emp.type);
  var rating = determineRating(overallScore);
  var ratingConfig = PERFORMANCE_RATINGS.find(function(r){ return r.grade === rating; });
  var monthlySalary = (emp.salary || 50) * 8 * 22;
  var bonus = Math.round(monthlySalary * (ratingConfig ? ratingConfig.bonusPercent : 0));
  var notes = generatePerformanceNotes(rating, kpis, emp);
  var review = {
    employeeId: employeeId,
    quarter: quarter,
    kpis: kpis,
    overallScore: Math.round(overallScore),
    overallRating: rating,
    bonus: bonus,
    notes: notes,
    reviewDay: gameState.currentDay
  };
  if (!gameState.performanceReviews) gameState.performanceReviews = [];
  gameState.performanceReviews.push(review);
  addMessage('📋 ' + emp.name + ' 季度绩效考核：' + ratingConfig.label + '（得分:' + Math.round(overallScore) + '）' + (bonus > 0 ? ' 奖金' + formatCurrency(bonus) : ''), 'good');
  saveGame();
  return review;
}

function calculateKPIs(emp) {
  var kpis = {};
  switch(emp.type) {
    case '店长':
      var outletProfit = estimateOutletProfit(emp.outletId);
      kpis.outletProfit = outletProfit;
      kpis.customerSat = gameState.npsScore || 50;
      kpis.staffRetention = calcStaffRetention(emp.outletId);
      kpis.teamSize = (gameState.employees || []).filter(function(e){ return e.outletId === emp.outletId; }).length;
      break;
    case '销售员':
      kpis.ordersClosed = emp.totalOrdersClosed || 0;
      kpis.upsellRate = emp.totalOrdersClosed > 0 ? ((emp.upsellCount || 0) / emp.totalOrdersClosed * 100) : 0;
      kpis.avgDealValue = emp.totalOrdersClosed > 0 ? Math.round((emp.totalRevenue || 0) / emp.totalOrdersClosed) : 0;
      kpis.conversionRate = Math.min(100, 30 + (emp.skills ? emp.skills.salesSkill : 30) * 0.5 + Math.random() * 20);
      break;
    case '维修工':
      kpis.vehiclesRepaired = emp.totalRepairsDone || 0;
      kpis.avgRepairTime = emp.totalRepairsDone > 0 ? Math.round((emp.totalRepairTime || 0) / emp.totalRepairsDone) : 120;
      kpis.qualityScore = Math.min(100, 60 + (emp.skills ? emp.skills.repairSkill : 30) * 0.4 + Math.random() * 10);
      kpis.costSaving = Math.round((emp.skills ? emp.skills.repairSkill : 30) * 2);
      break;
    case '司机':
      kpis.deliveriesCompleted = emp.totalDeliveries || 0;
      kpis.accidentFreeRate = emp.totalDeliveries > 0 ? Math.max(0, 100 - (emp.accidentCount || 0) * 10) : 100;
      kpis.fuelEfficiency = Math.min(100, 70 + (emp.skills ? emp.skills.serviceSkill : 30) * 0.3);
      kpis.onTimeRate = Math.min(100, 85 + Math.random() * 13);
      break;
    case '洗车工':
      kpis.carsWashed = emp.totalCarsWashed || 0;
      kpis.timePerCar = emp.totalCarsWashed > 0 ? Math.round((emp.totalWashTime || 0) / emp.totalCarsWashed) : 30;
      kpis.qualityRating = Math.min(100, 65 + (emp.skills ? emp.skills.serviceSkill : 30) * 0.3 + (emp.skills ? emp.skills.repairSkill : 10) * 0.2);
      kpis.customerComplaints = Math.max(0, Math.round((100 - kpis.qualityRating) / 20));
      break;
    default:
      break;
  }
  kpis.attendance = Math.min(100, 95 + Math.random() * 5);
  kpis.moraleAvg = emp.morale || 50;
  kpis.efficiency = getEmployeeEffectiveness(emp);
  return kpis;
}

function calculateOverallScore(kpis, role) {
  var weights = getKPIWeights(role);
  var weightedSum = 0;
  var totalWeight = 0;
  Object.keys(weights).forEach(function(key){
    if (kpis[key] !== undefined) {
      var normalized = normalizeKPI(key, kpis[key], role);
      weightedSum += normalized * weights[key];
      totalWeight += weights[key];
    }
  });
  return totalWeight > 0 ? weightedSum / totalWeight * 100 : 50;
}

function getKPIWeights(role) {
  switch(role) {
    case '店长': return { outletProfit: 0.35, customerSat: 0.25, staffRetention: 0.25, efficiency: 0.15 };
    case '销售员': return { ordersClosed: 0.3, upsellRate: 0.2, avgDealValue: 0.2, conversionRate: 0.15, efficiency: 0.15 };
    case '维修工': return { vehiclesRepaired: 0.3, qualityScore: 0.3, avgRepairTime: 0.2, costSaving: 0.1, efficiency: 0.1 };
    case '司机': return { deliveriesCompleted: 0.3, accidentFreeRate: 0.3, onTimeRate: 0.2, fuelEfficiency: 0.1, efficiency: 0.1 };
    case '洗车工': return { carsWashed: 0.3, qualityRating: 0.3, timePerCar: 0.2, efficiency: 0.2 };
    default: return { efficiency: 0.5, attendance: 0.3, moraleAvg: 0.2 };
  }
}

function normalizeKPI(key, value, role) {
  var ranges = {
    outletProfit: { min: 0, max: 50000 },
    ordersClosed: { min: 0, max: 100 },
    upsellRate: { min: 0, max: 80 },
    avgDealValue: { min: 0, max: 2000 },
    conversionRate: { min: 0, max: 100 },
    vehiclesRepaired: { min: 0, max: 150 },
    qualityScore: { min: 0, max: 100 },
    avgRepairTime: { min: 180, max: 30 },
    deliveriesCompleted: { min: 0, max: 200 },
    accidentFreeRate: { min: 0, max: 100 },
    carsWashed: { min: 0, max: 300 },
    timePerCar: { min: 60, max: 10 },
    qualityRating: { min: 0, max: 100 },
    customerSat: { min: 0, max: 100 },
    staffRetention: { min: 0, max: 100 },
    fuelEfficiency: { min: 0, max: 100 },
    onTimeRate: { min: 0, max: 100 },
    attendance: { min: 0, max: 100 },
    moraleAvg: { min: 0, max: 100 },
    efficiency: { min: 0.3, max: 1.5 },
    costSaving: { min: 0, max: 500 },
    teamSize: { min: 0, max: 20 }
  };
  var range = ranges[key] || { min: 0, max: 100 };
  var normalized = (value - range.min) / (range.max - range.min);
  if (key === 'avgRepairTime' || key === 'timePerCar') normalized = 1 - normalized;
  return Math.max(0, Math.min(1, normalized));
}

function determineRating(score) {
  if (score >= 90) return 'S';
  if (score >= 75) return 'A';
  if (score >= 55) return 'B';
  if (score >= 35) return 'C';
  return 'D';
}

function generatePerformanceNotes(rating, kpis, emp) {
  var notes = '';
  switch(rating) {
    case 'S': notes = '表现卓越，是团队标杆。建议考虑晋升为店长或区域负责人。'; break;
    case 'A': notes = '表现优秀，超出预期目标。继续保持当前状态。'; break;
    case 'B': notes = '表现良好，达到基本要求。可在某些方面进一步提升。'; break;
    case 'C': notes = '需要改进。请关注薄弱环节并制定提升计划。已发出正式警告。'; break;
    case 'D': notes = '表现不合格。将安排面谈讨论改进方案，若下季度仍不达标将考虑调岗或终止合同。'; break;
  }
  return notes;
}

function applyPerformanceBonus(empId, amount) {
  var emp = (gameState.employees || []).find(function(e){ return e.id === empId; });
  if (!emp || amount <= 0) return;
  gameState.cash -= amount;
  emp.morale = Math.min(100, emp.morale + 10);
  addMessage('💰 发放绩效奖金给 ' + emp.name + '：' + formatCurrency(amount), 'good');
  updateUI(); saveGame();
}

function getPerformanceTrends(empId) {
  var reviews = (gameState.performanceReviews || []).filter(function(r){ return r.employeeId === empId; });
  reviews.sort(function(a,b){ return a.quarter - b.quarter; });
  return reviews.map(function(r){
    return { quarter: r.quarter, score: r.overallScore, rating: r.overallRating, bonus: r.bonus };
  });
}

function getTeamPerformanceSummary(outletId) {
  var emps = (gameState.employees || []).filter(function(e){ return e.outletId === outletId; });
  if (emps.length === 0) return null;
  var summaries = emps.map(function(emp){
    var reviews = (gameState.performanceReviews || []).filter(function(r){ return r.employeeId === emp.id; });
    var latestReview = reviews.length > 0 ? reviews[reviews.length - 1] : null;
    return {
      id: emp.id,
      name: emp.name,
      type: emp.type,
      effectiveness: getEmployeeEffectiveness(emp),
      morale: emp.morale || 50,
      latestRating: latestReview ? latestReview.overallRating : '未评',
      latestScore: latestReview ? latestReview.overallScore : null,
      inTraining: emp.trainingActive || false
    };
  });
  var avgEffectiveness = summaries.reduce(function(s, item){ return s + item.effectiveness; }, 0) / summaries.length;
  var avgMorale = summaries.reduce(function(s, item){ return s + item.morale; }, 0) / summaries.length;
  var ratingDist = { S: 0, A: 0, B: 0, C: 0, D: 0 };
  summaries.forEach(function(item){ if (ratingDist[item.latestRating] !== undefined) ratingDist[item.latestRating]++; });
  return {
    outletId: outletId,
    employeeCount: summaries.length,
    employees: summaries,
    avgEffectiveness: Math.round(avgEffectiveness * 100) / 100,
    avgMorale: Math.round(avgMorale),
    ratingDistribution: ratingDist,
    inTrainingCount: summaries.filter(function(item){ return item.inTraining; }).length
  };
}

function estimateOutletProfit(outletId) {
  var outletOrders = (gameState.orderHistory || []).filter(function(o){
    var orderOutlet = o.outletId || 0;
    return orderOutlet === outletId && o.acceptedDay && o.acceptedDay > gameState.currentDay - 90;
  });
  return outletOrders.reduce(function(s, o){ return s + (o.netIncome || 0); }, 0);
}

function calcStaffRetention(outletId) {
  var emps = (gameState.employees || []).filter(function(e){ return e.outletId === outletId; });
  if (emps.length === 0) return 100;
  var longTerm = emps.filter(function(e){ return (gameState.currentDay - (e.hireDay || 1)) > 60; }).length;
  return Math.round(longTerm / emps.length * 100);
}

function getFullyLoadedCost(empId) {
  var emp = (gameState.employees || []).find(function(e){ return e.id === empId; });
  if (!emp) return 0;
  var hourlyRate = emp.salary || DEFAULT_SALARIES[emp.type] || 50;
  var monthlyBase = hourlyRate * 8 * 22;
  var benefits = monthlyBase * 0.3;
  var taxes = monthlyBase * 0.2;
  var trainingAmort = 0;
  if (emp.trainingHistory && emp.trainingHistory.length > 0) {
    var totalTrainingCost = emp.trainingHistory.reduce(function(s, t){ return s + t.cost; }, 0);
    trainingAmort = totalTrainingCost / 12;
  }
  return Math.round(monthlyBase + benefits + taxes + trainingAmort);
}

function getLaborEfficiencyMetrics() {
  var emps = gameState.employees || [];
  if (emps.length === 0) return null;
  var totalRevenue = gameState.totalRevenue || 0;
  var totalFullyLoaded = emps.reduce(function(s, e){ return s + getFullyLoadedCost(e.id); }, 0);
  var avgEffectiveness = 0;
  var roleBreakdown = {};
  emps.forEach(function(emp){
    avgEffectiveness += getEmployeeEffectiveness(emp);
    var type = emp.type;
    if (!roleBreakdown[type]) roleBreakdown[type] = { count: 0, totalCost: 0, totalEffectiveness: 0 };
    roleBreakdown[type].count++;
    roleBreakdown[type].totalCost += getFullyLoadedCost(emp.id);
    roleBreakdown[type].totalEffectiveness += getEmployeeEffectiveness(emp);
  });
  avgEffectiveness = emps.length > 0 ? Math.round(avgEffectiveness / emps.length * 100) / 100 : 0;
  Object.keys(roleBreakdown).forEach(function(k){
    roleBreakdown[k].avgEffectiveness = Math.round(roleBreakdown[k].totalEffectiveness / roleBreakdown[k].count * 100) / 100;
    roleBreakdown[k].avgCost = Math.round(roleBreakdown[k].totalCost / roleBreakdown[k].count);
  });
  var revenuePerEmployee = emps.length > 0 ? Math.round(totalRevenue / emps.length) : 0;
  var profitEstimate = (gameState.financials && gameState.financials.dailyProfit) ?
    gameState.financials.dailyProfit.reduce(function(s,v){return s+v;}, 0) : 0;
  var profitPerEmployee = emps.length > 0 ? Math.round(profitEstimate / emps.length) : 0;
  return {
    headcount: emps.length,
    totalMonthlyLaborCost: totalFullyLoaded,
    revenuePerEmployee: revenuePerEmployee,
    profitPerEmployee: profitPerEmployee,
    avgEffectiveness: avgEffectiveness,
    roleBreakdown: roleBreakdown,
    costPerProductiveHour: totalFullyLoaded > 0 ? Math.round(totalFullyLoaded / (emps.length * 160)) : 0
  };
}

function suggestHeadcountChanges() {
  var suggestions = [];
  var ownedOutlets = gameState.outlets.filter(function(o){ return o.owned; });
  ownedOutlets.forEach(function(outlet){
    var emps = (gameState.employees || []).filter(function(e){ return e.outletId === outlet.id; });
    var vehicles = getVehiclesAtOutlet(outlet.id);
    var vehicleCount = vehicles.length;
    var recommended = getRecommendedStaffing(outlet.id);
    var current = {
      managers: emps.filter(function(e){ return e.type === '店长'; }).length,
      salespersons: emps.filter(function(e){ return e.type === '销售员'; }).length,
      mechanics: emps.filter(function(e){ return e.type === '维修工'; }).length,
      drivers: emps.filter(function(e){ return e.type === '司机'; }).length,
      car_washers: emps.filter(function(e){ return e.type === '洗车工'; }).length
    };
    var roles = ['managers', 'salespersons', 'mechanics', 'drivers', 'car_washers'];
    var roleLabels = { managers: '店长', salespersons: '销售员', mechanics: '维修工', drivers: '司机', car_washers: '洗车工' };
    roles.forEach(function(role){
      var diff = current[role] - recommended[role];
      if (diff < -1) {
        var estRevenueIncrease = 0;
        if (role === 'salespersons') estRevenueIncrease = Math.round(vehicleCount * 300 * Math.abs(diff));
        if (role === 'drivers') estRevenueIncrease = Math.round(vehicleCount * 200 * Math.abs(diff));
        suggestions.push({
          outletId: outlet.id,
          action: 'hire',
          role: role,
          roleLabel: roleLabels[role],
          current: current[role],
          recommended: recommended[role],
          gap: Math.abs(diff),
          estimatedRevenueImpact: estRevenueIncrease,
          priority: diff <= -2 ? 'high' : 'medium'
        });
      } else if (diff > 1) {
        suggestions.push({
          outletId: outlet.id,
          action: 'reduce',
          role: role,
          roleLabel: roleLabels[role],
          current: current[role],
          recommended: recommended[role],
          excess: diff,
          savingsPotential: Math.round(diff * (DEFAULT_SALARIES[EMPLOYEE_TYPES[role.toUpperCase()] || 'SALESPERSON'] || 50) * 8 * 22),
          priority: diff >= 3 ? 'high' : 'low'
        });
      }
    });
  });
  return suggestions;
}

function calculateOptimalStaffing(outletId) {
  var vehicles = getVehiclesAtOutlet(outletId);
  var vehicleCount = vehicles.length;
  var os = getOutletState(outletId);
  var cityMultiplier = CITY_SIZE_MULTIPLIERS[(os && os.citySize) || 'medium'] || 1.2;
  var targetServiceLevel = 0.92;
  var baseStaffing = {
    managers: 1,
    salespersons: Math.max(1, Math.ceil(vehicleCount / 8 * cityMultiplier)),
    mechanics: Math.max(1, Math.ceil(vehicleCount / 6 * cityMultiplier)),
    drivers: Math.max(1, Math.ceil(vehicleCount / 12 * cityMultiplier)),
    car_washers: Math.max(1, Math.ceil(vehicleCount / 20))
  };
  var serviceLevels = {
    minimum: { level: 0.75, staffing: {} },
    standard: { level: 0.88, staffing: {} },
    premium: { level: 0.95, staffing: {} }
  };
  Object.keys(baseStaffing).forEach(function(role){
    serviceLevels.minimum.staffing[role] = Math.max(1, Math.ceil(baseStaffing[role] * 0.6));
    serviceLevels.standard.staffing[role] = baseStaffing[role];
    serviceLevels.premium.staffing[role] = Math.ceil(baseStaffing[role] * 1.4);
  });
  var currentEmps = (gameState.employees || []).filter(function(e){ return e.outletId === outletId; });
  var currentCounts = {
    managers: currentEmps.filter(function(e){ return e.type === '店长'; }).length,
    salespersons: currentEmps.filter(function(e){ return e.type === '销售员'; }).length,
    mechanics: currentEmps.filter(function(e){ return e.type === '维修工'; }).length,
    drivers: currentEmps.filter(function(e){ return e.type === '司机'; }).length,
    car_washers: currentEmps.filter(function(e){ return e.type === '洗车工'; }).length
  };
  var totalCurrent = Object.values(currentCounts).reduce(function(s, v){ return s + v; }, 0);
  var totalStandard = Object.values(serviceLevels.standard.staffing).reduce(function(s, v){ return s + v; }, 0);
  var utilizationRate = totalStandard > 0 ? Math.round(totalCurrent / totalStandard * 100) : 0;
  return {
    outletId: outletId,
    vehicleCount: vehicleCount,
    cityMultiplier: cityMultiplier,
    serviceLevels: serviceLevels,
    currentStaffing: currentCounts,
    utilizationRate: utilizationRate,
    recommendation: utilizationRate < 80 ? '人员不足，建议招聘' : utilizationRate > 120 ? '人员冗余，可优化成本' : '配置合理',
    automationOpportunities: vehicleCount > 15 ? [{ task: '车辆自动调度系统', saving: '可减少1名司机', techLevel: 3 }] : []
  };
}

function checkUnionStatus() {
  var empCount = (gameState.employees || []).length;
  if (!gameState.unionStatus) gameState.unionStatus = { formed: false, demands: [], lastDemandDay: 0 };
  var us = gameState.unionStatus;
  if (empCount >= 10 && !us.formed) {
    var formChance = (empCount - 10) * 0.02;
    if (Math.random() < formChance) {
      us.formed = true;
      us.demands = ['福利待遇提升10%', '每年额外带薪休假3天', '加班费翻倍'];
      us.lastDemandDay = gameState.currentDay;
      addMessage('⚠️ 工会成立！员工代表提出以下要求：' + us.demands.join('、'), 'warn');
      saveGame();
    }
  }
  if (us.formed && gameState.currentDay - us.lastDemandDay > 90) {
    us.demands = us.demands || [];
    var newDemands = ['工资普调5%以上', '改善工作环境', '增加培训机会'];
    us.demands.push(newDemands[Math.floor(Math.random() * newDemands.length)]);
    us.lastDemandDay = gameState.currentDay;
    addMessage('📢 工会提出新要求：' + us.demands[us.demands.length - 1], 'warn');
    saveGame();
  }
  return us;
}

function getOrgChartData() {
  var ceo = { id: 'CEO', name: '玩家(CEO)', type: 'CEO', title: '首席执行官', children: [], level: 0 };
  var managers = (gameState.employees || []).filter(function(e){ return e.type === '店长'; });
  managers.forEach(function(mgr){
    var mgrNode = {
      id: mgr.id,
      name: mgr.name,
      type: mgr.type,
      title: '店长',
      outletId: mgr.outletId,
      outletName: mgr.outletId !== null && mgr.outletId !== undefined ? (OUTLET_CONFIGS.find(function(c){ return c.id === mgr.outletId; }) || {}).name : '未分配',
      effectiveness: getEmployeeEffectiveness(mgr),
      morale: mgr.morale,
      children: [],
      level: 1
    };
    var staff = (gameState.employees || []).filter(function(e){
      return e.outletId === mgr.outletId && e.type !== '店长';
    });
    staff.forEach(function(emp){
      mgrNode.children.push({
        id: emp.id,
        name: emp.name,
        type: emp.type,
        title: emp.type,
        effectiveness: getEmployeeEffectiveness(emp),
        morale: emp.morale,
        inTraining: emp.trainingActive || false,
        level: 2
      });
    });
    var spanWarning = mgrNode.children.length > 7;
    mgrNode.spanOfControl = mgrNode.children.length;
    mgrNode.spanWarning = spanWarning;
    ceo.children.push(mgrNode);
  });
  var unassigned = (gameState.employees || []).filter(function(e){ return e.type !== '店长' && (e.outletId === null || e.outletId === undefined); });
  if (unassigned.length > 0) {
    ceo.children.push({
      id: 'unassigned',
      name: '待分配员工 (' + unassigned.length + ')',
      type: 'pool',
      title: '人才池',
      children: unassigned.map(function(emp){
        return {
          id: emp.id,
          name: emp.name,
          type: emp.type,
          title: emp.type,
          effectiveness: getEmployeeEffectiveness(emp),
          morale: emp.morale,
          level: 2
        };
      }),
      level: 1
    });
  }
  var openPositions = [];
  var ownedOutlets = gameState.outlets.filter(function(o){ return o.owned; });
  ownedOutlets.forEach(function(outlet){
    var hasManager = managers.some(function(m){ return m.outletId === outlet.id; });
    if (!hasManager) {
      openPositions.push({ role: '店长', outletId: outlet.id, outletName: (OUTLET_CONFIGS.find(function(c){ return c.id === outlet.id; }) || {}).name, urgency: 'high' });
    }
  });
  ceo.openPositions = openPositions;
  ceo.totalHeadcount = (gameState.employees || []).length;
  return ceo;
}
