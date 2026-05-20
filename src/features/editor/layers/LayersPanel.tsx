import { useEditorStore } from '../../../store/editorStore'

export function LayersPanel() {
  const document = useEditorStore((state) => state.document)
  const selectNode = useEditorStore((state) => state.selectNode)

  return (
    <aside className="border-r border-stone-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-stone-800">图层</h2>
      <ul className="space-y-2 text-sm text-stone-600">
        {Object.values(document.nodes).map((node) => (
          <li key={node.id}>
            <button
              className={
                document.selectedNodeIds.includes(node.id)
                  ? 'w-full rounded-md bg-sky-50 px-2 py-1 text-left text-sky-700'
                  : 'w-full rounded-md px-2 py-1 text-left hover:bg-stone-100'
              }
              onClick={() => selectNode(node.id)}
              type="button"
            >
              {node.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
