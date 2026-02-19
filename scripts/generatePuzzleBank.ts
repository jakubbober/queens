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
import { Position } from '../src/types/game'
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
function generateQueenPlacement(random: () => number, gridSize: number): Position[] | null {
  const solution: Position[] = []
  const usedCols = new Set<number>()

  function isAdjacent(row1: number, col1: number, row2: number, col2: number): boolean {
    return Math.abs(row1 - row2) <= 1 && Math.abs(col1 - col2) <= 1
  }

  function backtrack(row: number): boolean {
    if (row === gridSize) return true

    const cols = shuffle(Array.from({ length: gridSize }, (_, i) => i), random)

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

function getNeighbors(row: number, col: number, gridSize: number): Position[] {
  const neighbors: Position[] = []
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]
  for (const [dr, dc] of directions) {
    const nr = row + dr
    const nc = col + dc
    if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
      neighbors.push({ row: nr, col: nc })
    }
  }
  return neighbors
}

// Generate regions with varied regularity
function generateRegions(solution: Position[], random: () => number, regularity: number, gridSize: number): number[][] | null {
  const numRegions = gridSize
  const regions: number[][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(-1))
  const regionSizes: number[] = Array(numRegions).fill(0)

  // Pre-compute safe regions
  const safeFor: Map<string, number[]> = new Map()
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const cell = { row: r, col: c }
      const safeRegions: number[] = []
      for (let regionId = 0; regionId < numRegions; regionId++) {
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
  const targetSize = Math.ceil((gridSize * gridSize) / numRegions)

  interface QueueEntry {
    row: number
    col: number
    regionId: number
    priority: number
  }

  const rebuildQueue = (): QueueEntry[] => {
    const queue: QueueEntry[] = []
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (regions[r][c] !== -1) continue

        const cellSafeRegions = safeFor.get(`${r},${c}`) || []

        for (const neighbor of getNeighbors(r, c, gridSize)) {
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
  const maxIterations = gridSize * gridSize * 3

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
    for (const neighbor of getNeighbors(best.row, best.col, gridSize)) {
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
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (regions[r][c] === -1) {
        const cellSafeRegions = safeFor.get(`${r},${c}`) || []
        let assigned = false

        for (const neighbor of getNeighbors(r, c, gridSize)) {
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
          let bestQueenRow = gridSize + 1

          for (const neighbor of getNeighbors(r, c, gridSize)) {
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
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (regions[r][c] === -1) {
        for (let dist = 1; dist < gridSize && regions[r][c] === -1; dist++) {
          for (let dr = -dist; dr <= dist; dr++) {
            for (let dc = -dist; dc <= dist; dc++) {
              const nr = r + dr
              const nc = c + dc
              if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
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
function checkMinRegionSize(regions: number[][], minSize: number, gridSize: number): boolean {
  const sizes = Array(gridSize).fill(0)
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      sizes[regions[r][c]]++
    }
  }
  return sizes.every(s => s >= minSize)
}

// Generate a single puzzle
function generatePuzzle(seed: number, regularity: number, gridSize: number): {
  regions: number[][]
  solution: Position[]
} | null {
  const random = createSeededRandom(seed)

  for (let attempt = 0; attempt < 50; attempt++) {
    const solution = generateQueenPlacement(random, gridSize)
    if (!solution) continue

    const regions = generateRegions(solution, random, regularity, gridSize)
    if (!regions) continue

    if (!areAllRegionsConnected(regions)) continue
    if (!checkMinRegionSize(regions, 3, gridSize)) continue
    if (!hasUniqueSolution(regions)) continue

    return { regions, solution }
  }

  return null
}

interface RatedPuzzle {
  regions: number[][]
  solution: Position[]
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  maxTechnique: number
  stepCount: number
  gridSize: number
}

// Check if any row is entirely one color (region)
function hasEntireRowSingleColor(regions: number[][]): boolean {
  for (let r = 0; r < regions.length; r++) {
    const firstColor = regions[r][0]
    if (regions[r].every(c => c === firstColor)) {
      return true
    }
  }
  return false
}

async function main() {
  console.log('Starting puzzle bank generation (9x9 + 10x10, all difficulties, max 3 minutes)...')

  const targetPerDifficulty = 30
  const bank: { easy: RatedPuzzle[], medium: RatedPuzzle[], hard: RatedPuzzle[], expert: RatedPuzzle[] } = {
    easy: [],
    medium: [],
    hard: [],
    expert: []
  }

  let seed = 1
  let attempts = 0
  const maxAttempts = 100000
  const maxDuration = 3 * 60 * 1000 // 3 minutes
  const startTime = Date.now()
  const regularities = [0.1, 0.2, 0.3, 0.4]
  const gridSizes = [9, 10]

  const allFull = () =>
    bank.easy.length >= targetPerDifficulty &&
    bank.medium.length >= targetPerDifficulty &&
    bank.hard.length >= targetPerDifficulty &&
    bank.expert.length >= targetPerDifficulty

  while (!allFull() && attempts < maxAttempts) {
    if (Date.now() - startTime > maxDuration) {
      console.log('\nTime limit reached (3 minutes). Using collected puzzles.')
      break
    }

    attempts++

    // Vary regularity and grid size to get different puzzle styles
    const regularity = regularities[attempts % regularities.length]
    const gridSize = gridSizes[attempts % gridSizes.length]

    const puzzle = generatePuzzle(seed++, regularity, gridSize)
    if (!puzzle) continue

    // Skip maps where any entire row is a single color
    if (hasEntireRowSingleColor(puzzle.regions)) continue

    const rating = ratePuzzleDifficulty(puzzle.regions)

    if (!rating.solvable || rating.requiresGuessing) continue

    const diff = rating.difficulty
    if (bank[diff].length >= targetPerDifficulty) continue

    bank[diff].push({
      regions: puzzle.regions,
      solution: puzzle.solution,
      difficulty: diff,
      maxTechnique: rating.maxTechnique,
      stepCount: rating.stepCount,
      gridSize
    })
    const totals = `easy:${bank.easy.length} medium:${bank.medium.length} hard:${bank.hard.length} expert:${bank.expert.length}`
    console.log(`${diff}: added (${gridSize}x${gridSize}) — ${totals}`)
  }

  const elapsed = Math.round((Date.now() - startTime) / 1000)
  console.log(`\nGeneration complete after ${attempts} attempts (${elapsed}s):`)
  console.log(`easy:${bank.easy.length} medium:${bank.medium.length} hard:${bank.hard.length} expert:${bank.expert.length}`)

  // If harder buckets are empty, fill them from medium/easy as fallback
  if (bank.hard.length === 0 && bank.medium.length > 0) {
    bank.hard.push(...bank.medium.slice(0, Math.min(targetPerDifficulty, bank.medium.length)))
    console.log(`Filled hard from medium: ${bank.hard.length} puzzles`)
  }
  if (bank.expert.length === 0 && bank.hard.length > 0) {
    bank.expert.push(...bank.hard.slice(0, Math.min(targetPerDifficulty, bank.hard.length)))
    console.log(`Filled expert from hard: ${bank.expert.length} puzzles`)
  }

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
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  maxTechnique: number
  stepCount: number
  gridSize: number
}

export const PUZZLE_BANK: {
  easy: RatedPuzzle[]
  medium: RatedPuzzle[]
  hard: RatedPuzzle[]
  expert: RatedPuzzle[]
} = ${JSON.stringify(bank, null, 2)}

export function getRandomPuzzle(
  difficulty: 'easy' | 'medium' | 'hard' | 'expert',
  random: () => number
): RatedPuzzle {
  const puzzles = PUZZLE_BANK[difficulty]
  const index = Math.floor(random() * puzzles.length)
  return puzzles[index]
}

export function getDailyPuzzle(
  difficulty: 'easy' | 'medium' | 'hard' | 'expert',
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
