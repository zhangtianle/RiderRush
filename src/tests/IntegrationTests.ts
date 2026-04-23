/**
 * 游戏流程集成测试
 * @description 模拟完整的游戏流程，验证各组件协作
 * @version v0.1.0
 * @since 2026-04-25
 */

import { GameLogicController } from '../core/GameLogicController';
import { Level, LevelState } from '../core/Level';
import { Rider, RiderState, RiderType, Direction } from '../core/Rider';
import { EventBus, GameEventType } from '../core/EventBus';
import { LevelManager } from '../core/LevelManager';
import { SceneManager, SceneType } from '../utils/SceneManager';

/** 测试结果 */
interface IntegrationTestResult {
  testName: string;
  passed: boolean;
  details: string;
  duration: number;
}

/**
 * 集成测试套件
 */
export class IntegrationTestSuite {
  private results: IntegrationTestResult[] = [];
  private eventLog: string[] = [];

  /**
   * 运行所有集成测试
   */
  runAll(): IntegrationTestResult[] {
    console.log('========== 开始集成测试 ==========');

    // 清空事件日志
    this.eventLog = [];

    // 绑定事件监听
    this.bindEventListeners();

    // 运行测试
    this.testGameInitialization();
    this.testLevelLoading();
    this.testSingleRiderLevel();
    this.testMultiRiderLevel();
    this.testVIPLevel();
    this.testUrgentLevel();
    this.testTrafficLightLevel();
    this.testCollisionLevel();
    this.testSceneFlow();

    // 输出结果
    this.printResults();

    return this.results;
  }

  /**
   * 绑定事件监听器
   */
  private bindEventListeners(): void {
    EventBus.on(GameEventType.LEVEL_START, (levelId: number) => {
      this.eventLog.push(`LEVEL_START:${levelId}`);
    });

    EventBus.on(GameEventType.RIDER_START_MOVE, (rider: Rider) => {
      this.eventLog.push(`RIDER_START_MOVE:${rider.id}`);
    });

    EventBus.on(GameEventType.RIDER_DELIVERED, (rider: Rider) => {
      this.eventLog.push(`RIDER_DELIVERED:${rider.id}`);
    });

    EventBus.on(GameEventType.RIDER_CRASHED, (data: any) => {
      this.eventLog.push(`RIDER_CRASHED:${data.rider1?.id || data.id}`);
    });

    EventBus.on(GameEventType.LEVEL_COMPLETE, (data: any) => {
      this.eventLog.push(`LEVEL_COMPLETE:${data.levelId}`);
    });

    EventBus.on(GameEventType.LEVEL_FAILED, (data: any) => {
      this.eventLog.push(`LEVEL_FAILED:${data.levelId}`);
    });

    EventBus.on('vip-warning', () => {
      this.eventLog.push('VIP_WARNING');
    });
  }

  /**
   * 测试游戏初始化
   */
  testGameInitialization(): void {
    const startTime = Date.now();

    try {
      const controller = new GameLogicController();
      const riders = controller.getRiders();

      this.recordTest('游戏初始化', true, `GameLogicController创建成功，骑手数量${riders.length}`, Date.now() - startTime);
    } catch (error: any) {
      this.recordTest('游戏初始化', false, `初始化失败: ${error.message}`, Date.now() - startTime);
    }
  }

  /**
   * 测试关卡加载
   */
  testLevelLoading(): void {
    const startTime = Date.now();

    try {
      const levelConfig = this.createTestLevelConfig(1);
      const level = new Level(levelConfig);

      this.recordTest('关卡加载', true, `关卡${level.id}加载成功，骑手${level.riders.length}个`, Date.now() - startTime);
    } catch (error: any) {
      this.recordTest('关卡加载', false, `加载失败: ${error.message}`, Date.now() - startTime);
    }
  }

  /**
   * 测试单骑手关卡
   */
  testSingleRiderLevel(): void {
    const startTime = Date.now();
    this.eventLog = [];

    try {
      const controller = new GameLogicController();
      const levelConfig = this.createTestLevelConfig(1);
      const level = new Level(levelConfig);

      controller.setLevel(level);
      level.start();

      // 选择骑手出发
      const riderId = (level.riders[0] as Rider).id;
      const selected = controller.selectRider(riderId);

      if (!selected) {
        this.recordTest('单骑手关卡', false, '骑手出发失败', Date.now() - startTime);
        return;
      }

      // 模拟游戏循环
      let iterations = 0;
      const maxIterations = 100;

      while (iterations < maxIterations && level.state === LevelState.RUNNING) {
        controller.update(0.1);
        iterations++;
      }

      // 检查结果
      const delivered = controller.getDeliveredCount();
      const total = controller.getTotalRiders();

      this.recordTest(
        '单骑手关卡',
        delivered === total && level.state === LevelState.SUCCESS,
        `送达${delivered}/${total}, 状态${level.state}, 迭代${iterations}次`,
        Date.now() - startTime
      );
    } catch (error: any) {
      this.recordTest('单骑手关卡', false, `测试失败: ${error.message}`, Date.now() - startTime);
    }
  }

