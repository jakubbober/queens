# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Queens is a LinkedIn-style puzzle game built with React, TypeScript, and Vite. Players place exactly one crown (queen) per row, column, and colored region on a 9×9 grid, with no adjacent placements allowed (including diagonals).

## Commands

- `npm run dev` - Start development server
- `npm run build` - TypeScript check and Vite build
- `npm test` - Run tests with Vitest
- `npm run preview` - Preview production build

## Architecture

### State Management
The app uses Zustand for state management (`src/store/gameStore.ts`). The store manages:
- Puzzle state (regions, solution)
- Queens, manual X marks, and auto-placed X marks
- Undo/redo history (snapshots limited to 50)
- Game settings (autoCheck, autoX)
- Timer and win state

### Game Engine (`src/engine/`)
- **solver.ts** - Backtracking solver with configurable solution limit. `isValidPlacement()` enforces all four rules (row, column, region, adjacency).
- **validator.ts** - Real-time validation returning conflict maps for rows, columns, regions, and adjacency.
- **generator.ts** - Puzzle generation with uniqueness verification. Falls back to a known-good puzzle after 100 attempts.
- **regions.ts** - Region generation ensuring connectivity.
- **constraints.ts** - Auto-X constraint propagation.
- **hintAnalyzer.ts** - Hint generation for naked singles and conflicts.

### Cell Interaction Model
Cells cycle through three states: Empty → Manual X → Queen → Empty. The `cycleCell()` action in the store handles this with special cases for auto-X cells and drag-to-mark mode.

### Key Types (`src/types/game.ts`)
- `CellState`: EMPTY | QUEEN | MARKED_X
- `Puzzle`: `{ regions: number[][], solution: Position[] }`
- Grid is always 9×9 (`GRID_SIZE = 9`)

### Component Structure
- `Game.tsx` - Main container with hooks for init, timer, and keyboard shortcuts
- `GameBoard.tsx` - Renders grid with O(1) lookup maps for queens/marks/errors
- `Cell.tsx` - Individual cell with region border calculation
- UI components in `src/components/UI/` for controls, settings, timer, hints, and win modal

## GitHub Actions

- **CI** - Runs on PRs and main: type check, build, and tests
- **Deploy** - Auto-deploys to GitHub Pages on main push
- **Claude Review** - AI code review on PRs; tag `@claude` in comments for assistance
- **Release** - Creates GitHub releases on version tags (v*)
- **Dependabot** - Weekly dependency updates (grouped by dev/prod)

## Claude Integration

Tag `@claude` in any PR comment to get AI-powered code review and suggestions. The Claude GitHub Action uses `claude-sonnet-4-20250514` for reviews.
