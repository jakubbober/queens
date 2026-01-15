import { create } from 'zustand'
import { GameStore, GameState } from './types'
import { Queen, AutoPlacedX, GameSnapshot, Difficulty } from '../types/game'
import { generateDailyPuzzle, generateRandomPuzzle } from '../engine/generator'
import { generateAutoXs, removeAutoXsForQueen } from '../engine/constraints'
import { checkWinCondition } from '../engine/validator'
import { analyzeForHint } from '../engine/hintAnalyzer'

let queenIdCounter = 0
function generateQueenId(): string {
  return `queen-${++queenIdCounter}`
}

const initialState: Omit<GameState, 'puzzle'> & { puzzle: null } = {
  puzzle: null,
  queens: [],
  autoXs: [],
  manualXs: [],
  history: { past: [], future: [] },
  settings: { autoCheck: true, autoX: false },
  timer: { startTime: null, elapsed: 0, isRunning: false },
  isWon: false,
  hintsUsed: 0,
  currentHint: null,
  isDragging: false,
  difficulty: 'medium',
  isDailyPuzzle: true
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  initGame: () => {
    const { difficulty, settings } = get()
    const puzzle = generateDailyPuzzle(difficulty)
    set({
      ...initialState,
      puzzle,
      difficulty,
      settings, // Preserve user's settings
      isDailyPuzzle: true,
      history: { past: [], future: [] }
    })
  },

  newGame: () => {
    get().initGame()
  },

  newRandomPuzzle: () => {
    const { difficulty, settings } = get()
    const puzzle = generateRandomPuzzle(difficulty)
    set({
      ...initialState,
      puzzle,
      difficulty,
      settings, // Preserve user's settings
      isDailyPuzzle: false,
      history: { past: [], future: [] }
    })
  },

  setDifficulty: (difficulty: Difficulty) => {
    set({ difficulty })
  },

  saveSnapshot: () => {
    const { queens, autoXs, manualXs, history } = get()
    const snapshot: GameSnapshot = {
      queens: JSON.parse(JSON.stringify(queens)),
      autoXs: JSON.parse(JSON.stringify(autoXs)),
      manualXs: JSON.parse(JSON.stringify(manualXs))
    }
    set({
      history: {
        past: [...history.past, snapshot].slice(-50),
        future: []
      }
    })
  },

  cycleCell: (row: number, col: number) => {
    const { queens, manualXs, puzzle, isDragging } = get()
    if (!puzzle || get().isWon) return

    // Start timer on first interaction
    if (!get().timer.isRunning) {
      get().startTimer()
    }

    const hasQueen = queens.some(q => q.position.row === row && q.position.col === col)
    const hasManualX = manualXs.some(x => x.row === row && x.col === col)

    // If dragging, only place X on empty cells
    if (isDragging) {
      if (!hasQueen && !hasManualX) {
        get().placeManualX(row, col)
      }
      return
    }

    // Cycle: Empty -> X -> Queen -> Empty
    if (hasQueen) {
      // Queen -> Empty
      get().removeQueen(row, col)
    } else if (hasManualX) {
      // X -> Queen
      get().saveSnapshot()
      get().removeManualX(row, col)
      get().placeQueen(row, col)
    } else {
      // Empty -> X
      get().placeManualX(row, col)
    }
  },

  placeQueen: (row: number, col: number) => {
    const { queens, autoXs, manualXs, puzzle, settings } = get()
    if (!puzzle) return

    get().saveSnapshot()

    const queen: Queen = {
      id: generateQueenId(),
      position: { row, col }
    }

    let newAutoXs = autoXs

    if (settings.autoX) {
      const generatedXs = generateAutoXs(
        queen,
        puzzle.regions,
        queens,
        autoXs,
        manualXs.map(x => ({ row: x.row, col: x.col }))
      )
      newAutoXs = [...autoXs, ...generatedXs]
    }

    set({
      queens: [...queens, queen],
      autoXs: newAutoXs
    })

    get().checkWin()
  },

  removeQueen: (row: number, col: number) => {
    const { queens, autoXs } = get()

    get().saveSnapshot()

    const queen = queens.find(q => q.position.row === row && q.position.col === col)
    if (!queen) return

    // Remove queen and its associated auto-X's
    set({
      queens: queens.filter(q => q.id !== queen.id),
      autoXs: removeAutoXsForQueen(autoXs, queen.id)
    })
  },

  placeManualX: (row: number, col: number) => {
    const { manualXs, queens, autoXs } = get()

    // Don't place if queen is there
    if (queens.some(q => q.position.row === row && q.position.col === col)) {
      return
    }

    // Don't place if auto-X is there
    if (autoXs.some(x => x.position.row === row && x.position.col === col)) {
      return
    }

    // Don't place if already has manual X
    if (manualXs.some(x => x.row === row && x.col === col)) {
      return
    }

    if (!get().isDragging) {
      get().saveSnapshot()
    }

    set({
      manualXs: [...manualXs, { row, col }]
    })
  },

  removeManualX: (row: number, col: number) => {
    const { manualXs } = get()
    set({
      manualXs: manualXs.filter(x => x.row !== row || x.col !== col)
    })
  },

  toggleManualX: (row: number, col: number) => {
    const { queens, manualXs } = get()
    if (get().isWon) return

    // Start timer if needed
    if (!get().timer.isRunning) {
      get().startTimer()
    }

    // Can't place X on a queen
    if (queens.some(q => q.position.row === row && q.position.col === col)) {
      return
    }

    const hasManualX = manualXs.some(x => x.row === row && x.col === col)

    get().saveSnapshot()

    if (hasManualX) {
      get().removeManualX(row, col)
    } else {
      // Place manual X (can place over auto-X to make it visible/permanent)
      set({
        manualXs: [...manualXs, { row, col }]
      })
    }
  },

  startDrag: () => {
    get().saveSnapshot()
    set({ isDragging: true })
  },

  endDrag: () => {
    set({ isDragging: false })
  },

  dragOver: (row: number, col: number) => {
    if (!get().isDragging) return
    const { queens, manualXs, autoXs } = get()

    const hasQueen = queens.some(q => q.position.row === row && q.position.col === col)
    const hasManualX = manualXs.some(x => x.row === row && x.col === col)
    const hasAutoX = autoXs.some(x => x.position.row === row && x.position.col === col)

    if (!hasQueen && !hasManualX && !hasAutoX) {
      get().placeManualX(row, col)
    }
  },

  undo: () => {
    const { history } = get()
    if (history.past.length === 0) return

    const previous = history.past[history.past.length - 1]
    const current: GameSnapshot = {
      queens: JSON.parse(JSON.stringify(get().queens)),
      autoXs: JSON.parse(JSON.stringify(get().autoXs)),
      manualXs: JSON.parse(JSON.stringify(get().manualXs))
    }

    set({
      queens: previous.queens,
      autoXs: previous.autoXs,
      manualXs: previous.manualXs,
      history: {
        past: history.past.slice(0, -1),
        future: [current, ...history.future]
      },
      isWon: false
    })
  },

  redo: () => {
    const { history } = get()
    if (history.future.length === 0) return

    const next = history.future[0]
    const current: GameSnapshot = {
      queens: JSON.parse(JSON.stringify(get().queens)),
      autoXs: JSON.parse(JSON.stringify(get().autoXs)),
      manualXs: JSON.parse(JSON.stringify(get().manualXs))
    }

    set({
      queens: next.queens,
      autoXs: next.autoXs,
      manualXs: next.manualXs,
      history: {
        past: [...history.past, current],
        future: history.future.slice(1)
      }
    })

    get().checkWin()
  },

  toggleAutoCheck: () => {
    set(state => ({
      settings: { ...state.settings, autoCheck: !state.settings.autoCheck }
    }))
  },

  toggleAutoX: () => {
    const { settings, queens, puzzle, manualXs } = get()

    if (!settings.autoX && puzzle) {
      // Turning on: generate auto-X's for all existing queens
      let newAutoXs: AutoPlacedX[] = []

      for (const queen of queens) {
        const generatedXs = generateAutoXs(
          queen,
          puzzle.regions,
          queens.filter(q => q.id !== queen.id),
          newAutoXs,
          manualXs.map(x => ({ row: x.row, col: x.col }))
        )
        newAutoXs = [...newAutoXs, ...generatedXs]
      }

      set({
        settings: { ...settings, autoX: true },
        autoXs: newAutoXs
      })
    } else {
      // Turning off: clear all auto-X's
      set({
        settings: { ...settings, autoX: false },
        autoXs: []
      })
    }
  },

  startTimer: () => {
    set({
      timer: {
        startTime: Date.now(),
        elapsed: 0,
        isRunning: true
      }
    })
  },

  stopTimer: () => {
    set(state => ({
      timer: { ...state.timer, isRunning: false }
    }))
  },

  tick: () => {
    const { timer } = get()
    if (!timer.isRunning || !timer.startTime) return

    set({
      timer: {
        ...timer,
        elapsed: Math.floor((Date.now() - timer.startTime) / 1000)
      }
    })
  },

  showHint: () => {
    const { queens, manualXs, autoXs, puzzle, isWon } = get()
    if (!puzzle || isWon) return

    const hint = analyzeForHint(queens, manualXs, autoXs, puzzle.regions)
    if (hint) {
      set({ currentHint: hint })
    }
  },

  applyHint: () => {
    const { currentHint } = get()
    if (!currentHint || !currentHint.canApply || !currentHint.position) return

    get().placeQueen(currentHint.position.row, currentHint.position.col)
    set({ currentHint: null })
  },

  clearHint: () => {
    set({ currentHint: null })
  },

  clear: () => {
    get().saveSnapshot()
    set({
      queens: [],
      autoXs: [],
      manualXs: [],
      isWon: false,
      currentHint: null
    })
  },

  checkWin: () => {
    const { queens, puzzle } = get()
    if (!puzzle) return

    if (checkWinCondition(queens, puzzle.regions)) {
      get().stopTimer()
      set({ isWon: true })
    }
  }
}))
