import { Puzzle, Position, GRID_SIZE, NUM_REGIONS, Difficulty } from '../types/game'
import { findSolution, hasUniqueSolution } from './solver'
import { areAllRegionsConnected } from './regions'
import { getRandomPuzzleFromBank } from './puzzleBank'
import { debug } from '../store/debugStore'

const MAX_GENERATION_ATTEMPTS = 100

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

// Check if assigning a cell to a region would be "safe" (not create multiple solutions)
// A cell is safe for a region if placing a queen there would be invalid when the solver reaches it
function isCellSafeForRegion(cell: Position, solution: Position[], regionIdx: number): boolean {
  const queen = solution[regionIdx]

  // If this is the queen position itself, it must belong to this region
  if (cell.row === queen.row && cell.col === queen.col) return true

  // If region's queen is in an earlier row, the region will already have a queen
  // when the solver reaches this cell's row (solver goes row by row), so this cell
  // can't be selected due to the one-queen-per-region constraint - it's safe
  if (queen.row < cell.row) return true

  // For cells in the same row or earlier rows than the region's queen,
  // they're only safe if blocked by queens that will be placed before this cell's row
  for (let i = 0; i < solution.length; i++) {
    if (i === regionIdx) continue
    const otherQueen = solution[i]

    // Only queens in earlier rows will be placed before this cell is considered
    if (otherQueen.row >= cell.row) continue

    // Same column as a queen in an earlier row
    if (otherQueen.col === cell.col) return true

    // Adjacent to a queen in an earlier row
    if (Math.abs(otherQueen.row - cell.row) <= 1 && Math.abs(otherQueen.col - cell.col) <= 1) {
      return true
    }
  }

  return false
}