  /**
   * 测试多骑手关卡
   */
  testMultiRiderLevel(): void {
    const startTime = Date.now();
    this.eventLog = [];

    try {
      const controller = new GameLogicController();
      const levelConfig = this.createMultiRiderLevelConfig(2, 4);
      const level = new Level(levelConfig);

      controller.setLevel(level);
      level.start();

      // 依次让骑手出发
      const riders = controller.getRiders();

      for (const rider of riders) {
        const selected = controller.selectRider(rider.id);
        if (selected) {
          // 等待送达后再出发下一个
          let iterations = 0;
          while (iterations < 50 && rider.state !== RiderState.SUCCESS && rider.state !== RiderState.CRASHED) {
            controller.update(0.1);
            iterations++;
          }
        }
      }

      const delivered = controller.getDeliveredCount();
      const total = controller.getTotalRiders();

      this.recordTest(
        '多骑手关卡',
        delivered === total,
        `送达${delivered}/${total}, 事件日志${this.eventLog.length}条`,
        Date.now() - startTime
      );
    } catch (error: any) {
      this.recordTest('多骑手关卡', false, `测试失败: ${error.message}`, Date.now() - startTime);
    }
  }

  /**
   * 测试VIP关卡
   */
  testVIPLevel(): void {
    const startTime = Date.now();
    this.eventLog = [];

    try {
      const controller = new GameLogicController();
      const levelConfig = this.createVIPLevelConfig(3);
      const level = new Level(levelConfig);

      controller.setLevel(level);
      level.start();

      const riders = controller.getRiders();
      const vipRider = riders.find(r => r.type === RiderType.VIP) as Rider;
      const normalRider = riders.find(r => r.type === RiderType.NORMAL) as Rider;

      // 先尝试让普通骑手出发（应该失败）
      const normalSelected = controller.selectRider(normalRider.id);

      if (normalSelected) {
        this.recordTest('VIP关卡', false, 'VIP规则未生效，普通骑手不应能先出发', Date.now() - startTime);
        return;
      }

      // 检查VIP警告事件
      if (!this.eventLog.includes('VIP_WARNING')) {
        this.recordTest('VIP关卡', false, '未触发VIP警告事件', Date.now() - startTime);
        return;
      }

      // 让VIP先出发
      controller.selectRider(vipRider.id);

      let iterations = 0;
      while (iterations < 50 && vipRider.state !== RiderState.SUCCESS) {
        controller.update(0.1);
        iterations++;
      }

      // VIP送达后，普通骑手可以出发
      controller.selectRider(normalRider.id);

      iterations = 0;
      while (iterations < 50 && normalRider.state !== RiderState.SUCCESS) {
        controller.update(0.1);
        iterations++;
      }

      const delivered = controller.getDeliveredCount();

      this.recordTest(
        'VIP关卡',
        delivered === 2 && vipRider.hasDelivered && normalRider.hasDelivered,
        `VIP先送达验证成功，共送达${delivered}个`,
        Date.now() - startTime
      );
    } catch (error: any) {
      this.recordTest('VIP关卡', false, `测试失败: ${error.message}`, Date.now() - startTime);
    }
  }

  /**
   * 测试加急关卡
   */
  testUrgentLevel(): void {
    const startTime = Date.now();

    try {
      const controller = new GameLogicController();
      const levelConfig = this.createUrgentLevelConfig(4, 5);
      const level = new Level(levelConfig);

      controller.setLevel(level);
      level.start();

      const riders = controller.getRiders();
      const urgentRider = riders.find(r => r.type === RiderType.URGENT) as Rider;

      // 立即出发加急骑手
      controller.selectRider(urgentRider.id);

      // 模拟快速送达（在时限内）
      let iterations = 0;
      while (iterations < 30 && urgentRider.state !== RiderState.SUCCESS) {
        controller.update(0.1);
        iterations++;
      }

      const result = urgentRider.state === RiderState.SUCCESS;

      this.recordTest(
        '加急关卡',
        result,
        `加急骑手${urgentRider.id}状态: ${urgentRider.state}, 时间剩余: ${urgentRider.timeRemaining}`,
        Date.now() - startTime
      );
    } catch (error: any) {
      this.recordTest('加急关卡', false, `测试失败: ${error.message}`, Date.now() - startTime);
    }
  }

