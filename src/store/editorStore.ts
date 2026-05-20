import { create } from 'zustand'
import {
  createTextNode,
  insertChildNode,
  selectNodes,
} from '../domain/commands/editorCommands'
import { createEmptyDocument } from '../domain/model/factories'
import type { PageDocument } from '../domain/model/types'

interface EditorState {
  document: PageDocument
  addTextNode: () => void
  selectNode: (nodeId: string) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  document: createEmptyDocument('Untitled'),
  addTextNode: () =>
    set((state) => ({
      document: insertChildNode(
        state.document,
        state.document.rootNodeId,
        createTextNode('新文本'),
      ),
    })),
  selectNode: (nodeId) =>
    set((state) => ({
      document: selectNodes(state.document, [nodeId]),
    })),
}))
