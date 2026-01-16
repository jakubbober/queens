import { GameBoard } from './GameBoard'
import { Controls } from '../UI/Controls'
import { Timer } from '../UI/Timer'
import { Settings } from '../UI/Settings'
import { StatusBar } from '../UI/StatusBar'
import { WinModal } from '../UI/WinModal'
import { HintDisplay } from '../UI/HintDisplay'
import { DebugPanel } from '../UI/DebugPanel'
import { Instructions } from '../UI/Instructions'
import { useGameInit, useTimer, useKeyboardShortcuts } from '../../hooks/useGameStore'
import { useGameStore } from '../../store/gameStore'

export function Game() {
  useGameInit()
  useTimer()
  useKeyboardShortcuts()

  const isDailyPuzzle = useGameStore(state => state.isDailyPuzzle)
  const difficulty = useGameStore(state => state.difficulty)

  const difficultyLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
  const puzzleType = isDailyPuzzle ? 'Daily Puzzle' : `${difficultyLabel} Puzzle`

  return (
    <div className="game-container">
      <header className="game-header">
        <h1>Queens</h1>
        <p className="puzzle-info">{puzzleType}</p>
        <Timer />
      </header>

      <StatusBar />
      <HintDisplay />

      <div className="board-container">
        <GameBoard />
      </div>

      <Controls />
      <Settings />
      <Instructions />
      <WinModal />
      <DebugPanel />
    </div>
  )
}
