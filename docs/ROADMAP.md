# Development Roadmap
## Signal Path

**Last updated**: 2025-01-22  
**Document version**: 1.0  
**Current phase**: Phase 0 (Documentation Complete)

---

## Document Purpose

This roadmap provides a **complete development plan** from initial setup to portfolio-ready showcase. It defines:
- Development phases and their goals
- Feature priorities (must-have vs. nice-to-have)
- Concrete milestones and success criteria
- Time estimates and dependencies
- Risk assessment and mitigation
- Portfolio optimization strategy

**For developers**: This is your development guide from zero to complete game.

---

## Table of Contents

1. [Project Vision](#project-vision)
2. [Development Philosophy](#development-philosophy)
3. [Phase Overview](#phase-overview)
4. [Current Status](#current-status)
5. [Phase 0: Documentation (Complete)](#phase-0-documentation-complete)
6. [Phase 1: Foundation](#phase-1-foundation)
7. [Phase 2: Core Mechanics](#phase-2-core-mechanics)
8. [Phase 3: Content & Polish](#phase-3-content--polish)
9. [Phase 4: Advanced Features](#phase-4-advanced-features)
10. [Phase 5: Portfolio Showcase](#phase-5-portfolio-showcase)
11. [Optional Extensions](#optional-extensions)
12. [Milestones & Checkpoints](#milestones--checkpoints)
13. [Risk Assessment](#risk-assessment)
14. [Time Estimates](#time-estimates)
15. [Dependencies Graph](#dependencies-graph)
16. [Success Criteria](#success-criteria)
17. [Portfolio Optimization](#portfolio-optimization)

---

## Project Vision

### North Star

Build a **portfolio-quality game** that demonstrates:
- Software engineering fundamentals (not just game development)
- Clean architecture and separation of concerns
- Algorithmic thinking (pathfinding, graph traversal)
- Systems design (deterministic state machines)
- Testing rigor (deterministic replay, high coverage)

### Target Audience

**Primary**: Technical recruiters, hiring managers, senior engineers reviewing portfolio

**Secondary**: Players who enjoy puzzle games

### Success Definition

**Portfolio success**: Project generates technical discussions in interviews

**Game success**: 20+ playable levels, smooth UX, clear mechanics

---

## Development Philosophy

### Principles

1. **Working game first, polish later**: Get playable ASAP, refine over time
2. **Incremental delivery**: Each phase produces something runnable
3. **Test as you go**: No "testing phase" at the end
4. **Document decisions**: Capture rationale in DECISIONS.md
5. **Portfolio-driven**: Every feature should be explainable in interviews

### Anti-Patterns to Avoid

❌ **Premature optimization**: Don't optimize before it's measurably slow  
❌ **Feature creep**: Stick to phases, resist adding "just one more thing"  
❌ **Polish before functionality**: Core mechanics before animations  
❌ **Testing debt**: Don't skip tests with "I'll add them later"  
❌ **Architecture astronauting**: Simple solutions over clever ones

---

## Phase Overview

### High-Level Timeline

```
Phase 0: Documentation        [COMPLETE]    0 weeks   (done)
Phase 1: Foundation           [NEXT]        2-3 weeks
Phase 2: Core Mechanics       [PLANNED]     2-3 weeks
Phase 3: Content & Polish     [PLANNED]     2-4 weeks
Phase 4: Advanced Features    [OPTIONAL]    3-5 weeks
Phase 5: Portfolio Showcase   [FINAL]       1-2 weeks
─────────────────────────────────────────────────────
Total (MVP):                  ~8-12 weeks
Total (Complete):             ~15-20 weeks
```

### Phase Dependencies

```
Phase 0 (Docs)
    ↓
Phase 1 (Foundation) → Required for Phase 2
    ↓
Phase 2 (Core Mechanics) → Required for Phase 3
    ↓
Phase 3 (Content & Polish) → Minimum viable product
    ↓
Phase 4 (Advanced) → Optional, enhances portfolio
    ↓
Phase 5 (Showcase) → Portfolio presentation
```

---

## Current Status

### ✅ Completed (Phase 0)

**Documentation Suite** (8 comprehensive documents):
- [x] CLAUDE.md - Project instructions for AI collaboration
- [x] README.md - User-facing project overview
- [x] GDD.md - Complete game design specification
- [x] TECH.md - Technical architecture and systems
- [x] LEVEL_FORMAT.md - Level file specification
- [x] TESTING.md - Testing strategy and conventions
- [x] CONFIG.md - Configuration files reference
- [x] DECISIONS.md - Architecture decision records
- [x] ROADMAP.md - This document

**Total**: ~7,500 lines of comprehensive documentation

### 🎯 Next Up (Phase 1)

**Immediate priorities**:
1. Project initialization (package.json, configs)
2. Repository structure (create directories)
3. Core type definitions (GameState, Action, etc.)
4. Basic grid rendering (Canvas drawing)
5. Player movement (4-directional)

---

## Phase 0: Documentation (Complete)

**Status**: ✅ Complete  
**Duration**: Completed 2025-01-22  
**Goal**: Establish complete project foundation through documentation

### Deliverables

- [x] **CLAUDE.md**: AI collaboration guide with complete project context
- [x] **README.md**: Portfolio-ready overview with quick start
- [x] **GDD.md**: Complete game design (rules, mechanics, progression)
- [x] **TECH.md**: Technical architecture (data structures, algorithms, patterns)
- [x] **LEVEL_FORMAT.md**: JSON schema and level design guidelines
- [x] **TESTING.md**: Testing strategy with complete examples
- [x] **CONFIG.md**: All configuration files (package.json, tsconfig, vite, eslint)
- [x] **DECISIONS.md**: 22 ADRs documenting all major choices
- [x] **ROADMAP.md**: This development plan

### Success Criteria

- [x] Every aspect of project is documented
- [x] No placeholders or TODOs in any doc
- [x] All config files are copy-paste ready
- [x] Clear development path is established

### Outcome

**Complete foundation** for development. Any developer (human or AI) can understand the project's goals, architecture, and implementation plan from documentation alone.

---

## Phase 1: Foundation

**Status**: 🎯 Next  
**Estimated duration**: 2-3 weeks  
**Goal**: Establish working codebase with minimal playable game

### Objectives

1. **Project Setup**: Initialize npm project with all dependencies
2. **Repository Structure**: Create directory hierarchy matching TECH.md
3. **Core Types**: Implement all TypeScript interfaces (GameState, Action, Grid, etc.)
4. **Grid System**: 2D array representation and basic utilities
5. **Rendering**: Canvas drawing for grid, tiles, player
6. **Movement**: Player can move in 4 directions
7. **Win Condition**: Reaching goal ends game
8. **Energy System**: Moves cost energy, running out ends game
9. **Level Loading**: Parse JSON level files
10. **Basic Testing**: Test infrastructure and first unit tests

### Tasks Breakdown

#### 1.1: Project Initialization (2-4 hours)
- [ ] Create project directory
- [ ] Initialize npm (`npm init`)
- [ ] Install all dependencies from CONFIG.md
- [ ] Copy all config files (tsconfig, vite.config, eslint, prettier)
- [ ] Create directory structure (`src/`, `tests/`, `content/`, `docs/`)
- [ ] Initialize Git repository
- [ ] Create `.gitignore`
- [ ] Verify setup (`npm run typecheck`, `npm test`)

**Acceptance criteria**:
- All npm scripts work
- TypeScript compiles without errors
- Tests run (even if 0 tests)
- Dev server starts (`npm run dev`)

---

#### 1.2: Core Type Definitions (4-6 hours)
- [ ] Create `src/core/types.ts` with all interfaces:
  - [ ] `Position`
  - [ ] `Tile`, `TileType`, `Grid`
  - [ ] `Player`, `Inventory`
  - [ ] `Hazard`, `HazardType`
  - [ ] `Interactable`, `InteractableType`
  - [ ] `Action`, `Direction`
  - [ ] `GameState`, `GameStatus`
  - [ ] `LevelData`
  - [ ] `ValidationResult`

**Acceptance criteria**:
- All types compile
- No `any` types (strict mode passes)
- Discriminated unions for polymorphic types
- JSDoc comments on all public interfaces

---

#### 1.3: Grid System (6-8 hours)
- [ ] Implement `src/core/state.ts`:
  - [ ] `createGrid()` - Initialize 2D array
  - [ ] `getTileAt()` - Safe tile access
  - [ ] `isInBounds()` - Bounds checking
  - [ ] `getNeighbors()` - Get adjacent tiles
  - [ ] `getWalkableNeighbors()` - Filter walkable tiles

- [ ] Write tests (`tests/core/state.test.ts`):
  - [ ] Grid creation with correct dimensions
  - [ ] Tile access (in-bounds and out-of-bounds)
  - [ ] Neighbor calculation
  - [ ] Walkability checks

**Acceptance criteria**:
- All grid utilities work correctly
- Test coverage > 90%
- No mutations (all functions are pure)

---

#### 1.4: State Management (8-10 hours)
- [ ] Implement `src/core/state.ts`:
  - [ ] `createGameState()` - Initialize from LevelData
  - [ ] `resetGameState()` - Reset to initial state
  - [ ] Query functions (getPlayerPosition, etc.)

- [ ] Implement `src/core/actions.ts`:
  - [ ] `validateAction()` - Check if action is legal
  - [ ] `applyAction()` - Apply action, return new state
  - [ ] `getValidActions()` - List all legal actions

- [ ] Write tests:
  - [ ] State initialization
  - [ ] Action validation (valid and invalid cases)
  - [ ] Action application (movement, energy deduction)
  - [ ] Immutability (old state unchanged)

**Acceptance criteria**:
- Actions create new state objects (immutability)
- Invalid actions return original state
- Test coverage > 90%

---

#### 1.5: Game Rules (6-8 hours)
- [ ] Implement `src/core/rules.ts`:
  - [ ] `checkWinCondition()` - Player on goal?
  - [ ] `checkLoseCondition()` - Hazard or energy depleted?
  - [ ] `resolveTurn()` - Full turn resolution
  - [ ] `updateGameStatus()` - Set won/lost

- [ ] Write tests:
  - [ ] Win when reaching goal
  - [ ] Lose when hitting hazard
  - [ ] Lose when energy reaches 0
  - [ ] Hazard takes priority over goal

**Acceptance criteria**:
- Turn resolution is deterministic
- All win/lose conditions tested
- Test coverage > 95%

---

#### 1.6: Basic Rendering (8-12 hours)
- [ ] Create `public/index.html` with canvas element
- [ ] Implement `src/ui/main.ts`:
  - [ ] Canvas setup
  - [ ] Game loop (requestAnimationFrame)
  - [ ] State management (current game state)

- [ ] Implement `src/ui/renderer.ts`:
  - [ ] `renderGrid()` - Draw background tiles
  - [ ] `renderPlayer()` - Draw player sprite
  - [ ] `renderGoal()` - Draw goal marker
  - [ ] `renderHUD()` - Draw energy and turn count
  - [ ] `render()` - Master render function

**Acceptance criteria**:
- Grid renders correctly
- Player visible on grid
- Goal visible
- HUD shows energy and turns
- Runs at 60 FPS

---

#### 1.7: Input Handling (4-6 hours)
- [ ] Implement `src/ui/input.ts`:
  - [ ] `setupInputHandlers()` - Register event listeners
  - [ ] `handleKeyDown()` - Map keys to actions
  - [ ] Arrow keys + WASD support
  - [ ] R key for restart

- [ ] Connect input to game loop:
  - [ ] Input → Action → State update → Re-render

**Acceptance criteria**:
- All movement keys work
- Invalid moves are rejected (no state change)
- Restart works
- No lag between input and response

---

#### 1.8: Level Loading (6-8 hours)
- [ ] Create `src/content/types.ts` - LevelData interface
- [ ] Implement `src/content/loader.ts`:
  - [ ] `loadLevel()` - Fetch and parse JSON
  - [ ] Error handling for missing files

- [ ] Create first level: `content/levels/01_first_steps.json`
  - [ ] 5x5 grid
  - [ ] Player at (0,0), goal at (4,4)
  - [ ] No obstacles
  - [ ] Energy: 12 (50% buffer)

**Acceptance criteria**:
- Level loads from JSON
- Invalid JSON shows error
- Level data creates valid GameState
- First level is playable

---

#### 1.9: Basic Validation (4-6 hours)
- [ ] Implement `src/core/validation.ts`:
  - [ ] `validateLevel()` - Check level is valid
  - [ ] Grid size validation (5-20)
  - [ ] Position validation (in bounds)
  - [ ] Energy validation (sufficient for goal)

- [ ] Write tests for validation

**Acceptance criteria**:
- Invalid levels are rejected
- Validation errors are clear
- All validation rules from LEVEL_FORMAT.md implemented

---

#### 1.10: Integration Testing (4-6 hours)
- [ ] Implement `tests/integration/level-flow.test.ts`
  - [ ] Load level → play → win
  - [ ] Load level → play → lose (energy)
  
- [ ] Implement `tests/determinism.test.ts`
  - [ ] Run same actions 10x, verify identical results

**Acceptance criteria**:
- Full level playthrough works
- Determinism is proven
- Integration tests pass

---

### Phase 1 Deliverables

**Core**:
- ✅ All TypeScript types defined
- ✅ Grid system working
- ✅ State management (immutable updates)
- ✅ Action system (validate + apply)
- ✅ Turn resolution (win/lose checks)

**UI**:
- ✅ Canvas rendering (grid, player, goal, HUD)
- ✅ Input handling (keyboard)
- ✅ Game loop running

**Content**:
- ✅ Level loading from JSON
- ✅ First playable level
- ✅ Level validation

**Testing**:
- ✅ Unit tests for core logic (>90% coverage)
- ✅ Integration tests (full game flow)
- ✅ Deterministic replay tests

### Phase 1 Success Criteria

- [ ] Can play a level from start to finish
- [ ] Can win by reaching goal
- [ ] Can lose by running out of energy
- [ ] Movement feels responsive
- [ ] No console errors
- [ ] All tests pass
- [ ] TypeScript strict mode passes
- [ ] Code is documented

### Phase 1 Risks & Mitigation

**Risk**: Canvas rendering performance issues  
**Mitigation**: Profile early, optimize if < 60 FPS

**Risk**: TypeScript type errors blocking progress  
**Mitigation**: Start with simpler types, add constraints incrementally

**Risk**: Testing setup takes too long  
**Mitigation**: Use Vitest examples from TESTING.md

---

## Phase 2: Core Mechanics

**Status**: 📅 Planned  
**Estimated duration**: 2-3 weeks  
**Goal**: Add key game mechanics that make puzzles interesting

### Prerequisites

- Phase 1 complete (basic game works)

### Objectives

1. **Hazards**: Static hazards (spikes, lasers) that end game on contact
2. **Keys & Doors**: Collectible keys unlock color-matched doors
3. **Undo System**: Step backward through action history
4. **Animation**: Smooth movement transitions
5. **Sound Effects**: Audio feedback for actions
6. **Multiple Levels**: 5-10 playable levels with progression

### Tasks Breakdown

#### 2.1: Hazard System (6-8 hours)
- [ ] Add hazards to GameState
- [ ] Implement hazard rendering
- [ ] Add hazard collision detection to turn resolution
- [ ] Create level with hazards (02_first_hazard.json)
- [ ] Write tests for hazard interactions

**Acceptance criteria**:
- Stepping on hazard ends game (lose)
- Different hazard types render differently
- Tests verify hazard behavior

---

#### 2.2: Keys & Doors (10-12 hours)
- [ ] Add Interactable type to GameState
- [ ] Implement key collection (add to inventory)
- [ ] Implement door unlocking (check inventory)
- [ ] Render keys and doors (color-coded)
- [ ] Create level with keys/doors (03_locked_passage.json)
- [ ] Write tests for key-door interactions

**Acceptance criteria**:
- Keys are collected when player moves onto them
- Doors block movement until key collected
- Door opens when player has matching key
- Tests verify collection and unlocking

---

#### 2.3: Undo System (8-10 hours)
- [ ] Add actionHistory to GameState
- [ ] Implement action recording
- [ ] Implement undo (pop history, restore state)
- [ ] Add 'U' key binding for undo
- [ ] Show undo indicator in HUD
- [ ] Write tests for undo functionality

**Acceptance criteria**:
- Can undo any number of moves
- Undo restores exact previous state
- Can't undo past start
- Tests verify undo correctness

---

#### 2.4: Movement Animation (6-8 hours)
- [ ] Implement lerp/tween system
- [ ] Add animation state to UI layer
- [ ] Smooth transition between tiles (200ms)
- [ ] Queue inputs during animation
- [ ] Keep core logic instant (animation is UI-only)

**Acceptance criteria**:
- Movement looks smooth
- No input lag (queuing works)
- Animation doesn't affect game logic
- Can disable animation for testing

---

#### 2.5: Sound Effects (4-6 hours)
- [ ] Create/find sound effects:
  - [ ] Move (footstep)
  - [ ] Collect key (chime)
  - [ ] Open door (unlock)
  - [ ] Hit hazard (ouch)
  - [ ] Win (victory)
  - [ ] Lose (defeat)

- [ ] Implement audio system:
  - [ ] Load sounds
  - [ ] Play on events
  - [ ] Volume control
  - [ ] Mute toggle

**Acceptance criteria**:
- Sounds play for all actions
- Can mute audio
- No audio lag
- Sounds are CC0/licensed

---

#### 2.6: Level Creation (12-16 hours)
- [ ] Design 5-10 levels introducing mechanics:
  - [ ] 01: Tutorial (movement, energy)
  - [ ] 02: First hazard (avoidance)
  - [ ] 03: Keys and doors (exploration)
  - [ ] 04: Multiple keys (planning)
  - [ ] 05: Tight energy (optimization)
  - [ ] 06-10: Combination puzzles

- [ ] Validate all levels
- [ ] Playtest each level
- [ ] Balance energy budgets

**Acceptance criteria**:
- All levels are completable
- Difficulty curve is smooth
- Each level teaches one concept
- All levels validated by validator

---

### Phase 2 Deliverables

- ✅ Hazards working (spikes, lasers)
- ✅ Keys and doors working (collection, unlocking)
- ✅ Undo system working
- ✅ Movement animations smooth
- ✅ Sound effects for all actions
- ✅ 5-10 playable levels

### Phase 2 Success Criteria

- [ ] Can play through all levels
- [ ] All mechanics work correctly
- [ ] Game feels polished (animation, sound)
- [ ] Undo system is reliable
- [ ] Tests cover all new mechanics (>85% coverage)

---

## Phase 3: Content & Polish

**Status**: 📅 Planned  
**Estimated duration**: 2-4 weeks  
**Goal**: Complete content and polish for portfolio presentation

### Prerequisites

- Phase 2 complete (all mechanics working)

### Objectives

1. **Level Select Screen**: Menu to choose levels
2. **More Levels**: 20+ total levels
3. **Visual Polish**: Better graphics, particles, effects
4. **Tutorial System**: Hints and instructions for new players
5. **Save/Load**: Progress persistence
6. **Mobile Support**: Touch controls, responsive layout
7. **Performance Optimization**: 60 FPS on all devices

### Tasks Breakdown

#### 3.1: Scene System (8-10 hours)
- [ ] Implement scene manager
- [ ] Create MenuScene (title screen)
- [ ] Create LevelSelectScene (choose level)
- [ ] Create GameScene (playing)
- [ ] Create GameOverScene (win/lose)
- [ ] Scene transitions

**Acceptance criteria**:
- Can navigate between scenes
- Game state preserved across scenes
- Scene transitions smooth

---

#### 3.2: Level Select Screen (6-8 hours)
- [ ] Design level select UI
- [ ] Show level previews (thumbnail, name, difficulty)
- [ ] Show completion status (completed, stars, best time)
- [ ] Level unlocking (sequential)
- [ ] Render level select

**Acceptance criteria**:
- All levels visible
- Can click to start level
- Locked levels are grayed out
- Shows which levels are completed

---

#### 3.3: Additional Levels (16-24 hours)
- [ ] Design 10+ more levels (total 20+):
  - [ ] Tutorial section (1-3): Basics
  - [ ] Introduction (4-6): Individual mechanics
  - [ ] Combination (7-12): Multiple mechanics
  - [ ] Efficiency (13-15): Tight energy
  - [ ] Challenge (16-20): Complex puzzles
  - [ ] Bonus (20+): Extra hard

- [ ] Validate all levels
- [ ] Playtest extensively
- [ ] Balance difficulty

**Acceptance criteria**:
- 20+ completable levels
- Clear difficulty progression
- Each level feels distinct
- All levels validated

---

#### 3.4: Visual Polish (12-16 hours)
- [ ] Better tile graphics (or clean geometric)
- [ ] Particle effects (key pickup, door open, etc.)
- [ ] Screen shake (on hazard hit)
- [ ] Polish HUD design
- [ ] Color scheme refinement
- [ ] Consistent visual style

**Acceptance criteria**:
- Game looks professional
- Visual style is cohesive
- Effects enhance clarity (not distract)

---

#### 3.5: Tutorial System (6-8 hours)
- [ ] Add hint/instruction overlay
- [ ] First-time tips for each mechanic
- [ ] Dismissable help dialogs
- [ ] Visual indicators (arrow to goal, etc.)

**Acceptance criteria**:
- New players understand mechanics
- Hints don't interfere with gameplay
- Can disable hints

---

#### 3.6: Save/Load System (8-10 hours)
- [ ] Implement serialization (GameState → JSON)
- [ ] LocalStorage integration
- [ ] Save progress (level unlocks, completion)
- [ ] Auto-save on level complete
- [ ] Save best times/energy

**Acceptance criteria**:
- Progress persists across sessions
- Can clear save data
- Serialization is robust (handles version changes)

---

#### 3.7: Mobile Support (10-14 hours)
- [ ] Implement touch controls:
  - [ ] Swipe to move
  - [ ] Tap UI buttons
  - [ ] Pinch to zoom (optional)

- [ ] Responsive layout:
  - [ ] Scale canvas to screen
  - [ ] Adjust HUD for small screens
  - [ ] Test on various screen sizes

**Acceptance criteria**:
- Game playable on mobile
- Touch controls feel good
- No horizontal scrolling
- Readable on phone screen

---

#### 3.8: Performance Optimization (6-10 hours)
- [ ] Profile rendering (Chrome DevTools)
- [ ] Optimize draw calls (batch rendering)
- [ ] Lazy load levels (don't load all at once)
- [ ] Optimize asset loading
- [ ] Test on slower devices

**Acceptance criteria**:
- Maintains 60 FPS on target devices
- No frame drops during gameplay
- Loading times < 2 seconds

---

### Phase 3 Deliverables

- ✅ Complete game with 20+ levels
- ✅ Level select screen
- ✅ Save/load system
- ✅ Mobile support (touch controls)
- ✅ Visual polish and effects
- ✅ Tutorial/hint system
- ✅ Performance optimized

### Phase 3 Success Criteria

- [ ] Game feels complete (not a prototype)
- [ ] 20+ polished levels
- [ ] Works on desktop and mobile
- [ ] Progress saves between sessions
- [ ] Looks professional
- [ ] No bugs or crashes
- [ ] Ready to show in portfolio

---

## Phase 4: Advanced Features

**Status**: 🎁 Optional  
**Estimated duration**: 3-5 weeks  
**Goal**: Add advanced features that enhance portfolio value

### Prerequisites

- Phase 3 complete (polished game)

### Note

Phase 4 is **optional but highly valuable** for portfolio. Each feature is independent—pick what interests you most.

### Feature Options

#### 4.1: Procedural Level Generation (12-20 hours)
- [ ] Implement seeded random number generator
- [ ] Write level generation algorithm:
  - [ ] Generate connected grid
  - [ ] Place start and goal (maximize distance)
  - [ ] Add obstacles (ensure solvability)
  - [ ] Add hazards (don't block optimal path)
  - [ ] Calculate energy budget

- [ ] Difficulty parameters (adjust generation)
- [ ] Validation (ensure all levels are solvable)
- [ ] Endless mode (keep generating levels)

**Portfolio value**: Demonstrates algorithms (graph generation, constraints)

---

#### 4.2: Level Editor (16-24 hours)
- [ ] In-browser level editor UI:
  - [ ] Place tiles (wall, goal, hazard, etc.)
  - [ ] Set player start
  - [ ] Set energy budget
  - [ ] Live preview

- [ ] Export to JSON
- [ ] Import from JSON
- [ ] Validation in editor

**Portfolio value**: Demonstrates UI/UX, tooling

---

#### 4.3: Pathfinding Visualization (8-12 hours)
- [ ] Show reachable tiles (highlight with energy budget)
- [ ] Show optimal path to goal (on demand)
- [ ] Visualize BFS exploration (animated)
- [ ] Show energy efficiency (color gradient)

**Portfolio value**: Visual explanation of algorithms

---

#### 4.4: Replay System (10-14 hours)
- [ ] Record action sequences
- [ ] Save replays to file
- [ ] Load and playback replays
- [ ] Share replay URLs (base64 encoded)
- [ ] Replay controls (play, pause, step, speed)

**Portfolio value**: Demonstrates serialization, determinism

---

#### 4.5: Analytics & Telemetry (6-10 hours)
- [ ] Track player behavior:
  - [ ] Time per level
  - [ ] Attempts per level
  - [ ] Common failure points

- [ ] Heatmap (where players die)
- [ ] Difficulty analysis (completion rate)
- [ ] Display stats to player

**Portfolio value**: Demonstrates data analysis, UX metrics

---

#### 4.6: AI Solver (12-20 hours)
- [ ] Implement AI that solves levels:
  - [ ] BFS to find optimal path
  - [ ] A* for faster solving
  - [ ] Display solution

- [ ] Show AI thinking (step-by-step)
- [ ] Compare player vs AI efficiency

**Portfolio value**: Showcases advanced algorithms

---

### Phase 4 Recommendations

**Pick 2-3 features** that align with your career goals:

- **For backend/systems roles**: Procedural generation, AI solver
- **For frontend roles**: Level editor, pathfinding visualization
- **For full-stack roles**: Replay system, analytics

---

## Phase 5: Portfolio Showcase

**Status**: 🎯 Final  
**Estimated duration**: 1-2 weeks  
**Goal**: Optimize project for portfolio presentation

### Prerequisites

- Phase 3 complete (at minimum)
- Optionally Phase 4 features

### Objectives

1. **Documentation Polish**: Ensure all docs are perfect
2. **Demo Video**: Record gameplay showcase
3. **Live Demo**: Deploy to web hosting
4. **README Enhancement**: Portfolio-specific improvements
5. **Code Comments**: Document interesting decisions
6. **Interview Prep**: Prepare talking points

### Tasks Breakdown

#### 5.1: Documentation Review (4-6 hours)
- [ ] Review all markdown docs for typos
- [ ] Ensure cross-references are correct
- [ ] Add screenshots/diagrams where helpful
- [ ] Update any outdated sections
- [ ] Verify all code examples compile

**Acceptance criteria**:
- Documentation is polished and professional
- No broken links or references
- All examples work

---

#### 5.2: Demo Video (6-8 hours)
- [ ] Plan video structure:
  - [ ] 30s: What is it?
  - [ ] 60s: Gameplay showcase
  - [ ] 60s: Technical highlights
  - [ ] 30s: Architecture overview

- [ ] Record gameplay (interesting levels)
- [ ] Record code walkthrough (optional)
- [ ] Edit video (add captions, music)
- [ ] Upload to YouTube/portfolio site

**Acceptance criteria**:
- 2-3 minute video
- Shows game in action
- Highlights technical aspects
- Professional quality

---

#### 5.3: Live Deployment (4-6 hours)
- [ ] Choose hosting (Netlify, Vercel, GitHub Pages)
- [ ] Setup deployment pipeline
- [ ] Configure custom domain (optional)
- [ ] Test deployed version
- [ ] Add analytics (Google Analytics, optional)

**Acceptance criteria**:
- Game is playable online
- Fast load times (< 3 seconds)
- No bugs in production build
- Mobile-friendly

---

#### 5.4: README Enhancement (4-6 hours)
- [ ] Add screenshots (gameplay, architecture diagrams)
- [ ] Add demo GIFs (movement, key mechanics)
- [ ] Embed demo video
- [ ] Add link to live demo
- [ ] Refine "Educational Value" section
- [ ] Add "Technical Highlights" section with code samples

**Acceptance criteria**:
- README stands out visually
- Technical depth is clear
- Easy to navigate
- Impressive to recruiters

---

#### 5.5: Code Comments & Documentation (6-8 hours)
- [ ] Add JSDoc to all public functions
- [ ] Add inline comments for complex algorithms
- [ ] Document architectural decisions in code
- [ ] Add README files in complex directories
- [ ] Clean up commented-out code

**Acceptance criteria**:
- Code is self-documenting
- Complex sections have explanations
- Comments add value (not just restate code)

---

#### 5.6: Interview Preparation (8-10 hours)
- [ ] Prepare talking points for each feature:
  - [ ] Why TypeScript over Unity?
  - [ ] How does deterministic replay work?
  - [ ] Walk through pathfinding algorithm
  - [ ] Explain immutable state updates
  - [ ] Describe testing strategy

- [ ] Practice explanations (record yourself)
- [ ] Prepare to answer:
  - [ ] "What would you do differently?"
  - [ ] "What was hardest to implement?"
  - [ ] "How would you scale this?"
  - [ ] "What did you learn?"

- [ ] Create presentation slides (optional)

**Acceptance criteria**:
- Can explain any part of the project
- Talking points are concise (30-60s each)
- Confident in technical discussions

---

### Phase 5 Deliverables

- ✅ Polished documentation
- ✅ Demo video (YouTube/portfolio)
- ✅ Live deployment (clickable link)
- ✅ Enhanced README with visuals
- ✅ Well-commented code
- ✅ Interview preparation complete

### Phase 5 Success Criteria

- [ ] Project looks professional in portfolio
- [ ] Live demo works flawlessly
- [ ] Documentation is comprehensive
- [ ] Can confidently discuss any technical aspect
- [ ] Recruiter can understand project value in < 2 minutes

---

## Optional Extensions

### Ideas for Future Development

Beyond Phase 4, consider these extensions:

#### Multiplayer (Advanced)
- [ ] Turn-based multiplayer (solve together)
- [ ] Competitive mode (race to goal)
- [ ] WebSocket for real-time

**Complexity**: Very High (3-4 weeks)

---

#### Custom Themes
- [ ] Multiple visual themes (cyberpunk, fantasy, minimalist)
- [ ] Theme selector
- [ ] Dark mode

**Complexity**: Medium (1-2 weeks)

---

#### Speedrun Mode
- [ ] Timer for each level
- [ ] Leaderboards (local or online)
- [ ] Par times for each level

**Complexity**: Low (4-6 hours)

---

#### Level Sharing
- [ ] Export/import custom levels
- [ ] Share levels via URL
- [ ] Community level browser

**Complexity**: Medium-High (2-3 weeks)

---

#### Accessibility
- [ ] Screen reader support
- [ ] Colorblind modes
- [ ] Keyboard shortcuts documentation
- [ ] High contrast mode

**Complexity**: Medium (1-2 weeks)

---

## Milestones & Checkpoints

### Major Milestones

| Milestone | Description | Target | Deliverables |
|-----------|-------------|--------|--------------|
| **M0** | Documentation Complete | Week 0 | 8 markdown docs |
| **M1** | First Playable | Week 2-3 | One level playable end-to-end |
| **M2** | Core Mechanics Complete | Week 5-6 | Hazards, keys/doors, undo working |
| **M3** | Alpha Release | Week 8-10 | 10+ levels, polished UI |
| **M4** | Beta Release | Week 10-12 | 20+ levels, mobile support, save/load |
| **M5** | Portfolio Ready | Week 13-15 | Live demo, video, documentation |
| **M6** | Advanced Features | Week 16-20 | Optional: procedural gen, editor, etc. |

### Review Checkpoints

**Weekly reviews**: Every Friday
- [ ] What shipped this week?
- [ ] What's blocking progress?
- [ ] Is timeline still realistic?
- [ ] Any technical debt to address?

**Phase end reviews**: After each phase
- [ ] All success criteria met?
- [ ] All tests passing?
- [ ] Documentation updated?
- [ ] Ready to proceed to next phase?

---

## Risk Assessment

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Canvas performance < 60 FPS | Medium | Medium | Profile early, optimize hot paths, use sprite batching |
| TypeScript type issues blocking progress | Low | Medium | Start simple, add constraints incrementally |
| Testing infrastructure too complex | Low | High | Use Vitest examples from docs, keep tests simple |
| Level design takes longer than expected | High | Low | Start with simple levels, iterate based on playtesting |
| Scope creep (feature additions) | High | High | Stick to roadmap, defer nice-to-haves to Phase 4 |
| Browser compatibility issues | Low | Low | Target modern browsers (Chrome, Firefox, Safari) |

### Project Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Lost motivation (project too long) | Medium | Critical | Ship incrementally, celebrate milestones, skip Phase 4 if needed |
| Time constraints (other commitments) | Medium | High | Flexible timeline, cut scope to Phase 3 minimum |
| Technical complexity beyond skill level | Low | High | Comprehensive docs provide guidance, ask for help when stuck |
| Project not interesting to employers | Low | Medium | Focus on technical depth, ensure good documentation |

### Mitigation Strategies

**For motivation**:
- Set small, achievable goals (daily/weekly)
- Share progress publicly (Twitter, blog)
- Play your own game regularly
- Remember: Phase 3 is minimum viable, Phase 4+ is bonus

**For time constraints**:
- Prioritize core features (Phases 1-3)
- Phase 4 is explicitly optional
- Phase 5 can be done over time

**For technical challenges**:
- Comprehensive documentation provides guidance
- Break tasks into smaller pieces
- Test incrementally
- Seek help when truly stuck (forums, Discord, mentors)

---

## Time Estimates

### Effort Breakdown by Phase

```
Phase 0 (Documentation):        Complete (done)
Phase 1 (Foundation):           ~60-80 hours  (2-3 weeks part-time)
Phase 2 (Core Mechanics):       ~60-80 hours  (2-3 weeks part-time)
Phase 3 (Content & Polish):     ~80-120 hours (3-4 weeks part-time)
Phase 4 (Advanced, optional):   ~40-100 hours (2-5 weeks part-time)
Phase 5 (Showcase):             ~30-50 hours  (1-2 weeks part-time)
───────────────────────────────────────────────────────────────
MVP Total (Phases 1-3):         ~200-280 hours (8-12 weeks part-time)
Complete (Phases 1-5):          ~270-410 hours (11-17 weeks part-time)
```

### Assumptions

- **Part-time**: 20-30 hours/week (evenings and weekends)
- **Full-time**: 40 hours/week (if dedicated full-time)
- **Experience level**: Intermediate TypeScript/web development
- **Includes**: Coding, testing, debugging, documentation, playtesting

### Realistic Timelines

**Aggressive** (full-time, experienced):
- MVP: 4-6 weeks
- Complete: 6-10 weeks

**Normal** (part-time, intermediate):
- MVP: 8-12 weeks
- Complete: 12-20 weeks

**Relaxed** (casual, learning as you go):
- MVP: 12-16 weeks
- Complete: 16-24 weeks

---

## Dependencies Graph

### Phase Dependencies

```
Phase 0 (Docs)
    ↓
Phase 1 (Foundation)
    ├── Project Setup (no dependencies)
    ├── Core Types (no dependencies)
    ├── Grid System (→ Core Types)
    ├── State Management (→ Grid System)
    ├── Game Rules (→ State Management)
    ├── Rendering (→ Grid System, State Management)
    ├── Input (→ Game Rules)
    ├── Level Loading (→ Core Types)
    └── Validation (→ Level Loading)
    
Phase 2 (Core Mechanics)
    ├── Hazards (→ Phase 1: Game Rules, Rendering)
    ├── Keys/Doors (→ Phase 1: State Management, Rendering)
    ├── Undo (→ Phase 1: Action System)
    ├── Animation (→ Phase 1: Rendering)
    ├── Sound (→ Phase 1: Game Loop)
    └── Levels (→ All of Phase 2)
    
Phase 3 (Content & Polish)
    ├── Scene System (→ Phase 1: Rendering)
    ├── Level Select (→ Scene System)
    ├── More Levels (→ Phase 2: All Mechanics)
    ├── Visual Polish (→ Phase 1: Rendering)
    ├── Tutorial (→ Scene System)
    ├── Save/Load (→ Phase 1: State Management)
    ├── Mobile (→ Phase 1: Input)
    └── Performance (→ Phase 1: Rendering)
    
Phase 4 (Advanced)
    ├── Procedural Gen (→ Phase 1: Level Loading, Validation)
    ├── Level Editor (→ Phase 3: Scene System)
    ├── Pathfinding Viz (→ Phase 1: Rendering, Pathfinding)
    ├── Replay (→ Phase 2: Undo)
    ├── Analytics (→ Phase 3: Save/Load)
    └── AI Solver (→ Phase 1: Pathfinding)
    
Phase 5 (Showcase)
    ├── Docs Polish (→ Phase 3 complete)
    ├── Demo Video (→ Phase 3 complete)
    ├── Deployment (→ Phase 3 complete)
    ├── README Enhancement (→ Demo Video)
    ├── Code Comments (→ Phase 3 complete)
    └── Interview Prep (→ All phases)
```

### Critical Path

The critical path to MVP (minimum viable product) is:

```
Docs → Setup → Types → Grid → State → Rules → Rendering → Input → 
Level Loading → Validation → Hazards → Keys/Doors → More Levels → Polish
```

Everything else can be parallelized or deferred.

---

## Success Criteria

### Technical Success

- [ ] All tests pass (>80% coverage overall, >90% core)
- [ ] No TypeScript errors (strict mode)
- [ ] No runtime errors or crashes
- [ ] Maintains 60 FPS on target devices
- [ ] Deterministic replay tests prove determinism
- [ ] Code follows architecture in TECH.md

### Game Success

- [ ] 20+ completable levels
- [ ] Clear tutorial for new players
- [ ] Difficulty curve is smooth (easy → hard)
- [ ] All mechanics work correctly
- [ ] Game feels polished (animations, sound, effects)
- [ ] Mobile support (touch controls)

### Portfolio Success

- [ ] Live demo works (clickable link)
- [ ] Demo video showcases game and tech
- [ ] README is impressive (visuals, depth)
- [ ] Documentation is comprehensive
- [ ] Can confidently discuss any aspect in interview
- [ ] Project generates technical discussions with reviewers

### Learning Success

- [ ] Understand all code you've written
- [ ] Can explain architectural decisions
- [ ] Can describe algorithms implemented (BFS, A*, state machine)
- [ ] Comfortable with TypeScript advanced features
- [ ] Know how to test deterministic systems
- [ ] Gained experience with Canvas API

---

## Portfolio Optimization

### Resume Bullet Points

Use these proven templates:

- "Built a turn-based puzzle game in **TypeScript** demonstrating **clean architecture** (separation of concerns, immutable state, action-based state machine) with **90%+ test coverage** on core logic."

- "Implemented **BFS and A* pathfinding algorithms** for grid navigation, achieving **< 5ms pathfinding** on 20x20 grids with full test coverage including deterministic replay tests."

- "Designed **data-driven level system** using JSON schema validation, enabling non-programmers to create content without code changes."

- "Architected **pure functional core logic** (zero browser dependencies) enabling unit tests to run in Node.js for fast CI/CD pipeline."

### Interview Talking Points

#### "Walk me through this project"

> "I built Signal Path to demonstrate software engineering fundamentals through game development. It's a turn-based puzzle game where you navigate a grid while managing limited energy. But what makes it interesting from an engineering perspective is the architecture.
>
> I separated the core game logic from the UI completely—the core has zero browser dependencies and can run in Node.js. This enabled me to write fast, deterministic unit tests. In fact, I have deterministic replay tests that run the same action sequence 100 times and verify identical results every time, proving the system is truly deterministic.
>
> The state management uses immutable updates, which makes the code easier to reason about and enabled features like undo/replay trivially. And because levels are data-driven JSON files, I can add new content without touching code.
>
> Technically, I used TypeScript in strict mode, Vitest for testing with 90%+ coverage on core logic, and Canvas for rendering. The pathfinding uses BFS and A*, which I implemented from scratch to demonstrate algorithmic thinking."

#### "What was the hardest part?"

> "The hardest part was maintaining determinism while building a game that *feels* dynamic. Games often use `Math.random()`, timestamps, or frame-dependent logic, but all of these introduce non-determinism. I had to design the system so that animations and visual effects are purely presentational—the core game state transitions are always pure functions of state and action.
>
> This constraint actually made the code better. Because I couldn't rely on timing or randomness, I had to think carefully about state machines and turn resolution. And it paid off—my deterministic replay tests would immediately catch any accidental non-determinism."

#### "How does the pathfinding work?"

> "I use BFS (Breadth-First Search) for finding shortest paths on the grid. The grid is represented as a graph where tiles are nodes and walkable adjacencies are edges. BFS guarantees the shortest path because all moves have equal cost.
>
> For optimization and larger grids, I also implemented A* which uses Manhattan distance as a heuristic. A* is faster because it explores fewer nodes by preferring directions that move toward the goal.
>
> Both algorithms handle obstacles (walls, locked doors) by filtering out non-walkable neighbors. I tested correctness with unit tests (does it find the right path?) and performance benchmarks (does it run in < 5ms on 20x20 grids?)."

#### "What would you do differently?"

> "If I started over, I'd consider using an Entity-Component-System (ECS) architecture. Right now, I have a flat GameState object which works fine for ~10 entities, but wouldn't scale to hundreds or thousands. ECS would give better performance and flexibility for complex games.
>
> I'd also invest in procedural level generation earlier. Handcrafting 20 levels took significant time, and a good generation algorithm could create infinite content. That said, I don't regret starting with handcrafted levels—they let me design a better tutorial and difficulty curve.
>
> Finally, I'd add more tooling earlier—things like a visual level editor and pathfinding visualization. These would have sped up development and made for better demos."

---

## Changelog

### v1.0 (2025-01-22)
- Initial roadmap document
- Defined 6 development phases (0-5)
- Estimated timelines and effort
- Created dependency graph
- Listed success criteria
- Added risk assessment
- Included interview preparation

---

## Document Maintenance

### When to Update

Update this roadmap when:
- Completing a phase (update status)
- Timeline changes (adjust estimates)
- Priorities shift (reorder features)
- New risks identified (add to risk table)
- Features added/removed (update phase tasks)

### Version History

Track major changes:
- v1.0: Initial roadmap (all phases defined)
- v1.1: [Future] After Phase 1 completion (update estimates)
- v2.0: [Future] After Phase 3 completion (portfolio-ready)

---

**END OF DEVELOPMENT ROADMAP**