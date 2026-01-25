/**
 * Action System Test Suite
 *
 * This file tests all functions in src/core/actions.ts:
 * - Action validation (validateAction)
 * - Action application (applyAction)
 * - Action queries (getValidActions, getValidMoveCount)
 *
 * Testing strategy:
 * - Test each action type (move, wait, undo, restart)
 * - Test valid and invalid cases
 * - Test immutability (original state unchanged)
 * - Test edge cases (bounds, energy, obstacles)
 * - Achieve > 90% coverage
 *
 * Why these tests matter:
 * - Actions are how players interact with the game
 * - Validation bugs allow impossible moves
 * - Application bugs corrupt game state
 * - Immutability violations break undo/replay
 */

import { describe, it, expect } from 'vitest';
import {
  validateAction,
  applyAction,
  getValidActions,
  getValidMoveCount,
} from '../../src/core/actions';
import { createGameState } from '../../src/core/state';
import type { LevelData, Action } from '../../src/core/types';

// ============================================================================
// TEST DATA
// ============================================================================

/**
 * Basic test level for action testing
 * 3x3 grid with wall at center
 */
const testLevel: LevelData = {
  id: 'test',
  name: 'Test',
  version: '1.0.0',
  width: 3,
  height: 3,
  playerStart: { x: 0, y: 0 },
  goal: { x: 2, y: 2 },
  energy: 10,
  tiles: [
    { x: 1, y: 1, type: 'wall' }, // Center wall
  ],
};

// ============================================================================
// VALIDATION TESTS
// ============================================================================

