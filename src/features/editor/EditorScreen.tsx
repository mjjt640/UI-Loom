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
  | 'resource-icon'
  | 'resource'
  | 'zoom'

type EditorSidePanel = 'artboard' | 'components' | 'layers' | 'resources'

function numericCanvasSize(rootNode: UINode) {
  return {
    height: typeof rootNode.layout.height === 'number' ? rootNode.layout.height : 900,
    width: typeof rootNode.layout.width === 'number' ? rootNode.layout.width : 1440,
  }
}

export function EditorScreen() {
  const [exportTargetId, setExportTargetId] =
    useState<ExportTargetId>('react-tailwind')
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
      nextToolMode === 'component-list'
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

  return (
    <div className="flex h-screen flex-col bg-[#f4f4f4] text-neutral-900">
      <Toolbar
        exportTargetId={exportTargetId}
        onExportTargetChange={setExportTargetId}
      />
      <div className="grid min-h-0 flex-1 grid-cols-[52px_292px_minmax(0,1fr)_292px]">
        <DesignToolbar toolMode={toolMode} onToolModeChange={changeToolMode} />
        <LayersPanel
          activePanel={sidePanel}
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
    </div>
  )
}
