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
  var rateMultiplier = order.totalIncome / (vehicle.dailyRate * order.rentalDays);
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
  var returningOrders = (gameState.orderHistory || []).filter(function(o) {
    return o.acceptedDay === gameState.currentDay - 1;
  });
  returningOrders.forEach(function(order) {
    var vehicle = gameState.ownedVehicles.find(function(v){ return v.id === order.vehicleId; });
    var review = generateReviewForOrder(order, vehicle);
    if (review) {
      gameState.customerReviews.push(review);
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
