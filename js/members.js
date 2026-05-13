var MEMBER_LEVELS = [
  { level:1, name:'普通会员', minTrips:0, discount:1.0, color:'#95a5a6',
    freeServices:{}, specialRights:['基础预订'], pointsMultiplier: 1.0, icon:'👤' },
  { level:2, name:'银卡会员', minTrips:3, discount:0.95, color:'#bdc3c7',
    freeServices:{ freeCancelMonthly:1 }, specialRights:['基础预订','优先取车'],
    pointsMultiplier: 1.2, icon:'🥈' },
  { level:3, name:'金卡会员', minTrips:8, discount:0.90, color:'#f1c40f',
    freeServices:{ freeUpgradeQuarterly:1 }, specialRights:['基础预订','优先取车','免费洗车'],
    pointsMultiplier: 1.5, icon:'🥇' },
  { level:4, name:'白金会员', minTrips:15, discount:0.85, color:'#3498db',
    freeServices:{ freeGPS:true, noDeposit:true }, specialRights:['基础预订','优先取车','免费洗车','专属客服'],
    pointsMultiplier: 2.0, icon:'💎' },
  { level:5, name:'钻石会员', minTrips:30, discount:0.80, color:'#9b59b6',
    freeServices:{ freePickupDropoff:true, freeInsuranceUpgrade:true },
    specialRights:['基础预订','优先取车','免费洗车','专属客服','VIP休息室'],
    pointsMultiplier: 3.0, icon:'👑' }
];

var POINTS_CONFIG = {
  spendRate: 1,
  redeemRate: 100,
  birthdayMultiplier: 2,
  birthdayUpgradeCoupon: true
};

var FAMILY_CONFIG = {
  maxMembers: 5,
  shareDiscount: true,
  sharePoints: false
};

function initMemberSystem() {
  if (!gameState.memberPoints) gameState.memberPoints = {};
  if (!gameState.familyAccounts) gameState.familyAccounts = [];
  if (!gameState.corporateAccounts) gameState.corporateAccounts = [];
  if (!gameState.memberBenefitsLog) gameState.memberBenefitsLog = [];
}

function addMemberPoints(memberId, amount) {
  initMemberSystem();
  var member = gameState.members.find(function(m){ return m.id === memberId; });
  if (!member) return 0;
  var levelInfo = getMemberLevelInfo(member.level);
  var multiplier = levelInfo.pointsMultiplier || 1.0;
  var isBirthdayMonth = checkBirthdayMonth(member);
  if (isBirthdayMonth) multiplier *= POINTS_CONFIG.birthdayMultiplier;
  var pointsEarned = Math.floor(amount * POINTS_CONFIG.spendRate * multiplier);
  if (!gameState.memberPoints[memberId]) gameState.memberPoints[memberId] = { balance: 0, totalEarned: 0, totalRedeemed: 0, history: [] };
  gameState.memberPoints[memberId].balance += pointsEarned;
  gameState.memberPoints[memberId].totalEarned += pointsEarned;
  gameState.memberPoints[memberId].history.push({ day: gameState.currentDay, amount: pointsEarned, type: 'earn', reason: '消费积分' });
  if (gameState.memberPoints[memberId].history.length > 100) gameState.memberPoints[memberId].history = gameState.memberPoints[memberId].history.slice(-100);
  return pointsEarned;
}

function redeemMemberPoints(memberId, pointsToRedeem) {
  initMemberSystem();
  var account = gameState.memberPoints[memberId];
  if (!account || account.balance < pointsToRedeem) return { ok:false, reason:'积分不足' };
  var creditAmount = Math.floor(pointsToRedeem / POINTS_CONFIG.redeemRate);
  account.balance -= pointsToRedeem;
  account.totalRedeemed += pointsToRedeem;
  account.history.push({ day: gameState.currentDay, amount: -pointsToRedeem, type: 'redeem', reason: '兑换抵扣 $' + creditAmount });
  gameState.cash -= creditAmount;
  gameState.todayExpense += creditAmount;
  return { ok:true, credit: creditAmount, remainingPoints: account.balance };
}

