/**
 * 性能压力测试
 * @description 测试游戏在大规模骑手和障碍物下的性能表现
 * @version v0.1.0
 * @since 2026-04-25
 */

import { GameLogicController } from '../core/GameLogicController';
import { Level, LevelState } from '../core/Level';
import { Rider, RiderState, RiderType, Direction } from '../core/Rider';
import { Obstacle, ObstacleType, TrafficLightState } from '../core/Obstacle';
import { CollisionDetector } from '../core/CollisionDetector';

/** 性能测试结果 */
interface PerformanceResult {
  testName: string;
  riderCount: number;
  obstacleCount: number;
  iterations: number;
  totalTimeMs: number;
  avgIterationTimeMs: number;
  fps: number;
  passed: boolean;
  threshold: string;
}

/**
 * 性能测试套件
 */
export class PerformanceTestSuite {
  private results: PerformanceResult[] = [];

  /** 性能阈值配置 */
  private thresholds = {
    minFps: 50,         // 最低帧率
    maxIterationMs: 20, // 最大单次迭代时间
    maxTotalMs: 5000    // 最大总时间（5秒）
  };

  /**
   * 运行所有性能测试
   */
  runAll(): PerformanceResult[] {
    console.log('========== 开始性能压力测试 ==========');

    // 基础性能测试
    this.testBaseline();
    this.test10Riders();
    this.test20Riders();
    this.test50Riders();

    // 障碍物性能测试
    this.testManyObstacles();
    this.testTrafficLights();

    // 极端场景测试
    this.testExtremeLevel();
    this.testContinuousUpdate();

    // 输出结果
    this.printResults();

    return this.results;
  }

  /**
   * 基础性能测试
   */
  testBaseline(): void {
    const levelConfig = this.createLevelConfig(1, 2, 0);
    this.runPerformanceTest('基准测试', levelConfig, 100);
  }

  /**
   * 10骑手测试
   */
  test10Riders(): void {
    const levelConfig = this.createLevelConfig(2, 10, 3);
    this.runPerformanceTest('10骑手测试', levelConfig, 200);
  }

  /**
   * 20骑手测试
   */
  test20Riders(): void {
    const levelConfig = this.createLevelConfig(3, 20, 5);
    this.runPerformanceTest('20骑手测试', levelConfig, 300);
  }

  /**
   * 50骑手测试
   */
  test50Riders(): void {
    const levelConfig = this.createLevelConfig(4, 50, 10);
    this.runPerformanceTest('50骑手测试', levelConfig, 500);
  }

  /**
   * 多障碍物测试
   */
  testManyObstacles(): void {
    const levelConfig = this.createLevelConfig(5, 10, 50);
    this.runPerformanceTest('50障碍物测试', levelConfig, 200);
  }

  /**
   * 红绿灯压力测试
   */
  testTrafficLights(): void {
    const levelConfig = this.createTrafficLightLevel(6, 10, 20);
    this.runPerformanceTest('20红绿灯测试', levelConfig, 300);
  }

  /**
   * 极端场景测试（模拟传奇关卡）
   */
  testExtremeLevel(): void {
    const levelConfig = this.createLevelConfig(7, 12, 8);
    this.runPerformanceTest('极端场景(12骑手+8障碍)', levelConfig, 500);
  }

  /**
   * 连续更新测试
   */
  testContinuousUpdate(): void {
    const levelConfig = this.createLevelConfig(8, 10, 5);
    this.runPerformanceTest('连续更新(1000次)', levelConfig, 1000);
  }

  /**
   * 运行性能测试
   */
  private runPerformanceTest(
    testName: string,
    levelConfig: any,
    iterations: number
  ): void {
    const controller = new GameLogicController();
    const level = new Level(levelConfig);

    controller.setLevel(level);
    level.start();

    // 让所有骑手出发
    const riders = controller.getRiders();
    riders.forEach(r => controller.selectRider(r.id));

    // 性能计时
    const startTime = Date.now();
    const iterationTimes: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const iterStart = Date.now();

      controller.update(0.016); // 模拟60FPS的dt

      const iterTime = Date.now() - iterStart;
      iterationTimes.push(iterTime);
    }

    const totalTime = Date.now() - startTime;
    const avgIterationTime = totalTime / iterations;
    const fps = 1000 / avgIterationTime;

    // 判断是否通过
    const passed = fps >= this.thresholds.minFps &&
      avgIterationTime <= this.thresholds.maxIterationMs &&
      totalTime <= this.thresholds.maxTotalMs;

