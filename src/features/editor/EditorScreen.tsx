import { useState } from 'react'
import type { ExportTargetId } from '../../domain/exporter/exportTypes'
import type { UINode } from '../../domain/model/types'
import type { RemixIconResource } from '../../domain/resources/remixIconLibrary'
import { useEditorStore } from '../../store/editorStore'
import { CanvasViewport } from './canvas/CanvasViewport'
import { InspectorPanel } from './inspector/InspectorPanel'
import { LayersPanel } from './layers/LayersPanel'
import { DesignToolbar } from './toolbar/DesignToolbar'
import { Toolbar } from './toolbar/Toolbar'

export type EditorToolMode =
  | 'select'
  | 'hand'
  | 'scale'
  | 'artboard'
  | 'frame'
  | 'rect'
  | 'ellipse'
  | 'triangle'
  | 'star'
  | 'polygon'
  | 'slice'
  | 'image'
  | 'pen'
  | 'pencil'
  | 'text'
  | 'brush'
  | 'button'
  | 'container'
  | 'component-card'
  | 'component-input'
  | 'component-list'
  | 'element-plus-button'
  | 'element-plus-input'
  | 'element-plus-card'
  | 'element-plus-table'
  | 'resource-icon'
  | 'resource'
  | 'zoom'

type EditorSidePanel = 'artboard' | 'components' | 'layers' | 'resources'
const projectExportTargetStorageKey = 'ui-loom.project.exportTargetId'

function isExportTargetId(value: string | null): value is ExportTargetId {
  return (
    value === 'html-css-js' ||
    value === 'single-file-html' ||
    value === 'vue3-sfc' ||
    value === 'react-tailwind'
  )
}

function readStoredExportTargetId(): ExportTargetId | null {
  if (typeof window === 'undefined') {
    return null
  }

  const value = window.localStorage.getItem(projectExportTargetStorageKey)

  return isExportTargetId(value) ? value : null
}

function writeStoredExportTargetId(targetId: ExportTargetId) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(projectExportTargetStorageKey, targetId)
}

function numericCanvasSize(rootNode: UINode) {
  return {
    height: typeof rootNode.layout.height === 'number' ? rootNode.layout.height : 900,
    width: typeof rootNode.layout.width === 'number' ? rootNode.layout.width : 1440,
  }
}

