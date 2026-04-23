/**
 * 音效管理器
 * @version v0.1.0
 * @since 2026-04-24
 */
export class AudioMgr {
  // ========== 属性 ==========

  /** 音效缓存 */
  private audioCache: Map<string, any> = new Map();

  /** 是否静音 */
  private muted: boolean = false;

  /** 音量 */
  private volume: number = 1;

  /** 单例 */
  private static instance: AudioMgr;

  // ========== 构造函数 ==========

  constructor() {
    if (AudioMgr.instance) {
      return AudioMgr.instance;
    }
    AudioMgr.instance = this;
  }

  // ========== 公共方法 ==========

  /**
   * 获取单例
   */
  static getInstance(): AudioMgr {
    if (!AudioMgr.instance) {
      AudioMgr.instance = new AudioMgr();
    }
    return AudioMgr.instance;
  }

  /**
   * 预加载音效
   * @param audioPaths 音效路径列表
   */
  preload(audioPaths: string[]): void {
    audioPaths.forEach(path => {
      // 预留：微信小游戏音效加载
      // const audio = wx.createInnerAudioContext();
      // audio.src = path;
      // this.audioCache.set(path, audio);
    });
  }

  /**
   * 播放音效
   * @param name 音效名称
   */
  play(name: string): void {
    if (this.muted) return;

    // 预留：实际播放逻辑
    console.log(`播放音效: ${name}`);
  }

  /**
   * 设置静音
   * @param muted 是否静音
   */
  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  /**
   * 设置音量
   * @param volume 音量 (0-1)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * 停止所有音效
   */
  stopAll(): void {
    this.audioCache.forEach(audio => {
      // audio.stop();
    });
  }
}