/**
 * 事件总线
 * @description 游戏内的事件通信中心，用于模块间解耦通信
 * @version v0.1.0
 * @since 2026-04-24
 */
export class EventBus {
  // ========== 属性 ==========

  /** 事件监听器映射 */
  private listeners: Map<string, Function[]> = new Map();

  /** 单例实例 */
  private static instance: EventBus;

  // ========== 构造函数 ==========

  constructor() {
    if (EventBus.instance) {
      return EventBus.instance;
    }
    EventBus.instance = this;
  }

  // ========== 公共方法 ==========

  /**
   * 获取单例
   * @description 获取EventBus单例实例
   * @returns EventBus实例
   */
  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * 注册事件监听
   * @description 注册指定事件的监听函数
   * @param eventName 事件名称
   * @param callback 回调函数
   */
  on(eventName: string, callback: Function): void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName)!.push(callback);
  }

  /**
   * 移除事件监听
   * @description 移除指定事件的监听函数
   * @param eventName 事件名称
   * @param callback 回调函数
   */
  off(eventName: string, callback: Function): void {
    if (this.listeners.has(eventName)) {
      const callbacks = this.listeners.get(eventName)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * 触发事件
   * @description 触发指定事件，调用所有监听函数
   * @param eventName 事件名称
   * @param data 事件数据
   */
  emit(eventName: string, data?: any): void {
    if (this.listeners.has(eventName)) {
      const callbacks = this.listeners.get(eventName)!;
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (e) {
          console.error(`事件处理错误: ${eventName}`, e);
        }
      });
    }
  }

  /**
   * 单次监听
   * @description 注册只触发一次的监听函数
   * @param eventName 事件名称
   * @param callback 回调函数
   */
  once(eventName: string, callback: Function): void {
    const wrapper = (data: any) => {
      callback(data);
      this.off(eventName, wrapper);
    };
    this.on(eventName, wrapper);
  }

  /**
   * 清除所有监听
   * @description 清除指定事件的所有监听函数
   * @param eventName 事件名称
   */
  clear(eventName?: string): void {
    if (eventName) {
      this.listeners.delete(eventName);
    } else {
      this.listeners.clear();
    }
  }
}

// ========== 预定义事件 ==========

/**
 * 游戏事件类型
 */
export enum GameEventType {
  // 关卡事件
  LEVEL_START = 'level_start',
  LEVEL_COMPLETE = 'level_complete',
  LEVEL_FAILED = 'level_failed',

  // 韦手事件
  RIDER_SELECTED = 'rider_selected',
  RIDER_START_MOVE = 'rider_start_move',
  RIDER_DELIVERED = 'rider_delivered',
  RIDER_CRASHED = 'rider_crashed',
  RIDER_WAITING = 'rider_waiting',

  // 广告事件
  AD_SHOW = 'ad_show',
  AD_COMPLETE = 'ad_complete',
  AD_CANCELLED = 'ad_cancelled',

  // UI事件
  UI_BUTTON_CLICK = 'ui_button_click',
  UI_RESULT_SHOW = 'ui_result_show',

  // 系统事件
  GAME_PAUSE = 'game_pause',
  GAME_RESUME = 'game_resume',
  GAME_SAVE = 'game_save',
  GAME_LOAD = 'game_load'
}