/**
 * Action System Module
 *
 * This file is responsible for:
 * - Validating player actions (is this move legal?)
 * - Applying actions to create new game states
 * - Querying available actions
 *
 * Architecture note:
 * - Part of the core logic layer (no browser dependencies)
 * - All functions are pure (no side effects)
 * - Follows immutable data patterns (creates new states)
 * - Implements the Command Pattern (actions as data)
 *
 * Design principle: Validate then Apply
 * - Always validate before applying
 * - Invalid actions return original state unchanged
 * - Valid actions create new state objects
 *
 * This separation enables:
 * - UI can query valid actions to show/hide buttons
 * - Network code can validate actions before sending
 * - Replay system can verify action sequences
 * - Testing is straightforward (pure functions)
 */

import type {
  GameState,
  Action,
  Direction,
  ValidationResult,
} from './types';
import { DIRECTION_VECTORS } from './types';
import { isInBounds, getTileAt, addPositions, positionsEqual } from './state';

// ============================================================================
// ACTION VALIDATION
// ============================================================================

/**
 * Validate if an action is legal in the current game state
 *
 * This is the main validation entry point. It:
 * - Checks if the game is in a playable state
 * - Delegates to specific validators based on action type
 * - Returns a result with success/failure and reason
 *
 * Why validate separately from apply:
 * - UI can show which actions are available
 * - Network can reject invalid actions early
 * - Testing can verify validation rules
 * - Clearer separation of concerns
 *
 * @param state - Current game state
 * @param action - Action to validate
 * @returns Validation result with valid flag and optional reason
 *
 * Example:
 * ```typescript
 * const action = { type: 'move', direction: 'up' };
 * const result = validateAction(state, action);
 * if (result.valid) {
 *   // Action is legal, can apply it
 * } else {
 *   console.log(result.reason); // "Target tile is not walkable"
 * }
 * ```
 */
export function validateAction(
  state: GameState,
  action: Action
): ValidationResult {
  // Can only take actions in 'playing' state
  // If game is won or lost, no further actions allowed
  if (state.status !== 'playing') {
    return { valid: false, reason: 'Game is not in playing state' };
  }

  // Delegate to specific validators based on action type
  // TypeScript's discriminated unions ensure type safety here
  switch (action.type) {
    case 'move':
      return validateMove(state, action.direction);
    case 'wait':
      return validateWait(state);
    case 'restart':
      // Restart is always valid (handled by UI layer)
      return { valid: true };
    case 'undo':
      return validateUndo(state);
    default:
      // TypeScript should prevent this, but be defensive
      return { valid: false, reason: 'Unknown action type' };
  }
}

/**
 * Validate a move action
 *
 * A move is valid if:
 * 1. Player has energy remaining
 * 2. Target position is within grid bounds
 * 3. Target tile is walkable (not a wall)
 * 4. Target is not a locked door (Phase 2 feature)
 *
 * Note: We don't check win/lose conditions here.
 * Those are checked after applying the action (in rules.ts).
 *
 * @param state - Current game state
 * @param direction - Direction to move
 * @returns Validation result
 */
function validateMove(
  state: GameState,
  direction: Direction
): ValidationResult {
  // Check 1: Energy available
  if (state.energy <= 0) {
    return { valid: false, reason: 'No energy remaining' };
  }

  // Calculate target position
  const delta = DIRECTION_VECTORS[direction];
  const targetPos = addPositions(state.player.position, delta);

  // Check 2: Target is in bounds
  if (!isInBounds(targetPos, state.grid)) {
    return { valid: false, reason: 'Move out of bounds' };
  }

  // Check 3: Target tile is walkable
  const targetTile = getTileAt(state.grid, targetPos);
  if (!targetTile || !targetTile.walkable) {
    return { valid: false, reason: 'Target tile is not walkable' };
  }

  // Check 4: Locked doors
  // Player can move onto a locked door if they have the matching key
  // The door will be unlocked when the action is applied
  const lockedDoor = state.interactables.find(
    (i) =>
      i.type === 'door' &&
      positionsEqual(i.position, targetPos) &&
      i.state.type === 'door' &&
      i.state.locked
  );

  if (lockedDoor && lockedDoor.state.type === 'door') {
    // Check if player has matching key
    const hasMatchingKey = state.player.inventory.keys.some(
      (key) => key.color === lockedDoor.state.color
    );

    if (!hasMatchingKey) {
      return { valid: false, reason: 'Door is locked' };
    }
    // If player has key, move is valid - door will unlock in applyMove
  }

  // All checks passed
  return { valid: true };
}

