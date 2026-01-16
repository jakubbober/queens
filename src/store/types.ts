import {
  Queen,
  AutoPlacedX,
  ManualX,
  GameSettings,
  TimerState,
  HistoryState,
  Puzzle,
  Hint,
  Difficulty
} from '../types/game'

export interface GameState {
  // Puzzle data
  puzzle: Puzzle | null

  // Game pieces
  queens: Queen[]
  autoXs: AutoPlacedX[]
  manualXs: ManualX[]

  // History for undo/redo
  history: HistoryState

  // Settings
  settings: GameSettings

  // Timer
  timer: TimerState

  // Game status
  isWon: boolean
  hintsUsed: number

  // Current hint
  currentHint: Hint | null

  // Drag state (kept for compatibility but not used by store)
  isDragging: boolean

  // Puzzle settings
  difficulty: Difficulty
  isDailyPuzzle: boolean

  // Color mapping for visual variety
  colorMapping: number[]
}

export interface GameActions {
  // Initialization
  initGame: () => void
  newGame: () => void
  newRandomPuzzle: () => void
  setDifficulty: (difficulty: Difficulty) => void

  // Cell interactions
  cycleCell: (row: number, col: number) => void
  placeQueen: (row: number, col: number) => void
  removeQueen: (row: number, col: number) => void
  placeManualX: (row: number, col: number) => void
  removeManualX: (row: number, col: number) => void
  toggleManualX: (row: number, col: number) => void

  // Drag to mark (kept for compatibility)
  startDrag: () => void
  endDrag: () => void
  dragOver: (row: number, col: number) => void

  // History
  undo: () => void
  redo: () => void
  saveSnapshot: () => void

  // Settings
  toggleAutoCheck: () => void
  toggleAutoX: () => void

  // Timer
  startTimer: () => void
  stopTimer: () => void
  tick: () => void

  // Hints
  showHint: () => void
  applyHint: () => void
  clearHint: () => void

  // Clear
  clear: () => void

  // Win check
  checkWin: () => void
}

export type GameStore = GameState & GameActions
