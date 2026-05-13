var COMPLAINT_TEMPLATES = [
  { id:'vehicle_issue', name:'车辆问题', severity:'high', category:'Vehicle',
    autoResponse:'立即安排检修，提供替代车辆', compensationRange:[50,300], slaPriority:'High' },
  { id:'billing_error', name:'计费错误', severity:'medium', category:'Billing',
    autoResponse:'核实账单，多退少补', compensationRange:[0,200], slaPriority:'Normal' },
  { id:'service_attitude', name:'服务态度', severity:'medium', category:'Service',
    autoResponse:'致歉+员工培训', compensationRange:[20,100], slaPriority:'Normal' },
  { id:'late_delivery', name:'延迟交付', severity:'high', category:'Service',
    autoResponse:'加急配送+租金减免', compensationRange:[100,500], slaPriority:'High' },
  { id:'insurance_dispute', name:'保险纠纷', severity:'critical', category:'Policies',
    autoResponse:'专人跟进+法律支持', compensationRange:[200,2000], slaPriority:'Critical' },
  { id:'cleanliness_issue', name:'卫生问题', severity:'low', category:'Service',
    autoResponse:'立即清洁+致歉', compensationRange:[10,50], slaPriority:'Low' },
  { id:'booking_error', name:'预订错误', severity:'medium', category:'Policies',
    autoResponse:'重新安排+补偿', compensationRange:[30,150], slaPriority:'Normal' },
  { id:'equipment_failure', name:'设备故障', severity:'high', category:'Vehicle',
    autoResponse:'紧急维修+替代方案', compensationRange:[80,400], slaPriority:'High' }
];

var COMPLAINT_CATEGORIES = ['Service','Vehicle','Billing','Policies','Safety'];
var COMPLAINT_STATUSES = ['Received','Categorized','Prioritized','Assigned','Resolved','FollowedUp','Closed'];
var COMPLAINT_PRIORITIES = ['Critical','High','Normal','Low'];
var SLA_TARGETS = {
  Critical: { responseHours:4, resolutionHours:24, breachPenaltyMin:200, breachPenaltyMax:500 },
  High: { responseHours:8, resolutionHours:48, breachPenaltyMin:100, breachPenaltyMax:300 },
  Normal: { responseHours:24, resolutionHours:72, breachPenaltyMin:50, breachPenaltyMax:150 },
  Low: { responseHours:48, resolutionHours:168, breachPenaltyMin:50, breachPenaltyMax:100 }
};

var NPS_REASONS = ['车况优良','服务周到','价格合理','取还便捷','员工专业','设施完善','推荐亲友','体验超出预期'];

function initNPSSystem() {
  if (!gameState.npsSystem) {
    gameState.npsSystem = {
      scores: [],
      trend30d: 0,
      trend7d: 0,
      byOutlet: {},
      byType: {},
      byEmployee: {},
      detractorsRecovery: [],
      promoterReferrals: [],
      industryBenchmark: 32,
      revenueCorrelationData: []
    };
  }
}

function recordNPSScore(day, score, outletId, customerId, reason, vehicleType, rentalDuration, employeeId) {
  initNPSSystem();
  var npsEntry = {
    day: day,
    score: score,
    outletId: outletId || 0,
    customerId: customerId,
    reason: reason || '',
    vehicleType: vehicleType || '轿车',
    rentalDuration: rentalDuration || 1,
    employeeId: employeeId || null
  };
  gameState.npsSystem.scores.push(npsEntry);
  if (gameState.npsSystem.scores.length > 500) {
    gameState.npsSystem.scores = gameState.npsSystem.scores.slice(-500);
  }
  var outKey = 'outlet_' + (outletId || 0);
  if (!gameState.npsSystem.byOutlet[outKey]) gameState.npsSystem.byOutlet[outKey] = [];
  gameState.npsSystem.byOutlet[outKey].push(npsEntry);
  var typeKey = 'type_' + (vehicleType || '轿车');
  if (!gameState.npsSystem.byType[typeKey]) gameState.npsSystem.byType[typeKey] = [];
  gameState.npsSystem.byType[typeKey].push(npsEntry);
  if (employeeId) {
    var empKey = 'emp_' + employeeId;
    if (!gameState.npsSystem.byEmployee[empKey]) gameState.npsSystem.byEmployee[empKey] = [];
    gameState.npsSystem.byEmployee[empKey].push(npsEntry);
  }
  if (score >= 4) {
    handlePromoterAction(npsEntry);
  } else if (score <= 2) {
    handleDetractorRecovery(npsEntry);
  }
  updateNPSTrends();
  return npsEntry;
}

