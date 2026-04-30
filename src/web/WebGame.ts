/**
 * Web版本游戏主类
 * @description 整合游戏逻辑和Canvas渲染，实现浏览器可运行版本
 * @version v0.9.0
 * @since 2026-04-25
 */

import { GameLogicController } from '../core/GameLogicController';
import { Level, LevelState } from '../core/Level';
import { Rider, RiderState, RiderType, Position } from '../core/Rider';
import { EventBus, GameEventType } from '../core/EventBus';
import { GameRenderer } from './GameRenderer';
import { LevelManager } from '../core/LevelManager';
import { PathDrawer } from '../core/PathDrawer';
import { LeaderboardManager } from '../core/LeaderboardManager';
import { StoryManager } from '../utils/StoryManager';
import levelsData from '../data/levels.json';
import storyData from '../data/story.json';

/** 游戏状态 */
enum WebGameState {
  MENU = 'menu',
  LEVEL_SELECT = 'level_select',
  PLAYING = 'playing',
  PAUSED = 'paused',
  RESULT = 'result',
  FAIL = 'fail',
  STORY = 'story',        // 显示剧情对话
  CHAPTER_INTRO = 'chapter_intro'  // 显示章节介绍
}

/**
 * Web版本游戏
 */
export class WebGame {
  // ========== 属性 ==========

  private renderer: GameRenderer;
  private controller: GameLogicController;
  private levelManager: LevelManager;
  private pathDrawer: PathDrawer;
  private leaderboard: LeaderboardManager;
  private storyManager: StoryManager;

  private state: WebGameState = WebGameState.MENU;
  private currentLevelId: number = 1;
  private lastTime: number = 0;
  private animationId: number = 0;

  /** 路径绘制中选中的骑手 */
  private selectedRider: Rider | null = null;

  /** 故事动画进度 */
  private storyProgress: number = 0;

  /** 章节介绍动画进度 */
  private chapterProgress: number = 0;

  // UI元素
  private menuScreen: HTMLElement;
  private levelSelectScreen: HTMLElement;
  private resultPanel: HTMLElement;
  private failPanel: HTMLElement;
  private vipWarning: HTMLElement;
  private levelInfo: HTMLElement;
  private timerDisplay: HTMLElement;
  private deliveredDisplay: HTMLElement;
  private hintDisplay: HTMLElement;
  private quoteBubble: HTMLElement;
  private instructions: HTMLElement;
  private goBtn: HTMLElement;
  private redrawBtn: HTMLElement;
  private pathStatus: HTMLElement;

  // 故事UI元素
  private storyLayer: HTMLElement;
  private storyCharacter: HTMLElement;
  private storyContent: HTMLElement;
  private chapterIntroLayer: HTMLElement;
  private chapterTitleEl: HTMLElement;
  private chapterIntroText: HTMLElement;
  private menuStoryToggle: HTMLElement;

  // ========== 构造函数 ==========

