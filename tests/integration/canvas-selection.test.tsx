import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { createEmptyDocument } from '../../src/domain/model/factories'
import { EditorScreen } from '../../src/features/editor/EditorScreen'
import { useEditorStore } from '../../src/store/editorStore'

describe('canvas selection', () => {
  beforeEach(() => {
    localStorage.clear()
    useEditorStore.setState({ document: createEmptyDocument('Test Page') })
  })

  it('selects a text node when clicked', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)
    await user.click(screen.getByText('新增文本'))
    await user.click(screen.getByText('新文本'))
    expect(screen.getByText('已选中 1 个节点')).toBeInTheDocument()
  })

  it('selects multiple top-level layers with a marquee drag on the canvas', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByText('矩形'))
    await user.click(screen.getByText('新增按钮'))

    const canvas = screen.getByLabelText('设计画布')
    canvas.getBoundingClientRect = () =>
      ({
        bottom: 900,
        height: 900,
        left: 0,
        right: 1440,
        top: 0,
        width: 1440,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect

    await user.pointer([
      { keys: '[MouseLeft>]', target: canvas, coords: { x: 24, y: 48 } },
      { coords: { x: 280, y: 240 } },
      { keys: '[/MouseLeft]', coords: { x: 280, y: 240 } },
    ])

    expect(screen.getByText('已选中 2 个节点')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '左对齐' })).toBeEnabled()
  })
})
