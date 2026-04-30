/**
 * 存储管理器
 * @version v0.1.0
 * @since 2026-04-24
 */
declare const wx: any;

export class StorageMgr {
  private static instance: StorageMgr;

  constructor() {
    if (StorageMgr.instance) {
      return StorageMgr.instance;
    }
    StorageMgr.instance = this;
  }

  static getInstance(): StorageMgr {
    if (!StorageMgr.instance) {
      StorageMgr.instance = new StorageMgr();
    }
    return StorageMgr.instance;
  }

  set(key: string, value: any): void {
    try {
      const data = JSON.stringify(value);
      if (typeof wx !== 'undefined') {
        wx.setStorageSync(key, data);
      } else {
        localStorage.setItem(key, data);
      }
    } catch (e) {
      console.error('存储失败', e);
    }
  }

  get<T>(key: string): T | null {
    try {
      let data: string | null = null;
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
