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
  WAGON: '旅行车', PICKUP: '皮卡', VAN: '面包车',
  COUPE: '轿跑', MINI_SUV: '小型SUV', LARGE_SUV: '大型SUV',
  MPV_LARGE: '大型MPV', CONVERTIBLE: '敞篷', HATCHBACK: '两厢'
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
  { id:'LD026',brand:'奔驰',model:'C260L 运动版 2024款',type:VEHICLE_TYPES.SEDAN,year:2024,dailyRate:550,fuelCostPerDay:100,maintenanceCostPerDay:42,popularity:9,residualValue:0.72,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:7.2,mileage:55,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:360000,estimatedValue:360000 },
  { id:'LD027',brand:'奔驰',model:'E300L 豪华型 2024款',type:VEHICLE_TYPES.SEDAN,year:2024,dailyRate:750,fuelCostPerDay:120,maintenanceCostPerDay:55,popularity:8,residualValue:0.70,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:8.2,mileage:45,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:550000,estimatedValue:550000 },
  { id:'LD028',brand:'奔驰',model:'GLC 300L 4MATIC 2024款',type:VEHICLE_TYPES.SUV,year:2024,dailyRate:650,fuelCostPerDay:110,maintenanceCostPerDay:48,popularity:8,residualValue:0.71,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:8.8,mileage:50,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:460000,estimatedValue:460000 },
  { id:'LD029',brand:'小鹏',model:'P7i 702 Max 2024款',type:VEHICLE_TYPES.SEDAN,year:2024,dailyRate:420,fuelCostPerDay:38,maintenanceCostPerDay:22,popularity:8,residualValue:0.70,age:0,fuelType:FUEL_TYPES.ELECTRIC,fuelConsumption:14,mileage:70,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:280000,estimatedValue:280000 },
  { id:'LD030',brand:'小鹏',model:'G9 702 Max 2024款',type:VEHICLE_TYPES.SUV,year:2024,dailyRate:500,fuelCostPerDay:42,maintenanceCostPerDay:25,popularity:7,residualValue:0.68,age:0,fuelType:FUEL_TYPES.ELECTRIC,fuelConsumption:16,mileage:60,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:340000,estimatedValue:340000 },
  { id:'LD031',brand:'极氪',model:'001 ME版 2024款',type:VEHICLE_TYPES.SEDAN,year:2024,dailyRate:450,fuelCostPerDay:40,maintenanceCostPerDay:24,popularity:8,residualValue:0.72,age:0,fuelType:FUEL_TYPES.ELECTRIC,fuelConsumption:15,mileage:65,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:300000,estimatedValue:300000 },
  { id:'LD032',brand:'问界',model:'M7 Ultra 四驱版 2025款',type:VEHICLE_TYPES.SUV,year:2025,dailyRate:480,fuelCostPerDay:55,maintenanceCostPerDay:28,popularity:9,residualValue:0.76,age:0,fuelType:FUEL_TYPES.RANGE_EXTENDER,fuelConsumption:5.5,mileage:50,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:320000,estimatedValue:320000 },
  { id:'LD033',brand:'问界',model:'M9 Ultra 2025款',type:VEHICLE_TYPES.SUV,year:2025,dailyRate:680,fuelCostPerDay:65,maintenanceCostPerDay:35,popularity:8,residualValue:0.74,age:0,fuelType:FUEL_TYPES.RANGE_EXTENDER,fuelConsumption:6.2,mileage:35,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:520000,estimatedValue:520000 },
  { id:'LD034',brand:'小米',model:'SU7 Max 2024款',type:VEHICLE_TYPES.SEDAN,year:2024,dailyRate:420,fuelCostPerDay:38,maintenanceCostPerDay:20,popularity:10,residualValue:0.78,age:0,fuelType:FUEL_TYPES.ELECTRIC,fuelConsumption:14,mileage:80,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:300000,estimatedValue:300000 },
  { id:'LD035',brand:'吉利',model:'银河E8 665km 2024款',type:VEHICLE_TYPES.SEDAN,year:2024,dailyRate:280,fuelCostPerDay:32,maintenanceCostPerDay:16,popularity:7,residualValue:0.75,age:0,fuelType:FUEL_TYPES.ELECTRIC,fuelConsumption:13,mileage:90,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:180000,estimatedValue:180000 },
  { id:'LD036',brand:'长城',model:'坦克300 2.0T 探索版 2024款',type:VEHICLE_TYPES.SUV,year:2024,dailyRate:420,fuelCostPerDay:100,maintenanceCostPerDay:35,popularity:8,residualValue:0.73,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:10.5,mileage:60,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:250000,estimatedValue:250000 },
  { id:'LD037',brand:'雷克萨斯',model:'ES200 卓越版 2024款',type:VEHICLE_TYPES.SEDAN,year:2024,dailyRate:520,fuelCostPerDay:90,maintenanceCostPerDay:38,popularity:8,residualValue:0.76,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:6.8,mileage:55,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:360000,estimatedValue:360000 },
  { id:'LD038',brand:'沃尔沃',model:'S90 B5 智雅豪华版 2024款',type:VEHICLE_TYPES.SEDAN,year:2024,dailyRate:550,fuelCostPerDay:95,maintenanceCostPerDay:40,popularity:7,residualValue:0.70,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:7.5,mileage:50,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:450000,estimatedValue:450000 },
  { id:'LD039',brand:'凯迪拉克',model:'CT5 28T 铂金运动版 2024款',type:VEHICLE_TYPES.SEDAN,year:2024,dailyRate:480,fuelCostPerDay:95,maintenanceCostPerDay:38,popularity:7,residualValue:0.68,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:8.0,mileage:55,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:300000,estimatedValue:300000 },
  { id:'LD040',brand:'别克',model:'GL8 陆尊 653T 2024款',type:VEHICLE_TYPES.MPV,year:2024,dailyRate:500,fuelCostPerDay:100,maintenanceCostPerDay:35,popularity:8,residualValue:0.74,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:8.5,mileage:50,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:350000,estimatedValue:350000 },
  { id:'LD041',brand:'腾势',model:'D9 DM-i 970 四驱旗舰版 2024款',type:VEHICLE_TYPES.MPV,year:2024,dailyRate:550,fuelCostPerDay:55,maintenanceCostPerDay:30,popularity:8,residualValue:0.76,age:0,fuelType:FUEL_TYPES.PLUGIN_HYBRID,fuelConsumption:5.5,mileage:45,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:380000,estimatedValue:380000 },
  { id:'LD042',brand:'智己',model:'LS6 800V 四驱版 2024款',type:VEHICLE_TYPES.SUV,year:2024,dailyRate:450,fuelCostPerDay:40,maintenanceCostPerDay:24,popularity:7,residualValue:0.70,age:0,fuelType:FUEL_TYPES.ELECTRIC,fuelConsumption:15,mileage:60,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:300000,estimatedValue:300000 },
  { id:'LD043',brand:'本田',model:'思域 Type R FL5 2024款',type:VEHICLE_TYPES.SPORTS,year:2024,dailyRate:1200,fuelCostPerDay:130,maintenanceCostPerDay:65,popularity:7,residualValue:0.72,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:9.5,mileage:30,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:720000,estimatedValue:720000 },
  { id:'LD044',brand:'本田',model:'雅阁 e:HEV 2024款',type:VEHICLE_TYPES.SEDAN,year:2024,dailyRate:420,fuelCostPerDay:42,maintenanceCostPerDay:22,popularity:9,residualValue:0.79,age:0,fuelType:FUEL_TYPES.HYBRID,fuelConsumption:4.6,mileage:65,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:250000,estimatedValue:250000 },
  { id:'LD045',brand:'本田',model:'奥德赛 锐·御享四座版 2024款',type:VEHICLE_TYPES.MPV_LARGE,year:2024,dailyRate:580,fuelCostPerDay:55,maintenanceCostPerDay:32,popularity:7,residualValue:0.76,age:0,fuelType:FUEL_TYPES.HYBRID,fuelConsumption:5.8,mileage:45,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:380000,estimatedValue:380000 },
  { id:'LD046',brand:'本田',model:'ZR-V 致在 2024款 1.5T',type:VEHICLE_TYPES.MINI_SUV,year:2024,dailyRate:320,fuelCostPerDay:78,maintenanceCostPerDay:26,popularity:7,residualValue:0.77,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:7.1,mileage:85,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:180000,estimatedValue:180000 },
  { id:'LD047',brand:'丰田',model:'卡罗拉锐放 2024款 2.0L',type:VEHICLE_TYPES.COMPACT,year:2024,dailyRate:240,fuelCostPerDay:42,maintenanceCostPerDay:17,popularity:8,residualValue:0.75,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:5.9,mileage:110,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:140000,estimatedValue:140000 },
  { id:'LD048',brand:'丰田',model:'皇冠 SportCross 2024款 2.5L混动',type:VEHICLE_TYPES.SEDAN,year:2024,dailyRate:550,fuelCostPerDay:48,maintenanceCostPerDay:30,popularity:7,residualValue:0.74,age:0,fuelType:FUEL_TYPES.HYBRID,fuelConsumption:4.8,mileage:50,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:360000,estimatedValue:360000 },
  { id:'LD049',brand:'丰田',model:'埃尔法 双擎 2024款',type:VEHICLE_TYPES.MPV_LARGE,year:2024,dailyRate:1200,fuelCostPerDay:85,maintenanceCostPerDay:55,popularity:9,residualValue:0.82,age:0,fuelType:FUEL_TYPES.HYBRID,fuelConsumption:7.2,mileage:25,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:890000,estimatedValue:890000 },
  { id:'LD050',brand:'丰田',model:'格瑞维亚 2024款 2.5L混动',type:VEHICLE_TYPES.MPV_LARGE,year:2024,dailyRate:600,fuelCostPerDay:58,maintenanceCostPerDay:33,popularity:8,residualValue:0.77,age:0,fuelType:FUEL_TYPES.HYBRID,fuelConsumption:5.9,mileage:40,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:400000,estimatedValue:400000 },
  { id:'LD051',brand:'丰田',model:'普拉多 2024款 2.4T',type:VEHICLE_TYPES.LARGE_SUV,year:2024,dailyRate:800,fuelCostPerDay:130,maintenanceCostPerDay:50,popularity:9,residualValue:0.80,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:10.8,mileage:35,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:520000,estimatedValue:520000 },
  { id:'LD052',brand:'大众',model:'ID.3 极智版 2024款',type:VEHICLE_TYPES.HATCHBACK,year:2024,dailyRate:260,fuelCostPerDay:30,maintenanceCostPerDay:16,popularity:8,residualValue:0.73,age:0,fuelType:FUEL_TYPES.ELECTRIC,fuelConsumption:12.5,mileage:95,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:160000,estimatedValue:160000 },
  { id:'LD053',brand:'大众',model:'ID.4 CROZZ PRIME 2024款',type:VEHICLE_TYPES.SUV,year:2024,dailyRate:400,fuelCostPerDay:38,maintenanceCostPerDay:22,popularity:8,residualValue:0.72,age:0,fuelType:FUEL_TYPES.ELECTRIC,fuelConsumption:14.5,mileage:75,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:260000,estimatedValue:260000 },
  { id:'LD054',brand:'大众',model:'ID.7 VIZZION AIR 2024款',type:VEHICLE_TYPES.SEDAN,year:2024,dailyRate:420,fuelCostPerDay:36,maintenanceCostPerDay:20,popularity:7,residualValue:0.71,age:0,fuelType:FUEL_TYPES.ELECTRIC,fuelConsumption:13.5,mileage:70,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:280000,estimatedValue:280000 },
  { id:'LD055',brand:'大众',model:'探岳X 2024款 380TSI',type:VEHICLE_TYPES.COUPE,year:2024,dailyRate:450,fuelCostPerDay:92,maintenanceCostPerDay:34,popularity:7,residualValue:0.73,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:7.8,mileage:60,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:280000,estimatedValue:280000 },
  { id:'LD056',brand:'大众',model:'威然 380TSI 旗舰版 2024款',type:VEHICLE_TYPES.VAN,year:2024,dailyRate:520,fuelCostPerDay:105,maintenanceCostPerDay:38,popularity:7,residualValue:0.73,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:8.2,mileage:50,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:340000,estimatedValue:340000 },
  { id:'LD057',brand:'大众',model:'迈腾 380TSI 豪华版 2024款',type:VEHICLE_TYPES.SEDAN,year:2024,dailyRate:420,fuelCostPerDay:88,maintenanceCostPerDay:32,popularity:8,residualValue:0.73,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:7.0,mileage:58,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:260000,estimatedValue:260000 },
  { id:'LD058',brand:'吉利',model:'星越L 2.0T 旗舰型 2024款',type:VEHICLE_TYPES.SUV,year:2024,dailyRate:380,fuelCostPerDay:88,maintenanceCostPerDay:30,popularity:8,residualValue:0.75,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:7.5,mileage:65,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:230000,estimatedValue:230000 },
  { id:'LD059',brand:'吉利',model:'博越L 2024款 1.5T',type:VEHICLE_TYPES.SUV,year:2024,dailyRate:280,fuelCostPerDay:75,maintenanceCostPerDay:24,popularity:8,residualValue:0.76,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:6.5,mileage:80,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:150000,estimatedValue:150000 },
  { id:'LD060',brand:'吉利',model:'帝豪L HiP 2024款',type:VEHICLE_TYPES.SEDAN,year:2024,dailyRate:240,fuelCostPerDay:38,maintenanceCostPerDay:16,popularity:8,residualValue:0.76,age:0,fuelType:FUEL_TYPES.PLUGIN_HYBRID,fuelConsumption:3.9,mileage:95,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:130000,estimatedValue:130000 },
  { id:'LD061',brand:'领克',model:'03+ 2024款 2.0T',type:VEHICLE_TYPES.COUPE,year:2024,dailyRate:650,fuelCostPerDay:100,maintenanceCostPerDay:40,popularity:8,residualValue:0.72,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:9.0,mileage:45,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:380000,estimatedValue:380000 },
  { id:'LD062',brand:'领克',model:'09 EM-P 2024款 远航版',type:VEHICLE_TYPES.LARGE_SUV,year:2024,dailyRate:580,fuelCostPerDay:52,maintenanceCostPerDay:32,popularity:7,residualValue:0.73,age:0,fuelType:FUEL_TYPES.PLUGIN_HYBRID,fuelConsumption:4.5,mileage:45,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:380000,estimatedValue:380000 },
  { id:'LD063',brand:'长城',model:'哈弗H6 第三代GT 2024款',type:VEHICLE_TYPES.SUV,year:2024,dailyRate:300,fuelCostPerDay:82,maintenanceCostPerDay:28,popularity:9,residualValue:0.76,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:7.0,mileage:75,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:160000,estimatedValue:160000 },
  { id:'LD064',brand:'长城',model:'坦克500 Hi4-T 2024款',type:VEHICLE_TYPES.LARGE_SUV,year:2024,dailyRate:700,fuelCostPerDay:110,maintenanceCostPerDay:45,popularity:8,residualValue:0.75,age:0,fuelType:FUEL_TYPES.PLUGIN_HYBRID,fuelConsumption:8.8,mileage:40,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:480000,estimatedValue:480000 },
  { id:'LD065',brand:'长城',model:'炮 2.0T 乘用版 2024款',type:VEHICLE_TYPES.PICKUP,year:2024,dailyRate:350,fuelCostPerDay:95,maintenanceCostPerDay:32,popularity:7,residualValue:0.74,age:0,fuelType:FUEL_TYPES.DIESEL,fuelConsumption:8.5,mileage:55,market:MARKET_TYPES.LOCAL_DEALER,isNew:true,purchasePrice:200000,estimatedValue:200000 },

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
  { id:'OS012',brand:'法拉利',model:'SF90 Stradale 插电混动 2024款',type:VEHICLE_TYPES.SUPERCAR,year:2024,dailyRate:5500,fuelCostPerDay:320,maintenanceCostPerDay:280,popularity:4,residualValue:0.90,age:0,fuelType:FUEL_TYPES.PLUGIN_HYBRID,fuelConsumption:9.0,mileage:10,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:5800000,estimatedValue:5800000 },
  { id:'OS013',brand:'法拉利',model:'296 GTB 3.0T V6 2024款',type:VEHICLE_TYPES.SUPERCAR,year:2024,dailyRate:4200,fuelCostPerDay:280,maintenanceCostPerDay:240,popularity:5,residualValue:0.86,age:0,fuelType:FUEL_TYPES.PLUGIN_HYBRID,fuelConsumption:8.5,mileage:15,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:3380000,estimatedValue:3380000 },
  { id:'OS014',brand:'法拉利',model:'812 Superfast 6.5L V12 2024款',type:VEHICLE_TYPES.SUPERCAR,year:2024,dailyRate:5800,fuelCostPerDay:350,maintenanceCostPerDay:300,popularity:4,residualValue:0.87,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:14.5,mileage:10,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:5300000,estimatedValue:5300000 },
  { id:'OS015',brand:'法拉利',model:'SF90 XX Stradale 2024款',type:VEHICLE_TYPES.SUPERCAR,year:2024,dailyRate:7200,fuelCostPerDay:380,maintenanceCostPerDay:320,popularity:3,residualValue:0.92,age:0,fuelType:FUEL_TYPES.PLUGIN_HYBRID,fuelConsumption:8.2,mileage:8,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:7800000,estimatedValue:7800000 },
  { id:'OS016',brand:'兰博基尼',model:'Revuelto 6.5L V12混动 2024款',type:VEHICLE_TYPES.SUPERCAR,year:2024,dailyRate:6500,fuelCostPerDay:360,maintenanceCostPerDay:300,popularity:4,residualValue:0.89,age:0,fuelType:FUEL_TYPES.PLUGIN_HYBRID,fuelConsumption:9.5,mileage:10,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:6800000,estimatedValue:6800000 },
  { id:'OS017',brand:'兰博基尼',model:'Huracán Tecnica 5.2L V10 2024款',type:VEHICLE_TYPES.SUPERCAR,year:2024,dailyRate:4500,fuelCostPerDay:300,maintenanceCostPerDay:250,popularity:5,residualValue:0.84,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:12.8,mileage:15,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:3800000,estimatedValue:3800000 },
  { id:'OS018',brand:'兰博基尼',model:'Urus S 4.0T V8 2024款',type:VEHICLE_TYPES.LARGE_SUV,year:2024,dailyRate:3500,fuelCostPerDay:260,maintenanceCostPerDay:220,popularity:6,residualValue:0.81,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:12.5,mileage:20,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:3200000,estimatedValue:3200000 },
  { id:'OS019',brand:'迈凯伦',model:'Artura 3.0T V6混动 2024款',type:VEHICLE_TYPES.SUPERCAR,year:2024,dailyRate:3200,fuelCostPerDay:240,maintenanceCostPerDay:200,popularity:6,residualValue:0.82,age:0,fuelType:FUEL_TYPES.PLUGIN_HYBRID,fuelConsumption:7.8,mileage:18,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:2680000,estimatedValue:2680000 },
  { id:'OS020',brand:'迈凯伦',model:'750S 4.0T V8 2024款',type:VEHICLE_TYPES.SUPERCAR,year:2024,dailyRate:4800,fuelCostPerDay:300,maintenanceCostPerDay:250,popularity:5,residualValue:0.84,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:11.8,mileage:12,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:4200000,estimatedValue:4200000 },
  { id:'OS021',brand:'迈凯伦',model:'Speedtail 4.0T V8 2024款',type:VEHICLE_TYPES.SUPERCAR,year:2024,dailyRate:8500,fuelCostPerDay:400,maintenanceCostPerDay:350,popularity:3,residualValue:0.91,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:13.5,mileage:8,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:9800000,estimatedValue:9800000 },
  { id:'OS022',brand:'保时捷',model:'911 GT3 RS 4.0L 2024款',type:VEHICLE_TYPES.SPORTS,year:2024,dailyRate:2800,fuelCostPerDay:200,maintenanceCostPerDay:170,popularity:7,residualValue:0.82,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:13.2,mileage:18,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:2480000,estimatedValue:2480000 },
  { id:'OS023',brand:'保时捷',model:'Taycan Turbo S 2024款',type:VEHICLE_TYPES.SPORTS,year:2024,dailyRate:2600,fuelCostPerDay:80,maintenanceCostPerDay:150,popularity:7,residualValue:0.78,age:0,fuelType:FUEL_TYPES.ELECTRIC,fuelConsumption:20.5,mileage:22,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:2280000,estimatedValue:2280000 },
  { id:'OS024',brand:'保时捷',model:'Cayenne Turbo GT 4.0T 2024款',type:VEHICLE_TYPES.LARGE_SUV,year:2024,dailyRate:2200,fuelCostPerDay:210,maintenanceCostPerDay:180,popularity:7,residualValue:0.77,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:13.0,mileage:25,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:2080000,estimatedValue:2080000 },
  { id:'OS025',brand:'保时捷',model:'Panamera Turbo E-Hybrid 2024款',type:VEHICLE_TYPES.LUXURY,year:2024,dailyRate:2000,fuelCostPerDay:120,maintenanceCostPerDay:140,popularity:6,residualValue:0.76,age:0,fuelType:FUEL_TYPES.PLUGIN_HYBRID,fuelConsumption:7.5,mileage:28,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:1880000,estimatedValue:1880000 },
  { id:'OS026',brand:'劳斯莱斯',model:'Phantom 长轴距版 2024款',type:VEHICLE_TYPES.LUXURY,year:2024,dailyRate:8000,fuelCostPerDay:380,maintenanceCostPerDay:320,popularity:3,residualValue:0.90,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:15.5,mileage:8,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:10800000,estimatedValue:10800000 },
  { id:'OS027',brand:'劳斯莱斯',model:'Ghost 2024款',type:VEHICLE_TYPES.LUXURY,year:2024,dailyRate:5500,fuelCostPerDay:320,maintenanceCostPerDay:280,popularity:4,residualValue:0.88,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:14.0,mileage:10,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:7280000,estimatedValue:7280000 },
  { id:'OS028',brand:'劳斯莱斯',model:'Cullinan 四座版 2024款',type:VEHICLE_TYPES.SUV,year:2024,dailyRate:6000,fuelCostPerDay:340,maintenanceCostPerDay:290,popularity:5,residualValue:0.86,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:14.8,mileage:12,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:7800000,estimatedValue:7800000 },
  { id:'OS029',brand:'劳斯莱斯',model:'Spectre 2024款',type:VEHICLE_TYPES.CONVERTIBLE,year:2024,dailyRate:6800,fuelCostPerDay:100,maintenanceCostPerDay:300,popularity:4,residualValue:0.88,age:0,fuelType:FUEL_TYPES.ELECTRIC,fuelConsumption:21.0,mileage:10,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:8380000,estimatedValue:8380000 },
  { id:'OS030',brand:'宾利',model:'Continental GT Speed 2024款',type:VEHICLE_TYPES.LUXURY,year:2024,dailyRate:3000,fuelCostPerDay:230,maintenanceCostPerDay:200,popularity:5,residualValue:0.80,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:13.5,mileage:18,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:3680000,estimatedValue:3680000 },
  { id:'OS031',brand:'宾利',model:'Flying Spur W12 2024款',type:VEHICLE_TYPES.LUXURY,year:2024,dailyRate:2800,fuelCostPerDay:220,maintenanceCostPerDay:190,popularity:5,residualValue:0.79,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:13.0,mileage:20,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:3480000,estimatedValue:3480000 },
  { id:'OS032',brand:'宾利',model:'Bentayga EWB 4.0T V8 2024款',type:VEHICLE_TYPES.LARGE_SUV,year:2024,dailyRate:2600,fuelCostPerDay:210,maintenanceCostPerDay:180,popularity:6,residualValue:0.78,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:12.8,mileage:22,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:3280000,estimatedValue:3280000 },
  { id:'OS033',brand:'阿斯顿·马丁',model:'DB12 4.0T V8 2024款',type:VEHICLE_TYPES.LUXURY,year:2024,dailyRate:2400,fuelCostPerDay:210,maintenanceCostPerDay:180,popularity:5,residualValue:0.78,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:11.5,mileage:22,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:2680000,estimatedValue:2680000 },
  { id:'OS034',brand:'阿斯顿·马丁',model:'Vantage 4.0T V8 2024款',type:VEHICLE_TYPES.SPORTS,year:2024,dailyRate:2000,fuelCostPerDay:190,maintenanceCostPerDay:160,popularity:6,residualValue:0.77,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:11.0,mileage:25,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:2180000,estimatedValue:2180000 },
  { id:'OS035',brand:'阿斯顿·马丁',model:'DBX707 4.0T V8 2024款',type:VEHICLE_TYPES.LARGE_SUV,year:2024,dailyRate:2800,fuelCostPerDay:230,maintenanceCostPerDay:195,popularity:6,residualValue:0.79,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:12.5,mileage:20,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:3080000,estimatedValue:3080000 },
  { id:'OS036',brand:'玛莎拉蒂',model:'MC20 Trofeo 3.0T 2024款',type:VEHICLE_TYPES.SUPERCAR,year:2024,dailyRate:3000,fuelCostPerDay:220,maintenanceCostPerDay:185,popularity:5,residualValue:0.77,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:11.2,mileage:22,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:2880000,estimatedValue:2880000 },
  { id:'OS037',brand:'玛莎拉蒂',model:'GranTurismo Folgore 2024款',type:VEHICLE_TYPES.SPORTS,year:2024,dailyRate:2600,fuelCostPerDay:75,maintenanceCostPerDay:160,popularity:5,residualValue:0.74,age:0,fuelType:FUEL_TYPES.ELECTRIC,fuelConsumption:19.5,mileage:25,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:2380000,estimatedValue:2380000 },
  { id:'OS038',brand:'玛莎拉蒂',model:'Grecale Modena 2.0T 2024款',type:VEHICLE_TYPES.SUV,year:2024,dailyRate:1400,fuelCostPerDay:145,maintenanceCostPerDay:110,popularity:6,residualValue:0.73,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:9.5,mileage:35,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:1280000,estimatedValue:1280000 },
  { id:'OS039',brand:'科尼赛克',model:'Jesko Absolut 5.0T V8 2024款',type:VEHICLE_TYPES.SUPERCAR,year:2024,dailyRate:12000,fuelCostPerDay:500,maintenanceCostPerDay:420,popularity:2,residualValue:0.94,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:16.0,mileage:5,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:18000000,estimatedValue:18000000 },
  { id:'OS040',brand:'科尼赛克',model:'Gemera 2.0T 三电机 2024款',type:VEHICLE_TYPES.SUPERCAR,year:2024,dailyRate:9000,fuelCostPerDay:350,maintenanceCostPerDay:300,popularity:3,residualValue:0.92,age:0,fuelType:FUEL_TYPES.PLUGIN_HYBRID,fuelConsumption:6.5,mileage:6,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:13800000,estimatedValue:13800000 },
  { id:'OS041',brand:'布加迪',model:'Chiron 8.0T W16 2024款',type:VEHICLE_TYPES.SUPERCAR,year:2024,dailyRate:10000,fuelCostPerDay:480,maintenanceCostPerDay:400,popularity:2,residualValue:0.93,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:22.0,mileage:5,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:15800000,estimatedValue:15800000 },
  { id:'OS042',brand:'布加迪',model:'Tourbillon 8.0T W16混动 2024款',type:VEHICLE_TYPES.SUPERCAR,year:2024,dailyRate:15000,fuelCostPerDay:520,maintenanceCostPerDay:450,popularity:1,residualValue:0.95,age:0,fuelType:FUEL_TYPES.PLUGIN_HYBRID,fuelConsumption:14.5,mileage:3,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:24000000,estimatedValue:24000000 },
  { id:'OS043',brand:'帕加尼',model:'Utopia 6.0T V12 2024款',type:VEHICLE_TYPES.SUPERCAR,year:2024,dailyRate:11000,fuelCostPerDay:450,maintenanceCostPerDay:380,popularity:2,residualValue:0.93,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:17.5,mileage:5,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:16800000,estimatedValue:16800000 },
  { id:'OS044',brand:'帕加尼',model:'Huayra Roadster BC 6.0T V12 2024款',type:VEHICLE_TYPES.CONVERTIBLE,year:2024,dailyRate:13000,fuelCostPerDay:470,maintenanceCostPerDay:400,popularity:2,residualValue:0.92,age:0,fuelType:FUEL_TYPES.GASOLINE,fuelConsumption:18.0,mileage:4,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:19800000,estimatedValue:19800000 },
  { id:'OS045',brand:'Rimac',model:'Nevera 四电机 2024款',type:VEHICLE_TYPES.SUPERCAR,year:2024,dailyRate:9500,fuelCostPerDay:95,maintenanceCostPerDay:320,popularity:3,residualValue:0.90,age:0,fuelType:FUEL_TYPES.ELECTRIC,fuelConsumption:23.0,mileage:6,market:MARKET_TYPES.OVERSEAS,isNew:true,isExclusive:true,purchasePrice:11800000,estimatedValue:11800000 }
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
  const m = { [VEHICLE_TYPES.SEDAN]:{text:'轿车',color:'#3498db'},[VEHICLE_TYPES.SUV]:{text:'SUV',color:'#2ecc71'},[VEHICLE_TYPES.SPORTS]:{text:'跑车',color:'#e74c3c'},[VEHICLE_TYPES.MPV]:{text:'MPV',color:'#9b59b6'},[VEHICLE_TYPES.COMPACT]:{text:'紧凑型',color:'#f39c12'},[VEHICLE_TYPES.LUXURY]:{text:'豪华车',color:'#1abc9c'},[VEHICLE_TYPES.SUPERCAR]:{text:'超跑',color:'#e74c3c'},[VEHICLE_TYPES.WAGON]:{text:'旅行车',color:'#34495e'},[VEHICLE_TYPES.PICKUP]:{text:'皮卡',color:'#795548'},[VEHICLE_TYPES.VAN]:{text:'面包车',color:'#607d8b'},[VEHICLE_TYPES.COUPE]:{text:'轿跑',color:'#e91e63'},[VEHICLE_TYPES.MINI_SUV]:{text:'小型SUV',color:'#4caf50'},[VEHICLE_TYPES.LARGE_SUV]:{text:'大型SUV',color:'#ff5722'},[VEHICLE_TYPES.MPV_LARGE]:{text:'大型MPV',color:'#673ab7'},[VEHICLE_TYPES.CONVERTIBLE]:{text:'敞篷',color:'#00bcd4'},[VEHICLE_TYPES.HATCHBACK]:{text:'两厢',color:'#8bc34a'} };
  return m[type] || {text:type,color:'#95a5a6'};
}