function getMemberPointsBalance(memberId) {
  initMemberSystem();
  var account = gameState.memberPoints[memberId];
  return account ? account.balance : 0;
}

function checkBirthdayMonth(member) {
  if (!member.registerDay) return false;
  var regDate = new Date(2023, 0, 1);
  regDate.setDate(regDate.getDate() + member.registerDay - 1);
  var currentMonth = Math.floor((gameState.currentDay - 1) / 30) % 12;
  return regDate.getMonth() === currentMonth;
}

function getMemberFreeServices(memberId) {
  var member = gameState.members.find(function(m){ return m.id === memberId; });
  if (!member) return {};
  var levelInfo = getMemberLevelInfo(member.level);
  return levelInfo.freeServices || {};
}

function hasFreeService(memberId, serviceKey) {
  var services = getMemberFreeServices(memberId);
  return services && services[serviceKey];
}

function useFreeService(memberId, serviceKey) {
  var member = gameState.members.find(function(m){ return m.id === memberId; });
  if (!member) return { ok:false, reason:'会员不存在' };
  var levelInfo = getMemberLevelInfo(member.level);
  if (!levelInfo.freeServices || !levelInfo.freeServices[serviceKey]) return { ok:false, reason:'该等级无此权益' };
  if (serviceKey === 'freeCancelMonthly') {
    if ((member._usedFreeCancelMonth || 0) >= (levelInfo.freeServices[serviceKey] || 0)) return { ok:false, reason:'本月免费取消次数已用完' };
    member._usedFreeCancelMonth = (member._usedFreeCancelMonth || 0) + 1;
  }
  if (!gameState.memberBenefitsLog) gameState.memberBenefitsLog = [];
  gameState.memberBenefitsLog.push({ day: gameState.currentDay, memberId: memberId, service: serviceKey, type: 'use' });
  return { ok:true };
}

function createFamilyAccount(primaryMemberId, familyMemberIds) {
  initMemberSystem();
  var primary = gameState.members.find(function(m){ return m.id === primaryMemberId; });
  if (!primary) return { ok:false, reason:'主账户不存在' };
  if (familyMemberIds.length + 1 > FAMILY_CONFIG.maxMembers) return { ok:false, reason:'家庭组最多' + FAMILY_CONFIG.maxMembers + '人' };
  var existingFamily = gameState.familyAccounts.find(function(f){ return f.primaryId === primaryMemberId || f.memberIds.indexOf(primaryMemberId) !== -1; });
  if (existingFamily) return { ok:false, reason:'该成员已在其他家庭组中' };
  var familyAccount = {
    id: 'FAM_' + Date.now(),
    primaryId: primaryMemberId,
    memberIds: [primaryMemberId].concat(familyMemberIds),
    createdDay: gameState.currentDay,
    sharedBenefits: ['discount'],
    totalSharedPoints: 0
  };
  gameState.familyAccounts.push(familyAccount);
  addMessage('👨‍👩‍👧‍👦 家庭账户创建成功！共 ' + familyAccount.memberIds.length + ' 人', 'good');
  return { ok:true, family: familyAccount };
}

function createCorporateAccount(companyName, companyId, monthlyBudget) {
  initMemberSystem();
  var corpAccount = {
    id: 'CORP_' + Date.now(),
    name: companyName,
    companyId: companyId,
    monthlyBudget: monthlyBudget || 50000,
    usedBudget: 0,
    employeeIds: [],
    volumeDiscount: 0.85,
    billingCycleStart: gameState.currentDay,
    createdDay: gameState.currentDay,
    status: 'Active'
  };
  gameState.corporateAccounts.push(corpAccount);
  addMessage('🏢 企业账户创建：' + companyName + '（月预算 $' + formatCurrency(monthlyBudget) + '）', 'good');
  return { ok:true, account: corpAccount };
}

