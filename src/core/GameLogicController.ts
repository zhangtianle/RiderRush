/**
 * 游戏核心逻辑整合
 * @description 将骑手、阻碍、关卡、碰撞检测整合在一起
 * @version v0.4.0
 * @since 2026-04-25
 */

import { Rider, RiderState, RiderType, Direction, Position } from './Rider';
import { Obstacle, ObstacleType, TrafficLightState } from './Obstacle';
import { Level, LevelState } from './Level';
import { CollisionDetector, CollisionType } from './CollisionDetector';
import { EventBus, GameEventType } from './EventBus';
import { PathDrawer } from './PathDrawer';
import { PathValidator } from './PathValidator';
import { AudioMgr } from '../utils/AudioMgr';
import { QuoteManager, QuoteType } from '../utils/QuoteManager';

/**
 * 游戏逻辑控制器
 * @description 处理路径规划、骑手移动、碰撞检测、状态更新
 */
export class GameLogicController {
  // ========== 属性 ==========

  private level: Level | null = null;
  private riders: Rider[] = [];
  private obstacles: Obstacle[] = [];
  private collisionDetector: CollisionDetector;
  private pathDrawer: PathDrawer;
  private pathValidator: PathValidator;
  private audioMgr: AudioMgr;
  private quoteMgr: QuoteManager;

  /** 游戏是否暂停 */
  private isPaused: boolean = false;

  /** 已送达骑手列表 */
  private deliveredRiders: Set<string> = new Set();

  /** 正在移动的骑手 */
  private movingRiders: Set<string> = new Set();

  /** 碰撞冷却时间（防止重复检测） */
  private collisionCooldown: Map<string, number> = new Map();

  /** 碰撞冷却时间（毫秒） */
  private COLLISION_COOLDOWN_MS: number = 500;

  /** 连击计数 */
  private comboCount: number = 0;

  /** 上次送达时间 */
  private lastDeliveryTime: number = 0;

  /** 连击窗口（毫秒） */
  private COMBO_WINDOW_MS: number = 2000;

  /** 骑手是否已出发（进入MOVING阶段后不可再画路径） */
  private ridersLaunched: boolean = false;

  // ========== 构造函数 ==========

  constructor() {
    this.collisionDetector = new CollisionDetector();
    this.pathDrawer = new PathDrawer();
    this.pathValidator = new PathValidator();
    this.audioMgr = AudioMgr.getInstance();
    this.quoteMgr = QuoteManager.getInstance();
  }

  // ========== 公共方法 ==========

  /**
   * 设置关卡
   * @param level 关卡实例
   */
  setLevel(level: Level): void {
    this.level = level;
    this.riders = level.riders as Rider[];
    this.obstacles = level.obstacles as Obstacle[];
    this.deliveredRiders.clear();
    this.movingRiders.clear();
    this.collisionCooldown.clear();
    this.comboCount = 0;
    this.lastDeliveryTime = 0;
    this.ridersLaunched = false;

    // 设置路径绘制器的关卡数据
    const exits = (level.exits || []).map((e: any) => e.position || e);
    this.pathDrawer.setLevelData(this.obstacles, exits, level.gridSize);
  }

  /**
   * 为骑手分配路径
   * @param riderId 韦手ID
   * @param path 路径点数组
   * @returns 是否成功分配
   */
  assignPath(riderId: string, path: Position[]): boolean {
    if (this.ridersLaunched) {
      console.warn('骑手已出发，不能再分配路径');
      return false;
    }

    const rider = this.riders.find(r => r.id === riderId);
    if (!rider) {
      console.warn(`韦手 ${riderId} 不存在`);
      return false;
    }

    if (rider.state !== RiderState.IDLE || rider.hasDelivered) {
      console.warn(`韦手 ${riderId} 不可分配路径`);
      return false;
    }

    // 验证路径
    const exits = (this.level?.exits || []).map((e: any) => e.position || e);
    const result = this.pathValidator.validatePath(
      path,
      rider.position,
      this.obstacles,
      exits,
      this.level?.gridSize || { width: 10, height: 8 }
    );

    if (!result.valid) {
      console.warn(`路径无效: ${result.reason}`);
      return false;
    }

    // VIP检查：如果有未规划路径的VIP，普通骑手不能先画路径
    if (rider.type !== RiderType.VIP) {
      const hasUnassignedVIP = this.riders.some(
        r => r.type === RiderType.VIP && !r.hasDelivered && !r.hasPath && r.id !== riderId
      );
      if (hasUnassignedVIP) {
        console.warn('VIP订单必须先规划路径');
        EventBus.emit('vip-warning');
        return false;
      }
    }

    // 设置路径
    rider.setPath(path);
    this.audioMgr.play('launch');
    this.quoteMgr.showQuote(riderId, QuoteType.LAUNCH);

    EventBus.emit(GameEventType.RIDER_PATH_ASSIGNED, { riderId, path });
    console.log(`韦手 ${riderId} 路径已规划`);
    return true;
  }

