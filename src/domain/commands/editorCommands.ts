import { createId } from '../../utils/id'
import type { PageDocument, UINode } from '../model/types'

export function createTextNode(text: string): UINode {
  return {
    id: createId(),
    type: 'text',
    name: 'Text',
    parentId: null,
    children: [],
    layout: { mode: 'absolute', x: 0, y: 0, width: 160, height: 32 },
    style: { color: '#111827', fontSize: 24, fontWeight: 600 },
    content: { text },
    meta: {},
  }
}

export function insertChildNode(
  document: PageDocument,
  parentId: string,
  node: UINode,
): PageDocument {
  const parent = document.nodes[parentId]

  if (!parent) {
    throw new Error(`Parent node not found: ${parentId}`)
  }

  return {
    ...document,
    updatedAt: new Date().toISOString(),
    nodes: {
      ...document.nodes,
      [parentId]: {
        ...parent,
        children: [...parent.children, node.id],
      },
      [node.id]: {
        ...node,
        parentId,
      },
    },
  }
}
