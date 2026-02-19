import { Position, Queen, AutoPlacedX } from '../types/game'
import { validatePlacement } from './validator'
import { isValidPlacement } from './solver'
import { debug } from '../store/debugStore'

export type HintType =
  | 'conflict'
  | 'naked_single_row'
  | 'naked_single_col'
  | 'naked_single_region'
  | 'elimination'
  | 'best_region'
  | 'general_tip'

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
  const gridSize = regions.length
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
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
  const queenPositions = queens.map(q => q.position)
  return !isValidPlacement(queenPositions, regions, row, col)
}

// Get a general strategy tip based on game state
function getGeneralTip(queensCount: number): Hint {
  const tips = [
    {
      explanation: "Look for rows, columns, or regions with the fewest valid cells - they're easiest to solve!",
      condition: () => queensCount < 3
    },
    {
      explanation: "Remember: queens block all 8 adjacent cells (including diagonals). Use this to eliminate options.",
      condition: () => queensCount < 4
    },
    {
      explanation: "Try focusing on corner regions first - they often have more constraints.",
      condition: () => queensCount < 5
    },
    {
      explanation: "If stuck, look for regions where most cells are already blocked by placed queens.",
      condition: () => queensCount >= 3
    },
    {
      explanation: "Check where your placed queens intersect - the blocking patterns create forced moves.",
      condition: () => queensCount >= 4
    }
  ]

  // Find appropriate tip for current game state
  const applicableTips = tips.filter(t => t.condition())
  const tip = applicableTips[queensCount % applicableTips.length] || tips[0]

  return {
    type: 'general_tip',
    position: null,
    explanation: tip.explanation,
    highlightCells: [],
    highlightQueens: [],
    canApply: false
  }
}

// Find the best region to focus on (fewest valid cells)
function findBestRegionHint(
  cellInfo: CellInfo[][],
  queens: Queen[],
  regions: number[][]
): Hint | null {
  let bestRegion = -1
  let bestCount = Infinity
  let bestCells: Position[] = []
  const gridSize = regions.length

  for (let regionId = 0; regionId < gridSize; regionId++) {
    // Skip regions that already have a queen
    if (queens.some(q => regions[q.position.row][q.position.col] === regionId)) {
      continue
    }

    const regionCells = getCellsInRegion(regions, regionId)
    const validCells = regionCells.filter(cell => {
      const info = cellInfo[cell.row][cell.col]
      return !info.hasQueen && !info.isBlocked
    })

    // Find region with 2-5 valid cells (good early game target)
    if (validCells.length >= 2 && validCells.length <= 5 && validCells.length < bestCount) {
      bestRegion = regionId
      bestCount = validCells.length
      bestCells = validCells
    }
  }

  if (bestRegion !== -1 && bestCells.length > 0) {
    return {
      type: 'best_region',
      position: bestCells[0],
      explanation: `The ${getRegionName(bestRegion)} region has only ${bestCount} possible cells for its queen. Try focusing here!`,
      highlightCells: bestCells,
      highlightQueens: [],
      canApply: false
    }
  }

  return null
}

