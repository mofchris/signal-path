/**
 * Signal Path - Main Entry Point
 *
 * This is the UI layer entry point for the game. It's responsible for:
 * - Setting up the canvas rendering context
 * - Loading level data
 * - Creating initial game state
 * - Rendering the game
 * - Handling user input (Step 8)
 *
 * Architecture note:
 * - This file is part of the UI layer (src/ui/)
 * - UI layer imports from core (src/core/)
 * - All game logic lives in core; UI handles presentation and input
 */

import { createGameState } from '../core/state';
import { applyAction } from '../core/actions';
import { resolveTurn } from '../core/rules';
import { render, resizeCanvas } from './renderer';
import type { GameState, Action, LevelData } from '../core/types';

// ============================================================================
// LEVEL DATA (Temporary - will be loaded from JSON in Step 9)
// ============================================================================

/**
 * First level data embedded for Step 7 testing.
 * In Step 9, this will be loaded from content/levels/01_first_steps.json
 */
const FIRST_LEVEL: LevelData = {
  id: '01_first_steps',
  name: 'First Steps',
  version: '1.0.0',
  width: 5,
  height: 5,
  playerStart: { x: 0, y: 0 },
  goal: { x: 4, y: 4 },
  energy: 12,
  description: 'Welcome to Signal Path! Navigate the drone to the goal.',
};

/**
 * Second level with hazards for testing.
 */
const HAZARD_LEVEL: LevelData = {
  id: '02_hazards',
  name: 'Hazard Warning',
  version: '1.0.0',
  width: 5,
  height: 5,
  playerStart: { x: 0, y: 0 },
  goal: { x: 4, y: 4 },
  energy: 15,
  hazards: [
    { id: 'spike1', x: 2, y: 0, type: 'spike' },
    { id: 'spike2', x: 2, y: 1, type: 'spike' },
    { id: 'laser1', x: 1, y: 2, type: 'laser' },
    { id: 'fire1', x: 3, y: 3, type: 'fire' },
  ],
  tiles: [
    { x: 2, y: 2, type: 'wall' },
  ],
};

/**
 * Third level with keys and doors for testing.
 */
const KEY_DOOR_LEVEL: LevelData = {
  id: '03_keys',
  name: 'Lock and Key',
  version: '1.0.0',
  width: 5,
  height: 5,
  playerStart: { x: 0, y: 0 },
  goal: { x: 4, y: 4 },
  energy: 20,
  interactables: [
    { id: 'key1', x: 1, y: 0, type: 'key', color: 'red' },
    { id: 'door1', x: 3, y: 0, type: 'door', color: 'red' },
    { id: 'key2', x: 0, y: 3, type: 'key', color: 'blue' },
    { id: 'door2', x: 4, y: 3, type: 'door', color: 'blue' },
  ],
  tiles: [
    { x: 2, y: 1, type: 'wall' },
    { x: 2, y: 2, type: 'wall' },
    { x: 2, y: 3, type: 'wall' },
  ],
};

// Available levels for cycling
const LEVELS = [FIRST_LEVEL, HAZARD_LEVEL, KEY_DOOR_LEVEL];
let currentLevelIndex = 0;

// ============================================================================
// INITIALIZATION
// ============================================================================

console.log('Signal Path is loading...');

// Hide the loading message
const loadingEl = document.getElementById('loading');
if (loadingEl) {
  loadingEl.style.display = 'none';
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

/**
 * Initialize or restart the game with a level.
 */
function initGame(level: LevelData): void {
  gameState = createGameState(level);
  resizeCanvas(canvas, gameState.grid);
  render(ctx, gameState);
  console.log(`Loaded level: ${level.name}`);
}

/**
 * Process a player action.
 */
function handleAction(action: Action): void {
  // Don't process actions if game is over (except restart)
  if (gameState.status !== 'playing' && action.type !== 'restart') {
    return;
  }

  if (action.type === 'restart') {
    initGame(LEVELS[currentLevelIndex]);
    return;
  }

  // Apply action and resolve turn
  const newState = applyAction(gameState, action);

  // If state changed, resolve turn and re-render
  if (newState !== gameState) {
    gameState = resolveTurn(newState);
    render(ctx, gameState);

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
  currentLevelIndex = (currentLevelIndex + 1) % LEVELS.length;
  initGame(LEVELS[currentLevelIndex]);
}

// ============================================================================
// INPUT HANDLING (Basic - Full implementation in Step 8)
// ============================================================================

/**
 * Handle keyboard input.
 */
function handleKeyDown(event: KeyboardEvent): void {
  let action: Action | null = null;

  switch (event.key.toLowerCase()) {
    // Arrow keys
    case 'arrowup':
      action = { type: 'move', direction: 'up' };
      break;
    case 'arrowdown':
      action = { type: 'move', direction: 'down' };
      break;
    case 'arrowleft':
      action = { type: 'move', direction: 'left' };
      break;
    case 'arrowright':
      action = { type: 'move', direction: 'right' };
      break;

    // WASD
    case 'w':
      action = { type: 'move', direction: 'up' };
      break;
    case 's':
      action = { type: 'move', direction: 'down' };
      break;
    case 'a':
      action = { type: 'move', direction: 'left' };
      break;
    case 'd':
      action = { type: 'move', direction: 'right' };
      break;

    // Other actions
    case ' ':
      action = { type: 'wait' };
      break;
    case 'r':
      action = { type: 'restart' };
      break;

    // Level switching (for testing)
    case 'n':
      nextLevel();
      return;
  }

  if (action) {
    event.preventDefault();
    handleAction(action);
  }
}

// Add keyboard listener
document.addEventListener('keydown', handleKeyDown);

// ============================================================================
// START GAME
// ============================================================================

// Initialize with first level
initGame(LEVELS[currentLevelIndex]);

console.log('Signal Path ready!');
console.log('Controls: Arrow keys or WASD to move, SPACE to wait, R to restart, N for next level');
