## Why

当前游戏缺乏情感连接和叙事深度。玩家只是机械地画路径、避开障碍，缺少投入感和目标感。添加背景故事可以：
- 让玩家对骑手产生共情，理解他们面临的挑战
- 为VIP、紧急订单等机制提供叙事解释
- 增加游戏的记忆点和传播性

## What Changes

- 新增游戏背景故事设定（世界观、角色、动机）
- 游戏开场添加故事介绍动画/文本
- 每关开始添加剧情对话气泡（骑手台词）
- 胜利/失败时添加情境化文案
- 解锁新关卡时展示剧情进展

## Capabilities

### New Capabilities
- `story-system`: 游戏背景故事系统，包含世界观设定、角色背景、剧情对话
- `story-integration`: 将故事元素整合到游戏流程中（开场、关卡、结算）

### Modified Capabilities

（无现有spec需要修改）

## Impact

- **新增文件**: `src/data/story.json` 存储故事数据，`src/utils/StoryManager.ts` 管理故事流程
- **修改文件**:
  - `src/core/GameEngine.ts` - 添加故事状态管理
  - `src/core/Level.ts` - 关联关卡与剧情
  - `src/web/WebGame.ts` - 显示故事UI
  - `src/web/GameRenderer.ts` - 渲染故事相关视觉效果
  - `web/index.html` - 添加故事展示UI元素
- **依赖**: 复用现有 `QuoteManager` 的对话系统框架