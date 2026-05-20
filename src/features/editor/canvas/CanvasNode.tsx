import type { UINode } from '../../../domain/model/types'

interface CanvasNodeProps {
  node: UINode
  selected: boolean
  onSelect: () => void
}

export function CanvasNode({ node, selected, onSelect }: CanvasNodeProps) {
  const selectionClass = selected ? 'outline outline-2 outline-sky-500' : ''
  const absoluteStyle = {
    height: node.layout.height === 'hug' ? undefined : node.layout.height,
    left: node.layout.x,
    top: node.layout.y,
    width: node.layout.width === 'hug' ? undefined : node.layout.width,
  }

  if (node.type === 'text') {
    return (
      <button
        className={`absolute text-left ${selectionClass}`}
        onClick={onSelect}
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
        className={`absolute ${selectionClass}`}
        onClick={onSelect}
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
        onClick={onSelect}
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
      <button
        aria-label="容器节点"
        className={`absolute flex items-center justify-center border text-sm text-stone-500 ${selectionClass}`}
        onClick={onSelect}
        style={{
          ...absoluteStyle,
          background: node.style.background,
          borderColor: node.style.borderColor,
          borderRadius: node.style.radius,
          borderWidth: node.style.borderWidth,
        }}
        type="button"
      >
        容器
      </button>
    )
  }

  return null
}
