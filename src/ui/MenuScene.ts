/**
 * 主菜单场景
 * @description 游戏启动后的主界面，包含开始游戏按钮
 * @version v0.1.0
 * @since 2026-04-25
 */

import { _decorator, Component, Node, Button, Label } from 'cc';
import { GameEngine, GameState } from '../core/GameEngine';
import { EventBus, GameEventType } from '../core/EventBus';

const { ccclass, property } = _decorator;

@ccclass('MenuScene')
export class MenuScene extends Component {
  // ========== 属性 ==========

  @property(Node)
  startButton: Node | null = null;

  @property(Node)
  levelSelectButton: Node | null = null;

  @property(Node)
  settingsButton: Node | null = null;

  @property(Label)
  titleLabel: Label | null = null;

  // ========== 生命周期 ==========

  onLoad(): void {
    this.initUI();
    this.bindEvents();
  }

  start(): void {
    // 显示游戏标题
    if (this.titleLabel) {
      this.titleLabel.string = '外卖冲冲冲';
    }
  }

  // ========== 公共方法 ==========

  /**
   * 初始化UI
   */
  private initUI(): void {
    // 预留：UI初始化逻辑
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    // 开始游戏按钮
    if (this.startButton) {
      this.startButton.on(Button.EventType.CLICK, this.onStartClick, this);
    }

    // 关卡选择按钮
    if (this.levelSelectButton) {
      this.levelSelectButton.on(Button.EventType.CLICK, this.onLevelSelectClick, this);
    }

    // 设置按钮
    if (this.settingsButton) {
      this.settingsButton.on(Button.EventType.CLICK, this.onSettingsClick, this);
    }
  }

  /**
   * 开始游戏点击
   */
  private onStartClick(): void {
    console.log('点击开始游戏');
    EventBus.emit(GameEventType.UI_BUTTON_CLICK, 'start');

    // 进入关卡选择或直接进入第一关
    const engine = GameEngine.getInstance?.() || new GameEngine();
    engine.loadLevel(1);
    engine.startLevel();
  }

  /**
   * 关卡选择点击
   */
  private onLevelSelectClick(): void {
    console.log('点击关卡选择');
    EventBus.emit(GameEventType.UI_BUTTON_CLICK, 'levelSelect');

    // 进入关卡选择场景（预留）
    // this.loadScene('LevelSelectScene');
  }

  /**
   * 设置点击
   */
  private onSettingsClick(): void {
    console.log('点击设置');
    EventBus.emit(GameEventType.UI_BUTTON_CLICK, 'settings');
    // 预留：打开设置面板
  }

  /**
   * 加载场景
   * @param sceneName 场景名称
   */
  private loadScene(sceneName: string): void {
    // 预留：Cocos Creator场景加载
    // director.loadScene(sceneName);
  }
}