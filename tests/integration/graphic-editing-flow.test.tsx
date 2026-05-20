import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { createEmptyDocument } from '../../src/domain/model/factories'
import { EditorScreen } from '../../src/features/editor/EditorScreen'
import { useEditorStore } from '../../src/store/editorStore'

describe('graphic editing flow', () => {
  beforeEach(() => {
    localStorage.clear()
    useEditorStore.setState({ document: createEmptyDocument('Graphic Test') })
  })

  it('creates a rectangle layer from the toolbar', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByText('矩形'))

    expect(screen.getByLabelText('矩形图层')).toBeInTheDocument()
    expect(screen.getByText('Rectangle')).toBeInTheDocument()
  })

  it('resizes a selected rectangle from the bottom-right handle', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByText('矩形'))
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
})
