import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { createEmptyDocument } from '../../src/domain/model/factories'
import { EditorScreen } from '../../src/features/editor/EditorScreen'
import { useEditorStore } from '../../src/store/editorStore'

describe('responsive layout flow', () => {
  beforeEach(() => {
    localStorage.clear()
    useEditorStore.setState({
      document: createEmptyDocument('Responsive Layout Flow Test'),
    })
  })

  it('edits responsive sizing and constraints from the inspector', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByRole('button', { name: 'Frame' }))
    await user.click(screen.getByRole('group', { name: 'Frame 节点' }))
    await user.selectOptions(screen.getByLabelText('宽度模式'), 'fill')
    await user.selectOptions(screen.getByLabelText('高度模式'), 'hug')
    await user.clear(screen.getByLabelText('最小宽度'))
    await user.type(screen.getByLabelText('最小宽度'), '360')
    await user.clear(screen.getByLabelText('最大宽度'))
    await user.type(screen.getByLabelText('最大宽度'), '1080')
    await user.selectOptions(screen.getByLabelText('水平约束'), 'center')
    await user.selectOptions(screen.getByLabelText('垂直约束'), 'top')

    expect(screen.getByRole('group', { name: 'Frame 节点' })).toHaveStyle({
      height: 'auto',
      left: '50%',
      maxWidth: '1080px',
      minWidth: '360px',
      top: '120px',
      transform: 'translateX(-50%)',
      width: '100%',
    })

    const preview = screen.getByRole('region', { name: '代码预览' })
    expect(within(preview).getByText(/w-full h-auto/)).toBeInTheDocument()
    expect(within(preview).getByText(/min-w-\[360px\]/)).toBeInTheDocument()
    expect(
      within(preview).getByText(/absolute left-1\/2 -translate-x-1\/2 top-\[120px\]/),
    ).toBeInTheDocument()
  })
})
