/**
 * Test Setup Verification
 *
 * This is a sanity check test file to verify that:
 * - Vitest test framework is configured correctly
 * - Tests can run and pass
 * - Test infrastructure is working (imports, assertions, etc.)
 *
 * This file can be deleted later once we have real tests,
 * but it's useful for initial setup verification.
 */

import { describe, it, expect } from 'vitest';

/**
 * Test group: Basic test infrastructure
 */
describe('Test Setup', () => {
  /**
   * Sanity check: Can we run a test?
   * This verifies that Vitest is working at all.
   */
  it('should run tests successfully', () => {
    expect(true).toBe(true);
  });

  /**
   * Basic assertion check: Do assertions work?
   * This verifies that expect() and matchers are working.
   */
  it('should perform basic arithmetic', () => {
    expect(2 + 2).toBe(4);
  });

  /**
   * Type checking: Does TypeScript work in tests?
   * This verifies that our tsconfig.json is correctly applied to tests.
   */
  it('should handle TypeScript types', () => {
    const message: string = 'Hello, TypeScript!';
    expect(message).toContain('TypeScript');
  });

  /**
   * Object comparison: Do deep equality checks work?
   * This is important because our game state uses nested objects.
   */
  it('should compare objects correctly', () => {
    const obj1 = { x: 5, y: 10 };
    const obj2 = { x: 5, y: 10 };
    expect(obj1).toEqual(obj2); // .toEqual() does deep comparison
    expect(obj1).not.toBe(obj2); // .toBe() checks reference equality
  });
});
