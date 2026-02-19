/**
 * Human-like puzzle solver that tracks which techniques are needed to solve.
 * Used for rating puzzle difficulty based on solving strategies required.
 */

import { Position } from '../types/game'

// Technique difficulty levels (higher = harder)
export enum Technique {
  NAKED_SINGLE = 1,        // Only one valid cell in row/column/region
  REGION_ROW_COL_LOCK = 2, // Region spans only one row/col
  HIDDEN_SINGLE = 3,       // Cell is only valid spot for a constraint
  INTERSECTION = 4,        // Row-region or col-region interaction
  FORCED_ELIMINATION = 5,  // If queen here, another region has no valid cells
}

export interface SolveStep {
  technique: Technique
  row: number
  col: number
  reasoning: string
}

export interface SolveResult {
  solved: boolean
  steps: SolveStep[]
  maxTechnique: Technique
  requiresGuessing: boolean
  techniqueCounts: Record<Technique, number>
}


/**
 * Solve a puzzle using human-like techniques and track which ones are needed.
 */
export function solveWithTechniques(regions: number[][]): SolveResult {
  const gridSize = regions.length
  const numRegions = gridSize
  // Initialize candidate grid - all cells start as candidates
  const candidates: boolean[][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(true))
  const placedQueens: Position[] = []
  const steps: SolveStep[] = []
  let maxTechnique = Technique.NAKED_SINGLE

  // Track how many times each technique was used
  const techniqueCounts: Record<Technique, number> = {
    [Technique.NAKED_SINGLE]: 0,
    [Technique.REGION_ROW_COL_LOCK]: 0,
    [Technique.HIDDEN_SINGLE]: 0,
    [Technique.INTERSECTION]: 0,
    [Technique.FORCED_ELIMINATION]: 0,
  }

  // Track which rows, columns, and regions have queens
  const rowHasQueen = Array(gridSize).fill(false)
  const colHasQueen = Array(gridSize).fill(false)
  const regionHasQueen = Array(numRegions).fill(false)

  // Helper: eliminate a candidate
  function eliminate(row: number, col: number): void {
    candidates[row][col] = false
  }

  // Helper: place a queen and eliminate related candidates
  function placeQueen(row: number, col: number, technique: Technique, reasoning: string): void {
    placedQueens.push({ row, col })
    rowHasQueen[row] = true
    colHasQueen[col] = true
    regionHasQueen[regions[row][col]] = true

    steps.push({ technique, row, col, reasoning })
    techniqueCounts[technique]++
    if (technique > maxTechnique) {
      maxTechnique = technique
    }

    // Eliminate all cells in same row
    for (let c = 0; c < gridSize; c++) {
      eliminate(row, c)
    }

    // Eliminate all cells in same column
    for (let r = 0; r < gridSize; r++) {
      eliminate(r, col)
    }

    // Eliminate all cells in same region
    const regionId = regions[row][col]
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (regions[r][c] === regionId) {
          eliminate(r, c)
        }
      }
    }

    // Eliminate adjacent cells
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = row + dr
        const nc = col + dc
        if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
          eliminate(nr, nc)
        }
      }
    }
  }

  // Helper: get valid candidates for a row
  function getRowCandidates(row: number): number[] {
    const cols: number[] = []
    for (let c = 0; c < gridSize; c++) {
      if (candidates[row][c]) cols.push(c)
    }
    return cols
  }

  // Helper: get valid candidates for a column
  function getColCandidates(col: number): number[] {
    const rows: number[] = []
    for (let r = 0; r < gridSize; r++) {
      if (candidates[r][col]) rows.push(r)
    }
    return rows
  }

  // Helper: get valid candidates for a region
  function getRegionCandidates(regionId: number): Position[] {
    const cells: Position[] = []
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (regions[r][c] === regionId && candidates[r][c]) {
          cells.push({ row: r, col: c })
        }
      }
    }
    return cells
  }

  // Helper: get region cells info
  function getRegionRows(regionId: number): Set<number> {
    const rows = new Set<number>()
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (regions[r][c] === regionId && candidates[r][c]) {
          rows.add(r)
        }
      }
    }
    return rows
  }

  function getRegionCols(regionId: number): Set<number> {
    const cols = new Set<number>()
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (regions[r][c] === regionId && candidates[r][c]) {
          cols.add(c)
        }
      }
    }
    return cols
  }

  // Technique 1: Naked Single in Row
  function tryNakedSingleRow(): boolean {
    for (let r = 0; r < gridSize; r++) {
      if (rowHasQueen[r]) continue
      const cols = getRowCandidates(r)
      if (cols.length === 1) {
        placeQueen(r, cols[0], Technique.NAKED_SINGLE, `Row ${r + 1} has only one valid cell`)
        return true
      }
      if (cols.length === 0) {
        return false // Unsolvable
      }
    }
    return false
  }

  // Technique 1: Naked Single in Column
  function tryNakedSingleCol(): boolean {
    for (let c = 0; c < gridSize; c++) {
      if (colHasQueen[c]) continue
      const rows = getColCandidates(c)
      if (rows.length === 1) {
        placeQueen(rows[0], c, Technique.NAKED_SINGLE, `Column ${c + 1} has only one valid cell`)
        return true
      }
      if (rows.length === 0) {
        return false // Unsolvable
      }
    }
    return false
  }

  // Technique 1: Naked Single in Region
  function tryNakedSingleRegion(): boolean {
    for (let regionId = 0; regionId < numRegions; regionId++) {
      if (regionHasQueen[regionId]) continue
      const cells = getRegionCandidates(regionId)
      if (cells.length === 1) {
        placeQueen(cells[0].row, cells[0].col, Technique.NAKED_SINGLE, `Region ${regionId + 1} has only one valid cell`)
        return true
      }
      if (cells.length === 0) {
        return false // Unsolvable
      }
    }
    return false
  }

  // Technique 2: Region locked to single row
  function tryRegionRowLock(): boolean {
    for (let regionId = 0; regionId < numRegions; regionId++) {
      if (regionHasQueen[regionId]) continue
      const regionRows = getRegionRows(regionId)
      if (regionRows.size === 1) {
        const row = Array.from(regionRows)[0]
        if (row !== undefined && !rowHasQueen[row]) {
          // This region is locked to this row, eliminate other candidates in this row
          const cells = getRegionCandidates(regionId)
          if (cells.length === 1) {
            placeQueen(cells[0].row, cells[0].col, Technique.REGION_ROW_COL_LOCK,
              `Region ${regionId + 1} is locked to row ${row + 1}`)
            return true
          }
          // Eliminate other row candidates outside this region
          let eliminated = false
          for (let c = 0; c < gridSize; c++) {
            if (candidates[row][c] && regions[row][c] !== regionId) {
              eliminate(row, c)
              eliminated = true
            }
          }
          if (eliminated) {
            techniqueCounts[Technique.REGION_ROW_COL_LOCK]++
            maxTechnique = Math.max(maxTechnique, Technique.REGION_ROW_COL_LOCK)
            return true // Made progress
          }
        }
      }
    }
    return false
  }

  // Technique 2: Region locked to single column
  function tryRegionColLock(): boolean {
    for (let regionId = 0; regionId < numRegions; regionId++) {
      if (regionHasQueen[regionId]) continue
      const regionCols = getRegionCols(regionId)
      if (regionCols.size === 1) {
        const col = Array.from(regionCols)[0]
        if (col !== undefined && !colHasQueen[col]) {
          // This region is locked to this column
          const cells = getRegionCandidates(regionId)
          if (cells.length === 1) {
            placeQueen(cells[0].row, cells[0].col, Technique.REGION_ROW_COL_LOCK,
              `Region ${regionId + 1} is locked to column ${col + 1}`)
            return true
          }
          // Eliminate other column candidates outside this region
          let eliminated = false
          for (let r = 0; r < gridSize; r++) {
            if (candidates[r][col] && regions[r][col] !== regionId) {
              eliminate(r, col)
              eliminated = true
            }
          }
          if (eliminated) {
            techniqueCounts[Technique.REGION_ROW_COL_LOCK]++
            maxTechnique = Math.max(maxTechnique, Technique.REGION_ROW_COL_LOCK)
            return true
          }
        }
      }
    }
    return false
  }

  // Technique 3: Hidden single - cell is only valid spot for row in its region
  function tryHiddenSingle(): boolean {
    // Check if a cell is the only one in its region that can satisfy a row constraint
    for (let row = 0; row < gridSize; row++) {
      if (rowHasQueen[row]) continue

      // Group candidates by region
      const candidatesByRegion = new Map<number, Position[]>()
      for (let c = 0; c < gridSize; c++) {
        if (candidates[row][c]) {
          const regionId = regions[row][c]
          if (!candidatesByRegion.has(regionId)) {
            candidatesByRegion.set(regionId, [])
          }
          candidatesByRegion.get(regionId)!.push({ row, col: c })
        }
      }

      // If only one cell in a region can satisfy this row, place queen there
      for (const [regionId, cells] of candidatesByRegion) {
        if (regionHasQueen[regionId]) continue
        if (cells.length === 1 && getRegionCandidates(regionId).length > 1) {
          placeQueen(cells[0].row, cells[0].col, Technique.HIDDEN_SINGLE,
            `Only cell in region ${regionId + 1} that can satisfy row ${row + 1}`)
          return true
        }
      }
    }

    // Check columns similarly
    for (let col = 0; col < gridSize; col++) {
      if (colHasQueen[col]) continue

      const candidatesByRegion = new Map<number, Position[]>()
      for (let r = 0; r < gridSize; r++) {
        if (candidates[r][col]) {
          const regionId = regions[r][col]
          if (!candidatesByRegion.has(regionId)) {
            candidatesByRegion.set(regionId, [])
          }
          candidatesByRegion.get(regionId)!.push({ row: r, col })
        }
      }

      for (const [regionId, cells] of candidatesByRegion) {
        if (regionHasQueen[regionId]) continue
        if (cells.length === 1 && getRegionCandidates(regionId).length > 1) {
          placeQueen(cells[0].row, cells[0].col, Technique.HIDDEN_SINGLE,
            `Only cell in region ${regionId + 1} that can satisfy column ${col + 1}`)
          return true
        }
      }
    }

    return false
  }

  // Technique 4: Intersection elimination
  function tryIntersectionElimination(): boolean {
    // If all candidates for a row within a region are in the same row,
    // eliminate other candidates in that row outside the region
    for (let regionId = 0; regionId < numRegions; regionId++) {
      if (regionHasQueen[regionId]) continue

      const cells = getRegionCandidates(regionId)
      if (cells.length <= 1) continue

      // Check if all candidates are in same row
      const rows = new Set(cells.map(c => c.row))
      if (rows.size === 1) {
        const row = Array.from(rows)[0]
        if (row !== undefined) {
          let eliminated = false
          for (let c = 0; c < gridSize; c++) {
            if (candidates[row][c] && regions[row][c] !== regionId) {
              eliminate(row, c)
              eliminated = true
            }
          }
          if (eliminated) {
            techniqueCounts[Technique.INTERSECTION]++
            maxTechnique = Math.max(maxTechnique, Technique.INTERSECTION)
            return true
          }
        }
      }

      // Check if all candidates are in same column
      const cols = new Set(cells.map(c => c.col))
      if (cols.size === 1) {
        const col = Array.from(cols)[0]
        if (col !== undefined) {
          let eliminated = false
          for (let r = 0; r < gridSize; r++) {
            if (candidates[r][col] && regions[r][col] !== regionId) {
              eliminate(r, col)
              eliminated = true
            }
          }
          if (eliminated) {
            techniqueCounts[Technique.INTERSECTION]++
            maxTechnique = Math.max(maxTechnique, Technique.INTERSECTION)
            return true
          }
        }
      }
    }
    return false
  }

  // Technique 5: Forced elimination (if queen here, another region has no valid cells)
  function tryForcedElimination(): boolean {
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (!candidates[r][c]) continue

        // Simulate placing queen here
        const affectedRegions = new Set<number>()
        const regionId = regions[r][c]

        // Check what regions would be affected
        // Same row
        for (let cc = 0; cc < gridSize; cc++) {
          if (candidates[r][cc] && regions[r][cc] !== regionId) {
            affectedRegions.add(regions[r][cc])
          }
        }
        // Same column
        for (let rr = 0; rr < gridSize; rr++) {
          if (candidates[rr][c] && regions[rr][c] !== regionId) {
            affectedRegions.add(regions[rr][c])
          }
        }
        // Adjacent
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr
            const nc = c + dc
            if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
              if (candidates[nr][nc] && regions[nr][nc] !== regionId) {
                affectedRegions.add(regions[nr][nc])
              }
            }
          }
        }

        // Check if any affected region would have no candidates left
        for (const affectedRegionId of affectedRegions) {
          if (regionHasQueen[affectedRegionId]) continue

          const regionCells = getRegionCandidates(affectedRegionId)
          const remainingCells = regionCells.filter(cell => {
            // Would this cell be eliminated?
            if (cell.row === r) return false // Same row
            if (cell.col === c) return false // Same column
            if (Math.abs(cell.row - r) <= 1 && Math.abs(cell.col - c) <= 1) return false // Adjacent
            return true
          })

          if (remainingCells.length === 0) {
            // Placing queen at (r, c) would make region unsolvable - eliminate it
            eliminate(r, c)
            techniqueCounts[Technique.FORCED_ELIMINATION]++
            maxTechnique = Math.max(maxTechnique, Technique.FORCED_ELIMINATION)
            return true
          }
        }
      }
    }
    return false
  }

  // Main solving loop
  const maxIterations = 1000
  let iterations = 0

  while (placedQueens.length < numRegions && iterations < maxIterations) {
    iterations++

    // Try techniques in order of difficulty
    if (tryNakedSingleRow()) continue
    if (tryNakedSingleCol()) continue
    if (tryNakedSingleRegion()) continue
    if (tryRegionRowLock()) continue
    if (tryRegionColLock()) continue
    if (tryHiddenSingle()) continue
    if (tryIntersectionElimination()) continue
    if (tryForcedElimination()) continue

    // No technique made progress - puzzle requires guessing
    break
  }

  const solved = placedQueens.length === numRegions
  const requiresGuessing = !solved && iterations < maxIterations

  return {
    solved,
    steps,
    maxTechnique,
    requiresGuessing,
    techniqueCounts
  }
}

