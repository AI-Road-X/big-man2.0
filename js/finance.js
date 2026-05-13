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
  if (!gameState.financials) initFinancialState();
  if (!gameState.financials.todayDetail) gameState.financials.todayDetail = JSON.parse(JSON.stringify((initFinancialState() || {}).todayDetail || { loanInterest:0, loanRepayments:0, loanProceeds:0 }));
  var totalInterest = 0;
  var overdueLoans = [];
  if (!gameState.loans || gameState.loans.length === 0) return 0;
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
    gameState.financials.todayDetail.loanInterest = (gameState.financials.todayDetail.loanInterest || 0) + roundedInterest;
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

function initEnterpriseFinance() {
  if (!gameState.cashFlow) {
    gameState.cashFlow = { operatingInflow: 0, operatingOutflow: 0, investingOutflow: 0, financingInflow: 0, financingOutflow: 0 };
  }
  if (!gameState.cashFlow.dailyLog) gameState.cashFlow.dailyLog = [];
  if (!gameState.cashFlow.forecast) gameState.cashFlow.forecast = [];
  if (gameState.cashFlow.operatingInflow === undefined) gameState.cashFlow.operatingInflow = 0;
  if (gameState.cashFlow.operatingOutflow === undefined) gameState.cashFlow.operatingOutflow = 0;
  if (gameState.cashFlow.investingOutflow === undefined) gameState.cashFlow.investingOutflow = 0;
  if (gameState.cashFlow.financingInflow === undefined) gameState.cashFlow.financingInflow = 0;
  if (gameState.cashFlow.financingOutflow === undefined) gameState.cashFlow.financingOutflow = 0;
  if (!gameState.taxes) {
    gameState.taxes = { ytdProfit: 0, ytdTaxPaid: 0, vatCollected: 0, vatOwed: 0, propertyTaxOwed: 0, lastFilingDay: 0, corporateTaxRate: 0.25, vatRate: 0.06, propertyTaxRate: 0.01, quarterlyEstimates: [], taxPenalties: 0, depreciationMethod: 'straight' };
  }
  if (gameState.taxes.ytdProfit === undefined) gameState.taxes.ytdProfit = 0;
  if (gameState.taxes.ytdTaxPaid === undefined) gameState.taxes.ytdTaxPaid = 0;
  if (gameState.taxes.vatCollected === undefined) gameState.taxes.vatCollected = 0;
  if (gameState.taxes.vatOwed === undefined) gameState.taxes.vatOwed = 0;
  if (gameState.taxes.propertyTaxOwed === undefined) gameState.taxes.propertyTaxOwed = 0;
  if (gameState.taxes.lastFilingDay === undefined) gameState.taxes.lastFilingDay = 0;
  if (gameState.taxes.corporateTaxRate === undefined) gameState.taxes.corporateTaxRate = 0.25;
  if (gameState.taxes.vatRate === undefined) gameState.taxes.vatRate = 0.06;
  if (gameState.taxes.propertyTaxRate === undefined) gameState.taxes.propertyTaxRate = 0.01;
  if (!gameState.taxes.quarterlyEstimates) gameState.taxes.quarterlyEstimates = [];
  if (gameState.taxes.taxPenalties === undefined) gameState.taxes.taxPenalties = 0;
  if (!gameState.taxes.depreciationMethod) gameState.taxes.depreciationMethod = 'straight';
  if (!gameState.budget) {
    gameState.budget = { monthlyRevenueTarget: 100000, salariesCap: 50000, marketingCap: 20000, maintenanceCap: 15000, monthActuals: {}, varianceHistory: [], lastClosingDay: 0 };
  }
  if (gameState.budget.monthlyRevenueTarget === undefined) gameState.budget.monthlyRevenueTarget = 100000;
  if (gameState.budget.salariesCap === undefined) gameState.budget.salariesCap = 50000;
  if (gameState.budget.marketingCap === undefined) gameState.budget.marketingCap = 20000;
  if (gameState.budget.maintenanceCap === undefined) gameState.budget.maintenanceCap = 15000;
  if (!gameState.budget.monthActuals) gameState.budget.monthActuals = {};
  if (!gameState.budget.varianceHistory) gameState.budget.varianceHistory = [];
  if (gameState.budget.lastClosingDay === undefined) gameState.budget.lastClosingDay = 0;
  if (!gameState.kpiCache) gameState.kpiCache = {};
  gameState.ownedVehicles.forEach(function(v) {
    if (!v.depreciation) {
      var cost = v.purchasePrice || v.estimatedValue || 200000;
      v.depreciation = { method: gameState.taxes.depreciationMethod || 'straight', usefulLife: 5, salvageRate: 0.15, accumulated: 0, monthlyExpense: 0, bookValue: cost, originalCost: cost, purchaseDay: v.purchaseDay || gameState.currentDay };
    }
    if (v.depreciation.originalCost === undefined) v.depreciation.originalCost = v.purchasePrice || v.estimatedValue || 200000;
    if (v.depreciation.usefulLife === undefined) v.depreciation.usefulLife = 5;
    if (v.depreciation.salvageRate === undefined) v.depreciation.salvageRate = 0.15;
    if (v.depreciation.accumulated === undefined) v.depreciation.accumulated = 0;
    if (v.depreciation.bookValue === undefined) v.depreciation.bookValue = v.depreciation.originalCost;
    if (v.depreciation.monthlyExpense === undefined) v.depreciation.monthlyExpense = 0;
    if (v.depreciation.method === undefined) v.depreciation.method = gameState.taxes.depreciationMethod || 'straight';
    if (v.depreciation.purchaseDay === undefined) v.depreciation.purchaseDay = v.purchaseDay || gameState.currentDay;
  });
}

