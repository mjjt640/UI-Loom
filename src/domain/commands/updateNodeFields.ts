import type { ContentProps, PageDocument, StyleProps } from '../model/types'

export function updateNodeContent(
  document: PageDocument,
  nodeId: string,
  content: ContentProps,
): PageDocument {
  const node = document.nodes[nodeId]

  if (!node) {
    throw new Error(`Node not found: ${nodeId}`)
  }

  return {
    ...document,
    nodes: {
      ...document.nodes,
      [nodeId]: {
        ...node,
        content: {
          ...node.content,
          ...content,
        },
      },
    },
    updatedAt: new Date().toISOString(),
  }
}

export function updateNodeStyle(
  document: PageDocument,
  nodeId: string,
  style: StyleProps,
): PageDocument {
  const node = document.nodes[nodeId]

  if (!node) {
    throw new Error(`Node not found: ${nodeId}`)
  }

  return {
    ...document,
    nodes: {
      ...document.nodes,
      [nodeId]: {
        ...node,
        style: {
          ...node.style,
          ...style,
        },
      },
    },
    updatedAt: new Date().toISOString(),
  }
}
