/**
 * 入口文件
 * @version v0.2.0
 * @since 2026-04-25
 */

// 导出核心类
export { Rider, RiderState, RiderType, Direction, Position, RiderConfig, CollisionResult } from './core/Rider';
export { Obstacle, ObstacleType, TrafficLightState, ObstacleConfig } from './core/Obstacle';
export { Level, LevelState, LevelConfig, Exit } from './core/Level';
export { GameEngine, GameState } from './core/GameEngine';
export { LevelManager } from './core/LevelManager';
export { CollisionDetector, CollisionType, CollisionResult as CollisionResultType } from './core/CollisionDetector';
export { EventBus, GameEventType } from './core/EventBus';

// 导出UI组件
export { MenuScene } from './ui/MenuScene';
export { LevelSelectScene } from './ui/LevelSelectScene';
export { GameScene } from './ui/GameScene';
export { ResultPanel } from './ui/ResultPanel';
export { FailPanel } from './ui/FailPanel';
export { HUD } from './ui/HUD';

// 导出工具类
export { Utils } from './utils/Utils';
export { MathUtils } from './utils/MathUtils';
export { AudioMgr } from './utils/AudioMgr';
export { AdMgr } from './utils/AdMgr';
export { StorageMgr } from './utils/StorageMgr';
export { ExpressionManager, ExpressionType } from './utils/ExpressionManager';
export { QuoteManager, QuoteType } from './utils/QuoteManager';

// 导出数据类型
export type { LevelDataJSON, RiderDataJSON, ObstacleDataJSON, ExitDataJSON } from './core/LevelManager';

import { GameEngine } from './core/GameEngine';
import { LevelManager } from './core/LevelManager';
import { EventBus, GameEventType } from './core/EventBus';
import { AudioMgr } from './utils/AudioMgr';
import { ExpressionManager } from './utils/ExpressionManager';
import { QuoteManager } from './utils/QuoteManager';

// 关卡数据（内联导入）
import levelsData from './data/levels.json';

/**
 * 游戏配置
 */
export const GameConfig = {
  name: '外卖冲冲冲',
  version: '0.2.0-alpha',
  maxLevels: 100
};

/**
 * 游戏初始化
 */
function initGame(): void {
  console.log('========================================');
  console.log('  外卖冲冲冲 - 微信小游戏');
  console.log(`  版本: ${GameConfig.version}`);
  console.log('========================================');

  // 1. 初始化事件总线
  const eventBus = EventBus.getInstance();
  console.log('[Init] EventBus 初始化完成');

  // 2. 加载关卡数据
  const levelManager = LevelManager.getInstance();
  levelManager.loadData(levelsData);
  console.log(`[Init] LevelManager 加载完成，共 ${levelManager.getAllLevelIds().length} 关`);

  // 3. 初始化音效管理器
  const audioMgr = AudioMgr.getInstance();
  audioMgr.preload(['click', 'launch', 'success', 'crash', 'level_complete', 'level_fail']);
  console.log('[Init] AudioMgr 初始化完成');

  // 4. 初始化表情管理器
  const expressionMgr = ExpressionManager.getInstance();
  console.log('[Init] ExpressionManager 初始化完成');

  // 5. 初始化台词管理器
  const quoteMgr = QuoteManager.getInstance();
  console.log('[Init] QuoteManager 初始化完成');

  // 6. 初始化游戏引擎
  const engine = GameEngine.getInstance();
  engine.init();
  console.log('[Init] GameEngine 初始化完成');

  // 7. 启动游戏
  engine.start();
  console.log('[Init] 游戏启动成功');

  // 8. 绑定全局事件监听（调试）
  bindDebugEvents();

  console.log('========================================');
  console.log('  游戏初始化完成，等待用户操作');
  console.log('========================================');
}

/**
 * 绑定调试事件
 */
function bindDebugEvents(): void {
  const eventBus = EventBus.getInstance();

  // 关卡事件
  eventBus.on(GameEventType.LEVEL_START, (levelId: number) => {
    console.log(`[Event] 关卡开始: ${levelId}`);
  });

  eventBus.on(GameEventType.LEVEL_COMPLETE, (levelId: number) => {
    console.log(`[Event] 关卡完成: ${levelId}`);
  });

  eventBus.on(GameEventType.LEVEL_FAILED, (levelId: number) => {
    console.log(`[Event] 关卡失败: ${levelId}`);
  });

  // 韦手事件
  eventBus.on(GameEventType.RIDER_SELECTED, (riderId: string) => {
    console.log(`[Event] 韦手选中: ${riderId}`);
  });

  eventBus.on(GameEventType.RIDER_DELIVERED, (rider: any) => {
    console.log(`[Event] 韦手送达: ${rider.id}`);
  });

  eventBus.on(GameEventType.RIDER_CRASHED, (rider: any) => {
    console.log(`[Event] 韦手撞车: ${rider.id}`);
  });

  // 广告事件
  eventBus.on(GameEventType.AD_SHOW, (type: string) => {
    console.log(`[Event] 广告展示: ${type}`);
  });

  eventBus.on(GameEventType.AD_COMPLETE, () => {
    console.log('[Event] 广告完成');
  });

  eventBus.on(GameEventType.AD_CANCELLED, () => {
    console.log('[Event] 广告取消');
  });
}

/**
 * 测试关卡加载
 */
function testLevelLoad(): void {
  const engine = GameEngine.getInstance();

  // 加载第1关
  engine.loadLevel(1);

  if (engine.currentLevel) {
    console.log('测试关卡加载成功');
    console.log(`关卡名称: ${engine.currentLevel.name}`);
    console.log(`骑手数量: ${engine.currentLevel.totalRiders}`);
    console.log(`网格大小: ${engine.currentLevel.gridSize.width}x${engine.currentLevel.gridSize.height}`);
  }
}

// 游戏启动
initGame();

// 开发阶段测试
if (typeof window !== 'undefined') {
  (window as any).GameEngine = GameEngine;
  (window as any).EventBus = EventBus;
  (window as any).testLevelLoad = testLevelLoad;
}