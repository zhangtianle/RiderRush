# SDD 技术文档
## 外卖冲冲冲 - 微信小游戏

文档版本：v1.0
创建日期：2026-04-24
最后更新：2026-04-24

---

## 一、技术架构

### 1.1 技术选型

| 技术层 | 选型 | 理由 |
|--------|------|------|
| **游戏引擎** | Cocos Creator | 可视化编辑、跨平台、社区丰富 |
| **开发语言** | TypeScript | 类型安全、IDE支持好 |
| **数据格式** | JSON | 关卡配置、易于扩展 |
| **版本管理** | Git + GitHub | 标准、免费 |
| **构建工具** | Cocos Creator内置 | 一体化 |

### 1.2 系统架构图

```
┌─────────────────────────────────────────────────────┐
│                    游戏整体架构                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────┐    ┌─────────────┐                │
│  │  UI Layer   │───▶│ Game Engine │                │
│  │             │    │             │                │
│  │ - MenuScene │    │ - RiderMgr  │                │
│  │ - GameScene │    │ - LevelMgr  │                │
│  │ - ResultUI  │    │ - Collision │                │
│  └─────────────┘    └─────────────┘                │
│         │                  │                        │
│         │                  │                        │
│         ▼                  ▼                        │
│  ┌─────────────┐    ┌─────────────┐                │
│  │  Data Layer │    │  Core Logic │                │
│  │             │    │             │                │
│  │ - levels.js │    │ - Rider     │                │
│  │ - riders.js │    │ - Obstacle  │                │
│  │ - config.js │    │ - Level     │                │
│  └─────────────┘    └─────────────┘                │
│         │                  │                        │
│         │                  │                        │
│         ▼                  ▼                        │
│  ┌─────────────┐    ┌─────────────┐                │
│  │   Assets    │    │   Platform  │                │
│  │             │    │             │                │
│  │ - images    │    │ - WeChat SDK│                │
│  │ - audio     │    │ - Ad SDK    │                │
│  │ - fonts     │    │ - Share SDK │                │
│  └─────────────┘    └─────────────┘                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 二、目录结构

```
i_game/
│
├── docs/                           # 开发文档
│   ├── SDD_需求文档.md
│   ├── SDD_设计文档.md
│   ├── SDD_技术文档.md
│   ├── 开发计划.md
│   └── 版本管理.md
│
├── src/                            # 源代码
│   │
│   ├── core/                       # 核心逻辑
│   │   ├── Rider.ts                # 韦手实体类
│   │   ├── Obstacle.ts             # 阻碍实体类
│   │   ├── Level.ts                # 关卡管理类
│   │   ├── GameEngine.ts           # 游戏主引擎
│   │   ├── CollisionDetector.ts    # 碰撞检测器
│   │   └── EventBus.ts             # 事件总线
│   │
│   ├── ui/                         # UI组件
│   │   ├── MenuScene.ts            # 主菜单场景
│   │   ├── LevelSelectScene.ts     # 关卡选择场景
│   │   ├── GameScene.ts            # 游戏主场景
│   │   ├── ResultPanel.ts          # 结算面板
│   │   ├── FailPanel.ts            # 失败面板
│   │   └── HUD.ts                  # 游戏内HUD
│   │
│   ├── data/                       # 数据配置
│   │   ├── levels.json             # 关卡数据
│   │   ├── riders.json             # 韦手配置
│   │   ├── obstacles.json          # 阻碍配置
│   │   ├── quotes.json             # 台词配置
│   │   └── config.json             # 全局配置
│   │
│   ├── utils/                      # 工具函数
│   │   ├── Utils.ts                # 通用工具
│   │   ├── MathUtils.ts            # 数学工具
│   │   ├── AudioMgr.ts             # 音效管理
│   │   ├── AdMgr.ts                # 广告管理
│   │   ├── StorageMgr.ts           # 存储管理
│   │   └── PlatformMgr.ts          # 平台适配
│   │
│   └── main.ts                     # 入口文件
│
├── assets/                         # 资源文件
│   │
│   ├── images/                     # 图片资源
│   │   ├── riders/                 # 韦手图
│   │   │   ├── rider_normal.png
│   │   │   ├── rider_happy.png
│   │   │   ├── rider_sad.png
│   │   │   ├── rider_vip.png
│   │   │   └── rider_urgent.png
│   │   │
│   │   ├── obstacles/              # 阻碍图
│   │   │   ├── traffic.png
│   │   │   ├── traffic_light.png
│   │   │   ├── gate.png
│   │   │   └── wall.png
│   │   │
│   │   ├── maps/                   # 地图背景
│   │   │   ├── city_bg.png
│   │   │   ├── residential_bg.png
│   │   │   └── commercial_bg.png
│   │   │
│   │   └── ui/                     # UI元素
│   │   │   ├── btn_start.png
│   │   │   ├── btn_retry.png
│   │   │   ├── icon_lock.png
│   │   │   ├── icon_star.png
│   │   │   └── icon_crown.png
│   │   │
│   │   └── common/                 # 公共图
│   │       ├── arrow.png
│   │       ├── exit.png
│   │       └── timer_bar.png
│   │
│   ├── audio/                      # 音效资源
│   │   ├── click.wav
│   │   ├── launch.wav
│   │   ├── success.wav
│   │   ├── crash.wav
│   │   ├── traffic_light.wav
│   │   ├── level_complete.wav
│   │   └── level_fail.wav
│   │
│   └── fonts/                      # 字体
│       └── game_font.ttf
│
├── build/                          # 构建输出
│   ├── wechat/                     # 微信小游戏包
│   └── douyin/                     # 抖音小游戏包（可选）
│
├── .gitignore                      # Git忽略配置
├── README.md                       # 项目说明
└── package.json                    # 项目配置
```

---

## 三、核心类设计

### 3.1 Rider类（骑手）

```typescript
// src/core/Rider.ts