function calculateCashFlow() {
  initEnterpriseFinance();
  var cf = gameState.cashFlow;
  var f = gameState.financials;
  var td = f.todayDetail || {};
  cf.operatingInflow = (td.rentalIncome || 0) + (td.serviceIncome || 0) + (td.adBonusIncome || 0);
  cf.operatingOutflow = (td.wages || 0) + (td.fuelCost || 0) + (td.maintenance || 0) + (td.energyCost || 0) + (td.facilityMaint || 0) + (td.advertisingCost || 0) + (td.loanInterest || 0) + (td.taxes || 0);
  cf.investingOutflow = (td.vehiclePurchases || 0) + (td.stockPurchases || 0);
  cf.financingInflow = td.loanProceeds || 0;
  cf.financingOutflow = td.loanRepayments || 0;
  var dailyEntry = {
    day: gameState.currentDay,
    operatingInflow: cf.operatingInflow,
    operatingOutflow: cf.operatingOutflow,
    investingInflow: (td.vehicleSales || 0) + (td.stockSales || 0),
    investingOutflow: cf.investingOutflow,
    financingInflow: cf.financingInflow,
    financingOutflow: cf.financingOutflow,
    netOperating: cf.operatingInflow - cf.operatingOutflow,
    netInvesting: ((td.vehicleSales || 0) + (td.stockSales || 0)) - cf.investingOutflow,
    netFinancing: cf.financingInflow - cf.financingOutflow,
    netChange: (cf.operatingInflow - cf.operatingOutflow) + ((td.vehicleSales || 0) + (td.stockSales || 0) - cf.investingOutflow) + (cf.financingInflow - cf.financingOutflow)
  };
  cf.dailyLog.push(dailyEntry);
  if (cf.dailyLog.length > 90) cf.dailyLog.shift();
  return dailyEntry;
}

function getCashRunway() {
  initEnterpriseFinance();
  var cash = gameState.cash || 0;
  if (cash <= 0) return 0;
  var cf = gameState.cashFlow;
  var dailyLog = cf.dailyLog || [];
  if (dailyLog.length < 3) return cash > 0 ? 999 : 0;
  var recentBurn = 0;
  var lookback = Math.min(7, dailyLog.length);
  for (var i = dailyLog.length - lookback; i < dailyLog.length; i++) {
    recentBurn += dailyLog[i].netChange || 0;
  }
  var avgDailyNet = recentBurn / lookback;
  if (avgDailyNet >= 0) return 999;
  return Math.max(0, Math.floor(cash / Math.abs(avgDailyNet)));
}

function getWorkingCapital() {
  initEnterpriseFinance();
  var cash = gameState.cash || 0;
  var accountsReceivable = 0;
  var prepaidExpenses = 0;
  var currentAssets = cash + accountsReceivable + prepaidExpenses;
  var accountsPayable = 0;
  var taxesPayable = (gameState.taxes ? (gameState.taxes.vatOwed || 0) + (gameState.taxes.propertyTaxOwed || 0) : 0);
  var shortTermLoans = 0;
  if (gameState.loans) {
    gameState.loans.forEach(function(l) { shortTermLoans += l.remainingAmount || 0; });
  }
  var currentLiabilities = accountsPayable + taxesPayable + shortTermLoans;
  return { currentAssets: Math.round(currentAssets), currentLiabilities: Math.round(currentLiabilities), workingCapital: Math.round(currentAssets - currentLiabilities) };
}

