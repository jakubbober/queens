import { useGameStore } from '../../store/gameStore'
import './UI.css'

export function StatusBar() {
  const queens = useGameStore(state => state.queens)
  const puzzle = useGameStore(state => state.puzzle)

  if (!puzzle) return null

  const { regions } = puzzle
  const gridSize = regions.length

  // Count completed rows, columns, and regions
  const rowCounts = Array(gridSize).fill(0)
  const colCounts = Array(gridSize).fill(0)
  const regionCounts = Array(gridSize).fill(0)

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
          className={`status-dot ${completedRows === gridSize ? 'complete' : 'incomplete'}`}
        />
        Rows: {completedRows}/{gridSize}
      </div>
      <div className="status-item">
        <span
          className={`status-dot ${completedCols === gridSize ? 'complete' : 'incomplete'}`}
        />
        Cols: {completedCols}/{gridSize}
      </div>
      <div className="status-item">
        <span
          className={`status-dot ${completedRegions === gridSize ? 'complete' : 'incomplete'}`}
        />
        Regions: {completedRegions}/{gridSize}
      </div>
    </div>
  )
}
