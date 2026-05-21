import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createButtonNode,
  createCardNode,
  createContainerNode,
  createEllipseNode,
  createFrameNode,
  createIconNode,
  createImageNode,
  createInputNode,
  createListNode,
  createPathNode,
  createPolygonNode,
  createRectNode,
  createSliceNode,
  createStarNode,
  createTextNode,
  createTriangleNode,
} from '../../../domain/commands/editorCommands'
import type {
  LayoutProps,
  PageDocument,
  PathNodePoint,
  UINode,
} from '../../../domain/model/types'
import { useEditorStore } from '../../../store/editorStore'
import type { RemixIconResource } from '../../../domain/resources/remixIconLibrary'
import type { EditorToolMode } from '../EditorScreen'
import { CanvasNode } from './CanvasNode'

interface Point {
  x: number
  y: number
}

interface PenNode {
  anchor: Point
  inHandle?: Point
  outHandle?: Point
}

type PathEditMode = 'select' | 'curve' | 'node' | 'scissors' | 'fill'

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

const horizontalTicks = [-600, -550, -500, -450, -400, -350, -300, -250, -200, -150, -100, -50, 0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500]
const verticalTicks = [-600, -550, -500, -450, -400, -350, -300, -250, -200, -150, -100, -50, 0, 50, 100, 150, 200, 250]

interface CanvasViewportProps {
  canvasSize: {
    height: number
    width: number
  }
  onNodeInserted?: () => void
  onToolModeChange: (toolMode: EditorToolMode) => void
  resourceIcon: RemixIconResource | null
  toolMode: EditorToolMode
}

type CreateGesture =
  | {
      current: Point
      start: Point
      type: 'box'
    }
  | {
      current: Point
      points: Point[]
      start: Point
      type: 'path'
    }

const MIN_DRAW_SIZE = 8
const HANDLE_DRAW_THRESHOLD = 4

const pathEditTools: Array<{
  icon: string
  label: string
  mode: PathEditMode
}> = [
  { icon: '↖', label: '选择节点', mode: 'select' },
  { icon: '✒', label: '曲线工具', mode: 'curve' },
  { icon: '⌁', label: '节点编辑', mode: 'node' },
  { icon: '✂', label: '剪刀工具', mode: 'scissors' },
  { icon: '◇', label: '填充工具', mode: 'fill' },
]

function boxToAbsoluteLayout(box: Box): LayoutProps {
  return {
    mode: 'absolute',
    x: box.left,
    y: box.top,
    width: box.right - box.left,
    height: box.bottom - box.top,
  }
}

function frameLayout(layout: LayoutProps): LayoutProps {
  return {
    ...layout,
    mode: 'flex-column',
    gap: 16,
    padding: { top: 24, right: 24, bottom: 24, left: 24 },
    align: 'stretch',
    justify: 'start',
  }
}

function containerLayout(layout: LayoutProps): LayoutProps {
  return {
    ...layout,
    mode: 'flex-column',
    gap: 12,
    padding: { top: 16, right: 16, bottom: 16, left: 16 },
  }
}

function isDrawingTool(toolMode: EditorToolMode) {
  return toolMode === 'pencil'
}

function isInsertionTool(toolMode: EditorToolMode) {
  return (
    toolMode === 'frame' ||
    toolMode === 'rect' ||
    toolMode === 'ellipse' ||
    toolMode === 'triangle' ||
    toolMode === 'star' ||
    toolMode === 'polygon' ||
    toolMode === 'slice' ||
    toolMode === 'image' ||
    toolMode === 'text' ||
    toolMode === 'button' ||
    toolMode === 'container' ||
    toolMode === 'component-card' ||
    toolMode === 'component-input' ||
    toolMode === 'component-list' ||
    toolMode === 'resource-icon' ||
    isDrawingTool(toolMode)
  )
}