  constructor(canvasId: string) {
    console.log('[WebGame] 构造函数开始');

    this.bindPlaceholderFunctions();

    try {
      this.renderer = new GameRenderer(canvasId);
      this.controller = new GameLogicController();
      this.levelManager = LevelManager.getInstance();
      this.levelManager.loadData(levelsData);
      this.pathDrawer = this.controller.getPathDrawer();
      this.leaderboard = LeaderboardManager.getInstance();
      this.storyManager = StoryManager.getInstance();
      this.storyManager.loadData(storyData);

      // 获取UI元素
      this.menuScreen = document.getElementById('menu-screen')!;
      this.levelSelectScreen = document.getElementById('level-select-screen')!;
      this.resultPanel = document.getElementById('result-panel')!;
      this.failPanel = document.getElementById('fail-panel')!;
      this.vipWarning = document.getElementById('vip-warning')!;
      this.levelInfo = document.getElementById('level-info')!;
      this.timerDisplay = document.getElementById('timer')!;
      this.deliveredDisplay = document.getElementById('delivered')!;
      this.hintDisplay = document.getElementById('hint')!;
      this.quoteBubble = document.getElementById('quote-bubble')!;
      this.instructions = document.getElementById('instructions')!;
      this.goBtn = document.getElementById('go-btn')!;
      this.redrawBtn = document.getElementById('redraw-btn')!;
      this.pathStatus = document.getElementById('path-status')!;

      // 故事UI元素
      this.storyLayer = document.getElementById('story-layer')!;
      this.storyCharacter = document.getElementById('story-character')!;
      this.storyContent = document.getElementById('story-content')!;
      this.chapterIntroLayer = document.getElementById('chapter-intro-layer')!;
      this.chapterTitleEl = document.getElementById('chapter-title')!;
      this.chapterIntroText = document.getElementById('chapter-intro-text')!;
      this.menuStoryToggle = document.getElementById('menu-story-toggle')!;

      // 初始化故事开关状态
      this.updateStoryToggleUI();

      // 绑定事件
      this.bindEvents();
      this.bindCanvasEvents();
      this.bindPathDrawerCallbacks();

      // 屏幕尺寸变化时重新适配
      window.addEventListener('resize', () => this.onResize());
      window.addEventListener('orientationchange', () => setTimeout(() => this.onResize(), 200));

      // 显示菜单
      this.showMenu();

      // 绑定全局函数
      this.bindGlobalFunctions();

      console.log('[WebGame] 构造函数完成');
    } catch (error: any) {
      console.error('[WebGame] 初始化错误:', error);
      alert('游戏初始化失败: ' + error.message);
    }
  }

  // ========== 公共方法 ==========

  start(): void {
    this.lastTime = performance.now();
    this.gameLoop();
    console.log('WebGame启动');
  }

  showMenu(): void {
    this.state = WebGameState.MENU;
    this.menuScreen.classList.remove('hidden');
    this.levelSelectScreen.classList.remove('visible');
    this.resultPanel.classList.remove('visible');
    this.failPanel.classList.remove('visible');
    this.vipWarning.classList.remove('visible');
    this.instructions.style.display = 'none';
    this.goBtn.style.display = 'none';
    this.redrawBtn.style.display = 'none';
    this.pathStatus.style.display = 'none';
    this.renderer.clear();
  }

  showLevelSelect(): void {
    this.state = WebGameState.LEVEL_SELECT;
    this.menuScreen.classList.add('hidden');
    this.levelSelectScreen.classList.add('visible');
    this.renderLevelGrid();
  }

  hideLevelSelect(): void {
    this.state = WebGameState.MENU;
    this.levelSelectScreen.classList.remove('visible');
    this.menuScreen.classList.remove('hidden');
  }

  startGame(): void {
    this.currentLevelId = 1;
    this.loadLevel(1);
  }

