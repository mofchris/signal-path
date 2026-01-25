# CLAUDE.md — Project Instructions

You are working on **Signal Path**, a turn-based, grid-based tactical puzzle game built to demonstrate strong software engineering fundamentals through game development.

This file is the single source of truth for how you should collaborate on this codebase.

---

## 0) Project Context & Goals

### Purpose
This is a **resume/portfolio project** designed to showcase computer science fundamentals through practical game development. The game itself is the medium; the engineering is the message.

### What This Project Demonstrates
- **Data structures**: Graphs (grid navigation), stacks (undo/replay), queues (BFS pathfinding)
- **Algorithms**: A*/BFS for movement, procedural generation, weighted randomness
- **Systems design**: Deterministic simulation, state management, save/load serialization
- **Clean architecture**: Separation of concerns, testable pure logic, data-driven design
- **Software discipline**: Incremental development, validation, documentation

### Interview Talking Points
> "I built a turn-based puzzle game to force myself to reason about state, constraints, and decision-making the same way real systems do. I chose this format because every move is explicit and testable—it let me design the game as a deterministic system rather than relying on ad-hoc behavior. The project started as simple grid navigation and evolved into a data-driven system with procedural levels, reward balancing, and state persistence."

### Why This Works for Resumes
- Maps naturally to CS concepts without forcing them
- Scales from simple to complex (shows growth potential)
- Easy to demo in 30 seconds
- Avoids "tutorial clone" stigma
- Clear engineering focus over art/visuals

---

## 1) Product Summary

### Game Identity
- **Title**: Signal Path
- **Genre**: Turn-based tactical puzzle
- **Platform**: Web (desktop + mobile responsive)
- **Engine**: Web (HTML5 Canvas / TypeScript)
- **Target audience**: Technical interviewers, portfolio reviewers

### Core Concept
You are an operator guiding a maintenance drone through a damaged facility. Each level is a grid-based puzzle where:
- **Power lines, hazards, and doors** create movement constraints
- The **drone has limited energy** (each move costs energy)
- The **goal** is to reach the destination and restore systems efficiently
- **Turns are discrete**: Player acts → hazards resolve → check win/lose

### What Makes It Work
- **Not an action game** (deliberate, thoughtful)
- **Not a platformer** (no physics complexity)
- **Not a clone** (original IP with clear engineering focus)

### Core Loop
1. Observe the grid state (walls, hazards, energy remaining)
2. Plan a path to the goal
3. Execute moves one at a time
4. Hazards activate after player turn
5. Reach goal with energy remaining = win
6. Run out of energy or hit hazard = lose

---

## 2) Non-negotiable Engineering Constraints

### Determinism
- Core gameplay simulation **must be deterministic**: same initial state + same action sequence = same result every time
- If randomness is added (procedural generation), it must be **seeded** and the seed must be part of the game state
- No hidden state, no frame-time dependencies, no race conditions

### Separation of Concerns
- **Pure game logic** (in `src/core/`) must not depend on rendering, DOM, Canvas, or any web APIs
- Core logic should be testable in Node.js without a browser
- UI layer (`src/ui/`) translates user input → actions, and game state → visuals
- Dependency rule: `ui` may import from `core`; `core` must never import from `ui`

### Data-Driven Content
- Levels must live in `content/levels/` as JSON files
- Code may include sample content for tests, but production levels must be external files
- You should be able to add/modify levels without changing code (within reason)
- Each level file must validate against a documented schema

### Small Diffs and Incremental Work
- Prefer minimal changes that work and can be tested immediately
- Avoid broad refactors unless explicitly requested
- Do not introduce new dependencies (npm packages) without asking first
- If a feature requires multiple steps, implement the simplest version first

---

## 3) Technology Stack

### Core Technologies
- **Language**: TypeScript (strict mode)
- **Runtime**: Browser (ES2020+)
- **Rendering**: HTML5 Canvas 2D
- **Build tool**: Vite (fast, modern, zero-config)
- **Testing**: Vitest (for unit tests of core logic)
- **Formatting**: Prettier
- **Linting**: ESLint

