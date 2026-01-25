/**
 * Input Handling Module
 *
 * This file handles all user input for Signal Path:
 * - Keyboard input (Arrow keys, WASD)
 * - Touch/swipe input for mobile
 * - Input validation feedback
 *
 * Architecture:
 * - Converts raw DOM events into game Actions
 * - Uses callback pattern for loose coupling
 * - Handles input debouncing to prevent rapid-fire
 * - Provides visual feedback hooks for invalid moves
 */

import type { Action, Direction } from '../core/types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Callback function type for when an action is triggered.
 */
export type ActionCallback = (action: Action) => void;

/**
 * Callback function type for invalid move feedback.
 * Direction indicates which direction was attempted.
 */
export type InvalidMoveCallback = (direction: Direction) => void;

/**
 * Callback function type for level navigation.
 */
export type LevelCallback = () => void;

/**
 * Callback function type for simple toggle actions.
 */
export type ToggleCallback = () => void;

/**
 * Input handler configuration.
 */
export interface InputConfig {
  onAction: ActionCallback;
  onInvalidMove?: InvalidMoveCallback;
  onNextLevel?: LevelCallback;
  onPrevLevel?: LevelCallback;
  onToggleSound?: ToggleCallback;
  /** Minimum time between inputs in ms (default: 100) */
  debounceTime?: number;
  /** Minimum swipe distance in pixels (default: 30) */
  swipeThreshold?: number;
}

/**
 * Touch tracking state.
 */
interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
}

// ============================================================================
// KEYBOARD MAPPING
// ============================================================================

/**
 * Map of keyboard keys to directions.
 */
const KEY_TO_DIRECTION: Record<string, Direction> = {
  // Arrow keys
  arrowup: 'up',
  arrowdown: 'down',
  arrowleft: 'left',
  arrowright: 'right',
  // WASD
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
};

/**
 * Map of keyboard keys to special actions.
 */
const KEY_TO_ACTION: Record<string, Action['type']> = {
  ' ': 'wait',
  r: 'restart',
  u: 'undo',
};

// ============================================================================
// INPUT HANDLER CLASS
// ============================================================================

/**
 * Manages all input for the game.
 *
 * Usage:
 * ```typescript
 * const input = new InputHandler({
 *   onAction: (action) => processAction(action),
 *   onInvalidMove: (dir) => showInvalidFeedback(dir),
 * });
 *
 * input.attach(canvas);
 * // ... later
 * input.detach();
 * ```
 */
export class InputHandler {
  private config: Required<InputConfig>;
  private lastInputTime: number = 0;
  private touchState: TouchState | null = null;
  private boundHandleKeyDown: (e: KeyboardEvent) => void;
  private boundHandleTouchStart: (e: TouchEvent) => void;
  private boundHandleTouchEnd: (e: TouchEvent) => void;
  private attachedElement: HTMLElement | null = null;

  constructor(config: InputConfig) {
    // Set defaults
    this.config = {
      onAction: config.onAction,
      onInvalidMove: config.onInvalidMove ?? (() => {}),
      onNextLevel: config.onNextLevel ?? (() => {}),
      onPrevLevel: config.onPrevLevel ?? (() => {}),
      onToggleSound: config.onToggleSound ?? (() => {}),
      debounceTime: config.debounceTime ?? 100,
      swipeThreshold: config.swipeThreshold ?? 30,
    };

    // Bind methods to preserve `this` context
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    this.boundHandleTouchStart = this.handleTouchStart.bind(this);
    this.boundHandleTouchEnd = this.handleTouchEnd.bind(this);
  }

  /**
   * Attach input listeners to the document and an element for touch.
   */
  attach(element: HTMLElement): void {
    this.attachedElement = element;

    // Keyboard events on document (global)
    document.addEventListener('keydown', this.boundHandleKeyDown);

    // Touch events on the specific element
    element.addEventListener('touchstart', this.boundHandleTouchStart, { passive: false });
    element.addEventListener('touchend', this.boundHandleTouchEnd, { passive: false });
  }

  /**
   * Remove all input listeners.
   */
  detach(): void {
    document.removeEventListener('keydown', this.boundHandleKeyDown);

    if (this.attachedElement) {
      this.attachedElement.removeEventListener('touchstart', this.boundHandleTouchStart);
      this.attachedElement.removeEventListener('touchend', this.boundHandleTouchEnd);
      this.attachedElement = null;
    }
  }

  /**
   * Check if enough time has passed since last input.
   */
  private canProcessInput(): boolean {
    const now = Date.now();
    if (now - this.lastInputTime < this.config.debounceTime) {
      return false;
    }
    this.lastInputTime = now;
    return true;
  }

  /**
   * Handle keyboard input.
   */
  private handleKeyDown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();

