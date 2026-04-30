# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**外卖冲冲冲** (Delivery Rush) — a path-puzzle mini-game where players draw paths and decide the dispatch order of delivery riders so all reach their exits without collisions. Target platforms: WeChat Mini Game, Douyin Mini Game, and Web (Canvas). Monetization: IAA (ads). Built with TypeScript, originally designed for Cocos Creator 3.8 but the current implementation is a standalone TS engine with a Canvas-based web playable version.

## Build & Run Commands

```bash
# Build web bundle (esbuild → web/dist/web.bundle.js)
npm run build:web

# Watch mode (rebuild on file change)
npm run watch:web

# Serve web version at http://localhost:8080
npm run serve:web

# Build + serve (one-shot)
npm run dev:web

# Run core unit tests (ts-node)
npm test
```

No linter is configured. TypeScript compilation is handled by esbuild for web and ts-node for tests. `tsconfig.json` has `strict: false`.

## Architecture

### Core Layer (`src/core/`)

Pure-logic, no-rendering game engine. All core classes use the **Singleton pattern** (accessed via `Class.getInstance()`).

- **GameEngine** — Top-level orchestrator. Manages game state (`GameState` enum), level loading, progress save/load, ad revival flow, combo tracking, and path-drawing integration.
- **GameLogicController** — Per-frame update loop. Handles rider selection, movement, collision resolution, victory/failure detection, path validation, and combo system. The "brain" of gameplay.
- **Level** — A single level instance containing `Rider[]`, `Obstacle[]`, `Exit[]`, grid size, time limit, and victory/failure checks.
- **Rider** — Entity that moves in a fixed `Direction` at a given speed. States: IDLE → MOVING → SUCCESS/CRASHED/WAITING. Special types: `VIP` (must deliver first), `URGENT` (has time limit).
- **Obstacle** — Types: `WALL` (bounce back), `TRAFFIC` (slow zone), `TRAFFIC_LIGHT` (periodic red/green cycle), `GATE`.
- **CollisionDetector** — Grid-based collision checks: boundary, obstacle, rider-rider, and exit detection with configurable tolerance.
- **LevelManager** — Loads level data from JSON, parses string types to enums, creates `Level` instances. Data source: `src/data/levels.json`.
- **EventBus** — Global pub/sub for decoupled communication. Predefined event types in `GameEventType` enum. Supports both instance and static API (`EventBus.emit()` / `EventBus.on()`).
- **PathDrawer** — Handles player drag-to-draw path interaction. Enforces axis-aligned constraint by auto-inserting corner waypoints. Integrates with `PathValidator` for real-time validation during drawing.
- **PathValidator** — Validates drawn paths: start must match rider position, end must be near an exit, axis-aligned segments only, no boundary violations, no wall penetration. Rejects invalid paths with specific error types.
- **LeaderboardManager** — Province-based leaderboard system (34 Chinese provinces). Tracks completion rates and attempt counts per province. Uses deterministic random for mock data generation. Designed for social viral growth.

### Web Layer (`src/web/`)

Canvas-based playable version for browsers.

- **WebGame** — Main game class for web. Owns the `requestAnimationFrame` game loop, manages UI screens (menu, level select, result, fail, leaderboard), binds canvas mouse/touch events for rider selection and path drawing.
- **GameRenderer** — Draws grid, obstacles, riders (color-coded by type/state), exits, direction arrows, path previews, and particle effects to `<canvas>`. Provides `screenToGrid()`/`gridToScreen()` coordinate conversion. Supports screen shake and red flash effects for collision feedback.
- **web-entry.ts** — Entry point for esbuild bundling. Initializes `WebGame` on DOMContentLoaded.

### Web UI (`web/index.html`)

The web version uses a **layered architecture**: `<canvas>` for game rendering + HTML overlay elements for UI. CSS uses pixel-art style (Press Start 2P font). UI screens are toggled via display:none/block — menu, level select, game HUD, result panel, fail panel, and leaderboard panel are all in a single HTML file.

### Data (`src/data/`)