export function analyzeForHint(
  queens: Queen[],
  manualXs: Position[],
  autoXs: AutoPlacedX[],
  regions: number[][]
): Hint {
  debug.log('hints', `Analyzing for hint with ${queens.length} queens placed`)

  const gridSize = regions.length

  // Build cell info grid
  const cellInfo: CellInfo[][] = []
  const queenPositions = new Set(queens.map(q => `${q.position.row},${q.position.col}`))
  const manualXPositions = new Set(manualXs.map(x => `${x.row},${x.col}`))
  const autoXPositions = new Set(autoXs.map(x => `${x.position.row},${x.position.col}`))

  for (let row = 0; row < gridSize; row++) {
    cellInfo[row] = []
    for (let col = 0; col < gridSize; col++) {
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
    debug.log('hints', 'Found conflict in placement')

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

  // 2. Check for naked singles in rows
  for (let row = 0; row < gridSize; row++) {
    if (queens.some(q => q.position.row === row)) continue

    const validCells: Position[] = []
    const rowCells: Position[] = []

    for (let col = 0; col < gridSize; col++) {
      rowCells.push({ row, col })
      const info = cellInfo[row][col]
      if (!info.hasQueen && !info.isBlocked) {
        validCells.push({ row, col })
      }
    }

    if (validCells.length === 1) {
      debug.log('hints', `Found naked single in row ${row + 1}`)
      return {
        type: 'naked_single_row',
        position: validCells[0],
        explanation: `Row ${row + 1} has only one valid cell remaining. Place a queen here!`,
        highlightCells: rowCells,
        highlightQueens: [],
        canApply: true
      }
    }
  }

  // 3. Check for naked singles in columns
  for (let col = 0; col < gridSize; col++) {
    if (queens.some(q => q.position.col === col)) continue

    const validCells: Position[] = []
    const colCells: Position[] = []

    for (let row = 0; row < gridSize; row++) {
      colCells.push({ row, col })
      const info = cellInfo[row][col]
      if (!info.hasQueen && !info.isBlocked) {
        validCells.push({ row, col })
      }
    }

    if (validCells.length === 1) {
      debug.log('hints', `Found naked single in column ${col + 1}`)
      return {
        type: 'naked_single_col',
        position: validCells[0],
        explanation: `Column ${col + 1} has only one valid cell remaining. Place a queen here!`,
        highlightCells: colCells,
        highlightQueens: [],
        canApply: true
      }
    }
  }

  // 4. Check for naked singles in regions
  for (let regionId = 0; regionId < gridSize; regionId++) {
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
      debug.log('hints', `Found naked single in ${getRegionName(regionId)} region`)
      return {
        type: 'naked_single_region',
        position: validCells[0],
        explanation: `The ${getRegionName(regionId)} region has only one valid cell remaining. Place a queen here!`,
        highlightCells: regionCells,
        highlightQueens: [],
        canApply: true
      }
    }
  }

  // 5. Look for elimination opportunities (relaxed criteria)
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const info = cellInfo[row][col]
      if (info.hasQueen || info.isBlocked) continue

      const rowHasQueen = queens.some(q => q.position.row === row)
      const colHasQueen = queens.some(q => q.position.col === col)
      const regionHasQueen = queens.some(q => regions[q.position.row][q.position.col] === info.region)

      let constraints = 0
      if (!rowHasQueen) constraints++
      if (!colHasQueen) constraints++
      if (!regionHasQueen) constraints++

      if (constraints >= 2) {
        let validInRow = 0
        let validInCol = 0

        for (let c = 0; c < gridSize; c++) {
          if (!cellInfo[row][c].hasQueen && !cellInfo[row][c].isBlocked) validInRow++
        }
        for (let r = 0; r < gridSize; r++) {
          if (!cellInfo[r][col].hasQueen && !cellInfo[r][col].isBlocked) validInCol++
        }

        // Relaxed from <= 2 to <= 3
        if (validInRow <= 3 || validInCol <= 3) {
          debug.log('hints', `Found elimination opportunity at (${row}, ${col})`)
          return {
            type: 'elimination',
            position: { row, col },
            explanation: `This cell at row ${row + 1}, column ${col + 1} is a strong candidate. Row has ${validInRow} options, column has ${validInCol} options.`,
            highlightCells: [{ row, col }],
            highlightQueens: [],
            canApply: true
          }
        }
      }
    }
  }

  // 6. Best region hint for early game
  const bestRegionHint = findBestRegionHint(cellInfo, queens, regions)
  if (bestRegionHint) {
    debug.log('hints', 'Providing best region hint')
    return bestRegionHint
  }

  // 7. Always return a general tip as fallback
  debug.log('hints', 'No specific hint found, returning general tip')
  return getGeneralTip(queens.length)
}
