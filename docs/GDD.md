# Game Design Document (GDD)
## Signal Path

**Last updated**: 2025-01-22  
**Document version**: 1.0  
**Project phase**: Foundation

---

## Document Purpose

This is the **authoritative source** for all game rules, mechanics, and behavior in Signal Path. If code behavior conflicts with this document, this document is correct (unless explicitly outdated).

**For implementers**: This doc describes *what* the game does. See `TECH.md` for *how* it's implemented.

---

## Table of Contents

1. [Core Concept](#core-concept)
2. [Game Theme & Narrative](#game-theme--narrative)
3. [Core Gameplay Loop](#core-gameplay-loop)
4. [Grid System](#grid-system)
5. [Entity Types](#entity-types)
6. [Player Mechanics](#player-mechanics)
7. [Energy System](#energy-system)
8. [Hazards](#hazards)
9. [Obstacles & Interactables](#obstacles--interactables)
10. [Turn Structure](#turn-structure)
11. [Win & Lose Conditions](#win--lose-conditions)
12. [Level Progression](#level-progression)
13. [Game Modes](#game-modes)
14. [UI & Feedback](#ui--feedback)
15. [Design Principles](#design-principles)
16. [Future Features (Roadmap)](#future-features-roadmap)

---

## Core Concept

**Elevator Pitch**:
> A turn-based puzzle game where you guide a maintenance drone through a damaged facility. Every move costs energy. Plan your path, avoid hazards, and restore critical systems.

**Core Pillars**:
1. **Deliberate planning** over reflexes
2. **Resource management** (limited energy)
3. **Spatial reasoning** (grid navigation with constraints)
4. **Deterministic outcomes** (same actions = same results)

**Target Experience**:
- "Chess-like" thoughtfulness
- Clear cause-and-effect
- Solvable through logic, not luck
- Satisfying "aha!" moments when finding optimal paths

---

## Game Theme & Narrative

### Setting
A **damaged industrial facility** (power plant, space station, research lab—visually ambiguous but industrial).

### Player Role
You are the **remote operator** of a maintenance drone. Your job: navigate through damaged sections to restore critical systems.

### Narrative Framing (Light)
- Each level is a different facility section
- The facility suffered an "incident" (explosion, power surge, etc.)
- Your drone has limited battery/energy
- Hazards are environmental (exposed wires, fire, breaches)

**Why this framing?**
- Justifies grid-based movement (drone following command inputs)
- Justifies turn-based gameplay (remote operation with input lag)
- Justifies hazards and energy limits (damaged environment)
- Keeps focus on mechanics, not story

---

## Core Gameplay Loop

### Per-Level Loop
```
1. Level loads → Observe grid layout
2. Identify: Start position, Goal, Hazards, Obstacles, Energy limit
3. Plan a path (mental or actual pathing)
4. Execute moves one at a time
   ├─ Player acts (move/wait)
   ├─ Hazards resolve
   └─ Check win/lose
5. Reach goal = Level complete
6. Fail = Restart level
```

### Session Loop
```
1. Select level from level select screen
2. Play level (see per-level loop)
3. On win: Unlock next level, return to level select
4. On lose: Retry or return to level select
5. Repeat
```

---

## Grid System

### Structure
- The game world is a **2D grid** of tiles
- Each tile has (x, y) coordinates (0-indexed)
- Tiles can have different properties: walkable, wall, hazard, goal, etc.

### Grid Dimensions
- Variable per level (typically 8x8 to 16x16)
- Minimum: 5x5 (anything smaller is trivial)
- Maximum: 20x20 (anything larger is hard to visualize)

### Coordinate System
```
     X →
Y  ┌─────────────┐
↓  │ (0,0) (1,0) │
   │ (0,1) (1,1) │
   └─────────────┘
```
- Origin (0, 0) is **top-left**
- X increases to the right
- Y increases downward

### Tile Types
| Type | Walkable | Description |
|------|----------|-------------|
| **Empty** | Yes | Standard walkable tile |
| **Wall** | No | Impassable obstacle |
| **Goal** | Yes | Win condition tile |
| **Hazard** | Yes* | Causes lose condition (see Hazards section) |
| **Door** | No* | Can be opened with key (see Obstacles) |
| **Key** | Yes | Pickup item (see Obstacles) |

*Conditional walkability explained in respective sections.

---

## Entity Types

Entities are objects that exist on the grid and have behavior/state.

### Player (The Drone)
- **Type**: Controllable entity
- **Position**: (x, y) on the grid
- **State**: Energy remaining, inventory (for keys)
- **Behavior**: Moves based on player input
- **Rendering**: Distinct visual (triangle/arrow indicating facing direction)

### Hazards
- **Type**: Passive danger
- **Position**: (x, y) on the grid
- **State**: Type (spike, laser, fire), active/inactive
- **Behavior**: Deterministic patterns (see Hazards section)
- **Rendering**: Visual warning (red/orange, animated)

### Interactables
- **Type**: Objects that affect state
- **Examples**: Keys, doors, switches
- **Position**: (x, y) on the grid
- **State**: Collected/activated status
- **Behavior**: Triggered by player proximity or action
- **Rendering**: Distinct icons

### Goal
- **Type**: Win condition marker
- **Position**: (x, y) on the grid
- **State**: None (static)
- **Behavior**: Detects player arrival
- **Rendering**: Distinct visual (exit door, terminal, etc.)

---

## Player Mechanics

### Movement
- **Directions**: 4-directional (Up, Down, Left, Right)
- **Input**: Arrow keys, WASD, or touch/swipe
- **Constraints**:
  - Cannot move into walls
  - Cannot move off grid bounds
  - Cannot move into locked doors (without key)

### Movement Rules
1. Player **attempts** to move in a direction
2. System **validates** the move:
   - Is target tile in bounds?
   - Is target tile walkable?
   - Does player have energy?
3. If **valid**: Player moves, energy decreases
4. If **invalid**: Move rejected, no state change, no energy cost

### Actions Per Turn
- Player takes **exactly one action** per turn:
  - Move (Up/Down/Left/Right)
  - Wait (do nothing, still costs energy)
  - Undo (revert to previous state, no energy cost—see Future Features)

### Facing Direction (Future)
- Initially: Player has no facing direction (moves omnidirectionally)
- Future: Facing may matter for certain mechanics (pushing blocks, directional hazards)

---

## Energy System

### Purpose
Energy is the **primary resource constraint** that creates puzzle tension. Without energy limits, players could explore infinitely.

### Energy Mechanics
- Each level has an **energy budget** (e.g., 15 energy points)
- Player starts with full energy at level start
- Each action **costs 1 energy**:
  - Move = -1 energy
  - Wait = -1 energy
  - Undo = 0 energy (no cost)
  
### Energy Rules
1. Player cannot take action if energy = 0
2. Energy cannot go negative
3. Energy does not regenerate within a level
4. Energy is **per-level**, not global (each level starts fresh)

### Energy Display
- Always visible in HUD
- Clear warning when low (e.g., < 3 energy)
- Color coding: Green (plenty), Yellow (low), Red (critical)

### Design Intent
Energy forces players to:
- Plan ahead (count moves)
- Find optimal paths (shortest isn't always best)
- Accept trade-offs (safety vs. efficiency)

### Difficulty Scaling
- Early levels: Generous energy (150%+ of optimal solution)
- Mid levels: Tight energy (110–120% of optimal)
- Late levels: Exact energy (requires near-optimal play)

---

## Hazards

Hazards are **environmental dangers** that cause lose conditions.

### Hazard Design Philosophy
- Hazards are **deterministic** (no randomness)
- Hazards have **clear visual telegraphing** (player must know they're dangerous)
- Hazards follow **simple, predictable rules**

### Hazard Types

#### 1. Spike Tiles (Static Hazard)
- **Behavior**: Always active, always dangerous
- **Rule**: Player loses if they step on spike tile
- **Visual**: Spikes protruding from tile, red/orange
- **Purpose**: Basic danger, forces pathing around

#### 2. Laser Barriers (Static Hazard)
- **Behavior**: Always active, blocks movement
- **Rule**: Player loses if they step into laser
- **Visual**: Beam of light across tile(s), red
- **Purpose**: Creates impassable but non-wall obstacles

#### 3. Timed Hazards (Future)
- **Behavior**: Activate on certain turns (e.g., every 3 turns)
- **Rule**: Player loses if on hazard when it activates
- **Visual**: Pulsing warning on inactive turns
- **Purpose**: Adds timing puzzle element

#### 4. Directional Hazards (Future)
- **Behavior**: Only dangerous from certain directions
- **Example**: One-way force field, flamethrower
- **Purpose**: Adds spatial reasoning complexity

### Hazard Interaction Rules
- Hazards do **not** move (entities may move in future)
- Hazards activate **after** player turn (player sees result immediately)
- Multiple hazards on same tile: Player loses if any are active
- Hazards and goal on same tile: Player wins (goal takes priority)

### Hazard Timing (Turn Order)
See [Turn Structure](#turn-structure) for full sequence.

---

## Obstacles & Interactables

Obstacles and interactables add puzzle complexity beyond simple pathing.

### Doors & Keys

#### Doors (Locked Tiles)
- **Initial State**: Locked (impassable)
- **Appearance**: Closed door icon, distinct color (e.g., blue)
- **Rule**: Player cannot move through locked door

#### Keys (Pickup Items)
- **Initial State**: Placed on tile
- **Appearance**: Key icon, matches door color
- **Rule**: Moving onto key tile **automatically collects** the key

#### Door-Key Interaction
- When player has a key, moving to corresponding door **automatically opens** it
- Key is consumed (removed from inventory)
- Door becomes walkable (permanent state change)
- **Timing**: Happens as part of movement validation (before move completes)

#### Multi-Key Puzzles
- Some doors require multiple keys
- Key types are distinguished by color/ID
- A blue key only opens blue doors, etc.

### Switches (Future)
- **Behavior**: Toggle state of other entities (doors, hazards)
- **Rule**: Moving onto switch **activates** it
- **Visual**: Button/lever with on/off states

### Checkpoints (Future)
- **Behavior**: Save progress within level
- **Rule**: Moving onto checkpoint allows respawn there on death
- **Purpose**: Enables longer, multi-stage levels

---

## Turn Structure

The game is strictly **turn-based**. Each turn follows this sequence:

### Turn Resolution Sequence
```
1. Player Input Phase
   ├─ Player selects action (move direction or wait)
   └─ Input is validated (legal move?)

2. Action Validation Phase
   ├─ Check: Is target tile in bounds?
   ├─ Check: Is target tile walkable?
   ├─ Check: Does player have energy?
   └─ If any check fails → reject action, no state change

3. Action Application Phase (if validated)
   ├─ Move player to new position
   ├─ Deduct energy cost (1 energy)
   ├─ Collect any items on tile (keys, etc.)
   └─ Open doors if player has key (automatic)

4. Hazard Resolution Phase
   ├─ Check: Is player on hazard tile?
   └─ If yes → player loses (see Lose Conditions)

5. Win/Lose Check Phase
   ├─ Check: Is player on goal tile?
   ├─ Check: Is energy = 0 without reaching goal?
   └─ Update game status (playing/won/lost)

6. Turn Complete
   └─ Increment turn counter
```

### Important Turn Rules
- **Player acts first**, then environment resolves
- **Hazards never activate mid-move** (player sees result instantly)
- **State changes are atomic** (no partial turns)
- **Turn order is deterministic** (reproducible for replays)

### Example Turn

```
Initial State:
- Player at (1, 1), Energy = 5
- Hazard (spike) at (2, 1)
- Goal at (3, 1)

Player Input: Move Right

Validation:
✓ Target (2, 1) is in bounds
✓ Target (2, 1) is walkable (hazard tiles are walkable)
✓ Player has energy (5 > 0)

Application:
- Player moves to (2, 1)
- Energy becomes 4

Hazard Resolution:
✗ Player is on spike at (2, 1)
→ Game status = LOST

Turn Complete
```

---

## Win & Lose Conditions

### Win Condition (Single, Clear)
**The player wins when**:
- Player is on the goal tile, AND
- Turn resolution completes successfully

**Timing**: Win is checked **after** hazard resolution (so hazard + goal = lose, not win).

**Effect**:
- Game state becomes `status: 'won'`
- Player cannot take further actions
- UI shows "Level Complete" message
- Next level unlocks (if not already unlocked)

### Lose Conditions (Multiple)

#### Lose Condition 1: Hazard Contact
- Player moves onto (or is on) an active hazard tile
- Checked during Hazard Resolution Phase
- Most common lose condition

#### Lose Condition 2: Energy Exhaustion
- Player has 0 energy and has not reached goal
- Checked at start of next turn (cannot take action)
- Forces planning ahead

#### Lose Condition 3: No Valid Path (Future)
- Player is stuck (no legal moves, energy remains)
- Rare, mainly from poor design or procedural generation bugs
- Should be caught by level validation

### What Happens on Lose
- Game state becomes `status: 'lost'`
- UI shows "Mission Failed" message
- Player can:
  - Restart level (return to initial state)
  - Undo last move (if undo is available)
  - Return to level select

### Lose Does Not:
- Cost any meta-progression (no lives system)
- Lock the level (can retry infinitely)
- Carry over between levels (each level is independent)

---

## Level Progression

### Progression Structure
Levels are **sequential and unlocked linearly**:
- Start with Level 1 unlocked
- Completing a level unlocks the next
- Can replay any unlocked level
- No star rating or scoring (initially)

### Level Numbering
- Levels are numbered sequentially: 01, 02, 03, ...
- Level files are named descriptively: `01_tutorial.json`, `02_hazards.json`
- File names are for humans; game uses level ID field

### Difficulty Curve
Levels introduce mechanics **incrementally**:

| Levels | Focus | New Mechanics |
|--------|-------|---------------|
| 01–03 | **Tutorial** | Movement, energy, goal |
| 04–06 | **Hazards** | Spikes, lasers, pathing around danger |
| 07–09 | **Obstacles** | Doors, keys, unlock sequences |
| 10–12 | **Efficiency** | Tight energy budgets, optimal paths |
| 13–15 | **Combination** | Multi-mechanic puzzles |
| 16+ | **Mastery** | Complex spatial reasoning |

### Level Completion Tracking
- **Minimum**: Track which levels are unlocked (Boolean per level)
- **Future**: Track best performance (turns used, energy remaining)
- **Future**: Par values (optimal solution benchmarks)

---

## Game Modes

### Story Mode (Primary)
- Linear level progression
- Designed, handcrafted levels
- Each level introduces or reinforces a concept
- **Target**: 20–30 levels initially

### Practice Mode (Future)
- Replay any unlocked level
- Experiment without progression pressure

### Challenge Mode (Future)
- Procedurally generated levels
- Configurable difficulty (size, hazards, energy ratio)
- Infinite replayability
- Showcases procedural generation skills

### Time Trial Mode (Future)
- Complete levels in minimum turns
- Leaderboard (local only, no server)

---

## UI & Feedback

### HUD (Always Visible)
- **Energy**: Current / Maximum (e.g., "Energy: 8 / 15")
- **Turn Counter**: Number of turns taken
- **Level ID**: Current level name/number

### On-Screen Feedback
- **Move Preview**: Highlight valid move tiles on hover
- **Invalid Move**: Red X or shake animation
- **Energy Warning**: Pulsing red when energy < 3
- **Hazard Warning**: Animated/pulsing hazard tiles

### End-of-Level Feedback
- **Win Screen**:
  - "Level Complete!"
  - Turns used: X
  - Energy remaining: Y
  - "Next Level" button
  - "Retry for better score" button (future)
  
- **Lose Screen**:
  - "Mission Failed"
  - Reason: "Hazard contact" or "Energy depleted"
  - "Restart" button
  - "Level Select" button

### Controls Display
- Always accessible (pause menu or footer)
- Lists: Arrow keys / WASD for movement, R for restart, U for undo (future)

---

## Design Principles

### 1. Clarity Over Aesthetics
- Player must **always know**:
  - Where they can move
  - What is dangerous
  - How much energy remains
  - What the goal is
- Visual clarity > visual flair

### 2. Determinism Over Dynamism
- No randomness in gameplay (only in procedural generation)
- Same inputs = same outputs (always)
- Player failure should feel fair, not unlucky

### 3. Mechanics Over Story
- Game is puzzle-first, narrative-light
- Story exists to justify mechanics, not vice versa
- Keep tutorial text minimal

### 4. Incremental Complexity
- Introduce one new mechanic per level (early on)
- Build on previous mechanics (later levels)
- Never assume player remembers tutorial

### 5. Rewarding Optimization
- Levels should be **solvable** with generous energy
- Levels should be **optimizable** with tight energy
- Give players room to improve (par times, minimal turns)

### 6. Fail Fast, Retry Instantly
- Death should be instant and clear (no drawn-out animation)
- Restart should be < 0.5 seconds
- No punishment for retrying (no lives, no penalties)

---

## Future Features (Roadmap)

These features are **not in initial implementation** but are documented for future expansion.

### Phase 2: Core Polish
- **Undo System**: Rewind last N moves (stack-based)
- **Animation**: Smooth movement transitions (100–200ms)
- **Sound Effects**: Move, hazard hit, win/lose, key collect
- **Particle Effects**: Minimal feedback (collect key, open door)

### Phase 3: Advanced Mechanics
- **Timed Hazards**: Activate every N turns
- **Moving Hazards**: Patrol patterns
- **Switches**: Toggle doors/hazards remotely
- **Directional Hazards**: Only dangerous from certain sides
- **Teleporters**: Instant transport between tiles

### Phase 4: Meta Systems
- **Level Editor**: In-game tool to create levels
- **Procedural Generation**: Infinite challenge mode
- **Par Times**: Optimal solution benchmarks
- **Leaderboards**: Local rankings (no server)

### Phase 5: Replay & Analysis
- **Replay System**: Watch solution playback
- **Pathfinding Visualization**: Show A* search process
- **Solution Comparison**: Compare player path vs. optimal
- **Deterministic Replay Tests**: Automated verification

### Non-Goals (Out of Scope)
- ❌ Multiplayer / Co-op
- ❌ Real-time action elements
- ❌ Physics-based puzzles
- ❌ Pixel-perfect platforming
- ❌ Economy / Progression systems (unlock abilities, etc.)
- ❌ Story cutscenes or dialogue

---

## Design Rationale (For Resume / Interviews)

### Why Turn-Based?
> "Turn-based gameplay makes every action explicit and testable. This let me design the game as a deterministic system where state transitions are clear and reproducible. It's essentially a state machine with well-defined rules."

### Why Grid-Based?
> "Grid-based movement maps naturally to graph data structures. Each tile is a node, walkable adjacencies are edges. This let me implement and demonstrate pathfinding algorithms (BFS, A*) in a tangible, visual way."

### Why Energy System?
> "Energy creates a constraint-satisfaction problem. It's not just 'find any path to the goal,' it's 'find a path within resource limits.' This forces algorithmic optimization and mimics real-world engineering problems."

### Why Deterministic?
> "Determinism allows reproducibility. I can write tests that replay the exact same sequence of actions and verify the outcome. This is critical for systems that need to be reliable (real-time control systems, simulations, etc.)."

### Why Data-Driven Levels?
> "Separating data from logic demonstrates separation of concerns. Levels are declarative (JSON), logic is imperative (TypeScript). This makes the system modular, testable, and scalable—like how game engines separate assets from code."

---

## Changelog

### v1.0 (2025-01-22)
- Initial document creation
- Defined core mechanics: movement, energy, hazards, win/lose
- Outlined level progression and future features
- Established design principles

---

## Document Maintenance

### When to Update This Doc
- When adding new mechanics (hazards, obstacles, etc.)
- When changing core rules (turn order, win conditions)
- When planning new features (add to Future Features section)
- When discovering edge cases that need clarification

### Who Updates This Doc
- Project lead (you)
- Claude (AI) with explicit approval
- Any collaborator with clear rationale

### How to Update
1. Make change to appropriate section
2. Update "Last updated" date at top
3. Add entry to Changelog
4. If architectural impact, also update `DECISIONS.md`

---

## Cross-References

Related documentation:
- **CLAUDE.md**: Project instructions and AI collaboration rules
- **TECH.md**: Technical implementation of these mechanics
- **LEVEL_FORMAT.md**: How these mechanics are represented in JSON
- **TESTING.md**: How these rules are validated
- **DECISIONS.md**: Why certain design choices were made

For implementation details, defer to TECH.md. This document defines **what**, not **how**.

---

**END OF GAME DESIGN DOCUMENT**