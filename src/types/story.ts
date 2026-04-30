/**
 * 故事对话数据结构
 * @description 定义对话台词、情绪、动态epilogue等类型
 * @version v0.1.0
 * @since 2026-04-30
 */

/** 对话情绪类型 */
export type DialogueEmotion =
  | 'normal'    // 普通
  | 'nervous'   // 紧张
  | 'happy'     // 开心
  | 'sad'       // 难过
  | 'angry'     // 生气
  | 'confused'  // 困惑
  | 'tease'     // 调侃/毒舌
  | 'proud'     // 骄傲
  | 'shy'       // 害羞/不好意思
  | 'surprised' // 惊讶
  | 'determined'// 坚定
  | 'worried'   // 担心
  | 'relieved'  // 释然
  | 'cool';     // 淡定/酷

/** 单条对话台词 */
export interface DialogueLine {
  /** 说话者角色名 */
  speaker: string;
  /** 台词内容 */
  text: string;
  /** 情绪（可选，影响表情） */
  emotion?: DialogueEmotion;
}

/** 动态epilogue变体 */
export interface EpilogueVariants {
  /** 首次完美通关（无失败） */
  perfect?: string | DialogueLine[];
  /** 失败1-2次后通关 */
  retry?: string | DialogueLine[];
  /** 失败3次以上通关 */
  struggled?: string | DialogueLine[];
  /** 首次失败 */
  fail_first?: string | DialogueLine[];
  /** 多次失败 */
  fail_many?: string | DialogueLine[];
}

/** 关卡剧情数据（新格式） */
export interface LevelStoryData {
  levelId: number;
  /** 开场对话 */
  prelude: string | DialogueLine[];
  /** 出场角色名 */
  characters: string[];
  /** 结局对话（静态，兼容旧格式） */
  epilogue?: string | DialogueLine[];
  /** 动态结局（根据表现选择） */
  epilogueVariants?: EpilogueVariants;
}
