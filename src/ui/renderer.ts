/**
 * Renderer Module
 *
 * This file handles all Canvas 2D rendering for Signal Path.
 * It translates game state into visual output.
 *
 * Architecture note:
 * - Part of the UI layer (can import from core)
 * - Pure rendering functions (no state mutation)
 * - All drawing uses Canvas 2D API
 *
 * Rendering order (back to front):
 * 1. Background / Grid tiles
 * 2. Goal tile
 * 3. Interactables (keys, doors)
 * 4. Hazards
 * 5. Player
 * 6. HUD overlay
 * 7. Game over screen (if applicable)
 */

import type { GameState, Grid, Tile, Position, Hazard, Interactable, Direction } from '../core/types';
import { DIRECTION_VECTORS } from '../core/types';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Tile size in pixels.
 * All grid calculations are based on this value.
 */
export const TILE_SIZE = 60;

/**
 * HUD height in pixels.
 * Space reserved at the bottom for energy/turn display.
 */
export const HUD_HEIGHT = 75;

/**
 * Padding around the grid.
 */
export const GRID_PADDING = 20;

/**
 * Color palette for the game.
 * Designed for clarity and accessibility.
 */
export const COLORS = {
  // Background — pure black arcade screen
  background: '#000000',

  // Grid — Tron wireframe floor
  tile: '#0a0a18',
  tileOutline: '#1a1a3a',
  wall: '#1a1a2a',

  // Goal — neon green beacon
  goal: '#00ff88',
  goalGlow: 'rgba(0, 255, 136, 0.25)',

  // Player — electric cyan
  player: '#00ccff',
  playerOutline: '#0088cc',

  // Hazards — hot neon
  hazardSpike: '#ff0055',
  hazardLaser: '#ff4400',
  hazardFire: '#ffdd00',
  hazardInactive: '#333355',

  // Interactables — neon keys
  keyRed: '#ff0055',
  keyBlue: '#00ccff',
  keyGreen: '#00ff88',
  keyYellow: '#ffdd00',
  doorLocked: '#555577',
  doorUnlocked: '#8888aa',

  // Feedback
  invalidMove: 'rgba(255, 0, 85, 0.5)',
  validMoveHint: 'rgba(0, 255, 136, 0.15)',

  // HUD — arcade score style
  hudBackground: '#000000',
  hudText: '#ffffff',
  hudEnergy: '#00ff88',
  hudEnergyLow: '#ff0055',
  hudTurn: '#00ccff',

  // Game over — bold neon overlays
  winOverlay: 'rgba(0, 255, 136, 0.9)',
  loseOverlay: 'rgba(255, 0, 85, 0.9)',
  overlayText: '#ffffff',
} as const;

// ============================================================================
// CANVAS SETUP
// ============================================================================

/**
 * Calculate canvas dimensions based on grid size.
 *
 * @param grid - The game grid
 * @returns Object with width and height
 */
export function calculateCanvasSize(grid: Grid): { width: number; height: number } {
  const gridWidth = grid.width * TILE_SIZE;
  const gridHeight = grid.height * TILE_SIZE;

  return {
    width: gridWidth + GRID_PADDING * 2,
    height: gridHeight + GRID_PADDING * 2 + HUD_HEIGHT,
  };
}

/**
 * Resize canvas to fit the grid.
 *
 * @param canvas - The canvas element
 * @param grid - The game grid
 */
export function resizeCanvas(canvas: HTMLCanvasElement, grid: Grid): void {
  const size = calculateCanvasSize(grid);
  canvas.width = size.width;
  canvas.height = size.height;
}

// ============================================================================
// COORDINATE CONVERSION
// ============================================================================

/**
 * Convert grid position to screen (pixel) coordinates.
 * Returns the top-left corner of the tile.
 *
 * @param pos - Grid position
 * @returns Screen coordinates
 */
export function gridToScreen(pos: Position): Position {
  return {
    x: pos.x * TILE_SIZE + GRID_PADDING,
    y: pos.y * TILE_SIZE + GRID_PADDING,
  };
}

