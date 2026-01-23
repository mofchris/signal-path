/**
 * Game Rules Module
 *
 * This file is responsible for:
 * - Turn resolution (what happens after player acts)
 * - Win condition checking (player reaches goal)
 * - Lose condition checking (hazard contact, energy depletion)
 * - Hazard resolution (checking player vs hazard positions)
 *
 * Architecture note:
 * - Part of the core logic layer (no browser dependencies)
 * - All functions are pure (no side effects)
 * - Follows immutable data patterns
 * - Deterministic: same state = same result
 *
 * Turn Resolution Sequence (from GDD.md):
 * 1. Player Input Phase - handled by UI
 * 2. Action Validation Phase - handled by actions.ts
 * 3. Action Application Phase - handled by actions.ts
 * 4. Hazard Resolution Phase - THIS MODULE
 * 5. Win/Lose Check Phase - THIS MODULE
 * 6. Turn Complete
 *
 * This module handles steps 4-6 of turn resolution.
 */

import type { GameState } from './types';
import { positionsEqual } from './state';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Reasons why a player can lose the game.
 * Used for UI feedback to explain what happened.
 */
export type LoseReason = 'hazard' | 'energy_depleted' | 'no_valid_moves';

/**
 * Result of a lose condition check.
 * If lost is true, reason explains why.
 */
export interface LoseCheckResult {
  lost: boolean;
  reason?: LoseReason;
}

// ============================================================================
// WIN CONDITION
// ============================================================================

/**
 * Check if the player has won the game.
 *
 * Win condition (from GDD.md):
 * - Player is on the goal tile
 * - Game is still in 'playing' state (not already lost)
 *
 * Note: Win is checked AFTER hazard resolution.
 * If player is on both hazard and goal, they lose (hazard takes priority).
 *
 * @param state - Current game state
 * @returns true if player has won, false otherwise
 *
 * Example:
 * ```typescript
 * const state = { player: { position: { x: 4, y: 4 } }, goal: { x: 4, y: 4 }, ... };
 * checkWinCondition(state); // true
 * ```
 */
export function checkWinCondition(state: GameState): boolean {
  // Can only win if game is still playing
  // (If already lost from hazard, can't win)
  if (state.status !== 'playing') {
    return false;
  }

  // Win when player position matches goal position
  return positionsEqual(state.player.position, state.goal);
}

// ============================================================================
// LOSE CONDITIONS
// ============================================================================

/**
 * Check if the player has lost the game.
 *
 * Lose conditions (from GDD.md):
 * 1. Hazard Contact - Player is on an active hazard tile
 * 2. Energy Exhaustion - Player has 0 energy and hasn't reached goal
 *
 * Priority: Hazard contact is checked first (most immediate danger).
 *
 * @param state - Current game state
 * @returns LoseCheckResult with lost flag and reason if applicable
 *
 * Example:
 * ```typescript
 * const result = checkLoseCondition(state);
 * if (result.lost) {
 *   console.log(`Game over: ${result.reason}`);
 * }
 * ```
 */
export function checkLoseCondition(state: GameState): LoseCheckResult {
  // Can only lose if game is still playing
  if (state.status !== 'playing') {
    return { lost: false };
  }

  // Check 1: Hazard contact
  // Player loses if standing on any active hazard
  const isOnHazard = state.hazards.some(
    (hazard) =>
      hazard.active && positionsEqual(hazard.position, state.player.position)
  );

  if (isOnHazard) {
    return { lost: true, reason: 'hazard' };
  }

  // Check 2: Energy exhaustion
  // Player loses if energy is 0 and not on goal
  // (If on goal with 0 energy, they win instead)
  if (state.energy <= 0) {
    const isOnGoal = positionsEqual(state.player.position, state.goal);
    if (!isOnGoal) {
      return { lost: true, reason: 'energy_depleted' };
    }
  }

  // No lose condition met
  return { lost: false };
}

/**
 * Check specifically for hazard collision.
 *
 * Utility function to check if player is on any active hazard.
 * Used internally and can be used for UI warnings.
 *
 * @param state - Current game state
 * @returns true if player is on an active hazard
 */
export function isPlayerOnHazard(state: GameState): boolean {
  return state.hazards.some(
    (hazard) =>
      hazard.active && positionsEqual(hazard.position, state.player.position)
  );
}

/**
 * Check specifically for energy depletion.
 *
 * @param state - Current game state
 * @returns true if player has no energy remaining
 */
export function isEnergyDepleted(state: GameState): boolean {
  return state.energy <= 0;
}

// ============================================================================
// HAZARD RESOLUTION
// ============================================================================

