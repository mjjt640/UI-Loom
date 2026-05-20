import { useMemo, useState } from 'react'
import type { PageDocument, UINode } from '../../../domain/model/types'
import { useEditorStore } from '../../../store/editorStore'
import { CanvasNode } from './CanvasNode'

interface Point {
  x: number
  y: number
}

interface Box {
  left: number
  top: number
  right: number
  bottom: number
}

type CanvasBoundedNode = UINode & {
  layout: UINode['layout'] & {
    height: number
    width: number
    x: number
    y: number
  }
}

function selectionBox(start: Point, end: Point): Box {
  return {
    bottom: Math.max(start.y, end.y),
    left: Math.min(start.x, end.x),
    right: Math.max(start.x, end.x),
    top: Math.min(start.y, end.y),
  }
}

function hasCanvasBounds(node: UINode): node is CanvasBoundedNode {
  return (
    node.layout.mode === 'absolute' &&
    typeof node.layout.x === 'number' &&
    typeof node.layout.y === 'number' &&
    typeof node.layout.width === 'number' &&
    typeof node.layout.height === 'number'
  )
}

function nodeBox(node: CanvasBoundedNode): Box {
  return {
    bottom: node.layout.y + node.layout.height,
    left: node.layout.x,
    right: node.layout.x + node.layout.width,
    top: node.layout.y,
  }
}

function boxesIntersect(first: Box, second: Box) {
  return (
    first.left <= second.right &&
    first.right >= second.left &&
    first.top <= second.bottom &&
    first.bottom >= second.top
  )
}

function rootChildNodes(document: PageDocument) {
  return document.nodes[document.rootNodeId].children.map((nodeId) => {
    const node = document.nodes[nodeId]

    if (!node) {
      throw new Error(`Root child node not found: ${nodeId}`)
    }

    return node
  })
}

export function CanvasViewport() {
  const [marquee, setMarquee] = useState<{ current: Point; start: Point } | null>(
    null,
  )
  const document = useEditorStore((state) => state.document)
  const selectNode = useEditorStore((state) => state.selectNode)
  const selectNodesByIds = useEditorStore((state) => state.selectNodesByIds)
  const updateSelectedNodeLayout = useEditorStore(
    (state) => state.updateSelectedNodeLayout,
  )
  const rootChildren = useMemo(
    () =>
      rootChildNodes(document).filter((node) => node.meta.visible !== false),
    [document],
  )
  const visibleMarquee = marquee ? selectionBox(marquee.start, marquee.current) : null
  const marqueeStyle = visibleMarquee
    ? {
        height: visibleMarquee.bottom - visibleMarquee.top,
        left: visibleMarquee.left,
        top: visibleMarquee.top,
        width: visibleMarquee.right - visibleMarquee.left,
      }
    : undefined

  const pointFromCanvas = (
    event: Pick<React.PointerEvent<HTMLDivElement>, 'clientX' | 'clientY'>,
    canvas: HTMLDivElement,
  ): Point => {
    const rect = canvas.getBoundingClientRect()

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }

  const selectedNodesInBox = (box: Box) => {
    const currentDocument = useEditorStore.getState().document

    return rootChildNodes(currentDocument)
      .filter((node) => node.meta.visible !== false)
      .filter((node) => !node.meta.locked)
      .filter(hasCanvasBounds)
      .filter((node) => boxesIntersect(nodeBox(node), box))
      .map((node) => node.id)
  }

  const startMarqueeSelection = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return
    }

    event.preventDefault()

    const canvas = event.currentTarget
    const start = pointFromCanvas(event, canvas)

    canvas.setPointerCapture?.(event.pointerId)
    setMarquee({ current: start, start })

    const handlePointerMove = (moveEvent: PointerEvent) => {
      setMarquee({
        current: pointFromCanvas(moveEvent, canvas),
        start,
      })
    }
    const handlePointerUp = (upEvent: PointerEvent) => {
      const box = selectionBox(start, pointFromCanvas(upEvent, canvas))
      const selectedNodeIds = selectedNodesInBox(box)

      selectNodesByIds(selectedNodeIds)
      setMarquee(null)
      canvas.releasePointerCapture?.(event.pointerId)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
  }

  return (
    <div className="relative h-full overflow-auto rounded-xl border border-stone-200 bg-white shadow-sm">
      <div
        aria-label="设计画布"
        className="relative mx-auto mt-8 h-[900px] w-[1440px] touch-none bg-white"
        onPointerDown={startMarqueeSelection}
        role="application"
      >
        {rootChildren.map((node) => (
          <CanvasNode
            key={node.id}
            document={document}
            node={node}
            onDragNode={(layout) => updateSelectedNodeLayout(layout)}
            onSelect={selectNode}
            selected={document.selectedNodeIds.includes(node.id)}
          />
        ))}
        {marqueeStyle ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute border border-sky-500 bg-sky-400/10"
            style={marqueeStyle}
          />
        ) : null}
      </div>
    </div>
  )
}
