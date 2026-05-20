import { useEditorStore } from '../../../store/editorStore'
import { CanvasNode } from './CanvasNode'

export function CanvasViewport() {
  const document = useEditorStore((state) => state.document)
  const selectNode = useEditorStore((state) => state.selectNode)

  return (
    <div className="relative h-full overflow-auto rounded-xl border border-stone-200 bg-white shadow-sm">
      <div className="relative mx-auto mt-8 h-[900px] w-[1440px] bg-white">
        {Object.values(document.nodes)
          .filter((node) => node.type !== 'page')
          .map((node) => (
            <CanvasNode
              key={node.id}
              node={node}
              onSelect={() => selectNode(node.id)}
              selected={document.selectedNodeIds.includes(node.id)}
            />
          ))}
      </div>
    </div>
  )
}
