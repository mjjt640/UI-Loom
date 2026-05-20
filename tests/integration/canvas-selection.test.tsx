import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { EditorScreen } from '../../src/features/editor/EditorScreen'

describe('canvas selection', () => {
  it('selects a text node when clicked', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)
    await user.click(screen.getByText('新增文本'))
    await user.click(screen.getByText('新文本'))
    expect(screen.getByText('已选中 1 个节点')).toBeInTheDocument()
  })
})
