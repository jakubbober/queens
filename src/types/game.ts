export interface Position {
  row: number
  col: number
}

export enum CellState {
  EMPTY = 'empty',
  QUEEN = 'queen',
  MARKED_X = 'marked'
}

export interface Queen {
  id: string
  position: Position
}

export interface AutoPlacedX {
  id: string
  position: Position
  ownerId: string
  reason: 'row' | 'column' | 'region' | 'adjacent'
}

export type ManualX = Position

export interface Puzzle {
  regions: number[][]
  solution: Position[]
}

export interface GameSettings {
  autoCheck: boolean
  autoX: boolean
}

export interface TimerState {
  startTime: number | null
  elapsed: number
  isRunning: boolean
}

export interface GameSnapshot {
  queens: Queen[]
  autoXs: AutoPlacedX[]
  manualXs: ManualX[]
}

export interface HistoryState {
  past: GameSnapshot[]
  future: GameSnapshot[]
}

export const GRID_SIZE = 9
export const NUM_REGIONS = 9

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'

// Hint types
export type HintType =
  | 'conflict'
  | 'naked_single_row'
  | 'naked_single_col'
  | 'naked_single_region'
  | 'elimination'
  | 'best_region'
  | 'general_tip'

export interface Hint {
  type: HintType
  position: Position | null
  explanation: string
  highlightCells: Position[]
  highlightQueens: string[]
  canApply: boolean
}