  /**
   * 测试红绿灯关卡
   */
  testTrafficLightLevel(): void {
    const startTime = Date.now();
    this.eventLog = [];

    try {
      const controller = new GameLogicController();
      const levelConfig = this.createTrafficLightLevelConfig(5);
      const level = new Level(levelConfig);

      controller.setLevel(level);
      level.start();

      const riders = controller.getRiders();

      // 骑手出发
      controller.selectRider(riders[0].id);

      // 等待红绿灯切换
      let iterations = 0;
      let sawWaiting = false;

      while (iterations < 100 && riders[0].state !== RiderState.SUCCESS) {
        controller.update(0.1);

        if (riders[0].state === RiderState.WAITING) {
          sawWaiting = true;
        }

        iterations++;
      }

      this.recordTest(
        '红绿灯关卡',
        riders[0].state === RiderState.SUCCESS,
        `骑手状态: ${riders[0].state}, 是否等待红灯: ${sawWaiting}`,
        Date.now() - startTime
      );
    } catch (error: any) {
      this.recordTest('红绿灯关卡', false, `测试失败: ${error.message}`, Date.now() - startTime);
    }
  }

  /**
   * 测试碰撞关卡
   */
  testCollisionLevel(): void {
    const startTime = Date.now();
    this.eventLog = [];

    try {
      const controller = new GameLogicController();
      const levelConfig = this.createCollisionLevelConfig(6);
      const level = new Level(levelConfig);

      controller.setLevel(level);
      level.start();

      const riders = controller.getRiders();

      // 同时出发两个骑手（会碰撞）
      controller.selectRider(riders[0].id);
      controller.selectRider(riders[1].id);

      // 等待碰撞
      let iterations = 0;
      while (iterations < 50) {
        controller.update(0.1);
        iterations++;

        if (this.eventLog.some(e => e.includes('CRASHED'))) {
          break;
        }
      }

      const hasCrashEvent = this.eventLog.some(e => e.includes('CRASHED'));

      this.recordTest(
        '碰撞关卡',
        hasCrashEvent,
        `碰撞检测: ${hasCrashEvent ? '触发' : '未触发'}, 事件日志${this.eventLog.length}条`,
        Date.now() - startTime
      );
    } catch (error: any) {
      this.recordTest('碰撞关卡', false, `测试失败: ${error.message}`, Date.now() - startTime);
    }
  }

  /**
   * 测试场景流程
   */
  testSceneFlow(): void {
    const startTime = Date.now();

    try {
      const sceneManager = SceneManager.getInstance();

      // 测试场景切换
      sceneManager.toMenu();
      const menuScene = sceneManager.getCurrentScene();

      sceneManager.toLevelSelect();
      const levelSelectScene = sceneManager.getCurrentScene();

      sceneManager.toGame(1);
      const gameScene = sceneManager.getCurrentScene();

      // 测试返回
      sceneManager.back();
      const backScene = sceneManager.getCurrentScene();

      this.recordTest(
        '场景流程',
        menuScene === SceneType.MENU && levelSelectScene === SceneType.LEVEL_SELECT &&
        gameScene === SceneType.GAME && backScene === SceneType.LEVEL_SELECT,
        `场景切换: Menu -> LevelSelect -> Game -> Back`,
        Date.now() - startTime
      );
    } catch (error: any) {
      this.recordTest('场景流程', false, `测试失败: ${error.message}`, Date.now() - startTime);
    }
  }

  // ========== 测试关卡配置生成 ==========

  /**
   * 创建简单测试关卡
   */
  private createTestLevelConfig(levelId: number): any {
    return {
      id: levelId,
      name: '测试关卡',
      difficulty: 'easy',
      gridSize: { width: 6, height: 4 },
      timeLimit: 0,
      riders: [
        { id: 'r1', type: 'NORMAL', direction: 'RIGHT', startPosition: { x: 0, y: 0 }, targetExit: 'exit1' }
      ],
      obstacles: [],
      exits: [
        { id: 'exit1', position: { x: 5, y: 0 } }
      ],
      mapTheme: 'city'
    };
  }

