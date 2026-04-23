/**
 * 阻碍类型枚举
 */
export enum ObstacleType {
  WALL = 'WALL',               // 墙壁（弹回）
  TRAFFIC = 'TRAFFIC',         // 堵车区（减速）
  TRAFFIC_LIGHT = 'TRAFFIC_LIGHT',  // 红绿灯（周期切换）
  GATE = 'GATE'                // 门禁杆（需等待）
}

/**
 * 红绿灯状态枚举
 */
export enum TrafficLightState {
  RED = 'RED',    // 红灯
  GREEN = 'GREEN' // 绿灯
}

/**
 * 位置接口
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * 尺寸接口
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * 阻碍配置接口
 */
export interface ObstacleConfig {
  id: string;
  type: ObstacleType;
  position: Position;
  size?: Size;
  lightCycle?: number;   // 红绿灯周期
  slowFactor?: number;   // 减速系数
}

/**
 * 阻碍实体类
 * @description 关卡中的障碍物，包括墙壁、堵车区、红绿灯等
 * @version v0.1.0
 * @since 2026-04-24
 */
export class Obstacle {
  // ========== 属性 ==========

  /** 阻碍唯一ID */
  id: string;

  /** 阻碍类型 */
  type: ObstacleType;

  /** 位置 */
  position: Position;

  /** 尺寸 */
  size: Size;

  // 红绿灯特有属性
  /** 红绿灯状态 */
  lightState: TrafficLightState;

  /** 红绿灯周期（秒） */
  lightCycle: number;

  /** 当前周期时间 */
  cycleTimer: number;

  // 堵车区特有属性
  /** 减速系数 */
  slowFactor: number;

  // ========== 构造函数 ==========

  constructor(config: ObstacleConfig) {
    this.id = config.id;
    this.type = config.type;
    this.position = config.position;
    this.size = config.size || { width: 1, height: 1 };

    // 红绿灯初始化
    if (this.type === ObstacleType.TRAFFIC_LIGHT) {
      this.lightState = TrafficLightState.RED;
      this.lightCycle = config.lightCycle || 3; // 默认3秒周期
      this.cycleTimer = 0;
    }

    // 堵车区初始化
    if (this.type === ObstacleType.TRAFFIC) {
      this.slowFactor = config.slowFactor || 0.5; // 默认减速50%
    }
  }

  // ========== 公共方法 ==========

  /**
   * 更新状态
   * @description 每帧更新阻碍状态（主要用于红绿灯）
   * @param dt 时间增量（秒）
   */
  update(dt: number): void {
    if (this.type === ObstacleType.TRAFFIC_LIGHT) {
      this.updateTrafficLight(dt);
    }
  }

  /**
   * 是否可通过
   * @description 判断阻碍当前是否可以通行
   * @returns 是否可通过
   */
  canPass(): boolean {
    switch (this.type) {
      case ObstacleType.WALL:
        return false;

      case ObstacleType.TRAFFIC:
        return true; // 堵车区可通过，但会减速

      case ObstacleType.TRAFFIC_LIGHT:
        return this.lightState === TrafficLightState.GREEN;

      case ObstacleType.GATE:
        return true; // 门禁可通过，但需等待

      default:
        return false;
    }
  }

  /**
   * 获取减速系数
   * @description 堵车区的减速效果
   * @returns 减速系数（1为正常速度）
   */
  getSlowFactor(): number {
    if (this.type === ObstacleType.TRAFFIC) {
      return this.slowFactor;
    }
    return 1; // 正常速度
  }

  /**
   * 切换红绿灯
   * @description 手动切换红绿灯状态（用于测试）
   */
  toggleLight(): void {
    if (this.type === ObstacleType.TRAFFIC_LIGHT) {
      this.lightState = this.lightState === TrafficLightState.RED
        ? TrafficLightState.GREEN
        : TrafficLightState.RED;
    }
  }

  /**
   * 获取碰撞区域
   * @description 返回阻碍的碰撞区域
   * @returns 碰撞区域
   */
  getCollisionRect(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.size.width,
      height: this.size.height
    };
  }

  // ========== 私有方法 ==========

  /**
   * 更新红绿灯状态
   * @description 红绿灯周期性切换
   * @param dt 时间增量（秒）
   */
  private updateTrafficLight(dt: number): void {
    this.cycleTimer += dt;

    if (this.cycleTimer >= this.lightCycle) {
      this.cycleTimer = 0;
      this.toggleLight();
    }
  }
}