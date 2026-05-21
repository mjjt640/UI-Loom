import type { PageDocument, UINode } from '../model/types'
import type { ExportCodeMapping } from './exportTypes'

export function nodeMappingToken(nodeId: string) {
  return `data-ui-node-id="${nodeId}"`
}

export function nodeMappingAttribute(node: UINode) {
  return nodeMappingToken(node.id)
}

function collectVisibleNodeIds(document: PageDocument, node: UINode): string[] {
  if (node.meta.visible === false) {
    return []
  }

  return [
    node.id,
    ...node.children.flatMap((childId) => {
      const child = document.nodes[childId]

      if (!child) {
        throw new Error(`Export mapping child node not found: ${childId}`)
      }

      return collectVisibleNodeIds(document, child)
    }),
  ]
}

export function mappingsForSubtree(
  document: PageDocument,
  node: UINode,
  filePath: string,
): ExportCodeMapping[] {
  return collectVisibleNodeIds(document, node).map((nodeId) => ({
    filePath,
    nodeId,
    token: nodeMappingToken(nodeId),
  }))
}

export function mappingsForRootFile(
  document: PageDocument,
  filePath: string,
): ExportCodeMapping[] {
  const root = document.nodes[document.rootNodeId]

  return root.children.flatMap((childId) => {
    const child = document.nodes[childId]

    if (!child) {
      throw new Error(`Export mapping root child not found: ${childId}`)
    }

    return mappingsForSubtree(document, child, filePath)
  })
}
