var VIRTUAL_STOCKS = [
  {ticker:'OILC', name:'石油集团', basePrice:45, volatility:0.03},
  {ticker:'BATT', name:'电池科技', basePrice:120, volatility:0.04},
  {ticker:'TECH', name:'科技指数', basePrice:280, volatility:0.025},
  {ticker:'REIT', name:'地产基金', basePrice:85, volatility:0.02}
];

var LOAN_TERMS = { 30:0.08, 90:0.11, 180:0.15 };

function initFinancialState() {
  if (!gameState.financials) {
    gameState.financials = {
      dailyRevenue: [],
      dailyExpenses: [],
      dailyProfit: [],
      dailyDetails: [],
      totalExpenses: 0,
      todayDetail: {
        rentalIncome: 0, serviceIncome: 0, vehicleSales: 0, investmentIncome: 0,
        wages: 0, maintenance: 0, energyCost: 0, loanInterest: 0, taxes: 0,
        vehiclePurchases: 0, stockPurchases: 0, stockSales: 0,
        loanProceeds: 0, loanRepayments: 0, advertisingCost: 0
      }
    };
  }
  if (!gameState.financials.dailyDetails) gameState.financials.dailyDetails = [];
  if (gameState.financials.totalExpenses === undefined) gameState.financials.totalExpenses = 0;
  if (!gameState.financials.todayDetail) {
    gameState.financials.todayDetail = {
      rentalIncome: 0, serviceIncome: 0, vehicleSales: 0, investmentIncome: 0,
      wages: 0, maintenance: 0, energyCost: 0, loanInterest: 0, taxes: 0,
      vehiclePurchases: 0, stockPurchases: 0, stockSales: 0,
      loanProceeds: 0, loanRepayments: 0, advertisingCost: 0
    };
  }
  if (!gameState.loans) gameState.loans = [];
  if (!gameState.stocks) {
    gameState.stocks = {
      isPublic: false, ticker: 'RENT', sharePrice: 0,
      playerShares: 60, publicShares: 40, totalShares: 100,
      portfolio: [], stockHistory: []
    };
  }
  if (!gameState.stocks.portfolio) gameState.stocks.portfolio = [];
  if (!gameState.stocks.stockHistory) gameState.stocks.stockHistory = [];
  if (gameState.lastTeamBuildingDay === undefined) gameState.lastTeamBuildingDay = 0;
  if (gameState.stocks.stockHistory.length === 0) {
    var snapshot = {};
    VIRTUAL_STOCKS.forEach(function(vs) {
      snapshot[vs.ticker] = vs.basePrice;
    });
    if (gameState.stocks.isPublic) {
      snapshot['RENT'] = gameState.stocks.sharePrice;
    }
    gameState.stocks.stockHistory.push(snapshot);
  }
}

function recordDailyFinancials() {
  var f = gameState.financials;
  var revenue = gameState.todayIncome;
  var expenses = gameState.todayExpense;
  var profit = revenue - expenses;
  f.dailyRevenue.push(revenue);
  f.dailyExpenses.push(expenses);
  f.dailyProfit.push(profit);
  if (f.dailyRevenue.length > 90) f.dailyRevenue.shift();
  if (f.dailyExpenses.length > 90) f.dailyExpenses.shift();
  if (f.dailyProfit.length > 90) f.dailyProfit.shift();
  f.totalExpenses += expenses;
  var detail = JSON.parse(JSON.stringify(f.todayDetail));
  detail.day = gameState.currentDay;
  detail.revenue = revenue;
  detail.expenses = expenses;
  detail.profit = profit;
  f.dailyDetails.push(detail);
  if (f.dailyDetails.length > 90) f.dailyDetails.shift();
  f.todayDetail = {
    rentalIncome: 0, serviceIncome: 0, vehicleSales: 0, investmentIncome: 0,
    wages: 0, maintenance: 0, energyCost: 0, loanInterest: 0, taxes: 0,
    vehiclePurchases: 0, stockPurchases: 0, stockSales: 0,
    loanProceeds: 0, loanRepayments: 0, advertisingCost: 0
  };
}

