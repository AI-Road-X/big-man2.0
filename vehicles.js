/**
 * 车辆数据库 - 租车公司模拟游戏
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
  SUPERCAR: '超跑'
};

// 市场分类常量
const MARKET_TYPES = {
  LOCAL_DEALER: 'local',      // 本地经销商（一手车）
  USED_CAR: 'used',           // 二手车市场
  OVERSEAS: 'overseas'        // 海外进口市场（独家超跑）
};

/**
 * 车辆数据库
 * 包含2023-2026年常见车型
 * 
 * 字段说明：
 * - id: 车辆唯一标识
 * - licensePlate: 车牌号（格式：省份+字母+5位数字）
 * - brand: 品牌
 * - model: 车型
 * - type: 车辆类型（轿车/SUV/跑车/MPV等）
 * - year: 生产年份
 * - dailyRate: 日租金（元/天）
 * - fuelCostPerDay: 每日燃油/电耗成本（元）
 * - maintenanceCostPerDay: 每日维护成本（元）
 * - popularity: 人气指数（1-10）
 * - residualValue: 保值率（百分比，如0.85表示85%保值率）
 * - age: 车龄（年）
 * - fuelType: 能源类型（汽油/柴油/纯电/插混/增程/混动）
 * - fuelConsumption: 油耗（L/100km）或电耗（kWh/100km）
 * - mileage: 当前公里数
 * - market: 可购买的市场（local/used/overseas）
 * - isNew: 是否为新车（用于区分一手/二手车）
 */
const vehicleDatabase = [
  // ==================== 本地经销商车型（一手车） ====================
  {
    id: 'LD001',
    licensePlate: '京A88888',
    brand: '丰田',
    model: '凯美瑞 2024款',
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
    isNew: true
  },
  {
    id: 'LD002',
    licensePlate: '京A66666',
    brand: '特斯拉',
    model: 'Model 3 2024款',
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
    isNew: true
  },
  {
    id: 'LD003',
    licensePlate: '京A55555',
    brand: '本田',
    model: 'CR-V 2024款',
    type: VEHICLE_TYPES.SUV,
    year: 2024,
    dailyRate: 400,
    fuelCostPerDay: 90,
    maintenanceCostPerDay: 30,
    popularity: 8,
    residualValue: 0.78,
    age: 0,
    fuelType: FUEL_TYPES.HYBRID,
    fuelConsumption: 5.2,
    mileage: 80,
    market: MARKET_TYPES.LOCAL_DEALER,
    isNew: true
  },
  {
    id: 'LD004',
    licensePlate: '京A33333',
    brand: '宝马',
    model: '3系 2024款',
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
    isNew: true
  },
  {
    id: 'LD005',
    licensePlate: '京A22222',
    brand: '比亚迪',
    model: '汉 EV 2025款',
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
    isNew: true
  },
  {
    id: 'LD006',
    licensePlate: '京A99999',
    brand: '奥迪',
    model: 'Q5L 2024款',
    type: VEHICLE_TYPES.SUV,
    year: 2024,
    dailyRate: 550,
    fuelCostPerDay: 110,
    maintenanceCostPerDay: 45,
    popularity: 8,
    residualValue: 0.70,
    age: 0,
    fuelType: FUEL_TYPES.GASOLINE,
    fuelConsumption: 8.5,
    mileage: 45,
    market: MARKET_TYPES.LOCAL_DEALER,
    isNew: true
  },

  // ==================== 二手车市场车型 ====================
  {
    id: 'UC001',
    licensePlate: '京B12345',
    brand: '丰田',
    model: '凯美瑞 2021款',
    type: VEHICLE_TYPES.SEDAN,
    year: 2021,
    dailyRate: 280,
    fuelCostPerDay: 75,
    maintenanceCostPerDay: 30,
    popularity: 8,
    residualValue: 0.65,
    age: 3,
    fuelType: FUEL_TYPES.GASOLINE,
    fuelConsumption: 7.2,
    mileage: 45000,
    market: MARKET_TYPES.USED_CAR,
    isNew: false,
    condition: '良好' // 车辆状况：优秀/良好/一般/较差
  },
  {
    id: 'UC002',
    licensePlate: '沪C67890',
    brand: '特斯拉',
    model: 'Model 3 2022款',
    type: VEHICLE_TYPES.SEDAN,
    year: 2022,
    dailyRate: 380,
    fuelCostPerDay: 38,
    maintenanceCostPerDay: 25,
    popularity: 9,
    residualValue: 0.60,
    age: 2,
    fuelType: FUEL_TYPES.ELECTRIC,
    fuelConsumption: 13,
    mileage: 28000,
    market: MARKET_TYPES.USED_CAR,
    isNew: false,
    condition: '优秀'
  },
  {
    id: 'UC003',
    licensePlate: '粤D11223',
    brand: '本田',
    model: 'CR-V 2020款',
    type: VEHICLE_TYPES.SUV,
    year: 2020,
    dailyRate: 320,
    fuelCostPerDay: 85,
    maintenanceCostPerDay: 35,
    popularity: 7,
    residualValue: 0.58,
    age: 4,
    fuelType: FUEL_TYPES.GASOLINE,
    fuelConsumption: 7.5,
    mileage: 62000,
    market: MARKET_TYPES.USED_CAR,
    isNew: false,
    condition: '良好'
  },
  {
    id: 'UC004',
    licensePlate: '浙E33445',
    brand: '宝马',
    model: '3系 2021款',
    type: VEHICLE_TYPES.SEDAN,
    year: 2021,
    dailyRate: 480,
    fuelCostPerDay: 95,
    maintenanceCostPerDay: 50,
    popularity: 7,
    residualValue: 0.55,
    age: 3,
    fuelType: FUEL_TYPES.GASOLINE,
    fuelConsumption: 8.2,
    mileage: 38000,
    market: MARKET_TYPES.USED_CAR,
    isNew: false,
    condition: '优秀'
  },
  {
    id: 'UC005',
    licensePlate: '苏F55667',
    brand: '比亚迪',
    model: '汉 EV 2022款',
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
    condition: '良好'
  },
  {
    id: 'UC006',
    licensePlate: '川G77889',
    brand: '奔驰',
    model: 'C级 2021款',
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
    condition: '一般'
  },
  {
    id: 'UC007',
    licensePlate: '鲁H99001',
    brand: '大众',
    model: '途观L 2022款',
    type: VEHICLE_TYPES.SUV,
    year: 2022,
    dailyRate: 350,
    fuelCostPerDay: 88,
    maintenanceCostPerDay: 32,
    popularity: 8,
    residualValue: 0.62,
    age: 2,
    fuelType: FUEL_TYPES.GASOLINE,
    fuelConsumption: 7.8,
    mileage: 32000,
    market: MARKET_TYPES.USED_CAR,
    isNew: false,
    condition: '优秀'
  },

  // ==================== 海外进口市场车型（独家超跑、豪华车） ====================
  {
    id: 'OS001',
    licensePlate: '京Z00001',
    brand: '法拉利',
    model: 'Roma 2024款',
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
    isExclusive: true
  },
  {
    id: 'OS002',
    licensePlate: '京Z00002',
    brand: '兰博基尼',
    model: 'Huracán 2024款',
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
    isExclusive: true
  },
  {
    id: 'OS003',
    licensePlate: '京Z00003',
    brand: '保时捷',
    model: '911 Carrera 2024款',
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
    isExclusive: true
  },
  {
    id: 'OS004',
    licensePlate: '京Z00004',
    brand: '宾利',
    model: '欧陆 GT 2024款',
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
    isExclusive: true
  },
  {
    id: 'OS005',
    licensePlate: '京Z00005',
    brand: '迈凯伦',
    model: '720S 2024款',
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
    isExclusive: true
  },
  {
    id: 'OS006',
    licensePlate: '京Z00006',
    brand: '劳斯莱斯',
    model: '魅影 2024款',
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
    isExclusive: true
  }
];

