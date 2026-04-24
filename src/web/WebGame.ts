/**
 * Web版本游戏主类
 * @description 整合游戏逻辑和Canvas渲染，实现浏览器可运行版本
 * @version v0.8.0
 * @since 2026-04-25
 */

import { GameLogicController } from '../core/GameLogicController';
import { Level, LevelState } from '../core/Level';
import { Rider, RiderState, RiderType } from '../core/Rider';
import { EventBus, GameEventType } from '../core/EventBus';
import { GameRenderer } from './GameRenderer';
import { LevelManager } from '../core/LevelManager';
import levelsData from '../data/levels.json';

/** 游戏状态 */
enum WebGameState {
  MENU = 'menu',
  LEVEL_SELECT = 'level_select',
  PLAYING = 'playing',
  PAUSED = 'paused',
  RESULT = 'result',
  FAIL = 'fail'
}

/**
 * Web版本游戏
 */
export class WebGame {
  // ========== 属性 ==========

  private renderer: GameRenderer;
  private controller: GameLogicController;
  private levelManager: LevelManager;

  private state: WebGameState = WebGameState.MENU;
  private currentLevelId: number = 1;
  private lastTime: number = 0;
  private animationId: number = 0;

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

  // ========== 构造函数 ==========

  constructor(canvasId: string) {
    this.renderer = new GameRenderer(canvasId);
    this.controller = new GameLogicController();
    this.levelManager = LevelManager.getInstance();
    this.levelManager.loadData(levelsData);

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

    // 绑定事件
    this.bindEvents();
    this.bindCanvasEvents();

    // 显示菜单
    this.showMenu();

    // 绑定全局函数
    this.bindGlobalFunctions();
  }

  // ========== 公共方法 ==========

  /**
   * 启动游戏
   */
  start(): void {
    this.lastTime = performance.now();
    this.gameLoop();
    console.log('WebGame启动');
  }

  /**
   * 显示菜单
   */
  showMenu(): void {
    this.state = WebGameState.MENU;
    this.menuScreen.classList.remove('hidden');
    this.levelSelectScreen.classList.remove('visible');
    this.resultPanel.classList.remove('visible');
    this.failPanel.classList.remove('visible');
    this.vipWarning.classList.remove('visible');
    this.instructions.style.display = 'none';
    this.renderer.clear();
  }

  /**
   * 显示关卡选择
   */
  showLevelSelect(): void {
    this.state = WebGameState.LEVEL_SELECT;
    this.menuScreen.classList.add('hidden');
    this.levelSelectScreen.classList.add('visible');
    this.renderLevelGrid();
  }

  /**
   * 隐藏关卡选择
   */
  hideLevelSelect(): void {
    this.state = WebGameState.MENU;
    this.levelSelectScreen.classList.remove('visible');
    this.menuScreen.classList.remove('hidden');
  }

  /**
   * 开始游戏（关卡1）
   */
  startGame(): void {
    this.currentLevelId = 1;
    this.loadLevel(1);
  }

  /**
   * 加载关卡
   */
  loadLevel(levelId: number): void {
    const config = this.levelManager.getLevelConfig(levelId);
    if (!config) {
      console.error(`关卡 ${levelId} 不存在`);
      return;
    }

    const level = new Level(config);
    this.controller.setLevel(level);
    level.start();

    // 设置画布大小
    const cellSize = this.renderer.getConfig().cellSize;
    this.renderer.setCanvasSize(
      level.gridSize.width * cellSize,
      level.gridSize.height * cellSize
    );

    // 更新UI
    this.state = WebGameState.PLAYING;
    this.menuScreen.classList.add('hidden');
    this.levelSelectScreen.classList.remove('visible');
    this.resultPanel.classList.remove('visible');
    this.failPanel.classList.remove('visible');
    this.vipWarning.classList.remove('visible');
    this.instructions.style.display = 'block';

    this.levelInfo.textContent = `关卡 ${levelId} - ${level.name}`;
    this.deliveredDisplay.textContent = `送达: 0/${level.riders.length}`;
    this.hintDisplay.textContent = '点击骑手开始移动';

    console.log(`加载关卡 ${levelId}: ${level.name}`);
  }

  /**
   * 重试关卡
   */
  retryLevel(): void {
    this.loadLevel(this.currentLevelId);
  }

  /**
   * 下一关
   */
  nextLevel(): void {
    const nextId = this.currentLevelId + 1;
    if (nextId <= this.levelManager.getAllLevelIds().length) {
      this.currentLevelId = nextId;
      this.loadLevel(nextId);
    } else {
      this.showMenu();
    }
  }

  /**
   * 暂停/继续
   */
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

  // ========== 私有方法 ==========

  /**
   * 游戏主循环
   */
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

