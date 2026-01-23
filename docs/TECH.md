# Technical Design Document (TECH.md)
## Signal Path

**Last updated**: 2025-01-22  
**Document version**: 1.0  
**Project phase**: Foundation

---

## Document Purpose

This document defines **how** Signal Path is implemented technically. It specifies:
- Data structures and their relationships
- Module organization and responsibilities
- Algorithms and their complexity
- Design patterns and architectural decisions
- TypeScript-specific conventions

**For implementers**: This is your implementation guide. For game rules, see `GDD.md`.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Data Structures](#core-data-structures)
3. [Module Organization](#module-organization)
4. [State Management](#state-management)
5. [Action System](#action-system)
6. [Turn Resolution Engine](#turn-resolution-engine)
7. [Grid & Spatial Systems](#grid--spatial-systems)
8. [Pathfinding Algorithms](#pathfinding-algorithms)
9. [Level Loading & Validation](#level-loading--validation)
10. [Serialization (Save/Load)](#serialization-saveload)
11. [UI Architecture](#ui-architecture)
12. [Rendering System](#rendering-system)
13. [Input Handling](#input-handling)
14. [Testing Strategy](#testing-strategy)
15. [Performance Considerations](#performance-considerations)
16. [TypeScript Conventions](#typescript-conventions)
17. [Error Handling](#error-handling)
18. [Future Architectural Considerations](#future-architectural-considerations)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│              UI Layer (src/ui/)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │ Renderer │  │  Input   │  │  Scenes  │               │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘               │
│       │             │             │                     │
│       └─────────────┴─────────────┘                     │
│                     │                                   │
└─────────────────────┼───────────────────────────────────┘
                      │ (Actions & State)
┌─────────────────────┼────────────────────────────────────┐
│                     ↓                                    │
│                Core Logic (src/core/)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │  State   │  │ Actions  │  │  Rules   │                │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                │
│       │             │             │                      │
│  ┌────┴─────────────┴─────────────┴─────┐                │
│  │        Pathfinding, Validation       │                │
│  └──────────────────────────────────────┘                │
└──────────────────────────────────────────────────────────┘
                      ↑
┌─────────────────────┼────────────────────────────────────┐
│              Content Layer (src/content/)                │
│  ┌──────────┐  ┌──────────┐                              │
│  │  Loader  │  │Validator │                              │
│  └────┬─────┘  └────┬─────┘                              │
│       │             │                                    │
│       └─────────────┘                                    │
│              ↓                                           │
│     content/levels/*.json                                │
└──────────────────────────────────────────────────────────┘
```

### Dependency Rules (Critical)

```typescript
// ✅ ALLOWED
import { GameState } from '../core/types';        // UI imports Core
import { applyAction } from '../core/actions';    // UI imports Core
import { loadLevel } from '../content/loader';     // UI imports Content

// ❌ FORBIDDEN
import { renderGrid } from '../ui/renderer';       // Core imports UI
import { canvas } from '../ui/main';               // Core imports UI
```

**Rule**: Data flows **down** (UI → Core → Data), dependencies flow **up** (Core ← UI ← Data).

### Design Principles

1. **Pure Core Logic**: `src/core/` has zero browser/DOM dependencies
2. **Immutable State Updates**: State transitions create new objects
3. **Explicit Actions**: All state changes go through the action system
4. **Single Source of Truth**: One `GameState` object holds all game data
5. **Determinism**: Same state + same action = same result (always)

---

## Core Data Structures

### GameState (The Master Structure)

```typescript
interface GameState {
  // Meta
  levelId: string;                    // Which level is loaded
  status: GameStatus;                 // 'playing' | 'won' | 'lost'
  turnCount: number;                  // Number of turns taken
  
  // Grid
  grid: Grid;                         // The game board
  
  // Entities
  player: Player;                     // Player state
  hazards: Hazard[];                  // All hazards on the level
  interactables: Interactable[];      // Keys, doors, switches, etc.
  goal: Position;                     // Win condition position
  
  // Resources
  energy: number;                     // Current energy
  maxEnergy: number;                  // Starting energy for this level
  
  // History (for undo/replay)
  actionHistory?: Action[];           // Past actions (optional, Phase 2)
}

type GameStatus = 'playing' | 'won' | 'lost';
```

**Design Notes**:
- All fields are **required** except `actionHistory` (future feature)
- State is **fully serializable** (no functions, no circular refs)
- State is **read-only** outside of core logic (use getters, not mutations)

### Grid

```typescript
interface Grid {
  width: number;                      // Number of columns
  height: number;                     // Number of rows
  tiles: Tile[][];                    // 2D array: tiles[y][x]
}

interface Tile {
  type: TileType;                     // What kind of tile
  walkable: boolean;                  // Can player move here?
  position: Position;                 // This tile's coordinates
}

type TileType = 
  | 'empty'                           // Standard walkable
  | 'wall'                            // Impassable
  | 'goal'                            // Win condition
  | 'hazard';                         // Dangerous (type in Hazard entity)
```

**Design Notes**:
- **Access pattern**: `grid.tiles[y][x]` (row-major order)
- **Why 2D array**: Direct indexing is O(1), natural for rendering
- **Walkable flag**: Cached for performance (vs. computing per-check)

### Position

```typescript
interface Position {
  x: number;                          // Column (0-indexed)
  y: number;                          // Row (0-indexed)
}

// Utility functions
function positionsEqual(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

function isInBounds(pos: Position, grid: Grid): boolean {
  return pos.x >= 0 && pos.x < grid.width 
      && pos.y >= 0 && pos.y < grid.height;
}
```

**Design Notes**:
- Simple, immutable value object
- No methods (use free functions for operations)
- Easily serializable

### Player

```typescript
interface Player {
  position: Position;                 // Current location
  inventory: Inventory;               // Collected items
}

interface Inventory {
  keys: KeyItem[];                    // Collected keys
}

interface KeyItem {
  id: string;                         // Unique identifier
  color: KeyColor;                    // Visual/matching property
}

type KeyColor = 'red' | 'blue' | 'green' | 'yellow';
```

**Design Notes**:
- Player has minimal state (position + inventory)
- No health, no abilities (this is a puzzle game, not RPG)
- Inventory is extensible (can add new item types later)

### Hazard

```typescript
interface Hazard {
  id: string;                         // Unique identifier
  position: Position;                 // Location on grid
  type: HazardType;                   // What kind of hazard
  active: boolean;                    // Is it currently dangerous?
  pattern?: HazardPattern;            // For timed/moving hazards (future)
}

type HazardType = 
  | 'spike'                           // Static, always active
  | 'laser'                           // Static, always active
  | 'fire';                           // Static, always active (future: timed)

// Future: Timed hazard support
interface HazardPattern {
  type: 'timed';
  interval: number;                   // Activate every N turns
  offset: number;                     // Start offset
}
```

**Design Notes**:
- Each hazard has unique ID (for state tracking, undo, etc.)
- `active` field allows for timed hazards in future
- Pattern is optional (null for static hazards)

### Interactable

```typescript
interface Interactable {
  id: string;                         // Unique identifier
  position: Position;                 // Location on grid
  type: InteractableType;             // What kind of object
  state: InteractableState;           // Current state
}

type InteractableType = 
  | 'key'                             // Pickup item
  | 'door'                            // Openable obstacle
  | 'switch';                         // Toggle trigger (future)

type InteractableState = 
  | { type: 'key'; color: KeyColor; collected: boolean }
  | { type: 'door'; color: KeyColor; locked: boolean }
  | { type: 'switch'; activated: boolean };
```

**Design Notes**:
- Uses **discriminated union** for type-safe state access
- Each type has different state properties
- TypeScript ensures you can't access wrong properties

### Action

```typescript
type Action =
  | { type: 'move'; direction: Direction }
  | { type: 'wait' }
  | { type: 'undo' }                  // Future
  | { type: 'restart' };              // Meta-action (not part of game state)

type Direction = 'up' | 'down' | 'left' | 'right';

// Direction to vector mapping
const DIRECTION_VECTORS: Record<Direction, Position> = {
  up:    { x:  0, y: -1 },
  down:  { x:  0, y:  1 },
  left:  { x: -1, y:  0 },
  right: { x:  1, y:  0 },
};
```

**Design Notes**:
- Actions are **data**, not functions
- Actions are **serializable** (can save/replay)
- Direction vectors make movement computation simple

---

## Module Organization

### src/core/ (Pure Game Logic)

```
src/core/
├── types.ts              # All TypeScript interfaces and types
├── state.ts              # State initialization and utilities
├── actions.ts            # Action validation and application
├── rules.ts              # Turn resolution and game rules
├── pathfinding.ts        # BFS, A*, reachability
├── validation.ts         # Level validation logic
├── serialization.ts      # Save/load (JSON encode/decode)
└── utils.ts              # Pure utility functions
```

**Module Responsibilities**:

#### types.ts
- Define all interfaces and types
- No logic, only declarations
- Export everything (single source of type truth)

#### state.ts
```typescript
// Create initial game state from level data
export function createGameState(level: LevelData): GameState;

// Reset state to initial conditions
export function resetGameState(state: GameState): GameState;

// State queries (read-only)
export function getPlayerPosition(state: GameState): Position;
export function getTileAt(state: GameState, pos: Position): Tile;
export function getHazardsAt(state: GameState, pos: Position): Hazard[];
```

#### actions.ts
```typescript
// Validate if action is legal
export function validateAction(state: GameState, action: Action): ValidationResult;

// Apply action to state (returns new state)
export function applyAction(state: GameState, action: Action): GameState;

// Get all valid actions from current state
export function getValidActions(state: GameState): Action[];
```

#### rules.ts
```typescript
// Full turn resolution (player + hazards + win/lose)
export function resolveTurn(state: GameState, action: Action): GameState;

// Check win condition
export function checkWinCondition(state: GameState): boolean;

// Check lose conditions
export function checkLoseCondition(state: GameState): LoseReason | null;

type LoseReason = 'hazard' | 'energy_depleted' | 'no_valid_moves';
```

#### pathfinding.ts
```typescript
// Find shortest path between two points
export function findPath(grid: Grid, start: Position, goal: Position): Position[] | null;

// Get all tiles reachable within energy budget
export function getReachableTiles(state: GameState, maxEnergy: number): Set<Position>;

// Check if goal is reachable from current state
export function isGoalReachable(state: GameState): boolean;
```

#### validation.ts
```typescript
// Validate entire level structure
export function validateLevel(level: LevelData): ValidationResult;

// Individual validation checks
export function validateGridDimensions(grid: Grid): boolean;
export function validatePlayerStart(grid: Grid, start: Position): boolean;
export function validateGoalReachable(grid: Grid, start: Position, goal: Position): boolean;
```

#### serialization.ts
```typescript
// Save state to JSON string
export function serializeState(state: GameState): string;

// Load state from JSON string
export function deserializeState(json: string): GameState;

// Validate serialized state structure
export function validateSerializedState(json: string): boolean;
```

### src/ui/ (Browser-Specific)

```
src/ui/
├── main.ts               # Entry point, app initialization
├── renderer.ts           # Canvas drawing logic
├── input.ts              # Event handling (keyboard, mouse, touch)
├── camera.ts             # Viewport/camera (if needed for large grids)
├── animations.ts         # Visual transitions (future)
└── scenes/               # Game states (menu, game, level select)
    ├── MenuScene.ts
    ├── GameScene.ts
    └── LevelSelectScene.ts
```

**Module Responsibilities**:

#### main.ts
```typescript
// Initialize canvas, start game loop
export function initGame(): void;

// Main game loop (requestAnimationFrame)
function gameLoop(timestamp: number): void;

// Global state management (current scene, etc.)
let currentScene: Scene;
```

#### renderer.ts
```typescript
// Render entire game state to canvas
export function render(ctx: CanvasRenderingContext2D, state: GameState): void;

// Individual render functions
function renderGrid(ctx: CanvasRenderingContext2D, grid: Grid): void;
function renderPlayer(ctx: CanvasRenderingContext2D, player: Player): void;
function renderHazards(ctx: CanvasRenderingContext2D, hazards: Hazard[]): void;
function renderHUD(ctx: CanvasRenderingContext2D, state: GameState): void;
```

#### input.ts
```typescript
// Convert DOM events to game actions
export function setupInputHandlers(canvas: HTMLCanvasElement, callback: (action: Action) => void): void;

// Keyboard handling
function handleKeyDown(event: KeyboardEvent): Action | null;

// Mouse/touch handling
function handleClick(event: MouseEvent, state: GameState): Action | null;
```

### src/content/ (Data Loading)

```
src/content/
├── loader.ts             # Load level files
├── validator.ts          # Runtime validation
└── types.ts              # LevelData interface
```

**Module Responsibilities**:

#### loader.ts
```typescript
// Load level from JSON file
export async function loadLevel(levelId: string): Promise<LevelData>;

// Preload multiple levels
export async function preloadLevels(levelIds: string[]): Promise<Map<string, LevelData>>;
```

#### validator.ts
```typescript
// Validate level data structure at runtime
export function validateLevelData(data: unknown): data is LevelData;
```

---

## State Management

### Immutability Pattern

All state updates create **new objects**:

```typescript
// ❌ BAD: Mutating state
function applyMoveBad(state: GameState, direction: Direction): GameState {
  state.player.position.x += DIRECTION_VECTORS[direction].x; // MUTATION!
  return state;
}

// ✅ GOOD: Creating new state
function applyMoveGood(state: GameState, direction: Direction): GameState {
  const delta = DIRECTION_VECTORS[direction];
  return {
    ...state,
    player: {
      ...state.player,
      position: {
        x: state.player.position.x + delta.x,
        y: state.player.position.y + delta.y,
      },
    },
    energy: state.energy - 1,
    turnCount: state.turnCount + 1,
  };
}
```

**Why immutability?**
- Enables undo (keep old states)
- Simplifies debugging (state history)
- Makes testing easier (pure functions)
- Prevents accidental mutations

### State Update Pattern

```typescript
// All state changes go through this flow:
function processPlayerInput(state: GameState, action: Action): GameState {
  // 1. Validate
  const validation = validateAction(state, action);
  if (!validation.valid) {
    return state; // No change if invalid
  }
  
  // 2. Apply
  const newState = applyAction(state, action);
  
  // 3. Resolve turn
  const resolvedState = resolveTurn(newState);
  
  // 4. Return new state
  return resolvedState;
}
```

### State Queries

Prefer **query functions** over direct property access:

```typescript
// ❌ BAD: Direct access in UI
const playerPos = gameState.player.position;
const tile = gameState.grid.tiles[playerPos.y][playerPos.x];

// ✅ GOOD: Query functions
const playerPos = getPlayerPosition(gameState);
const tile = getTileAt(gameState, playerPos);
```

**Benefits**:
- Encapsulation (hide internal structure)
- Easier to refactor later
- Can add caching/memoization

---

## Action System

### Action Validation

```typescript
interface ValidationResult {
  valid: boolean;
  reason?: string;                    // Error message if invalid
}

function validateAction(state: GameState, action: Action): ValidationResult {
  switch (action.type) {
    case 'move':
      return validateMove(state, action.direction);
    case 'wait':
      return validateWait(state);
    case 'undo':
      return validateUndo(state);
    default:
      return { valid: false, reason: 'Unknown action type' };
  }
}

function validateMove(state: GameState, direction: Direction): ValidationResult {
  // Check energy
  if (state.energy <= 0) {
    return { valid: false, reason: 'No energy remaining' };
  }
  
  // Check bounds
  const targetPos = addPositions(state.player.position, DIRECTION_VECTORS[direction]);
  if (!isInBounds(targetPos, state.grid)) {
    return { valid: false, reason: 'Out of bounds' };
  }
  
  // Check walkable
  const targetTile = getTileAt(state, targetPos);
  if (!targetTile.walkable) {
    return { valid: false, reason: 'Tile is not walkable' };
  }
  
  // Check locked doors
  const interactableAtTarget = getInteractableAt(state, targetPos);
  if (interactableAtTarget?.type === 'door' && interactableAtTarget.state.locked) {
    const hasKey = playerHasKey(state.player, interactableAtTarget.state.color);
    if (!hasKey) {
      return { valid: false, reason: 'Door is locked' };
    }
  }
  
  return { valid: true };
}
```

### Action Application

```typescript
function applyAction(state: GameState, action: Action): GameState {
  // Validation should happen before this
  switch (action.type) {
    case 'move':
      return applyMove(state, action.direction);
    case 'wait':
      return applyWait(state);
    default:
      return state;
  }
}

function applyMove(state: GameState, direction: Direction): GameState {
  const delta = DIRECTION_VECTORS[direction];
  const newPosition = addPositions(state.player.position, delta);
  
  // Collect items at new position
  const { items, newInteractables } = collectItems(state.interactables, newPosition);
  
  // Update inventory
  const newInventory = addItemsToInventory(state.player.inventory, items);
  
  // Open doors if player has key
  const finalInteractables = openDoorsWithKeys(newInteractables, newInventory, newPosition);
  
  return {
    ...state,
    player: {
      ...state.player,
      position: newPosition,
      inventory: newInventory,
    },
    interactables: finalInteractables,
    energy: state.energy - 1,
    turnCount: state.turnCount + 1,
  };
}
```

---

## Turn Resolution Engine

### Turn Resolution Sequence

```typescript
function resolveTurn(state: GameState): GameState {
  // Already applied action at this point
  let currentState = state;
  
  // 1. Hazard resolution
  currentState = resolveHazards(currentState);
  
  // 2. Win/lose check
  currentState = updateGameStatus(currentState);
  
  return currentState;
}

function resolveHazards(state: GameState): GameState {
  const playerPos = state.player.position;
  
  // Get all active hazards at player position
  const hazardsAtPlayer = state.hazards.filter(h => 
    h.active && positionsEqual(h.position, playerPos)
  );
  
  // If any hazard is active at player position, lose
  if (hazardsAtPlayer.length > 0) {
    return {
      ...state,
      status: 'lost',
    };
  }
  
  return state;
}

function updateGameStatus(state: GameState): GameState {
  // Already lost from hazard?
  if (state.status === 'lost') {
    return state;
  }
  
  // Check win condition
  if (positionsEqual(state.player.position, state.goal)) {
    return { ...state, status: 'won' };
  }
  
  // Check energy depletion
  if (state.energy <= 0) {
    // Check if there are any valid moves
    const validActions = getValidActions(state);
    if (validActions.length === 0) {
      return { ...state, status: 'lost' };
    }
  }
  
  return state;
}
```

---

## Grid & Spatial Systems

### Grid Initialization

```typescript
function createGrid(width: number, height: number, tileData: TileData[]): Grid {
  // Initialize 2D array
  const tiles: Tile[][] = Array(height).fill(null).map(() => 
    Array(width).fill(null)
  );
  
  // Populate tiles
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const data = tileData.find(t => t.x === x && t.y === y);
      tiles[y][x] = {
        type: data?.type ?? 'empty',
        walkable: data?.walkable ?? true,
        position: { x, y },
      };
    }
  }
  
  return { width, height, tiles };
}
```

### Spatial Queries

```typescript
// Get tile at position (with bounds checking)
function getTileAt(state: GameState, pos: Position): Tile | null {
  if (!isInBounds(pos, state.grid)) {
    return null;
  }
  return state.grid.tiles[pos.y][pos.x];
}

// Get all neighbors (4-directional)
function getNeighbors(grid: Grid, pos: Position): Position[] {
  const neighbors: Position[] = [];
  const directions: Direction[] = ['up', 'down', 'left', 'right'];
  
  for (const dir of directions) {
    const neighbor = addPositions(pos, DIRECTION_VECTORS[dir]);
    if (isInBounds(neighbor, grid)) {
      neighbors.push(neighbor);
    }
  }
  
  return neighbors;
}

// Get walkable neighbors
function getWalkableNeighbors(grid: Grid, pos: Position): Position[] {
  return getNeighbors(grid, pos).filter(neighbor => {
    const tile = grid.tiles[neighbor.y][neighbor.x];
    return tile.walkable;
  });
}
```

---

## Pathfinding Algorithms

### BFS (Breadth-First Search)

**Use case**: Find shortest path when all moves have equal cost.

```typescript
function findPathBFS(grid: Grid, start: Position, goal: Position): Position[] | null {
  const queue: Position[] = [start];
  const visited = new Set<string>();
  const parent = new Map<string, Position>();
  
  visited.add(positionToKey(start));
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    // Found goal?
    if (positionsEqual(current, goal)) {
      return reconstructPath(parent, start, goal);
    }
    
    // Explore neighbors
    const neighbors = getWalkableNeighbors(grid, current);
    for (const neighbor of neighbors) {
      const key = positionToKey(neighbor);
      if (!visited.has(key)) {
        visited.add(key);
        parent.set(key, current);
        queue.push(neighbor);
      }
    }
  }
  
  return null; // No path found
}

// Helper: Position to string key
function positionToKey(pos: Position): string {
  return `${pos.x},${pos.y}`;
}

// Helper: Reconstruct path from parent map
function reconstructPath(
  parent: Map<string, Position>,
  start: Position,
  goal: Position
): Position[] {
  const path: Position[] = [goal];
  let current = goal;
  
  while (!positionsEqual(current, start)) {
    const key = positionToKey(current);
    current = parent.get(key)!;
    path.unshift(current);
  }
  
  return path;
}
```

**Complexity**:
- Time: O(V + E) where V = tiles, E = edges (adjacencies)
- Space: O(V) for visited set and parent map
- For 16x16 grid: ~256 operations worst case

### A* (A-Star)

**Use case**: Optimized pathfinding with heuristic (better for large grids).

```typescript
function findPathAStar(grid: Grid, start: Position, goal: Position): Position[] | null {
  const openSet = new PriorityQueue<Position>((a, b) => 
    getFScore(a) - getFScore(b)
  );
  
  const gScore = new Map<string, number>(); // Cost from start
  const fScore = new Map<string, number>(); // Estimated total cost
  const parent = new Map<string, Position>();
  
  gScore.set(positionToKey(start), 0);
  fScore.set(positionToKey(start), heuristic(start, goal));
  openSet.push(start);
  
  while (!openSet.isEmpty()) {
    const current = openSet.pop()!;
    
    if (positionsEqual(current, goal)) {
      return reconstructPath(parent, start, goal);
    }
    
    const neighbors = getWalkableNeighbors(grid, current);
    for (const neighbor of neighbors) {
      const tentativeGScore = getGScore(current) + 1; // Cost = 1 per move
      
      if (tentativeGScore < getGScore(neighbor)) {
        parent.set(positionToKey(neighbor), current);
        gScore.set(positionToKey(neighbor), tentativeGScore);
        fScore.set(positionToKey(neighbor), tentativeGScore + heuristic(neighbor, goal));
        
        if (!openSet.contains(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }
  
  return null;
}

// Manhattan distance heuristic (4-directional movement)
function heuristic(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
```

**Complexity**:
- Time: O(E log V) with priority queue
- Space: O(V)
- Typically 2–3x faster than BFS for large grids

**When to use which**:
- **BFS**: Small grids (< 10x10), guaranteed shortest path
- **A***: Large grids (> 10x10), need performance optimization

### Reachability Analysis

**Use case**: Show which tiles player can reach with remaining energy.

```typescript
function getReachableTiles(state: GameState, maxEnergy: number): Set<Position> {
  const reachable = new Set<Position>();
  const queue: [Position, number][] = [[state.player.position, 0]];
  const visited = new Set<string>();
  
  while (queue.length > 0) {
    const [current, energyUsed] = queue.shift()!;
    const key = positionToKey(current);
    
    if (visited.has(key)) continue;
    visited.add(key);
    reachable.add(current);
    
    if (energyUsed >= maxEnergy) continue;
    
    const neighbors = getWalkableNeighbors(state.grid, current);
    for (const neighbor of neighbors) {
      queue.push([neighbor, energyUsed + 1]);
    }
  }
  
  return reachable;
}
```

---

## Level Loading & Validation

### Level Data Structure

```typescript
interface LevelData {
  id: string;                         // Unique level identifier
  name: string;                       // Display name
  width: number;                      // Grid width
  height: number;                     // Grid height
  playerStart: Position;              // Player starting position
  goal: Position;                     // Goal position
  energy: number;                     // Energy budget
  tiles: TileData[];                  // Tile definitions
  hazards: HazardData[];              // Hazard definitions
  interactables?: InteractableData[]; // Optional interactables
}

interface TileData {
  x: number;
  y: number;
  type: TileType;
  walkable: boolean;
}
```

### Loading Pipeline

```typescript
async function loadLevel(levelId: string): Promise<LevelData> {
  // 1. Fetch JSON file
  const response = await fetch(`/content/levels/${levelId}.json`);
  const json = await response.json();
  
  // 2. Runtime validation
  if (!validateLevelData(json)) {
    throw new Error(`Invalid level data for ${levelId}`);
  }
  
  // 3. Structural validation
  const validation = validateLevel(json);
  if (!validation.valid) {
    throw new Error(`Level validation failed: ${validation.reason}`);
  }
  
  return json as LevelData;
}
```

### Validation Rules

```typescript
function validateLevel(level: LevelData): ValidationResult {
  // Dimension checks
  if (level.width < 5 || level.height < 5) {
    return { valid: false, reason: 'Grid too small (min 5x5)' };
  }
  
  if (level.width > 20 || level.height > 20) {
    return { valid: false, reason: 'Grid too large (max 20x20)' };
  }
  
  // Position checks
  if (!isInBounds(level.playerStart, { width: level.width, height: level.height })) {
    return { valid: false, reason: 'Player start out of bounds' };
  }
  
  if (!isInBounds(level.goal, { width: level.width, height: level.height })) {
    return { valid: false, reason: 'Goal out of bounds' };
  }
  
  // Reachability check (critical!)
  const grid = createGridFromLevel(level);
  const path = findPath(grid, level.playerStart, level.goal);
  if (path === null) {
    return { valid: false, reason: 'Goal is unreachable from start' };
  }
  
  // Energy check
  const minEnergy = path.length - 1; // Minimum moves needed
  if (level.energy < minEnergy) {
    return { valid: false, reason: `Not enough energy (need ${minEnergy}, have ${level.energy})` };
  }
  
  return { valid: true };
}
```

---

## Serialization (Save/Load)

### Save Format

```typescript
interface SaveData {
  version: string;                    // Save format version (for migrations)
  timestamp: number;                  // When saved
  currentLevel: string;               // Current level ID
  unlockedLevels: string[];           // List of unlocked level IDs
  gameState?: GameState;              // Current game state (if mid-level)
}

function serializeState(state: GameState): string {
  const saveData: SaveData = {
    version: '1.0',
    timestamp: Date.now(),
    currentLevel: state.levelId,
    unlockedLevels: getUnlockedLevels(), // From global progress
    gameState: state,
  };
  
  return JSON.stringify(saveData);
}

function deserializeState(json: string): GameState {
  const saveData = JSON.parse(json) as SaveData;
  
  // Version migration (if needed)
  if (saveData.version !== '1.0') {
    throw new Error('Unsupported save version');
  }
  
  if (!saveData.gameState) {
    throw new Error('No game state in save data');
  }
  
  return saveData.gameState;
}
```

### LocalStorage Integration

```typescript
const SAVE_KEY = 'signal-path-save';

function saveGame(state: GameState): void {
  const serialized = serializeState(state);
  localStorage.setItem(SAVE_KEY, serialized);
}

function loadGame(): GameState | null {
  const serialized = localStorage.getItem(SAVE_KEY);
  if (!serialized) return null;
  
  try {
    return deserializeState(serialized);
  } catch (error) {
    console.error('Failed to load save:', error);
    return null;
  }
}
```

---

## UI Architecture

### Scene System

```typescript
interface Scene {
  name: string;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  handleInput(action: Action): void;
  onEnter?(): void;
  onExit?(): void;
}

class GameScene implements Scene {
  name = 'game';
  private gameState: GameState;
  
  constructor(levelId: string) {
    this.gameState = loadAndInitLevel(levelId);
  }
  
  update(deltaTime: number): void {
    // Game logic update (animations, etc.)
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    renderGame(ctx, this.gameState);
  }
  
  handleInput(action: Action): void {
    this.gameState = processPlayerInput(this.gameState, action);
  }
}
```

### Scene Transitions

```typescript
class SceneManager {
  private currentScene: Scene | null = null;
  private scenes: Map<string, Scene> = new Map();
  
  register(scene: Scene): void {
    this.scenes.set(scene.name, scene);
  }
  
  switchTo(sceneName: string): void {
    this.currentScene?.onExit?.();
    
    const nextScene = this.scenes.get(sceneName);
    if (!nextScene) {
      throw new Error(`Scene not found: ${sceneName}`);
    }
    
    this.currentScene = nextScene;
    this.currentScene.onEnter?.();
  }
  
  update(deltaTime: number): void {
    this.currentScene?.update(deltaTime);
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    this.currentScene?.render(ctx);
  }
}
```

---

## Rendering System

### Rendering Pipeline

```typescript
function render(ctx: CanvasRenderingContext2D, state: GameState): void {
  // 1. Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 2. Render grid (bottom layer)
  renderGrid(ctx, state.grid);
  
  // 3. Render interactables
  renderInteractables(ctx, state.interactables);
  
  // 4. Render hazards
  renderHazards(ctx, state.hazards);
  
  // 5. Render goal
  renderGoal(ctx, state.goal);
  
  // 6. Render player (top layer)
  renderPlayer(ctx, state.player);
  
  // 7. Render HUD (overlay)
  renderHUD(ctx, state);
  
  // 8. Render win/lose screen (if applicable)
  if (state.status !== 'playing') {
    renderGameOver(ctx, state.status);
  }
}
```

### Camera/Viewport System

```typescript
interface Camera {
  x: number;                          // Camera position (world coordinates)
  y: number;
  zoom: number;                       // Zoom level (1.0 = normal)
}

function worldToScreen(worldPos: Position, camera: Camera): Position {
  return {
    x: (worldPos.x - camera.x) * TILE_SIZE * camera.zoom,
    y: (worldPos.y - camera.y) * TILE_SIZE * camera.zoom,
  };
}

function screenToWorld(screenPos: Position, camera: Camera): Position {
  return {
    x: Math.floor(screenPos.x / (TILE_SIZE * camera.zoom) + camera.x),
    y: Math.floor(screenPos.y / (TILE_SIZE * camera.zoom) + camera.y),
  };
}
```

---

## Input Handling

### Input Mapping

```typescript
const KEYBOARD_MAP: Record<string, Direction | 'wait' | 'undo'> = {
  // Arrow keys
  'ArrowUp': 'up',
  'ArrowDown': 'down',
  'ArrowLeft': 'left',
  'ArrowRight': 'right',
  
  // WASD
  'w': 'up',
  's': 'down',
  'a': 'left',
  'd': 'right',
  
  // Actions
  ' ': 'wait',              // Space = wait
  'u': 'undo',              // U = undo
  'r': 'restart',           // R = restart (not implemented yet)
};

function handleKeyDown(event: KeyboardEvent): Action | null {
  const mapped = KEYBOARD_MAP[event.key.toLowerCase()];
  if (!mapped) return null;
  
  if (mapped === 'wait') {
    return { type: 'wait' };
  } else if (mapped === 'undo') {
    return { type: 'undo' };
  } else {
    return { type: 'move', direction: mapped };
  }
}
```

### Touch/Mobile Support

```typescript
interface TouchState {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

function handleTouchEnd(touch: TouchState): Action | null {
  const dx = touch.endX - touch.startX;
  const dy = touch.endY - touch.startY;
  const threshold = 30; // Minimum swipe distance
  
  if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) {
    return null; // Not a swipe
  }
  
  // Determine primary direction
  if (Math.abs(dx) > Math.abs(dy)) {
    return { type: 'move', direction: dx > 0 ? 'right' : 'left' };
  } else {
    return { type: 'move', direction: dy > 0 ? 'down' : 'up' };
  }
}
```

---

## Testing Strategy

See `TESTING.md` for full details. Key patterns:

### Unit Test Pattern

```typescript
describe('applyAction', () => {
  it('should move player and deduct energy', () => {
    const state = createTestState({
      player: { position: { x: 1, y: 1 }, inventory: { keys: [] } },
      energy: 10,
    });
    
    const action: Action = { type: 'move', direction: 'right' };
    const newState = applyAction(state, action);
    
    expect(newState.player.position).toEqual({ x: 2, y: 1 });
    expect(newState.energy).toBe(9);
  });
});
```

### Determinism Test Pattern

```typescript
it('should produce identical results for same action sequence', () => {
  const state1 = createGameState(testLevel);
  const state2 = createGameState(testLevel);
  
  const actions: Action[] = [
    { type: 'move', direction: 'right' },
    { type: 'move', direction: 'down' },
    { type: 'wait' },
  ];
  
  const result1 = actions.reduce((s, a) => applyAction(s, a), state1);
  const result2 = actions.reduce((s, a) => applyAction(s, a), state2);
  
  expect(result1).toEqual(result2);
});
```

---

## Performance Considerations

### Optimization Targets

For a 16x16 grid game:
- **Frame rate**: 60 FPS (16.67ms per frame)
- **Input latency**: < 50ms (3 frames)
- **Level load**: < 100ms
- **Pathfinding**: < 5ms per call

### Performance Patterns

#### Memoization

```typescript
// Cache pathfinding results
const pathCache = new Map<string, Position[] | null>();

function findPathCached(grid: Grid, start: Position, goal: Position): Position[] | null {
  const key = `${positionToKey(start)}-${positionToKey(goal)}`;
  
  if (pathCache.has(key)) {
    return pathCache.get(key)!;
  }
  
  const path = findPathAStar(grid, start, goal);
  pathCache.set(key, path);
  return path;
}
```

#### Spatial Hashing (Future)

```typescript
// For large numbers of entities
class SpatialHash {
  private cellSize: number;
  private grid: Map<string, Hazard[]>;
  
  insert(hazard: Hazard): void {
    const cell = this.getCell(hazard.position);
    const key = this.getCellKey(cell);
    
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    
    this.grid.get(key)!.push(hazard);
  }
  
  query(position: Position): Hazard[] {
    const cell = this.getCell(position);
    const key = this.getCellKey(cell);
    return this.grid.get(key) ?? [];
  }
}
```

---

## TypeScript Conventions

### Strict Mode

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### Type Guards

```typescript
function isHazard(entity: Entity): entity is Hazard {
  return 'type' in entity && entity.type === 'hazard';
}

function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}
```

### Discriminated Unions

```typescript
type Result<T, E> = 
  | { success: true; value: T }
  | { success: false; error: E };

function processResult<T, E>(result: Result<T, E>): T {
  if (result.success) {
    return result.value; // TypeScript knows this is safe
  } else {
    throw new Error(result.error);
  }
}
```

---

## Error Handling

### Error Categories

```typescript
class LevelLoadError extends Error {
  constructor(levelId: string, reason: string) {
    super(`Failed to load level ${levelId}: ${reason}`);
    this.name = 'LevelLoadError';
  }
}

class ValidationError extends Error {
  constructor(reason: string) {
    super(`Validation failed: ${reason}`);
    this.name = 'ValidationError';
  }
}
```

### Error Boundaries

```typescript
function safeLoadLevel(levelId: string): LevelData | null {
  try {
    return loadLevel(levelId);
  } catch (error) {
    console.error('Level load failed:', error);
    // Show user-friendly error message
    showErrorScreen(`Could not load level ${levelId}`);
    return null;
  }
}
```

---

## Future Architectural Considerations

### Undo System (Phase 2)

```typescript
interface GameState {
  // ... existing fields
  actionHistory: Action[];            // Stack of past actions
  stateHistory: GameState[];          // Stack of past states (expensive!)
}

// Option 1: Store full state snapshots (simple, memory-intensive)
function undo(state: GameState): GameState {
  if (state.stateHistory.length === 0) return state;
  return state.stateHistory[state.stateHistory.length - 1];
}

// Option 2: Replay actions from initial state (complex, memory-efficient)
function undo(state: GameState): GameState {
  if (state.actionHistory.length === 0) return state;
  
  const actions = state.actionHistory.slice(0, -1);
  const initialState = loadLevel(state.levelId);
  
  return actions.reduce((s, a) => applyAction(s, a), initialState);
}
```

### Procedural Generation (Phase 4)

```typescript
interface GenerationParams {
  seed: number;                       // Deterministic seed
  difficulty: number;                 // 1-10 scale
  size: { width: number; height: number };
  hazardDensity: number;              // 0.0 - 1.0
}

function generateLevel(params: GenerationParams): LevelData {
  const rng = seededRandom(params.seed);
  
  // 1. Generate walkable grid (ensure connectivity)
  const grid = generateConnectedGrid(params.size, rng);
  
  // 2. Place start and goal (maximize distance)
  const { start, goal } = placeStartAndGoal(grid, rng);
  
  // 3. Place hazards (avoid blocking optimal path)
  const hazards = placeHazards(grid, start, goal, params.hazardDensity, rng);
  
  // 4. Calculate energy budget
  const optimalPath = findPath(grid, start, goal)!;
  const energy = Math.floor(optimalPath.length * (1.2 + params.difficulty * 0.1));
  
  return { /* ... */ };
}
```

---

## Changelog

### v1.0 (2025-01-22)
- Initial technical architecture
- Core data structures defined
- Module organization specified
- Pathfinding algorithms documented
- Rendering and input systems outlined

---

## Document Maintenance

Update this document when:
- Adding new data structures
- Changing module boundaries
- Implementing new algorithms
- Making architectural decisions

Cross-reference with:
- `GDD.md` for game behavior
- `DECISIONS.md` for rationale
- `TESTING.md` for validation approach

---

**END OF TECHNICAL DESIGN DOCUMENT**