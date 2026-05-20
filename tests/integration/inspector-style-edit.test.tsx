import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { createEmptyDocument } from '../../src/domain/model/factories'
import { EditorScreen } from '../../src/features/editor/EditorScreen'
import { useEditorStore } from '../../src/store/editorStore'

describe('inspector style edit', () => {
  beforeEach(() => {
    localStorage.clear()
    useEditorStore.setState({ document: createEmptyDocument('Test Page') })
  })

  it('updates text content from inspector', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)
    await user.click(screen.getByText('新增文本'))
    await user.click(screen.getByText('新文本'))
    const input = screen.getByLabelText('文本内容')
    await user.clear(input)
    await user.type(input, '登录')
    expect(screen.getByText('登录')).toBeInTheDocument()
  })
})
