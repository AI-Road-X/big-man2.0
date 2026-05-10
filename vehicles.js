/**
 * 车辆数据库 - 租车公司模拟游戏
 * 包含2023-2026年常见车型
 * 
 * API替换指引：
 * 1. 将 vehicleDatabase 数组替换为 API 调用
 * 2. 建议使用 async/await 模式获取数据
 * 3. API端点示例：GET /api/vehicles
 * 4. 数据格式应与当前结构保持一致
 * 
 * // 替换示例代码：
 * async function fetchVehicleDatabase() {
 *   try {
 *     const response = await fetch('/api/vehicles');
 *     const data = await response.json();
 *     return data;
 *   } catch (error) {
 *     console.error('获取车辆数据失败:', error);
 *     return vehicleDatabase; // 失败时返回本地数据
 *   }
 * }
 */

// 车辆能源类型常量
const FUEL_TYPES = {
  GASOLINE: '汽油',
  DIESEL: '柴油',
  ELECTRIC: '纯电',
  PLUGIN_HYBRID: '插电混动',
  RANGE_EXTENDER: '增程',
  HYBRID: '混动'
};

// 车辆类型常量
const VEHICLE_TYPES = {
  SEDAN: '轿车',
  SUV: 'SUV',
  SPORTS: '跑车',
  MPV: 'MPV',
  COMPACT: '紧凑型',
  LUXURY: '豪华车',
  SUPERCAR: '超跑',
  WAGON: '旅行车',
  PICKUP: '皮卡'
};

// 市场分类常量
const MARKET_TYPES = {
  LOCAL_DEALER: 'local',
  USED_CAR: 'used',
  OVERSEAS: 'overseas'
};

// 车辆状况等级
const CONDITION_LEVELS = {
  EXCELLENT: '优秀',
  GOOD: '良好',
  AVERAGE: '一般',
  POOR: '较差'
};

/**
 * 车辆数据库 - 40+车型
 * 
 * 字段说明：
 * - id: 车辆唯一标识
 * - licensePlate: 车牌号
 * - brand: 品牌
 * - model: 车型
 * - type: 车辆类型
 * - year: 生产年份
 * - dailyRate: 日租金（元/天）
 * - fuelCostPerDay: 每日燃油/电耗成本（元）
 * - maintenanceCostPerDay: 每日维护成本（元）
 * - popularity: 人气指数（1-10）
 * - residualValue: 保值率（百分比，如0.85表示85%保值率）
 * - age: 车龄（年）
 * - fuelType: 能源类型
 * - fuelConsumption: 油耗（L/100km）或电耗（kWh/100km）
 * - mileage: 当前公里数
 * - market: 可购买的市场
 * - isNew: 是否为新车
 * - condition: 车辆状况（仅二手车）
 * - purchasePrice: 采购价格
 * - estimatedValue: 估算当前价值
 */
