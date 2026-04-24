/**
 * Web版本入口文件
 * @version v0.8.0
 * @since 2026-04-25
 */

import { initWebGame } from './web/WebGame';
import { EventBus } from './core/EventBus';
import { GameEventType } from './core/EventBus';

const eventBus = EventBus.getInstance();

// 调试事件绑定
eventBus.on(GameEventType.LEVEL_START, (levelId: number) => {
  console.log(`[Web] 关卡开始: ${levelId}`);
});

eventBus.on(GameEventType.RIDER_START_MOVE, (rider: any) => {
  console.log(`[Web] 韦手出发: ${rider.id}`);
});

eventBus.on(GameEventType.RIDER_DELIVERED, (rider: any) => {
  console.log(`[Web] 韦手送达: ${rider.id}`);
});

eventBus.on(GameEventType.RIDER_CRASHED, (data: any) => {
  console.log(`[Web] 碰撞: ${data.rider1?.id} ${data.rider2?.id || ''}`);
});

eventBus.on(GameEventType.LEVEL_COMPLETE, (data: any) => {
  console.log(`[Web] 关卡完成: ${data.levelId}, 星级: ${data.stars}`);
});

eventBus.on(GameEventType.LEVEL_FAILED, (data: any) => {
  console.log(`[Web] 关卡失败: ${data.levelId}, 原因: ${data.reason}`);
});

console.log('========================================');
console.log('  外卖冲冲冲 - Web试玩版');
console.log('  版本: v0.8.0-alpha');
console.log('========================================');

// 立即启动（DOMContentLoaded可能已触发）
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const game = initWebGame();
    (window as any).gameInstance = game;
    console.log('游戏实例已绑定到window.gameInstance');
  });
} else {
  const game = initWebGame();
  (window as any).gameInstance = game;
  console.log('游戏实例已绑定到window.gameInstance');
}