function calculateNPSFromScores(scores) {
  if (!scores || scores.length === 0) return 50;
  var promoters = scores.filter(function(s){ return s.score >= 4; }).length;
  var detractors = scores.filter(function(s){ return s.score <= 2; }).length;
  return Math.round((promoters - detractors) / scores.length * 100);
}

function updateNPSTrends() {
  initNPSSystem();
  var now = gameState.currentDay;
  var scores30d = gameState.npsSystem.scores.filter(function(s){ return s.day > now - 30; });
  var scores7d = gameState.npsSystem.scores.filter(function(s){ return s.day > now - 7; });
  gameState.npsSystem.trend30d = calculateNPSFromScores(scores30d);
  gameState.npsSystem.trend7d = calculateNPSFromScores(scores7d);
  var recentRevenue = (gameState.financials && gameState.financials.dailyRevenue) ? gameState.financials.dailyRevenue.slice(-30) : [];
  if (scores30d.length >= 5 && recentRevenue.length >= 5) {
    var avgNPS = gameState.npsSystem.trend30d;
    var avgRevenue = recentRevenue.reduce(function(s,r){return s+r;},0) / recentRevenue.length;
    gameState.npsSystem.revenueCorrelationData.push({ day: now, nps: avgNPS, revenue: avgRevenue });
    if (gameState.npsSystem.revenueCorrelationData.length > 90) {
      gameState.npsSystem.revenueCorrelationData = gameState.npsSystem.revenueCorrelationData.slice(-90);
    }
  }
}

function getNPSTrendLine(days) {
  initNPSSystem();
  days = days || 30;
  var trend = [];
  for (var d = days; d >= 0; d--) {
    var day = gameState.currentDay - d;
    if (day < 1) continue;
    var dayScores = gameState.npsSystem.scores.filter(function(s){ return s.day === day; });
    trend.push({ day: day, nps: calculateNPSFromScores(dayScores), count: dayScores.length });
  }
  return trend;
}

function getNPSBreakdown(dimension) {
  initNPSSystem();
  var result = {};
  var source = {};
  if (dimension === 'outlet') source = gameState.npsSystem.byOutlet;
  else if (dimension === 'type') source = gameState.npsSystem.byType;
  else if (dimension === 'employee') source = gameState.npsSystem.byEmployee;
  else return result;
  Object.keys(source).forEach(function(key) {
    var scores = source[key];
    if (scores && scores.length > 0) {
      var label = key.replace(/^(outlet_|type_|emp_)/,'');
      result[label] = {
        nps: calculateNPSFromScores(scores),
        count: scores.length,
        avgScore: Math.round(scores.reduce(function(s,r){return s+r.score;},0) / scores.length * 10) / 10
      };
    }
  });
  return result;
}

function getNPSBenchmarkComparison() {
  initNPSSystem();
  var myNPS = gameState.npsSystem.trend30d;
  var benchmark = gameState.npsSystem.industryBenchmark;
  var diff = myNPS - benchmark;
  var status, color, desc;
  if (diff >= 20) { status='卓越'; color='#22c55e'; desc='远超行业平均，品牌影响力强'; }
  else if (diff >= 10) { status='优秀'; color='#4ade80'; desc='高于行业平均，竞争优势明显'; }
  else if (diff >= 0) { status='良好'; color='#3b82f6'; desc='达到行业平均水平'; }
  else if (diff >= -10) { status='待提升'; color='#f59e0b'; desc='略低于行业平均，需改进'; }
  else { status='警告'; color='#ef4444'; desc='显著低于行业平均，急需行动'; }
  return { myNPS: myNPS, benchmark: benchmark, diff: diff, status: status, color: color, desc: desc };
}

