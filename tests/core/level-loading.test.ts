/**
 * Level Loading Test Suite
 *
 * This file tests that actual level files can be loaded and are valid.
 *
 * What we're testing:
 * - Level JSON files are valid
 * - Levels can be converted to GameState
 * - Energy budgets are sufficient
 * - All positions are within bounds
 *
 * Why this matters:
 * - Catches malformed level files early
 * - Ensures levels are playable (enough energy)
 * - Validates level design before runtime
 */

import { describe, it, expect } from 'vitest';
import { createGameState, isInBounds } from '../../src/core/state';
import type { LevelData } from '../../src/core/types';

// Import the actual level file
// Note: In a real setup, we'd use fetch or fs to load this
// For now, we'll inline the level data to test the structure
const firstStepsLevel: LevelData = {
  id: '01_first_steps',
  name: 'First Steps',
  version: '1.0.0',
  width: 5,
  height: 5,
  playerStart: { x: 0, y: 0 },
  goal: { x: 4, y: 4 },
  energy: 12,
  description:
    'Welcome to Signal Path! Use arrow keys or WASD to move. Reach the green goal before your energy runs out.',
};

describe('Level: 01_first_steps', () => {
  /**
   * Test: Level data structure is valid
   * All required fields should be present and have correct types
   */
  it('should have valid structure', () => {
    expect(firstStepsLevel.id).toBe('01_first_steps');
    expect(firstStepsLevel.name).toBe('First Steps');
    expect(firstStepsLevel.version).toBe('1.0.0');
    expect(firstStepsLevel.width).toBe(5);
    expect(firstStepsLevel.height).toBe(5);
    expect(firstStepsLevel.energy).toBe(12);
  });

  /**
   * Test: Player start position is valid
   * Should be within grid bounds
   */
  it('should have valid player start position', () => {
    const state = createGameState(firstStepsLevel);
    expect(isInBounds(firstStepsLevel.playerStart, state.grid)).toBe(true);
    expect(state.player.position).toEqual({ x: 0, y: 0 });
  });

  /**
   * Test: Goal position is valid
   * Should be within grid bounds
   */
  it('should have valid goal position', () => {
    const state = createGameState(firstStepsLevel);
    expect(isInBounds(firstStepsLevel.goal, state.grid)).toBe(true);
    expect(state.goal).toEqual({ x: 4, y: 4 });
  });

  /**
   * Test: Energy budget is sufficient
   *
   * Minimum energy needed = Manhattan distance from start to goal
   * Manhattan distance = |x2 - x1| + |y2 - y1|
   * For this level: |4 - 0| + |4 - 0| = 4 + 4 = 8
   *
   * Energy provided: 12
   * Buffer: 12 - 8 = 4 moves (50% buffer)
   *
   * This gives players room to explore without perfect play.
   */
  it('should have sufficient energy to reach goal', () => {
    const { playerStart, goal, energy } = firstStepsLevel;

    // Calculate Manhattan distance (minimum moves needed)
    const minMoves = Math.abs(goal.x - playerStart.x) + Math.abs(goal.y - playerStart.y);

    // Energy should be >= minimum moves
    expect(energy).toBeGreaterThanOrEqual(minMoves);

    // For this level, we expect a 50% buffer
    const buffer = energy - minMoves;
    expect(buffer).toBeGreaterThanOrEqual(4);
  });

  /**
   * Test: GameState can be created from level
   * Should initialize without errors
   */
  it('should create valid game state', () => {
    const state = createGameState(firstStepsLevel);

    expect(state.levelId).toBe('01_first_steps');
    expect(state.status).toBe('playing');
    expect(state.turnCount).toBe(0);
    expect(state.energy).toBe(12);
    expect(state.maxEnergy).toBe(12);
  });

  /**
   * Test: Grid is created correctly
   * 5x5 grid with all walkable tiles (no obstacles)
   */
  it('should create 5x5 grid with all walkable tiles', () => {
    const state = createGameState(firstStepsLevel);

    expect(state.grid.width).toBe(5);
    expect(state.grid.height).toBe(5);

    // All tiles should be walkable (no obstacles in this level)
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        const tile = state.grid.tiles[y][x];
        expect(tile.walkable).toBe(true);
      }
    }
  });

  /**
   * Test: No hazards or interactables
   * This is a tutorial level, should be simple
   */
  it('should have no hazards or interactables', () => {
    const state = createGameState(firstStepsLevel);

    expect(state.hazards).toHaveLength(0);
    expect(state.interactables).toHaveLength(0);
  });

  /**
   * Test: Player inventory is empty
   * Tutorial level, no items to collect
   */
  it('should start with empty inventory', () => {
    const state = createGameState(firstStepsLevel);

    expect(state.player.inventory.keys).toHaveLength(0);
  });
});

/**
 * Level Design Analysis
 *
 * This test documents the design intent of the first level:
 *
 * Purpose: Tutorial - Teach basic movement
 * Difficulty: Very Easy
 * Mechanics Introduced: Movement, energy, goal
 * Optimal Solution: 8 moves (straight path)
 * Energy Buffer: 4 moves (50%)
 * Expected Playtime: 10-20 seconds
 *
 * Player will learn:
 * - Arrow keys / WASD control player
 * - Goal is the target (green square)
 * - Energy depletes with each move
 * - Reaching goal wins the game
 *
 * No obstacles, no hazards, no complexity.
 * Just: "Move from here to there."
 */
describe('Level Design: 01_first_steps', () => {
  it('should be solvable with optimal play', () => {
    // Optimal path: Right x4, Down x4 = 8 moves
    const optimalMoves = 8;
    const energyProvided = firstStepsLevel.energy;

    expect(energyProvided).toBeGreaterThanOrEqual(optimalMoves);
  });

  it('should allow exploration (50% energy buffer)', () => {
    const minMoves = 8;
    const energy = firstStepsLevel.energy;
    const buffer = energy - minMoves;

    // 50% buffer allows 4 extra moves for mistakes
    expect(buffer).toBe(4);
  });
});
