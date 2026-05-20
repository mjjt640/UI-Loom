import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEmptyDocument } from '../../src/domain/model/factories'
import { EditorScreen } from '../../src/features/editor/EditorScreen'
import { useEditorStore } from '../../src/store/editorStore'

describe('export target flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    useEditorStore.setState({ document: createEmptyDocument('Export Target Test') })
  })

  it('exports the selected Vue 3 target as a vue file', async () => {
    const user = userEvent.setup()
    let exportedBlob: Blob | undefined
    let downloadedFilename = ''
    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
      if (blob instanceof Blob) {
        exportedBlob = blob
      }

      return 'blob:vue-export'
    })
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
      function click(this: HTMLAnchorElement) {
        downloadedFilename = this.download
      },
    )

    render(<EditorScreen />)
    await user.click(screen.getByText('新增按钮'))
    await user.selectOptions(screen.getByLabelText('导出格式'), 'vue3-sfc')
    await user.click(screen.getByText('导出代码'))

    expect(downloadedFilename).toBe('GeneratedPage.vue')

    if (!(exportedBlob instanceof Blob)) {
      throw new Error('Expected Vue export to create a Blob')
    }

    await expect(exportedBlob.text()).resolves.toContain('<template>')
    await expect(exportedBlob.text()).resolves.toContain('按钮')
  })

  it('exports HTML CSS JS as separate generated files', async () => {
    const user = userEvent.setup()
    const downloadedFilenames: string[] = []
    vi.spyOn(URL, 'createObjectURL').mockImplementation(() => 'blob:file-export')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
      function click(this: HTMLAnchorElement) {
        downloadedFilenames.push(this.download)
      },
    )

    render(<EditorScreen />)
    await user.click(screen.getByText('新增按钮'))
    await user.selectOptions(screen.getByLabelText('导出格式'), 'html-css-js')
    await user.click(screen.getByText('导出代码'))

    expect(downloadedFilenames).toEqual(['index.html', 'styles.css', 'script.js'])
  })
})
