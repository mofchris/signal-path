# Signal Path

**A turn-based tactical puzzle game built to demonstrate software engineering fundamentals through game development.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🎯 Project Overview

Signal Path is a grid-based puzzle game where you guide a maintenance drone through a damaged facility. Each move costs energy, hazards block your path, and every decision matters. But this isn't just a game—it's a systems engineering exercise disguised as interactive entertainment.

**Core Concept**: Navigate a drone through procedurally challenging levels to restore critical systems, managing limited energy while avoiding environmental hazards.

### Why This Project Exists

This project was built to showcase:
- **Data structures** (graphs, stacks, queues, hash maps)
- **Algorithms** (BFS, A*, pathfinding, procedural generation)
- **Clean architecture** (separation of concerns, pure functions, testable code)
- **Systems design** (deterministic simulation, state management, data-driven design)

It's designed to be discussed in technical interviews and demonstrate practical application of computer science fundamentals.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- A modern web browser (Chrome, Firefox, Safari, Edge)

### Installation & Running

```bash
# Clone the repository
git clone https://github.com/yourusername/signal-path.git
cd signal-path

# Install dependencies
npm install

# Run development server
npm run dev
```

The game will open at `http://localhost:5173`

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

---

## 🎮 How to Play

### Controls

- **Arrow Keys** or **WASD**: Move the drone (Up/Down/Left/Right)
- **Spacebar**: Wait (skip turn, still costs energy)
- **R**: Restart current level
- **U**: Undo last move *(coming in Phase 2)*

### Objective

- Reach the **goal tile** (exit/terminal) before running out of **energy**
- Avoid **hazards** (spikes, lasers, fire)
- Collect **keys** to unlock **doors**
- Find the optimal path to conserve energy

### Game Mechanics

- **Turn-based**: The game pauses after each action, giving you time to think
- **Energy System**: Each move costs 1 energy; running out = game over
- **Deterministic**: Same actions always produce the same results (no randomness in gameplay)
- **Grid-based**: Navigate a 2D grid with 4-directional movement

---

## 🏗️ Technical Highlights

### Architecture

This project follows a **strict separation of concerns**:

```
┌─────────────────────────────────┐
│   UI Layer (src/ui/)            │  ← Canvas rendering, input handling
│   - Renderer, Input, Scenes     │
└──────────────┬──────────────────┘
               │ (Actions & State)
┌──────────────┴──────────────────┐
│   Core Logic (src/core/)        │  ← Pure, testable game logic
│   - State, Actions, Rules       │
│   - Pathfinding, Validation     │
└──────────────┬──────────────────┘
               │ (Level Data)
┌──────────────┴──────────────────┐
│   Content (src/content/)        │  ← Data loading & validation
│   - Level loader, Validator     │
└─────────────────────────────────┘
```

**Key principle**: Core game logic has **zero browser/DOM dependencies** and can run in Node.js for testing.

### Data Structures & Algorithms

| Game System | CS Concept |
|-------------|------------|
| Grid navigation | **Graph representation** (nodes = tiles, edges = walkable adjacencies) |
| Pathfinding | **BFS** for shortest path, **A*** for optimized search |
| Movement validation | **Breadth-first search** for reachable tiles |
| Undo system | **Stack** (command pattern) |
| Level storage | **Serialization** (JSON encode/decode) |
| State management | **Immutable state updates** (functional programming) |

### Design Patterns

- **State Machine**: Game status (playing → won/lost)
- **Command Pattern**: Actions as first-class objects
- **Observer Pattern**: UI responds to state changes
- **Strategy Pattern**: Different scene behaviors (menu, game, level select)
- **Factory Pattern**: Level creation from JSON data

### Engineering Principles

✅ **Deterministic simulation** (same input → same output, always)  
✅ **Pure functions** (no side effects in core logic)  
✅ **Immutable state** (state updates create new objects)  
✅ **Data-driven design** (levels in JSON, not hardcoded)  
✅ **Type safety** (TypeScript strict mode)  
✅ **Testable architecture** (pure core logic, dependency injection)

---

## 📁 Project Structure

```
signal-path/
├── CLAUDE.md                  # AI collaboration instructions
├── README.md                  # This file
├── docs/                      # Comprehensive documentation
│   ├── GDD.md                 # Game design (rules, mechanics)
│   ├── TECH.md                # Technical architecture
│   ├── LEVEL_FORMAT.md        # Level file schema
│   ├── TESTING.md             # Testing strategy
│   ├── DECISIONS.md           # Architecture Decision Records
│   └── ROADMAP.md             # Feature roadmap
├── src/
│   ├── core/                  # Pure game logic (0 browser dependencies)
│   │   ├── types.ts           # Core data structures
│   │   ├── state.ts           # State management
│   │   ├── actions.ts         # Action validation & application
│   │   ├── rules.ts           # Game rules & turn resolution
│   │   ├── pathfinding.ts     # BFS, A* algorithms
│   │   └── validation.ts      # Level validation
│   ├── ui/                    # Browser-specific code
│   │   ├── renderer.ts        # Canvas rendering
│   │   ├── input.ts           # Event handling
│   │   └── scenes/            # Game screens
│   └── content/               # Data loading
│       ├── loader.ts          # Level file loading
│       └── validator.ts       # Runtime validation
├── content/levels/            # Level JSON files
├── tests/                     # Test suite
└── public/                    # Static assets
```

---

## 🧪 Testing

### Run Tests

```bash
# Run tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:ci

# Type checking
npm run typecheck
```

### Testing Strategy

