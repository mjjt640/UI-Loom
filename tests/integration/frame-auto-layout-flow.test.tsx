import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { createEmptyDocument } from '../../src/domain/model/factories'
import { EditorScreen } from '../../src/features/editor/EditorScreen'
import { useEditorStore } from '../../src/store/editorStore'

describe('frame auto layout flow', () => {
  beforeEach(() => {
    localStorage.clear()
    useEditorStore.setState({ document: createEmptyDocument('Frame Flow Test') })
  })

  it('adds a frame from the toolbar and renders it on the canvas', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByRole('button', { name: 'Frame' }))

    expect(screen.getByRole('listitem', { name: 'Frame' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Frame 节点' })).toBeInTheDocument()
  })

  it('wraps selected sibling layers into a frame from the toolbar', async () => {
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
    await user.click(screen.getByRole('button', { name: '成 Frame' }))

    const frame = screen.getByRole('group', { name: 'Frame 节点' })

    expect(screen.getByRole('listitem', { name: 'Frame' })).toBeInTheDocument()
    expect(within(frame).getByLabelText('矩形图层')).toBeInTheDocument()
    expect(within(frame).getByRole('button', { name: '按钮' })).toBeInTheDocument()
    expect(screen.getByText('已选中 1 个节点')).toBeInTheDocument()
  })

  it('updates frame auto layout from the inspector and preview code', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByRole('button', { name: 'Frame' }))
    await user.click(screen.getByRole('group', { name: 'Frame 节点' }))
    await user.selectOptions(screen.getByLabelText('布局方向'), 'flex-row')
    await user.clear(screen.getByLabelText('间距'))
    await user.type(screen.getByLabelText('间距'), '32')
    await user.clear(screen.getByLabelText('内边距'))
    await user.type(screen.getByLabelText('内边距'), '32')
    await user.selectOptions(screen.getByLabelText('对齐方式'), 'center')
    await user.selectOptions(screen.getByLabelText('分布方式'), 'between')

    expect(screen.getByRole('group', { name: 'Frame 节点' })).toHaveStyle({
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'row',
      gap: '32px',
      justifyContent: 'space-between',
      padding: '32px',
    })
    await user.click(screen.getByRole('button', { name: 'src/components/Frame.tsx' }))
    expect(
      screen.getByText(/flex flex-row gap-8 p-8 items-center justify-between/),
    ).toBeInTheDocument()
  })
})