function addCorporateEmployee(corpAccountId, memberId) {
  var corp = gameState.corporateAccounts.find(function(c){ return c.id === corpAccountId; });
  if (!corp) return { ok:false, reason:'企业账户不存在' };
  if (corp.employeeIds.indexOf(memberId) !== -1) return { ok:false, reason:'该员工已在企业账户中' };
  if (corp.employeeIds.length >= 50) return { ok:false, reason:'企业账户员工已达上限' };
  corp.employeeIds.push(memberId);
  var member = gameState.members.find(function(m){ return m.id === memberId; });
  if (member) member.corpAccountId = corpAccountId;
  return { ok:true };
}

function processMemberTierDowngradeCheck() {
  gameState.members.forEach(function(member) {
    if (!member.level) member.level = 1;
    var currentLevelInfo = getMemberLevelInfo(member.level);
    var shouldHaveLevel = 1;
    for (var i = MEMBER_LEVELS.length - 1; i >= 0; i--) {
      if (member.totalTrips >= MEMBER_LEVELS[i].minTrips) { shouldHaveLevel = MEMBER_LEVELS[i].level; break; }
    }
    if (member.level > shouldHaveLevel) {
      if (member._gracePeriodStart === undefined) {
        member._gracePeriodStart = gameState.currentDay;
        member._gracePeriodLevel = member.level;
        addMessage('⚠️ 会员 ' + member.name + ' 等级保护期开始（90天），当前：' + currentLevelInfo.name, 'warn');
      } else if (gameState.currentDay - member._gracePeriodStart >= 90) {
        var oldName = currentLevelInfo.name;
        member.level = shouldHaveLevel;
        var newLevelInfo = getMemberLevelInfo(member.level);
        addMessage('📉 会员 ' + member.name + ' 降级：' + oldName + ' → ' + newLevelInfo.name, 'bad');
        member._gracePeriodStart = undefined;
        member._gracePeriodLevel = undefined;
      }
    } else {
      member._gracePeriodStart = undefined;
      member._gracePeriodLevel = undefined;
    }
  });
}

function resetMonthlyBenefits() {
  var currentMonth = Math.floor((gameState.currentDay - 1) / 30);
  if (gameState._lastBenefitsResetMonth === currentMonth) return;
  gameState._lastBenefitsResetMonth = currentMonth;
  gameState.members.forEach(function(m){
    m._usedFreeCancelMonth = 0;
    m._usedFreeUpgradeQuarterly = 0;
  });
  gameState.corporateAccounts.forEach(function(corp){
    if ((gameState.currentDay - corp.billingCycleStart) % 30 === 0) {
      corp.usedBudget = 0;
    }
  });
}

function getMemberLifetimeValue(memberId) {
  var member = gameState.members.find(function(m){ return m.id === memberId; });
  if (!member) return 0;
  var baseLTV = member.totalSpent || 0;
  var pointValue = getMemberPointsBalance(memberId) / POINTS_CONFIG.redeemRate;
  var levelBonus = member.level * 500;
  var frequencyBonus = member.totalTrips * 200;
  return baseLTV + pointValue + levelBonus + frequencyBonus;
}

function getTopCustomers(count) {
  count = count || 20;
  var ranked = (gameState.members || []).map(function(m){
    return Object.assign({}, m, { ltv: getMemberLifetimeValue(m.id) });
  }).sort(function(a,b){ return b.ltv - a.ltv; });
  return ranked.slice(0, count);
}

function getAtRiskCustomers(thresholdDays) {
  thresholdDays = thresholdDays || 60;
  return (gameState.members || []).filter(function(m){
    return m.lastRentalDay && (gameState.currentDay - m.lastRentalDay) >= thresholdDays;
  }).map(function(m){
    var daysSinceLast = gameState.currentDay - (m.lastRentalDay || 0);
    return Object.assign({}, m, { daysSinceLast: daysSinceLast, riskLevel: daysSinceLast >= 90 ? 'high' : daysSinceLast >= 60 ? 'medium' : 'low' });
  });
}

