/**
 * 入口文件
 * @version v0.1.0
 * @since 2026-04-24
 */

// 导出核心类
export { Rider, RiderState, RiderType, Direction } from './core/Rider';
export { Obstacle, ObstacleType, TrafficLightState } from './core/Obstacle';
export { Level, LevelState } from './core/Level';
export { GameEngine, GameState } from './core/GameEngine';
export { CollisionDetector, CollisionType } from './core/CollisionDetector';
export { EventBus, GameEventType } from './core/EventBus';

// 导出工具类
export { Utils } from './utils/Utils';
export { MathUtils } from './utils/MathUtils';
export { AudioMgr } from './utils/AudioMgr';
export { AdMgr } from './utils/AdMgr';
export { StorageMgr } from './utils/StorageMgr';

/**
 * 游戏初始化
 */
function initGame(): void {
  console.log('外卖冲冲冲 - 游戏初始化');

  // 初始化游戏引擎
  const engine = new GameEngine();
  engine.init();
  engine.start();

  // 初始化存储
  const storage = StorageMgr.getInstance();

  // 加载进度
  engine.loadProgress();

  console.log('游戏初始化完成');
}

// 游戏启动
initGame();