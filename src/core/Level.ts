import { Rider, RiderState, RiderType, Direction, RiderConfig } from './Rider';
import { Obstacle, ObstacleType, TrafficLightState, ObstacleConfig } from './Obstacle';

/**
 * 位置接口
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * 出口接口
 */
export interface Exit {
  id: string;
  position: Position;
}

/**
 * 关卡状态枚举
 */
export enum LevelState {
  READY = 'READY',       // 准备开始
  PLAYING = 'PLAYING',   // 进行中
  PAUSED = 'PAUSED',     // 暂停
  SUCCESS = 'SUCCESS',   // 通关
  FAILED = 'FAILED'      // 失败
}

/**
 * 关卡配置接口
 */
export interface LevelConfig {
  id: number;
  name: string;
  gridSize: { width: number; height: number };
  timeLimit?: number;
  riders: RiderConfig[];  // 配置是RiderConfig数组
  obstacles: ObstacleConfig[];  // 配置是ObstacleConfig数组
  exits: Exit[];
  mapTheme?: string;
}

/**
 * 关卡实体类
 * @description 单个关卡的管理，包含骑手、阻碍、出口等
 * @version v0.1.0
 * @since 2026-04-24
 */
export class Level {
  // ========== 属性 ==========

  /** 关卡ID */
  id: number;

  /** 关卡名称 */
  name: string;

  /** 当前状态 */
  state: LevelState;

  /** 网格大小 */
  gridSize: { width: number; height: number };

  /** 关卡时间限制（秒） */
  timeLimit: number;

  /** 剩余时间 */
  timeRemaining: number;

  /** 骑手列表 */
  riders: Rider[];

  /** 阻碍列表 */
  obstacles: Obstacle[];

  /** 出口列表 */
  exits: Exit[];

  /** 地图主题 */
  mapTheme: string;

  /** 已送达数量 */
  deliveredCount: number;

  /** 总骑手数 */
  totalRiders: number;

  /** 是否有VIP骑手 */
  hasVIPRider: boolean;

  /** VIP骑手是否已送达 */
  vipDelivered: boolean;

  // ========== 构造函数 ==========

  constructor(config: LevelConfig) {
    this.id = config.id;
    this.name = config.name;
    this.gridSize = config.gridSize;
    this.timeLimit = config.timeLimit || 0;
    this.timeRemaining = this.timeLimit;
    this.exits = config.exits;
    this.mapTheme = config.mapTheme || 'city';

    // 初始化状态
    this.state = LevelState.READY;

    // 创建骑手实例
    this.riders = config.riders.map(r => new Rider(r));

    // 创建阻碍实例
    this.obstacles = config.obstacles.map(o => new Obstacle(o));

    // 统计
    this.deliveredCount = 0;
    this.totalRiders = this.riders.length;

    // VIP检查
    this.hasVIPRider = this.riders.some(r => r.type === RiderType.VIP);
    this.vipDelivered = false;

    console.log(`[Level] 创建关卡 ${this.id}: ${this.totalRiders}骑手, ${this.obstacles.length}阻碍`);
  }

  // ========== 公共方法 ==========

  /**
   * 初始化关卡
   * @description 设置关卡初始状态
   */
  init(): void {
    this.state = LevelState.READY;
    this.deliveredCount = 0;
    this.timeRemaining = this.timeLimit;
    this.vipDelivered = false;

    // 重置所有骑手
    this.riders.forEach(rider => {
      rider.reset && rider.reset();
    });
  }

  /**
   * 开始关卡
   * @description 进入关卡进行中状态
   */
  start(): void {
    this.state = LevelState.PLAYING;
  }

  /**
   * 暂停关卡
   * @description 进入暂停状态
   */
  pause(): void {
    if (this.state === LevelState.PLAYING) {
      this.state = LevelState.PAUSED;
    }
  }

  /**
   * 继续关卡
   * @description 从暂停恢复
   */
  resume(): void {
    if (this.state === LevelState.PAUSED) {
      this.state = LevelState.PLAYING;
    }
  }

