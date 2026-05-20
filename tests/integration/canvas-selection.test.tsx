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
})
