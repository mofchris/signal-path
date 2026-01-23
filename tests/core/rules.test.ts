/**
 * Game Rules Test Suite
 *
 * This file tests all functions in src/core/rules.ts:
 * - Win condition checking (checkWinCondition)
 * - Lose condition checking (checkLoseCondition)
 * - Hazard resolution (resolveHazards)
 * - Turn resolution (resolveTurn)
 * - Game state queries (isGameOver, isGamePlaying)
 *
 * Testing strategy:
 * - Test each win/lose condition independently
 * - Test priority (hazard vs goal, hazard vs energy)
 * - Test edge cases (0 energy on goal, multiple hazards)
 * - Verify immutability
 * - Achieve > 90% coverage
 */

import { describe, it, expect } from 'vitest';
import {
  checkWinCondition,
  checkLoseCondition,
  isPlayerOnHazard,
  isEnergyDepleted,
  resolveHazards,
  updateGameStatus,
  resolveTurn,
  processFullTurn,
  isGameOver,
  isGamePlaying,
  getGameStatusMessage,
} from '../../src/core/rules';
import { createGameState } from '../../src/core/state';
import { applyAction } from '../../src/core/actions';
import type { LevelData, GameState } from '../../src/core/types';

// ============================================================================
// TEST DATA
// ============================================================================

/**
 * Basic test level - 3x3 grid, no hazards
 */
const basicLevel: LevelData = {
  id: 'test-basic',
  name: 'Basic Test',
  version: '1.0.0',
  width: 3,
  height: 3,
  playerStart: { x: 0, y: 0 },
  goal: { x: 2, y: 2 },
  energy: 10,
};

/**
 * Level with hazards for testing lose conditions
 */
const hazardLevel: LevelData = {
  id: 'test-hazard',
  name: 'Hazard Test',
  version: '1.0.0',
  width: 3,
  height: 3,
  playerStart: { x: 0, y: 0 },
  goal: { x: 2, y: 2 },
  energy: 10,
  hazards: [
    { id: 'spike1', x: 1, y: 0, type: 'spike' },
    { id: 'spike2', x: 1, y: 1, type: 'spike' },
  ],
};

/**
 * Helper to create a state with player at specific position
 */
function createStateWithPlayer(
  level: LevelData,
  position: { x: number; y: number },
  overrides: Partial<GameState> = {}
): GameState {
  const state = createGameState(level);
  return {
    ...state,
    player: {
      ...state.player,
      position,
    },
    ...overrides,
  };
}

// ============================================================================
// WIN CONDITION TESTS
// ============================================================================

describe('Win Condition', () => {
  describe('checkWinCondition', () => {
    it('should return true when player is on goal', () => {
      const state = createStateWithPlayer(basicLevel, { x: 2, y: 2 });
      expect(checkWinCondition(state)).toBe(true);
    });

    it('should return false when player is not on goal', () => {
      const state = createStateWithPlayer(basicLevel, { x: 0, y: 0 });
      expect(checkWinCondition(state)).toBe(false);
    });

    it('should return false when game is already lost', () => {
      const state = createStateWithPlayer(basicLevel, { x: 2, y: 2 }, {
        status: 'lost',
      });
      expect(checkWinCondition(state)).toBe(false);
    });

    it('should return false when game is already won', () => {
      const state = createStateWithPlayer(basicLevel, { x: 2, y: 2 }, {
        status: 'won',
      });
      expect(checkWinCondition(state)).toBe(false);
    });

    it('should return true with 0 energy if on goal', () => {
      const state = createStateWithPlayer(basicLevel, { x: 2, y: 2 }, {
        energy: 0,
      });
      expect(checkWinCondition(state)).toBe(true);
    });
  });
});

// ============================================================================
// LOSE CONDITION TESTS
// ============================================================================

