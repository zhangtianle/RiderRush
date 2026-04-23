# 更新日志 (CHANGELOG)
## 外卖冲冲冲 - 微信小游戏

所有重要的变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [未发布] - 待定

### 待完成
- Cocos Creator 项目配置
- UI场景完整实现（节点创建、渲染）
- 美术资源生成（AI生成占位图）
- 微信小游戏构建适配
- 广告SDK接入测试
- 音效资源制作

---

## [v0.6.0-alpha] - 2026-04-25

### 新增
- **IntegrationTests.ts** 集成测试套件
  - 游戏初始化测试
  - 关卡加载测试
  - 单骑手/多骑手关卡流程测试
  - VIP优先出发规则测试
  - 加急时限测试
  - 红绿灯等待机制测试
  - 骑手碰撞检测测试
  - 场景流程切换测试

- **PerformanceTests.ts** 性能压力测试
  - 基准性能测试
  - 10/20/50骑手压力测试
  - 多障碍物性能测试
  - 红绿灯密集场景测试
  - 极端关卡(12骑手+8障碍)测试
  - 连续更新1000次测试
  - FPS、迭代时间、总时间阈值判定

### 变更
- 更新 main.ts 导出集成测试和性能测试函数
- 开发模式自动运行三级测试

---

## [v0.5.0-alpha] - 2026-04-25

### 新增
- **SceneManager.ts** 场景管理器
  - SceneType 场景类型定义（Menu/LevelSelect/Game/Result/Fail）
  - SceneState 场景状态管理
  - 场景切换与过渡动画框架
  - 场景历史栈支持返回功能
  - 关卡流程控制（重试/下一关）
  - 场景暂停/继续状态管理
  - 事件驱动的场景切换

- **CoreTests.ts** 核心类测试套件
  - Rider测试：创建、移动、碰撞、VIP/加急
  - Obstacle测试：创建、红绿灯周期
  - Level测试：创建、胜利/失败判定
  - CollisionDetector测试：边界/障碍/出口/骑手碰撞

### 变更
- 更新 main.ts 导出新模块
- 开发模式自动运行核心测试
- 版本升级至 v0.5.0-alpha

---

## [v0.4.0-alpha] - 2026-04-25

### 新增
- **GameLogicController.ts** 游戏逻辑控制器
  - VIP优先出发规则强制执行
  - 碰撞检测与冷却机制
  - 加急骑手超时处理
  - 台词与表情触发集成
  - 胜利/失败判定与星级计算
  - 音效播放集成

- **levels.json** 关卡数据完善
  - 专家36-40关：复杂障碍组合
  - 大师41-45关：1秒红绿灯周期，5-6秒加急时限
  - 传奇46-50关：12骑手极限挑战，5VIP+2加急

---

## [v0.3.0-alpha] - 2026-04-25

### 新增
- **levels.json** 关卡数据扩展
  - 入门1-10关：2-5骑手，无障碍
  - 基础11-20关：引入堵车区、墙壁、VIP、加急
  - 进阶21-30关：5-6骑手，复杂障碍组合
  - 专家31-35关：8-10骑手，3VIP+多加急

- **美术资源清单.md** 美术需求文档
  - 57张图片资源规格（骑手15、阻碍8、地图3、UI20、出口2、箭头4、气泡1）
  - 7个音效资源规格
  - AI生成提示词模板
  - 资源目录结构规划

---

## [v0.2.0-alpha] - 2026-04-24

### 新增
- **Rider.ts** 韦手实体类
  - RiderState 状态枚举（IDLE/MOVING/SUCCESS/CRASHED/WAITING/RETURNED）
  - RiderType 类型枚举（NORMAL/VIP/URGENT）
  - Direction 方向枚举
  - 移动、碰撞、表情切换方法

- **Obstacle.ts** 阻碍实体类
  - ObstacleType 类型枚举（WALL/TRAFFIC/TRAFFIC_LIGHT/GATE）
  - TrafficLightState 红绿灯状态枚举
  - 红绿灯周期切换、减速系数

- **Level.ts** 关卡管理类
  - LevelState 状态枚举（READY/LOADING/RUNNING/SUCCESS/FAILED/PAUSED）
  - 时间限制、胜利/失败判定
  - 复活机制、星级计算

- **GameEngine.ts** 游戏引擎类
  - 单例模式
  - 关卡加载、进度保存/读取
  - 事件绑定

- **LevelManager.ts** 关卡管理器
  - 关卡JSON数据加载
  - 关卡配置解析

- **CollisionDetector.ts** 碰撞检测器
  - AABB碰撞检测算法
  - CollisionType 碰撞类型枚举

- **EventBus.ts** 事件总线
  - GameEventType 事件类型枚举
  - 发布/订阅模式

- **UI场景框架文件**
  - MenuScene.ts 菜单场景
  - LevelSelectScene.ts 关卡选择场景
  - GameScene.ts 游戏主场景
  - ResultPanel.ts 结算面板
  - FailPanel.ts 失败面板
  - HUD.ts 游戏HUD

- **工具类**
  - Utils.ts 通用工具
  - MathUtils.ts 数学工具
  - AudioMgr.ts 音效管理器
  - AdMgr.ts 广告管理器
  - StorageMgr.ts 存储管理器
  - ExpressionManager.ts 表情管理器
  - QuoteManager.ts 台词管理器

---

## [v0.1.0-alpha] - 2026-04-24

### 新增
- 项目初始化
- **SDD文档体系**
  - SDD_需求文档.md：需求规格说明（FR-001至FR-013）
  - SDD_设计文档.md：游戏设计、视觉设计、音效设计
  - SDD_技术文档.md：架构设计、类设计、算法设计
  - 开发计划.md：4周MVP开发计划
  - 版本管理.md：Git分支/提交/标签规范

- **项目骨架**
  - TypeScript项目结构
  - src/ 目录结构规划
  - main.ts 入口文件

---

## 版本规划

### v0.7.0-alpha（下一版本）
- Cocos Creator 项目配置
- 实际节点创建与渲染
- UI组件完整实现

### v0.8.0-alpha
- 美术资源占位图生成
- 音效资源制作
- 视觉包装联调

### v0.9.0-alpha
- 微信小游戏构建适配
- 广告SDK接入
- 存储功能测试

### v1.0.0-beta
- 完整游戏循环测试
- Bug修复
- 性能优化

### v1.0.0
- 微信小游戏审核提交
- 正式发布

---

## 约定

- `新增` - 新功能
- `变更` - 现有功能的变更
- `修复` - Bug修复
- `移除` - 移除的功能
- `优化` - 性能或体验优化