/**
 * 存储管理器
 * @version v0.1.0
 * @since 2026-04-24
 */
export class StorageMgr {
  // ========== 属性 ==========

  /** 单例 */
  private static instance: StorageMgr;

  // ========== 构造函数 ==========

  constructor() {
    if (StorageMgr.instance) {
      return StorageMgr.instance;
    }
    StorageMgr.instance = this;
  }

  // ========== 公共方法 ==========

  /**
   * 获取单例
   */
  static getInstance(): StorageMgr {
    if (!StorageMgr.instance) {
      StorageMgr.instance = new StorageMgr();
    }
    return StorageMgr.instance;
  }

  /**
   * 存储数据
   * @param key 键名
   * @param value 值
   */
  set(key: string, value: any): void {
    try {
      const data = JSON.stringify(value);

      // 微信小游戏存储
      if (typeof wx !== 'undefined') {
        wx.setStorageSync(key, data);
      } else {
        localStorage.setItem(key, data);
      }
    } catch (e) {
      console.error('存储失败', e);
    }
  }

  /**
   * 获取数据
   * @param key 键名
   * @returns 数据值
   */
  get<T>(key: string): T | null {
    try {
      let data: string | null = null;

      // 微信小游戏存储
      if (typeof wx !== 'undefined') {
        data = wx.getStorageSync(key);
      } else {
        data = localStorage.getItem(key);
      }

      if (data) {
        return JSON.parse(data) as T;
      }
      return null;
    } catch (e) {
      console.error('读取失败', e);
      return null;
    }
  }

  /**
   * 删除数据
   * @param key 键名
   */
  remove(key: string): void {
    try {
      if (typeof wx !== 'undefined') {
        wx.removeStorageSync(key);
      } else {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.error('删除失败', e);
    }
  }

  /**
   * 清空所有数据
   */
  clear(): void {
    try {
      if (typeof wx !== 'undefined') {
        wx.clearStorageSync();
      } else {
        localStorage.clear();
      }
    } catch (e) {
      console.error('清空失败', e);
    }
  }
}