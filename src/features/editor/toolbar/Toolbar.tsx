import { useEditorStore } from '../../../store/editorStore'

export function Toolbar() {
  const addTextNode = useEditorStore((state) => state.addTextNode)
  const addButtonNode = useEditorStore((state) => state.addButtonNode)
  const addImageNode = useEditorStore((state) => state.addImageNode)
  const addContainerNode = useEditorStore((state) => state.addContainerNode)
  const deleteSelectedNode = useEditorStore((state) => state.deleteSelectedNode)
  const selectedCount = useEditorStore(
    (state) => state.document.selectedNodeIds.length,
  )

  return (
    <header className="flex items-center gap-2 border-b border-stone-200 bg-white px-4 py-3">
      <button
        className="rounded-md bg-stone-900 px-3 py-2 text-sm text-white"
        onClick={addTextNode}
        type="button"
      >
        新增文本
      </button>
      <button
        className="rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-700"
        onClick={addButtonNode}
        type="button"
      >
        新增按钮
      </button>
      <button
        className="rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-700"
        onClick={addImageNode}
        type="button"
      >
        新增图片
      </button>
      <button
        className="rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-700"
        onClick={addContainerNode}
        type="button"
      >
        新增容器
      </button>
      <button
        className="rounded-md border border-rose-200 px-3 py-2 text-sm text-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={selectedCount === 0}
        onClick={deleteSelectedNode}
        type="button"
      >
        删除节点
      </button>
      <button
        className="rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-700"
        type="button"
      >
        导出 React
      </button>
    </header>
  )
}