/**
 * 韦手状态枚举
 */
enum RiderState {
  IDLE,       // 等待中
  MOVING,     // 移动中
  SUCCESS,    // 成功送达
  CRASHED,    // 撞车
  WAITING,    // 等待红灯
  RETURNED    // 弹回起点
}

/**
 * 韦手类型枚举
 */
enum RiderType {
  NORMAL,     // 普通订单
  VIP,        // VIP订单
  URGENT      // 加急订单
}

/**
 * 韦手方向枚举
 */
enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT
}

/**
 * 韦手实体类
 */
class Rider {
  // 属性
  id: string;                   // 韦手唯一ID
  type: RiderType;              // 韦手类型
  direction: Direction;         // 出发方向
  state: RiderState;            // 当前状态
  
  position: { x: number, y: number };  // 当前位置
  startPosition: { x: number, y: number };  // 起点位置
  targetPosition: { x: number, y: number };  // 目标出口
  
  speed: number;                // 移动速度（格/秒）
  timeLimit: number;            // 时间限制（加急单）
  timeRemaining: number;        // 剩余时间
  
  isVIPFirst: boolean;          // 是否必须第一个送达
  hasDelivered: boolean;        // 是否已送达
  
  // 方法
  constructor(config: RiderConfig);
  
  startMove(): void;            // 开始移动
  update(dt: number): void;     // 更新状态
  checkCollision(): CollisionResult;  // 碰撞检测
  handleCollision(result: CollisionResult): void;  // 处理碰撞
  changeState(newState: RiderState): void;  // 状态切换
  changeExpression(): void;     // 表情切换
  showQuote(): void;            // 显示台词
  reset(): void;                // 重置到起点
  destroy(): void;              // 销毁
}
```

### 3.2 Obstacle类（阻碍）

```typescript
// src/core/Obstacle.ts

/**
 * 阻碍类型枚举
 */
enum ObstacleType {
  WALL,           // 墙壁（弹回）
  TRAFFIC,        // 堵车区（减速）
  TRAFFIC_LIGHT,  // 红绿灯（周期切换）
  GATE            // 门禁杆（需等待）
}

/**
 * 红绿灯状态枚举
 */
enum TrafficLightState {
  RED,            // 红灯
  GREEN           // 绿灯
}

/**
 * 阻碍实体类
 */
class Obstacle {
  // 属性
  id: string;
  type: ObstacleType;
  position: { x: number, y: number };
  size: { width: number, height: number };
  
  // 红绿灯特有属性
  lightState: TrafficLightState;
  lightCycle: number;           // 周期时长（秒）
  
  // 堵车区特有属性
  slowFactor: number;           // 减速系数
  
  // 方法
  constructor(config: ObstacleConfig);
  
  update(dt: number): void;     // 更新状态
  canPass(): boolean;           // 是否可通过
  getSlowFactor(): number;      // 获取减速系数
  toggleLight(): void;          // 切换红绿灯（仅红绿灯类型）
}
```

### 3.3 Level类（关卡）

```typescript
// src/core/Level.ts

/**
 * 关卡状态枚举
 */
enum LevelState {
  READY,          // 准备开始
  PLAYING,        // 进行中
  PAUSED,         // 暂停
  SUCCESS,        // 通关
  FAILED          // 失败
}