  /**
   * 创建多骑手测试关卡
   */
  private createMultiRiderLevelConfig(levelId: number, riderCount: number): any {
    const riders = [];
    const exits = [];

    for (let i = 0; i < riderCount; i++) {
      riders.push({
        id: `r${i + 1}`,
        type: 'NORMAL',
        direction: 'RIGHT',
        startPosition: { x: 0, y: i },
        targetExit: `exit${i + 1}`
      });

      exits.push({
        id: `exit${i + 1}`,
        position: { x: 5, y: i }
      });
    }

    return {
      id: levelId,
      name: '多骑手测试',
      difficulty: 'easy',
      gridSize: { width: 6, height: riderCount },
      timeLimit: 0,
      riders,
      obstacles: [],
      exits,
      mapTheme: 'city'
    };
  }

  /**
   * 创建VIP测试关卡
   */
  private createVIPLevelConfig(levelId: number): any {
    return {
      id: levelId,
      name: 'VIP测试',
      difficulty: 'medium',
      gridSize: { width: 6, height: 2 },
      timeLimit: 0,
      riders: [
        { id: 'vip1', type: 'VIP', direction: 'RIGHT', startPosition: { x: 0, y: 0 }, targetExit: 'exit1' },
        { id: 'r1', type: 'NORMAL', direction: 'RIGHT', startPosition: { x: 0, y: 1 }, targetExit: 'exit2' }
      ],
      obstacles: [],
      exits: [
        { id: 'exit1', position: { x: 5, y: 0 } },
        { id: 'exit2', position: { x: 5, y: 1 } }
      ],
      mapTheme: 'city'
    };
  }

  /**
   * 创建加急测试关卡
   */
  private createUrgentLevelConfig(levelId: number, timeLimit: number): any {
    return {
      id: levelId,
      name: '加急测试',
      difficulty: 'medium',
      gridSize: { width: 6, height: 1 },
      timeLimit: 0,
      riders: [
        { id: 'urgent1', type: 'URGENT', direction: 'RIGHT', startPosition: { x: 0, y: 0 }, targetExit: 'exit1', timeLimit }
      ],
      obstacles: [],
      exits: [
        { id: 'exit1', position: { x: 5, y: 0 } }
      ],
      mapTheme: 'city'
    };
  }

  /**
   * 创建红绿灯测试关卡
   */
  private createTrafficLightLevelConfig(levelId: number): any {
    return {
      id: levelId,
      name: '红绿灯测试',
      difficulty: 'medium',
      gridSize: { width: 8, height: 1 },
      timeLimit: 0,
      riders: [
        { id: 'r1', type: 'NORMAL', direction: 'RIGHT', startPosition: { x: 0, y: 0 }, targetExit: 'exit1' }
      ],
      obstacles: [
        { id: 'light1', type: 'TRAFFIC_LIGHT', position: { x: 3, y: 0 }, size: { width: 1, height: 1 }, lightCycle: 3 }
      ],
      exits: [
        { id: 'exit1', position: { x: 7, y: 0 } }
      ],
      mapTheme: 'city'
    };
  }

  /**
   * 创建碰撞测试关卡
   */
  private createCollisionLevelConfig(levelId: number): any {
    return {
      id: levelId,
      name: '碰撞测试',
      difficulty: 'easy',
      gridSize: { width: 8, height: 1 },
      timeLimit: 0,
      riders: [
        { id: 'r1', type: 'NORMAL', direction: 'RIGHT', startPosition: { x: 0, y: 0 }, targetExit: 'exit1' },
        { id: 'r2', type: 'NORMAL', direction: 'LEFT', startPosition: { x: 7, y: 0 }, targetExit: 'exit2' }
      ],
      obstacles: [],
      exits: [
        { id: 'exit1', position: { x: 7, y: 0 } },
        { id: 'exit2', position: { x: 0, y: 0 } }
      ],
      mapTheme: 'city'
    };
  }

  // ========== 辅助方法 ==========

  /**
   * 记录测试结果
   */
  private recordTest(testName: string, passed: boolean, details: string, duration: number): void {
    this.results.push({ testName, passed, details, duration });
  }

  /**
   * 输出测试结果
   */
  private printResults(): void {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;

    console.log('\n========== 集成测试结果 ==========');
    this.results.forEach(r => {
      const status = r.passed ? '✓' : '✗';
      console.log(`${status} ${r.testName}: ${r.details} (${r.duration}ms)`);
    });

    console.log(`\n总计: ${passed}/${total} 通过`);
    console.log('========== 集成测试结束 ==========\n');

    // 输出事件日志
    if (this.eventLog.length > 0) {
      console.log('事件日志:');
      this.eventLog.forEach(e => console.log(`  - ${e}`));
    }
  }
}

/**
 * 运行集成测试
 */
export function runIntegrationTests(): IntegrationTestResult[] {
  const suite = new IntegrationTestSuite();
  return suite.runAll();
}