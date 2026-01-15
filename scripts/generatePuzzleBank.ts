/**
 * Script to generate a pre-rated puzzle bank.
 * Run with: npx tsx scripts/generatePuzzleBank.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Import types and functions
import { Position, GRID_SIZE, NUM_REGIONS } from '../src/types/game'
import { hasUniqueSolution } from '../src/engine/solver'
import { areAllRegionsConnected } from '../src/engine/regions'
import { ratePuzzleDifficulty, Technique } from '../src/engine/humanSolver'

// Mulberry32 seeded PRNG
function createSeededRandom(seed: number): () => number {
  return function() {
    let t = seed += 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function shuffle<T>(array: T[], random: () => number): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// Generate a valid queen placement
function generateQueenPlacement(random: () => number): Position[] | null {
  const solution: Position[] = []
  const usedCols = new Set<number>()

  function isAdjacent(row1: number, col1: number, row2: number, col2: number): boolean {
    return Math.abs(row1 - row2) <= 1 && Math.abs(col1 - col2) <= 1
  }

  function backtrack(row: number): boolean {
    if (row === GRID_SIZE) return true

    const cols = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8], random)

    for (const col of cols) {
      if (usedCols.has(col)) continue

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

// Check if a cell is safe for a region
function isCellSafeForRegion(cell: Position, solution: Position[], regionIdx: number): boolean {
  const queen = solution[regionIdx]

  if (cell.row === queen.row && cell.col === queen.col) return true
  if (queen.row < cell.row) return true

  for (let i = 0; i < solution.length; i++) {
    if (i === regionIdx) continue
    const otherQueen = solution[i]
    if (otherQueen.row >= cell.row) continue
    if (otherQueen.col === cell.col) return true
    if (Math.abs(otherQueen.row - cell.row) <= 1 && Math.abs(otherQueen.col - cell.col) <= 1) {
      return true
    }
  }

  return false
}

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

// Generate regions with varied regularity
function generateRegions(solution: Position[], random: () => number, regularity: number): number[][] | null {
  const regions: number[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(-1))
  const regionSizes: number[] = Array(NUM_REGIONS).fill(0)

  // Pre-compute safe regions
  const safeFor: Map<string, number[]> = new Map()
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = { row: r, col: c }
      const safeRegions: number[] = []
      for (let regionId = 0; regionId < NUM_REGIONS; regionId++) {
        if (solution[regionId].row === r && solution[regionId].col === c) {
          safeRegions.push(regionId)
        } else if (isCellSafeForRegion(cell, solution, regionId)) {
          safeRegions.push(regionId)
        }
      }
      safeFor.set(`${r},${c}`, safeRegions)
    }
  }

  // Seed queens as region centers
  for (let i = 0; i < solution.length; i++) {
    const { row, col } = solution[i]
    regions[row][col] = i
    regionSizes[i] = 1
  }

  // Grow regions
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

            if (cellSafeRegions.includes(regionId)) {
              const queen = solution[regionId]
              const dist = Math.abs(r - queen.row) + Math.abs(c - queen.col)
              const earlyRowBonus = queen.row < r ? 5 : 0
              queue.push({
                row: r,
                col: c,
                regionId,
                priority: (10 - dist) + earlyRowBonus + random() * regularity * 3
              })
            }
          }
        }
      }
    }
    return queue
  }

  let iterations = 0
  const maxIterations = GRID_SIZE * GRID_SIZE * 3

  while (iterations < maxIterations) {
    iterations++
    const queue = rebuildQueue()
    if (queue.length === 0) break

    queue.sort((a, b) => {
      const sizeFactorA = regionSizes[a.regionId] < targetSize ? 5 : 0
      const sizeFactorB = regionSizes[b.regionId] < targetSize ? 5 : 0
      return (b.priority + sizeFactorB) - (a.priority + sizeFactorA)
    })

    const best = queue[0]
    if (regions[best.row][best.col] !== -1) continue

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

  // Handle unassigned cells
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (regions[r][c] === -1) {
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

        if (!assigned) {
          let bestRegion = -1
          let bestQueenRow = GRID_SIZE + 1

          for (const neighbor of getNeighbors(r, c)) {
            if (regions[neighbor.row][neighbor.col] !== -1) {
              const regionId = regions[neighbor.row][neighbor.col]
              const queenRow = solution[regionId].row
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

  // Final pass for isolated cells
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

// Check minimum region size
function checkMinRegionSize(regions: number[][], minSize: number): boolean {
  const sizes = Array(NUM_REGIONS).fill(0)
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      sizes[regions[r][c]]++
    }
  }
  return sizes.every(s => s >= minSize)
}

// Generate a single puzzle
function generatePuzzle(seed: number, regularity: number): {
  regions: number[][]
  solution: Position[]
} | null {
  const random = createSeededRandom(seed)

  for (let attempt = 0; attempt < 50; attempt++) {
    const solution = generateQueenPlacement(random)
    if (!solution) continue

    const regions = generateRegions(solution, random, regularity)
    if (!regions) continue

    if (!areAllRegionsConnected(regions)) continue
    if (!checkMinRegionSize(regions, 3)) continue
    if (!hasUniqueSolution(regions)) continue

    return { regions, solution }
  }

  return null
}

interface RatedPuzzle {
  regions: number[][]
  solution: Position[]
  difficulty: 'easy' | 'medium' | 'hard'
  maxTechnique: number
  stepCount: number
}

async function main() {
  console.log('Starting puzzle bank generation...')

  const targets = { easy: 100, medium: 100, hard: 50 }
  const bank: { easy: RatedPuzzle[], medium: RatedPuzzle[], hard: RatedPuzzle[] } = {
    easy: [],
    medium: [],
    hard: []
  }

  let seed = 1
  let attempts = 0
  const maxAttempts = 50000
  const regularities = [0.3, 0.5, 0.7, 0.9]

  while (
    (bank.easy.length < targets.easy ||
     bank.medium.length < targets.medium ||
     bank.hard.length < targets.hard) &&
    attempts < maxAttempts
  ) {
    attempts++

    // Vary regularity to get different puzzle styles
    const regularity = regularities[attempts % regularities.length]

    const puzzle = generatePuzzle(seed++, regularity)
    if (!puzzle) continue

    const rating = ratePuzzleDifficulty(puzzle.regions)

    if (!rating.solvable || rating.requiresGuessing) continue

    const ratedPuzzle: RatedPuzzle = {
      regions: puzzle.regions,
      solution: puzzle.solution,
      difficulty: rating.difficulty,
      maxTechnique: rating.maxTechnique,
      stepCount: rating.stepCount
    }

    // Only add if we need more of this difficulty
    if (rating.difficulty === 'easy' && bank.easy.length < targets.easy) {
      bank.easy.push(ratedPuzzle)
      console.log(`Easy: ${bank.easy.length}/${targets.easy}, Medium: ${bank.medium.length}/${targets.medium}, Hard: ${bank.hard.length}/${targets.hard}`)
    } else if (rating.difficulty === 'medium' && bank.medium.length < targets.medium) {
      bank.medium.push(ratedPuzzle)
      console.log(`Easy: ${bank.easy.length}/${targets.easy}, Medium: ${bank.medium.length}/${targets.medium}, Hard: ${bank.hard.length}/${targets.hard}`)
    } else if (rating.difficulty === 'hard' && bank.hard.length < targets.hard) {
      bank.hard.push(ratedPuzzle)
      console.log(`Easy: ${bank.easy.length}/${targets.easy}, Medium: ${bank.medium.length}/${targets.medium}, Hard: ${bank.hard.length}/${targets.hard}`)
    }
  }

  console.log(`\nGeneration complete after ${attempts} attempts:`)
  console.log(`Easy: ${bank.easy.length}, Medium: ${bank.medium.length}, Hard: ${bank.hard.length}`)

  // Generate the output file
  const output = `/**
 * Auto-generated puzzle bank with difficulty ratings.
 * Generated on: ${new Date().toISOString()}
 *
 * DO NOT EDIT MANUALLY - regenerate with: npx tsx scripts/generatePuzzleBank.ts
 */

import { Position } from '../types/game'

export interface RatedPuzzle {
  regions: number[][]
  solution: Position[]
  difficulty: 'easy' | 'medium' | 'hard'
  maxTechnique: number
  stepCount: number
}

export const PUZZLE_BANK: {
  easy: RatedPuzzle[]
  medium: RatedPuzzle[]
  hard: RatedPuzzle[]
} = ${JSON.stringify(bank, null, 2)}

export function getRandomPuzzle(
  difficulty: 'easy' | 'medium' | 'hard',
  random: () => number
): RatedPuzzle {
  const puzzles = PUZZLE_BANK[difficulty]
  const index = Math.floor(random() * puzzles.length)
  return puzzles[index]
}

export function getDailyPuzzle(
  difficulty: 'easy' | 'medium' | 'hard',
  seed: number
): RatedPuzzle {
  const puzzles = PUZZLE_BANK[difficulty]
  const index = seed % puzzles.length
  return puzzles[index]
}
`

  const outputPath = path.join(__dirname, '../src/engine/puzzleBankGenerated.ts')
  fs.writeFileSync(outputPath, output)
  console.log(`\nPuzzle bank written to: ${outputPath}`)
}

main().catch(console.error)