/**
 * 关卡实体类
 */
class Level {
  // 属性
  id: number;                    // 关卡ID
  name: string;                  // 关卡名称
  state: LevelState;             // 当前状态
  
  riders: Rider[];               // 韦手列表
  obstacles: Obstacle[];         // 阻碍列表
  exits: Exit[];                 // 出口列表
  
  gridSize: { width: number, height: number };  // 网格大小
  timeLimit: number;             // 关卡时间限制（秒）
  timeRemaining: number;         // 剩余时间
  
  deliveredCount: number;        // 已送达数量
  totalRiders: number;           // 总骑手数
  
  // 方法
  constructor(config: LevelConfig);
  
  init(): void;                  // 初始化关卡
  start(): void;                 // 开始关卡
  pause(): void;                 // 暂停
  resume(): void;                // 继续
  update(dt: number): void;      // 更新
  
  selectRider(riderId: string): void;  // 选择骑手
  checkVictory(): boolean;       // 检查胜利条件
  checkFailure(): boolean;       // 检查失败条件
  handleVictory(): void;         // 处理胜利
  handleFailure(): void;         // 处理失败
  reset(): void;                 // 重置关卡
  
  // 事件
  onRiderDelivered: (rider: Rider) => void;
  onLevelComplete: () => void;
  onLevelFailed: () => void;
}
```

### 3.4 GameEngine类（游戏引擎）

```typescript
// src/core/GameEngine.ts

/**
 * 游戏主引擎
 */
class GameEngine {
  // 属性
  currentLevel: Level;           // 当前关卡
  levelManager: LevelManager;    // 关卡管理器
  collisionDetector: CollisionDetector;  // 碰撞检测器
  audioManager: AudioManager;    // 音效管理
  adManager: AdManager;          // 广告管理
  storageManager: StorageManager;  // 存储管理
  
  gameState: GameState;          // 游戏状态
  unlockedLevels: number[];      // 已解锁关卡
  completedLevels: number[];     // 已通关关卡
  
  // 方法
  constructor();
  
  init(): void;                  // 初始化引擎
  start(): void;                 // 启动游戏
  update(dt: number): void;      // 主循环更新
  
  loadLevel(levelId: number): void;  // 加载关卡
  startLevel(): void;            // 开始当前关卡
  pauseLevel(): void;            // 暂停
  resumeLevel(): void;           // 继续
  retryLevel(): void;            // 重试
  nextLevel(): void;             // 下一关
  
  saveProgress(): void;          // 保存进度
  loadProgress(): void;          // 加载进度
  
  showAd(type: AdType): void;    // 显示广告
  shareResult(): void;           // 分享结果
}
```

### 3.5 CollisionDetector类（碰撞检测）

```typescript
// src/core/CollisionDetector.ts

/**
 * 碰撞结果类型
 */
enum CollisionType {
  NONE,           // 无碰撞
  EXIT,           // 到达出口
  OBstacle,       // 碰到阻碍
  RIDER,          // 碰到其他骑手
  BOUNDARY        // 碰到边界
}

/**
 * 碰撞结果
 */
interface CollisionResult {
  type: CollisionType;
  target: Rider | Obstacle | Exit | null;
  position: { x: number, y: number };
}

/**
 * 碰撞检测器
 */
class CollisionDetector {
  // 方法
  checkRiderCollision(
    rider: Rider,
    obstacles: Obstacle[],
    otherRiders: Rider[],
    exits: Exit[],
    gridSize: { width: number, height: number }
  ): CollisionResult;
  
  checkObstacleCollision(
    rider: Rider,
    obstacle: Obstacle
  ): boolean;
  
  checkRiderRiderCollision(
    rider1: Rider,
    rider2: Rider
  ): boolean;
  
  checkExitCollision(
    rider: Rider,
    exit: Exit
  ): boolean;
  
  checkBoundaryCollision(
    rider: Rider,
    gridSize: { width: number, height: number }
  ): boolean;
}
```

---

## 四、数据结构设计

### 4.1 关卡数据格式

```json
// src/data/levels.json