function getPnL(period) {
  var revenue = 0, expenses = 0, netProfit = 0;
  if (!gameState.financials) return { revenue: 0, expenses: 0, netProfit: 0 };
  if (period === 'today') {
    revenue = gameState.todayIncome;
    expenses = gameState.todayExpense;
    netProfit = revenue - expenses;
  } else if (period === 'month') {
    var f = gameState.financials;
    var days = Math.min(f.dailyRevenue.length, 30);
    for (var i = f.dailyRevenue.length - days; i < f.dailyRevenue.length; i++) {
      revenue += f.dailyRevenue[i];
      expenses += f.dailyExpenses[i];
    }
    netProfit = revenue - expenses;
  } else if (period === 'total') {
    revenue = gameState.totalRevenue || 0;
    expenses = gameState.financials.totalExpenses || 0;
    if (expenses === 0 && gameState.financials.dailyExpenses.length > 0) {
      expenses = gameState.financials.dailyExpenses.reduce(function(s, e) { return s + e; }, 0);
    }
    netProfit = revenue - expenses;
  }
  return { revenue: revenue, expenses: expenses, netProfit: netProfit };
}

function getBalanceSheet() {
  if (!gameState.financials) initFinancialState();
  var cash = gameState.cash;
  var vehicleValue = 0;
  gameState.ownedVehicles.forEach(function(v) {
    var age = v.age || 0;
    var basePrice = v.purchasePrice || v.estimatedValue || 200000;
    vehicleValue += basePrice * Math.pow(0.95, age);
  });
  var energyValue = 0;
  if (gameState.energy) {
    energyValue = gameState.energy.oilStorage * gameState.energy.oilPrice +
                  gameState.energy.batteryStorage * gameState.energy.electricityPrice;
  }
  var portfolioValue = 0;
  if (gameState.stocks && gameState.stocks.portfolio) {
    gameState.stocks.portfolio.forEach(function(holding) {
      var currentPrice = getCurrentStockPrice(holding.ticker);
      portfolioValue += currentPrice * holding.shares;
    });
  }
  var assets = cash + Math.round(vehicleValue) + Math.round(energyValue) + Math.round(portfolioValue);
  var liabilities = 0;
  if (gameState.loans) {
    gameState.loans.forEach(function(loan) {
      liabilities += loan.remainingAmount;
    });
  }
  var equity = assets - liabilities;
  return { assets: Math.round(assets), liabilities: Math.round(liabilities), equity: Math.round(equity) };
}

function getCashFlow() {
  var f = gameState.financials;
  if (!f || !f.todayDetail) return { operating: 0, investing: 0, financing: 0 };
  var d = f.todayDetail;
  var rentalIncome = gameState.todayIncome - (gameState.serviceStats ? gameState.serviceStats.today.totalIncome : 0);
  var serviceIncome = gameState.serviceStats ? gameState.serviceStats.today.totalIncome : 0;
  var wages = 0;
  gameState.outlets.filter(function(o) { return o.owned; }).forEach(function(outlet) {
    wages += 2000 + outlet.level * 1000;
  });
  var maintenance = 0, energyCost = 0;
  gameState.ownedVehicles.forEach(function(v) {
    if (v.rentedUntil && v.rentedUntil >= gameState.currentDay) {
      maintenance += v.maintenanceCostPerDay;
      energyCost += v.fuelCostPerDay;
    }
  });
  gameState.ownedVehicles.filter(function(v) {
    return (!v.rentedUntil || v.rentedUntil < gameState.currentDay) && !isInTransit(v.id);
  }).forEach(function(v) {
    maintenance += v.maintenanceCostPerDay * 0.3;
    energyCost += v.fuelCostPerDay * 0.3;
  });
  var operating = rentalIncome + serviceIncome - wages - maintenance - energyCost;
  var investing = d.vehicleSales - d.vehiclePurchases + d.stockSales - d.stockPurchases;
  var financing = d.loanProceeds - d.loanRepayments - d.loanInterest;
  return { operating: Math.round(operating), investing: Math.round(investing), financing: Math.round(financing) };
}