  /**
   * 发起所有已规划路径的骑手
   * @returns 是否成功发起
   */
  launchAllRiders(): boolean {
    if (this.ridersLaunched) {
      console.warn('骑手已出发');
      return false;
    }

    const ridersWithPath = this.riders.filter(r => r.hasPath && !r.hasDelivered);
    if (ridersWithPath.length === 0) {
      console.warn('没有已规划路径的骑手');
      return false;
    }

    // VIP优先：先发VIP
    const vipRiders = ridersWithPath.filter(r => r.type === RiderType.VIP);
    const otherRiders = ridersWithPath.filter(r => r.type !== RiderType.VIP);

    const launchSequence = [...vipRiders, ...otherRiders];

    let delay = 0;
    for (const rider of launchSequence) {
      rider.startMove();
      this.movingRiders.add(rider.id);
      EventBus.emit(GameEventType.RIDER_START_MOVE, rider);
      delay += 200;
    }

    this.ridersLaunched = true;
    EventBus.emit(GameEventType.ALL_RIDERS_LAUNCHED, { count: launchSequence.length });
    console.log(`发起 ${launchSequence.length} 个骑手`);
    return true;
  }

  /**
   * 清除所有骑手路径（重画）
   */
  clearAllPaths(): void {
    if (this.ridersLaunched) return;

    this.riders.forEach(rider => {
      if (rider.hasPath && !rider.hasDelivered) {
        rider.clearPath();
        EventBus.emit(GameEventType.RIDER_PATH_CLEARED, rider.id);
      }
    });
  }

  /**
   * 获取路径绘制器
   */
  getPathDrawer(): PathDrawer {
    return this.pathDrawer;
  }

  /**
   * 获取已规划路径的骑手数量
   */
  getPlannedCount(): number {
    return this.riders.filter(r => r.hasPath && !r.hasDelivered).length;
  }

  /**
   * 骑手是否已出发
   */
  isLaunched(): boolean {
    return this.ridersLaunched;
  }

  /**
   * 更新游戏状态
   * @param dt 时间增量（秒）
   */
  update(dt: number): void {
    if (!this.level || this.isPaused) {
      return;
    }

    // 更新关卡时间
    this.level.update(dt);

    // 更新阻碍（红绿灯）
    this.updateObstacles(dt);

    // 更新骑手位置
    this.updateRiderPositions(dt);

    // 碰撞检测
    this.checkCollisions(dt);

    // 更新冷却时间
    this.updateCooldowns(dt);

    // 检查胜利/失败
    this.checkGameEnd();
  }

  /**
   * 暂停游戏
   */
  pause(): void {
    this.isPaused = true;
  }

  /**
   * 继续游戏
   */
  resume(): void {
    this.isPaused = false;
  }

  /**
   * 重置游戏
   */
  reset(): void {
    if (this.level) {
      this.level.reset();
    }

    this.riders.forEach(rider => rider.reset());
    this.deliveredRiders.clear();
    this.movingRiders.clear();
    this.collisionCooldown.clear();
    this.comboCount = 0;
    this.lastDeliveryTime = 0;
    this.ridersLaunched = false;
    this.isPaused = false;
  }

  /**
   * 获取骑手列表
   * @returns 韦手列表
   */
  getRiders(): Rider[] {
    return this.riders;
  }

  /**
   * 获取阻碍列表
   * @returns 阻碍列表
   */
  getObstacles(): Obstacle[] {
    return this.obstacles;
  }

  /**
   * 获取当前关卡
   * @returns 关卡实例
   */
  getLevel(): Level | null {
    return this.level;
  }

