/**
 * 核心类测试用例
 * @description 测试 Rider、Obstacle、Level、CollisionDetector 的核心逻辑
 * @version v0.1.0
 * @since 2026-04-25
 */

import { Rider, RiderState, RiderType, Direction } from '../core/Rider';
import { Obstacle, ObstacleType, TrafficLightState } from '../core/Obstacle';
import { Level, LevelState } from '../core/Level';
import { CollisionDetector, CollisionType } from '../core/CollisionDetector';
import { StoryManager } from '../utils/StoryManager';
import storyData from '../data/story.json';

/**
 * 测试结果
 */
interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

/**
 * 测试套件
 */
class TestSuite {
  private results: TestResult[] = [];

  /**
   * 运行所有测试
   */
  runAll(): TestResult[] {
    console.log('========== 开始核心类测试 ==========');

    // Rider 测试
    this.testRiderCreation();
    this.testRiderMovement();
    this.testRiderCollision();
    this.testCollisionBetweenRiders();
    this.testRiderVIP();
    this.testRiderUrgent();

    // Obstacle 测试
    this.testObstacleCreation();
    this.testTrafficLightCycle();

    // Level 测试
    this.testLevelCreation();
    this.testLevelVictory();
    this.testLevelFailure();

    // CollisionDetector 测试
    this.testBoundaryCollision();
    this.testObstacleCollision();
    this.testExitCollision();
    this.testRiderCollision();

    // StoryManager 测试
    this.testStoryManagerInit();
    this.testStoryManagerChapter();
    this.testStoryManagerLevelStory();
    this.testStoryManagerMessages();

    // 输出结果
    this.printResults();

    return this.results;
  }

  // ========== Rider 测试 ==========

  testRiderCreation(): void {
    const rider = new Rider({
      id: 'r1',
      type: RiderType.NORMAL,
      direction: Direction.RIGHT,
      startPosition: { x: 1, y: 1 },
      targetExit: 'exit1'
    });

    this.assert('Rider创建', rider.id === 'r1', `ID应为r1，实际${rider.id}`);
    this.assert('Rider初始状态', rider.state === RiderState.IDLE, `初始状态应为IDLE`);
    this.assert('Rider位置', rider.position.x === 1 && rider.position.y === 1, '初始位置应为(1,1)');
    this.assert('Rider方向', rider.direction === Direction.RIGHT, '方向应为RIGHT');
  }

  testRiderMovement(): void {
    const rider = new Rider({
      id: 'r2',
      type: RiderType.NORMAL,
      direction: Direction.RIGHT,
      startPosition: { x: 0, y: 0 },
      targetExit: 'exit1',
      speed: 2
    });

    rider.startMove();
    this.assert('Rider开始移动', rider.state === RiderState.MOVING, '状态应为MOVING');

    rider.update(0.5);
    this.assert('Rider位置更新', rider.position.x === 1, `0.5秒后x应为1，实际${rider.position.x}`);
  }

  testRiderCollision(): void {
    const rider = new Rider({
      id: 'r3',
      type: RiderType.NORMAL,
      direction: Direction.RIGHT,
      startPosition: { x: 0, y: 0 },
      targetExit: 'exit1'
    });

    rider.startMove();
    rider.handleCollision({ type: CollisionType.OBSTACLE, target: null, position: { x: 1, y: 0 } });

    this.assert('Rider碰撞处理', rider.state === RiderState.CRASHED, '碰撞后状态应为CRASHED');
  }

  testRiderVIP(): void {
    const vip = new Rider({
      id: 'vip1',
      type: RiderType.VIP,
      direction: Direction.RIGHT,
      startPosition: { x: 0, y: 0 },
      targetExit: 'exit1'
    });

    this.assert('VIP类型', vip.type === RiderType.VIP, 'VIP类型正确');
    this.assert('VIP表情', vip.currentExpression === 'normal', 'VIP表情默认normal');
  }

  testRiderUrgent(): void {
    const urgent = new Rider({
      id: 'urgent1',
      type: RiderType.URGENT,
      direction: Direction.RIGHT,
      startPosition: { x: 0, y: 0 },
      targetExit: 'exit1',
      timeLimit: 10
    });

    this.assert('加急时限', urgent.timeLimit === 10, `时限应为10，实际${urgent.timeLimit}`);

    // 模拟时间流逝
    urgent.startMove();
    urgent.update(8);
    this.assert('加急剩余时间', urgent.timeRemaining === 2, `剩余时间应为2，实际${urgent.timeRemaining}`);
  }

  // ========== Obstacle 测试 ==========

