/**
 * LocalStorage Adapter
 *
 * Thin wrapper around browser localStorage for save data persistence.
 * This is the ONLY file that touches the Storage API.
 *
 * All operations are wrapped in try/catch to handle:
 * - Private/incognito browsing (storage may be disabled)
 * - Storage quota exceeded
 * - SecurityError from iframe sandboxing
 */

import { createDefaultSaveData, serializeSaveData, deserializeSaveData } from '../core/serialization';
import type { SaveData } from '../core/serialization';

const STORAGE_KEY = 'signal-path-save';

/**
 * Load save data from localStorage.
 * Returns default save data if nothing is stored or data is corrupt.
 */
export function loadSaveData(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return createDefaultSaveData();

    const data = deserializeSaveData(raw);
    if (data === null) {
      console.warn('Corrupt save data found, starting fresh');
      return createDefaultSaveData();
    }

    return data;
  } catch {
    console.warn('Could not read localStorage, starting fresh');
    return createDefaultSaveData();
  }
}

/**
 * Persist save data to localStorage.
 */
export function persistSaveData(data: SaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, serializeSaveData(data));
  } catch {
    console.warn('Could not write to localStorage');
  }
}

/**
 * Clear save data from localStorage.
 */
export function clearSaveData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    console.warn('Could not clear localStorage');
  }
}
