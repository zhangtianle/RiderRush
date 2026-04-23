/**
 * 游戏状态枚举
 */
export enum GameState {
  MENU = 'MENU',           // 主菜单
  LEVEL_SELECT = 'LEVEL_SELECT',  // 关卡选择
  PLAYING = 'PLAYING',    // 游戏进行中
  PAUSED = 'PAUSED',      // 暂停
  RESULT = 'RESULT'       // 结算
}

import { Level, LevelState } from './Level';
import { LevelManager } from './LevelManager';
import { EventBus, GameEventType } from './EventBus';
import { AudioMgr } from '../utils/AudioMgr';
import { AdMgr } from '../utils/AdMgr';
import { StorageMgr } from '../utils/StorageMgr';

/**
 * 游戏主引擎
 * @description 游戏的核心管理器，负责关卡加载、状态管理、系统协调
 * @version v0.2.0
 * @since 2026-04-25
 */
export class GameEngine {
  // ========== 属性 ==========

  /** 当前关卡 */
  currentLevel: Level | null = null;

  /** 游戏状态 */
  gameState: GameState;

  /** 已解锁关卡列表 */
  unlockedLevels: number[];

  /** 已通关关卡列表 */
  completedLevels: number[];

  /** 当前关卡ID */
  currentLevelId: number;

  /** 最高关卡ID */
  maxLevelId: number;

  /** 关卡管理器 */
  levelManager: LevelManager;

  /** 音效管理器 */
  audioManager: AudioMgr;

  /** 广告管理器 */
  adManager: AdMgr;

  /** 存储管理器 */
  storageManager: StorageMgr;

  /** 单例 */
  private static instance: GameEngine;

  // ========== 构造函数 ==========

  constructor() {
    if (GameEngine.instance) {
      return GameEngine.instance;
    }
    GameEngine.instance = this;

    this.currentLevel = null;
    this.gameState = GameState.MENU;
    this.unlockedLevels = [1];
    this.completedLevels = [];
    this.currentLevelId = 0;
    this.maxLevelId = 100;

    // 初始化管理器
    this.levelManager = LevelManager.getInstance();
    this.audioManager = AudioMgr.getInstance();
    this.adManager = AdMgr.getInstance();
    this.storageManager = StorageMgr.getInstance();
  }

  // ========== 单例获取 ==========

  /**
   * 获取单例实例
   * @returns GameEngine实例
   */
  static getInstance(): GameEngine {
    if (!GameEngine.instance) {
      GameEngine.instance = new GameEngine();
    }
    return GameEngine.instance;
  }

  // ========== 公共方法 ==========

  /**
   * 初始化引擎
   * @description 游戏启动时的初始化
   */
  init(): void {
    console.log('GameEngine 初始化');

    // 加载存储的进度
    this.loadProgress();

    // 获取最大关卡ID
    this.maxLevelId = this.levelManager.getMaxLevelId();

    // 初始化广告（预留实际广告ID）
    // this.adManager.init('YOUR_AD_UNIT_ID');

    // 绑定事件
    this.bindEvents();

    console.log(`GameEngine 初始化完成，已解锁关卡: ${this.unlockedLevels}`);
  }

  /**
   * 启动游戏
   * @description 开始游戏主循环
   */
  start(): void {
    this.gameState = GameState.MENU;
    console.log('游戏启动，进入主菜单');
  }

  /**
   * 主循环更新
   * @description 每帧更新游戏状态
   * @param dt 时间增量（秒）
   */
  update(dt: number): void {
    if (this.gameState === GameState.PLAYING && this.currentLevel) {
      this.currentLevel.update(dt);
      this.checkLevelState();
    }

    // 更新广告冷却时间
    this.adManager.updateCooldown(dt * 1000);
  }

  /**
   * 加载关卡
   * @description 加载指定关卡
   * @param levelId 关卡ID
   */
  loadLevel(levelId: number): void {
    console.log(`尝试加载关卡 ${levelId}`);

    // 检查关卡是否存在
    if (!this.levelManager.hasLevel(levelId)) {
      console.error(`关卡 ${levelId} 不存在`);
      return;
    }

    // 检查关卡是否解锁（开发阶段暂时跳过）
    // if (!this.unlockedLevels.includes(levelId)) {
    //   console.warn(`关卡 ${levelId} 未解锁`);
    //   return;
    // }

    this.currentLevelId = levelId;

    // 创建关卡实例
    this.currentLevel = this.levelManager.createLevel(levelId);

    if (this.currentLevel) {
      this.gameState = GameState.PLAYING;
      EventBus.emit(GameEventType.LEVEL_START, levelId);
      console.log(`关卡 ${levelId} 加载成功`);
    } else {
      console.error(`关卡 ${levelId} 创建失败`);
    }
  }

  /**
   * 开始当前关卡
   * @description 开始已加载的关卡
   */
  startLevel(): void {
    if (this.currentLevel) {
      this.currentLevel.init();
      this.currentLevel.start();
      this.gameState = GameState.PLAYING;
      console.log('关卡开始');
    }
  }

  /**
   * 暂停当前关卡
   * @description 暂停游戏
   */
  pauseLevel(): void {
    if (this.currentLevel && this.gameState === GameState.PLAYING) {
      this.currentLevel.pause();
      this.gameState = GameState.PAUSED;
      EventBus.emit(GameEventType.GAME_PAUSE);
      console.log('游戏暂停');
    }
  }