/**
 * Convert screen (pixel) coordinates to grid position.
 * Useful for mouse/touch input.
 *
 * @param screenPos - Screen coordinates
 * @returns Grid position (may be out of bounds)
 */
export function screenToGrid(screenPos: Position): Position {
  return {
    x: Math.floor((screenPos.x - GRID_PADDING) / TILE_SIZE),
    y: Math.floor((screenPos.y - GRID_PADDING) / TILE_SIZE),
  };
}

// ============================================================================
// MAIN RENDER FUNCTION
// ============================================================================

/**
 * Render options for customizing what gets rendered.
 */
export interface RenderOptions {
  /** Skip player rendering (for handling animation separately) */
  skipPlayer?: boolean;
}

/**
 * Render the complete game state to the canvas.
 *
 * This is the main entry point for rendering.
 * Call this after every state change to update the display.
 *
 * @param ctx - Canvas 2D rendering context
 * @param state - Current game state
 * @param options - Optional render options
 */
export function render(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  options?: RenderOptions
): void {
  const canvas = ctx.canvas;

  // 1. Clear and draw background
  renderBackground(ctx, canvas.width, canvas.height);

  // 2. Draw grid tiles
  renderGrid(ctx, state.grid);

  // 3. Draw goal
  renderGoal(ctx, state.goal);

  // 4. Draw interactables (keys, doors)
  renderInteractables(ctx, state.interactables);

  // 5. Draw hazards
  renderHazards(ctx, state.hazards);

  // 6. Draw player (unless skipped for animation)
  if (!options?.skipPlayer) {
    renderPlayer(ctx, state.player.position);
  }

  // 7. Draw HUD
  renderHUD(ctx, state, canvas.width);

  // 8. Draw game over overlay if applicable
  if (state.status !== 'playing') {
    renderGameOver(ctx, state.status, canvas.width, canvas.height, state);
  }
}

// ============================================================================
// BACKGROUND RENDERING
// ============================================================================

/**
 * Clear canvas and fill with background color.
 */
function renderBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, width, height);
}

// ============================================================================
// GRID RENDERING
// ============================================================================

/**
 * Render the entire grid.
 */
function renderGrid(ctx: CanvasRenderingContext2D, grid: Grid): void {
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const tile = grid.tiles[y][x];
      renderTile(ctx, tile);
    }
  }
}

/**
 * Render a single tile.
 */
function renderTile(ctx: CanvasRenderingContext2D, tile: Tile): void {
  const screen = gridToScreen(tile.position);

  // Choose color based on tile type
  let fillColor: string;
  switch (tile.type) {
    case 'wall':
      fillColor = COLORS.wall;
      break;
    case 'goal':
      // Goal has special rendering, skip fill here
      fillColor = COLORS.tile;
      break;
    case 'empty':
    default:
      fillColor = COLORS.tile;
      break;
  }

  // Fill tile
  ctx.fillStyle = fillColor;
  ctx.fillRect(screen.x, screen.y, TILE_SIZE, TILE_SIZE);

  // Draw outline
  ctx.strokeStyle = COLORS.tileOutline;
  ctx.lineWidth = 1;
  ctx.strokeRect(screen.x, screen.y, TILE_SIZE, TILE_SIZE);
}

// ============================================================================
// GOAL RENDERING
// ============================================================================

/**
 * Render the goal tile with arcade neon glow effect.
 */
function renderGoal(ctx: CanvasRenderingContext2D, goal: Position): void {
  const screen = gridToScreen(goal);
  const centerX = screen.x + TILE_SIZE / 2;
  const centerY = screen.y + TILE_SIZE / 2;

  // Outer glow halo
  ctx.fillStyle = COLORS.goalGlow;
  ctx.beginPath();
  ctx.arc(centerX, centerY, TILE_SIZE * 0.55, 0, Math.PI * 2);
  ctx.fill();

  // Draw neon diamond
  const size = TILE_SIZE * 0.35;
  ctx.fillStyle = COLORS.goal;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - size);
  ctx.lineTo(centerX + size, centerY);
  ctx.lineTo(centerX, centerY + size);
  ctx.lineTo(centerX - size, centerY);
  ctx.closePath();
  ctx.fill();

  // Diamond outline for arcade crispness
  ctx.strokeStyle = '#00ffaa';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Inner diamond cutout
  ctx.fillStyle = COLORS.tile;
  const innerSize = size * 0.35;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - innerSize);
  ctx.lineTo(centerX + innerSize, centerY);
  ctx.lineTo(centerX, centerY + innerSize);
  ctx.lineTo(centerX - innerSize, centerY);
  ctx.closePath();
  ctx.fill();
}

