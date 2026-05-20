import { createId } from '../../utils/id'
import type { PageDocument, UINode } from './types'

export function createEmptyDocument(name: string): PageDocument {
  const rootId = createId()
  const now = new Date().toISOString()

  const rootNode: UINode = {
    id: rootId,
    type: 'page',
    name: 'Page',
    parentId: null,
    children: [],
    layout: { mode: 'flex-column', width: 1440, height: 'hug', gap: 0 },
    style: { background: '#ffffff' },
    content: {},
    meta: {},
  }

  return {
    version: 1,
    projectId: createId(),
    pageId: createId(),
    name,
    rootNodeId: rootId,
    nodes: {
      [rootId]: rootNode,
    },
    selectedNodeIds: [],
    createdAt: now,
    updatedAt: now,
  }
}
