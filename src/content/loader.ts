/**
 * Level Loader Module
 *
 * This file handles loading level data from JSON files:
 * - Dynamic level loading from content/levels/
 * - Level data validation
 * - Error handling for missing/invalid levels
 * - Level manifest management
 *
 * Architecture:
 * - Part of the content layer
 * - Imports types from core
 * - Used by UI layer for level loading
 * - All functions handle errors gracefully
 */

import type { LevelData, ValidationResult } from '../core/types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Result of loading a level.
 * Either contains the level data or an error message.
 */
export interface LevelLoadResult {
  success: boolean;
  level?: LevelData;
  error?: string;
}

/**
 * Metadata about an available level.
 * Used for level selection UI without loading full level data.
 */
export interface LevelInfo {
  id: string;
  name: string;
  description?: string;
  filename: string;
}

/**
 * Level manifest - list of all available levels.
 */
export interface LevelManifest {
  levels: LevelInfo[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Base path for level files.
 * In production, this would be relative to the public directory.
 */
const LEVELS_BASE_PATH = '/content/levels';

/**
 * List of available level files.
 * In a larger project, this could be generated at build time or loaded from a manifest.
 */
const LEVEL_FILES: LevelInfo[] = [
  {
    id: '01_first_steps',
    name: 'First Steps',
    description: 'Learn the basics of movement and energy.',
    filename: '01_first_steps.json',
  },
  {
    id: '02_hazards',
    name: 'Hazard Warning',
    description: 'Avoid dangerous hazards on your path.',
    filename: '02_hazards.json',
  },
  {
    id: '03_keys',
    name: 'Lock and Key',
    description: 'Collect keys to open locked doors.',
    filename: '03_keys.json',
  },
  {
    id: '04_the_corridor',
    name: 'The Corridor',
    description: 'Navigate through the narrow corridors.',
    filename: '04_the_corridor.json',
  },
  {
    id: '05_danger_zone',
    name: 'Danger Zone',
    description: 'Multiple paths exist, but hazards block the direct route.',
    filename: '05_danger_zone.json',
  },
  {
    id: '06_key_chain',
    name: 'Key Chain',
    description: 'Three doors block your path. Collect the keys in the right order.',
    filename: '06_key_chain.json',
  },
  {
    id: '07_the_gauntlet',
    name: 'The Gauntlet',
    description: 'A corridor filled with hazards. Energy is tight.',
    filename: '07_the_gauntlet.json',
  },
  {
    id: '08_locked_in',
    name: 'Locked In',
    description: 'Keys, doors, and hazards combine. Plan your route carefully.',
    filename: '08_locked_in.json',
  },
  {
    id: '09_efficiency',
    name: 'Efficiency',
    description: 'Energy is extremely limited. Only the optimal path will succeed.',
    filename: '09_efficiency.json',
  },
  {
    id: '10_final_test',
    name: 'Final Test',
    description: 'The ultimate challenge. All mechanics combined.',
    filename: '10_final_test.json',
  },
  {
    id: '11_crossroads',
    name: 'Crossroads',
    description: 'Multiple paths branch from the center. Hazards block two routes.',
    filename: '11_crossroads.json',
  },
  {
    id: '12_the_vault',
    name: 'The Vault',
    description: 'Three locked chambers guard the keys you need.',
    filename: '12_the_vault.json',
  },
  {
    id: '13_minefield',
    name: 'Minefield',
    description: 'An open field scattered with hazards. Energy is tight.',
    filename: '13_minefield.json',
  },
  {
    id: '14_color_maze',
    name: 'Color Maze',
    description: 'Three color-coded locks block the exit. Collect keys in the right order.',
    filename: '14_color_maze.json',
  },
  {
    id: '15_dead_ends',
    name: 'Dead Ends',
    description: 'A maze of corridors hides punishing dead ends.',
    filename: '15_dead_ends.json',
  },
  {
    id: '16_firewall',
    name: 'Firewall',
    description: 'Horizontal barriers of fire and lasers block the way.',
    filename: '16_firewall.json',
  },
  {
    id: '17_one_shot',
    name: 'One Shot',
    description: 'Barely enough energy to survive. Only the optimal path works.',
    filename: '17_one_shot.json',
  },
  {
    id: '18_labyrinth',
    name: 'Labyrinth',
    description: 'A sprawling maze with locked doors and scattered hazards.',
    filename: '18_labyrinth.json',
  },
  {
    id: '19_gauntlet_ii',
    name: 'Gauntlet II',
    description: 'Three sections of hazard corridors. The sequel is harder.',
    filename: '19_gauntlet_ii.json',
  },
  {
    id: '20_signal_lost',
    name: 'Signal Lost',
    description: 'Final mission. Every hazard, every lock stands between you and the exit.',
    filename: '20_signal_lost.json',
  },
];

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate level data structure.
 *
 * This performs basic structural validation:
 * - Required fields present
 * - Types are correct
 * - Values are in valid ranges
 *
 * More complex validation (reachability, etc.) would be in a separate module.
 *
 * @param data - Parsed JSON data to validate
 * @returns ValidationResult with valid flag and reason if invalid
 */
export function validateLevelData(data: unknown): ValidationResult {
  // Check if data is an object
  if (typeof data !== 'object' || data === null) {
    return { valid: false, reason: 'Level data must be an object' };
  }

  const level = data as Record<string, unknown>;

  // Check required string fields
  const requiredStrings = ['id', 'name', 'version'];
  for (const field of requiredStrings) {
    if (typeof level[field] !== 'string') {
      return { valid: false, reason: `Missing or invalid field: ${field}` };
    }
  }

  // Check required number fields
  const requiredNumbers = ['width', 'height', 'energy'];
  for (const field of requiredNumbers) {
    if (typeof level[field] !== 'number' || level[field] <= 0) {
      return { valid: false, reason: `Missing or invalid field: ${field}` };
    }
  }

  // Check grid dimensions
  const width = level.width as number;
  const height = level.height as number;
  if (width < 5 || width > 20) {
    return { valid: false, reason: 'Width must be between 5 and 20' };
  }
  if (height < 5 || height > 20) {
    return { valid: false, reason: 'Height must be between 5 and 20' };
  }

  // Check playerStart
  if (!isValidPosition(level.playerStart, width, height)) {
    return { valid: false, reason: 'Invalid or missing playerStart position' };
  }

  // Check goal
  if (!isValidPosition(level.goal, width, height)) {
    return { valid: false, reason: 'Invalid or missing goal position' };
  }

  // Check optional arrays
  if (level.tiles !== undefined && !Array.isArray(level.tiles)) {
    return { valid: false, reason: 'tiles must be an array' };
  }
  if (level.hazards !== undefined && !Array.isArray(level.hazards)) {
    return { valid: false, reason: 'hazards must be an array' };
  }
  if (level.interactables !== undefined && !Array.isArray(level.interactables)) {
    return { valid: false, reason: 'interactables must be an array' };
  }

  return { valid: true };
}

/**
 * Check if a value is a valid position within grid bounds.
 */
function isValidPosition(pos: unknown, width: number, height: number): boolean {
  if (typeof pos !== 'object' || pos === null) {
    return false;
  }

  const position = pos as Record<string, unknown>;
  const x = position.x;
  const y = position.y;

  if (typeof x !== 'number' || typeof y !== 'number') {
    return false;
  }

  return x >= 0 && x < width && y >= 0 && y < height;
}

// ============================================================================
// LEVEL LOADING
// ============================================================================

/**
 * Load a single level by its ID.
 *
 * Looks up the level filename from the manifest and fetches the JSON file.
 * Validates the data before returning.
 *
 * @param levelId - The unique ID of the level to load
 * @returns Promise<LevelLoadResult> with level data or error
 *
 * Example:
 * ```typescript
 * const result = await loadLevel('01_first_steps');
 * if (result.success && result.level) {
 *   const gameState = createGameState(result.level);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export async function loadLevel(levelId: string): Promise<LevelLoadResult> {
  // Find level info in manifest
  const levelInfo = LEVEL_FILES.find((l) => l.id === levelId);

  if (!levelInfo) {
    return {
      success: false,
      error: `Level not found: ${levelId}`,
    };
  }

  return loadLevelFromFile(levelInfo.filename);
}

/**
 * Load a level from a specific file.
 *
 * @param filename - The JSON filename to load
 * @returns Promise<LevelLoadResult> with level data or error
 */
export async function loadLevelFromFile(filename: string): Promise<LevelLoadResult> {
  const url = `${LEVELS_BASE_PATH}/${filename}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to load level file: ${filename} (${response.status})`,
      };
    }

