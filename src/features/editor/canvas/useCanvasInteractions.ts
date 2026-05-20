import { useEditorStore } from '../../../store/editorStore'

export function useCanvasInteractions() {
  const selectNode = useEditorStore((state) => state.selectNode)

  return { selectNode }
}
