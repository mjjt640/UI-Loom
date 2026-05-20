import { create } from 'zustand'
import {
  createTextNode,
  insertChildNode,
} from '../domain/commands/editorCommands'
import { createEmptyDocument } from '../domain/model/factories'
import type { PageDocument } from '../domain/model/types'

interface EditorState {
  document: PageDocument
  addTextNode: () => void
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
}))