const vehicleDatabase = [
  // ==================== 本地经销商车型（一手车） ====================
  // 丰田系列
  {
    id: 'LD001',
    licensePlate: '京A88888',
    brand: '丰田',
    model: '凯美瑞 2024款 2.5L',
    type: VEHICLE_TYPES.SEDAN,
    year: 2024,
    dailyRate: 350,
    fuelCostPerDay: 80,
    maintenanceCostPerDay: 25,
    popularity: 9,
    residualValue: 0.80,
    age: 0,
    fuelType: FUEL_TYPES.HYBRID,
    fuelConsumption: 4.5,
    mileage: 50,
    market: MARKET_TYPES.LOCAL_DEALER,
    isNew: true,
    purchasePrice: 220000,
    estimatedValue: 220000
  },
  {
    id: 'LD002',
    licensePlate: '京A77777',
    brand: '丰田',
    model: 'RAV4荣放 2024款',
    type: VEHICLE_TYPES.SUV,
    year: 2024,
    dailyRate: 380,
    fuelCostPerDay: 85,
    maintenanceCostPerDay: 28,
    popularity: 9,
    residualValue: 0.78,
    age: 0,
    fuelType: FUEL_TYPES.HYBRID,
    fuelConsumption: 5.0,
    mileage: 80,
    market: MARKET_TYPES.LOCAL_DEALER,
    isNew: true,
    purchasePrice: 250000,
    estimatedValue: 250000
  },
  {
    id: 'LD003',
    licensePlate: '京A66666',
    brand: '丰田',
    model: '汉兰达 2024款',
    type: VEHICLE_TYPES.SUV,
    year: 2024,
    dailyRate: 480,
    fuelCostPerDay: 100,
    maintenanceCostPerDay: 35,
    popularity: 8,
    residualValue: 0.82,
    age: 0,
    fuelType: FUEL_TYPES.HYBRID,
    fuelConsumption: 5.3,
    mileage: 60,
    market: MARKET_TYPES.LOCAL_DEALER,
    isNew: true,
    purchasePrice: 320000,
    estimatedValue: 320000
  },
  // 特斯拉系列
  {
    id: 'LD004',
    licensePlate: '京A55555',
    brand: '特斯拉',
    model: 'Model 3 后驱版 2024款',
    type: VEHICLE_TYPES.SEDAN,
    year: 2024,
    dailyRate: 450,
    fuelCostPerDay: 40,
    maintenanceCostPerDay: 20,
    popularity: 10,
    residualValue: 0.75,
    age: 0,
    fuelType: FUEL_TYPES.ELECTRIC,
    fuelConsumption: 12,
    mileage: 100,
    market: MARKET_TYPES.LOCAL_DEALER,
    isNew: true,
    purchasePrice: 280000,
    estimatedValue: 280000
  },
  {
    id: 'LD005',
    licensePlate: '京A44444',
    brand: '特斯拉',
    model: 'Model Y 长续航 2024款',
    type: VEHICLE_TYPES.SUV,
    year: 2024,
    dailyRate: 520,
    fuelCostPerDay: 45,
    maintenanceCostPerDay: 22,
    popularity: 10,
    residualValue: 0.73,
    age: 0,
    fuelType: FUEL_TYPES.ELECTRIC,
    fuelConsumption: 13,
    mileage: 90,
    market: MARKET_TYPES.LOCAL_DEALER,
    isNew: true,
    purchasePrice: 320000,
    estimatedValue: 320000
  },
  // 本田系列
  {
    id: 'LD006',
    licensePlate: '京A33333',
    brand: '本田',
    model: 'CR-V 2024款 1.5T',
    type: VEHICLE_TYPES.SUV,
    year: 2024,
    dailyRate: 400,
    fuelCostPerDay: 90,
    maintenanceCostPerDay: 30,
    popularity: 8,
    residualValue: 0.78,
    age: 0,
    fuelType: FUEL_TYPES.GASOLINE,
    fuelConsumption: 7.3,
    mileage: 80,
    market: MARKET_TYPES.LOCAL_DEALER,
    isNew: true,
    purchasePrice: 240000,
    estimatedValue: 240000
  },
  {
    id: 'LD007',
    licensePlate: '京A22222',
    brand: '本田',
    model: '雅阁 2024款 1.5T',
    type: VEHICLE_TYPES.SEDAN,
    year: 2024,
    dailyRate: 380,
    fuelCostPerDay: 85,
    maintenanceCostPerDay: 28,
    popularity: 9,
    residualValue: 0.79,
    age: 0,
    fuelType: FUEL_TYPES.GASOLINE,
    fuelConsumption: 6.8,
    mileage: 70,
    market: MARKET_TYPES.LOCAL_DEALER,
    isNew: true,
    purchasePrice: 230000,
    estimatedValue: 230000
  },
  {
    id: 'LD008',
    licensePlate: '京A11111',
    brand: '本田',
    model: '奥德赛 2024款',
    type: VEHICLE_TYPES.MPV,
    year: 2024,
    dailyRate: 450,
    fuelCostPerDay: 95,
    maintenanceCostPerDay: 32,
    popularity: 7,
    residualValue: 0.77,
    age: 0,
    fuelType: FUEL_TYPES.HYBRID,
    fuelConsumption: 5.8,
    mileage: 55,
    market: MARKET_TYPES.LOCAL_DEALER,
    isNew: true,
    purchasePrice: 300000,
    estimatedValue: 300000
  },
  // 宝马系列
  {
    id: 'LD009',
    licensePlate: '京B11111',
    brand: '宝马',
    model: '3系 325Li M运动套装 2024款',
    type: VEHICLE_TYPES.SEDAN,
    year: 2024,
    dailyRate: 600,
    fuelCostPerDay: 100,
    maintenanceCostPerDay: 40,
    popularity: 8,
    residualValue: 0.72,
    age: 0,
    fuelType: FUEL_TYPES.GASOLINE,
    fuelConsumption: 7.8,
    mileage: 60,
    market: MARKET_TYPES.LOCAL_DEALER,
    isNew: true,
    purchasePrice: 380000,
    estimatedValue: 380000
  },
  {
    id: 'LD010',
    licensePlate: '京B22222',
    brand: '宝马',
    model: '5系 530Li 领先型 2024款',
    type: VEHICLE_TYPES.SEDAN,
    year: 2024,
    dailyRate: 750,
    fuelCostPerDay: 120,
    maintenanceCostPerDay: 50,
    popularity: 8,
    residualValue: 0.70,
    age: 0,
    fuelType: FUEL_TYPES.GASOLINE,
    fuelConsumption: 8.5,
    mileage: 50,
    market: MARKET_TYPES.LOCAL_DEALER,
    isNew: true,
    purchasePrice: 520000,
    estimatedValue: 520000
  },
  {
    id: 'LD011',
    licensePlate: '京B33333',
    brand: '宝马',
    model: 'X3 xDrive30i 2024款',
    type: VEHICLE_TYPES.SUV,
    year: 2024,
    dailyRate: 680,
    fuelCostPerDay: 115,
    maintenanceCostPerDay: 48,
    popularity: 8,
    residualValue: 0.71,
    age: 0,
    fuelType: FUEL_TYPES.GASOLINE,
    fuelConsumption: 8.6,
    mileage: 65,
    market: MARKET_TYPES.LOCAL_DEALER,
    isNew: true,
    purchasePrice: 480000,
    estimatedValue: 480000
  },
  // 比亚迪系列
  {
    id: 'LD012',
    licensePlate: '京C11111',
    brand: '比亚迪',
    model: '汉 EV 荣耀版 605KM',
    type: VEHICLE_TYPES.SEDAN,
    year: 2025,
    dailyRate: 380,
    fuelCostPerDay: 35,
    maintenanceCostPerDay: 18,
    popularity: 9,
    residualValue: 0.82,
    age: 0,
    fuelType: FUEL_TYPES.ELECTRIC,
    fuelConsumption: 13,
    mileage: 30,
    market: MARKET_TYPES.LOCAL_DEALER,
    isNew: true,
    purchasePrice: 240000,
    estimatedValue: 240000
  },
  {
    id: 'LD013',
    licensePlate: '京C22222',
    brand: '比亚迪',
    model: '唐 EV 2025款 730KM',
    type: VEHICLE_TYPES.SUV,
    year: 2025,
    dailyRate: 450,
    fuelCostPerDay: 40,
    maintenanceCostPerDay: 22,
    popularity: 9,
    residualValue: 0.80,
    age: 0,
    fuelType: FUEL_TYPES.ELECTRIC,
    fuelConsumption: 15,
    mileage: 25,
    market: MARKET_TYPES.LOCAL_DEALER,
    isNew: true,
    purchasePrice: 280000,
    estimatedValue: 280000
  },
  {
    id: 'LD014',
    licensePlate: '京C33333',
    brand: '比亚迪',
    model: '秦PLUS DM-i 2024款',
    type: VEHICLE_TYPES.SEDAN,
    year: 2024,
    dailyRate: 220,
    fuelCostPerDay: 45,
    maintenanceCostPerDay: 15,
    popularity: 10,
    residualValue: 0.78,
    age: 0,
    fuelType: FUEL_TYPES.PLUGIN_HYBRID,
    fuelConsumption: 3.8,
    mileage: 100,
    market: MARKET_TYPES.LOCAL_DEALER,
    isNew: true,
    purchasePrice: 120000,
    estimatedValue: 120000
  },
  // 蔚来系列
  {
    id: 'LD015',
    licensePlate: '京D11111',
    brand: '蔚来',
    model: 'ET5 2024款 75kWh',
    type: VEHICLE_TYPES.SEDAN,
    year: 2024,
    dailyRate: 480,
    fuelCostPerDay: 42,
    maintenanceCostPerDay: 25,
    popularity: 8,
    residualValue: 0.68,
    age: 0,
    fuelType: FUEL_TYPES.ELECTRIC,
    fuelConsumption: 15,
    mileage: 80,
    market: MARKET_TYPES.LOCAL_DEALER,
    isNew: true,
    purchasePrice: 320000,
    estimatedValue: 320000
  },
  {
    id: 'LD016',
    licensePlate: '京D22222',
    brand: '蔚来',
    model: 'ES6 2024款 75kWh',
    type: VEHICLE_TYPES.SUV,
    year: 2024,
    dailyRate: 550,
    fuelCostPerDay: 45,
    maintenanceCostPerDay: 28,
    popularity: 8,
    residualValue: 0.66,
    age: 0,
    fuelType: FUEL_TYPES.ELECTRIC,
    fuelConsumption: 17,
    mileage: 70,
    market: MARKET_TYPES.LOCAL_DEALER,
    isNew: true,
    purchasePrice: 380000,
    estimatedValue: 380000
  },
  // 理想系列
  {
    id: 'LD017',
    licensePlate: '京E11111',
    brand: '理想',
    model: 'L7 Air 2024款',
    type: VEHICLE_TYPES.SUV,
    year: 2024,
    dailyRate: 500,
    fuelCostPerDay: 60,
    maintenanceCostPerDay: 30,
    popularity: 9,
    residualValue: 0.75,
    age: 0,
    fuelType: FUEL_TYPES.RANGE_EXTENDER,
    fuelConsumption: 5.8,
    mileage: 50,
    market: MARKET_TYPES.LOCAL_DEALER,
    isNew: true,
    purchasePrice: 350000,
    estimatedValue: 350000
  },
  {
    id: 'LD018',
    licensePlate: '京E22222',
    brand: '理想',
    model: 'L9 Ultra 2024款',
    type: VEHICLE_TYPES.SUV,
    year: 2024,
    dailyRate: 680,
    fuelCostPerDay: 70,
    maintenanceCostPerDay: 38,
    popularity: 8,
    residualValue: 0.73,
    age: 0,
    fuelType: FUEL_TYPES.RANGE_EXTENDER,
    fuelConsumption: 6.5,
    mileage: 40,
    market: MARKET_TYPES.LOCAL_DEALER,
    isNew: true,
    purchasePrice: 520000,
    estimatedValue: 520000
  },
  // 奥迪系列
  {
    id: 'LD019',
    licensePlate: '京F11111',
    brand: '奥迪',
    model: 'A4L 40TFSI 时尚型 2024款',
    type: VEHICLE_TYPES.SEDAN,
    year: 2024,
    dailyRate: 550,
    fuelCostPerDay: 105,
    maintenanceCostPerDay: 42,
    popularity: 8,
    residualValue: 0.70,
    age: 0,
    fuelType: FUEL_TYPES.GASOLINE,
    fuelConsumption: 7.5,
    mileage: 55,
    market: MARKET_TYPES.LOCAL_DEALER,
    isNew: true,
    purchasePrice: 360000,
    estimatedValue: 360000
  },
  {
    id: 'LD020',
    licensePlate: '京F22222',
    brand: '奥迪',
    model: 'Q5L 45TFSI 豪华型 2024款',
    type: VEHICLE_TYPES.SUV,
    year: 2024,
    dailyRate: 620,
    fuelCostPerDay: 110,
    maintenanceCostPerDay: 45,
    popularity: 8,
    residualValue: 0.69,
    age: 0,
    fuelType: FUEL_TYPES.GASOLINE,
    fuelConsumption: 8.5,
    mileage: 45,
    market: MARKET_TYPES.LOCAL_DEALER,
    isNew: true,
    purchasePrice: 450000,
    estimatedValue: 450000
  },
  // 大众系列
  {
    id: 'LD021',
    licensePlate: '沪A11111',
    brand: '大众',
    model: '帕萨特 330TSI 精英版 2024款',
    type: VEHICLE_TYPES.SEDAN,
    year: 2024,
    dailyRate: 380,
    fuelCostPerDay: 85,
    maintenanceCostPerDay: 30,
    popularity: 8,
    residualValue: 0.72,
    age: 0,
    fuelType: FUEL_TYPES.GASOLINE,
    fuelConsumption: 6.8,
    mileage: 60,
    market: MARKET_TYPES.LOCAL_DEALER,
    isNew: true,
    purchasePrice: 240000,
    estimatedValue: 240000
  },
  {
    id: 'LD022',
    licensePlate: '沪A22222',
    brand: '大众',
    model: '途观L 330TSI 智享版 2024款',
    type: VEHICLE_TYPES.SUV,
    year: 2024,
    dailyRate: 400,
    fuelCostPerDay: 88,
    maintenanceCostPerDay: 32,
    popularity: 8,
    residualValue: 0.70,
    age: 0,
    fuelType: FUEL_TYPES.GASOLINE,
    fuelConsumption: 7.0,
    mileage: 55,
    market: MARKET_TYPES.LOCAL_DEALER,
    isNew: true,
    purchasePrice: 260000,
    estimatedValue: 260000
  },

  // ==================== 二手车市场车型 ====================
  {
    id: 'UC001',
    licensePlate: '沪B12345',
    brand: '丰田',
    model: '凯美瑞 2021款 2.5L',
    type: VEHICLE_TYPES.SEDAN,
    year: 2021,
    dailyRate: 280,
    fuelCostPerDay: 75,
    maintenanceCostPerDay: 30,
    popularity: 8,
    residualValue: 0.65,
    age: 3,
    fuelType: FUEL_TYPES.GASOLINE,
    fuelConsumption: 7.0,
    mileage: 45000,
    market: MARKET_TYPES.USED_CAR,
    isNew: false,
    condition: CONDITION_LEVELS.GOOD,
    purchasePrice: 0,
    estimatedValue: 143000
  },
  {
    id: 'UC002',
    licensePlate: '沪C67890',
    brand: '特斯拉',
    model: 'Model 3 标准续航 2022款',
    type: VEHICLE_TYPES.SEDAN,
    year: 2022,
    dailyRate: 380,
    fuelCostPerDay: 38,
    maintenanceCostPerDay: 25,
    popularity: 9,
    residualValue: 0.60,
    age: 2,
    fuelType: FUEL_TYPES.ELECTRIC,
    fuelConsumption: 12.5,
    mileage: 28000,
    market: MARKET_TYPES.USED_CAR,
    isNew: false,
    condition: CONDITION_LEVELS.EXCELLENT,
    purchasePrice: 0,
    estimatedValue: 168000
  },
  {
    id: 'UC003',
    licensePlate: '粤D11223',
    brand: '本田',
    model: 'CR-V 2020款 1.5T',
    type: VEHICLE_TYPES.SUV,
    year: 2020,
    dailyRate: 320,
    fuelCostPerDay: 85,
    maintenanceCostPerDay: 35,
    popularity: 7,
    residualValue: 0.58,
    age: 4,
    fuelType: FUEL_TYPES.GASOLINE,
    fuelConsumption: 7.3,
    mileage: 62000,
    market: MARKET_TYPES.USED_CAR,
    isNew: false,
    condition: CONDITION_LEVELS.GOOD,
    purchasePrice: 0,
    estimatedValue: 139200
  },
  {
    id: 'UC004',
    licensePlate: '浙E33445',
    brand: '宝马',
    model: '3系 325Li M运动 2021款',
    type: VEHICLE_TYPES.SEDAN,
    year: 2021,
    dailyRate: 480,
    fuelCostPerDay: 95,
    maintenanceCostPerDay: 50,
    popularity: 7,
    residualValue: 0.55,
    age: 3,
    fuelType: FUEL_TYPES.GASOLINE,
    fuelConsumption: 7.8,
    mileage: 38000,
    market: MARKET_TYPES.USED_CAR,
    isNew: false,
    condition: CONDITION_LEVELS.EXCELLENT,
    purchasePrice: 0,
    estimatedValue: 209000
  },
  {
    id: 'UC005',
    licensePlate: '苏F55667',
    brand: '比亚迪',
    model: '汉 EV 超长续航 2022款',
    type: VEHICLE_TYPES.SEDAN,
    year: 2022,
    dailyRate: 320,
    fuelCostPerDay: 33,
    maintenanceCostPerDay: 22,
    popularity: 8,
    residualValue: 0.68,
    age: 2,
    fuelType: FUEL_TYPES.ELECTRIC,
    fuelConsumption: 14,
    mileage: 25000,
    market: MARKET_TYPES.USED_CAR,
    isNew: false,
    condition: CONDITION_LEVELS.GOOD,
    purchasePrice: 0,
    estimatedValue: 163200
  },
  {
    id: 'UC006',
    licensePlate: '川G77889',
    brand: '奔驰',
    model: 'C260L 运动版 2021款',
    type: VEHICLE_TYPES.SEDAN,
    year: 2021,
    dailyRate: 520,
    fuelCostPerDay: 105,
    maintenanceCostPerDay: 55,
    popularity: 7,
    residualValue: 0.52,
    age: 3,
    fuelType: FUEL_TYPES.GASOLINE,
    fuelConsumption: 8.0,
    mileage: 42000,
    market: MARKET_TYPES.USED_CAR,
    isNew: false,
    condition: CONDITION_LEVELS.AVERAGE,
    purchasePrice: 0,
    estimatedValue: 187200
  },
  {
    id: 'UC007',
    licensePlate: '鲁H99001',
    brand: '大众',
    model: '途观L 330TSI 智享版 2022款',
    type: VEHICLE_TYPES.SUV,
    year: 2022,
    dailyRate: 350,
    fuelCostPerDay: 88,
    maintenanceCostPerDay: 32,
    popularity: 8,
    residualValue: 0.62,
    age: 2,
    fuelType: FUEL_TYPES.GASOLINE,
    fuelConsumption: 7.0,
    mileage: 32000,
    market: MARKET_TYPES.USED_CAR,
    isNew: false,
    condition: CONDITION_LEVELS.EXCELLENT,
    purchasePrice: 0,
    estimatedValue: 161200
  },
  {
    id: 'UC008',
    licensePlate: '粤J12345',
    brand: '奥迪',
    model: 'A4L 40TFSI 时尚 2020款',
    type: VEHICLE_TYPES.SEDAN,
    year: 2020,
    dailyRate: 420,
    fuelCostPerDay: 100,
    maintenanceCostPerDay: 45,
    popularity: 7,
    residualValue: 0.54,
    age: 4,
    fuelType: FUEL_TYPES.GASOLINE,
    fuelConsumption: 7.5,
    mileage: 55000,
    market: MARKET_TYPES.USED_CAR,
    isNew: false,
    condition: CONDITION_LEVELS.GOOD,
    purchasePrice: 0,
    estimatedValue: 172800
  },
  {
    id: 'UC009',
    licensePlate: '京K23456',
    brand: '蔚来',
    model: 'ES6 420KM 运动版 2020款',
    type: VEHICLE_TYPES.SUV,
    year: 2020,
    dailyRate: 400,
    fuelCostPerDay: 40,
    maintenanceCostPerDay: 30,
    popularity: 6,
    residualValue: 0.50,
    age: 4,
    fuelType: FUEL_TYPES.ELECTRIC,
    fuelConsumption: 17,
    mileage: 48000,
    market: MARKET_TYPES.USED_CAR,
    isNew: false,
    condition: CONDITION_LEVELS.GOOD,
    purchasePrice: 0,
    estimatedValue: 152000
  },
  {
    id: 'UC010',
    licensePlate: '沪L34567',
    brand: '理想',
    model: 'ONE 2021款 6座版',
    type: VEHICLE_TYPES.SUV,
    year: 2021,
    dailyRate: 450,
    fuelCostPerDay: 65,
    maintenanceCostPerDay: 35,
    popularity: 8,
    residualValue: 0.60,
    age: 3,
    fuelType: FUEL_TYPES.RANGE_EXTENDER,
    fuelConsumption: 8.0,
    mileage: 35000,
    market: MARKET_TYPES.USED_CAR,
    isNew: false,
    condition: CONDITION_LEVELS.EXCELLENT,
    purchasePrice: 0,
    estimatedValue: 189000
  },
  {
    id: 'UC011',
    licensePlate: '粤M45678',
    brand: '小鹏',
    model: 'P7 562E 性能版 2022款',
    type: VEHICLE_TYPES.SEDAN,
    year: 2022,
    dailyRate: 350,
    fuelCostPerDay: 38,
    maintenanceCostPerDay: 25,
    popularity: 7,
    residualValue: 0.55,
    age: 2,
    fuelType: FUEL_TYPES.ELECTRIC,
    fuelConsumption: 14,
    mileage: 22000,
    market: MARKET_TYPES.USED_CAR,
    isNew: false,
    condition: CONDITION_LEVELS.GOOD,
    purchasePrice: 0,
    estimatedValue: 145600
  },
  {
    id: 'UC012',
    licensePlate: '浙N56789',
    brand: '雷克萨斯',
    model: 'ES200 卓越版 2021款',
    type: VEHICLE_TYPES.SEDAN,
    year: 2021,
    dailyRate: 480,
    fuelCostPerDay: 90,
    maintenanceCostPerDay: 38,
    popularity: 8,
    residualValue: 0.72,
    age: 3,
    fuelType: FUEL_TYPES.GASOLINE,
    fuelConsumption: 6.0,
    mileage: 30000,
    market: MARKET_TYPES.USED_CAR,
    isNew: false,
    condition: CONDITION_LEVELS.EXCELLENT,
    purchasePrice: 0,
    estimatedValue: 259200
  },

  // ==================== 海外进口市场车型（独家超跑、豪华车、古董车） ====================
  {
    id: 'OS001',
    licensePlate: '京Z00001',
    brand: '法拉利',
    model: 'Roma 3.9T V8 2024款',
    type: VEHICLE_TYPES.SUPERCAR,
    year: 2024,
    dailyRate: 3500,
    fuelCostPerDay: 250,
    maintenanceCostPerDay: 200,
    popularity: 6,
    residualValue: 0.85,
    age: 0,
    fuelType: FUEL_TYPES.GASOLINE,
    fuelConsumption: 10.5,
    mileage: 20,
    market: MARKET_TYPES.OVERSEAS,
    isNew: true,
    isExclusive: true,
    purchasePrice: 2760000,
    estimatedValue: 2760000
  },
  {
    id: 'OS002',
    licensePlate: '京Z00002',
    brand: '兰博基尼',
    model: 'Huracán EVO 5.2L V10 2024款',
    type: VEHICLE_TYPES.SUPERCAR,
    year: 2024,
    dailyRate: 4000,
    fuelCostPerDay: 280,
    maintenanceCostPerDay: 220,
    popularity: 6,
    residualValue: 0.83,
    age: 0,
    fuelType: FUEL_TYPES.GASOLINE,
    fuelConsumption: 11.2,
    mileage: 15,
    market: MARKET_TYPES.OVERSEAS,
    isNew: true,
    isExclusive: true,
    purchasePrice: 3500000,
    estimatedValue: 3500000
  },
  {
    id: 'OS003',
    licensePlate: '京Z00003',
    brand: '保时捷',
    model: '911 Carrera S 3.0T 2024款',
    type: VEHICLE_TYPES.SPORTS,
    year: 2024,
    dailyRate: 1800,
    fuelCostPerDay: 150,
    maintenanceCostPerDay: 120,
    popularity: 7,
    residualValue: 0.80,
    age: 0,
    fuelType: FUEL_TYPES.GASOLINE,
    fuelConsumption: 9.0,
    mileage: 30,
    market: MARKET_TYPES.OVERSEAS,
    isNew: true,
    isExclusive: true,
    purchasePrice: 1680000,
    estimatedValue: 1680000
  },
  {
    id: 'OS004',
    licensePlate: '京Z00004',
    brand: '宾利',
    model: '欧陆 GT V8 4.0T 2024款',
    type: VEHICLE_TYPES.LUXURY,
    year: 2024,
    dailyRate: 2500,
    fuelCostPerDay: 200,
    maintenanceCostPerDay: 180,
    popularity: 5,
    residualValue: 0.78,
    age: 0,
    fuelType: FUEL_TYPES.GASOLINE,
    fuelConsumption: 12.0,
    mileage: 25,
    market: MARKET_TYPES.OVERSEAS,
    isNew: true,
    isExclusive: true,
    purchasePrice: 3200000,
    estimatedValue: 3200000
  },
  {
    id: 'OS005',
    licensePlate: '京Z00005',
    brand: '迈凯伦',
    model: '720S 4.0T V8 2024款',
    type: VEHICLE_TYPES.SUPERCAR,
    year: 2024,
    dailyRate: 3800,
    fuelCostPerDay: 260,
    maintenanceCostPerDay: 210,
    popularity: 5,
    residualValue: 0.82,
    age: 0,
    fuelType: FUEL_TYPES.GASOLINE,
    fuelConsumption: 11.5,
    mileage: 18,
    market: MARKET_TYPES.OVERSEAS,
    isNew: true,
    isExclusive: true,
    purchasePrice: 4000000,
    estimatedValue: 4000000
  },
  {
    id: 'OS006',
    licensePlate: '京Z00006',
    brand: '劳斯莱斯',
    model: '魅影 6.6T 双门轿跑 2024款',
    type: VEHICLE_TYPES.LUXURY,
    year: 2024,
    dailyRate: 5000,
    fuelCostPerDay: 300,
    maintenanceCostPerDay: 250,
    popularity: 4,
    residualValue: 0.88,
    age: 0,
    fuelType: FUEL_TYPES.GASOLINE,
    fuelConsumption: 14.0,
    mileage: 10,
    market: MARKET_TYPES.OVERSEAS,
    isNew: true,
    isExclusive: true,
    purchasePrice: 6800000,
    estimatedValue: 6800000
  },
  {
    id: 'OS007',
    licensePlate: '京Z00007',
    brand: '阿斯顿·马丁',
    model: 'DB12 Volante 4.0T 2024款',
    type: VEHICLE_TYPES.SUPERCAR,
    year: 2024,
    dailyRate: 2800,
    fuelCostPerDay: 220,
    maintenanceCostPerDay: 190,
    popularity: 5,
    residualValue: 0.79,
    age: 0,
    fuelType: FUEL_TYPES.GASOLINE,
    fuelConsumption: 11.0,
    mileage: 22,
    market: MARKET_TYPES.OVERSEAS,
    isNew: true,
    isExclusive: true,
    purchasePrice: 2980000,
    estimatedValue: 2980000
  },
  {
    id: 'OS008',
    licensePlate: '京Z00008',
    brand: '玛莎拉蒂',
    model: 'MC20 Cielo 3.0T 2024款',
    type: VEHICLE_TYPES.SUPERCAR,
    year: 2024,
    dailyRate: 2600,
    fuelCostPerDay: 200,
    maintenanceCostPerDay: 170,
    popularity: 5,
    residualValue: 0.76,
    age: 0,
    fuelType: FUEL_TYPES.GASOLINE,
    fuelConsumption: 10.5,
    mileage: 28,
    market: MARKET_TYPES.OVERSEAS,
    isNew: true,
    isExclusive: true,
    purchasePrice: 2680000,
    estimatedValue: 2680000
  },
  {
    id: 'OS009',
    licensePlate: '京Z00009',
    brand: '路虎',
    model: '揽胜 5.0L V8 创世加长版 2024款',
    type: VEHICLE_TYPES.SUV,
    year: 2024,
    dailyRate: 1500,
    fuelCostPerDay: 180,
    maintenanceCostPerDay: 150,
    popularity: 7,
    residualValue: 0.75,
    age: 0,
    fuelType: FUEL_TYPES.GASOLINE,
    fuelConsumption: 13.5,
    mileage: 35,
    market: MARKET_TYPES.OVERSEAS,
    isNew: true,
    isExclusive: true,
    purchasePrice: 2400000,
    estimatedValue: 2400000
  },
  {
    id: 'OS010',
    licensePlate: '京Z00010',
    brand: '奔驰',
    model: 'AMG GT 63 4MATIC+ 2024款',
    type: VEHICLE_TYPES.SPORTS,
    year: 2024,
    dailyRate: 1600,
    fuelCostPerDay: 165,
    maintenanceCostPerDay: 140,
    popularity: 6,
    residualValue: 0.77,
    age: 0,
    fuelType: FUEL_TYPES.GASOLINE,
    fuelConsumption: 12.0,
    mileage: 40,
    market: MARKET_TYPES.OVERSEAS,
    isNew: true,
    isExclusive: true,
    purchasePrice: 1980000,
    estimatedValue: 1980000
  },
  {
    id: 'OS011',
    licensePlate: '京Z00011',
    brand: '宾利',
    model: '飞驰 4.0T V8 雅度版 2024款',
    type: VEHICLE_TYPES.LUXURY,
    year: 2024,
    dailyRate: 2200,
    fuelCostPerDay: 190,
    maintenanceCostPerDay: 170,
    popularity: 5,
    residualValue: 0.80,
    age: 0,
    fuelType: FUEL_TYPES.GASOLINE,
    fuelConsumption: 11.5,
    mileage: 20,
    market: MARKET_TYPES.OVERSEAS,
    isNew: true,
    isExclusive: true,
    purchasePrice: 3580000,
    estimatedValue: 3580000
  },
  {
    id: 'OS012',
    licensePlate: '沪Z88888',
    brand: '法拉利',
    model: 'SF90 Stradale 4.0T V8 插电混动 2024款',
    type: VEHICLE_TYPES.SUPERCAR,
    year: 2024,
    dailyRate: 5500,
    fuelCostPerDay: 320,
    maintenanceCostPerDay: 280,
    popularity: 4,
    residualValue: 0.90,
    age: 0,
    fuelType: FUEL_TYPES.PLUGIN_HYBRID,
    fuelConsumption: 9.0,
    mileage: 10,
    market: MARKET_TYPES.OVERSEAS,
    isNew: true,
    isExclusive: true,
    purchasePrice: 5800000,
    estimatedValue: 5800000
  }
];

