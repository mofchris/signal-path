/**
 * Grid System and State Management Test Suite
 *
 * This file tests all functions in src/core/state.ts:
 * - Position utilities (positionsEqual, isInBounds, addPositions)
 * - Grid creation (createGrid)
 * - Grid queries (getTileAt, getNeighbors, getWalkableNeighbors)
 * - GameState initialization (createGameState)
 *
 * Testing strategy:
 * - Test happy path (normal operation)
 * - Test edge cases (bounds, corners, empty)
 * - Test immutability (no mutations)
 * - Achieve > 90% coverage
 *
 * Why these tests matter:
 * - Grid system is foundation for entire game
 * - Position errors cause crashes or wrong behavior
 * - Bounds errors are common bug source
 * - These functions are called constantly during gameplay
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  positionsEqual,
  isInBounds,
  addPositions,
  createGrid,
  getTileAt,
  getNeighbors,
  getWalkableNeighbors,
  createGameState,
} from '../../src/core/state';
import type { LevelData, Grid } from '../../src/core/types';

// ============================================================================
// TEST DATA
// ============================================================================

/**
 * Minimal test level for basic testing
 * 5x5 grid with one wall at (2,2) and goal at (4,4)
 */
const testLevel: LevelData = {
  id: 'test',
  name: 'Test Level',
  version: '1.0.0',
  width: 5,
  height: 5,
  playerStart: { x: 0, y: 0 },
  goal: { x: 4, y: 4 },
  energy: 10,
  tiles: [
    { x: 2, y: 2, type: 'wall' }, // Center wall
    { x: 4, y: 4, type: 'goal' }, // Goal tile
  ],
};

// ============================================================================
// POSITION UTILITIES TESTS
// ============================================================================