describe('Lose Conditions', () => {
  describe('checkLoseCondition', () => {
    it('should return lost=false when playing normally', () => {
      const state = createGameState(basicLevel);
      const result = checkLoseCondition(state);
      expect(result.lost).toBe(false);
      expect(result.reason).toBeUndefined();
    });

    it('should return lost=true with reason hazard when on active hazard', () => {
      // Put player on hazard position
      const state = createStateWithPlayer(hazardLevel, { x: 1, y: 0 });
      const result = checkLoseCondition(state);
      expect(result.lost).toBe(true);
      expect(result.reason).toBe('hazard');
    });

    it('should return lost=true with reason energy_depleted when energy is 0', () => {
      const state = createStateWithPlayer(basicLevel, { x: 0, y: 0 }, {
        energy: 0,
      });
      const result = checkLoseCondition(state);
      expect(result.lost).toBe(true);
      expect(result.reason).toBe('energy_depleted');
    });

    it('should return lost=false when energy is 0 but on goal', () => {
      // Edge case: 0 energy on goal = win, not lose
      const state = createStateWithPlayer(basicLevel, { x: 2, y: 2 }, {
        energy: 0,
      });
      const result = checkLoseCondition(state);
      expect(result.lost).toBe(false);
    });

    it('should return lost=false when game is already won', () => {
      const state = createStateWithPlayer(basicLevel, { x: 0, y: 0 }, {
        status: 'won',
      });
      const result = checkLoseCondition(state);
      expect(result.lost).toBe(false);
    });

    it('should return lost=false when game is already lost', () => {
      const state = createStateWithPlayer(basicLevel, { x: 0, y: 0 }, {
        status: 'lost',
      });
      const result = checkLoseCondition(state);
      expect(result.lost).toBe(false);
    });

    it('should prioritize hazard over energy depletion', () => {
      // Player on hazard with 0 energy - should report hazard
      const state = createStateWithPlayer(hazardLevel, { x: 1, y: 0 }, {
        energy: 0,
      });
      const result = checkLoseCondition(state);
      expect(result.lost).toBe(true);
      expect(result.reason).toBe('hazard');
    });
  });

  describe('isPlayerOnHazard', () => {
    it('should return true when player is on active hazard', () => {
      const state = createStateWithPlayer(hazardLevel, { x: 1, y: 0 });
      expect(isPlayerOnHazard(state)).toBe(true);
    });

    it('should return false when player is not on hazard', () => {
      const state = createStateWithPlayer(hazardLevel, { x: 0, y: 0 });
      expect(isPlayerOnHazard(state)).toBe(false);
    });

    it('should return false when hazard is inactive', () => {
      const state = createStateWithPlayer(hazardLevel, { x: 1, y: 0 });
      // Deactivate the hazard
      const stateWithInactiveHazard = {
        ...state,
        hazards: state.hazards.map((h) =>
          h.id === 'spike1' ? { ...h, active: false } : h
        ),
      };
      expect(isPlayerOnHazard(stateWithInactiveHazard)).toBe(false);
    });

    it('should return false when no hazards exist', () => {
      const state = createGameState(basicLevel);
      expect(isPlayerOnHazard(state)).toBe(false);
    });
  });

  describe('isEnergyDepleted', () => {
    it('should return true when energy is 0', () => {
      const state = createStateWithPlayer(basicLevel, { x: 0, y: 0 }, {
        energy: 0,
      });
      expect(isEnergyDepleted(state)).toBe(true);
    });

    it('should return true when energy is negative', () => {
      const state = createStateWithPlayer(basicLevel, { x: 0, y: 0 }, {
        energy: -1,
      });
      expect(isEnergyDepleted(state)).toBe(true);
    });

    it('should return false when energy is positive', () => {
      const state = createGameState(basicLevel);
      expect(isEnergyDepleted(state)).toBe(false);
    });

    it('should return false when energy is 1', () => {
      const state = createStateWithPlayer(basicLevel, { x: 0, y: 0 }, {
        energy: 1,
      });
      expect(isEnergyDepleted(state)).toBe(false);
    });
  });
});

// ============================================================================
// HAZARD RESOLUTION TESTS
// ============================================================================

describe('Hazard Resolution', () => {
  describe('resolveHazards', () => {
    it('should set status to lost when player is on hazard', () => {
      const state = createStateWithPlayer(hazardLevel, { x: 1, y: 0 });
      const result = resolveHazards(state);
      expect(result.status).toBe('lost');
    });

    it('should not change state when player is not on hazard', () => {
      const state = createStateWithPlayer(hazardLevel, { x: 0, y: 0 });
      const result = resolveHazards(state);
      expect(result.status).toBe('playing');
    });

    it('should return same state if already won', () => {
      const state = createStateWithPlayer(hazardLevel, { x: 1, y: 0 }, {
        status: 'won',
      });
      const result = resolveHazards(state);
      expect(result.status).toBe('won');
    });

    it('should return same state if already lost', () => {
      const state = createStateWithPlayer(hazardLevel, { x: 0, y: 0 }, {
        status: 'lost',
      });
      const result = resolveHazards(state);
      expect(result.status).toBe('lost');
    });

    it('should not mutate original state', () => {
      const state = createStateWithPlayer(hazardLevel, { x: 1, y: 0 });
      const originalStatus = state.status;
      resolveHazards(state);
      expect(state.status).toBe(originalStatus);
    });
  });
});

// ============================================================================
// GAME STATUS UPDATE TESTS
// ============================================================================

