import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { createEmptyDocument } from '../../src/domain/model/factories'
import { EditorScreen } from '../../src/features/editor/EditorScreen'
import { useEditorStore } from '../../src/store/editorStore'

describe('layer panel flow', () => {
  beforeEach(() => {
    localStorage.clear()
    useEditorStore.setState({ document: createEmptyDocument('Layer Panel Test') })
  })

  it('hides and shows a rectangle layer from the layers panel', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByText('矩形'))
    const layer = screen.getByRole('listitem', { name: 'Rectangle' })
    await user.click(within(layer).getByLabelText('隐藏 Rectangle'))

    expect(screen.queryByLabelText('矩形图层')).not.toBeInTheDocument()

    await user.click(within(layer).getByLabelText('显示 Rectangle'))
    expect(screen.getByLabelText('矩形图层')).toBeInTheDocument()
  })

  it('locks a layer so it cannot be selected from the canvas', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByText('矩形'))
    const layer = screen.getByRole('listitem', { name: 'Rectangle' })
    await user.click(within(layer).getByLabelText('锁定 Rectangle'))
    await user.click(screen.getByLabelText('矩形图层'))

    expect(screen.queryByText('已选中 1 个节点')).not.toBeInTheDocument()
  })

  it('moves a layer forward in the layer order', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByText('矩形'))
    await user.click(screen.getByText('新增按钮'))
    const rectangleLayer = screen.getByRole('listitem', { name: 'Rectangle' })
    await user.click(within(rectangleLayer).getByLabelText('上移 Rectangle'))

    const layerNames = screen
      .getAllByRole('listitem')
      .map((item) => item.getAttribute('aria-label'))

    expect(layerNames).toEqual(['Page', 'Button', 'Rectangle'])
  })
})