describe('Position Utilities', () => {
  describe('positionsEqual', () => {
    /**
     * Test: Identical positions are equal
     * This is the basic case - same x and y
     */
    it('should return true for identical positions', () => {
      const pos1 = { x: 5, y: 10 };
      const pos2 = { x: 5, y: 10 };
      expect(positionsEqual(pos1, pos2)).toBe(true);
    });

    /**
     * Test: Different x coordinate
     * Should return false even if y matches
     */
    it('should return false for different x', () => {
      const pos1 = { x: 5, y: 10 };
      const pos2 = { x: 6, y: 10 };
      expect(positionsEqual(pos1, pos2)).toBe(false);
    });

    /**
     * Test: Different y coordinate
     * Should return false even if x matches
     */
    it('should return false for different y', () => {
      const pos1 = { x: 5, y: 10 };
      const pos2 = { x: 5, y: 11 };
      expect(positionsEqual(pos1, pos2)).toBe(false);
    });

    /**
     * Test: Both coordinates different
     * Obviously should be false
     */
    it('should return false for different x and y', () => {
      const pos1 = { x: 5, y: 10 };
      const pos2 = { x: 6, y: 11 };
      expect(positionsEqual(pos1, pos2)).toBe(false);
    });

    /**
     * Test: Origin (0,0) equality
     * Edge case: zero values should work correctly
     */
    it('should work with origin (0,0)', () => {
      const pos1 = { x: 0, y: 0 };
      const pos2 = { x: 0, y: 0 };
      expect(positionsEqual(pos1, pos2)).toBe(true);
    });

    /**
     * Test: Negative coordinates
     * Although game doesn't use negative positions,
     * the function should still handle them correctly
     */
    it('should work with negative coordinates', () => {
      const pos1 = { x: -1, y: -1 };
      const pos2 = { x: -1, y: -1 };
      expect(positionsEqual(pos1, pos2)).toBe(true);
    });
  });

  describe('isInBounds', () => {
    const grid: Grid = {
      width: 5,
      height: 5,
      tiles: [], // Don't need actual tiles for bounds checking
    };

    /**
     * Test: Valid positions within grid
     * All corners and center should be valid
     */
    it('should return true for valid positions', () => {
      expect(isInBounds({ x: 0, y: 0 }, grid)).toBe(true); // Top-left corner
      expect(isInBounds({ x: 4, y: 4 }, grid)).toBe(true); // Bottom-right corner
      expect(isInBounds({ x: 2, y: 2 }, grid)).toBe(true); // Center
      expect(isInBounds({ x: 0, y: 4 }, grid)).toBe(true); // Bottom-left corner
      expect(isInBounds({ x: 4, y: 0 }, grid)).toBe(true); // Top-right corner
    });

    /**
     * Test: Out of bounds - left edge
     * x = -1 is one tile left of the grid
     */
    it('should return false for x < 0', () => {
      expect(isInBounds({ x: -1, y: 0 }, grid)).toBe(false);
      expect(isInBounds({ x: -1, y: 2 }, grid)).toBe(false);
    });

    /**
     * Test: Out of bounds - right edge
     * x = 5 is one tile right of the grid (width is 5, so max x is 4)
     */
    it('should return false for x >= width', () => {
      expect(isInBounds({ x: 5, y: 0 }, grid)).toBe(false);
      expect(isInBounds({ x: 6, y: 2 }, grid)).toBe(false);
    });

    /**
     * Test: Out of bounds - top edge
     * y = -1 is one tile above the grid
     */
    it('should return false for y < 0', () => {
      expect(isInBounds({ x: 0, y: -1 }, grid)).toBe(false);
      expect(isInBounds({ x: 2, y: -1 }, grid)).toBe(false);
    });

    /**
     * Test: Out of bounds - bottom edge
     * y = 5 is one tile below the grid (height is 5, so max y is 4)
     */
    it('should return false for y >= height', () => {
      expect(isInBounds({ x: 0, y: 5 }, grid)).toBe(false);
      expect(isInBounds({ x: 2, y: 6 }, grid)).toBe(false);
    });

    /**
     * Test: 1x1 grid edge case
     * Only (0,0) should be valid
     */
    it('should work with 1x1 grid', () => {
      const tinyGrid: Grid = { width: 1, height: 1, tiles: [] };
      expect(isInBounds({ x: 0, y: 0 }, tinyGrid)).toBe(true);
      expect(isInBounds({ x: 1, y: 0 }, tinyGrid)).toBe(false);
      expect(isInBounds({ x: 0, y: 1 }, tinyGrid)).toBe(false);
    });
  });

  describe('addPositions', () => {
    /**
     * Test: Basic vector addition
     * (5, 10) + (2, 3) = (7, 13)
     */
    it('should add positions correctly', () => {
      const pos1 = { x: 5, y: 10 };
      const pos2 = { x: 2, y: 3 };
      const result = addPositions(pos1, pos2);
      expect(result).toEqual({ x: 7, y: 13 });
    });

    /**
     * Test: Movement simulation (up)
     * Moving up means y decreases by 1
     */
    it('should simulate moving up', () => {
      const pos = { x: 5, y: 5 };
      const upVector = { x: 0, y: -1 };
      const result = addPositions(pos, upVector);
      expect(result).toEqual({ x: 5, y: 4 });
    });

    /**
     * Test: Movement simulation (down)
     * Moving down means y increases by 1
     */
    it('should simulate moving down', () => {
      const pos = { x: 5, y: 5 };
      const downVector = { x: 0, y: 1 };
      const result = addPositions(pos, downVector);
      expect(result).toEqual({ x: 5, y: 6 });
    });

    /**
     * Test: Movement simulation (left)
     * Moving left means x decreases by 1
     */
    it('should simulate moving left', () => {
      const pos = { x: 5, y: 5 };
      const leftVector = { x: -1, y: 0 };
      const result = addPositions(pos, leftVector);
      expect(result).toEqual({ x: 4, y: 5 });
    });

    /**
     * Test: Movement simulation (right)
     * Moving right means x increases by 1
     */
    it('should simulate moving right', () => {
      const pos = { x: 5, y: 5 };
      const rightVector = { x: 1, y: 0 };
      const result = addPositions(pos, rightVector);
      expect(result).toEqual({ x: 6, y: 5 });
    });

    /**
     * Test: Adding zero vector
     * Should return same position
     */
    it('should handle zero vector', () => {
      const pos = { x: 5, y: 10 };
      const zero = { x: 0, y: 0 };
      const result = addPositions(pos, zero);
      expect(result).toEqual({ x: 5, y: 10 });
    });

    /**
     * Test: Immutability
     * Original positions should not be modified
     */
    it('should not mutate original positions', () => {
      const pos1 = { x: 5, y: 10 };
      const pos2 = { x: 2, y: 3 };
      addPositions(pos1, pos2);
      expect(pos1).toEqual({ x: 5, y: 10 }); // Unchanged
      expect(pos2).toEqual({ x: 2, y: 3 }); // Unchanged
    });
  });
});

