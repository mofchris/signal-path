/**
 * Vitest Test Setup File
 *
 * This file runs BEFORE all tests in the entire test suite.
 * It's configured in vite.config.ts under test.setupFiles.
 *
 * Purpose:
 * - Mock browser APIs that don't exist in Node.js test environment
 * - Set up global test utilities
 * - Configure test environment
 *
 * Why we need mocks:
 * - Our core logic should work in Node.js (no browser dependencies)
 * - But some files might reference localStorage, fetch, etc.
 * - Mocking these APIs allows tests to run without errors
 */

import { vi } from 'vitest';

// ============================================================================
// BROWSER API MOCKS
// ============================================================================

/**
 * Mock localStorage API
 *
 * localStorage is a browser API for storing key-value pairs persistently.
 * We'll use it later for saving game progress, but during tests we mock it
 * to avoid:
 * - Writing actual files to disk
 * - Tests interfering with each other's data
 * - Slowdowns from I/O operations
 *
 * The 'vi.fn()' creates a mock function that:
 * - Records how many times it was called
 * - Records what arguments it received
 * - Can be configured to return specific values
 */
global.localStorage = {
  getItem: vi.fn(),        // Retrieve value by key
  setItem: vi.fn(),        // Store value by key
  removeItem: vi.fn(),     // Delete value by key
  clear: vi.fn(),          // Delete all stored data
  length: 0,               // Number of items stored
  key: vi.fn(),            // Get key at index
} as unknown as Storage;

/**
 * Mock fetch API
 *
 * fetch is used for HTTP requests (e.g., loading level JSON files).
 * In tests, we mock it to:
 * - Avoid network requests (slow, unreliable)
 * - Control responses (test error handling)
 * - Work offline
 *
 * Tests that need fetch can configure the mock:
 * ```typescript
 * vi.mocked(fetch).mockResolvedValue({
 *   ok: true,
 *   json: () => Promise.resolve({ level: 'data' })
 * });
 * ```
 */
global.fetch = vi.fn();

// ============================================================================
// FUTURE SETUP (as needed)
// ============================================================================

/**
 * TODO: Add custom matchers if needed
 *
 * Vitest allows extending expect() with custom assertions:
 *
 * Example:
 * ```typescript
 * expect.extend({
 *   toBeWithinRange(received: number, floor: number, ceiling: number) {
 *     const pass = received >= floor && received <= ceiling;
 *     return {
 *       pass,
 *       message: () =>
 *         `expected ${received} to be within range ${floor} - ${ceiling}`,
 *     };
 *   },
 * });
 * ```
 *
 * This would let tests use:
 * ```typescript
 * expect(energy).toBeWithinRange(0, 10);
 * ```
 */

/**
 * TODO: Mock canvas API if needed
 *
 * If UI tests need canvas, we may need to mock:
 * - document.getElementById('canvas')
 * - canvas.getContext('2d')
 * - ctx.fillRect(), ctx.drawImage(), etc.
 *
 * For now, we test core logic only (no canvas needed).
 */