function getCustomerSegmentAnalysis() {
  var members = gameState.members || [];
  var businessCount = 0, leisureCount = 0;
  var frequentCount = 0, occasionalCount = 0;
  members.forEach(function(m){
    if (m.type === '商务') businessCount++; else leisureCount++;
    if (m.totalTrips >= 10) frequentCount++; else occasionalCount++;
  });
  return {
    business: { count: businessCount, pct: members.length > 0 ? Math.round(businessCount/members.length*100) : 0 },
    leisure: { count: leisureCount, pct: members.length > 0 ? Math.round(leisureCount/members.length*100) : 0 },
    frequent: { count: frequentCount, pct: members.length > 0 ? Math.round(frequentCount/members.length*100) : 0 },
    occasional: { count: occasionalCount, pct: members.length > 0 ? Math.round(occasionalCount/members.length*100) : 0 },
    total: members.length
  };
}

function predictChurnScore(memberId) {
  var member = gameState.members.find(function(m){ return m.id === memberId; });
  if (!member) return 0;
  var score = 50;
  var daysSinceLast = gameState.currentDay - (member.lastRentalDay || member.registerDay || 1);
  if (daysSinceLast > 60) score += 20;
  if (daysSinceLast > 90) score += 15;
  if (daysSinceLast > 120) score += 10;
  if (member.totalTrips <= 2) score += 10;
  if (member.totalTrips >= 15) score -= 20;
  if (member.level >= 4) score -= 15;
  if (daysSinceLast <= 14) score -= 20;
  if (member.isActive) score -= 10;
  return Math.max(0, Math.min(100, score));
}

function getNextBestAction(segment) {
  var actions = {
    high_value_frequent: { action:'邀请参与VIP体验计划', priority:'高', expectedImpact:'+8%留存' },
    high_value_dormant: { action:'发送回归优惠套餐', priority:'紧急', expectedImpact:'+15%激活率' },
    new_member: { action:'引导完成首次升级权益体验', priority:'中', expectedImpact:'+20%复购' },
    at_risk: { action:'赠送免费升级券+专属客服联系', priority:'高', expectedImpact:'+12%挽回' },
    corporate: { action:'提供季度回顾与批量折扣续约', priority:'中', expectedImpact:'+10%续约' },
    default: { action:'定期推送个性化推荐', priority:'低', expectedImpact:'+5%互动' }
  };
  return actions[segment] || actions.default;
}

function getMemberCommunicationLog(memberId) {
  return (gameState.memberBenefitsLog || []).filter(function(l){ return l.memberId === memberId; });
}

var SURNAMES = ['王','李','张','刘','陈','杨','黄','赵','周','吴','徐','孙','马','胡','朱','郭','何','罗','高','林','梁','郑','谢','宋','唐','韩','曹','许','邓','冯','萧','程','蔡','彭','潘','袁','于','董','余','苏','叶','吕','魏','蒋','田','杜','丁','沈','任','姚','卢','姜','崔','钟','谭','陆','汪','范','廖','石','金','贾','夏','薛','雷','贺','倪','汤','龙','段','黎','史','陶','毛','郝','龚','邵','万','钱','严','覃','武','戴','莫','孔','向','汤'];
var GIVEN_NAMES = ['伟','芳','娜','秀英','敏','静','丽','强','磊','军','洋','勇','艳','杰','娟','涛','明','超','秀兰','霞','平','刚','桂英','文','辉','鑫','玉兰','红','玲','飞','华','兰','萍','桂兰','英','梅','鹏','旭','博','雪','松','蕾','琳','宇','峰','浩','志','昊','天','睿','晨','思','雨','欣','怡','佳','悦','子涵','子轩','梓涵','一诺','浩然','宇轩','欣怡','诗涵','可馨','梦瑶','雨桐','紫萱','思颖','若曦','语嫣','佳琪','雨薇','梓萱','诗琪','心怡','雅琴','晓峰','建国','志强','建华','国强','海涛','文博','永强','天翔','子豪','泽宇','浩宇','铭轩','逸飞','嘉诚','俊豪','天佑','文昊','修远'];