  /**
   * 继续当前关卡
   * @description 从暂停恢复
   */
  resumeLevel(): void {
    if (this.currentLevel && this.gameState === GameState.PAUSED) {
      this.currentLevel.resume();
      this.gameState = GameState.PLAYING;
      EventBus.emit(GameEventType.GAME_RESUME);
      console.log('游戏继续');
    }
  }

  /**
   * 重试当前关卡
   * @description 重置并重新开始当前关卡
   */
  retryLevel(): void {
    console.log('重试关卡');

    if (this.currentLevel) {
      this.currentLevel.reset();
      this.currentLevel.start();
      this.gameState = GameState.PLAYING;
    } else {
      // 如果没有当前关卡，重新加载
      this.loadLevel(this.currentLevelId);
      this.startLevel();
    }
  }

  /**
   * 进入下一关
   * @description 当前关卡通关后进入下一关
   */
  nextLevel(): void {
    console.log('进入下一关');

    const nextId = this.currentLevelId + 1;

    if (nextId <= this.maxLevelId) {
      // 解锁下一关
      if (!this.unlockedLevels.includes(nextId)) {
        this.unlockedLevels.push(nextId);
      }

      // 加载下一关
      this.loadLevel(nextId);
    } else {
      // 已通关所有关卡
      console.log('已通关所有关卡');
      this.gameState = GameState.MENU;
    }
  }

  /**
   * 保存进度
   * @description 保存游戏进度到本地存储
   */
  saveProgress(): void {
    const progress = {
      unlockedLevels: this.unlockedLevels,
      completedLevels: this.completedLevels,
      currentLevelId: this.currentLevelId
    };

    this.storageManager.set('game_progress', progress);
    EventBus.emit(GameEventType.GAME_SAVE);
    console.log('进度已保存');
  }

  /**
   * 加载进度
   * @description 从本地存储加载游戏进度
   */
  loadProgress(): void {
    const progress = this.storageManager.get<{
      unlockedLevels: number[];
      completedLevels: number[];
      currentLevelId: number;
    }>('game_progress');

    if (progress) {
      this.unlockedLevels = progress.unlockedLevels || [1];
      this.completedLevels = progress.completedLevels || [];
      this.currentLevelId = progress.currentLevelId || 0;
      console.log('进度已加载');
    } else {
      this.unlockedLevels = [1];
      this.completedLevels = [];
      console.log('无保存进度，使用默认状态');
    }

    EventBus.emit(GameEventType.GAME_LOAD);
  }

  /**
   * 广告复活
   * @description 观看广告后复活当前关卡
   */
  reviveByAd(): void {
    console.log('广告复活');

    if (this.currentLevel) {
      // 复活逻辑：重置时间，保留已送达的骑手
      this.currentLevel.revive();
      this.gameState = GameState.PLAYING;
    }
  }

  /**
   * 显示广告
   * @description 触发广告展示
   * @param type 广告类型
   */
  showAd(type: string): Promise<boolean> {
    EventBus.emit(GameEventType.AD_SHOW, type);
    return this.adManager.show();
  }

  /**
   * 分享结果
   * @description 分享关卡结果
   */
  shareResult(): void {
    // 预留分享功能
    console.log('分享结果');

    if (typeof wx !== 'undefined') {
      wx.shareAppMessage({
        title: `我在外卖冲冲冲完成了关卡${this.currentLevelId}！`,
        imageUrl: '' // 预留分享图片
      });
    }
  }

  // ========== 私有方法 ==========

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    // 监听关卡完成
    EventBus.on(GameEventType.LEVEL_COMPLETE, this.onLevelComplete, this);

    // 监听关卡失败
    EventBus.on(GameEventType.LEVEL_FAILED, this.onLevelFailed, this);

    // 监听广告完成
    EventBus.on(GameEventType.AD_COMPLETE, this.onAdComplete, this);
  }

  /**
   * 检查关卡状态
   */
  private checkLevelState(): void {
    if (!this.currentLevel) {
      return;
    }

    if (this.currentLevel.state === LevelState.SUCCESS) {
      EventBus.emit(GameEventType.LEVEL_COMPLETE, this.currentLevelId);
    } else if (this.currentLevel.state === LevelState.FAILED) {
      EventBus.emit(GameEventType.LEVEL_FAILED, this.currentLevelId);
    }
  }

  /**
   * 关卡完成回调
   * @param levelId 关卡ID
   */
  private onLevelComplete(levelId: number): void {
    console.log(`关卡 ${levelId} 完成`);

    this.audioManager.play('level_complete');

    // 记录通关
    if (!this.completedLevels.includes(levelId)) {
      this.completedLevels.push(levelId);
    }

    // 解锁下一关
    const nextId = levelId + 1;
    if (nextId <= this.maxLevelId && !this.unlockedLevels.includes(nextId)) {
      this.unlockedLevels.push(nextId);
    }

    // 保存进度
    this.saveProgress();

    // 进入结算界面
    this.gameState = GameState.RESULT;
  }

  /**
   * 关卡失败回调
   * @param levelId 关卡ID
   */
  private onLevelFailed(levelId: number): void {
    console.log(`关卡 ${levelId} 失败`);

    this.audioManager.play('level_fail');

    // 进入失败界面，提供重试或看广告复活
    this.gameState = GameState.RESULT;
  }

  /**
   * 广告完成回调
   */
  private onAdComplete(): void {
    console.log('广告观看完成');
    this.reviveByAd();
  }
}