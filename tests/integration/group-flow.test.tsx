import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { createEmptyDocument } from '../../src/domain/model/factories'
import { EditorScreen } from '../../src/features/editor/EditorScreen'
import { useEditorStore } from '../../src/store/editorStore'

describe('group flow', () => {
  beforeEach(() => {
    localStorage.clear()
    useEditorStore.setState({ document: createEmptyDocument('Group Flow Test') })
  })

  it('groups and ungroups selected layers from the toolbar', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByText('矩形'))
    await user.click(screen.getByText('新增按钮'))
    await user.click(
      within(screen.getByRole('listitem', { name: 'Rectangle' })).getByLabelText(
        '多选 Rectangle',
      ),
    )
    await user.click(
      within(screen.getByRole('listitem', { name: 'Button' })).getByLabelText(
        '多选 Button',
      ),
    )
    await user.click(screen.getByText('组合'))

    expect(screen.getByRole('listitem', { name: 'Group' })).toBeInTheDocument()
    expect(screen.getByLabelText('图层组')).toBeInTheDocument()
    expect(screen.getByText('已选中 1 个节点')).toBeInTheDocument()

    await user.click(screen.getByText('取消组合'))

    expect(screen.queryByRole('listitem', { name: 'Group' })).not.toBeInTheDocument()
    expect(screen.getByRole('listitem', { name: 'Rectangle' })).toBeInTheDocument()
    expect(screen.getByRole('listitem', { name: 'Button' })).toBeInTheDocument()
  })
})
