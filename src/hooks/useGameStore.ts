import { useEffect } from 'react'
import { useGameStore as useStore } from '../store/gameStore'

export function useGameStore() {
  return useStore()
}

export function useGameInit() {
  const initGame = useStore(state => state.initGame)
  const puzzle = useStore(state => state.puzzle)

  useEffect(() => {
    if (!puzzle) {
      initGame()
    }
  }, [puzzle, initGame])
}

export function useTimer() {
  const tick = useStore(state => state.tick)
  const isRunning = useStore(state => state.timer.isRunning)

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [isRunning, tick])
}

export function useKeyboardShortcuts() {
  const undo = useStore(state => state.undo)
  const redo = useStore(state => state.redo)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])
}
