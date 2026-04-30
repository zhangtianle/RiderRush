## ADDED Requirements

### Requirement: 关卡开始时间记录
游戏系统 SHALL 在关卡开始时记录开始时间，用于计算关卡完成时间和星级评分。

#### Scenario: 正常关卡开始
- **WHEN** 玩家开始新关卡
- **THEN** 系统记录当前时间作为关卡开始时间

#### Scenario: 关卡完成时间计算
- **WHEN** 玩家完成关卡
- **THEN** 系统使用当前时间减去开始时间计算实际完成时间

#### Scenario: 星级评分基于实际时间
- **WHEN** 玩家完成关卡
- **THEN** 星级评分基于实际完成时间而非0秒

### Requirement: dt上限保护
游戏系统 SHALL 限制每帧的最大dt值，防止浏览器后台切换导致的游戏状态异常。

#### Scenario: 正常帧时间
- **WHEN** 游戏以正常帧率运行（60fps）
- **THEN** dt值为实际帧时间（约16ms）

#### Scenario: 浏览器后台切换
- **WHEN** 浏览器标签页被切换到后台再切回
- **THEN** dt值被限制在100ms以内，防止游戏状态跳变

#### Scenario: 设备休眠唤醒
- **WHEN** 设备休眠后唤醒
- **THEN** dt值被限制在100ms以内，防止游戏状态跳变

### Requirement: 统一时间基准
游戏系统 SHALL 使用`performance.now()`作为统一的时间基准，避免`Date.now()`与`performance.now()`混用。

#### Scenario: 关卡耗时统计
- **WHEN** 统计关卡耗时
- **THEN** 使用`performance.now()`而非`Date.now()`

#### Scenario: 连击窗口检测
- **WHEN** 检测连击窗口
- **THEN** 使用`performance.now()`而非`Date.now()`

### Requirement: 广告冷却计时
游戏系统 SHALL 在Web版本中正确递减广告冷却时间。

#### Scenario: 广告冷却递减
- **WHEN** 游戏运行时
- **THEN** 广告冷却时间每帧递减相应的时间量

#### Scenario: 广告冷却结束
- **WHEN** 广告冷却时间递减至0
- **THEN** 广告可以再次展示