function generateCashForecast(days) {
  days = days || 7;
  initEnterpriseFinance();
  var forecast = [];
  var projectedCash = gameState.cash || 0;
  var dailyLog = gameState.cashFlow.dailyLog || [];
  var avgOpInflow = 0, avgOpOutflow = 0, avgInvOutflow = 0, avgFinInflow = 0, avgFinOutflow = 0;
  if (dailyLog.length > 0) {
    var sampleSize = Math.min(14, dailyLog.length);
    for (var i = dailyLog.length - sampleSize; i < dailyLog.length; i++) {
      avgOpInflow += dailyLog[i].operatingInflow || 0;
      avgOpOutflow += dailyLog[i].operatingOutflow || 0;
      avgInvOutflow += dailyLog[i].investingOutflow || 0;
      avgFinInflow += dailyLog[i].financingInflow || 0;
      avgFinOutflow += dailyLog[i].financingOutflow || 0;
    }
    avgOpInflow /= sampleSize; avgOpOutflow /= sampleSize; avgInvOutflow /= sampleSize;
    avgFinInflow /= sampleSize; avgFinOutflow /= sampleSize;
  }
  var rentalEndingSoon = [];
  if (gameState.ownedVehicles) {
    gameState.ownedVehicles.forEach(function(v) {
      if (v.rentedUntil && v.rentedUntil > gameState.currentDay) {
        rentalEndingSoon.push({ endDay: v.rentedUntil, dailyRate: v.dailyRate || 300 });
      }
    });
  }
  for (var d = 1; d <= days; d++) {
    var futureDay = gameState.currentDay + d;
    var dayOpInflow = avgOpInflow;
    var dayInvInflow = 0;
    rentalEndingSoon.forEach(function(r) {
      if (r.endDay <= futureDay && r.endDay > gameState.currentDay) {
        dayInvInflow += r.dailyRate * 1;
      }
    });
    var randomFactor = 0.85 + Math.random() * 0.3;
    dayOpInflow *= randomFactor;
    var netChange = dayOpInflow - avgOpOutflow - avgInvOutflow * randomFactor + dayInvInflow + avgFinInflow * (Math.random() > 0.8 ? 1 : 0) - avgFinOutflow * (Math.random() > 0.9 ? 1 : 0);
    projectedCash += netChange;
    forecast.push({
      day: futureDay,
      projectedBalance: Math.round(projectedCash),
      opInflow: Math.round(dayOpInflow),
      opOutflow: Math.round(avgOpOutflow),
      netChange: Math.round(netChange)
    });
  }
  gameState.cashFlow.forecast = forecast;
  return forecast;
}

function checkCashRunwayAlert() {
  var runway = getCashRunway();
  if (runway < 7 && runway > 0) {
    addMessage('🚨 现金流预警！当前现金仅够维持 ' + runway + ' 天（<7天临界线）', 'bad');
  } else if (runway < 30 && runway >= 7) {
    addMessage('⚠️ 现金流提醒：当前现金可维持 ' + runway + ' 天（<30天警戒线）', 'warn');
  } else if (runway === 0) {
    addMessage('💀 现金耗尽！公司已资不抵债', 'bad');
  }
  return runway;
}

function processTaxes() {
  initEnterpriseFinance();
  var tax = gameState.taxes;
  var f = gameState.financials;
  var td = f.todayDetail || {};
  var preTaxProfit = (gameState.todayIncome || 0) - (gameState.todayExpense || 0) - (td.taxes || 0);
  if (preTaxProfit > 0) {
    var vatAmount = Math.round((td.rentalIncome || 0) * tax.vatRate);
    tax.vatCollected += vatAmount;
    tax.vatOwed += vatAmount;
  }
  var totalVehicleValue = 0;
  gameState.ownedVehicles.forEach(function(v) {
    totalVehicleValue += v.depreciation ? v.depreciation.bookValue : (v.purchasePrice || v.estimatedValue || 200000);
  });
  var monthlyPropertyTax = Math.round(totalVehicleValue * tax.propertyTaxRate / 12);
  tax.propertyTaxOwed += monthlyPropertyTax;
  tax.ytdProfit += preTaxProfit;
  var quarterNum = Math.ceil(gameState.currentDay / 90);
  if (tax.quarterlyEstimates.length < quarterNum) {
    var estimatedQuarterlyTax = Math.round(Math.max(0, tax.ytdProfit * tax.corporateTaxRate * 0.25));
    tax.quarterlyEstimates.push({ quarter: quarterNum, estimated: estimatedQuarterlyTax, paid: 0, dueDay: quarterNum * 90 + 15, status: 'pending' });
  }
  var currentQuarter = tax.quarterlyEstimates[tax.quarterlyEstimates.length - 1];
  if (currentQuarter && currentQuarter.status === 'pending' && gameState.currentDay >= currentQuarter.dueDay) {
    var lateDays = gameState.currentDay - currentQuarter.dueDay;
    if (lateDays > 0) {
      var penaltyRate = 0.0005 * lateDays;
      tax.taxPenalties += Math.round(currentQuarter.estimated * penaltyRate);
      addMessage('⚠️ 税务逾期！第' + currentQuarter.quarter + '季度税款已逾期 ' + lateDays + ' 天，产生滞纳金', 'bad');
    }
  }
  if (gameState.currentDay % 30 === 0) {
    var totalOwed = (tax.vatOwed || 0) + (tax.propertyTaxOwed || 0) + (tax.taxPenalties || 0);
    if (totalOwed > 0) {
      addMessage('📋 月度税务汇总：增值税 ' + formatCurrency(tax.vatOwed) + '，财产税 ' + formatCurrency(tax.propertyTaxOwed) + '，滞纳金 ' + formatCurrency(tax.taxPenalties), 'warn');
    }
  }
}

