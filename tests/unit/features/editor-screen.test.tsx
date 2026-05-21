import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { createEmptyDocument } from '../../../src/domain/model/factories'
import { EditorScreen } from '../../../src/features/editor/EditorScreen'
import { useEditorStore } from '../../../src/store/editorStore'

describe('EditorScreen', () => {
  beforeEach(() => {
    localStorage.clear()
    useEditorStore.setState({ document: createEmptyDocument('Test Page') })
  })

  it('renders toolbar and panels', () => {
    render(<EditorScreen />)
    expect(screen.getByText('图层')).toBeInTheDocument()
    expect(screen.getByText('属性')).toBeInTheDocument()
    expect(screen.getByLabelText('导出格式')).toBeInTheDocument()
    expect(screen.getByText('导出代码')).toBeInTheDocument()
  })

  it('asks for an export format before starting a new project', async () => {
    const user = userEvent.setup()

    render(<EditorScreen />)

    expect(screen.getByRole('dialog', { name: '选择项目导出格式' }))
      .toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '选择 Vue 3 SFC' }))

    expect(screen.queryByRole('dialog', { name: '选择项目导出格式' }))
      .not.toBeInTheDocument()
    expect(screen.getByLabelText('导出格式')).toHaveValue('vue3-sfc')
    expect(localStorage.getItem('ui-loom.project.exportTargetId'))
      .toBe('vue3-sfc')
  })

  it('loads the previously selected export format without asking again', () => {
    localStorage.setItem('ui-loom.project.exportTargetId', 'vue3-sfc')

    render(<EditorScreen />)

    expect(screen.queryByRole('dialog', { name: '选择项目导出格式' }))
      .not.toBeInTheDocument()
    expect(screen.getByLabelText('导出格式')).toHaveValue('vue3-sfc')
  })
})