function handleDetractorRecovery(npsEntry) {
  initNPSSystem();
  var existing = gameState.npsSystem.detractorsRecovery.find(function(r){
    return r.customerId === npsEntry.customerId && r.status !== 'Recovered';
  });
  if (existing) return;
  var recovery = {
    id: 'REC_' + Date.now(),
    customerId: npsEntry.customerId,
    customerName: npsEntry.customerId,
    originalScore: npsEntry.score,
    originalDay: npsEntry.day,
    outletId: npsEntry.outletId,
    followUpDay: npsEntry.day + 1,
    status: 'Pending',
    attempts: 0,
    maxAttempts: 3,
    recovered: false,
    recoveryScore: null,
    notes: []
  };
  var member = (gameState.members || []).find(function(m){ return m.id === npsEntry.customerId; });
  if (member) recovery.customerName = member.name;
  gameState.npsSystem.detractorsRecovery.push(recovery);
}

function processDetractorRecoveryDaily() {
  initNPSSystem();
  var today = gameState.currentDay;
  gameState.npsSystem.detractorsRecovery.forEach(function(rec){
    if (rec.status === 'Recovered' || rec.status === 'Lost') return;
    if (rec.followUpDay <= today && rec.attempts < rec.maxAttempts) {
      rec.attempts++;
      rec.lastAttemptDay = today;
      var recoveryChance = 0.3 + (rec.attempts * 0.15) + (Math.random() * 0.2);
      if (Math.random() < recoveryChance) {
        rec.status = 'Recovered';
        rec.recovered = true;
        rec.recoveryScore = Math.floor(3 + Math.random() * 2);
        rec.recoveryDay = today;
        addMessage('🔄 贬低者挽回成功！客户评分从 ' + rec.originalScore + ' → ' + rec.recoveryScore, 'good');
      } else if (rec.attempts >= rec.maxAttempts) {
        rec.status = 'Lost';
        addMessage('😞 贬低者挽回失败：' + (rec.customerName || rec.customerId), 'bad');
      } else {
        rec.followUpDay = today + Math.floor(1 + Math.random() * 2);
        rec.notes.push({ day: today, action: '跟进联系', result: '待回复' });
      }
    }
  });
}

function handlePromoterAction(npsEntry) {
  initNPSSystem();
  if (Math.random() > 0.25) return;
  var referralBonus = Math.floor(50 + Math.random() * 150);
  var referral = {
    id: 'REF_' + Date.now(),
    promoterId: npsEntry.customerId,
    promoterName: npsEntry.customerId,
    day: npsEntry.day,
    bonus: referralBonus,
    status: 'Given',
    convertedCustomers: Math.random() < 0.6 ? Math.floor(1 + Math.random() * 2) : 0
  };
  var member = (gameState.members || []).find(function(m){ return m.id === npsEntry.customerId; });
  if (member) referral.promoterName = member.name;
  gameState.npsSystem.promoterReferrals.push(referral);
  gameState.cash += referralBonus;
  gameState.todayIncome += referralBonus;
  if (referral.convertedCustomers > 0) {
    addMessage('🎯 推荐者奖励：' + (referral.promoterName || referral.promoterId) + ' 推荐 ' + referral.convertedCustomers + ' 位新客户，奖励 +' + formatCurrency(referral.bonus), 'good');
  }
  if (gameState.npsSystem.promoterReferrals.length > 200) {
    gameState.npsSystem.promoterReferrals = gameState.npsSystem.promoterReferrals.slice(-200);
  }
}