function payTaxes() {
  initEnterpriseFinance();
  var tax = gameState.taxes;
  var totalPayable = (tax.vatOwed || 0) + (tax.propertyTaxOwed || 0) + (tax.taxPenalties || 0);
  var currentQuarter = tax.quarterlyEstimates[tax.quarterlyEstimates.length - 1];
  if (currentQuarter && currentQuarter.status === 'pending') {
    totalPayable += (currentQuarter.estimated - currentQuarter.paid);
  }
  if (totalPayable <= 0) return { success: false, message: '暂无应缴税款' };
  if (gameState.cash < totalPayable) return { success: false, message: '现金不足，需要 ' + formatCurrency(totalPayable) };
  gameState.cash -= totalPayable;
  gameState.todayExpense += totalPayable;
  tax.vatOwed = 0;
  tax.propertyTaxOwed = 0;
  var penaltyPaid = tax.taxPenalties || 0;
  tax.taxPenalties = 0;
  tax.ytdTaxPaid += totalPayable;
  if (currentQuarter && currentQuarter.status === 'pending') {
    currentQuarter.paid += (currentQuarter.estimated - currentQuarter.paid);
    currentQuarter.status = 'paid';
    tax.lastFilingDay = gameState.currentDay;
  }
  if (gameState.financials.todayDetail) gameState.financials.todayDetail.taxes = (gameState.financials.todayDetail.taxes || 0) + totalPayable;
  addMessage('✅ 缴税完成：共支付 ' + formatCurrency(totalPayable) + '（含滞纳金 ' + formatCurrency(penaltyPaid) + '）', 'good');
  saveGame();
  return { success: true, paid: totalPayable, breakdown: { vat: tax.vatOwed, propertyTax: tax.propertyTaxOwed, penalties: penaltyPaid, corporate: currentQuarter ? currentQuarter.estimated - currentQuarter.paid : 0 } };
}

function getTaxSummary() {
  initEnterpriseFinance();
  var tax = gameState.taxes;
  var totalOwed = (tax.vatOwed || 0) + (tax.propertyTaxOwed || 0) + (tax.taxPenalties || 0);
  var nextFiling = null;
  var q = tax.quarterlyEstimates[tax.quarterlyEstimates.length - 1];
  if (q && q.status === 'pending') {
    nextFiling = { quarter: q.quarter, dueDay: q.dueDay, amount: q.estimated - q.paid, daysLeft: q.dueDay - gameState.currentDay };
  }
  return {
    ytdProfit: tax.ytdProfit,
    ytdTaxPaid: tax.ytdTaxPaid,
    vatCollected: tax.vatCollected,
    vatOwed: tax.vatOwed,
    propertyTaxOwed: tax.propertyTaxOwed,
    totalOwed: totalOwed,
    taxPenalties: tax.taxPenalties,
    corporateTaxRate: tax.corporateTaxRate,
    vatRate: tax.vatRate,
    propertyTaxRate: tax.propertyTaxRate,
    depreciationMethod: tax.depreciationMethod,
    nextFiling: nextFiling,
    quartersFiled: tax.quarterlyEstimates.filter(function(q){ return q.status === 'paid'; }).length
  };
}

function optimizeDepreciationMethod(method) {
  if (method !== 'straight' && method !== 'accelerated') return { success: false, message: '无效的折旧方法' };
  initEnterpriseFinance();
  gameState.taxes.depreciationMethod = method;
  gameState.ownedVehicles.forEach(function(v) {
    if (v.depreciation) v.depreciation.method = method;
  });
  addMessage('📊 折旧方法已切换为：' + (method === 'straight' ? '直线法（均匀折旧）' : '加速折旧法（前两年双倍余额递减）'), 'good');
  saveGame();
  return { success: true, method: method };
}

