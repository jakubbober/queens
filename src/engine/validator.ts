import { Position, Queen } from '../types/game'

export interface ValidationResult {
  isValid: boolean
  errors: Set<string>
  rowConflicts: Map<number, Position[]>
  colConflicts: Map<number, Position[]>
  regionConflicts: Map<number, Position[]>
  adjacentConflicts: Position[][]
}

export function validatePlacement(
  queens: Queen[],
  regions: number[][]
): ValidationResult {
  const errors = new Set<string>()
  const rowConflicts = new Map<number, Position[]>()
  const colConflicts = new Map<number, Position[]>()
  const regionConflicts = new Map<number, Position[]>()
  const adjacentConflicts: Position[][] = []

  const positions = queens.map(q => q.position)
  const gridSize = regions.length

  // Check row conflicts
  for (let row = 0; row < gridSize; row++) {
    const inRow = positions.filter(p => p.row === row)
    if (inRow.length > 1) {
      rowConflicts.set(row, inRow)
      inRow.forEach(p => errors.add(`${p.row},${p.col}`))
    }
  }

  // Check column conflicts
  for (let col = 0; col < gridSize; col++) {
    const inCol = positions.filter(p => p.col === col)
    if (inCol.length > 1) {
      colConflicts.set(col, inCol)
      inCol.forEach(p => errors.add(`${p.row},${p.col}`))
    }
  }

  // Check region conflicts
  for (let region = 0; region < gridSize; region++) {
    const inRegion = positions.filter(p => regions[p.row][p.col] === region)
    if (inRegion.length > 1) {
      regionConflicts.set(region, inRegion)
      inRegion.forEach(p => errors.add(`${p.row},${p.col}`))
    }
  }

  // Check adjacency conflicts
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const p1 = positions[i]
      const p2 = positions[j]

      if (Math.abs(p1.row - p2.row) <= 1 && Math.abs(p1.col - p2.col) <= 1) {
        adjacentConflicts.push([p1, p2])
        errors.add(`${p1.row},${p1.col}`)
        errors.add(`${p2.row},${p2.col}`)
      }
    }
  }

  return {
    isValid: errors.size === 0,
    errors,
    rowConflicts,
    colConflicts,
    regionConflicts,
    adjacentConflicts
  }
}

export function checkWinCondition(queens: Queen[], regions: number[][]): boolean {
  const gridSize = regions.length
  if (queens.length !== gridSize) return false

  const validation = validatePlacement(queens, regions)
  if (!validation.isValid) return false

  // Verify each row, column, and region has exactly one queen
  const positions = queens.map(q => q.position)

  const rows = new Set(positions.map(p => p.row))
  const cols = new Set(positions.map(p => p.col))
  const regionSet = new Set(positions.map(p => regions[p.row][p.col]))

  return rows.size === gridSize && cols.size === gridSize && regionSet.size === gridSize
}