// ============================================================================
// PLAYER RENDERING
// ============================================================================

/**
 * Render the player as a circle at a grid position.
 */
function renderPlayer(ctx: CanvasRenderingContext2D, position: Position): void {
  const screen = gridToScreen(position);
  renderPlayerAtScreen(ctx, screen.x + TILE_SIZE / 2, screen.y + TILE_SIZE / 2);
}

/**
 * Render the player at a visual position (supports fractional grid positions).
 * Used during movement animation when player is between tiles.
 *
 * @param ctx - Canvas context
 * @param visualPosition - Position in grid coordinates (can be fractional)
 */
export function renderPlayerAt(
  ctx: CanvasRenderingContext2D,
  visualPosition: Position
): void {
  // Convert fractional grid position to screen pixels
  const screenX = visualPosition.x * TILE_SIZE + GRID_PADDING + TILE_SIZE / 2;
  const screenY = visualPosition.y * TILE_SIZE + GRID_PADDING + TILE_SIZE / 2;
  renderPlayerAtScreen(ctx, screenX, screenY);
}

/**
 * Internal function to render player at screen coordinates.
 * Arcade style: bright cyan circle with outer glow ring.
 */
function renderPlayerAtScreen(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number
): void {
  const radius = TILE_SIZE * 0.35;

  // Outer glow halo
  ctx.fillStyle = 'rgba(0, 204, 255, 0.2)';
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 8, 0, Math.PI * 2);
  ctx.fill();

  // Main player circle
  ctx.fillStyle = COLORS.player;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  // Thick outline for arcade crispness
  ctx.strokeStyle = COLORS.playerOutline;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Inner highlight — arcade specular
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.beginPath();
  ctx.arc(centerX - radius * 0.25, centerY - radius * 0.25, radius * 0.25, 0, Math.PI * 2);
  ctx.fill();
}

// ============================================================================
// HAZARD RENDERING
// ============================================================================

/**
 * Render all hazards.
 */
function renderHazards(ctx: CanvasRenderingContext2D, hazards: Hazard[]): void {
  for (const hazard of hazards) {
    renderHazard(ctx, hazard);
  }
}

/**
 * Render a single hazard based on type.
 */
function renderHazard(ctx: CanvasRenderingContext2D, hazard: Hazard): void {
  const screen = gridToScreen(hazard.position);
  const centerX = screen.x + TILE_SIZE / 2;
  const centerY = screen.y + TILE_SIZE / 2;

  // Use inactive color if hazard is not active
  let color: string;
  if (!hazard.active) {
    color = COLORS.hazardInactive;
  } else {
    switch (hazard.type) {
      case 'spike':
        color = COLORS.hazardSpike;
        break;
      case 'laser':
        color = COLORS.hazardLaser;
        break;
      case 'fire':
        color = COLORS.hazardFire;
        break;
      default:
        color = COLORS.hazardSpike;
    }
  }

  // Draw hazard based on type
  switch (hazard.type) {
    case 'spike':
      renderSpike(ctx, centerX, centerY, color);
      break;
    case 'laser':
      renderLaser(ctx, centerX, centerY, color);
      break;
    case 'fire':
      renderFire(ctx, centerX, centerY, color);
      break;
    default:
      renderSpike(ctx, centerX, centerY, color);
  }
}

/**
 * Render a spike hazard (bold neon triangle with glow).
 */
function renderSpike(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  color: string
): void {
  const size = TILE_SIZE * 0.38;

  // Glow halo
  ctx.fillStyle = color + '30';
  ctx.beginPath();
  ctx.arc(centerX, centerY, TILE_SIZE * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Main triangle
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - size);
  ctx.lineTo(centerX + size, centerY + size * 0.7);
  ctx.lineTo(centerX - size, centerY + size * 0.7);
  ctx.closePath();
  ctx.fill();

  // Bright outline
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
}