function processVehicleDepreciation(v) {
  if (!v || !v.depreciation) return 0;
  var dep = v.depreciation;
  var cost = dep.originalCost || v.purchasePrice || v.estimatedValue || 200000;
  var salvageValue = cost * dep.salvageRate;
  var monthlyDepreciation = 0;
  var monthsOwned = Math.floor((gameState.currentDay - (dep.purchaseDay || v.purchaseDay || gameState.currentDay)) / 30);
  if (dep.method === 'accelerated' && monthsOwned < 24) {
    var doubleRate = 2 / (dep.usefulLife * 12);
    var beginningBookValue = Math.max(salvageValue, dep.bookValue || cost);
    monthlyDepreciation = Math.min(beginningBookValue * doubleRate, (cost - salvageValue) / (dep.usefulLife * 12) * 2);
    if (dep.bookValue - monthlyDepreciation < salvageValue) {
      monthlyDepreciation = Math.max(0, dep.bookValue - salvageValue);
    }
  } else {
    monthlyDepreciation = (cost - salvageValue) / (dep.usefulLife * 12);
    if (dep.bookValue - monthlyDepreciation < salvageValue) {
      monthlyDepreciation = Math.max(0, dep.bookValue - salvageValue);
    }
  }
  dep.monthlyExpense = Math.round(monthlyDepreciation);
  dep.accumulated = Math.round(dep.accumulated + dep.monthlyExpense);
  dep.bookValue = Math.max(salvageValue, Math.round(dep.bookValue - dep.monthlyExpense));
  return dep.monthlyExpense;
}

function getFleetDepreciationReport() {
  initEnterpriseFinance();
  var report = { totalOriginalCost: 0, totalAccumulated: 0, totalBookValue: 0, totalMonthlyExpense: 0, vehicleDetails: [] };
  gameState.ownedVehicles.forEach(function(v) {
    if (!v.depreciation) processVehicleDepreciation(v);
    var dep = v.depreciation;
    report.totalOriginalCost += dep.originalCost || 0;
    report.totalAccumulated += dep.accumulated || 0;
    report.totalBookValue += dep.bookValue || 0;
    report.totalMonthlyExpense += dep.monthlyExpense || 0;
    report.vehicleDetails.push({
      id: v.id,
      name: (v.brand || '') + ' ' + (v.model || ''),
      licensePlate: v.licensePlate,
      originalCost: dep.originalCost,
      accumulated: dep.accumulated,
      bookValue: dep.bookValue,
      monthlyExpense: dep.monthlyExpense,
      method: dep.method,
      usefulLife: dep.usefulLife,
      ageMonths: Math.floor((gameState.currentDay - (dep.purchaseDay || gameState.currentDay)) / 30)
    });
  });
  report.totalOriginalCost = Math.round(report.totalOriginalCost);
  report.totalAccumulated = Math.round(report.totalAccumulated);
  report.totalBookValue = Math.round(report.totalBookValue);
  report.totalMonthlyExpense = Math.round(report.totalMonthlyExpense);
  return report;
}

function processAllDepreciation() {
  initEnterpriseFinance();
  var totalDepreciation = 0;
  gameState.ownedVehicles.forEach(function(v) {
    totalDepreciation += processVehicleDepreciation(v);
  });
  if (totalDepreciation > 0) {
    if (gameState.financials.todayDetail) gameState.financials.todayDetail.depreciationExpense = (gameState.financials.todayDetail.depreciationExpense || 0) + totalDepreciation;
  }
  return totalDepreciation;
}