/**
 * Get difficulty rating based on technique usage.
 * Difficulty is determined by:
 * - Which techniques are required
 * - How often complex techniques are used
 */
export function getDifficultyFromSolve(
  techniqueCounts: Record<Technique, number>,
  _stepCount?: number
): 'easy' | 'medium' | 'hard' | 'expert' {
  const hiddenSingleCount = techniqueCounts[Technique.HIDDEN_SINGLE]
  const intersectionCount = techniqueCounts[Technique.INTERSECTION]
  const forcedEliminationCount = techniqueCounts[Technique.FORCED_ELIMINATION]
  const advancedTotal = intersectionCount + forcedEliminationCount

  // Expert: uses multiple advanced techniques OR high complexity with advanced
  if (advancedTotal >= 2 || (advancedTotal > 0 && hiddenSingleCount >= 3)) {
    return 'expert'
  }

  // Hard: uses any advanced technique OR uses HIDDEN_SINGLE frequently (4+ times)
  if (
    intersectionCount > 0 ||
    forcedEliminationCount > 0 ||
    hiddenSingleCount >= 4
  ) {
    return 'hard'
  }

  // Medium: uses HIDDEN_SINGLE 2-3 times
  if (hiddenSingleCount >= 2) {
    return 'medium'
  }

  // Easy: 0-1 HIDDEN_SINGLE uses
  return 'easy'
}

/**
 * Rate a puzzle's difficulty by solving it with human techniques.
 */
export function ratePuzzleDifficulty(regions: number[][]): {
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  maxTechnique: Technique
  solvable: boolean
  requiresGuessing: boolean
  stepCount: number
  techniqueCounts: Record<Technique, number>
} {
  const result = solveWithTechniques(regions)
  const stepCount = result.steps.length
  return {
    difficulty: getDifficultyFromSolve(result.techniqueCounts, stepCount),
    maxTechnique: result.maxTechnique,
    solvable: result.solved,
    requiresGuessing: result.requiresGuessing,
    stepCount,
    techniqueCounts: result.techniqueCounts
  }
}
