/**
 * 广告管理器
 * @version v0.1.0
 * @since 2026-04-24
 */
export class AdMgr {
  // ========== 属性 ==========

  /** 激励视频广告实例 */
  private rewardedVideoAd: any = null;

  /** 广告是否加载完成 */
  private adLoaded: boolean = false;

  /** 广告冷却时间 */
  private adCooldown: number = 0;

  /** 单例 */
  private static instance: AdMgr;

  // ========== 构造函数 ==========

  constructor() {
    if (AdMgr.instance) {
      return AdMgr.instance;
    }
    AdMgr.instance = this;
  }

  // ========== 公共方法 ==========

  /**
   * 获取单例
   */
  static getInstance(): AdMgr {
    if (!AdMgr.instance) {
      AdMgr.instance = new AdMgr();
    }
    return AdMgr.instance;
  }

  /**
   * 初始化广告
   * @param adUnitId 广告单元ID
   */
  init(adUnitId: string): void {
    // 微信小游戏广告初始化
    if (typeof wx !== 'undefined') {
      this.rewardedVideoAd = wx.createRewardedVideoAd({
        adUnitId: adUnitId
      });

      this.rewardedVideoAd.onLoad(() => {
        this.adLoaded = true;
        console.log('广告加载成功');
      });

      this.rewardedVideoAd.onError((err: any) => {
        this.adLoaded = false;
        console.error('广告加载失败', err);
      });

      this.rewardedVideoAd.onClose((res: any) => {
        if (res && res.isEnded) {
          // 用户完整观看，发放奖励
          this.onAdComplete();
        } else {
          // 用户中途关闭
          this.onAdCancelled();
        }
      });
    }
  }

  /**
   * 显示广告
   * @returns Promise
   */
  show(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.adCooldown > 0) {
        reject(new Error('广告冷却中'));
        return;
      }

      if (!this.adLoaded) {
        // 广告未加载，先加载
        this.rewardedVideoAd?.load()
          .then(() => this.rewardedVideoAd?.show())
          .then(() => resolve(true))
          .catch((err: any) => reject(err));
      } else {
        this.rewardedVideoAd?.show()
          .then(() => resolve(true))
          .catch((err: any) => {
            // 显示失败，重新加载
            this.rewardedVideoAd?.load()
              .then(() => this.rewardedVideoAd?.show())
              .then(() => resolve(true))
              .catch((err: any) => reject(err));
          });
      }

      // 设置冷却时间
      this.adCooldown = 5000;
    });
  }

  /**
   * 更新冷却时间
   * @param dt 时间增量（毫秒）
   */
  updateCooldown(dt: number): void {
    if (this.adCooldown > 0) {
      this.adCooldown -= dt;
    }
  }

  /**
   * 广告完成回调
   */
  private onAdComplete(): void {
    // 触发广告完成事件
    console.log('广告观看完成，发放奖励');
  }

  /**
   * 广告取消回调
   */
  private onAdCancelled(): void {
    console.log('广告中途关闭');
  }
}