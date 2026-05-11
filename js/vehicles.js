/**
 * 车辆数据库模块 - 租车公司模拟游戏
 * 包含2023-2026年常见车型
 *
 * API替换指引：
 * 将 vehicleDatabase 替换为 API 调用结果即可
 * 参见底部 fetchFromCarAPI() 函数模板
 */

const FUEL_TYPES = {
  GASOLINE: '汽油', DIESEL: '柴油', ELECTRIC: '纯电',
  PLUGIN_HYBRID: '插电混动', RANGE_EXTENDER: '增程', HYBRID: '混动'
};

const VEHICLE_TYPES = {
  SEDAN: '轿车', SUV: 'SUV', SPORTS: '跑车', MPV: 'MPV',
  COMPACT: '紧凑型', LUXURY: '豪华车', SUPERCAR: '超跑',
  WAGON: '旅行车', PICKUP: '皮卡'
};

const MARKET_TYPES = { LOCAL_DEALER: 'local', USED_CAR: 'used', OVERSEAS: 'overseas' };

const CONDITION_LEVELS = { EXCELLENT: '优秀', GOOD: '良好', AVERAGE: '一般', POOR: '较差' };

const vehicleDatabase = [
  { id:'LD001',brand:'丰田',model:'凯美瑞 2024款 2.5L',type:VEHICLE_TYPES.SEDAN,year:2024,dailyRate:350,fuelCostPerDay:80,maintenanceCostPerDay:25,popularity:9,residualValue:0.80,age:0,fuelType:FUEL_TYPES.HYBRID,fuelConsumption:4.5,mileage:50,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:220000,estimatedValue:220000 },
  { id:'LD002',brand:'丰田',model:'RAV4荣放 2024款',type:VEHICLE_TYPES.SUV,year:2024,dailyRate:380,fuelCostPerDay:85,maintenanceCostPerDay:28,popularity:9,residualValue:0.78,age:0,fuelType:FUEL_TYPES.HYBRID,fuelConsumption:5.0,mileage:80,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:250000,estimatedValue:250000 },
  { id:'LD003',brand:'丰田',model:'汉兰达 2024款',type:VEHICLE_TYPES.SUV,year:2024,dailyRate:480,fuelCostPerDay:100,maintenanceCostPerDay:35,popularity:8,residualValue:0.82,age:0,fuelType:FUEL_TYPES.HYBRID,fuelConsumption:5.3,mileage:60,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:320000,estimatedValue:320000 },
  { id:'LD004',brand:'特斯拉',model:'Model 3 后驱版 2024款',type:VEHICLE_TYPES.SEDAN,year:2024,dailyRate:450,fuelCostPerDay:40,maintenanceCostPerDay:20,popularity:10,residualValue:0.75,age:0,fuelType:FUEL_TYPES.ELECTRIC,fuelConsumption:12,mileage:100,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:280000,estimatedValue:280000 },
  { id:'LD005',brand:'特斯拉',model:'Model Y 长续航 2024款',type:VEHICLE_TYPES.SUV,year:2024,dailyRate:520,fuelCostPerDay:45,maintenanceCostPerDay:22,popularity:10,residualValue:0.73,age:0,fuelType:FUEL_TYPES.ELECTRIC,fuelConsumption:13,mileage:90,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:320000,estimatedValue:320000 },
  { id:'LD006',brand:'本田',model:'CR-V 2024款 1.5T',type:VEHICLE_TYPES.SUV,year:2024,dailyRate:400,fuelCostPerDay:90,maintenanceCostPerDay:30,popularity:8,residualValue:0.78,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:7.3,mileage:80,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:240000,estimatedValue:240000 },
  { id:'LD007',brand:'本田',model:'雅阁 2024款 1.5T',type:VEHICLE_TYPES.SEDAN,year:2024,dailyRate:380,fuelCostPerDay:85,maintenanceCostPerDay:28,popularity:9,residualValue:0.79,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:6.8,mileage:70,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:230000,estimatedValue:230000 },
  { id:'LD008',brand:'本田',model:'奥德赛 2024款',type:VEHICLE_TYPES.MPV,year:2024,dailyRate:450,fuelCostPerDay:95,maintenanceCostPerDay:32,popularity:7,residualValue:0.77,age:0,fuelType:FUEL_TYPES.HYBRID,fuelConsumption:5.8,mileage:55,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:300000,estimatedValue:300000 },
  { id:'LD009',brand:'宝马',model:'3系 325Li M运动 2024款',type:VEHICLE_TYPES.SEDAN,year:2024,dailyRate:600,fuelCostPerDay:100,maintenanceCostPerDay:40,popularity:8,residualValue:0.72,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:7.8,mileage:60,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:380000,estimatedValue:380000 },
  { id:'LD010',brand:'宝马',model:'5系 530Li 领先型 2024款',type:VEHICLE_TYPES.SEDAN,year:2024,dailyRate:750,fuelCostPerDay:120,maintenanceCostPerDay:50,popularity:8,residualValue:0.70,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:8.5,mileage:50,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:520000,estimatedValue:520000 },
  { id:'LD011',brand:'宝马',model:'X3 xDrive30i 2024款',type:VEHICLE_TYPES.SUV,year:2024,dailyRate:680,fuelCostPerDay:115,maintenanceCostPerDay:48,popularity:8,residualValue:0.71,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:8.6,mileage:65,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:480000,estimatedValue:480000 },
  { id:'LD012',brand:'比亚迪',model:'汉 EV 荣耀版 605KM',type:VEHICLE_TYPES.SEDAN,year:2025,dailyRate:380,fuelCostPerDay:35,maintenanceCostPerDay:18,popularity:9,residualValue:0.82,age:0,fuelType:FUEL_TYPES.ELECTRIC,fuelConsumption:13,mileage:30,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:240000,estimatedValue:240000 },
  { id:'LD013',brand:'比亚迪',model:'唐 EV 2025款 730KM',type:VEHICLE_TYPES.SUV,year:2025,dailyRate:450,fuelCostPerDay:40,maintenanceCostPerDay:22,popularity:9,residualValue:0.80,age:0,fuelType:FUEL_TYPES.ELECTRIC,fuelConsumption:15,mileage:25,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:280000,estimatedValue:280000 },
  { id:'LD014',brand:'比亚迪',model:'秦PLUS DM-i 2024款',type:VEHICLE_TYPES.SEDAN,year:2024,dailyRate:220,fuelCostPerDay:45,maintenanceCostPerDay:15,popularity:10,residualValue:0.78,age:0,fuelType:FUEL_TYPES.PLUGIN_HYBRID,fuelConsumption:3.8,mileage:100,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:120000,estimatedValue:120000 },
  { id:'LD015',brand:'蔚来',model:'ET5 2024款 75kWh',type:VEHICLE_TYPES.SEDAN,year:2024,dailyRate:480,fuelCostPerDay:42,maintenanceCostPerDay:25,popularity:8,residualValue:0.68,age:0,fuelType:FUEL_TYPES.ELECTRIC,fuelConsumption:15,mileage:80,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:320000,estimatedValue:320000 },
  { id:'LD016',brand:'蔚来',model:'ES6 2024款 75kWh',type:VEHICLE_TYPES.SUV,year:2024,dailyRate:550,fuelCostPerDay:45,maintenanceCostPerDay:28,popularity:8,residualValue:0.66,age:0,fuelType:FUEL_TYPES.ELECTRIC,fuelConsumption:17,mileage:70,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:380000,estimatedValue:380000 },
  { id:'LD017',brand:'理想',model:'L7 Air 2024款',type:VEHICLE_TYPES.SUV,year:2024,dailyRate:500,fuelCostPerDay:60,maintenanceCostPerDay:30,popularity:9,residualValue:0.75,age:0,fuelType:FUEL_TYPES.RANGE_EXTENDER,fuelConsumption:5.8,mileage:50,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:350000,estimatedValue:350000 },
  { id:'LD018',brand:'理想',model:'L9 Ultra 2024款',type:VEHICLE_TYPES.SUV,year:2024,dailyRate:680,fuelCostPerDay:70,maintenanceCostPerDay:38,popularity:8,residualValue:0.73,age:0,fuelType:FUEL_TYPES.RANGE_EXTENDER,fuelConsumption:6.5,mileage:40,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:520000,estimatedValue:520000 },
  { id:'LD019',brand:'奥迪',model:'A4L 40TFSI 时尚型 2024款',type:VEHICLE_TYPES.SEDAN,year:2024,dailyRate:550,fuelCostPerDay:105,maintenanceCostPerDay:42,popularity:8,residualValue:0.70,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:7.5,mileage:55,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:360000,estimatedValue:360000 },
  { id:'LD020',brand:'奥迪',model:'Q5L 45TFSI 豪华型 2024款',type:VEHICLE_TYPES.SUV,year:2024,dailyRate:620,fuelCostPerDay:110,maintenanceCostPerDay:45,popularity:8,residualValue:0.69,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:8.5,mileage:45,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:450000,estimatedValue:450000 },
  { id:'LD021',brand:'大众',model:'帕萨特 330TSI 精英版 2024款',type:VEHICLE_TYPES.SEDAN,year:2024,dailyRate:380,fuelCostPerDay:85,maintenanceCostPerDay:30,popularity:8,residualValue:0.72,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:6.8,mileage:60,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:240000,estimatedValue:240000 },
  { id:'LD022',brand:'大众',model:'途观L 330TSI 智享版 2024款',type:VEHICLE_TYPES.SUV,year:2024,dailyRate:400,fuelCostPerDay:88,maintenanceCostPerDay:32,popularity:8,residualValue:0.70,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:7.0,mileage:55,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:260000,estimatedValue:260000 },
  { id:'LD023',brand:'丰田',model:'普锐斯 2024款 1.8L 混动',type:VEHICLE_TYPES.COMPACT,year:2024,dailyRate:260,fuelCostPerDay:40,maintenanceCostPerDay:18,popularity:7,residualValue:0.76,age:0,fuelType:FUEL_TYPES.HYBRID,fuelConsumption:3.8,mileage:120,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:160000,estimatedValue:160000 },
  { id:'LD024',brand:'比亚迪',model:'宋PLUS DM-i 2025款 110KM',type:VEHICLE_TYPES.SUV,year:2025,dailyRate:320,fuelCostPerDay:42,maintenanceCostPerDay:20,popularity:9,residualValue:0.79,age:0,fuelType:FUEL_TYPES.PLUGIN_HYBRID,fuelConsumption:4.2,mileage:80,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:190000,estimatedValue:190000 },
  { id:'LD025',brand:'本田',model:'雅阁 e:PHEV 2024款',type:VEHICLE_TYPES.SEDAN,year:2024,dailyRate:400,fuelCostPerDay:38,maintenanceCostPerDay:22,popularity:8,residualValue:0.77,age:0,fuelType:FUEL_TYPES.PLUGIN_HYBRID,fuelConsumption:3.5,mileage:90,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:260000,estimatedValue:260000 },

  { id:'OS001',brand:'法拉利',model:'Roma 3.9T V8 2024款',type:VEHICLE_TYPES.SUPERCAR,year:2024,dailyRate:3500,fuelCostPerDay:250,maintenanceCostPerDay:200,popularity:6,residualValue:0.85,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:10.5,mileage:20,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:2760000,estimatedValue:2760000 },
  { id:'OS002',brand:'兰博基尼',model:'Huracán EVO V10 2024款',type:VEHICLE_TYPES.SUPERCAR,year:2024,dailyRate:4000,fuelCostPerDay:280,maintenanceCostPerDay:220,popularity:6,residualValue:0.83,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:11.2,mileage:15,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:3500000,estimatedValue:3500000 },
  { id:'OS003',brand:'保时捷',model:'911 Carrera S 3.0T 2024款',type:VEHICLE_TYPES.SPORTS,year:2024,dailyRate:1800,fuelCostPerDay:150,maintenanceCostPerDay:120,popularity:7,residualValue:0.80,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:9.0,mileage:30,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:1680000,estimatedValue:1680000 },
  { id:'OS004',brand:'宾利',model:'欧陆 GT V8 4.0T 2024款',type:VEHICLE_TYPES.LUXURY,year:2024,dailyRate:2500,fuelCostPerDay:200,maintenanceCostPerDay:180,popularity:5,residualValue:0.78,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:12.0,mileage:25,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:3200000,estimatedValue:3200000 },
  { id:'OS005',brand:'迈凯伦',model:'720S 4.0T V8 2024款',type:VEHICLE_TYPES.SUPERCAR,year:2024,dailyRate:3800,fuelCostPerDay:260,maintenanceCostPerDay:210,popularity:5,residualValue:0.82,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:11.5,mileage:18,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:4000000,estimatedValue:4000000 },
  { id:'OS006',brand:'劳斯莱斯',model:'魅影 6.6T 双门轿跑 2024款',type:VEHICLE_TYPES.LUXURY,year:2024,dailyRate:5000,fuelCostPerDay:300,maintenanceCostPerDay:250,popularity:4,residualValue:0.88,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:14.0,mileage:10,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:6800000,estimatedValue:6800000 },
  { id:'OS007',brand:'阿斯顿·马丁',model:'DB12 Volante 4.0T 2024款',type:VEHICLE_TYPES.SUPERCAR,year:2024,dailyRate:2800,fuelCostPerDay:220,maintenanceCostPerDay:190,popularity:5,residualValue:0.79,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:11.0,mileage:22,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:2980000,estimatedValue:2980000 },
  { id:'OS008',brand:'玛莎拉蒂',model:'MC20 Cielo 3.0T 2024款',type:VEHICLE_TYPES.SUPERCAR,year:2024,dailyRate:2600,fuelCostPerDay:200,maintenanceCostPerDay:170,popularity:5,residualValue:0.76,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:10.5,mileage:28,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:2680000,estimatedValue:2680000 },
  { id:'OS009',brand:'路虎',model:'揽胜 5.0L V8 创世加长版 2024款',type:VEHICLE_TYPES.SUV,year:2024,dailyRate:1500,fuelCostPerDay:180,maintenanceCostPerDay:150,popularity:7,residualValue:0.75,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:13.5,mileage:35,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:2400000,estimatedValue:2400000 },
  { id:'OS010',brand:'奔驰',model:'AMG GT 63 4MATIC+ 2024款',type:VEHICLE_TYPES.SPORTS,year:2024,dailyRate:1600,fuelCostPerDay:165,maintenanceCostPerDay:140,popularity:6,residualValue:0.77,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:12.0,mileage:40,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:1980000,estimatedValue:1980000 },
  { id:'OS011',brand:'宾利',model:'飞驰 4.0T V8 雅度版 2024款',type:VEHICLE_TYPES.LUXURY,year:2024,dailyRate:2200,fuelCostPerDay:190,maintenanceCostPerDay:170,popularity:5,residualValue:0.80,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:11.5,mileage:20,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:3580000,estimatedValue:3580000 },
  { id:'OS012',brand:'法拉利',model:'SF90 Stradale 插电混动 2024款',type:VEHICLE_TYPES.SUPERCAR,year:2024,dailyRate:5500,fuelCostPerDay:320,maintenanceCostPerDay:280,popularity:4,residualValue:0.90,age:0,fuelType:FUEL_TYPES.PLUGIN_HYBRID,fuelConsumption:9.0,mileage:10,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:5800000,estimatedValue:5800000 }
];

