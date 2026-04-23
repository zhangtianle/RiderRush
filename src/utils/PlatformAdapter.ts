/**
 * 平台适配器
 * @description 处理微信、抖音等不同平台的API差异
 * @version v0.1.0
 * @since 2026-04-25
 */

/** 平台类型 */
export enum PlatformType {
  WECHAT = 'wechat',
  DOUYIN = 'douyin',
  WEB = 'web'
}

/**
 * 平台适配器
 */
export class PlatformAdapter {
  // ========== 属性 ==========

  /** 当前平台 */
  private platform: PlatformType;

  /** 单例 */
  private static instance: PlatformAdapter;

  // ========== 构造函数 ==========

  constructor() {
    if (PlatformAdapter.instance) {
      return PlatformAdapter.instance;
    }
    PlatformAdapter.instance = this;
    this.platform = this.detectPlatform();
  }

  // ========== 公共方法 ==========

  /**
   * 获取单例
   */
  static getInstance(): PlatformAdapter {
    if (!PlatformAdapter.instance) {
      PlatformAdapter.instance = new PlatformAdapter();
    }
    return PlatformAdapter.instance;
  }

  /**
   * 获取当前平台
   * @returns 平台类型
   */
  getPlatform(): PlatformType {
    return this.platform;
  }

  /**
   * 是否微信平台
   * @returns 是否微信
   */
  isWechat(): boolean {
    return this.platform === PlatformType.WECHAT;
  }

  /**
   * 是否抖音平台
   * @returns 是否抖音
   */
  isDouyin(): boolean {
    return this.platform === PlatformType.DOUYIN;
  }

  /**
   * 是否Web平台
   * @returns 是否Web
   */
  isWeb(): boolean {
    return this.platform === PlatformType.WEB;
  }

  /**
   * 本地存储
   * @param key 键
   * @param value 值
   */
  setStorage(key: string, value: any): void {
    const data = JSON.stringify(value);

    if (this.isWechat()) {
      wx.setStorageSync(key, data);
    } else if (this.isDouyin()) {
      tt.setStorageSync(key, data);
    } else {
      localStorage.setItem(key, data);
    }
  }

  /**
   * 读取存储
   * @param key 键
   * @returns 值
   */
  getStorage<T>(key: string): T | null {
    let data: string | null = null;

    if (this.isWechat()) {
      data = wx.getStorageSync(key);
    } else if (this.isDouyin()) {
      data = tt.getStorageSync(key);
    } else {
      data = localStorage.getItem(key);
    }

    if (data) {
      try {
        return JSON.parse(data) as T;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  /**
   * 删除存储
   * @param key 键
   */
  removeStorage(key: string): void {
    if (this.isWechat()) {
      wx.removeStorageSync(key);
    } else if (this.isDouyin()) {
      tt.removeStorageSync(key);
    } else {
      localStorage.removeItem(key);
    }
  }

  /**
   * 分享
   * @param options 分享选项
   */
  share(options: { title: string; imageUrl?: string }): void {
    if (this.isWechat()) {
      wx.shareAppMessage({
        title: options.title,
        imageUrl: options.imageUrl || ''
      });
    } else if (this.isDouyin()) {
      tt.shareAppMessage({
        title: options.title,
        imageUrl: options.imageUrl || ''
      });
    } else {
      // Web平台：复制链接或提示
      console.log('Web平台暂不支持分享');
    }
  }

  /**
   * 创建激励视频广告
   * @param adUnitId 广告单元ID
   * @returns 广告实例
   */
  createRewardedVideoAd(adUnitId: string): any {
    if (this.isWechat()) {
      return wx.createRewardedVideoAd({ adUnitId });
    } else if (this.isDouyin()) {
      return tt.createRewardedVideoAd({ adUnitId });
    } else {
      // Web平台：模拟广告
      return this.createMockAd();
    }
  }

  /**
   * 获取系统信息
   * @returns 系统信息
   */
  getSystemInfo(): { screenWidth: number; screenHeight: number; platform: string } {
    if (this.isWechat()) {
      const info = wx.getSystemInfoSync();
      return {
        screenWidth: info.screenWidth,
        screenHeight: info.screenHeight,
        platform: info.platform
      };
    } else if (this.isDouyin()) {
      const info = tt.getSystemInfoSync();
      return {
        screenWidth: info.screenWidth,
        screenHeight: info.screenHeight,
        platform: info.platform
      };
    } else {
      return {
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        platform: 'web'
      };
    }
  }

  // ========== 私有方法 ==========

  /**
   * 检测平台
   * @returns 平台类型
   */
  private detectPlatform(): PlatformType {
    if (typeof wx !== 'undefined') {
      return PlatformType.WECHAT;
    }
    if (typeof tt !== 'undefined') {
      return PlatformType.DOUYIN;
    }
    return PlatformType.WEB;
  }

  /**
   * 创建模拟广告（Web平台）
   * @returns 模拟广告实例
   */
  private createMockAd(): any {
    return {
      show: () => Promise.resolve(),
      load: () => Promise.resolve(),
      onLoad: (cb: Function) => cb(),
      onError: (cb: Function) => {},
      onClose: (cb: Function) => cb({ isEnded: true })
    };
  }
}