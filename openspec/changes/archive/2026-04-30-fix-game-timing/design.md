## Context

游戏采用`requestAnimationFrame + delta time`的经典游戏循环模式，核心时间基准来自`performance.now()`。当前存在多个计时相关的bug，主要原因是：
1. 关卡启动时未记录开始时间
2. 浏览器后台切换时dt无上限
3. `Date.now()`与`performance.now()`混用
4. 广告冷却计时未被正确调用

## Goals / Non-Goals

**Goals:**
- 修复星级评分系统，使其基于实际完成时间
- 防止浏览器后台切换导致的游戏状态异常
- 统一时间基准，提高计时一致性
- 确保广告冷却功能正常工作

**Non-Goals:**
- 不改变游戏的核心玩法机制
- 不添加新的计时功能
- 不优化性能测试的dt模拟

## Decisions

### 1. 修复关卡开始时间记录

**决策**: 在`Level.start()`方法中添加`startTime = performance.now()`，同时保留`startWithTimer()`方法以保持向后兼容。

**理由**:
- `start()`是当前Web版本调用的入口，必须在此处设置开始时间
- 保持`startWithTimer()`的向后兼容性，避免影响其他可能的调用路径
- 使用`performance.now()`而非`Date.now()`以保持与游戏循环一致的时间基准

**替代方案**:
- 修改`WebGame.loadLevel()`调用`startWithTimer()`：可行，但需要修改调用方，不如直接修复`start()`方法彻底

### 2. 添加dt上限

**决策**: 在`WebGame.gameLoop()`中添加`const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1)`，限制最大dt为100ms。

**理由**:
- 100ms上限可以防止浏览器后台切换后的大dt导致游戏状态跳变
- 100ms是合理的游戏帧时间上限，低于此值游戏逻辑正常，高于此值说明发生了异常情况
- 使用`Math.min()`而非条件判断，代码更简洁

**替代方案**:
- 使用更大的上限（如500ms）：可能导致游戏状态仍有一定跳变
- 使用更小的上限（如50ms）：可能在低端设备上造成不必要的帧跳过

### 3. 统一时间基准

**决策**: 将`Level.getElapsedTime()`和`GameLogicController.handleReachExit()`中的`Date.now()`替换为`performance.now()`。

**理由**:
- `performance.now()`不受系统时间修改影响，更稳定
- 与游戏循环的时间基准保持一致
- 减少潜在的时间不一致问题

**替代方案**:
- 保持`Date.now()`：虽然在大多数场景下可行，但存在极端情况下的风险

### 4. 修复广告冷却计时

**决策**: 在`WebGame.update()`中添加广告冷却计时调用，使用`dt * 1000`转换为毫秒。

**理由**:
- `AdMgr.updateCooldown()`期望接收毫秒单位的参数
- 当前`WebGame`未调用`GameEngine.update()`，导致广告冷却永不递减
- 直接在`WebGame.update()`中调用，避免依赖`GameEngine`

**替代方案**:
- 修改`AdMgr.updateCooldown()`接受秒单位：可能影响其他调用方
- 通过`GameEngine`间接调用：增加不必要的依赖

## Risks / Trade-offs

### 风险1: dt上限可能导致游戏逻辑不连续
**缓解措施**: 100ms上限是合理的阈值，大多数正常游戏帧时间远低于此值。对于极端情况，游戏逻辑的不连续性比状态跳变更可接受。

### 风险2: 修改`start()`方法可能影响其他调用方
**缓解措施**: 通过代码分析确认`start()`方法主要在Web版本中使用，且`startWithTimer()`作为备用方案保持向后兼容。

### 风险3: 广告冷却计时修改可能影响广告展示逻辑
**缓解措施**: 仅添加计时递减调用，不改变广告展示的触发条件和冷却时间设置。

## Migration Plan

1. **开发阶段**: 在本地环境修改代码，运行现有测试确保无回归
2. **测试阶段**: 手动测试以下场景：
   - 正常游戏流程，验证星级评分基于实际时间
   - 浏览器标签页切换，验证游戏状态不跳变
   - 广告冷却功能，验证冷却时间正确递减
3. **部署阶段**: 直接部署到生产环境，无特殊迁移步骤
4. **回滚策略**: 如有问题，回滚到上一个版本即可

## Open Questions

无。所有技术决策已有明确方案，实施风险可控。
