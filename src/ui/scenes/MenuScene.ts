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
    canvas.width = 600;
    canvas.height = 500;

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

    // Background — pure black arcade screen
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, w, h);

    // Top neon accent line
    ctx.fillStyle = COLORS.player;
    ctx.fillRect(w / 2 - 175, 69, 350, 2);

    // Title — arcade neon
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.goal;
    ctx.font = 'bold 45px monospace';
    ctx.fillText('SIGNAL PATH', w / 2, 125);

    // Subtitle
    ctx.fillStyle = COLORS.hudTurn;
    ctx.font = '15px monospace';
    ctx.fillText('A TURN-BASED TACTICAL PUZZLE', w / 2, 160);

    // Bottom neon accent line
    ctx.fillStyle = COLORS.player;
    ctx.fillRect(w / 2 - 175, 178, 350, 2);

    // Menu options
    const startY = 250;
    const spacing = 62;

    for (let i = 0; i < MENU_OPTIONS.length; i++) {
      const y = startY + i * spacing;
      const isSelected = i === this.selectedIndex;

      if (isSelected) {
        // Neon selection box
        ctx.fillStyle = 'rgba(0, 255, 136, 0.1)';
        ctx.fillRect(w / 2 - 150, y - 22, 300, 44);

        ctx.strokeStyle = COLORS.goal;
        ctx.lineWidth = 2;
        ctx.strokeRect(w / 2 - 150, y - 22, 300, 44);

        // Selection indicator
        ctx.fillStyle = COLORS.goal;
        ctx.font = 'bold 22px monospace';
        ctx.fillText('> ' + MENU_OPTIONS[i].label.toUpperCase() + ' <', w / 2, y + 8);
      } else {
        ctx.fillStyle = '#555577';
        ctx.font = '22px monospace';
        ctx.fillText(MENU_OPTIONS[i].label.toUpperCase(), w / 2, y + 8);
      }
    }

    // "PRESS START" vibe
    ctx.fillStyle = '#333355';
    ctx.font = '14px monospace';
    ctx.fillText('PRESS ENTER TO SELECT', w / 2, h - 50);

    // CRT scanline hint on menu
    ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 2);
    }

    ctx.textAlign = 'left';
  }
}