function getCurrentStockPrice(ticker) {
  if (ticker === 'RENT') {
    return gameState.stocks.isPublic ? gameState.stocks.sharePrice : 0;
  }
  var vs = VIRTUAL_STOCKS.find(function(s) { return s.ticker === ticker; });
  if (!vs) return 0;
  if (gameState.stocks.stockHistory.length === 0) return vs.basePrice;
  var last = gameState.stocks.stockHistory[gameState.stocks.stockHistory.length - 1];
  return last[ticker] || vs.basePrice;
}

function applyLoan(amount, termDays) {
  if (!LOAN_TERMS[termDays]) return { success: false, message: '无效贷款期限' };
  if (amount <= 0) return { success: false, message: '贷款金额无效' };
  var bs = getBalanceSheet();
  var existingLoans = gameState.loans.reduce(function(s, l) { return s + l.remainingAmount; }, 0);
  var maxLoan = bs.assets * 0.5 - existingLoans;
  if (amount > maxLoan) return { success: false, message: '超出最大贷款额度' };
  var interestRate = LOAN_TERMS[termDays];
  var dailyInterest = amount * interestRate / 365;
  var loan = {
    id: 'L' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    amount: amount,
    termDays: termDays,
    interestRate: interestRate,
    dailyInterest: Math.round(dailyInterest * 100) / 100,
    remainingAmount: amount,
    startDay: gameState.currentDay,
    dueDay: gameState.currentDay + termDays
  };
  gameState.loans.push(loan);
  gameState.cash += amount;
  gameState.financials.todayDetail.loanProceeds += amount;
  addMessage('🏦 贷款 ' + formatCurrency(amount) + '，期限 ' + termDays + ' 天，年利率 ' + (interestRate * 100).toFixed(1) + '%', 'good');
  saveGame();
  return { success: true, loan: loan };
}

function repayLoan(loanId, amount) {
  var loan = gameState.loans.find(function(l) { return l.id === loanId; });
  if (!loan) return { success: false, message: '贷款不存在' };
  if (amount <= 0) return { success: false, message: '还款金额无效' };
  var repayAmount = Math.min(amount, loan.remainingAmount);
  if (gameState.cash < repayAmount) return { success: false, message: '现金不足' };
  gameState.cash -= repayAmount;
  loan.remainingAmount -= repayAmount;
  gameState.financials.todayDetail.loanRepayments += repayAmount;
  if (loan.remainingAmount <= 0) {
    gameState.loans = gameState.loans.filter(function(l) { return l.id !== loanId; });
    addMessage('🏦 贷款已还清：' + formatCurrency(loan.amount), 'good');
  } else {
    addMessage('🏦 还款 ' + formatCurrency(repayAmount) + '，剩余 ' + formatCurrency(loan.remainingAmount), 'good');
  }
  saveGame();
  return { success: true, repaid: repayAmount, remaining: loan.remainingAmount };
}

function processLoanInterest() {
  var totalInterest = 0;
  var overdueLoans = [];
  gameState.loans.forEach(function(loan) {
    var interest = loan.dailyInterest;
    loan.remainingAmount = Math.round((loan.remainingAmount + interest) * 100) / 100;
    totalInterest += interest;
    if (gameState.currentDay > loan.dueDay) {
      overdueLoans.push(loan);
    }
  });
  if (totalInterest > 0) {
    var roundedInterest = Math.round(totalInterest);
    gameState.cash -= roundedInterest;
    gameState.todayExpense += roundedInterest;
    gameState.financials.todayDetail.loanInterest += roundedInterest;
  }
  overdueLoans.forEach(function(loan) {
    addMessage('⚠️ 贷款逾期！' + formatCurrency(loan.remainingAmount) + ' 未还，每日利息 ' + formatCurrency(loan.dailyInterest), 'bad');
  });
}

