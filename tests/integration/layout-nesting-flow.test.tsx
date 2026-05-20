import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { createEmptyDocument } from '../../src/domain/model/factories'
import { EditorScreen } from '../../src/features/editor/EditorScreen'
import { useEditorStore } from '../../src/store/editorStore'

describe('layout and nesting flow', () => {
  beforeEach(() => {
    localStorage.clear()
    useEditorStore.setState({ document: createEmptyDocument('Test Page') })
  })

  it('updates selected node layout from inspector', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByText('新增按钮'))
    await user.click(screen.getByRole('button', { name: '按钮' }))
    await user.clear(screen.getByLabelText('X'))
    await user.type(screen.getByLabelText('X'), '180')
    await user.clear(screen.getByLabelText('Y'))
    await user.type(screen.getByLabelText('Y'), '220')

    expect(screen.getByRole('button', { name: '按钮' })).toHaveStyle({
      left: '180px',
      top: '220px',
    })
  })

  it('drags a top-level node and persists its position', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByText('新增按钮'))
    const button = screen.getByRole('button', { name: '按钮' })

    await user.pointer([
      { keys: '[MouseLeft>]', target: button, coords: { x: 40, y: 72 } },
      { coords: { x: 140, y: 132 } },
      { keys: '[/MouseLeft]' },
    ])

    expect(button).toHaveStyle({
      left: '140px',
      top: '132px',
    })
    expect(screen.getByLabelText('X')).toHaveValue('140')
    expect(screen.getByLabelText('Y')).toHaveValue('132')
  })

  it('moves a selected button into the first container and renders it inside', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByText('新增容器'))
    await user.click(screen.getByText('新增按钮'))
    await user.click(screen.getByRole('button', { name: '按钮' }))
    await user.click(screen.getByText('移入容器'))

    const container = screen.getByRole('group', { name: '容器节点' })
    expect(within(container).getByRole('button', { name: '按钮' })).toBeInTheDocument()
    expect(container).toHaveStyle({
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '16px',
    })
  })
})
