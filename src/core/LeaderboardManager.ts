/**
 * 排行榜管理器
 * @description 省份排行榜系统，支持社交裂变
 */

import { StorageMgr } from '../utils/StorageMgr';

const PROVINCES = [
  '北京', '天津', '上海', '重庆', '河北', '山西', '辽宁', '吉林',
  '黑龙江', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南',
  '湖北', '湖南', '广东', '海南', '四川', '贵州', '云南', '陕西',
  '甘肃', '青海', '台湾', '内蒙古', '广西', '西藏', '宁夏', '新疆',
  '香港', '澳门'
];

interface ProvinceStats {
  province: string;
  completions: number;
  attempts: number;
}

export class LeaderboardManager {
  private static instance: LeaderboardManager;
  private province: string | null = null;
  private stats: Map<string, ProvinceStats> = new Map();
  private storageMgr: StorageMgr;

  private constructor() {
    this.storageMgr = StorageMgr.getInstance();
    this.province = this.storageMgr.get<string>('player_province') || null;
    this.generateMockData();
  }

  static getInstance(): LeaderboardManager {
    if (!LeaderboardManager.instance) {
      LeaderboardManager.instance = new LeaderboardManager();
    }
    return LeaderboardManager.instance;
  }

  /**
   * 设置省份
   */
  setProvince(province: string): void {
    this.province = province;
    this.storageMgr.set('player_province', province);
  }

  /**
   * 获取省份
   */
  getProvince(): string | null {
    return this.province;
  }

  /**
   * 是否已选择省份
   */
  hasProvince(): boolean {
    return this.province !== null;
  }

  /**
   * 获取所有省份列表
   */
  getProvinces(): string[] {
    return PROVINCES;
  }

  /**
   * 获取省份通关率
   */
  getCompletionRate(province: string): number {
    const stat = this.stats.get(province);
    if (!stat || stat.attempts === 0) return 0;
    return stat.completions / stat.attempts;
  }

  /**
   * 获取省份排行榜
   */
  getTopProvinces(count: number = 10): { province: string; rate: number; rank: number }[] {
    const sorted = PROVINCES
      .map(p => ({ province: p, rate: this.getCompletionRate(p) }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, count);

    return sorted.map((item, idx) => ({ ...item, rank: idx + 1 }));
  }

  /**
   * 获取当前省份排名
   */
  getMyProvinceRank(): { province: string; rate: number; rank: number } | null {
    if (!this.province) return null;

    const sorted = PROVINCES
      .map(p => ({ province: p, rate: this.getCompletionRate(p) }))
      .sort((a, b) => b.rate - a.rate);

    const idx = sorted.findIndex(s => s.province === this.province);
    if (idx === -1) return null;
    return { ...sorted[idx], rank: idx + 1 };
  }

  /**
   * 记录通关
   */
  recordCompletion(): void {
    if (!this.province) return;
    const stat = this.stats.get(this.province);
    if (stat) {
      stat.completions++;
      stat.attempts++;
    }
  }

  /**
   * 记录尝试
   */
  recordAttempt(): void {
    if (!this.province) return;
    const stat = this.stats.get(this.province);
    if (stat) {
      stat.attempts++;
    }
  }

  /**
   * 生成mock数据（按日期确定性随机）
   */
  private generateMockData(): void {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

    PROVINCES.forEach((province, idx) => {
      const pseudoRandom = Math.sin(seed * 31 + idx * 17) * 10000;
      const frac = pseudoRandom - Math.floor(pseudoRandom);
      const rate = 0.05 + frac * 0.35; // 5% ~ 40%
      const attempts = 500 + Math.floor(Math.abs(pseudoRandom) % 5000);

      this.stats.set(province, {
        province,
        completions: Math.floor(attempts * rate),
        attempts
      });
    });
  }
}
