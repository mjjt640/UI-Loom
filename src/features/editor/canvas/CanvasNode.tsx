import type { LayoutProps, PageDocument, UINode } from '../../../domain/model/types'

interface CanvasNodeProps {
  document: PageDocument
  node: UINode
  onDragNode: (layout: Partial<LayoutProps>) => void
  selected: boolean
  onSelect: (nodeId: string) => void
}

function assertNumericSize(node: UINode) {
  if (
    typeof node.layout.width !== 'number' ||
    typeof node.layout.height !== 'number'
  ) {
    throw new Error(`Node ${node.id} does not have numeric size`)
  }

  return {
    width: node.layout.width,
    height: node.layout.height,
  }
}

function assertNumericPosition(node: UINode) {
  if (typeof node.layout.x !== 'number' || typeof node.layout.y !== 'number') {
    throw new Error(`Node ${node.id} does not have numeric position`)
  }

  return {
    x: node.layout.x,
    y: node.layout.y,
  }
}

function flexStyle(node: UINode) {
  if (node.layout.mode === 'absolute' || node.type === 'group') {
    return {}
  }

  return {
    alignItems:
      node.layout.align === 'center'
        ? 'center'
        : node.layout.align === 'end'
          ? 'flex-end'
          : node.layout.align === 'stretch'
            ? 'stretch'
            : 'flex-start',
    display: 'flex',
    flexDirection: node.layout.mode === 'flex-row' ? 'row' : 'column',
    gap: node.layout.gap,
    justifyContent:
      node.layout.justify === 'center'
        ? 'center'
        : node.layout.justify === 'end'
          ? 'flex-end'
          : node.layout.justify === 'between'
            ? 'space-between'
            : 'flex-start',
    padding: node.layout.padding?.top,
  } as const
}