function getEnhancedBalanceSheet() {
  initEnterpriseFinance();
  var cash = gameState.cash || 0;
  var accountsReceivable = 0;
  if (gameState.pendingOrders) {
    gameState.pendingOrders.forEach(function(o) { accountsReceivable += o.netIncome || o.totalIncome || 0; });
  }
  var prepaidExpenses = 0;
  var currentAssets = cash + accountsReceivable + prepaidExpenses;
  var oilVal = 0, elecVal = 0;
  if (gameState.energy) {
    oilVal = Math.round((gameState.energy.oilStorage || 0) * (gameState.energy.oilPrice || 0));
    elecVal = Math.round((gameState.energy.batteryStorage || 0) * (gameState.energy.electricityPrice || 0));
  }
  currentAssets += oilVal + elecVal;
  var fleetReport = getFleetDepreciationReport();
  var fleetBookValue = fleetReport.totalBookValue;
  var outletValue = 0;
  (gameState.outlets || []).filter(function(o) { return o.owned; }).forEach(function(o) {
    outletValue += [0, 500000, 1200000, 3000000, 8000000, 20000000][o.level || 1] || 0;
  });
  var facilityValue = 0;
  (gameState.outlets || []).filter(function(o) { return o.owned; }).forEach(function(outlet) {
    var os = typeof getOutletState === 'function' ? getOutletState(outlet.id) : outlet;
    if (os && os.facilities) {
      os.facilities.forEach(function(fid) {
        var cfg = typeof getFacilityConfig === 'function' ? getFacilityConfig(fid) : null;
        if (cfg) facilityValue += cfg.cost;
      });
    }
  });
  var portfolioValue = 0;
  if (gameState.stocks && gameState.stocks.portfolio) {
    gameState.stocks.portfolio.forEach(function(h) {
      var price = typeof getCurrentStockPrice === 'function' ? getCurrentStockPrice(h.ticker) : 0;
      portfolioValue += price * h.shares;
    });
  }
  var nonCurrentAssets = fleetBookValue + outletValue + facilityValue + portfolioValue;
  var totalAssets = currentAssets + nonCurrentAssets;
  var shortTermLoans = 0;
  if (gameState.loans) gameState.loans.forEach(function(l) { shortTermLoans += l.remainingAmount || 0; });
  var taxesPayable = (gameState.taxes ? (gameState.taxes.vatOwed || 0) + (gameState.taxes.propertyTaxOwed || 0) + (gameState.taxes.taxPenalties || 0) : 0);
  var accountsPayable = 0;
  var currentLiabilities = shortTermLoans + taxesPayable + accountsPayable;
  var totalLiabilities = currentLiabilities;
  var initialCapital = 1000000;
  var totalRevenue = gameState.totalRevenue || 0;
  var totalExpenses = (gameState.financials && gameState.financials.totalExpenses) || 0;
  if (totalExpenses === 0 && gameState.financials && gameState.financials.dailyExpenses && gameState.financials.dailyExpenses.length > 0) {
    totalExpenses = gameState.financials.dailyExpenses.reduce(function(s, e) { return s + e; }, 0);
  }
  var retainedEarnings = totalRevenue - totalExpenses - (gameState.taxes ? gameState.taxes.ytdTaxPaid : 0);
  var totalEquity = totalAssets - totalLiabilities;
  var goodwill = totalEquity - initialCapital - retainedEarnings;
  var currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 999;
  var debtToEquity = totalEquity > 0 ? totalLiabilities / totalEquity : 0;
  var roa = totalAssets > 0 ? (retainedEarnings / totalAssets) * 100 : 0;
  var roe = totalEquity > 0 ? (retainedEarnings / totalEquity) * 100 : 0;
  return {
    assets: {
      current: { cash: cash, accountsReceivable: accountsReceivable, prepaidExpenses: prepaidExpenses, inventory: oilVal + elecVal, total: Math.round(currentAssets) },
      nonCurrent: { fleetAtBookValue: fleetBookValue, facilities: facilityValue, outlets: outletValue, investments: portfolioValue, goodwill: Math.round(goodwill), total: Math.round(nonCurrentAssets) },
      total: Math.round(totalAssets)
    },
    liabilities: {
      current: { shortTermLoans: shortTermLoans, taxesPayable: taxesPayable, accountsPayable: accountsPayable, total: Math.round(currentLiabilities) },
      total: Math.round(totalLiabilities)
    },
    equity: {
      paidInCapital: initialCapital,
      retainedEarnings: Math.round(retainedEarnings),
      total: Math.round(totalEquity)
    },
    ratios: {
      currentRatio: Math.round(currentRatio * 100) / 100,
      debtToEquity: Math.round(debtToEquity * 100) / 100,
      roa: Math.round(roa * 100) / 100,
      roe: Math.round(roe * 100) / 100
    }
  };
}

function getEnhancedIncomeStatement(period) {
  initEnterpriseFinance();
  period = period || 'month';
  var detail = _aggDetail(period);
  var fleetReport = getFleetDepreciationReport();
  var depreciationExpense = period === 'today' ? fleetReport.totalMonthlyExpense / 30 : fleetReport.totalMonthlyExpense;
  var revenue = detail.rentalIncome + detail.serviceIncome + detail.adBonusIncome + detail.vehicleSales + detail.investmentIncome;
  var cogs = depreciationExpense + detail.fuelCost + detail.maintenanceCost;
  var grossProfit = revenue - cogs;
  var operatingExpenses = detail.wages + detail.energyCost + detail.facilityMaint + detail.advertisingCost;
  var operatingIncome = grossProfit - operatingExpenses;
  var otherExpenses = detail.loanInterest + detail.taxes;
  var netIncome = operatingIncome - otherExpenses;
  var ebitda = operatingIncome + depreciationExpense;
  var grossMargin = revenue > 0 ? Math.round(grossProfit / revenue * 10000) / 100 : 0;
  var operatingMargin = revenue > 0 ? Math.round(operatingIncome / revenue * 10000) / 100 : 0;
  var netMargin = revenue > 0 ? Math.round(netIncome / revenue * 10000) / 100 : 0;
  return {
    revenue: { rentalIncome: detail.rentalIncome, serviceIncome: detail.serviceIncome, adBonusIncome: detail.adBonusIncome, vehicleSales: detail.vehicleSales, investmentIncome: detail.investmentIncome, total: Math.round(revenue) },
    cogs: { depreciation: Math.round(depreciationExpense), fuelCost: detail.fuelCost, maintenanceCost: detail.maintenanceCost, total: Math.round(cogs) },
    grossProfit: Math.round(grossProfit),
    operatingExpenses: { wages: detail.wages, energyCost: detail.energyCost, facilityMaint: detail.facilityMaint, advertisingCost: detail.advertisingCost, total: Math.round(operatingExpenses) },
    operatingIncome: Math.round(operatingIncome),
    otherExpenses: { interest: detail.loanInterest, taxes: detail.taxes, total: Math.round(otherExpenses) },
    netIncome: Math.round(netIncome),
    ebitda: Math.round(ebitda),
    margins: { gross: grossMargin, operating: operatingMargin, net: netMargin }
  };
}

