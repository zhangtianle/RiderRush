## 1. 修复关卡开始时间记录

- [x] 1.1 修改`src/core/Level.ts`中的`start()`方法，添加`startTime = performance.now()`
- [x] 1.2 验证`getElapsedTime()`使用`performance.now()`而非`Date.now()`
- [x] 1.3 验证`handleVictory()`正确设置`completionTime`

## 2. 添加dt上限保护

- [x] 2.1 修改`src/web/WebGame.ts`中的`gameLoop()`方法，添加dt上限（最大100ms）
- [ ] 2.2 验证dt上限不影响正常游戏帧率
- [ ] 2.3 测试浏览器后台切换场景，验证游戏状态不跳变

## 3. 统一时间基准

- [x] 3.1 修改`src/core/GameLogicController.ts`中的`handleReachExit()`方法，将`Date.now()`替换为`performance.now()`
- [x] 3.2 验证连击窗口检测使用统一的时间基准

## 4. 测试验证

- [x] 4.1 运行现有测试，确保无回归
- [ ] 4.2 手动测试星级评分功能，验证基于实际时间
- [ ] 4.3 手动测试浏览器后台切换，验证游戏状态稳定