function generateLicensePlate() {
  const provinces = ['京','沪','粤','苏','浙','鲁','川','闽','赣','湘','鄂','豫','冀','辽','吉','黑','皖','晋','陕','桂','琼','渝','贵','云','藏','甘','青','宁','新','津'];
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  const p = provinces[Math.floor(Math.random() * provinces.length)];
  const l = letters[Math.floor(Math.random() * letters.length)];
  let s = '';
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return p + l + '·' + s;
}

function generateUsedCarListing(count) {
  const usedBrands = [
    { brand:'丰田',models:['凯美瑞','RAV4荣放','汉兰达','卡罗拉','亚洲龙'],types:[VEHICLE_TYPES.SEDAN,VEHICLE_TYPES.SUV,VEHICLE_TYPES.SUV,VEHICLE_TYPES.COMPACT,VEHICLE_TYPES.SEDAN],prices:[220000,250000,320000,140000,230000],rates:[280,320,420,180,300] },
    { brand:'本田',models:['CR-V','雅阁','思域','奥德赛','缤智'],types:[VEHICLE_TYPES.SUV,VEHICLE_TYPES.SEDAN,VEHICLE_TYPES.COMPACT,VEHICLE_TYPES.MPV,VEHICLE_TYPES.SUV],prices:[240000,230000,160000,300000,180000],rates:[320,300,200,380,220] },
    { brand:'宝马',models:['3系','5系','X3','X1','1系'],types:[VEHICLE_TYPES.SEDAN,VEHICLE_TYPES.SEDAN,VEHICLE_TYPES.SUV,VEHICLE_TYPES.SUV,VEHICLE_TYPES.COMPACT],prices:[380000,520000,480000,300000,250000],rates:[480,600,550,380,280] },
    { brand:'奔驰',models:['C级','E级','GLC','A级','GLA'],types:[VEHICLE_TYPES.SEDAN,VEHICLE_TYPES.SEDAN,VEHICLE_TYPES.SUV,VEHICLE_TYPES.COMPACT,VEHICLE_TYPES.SUV],prices:[360000,550000,450000,260000,300000],rates:[500,650,520,280,320] },
    { brand:'奥迪',models:['A4L','A6L','Q5L','A3','Q3'],types:[VEHICLE_TYPES.SEDAN,VEHICLE_TYPES.SEDAN,VEHICLE_TYPES.SUV,VEHICLE_TYPES.COMPACT,VEHICLE_TYPES.SUV],prices:[360000,500000,450000,240000,280000],rates:[420,580,500,240,300] },
    { brand:'特斯拉',models:['Model 3','Model Y','Model S','Model X'],types:[VEHICLE_TYPES.SEDAN,VEHICLE_TYPES.SUV,VEHICLE_TYPES.SEDAN,VEHICLE_TYPES.SUV],prices:[280000,320000,800000,900000],rates:[380,420,1200,1400] },
    { brand:'大众',models:['帕萨特','途观L','迈腾','高尔夫','探岳'],types:[VEHICLE_TYPES.SEDAN,VEHICLE_TYPES.SUV,VEHICLE_TYPES.SEDAN,VEHICLE_TYPES.COMPACT,VEHICLE_TYPES.SUV],prices:[240000,260000,230000,180000,250000],rates:[300,340,290,200,320] },
    { brand:'比亚迪',models:['汉EV','唐EV','秦PLUS DM-i','宋PLUS DM-i','海豹'],types:[VEHICLE_TYPES.SEDAN,VEHICLE_TYPES.SUV,VEHICLE_TYPES.SEDAN,VEHICLE_TYPES.SUV,VEHICLE_TYPES.SEDAN],prices:[240000,280000,120000,180000,230000],rates:[320,380,180,260,300] },
    { brand:'蔚来',models:['ET5','ES6','ET7','ES8'],types:[VEHICLE_TYPES.SEDAN,VEHICLE_TYPES.SUV,VEHICLE_TYPES.SEDAN,VEHICLE_TYPES.SUV],prices:[320000,380000,480000,520000],rates:[400,450,550,600] },
    { brand:'理想',models:['L7','L9','ONE','L8'],types:[VEHICLE_TYPES.SUV,VEHICLE_TYPES.SUV,VEHICLE_TYPES.SUV,VEHICLE_TYPES.SUV],prices:[350000,520000,340000,420000],rates:[420,550,380,480] },
    { brand:'小鹏',models:['P7','G6','G9','P5'],types:[VEHICLE_TYPES.SEDAN,VEHICLE_TYPES.SUV,VEHICLE_TYPES.SUV,VEHICLE_TYPES.SEDAN],prices:[250000,260000,320000,200000],rates:[300,320,380,240] },
    { brand:'雷克萨斯',models:['ES200','RX300','NX250','LS500h'],types:[VEHICLE_TYPES.SEDAN,VEHICLE_TYPES.SUV,VEHICLE_TYPES.SUV,VEHICLE_TYPES.LUXURY],prices:[360000,480000,380000,1200000],rates:[480,550,450,1200] },
    { brand:'沃尔沃',models:['S60','XC60','S90','XC90'],types:[VEHICLE_TYPES.SEDAN,VEHICLE_TYPES.SUV,VEHICLE_TYPES.SEDAN,VEHICLE_TYPES.SUV],prices:[300000,400000,450000,600000],rates:[380,450,500,600] },
    { brand:'凯迪拉克',models:['CT5','XT5','CT6','XT4'],types:[VEHICLE_TYPES.SEDAN,VEHICLE_TYPES.SUV,VEHICLE_TYPES.SEDAN,VEHICLE_TYPES.SUV],prices:[280000,360000,400000,260000],rates:[350,400,450,300] }
  ];
  const fuelOptions = [FUEL_TYPES.GASOLINE, FUEL_TYPES.HYBRID, FUEL_TYPES.ELECTRIC, FUEL_TYPES.PLUGIN_HYBRID, FUEL_TYPES.RANGE_EXTENDER];
  const conditions = [CONDITION_LEVELS.EXCELLENT, CONDITION_LEVELS.GOOD, CONDITION_LEVELS.GOOD, CONDITION_LEVELS.GOOD, CONDITION_LEVELS.AVERAGE, CONDITION_LEVELS.AVERAGE, CONDITION_LEVELS.POOR];
  const listings = [];
  for (let i = 0; i < count; i++) {
    const bi = usedBrands[Math.floor(Math.random() * usedBrands.length)];
    const mi = Math.floor(Math.random() * bi.models.length);
    const age = Math.floor(Math.random() * 5) + 1;
    const year = 2025 - age;
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const mileage = Math.floor((Math.random() * 12000 + 6000) * age);
    const basePrice = bi.prices[mi];
    const baseRate = bi.rates[mi];
    const cm = condition === CONDITION_LEVELS.EXCELLENT ? 1.0 : condition === CONDITION_LEVELS.GOOD ? 0.9 : condition === CONDITION_LEVELS.AVERAGE ? 0.75 : 0.55;
    const rv = Math.max(0.25, Math.round((0.85 - age * 0.06) * cm * 100) / 100);
    const md = Math.min(mileage / 100000, 0.2);
    const ev = Math.round(basePrice * rv * (1 - md));
    const ft = fuelOptions[Math.floor(Math.random() * fuelOptions.length)];
    listings.push({
      id: 'UC' + Date.now().toString(36) + '_' + i + '_' + Math.random().toString(36).substr(2, 4),
      licensePlate: generateLicensePlate(), brand: bi.brand,
      model: bi.models[mi] + ' ' + year + '款', type: bi.types[mi], year,
      dailyRate: Math.round(baseRate * (0.55 + Math.random() * 0.3)),
      fuelCostPerDay: Math.round((40 + Math.random() * 80) * (1 + age * 0.03)),
      maintenanceCostPerDay: Math.round((15 + Math.random() * 40) * (1 + age * 0.08)),
      popularity: Math.max(1, 8 - Math.floor(age / 2) + Math.floor(Math.random() * 3)),
      residualValue: rv, age, fuelType: ft,
      fuelConsumption: ft === FUEL_TYPES.ELECTRIC ? Math.round((12 + Math.random() * 6) * 10) / 10 : Math.round((5 + Math.random() * 6) * 10) / 10,
      mileage, market: MARKET_TYPES.USED_CAR, isNew: false, condition,
      purchasePrice: basePrice, estimatedValue: ev
    });
  }
  return listings;
}

