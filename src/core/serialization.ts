/**
 * Save/Load Serialization Module
 *
 * Pure types and functions for save data management.
 * No browser APIs — all functions are testable in Node.js.
 *
 * Responsibilities:
 * - SaveData types (progress, settings)
 * - JSON serialization / deserialization with validation
 * - Progress query functions (unlock state, completion, best scores)
 * - Version migration scaffold
 */

// ============================================================================
// TYPES
// ============================================================================

/** Progress record for a single level. */
export interface LevelProgress {
  /** Has this level been completed at least once? */
  completed: boolean;
  /** Best (fewest) turns to complete, or null if never completed. */
  bestTurns: number | null;
  /** Best (most) energy remaining on completion, or null if never completed. */
  bestEnergy: number | null;
}

/** Persisted user settings. */
export interface SaveSettings {
  soundEnabled: boolean;
}

/** Top-level save data structure. */
export interface SaveData {
  /** Schema version for migration support. */
  version: number;
  /** ISO timestamp of last save. */
  timestamp: string;
  /** Per-level progress keyed by level ID. */
  levelProgress: Record<string, LevelProgress>;
  /** User settings. */
  settings: SaveSettings;
}

/** Current save data schema version. */
const CURRENT_VERSION = 1;

// ============================================================================
// FACTORY
// ============================================================================

/** Create a fresh SaveData with no progress. */
export function createDefaultSaveData(): SaveData {
  return {
    version: CURRENT_VERSION,
    timestamp: new Date().toISOString(),
    levelProgress: {},
    settings: {
      soundEnabled: true,
    },
  };
}

// ============================================================================
// VALIDATION
// ============================================================================

/** Type guard: checks whether an unknown value has the required SaveData shape. */
export function validateSaveData(value: unknown): value is SaveData {
  if (value === null || typeof value !== 'object') return false;

  const obj = value as Record<string, unknown>;

  if (typeof obj.version !== 'number') return false;
  if (typeof obj.timestamp !== 'string') return false;
  if (obj.levelProgress === null || typeof obj.levelProgress !== 'object') return false;
  if (obj.settings === null || typeof obj.settings !== 'object') return false;

  const settings = obj.settings as Record<string, unknown>;
  if (typeof settings.soundEnabled !== 'boolean') return false;

  return true;
}

// ============================================================================
// SERIALIZATION
// ============================================================================

/** Serialize SaveData to a JSON string. */
export function serializeSaveData(data: SaveData): string {
  return JSON.stringify(data);
}

/**
 * Deserialize a JSON string to SaveData.
 * Returns null if the string is invalid JSON or doesn't match the schema.
 */
export function deserializeSaveData(json: string): SaveData | null {
  try {
    const parsed: unknown = JSON.parse(json);
    if (!validateSaveData(parsed)) return null;
    return migrateSaveData(parsed);
  } catch {
    return null;
  }
}

// ============================================================================
// MIGRATION
// ============================================================================

/**
 * Migrate save data from an older version to the current version.
 * Currently a no-op (v1 is the only version), but provides a scaffold
 * for future upgrades.
 */
export function migrateSaveData(data: SaveData): SaveData {
  // v1 → current: no changes needed
  return data;
}

// ============================================================================
// PROGRESS QUERIES
// ============================================================================

/**
 * Is a level unlocked?
 * Level 0 is always unlocked. Level N is unlocked when level N-1 is completed.
 *
 * @param saveData  Current save data
 * @param levelIndex  Zero-based index into the level list
 * @param levelIds  Ordered array of all level IDs
 */
export function isLevelUnlocked(
  saveData: SaveData,
  levelIndex: number,
  levelIds: string[],
): boolean {
  if (levelIndex === 0) return true;
  if (levelIndex < 0 || levelIndex >= levelIds.length) return false;

  const prevId = levelIds[levelIndex - 1];
  const prev = saveData.levelProgress[prevId];
  return prev !== undefined && prev.completed;
}

/**
 * Get progress for a specific level.
 * Returns a default (not completed) record if no progress exists.
 */
export function getLevelProgress(saveData: SaveData, levelId: string): LevelProgress {
  return saveData.levelProgress[levelId] ?? { completed: false, bestTurns: null, bestEnergy: null };
}

/**
 * Record a level completion, returning a new SaveData.
 * Tracks best turns (minimum) and best energy remaining (maximum).
 * Original saveData is not mutated.
 */
export function recordLevelCompletion(
  saveData: SaveData,
  levelId: string,
  turns: number,
  energyRemaining: number,
): SaveData {
  const existing = getLevelProgress(saveData, levelId);

  const updated: LevelProgress = {
    completed: true,
    bestTurns:
      existing.bestTurns === null ? turns : Math.min(existing.bestTurns, turns),
    bestEnergy:
      existing.bestEnergy === null
        ? energyRemaining
        : Math.max(existing.bestEnergy, energyRemaining),
  };

  return {
    ...saveData,
    timestamp: new Date().toISOString(),
    levelProgress: {
      ...saveData.levelProgress,
      [levelId]: updated,
    },
  };
}

/** Count how many levels have been completed. */
export function getCompletedCount(saveData: SaveData): number {
  let count = 0;
  for (const id in saveData.levelProgress) {
    if (saveData.levelProgress[id].completed) {
      count++;
    }
  }
  return count;
}
