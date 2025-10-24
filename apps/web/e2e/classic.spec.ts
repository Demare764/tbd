import { test, expect } from '@playwright/test'

const VALID = ['CIDER', 'MOUSE', 'BRICK', 'GYROS', 'BERRY', 'RHYME']
const INVALID = ['APPLE', 'PLUMB', 'PLANT']

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('Classic: enter 6 valid gray words ⇒ sees TOTAL FADE victory', async ({ page }) => {
  await expect(page.getByTestId('target-word')).toHaveText('PLANT')
  for (const w of VALID) {
    await page.getByTestId('guess-input').fill(w)
    await page.getByTestId('guess-button').click()
  }
  await expect(page.getByTestId('victory')).toHaveText(/TOTAL FADE/i)
})

test('Classic: 3 invalid guesses ⇒ pips reach 0 ⇒ lost', async ({ page }) => {
  await expect(page.getByTestId('pips')).toHaveText(/●●●|○○○/)
  for (const w of INVALID) {
    await page.getByTestId('guess-input').fill(w)
    await page.getByTestId('guess-button').click()
  }
  await expect(page.getByTestId('pips')).toContainText('○○○')
  await expect(page.getByTestId('lost')).toHaveText(/Out of focus/i)
})

