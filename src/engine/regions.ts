import { GRID_SIZE, NUM_REGIONS } from '../types/game'

interface Cell {
  row: number
  col: number
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function getNeighbors(row: number, col: number): Cell[] {
  const neighbors: Cell[] = []
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

export function generateRegions(): number[][] {
  const regions: number[][] = Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(-1))

  const cellsPerRegion = (GRID_SIZE * GRID_SIZE) / NUM_REGIONS

  // Pick random starting points for each region
  const startPoints: Cell[] = []
  const allCells: Cell[] = []

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      allCells.push({ row: r, col: c })
    }
  }

  const shuffledCells = shuffle(allCells)

  // Pick well-distributed starting points
  for (let i = 0; i < NUM_REGIONS; i++) {
    const targetRow = Math.floor(i / 3) * 3 + 1
    const targetCol = (i % 3) * 3 + 1

    // Find closest unassigned cell to target
    let bestCell = shuffledCells[i * cellsPerRegion]
    let bestDist = Infinity

    for (const cell of shuffledCells) {
      if (!startPoints.some(p => p.row === cell.row && p.col === cell.col)) {
        const dist = Math.abs(cell.row - targetRow) + Math.abs(cell.col - targetCol)
        if (dist < bestDist) {
          bestDist = dist
          bestCell = cell
        }
      }
    }

    startPoints.push(bestCell)
    regions[bestCell.row][bestCell.col] = i
  }

  // Grow regions using flood fill with randomization
  const frontiers: Cell[][] = startPoints.map(p => [p])
  const regionSizes = Array(NUM_REGIONS).fill(1)

  let unassigned = GRID_SIZE * GRID_SIZE - NUM_REGIONS

  while (unassigned > 0) {
    // Find region with smallest size that still has frontier
    let minSize = Infinity
    let minRegion = -1

    for (let i = 0; i < NUM_REGIONS; i++) {
      if (frontiers[i].length > 0 && regionSizes[i] < minSize) {
        minSize = regionSizes[i]
        minRegion = i
      }
    }

    if (minRegion === -1) break

    // Expand from random frontier cell
    const frontier = frontiers[minRegion]
    const randomIdx = Math.floor(Math.random() * frontier.length)
    const cell = frontier[randomIdx]

    // Get unassigned neighbors
    const neighbors = shuffle(getNeighbors(cell.row, cell.col))
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

    // Remove cell from frontier if no unassigned neighbors
    if (!expanded) {
      frontier.splice(randomIdx, 1)
    }
  }

  // Handle any remaining unassigned cells
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

export function isRegionConnected(regions: number[][], regionId: number): boolean {
  const cells: Cell[] = []

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (regions[r][c] === regionId) {
        cells.push({ row: r, col: c })
      }
    }
  }

  if (cells.length === 0) return true

  const visited = new Set<string>()
  const queue: Cell[] = [cells[0]]
  visited.add(`${cells[0].row},${cells[0].col}`)

  while (queue.length > 0) {
    const cell = queue.shift()!
    const neighbors = getNeighbors(cell.row, cell.col)

    for (const neighbor of neighbors) {
      const key = `${neighbor.row},${neighbor.col}`
      if (!visited.has(key) && regions[neighbor.row][neighbor.col] === regionId) {
        visited.add(key)
        queue.push(neighbor)
      }
    }
  }

  return visited.size === cells.length
}

export function areAllRegionsConnected(regions: number[][]): boolean {
  for (let i = 0; i < NUM_REGIONS; i++) {
    if (!isRegionConnected(regions, i)) {
      return false
    }
  }
  return true
}
