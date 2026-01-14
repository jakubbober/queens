import { Position, Queen, AutoPlacedX, GRID_SIZE } from '../types/game'
import { validatePlacement } from './validator'
import { isValidPlacement } from './solver'

export type HintType = 'conflict' | 'naked_single_row' | 'naked_single_col' | 'naked_single_region' | 'elimination'

export interface Hint {
  type: HintType
  position: Position | null
  explanation: string
  highlightCells: Position[]
  highlightQueens: string[]
  canApply: boolean
}

interface CellInfo {
  row: number
  col: number
  region: number
  isBlocked: boolean
  hasQueen: boolean
  hasManualX: boolean
  hasAutoX: boolean
}

function getRegionName(regionId: number): string {
  const colors = ['blue', 'red', 'green', 'orange', 'purple', 'teal', 'yellow', 'pink', 'gray']
  return colors[regionId] || `region ${regionId + 1}`
}

function getCellsInRegion(regions: number[][], regionId: number): Position[] {
  const cells: Position[] = []
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (regions[row][col] === regionId) {
        cells.push({ row, col })
      }
    }
  }
  return cells
}

function isCellBlocked(
  row: number,
  col: number,
  queens: Queen[],
  regions: number[][]
): boolean {
  // Check if placing a queen here would violate any rules
  const queenPositions = queens.map(q => q.position)
  return !isValidPlacement(queenPositions, regions, row, col)
}

