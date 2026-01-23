/**
 * Game State Management Module
 *
 * This file is responsible for:
 * - Grid creation and manipulation
 * - Position utility functions
 * - GameState initialization from level data
 * - State queries (no mutations)
 *
 * Architecture note:
 * - Part of the core logic layer (no browser dependencies)
 * - All functions are pure (no side effects)
 * - Follows immutable data patterns
 * - Can be tested in Node.js without a browser
 *
 * Design principle: Separation of data and behavior
 * - This file creates and queries state
 * - actions.ts modifies state (creates new state objects)
 * - rules.ts evaluates state (win/lose conditions)
 */

import type {
  Position,
  Grid,
  Tile,
  LevelData,
  GameState,
  Player,
  Hazard,
  Interactable,
} from './types';

// ============================================================================
// POSITION UTILITIES
// ============================================================================

/**
 * Check if two positions are equal
 *
 * Positions are considered equal if both x and y coordinates match.
 * Used for checking:
 * - Is player on goal?
 * - Is player on hazard?
 * - Are two tiles the same?
 *
 * @param a - First position
 * @param b - Second position
 * @returns true if positions are equal, false otherwise
 *
 * Example:
 * ```typescript
 * positionsEqual({ x: 5, y: 10 }, { x: 5, y: 10 }) // true
 * positionsEqual({ x: 5, y: 10 }, { x: 5, y: 11 }) // false
 * ```
 */