export function CanvasNode({
  document,
  node,
  onDragNode,
  selected,
  onSelect,
}: CanvasNodeProps) {
  const selectionClass = selected ? 'outline outline-2 outline-sky-500' : ''
  const canInteract = !node.meta.locked && node.meta.visible !== false
  const canDrag =
    canInteract &&
    node.parentId === document.rootNodeId &&
    node.layout.mode === 'absolute'
  const absoluteStyle = {
    cursor: canDrag ? 'grab' : undefined,
    height: node.layout.height === 'hug' ? undefined : node.layout.height,
    left: node.layout.x,
    position: node.parentId === document.rootNodeId ? 'absolute' : undefined,
    top: node.layout.y,
    width: node.layout.width === 'hug' ? undefined : node.layout.width,
  } as const
  const startDrag = (event: React.PointerEvent<HTMLElement>) => {
    if (!canDrag) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    onSelect(node.id)

    const target = event.currentTarget
    const startClientX = event.clientX
    const startClientY = event.clientY
    const startPosition = assertNumericPosition(node)

    target.setPointerCapture?.(event.pointerId)

    const handlePointerMove = (moveEvent: PointerEvent) => {
      onDragNode({
        x: startPosition.x + moveEvent.clientX - startClientX,
        y: startPosition.y + moveEvent.clientY - startClientY,
      })
    }
    const handlePointerUp = () => {
      target.releasePointerCapture?.(event.pointerId)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
  }
  const canResize =
    canInteract &&
    selected &&
    node.layout.mode === 'absolute' &&
    typeof node.layout.width === 'number' &&
    typeof node.layout.height === 'number'
  const startResize = (event: React.PointerEvent<HTMLSpanElement>) => {
    if (!canResize) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    onSelect(node.id)

    const target = event.currentTarget
    const startClientX = event.clientX
    const startClientY = event.clientY
    const startSize = assertNumericSize(node)

    target.setPointerCapture?.(event.pointerId)

    const handlePointerMove = (moveEvent: PointerEvent) => {
      onDragNode({
        width: Math.max(8, startSize.width + moveEvent.clientX - startClientX),
        height: Math.max(8, startSize.height + moveEvent.clientY - startClientY),
      })
    }
    const handlePointerUp = () => {
      target.releasePointerCapture?.(event.pointerId)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
  }
  const resizeHandle = canResize ? (
    <span
      aria-label="调整右下尺寸"
      className="absolute -bottom-1.5 -right-1.5 h-3 w-3 cursor-se-resize rounded-full border border-white bg-sky-500"
      onPointerDown={startResize}
      role="slider"
      tabIndex={0}
    />
  ) : null
  const selectCurrentNode = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    if (canInteract) {
      onSelect(node.id)
    }
  }

  if (node.type === 'text') {
    return (
      <button
        className={`text-left ${selectionClass}`}
        onClick={selectCurrentNode}
        onPointerDown={startDrag}
        style={{
          ...absoluteStyle,
          color: node.style.color,
          fontSize: node.style.fontSize,
          fontWeight: node.style.fontWeight,
        }}
        type="button"
      >
        {node.content.text}
        {resizeHandle}
      </button>
    )
  }

  if (node.type === 'button') {
    return (
      <button
        className={selectionClass}
        onClick={selectCurrentNode}
        onPointerDown={startDrag}
        style={{
          ...absoluteStyle,
          background: node.style.background,
          borderRadius: node.style.radius,
          color: node.style.color,
          fontSize: node.style.fontSize,
          fontWeight: node.style.fontWeight,
        }}
        type="button"
      >
        {node.content.text}
        {resizeHandle}
      </button>
    )
  }

  if (node.type === 'image') {
    return (
      <button
        aria-label={node.content.alt ?? '图片描述'}
        className={`absolute block overflow-hidden bg-stone-100 ${selectionClass}`}
        onClick={selectCurrentNode}
        onPointerDown={startDrag}
        style={{
          ...absoluteStyle,
          borderRadius: node.style.radius,
        }}
        type="button"
      >
        {node.content.src ? (
          <img
            alt={node.content.alt ?? ''}
            className="h-full w-full object-cover"
            src={node.content.src}
          />
        ) : null}
        {resizeHandle}
      </button>
    )
  }

  if (node.type === 'rect') {
    return (
      <button
        aria-label="矩形图层"
        className={`block ${selectionClass}`}
        onClick={selectCurrentNode}
        onPointerDown={startDrag}
        style={{
          ...absoluteStyle,
          background: node.style.background,
          borderColor: node.style.borderColor,
          borderRadius: node.style.radius,
          borderWidth: node.style.borderWidth,
        }}
        type="button"
      >
        {resizeHandle}
      </button>
    )
  }

  if (node.type === 'container' || node.type === 'group' || node.type === 'frame') {
    const nodeLabel =
      node.type === 'group'
        ? '图层组'
        : node.type === 'frame'
          ? 'Frame 节点'
          : '容器节点'
    const emptyLabel = node.type === 'frame' ? 'Frame' : '容器'

    return (
      <div
        aria-label={nodeLabel}
        className={
          node.type === 'group'
            ? `text-sm text-stone-500 ${selectionClass}`
            : `border text-sm text-stone-500 ${selectionClass}`
        }
        onClick={selectCurrentNode}
        onPointerDown={startDrag}
        role="group"
        style={{
          ...absoluteStyle,
          background: node.style.background,
          borderColor: node.style.borderColor,
          borderRadius: node.style.radius,
          borderWidth: node.style.borderWidth,
          ...flexStyle(node),
        }}
      >
        {resizeHandle}
        {node.children.length === 0 ? (
          <span className="self-center">{emptyLabel}</span>
        ) : (
          node.children
            .map((childId) => document.nodes[childId])
            .filter(Boolean)
            .filter((childNode) => childNode.meta.visible !== false)
            .map((childNode) => (
              <CanvasNode
                key={childNode.id}
                document={document}
                node={childNode}
                onDragNode={onDragNode}
                onSelect={onSelect}
                selected={document.selectedNodeIds.includes(childNode.id)}
              />
            ))
        )}
      </div>
    )
  }

  if (node.type === 'page') {
    throw new Error('Page nodes are rendered by CanvasViewport')
  }

  throw new Error(`Canvas does not support node type: ${node.type}`)
}
