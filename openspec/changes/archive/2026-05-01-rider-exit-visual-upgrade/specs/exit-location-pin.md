## Spec: exit-location-pin

出口图标从抽象方块改为位置标记（📍风格），并与骑手类型做颜色联动。

### 需求

1. EXIT_SPRITE 为 12×12 像素位置标记造型，调色板含 4 色（描边/填充/高光/白）
2. 每种骑手类型（NORMAL/VIP/URGENT）对应一组出口调色板，颜色与骑手调色板视觉呼应
3. renderExits() 遍历时查找 targetExit 指向该 exit 的 rider，用 rider type 选调色板
4. 脉冲光圈颜色跟随调色板主色，不再固定使用 COLORS.exit
5. 无 rider 指向的 exit 使用 NORMAL 调色板作为默认

### 验收标准

- [ ] 出口显示为位置标记造型，玩家能一眼识别为"目的地"
- [ ] NORMAL 骑手的出口为金色，VIP 为橙色，URGENT 为红橙色
- [ ] 脉冲光圈颜色与出口主色一致
- [ ] 同一出口被多个不同类型骑手指向时，使用第一个骑手的类型颜色
