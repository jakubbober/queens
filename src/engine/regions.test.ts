import { describe, it, expect } from 'vitest'
import { generateRegions, isRegionConnected, areAllRegionsConnected } from './regions'

describe('generateRegions', () => {
  it('returns a grid of the requested size', () => {
    const regions = generateRegions()
    const gridSize = regions.length
    expect(regions).toHaveLength(gridSize)
    regions.forEach(row => {
      expect(row).toHaveLength(gridSize)
    })
  })

  it('assigns all cells to a region (no -1 values)', () => {
    const regions = generateRegions()
    const gridSize = regions.length
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        expect(regions[r][c]).toBeGreaterThanOrEqual(0)
        expect(regions[r][c]).toBeLessThan(gridSize)
      }
    }
  })

  it('uses all region IDs from 0 to gridSize-1', () => {
    const regions = generateRegions()
    const gridSize = regions.length
    const regionIds = new Set<number>()

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        regionIds.add(regions[r][c])
      }
    }

    for (let i = 0; i < gridSize; i++) {
      expect(regionIds.has(i)).toBe(true)
    }
  })

  it('generates connected regions', () => {
    const regions = generateRegions()
    expect(areAllRegionsConnected(regions)).toBe(true)
  })
})

describe('isRegionConnected', () => {
  it('returns true for empty region', () => {
    const regions: number[][] = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]
    // Region 5 doesn't exist, should return true
    expect(isRegionConnected(regions, 5)).toBe(true)
  })

  it('returns true for single cell region', () => {
    const regions: number[][] = [
      [1, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]
    expect(isRegionConnected(regions, 1)).toBe(true)
  })

  it('returns true for connected region', () => {
    const regions: number[][] = [
      [1, 1, 1, 0, 0, 0, 0, 0, 0],
      [1, 1, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]
    expect(isRegionConnected(regions, 1)).toBe(true)
  })

  it('returns false for disconnected region', () => {
    const regions: number[][] = [
      [1, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]
    expect(isRegionConnected(regions, 1)).toBe(false)
  })

  it('diagonal cells are not considered connected', () => {
    const regions: number[][] = [
      [1, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]
    expect(isRegionConnected(regions, 1)).toBe(false)
  })
})

describe('areAllRegionsConnected', () => {
  it('returns true when all regions are connected', () => {
    const regions: number[][] = [
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
    expect(areAllRegionsConnected(regions)).toBe(true)
  })

  it('returns false when any region is disconnected', () => {
    const regions: number[][] = [
      [0, 0, 1, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2, 2],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [3, 3, 3, 4, 4, 4, 5, 5, 5],
      [6, 6, 6, 7, 7, 7, 8, 8, 8],
      [6, 6, 0, 7, 7, 7, 8, 8, 8],  // Disconnected region 0 cell
      [6, 6, 6, 7, 7, 7, 8, 8, 8]
    ]
    expect(areAllRegionsConnected(regions)).toBe(false)
  })
})
