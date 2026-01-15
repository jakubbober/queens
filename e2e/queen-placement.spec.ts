import { test, expect } from '@playwright/test'

test.describe('Queen Placement', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for the game board to be rendered
    await page.waitForSelector('.cell')
  })

  // Helper to place a queen (click cycle: Empty -> X -> Queen)
  async function placeQueen(cell: ReturnType<typeof page.locator>) {
    await cell.click() // Empty -> X
    await cell.click() // X -> Queen
  }

  test('clicking empty cell places X, second click places queen', async ({ page }) => {
    const cell = page.locator('[data-row="0"][data-col="0"]')

    // First click places X
    await cell.click()
    await expect(cell.locator('.cell-x-manual')).toBeVisible()

    // Second click places Queen
    await cell.click()
    await expect(cell.locator('.cell-queen')).toBeVisible()
    await expect(cell.locator('.cell-x-manual')).not.toBeVisible()
  })

  test('clicking queen removes it', async ({ page }) => {
    const cell = page.locator('[data-row="0"][data-col="0"]')

    // Place queen (2 clicks)
    await cell.click() // X
    await cell.click() // Queen
    await expect(cell.locator('.cell-queen')).toBeVisible()

    // Remove queen (1 click)
    await cell.click()
    await expect(cell.locator('.cell-queen')).not.toBeVisible()
  })

  test('right-click toggles X mark', async ({ page }) => {
    const cell = page.locator('[data-row="0"][data-col="0"]')

    // Place X mark with right-click (dispatch contextmenu event directly)
    await cell.dispatchEvent('contextmenu', { button: 2 })
    await expect(cell.locator('.cell-x-manual')).toBeVisible()

    // Remove X mark with right-click
    await cell.dispatchEvent('contextmenu', { button: 2 })
    await expect(cell.locator('.cell-x-manual')).not.toBeVisible()
  })

  test('clicking cell with X mark places queen', async ({ page }) => {
    const cell = page.locator('[data-row="0"][data-col="0"]')

    // Place X mark first (via left click now, since that's the cycle)
    await cell.click()
    await expect(cell.locator('.cell-x-manual')).toBeVisible()

    // Second click should place queen and remove X
    await cell.click()
    await expect(cell.locator('.cell-queen')).toBeVisible()
    await expect(cell.locator('.cell-x-manual')).not.toBeVisible()
  })

  test('placing two queens in same row shows error', async ({ page }) => {
    // Place first queen at (0,0)
    const cell1 = page.locator('[data-row="0"][data-col="0"]')
    await cell1.click() // X
    await cell1.click() // Queen
    await expect(cell1.locator('.cell-queen')).toBeVisible()

    // Place second queen in same row at (0,2)
    const cell2 = page.locator('[data-row="0"][data-col="2"]')
    await cell2.click() // X
    await cell2.click() // Queen
    await expect(cell2.locator('.cell-queen')).toBeVisible()

    // Both cells should show error (auto-check is on by default)
    await expect(cell1).toHaveClass(/cell-error/)
    await expect(cell2).toHaveClass(/cell-error/)
  })

  test('placing two queens in same column shows error', async ({ page }) => {
    // Place first queen at (0,0)
    const cell1 = page.locator('[data-row="0"][data-col="0"]')
    await cell1.click() // X
    await cell1.click() // Queen
    await expect(cell1.locator('.cell-queen')).toBeVisible()

    // Place second queen in same column at (2,0)
    const cell2 = page.locator('[data-row="2"][data-col="0"]')
    await cell2.click() // X
    await cell2.click() // Queen
    await expect(cell2.locator('.cell-queen')).toBeVisible()

    // Both cells should show error
    await expect(cell1).toHaveClass(/cell-error/)
    await expect(cell2).toHaveClass(/cell-error/)
  })

  test('placing queens diagonally adjacent shows error', async ({ page }) => {
    // Place first queen at (1,1)
    const cell1 = page.locator('[data-row="1"][data-col="1"]')
    await cell1.click() // X
    await cell1.click() // Queen
    await expect(cell1.locator('.cell-queen')).toBeVisible()

    // Place second queen diagonally adjacent at (2,2)
    const cell2 = page.locator('[data-row="2"][data-col="2"]')
    await cell2.click() // X
    await cell2.click() // Queen
    await expect(cell2.locator('.cell-queen')).toBeVisible()

    // Both cells should show error (adjacency violation)
    await expect(cell1).toHaveClass(/cell-error/)
    await expect(cell2).toHaveClass(/cell-error/)
  })

  test('undo removes last placed queen', async ({ page }) => {
    const cell = page.locator('[data-row="0"][data-col="0"]')

    // Place queen (2 clicks)
    await cell.click() // X
    await cell.click() // Queen
    await expect(cell.locator('.cell-queen')).toBeVisible()

    // Click undo
    await page.getByRole('button', { name: 'Undo' }).click()

    // Queen should be removed (back to X)
    await expect(cell.locator('.cell-queen')).not.toBeVisible()
  })

  test('redo restores last undone action', async ({ page }) => {
    const cell = page.locator('[data-row="0"][data-col="0"]')

    // Place queen (2 clicks)
    await cell.click() // X
    await cell.click() // Queen
    await expect(cell.locator('.cell-queen')).toBeVisible()

    // Undo
    await page.getByRole('button', { name: 'Undo' }).click()
    await expect(cell.locator('.cell-queen')).not.toBeVisible()

    // Redo
    await page.getByRole('button', { name: 'Redo' }).click()
    await expect(cell.locator('.cell-queen')).toBeVisible()
  })

  test('clear removes all queens and X marks', async ({ page }) => {
    // Place multiple queens
    const cell1 = page.locator('[data-row="0"][data-col="0"]')
    const cell2 = page.locator('[data-row="1"][data-col="2"]')

    await cell1.click() // X
    await cell1.click() // Queen
    await cell2.click() // X
    await cell2.click() // Queen

    await expect(cell1.locator('.cell-queen')).toBeVisible()
    await expect(cell2.locator('.cell-queen')).toBeVisible()

    // Clear all
    await page.getByRole('button', { name: 'Clear' }).click()

    await expect(cell1.locator('.cell-queen')).not.toBeVisible()
    await expect(cell2.locator('.cell-queen')).not.toBeVisible()
  })

  test('timer starts on first interaction', async ({ page }) => {
    // Timer should initially show 00:00
    const timer = page.locator('text=00:00')
    await expect(timer).toBeVisible()

    // Place X (first interaction starts timer)
    const cell = page.locator('[data-row="0"][data-col="0"]')
    await cell.click()

    // Wait a bit and check timer has incremented
    await page.waitForTimeout(1500)
    await expect(page.locator('text=00:00')).not.toBeVisible()
  })
})