function getCashFlowStatement(period) {
  initEnterpriseFinance();
  var detail = _aggDetail(period);
  var is = getEnhancedIncomeStatement(period);
  var fleetReport = getFleetDepreciationReport();
  var depreciation = is.cogs.depreciation;
  var operatingNetCash = detail.rentalIncome + detail.serviceIncome - detail.wages - detail.fuelCost - detail.maintenanceCost - detail.energyCost - detail.advertisingCost - detail.facilityMaint - detail.loanInterest - detail.taxes;
  var investingNetCash = detail.vehicleSales - detail.vehiclePurchases + detail.stockSales - detail.stockPurchases;
  var financingNetCash = detail.loanProceeds - detail.loanRepayments;
  var netCashChange = operatingNetCash + investingNetCash + financingNetCash;
  return {
    operating: {
      netIncome: is.netIncome,
      addBackDepreciation: depreciation,
      rentalIncomeReceived: detail.rentalIncome,
      serviceIncomeReceived: detail.serviceIncome,
      wagesPaid: -detail.wages,
      fuelCost: -detail.fuelCost,
      maintenanceCost: -detail.maintenanceCost,
      energyCost: -detail.energyCost,
      advertisingCost: -detail.advertisingCost,
      interestPaid: -detail.loanInterest,
      taxesPaid: -detail.taxes,
      netCash: Math.round(operatingNetCash)
    },
    investing: {
      vehiclePurchases: -detail.vehiclePurchases,
      vehicleSales: detail.vehicleSales,
      stockPurchases: -detail.stockPurchases,
      stockSales: detail.stockSales,
      netCash: Math.round(investingNetCash)
    },
    financing: {
      loanProceeds: detail.loanProceeds,
      loanRepayments: -detail.loanRepayments,
      netCash: Math.round(financingNetCash)
    },
    netChange: Math.round(netCashChange)
  };
}