{
  "levels": [
    {
      "id": 1,
      "name": "入门第一关",
      "difficulty": "easy",
      "gridSize": { "width": 6, "height": 4 },
      "timeLimit": 0,
      
      "riders": [
        {
          "id": "r1",
          "type": "normal",
          "direction": "right",
          "startPosition": { "x": 1, "y": 1 },
          "targetExit": "exit1"
        },
        {
          "id": "r2",
          "type": "normal",
          "direction": "right",
          "startPosition": { "x": 1, "y": 3 },
          "targetExit": "exit2"
        }
      ],
      
      "obstacles": [],
      
      "exits": [
        {
          "id": "exit1",
          "position": { "x": 5, "y": 1 }
        },
        {
          "id": "exit2",
          "position": { "x": 5, "y": 3 }
        }
      ],
      
      "mapTheme": "city"
    }
  ]
}
```

### 4.2 骑手配置格式

```json
// src/data/riders.json

{
  "riderTypes": {
    "normal": {
      "speed": 1,
      "timeLimit": 0,
      "expressions": ["normal", "happy", "sad"]
    },
    "vip": {
      "speed": 1,
      "timeLimit": 0,
      "isVIPFirst": true,
      "expressions": ["vip_normal", "vip_happy", "vip_sad"]
    },
    "urgent": {
      "speed": 1.2,
      "timeLimit": 30,
      "expressions": ["urgent_normal", "urgent_happy", "urgent_sad"]
    }
  }
}
```

### 4.3 台词配置格式

```json
// src/data/quotes.json

{
  "quotes": {
    "launch": [
      "冲冲冲！",
      "出发！",
      "订单在手！"
    ],
    "success": [
      "准时送达！",
      "好评！好评！",
      "完美送达！"
    ],
    "crash": [
      "哎呀撞了...",
      "我的电动车...",
      "前面的挡路！"
    ],
    "waiting": [
      "又是红灯...",
      "等一等...",
      "急死了..."
    ],
    "vip": [
      "老板催单了！",
      "VIP先送！"
    ],
    "urgent": [
      "来不及了！",
      "时间不够！"
    ],
    "fail": [
      "客户投诉了...",
      "超时了..."
    ]
  }
}
```

---

## 五、碰撞检测算法

### 5.1 碰撞检测流程

```typescript
// 碰撞检测主流程
function checkRiderCollision(rider: Rider): CollisionResult {
  // 1. 计算骑手下一帧位置
  const nextPosition = calculateNextPosition(rider);
  
  // 2. 检查边界碰撞
  if (isOutOfBounds(nextPosition, gridSize)) {
    return { type: CollisionType.BOUNDARY, target: null, position: nextPosition };
  }
  
  // 3. 检查出口碰撞
  for (const exit of exits) {
    if (isColliding(nextPosition, exit.position)) {
      return { type: CollisionType.EXIT, target: exit, position: nextPosition };
    }
  }
  
  // 4. 检查阻碍碰撞
  for (const obstacle of obstacles) {
    if (isColliding(nextPosition, obstacle.position)) {
      // 红绿灯特殊处理
      if (obstacle.type === ObstacleType.TRAFFIC_LIGHT) {
        if (obstacle.lightState === TrafficLightState.GREEN) {
          continue;  // 绿灯可通过
        }
      }
      return { type: CollisionType.OBSTACLE, target: obstacle, position: nextPosition };
    }
  }
  
  // 5. 检查骑手间碰撞
  for (const otherRider of otherRiders) {
    if (otherRider.state === RiderState.MOVING) {
      if (isColliding(nextPosition, otherRider.position)) {
        return { type: CollisionType.RIDER, target: otherRider, position: nextPosition };
      }
    }
  }
  
  // 6. 无碰撞
  return { type: CollisionType.NONE, target: null, position: nextPosition };
}
```

### 5.2 碰撞判定算法

```typescript
// 简化的AABB碰撞检测
function isColliding(pos1: Position, pos2: Position, tolerance: number = 0.5): boolean {
  return Math.abs(pos1.x - pos2.x) < tolerance && 
         Math.abs(pos1.y - pos2.y) < tolerance;
}

// 带范围的碰撞检测
function isCollidingWithRect(
  pos: Position,
  rect: { x: number, y: number, width: number, height: number }
): boolean {
  return pos.x >= rect.x && 
         pos.x <= rect.x + rect.width &&
         pos.y >= rect.y && 
         pos.y <= rect.y + rect.height;
}
```

---

## 六、状态管理

### 6.1 游戏状态流转

```
状态流转图：

┌─────────┐     ┌─────────┐     ┌─────────┐
│  READY  │────▶│ PLAYING │────▶│ SUCCESS │
└─────────┘     └─────────┘     └─────────┘
                    │               │
                    │               │
                    ▼               │
               ┌─────────┐          │
               │  PAUSED │          │
               └─────────┘          │
                    │               │
                    │               │
                    ▼               │
               ┌─────────┐          │
               │ FAILED  │◀─────────┘
               └─────────┘
                    │
                    │
                    ▼
               [广告复活] ──▶ [重试] ──▶ PLAYING
