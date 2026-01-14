import { describe, it, expect } from 'vitest'
import { PUZZLE_BANK, getPuzzleFromBank, getRandomPuzzleFromBank } from './puzzleBank'
import { isValidPlacement } from './solver'
import { GRID_SIZE, NUM_REGIONS } from '../types/game'

describe('PUZZLE_BANK', () => {
  it('contains at least 30 puzzles', () => {
    expect(PUZZLE_BANK.length).toBeGreaterThanOrEqual(30)
  })

  describe.each(PUZZLE_BANK.map((puzzle, index) => ({ puzzle, index })))(
    'Puzzle $index',
    ({ puzzle }) => {
      it('has valid region grid dimensions', () => {
        expect(puzzle.regions).toHaveLength(GRID_SIZE)
        puzzle.regions.forEach(row => {
          expect(row).toHaveLength(GRID_SIZE)
        })
      })

      it('has all region IDs from 0 to 8', () => {
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

      it('has exactly 9 queens in solution', () => {
        expect(puzzle.solution).toHaveLength(GRID_SIZE)
      })

      it('solution has one queen per row', () => {
        const rows = new Set(puzzle.solution.map(q => q.row))
        expect(rows.size).toBe(GRID_SIZE)
      })

      it('solution has one queen per column', () => {
        const cols = new Set(puzzle.solution.map(q => q.col))
        expect(cols.size).toBe(GRID_SIZE)
      })

      it('solution has one queen per region', () => {
        const regions = new Set(puzzle.solution.map(q => puzzle.regions[q.row][q.col]))
        expect(regions.size).toBe(NUM_REGIONS)
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
  it('returns puzzle at given index', () => {
    const puzzle = getPuzzleFromBank(0)
    expect(puzzle).toEqual(PUZZLE_BANK[0])
  })

  it('wraps around for index >= length', () => {
    const puzzle = getPuzzleFromBank(PUZZLE_BANK.length)
    expect(puzzle).toEqual(PUZZLE_BANK[0])
  })

  it('handles negative indices by taking absolute value', () => {
    const puzzle = getPuzzleFromBank(-1)
    expect(puzzle).toEqual(PUZZLE_BANK[1])
  })
})

describe('getRandomPuzzleFromBank', () => {
  it('returns a puzzle from the bank', () => {
    const mockRandom = () => 0.5
    const puzzle = getRandomPuzzleFromBank(mockRandom)
    expect(PUZZLE_BANK).toContainEqual(puzzle)
  })

  it('returns first puzzle when random returns 0', () => {
    const mockRandom = () => 0
    const puzzle = getRandomPuzzleFromBank(mockRandom)
    expect(puzzle).toEqual(PUZZLE_BANK[0])
  })

  it('returns last puzzle when random returns 0.999', () => {
    const mockRandom = () => 0.999
    const puzzle = getRandomPuzzleFromBank(mockRandom)
    expect(puzzle).toEqual(PUZZLE_BANK[PUZZLE_BANK.length - 1])
  })
})
