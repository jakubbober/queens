import { useRef } from 'react'
import { useGameStore } from '../../store/gameStore'
import { validatePlacement } from '../../engine/validator'
import { Cell } from '../Cell/Cell'
import { useDragToMark } from '../../hooks/useDragToMark'
import { GRID_SIZE } from '../../types/game'
import './GameBoard.css'

export function GameBoard() {
  const puzzle = useGameStore(state => state.puzzle)
  const queens = useGameStore(state => state.queens)
  const autoXs = useGameStore(state => state.autoXs)
  const manualXs = useGameStore(state => state.manualXs)
  const settings = useGameStore(state => state.settings)
  const cycleCell = useGameStore(state => state.cycleCell)
  const toggleManualX = useGameStore(state => state.toggleManualX)
  const isWon = useGameStore(state => state.isWon)
  const currentHint = useGameStore(state => state.currentHint)
  const clearHint = useGameStore(state => state.clearHint)
  const colorMapping = useGameStore(state => state.colorMapping)

  const boardRef = useRef<HTMLDivElement>(null)

  const {
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    shouldPreventClick,
    resetDragFlag
  } = useDragToMark(boardRef)

  if (!puzzle) {
    return <div className="game-board-loading">Loading puzzle...</div>
  }

  const { regions } = puzzle

  // Calculate errors if auto-check is enabled
  const errors = settings.autoCheck
    ? validatePlacement(queens, regions).errors
    : new Set<string>()

  // Build lookup maps for O(1) access
  const queenMap = new Set(
    queens.map(q => `${q.position.row},${q.position.col}`)
  )
  const autoXMap = new Set(
    autoXs.map(x => `${x.position.row},${x.position.col}`)
  )
  const manualXMap = new Set(manualXs.map(x => `${x.row},${x.col}`))

  // Build hinted cells map
  const hintedCells = new Set<string>()
  if (currentHint?.position) {
    hintedCells.add(`${currentHint.position.row},${currentHint.position.col}`)
  }

  const handleCellClick = (row: number, col: number) => {
    if (isWon) return

    // Clear hint when user interacts
    if (currentHint) {
      clearHint()
    }

    // Prevent click if we just finished dragging
    if (shouldPreventClick()) {
      resetDragFlag()
      return
    }

    cycleCell(row, col)
  }

  const handleCellRightClick = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault()
    if (isWon) return

    // Clear hint when user interacts
    if (currentHint) {
      clearHint()
    }

    toggleManualX(row, col)
  }

  return (
    <div
      ref={boardRef}
      className={`game-board ${isDragging ? 'dragging' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {Array.from({ length: GRID_SIZE }).map((_, row) =>
        Array.from({ length: GRID_SIZE }).map((_, col) => {
          const key = `${row},${col}`
          const regionId = regions[row][col]

          // Calculate region borders
          const borderTop = row === 0 || regions[row - 1][col] !== regionId
          const borderBottom =
            row === GRID_SIZE - 1 || regions[row + 1][col] !== regionId
          const borderLeft = col === 0 || regions[row][col - 1] !== regionId
          const borderRight =
            col === GRID_SIZE - 1 || regions[row][col + 1] !== regionId

          return (
            <Cell
              key={key}
              row={row}
              col={col}
              regionId={regionId}
              hasQueen={queenMap.has(key)}
              hasManualX={manualXMap.has(key)}
              hasAutoX={autoXMap.has(key)}
              hasError={errors.has(key)}
              isHinted={hintedCells.has(key)}
              borderTop={borderTop}
              borderBottom={borderBottom}
              borderLeft={borderLeft}
              borderRight={borderRight}
              colorMapping={colorMapping}
              onClick={() => handleCellClick(row, col)}
              onContextMenu={(e) => handleCellRightClick(e, row, col)}
            />
          )
        })
      )}
    </div>
  )
}
