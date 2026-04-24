/**
 * 游戏Canvas渲染器
 * @description 负责将游戏元素渲染到Canvas
 * @version v0.1.0
 * @since 2026-04-25
 */

import { Rider, RiderState, RiderType, Direction } from '../core/Rider';
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
  traffic: '#FF6B6B',
  trafficLightRed: '#FF0000',
  trafficLightGreen: '#00FF00',
  gate: '#4A90D9',

  // 其他
  exit: '#00FF00',
  exitHighlight: '#FFD700',
  gridLine: '#333344',
  background: '#1a1a2e',
  gridBackground: '#16213e'
};

/**
 * Canvas渲染器
 */
export class GameRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: RenderConfig;

  /** 韦手高亮 */
  private highlightedRider: string | null = null;

  /** 台词气泡 */
  private quoteBubble: { riderId: string; text: string; x: number; y: number; duration: number } | null = null;

  /** 粒子效果 */
  private particles: { x: number; y: number; vx: number; vy: number; life: number; color: string }[] = [];

  constructor(canvasId: string, config?: Partial<RenderConfig>) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;

    this.config = {
      cellSize: config?.cellSize || 60,
      riderSize: config?.riderSize || 40,
      obstacleSize: config?.obstacleSize || 50,
      exitSize: config?.exitSize || 40
    };
  }

  /**
   * 设置画布大小
   */
  setCanvasSize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  /**
   * 获取配置
   */
  getConfig(): RenderConfig {
    return this.config;
  }

  /**
   * 清空画布
   */
  clear(): void {
    this.ctx.fillStyle = COLORS.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * 渲染完整场景
   */
  render(controller: GameLogicController): void {
    this.clear();

    const level = controller.getLevel();
    if (!level) return;

    // 渲染网格
    this.renderGrid(level);

    // 渲染出口
    this.renderExits(level);

    // 渲染阻碍
    this.renderObstacles(controller.getObstacles());

    // 渲染骑手
    this.renderRiders(controller.getRiders());

    // 渲染粒子效果
    this.renderParticles();

    // 渲染台词气泡（已移到HTML层）
  }

  /**
   * 渲染网格背景
   */
  private renderGrid(level: Level): void {
    const { cellSize } = this.config;
    const gridWidth = level.gridSize.width;
    const gridHeight = level.gridSize.height;

    // 绘制网格背景
    this.ctx.fillStyle = COLORS.gridBackground;
    this.ctx.fillRect(0, 0, gridWidth * cellSize, gridHeight * cellSize);

    // 绘制网格线
    this.ctx.strokeStyle = COLORS.gridLine;
    this.ctx.lineWidth = 1;

    // 垂直线
    for (let x = 0; x <= gridWidth; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * cellSize, 0);
      this.ctx.lineTo(x * cellSize, gridHeight * cellSize);
      this.ctx.stroke();
    }

    // 水平线
    for (let y = 0; y <= gridHeight; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * cellSize);
      this.ctx.lineTo(gridWidth * cellSize, y * cellSize);
      this.ctx.stroke();
    }
  }

  /**
   * 渲染出口
   */
  private renderExits(level: Level): void {
    const { cellSize, exitSize } = this.config;

    level.exits.forEach(exit => {
      const x = exit.position.x * cellSize + (cellSize - exitSize) / 2;
      const y = exit.position.y * cellSize + (cellSize - exitSize) / 2;

      // 出口底色
      this.ctx.fillStyle = COLORS.exit;
      this.ctx.fillRect(x, y, exitSize, exitSize);

      // 出口边框
      this.ctx.strokeStyle = COLORS.exitHighlight;
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(x, y, exitSize, exitSize);

      // 出口图标（箭头指向外）
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.beginPath();

      // 根据出口位置绘制箭头方向
      const arrowSize = exitSize / 3;
      const centerX = x + exitSize / 2;
      const centerY = y + exitSize / 2;

      this.ctx.moveTo(centerX - arrowSize, centerY - arrowSize / 2);
      this.ctx.lineTo(centerX + arrowSize / 2, centerY);
      this.ctx.lineTo(centerX - arrowSize, centerY + arrowSize / 2);
      this.ctx.closePath();
      this.ctx.fill();
    });
  }

  /**
   * 渲染阻碍
   */
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

  /**
   * 渲染墙壁
   */
  private renderWall(x: number, y: number, width: number, height: number): void {
    this.ctx.fillStyle = COLORS.wall;
    this.ctx.fillRect(x, y, width, height);

    // 墙壁纹理（砖块效果）
    this.ctx.strokeStyle = '#666666';
    this.ctx.lineWidth = 2;

    // 水平线
    const brickHeight = height / 4;
    for (let i = 0; i < 4; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, y + i * brickHeight);
      this.ctx.lineTo(x + width, y + i * brickHeight);
      this.ctx.stroke();
    }

    // 垂直线
    const brickWidth = width / 3;
    for (let i = 0; i < 3; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x + i * brickWidth, y);
      this.ctx.lineTo(x + i * brickWidth, y + height);
      this.ctx.stroke();
    }
  }

  /**
   * 渲染堵车区
   */
  private renderTraffic(x: number, y: number, width: number, height: number, slowFactor: number): void {
    // 堵车区底色（红色渐变）
    const alpha = 0.3 + slowFactor * 0.4;
    this.ctx.fillStyle = `rgba(255, 107, 107, ${alpha})`;
    this.ctx.fillRect(x, y, width, height);

    // 堵车图标（小车）
    const carCount = Math.floor(width / 30);
    for (let i = 0; i < carCount && i < 3; i++) {
      const carX = x + 10 + i * 30;
      const carY = y + height / 2 - 10;

      // 小车方块
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillRect(carX, carY, 20, 15);
    }
  }

  /**
   * 渲染红绿灯
   */
  private renderTrafficLight(x: number, y: number, obstacle: Obstacle): void {
    const { cellSize } = this.config;
    const centerX = x + cellSize / 2;
    const centerY = y + cellSize / 2;
    const radius = cellSize / 3;

    // 红绿灯背景
    this.ctx.fillStyle = '#333333';
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius + 5, 0, Math.PI * 2);
    this.ctx.fill();

    // 灯光颜色
    const lightColor = obstacle.lightState === TrafficLightState.RED
      ? COLORS.trafficLightRed
      : COLORS.trafficLightGreen;

    // 发光效果
    this.ctx.shadowColor = lightColor;
    this.ctx.shadowBlur = 20;

    this.ctx.fillStyle = lightColor;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // 清除阴影
    this.ctx.shadowBlur = 0;
  }

  /**
   * 渲染门禁
   */
  private renderGate(x: number, y: number, width: number, height: number): void {
    this.ctx.fillStyle = COLORS.gate;
    this.ctx.fillRect(x, y, width, height);

    // 门禁杆图标
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(x + width / 4, y);
    this.ctx.lineTo(x + width / 4, y + height);
    this.ctx.stroke();
  }

  /**
   * 渲染骑手
   */
  private renderRiders(riders: Rider[]): void {
    const { cellSize, riderSize } = this.config;

    riders.forEach(rider => {
      // 计算位置（浮点坐标用于平滑移动）
      const x = rider.position.x * cellSize + (cellSize - riderSize) / 2;
      const y = rider.position.y * cellSize + (cellSize - riderSize) / 2;

      // 根据类型选择颜色
      let baseColor: string;
      switch (rider.type) {
        case RiderType.VIP:
          baseColor = COLORS.riderVIP;
          break;
        case RiderType.URGENT:
          baseColor = COLORS.riderUrgent;
          break;
        default:
          baseColor = COLORS.riderNormal;
      }

      // 根据状态调整颜色
      let alpha = 1;
      let borderColor = '#FFFFFF';

      switch (rider.state) {
        case RiderState.SUCCESS:
          borderColor = '#00FF00';
          break;
        case RiderState.CRASHED:
          borderColor = '#FF0000';
          alpha = 0.7;
          break;
        case RiderState.WAITING:
          borderColor = '#FF9800';
          break;
        case RiderState.MOVING:
          borderColor = '#00FFFF';
          break;
      }

      // 绘制骑手方块
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = baseColor;
      this.ctx.fillRect(x, y, riderSize, riderSize);

      // 绘制边框
      this.ctx.strokeStyle = borderColor;
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(x, y, riderSize, riderSize);

      // 绘制方向箭头
      this.renderDirectionArrow(x, y, riderSize, rider.direction);

      // VIP标记
      if (rider.type === RiderType.VIP) {
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.fillText('VIP', x + riderSize / 2 - 12, y + riderSize / 2 + 4);
      }

      // 加急标记（倒计时）
      if (rider.type === RiderType.URGENT && rider.timeLimit > 0) {
        this.ctx.fillStyle = rider.timeRemaining < 10 ? '#FF0000' : '#FFFFFF';
        this.ctx.font = 'bold 10px Arial';
        this.ctx.fillText(`${Math.ceil(rider.timeRemaining)}s`, x + riderSize / 2 - 10, y - 5);
      }

      // 高亮效果
      if (this.highlightedRider === rider.id) {
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 5;
        this.ctx.strokeRect(x - 5, y - 5, riderSize + 10, riderSize + 10);
      }

      this.ctx.globalAlpha = 1;
    });
  }

  /**
   * 渲染方向箭头
   */
  private renderDirectionArrow(x: number, y: number, size: number, direction: Direction): void {
    const arrowSize = size / 4;
    const centerX = x + size / 2;
    const centerY = y + size / 2;

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.beginPath();

    switch (direction) {
      case Direction.RIGHT:
        this.ctx.moveTo(centerX - arrowSize, centerY - arrowSize / 2);
        this.ctx.lineTo(centerX + arrowSize, centerY);
        this.ctx.lineTo(centerX - arrowSize, centerY + arrowSize / 2);
        break;

      case Direction.LEFT:
        this.ctx.moveTo(centerX + arrowSize, centerY - arrowSize / 2);
        this.ctx.lineTo(centerX - arrowSize, centerY);
        this.ctx.lineTo(centerX + arrowSize, centerY + arrowSize / 2);
        break;

      case Direction.UP:
        this.ctx.moveTo(centerX - arrowSize / 2, centerY + arrowSize);
        this.ctx.lineTo(centerX, centerY - arrowSize);
        this.ctx.lineTo(centerX + arrowSize / 2, centerY + arrowSize);
        break;

      case Direction.DOWN:
        this.ctx.moveTo(centerX - arrowSize / 2, centerY - arrowSize);
        this.ctx.lineTo(centerX, centerY + arrowSize);
        this.ctx.lineTo(centerX + arrowSize / 2, centerY - arrowSize);
        break;
    }

    this.ctx.closePath();
    this.ctx.fill();
  }

  /**
   * 渲染粒子效果
   */
  private renderParticles(): void {
    this.particles.forEach(p => {
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1;
  }

  /**
   * 更新粒子
   */
  updateParticles(dt: number): void {
    this.particles = this.particles.filter(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt * 2;
      return p.life > 0;
    });
  }

  /**
   * 添加成功粒子
   */
  addSuccessParticles(x: number, y: number): void {
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 100,
        vy: (Math.random() - 0.5) * 100,
        life: 1,
        color: '#00FF00'
      });
    }
  }

  /**
   * 添加撞车粒子
   */
  addCrashParticles(x: number, y: number): void {
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 150,
        vy: (Math.random() - 0.5) * 150,
        life: 1,
        color: '#FF0000'
      });
    }
  }

  /**
   * 设置高亮骑手
   */
  setHighlightedRider(riderId: string | null): void {
    this.highlightedRider = riderId;
  }

  /**
   * 网格坐标转屏幕坐标
   */
  gridToScreen(gridX: number, gridY: number): { x: number; y: number } {
    return {
      x: gridX * this.config.cellSize,
      y: gridY * this.config.cellSize
    };
  }

  /**
   * 屏幕坐标转网格坐标
   */
  screenToGrid(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: Math.floor(screenX / this.config.cellSize),
      y: Math.floor(screenY / this.config.cellSize)
    };
  }
}