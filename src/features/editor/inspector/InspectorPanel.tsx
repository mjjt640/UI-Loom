import type { ExportTargetId } from '../../../domain/exporter/exportTypes'
import { useEditorStore } from '../../../store/editorStore'
import { CodePreviewPanel } from '../../preview/CodePreviewPanel'

function numericInputValue(value: number | 'hug' | 'fill' | undefined) {
  return typeof value === 'number' ? value : 0
}

function styleNumberValue(value: number | undefined, defaultValue = 0) {
  return value ?? defaultValue
}

interface InspectorPanelProps {
  exportTargetId: ExportTargetId
}

export function InspectorPanel({ exportTargetId }: InspectorPanelProps) {
  const document = useEditorStore((state) => state.document)
  const updateSelectedNodeContent = useEditorStore(
    (state) => state.updateSelectedNodeContent,
  )
  const updateSelectedNodeComponentHint = useEditorStore(
    (state) => state.updateSelectedNodeComponentHint,
  )
  const updateSelectedNodeLayout = useEditorStore(
    (state) => state.updateSelectedNodeLayout,
  )
  const updateSelectedNodeName = useEditorStore(
    (state) => state.updateSelectedNodeName,
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
  const showLayoutControls =
    selectedNode?.type === 'frame' || selectedNode?.type === 'container'
  const showComponentControls =
    selectedNode?.type === 'frame' || selectedNode?.type === 'container'
  const showAppearanceControls =
    selectedNode?.type === 'container' ||
    selectedNode?.type === 'frame' ||
    selectedNode?.type === 'rect' ||
    selectedNode?.type === 'button' ||
    selectedNode?.type === 'image' ||
    selectedNode?.type === 'text'
  const selectedPadding = selectedNode?.layout.padding?.top ?? 0

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
                    numericInputValue(selectedNode.layout.width)
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
                    numericInputValue(selectedNode.layout.height)
                  }
                />
              </label>
              {selectedNode.type !== 'container' &&
              selectedNode.type !== 'frame' &&
              selectedNode.type !== 'rect' ? (
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
          {selectedNode && showComponentControls ? (
            <div className="space-y-3 rounded-xl border border-stone-200 p-3">
              <p className="text-sm font-medium text-stone-700">组件语义</p>
              <label className="flex flex-col gap-2 text-sm text-stone-600">
                <span>图层名称</span>
                <input
                  className="rounded-md border border-stone-300 px-3 py-2"
                  onChange={(event) => updateSelectedNodeName(event.target.value)}
                  value={selectedNode.name}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-600">
                <span>组件标识</span>
                <input
                  className="rounded-md border border-stone-300 px-3 py-2"
                  onChange={(event) =>
                    updateSelectedNodeComponentHint(event.target.value)
                  }
                  value={selectedNode.meta.componentHint ?? ''}
                />
              </label>
            </div>
          ) : null}
          {selectedNode && showLayoutControls ? (
            <div className="space-y-3 rounded-xl border border-stone-200 p-3">
              <p className="text-sm font-medium text-stone-700">Auto Layout</p>
              <label className="flex flex-col gap-2 text-sm text-stone-600">
                <span>布局方向</span>
                <select
                  className="rounded-md border border-stone-300 bg-white px-3 py-2"
                  onChange={(event) =>
                    updateSelectedNodeLayout({
                      mode: event.target.value === 'flex-row'
                        ? 'flex-row'
                        : 'flex-column',
                    })
                  }
                  value={selectedNode.layout.mode}
                >
                  <option value="flex-column">纵向</option>
                  <option value="flex-row">横向</option>
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-2 text-sm text-stone-600">
                  <span>间距</span>
                  <input
                    className="rounded-md border border-stone-300 px-3 py-2"
                    inputMode="numeric"
                    onChange={(event) =>
                      updateSelectedNodeLayout({
                        gap: Number(event.target.value) || 0,
                      })
                    }
                    value={selectedNode.layout.gap ?? 0}
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-stone-600">
                  <span>内边距</span>
                  <input
                    className="rounded-md border border-stone-300 px-3 py-2"
                    inputMode="numeric"
                    onChange={(event) => {
                      const padding = Number(event.target.value) || 0

                      updateSelectedNodeLayout({
                        padding: {
                          top: padding,
                          right: padding,
                          bottom: padding,
                          left: padding,
                        },
                      })
                    }}
                    value={selectedPadding}
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-2 text-sm text-stone-600">
                  <span>对齐方式</span>
                  <select
                    className="rounded-md border border-stone-300 bg-white px-3 py-2"
                    onChange={(event) =>
                      updateSelectedNodeLayout({
                        align: event.target.value as
                          | 'start'
                          | 'center'
                          | 'end'
                          | 'stretch',
                      })
                    }
                    value={selectedNode.layout.align ?? 'start'}
                  >
                    <option value="start">起点</option>
                    <option value="center">居中</option>
                    <option value="end">终点</option>
                    <option value="stretch">拉伸</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-sm text-stone-600">
                  <span>分布方式</span>
                  <select
                    className="rounded-md border border-stone-300 bg-white px-3 py-2"
                    onChange={(event) =>
                      updateSelectedNodeLayout({
                        justify: event.target.value as
                          | 'start'
                          | 'center'
                          | 'end'
                          | 'between',
                      })
                    }
                    value={selectedNode.layout.justify ?? 'start'}
                  >
                    <option value="start">起点</option>
                    <option value="center">居中</option>
                    <option value="end">终点</option>
                    <option value="between">两端</option>
                  </select>
                </label>
              </div>
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
          {selectedNode && showAppearanceControls ? (
            <div className="space-y-3 rounded-xl border border-stone-200 p-3">
              <p className="text-sm font-medium text-stone-700">外观</p>
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
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-2 text-sm text-stone-600">
                  <span>边框宽度</span>
                  <input
                    className="rounded-md border border-stone-300 px-3 py-2"
                    inputMode="numeric"
                    onChange={(event) =>
                      updateSelectedNodeStyle({
                        borderWidth: Number(event.target.value) || 0,
                      })
                    }
                    value={styleNumberValue(selectedNode.style.borderWidth)}
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-stone-600">
                  <span>边框颜色</span>
                  <input
                    className="rounded-md border border-stone-300 px-3 py-2"
                    onChange={(event) =>
                      updateSelectedNodeStyle({ borderColor: event.target.value })
                    }
                    value={selectedNode.style.borderColor ?? ''}
                  />
                </label>
              </div>
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
              <label className="flex flex-col gap-2 text-sm text-stone-600">
                <span>阴影</span>
                <input
                  className="rounded-md border border-stone-300 px-3 py-2"
                  onChange={(event) =>
                    updateSelectedNodeStyle({ shadow: event.target.value })
                  }
                  value={selectedNode.style.shadow ?? ''}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-600">
                <span>透明度</span>
                <input
                  className="rounded-md border border-stone-300 px-3 py-2"
                  key={selectedNodeId}
                  inputMode="decimal"
                  onChange={(event) => {
                    const nextDraft = event.target.value
                    const nextOpacity = Number(nextDraft)

                    if (nextDraft === '') {
                      updateSelectedNodeStyle({ opacity: undefined })
                      return
                    }

                    if (Number.isFinite(nextOpacity)) {
                      updateSelectedNodeStyle({ opacity: nextOpacity })
                    }
                  }}
                  defaultValue={styleNumberValue(selectedNode.style.opacity, 1)}
                />
              </label>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-stone-500">选择节点后编辑内容与样式。</p>
      )}
      <CodePreviewPanel exportTargetId={exportTargetId} />
    </aside>
  )
}