/**
 * Render a laser hazard (thick neon beam with glow bars).
 */
function renderLaser(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  color: string
): void {
  const width = TILE_SIZE * 0.8;
  const height = TILE_SIZE * 0.18;

  // Outer glow bars
  ctx.fillStyle = color + '25';
  ctx.fillRect(centerX - width / 2, centerY - height * 1.8, width, height * 3.6);

  // Secondary glow
  ctx.fillStyle = color + '50';
  ctx.fillRect(centerX - width / 2, centerY - height, width, height * 2);

  // Main beam — bright
  ctx.fillStyle = color;
  ctx.fillRect(centerX - width / 2, centerY - height / 2, width, height);

  // White-hot core
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillRect(centerX - width / 2, centerY - height * 0.2, width, height * 0.4);
}

/**
 * Render a fire hazard (angular arcade flame shapes).
 */
function renderFire(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  color: string
): void {
  const size = TILE_SIZE * 0.32;

  // Glow halo
  ctx.fillStyle = color + '25';
  ctx.beginPath();
  ctx.arc(centerX, centerY, TILE_SIZE * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Center flame — angular chevron
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - size * 1.1);
  ctx.lineTo(centerX + size * 0.5, centerY + size * 0.2);
  ctx.lineTo(centerX + size * 0.2, centerY + size * 0.6);
  ctx.lineTo(centerX, centerY + size * 0.3);
  ctx.lineTo(centerX - size * 0.2, centerY + size * 0.6);
  ctx.lineTo(centerX - size * 0.5, centerY + size * 0.2);
  ctx.closePath();
  ctx.fill();

  // Orange-red inner core
  ctx.fillStyle = '#ff6600';
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - size * 0.5);
  ctx.lineTo(centerX + size * 0.25, centerY + size * 0.15);
  ctx.lineTo(centerX, centerY + size * 0.35);
  ctx.lineTo(centerX - size * 0.25, centerY + size * 0.15);
  ctx.closePath();
  ctx.fill();
}

// ============================================================================
// INTERACTABLE RENDERING
// ============================================================================

/**
 * Render all interactables (keys, doors).
 */
function renderInteractables(
  ctx: CanvasRenderingContext2D,
  interactables: Interactable[]
): void {
  for (const interactable of interactables) {
    renderInteractable(ctx, interactable);
  }
}

/**
 * Render a single interactable.
 */
function renderInteractable(
  ctx: CanvasRenderingContext2D,
  interactable: Interactable
): void {
  switch (interactable.type) {
    case 'key':
      if (interactable.state.type === 'key' && !interactable.state.collected) {
        renderKey(ctx, interactable.position, interactable.state.color);
      }
      break;
    case 'door':
      if (interactable.state.type === 'door') {
        renderDoor(ctx, interactable.position, interactable.state.color, interactable.state.locked);
      }
      break;
  }
}

/**
 * Get color for a key/door based on its color property.
 */
function getKeyColor(color: string): string {
  switch (color) {
    case 'red':
      return COLORS.keyRed;
    case 'blue':
      return COLORS.keyBlue;
    case 'green':
      return COLORS.keyGreen;
    case 'yellow':
      return COLORS.keyYellow;
    default:
      return COLORS.keyBlue;
  }
}

/**
 * Render a key with neon glow — arcade style.
 */