// ============================================================================
// GRID CREATION TESTS
// ============================================================================

describe('Grid Creation', () => {
  describe('createGrid', () => {
    /**
     * Test: Grid dimensions match level data
     * Width and height should be preserved
     */
    it('should create grid with correct dimensions', () => {
      const grid = createGrid(testLevel);
      expect(grid.width).toBe(5);
      expect(grid.height).toBe(5);
      expect(grid.tiles.length).toBe(5); // 5 rows
      expect(grid.tiles[0].length).toBe(5); // 5 columns
    });

    /**
     * Test: Default tiles are empty and walkable
     * Tiles not specified in level data should default to empty
     */
    it('should initialize unspecified tiles as empty', () => {
      const grid = createGrid(testLevel);
      const emptyTile = grid.tiles[0][0]; // Top-left, not specified in testLevel
      expect(emptyTile.type).toBe('empty');
      expect(emptyTile.walkable).toBe(true);
    });

    /**
     * Test: Wall tiles are created correctly
     * Walls should be non-walkable
     */
    it('should create walls as non-walkable', () => {
      const grid = createGrid(testLevel);
      const wallTile = grid.tiles[2][2]; // Center wall from testLevel
      expect(wallTile.type).toBe('wall');
      expect(wallTile.walkable).toBe(false);
    });

    /**
     * Test: Goal tiles are created correctly
     * Goals should be walkable (player must reach them)
     */
    it('should create goal tiles', () => {
      const grid = createGrid(testLevel);
      const goalTile = grid.tiles[4][4]; // Goal from testLevel
      expect(goalTile.type).toBe('goal');
      expect(goalTile.walkable).toBe(true); // Goals are walkable
    });

    /**
     * Test: Each tile has correct position
     * Tile position should match array indices
     */
    it('should set correct position for each tile', () => {
      const grid = createGrid(testLevel);
      // Check a few tiles
      expect(grid.tiles[0][0].position).toEqual({ x: 0, y: 0 });
      expect(grid.tiles[2][3].position).toEqual({ x: 3, y: 2 });
      expect(grid.tiles[4][4].position).toEqual({ x: 4, y: 4 });
    });

    /**
     * Test: Empty tile array (no custom tiles)
     * Should create all-empty grid
     */
    it('should handle level with no tile overrides', () => {
      const minimalLevel: LevelData = {
        ...testLevel,
        tiles: undefined, // No tile overrides
      };
      const grid = createGrid(minimalLevel);

      // All tiles should be empty
      for (let y = 0; y < grid.height; y++) {
        for (let x = 0; x < grid.width; x++) {
          expect(grid.tiles[y][x].type).toBe('empty');
          expect(grid.tiles[y][x].walkable).toBe(true);
        }
      }
    });

    /**
     * Test: Out-of-bounds tile data is ignored
     * Prevents crashes from invalid level data
     */
    it('should ignore out-of-bounds tile data', () => {
      const badLevel: LevelData = {
        ...testLevel,
        tiles: [
          { x: 10, y: 10, type: 'wall' }, // Way out of bounds
          { x: -1, y: 0, type: 'wall' }, // Negative x
        ],
      };

      // Should not throw, just ignore invalid tiles
      expect(() => createGrid(badLevel)).not.toThrow();

      const grid = createGrid(badLevel);
      // Grid should still be valid
      expect(grid.width).toBe(5);
      expect(grid.height).toBe(5);
    });
  });
});