// Get 4-directional neighbors
function getNeighbors(row: number, col: number): Position[] {
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

// Get difficulty parameters
function getDifficultyParams(difficulty: Difficulty): {
  competitorAggressiveness: number
  regionRegularity: number
} {
  switch (difficulty) {
    case 'easy':
      return { competitorAggressiveness: 0.9, regionRegularity: 0.7 }
    case 'medium':
      return { competitorAggressiveness: 0.7, regionRegularity: 0.5 }
    case 'hard':
      return { competitorAggressiveness: 0.5, regionRegularity: 0.3 }
  }
}

// Generate regions ensuring uniqueness by only assigning cells to "safe" regions
// Key insight: A cell is safe for a region if placing a queen there would be invalid
function generateUniquenessEnforcingRegions(
  solution: Position[],
  difficulty: Difficulty,
  random: () => number
): number[][] | null {
  const regions: number[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(-1))
  const regionSizes: number[] = Array(NUM_REGIONS).fill(0)
  const params = getDifficultyParams(difficulty)

  // Step 1: Pre-compute which regions each cell is safe for
  const safeFor: Map<string, number[]> = new Map()

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = { row: r, col: c }
      const safeRegions: number[] = []

      for (let regionId = 0; regionId < NUM_REGIONS; regionId++) {
        // Check if this is the queen position
        if (solution[regionId].row === r && solution[regionId].col === c) {
          safeRegions.push(regionId)
        } else if (isCellSafeForRegion(cell, solution, regionId)) {
          safeRegions.push(regionId)
        }
      }

      safeFor.set(`${r},${c}`, safeRegions)
    }
  }

  // Step 2: Seed queens as region centers
  for (let i = 0; i < solution.length; i++) {
    const { row, col } = solution[i]
    regions[row][col] = i
    regionSizes[i] = 1
  }

  // Step 3: Grow regions, only assigning cells to safe regions
  const targetSize = Math.ceil((GRID_SIZE * GRID_SIZE) / NUM_REGIONS)

  interface QueueEntry {
    row: number
    col: number
    regionId: number
    priority: number
  }

  const rebuildQueue = (): QueueEntry[] => {
    const queue: QueueEntry[] = []
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (regions[r][c] !== -1) continue

        const cellSafeRegions = safeFor.get(`${r},${c}`) || []

        for (const neighbor of getNeighbors(r, c)) {
          if (regions[neighbor.row][neighbor.col] !== -1) {
            const regionId = regions[neighbor.row][neighbor.col]

            // Only add if cell is safe for this region
            if (cellSafeRegions.includes(regionId)) {
              const queen = solution[regionId]
              const dist = Math.abs(r - queen.row) + Math.abs(c - queen.col)
              // Higher priority for regions whose queens are in earlier rows
              // This helps ensure cells are assigned to regions that will have queens
              // placed before the solver reaches this cell's row
              const earlyRowBonus = queen.row < r ? 5 : 0
              queue.push({
                row: r,
                col: c,
                regionId,
                priority: (10 - dist) + earlyRowBonus + random() * params.regionRegularity * 3
              })
            }
          }
        }
      }
    }
    return queue
  }

  // Grow regions iteratively
  let iterations = 0
  const maxIterations = GRID_SIZE * GRID_SIZE * 3

  while (iterations < maxIterations) {
    iterations++
    const queue = rebuildQueue()

    if (queue.length === 0) break

    // Sort by priority, prefer smaller regions
    queue.sort((a, b) => {
      const sizeFactorA = regionSizes[a.regionId] < targetSize ? 5 : 0
      const sizeFactorB = regionSizes[b.regionId] < targetSize ? 5 : 0
      return (b.priority + sizeFactorB) - (a.priority + sizeFactorA)
    })

    const best = queue[0]

    if (regions[best.row][best.col] !== -1) continue

    // Verify still adjacent
    let adjacentToRegion = false
    for (const neighbor of getNeighbors(best.row, best.col)) {
      if (regions[neighbor.row][neighbor.col] === best.regionId) {
        adjacentToRegion = true
        break
      }
    }
    if (!adjacentToRegion) continue

    regions[best.row][best.col] = best.regionId
    regionSizes[best.regionId]++
  }

  // Check for unassigned cells - these would break uniqueness
  // If we have unassigned cells, this placement won't work
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (regions[r][c] === -1) {
        // Try to assign to ANY safe adjacent region
        const cellSafeRegions = safeFor.get(`${r},${c}`) || []
        let assigned = false

        for (const neighbor of getNeighbors(r, c)) {
          if (regions[neighbor.row][neighbor.col] !== -1) {
            const regionId = regions[neighbor.row][neighbor.col]
            if (cellSafeRegions.includes(regionId)) {
              regions[r][c] = regionId
              regionSizes[regionId]++
              assigned = true
              break
            }
          }
        }

        // If still not assigned, prefer regions whose queens are in earlier rows
        // This maximizes the chance that the region already has a queen when solver reaches this cell
        if (!assigned) {
          let bestRegion = -1
          let bestQueenRow = GRID_SIZE + 1

          for (const neighbor of getNeighbors(r, c)) {
            if (regions[neighbor.row][neighbor.col] !== -1) {
              const regionId = regions[neighbor.row][neighbor.col]
              const queenRow = solution[regionId].row
              // Prefer regions with queens in earlier rows (closer to row 0)
              // but ideally before this cell's row
              if (queenRow < bestQueenRow) {
                bestRegion = regionId
                bestQueenRow = queenRow
              }
            }
          }

          if (bestRegion !== -1) {
            regions[r][c] = bestRegion
            regionSizes[bestRegion]++
          }
        }
      }
    }
  }

  // Final pass for any remaining isolated cells
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (regions[r][c] === -1) {
        for (let dist = 1; dist < GRID_SIZE && regions[r][c] === -1; dist++) {
          for (let dr = -dist; dr <= dist; dr++) {
            for (let dc = -dist; dc <= dist; dc++) {
              const nr = r + dr
              const nc = c + dc
              if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
                if (regions[nr][nc] !== -1) {
                  regions[r][c] = regions[nr][nc]
                  regionSizes[regions[r][c]]++
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

// Main puzzle generation function with difficulty support
export function generatePuzzle(seed?: number, difficulty: Difficulty = 'medium'): Puzzle {
  const actualSeed = seed ?? Math.floor(Math.random() * 1000000)
  const random = createSeededRandom(actualSeed)

  debug.log('generator', `Starting puzzle generation with seed ${actualSeed}, difficulty: ${difficulty}`)

  const failReasons = { placement: 0, regions: 0, connectivity: 0, noSolution: 0, multipleSolutions: 0 }

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    // Generate valid queen placement first
    const solution = generateQueenPlacement(random)
    if (!solution) {
      failReasons.placement++
      continue
    }

    // Generate regions using uniqueness-enforcing algorithm
    const regions = generateUniquenessEnforcingRegions(solution, difficulty, random)
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
      debug.log('generator', `Success! Generated unique puzzle on attempt ${attempt + 1}`, { seed: actualSeed, difficulty })
      return { regions, solution: validSolution }
    } else {
      failReasons.multipleSolutions++
      // Debug: log first failure details
      if (failReasons.multipleSolutions === 1) {
        debug.log('generator', 'First multipleSolutions failure - queens:', solution)
        debug.log('generator', 'Solver found different solution:', validSolution)
      }
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
export function generateDailyPuzzle(difficulty: Difficulty = 'medium'): Puzzle {
  const seed = getDailySeed()
  debug.log('generator', `Generating daily puzzle for seed ${seed}`)
  return generatePuzzle(seed, difficulty)
}

// Generate a random puzzle (different each time)
export function generateRandomPuzzle(difficulty: Difficulty = 'medium'): Puzzle {
  const seed = Date.now() + Math.floor(Math.random() * 10000)
  debug.log('generator', `Generating random puzzle with seed ${seed}`)
  return generatePuzzle(seed, difficulty)
}
