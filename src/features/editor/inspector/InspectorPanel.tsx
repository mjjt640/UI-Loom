import { useEditorStore } from '../../../store/editorStore'
import { CodePreviewPanel } from '../../preview/CodePreviewPanel'

export function InspectorPanel() {
  const document = useEditorStore((state) => state.document)
  const updateSelectedNodeContent = useEditorStore(
    (state) => state.updateSelectedNodeContent,
  )
  const updateSelectedNodeLayout = useEditorStore(
    (state) => state.updateSelectedNodeLayout,
  )
  const updateSelectedNodeStyle = useEditorStore(
    (state) => state.updateSelectedNodeStyle,
  )
  const moveSelectedNodeToFirstContainer = useEditorStore(
    (state) => state.moveSelectedNodeToFirstContainer,
  )
  const selectedNodeId = document.selectedNodeIds[0]
  const selectedNode = selectedNodeId ? document.nodes[selectedNodeId] : null
  const selectedCount = document.selectedNodeIds.length

  return (
    <aside className="border-l border-stone-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-stone-800">属性</h2>
      {selectedCount > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-stone-500">已选中 {selectedCount} 个节点</p>
          {selectedNode ? (
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-2 text-sm text-stone-600">
                <span>X</span>
                <input
                  className="rounded-md border border-stone-300 px-3 py-2"
                  inputMode="numeric"
                  onChange={(event) =>
                    updateSelectedNodeLayout({
                      x: Number(event.target.value) || 0,
                    })
                  }
                  value={selectedNode.layout.x ?? 0}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-600">
                <span>Y</span>
                <input
                  className="rounded-md border border-stone-300 px-3 py-2"
                  inputMode="numeric"
                  onChange={(event) =>
                    updateSelectedNodeLayout({
                      y: Number(event.target.value) || 0,
                    })
                  }
                  value={selectedNode.layout.y ?? 0}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-600">
                <span>宽度</span>
                <input
                  className="rounded-md border border-stone-300 px-3 py-2"
                  inputMode="numeric"
                  onChange={(event) =>
                    updateSelectedNodeLayout({
                      width: Number(event.target.value) || 'hug',
                    })
                  }
                  value={
                    typeof selectedNode.layout.width === 'number'
                      ? selectedNode.layout.width
                      : 0
                  }
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-600">
                <span>高度</span>
                <input
                  className="rounded-md border border-stone-300 px-3 py-2"
                  inputMode="numeric"
                  onChange={(event) =>
                    updateSelectedNodeLayout({
                      height: Number(event.target.value) || 'hug',
                    })
                  }
                  value={
                    typeof selectedNode.layout.height === 'number'
                      ? selectedNode.layout.height
                      : 0
                  }
                />
              </label>
              {selectedNode.type !== 'container' ? (
                <button
                  className="col-span-2 rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-700"
                  onClick={moveSelectedNodeToFirstContainer}
                  type="button"
                >
                  移入容器
                </button>
              ) : null}
            </div>
          ) : null}
          {selectedNode?.type === 'text' ? (
            <label className="flex flex-col gap-2 text-sm text-stone-600">
              <span>文本内容</span>
              <input
                className="rounded-md border border-stone-300 px-3 py-2"
                onChange={(event) =>
                  updateSelectedNodeContent({ text: event.target.value })
                }
                value={selectedNode.content.text ?? ''}
              />
            </label>
          ) : null}
          {selectedNode?.type === 'button' ? (
            <label className="flex flex-col gap-2 text-sm text-stone-600">
              <span>按钮文本</span>
              <input
                className="rounded-md border border-stone-300 px-3 py-2"
                onChange={(event) =>
                  updateSelectedNodeContent({ text: event.target.value })
                }
                value={selectedNode.content.text ?? ''}
              />
            </label>
          ) : null}
          {selectedNode?.type === 'image' ? (
            <div className="space-y-3">
              <label className="flex flex-col gap-2 text-sm text-stone-600">
                <span>图片地址</span>
                <input
                  className="rounded-md border border-stone-300 px-3 py-2"
                  onChange={(event) =>
                    updateSelectedNodeContent({ src: event.target.value })
                  }
                  value={selectedNode.content.src ?? ''}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-600">
                <span>图片描述</span>
                <input
                  className="rounded-md border border-stone-300 px-3 py-2"
                  onChange={(event) =>
                    updateSelectedNodeContent({ alt: event.target.value })
                  }
                  value={selectedNode.content.alt ?? ''}
                />
              </label>
            </div>
          ) : null}
          {selectedNode?.type === 'container' ? (
            <div className="space-y-3">
              <label className="flex flex-col gap-2 text-sm text-stone-600">
                <span>背景颜色</span>
                <input
                  className="rounded-md border border-stone-300 px-3 py-2"
                  onChange={(event) =>
                    updateSelectedNodeStyle({ background: event.target.value })
                  }
                  value={selectedNode.style.background ?? ''}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-600">
                <span>圆角</span>
                <input
                  className="rounded-md border border-stone-300 px-3 py-2"
                  inputMode="numeric"
                  onChange={(event) =>
                    updateSelectedNodeStyle({
                      radius: Number(event.target.value) || 0,
                    })
                  }
                  value={selectedNode.style.radius ?? 0}
                />
              </label>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-stone-500">选择节点后编辑内容与样式。</p>
      )}
      <CodePreviewPanel />
    </aside>
  )
}
