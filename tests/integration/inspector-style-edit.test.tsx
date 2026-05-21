import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { createEmptyDocument } from '../../src/domain/model/factories'
import { EditorScreen } from '../../src/features/editor/EditorScreen'
import { useEditorStore } from '../../src/store/editorStore'
import { addRect, addText } from './editorTestActions'

describe('inspector style edit', () => {
  beforeEach(() => {
    localStorage.clear()
    useEditorStore.setState({ document: createEmptyDocument('Test Page') })
  })

  it('updates text content from inspector', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)
    await addText(user)
    await user.click(screen.getByText('新文本'))
    const input = screen.getByLabelText('文本内容')
    await user.clear(input)
    await user.type(input, '登录')
    expect(screen.getByText('登录')).toBeInTheDocument()
  })

  it('opens color palette from inspector and applies common colors', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await addRect(user)
    await user.click(screen.getByLabelText('矩形图层'))
    await user.click(
      screen.getByRole('button', { name: '打开背景颜色选择器' }),
    )

    const picker = screen.getByRole('dialog', { name: '背景颜色选择器' })

    expect(screen.getByLabelText('背景颜色色盘')).toBeInTheDocument()
    expect(picker).toHaveTextContent('常用')

    await user.click(
      screen.getByRole('button', { name: '常用颜色 品牌蓝 #1677ff' }),
    )

    expect(screen.getByLabelText('矩形图层')).toHaveStyle({
      background: '#1677ff',
    })

    await user.click(screen.getByRole('button', { name: '打开边框颜色选择器' }))

    expect(
      screen.getByRole('dialog', { name: '边框颜色选择器' }),
    ).toBeInTheDocument()
  })
})