/**
 * 根据市场类型获取车辆列表
 * @param {string} marketType - 市场类型
 * @returns {Array} 该市场的车辆列表
 * 
 * API替换指引：
 * 此函数可替换为API调用：GET /api/vehicles?market={marketType}
 */
function getVehiclesByMarket(marketType) {
  // API替换示例：
  // const response = await fetch(`/api/vehicles?market=${marketType}`);
  // return await response.json();
  
  return vehicleDatabase.filter(v => v.market === marketType);
}

/**
 * 获取所有车辆列表
 * @returns {Array} 所有车辆
 * 
 * API替换指引：
 * 此函数可替换为API调用：GET /api/vehicles
 */
function getAllVehicles() {
  // API替换示例：
  // const response = await fetch('/api/vehicles');
  // return await response.json();
  
  return [...vehicleDatabase];
}

/**
 * 根据ID获取车辆信息
 * @param {string} vehicleId - 车辆ID
 * @returns {Object|null} 车辆信息或null
 * 
 * API替换指引：
 * 此函数可替换为API调用：GET /api/vehicles/{vehicleId}
 */
function getVehicleById(vehicleId) {
  // API替换示例：
  // const response = await fetch(`/api/vehicles/${vehicleId}`);
  // return await response.json();
  
  return vehicleDatabase.find(v => v.id === vehicleId) || null;
}