function createNodeForTool(
  toolMode: EditorToolMode,
  layout: LayoutProps,
  resourceIcon: RemixIconResource | null,
) {
  if (toolMode === 'frame') {
    return createFrameNode({ layout: frameLayout(layout) })
  }
  if (toolMode === 'rect') {
    return createRectNode({ layout })
  }
  if (toolMode === 'ellipse') {
    return createEllipseNode({ layout })
  }
  if (toolMode === 'triangle') {
    return createTriangleNode({ layout })
  }
  if (toolMode === 'star') {
    return createStarNode({ layout })
  }
  if (toolMode === 'polygon') {
    return createPolygonNode({ layout })
  }
  if (toolMode === 'slice') {
    return createSliceNode({ layout })
  }
  if (toolMode === 'image') {
    return createImageNode({ alt: '图片描述', layout, src: '' })
  }
  if (toolMode === 'text') {
    return createTextNode({ layout, text: '新文本' })
  }
  if (toolMode === 'button') {
    return createButtonNode({ layout, text: '按钮' })
  }
  if (toolMode === 'container') {
    return createContainerNode({ layout: containerLayout(layout) })
  }
  if (toolMode === 'component-card') {
    return createCardNode({ layout })
  }
  if (toolMode === 'component-input') {
    return createInputNode({ layout, placeholder: 'Email address' })
  }
  if (toolMode === 'component-list') {
    return createListNode({ layout })
  }
  if (toolMode === 'resource-icon') {
    if (!resourceIcon) {
      throw new Error('Resource icon insertion requires a selected icon')
    }

    return createIconNode({
      layout,
      name: resourceIcon.name,
      svgPath: resourceIcon.svgPath,
      viewBox: resourceIcon.viewBox,
    })
  }

  throw new Error(`Unsupported canvas insertion tool: ${toolMode}`)
}

function pointsToPath(points: Point[], box: Box, smooth = false) {
  const normalizedPoints = points.map((point) => ({
    x: Math.round(point.x - box.left),
    y: Math.round(point.y - box.top),
  }))

  return pointsToSvgPath(normalizedPoints, smooth)
}