  /**
   * 获取已送达数量
   * @returns 已送达数量
   */
  getDeliveredCount(): number {
    return this.deliveredRiders.size;
  }

  /**
   * 获取总骑手数量
   * @returns 总骑手数量
   */
  getTotalRiders(): number {
    return this.riders.length;
  }

  // ========== 私有方法 ==========

  /**
   * 更新阻碍状态
   * @param dt 时间增量
   */
  private updateObstacles(dt: number): void {
    this.obstacles.forEach(obstacle => {
      obstacle.update(dt);

      // 红绿灯状态变化时触发事件
      if (obstacle.type === ObstacleType.TRAFFIC_LIGHT) {
        // 预留：红绿灯切换音效
      }
    });
  }

  /**
   * 更新骑手位置
   * @param dt 时间增量
   */
  private updateRiderPositions(dt: number): void {
    this.riders.forEach(rider => {
      if (rider.state === RiderState.MOVING || rider.state === RiderState.WAITING) {
        rider.update(dt);
      }

      // 加急骑手超时检查
      if (rider.type === RiderType.URGENT && rider.timeRemaining <= 0 && !rider.hasDelivered) {
        this.handleUrgentTimeout(rider);
      }
    });
  }

  /**
   * 碰撞检测
   * @param dt 时间增量
   */
  private checkCollisions(dt: number): void {
    this.riders.forEach(rider => {
      if (rider.state !== RiderState.MOVING) {
        return;
      }

      // 检查碰撞冷却
      if (this.isOnCooldown(rider.id)) {
        return;
      }

      // 执行碰撞检测
      const result = this.detectCollision(rider);

      if (result.type !== CollisionType.NONE) {
        this.handleCollisionResult(rider, result);
      }
    });
  }

  /**
   * 执行碰撞检测
   * @param rider 韦手
   * @returns 碰撞结果
   */
  private detectCollision(rider: Rider): { type: CollisionType; target: any; position: { x: number; y: number } } {
    const gridSize = this.level?.gridSize || { width: 10, height: 8 };
    const exits = this.level?.exits || [];

    // 其他骑手（排除自己）
    const otherRiders = this.riders.filter(r => r.id !== rider.id);

    return this.collisionDetector.checkRiderCollision(
      rider,
      this.obstacles,
      otherRiders,
      exits,
      gridSize
    );
  }

  /**
   * 处理碰撞结果
   * @param rider 韦手
   * @param result 碰撞结果
   */
  private handleCollisionResult(rider: Rider, result: { type: CollisionType; target: any; position: { x: number; y: number } }): void {
    switch (result.type) {
      case CollisionType.EXIT:
        this.handleReachExit(rider, result.target);
        break;

      case CollisionType.OBSTACLE:
        this.handleObstacleCollision(rider, result.target);
        break;

      case CollisionType.RIDER:
        this.handleRiderCollision(rider, result.target);
        break;

      case CollisionType.BOUNDARY:
        this.handleBoundaryCollision(rider);
        break;
    }

    // 设置碰撞冷却
    this.setCooldown(rider.id);
  }

  /**
   * 处理到达出口
   * @param rider 韦手
   * @param exit 出口
   */
  private handleReachExit(rider: Rider, exit: any): void {
    // VIP检查：如果不是VIP且第一个送达
    if (rider.type !== RiderType.VIP && this.deliveredRiders.size === 0) {
      const hasUndeliveredVIP = this.riders.some(
        r => r.type === RiderType.VIP && !r.hasDelivered
      );
      if (hasUndeliveredVIP) {
        console.warn('VIP必须第一个送达！');
        rider.state = RiderState.CRASHED;
        rider.changeExpression('sad');
        this.quoteMgr.showQuote(rider.id, QuoteType.FAIL);
        setTimeout(() => rider.reset(), this.COLLISION_COOLDOWN_MS);
        return;
      }
    }

    // 成功送达
    rider.state = RiderState.SUCCESS;
    rider.hasDelivered = true;
    rider.changeExpression('happy');

    this.deliveredRiders.add(rider.id);
    this.movingRiders.delete(rider.id);

    // 连击检测
    const now = performance.now();
    if (now - this.lastDeliveryTime < this.COMBO_WINDOW_MS && this.lastDeliveryTime > 0) {
      this.comboCount++;
      if (this.comboCount >= 2) {
        EventBus.emit(GameEventType.COMBO_ACHIEVED, {
          count: this.comboCount,
          position: rider.position
        });
      }
    } else {
      this.comboCount = 1;
    }
    this.lastDeliveryTime = now;

    this.audioMgr.play('success');
    this.quoteMgr.showQuote(rider.id, QuoteType.SUCCESS);
    EventBus.emit(GameEventType.RIDER_DELIVERED, rider);

    console.log(`韦手 ${rider.id} 成功送达`);

    if (this.level) {
      this.level.deliveredCount++;
    }
  }