function generateMemberId() {
  var prefix = 'VIP';
  var ts = Date.now().toString(36).toUpperCase();
  var rand = Math.random().toString(36).substr(2, 4).toUpperCase();
  return prefix + ts.slice(-4) + rand;
}

function generateMemberName() {
  var surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
  var given = GIVEN_NAMES[Math.floor(Math.random() * GIVEN_NAMES.length)];
  if (Math.random() < 0.3) {
    given += GIVEN_NAMES[Math.floor(Math.random() * GIVEN_NAMES.length)];
  }
  return surname + given;
}

function generatePhone() {
  var prefixes = ['138','139','136','137','135','158','159','188','187','186','177','176','155','153','180','181','182','183','189','170','171','172','173','175','178','198','199','166','167'];
  var p = prefixes[Math.floor(Math.random() * prefixes.length)];
  var n = '';
  for (var i = 0; i < 8; i++) n += Math.floor(Math.random() * 10);
  return p + n;
}

function generateMember() {
  var name = generateMemberName();
  var phone = generatePhone();
  var id = generateMemberId();
  var totalTrips = Math.floor(Math.random() * 35);
  var level = 1;
  for (var i = MEMBER_LEVELS.length - 1; i >= 0; i--) {
    if (totalTrips >= MEMBER_LEVELS[i].minTrips) { level = MEMBER_LEVELS[i].level; break; }
  }
  var totalSpent = Math.round(totalTrips * (200 + Math.random() * 800));
  var registerDay = Math.max(1, gameState.currentDay - Math.floor(Math.random() * 90 + 10));
  return {
    id: id,
    name: name,
    phone: phone,
    level: level,
    totalTrips: totalTrips,
    totalSpent: totalSpent,
    registerDay: registerDay,
    lastRentalDay: totalTrips > 0 ? Math.max(registerDay, gameState.currentDay - Math.floor(Math.random() * 30)) : 0,
    isActive: Math.random() > 0.15
  };
}

function getMemberLevelInfo(level) {
  return MEMBER_LEVELS.find(function(l){ return l.level === level; }) || MEMBER_LEVELS[0];
}

function generateInitialMembers(count) {
  var members = [];
  for (var i = 0; i < count; i++) {
    members.push(generateMember());
  }
  return members;
}

function addNewMember() {
  var member = generateMember();
  member.totalTrips = 0;
  member.totalSpent = 0;
  member.registerDay = gameState.currentDay;
  member.lastRentalDay = 0;
  member.level = 1;
  member.isActive = true;
  gameState.members.push(member);
  return member;
}

function updateMemberAfterRental(memberId, amount) {
  initMemberSystem();
  var member = gameState.members.find(function(m){ return m.id === memberId; });
  if (!member) return;
  member.totalTrips++;
  member.totalSpent += amount;
  member.lastRentalDay = gameState.currentDay;
  for (var i = MEMBER_LEVELS.length - 1; i >= 0; i--) {
    if (member.totalTrips >= MEMBER_LEVELS[i].minTrips) {
      if (member.level < MEMBER_LEVELS[i].level) {
        member.level = MEMBER_LEVELS[i].level;
        addMessage('👤 会员 ' + member.name + ' 升级为 ' + MEMBER_LEVELS[i].name + '！', 'good');
      }
      break;
    }
  }
  var pointsEarned = addMemberPoints(memberId, amount);
  if (pointsEarned > 0 && Math.random() < 0.3) {
    addMessage('💎 ' + member.name + ' 积分 +' + pointsEarned + '（余额:' + getMemberPointsBalance(memberId) + '）', 'good');
  }
}

function getActiveMemberCount() {
  return gameState.members.filter(function(m){ return m.isActive; }).length;
}

function getMemberLevelDistribution() {
  var dist = {};
  MEMBER_LEVELS.forEach(function(l){ dist[l.level] = 0; });
  gameState.members.forEach(function(m){ dist[m.level] = (dist[m.level] || 0) + 1; });
  return dist;
}
