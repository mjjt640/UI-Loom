import { expect, test } from '@playwright/test'

test('user can add text and see exported code', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '新增文本' }).click()
  await expect(page.getByRole('button', { name: '新文本' })).toBeVisible()
  await expect(page.getByText('GeneratedPage')).toBeVisible()
})