/**
 * 计算车辆当前价值（用于二手车）
 * 基于保值率、车辆状况、公里数等因素
 * @param {Object} vehicle - 车辆对象
 * @returns {number} 估算的当前价值（元）
 */
function calculateVehicleValue(vehicle) {
  if (vehicle.isNew) {
    return vehicle.purchasePrice || vehicle.estimatedValue;
  }
  
  const estimatedNewPrice = vehicle.purchasePrice || vehicle.estimatedValue * 3;
  
  let value = estimatedNewPrice * vehicle.residualValue;
  
  const conditionMultipliers = {
    [CONDITION_LEVELS.EXCELLENT]: 1.0,
    [CONDITION_LEVELS.GOOD]: 0.9,
    [CONDITION_LEVELS.AVERAGE]: 0.75,
    [CONDITION_LEVELS.POOR]: 0.55
  };
  const conditionMultiplier = conditionMultipliers[vehicle.condition] || 0.8;
  value *= conditionMultiplier;
  
  const mileageDepreciation = Math.min((vehicle.mileage / 10000) * 0.02, 0.20);
  value *= (1 - mileageDepreciation);
  
  return Math.round(value);
}

/**
 * 获取市场信息
 * @returns {Object} 市场配置信息
 */
function getMarketInfo() {
  return {
    [MARKET_TYPES.LOCAL_DEALER]: {
      id: MARKET_TYPES.LOCAL_DEALER,
      name: '本地经销商',
      subtitle: '一手新车',
      description: '批量采购享95折优惠，即时交付',
      discount: 0.95,
      deliveryTime: '即时交付',
      color: '#3498db',
      bgColor: 'rgba(52, 152, 219, 0.1)',
      icon: '🏪'
    },
    [MARKET_TYPES.USED_CAR]: {
      id: MARKET_TYPES.USED_CAR,
      name: '二手车市场',
      subtitle: '认证二手车',
      description: '价格实惠，重点标注保值率',
      discount: 1.0,
      deliveryTime: '1-3个工作日',
      color: '#e67e22',
      bgColor: 'rgba(230, 126, 34, 0.1)',
      icon: '🚗',
      highlightResidualValue: true
    },
    [MARKET_TYPES.OVERSEAS]: {
      id: MARKET_TYPES.OVERSEAS,
      name: '海外进口市场',
      subtitle: '独家超跑·超豪华车·古董车',
      description: '海外直采，独一无二的车型',
      discount: 1.1,
      deliveryTime: '15-30个工作日',
      color: '#9b59b6',
      bgColor: 'rgba(155, 89, 182, 0.1)',
      icon: '🌍',
      isExclusive: true
    }
  };
}

