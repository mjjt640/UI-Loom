import { create } from 'zustand'
import {
  createTextNode,
  insertChildNode,
  selectNodes,
} from '../domain/commands/editorCommands'
import { createEmptyDocument } from '../domain/model/factories'
import type { ContentProps, PageDocument } from '../domain/model/types'
import { updateNodeContent } from '../domain/commands/updateNodeFields'

interface EditorState {
  document: PageDocument
  addTextNode: () => void
  selectNode: (nodeId: string) => void
  updateSelectedNodeContent: (content: ContentProps) => void
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
  updateSelectedNodeContent: (content) =>
    set((state) => {
      const [nodeId] = state.document.selectedNodeIds

      if (!nodeId) {
        return state
      }

      return {
        document: updateNodeContent(state.document, nodeId, content),
      }
    }),
}))
