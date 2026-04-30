/**
 * 故事管理器
 * @description 管理游戏背景故事、章节剧情、关卡对话
 * @version v0.2.0
 * @since 2026-04-30
 */

import { StorageMgr } from './StorageMgr';
import { STORAGE_KEYS } from '../constants/GameConstants';
import { DialogueLine, EpilogueVariants, LevelStoryData } from '../types/story';

/** 章节数据 */
export interface Chapter {
  id: number;
  title: string;
  range: [number, number];
  intro: string;
  ending: string;
}

/** 角色数据 */
export interface Character {
  name: string;
  role: string;
  description: string;
  quotes: string[];
  color: string;
}

/** 关卡剧情数据（兼容新旧格式） */
export interface LevelStory {
  levelId: number;
  prelude: string | DialogueLine[];
  characters: string[];
  epilogue?: string | DialogueLine[];
  epilogueVariants?: EpilogueVariants;
}

/** 世界观数据 */
export interface WorldData {
  city: string;
  era: string;
  description: string;
  theme: string;
}

/** 故事数据结构 */
export interface StoryData {
  world: WorldData;
  chapters: Chapter[];
  characters: Character[];
  levelStories: LevelStory[];
  failMessages: Record<string, string[]>;
  successMessages: Record<string, string[]>;
}

export class StoryManager {
  private static instance: StoryManager;

  private data: StoryData | null = null;
  private storage: StorageMgr;
  private seenLevels: Set<number> = new Set();
  private seenChapters: Set<number> = new Set();
  private storyEnabled: boolean = true;

  constructor() {
    if (StoryManager.instance) {
      return StoryManager.instance;
    }
    StoryManager.instance = this;
    this.storage = StorageMgr.getInstance();
    this.loadProgress();
  }

  static getInstance(): StoryManager {
    if (!StoryManager.instance) {
      StoryManager.instance = new StoryManager();
    }
    return StoryManager.instance;
  }

  /**
   * 加载故事数据
   */
  loadData(data: StoryData): void {
    this.data = data;
    console.log(`[StoryManager] 加载故事数据完成，共${data.chapters.length}章，${data.levelStories.length}关剧情`);
  }

  /**
   * 获取世界观描述
   */
  getWorld(): WorldData | null {
    return this.data?.world || null;
  }

  /**
   * 获取当前关卡对应的章节
   */
  getCurrentChapter(levelId: number): Chapter | null {
    if (!this.data) return null;

    return this.data.chapters.find(ch =>
      levelId >= ch.range[0] && levelId <= ch.range[1]
    ) || null;
  }

  /**
   * 获取章节首关ID列表
   */
  getChapterIntroLevels(): number[] {
    if (!this.data) return [];
    return this.data.chapters.map(ch => ch.range[0]);
  }

  /**
   * 判断是否需要显示章节介绍
   */
  shouldShowChapterIntro(levelId: number): boolean {
    if (!this.storyEnabled) return false;

    const chapter = this.getCurrentChapter(levelId);
    if (!chapter) return false;

    // 只有章节首关才显示
    if (levelId !== chapter.range[0]) return false;

    // 已看过则不显示
    return !this.seenChapters.has(chapter.id);
  }

  /**
   * 获取关卡剧情
   */
  getLevelStory(levelId: number): LevelStory | null {
    if (!this.data) return null;

    return this.data.levelStories.find(ls => ls.levelId === levelId) || null;
  }

  /**
   * 判断是否需要显示关卡开场剧情
   */
  shouldShowLevelStory(levelId: number): boolean {
    if (!this.storyEnabled) return false;

    const story = this.getLevelStory(levelId);
    if (!story) return false;

    return !this.seenLevels.has(levelId);
  }

  /**
   * 获取角色信息
   */
  getCharacter(name: string): Character | null {
    if (!this.data) return null;

    return this.data.characters.find(ch => ch.name === name) || null;
  }

  /**
   * 标记关卡剧情已查看
   */
  markLevelSeen(levelId: number): void {
    this.seenLevels.add(levelId);
    this.saveProgress();
  }

  /**
   * 标记章节介绍已查看
   */
  markChapterSeen(chapterId: number): void {
    this.seenChapters.add(chapterId);
    this.saveProgress();
  }

