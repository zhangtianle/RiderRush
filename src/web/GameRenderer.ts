/**
 * 游戏Canvas渲染器 - 像素风格
 * @description 负责将游戏元素以像素风格渲染到Canvas
 * @version v0.2.0
 * @since 2026-04-25
 */

import { Rider, RiderState, RiderType, Direction, Position } from '../core/Rider';
import { Obstacle, ObstacleType, TrafficLightState } from '../core/Obstacle';
import { Level, LevelState } from '../core/Level';
import { GameLogicController } from '../core/GameLogicController';

/** 渲染配置 */
interface RenderConfig {
  cellSize: number;
  riderSize: number;
  obstacleSize: number;
  exitSize: number;
}

/** 颜色配置 */
const COLORS = {
  // 骑手颜色
  riderNormal: '#FFD700',
  riderVIP: '#FFA500',
  riderUrgent: '#FF4500',

  // 状态颜色
  riderIdle: '#FFD700',
  riderMoving: '#00FF00',
  riderSuccess: '#4CAF50',
  riderCrashed: '#FF0000',
  riderWaiting: '#FF9800',

  // 阻碍颜色
  wall: '#808080',
  wallHighlight: '#999999',
  wallShadow: '#555555',
  traffic: '#FF6B6B',
  trafficLightRed: '#FF0000',
  trafficLightGreen: '#00FF00',
  gate: '#4A90D9',

  // 其他
  exit: '#00FF00',
  exitHighlight: '#FFD700',
  gridLine: '#1e2a4a',
  gridLight: '#1c2744',
  gridDark: '#16213e',
  background: '#1a1a2e',
  gridBackground: '#16213e'
};

/** 像素精灵数据 - 骑手 (12x14, 1=主色 2=暗色 3=亮色 4=白色 5=肤色 6=黑色) */
const RIDER_SPRITE: number[][] = [
  [0,0,0,0,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,2,1,1,2,1,1,0,0],
  [0,0,1,5,6,5,5,6,5,1,0,0],
  [0,0,1,5,5,5,5,5,5,1,0,0],
  [0,0,0,5,5,4,4,5,5,0,0,0],
  [0,0,0,0,5,5,5,5,0,0,0,0],
  [0,0,3,3,3,3,3,3,3,3,0,0],
  [0,3,3,1,3,3,3,3,1,3,3,0],
  [0,3,3,1,3,3,3,3,1,3,3,0],
  [0,0,0,3,3,3,3,3,3,0,0,0],
  [0,0,0,3,0,3,3,0,3,0,0,0],
  [0,0,0,4,0,4,4,0,4,0,0,0],
  [0,0,4,4,0,4,4,0,4,4,0,0],
];

/** 撞车骑手精灵 (12x14) */
const RIDER_CRASHED_SPRITE: number[][] = [
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,1,0,0,0,0,1,0,0,0],
  [0,0,0,0,2,0,0,2,0,0,0,0],
  [0,0,0,0,0,6,6,0,0,0,0,0],
  [0,0,0,0,0,5,5,0,0,0,0,0],
  [0,0,0,5,5,5,5,5,5,0,0,0],
  [0,0,0,0,0,5,5,0,0,0,0,0],
  [0,0,0,0,5,0,0,5,0,0,0,0],
  [0,0,0,5,0,0,0,0,5,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,7,7,7,0,0,7,7,7,0,0],
  [0,7,7,7,7,0,0,7,7,7,7,0],
];

/** VIP皇冠精灵 (12x6) */
const VIP_CROWN_SPRITE: number[][] = [
  [0,0,0,0,4,0,0,4,0,0,0,0],
  [0,0,0,4,0,4,4,0,4,0,0,0],
  [0,0,4,4,4,4,4,4,4,4,0,0],
  [0,0,4,7,7,7,7,7,7,4,0,0],
  [0,0,4,7,7,7,7,7,7,4,0,0],
  [0,0,4,4,4,4,4,4,4,4,0,0],
];

/** 出口精灵 (12x12, 1=主色 2=亮色 3=白色) */
const EXIT_SPRITE: number[][] = [
  [0,0,0,3,3,3,3,3,3,0,0,0],
  [0,0,3,2,2,2,2,2,2,3,0,0],
  [0,3,2,1,1,1,1,1,1,2,3,0],
  [0,3,2,1,0,0,0,0,1,2,3,0],
  [0,3,2,1,0,3,3,0,1,2,3,0],
  [0,3,2,1,0,3,3,0,1,2,3,0],
  [0,3,2,1,0,0,0,0,1,2,3,0],
  [0,3,2,1,1,1,1,1,1,2,3,0],
  [0,3,2,2,2,2,2,2,2,2,3,0],
  [0,0,3,3,3,3,3,3,3,3,0,0],
  [0,0,0,0,3,3,3,3,0,0,0,0],
  [0,0,0,0,0,3,3,0,0,0,0],
];