function getKPIDashboard() {
  initEnterpriseFinance();
  var f = gameState.financials;
  var dr = f.dailyRevenue || [];
  var dp = f.dailyProfit || [];
  var thisMonthRevenue = 0, lastMonthRevenue = 0, thisQuarterRevenue = 0, lastQuarterRevenue = 0;
  var monthLen = Math.min(dr.length, 30);
  for (var i = dr.length - monthLen; i < dr.length; i++) thisMonthRevenue += dr[i] || 0;
  var lastMonthStart = dr.length - 60;
  var lastMonthEnd = dr.length - 30;
  if (lastMonthEnd > 0) {
    for (var j = Math.max(0, lastMonthStart); j < lastMonthEnd; j++) lastMonthRevenue += dr[j] || 0;
  }
  var qLen = Math.min(dr.length, 90);
  for (var k = dr.length - qLen; k < dr.length; k++) thisQuarterRevenue += dr[k] || 0;
  var lastQStart = dr.length - 180;
  var lastQEnd = dr.length - 90;
  if (lastQEnd > 0) {
    for (var m = Math.max(0, lastQStart); m < lastQEnd; m++) lastQuarterRevenue += dr[m] || 0;
  }
  var momGrowth = lastMonthRevenue > 0 ? Math.round((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 10000) / 100 : 0;
  var qoqGrowth = lastQuarterRevenue > 0 ? Math.round((thisQuarterRevenue - lastQuarterRevenue) / lastQuarterRevenue * 10000) / 100 : 0;
  var incomeStmt = getEnhancedIncomeStatement('month');
  var bs = getEnhancedBalanceSheet();
  var totalAssets = bs.assets.total || 1;
  var assetTurnover = totalAssets > 0 ? Math.round(thisQuarterRevenue / totalAssets * 100 * 4) / 100 : 0;
  var totalFleet = gameState.ownedVehicles.length || 1;
  var rentedCount = (gameState.ownedVehicles.filter(function(v) { return v.rentedUntil && v.rentedUntil >= gameState.currentDay; })).length;
  var fleetUtilization = totalFleet > 0 ? Math.round(rentedCount / totalFleet * 10000) / 100 : 0;
  var marketingSpend = (_aggDetail('month').advertisingCost || 0);
  var newCustomers = gameState.customerLoyalty ? (gameState.customerLoyalty.totalNewCustomers || 0) : 0;
  var cac = newCustomers > 0 ? Math.round(marketingSpend / newCustomers) : 0;
  var avgRetention = gameState.customerLoyalty ? (gameState.customerLoyalty.returnRate || 0) : 0;
  var avgRevenuePerCustomer = thisMonthRevenue > 0 && newCustomers > 0 ? Math.round(thisMonthRevenue / newCustomers) : 0;
  var retentionMonths = Math.max(1, Math.round(avgRetention / 100 * 12));
  var clv = avgRevenuePerCustomer * retentionMonths;
  var fixedCosts = (_aggDetail('month').wages || 0) + (_aggDetail('month').facilityMaint || 0) + (_aggDetail('month').energyCost || 0);
  var contributionPerVehicleDay = incomeStmt.revenue.total > 0 ? Math.round((incomeStmt.revenue.total - incomeStmt.cogs.fuelCost - incomeStmt.cogs.maintenanceCost) / (totalFleet * 30)) : 0;
  var breakEvenDays = contributionPerVehicleDay > 0 ? Math.ceil(fixedCosts / contributionPerVehicleDay) : 999;
  return {
    revenueGrowth: { mom: momGrowth, qoq: qoqGrowth, thisMonth: thisMonthRevenue, lastMonth: lastMonthRevenue, thisQuarter: thisQuarterRevenue, lastQuarter: lastQuarterRevenue },
    profitMargins: { gross: incomeStmt.margins.gross, operating: incomeStmt.margins.operating, net: incomeStmt.margins.net },
    assetTurnover: assetTurnover,
    fleetUtilization: fleetUtilization,
    customerAcquisitionCost: cac,
    customerLifetimeValue: clv,
    breakEvenAnalysis: { fixedCosts: fixedCosts, contributionMargin: contributionPerVehicleDay, breakEvenDays: breakEvenDays },
    ebitda: incomeStmt.ebitda,
    balanceRatios: bs.ratios,
    cashRunway: getCashRunway(),
    workingCapital: getWorkingCapital()
  };
}

function setBudget(params) {
  initEnterpriseFinance();
  var b = gameState.budget;
  if (params.monthlyRevenueTarget !== undefined) b.monthlyRevenueTarget = params.monthlyRevenueTarget;
  if (params.salariesCap !== undefined) b.salariesCap = params.salariesCap;
  if (params.marketingCap !== undefined) b.marketingCap = params.marketingCap;
  if (params.maintenanceCap !== undefined) b.maintenanceCap = params.maintenanceCap;
  saveGame();
  return { success: true, budget: b };
}

function getBudgetVariance() {
  initEnterpriseFinance();
  var b = gameState.budget;
  var actual = _aggDetail('month');
  var actualRevenue = actual.rentalIncome + actual.serviceIncome + actual.adBonusIncome + actual.vehicleSales + actual.investmentIncome;
  var revVariance = actualRevenue - b.monthlyRevenueTarget;
  var revVariancePct = b.monthlyRevenueTarget > 0 ? Math.round(revVariance / b.monthlyRevenueTarget * 10000) / 100 : 0;
  var salaryVariance = actual.wages - b.salariesCap;
  var marketingVariance = actual.advertisingCost - b.marketingCap;
  var maintenanceVariance = actual.maintenanceCost - b.maintenanceCap;
  var result = {
    revenue: { target: b.monthlyRevenueTarget, actual: Math.round(actualRevenue), variance: Math.round(revVariance), variancePct: revVariancePct },
    salaries: { target: b.salariesCap, actual: actual.wages, variance: Math.round(salaryVariance) },
    marketing: { target: b.marketingCap, actual: actual.advertisingCost, variance: Math.round(marketingVariance) },
    maintenance: { target: b.maintenanceCap, actual: actual.maintenanceCost, variance: Math.round(maintenanceVariance) },
    overallStatus: revVariance >= 0 ? 'favorable' : 'unfavorable'
  };
  return result;
}

function runMonthEndClosing() {
  initEnterpriseFinance();
  var b = gameState.budget;
  if (b.lastClosingDay >= gameState.currentDay - 30 && b.lastClosingDay > 0) {
    return { success: false, message: '本月已结账' };
  }
  var variance = getBudgetVariance();
  var closingReport = {
    closingDay: gameState.currentDay,
    period: '第' + Math.ceil(gameState.currentDay / 30) + '月',
    budgetVariance: variance,
    incomeStatement: getEnhancedIncomeStatement('month'),
    balanceSheet: getEnhancedBalanceSheet(),
    cashFlow: getCashFlowStatement('month'),
    kpis: getKPIDashboard()
  };
  b.varianceHistory.push(closingReport);
  if (b.varianceHistory.length > 24) b.varianceHistory.shift();
  b.lastClosingDay = gameState.currentDay;
  var totalDepreciation = processAllDepreciation();
  processTaxes();
  checkCashRunwayAlert();
  saveGame();
  addMessage('📊 月度结账完成！净利润 ' + formatCurrency(closingReport.incomeStatement.netIncome), 'good');
  return { success: true, report: closingReport };
}
