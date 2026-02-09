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
    canvas.width = 600;
    canvas.height = 450;

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

    // Background — black arcade screen
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, w, h);

    const accentColor = this.status === 'won' ? COLORS.goal : COLORS.hazardSpike;

    // Top neon accent line
    ctx.fillStyle = accentColor;
    ctx.fillRect(w / 2 - 175, 56, 350, 2);

    // Result banner — arcade style
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 35px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      this.status === 'won' ? 'STAGE CLEAR' : 'GAME OVER',
      w / 2,
      100
    );

    // Bottom accent line
    ctx.fillStyle = accentColor;
    ctx.fillRect(w / 2 - 175, 115, 350, 2);

    // Stats
    ctx.fillStyle = COLORS.hudText;
    ctx.font = '18px monospace';

    if (this.status === 'won') {
      ctx.fillText(`TURNS  ${String(this.turnCount).padStart(3, '0')}`, w / 2, 162);
      ctx.fillText(`ENERGY ${String(this.energyRemaining).padStart(3, '0')}`, w / 2, 194);
    } else {
      const reason = this.energyRemaining <= 0 ? 'ENERGY DEPLETED' : 'HAZARD CONTACT';
      ctx.fillText(reason, w / 2, 162);
      ctx.fillText(`TURNS  ${String(this.turnCount).padStart(3, '0')}`, w / 2, 194);
    }

    // Options
    ctx.font = 'bold 16px monospace';
    const options: string[] = [];

    if (this.status === 'won' && this.levelIndex < this.context.levels.length - 1) {
      options.push('[ N ]  NEXT STAGE');
    }
    options.push('[ R ]  RETRY');
    options.push('[ L ]  STAGE SELECT');
    options.push('[ ESC ]  MENU');

    const optionStartY = 250;
    const optionSpacing = 35;

    for (let i = 0; i < options.length; i++) {
      ctx.fillStyle = i === 0 ? accentColor : '#555577';
      ctx.fillText(options[i], w / 2, optionStartY + i * optionSpacing);
    }

    // CRT scanline hint
    ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 2);
    }

    ctx.textAlign = 'left';
  }
}
