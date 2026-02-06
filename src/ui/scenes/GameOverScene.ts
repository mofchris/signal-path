/**
 * Game Over Scene
 *
 * Displayed after winning or losing a level.
 * Shows result, stats, and navigation options.
 *
 * Note: Currently the game over overlay is rendered inline by GameScene
 * (via renderer.ts renderGameOver). This scene serves as an alternative
 * standalone screen for when we want a richer post-level experience.
 * For now, GameScene handles win/lose inline and this scene is registered
 * but transitions to it are optional.
 */

import { COLORS } from '../renderer';
import type { Scene, SceneContext } from './types';

export class GameOverScene implements Scene {
  private context!: SceneContext;
  private status: 'won' | 'lost' = 'won';
  private turnCount: number = 0;
  private energyRemaining: number = 0;
  private levelIndex: number = 0;

  enter(context: SceneContext): void {
    this.context = context;

    // Read result data from scene manager
    this.status = context.sceneManager.getData<'won' | 'lost'>('gameResult') ?? 'won';
    this.turnCount = context.sceneManager.getData<number>('turnCount') ?? 0;
    this.energyRemaining = context.sceneManager.getData<number>('energyRemaining') ?? 0;
    this.levelIndex = context.sceneManager.getData<number>('levelIndex') ?? 0;

    // Size canvas
    const canvas = context.canvas;
    canvas.width = 480;
    canvas.height = 360;

    this.renderScene();
  }

  exit(): void {
    // Nothing to clean up
  }

  update(_dt: number): void {
    // No animations
  }

  render(_ctx: CanvasRenderingContext2D): void {
    this.renderScene();
  }

  handleInput(key: string, event: KeyboardEvent): void {
    switch (key) {
      case 'r':
        // Restart same level
        this.context.sceneManager.switchTo('game');
        break;

      case 'n':
        // Next level (only on win)
        if (this.status === 'won' && this.levelIndex < this.context.levels.length - 1) {
          this.context.sceneManager.setData('levelIndex', this.levelIndex + 1);
          this.context.sceneManager.switchTo('game');
        }
        break;

      case 'l':
        this.context.sceneManager.switchTo('levelSelect');
        break;

      case 'escape':
        this.context.sceneManager.switchTo('menu');
        break;

      case 'enter':
      case ' ':
        event.preventDefault();
        if (this.status === 'won' && this.levelIndex < this.context.levels.length - 1) {
          this.context.sceneManager.setData('levelIndex', this.levelIndex + 1);
          this.context.sceneManager.switchTo('game');
        } else {
          this.context.sceneManager.switchTo('levelSelect');
        }
        break;
    }
  }

  private renderScene(): void {
    const ctx = this.context.ctx;
    const canvas = this.context.canvas;
    const w = canvas.width;
    const h = canvas.height;

    // Background
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, w, h);

    // Result banner
    const bannerColor = this.status === 'won' ? COLORS.goal : COLORS.hazardSpike;
    ctx.fillStyle = bannerColor;
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      this.status === 'won' ? 'LEVEL COMPLETE!' : 'MISSION FAILED',
      w / 2,
      80
    );

    // Stats
    ctx.fillStyle = COLORS.hudText;
    ctx.font = '16px monospace';

    if (this.status === 'won') {
      ctx.fillText(`Turns: ${this.turnCount}`, w / 2, 130);
      ctx.fillText(`Energy remaining: ${this.energyRemaining}`, w / 2, 155);
    } else {
      const reason = this.energyRemaining <= 0 ? 'Energy depleted' : 'Hazard contact';
      ctx.fillText(`Reason: ${reason}`, w / 2, 130);
      ctx.fillText(`Turns taken: ${this.turnCount}`, w / 2, 155);
    }

    // Divider
    ctx.strokeStyle = COLORS.tileOutline;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 80, 180);
    ctx.lineTo(w / 2 + 80, 180);
    ctx.stroke();

    // Options
    ctx.font = 'bold 14px monospace';
    const options: string[] = [];

    if (this.status === 'won' && this.levelIndex < this.context.levels.length - 1) {
      options.push('[N] Next Level');
    }
    options.push('[R] Restart');
    options.push('[L] Level Select');
    options.push('[Esc] Menu');

    const optionStartY = 210;
    const optionSpacing = 28;

    for (let i = 0; i < options.length; i++) {
      ctx.fillStyle = i === 0 ? COLORS.goal : COLORS.hudText;
      ctx.fillText(options[i], w / 2, optionStartY + i * optionSpacing);
    }

    ctx.textAlign = 'left';
  }
}