/**
 * Validate a wait action
 *
 * Waiting consumes energy but doesn't move.
 * Use cases:
 * - Player wants to skip a turn
 * - Future: Waiting for hazards to deactivate
 * - Future: Waiting for doors to unlock
 *
 * A wait is valid if:
 * 1. Player has energy remaining
 *
 * @param state - Current game state
 * @returns Validation result
 */
function validateWait(state: GameState): ValidationResult {
  if (state.energy <= 0) {
    return { valid: false, reason: 'No energy remaining' };
  }

  return { valid: true };
}

/**
 * Validate an undo action
 *
 * Undo reverts to the previous state.
 * This requires action history to be tracked.
 *
 * An undo is valid if:
 * 1. Action history exists and has at least one entry
 *
 * Note: actionHistory is optional in GameState.
 * We'll implement full undo in Phase 2.
 * For now, always return invalid.
 *
 * @param state - Current game state
 * @returns Validation result
 */
function validateUndo(state: GameState): ValidationResult {
  // Check if we have action history
  if (!state.actionHistory || state.actionHistory.length === 0) {
    return { valid: false, reason: 'No actions to undo' };
  }

  return { valid: true };
}

// ============================================================================
// ACTION APPLICATION
// ============================================================================

/**
 * Apply an action to create a new game state
 *
 * This is the main state update function. It:
 * - Validates the action first
 * - If invalid, returns original state unchanged
 * - If valid, creates and returns new state
 *
 * IMMUTABILITY: This function never modifies the input state.
 * It always creates a new state object.
 *
 * Why immutability:
 * - Enables undo (keep old states)
 * - Prevents bugs from unexpected mutations
 * - Makes testing easier (compare old vs new)
 * - Required for time-travel debugging
 * - Foundation for deterministic replay
 *
 * @param state - Current game state
 * @param action - Action to apply
 * @returns New game state (or original if invalid)
 *
 * Example:
 * ```typescript
 * const oldState = { ...gameState };
 * const newState = applyAction(oldState, { type: 'move', direction: 'up' });
 * // oldState is unchanged
 * // newState has player moved up by 1
 * ```
 */
export function applyAction(state: GameState, action: Action): GameState {
  // Validate first - don't apply invalid actions
  const validation = validateAction(state, action);
  if (!validation.valid) {
    // Return original state unchanged
    // This makes invalid actions safe (they do nothing)
    return state;
  }

  // Delegate to specific applicators based on action type
  switch (action.type) {
    case 'move':
      return applyMove(state, action.direction);
    case 'wait':
      return applyWait(state);
    case 'restart':
      // Restart is handled by UI layer (reloads level)
      // Core logic doesn't handle it
      return state;
    case 'undo':
      return applyUndo(state);
    default:
      // Should never reach here due to TypeScript
      return state;
  }
}

/**
 * Apply a move action
 *
 * Moving does several things:
 * 1. Updates player position
 * 2. Deducts energy
 * 3. Increments turn count
 * 4. Collects keys if present (Phase 2)
 * 5. Opens doors if player has key (Phase 2)
 *
 * Note: Win/lose checking happens AFTER this (in rules.ts)
 *
 * @param state - Current game state
 * @param direction - Direction to move
 * @returns New game state with updated position
 */
