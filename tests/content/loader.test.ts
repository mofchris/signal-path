/**
 * Tests for Level Loader Module
 *
 * Tests the level loading functionality including:
 * - Level data validation
 * - Level manifest queries
 * - Error handling
 */

import { describe, it, expect } from 'vitest';
import {
  validateLevelData,
  getLevelList,
  getLevelCount,
  levelExists,
  getLevelInfo,
  getNextLevelId,
  getPreviousLevelId,
} from '../../src/content/loader';

// ============================================================================
// VALIDATION TESTS
// ============================================================================

describe('validateLevelData', () => {
  describe('valid levels', () => {
    it('should validate a minimal valid level', () => {
      const level = {
        id: 'test_level',
        name: 'Test Level',
        version: '1.0.0',
        width: 5,
        height: 5,
        playerStart: { x: 0, y: 0 },
        goal: { x: 4, y: 4 },
        energy: 10,
        tiles: [],
      };

      const result = validateLevelData(level);
      expect(result.valid).toBe(true);
    });

    it('should validate a level with hazards', () => {
      const level = {
        id: 'hazard_level',
        name: 'Hazard Level',
        version: '1.0.0',
        width: 10,
        height: 10,
        playerStart: { x: 0, y: 0 },
        goal: { x: 9, y: 9 },
        energy: 20,
        tiles: [],
        hazards: [{ id: 'spike1', x: 5, y: 5, type: 'spike' }],
      };

      const result = validateLevelData(level);
      expect(result.valid).toBe(true);
    });

    it('should validate a level with interactables', () => {
      const level = {
        id: 'key_level',
        name: 'Key Level',
        version: '1.0.0',
        width: 8,
        height: 8,
        playerStart: { x: 0, y: 0 },
        goal: { x: 7, y: 7 },
        energy: 15,
        tiles: [],
        interactables: [
          { id: 'key1', x: 2, y: 2, type: 'key', color: 'red' },
          { id: 'door1', x: 5, y: 5, type: 'door', color: 'red' },
        ],
      };

      const result = validateLevelData(level);
      expect(result.valid).toBe(true);
    });
  });

  describe('invalid levels', () => {
    it('should reject non-object data', () => {
      expect(validateLevelData(null).valid).toBe(false);
      expect(validateLevelData('string').valid).toBe(false);
      expect(validateLevelData(123).valid).toBe(false);
      expect(validateLevelData([]).valid).toBe(false);
    });

    it('should reject missing required string fields', () => {
      const baseLevel = {
        id: 'test',
        name: 'Test',
        version: '1.0.0',
        width: 5,
        height: 5,
        playerStart: { x: 0, y: 0 },
        goal: { x: 4, y: 4 },
        energy: 10,
        tiles: [],
      };

      // Missing id
      const noId = { ...baseLevel, id: undefined };
      expect(validateLevelData(noId).valid).toBe(false);

      // Missing name
      const noName = { ...baseLevel, name: undefined };
      expect(validateLevelData(noName).valid).toBe(false);

      // Missing version
      const noVersion = { ...baseLevel, version: undefined };
      expect(validateLevelData(noVersion).valid).toBe(false);
    });

    it('should reject missing required number fields', () => {
      const baseLevel = {
        id: 'test',
        name: 'Test',
        version: '1.0.0',
        width: 5,
        height: 5,
        playerStart: { x: 0, y: 0 },
        goal: { x: 4, y: 4 },
        energy: 10,
        tiles: [],
      };

      // Missing width
      const noWidth = { ...baseLevel, width: undefined };
      expect(validateLevelData(noWidth).valid).toBe(false);

      // Missing height
      const noHeight = { ...baseLevel, height: undefined };
      expect(validateLevelData(noHeight).valid).toBe(false);

      // Missing energy
      const noEnergy = { ...baseLevel, energy: undefined };
      expect(validateLevelData(noEnergy).valid).toBe(false);
    });

    it('should reject invalid grid dimensions', () => {
      const baseLevel = {
        id: 'test',
        name: 'Test',
        version: '1.0.0',
        playerStart: { x: 0, y: 0 },
        goal: { x: 4, y: 4 },
        energy: 10,
        tiles: [],
      };

      // Width too small
      expect(validateLevelData({ ...baseLevel, width: 3, height: 5 }).valid).toBe(false);

      // Width too large
      expect(validateLevelData({ ...baseLevel, width: 25, height: 5 }).valid).toBe(false);

      // Height too small
      expect(validateLevelData({ ...baseLevel, width: 5, height: 2 }).valid).toBe(false);

      // Height too large
      expect(validateLevelData({ ...baseLevel, width: 5, height: 30 }).valid).toBe(false);
    });

    it('should reject invalid playerStart position', () => {
      const baseLevel = {
        id: 'test',
        name: 'Test',
        version: '1.0.0',
        width: 5,
        height: 5,
        goal: { x: 4, y: 4 },
        energy: 10,
        tiles: [],
      };

      // Missing playerStart
      expect(validateLevelData({ ...baseLevel, playerStart: undefined }).valid).toBe(false);

      // Invalid playerStart type
      expect(validateLevelData({ ...baseLevel, playerStart: 'bad' }).valid).toBe(false);

      // Out of bounds
      expect(validateLevelData({ ...baseLevel, playerStart: { x: 10, y: 0 } }).valid).toBe(false);
      expect(validateLevelData({ ...baseLevel, playerStart: { x: 0, y: 10 } }).valid).toBe(false);
      expect(validateLevelData({ ...baseLevel, playerStart: { x: -1, y: 0 } }).valid).toBe(false);
    });

    it('should reject invalid goal position', () => {
      const baseLevel = {
        id: 'test',
        name: 'Test',
        version: '1.0.0',
        width: 5,
        height: 5,
        playerStart: { x: 0, y: 0 },
        energy: 10,
        tiles: [],
      };

      // Missing goal
      expect(validateLevelData({ ...baseLevel, goal: undefined }).valid).toBe(false);

      // Out of bounds
      expect(validateLevelData({ ...baseLevel, goal: { x: 5, y: 4 } }).valid).toBe(false);
    });

    it('should reject invalid optional arrays', () => {
      const baseLevel = {
        id: 'test',
        name: 'Test',
        version: '1.0.0',
        width: 5,
        height: 5,
        playerStart: { x: 0, y: 0 },
        goal: { x: 4, y: 4 },
        energy: 10,
        tiles: [],
      };

      // Invalid tiles type
      expect(validateLevelData({ ...baseLevel, tiles: 'bad' }).valid).toBe(false);

      // Invalid hazards type
      expect(validateLevelData({ ...baseLevel, hazards: 'bad' }).valid).toBe(false);

      // Invalid interactables type
      expect(validateLevelData({ ...baseLevel, interactables: 'bad' }).valid).toBe(false);
    });
  });
});