    // Check for direction keys
    const direction = KEY_TO_DIRECTION[key];
    if (direction) {
      event.preventDefault();
      if (this.canProcessInput()) {
        this.config.onAction({ type: 'move', direction });
      }
      return;
    }

    // Check for special action keys
    const actionType = KEY_TO_ACTION[key];
    if (actionType) {
      event.preventDefault();
      if (this.canProcessInput()) {
        if (actionType === 'wait') {
          this.config.onAction({ type: 'wait' });
        } else if (actionType === 'restart') {
          this.config.onAction({ type: 'restart' });
        } else if (actionType === 'undo') {
          this.config.onAction({ type: 'undo' });
        }
      }
      return;
    }

    // Level navigation (for testing/debugging)
    if (key === 'n') {
      event.preventDefault();
      this.config.onNextLevel();
      return;
    }

    if (key === 'p') {
      event.preventDefault();
      this.config.onPrevLevel();
      return;
    }

    // Sound toggle
    if (key === 'm') {
      event.preventDefault();
      this.config.onToggleSound();
      return;
    }
  }

  /**
   * Handle touch start - record starting position.
   */
  private handleTouchStart(event: TouchEvent): void {
    if (event.touches.length !== 1) return;

    const touch = event.touches[0];
    this.touchState = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
    };
  }

  /**
   * Handle touch end - determine swipe direction.
   */
  private handleTouchEnd(event: TouchEvent): void {
    if (!this.touchState) return;
    if (event.changedTouches.length !== 1) return;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - this.touchState.startX;
    const dy = touch.clientY - this.touchState.startY;
    const elapsed = Date.now() - this.touchState.startTime;

    // Clear touch state
    this.touchState = null;

    // Ignore if swipe took too long (> 500ms) - probably not a swipe
    if (elapsed > 500) return;

    // Check if swipe distance meets threshold
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx < this.config.swipeThreshold && absDy < this.config.swipeThreshold) {
      // Not a swipe - could be a tap
      // For now, treat tap as wait action
      if (this.canProcessInput()) {
        this.config.onAction({ type: 'wait' });
      }
      return;
    }

    // Determine swipe direction (primary axis)
    let direction: Direction;
    if (absDx > absDy) {
      // Horizontal swipe
      direction = dx > 0 ? 'right' : 'left';
    } else {
      // Vertical swipe
      direction = dy > 0 ? 'down' : 'up';
    }

    // Prevent default to stop scrolling
    event.preventDefault();

    if (this.canProcessInput()) {
      this.config.onAction({ type: 'move', direction });
    }
  }

  /**
   * Trigger invalid move feedback externally.
   * Called by game logic when a move fails validation.
   */
  triggerInvalidFeedback(direction: Direction): void {
    this.config.onInvalidMove(direction);
  }
}

// ============================================================================
// SIMPLE FUNCTIONAL API
// ============================================================================

/**
 * Create and attach a simple input handler.
 * Returns a cleanup function.
 *
 * Usage:
 * ```typescript
 * const cleanup = setupInput(canvas, {
 *   onAction: handleAction,
 *   onNextLevel: nextLevel,
 * });
 *
 * // Later, to remove listeners:
 * cleanup();
 * ```
 */
export function setupInput(
  element: HTMLElement,
  config: InputConfig
): () => void {
  const handler = new InputHandler(config);
  handler.attach(element);
  return () => handler.detach();
}

// ============================================================================
// VISUAL FEEDBACK
// ============================================================================

/**
 * State for visual feedback animation.
 */
export interface FeedbackState {
  active: boolean;
  direction: Direction | null;
  startTime: number;
  duration: number;
}

/**
 * Create initial feedback state.
 */
export function createFeedbackState(): FeedbackState {
  return {
    active: false,
    direction: null,
    startTime: 0,
    duration: 200, // ms
  };
}

/**
 * Trigger feedback animation.
 */
export function triggerFeedback(
  state: FeedbackState,
  direction: Direction
): FeedbackState {
  return {
    ...state,
    active: true,
    direction,
    startTime: Date.now(),
  };
}

/**
 * Update feedback state (call each frame).
 * Returns updated state with active=false when animation completes.
 */
export function updateFeedback(state: FeedbackState): FeedbackState {
  if (!state.active) return state;

  const elapsed = Date.now() - state.startTime;
  if (elapsed >= state.duration) {
    return {
      ...state,
      active: false,
      direction: null,
    };
  }

  return state;
}

/**
 * Get feedback animation progress (0 to 1).
 */
export function getFeedbackProgress(state: FeedbackState): number {
  if (!state.active) return 0;
  const elapsed = Date.now() - state.startTime;
  return Math.min(1, elapsed / state.duration);
}
