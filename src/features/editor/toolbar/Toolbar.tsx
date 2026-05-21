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
    <header className="flex h-12 items-center gap-3 border-b border-neutral-200 bg-white px-3 text-sm text-neutral-700">
      <button
        aria-label="主菜单"
        className="flex h-8 w-8 items-center justify-center rounded-md text-xl hover:bg-neutral-100"
        type="button"
      >
        ≡
      </button>
      <div className="flex items-center gap-2 border-r border-neutral-200 pr-5">
        <span className="text-neutral-500">个人文件 /</span>
        <button className="font-semibold text-neutral-900" type="button">
          {document.name || '无标题'}
        </button>
        <span className="text-neutral-500">⌄</span>
      </div>
      <button
        className="rounded-md px-2 py-1 font-medium text-neutral-800 hover:bg-neutral-100"
        type="button"
      >
        100%⌄
      </button>
      <button
        className="ml-3 rounded-md border border-neutral-200 px-2.5 py-1.5 text-xs text-neutral-600 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={selectedCount === 0}
        onClick={deleteSelectedNode}
        type="button"
      >
        删除
      </button>
      <button
        className="rounded-md border border-neutral-200 px-2.5 py-1.5 text-xs text-neutral-600 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={selectedCount < 2}
        onClick={alignSelectedNodesLeft}
        type="button"
      >
        左对齐
      </button>
      <button
        className="rounded-md border border-neutral-200 px-2.5 py-1.5 text-xs text-neutral-600 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={selectedCount < 3}
        onClick={distributeSelectedNodesHorizontally}
        type="button"
      >
        水平分布
      </button>
      <button
        className="rounded-md border border-neutral-200 px-2.5 py-1.5 text-xs text-neutral-600 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={selectedCount < 2}
        onClick={groupSelectedNodes}
        type="button"
      >
        组合
      </button>
      <button
        className="rounded-md border border-neutral-200 px-2.5 py-1.5 text-xs text-neutral-600 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={selectedCount < 2}
        onClick={frameSelectedNodes}
        type="button"
      >
        成 Frame
      </button>
      <button
        className="rounded-md border border-neutral-200 px-2.5 py-1.5 text-xs text-neutral-600 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={selectedNode?.type !== 'group'}
        onClick={ungroupSelectedNode}
        type="button"
      >
        取消组合
      </button>
      <label className="ml-auto flex items-center gap-2 text-xs text-neutral-500">
        <span>导出格式</span>
        <select
          className="rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-700"
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
        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c8a756] text-xs font-semibold text-white"
        type="button"
      >
        烟
      </button>
      <button
        className="rounded-lg bg-[#1683ff] px-4 py-1.5 font-semibold text-white"
        type="button"
      >
        分享
      </button>
      <button
        aria-label="预览"
        className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-900 hover:bg-neutral-100"
        type="button"
      >
        ▶
      </button>
      <button
        className="rounded-lg border border-neutral-200 px-3 py-1.5 font-semibold text-neutral-900"
        onClick={exportSelectedTarget}
        type="button"
      >
        导出代码
      </button>
    </header>
  )
}
