# Signal Path - Coding Standards

**Last Updated**: 2026-01-22
**Purpose**: Documentation standards for all code in this project

---

## Comment Philosophy

**Every file should be self-documenting for:**
- Future developers (including yourself)
- Code reviewers
- Portfolio/resume reviewers
- Interviewers reading your code

**Good comments explain:**
- **Why** (not what) - code shows what, comments explain why
- **Design decisions** - why this approach over alternatives
- **Future TODOs** - what's planned but not yet implemented
- **Edge cases** - non-obvious behavior
- **Architecture** - how pieces fit together

---

## File Header Comments

Every file should start with a header explaining:
- What the file does
- Why it exists
- How it fits into the architecture
- Current status (if incomplete)

### Example:

```typescript
/**
 * Module Name - Brief Description
 *
 * This file is responsible for:
 * - Primary responsibility
 * - Secondary responsibility
 *
 * Architecture note:
 * - Where it fits in the system
 * - Dependencies/relationships
 *
 * Status: Complete/In Progress/Placeholder
 */
```

---

## Function Comments

Use JSDoc format for all public functions:

```typescript
/**
 * Brief description of what the function does
 *
 * More detailed explanation if needed.
 * Explain algorithm, edge cases, or design decisions.
 *
 * @param paramName - What this parameter is for
 * @returns What the function returns
 *
 * Example:
 * ```typescript
 * const result = myFunction(5);
 * ```
 */
export function myFunction(paramName: number): boolean {
  // Implementation
}
```

---

## Inline Comments

Use inline comments for:
- Non-obvious logic
- Workarounds or hacks
- Performance optimizations
- Edge case handling

### Good Examples:

```typescript
// Player at (1,1), wall at (2,1) - move right is blocked
if (!targetTile?.walkable) {
  return { valid: false, reason: 'Target tile is not walkable' };
}

// We use 4 directions (not 8) for simplicity - see ADR-011
const directions: Direction[] = ['up', 'down', 'left', 'right'];

// Energy = 0 is valid if player is on goal (they win)
if (state.energy <= 0 && !checkWinCondition(state)) {
  return 'energy';
}
```

### Bad Examples:

```typescript
// Set x to 5
const x = 5;

// Loop through array
for (const item of items) {
  // Process item
  process(item);
}
```

**Why these are bad:**
- They restate what the code already says
- They don't add information
- They become noise

---

## Section Dividers

Use section dividers in long files:

```typescript
// ============================================================================
// GRID SYSTEM
// ============================================================================

// Grid creation functions go here...

// ============================================================================
// POSITION UTILITIES
// ============================================================================

// Position helper functions go here...
```

---

## Test Comments

Tests should explain:
- What is being tested
- Why it matters
- Expected behavior
- Edge cases

### Example:

```typescript
describe('Grid System', () => {
  /**
   * Test: createGrid produces correct dimensions
   *
   * This verifies that the 2D array is created with:
   * - Correct width (number of columns)
   * - Correct height (number of rows)
   * - Row-major order (tiles[y][x])
   */
  it('should create grid with correct dimensions', () => {
    const grid = createGrid(5, 5);
    expect(grid.width).toBe(5);
    expect(grid.height).toBe(5);
  });
});
```

---

## TODO Comments

Format TODOs consistently:

```typescript
/**
 * TODO (Step 7): Make canvas size dynamic
 *
 * Currently hardcoded to 400x400. Should calculate based on:
 * - Grid dimensions (width * TILE_SIZE)
 * - HUD space needed
 * - Window size (responsive)
 */
canvas.width = 400;
canvas.height = 400;
```

**Format**: `TODO (context): description`

---

## Type Annotations

Add comments to complex types:

```typescript
/**
 * State of an interactable object (discriminated union)
 *
 * Uses TypeScript discriminated unions for type-safe handling.
 * The 'type' field determines which other fields are present.
 */
export type InteractableState =
  | { type: 'key'; color: KeyColor; collected: boolean }
  | { type: 'door'; color: KeyColor; locked: boolean };
```

---

## What NOT to Comment

**Don't comment:**
- Self-evident code
- Standard language features
- Obvious variable names
- Simple getters/setters

### Examples of Over-Commenting:

```typescript
// Get the player position
const pos = state.player.position;

// Return true
return true;

// Define interface
interface Position {
  x: number; // x coordinate
  y: number; // y coordinate
}
```

---

## Architecture Comments

Reference architecture docs when relevant:

```typescript
/**
 * This implements the Command Pattern for actions.
 * See DECISIONS.md ADR-007 for rationale.
 */

/**
 * We use Canvas 2D (not WebGL) for rendering.
 * See DECISIONS.md ADR-020 for why.
 */
```

---

## Future Implementation Comments

Mark incomplete features clearly:

```typescript
/**
 * FUTURE IMPLEMENTATION (Phase 2)
 *
 * This will include:
 * 1. Hazard collision detection
 * 2. Key collection
 * 3. Door unlocking
 *
 * For now, these features are not implemented.
 */
```

---

## Code Examples in Comments

Include examples for complex functions:

```typescript
/**
 * Apply a direction vector to a position
 *
 * Example:
 * ```typescript
 * const pos = { x: 5, y: 5 };
 * const delta = DIRECTION_VECTORS.up; // { x: 0, y: -1 }
 * const newPos = addPositions(pos, delta); // { x: 5, y: 4 }
 * ```
 */
export function addPositions(a: Position, b: Position): Position {
  return { x: a.x + b.x, y: a.y + b.y };
}
```

---

## Standards Checklist

Before committing code, verify:

- [ ] File header explains purpose and status
- [ ] All public functions have JSDoc comments
- [ ] Complex logic has inline explanations
- [ ] Tests explain what and why
- [ ] TODOs are formatted consistently
- [ ] No obvious comments (restating code)
- [ ] Section dividers in long files
- [ ] Examples included for complex functions
- [ ] References to architecture docs where relevant

---

## Why This Matters

**For this project specifically:**
- This is a **portfolio/resume project**
- Interviewers **will read your code**
- Good comments demonstrate:
  - Communication skills
  - Architectural thinking
  - Consideration for maintainability
  - Professional practices

**Well-commented code signals:**
- "I can explain my decisions"
- "I think about future maintainers"
- "I understand software engineering, not just coding"

---

## Examples from This Project

**Great examples to reference:**
- `src/core/types.ts` - Comprehensive type documentation
- `src/ui/main.ts` - Explains placeholder vs. future implementation
- `tests/setup.ts` - Explains why mocks are needed
- `tests/core/types.test.ts` - Each test explains what and why

---

**Remember**: Comments are part of the code. They should be maintained, updated, and reviewed just like the code itself.
