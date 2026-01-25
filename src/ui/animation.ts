/**
 * Animation Module
 *
 * Handles smooth visual transitions for player movement.
 * This is part of the UI layer and does not affect core game logic.
 *
 * Architecture note:
 * - Animation state is separate from game state
 * - Player's logical position updates immediately
 * - Visual position interpolates smoothly for presentation
 * - This maintains determinism - animations are cosmetic only
 */

import type { Position } from '../core/types';

// ============================================================================
// ANIMATION STATE
// ============================================================================

/**
 * State for movement animation.
 * Tracks interpolation between two grid positions.
 */
export interface AnimationState {
  /** Is an animation currently playing? */
  active: boolean;
  /** Starting grid position (where player was) */
  fromPosition: Position | null;
  /** Ending grid position (where player moved to) */
  toPosition: Position | null;
  /** Timestamp when animation started (ms) */
  startTime: number;
  /** Duration of the animation (ms) */
  duration: number;
}

/**
 * Default animation duration in milliseconds.
 * 150ms feels snappy but smooth.
 */
export const ANIMATION_DURATION = 150;

// ============================================================================
// ANIMATION STATE MANAGEMENT
// ============================================================================

/**
 * Create initial animation state.
 * Called at game start or level reset.
 */
export function createAnimationState(): AnimationState {
  return {
    active: false,
    fromPosition: null,
    toPosition: null,
    startTime: 0,
    duration: ANIMATION_DURATION,
  };
}

/**
 * Start a movement animation.
 * Call this before updating the game state, to capture the "from" position.
 *
 * @param state - Current animation state
 * @param from - Starting position (player's current position)
 * @param to - Ending position (where player is moving to)
 * @returns New animation state with animation started
 */
export function startAnimation(
  state: AnimationState,
  from: Position,
  to: Position
): AnimationState {
  return {
    ...state,
    active: true,
    fromPosition: { ...from },
    toPosition: { ...to },
    startTime: Date.now(),
  };
}

/**
 * Update animation state (call each frame).
 * Returns inactive state when animation is complete.
 *
 * @param state - Current animation state
 * @returns Updated animation state
 */
export function updateAnimation(state: AnimationState): AnimationState {
  if (!state.active) {
    return state;
  }

  const elapsed = Date.now() - state.startTime;
  if (elapsed >= state.duration) {
    // Animation complete - reset to inactive
    return createAnimationState();
  }

  // Animation still in progress
  return state;
}

/**
 * Get animation progress as a value from 0 to 1.
 * Returns 1 if animation is not active (complete).
 *
 * @param state - Current animation state
 * @returns Progress value (0 = start, 1 = complete)
 */
export function getAnimationProgress(state: AnimationState): number {
  if (!state.active) {
    return 1; // Animation complete
  }

  const elapsed = Date.now() - state.startTime;
  const rawProgress = Math.min(1, elapsed / state.duration);

  // Apply easing function (ease-out quadratic)
  // This makes the animation feel snappy - fast start, smooth end
  return easeOutQuad(rawProgress);
}

/**
 * Ease-out quadratic easing function.
 * Creates a "decelerating" feel - fast at start, slows to stop.
 *
 * @param t - Raw progress (0 to 1)
 * @returns Eased progress (0 to 1)
 */
function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

/**
 * Get the current visual position during animation.
 * Uses linear interpolation (lerp) between from and to positions.
 *
 * @param state - Current animation state
 * @param logicalPosition - The player's actual grid position
 * @returns Visual position (may be between grid cells during animation)
 */
export function getVisualPosition(
  state: AnimationState,
  logicalPosition: Position
): Position {
  // If not animating, just return the logical position
  if (!state.active || !state.fromPosition || !state.toPosition) {
    return logicalPosition;
  }

  const progress = getAnimationProgress(state);

  // Linear interpolation between from and to
  return {
    x: state.fromPosition.x + (state.toPosition.x - state.fromPosition.x) * progress,
    y: state.fromPosition.y + (state.toPosition.y - state.fromPosition.y) * progress,
  };
}

/**
 * Check if animation is currently active.
 * Convenience function for game loop.
 *
 * @param state - Current animation state
 * @returns True if animation is in progress
 */
export function isAnimating(state: AnimationState): boolean {
  return state.active;
}
