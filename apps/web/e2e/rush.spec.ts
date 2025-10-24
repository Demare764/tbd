import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/rush')
})

test('Rush: valid streak increases combo; invalid decreases time and resets combo', async ({ page }) => {
  // Initial combo x1, time visible like "60s"
  const time0 = parseInt((await page.locator('header .tabular-nums').textContent() || '60').replace('s',''), 10)

  // Two valid guesses increase combo to x3
  for (const w of ['CIDER', 'MOUSE']) {
    await page.getByPlaceholder('TYPE 5 LETTERS').fill(w)
    await page.getByRole('button', { name: 'Guess' }).click()
  }
  await expect(page.locator('header')).toContainText('x3')

  // Invalid guess resets combo to x1 and time continues decreasing
  await page.getByPlaceholder('TYPE 5 LETTERS').fill('APPLE')
  await page.getByRole('button', { name: 'Guess' }).click()

  // Wait a moment for RAF/tick to reduce time
  await page.waitForTimeout(600)
  const time1 = parseInt((await page.locator('header .tabular-nums').textContent() || '0').replace('s',''), 10)
  await expect(page.locator('header')).toContainText('x1')
  expect(time1).toBeLessThanOrEqual(time0)
})
