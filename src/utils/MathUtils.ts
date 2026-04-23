/**
 * 数学工具函数
 * @version v0.1.0
 * @since 2026-04-24
 */
export class MathUtils {
  /**
   * 计算两点之间的距离
   * @param p1 点1
   * @param p2 点2
   * @returns 距离
   */
  static distance(
    p1: { x: number; y: number },
    p2: { x: number; y: number }
  ): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  /**
   * 计算两点之间的角度
   * @param p1 点1
   * @param p2 点2
   * @returns 角度（弧度）
   */
  static angle(
    p1: { x: number; y: number },
    p2: { x: number; y: number }
  ): number {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }

  /**
   * 角度转弧度
   * @param degrees 角度
   * @returns 弧度
   */
  static degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * 弧度转角度
   * @param radians 弧度
   * @returns 角度
   */
  static radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }

  /**
   * 线性插值
   * @param start 起始值
   * @param end 结束值
   * @param t 插值比例 (0-1)
   * @returns 插值结果
   */
  static lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  /**
   * 限制数值范围
   * @param value 数值
   * @param min 最小值
   * @param max 最大值
   * @returns 限制后的数值
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * 判断点是否在矩形内
   * @param point 点
   * @param rect 矩形
   * @returns 是否在矩形内
   */
  static pointInRect(
    point: { x: number; y: number },
    rect: { x: number; y: number; width: number; height: number }
  ): boolean {
    return point.x >= rect.x &&
           point.x <= rect.x + rect.width &&
           point.y >= rect.y &&
           point.y <= rect.y + rect.height;
  }

  /**
   * 判断两个矩形是否相交
   * @param rect1 矩形1
   * @param rect2 矩形2
   * @returns 是否相交
   */
  static rectsIntersect(
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number }
  ): boolean {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }
}