function generateComplaint(order, review) {
  if (!order && !review) return null;
  var template = COMPLAINT_TEMPLATES[Math.floor(Math.random() * COMPLAINT_TEMPLATES.length)];
  var complaint = {
    id: 'CMP_' + Date.now() + '_' + Math.random().toString(36).substr(2,4),
    templateId: template.id,
    title: template.name,
    category: template.category,
    severity: template.severity,
    priority: template.slaPriority,
    status: 'Received',
    customerId: order ? order.customerId : ('customer_' + Date.now()),
    customerName: order ? order.customerName : (review ? review.customerName : '匿名客户'),
    outletId: order ? order.outletId : (review ? review.outletId : 0),
    orderId: order ? order.id : null,
    description: template.autoResponse,
    compensation: Math.floor(template.compensationRange[0] + Math.random() * (template.compensationRange[1] - template.compensationRange[0])),
    createdDay: gameState.currentDay,
    responseDeadline: null,
    resolutionDeadline: null,
    assignedTo: null,
    resolutionNotes: '',
    followUpDone: false,
    satisfactionAfterResolve: null,
    slaBreached: false,
    breachPenalty: 0
  };
  var sla = SLA_TEMPLATE[template.slaPriority];
  if (sla) {
    complaint.responseDeadline = gameState.currentDay + Math.ceil(sla.responseHours / 24);
    complaint.resolutionDeadline = gameState.currentDay + Math.ceil(sla.resolutionHours / 24);
  }
  return complaint;
}

var SLA_TEMPLATE = {
  Critical: { responseHours:4, resolutionHours:24 },
  High: { responseHours:8, resolutionHours:48 },
  Normal: { responseHours:24, resolutionHours:72 },
  Low: { responseHours:48, resolutionHours:168 }
};

function initComplaintSystem() {
  if (!gameState.complaintSystem) {
    gameState.complaintSystem = {
      complaints: [],
      stats: { total:0, resolved:0, breached:0, avgResolutionTime:0, totalCompensation:0 },
      categories: {}
    };
  }
}

function createComplaint(sourceOrder, sourceReview) {
  initComplaintSystem();
  var complaint = generateComplaint(sourceOrder, sourceReview);
  if (!complaint) return null;
  gameState.complaintSystem.complaints.push(complaint);
  gameState.complaintSystem.stats.total++;
  if (!gameState.complaintSystem.categories[complaint.category]) {
    gameState.complaintSystem.categories[complaint.category] = 0;
  }
  gameState.complaintSystem.categories[complaint.category]++;
  addMessage('⚠️ 收到投诉：' + complaint.title + ' — ' + complaint.customerName + '（' + complaint.priority + '优先级）', 'warn');
  return complaint;
}

function categorizeComplaint(complaintId) {
  var complaint = getComplaintById(complaintId);
  if (!complaint || complaint.status !== 'Received') return null;
  complaint.status = 'Categorized';
  complaint.categorizedDay = gameState.currentDay;
  return complaint;
}

function prioritizeComplaint(complaintId) {
  var complaint = getComplaintById(complaintId);
  if (!complaint || complaint.status !== 'Categorized') return null;
  complaint.status = 'Prioritized';
  complaint.prioritizedDay = gameState.currentDay;
  return complaint;
}

function assignComplaint(complaintId, employeeId) {
  var complaint = getComplaintById(complaintId);
  if (!complaint || complaint.status !== 'Prioritized') return null;
  complaint.status = 'Assigned';
  complaint.assignedTo = employeeId;
  complaint.assignedDay = gameState.currentDay;
  var emp = (gameState.employees || []).find(function(e){ return e.id === employeeId; });
  addMessage('📋 投诉已分配：' + complaint.title + ' → ' + (emp ? emp.name : '员工' + employeeId), 'warn');
  return complaint;
}

function resolveComplaint(complaintId, notes, compensationOverride) {
  var complaint = getComplaintById(complaintId);
  if (!complaint || (complaint.status !== 'Assigned' && complaint.status !== 'Prioritized')) return null;
  complaint.status = 'Resolved';
  complaint.resolutionNotes = notes || complaint.description;
  complaint.resolvedDay = gameState.currentDay;
  var finalComp = compensationOverride !== undefined ? compensationOverride : complaint.compensation;
  if (finalComp > 0) {
    gameState.cash -= finalComp;
    gameState.todayExpense += finalComp;
    gameState.complaintSystem.stats.totalCompensation += finalComp;
  }
  var resolutionDays = gameState.currentDay - complaint.createdDay;
  complaint.resolutionTime = resolutionDays;
  var sla = SLA_TEMPLATE[complaint.priority];
  if (sla && resolutionDays * 24 > sla.resolutionHours) {
    complaint.slaBreached = true;
    var penaltyRange = SLA_TARGETS[complaint.priority];
    if (penaltyRange) {
      complaint.breachPenalty = Math.floor(penaltyRange.breachPenaltyMin + Math.random() * (penaltyRange.breachPenaltyMax - penaltyRange.breachPenaltyMin));
      gameState.cash -= complaint.breachPenalty;
      gameState.todayExpense += complaint.breachPenalty;
      gameState.complaintSystem.stats.breached++;
      addMessage('🚨 SLA违约！投诉 ' + complaint.title + ' 超时解决，罚款 -$' + complaint.breachPenalty, 'bad');
    }
  }
  gameState.complaintSystem.stats.resolved++;
  updateComplaintAvgResolution();
  addMessage('✅ 投诉已解决：' + complaint.title + '（赔偿 $' + finalComp + '）', complaint.slaBreached ? 'bad' : 'good');
  return complaint;
}