export function positionsEqual(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

/**
 * Check if a position is within grid bounds
 *
 * Valid positions have:
 * - x >= 0 and x < grid.width
 * - y >= 0 and y < grid.height
 *
 * This is essential for:
 * - Movement validation (can't move off grid)
 * - Array access safety (prevent out-of-bounds errors)
 * - Neighbor calculation (edge tiles have fewer neighbors)
 *
 * @param pos - Position to check
 * @param grid - Grid to check against
 * @returns true if position is within bounds, false otherwise
 *
 * Example:
 * ```typescript
 * const grid = { width: 5, height: 5, tiles: [...] };
 * isInBounds({ x: 4, y: 4 }, grid)  // true (bottom-right corner)
 * isInBounds({ x: 5, y: 4 }, grid)  // false (off right edge)
 * isInBounds({ x: -1, y: 0 }, grid) // false (off left edge)
 * ```
 */
export function isInBounds(pos: Position, grid: Grid): boolean {
  return pos.x >= 0 && pos.x < grid.width && pos.y >= 0 && pos.y < grid.height;
}

/**
 * Add two positions together (vector addition)
 *
 * Used primarily for movement:
 * - Take current position
 * - Add direction vector (from DIRECTION_VECTORS)
 * - Get new position
 *
 * This is pure vector math: (a.x + b.x, a.y + b.y)
 *
 * @param a - First position (usually current position)
 * @param b - Second position (usually direction vector)
 * @returns New position with summed coordinates
 *
 * Example:
 * ```typescript
 * const currentPos = { x: 5, y: 5 };
 * const upVector = { x: 0, y: -1 }; // DIRECTION_VECTORS.up
 * const newPos = addPositions(currentPos, upVector); // { x: 5, y: 4 }
 * ```
 */
export function addPositions(a: Position, b: Position): Position {
  return { x: a.x + b.x, y: a.y + b.y };
}

// ============================================================================
// GRID CREATION
// ============================================================================

/**
 * Create a grid from level data
 *
 * This converts the JSON level format (compact, human-readable) into
 * the runtime grid format (2D array, optimized for access).
 *
 * Algorithm:
 * 1. Create width x height 2D array
 * 2. Initialize all tiles as empty (walkable)
 * 3. Override specific tiles from level data (walls, goals)
 *
 * Grid structure:
 * - 2D array in row-major order: tiles[y][x]
 * - First index is row (y coordinate)
 * - Second index is column (x coordinate)
 *
 * Why this structure:
 * - Natural for nested loops: for (y) { for (x) { ... } }
 * - Matches visual layout (rows then columns)
 * - Standard in game development
 *
 * @param levelData - Level data from JSON file
 * @returns Grid with 2D tile array
 *
 * Example:
 * ```typescript
 * const level = {
 *   width: 3,
 *   height: 3,
 *   tiles: [
 *     { x: 1, y: 1, type: 'wall' },  // Center tile is a wall
 *   ],
 *   // ... other fields
 * };
 * const grid = createGrid(level);
 * // grid.tiles[1][1] will be a wall
 * // All other tiles will be empty
 * ```
 */
export function createGrid(levelData: LevelData): Grid {
  const { width, height, tiles: tileData = [] } = levelData;

  // Initialize 2D array with empty tiles
  // We create height rows, each containing width tiles
  const tiles: Tile[][] = Array(height)
    .fill(null)
    .map((_, y) =>
      Array(width)
        .fill(null)
        .map((_, x) => ({
          type: 'empty' as const,
          walkable: true,
          position: { x, y },
        }))
    );

  // Override specific tiles from level data
  // This allows level designers to only specify non-empty tiles (more compact)
  for (const data of tileData) {
    // Validate position is within bounds before setting
    if (data.x >= 0 && data.x < width && data.y >= 0 && data.y < height) {
      tiles[data.y][data.x] = {
        type: data.type,
        walkable: data.type !== 'wall', // Walls are not walkable
        position: { x: data.x, y: data.y },
      };
    }
  }

  return { width, height, tiles };
}

// ============================================================================
// GRID QUERIES
// ============================================================================

/**
 * Get tile at a specific position (safe access)
 *
 * This is the preferred way to access tiles because it:
 * - Checks bounds automatically
 * - Returns null for invalid positions (no crashes)
 * - Provides clear API (better than direct array access)
 *
 * Why return null instead of throwing:
 * - Boundary checks are common (not exceptional)
 * - Easier to handle in conditional logic
 * - Follows "parse, don't validate" principle
 *
 * @param grid - Grid to query
 * @param pos - Position to check
 * @returns Tile at position, or null if out of bounds
 *
 * Example:
 * ```typescript
 * const tile = getTileAt(grid, { x: 5, y: 5 });
 * if (tile === null) {
 *   console.log('Position is out of bounds');
 * } else if (!tile.walkable) {
 *   console.log('Tile is blocked');
 * }
 * ```
 */
export function getTileAt(grid: Grid, pos: Position): Tile | null {
  if (!isInBounds(pos, grid)) {
    return null;
  }
  return grid.tiles[pos.y][pos.x];
}

/**
 * Get all adjacent positions (4-directional)
 *
 * Returns positions in all cardinal directions: up, down, left, right
 * Does NOT include diagonals (by design - see ADR-011)
 *
 * Only returns positions that are within grid bounds.
 * Corner tiles will have 2 neighbors, edge tiles 3, center tiles 4.
 *
 * Why 4-directional:
 * - Simpler pathfinding (no diagonal cost questions)
 * - Manhattan distance heuristic works perfectly
 * - Grid puzzle aesthetic
 *
 * @param grid - Grid to check bounds against
 * @param pos - Position to get neighbors of
 * @returns Array of valid neighbor positions (0-4 positions)
 *
 * Example:
 * ```typescript
 * // Center tile has 4 neighbors
 * getNeighbors(grid, { x: 2, y: 2 }) // 4 positions
 *
 * // Corner tile has 2 neighbors
 * getNeighbors(grid, { x: 0, y: 0 }) // 2 positions (right, down)
 * ```
 */
export function getNeighbors(grid: Grid, pos: Position): Position[] {
  const neighbors: Position[] = [];

  // Check all 4 cardinal directions
  // Order: up, down, left, right (arbitrary but consistent)
  const deltas = [
    { x: 0, y: -1 }, // up
    { x: 0, y: 1 }, // down
    { x: -1, y: 0 }, // left
    { x: 1, y: 0 }, // right
  ];

  for (const delta of deltas) {
    const neighbor = addPositions(pos, delta);

    // Only include neighbors that are within grid bounds
    if (isInBounds(neighbor, grid)) {
      neighbors.push(neighbor);
    }
  }

  return neighbors;
}

/**
 * Get all walkable adjacent positions
 *
 * Like getNeighbors(), but filters out walls and other non-walkable tiles.
 * This is the function used for movement validation and pathfinding.
 *
 * A tile is walkable if:
 * - It exists (within bounds)
 * - tile.walkable is true (not a wall)
 *
 * Future expansion (Phase 2):
 * - Locked doors are not walkable (until key collected)
 * - Some hazards might be non-walkable
 *
 * @param grid - Grid to query
 * @param pos - Position to get walkable neighbors of
 * @returns Array of walkable neighbor positions (0-4 positions)
 *
 * Example:
 * ```typescript
 * // Player at (1, 1), wall at (2, 1)
 * const neighbors = getWalkableNeighbors(grid, { x: 1, y: 1 });
 * // neighbors will NOT include { x: 2, y: 1 } (wall is filtered out)
 * ```
 */
export function getWalkableNeighbors(grid: Grid, pos: Position): Position[] {
  return getNeighbors(grid, pos).filter((neighbor) => {
    const tile = getTileAt(grid, neighbor);
    // tile could be null (shouldn't happen after getNeighbors, but be safe)
    return tile !== null && tile.walkable;
  });
}

// ============================================================================
// GAMESTATE CREATION
// ============================================================================

/**
 * Create initial game state from level data
 *
 * This is the bridge between:
 * - External level data (JSON files, compact format)
 * - Internal game state (runtime format, optimized for gameplay)
 *
 * Responsibilities:
 * - Convert JSON level to runtime structures
 * - Initialize player at starting position
 * - Set up hazards and interactables
 * - Set initial energy and status
 *
 * This function creates the INITIAL state. All future states are created
 * by applying actions (see actions.ts).
 *
 * @param levelData - Level data loaded from JSON
 * @returns Initial game state ready for gameplay
 *
 * Example:
 * ```typescript
 * const level = await loadLevel('01_first_steps');
 * const state = createGameState(level);
 * // state.status === 'playing'
 * // state.turnCount === 0
 * // state.player.position === level.playerStart
 * ```
 */
export function createGameState(levelData: LevelData): GameState {
  // Create the grid (2D tile array)
  const grid = createGrid(levelData);

  // Initialize player at starting position with empty inventory
  const player: Player = {
    position: { ...levelData.playerStart }, // Spread to create new object (immutability)
    inventory: { keys: [] },
  };

  // Initialize hazards from level data
  // If no hazards specified, use empty array
  const hazards: Hazard[] =
    levelData.hazards?.map((h) => ({
      id: h.id,
      position: { x: h.x, y: h.y },
      type: h.type,
      active: true, // All hazards start active
    })) ?? [];

  // Initialize interactables (keys, doors) from level data
  // Convert compact JSON format to runtime format with state
  const interactables: Interactable[] =
    levelData.interactables?.map((i) => ({
      id: i.id,
      position: { x: i.x, y: i.y },
      type: i.type,
      // Discriminated union: state depends on type
      state:
        i.type === 'key'
          ? { type: 'key', color: i.color!, collected: false }
          : { type: 'door', color: i.color!, locked: true },
    })) ?? [];

  // Construct complete game state
  return {
    levelId: levelData.id,
    status: 'playing', // All levels start in playing state
    turnCount: 0, // No turns taken yet
    grid,
    player,
    hazards,
    interactables,
    goal: { ...levelData.goal }, // Spread for immutability
    energy: levelData.energy,
    maxEnergy: levelData.energy, // Store max for UI display
  };
}
