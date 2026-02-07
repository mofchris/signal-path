/**
 * Game Scene
 *
 * The main gameplay scene. Handles:
 * - Game state management for the active level
 * - Input → action processing
 * - Movement animation and invalid move feedback
 * - Sound effects
 * - Rendering the game grid, entities, and HUD
 *
 * Extracted from the original monolithic main.ts.
 */

import { createGameState } from '../../core/state';
import { applyAction, validateAction } from '../../core/actions';
import { resolveTurn } from '../../core/rules';
import { render, resizeCanvas, renderInvalidMoveFeedback, renderPlayerAt } from '../renderer';
import { createFeedbackState, triggerFeedback, updateFeedback, getFeedbackProgress } from '../input';
import {
  createAnimationState,
  startAnimation,
  updateAnimation,
  getVisualPosition,
  isAnimating,
} from '../animation';
import {
  initAudio,
  toggleSound,
  playMoveSound,
  playInvalidSound,
  playCollectSound,
  playUnlockSound,
  playWinSound,
  playLoseSound,
  playUndoSound,
} from '../sound';
import { recordLevelCompletion, isLevelUnlocked } from '../../core/serialization';
import type { Scene, SceneContext } from './types';
import type { GameState, Action, Direction, Interactable, LevelData } from '../../core/types';
import type { FeedbackState } from '../input';
import type { AnimationState } from '../animation';

export class GameScene implements Scene {
  private context!: SceneContext;
  private gameState!: GameState;
  private feedbackState: FeedbackState = createFeedbackState();
  private animationState: AnimationState = createAnimationState();
  private animationFrameId: number | null = null;
  private currentLevelIndex: number = 0;

  enter(context: SceneContext): void {
    this.context = context;

    // Read level index from scene data
    const levelIndex = context.sceneManager.getData<number>('levelIndex');
    if (levelIndex !== undefined) {
      this.currentLevelIndex = levelIndex;
    }

    const level = context.levels[this.currentLevelIndex];
    if (!level) {
      console.error('GameScene: No level at index', this.currentLevelIndex);
      return;
    }

    this.initGame(level);
  }

