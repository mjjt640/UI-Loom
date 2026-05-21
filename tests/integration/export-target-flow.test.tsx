import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEmptyDocument } from '../../src/domain/model/factories'
import { EditorScreen } from '../../src/features/editor/EditorScreen'
import { useEditorStore } from '../../src/store/editorStore'
import {
  addButton,
  addIcon,
  addPath,
  addPolygon,
  addSlice,
} from './editorTestActions'

describe('export target flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    useEditorStore.setState({ document: createEmptyDocument('Export Target Test') })
  })

  it('exports the selected Vue 3 target as a vue file', async () => {
    const user = userEvent.setup()
    const exportedBlobs: Blob[] = []
    const downloadedFilenames: string[] = []
    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
      if (blob instanceof Blob) {
        exportedBlobs.push(blob)
      }

      return 'blob:vue-export'
    })
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
      function click(this: HTMLAnchorElement) {
        downloadedFilenames.push(this.download)
      },
    )

    render(<EditorScreen />)
    await addButton(user)
    await user.selectOptions(screen.getByLabelText('导出格式'), 'vue3-sfc')
    await user.click(screen.getByText('导出代码'))

    expect(downloadedFilenames).toEqual(['GeneratedPage.vue', 'README.md'])

    const [exportedBlob] = exportedBlobs

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
    await addButton(user)
    await user.selectOptions(screen.getByLabelText('导出格式'), 'html-css-js')
    await user.click(screen.getByText('导出代码'))

    expect(downloadedFilenames).toEqual(['index.html', 'styles.css', 'script.js'])
  })

  it('exports vector, slice, and resource icon nodes as generated code files', async () => {
    const user = userEvent.setup()
    const exportedBlobs: Blob[] = []
    const downloadedFilenames: string[] = []
    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
      if (blob instanceof Blob) {
        exportedBlobs.push(blob)
      }

      return 'blob:vector-export'
    })
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
      function click(this: HTMLAnchorElement) {
        downloadedFilenames.push(this.download)
      },
    )

    render(<EditorScreen />)
    await addPath(user)
    await addPolygon(user)
    await addSlice(user)
    await addIcon(user, 'align-right')
    await user.selectOptions(screen.getByLabelText('导出格式'), 'html-css-js')
    await user.click(screen.getByText('导出代码'))

    expect(downloadedFilenames).toEqual(['index.html', 'styles.css', 'script.js'])

    const [indexHtmlBlob, stylesBlob] = exportedBlobs

    if (!(indexHtmlBlob instanceof Blob) || !(stylesBlob instanceof Blob)) {
      throw new Error('Expected vector export to create HTML and CSS blobs')
    }

    await expect(indexHtmlBlob.text()).resolves.toContain('<svg')
    await expect(indexHtmlBlob.text()).resolves.toContain('路径图层')
    await expect(indexHtmlBlob.text()).resolves.toContain('多边形图层')
    await expect(indexHtmlBlob.text()).resolves.toContain('切片图层')
    await expect(indexHtmlBlob.text()).resolves.toContain('align-right 图标')
    await expect(stylesBlob.text()).resolves.toContain('border-style: dashed;')
  })
})
