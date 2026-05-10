# 租车公司模拟游戏 - 技术架构文档

## 1. 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                        前端层 (Frontend)                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   HTML 页面     │  │   CSS 样式      │  │  JavaScript  │ │
│  │   控制面板DOM   │  │   面板样式      │  │  Three.js 3D │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                        3D渲染层 (Three.js Core)             │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  场景(Scene) │  │  相机(Camera)│  │  渲染器(Renderer)│   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                        交互控制层                            │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────┐  ┌────────────────────┐   │
│  │  OrbitControls 轨道控制器     │  │  事件监听          │   │
│  │  - 拖拽旋转                   │  │  - 窗口resize      │   │
│  │  - 滚轮缩放                   │  │  - 动画循环        │   │
│  └──────────────────────────────┘  └────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                        资源层                                │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  几何体       │  │  材质        │  │  纹理/Canvas     │   │
│  │  - 地面网格   │  │  - 网点材质   │  │  - 文字精灵图   │   │
│  │  - 立方体     │  │  - 发光边缘  │  │                  │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 技术栈说明

| 技术 | 版本/来源 | 用途 |
|------|-----------|------|
| Three.js | r128 (CDN) | 3D渲染引擎 |
| OrbitControls | Three.js插件 | 相机轨道控制 |
| ES6 JavaScript | 原生 | 游戏逻辑 |
| HTML5 Canvas | 原生 | 文字渲染 |
| CSS3 | 原生 | UI面板样式 |

---

## 3. 核心模块设计

### 3.1 场景管理器 (SceneManager)

```javascript
class SceneManager {
  // 职责：管理Three.js场景生命周期
  // - 创建场景、相机、渲染器
  // - 处理窗口resize
  // - 启动渲染循环
}
```

### 3.2 网点管理器 (OutletManager)

```javascript
class OutletManager {
  // 职责：管理租赁网点
  // - 生成5个随机位置网点
  // - 创建立方体模型
  // - 创建文字标签
  // - 分配不同颜色
}
```

### 3.3 UI控制器 (UIController)

```javascript
class UIController {
  // 职责：管理HTML控制面板
  // - 初始化面板DOM
  // - 更新显示数据
  // - 格式化货币显示
}
```

### 3.4 游戏状态 (GameState)

```javascript
const gameState = {
  cash: 1000000,      // 初始现金100万
  totalFleet: 0,       // 初始车队0
  currentMonth: 1,     // 当前月份
  outlets: []          // 网点数组
};
```

---

## 4. 文件结构

```
/workspace/
├── index.html          # 主文件，包含所有代码
│   ├── <style>         # 内嵌CSS样式
│   ├── <body>          # HTML结构
│   │   └── 控制面板DOM
│   └── <script>        # 游戏逻辑
│       ├── Three.js CDN引入
│       ├── OrbitControls CDN引入
│       ├── 游戏初始化
│       ├── 场景创建
│       ├── 网点生成
│       └── 动画循环
└── .trae/
    └── documents/
        ├── PRD.md           # 产品需求文档
        └── ARCHITECTURE.md  # 本文档
```

---

## 5. Three.js 关键配置

### 5.1 相机设置

```javascript
camera = new THREE.PerspectiveCamera(
  60,                                    // 视野角度
  window.innerWidth / window.innerHeight, // 宽高比
  0.1,                                   // 近裁切面
  1000                                   // 远裁切面
);
camera.position.set(80, 80, 80);         // 俯视斜角位置
camera.lookAt(0, 0, 0);                 // 看向中心
```

### 5.2 OrbitControls 配置

```javascript
controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;           // 阻尼效果
controls.dampingFactor = 0.05;          // 阻尼系数
controls.minDistance = 30;              // 最小缩放距离
controls.maxDistance = 200;             // 最大缩放距离
controls.maxPolarAngle = Math.PI / 2;   // 限制俯视角度
```

### 5.3 光照设置

```javascript
ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(50, 100, 50);
```

---

## 6. 网点生成算法

### 6.1 位置生成

```javascript
function generateRandomPosition(existingPositions, minDistance = 25) {
  let position;
  let attempts = 0;
  do {
    position = {
      x: Math.random() * 100 - 50,  // -50 到 50
      z: Math.random() * 100 - 50   // -50 到 50
    };
    attempts++;
  } while (isTooClose(position, existingPositions, minDistance) && attempts < 100);
  return position;
}
```

### 6.2 颜色分配

```javascript
const outletColors = [
  0x3498db,  // 蓝色
  0xe74c3c,  // 红色
  0x2ecc71,  // 绿色
  0xf39c12,  // 橙色
  0x9b59b6   // 紫色
];
```

---

## 7. 3D文字标签实现

### 7.1 Canvas文字绘制

```javascript
function createTextSprite(text) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  // 绘制文字
  context.font = 'bold 48px Arial';
  context.fillStyle = '#ffffff';
  context.textAlign = 'center';
  context.fillText(text, canvas.width/2, canvas.height/2);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMaterial);
  return sprite;
}
```

---

## 8. 控制面板HTML结构

```html
<div id="control-panel">
  <h2>🚗 租车公司</h2>
  <div class="stat">
    <span class="label">当前月份</span>
    <span class="value" id="month">1月</span>
  </div>
  <div class="stat">
    <span class="label">公司现金</span>
    <span class="value" id="cash">¥1,000,000</span>
  </div>
  <div class="stat">
    <span class="label">总车队数量</span>
    <span class="value" id="fleet">0 辆</span>
  </div>
</div>
```

---

## 9. 性能优化

| 优化项 | 实现方式 |
|--------|----------|
| 渲染优化 | requestAnimationFrame 控制帧率 |
| 内存管理 | 复用几何体和材质 |
| 响应式 | window.resize 事件防抖 |
| 3D性能 | 简化几何体面数 |

---

## 10. 浏览器兼容性

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

---

## 11. 后续扩展预留

当前版本为基础框架，预留以下扩展接口：

- 网点点击交互
- 车辆模型添加
- 时间推进系统
- 经济系统
- 成就系统