describe('Action Validation', () => {
  describe('validateAction - move', () => {
    /**
     * Test: Valid move in open space
     * Player at (0,0) can move right or down
     */
    it('should validate legal move', () => {
      const state = createGameState(testLevel);
      const action: Action = { type: 'move', direction: 'right' };
      const result = validateAction(state, action);

      expect(result.valid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    /**
     * Test: Move into wall
     * Player at (0,1) cannot move right to (1,1) which is a wall
     */
    it('should reject move into wall', () => {
      const state = createGameState(testLevel);
      // Move player to (0,1) - next to wall
      const movedState = { ...state, player: { ...state.player, position: { x: 0, y: 1 } } };

      const action: Action = { type: 'move', direction: 'right' };
      const result = validateAction(movedState, action);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Target tile is not walkable');
    });

    /**
     * Test: Move out of bounds
     * Player at (0,0) cannot move left (off grid)
     */
    it('should reject move out of bounds', () => {
      const state = createGameState(testLevel);
      const action: Action = { type: 'move', direction: 'left' };
      const result = validateAction(state, action);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Move out of bounds');
    });

    /**
     * Test: Move with no energy
     * Cannot move when energy = 0
     */
    it('should reject move with no energy', () => {
      const state = createGameState(testLevel);
      const noEnergyState = { ...state, energy: 0 };

      const action: Action = { type: 'move', direction: 'right' };
      const result = validateAction(noEnergyState, action);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('No energy remaining');
    });

    /**
     * Test: All four directions
     * Verify direction vectors work correctly
     */
    it('should validate all four directions correctly', () => {
      const state = createGameState(testLevel);
      // Test a position where we can check multiple directions
      const openState = { ...state, player: { ...state.player, position: { x: 2, y: 0 } } };

      expect(validateAction(openState, { type: 'move', direction: 'down' }).valid).toBe(true);
      expect(validateAction(openState, { type: 'move', direction: 'left' }).valid).toBe(true);
      // Right would be out of bounds (x=3)
      expect(validateAction(openState, { type: 'move', direction: 'right' }).valid).toBe(false);
      // Up would be out of bounds (y=-1)
      expect(validateAction(openState, { type: 'move', direction: 'up' }).valid).toBe(false);
    });
  });

  describe('validateAction - wait', () => {
    /**
     * Test: Wait with energy
     * Should be valid when energy > 0
     */
    it('should validate wait with energy', () => {
      const state = createGameState(testLevel);
      const action: Action = { type: 'wait' };
      const result = validateAction(state, action);

      expect(result.valid).toBe(true);
    });

    /**
     * Test: Wait without energy
     * Should be invalid when energy = 0
     */
    it('should reject wait without energy', () => {
      const state = createGameState(testLevel);
      const noEnergyState = { ...state, energy: 0 };

      const action: Action = { type: 'wait' };
      const result = validateAction(noEnergyState, action);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('No energy remaining');
    });
  });

  describe('validateAction - restart', () => {
    /**
     * Test: Restart in playing state
     * Restart is valid when game is in progress
     */
    it('should validate restart in playing state', () => {
      const state = createGameState(testLevel);
      const action: Action = { type: 'restart' };

      expect(validateAction(state, action).valid).toBe(true);

      // Even with no energy (still in playing state)
      const noEnergyState = { ...state, energy: 0 };
      expect(validateAction(noEnergyState, action).valid).toBe(true);
    });
  });

  describe('validateAction - game status', () => {
    /**
     * Test: No actions allowed when won
     * Game is over, should reject all actions
     */
    it('should reject all actions when game is won', () => {
      const state = createGameState(testLevel);
      const wonState = { ...state, status: 'won' as const };

      expect(validateAction(wonState, { type: 'move', direction: 'right' }).valid).toBe(false);
      expect(validateAction(wonState, { type: 'wait' }).valid).toBe(false);
      // Restart might be special - let me check the code
      // It also fails because of the status check at the top
      expect(validateAction(wonState, { type: 'restart' }).valid).toBe(false);
    });

    /**
     * Test: No actions allowed when lost
     * Game is over, should reject all actions
     */
    it('should reject all actions when game is lost', () => {
      const state = createGameState(testLevel);
      const lostState = { ...state, status: 'lost' as const };

      expect(validateAction(lostState, { type: 'move', direction: 'right' }).valid).toBe(false);
      expect(validateAction(lostState, { type: 'wait' }).valid).toBe(false);
    });
  });

  describe('validateAction - undo', () => {
    /**
     * Test: Undo without history
     * Should be invalid when no action history exists
     */
    it('should reject undo without history', () => {
      const state = createGameState(testLevel);
      const action: Action = { type: 'undo' };
      const result = validateAction(state, action);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('No actions to undo');
    });

    /**
     * Test: Undo with empty history
     * Should be invalid when history array is empty
     */
    it('should reject undo with empty stateHistory', () => {
      const state = createGameState(testLevel);
      const stateWithHistory = { ...state, stateHistory: [] };

      const action: Action = { type: 'undo' };
      const result = validateAction(stateWithHistory, action);

      expect(result.valid).toBe(false);
    });

    /**
     * Test: Undo is valid after a move
     * Should be valid when stateHistory has entries
     */
    it('should validate undo after a move', () => {
      const state = createGameState(testLevel);
      // Make a move to create history
      const movedState = applyAction(state, { type: 'move', direction: 'right' });

      const action: Action = { type: 'undo' };
      const result = validateAction(movedState, action);

      expect(result.valid).toBe(true);
    });

    /**
     * Test: Undo is valid after wait
     * Should be valid when stateHistory has entries from wait
     */
    it('should validate undo after a wait', () => {
      const state = createGameState(testLevel);
      // Make a wait to create history
      const waitedState = applyAction(state, { type: 'wait' });

      const action: Action = { type: 'undo' };
      const result = validateAction(waitedState, action);

      expect(result.valid).toBe(true);
    });
  });
});

// ============================================================================
// APPLICATION TESTS
// ============================================================================

describe('Action Application', () => {
  describe('applyAction - move', () => {
    /**
     * Test: Move updates position
     * Player position should change by direction vector
     */
    it('should update player position', () => {
      const state = createGameState(testLevel);
      const action: Action = { type: 'move', direction: 'right' };
      const newState = applyAction(state, action);

      expect(newState.player.position).toEqual({ x: 1, y: 0 });
    });

    /**
     * Test: Move deducts energy
     * Energy should decrease by 1
     */
    it('should deduct energy', () => {
      const state = createGameState(testLevel);
      const action: Action = { type: 'move', direction: 'right' };
      const newState = applyAction(state, action);

      expect(newState.energy).toBe(state.energy - 1);
    });

    /**
     * Test: Move increments turn count
     * Turn counter should increase by 1
     */
    it('should increment turn count', () => {
      const state = createGameState(testLevel);
      const action: Action = { type: 'move', direction: 'right' };
      const newState = applyAction(state, action);

      expect(newState.turnCount).toBe(1);
    });

    /**
     * Test: Invalid move returns original state
     * Should not modify state if validation fails
     */
    it('should return original state for invalid move', () => {
      const state = createGameState(testLevel);
      const action: Action = { type: 'move', direction: 'left' }; // Out of bounds

      const newState = applyAction(state, action);

      expect(newState).toBe(state); // Same reference = unchanged
    });

    /**
     * Test: All four directions work
     * Verify each direction vector is applied correctly
     */
    it('should apply all four directions correctly', () => {
      const state = createGameState(testLevel);
      // Use position (2,1) which has valid up/down moves
      const testState = { ...state, player: { ...state.player, position: { x: 2, y: 1 } } };

      // Move up: (2,1) -> (2,0)
      const upState = applyAction(testState, { type: 'move', direction: 'up' });
      expect(upState.player.position).toEqual({ x: 2, y: 0 });

      // Move down: (2,1) -> (2,2)
      const downState = applyAction(testState, { type: 'move', direction: 'down' });
      expect(downState.player.position).toEqual({ x: 2, y: 2 });

      // Move left: (2,1) -> (1,1) which is a wall, so should fail
      const leftState = applyAction(testState, { type: 'move', direction: 'left' });
      expect(leftState.player.position).toEqual({ x: 2, y: 1 }); // Unchanged

      // Move right: (2,1) -> (3,1) out of bounds, should fail
      const rightState = applyAction(testState, { type: 'move', direction: 'right' });
      expect(rightState.player.position).toEqual({ x: 2, y: 1 }); // Unchanged
    });
  });

  describe('applyAction - wait', () => {
    /**
     * Test: Wait deducts energy
     * Energy should decrease by 1
     */
    it('should deduct energy', () => {
      const state = createGameState(testLevel);
      const action: Action = { type: 'wait' };
      const newState = applyAction(state, action);

      expect(newState.energy).toBe(state.energy - 1);
    });

    /**
     * Test: Wait increments turn count
     * Turn counter should increase by 1
     */
    it('should increment turn count', () => {
      const state = createGameState(testLevel);
      const action: Action = { type: 'wait' };
      const newState = applyAction(state, action);

      expect(newState.turnCount).toBe(1);
    });

    /**
     * Test: Wait does not change position
     * Player should stay in same location
     */
    it('should not change player position', () => {
      const state = createGameState(testLevel);
      const action: Action = { type: 'wait' };
      const newState = applyAction(state, action);

      expect(newState.player.position).toEqual(state.player.position);
    });
  });

  describe('applyAction - restart', () => {
    /**
     * Test: Restart returns original state
     * Restart is handled by UI, core returns state unchanged
     */
    it('should return original state', () => {
      const state = createGameState(testLevel);
      const action: Action = { type: 'restart' };
      const newState = applyAction(state, action);

      // Restart is handled by UI (reloads level), so core just returns state
      expect(newState).toBe(state);
    });
  });

  describe('applyAction - undo', () => {
    /**
     * Test: Undo restores previous position
     * Player should return to position before last move
     */
    it('should restore previous position', () => {
      const state = createGameState(testLevel);
      const originalPosition = { ...state.player.position };

      // Make a move
      const movedState = applyAction(state, { type: 'move', direction: 'right' });
      expect(movedState.player.position).not.toEqual(originalPosition);

      // Undo the move
      const undoneState = applyAction(movedState, { type: 'undo' });
      expect(undoneState.player.position).toEqual(originalPosition);
    });

    /**
     * Test: Undo restores previous energy
     * Energy should return to value before last action
     */
    it('should restore previous energy', () => {
      const state = createGameState(testLevel);
      const originalEnergy = state.energy;

      // Make a move (costs energy)
      const movedState = applyAction(state, { type: 'move', direction: 'right' });
      expect(movedState.energy).toBe(originalEnergy - 1);

      // Undo the move
      const undoneState = applyAction(movedState, { type: 'undo' });
      expect(undoneState.energy).toBe(originalEnergy);
    });

    /**
     * Test: Undo restores previous turn count
     * Turn count should return to value before last action
     */
    it('should restore previous turn count', () => {
      const state = createGameState(testLevel);
      expect(state.turnCount).toBe(0);

      // Make a move
      const movedState = applyAction(state, { type: 'move', direction: 'right' });
      expect(movedState.turnCount).toBe(1);

      // Undo the move
      const undoneState = applyAction(movedState, { type: 'undo' });
      expect(undoneState.turnCount).toBe(0);
    });

    /**
     * Test: Multiple undos work correctly
     * Should be able to undo multiple actions in sequence
     */
    it('should handle multiple undos', () => {
      const state = createGameState(testLevel);

      // Make two moves (right then right again to avoid wall at 1,1)
      const state1 = applyAction(state, { type: 'move', direction: 'right' });
      const state2 = applyAction(state1, { type: 'move', direction: 'right' });

      expect(state2.player.position).toEqual({ x: 2, y: 0 });
      expect(state2.turnCount).toBe(2);

      // Undo first time - should go back to after first move
      const undo1 = applyAction(state2, { type: 'undo' });
      expect(undo1.player.position).toEqual({ x: 1, y: 0 });
      expect(undo1.turnCount).toBe(1);

      // Undo second time - should go back to start
      const undo2 = applyAction(undo1, { type: 'undo' });
      expect(undo2.player.position).toEqual({ x: 0, y: 0 });
      expect(undo2.turnCount).toBe(0);
    });

    /**
     * Test: Cannot undo past start
     * Should return original state if no more history
     */
    it('should not undo past game start', () => {
      const state = createGameState(testLevel);

      // Make one move
      const movedState = applyAction(state, { type: 'move', direction: 'right' });

      // Undo the move
      const undoneState = applyAction(movedState, { type: 'undo' });

      // Try to undo again - should be invalid and return same state
      const action: Action = { type: 'undo' };
      expect(validateAction(undoneState, action).valid).toBe(false);

      const tryUndoAgain = applyAction(undoneState, action);
      expect(tryUndoAgain).toBe(undoneState);
    });

    /**
     * Test: Undo restores inventory after key collection
     * Key should be removed from inventory and marked uncollected
     */
    it('should restore inventory after key collection', () => {
      const levelWithKey: LevelData = {
        ...testLevel,
        interactables: [{ id: 'key1', x: 1, y: 0, type: 'key', color: 'red' }],
      };

      const state = createGameState(levelWithKey);
      expect(state.player.inventory.keys).toHaveLength(0);

      // Move to collect key
      const collectedState = applyAction(state, { type: 'move', direction: 'right' });
      expect(collectedState.player.inventory.keys).toHaveLength(1);

      // Undo - key should be back
      const undoneState = applyAction(collectedState, { type: 'undo' });
      expect(undoneState.player.inventory.keys).toHaveLength(0);

      // Key should no longer be marked as collected
      const key = undoneState.interactables.find((i) => i.id === 'key1');
      expect(key?.state.type).toBe('key');
      if (key?.state.type === 'key') {
        expect(key.state.collected).toBe(false);
      }
    });

    /**
     * Test: State history grows with each action
     * History should contain snapshots of previous states
     */
    it('should build state history with each action', () => {
      const state = createGameState(testLevel);
      expect(state.stateHistory).toHaveLength(0);

      const state1 = applyAction(state, { type: 'move', direction: 'right' });
      expect(state1.stateHistory).toHaveLength(1);

      // Move right again (not down which would hit wall at 1,1)
      const state2 = applyAction(state1, { type: 'move', direction: 'right' });
      expect(state2.stateHistory).toHaveLength(2);

      const state3 = applyAction(state2, { type: 'wait' });
      expect(state3.stateHistory).toHaveLength(3);
    });

    /**
     * Test: Undo returns original state unchanged
     * Should not create new properties or mutate
     */
    it('should return original state without undo action history', () => {
      const state = createGameState(testLevel);

      // Make a move
      const movedState = applyAction(state, { type: 'move', direction: 'right' });

      // Undo the move
      const undoneState = applyAction(movedState, { type: 'undo' });

      // The undone state should be structurally equal to original
      expect(undoneState.player.position).toEqual(state.player.position);
      expect(undoneState.energy).toBe(state.energy);
      expect(undoneState.turnCount).toBe(state.turnCount);
    });
  });

  describe('applyAction - immutability', () => {
    /**
     * Test: Original state is not modified
     * Applying action should create new state, not mutate old
     */
    it('should not mutate original state', () => {
      const state = createGameState(testLevel);
      const originalPos = { ...state.player.position };
      const originalEnergy = state.energy;
      const originalTurns = state.turnCount;

      const action: Action = { type: 'move', direction: 'right' };
      applyAction(state, action);

      // Original state should be unchanged
      expect(state.player.position).toEqual(originalPos);
      expect(state.energy).toBe(originalEnergy);
      expect(state.turnCount).toBe(originalTurns);
    });

    /**
     * Test: New state is different object
     * Should create new object, not same reference
     */
    it('should create new state object', () => {
      const state = createGameState(testLevel);
      const action: Action = { type: 'move', direction: 'right' };
      const newState = applyAction(state, action);

      expect(newState).not.toBe(state);
      expect(newState.player).not.toBe(state.player);
    });
  });

  describe('applyAction - key collection (Phase 2)', () => {
    /**
     * Test: Moving onto key collects it
     * Key should be marked as collected and added to inventory
     */
    it('should collect key when moving onto it', () => {
      const levelWithKey: LevelData = {
        ...testLevel,
        interactables: [{ id: 'key1', x: 1, y: 0, type: 'key', color: 'red' }],
      };

      const state = createGameState(levelWithKey);
      const action: Action = { type: 'move', direction: 'right' }; // Move to (1,0) where key is

      const newState = applyAction(state, action);

      // Key should be collected
      const key = newState.interactables.find((i) => i.id === 'key1');
      expect(key?.state.type).toBe('key');
      if (key?.state.type === 'key') {
        expect(key.state.collected).toBe(true);
      }

      // Key should be in inventory
      expect(newState.player.inventory.keys).toHaveLength(1);
      expect(newState.player.inventory.keys[0].color).toBe('red');
    });
  });

  describe('applyAction - door unlocking (Phase 2)', () => {
    /**
     * Test: Moving onto locked door with key unlocks it
     * Door should be unlocked if player has matching key
     */
    it('should unlock door when player has matching key', () => {
      const levelWithDoor: LevelData = {
        ...testLevel,
        interactables: [
          { id: 'key1', x: 1, y: 0, type: 'key', color: 'red' },
          { id: 'door1', x: 2, y: 0, type: 'door', color: 'red' },
        ],
      };

      const state = createGameState(levelWithDoor);

      // First, collect the key
      let newState = applyAction(state, { type: 'move', direction: 'right' }); // Move to (1,0), collect key

      // Now move to door
      newState = applyAction(newState, { type: 'move', direction: 'right' }); // Move to (2,0), unlock door

      // Door should be unlocked
      const door = newState.interactables.find((i) => i.id === 'door1');
      expect(door?.state.type).toBe('door');
      if (door?.state.type === 'door') {
        expect(door.state.locked).toBe(false);
      }
    });

    /**
     * Test: Cannot move onto locked door without key
     * Move should be blocked if door is locked and no key
     */
    it('should block movement onto locked door without key', () => {
      const levelWithDoor: LevelData = {
        ...testLevel,
        interactables: [{ id: 'door1', x: 1, y: 0, type: 'door', color: 'red' }],
      };

      const state = createGameState(levelWithDoor);
      const action: Action = { type: 'move', direction: 'right' }; // Try to move to locked door

      const result = validateAction(state, action);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Door is locked');
    });
  });
});

// ============================================================================
// ACTION QUERY TESTS
// ============================================================================

describe('Action Queries', () => {
  describe('getValidActions', () => {
    /**
     * Test: Returns all valid actions
     * Should include all moves that pass validation
     */
    it('should return all valid move directions', () => {
      const state = createGameState(testLevel);
      const validActions = getValidActions(state);

      // Player at (0,0) can move right and down
      const moves = validActions.filter((a) => a.type === 'move');
      expect(moves).toHaveLength(2);

      const directions = moves.map((m) => (m.type === 'move' ? m.direction : null));
      expect(directions).toContain('right');
      expect(directions).toContain('down');
    });

    /**
     * Test: Includes wait if valid
     * Wait should be in list when energy > 0
     */
    it('should include wait action when valid', () => {
      const state = createGameState(testLevel);
      const validActions = getValidActions(state);

      const hasWait = validActions.some((a) => a.type === 'wait');
      expect(hasWait).toBe(true);
    });

    /**
     * Test: Excludes wait when no energy
     * Wait should not be in list when energy = 0
     */
    it('should exclude wait when no energy', () => {
      const state = createGameState(testLevel);
      const noEnergyState = { ...state, energy: 0 };
      const validActions = getValidActions(noEnergyState);

      const hasWait = validActions.some((a) => a.type === 'wait');
      expect(hasWait).toBe(false);
    });

    /**
     * Test: Corner position has 2 moves
     * Top-left corner can only move right and down
     */
    it('should return 2 moves for corner position', () => {
      const state = createGameState(testLevel); // Player at (0,0)
      const moves = getValidActions(state).filter((a) => a.type === 'move');

      expect(moves).toHaveLength(2);
    });

    /**
     * Test: Surrounded by walls has 0 moves
     * Player boxed in cannot move
     */
    it('should return 0 moves when surrounded', () => {
      const boxedLevel: LevelData = {
        ...testLevel,
        width: 3,
        height: 3,
        playerStart: { x: 1, y: 1 },
        tiles: [
          { x: 0, y: 1, type: 'wall' },
          { x: 2, y: 1, type: 'wall' },
          { x: 1, y: 0, type: 'wall' },
          { x: 1, y: 2, type: 'wall' },
        ],
      };

      const state = createGameState(boxedLevel);
      const moves = getValidActions(state).filter((a) => a.type === 'move');

      expect(moves).toHaveLength(0);
    });
  });

  describe('getValidMoveCount', () => {
    /**
     * Test: Counts valid moves correctly
     * Should return number of valid move actions
     */
    it('should return correct count of valid moves', () => {
      const state = createGameState(testLevel);
      const count = getValidMoveCount(state);

      expect(count).toBe(2); // Right and down from (0,0)
    });

    /**
     * Test: Returns 0 when no moves available
     * Boxed-in player should have 0 valid moves
     */
    it('should return 0 when no moves available', () => {
      const state = createGameState(testLevel);
      const noEnergyState = { ...state, energy: 0 };
      const count = getValidMoveCount(noEnergyState);

      expect(count).toBe(0);
    });
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Action Integration', () => {
  /**
   * Test: Sequence of moves
   * Apply multiple actions in sequence
   */
  it('should handle sequence of moves', () => {
    const state = createGameState(testLevel);

    // Move right: (0,0) -> (1,0)
    let newState = applyAction(state, { type: 'move', direction: 'right' });
    expect(newState.player.position).toEqual({ x: 1, y: 0 });
    expect(newState.turnCount).toBe(1);
    expect(newState.energy).toBe(9);

    // Move right: (1,0) -> (2,0)
    newState = applyAction(newState, { type: 'move', direction: 'right' });
    expect(newState.player.position).toEqual({ x: 2, y: 0 });
    expect(newState.turnCount).toBe(2);
    expect(newState.energy).toBe(8);

    // Move down: (2,0) -> (2,1)
    newState = applyAction(newState, { type: 'move', direction: 'down' });
    expect(newState.player.position).toEqual({ x: 2, y: 1 });
    expect(newState.turnCount).toBe(3);
    expect(newState.energy).toBe(7);
  });

  /**
   * Test: Mixed action sequence
   * Combine moves and waits
   */
  it('should handle mixed action sequence', () => {
    const state = createGameState(testLevel);

    // Move right: (0,0) -> (1,0)
    let newState = applyAction(state, { type: 'move', direction: 'right' });
    // Wait at (1,0)
    newState = applyAction(newState, { type: 'wait' });
    // Try to move down: (1,0) -> (1,1) but (1,1) has a wall, so stays at (1,0)
    // Instead, let's move right again: (1,0) -> (2,0)
    newState = applyAction(newState, { type: 'move', direction: 'right' });

    expect(newState.player.position).toEqual({ x: 2, y: 0 });
    expect(newState.turnCount).toBe(3);
    expect(newState.energy).toBe(7);
  });
});