function followUpComplaint(complaintId) {
  var complaint = getComplaintById(complaintId);
  if (!complaint || complaint.status !== 'Resolved') return null;
  complaint.status = 'FollowedUp';
  complaint.followUpDay = gameState.currentDay;
  complaint.followUpDone = true;
  complaint.satisfactionAfterResolve = Math.floor(2 + Math.random() * 4);
  return complaint;
}

function closeComplaint(complaintId) {
  var complaint = getComplaintById(complaintId);
  if (!complaint || (complaint.status !== 'FollowedUp' && complaint.status !== 'Resolved')) return null;
  complaint.status = 'Closed';
  complaint.closedDay = gameState.currentDay;
  return complaint;
}

function escalateComplaint(complaintId) {
  var complaint = getComplaintById(complaintId);
  if (!complaint) return null;
  complaint.status = 'Escalated';
  complaint.escalatedDay = gameState.currentDay;
  complaint.priority = complaint.priority === 'Low' ? 'Normal' : complaint.priority === 'Normal' ? 'High' : complaint.priority === 'High' ? 'Critical' : 'Critical';
  var newSla = SLA_TEMPLATE[complaint.priority];
  if (newSla) {
    complaint.responseDeadline = gameState.currentDay + Math.ceil(newSla.responseHours / 24);
    complaint.resolutionDeadline = gameState.currentDay + Math.ceil(newSla.resolutionHours / 24);
  }
  addMessage('⚡ 投诉升级：' + complaint.title + ' → ' + complaint.priority, 'bad');
  return complaint;
}

function getComplaintById(complaintId) {
  if (!gameState.complaintSystem) return null;
  return gameState.complaintSystem.complaints.find(function(c){ return c.id === complaintId; }) || null;
}

function processComplaintSLADaily() {
  initComplaintSystem();
  var today = gameState.currentDay;
  var activeComplaints = gameState.complaintSystem.complaints.filter(function(c){
    return c.status !== 'Closed' && c.status !== 'Resolved' && c.status !== 'FollowedUp' && c.status !== 'Escalated';
  });
  activeComplaints.forEach(function(c){
    if (c.responseDeadline && today > c.responseDeadline && c.status === 'Received') {
      addMessage('⏰ 投诉响应超时：' + c.title + '（应在D' + c.responseDeadline + '前响应）', 'warn');
    }
    if (c.resolutionDeadline && today > c.resolutionDeadline && c.status !== 'Closed') {
      if (!c.slaWarned) {
        addMessage('🚨 投诉即将SLA违约：' + c.title, 'bad');
        c.slaWarned = true;
      }
    }
  });
}

function updateComplaintAvgResolution() {
  if (!gameState.complaintSystem) return;
  var resolved = gameState.complaintSystem.complaints.filter(function(c){ return c.status === 'Closed' || c.status === 'FollowedUp' || c.status === 'Resolved'; });
  if (resolved.length > 0) {
    var totalTime = resolved.reduce(function(s,c){ return s + (c.resolutionTime || 0); }, 0);
    gameState.complaintSystem.stats.avgResolutionTime = Math.round(totalTime / resolved.length * 10) / 10;
  }
}

