import { CanvasViewport } from './canvas/CanvasViewport'
import { InspectorPanel } from './inspector/InspectorPanel'
import { LayersPanel } from './layers/LayersPanel'
import { Toolbar } from './toolbar/Toolbar'

export function EditorScreen() {
  return (
    <div className="flex h-screen flex-col bg-stone-100">
      <Toolbar />
      <div className="grid min-h-0 flex-1 grid-cols-[260px_1fr_320px]">
        <LayersPanel />
        <main className="min-w-0 bg-stone-50 p-4">
          <CanvasViewport />
        </main>
        <InspectorPanel />
      </div>
    </div>
  )
}