    this.results.push({
      testName,
      riderCount: riders.length,
      obstacleCount: level.obstacles.length,
      iterations,
      totalTimeMs: totalTime,
      avgIterationTimeMs: avgIterationTime,
      fps: Math.round(fps),
      passed,
      threshold: `FPS>=${this.thresholds.minFps}, 迭代<=${this.thresholds.maxIterationMs}ms`
    });
  }

  /**
   * 创建测试关卡配置
   */
  private createLevelConfig(levelId: number, riderCount: number, obstacleCount: number): any {
    const gridWidth = Math.max(10, riderCount + 2);
    const gridHeight = Math.max(6, Math.ceil(riderCount / 5));

    const riders = [];
    const exits = [];
    const obstacles = [];

    // 创建骑手
    for (let i = 0; i < riderCount; i++) {
      const row = Math.floor(i / 5);
      const col = i % 5;

      riders.push({
        id: `r${i + 1}`,
        type: i % 10 === 0 ? 'VIP' : (i % 5 === 0 ? 'URGENT' : 'NORMAL'),
        direction: 'RIGHT',
        startPosition: { x: col, y: row },
        targetExit: `exit${i + 1}`,
        timeLimit: i % 5 === 0 ? 30 : undefined
      });

      exits.push({
        id: `exit${i + 1}`,
        position: { x: gridWidth - 1, y: row }
      });
    }

    // 创建障碍物
    for (let i = 0; i < obstacleCount; i++) {
      const row = Math.floor(i / 5);
      const col = (i % 5) + 6;

      obstacles.push({
        id: `o${i + 1}`,
        type: i % 3 === 0 ? 'WALL' : (i % 3 === 1 ? 'TRAFFIC' : 'TRAFFIC_LIGHT'),
        position: { x: col, y: row },
        size: { width: 1, height: 1 },
        slowFactor: i % 3 === 1 ? 0.5 : undefined,
        lightCycle: i % 3 === 2 ? 3 : undefined
      });
    }

    return {
      id: levelId,
      name: `性能测试${levelId}`,
      difficulty: 'expert',
      gridSize: { width: gridWidth, height: gridHeight },
      timeLimit: 300,
      riders,
      obstacles,
      exits,
      mapTheme: 'city'
    };
  }

  /**
   * 创建红绿灯密集关卡
   */
  private createTrafficLightLevel(levelId: number, riderCount: number, lightCount: number): any {
    const gridWidth = 20;
    const gridHeight = 10;

    const riders = [];
    const exits = [];
    const obstacles = [];

    // 创建骑手
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
        position: { x: gridWidth - 1, y: i }
      });
    }

    // 创建红绿灯
    for (let i = 0; i < lightCount; i++) {
      obstacles.push({
        id: `light${i + 1}`,
        type: 'TRAFFIC_LIGHT',
        position: { x: (i % 10) + 2, y: Math.floor(i / 10) },
        size: { width: 1, height: 1 },
        lightCycle: 2
      });
    }

    return {
      id: levelId,
      name: `红绿灯密集测试`,
      difficulty: 'expert',
      gridSize: { width: gridWidth, height: gridHeight },
      timeLimit: 300,
      riders,
      obstacles,
      exits,
      mapTheme: 'commercial'
    };
  }

  /**
   * 输出测试结果
   */
  private printResults(): void {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;

    console.log('\n========== 性能测试结果 ==========');
    console.log('阈值标准: FPS>=50, 单次迭代<=20ms, 总时间<=5s\n');

    console.log('| 测试名称 | 韦手数 | 阻碍数 | 迭代次数 | 总时间(ms) | 平均迭代(ms) | FPS | 结果 |');
    console.log('|----------|--------|--------|----------|------------|--------------|-----|------|');

    this.results.forEach(r => {
      const status = r.passed ? '✓ PASS' : '✗ FAIL';
      console.log(`| ${r.testName} | ${r.riderCount} | ${r.obstacleCount} | ${r.iterations} | ${r.totalTimeMs} | ${r.avgIterationTimeMs.toFixed(2)} | ${r.fps} | ${status} |`);
    });

    console.log(`\n总计: ${passed}/${total} 通过`);

    // 性能评估
    const avgFps = this.results.reduce((sum, r) => sum + r.fps, 0) / total;
    console.log(`平均FPS: ${Math.round(avgFps)}`);

    if (passed === total) {
      console.log('\n性能评估: ★★★★★ 优秀');
    } else if (passed >= total * 0.8) {
      console.log('\n性能评估: ★★★★☆ 良好');
    } else if (passed >= total * 0.6) {
      console.log('\n性能评估: ★★★☆☆ 一般');
    } else {
      console.log('\n性能评估: ★★☆☆☆ 需优化');
    }

    console.log('========== 性能测试结束 ==========\n');
  }
}

/**
 * 运行性能测试
 */
export function runPerformanceTests(): PerformanceResult[] {
  const suite = new PerformanceTestSuite();
  return suite.runAll();
}