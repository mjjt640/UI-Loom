import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { createEmptyDocument } from '../../src/domain/model/factories'
import { EditorScreen } from '../../src/features/editor/EditorScreen'
import { useEditorStore } from '../../src/store/editorStore'

describe('alignment flow', () => {
  beforeEach(() => {
    localStorage.clear()
    useEditorStore.setState({ document: createEmptyDocument('Alignment Test') })
  })

  it('multi-selects layers and aligns them left from the toolbar', async () => {
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
    await user.click(screen.getByText('左对齐'))

    expect(screen.getByLabelText('矩形图层')).toHaveStyle({ left: '40px' })
    expect(screen.getByRole('button', { name: '按钮' })).toHaveStyle({
      left: '40px',
    })
    expect(screen.getByText('已选中 2 个节点')).toBeInTheDocument()
  })

  it('distributes three selected layers horizontally', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByText('矩形'))
    await user.click(screen.getByText('新增图片'))
    await user.click(screen.getByText('新增容器'))
    await user.click(
      within(screen.getByRole('listitem', { name: 'Rectangle' })).getByLabelText(
        '多选 Rectangle',
      ),
    )
    await user.click(
      within(screen.getByRole('listitem', { name: 'Image' })).getByLabelText(
        '多选 Image',
      ),
    )
    await user.click(
      within(screen.getByRole('listitem', { name: 'Container' })).getByLabelText(
        '多选 Container',
      ),
    )
    await user.click(screen.getByText('水平分布'))

    expect(screen.getByLabelText('矩形图层')).toHaveStyle({ left: '40px' })
    expect(screen.getByRole('button', { name: '图片描述' })).toHaveStyle({
      left: '180px',
    })
    expect(screen.getByLabelText('容器节点')).toHaveStyle({ left: '320px' })
  })
})
