export const REGION_COLORS = [
  '#a8d5ff', // Light blue
  '#ffb3b3', // Light red
  '#b3ffb3', // Light green
  '#ffd9b3', // Light orange
  '#d9b3ff', // Light purple
  '#b3fff0', // Light teal
  '#fff5b3', // Light yellow
  '#ffc9e0', // Light pink
  '#c9c9c9', // Light gray
  '#c9e8c9', // Light sage
]

export const getRegionColor = (regionId: number, colorMapping?: number[]): string => {
  const colorIndex = colorMapping ? colorMapping[regionId] : regionId
  return REGION_COLORS[colorIndex % REGION_COLORS.length]
}