function getVehiclesByMarket(marketType) {
  if (marketType === MARKET_TYPES.USED_CAR) return [];
  return vehicleDatabase.filter(v => v.market === marketType);
}
function getAllVehicles() { return [...vehicleDatabase]; }
function getVehicleById(vehicleId) { return vehicleDatabase.find(v => v.id === vehicleId) || null; }

function calculateVehicleValue(vehicle) {
  if (vehicle.isNew) return vehicle.purchasePrice || vehicle.estimatedValue;
  const basePrice = vehicle.purchasePrice || vehicle.estimatedValue || 200000;
  let value = basePrice * vehicle.residualValue;
  const cm = { [CONDITION_LEVELS.EXCELLENT]: 1.0, [CONDITION_LEVELS.GOOD]: 0.9, [CONDITION_LEVELS.AVERAGE]: 0.75, [CONDITION_LEVELS.POOR]: 0.55 };
  value *= (cm[vehicle.condition] || 0.8);
  value *= (1 - Math.min((vehicle.mileage / 10000) * 0.02, 0.20));
  return Math.round(value);
}

function getMarketInfo() {
  return {
    [MARKET_TYPES.LOCAL_DEALER]: { id:MARKET_TYPES.LOCAL_DEALER,name:'本地经销商',subtitle:'一手新车',description:'批量采购享95折优惠，即时交付',discount:0.95,deliveryTime:'即时交付',color:'#3498db',bgColor:'rgba(52,152,219,0.1)',icon:'🏪' },
    [MARKET_TYPES.USED_CAR]: { id:MARKET_TYPES.USED_CAR,name:'二手车市场',subtitle:'认证二手车',description:'价格实惠，每次刷新20辆车',discount:1.0,deliveryTime:'1-3个工作日',color:'#e67e22',bgColor:'rgba(230,126,34,0.1)',icon:'🚗',highlightResidualValue:true },
    [MARKET_TYPES.OVERSEAS]: { id:MARKET_TYPES.OVERSEAS,name:'海外进口市场',subtitle:'独家超跑·超豪华车',description:'海外直采，独一无二的车型',discount:1.1,deliveryTime:'15-30个工作日',color:'#9b59b6',bgColor:'rgba(155,89,182,0.1)',icon:'🌍',isExclusive:true }
  };
}