function getComplaintStats() {
  initComplaintSystem();
  var openCount = gameState.complaintSystem.complaints.filter(function(c){
    return c.status !== 'Closed';
  }).length;
  var byStatus = {};
  COMPLAINT_STATUSES.forEach(function(s){ byStatus[s] = 0; });
  gameState.complaintSystem.complaints.forEach(function(c){ byStatus[c.status] = (byStatus[c.status]||0)+1; });
  var byPriority = {};
  COMPLAINT_PRIORITIES.forEach(function(p){ byPriority[p] = 0; });
  gameState.complaintSystem.complaints.forEach(function(c){ byPriority[c.priority] = (byPriority[c.priority]||0)+1; });
  return Object.assign({}, gameState.complaintSystem.stats, { openCount: openCount, byStatus: byPriority, byPriority: byPriority });
}

function processRandomComplaint() {
  if (Math.random() > 0.08) return;
  var yesterdayOrders = (gameState.orderHistory || []).filter(function(o){
    return o.acceptedDay === gameState.currentDay - 1;
  });
  if (yesterdayOrders.length === 0) return;
  var targetOrder = yesterdayOrders[Math.floor(Math.random() * yesterdayOrders.length)];
  var yesterdayReviews = (gameState.customerReviews || []).filter(function(r){
    return r.day === gameState.currentDay - 1 && r.score <= 2;
  });
  var targetReview = yesterdayReviews.length > 0 ? yesterdayReviews[Math.floor(Math.random() * yesterdayReviews.length)] : null;
  createComplaint(targetOrder, targetReview);
}

var AD_TYPES = [
  { id:'flyer', name:'传单', costPerDay: 500, effectMult: 1.05, target:'city', icon:'📄', desc:'基础宣传' },
  { id:'social', name:'社交媒体', costPerDay: 2000, effectMult: 1.12, target:'city', icon:'📱', desc:'精准投放' },
  { id:'tv', name:'电视广告', costPerDay: 8000, effectMult: 1.25, target:'city', icon:'📺', desc:'广泛覆盖' },
  { id:'celebrity', name:'明星代言', costPerDay: 50000, effectMult: 1.5, target:'global', minDays: 7, icon:'🌟', desc:'品牌升级' }
];

var REVIEW_TEXTS = {
  5: ['完美体验！下次还来！','车况极好，服务超赞！','强烈推荐这家租车公司！','从取车到还车全程无忧！','超出预期，五星好评！','员工态度特别好，车也很新！'],
  4: ['整体不错，小细节可提升','车况良好，价格合理','服务到位，下次还会选择','基本满意，推荐给朋友','效率很高，车况不错'],
  3: ['一般般，没什么特别','价格还行，服务一般','等车时间有点长','中规中矩的体验','设施有待改善'],
  2: ['不太满意，车有点旧','服务态度需要改进','等了太久才取到车','价格偏贵，体验一般','车内不够干净'],
  1: ['非常失望，不会再来了','车况很差，和描述不符','服务极差，浪费时间','强烈不推荐！','完全不值这个价']
};

function generateReviewForOrder(order, vehicle) {
  if (!order || !vehicle) return null;
  var score = 3;
  if (vehicle.isNew || vehicle.condition === '优秀') score += 1.5;
  else if (vehicle.condition === '良好') score += 0.8;
  else if (vehicle.condition === '一般') score += 0;
  else if (vehicle.condition === '较差') score -= 1;
  if (vehicle.cleanliness !== undefined) {
    if (vehicle.cleanliness >= 80) score += 0.5;
    else if (vehicle.cleanliness < 30) score -= 1;
  }
  var outletId = order.outletId || 0;
  if (typeof getOutletSatisfactionBonus === 'function') {
    var satBonus = getOutletSatisfactionBonus(outletId);
    score += satBonus / 10;
  }
  if (typeof getEmployeesAtOutlet === 'function') {
    var employees = getEmployeesAtOutlet(outletId);
    if (employees.length > 0) {
      var avgMorale = employees.reduce(function(s,e){return s+(e.morale||50);},0)/employees.length;
      score += (avgMorale - 50) / 50;
    }
  }
  var dailyRateBase = (vehicle && vehicle.dailyRate) ? vehicle.dailyRate : 1;
  var rateMultiplier = order.totalIncome / (dailyRateBase * order.rentalDays);
  if (rateMultiplier > 1.5) score -= 0.8;
  else if (rateMultiplier > 1.3) score -= 0.3;
  else if (rateMultiplier < 1.0) score += 0.3;
  score = Math.max(1, Math.min(5, Math.round(score + (Math.random() - 0.5) * 1.5)));
  var texts = REVIEW_TEXTS[score] || REVIEW_TEXTS[3];
  var text = texts[Math.floor(Math.random() * texts.length)];
  var isReturnCustomer = score >= 4 && Math.random() < 0.3;
  return {
    orderId: order.id,
    customerName: order.customerName,
    vehicleName: order.vehicleName,
    score: score,
    text: text,
    day: gameState.currentDay,
    isReturnCustomer: isReturnCustomer,
    outletId: outletId
  };
}

