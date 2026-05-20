import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { createEmptyDocument } from '../../src/domain/model/factories'
import { EditorScreen } from '../../src/features/editor/EditorScreen'
import { useEditorStore } from '../../src/store/editorStore'

describe('basic node flow', () => {
  beforeEach(() => {
    localStorage.clear()
    useEditorStore.setState({ document: createEmptyDocument('Test Page') })
  })

  it('adds button, image, and container nodes from the toolbar', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByText('新增按钮'))
    await user.click(screen.getByText('新增图片'))
    await user.click(screen.getByText('新增容器'))

    expect(screen.getByRole('button', { name: '按钮' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '图片描述' })).toBeInTheDocument()
    expect(screen.getByText('容器')).toBeInTheDocument()
  })

  it('updates selected button and image content from inspector', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByText('新增按钮'))
    await user.click(screen.getByRole('button', { name: '按钮' }))
    await user.clear(screen.getByLabelText('按钮文本'))
    await user.type(screen.getByLabelText('按钮文本'), '注册')
    expect(screen.getByRole('button', { name: '注册' })).toBeInTheDocument()

    await user.click(screen.getByText('新增图片'))
    await user.click(screen.getByRole('img', { name: '图片描述' }))
    await user.clear(screen.getByLabelText('图片地址'))
    await user.type(screen.getByLabelText('图片地址'), 'https://example.com/card.png')
    const altInput = screen.getByDisplayValue('图片描述')
    await user.clear(altInput)
    await user.type(altInput, '产品截图')
    expect(screen.getByRole('img', { name: '产品截图' })).toHaveAttribute(
      'src',
      'https://example.com/card.png',
    )
  })

  it('deletes the selected node', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByText('新增按钮'))
    await user.click(screen.getByRole('button', { name: '按钮' }))
    await user.click(screen.getByText('删除节点'))

    expect(screen.queryByRole('button', { name: '按钮' })).not.toBeInTheDocument()
  })

  it('updates selected container styles from inspector', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByText('新增容器'))
    await user.click(screen.getByLabelText('容器节点'))
    await user.clear(screen.getByLabelText('背景颜色'))
    await user.type(screen.getByLabelText('背景颜色'), '#fef3c7')
    await user.clear(screen.getByLabelText('圆角'))
    await user.type(screen.getByLabelText('圆角'), '24')

    expect(screen.getByLabelText('容器节点')).toHaveStyle({
      backgroundColor: 'rgb(254, 243, 199)',
      borderRadius: '24px',
    })
  })
})
