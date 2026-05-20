import { expect, test } from '@playwright/test'

test('user can add text and see exported code', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '新增文本' }).click()
  await expect(page.getByRole('button', { name: '新文本' })).toBeVisible()
  await expect(page.getByText('export function GeneratedPage')).toBeVisible()
})

test('user can add basic nodes, edit image alt, and delete a node', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: '新增按钮' }).click()
  await page.getByRole('button', { name: '新增图片' }).click()
  await page.getByRole('button', { name: '新增容器' }).click()

  await expect(page.getByRole('button', { name: '按钮', exact: true })).toBeVisible()
  await expect(page.getByRole('img', { name: '图片描述' })).toBeVisible()
  await expect(page.getByRole('group', { name: '容器节点' })).toBeVisible()

  await page.getByRole('img', { name: '图片描述' }).click()
  await page.getByRole('textbox', { name: '图片描述' }).fill('产品截图')
  await expect(page.getByRole('img', { name: '产品截图' })).toBeVisible()

  await page.getByRole('button', { name: '按钮', exact: true }).click()
  await page.getByRole('button', { name: '删除节点' }).click()
  await expect(page.getByRole('button', { name: '按钮', exact: true })).toHaveCount(0)
  await expect(page.getByText('<img')).toBeVisible()
  await expect(page.getByRole('button', { name: 'src/components/Container.tsx' })).toBeVisible()
})

test('user can move a node into a flex container', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '新增容器' }).click()
  await page.getByRole('button', { name: '新增按钮' }).click()
  await page.getByRole('button', { name: '按钮', exact: true }).click()
  await page.getByRole('button', { name: '移入容器' }).click()

  const container = page.getByRole('group', { name: '容器节点' })
  await expect(container.getByRole('button', { name: '按钮', exact: true })).toBeVisible()
  await expect(page.getByText('flex flex-col gap-3')).toBeVisible()
})
