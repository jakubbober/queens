import { useGameStore } from '../../store/gameStore'
import { GRID_SIZE } from '../../types/game'
import './UI.css'

export function StatusBar() {
  const queens = useGameStore(state => state.queens)
  const puzzle = useGameStore(state => state.puzzle)

  if (!puzzle) return null

  const { regions } = puzzle

  // Count completed rows, columns, and regions
  const rowCounts = Array(GRID_SIZE).fill(0)
  const colCounts = Array(GRID_SIZE).fill(0)
  const regionCounts = Array(GRID_SIZE).fill(0)

  queens.forEach(q => {
    rowCounts[q.position.row]++
    colCounts[q.position.col]++
    regionCounts[regions[q.position.row][q.position.col]]++
  })

  const completedRows = rowCounts.filter(c => c === 1).length
  const completedCols = colCounts.filter(c => c === 1).length
  const completedRegions = regionCounts.filter(c => c === 1).length

  return (
    <div className="status-bar">
      <div className="status-item">
        <span
          className={`status-dot ${completedRows === GRID_SIZE ? 'complete' : 'incomplete'}`}
        />
        Rows: {completedRows}/{GRID_SIZE}
      </div>
      <div className="status-item">
        <span
          className={`status-dot ${completedCols === GRID_SIZE ? 'complete' : 'incomplete'}`}
        />
        Cols: {completedCols}/{GRID_SIZE}
      </div>
      <div className="status-item">
        <span
          className={`status-dot ${completedRegions === GRID_SIZE ? 'complete' : 'incomplete'}`}
        />
        Regions: {completedRegions}/{GRID_SIZE}
      </div>
    </div>
  )
}
