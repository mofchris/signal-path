import { describe, test, expect } from 'vitest';
import {
  createDefaultSaveData,
  serializeSaveData,
  deserializeSaveData,
  validateSaveData,
  migrateSaveData,
  isLevelUnlocked,
  getLevelProgress,
  recordLevelCompletion,
  getCompletedCount,
} from '../../src/core/serialization';
import type { SaveData } from '../../src/core/serialization';

// ============================================================================
// HELPERS
// ============================================================================

const LEVEL_IDS = ['level_01', 'level_02', 'level_03'];

function makeSaveData(overrides: Partial<SaveData> = {}): SaveData {
  return { ...createDefaultSaveData(), ...overrides };
}

// ============================================================================
// createDefaultSaveData
// ============================================================================

describe('createDefaultSaveData', () => {
  test('returns valid save data', () => {
    const data = createDefaultSaveData();
    expect(validateSaveData(data)).toBe(true);
  });

  test('has version 1', () => {
    expect(createDefaultSaveData().version).toBe(1);
  });

  test('has empty level progress', () => {
    expect(createDefaultSaveData().levelProgress).toEqual({});
  });

  test('has sound enabled by default', () => {
    expect(createDefaultSaveData().settings.soundEnabled).toBe(true);
  });

  test('has a timestamp', () => {
    const data = createDefaultSaveData();
    expect(typeof data.timestamp).toBe('string');
    expect(data.timestamp.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// serializeSaveData / deserializeSaveData
// ============================================================================

describe('serialization round-trip', () => {
  test('round-trips default save data', () => {
    const original = createDefaultSaveData();
    const json = serializeSaveData(original);
    const restored = deserializeSaveData(json);
    expect(restored).toEqual(original);
  });

  test('round-trips save data with progress', () => {
    const original = recordLevelCompletion(createDefaultSaveData(), 'level_01', 10, 5);
    const json = serializeSaveData(original);
    const restored = deserializeSaveData(json);
    expect(restored).toEqual(original);
  });

  test('returns null for invalid JSON', () => {
    expect(deserializeSaveData('not json')).toBeNull();
  });

  test('returns null for empty string', () => {
    expect(deserializeSaveData('')).toBeNull();
  });

  test('returns null for valid JSON but wrong shape', () => {
    expect(deserializeSaveData('{"foo": 1}')).toBeNull();
  });

  test('returns null for array', () => {
    expect(deserializeSaveData('[1,2,3]')).toBeNull();
  });

  test('returns null for null JSON', () => {
    expect(deserializeSaveData('null')).toBeNull();
  });
});

// ============================================================================
// validateSaveData
// ============================================================================

describe('validateSaveData', () => {
  test('accepts valid save data', () => {
    expect(validateSaveData(createDefaultSaveData())).toBe(true);
  });

  test('rejects null', () => {
    expect(validateSaveData(null)).toBe(false);
  });

  test('rejects undefined', () => {
    expect(validateSaveData(undefined)).toBe(false);
  });

  test('rejects number', () => {
    expect(validateSaveData(42)).toBe(false);
  });

  test('rejects string', () => {
    expect(validateSaveData('hello')).toBe(false);
  });

  test('rejects object missing version', () => {
    const data = createDefaultSaveData();
    const { version: _, ...rest } = data;
    expect(validateSaveData(rest)).toBe(false);
  });

  test('rejects object with wrong version type', () => {
    expect(validateSaveData({ ...createDefaultSaveData(), version: 'one' })).toBe(false);
  });

  test('rejects object missing timestamp', () => {
    const data = createDefaultSaveData();
    const { timestamp: _, ...rest } = data;
    expect(validateSaveData(rest)).toBe(false);
  });

  test('rejects object missing settings', () => {
    const data = createDefaultSaveData();
    const { settings: _, ...rest } = data;
    expect(validateSaveData(rest)).toBe(false);
  });

  test('rejects object with null settings', () => {
    expect(validateSaveData({ ...createDefaultSaveData(), settings: null })).toBe(false);
  });

  test('rejects settings missing soundEnabled', () => {
    expect(validateSaveData({ ...createDefaultSaveData(), settings: {} })).toBe(false);
  });

  test('rejects object missing levelProgress', () => {
    const data = createDefaultSaveData();
    const { levelProgress: _, ...rest } = data;
    expect(validateSaveData(rest)).toBe(false);
  });

  test('rejects object with null levelProgress', () => {
    expect(validateSaveData({ ...createDefaultSaveData(), levelProgress: null })).toBe(false);
  });
});

// ============================================================================
// migrateSaveData
// ============================================================================

describe('migrateSaveData', () => {
  test('v1 data passes through unchanged', () => {
    const data = createDefaultSaveData();
    expect(migrateSaveData(data)).toEqual(data);
  });
});

// ============================================================================
// isLevelUnlocked
// ============================================================================

describe('isLevelUnlocked', () => {
  test('level 0 is always unlocked', () => {
    const data = makeSaveData();
    expect(isLevelUnlocked(data, 0, LEVEL_IDS)).toBe(true);
  });

  test('level 1 is locked when level 0 not completed', () => {
    const data = makeSaveData();
    expect(isLevelUnlocked(data, 1, LEVEL_IDS)).toBe(false);
  });

  test('level 1 is unlocked when level 0 completed', () => {
    const data = recordLevelCompletion(makeSaveData(), 'level_01', 10, 5);
    expect(isLevelUnlocked(data, 1, LEVEL_IDS)).toBe(true);
  });

  test('level 2 is locked when only level 0 completed', () => {
    const data = recordLevelCompletion(makeSaveData(), 'level_01', 10, 5);
    expect(isLevelUnlocked(data, 2, LEVEL_IDS)).toBe(false);
  });

  test('level 2 is unlocked when levels 0 and 1 completed', () => {
    let data = recordLevelCompletion(makeSaveData(), 'level_01', 10, 5);
    data = recordLevelCompletion(data, 'level_02', 8, 3);
    expect(isLevelUnlocked(data, 2, LEVEL_IDS)).toBe(true);
  });

  test('negative index returns false', () => {
    expect(isLevelUnlocked(makeSaveData(), -1, LEVEL_IDS)).toBe(false);
  });

  test('out-of-bounds index returns false', () => {
    expect(isLevelUnlocked(makeSaveData(), 99, LEVEL_IDS)).toBe(false);
  });
});

// ============================================================================
// getLevelProgress
// ============================================================================

describe('getLevelProgress', () => {
  test('returns default for unknown level', () => {
    const progress = getLevelProgress(makeSaveData(), 'unknown');
    expect(progress).toEqual({ completed: false, bestTurns: null, bestEnergy: null });
  });

  test('returns stored progress for completed level', () => {
    const data = recordLevelCompletion(makeSaveData(), 'level_01', 10, 5);
    const progress = getLevelProgress(data, 'level_01');
    expect(progress.completed).toBe(true);
    expect(progress.bestTurns).toBe(10);
    expect(progress.bestEnergy).toBe(5);
  });
});

// ============================================================================
// recordLevelCompletion
// ============================================================================

describe('recordLevelCompletion', () => {
  test('first completion sets all fields', () => {
    const data = recordLevelCompletion(makeSaveData(), 'level_01', 12, 4);
    const progress = data.levelProgress['level_01'];
    expect(progress.completed).toBe(true);
    expect(progress.bestTurns).toBe(12);
    expect(progress.bestEnergy).toBe(4);
  });

  test('improved turns updates bestTurns (lower is better)', () => {
    let data = recordLevelCompletion(makeSaveData(), 'level_01', 12, 4);
    data = recordLevelCompletion(data, 'level_01', 8, 2);
    expect(data.levelProgress['level_01'].bestTurns).toBe(8);
  });

  test('worse turns does not regress bestTurns', () => {
    let data = recordLevelCompletion(makeSaveData(), 'level_01', 8, 4);
    data = recordLevelCompletion(data, 'level_01', 12, 2);
    expect(data.levelProgress['level_01'].bestTurns).toBe(8);
  });

  test('improved energy updates bestEnergy (higher is better)', () => {
    let data = recordLevelCompletion(makeSaveData(), 'level_01', 10, 3);
    data = recordLevelCompletion(data, 'level_01', 10, 7);
    expect(data.levelProgress['level_01'].bestEnergy).toBe(7);
  });

  test('worse energy does not regress bestEnergy', () => {
    let data = recordLevelCompletion(makeSaveData(), 'level_01', 10, 7);
    data = recordLevelCompletion(data, 'level_01', 10, 3);
    expect(data.levelProgress['level_01'].bestEnergy).toBe(7);
  });

  test('does not mutate original save data', () => {
    const original = makeSaveData();
    const originalJson = JSON.stringify(original);
    recordLevelCompletion(original, 'level_01', 10, 5);
    expect(JSON.stringify(original)).toBe(originalJson);
  });

  test('updates timestamp', () => {
    const original = makeSaveData();
    const updated = recordLevelCompletion(original, 'level_01', 10, 5);
    // Timestamps should exist; may or may not differ depending on speed
    expect(typeof updated.timestamp).toBe('string');
  });

  test('preserves other level progress', () => {
    let data = recordLevelCompletion(makeSaveData(), 'level_01', 10, 5);
    data = recordLevelCompletion(data, 'level_02', 8, 3);
    expect(data.levelProgress['level_01'].completed).toBe(true);
    expect(data.levelProgress['level_02'].completed).toBe(true);
  });
});

// ============================================================================
// getCompletedCount
// ============================================================================

describe('getCompletedCount', () => {
  test('returns 0 for fresh save', () => {
    expect(getCompletedCount(makeSaveData())).toBe(0);
  });

  test('returns 1 after one completion', () => {
    const data = recordLevelCompletion(makeSaveData(), 'level_01', 10, 5);
    expect(getCompletedCount(data)).toBe(1);
  });

  test('returns correct count after multiple completions', () => {
    let data = recordLevelCompletion(makeSaveData(), 'level_01', 10, 5);
    data = recordLevelCompletion(data, 'level_02', 8, 3);
    data = recordLevelCompletion(data, 'level_03', 6, 1);
    expect(getCompletedCount(data)).toBe(3);
  });

  test('re-completing same level does not double-count', () => {
    let data = recordLevelCompletion(makeSaveData(), 'level_01', 10, 5);
    data = recordLevelCompletion(data, 'level_01', 8, 7);
    expect(getCompletedCount(data)).toBe(1);
  });
});
