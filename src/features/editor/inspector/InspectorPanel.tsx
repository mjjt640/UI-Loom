import { useId, useState } from 'react'
import type { ExportTargetId } from '../../../domain/exporter/exportTypes'
import type { LayoutSize } from '../../../domain/model/types'
import { useEditorStore } from '../../../store/editorStore'
import { CodePreviewPanel } from '../../preview/CodePreviewPanel'

const commonColorSwatches = [
  { color: '#ffffff', name: '纯白' },
  { color: '#111827', name: '深灰' },
  { color: '#1677ff', name: '品牌蓝' },
  { color: '#22c55e', name: '成功绿' },
  { color: '#f97316', name: '活力橙' },
  { color: '#facc15', name: '提示黄' },
  { color: '#ef4444', name: '危险红' },
  { color: '#dbeafe', name: '淡蓝' },
  { color: '#94a3b8', name: '线框灰' },
]

function numericInputValue(value: number | 'hug' | 'fill' | undefined) {
  return typeof value === 'number' ? value : 0
}

function styleNumberValue(value: number | undefined, defaultValue = 0) {
  return value ?? defaultValue
}

function sizeModeValue(value: LayoutSize) {
  return typeof value === 'number' ? 'fixed' : value
}

function numberOrUndefined(value: string) {
  if (value.trim() === '') {
    return undefined
  }

  const next = Number(value)

  return Number.isFinite(next) ? next : undefined
}

function hexColorForNativeInput(value: string | undefined) {
  const trimmedValue = value?.trim() ?? ''
  const shortHexMatch = /^#([0-9a-f]{3})$/i.exec(trimmedValue)

  if (/^#[0-9a-f]{6}$/i.test(trimmedValue)) {
    return trimmedValue.toLowerCase()
  }

  if (shortHexMatch) {
    return `#${shortHexMatch[1]
      .split('')
      .map((digit) => `${digit}${digit}`)
      .join('')}`.toLowerCase()
  }

  return '#ffffff'
}

interface ColorPickerFieldProps {
  label: string
  onChange: (value: string) => void
  value: string | undefined
}