/**
 * Resolve hazard interactions for the current turn.
 *
 * This function checks if the player is on any active hazard
 * and updates the game status accordingly.
 *
 * From GDD.md:
 * - Hazards activate AFTER player turn
 * - Player sees result immediately
 * - Multiple hazards on same tile: player loses if any are active
 *
 * @param state - Current game state (after player action applied)
 * @returns New game state with status updated if player hit hazard
 */
export function resolveHazards(state: GameState): GameState {
  // Only resolve if game is still playing
  if (state.status !== 'playing') {
    return state;
  }

  // Check if player is on any active hazard
  if (isPlayerOnHazard(state)) {
    // Player hit hazard - game over
    return {
      ...state,
      status: 'lost',
    };
  }

  // No hazard collision
  return state;
}

// ============================================================================
// GAME STATUS UPDATE
// ============================================================================

/**
 * Update game status based on win/lose conditions.
 *
 * This is called after hazard resolution.
 * Order matters:
 * 1. If already lost (from hazards), stay lost
 * 2. Check win condition (on goal?)
 * 3. Check lose condition (energy depleted?)
 *
 * @param state - Current game state
 * @returns New game state with updated status
 */
export function updateGameStatus(state: GameState): GameState {
  // If already won or lost, don't change
  if (state.status !== 'playing') {
    return state;
  }

  // Check win condition first (after hazards already checked)
  if (checkWinCondition(state)) {
    return {
      ...state,
      status: 'won',
    };
  }

  // Check lose conditions
  const loseResult = checkLoseCondition(state);
  if (loseResult.lost) {
    return {
      ...state,
      status: 'lost',
    };
  }

  // Game continues
  return state;
}

// ============================================================================
// TURN RESOLUTION
// ============================================================================

/**
 * Resolve a complete turn after player action has been applied.
 *
 * This is the main entry point for turn resolution.
 * Called after applyAction() in actions.ts.
 *
 * Turn Resolution Sequence:
 * 1. Hazard resolution - check if player hit any hazards
 * 2. Win/lose check - update game status
 *
 * The action application (movement, energy deduction, item collection)
 * is handled by actions.ts before this function is called.
 *
 * @param state - Game state after action was applied
 * @returns Final game state for this turn
 *
 * Example:
 * ```typescript
 * // In game loop:
 * let state = gameState;
 * state = applyAction(state, playerAction);  // From actions.ts
 * state = resolveTurn(state);                // This function
 * // Now state.status reflects win/lose/playing
 * ```
 */
export function resolveTurn(state: GameState): GameState {
  // Step 1: Resolve hazards
  let currentState = resolveHazards(state);

  // Step 2: Update game status (win/lose checks)
  currentState = updateGameStatus(currentState);

  return currentState;
}

// ============================================================================
// FULL TURN PROCESSING
// ============================================================================

/**
 * Process a complete player turn from action to resolution.
 *
 * This combines action application and turn resolution into one call.
 * Useful for game loop integration.
 *
 * Sequence:
 * 1. Validate action (via applyAction which validates first)
 * 2. Apply action (movement, energy, items)
 * 3. Resolve turn (hazards, win/lose)
 *
 * @param state - Current game state
 * @param action - Player action to process
 * @param applyActionFn - The applyAction function (passed to avoid circular deps)
 * @returns Final game state after full turn processing
 */
export function processFullTurn(
  state: GameState,
  action: import('./types').Action,
  applyActionFn: (state: GameState, action: import('./types').Action) => GameState
): GameState {
  // Apply the action (validates internally)
  const stateAfterAction = applyActionFn(state, action);

  // If action was invalid (state unchanged), skip resolution
  if (stateAfterAction === state) {
    return state;
  }

  // Resolve the turn
  return resolveTurn(stateAfterAction);
}

// ============================================================================
// GAME STATE QUERIES
// ============================================================================

/**
 * Check if the game is over (won or lost).
 *
 * @param state - Current game state
 * @returns true if game has ended
 */
export function isGameOver(state: GameState): boolean {
  return state.status === 'won' || state.status === 'lost';
}

/**
 * Check if the game is still in progress.
 *
 * @param state - Current game state
 * @returns true if game is still playing
 */
export function isGamePlaying(state: GameState): boolean {
  return state.status === 'playing';
}

/**
 * Get the current game status as a descriptive string.
 *
 * Useful for UI display.
 *
 * @param state - Current game state
 * @returns Human-readable status string
 */
export function getGameStatusMessage(state: GameState): string {
  switch (state.status) {
    case 'playing':
      return 'Game in progress';
    case 'won':
      return 'Level complete!';
    case 'lost':
      // Could be enhanced to include lose reason
      return 'Mission failed';
    default:
      return 'Unknown status';
  }
}
