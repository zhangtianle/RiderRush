/**
 * 韦手状态枚举
 */
export enum RiderState {
  IDLE = 'IDLE',           // 等待中
  MOVING = 'MOVING',       // 移动中
  SUCCESS = 'SUCCESS',     // 成功送达
  CRASHED = 'CRASHED',     // 撞车
  WAITING = 'WAITING',     // 等待红灯
  RETURNED = 'RETURNED'    // 弹回起点
}

/**
 * 韦手类型枚举
 */
export enum RiderType {
  NORMAL = 'NORMAL',       // 普通订单
  VIP = 'VIP',             // VIP订单
  URGENT = 'URGENT'        // 加急订单
}

/**
 * 韦手方向枚举
 */
export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

/**
 * 位置接口
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * 韦手配置接口
 */
export interface RiderConfig {
  id: string;
  type: RiderType;
  direction: Direction;
  startPosition: Position;
  targetExit: string;
  speed?: number;
  timeLimit?: number;
}

/**
 * 碰撞结果接口
 */
export interface CollisionResult {
  type: string;
  target: any | null;
  position: Position;
}

/**
 * 韦手实体类
 * @description 外卖骑手的核心实体，负责骑手的移动、碰撞、状态管理
 * @version v0.1.0
 * @since 2026-04-24
 */
export class Rider {
  // ========== 属性 ==========

  /** 韦手唯一ID */
  id: string;

  /** 韦手类型 */
  type: RiderType;

  /** 出发方向 */
  direction: Direction;

  /** 当前状态 */
  state: RiderState;

  /** 当前位置 */
  position: Position;

  /** 起点位置 */
  startPosition: Position;

  /** 目标出口ID */
  targetExit: string;

  /** 移动速度（格/秒） */
  speed: number;

  /** 时间限制（加急单，秒） */
  timeLimit: number;

  /** 剩余时间 */
  timeRemaining: number;

  /** 是否必须第一个送达（VIP） */
  isVIPFirst: boolean;

  /** 是否已送达 */
  hasDelivered: boolean;

  /** 当前表情 */
  currentExpression: string;

  // ========== 构造函数 ==========

  constructor(config: RiderConfig) {
    console.log(`[Rider] 构造函数: id=${config.id}, startPosition=${JSON.stringify(config.startPosition)}`);

    if (!config.startPosition) {
      console.error(`[Rider] startPosition缺失! config=${JSON.stringify(config)}`);
      config.startPosition = { x: 0, y: 0 };  // 默认值防止崩溃
    }

    this.id = config.id;
    this.type = config.type;
    this.direction = config.direction;
    this.startPosition = config.startPosition;
    this.targetExit = config.targetExit;

    // 初始化位置
    this.position = { ...config.startPosition };

    // 初始化状态
    this.state = RiderState.IDLE;

    // 默认速度
    this.speed = config.speed || 1;

    // 时间限制（加急单）
    this.timeLimit = config.timeLimit || 0;
    this.timeRemaining = this.timeLimit;

    // VIP属性
    this.isVIPFirst = config.type === RiderType.VIP;
    this.hasDelivered = false;

    // 表情
    this.currentExpression = 'normal';
  }

  // ========== 公共方法 ==========

  /**
   * 开始移动
   * @description 韦手开始沿预设方向移动
   */
  startMove(): void {
    if (this.state === RiderState.IDLE) {
      this.state = RiderState.MOVING;
      this.changeExpression('moving');
    }
  }

  /**
   * 更新状态
   * @description 每帧更新骑手位置和状态
   * @param dt 时间增量（秒）
   */
  update(dt: number): void {
    // 更新时间限制（加急单）
    if (this.type === RiderType.URGENT && this.timeLimit > 0) {
      this.timeRemaining -= dt;
      if (this.timeRemaining <= 0) {
        this.handleTimeout();
        return;
      }
    }

    // 移动中的骑手更新位置
    if (this.state === RiderState.MOVING) {
      this.updatePosition(dt);
    }
  }

  /**
   * 处理碰撞
   * @description 根据碰撞结果处理骑手状态
   * @param result 碰撞检测结果
   */
  handleCollision(result: CollisionResult): void {
    switch (result.type) {
      case 'EXIT':
        // 到达出口，成功送达
        this.handleSuccess();
        break;

      case 'OBSTACLE':
        // 碰到阻碍
        if (result.target?.type === 'TRAFFIC_LIGHT') {
          // 红绿灯：红灯时等待
          if (result.target.lightState === 'RED') {
            this.handleWaiting();
          }
        } else {
          // 其他阻碍：弹回起点
          this.handleCrash();
        }
        break;

      case 'RIDER':
        // 撞到其他骑手：两者都弹回
        this.handleCrash();
        break;

      case 'BOUNDARY':
        // 碰到边界：弹回起点
        this.handleCrash();
        break;
    }
  }

  /**
   * 状态切换
   * @description 切换骑手状态并触发相应变化
   * @param newState 新状态
   */
  changeState(newState: RiderState): void {
    const oldState = this.state;
    this.state = newState;

    // 状态变化时的表情切换
    switch (newState) {
      case RiderState.SUCCESS:
        this.changeExpression('happy');
        break;
      case RiderState.CRASHED:
        this.changeExpression('sad');
        break;
      case RiderState.WAITING:
        this.changeExpression('waiting');
        break;
      case RiderState.RETURNED:
        this.changeExpression('sad');
        break;
      default:
        this.changeExpression('normal');
    }
  }

  /**
   * 重置到起点
   * @description 韦手弹回起点位置，恢复初始状态
   */
  reset(): void {
    this.position = { ...this.startPosition };
    this.state = RiderState.IDLE;
    this.hasDelivered = false;
    this.timeRemaining = this.timeLimit;
    this.changeExpression('normal');
  }

  /**
   * 销毁
   * @description 清理骑手资源
   */
  destroy(): void {
    // 清理逻辑（预留扩展）
  }

  // ========== 私有方法 ==========

  /**
   * 更新位置
   * @description 根据方向和时间增量计算新位置
   * @param dt 时间增量（秒）
   */
  private updatePosition(dt: number): void {
    const distance = this.speed * dt;

    switch (this.direction) {
      case Direction.UP:
        this.position.y -= distance;
        break;
      case Direction.DOWN:
        this.position.y += distance;
        break;
      case Direction.LEFT:
        this.position.x -= distance;
        break;
      case Direction.RIGHT:
        this.position.x += distance;
        break;
    }
  }

  /**
   * 处理成功送达
   * @description 韦手到达出口，标记成功
   */
  private handleSuccess(): void {
    this.state = RiderState.SUCCESS;
    this.hasDelivered = true;
    this.changeExpression('happy');
  }

  /**
   * 处理撞车
   * @description 韦手撞到障碍或其他骑手，弹回起点
   */
  private handleCrash(): void {
    this.state = RiderState.CRASHED;
    this.changeExpression('sad');

    // 延迟后弹回起点
    setTimeout(() => {
      this.reset();
    }, 500);
  }

  /**
   * 处理等待（红灯）
   * @description 韦手在红灯前等待
   */
  private handleWaiting(): void {
    this.state = RiderState.WAITING;
    this.changeExpression('waiting');
  }

  /**
   * 处理超时
   * @description 加急单时间耗尽
   */
  private handleTimeout(): void {
    this.state = RiderState.CRASHED;
    this.changeExpression('sad');
  }

  /**
   * 表情切换
   * @description 根据状态切换骑手表情
   * @param expression 表情名称
   */
  private changeExpression(expression: string): void {
    this.currentExpression = expression;
    // 触发表情变化事件（预留）
  }
}