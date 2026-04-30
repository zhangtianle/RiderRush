# 外卖冲冲冲 Delivery Rush

> 一款外卖主题的路径解谜小游戏 — 规划骑手路线，避开障碍，准时送达！

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Canvas](https://img.shields.io/badge/Canvas-Web%20Game-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Version](https://img.shields.io/badge/Version-0.8.0--alpha-orange)

## 在线试玩

**[https://game.tianle.me](https://game.tianle.me)**

支持 PC 和手机浏览器，随时开玩！

## 游戏简介

你是一名外卖站站长，需要调度手下的骑手们完成配送任务。每位骑手只能沿一个方向直线前进，你需要合理安排他们的出发顺序，让所有人避开障碍、互不碰撞、准时送达。

听起来简单？红绿灯、交通锥、VIP 加急单会给你制造不少麻烦。

## 核心玩法

- **方向锁定** — 每个骑手只能朝一个方向移动（上/下/左/右）
- **顺序调度** — 点击骑手决定谁先出发，时机就是一切
- **路径绘制** — 拖拽绘制自定义路线，规划更精确的走位
- **障碍交互** — 墙壁弹回、交通灯走走停停、交通锥减速
- **连击系统** — 连续成功送达触发 Combo，分数翻倍
- **VIP 优先** — 有 VIP 标记的订单必须最先送达，否则扣分

## 游戏特色

| 特色 | 说明 |
|------|------|
| 200+ 台词 | 骑手出发、送达、碰撞都有不同语音，画风清奇 |
| 50 关卡 | 从新手引导到专家难度，循序渐进 |
| 多类型骑手 | 普通、VIP、加急，各有不同规则 |
| 像素风美术 | 复古像素画风，轻松休闲 |
| 省份排行榜 | 按省份统计通关率，看看你所在地区排第几 |

## 快速开始

### 环境要求

- Node.js >= 16
- npm >= 8

### 安装运行

```bash
# 克隆仓库
git clone https://github.com/zhangtianle/i_game.git
cd i_game

# 安装依赖
npm install

# 构建并启动（访问 http://localhost:8080）
npm run dev:web
```

### 其他命令

```bash
# 仅构建
npm run build:web

# 监听模式（改代码自动重建）
npm run watch:web

# 运行单元测试
npm test
```

## 技术架构

```
src/
├── core/               # 游戏引擎（纯逻辑，无渲染依赖）
│   ├── GameEngine.ts       # 顶层状态管理、关卡加载、进度存档
│   ├── GameLogicController # 帧更新、碰撞检测、胜负判定
│   ├── Level.ts            # 关卡实例（骑手、障碍、出口）
│   ├── Rider.ts            # 骑手实体（状态机、类型、移动）
│   ├── CollisionDetector   # 网格碰撞检测
│   ├── PathDrawer.ts       # 路径绘制交互
│   ├── PathValidator.ts    # 路径合法性校验
│   └── EventBus.ts         # 全局事件总线
├── web/                # Web Canvas 渲染层
│   ├── WebGame.ts          # 游戏主循环、UI 管理
│   └── GameRenderer.ts     # Canvas 绘制（网格、骑手、特效）
├── data/               # 关卡数据（JSON）
├── utils/              # 工具类（音频、存储、平台适配）
├── constants/          # 常量定义
└── types/              # TypeScript 类型声明
```

**设计原则：**

- 核心引擎纯逻辑，不依赖任何渲染框架，可移植到任意平台
- 所有模块单例模式，通过 EventBus 解耦通信
- 状态驱动：骑手、关卡、游戏都有明确的状态机

## 参与开发

欢迎任何形式的贡献！

### 如何参与

1. Fork 本仓库
2. 创建你的特性分支：`git checkout -b feature/your-feature`
3. 提交改动：`git commit -m 'feat: add some feature'`
4. 推送到远程：`git push origin feature/your-feature`
5. 提交 Pull Request

### 开发方向

以下是一些可以贡献的方向，欢迎认领：

- [ ] 新关卡设计（编辑 `src/data/levels.json`）
- [ ] 新障碍类型（如传送门、单行道）
- [ ] 音效和背景音乐
- [ ] 移动端触控优化
- [ ] 微信小游戏适配
- [ ] 更多骑手台词和表情
- [ ] 成就系统
- [ ] 每日挑战模式

### 提交规范

使用语义化提交信息：

- `feat:` 新功能
- `fix:` 修复 Bug
- `docs:` 文档更新
- `refactor:` 代码重构
- `perf:` 性能优化

## 目标平台

| 平台 | 状态 |
|------|------|
| Web (Canvas) | 可玩 |
| 微信小游戏 | 计划中 |
| 抖音小游戏 | 计划中 |

## 许可证

[MIT License](LICENSE)

---

如果这个项目对你有帮助，点个 Star 支持一下！
