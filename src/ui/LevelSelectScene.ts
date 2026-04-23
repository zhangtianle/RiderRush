/**
 * 关卡选择场景
 * @description 显示所有关卡列表，用户可选择已解锁的关卡
 * @version v0.1.0
 * @since 2026-04-25
 */

import { _decorator, Component, Node, Button, Label, Sprite, Color } from 'cc';
import { GameEngine } from '../core/GameEngine';
import { EventBus, GameEventType } from '../core/EventBus';
import { StorageMgr } from '../utils/StorageMgr';

const { ccclass, property } = _decorator;

/** 关卡卡片数据 */
interface LevelCardData {
  id: number;
  name: string;
  isUnlocked: boolean;
  isCompleted: boolean;
}

@ccclass('LevelSelectScene')
export class LevelSelectScene extends Component {
  // ========== 属性 ==========

  @property(Node)
  levelListContainer: Node | null = null;

  @property(Node)
  backButton: Node | null = null;

  @property(Node)
  levelCardTemplate: Node | null = null;

  // ========== 数据 ==========

  /** 关卡列表数据 */
  private levelCards: LevelCardData[] = [];

  /** 已解锁关卡 */
  private unlockedLevels: number[] = [];

  /** 已通关关卡 */
  private completedLevels: number[] = [];

  // ========== 生命周期 ==========

  onLoad(): void {
    this.loadProgress();
    this.initLevelList();
    this.bindEvents();
  }

  // ========== 公共方法 ==========

  /**
   * 加载进度
   */
  private loadProgress(): void {
    const storage = StorageMgr.getInstance();
    const progress = storage.get<{
      unlockedLevels: number[];
      completedLevels: number[];
    }>('game_progress');

    if (progress) {
      this.unlockedLevels = progress.unlockedLevels || [1];
      this.completedLevels = progress.completedLevels || [];
    } else {
      this.unlockedLevels = [1];
      this.completedLevels = [];
    }
  }

  /**
   * 初始化关卡列表
   */
  private initLevelList(): void {
    // 生成关卡卡片数据
    this.generateLevelCards();

    // 创建关卡卡片UI（预留）
    this.createLevelCardUI();
  }

  /**
   * 生成关卡卡片数据
   */
  private generateLevelCards(): void {
    const totalLevels = 100;

    for (let i = 1; i <= totalLevels; i++) {
      this.levelCards.push({
        id: i,
        name: `关卡 ${i}`,
        isUnlocked: this.unlockedLevels.includes(i),
        isCompleted: this.completedLevels.includes(i)
      });
    }
  }

  /**
   * 创建关卡卡片UI
   */
  private createLevelCardUI(): void {
    // 预留：根据levelCards动态创建卡片节点
    // 显示已解锁的前20关即可
    const visibleLevels = this.levelCards.filter(c => c.isUnlocked).slice(0, 20);

    visibleLevels.forEach((card, index) => {
      this.createSingleCard(card, index);
    });
  }

  /**
   * 创建单个关卡卡片
   * @param card 关卡数据
   * @param index 索引
   */
  private createSingleCard(card: LevelCardData, index: number): void {
    // 预留：Cocos Creator节点创建
    console.log(`创建关卡卡片: ${card.name}, 已解锁: ${card.isUnlocked}, 已通关: ${card.isCompleted}`);
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    // 返回按钮
    if (this.backButton) {
      this.backButton.on(Button.EventType.CLICK, this.onBackClick, this);
    }
  }

  /**
   * 点击关卡卡片
   * @param levelId 关卡ID
   */
  private onLevelCardClick(levelId: number): void {
    const card = this.levelCards.find(c => c.id === levelId);

    if (!card || !card.isUnlocked) {
      console.warn(`关卡 ${levelId} 未解锁`);
      return;
    }

    console.log(`选择关卡: ${levelId}`);
    EventBus.emit(GameEventType.UI_BUTTON_CLICK, `level_${levelId}`);

    // 加载关卡
    const engine = new GameEngine();
    engine.loadLevel(levelId);
  }

  /**
   * 返回点击
   */
  private onBackClick(): void {
    console.log('返回主菜单');
    EventBus.emit(GameEventType.UI_BUTTON_CLICK, 'back');
    // this.loadScene('MenuScene');
  }
}