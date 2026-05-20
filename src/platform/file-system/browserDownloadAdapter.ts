import type { ExportBundle, GeneratedFile } from '../../domain/exporter/exportTypes'

function fileNameFromPath(path: string) {
  const [fileName] = path.split('/').slice(-1)

  if (!fileName) {
    throw new Error(`Generated file path is invalid: ${path}`)
  }

  return fileName
}

function downloadGeneratedFile(file: GeneratedFile) {
  const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = fileNameFromPath(file.path)
  anchor.click()
  URL.revokeObjectURL(url)
}

export function downloadExportBundle(bundle: ExportBundle) {
  bundle.files.forEach((file) => downloadGeneratedFile(file))
}
