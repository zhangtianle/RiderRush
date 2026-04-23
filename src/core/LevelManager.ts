/**
 * 关卡管理器
 * @description 加载和管理关卡数据
 * @version v0.1.0
 * @since 2026-04-25
 */

import { Level, LevelConfig } from '../core/Level';
import { Rider, RiderConfig, RiderType, Direction } from '../core/Rider';
import { Obstacle, ObstacleConfig, ObstacleType } from '../core/Obstacle';

/** 关卡数据接口（JSON格式） */
interface LevelDataJSON {
  id: number;
  name: string;
  difficulty: string;
  gridSize: { width: number; height: number };
  timeLimit: number;
  riders: RiderDataJSON[];
  obstacles: ObstacleDataJSON[];
  exits: ExitDataJSON[];
  mapTheme: string;
  hint?: string;
}

/** 韦手数据接口（JSON格式） */
interface RiderDataJSON {
  id: string;
  type: string;
  direction: string;
  startPosition: { x: number; y: number };
  targetExit: string;
  speed?: number;
  timeLimit?: number;
}

/** 阻碍数据接口（JSON格式） */
interface ObstacleDataJSON {
  id: string;
  type: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  lightCycle?: number;
  slowFactor?: number;
}

/** 出口数据接口（JSON格式） */
interface ExitDataJSON {
  id: string;
  position: { x: number; y: number };
}

/**
 * 关卡管理器
 */
export class LevelManager {
  // ========== 属性 ==========

  /** 关卡数据缓存 */
  private levelDataMap: Map<number, LevelDataJSON> = new Map();

  /** 最大关卡数 */
  private maxLevelId: number = 0;

  /** 单例 */
  private static instance: LevelManager;

  // ========== 构造函数 ==========

  constructor() {
    if (LevelManager.instance) {
      return LevelManager.instance;
    }
    LevelManager.instance = this;
  }

  // ========== 公共方法 ==========

  /**
   * 获取单例
   */
  static getInstance(): LevelManager {
    if (!LevelManager.instance) {
      LevelManager.instance = new LevelManager();
    }
    return LevelManager.instance;
  }

  /**
   * 加载关卡数据
   * @param data 关卡数据JSON
   */
  loadData(data: { levels: LevelDataJSON[] }): void {
    data.levels.forEach(level => {
      this.levelDataMap.set(level.id, level);
      if (level.id > this.maxLevelId) {
        this.maxLevelId = level.id;
      }
    });

    console.log(`加载关卡数据完成，共 ${this.levelDataMap.size} 个关卡`);
  }

  /**
   * 获取关卡配置
   * @param levelId 关卡ID
   * @returns 关卡配置
   */
  getLevelConfig(levelId: number): LevelConfig | null {
    const data = this.levelDataMap.get(levelId);
    if (!data) {
      console.warn(`关卡 ${levelId} 不存在`);
      return null;
    }

    return this.parseLevelData(data);
  }

  /**
   * 创建关卡实例
   * @param levelId 关卡ID
   * @returns 关卡实例
   */
  createLevel(levelId: number): Level | null {
    const config = this.getLevelConfig(levelId);
    if (!config) {
      return null;
    }

    return new Level(config);
  }

  /**
   * 获取所有关卡ID列表
   * @returns 关卡ID列表
   */
  getAllLevelIds(): number[] {
    return Array.from(this.levelDataMap.keys());
  }

  /**
   * 获取最大关卡ID
   * @returns 最大关卡ID
   */
  getMaxLevelId(): number {
    return this.maxLevelId;
  }

  /**
   * 检查关卡是否存在
   * @param levelId 关卡ID
   * @returns 是否存在
   */
  hasLevel(levelId: number): boolean {
    return this.levelDataMap.has(levelId);
  }

  /**
   * 获取关卡基本信息
   * @param levelId 关卡ID
   * @returns 关卡基本信息
   */
  getLevelInfo(levelId: number): { name: string; difficulty: string; hint?: string } | null {
    const data = this.levelDataMap.get(levelId);
    if (!data) {
      return null;
    }

    return {
      name: data.name,
      difficulty: data.difficulty,
      hint: data.hint
    };
  }

  // ========== 私有方法 ==========

  /**
   * 解析关卡数据
   * @param data JSON数据
   * @returns 关卡配置
   */
  private parseLevelData(data: LevelDataJSON): LevelConfig {
    return {
      id: data.id,
      name: data.name,
      gridSize: data.gridSize,
      timeLimit: data.timeLimit,
      riders: data.riders.map(r => this.parseRiderData(r)),
      obstacles: data.obstacles.map(o => this.parseObstacleData(o)),
      exits: data.exits.map(e => ({
        id: e.id,
        position: e.position
      })),
      mapTheme: data.mapTheme
    };
  }

  /**
   * 解析骑手数据
   * @param data JSON数据
   * @returns 韦手配置
   */
  private parseRiderData(data: RiderDataJSON): RiderConfig {
    return {
      id: data.id,
      type: this.parseRiderType(data.type),
      direction: this.parseDirection(data.direction),
      startPosition: data.startPosition,
      targetExit: data.targetExit,
      speed: data.speed || 1,
      timeLimit: data.timeLimit || 0
    };
  }

  /**
   * 解析阻碍数据
   * @param data JSON数据
   * @returns 阻碍配置
   */
  private parseObstacleData(data: ObstacleDataJSON): ObstacleConfig {
    return {
      id: data.id,
      type: this.parseObstacleType(data.type),
      position: data.position,
      size: data.size || { width: 1, height: 1 },
      lightCycle: data.lightCycle || 3,
      slowFactor: data.slowFactor || 0.5
    };
  }

  /**
   * 解析骑手类型
   * @param type 类型字符串
   * @returns 韦手类型枚举
   */
  private parseRiderType(type: string): RiderType {
    switch (type) {
      case 'VIP':
        return RiderType.VIP;
      case 'URGENT':
        return RiderType.URGENT;
      default:
        return RiderType.NORMAL;
    }
  }

  /**
   * 解析方向
   * @param direction 方向字符串
   * @returns 方向枚举
   */
  private parseDirection(direction: string): Direction {
    switch (direction) {
      case 'UP':
        return Direction.UP;
      case 'DOWN':
        return Direction.DOWN;
      case 'LEFT':
        return Direction.LEFT;
      case 'RIGHT':
        return Direction.RIGHT;
      default:
        return Direction.RIGHT;
    }
  }

  /**
   * 解析阻碍类型
   * @param type 类型字符串
   * @returns 阻碍类型枚举
   */
  private parseObstacleType(type: string): ObstacleType {
    switch (type) {
      case 'WALL':
        return ObstacleType.WALL;
      case 'TRAFFIC':
        return ObstacleType.TRAFFIC;
      case 'TRAFFIC_LIGHT':
        return ObstacleType.TRAFFIC_LIGHT;
      case 'GATE':
        return ObstacleType.GATE;
      default:
        return ObstacleType.WALL;
    }
  }
}