  testObstacleCreation(): void {
    const wall = new Obstacle({
      id: 'o1',
      type: ObstacleType.WALL,
      position: { x: 2, y: 2 },
      size: { width: 1, height: 1 }
    });

    this.assert('障碍创建', wall.id === 'o1', '障碍ID正确');
    this.assert('障碍位置', wall.position.x === 2 && wall.position.y === 2, '障碍位置正确');
    this.assert('墙壁类型', wall.type === ObstacleType.WALL, '墙壁类型正确');
  }

  testTrafficLightCycle(): void {
    const light = new Obstacle({
      id: 'light1',
      type: ObstacleType.TRAFFIC_LIGHT,
      position: { x: 3, y: 3 },
      size: { width: 1, height: 1 },
      lightCycle: 3
    });

    // 初始红灯
    this.assert('红绿灯初始', light.lightState === TrafficLightState.RED, '初始应为红灯');

    // 等待3秒
    light.update(3);
    this.assert('红绿灯切换', light.lightState === TrafficLightState.GREEN, '3秒后应为绿灯');

    // 再等3秒
    light.update(3);
    this.assert('红绿灯循环', light.lightState === TrafficLightState.RED, '6秒后应为红灯');
  }

  // ========== Level 测试 ==========

  testLevelCreation(): void {
    const levelConfig: any = {
      id: 1,
      name: '测试关卡',
      difficulty: 'easy',
      gridSize: { width: 6, height: 4 },
      timeLimit: 60,
      riders: [
        { id: 'r1', type: 'NORMAL', direction: 'RIGHT', startPosition: { x: 0, y: 0 }, targetExit: 'exit1' }
      ],
      obstacles: [],
      exits: [
        { id: 'exit1', position: { x: 5, y: 0 } }
      ]
    };

    const level = new Level(levelConfig);

    this.assert('关卡创建', level.id === 1, '关卡ID正确');
    this.assert('关卡骑手', level.riders.length === 1, '骑手数量应为1');
    this.assert('关卡出口', level.exits.length === 1, '出口数量应为1');
    this.assert('关卡状态', level.state === LevelState.READY, '初始状态应为READY');
  }

  testLevelVictory(): void {
    const levelConfig: any = {
      id: 2,
      name: '胜利测试',
      difficulty: 'easy',
      gridSize: { width: 6, height: 4 },
      timeLimit: 60,
      riders: [
        { id: 'r1', type: 'NORMAL', direction: 'RIGHT', startPosition: { x: 0, y: 0 }, targetExit: 'exit1' }
      ],
      obstacles: [],
      exits: [
        { id: 'exit1', position: { x: 5, y: 0 } }
      ]
    };

    const level = new Level(levelConfig);
    level.start();

    // 模拟送达
    level.deliveredCount = 1;

    level.update(0);
    this.assert('胜利判定', level.state === LevelState.SUCCESS, '送达后状态应为SUCCESS');
  }

  testLevelFailure(): void {
    const levelConfig: any = {
      id: 3,
      name: '失败测试',
      difficulty: 'easy',
      gridSize: { width: 6, height: 4 },
      timeLimit: 30,
      riders: [
        { id: 'r1', type: 'NORMAL', direction: 'RIGHT', startPosition: { x: 0, y: 0 }, targetExit: 'exit1' }
      ],
      obstacles: [],
      exits: [
        { id: 'exit1', position: { x: 5, y: 0 } }
      ]
    };

    const level = new Level(levelConfig);
    level.start();

    // 模拟时间耗尽
    level.timeRemaining = 0;
    level.update(0);

    this.assert('失败判定', level.state === LevelState.FAILED, '时间耗尽状态应为FAILED');
  }

  // ========== CollisionDetector 测试 ==========

  testBoundaryCollision(): void {
    const detector = new CollisionDetector();
    const rider = new Rider({
      id: 'r1',
      type: RiderType.NORMAL,
      direction: Direction.RIGHT,
      startPosition: { x: 5, y: 0 },
      targetExit: 'exit1',
      speed: 1
    });

    rider.startMove();
    rider.update(1); // 位置变为 (6, 0)

    const gridSize = { width: 5, height: 4 };
    const result = detector.checkRiderCollision(rider, [], [], [], gridSize);

    this.assert('边界碰撞', result.type === CollisionType.BOUNDARY, '超出边界应检测到BOUNDARY');
  }

  testObstacleCollision(): void {
    const detector = new CollisionDetector();
    const rider = new Rider({
      id: 'r1',
      type: RiderType.NORMAL,
      direction: Direction.RIGHT,
      startPosition: { x: 0, y: 0 },
      targetExit: 'exit1',
      speed: 1
    });

    const wall = new Obstacle({
      id: 'o1',
      type: ObstacleType.WALL,
      position: { x: 1, y: 0 },
      size: { width: 1, height: 1 }
    });

    rider.startMove();
    rider.update(0.9); // 位置接近 (1, 0)

    const gridSize = { width: 6, height: 4 };
    const result = detector.checkRiderCollision(rider, [wall], [], [], gridSize);

    this.assert('障碍碰撞', result.type === CollisionType.OBSTACLE, '撞墙应检测到OBSTACLE');
  }

