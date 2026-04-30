## Context

当前游戏已有 `QuoteManager` 管理200+骑手对话台词，按场景分类（出发、成功、碰撞、等待、VIP、紧急）。但缺少：
- 统一的世界观和叙事框架
- 角色背景和动机设定
- 剧情与关卡进度关联

游戏使用 EventBus 事件驱动架构，UI 与核心逻辑解耦，便于添加故事展示层。

## Goals / Non-Goals

**Goals:**
- 建立完整背景故事：城市设定、骑手角色、动机冲突
- 故事自然融入游戏流程（不打断核心玩法）
- 剧情随关卡解锁推进，增加玩家期待感

**Non-Goals:**
- 不添加复杂动画系统（使用现有气泡对话）
- 不创建完整角色系统（骑手仍为抽象实体）
- 不添加语音配音或复杂多媒体

## Decisions

### 1. 故事架构：章回式结构
每10关为一章，每章有独立剧情主题。

**方案对比:**
| 方案 | 优点 | 缺点 |
|------|------|------|
| 章回式 | 节奏清晰，进度感强 | 需设计5章内容 |
| 连续式 | 更沉浸 | 难控制节奏 |
| 独立关卡式 | 灵活 | 缺整体感 |

**选择：章回式**。50关分为5章，每章有主题和结尾彩蛋。

### 2. 数据存储：扩展JSON模式
复用 `src/data/` 模式，创建 `story.json` 存储所有剧情数据。

```json
{
  "chapters": [{
    "id": 1,
    "title": "初入江湖",
    "range": [1, 10],
    "intro": "...",
    "ending": "..."
  }],
  "levelStories": [{
    "levelId": 1,
    "prelude": "开场景对话",
    "characters": ["小王"],
    "epilogue": "结束对话"
  }]
}
```

### 3. 故事管理器：StoryManager 单例
遵循现有 Singleton 模式，与 GameEngine 协同管理故事进度。

```typescript
class StoryManager {
  getCurrentChapter(levelId: number): Chapter
  getLevelStory(levelId: number): LevelStory
  shouldShowIntro(levelId: number): boolean  // 新章节首关
  markStorySeen(levelId: number): void
}
```

### 4. UI呈现：对话气泡 + 场景文字
- 关卡开始：骑手头像 + 对话气泡（复用现有渲染器）
- 章节介绍：滚动文字动画（CSS实现）
- 结算：情境化文案替换固定文案

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| 故事打断游戏节奏 | 对话可跳过，设置默认关闭选项 |
| 内容创作量大 | 分阶段实现，先完成第一章 |
| 故事数据加载影响性能 | story.json 小于10KB，异步加载 |
| 本地化困难 | 使用与 QuoteManager 相同的中文文本模式 |

## Migration Plan

1. 创建 story.json 和 StoryManager
2. 添加故事状态到 StorageMgr
3. WebGame 集成故事显示流程
4. 渲染器添加气泡对话能力
5. 更新关卡解锁逻辑展示章节介绍

**回滚策略:** 删除 story.json、StoryManager，恢复原UI文案。