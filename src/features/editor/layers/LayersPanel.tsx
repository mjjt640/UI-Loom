import { useEditorStore } from '../../../store/editorStore'

export function LayersPanel() {
  const document = useEditorStore((state) => state.document)

  return (
    <aside className="border-r border-stone-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-stone-800">图层</h2>
      <ul className="space-y-2 text-sm text-stone-600">
        {Object.values(document.nodes).map((node) => (
          <li key={node.id}>{node.name}</li>
        ))}
      </ul>
    </aside>
  )
}
