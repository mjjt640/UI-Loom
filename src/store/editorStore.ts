import { create } from 'zustand'
import {
  createButtonNode,
  createContainerNode,
  createImageNode,
  createTextNode,
  insertChildNode,
  moveNode,
  removeNode,
  selectNodes,
  updateNodeLayout,
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
  addButtonNode: () => void
  addImageNode: () => void
  addContainerNode: () => void
  deleteSelectedNode: () => void
  moveSelectedNodeToFirstContainer: () => void
  selectNode: (nodeId: string) => void
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
  deleteSelectedNode: () =>
    set((state) => {
      const [nodeId] = state.document.selectedNodeIds

      if (!nodeId) {
        return state
      }

      return withPersistedDocument(removeNode(state.document, nodeId))
    }),
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
  selectNode: (nodeId) =>
    set((state) => withPersistedDocument(selectNodes(state.document, [nodeId]))),
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
