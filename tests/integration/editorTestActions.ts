import { screen, within } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'

interface DragBox {
  endX: number
  endY: number
  startX: number
  startY: number
}

const defaultBoxes = {
  button: { endX: 160, endY: 116, startX: 40, startY: 72 },
  container: { endX: 600, endY: 252, startX: 320, startY: 72 },
  frame: { endX: 440, endY: 360, startX: 120, startY: 120 },
  image: { endX: 280, endY: 296, startX: 40, startY: 136 },
  path: { endX: 312, endY: 224, startX: 132, startY: 104 },
  polygon: { endX: 272, endY: 240, startX: 120, startY: 96 },
  resourceIcon: { endX: 168, endY: 168, startX: 120, startY: 120 },
  rect: { endX: 256, endY: 216, startX: 96, startY: 96 },
  slice: { endX: 324, endY: 244, startX: 84, startY: 84 },
  text: { endX: 160, endY: 32, startX: 0, startY: 0 },
} satisfies Record<string, DragBox>

export async function dragOnCanvas(user: UserEvent, box: DragBox) {
  const canvas = screen.getByRole('application', { name: '设计画布' })

  await user.pointer([
    {
      coords: { x: box.startX, y: box.startY },
      keys: '[MouseLeft>]',
      target: canvas,
    },
    { coords: { x: box.endX, y: box.endY } },
    { coords: { x: box.endX, y: box.endY }, keys: '[/MouseLeft]' },
  ])
}

export { defaultBoxes as editorTestBoxes }

export async function addFrame(user: UserEvent) {
  await user.click(screen.getByRole('button', { name: '插入工具' }))
  await user.click(
    within(screen.getByRole('menu', { name: '插入工具菜单' })).getByRole(
      'menuitem',
      { name: /Frame/ },
    ),
  )
  await dragOnCanvas(user, defaultBoxes.frame)
}

export async function addText(user: UserEvent) {
  await user.click(screen.getByRole('button', { name: '文本工具' }))
  await dragOnCanvas(user, defaultBoxes.text)
}

export async function addRect(user: UserEvent) {
  await user.click(screen.getByRole('button', { name: '形状工具' }))
  await user.click(
    within(screen.getByRole('menu', { name: '形状工具菜单' })).getByRole(
      'menuitem',
      { name: /矩形/ },
    ),
  )
  await dragOnCanvas(user, defaultBoxes.rect)
}

export async function addPolygon(user: UserEvent) {
  await user.click(screen.getByRole('button', { name: '形状工具' }))
  await user.click(
    within(screen.getByRole('menu', { name: '形状工具菜单' })).getByRole(
      'menuitem',
      { name: /多边形/ },
    ),
  )
  await dragOnCanvas(user, defaultBoxes.polygon)
}

export async function addSlice(user: UserEvent) {
  await user.click(screen.getByRole('button', { name: '切片工具' }))
  await dragOnCanvas(user, defaultBoxes.slice)
}

export async function addIcon(user: UserEvent, iconName: string) {
  await user.click(screen.getByRole('tab', { name: '资源' }))
  await user.click(await screen.findByRole('button', { name: iconName }))
  await dragOnCanvas(user, defaultBoxes.resourceIcon)
}

export async function addPath(user: UserEvent) {
  await user.click(screen.getByRole('button', { name: '钢笔工具' }))
  await user.click(
    within(screen.getByRole('menu', { name: '钢笔工具菜单' })).getByRole(
      'menuitem',
      { name: /铅笔/ },
    ),
  )
  await dragOnCanvas(user, defaultBoxes.path)
}

export async function addImage(user: UserEvent) {
  await user.click(screen.getByRole('button', { name: '形状工具' }))
  await user.click(
    within(screen.getByRole('menu', { name: '形状工具菜单' })).getByRole(
      'menuitem',
      { name: /图片/ },
    ),
  )
  await dragOnCanvas(user, defaultBoxes.image)
}

export async function addButton(user: UserEvent) {
  await user.click(screen.getByRole('button', { name: '插入工具' }))
  await user.click(
    within(screen.getByRole('menu', { name: '插入工具菜单' })).getByRole(
      'menuitem',
      { name: /按钮/ },
    ),
  )
  await dragOnCanvas(user, defaultBoxes.button)
}

export async function addContainer(user: UserEvent) {
  await user.click(screen.getByRole('button', { name: '插入工具' }))
  await user.click(
    within(screen.getByRole('menu', { name: '插入工具菜单' })).getByRole(
      'menuitem',
      { name: /容器/ },
    ),
  )
  await dragOnCanvas(user, defaultBoxes.container)
}
