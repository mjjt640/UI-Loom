import { useEditorStore } from '../../../store/editorStore'
import { CodePreviewPanel } from '../../preview/CodePreviewPanel'

export function InspectorPanel() {
  const document = useEditorStore((state) => state.document)
  const updateSelectedNodeContent = useEditorStore(
    (state) => state.updateSelectedNodeContent,
  )
  const selectedNodeId = document.selectedNodeIds[0]
  const selectedNode = selectedNodeId ? document.nodes[selectedNodeId] : null
  const selectedCount = document.selectedNodeIds.length

  return (
    <aside className="border-l border-stone-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-stone-800">属性</h2>
      {selectedCount > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-stone-500">已选中 {selectedCount} 个节点</p>
          {selectedNode?.type === 'text' ? (
            <label className="flex flex-col gap-2 text-sm text-stone-600">
              <span>文本内容</span>
              <input
                className="rounded-md border border-stone-300 px-3 py-2"
                onChange={(event) =>
                  updateSelectedNodeContent({ text: event.target.value })
                }
                value={selectedNode.content.text ?? ''}
              />
            </label>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-stone-500">选择节点后编辑内容与样式。</p>
      )}
      <CodePreviewPanel />
    </aside>
  )
}