/** 骑手颜色调色板 */
const RIDER_PALETTES: Record<string, Record<number, string>> = {
  NORMAL: {
    1: '#FFD700', 2: '#CC9900', 3: '#FF8C00', 4: '#FFFFFF', 5: '#FFCC99', 6: '#333333', 7: '#FF4444'
  },
  VIP: {
    1: '#FFA500', 2: '#CC7700', 3: '#FF6600', 4: '#FFFFFF', 5: '#FFCC99', 6: '#333333', 7: '#FFD700'
  },
  URGENT: {
    1: '#FF4500', 2: '#CC3300', 3: '#FF2200', 4: '#FFFFFF', 5: '#FFCC99', 6: '#333333', 7: '#FF0000'
  },
  CRASHED: {
    1: '#888888', 2: '#666666', 3: '#AAAAAA', 4: '#FFFFFF', 5: '#FFCC99', 6: '#333333', 7: '#FF4444'
  }
};

/** 出口颜色调色板 */
const EXIT_PALETTE: Record<number, string> = {
  1: '#00AA00', 2: '#00DD00', 3: '#FFFFFF'
};

/** 方向箭头像素数据 (5x5) */
const ARROW_PIXELS: Record<Direction, number[][]> = {
  [Direction.UP]: [
    [0,0,1,0,0],
    [0,1,1,1,0],
    [1,0,1,0,1],
    [0,0,1,0,0],
    [0,0,1,0,0],
  ],
  [Direction.DOWN]: [
    [0,0,1,0,0],
    [0,0,1,0,0],
    [1,0,1,0,1],
    [0,1,1,1,0],
    [0,0,1,0,0],
  ],
  [Direction.LEFT]: [
    [0,0,1,0,0],
    [0,1,0,0,0],
    [1,1,1,1,1],
    [0,1,0,0,0],
    [0,0,1,0,0],
  ],
  [Direction.RIGHT]: [
    [0,0,1,0,0],
    [0,0,0,1,0],
    [1,1,1,1,1],
    [0,0,0,1,0],
    [0,0,1,0,0],
  ],
};

/**
 * Canvas渲染器 - 像素风格
 */