  /**
   * 处理阻碍碰撞
   * @param rider 韦手
   * @param obstacle 阻碍
   */
  private handleObstacleCollision(rider: Rider, obstacle: Obstacle): void {
    // 红绿灯特殊处理
    if (obstacle.type === ObstacleType.TRAFFIC_LIGHT) {
      if (obstacle.lightState === TrafficLightState.RED) {
        // 红灯：等待
        rider.state = RiderState.WAITING;
        rider.changeExpression('waiting');
        this.quoteMgr.showQuote(rider.id, QuoteType.WAITING);
        console.log(`韦手 ${rider.id} 等待红灯`);
      } else {
        // 绿灯：继续通过
        return;
      }
    } else if (obstacle.type === ObstacleType.TRAFFIC) {
      // 堵车区：减速，不弹回
      rider.speed *= obstacle.getSlowFactor();
      console.log(`韦手 ${rider.id} 进入堵车区减速`);
    } else {
      // 其他阻碍（墙）：弹回
      rider.state = RiderState.CRASHED;
      rider.changeExpression('sad');

      this.audioMgr.play('crash');
      this.quoteMgr.showQuote(rider.id, QuoteType.CRASH);

      console.log(`韦手 ${rider.id} 碰撞阻碍 ${obstacle.id}`);

      // 延迟弹回
      setTimeout(() => {
        rider.reset();
        this.movingRiders.delete(rider.id);
        this.checkAndResetLaunchState();
      }, this.COLLISION_COOLDOWN_MS);
    }
  }

  /**
   * 处理骑手碰撞
   * @param rider1 韦手1
   * @param rider2 韦手2
   */
  private handleRiderCollision(rider: Rider, otherRider: Rider): void {
    rider.state = RiderState.CRASHED;
    rider.changeExpression('sad');

    if (otherRider.state === RiderState.MOVING) {
      otherRider.state = RiderState.CRASHED;
      otherRider.changeExpression('sad');
    }

    this.audioMgr.play('crash');
    this.quoteMgr.showQuote(rider.id, QuoteType.CRASH);

    // 屏幕震动和红色闪屏
    EventBus.emit(GameEventType.SCREEN_SHAKE, { intensity: 4, duration: 300 });
    EventBus.emit(GameEventType.RED_FLASH, {});

    console.log(`韦手 ${rider.id} 和 ${otherRider.id} 撞车`);

    setTimeout(() => {
      rider.reset();
      otherRider.reset();
      this.movingRiders.delete(rider.id);
      this.movingRiders.delete(otherRider.id);
      this.checkAndResetLaunchState();
    }, this.COLLISION_COOLDOWN_MS);

    EventBus.emit(GameEventType.RIDER_CRASHED, { rider1: rider, rider2: otherRider });
  }

  /**
   * 处理边界碰撞
   * @param rider 韦手
   */
  private handleBoundaryCollision(rider: Rider): void {
    rider.state = RiderState.CRASHED;
    rider.changeExpression('sad');

    this.audioMgr.play('crash');
    this.quoteMgr.showQuote(rider.id, QuoteType.CRASH);

    EventBus.emit(GameEventType.SCREEN_SHAKE, { intensity: 3, duration: 200 });
    EventBus.emit(GameEventType.RED_FLASH, {});

    console.log(`韦手 ${rider.id} 超出边界`);

    setTimeout(() => {
      rider.reset();
      this.movingRiders.delete(rider.id);
      this.checkAndResetLaunchState();
    }, this.COLLISION_COOLDOWN_MS);
  }