function processDailyReviews() {
  initNPSSystem();
  var returningOrders = (gameState.orderHistory || []).filter(function(o) {
    return o.acceptedDay === gameState.currentDay - 1;
  });
  returningOrders.forEach(function(order) {
    var vehicle = gameState.ownedVehicles.find(function(v){ return v.id === order.vehicleId; });
    var review = generateReviewForOrder(order, vehicle);
    if (review) {
      gameState.customerReviews.push(review);
      recordNPSScore(review.day, review.score, review.outletId, order.customerId || order.customerName,
        REVIEW_TEXTS[review.score] ? REVIEW_TEXTS[review.score][0] : '', order.vehicleType, order.rentalDays);
      if (review.isReturnCustomer) {
        var memberReview = {
          name: order.customerName,
          type: order.customerType === 'business' ? '商务' : '旅游',
          phone: '1' + Math.floor(Math.random()*9000000000+1000000000),
          level: 1,
          totalSpent: order.actualIncome || 0,
          totalRentals: 1,
          joinDate: gameState.currentDay,
          lastRentalDate: gameState.currentDay,
          preferredType: order.vehicleType || '轿车'
        };
        if (!gameState.members) gameState.members = [];
        gameState.members.push(memberReview);
      }
    }
  });
  if (gameState.customerReviews.length > 200) {
    gameState.customerReviews = gameState.customerReviews.slice(-200);
  }
  calculateNPS();
  processDetractorRecoveryDaily();
  processRandomComplaint();
  processComplaintSLADaily();
  var avg30 = parseFloat(getAverageRating(30));
  if (avg30 > 0) {
    gameState.reputation = Math.round(avg30 * 20);
  }
}

function calculateNPS() {
  var recent = (gameState.customerReviews || []).filter(function(r) {
    return r.day >= gameState.currentDay - 30;
  });
  if (recent.length === 0) { gameState.npsScore = 50; return; }
  var promoters = recent.filter(function(r){ return r.score >= 4; }).length;
  var detractors = recent.filter(function(r){ return r.score <= 2; }).length;
  var nps = Math.round((promoters - detractors) / recent.length * 100);
  gameState.npsScore = Math.max(0, Math.min(100, nps + 50));
}

function getAverageRating(days) {
  var cutoff = gameState.currentDay - (days || 30);
  var recent = (gameState.customerReviews || []).filter(function(r){ return r.day >= cutoff; });
  if (recent.length === 0) return 0;
  return (recent.reduce(function(s,r){return s+r.score;},0) / recent.length).toFixed(1);
}

function getRatingTrend(days) {
  var trend = [];
  for (var d = days || 7; d >= 0; d--) {
    var day = gameState.currentDay - d;
    var dayReviews = (gameState.customerReviews || []).filter(function(r){ return r.day === day; });
    var avg = dayReviews.length > 0 ? dayReviews.reduce(function(s,r){return s+r.score;},0)/dayReviews.length : 0;
    trend.push({ day: day, avg: avg, count: dayReviews.length });
  }
  return trend;
}

function getRecentReviews(count) {
  return (gameState.customerReviews || []).slice(-(count || 10)).reverse();
}

function getReviewImpactOnOrders() {
  var avg = parseFloat(getAverageRating(30));
  if (avg >= 4.5) return { bonus: 0.2, desc: '口碑极佳，订单+20%' };
  if (avg >= 4.0) return { bonus: 0.1, desc: '口碑良好，订单+10%' };
  if (avg >= 3.0) return { bonus: 0, desc: '口碑一般，无加成' };
  if (avg >= 2.0) return { bonus: -0.15, desc: '口碑较差，订单-15%' };
  return { bonus: -0.3, desc: '口碑极差，订单-30%' };
}

