import { useGameStore } from '../../store/gameStore'
import { Difficulty } from '../../types/game'
import './UI.css'

export function Controls() {
  const undo = useGameStore(state => state.undo)
  const redo = useGameStore(state => state.redo)
  const clear = useGameStore(state => state.clear)
  const showHint = useGameStore(state => state.showHint)
  const currentHint = useGameStore(state => state.currentHint)
  const history = useGameStore(state => state.history)
  const isWon = useGameStore(state => state.isWon)
  const newRandomPuzzle = useGameStore(state => state.newRandomPuzzle)
  const difficulty = useGameStore(state => state.difficulty)
  const setDifficulty = useGameStore(state => state.setDifficulty)

  const canUndo = history.past.length > 0
  const canRedo = history.future.length > 0

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDifficulty(e.target.value as Difficulty)
  }

  return (
    <div className="controls">
      <button
        className="btn btn-primary"
        onClick={showHint}
        disabled={isWon || currentHint !== null}
      >
        Hint
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
      <div className="controls-separator" />
      <button
        className="btn btn-accent"
        onClick={newRandomPuzzle}
      >
        New Puzzle
      </button>
      <select
        className="difficulty-select"
        value={difficulty}
        onChange={handleDifficultyChange}
      >
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
        <option value="expert">Expert</option>
      </select>
    </div>
  )
}
