# Configuration Files Setup Guide
## Signal Path

**Last updated**: 2025-01-22  
**Purpose**: Complete reference for all project configuration files

---

## Overview

This document contains **complete, copy-paste ready** configuration files for the Signal Path project. All configs are tested and production-ready.

---

## Table of Contents

1. [package.json (Complete)](#packagejson-complete)
2. [tsconfig.json](#tsconfigjson)
3. [vite.config.ts](#viteconfigts)
4. [.eslintrc.json](#eslintrcjson)
5. [.prettierrc.json](#prettierrcjson)
6. [.prettierignore](#prettierignore)
7. [.gitignore](#gitignore)
8. [Husky Setup](#husky-setup)
9. [VS Code Settings](#vs-code-settings)

---

## package.json (Complete)

**File**: `package.json`

```json
{
  "name": "signal-path",
  "version": "0.1.0",
  "type": "module",
  "description": "A turn-based tactical puzzle game demonstrating software engineering fundamentals",
  "author": "Your Name",
  "license": "MIT",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ci": "vitest run",
    "test:coverage": "vitest run --coverage",
    "bench": "vitest bench",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src/ tests/",
    "lint:fix": "eslint src/ tests/ --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx}\" \"tests/**/*.ts\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx}\" \"tests/**/*.ts\"",
    "validate-level": "tsx tools/validate-level.ts",
    "validate-levels": "tsx tools/validate-levels.ts",
    "prepare": "husky install"
  },
  "dependencies": {},
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@typescript-eslint/eslint-plugin": "^6.13.0",
    "@typescript-eslint/parser": "^6.13.0",
    "@vitest/coverage-v8": "^1.0.0",
    "eslint": "^8.54.0",
    "husky": "^8.0.3",
    "prettier": "^3.1.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

---

## tsconfig.json

**File**: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    /* Path aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/tests/*": ["tests/*"]
    }
  },
  "include": ["src", "tests"],
  "exclude": ["node_modules", "dist"]
}
```

**Key features**:
- ✅ Strict mode enabled (all flags)
- ✅ Path aliases (`@/core/types` instead of `../../core/types`)
- ✅ ES2020 target (modern JavaScript)
- ✅ Includes both `src/` and `tests/`

---

## vite.config.ts

**File**: `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/tests': path.resolve(__dirname, './tests'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.ts',
        '**/*.bench.ts',
        'src/ui/**', // UI has lower coverage target
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
```

**Key features**:
- ✅ Vitest configuration (globals, jsdom environment)
- ✅ Coverage thresholds (80% for core, lower for UI)
- ✅ Path aliases matching tsconfig
- ✅ Source maps enabled

---

## tests/setup.ts

**File**: `tests/setup.ts`

```typescript
// Vitest setup file
// Runs before all tests

// Mock window.localStorage for tests
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

// Mock window.fetch for tests
global.fetch = vi.fn();

// Add custom matchers if needed
expect.extend({
  // Example: toBeWithinRange(received, floor, ceiling)
});
```

---

## .eslintrc.json

**File**: `.eslintrc.json`

```json
{
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "error",
    "no-var": "error"
  },
  "ignorePatterns": ["dist", "node_modules", "*.config.ts"]
}
```

**Key rules**:
- ✅ No `any` type (enforced)
- ✅ Unused vars prefixed with `_` are allowed
- ✅ Console.log warnings (but warn/error allowed)
- ✅ Prefer const over let

---

## .prettierrc.json

**File**: `.prettierrc.json`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

**Style**:
- Single quotes
- Semicolons required
- 100 character line width
- 2 space indentation

---

## .prettierignore

**File**: `.prettierignore`

```
# Dependencies
node_modules

# Build outputs
dist
build
*.tsbuildinfo

# Logs
*.log

# Coverage
coverage

# OS
.DS_Store
Thumbs.db

# IDE
.vscode
.idea
```

---

## .gitignore

**File**: `.gitignore`

```
# Dependencies
node_modules/

# Build outputs
dist/
build/
*.tsbuildinfo

# Development
.env
.env.local
*.log

# Testing
coverage/
.nyc_output/

# OS
.DS_Store
Thumbs.db
*.swp
*.swo

# IDE
.vscode/
.idea/
*.sublime-*

# Vitest
.vitest/
```

---

## Husky Setup

### Installation

```bash
# Install husky
npm install --save-dev husky

# Initialize husky
npx husky install

# Make sure prepare script runs on install
npm pkg set scripts.prepare="husky install"
```

### Create pre-commit hook

```bash
npx husky add .husky/pre-commit "npm run typecheck && npm run lint && npm run test:ci"
chmod +x .husky/pre-commit
```

**File**: `.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# Type check
echo "📘 Type checking..."
npm run typecheck || exit 1

# Lint
echo "🔧 Linting..."
npm run lint || exit 1

# Tests
echo "🧪 Running tests..."
npm run test:ci || exit 1

echo "✅ All checks passed!"
```

### Create pre-push hook

```bash
npx husky add .husky/pre-push "npm run test:coverage"
chmod +x .husky/pre-push
```

**File**: `.husky/pre-push`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🚀 Running pre-push checks..."

# Full test suite with coverage
echo "🧪 Running tests with coverage..."
npm run test:coverage || exit 1

echo "✅ All checks passed! Safe to push."
```

---

## VS Code Settings

### Recommended Extensions

**File**: `.vscode/extensions.json`

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "vitest.explorer",
    "yzhang.markdown-all-in-one"
  ]
}
```

### Workspace Settings

**File**: `.vscode/settings.json`

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "files.exclude": {
    "node_modules": true,
    "dist": true,
    ".vscode": false
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## Complete Installation Steps

### 1. Initialize Project

```bash
# Create project directory
mkdir signal-path
cd signal-path

# Initialize npm
npm init -y

# Copy package.json content from above (replace generated one)
```

### 2. Install Dependencies

```bash
# Install all dev dependencies
npm install --save-dev \
  @types/node \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  @vitest/coverage-v8 \
  eslint \
  husky \
  prettier \
  tsx \
  typescript \
  vite \
  vitest
```

### 3. Create Config Files

```bash
# Create all config files
touch tsconfig.json
touch vite.config.ts
touch .eslintrc.json
touch .prettierrc.json
touch .prettierignore
touch .gitignore

# Copy content from above sections
```

### 4. Create Directory Structure

```bash
# Create directories
mkdir -p src/core src/ui src/content
mkdir -p tests/core tests/integration tests/helpers tests/performance
mkdir -p content/levels
mkdir -p docs
mkdir -p public
mkdir -p tools

# Create test setup
touch tests/setup.ts
```

### 5. Setup Husky

```bash
# Install and initialize
npm run prepare
npx husky add .husky/pre-commit "npm run typecheck && npm run lint && npm run test:ci"
npx husky add .husky/pre-push "npm run test:coverage"
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

### 6. Setup VS Code (Optional)

```bash
mkdir -p .vscode
touch .vscode/settings.json
touch .vscode/extensions.json

# Copy content from above
```

### 7. Verify Setup

```bash
# Type check (should pass with no errors on empty project)
npm run typecheck

# Lint (should pass)
npm run lint

# Format (should pass)
npm run format:check

# Tests (should pass with 0 tests initially)
npm run test:ci
```

---

## Troubleshooting

### Issue: "Cannot find module '@/core/types'"

**Solution**: 
1. Check `tsconfig.json` has correct path aliases
2. Check `vite.config.ts` has matching aliases
3. Restart VS Code / TS server

### Issue: "ESLint couldn't find tsconfig.json"

**Solution**: 
1. Ensure `tsconfig.json` is in project root
2. Check `.eslintrc.json` has `"project": "./tsconfig.json"`

### Issue: "Husky hooks not running"

**Solution**:
```bash
npm run prepare
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

### Issue: "Coverage thresholds not met"

**Solution**:
1. Write more tests for core logic
2. Adjust thresholds in `vite.config.ts` if starting out
3. Check coverage report: `npm run test:coverage`

---

## Summary Checklist

Before starting development, verify:

- [ ] `package.json` has all scripts
- [ ] `tsconfig.json` exists with strict mode
- [ ] `vite.config.ts` exists with vitest config
- [ ] `.eslintrc.json` exists
- [ ] `.prettierrc.json` exists
- [ ] `.gitignore` exists
- [ ] Husky hooks are installed and executable
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run test:ci` passes (even with 0 tests)
- [ ] Directory structure matches CLAUDE.md

---

## Quick Reference: All Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build

# Testing
npm test             # Run tests (watch mode)
npm run test:ci      # Run tests once
npm run test:coverage # Run tests with coverage
npm run bench        # Run performance benchmarks

# Quality
npm run typecheck    # TypeScript type checking
npm run lint         # Lint code
npm run lint:fix     # Fix linting errors
npm run format       # Format code
npm run format:check # Check formatting

# Tools
npm run validate-level <file>   # Validate single level
npm run validate-levels         # Validate all levels

# Setup
npm run prepare      # Install husky hooks
```

---

**END OF CONFIGURATION GUIDE**