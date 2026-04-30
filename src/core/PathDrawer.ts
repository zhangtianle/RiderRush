/**
 * 路径绘制器
 * @description 处理玩家拖拽画路径的交互逻辑
 */

import { Position } from './Rider';
import { Rider } from './Rider';
import { PathValidator, PathValidationResult } from './PathValidator';
import { Obstacle } from './Obstacle';

export class PathDrawer {
  private isDrawing: boolean = false;
  private currentRider: Rider | null = null;
  private currentPath: Position[] = [];
  private pathValidator: PathValidator;
  private lastGridPos: Position | null = null;

  // 验证所需数据
  private obstacles: Obstacle[] = [];
  private exits: Position[] = [];
  private gridSize: { width: number; height: number } = { width: 10, height: 8 };

  // 回调
  onPathUpdate: ((riderId: string, path: Position[], isValid: boolean) => void) | null = null;
  onPathComplete: ((riderId: string, path: Position[]) => void) | null = null;
  onPathCancelled: ((riderId: string) => void) | null = null;

  constructor() {
    this.pathValidator = new PathValidator();
  }

  /**
   * 设置验证所需的关卡数据
   */
  setLevelData(obstacles: Obstacle[], exits: Position[], gridSize: { width: number; height: number }): void {
    this.obstacles = obstacles;
    this.exits = exits;
    this.gridSize = gridSize;
  }

  /**
   * 开始绘制路径
   * @param rider 选中的骑手
   */
  startDrawing(rider: Rider): boolean {
    if (this.isDrawing) return false;
    if (rider.state !== 'IDLE' || rider.hasDelivered) return false;
    if (rider.hasPath) return false; // 已有路径，需先清除

    this.isDrawing = true;
    this.currentRider = rider;
    this.currentPath = [{ x: Math.round(rider.position.x), y: Math.round(rider.position.y) }];
    this.lastGridPos = this.currentPath[0];
    return true;
  }

  /**
   * 继续绘制（拖拽中）
   * @param screenGridPos 当前鼠标/触摸的网格坐标
   */
  continueDrawing(screenGridPos: Position): void {
    if (!this.isDrawing || !this.currentRider) return;

    const gridPos = { x: Math.round(screenGridPos.x), y: Math.round(screenGridPos.y) };

    // 忽略重复位置
    if (this.lastGridPos && gridPos.x === this.lastGridPos.x && gridPos.y === this.lastGridPos.y) {
      return;
    }

    // 轴对齐检查：新点必须与前一个点同行或同列
    const lastPt = this.currentPath[this.currentPath.length - 1];
    const isAligned = Math.abs(gridPos.x - lastPt.x) < 0.01 || Math.abs(gridPos.y - lastPt.y) < 0.01;
    if (!isAligned) {
      // 自动插入拐点：先水平后垂直
      const corner = { x: gridPos.x, y: lastPt.y };
      if (corner.x !== lastPt.x || corner.y !== lastPt.y) {
        this.currentPath.push(corner);
      }
    }

    this.currentPath.push(gridPos);
    this.lastGridPos = gridPos;

    // 实时验证并回调
    const result = this.pathValidator.validatePath(
      this.currentPath,
      this.currentRider.position,
      this.obstacles,
      this.exits,
      this.gridSize
    );

    if (this.onPathUpdate) {
      this.onPathUpdate(this.currentRider.id, [...this.currentPath], result.valid);
    }
  }

  /**
   * 结束绘制
   */
  endDrawing(): void {
    if (!this.isDrawing || !this.currentRider) {
      this.isDrawing = false;
      return;
    }

    const result = this.pathValidator.validatePath(
      this.currentPath,
      this.currentRider.position,
      this.obstacles,
      this.exits,
      this.gridSize
    );

    if (result.valid && this.currentPath.length >= 2) {
      if (this.onPathComplete) {
        this.onPathComplete(this.currentRider.id, [...this.currentPath]);
      }
    } else {
      if (this.onPathCancelled) {
        this.onPathCancelled(this.currentRider.id);
      }
    }

    this.isDrawing = false;
    this.currentRider = null;
    this.currentPath = [];
    this.lastGridPos = null;
  }

  /**
   * 取消绘制
   */
  cancelDrawing(): void {
    if (!this.isDrawing || !this.currentRider) {
      this.isDrawing = false;
      return;
    }

    if (this.onPathCancelled) {
      this.onPathCancelled(this.currentRider.id);
    }

    this.isDrawing = false;
    this.currentRider = null;
    this.currentPath = [];
    this.lastGridPos = null;
  }

  get drawing(): boolean {
    return this.isDrawing;
  }

  get activeRider(): Rider | null {
    return this.currentRider;
  }

  get activePath(): Position[] {
    return [...this.currentPath];
  }
}
