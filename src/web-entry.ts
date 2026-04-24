/**
 * Web版本入口文件
 * @version v0.8.0
 * @since 2026-04-25
 */

import { initWebGame } from './web/WebGame';
import { EventBus } from './core/EventBus';
import { GameEventType } from './core/EventBus';

// 调试事件绑定
EventBus.on(GameEventType.LEVEL_START, (levelId: number) => {
  console.log(`[Web] 关卡开始: ${levelId}`);
});

EventBus.on(GameEventType.RIDER_START_MOVE, (rider: any) => {
  console.log(`[Web] 韦手出发: ${rider.id}`);
});

EventBus.on(GameEventType.RIDER_DELIVERED, (rider: any) => {
  console.log(`[Web] 韦手送达: ${rider.id}`);
});

EventBus.on(GameEventType.RIDER_CRASHED, (data: any) => {
  console.log(`[Web] 碰撞: ${data.rider1?.id} ${data.rider2?.id || ''}`);
});

EventBus.on(GameEventType.LEVEL_COMPLETE, (data: any) => {
  console.log(`[Web] 关卡完成: ${data.levelId}, 星级: ${data.stars}`);
});

EventBus.on(GameEventType.LEVEL_FAILED, (data: any) => {
  console.log(`[Web] 关卡失败: ${data.levelId}, 原因: ${data.reason}`);
});

// 启动游戏
document.addEventListener('DOMContentLoaded', () => {
  console.log('========================================');
  console.log('  外卖冲冲冲 - Web试玩版');
  console.log('  版本: v0.8.0-alpha');
  console.log('========================================');

  initWebGame();
});