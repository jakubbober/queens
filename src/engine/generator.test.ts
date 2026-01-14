import { describe, it, expect } from 'vitest'
import { generatePuzzle, generateDailyPuzzle, generateRandomPuzzle } from './generator'
import { isValidPlacement, findSolution } from './solver'
import { areAllRegionsConnected } from './regions'
import { GRID_SIZE, NUM_REGIONS } from '../types/game'

describe('generatePuzzle', () => {
  it('returns a valid puzzle structure', () => {
    const puzzle = generatePuzzle(12345)

    expect(puzzle.regions).toHaveLength(GRID_SIZE)
    puzzle.regions.forEach(row => {
      expect(row).toHaveLength(GRID_SIZE)
    })

    expect(puzzle.solution).toHaveLength(GRID_SIZE)
  })

  it('generates puzzle with all region IDs 0-8', () => {
    const puzzle = generatePuzzle(12345)
    const regionIds = new Set<number>()

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        regionIds.add(puzzle.regions[r][c])
      }
    }

    for (let i = 0; i < NUM_REGIONS; i++) {
      expect(regionIds.has(i)).toBe(true)
    }
  })

  it('generates puzzle with connected regions', () => {
    const puzzle = generatePuzzle(12345)
    expect(areAllRegionsConnected(puzzle.regions)).toBe(true)
  })

  it('solution has one queen per row', () => {
    const puzzle = generatePuzzle(12345)
    const rows = new Set(puzzle.solution.map(q => q.row))
    expect(rows.size).toBe(GRID_SIZE)
  })

  it('solution has one queen per column', () => {
    const puzzle = generatePuzzle(12345)
    const cols = new Set(puzzle.solution.map(q => q.col))
    expect(cols.size).toBe(GRID_SIZE)
  })

  it('solution has one queen per region', () => {
    const puzzle = generatePuzzle(12345)
    const regions = new Set(puzzle.solution.map(q => puzzle.regions[q.row][q.col]))
    expect(regions.size).toBe(NUM_REGIONS)
  })

  it('solution has no adjacent queens', () => {
    const puzzle = generatePuzzle(12345)

    for (let i = 0; i < puzzle.solution.length; i++) {
      for (let j = i + 1; j < puzzle.solution.length; j++) {
        const q1 = puzzle.solution[i]
        const q2 = puzzle.solution[j]
        const rowDiff = Math.abs(q1.row - q2.row)
        const colDiff = Math.abs(q1.col - q2.col)
        expect(rowDiff <= 1 && colDiff <= 1).toBe(false)
      }
    }
  })

  it('solution is valid according to solver', () => {
    const puzzle = generatePuzzle(12345)
    const queens: { row: number; col: number }[] = []

    for (const q of puzzle.solution) {
      expect(isValidPlacement(queens, puzzle.regions, q.row, q.col)).toBe(true)
      queens.push(q)
    }
  })

  it('generates same puzzle for same seed', () => {
    const puzzle1 = generatePuzzle(99999)
    const puzzle2 = generatePuzzle(99999)

    expect(puzzle1.regions).toEqual(puzzle2.regions)
    expect(puzzle1.solution).toEqual(puzzle2.solution)
  })

  it('generates different puzzles for different seeds', () => {
    // Test that at least some different seeds produce different puzzles
    // (generator falls back to puzzle bank with seeded selection)
    const puzzles = [
      generatePuzzle(1),
      generatePuzzle(100),
      generatePuzzle(1000),
      generatePuzzle(10000),
      generatePuzzle(100000)
    ]

    // Check that not all puzzles are identical
    const uniquePuzzles = new Set(puzzles.map(p => JSON.stringify(p.solution)))
    expect(uniquePuzzles.size).toBeGreaterThan(1)
  })
})

describe('generateDailyPuzzle', () => {
  it('returns a valid puzzle', () => {
    const puzzle = generateDailyPuzzle()

    expect(puzzle.regions).toHaveLength(GRID_SIZE)
    expect(puzzle.solution).toHaveLength(GRID_SIZE)
  })

  it('returns same puzzle when called multiple times on same day', () => {
    const puzzle1 = generateDailyPuzzle()
    const puzzle2 = generateDailyPuzzle()

    expect(puzzle1.regions).toEqual(puzzle2.regions)
    expect(puzzle1.solution).toEqual(puzzle2.solution)
  })
})

describe('generateRandomPuzzle', () => {
  it('returns a valid puzzle', () => {
    const puzzle = generateRandomPuzzle()

    expect(puzzle.regions).toHaveLength(GRID_SIZE)
    expect(puzzle.solution).toHaveLength(GRID_SIZE)
  })

  it('generates valid solution', () => {
    const puzzle = generateRandomPuzzle()
    const solution = findSolution(puzzle.regions)
    expect(solution).not.toBeNull()
  })
})

describe('puzzle generation quality', () => {
  it('generates puzzles with valid solutions multiple times', () => {
    // Test multiple random puzzles to ensure consistency
    for (let i = 0; i < 5; i++) {
      const puzzle = generatePuzzle(i * 1000)

      // Verify solution is valid
      const queens: { row: number; col: number }[] = []
      for (const q of puzzle.solution) {
        const valid = isValidPlacement(queens, puzzle.regions, q.row, q.col)
        expect(valid).toBe(true)
        queens.push(q)
      }
    }
  })
})
