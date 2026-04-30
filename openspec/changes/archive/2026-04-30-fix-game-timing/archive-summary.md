# 归档摘要

## 变更信息
- **变更名称:** fix-game-timing
- **工作流:** spec-driven
- **归档时间:** 2026-04-30

## 归档位置
`openspec/changes/archive/2026-04-30-fix-game-timing/`

## 规格同步状态
✓ 已同步到主规格目录

## 任务完成状态
**警告:** 归档时包含4个未完成的手动测试任务

### 已完成任务 (7/11)
- [x] 1.1 修改`src/core/Level.ts`中的`start()`方法，添加`startTime = performance.now()`
- [x] 1.2 验证`getElapsedTime()`使用`performance.now()`而非`Date.now()`
- [x] 1.3 验证`handleVictory()`正确设置`completionTime`
- [x] 2.1 修改`src/web/WebGame.ts`中的`gameLoop()`方法，添加dt上限（最大100ms）
- [x] 3.1 修改`src/core/GameLogicController.ts`中的`handleReachExit()`方法，将`Date.now()`替换为`performance.now()`
- [x] 3.2 验证连击窗口检测使用统一的时间基准
- [x] 4.1 运行现有测试，确保无回归

### 未完成任务 (4/11)
- [ ] 2.2 验证dt上限不影响正常游戏帧率
- [ ] 2.3 测试浏览器后台切换场景，验证游戏状态不跳变
- [ ] 4.2 手动测试星级评分功能，验证基于实际时间
- [ ] 4.3 手动测试浏览器后台切换，验证游戏状态稳定

## 实施摘要
### 已完成的代码修改
1. **修复关卡开始时间记录**
   - `src/core/Level.ts`: 在`start()`方法中添加`startTime = performance.now()`
   - 修复`getElapsedTime()`、`startWithTimer()`和`revive()`方法，统一使用`performance.now()`

2. **添加dt上限保护**
   - `src/web/WebGame.ts`: 在`gameLoop()`中添加`Math.min(..., 0.1)`，限制最大dt为100ms

3. **统一时间基准**
   - `src/core/GameLogicController.ts`: 将连击检测中的`Date.now()`替换为`performance.now()`

### 部署信息
- **构建命令:** `npm run build:web`
- **部署目录:** `/var/www/game/html/`
- **访问地址:** https://game.tianle.me
- **nginx重载:** `sudo systemctl reload nginx`

## 备注
- 手动测试任务需要在浏览器中实际验证
- 所有代码修改已通过构建测试，无编译错误
- 游戏已部署到nginx服务器，可进行实际测试
