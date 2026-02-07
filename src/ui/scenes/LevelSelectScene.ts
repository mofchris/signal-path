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
const CELL_WIDTH = 80;
const CELL_HEIGHT = 80;
const CELL_GAP = 12;
const GRID_TOP = 100;

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
    canvas.width = Math.max(480, gridWidth + 60);
    canvas.height = GRID_TOP + rows * (CELL_HEIGHT + CELL_GAP) + 80;

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

    // Background
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.goal;
    ctx.font = 'bold 24px monospace';
    ctx.fillText('SELECT LEVEL', w / 2, 45);

    // Subtitle with completion count
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px monospace';
    ctx.fillText(`${completed}/${levels.length} completed`, w / 2, 68);

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
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Arrows to navigate, Enter to play, Esc for menu', w / 2, h - 25);

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
      // Locked: dimmed background
      ctx.fillStyle = 'rgba(30, 30, 40, 0.8)';
      ctx.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);

      ctx.strokeStyle = '#3a3a4a';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, CELL_WIDTH, CELL_HEIGHT);

      // Lock indicator
      ctx.textAlign = 'center';
      ctx.fillStyle = '#555';
      ctx.font = 'bold 22px monospace';
      ctx.fillText('?', x + CELL_WIDTH / 2, y + 35);

      ctx.font = '9px monospace';
      ctx.fillStyle = '#555';
      ctx.fillText('LOCKED', x + CELL_WIDTH / 2, y + CELL_HEIGHT - 10);

      ctx.textAlign = 'left';
      return;
    }

    // Cell background
    ctx.fillStyle = selected ? 'rgba(74, 222, 128, 0.15)' : COLORS.tile;
    ctx.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);

    // Cell border
    ctx.strokeStyle = selected ? COLORS.goal : COLORS.tileOutline;
    ctx.lineWidth = selected ? 2 : 1;
    ctx.strokeRect(x, y, CELL_WIDTH, CELL_HEIGHT);

    // Level number
    ctx.textAlign = 'center';
    ctx.fillStyle = selected ? COLORS.goal : COLORS.hudText;
    ctx.font = 'bold 22px monospace';
    ctx.fillText(String(index + 1), x + CELL_WIDTH / 2, y + 35);

    // Level name (truncate if needed)
    ctx.font = '9px monospace';
    ctx.fillStyle = selected ? COLORS.goal : '#9ca3af';
    const displayName = name.length > 10 ? name.slice(0, 9) + '...' : name;
    ctx.fillText(displayName, x + CELL_WIDTH / 2, y + CELL_HEIGHT - 10);

    // Completion badge (green checkmark in top-right corner)
    if (completed) {
      ctx.fillStyle = COLORS.goal;
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'right';
      ctx.fillText('*', x + CELL_WIDTH - 6, y + 16);
    }

    ctx.textAlign = 'left';
  }
}