Level definitions in JSON. `levels.json` is the main data file (50 levels). `riders.json`, `obstacles.json`, `quotes.json`, `config.json` are supplementary. Level data uses string enums (`"NORMAL"`, `"RIGHT"`) that `LevelManager.parseRiderData()` converts to TypeScript enums. Tutorial levels are identified by IDs in `GameConstants.TUTORIAL_LEVELS`.

### Types (`src/types/`)

`global.d.ts` declares platform globals: `wx` (WeChat) and `tt` (Douyin) for the mini-game targets.

### Utils (`src/utils/`)

Singleton managers for cross-cutting concerns: `AudioMgr`, `AdMgr`, `StorageMgr`, `ExpressionManager`, `QuoteManager`, `SceneManager`, `PlatformAdapter`. PlatformAdapter abstracts WeChat (`wx`), Douyin (`tt`), and Web (`localStorage`) APIs.

`QuoteManager` manages 200+ localized Chinese rider dialogue lines categorized by scenario: departure, success, crash, waiting, VIP, urgent.

### UI (`src/ui/`)

Cocos Creator-style scene/component stubs (MenuScene, GameScene, LevelSelectScene, etc.). Not used by the web version — the web version uses HTML overlay elements in `web/index.html` instead.

### Constants (`src/constants/`)

`GameConstants.ts` centralizes all magic numbers: grid sizes, display dimensions, timing, colors, difficulty presets, storage keys, ad config, scoring rules, path-drawing config (`PATH_CONSTANTS`), combo window (`COMBO_WINDOW_MS`), near-miss ratio (`NEAR_MISS_RATIO`), and tutorial level IDs.

### Tests (`src/tests/`)

Custom test framework (no Jest/Mocha). `TestSuite` class with `assert()` and `printResults()`. Three test files:
- `CoreTests.ts` — Rider, Obstacle, Level, CollisionDetector unit tests
- `IntegrationTests.ts` — Multi-component integration tests
- `PerformanceTests.ts` — Stress/load tests

Run all with `npm test` (executes `CoreTests.ts` via ts-node).

## Key Data Flow

1. `main.ts` (or `web-entry.ts` for web) bootstraps: EventBus → LevelManager.loadData(levels.json) → managers → GameEngine.init()
2. Player draws a path for a rider → `PathDrawer` captures drag input, auto-inserts axis-aligned waypoints → `PathValidator` checks validity → if valid, rider follows the path
3. Alternatively, player clicks a rider → `GameLogicController.selectRider()` validates (VIP-first rule, IDLE state) → rider enters MOVING along its fixed direction
4. Each frame: `GameLogicController.update(dt)` → update obstacles → move riders → `CollisionDetector.checkRiderCollision()` → handle result (deliver/crash/bounce/wait) → check victory/failure → emit EventBus events → combo tracking
5. UI listens to EventBus events → show result/fail panels, combo indicators, leaderboard

## Important Design Patterns

- **Singleton everywhere**: GameEngine, LevelManager, EventBus, AudioMgr, AdMgr, StorageMgr, ExpressionManager, QuoteManager, SceneManager, PlatformAdapter, PathDrawer, PathValidator, LeaderboardManager — all use `getInstance()`.
- **EventBus for decoupling**: Core logic never directly calls UI. All communication flows through `EventBus.emit()`/`EventBus.on()`.
- **Enum-driven state machines**: RiderState, LevelState, GameState, ObstacleType, CollisionType — all use string enums.
- **Collision tolerance**: `CollisionDetector.isColliding()` uses a 0.5-grid-unit tolerance for position matching.
- **VIP-first rule**: Enforced at two levels — `GameLogicController.selectRider()` blocks non-VIP departure if VIP is idle, and `handleReachExit()` blocks non-VIP from being first to deliver.
- **Path-drawing mode**: Players can either click-to-dispatch (auto-move) or draw explicit paths. PathDrawer enforces axis-aligned movement and auto-inserts corner waypoints. PathValidator runs structural checks before accepting a path.
- **Combo system**: Successful consecutive deliveries within `COMBO_WINDOW_MS` (2s) build a combo multiplier. Tracked by `GameLogicController`.
- **Province leaderboard**: `LeaderboardManager` uses deterministic random to generate province statistics, enabling consistent mock rankings without a backend.
