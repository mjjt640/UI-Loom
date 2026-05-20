import { useEditorStore } from '../../../store/editorStore'

export function InspectorPanel() {
  const selectedCount = useEditorStore(
    (state) => state.document.selectedNodeIds.length,
  )

  return (
    <aside className="border-l border-stone-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-stone-800">属性</h2>
      {selectedCount > 0 ? (
        <p className="text-sm text-stone-500">已选中 {selectedCount} 个节点</p>
      ) : (
        <p className="text-sm text-stone-500">选择节点后编辑内容与样式。</p>
      )}
    </aside>
  )
}