function pointsToSvgPath(points: Point[], smooth = false) {
  if (points.length === 0) {
    return ''
  }

  if (!smooth || points.length < 3) {
    return points
      .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`)
      .join(' ')
  }

  const [firstPoint, ...restPoints] = points
  const segments = [`M${firstPoint.x} ${firstPoint.y}`]

  for (let index = 0; index < restPoints.length - 1; index += 1) {
    const current = restPoints[index]
    const next = restPoints[index + 1]
    const midPoint = {
      x: Math.round((current.x + next.x) / 2),
      y: Math.round((current.y + next.y) / 2),
    }

    segments.push(`Q${current.x} ${current.y} ${midPoint.x} ${midPoint.y}`)
  }

  const lastPoint = restPoints[restPoints.length - 1]
  segments.push(`L${lastPoint.x} ${lastPoint.y}`)

  return segments.join(' ')
}

function pointsToCanvasPath(points: Point[], smooth = false) {
  return pointsToSvgPath(points, smooth)
}

function penNodesToSvgPath(nodes: PenNode[]) {
  if (nodes.length === 0) {
    return ''
  }

  const [firstNode, ...restNodes] = nodes
  const segments = [`M${firstNode.anchor.x} ${firstNode.anchor.y}`]
  let previousNode = firstNode

  restNodes.forEach((node) => {
    if (previousNode.outHandle || node.inHandle) {
      const firstHandle = previousNode.outHandle ?? previousNode.anchor
      const secondHandle = node.inHandle ?? node.anchor
      segments.push(
        `C${firstHandle.x} ${firstHandle.y} ${secondHandle.x} ${secondHandle.y} ${node.anchor.x} ${node.anchor.y}`,
      )
    } else {
      segments.push(`L${node.anchor.x} ${node.anchor.y}`)
    }

    previousNode = node
  })

  return segments.join(' ')
}

function penNodesToPath(nodes: PenNode[], box: Box) {
  const normalizePoint = (point: Point) => ({
    x: Math.round(point.x - box.left),
    y: Math.round(point.y - box.top),
  })

  return penNodesToSvgPath(
    nodes.map((node) => ({
      anchor: normalizePoint(node.anchor),
      inHandle: node.inHandle ? normalizePoint(node.inHandle) : undefined,
      outHandle: node.outHandle ? normalizePoint(node.outHandle) : undefined,
    })),
  )
}

function penNodesToPathNodes(nodes: PenNode[], box: Box): PathNodePoint[] {
  const width = Math.max(1, box.right - box.left)
  const height = Math.max(1, box.bottom - box.top)
  const normalizePoint = (point: Point) => ({
    x: Math.round(((point.x - box.left) / width) * 100),
    y: Math.round(((point.y - box.top) / height) * 100),
  })

  return nodes.map((node) => ({
    anchor: normalizePoint(node.anchor),
    inHandle: node.inHandle ? normalizePoint(node.inHandle) : undefined,
    outHandle: node.outHandle ? normalizePoint(node.outHandle) : undefined,
  }))
}

function penNodePoints(nodes: PenNode[]) {
  return nodes.flatMap((node) => [
    node.anchor,
    ...(node.inHandle ? [node.inHandle] : []),
    ...(node.outHandle ? [node.outHandle] : []),
  ])
}

function expandedPathBox(box: Box): Box {
  return {
    ...box,
    bottom:
      box.bottom - box.top < MIN_DRAW_SIZE ? box.top + MIN_DRAW_SIZE : box.bottom,
    right:
      box.right - box.left < MIN_DRAW_SIZE ? box.left + MIN_DRAW_SIZE : box.right,
  }
}

function isTextEditingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  )
}

function PathEditingToolbar({
  activeMode,
  onExit,
  onModeChange,
}: {
  activeMode: PathEditMode
  onExit: () => void
  onModeChange: (mode: PathEditMode) => void
}) {
  return (
    <div
      aria-label="路径编辑工具栏"
      className="absolute left-1/2 top-10 z-30 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-[#cfd7e5] bg-white/95 px-1.5 py-1 shadow-[0_12px_30px_rgba(15,23,42,0.16)] backdrop-blur"
      role="toolbar"
    >
      {pathEditTools.map((tool) => {
        const active = activeMode === tool.mode

        return (
          <button
            aria-label={tool.label}
            aria-pressed={active}
            className={
              active
                ? 'flex h-8 w-8 items-center justify-center rounded-lg bg-[#1677ff] text-sm font-semibold text-white shadow-[0_6px_16px_rgba(22,119,255,0.3)]'
                : 'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold text-[#364152] hover:bg-[#edf4ff] hover:text-[#1677ff]'
            }
            key={tool.mode}
            onClick={() => onModeChange(tool.mode)}
            type="button"
          >
            {tool.icon}
          </button>
        )
      })}
      <span className="mx-1 h-5 w-px bg-[#d9dee8]" />
      <button
        aria-label="退出编辑"
        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#364152] hover:bg-[#f3f6fb]"
        onClick={onExit}
        type="button"
      >
        退出编辑
      </button>
    </div>
  )
}

export function CanvasViewport({
  canvasSize,
  onNodeInserted,
  onToolModeChange,
  resourceIcon,
  toolMode,
}: CanvasViewportProps) {
  const [marquee, setMarquee] = useState<{ current: Point; start: Point } | null>(
    null,
  )
  const [createGesture, setCreateGesture] = useState<CreateGesture | null>(null)
  const [penNodes, setPenNodes] = useState<PenNode[]>([])
  const [activePenDrag, setActivePenDrag] = useState<PenNode | null>(null)
  const [penHoverPoint, setPenHoverPoint] = useState<Point | null>(null)
  const [pathEditMode, setPathEditMode] = useState<PathEditMode>('curve')
  const [canvasOffset, setCanvasOffset] = useState<Point>({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const document = useEditorStore((state) => state.document)
  const deleteSelectedNode = useEditorStore((state) => state.deleteSelectedNode)
  const insertNode = useEditorStore((state) => state.insertNode)
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
  const selectedPathNode = document.selectedNodeIds
    .map((nodeId) => document.nodes[nodeId])
    .find((node) => node?.type === 'path')
  const shouldShowPathToolbar =
    toolMode === 'pen' || selectedPathNode?.type === 'path'
  const visibleMarquee = marquee ? selectionBox(marquee.start, marquee.current) : null
  const visibleCreateBox =
    createGesture?.type === 'box'
      ? selectionBox(createGesture.start, createGesture.current)
      : null
  const marqueeStyle = visibleMarquee
    ? {
        height: visibleMarquee.bottom - visibleMarquee.top,
        left: visibleMarquee.left,
        top: visibleMarquee.top,
        width: visibleMarquee.right - visibleMarquee.left,
      }
    : undefined
  const createPreviewStyle = visibleCreateBox
    ? {
        height: visibleCreateBox.bottom - visibleCreateBox.top,
        left: visibleCreateBox.left,
        top: visibleCreateBox.top,
        width: visibleCreateBox.right - visibleCreateBox.left,
      }
    : undefined
  const pencilPreviewPath =
    createGesture?.type === 'path'
      ? pointsToCanvasPath(createGesture.points, true)
      : null
  const activePenNodes = toolMode === 'pen' ? penNodes : []
  const penPreviewNodes =
    activePenDrag && toolMode === 'pen'
      ? [...activePenNodes, activePenDrag]
      : activePenNodes
  const penPreviewPath = penNodesToSvgPath(penPreviewNodes)
  const penPreviewSegment =
    toolMode === 'pen' && penNodes.length > 0 && penHoverPoint && !activePenDrag
      ? {
          end: penHoverPoint,
          start: penNodes[penNodes.length - 1].anchor,
        }
      : null

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

  const updatePenHoverPoint = (event: React.PointerEvent<HTMLDivElement>) => {
    if (toolMode !== 'pen' || penNodes.length === 0 || activePenDrag) {
      return
    }

    setPenHoverPoint(pointFromCanvas(event, event.currentTarget))
  }

  const clearPenHoverPoint = () => {
    setPenHoverPoint(null)
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

  const commitBoxInsertion = (box: Box) => {
    if (box.right - box.left < MIN_DRAW_SIZE || box.bottom - box.top < MIN_DRAW_SIZE) {
      return
    }

    insertNode(createNodeForTool(toolMode, boxToAbsoluteLayout(box), resourceIcon))
    onNodeInserted?.()
  }

  const commitPathInsertion = useCallback((points: Point[], smooth = false) => {
    if (points.length < 2) {
      return
    }

    const box = selectionBox(points[0], points[0])
    const pathBox = points.slice(1).reduce(
      (currentBox, point) => ({
        bottom: Math.max(currentBox.bottom, point.y),
        left: Math.min(currentBox.left, point.x),
        right: Math.max(currentBox.right, point.x),
        top: Math.min(currentBox.top, point.y),
      }),
      box,
    )

    if (Math.max(pathBox.right - pathBox.left, pathBox.bottom - pathBox.top) < MIN_DRAW_SIZE) {
      return
    }

    const layoutBox = expandedPathBox(pathBox)

    insertNode(
      createPathNode({
        layout: boxToAbsoluteLayout(layoutBox),
        pathData: pointsToPath(points, layoutBox, smooth),
      }),
    )
    onNodeInserted?.()
  }, [insertNode, onNodeInserted])

  const commitPenInsertion = useCallback((nodes: PenNode[]) => {
    if (nodes.length < 2) {
      return false
    }

    const allPoints = penNodePoints(nodes)
    const box = selectionBox(allPoints[0], allPoints[0])
    const pathBox = allPoints.slice(1).reduce(
      (currentBox, point) => ({
        bottom: Math.max(currentBox.bottom, point.y),
        left: Math.min(currentBox.left, point.x),
        right: Math.max(currentBox.right, point.x),
        top: Math.min(currentBox.top, point.y),
      }),
      box,
    )

    if (Math.max(pathBox.right - pathBox.left, pathBox.bottom - pathBox.top) < MIN_DRAW_SIZE) {
      return false
    }

    const layoutBox = expandedPathBox(pathBox)

    insertNode(
      createPathNode({
        layout: boxToAbsoluteLayout(layoutBox),
        pathData: penNodesToPath(nodes, layoutBox),
        pathNodes: penNodesToPathNodes(nodes, layoutBox),
      }),
    )
    onNodeInserted?.()
    return true
  }, [insertNode, onNodeInserted])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTextEditingTarget(event.target)) {
        return
      }

      if (toolMode === 'pen' && event.key === 'Escape') {
        event.preventDefault()
        const insertedPath = commitPenInsertion(penNodes)
        setPenNodes([])
        setActivePenDrag(null)
        setPenHoverPoint(null)
        if (insertedPath) {
          onToolModeChange('select')
        }
        return
      }

      if (event.key !== 'Delete' && event.key !== 'Backspace') {
        return
      }

      event.preventDefault()
      deleteSelectedNode()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [commitPenInsertion, deleteSelectedNode, onToolModeChange, penNodes, toolMode])

  const startCanvasInteraction = (event: React.PointerEvent<HTMLDivElement>) => {
    if (toolMode === 'hand') {
      if (event.button !== 0) {
        return
      }

      event.preventDefault()

      const canvas = event.currentTarget
      const startClientX = event.clientX
      const startClientY = event.clientY
      const startOffset = canvasOffset

      canvas.setPointerCapture?.(event.pointerId)
      setIsPanning(true)

      const handlePointerMove = (moveEvent: PointerEvent) => {
        setCanvasOffset({
          x: startOffset.x + moveEvent.clientX - startClientX,
          y: startOffset.y + moveEvent.clientY - startClientY,
        })
      }
      const handlePointerUp = () => {
        setIsPanning(false)
        canvas.releasePointerCapture?.(event.pointerId)
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
        window.removeEventListener('pointercancel', handlePointerUp)
      }

      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
      window.addEventListener('pointercancel', handlePointerUp)
      return
    }

    if (event.button !== 0) {
      return
    }

    event.preventDefault()

    const canvas = event.currentTarget
    const start = pointFromCanvas(event, canvas)

    canvas.setPointerCapture?.(event.pointerId)

    if (toolMode === 'pen') {
      setPenHoverPoint(null)
      const previousNode = penNodes.at(-1)
      const incomingHandle = previousNode?.outHandle
        ? {
            x: start.x - (previousNode.outHandle.x - previousNode.anchor.x),
            y: start.y - (previousNode.outHandle.y - previousNode.anchor.y),
          }
        : undefined
      const draftNode: PenNode = { anchor: start, inHandle: incomingHandle }
      setActivePenDrag(draftNode)

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const current = pointFromCanvas(moveEvent, canvas)
        const dragDistance = Math.hypot(current.x - start.x, current.y - start.y)
        const nextNode =
          dragDistance >= HANDLE_DRAW_THRESHOLD
            ? { anchor: start, inHandle: incomingHandle, outHandle: current }
            : { anchor: start, inHandle: incomingHandle }

        setActivePenDrag(nextNode)
      }
      const handlePointerUp = (upEvent: PointerEvent) => {
        const end = pointFromCanvas(upEvent, canvas)
        const dragDistance = Math.hypot(end.x - start.x, end.y - start.y)
        const committedNode =
          dragDistance >= HANDLE_DRAW_THRESHOLD
            ? { anchor: start, inHandle: incomingHandle, outHandle: end }
            : { anchor: start, inHandle: incomingHandle }

        setPenNodes((currentNodes) => [...currentNodes, committedNode])
        setActivePenDrag(null)
        setPenHoverPoint(end)
        canvas.releasePointerCapture?.(event.pointerId)
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
        window.removeEventListener('pointercancel', handlePointerUp)
      }

      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
      window.addEventListener('pointercancel', handlePointerUp)
      return
    }

    if (isDrawingTool(toolMode)) {
      const points = [start]
      setCreateGesture({ current: start, points: [start], start, type: 'path' })

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const current = pointFromCanvas(moveEvent, canvas)
        points.push(current)
        setCreateGesture({
          current,
          points: [...points],
          start,
          type: 'path',
        })
      }
      const handlePointerUp = () => {
        commitPathInsertion(points, true)
        setCreateGesture(null)
        canvas.releasePointerCapture?.(event.pointerId)
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
        window.removeEventListener('pointercancel', handlePointerUp)
      }

      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
      window.addEventListener('pointercancel', handlePointerUp)
      return
    }

    if (isInsertionTool(toolMode)) {
      setCreateGesture({ current: start, start, type: 'box' })

      const handlePointerMove = (moveEvent: PointerEvent) => {
        setCreateGesture({
          current: pointFromCanvas(moveEvent, canvas),
          start,
          type: 'box',
        })
      }
      const handlePointerUp = (upEvent: PointerEvent) => {
        commitBoxInsertion(selectionBox(start, pointFromCanvas(upEvent, canvas)))
        setCreateGesture(null)
        canvas.releasePointerCapture?.(event.pointerId)
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
        window.removeEventListener('pointercancel', handlePointerUp)
      }

      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
      window.addEventListener('pointercancel', handlePointerUp)
      return
    }

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
    <div className="relative h-full overflow-hidden bg-[#f3f3f3]">
      {shouldShowPathToolbar ? (
        <PathEditingToolbar
          activeMode={pathEditMode}
          onExit={() => {
            setPenNodes([])
            setActivePenDrag(null)
            setPenHoverPoint(null)
            onToolModeChange('select')
          }}
          onModeChange={setPathEditMode}
        />
      ) : null}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-8 border-b border-neutral-200 bg-[#f7f7f7] text-xs text-neutral-400">
        <div className="ml-16 flex h-full items-center gap-[39px]">
          {horizontalTicks.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 top-8 z-10 w-8 border-r border-neutral-200 bg-[#f7f7f7] text-xs text-neutral-400">
        <div className="flex origin-top-left translate-x-6 translate-y-3 rotate-90 gap-[39px] whitespace-nowrap">
          {verticalTicks.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
      </div>
      <div
        aria-label="设计画布"
        className={
          toolMode === 'hand'
            ? isPanning
              ? 'relative mx-auto mt-8 h-[900px] w-[1440px] cursor-grabbing touch-none bg-white'
              : 'relative mx-auto mt-8 h-[900px] w-[1440px] cursor-grab touch-none bg-white'
            : toolMode === 'scale'
              ? 'relative mx-auto mt-8 h-[900px] w-[1440px] cursor-nwse-resize touch-none bg-white'
              : 'relative mx-auto mt-8 h-[900px] w-[1440px] touch-none bg-white'
        }
        data-tool-mode={toolMode}
        onPointerLeave={clearPenHoverPoint}
        onPointerDown={startCanvasInteraction}
        onPointerMove={updatePenHoverPoint}
        role="application"
        style={{
          transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(1)`,
          height: canvasSize.height,
          width: canvasSize.width,
        }}
      >
        {rootChildren.map((node) => (
          <CanvasNode
            key={node.id}
            document={document}
            node={node}
            onDragNode={(layout) => updateSelectedNodeLayout(layout)}
            onSelect={selectNode}
            pathEditing={
              selectedPathNode?.id === node.id && shouldShowPathToolbar
            }
            proportionalResize={toolMode === 'scale'}
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
        {createPreviewStyle ? (
          <div
            aria-label="绘制区域预览"
            className="pointer-events-none absolute border border-[#1683ff] bg-[#1683ff]/10"
            style={createPreviewStyle}
          />
        ) : null}
        {pencilPreviewPath && createGesture?.type === 'path' ? (
          <svg
            aria-label="铅笔轨迹预览"
            className="pointer-events-none absolute inset-0 overflow-visible"
            viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
            preserveAspectRatio="none"
          >
            <path
              d={pencilPreviewPath}
              fill="none"
              stroke="#2563eb"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        ) : null}
        {penPreviewNodes.length > 0 ? (
          <svg
            aria-label="钢笔路径预览"
            className="pointer-events-none absolute inset-0 overflow-visible"
            viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
            preserveAspectRatio="none"
          >
            {penPreviewNodes.length > 1 ? (
              <path
                d={penPreviewPath}
                fill="none"
                stroke="#2563eb"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
            {penPreviewNodes.map((node, index) => (
              <g key={`${node.anchor.x}-${node.anchor.y}-${index}`}>
                {node.outHandle ? (
                  <g aria-label="钢笔控制柄预览">
                    <line
                      stroke="#9ca3af"
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                      x1={node.anchor.x}
                      x2={node.outHandle.x}
                      y1={node.anchor.y}
                      y2={node.outHandle.y}
                    />
                    <circle
                      cx={node.outHandle.x}
                      cy={node.outHandle.y}
                      fill="#ffffff"
                      r="4"
                      stroke="#1683ff"
                      strokeWidth="1.5"
                      vectorEffect="non-scaling-stroke"
                    />
                  </g>
                ) : null}
                <circle
                  aria-label="钢笔固定锚点"
                  cx={node.anchor.x}
                  cy={node.anchor.y}
                  fill={index === 0 ? '#1683ff' : '#ffffff'}
                  r="4"
                  stroke="#2563eb"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            ))}
            {penPreviewSegment ? (
              <g>
                <line
                  aria-label="钢笔预览线"
                  stroke="#1683ff"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                  x1={penPreviewSegment.start.x}
                  x2={penPreviewSegment.end.x}
                  y1={penPreviewSegment.start.y}
                  y2={penPreviewSegment.end.y}
                />
                <circle
                  aria-label="钢笔当前点预览"
                  cx={penPreviewSegment.end.x}
                  cy={penPreviewSegment.end.y}
                  fill="#ffffff"
                  r="5"
                  stroke="#1683ff"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            ) : null}
          </svg>
        ) : null}
      </div>
    </div>
  )
}
