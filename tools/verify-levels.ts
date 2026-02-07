/**
 * Level Verification Script
 *
 * Uses BFS with key/door state tracking to find optimal solutions
 * for all levels and verify they are solvable within energy budgets.
 *
 * Run: npx tsx tools/verify-levels.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { createGameState } from '../src/core/state';
import { applyAction } from '../src/core/actions';
import { resolveTurn } from '../src/core/rules';
import type { LevelData, Direction } from '../src/core/types';

// ============================================================================
// KEY BITMASK ENCODING
// ============================================================================

const KEY_BITS: Record<string, number> = {
  red: 1,
  blue: 2,
  green: 4,
  yellow: 8,
};

// ============================================================================
// BFS STATE-SPACE SOLVER
// ============================================================================

interface BFSState {
  x: number;
  y: number;
  keys: number; // bitmask of collected keys
}

interface BFSResult {
  solvable: boolean;
  optimalMoves: number;
  path?: Direction[];
}

function solveLevelBFS(level: LevelData): BFSResult {
  const { width, height, playerStart, goal } = level;
  const walls = new Set<string>();
  const hazards = new Set<string>();
  const keyPositions = new Map<string, number>();
  const doorPositions = new Map<string, number>();

  for (const t of level.tiles ?? []) {
    if (t.type === 'wall') walls.add(`${t.x},${t.y}`);
  }

  for (const h of level.hazards ?? []) {
    hazards.add(`${h.x},${h.y}`);
  }

  for (const i of level.interactables ?? []) {
    const pos = `${i.x},${i.y}`;
    if (i.type === 'key' && i.color) {
      keyPositions.set(pos, KEY_BITS[i.color] ?? 0);
    } else if (i.type === 'door' && i.color) {
      doorPositions.set(pos, KEY_BITS[i.color] ?? 0);
    }
  }

  const directions: { dir: Direction; dx: number; dy: number }[] = [
    { dir: 'up', dx: 0, dy: -1 },
    { dir: 'down', dx: 0, dy: 1 },
    { dir: 'left', dx: -1, dy: 0 },
    { dir: 'right', dx: 1, dy: 0 },
  ];

  // Check if player starts on a key
  const startPos = `${playerStart.x},${playerStart.y}`;
  const startKeyBit = keyPositions.get(startPos);
  const initialKeys = startKeyBit ? startKeyBit : 0;

  const startState: BFSState = { x: playerStart.x, y: playerStart.y, keys: initialKeys };
  const visited = new Set<string>();
  const stateKey = (s: BFSState) => `${s.x},${s.y},${s.keys}`;

  visited.add(stateKey(startState));

  const queue: { state: BFSState; moves: number; path: Direction[] }[] = [
    { state: startState, moves: 0, path: [] },
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const { state, moves, path: currentPath } = current;

    // Check goal
    if (state.x === goal.x && state.y === goal.y) {
      return { solvable: true, optimalMoves: moves, path: currentPath };
    }

    for (const { dir, dx, dy } of directions) {
      const nx = state.x + dx;
      const ny = state.y + dy;

      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;

      const npos = `${nx},${ny}`;

      if (walls.has(npos)) continue;
      if (hazards.has(npos)) continue;

      const doorBit = doorPositions.get(npos);
      if (doorBit !== undefined && !(state.keys & doorBit)) continue;

      let newKeys = state.keys;
      const keyBit = keyPositions.get(npos);
      if (keyBit !== undefined) {
        newKeys |= keyBit;
      }

      const newState: BFSState = { x: nx, y: ny, keys: newKeys };
      const key = stateKey(newState);

      if (!visited.has(key)) {
        visited.add(key);
        queue.push({
          state: newState,
          moves: moves + 1,
          path: [...currentPath, dir],
        });
      }
    }
  }

  return { solvable: false, optimalMoves: -1 };
}

// ============================================================================
// SIMULATION VERIFICATION
// ============================================================================

function simulateSolution(
  level: LevelData,
  dirs: Direction[]
): {
  success: boolean;
  finalStatus: string;
  energyRemaining: number;
  turnsUsed: number;
} {
  let state = createGameState(level);

  for (const dir of dirs) {
    if (state.status !== 'playing') break;
    state = applyAction(state, { type: 'move', direction: dir });
    state = resolveTurn(state);
  }

  return {
    success: state.status === 'won',
    finalStatus: state.status,
    energyRemaining: state.energy,
    turnsUsed: state.turnCount,
  };
}

// ============================================================================
// MAIN
// ============================================================================

const levelsDir = path.resolve(__dirname, '../content/levels');
const files = fs
  .readdirSync(levelsDir)
  .filter((f) => f.endsWith('.json'))
  .sort();

console.log('='.repeat(90));
console.log('SIGNAL PATH — Level Verification Report');
console.log('='.repeat(90));
console.log('');

let allPassed = true;
const results: {
  id: string;
  name: string;
  grid: string;
  energy: number;
  optimal: number;
  margin: number;
  ratio: string;
  hazards: number;
  keys: number;
  doors: number;
  walls: number;
  pass: boolean;
}[] = [];

for (const file of files) {
  const filepath = path.join(levelsDir, file);
  const raw = fs.readFileSync(filepath, 'utf-8');
  const level: LevelData = JSON.parse(raw);

  const bfsResult = solveLevelBFS(level);
  const hazardCount = level.hazards?.length ?? 0;
  const keyCount =
    level.interactables?.filter((i) => i.type === 'key').length ?? 0;
  const doorCount =
    level.interactables?.filter((i) => i.type === 'door').length ?? 0;
  const wallCount =
    level.tiles?.filter((t) => t.type === 'wall').length ?? 0;

  if (!bfsResult.solvable) {
    console.log(`FAIL  ${level.id} (${level.name}) — NOT SOLVABLE`);
    allPassed = false;
    results.push({
      id: level.id,
      name: level.name,
      grid: `${level.width}x${level.height}`,
      energy: level.energy,
      optimal: -1,
      margin: -1,
      ratio: 'N/A',
      hazards: hazardCount,
      keys: keyCount,
      doors: doorCount,
      walls: wallCount,
      pass: false,
    });
    continue;
  }

  // Verify by simulation
  const sim = simulateSolution(level, bfsResult.path!);
  const margin = level.energy - bfsResult.optimalMoves;
  const ratio = (level.energy / bfsResult.optimalMoves).toFixed(2);
  const pass = sim.success && margin >= 0;

  if (!pass) {
    console.log(
      `FAIL  ${level.id} (${level.name}) — Sim: ${sim.finalStatus}, E=${sim.energyRemaining}`
    );
    allPassed = false;
  } else {
    console.log(
      `PASS  ${level.id} (${level.name}) — ${bfsResult.optimalMoves} moves, E=${level.energy}, margin=${margin} (${ratio}x)`
    );
  }

  results.push({
    id: level.id,
    name: level.name,
    grid: `${level.width}x${level.height}`,
    energy: level.energy,
    optimal: bfsResult.optimalMoves,
    margin,
    ratio,
    hazards: hazardCount,
    keys: keyCount,
    doors: doorCount,
    walls: wallCount,
    pass,
  });
}

console.log('');
console.log('='.repeat(90));
console.log('SUMMARY TABLE');
console.log('='.repeat(90));
console.log('');
console.log(
  'Level'.padEnd(22) +
    'Grid'.padEnd(7) +
    'Walls'.padEnd(7) +
    'Haz'.padEnd(5) +
    'Keys'.padEnd(6) +
    'Energy'.padEnd(8) +
    'Optimal'.padEnd(9) +
    'Margin'.padEnd(8) +
    'Ratio'.padEnd(7) +
    'Status'
);
console.log('-'.repeat(90));

for (const r of results) {
  console.log(
    r.id.padEnd(22) +
      r.grid.padEnd(7) +
      String(r.walls).padEnd(7) +
      String(r.hazards).padEnd(5) +
      String(r.keys).padEnd(6) +
      String(r.energy).padEnd(8) +
      String(r.optimal).padEnd(9) +
      String(r.margin).padEnd(8) +
      r.ratio.padEnd(7) +
      (r.pass ? 'PASS' : 'FAIL')
  );
}

console.log('');
if (allPassed) {
  console.log('ALL LEVELS PASSED');
} else {
  console.log('SOME LEVELS FAILED — see above');
  process.exit(1);
}
