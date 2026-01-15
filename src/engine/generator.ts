import { Puzzle, Difficulty } from '../types/game'
import { getRandomPuzzleFromBank, getDailyPuzzleFromBank } from './puzzleBank'
import { debug } from '../store/debugStore'

// Mulberry32 seeded PRNG - fast and good quality
function createSeededRandom(seed: number): () => number {
  return function() {
    let t = seed += 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

// Generate seed from current date for daily puzzles
function getDailySeed(): number {
  const now = new Date()
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
}

// Main puzzle generation function with difficulty support
// Uses pre-generated puzzle bank for consistent difficulty ratings
export function generatePuzzle(seed?: number, difficulty: Difficulty = 'medium'): Puzzle {
  const actualSeed = seed ?? Math.floor(Math.random() * 1000000)
  const random = createSeededRandom(actualSeed)

  debug.log('generator', `Getting puzzle from bank with seed ${actualSeed}, difficulty: ${difficulty}`)

  // Use pre-generated puzzle bank with difficulty-rated puzzles
  return getRandomPuzzleFromBank(random, difficulty)
}

// Generate a daily puzzle (same puzzle for everyone on the same day)
export function generateDailyPuzzle(difficulty: Difficulty = 'medium'): Puzzle {
  const seed = getDailySeed()
  debug.log('generator', `Getting daily puzzle for seed ${seed}, difficulty: ${difficulty}`)
  return getDailyPuzzleFromBank(seed, difficulty)
}

// Generate a random puzzle (different each time)
export function generateRandomPuzzle(difficulty: Difficulty = 'medium'): Puzzle {
  const seed = Date.now() + Math.floor(Math.random() * 10000)
  debug.log('generator', `Generating random puzzle with seed ${seed}`)
  return generatePuzzle(seed, difficulty)
}
