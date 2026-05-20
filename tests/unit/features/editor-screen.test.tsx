import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EditorScreen } from '../../../src/features/editor/EditorScreen'

describe('EditorScreen', () => {
  it('renders toolbar and panels', () => {
    render(<EditorScreen />)
    expect(screen.getByText('图层')).toBeInTheDocument()
    expect(screen.getByText('属性')).toBeInTheDocument()
    expect(screen.getByText('导出 React')).toBeInTheDocument()
  })
})
