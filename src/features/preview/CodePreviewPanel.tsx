import { useState } from 'react'
import { createExportBundle } from '../../domain/exporter/exportBundleFactory'
import type { ExportTargetId, GeneratedFile } from '../../domain/exporter/exportTypes'
import { useEditorStore } from '../../store/editorStore'

interface CodePreviewPanelProps {
  exportTargetId: ExportTargetId
}

function firstFile(files: GeneratedFile[]) {
  const [file] = files

  if (!file) {
    throw new Error('Export bundle must contain at least one file')
  }

  return file
}

export function CodePreviewPanel({ exportTargetId }: CodePreviewPanelProps) {
  const [activePath, setActivePath] = useState<string | null>(null)
  const document = useEditorStore((state) => state.document)
  const bundle = createExportBundle(document, exportTargetId)
  const activeFile =
    bundle.files.find((file) => file.path === activePath) ?? firstFile(bundle.files)

  return (
    <section aria-label="代码预览" className="mt-6" role="region">
      <h3 className="mb-2 text-sm font-semibold text-stone-800">代码预览</h3>
      <div className="mb-3 max-h-32 space-y-1 overflow-auto rounded-xl border border-stone-200 p-2">
        {bundle.files.map((file) => (
          <button
            className={
              file.path === activeFile.path
                ? 'block w-full rounded-md bg-stone-900 px-2 py-1 text-left text-xs text-white'
                : 'block w-full rounded-md px-2 py-1 text-left text-xs text-stone-600 hover:bg-stone-100'
            }
            key={file.path}
            onClick={() => setActivePath(file.path)}
            type="button"
          >
            {file.path}
          </button>
        ))}
      </div>
      <pre className="max-h-72 overflow-auto rounded-xl bg-stone-950 p-4 text-xs text-stone-100">
        <code>{activeFile.content}</code>
      </pre>
    </section>
  )
}