  loadLevel(levelId: number): void {
    console.log(`[WebGame] loadLevel(${levelId})`);

    const config = this.levelManager.getLevelConfig(levelId);
    if (!config) {
      console.error(`关卡 ${levelId} 不存在`);
      return;
    }

    const level = new Level(config);
    this.controller.setLevel(level);

    // 根据屏幕自适应计算cellSize并设置画布
    this.renderer.fitToScreen(level.gridSize.width, level.gridSize.height);

    // ========== 故事触发检查（优先级最高） ==========
    // 先隐藏所有面板
    this.resultPanel.classList.remove('visible');
    this.failPanel.classList.remove('visible');
    this.vipWarning.classList.remove('visible');

    // 1. 先检查章节介绍
    if (this.storyManager.shouldShowChapterIntro(levelId)) {
      const chapter = this.storyManager.getCurrentChapter(levelId);
      if (chapter) {
        // 设置UI状态（不设置PLAYING，等待故事完成）
        this.menuScreen.classList.add('hidden');
        this.levelSelectScreen.classList.remove('visible');
        this.levelInfo.textContent = `关卡 ${levelId} - ${level.name}`;
        this.deliveredDisplay.textContent = `送达: 0/${level.riders.length}`;

        this.showChapterIntro(chapter.id, chapter.title, chapter.intro);
        console.log(`[WebGame] 显示章节介绍: 第${chapter.id}章`);
        return; // 等待故事完成后再启动关卡
      }
    }

    // 2. 检查关卡剧情
    if (this.storyManager.shouldShowLevelStory(levelId)) {
      const levelStory = this.storyManager.getLevelStory(levelId);
      if (levelStory) {
        // 设置UI状态
        this.menuScreen.classList.add('hidden');
        this.levelSelectScreen.classList.remove('visible');
        this.levelInfo.textContent = `关卡 ${levelId} - ${level.name}`;
        this.deliveredDisplay.textContent = `送达: 0/${level.riders.length}`;

        this.showStory(levelId, levelStory.prelude, levelStory.characters);
        console.log(`[WebGame] 显示关卡剧情`);
        return; // 等待故事完成后再启动关卡
      }
    }

    // 无故事或故事已看完，设置PLAYING状态并开始关卡
    this.state = WebGameState.PLAYING;
    this.menuScreen.classList.add('hidden');
    this.levelSelectScreen.classList.remove('visible');
    this.resultPanel.classList.remove('visible');
    this.failPanel.classList.remove('visible');
    this.vipWarning.classList.remove('visible');
    this.instructions.style.display = 'block';
    this.instructions.textContent = '点选骑手，拖拽画路径到出口';

    this.levelInfo.textContent = `关卡 ${levelId} - ${level.name}`;
    this.deliveredDisplay.textContent = `送达: 0/${level.riders.length}`;
    this.hintDisplay.textContent = '规划骑手路线';

    // 路径绘制UI
    this.goBtn.style.display = 'none';
    this.redrawBtn.style.display = 'none';
    this.pathStatus.style.display = 'block';
    this.pathStatus.textContent = `已规划: 0/${level.riders.length}`;
    this.selectedRider = null;

    // 直接开始关卡
    level.init();
    level.start();

    console.log(`[WebGame] 关卡加载完成（无故事）`);
    this.render();
  }

  retryLevel(): void {
    this.loadLevel(this.currentLevelId);
  }

  nextLevel(): void {
    const nextId = this.currentLevelId + 1;
    if (nextId <= this.levelManager.getAllLevelIds().length) {
      this.currentLevelId = nextId;
      this.loadLevel(nextId);
    } else {
      this.showMenu();
    }
  }

  togglePause(): void {
    if (this.state === WebGameState.PLAYING) {
      this.state = WebGameState.PAUSED;
      this.controller.pause();
      (document.getElementById('pause-btn') as HTMLButtonElement).textContent = '继续';
    } else if (this.state === WebGameState.PAUSED) {
      this.state = WebGameState.PLAYING;
      this.controller.resume();
      (document.getElementById('pause-btn') as HTMLButtonElement).textContent = '暂停';
    }
  }

  /**
   * 发起所有骑手
   */
  launchRiders(): void {
    if (this.controller.isLaunched()) return;

    const success = this.controller.launchAllRiders();
    if (success) {
      this.goBtn.style.display = 'none';
      this.redrawBtn.style.display = 'none';
      this.hintDisplay.textContent = '骑手出发中...';
      this.renderer.clearPathPreview();
      this.selectedRider = null;
    }
  }

  /**
   * 重画所有路径
   */
  clearPaths(): void {
    if (this.controller.isLaunched()) return;

    this.controller.clearAllPaths();
    this.selectedRider = null;
    this.renderer.clearPathPreview();
    this.updatePathStatus();
    this.hintDisplay.textContent = '重新规划路线';
  }

  /**
   * 分享复活（Web mock版本）
   */
  shareRevive(): void {
    if (confirm('分享给好友获得复活机会？\n（Web试玩版模拟分享）')) {
      const level = this.controller.getLevel();
      if (level) {
        level.revive();
        this.state = WebGameState.PLAYING;
        this.failPanel.classList.remove('visible');
        this.hintDisplay.textContent = '复活成功！继续送单！';
      }
    }
  }

  /**
   * 屏幕尺寸变化时重新适配画布
   */
  private onResize(): void {
    const level = this.controller.getLevel();
    if (!level || this.state === WebGameState.MENU || this.state === WebGameState.LEVEL_SELECT) return;
    this.renderer.fitToScreen(level.gridSize.width, level.gridSize.height);
    this.render();
  }

