/**
 * 游戏常量配置
 * @version v0.1.0
 * @since 2026-04-25
 */

/** 游戏基础常量 */
export const GAME_CONSTANTS = {
  /** 游戏名称 */
  NAME: '外卖冲冲冲',

  /** 版本号 */
  VERSION: '0.2.0-alpha',

  /** 最大关卡数 */
  MAX_LEVELS: 100,

  /** 默认网格大小 */
  DEFAULT_GRID_SIZE: { width: 8, height: 6 }
};

/** 显示常量 */
export const DISPLAY_CONSTANTS = {
  /** 格子大小（像素） */
  GRID_CELL_SIZE: 60,

  /** 韦手大小（像素） */
  RIDER_SIZE: 40,

  /** 阻碍大小（像素） */
  OBSTACLE_SIZE: 50,

  /** 出口大小（像素） */
  EXIT_SIZE: 40,

  /** 台词气泡偏移（像素） */
  QUOTE_OFFSET_Y: 30
};

/** 时间常量 */
export const TIME_CONSTANTS = {
  /** 默认移动速度（格/秒） */
  DEFAULT_MOVE_SPEED: 1,

  /** 撞车延迟（毫秒） */
  CRASH_DELAY: 500,

  /** 台词显示时长（毫秒） */
  QUOTE_DURATION: 2000,

  /** 红绿灯周期（秒） */
  LIGHT_CYCLE: 3,

  /** 广告冷却时间（毫秒） */
  AD_COOLDOWN: 5000
};

/** 障碍常量 */
export const OBSTACLE_CONSTANTS = {
  /** 墙壁颜色 */
  WALL_COLOR: '#808080',

  /** 堵车区颜色 */
  TRAFFIC_COLOR: '#FF6B6B',

  /** 堵车区减速系数 */
  TRAFFIC_SLOW_FACTOR: 0.5,

  /** 红灯颜色 */
  LIGHT_RED_COLOR: '#FF0000',

  /** 绿灯颜色 */
  LIGHT_GREEN_COLOR: '#00FF00',

  /** 门禁颜色 */
  GATE_COLOR: '#4A90D9'
};

/** 韦手常量 */
export const RIDER_CONSTANTS = {
  /** 普通骑手颜色 */
  NORMAL_COLOR: '#FFD700',

  /** VIP骑手颜色 */
  VIP_COLOR: '#FFA500',

  /** 加急骑手颜色 */
  URGENT_COLOR: '#FF4500',

  /** 加急默认时限（秒） */
  URGENT_TIME_LIMIT: 30
};

/** 难度常量 */
export const DIFFICULTY_CONSTANTS = {
  EASY: {
    name: '入门',
    riders: { min: 2, max: 3 },
    obstacles: 0,
    timeLimit: 0,
    starThresholds: { 3: 20, 2: 40 }
  },
  MEDIUM: {
    name: '基础',
    riders: { min: 3, max: 4 },
    obstacles: { min: 1, max: 2 },
    timeLimit: 0,
    starThresholds: { 3: 25, 2: 50 }
  },
  HARD: {
    name: '进阶',
    riders: { min: 4, max: 6 },
    obstacles: { min: 2, max: 4 },
    timeLimit: 90,
    starThresholds: { 3: 60, 2: 75 }
  },
  EXPERT: {
    name: '专家',
    riders: { min: 6, max: 8 },
    obstacles: { min: 3, max: 6 },
    timeLimit: 120,
    starThresholds: { 3: 90, 2: 110 }
  }
};

/** 存储键常量 */
export const STORAGE_KEYS = {
  /** 游戏进度 */
  PROGRESS: 'game_progress',

  /** 游戏设置 */
  SETTINGS: 'game_settings',

  /** 音效静音状态 */
  MUTED: 'audio_muted',

  /** 音量 */
  VOLUME: 'audio_volume',

  /** 故事已看关卡列表 */
  STORY_SEEN_LEVELS: 'story_seen_levels',

  /** 故事已看章节列表 */
  STORY_SEEN_CHAPTERS: 'story_seen_chapters',

  /** 故事开关 */
  STORY_ENABLED: 'story_enabled'
};

/** 广告配置 */
export const AD_CONFIG = {
  /** 复活广告单元ID（需替换） */
  REVIVE_AD_UNIT_ID: 'YOUR_REVIVE_AD_UNIT_ID',

  /** 奖励广告单元ID（需替换） */
  REWARD_AD_UNIT_ID: 'YOUR_REWARD_AD_UNIT_ID',

  /** 广告冷却时间 */
  COOLDOWN: 5000
};

/** 评分常量 */
export const SCORE_CONSTANTS = {
  /** 通关基本分 */
  BASE_SCORE: 100,

  /** 每秒加分 */
  TIME_BONUS: 10,

  /** VIP额外加分 */
  VIP_BONUS: 50,

  /** 加急额外加分 */
  URGENT_BONUS: 30
};

/** 路径与反馈常量 */
export const PATH_CONSTANTS = {
  /** 差一点就过了判定比例 */
  NEAR_MISS_RATIO: 0.8,

  /** 连击窗口时间（毫秒） */
  COMBO_WINDOW_MS: 2000,

  /** 教程关卡ID列表 */
  TUTORIAL_LEVELS: [1, 2, 3, 4, 5]
};