function applyMove(state: GameState, direction: Direction): GameState {
  const delta = DIRECTION_VECTORS[direction];
  const newPosition = addPositions(state.player.position, delta);

  // Phase 2: Check for key collection
  // If there's a key at newPosition and it's not collected, collect it
  const collectedKeyIndex = state.interactables.findIndex(
    (i) =>
      i.type === 'key' &&
      positionsEqual(i.position, newPosition) &&
      i.state.type === 'key' &&
      !i.state.collected
  );

  let newInteractables = state.interactables;
  let newInventory = state.player.inventory;

  if (collectedKeyIndex !== -1) {
    const key = state.interactables[collectedKeyIndex];
    if (key.state.type === 'key') {
      // Mark key as collected
      newInteractables = state.interactables.map((i, idx) =>
        idx === collectedKeyIndex && i.state.type === 'key'
          ? { ...i, state: { ...i.state, collected: true } }
          : i
      );

      // Add key to inventory
      newInventory = {
        keys: [...state.player.inventory.keys, { id: key.id, color: key.state.color }],
      };
    }
  }

  // Phase 2: Check for door unlocking
  // If there's a locked door at newPosition and player has matching key, unlock it
  const doorIndex = state.interactables.findIndex(
    (i) =>
      i.type === 'door' &&
      positionsEqual(i.position, newPosition) &&
      i.state.type === 'door' &&
      i.state.locked
  );

  if (doorIndex !== -1) {
    const door = state.interactables[doorIndex];
    if (door.state.type === 'door') {
      // Check if player has matching key
      const hasKey = newInventory.keys.some((k) => k.color === door.state.color);

      if (hasKey) {
        // Unlock the door
        newInteractables = newInteractables.map((i, idx) =>
          idx === doorIndex && i.state.type === 'door'
            ? { ...i, state: { ...i.state, locked: false } }
            : i
        );
      }
    }
  }

  // Create new state with updated values
  // Spread operator creates new objects (immutability)
  return {
    ...state,
    player: {
      ...state.player,
      position: newPosition,
      inventory: newInventory,
    },
    interactables: newInteractables,
    energy: state.energy - 1,
    turnCount: state.turnCount + 1,
  };
}

/**
 * Apply a wait action
 *
 * Waiting:
 * 1. Deducts energy (same as moving)
 * 2. Increments turn count
 * 3. Doesn't change position
 *
 * Use cases:
 * - Player wants to conserve moves for pathfinding
 * - Future: Waiting for hazards to cycle
 *
 * @param state - Current game state
 * @returns New game state with updated energy/turn
 */
function applyWait(state: GameState): GameState {
  return {
    ...state,
    energy: state.energy - 1,
    turnCount: state.turnCount + 1,
  };
}

/**
 * Apply an undo action
 *
 * This would revert to a previous state.
 * Requires full action history tracking.
 *
 * For now, this is a placeholder.
 * Full undo implementation comes in Phase 2.
 *
 * @param state - Current game state
 * @returns Previous game state (or current if no history)
 */
function applyUndo(state: GameState): GameState {
  // TODO (Phase 2): Implement full undo
  // For now, just return current state
  return state;
}

// ============================================================================
// ACTION QUERIES
// ============================================================================

/**
 * Get all valid actions from current state
 *
 * This is useful for:
 * - AI/solver (what moves are possible?)
 * - UI (which buttons should be enabled?)
 * - Hints (show player their options)
 *
 * Returns all actions that would pass validation.
 *
 * @param state - Current game state
 * @returns Array of valid actions
 *
 * Example:
 * ```typescript
 * const validActions = getValidActions(state);
 * // validActions might be: [
 * //   { type: 'move', direction: 'up' },
 * //   { type: 'move', direction: 'right' },
 * //   { type: 'wait' }
 * // ]
 * ```
 */
export function getValidActions(state: GameState): Action[] {
  const validActions: Action[] = [];

  // Try all four movement directions
  const directions: Direction[] = ['up', 'down', 'left', 'right'];
  for (const direction of directions) {
    const action: Action = { type: 'move', direction };
    if (validateAction(state, action).valid) {
      validActions.push(action);
    }
  }

  // Check if wait is valid
  const waitAction: Action = { type: 'wait' };
  if (validateAction(state, waitAction).valid) {
    validActions.push(waitAction);
  }

  // Check if undo is valid
  const undoAction: Action = { type: 'undo' };
  if (validateAction(state, undoAction).valid) {
    validActions.push(undoAction);
  }

  // Restart is always available (handled by UI)
  // But we don't include it here since it's not a gameplay action

  return validActions;
}

/**
 * Get number of valid moves available
 *
 * Quick helper to check how many moves player has.
 * Useful for hint systems or difficulty analysis.
 *
 * @param state - Current game state
 * @returns Number of valid move actions (0-4)
 */
export function getValidMoveCount(state: GameState): number {
  return getValidActions(state).filter((a) => a.type === 'move').length;
}
