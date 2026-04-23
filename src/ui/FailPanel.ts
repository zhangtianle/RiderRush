/**
 * 失败面板
 * @description 关卡失败后显示的面板，提供重试和广告复活选项
 * @version v0.1.0
 * @since 2026-04-25
 */

import { _decorator, Component, Node, Button, Label } from 'cc';
import { EventBus, GameEventType } from '../core/EventBus';
import { GameEngine } from '../core/GameEngine';
import { AdMgr } from '../utils/AdMgr';
import { AudioMgr } from '../utils/AudioMgr';

const { ccclass, property } = _decorator;

@ccclass('FailPanel')
export class FailPanel extends Component {
  // ========== 属性 ==========

  @property(Node)
  panelNode: Node | null = null;

  @property(Label)
  failReasonLabel: Label | null = null;

  @property(Node)
  reviveButton: Node | null = null;

  @property(Node)
  retryButton: Node | null = null;

  @property(Node)
  homeButton: Node | null = null;

  @property(Label)
  reviveButtonLabel: Label | null = null;

  // ========== 数据 ==========

  /** 关卡ID */
  private levelId: number = 0;

  /** 失败原因 */
  private failReason: string = '';

  /** 广告管理器 */
  private adMgr: AdMgr;

  /** 音效管理器 */
  private audioMgr: AudioMgr;

  /** 广告是否可用 */
  private adAvailable: boolean = true;

  // ========== 生命周期 ==========

  onLoad(): void {
    this.adMgr = AdMgr.getInstance();
    this.audioMgr = AudioMgr.getInstance();
    this.hide();
    this.bindEvents();
  }

  // ========== 公共方法 ==========

  /**
   * 显示失败面板
   * @param levelId 关卡ID
   * @param reason 失败原因
   */
  show(levelId: number, reason: string): void {
    this.levelId = levelId;
    this.failReason = reason;

    // 更新UI
    this.updateUI();

    // 检查广告是否可用
    this.checkAdAvailability();

    // 显示面板
    if (this.panelNode) {
      this.panelNode.active = true;
    }

    EventBus.emit(GameEventType.UI_RESULT_SHOW, 'fail');
  }

  /**
   * 隐藏失败面板
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
    // 复活按钮
    if (this.reviveButton) {
      this.reviveButton.on(Button.EventType.CLICK, this.onReviveClick, this);
    }

    // 重试按钮
    if (this.retryButton) {
      this.retryButton.on(Button.EventType.CLICK, this.onRetryClick, this);
    }

    // 返回主页按钮
    if (this.homeButton) {
      this.homeButton.on(Button.EventType.CLICK, this.onHomeClick, this);
    }

    // 监听广告完成
    EventBus.on(GameEventType.AD_COMPLETE, this.onAdComplete, this);
    EventBus.on(GameEventType.AD_CANCELLED, this.onAdCancelled, this);
  }

  /**
   * 更新UI
   */
  private updateUI(): void {
    // 失败原因
    if (this.failReasonLabel) {
      this.failReasonLabel.string = this.failReason;
    }
  }

  /**
   * 检查广告可用性
   */
  private checkAdAvailability(): void {
    // 检查广告是否已加载完成
    // 预留：实际检查广告SDK状态
    this.adAvailable = true;

    // 更新按钮状态
    if (this.reviveButton) {
      this.reviveButton.active = this.adAvailable;
    }

    if (this.reviveButtonLabel) {
      this.reviveButtonLabel.string = this.adAvailable
        ? '看广告复活'
        : '广告加载中...';
    }
  }

  /**
   * 点击复活
   */
  private onReviveClick(): void {
    console.log('点击复活');
    EventBus.emit(GameEventType.UI_BUTTON_CLICK, 'revive');

    if (!this.adAvailable) {
      console.warn('广告不可用');
      return;
    }

    // 显示广告
    EventBus.emit(GameEventType.AD_SHOW, 'revive');

    this.adMgr.show()
      .then(() => {
        // 广告开始显示，隐藏面板
        this.hide();
      })
      .catch((err) => {
        // 广告显示失败，提示用户
        console.error('广告显示失败', err);
        this.checkAdAvailability();
      });
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
   * 点击返回主页
   */
  private onHomeClick(): void {
    console.log('点击返回主页');
    EventBus.emit(GameEventType.UI_BUTTON_CLICK, 'home');

    this.hide();

    // 返回关卡选择
    // this.loadScene('LevelSelectScene');
  }

  /**
   * 广告完成回调
   */
  private onAdComplete(): void {
    console.log('广告观看完成，复活');
    this.audioMgr.play('success');

    // 复活当前关卡
    // 重置时间，保留已送达的骑手
    // 预留：实现复活逻辑
  }

  /**
   * 广告取消回调
   */
  private onAdCancelled(): void {
    console.log('广告中途关闭');

    // 重新显示失败面板
    this.show(this.levelId, this.failReason);
  }
}