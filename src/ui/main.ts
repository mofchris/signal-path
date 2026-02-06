/**
 * Signal Path - Main Entry Point
 *
 * Initializes the scene system and game loop.
 * All game logic is delegated to scenes via the SceneManager.
 *
 * Architecture:
 * - Loads levels from JSON files
 * - Creates SceneManager with all scenes registered
 * - Runs a requestAnimationFrame game loop
 * - Delegates input, update, and render to the active scene
 */

import { loadAllLevels } from '../content/loader';
import { createSoundState } from './sound';
import { SceneManager, MenuScene, GameScene, LevelSelectScene, GameOverScene } from './scenes';
import type { SceneContext } from './scenes';
import type { SoundState } from './sound';
import type { LevelData } from '../core/types';

// ============================================================================
// INITIALIZATION
// ============================================================================

console.log('Signal Path is loading...');

const loadingEl = document.getElementById('loading');

function setLoadingMessage(message: string): void {
  if (loadingEl) {
    loadingEl.textContent = message;
  }
}

function hideLoading(): void {
  if (loadingEl) {
    loadingEl.style.display = 'none';
  }
}

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
// SHARED STATE
// ============================================================================

let soundState: SoundState = createSoundState();

// ============================================================================
// SCENE SYSTEM SETUP
// ============================================================================

const sceneManager = new SceneManager();

// Register all scenes
sceneManager.register('menu', new MenuScene());
sceneManager.register('game', new GameScene());
sceneManager.register('levelSelect', new LevelSelectScene());
sceneManager.register('gameOver', new GameOverScene());

// ============================================================================
// INPUT HANDLING
// ============================================================================

document.addEventListener('keydown', (event: KeyboardEvent) => {
  const key = event.key.toLowerCase();
  sceneManager.handleInput(key, event);
});

// Touch support: swipe → direction key mapping
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;

canvas.addEventListener('touchstart', (e: TouchEvent) => {
  if (e.touches.length !== 1) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  touchStartTime = Date.now();
}, { passive: false });

canvas.addEventListener('touchend', (e: TouchEvent) => {
  if (e.changedTouches.length !== 1) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  const elapsed = Date.now() - touchStartTime;

  if (elapsed > 500) return;

  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const threshold = 30;

  if (absDx < threshold && absDy < threshold) {
    // Tap → treat as space
    sceneManager.handleInput(' ', new KeyboardEvent('keydown', { key: ' ' }));
    return;
  }

  e.preventDefault();

  let key: string;
  if (absDx > absDy) {
    key = dx > 0 ? 'arrowright' : 'arrowleft';
  } else {
    key = dy > 0 ? 'arrowdown' : 'arrowup';
  }

  sceneManager.handleInput(key, new KeyboardEvent('keydown', { key }));
}, { passive: false });

// ============================================================================
// GAME LOOP
// ============================================================================

let lastTime = 0;

function gameLoop(time: number): void {
  const dt = time - lastTime;
  lastTime = time;

  sceneManager.update(dt);

  requestAnimationFrame(gameLoop);
}

// ============================================================================
// START GAME
// ============================================================================

async function startGame(): Promise<void> {
  setLoadingMessage('Loading levels...');

  try {
    const result = await loadAllLevels();

    if (result.levels.length === 0) {
      showLoadingError('No levels found! Check content/levels/ directory.');
      console.error('No levels loaded. Errors:', result.errors);
      return;
    }

    const levels: LevelData[] = result.levels;

    if (result.errors.length > 0) {
      console.warn('Some levels failed to load:', result.errors);
    }

    console.log(`Loaded ${levels.length} levels:`, levels.map((l) => l.id).join(', '));

    // Create shared context
    const context: SceneContext = {
      sceneManager,
      canvas,
      ctx,
      levels,
      getSoundState: () => soundState,
      setSoundState: (s: SoundState) => { soundState = s; },
    };

    sceneManager.setContext(context);

    // Hide loading screen
    hideLoading();

    // Start with menu scene
    sceneManager.switchTo('menu');

    // Start game loop
    requestAnimationFrame(gameLoop);

    console.log('Signal Path ready!');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    showLoadingError(`Failed to start game: ${message}`);
    console.error('Game startup error:', error);
  }
}

startGame();