- **Unit tests**: Core game logic (pure functions)
- **Deterministic replay tests**: Full game simulations with known outcomes
- **Level validation tests**: Ensure all levels are solvable and well-formed

Example test:

```typescript
test('moving into hazard ends game', () => {
  const state = createTestState({
    player: { x: 0, y: 0 },
    hazards: [{ x: 1, y: 0, type: 'spike' }],
  });
  
  const newState = applyAction(state, { type: 'move', direction: 'right' });
  
  expect(newState.status).toBe('lost');
});
```

---

## 📊 Development Phases

### ✅ Phase 1: Foundation (Current)
- [x] Grid representation and rendering
- [x] Player movement (4-directional)
- [x] Level loading from JSON
- [x] Energy system
- [x] Win/lose conditions
- [x] Basic hazards (spikes, lasers)

### 🚧 Phase 2: Core Mechanics
- [ ] Doors and keys
- [ ] Undo system (action history)
- [ ] Move animations
- [ ] Sound effects
- [ ] Level select screen

### 📅 Phase 3: Advanced Features
- [ ] Timed hazards
- [ ] Multiple levels (10+)
- [ ] Save/load system
- [ ] Pathfinding visualization
- [ ] Performance optimizations

### 🎯 Phase 4: Polish & Showcase
- [ ] Procedural level generation
- [ ] Solution replay system
- [ ] Par times (optimal solutions)
- [ ] Level editor (in-browser)

---

## 🎓 Educational Value

### For Interviews

This project demonstrates:

**Systems Thinking**:
> "I built this game as a deterministic system where every action and outcome is predictable. This mirrors real-world systems engineering where reproducibility and correctness are critical."

**Algorithm Application**:
> "Grid navigation is modeled as a graph, allowing me to implement BFS for shortest paths and A* for optimized pathfinding. The energy system creates a constraint-satisfaction problem."

**Clean Architecture**:
> "Core game logic is completely isolated from the UI layer. I can run the entire game simulation in Node.js without a browser—this makes testing trivial and demonstrates separation of concerns."

**Data-Driven Design**:
> "Levels are declarative JSON files, not imperative code. This separation makes the system modular and testable, similar to how game engines separate assets from logic."

### Skills Demonstrated

- **Languages**: TypeScript, JavaScript (ES2020+)
- **Data Structures**: Graphs, stacks, queues, hash maps, 2D arrays
- **Algorithms**: BFS, A*, flood fill, pathfinding, procedural generation
- **Patterns**: State machine, command, observer, factory, strategy
- **Architecture**: MVC, separation of concerns, dependency injection
- **Testing**: Unit tests, integration tests, deterministic replay
- **Tools**: Vite, Vitest, ESLint, Prettier, Canvas API

---

## 📖 Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[GDD.md](docs/GDD.md)**: Complete game design specification (rules, mechanics, win conditions)
- **[TECH.md](docs/TECH.md)**: Technical architecture (data structures, algorithms, module design)
- **[LEVEL_FORMAT.md](docs/LEVEL_FORMAT.md)**: JSON schema for level files
- **[TESTING.md](docs/TESTING.md)**: Testing strategy and conventions
- **[DECISIONS.md](docs/DECISIONS.md)**: Architectural decisions and rationale
- **[ROADMAP.md](docs/ROADMAP.md)**: Feature roadmap and milestones

For AI collaboration instructions, see [CLAUDE.md](CLAUDE.md).

---

## 🛠️ Development Commands

```bash
# Development
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build

# Quality
npm test             # Run tests (watch mode)
npm run test:ci      # Run tests once
npm run typecheck    # TypeScript type checking
npm run lint         # Lint code
npm run format       # Format code with Prettier

# Clean
npm run clean        # Remove build artifacts
```

---

## 🤝 Contributing

This is a personal portfolio project, but suggestions and feedback are welcome!

If you find a bug or have a feature suggestion:
1. Check existing issues
2. Open a new issue with a clear description
3. Include steps to reproduce (for bugs)

---

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details.

---

## 👤 About

**Project Type**: Portfolio / Resume Project  
**Focus**: Software Engineering Fundamentals  
**Tech Stack**: TypeScript, HTML5 Canvas, Vite  
**Purpose**: Demonstrate practical CS concepts through game development

Built as a systems engineering exercise to showcase clean architecture, algorithmic thinking, and software design principles.

---

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Documentation**: [`docs/`](docs/)
- **Technical Deep-Dive**: [TECH.md](docs/TECH.md)
- **Game Design**: [GDD.md](docs/GDD.md)

---

## 💡 Key Takeaways

If you're reviewing this project for a **technical interview** or **resume evaluation**, here's what to focus on:

1. **Architecture**: Notice the strict separation between core logic and UI
2. **Testing**: Pure functions make the core logic highly testable
3. **Algorithms**: Pathfinding implementations demonstrate CS fundamentals
4. **Documentation**: Comprehensive docs show planning and systems thinking
5. **Determinism**: Reproducible simulations enable reliable testing
6. **Scalability**: Data-driven design allows easy content expansion

**Questions I can discuss**:
- Why turn-based instead of real-time?
- How does the pathfinding algorithm work?
- How do you ensure determinism in game state?
- What trade-offs did you make in the architecture?
- How would you scale this to 100+ levels?
- How does the undo system work (or will work)?

---

## 🙏 Acknowledgments

- Inspired by puzzle games like *Into the Breach* and *Baba Is You*
- Built with guidance from clean architecture principles
- Designed to showcase CS fundamentals in a practical context

---

**[⬆ Back to Top](#signal-path)**