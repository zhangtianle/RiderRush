## Why

游戏存在多个计时相关的bug，严重影响游戏体验和公平性：
1. 星级评分系统完全失效——玩家始终获得3星，因为关卡开始时间从未被记录
2. 浏览器标签页切换后游戏状态异常——骑手瞬移、倒计时归零、红绿灯跳过周期

## What Changes

- 修复关卡开始时间记录：在关卡启动时正确设置`startTime`
- 添加dt上限：防止浏览器后台切换后的大dt导致游戏状态跳变
- 统一时间基准：将`Date.now()`替换为`performance.now()`以保持一致性
- 修复广告冷却计时：确保Web版本中广告冷却能正确递减

## Capabilities

### New Capabilities

- `timing-validation`: 计时系统验证和修复，确保所有时间相关功能正常工作

### Modified Capabilities

（无现有capability需要修改）

## Impact

- `src/core/Level.ts`: 修改`start()`方法，添加`startTime`设置
- `src/web/WebGame.ts`: 修改`gameLoop()`添加dt上限，修改`loadLevel()`调用`startWithTimer()`
- `src/core/GameLogicController.ts`: 将`Date.now()`替换为`performance.now()`
- `src/core/GameEngine.ts`: 确保广告冷却计时被正确调用