/**
 * 获取能源类型标签信息
 * @param {string} fuelType - 能源类型
 * @returns {Object} 标签信息
 */
function getFuelTypeInfo(fuelType) {
  const fuelTypeMap = {
    [FUEL_TYPES.GASOLINE]: { text: '汽油', color: '#e74c3c', icon: '⛽' },
    [FUEL_TYPES.DIESEL]: { text: '柴油', color: '#34495e', icon: '🚛' },
    [FUEL_TYPES.ELECTRIC]: { text: '纯电', color: '#27ae60', icon: '🔋' },
    [FUEL_TYPES.PLUGIN_HYBRID]: { text: '插电混动', color: '#f39c12', icon: '🔌' },
    [FUEL_TYPES.RANGE_EXTENDER]: { text: '增程', color: '#16a085', icon: '⚡' },
    [FUEL_TYPES.HYBRID]: { text: '混动', color: '#1abc9c', icon: '🌿' }
  };
  return fuelTypeMap[fuelType] || { text: fuelType, color: '#95a5a6', icon: '❓' };
}

/**
 * 获取车辆类型标签
 * @param {string} type - 车辆类型
 * @returns {Object} 类型信息
 */
function getVehicleTypeInfo(type) {
  const typeMap = {
    [VEHICLE_TYPES.SEDAN]: { text: '轿车', color: '#3498db' },
    [VEHICLE_TYPES.SUV]: { text: 'SUV', color: '#2ecc71' },
    [VEHICLE_TYPES.SPORTS]: { text: '跑车', color: '#e74c3c' },
    [VEHICLE_TYPES.MPV]: { text: 'MPV', color: '#9b59b6' },
    [VEHICLE_TYPES.COMPACT]: { text: '紧凑型', color: '#f39c12' },
    [VEHICLE_TYPES.LUXURY]: { text: '豪华车', color: '#1abc9c' },
    [VEHICLE_TYPES.SUPERCAR]: { text: '超跑', color: '#e74c3c' },
    [VEHICLE_TYPES.WAGON]: { text: '旅行车', color: '#34495e' },
    [VEHICLE_TYPES.PICKUP]: { text: '皮卡', color: '#795548' }
  };
  return typeMap[type] || { text: type, color: '#95a5a6' };
}

