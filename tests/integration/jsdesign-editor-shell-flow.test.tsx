import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEmptyDocument } from '../../src/domain/model/factories'
import { EditorScreen } from '../../src/features/editor/EditorScreen'
import { useEditorStore } from '../../src/store/editorStore'
import { dragOnCanvas, editorTestBoxes } from './editorTestActions'

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

const remixIconFixture = [
  {
    category: 'Editor',
    name: 'align-bottom',
    source: 'Remix Icon',
    svgPath: 'M4 5h16v2H4z',
    tags: ['align', 'bottom', 'editor'],
    viewBox: '0 0 24 24',
  },
  {
    category: 'Editor',
    name: 'align-right',
    source: 'Remix Icon',
    svgPath: 'M4 5h16v2H4z',
    tags: ['align', 'right', 'editor'],
    viewBox: '0 0 24 24',
  },
  {
    category: 'Editor',
    name: 'attachment-2',
    source: 'Remix Icon',
    svgPath: 'M4 5h16v2H4z',
    tags: ['attachment', 'editor'],
    viewBox: '0 0 24 24',
  },
] satisfies Array<{
  category: string
  name: string
  source: 'Remix Icon'
  svgPath: string
  tags: string[]
  viewBox: string
}>

function mockRemixIconFetch() {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(remixIconFixture), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    }),
  )
}

