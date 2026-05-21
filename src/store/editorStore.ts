import { create } from 'zustand'
import {
  alignNodesLeft,
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
  setNodeComponentHint,
  setNodeVisible,
  updateNodeLayout,
  updateNodeName,
  ungroupSelectedNode,
} from '../domain/commands/editorCommands'
import { createEmptyDocument } from '../domain/model/factories'
import type {
  ContentProps,
  LayoutProps,
  PageDocument,
  StyleProps,
  UINode,
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
  alignSelectedNodesLeft: () => void
  deleteSelectedNode: () => void
  insertNode: (node: UINode) => void
  updateCanvasSize: (size: { height: number; width: number }) => void
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
  updateSelectedNodeComponentHint: (componentHint: string) => void
  updateSelectedNodeContent: (content: ContentProps) => void
  updateSelectedNodeLayout: (layout: Partial<LayoutProps>) => void
  updateSelectedNodeName: (name: string) => void
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
  deleteSelectedNode: () =>
    set((state) => {
      if (state.document.selectedNodeIds.length === 0) {
        return state
      }

      const nextDocument = state.document.selectedNodeIds.reduce(
        (currentDocument, nodeId) => removeNode(currentDocument, nodeId),
        state.document,
      )

      return withPersistedDocument(nextDocument)
    }),
  insertNode: (node) =>
    set((state) =>
      withPersistedDocument(
        insertChildNode(state.document, state.document.rootNodeId, node),
      ),
    ),
  updateCanvasSize: ({ height, width }) =>
    set((state) =>
      withPersistedDocument(
        updateNodeLayout(state.document, state.document.rootNodeId, {
          height,
          width,
        }),
      ),
    ),
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
  updateSelectedNodeComponentHint: (componentHint) =>
    set((state) => {
      const [nodeId] = state.document.selectedNodeIds

      if (!nodeId) {
        return state
      }

      return withPersistedDocument(
        setNodeComponentHint(state.document, nodeId, componentHint),
      )
    }),
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
  updateSelectedNodeName: (name) =>
    set((state) => {
      const [nodeId] = state.document.selectedNodeIds

      if (!nodeId) {
        return state
      }

      return withPersistedDocument(updateNodeName(state.document, nodeId, name))
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
