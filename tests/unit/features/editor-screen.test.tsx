import { render, screen } from '@testing-library/react'
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
})
