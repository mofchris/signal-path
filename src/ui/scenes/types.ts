/**
 * Scene System Types
 *
 * Defines the Scene interface and SceneContext used by all scenes.
 * This is the foundation for managing different game screens
 * (menu, gameplay, level select, game over).
 *
 * Architecture:
 * - Scenes are UI-layer only (may import from core)
 * - Each scene manages its own rendering and input
 * - SceneManager handles transitions between scenes
 */

import type { LevelData } from '../../core/types';
import type { SaveData } from '../../core/serialization';
import type { SoundState } from '../sound';
import type { SceneManager } from './SceneManager';

// ============================================================================
// SCENE INTERFACE
// ============================================================================

/**
 * A Scene represents a distinct game screen (menu, gameplay, level select, etc.).
 *
 * Lifecycle:
 * 1. enter() - called when scene becomes active
 * 2. update()/render() - called each frame while active
 * 3. handleInput() - called on keyboard events while active
 * 4. exit() - called when scene is being replaced
 */
export interface Scene {
  /** Called when scene becomes active. Initialize state here. */
  enter(context: SceneContext): void;

  /** Called when scene is being replaced. Clean up here. */
  exit(): void;

  /** Called each frame. Update animations and time-based state. */
  update(dt: number): void;

  /** Called each frame after update. Draw to canvas. */
  render(ctx: CanvasRenderingContext2D): void;

  /** Called on keyboard events. Handle scene-specific input. */
  handleInput(key: string, event: KeyboardEvent): void;
}

// ============================================================================
// SCENE CONTEXT
// ============================================================================

/**
 * Shared context passed to scenes on enter().
 * Contains references to shared resources that scenes need.
 */
export interface SceneContext {
  /** The scene manager (for scene transitions) */
  sceneManager: SceneManager;

  /** The game canvas element */
  canvas: HTMLCanvasElement;

  /** The 2D rendering context */
  ctx: CanvasRenderingContext2D;

  /** All loaded levels */
  levels: LevelData[];

  /** Current sound state (shared across scenes) */
  getSoundState: () => SoundState;

  /** Update sound state */
  setSoundState: (state: SoundState) => void;

  /** Get current save data */
  getSaveData: () => SaveData;

  /** Update and persist save data */
  setSaveData: (data: SaveData) => void;
}

// ============================================================================
// SCENE NAMES
// ============================================================================

/**
 * Known scene names for type-safe transitions.
 */
export type SceneName = 'menu' | 'game' | 'levelSelect' | 'gameOver';
