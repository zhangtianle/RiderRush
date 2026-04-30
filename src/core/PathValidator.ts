/**
 * 路径验证器
 * @description 验证玩家绘制的路径是否合法
 */

import { Position } from './Rider';
import { Obstacle, ObstacleType } from './Obstacle';

export interface PathValidationResult {
  valid: boolean;
  reason?: string;
}

export class PathValidator {
  /**
   * 验证路径
   * @param path 路径点数组
   * @param riderStart 骑手起始位置
   * @param obstacles 障碍列表
   * @param exits 出口列表
   * @param gridSize 网格大小
   */
  validatePath(
    path: Position[],
    riderStart: Position,
    obstacles: Obstacle[],
    exits: Position[],
    gridSize: { width: number; height: number }
  ): PathValidationResult {
    if (path.length < 2) {
      return { valid: false, reason: '路径太短' };
    }

    // 1. 起点必须=骑手位置
    const first = path[0];
    if (Math.abs(first.x - riderStart.x) > 0.01 || Math.abs(first.y - riderStart.y) > 0.01) {
      return { valid: false, reason: '路径起点不在骑手位置' };
    }

    // 2. 终点必须=某个出口位置
    const last = path[path.length - 1];
    const nearExit = exits.some(exit =>
      Math.abs(last.x - exit.x) < 1 && Math.abs(last.y - exit.y) < 1
    );
    if (!nearExit) {
      return { valid: false, reason: '路径终点不在出口' };
    }

    // 3. 逐段检查
    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i];
      const to = path[i + 1];

      // 轴对齐检查
      if (Math.abs(from.x - to.x) > 0.01 && Math.abs(from.y - to.y) > 0.01) {
        return { valid: false, reason: '路径段必须水平或垂直' };
      }

      // 越界检查
      if (this.isOutOfBounds(to, gridSize)) {
        return { valid: false, reason: '路径超出边界' };
      }

      // 墙体穿越检查
      const wallObstacles = obstacles.filter(o => o.type === ObstacleType.WALL);
      for (const wall of wallObstacles) {
        if (this.segmentIntersectsRect(from, to, wall.getCollisionRect())) {
          return { valid: false, reason: '路径穿过墙体' };
        }
      }
    }

    return { valid: true };
  }

  /**
   * 检查点是否越界
   */
  private isOutOfBounds(pos: Position, gridSize: { width: number; height: number }): boolean {
    return pos.x < 0 || pos.x > gridSize.width || pos.y < 0 || pos.y > gridSize.height;
  }

  /**
   * 检查线段是否与矩形相交（轴对齐线段的简化算法）
   */
  private segmentIntersectsRect(
    from: Position,
    to: Position,
    rect: { x: number; y: number; width: number; height: number }
  ): boolean {
    // 轴对齐线段：将线段上的关键点与矩形做包含测试
    const isHorizontal = Math.abs(from.y - to.y) < 0.01;
    const minX = Math.min(from.x, to.x);
    const maxX = Math.max(from.x, to.x);
    const minY = Math.min(from.y, to.y);
    const maxY = Math.max(from.y, to.y);

    if (isHorizontal) {
      // 水平线段：检查是否穿过矩形（开区间，边界不算穿墙）
      const y = from.y;
      if (y >= rect.y && y < rect.y + rect.height &&
          maxX > rect.x && minX < rect.x + rect.width) {
        return true;
      }
    } else {
      // 垂直线段（开区间，边界不算穿墙）
      const x = from.x;
      if (x >= rect.x && x < rect.x + rect.width &&
          maxY > rect.y && minY < rect.y + rect.height) {
        return true;
      }
    }
    return false;
  }
}
