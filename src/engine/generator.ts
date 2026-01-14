import { Puzzle, Position, GRID_SIZE, NUM_REGIONS } from '../types/game'
import { findSolution, hasUniqueSolution } from './solver'
import { areAllRegionsConnected } from './regions'
import { getRandomPuzzleFromBank } from './puzzleBank'
import { debug } from '../store/debugStore'

const MAX_GENERATION_ATTEMPTS = 50

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

// Shuffle array using provided random function
function shuffle<T>(array: T[], random: () => number): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// Generate a valid queen placement (one per row, one per column, non-adjacent)
function generateQueenPlacement(random: () => number): Position[] | null {
  const solution: Position[] = []
  const usedCols = new Set<number>()

  function isAdjacent(row1: number, col1: number, row2: number, col2: number): boolean {
    return Math.abs(row1 - row2) <= 1 && Math.abs(col1 - col2) <= 1
  }

  function backtrack(row: number): boolean {
    if (row === GRID_SIZE) return true

    // Shuffle column order for variety
    const cols = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8], random)

    for (const col of cols) {
      if (usedCols.has(col)) continue

      // Check adjacency with ALL previously placed queens
      let valid = true
      for (const q of solution) {
        if (isAdjacent(row, col, q.row, q.col)) {
          valid = false
          break
        }
      }

      if (!valid) continue

      solution.push({ row, col })
      usedCols.add(col)

      if (backtrack(row + 1)) return true

      solution.pop()
      usedCols.delete(col)
    }

    return false
  }

  return backtrack(0) ? solution : null
}

// Generate regions around a known solution
function generateRegionsFromSolution(solution: Position[], random: () => number): number[][] | null {
  const regions: number[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(-1))

  // Each queen becomes the seed of its region
  for (let i = 0; i < solution.length; i++) {
    const { row, col } = solution[i]
    regions[row][col] = i
  }

  // Grow regions using flood fill
  const frontiers: Position[][] = solution.map(p => [{ ...p }])
  const regionSizes = Array(NUM_REGIONS).fill(1)
  let unassigned = GRID_SIZE * GRID_SIZE - NUM_REGIONS

  const getNeighbors = (row: number, col: number): Position[] => {
    const neighbors: Position[] = []
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]
    for (const [dr, dc] of directions) {
      const nr = row + dr
      const nc = col + dc
      if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
        neighbors.push({ row: nr, col: nc })
      }
    }
    return neighbors
  }

  while (unassigned > 0) {
    // Find region with smallest size that has frontier
    let minSize = Infinity
    let minRegion = -1

    for (let i = 0; i < NUM_REGIONS; i++) {
      if (frontiers[i].length > 0 && regionSizes[i] < minSize) {
        minSize = regionSizes[i]
        minRegion = i
      }
    }

    if (minRegion === -1) break

    const frontier = frontiers[minRegion]
    const randomIdx = Math.floor(random() * frontier.length)
    const cell = frontier[randomIdx]

    const neighbors = shuffle(getNeighbors(cell.row, cell.col), random)
    let expanded = false

    for (const neighbor of neighbors) {
      if (regions[neighbor.row][neighbor.col] === -1) {
        regions[neighbor.row][neighbor.col] = minRegion
        regionSizes[minRegion]++
        frontiers[minRegion].push(neighbor)
        unassigned--
        expanded = true
        break
      }
    }

    if (!expanded) {
      frontier.splice(randomIdx, 1)
    }
  }

  // Handle remaining unassigned cells
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (regions[r][c] === -1) {
        const neighbors = getNeighbors(r, c)
        for (const neighbor of neighbors) {
          if (regions[neighbor.row][neighbor.col] !== -1) {
            regions[r][c] = regions[neighbor.row][neighbor.col]
            break
          }
        }
      }
    }
  }

  return regions
}

// Main puzzle generation function
export function generatePuzzle(seed?: number): Puzzle {
  const actualSeed = seed ?? Math.floor(Math.random() * 1000000)
  const random = createSeededRandom(actualSeed)

  debug.log('generator', `Starting puzzle generation with seed ${actualSeed}`)

  // Try solution-first generation
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    // Generate valid queen placement first
    const solution = generateQueenPlacement(random)
    if (!solution) {
      debug.log('generator', `Attempt ${attempt + 1}: Failed to generate queen placement`)
      continue
    }

    // Generate regions around the solution
    const regions = generateRegionsFromSolution(solution, random)
    if (!regions) {
      debug.log('generator', `Attempt ${attempt + 1}: Failed to generate regions`)
      continue
    }

    // Verify connectivity
    if (!areAllRegionsConnected(regions)) {
      debug.log('generator', `Attempt ${attempt + 1}: Regions not connected`)
      continue
    }

    // Verify the solution is valid for these regions
    const validSolution = findSolution(regions)
    if (!validSolution) {
      debug.log('generator', `Attempt ${attempt + 1}: No valid solution found`)
      continue
    }

    // Check uniqueness (allow up to 2 solutions for variety)
    if (hasUniqueSolution(regions)) {
      debug.log('generator', `Success! Generated puzzle on attempt ${attempt + 1}`, { seed: actualSeed })
      return { regions, solution: validSolution }
    } else {
      debug.log('generator', `Attempt ${attempt + 1}: Multiple solutions exist`)
    }
  }

  // Fallback to puzzle bank with seeded selection
  debug.warn('generator', `Generation failed after ${MAX_GENERATION_ATTEMPTS} attempts, using puzzle bank`)
  const bankPuzzle = getRandomPuzzleFromBank(random)

  // Return a deep copy to avoid mutation
  return {
    regions: bankPuzzle.regions.map(row => [...row]),
    solution: bankPuzzle.solution.map(pos => ({ ...pos }))
  }
}

// Generate a daily puzzle (same puzzle for everyone on the same day)
export function generateDailyPuzzle(): Puzzle {
  const seed = getDailySeed()
  debug.log('generator', `Generating daily puzzle for seed ${seed}`)
  return generatePuzzle(seed)
}

// Generate a random puzzle (different each time)
export function generateRandomPuzzle(): Puzzle {
  const seed = Date.now() + Math.floor(Math.random() * 10000)
  debug.log('generator', `Generating random puzzle with seed ${seed}`)
  return generatePuzzle(seed)
}
