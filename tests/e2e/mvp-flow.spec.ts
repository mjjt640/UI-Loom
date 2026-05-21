import { expect, test } from '@playwright/test'

async function dragOnCanvas(
  page: import('@playwright/test').Page,
  box: { endX: number; endY: number; startX: number; startY: number },
) {
  const canvas = page.getByRole('application', { name: '设计画布' })

  await canvas.hover({ position: { x: box.startX, y: box.startY } })
  await page.mouse.down()
  await canvas.hover({ position: { x: box.endX, y: box.endY } })
  await page.mouse.up()
}

async function addButton(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: '插入工具' }).click()
  await page.getByRole('menuitem', { name: /按钮/ }).click()
  await dragOnCanvas(page, { endX: 160, endY: 116, startX: 40, startY: 72 })
}

async function addContainer(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: '插入工具' }).click()
  await page.getByRole('menuitem', { name: /容器/ }).click()
  await dragOnCanvas(page, { endX: 600, endY: 252, startX: 320, startY: 72 })
}

async function addImage(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: '形状工具' }).click()
  await page.getByRole('menuitem', { name: /图片/ }).click()
  await dragOnCanvas(page, { endX: 280, endY: 296, startX: 40, startY: 136 })
}

test('user can add text and see exported code', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '文本工具' }).click()
  await dragOnCanvas(page, { endX: 160, endY: 32, startX: 0, startY: 0 })
  await expect(page.getByRole('button', { name: '新文本' })).toBeVisible()
  await expect(page.getByText('export function GeneratedPage')).toBeVisible()
})

test('user can add basic nodes, edit image alt, and delete a node', async ({
  page,
}) => {
  await page.goto('/')
  await addButton(page)
  await addImage(page)
  await addContainer(page)

  await expect(page.getByRole('button', { name: '按钮', exact: true })).toBeVisible()
  await expect(page.getByRole('img', { name: '图片描述' })).toBeVisible()
  await expect(page.getByRole('group', { name: '容器节点' })).toBeVisible()

  await page.getByRole('img', { name: '图片描述' }).click()
  await page.getByRole('textbox', { name: '图片描述' }).fill('产品截图')
  await expect(page.getByRole('img', { name: '产品截图' })).toBeVisible()

  await page.getByRole('button', { name: '按钮', exact: true }).click()
  await page.getByRole('button', { name: '删除' }).click()
  await expect(page.getByRole('button', { name: '按钮', exact: true })).toHaveCount(0)
  await expect(page.getByText('<img')).toBeVisible()
  await expect(page.getByRole('button', { name: 'src/components/Container.tsx' })).toBeVisible()
})

test('user can move a node into a flex container', async ({ page }) => {
  await page.goto('/')
  await addContainer(page)
  await addButton(page)
  await page.getByRole('button', { name: '按钮', exact: true }).click()
  await page.getByRole('button', { name: '移入容器' }).click()

  const container = page.getByRole('group', { name: '容器节点' })
  await expect(container.getByRole('button', { name: '按钮', exact: true })).toBeVisible()
  await expect(page.getByText('flex flex-col gap-3')).toBeVisible()
})
