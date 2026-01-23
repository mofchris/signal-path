/**
 * Type Definitions Test Suite
 *
 * This file tests the core type definitions in src/core/types.ts
 *
 * What we're testing:
 * - Type definitions compile correctly
 * - Constants have expected values
 * - Discriminated unions work as expected
 * - Optional fields behave correctly
 * - Type safety is enforced
 *
 * Why test types:
 * - Verify types match our design intent
 * - Ensure constants (like DIRECTION_VECTORS) are correct
 * - Document expected type behavior through examples
 * - Catch breaking changes if types are modified
 */

import { describe, it, expect } from 'vitest';
import type {
  Position,
  Direction,
  GameState,
  Action,
  LevelData,
  ValidationResult,
} from '../../src/core/types';
import { DIRECTION_VECTORS } from '../../src/core/types';

describe('Type Definitions', () => {
  // ==========================================================================
  // POSITION TESTS
  // ==========================================================================

  describe('Position', () => {
    /**
     * Test: Position interface works as expected
     *
     * Position is the fundamental building block for grid coordinates.
     * It's used everywhere: player position, tile position, goal, etc.
     */
    it('should create valid position objects', () => {
      const pos: Position = { x: 5, y: 10 };
      expect(pos.x).toBe(5);
      expect(pos.y).toBe(10);
    });
  });

  // ==========================================================================
  // DIRECTION TESTS
  // ==========================================================================

  describe('Direction', () => {
    /**
     * Test: All cardinal directions are defined
     *
     * We use only 4 directions (not 8) for simplicity.
     * This is a design decision - see DECISIONS.md ADR-011.
     */
    it('should have all cardinal directions', () => {
      const directions: Direction[] = ['up', 'down', 'left', 'right'];
      expect(directions).toHaveLength(4);
    });

    /**
     * Test: Direction vectors map correctly to position deltas
     *
     * DIRECTION_VECTORS is used to convert a Direction to a position change.
     * For example: moving 'up' changes position by (0, -1)
     *
     * Coordinate system:
     * - Origin (0,0) is top-left
     * - X increases to the right
     * - Y increases downward (standard canvas/screen coordinates)
     *
     * Therefore:
     * - up = y decreases = (0, -1)
     * - down = y increases = (0, +1)
     * - left = x decreases = (-1, 0)
     * - right = x increases = (+1, 0)
     */
    it('should have correct direction vectors', () => {
      expect(DIRECTION_VECTORS.up).toEqual({ x: 0, y: -1 });
      expect(DIRECTION_VECTORS.down).toEqual({ x: 0, y: 1 });
      expect(DIRECTION_VECTORS.left).toEqual({ x: -1, y: 0 });
      expect(DIRECTION_VECTORS.right).toEqual({ x: 1, y: 0 });
    });
  });

  // ==========================================================================
  // ACTION TESTS (Discriminated Union)
  // ==========================================================================

  describe('Action (Discriminated Union)', () => {
    /**
     * Test: Move action with direction parameter
     *
     * Actions use discriminated unions for type safety.
     * TypeScript can narrow the type based on the 'type' field.
     *
     * Only 'move' actions have a 'direction' field.
     */
    it('should create move action', () => {
      const action: Action = { type: 'move', direction: 'up' };
      expect(action.type).toBe('move');

      // TypeScript type narrowing: inside this if, TS knows action.direction exists
      if (action.type === 'move') {
        expect(action.direction).toBe('up');
      }
    });

    /**
     * Test: Wait action (no parameters)
     *
     * Wait consumes energy but doesn't move.
     * Useful when player wants to skip a turn.
     */
    it('should create wait action', () => {
      const action: Action = { type: 'wait' };
      expect(action.type).toBe('wait');
    });

    /**
     * Test: Restart action
     *
     * Resets the current level to initial state.
     * Handled by UI layer, not core game logic.
     */
    it('should create restart action', () => {
      const action: Action = { type: 'restart' };
      expect(action.type).toBe('restart');
    });

    /**
     * Test: Undo action
     *
     * Reverts to previous game state.
     * Requires action history to be tracked (implemented later).
     */
    it('should create undo action', () => {
      const action: Action = { type: 'undo' };
      expect(action.type).toBe('undo');
    });
  });

  // ==========================================================================
  // GAMESTATE TESTS
  // ==========================================================================

  describe('GameState', () => {
    /**
     * Test: GameState can be created with all required fields
     *
     * GameState is the single source of truth for the entire game.
     * This test verifies all required fields are present and typed correctly.
     *
     * Note: We use empty arrays/minimal data here just to test the structure.
     * Real game states will have populated grids, etc.
     */
    it('should allow creation of minimal game state', () => {
      const state: GameState = {
        levelId: 'test',
        status: 'playing',
        turnCount: 0,
        grid: {
          width: 5,
          height: 5,
          tiles: [], // Normally would be 2D array of tiles
        },
        player: {
          position: { x: 0, y: 0 },
          inventory: { keys: [] },
        },
        hazards: [],
        interactables: [],
        goal: { x: 4, y: 4 },
        energy: 10,
        maxEnergy: 10,
      };

      expect(state.status).toBe('playing');
      expect(state.energy).toBe(10);
    });
  });

  // ==========================================================================
  // LEVELDATA TESTS
  // ==========================================================================

  describe('LevelData', () => {
    /**
     * Test: LevelData with all fields
     *
     * LevelData represents the JSON format for external level files.
     * It gets converted to GameState by createGameState().
     */
    it('should allow creation of level data', () => {
      const level: LevelData = {
        id: 'test-level',
        name: 'Test Level',
        version: '1.0.0',
        width: 5,
        height: 5,
        playerStart: { x: 0, y: 0 },
        goal: { x: 4, y: 4 },
        energy: 15,
        description: 'A test level',
      };

      expect(level.id).toBe('test-level');
      expect(level.width).toBe(5);
    });

    /**
     * Test: Optional fields in LevelData
     *
     * tiles, hazards, and interactables are optional.
     * If omitted, defaults will be used:
     * - tiles: all empty (walkable)
     * - hazards: none
     * - interactables: none
     */
    it('should allow optional fields', () => {
      const level: LevelData = {
        id: 'minimal',
        name: 'Minimal',
        version: '1.0.0',
        width: 3,
        height: 3,
        playerStart: { x: 0, y: 0 },
        goal: { x: 2, y: 2 },
        energy: 5,
        // No tiles, hazards, or interactables specified
      };

      expect(level.tiles).toBeUndefined();
      expect(level.hazards).toBeUndefined();
    });
  });

  // ==========================================================================
  // VALIDATIONRESULT TESTS
  // ==========================================================================

  describe('ValidationResult', () => {
    /**
     * Test: Valid result (no reason needed)
     *
     * When validation passes, only valid=true is required.
     * The reason field is omitted.
     */
    it('should create valid result', () => {
      const result: ValidationResult = { valid: true };
      expect(result.valid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    /**
     * Test: Invalid result with error reason
     *
     * When validation fails, reason explains why.
     * This helps debugging and provides user feedback.
     */
    it('should create invalid result with reason', () => {
      const result: ValidationResult = {
        valid: false,
        reason: 'Test error',
      };
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Test error');
    });
  });

  // ==========================================================================
  // TYPE SAFETY TESTS
  // ==========================================================================

  describe('Type Safety', () => {
    /**
     * Test: GameStatus enum is enforced
     *
     * TypeScript should only allow 'playing' | 'won' | 'lost'
     * This test documents the expected values.
     */
    it('should enforce status enum', () => {
      const validStatuses: Array<GameState['status']> = [
        'playing',
        'won',
        'lost',
      ];
      expect(validStatuses).toHaveLength(3);
    });

    /**
     * Test: TileType enum is enforced
     *
     * TypeScript should only allow 'empty' | 'wall' | 'goal'
     * Other tile types will be added later (Phase 2).
     */
    it('should enforce tile type enum', () => {
      const validTileTypes: Array<'empty' | 'wall' | 'goal'> = [
        'empty',
        'wall',
        'goal',
      ];
      expect(validTileTypes).toHaveLength(3);
    });
  });
});
