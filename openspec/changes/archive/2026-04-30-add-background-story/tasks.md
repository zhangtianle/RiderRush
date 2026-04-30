## 1. 故事数据与基础架构

- [x] 1.1 创建 `src/data/story.json`，定义5章故事结构（世界观、章节、角色、关卡剧情）
- [x] 1.2 创建 `src/utils/StoryManager.ts` 单例类，实现章节查询、关卡剧情获取方法
- [x] 1.3 扩展 `StorageMgr.ts`，添加故事进度存储键 `STORY_SEEN_LEVELS`
- [x] 1.4 编写第一章完整剧情内容（第1-10关对话文本）

## 2. 核心逻辑集成

- [x] 2.1 在 `GameEngine.ts` 添加 `shouldShowStory()` 方法，判断是否显示开场剧情
- [x] 2.2 修改 `GameEngine.ts` 的关卡加载流程，在 `startLevel()` 中触发故事展示事件
- [x] 2.3 添加 `GameEventType.SHOW_STORY` 和 `SHOW_CHAPTER_INTRO` 事件类型到 EventBus
- [x] 2.4 修改胜利/失败检测逻辑，传递关卡ID用于情境文案选择

## 3. UI渲染能力

- [x] 3.1 在 `GameRenderer.ts` 添加 `drawDialogueBubble()` 方法，渲染气泡对话
- [x] 3.2 在 `GameRenderer.ts` 添加 `drawChapterIntro()` 方法，渲染章节标题动画
- [x] 3.3 添加角色头像渲染逻辑（使用颜色区分不同骑手角色）
- [x] 3.4 实现故事展示时的暂停/恢复游戏循环机制

## 4. Web UI集成

- [x] 4.1 在 `web/index.html` 添加故事展示层容器元素
- [x] 4.2 修改 `WebGame.ts`，监听故事事件并调用渲染器显示对话
- [x] 4.3 添加"跳过"按钮绑定，支持点击跳过开场对话
- [x] 4.4 实现章节介绍滚动动画效果（CSS transition）
- [x] 4.5 添加设置选项"显示剧情"开关到菜单UI

## 5. 结算文案整合

- [x] 5.1 修改胜利面板，使用 `StoryManager.getLevelStory().epilogue` 作为文案
- [x] 5.2 修改失败面板，根据失败类型选择情境化文案
- [x] 5.3 为无专属剧情的关卡添加基于章节的通用文案模板

## 6. 测试与完善

- [x] 6.1 添加 StoryManager 单元测试到 `CoreTests.ts`
- [x] 6.2 测试第一章全流程故事展示（章节介绍 → 关卡对话 → 结算文案）
- [x] 6.3 测试故事开关功能（关闭后跳过所有剧情）
- [x] 6.4 测试进度持久化（已看过关卡不再弹出）
- [ ] 6.5 编写第2-5章剧情内容（可分阶段完成）