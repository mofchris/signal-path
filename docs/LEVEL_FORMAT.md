# Level Format Specification
## Signal Path

**Last updated**: 2025-01-22  
**Document version**: 1.0  
**Schema version**: 1.0.0

---

## Document Purpose

This document is the **authoritative specification** for level file format in Signal Path. It defines:
- JSON schema for level files
- Validation rules and constraints
- Complete property reference
- Multiple annotated examples
- Level design guidelines
- Common mistakes and how to avoid them

**For level creators**: This is your complete guide to creating valid, playable, well-designed levels.

---

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [JSON Schema Specification](#json-schema-specification)
3. [Property Reference](#property-reference)
4. [Validation Rules](#validation-rules)
5. [Complete Examples](#complete-examples)
6. [Level Design Guidelines](#level-design-guidelines)
7. [Energy Budget Calculation](#energy-budget-calculation)
8. [Common Mistakes](#common-mistakes)
9. [Testing Your Levels](#testing-your-levels)
10. [Validation Tools](#validation-tools)
11. [Troubleshooting Guide](#troubleshooting-guide)
12. [Schema Versioning](#schema-versioning)

---

## Quick Reference

### Minimal Valid Level

```json
{
  "id": "level_01",
  "name": "First Steps",
  "version": "1.0.0",
  "width": 5,
  "height": 5,
  "playerStart": { "x": 0, "y": 0 },
  "goal": { "x": 4, "y": 4 },
  "energy": 10,
  "tiles": []
}
```

### File Naming Convention

```
content/levels/[NUMBER]_[NAME].json

Examples:
- 01_tutorial.json
- 02_first_hazard.json
- 03_keys_and_doors.json
- 10_efficiency_challenge.json
```

### Required Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique level identifier |
| `name` | string | Display name for UI |
| `version` | string | Schema version (semver) |
| `width` | number | Grid width (5–20) |
| `height` | number | Grid height (5–20) |
| `playerStart` | Position | Starting position |
| `goal` | Position | Win condition position |
| `energy` | number | Energy budget |
| `tiles` | Tile[] | Tile definitions (walls, etc.) |

### Optional Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `description` | string | `""` | Level description/hint |
| `hazards` | Hazard[] | `[]` | Hazard entities |
| `interactables` | Interactable[] | `[]` | Keys, doors, switches |
| `metadata` | object | `{}` | Author, difficulty, tags |

---

## JSON Schema Specification

### Full Schema (JSON Schema Draft-07)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://signalpath.game/schemas/level-1.0.0.json",
  "title": "Signal Path Level",
  "description": "Level definition for Signal Path game",
  "type": "object",
  "required": ["id", "name", "version", "width", "height", "playerStart", "goal", "energy", "tiles"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[a-z0-9_]+$",
      "minLength": 1,
      "maxLength": 50,
      "description": "Unique identifier (lowercase, numbers, underscores only)"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "description": "Human-readable level name"
    },
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "Schema version (semantic versioning)"
    },
    "width": {
      "type": "integer",
      "minimum": 5,
      "maximum": 20,
      "description": "Grid width in tiles"
    },
    "height": {
      "type": "integer",
      "minimum": 5,
      "maximum": 20,
      "description": "Grid height in tiles"
    },
    "playerStart": {
      "$ref": "#/definitions/Position",
      "description": "Player starting position"
    },
    "goal": {
      "$ref": "#/definitions/Position",
      "description": "Goal position (win condition)"
    },
    "energy": {
      "type": "integer",
      "minimum": 1,
      "maximum": 1000,
      "description": "Energy budget for the level"
    },
    "description": {
      "type": "string",
      "maxLength": 500,
      "description": "Optional level description or hint"
    },
    "tiles": {
      "type": "array",
      "items": { "$ref": "#/definitions/Tile" },
      "description": "Tile definitions (only non-default tiles)"
    },
    "hazards": {
      "type": "array",
      "items": { "$ref": "#/definitions/Hazard" },
      "description": "Hazard entities"
    },
    "interactables": {
      "type": "array",
      "items": { "$ref": "#/definitions/Interactable" },
      "description": "Keys, doors, switches"
    },
    "metadata": {
      "type": "object",
      "properties": {
        "author": { "type": "string" },
        "difficulty": { "type": "integer", "minimum": 1, "maximum": 10 },
        "tags": { "type": "array", "items": { "type": "string" } },
        "parMoves": { "type": "integer", "minimum": 1 },
        "parEnergy": { "type": "integer", "minimum": 1 }
      },
      "description": "Optional metadata for level organization"
    }
  },
  "definitions": {
    "Position": {
      "type": "object",
      "required": ["x", "y"],
      "properties": {
        "x": { "type": "integer", "minimum": 0 },
        "y": { "type": "integer", "minimum": 0 }
      }
    },
    "Tile": {
      "type": "object",
      "required": ["x", "y", "type"],
      "properties": {
        "x": { "type": "integer", "minimum": 0 },
        "y": { "type": "integer", "minimum": 0 },
        "type": {
          "type": "string",
          "enum": ["empty", "wall", "goal"]
        }
      }
    },
    "Hazard": {
      "type": "object",
      "required": ["id", "x", "y", "type"],
      "properties": {
        "id": { "type": "string" },
        "x": { "type": "integer", "minimum": 0 },
        "y": { "type": "integer", "minimum": 0 },
        "type": {
          "type": "string",
          "enum": ["spike", "laser", "fire"]
        },
        "active": { "type": "boolean", "default": true }
      }
    },
    "Interactable": {
      "type": "object",
      "required": ["id", "x", "y", "type"],
      "properties": {
        "id": { "type": "string" },
        "x": { "type": "integer", "minimum": 0 },
        "y": { "type": "integer", "minimum": 0 },
        "type": {
          "type": "string",
          "enum": ["key", "door"]
        },
        "color": {
          "type": "string",
          "enum": ["red", "blue", "green", "yellow"]
        }
      }
    }
  }
}
```

---

## Property Reference

### Root Level Properties

#### `id` (required)
- **Type**: `string`
- **Pattern**: `^[a-z0-9_]+$` (lowercase letters, numbers, underscores only)
- **Length**: 1–50 characters
- **Description**: Unique identifier for the level
- **Example**: `"level_01"`, `"tutorial_movement"`, `"challenge_10"`
- **Rules**:
  - Must be unique across all levels
  - Used internally for level loading
  - Should be descriptive but concise
  - No spaces, special characters, or uppercase

#### `name` (required)
- **Type**: `string`
- **Length**: 1–100 characters
- **Description**: Human-readable display name
- **Example**: `"First Steps"`, `"The Energy Crisis"`, `"Locked Passage"`
- **Rules**:
  - Shown in UI (level select, HUD)
  - Can contain any characters
  - Should be descriptive and engaging
  - Keep it short (2–5 words ideal)

#### `version` (required)
- **Type**: `string`
- **Pattern**: Semantic versioning `MAJOR.MINOR.PATCH`
- **Description**: Schema version this level conforms to
- **Example**: `"1.0.0"`
- **Current version**: `"1.0.0"`
- **Rules**:
  - Must match current schema version
  - Used for schema migration in future
  - Always use three numbers (X.Y.Z)

#### `width` (required)
- **Type**: `integer`
- **Range**: 5–20
- **Description**: Grid width in tiles
- **Example**: `10`
- **Rules**:
  - Minimum 5 (anything smaller is trivial)
  - Maximum 20 (anything larger is hard to visualize)
  - Consider screen size (8–12 works well for most displays)

#### `height` (required)
- **Type**: `integer`
- **Range**: 5–20
- **Description**: Grid height in tiles
- **Example**: `10`
- **Rules**:
  - Same constraints as width
  - Doesn't have to match width (rectangular grids allowed)

#### `playerStart` (required)
- **Type**: `Position` object `{ x: number, y: number }`
- **Description**: Player's starting position
- **Example**: `{ "x": 0, "y": 0 }`
- **Rules**:
  - Must be within grid bounds (0 ≤ x < width, 0 ≤ y < height)
  - Must be a walkable tile (not a wall)
  - Should not be on a hazard (instant lose)
  - Can be on a key (player will collect it immediately)

#### `goal` (required)
- **Type**: `Position` object `{ x: number, y: number }`
- **Description**: Goal position (win condition)
- **Example**: `{ "x": 9, "y": 9 }`
- **Rules**:
  - Must be within grid bounds
  - Must be walkable
  - Must be reachable from playerStart
  - Can be on same tile as hazard (hazard takes priority = lose)

#### `energy` (required)
- **Type**: `integer`
- **Range**: 1–1000
- **Description**: Energy budget (number of moves allowed)
- **Example**: `15`
- **Rules**:
  - Must be at least the minimum moves to reach goal
  - Tutorial levels: 150%+ of optimal path
  - Challenge levels: 110–120% of optimal path
  - See [Energy Budget Calculation](#energy-budget-calculation)

#### `description` (optional)
- **Type**: `string`
- **Length**: 0–500 characters
- **Default**: `""`
- **Description**: Level description, hint, or flavor text
- **Example**: `"Learn the basics: reach the goal before energy runs out."`
- **Rules**:
  - Shown in level select screen
  - Keep it brief (1–2 sentences)
  - Can provide hints without spoiling solution

#### `tiles` (required, can be empty array)
- **Type**: `Array<Tile>`
- **Description**: Defines non-default tiles (walls, special tiles)
- **Default behavior**: Any tile not in this array is "empty" (walkable)
- **Example**: `[{ "x": 1, "y": 0, "type": "wall" }]`
- **Rules**:
  - Only include tiles that differ from default (empty/walkable)
  - Walls are the most common tile type
  - Goal tile can be defined here OR it's implicit from `goal` position

#### `hazards` (optional)
- **Type**: `Array<Hazard>`
- **Default**: `[]`
- **Description**: Hazard entities (spikes, lasers, fire)
- **Example**: `[{ "id": "h1", "x": 2, "y": 2, "type": "spike" }]`
- **Rules**:
  - Each hazard must have unique ID
  - Hazard positions must be within bounds
  - Hazards can overlap with goal (hazard takes priority)

#### `interactables` (optional)
- **Type**: `Array<Interactable>`
- **Default**: `[]`
- **Description**: Keys, doors, switches
- **Example**: `[{ "id": "key1", "x": 1, "y": 1, "type": "key", "color": "red" }]`
- **Rules**:
  - Each must have unique ID
  - Keys and doors must have matching colors
  - Every door must have a corresponding key somewhere

#### `metadata` (optional)
- **Type**: `object`
- **Default**: `{}`
- **Description**: Extra information for organization
- **Properties**:
  - `author`: Level creator name
  - `difficulty`: Subjective difficulty (1–10)
  - `tags`: Array of tags (e.g., `["tutorial", "hazards"]`)
  - `parMoves`: Optimal solution move count
  - `parEnergy`: Energy remaining in optimal solution
- **Rules**:
  - Not used by game logic
  - Useful for level browser, sorting, filtering

---

## Validation Rules

### Structural Validation (JSON Schema)

These are enforced by the JSON Schema:
1. All required fields present
2. Types are correct (string, number, etc.)
3. Numbers in valid ranges
4. Strings match patterns (e.g., ID format)
5. Arrays contain valid items

### Semantic Validation (Game Logic)

These are enforced by `src/core/validation.ts`:

#### Grid Validation
- ✅ Width and height within bounds (5–20)
- ✅ No duplicate tile definitions (same x, y)
- ✅ All positions reference valid coordinates

#### Position Validation
- ✅ `playerStart` is within bounds
- ✅ `playerStart` is walkable (not a wall)
- ✅ `goal` is within bounds
- ✅ `goal` is walkable

#### Reachability Validation (Critical!)
- ✅ Goal is reachable from player start (pathfinding check)
- ✅ All keys are reachable (if doors exist)
- ✅ Path exists even with doors locked (keys accessible)

#### Energy Validation
- ✅ Energy ≥ minimum moves to reach goal
- ✅ Energy > 0
- ✅ Energy is reasonable (not 10,000 for a 5x5 grid)

#### Entity Validation
- ✅ All hazard IDs are unique
- ✅ All interactable IDs are unique
- ✅ Hazard positions are within bounds
- ✅ Interactable positions are within bounds

#### Key-Door Validation
- ✅ Every door has at least one key of matching color
- ✅ Keys are accessible before their doors
- ✅ No orphaned keys (keys without doors are OK but wasteful)

#### Hazard Placement Validation
- ✅ Player start is not on a hazard (instant lose)
- ✅ Goal can be reached without stepping on hazards (or with acceptable hazard path)

### Validation Error Messages

Well-formed error messages help debug levels:

```json
{
  "valid": false,
  "errors": [
    {
      "code": "UNREACHABLE_GOAL",
      "message": "Goal at (9, 9) is unreachable from player start at (0, 0)",
      "details": {
        "playerStart": { "x": 0, "y": 0 },
        "goal": { "x": 9, "y": 9 }
      }
    }
  ]
}
```

---

## Complete Examples

### Example 1: Minimal Tutorial Level

**File**: `content/levels/01_first_steps.json`

```json
{
  "id": "first_steps",
  "name": "First Steps",
  "version": "1.0.0",
  "width": 5,
  "height": 5,
  "playerStart": { "x": 0, "y": 0 },
  "goal": { "x": 4, "y": 4 },
  "energy": 12,
  "description": "Welcome! Reach the goal before your energy runs out.",
  "tiles": [],
  "metadata": {
    "author": "Tutorial",
    "difficulty": 1,
    "tags": ["tutorial", "movement"],
    "parMoves": 8,
    "parEnergy": 4
  }
}
```

**Visual representation**:
```
P . . . .    P = Player start
. . . . .    G = Goal
. . . . .    . = Empty (walkable)
. . . . .
. . . . G
```

**Notes**:
- Completely open grid (no obstacles)
- Minimum moves: 8 (4 right + 4 down)
- Energy: 12 (150% of minimum = forgiving)
- Perfect for teaching basic movement

---

### Example 2: Simple Hazard Level

**File**: `content/levels/02_first_hazard.json`

```json
{
  "id": "first_hazard",
  "name": "Danger Zone",
  "version": "1.0.0",
  "width": 7,
  "height": 5,
  "playerStart": { "x": 0, "y": 2 },
  "goal": { "x": 6, "y": 2 },
  "energy": 10,
  "description": "Avoid the spikes!",
  "tiles": [
    { "x": 3, "y": 0, "type": "wall" },
    { "x": 3, "y": 1, "type": "wall" },
    { "x": 3, "y": 3, "type": "wall" },
    { "x": 3, "y": 4, "type": "wall" }
  ],
  "hazards": [
    { "id": "spike1", "x": 3, "y": 2, "type": "spike" }
  ],
  "metadata": {
    "difficulty": 2,
    "tags": ["hazards", "obstacles"],
    "parMoves": 8
  }
}
```

**Visual representation**:
```
. . . # . . .    P = Player start (0, 2)
. . . # . . .    G = Goal (6, 2)
P . . X . . G    # = Wall
. . . # . . .    X = Spike hazard
. . . # . . .    . = Empty
```

**Notes**:
- Player must go around wall
- Spike blocks direct path through gap
- Teaches: obstacles + hazards
- Optimal path: up or down around wall

---

### Example 3: Key and Door Level

**File**: `content/levels/03_locked_passage.json`

```json
{
  "id": "locked_passage",
  "name": "Locked Passage",
  "version": "1.0.0",
  "width": 9,
  "height": 5,
  "playerStart": { "x": 0, "y": 2 },
  "goal": { "x": 8, "y": 2 },
  "energy": 18,
  "description": "Find the key to unlock the door.",
  "tiles": [
    { "x": 4, "y": 0, "type": "wall" },
    { "x": 4, "y": 1, "type": "wall" },
    { "x": 4, "y": 3, "type": "wall" },
    { "x": 4, "y": 4, "type": "wall" }
  ],
  "interactables": [
    {
      "id": "key_red_1",
      "x": 2,
      "y": 0,
      "type": "key",
      "color": "red"
    },
    {
      "id": "door_red_1",
      "x": 4,
      "y": 2,
      "type": "door",
      "color": "red"
    }
  ],
  "metadata": {
    "difficulty": 3,
    "tags": ["keys", "doors", "exploration"],
    "parMoves": 14
  }
}
```

**Visual representation**:
```
. . K . # . . . .    P = Player start (0, 2)
. . . . # . . . .    G = Goal (8, 2)
P . . . D . . . G    K = Red key (2, 0)
. . . . # . . . .    D = Red door (4, 2)
. . . . # . . . .    # = Wall
```

**Notes**:
- Key is accessible (top-left area)
- Door blocks direct path
- Player must: go up → get key → return → go through door → reach goal
- Teaches: backtracking, unlocking

---

### Example 4: Complex Multi-Mechanic Level

**File**: `content/levels/10_the_gauntlet.json`

```json
{
  "id": "the_gauntlet",
  "name": "The Gauntlet",
  "version": "1.0.0",
  "width": 12,
  "height": 8,
  "playerStart": { "x": 1, "y": 4 },
  "goal": { "x": 10, "y": 4 },
  "energy": 35,
  "description": "Navigate hazards, collect keys, and conserve energy.",
  "tiles": [
    { "x": 3, "y": 2, "type": "wall" },
    { "x": 3, "y": 3, "type": "wall" },
    { "x": 3, "y": 4, "type": "wall" },
    { "x": 3, "y": 5, "type": "wall" },
    { "x": 6, "y": 1, "type": "wall" },
    { "x": 6, "y": 2, "type": "wall" },
    { "x": 6, "y": 5, "type": "wall" },
    { "x": 6, "y": 6, "type": "wall" },
    { "x": 9, "y": 2, "type": "wall" },
    { "x": 9, "y": 3, "type": "wall" },
    { "x": 9, "y": 4, "type": "wall" },
    { "x": 9, "y": 5, "type": "wall" }
  ],
  "hazards": [
    { "id": "spike_1", "x": 5, "y": 3, "type": "spike" },
    { "id": "spike_2", "x": 5, "y": 4, "type": "spike" },
    { "id": "laser_1", "x": 7, "y": 3, "type": "laser" },
    { "id": "laser_2", "x": 7, "y": 4, "type": "laser" }
  ],
  "interactables": [
    {
      "id": "key_blue",
      "x": 2,
      "y": 1,
      "type": "key",
      "color": "blue"
    },
    {
      "id": "door_blue",
      "x": 6,
      "y": 3,
      "type": "door",
      "color": "blue"
    },
    {
      "id": "key_red",
      "x": 8,
      "y": 1,
      "type": "key",
      "color": "red"
    },
    {
      "id": "door_red",
      "x": 9,
      "y": 4,
      "type": "door",
      "color": "red"
    }
  ],
  "metadata": {
    "difficulty": 7,
    "tags": ["challenge", "multi-mechanic", "efficiency"],
    "parMoves": 28,
    "parEnergy": 7
  }
}
```

**Notes**:
- Multiple walls creating chambers
- Two key-door pairs (blue and red)
- Hazards blocking direct paths
- Requires careful planning and backtracking
- Energy is tight (125% of optimal)

---

## Level Design Guidelines

### Progression Principles

#### Levels 1-3: Pure Tutorial
- **Focus**: One mechanic at a time
- **Complexity**: Minimal
- **Energy**: 150–200% of optimal
- **Grid size**: 5x5 to 8x8
- **Mechanics introduced**:
  - Level 1: Movement, goal, energy
  - Level 2: Walls, simple obstacles
  - Level 3: First hazard (static spike)

#### Levels 4-6: Mechanic Introduction
- **Focus**: Introduce all core mechanics
- **Complexity**: Low to medium
- **Energy**: 130–150% of optimal
- **Grid size**: 8x8 to 10x10
- **New mechanics**:
  - Keys and doors
  - Multiple hazard types
  - Simple pathing puzzles

#### Levels 7-12: Combination & Challenge
- **Focus**: Combine multiple mechanics
- **Complexity**: Medium
- **Energy**: 120–130% of optimal
- **Grid size**: 10x10 to 14x14
- **Puzzles**:
  - Multi-key sequences
  - Hazard + obstacle combinations
  - Backtracking required

#### Levels 13+: Mastery
- **Focus**: Optimization and efficiency
- **Complexity**: High
- **Energy**: 110–120% of optimal
- **Grid size**: 12x12 to 16x16
- **Challenges**:
  - Multiple solution paths
  - Tight energy budgets
  - Complex spatial reasoning

### Design Best Practices

#### ✅ DO
- **Start simple**: First move should be obvious
- **Show, don't tell**: Level layout teaches mechanics
- **One new thing**: Introduce one new mechanic per level
- **Validate solutions**: Test that your level is solvable
- **Playtest**: Have someone else play it
- **Provide hints**: Use level description for subtle guidance
- **Respect player time**: No tedious backtracking without purpose
- **Make goals visible**: Player should see the goal from start (usually)

#### ❌ DON'T
- **Trap the player**: Avoid soft-locking (stuck with energy but can't win)
- **Require trial-and-death**: Hidden hazards that insta-kill are unfun
- **Make it too tight**: Energy should allow for 1-2 mistakes
- **Overuse backtracking**: It's tedious if required too often
- **Create dead ends**: Paths that lead nowhere waste player time
- **Ignore aesthetics**: Random wall placement looks bad
- **Skip testing**: Always validate before shipping

### Visual Design Tips

#### Grid Layout Patterns

**Corridors** (teach linear thinking):
```
P . . # . . . G
# # . # . # # #
```

**Chambers** (teach exploration):
```
# # # # #
# P . . #
# . # . #
# . # G #
# # # # #
```

**Mazes** (teach pathfinding):
```
# . # . . . #
# . # # # . #
# . . . # . #
# # # . # . G
P . . . # . .
```

**Symmetry** (aesthetically pleasing):
```
# . . . . . #
. # . . . # .
. . # . # . .
. . . P . . .
. . # G # . .
. # . . . # .
# . . . . . #
```

---

## Energy Budget Calculation

### Formula

```
Minimum Energy = Optimal Path Length - 1
(subtract 1 because you end ON the goal)

Recommended Energy = Minimum × Multiplier

Multipliers:
- Tutorial (levels 1-3): 1.5 to 2.0 (very forgiving)
- Learning (levels 4-9): 1.3 to 1.5 (forgiving)
- Challenge (levels 10-15): 1.2 to 1.3 (tight but fair)
- Expert (levels 16+): 1.1 to 1.2 (minimal room for error)
```

### Example Calculation

```
Level: 8x8 grid
Player start: (0, 0)
Goal: (7, 7)

Optimal path (no obstacles):
- Manhattan distance = |7-0| + |7-0| = 14
- Moves needed = 14

Energy budget options:
- Tutorial: 14 × 1.5 = 21 energy (7 wasted moves allowed)
- Learning: 14 × 1.3 = 18 energy (4 wasted moves)
- Challenge: 14 × 1.2 = 17 energy (3 wasted moves)
- Expert: 14 × 1.1 = 15 energy (1 wasted move)
```

### Key Collection Adjustment

If level has keys that require backtracking:

```
Optimal with keys = Optimal to key + Key to door + Door to goal

Example:
Player (0,0) → Key (2,0) → Door (5,3) → Goal (7,7)

Path segments:
1. (0,0) to (2,0) = 2 moves
2. (2,0) to (5,3) = 6 moves
3. (5,3) to (7,7) = 6 moves
Total = 14 moves

Energy = 14 × 1.3 = 18 (for learning level)
```

### Tools to Calculate

```bash
# Use level validator (provides optimal path length)
npm run validate-level 03_locked_passage.json

# Output:
# Optimal path: 14 moves
# Current energy: 18
# Efficiency ratio: 1.29 (good for learning level)
```

---

## Common Mistakes

### Mistake 1: Unreachable Goal

**Problem**: Player cannot reach goal due to walls or missing keys.

```json
{
  "playerStart": { "x": 0, "y": 0 },
  "goal": { "x": 4, "y": 4 },
  "tiles": [
    { "x": 2, "y": 0, "type": "wall" },
    { "x": 2, "y": 1, "type": "wall" },
    { "x": 2, "y": 2, "type": "wall" },
    { "x": 2, "y": 3, "type": "wall" },
    { "x": 2, "y": 4, "type": "wall" }
  ]
}
```

**Fix**: Always run validation to check reachability.

---

### Mistake 2: Insufficient Energy

**Problem**: Energy budget is less than minimum moves.

```json
{
  "playerStart": { "x": 0, "y": 0 },
  "goal": { "x": 9, "y": 9 },
  "energy": 10  // ❌ Need at least 18 moves!
}
```

**Fix**: Calculate optimal path length, multiply by 1.2+.

---

### Mistake 3: Door Without Key

**Problem**: Door exists but no key of matching color.

```json
{
  "interactables": [
    {
      "id": "door_blue",
      "x": 5,
      "y": 5,
      "type": "door",
      "color": "blue"
    }
    // ❌ No blue key!
  ]
}
```

**Fix**: Every door needs at least one key.

---

### Mistake 4: Key Behind Door

**Problem**: Key requires door to be opened first (circular dependency).

```json
{
  "interactables": [
    {
      "id": "door_red",
      "x": 5,
      "y": 5,
      "type": "door",
      "color": "red"
    },
    {
      "id": "key_red",
      "x": 6,
      "y": 5,  // Behind the door!
      "type": "key",
      "color": "red"
    }
  ]
}
```

**Fix**: Ensure key is reachable before door.

---

### Mistake 5: Player Starts on Hazard

**Problem**: Instant death on level start.

```json
{
  "playerStart": { "x": 2, "y": 2 },
  "hazards": [
    { "id": "spike1", "x": 2, "y": 2, "type": "spike" }  // ❌
  ]
}
```

**Fix**: Validator should catch this, but double-check.

---

### Mistake 6: Duplicate IDs

**Problem**: Two entities with same ID.

```json
{
  "hazards": [
    { "id": "hazard1", "x": 1, "y": 1, "type": "spike" },
    { "id": "hazard1", "x": 2, "y": 2, "type": "laser" }  // ❌ Duplicate ID
  ]
}
```

**Fix**: Ensure all IDs are unique. Use naming convention: `spike_1`, `spike_2`, etc.

---

### Mistake 7: Out of Bounds

**Problem**: Entity position outside grid.

```json
{
  "width": 10,
  "height": 10,
  "hazards": [
    { "id": "spike1", "x": 12, "y": 5, "type": "spike" }  // ❌ x >= width
  ]
}
```

**Fix**: Ensure 0 ≤ x < width and 0 ≤ y < height.

---

## Testing Your Levels

### Pre-Flight Checklist

Before considering a level "done", verify:

- [ ] Level loads without errors
- [ ] Validation passes (no errors reported)
- [ ] Goal is reachable (validator confirms)
- [ ] Energy budget is sufficient
- [ ] Level is solvable within energy
- [ ] You've personally beaten it
- [ ] Someone else has beaten it (playtest)
- [ ] All keys have doors, all doors have keys
- [ ] No typos in ID, name, description
- [ ] Metadata is filled out (difficulty, tags)

### Manual Testing Steps

1. **Load the level**:
   ```bash
   npm run dev
   # Navigate to level select, find your level
   ```

2. **Play through once**:
   - Note how many moves you take
   - Note where you get stuck
   - Note any confusing elements

3. **Check energy**:
   - Did you finish with energy to spare?
   - Was it too tight or too generous?
   - Adjust energy budget accordingly

4. **Test edge cases**:
   - Try going to dead ends
   - Try collecting keys in wrong order (if multiple)
   - Try avoiding hazards via alternate paths

5. **Playtest with others**:
   - Watch someone else play (don't help)
   - Note where they struggle
   - Adjust level based on feedback

---

## Validation Tools

### Command-Line Validator

```bash
# Validate a single level
npm run validate-level content/levels/01_first_steps.json

# Validate all levels
npm run validate-levels

# Output format:
# ✅ 01_first_steps.json - Valid
# ❌ 02_broken_level.json - UNREACHABLE_GOAL: Goal at (9,9) unreachable
# ✅ 03_keys.json - Valid (warnings: energy budget generous)
```

### Validation Output

**Success**:
```
✅ Level: first_steps
   - Structure: Valid
   - Reachability: Goal reachable in 8 moves
   - Energy: 12 (optimal: 8, ratio: 1.50)
   - Entities: 0 hazards, 0 interactables
   - Recommendation: Good tutorial level
```

**Failure**:
```
❌ Level: broken_level
   Errors:
   - [UNREACHABLE_GOAL] Goal at (9,9) is unreachable from start (0,0)
   - [INSUFFICIENT_ENERGY] Energy budget 5 is less than minimum 14
   
   Warnings:
   - [DUPLICATE_ID] Hazard ID 'spike1' appears twice
```

### In-Game Validation

During development, levels are validated on load:

```typescript
try {
  const level = await loadLevel('first_steps');
  const validation = validateLevel(level);
  
  if (!validation.valid) {
    console.error('Level validation failed:', validation.errors);
    showErrorScreen('Level is broken');
  }
} catch (error) {
  console.error('Failed to load level:', error);
}
```

---

## Troubleshooting Guide

### Issue: "Goal is unreachable"

**Possible causes**:
1. Wall completely surrounds goal
2. Door blocks path and key is missing
3. Key is behind locked door (circular dependency)

**Solutions**:
1. Use pathfinding visualization (if available)
2. Manually trace path from start to goal
3. Check all doors have accessible keys

---

### Issue: "Insufficient energy"

**Cause**: Energy < optimal path length

**Solution**:
```bash
# Run validator to see optimal path
npm run validate-level your_level.json

# Adjust energy in JSON:
"energy": optimal_moves * 1.3  // For learning level
```

---

### Issue: "Duplicate entity ID"

**Cause**: Two entities with same `id` field

**Solution**:
1. Use naming convention: `spike_1`, `spike_2`, `door_red_1`, etc.
2. Search JSON for duplicate IDs
3. Rename one to be unique

---

### Issue: "Entity out of bounds"

**Cause**: Entity position (x, y) is outside grid dimensions

**Solution**:
1. Check: 0 ≤ x < width
2. Check: 0 ≤ y < height
3. Remember: coordinates are 0-indexed

---

### Issue: "Player starts on hazard"

**Cause**: `playerStart` position matches hazard position

**Solution**:
- Move player start away from hazard
- Or remove/move the hazard

---

### Issue: "Level too easy/hard"

**Solution**:
- **Too easy**: Reduce energy, add hazards, add obstacles
- **Too hard**: Increase energy, remove obstacles, simplify layout

---

## Schema Versioning

### Current Version: 1.0.0

All levels must specify `"version": "1.0.0"` in the JSON.

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-22 | Initial schema specification |

### Future Versions

When the schema changes, a migration guide will be provided.

Example future change (hypothetical):

**Version 2.0.0** might add:
- `"timeLimit"` property (for timed challenges)
- `"switches"` array (new interactable type)
- `"movingHazards"` with patrol paths

**Migration path**:
- Old levels (1.0.0) continue to work
- Validator automatically upgrades to 2.0.0 (adds defaults)
- Or use migration tool: `npm run migrate-levels 1.0.0 2.0.0`

---

## Appendix: JSON Template

### Blank Level Template

Copy this to create new levels:

```json
{
  "id": "level_XX",
  "name": "Level Name",
  "version": "1.0.0",
  "width": 10,
  "height": 10,
  "playerStart": { "x": 0, "y": 0 },
  "goal": { "x": 9, "y": 9 },
  "energy": 20,
  "description": "",
  "tiles": [],
  "hazards": [],
  "interactables": [],
  "metadata": {
    "author": "Your Name",
    "difficulty": 5,
    "tags": [],
    "parMoves": 0
  }
}
```

---

## Changelog

### v1.0.0 (2025-01-22)
- Initial level format specification
- Defined JSON schema (Draft-07)
- Documented all properties and validation rules
- Provided complete examples
- Added level design guidelines
- Created troubleshooting guide

---

## Document Maintenance

### When to Update
- When schema version changes
- When adding new entity types
- When validation rules change
- When common mistakes are discovered

### Cross-References
- **TECH.md**: Implementation details of level loading/validation
- **GDD.md**: Game rules that affect level design
- **DECISIONS.md**: Why certain format choices were made

---

**END OF LEVEL FORMAT SPECIFICATION**