/**
 * 根据市场类型获取车辆列表
 * @param {string} marketType - 市场类型 (local/used/overseas)
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
 * 计算二手车当前价值
 * 基于保值率、车辆状况、公里数等因素
 * @param {Object} vehicle - 车辆对象
 * @returns {number} 估算的当前价值（元）
 * 
 * 计算公式：
 * 基础价值 = 新车价格 * 保值率
 * 状况系数 = 优秀:1.0, 良好:0.9, 一般:0.75, 较差:0.55
 * 公里数折损 = 每万公里折损2%
 */
function calculateUsedCarValue(vehicle) {
  if (vehicle.isNew) {
    return null; // 新车不计算二手价值
  }
  
  // 获取同型号新车参考价（简化计算，这里用日租金估算）
  const estimatedNewPrice = vehicle.dailyRate * 365 * 3; // 假设3年回本
  
  // 基础保值价值
  let value = estimatedNewPrice * vehicle.residualValue;
  
  // 状况系数
  const conditionMultipliers = {
    '优秀': 1.0,
    '良好': 0.9,
    '一般': 0.75,
    '较差': 0.55
  };
  const conditionMultiplier = conditionMultipliers[vehicle.condition] || 0.8;
  value *= conditionMultiplier;
  
  // 公里数折损（每万公里折损2%，最高折损20%）
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
      name: '本地经销商',
      description: '一手新车，批量采购有优惠',
      discount: 0.95, // 批量采购95折
      deliveryTime: '即时交付',
      color: '#3498db',
      icon: '🏪'
    },
    [MARKET_TYPES.USED_CAR]: {
      name: '二手车市场',
      description: '各类二手车，价格实惠',
      discount: 1.0,
      deliveryTime: '1-3个工作日',
      color: '#e67e22',
      icon: '🚗',
      highlightResidualValue: true // 重点标注保值率
    },
    [MARKET_TYPES.OVERSEAS]: {
      name: '海外进口市场',
      description: '独家超跑、超豪华车，海外直采',
      discount: 1.1, // 进口税等附加费用
      deliveryTime: '15-30个工作日',
      color: '#9b59b6',
      icon: '🌍',
      isExclusive: true
    }
  };
}

/**
 * 格式化车牌显示
 * @param {string} plate - 车牌号
 * @returns {string} 格式化后的车牌（带颜色）
 */
function formatLicensePlate(plate) {
  return plate;
}

/**
 * 获取能源类型标签
 * @param {string} fuelType - 能源类型
 * @returns {Object} 标签信息 {text, color}
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

// 导出供外部使用（支持模块化）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    vehicleDatabase,
    FUEL_TYPES,
    VEHICLE_TYPES,
    MARKET_TYPES,
    getVehiclesByMarket,
    getVehicleById,
    calculateUsedCarValue,
    getMarketInfo,
    formatLicensePlate,
    getFuelTypeInfo
  };
}
