import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { createEmptyDocument } from '../../src/domain/model/factories'
import { EditorScreen } from '../../src/features/editor/EditorScreen'
import { useEditorStore } from '../../src/store/editorStore'

describe('advanced graphic properties flow', () => {
  beforeEach(() => {
    localStorage.clear()
    useEditorStore.setState({
      document: createEmptyDocument('Advanced Graphic Flow Test'),
    })
  })

  it('edits rect graphic properties from the inspector and updates canvas and export preview', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByText('矩形'))
    await user.click(screen.getByLabelText('矩形图层'))
    await user.clear(screen.getByLabelText('背景颜色'))
    await user.type(screen.getByLabelText('背景颜色'), '#f97316')
    await user.clear(screen.getByLabelText('边框宽度'))
    await user.type(screen.getByLabelText('边框宽度'), '3')
    await user.clear(screen.getByLabelText('边框颜色'))
    await user.type(screen.getByLabelText('边框颜色'), '#0f172a')
    await user.clear(screen.getByLabelText('圆角'))
    await user.type(screen.getByLabelText('圆角'), '14')
    await user.clear(screen.getByLabelText('阴影'))
    await user.type(
      screen.getByLabelText('阴影'),
      '0 18px 40px rgba(15, 23, 42, 0.24)',
    )
    await user.clear(screen.getByLabelText('透明度'))
    await user.type(screen.getByLabelText('透明度'), '0.72')

    expect(screen.getByLabelText('矩形图层')).toHaveStyle({
      background: '#f97316',
      borderColor: '#0f172a',
      borderRadius: '14px',
      borderWidth: '3px',
      boxShadow: '0 18px 40px rgba(15, 23, 42, 0.24)',
      opacity: '0.72',
    })

    const preview = screen.getByRole('region', { name: '代码预览' })
    expect(
      within(preview).getByText(/rounded-\[14px\].*bg-\[#f97316\]/),
    ).toBeInTheDocument()
    expect(within(preview).getByText(/border-\[3px\]/)).toBeInTheDocument()
    expect(within(preview).getByText(/opacity-\[0.72\]/)).toBeInTheDocument()
  })
})
