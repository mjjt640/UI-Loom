import type { UINode } from '../../../domain/model/types'

interface CanvasNodeProps {
  node: UINode
  selected: boolean
  onSelect: () => void
}

export function CanvasNode({ node, selected, onSelect }: CanvasNodeProps) {
  if (node.type === 'text') {
    return (
      <button
        className={
          selected
            ? 'absolute text-left outline outline-2 outline-sky-500'
            : 'absolute text-left'
        }
        onClick={onSelect}
        style={{
          color: node.style.color,
          fontSize: node.style.fontSize,
          fontWeight: node.style.fontWeight,
          left: node.layout.x,
          top: node.layout.y,
        }}
        type="button"
      >
        {node.content.text}
      </button>
    )
  }

  return null
}
