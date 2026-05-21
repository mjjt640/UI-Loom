import type { LayoutProps, PageDocument, UINode } from '../../../domain/model/types'

interface CanvasNodeProps {
  document: PageDocument
  node: UINode
  onDragNode: (layout: Partial<LayoutProps>) => void
  pathEditing?: boolean
  selected: boolean
  onSelect: (nodeId: string) => void
  proportionalResize: boolean
}

interface Point {
  x: number
  y: number
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

function visualStyle(node: UINode) {
  return {
    background: node.style.background,
    borderColor: node.style.borderColor,
    borderRadius: node.style.radius,
    borderWidth: node.style.borderWidth,
    boxShadow: node.style.shadow,
    opacity: node.style.opacity,
  } as const
}

function layoutSizeStyle(node: UINode) {
  return {
    height:
      node.layout.height === 'hug'
        ? 'auto'
        : node.layout.height === 'fill'
          ? '100%'
          : node.layout.height,
    maxHeight: node.layout.maxHeight,
    maxWidth: node.layout.maxWidth,
    minHeight: node.layout.minHeight,
    minWidth: node.layout.minWidth,
    width:
      node.layout.width === 'hug'
        ? 'auto'
        : node.layout.width === 'fill'
          ? '100%'
          : node.layout.width,
  } as const
}

function nodeAriaLabel(node: UINode) {
  if (node.meta.componentHint?.startsWith('element-plus-')) {
    return `${node.name}组件`
  }

  if (node.type === 'card') return 'Card 组件'
  if (node.type === 'input') return 'Input 组件'
  if (node.type === 'list') return 'List 组件'
  if (node.type === 'rect') return '矩形图层'
  if (node.type === 'ellipse') return '圆形图层'
  if (node.type === 'triangle') return '三角形图层'
  if (node.type === 'star') return '星形图层'
  if (node.type === 'polygon') return '多边形图层'
  if (node.type === 'path') return '路径图层'
  if (node.type === 'slice') return '切片图层'
  if (node.type === 'icon') return `${node.name} 图标`
  return node.name
}

function svgStrokeWidth(node: UINode) {
  return node.style.borderWidth ?? 1
}

function svgStrokeColor(node: UINode) {
  return node.style.borderColor ?? '#2563eb'
}

function svgFillColor(node: UINode) {
  return node.type === 'path' ? 'none' : (node.style.background ?? '#dbeafe')
}

function denormalizePathPoint(point: Point, size: { height: number; width: number }) {
  return {
    x: (point.x / 100) * size.width,
    y: (point.y / 100) * size.height,
  }
}

function PathNodeEditingLayer({
  node,
  size,
}: {
  node: UINode
  size: {
    height: number
    width: number
  }
}) {
  const pathNodes = node.content.pathNodes ?? []

  if (pathNodes.length === 0) {
    return null
  }

  return (
    <g aria-label="路径节点编辑层">
      {pathNodes.map((pathNode, index) => {
        const anchor = denormalizePathPoint(pathNode.anchor, size)
        const inHandle = pathNode.inHandle
          ? denormalizePathPoint(pathNode.inHandle, size)
          : null
        const outHandle = pathNode.outHandle
          ? denormalizePathPoint(pathNode.outHandle, size)
          : null

        return (
          <g key={`${pathNode.anchor.x}-${pathNode.anchor.y}-${index}`}>
            {inHandle ? (
              <g aria-label="路径控制柄">
                <line
                  stroke="#9ca3af"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                  x1={anchor.x}
                  x2={inHandle.x}
                  y1={anchor.y}
                  y2={inHandle.y}
                />
                <circle
                  cx={inHandle.x}
                  cy={inHandle.y}
                  fill="#ffffff"
                  r="4"
                  stroke="#1683ff"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            ) : null}
            {outHandle ? (
              <g aria-label="路径控制柄">
                <line
                  stroke="#9ca3af"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                  x1={anchor.x}
                  x2={outHandle.x}
                  y1={anchor.y}
                  y2={outHandle.y}
                />
                <circle
                  cx={outHandle.x}
                  cy={outHandle.y}
                  fill="#ffffff"
                  r="4"
                  stroke="#1683ff"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            ) : null}
            <circle
              aria-label="路径锚点"
              cx={anchor.x}
              cy={anchor.y}
              fill={index === 0 ? '#1683ff' : '#ffffff'}
              r="4"
              stroke="#2563eb"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        )
      })}
    </g>
  )
}

function constrainedPositionStyle(node: UINode, isRootChild: boolean) {
  if (!isRootChild) {
    return {}
  }

  const horizontal = node.layout.constraints?.horizontal ?? 'left'
  const vertical = node.layout.constraints?.vertical ?? 'top'
  const transforms: string[] = []
  const style: React.CSSProperties = {
    position: 'absolute',
  }

  if (horizontal === 'center') {
    style.left = '50%'
    transforms.push('translateX(-50%)')
  } else if (horizontal === 'right') {
    style.right = node.layout.x
  } else if (horizontal === 'stretch') {
    style.left = node.layout.x
    style.right = node.layout.x
  } else {
    style.left = node.layout.x
  }

  if (vertical === 'center') {
    style.top = '50%'
    transforms.push('translateY(-50%)')
  } else if (vertical === 'bottom') {
    style.bottom = node.layout.y
  } else if (vertical === 'stretch') {
    style.top = node.layout.y
    style.bottom = node.layout.y
  } else {
    style.top = node.layout.y
  }

  if (transforms.length > 0) {
    style.transform = transforms.join(' ')
  }

  return style
}

export function CanvasNode({
  document,
  node,
  onDragNode,
  pathEditing = false,
  proportionalResize,
  selected,
  onSelect,
}: CanvasNodeProps) {
  const selectionClass = selected ? 'outline outline-2 outline-sky-500' : ''
  const canInteract = !node.meta.locked && node.meta.visible !== false
  const canDrag =
    canInteract &&
    node.parentId === document.rootNodeId &&
    node.layout.mode === 'absolute' &&
    (node.layout.constraints?.horizontal ?? 'left') === 'left' &&
    (node.layout.constraints?.vertical ?? 'top') === 'top'
  const absoluteStyle = {
    cursor: canDrag ? 'grab' : undefined,
    ...constrainedPositionStyle(node, node.parentId === document.rootNodeId),
    ...layoutSizeStyle(node),
  } as React.CSSProperties
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
      if (proportionalResize) {
        const nextWidth = Math.max(8, startSize.width + moveEvent.clientX - startClientX)
        const aspectRatio = startSize.height / startSize.width

        onDragNode({
          width: nextWidth,
          height: Math.max(8, Math.round(nextWidth * aspectRatio)),
        })
        return
      }

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
      aria-label={proportionalResize ? '等比缩放右下尺寸' : '调整右下尺寸'}
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
          ...visualStyle(node),
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
        aria-label={
          node.meta.componentHint?.startsWith('element-plus-')
            ? nodeAriaLabel(node)
            : undefined
        }
        className={selectionClass}
        onClick={selectCurrentNode}
        onPointerDown={startDrag}
        style={{
          ...absoluteStyle,
          ...visualStyle(node),
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
    const hasImageSource = Boolean(node.content.src)

    return (
      <div
        aria-label={hasImageSource ? undefined : node.content.alt ?? '图片描述'}
        className={`absolute block overflow-hidden bg-stone-100 ${selectionClass}`}
        onClick={selectCurrentNode}
        onPointerDown={startDrag}
        role={hasImageSource ? undefined : 'img'}
        style={{
          ...absoluteStyle,
          ...visualStyle(node),
        }}
      >
        {hasImageSource ? (
          <img
            alt={node.content.alt ?? ''}
            className="h-full w-full object-cover"
            src={node.content.src}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-xs text-stone-500">
            {node.content.alt ?? '图片描述'}
          </span>
        )}
        {resizeHandle}
      </div>
    )
  }

  if (node.type === 'input') {
    return (
      <button
        aria-label={nodeAriaLabel(node)}
        className={`text-left ${selectionClass}`}
        onClick={selectCurrentNode}
        onPointerDown={startDrag}
        style={{
          ...absoluteStyle,
          ...visualStyle(node),
          color: node.style.color,
          fontSize: node.style.fontSize,
        }}
        type="button"
      >
        <span className="flex h-full items-center px-3 text-neutral-400">
          {node.content.placeholder}
        </span>
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
          ...visualStyle(node),
        }}
        type="button"
      >
        {resizeHandle}
      </button>
    )
  }

