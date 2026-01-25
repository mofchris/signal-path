/**
 * Signal Path - Main Entry Point
 *
 * This is the UI layer entry point for the game. It's responsible for:
 * - Setting up the canvas rendering context
 * - Loading level data from JSON files
 * - Creating initial game state
 * - Rendering the game
 * - Handling user input
 *
 * Architecture note:
 * - This file is part of the UI layer (src/ui/)
 * - UI layer imports from core (src/core/) and content (src/content/)
 * - All game logic lives in core; UI handles presentation and input
 */

import { createGameState } from '../core/state';
import { applyAction, validateAction } from '../core/actions';
import { resolveTurn } from '../core/rules';
import { render, resizeCanvas, renderInvalidMoveFeedback } from './renderer';
import { InputHandler, createFeedbackState, triggerFeedback, updateFeedback, getFeedbackProgress } from './input';
import { loadAllLevels } from '../content/loader';
import type { GameState, Action, LevelData, Direction } from '../core/types';

// ============================================================================
// LEVEL MANAGEMENT
// ============================================================================

/**
 * Loaded levels array.
 * Populated at startup from JSON files.
 */
let LEVELS: LevelData[] = [];
let currentLevelIndex = 0;
let levelsLoaded = false;

// ============================================================================
// INITIALIZATION
// ============================================================================

console.log('Signal Path is loading...');

// Get loading element for status updates
const loadingEl = document.getElementById('loading');

/**
 * Update loading message.
 */
function setLoadingMessage(message: string): void {
  if (loadingEl) {
    loadingEl.textContent = message;
  }
}

/**
 * Hide the loading screen.
 */
function hideLoading(): void {
  if (loadingEl) {
    loadingEl.style.display = 'none';
  }
}

/**
 * Show loading error.
 */
function showLoadingError(message: string): void {
  if (loadingEl) {
    loadingEl.textContent = message;
    loadingEl.style.color = '#ff6b6b';
  }
}

// ============================================================================
// CANVAS SETUP
// ============================================================================

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
if (!canvas) {
  throw new Error('Canvas element not found');
}

const ctx = canvas.getContext('2d')!;
if (!ctx) {
  throw new Error('Could not get canvas context');
}

// ============================================================================
// GAME STATE
// ============================================================================

let gameState: GameState;
let feedbackState = createFeedbackState();
let animationFrameId: number | null = null;

/**
 * Initialize or restart the game with a level.
 */
function initGame(level: LevelData): void {
  gameState = createGameState(level);
  feedbackState = createFeedbackState();
  resizeCanvas(canvas, gameState.grid);
  renderGame();
  console.log(`Loaded level: ${level.name}`);
}

/**
 * Render the game with any active feedback animations.
 */
function renderGame(): void {
  render(ctx, gameState);

  // Render invalid move feedback if active
  if (feedbackState.active && feedbackState.direction) {
    const progress = getFeedbackProgress(feedbackState);
    renderInvalidMoveFeedback(
      ctx,
      gameState.player.position,
      feedbackState.direction,
      progress
    );
  }
}

/**
 * Animation loop for feedback effects.
 */
function animationLoop(): void {
  if (feedbackState.active) {
    feedbackState = updateFeedback(feedbackState);
    renderGame();

    if (feedbackState.active) {
      animationFrameId = requestAnimationFrame(animationLoop);
    } else {
      animationFrameId = null;
    }
  }
}

/**
 * Start feedback animation.
 */
function showInvalidMoveFeedback(direction: Direction): void {
  feedbackState = triggerFeedback(feedbackState, direction);

  // Start animation loop if not already running
  if (animationFrameId === null) {
    animationFrameId = requestAnimationFrame(animationLoop);
  }
}

/**
 * Process a player action.
 */
function handleAction(action: Action): void {
  // Don't process actions if levels aren't loaded
  if (!levelsLoaded || LEVELS.length === 0) return;

  // Don't process actions if game is over (except restart)
  if (gameState.status !== 'playing' && action.type !== 'restart') {
    return;
  }

  if (action.type === 'restart') {
    initGame(LEVELS[currentLevelIndex]);
    return;
  }

  // Validate the action first
  const validation = validateAction(gameState, action);

  if (!validation.valid) {
    // Show feedback for invalid moves
    if (action.type === 'move') {
      showInvalidMoveFeedback(action.direction);
      console.log(`Invalid move: ${validation.reason}`);
    }
    return;
  }

  // Apply action and resolve turn
  const newState = applyAction(gameState, action);

  // If state changed, resolve turn and re-render
  if (newState !== gameState) {
    gameState = resolveTurn(newState);
    renderGame();

    // Log state changes for debugging
    console.log(
      `Turn ${gameState.turnCount}: Player at (${gameState.player.position.x}, ${gameState.player.position.y}), Energy: ${gameState.energy}`
    );

    if (gameState.status === 'won') {
      console.log('Level complete!');
    } else if (gameState.status === 'lost') {
      console.log('Game over!');
    }
  }
}

/**
 * Switch to the next level.
 */
function nextLevel(): void {
  if (!levelsLoaded || LEVELS.length === 0) return;
  currentLevelIndex = (currentLevelIndex + 1) % LEVELS.length;
  initGame(LEVELS[currentLevelIndex]);
}

/**
 * Switch to the previous level.
 */
function prevLevel(): void {
  if (!levelsLoaded || LEVELS.length === 0) return;
  currentLevelIndex = (currentLevelIndex - 1 + LEVELS.length) % LEVELS.length;
  initGame(LEVELS[currentLevelIndex]);
}

// ============================================================================
// INPUT HANDLING
// ============================================================================

const inputHandler = new InputHandler({
  onAction: handleAction,
  onInvalidMove: showInvalidMoveFeedback,
  onNextLevel: nextLevel,
  onPrevLevel: prevLevel,
  debounceTime: 80,
  swipeThreshold: 30,
});

// Attach input handlers to canvas (for touch) and document (for keyboard)
inputHandler.attach(canvas);

// ============================================================================
// START GAME
// ============================================================================

/**
 * Load all levels and start the game.
 */
async function startGame(): Promise<void> {
  setLoadingMessage('Loading levels...');

  try {
    const result = await loadAllLevels();

    if (result.levels.length === 0) {
      showLoadingError('No levels found! Check content/levels/ directory.');
      console.error('No levels loaded. Errors:', result.errors);
      return;
    }

    // Store loaded levels
    LEVELS = result.levels;
    levelsLoaded = true;

    // Log any loading errors (but continue with available levels)
    if (result.errors.length > 0) {
      console.warn('Some levels failed to load:', result.errors);
    }

    console.log(`Loaded ${LEVELS.length} levels:`, LEVELS.map((l) => l.id).join(', '));

    // Hide loading screen and start
    hideLoading();

    // Initialize with first level
    initGame(LEVELS[currentLevelIndex]);

    console.log('Signal Path ready!');
    console.log('Controls: Arrow keys or WASD to move, SPACE to wait, R to restart');
    console.log('Level navigation: N = next level, P = previous level');
    console.log('Touch: Swipe to move, tap to wait');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    showLoadingError(`Failed to start game: ${message}`);
    console.error('Game startup error:', error);
  }
}

// Start the game
startGame();
