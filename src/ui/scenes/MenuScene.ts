/**
 * Menu Scene
 *
 * Title screen for Signal Path.
 * Shows game title and navigation options.
 * All rendering is Canvas-based (no DOM overlays).
 */

import { COLORS } from '../renderer';
import { isLevelUnlocked, getLevelProgress } from '../../core/serialization';
import type { Scene, SceneContext } from './types';

/** Menu option labels and their scene targets */
const MENU_OPTIONS = [
  { label: 'Start Game', key: 'game' as const },
  { label: 'Level Select', key: 'levelSelect' as const },
] as const;

export class MenuScene implements Scene {
  private context!: SceneContext;
  private selectedIndex: number = 0;

  enter(context: SceneContext): void {
    this.context = context;
    this.selectedIndex = 0;

    // Size canvas for menu screen
    const canvas = context.canvas;
    canvas.width = 480;
    canvas.height = 400;

    this.renderMenu();
  }

  exit(): void {
    // Nothing to clean up
  }

  update(_dt: number): void {
    // No animations on menu
  }

  render(_ctx: CanvasRenderingContext2D): void {
    this.renderMenu();
  }

  handleInput(key: string, event: KeyboardEvent): void {
    switch (key) {
      case 'arrowup':
      case 'w':
        event.preventDefault();
        this.selectedIndex = (this.selectedIndex - 1 + MENU_OPTIONS.length) % MENU_OPTIONS.length;
        this.renderMenu();
        break;

      case 'arrowdown':
      case 's':
        event.preventDefault();
        this.selectedIndex = (this.selectedIndex + 1) % MENU_OPTIONS.length;
        this.renderMenu();
        break;

      case 'enter':
      case ' ':
        event.preventDefault();
        this.selectOption();
        break;

      case 'l':
        this.context.sceneManager.switchTo('levelSelect');
        break;
    }
  }

  private selectOption(): void {
    const option = MENU_OPTIONS[this.selectedIndex];
    if (option.key === 'game') {
      // Find first unlocked-but-not-completed level
      const levels = this.context.levels;
      const levelIds = levels.map((l) => l.id);
      const saveData = this.context.getSaveData();
      let startIndex = 0;
      for (let i = 0; i < levels.length; i++) {
        if (!isLevelUnlocked(saveData, i, levelIds)) break;
        const progress = getLevelProgress(saveData, levels[i].id);
        if (!progress.completed) {
          startIndex = i;
          break;
        }
        // If all completed, default to last level
        startIndex = i;
      }
      this.context.sceneManager.setData('levelIndex', startIndex);
      this.context.sceneManager.switchTo('game');
    } else {
      this.context.sceneManager.switchTo(option.key);
    }
  }

  private renderMenu(): void {
    const ctx = this.context.ctx;
    const canvas = this.context.canvas;
    const w = canvas.width;
    const h = canvas.height;

    // Background
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.goal;
    ctx.font = 'bold 36px monospace';
    ctx.fillText('SIGNAL PATH', w / 2, 100);

    // Subtitle
    ctx.fillStyle = COLORS.hudText;
    ctx.font = '14px monospace';
    ctx.fillText('A Turn-Based Tactical Puzzle', w / 2, 130);

    // Decorative line
    ctx.strokeStyle = COLORS.tileOutline;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 100, 150);
    ctx.lineTo(w / 2 + 100, 150);
    ctx.stroke();

    // Menu options
    const startY = 200;
    const spacing = 50;

    for (let i = 0; i < MENU_OPTIONS.length; i++) {
      const y = startY + i * spacing;
      const isSelected = i === this.selectedIndex;

      if (isSelected) {
        // Selection highlight
        ctx.fillStyle = 'rgba(74, 222, 128, 0.15)';
        ctx.fillRect(w / 2 - 120, y - 18, 240, 36);

        ctx.strokeStyle = COLORS.goal;
        ctx.lineWidth = 1;
        ctx.strokeRect(w / 2 - 120, y - 18, 240, 36);
      }

      ctx.fillStyle = isSelected ? COLORS.goal : COLORS.hudText;
      ctx.font = isSelected ? 'bold 18px monospace' : '18px monospace';
      ctx.fillText(MENU_OPTIONS[i].label, w / 2, y + 6);
    }

    // Controls hint
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px monospace';
    ctx.fillText('Arrow Keys to navigate, Enter to select', w / 2, h - 40);

    ctx.textAlign = 'left';
  }
}