function startAdCampaign(adId, cityId) {
  var adType = AD_TYPES.find(function(a){ return a.id === adId; });
  if (!adType) return { ok: false, reason: '广告类型不存在' };
  var existing = gameState.advertising.campaigns.find(function(c){ return c.type === adId && c.cityId === (cityId||'home'); });
  if (existing) return { ok: false, reason: '该广告已在投放中' };
  if (gameState.cash < adType.costPerDay) return { ok: false, reason: '资金不足' };
  gameState.advertising.campaigns.push({
    type: adId,
    cityId: cityId || 'home',
    startDay: gameState.currentDay,
    endDay: null
  });
  addMessage(adType.icon + ' 开始投放: ' + adType.name + ' (' + formatCurrency(adType.costPerDay) + '/天)', 'good');
  updateUI(); saveGame();
  return { ok: true };
}

function stopAdCampaign(adId, cityId) {
  var idx = gameState.advertising.campaigns.findIndex(function(c){ return c.type === adId && c.cityId === (cityId||'home'); });
  if (idx === -1) return { ok: false, reason: '该广告未在投放' };
  gameState.advertising.campaigns.splice(idx, 1);
  addMessage('📢 停止投放: ' + (AD_TYPES.find(function(a){return a.id===adId;})||{}).name, 'warn');
  updateUI(); saveGame();
  return { ok: true };
}

function processDailyAdvertising() {
  var totalSpend = 0;
  gameState.advertising.campaigns.forEach(function(c) {
    var adType = AD_TYPES.find(function(a){ return a.id === c.type; });
    if (adType) totalSpend += adType.costPerDay;
  });
  if (totalSpend > 0) {
    gameState.cash -= totalSpend;
    gameState.todayExpense += totalSpend;
    gameState.advertising.dailySpend = totalSpend;
    if (gameState.financials && gameState.financials.todayDetail) {
      gameState.financials.todayDetail.advertisingCost = (gameState.financials.todayDetail.advertisingCost || 0) + totalSpend;
    }
  } else {
    gameState.advertising.dailySpend = 0;
  }
  processRivalAdResponse();
}

function getAdDemandMultiplier() {
  var mult = 1.0;
  gameState.advertising.campaigns.forEach(function(c) {
    var adType = AD_TYPES.find(function(a){ return a.id === c.type; });
    if (adType) mult *= adType.effectMult;
  });
  return mult;
}

function getActiveCampaigns() {
  return gameState.advertising.campaigns.map(function(c) {
    var adType = AD_TYPES.find(function(a){ return a.id === c.type; });
    return { type: c.type, cityId: c.cityId, startDay: c.startDay, name: adType ? adType.name : c.type, icon: adType ? adType.icon : '📢', costPerDay: adType ? adType.costPerDay : 0, effectMult: adType ? adType.effectMult : 1 };
  });
}

function processRivalAdResponse() {
  if (!gameState.rivals) return;
  var playerHasAds = gameState.advertising.campaigns.length > 0;
  if (!playerHasAds) return;
  gameState.rivals.forEach(function(rival) {
    if (rival.strength > 0.5 && Math.random() < 0.3) {
      if (Math.random() < 0.5) {
        rival.priceModifier = (rival.priceModifier || 1) - 0.1;
        addMessage('⚔️ ' + (RIVAL_COMPANIES.find(function(r){return r.id===rival.id;})||{}).name + ' 开启低价促销！', 'warn');
      } else {
        var playerAdTypes = gameState.advertising.campaigns.map(function(c){ return c.type; });
        if (playerAdTypes.length > 0) {
          rival.adType = playerAdTypes[Math.floor(Math.random() * playerAdTypes.length)];
          addMessage('⚔️ ' + (RIVAL_COMPANIES.find(function(r){return r.id===rival.id;})||{}).name + ' 模仿了你的广告策略！', 'warn');
        }
      }
    }
  });
}
