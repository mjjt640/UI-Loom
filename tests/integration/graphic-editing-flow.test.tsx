import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { createEmptyDocument } from '../../src/domain/model/factories'
import { EditorScreen } from '../../src/features/editor/EditorScreen'
import { useEditorStore } from '../../src/store/editorStore'
import { addRect } from './editorTestActions'

async function clickCanvasPoint(
  user: ReturnType<typeof userEvent.setup>,
  canvas: HTMLElement,
  coords: { x: number; y: number },
) {
  await user.pointer([
    { keys: '[MouseLeft>]', target: canvas, coords },
    { keys: '[/MouseLeft]', target: canvas, coords },
  ])
}

describe('graphic editing flow', () => {
  beforeEach(() => {
    localStorage.clear()
    useEditorStore.setState({ document: createEmptyDocument('Graphic Test') })
  })

  it('creates a rectangle layer from the toolbar', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await addRect(user)

    expect(screen.getByLabelText('矩形图层')).toBeInTheDocument()
    expect(screen.getByText('矩形 1')).toBeInTheDocument()
  })

  it('resizes a selected rectangle from the bottom-right handle', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await addRect(user)
    const rect = screen.getByLabelText('矩形图层')
    await user.click(rect)
    const handle = screen.getByLabelText('调整右下尺寸')
    await user.pointer([
      { keys: '[MouseLeft>]', target: handle, coords: { x: 160, y: 120 } },
      { coords: { x: 220, y: 170 } },
      { keys: '[/MouseLeft]' },
    ])

    expect(rect).toHaveStyle({
      width: '220px',
      height: '170px',
    })
  })

  it('places a rectangle by dragging on the canvas after choosing the shape tool', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByRole('button', { name: '形状工具' }))
    await user.click(
      within(screen.getByRole('menu', { name: '形状工具菜单' })).getByRole(
        'menuitem',
        { name: /矩形/ },
      ),
    )
    const canvas = screen.getByRole('application', { name: '设计画布' })
    await user.pointer([
      { keys: '[MouseLeft>]', target: canvas, coords: { x: 220, y: 180 } },
      { coords: { x: 420, y: 320 } },
      { keys: '[/MouseLeft]' },
    ])

    expect(screen.getByLabelText('矩形图层')).toHaveStyle({
      left: '220px',
      top: '180px',
      width: '200px',
      height: '140px',
    })
  })

  it('pans the canvas with the hand tool shortcut', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.keyboard('h')
    const canvas = screen.getByRole('application', { name: '设计画布' })
    await user.pointer([
      { keys: '[MouseLeft>]', target: canvas, coords: { x: 200, y: 200 } },
      { coords: { x: 248, y: 232 } },
      { keys: '[/MouseLeft]' },
    ])

    expect(canvas).toHaveStyle({
      transform: 'translate(48px, 32px) scale(1)',
    })
  })

  it('keeps selected rectangle proportions with the scale tool shortcut', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await addRect(user)
    const rect = screen.getByLabelText('矩形图层')
    await user.click(rect)
    await user.keyboard('k')
    const handle = screen.getByLabelText('等比缩放右下尺寸')
    await user.pointer([
      { keys: '[MouseLeft>]', target: handle, coords: { x: 160, y: 120 } },
      { coords: { x: 220, y: 150 } },
      { keys: '[/MouseLeft]' },
    ])

    expect(rect).toHaveStyle({
      width: '220px',
      height: '165px',
    })
  })

  it('draws pen and pencil paths without inserting fixed paths', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByRole('button', { name: '钢笔工具' }))
    await user.click(
      within(screen.getByRole('menu', { name: '钢笔工具菜单' })).getByRole(
        'menuitem',
        { name: /钢笔/ },
      ),
    )
    const canvas = screen.getByRole('application', { name: '设计画布' })
    await clickCanvasPoint(user, canvas, { x: 140, y: 140 })
    await clickCanvasPoint(user, canvas, { x: 240, y: 180 })
    await clickCanvasPoint(user, canvas, { x: 320, y: 130 })
    await user.keyboard('{Escape}')

    const penPath = screen.getByLabelText('路径图层')
    expect(penPath).toHaveStyle({
      left: '140px',
      top: '130px',
      width: '180px',
      height: '50px',
    })

    await user.click(screen.getByRole('button', { name: '钢笔工具' }))
    await user.click(
      within(screen.getByRole('menu', { name: '钢笔工具菜单' })).getByRole(
        'menuitem',
        { name: /铅笔/ },
      ),
    )
    await user.pointer([
      { keys: '[MouseLeft>]', target: canvas, coords: { x: 420, y: 260 } },
      { coords: { x: 460, y: 300 } },
      { coords: { x: 520, y: 280 } },
      { keys: '[/MouseLeft]' },
    ])

    expect(screen.getAllByLabelText('路径图层')).toHaveLength(2)
  })

  it('uses pen anchor clicks and pencil freehand drag with distinct live previews', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByRole('button', { name: '钢笔工具' }))
    await user.click(
      within(screen.getByRole('menu', { name: '钢笔工具菜单' })).getByRole(
        'menuitem',
        { name: /钢笔/ },
      ),
    )

    const canvas = screen.getByRole('application', { name: '设计画布' })

    await clickCanvasPoint(user, canvas, { x: 120, y: 120 })
    await clickCanvasPoint(user, canvas, { x: 220, y: 180 })

    const penPreview = screen.getByLabelText('钢笔路径预览')
    expect(penPreview).toBeInTheDocument()
    expect(penPreview).toHaveAttribute('viewBox', '0 0 1440 900')
    expect(penPreview).toHaveClass('inset-0')
    expect(screen.queryByLabelText('绘制区域预览')).not.toBeInTheDocument()

    await clickCanvasPoint(user, canvas, { x: 320, y: 140 })
    await user.keyboard('{Escape}')

    const penPath = screen.getByLabelText('路径图层')
    expect(penPath).toHaveStyle({
      left: '120px',
      top: '120px',
      width: '200px',
      height: '60px',
    })

    await user.click(screen.getByRole('button', { name: '钢笔工具' }))
    await user.click(
      within(screen.getByRole('menu', { name: '钢笔工具菜单' })).getByRole(
        'menuitem',
        { name: /铅笔/ },
      ),
    )
    await user.pointer([
      { keys: '[MouseLeft>]', target: canvas, coords: { x: 420, y: 260 } },
      { coords: { x: 460, y: 300 } },
      { coords: { x: 520, y: 280 } },
    ])

    expect(screen.getByLabelText('铅笔轨迹预览')).toBeInTheDocument()
    expect(screen.queryByLabelText('绘制区域预览')).not.toBeInTheDocument()

    await user.pointer([{ keys: '[/MouseLeft]' }])

    expect(screen.getAllByLabelText('路径图层')).toHaveLength(2)
    const paths = Object.values(useEditorStore.getState().document.nodes).filter(
      (node) => node.type === 'path',
    )
    expect(paths.at(1)?.content.pathData).toContain('Q')
  })

  it('shows a fixed pen anchor, hover point, and preview segment before the next click', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByRole('button', { name: '钢笔工具' }))
    await user.click(
      within(screen.getByRole('menu', { name: '钢笔工具菜单' })).getByRole(
        'menuitem',
        { name: /钢笔/ },
      ),
    )

    const canvas = screen.getByRole('application', { name: '设计画布' })
    await clickCanvasPoint(user, canvas, { x: 120, y: 120 })
    await user.pointer([{ target: canvas, coords: { x: 260, y: 160 } }])

    expect(screen.getByLabelText('钢笔固定锚点')).toHaveAttribute('fill', '#1683ff')
    expect(screen.getByLabelText('钢笔当前点预览')).toHaveAttribute('fill', '#ffffff')
    expect(screen.getByLabelText('钢笔预览线')).toHaveAttribute('x1', '120')
    expect(screen.getByLabelText('钢笔预览线')).toHaveAttribute('x2', '260')
    expect(screen.getByLabelText('钢笔预览线')).toHaveAttribute('y1', '120')
    expect(screen.getByLabelText('钢笔预览线')).toHaveAttribute('y2', '160')
  })

  it('draws pen curves with dragged bezier handles before placing the next node', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByRole('button', { name: '钢笔工具' }))
    await user.click(
      within(screen.getByRole('menu', { name: '钢笔工具菜单' })).getByRole(
        'menuitem',
        { name: /钢笔/ },
      ),
    )

    const canvas = screen.getByRole('application', { name: '设计画布' })
    await user.pointer([
      { keys: '[MouseLeft>]', target: canvas, coords: { x: 80, y: 128 } },
      { coords: { x: 220, y: 300 } },
    ])

    expect(screen.getByLabelText('钢笔路径预览')).toBeInTheDocument()
    expect(screen.getByLabelText('钢笔控制柄预览')).toBeInTheDocument()

    await user.pointer([{ keys: '[/MouseLeft]' }])
    await clickCanvasPoint(user, canvas, { x: 360, y: 120 })
    await user.keyboard('{Escape}')

    const [pathNode] = Object.values(useEditorStore.getState().document.nodes).filter(
      (node) => node.type === 'path',
    )
    expect(pathNode?.content.pathData).toContain('C')
    expect(pathNode?.content.pathNodes).toEqual([
      {
        anchor: { x: 0, y: 51 },
        inHandle: undefined,
        outHandle: { x: 50, y: 100 },
      },
      {
        anchor: { x: 100, y: 49 },
        inHandle: { x: 50, y: 0 },
        outHandle: undefined,
      },
    ])
    expect(pathNode).toMatchObject({
      layout: {
        mode: 'absolute',
      },
      meta: {},
    })
  })

  it('keeps finished pen paths and edit handles visible after switching tools', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByRole('button', { name: '钢笔工具' }))
    await user.click(
      within(screen.getByRole('menu', { name: '钢笔工具菜单' })).getByRole(
        'menuitem',
        { name: /钢笔/ },
      ),
    )

    const canvas = screen.getByRole('application', { name: '设计画布' })
    await user.pointer([
      { keys: '[MouseLeft>]', target: canvas, coords: { x: 100, y: 100 } },
      { coords: { x: 180, y: 160 } },
      { keys: '[/MouseLeft]' },
    ])
    await clickCanvasPoint(user, canvas, { x: 280, y: 120 })
    await user.keyboard('{Escape}')

    const penPath = screen.getByLabelText('路径图层')
    await user.click(screen.getByRole('button', { name: '选择工具' }))
    await user.click(penPath)

    expect(penPath).toBeInTheDocument()
    expect(screen.getByLabelText('路径节点编辑层')).toBeInTheDocument()
    expect(screen.getAllByLabelText('路径锚点')).toHaveLength(2)
    expect(screen.getAllByLabelText('路径控制柄')).toHaveLength(2)
    expect(screen.getByRole('toolbar', { name: '路径编辑工具栏' }))
      .toBeInTheDocument()
  })
})