### Why These Choices
- **TypeScript**: Type safety, better tooling, demonstrates modern JS practices
- **Canvas**: Direct pixel control, simple API, no framework overhead
- **Vite**: Fast dev server, instant HMR, simple build process
- **No game engine**: Shows you understand fundamentals, not just engine APIs

---

## 4) Version Control Rules

### Repository
- **Remote**: https://github.com/mofchris/signal-path
- **Branch**: `main` (single branch workflow for simplicity)

### Commit Frequency
- **Commit after every 2 completed steps** (at minimum)
- Push to GitHub immediately after committing
- Always verify tests pass before committing

### Commit Workflow
```bash
# 1. Verify tests pass
npm run test:ci

# 2. Check what will be committed
git status

# 3. Stage all changes
git add .

# 4. Commit with descriptive message
git commit -m "Steps X-Y: Brief description"

# 5. Push to GitHub
git push
```

### Commit Message Format
```
Steps X-Y: Brief description of changes

- Bullet point of major change 1
- Bullet point of major change 2
```

### Examples
```
Steps 5-6: Implement action system and game rules

- Add validateAction, applyAction, getValidActions
- Add turn resolution with win/lose conditions
- 161 tests passing, 98% coverage
```

### Important: No AI Attribution
- **Do NOT add "Co-Authored-By: Claude" or any AI attribution** to commit messages
- This is a portfolio project and should appear as the developer's own work
- Keep commit messages focused on what changed, not who/what wrote it

### What Gets Committed
**Included:**
- `src/` - All source code
- `tests/` - All test files
- `content/` - Level JSON files
- `docs/` - Documentation
- Config files (package.json, tsconfig.json, etc.)
- `CLAUDE.md`, `README.md`, `PROJECT_STATUS.md`

**Excluded (via .gitignore):**
- `node_modules/` - Dependencies (reinstall with `npm install`)
- `dist/` - Build output (regenerate with `npm run build`)
- `coverage/` - Test coverage reports
- `.env` - Environment variables (if any)

### Recovery
If someone clones the repo:
```bash
git clone https://github.com/mofchris/signal-path.git
cd signal-path
npm install
npm run dev
```

---

## 5) Repository Structure

```
signal-path/
├── CLAUDE.md                  # This file (AI collaboration instructions)
├── README.md                  # User-facing project overview (how to run)
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Build configuration
│
├── docs/                      # Design and technical documentation
│   ├── GDD.md                 # Game Design Document (rules, mechanics)
│   ├── TECH.md                # Technical architecture (data structures, systems)
│   ├── DECISIONS.md           # Architecture Decision Records (ADR)
│   ├── TESTING.md             # Testing strategy and conventions
│   ├── LEVEL_FORMAT.md        # Level file schema and validation
│   └── ROADMAP.md             # Feature priority and milestones
│
├── src/
│   ├── core/                  # Pure game logic (no browser/DOM dependencies)
│   │   ├── types.ts           # Core data structures (GameState, Action, etc.)
│   │   ├── state.ts           # State management and initialization
│   │   ├── actions.ts         # Action validation and application
│   │   ├── rules.ts           # Game rules and turn resolution
│   │   ├── pathfinding.ts     # BFS/A* for movement and reachability
│   │   ├── validation.ts      # Level validation logic
│   │   └── serialization.ts   # Save/load logic
│   │
│   ├── ui/                    # Web-specific rendering and input
│   │   ├── renderer.ts        # Canvas drawing logic
│   │   ├── input.ts           # Keyboard/mouse/touch event handling
│   │   ├── scenes/            # Menu, game, level select, etc.
│   │   └── main.ts            # Entry point
│   │
│   └── content/               # Level loader and content management
│       ├── loader.ts          # Load and parse level files
│       └── validator.ts       # Runtime level validation
│
├── content/                   # Data-driven content
│   └── levels/                # Level JSON files
│       ├── 01_tutorial.json
│       ├── 02_hazards.json
│       └── ...
│
├── tests/                     # Test files (mirror src/ structure)
│   ├── core/
│   │   ├── actions.test.ts
│   │   ├── rules.test.ts
│   │   └── pathfinding.test.ts
│   └── determinism.test.ts    # Replay tests for determinism
│
└── public/                    # Static assets
    └── index.html             # HTML entry point
```

