/**
 * 场景管理器
 * @description 管理游戏场景切换、过渡动画、场景状态
 * @version v0.1.0
 * @since 2026-04-25
 */

import { EventBus, GameEventType } from '../core/EventBus';
import { GameEngine } from '../core/GameEngine';
import { Level } from '../core/Level';
import { PlatformAdapter } from './PlatformAdapter';

/** 场景类型 */
export enum SceneType {
  MENU = 'menu',
  LEVEL_SELECT = 'level_select',
  GAME = 'game',
  RESULT = 'result',
  FAIL = 'fail'
}

/** 场景状态 */
export enum SceneState {
  NONE = 'none',
  LOADING = 'loading',
  READY = 'ready',
  RUNNING = 'running',
  PAUSED = 'paused',
  TRANSITIONING = 'transitioning'
}

/** 场景配置 */
interface SceneConfig {
  type: SceneType;
  preload?: string[];
  fadeDuration?: number;
}

/**
 * 场景管理器（单例）
 */
export class SceneManager {
  // ========== 属性 ==========

  /** 单例实例 */
  private static instance: SceneManager;

  /** 当前场景 */
  private currentScene: SceneType = SceneType.MENU;

  /** 当前场景状态 */
  private sceneState: SceneState = SceneState.NONE;

  /** 场景历史栈 */
  private sceneHistory: SceneType[] = [];

  /** 待加载关卡ID */
  private pendingLevelId: number = 0;

  /** 游戏引擎 */
  private engine: GameEngine;

  /** 过渡动画时长（毫秒） */
  private fadeDuration: number = 300;

  /** 平台适配器 */
  private platform: PlatformAdapter;

  // ========== 构造函数 ==========

  constructor() {
    if (SceneManager.instance) {
      return SceneManager.instance;
    }
    SceneManager.instance = this;
    this.engine = GameEngine.getInstance();
    this.platform = PlatformAdapter.getInstance();
    this.bindEvents();
  }

  // ========== 公共方法 ==========

  /**
   * 获取单例
   */
  static getInstance(): SceneManager {
    if (!SceneManager.instance) {
      SceneManager.instance = new SceneManager();
    }
    return SceneManager.instance;
  }

  /**
   * 获取当前场景
   */
  getCurrentScene(): SceneType {
    return this.currentScene;
  }

  /**
   * 获取场景状态
   */
  getSceneState(): SceneState {
    return this.sceneState;
  }

  /**
   * 切换到菜单场景
   */
  toMenu(): void {
    this.switchScene(SceneType.MENU);
  }

  /**
   * 切换到关卡选择场景
   */
  toLevelSelect(): void {
    this.switchScene(SceneType.LEVEL_SELECT);
  }

  /**
   * 切换到游戏场景
   * @param levelId 关卡ID
   */
  toGame(levelId: number): void {
    this.pendingLevelId = levelId;
    this.switchScene(SceneType.GAME);
  }

  /**
   * 切换到结算场景
   * @param levelId 关卡ID
   * @param stars 星级
   * @param completionTime 完成时间
   */
  toResult(levelId: number, stars: number, completionTime: number): void {
    this.pendingLevelId = levelId;
    // 预留：携带结算数据
    this.switchScene(SceneType.RESULT);
  }

  /**
   * 切换到失败场景
   * @param levelId 关卡ID
   * @param reason 失败原因
   */
  toFail(levelId: number, reason: string): void {
    this.pendingLevelId = levelId;
    // 预留：携带失败数据
    this.switchScene(SceneType.FAIL);
  }

  /**
   * 返回上一个场景
   */
  back(): void {
    if (this.sceneHistory.length > 0) {
      const prevScene = this.sceneHistory.pop();
      if (prevScene) {
        this.switchScene(prevScene, false);
      }
    }
  }

  /**
   * 重试当前关卡
   */
  retryLevel(): void {
    if (this.pendingLevelId > 0) {
      this.toGame(this.pendingLevelId);
    }
  }