// ============================================================================
// GRID QUERY TESTS
// ============================================================================

describe('Grid Queries', () => {
  let grid: Grid;

  // Create a fresh grid before each test
  beforeEach(() => {
    grid = createGrid(testLevel);
  });

  describe('getTileAt', () => {
    /**
     * Test: Get tile at valid position
     * Should return the tile object
     */
    it('should return tile at valid position', () => {
      const tile = getTileAt(grid, { x: 2, y: 2 });
      expect(tile).not.toBeNull();
      expect(tile?.type).toBe('wall');
      expect(tile?.position).toEqual({ x: 2, y: 2 });
    });

    /**
     * Test: Get tile at corner
     * Corner tiles should be accessible
     */
    it('should return tile at corners', () => {
      const topLeft = getTileAt(grid, { x: 0, y: 0 });
      expect(topLeft).not.toBeNull();
      expect(topLeft?.type).toBe('empty');

      const bottomRight = getTileAt(grid, { x: 4, y: 4 });
      expect(bottomRight).not.toBeNull();
      expect(bottomRight?.type).toBe('goal');
    });

    /**
     * Test: Out of bounds returns null
     * Should never throw, always return null for invalid positions
     */
    it('should return null for out of bounds', () => {
      expect(getTileAt(grid, { x: -1, y: 0 })).toBeNull();
      expect(getTileAt(grid, { x: 5, y: 0 })).toBeNull();
      expect(getTileAt(grid, { x: 0, y: -1 })).toBeNull();
      expect(getTileAt(grid, { x: 0, y: 5 })).toBeNull();
    });
  });

  describe('getNeighbors', () => {
    /**
     * Test: Center tile has 4 neighbors
     * No edges blocking, should have all 4 directions
     */
    it('should return 4 neighbors for center tile', () => {
      const neighbors = getNeighbors(grid, { x: 2, y: 2 });
      expect(neighbors).toHaveLength(4);
    });

    /**
     * Test: Corner tile has 2 neighbors
     * Two edges block neighbors
     */
    it('should return 2 neighbors for corner tile', () => {
      const neighbors = getNeighbors(grid, { x: 0, y: 0 });
      expect(neighbors).toHaveLength(2);
      // Should be right and down
      expect(neighbors).toContainEqual({ x: 1, y: 0 }); // right
      expect(neighbors).toContainEqual({ x: 0, y: 1 }); // down
    });

    /**
     * Test: Edge tile has 3 neighbors
     * One edge blocks one direction
     */
    it('should return 3 neighbors for edge tile', () => {
      const neighbors = getNeighbors(grid, { x: 2, y: 0 }); // Top edge
      expect(neighbors).toHaveLength(3);
      // Should be left, right, down (no up)
    });

    /**
     * Test: All neighbors are in bounds
     * This is a safety check - getNeighbors should never return invalid positions
     */
    it('should only return in-bounds neighbors', () => {
      const neighbors = getNeighbors(grid, { x: 0, y: 0 });
      for (const neighbor of neighbors) {
        expect(isInBounds(neighbor, grid)).toBe(true);
      }
    });
  });

  describe('getWalkableNeighbors', () => {
    /**
     * Test: Filters out walls
     * The wall at (2,2) should be excluded from neighbors
     */
    it('should exclude walls from neighbors', () => {
      const neighbors = getWalkableNeighbors(grid, { x: 2, y: 1 });
      // Position (2,1) is directly above the wall at (2,2)
      // Down neighbor (2,2) is a wall, so should be excluded
      const hasWall = neighbors.some((pos) => positionsEqual(pos, { x: 2, y: 2 }));
      expect(hasWall).toBe(false);
    });

    /**
     * Test: Returns only walkable tiles
     * All returned positions should be walkable
     */
    it('should return only walkable tiles', () => {
      const neighbors = getWalkableNeighbors(grid, { x: 2, y: 2 });
      for (const neighbor of neighbors) {
        const tile = getTileAt(grid, neighbor);
        expect(tile?.walkable).toBe(true);
      }
    });

    /**
     * Test: Empty area returns all 4 neighbors
     * When no walls nearby, should get all neighbors
     */
    it('should return all 4 neighbors when no walls nearby', () => {
      // Position (1,1) has no walls as neighbors
      const neighbors = getWalkableNeighbors(grid, { x: 1, y: 1 });
      expect(neighbors).toHaveLength(4);
    });

    /**
     * Test: Goal tiles are walkable
     * Player must be able to reach goal
     */
    it('should include goal tiles', () => {
      const neighbors = getWalkableNeighbors(grid, { x: 3, y: 4 });
      // One neighbor should be the goal at (4,4)
      const hasGoal = neighbors.some((pos) => positionsEqual(pos, { x: 4, y: 4 }));
      expect(hasGoal).toBe(true);
    });
  });
});

