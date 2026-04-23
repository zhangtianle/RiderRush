/**
 * 结算面板
 * @description 关卡通关后显示的结算界面
 * @version v0.1.0
 * @since 2026-04-25
 */

import { _decorator, Component, Node, Button, Label, Sprite, Color } from 'cc';
import { EventBus, GameEventType } from '../core/EventBus';
import { GameEngine } from '../core/GameEngine';
import { Utils } from '../utils/Utils';

const { ccclass, property } = _decorator;

@ccclass('ResultPanel')
export class ResultPanel extends Component {
  // ========== 属性 ==========

  @property(Node)
  panelNode: Node | null = null;

  @property(Label)
  levelNameLabel: Label | null = null;

  @property(Label)
  timeLabel: Label | null = null;

  @property(Node)
  starsContainer: Node | null = null;

  @property(Node)
  nextButton: Node | null = null;

  @property(Node)
  retryButton: Node | null = null;

  @property(Node)
  shareButton: Node | null = null;

  @property(Node)
  homeButton: Node | null = null;

  // ========== 数据 ==========

  /** 关卡ID */
  private levelId: number = 0;

  /** 通关时间 */
  private completionTime: number = 0;

  /** 评分（星级） */
  private stars: number = 0;

  // ========== 生命周期 ==========

  onLoad(): void {
    this.hide();
    this.bindEvents();
  }

  // ========== 公共方法 ==========

  /**
   * 显示结算面板
   * @param levelId 关卡ID
   * @param time 通关时间（秒）
   */
  show(levelId: number, time: number): void {
    this.levelId = levelId;
    this.completionTime = time;

    // 计算星级评分
    this.calculateStars();

    // 更新UI
    this.updateUI();

    // 显示面板
    if (this.panelNode) {
      this.panelNode.active = true;
    }

    EventBus.emit(GameEventType.UI_RESULT_SHOW, 'success');
  }

  /**
   * 隐藏结算面板
   */
  hide(): void {
    if (this.panelNode) {
      this.panelNode.active = false;
    }
  }

  // ========== 私有方法 ==========

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    // 下一关按钮
    if (this.nextButton) {
      this.nextButton.on(Button.EventType.CLICK, this.onNextClick, this);
    }

    // 重试按钮
    if (this.retryButton) {
      this.retryButton.on(Button.EventType.CLICK, this.onRetryClick, this);
    }

    // 分享按钮
    if (this.shareButton) {
      this.shareButton.on(Button.EventType.CLICK, this.onShareClick, this);
    }

    // 返回主页按钮
    if (this.homeButton) {
      this.homeButton.on(Button.EventType.CLICK, this.onHomeClick, this);
    }
  }

  /**
   * 计算星级评分
   */
  private calculateStars(): void {
    // 根据通关时间计算星级
    // 1星：通关
    // 2星：通关时间 < 60秒
    // 3星：通关时间 < 30秒

    if (this.completionTime < 30) {
      this.stars = 3;
    } else if (this.completionTime < 60) {
      this.stars = 2;
    } else {
      this.stars = 1;
    }
  }

  /**
   * 更新UI
   */
  private updateUI(): void {
    // 关卡名称
    if (this.levelNameLabel) {
      this.levelNameLabel.string = `关卡 ${this.levelId}`;
    }

    // 通关时间
    if (this.timeLabel) {
      this.timeLabel.string = `用时: ${Utils.formatTime(this.completionTime)}`;
    }

    // 星级显示（预留）
    this.updateStarsDisplay();
  }

  /**
   * 更新星级显示
   */
  private updateStarsDisplay(): void {
    // 预留：根据stars显示对应数量的星星图标
    console.log(`获得 ${this.stars} 星`);
  }

  /**
   * 点击下一关
   */
  private onNextClick(): void {
    console.log('点击下一关');
    EventBus.emit(GameEventType.UI_BUTTON_CLICK, 'next');

    this.hide();

    // 进入下一关
    const engine = new GameEngine();
    engine.nextLevel();
  }

  /**
   * 点击重试
   */
  private onRetryClick(): void {
    console.log('点击重试');
    EventBus.emit(GameEventType.UI_BUTTON_CLICK, 'retry');

    this.hide();

    // 重新开始当前关卡
    const engine = new GameEngine();
    engine.retryLevel();
  }

  /**
   * 点击分享
   */
  private onShareClick(): void {
    console.log('点击分享');
    EventBus.emit(GameEventType.UI_BUTTON_CLICK, 'share');

    // 调用分享功能
    const engine = new GameEngine();
    engine.shareResult();
  }

  /**
   * 点击返回主页
   */
  private onHomeClick(): void {
    console.log('点击返回主页');
    EventBus.emit(GameEventType.UI_BUTTON_CLICK, 'home');

    this.hide();

    // 返回主菜单
    // this.loadScene('MenuScene');
  }
}