  /**
   * 更新游戏状态
   */
  private update(dt: number): void {
    this.controller.update(dt);
    this.renderer.updateParticles(dt);
    this.updateUI();
  }

  /**
   * 渲染游戏
   */
  private render(): void {
    this.renderer.render(this.controller);
  }

  /**
   * 更新UI
   */
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

    // 隐藏指示（开始游戏后）
    if (delivered > 0) {
      this.instructions.style.display = 'none';
    }
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    EventBus.on(GameEventType.LEVEL_COMPLETE, (data: any) => {
      this.showResult(data.stars, data.time);
    });

    EventBus.on(GameEventType.LEVEL_FAILED, (data: any) => {
      this.showFail(data.reason || '未知原因');
    });

    EventBus.on('vip-warning', () => {
      this.showVIPWarning();
    });
  }

  /**
   * 绑定Canvas点击事件
   */
  private bindCanvasEvents(): void {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

    canvas.addEventListener('click', (e: MouseEvent) => {
      if (this.state !== WebGameState.PLAYING) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 转换为网格坐标
      const gridPos = this.renderer.screenToGrid(x, y);

      // 查找点击的骑手
      const riders = this.controller.getRiders();
      const clickedRider = riders.find(r => {
        const riderPos = r.position;
        return Math.floor(riderPos.x) === gridPos.x && Math.floor(riderPos.y) === gridPos.y;
      });

      if (clickedRider) {
        this.onRiderClick(clickedRider);
      }
    });
  }

  /**
   * 骑手点击处理
   */
  private onRiderClick(rider: Rider): void {
    if (rider.state !== RiderState.IDLE) return;

    const success = this.controller.selectRider(rider.id);

    if (success) {
      this.renderer.setHighlightedRider(rider.id);
      this.hintDisplay.textContent = `骑手 ${rider.id} 出发！`;

      // 加急骑手提示
      if (rider.type === RiderType.URGENT) {
        this.hintDisplay.textContent = `加急订单！剩余 ${Math.ceil(rider.timeRemaining)} 秒`;
      }
    }
  }

  /**
   * 显示VIP警告
   */
  private showVIPWarning(): void {
    this.vipWarning.classList.add('visible');
    setTimeout(() => {
      this.vipWarning.classList.remove('visible');
    }, 1500);
  }

  /**
   * 显示成功结果
   */
  private showResult(stars: number, time: number): void {
    this.state = WebGameState.RESULT;
    this.resultPanel.classList.add('visible');

    const starsText = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    document.getElementById('result-stars')!.textContent = starsText;
    document.getElementById('result-time')!.textContent = `用时: ${time.toFixed(1)}秒`;
    document.getElementById('result-title')!.textContent = '关卡完成！';

    // 添加成功粒子
    const riders = this.controller.getRiders();
    if (riders.length > 0) {
      const pos = this.renderer.gridToScreen(riders[0].position.x, riders[0].position.y);
      this.renderer.addSuccessParticles(pos.x + 30, pos.y + 30);
    }
  }

  /**
   * 显示失败结果
   */
  private showFail(reason: string): void {
    this.state = WebGameState.FAIL;
    this.failPanel.classList.add('visible');
    document.getElementById('fail-reason')!.textContent = `原因: ${reason}`;
  }

  /**
   * 渲染关卡选择网格
   */
  private renderLevelGrid(): void {
    const grid = document.getElementById('level-grid')!;
    grid.innerHTML = '';

    const levels = this.levelManager.getAllLevelIds();
    levels.forEach(levelId => {
      const card = document.createElement('div');
      card.className = 'level-card';
      card.textContent = String(levelId);

      // 根据关卡难度设置颜色
      const config = this.levelManager.getLevelConfig(levelId);
      if (config) {
        switch (config.difficulty) {
          case 'easy':
            card.style.background = 'rgba(0,200,100,0.3)';
            break;
          case 'medium':
            card.style.background = 'rgba(200,200,100,0.3)';
            break;
          case 'hard':
            card.style.background = 'rgba(200,100,100,0.3)';
            break;
          case 'expert':
            card.style.background = 'rgba(200,50,50,0.3)';
            break;
        }
      }

      // 前10关默认解锁
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

  /**
   * 绑定全局函数供HTML调用
   */
  private bindGlobalFunctions(): void {
    (window as any).startGame = () => this.startGame();
    (window as any).showLevelSelect = () => this.showLevelSelect();
    (window as any).hideLevelSelect = () => this.hideLevelSelect();
    (window as any).retryLevel = () => this.retryLevel();
    (window as any).nextLevel = () => this.nextLevel();
    (window as any).toMenu = () => this.showMenu();
    (window as any).togglePause = () => this.togglePause();
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