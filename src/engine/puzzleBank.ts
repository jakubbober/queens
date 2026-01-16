import { Puzzle, Difficulty } from '../types/game'
import { PUZZLE_BANK, RatedPuzzle } from './puzzleBankGenerated'

export { PUZZLE_BANK }
export type { RatedPuzzle }

export function getPuzzleFromBank(index: number, difficulty: Difficulty = 'medium'): Puzzle {
  let puzzles = PUZZLE_BANK[difficulty]
  // Fallback to hard if expert has no puzzles
  if (puzzles.length === 0 && difficulty === 'expert') {
    puzzles = PUZZLE_BANK['hard']
  }
  const puzzle = puzzles[Math.abs(index) % puzzles.length]
  return {
    regions: puzzle.regions.map(row => [...row]),
    solution: puzzle.solution.map(pos => ({ ...pos }))
  }
}

export function getRandomPuzzleFromBank(random: () => number, difficulty: Difficulty = 'medium'): Puzzle {
  let puzzles = PUZZLE_BANK[difficulty]
  // Fallback to hard if expert has no puzzles
  if (puzzles.length === 0 && difficulty === 'expert') {
    puzzles = PUZZLE_BANK['hard']
  }
  const index = Math.floor(random() * puzzles.length)
  const puzzle = puzzles[index]
  return {
    regions: puzzle.regions.map(row => [...row]),
    solution: puzzle.solution.map(pos => ({ ...pos }))
  }
}

export function getDailyPuzzleFromBank(seed: number, difficulty: Difficulty = 'medium'): Puzzle {
  let puzzles = PUZZLE_BANK[difficulty]
  // Fallback to hard if expert has no puzzles
  if (puzzles.length === 0 && difficulty === 'expert') {
    puzzles = PUZZLE_BANK['hard']
  }
  const index = seed % puzzles.length
  const puzzle = puzzles[index]
  return {
    regions: puzzle.regions.map(row => [...row]),
    solution: puzzle.solution.map(pos => ({ ...pos }))
  }
}
