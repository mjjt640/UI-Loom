import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { createEmptyDocument } from '../../src/domain/model/factories'
import { EditorScreen } from '../../src/features/editor/EditorScreen'
import { useEditorStore } from '../../src/store/editorStore'

describe('component semantics flow', () => {
  beforeEach(() => {
    localStorage.clear()
    useEditorStore.setState({
      document: createEmptyDocument('Component Semantics Flow Test'),
    })
  })

  it('edits frame semantic naming and drives component file names', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByRole('button', { name: 'Frame' }))
    await user.click(screen.getByRole('group', { name: 'Frame 节点' }))
    await user.clear(screen.getByLabelText('图层名称'))
    await user.type(screen.getByLabelText('图层名称'), 'Hero Block')
    await user.clear(screen.getByLabelText('组件标识'))
    await user.type(screen.getByLabelText('组件标识'), 'hero-section')

    expect(screen.getByRole('listitem', { name: 'Hero Block' })).toBeInTheDocument()

    const preview = screen.getByRole('region', { name: '代码预览' })
    expect(
      within(preview).getByRole('button', { name: 'src/components/HeroSection.tsx' }),
    ).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('导出格式'), 'vue3-sfc')

    expect(
      within(preview).getByRole('button', { name: 'components/HeroSection.vue' }),
    ).toBeInTheDocument()
  })
})