describe('jsdesign inspired editor shell', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    mockRemixIconFetch()
    localStorage.clear()
    useEditorStore.setState({
      document: createEmptyDocument('Editor Shell Flow Test'),
    })
  })

  it('renders a design-tool layout with vertical tools, layer tabs, and right mode tabs', () => {
    render(<EditorScreen />)

    expect(screen.getByRole('banner')).toHaveTextContent('个人文件 /')
    expect(screen.getByRole('banner')).toHaveTextContent('100%')
    expect(screen.getByRole('toolbar', { name: '设计工具栏' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '选择工具' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('tab', { name: '图层' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tab', { name: '组件' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '资源' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'AI New' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '切片工具' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '评论工具' })).not.toBeInTheDocument()
    expect(screen.getByText('页数：1')).toBeInTheDocument()
    expect(screen.getAllByText('-600').length).toBeGreaterThan(0)
    expect(screen.getAllByText('-550').length).toBeGreaterThan(0)
    expect(screen.getByRole('tab', { name: '设计' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tab', { name: '原型' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '标注' })).toBeInTheDocument()
  })

  it('opens the tool menu and places nodes from insert choices', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByRole('button', { name: '形状工具' }))
    const shapeMenu = screen.getByRole('menu', { name: '形状工具菜单' })

    expect(within(shapeMenu).getByRole('menuitem', { name: /矩形/ })).toHaveTextContent(
      'R',
    )
    expect(within(shapeMenu).getByRole('menuitem', { name: /圆形/ })).toHaveTextContent(
      'O',
    )
    expect(within(shapeMenu).getByRole('menuitem', { name: /图片/ })).toHaveTextContent(
      'Shift I',
    )

    await user.click(within(shapeMenu).getByRole('menuitem', { name: /矩形/ }))
    await dragOnCanvas(user, editorTestBoxes.rect)

    expect(screen.getByRole('listitem', { name: '矩形 1' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '插入工具' }))
    const insertMenu = screen.getByRole('menu', { name: '插入工具菜单' })

    await user.click(within(insertMenu).getByRole('menuitem', { name: /按钮/ }))
    await dragOnCanvas(user, editorTestBoxes.button)

    expect(screen.getByRole('listitem', { name: 'Button' })).toBeInTheDocument()
  })

  it('connects jsdesign style selection and pen tool menus to real editor modes', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByRole('button', { name: '选择工具' }))
    const selectionMenu = screen.getByRole('menu', { name: '选择工具菜单' })

    expect(
      within(selectionMenu).getByRole('menuitemradio', { name: /选择工具/ }),
    ).toHaveTextContent('V')
    expect(
      within(selectionMenu).getByRole('menuitemradio', { name: /移动视图/ }),
    ).toHaveTextContent('H')
    expect(
      within(selectionMenu).getByRole('menuitemradio', { name: /等比缩放/ }),
    ).toHaveTextContent('K')

    await user.click(
      within(selectionMenu).getByRole('menuitemradio', { name: /移动视图/ }),
    )

    expect(screen.getByRole('application', { name: '设计画布' })).toHaveAttribute(
      'data-tool-mode',
      'hand',
    )

    await user.keyboard('k')

    expect(screen.getByRole('application', { name: '设计画布' })).toHaveAttribute(
      'data-tool-mode',
      'scale',
    )

    await user.click(screen.getByRole('button', { name: '钢笔工具' }))
    const penMenu = screen.getByRole('menu', { name: '钢笔工具菜单' })

    expect(within(penMenu).getByRole('menuitem', { name: /钢笔/ })).toHaveTextContent(
      'P',
    )
    expect(within(penMenu).getByRole('menuitem', { name: /铅笔/ })).toHaveTextContent(
      'Shift P',
    )

    await user.click(within(penMenu).getByRole('menuitem', { name: /钢笔/ }))
    const canvas = screen.getByRole('application', { name: '设计画布' })

    await clickCanvasPoint(user, canvas, { x: 132, y: 104 })
    await clickCanvasPoint(user, canvas, { x: 220, y: 148 })
    await clickCanvasPoint(user, canvas, { x: 312, y: 224 })
    await user.keyboard('{Escape}')

    expect(screen.getByLabelText('路径图层')).toBeInTheDocument()
    expect(screen.getByRole('listitem', { name: '路径 1' })).toBeInTheDocument()
  })

  it('shows jsdesign style path editing controls when the pen tool is active', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByRole('button', { name: '钢笔工具' }))
    await user.click(
      within(screen.getByRole('menu', { name: '钢笔工具菜单' })).getByRole(
        'menuitem',
        { name: /钢笔/ },
      ),
    )

    const pathToolbar = screen.getByRole('toolbar', { name: '路径编辑工具栏' })

    expect(within(pathToolbar).getByRole('button', { name: '选择节点' }))
      .toBeInTheDocument()
    expect(within(pathToolbar).getByRole('button', { name: '曲线工具' }))
      .toHaveAttribute('aria-pressed', 'true')
    expect(within(pathToolbar).getByRole('button', { name: '节点编辑' }))
      .toBeInTheDocument()
    expect(within(pathToolbar).getByRole('button', { name: '剪刀工具' }))
      .toBeInTheDocument()
    expect(within(pathToolbar).getByRole('button', { name: '填充工具' }))
      .toBeInTheDocument()

    await user.click(within(pathToolbar).getByRole('button', { name: '剪刀工具' }))

    expect(within(pathToolbar).getByRole('button', { name: '剪刀工具' }))
      .toHaveAttribute('aria-pressed', 'true')

    await user.click(within(pathToolbar).getByRole('button', { name: '退出编辑' }))

    expect(screen.queryByRole('toolbar', { name: '路径编辑工具栏' }))
      .not.toBeInTheDocument()
    expect(screen.getByRole('application', { name: '设计画布' })).toHaveAttribute(
      'data-tool-mode',
      'select',
    )
  })

  it('shows jsdesign style tool hints on sidebar hover', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.hover(screen.getByRole('button', { name: '形状工具' }))

    const tooltip = screen.getByRole('tooltip', { name: '矩形 R' })

    expect(tooltip).toHaveTextContent('矩形')
    expect(tooltip).toHaveTextContent('R')
  })

  it('updates toolbar group icons to the chosen sub tool', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByRole('button', { name: '形状工具' }))
    await user.click(
      within(screen.getByRole('menu', { name: '形状工具菜单' })).getByRole(
        'menuitem',
        { name: /圆形/ },
      ),
    )

    const shapeToolButton = screen.getByRole('button', { name: '形状工具' })
    expect(shapeToolButton).toHaveAttribute('aria-pressed', 'true')
    expect(shapeToolButton.querySelector('ellipse')).not.toBeNull()

    await user.click(screen.getByRole('button', { name: '形状工具' }))

    expect(screen.getByRole('application', { name: '设计画布' })).toHaveAttribute(
      'data-tool-mode',
      'ellipse',
    )
    expect(shapeToolButton.querySelector('ellipse')).not.toBeNull()

    await user.click(screen.getByRole('button', { name: '钢笔工具' }))
    await user.click(
      within(screen.getByRole('menu', { name: '钢笔工具菜单' })).getByRole(
        'menuitem',
        { name: /铅笔/ },
      ),
    )

    const penToolButton = screen.getByRole('button', { name: '钢笔工具' })
    expect(penToolButton).toHaveAttribute('aria-pressed', 'true')
    expect(penToolButton.querySelector('svg')).not.toBeNull()

    await user.click(screen.getByRole('button', { name: '钢笔工具' }))

    expect(screen.getByRole('application', { name: '设计画布' })).toHaveAttribute(
      'data-tool-mode',
      'pencil',
    )
    expect(penToolButton).toHaveAttribute('aria-pressed', 'true')
    expect(penToolButton.querySelector('svg')).not.toBeNull()
  })

  it('opens the canvas preset panel from the second sidebar tool and applies a custom size', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByRole('button', { name: '画板工具' }))

    expect(screen.getByRole('heading', { name: '画板尺寸' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'iPad Pro 11" 834 × 1194' }))
      .toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'iPad Pro 11" 834 × 1194' }))

    expect(screen.getByRole('application', { name: '设计画布' })).toHaveStyle({
      width: '834px',
      height: '1194px',
    })

    await user.clear(screen.getByLabelText('画板宽度'))
    await user.type(screen.getByLabelText('画板宽度'), '390')
    await user.clear(screen.getByLabelText('画板高度'))
    await user.type(screen.getByLabelText('画板高度'), '844')
    await user.click(screen.getByRole('button', { name: '应用自定义画板尺寸' }))

    expect(screen.getByRole('application', { name: '设计画布' })).toHaveStyle({
      width: '390px',
      height: '844px',
    })
  })

  it('opens the open-source component library and places a selected preset by dragging', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByRole('tab', { name: '组件' }))

    expect(screen.getByRole('tab', { name: '图层' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '组件' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('heading', { name: '开源组件库' })).toBeInTheDocument()
    expect(screen.getAllByText('shadcn/ui')).toHaveLength(3)

    await user.click(screen.getByRole('tab', { name: '图层' }))

    expect(screen.getByText('页数：1')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: '组件' }))

    await user.click(screen.getByRole('button', { name: '选择 Card 组件' }))

    expect(screen.getByRole('application', { name: '设计画布' })).toHaveAttribute(
      'data-tool-mode',
      'component-card',
    )

    await dragOnCanvas(user, { endX: 520, endY: 336, startX: 160, startY: 96 })

    expect(screen.getByRole('listitem', { name: 'Card' })).toBeInTheDocument()
    expect(screen.getByLabelText('Card 组件')).toHaveStyle({
      left: '160px',
      top: '96px',
      width: '360px',
      height: '240px',
    })
  })

  it('opens remix icon resources, searches them, and places a selected icon by dragging', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByRole('tab', { name: '资源' }))

    expect(screen.getByRole('tab', { name: '资源' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('heading', { name: /Remix 线性图标库/ }))
      .toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '图标' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(await screen.findByRole('button', { name: 'align-bottom' }))
      .toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'attachment-2' }))
      .toBeInTheDocument()

    await user.type(screen.getByRole('searchbox', { name: '搜索资源' }), 'right')

    expect(screen.getByRole('button', { name: 'align-right' }))
      .toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'align-left' }))
      .not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'align-right' }))

    expect(screen.getByRole('application', { name: '设计画布' })).toHaveAttribute(
      'data-tool-mode',
      'resource-icon',
    )

    await dragOnCanvas(user, { endX: 168, endY: 168, startX: 120, startY: 120 })

    expect(screen.getByLabelText('align-right 图标')).toBeInTheDocument()
    expect(screen.getByRole('listitem', { name: 'align-right' }))
      .toBeInTheDocument()
  })

  it('loads remix icon resources only when the resource panel is opened', async () => {
    const user = userEvent.setup()

    render(<EditorScreen />)

    expect(globalThis.fetch).not.toHaveBeenCalled()

    await user.click(screen.getByRole('tab', { name: '资源' }))

    expect(await screen.findByRole('button', { name: 'align-right' }))
      .toBeInTheDocument()
    expect(globalThis.fetch).toHaveBeenCalledWith('/remix-linear-icons.json')
  })

  it('shows a loading state while remix icon resources are loading', async () => {
    const user = userEvent.setup()
    vi.mocked(globalThis.fetch).mockReturnValueOnce(
      new Promise<Response>(() => undefined),
    )

    render(<EditorScreen />)
    await user.click(screen.getByRole('tab', { name: '资源' }))

    expect(screen.getByRole('status')).toHaveTextContent(
      '正在加载 Remix 图标...',
    )
  })

  it('shows an error state when remix icon resources fail to load', async () => {
    const user = userEvent.setup()
    vi.mocked(globalThis.fetch).mockRejectedValueOnce(
      new Error('network unavailable'),
    )

    render(<EditorScreen />)
    await user.click(screen.getByRole('tab', { name: '资源' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '资源加载失败，请稍后重试。',
    )
  })

  it('retries remix icon resource loading after a failure', async () => {
    const user = userEvent.setup()
    let resolveRetry: (response: Response) => void = () => undefined
    const retryResponse = new Promise<Response>((resolve) => {
      resolveRetry = resolve
    })

    vi.mocked(globalThis.fetch)
      .mockRejectedValueOnce(new Error('network unavailable'))
      .mockReturnValueOnce(retryResponse)

    render(<EditorScreen />)
    await user.click(screen.getByRole('tab', { name: '资源' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '资源加载失败，请稍后重试。',
    )

    await user.click(screen.getByRole('button', { name: '重试' }))

    expect(screen.getByRole('status')).toHaveTextContent(
      '正在加载 Remix 图标...',
    )

    resolveRetry(
      new Response(JSON.stringify(remixIconFixture), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }),
    )

    expect(await screen.findByRole('button', { name: 'align-right' }))
      .toBeInTheDocument()
    expect(globalThis.fetch).toHaveBeenCalledTimes(2)
  })

  it('selects the slice tool from the dedicated sidebar icon', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByRole('button', { name: '切片工具' }))

    expect(screen.getByRole('application', { name: '设计画布' })).toHaveAttribute(
      'data-tool-mode',
      'slice',
    )

    await dragOnCanvas(user, editorTestBoxes.slice)

    expect(screen.getByLabelText('切片图层')).toBeInTheDocument()
    expect(screen.getByRole('listitem', { name: '切片 1' })).toBeInTheDocument()
  })

  it('uses displayed creation shortcuts to select component and asset tools', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.keyboard('b')
    await dragOnCanvas(user, editorTestBoxes.button)
    await user.keyboard('c')
    await dragOnCanvas(user, editorTestBoxes.container)
    await user.keyboard('{Shift>}i{/Shift}')
    await dragOnCanvas(user, editorTestBoxes.image)

    expect(screen.getByRole('listitem', { name: 'Button' })).toBeInTheDocument()
    expect(screen.getByRole('listitem', { name: 'Container' })).toBeInTheDocument()
    expect(screen.getByRole('listitem', { name: 'Image' })).toBeInTheDocument()
  })

  it('creates distinct shape nodes from jsdesign inspired menus and slice from the dedicated tool', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByRole('button', { name: '切片工具' }))
    await dragOnCanvas(user, editorTestBoxes.slice)
    expect(screen.getByLabelText('切片图层')).toBeInTheDocument()
    expect(screen.getByRole('listitem', { name: '切片 1' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '形状工具' }))
    await user.click(
      within(screen.getByRole('menu', { name: '形状工具菜单' })).getByRole(
        'menuitem',
        { name: /矩形/ },
      ),
    )
    await dragOnCanvas(user, editorTestBoxes.rect)
    expect(screen.getByLabelText('矩形图层')).toBeInTheDocument()
    expect(screen.getByRole('listitem', { name: '矩形 1' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '形状工具' }))
    await user.click(
      within(screen.getByRole('menu', { name: '形状工具菜单' })).getByRole(
        'menuitem',
        { name: /圆形/ },
      ),
    )
    await dragOnCanvas(user, { endX: 248, endY: 248, startX: 104, startY: 104 })
    expect(screen.getByLabelText('圆形图层')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '形状工具' }))
    await user.click(
      within(screen.getByRole('menu', { name: '形状工具菜单' })).getByRole(
        'menuitem',
        { name: /三角形/ },
      ),
    )
    await dragOnCanvas(user, { endX: 272, endY: 236, startX: 112, startY: 96 })
    expect(screen.getByLabelText('三角形图层')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '形状工具' }))
    await user.click(
      within(screen.getByRole('menu', { name: '形状工具菜单' })).getByRole(
        'menuitem',
        { name: /星形/ },
      ),
    )
    await dragOnCanvas(user, { endX: 272, endY: 248, startX: 120, startY: 96 })
    expect(screen.getByLabelText('星形图层')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '形状工具' }))
    await user.click(
      within(screen.getByRole('menu', { name: '形状工具菜单' })).getByRole(
        'menuitem',
        { name: /多边形/ },
      ),
    )
    await dragOnCanvas(user, editorTestBoxes.polygon)
    expect(screen.getByLabelText('多边形图层')).toBeInTheDocument()
  })
})