export function EditorScreen() {
  const storedExportTargetId = readStoredExportTargetId()
  const [exportTargetId, setExportTargetId] = useState<ExportTargetId>(
    storedExportTargetId ?? 'react-tailwind',
  )
  const [needsExportTargetChoice, setNeedsExportTargetChoice] = useState(
    storedExportTargetId === null,
  )
  const [toolMode, setToolMode] = useState<EditorToolMode>('select')
  const [sidePanel, setSidePanel] = useState<EditorSidePanel>('layers')
  const [selectedResourceIcon, setSelectedResourceIcon] =
    useState<RemixIconResource | null>(null)
  const document = useEditorStore((state) => state.document)
  const rootNode = document.nodes[document.rootNodeId]
  const canvasSize = numericCanvasSize(rootNode)
  const changeToolMode = (nextToolMode: EditorToolMode) => {
    setToolMode(nextToolMode)

    if (nextToolMode === 'artboard') {
      setSidePanel('artboard')
    } else if (
      nextToolMode === 'component-card' ||
      nextToolMode === 'component-input' ||
      nextToolMode === 'component-list' ||
      nextToolMode === 'element-plus-button' ||
      nextToolMode === 'element-plus-input' ||
      nextToolMode === 'element-plus-card' ||
      nextToolMode === 'element-plus-table'
    ) {
      setSidePanel('components')
    } else if (nextToolMode === 'resource' || nextToolMode === 'resource-icon') {
      setSidePanel('resources')
    } else {
      setSidePanel('layers')
    }
  }

  const chooseResourceIcon = (icon: RemixIconResource) => {
    setSelectedResourceIcon(icon)
    changeToolMode('resource-icon')
  }
  const changeExportTarget = (targetId: ExportTargetId) => {
    setExportTargetId(targetId)
    writeStoredExportTargetId(targetId)
    setNeedsExportTargetChoice(false)
  }

  return (
    <div className="flex h-screen flex-col bg-[#f4f4f4] text-neutral-900">
      <Toolbar
        exportTargetId={exportTargetId}
        onExportTargetChange={changeExportTarget}
      />
      <div className="grid min-h-0 flex-1 grid-cols-[52px_292px_minmax(0,1fr)_292px]">
        <DesignToolbar toolMode={toolMode} onToolModeChange={changeToolMode} />
        <LayersPanel
          activePanel={sidePanel}
          exportTargetId={exportTargetId}
          onPanelChange={setSidePanel}
          onResourceIconSelect={chooseResourceIcon}
          onToolModeChange={changeToolMode}
        />
        <main className="min-w-0 bg-[#f1f1f1]">
          <CanvasViewport
            canvasSize={canvasSize}
            onNodeInserted={() => setSidePanel('layers')}
            resourceIcon={selectedResourceIcon}
            onToolModeChange={changeToolMode}
            toolMode={toolMode}
          />
        </main>
        <InspectorPanel exportTargetId={exportTargetId} />
      </div>
      {needsExportTargetChoice ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-6">
          <section
            aria-label="选择项目导出格式"
            className="w-full max-w-2xl rounded-lg border border-[#d9dde5] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.25)]"
            role="dialog"
          >
            <p className="text-xs font-semibold text-[#1677ff]">
              新项目设置
            </p>
            <h1 className="mt-2 text-xl font-semibold text-[#1f2329]">
              选择项目导出格式
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#6b7280]">
              导出格式会决定可用组件库。选择 Vue 3 SFC 后会解锁 Element Plus 组件。
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                aria-label="选择 React + Tailwind"
                className="rounded-md border border-[#d9dde5] bg-white p-4 text-left hover:border-[#1677ff] hover:bg-[#f4f9ff]"
                onClick={() => changeExportTarget('react-tailwind')}
                type="button"
              >
                <span className="block text-sm font-semibold text-[#1f2329]">
                  选择 React + Tailwind
                </span>
                <span className="mt-1 block text-xs leading-5 text-[#6b7280]">
                  继续使用当前 React 导出链路。
                </span>
              </button>
              <button
                aria-label="选择 Vue 3 SFC"
                className="rounded-md border border-[#1677ff] bg-[#f4f9ff] p-4 text-left hover:bg-[#e8f2ff]"
                onClick={() => changeExportTarget('vue3-sfc')}
                type="button"
              >
                <span className="block text-sm font-semibold text-[#1f2329]">
                  选择 Vue 3 SFC
                </span>
                <span className="mt-1 block text-xs leading-5 text-[#6b7280]">
                  解锁 Element Plus，并导出 Vue 单文件组件。
                </span>
              </button>
              <button
                aria-label="选择 HTML + CSS + JS"
                className="rounded-md border border-[#d9dde5] bg-white p-4 text-left hover:border-[#1677ff] hover:bg-[#f4f9ff]"
                onClick={() => changeExportTarget('html-css-js')}
                type="button"
              >
                <span className="block text-sm font-semibold text-[#1f2329]">
                  选择 HTML + CSS + JS
                </span>
                <span className="mt-1 block text-xs leading-5 text-[#6b7280]">
                  导出可拆分的原生网页文件。
                </span>
              </button>
              <button
                aria-label="选择单文件 HTML"
                className="rounded-md border border-[#d9dde5] bg-white p-4 text-left hover:border-[#1677ff] hover:bg-[#f4f9ff]"
                onClick={() => changeExportTarget('single-file-html')}
                type="button"
              >
                <span className="block text-sm font-semibold text-[#1f2329]">
                  选择单文件 HTML
                </span>
                <span className="mt-1 block text-xs leading-5 text-[#6b7280]">
                  导出一个可直接打开的 HTML 文件。
                </span>
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}
