# 任务：前10关优化 + 竖屏适配

## 任务 1：重新设计 levels.json 前 10 关数据

修改 `src/data/levels.json` 中 level 1-10 的数据：

- [x] L1: gridSize 改为 {width:4, height:3}，骑手/出口位置调整
- [x] L2: gridSize 改为 {width:4, height:4}，两个骑手独立路径
- [x] L3: gridSize 改为 {width:5, height:4}，墙壁挡路
- [x] L4: gridSize 改为 {width:5, height:5}，路径交叉
- [x] L5: gridSize 改为 {width:5, height:5}，VIP 优先级
- [x] L6: gridSize 改为 {width:5, height:5}，减速带
- [x] L7: gridSize 改为 {width:5, height:5}，红绿灯
- [x] L8: gridSize 改为 {width:5, height:5}，紧急订单+限时
- [x] L9: gridSize 改为 {width:5, height:7}，三骑手+障碍
- [x] L10: gridSize 改为 {width:5, height:7}，全机制综合

## 任务 2：UI 浮动化改造

修改 `web/index.html` 的 CSS 和布局：

- [x] Header 改为浮动半透明：去掉固定占位，改为 `position:absolute` + 半透明背景
- [x] HUD 改为浮动半透明：同上，浮动在底部
- [x] 关卡信息改为短暂提示：显示 2 秒后淡出，不常驻
- [x] 确保浮动元素不阻挡网格首行/末行的触摸区域
- [x] 执行阶段（GO后）隐藏重画按钮，减少遮挡

## 任务 3：GameRenderer 适配

修改 `src/web/GameRenderer.ts`：

- [x] fitToScreen 中去掉 headerSpace/hudSpace 的固定预留（或大幅减小）
- [x] 网格可利用更大的屏幕高度，提升格子实际尺寸

## 任务 4：测试验证

- [x] 在 375px 宽度模拟器中测试前 10 关，确认格子 ≥ 62px
- [x] 测试浮动 UI 不遮挡关键操作区域
- [x] 测试所有 10 关可正常通关
- [x] 运行 `npm test` 确认无破坏