export function analyzeForHint(
  queens: Queen[],
  manualXs: Position[],
  autoXs: AutoPlacedX[],
  regions: number[][]
): Hint | null {
  // Build cell info grid
  const cellInfo: CellInfo[][] = []
  const queenPositions = new Set(queens.map(q => `${q.position.row},${q.position.col}`))
  const manualXPositions = new Set(manualXs.map(x => `${x.row},${x.col}`))
  const autoXPositions = new Set(autoXs.map(x => `${x.position.row},${x.position.col}`))

  for (let row = 0; row < GRID_SIZE; row++) {
    cellInfo[row] = []
    for (let col = 0; col < GRID_SIZE; col++) {
      const key = `${row},${col}`
      cellInfo[row][col] = {
        row,
        col,
        region: regions[row][col],
        isBlocked: isCellBlocked(row, col, queens, regions),
        hasQueen: queenPositions.has(key),
        hasManualX: manualXPositions.has(key),
        hasAutoX: autoXPositions.has(key)
      }
    }
  }

  // 1. Check for conflicts first
  const validation = validatePlacement(queens, regions)
  if (!validation.isValid) {
    // Find the first conflict to report
    if (validation.rowConflicts.size > 0) {
      const entry = Array.from(validation.rowConflicts.entries())[0]
      if (entry) {
        const [row, positions] = entry
        const conflictQueens = queens.filter(q => positions.some((p: Position) =>
          p.row === q.position.row && p.col === q.position.col
        ))
        return {
          type: 'conflict',
          position: null,
          explanation: `Row ${row + 1} has ${positions.length} queens. Each row can only have one queen.`,
          highlightCells: positions,
          highlightQueens: conflictQueens.map(q => q.id),
          canApply: false
        }
      }
    }

    if (validation.colConflicts.size > 0) {
      const entry = Array.from(validation.colConflicts.entries())[0]
      if (entry) {
        const [col, positions] = entry
        const conflictQueens = queens.filter(q => positions.some((p: Position) =>
          p.row === q.position.row && p.col === q.position.col
        ))
        return {
          type: 'conflict',
          position: null,
          explanation: `Column ${col + 1} has ${positions.length} queens. Each column can only have one queen.`,
          highlightCells: positions,
          highlightQueens: conflictQueens.map(q => q.id),
          canApply: false
        }
      }
    }

    if (validation.regionConflicts.size > 0) {
      const entry = Array.from(validation.regionConflicts.entries())[0]
      if (entry) {
        const [region, positions] = entry
        const conflictQueens = queens.filter(q => positions.some((p: Position) =>
          p.row === q.position.row && p.col === q.position.col
        ))
        return {
          type: 'conflict',
          position: null,
          explanation: `The ${getRegionName(region)} region has ${positions.length} queens. Each region can only have one queen.`,
          highlightCells: positions,
          highlightQueens: conflictQueens.map(q => q.id),
          canApply: false
        }
      }
    }

    if (validation.adjacentConflicts.length > 0) {
      const [p1, p2] = validation.adjacentConflicts[0]
      const conflictQueens = queens.filter(q =>
        (q.position.row === p1.row && q.position.col === p1.col) ||
        (q.position.row === p2.row && q.position.col === p2.col)
      )
      return {
        type: 'conflict',
        position: null,
        explanation: `Two queens are adjacent to each other. Queens cannot touch, even diagonally.`,
        highlightCells: [p1, p2],
        highlightQueens: conflictQueens.map(q => q.id),
        canApply: false
      }
    }
  }

  // 2. Check for naked singles in rows (row has only one valid empty cell)
  for (let row = 0; row < GRID_SIZE; row++) {
    // Skip if row already has a queen
    if (queens.some(q => q.position.row === row)) continue

    const validCells: Position[] = []
    const rowCells: Position[] = []

    for (let col = 0; col < GRID_SIZE; col++) {
      rowCells.push({ row, col })
      const info = cellInfo[row][col]
      if (!info.hasQueen && !info.isBlocked) {
        validCells.push({ row, col })
      }
    }

    if (validCells.length === 1) {
      return {
        type: 'naked_single_row',
        position: validCells[0],
        explanation: `Row ${row + 1} has only one valid cell remaining. All other cells are blocked by existing queens.`,
        highlightCells: rowCells,
        highlightQueens: [],
        canApply: true
      }
    }
  }

  // 3. Check for naked singles in columns
  for (let col = 0; col < GRID_SIZE; col++) {
    // Skip if column already has a queen
    if (queens.some(q => q.position.col === col)) continue

    const validCells: Position[] = []
    const colCells: Position[] = []

    for (let row = 0; row < GRID_SIZE; row++) {
      colCells.push({ row, col })
      const info = cellInfo[row][col]
      if (!info.hasQueen && !info.isBlocked) {
        validCells.push({ row, col })
      }
    }

    if (validCells.length === 1) {
      return {
        type: 'naked_single_col',
        position: validCells[0],
        explanation: `Column ${col + 1} has only one valid cell remaining. All other cells are blocked by existing queens.`,
        highlightCells: colCells,
        highlightQueens: [],
        canApply: true
      }
    }
  }

  // 4. Check for naked singles in regions
  for (let regionId = 0; regionId < GRID_SIZE; regionId++) {
    // Skip if region already has a queen
    if (queens.some(q => regions[q.position.row][q.position.col] === regionId)) continue

    const regionCells = getCellsInRegion(regions, regionId)
    const validCells: Position[] = []

    for (const cell of regionCells) {
      const info = cellInfo[cell.row][cell.col]
      if (!info.hasQueen && !info.isBlocked) {
        validCells.push(cell)
      }
    }

    if (validCells.length === 1) {
      return {
        type: 'naked_single_region',
        position: validCells[0],
        explanation: `The ${getRegionName(regionId)} region has only one valid cell remaining. All other cells are blocked.`,
        highlightCells: regionCells,
        highlightQueens: [],
        canApply: true
      }
    }
  }

  // 5. Find cells where elimination narrows it down
  // Look for a cell that's the only valid cell in its row AND column OR region
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const info = cellInfo[row][col]
      if (info.hasQueen || info.isBlocked) continue

      // Check if this is the only valid cell that can satisfy multiple constraints
      const rowHasQueen = queens.some(q => q.position.row === row)
      const colHasQueen = queens.some(q => q.position.col === col)
      const regionHasQueen = queens.some(q => regions[q.position.row][q.position.col] === info.region)

      // Count how many constraints this cell satisfies
      let constraints = 0
      if (!rowHasQueen) constraints++
      if (!colHasQueen) constraints++
      if (!regionHasQueen) constraints++

      if (constraints >= 2) {
        // This cell could satisfy multiple constraints, check if it's forced
        let validInRow = 0
        let validInCol = 0

        for (let c = 0; c < GRID_SIZE; c++) {
          if (!cellInfo[row][c].hasQueen && !cellInfo[row][c].isBlocked) validInRow++
        }
        for (let r = 0; r < GRID_SIZE; r++) {
          if (!cellInfo[r][col].hasQueen && !cellInfo[r][col].isBlocked) validInCol++
        }

        if (validInRow <= 2 || validInCol <= 2) {
          const blockingQueens = queens.filter(q => {
            const dr = Math.abs(q.position.row - row)
            const dc = Math.abs(q.position.col - col)
            return dr <= 1 && dc <= 1 && (dr !== 0 || dc !== 0)
          })

          return {
            type: 'elimination',
            position: { row, col },
            explanation: `This cell is one of very few options. Row ${row + 1} has ${validInRow} valid cell(s), Column ${col + 1} has ${validInCol} valid cell(s).`,
            highlightCells: [{ row, col }],
            highlightQueens: blockingQueens.map(q => q.id),
            canApply: true
          }
        }
      }
    }
  }

  // No obvious hint found
  return null
}
