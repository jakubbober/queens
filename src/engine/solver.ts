import { Position, GRID_SIZE } from '../types/game'

export interface SolverResult {
  solved: boolean
  solutions: Position[][]
  solutionCount: number
}

export function isValidPlacement(
  queens: Position[],
  regions: number[][],
  row: number,
  col: number
): boolean {
  for (const queen of queens) {
    // Same row
    if (queen.row === row) return false
    // Same column
    if (queen.col === col) return false
    // Same region
    if (regions[queen.row][queen.col] === regions[row][col]) return false
    // Adjacent (including diagonal)
    if (Math.abs(queen.row - row) <= 1 && Math.abs(queen.col - col) <= 1) {
      return false
    }
  }
  return true
}

export function solve(
  regions: number[][],
  partialSolution: Position[] = [],
  maxSolutions: number = 2
): SolverResult {
  const solutions: Position[][] = []

  function backtrack(queens: Position[], startRow: number): void {
    if (solutions.length >= maxSolutions) return

    if (queens.length === GRID_SIZE) {
      solutions.push([...queens])
      return
    }

    for (let row = startRow; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (isValidPlacement(queens, regions, row, col)) {
          queens.push({ row, col })
          backtrack(queens, row + 1)
          queens.pop()

          if (solutions.length >= maxSolutions) return
        }
      }
    }
  }

  backtrack([...partialSolution], partialSolution.length > 0 ? partialSolution[partialSolution.length - 1].row + 1 : 0)

  return {
    solved: solutions.length > 0,
    solutions,
    solutionCount: solutions.length
  }
}

export function countSolutions(regions: number[][], maxCount: number = 2): number {
  return solve(regions, [], maxCount).solutionCount
}

export function findSolution(regions: number[][]): Position[] | null {
  const result = solve(regions, [], 1)
  return result.solved ? result.solutions[0] : null
}

export function hasUniqueSolution(regions: number[][]): boolean {
  return countSolutions(regions, 2) === 1
}
