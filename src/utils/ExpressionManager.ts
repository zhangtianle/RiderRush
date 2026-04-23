/**
 * 表情管理器
 * @description 管理骑手的表情切换和动画
 * @version v0.1.0
 * @since 2026-04-25
 */

import { RiderType } from '../core/Rider';
import { EventBus, GameEventType } from '../core/EventBus';

/** 表情类型 */
export enum ExpressionType {
  NORMAL = 'normal',
  HAPPY = 'happy',
  SAD = 'sad',
  WAITING = 'waiting',
  MOVING = 'moving',
  URGENT = 'urgent',
  VIP = 'vip'
}

/** 表情配置 */
interface ExpressionConfig {
  type: RiderType;
  expression: ExpressionType;
  spriteName: string;
  duration: number;
}

/**
 * 表情管理器
 */
export class ExpressionManager {
  // ========== 属性 ==========

  /** 表情映射 */
  private expressionMap: Map<string, ExpressionConfig[]> = new Map();

  /** 单例 */
  private static instance: ExpressionManager;

  // ========== 构造函数 ==========

  constructor() {
    if (ExpressionManager.instance) {
      return ExpressionManager.instance;
    }
    ExpressionManager.instance = this;
    this.initExpressions();
  }

  // ========== 公共方法 ==========

  /**
   * 获取单例
   */
  static getInstance(): ExpressionManager {
    if (!ExpressionManager.instance) {
      ExpressionManager.instance = new ExpressionManager();
    }
    return ExpressionManager.instance;
  }

  /**
   * 获取表情精灵名称
   * @param riderType 韦手类型
   * @param expression 表情类型
   * @returns 精灵名称
   */
  getSpriteName(riderType: RiderType, expression: ExpressionType): string {
    const typePrefix = this.getTypePrefix(riderType);
    return `${typePrefix}_${expression}`;
  }

  /**
   * 切换表情
   * @param riderId 韦手ID
   * @param riderType 韦手类型
   * @param newExpression 新表情
   */
  changeExpression(riderId: string, riderType: RiderType, newExpression: ExpressionType): void {
    const spriteName = this.getSpriteName(riderType, newExpression);
    EventBus.emit('expression-change', { riderId, spriteName });
  }

  // ========== 私有方法 ==========

  /**
   * 初始化表情映射
   */
  private initExpressions(): void {
    // 普通骑手表情
    this.expressionMap.set('NORMAL', [
      { type: RiderType.NORMAL, expression: ExpressionType.NORMAL, spriteName: 'rider_normal', duration: 0 },
      { type: RiderType.NORMAL, expression: ExpressionType.HAPPY, spriteName: 'rider_happy', duration: 2000 },
      { type: RiderType.NORMAL, expression: ExpressionType.SAD, spriteName: 'rider_sad', duration: 1500 },
      { type: RiderType.NORMAL, expression: ExpressionType.WAITING, spriteName: 'rider_waiting', duration: 0 },
      { type: RiderType.NORMAL, expression: ExpressionType.MOVING, spriteName: 'rider_moving', duration: 0 }
    ]);

    // VIP骑手表情
    this.expressionMap.set('VIP', [
      { type: RiderType.VIP, expression: ExpressionType.NORMAL, spriteName: 'vip_normal', duration: 0 },
      { type: RiderType.VIP, expression: ExpressionType.HAPPY, spriteName: 'vip_happy', duration: 2000 },
      { type: RiderType.VIP, expression: ExpressionType.SAD, spriteName: 'vip_sad', duration: 1500 },
      { type: RiderType.VIP, expression: ExpressionType.VIP, spriteName: 'vip_urgent', duration: 0 }
    ]);

    // 加急骑手表情
    this.expressionMap.set('URGENT', [
      { type: RiderType.URGENT, expression: ExpressionType.NORMAL, spriteName: 'urgent_normal', duration: 0 },
      { type: RiderType.URGENT, expression: ExpressionType.HAPPY, spriteName: 'urgent_happy', duration: 2000 },
      { type: RiderType.URGENT, expression: ExpressionType.SAD, spriteName: 'urgent_sad', duration: 1500 },
      { type: RiderType.URGENT, expression: ExpressionType.URGENT, spriteName: 'urgent_time', duration: 0 }
    ]);
  }

  /**
   * 获取类型前缀
   * @param riderType 韦手类型
   * @returns 前缀字符串
   */
  private getTypePrefix(riderType: RiderType): string {
    switch (riderType) {
      case RiderType.NORMAL:
        return 'rider';
      case RiderType.VIP:
        return 'vip';
      case RiderType.URGENT:
        return 'urgent';
      default:
        return 'rider';
    }
  }
}