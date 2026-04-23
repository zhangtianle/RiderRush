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

/**
 * 游戏主引擎
 * @description 游戏的核心管理器，负责关卡加载、状态管理、系统协调
 * @version v0.1.0
 * @since 2026-04-24
 */
export class GameEngine {
  // ========== 属性 ==========

  /** 当前关卡 */
  currentLevel: any | null;

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

  // 管理器（预留）
  collisionDetector: any;
  audioManager: any;
  adManager: any;
  storageManager: any;

  // ========== 构造函数 ==========

  constructor() {
    this.currentLevel = null;
    this.gameState = GameState.MENU;
    this.unlockedLevels = [1]; // 默认解锁第1关
    this.completedLevels = [];
    this.currentLevelId = 0;
    this.maxLevelId = 100; // 最大关卡数
  }

  // ========== 公共方法 ==========

  /**
   * 初始化引擎
   * @description 游戏启动时的初始化
   */
  init(): void {
    // 加载存储的进度
    this.loadProgress();

    // 初始化各管理器（预留）
    // this.audioManager = new AudioManager();
    // this.adManager = new AdManager();
    // this.storageManager = new StorageManager();
  }

  /**
   * 启动游戏
   * @description 开始游戏主循环
   */
  start(): void {
    this.gameState = GameState.MENU;
    // 进入主菜单场景
  }

  /**
   * 主循环更新
   * @description 每帧更新游戏状态
   * @param dt 时间增量（秒）
   */
  update(dt: number): void {
    if (this.gameState === GameState.PLAYING && this.currentLevel) {
      this.currentLevel.update(dt);
    }
  }

  /**
   * 加载关卡
   * @description 加载指定关卡
   * @param levelId 关卡ID
   */
  loadLevel(levelId: number): void {
    // 检查关卡是否解锁
    if (!this.unlockedLevels.includes(levelId)) {
      console.warn(`关卡 ${levelId} 未解锁`);
      return;
    }

    this.currentLevelId = levelId;

    // 加载关卡数据（预留）
    // const levelConfig = LevelData.getLevel(levelId);
    // this.currentLevel = new Level(levelConfig);

    this.gameState = GameState.PLAYING;
  }

  /**
   * 开始当前关卡
   * @description 开始已加载的关卡
   */
  startLevel(): void {
    if (this.currentLevel) {
      this.currentLevel.init();
      this.currentLevel.start();
    }
  }

  /**
   * 暂停当前关卡
   * @description 暂停游戏
   */
  pauseLevel(): void {
    if (this.currentLevel) {
      this.currentLevel.pause();
      this.gameState = GameState.PAUSED;
    }
  }

  /**
   * 继续当前关卡
   * @description 从暂停恢复
   */
  resumeLevel(): void {
    if (this.currentLevel) {
      this.currentLevel.resume();
      this.gameState = GameState.PLAYING;
    }
  }

  /**
   * 重试当前关卡
   * @description 重置并重新开始当前关卡
   */
  retryLevel(): void {
    if (this.currentLevel) {
      this.currentLevel.reset();
      this.currentLevel.start();
      this.gameState = GameState.PLAYING;
    }
  }

  /**
   * 进入下一关
   * @description 当前关卡通关后进入下一关
   */
  nextLevel(): void {
    const nextId = this.currentLevelId + 1;

    if (nextId <= this.maxLevelId) {
      // 解锁下一关
      if (!this.unlockedLevels.includes(nextId)) {
        this.unlockedLevels.push(nextId);
      }

      this.loadLevel(nextId);
    } else {
      // 已通关所有关卡
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

    // 微信小游戏存储
    try {
      // wx.setStorageSync('game_progress', progress);
      localStorage.setItem('game_progress', JSON.stringify(progress));
    } catch (e) {
      console.error('保存进度失败', e);
    }
  }

  /**
   * 加载进度
   * @description 从本地存储加载游戏进度
   */
  loadProgress(): void {
    try {
      // const progress = wx.getStorageSync('game_progress');
      const saved = localStorage.getItem('game_progress');
      if (saved) {
        const progress = JSON.parse(saved);
        this.unlockedLevels = progress.unlockedLevels || [1];
        this.completedLevels = progress.completedLevels || [];
      }
    } catch (e) {
      console.error('加载进度失败', e);
    }
  }

  /**
   * 关卡完成处理
   * @description 关卡通关后处理
   */
  onLevelComplete(): void {
    // 记录通关
    if (!this.completedLevels.includes(this.currentLevelId)) {
      this.completedLevels.push(this.currentLevelId);
    }

    // 保存进度
    this.saveProgress();

    // 进入结算界面
    this.gameState = GameState.RESULT;
  }

  /**
   * 关卡失败处理
   * @description 关卡失败后处理
   */
  onLevelFailed(): void {
    // 进入失败界面，提供重试或看广告复活
    this.gameState = GameState.RESULT;
  }

  /**
   * 显示广告
   * @description 触发广告展示
   * @param type 广告类型
   */
  showAd(type: string): void {
    // 预留广告SDK调用
    console.log(`显示广告: ${type}`);
  }

  /**
   * 分享结果
   * @description 分享关卡结果
   */
  shareResult(): void {
    // 预留分享功能
    console.log('分享结果');
  }
}