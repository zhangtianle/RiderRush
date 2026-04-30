# 任务列表

## 1. 定义对话数据结构
- [x] 新建 `src/types/story.ts`，定义 `DialogueLine` 接口（speaker, text, emotion）
- [x] 更新 `LevelStory` 接口，prelude 从 `string` 改为 `DialogueLine[]`

## 2. 升级 StoryManager
- [x] 新增 `getDynamicStory(levelId, attempts, stars)` 方法
- [x] 根据 attempts 和 stars 选择不同 epilogue 变体
- [x] 保持 `getLevelStory()` 向后兼容（老格式仍可用）

## 3. 重写 story.json 第一章
- [x] 第1关：第一天上路（紧张→小成就）
- [x] 第2关：多线操作（自信初显）
- [x] 第3关：第一次撞墙（受挫，支持失败台词）
- [x] 第4关：时间差的艺术（自主探索）
- [x] 第5关：入门考试（情感高点）
- [x] 第6关：新区域（小王飘了）
- [x] 第7关：复杂路线（紧张对抗）
- [x] 第8关：VIP登场（利益冲突）
- [x] 第9关：综合考验（队长说"完美"）
- [x] 第10关：告别与启程（离别）

## 4. 适配渲染层
- [x] 确认 WebGame/HTML 层能解析新格式的 DialogueLine 数组
- [x] 如需调整对话气泡渲染，修改 `web/index.html` 中的对话展示逻辑

## 5. 测试验证
- [x] 编译通过 `npm run build:web`
- [x] 1-10关对话正常显示
- [x] 动态台词在多次失败后正确切换
- [x] 第10关离别剧情完整呈现