### Dependency Rules (Critical)
- `src/ui/` may import from `src/core/` and `src/content/`
- `src/core/` must be **completely independent** (no imports from `ui` or browser APIs)
- `src/content/` may import from `src/core/` for type definitions
- Tests can import from anything

---

## 5) Source-of-Truth Documentation

When implementing or changing behavior, follow these documents **in priority order**:

1. **`docs/GDD.md`** — Game rules, mechanics, win/lose conditions
2. **`docs/LEVEL_FORMAT.md`** — How levels are represented and validated
3. **`docs/TECH.md`** — Data structures, module boundaries, design patterns
4. **`docs/DECISIONS.md`** — Prior architectural choices you must respect
5. **`docs/TESTING.md`** — How we validate correctness

### Documentation Workflow
- If documentation is **missing** for a feature you're implementing, create or extend the relevant doc first
- If a rule **conflicts** with code, ask before changing either
- If you make a **design choice**, document it in `docs/DECISIONS.md`

### What Goes Where
- **GDD.md**: Game behavior (how hazards work, energy costs, win conditions)
- **TECH.md**: Code organization (how GameState is structured, module responsibilities)
- **DECISIONS.md**: Why we chose X over Y (e.g., "Why Canvas instead of React")
- **TESTING.md**: Testing approach (determinism checks, level validation)
- **LEVEL_FORMAT.md**: JSON schema, validation rules, example levels

---

## 6) Core Technical Expectations

This project clearly demonstrates the following CS concepts:

### Data Structures
| Game System | CS Concept |
|-------------|------------|
| Grid navigation | **Graph representation** (adjacency, connectivity) |
| Player movement | **BFS/DFS/A*** pathfinding algorithms |
| Undo/replay | **Stack** (command pattern) |
| Turn order | **Queue** (action resolution) |
| Level storage | **Serialization** (JSON encode/decode) |
| Tile properties | **Hash maps** (efficient lookups) |

### Algorithms
| Feature | Algorithm |
|---------|-----------|
| Shortest path to goal | **A* search** with Manhattan distance heuristic |
| Reachable tiles | **BFS flood fill** |
| Level generation | **Procedural generation** (weighted randomness, constraint satisfaction) |
| Collision detection | **Spatial hashing** or grid-based lookup |
| State validation | **Invariant checking** (pre/post conditions) |

### Systems Design
- **State modeling**: Single authoritative `GameState` structure
- **Deterministic simulation**: `applyAction(state, action) -> newState`
- **Separation of concerns**: Core logic independent of UI/rendering
- **Data-driven design**: Levels as external JSON, not hardcoded
- **Testability**: Pure functions, no hidden state

---

## 7) Working Agreement: How You Should Respond

### Always Start with a Plan
Before editing code, produce:
1. A **short plan** (3–7 steps)
2. The **files you expect to touch**
3. Any **assumptions** you're making

Example:
```
Plan:
1. Add energy cost to Action type in types.ts
2. Update applyAction in actions.ts to deduct energy
3. Add energy check to action validation
4. Update tests in actions.test.ts

Files: src/core/types.ts, src/core/actions.ts, tests/core/actions.test.ts
Assumption: Energy cost is fixed at 1 per move for now
```

### Ask Questions Only If Blocking
- If something is **ambiguous but not blocking**, choose the most reasonable approach consistent with the docs and note it as an assumption
- If something is **unclear and blocking**, ask before proceeding
- If you're **unsure between two approaches**, implement the simpler one and note the alternative

### Keep Changes Reviewable
- Prefer changes that are easy to review and revert
- Avoid rewriting unrelated parts of the codebase
- If multiple solutions exist, pick the **simplest** that satisfies constraints
- One logical change per commit (if simulating commits)

### No Silent Rule Changes
- If you change a **game rule**, update `docs/GDD.md`
- If you change **architecture**, add an entry to `docs/DECISIONS.md`
- If you add a **new system**, update `docs/TECH.md`

---

## 8) Preferred Implementation Patterns

### Game State
- Represent all state in a single authoritative structure: `GameState`
- State transitions should be explicit: `applyAction(state, action): GameState`
- Avoid hidden global state (use dependency injection if needed)
- Make state serializable (no functions, no circular references)