function checkIPOEligibility() {
  if (gameState.stocks.isPublic) return false;
  if (gameState.cash < 50000000) return false;
  if (gameState.totalRevenue < 5000000) return false;
  if (gameState.currentDay < 730) return false;
  return true;
}

function executeIPO(sharePrice) {
  if (!checkIPOEligibility()) return { success: false, message: '不满足上市条件' };
  if (sharePrice <= 0) return { success: false, message: '股价无效' };
  gameState.stocks.isPublic = true;
  gameState.stocks.sharePrice = sharePrice;
  var snapshot = {};
  VIRTUAL_STOCKS.forEach(function(vs) {
    snapshot[vs.ticker] = getCurrentStockPrice(vs.ticker);
  });
  snapshot['RENT'] = sharePrice;
  gameState.stocks.stockHistory.push(snapshot);
  var ipoProceeds = sharePrice * gameState.stocks.publicShares;
  gameState.cash += ipoProceeds;
  gameState.todayIncome += Math.round(ipoProceeds);
  addMessage('🎉 公司上市成功！股票代码 RENT，发行价 ' + formatCurrency(sharePrice) + '，融资 ' + formatCurrency(ipoProceeds), 'good');
  saveGame();
  return { success: true, sharePrice: sharePrice, proceeds: ipoProceeds };
}

function updateStockPrices() {
  if (!gameState.stocks.isPublic) return;
  var pnl = getPnL('month');
  var monthlyEPS = pnl.netProfit / gameState.stocks.totalShares;
  var annualizedEPS = monthlyEPS * 12;
  var peRatio = 15 + Math.random() * 10;
  var fundamentalPrice = Math.max(0, annualizedEPS * peRatio);
  var randomWalk = (Math.random() - 0.5) * 0.1;
  var newPrice = gameState.stocks.sharePrice * (1 + randomWalk);
  if (fundamentalPrice > 0) {
    newPrice = newPrice * 0.7 + fundamentalPrice * 0.3;
  }
  gameState.stocks.sharePrice = Math.round(Math.max(1, newPrice) * 100) / 100;
}

function updateVirtualStockPrices() {
  var last = {};
  if (gameState.stocks.stockHistory.length > 0) {
    last = JSON.parse(JSON.stringify(gameState.stocks.stockHistory[gameState.stocks.stockHistory.length - 1]));
  }
  VIRTUAL_STOCKS.forEach(function(vs) {
    var currentPrice = last[vs.ticker] || vs.basePrice;
    currentPrice *= (1 + (Math.random() - 0.5) * 2 * vs.volatility);
    currentPrice = Math.max(1, Math.round(currentPrice * 100) / 100);
    last[vs.ticker] = currentPrice;
  });
  if (gameState.stocks.isPublic) {
    last['RENT'] = gameState.stocks.sharePrice;
  }
  gameState.stocks.stockHistory.push(last);
  if (gameState.stocks.stockHistory.length > 365) gameState.stocks.stockHistory.shift();
}

function buyStock(ticker, shares) {
  if (shares <= 0) return { success: false, message: '股数无效' };
  var price = getCurrentStockPrice(ticker);
  if (price <= 0) return { success: false, message: '股票不可交易' };
  var cost = price * shares;
  if (gameState.cash < cost) return { success: false, message: '现金不足' };
  if (ticker === 'RENT') {
    if (!gameState.stocks.isPublic) return { success: false, message: 'RENT未上市' };
    if (shares > gameState.stocks.publicShares) return { success: false, message: '流通股不足' };
    gameState.stocks.playerShares += shares;
    gameState.stocks.publicShares -= shares;
  } else {
    var vs = VIRTUAL_STOCKS.find(function(s) { return s.ticker === ticker; });
    if (!vs) return { success: false, message: '未知股票' };
    var holding = gameState.stocks.portfolio.find(function(h) { return h.ticker === ticker; });
    if (holding) {
      holding.avgCost = (holding.avgCost * holding.shares + cost) / (holding.shares + shares);
      holding.shares += shares;
    } else {
      gameState.stocks.portfolio.push({ ticker: ticker, shares: shares, avgCost: price });
    }
  }
  gameState.cash -= cost;
  gameState.financials.todayDetail.stockPurchases += cost;
  addMessage('📈 买入 ' + ticker + ' ' + shares + ' 股，单价 ' + formatCurrency(price) + '，共 ' + formatCurrency(cost), 'good');
  saveGame();
  return { success: true, ticker: ticker, shares: shares, price: price, cost: cost };
}