```

### 6.2 骑手状态流转

```
骑手状态流转：

┌─────────┐     ┌─────────┐     ┌─────────┐
│  IDLE   │────▶│ MOVING  │────▶│ SUCCESS │
└─────────┘     └─────────┘     └─────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐
   │CRASHED  │ │ WAITING │ │RETURNED │
   └─────────┘ └─────────┘ └─────────┘
        │           │           │
        └───────────┴───────────┘
                    │
                    ▼
               [弹回起点] ──▶ IDLE
```

---

## 七、性能优化方案

### 7.1 渲染优化

```
优化策略：
├── 使用对象池复用骑手/阻碍对象
├── 合并渲染批次，减少draw call
├── 使用TexturePacker打包图集
├── 避免频繁创建/销毁对象
└── 使用cc.Sprite的batch渲染
```

### 7.2 内存优化

```
优化策略：
├── 分包加载关卡数据
├── 动态加载/释放关卡资源
├── 音效预加载 + 按需播放
├── 避免大图片，使用压缩格式
└── 控制同时存在的骑手数量
```

### 7.3 加载优化

```
优化策略：
├── 首包仅包含基础资源
├── 关卡数据按范围分包（1-20, 21-40...）
├── 预加载下一关资源
├── 使用进度条展示加载状态
└── 按需加载音效资源
```

---

## 八、平台适配

### 8.1 微信小游戏适配

```typescript
// src/utils/PlatformMgr.ts

class PlatformManager {
  // 平台检测
  static getPlatform(): Platform {
    if (typeof wx !== 'undefined') return Platform.WECHAT;
    if (typeof tt !== 'undefined') return Platform.DOUYIN;
    return Platform.WEB;
  }
  
  // 微信小游戏特有API
  static wechat: {
    // 分享
    shareAppMessage(options: ShareOptions): void;
    
    // 广告
    createRewardedVideoAd(): RewardedVideoAd;
    
    // 存储
    setStorageSync(key: string, value: any): void;
    getStorageSync(key: string): any;
    
    // 系统
    getSystemInfo(): SystemInfo;
  }
}
```

### 8.2 广告SDK接入

```typescript
// src/utils/AdMgr.ts

class AdManager {
  private rewardedVideoAd: RewardedVideoAd | null = null;
  
  // 初始化广告
  init(): void {
    if (PlatformManager.getPlatform() === Platform.WECHAT) {
      this.rewardedVideoAd = wx.createRewardedVideoAd({
        adUnitId: 'YOUR_AD_UNIT_ID'
      });
      
      this.rewardedVideoAd.onLoad(() => {
        console.log('广告加载成功');
      });
      
      this.rewardedVideoAd.onError((err) => {
        console.error('广告加载失败', err);
      });
      
      this.rewardedVideoAd.onClose((res) => {
        if (res && res.isEnded) {
          // 用户完整观看广告，发放奖励
          this.onAdComplete();
        } else {
          // 用户中途关闭广告
          this.onAdCancelled();
        }
      });
    }
  }
  
  // 显示广告
  show(type: AdType): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.rewardedVideoAd) {
        this.rewardedVideoAd.show()
          .then(() => resolve())
          .catch((err) => {
            // 广告未加载完成，先加载再显示
            this.rewardedVideoAd.load()
              .then(() => this.rewardedVideoAd.show())
              .then(() => resolve())
              .catch((err) => reject(err));
          });
      }
    });
  }
  
  // 广告完成回调
  private onAdComplete(): void {
    // 发放奖励（复活/解锁）
    EventBus.emit('ad-complete');
  }
  
  // 广告取消回调
  private onAdCancelled(): void {
    EventBus.emit('ad-cancelled');
  }
}
```

---

## 九、测试方案

### 9.1 单元测试

```
测试范围：
├── Rider类：状态切换、移动逻辑、碰撞处理
├── Obstacle类：红绿灯切换、通行判定
├── Level类：胜负判定、关卡逻辑
├── CollisionDetector：碰撞检测准确性
└── GameEngine：主循环、状态管理
```

### 9.2 集成测试

```
测试场景：
├── 完整关卡流程测试
├── 广告触发测试
├── 分享功能测试
├── 存储功能测试
└── 平台适配测试
```

### 9.3 性能测试

```
测试指标：
├── 启动时间 < 3秒
├── 关卡加载 < 1秒
├── 点击响应 < 100ms
├── FPS稳定 > 55fps
└── 内存占用 < 50MB
```