function getFuelTypeInfo(ft) {
  const m = { [FUEL_TYPES.GASOLINE]:{text:'汽油',color:'#e74c3c',icon:'⛽'},[FUEL_TYPES.DIESEL]:{text:'柴油',color:'#34495e',icon:'🚛'},[FUEL_TYPES.ELECTRIC]:{text:'纯电',color:'#27ae60',icon:'🔋'},[FUEL_TYPES.PLUGIN_HYBRID]:{text:'插电混动',color:'#f39c12',icon:'🔌'},[FUEL_TYPES.RANGE_EXTENDER]:{text:'增程',color:'#16a085',icon:'⚡'},[FUEL_TYPES.HYBRID]:{text:'混动',color:'#1abc9c',icon:'🌿'} };
  return m[ft] || {text:ft,color:'#95a5a6',icon:'❓'};
}

function getVehicleTypeInfo(type) {
  const m = { [VEHICLE_TYPES.SEDAN]:{text:'轿车',color:'#3498db'},[VEHICLE_TYPES.SUV]:{text:'SUV',color:'#2ecc71'},[VEHICLE_TYPES.SPORTS]:{text:'跑车',color:'#e74c3c'},[VEHICLE_TYPES.MPV]:{text:'MPV',color:'#9b59b6'},[VEHICLE_TYPES.COMPACT]:{text:'紧凑型',color:'#f39c12'},[VEHICLE_TYPES.LUXURY]:{text:'豪华车',color:'#1abc9c'},[VEHICLE_TYPES.SUPERCAR]:{text:'超跑',color:'#e74c3c'},[VEHICLE_TYPES.WAGON]:{text:'旅行车',color:'#34495e'},[VEHICLE_TYPES.PICKUP]:{text:'皮卡',color:'#795548'} };
  return m[type] || {text:type,color:'#95a5a6'};
}

