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

export function createButtonNode(text = '按钮'): UINode {
  return {
    id: createId(),
    type: 'button',
    name: 'Button',
    parentId: null,
    children: [],
    layout: { mode: 'absolute', x: 40, y: 72, width: 120, height: 44 },
    style: {
      background: '#111827',
      color: '#ffffff',
      radius: 12,
      fontSize: 16,
      fontWeight: 600,
    },
    content: { text },
    meta: {},
  }
}

export function createImageNode(src = ''): UINode {
  return {
    id: createId(),
    type: 'image',
    name: 'Image',
    parentId: null,
    children: [],
    layout: { mode: 'absolute', x: 40, y: 136, width: 240, height: 160 },
    style: { radius: 16 },
    content: {
      src,
      alt: '图片描述',
    },
    meta: {},
  }
}

export function createContainerNode(): UINode {
  return {
    id: createId(),
    type: 'container',
    name: 'Container',
    parentId: null,
    children: [],
    layout: {
      mode: 'flex-column',
      x: 320,
      y: 72,
      width: 280,
      height: 180,
      gap: 12,
      padding: { top: 16, right: 16, bottom: 16, left: 16 },
    },
    style: {
      background: '#f8fafc',
      radius: 20,
      borderWidth: 1,
      borderColor: '#e2e8f0',
    },
    content: {},
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

function collectDescendantIds(document: PageDocument, nodeId: string): string[] {
  const node = document.nodes[nodeId]

  if (!node) {
    return []
  }

  return [
    nodeId,
    ...node.children.flatMap((childId) => collectDescendantIds(document, childId)),
  ]
}

export function removeNode(document: PageDocument, nodeId: string): PageDocument {
  const node = document.nodes[nodeId]

  if (!node || nodeId === document.rootNodeId) {
    return document
  }

  const idsToRemove = new Set(collectDescendantIds(document, nodeId))
  const nextNodes = Object.fromEntries(
    Object.entries(document.nodes)
      .filter(([id]) => !idsToRemove.has(id))
      .map(([id, currentNode]) => [
        id,
        {
          ...currentNode,
          children: currentNode.children.filter((childId) => !idsToRemove.has(childId)),
        },
      ]),
  )

  return {
    ...document,
    nodes: nextNodes,
    selectedNodeIds: document.selectedNodeIds.filter((id) => !idsToRemove.has(id)),
    updatedAt: new Date().toISOString(),
  }
}

export function selectNodes(
  document: PageDocument,
  selectedNodeIds: string[],
): PageDocument {
  return {
    ...document,
    selectedNodeIds,
    updatedAt: new Date().toISOString(),
  }
}