function sellStock(ticker, shares) {
  if (shares <= 0) return { success: false, message: '股数无效' };
  var price = getCurrentStockPrice(ticker);
  if (price <= 0) return { success: false, message: '股票不可交易' };
  var avgCost = price;
  if (ticker === 'RENT') {
    if (!gameState.stocks.isPublic) return { success: false, message: 'RENT未上市' };
    if (shares > gameState.stocks.playerShares) return { success: false, message: '持股不足' };
    gameState.stocks.playerShares -= shares;
    gameState.stocks.publicShares += shares;
  } else {
    var holding = gameState.stocks.portfolio.find(function(h) { return h.ticker === ticker; });
    if (!holding || holding.shares < shares) return { success: false, message: '持股不足' };
    avgCost = holding.avgCost;
    holding.shares -= shares;
    if (holding.shares <= 0) {
      gameState.stocks.portfolio = gameState.stocks.portfolio.filter(function(h) { return h.ticker !== ticker; });
    }
  }
  var proceeds = price * shares;
  gameState.cash += proceeds;
  gameState.financials.todayDetail.stockSales += proceeds;
  addMessage('📉 卖出 ' + ticker + ' ' + shares + ' 股，单价 ' + formatCurrency(price) + '，共 ' + formatCurrency(proceeds), 'good');
  saveGame();
  return { success: true, ticker: ticker, shares: shares, price: price, proceeds: proceeds };
}

function processDailyFinance() {
  initFinancialState();
  var wages = 0;
  gameState.outlets.filter(function(o) { return o.owned; }).forEach(function(outlet) {
    wages += 2000 + outlet.level * 1000;
  });
  gameState.todayExpense += wages;
  gameState.cash -= wages;
  gameState.financials.todayDetail.wages = wages;
  var maintenance = 0, energyCost = 0;
  gameState.ownedVehicles.forEach(function(v) {
    if (v.rentedUntil && v.rentedUntil >= gameState.currentDay) {
      maintenance += v.maintenanceCostPerDay;
      energyCost += v.fuelCostPerDay;
    }
  });
  gameState.ownedVehicles.filter(function(v) {
    return (!v.rentedUntil || v.rentedUntil < gameState.currentDay) && !isInTransit(v.id);
  }).forEach(function(v) {
    maintenance += v.maintenanceCostPerDay * 0.3;
    energyCost += v.fuelCostPerDay * 0.3;
  });
  gameState.financials.todayDetail.maintenance = Math.round(maintenance);
  gameState.financials.todayDetail.energyCost = Math.round(energyCost);
  gameState.financials.todayDetail.rentalIncome = gameState.todayIncome - (gameState.serviceStats ? gameState.serviceStats.today.totalIncome : 0);
  gameState.financials.todayDetail.serviceIncome = gameState.serviceStats ? gameState.serviceStats.today.totalIncome : 0;
  processLoanInterest();
  var preTaxProfit = gameState.todayIncome - gameState.todayExpense;
  var taxes = preTaxProfit > 0 ? Math.round(preTaxProfit * 0.05) : 0;
  if (taxes > 0) {
    gameState.todayExpense += taxes;
    gameState.cash -= taxes;
    gameState.financials.todayDetail.taxes = taxes;
  }
  recordDailyFinancials();
  updateVirtualStockPrices();
  if (gameState.stocks.isPublic && gameState.currentDay > 0 && gameState.currentDay % 90 === 0) {
    updateStockPrices();
  }
}