  /**
   * 下一关
   */
  nextLevel(): void {
    const nextId = this.pendingLevelId + 1;
    const maxLevel = this.engine.getMaxLevel();

    if (nextId <= maxLevel) {
      // 解锁下一关
      this.engine.unlockLevel(nextId);
      this.toGame(nextId);
    } else {
      // 已通关所有关卡
      this.toMenu();
    }
  }

  /**
   * 暂停当前场景
   */
  pause(): void {
    if (this.sceneState === SceneState.RUNNING) {
      this.sceneState = SceneState.PAUSED;
      EventBus.emit('scene-paused', this.currentScene);
    }
  }

  /**
   * 继续当前场景
   */
  resume(): void {
    if (this.sceneState === SceneState.PAUSED) {
      this.sceneState = SceneState.RUNNING;
      EventBus.emit('scene-resumed', this.currentScene);
    }
  }

  /**
   * 获取待加载关卡ID
   */
  getPendingLevelId(): number {
    return this.pendingLevelId;
  }

  // ========== 私有方法 ==========

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    // 关卡完成 -> 结算场景
    EventBus.on(GameEventType.LEVEL_COMPLETE, (data: any) => {
      this.toResult(data.levelId, data.stars, data.time);
    });

    // 关卡失败 -> 失败场景
    EventBus.on(GameEventType.LEVEL_FAILED, (data: any) => {
      this.toFail(data.levelId, data.reason || '未知原因');
    });

    // 按钮点击事件
    EventBus.on('btn-home', () => this.toMenu());
    EventBus.on('btn-retry', () => this.retryLevel());
    EventBus.on('btn-next', () => this.nextLevel());
    EventBus.on('btn-back', () => this.back());
    EventBus.on('btn-pause', () => this.pause());
    EventBus.on('btn-resume', () => this.resume());
  }

  /**
   * 切换场景
   * @param targetScene 目标场景
   * @param saveHistory 是否保存历史
   */
  private switchScene(targetScene: SceneType, saveHistory: boolean = true): void {
    // 防止重复切换
    if (this.currentScene === targetScene && this.sceneState === SceneState.RUNNING) {
      return;
    }

    // 设置状态为过渡中
    this.sceneState = SceneState.TRANSITIONING;

    // 保存历史
    if (saveHistory) {
      this.sceneHistory.push(this.currentScene);
    }

    // 触发退出事件
    EventBus.emit('scene-exit', this.currentScene);

    // 执行过渡动画（预留）
    this.doTransition(targetScene);

    // 更新当前场景
    this.currentScene = targetScene;

    // 触发进入事件
    EventBus.emit('scene-enter', targetScene);

    // 设置状态为就绪
    this.sceneState = SceneState.READY;

    // 如果是游戏场景，立即开始加载关卡
    if (targetScene === SceneType.GAME && this.pendingLevelId > 0) {
      this.loadLevel(this.pendingLevelId);
    }

    // 设置状态为运行
    this.sceneState = SceneState.RUNNING;

    console.log(`场景切换: ${this.sceneHistory[this.sceneHistory.length - 1]} -> ${targetScene}`);
  }

  /**
   * 执行过渡动画
   * @param targetScene 目标场景
   */
  private doTransition(targetScene: SceneType): void {
    // 预留：淡入淡出动画
    // Cocos Creator 实现时使用 tween 或 UI 动画
    console.log(`过渡动画: ${this.fadeDuration}ms`);
  }

  /**
   * 加载关卡
   * @param levelId 关卡ID
   */
  private loadLevel(levelId: number): void {
    // 设置状态为加载中
    this.sceneState = SceneState.LOADING;

    // 从引擎加载关卡数据
    const levelConfig = this.engine.getLevelConfig(levelId);

    if (levelConfig) {
      EventBus.emit('level-loading', levelId);

      // 触发关卡加载完成事件
      EventBus.emit('level-loaded', levelConfig);
    } else {
      console.error(`关卡 ${levelId} 不存在`);
      this.back();
    }
  }

  /**
   * 获取场景历史
   */
  getHistory(): SceneType[] {
    return [...this.sceneHistory];
  }

  /**
   * 清空历史
   */
  clearHistory(): void {
    this.sceneHistory = [];
  }
}