```typescript
interface GameState {
  levelId: string;
  grid: Grid;
  player: Entity;
  hazards: Hazard[];
  energy: number;
  turnCount: number;
  status: 'playing' | 'won' | 'lost';
  // ... other fields
}
```

### Actions
- Represent player input as discrete action objects:
  ```typescript
  type Action =
    | { type: 'move'; direction: Direction }
    | { type: 'wait' }
    | { type: 'undo' }
    | { type: 'restart' };
  ```
- Store action history to enable undo/replay later
- Validate actions before applying them

### Validation
- Validate level data **at load time** with clear error messages
- Keep validation logic in `src/core/validation.ts`
- Example checks:
  - Grid dimensions are valid
  - Player start position is walkable
  - Goal position exists and is reachable
  - Energy limit is positive

### Error Handling
- Use TypeScript's type system to prevent errors at compile time
- Validate external data (level files) at runtime
- Provide clear error messages with context (which level, which validation failed)

---

## 9) Testing and Validation

At minimum, every gameplay-affecting change should include **one of**:
- A **unit test** for core logic, OR
- A **deterministic simulation check** (known input sequence → expected state), OR
- A **validation test** (e.g., level validator confirms schema compliance)

### Testing Strategy
See `docs/TESTING.md` for full conventions. Key principles:

1. **Core logic is unit tested** (pure functions, deterministic)
2. **UI is manually tested** (rendering, input feel)
3. **Integration is tested via replays** (full game simulations)

### Example Test Pattern
```typescript
test('moving into hazard ends game', () => {
  const state = createTestState({
    player: { x: 0, y: 0 },
    hazards: [{ x: 1, y: 0, type: 'spike' }],
  });
  
  const newState = applyAction(state, { type: 'move', direction: 'right' });
  
  expect(newState.status).toBe('lost');
});
```

---

## 10) Build / Run / Test Commands

```bash
# Install dependencies
npm install

# Run development server (hot reload)
npm run dev
# Opens browser to http://localhost:5173

# Build for production
npm run build
# Output in dist/

# Preview production build
npm run preview

# Run tests (watch mode)
npm test

# Run tests (single run)
npm run test:ci

# Type check
npm run typecheck

# Lint
npm run lint

# Format code
npm run format
```

