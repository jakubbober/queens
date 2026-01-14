import { useCallback, useRef, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { Position, GRID_SIZE } from '../types/game'

export type DragMode = 'place' | 'erase' | null

export function useDragToMark(boardRef: React.RefObject<HTMLDivElement | null>) {
  const placeManualX = useGameStore(state => state.placeManualX)
  const removeManualX = useGameStore(state => state.removeManualX)
  const saveSnapshot = useGameStore(state => state.saveSnapshot)
  const queens = useGameStore(state => state.queens)
  const manualXs = useGameStore(state => state.manualXs)
  const autoXs = useGameStore(state => state.autoXs)
  const startTimer = useGameStore(state => state.startTimer)
  const timerRunning = useGameStore(state => state.timer.isRunning)

  const [isDragging, setIsDragging] = useState(false)
  const dragModeRef = useRef<DragMode>(null)
  const processedCellsRef = useRef<Set<string>>(new Set())
  const hasDraggedRef = useRef(false)

  const getCellFromPoint = useCallback((clientX: number, clientY: number): Position | null => {
    const board = boardRef.current
    if (!board) return null

    const rect = board.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top
    const cellSize = rect.width / GRID_SIZE

    const col = Math.floor(x / cellSize)
    const row = Math.floor(y / cellSize)

    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
      return { row, col }
    }
    return null
  }, [boardRef])

  const hasQueen = useCallback((row: number, col: number) => {
    return queens.some(q => q.position.row === row && q.position.col === col)
  }, [queens])

  const hasManualX = useCallback((row: number, col: number) => {
    return manualXs.some(x => x.row === row && x.col === col)
  }, [manualXs])

  const hasAutoX = useCallback((row: number, col: number) => {
    return autoXs.some(x => x.position.row === row && x.position.col === col)
  }, [autoXs])

  const processCell = useCallback((row: number, col: number) => {
    const key = `${row},${col}`

    // Skip if already processed in this drag
    if (processedCellsRef.current.has(key)) return

    // Skip if it's a queen or auto-X
    if (hasQueen(row, col) || hasAutoX(row, col)) return

    processedCellsRef.current.add(key)
    hasDraggedRef.current = true

    if (dragModeRef.current === 'place') {
      if (!hasManualX(row, col)) {
        placeManualX(row, col)
      }
    } else if (dragModeRef.current === 'erase') {
      if (hasManualX(row, col)) {
        removeManualX(row, col)
      }
    }
  }, [hasQueen, hasManualX, hasAutoX, placeManualX, removeManualX])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const cell = getCellFromPoint(e.clientX, e.clientY)
    if (!cell) return

    // Don't start drag on queens
    if (hasQueen(cell.row, cell.col)) return

    // Start timer on first interaction
    if (!timerRunning) {
      startTimer()
    }

    // Save snapshot for undo
    saveSnapshot()

    // Determine drag mode based on first cell
    if (hasManualX(cell.row, cell.col)) {
      dragModeRef.current = 'erase'
    } else if (!hasAutoX(cell.row, cell.col)) {
      dragModeRef.current = 'place'
    } else {
      // Auto-X cell - can't interact
      return
    }

    setIsDragging(true)
    processedCellsRef.current = new Set()
    hasDraggedRef.current = false

    // Process the first cell
    processCell(cell.row, cell.col)
  }, [getCellFromPoint, hasQueen, hasManualX, hasAutoX, saveSnapshot, processCell, timerRunning, startTimer])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return

    const cell = getCellFromPoint(e.clientX, e.clientY)
    if (cell) {
      processCell(cell.row, cell.col)
    }
  }, [isDragging, getCellFromPoint, processCell])

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      dragModeRef.current = null
      processedCellsRef.current = new Set()
    }
  }, [isDragging])

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    const cell = getCellFromPoint(touch.clientX, touch.clientY)
    if (!cell) return

    if (hasQueen(cell.row, cell.col)) return

    if (!timerRunning) {
      startTimer()
    }

    saveSnapshot()

    if (hasManualX(cell.row, cell.col)) {
      dragModeRef.current = 'erase'
    } else if (!hasAutoX(cell.row, cell.col)) {
      dragModeRef.current = 'place'
    } else {
      return
    }

    setIsDragging(true)
    processedCellsRef.current = new Set()
    hasDraggedRef.current = false

    processCell(cell.row, cell.col)
  }, [getCellFromPoint, hasQueen, hasManualX, hasAutoX, saveSnapshot, processCell, timerRunning, startTimer])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return
    e.preventDefault()

    const touch = e.touches[0]
    const cell = getCellFromPoint(touch.clientX, touch.clientY)
    if (cell) {
      processCell(cell.row, cell.col)
    }
  }, [isDragging, getCellFromPoint, processCell])

  const handleTouchEnd = useCallback(() => {
    handleMouseUp()
  }, [handleMouseUp])

  // Check if a click should be prevented (drag occurred)
  const shouldPreventClick = useCallback(() => {
    return hasDraggedRef.current
  }, [])

  const resetDragFlag = useCallback(() => {
    hasDraggedRef.current = false
  }, [])

  return {
    isDragging,
    dragMode: dragModeRef.current,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    shouldPreventClick,
    resetDragFlag,
    getCellFromPoint
  }
}
