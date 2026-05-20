import { useState } from 'react'
import type { ExportTargetId } from '../../domain/exporter/exportTypes'
import { CanvasViewport } from './canvas/CanvasViewport'
import { InspectorPanel } from './inspector/InspectorPanel'
import { LayersPanel } from './layers/LayersPanel'
import { Toolbar } from './toolbar/Toolbar'

export function EditorScreen() {
  const [exportTargetId, setExportTargetId] =
    useState<ExportTargetId>('react-tailwind')

  return (
    <div className="flex h-screen flex-col bg-stone-100">
      <Toolbar
        exportTargetId={exportTargetId}
        onExportTargetChange={setExportTargetId}
      />
      <div className="grid min-h-0 flex-1 grid-cols-[260px_1fr_320px]">
        <LayersPanel />
        <main className="min-w-0 bg-stone-50 p-4">
          <CanvasViewport />
        </main>
        <InspectorPanel exportTargetId={exportTargetId} />
      </div>
    </div>
  )
}