function getResidualValueInfo(rv) {
  const p = Math.round(rv * 100);
  let level, color;
  if (p >= 80) { level='优秀'; color='#27ae60'; } else if (p >= 65) { level='良好'; color='#3498db'; } else if (p >= 50) { level='一般'; color='#f39c12'; } else { level='较差'; color='#e74c3c'; }
  return { percentage:p, level, color };
}

function calculateDiscountedPrice(basePrice, quantity, marketType) {
  let discount = 1.0;
  if (marketType === MARKET_TYPES.LOCAL_DEALER) { if (quantity >= 10) discount = 0.90; else if (quantity >= 5) discount = 0.93; else if (quantity >= 3) discount = 0.95; }
  else if (marketType === MARKET_TYPES.OVERSEAS) discount = 1.1;
  return Math.round(basePrice * discount);
}

async function fetchFromCarAPI(options) {
  // API替换模板 - 将此函数替换为真实的API调用
  // 参数:
  //   options.marketType - 市场类型 ('local'|'used'|'overseas')
  //   options.count - 请求数量
  //   options.page - 分页页码
  // 返回:
  //   Promise<Array> - 车辆数据数组，格式与 vehicleDatabase 一致
  //
  // 示例实现:
  // const response = await fetch(`/api/vehicles?market=${options.marketType}&count=${options.count}&page=${options.page}`);
  // const data = await response.json();
  // return data.vehicles;
  //
  // 当前返回空数组，使用本地 vehicleDatabase
  console.warn('fetchFromCarAPI: 使用本地数据，请替换为真实API调用');
  return [];
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { vehicleDatabase, FUEL_TYPES, VEHICLE_TYPES, MARKET_TYPES, CONDITION_LEVELS, getVehiclesByMarket, getAllVehicles, getVehicleById, calculateVehicleValue, getMarketInfo, getFuelTypeInfo, getVehicleTypeInfo, getResidualValueInfo, calculateDiscountedPrice, generateLicensePlate, generateUsedCarListing, fetchFromCarAPI };
}