  /**
   * 更新关卡
   * @description 每帧更新关卡状态
   * @param dt 时间增量（秒）
   */
  update(dt: number): void {
    if (this.state !== LevelState.PLAYING) {
      return;
    }

    // 更新时间限制
    if (this.timeLimit > 0) {
      this.timeRemaining -= dt;
      if (this.timeRemaining <= 0) {
        this.handleFailure();
        return;
      }
    }

    // 更新阻碍（红绿灯）
    this.obstacles.forEach(obstacle => {
      obstacle.update && obstacle.update(dt);
    });

    // 更新骑手
    this.riders.forEach(rider => {
      if (!rider.hasDelivered) {
        rider.update && rider.update(dt);
      }
    });

    // 检查胜利/失败
    if (this.checkVictory()) {
      this.handleVictory();
    } else if (this.checkFailure()) {
      this.handleFailure();
    }
  }

  /**
   * 选择骑手
   * @description 玩家点击选择一个骑手开始移动
   * @param riderId 韦手ID
   */
  selectRider(riderId: string): void {
    const rider = this.riders.find(r => r.id === riderId);
    if (rider && rider.state === 'IDLE') {
      rider.startMove && rider.startMove();
    }
  }

  /**
   * 检查胜利条件
   * @description 判断是否通关
   * @returns 是否胜利
   */
  checkVictory(): boolean {
    // VIP必须第一个送达
    if (this.hasVIPRider && !this.vipDelivered) {
      // 检查是否有非VIP骑手已送达
      const nonVIPDelivered = this.riders.some(
        r => r.type !== 'VIP' && r.hasDelivered
      );
      if (nonVIPDelivered) {
        return false; // 非VIP先送达，不满足胜利条件
      }
    }

    // 所有骑手都已送达
    return this.deliveredCount === this.totalRiders;
  }

  /**
   * 检查失败条件
   * @description 判断是否失败
   * @returns 是否失败
   */
  checkFailure(): boolean {
    // 时间耗尽
    if (this.timeLimit > 0 && this.timeRemaining <= 0) {
      return true;
    }

    // 加急单超时
    const urgentFailed = this.riders.some(
      r => r.type === 'URGENT' && r.timeRemaining <= 0 && !r.hasDelivered
    );
    if (urgentFailed) {
      return true;
    }

    return false;
  }

  /**
   * 处理胜利
   * @description 关卡通关处理
   */
  handleVictory(): void {
    this.state = LevelState.SUCCESS;
    // 触发胜利事件
  }

  /**
   * 处理失败
   * @description 关卡失败处理
   */
  handleFailure(): void {
    this.state = LevelState.FAILED;
    // 触发失败事件
  }

  /**
   * 重置关卡
   * @description 重置关卡到初始状态
   */
  reset(): void {
    this.init();
  }

  /**
   * 韦手送达回调
   * @description 当骑手成功送达时调用
   * @param rider 已送达的骑手
   */
  onRiderDelivered(rider: any): void {
    this.deliveredCount++;

    // VIP送达标记
    if (rider.type === 'VIP') {
      this.vipDelivered = true;
    }
  }

  /** 关卡开始时间 */
  startTime: number = 0;

  /** 关卡耗时（秒） */
  completionTime: number = 0;

  /**
   * 获取关卡耗时
   * @description 获取关卡从开始到现在的耗时
   * @returns 耗时（秒）
   */
  getElapsedTime(): number {
    if (this.startTime === 0) {
      return 0;
    }
    return (Date.now() - this.startTime) / 1000;
  }

  /**
   * 开始关卡（增强版）
   * @description 进入关卡进行中状态，记录开始时间
   */
  startWithTimer(): void {
    this.state = LevelState.PLAYING;
    this.startTime = Date.now();
  }

  /**
   * 复活关卡
   * @description 广告复活后重置时间和失败骑手，保留已送达的
   */
  revive(): void {
    // 重置时间限制
    if (this.timeLimit > 0) {
      this.timeRemaining = this.timeLimit;
    }

    // 重置失败/等待的骑手
    this.riders.forEach(rider => {
      if (!rider.hasDelivered) {
        rider.reset && rider.reset();
      }
    });

    // 重置状态
    this.state = LevelState.PLAYING;
    this.startTime = Date.now();
  }

  /**
   * 处理胜利（增强版）
   * @description 关卡通关处理，记录耗时
   */
  handleVictoryWithTime(): void {
    this.state = LevelState.SUCCESS;
    this.completionTime = this.getElapsedTime();
    // 触发胜利事件
  }

  /**
   * 获取星级评分
   * @description 根据通关时间计算星级
   * @returns 星级数量（1-3）
   */
  getStars(): number {
    if (this.completionTime < 30) {
      return 3;
    } else if (this.completionTime < 60) {
      return 2;
    } else {
      return 1;
    }
  }
}