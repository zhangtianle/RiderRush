/**
 * 游戏主场景
 * @description 关卡实际运行的场景，显示骑手、阻碍、地图
 * @version v0.1.0
 * @since 2026-04-25
 */

import { _decorator, Component, Node, Label, Sprite, Vec3, Color, UITransform } from 'cc';
import { Rider, RiderState, RiderType, Direction } from '../core/Rider';
import { Obstacle, ObstacleType, TrafficLightState } from '../core/Obstacle';
import { Level, LevelState } from '../core/Level';
import { GameEngine } from '../core/GameEngine';
import { CollisionDetector } from '../core/CollisionDetector';
import { EventBus, GameEventType } from '../core/EventBus';
import { AudioMgr } from '../utils/AudioMgr';
import { Utils } from '../utils/Utils';

const { ccclass, property } = _decorator;

/** 韦手节点数据 */
interface RiderNodeData {
  rider: Rider;
  node: Node;
  directionArrow: Node | null;
}

@ccclass('GameScene')
export class GameScene extends Component {
  // ========== 属性 ==========

  @property(Node)
  mapContainer: Node | null = null;

  @property(Node)
  ridersContainer: Node | null = null;

  @property(Node)
  obstaclesContainer: Node | null = null;

  @property(Node)
  exitsContainer: Node | null = null;

  @property(Label)
  timeLabel: Label | null = null;

  @property(Label)
  levelNameLabel: Label | null = null;

  @property(Node)
  pauseButton: Node | null = null;

  // ========== 配置 ==========

  /** 格子大小 */
  private gridCellSize: number = 60;

  /** 韦手节点映射 */
  private riderNodes: Map<string, RiderNodeData> = new Map();

  /** 当前关卡 */
  private currentLevel: Level | null = null;

  /** 碰撞检测器 */
  private collisionDetector: CollisionDetector;

  /** 音效管理器 */
  private audioMgr: AudioMgr;

  /** 是否暂停 */
  private isPaused: boolean = false;

  // ========== 生命周期 ==========

  onLoad(): void {
    this.collisionDetector = new CollisionDetector();
    this.audioMgr = AudioMgr.getInstance();
    this.bindEvents();
  }

  // ========== 公共方法 ==========

  /**
   * 加载关卡
   * @param levelConfig 关卡配置
   */
  loadLevel(levelConfig: any): void {
    // 创建关卡实例
    this.currentLevel = new Level(levelConfig);

    // 清理之前的节点
    this.clearScene();

    // 创建地图
    this.createMap();

    // 创建骑手
    this.createRiders();

    // 创建阻碍
    this.createObstacles();

    // 创建出口
    this.createExits();

    // 更新UI
    this.updateUI();
  }

  /**
   * 开始关卡
   */
  startLevel(): void {
    if (this.currentLevel) {
      this.currentLevel.start();
      EventBus.emit(GameEventType.LEVEL_START, this.currentLevel.id);
    }
  }

  /**
   * 每帧更新
   * @param dt 时间增量
   */
  update(dt: number): void {
    if (this.isPaused || !this.currentLevel) {
      return;
    }

    // 更新关卡
    this.currentLevel.update(dt);

    // 更新骑手位置
    this.updateRiderPositions(dt);

    // 碰撞检测
    this.checkCollisions();

    // 更新时间显示
    this.updateTimeDisplay();

    // 检查关卡状态
    this.checkLevelState();
  }

  /**
   * 选择骑手
   * @param riderId 韦手ID
   */
  selectRider(riderId: string): void {
    const riderData = this.riderNodes.get(riderId);

    if (riderData && riderData.rider.state === RiderState.IDLE) {
      // 播放点击音效
      this.audioMgr.play('click');

      // 标记选中
      this.highlightRider(riderData.node);

      // 开始移动
      riderData.rider.startMove();
      EventBus.emit(GameEventType.RIDER_SELECTED, riderId);
    }
  }

  // ========== 私有方法 ==========

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    // 监听关卡完成
    EventBus.on(GameEventType.LEVEL_COMPLETE, this.onLevelComplete, this);