  if (node.type === 'ellipse') {
    return (
      <button
        aria-label={nodeAriaLabel(node)}
        className={`block ${selectionClass}`}
        onClick={selectCurrentNode}
        onPointerDown={startDrag}
        style={{
          ...absoluteStyle,
          ...visualStyle(node),
          borderRadius: 9999,
        }}
        type="button"
      >
        {resizeHandle}
      </button>
    )
  }

  if (
    node.type === 'triangle' ||
    node.type === 'star' ||
    node.type === 'polygon' ||
    node.type === 'path'
  ) {
    const polygonPoints =
      node.type === 'triangle'
        ? '50 8 92 92 8 92'
        : node.type === 'star'
          ? '50 6 61 36 94 36 67 56 78 90 50 70 22 90 33 56 6 36 39 36'
          : '50 6 94 30 94 70 50 94 6 70 6 30'

    return (
      <button
        aria-label={nodeAriaLabel(node)}
        className={`block overflow-visible ${selectionClass}`}
        onClick={selectCurrentNode}
        onPointerDown={startDrag}
        style={{
          ...absoluteStyle,
          background: 'transparent',
          border: 0,
          opacity: node.style.opacity,
        }}
        type="button"
      >
        <svg
          aria-hidden="true"
          className="h-full w-full overflow-visible"
          preserveAspectRatio="none"
          viewBox={
            node.type === 'path'
              ? `0 0 ${Number(node.layout.width)} ${Number(node.layout.height)}`
              : '0 0 100 100'
          }
        >
          {node.type === 'path' ? (
            <>
              <path
                d={node.content.pathData ?? ''}
                fill="none"
                stroke={svgStrokeColor(node)}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={svgStrokeWidth(node)}
                vectorEffect="non-scaling-stroke"
              />
              {pathEditing &&
              typeof node.layout.width === 'number' &&
              typeof node.layout.height === 'number' ? (
                <PathNodeEditingLayer
                  node={node}
                  size={{
                    height: node.layout.height,
                    width: node.layout.width,
                  }}
                />
              ) : null}
            </>
          ) : (
            <polygon
              fill={svgFillColor(node)}
              points={polygonPoints}
              stroke={svgStrokeColor(node)}
              strokeWidth={svgStrokeWidth(node)}
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>
        {resizeHandle}
      </button>
    )
  }

  if (node.type === 'slice') {
    return (
      <button
        aria-label={nodeAriaLabel(node)}
        className={`block ${selectionClass}`}
        onClick={selectCurrentNode}
        onPointerDown={startDrag}
        style={{
          ...absoluteStyle,
          background: 'transparent',
          borderColor: node.style.borderColor,
          borderStyle: 'dashed',
          borderWidth: node.style.borderWidth,
          opacity: node.style.opacity,
        }}
        type="button"
      >
        {resizeHandle}
      </button>
    )
  }

  if (node.type === 'icon') {
    return (
      <button
        aria-label={nodeAriaLabel(node)}
        className={`block ${selectionClass}`}
        onClick={selectCurrentNode}
        onPointerDown={startDrag}
        style={{
          ...absoluteStyle,
          background: 'transparent',
          border: 0,
          color: node.style.color ?? '#6b7280',
          opacity: node.style.opacity,
        }}
        type="button"
      >
        <svg
          aria-hidden="true"
          className="h-full w-full"
          fill="currentColor"
          preserveAspectRatio="xMidYMid meet"
          viewBox={node.content.viewBox ?? '0 0 24 24'}
        >
          <path d={node.content.svgPath ?? ''} />
        </svg>
        {resizeHandle}
      </button>
    )
  }

  if (
    node.type === 'card' ||
    node.type === 'container' ||
    node.type === 'group' ||
    node.type === 'frame' ||
    node.type === 'list'
  ) {
    const nodeLabel =
      node.type === 'group'
        ? '图层组'
        : node.type === 'frame'
          ? 'Frame 节点'
          : node.type === 'container'
            ? '容器节点'
            : nodeAriaLabel(node)
    const emptyLabel =
      node.type === 'frame'
        ? 'Frame'
        : node.type === 'card'
          ? (node.content.text ?? 'Card')
          : node.type === 'list'
            ? (node.content.text ?? 'List')
            : '容器'

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
          ...visualStyle(node),
          ...flexStyle(node),
        }}
      >
        {resizeHandle}
        {node.children.length === 0 ? (
          <span className="whitespace-pre-line self-center px-3 text-left">
            {emptyLabel}
          </span>
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
                pathEditing={pathEditing && childNode.type === 'path'}
                proportionalResize={proportionalResize}
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
