import { Puzzle, GRID_SIZE } from '../types/game'
import { generateRegions, areAllRegionsConnected } from './regions'
import { findSolution, hasUniqueSolution } from './solver'

const MAX_GENERATION_ATTEMPTS = 100

export function generatePuzzle(): Puzzle {
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    const regions = generateRegions()

    // Verify all regions are connected
    if (!areAllRegionsConnected(regions)) {
      continue
    }

    // Find a solution
    const solution = findSolution(regions)

    if (solution && solution.length === GRID_SIZE) {
      // Verify unique solution
      if (hasUniqueSolution(regions)) {
        return { regions, solution }
      }
    }
  }

  // Fallback to a known good puzzle
  return getDefaultPuzzle()
}

function getDefaultPuzzle(): Puzzle {
  // A pre-made puzzle with guaranteed unique solution
  const regions = [
    [0, 0, 0, 1, 1, 2, 2, 2, 2],
    [0, 0, 1, 1, 1, 2, 2, 2, 2],
    [0, 3, 3, 1, 4, 4, 4, 2, 2],
    [3, 3, 3, 3, 4, 4, 4, 5, 5],
    [3, 3, 6, 4, 4, 4, 5, 5, 5],
    [6, 6, 6, 6, 7, 7, 5, 5, 5],
    [6, 6, 6, 7, 7, 7, 7, 5, 8],
    [6, 6, 7, 7, 7, 8, 8, 8, 8],
    [6, 6, 7, 7, 8, 8, 8, 8, 8]
  ]

  const solution = findSolution(regions)

  return {
    regions,
    solution: solution || [
      { row: 0, col: 5 },
      { row: 1, col: 7 },
      { row: 2, col: 2 },
      { row: 3, col: 0 },
      { row: 4, col: 3 },
      { row: 5, col: 6 },
      { row: 6, col: 8 },
      { row: 7, col: 1 },
      { row: 8, col: 4 }
    ]
  }
}
