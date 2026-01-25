/**
 * Core Type Definitions for Signal Path
 *
 * This file contains all the fundamental types used throughout the game.
 * These types are pure data structures with no behavior - all logic lives
 * in separate modules (state.ts, actions.ts, rules.ts).
 *
 * Design principles:
 * - Immutable by design (all state updates create new objects)
 * - Discriminated unions for type safety
 * - No circular references (serialization-friendly)
 * - No browser dependencies (can run in Node.js)
 */

// ============================================================================
// POSITION & DIRECTION
// ============================================================================

/**
 * A 2D coordinate on the grid.
 * Origin (0,0) is top-left, x increases right, y increases down.
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Cardinal directions for movement.
 * Maps to DIRECTION_VECTORS for position deltas.
 */
export type Direction = 'up' | 'down' | 'left' | 'right';

/**
 * Position deltas for each direction.
 * Used to calculate new positions after movement.
 */
export const DIRECTION_VECTORS: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

// ============================================================================
// GRID & TILES
// ============================================================================

/**
 * Types of tiles that can exist on the grid.
 */
export type TileType = 'empty' | 'wall' | 'goal';

/**
 * A single tile in the grid.
 * Contains both visual information (type) and gameplay properties (walkable).
 */
export interface Tile {
  /** Visual appearance and semantic meaning */
  type: TileType;
  /** Can the player move onto this tile? */
  walkable: boolean;
  /** Position of this tile in the grid (for convenience) */
  position: Position;
}

/**
 * The game grid - a 2D array of tiles.
 * Stored in row-major order: tiles[y][x]
 */
export interface Grid {
  width: number;
  height: number;
  /** 2D array: tiles[y][x] gives tile at position (x,y) */
  tiles: Tile[][];
}

// ============================================================================
// PLAYER
// ============================================================================

/**
 * Items the player can collect (currently just keys).
 */
export type KeyColor = 'red' | 'blue' | 'green' | 'yellow';

export interface KeyItem {
  id: string;
  color: KeyColor;
}

/**
 * Player's inventory of collected items.
 */
export interface Inventory {
  keys: KeyItem[];
}

/**
 * The player entity.
 */
export interface Player {
  position: Position;
  inventory: Inventory;
}

// ============================================================================
// HAZARDS
// ============================================================================

/**
 * Types of hazards that can damage/kill the player.
 */
export type HazardType = 'spike' | 'laser' | 'fire';

/**
 * A hazard on the grid.
 * Moving onto an active hazard ends the game (lose condition).
 */
export interface Hazard {
  id: string;
  position: Position;
  type: HazardType;
  /** Is this hazard currently dangerous? */
  active: boolean;
}

// ============================================================================
// INTERACTABLES
// ============================================================================

/**
 * Types of objects the player can interact with.
 */
export type InteractableType = 'key' | 'door';

/**
 * State of an interactable object (discriminated union).
 * This allows type-safe handling of different interactable types.
 */
export type InteractableState =
  | { type: 'key'; color: KeyColor; collected: boolean }
  | { type: 'door'; color: KeyColor; locked: boolean };

/**
 * An interactive object on the grid.
 * Uses discriminated union for type-safe state.
 */
export interface Interactable {
  id: string;
  position: Position;
  type: InteractableType;
  state: InteractableState;
}

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Actions the player can take (discriminated union).
 * All actions are discrete and deterministic.
 */
export type Action =
  | { type: 'move'; direction: Direction }
  | { type: 'wait' }
  | { type: 'restart' }
  | { type: 'undo' };

// ============================================================================
// GAME STATE
// ============================================================================

/**
 * Current status of the game.
 */
export type GameStatus = 'playing' | 'won' | 'lost';

/**
 * The complete game state.
 *
 * This is the single source of truth for the entire game.
 * All game logic operates on this structure.
 *
 * Design notes:
 * - Immutable updates (create new GameState on each change)
 * - Serializable (can be saved/loaded as JSON)
 * - No circular references
 * - No functions or behavior (pure data)
 */
export interface GameState {
  /** ID of the current level */
  levelId: string;

  /** Current game status */
  status: GameStatus;

  /** Number of turns taken */
  turnCount: number;

  /** The game grid */
  grid: Grid;

  /** Player entity */
  player: Player;

  /** All hazards in the level */
  hazards: Hazard[];

  /** All interactable objects */
  interactables: Interactable[];

  /** Goal position (win condition) */
  goal: Position;

  /** Current energy remaining */
  energy: number;

  /** Maximum energy for this level */
  maxEnergy: number;

  /** History of actions (for undo) */
  actionHistory?: Action[];

  /** History of previous states (for undo - stores full state snapshots) */
  stateHistory?: GameState[];
}

// ============================================================================
// LEVEL DATA (JSON Format)
// ============================================================================

/**
 * Level data as stored in JSON files.
 * This is the external representation loaded from content/levels/*.json
 *
 * Gets converted to GameState by createGameState() in state.ts
 */
export interface LevelData {
  /** Unique level identifier */
  id: string;

  /** Human-readable name */
  name: string;

  /** Schema version (for future compatibility) */
  version: string;

  /** Grid dimensions */
  width: number;
  height: number;

  /** Starting position for player */
  playerStart: Position;

  /** Goal position (win condition) */
  goal: Position;

  /** Energy budget for this level */
  energy: number;

  /** Optional description/hint */
  description?: string;

  /** Optional custom tiles (walls, etc.) */
  tiles?: Array<{ x: number; y: number; type: TileType }>;

  /** Optional hazards */
  hazards?: Array<{
    id: string;
    x: number;
    y: number;
    type: HazardType;
  }>;

  /** Optional interactable objects */
  interactables?: Array<{
    id: string;
    x: number;
    y: number;
    type: InteractableType;
    color?: KeyColor;
  }>;
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Result of a validation check.
 * If valid=false, reason contains human-readable error message.
 */
export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * A rectangle defined by top-left corner and dimensions.
 * Used for bounds checking and spatial queries.
 */
export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * A path through the grid (sequence of positions).
 * Used by pathfinding algorithms.
 */
export type Path = Position[];

/**
 * Result of a pathfinding query.
 */
export interface PathfindingResult {
  found: boolean;
  path?: Path;
  cost?: number;
}
