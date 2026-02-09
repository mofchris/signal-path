/**
 * Level Select Scene
 *
 * Grid display of available levels.
 * Shows level number, name, lock/unlock state, and completion badges.
 * Keyboard navigable with arrow keys.
 */

import { COLORS } from '../renderer';
import { isLevelUnlocked, getLevelProgress, getCompletedCount } from '../../core/serialization';
import type { Scene, SceneContext } from './types';

/** Grid layout constants */
const COLS = 5;
const CELL_WIDTH = 100;
const CELL_HEIGHT = 100;
const CELL_GAP = 15;
const GRID_TOP = 125;

export class LevelSelectScene implements Scene {
  private context!: SceneContext;
  private selectedIndex: number = 0;

  enter(context: SceneContext): void {
    this.context = context;

    // Restore selection to current level if coming back from game
    const levelIndex = context.sceneManager.getData<number>('levelIndex');
    if (levelIndex !== undefined) {
      this.selectedIndex = levelIndex;
    }

    // Size canvas
    const canvas = context.canvas;
    const rows = Math.ceil(context.levels.length / COLS);
    const gridWidth = COLS * (CELL_WIDTH + CELL_GAP) - CELL_GAP;
    canvas.width = Math.max(600, gridWidth + 75);
    canvas.height = GRID_TOP + rows * (CELL_HEIGHT + CELL_GAP) + 100;

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
    const total = this.context.levels.length;
    if (total === 0) return;

    switch (key) {
      case 'arrowleft':
      case 'a':
        event.preventDefault();
        if (this.selectedIndex > 0) {
          this.selectedIndex--;
          this.renderScene();
        }
        break;

      case 'arrowright':
      case 'd':
        event.preventDefault();
        if (this.selectedIndex < total - 1) {
          this.selectedIndex++;
          this.renderScene();
        }
        break;

      case 'arrowup':
      case 'w':
        event.preventDefault();
        if (this.selectedIndex >= COLS) {
          this.selectedIndex -= COLS;
          this.renderScene();
        }
        break;

      case 'arrowdown':
      case 's':
        event.preventDefault();
        if (this.selectedIndex + COLS < total) {
          this.selectedIndex += COLS;
          this.renderScene();
        }
        break;

      case 'enter':
      case ' ': {
        event.preventDefault();
        // Block selection of locked levels
        const levelIds = this.context.levels.map((l) => l.id);
        if (!isLevelUnlocked(this.context.getSaveData(), this.selectedIndex, levelIds)) {
          return;
        }
        this.context.sceneManager.setData('levelIndex', this.selectedIndex);
        this.context.sceneManager.switchTo('game');
        break;
      }

      case 'escape':
        this.context.sceneManager.switchTo('menu');
        break;
    }
  }

  private renderScene(): void {
    const ctx = this.context.ctx;
    const canvas = this.context.canvas;
    const w = canvas.width;
    const h = canvas.height;
    const levels = this.context.levels;
    const saveData = this.context.getSaveData();
    const levelIds = levels.map((l) => l.id);
    const completed = getCompletedCount(saveData);

    // Background — black arcade screen
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, w, h);

    // Title — arcade style
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.hudTurn;
    ctx.font = 'bold 30px monospace';
    ctx.fillText('SELECT STAGE', w / 2, 56);

    // Completion count
    ctx.fillStyle = COLORS.goal;
    ctx.font = '15px monospace';
    ctx.fillText(`${completed}/${levels.length} CLEARED`, w / 2, 85);

    // Neon accent line
    ctx.fillStyle = COLORS.hudTurn;
    ctx.fillRect(w / 2 - 125, 98, 250, 2);

    // Level grid
    const gridWidth = COLS * (CELL_WIDTH + CELL_GAP) - CELL_GAP;
    const gridLeft = (w - gridWidth) / 2;

    for (let i = 0; i < levels.length; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = gridLeft + col * (CELL_WIDTH + CELL_GAP);
      const y = GRID_TOP + row * (CELL_HEIGHT + CELL_GAP);
      const isSelected = i === this.selectedIndex;
      const unlocked = isLevelUnlocked(saveData, i, levelIds);
      const progress = getLevelProgress(saveData, levels[i].id);

      this.renderLevelCell(ctx, x, y, i, levels[i].name, isSelected, unlocked, progress.completed);
    }

    // Controls hint
    ctx.fillStyle = '#333355';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ARROWS NAVIGATE   ENTER PLAY   ESC MENU', w / 2, h - 31);

    ctx.textAlign = 'left';
  }

  private renderLevelCell(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    index: number,
    name: string,
    selected: boolean,
    unlocked: boolean,
    completed: boolean,
  ): void {
    if (!unlocked) {
      // Locked: dark cell
      ctx.fillStyle = '#050510';
      ctx.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);

      ctx.strokeStyle = '#1a1a2a';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, CELL_WIDTH, CELL_HEIGHT);

      // Lock indicator
      ctx.textAlign = 'center';
      ctx.fillStyle = '#333355';
      ctx.font = 'bold 28px monospace';
      ctx.fillText('?', x + CELL_WIDTH / 2, y + 44);

      ctx.font = '11px monospace';
      ctx.fillStyle = '#333355';
      ctx.fillText('LOCKED', x + CELL_WIDTH / 2, y + CELL_HEIGHT - 12);

      ctx.textAlign = 'left';
      return;
    }

    // Cell background
    ctx.fillStyle = selected ? 'rgba(0, 255, 136, 0.08)' : COLORS.tile;
    ctx.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);

    // Neon cell border
    ctx.strokeStyle = selected ? COLORS.goal : '#1a1a3a';
    ctx.lineWidth = selected ? 2 : 1;
    ctx.strokeRect(x, y, CELL_WIDTH, CELL_HEIGHT);

    // Level number
    ctx.textAlign = 'center';
    ctx.fillStyle = selected ? COLORS.goal : COLORS.hudText;
    ctx.font = 'bold 28px monospace';
    ctx.fillText(String(index + 1).padStart(2, '0'), x + CELL_WIDTH / 2, y + 44);

    // Level name (truncate if needed)
    ctx.font = '11px monospace';
    ctx.fillStyle = selected ? COLORS.goal : '#555577';
    const displayName = name.length > 12 ? name.slice(0, 11) + '...' : name;
    ctx.fillText(displayName, x + CELL_WIDTH / 2, y + CELL_HEIGHT - 12);

    // Completion badge — neon green dot
    if (completed) {
      ctx.fillStyle = COLORS.goal;
      ctx.beginPath();
      ctx.arc(x + CELL_WIDTH - 12, y + 12, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.textAlign = 'left';
  }
}