var MARKET_CATALOG = {
  [MARKET_TYPES.LOCAL_DEALER]: {
    name: '本地经销商',
    icon: '🏪',
    desc: '国内市场，税费较低',
    subcategories: [
      { id: 'all', name: '全部', icon: '📋', vehicleIds: [] },
      { id: 'economy', name: '经济型', icon: '💰', vehicleIds: ['LD014','LD023','LD035','LD047','LD052','LD059','LD060'] },
      { id: 'family', name: '家用型', icon: '👨‍👩‍👧', vehicleIds: ['LD001','LD002','LD003','LD004','LD005','LD006','LD007','LD012','LD013','LD021','LD022','LD024','LD025','LD029','LD030','LD031','LD034','LD044','LD046','LD053','LD054','LD055','LD057','LD058'] },
      { id: 'business', name: '商务型', icon: '💼', vehicleIds: ['LD008','LD009','LD010','LD019','LD026','LD027','LD028','LD037','LD038','LD039','LD040','LD041','LD045','LD048','LD049','LD050','LD056'] },
      { id: 'sports', name: '运动型', icon: '🏎️', vehicleIds: ['LD036','LD043','LD055','LD061','LD064'] },
      { id: 'luxury', name: '豪华型', icon: '👑', vehicleIds: ['LD011','LD015','LD016','LD017','LD018','LD020','LD032','LD033','LD042','LD051','LD062'] },
      { id: 'special', name: '特种车', icon: '🛻', vehicleIds: ['LD065','LD056'] }
    ]
  },
  [MARKET_TYPES.OVERSEAS]: {
    name: '海外进口',
    icon: '✈️',
    desc: '国际豪车，关税较高',
    subcategories: [
      { id: 'all', name: '全部', icon: '📋', vehicleIds: [] },
      { id: 'supercar', name: '超跑', icon: '🏎️', vehicleIds: ['OS001','OS002','OS005','OS007','OS008','OS012','OS013','OS014','OS015','OS016','OS017','OS019','OS020','OS021','OS036','OS039','OS040','OS041','OS042','OS043','OS044','OS045'] },
      { id: 'luxury', name: '豪华轿车', icon: '👑', vehicleIds: ['OS004','OS006','OS011','OS025','OS026','OS027','OS030','OS031','OS033'] },
      { id: 'sports', name: '性能跑车', icon: '⚡', vehicleIds: ['OS003','OS010','OS022','OS023','OS034','OS037'] },
      { id: 'suv', name: '豪华SUV', icon: '🚙', vehicleIds: ['OS009','OS018','OS024','OS028','OS032','OS035','OS038'] },
      { id: 'exclusive', name: '顶级臻藏', icon: '💎', vehicleIds: ['OS026','OS028','OS029','OS039','OS040','OS041','OS042','OS043','OS044','OS045'] }
    ]
  }
};

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
  module.exports = { vehicleDatabase, FUEL_TYPES, VEHICLE_TYPES, MARKET_TYPES, CONDITION_LEVELS, MARKET_CATALOG, getVehiclesByMarket, getAllVehicles, getVehicleById, calculateVehicleValue, getMarketInfo, getFuelTypeInfo, getVehicleTypeInfo, getResidualValueInfo, calculateDiscountedPrice, generateLicensePlate, generateUsedCarListing, fetchFromCarAPI };
}
