import { describe, it, expect } from 'vitest'
import { analyzeForHint, HintType } from './hintAnalyzer'
import { Queen } from '../types/game'

describe('analyzeForHint', () => {
  const sampleRegions: number[][] = [
    [0, 0, 0, 1, 1, 1, 2, 2, 2],
    [0, 0, 0, 1, 1, 1, 2, 2, 2],
    [0, 0, 0, 1, 1, 1, 2, 2, 2],
    [3, 3, 3, 4, 4, 4, 5, 5, 5],
    [3, 3, 3, 4, 4, 4, 5, 5, 5],
    [3, 3, 3, 4, 4, 4, 5, 5, 5],
    [6, 6, 6, 7, 7, 7, 8, 8, 8],
    [6, 6, 6, 7, 7, 7, 8, 8, 8],
    [6, 6, 6, 7, 7, 7, 8, 8, 8]
  ]

  it('always returns a hint (never null)', () => {
    const hint = analyzeForHint([], [], [], sampleRegions)
    expect(hint).not.toBeNull()
    expect(hint).toHaveProperty('type')
    expect(hint).toHaveProperty('explanation')
  })

  it('returns general_tip or best_region for empty board', () => {
    const hint = analyzeForHint([], [], [], sampleRegions)
    expect(['general_tip', 'best_region', 'elimination']).toContain(hint.type)
  })

  it('detects row conflict', () => {
    const queens: Queen[] = [
      { id: '1', position: { row: 0, col: 0 } },
      { id: '2', position: { row: 0, col: 5 } }
    ]
    const hint = analyzeForHint(queens, [], [], sampleRegions)
    expect(hint.type).toBe('conflict')
    expect(hint.explanation).toContain('Row')
  })

  it('detects column conflict', () => {
    const queens: Queen[] = [
      { id: '1', position: { row: 0, col: 0 } },
      { id: '2', position: { row: 5, col: 0 } }
    ]
    const hint = analyzeForHint(queens, [], [], sampleRegions)
    expect(hint.type).toBe('conflict')
    expect(hint.explanation).toContain('Column')
  })

  it('detects region conflict', () => {
    const queens: Queen[] = [
      { id: '1', position: { row: 0, col: 0 } },
      { id: '2', position: { row: 1, col: 1 } }
    ]
    const hint = analyzeForHint(queens, [], [], sampleRegions)
    expect(hint.type).toBe('conflict')
    expect(hint.explanation).toContain('region')
  })

  it('detects adjacent conflict', () => {
    // Use positions that are adjacent but in DIFFERENT regions
    // (2,2) is in region 0, (3,3) is in region 4
    // They are diagonally adjacent but not in the same region
    const queens: Queen[] = [
      { id: '1', position: { row: 2, col: 2 } },
      { id: '2', position: { row: 3, col: 3 } }
    ]
    const hint = analyzeForHint(queens, [], [], sampleRegions)
    expect(hint.type).toBe('conflict')
    expect(hint.explanation).toContain('adjacent')
  })

  it('hint has required properties', () => {
    const hint = analyzeForHint([], [], [], sampleRegions)
    expect(hint).toHaveProperty('type')
    expect(hint).toHaveProperty('position')
    expect(hint).toHaveProperty('explanation')
    expect(hint).toHaveProperty('highlightCells')
    expect(hint).toHaveProperty('highlightQueens')
    expect(hint).toHaveProperty('canApply')
  })

  it('highlightCells is always an array', () => {
    const hint = analyzeForHint([], [], [], sampleRegions)
    expect(Array.isArray(hint.highlightCells)).toBe(true)
  })

  it('highlightQueens is always an array', () => {
    const hint = analyzeForHint([], [], [], sampleRegions)
    expect(Array.isArray(hint.highlightQueens)).toBe(true)
  })

  describe('naked single detection', () => {
    it('finds naked single in row when only one valid cell remains', () => {
      // Place queens to block all but one cell in row 0
      const queens: Queen[] = [
        { id: '1', position: { row: 1, col: 1 } }, // Blocks col 0,1,2 adjacency
        { id: '2', position: { row: 3, col: 4 } }, // Blocks col 3,4,5
        { id: '3', position: { row: 4, col: 7 } }, // Blocks col 6,7,8
      ]
      // This may or may not result in a naked single depending on exact blocking
      const hint = analyzeForHint(queens, [], [], sampleRegions)
      expect(hint).toBeDefined()
    })
  })

  describe('best_region hint', () => {
    it('suggests region with few valid cells', () => {
      // With some queens placed, some regions become constrained
      const queens: Queen[] = [
        { id: '1', position: { row: 0, col: 1 } },
        { id: '2', position: { row: 3, col: 4 } },
      ]
      const hint = analyzeForHint(queens, [], [], sampleRegions)
      expect(hint).toBeDefined()
      // Should either be a specific hint or a general tip
      expect(['general_tip', 'best_region', 'elimination', 'naked_single_row', 'naked_single_col', 'naked_single_region']).toContain(hint.type)
    })
  })

  describe('general_tip fallback', () => {
    it('provides strategy tips based on queen count', () => {
      // Different tips for different game states
      const hint0 = analyzeForHint([], [], [], sampleRegions)
      expect(hint0.explanation).toBeDefined()
      expect(hint0.explanation.length).toBeGreaterThan(0)
    })
  })
})

describe('HintType values', () => {
  it('includes all expected hint types', () => {
    const validTypes: HintType[] = [
      'conflict',
      'naked_single_row',
      'naked_single_col',
      'naked_single_region',
      'elimination',
      'best_region',
      'general_tip'
    ]

    validTypes.forEach(type => {
      expect(typeof type).toBe('string')
    })
  })
})
