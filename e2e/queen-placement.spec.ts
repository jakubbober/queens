import { test, expect } from '@playwright/test'

test.describe('Queen Placement', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for the game board to be rendered
    await page.waitForSelector('.cell')
  })

  test('clicking empty cell places a queen', async ({ page }) => {
    const cell = page.locator('[data-row="0"][data-col="0"]')
    await cell.click()

    // Wait for animation and check queen is visible
    await expect(cell.locator('.cell-queen')).toBeVisible()
  })

  test('clicking queen removes it', async ({ page }) => {
    const cell = page.locator('[data-row="0"][data-col="0"]')

    // Place queen
    await cell.click()
    await expect(cell.locator('.cell-queen')).toBeVisible()

    // Remove queen
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

    // Place X mark first (dispatch contextmenu event directly)
    await cell.dispatchEvent('contextmenu', { button: 2 })
    await expect(cell.locator('.cell-x-manual')).toBeVisible()

    // Left click should place queen and remove X
    await cell.click()
    await expect(cell.locator('.cell-queen')).toBeVisible()
    await expect(cell.locator('.cell-x-manual')).not.toBeVisible()
  })

  test('placing two queens in same row shows error', async ({ page }) => {
    // Place first queen at (0,0)
    const cell1 = page.locator('[data-row="0"][data-col="0"]')
    await cell1.click()
    await expect(cell1.locator('.cell-queen')).toBeVisible()

    // Place second queen in same row at (0,2)
    const cell2 = page.locator('[data-row="0"][data-col="2"]')
    await cell2.click()
    await expect(cell2.locator('.cell-queen')).toBeVisible()

    // Both cells should show error (auto-check is on by default)
    await expect(cell1).toHaveClass(/cell-error/)
    await expect(cell2).toHaveClass(/cell-error/)
  })

  test('placing two queens in same column shows error', async ({ page }) => {
    // Place first queen at (0,0)
    const cell1 = page.locator('[data-row="0"][data-col="0"]')
    await cell1.click()
    await expect(cell1.locator('.cell-queen')).toBeVisible()

    // Place second queen in same column at (2,0)
    const cell2 = page.locator('[data-row="2"][data-col="0"]')
    await cell2.click()
    await expect(cell2.locator('.cell-queen')).toBeVisible()

    // Both cells should show error
    await expect(cell1).toHaveClass(/cell-error/)
    await expect(cell2).toHaveClass(/cell-error/)
  })

  test('placing queens diagonally adjacent shows error', async ({ page }) => {
    // Place first queen at (1,1)
    const cell1 = page.locator('[data-row="1"][data-col="1"]')
    await cell1.click()
    await expect(cell1.locator('.cell-queen')).toBeVisible()

    // Place second queen diagonally adjacent at (2,2)
    const cell2 = page.locator('[data-row="2"][data-col="2"]')
    await cell2.click()
    await expect(cell2.locator('.cell-queen')).toBeVisible()

    // Both cells should show error (adjacency violation)
    await expect(cell1).toHaveClass(/cell-error/)
    await expect(cell2).toHaveClass(/cell-error/)
  })

  test('undo removes last placed queen', async ({ page }) => {
    const cell = page.locator('[data-row="0"][data-col="0"]')

    // Place queen
    await cell.click()
    await expect(cell.locator('.cell-queen')).toBeVisible()

    // Click undo
    await page.getByRole('button', { name: 'Undo' }).click()

    // Queen should be removed
    await expect(cell.locator('.cell-queen')).not.toBeVisible()
  })

  test('redo restores last undone action', async ({ page }) => {
    const cell = page.locator('[data-row="0"][data-col="0"]')

    // Place queen
    await cell.click()
    await expect(cell.locator('.cell-queen')).toBeVisible()

    // Undo
    await page.getByRole('button', { name: 'Undo' }).click()
    await expect(cell.locator('.cell-queen')).not.toBeVisible()

    // Redo
    await page.getByRole('button', { name: 'Redo' }).click()
    await expect(cell.locator('.cell-queen')).toBeVisible()
  })

  test('clear removes all queens', async ({ page }) => {
    // Place multiple queens
    const cell1 = page.locator('[data-row="0"][data-col="0"]')
    const cell2 = page.locator('[data-row="1"][data-col="2"]')

    await cell1.click()
    await cell2.click()

    await expect(cell1.locator('.cell-queen')).toBeVisible()
    await expect(cell2.locator('.cell-queen')).toBeVisible()

    // Clear all
    await page.getByRole('button', { name: 'Clear' }).click()

    await expect(cell1.locator('.cell-queen')).not.toBeVisible()
    await expect(cell2.locator('.cell-queen')).not.toBeVisible()
  })

  test('timer starts on first queen placement', async ({ page }) => {
    // Timer should initially show 00:00
    const timer = page.locator('text=00:00')
    await expect(timer).toBeVisible()

    // Place a queen
    const cell = page.locator('[data-row="0"][data-col="0"]')
    await cell.click()

    // Wait a bit and check timer has incremented
    await page.waitForTimeout(1500)
    await expect(page.locator('text=00:00')).not.toBeVisible()
  })
})
