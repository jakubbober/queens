import { GameBoard } from './GameBoard'
import { Controls } from '../UI/Controls'
import { Timer } from '../UI/Timer'
import { Settings } from '../UI/Settings'
import { StatusBar } from '../UI/StatusBar'
import { WinModal } from '../UI/WinModal'
import { HintDisplay } from '../UI/HintDisplay'
import { DebugPanel } from '../UI/DebugPanel'
import { useGameInit, useTimer, useKeyboardShortcuts } from '../../hooks/useGameStore'

export function Game() {
  useGameInit()
  useTimer()
  useKeyboardShortcuts()

  return (
    <div className="game-container">
      <header className="game-header">
        <h1>Queens</h1>
        <p className="puzzle-info">Daily Puzzle</p>
        <Timer />
      </header>

      <StatusBar />
      <HintDisplay />

      <div className="board-container">
        <GameBoard />
      </div>

      <Controls />
      <Settings />
      <WinModal />
      <DebugPanel />
    </div>
  )
}