describe('Game Status Update', () => {
  describe('updateGameStatus', () => {
    it('should set status to won when player is on goal', () => {
      const state = createStateWithPlayer(basicLevel, { x: 2, y: 2 });
      const result = updateGameStatus(state);
      expect(result.status).toBe('won');
    });

    it('should set status to lost when energy is 0 and not on goal', () => {
      const state = createStateWithPlayer(basicLevel, { x: 0, y: 0 }, {
        energy: 0,
      });
      const result = updateGameStatus(state);
      expect(result.status).toBe('lost');
    });

    it('should keep status as playing when game continues', () => {
      const state = createGameState(basicLevel);
      const result = updateGameStatus(state);
      expect(result.status).toBe('playing');
    });

    it('should not change status if already won', () => {
      const state = createStateWithPlayer(basicLevel, { x: 0, y: 0 }, {
        status: 'won',
      });
      const result = updateGameStatus(state);
      expect(result.status).toBe('won');
    });

    it('should not change status if already lost', () => {
      const state = createStateWithPlayer(basicLevel, { x: 2, y: 2 }, {
        status: 'lost',
      });
      const result = updateGameStatus(state);
      expect(result.status).toBe('lost');
    });

    it('should prioritize win when on goal with 0 energy', () => {
      const state = createStateWithPlayer(basicLevel, { x: 2, y: 2 }, {
        energy: 0,
      });
      const result = updateGameStatus(state);
      expect(result.status).toBe('won');
    });
  });
});

// ============================================================================
// TURN RESOLUTION TESTS
// ============================================================================

describe('Turn Resolution', () => {
  describe('resolveTurn', () => {
    it('should resolve winning turn', () => {
      const state = createStateWithPlayer(basicLevel, { x: 2, y: 2 });
      const result = resolveTurn(state);
      expect(result.status).toBe('won');
    });

    it('should resolve losing turn from hazard', () => {
      const state = createStateWithPlayer(hazardLevel, { x: 1, y: 0 });
      const result = resolveTurn(state);
      expect(result.status).toBe('lost');
    });

    it('should resolve losing turn from energy depletion', () => {
      const state = createStateWithPlayer(basicLevel, { x: 0, y: 0 }, {
        energy: 0,
      });
      const result = resolveTurn(state);
      expect(result.status).toBe('lost');
    });

    it('should keep playing when no win/lose condition', () => {
      const state = createGameState(basicLevel);
      const result = resolveTurn(state);
      expect(result.status).toBe('playing');
    });

    it('should prioritize hazard over goal (hazard + goal = lose)', () => {
      // Level with hazard on goal
      const hazardOnGoalLevel: LevelData = {
        ...basicLevel,
        hazards: [{ id: 'spike-goal', x: 2, y: 2, type: 'spike' }],
      };
      const state = createStateWithPlayer(hazardOnGoalLevel, { x: 2, y: 2 });
      const result = resolveTurn(state);
      expect(result.status).toBe('lost');
    });

    it('should not mutate original state', () => {
      const state = createStateWithPlayer(basicLevel, { x: 2, y: 2 });
      const originalStatus = state.status;
      resolveTurn(state);
      expect(state.status).toBe(originalStatus);
    });
  });

  describe('processFullTurn', () => {
    it('should process move and resolve turn', () => {
      // Create level where moving right twice then down twice reaches goal
      const state = createGameState(basicLevel);

      // Move right: (0,0) -> (1,0)
      const result = processFullTurn(state, { type: 'move', direction: 'right' }, applyAction);

      expect(result.player.position).toEqual({ x: 1, y: 0 });
      expect(result.energy).toBe(9);
      expect(result.status).toBe('playing');
    });

    it('should detect win after moving to goal', () => {
      // Position player one step from goal
      const state = createStateWithPlayer(basicLevel, { x: 1, y: 2 });

      // Move right to goal at (2,2)
      const result = processFullTurn(state, { type: 'move', direction: 'right' }, applyAction);

      expect(result.player.position).toEqual({ x: 2, y: 2 });
      expect(result.status).toBe('won');
    });

    it('should detect lose after moving to hazard', () => {
      const state = createGameState(hazardLevel);

      // Move right into hazard at (1,0)
      const result = processFullTurn(state, { type: 'move', direction: 'right' }, applyAction);

      expect(result.player.position).toEqual({ x: 1, y: 0 });
      expect(result.status).toBe('lost');
    });

    it('should return original state for invalid action', () => {
      const state = createGameState(basicLevel);

      // Try to move left (out of bounds)
      const result = processFullTurn(state, { type: 'move', direction: 'left' }, applyAction);

      expect(result).toBe(state);
    });

    it('should detect lose from energy depletion', () => {
      const state = createStateWithPlayer(basicLevel, { x: 0, y: 0 }, {
        energy: 1,
      });

      // Move right uses last energy
      const result = processFullTurn(state, { type: 'move', direction: 'right' }, applyAction);

      expect(result.energy).toBe(0);
      expect(result.status).toBe('lost');
    });
  });
});

