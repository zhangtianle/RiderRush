/**
 * 游戏内HUD
 * @description 游戏进行中显示的信息面板，包括时间、已送达数量等
 * @version v0.1.0
 * @since 2026-04-25
 */

import { _decorator, Component, Node, Label, Button, ProgressBar } from 'cc';
import { Level, LevelState } from '../core/Level';
import { EventBus, GameEventType } from '../core/EventBus';
import { Utils } from '../utils/Utils';

const { ccclass, property } = _decorator;

@ccclass('HUD')
export class HUD extends Component {
  // ========== 属性 ==========

  @property(Label)
  levelLabel: Label | null = null;

  @property(Label)
  timeLabel: Label | null = null;

  @property(Label)
  deliveredLabel: Label | null = null;

  @property(ProgressBar)
  progressBar: ProgressBar | null = null;

  @property(Node)
  pauseButton: Node | null = null;

  @property(Node)
  vipIndicator: Node | null = null;

  @property(Node)
  urgentIndicator: Node | null = null;

  // ========== 数据 ==========

  /** 当前关卡 */
  private currentLevel: Level | null = null;

  // ========== 生命周期 ==========

  onLoad(): void {
    this.bindEvents();
    this.hideVIPIndicator();
    this.hideUrgentIndicator();
  }

  // ========== 公共方法 ==========

  /**
   * 设置当前关卡
   * @param level 关卡实例
   */
  setLevel(level: Level): void {
    this.currentLevel = level;
    this.updateDisplay();
  }

  /**
   * 每帧更新
   * @param dt 时间增量
   */
  update(dt: number): void {
    if (!this.currentLevel || this.currentLevel.state !== LevelState.PLAYING) {
      return;
    }

    this.updateTimeDisplay();
    this.updateProgressDisplay();
  }

  // ========== 私有方法 ==========

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    // 暂停按钮
    if (this.pauseButton) {
      this.pauseButton.on(Button.EventType.CLICK, this.onPauseClick, this);
    }

    // 监听骑手送达
    EventBus.on(GameEventType.RIDER_DELIVERED, this.onRiderDelivered, this);
  }

  /**
   * 更新显示
   */
  private updateDisplay(): void {
    if (!this.currentLevel) {
      return;
    }

    // 关卡名称
    if (this.levelLabel) {
      this.levelLabel.string = this.currentLevel.name;
    }

    // 已送达数量
    this.updateDeliveredDisplay();

    // VIP/加急指示器
    this.updateSpecialIndicators();
  }

  /**
   * 更新时间显示
   */
  private updateTimeDisplay(): void {
    if (!this.timeLabel || !this.currentLevel) {
      return;
    }

    if (this.currentLevel.timeLimit > 0) {
      const remaining = Math.max(0, this.currentLevel.timeRemaining);
      this.timeLabel.string = Utils.formatTime(remaining);

      // 时间紧迫时变色
      if (remaining < 10) {
        this.timeLabel.node.getComponent('cc.Label')?.color = { r: 255, g: 0, b: 0 } as any;
      }
    } else {
      this.timeLabel.string = '';
    }
  }

  /**
   * 更新进度显示
   */
  private updateProgressDisplay(): void {
    if (!this.progressBar || !this.currentLevel) {
      return;
    }

    const progress = this.currentLevel.deliveredCount / this.currentLevel.totalRiders;
    this.progressBar.progress = progress;
  }

  /**
   * 更新已送达显示
   */
  private updateDeliveredDisplay(): void {
    if (!this.deliveredLabel || !this.currentLevel) {
      return;
    }

    this.deliveredLabel.string = `${this.currentLevel.deliveredCount}/${this.currentLevel.totalRiders}`;
  }

  /**
   * 更新特殊指示器
   */
  private updateSpecialIndicators(): void {
    if (!this.currentLevel) {
      return;
    }

    // VIP指示器
    if (this.currentLevel.hasVIPRider) {
      this.showVIPIndicator();
    }

    // 加急指示器（检查是否有加急骑手）
    const hasUrgent = this.currentLevel.riders.some(r => r.type === 'URGENT');
    if (hasUrgent) {
      this.showUrgentIndicator();
    }
  }

  /**
   * 显示VIP指示器
   */
  private showVIPIndicator(): void {
    if (this.vipIndicator) {
      this.vipIndicator.active = true;
    }
  }

  /**
   * 隐藏VIP指示器
   */
  private hideVIPIndicator(): void {
    if (this.vipIndicator) {
      this.vipIndicator.active = false;
    }
  }

  /**
   * 显示加急指示器
   */
  private showUrgentIndicator(): void {
    if (this.urgentIndicator) {
      this.urgentIndicator.active = true;
    }
  }

  /**
   * 隐藏加急指示器
   */
  private hideUrgentIndicator(): void {
    if (this.urgentIndicator) {
      this.urgentIndicator.active = false;
    }
  }

  /**
   * 点击暂停
   */
  private onPauseClick(): void {
    console.log('点击暂停');
    EventBus.emit(GameEventType.GAME_PAUSE);

    // 暂停游戏
    if (this.currentLevel) {
      this.currentLevel.pause();
    }
  }

  /**
   * 韦手送达回调
   */
  private onRiderDelivered(): void {
    this.updateDeliveredDisplay();
    this.updateProgressDisplay();
  }
}