### Scripts in package.json
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ci": "vitest run",
    "test:coverage": "vitest run --coverage",
    "bench": "vitest bench",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src/",
    "format": "prettier --write src/",
    "validate-level": "tsx tools/validate-level.ts",
    "validate-levels": "tsx tools/validate-levels.ts",
    "prepare": "husky install"
  }
}
```

---

## 11) What NOT to Do

### Do Not
- ❌ Hardcode levels into gameplay code
- ❌ Couple core logic to frame timing or Canvas APIs
- ❌ Add large frameworks/dependencies (React, Phaser, etc.) without approval
- ❌ "Improve architecture" preemptively—only change what's required for the requested feature
- ❌ Change public APIs without updating all references and docs
- ❌ Use `any` type in TypeScript (use `unknown` if you must)
- ❌ Put game logic in UI event handlers
- ❌ Make the game "feel good" at the expense of determinism

### Do
- ✅ Keep core logic pure and testable
- ✅ Write small, focused functions
- ✅ Document non-obvious decisions
- ✅ Test edge cases (empty grid, unreachable goals, etc.)
- ✅ Ask before adding dependencies
- ✅ Commit early and often (or simulate this in your responses)

---

## 12) Default Feature Workflow

Use this workflow unless instructed otherwise:

### For Any New Feature
1. **Confirm intended behavior** against `docs/GDD.md` (update docs if needed)
2. **Implement core logic** in `src/core/` (deterministic, testable)
3. **Add/adjust parsing/validation** if content format changes
4. **Add at least one test** or deterministic check
5. **Integrate into UI layer** in `src/ui/` only after core is correct
6. **Update `docs/DECISIONS.md`** if any key decisions were made

### Example: Adding Hazards
1. **Docs**: Define hazard behavior in `docs/GDD.md` (damage on contact, turn-based activation)
2. **Core**: Add `Hazard` type to `types.ts`, update `rules.ts` to resolve hazards after player turn
3. **Content**: Update `docs/LEVEL_FORMAT.md` to include hazard schema, update level validator
4. **Tests**: Add test for hazard collision in `tests/core/rules.test.ts`
5. **UI**: Add hazard rendering in `renderer.ts`
6. **Decisions**: Document why hazards activate after player (player needs to see result)

---

## 13) Commit Message Style

Use concise, informative commits (or simulate this structure):

```
core: implement turn resolution for hazards
content: add level 03 with hazard introduction
docs: clarify win/lose checks and turn order
ui: add HUD for energy display and restart button
tests: add deterministic replay for level 01-03
fix: prevent player from moving out of bounds
refactor: extract grid utilities to separate module
```

**Format**: `<scope>: <short description>`

**Scopes**: `core`, `ui`, `content`, `docs`, `tests`, `fix`, `refactor`, `chore`

---

## 14) AI-Specific Guidance

When working on this codebase:

### Read Docs First
- Before implementing any feature, check if there's relevant documentation
- If docs are missing, create them first (even if brief)
- The docs are the specification; code is the implementation

### Propose Before Implementing
- For complex changes, outline your approach first
- Show me the files you'll change and why
- Wait for confirmation on architectural decisions

### Incremental Progress
- Prefer working code over perfect code
- Implement features in minimal viable form first
- We can always refine later

### Be Explicit About Trade-offs
- If you make a simplifying assumption, say so
- If you skip something for later, note it in code comments
- If two approaches are equivalent, pick one and document why

---

## 15) Project Phases (Roadmap)

See `docs/ROADMAP.md` for full details. High-level phases:

### Phase 1: Core Foundation (Current)
- Grid representation and rendering
- Player movement (4-directional)
- Level loading from JSON
- Win condition (reach goal)
- Energy system (limited moves)

### Phase 2: Mechanics
- Hazards (spikes, lasers, etc.)
- Obstacles (doors, keys)
- Turn-based resolution
- Lose conditions

### Phase 3: Polish
- Undo/replay system
- Level validation tool
- Multiple levels
- Level select screen

### Phase 4: Advanced (Resume Highlights)
- Procedural level generation
- Pathfinding visualization
- Save/load system
- Deterministic replay tests

---

## 16) How to Use This File

### For Claude (AI)
- Read this file **completely** before starting any task
- Reference specific sections when making decisions
- If instructions conflict, ask for clarification
- This file overrides default AI behaviors around game development

### For Humans
- This file codifies the project's engineering philosophy
- Share this with collaborators or interviewers to show intent
- Update this file when the project direction changes
- Think of it as the "constitution" of the codebase

---

## 17) Resume-Specific Guidance

### When Describing This Project
**On Resume**:
> "Built a data-driven, turn-based puzzle game emphasizing deterministic simulation and algorithmic decision-making"

**Bullet Points**:
- Designed grid-based levels modeled as graphs and implemented pathfinding and reachability logic for player and hazards
- Developed procedural level generation with difficulty scaling using weighted randomness
- Implemented a state-based entity system (player, hazards, interactables) with save/load persistence
- Structured the project to allow reproducible simulations and incremental feature expansion

**In Interviews**:
> "I wanted to build something that forced me to reason about state, constraints, and decision-making the same way real systems do. I chose a turn-based puzzle game because every move is explicit and testable. That let me design the game as a deterministic system rather than relying on ad-hoc behavior. The project started as a simple grid navigation problem and evolved into a data-driven system with procedural levels, reward balancing, and state persistence. I treated it as a systems-engineering exercise disguised as a game."

### What Interviewers Care About
- Can you architect a non-trivial system?
- Can you separate concerns and maintain boundaries?
- Can you write testable code?
- Can you reason about state and invariants?
- Can you communicate technical decisions?

This project answers **yes** to all of these.

---

## Final Notes

This file is a **living document**. As the project evolves, update this file to reflect new decisions, tools, or patterns. The goal is to maintain a clear, consistent vision that anyone (AI or human) can follow to contribute effectively.

**Remember**: The game is the medium. The engineering is the message.