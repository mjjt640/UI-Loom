import { useEditorStore } from '../../../store/editorStore'

export function Toolbar() {
  const addTextNode = useEditorStore((state) => state.addTextNode)

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
        type="button"
      >
        导出 React
      </button>
    </header>
  )
}
