# Architecture Decision Records (ADR)
## Signal Path

**Last updated**: 2026-02-08
**Document version**: 1.1

---

## Document Purpose

This document records **all significant architectural and technical decisions** made during the development of Signal Path. Each decision is documented in the ADR (Architecture Decision Record) format to:
- Explain **why** we made specific choices
- Document **alternatives** we considered
- Record **trade-offs** we accepted
- Provide **context** for future maintainers

**For developers**: Understanding these decisions will help you work with (not against) the architecture.

---

## Table of Contents

### Core Technology Decisions
1. [ADR-001: Web Platform (TypeScript + Canvas)](#adr-001-web-platform-typescript--canvas)
2. [ADR-002: No Game Engine](#adr-002-no-game-engine)
3. [ADR-003: Vite as Build Tool](#adr-003-vite-as-build-tool)
4. [ADR-004: Vitest for Testing](#adr-004-vitest-for-testing)

### Architecture Decisions
5. [ADR-005: Separation of Core and UI](#adr-005-separation-of-core-and-ui)
6. [ADR-006: Immutable State Updates](#adr-006-immutable-state-updates)
7. [ADR-007: Action-Based State Transitions](#adr-007-action-based-state-transitions)
8. [ADR-008: Single GameState Object](#adr-008-single-gamestate-object)

### Game Design Decisions
9. [ADR-009: Turn-Based Gameplay](#adr-009-turn-based-gameplay)
10. [ADR-010: Deterministic Simulation](#adr-010-deterministic-simulation)
11. [ADR-011: Grid-Based Movement](#adr-011-grid-based-movement)
12. [ADR-012: Energy as Primary Resource](#adr-012-energy-as-primary-resource)

### Data & Content Decisions
13. [ADR-013: JSON Level Files](#adr-013-json-level-files)
14. [ADR-014: Data-Driven Design](#adr-014-data-driven-design)
15. [ADR-015: No Procedural Generation Initially](#adr-015-no-procedural-generation-initially)

### Algorithm Decisions
16. [ADR-016: BFS for Pathfinding](#adr-016-bfs-for-pathfinding)
17. [ADR-017: 2D Array for Grid Storage](#adr-017-2d-array-for-grid-storage)

### Testing Decisions
18. [ADR-018: Deterministic Replay Tests](#adr-018-deterministic-replay-tests)
19. [ADR-019: High Coverage for Core, Lower for UI](#adr-019-high-coverage-for-core-lower-for-ui)

### UI/UX Decisions
20. [ADR-020: Canvas Rendering](#adr-020-canvas-rendering)
21. [ADR-021: No Animation Initially](#adr-021-no-animation-initially)
22. [ADR-022: Keyboard-First Controls](#adr-022-keyboard-first-controls)

### Phase 3 Decisions
23. [ADR-023: Scene System for UI State Management](#adr-023-scene-system-for-ui-state-management)
24. [ADR-024: localStorage Save System with Progress-Only Persistence](#adr-024-localstorage-save-system-with-progress-only-persistence)
25. [ADR-025: Retro Arcade Cabinet Visual Design](#adr-025-retro-arcade-cabinet-visual-design)

---

## ADR Template

Each ADR follows this structure:

```markdown
## ADR-XXX: Title

**Status**: [Proposed | Accepted | Deprecated | Superseded]
**Date**: YYYY-MM-DD
**Deciders**: [Who made this decision]
**Tags**: [category, keywords]

### Context
What is the issue we're trying to solve? What forces are at play?

### Decision
What did we decide to do?

### Alternatives Considered
What other options did we evaluate?

### Consequences
**Positive**:
- Good outcomes from this decision

**Negative**:
- Trade-offs or downsides

**Neutral**:
- Other changes or implications

### References
- Links to related docs, discussions, or resources
```

---

## ADR-001: Web Platform (TypeScript + Canvas)

**Status**: Accepted  
**Date**: 2025-01-22  
**Deciders**: Project lead  
**Tags**: technology, platform, language

### Context

The project needs to choose a primary technology stack. Options include:
- Unity (C#)
- Godot (GDScript)
- Unreal Engine (C++)
- Web (JavaScript/TypeScript)

**Key requirements**:
- Easy to share/demo (portfolio requirement)
- No installation required for players
- Cross-platform (desktop + mobile)
- Demonstrates CS fundamentals clearly
- Modern, employable tech stack

### Decision

Use **TypeScript + HTML5 Canvas** as the primary platform.

**Technology stack**:
- Language: TypeScript (strict mode)
- Runtime: Browser (no Node.js server)
- Rendering: Canvas 2D API
- Build: Vite
- Testing: Vitest

### Alternatives Considered

#### Unity (C#)
- **Pros**: Industry-standard, great tooling, good for resume
- **Cons**: Requires download, large builds (50+ MB), harder to share
- **Why rejected**: Barrier to entry for portfolio reviewers

#### Godot (GDScript)
- **Pros**: Lightweight, open-source, good 2D support
- **Cons**: GDScript not widely used in industry, export complications
- **Why rejected**: Language isn't transferable to other jobs

#### Unreal (C++)
- **Pros**: Industry-standard, C++ is valuable
- **Cons**: Massive overhead for 2D puzzle game, steep learning curve
- **Why rejected**: Overkill for project scope

#### React/DOM-based
- **Pros**: Familiar web tech, easy component model
- **Cons**: Not ideal for game rendering, performance concerns
- **Why rejected**: Canvas gives more control and better performance

### Consequences

**Positive**:
- ✅ Zero install - click link, game runs instantly
- ✅ Works on desktop, mobile, tablets (responsive)
- ✅ TypeScript demonstrates modern JS/TS skills
- ✅ Easy to deploy (static hosting - Netlify, Vercel, GitHub Pages)
- ✅ Fast iteration (Vite hot reload)
- ✅ Inspectable code (browser dev tools)

**Negative**:
- ❌ Canvas API is lower-level (more manual work)
- ❌ No built-in physics, animation systems
- ❌ Browser compatibility variations (mitigated by evergreen browsers)
- ❌ Not using Unity/Unreal (some game studios prefer these)

**Neutral**:
- TypeScript learning curve (but valuable skill)
- Need to implement game loop manually (good for learning)

### References
- [CLAUDE.md - Technology Stack](../CLAUDE.md#technology-stack)
- [README.md - Quick Start](../README.md#quick-start)

---

## ADR-002: No Game Engine

**Status**: Accepted  
**Date**: 2025-01-22  
**Deciders**: Project lead  
**Tags**: architecture, dependencies, learning

### Context

Should we use a game framework/engine (Phaser, PixiJS, Three.js) or build from scratch using raw Canvas?

**Considerations**:
- Project goal: demonstrate CS fundamentals, not framework knowledge
- Complexity: 2D grid game is simple enough to build from scratch
- Learning: implementing systems teaches more than using framework abstractions

### Decision

**Build from scratch** using raw Canvas API and manual game loop. No game engines or frameworks.

### Alternatives Considered

#### Phaser.js
- **Pros**: Battle-tested, lots of features, good for 2D
- **Cons**: Abstracts game loop, hides state management, adds dependency
- **Why rejected**: Want to show understanding of fundamentals, not framework API

#### PixiJS
- **Pros**: Fast WebGL rendering, sprite support
- **Cons**: Overkill for simple grid game, adds complexity
- **Why rejected**: Canvas 2D is sufficient for project needs

#### Matter.js / Box2D
- **Pros**: Physics engines useful for many games
- **Cons**: We don't need physics (turn-based, grid-locked)
- **Why rejected**: No physics in design

### Consequences

**Positive**:
- ✅ Full control over rendering pipeline
- ✅ Demonstrates understanding of game loops, state management
- ✅ Zero external framework dependencies (tiny bundle size)
- ✅ Clear code (no framework magic or abstraction layers)
- ✅ Better for technical interviews ("I built this from scratch")

**Negative**:
- ❌ More manual work (implement own game loop, rendering)
- ❌ No built-in utilities (scene management, tweening, particles)
- ❌ Longer development time for features

**Neutral**:
- Need to implement common patterns (scene manager, input handling)
- Good practice for systems programming

### References
- [TECH.md - Architecture Overview](TECH.md#architecture-overview)
- [GDD.md - Design Principles](GDD.md#design-principles)

---

## ADR-003: Vite as Build Tool

**Status**: Accepted  
**Date**: 2025-01-22  
**Deciders**: Project lead  
**Tags**: tooling, build, development

### Context

Modern web projects need a build tool for:
- TypeScript compilation
- Module bundling
- Development server with hot reload
- Production optimization

Options: Webpack, Parcel, Rollup, Vite, esbuild

### Decision

Use **Vite** as the build tool and dev server.

### Alternatives Considered

#### Webpack
- **Pros**: Industry standard, mature ecosystem, highly configurable
- **Cons**: Complex config, slower dev server, verbose setup
- **Why rejected**: Overkill for simple TypeScript project

#### Parcel
- **Pros**: Zero-config, fast
- **Cons**: Less control, occasional issues with TypeScript paths
- **Why rejected**: Vite is faster and more popular currently

#### esbuild (direct)
- **Pros**: Extremely fast
- **Cons**: Low-level, no dev server, need to build tooling around it
- **Why rejected**: Vite uses esbuild under the hood anyway

### Consequences

**Positive**:
- ✅ Instant server start (< 1 second)
- ✅ Lightning-fast HMR (hot module reload)
- ✅ Simple config (vite.config.ts is ~50 lines)
- ✅ Built-in TypeScript support
- ✅ Integrated Vitest (same config)
- ✅ Modern, actively maintained

**Negative**:
- ❌ Smaller ecosystem than Webpack (not a practical issue)
- ❌ Relatively newer (less Stack Overflow answers)

**Neutral**:
- Uses Rollup for production builds (different from dev)
- Most projects are moving to Vite anyway

### References
- [CONFIG.md - vite.config.ts](CONFIG.md#viteconfigts)

---

## ADR-004: Vitest for Testing

**Status**: Accepted  
**Date**: 2025-01-22  
**Deciders**: Project lead  
**Tags**: testing, tooling

### Context

Need a test framework for unit and integration tests. Options:
- Jest (most popular)
- Mocha + Chai
- Vitest (Vite-native)
- Testing Library

### Decision

Use **Vitest** for all testing (unit, integration, benchmarks).

### Alternatives Considered

#### Jest
- **Pros**: Most popular, huge ecosystem, familiar API
- **Cons**: Slow with TypeScript, separate config from Vite, outdated ESM support
- **Why rejected**: Slower than Vitest, duplicates Vite config

#### Mocha + Chai
- **Pros**: Flexible, modular
- **Cons**: Requires more setup, less integrated
- **Why rejected**: Vitest provides better DX

### Consequences

**Positive**:
- ✅ Same config as Vite (vite.config.ts)
- ✅ Uses same transform pipeline (fast TypeScript)
- ✅ Jest-compatible API (easy to learn)
- ✅ Built-in coverage (c8/v8)
- ✅ Watch mode is instant
- ✅ Native ESM support

**Negative**:
- ❌ Smaller community than Jest (growing rapidly)
- ❌ Some Jest plugins don't work

**Neutral**:
- API is nearly identical to Jest (easy migration if needed)

### References
- [TESTING.md - Testing Strategy](TESTING.md#testing-philosophy)
- [CONFIG.md - Vitest Config](CONFIG.md#viteconfigts)

---

## ADR-005: Separation of Core and UI

**Status**: Accepted  
**Date**: 2025-01-22  
**Deciders**: Project lead  
**Tags**: architecture, separation-of-concerns, testability

### Context

How should game logic and rendering be organized?

**Options**:
1. Coupled: UI components manage state and rendering
2. Separated: Pure game logic in `core/`, UI in `ui/`
3. Hybrid: Some logic in UI, some separate

**Key requirements**:
- Game logic must be testable without browser
- Want to demonstrate clean architecture
- Enable future ports (terminal, mobile native, etc.)

### Decision

**Strict separation**: Core game logic lives in `src/core/` with zero browser dependencies. UI lives in `src/ui/` and depends on core.

**Dependency rule**: `ui → core` (one-way only). Core never imports from UI.

### Alternatives Considered

#### Coupled approach (React/Vue component state)
- **Pros**: Simpler for small projects, less boilerplate
- **Cons**: Hard to test, can't run logic without DOM
- **Why rejected**: Testing and architecture goals require separation

#### Hybrid (some logic in UI)
- **Pros**: Pragmatic, allows UI-specific optimizations
- **Cons**: Unclear boundaries, tends toward coupling over time
- **Why rejected**: Want clear, enforceable architecture

### Consequences

**Positive**:
- ✅ Core logic runs in Node.js (fast unit tests)
- ✅ Core logic is framework-agnostic (could use React, Vue, etc.)
- ✅ Clear boundaries (easy to understand codebase)
- ✅ Demonstrates separation of concerns (good for interviews)
- ✅ Can test game rules independently of rendering

**Negative**:
- ❌ More files/folders (higher cognitive overhead initially)
- ❌ Some duplication (UI state wraps core state)
- ❌ Need discipline to enforce boundary

**Neutral**:
- Must use dependency injection or parameters (no globals)
- UI becomes thin layer over core logic

### References
- [TECH.md - Architecture Overview](TECH.md#architecture-overview)
- [CLAUDE.md - Module Organization](../CLAUDE.md#module-organization)

---

## ADR-006: Immutable State Updates

**Status**: Accepted  
**Date**: 2025-01-22  
**Deciders**: Project lead  
**Tags**: architecture, state-management, functional-programming

### Context

How should state be updated when actions are applied?

**Options**:
1. **Mutation**: Modify state object in-place
2. **Immutability**: Create new state object on each update
3. **Hybrid**: Some mutation, some immutability

**Considerations**:
- Debugging: easier with immutability (can inspect old states)
- Undo/Replay: requires state snapshots (immutability helps)
- Performance: mutation is faster but rarely matters for this scale

### Decision

Use **immutable state updates**: every state transition creates a new `GameState` object.

**Pattern**: `newState = applyAction(oldState, action)`

**Implementation**: Use object spread (`{...state}`) and array methods (`map`, `filter`) that return new arrays.

### Alternatives Considered

#### Mutable updates
- **Pros**: Slightly faster, less memory, simpler syntax
- **Cons**: Hard to debug, breaks undo, loses history
- **Why rejected**: Trade-offs not worth it for small game state

#### Immer library
- **Pros**: Write mutable-looking code, get immutability
- **Cons**: Adds dependency, hides what's happening
- **Why rejected**: State is simple enough to do manually

### Consequences

**Positive**:
- ✅ Enables undo system (keep old states in stack)
- ✅ Easier debugging (can log/inspect past states)
- ✅ Deterministic replay tests are trivial
- ✅ No surprise mutations (state can't change unexpectedly)
- ✅ Functional programming style (demonstrates skill)

**Negative**:
- ❌ More verbose (spread operators everywhere)
- ❌ Slightly slower (negligible for game state size)
- ❌ More memory (keep multiple state copies for undo)

**Neutral**:
- Need to be careful with nested objects (deep spread)
- Works well with TypeScript (readonly types)

### References
- [TECH.md - State Management](TECH.md#state-management)
- [TECH.md - Immutability Pattern](TECH.md#immutability-pattern)

---

## ADR-007: Action-Based State Transitions

**Status**: Accepted  
**Date**: 2025-01-22  
**Deciders**: Project lead  
**Tags**: architecture, state-management, design-pattern

### Context

How should state changes be represented and executed?

**Options**:
1. **Direct function calls**: `movePlayer(state, direction)`
2. **Action objects**: `applyAction(state, {type: 'move', direction})`
3. **Event system**: Publish events, subscribers update state

**Goal**: Demonstrate command pattern and enable action history.

### Decision

Use **action objects** with a central `applyAction` function.

**Actions are data**:
```typescript
type Action = 
  | { type: 'move'; direction: Direction }
  | { type: 'wait' }
  | { type: 'undo' };
```

**State transitions**:
```typescript
newState = applyAction(state, action);
```

### Alternatives Considered

#### Direct function calls
- **Pros**: Simpler, more direct, less abstraction
- **Cons**: Harder to record history, no single transition point
- **Why rejected**: Want to demonstrate command pattern

#### Event-driven architecture
- **Pros**: Decoupled, flexible
- **Cons**: Overkill for simple game, harder to reason about flow
- **Why rejected**: Too complex for project scope

### Consequences

**Positive**:
- ✅ Actions are serializable (can save/replay)
- ✅ Action history enables undo/redo trivially
- ✅ Single point of truth for state transitions
- ✅ Demonstrates command pattern (interview topic)
- ✅ Easy to log all actions for debugging

**Negative**:
- ❌ Extra abstraction layer (actions vs. direct calls)
- ❌ More boilerplate (action types, validators)

**Neutral**:
- Actions can be sent over network (future multiplayer)
- Fits well with immutable state (natural combination)

### References
- [TECH.md - Action System](TECH.md#action-system)
- [GDD.md - Turn Structure](GDD.md#turn-structure)

---

## ADR-008: Single GameState Object

**Status**: Accepted  
**Date**: 2025-01-22  
**Deciders**: Project lead  
**Tags**: architecture, state-management, single-source-of-truth

### Context

Should game state be:
1. **Centralized**: Single `GameState` object with everything
2. **Distributed**: Multiple state objects (player state, grid state, etc.)
3. **Hybrid**: Some centralized, some distributed

**Goals**:
- Single source of truth
- Easy to serialize (save/load)
- Clear ownership

### Decision

All game state lives in a **single `GameState` object**.

```typescript
interface GameState {
  levelId: string;
  status: GameStatus;
  turnCount: number;
  grid: Grid;
  player: Player;
  hazards: Hazard[];
  interactables: Interactable[];
  goal: Position;
  energy: number;
  maxEnergy: number;
}
```

### Alternatives Considered

#### Distributed state (Redux-style)
- **Pros**: Each module owns its state, composable
- **Cons**: Need reducer composition, more complexity
- **Why rejected**: Overkill for game state size

#### ECS (Entity-Component-System)
- **Pros**: Flexible, performant for many entities
- **Cons**: Complex architecture, harder to reason about
- **Why rejected**: We have ~10 entities max, not 10,000

### Consequences

**Positive**:
- ✅ Single object to serialize (save/load is trivial)
- ✅ Clear what's in the game (inspect one object)
- ✅ No state synchronization issues
- ✅ Simple to pass around (one parameter)

**Negative**:
- ❌ Large object (but still < 100 KB)
- ❌ Copying entire state on updates (mitigated by immutability)

**Neutral**:
- Natural fit with functional state updates
- TypeScript ensures all fields are typed

### References
- [TECH.md - Core Data Structures](TECH.md#core-data-structures)
- [TECH.md - GameState](TECH.md#gamestate-the-master-structure)

---

## ADR-009: Turn-Based Gameplay

**Status**: Accepted  
**Date**: 2025-01-22  
**Deciders**: Project lead  
**Tags**: game-design, mechanics, determinism

### Context

Should the game be:
1. **Real-time**: Continuous movement, frame-dependent
2. **Turn-based**: Discrete actions, pause between turns
3. **Hybrid**: Real-time with pause

**Project goals**:
- Demonstrate deterministic systems
- Easy to test
- Showcase state management
- Resume/portfolio focus (not entertainment)

### Decision

**Turn-based** gameplay with explicit turn resolution.

**Turn sequence**:
1. Player inputs action
2. Action is validated
3. Action is applied
4. Hazards resolve
5. Win/lose check
6. Repeat

### Alternatives Considered

#### Real-time movement
- **Pros**: More engaging, feels like traditional games
- **Cons**: Frame-time dependent, harder to test, introduces non-determinism
- **Why rejected**: Conflicts with determinism goal

#### Hybrid (pauseable real-time)
- **Pros**: Best of both worlds
- **Cons**: More complex, still has timing issues
- **Why rejected**: Adds complexity without clear benefit

### Consequences

**Positive**:
- ✅ Perfect determinism (no frame timing)
- ✅ Easy to test (action → result is pure function)
- ✅ State machine is explicit (playing → won/lost)
- ✅ Great for teaching algorithms (no timing concerns)
- ✅ Replay system is trivial (just re-run actions)

**Negative**:
- ❌ Less "game-like" (not real-time excitement)
- ❌ Feels slower (deliberate, not fast-paced)

**Neutral**:
- Fits puzzle game genre (turn-based is common)
- Can add animation later without changing logic

### References
- [GDD.md - Core Gameplay Loop](GDD.md#core-gameplay-loop)
- [GDD.md - Turn Structure](GDD.md#turn-structure)

---

## ADR-010: Deterministic Simulation

**Status**: Accepted  
**Date**: 2025-01-22  
**Deciders**: Project lead  
**Tags**: game-design, testing, reproducibility

### Context

Should game outcomes be:
1. **Deterministic**: Same inputs always produce same outputs
2. **Stochastic**: Random elements (RNG) affect outcomes
3. **Hybrid**: Deterministic gameplay, random level generation

**Project goal**: Demonstrate systems thinking and testability.

### Decision

**Pure determinism** in gameplay. No randomness in game rules.

**Principle**: `f(state, action) = newState` (pure function, no RNG).

**Exception**: Level generation (Phase 4) will use seeded RNG (still reproducible).

### Alternatives Considered

#### Random events (critical hits, hazard activations)
- **Pros**: More variety, replayability
- **Cons**: Breaks determinism, harder to test, feels unfair
- **Why rejected**: Conflicts with primary goals

#### RNG with seeded random
- **Pros**: Deterministic if seed is saved
- **Cons**: Still adds complexity, need to serialize seed
- **Why rejected**: Don't need RNG for core gameplay

### Consequences

**Positive**:
- ✅ Perfectly testable (no flaky tests ever)
- ✅ Replay system works perfectly
- ✅ Debugging is easy (reproduce bugs exactly)
- ✅ Great talking point (demonstrates systems thinking)
- ✅ Failures feel fair (player's fault, not RNG)

**Negative**:
- ❌ Less replayability (same level always plays the same)
- ❌ No "luck" factor (some players enjoy RNG)

**Neutral**:
- Can add seeded RNG for level generation later
- Fits puzzle game genre (determinism is expected)

### References
- [TESTING.md - Deterministic Replay Tests](TESTING.md#deterministic-replay-tests)
- [GDD.md - Design Principles](GDD.md#design-principles)
- [CLAUDE.md - Determinism](../CLAUDE.md#determinism)

---

## ADR-011: Grid-Based Movement

**Status**: Accepted  
**Date**: 2025-01-22  
**Deciders**: Project lead  
**Tags**: game-design, algorithms, data-structures

### Context

Movement system options:
1. **Grid-based**: Discrete tiles, 4-directional movement
2. **Free movement**: Pixel-perfect, 360-degree movement
3. **Hybrid**: Grid movement with smooth transitions

**Goals**:
- Demonstrate graph algorithms (pathfinding)
- Simple, clear state representation
- Easy to reason about positions

### Decision

**Grid-based** movement with 4 directions (up, down, left, right).

**Representation**:
- Grid is 2D array of tiles
- Positions are (x, y) coordinates (integers)
- Movement is discrete (one tile per action)

### Alternatives Considered

#### Free movement (pixel-based)
- **Pros**: More fluid, modern feel
- **Cons**: Collision detection complex, positions are floats, no graph structure
- **Why rejected**: Doesn't showcase algorithms well

#### 8-directional movement (diagonals)
- **Pros**: More options, faster paths
- **Cons**: Complicates pathfinding (diagonal cost?), Manhattan distance breaks
- **Why rejected**: 4-directional is simpler and sufficient

### Consequences

**Positive**:
- ✅ Grid is a graph (perfect for BFS/A*)
- ✅ Positions are simple integers (no float precision issues)
- ✅ Easy to visualize and debug
- ✅ Manhattan distance heuristic is perfect
- ✅ Collision detection is trivial (just check tile)

**Negative**:
- ❌ Movement feels "grid-locked" (not fluid)
- ❌ Diagonal movement not possible (longer paths)

**Neutral**:
- Can add smooth transitions without changing logic
- Fits puzzle game genre perfectly

### References
- [TECH.md - Grid & Spatial Systems](TECH.md#grid--spatial-systems)
- [GDD.md - Grid System](GDD.md#grid-system)

---

## ADR-012: Energy as Primary Resource

**Status**: Accepted  
**Date**: 2025-01-22  
**Deciders**: Project lead  
**Tags**: game-design, mechanics, puzzle-design

### Context

What constraint creates puzzle tension?

**Options**:
1. **Energy/moves**: Limited number of actions
2. **Time limit**: Countdown timer
3. **No limit**: Infinite exploration
4. **Lives**: Multiple attempts before game over

**Goal**: Create puzzle challenge without time pressure.

### Decision

**Energy budget**: Each level has fixed energy, each action costs 1 energy.

**Mechanic**:
- Move = -1 energy
- Wait = -1 energy
- Energy = 0 and not on goal = lose

### Alternatives Considered

#### Time limit
- **Pros**: Creates urgency, exciting
- **Cons**: Stressful, not thoughtful, conflicts with turn-based design
- **Why rejected**: Want deliberate planning, not speed

#### No resource limit
- **Pros**: Relaxing, exploratory
- **Cons**: No challenge, no puzzle tension
- **Why rejected**: Need constraint for puzzle design

#### Lives system
- **Pros**: Forgiving, multiple attempts
- **Cons**: Not relevant to grid puzzle, just retry anyway
- **Why rejected**: Doesn't add meaningful challenge

### Consequences

**Positive**:
- ✅ Creates optimization puzzle (find efficient path)
- ✅ Forces planning ahead (can't waste moves)
- ✅ Scales difficulty (tight energy = harder)
- ✅ Easy to balance (calculate optimal path, add buffer)
- ✅ Clear failure condition (energy = 0)

**Negative**:
- ❌ Trial-and-error required (restart on failure)
- ❌ Can be frustrating if too tight

**Neutral**:
- Fits constraint-satisfaction problem framing
- Energy visualized in HUD (always visible)

### References
- [GDD.md - Energy System](GDD.md#energy-system)
- [LEVEL_FORMAT.md - Energy Budget Calculation](LEVEL_FORMAT.md#energy-budget-calculation)

---

## ADR-013: JSON Level Files

**Status**: Accepted  
**Date**: 2025-01-22  
**Deciders**: Project lead  
**Tags**: data, content, format

### Context

How should levels be authored and stored?

**Options**:
1. **JSON files**: Structured text format
2. **Binary format**: Custom serialization
3. **Code**: Levels defined in TypeScript
4. **Visual editor**: GUI tool generates data

**Requirements**:
- Human-readable
- Version control friendly
- Validatable
- Easy to author (initially)

### Decision

Levels are **JSON files** in `content/levels/`.

**Schema**: Documented in LEVEL_FORMAT.md

### Alternatives Considered

#### Binary format
- **Pros**: Smaller files, faster parsing
- **Cons**: Not human-readable, need tools to edit
- **Why rejected**: Premature optimization

#### Code (TypeScript objects)
- **Pros**: Type-safe, no parsing
- **Cons**: Need recompile to change level, mixes code and content
- **Why rejected**: Violates data-driven principle

#### Visual level editor
- **Pros**: User-friendly, visual preview
- **Cons**: Need to build tool first (scope creep)
- **Why rejected**: Can add later (Phase 4)

### Consequences

**Positive**:
- ✅ Human-readable (can edit in text editor)
- ✅ Git-friendly (diff/merge levels easily)
- ✅ JSON Schema validation (catch errors)
- ✅ Standard format (every language can parse)
- ✅ Easy to generate (procedural or manual)

**Negative**:
- ❌ Verbose (more characters than binary)
- ❌ Manual editing is tedious (typos, coordinates)

**Neutral**:
- Can build editor later that outputs JSON
- JSON is web-native (fetch API)

### References
- [LEVEL_FORMAT.md](LEVEL_FORMAT.md)
- [CLAUDE.md - Data-Driven Content](../CLAUDE.md#data-driven-content)

---

## ADR-014: Data-Driven Design

**Status**: Accepted  
**Date**: 2025-01-22  
**Deciders**: Project lead  
**Tags**: architecture, content, separation-of-concerns

### Context

Should game content be:
1. **Hardcoded**: Levels defined in game code
2. **Data-driven**: Levels as external data files
3. **Hybrid**: Some hardcoded, some external

**Goal**: Demonstrate separation of data and logic.

### Decision

**Fully data-driven**: All levels are external JSON files. Zero hardcoded level data in code.

**Boundary**:
- Code defines rules (what a wall does)
- Data defines content (where walls are)

### Alternatives Considered

#### Hardcoded levels
- **Pros**: Simple, fast (no file loading)
- **Cons**: Need recompile to change, mixes concerns
- **Why rejected**: Want to demonstrate architecture

#### Hybrid (tutorials hardcoded, others external)
- **Pros**: Ensures tutorial always works
- **Cons**: Inconsistent approach, confusing
- **Why rejected**: No strong benefit

### Consequences

**Positive**:
- ✅ Add/modify levels without touching code
- ✅ Clear separation (code = how, data = what)
- ✅ Enable future level editor
- ✅ Demonstrate architecture principle
- ✅ Content creators don't need programming knowledge

**Negative**:
- ❌ Level loading adds latency (mitigated by caching)
- ❌ Need validation system (data could be invalid)

**Neutral**:
- Similar to how game engines work (Unity, Unreal)
- Standard industry pattern

### References
- [CLAUDE.md - Data-Driven Content](../CLAUDE.md#data-driven-content)
- [TECH.md - Level Loading & Validation](TECH.md#level-loading--validation)

---

## ADR-015: No Procedural Generation Initially

**Status**: Accepted  
**Date**: 2025-01-22  
**Deciders**: Project lead  
**Tags**: content, scope, roadmap

### Context

Should levels be:
1. **Handcrafted**: Designed manually, static
2. **Procedurally generated**: Algorithm creates levels
3. **Hybrid**: Some handcrafted, some procedural

**Considerations**:
- Project timeline (handcrafted is faster initially)
- Learning curve (procedural is complex)
- Quality control (handcrafted is predictable)

### Decision

**Phase 1-2**: Handcrafted levels only.

**Phase 4**: Add procedural generation as advanced feature.

**Rationale**: Focus on core mechanics first, add generation later.

### Alternatives Considered

#### Procedural from start
- **Pros**: Infinite content, showcases algorithms
- **Cons**: Hard to balance, need handcrafted anyway (tutorial)
- **Why rejected**: Premature complexity

#### Only procedural (no handcrafted)
- **Pros**: Never run out of content
- **Cons**: Can't control difficulty curve, tutorial needs design
- **Why rejected**: Need handcrafted for teaching mechanics

### Consequences

**Positive**:
- ✅ Faster initial development
- ✅ Better tutorial design (handcrafted introduces mechanics)
- ✅ Quality control (every level is tested)
- ✅ Clear progression (deliberate difficulty curve)

**Negative**:
- ❌ Limited content (need to create each level)
- ❌ More work for each level

**Neutral**:
- Can add procedural generation later (Phase 4)
- Procedural generation will be resume highlight when added

### References
- [ROADMAP.md - Phase 4](ROADMAP.md)
- [GDD.md - Future Features](GDD.md#future-features-roadmap)

---

## ADR-016: BFS for Pathfinding

**Status**: Accepted  
**Date**: 2025-01-22  
**Deciders**: Project lead  
**Tags**: algorithms, pathfinding, performance

### Context

Which pathfinding algorithm should be used?

**Options**:
1. **BFS** (Breadth-First Search)
2. **A*** (A-Star)
3. **Dijkstra**
4. **DFS** (Depth-First Search)

**Requirements**:
- Find shortest path
- Simple to implement and explain
- Fast enough for game (< 5ms on 20x20 grid)

### Decision

**Primary**: BFS for simple pathfinding (small grids)

**Secondary**: A* for optimization and larger grids (Phase 3)

**Implementation**: BFS with queue, visited set, parent tracking.

### Alternatives Considered

#### A* only
- **Pros**: Faster, more optimal
- **Cons**: More complex (heuristic function), harder to explain
- **Why rejected**: BFS is simpler and sufficient initially

#### Dijkstra
- **Pros**: Handles weighted edges
- **Cons**: We don't have weighted edges (all moves cost 1)
- **Why rejected**: Overkill for uniform-cost grid

#### DFS
- **Pros**: Simple, uses stack
- **Cons**: Doesn't find shortest path
- **Why rejected**: Need shortest path for validation

### Consequences

**Positive**:
- ✅ Simple to implement (< 50 lines)
- ✅ Easy to explain in interviews
- ✅ Guaranteed shortest path (all edges cost 1)
- ✅ Fast enough (< 1ms on 10x10 grid)

**Negative**:
- ❌ Slower than A* on large grids
- ❌ No heuristic optimization

**Neutral**:
- Can add A* later for performance
- Both algorithms valuable for resume

### References
- [TECH.md - Pathfinding Algorithms](TECH.md#pathfinding-algorithms)
- [TESTING.md - Testing Pathfinding](TESTING.md#testing-pathfinding)

---

## ADR-017: 2D Array for Grid Storage

**Status**: Accepted  
**Date**: 2025-01-22  
**Deciders**: Project lead  
**Tags**: data-structures, performance

### Context

How should the grid be stored in memory?

**Options**:
1. **2D array**: `tiles[y][x]`
2. **1D array**: `tiles[y * width + x]`
3. **HashMap**: `tiles.get({x, y})`
4. **Sparse array**: Only store non-empty tiles

**Access pattern**: Frequent random access by (x, y).

### Decision

**2D array**: `Grid.tiles: Tile[][]` (row-major order).

**Access**: `tiles[y][x]`

### Alternatives Considered

#### 1D array with index calculation
- **Pros**: Better cache locality, smaller memory
- **Cons**: Manual index calculation, harder to debug
- **Why rejected**: Premature optimization

#### HashMap with Position keys
- **Pros**: Sparse representation (save memory)
- **Cons**: Slower lookups, need custom hash function
- **Why rejected**: Grids are dense (most tiles occupied)

#### Object with string keys
- **Pros**: Simple, JavaScript-native
- **Cons**: String concatenation overhead, not type-safe
- **Why rejected**: 2D array is more idiomatic

### Consequences

**Positive**:
- ✅ O(1) access by coordinates
- ✅ Simple, intuitive indexing
- ✅ Easy to iterate (nested loops)
- ✅ TypeScript enforces bounds

**Negative**:
- ❌ Uses memory for entire grid (even empty tiles)
- ❌ Slightly worse cache locality than 1D

**Neutral**:
- Standard approach for grid games
- Memory usage is negligible (20x20 = 400 tiles max)

### References
- [TECH.md - Grid & Spatial Systems](TECH.md#grid--spatial-systems)

---

## ADR-018: Deterministic Replay Tests

**Status**: Accepted  
**Date**: 2025-01-22  
**Deciders**: Project lead  
**Tags**: testing, determinism, quality

### Context

How do we verify that the game is truly deterministic?

**Options**:
1. **Manual testing**: Play through and observe
2. **Unit tests**: Test individual functions
3. **Deterministic replay**: Run same actions N times, compare results
4. **Property-based testing**: Generate random actions, verify invariants

### Decision

Implement **deterministic replay tests**: run same action sequence 100 times, verify all results are identical.

**Test pattern**:
```typescript
const actions = [...];
const results = [];
for (let i = 0; i < 100; i++) {
  results.push(simulateGame(initialState, actions));
}
// All results must be identical
```

### Alternatives Considered

#### Unit tests only
- **Pros**: Catch individual function bugs
- **Cons**: Don't verify system-level determinism
- **Why rejected**: Need both unit and integration tests

#### Property-based testing
- **Pros**: Finds edge cases automatically
- **Cons**: Complex setup, need property generators
- **Why rejected**: Deterministic replay is simpler and sufficient

### Consequences

**Positive**:
- ✅ Proves determinism at system level
- ✅ Great talking point (unique testing approach)
- ✅ Catches non-determinism bugs (timestamp, Math.random)
- ✅ Simple to implement (just run multiple times)
- ✅ CI can run these tests automatically

**Negative**:
- ❌ Slower than unit tests (run 100x)
- ❌ Doesn't tell you which function is non-deterministic

**Neutral**:
- Complements unit tests (use both)
- Industry-relevant (game replays, distributed systems)

### References
- [TESTING.md - Deterministic Replay Tests](TESTING.md#deterministic-replay-tests)

---

## ADR-019: High Coverage for Core, Lower for UI

**Status**: Accepted  
**Date**: 2025-01-22  
**Deciders**: Project lead  
**Tags**: testing, coverage, quality

### Context

What test coverage targets should we aim for?

**Considerations**:
- Core logic is critical (bugs here are severe)
- UI is harder to test (mocking Canvas, etc.)
- Time is limited (100% everywhere is impractical)

### Decision

**Coverage targets**:
- Core (`src/core/`): 90-100%
- UI (`src/ui/`): 50-70%
- Overall: 80%+

**Rationale**: Test where bugs matter most.

### Alternatives Considered

#### 100% everywhere
- **Pros**: Maximum confidence
- **Cons**: Diminishing returns, testing trivial code
- **Why rejected**: Not pragmatic for UI code

#### No coverage targets
- **Pros**: Flexible, focus on important tests
- **Cons**: Easy to under-test, no accountability
- **Why rejected**: Want measurable quality

### Consequences

**Positive**:
- ✅ High confidence in core logic
- ✅ Pragmatic UI testing (focus on important paths)
- ✅ Clear expectations (what to test)
- ✅ CI can enforce minimums

**Negative**:
- ❌ Some UI bugs might slip through
- ❌ Need discipline to meet targets

**Neutral**:
- Can increase targets over time
- Coverage is measured automatically

### References
- [TESTING.md - Coverage Guidelines](TESTING.md#coverage-guidelines)
- [CONFIG.md - Coverage Config](CONFIG.md#viteconfigts)

---

## ADR-020: Canvas Rendering

**Status**: Accepted  
**Date**: 2025-01-22  
**Deciders**: Project lead  
**Tags**: rendering, ui, performance

### Context

How should the game be rendered?

**Options**:
1. **DOM/HTML**: Divs for tiles, CSS for styling
2. **Canvas 2D**: Pixel-based rendering
3. **WebGL**: GPU-accelerated 3D
4. **SVG**: Vector graphics

**Requirements**:
- Simple 2D graphics
- Good performance (60 FPS)
- Easy to implement

### Decision

Use **Canvas 2D API** for all rendering.

**Approach**:
- Clear canvas each frame
- Draw grid (background)
- Draw entities (player, hazards, etc.)
- Draw HUD (overlay)

### Alternatives Considered

#### DOM-based (divs + CSS Grid)
- **Pros**: Easier for beginners, inspect in dev tools
- **Cons**: Slower for many elements, less control
- **Why rejected**: Canvas gives more control and better performance

#### WebGL / Three.js
- **Pros**: GPU acceleration, 3D capabilities
- **Cons**: Overkill for 2D grid, complex API
- **Why rejected**: Don't need 3D or GPU for this game

#### SVG
- **Pros**: Vector graphics (scale perfectly), declarative
- **Cons**: Slower for many elements, more complex state management
- **Why rejected**: Canvas is simpler for rasterized tiles

### Consequences

**Positive**:
- ✅ Full control over pixels
- ✅ Good performance (easily 60 FPS)
- ✅ Simple API (fillRect, drawImage, etc.)
- ✅ Works everywhere (good browser support)

**Negative**:
- ❌ Lower-level (manual drawing loops)
- ❌ No built-in accessibility (need separate layer)

**Neutral**:
- Can add effects (particles, shaders) easily
- Standard for HTML5 games

### References
- [TECH.md - Rendering System](TECH.md#rendering-system)

---

## ADR-021: No Animation Initially

**Status**: Accepted  
**Date**: 2025-01-22  
**Deciders**: Project lead  
**Tags**: ui, scope, polish

### Context

Should player movement be:
1. **Instant**: Teleport to new position
2. **Animated**: Smooth transitions (100-200ms)
3. **Hybrid**: Instant by default, animate on demand

**Considerations**:
- Project timeline (animation is polish, not core)
- Complexity (need tweening, timing)
- Testing (animation complicates state)

### Decision

**Phase 1-2**: Instant movement (no animation).

**Phase 3**: Add smooth transitions as polish.

### Alternatives Considered

#### Animate from start
- **Pros**: Better UX, looks polished
- **Cons**: More code, complicates testing
- **Why rejected**: Want working game first, polish later

#### Animation library (GSAP, Anime.js)
- **Pros**: Powerful, easy to use
- **Cons**: Adds dependency, need to learn API
- **Why rejected**: Simple lerp/tween is sufficient when we add it

### Consequences

**Positive**:
- ✅ Faster development (skip animation code)
- ✅ Easier testing (no timing dependencies)
- ✅ Clear state (position is always exact)

**Negative**:
- ❌ Looks unpolished (jarring teleport)
- ❌ Harder to track player movement visually

**Neutral**:
- Can add animation later without logic changes
- Core logic already separates state from rendering

### References
- [ROADMAP.md - Phase 3](ROADMAP.md)
- [GDD.md - Future Features](GDD.md#future-features-roadmap)

---

## ADR-022: Keyboard-First Controls

**Status**: Accepted  
**Date**: 2025-01-22  
**Deciders**: Project lead  
**Tags**: ui, input, ux

### Context

What should be the primary input method?

**Options**:
1. **Keyboard**: Arrow keys / WASD
2. **Mouse**: Click tiles to move
3. **Touch**: Swipe gestures
4. **Hybrid**: Support all methods

**Target platform**: Desktop primary, mobile secondary.

### Decision

**Primary**: Keyboard (Arrow keys, WASD)

**Secondary**: Touch (swipe gestures) added later.

**Mouse**: Not primary (could add click-to-move in Phase 3).

### Alternatives Considered

#### Mouse-primary
- **Pros**: Intuitive for some players
- **Cons**: Slower for grid navigation, need pathfinding to clicked tile
- **Why rejected**: Keyboard is faster for grid games

#### Touch-primary
- **Pros**: Mobile-friendly
- **Cons**: Desktop players need keyboard anyway
- **Why rejected**: Desktop is primary platform

### Consequences

**Positive**:
- ✅ Fast input (no mouse travel time)
- ✅ Simple to implement (keydown events)
- ✅ Familiar for gamers (WASD standard)
- ✅ Works great on desktop

**Negative**:
- ❌ Not mobile-friendly initially
- ❌ Need separate touch implementation

**Neutral**:
- Can add touch/mouse later
- Most puzzle games support multiple inputs

### References
- [TECH.md - Input Handling](TECH.md#input-handling)
- [GDD.md - Controls](GDD.md#controls)

---

## ADR-023: Scene System for UI State Management

**Status**: Accepted
**Date**: 2026-02-06
**Deciders**: Project lead
**Tags**: architecture, ui, scene-management

### Context

The main entry point (`src/ui/main.ts`) grew to ~414 lines handling everything: game loop, level loading, input, rendering, and state transitions. As we add more screens (menu, level select, game over), ad-hoc conditionals for switching between states become unmanageable. Level Select (3.2), Tutorial (3.5), and Save/Load (3.6) all depend on having a proper scene abstraction.

**Options**:
1. **Scene system**: Interface-based scenes with a manager
2. **State machine**: Enum-based states with switch statements
3. **Keep ad-hoc**: Continue with conditionals in main.ts

### Decision

Implement a **Scene System** with:
- A `Scene` interface with lifecycle methods (`enter`, `exit`, `update`, `render`, `handleInput`)
- A `SceneManager` that handles transitions and delegates to the active scene
- Four concrete scenes: `MenuScene`, `GameScene`, `LevelSelectScene`, `GameOverScene`
- Shared `SceneContext` for cross-cutting concerns (canvas, sound, levels)

**Files**: `src/ui/scenes/types.ts`, `SceneManager.ts`, `GameScene.ts`, `MenuScene.ts`, `LevelSelectScene.ts`, `GameOverScene.ts`

### Alternatives Considered

#### State machine with enum
- **Pros**: Simpler, less code
- **Cons**: All logic still in one file, grows linearly with states
- **Why rejected**: Doesn't scale as more screens are added

#### Keep ad-hoc conditionals
- **Pros**: No refactoring needed
- **Cons**: main.ts becomes unmaintainable, can't add new screens easily
- **Why rejected**: Already at the complexity limit

### Consequences

**Positive**:
- Each screen is self-contained (own rendering, input, state)
- Adding new screens requires only a new file + register call
- main.ts reduced from ~414 to ~200 lines
- Clean lifecycle (enter/exit prevents resource leaks)
- Inter-scene communication via SceneManager data

**Negative**:
- More files (6 new files in scenes/)
- Indirection (input flows through manager to scene)

**Neutral**:
- Common pattern in game development (familiar to reviewers)
- Scenes render to same Canvas (no DOM complexity)

### References
- [TECH.md - Architecture Overview](TECH.md#architecture-overview)
- [ROADMAP.md - Phase 3](ROADMAP.md)

---

## ADR-024: localStorage Save System with Progress-Only Persistence

**Status**: Accepted
**Date**: 2026-02-07
**Deciders**: Project lead
**Tags**: persistence, architecture, save-system

### Context

The game had no persistence — closing the browser lost all progress. Players needed to replay completed levels and couldn't track their best scores. A save system was needed for Phase 3 to enable level locking/unlocking and progress badges.

**Options**:
1. **localStorage with progress-only saves**: Persist level completion and best scores, not mid-level state
2. **Full state saves**: Serialize mid-level GameState for resume-anywhere
3. **Server-side saves**: Backend persistence with user accounts
4. **IndexedDB**: More structured browser storage

### Decision

Use **localStorage** to persist **progress-only** data (level completions, best turns, best energy, settings). No mid-level saves.

**Architecture**:
- `src/core/serialization.ts`: Pure types and functions (no browser APIs) — validates, serializes, queries progress
- `src/ui/storage.ts`: Thin localStorage adapter (only file touching Storage API)
- Version field in SaveData enables future migrations

### Alternatives Considered

#### Full mid-level state saves
- **Pros**: Resume anywhere, better UX
- **Cons**: GameState contains complex nested objects (Grid, Hazards, stateHistory); serialization is fragile; levels are short enough that restart is fine
- **Why rejected**: Complexity outweighs benefit for puzzle levels that take < 2 minutes

#### Server-side persistence
- **Pros**: Cross-device sync, no storage limits
- **Cons**: Requires backend, auth, hosting costs; this is a portfolio static site
- **Why rejected**: Out of scope; localStorage is sufficient for single-device play

#### IndexedDB
- **Pros**: More storage, structured queries
- **Cons**: Async API adds complexity; save data is < 1 KB
- **Why rejected**: localStorage is simpler and sufficient

### Consequences

**Positive**:
- Core serialization logic is pure and testable (47 unit tests)
- Single adapter file isolates browser API (easy to swap)
- Version migration scaffold ready for future schema changes
- Level unlock system naturally falls out of progress tracking
- Settings (sound preference) persist across sessions

**Negative**:
- No mid-level resume (players restart levels on refresh)
- localStorage is per-origin, per-browser (no cross-device sync)
- 5 MB storage limit (not a practical concern for progress data)

**Neutral**:
- try/catch in adapter handles private browsing gracefully
- Pattern mirrors getSoundState/setSoundState in SceneContext

### References
- [TECH.md - Architecture Overview](TECH.md#architecture-overview)
- [ROADMAP.md - Phase 3](ROADMAP.md)

---

## ADR-025: Retro Arcade Cabinet Visual Design

**Status**: Accepted
**Date**: 2026-02-08
**Deciders**: Project lead
**Tags**: ui, visual-design, rendering, polish

### Context

The game needed visual polish (Step 3.4) to look portfolio-ready. The existing rendering used simple shapes with muted colors — functional but generic. A cohesive visual identity was needed to make the game memorable and demonstrate frontend design skill.

**Options**:
1. **Retro arcade cabinet**: 80s arcade look (Pac-Man, Tron, Galaga) — neon colors, dark backgrounds, CRT scanlines
2. **Minimalist geometric**: Clean lines, subtle palette, modern UI
3. **Pixel art**: Sprite-based retro look with custom pixel art
4. **Cyberpunk/sci-fi**: Futuristic theme matching the drone/facility narrative

### Decision

Adopt a **retro arcade cabinet aesthetic** with neon colors on pure black backgrounds, glow effects, segmented health bars, CRT scanline overlays, and Tron-style wireframe grids.

**Key design choices**:
- Pure black (#000000) background — arcade screen feel
- Neon palette: cyan (#00ccff), green (#00ff88), pink (#ff0055), orange (#ff4400), yellow (#ffdd00)
- Glow halos around interactive entities (player, goal, hazards, keys)
- Segmented energy bar (arcade health blocks) instead of smooth fill
- CRT scanline overlay on menu/game-over screens
- "STAGE 01" / "TURN 003" arcade-style HUD formatting
- COLORS constant as single source of truth for the entire palette
- 25% UI scale increase (TILE_SIZE 48→60) for better readability

### Alternatives Considered

#### Minimalist geometric
- **Pros**: Timeless, clean, easy to implement
- **Cons**: Looks generic, doesn't stand out in portfolio, no personality
- **Why rejected**: Too similar to default prototype look

#### Pixel art
- **Pros**: Strong retro feel, charming
- **Cons**: Requires artist skills or asset creation, time-intensive
- **Why rejected**: Scope — programmatic rendering is faster and demonstrates code skill

#### Cyberpunk/sci-fi
- **Pros**: Matches narrative (drone, facility), trendy
- **Cons**: Harder to execute well with Canvas 2D, risk of looking cluttered
- **Why rejected**: Arcade is simpler and equally effective

### Consequences

**Positive**:
- Cohesive visual identity across all scenes (menu, game, level select, game over)
- High contrast makes gameplay elements very readable
- Glow effects add depth without complexity (just overlapping shapes with alpha)
- Demonstrates frontend/UI design skill alongside engineering
- "Hex + alpha" trick (`color + '30'`) keeps glow code simple
- Scales well — all sizes derived from TILE_SIZE constant

**Negative**:
- Some hardcoded color values outside COLORS constant (minor)
- CRT scanline overlay adds a small per-frame rendering cost (negligible)
- Neon-on-black may not suit all preferences

**Neutral**:
- All changes confined to UI layer (core logic untouched)
- 242 tests continue passing (rendering is visual-only)
- Pattern is easy to theme-swap in the future

### References
- [TECH.md - Rendering System](TECH.md#rendering-system)
- [ROADMAP.md - Phase 3](ROADMAP.md)

---

## Decision Summary Table

| ADR | Decision | Status | Impact |
|-----|----------|--------|--------|
| 001 | Web Platform (TypeScript + Canvas) | Accepted | High |
| 002 | No Game Engine | Accepted | High |
| 003 | Vite as Build Tool | Accepted | Medium |
| 004 | Vitest for Testing | Accepted | Medium |
| 005 | Separation of Core and UI | Accepted | High |
| 006 | Immutable State Updates | Accepted | High |
| 007 | Action-Based State Transitions | Accepted | High |
| 008 | Single GameState Object | Accepted | High |
| 009 | Turn-Based Gameplay | Accepted | High |
| 010 | Deterministic Simulation | Accepted | High |
| 011 | Grid-Based Movement | Accepted | High |
| 012 | Energy as Primary Resource | Accepted | Medium |
| 013 | JSON Level Files | Accepted | Medium |
| 014 | Data-Driven Design | Accepted | High |
| 015 | No Procedural Generation Initially | Accepted | Low |
| 016 | BFS for Pathfinding | Accepted | Medium |
| 017 | 2D Array for Grid Storage | Accepted | Low |
| 018 | Deterministic Replay Tests | Accepted | High |
| 019 | High Coverage for Core, Lower for UI | Accepted | Medium |
| 020 | Canvas Rendering | Accepted | Medium |
| 021 | No Animation Initially | Accepted | Low |
| 022 | Keyboard-First Controls | Accepted | Low |
| 023 | Scene System for UI State Management | Accepted | High |
| 024 | localStorage Save System with Progress-Only Persistence | Accepted | High |
| 025 | Retro Arcade Cabinet Visual Design | Accepted | Medium |

---

## Changelog

### v1.0 (2025-01-22)
- Initial ADR document
- Documented 22 architectural decisions
- Covered technology, architecture, game design, data, algorithms, testing, and UI
- Each ADR includes context, alternatives, and consequences

---

## Document Maintenance

### When to Add New ADRs

Add a new ADR when:
- Making a significant technical choice
- Choosing between multiple viable approaches
- Establishing a pattern that will be followed
- Making a trade-off with consequences

### ADR Lifecycle

- **Proposed**: Under discussion
- **Accepted**: Decision made, implementation begins
- **Deprecated**: No longer recommended (but not removed)
- **Superseded**: Replaced by a newer ADR

### Updating Existing ADRs

ADRs should be **immutable** (don't change decisions after acceptance). If a decision changes:
1. Create a new ADR
2. Mark old ADR as "Superseded by ADR-XXX"
3. Reference old ADR in new one

---

## References

- [ADR Process Guide](https://adr.github.io/)
- [Architecture Decision Records (Michael Nygard)](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)

---

**END OF ARCHITECTURE DECISION RECORDS**