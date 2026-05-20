import { exportToReactTailwind } from '../../domain/exporter/reactTailwindExporter'
import { useEditorStore } from '../../store/editorStore'

export function CodePreviewPanel() {
  const document = useEditorStore((state) => state.document)
  const code = exportToReactTailwind(document)

  return (
    <section className="mt-6">
      <h3 className="mb-2 text-sm font-semibold text-stone-800">代码预览</h3>
      <pre className="max-h-72 overflow-auto rounded-xl bg-stone-950 p-4 text-xs text-stone-100">
        <code>{code}</code>
      </pre>
    </section>
  )
}