  exit(): void {
    // Cancel any running animation frame
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  update(_dt: number): void {
    let needsRender = false;

    // Update feedback animation
    if (this.feedbackState.active) {
      this.feedbackState = updateFeedback(this.feedbackState);
      needsRender = true;
    }

    // Update movement animation
    if (isAnimating(this.animationState)) {
      this.animationState = updateAnimation(this.animationState);
      needsRender = true;
    }

    if (needsRender) {
      this.renderGame();
    }
  }

  render(_ctx: CanvasRenderingContext2D): void {
    this.renderGame();
  }

  handleInput(key: string, event: KeyboardEvent): void {
    // Initialize audio on first user interaction (browser policy)
    const soundState = this.context.getSoundState();
    if (!soundState.initialized) {
      this.context.setSoundState(initAudio(soundState));
    }

    // Sound toggle
    if (key === 'm') {
      const newSoundState = toggleSound(this.context.getSoundState());
      this.context.setSoundState(newSoundState);
      // Persist sound preference
      const save = this.context.getSaveData();
      this.context.setSaveData({
        ...save,
        settings: { ...save.settings, soundEnabled: newSoundState.enabled },
      });
      return;
    }

    // Restart is always available
    if (key === 'r') {
      this.handleAction({ type: 'restart' });
      return;
    }

    // Game over specific controls
    if (this.gameState.status !== 'playing') {
      if (key === 'n' && this.gameState.status === 'won') {
        this.nextLevel();
      } else if (key === 'l' || key === 'escape') {
        this.context.sceneManager.switchTo('levelSelect');
      }
      return;
    }

    // Movement
    const directionMap: Record<string, Direction> = {
      arrowup: 'up', arrowdown: 'down', arrowleft: 'left', arrowright: 'right',
      w: 'up', s: 'down', a: 'left', d: 'right',
    };

    const direction = directionMap[key];
    if (direction) {
      event.preventDefault();
      this.handleAction({ type: 'move', direction });
      return;
    }

    // Other actions
    if (key === ' ') {
      event.preventDefault();
      this.handleAction({ type: 'wait' });
    } else if (key === 'u') {
      this.handleAction({ type: 'undo' });
    } else if (key === 'n') {
      this.nextLevel();
    } else if (key === 'p') {
      this.prevLevel();
    } else if (key === 'escape') {
      this.context.sceneManager.switchTo('levelSelect');
    }
  }

  // ===========================================================================
  // PRIVATE METHODS
  // ===========================================================================

  private initGame(level: LevelData): void {
    this.gameState = createGameState(level);
    this.feedbackState = createFeedbackState();
    this.animationState = createAnimationState();
    resizeCanvas(this.context.canvas, this.gameState.grid);
    this.renderGame();
  }

  private renderGame(): void {
    const ctx = this.context.ctx;

    if (isAnimating(this.animationState)) {
      render(ctx, this.gameState, { skipPlayer: true });
      const visualPos = getVisualPosition(this.animationState, this.gameState.player.position);
      renderPlayerAt(ctx, visualPos);
    } else {
      render(ctx, this.gameState);
    }

    // Render invalid move feedback if active
    if (this.feedbackState.active && this.feedbackState.direction) {
      const progress = getFeedbackProgress(this.feedbackState);
      renderInvalidMoveFeedback(ctx, this.gameState.player.position, this.feedbackState.direction, progress);
    }
  }

  private showInvalidMoveFeedback(direction: Direction): void {
    this.feedbackState = triggerFeedback(this.feedbackState, direction);
  }

  private wasKeyCollected(before: Interactable[], after: Interactable[]): boolean {
    for (const interactable of before) {
      if (interactable.state.type === 'key' && !interactable.state.collected) {
        const afterItem = after.find((i) => i.id === interactable.id);
        if (afterItem && afterItem.state.type === 'key' && afterItem.state.collected) {
          return true;
        }
      }
    }
    return false;
  }

  private wasDoorUnlocked(before: Interactable[], after: Interactable[]): boolean {
    for (const interactable of before) {
      if (interactable.state.type === 'door' && interactable.state.locked) {
        const afterItem = after.find((i) => i.id === interactable.id);
        if (afterItem && afterItem.state.type === 'door' && !afterItem.state.locked) {
          return true;
        }
      }
    }
    return false;
  }

  private handleAction(action: Action): void {
    if (this.gameState.status !== 'playing' && action.type !== 'restart') {
      return;
    }

    if (action.type === 'restart') {
      this.initGame(this.context.levels[this.currentLevelIndex]);
      return;
    }

    const validation = validateAction(this.gameState, action);

    if (!validation.valid) {
      if (action.type === 'move') {
        this.showInvalidMoveFeedback(action.direction);
        playInvalidSound(this.context.getSoundState());
      }
      return;
    }

    const fromPosition = { ...this.gameState.player.position };
    const beforeInteractables = this.gameState.interactables;

    const newState = applyAction(this.gameState, action);

    if (newState !== this.gameState) {
      const resolvedState = resolveTurn(newState);
      const toPosition = resolvedState.player.position;

      // Start movement animation if position changed
      if (action.type === 'move' && (fromPosition.x !== toPosition.x || fromPosition.y !== toPosition.y)) {
        this.animationState = startAnimation(this.animationState, fromPosition, toPosition);
      }

      // Play sounds
      const soundState = this.context.getSoundState();
      if (action.type === 'move') {
        const keyCollected = this.wasKeyCollected(beforeInteractables, resolvedState.interactables);
        const doorUnlocked = this.wasDoorUnlocked(beforeInteractables, resolvedState.interactables);

        if (keyCollected) {
          playCollectSound(soundState);
        } else if (doorUnlocked) {
          playUnlockSound(soundState);
        } else if (fromPosition.x !== toPosition.x || fromPosition.y !== toPosition.y) {
          playMoveSound(soundState);
        }
      } else if (action.type === 'undo') {
        playUndoSound(soundState);
      }

      this.gameState = resolvedState;
      this.renderGame();

      if (this.gameState.status === 'won') {
        // Persist completion progress
        const levelId = this.context.levels[this.currentLevelIndex].id;
        const updated = recordLevelCompletion(
          this.context.getSaveData(),
          levelId,
          this.gameState.turnCount,
          this.gameState.energy,
        );
        this.context.setSaveData(updated);

        playWinSound(soundState);
      } else if (this.gameState.status === 'lost') {
        playLoseSound(soundState);
      }
    }
  }

  private nextLevel(): void {
    const nextIndex = this.currentLevelIndex + 1;
    if (nextIndex >= this.context.levels.length) return;

    const levelIds = this.context.levels.map((l) => l.id);
    if (!isLevelUnlocked(this.context.getSaveData(), nextIndex, levelIds)) return;

    this.currentLevelIndex = nextIndex;
    this.context.sceneManager.setData('levelIndex', this.currentLevelIndex);
    this.initGame(this.context.levels[this.currentLevelIndex]);
  }

  private prevLevel(): void {
    if (this.currentLevelIndex > 0) {
      this.currentLevelIndex--;
      this.context.sceneManager.setData('levelIndex', this.currentLevelIndex);
      this.initGame(this.context.levels[this.currentLevelIndex]);
    }
  }
}
