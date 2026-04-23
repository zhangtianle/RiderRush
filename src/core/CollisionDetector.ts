/**
 * 碰撞类型枚举
 */
export enum CollisionType {
  NONE = 'NONE',           // 无碰撞
  EXIT = 'EXIT',           // 到达出口
  OBSTACLE = 'OBSTACLE',   // 碰到阻碍
  RIDER = 'RIDER',         // 碰到其他骑手
  BOUNDARY = 'BOUNDARY'    // 碰到边界
}

/**
 * 碰撞结果接口
 */
export interface CollisionResult {
  type: CollisionType;
  target: any | null;
  position: { x: number; y: number };
}

/**
 * 碰撞检测器
 * @description 负责骑手与阻碍、出口、边界的碰撞检测
 * @version v0.1.0
 * @since 2026-04-24
 */
export class CollisionDetector {
  // ========== 公共方法 ==========

  /**
   * 检查骑手碰撞
   * @description 综合检测骑手的所有碰撞类型
   * @param rider 韦手对象
   * @param obstacles 阻碍列表
   * @param otherRiders 其他骑手列表
   * @param exits 出口列表
   * @param gridSize 网格大小
   * @returns 碰撞结果
   */
  checkRiderCollision(
    rider: any,
    obstacles: any[],
    otherRiders: any[],
    exits: any[],
    gridSize: { width: number; height: number }
  ): CollisionResult {
    // 计算骑手下一帧位置（预留）
    const nextPosition = this.calculateNextPosition(rider);

    // 1. 检查边界碰撞
    if (this.isOutOfBounds(nextPosition, gridSize)) {
      return {
        type: CollisionType.BOUNDARY,
        target: null,
        position: nextPosition
      };
    }

    // 2. 检查出口碰撞
    for (const exit of exits) {
      if (this.isColliding(nextPosition, exit.position)) {
        return {
          type: CollisionType.EXIT,
          target: exit,
          position: nextPosition
        };
      }
    }

    // 3. 检查阻碍碰撞
    for (const obstacle of obstacles) {
      if (this.isCollidingWithRect(nextPosition, obstacle.getCollisionRect())) {
        // 红绿灯特殊处理
        if (obstacle.type === 'TRAFFIC_LIGHT' && obstacle.canPass()) {
          continue; // 绿灯可通过
        }
        return {
          type: CollisionType.OBSTACLE,
          target: obstacle,
          position: nextPosition
        };
      }
    }

    // 4. 检查骑手间碰撞
    for (const other of otherRiders) {
      if (other.id !== rider.id && other.state === 'MOVING') {
        if (this.isColliding(nextPosition, other.position)) {
          return {
            type: CollisionType.RIDER,
            target: other,
            position: nextPosition
          };
        }
      }
    }

    // 5. 无碰撞
    return {
      type: CollisionType.NONE,
      target: null,
      position: nextPosition
    };
  }

  /**
   * 检查阻碍碰撞
   * @description 判断骑手是否与指定阻碍碰撞
   * @param rider 韦手对象
   * @param obstacle 阻碍对象
   * @returns 是否碰撞
   */
  checkObstacleCollision(rider: any, obstacle: any): boolean {
    return this.isCollidingWithRect(
      rider.position,
      obstacle.getCollisionRect()
    );
  }

  /**
   * 检查骑手间碰撞
   * @description 判断两个骑手是否碰撞
   * @param rider1 韦手1
   * @param rider2 韦手2
   * @returns 是否碰撞
   */
  checkRiderRiderCollision(rider1: any, rider2: any): boolean {
    return this.isColliding(rider1.position, rider2.position);
  }

  /**
   * 检查出口碰撞
   * @description 判断骑手是否到达出口
   * @param rider 韦手对象
   * @param exit 出口对象
   * @returns 是否到达
   */
  checkExitCollision(rider: any, exit: any): boolean {
    return this.isColliding(rider.position, exit.position);
  }

  /**
   * 检查边界碰撞
   * @description 判断骑手是否超出网格边界
   * @param rider 韦手对象
   * @param gridSize 网格大小
   * @returns 是否超出边界
   */
  checkBoundaryCollision(
    rider: any,
    gridSize: { width: number; height: number }
  ): boolean {
    return this.isOutOfBounds(rider.position, gridSize);
  }

  // ========== 私有方法 ==========

  /**
   * 计算下一帧位置
   * @description 根据骑手方向和速度计算下一帧位置
   * @param rider 韦手对象
   * @returns 预计下一位置
   */
  private calculateNextPosition(rider: any): { x: number; y: number } {
    // 预留：根据speed和direction计算
    // 暂时返回当前位置
    return { ...rider.position };
  }

  /**
   * 简化碰撞检测
   * @description 判断两个位置是否碰撞
   * @param pos1 位置1
   * @param pos2 位置2
   * @param tolerance 碰撞容差
   * @returns 是否碰撞
   */
  private isColliding(
    pos1: { x: number; y: number },
    pos2: { x: number; y: number },
    tolerance: number = 0.5
  ): boolean {
    return Math.abs(pos1.x - pos2.x) < tolerance &&
           Math.abs(pos1.y - pos2.y) < tolerance;
  }

  /**
   * 区域碰撞检测
   * @description 判断位置是否在矩形区域内
   * @param pos 位置
   * @param rect 矩形区域
   * @returns 是否在区域内
   */
  private isCollidingWithRect(
    pos: { x: number; y: number },
    rect: { x: number; y: number; width: number; height: number }
  ): boolean {
    return pos.x >= rect.x &&
           pos.x <= rect.x + rect.width &&
           pos.y >= rect.y &&
           pos.y <= rect.y + rect.height;
  }

  /**
   * 边界检测
   * @description 判断位置是否超出网格边界
   * @param pos 位置
   * @param gridSize 网格大小
   * @returns 是否超出边界
   */
  private isOutOfBounds(
    pos: { x: number; y: number },
    gridSize: { width: number; height: number }
  ): boolean {
    return pos.x < 0 ||
           pos.x > gridSize.width ||
           pos.y < 0 ||
           pos.y > gridSize.height;
  }
}