export class GameRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: RenderConfig;

  /** 网格在画布中的偏移（居中显示） */
  private gridOffsetX: number = 0;
  private gridOffsetY: number = 0;

  /** 设备像素比，用于高清渲染 */
  private dpr: number = 1;
  /** CSS像素尺寸（绘制坐标空间） */
  private cssWidth: number = 0;
  private cssHeight: number = 0;

  /** 骑手高亮 */
  private highlightedRider: string | null = null;

  /** 台词气泡 */
  private quoteBubble: { riderId: string; text: string; x: number; y: number; duration: number } | null = null;

  /** 粒子效果 */
  private particles: { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number }[] = [];

  /** 屏幕震动 */
  private shakeIntensity: number = 0;
  private shakeDuration: number = 0;
  private shakeTimer: number = 0;

  /** 红色闪屏 */
  private redFlashAlpha: number = 0;

  /** 连击弹出 */
  private comboPopups: { text: string; x: number; y: number; age: number; maxAge: number }[] = [];

  /** 路径预览 */
  private previewPath: { riderId: string; path: Position[]; isValid: boolean } | null = null;

  /** 动画计时器 */
  private animTime: number = 0;

  constructor(canvasId: string, config?: Partial<RenderConfig>) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;

    this.config = {
      cellSize: config?.cellSize || 80,
      riderSize: config?.riderSize || 50,
      obstacleSize: config?.obstacleSize || 60,
      exitSize: config?.exitSize || 50
    };
  }

  /**
   * 根据屏幕和网格计算cellSize，并自适应设置画布大小
   * 支持高DPI设备（手机Retina屏），留出UI区域
   */
  fitToScreen(gridWidth: number, gridHeight: number): number {
    const container = this.canvas.parentElement!;
    const maxWidth = container.clientWidth || window.innerWidth;
    const maxHeight = container.clientHeight || window.innerHeight;

    // 保存CSS像素尺寸
    this.cssWidth = maxWidth;
    this.cssHeight = maxHeight;

    // 高DPI适配：canvas物理尺寸 = CSS尺寸 × dpr
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(maxWidth * this.dpr);
    this.canvas.height = Math.round(maxHeight * this.dpr);
    this.canvas.style.width = maxWidth + 'px';
    this.canvas.style.height = maxHeight + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // 留出顶部header(50px)和底部hud(50px)的空间
    const headerSpace = 55;
    const hudSpace = 55;
    const safeTop = headerSpace;
    const safeBottom = hudSpace;
    const availableHeight = maxHeight - safeTop - safeBottom;

    const cellByWidth = Math.floor(maxWidth / gridWidth);
    const cellByHeight = Math.floor(availableHeight / gridHeight);
    const cellSize = Math.max(30, Math.min(cellByWidth, cellByHeight));

    this.config.cellSize = cellSize;
    this.config.riderSize = Math.round(cellSize * 0.65);
    this.config.obstacleSize = Math.round(cellSize * 0.75);
    this.config.exitSize = Math.round(cellSize * 0.65);

    // 居中偏移，垂直方向考虑UI留白
    const gridPixelW = gridWidth * cellSize;
    const gridPixelH = gridHeight * cellSize;
    this.gridOffsetX = Math.floor((maxWidth - gridPixelW) / 2);
    this.gridOffsetY = Math.floor(safeTop + (availableHeight - gridPixelH) / 2);

    console.log(`[GameRenderer] fitToScreen: screen=${maxWidth}x${maxHeight}, dpr=${this.dpr}, grid=${gridWidth}x${gridHeight}, cell=${cellSize}, offset=(${this.gridOffsetX},${this.gridOffsetY})`);
    return cellSize;
  }

  setCanvasSize(width: number, height: number): void {
    this.cssWidth = width;
    this.cssHeight = height;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  getConfig(): RenderConfig {
    return this.config;
  }

  clear(): void {
    this.ctx.fillStyle = COLORS.background;
    this.ctx.fillRect(0, 0, this.cssWidth || this.canvas.width, this.cssHeight || this.canvas.height);
  }

  render(controller: GameLogicController): void {
    this.clear();

    const level = controller.getLevel();
    if (!level) return;

    let shakeX = 0, shakeY = 0;
    if (this.shakeTimer > 0) {
      shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2;
    }

    this.ctx.save();
    this.ctx.translate(this.gridOffsetX + shakeX, this.gridOffsetY + shakeY);

    this.renderGrid(level);
    this.renderExits(level);
    this.renderObstacles(controller.getObstacles());
    this.renderPaths(controller.getRiders());

    if (this.previewPath) {
      this.renderPathPreview(this.previewPath.riderId, this.previewPath.path, this.previewPath.isValid);
    }

    this.renderRiders(controller.getRiders());
    this.renderParticles();
    this.renderComboPopups();

    this.ctx.restore();

    if (this.redFlashAlpha > 0) {
      this.ctx.fillStyle = `rgba(255, 0, 0, ${this.redFlashAlpha})`;
      this.ctx.fillRect(0, 0, this.cssWidth || this.canvas.width, this.cssHeight || this.canvas.height);
    }
  }

  updateEffects(dt: number): void {
    this.animTime += dt;

    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt * 1000;
      if (this.shakeTimer <= 0) {
        this.shakeTimer = 0;
        this.shakeIntensity = 0;
      }
    }

    if (this.redFlashAlpha > 0) {
      this.redFlashAlpha -= dt * 3;
      if (this.redFlashAlpha < 0) this.redFlashAlpha = 0;
    }

    this.comboPopups = this.comboPopups.filter(p => {
      p.age += dt;
      return p.age < p.maxAge;
    });
  }

  triggerShake(intensity: number, duration: number): void {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
    this.shakeTimer = duration;
  }

  triggerRedFlash(): void {
    this.redFlashAlpha = 0.4;
  }

  addComboPopup(count: number, x: number, y: number): void {
    const screenPos = this.gridToScreen(x, y);
    const comboTexts = ['', '', '2连击!', '3连击!', '4连击!', '超神!'];
    const text = count < comboTexts.length ? comboTexts[count] : `${count}连击!`;
    this.comboPopups.push({
      text,
      x: screenPos.x,
      y: screenPos.y,
      age: 0,
      maxAge: 1.5
    });
  }

  setPathPreview(riderId: string, path: Position[], isValid: boolean): void {
    this.previewPath = { riderId, path, isValid };
  }

  clearPathPreview(): void {
    this.previewPath = null;
  }

  // ========== 像素精灵绘制 ==========

  /**
   * 绘制像素精灵
   */
  private drawPixelSprite(
    sprite: number[][],
    palette: Record<number, string>,
    x: number,
    y: number,
    targetSize: number,
    alpha: number = 1
  ): void {
    const rows = sprite.length;
    const cols = sprite[0].length;
    const pixelSize = targetSize / Math.max(cols, rows);

    this.ctx.globalAlpha = alpha;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const colorIndex = sprite[r][c];
        if (colorIndex === 0) continue;

        const color = palette[colorIndex];
        if (!color) continue;

        this.ctx.fillStyle = color;
        this.ctx.fillRect(
          Math.round(x + c * pixelSize),
          Math.round(y + r * pixelSize),
          Math.ceil(pixelSize),
          Math.ceil(pixelSize)
        );
      }
    }

    this.ctx.globalAlpha = 1;
  }

  /**
   * 绘制像素边框
   */
  private drawPixelBorder(x: number, y: number, size: number, color: string, borderWidth: number = 2): void {
    this.ctx.fillStyle = color;
    // Top
    this.ctx.fillRect(x, y, size, borderWidth);
    // Bottom
    this.ctx.fillRect(x, y + size - borderWidth, size, borderWidth);
    // Left
    this.ctx.fillRect(x, y, borderWidth, size);
    // Right
    this.ctx.fillRect(x + size - borderWidth, y, borderWidth, size);
  }

  /**
   * 绘制像素高亮框（虚线闪烁风格）
   */
  private drawPixelHighlight(x: number, y: number, size: number, color: string, time: number): void {
    const offset = Math.floor(time * 4) % 4;
    const segLen = 4;
    this.ctx.fillStyle = color;

    // 绘制四边虚线
    for (let i = offset; i < size; i += segLen * 2) {
      const len = Math.min(segLen, size - i);
      // Top
      this.ctx.fillRect(x + i, y - 2, len, 2);
      // Bottom
      this.ctx.fillRect(x + i, y + size, len, 2);
    }
    for (let i = offset; i < size; i += segLen * 2) {
      const len = Math.min(segLen, size - i);
      // Left
      this.ctx.fillRect(x - 2, y + i, 2, len);
      // Right
      this.ctx.fillRect(x + size, y + i, 2, len);
    }
  }

  // ========== 渲染场景元素 ==========

  private renderGrid(level: Level): void {
    const { cellSize } = this.config;
    const gridWidth = level.gridSize.width;
    const gridHeight = level.gridSize.height;

    // 棋盘格背景
    for (let gy = 0; gy < gridHeight; gy++) {
      for (let gx = 0; gx < gridWidth; gx++) {
        this.ctx.fillStyle = (gx + gy) % 2 === 0 ? COLORS.gridLight : COLORS.gridDark;
        this.ctx.fillRect(gx * cellSize, gy * cellSize, cellSize, cellSize);
      }
    }

    // 网格线（像素风格细线）
    this.ctx.strokeStyle = COLORS.gridLine;
    this.ctx.lineWidth = 1;

    for (let x = 0; x <= gridWidth; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * cellSize + 0.5, 0);
      this.ctx.lineTo(x * cellSize + 0.5, gridHeight * cellSize);
      this.ctx.stroke();
    }

    for (let y = 0; y <= gridHeight; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * cellSize + 0.5);
      this.ctx.lineTo(gridWidth * cellSize, y * cellSize + 0.5);
      this.ctx.stroke();
    }
  }

  private renderExits(level: Level): void {
    const { cellSize, exitSize } = this.config;

    level.exits.forEach(exit => {
      const x = exit.position.x * cellSize + (cellSize - exitSize) / 2;
      const y = exit.position.y * cellSize + (cellSize - exitSize) / 2;

      // 出口底色闪烁
      const pulse = 0.7 + 0.3 * Math.sin(this.animTime * 3);
      this.ctx.globalAlpha = 0.15 * pulse;
      this.ctx.fillStyle = COLORS.exit;
      this.ctx.fillRect(
        exit.position.x * cellSize,
        exit.position.y * cellSize,
        cellSize,
        cellSize
      );
      this.ctx.globalAlpha = 1;

      // 出口像素精灵
      this.drawPixelSprite(EXIT_SPRITE, EXIT_PALETTE, x, y, exitSize);

      // 出口闪烁边框
      this.drawPixelBorder(x - 1, y - 1, exitSize + 2, COLORS.exitHighlight, 2);
    });
  }

  private renderObstacles(obstacles: Obstacle[]): void {
    const { cellSize, obstacleSize } = this.config;

    obstacles.forEach(obstacle => {
      const baseX = obstacle.position.x * cellSize;
      const baseY = obstacle.position.y * cellSize;
      const width = obstacle.size.width * cellSize;
      const height = obstacle.size.height * cellSize;

      switch (obstacle.type) {
        case ObstacleType.WALL:
          this.renderWall(baseX, baseY, width, height);
          break;
        case ObstacleType.TRAFFIC:
          this.renderTraffic(baseX, baseY, width, height, obstacle.getSlowFactor());
          break;
        case ObstacleType.TRAFFIC_LIGHT:
          this.renderTrafficLight(baseX, baseY, obstacle);
          break;
        case ObstacleType.GATE:
          this.renderGate(baseX, baseY, width, height);
          break;
      }
    });
  }

  private renderWall(x: number, y: number, width: number, height: number): void {
    const brickH = 12;
    const brickW = 20;
    const mortar = 2;

    for (let row = 0; row * brickH < height; row++) {
      const offset = row % 2 === 0 ? 0 : brickW / 2;
      for (let col = -1; col * brickW < width + brickW; col++) {
        const bx = x + col * brickW + offset;
        const by = y + row * brickH;

        if (bx + brickW <= x || bx >= x + width) continue;
        if (by + brickH <= y || by >= y + height) continue;

        // 砖块底色
        const shade = (row + col) % 3;
        this.ctx.fillStyle = shade === 0 ? COLORS.wall : shade === 1 ? COLORS.wallHighlight : COLORS.wallShadow;
        const drawX = Math.max(bx + mortar, x);
        const drawY = Math.max(by + mortar, y);
        const drawW = Math.min(bx + brickW - mortar, x + width) - drawX;
        const drawH = Math.min(by + brickH - mortar, y + height) - drawY;
        if (drawW > 0 && drawH > 0) {
          this.ctx.fillRect(drawX, drawY, drawW, drawH);
        }
      }
    }
  }

  private renderTraffic(x: number, y: number, width: number, height: number, slowFactor: number): void {
    const alpha = 0.3 + slowFactor * 0.4;
    this.ctx.fillStyle = `rgba(255, 107, 107, ${alpha})`;
    this.ctx.fillRect(x, y, width, height);

    // 像素风小车
    const carW = 16;
    const carH = 10;
    const carCount = Math.floor(width / (carW + 6));
    for (let i = 0; i < carCount && i < 3; i++) {
      const carX = x + 6 + i * (carW + 6);
      const carY = y + height / 2 - carH / 2;

      // 车身
      this.ctx.fillStyle = '#DDDDDD';
      this.ctx.fillRect(carX, carY, carW, carH);
      // 车窗
      this.ctx.fillStyle = '#88CCFF';
      this.ctx.fillRect(carX + 3, carY + 2, 5, 4);
      // 车轮
      this.ctx.fillStyle = '#333333';
      this.ctx.fillRect(carX + 1, carY + carH - 2, 3, 2);
      this.ctx.fillRect(carX + carW - 4, carY + carH - 2, 3, 2);
    }
  }

  private renderTrafficLight(x: number, y: number, obstacle: Obstacle): void {
    const { cellSize } = this.config;
    const centerX = x + cellSize / 2;
    const centerY = y + cellSize / 2;
    const bodyW = cellSize * 0.35;
    const bodyH = cellSize * 0.7;

    // 灯杆底座
    this.ctx.fillStyle = '#444444';
    this.ctx.fillRect(centerX - bodyW / 2 - 2, centerY - bodyH / 2 - 2, bodyW + 4, bodyH + 4);

    // 灯箱
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(centerX - bodyW / 2, centerY - bodyH / 2, bodyW, bodyH);

    // 灯光（像素圆角方块）
    const lightSize = bodyW * 0.6;
    const isRed = obstacle.lightState === TrafficLightState.RED;
    const lightColor = isRed ? COLORS.trafficLightRed : COLORS.trafficLightGreen;

    // 发光
    this.ctx.shadowColor = lightColor;
    this.ctx.shadowBlur = 15;
    this.ctx.fillStyle = lightColor;
    this.ctx.fillRect(
      centerX - lightSize / 2,
      centerY - lightSize / 2,
      lightSize,
      lightSize
    );
    this.ctx.shadowBlur = 0;

    // 熄灭的另一个灯
    this.ctx.fillStyle = isRed ? '#003300' : '#330000';
    const otherY = isRed ? centerY + lightSize * 0.8 : centerY - lightSize * 0.8;
    this.ctx.fillRect(centerX - lightSize / 2, otherY - lightSize / 2, lightSize, lightSize);
  }

  private renderGate(x: number, y: number, width: number, height: number): void {
    this.ctx.fillStyle = COLORS.gate;
    this.ctx.fillRect(x, y, width, height);

    // 像素风门禁条纹
    const stripeW = 6;
    for (let i = 0; i < width / stripeW; i++) {
      if (i % 2 === 0) {
        this.ctx.fillStyle = '#5BA0E9';
        this.ctx.fillRect(x + i * stripeW, y, stripeW, height);
      }
    }

    // 门禁杆
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(x + 2, y + height / 2 - 2, width - 4, 4);
  }

  private renderRiders(riders: Rider[]): void {
    const { cellSize, riderSize } = this.config;

    riders.forEach(rider => {
      const x = rider.position.x * cellSize + (cellSize - riderSize) / 2;
      const y = rider.position.y * cellSize + (cellSize - riderSize) / 2;

      // 空闲骑手弹跳动画
      let bounceY = 0;
      if (rider.state === RiderState.IDLE) {
        bounceY = Math.sin(this.animTime * 4 + rider.position.x * 2 + rider.position.y * 3) * 3;
      }

      const drawY = y + bounceY;

      // 选择调色板和精灵
      let palette: Record<number, string>;
      let sprite: number[][];

      if (rider.state === RiderState.CRASHED) {
        palette = RIDER_PALETTES.CRASHED;
        sprite = RIDER_CRASHED_SPRITE;
      } else {
        switch (rider.type) {
          case RiderType.VIP:    palette = RIDER_PALETTES.VIP; break;
          case RiderType.URGENT: palette = RIDER_PALETTES.URGENT; break;
          default:               palette = RIDER_PALETTES.NORMAL; break;
        }
        sprite = RIDER_SPRITE;
      }

      // 根据状态调整透明度
      let alpha = 1;
      if (rider.state === RiderState.CRASHED) alpha = 0.7;
      if (rider.state === RiderState.SUCCESS) alpha = 0.6;

      // 移动中的速度线效果
      if (rider.state === RiderState.MOVING) {
        this.renderSpeedLines(x, drawY, riderSize, rider.direction);
      }

      // 绘制骑手像素精灵
      this.drawPixelSprite(sprite, palette, x, drawY, riderSize, alpha);

      // 状态边框
      let borderColor: string | null = null;
      switch (rider.state) {
        case RiderState.SUCCESS: borderColor = '#00FF00'; break;
        case RiderState.WAITING: borderColor = '#FF9800'; break;
        case RiderState.MOVING:  borderColor = '#00FFFF'; break;
      }

      if (borderColor) {
        this.drawPixelBorder(x - 1, drawY - 1, riderSize + 2, borderColor, 2);
      }

      // 方向箭头（像素风格）
      if (rider.state !== RiderState.CRASHED && rider.state !== RiderState.SUCCESS) {
        this.renderPixelArrow(x, drawY, riderSize, rider.direction);
      }

      // VIP皇冠
      if (rider.type === RiderType.VIP) {
        const crownH = riderSize * 0.35;
        const crownY = drawY - crownH + 2;
        this.drawPixelSprite(VIP_CROWN_SPRITE, { 4: '#FFFFFF', 7: '#FFD700' }, x, crownY, riderSize);
      }

      // 加急倒计时
      if (rider.type === RiderType.URGENT && rider.timeLimit > 0) {
        const urgentColor = rider.timeRemaining < 10 ? '#FF0000' : '#FFFFFF';
        const timeStr = `${Math.ceil(rider.timeRemaining)}`;

        // 像素风倒计时背景
        const barW = riderSize;
        const barH = 6;
        const barX = x;
        const barY = drawY - barH - 4;
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(barX, barY, barW, barH);
        const ratio = rider.timeRemaining / rider.timeLimit;
        this.ctx.fillStyle = ratio > 0.3 ? '#FF8800' : '#FF0000';
        this.ctx.fillRect(barX, barY, barW * ratio, barH);
        this.ctx.fillStyle = urgentColor;
        this.ctx.font = `bold ${Math.max(9, Math.round(riderSize * 0.2))}px monospace`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(timeStr, barX + barW / 2, barY - 1);
        this.ctx.textAlign = 'start';
      }

      // 高亮选框
      if (this.highlightedRider === rider.id) {
        this.drawPixelHighlight(x, drawY, riderSize, '#FFFFFF', this.animTime);
      }
    });
  }

  /**
   * 绘制速度线
   */
  private renderSpeedLines(x: number, y: number, size: number, direction: Direction): void {
    const lineLen = 8;
    const gap = 4;
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';

    switch (direction) {
      case Direction.RIGHT:
        for (let i = 0; i < 3; i++) {
          this.ctx.fillRect(x - lineLen - 2, y + 8 + i * gap, lineLen, 2);
        }
        break;
      case Direction.LEFT:
        for (let i = 0; i < 3; i++) {
          this.ctx.fillRect(x + size + 2, y + 8 + i * gap, lineLen, 2);
        }
        break;
      case Direction.UP:
        for (let i = 0; i < 3; i++) {
          this.ctx.fillRect(x + 8 + i * gap, y + size + 2, 2, lineLen);
        }
        break;
      case Direction.DOWN:
        for (let i = 0; i < 3; i++) {
          this.ctx.fillRect(x + 8 + i * gap, y - lineLen - 2, 2, lineLen);
        }
        break;
    }
  }

  /**
   * 绘制像素风方向箭头
   */
  private renderPixelArrow(x: number, y: number, size: number, direction: Direction): void {
    const arrow = ARROW_PIXELS[direction];
    const arrowRows = arrow.length;
    const arrowCols = arrow[0].length;
    const arrowPixelSize = size * 0.12;

    const offsetX = x + size - arrowCols * arrowPixelSize - 2;
    const offsetY = y + size - arrowRows * arrowPixelSize - 2;

    this.ctx.fillStyle = '#FFFFFF';
    for (let r = 0; r < arrowRows; r++) {
      for (let c = 0; c < arrowCols; c++) {
        if (arrow[r][c] === 1) {
          this.ctx.fillRect(
            Math.round(offsetX + c * arrowPixelSize),
            Math.round(offsetY + r * arrowPixelSize),
            Math.ceil(arrowPixelSize),
            Math.ceil(arrowPixelSize)
          );
        }
      }
    }
  }

  private renderParticles(): void {
    this.particles.forEach(p => {
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = p.color;
      const s = p.size * p.life;
      this.ctx.fillRect(Math.round(p.x - s / 2), Math.round(p.y - s / 2), Math.round(s), Math.round(s));
    });
    this.ctx.globalAlpha = 1;
  }

  updateParticles(dt: number): void {
    this.particles = this.particles.filter(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt * 2;
      return p.life > 0;
    });
  }

  addSuccessParticles(x: number, y: number): void {
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 120,
        vy: (Math.random() - 0.5) * 120,
        life: 1,
        color: ['#00FF00', '#FFD700', '#FFFFFF'][Math.floor(Math.random() * 3)],
        size: 4 + Math.random() * 4
      });
    }
  }

  addCrashParticles(x: number, y: number): void {
    for (let i = 0; i < 18; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 160,
        vy: (Math.random() - 0.5) * 160,
        life: 1,
        color: ['#FF0000', '#FF6600', '#FFD700'][Math.floor(Math.random() * 3)],
        size: 3 + Math.random() * 5
      });
    }
  }

  setHighlightedRider(riderId: string | null): void {
    this.highlightedRider = riderId;
  }

  gridToScreen(gridX: number, gridY: number): { x: number; y: number } {
    return {
      x: this.gridOffsetX + gridX * this.config.cellSize,
      y: this.gridOffsetY + gridY * this.config.cellSize
    };
  }

  screenToGrid(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: Math.floor((screenX - this.gridOffsetX) / this.config.cellSize),
      y: Math.floor((screenY - this.gridOffsetY) / this.config.cellSize)
    };
  }

  screenToGridFloat(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: (screenX - this.gridOffsetX) / this.config.cellSize,
      y: (screenY - this.gridOffsetY) / this.config.cellSize
    };
  }

  private renderPaths(riders: Rider[]): void {
    const { cellSize } = this.config;

    riders.forEach(rider => {
      if (!rider.hasPath || rider.path.length < 2) return;

      let pathColor: string;
      switch (rider.type) {
        case RiderType.VIP:    pathColor = 'rgba(255, 165, 0, 0.5)'; break;
        case RiderType.URGENT: pathColor = 'rgba(255, 69, 0, 0.5)'; break;
        default:               pathColor = 'rgba(255, 215, 0, 0.5)'; break;
      }

      // 像素风虚线
      this.ctx.strokeStyle = pathColor;
      this.ctx.lineWidth = 3;
      this.ctx.setLineDash([6, 4]);

      this.ctx.beginPath();
      const first = rider.path[0];
      this.ctx.moveTo(first.x * cellSize + cellSize / 2, first.y * cellSize + cellSize / 2);

      for (let i = 1; i < rider.path.length; i++) {
        const pt = rider.path[i];
        this.ctx.lineTo(pt.x * cellSize + cellSize / 2, pt.y * cellSize + cellSize / 2);
      }
      this.ctx.stroke();
      this.ctx.setLineDash([]);

      // 像素风waypoint小方块
      rider.path.forEach((pt, idx) => {
        if (idx === 0 || idx === rider.path.length - 1) return;
        this.ctx.fillStyle = pathColor;
        const dotSize = 4;
        this.ctx.fillRect(
          pt.x * cellSize + cellSize / 2 - dotSize / 2,
          pt.y * cellSize + cellSize / 2 - dotSize / 2,
          dotSize,
          dotSize
        );
      });
    });
  }

  private renderPathPreview(riderId: string, path: Position[], isValid: boolean): void {
    if (path.length < 2) return;

    const { cellSize } = this.config;
    const color = isValid ? 'rgba(0, 255, 100, 0.7)' : 'rgba(255, 50, 50, 0.7)';

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([6, 4]);

    this.ctx.beginPath();
    this.ctx.moveTo(path[0].x * cellSize + cellSize / 2, path[0].y * cellSize + cellSize / 2);

    for (let i = 1; i < path.length; i++) {
      this.ctx.lineTo(path[i].x * cellSize + cellSize / 2, path[i].y * cellSize + cellSize / 2);
    }
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // 像素风终点标记
    const last = path[path.length - 1];
    this.ctx.fillStyle = color;
    const markerSize = 8;
    this.ctx.fillRect(
      last.x * cellSize + cellSize / 2 - markerSize / 2,
      last.y * cellSize + cellSize / 2 - markerSize / 2,
      markerSize,
      markerSize
    );
  }

  private renderComboPopups(): void {
    this.comboPopups.forEach(popup => {
      const progress = popup.age / popup.maxAge;
      const alpha = 1 - progress;
      const scale = 1 + progress * 0.5;
      const offsetY = -progress * 60;

      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.font = `bold ${Math.round(20 * scale)}px monospace`;
      this.ctx.fillStyle = '#FFD700';
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 3;
      this.ctx.textAlign = 'center';

      this.ctx.strokeText(popup.text, popup.x, popup.y + offsetY);
      this.ctx.fillText(popup.text, popup.x, popup.y + offsetY);

      this.ctx.restore();
    });
  }

  // ========== 故事渲染 ==========

  /**
   * 绘制对话气泡
   * @param text 对话文本
   * @param characterName 角色名称
   * @param characterColor 角色颜色
   * @param position 气泡位置（屏幕坐标）
   */
  drawDialogueBubble(
    text: string,
    characterName: string,
    characterColor: string,
    position?: { x: number; y: number }
  ): void {
    // 默认位置在屏幕中央偏上
    const x = position?.x || (this.cssWidth / 2);
    const y = position?.y || (this.cssHeight * 0.3);

    const maxWidth = Math.min(400, this.cssWidth * 0.85);
    const lineHeight = 20;
    const padding = 15;

    // 计算文本行数
    const lines = this.wrapText(text, maxWidth - padding * 2);
    const textHeight = lines.length * lineHeight;

    // 气泡尺寸
    const bubbleWidth = maxWidth;
    const bubbleHeight = textHeight + padding * 2 + 25; // 25为角色名区域

    this.ctx.save();

    // 气泡背景
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    this.ctx.strokeStyle = '#FFD700';
    this.ctx.lineWidth = 3;

    const bubbleX = x - bubbleWidth / 2;
    const bubbleY = y - bubbleHeight / 2;

    // 像素风格边框
    this.ctx.fillRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight);
    this.ctx.strokeRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight);

    // 角色名区域
    this.ctx.fillStyle = characterColor;
    this.ctx.fillRect(bubbleX, bubbleY, bubbleWidth, 20);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 12px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(characterName, x, bubbleY + 15);

    // 对话文本
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '10px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';

    lines.forEach((line, i) => {
      this.ctx.fillText(line, x, bubbleY + 35 + padding + i * lineHeight);
    });

    // 小三角指示器（像素风格）
    this.ctx.fillStyle = '#FFD700';
    this.ctx.beginPath();
    this.ctx.moveTo(x - 10, bubbleY + bubbleHeight);
    this.ctx.lineTo(x, bubbleY + bubbleHeight + 15);
    this.ctx.lineTo(x + 10, bubbleY + bubbleHeight);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();
  }

  /**
   * 绘制章节介绍
   * @param title 章节标题
   * @param intro 章节介绍文本
   * @param progress 动画进度 (0-1)
   */
  drawChapterIntro(title: string, intro: string, progress: number): void {
    this.ctx.save();

    // 全屏半透明背景
    this.ctx.fillStyle = `rgba(0, 0, 0, ${0.7 + progress * 0.3})`;
    this.ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);

    // 章节标题（渐入效果）
    const titleAlpha = Math.min(1, progress * 2);
    this.ctx.globalAlpha = titleAlpha;
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 24px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 4;

    const titleY = this.cssHeight * 0.35;
    this.ctx.strokeText(title, this.cssWidth / 2, titleY);
    this.ctx.fillText(title, this.cssWidth / 2, titleY);

    // 章节介绍文本（延迟出现）
    if (progress > 0.5) {
      const introAlpha = Math.min(1, (progress - 0.5) * 2);
      this.ctx.globalAlpha = introAlpha;
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = '10px "Press Start 2P", monospace';

      const lines = this.wrapText(intro, this.cssWidth * 0.8);
      const introY = this.cssHeight * 0.5;
      lines.forEach((line, i) => {
        this.ctx.fillText(line, this.cssWidth / 2, introY + i * 20);
      });
    }

    // 底部提示
    if (progress > 0.8) {
      this.ctx.globalAlpha = 1;
      this.ctx.fillStyle = '#888888';
      this.ctx.font = '8px "Press Start 2P", monospace';
      this.ctx.fillText('点击继续', this.cssWidth / 2, this.cssHeight * 0.85);
    }

    this.ctx.restore();
  }

  /**
   * 文本自动换行
   * @param text 原始文本
   * @param maxWidth 最大宽度
   * @returns 行数组
   */
  private wrapText(text: string, maxWidth: number): string[] {
    const lines: string[] = [];

    // 先按换行符分割
    const paragraphs = text.split('\n');

    paragraphs.forEach(paragraph => {
      if (paragraph === '') {
        lines.push('');
        return;
      }

      let currentLine = '';
      // 使用约10px字体，估算每字符宽度约8px
      const charWidth = 8;
      const maxChars = Math.floor(maxWidth / charWidth);

      for (let i = 0; i < paragraph.length; i++) {
        currentLine += paragraph[i];
        if (currentLine.length >= maxChars) {
          lines.push(currentLine);
          currentLine = '';
        }
      }

      if (currentLine) {
        lines.push(currentLine);
      }
    });

    return lines;
  }

  /**
   * 获取角色颜色
   * @param characterName 角色名称
   * @returns 角色颜色
   */
  getCharacterColor(characterName: string): string {
    const colors: Record<string, string> = {
      '小王': '#FFD700',
      '队长': '#FFA500',
      '老张': '#4CAF50',
      '急急子': '#FF4500',
      'VIP专员': '#9C27B0'
    };
    return colors[characterName] || '#FFD700';
  }
}
