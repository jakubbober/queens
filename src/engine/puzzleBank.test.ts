import { describe, it, expect } from 'vitest'
import { PUZZLE_BANK, getPuzzleFromBank, getRandomPuzzleFromBank } from './puzzleBank'
import { isValidPlacement } from './solver'
import { Difficulty } from '../types/game'

// Get all puzzles from the bank
const allPuzzles = [
  ...PUZZLE_BANK.easy.map((puzzle, i) => ({ puzzle, difficulty: 'easy' as Difficulty, index: i })),
  ...PUZZLE_BANK.medium.map((puzzle, i) => ({ puzzle, difficulty: 'medium' as Difficulty, index: i })),
  ...PUZZLE_BANK.hard.map((puzzle, i) => ({ puzzle, difficulty: 'hard' as Difficulty, index: i })),
]

describe('PUZZLE_BANK', () => {
  it('contains puzzles in each difficulty', () => {
    expect(PUZZLE_BANK.easy.length).toBeGreaterThan(0)
    expect(PUZZLE_BANK.medium.length).toBeGreaterThan(0)
    expect(PUZZLE_BANK.hard.length).toBeGreaterThan(0)
  })

  it('contains at least 30 total puzzles', () => {
    const total = PUZZLE_BANK.easy.length + PUZZLE_BANK.medium.length + PUZZLE_BANK.hard.length
    expect(total).toBeGreaterThanOrEqual(30)
  })

  describe.each(allPuzzles)(
    '$difficulty puzzle $index',
    ({ puzzle }) => {
      it('has valid region grid dimensions', () => {
        expect(puzzle.regions).toHaveLength(puzzle.regions.length)
        puzzle.regions.forEach((row: number[]) => {
          expect(row).toHaveLength(puzzle.regions.length)
        })
      })

      it('has all region IDs from 0 to 8', () => {
        const regionIds = new Set<number>()
        for (let r = 0; r < puzzle.regions.length; r++) {
          for (let c = 0; c < puzzle.regions.length; c++) {
            regionIds.add(puzzle.regions[r][c])
          }
        }
        for (let i = 0; i < puzzle.regions.length; i++) {
          expect(regionIds.has(i)).toBe(true)
        }
      })

      it('has exactly 9 queens in solution', () => {
        expect(puzzle.solution).toHaveLength(puzzle.regions.length)
      })

      it('solution has one queen per row', () => {
        const rows = new Set(puzzle.solution.map((q: { row: number }) => q.row))
        expect(rows.size).toBe(puzzle.regions.length)
      })

      it('solution has one queen per column', () => {
        const cols = new Set(puzzle.solution.map((q: { col: number }) => q.col))
        expect(cols.size).toBe(puzzle.regions.length)
      })

      it('solution has one queen per region', () => {
        const regions = new Set(puzzle.solution.map((q: { row: number; col: number }) => puzzle.regions[q.row][q.col]))
        expect(regions.size).toBe(puzzle.regions.length)
      })

      it('no queens are adjacent to each other', () => {
        for (let i = 0; i < puzzle.solution.length; i++) {
          for (let j = i + 1; j < puzzle.solution.length; j++) {
            const q1 = puzzle.solution[i]
            const q2 = puzzle.solution[j]
            const rowDiff = Math.abs(q1.row - q2.row)
            const colDiff = Math.abs(q1.col - q2.col)
            // Queens should not be adjacent (including diagonally)
            expect(rowDiff <= 1 && colDiff <= 1).toBe(false)
          }
        }
      })

      it('solution is valid according to solver', () => {
        // Build up the solution incrementally, checking each placement
        const queens: { row: number; col: number }[] = []
        for (const q of puzzle.solution) {
          expect(isValidPlacement(queens, puzzle.regions, q.row, q.col)).toBe(true)
          queens.push(q)
        }
      })
    }
  )
})

describe('getPuzzleFromBank', () => {
  it('returns puzzle at given index for medium difficulty', () => {
    const puzzle = getPuzzleFromBank(0)
    expect(puzzle.regions).toBeDefined()
    expect(puzzle.solution).toBeDefined()
  })

  it('wraps around for index >= length', () => {
    const puzzle1 = getPuzzleFromBank(0)
    const puzzle2 = getPuzzleFromBank(PUZZLE_BANK.medium.length)
    expect(puzzle1.regions).toEqual(puzzle2.regions)
  })

  it('handles negative indices by taking absolute value', () => {
    const puzzle = getPuzzleFromBank(-1)
    expect(puzzle.regions).toBeDefined()
  })

  it('returns puzzles from different difficulties', () => {
    const easyPuzzle = getPuzzleFromBank(0, 'easy')
    const mediumPuzzle = getPuzzleFromBank(0, 'medium')
    const hardPuzzle = getPuzzleFromBank(0, 'hard')

    expect(easyPuzzle.regions).toBeDefined()
    expect(mediumPuzzle.regions).toBeDefined()
    expect(hardPuzzle.regions).toBeDefined()
  })
})

describe('getRandomPuzzleFromBank', () => {
  it('returns a puzzle from the bank', () => {
    const mockRandom = () => 0.5
    const puzzle = getRandomPuzzleFromBank(mockRandom)
    expect(puzzle.regions).toBeDefined()
    expect(puzzle.solution).toBeDefined()
  })

  it('returns first puzzle when random returns 0', () => {
    const mockRandom = () => 0
    const puzzle = getRandomPuzzleFromBank(mockRandom)
    const firstMedium = getPuzzleFromBank(0)
    expect(puzzle.regions).toEqual(firstMedium.regions)
  })

  it('returns puzzles from specified difficulty', () => {
    const mockRandom = () => 0
    const easyPuzzle = getRandomPuzzleFromBank(mockRandom, 'easy')
    const hardPuzzle = getRandomPuzzleFromBank(mockRandom, 'hard')

    expect(easyPuzzle.regions).toBeDefined()
    expect(hardPuzzle.regions).toBeDefined()
  })
})
