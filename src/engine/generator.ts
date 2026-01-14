import { Puzzle, Position, GRID_SIZE, NUM_REGIONS } from '../types/game'
import { findSolution, hasUniqueSolution } from './solver'
import { areAllRegionsConnected } from './regions'
import { getRandomPuzzleFromBank } from './puzzleBank'
import { debug } from '../store/debugStore'

const MAX_GENERATION_ATTEMPTS = 200

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

// Calculate how "blocked" each cell is by the solution
function calculateBlockScores(solution: Position[]): number[][] {
  const scores: number[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0))
  const queenSet = new Set(solution.map(q => `${q.row},${q.col}`))

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (queenSet.has(`${r},${c}`)) {
        scores[r][c] = -1 // Queen cell, special marker
        continue
      }

      // +1 if same row as any queen
      if (solution.some(q => q.row === r)) scores[r][c]++
      // +1 if same column as any queen
      if (solution.some(q => q.col === c)) scores[r][c]++
      // +3 if adjacent to any queen (strongly prefer these)
      for (const q of solution) {
        if (Math.abs(q.row - r) <= 1 && Math.abs(q.col - c) <= 1) {
          scores[r][c] += 3
          break
        }
      }
    }
  }

  return scores
}

// Generate regions preferring blocked cells (constraint-aware approach)
function generateConstraintAwareRegions(solution: Position[], random: () => number): number[][] | null {
  const regions: number[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(-1))
  const blockScores = calculateBlockScores(solution)

  // Each queen becomes the seed of its region
  for (let i = 0; i < solution.length; i++) {
    const { row, col } = solution[i]
    regions[row][col] = i
  }

  // Priority queue entries: { row, col, regionId, priority }
  // Higher priority = should be assigned first
  interface QueueEntry {
    row: number
    col: number
    regionId: number
    priority: number
  }

  const queue: QueueEntry[] = []
  const inQueue = new Set<string>()

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

  // Add initial neighbors of queens to queue
  for (let i = 0; i < solution.length; i++) {
    const { row, col } = solution[i]
    for (const neighbor of getNeighbors(row, col)) {
      if (regions[neighbor.row][neighbor.col] === -1) {
        const key = `${neighbor.row},${neighbor.col}`
        if (!inQueue.has(key)) {
          // Priority: block score + small random factor for variety
          const priority = blockScores[neighbor.row][neighbor.col] + random() * 0.5
          queue.push({ row: neighbor.row, col: neighbor.col, regionId: i, priority })
          inQueue.add(key)
        }
      }
    }
  }

  // Track region sizes for balance
  const regionSizes = Array(NUM_REGIONS).fill(1)
  const targetSize = Math.ceil((GRID_SIZE * GRID_SIZE) / NUM_REGIONS)

  // Process queue (sort by priority descending, prefer smaller regions)
  while (queue.length > 0) {
    // Sort: higher priority first, prefer smaller regions
    queue.sort((a, b) => {
      const sizeFactorA = regionSizes[a.regionId] < targetSize ? 1 : 0
      const sizeFactorB = regionSizes[b.regionId] < targetSize ? 1 : 0
      return (b.priority + sizeFactorB * 2) - (a.priority + sizeFactorA * 2)
    })

    const entry = queue.shift()!
    const { row, col, regionId } = entry

    // Skip if already assigned
    if (regions[row][col] !== -1) continue

    // Check if this cell is adjacent to its target region
    let adjacentToRegion = false
    for (const neighbor of getNeighbors(row, col)) {
      if (regions[neighbor.row][neighbor.col] === regionId) {
        adjacentToRegion = true
        break
      }
    }

    if (!adjacentToRegion) continue

    // Assign to region
    regions[row][col] = regionId
    regionSizes[regionId]++

    // Add unassigned neighbors to queue
    for (const neighbor of getNeighbors(row, col)) {
      if (regions[neighbor.row][neighbor.col] === -1) {
        const priority = blockScores[neighbor.row][neighbor.col] + random() * 0.5
        queue.push({ row: neighbor.row, col: neighbor.col, regionId, priority })
        // Don't mark as inQueue - allow multiple regions to compete for cells
      }
    }
  }

  // Handle remaining unassigned cells (assign to nearest region)
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

  // Final pass for any isolated cells
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (regions[r][c] === -1) {
        // Find nearest assigned cell
        for (let dist = 1; dist < GRID_SIZE && regions[r][c] === -1; dist++) {
          for (let dr = -dist; dr <= dist; dr++) {
            for (let dc = -dist; dc <= dist; dc++) {
              const nr = r + dr
              const nc = c + dc
              if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
                if (regions[nr][nc] !== -1) {
                  regions[r][c] = regions[nr][nc]
                  break
                }
              }
            }
            if (regions[r][c] !== -1) break
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

  const failReasons = { placement: 0, regions: 0, connectivity: 0, noSolution: 0, multipleSolutions: 0 }

  // Try solution-first generation with constraint-aware regions
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    // Generate valid queen placement first
    const solution = generateQueenPlacement(random)
    if (!solution) {
      failReasons.placement++
      continue
    }

    // Generate regions using constraint-aware algorithm
    const regions = generateConstraintAwareRegions(solution, random)
    if (!regions) {
      failReasons.regions++
      continue
    }

    // Verify connectivity
    if (!areAllRegionsConnected(regions)) {
      failReasons.connectivity++
      continue
    }

    // Verify the solution is valid for these regions
    const validSolution = findSolution(regions)
    if (!validSolution) {
      failReasons.noSolution++
      continue
    }

    // Check uniqueness
    if (hasUniqueSolution(regions)) {
      debug.log('generator', `Success! Generated unique puzzle on attempt ${attempt + 1}`, { seed: actualSeed })
      return { regions, solution: validSolution }
    } else {
      failReasons.multipleSolutions++
    }
  }

  // Log summary of failures
  debug.warn('generator', `Generation failed after ${MAX_GENERATION_ATTEMPTS} attempts`, failReasons)
  debug.log('generator', 'Using puzzle bank as fallback')

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