  /**
   * 获取胜利文案
   */
  getSuccessMessage(levelId: number): string {
    if (!this.data) return '关卡完成！';

    const chapter = this.getCurrentChapter(levelId);
    if (!chapter) return '关卡完成！';

    const levelStory = this.getLevelStory(levelId);
    if (levelStory?.epilogue) {
      // 兼容新旧格式
      if (typeof levelStory.epilogue === 'string') {
        return levelStory.epilogue;
      }
      // DialogueLine[] 格式，拼接为文本
      return levelStory.epilogue.map(line => `${line.speaker}: ${line.text}`).join('\n');
    }

    // 使用章节通用文案
    const chapterKey = `chapter${chapter.id}`;
    const messages = this.data.successMessages[chapterKey];
    if (messages && messages.length > 0) {
      return messages[Math.floor(Math.random() * messages.length)];
    }

    return '关卡完成！';
  }

  /**
   * 获取失败文案
   */
  getFailMessage(levelId: number, failType: string): string {
    if (!this.data) return '关卡失败';

    const messages = this.data.failMessages[failType];
    if (messages && messages.length > 0) {
      return messages[Math.floor(Math.random() * messages.length)];
    }

    // 默认失败文案
    const defaultMessages = this.data.failMessages['collision'] || ['关卡失败'];
    return defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
  }

  /**
   * 获取动态结局台词
   * @param levelId 关卡ID
   * @param attempts 当前尝试次数（含本次）
   * @param stars 获得星级（0表示失败）
   * @returns 对话台词数组或字符串
   */
  getDynamicStory(levelId: number, attempts: number, stars: number): string | DialogueLine[] | null {
    const story = this.getLevelStory(levelId);
    if (!story) return null;

    // 有动态结局变体时，根据表现选择
    if (story.epilogueVariants) {
      const variants = story.epilogueVariants;

      if (stars > 0) {
        // 通关
        if (attempts === 1 && stars === 3 && variants.perfect) {
          return variants.perfect;
        }
        if (attempts <= 2 && variants.retry) {
          return variants.retry;
        }
        if (attempts >= 3 && variants.struggled) {
          return variants.struggled;
        }
      } else {
        // 失败
        if (attempts <= 1 && variants.fail_first) {
          return variants.fail_first;
        }
        if (attempts >= 2 && variants.fail_many) {
          return variants.fail_many;
        }
      }
    }

    // 回退到静态 epilogue
    return story.epilogue || null;
  }

  /**
   * 获取关卡的 prelude 对话（兼容新旧格式）
   */
  getPrelude(levelId: number): string | DialogueLine[] | null {
    const story = this.getLevelStory(levelId);
    if (!story) return null;
    return story.prelude || null;
  }

  /**
   * 设置故事开关
   */
  setStoryEnabled(enabled: boolean): void {
    this.storyEnabled = enabled;
    this.storage.set(STORAGE_KEYS.STORY_ENABLED, enabled);
    console.log(`[StoryManager] 故事开关设置为: ${enabled}`);
  }

  /**
   * 获取故事开关状态
   */
  isStoryEnabled(): boolean {
    return this.storyEnabled;
  }

  /**
   * 重置所有故事进度（用于测试）
   */
  resetProgress(): void {
    this.seenLevels.clear();
    this.seenChapters.clear();
    this.storage.remove(STORAGE_KEYS.STORY_SEEN_LEVELS);
    this.storage.remove(STORAGE_KEYS.STORY_SEEN_CHAPTERS);
  }

  /**
   * 保存故事进度
   */
  private saveProgress(): void {
    this.storage.set(STORAGE_KEYS.STORY_SEEN_LEVELS, Array.from(this.seenLevels));
    this.storage.set(STORAGE_KEYS.STORY_SEEN_CHAPTERS, Array.from(this.seenChapters));
  }

  /**
   * 加载故事进度
   */
  private loadProgress(): void {
    const seenLevels = this.storage.get<number[]>(STORAGE_KEYS.STORY_SEEN_LEVELS);
    if (seenLevels) {
      this.seenLevels = new Set(seenLevels);
    }

    const seenChapters = this.storage.get<number[]>(STORAGE_KEYS.STORY_SEEN_CHAPTERS);
    if (seenChapters) {
      this.seenChapters = new Set(seenChapters);
    }

    const enabled = this.storage.get<boolean>(STORAGE_KEYS.STORY_ENABLED);
    if (enabled !== null) {
      this.storyEnabled = enabled;
    }

    console.log(`[StoryManager] 进度加载完成，已看关卡:${this.seenLevels.size}，已看章节:${this.seenChapters.size}`);
  }
}