  testExitCollision(): void {
    const detector = new CollisionDetector();
    const rider = new Rider({
      id: 'r1',
      type: RiderType.NORMAL,
      direction: Direction.RIGHT,
      startPosition: { x: 4, y: 0 },
      targetExit: 'exit1',
      speed: 1
    });

    const exit = { id: 'exit1', position: { x: 5, y: 0 } };

    rider.startMove();
    rider.update(1); // 位置变为 (5, 0)

    const gridSize = { width: 6, height: 4 };
    const result = detector.checkRiderCollision(rider, [], [], [exit], gridSize);

    this.assert('出口碰撞', result.type === CollisionType.EXIT, '到达出口应检测到EXIT');
  }

  testCollisionBetweenRiders(): void {
    const detector = new CollisionDetector();

    const rider1 = new Rider({
      id: 'r1',
      type: RiderType.NORMAL,
      direction: Direction.RIGHT,
      startPosition: { x: 0, y: 0 },
      targetExit: 'exit1',
      speed: 1
    });

    const rider2 = new Rider({
      id: 'r2',
      type: RiderType.NORMAL,
      direction: Direction.LEFT,
      startPosition: { x: 2, y: 0 },
      targetExit: 'exit2',
      speed: 1
    });

    rider1.startMove();
    rider2.startMove();

    rider1.update(0.5);
    rider2.update(0.5);

    rider1.update(0.5);
    rider2.update(0.5);

    const gridSize = { width: 6, height: 4 };
    const result = detector.checkRiderCollision(rider1, [], [rider2], [], gridSize);

    this.assert('骑手碰撞', result.type === CollisionType.RIDER, '骑手相撞应检测到RIDER');
  }

  // ========== StoryManager 测试 ==========

  testStoryManagerInit(): void {
    const manager = StoryManager.getInstance();
    manager.loadData(storyData as any);

    this.assert('故事管理器初始化', manager !== null, 'StoryManager应成功初始化');
    this.assert('世界观数据', manager.getWorld() !== null, '应有世界观数据');
  }

  testStoryManagerChapter(): void {
    const manager = StoryManager.getInstance();

    const chapter1 = manager.getCurrentChapter(1);
    this.assert('获取章节1', chapter1?.id === 1, '关卡1应在第1章');

    const chapter2 = manager.getCurrentChapter(11);
    this.assert('获取章节2', chapter2?.id === 2, '关卡11应在第2章');

    const introLevels = manager.getChapterIntroLevels();
    this.assert('章节首关列表', introLevels.includes(1) && introLevels.includes(11), '应包含章节首关ID');
  }

  testStoryManagerLevelStory(): void {
    const manager = StoryManager.getInstance();

    const story1 = manager.getLevelStory(1);
    this.assert('关卡1剧情', story1 !== null && story1.characters.length > 0, '关卡1应有剧情');

    const noStory = manager.getLevelStory(99);
    this.assert('无剧情关卡', noStory === null, '关卡99应无剧情');
  }

  testStoryManagerMessages(): void {
    const manager = StoryManager.getInstance();

    const successMsg = manager.getSuccessMessage(1);
    this.assert('胜利文案', successMsg.length > 0, '应有胜利文案');

    const failMsg = manager.getFailMessage(1, 'collision');
    this.assert('失败文案', failMsg.length > 0, '应有失败文案');

    // 测试开关功能
    manager.setStoryEnabled(false);
    this.assert('故事关闭', !manager.isStoryEnabled(), '故事开关应可关闭');

    manager.setStoryEnabled(true);
    this.assert('故事开启', manager.isStoryEnabled(), '故事开关应可开启');
  }

  // ========== 辅助方法 ==========

  assert(name: string, condition: boolean, message: string): void {
    this.results.push({
      name,
      passed: condition,
      message: condition ? 'PASS' : message
    });
  }

  printResults(): void {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;

    console.log('\n========== 测试结果 ==========');
    this.results.forEach(r => {
      const status = r.passed ? '✓' : '✗';
      console.log(`${status} ${r.name}: ${r.message}`);
    });

    console.log(`\n总计: ${passed}/${total} 通过`);
    console.log('========== 测试结束 ==========\n');
  }
}

/**
 * 运行测试
 */
export function runCoreTests(): TestResult[] {
  const suite = new TestSuite();
  return suite.runAll();
}