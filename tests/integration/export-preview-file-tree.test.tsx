import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { createEmptyDocument } from '../../src/domain/model/factories'
import { EditorScreen } from '../../src/features/editor/EditorScreen'
import { useEditorStore } from '../../src/store/editorStore'
import { addButton, addContainer, addFrame } from './editorTestActions'

describe('export preview file tree', () => {
  beforeEach(() => {
    localStorage.clear()
    useEditorStore.setState({
      document: createEmptyDocument('Export Preview File Tree Test'),
    })
  })

  it('shows the selected export target files and active file content', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await addFrame(user)

    const preview = screen.getByRole('region', { name: '代码预览' })

    expect(within(preview).getByRole('button', { name: 'src/GeneratedPage.tsx' }))
      .toBeInTheDocument()
    expect(within(preview).getByRole('button', { name: 'src/components/Frame.tsx' }))
      .toBeInTheDocument()
    expect(within(preview).getByRole('button', { name: 'README.md' }))
      .toBeInTheDocument()

    await user.click(
      within(preview).getByRole('button', { name: 'src/components/Frame.tsx' }),
    )

    expect(within(preview).getByText(/export function Frame/)).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('导出格式'), 'vue3-sfc')

    expect(within(preview).getByRole('button', { name: 'GeneratedPage.vue' }))
      .toBeInTheDocument()
    expect(within(preview).getByRole('button', { name: 'components/Frame.vue' }))
      .toBeInTheDocument()
  })

  it('switches the active preview file to the selected node mapping', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await addContainer(user)
    await addButton(user)
    await user.click(screen.getByRole('button', { name: '按钮' }))
    await user.click(screen.getByRole('button', { name: '移入容器' }))

    const preview = screen.getByRole('region', { name: '代码预览' })

    expect(
      within(preview).getByRole('button', { name: 'src/components/Container.tsx' }),
    ).toHaveClass('bg-stone-900')
    expect(within(preview).getByText(/data-ui-node-id=/)).toBeInTheDocument()
  })
})
