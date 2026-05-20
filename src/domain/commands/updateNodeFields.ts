import type { ContentProps, PageDocument } from '../model/types'

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
