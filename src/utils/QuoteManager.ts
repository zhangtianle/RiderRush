/**
 * 台词管理器
 * @description 管理骑手的台词显示和随机选择
 * @version v0.1.0
 * @since 2026-04-25
 */

import { RiderType, RiderState } from '../core/Rider';
import { EventBus } from '../core/EventBus';
import { Utils } from './Utils';

/** 台词类型 */
export enum QuoteType {
  LAUNCH = 'launch',
  SUCCESS = 'success',
  CRASH = 'crash',
  WAITING = 'waiting',
  VIP = 'vip',
  URGENT = 'urgent',
  FAIL = 'fail'
}

/** 台词显示配置 */
interface QuoteDisplayConfig {
  riderId: string;
  text: string;
  duration: number;
  position: { x: number; y: number };
}

/**
 * 台词管理器
 */
export class QuoteManager {
  // ========== 属性 ==========

  /** 台词数据 */
  private quotes: Map<QuoteType, string[]> = new Map();

  /** 当前显示的台词 */
  private activeQuotes: Map<string, QuoteDisplayConfig> = new Map();

  /** 默认显示时长（毫秒） */
  private defaultDuration: number = 2000;

  /** 单例 */
  private static instance: QuoteManager;

  // ========== 构造函数 ==========

  constructor() {
    if (QuoteManager.instance) {
      return QuoteManager.instance;
    }
    QuoteManager.instance = this;
    this.initQuotes();
  }

  // ========== 公共方法 ==========

  /**
   * 获取单例
   */
  static getInstance(): QuoteManager {
    if (!QuoteManager.instance) {
      QuoteManager.instance = new QuoteManager();
    }
    return QuoteManager.instance;
  }

  /**
   * 显示台词
   * @param riderId 韦手ID
   * @param quoteType 台词类型
   * @param customText 自定义文本（可选）
   */
  showQuote(riderId: string, quoteType: QuoteType, customText?: string): void {
    // 获取台词文本
    const text = customText || this.getRandomQuote(quoteType);

    // 创建显示配置
    const config: QuoteDisplayConfig = {
      riderId,
      text,
      duration: this.defaultDuration,
      position: { x: 0, y: 0 } // 预留：实际位置由UI计算
    };

    // 存储
    this.activeQuotes.set(riderId, config);

    // 触发显示事件
    EventBus.emit('quote-show', config);

    // 自动隐藏
    this.scheduleHide(riderId);
  }

  /**
   * 隐藏台词
   * @param riderId 韦手ID
   */
  hideQuote(riderId: string): void {
    if (this.activeQuotes.has(riderId)) {
      this.activeQuotes.delete(riderId);
      EventBus.emit('quote-hide', riderId);
    }
  }

  /**
   * 根据骑手状态获取台词类型
   * @param state 韦手状态
   * @param riderType 韦手类型
   * @returns 台词类型
   */
  getQuoteTypeByState(state: RiderState, riderType: RiderType): QuoteType {
    // VIP和加急特殊处理
    if (riderType === RiderType.VIP && state === RiderState.IDLE) {
      return QuoteType.VIP;
    }
    if (riderType === RiderType.URGENT && state === RiderState.IDLE) {
      return QuoteType.URGENT;
    }

    // 根据状态匹配
    switch (state) {
      case RiderState.MOVING:
        return QuoteType.LAUNCH;
      case RiderState.SUCCESS:
        return QuoteType.SUCCESS;
      case RiderState.CRASHED:
        return QuoteType.CRASH;
      case RiderState.WAITING:
        return QuoteType.WAITING;
      default:
        return QuoteType.LAUNCH;
    }
  }

  /**
   * 获取随机台词
   * @param quoteType 台词类型
   * @returns 台词文本
   */
  getRandomQuote(quoteType: QuoteType): string {
    const quotes = this.quotes.get(quoteType);
    if (quotes && quotes.length > 0) {
      return Utils.randomPick(quotes);
    }
    return '';
  }

  /**
   * 获取所有活跃台词
   * @returns 活跃台词列表
   */
  getActiveQuotes(): QuoteDisplayConfig[] {
    return Array.from(this.activeQuotes.values());
  }

  // ========== 私有方法 ==========

  /**
   * 初始化台词数据
   */
  private initQuotes(): void {
    this.quotes.set(QuoteType.LAUNCH, [
      '冲冲冲！',
      '出发！',
      '订单在手！',
      '今天要送完！',
      '马上出发！',
      '时间紧迫！'
    ]);

    this.quotes.set(QuoteType.SUCCESS, [
      '准时送达！',
      '好评！好评！',
      '完美送达！',
      '下一单！',
      '客户满意了！',
      '送货成功！'
    ]);

    this.quotes.set(QuoteType.CRASH, [
      '哎呀撞了...',
      '我的电动车...',
      '前面的挡路！',
      '刹车失灵了！',
      '对不起了...',
      '哎呀！'
    ]);

    this.quotes.set(QuoteType.WAITING, [
      '又是红灯...',
      '等一等...',
      '急死了...',
      '能不能快点...',
      '时间在流逝...',
      '绿灯快来...'
    ]);

    this.quotes.set(QuoteType.VIP, [
      '老板催单了！',
      'VIP先送！',
      '这个要第一个！',
      '千万不能耽误！',
      '重点客户！'
    ]);

    this.quotes.set(QuoteType.URGENT, [
      '来不及了！',
      '时间不够！',
      '快点快点！',
      '要超时了！',
      '加急订单！'
    ]);

    this.quotes.set(QuoteType.FAIL, [
      '客户投诉了...',
      '超时了...',
      '今天白干了...',
      '下次一定...',
      '太可惜了...'
    ]);
  }

  /**
   * 安排自动隐藏
   * @param riderId 韦手ID
   */
  private scheduleHide(riderId: string): void {
    setTimeout(() => {
      this.hideQuote(riderId);
    }, this.defaultDuration);
  }
}