// ============================================================================
// GAMESTATE CREATION TESTS
// ============================================================================

describe('GameState Creation', () => {
  describe('createGameState', () => {
    /**
     * Test: Creates complete game state
     * All required fields should be present
     */
    it('should create complete game state', () => {
      const state = createGameState(testLevel);

      expect(state.levelId).toBe('test');
      expect(state.status).toBe('playing');
      expect(state.turnCount).toBe(0);
      expect(state.grid).toBeDefined();
      expect(state.player).toBeDefined();
      expect(state.goal).toEqual({ x: 4, y: 4 });
      expect(state.energy).toBe(10);
      expect(state.maxEnergy).toBe(10);
    });

    /**
     * Test: Player starts at correct position
     * Player should be at playerStart from level data
     */
    it('should initialize player at start position', () => {
      const state = createGameState(testLevel);
      expect(state.player.position).toEqual({ x: 0, y: 0 });
    });

    /**
     * Test: Player starts with empty inventory
     * No keys collected initially
     */
    it('should initialize player with empty inventory', () => {
      const state = createGameState(testLevel);
      expect(state.player.inventory.keys).toHaveLength(0);
    });

    /**
     * Test: Hazards are initialized
     * All hazards should be active
     */
    it('should initialize hazards from level data', () => {
      const levelWithHazards: LevelData = {
        ...testLevel,
        hazards: [
          { id: 'h1', x: 1, y: 1, type: 'spike' },
          { id: 'h2', x: 2, y: 3, type: 'laser' },
        ],
      };

      const state = createGameState(levelWithHazards);
      expect(state.hazards).toHaveLength(2);
      expect(state.hazards[0].active).toBe(true);
      expect(state.hazards[1].active).toBe(true);
    });

    /**
     * Test: Level with no hazards
     * Should create empty hazards array
     */
    it('should handle level with no hazards', () => {
      const state = createGameState(testLevel);
      expect(state.hazards).toHaveLength(0);
    });

    /**
     * Test: Interactables are initialized
     * Keys should not be collected, doors should be locked
     */
    it('should initialize interactables from level data', () => {
      const levelWithInteractables: LevelData = {
        ...testLevel,
        interactables: [
          { id: 'k1', x: 1, y: 1, type: 'key', color: 'red' },
          { id: 'd1', x: 2, y: 2, type: 'door', color: 'red' },
        ],
      };

      const state = createGameState(levelWithInteractables);
      expect(state.interactables).toHaveLength(2);

      // Check key state
      const key = state.interactables[0];
      expect(key.type).toBe('key');
      if (key.state.type === 'key') {
        expect(key.state.collected).toBe(false);
      }

      // Check door state
      const door = state.interactables[1];
      expect(door.type).toBe('door');
      if (door.state.type === 'door') {
        expect(door.state.locked).toBe(true);
      }
    });

    /**
     * Test: Immutability of level data
     * Creating game state should not modify level data
     */
    it('should not mutate level data', () => {
      const levelCopy = { ...testLevel };
      createGameState(testLevel);
      expect(testLevel).toEqual(levelCopy);
    });
  });
});