function ColorPickerField({ label, onChange, value }: ColorPickerFieldProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const inputId = useId()
  const nativeColorValue = hexColorForNativeInput(value)
  const displayColor = value?.trim() || 'transparent'

  return (
    <div className="relative flex flex-col gap-2 text-sm text-stone-600">
      <span className="font-medium text-stone-700">{label}</span>
      <div className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white p-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <button
          aria-label={`打开${label}选择器`}
          aria-expanded={isPickerOpen}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-stone-200 bg-[linear-gradient(45deg,#e5e7eb_25%,transparent_25%),linear-gradient(-45deg,#e5e7eb_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e5e7eb_75%),linear-gradient(-45deg,transparent_75%,#e5e7eb_75%)] bg-[length:10px_10px] bg-[position:0_0,0_5px,5px_-5px,-5px_0px]"
          onClick={() => setIsPickerOpen((current) => !current)}
          type="button"
        >
          <span
            aria-hidden="true"
            className="h-6 w-6 rounded-[5px] shadow-inner ring-1 ring-black/10"
            style={{ background: displayColor }}
          />
        </button>
        <label className="min-w-0 flex-1" htmlFor={inputId}>
          <span className="sr-only">{label}</span>
          <input
            aria-label={label}
            className="h-8 w-full rounded-md border-0 bg-stone-50 px-2 font-mono text-xs uppercase text-stone-700 outline-none ring-1 ring-transparent transition focus:bg-white focus:ring-[#1677ff]"
            id={inputId}
            onChange={(event) => onChange(event.target.value)}
            placeholder="#000000"
            value={value ?? ''}
          />
        </label>
      </div>
      {isPickerOpen ? (
        <div
          aria-label={`${label}选择器`}
          className="absolute left-0 top-[76px] z-20 w-[252px] rounded-xl border border-neutral-200 bg-white p-3 text-neutral-700 shadow-[0_16px_45px_rgba(15,23,42,0.18)]"
          role="dialog"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-neutral-900">{label}</span>
            <span className="rounded-md bg-[#edf4ff] px-2 py-0.5 text-xs font-medium text-[#1677ff]">
              纯色
            </span>
          </div>
          <label className="relative block h-28 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
            <input
              aria-label={`${label}色盘`}
              className="absolute inset-0 h-full w-full cursor-crosshair opacity-0"
              onChange={(event) => onChange(event.target.value)}
              type="color"
              value={nativeColorValue}
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,#fff_0%,rgba(255,255,255,0)_32%),linear-gradient(90deg,#fff,rgba(255,255,255,0)),linear-gradient(0deg,#000,rgba(0,0,0,0)),linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)]"
            />
            <span
              aria-hidden="true"
              className="absolute right-3 top-3 h-4 w-4 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(15,23,42,0.32)]"
              style={{ background: nativeColorValue }}
            />
          </label>
          <div className="mt-3 grid grid-cols-[56px_1fr] items-center gap-2">
            <span className="text-xs font-medium text-neutral-500">HEX</span>
            <input
              aria-label={`${label}HEX`}
              className="h-8 rounded-md border border-neutral-200 bg-neutral-50 px-2 font-mono text-xs uppercase text-neutral-800 outline-none focus:border-[#1677ff] focus:bg-white"
              onChange={(event) => onChange(event.target.value)}
              value={value ?? ''}
            />
          </div>
          <div className="mt-3">
            <p className="mb-2 text-xs font-semibold text-neutral-500">常用</p>
            <div className="grid grid-cols-9 gap-1.5">
              {commonColorSwatches.map((swatch) => (
                <button
                  aria-label={`常用颜色 ${swatch.name} ${swatch.color}`}
                  className="h-5 w-5 rounded-md border border-neutral-200 shadow-sm transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#1677ff]"
                  key={swatch.color}
                  onClick={() => onChange(swatch.color)}
                  style={{ background: swatch.color }}
                  title={`${swatch.name} ${swatch.color}`}
                  type="button"
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

interface InspectorPanelProps {
  exportTargetId: ExportTargetId
}

const appearanceNodeTypes = new Set([
  'button',
  'container',
  'ellipse',
  'frame',
  'icon',
  'image',
  'path',
  'polygon',
  'rect',
  'slice',
  'star',
  'text',
  'triangle',
])

const directGraphicNodeTypes = new Set([
  'ellipse',
  'icon',
  'path',
  'polygon',
  'rect',
  'slice',
  'star',
  'triangle',
])

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
  const showAppearanceControls = selectedNode
    ? appearanceNodeTypes.has(selectedNode.type)
    : false
  const selectedPadding = selectedNode?.layout.padding?.top ?? 0

  return (
    <aside className="border-l border-neutral-200 bg-white">
      <div className="flex h-12 items-center justify-end gap-1 border-b border-neutral-200 px-4">
        <button
          aria-selected="true"
          className="rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-neutral-900 shadow-sm ring-1 ring-neutral-200"
          role="tab"
          type="button"
        >
          设计
        </button>
        <button
          className="rounded-md px-3 py-1.5 text-sm text-neutral-500 hover:bg-neutral-100"
          role="tab"
          type="button"
        >
          原型
        </button>
        <button
          className="rounded-md px-3 py-1.5 text-sm text-neutral-500 hover:bg-neutral-100"
          role="tab"
          type="button"
        >
          标注
        </button>
      </div>
      <div className="border-b border-neutral-100 p-4">
        <div className="mb-4 flex items-center justify-between text-sm font-semibold text-neutral-900">
          <span>画布背景色</span>
          <button className="text-xl font-normal text-neutral-600" type="button">
            +
          </button>
        </div>
        <label className="flex items-center gap-2 text-sm text-neutral-600">
          <input checked readOnly type="checkbox" />
          <span>导出时包含画布背景色</span>
        </label>
      </div>
      <div className="p-4">
      <h2 className="mb-3 text-sm font-semibold text-neutral-800">属性</h2>
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
                <span>宽度模式</span>
                <select
                  className="rounded-md border border-stone-300 bg-white px-3 py-2"
                  onChange={(event) => {
                    const mode = event.target.value

                    updateSelectedNodeLayout({
                      width:
                        mode === 'fill'
                          ? 'fill'
                          : mode === 'hug'
                            ? 'hug'
                            : numericInputValue(selectedNode.layout.width) || 320,
                    })
                  }}
                  value={sizeModeValue(selectedNode.layout.width)}
                >
                  <option value="fixed">固定</option>
                  <option value="fill">填充</option>
                  <option value="hug">自适应</option>
                </select>
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
              <label className="flex flex-col gap-2 text-sm text-stone-600">
                <span>高度模式</span>
                <select
                  className="rounded-md border border-stone-300 bg-white px-3 py-2"
                  onChange={(event) => {
                    const mode = event.target.value

                    updateSelectedNodeLayout({
                      height:
                        mode === 'fill'
                          ? 'fill'
                          : mode === 'hug'
                            ? 'hug'
                            : numericInputValue(selectedNode.layout.height) || 240,
                    })
                  }}
                  value={sizeModeValue(selectedNode.layout.height)}
                >
                  <option value="fixed">固定</option>
                  <option value="fill">填充</option>
                  <option value="hug">自适应</option>
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-600">
                <span>最小宽度</span>
                <input
                  className="rounded-md border border-stone-300 px-3 py-2"
                  inputMode="numeric"
                  onChange={(event) =>
                    updateSelectedNodeLayout({
                      minWidth: numberOrUndefined(event.target.value),
                    })
                  }
                  value={selectedNode.layout.minWidth ?? ''}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-600">
                <span>最大宽度</span>
                <input
                  className="rounded-md border border-stone-300 px-3 py-2"
                  inputMode="numeric"
                  onChange={(event) =>
                    updateSelectedNodeLayout({
                      maxWidth: numberOrUndefined(event.target.value),
                    })
                  }
                  value={selectedNode.layout.maxWidth ?? ''}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-600">
                <span>最小高度</span>
                <input
                  className="rounded-md border border-stone-300 px-3 py-2"
                  inputMode="numeric"
                  onChange={(event) =>
                    updateSelectedNodeLayout({
                      minHeight: numberOrUndefined(event.target.value),
                    })
                  }
                  value={selectedNode.layout.minHeight ?? ''}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-600">
                <span>最大高度</span>
                <input
                  className="rounded-md border border-stone-300 px-3 py-2"
                  inputMode="numeric"
                  onChange={(event) =>
                    updateSelectedNodeLayout({
                      maxHeight: numberOrUndefined(event.target.value),
                    })
                  }
                  value={selectedNode.layout.maxHeight ?? ''}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-600">
                <span>水平约束</span>
                <select
                  className="rounded-md border border-stone-300 bg-white px-3 py-2"
                  onChange={(event) =>
                    updateSelectedNodeLayout({
                      constraints: {
                        ...selectedNode.layout.constraints,
                        horizontal: event.target.value as
                          | 'left'
                          | 'center'
                          | 'right'
                          | 'stretch',
                      },
                    })
                  }
                  value={selectedNode.layout.constraints?.horizontal ?? 'left'}
                >
                  <option value="left">左侧</option>
                  <option value="center">居中</option>
                  <option value="right">右侧</option>
                  <option value="stretch">拉伸</option>
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm text-stone-600">
                <span>垂直约束</span>
                <select
                  className="rounded-md border border-stone-300 bg-white px-3 py-2"
                  onChange={(event) =>
                    updateSelectedNodeLayout({
                      constraints: {
                        ...selectedNode.layout.constraints,
                        vertical: event.target.value as
                          | 'top'
                          | 'center'
                          | 'bottom'
                          | 'stretch',
                      },
                    })
                  }
                  value={selectedNode.layout.constraints?.vertical ?? 'top'}
                >
                  <option value="top">顶部</option>
                  <option value="center">居中</option>
                  <option value="bottom">底部</option>
                  <option value="stretch">拉伸</option>
                </select>
              </label>
              {selectedNode.type !== 'container' &&
              selectedNode.type !== 'frame' &&
              !directGraphicNodeTypes.has(selectedNode.type) ? (
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
              <ColorPickerField
                label="背景颜色"
                onChange={(nextColor) =>
                  updateSelectedNodeStyle({ background: nextColor })
                }
                value={selectedNode.style.background}
              />
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
                <ColorPickerField
                  label="边框颜色"
                  onChange={(nextColor) =>
                    updateSelectedNodeStyle({ borderColor: nextColor })
                  }
                  value={selectedNode.style.borderColor}
                />
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
      </div>
    </aside>
  )
}
