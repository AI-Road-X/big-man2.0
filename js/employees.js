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