/**
 * 获取保值率显示信息
 * @param {number} residualValue - 保值率（0-1）
 * @returns {Object} 保值率信息
 */
function getResidualValueInfo(residualValue) {
  const percentage = Math.round(residualValue * 100);
  let level, color;
  
  if (percentage >= 80) {
    level = '优秀';
    color = '#27ae60';
  } else if (percentage >= 65) {
    level = '良好';
    color = '#3498db';
  } else if (percentage >= 50) {
    level = '一般';
    color = '#f39c12';
  } else {
    level = '较差';
    color = '#e74c3c';
  }
  
  return { percentage, level, color };
}

/**
 * 计算批量采购折扣价格
 * @param {number} basePrice - 基础价格
 * @param {number} quantity - 采购数量
 * @param {string} marketType - 市场类型
 * @returns {number} 折后价格
 */
function calculateDiscountedPrice(basePrice, quantity, marketType) {
  let discount = 1.0;
  
  if (marketType === MARKET_TYPES.LOCAL_DEALER) {
    if (quantity >= 10) {
      discount = 0.90;
    } else if (quantity >= 5) {
      discount = 0.93;
    } else if (quantity >= 3) {
      discount = 0.95;
    }
  } else if (marketType === MARKET_TYPES.OVERSEAS) {
    discount = 1.1;
  }
  
  return Math.round(basePrice * discount);
}

// 导出供外部使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    vehicleDatabase,
    FUEL_TYPES,
    VEHICLE_TYPES,
    MARKET_TYPES,
    CONDITION_LEVELS,
    getVehiclesByMarket,
    getAllVehicles,
    getVehicleById,
    calculateVehicleValue,
    getMarketInfo,
    getFuelTypeInfo,
    getVehicleTypeInfo,
    getResidualValueInfo,
    calculateDiscountedPrice
  };
}
