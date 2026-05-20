import { useEditorStore } from '../../../store/editorStore'
import { CanvasNode } from './CanvasNode'

export function CanvasViewport() {
  const document = useEditorStore((state) => state.document)
  const selectNode = useEditorStore((state) => state.selectNode)
  const updateSelectedNodeLayout = useEditorStore(
    (state) => state.updateSelectedNodeLayout,
  )

  return (
    <div className="relative h-full overflow-auto rounded-xl border border-stone-200 bg-white shadow-sm">
      <div className="relative mx-auto mt-8 h-[900px] w-[1440px] bg-white">
        {document.nodes[document.rootNodeId].children
          .map((nodeId) => document.nodes[nodeId])
          .filter(Boolean)
          .map((node) => (
            <CanvasNode
              key={node.id}
              document={document}
              node={node}
              onDragNode={(layout) => updateSelectedNodeLayout(layout)}
              onSelect={selectNode}
              selected={document.selectedNodeIds.includes(node.id)}
            />
          ))}
      </div>
    </div>
  )
}
