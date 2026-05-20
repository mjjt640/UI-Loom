import { useEditorStore } from '../../../store/editorStore'

export function LayersPanel() {
  const document = useEditorStore((state) => state.document)
  const moveLayerBackward = useEditorStore((state) => state.moveLayerBackward)
  const moveLayerForward = useEditorStore((state) => state.moveLayerForward)
  const selectNode = useEditorStore((state) => state.selectNode)
  const setLayerLocked = useEditorStore((state) => state.setLayerLocked)
  const setLayerVisible = useEditorStore((state) => state.setLayerVisible)
  const toggleNodeSelection = useEditorStore((state) => state.toggleNodeSelection)
  const rootNode = document.nodes[document.rootNodeId]
  const orderedNodes = [
    rootNode,
    ...rootNode.children.map((nodeId) => document.nodes[nodeId]),
  ]

  return (
    <aside className="border-r border-stone-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-stone-800">图层</h2>
      <ul className="space-y-2 text-sm text-stone-600">
        {orderedNodes.map((node) => (
          <li
            aria-label={node.name}
            className="rounded-lg border border-transparent"
            key={node.id}
          >
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
              {node.meta.visible === false ? ' · 隐藏' : ''}
              {node.meta.locked ? ' · 锁定' : ''}
            </button>
            {node.id !== document.rootNodeId ? (
              <div className="mt-1 grid grid-cols-4 gap-1 px-1 pb-1">
                <button
                  aria-label={`多选 ${node.name}`}
                  className="rounded border border-stone-200 px-1 py-0.5 text-xs"
                  onClick={() => toggleNodeSelection(node.id)}
                  type="button"
                >
                  多
                </button>
                <button
                  aria-label={`隐藏 ${node.name}`}
                  className="rounded border border-stone-200 px-1 py-0.5 text-xs"
                  hidden={node.meta.visible === false}
                  onClick={() => setLayerVisible(node.id, false)}
                  type="button"
                >
                  隐
                </button>
                <button
                  aria-label={`显示 ${node.name}`}
                  className="rounded border border-stone-200 px-1 py-0.5 text-xs"
                  hidden={node.meta.visible !== false}
                  onClick={() => setLayerVisible(node.id, true)}
                  type="button"
                >
                  显
                </button>
                <button
                  aria-label={`锁定 ${node.name}`}
                  className="rounded border border-stone-200 px-1 py-0.5 text-xs"
                  hidden={node.meta.locked === true}
                  onClick={() => setLayerLocked(node.id, true)}
                  type="button"
                >
                  锁
                </button>
                <button
                  aria-label={`解锁 ${node.name}`}
                  className="rounded border border-stone-200 px-1 py-0.5 text-xs"
                  hidden={node.meta.locked !== true}
                  onClick={() => setLayerLocked(node.id, false)}
                  type="button"
                >
                  解
                </button>
                <button
                  aria-label={`上移 ${node.name}`}
                  className="rounded border border-stone-200 px-1 py-0.5 text-xs"
                  onClick={() => moveLayerForward(node.id)}
                  type="button"
                >
                  上
                </button>
                <button
                  aria-label={`下移 ${node.name}`}
                  className="rounded border border-stone-200 px-1 py-0.5 text-xs"
                  onClick={() => moveLayerBackward(node.id)}
                  type="button"
                >
                  下
                </button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </aside>
  )
}