// ============================================================================
// MANIFEST TESTS
// ============================================================================

describe('Level Manifest', () => {
  describe('getLevelList', () => {
    it('should return an array of level info', () => {
      const levels = getLevelList();
      expect(Array.isArray(levels)).toBe(true);
      expect(levels.length).toBeGreaterThan(0);
    });

    it('should include required properties for each level', () => {
      const levels = getLevelList();
      for (const level of levels) {
        expect(level).toHaveProperty('id');
        expect(level).toHaveProperty('name');
        expect(level).toHaveProperty('filename');
        expect(typeof level.id).toBe('string');
        expect(typeof level.name).toBe('string');
        expect(typeof level.filename).toBe('string');
      }
    });

    it('should return a copy (not modify original)', () => {
      const levels1 = getLevelList();
      const levels2 = getLevelList();
      expect(levels1).not.toBe(levels2);
      expect(levels1).toEqual(levels2);
    });
  });

  describe('getLevelCount', () => {
    it('should return the number of levels', () => {
      const count = getLevelCount();
      const list = getLevelList();
      expect(count).toBe(list.length);
    });
  });

  describe('levelExists', () => {
    it('should return true for existing levels', () => {
      const levels = getLevelList();
      for (const level of levels) {
        expect(levelExists(level.id)).toBe(true);
      }
    });

    it('should return false for non-existing levels', () => {
      expect(levelExists('nonexistent_level')).toBe(false);
      expect(levelExists('')).toBe(false);
    });
  });

  describe('getLevelInfo', () => {
    it('should return level info for existing levels', () => {
      const levels = getLevelList();
      const firstLevel = levels[0];
      const info = getLevelInfo(firstLevel.id);

      expect(info).toBeDefined();
      expect(info?.id).toBe(firstLevel.id);
      expect(info?.name).toBe(firstLevel.name);
    });

    it('should return undefined for non-existing levels', () => {
      expect(getLevelInfo('nonexistent')).toBeUndefined();
    });
  });

  describe('getNextLevelId', () => {
    it('should return next level ID', () => {
      const levels = getLevelList();
      if (levels.length >= 2) {
        const nextId = getNextLevelId(levels[0].id);
        expect(nextId).toBe(levels[1].id);
      }
    });

    it('should return undefined for last level', () => {
      const levels = getLevelList();
      const lastLevel = levels[levels.length - 1];
      expect(getNextLevelId(lastLevel.id)).toBeUndefined();
    });

    it('should return undefined for non-existing level', () => {
      expect(getNextLevelId('nonexistent')).toBeUndefined();
    });
  });

  describe('getPreviousLevelId', () => {
    it('should return previous level ID', () => {
      const levels = getLevelList();
      if (levels.length >= 2) {
        const prevId = getPreviousLevelId(levels[1].id);
        expect(prevId).toBe(levels[0].id);
      }
    });

    it('should return undefined for first level', () => {
      const levels = getLevelList();
      expect(getPreviousLevelId(levels[0].id)).toBeUndefined();
    });

    it('should return undefined for non-existing level', () => {
      expect(getPreviousLevelId('nonexistent')).toBeUndefined();
    });
  });
});
