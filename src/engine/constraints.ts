import { Position, Queen, AutoPlacedX } from '../types/game'

let xIdCounter = 0

function generateXId(): string {
  return `auto-x-${++xIdCounter}`
}

export function generateAutoXs(
  queen: Queen,
  regions: number[][],
  existingQueens: Queen[],
  existingAutoXs: AutoPlacedX[],
  existingManualXs: Position[]
): AutoPlacedX[] {
  const autoXs: AutoPlacedX[] = []
  const { row, col } = queen.position
  const queenRegion = regions[row][col]
  const gridSize = regions.length

  // Get positions already occupied
  const occupiedPositions = new Set<string>()

  existingQueens.forEach(q => {
    occupiedPositions.add(`${q.position.row},${q.position.col}`)
  })
  occupiedPositions.add(`${row},${col}`)

  existingAutoXs.forEach(x => {
    occupiedPositions.add(`${x.position.row},${x.position.col}`)
  })

  existingManualXs.forEach(x => {
    occupiedPositions.add(`${x.row},${x.col}`)
  })

  // Mark same row
  for (let c = 0; c < gridSize; c++) {
    if (c !== col && !occupiedPositions.has(`${row},${c}`)) {
      autoXs.push({
        id: generateXId(),
        position: { row, col: c },
        ownerId: queen.id,
        reason: 'row'
      })
    }
  }

  // Mark same column
  for (let r = 0; r < gridSize; r++) {
    if (r !== row && !occupiedPositions.has(`${r},${col}`)) {
      autoXs.push({
        id: generateXId(),
        position: { row: r, col },
        ownerId: queen.id,
        reason: 'column'
      })
    }
  }

  // Mark same region
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (regions[r][c] === queenRegion && (r !== row || c !== col)) {
        if (!occupiedPositions.has(`${r},${c}`)) {
          autoXs.push({
            id: generateXId(),
            position: { row: r, col: c },
            ownerId: queen.id,
            reason: 'region'
          })
        }
      }
    }
  }

  // Mark adjacent cells (including diagonals)
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue

      const r = row + dr
      const c = col + dc

      if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
        if (!occupiedPositions.has(`${r},${c}`)) {
          autoXs.push({
            id: generateXId(),
            position: { row: r, col: c },
            ownerId: queen.id,
            reason: 'adjacent'
          })
        }
      }
    }
  }

  return autoXs
}

export function removeAutoXsForQueen(
  autoXs: AutoPlacedX[],
  queenId: string
): AutoPlacedX[] {
  return autoXs.filter(x => x.ownerId !== queenId)
}

export function getBlockedPositions(
  queens: Queen[],
  autoXs: AutoPlacedX[],
  manualXs: Position[]
): Set<string> {
  const blocked = new Set<string>()

  queens.forEach(q => {
    blocked.add(`${q.position.row},${q.position.col}`)
  })

  autoXs.forEach(x => {
    blocked.add(`${x.position.row},${x.position.col}`)
  })

  manualXs.forEach(x => {
    blocked.add(`${x.row},${x.col}`)
  })

  return blocked
}