// ============================================================================
// GAME STATE QUERY TESTS
// ============================================================================

describe('Game State Queries', () => {
  describe('isGameOver', () => {
    it('should return true when won', () => {
      const state = createStateWithPlayer(basicLevel, { x: 0, y: 0 }, {
        status: 'won',
      });
      expect(isGameOver(state)).toBe(true);
    });

    it('should return true when lost', () => {
      const state = createStateWithPlayer(basicLevel, { x: 0, y: 0 }, {
        status: 'lost',
      });
      expect(isGameOver(state)).toBe(true);
    });

    it('should return false when playing', () => {
      const state = createGameState(basicLevel);
      expect(isGameOver(state)).toBe(false);
    });
  });

  describe('isGamePlaying', () => {
    it('should return true when playing', () => {
      const state = createGameState(basicLevel);
      expect(isGamePlaying(state)).toBe(true);
    });

    it('should return false when won', () => {
      const state = createStateWithPlayer(basicLevel, { x: 0, y: 0 }, {
        status: 'won',
      });
      expect(isGamePlaying(state)).toBe(false);
    });

    it('should return false when lost', () => {
      const state = createStateWithPlayer(basicLevel, { x: 0, y: 0 }, {
        status: 'lost',
      });
      expect(isGamePlaying(state)).toBe(false);
    });
  });

  describe('getGameStatusMessage', () => {
    it('should return correct message for playing', () => {
      const state = createGameState(basicLevel);
      expect(getGameStatusMessage(state)).toBe('Game in progress');
    });

    it('should return correct message for won', () => {
      const state = createStateWithPlayer(basicLevel, { x: 0, y: 0 }, {
        status: 'won',
      });
      expect(getGameStatusMessage(state)).toBe('Level complete!');
    });

    it('should return correct message for lost', () => {
      const state = createStateWithPlayer(basicLevel, { x: 0, y: 0 }, {
        status: 'lost',
      });
      expect(getGameStatusMessage(state)).toBe('Mission failed');
    });
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Rules Integration', () => {
  it('should handle complete winning game sequence', () => {
    // Start at (0,0), goal at (2,2)
    let state = createGameState(basicLevel);

    // Move sequence: right, right, down, down
    state = processFullTurn(state, { type: 'move', direction: 'right' }, applyAction);
    expect(state.status).toBe('playing');

    state = processFullTurn(state, { type: 'move', direction: 'right' }, applyAction);
    expect(state.status).toBe('playing');

    state = processFullTurn(state, { type: 'move', direction: 'down' }, applyAction);
    expect(state.status).toBe('playing');

    state = processFullTurn(state, { type: 'move', direction: 'down' }, applyAction);
    expect(state.status).toBe('won');
    expect(state.player.position).toEqual({ x: 2, y: 2 });
    expect(state.turnCount).toBe(4);
  });

  it('should handle game with hazard avoidance', () => {
    // Hazards at (1,0) and (1,1)
    // Path: down, right, right, down (avoids hazards)
    let state = createGameState(hazardLevel);

    state = processFullTurn(state, { type: 'move', direction: 'down' }, applyAction);
    expect(state.status).toBe('playing');
    expect(state.player.position).toEqual({ x: 0, y: 1 });

    // Can't go right (1,1 has hazard)
    // Go down first
    state = processFullTurn(state, { type: 'move', direction: 'down' }, applyAction);
    expect(state.status).toBe('playing');
    expect(state.player.position).toEqual({ x: 0, y: 2 });

    // Now go right twice
    state = processFullTurn(state, { type: 'move', direction: 'right' }, applyAction);
    expect(state.status).toBe('playing');

    state = processFullTurn(state, { type: 'move', direction: 'right' }, applyAction);
    expect(state.status).toBe('won');
  });

  it('should be deterministic - same actions produce same result', () => {
    const actions: import('../../src/core/types').Action[] = [
      { type: 'move', direction: 'right' },
      { type: 'move', direction: 'down' },
      { type: 'wait' },
      { type: 'move', direction: 'right' },
    ];

    // Run simulation twice
    let state1 = createGameState(basicLevel);
    let state2 = createGameState(basicLevel);

    for (const action of actions) {
      state1 = processFullTurn(state1, action, applyAction);
      state2 = processFullTurn(state2, action, applyAction);
    }

    // Both should have identical state
    expect(state1.player.position).toEqual(state2.player.position);
    expect(state1.energy).toBe(state2.energy);
    expect(state1.turnCount).toBe(state2.turnCount);
    expect(state1.status).toBe(state2.status);
  });
});