  // ========== 私有方法 ==========

  private gameLoop(): void {
    const currentTime = performance.now();
    const dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    if (this.state === WebGameState.PLAYING) {
      this.update(dt);
      this.render();
    }

    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  private update(dt: number): void {
    this.controller.update(dt);
    this.renderer.updateParticles(dt);
    this.renderer.updateEffects(dt);
    this.updateUI();
  }

  private render(): void {
    this.renderer.render(this.controller);
  }

  private updateUI(): void {
    const level = this.controller.getLevel();
    if (!level) return;

    // 更新时间
    if (level.timeLimit > 0) {
      const remaining = Math.ceil(level.timeRemaining);
      this.timerDisplay.textContent = `时间: ${remaining}s`;
      this.timerDisplay.style.background = remaining < 10 ? 'rgba(255,100,100,0.5)' : 'rgba(255,100,100,0.3)';
    } else {
      this.timerDisplay.textContent = `时间: ∞`;
    }

    // 更新送达数量
    const delivered = this.controller.getDeliveredCount();
    const total = this.controller.getTotalRiders();
    this.deliveredDisplay.textContent = `送达: ${delivered}/${total}`;

    if (delivered > 0) {
      this.instructions.style.display = 'none';
    }
  }

  private updatePathStatus(): void {
    const planned = this.controller.getPlannedCount();
    const total = this.controller.getTotalRiders();
    this.pathStatus.textContent = `已规划: ${planned}/${total}`;

    // 至少有1个规划了路径就显示GO按钮
    if (planned > 0 && !this.controller.isLaunched()) {
      this.goBtn.style.display = 'inline-block';
      this.redrawBtn.style.display = 'inline-block';
    } else {
      this.goBtn.style.display = 'none';
      this.redrawBtn.style.display = 'none';
    }
  }

  private bindEvents(): void {
    const eventBus = EventBus.getInstance();

    eventBus.on(GameEventType.LEVEL_COMPLETE, (data: any) => {
      this.showResult(data.stars, data.time, data.message);
    });

    eventBus.on(GameEventType.LEVEL_FAILED, (data: any) => {
      this.showFail(data.reason || '未知原因', data.message);
    });

    eventBus.on('vip-warning', () => {
      this.showVIPWarning();
    });

    // 屏幕震动
    eventBus.on(GameEventType.SCREEN_SHAKE, (data: any) => {
      this.renderer.triggerShake(data.intensity, data.duration);
    });

    // 红色闪屏
    eventBus.on(GameEventType.RED_FLASH, () => {
      this.renderer.triggerRedFlash();
    });

    // 连击
    eventBus.on(GameEventType.COMBO_ACHIEVED, (data: any) => {
      this.renderer.addComboPopup(data.count, data.position.x, data.position.y);
    });

    // 故事事件
    eventBus.on(GameEventType.SHOW_STORY, (data: any) => {
      this.showStory(data.levelId, data.prelude, data.characters);
    });

    eventBus.on(GameEventType.SHOW_CHAPTER_INTRO, (data: any) => {
      this.showChapterIntro(data.chapterId, data.title, data.intro);
    });
  }

  /**
   * 绑定路径绘制器回调
   */
  private bindPathDrawerCallbacks(): void {
    this.pathDrawer.onPathUpdate = (riderId: string, path: Position[], isValid: boolean) => {
      this.renderer.setPathPreview(riderId, path, isValid);
    };

    this.pathDrawer.onPathComplete = (riderId: string, path: Position[]) => {
      const success = this.controller.assignPath(riderId, path);
      this.renderer.clearPathPreview();
      if (success) {
        this.updatePathStatus();
        this.hintDisplay.textContent = '路径规划成功！继续规划或点击出发';
      }
      this.selectedRider = null;
    };

    this.pathDrawer.onPathCancelled = (riderId: string) => {
      this.renderer.clearPathPreview();
      this.selectedRider = null;
      this.hintDisplay.textContent = '路径无效，请重新规划';
    };
  }

  /**
   * 绑定Canvas事件 — 路径绘制交互
   */
  private bindCanvasEvents(): void {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

    // 坐标转换：CSS事件坐标 → canvas绘制坐标（两者均为CSS像素空间，无需额外缩放）
    // GameRenderer.fitToScreen已通过ctx.setTransform(dpr)处理了物理像素缩放

    // 鼠标事件
    canvas.addEventListener('mousedown', (e: MouseEvent) => {
      this.onPointerDown(e.offsetX, e.offsetY);
    });
    canvas.addEventListener('mousemove', (e: MouseEvent) => {
      this.onPointerMove(e.offsetX, e.offsetY);
    });
    canvas.addEventListener('mouseup', () => this.onPointerUp());
    canvas.addEventListener('mouseleave', () => this.onPointerUp());

    // 触摸事件
    canvas.addEventListener('touchstart', (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      this.onPointerDown(touch.clientX - rect.left, touch.clientY - rect.top);
    }, { passive: false });

    canvas.addEventListener('touchmove', (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      this.onPointerMove(touch.clientX - rect.left, touch.clientY - rect.top);
    }, { passive: false });

    canvas.addEventListener('touchend', (e: TouchEvent) => {
      e.preventDefault();
      this.onPointerUp();
    }, { passive: false });
  }

  private onPointerDown(screenX: number, screenY: number): void {
    if (this.state !== WebGameState.PLAYING) return;
    if (this.controller.isLaunched()) return;

    const gridPos = this.renderer.screenToGridFloat(screenX, screenY);
    const gridSnap = { x: Math.round(gridPos.x - 0.5), y: Math.round(gridPos.y - 0.5) };

    // 检查是否点在骑手上
    const riders = this.controller.getRiders();
    const clickedRider = riders.find(r => {
      if (r.state !== RiderState.IDLE || r.hasDelivered || r.hasPath) return false;
      const riderGridX = Math.round(r.position.x);
      const riderGridY = Math.round(r.position.y);
      return riderGridX === gridSnap.x && riderGridY === gridSnap.y;
    });

    if (clickedRider) {
      this.selectedRider = clickedRider;
      this.renderer.setHighlightedRider(clickedRider.id);
      this.pathDrawer.startDrawing(clickedRider);
      this.hintDisplay.textContent = `拖拽画${clickedRider.type === RiderType.VIP ? 'VIP' : '骑手'}路径`;
    }
  }

  private onPointerMove(screenX: number, screenY: number): void {
    if (!this.pathDrawer.drawing) return;

    const gridPos = this.renderer.screenToGridFloat(screenX, screenY);
    const gridSnap = { x: Math.round(gridPos.x - 0.5), y: Math.round(gridPos.y - 0.5) };

    this.pathDrawer.continueDrawing(gridSnap);
  }

  private onPointerUp(): void {
    if (this.pathDrawer.drawing) {
      this.pathDrawer.endDrawing();
    }
  }

  private showVIPWarning(): void {
    this.vipWarning.classList.add('visible');
    setTimeout(() => {
      this.vipWarning.classList.remove('visible');
    }, 1500);
  }

  private showResult(stars: number, time: number, message?: string): void {
    this.state = WebGameState.RESULT;
    this.resultPanel.classList.add('visible');

    const starsText = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    document.getElementById('result-stars')!.textContent = starsText;
    document.getElementById('result-time')!.textContent = `用时: ${time.toFixed(1)}秒`;
    document.getElementById('result-title')!.textContent = message || '关卡完成！';

    // 省份排行
    this.leaderboard.recordCompletion();
    const provinceStatsEl = document.getElementById('province-stats')!;
    if (this.leaderboard.hasProvince()) {
      const myRank = this.leaderboard.getMyProvinceRank();
      if (myRank) {
        provinceStatsEl.textContent = `🏆 ${myRank.province} 第${myRank.rank}名 · 通关率${(myRank.rate * 100).toFixed(1)}%`;
        provinceStatsEl.style.display = 'block';
      }
    }

    const riders = this.controller.getRiders();
    if (riders.length > 0) {
      const pos = this.renderer.gridToScreen(riders[0].position.x, riders[0].position.y);
      this.renderer.addSuccessParticles(pos.x + 30, pos.y + 30);
    }
  }

  private showFail(reason: string, message?: string): void {
    this.state = WebGameState.FAIL;
    this.failPanel.classList.add('visible');

    // 差一点就过了检测
    const level = this.controller.getLevel();
    const delivered = this.controller.getDeliveredCount();
    const total = this.controller.getTotalRiders();
    const isNearMiss = delivered >= Math.ceil(total * 0.8) && delivered < total;

    const failTitle = document.getElementById('fail-title')!;
    const failReason = document.getElementById('fail-reason')!;

    if (isNearMiss) {
      failTitle.textContent = '差一点就过了!';
      failTitle.style.color = '#FFA500';
      failReason.textContent = `已送达 ${delivered}/${total}，再试一次!`;
    } else {
      failTitle.textContent = '关卡失败';
      failTitle.style.color = '#FF4444';
      failReason.textContent = message || `原因: ${reason}`;
    }
  }

  // ========== 故事相关方法 ==========

  /**
   * 显示章节介绍
   */
  private showChapterIntro(chapterId: number, title: string, intro: string): void {
    this.state = WebGameState.CHAPTER_INTRO;
    this.chapterProgress = 0;

    this.chapterTitleEl.textContent = `第${chapterId}章 ${title}`;
    this.chapterIntroText.textContent = intro;
    this.chapterIntroLayer.classList.add('visible');

    console.log(`[WebGame] 显示章节介绍: ${title}`);
  }

  /**
   * 显示关卡剧情对话
   */
  private showStory(levelId: number, prelude: string, characters: string[]): void {
    this.state = WebGameState.STORY;

    // 解析对话内容，按角色分行显示
    const lines = prelude.split('\n');
    const firstCharacter = characters[0] || '骑手';
    const characterColor = this.renderer.getCharacterColor(firstCharacter);

    this.storyCharacter.textContent = firstCharacter;
    this.storyCharacter.style.background = characterColor;
    this.storyContent.textContent = prelude;
    this.storyLayer.classList.add('visible');

    console.log(`[WebGame] 显示关卡剧情: 关卡${levelId}`);
  }

  /**
   * 跳过故事/章节介绍
   */
  skipStory(): void {
    if (this.state === WebGameState.STORY) {
      this.storyLayer.classList.remove('visible');
      this.storyManager.markLevelSeen(this.currentLevelId);

      // 继续开始关卡 - 设置完整UI状态
      this.state = WebGameState.PLAYING;
      this.setupPlayingUI();

      const level = this.controller.getLevel();
      if (level) {
        level.init();
        level.start();
      }
      this.render();
      console.log('[WebGame] 跳过剧情，开始关卡');
    } else if (this.state === WebGameState.CHAPTER_INTRO) {
      this.chapterIntroLayer.classList.remove('visible');
      const chapter = this.storyManager.getCurrentChapter(this.currentLevelId);
      if (chapter) {
        this.storyManager.markChapterSeen(chapter.id);
      }

      // 检查是否有关卡剧情需要显示
      if (this.storyManager.shouldShowLevelStory(this.currentLevelId)) {
        const levelStory = this.storyManager.getLevelStory(this.currentLevelId);
        if (levelStory) {
          this.showStory(this.currentLevelId, levelStory.prelude, levelStory.characters);
        }
      } else {
        // 直接开始关卡 - 设置完整UI状态
        this.state = WebGameState.PLAYING;
        this.setupPlayingUI();

        const level = this.controller.getLevel();
        if (level) {
          level.init();
          level.start();
        }
        this.render();
      }
      console.log('[WebGame] 跳过章节介绍');
    }
  }

  /**
   * 设置游戏进行中的UI状态
   */
  private setupPlayingUI(): void {
    this.instructions.style.display = 'block';
    this.instructions.textContent = '点选骑手，拖拽画路径到出口';
    this.hintDisplay.textContent = '规划骑手路线';

    this.goBtn.style.display = 'none';
    this.redrawBtn.style.display = 'none';
    this.pathStatus.style.display = 'block';

    const level = this.controller.getLevel();
    if (level) {
      this.pathStatus.textContent = `已规划: 0/${level.riders.length}`;
    }
  }

  /**
   * 切换故事开关
   */
  toggleStorySetting(): void {
    const enabled = !this.storyManager.isStoryEnabled();
    this.storyManager.setStoryEnabled(enabled);
    this.updateStoryToggleUI();
    console.log(`[WebGame] 故事开关: ${enabled}`);
  }

  /**
   * 重置故事进度
   */
  resetStoryProgress(): void {
    this.storyManager.resetProgress();
    this.storyManager.setStoryEnabled(true);
    this.updateStoryToggleUI();
    alert('故事进度已重置！重新开始关卡即可看到剧情。');
    console.log('[WebGame] 故事进度已重置');
  }

  /**
   * 更新故事开关UI状态
   */
  private updateStoryToggleUI(): void {
    const enabled = this.storyManager.isStoryEnabled();
    if (enabled) {
      this.menuStoryToggle.classList.add('enabled');
    } else {
      this.menuStoryToggle.classList.remove('enabled');
    }
  }

  private renderLevelGrid(): void {
    const grid = document.getElementById('level-grid')!;
    grid.innerHTML = '';

    const levels = this.levelManager.getAllLevelIds();
    levels.forEach(levelId => {
      const card = document.createElement('div');
      card.className = 'level-card';
      card.textContent = String(levelId);

      const config = this.levelManager.getLevelConfig(levelId);
      if (config) {
        switch (config.difficulty) {
          case 'easy':    card.style.background = 'rgba(0,200,100,0.3)'; break;
          case 'medium':  card.style.background = 'rgba(200,200,100,0.3)'; break;
          case 'hard':    card.style.background = 'rgba(200,100,100,0.3)'; break;
          case 'expert':  card.style.background = 'rgba(200,50,50,0.3)'; break;
        }
      }

      if (levelId <= 10) {
        card.onclick = () => {
          this.currentLevelId = levelId;
          this.loadLevel(levelId);
        };
      } else {
        card.classList.add('locked');
      }

      grid.appendChild(card);
    });
  }

  private bindPlaceholderFunctions(): void {
    (window as any).startGame = () => console.log('游戏正在初始化...');
    (window as any).showLevelSelect = () => console.log('游戏正在初始化...');
    (window as any).hideLevelSelect = () => console.log('游戏正在初始化...');
    (window as any).retryLevel = () => console.log('游戏正在初始化...');
    (window as any).nextLevel = () => console.log('游戏正在初始化...');
    (window as any).toMenu = () => console.log('游戏正在初始化...');
    (window as any).togglePause = () => console.log('游戏正在初始化...');
    (window as any).launchRiders = () => console.log('游戏正在初始化...');
    (window as any).clearPaths = () => console.log('游戏正在初始化...');
    (window as any).shareRevive = () => console.log('游戏正在初始化...');
    (window as any).skipStory = () => console.log('游戏正在初始化...');
    (window as any).toggleStorySetting = () => console.log('游戏正在初始化...');
    (window as any).resetStoryProgress = () => console.log('游戏正在初始化...');
  }

  private bindGlobalFunctions(): void {
    (window as any).startGame = () => this.startGame();
    (window as any).showLevelSelect = () => this.showLevelSelect();
    (window as any).hideLevelSelect = () => this.hideLevelSelect();
    (window as any).retryLevel = () => this.retryLevel();
    (window as any).nextLevel = () => this.nextLevel();
    (window as any).toMenu = () => this.showMenu();
    (window as any).togglePause = () => this.togglePause();
    (window as any).launchRiders = () => this.launchRiders();
    (window as any).clearPaths = () => this.clearPaths();
    (window as any).shareRevive = () => this.shareRevive();
    (window as any).skipStory = () => this.skipStory();
    (window as any).toggleStorySetting = () => this.toggleStorySetting();
    (window as any).resetStoryProgress = () => this.resetStoryProgress();
    (window as any).gameInstance = this;
    console.log('[WebGame] 全局函数绑定完成');
  }
}

/**
 * 启动Web游戏
 */
export function initWebGame(): WebGame {
  const game = new WebGame('game-canvas');
  game.start();
  return game;
}