function renderKey(
  ctx: CanvasRenderingContext2D,
  position: Position,
  color: string
): void {
  const screen = gridToScreen(position);
  const centerX = screen.x + TILE_SIZE / 2;
  const centerY = screen.y + TILE_SIZE / 2;
  const keyColor = getKeyColor(color);

  // Glow halo
  ctx.fillStyle = keyColor + '30';
  ctx.beginPath();
  ctx.arc(centerX, centerY, TILE_SIZE * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Key head (circle) with thick outline
  ctx.fillStyle = keyColor;
  ctx.beginPath();
  ctx.arc(centerX, centerY - TILE_SIZE * 0.1, TILE_SIZE * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Key hole
  ctx.fillStyle = COLORS.tile;
  ctx.beginPath();
  ctx.arc(centerX, centerY - TILE_SIZE * 0.1, TILE_SIZE * 0.06, 0, Math.PI * 2);
  ctx.fill();

  // Key shaft — thicker
  ctx.fillStyle = keyColor;
  ctx.fillRect(centerX - TILE_SIZE * 0.05, centerY, TILE_SIZE * 0.1, TILE_SIZE * 0.25);

  // Key teeth — chunkier
  ctx.fillRect(centerX, centerY + TILE_SIZE * 0.08, TILE_SIZE * 0.12, TILE_SIZE * 0.06);
  ctx.fillRect(centerX, centerY + TILE_SIZE * 0.19, TILE_SIZE * 0.1, TILE_SIZE * 0.06);
}

/**
 * Render a door — neon-outlined rectangle with color stripe glow.
 */
function renderDoor(
  ctx: CanvasRenderingContext2D,
  position: Position,
  color: string,
  locked: boolean
): void {
  const screen = gridToScreen(position);
  const keyColor = getKeyColor(color);

  // Door frame — dark fill
  ctx.fillStyle = locked ? COLORS.doorLocked : COLORS.doorUnlocked;
  ctx.fillRect(
    screen.x + TILE_SIZE * 0.1,
    screen.y + TILE_SIZE * 0.05,
    TILE_SIZE * 0.8,
    TILE_SIZE * 0.9
  );

  // Neon outline
  ctx.strokeStyle = locked ? keyColor : COLORS.doorUnlocked;
  ctx.lineWidth = 2;
  ctx.strokeRect(
    screen.x + TILE_SIZE * 0.1,
    screen.y + TILE_SIZE * 0.05,
    TILE_SIZE * 0.8,
    TILE_SIZE * 0.9
  );

  // Color stripe — glows when locked
  if (locked) {
    // Glow behind stripe
    ctx.fillStyle = keyColor + '40';
    ctx.fillRect(
      screen.x + TILE_SIZE * 0.1,
      screen.y + TILE_SIZE * 0.08,
      TILE_SIZE * 0.8,
      TILE_SIZE * 0.2
    );
  }
  ctx.fillStyle = keyColor;
  ctx.fillRect(
    screen.x + TILE_SIZE * 0.15,
    screen.y + TILE_SIZE * 0.1,
    TILE_SIZE * 0.7,
    TILE_SIZE * 0.15
  );

  // Lock/handle
  if (locked) {
    // Chunky lock body
    ctx.fillStyle = keyColor;
    ctx.fillRect(
      screen.x + TILE_SIZE * 0.38,
      screen.y + TILE_SIZE * 0.5,
      TILE_SIZE * 0.24,
      TILE_SIZE * 0.25
    );
    // Lock shackle (arc above body)
    ctx.strokeStyle = keyColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(
      screen.x + TILE_SIZE * 0.5,
      screen.y + TILE_SIZE * 0.5,
      TILE_SIZE * 0.09,
      Math.PI,
      0
    );
    ctx.stroke();
    // Keyhole
    ctx.fillStyle = COLORS.tile;
    ctx.beginPath();
    ctx.arc(
      screen.x + TILE_SIZE * 0.5,
      screen.y + TILE_SIZE * 0.6,
      TILE_SIZE * 0.04,
      0,
      Math.PI * 2
    );
    ctx.fill();
  } else {
    // Handle — neon dot
    ctx.fillStyle = COLORS.goal;
    ctx.beginPath();
    ctx.arc(
      screen.x + TILE_SIZE * 0.7,
      screen.y + TILE_SIZE * 0.55,
      TILE_SIZE * 0.06,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

// ============================================================================
// HUD RENDERING
// ============================================================================

/**
 * Render the arcade-style heads-up display.
 * Score-style layout with segmented energy bar.
 */
function renderHUD(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  canvasWidth: number
): void {
  const hudY = ctx.canvas.height - HUD_HEIGHT;

  // HUD background
  ctx.fillStyle = COLORS.hudBackground;
  ctx.fillRect(0, hudY, canvasWidth, HUD_HEIGHT);

  // Neon divider line
  ctx.strokeStyle = COLORS.hudTurn;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, hudY);
  ctx.lineTo(canvasWidth, hudY);
  ctx.stroke();
  // Subtle glow under divider
  ctx.strokeStyle = 'rgba(0, 204, 255, 0.3)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, hudY + 2);
  ctx.lineTo(canvasWidth, hudY + 2);
  ctx.stroke();

  // Energy label
  const energyColor = state.energy <= 3 ? COLORS.hudEnergyLow : COLORS.hudEnergy;
  ctx.fillStyle = energyColor;
  ctx.font = 'bold 16px monospace';
  ctx.fillText('ENERGY', GRID_PADDING, hudY + 22);

  // Segmented energy bar (arcade health bar style)
  const segments = state.maxEnergy;
  const segWidth = Math.min(10, Math.floor(125 / segments));
  const segHeight = 12;
  const segGap = 3;
  const barX = GRID_PADDING;
  const barY = hudY + 30;

  for (let i = 0; i < segments; i++) {
    const sx = barX + i * (segWidth + segGap);
    if (i < state.energy) {
      ctx.fillStyle = energyColor;
    } else {
      ctx.fillStyle = '#1a1a2a';
    }
    ctx.fillRect(sx, barY, segWidth, segHeight);
  }

  // Energy count
  ctx.fillStyle = energyColor;
  ctx.font = 'bold 14px monospace';
  const countX = barX + segments * (segWidth + segGap) + 8;
  ctx.fillText(`${state.energy}/${state.maxEnergy}`, countX, barY + segHeight - 1);

  // Turn counter (right side)
  ctx.fillStyle = COLORS.hudTurn;
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`TURN ${String(state.turnCount).padStart(3, '0')}`, canvasWidth - GRID_PADDING, hudY + 22);

  // Keys inventory (right side, below turn)
  const keys = state.player.inventory.keys;
  if (keys.length > 0) {
    ctx.font = '14px monospace';
    ctx.fillStyle = COLORS.hudText;
    ctx.fillText('KEYS', canvasWidth - GRID_PADDING, hudY + 44);

    let keyX = canvasWidth - GRID_PADDING - 50;
    for (const key of keys) {
      const keyColor = getKeyColor(key.color);
      // Glow around key icon
      ctx.fillStyle = keyColor + '40';
      ctx.beginPath();
      ctx.arc(keyX, hudY + 52, 10, 0, Math.PI * 2);
      ctx.fill();
      // Key dot
      ctx.fillStyle = keyColor;
      ctx.beginPath();
      ctx.arc(keyX, hudY + 52, 6, 0, Math.PI * 2);
      ctx.fill();
      keyX -= 22;
    }
  }

  ctx.textAlign = 'left';

  // Level ID — arcade "STAGE XX" style (centered at bottom)
  ctx.fillStyle = '#555577';
  ctx.font = '14px monospace';
  ctx.textAlign = 'center';
  const levelNum = state.levelId.match(/^(\d+)/);
  const stageLabel = levelNum
    ? `STAGE ${levelNum[1].padStart(2, '0')}`
    : state.levelId.replace(/_/g, ' ').toUpperCase();
  ctx.fillText(stageLabel, canvasWidth / 2, hudY + 62);
  ctx.textAlign = 'left';
}

// ============================================================================
// GAME OVER RENDERING
// ============================================================================

/**
 * Render the arcade-style game over overlay.
 * "STAGE CLEAR" / "GAME OVER" with CRT scanline hint.
 */
function renderGameOver(
  ctx: CanvasRenderingContext2D,
  status: 'won' | 'lost',
  canvasWidth: number,
  canvasHeight: number,
  state?: GameState
): void {
  const gridHeight = canvasHeight - HUD_HEIGHT;
  const centerX = canvasWidth / 2;
  const centerY = gridHeight / 2;

  // Dark overlay base
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(0, 0, canvasWidth, gridHeight);

  // Neon color strip at top
  const accentColor = status === 'won' ? COLORS.goal : COLORS.hazardSpike;
  ctx.fillStyle = accentColor;
  ctx.fillRect(0, centerY - 88, canvasWidth, 3);

  // Main message — big arcade text
  ctx.fillStyle = accentColor;
  ctx.font = 'bold 35px monospace';
  ctx.textAlign = 'center';

  const message = status === 'won' ? 'STAGE CLEAR' : 'GAME OVER';
  ctx.fillText(message, centerX, centerY - 44);

  // Stats
  if (state) {
    ctx.fillStyle = COLORS.overlayText;
    ctx.font = '18px monospace';

    if (status === 'won') {
      ctx.fillText(`TURNS  ${String(state.turnCount).padStart(3, '0')}`, centerX, centerY + 6);
      ctx.fillText(`ENERGY ${String(state.energy).padStart(3, '0')}`, centerX, centerY + 31);
    } else {
      const reason = state.energy <= 0 ? 'ENERGY DEPLETED' : 'HAZARD CONTACT';
      ctx.fillText(reason, centerX, centerY + 6);
      ctx.fillText(`TURNS  ${String(state.turnCount).padStart(3, '0')}`, centerX, centerY + 31);
    }
  }

  // Bottom neon strip
  ctx.fillStyle = accentColor;
  ctx.fillRect(0, centerY + 50, canvasWidth, 3);

  // Instructions
  ctx.font = 'bold 15px monospace';
  ctx.fillStyle = '#888899';

  if (status === 'won') {
    ctx.fillText('[ N ] NEXT    [ R ] REPLAY', centerX, centerY + 81);
  } else {
    ctx.fillText('[ R ] RETRY   [ P ] PREV', centerX, centerY + 81);
  }

  // CRT scanline hint — faint horizontal lines over overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  for (let y = 0; y < gridHeight; y += 4) {
    ctx.fillRect(0, y, canvasWidth, 2);
  }

  ctx.textAlign = 'left';
}

// ============================================================================
// INVALID MOVE FEEDBACK
// ============================================================================

/**
 * Render invalid move feedback.
 * Shows a red flash in the direction the player tried to move.
 *
 * @param ctx - Canvas context
 * @param playerPos - Current player position
 * @param direction - Direction of attempted move
 * @param progress - Animation progress (0 to 1)
 */
export function renderInvalidMoveFeedback(
  ctx: CanvasRenderingContext2D,
  playerPos: Position,
  direction: Direction,
  progress: number
): void {
  const delta = DIRECTION_VECTORS[direction];
  const targetPos = {
    x: playerPos.x + delta.x,
    y: playerPos.y + delta.y,
  };

  const screen = gridToScreen(targetPos);

  // Fade out effect
  const alpha = 0.5 * (1 - progress);

  ctx.fillStyle = `rgba(255, 0, 85, ${alpha})`;
  ctx.fillRect(screen.x, screen.y, TILE_SIZE, TILE_SIZE);

  // Draw X mark
  const centerX = screen.x + TILE_SIZE / 2;
  const centerY = screen.y + TILE_SIZE / 2;
  const size = TILE_SIZE * 0.25 * (1 - progress * 0.5);

  ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(centerX - size, centerY - size);
  ctx.lineTo(centerX + size, centerY + size);
  ctx.moveTo(centerX + size, centerY - size);
  ctx.lineTo(centerX - size, centerY + size);
  ctx.stroke();
}

/**
 * Render valid move hints.
 * Shows subtle highlights on tiles the player can move to.
 *
 * @param ctx - Canvas context
 * @param playerPos - Current player position
 * @param validDirections - Array of valid move directions
 */
export function renderMoveHints(
  ctx: CanvasRenderingContext2D,
  playerPos: Position,
  validDirections: Direction[]
): void {
  for (const direction of validDirections) {
    const delta = DIRECTION_VECTORS[direction];
    const targetPos = {
      x: playerPos.x + delta.x,
      y: playerPos.y + delta.y,
    };

    const screen = gridToScreen(targetPos);

    ctx.fillStyle = COLORS.validMoveHint;
    ctx.fillRect(screen.x + 5, screen.y + 5, TILE_SIZE - 10, TILE_SIZE - 10);
  }
}
