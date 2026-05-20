import { createExportBundle } from '../../../domain/exporter/exportBundleFactory'
import { exportTargets } from '../../../domain/exporter/exportRegistry'
import type { ExportTargetId } from '../../../domain/exporter/exportTypes'
import { downloadExportBundle } from '../../../platform/file-system/browserDownloadAdapter'
import { useEditorStore } from '../../../store/editorStore'

interface ToolbarProps {
  exportTargetId: ExportTargetId
  onExportTargetChange: (targetId: ExportTargetId) => void
}

export function Toolbar({
  exportTargetId,
  onExportTargetChange,
}: ToolbarProps) {
  const document = useEditorStore((state) => state.document)
  const alignSelectedNodesLeft = useEditorStore(
    (state) => state.alignSelectedNodesLeft,
  )
  const addTextNode = useEditorStore((state) => state.addTextNode)
  const addButtonNode = useEditorStore((state) => state.addButtonNode)
  const addImageNode = useEditorStore((state) => state.addImageNode)
  const addContainerNode = useEditorStore((state) => state.addContainerNode)
  const addFrameNode = useEditorStore((state) => state.addFrameNode)
  const addRectNode = useEditorStore((state) => state.addRectNode)
  const deleteSelectedNode = useEditorStore((state) => state.deleteSelectedNode)
  const distributeSelectedNodesHorizontally = useEditorStore(
    (state) => state.distributeSelectedNodesHorizontally,
  )
  const groupSelectedNodes = useEditorStore((state) => state.groupSelectedNodes)
  const frameSelectedNodes = useEditorStore((state) => state.frameSelectedNodes)
  const selectedNodeId = document.selectedNodeIds[0]
  const selectedNode = selectedNodeId ? document.nodes[selectedNodeId] : null
  const ungroupSelectedNode = useEditorStore((state) => state.ungroupSelectedNode)
  const selectedCount = useEditorStore(
    (state) => state.document.selectedNodeIds.length,
  )
  const exportSelectedTarget = () => {
    downloadExportBundle(createExportBundle(document, exportTargetId))
  }

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
        className="rounded-md border border-sky-300 px-3 py-2 text-sm text-sky-700"
        onClick={addRectNode}
        type="button"
      >
        矩形
      </button>
      <button
        className="rounded-md border border-amber-300 px-3 py-2 text-sm text-amber-700"
        onClick={addFrameNode}
        type="button"
      >
        Frame
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
        className="rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-700 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={selectedCount < 2}
        onClick={alignSelectedNodesLeft}
        type="button"
      >
        左对齐
      </button>
      <button
        className="rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-700 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={selectedCount < 3}
        onClick={distributeSelectedNodesHorizontally}
        type="button"
      >
        水平分布
      </button>
      <button
        className="rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-700 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={selectedCount < 2}
        onClick={groupSelectedNodes}
        type="button"
      >
        组合
      </button>
      <button
        className="rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-700 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={selectedCount < 2}
        onClick={frameSelectedNodes}
        type="button"
      >
        成 Frame
      </button>
      <button
        className="rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-700 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={selectedNode?.type !== 'group'}
        onClick={ungroupSelectedNode}
        type="button"
      >
        取消组合
      </button>
      <label className="ml-auto flex items-center gap-2 text-sm text-stone-600">
        <span>导出格式</span>
        <select
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700"
          onChange={(event) =>
            onExportTargetChange(event.target.value as ExportTargetId)
          }
          value={exportTargetId}
        >
          {exportTargets.map((target) => (
            <option key={target.id} value={target.id}>
              {target.label}
            </option>
          ))}
        </select>
      </label>
      <button
        className="rounded-md border border-stone-900 bg-stone-900 px-3 py-2 text-sm text-white"
        onClick={exportSelectedTarget}
        type="button"
      >
        导出代码
      </button>
    </header>
  )
}