  /**
   * 处理加急超时
   * @param rider 韦手
   */
  private handleUrgentTimeout(rider: Rider): void {
    rider.state = RiderState.CRASHED;
    rider.changeExpression('sad');

    this.quoteMgr.showQuote(rider.id, QuoteType.FAIL);

    console.log(`加急韦手 ${rider.id} 超时`);

    // 触发关卡失败
    if (this.level) {
      this.level.handleFailure('urgent');
    }

    EventBus.emit(GameEventType.LEVEL_FAILED, this.level?.id);
  }

  /**
   * 检查游戏结束
   */
  private checkGameEnd(): void {
    if (!this.level) {
      return;
    }

    // 检查胜利
    if (this.deliveredRiders.size === this.riders.length) {
      this.handleVictory();
    }

    // 检查失败（时间耗尽）
    if (this.level.timeLimit > 0 && this.level.timeRemaining <= 0) {
      this.handleFailure('timeout');
    }

    // 检查死锁：所有骑手都回到IDLE/WAITING且无人在移动，且未全部送达
    // 延迟确认：ridersLaunched设置后至少1秒才检测，避免launch瞬间误判
    if (this.ridersLaunched && this.movingRiders.size === 0) {
      const elapsed = this.level.getElapsedTime();
      if (elapsed < 1) return;

      const allStopped = this.riders.every(r =>
        r.state === RiderState.IDLE || r.state === RiderState.WAITING || r.state === RiderState.CRASHED
      );
      if (allStopped && this.deliveredRiders.size < this.riders.length) {
        // CRASHED的骑手可能还在setTimeout弹回中，等它们reset完
        const anyCrashed = this.riders.some(r => r.state === RiderState.CRASHED);
        if (!anyCrashed) {
          this.handleFailure('collision');
        }
      }
    }
  }

  /**
   * 处理胜利
   */
  private handleVictory(): void {
    if (!this.level) {
      return;
    }

    this.level.handleVictory();
    this.level.completionTime = this.level.getElapsedTime();

    // 播放通关音效
    this.audioMgr.play('level_complete');

    console.log(`关卡 ${this.level.id} 通关，耗时 ${this.level.completionTime} 秒`);

    EventBus.emit(GameEventType.LEVEL_COMPLETE, {
      levelId: this.level.id,
      time: this.level.completionTime,
      stars: this.level.getStars()
    });
  }

  /**
   * 处理失败
   * @param reason 失败原因
   */
  private handleFailure(reason: string): void {
    if (!this.level) {
      return;
    }

    this.level.handleFailure(reason);

    // 播放失败音效
    this.audioMgr.play('level_fail');

    console.log(`关卡 ${this.level.id} 失败: ${reason}`);

    EventBus.emit(GameEventType.LEVEL_FAILED, {
      levelId: this.level.id,
      reason: reason
    });
  }

  // ========== 冷却时间管理 ==========

  /**
   * 检查是否需要重置出发状态
   * @description 所有骑手都不在移动时，允许重新画路径
   */
  private checkAndResetLaunchState(): void {
    if (this.movingRiders.size > 0) return;

    const anyMoving = this.riders.some(r => r.state === RiderState.MOVING);
    if (!anyMoving) {
      this.ridersLaunched = false;
      console.log('[GameLogicController] 所有骑手已停止，允许重新规划路径');
    }
  }

  /**
   * 设置碰撞冷却
   * @param riderId 韦手ID
   */
  private setCooldown(riderId: string): void {
    this.collisionCooldown.set(riderId, this.COLLISION_COOLDOWN_MS);
  }

  /**
   * 检查是否在冷却中
   * @param riderId 韦手ID
   * @returns 是否在冷却中
   */
  private isOnCooldown(riderId: string): boolean {
    const cooldown = this.collisionCooldown.get(riderId);
    return cooldown !== undefined && cooldown > 0;
  }

  /**
   * 更新冷却时间
   * @param dt 时间增量（秒）
   */
  private updateCooldowns(dt: number): void {
    this.collisionCooldown.forEach((cooldown, riderId) => {
      const newCooldown = cooldown - dt * 1000;
      if (newCooldown <= 0) {
        this.collisionCooldown.delete(riderId);
      } else {
        this.collisionCooldown.set(riderId, newCooldown);
      }
    });
  }
}