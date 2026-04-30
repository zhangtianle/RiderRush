## 1. 色彩与常量准备

- [x] 1.1 在 `src/constants/GameConstants.ts` 中新增色彩常量：`ACCENT_TEAL: '#4ECDC4'`、`ACCENT_PINK: '#FF6B9D'`
- [x] 1.2 在 `src/constants/GameConstants.ts` 中新增特效参数常量：碰撞粒子数量、成功粒子数量、震动强度、闪屏透明度等
- [x] 1.3 在 `src/web/GameRenderer.ts` 的 COLORS 对象中引用新色彩常量

## 2. 游戏网格街道纹理

- [x] 2.1 修改 `renderGrid()` 方法，实现沥青质感：根据网格坐标用伪随机算法选择 3-4 种像素明暗点阵模式替代纯色填充
- [x] 2.2 在 `renderGrid()` 中添加路沿石绘制：网格四周边缘用略亮颜色绘制像素风路沿
- [x] 2.3 在 `renderGrid()` 中添加车道虚线：中间行/列绘制白色像素虚线（每隔几像素一小段）
- [x] 2.4 在 `renderGrid()` 中添加建筑剪影：网格外围绘制深色像素建筑轮廓（高度不一的矩形组合）

## 3. HUD 像素化

- [x] 3.1 在 `web/index.html` 中为 HUD 元素（#level-info, #timer, #delivered, #path-status）添加像素风双层边框 CSS（box-shadow 模拟外深内浅）
- [x] 3.2 为 HUD 元素添加 CSS 伪元素小图标：时间前加时钟、送达前加包裹、路径前加箭头
- [x] 3.3 添加 CSS `@keyframes bounce` 弹跳动画，用于数字变化时的视觉反馈
- [x] 3.4 在 `src/web/WebGame.ts` 的 `updateUI()` 方法中，送达数变化时触发动画 class

## 4. 特效克制化

- [x] 4.1 修改 `addCrashParticles()` 方法：粒子数量从 18 减到 8-10，尺寸减小
- [x] 4.2 修改 `addSuccessParticles()` 方法：粒子数量从 12 减到 8，颜色统一为金色系
- [x] 4.3 修改 `triggerShake()` 调用处：震动强度减半
- [x] 4.4 修改 `triggerRedFlash()` 方法：alpha 从 0.4 降为 0.2
- [x] 4.5 修改 `addComboPopup()` 方法：combo 文字只使用金色，移除彩虹色
- [x] 4.6 新增送达金色光圈效果：骑手送达时在原位绘制一个扩散后消失的金色圆圈
- [x] 4.7 修改 `updateStarsDisplay()` 相关逻辑：结算星星逐个从左到右出现，带轻微放大回弹

## 5. 菜单氛围增强

- [x] 5.1 在 `web/index.html` 中为 #menu-title 添加像素风装饰边框 CSS（双层 box-shadow + 内部线条）
- [x] 5.2 在 `web/index.html` 中添加 .menu-city-silhouette CSS 类：用 CSS 渐变/clip-path 在菜单底部绘制静态像素城市剪影
- [x] 5.3 在 `web/index.html` 的 #menu-screen 中添加城市剪影 div 元素
- [x] 5.4 调整开始游戏按钮样式，使其视觉上比其他按钮更突出（更亮边框或略大尺寸）
