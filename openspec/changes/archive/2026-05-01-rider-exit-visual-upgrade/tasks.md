## Tasks

### 1. 重写 EXIT_SPRITE 为位置标记造型
- 替换 EXIT_SPRITE 12×12 像素数据为位置标记形状
- 替换 EXIT_PALETTES 为按骑手类型映射的多组调色板（NORMAL/VIP/URGENT/SELECTED）
- 删除旧的单一 EXIT_PALETTE
- 文件: `src/web/GameRenderer.ts`

### 2. 修改 renderExits() 支持颜色联动
- 在 renderExits() 中查找指向该 exit 的 rider，获取 rider type
- 根据 rider type 选择对应的 EXIT_PALETTES
- 脉冲光圈颜色跟随调色板主色变化
- 文件: `src/web/GameRenderer.ts`

### 3. 优化 RIDER_SPRITE — 加外卖箱和高光
- 修改行3: 眼睛位置(3,4)和(3,7)从 index 6 改为 index 8（高光白）
- 修改行10: 中间4格从 index 3 改为 index 9（外卖箱色）
- 文件: `src/web/GameRenderer.ts`

### 4. 扩展骑手调色板
- 每种骑手类型的 RIDER_PALETTES 新增 index 8（高光色）和 index 9（外卖箱色）
- NORMAL: 8='#FFEE88', 9='#FF8C00'
- VIP: 8='#FFCC44', 9='#FF6600'
- URGENT: 8='#FF8866', 9='#CC2200'
- CRASHED: 8='#BBBBBB', 9='#777777'
- 文件: `src/web/GameRenderer.ts`

### 5. 构建测试与部署验证
- `npm run build:web` 确保无编译错误
- 部署到 nginx 验证视觉效果
- 检查不同骑手类型的出口颜色联动是否正确