    const data = await response.json();

    // Validate the level data
    const validation = validateLevelData(data);
    if (!validation.valid) {
      return {
        success: false,
        error: `Invalid level data in ${filename}: ${validation.reason}`,
      };
    }

    return {
      success: true,
      level: data as LevelData,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Error loading level ${filename}: ${message}`,
    };
  }
}

/**
 * Load all available levels.
 *
 * Loads all levels defined in the manifest.
 * Returns successfully loaded levels and reports errors for failed ones.
 *
 * @returns Promise with array of loaded levels and any errors
 */
export async function loadAllLevels(): Promise<{
  levels: LevelData[];
  errors: string[];
}> {
  const levels: LevelData[] = [];
  const errors: string[] = [];

  const loadPromises = LEVEL_FILES.map(async (levelInfo) => {
    const result = await loadLevelFromFile(levelInfo.filename);
    if (result.success && result.level) {
      levels.push(result.level);
    } else if (result.error) {
      errors.push(result.error);
    }
  });

  await Promise.all(loadPromises);

  // Sort levels by ID to ensure consistent order
  levels.sort((a, b) => a.id.localeCompare(b.id));

  return { levels, errors };
}

// ============================================================================
// LEVEL MANIFEST
// ============================================================================

/**
 * Get the list of available levels.
 *
 * Returns metadata about available levels without loading full level data.
 * Useful for level selection UI.
 *
 * @returns Array of LevelInfo objects
 */
export function getLevelList(): LevelInfo[] {
  return [...LEVEL_FILES];
}

/**
 * Get the total number of available levels.
 */
export function getLevelCount(): number {
  return LEVEL_FILES.length;
}

/**
 * Check if a level exists by ID.
 */
export function levelExists(levelId: string): boolean {
  return LEVEL_FILES.some((l) => l.id === levelId);
}

/**
 * Get level info by ID without loading the full level.
 */
export function getLevelInfo(levelId: string): LevelInfo | undefined {
  return LEVEL_FILES.find((l) => l.id === levelId);
}

/**
 * Get the next level ID in sequence.
 *
 * @param currentId - Current level ID
 * @returns Next level ID or undefined if at end
 */
export function getNextLevelId(currentId: string): string | undefined {
  const currentIndex = LEVEL_FILES.findIndex((l) => l.id === currentId);
  if (currentIndex === -1 || currentIndex >= LEVEL_FILES.length - 1) {
    return undefined;
  }
  return LEVEL_FILES[currentIndex + 1].id;
}

/**
 * Get the previous level ID in sequence.
 *
 * @param currentId - Current level ID
 * @returns Previous level ID or undefined if at start
 */
export function getPreviousLevelId(currentId: string): string | undefined {
  const currentIndex = LEVEL_FILES.findIndex((l) => l.id === currentId);
  if (currentIndex <= 0) {
    return undefined;
  }
  return LEVEL_FILES[currentIndex - 1].id;
}
