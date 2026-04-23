/**
 * 通用工具函数
 * @version v0.1.0
 * @since 2026-04-24
 */
export class Utils {
  /**
   * 深拷贝对象
   * @param obj 要拷贝的对象
   * @returns 拷贝后的新对象
   */
  static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * 随机数生成
   * @param min 最小值
   * @param max 最大值
   * @returns 随机数
   */
  static random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * 从数组中随机选择一个元素
   * @param arr 数组
   * @returns 随机选择的元素
   */
  static randomPick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * 延迟执行
   * @param ms 毫秒数
   * @returns Promise
   */
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 格式化时间
   * @param seconds 秒数
   * @returns 格式化的时间字符串
   */
  static formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * 判断是否为微信环境
   * @returns 是否为微信小游戏环境
   */
  static isWechat(): boolean {
    return typeof wx !== 'undefined';
  }

  /**
   * 判断是否为抖音环境
   * @returns 是否为抖音小游戏环境
   */
  static isDouyin(): boolean {
    return typeof tt !== 'undefined';
  }
}