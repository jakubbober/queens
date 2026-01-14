import { useGameStore } from '../../store/gameStore'
import './UI.css'

export function Controls() {
  const undo = useGameStore(state => state.undo)
  const redo = useGameStore(state => state.redo)
  const clear = useGameStore(state => state.clear)
  const showHint = useGameStore(state => state.showHint)
  const hintsUsed = useGameStore(state => state.hintsUsed)
  const currentHint = useGameStore(state => state.currentHint)
  const history = useGameStore(state => state.history)
  const isWon = useGameStore(state => state.isWon)

  const canUndo = history.past.length > 0
  const canRedo = history.future.length > 0
  const hintsRemaining = 3 - hintsUsed

  return (
    <div className="controls">
      <button
        className="btn btn-primary"
        onClick={showHint}
        disabled={hintsRemaining === 0 || isWon || currentHint !== null}
      >
        Hint ({hintsRemaining})
      </button>
      <button
        className="btn btn-secondary"
        onClick={undo}
        disabled={!canUndo || isWon}
      >
        Undo
      </button>
      <button
        className="btn btn-secondary"
        onClick={redo}
        disabled={!canRedo || isWon}
      >
        Redo
      </button>
      <button
        className="btn btn-secondary"
        onClick={clear}
        disabled={isWon}
      >
        Clear
      </button>
    </div>
  )
}
