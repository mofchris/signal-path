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

import type { GameState, Grid, Tile, Position, Hazard, Interactable } from '../core/types';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Tile size in pixels.
 * All grid calculations are based on this value.
 */
export const TILE_SIZE = 48;

/**
 * HUD height in pixels.
 * Space reserved at the bottom for energy/turn display.
 */
export const HUD_HEIGHT = 60;

/**
 * Padding around the grid.
 */
export const GRID_PADDING = 16;

/**
 * Color palette for the game.
 * Designed for clarity and accessibility.
 */
export const COLORS = {
  // Background
  background: '#1a1a2e',

  // Grid
  tile: '#16213e',
  tileOutline: '#0f3460',
  wall: '#0a0a14',

  // Goal
  goal: '#4ade80',
  goalGlow: 'rgba(74, 222, 128, 0.3)',

  // Player
  player: '#3b82f6',
  playerOutline: '#1d4ed8',

  // Hazards
  hazardSpike: '#ef4444',
  hazardLaser: '#f97316',
  hazardFire: '#eab308',
  hazardInactive: '#6b7280',

  // Interactables
  keyRed: '#ef4444',
  keyBlue: '#3b82f6',
  keyGreen: '#22c55e',
  keyYellow: '#eab308',
  doorLocked: '#78716c',
  doorUnlocked: '#a8a29e',

  // HUD
  hudBackground: '#0f0f1a',
  hudText: '#e5e5e5',
  hudEnergy: '#22c55e',
  hudEnergyLow: '#ef4444',
  hudTurn: '#a78bfa',

  // Game over
  winOverlay: 'rgba(34, 197, 94, 0.9)',
  loseOverlay: 'rgba(239, 68, 68, 0.9)',
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
 * Render the complete game state to the canvas.
 *
 * This is the main entry point for rendering.
 * Call this after every state change to update the display.
 *
 * @param ctx - Canvas 2D rendering context
 * @param state - Current game state
 */
export function render(ctx: CanvasRenderingContext2D, state: GameState): void {
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

  // 6. Draw player
  renderPlayer(ctx, state.player.position);

  // 7. Draw HUD
  renderHUD(ctx, state, canvas.width);

  // 8. Draw game over overlay if applicable
  if (state.status !== 'playing') {
    renderGameOver(ctx, state.status, canvas.width, canvas.height);
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
 * Render the goal tile with a glowing effect.
 */
function renderGoal(ctx: CanvasRenderingContext2D, goal: Position): void {
  const screen = gridToScreen(goal);
  const centerX = screen.x + TILE_SIZE / 2;
  const centerY = screen.y + TILE_SIZE / 2;

  // Draw glow
  ctx.fillStyle = COLORS.goalGlow;
  ctx.beginPath();
  ctx.arc(centerX, centerY, TILE_SIZE / 2, 0, Math.PI * 2);
  ctx.fill();

  // Draw goal marker (flag/target shape)
  ctx.fillStyle = COLORS.goal;

  // Draw a diamond shape
  const size = TILE_SIZE * 0.35;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - size);
  ctx.lineTo(centerX + size, centerY);
  ctx.lineTo(centerX, centerY + size);
  ctx.lineTo(centerX - size, centerY);
  ctx.closePath();
  ctx.fill();

  // Inner diamond
  ctx.fillStyle = COLORS.tile;
  const innerSize = size * 0.4;
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
 * Render the player as a circle.
 */
function renderPlayer(ctx: CanvasRenderingContext2D, position: Position): void {
  const screen = gridToScreen(position);
  const centerX = screen.x + TILE_SIZE / 2;
  const centerY = screen.y + TILE_SIZE / 2;
  const radius = TILE_SIZE * 0.35;

  // Draw player circle
  ctx.fillStyle = COLORS.player;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  // Draw outline
  ctx.strokeStyle = COLORS.playerOutline;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Draw inner highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.beginPath();
  ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.3, 0, Math.PI * 2);
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
 * Render a spike hazard (triangle).
 */
function renderSpike(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  color: string
): void {
  const size = TILE_SIZE * 0.35;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - size);
  ctx.lineTo(centerX + size, centerY + size * 0.7);
  ctx.lineTo(centerX - size, centerY + size * 0.7);
  ctx.closePath();
  ctx.fill();
}

/**
 * Render a laser hazard (horizontal beam).
 */
function renderLaser(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  color: string
): void {
  const width = TILE_SIZE * 0.7;
  const height = TILE_SIZE * 0.15;

  ctx.fillStyle = color;
  ctx.fillRect(centerX - width / 2, centerY - height / 2, width, height);

  // Glow effect
  ctx.fillStyle = color + '40'; // 25% opacity
  ctx.fillRect(centerX - width / 2, centerY - height, width, height * 2);
}

/**
 * Render a fire hazard (flame shape).
 */
function renderFire(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  color: string
): void {
  const size = TILE_SIZE * 0.3;

  // Draw three flame shapes
  ctx.fillStyle = color;

  // Center flame
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - size);
  ctx.quadraticCurveTo(centerX + size * 0.5, centerY, centerX, centerY + size * 0.7);
  ctx.quadraticCurveTo(centerX - size * 0.5, centerY, centerX, centerY - size);
  ctx.fill();

  // Left flame (smaller)
  ctx.beginPath();
  ctx.moveTo(centerX - size * 0.5, centerY - size * 0.5);
  ctx.quadraticCurveTo(centerX - size * 0.2, centerY, centerX - size * 0.5, centerY + size * 0.4);
  ctx.quadraticCurveTo(centerX - size * 0.8, centerY, centerX - size * 0.5, centerY - size * 0.5);
  ctx.fill();

  // Right flame (smaller)
  ctx.beginPath();
  ctx.moveTo(centerX + size * 0.5, centerY - size * 0.5);
  ctx.quadraticCurveTo(centerX + size * 0.8, centerY, centerX + size * 0.5, centerY + size * 0.4);
  ctx.quadraticCurveTo(centerX + size * 0.2, centerY, centerX + size * 0.5, centerY - size * 0.5);
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
 * Render a key.
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

  // Key head (circle)
  ctx.fillStyle = keyColor;
  ctx.beginPath();
  ctx.arc(centerX, centerY - TILE_SIZE * 0.1, TILE_SIZE * 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Key hole
  ctx.fillStyle = COLORS.tile;
  ctx.beginPath();
  ctx.arc(centerX, centerY - TILE_SIZE * 0.1, TILE_SIZE * 0.06, 0, Math.PI * 2);
  ctx.fill();

  // Key shaft
  ctx.fillStyle = keyColor;
  ctx.fillRect(centerX - TILE_SIZE * 0.04, centerY, TILE_SIZE * 0.08, TILE_SIZE * 0.25);

  // Key teeth
  ctx.fillRect(centerX, centerY + TILE_SIZE * 0.1, TILE_SIZE * 0.1, TILE_SIZE * 0.05);
  ctx.fillRect(centerX, centerY + TILE_SIZE * 0.2, TILE_SIZE * 0.08, TILE_SIZE * 0.05);
}

/**
 * Render a door.
 */
function renderDoor(
  ctx: CanvasRenderingContext2D,
  position: Position,
  color: string,
  locked: boolean
): void {
  const screen = gridToScreen(position);
  const keyColor = getKeyColor(color);

  // Door frame
  ctx.fillStyle = locked ? COLORS.doorLocked : COLORS.doorUnlocked;
  ctx.fillRect(
    screen.x + TILE_SIZE * 0.1,
    screen.y + TILE_SIZE * 0.05,
    TILE_SIZE * 0.8,
    TILE_SIZE * 0.9
  );

  // Door color stripe
  ctx.fillStyle = keyColor;
  ctx.fillRect(
    screen.x + TILE_SIZE * 0.15,
    screen.y + TILE_SIZE * 0.1,
    TILE_SIZE * 0.7,
    TILE_SIZE * 0.15
  );

  // Lock/handle
  if (locked) {
    // Draw lock
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(
      screen.x + TILE_SIZE * 0.4,
      screen.y + TILE_SIZE * 0.5,
      TILE_SIZE * 0.2,
      TILE_SIZE * 0.25
    );
    // Keyhole
    ctx.fillStyle = COLORS.tile;
    ctx.beginPath();
    ctx.arc(
      screen.x + TILE_SIZE * 0.5,
      screen.y + TILE_SIZE * 0.58,
      TILE_SIZE * 0.04,
      0,
      Math.PI * 2
    );
    ctx.fill();
  } else {
    // Draw handle
    ctx.fillStyle = '#a8a29e';
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
 * Render the heads-up display (energy, turns, status).
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

  // Divider line
  ctx.strokeStyle = COLORS.tileOutline;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, hudY);
  ctx.lineTo(canvasWidth, hudY);
  ctx.stroke();

  // Energy display
  const energyColor = state.energy <= 3 ? COLORS.hudEnergyLow : COLORS.hudEnergy;
  ctx.fillStyle = energyColor;
  ctx.font = 'bold 16px monospace';
  ctx.fillText(`ENERGY: ${state.energy}`, GRID_PADDING, hudY + 25);

  // Energy bar
  const barWidth = 100;
  const barHeight = 12;
  const barX = GRID_PADDING;
  const barY = hudY + 35;
  const energyPercent = Math.max(0, state.energy / state.maxEnergy);

  // Bar background
  ctx.fillStyle = '#333';
  ctx.fillRect(barX, barY, barWidth, barHeight);

  // Bar fill
  ctx.fillStyle = energyColor;
  ctx.fillRect(barX, barY, barWidth * energyPercent, barHeight);

  // Bar outline
  ctx.strokeStyle = COLORS.tileOutline;
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, barY, barWidth, barHeight);

  // Turn counter
  ctx.fillStyle = COLORS.hudTurn;
  ctx.font = 'bold 16px monospace';
  ctx.fillText(`TURN: ${state.turnCount}`, canvasWidth - 100, hudY + 25);

  // Level name (centered)
  ctx.fillStyle = COLORS.hudText;
  ctx.font = '14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(state.levelId, canvasWidth / 2, hudY + 40);
  ctx.textAlign = 'left';
}

// ============================================================================
// GAME OVER RENDERING
// ============================================================================

/**
 * Render the game over overlay.
 */
function renderGameOver(
  ctx: CanvasRenderingContext2D,
  status: 'won' | 'lost',
  canvasWidth: number,
  canvasHeight: number
): void {
  // Semi-transparent overlay
  ctx.fillStyle = status === 'won' ? COLORS.winOverlay : COLORS.loseOverlay;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight - HUD_HEIGHT);

  // Message
  ctx.fillStyle = COLORS.overlayText;
  ctx.font = 'bold 32px monospace';
  ctx.textAlign = 'center';

  const message = status === 'won' ? 'LEVEL COMPLETE!' : 'MISSION FAILED';
  ctx.fillText(message, canvasWidth / 2, canvasHeight / 2 - 20);

  // Sub-message
  ctx.font = '16px monospace';
  ctx.fillText('Press R to restart', canvasWidth / 2, canvasHeight / 2 + 20);

  ctx.textAlign = 'left';
}
