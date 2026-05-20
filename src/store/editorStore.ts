import { create } from 'zustand'
import {
  alignNodesLeft,
  createButtonNode,
  createContainerNode,
  createFrameNode,
  createImageNode,
  createRectNode,
  createTextNode,
  distributeNodesHorizontally,
  frameSelectedNodes,
  groupSelectedNodes,
  insertChildNode,
  moveNode,
  moveNodeBackward,
  moveNodeForward,
  removeNode,
  selectNodes,
  setNodeLocked,
  setNodeVisible,
  updateNodeLayout,
  ungroupSelectedNode,
} from '../domain/commands/editorCommands'
import { createEmptyDocument } from '../domain/model/factories'
import type {
  ContentProps,
  LayoutProps,
  PageDocument,
  StyleProps,
} from '../domain/model/types'
import {
  updateNodeContent,
  updateNodeStyle,
} from '../domain/commands/updateNodeFields'
import {
  loadDocument,
  saveDocument,
} from '../domain/persistence/documentStorage'

interface EditorState {
  document: PageDocument
  addTextNode: () => void
  alignSelectedNodesLeft: () => void
  addButtonNode: () => void
  addImageNode: () => void
  addContainerNode: () => void
  addFrameNode: () => void
  addRectNode: () => void
  deleteSelectedNode: () => void
  moveLayerBackward: (nodeId: string) => void
  moveLayerForward: (nodeId: string) => void
  moveSelectedNodeToFirstContainer: () => void
  frameSelectedNodes: () => void
  groupSelectedNodes: () => void
  selectNode: (nodeId: string) => void
  selectNodesByIds: (nodeIds: string[]) => void
  toggleNodeSelection: (nodeId: string) => void
  distributeSelectedNodesHorizontally: () => void
  ungroupSelectedNode: () => void
  setLayerLocked: (nodeId: string, locked: boolean) => void
  setLayerVisible: (nodeId: string, visible: boolean) => void
  updateSelectedNodeContent: (content: ContentProps) => void
  updateSelectedNodeLayout: (layout: Partial<LayoutProps>) => void
  updateSelectedNodeStyle: (style: StyleProps) => void
}

function withPersistedDocument(document: PageDocument) {
  saveDocument(document)
  return { document }
}

const initialDocument = loadDocument() ?? createEmptyDocument('Untitled')

export const useEditorStore = create<EditorState>((set) => ({
  document: initialDocument,
  alignSelectedNodesLeft: () =>
    set((state) => withPersistedDocument(alignNodesLeft(state.document))),
  addTextNode: () =>
    set((state) =>
      withPersistedDocument(
        insertChildNode(
          state.document,
          state.document.rootNodeId,
          createTextNode('新文本'),
        ),
      ),
    ),
  addButtonNode: () =>
    set((state) =>
      withPersistedDocument(
        insertChildNode(
          state.document,
          state.document.rootNodeId,
          createButtonNode(),
        ),
      ),
    ),
  addImageNode: () =>
    set((state) =>
      withPersistedDocument(
        insertChildNode(
          state.document,
          state.document.rootNodeId,
          createImageNode(),
        ),
      ),
    ),
  addContainerNode: () =>
    set((state) =>
      withPersistedDocument(
        insertChildNode(
          state.document,
          state.document.rootNodeId,
          createContainerNode(),
        ),
      ),
    ),
  addFrameNode: () =>
    set((state) =>
      withPersistedDocument(
        insertChildNode(
          state.document,
          state.document.rootNodeId,
          createFrameNode(),
        ),
      ),
    ),
  addRectNode: () =>
    set((state) =>
      withPersistedDocument(
        insertChildNode(
          state.document,
          state.document.rootNodeId,
          createRectNode(),
        ),
      ),
    ),
  deleteSelectedNode: () =>
    set((state) => {
      const [nodeId] = state.document.selectedNodeIds

      if (!nodeId) {
        return state
      }

      return withPersistedDocument(removeNode(state.document, nodeId))
    }),
  moveLayerBackward: (nodeId) =>
    set((state) =>
      withPersistedDocument(moveNodeBackward(state.document, nodeId)),
    ),
  moveLayerForward: (nodeId) =>
    set((state) => withPersistedDocument(moveNodeForward(state.document, nodeId))),
  moveSelectedNodeToFirstContainer: () =>
    set((state) => {
      const [nodeId] = state.document.selectedNodeIds

      if (!nodeId) {
        return state
      }

      const container = Object.values(state.document.nodes).find(
        (node) => node.type === 'container' && node.id !== nodeId,
      )

      if (!container) {
        return state
      }

      return withPersistedDocument(moveNode(state.document, nodeId, container.id))
    }),
  frameSelectedNodes: () =>
    set((state) => withPersistedDocument(frameSelectedNodes(state.document))),
  groupSelectedNodes: () =>
    set((state) => withPersistedDocument(groupSelectedNodes(state.document))),
  selectNode: (nodeId) =>
    set((state) => {
      const node = state.document.nodes[nodeId]

      if (!node || node.meta.locked || node.meta.visible === false) {
        return state
      }

      return withPersistedDocument(selectNodes(state.document, [nodeId]))
    }),
  selectNodesByIds: (nodeIds) =>
    set((state) => {
      const selectableNodeIds = [...new Set(nodeIds)].filter((nodeId) => {
        const node = state.document.nodes[nodeId]

        if (!node) {
          throw new Error(`Node not found: ${nodeId}`)
        }

        return !node.meta.locked && node.meta.visible !== false
      })

      return withPersistedDocument(selectNodes(state.document, selectableNodeIds))
    }),
  toggleNodeSelection: (nodeId) =>
    set((state) => {
      const node = state.document.nodes[nodeId]

      if (!node || node.meta.locked || node.meta.visible === false) {
        return state
      }

      const selectedNodeIds = state.document.selectedNodeIds.includes(nodeId)
        ? state.document.selectedNodeIds.filter((id) => id !== nodeId)
        : [...state.document.selectedNodeIds, nodeId]

      return withPersistedDocument(selectNodes(state.document, selectedNodeIds))
    }),
  distributeSelectedNodesHorizontally: () =>
    set((state) =>
      withPersistedDocument(distributeNodesHorizontally(state.document)),
    ),
  ungroupSelectedNode: () =>
    set((state) => withPersistedDocument(ungroupSelectedNode(state.document))),
  setLayerLocked: (nodeId, locked) =>
    set((state) =>
      withPersistedDocument(setNodeLocked(state.document, nodeId, locked)),
    ),
  setLayerVisible: (nodeId, visible) =>
    set((state) =>
      withPersistedDocument(setNodeVisible(state.document, nodeId, visible)),
    ),
  updateSelectedNodeContent: (content) =>
    set((state) => {
      const [nodeId] = state.document.selectedNodeIds

      if (!nodeId) {
        return state
      }

      return withPersistedDocument(
        updateNodeContent(state.document, nodeId, content),
      )
    }),
  updateSelectedNodeLayout: (layout) =>
    set((state) => {
      const [nodeId] = state.document.selectedNodeIds

      if (!nodeId) {
        return state
      }

      return withPersistedDocument(updateNodeLayout(state.document, nodeId, layout))
    }),
  updateSelectedNodeStyle: (style) =>
    set((state) => {
      const [nodeId] = state.document.selectedNodeIds

      if (!nodeId) {
        return state
      }

      return withPersistedDocument(updateNodeStyle(state.document, nodeId, style))
    }),
}))
