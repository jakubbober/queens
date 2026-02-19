import { Puzzle, Difficulty } from '../types/game'
import { PUZZLE_BANK, RatedPuzzle } from './puzzleBankGenerated'

export { PUZZLE_BANK }
export type { RatedPuzzle }

export function getPuzzleFromBank(index: number, difficulty: Difficulty = 'expert'): Puzzle {
  const puzzles = PUZZLE_BANK[difficulty]
  const puzzle = puzzles[Math.abs(index) % puzzles.length]
  return {
    regions: puzzle.regions.map(row => [...row]),
    solution: puzzle.solution.map(pos => ({ ...pos }))
  }
}

export function getRandomPuzzleFromBank(random: () => number, difficulty: Difficulty = 'expert'): Puzzle {
  const puzzles = PUZZLE_BANK[difficulty]
  const index = Math.floor(random() * puzzles.length)
  const puzzle = puzzles[index]
  return {
    regions: puzzle.regions.map(row => [...row]),
    solution: puzzle.solution.map(pos => ({ ...pos }))
  }
}

export function getDailyPuzzleFromBank(seed: number, difficulty: Difficulty = 'expert'): Puzzle {
  const puzzles = PUZZLE_BANK[difficulty]
  const index = seed % puzzles.length
  const puzzle = puzzles[index]
  return {
    regions: puzzle.regions.map(row => [...row]),
    solution: puzzle.solution.map(pos => ({ ...pos }))
  }
}