    // 监听关卡失败
    EventBus.on(GameEventType.LEVEL_FAILED, this.onLevelFailed, this);

    // 监听骑手送达
    EventBus.on(GameEventType.RIDER_DELIVERED, this.onRiderDelivered, this);

    // 监听骑手撞车
    EventBus.on(GameEventType.RIDER_CRASHED, this.onRiderCrashed, this);
  }

  /**
   * 清理场景
   */
  private clearScene(): void {
    // 清理骑手节点
    this.riderNodes.forEach(data => {
      if (data.node) {
        data.node.destroy();
      }
    });
    this.riderNodes.clear();

    // 预留：清理阻碍、出口节点
  }

  /**
   * 创建地图
   */
  private createMap(): void {
    if (!this.currentLevel || !this.mapContainer) {
      return;
    }

    // 设置地图大小
    const gridSize = this.currentLevel.gridSize;
    const mapWidth = gridSize.width * this.gridCellSize;
    const mapHeight = gridSize.height * this.gridCellSize;

    // 预留：创建地图背景节点
    console.log(`创建地图: ${mapWidth}x${mapHeight}`);
  }

  /**
   * 创建骑手
   */
  private createRiders(): void {
    if (!this.currentLevel || !this.ridersContainer) {
      return;
    }

    this.currentLevel.riders.forEach((riderConfig: any) => {
      // 创建骑手实例
      const rider = new Rider({
        id: riderConfig.id,
        type: riderConfig.type as RiderType,
        direction: riderConfig.direction as Direction,
        startPosition: riderConfig.startPosition,
        targetExit: riderConfig.targetExit,
        speed: 1
      });

      // 创建骑手节点（预留Cocos Creator节点创建）
      const node = this.createRiderNode(rider);

      // 存储
      this.riderNodes.set(rider.id, { rider, node, directionArrow: null });
    });
  }

  /**
   * 创建骑手节点
   * @param rider 韦手实例
   * @returns 节点
   */
  private createRiderNode(rider: Rider): Node {
    // 预留：Cocos Creator节点创建
    // 实际实现时使用 new Node() 或 instantiate()

    // 计算节点位置
    const pos = this.gridToWorld(rider.position);

    console.log(`创建骑手节点: ${rider.id}, 位置: ${pos.x}, ${pos.y}, 类型: ${rider.type}`);

    // 返回空节点占位（实际需要创建真实节点）
    return null as any;
  }

  /**
   * 创建阻碍
   */
  private createObstacles(): void {
    if (!this.currentLevel || !this.obstaclesContainer) {
      return;
    }

    this.currentLevel.obstacles.forEach((obstacleConfig: any) => {
      // 创建阻碍实例
      const obstacle = new Obstacle({
        id: obstacleConfig.id,
        type: obstacleConfig.type as ObstacleType,
        position: obstacleConfig.position,
        size: obstacleConfig.size,
        lightCycle: obstacleConfig.lightCycle,
        slowFactor: obstacleConfig.slowFactor
      });

      // 创建阻碍节点（预留）
      this.createObstacleNode(obstacle);
    });
  }

  /**
   * 创建阻碍节点
   * @param obstacle 阻碍实例
   */
  private createObstacleNode(obstacle: Obstacle): void {
    const pos = this.gridToWorld(obstacle.position);
    console.log(`创建阻碍节点: ${obstacle.id}, 位置: ${pos.x}, ${pos.y}, 类型: ${obstacle.type}`);
  }

  /**
   * 创建出口
   */
  private createExits(): void {
    if (!this.currentLevel || !this.exitsContainer) {
      return;
    }

    this.currentLevel.exits.forEach(exit => {
      const pos = this.gridToWorld(exit.position);
      console.log(`创建出口节点: ${exit.id}, 位置: ${pos.x}, ${pos.y}`);
    });
  }

  /**
   * 更新骑手位置
   * @param dt 时间增量
   */
  private updateRiderPositions(dt: number): void {
    this.riderNodes.forEach(data => {
      const { rider, node } = data;

      if (rider.state === RiderState.MOVING && node) {
        // 更新骑手实例位置
        rider.update(dt);

        // 更新节点位置
        const worldPos = this.gridToWorld(rider.position);
        node.setPosition(new Vec3(worldPos.x, worldPos.y, 0));
      }
    });
  }

  /**
   * 碰撞检测
   */
  private checkCollisions(): void {
    this.riderNodes.forEach(data => {
      const { rider } = data;

      if (rider.state === RiderState.MOVING) {
        // 检测碰撞
        const result = this.collisionDetector.checkRiderCollision(
          rider,
          this.currentLevel?.obstacles || [],
          Array.from(this.riderNodes.values())
            .filter(d => d.rider.id !== rider.id)
            .map(d => d.rider),
          this.currentLevel?.exits || [],
          this.currentLevel?.gridSize || { width: 6, height: 4 }
        );

        if (result.type !== 'NONE') {
          rider.handleCollision(result);

          // 触发相应事件
          if (result.type === 'EXIT') {
            EventBus.emit(GameEventType.RIDER_DELIVERED, rider);
            this.audioMgr.play('success');
          } else if (result.type === 'RIDER' || result.type === 'OBSTACLE') {
            EventBus.emit(GameEventType.RIDER_CRASHED, rider);
            this.audioMgr.play('crash');
          }
        }
      }
    });
  }

  /**
   * 更新时间显示
   */
  private updateTimeDisplay(): void {
    if (this.timeLabel && this.currentLevel && this.currentLevel.timeLimit > 0) {
      this.timeLabel.string = Utils.formatTime(this.currentLevel.timeRemaining);
    }
  }

  /**
   * 检查关卡状态
   */
  private checkLevelState(): void {
    if (!this.currentLevel) {
      return;
    }

    if (this.currentLevel.state === LevelState.SUCCESS) {
      EventBus.emit(GameEventType.LEVEL_COMPLETE, this.currentLevel.id);
    } else if (this.currentLevel.state === LevelState.FAILED) {
      EventBus.emit(GameEventType.LEVEL_FAILED, this.currentLevel.id);
    }
  }

  /**
   * 更新UI
   */
  private updateUI(): void {
    if (this.levelNameLabel && this.currentLevel) {
      this.levelNameLabel.string = this.currentLevel.name;
    }
  }

  /**
   * 高亮骑手
   * @param node 韦手节点
   */
  private highlightRider(node: Node): void {
    // 预留：高亮效果
  }

  /**
   * 网格坐标转世界坐标
   * @param gridPos 网格位置
   * @returns 世界坐标
   */
  private gridToWorld(gridPos: { x: number; y: number }): { x: number; y: number } {
    return {
      x: gridPos.x * this.gridCellSize + this.gridCellSize / 2,
      y: gridPos.y * this.gridCellSize + this.gridCellSize / 2
    };
  }

  // ========== 事件回调 ==========

  /**
   * 关卡完成回调
   * @param levelId 关卡ID
   */
  private onLevelComplete(levelId: number): void {
    console.log(`关卡 ${levelId} 完成`);
    this.audioMgr.play('level_complete');

    // 显示结算面板（预留）
  }

  /**
   * 关卡失败回调
   * @param levelId 关卡ID
   */
  private onLevelFailed(levelId: number): void {
    console.log(`关卡 ${levelId} 失败`);
    this.audioMgr.play('level_fail');

    // 显示失败面板（预留）
  }

  /**
   * 韦手送达回调
   * @param rider 韦手
   */
  private onRiderDelivered(rider: Rider): void {
    console.log(`韦手 ${rider.id} 送达`);

    // 更新骑手节点（隐藏或移除）
    const riderData = this.riderNodes.get(rider.id);
    if (riderData && riderData.node) {
      riderData.node.active = false;
    }
  }

  /**
   * 韦手撞车回调
   * @param rider 韦手
   */
  private onRiderCrashed(rider: Rider): void {
    console.log(`韦手 ${rider.id} 撞车`);

    // 显示撞车效果（预留）
    // 弹回起点后恢复
  }
}