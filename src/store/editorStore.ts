import { create } from 'zustand'
import {
  createTextNode,
  insertChildNode,
  selectNodes,
} from '../domain/commands/editorCommands'
import { createEmptyDocument } from '../domain/model/factories'
import type { ContentProps, PageDocument } from '../domain/model/types'
import { updateNodeContent } from '../domain/commands/updateNodeFields'
import {
  loadDocument,
  saveDocument,
} from '../domain/persistence/documentStorage'

interface EditorState {
  document: PageDocument
  addTextNode: () => void
  selectNode: (nodeId: string) => void
  updateSelectedNodeContent: (content: ContentProps) => void
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
}))
