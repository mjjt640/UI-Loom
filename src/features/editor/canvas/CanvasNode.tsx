import type { LayoutProps, PageDocument, UINode } from '../../../domain/model/types'

interface CanvasNodeProps {
  document: PageDocument
  node: UINode
  onDragNode: (layout: Partial<LayoutProps>) => void
  selected: boolean
  onSelect: (nodeId: string) => void
}

function flexStyle(node: UINode) {
  if (node.layout.mode === 'absolute') {
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
  const canDrag = node.parentId === document.rootNodeId && node.layout.mode === 'absolute'
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
    const startX = node.layout.x ?? 0
    const startY = node.layout.y ?? 0

    target.setPointerCapture?.(event.pointerId)

    const handlePointerMove = (moveEvent: PointerEvent) => {
      onDragNode({
        x: startX + moveEvent.clientX - startClientX,
        y: startY + moveEvent.clientY - startClientY,
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

  if (node.type === 'text') {
    return (
      <button
        className={`text-left ${selectionClass}`}
        onClick={(event) => {
          event.stopPropagation()
          onSelect(node.id)
        }}
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
      </button>
    )
  }

  if (node.type === 'button') {
    return (
      <button
        className={selectionClass}
        onClick={(event) => {
          event.stopPropagation()
          onSelect(node.id)
        }}
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
      </button>
    )
  }

  if (node.type === 'image') {
    return (
      <button
        aria-label={node.content.alt ?? '图片描述'}
        className={`absolute block overflow-hidden bg-stone-100 ${selectionClass}`}
        onClick={(event) => {
          event.stopPropagation()
          onSelect(node.id)
        }}
        onPointerDown={startDrag}
        style={{
          ...absoluteStyle,
          borderRadius: node.style.radius,
        }}
        type="button"
      >
        <img
          alt={node.content.alt ?? ''}
          className="h-full w-full object-cover"
          src={
            node.content.src ||
            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200"%3E%3Crect width="320" height="200" fill="%23e7e5e4"/%3E%3Cpath d="M92 128l42-44 32 32 22-22 40 34H92z" fill="%23a8a29e"/%3E%3Ccircle cx="214" cy="70" r="18" fill="%23a8a29e"/%3E%3C/svg%3E'
          }
        />
      </button>
    )
  }

  if (node.type === 'container') {
    return (
      <div
        aria-label="容器节点"
        className={`border text-sm text-stone-500 ${selectionClass}`}
        onClick={(event) => {
          event.stopPropagation()
          onSelect(node.id)
        }}
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
        {node.children.length === 0 ? (
          <span className="self-center">容器</span>
        ) : (
          node.children
            .map((childId) => document.nodes[childId])
            .filter(Boolean)
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

  return null
}
