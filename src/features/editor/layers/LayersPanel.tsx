import { useEffect, useMemo, useRef, useState } from 'react'
import { useEditorStore } from '../../../store/editorStore'
import type { UINode } from '../../../domain/model/types'
import {
  loadRemixLinearIcons,
  type RemixIconResource,
} from '../../../domain/resources/remixIconLibrary'
import type { EditorToolMode } from '../EditorScreen'

type SidePanel = 'artboard' | 'components' | 'layers' | 'resources'

interface LayersPanelProps {
  activePanel: SidePanel
  onPanelChange: (panel: SidePanel) => void
  onResourceIconSelect: (icon: RemixIconResource) => void
  onToolModeChange: (toolMode: EditorToolMode) => void
}

interface ComponentPreset {
  description: string
  label: string
  mode: Extract<
    EditorToolMode,
    'component-card' | 'component-input' | 'component-list'
  >
  source: string
}

const canvasPresetGroups = [
  {
    name: '手机',
    presets: [
      { name: 'iPhone 15', width: 393, height: 852 },
      { name: 'iPhone 15 Pro Max', width: 430, height: 932 },
      { name: 'Android Compact', width: 360, height: 800 },
    ],
  },
  {
    name: '平板',
    presets: [
      { name: 'iPad Mini / Air', width: 744, height: 1133 },
      { name: 'iPad Pro 11"', width: 834, height: 1194 },
      { name: 'iPad Pro 12.9', width: 1024, height: 1366 },
      { name: 'Surface Pro 3', width: 1440, height: 990 },
      { name: 'Surface Pro 4', width: 1368, height: 912 },
    ],
  },
  {
    name: '桌面端',
    presets: [
      { name: 'Desktop 1440', width: 1440, height: 900 },
      { name: 'Desktop 1920', width: 1920, height: 1080 },
      { name: 'MacBook Pro', width: 1512, height: 982 },
    ],
  },
  {
    name: 'Web',
    presets: [
      { name: 'Landing Page', width: 1440, height: 1800 },
      { name: 'Dashboard', width: 1280, height: 900 },
      { name: 'Web App', width: 1366, height: 768 },
    ],
  },
]

const componentPresets: ComponentPreset[] = [
  {
    description: '内容容器、信息卡片、设置项面板',
    label: 'Card',
    mode: 'component-card',
    source: 'shadcn/ui',
  },
  {
    description: '表单输入框、搜索栏、邮箱输入',
    label: 'Input',
    mode: 'component-input',
    source: 'shadcn/ui',
  },
  {
    description: '导航列表、菜单项、设置列表',
    label: 'List',
    mode: 'component-list',
    source: 'shadcn/ui',
  },
]

const remixIconCategoryLabels: Record<string, string> = {
  Arrows: '箭头',
  Buildings: '建筑',
  Business: '商务',
  Communication: '沟通',
  Design: '设计',
  Development: '开发',
  Device: '设备',
  Document: '文档',
  Editor: '编辑',
  Finance: '金融',
  Food: '餐饮',
  Health: '健康',
  Logos: '品牌',
  Map: '地图',
  Media: '媒体',
  Others: '其他',
  System: '系统',
  'User & Faces': '用户与头像',
  Weather: '天气',
}

function remixIconCategoryLabel(category: string) {
  return remixIconCategoryLabels[category] ?? category
}

const resourceFavoriteIconNamesStorageKey = 'ui-loom.resource.favoriteIconNames'
const resourceRecentIconNamesStorageKey = 'ui-loom.resource.recentIconNames'
const resourcePinnedCategoryNamesStorageKey =
  'ui-loom.resource.pinnedCategoryNames'

function readStoredResourceNames(key: string) {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const value = JSON.parse(window.localStorage.getItem(key) ?? '[]')

    return Array.isArray(value)
      ? value.filter((name): name is string => typeof name === 'string')
      : []
  } catch {
    return []
  }
}

function writeStoredResourceNames(key: string, names: readonly string[]) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(names))
}

function addResourceNameFirst(
  names: readonly string[],
  name: string,
  limit = 8,
) {
  return [name, ...names.filter((storedName) => storedName !== name)].slice(
    0,
    limit,
  )
}

function layerDisplayName(node: UINode) {
  const defaultNames: Record<string, string> = {
    Button: 'Button',
    Card: 'Card',
    Container: 'Container',
    Frame: 'Frame',
    Group: 'Group',
    Image: 'Image',
    Input: 'Input',
    Icon: 'Icon',
    List: 'List',
    Page: 'Page',
    Rectangle: '矩形 1',
    Text: 'Text',
  }

  return defaultNames[node.name] ?? node.name
}

function ComponentLibraryPanel({
  onToolModeChange,
}: {
  onToolModeChange: (toolMode: EditorToolMode) => void
}) {
  return (
    <div className="h-full overflow-y-auto bg-[#fbfcfe]">
      <div className="border-b border-[#e7ebf2] px-4 py-3">
        <p className="text-xs font-medium text-[#8a94a6]">Open source</p>
        <h2 className="mt-1 text-sm font-semibold text-[#1f2329]">
          开源组件库
        </h2>
        <p className="mt-1 text-xs text-[#6b7280]">
          第一批接入 shadcn/ui 风格预设，选择后在画布拖拽放置。
        </p>
      </div>
      <div className="space-y-3 p-4">
        {componentPresets.map((preset) => (
          <button
            aria-label={`选择 ${preset.label} 组件`}
            className="w-full rounded-[14px] border border-[#dfe4ec] bg-white p-3 text-left shadow-[0_8px_22px_rgba(15,23,42,0.04)] transition hover:border-[#1677ff] hover:shadow-[0_14px_30px_rgba(22,119,255,0.12)]"
            key={preset.mode}
            onClick={() => onToolModeChange(preset.mode)}
            type="button"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#1f2329]">
                {preset.label}
              </span>
              <span className="rounded-full bg-[#edf4ff] px-2 py-0.5 text-xs font-medium text-[#1677ff]">
                {preset.source}
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-[#6b7280]">
              {preset.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}

function numericRootSize(rootNode: UINode) {
  return {
    height: typeof rootNode.layout.height === 'number' ? rootNode.layout.height : 900,
    width: typeof rootNode.layout.width === 'number' ? rootNode.layout.width : 1440,
  }
}

function ArtboardPresetPanel() {
  const document = useEditorStore((state) => state.document)
  const updateCanvasSize = useEditorStore((state) => state.updateCanvasSize)
  const rootNode = document.nodes[document.rootNodeId]
  const rootSize = numericRootSize(rootNode)
  const customWidthRef = useRef<HTMLInputElement>(null)
  const customHeightRef = useRef<HTMLInputElement>(null)

  const applyCustomSize = () => {
    const width = Number(customWidthRef.current?.value)
    const height = Number(customHeightRef.current?.value)

    if (
      Number.isFinite(width) &&
      Number.isFinite(height) &&
      width >= 1 &&
      height >= 1
    ) {
      updateCanvasSize({ height, width })
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-[#fbfcfe]">
      <div className="border-b border-[#e7ebf2] px-4 py-3">
        <p className="text-xs font-medium text-[#8a94a6]">Frame presets</p>
        <h2 className="mt-1 text-sm font-semibold text-[#1f2329]">画板尺寸</h2>
        <p className="mt-1 text-xs text-[#6b7280]">
          按设备选择画布，或输入自定义尺寸。
        </p>
      </div>
      <div className="space-y-4 p-4">
        <div className="rounded-[14px] border border-[#dfe4ec] bg-white p-3 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1f2329]">当前画板</span>
            <span className="rounded-full bg-[#edf4ff] px-2 py-0.5 text-xs font-medium text-[#1677ff]">
              {rootSize.width} × {rootSize.height}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1 text-xs text-[#6b7280]">
            <span>宽度</span>
            <input
              aria-label="画板宽度"
              className="rounded-lg border border-[#dfe4ec] bg-white px-2 py-1.5 text-sm text-[#1f2329] outline-none focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff]/10"
              defaultValue={rootSize.width}
              inputMode="numeric"
              key={`width-${rootSize.width}`}
              ref={customWidthRef}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[#6b7280]">
            <span>高度</span>
            <input
              aria-label="画板高度"
              className="rounded-lg border border-[#dfe4ec] bg-white px-2 py-1.5 text-sm text-[#1f2329] outline-none focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff]/10"
              defaultValue={rootSize.height}
              inputMode="numeric"
              key={`height-${rootSize.height}`}
              ref={customHeightRef}
            />
          </label>
          <button
            className="col-span-2 rounded-lg bg-[#1677ff] px-3 py-2 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(22,119,255,0.2)]"
            onClick={applyCustomSize}
            type="button"
          >
            应用自定义画板尺寸
          </button>
          </div>
        </div>
        {canvasPresetGroups.map((group) => (
          <section key={group.name}>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#1f2329]">
              <span className="text-[#8a94a6]">▾</span>
              <span>{group.name}</span>
              <span className="text-xs font-normal text-[#8a94a6]">
                ({group.presets.length})
              </span>
            </div>
            <div className="space-y-1">
              {group.presets.map((preset) => {
                const selected =
                  preset.width === rootSize.width && preset.height === rootSize.height

                return (
                  <button
                    aria-label={`${preset.name} ${preset.width} × ${preset.height}`}
                    className={
                      selected
                        ? 'flex w-full items-center justify-between rounded-lg bg-[#e8f2ff] px-3 py-2 text-sm font-medium text-[#1677ff]'
                        : 'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-[#4b5563] hover:bg-[#f3f6fa] hover:text-[#1677ff]'
                    }
                    key={preset.name}
                    onClick={() =>
                      updateCanvasSize({
                        height: preset.height,
                        width: preset.width,
                      })
                    }
                    type="button"
                  >
                    <span>{preset.name}</span>
                    <span>
                      {preset.width} × {preset.height}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function ResourceLibraryPanel({
  onResourceIconSelect,
}: {
  onResourceIconSelect: (icon: RemixIconResource) => void
}) {
  const [query, setQuery] = useState('')
  const [icons, setIcons] = useState<readonly RemixIconResource[]>([])
  const [loadState, setLoadState] = useState<'error' | 'loading' | 'ready'>(
    'loading',
  )
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [favoriteIconNames, setFavoriteIconNames] = useState<readonly string[]>(
    () => readStoredResourceNames(resourceFavoriteIconNamesStorageKey),
  )
  const [recentIconNames, setRecentIconNames] = useState<readonly string[]>(
    () => readStoredResourceNames(resourceRecentIconNamesStorageKey),
  )
  const [pinnedCategoryNames, setPinnedCategoryNames] = useState<
    readonly string[]
  >(() => readStoredResourceNames(resourcePinnedCategoryNamesStorageKey))
  const normalizedQuery = query.trim().toLowerCase()

  useEffect(() => {
    writeStoredResourceNames(
      resourceFavoriteIconNamesStorageKey,
      favoriteIconNames,
    )
  }, [favoriteIconNames])

  useEffect(() => {
    writeStoredResourceNames(resourceRecentIconNamesStorageKey, recentIconNames)
  }, [recentIconNames])

  useEffect(() => {
    writeStoredResourceNames(
      resourcePinnedCategoryNamesStorageKey,
      pinnedCategoryNames,
    )
  }, [pinnedCategoryNames])

  useEffect(() => {
    let mounted = true

    void loadRemixLinearIcons()
      .then((loadedIcons) => {
        if (mounted) {
          setIcons(loadedIcons)
          setLoadState('ready')
        }
      })
      .catch(() => {
        if (mounted) {
          setIcons([])
          setLoadState('error')
        }
      })

    return () => {
      mounted = false
    }
  }, [loadAttempt])

  const retryLoad = () => {
    setIcons([])
    setLoadState('loading')
    setSelectedCategory(null)
    setLoadAttempt((attempt) => attempt + 1)
  }

  const categoryOptions = useMemo(() => {
    const counts = new Map<string, number>()

    icons.forEach((icon) => {
      counts.set(icon.category, (counts.get(icon.category) ?? 0) + 1)
    })

    return [...counts.entries()]
      .map(([name, count]) => ({
        count,
        label: remixIconCategoryLabel(name),
        name,
      }))
      .sort((first, second) => {
        const firstPinnedIndex = pinnedCategoryNames.indexOf(first.name)
        const secondPinnedIndex = pinnedCategoryNames.indexOf(second.name)
        const firstIsPinned = firstPinnedIndex >= 0
        const secondIsPinned = secondPinnedIndex >= 0

        if (firstIsPinned && secondIsPinned) {
          return firstPinnedIndex - secondPinnedIndex
        }

        if (firstIsPinned) {
          return -1
        }

        if (secondIsPinned) {
          return 1
        }

        return 0
      })
  }, [icons, pinnedCategoryNames])

  const visibleIcons = useMemo(
    () =>
      icons.filter((icon) => {
        if (selectedCategory !== null && icon.category !== selectedCategory) {
          return false
        }

        if (!normalizedQuery) {
          return true
        }

        return [icon.name, icon.category, icon.source, ...icon.tags]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)
      }),
    [icons, normalizedQuery, selectedCategory],
  )
  const selectedCategoryLabel =
    selectedCategory === null
      ? '全部图标'
      : remixIconCategoryLabel(selectedCategory)
  const filterSummaryParts =
    selectedCategory === null
      ? ['全部图标']
      : [`分类 ${selectedCategoryLabel}`]
  const trimmedQuery = query.trim()
  const hasQuery = trimmedQuery.length > 0

  if (hasQuery) {
    filterSummaryParts.push(`关键词 ${trimmedQuery}`)
  }

  const clearSearch = () => {
    setQuery('')
  }

  const clearFilters = () => {
    setQuery('')
    setSelectedCategory(null)
  }
  const iconsByName = useMemo(() => {
    const iconMap = new Map<string, RemixIconResource>()

    icons.forEach((icon) => {
      iconMap.set(icon.name, icon)
    })

    return iconMap
  }, [icons])
  const favoriteIcons = favoriteIconNames
    .map((name) => iconsByName.get(name))
    .filter((icon): icon is RemixIconResource => icon !== undefined)
  const recentIcons = recentIconNames
    .map((name) => iconsByName.get(name))
    .filter((icon): icon is RemixIconResource => icon !== undefined)
  const selectResourceIcon = (icon: RemixIconResource) => {
    setRecentIconNames((names) => addResourceNameFirst(names, icon.name))
    setPinnedCategoryNames((names) =>
      addResourceNameFirst(names, icon.category, 4),
    )
    onResourceIconSelect(icon)
  }
  const toggleFavoriteIcon = (icon: RemixIconResource) => {
    setFavoriteIconNames((names) =>
      names.includes(icon.name)
        ? names.filter((name) => name !== icon.name)
        : addResourceNameFirst(names, icon.name),
    )
  }
  const renderShortcutIconButton = (
    icon: RemixIconResource,
    shortcutType: 'favorite' | 'recent',
  ) => (
    <button
      aria-label={
        shortcutType === 'favorite'
          ? `选择收藏图标 ${icon.name}`
          : `选择最近使用图标 ${icon.name}`
      }
      className="flex min-w-[96px] items-center gap-2 rounded-md border border-[#d9dde5] bg-white px-2 py-2 text-left text-xs text-[#4b5563] hover:border-[#1677ff] hover:text-[#1677ff]"
      key={`${shortcutType}-${icon.name}`}
      onClick={() => selectResourceIcon(icon)}
      type="button"
    >
      <svg
        aria-hidden="true"
        className="h-4 w-4 shrink-0"
        fill="currentColor"
        viewBox={icon.viewBox}
      >
        <path d={icon.svgPath} />
      </svg>
      <span className="truncate">{icon.name}</span>
    </button>
  )
  const renderIconCard = (icon: RemixIconResource) => {
    const isFavorite = favoriteIconNames.includes(icon.name)

    return (
      <div className="group text-left" key={icon.name}>
        <div className="relative">
          <button
            aria-label={icon.name}
            className="flex h-[128px] w-full items-center justify-center rounded-sm border border-[#d9dde5] bg-[#e7e7e7] text-[#a3a3a3] transition group-hover:border-[#1677ff] group-hover:bg-[#eef6ff] group-hover:text-[#1677ff]"
            onClick={() => selectResourceIcon(icon)}
            type="button"
          >
            <svg
              aria-hidden="true"
              className="h-7 w-7"
              fill="currentColor"
              viewBox={icon.viewBox}
            >
              <path d={icon.svgPath} />
            </svg>
          </button>
          <button
            aria-label={
              isFavorite ? `取消收藏 ${icon.name}` : `收藏 ${icon.name}`
            }
            aria-pressed={isFavorite}
            className={
              isFavorite
                ? 'absolute right-2 top-2 rounded-full bg-[#1677ff] px-2 py-1 text-xs font-semibold text-white shadow-sm'
                : 'absolute right-2 top-2 rounded-full border border-[#d9dde5] bg-white px-2 py-1 text-xs font-semibold text-[#4b5563] shadow-sm hover:border-[#1677ff] hover:text-[#1677ff]'
            }
            onClick={() => toggleFavoriteIcon(icon)}
            type="button"
          >
            收藏
          </button>
        </div>
        <span className="mt-1.5 block truncate text-sm text-[#4b5563]">
          {icon.name}
        </span>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-[#fbfcfe] px-3 py-3">
      <div
        aria-label="资源类型"
        className="grid grid-cols-4 rounded-md bg-[#f3f4f6] p-0.5 text-sm font-semibold text-[#7b8190]"
        role="tablist"
      >
        {['规范', '素材', '图标', '图库'].map((name) => (
          <button
            aria-selected={name === '图标'}
            className={
              name === '图标'
                ? 'rounded bg-white py-1.5 text-[#1f2329] shadow-sm'
                : 'rounded py-1.5'
            }
            key={name}
            role="tab"
            type="button"
          >
            {name}
          </button>
        ))}
      </div>
      <label className="mt-3 flex h-10 items-center gap-2 border-b border-[#e5e7eb] text-sm text-[#8a94a6]">
        <span className="text-lg">⌕</span>
        <input
          aria-label="搜索资源"
          className="min-w-0 flex-1 bg-transparent text-sm text-[#1f2329] outline-none placeholder:text-[#9aa3af]"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索"
          type="search"
          value={query}
        />
        <span>⌄</span>
      </label>
      <div className="mt-5 flex items-center gap-3 text-sm text-[#1f2329]">
        <span className="text-lg">‹</span>
        <h2 className="font-semibold">
          Remix 线性图标库
          <span className="ml-1 font-normal text-[#8a94a6]">
            ({icons.length})
          </span>
        </h2>
      </div>
      {loadState === 'ready' ? (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold text-[#8a94a6]">分类</p>
          <div
            aria-label="图标分类"
            className="flex flex-wrap gap-2"
            role="group"
          >
            <button
              aria-pressed={selectedCategory === null}
              className={
                selectedCategory === null
                  ? 'rounded-full bg-[#1677ff] px-3 py-1.5 text-xs font-semibold text-white'
                  : 'rounded-full border border-[#d9dde5] bg-white px-3 py-1.5 text-xs font-semibold text-[#4b5563] hover:border-[#1677ff] hover:text-[#1677ff]'
              }
              onClick={() => setSelectedCategory(null)}
              type="button"
            >
              全部 {icons.length}
            </button>
            {categoryOptions.map((category) => (
              <button
                aria-pressed={selectedCategory === category.name}
                className={
                  selectedCategory === category.name
                    ? 'rounded-full bg-[#1677ff] px-3 py-1.5 text-xs font-semibold text-white'
                    : 'rounded-full border border-[#d9dde5] bg-white px-3 py-1.5 text-xs font-semibold text-[#4b5563] hover:border-[#1677ff] hover:text-[#1677ff]'
                }
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                type="button"
              >
                {category.label} {category.count}
              </button>
            ))}
          </div>
          <div className="rounded-lg border border-[#d9dde5] bg-white px-3 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="text-xs font-semibold text-[#1f2329]">
                  显示 {visibleIcons.length} / {icons.length} 个图标
                </p>
                <p className="text-xs text-[#6b7280]">
                  当前筛选：{filterSummaryParts.join(' · ')}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap justify-end gap-2">
                {hasQuery ? (
                  <button
                    className="rounded-md border border-[#d9dde5] bg-white px-2 py-1 text-xs font-semibold text-[#4b5563] hover:border-[#1677ff] hover:text-[#1677ff]"
                    onClick={clearSearch}
                    type="button"
                  >
                    清除搜索
                  </button>
                ) : null}
                {selectedCategory !== null || hasQuery ? (
                  <button
                    className="rounded-md bg-[#edf4ff] px-2 py-1 text-xs font-semibold text-[#1677ff] hover:bg-[#dfefff]"
                    onClick={clearFilters}
                    type="button"
                  >
                    清除筛选
                  </button>
                ) : null}
              </div>
            </div>
          </div>
          {favoriteIcons.length > 0 ? (
            <section
              aria-label="收藏图标"
              className="rounded-lg border border-[#d9dde5] bg-white px-3 py-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-[#1f2329]">
                  收藏图标
                </h3>
                <span className="text-xs text-[#8a94a6]">
                  {favoriteIcons.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {favoriteIcons.map((icon) =>
                  renderShortcutIconButton(icon, 'favorite'),
                )}
              </div>
            </section>
          ) : null}
          {recentIcons.length > 0 ? (
            <section
              aria-label="最近使用图标"
              className="rounded-lg border border-[#d9dde5] bg-white px-3 py-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-[#1f2329]">
                  最近使用
                </h3>
                <span className="text-xs text-[#8a94a6]">
                  {recentIcons.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentIcons.map((icon) =>
                  renderShortcutIconButton(icon, 'recent'),
                )}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
      <div className="mt-5 space-y-4">
        <section>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1f2329]">
            <span className="text-xs">▾</span>
            <span>{selectedCategoryLabel}</span>
            <span className="text-xs font-normal text-[#8a94a6]">
              ({visibleIcons.length})
            </span>
          </div>
          {loadState === 'loading' ? (
            <div
              className="rounded-lg border border-[#d9dde5] bg-white px-3 py-4 text-sm text-[#6b7280]"
              role="status"
            >
              正在加载 Remix 图标...
            </div>
          ) : loadState === 'error' ? (
            <div
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-4 text-sm text-red-700"
              role="alert"
            >
              <p>资源加载失败，请稍后重试。</p>
              <button
                className="mt-3 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100"
                onClick={retryLoad}
                type="button"
              >
                重试
              </button>
            </div>
          ) : visibleIcons.length === 0 ? (
            <div
              className="rounded-lg border border-[#d9dde5] bg-white px-3 py-4 text-sm text-[#6b7280]"
              role="status"
            >
              没有找到匹配的图标。
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              {visibleIcons.map((icon) => renderIconCard(icon))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function panelTabClass(selected: boolean) {
  return selected
    ? 'border-b-2 border-neutral-900 pb-3 text-neutral-900'
    : 'pb-3'
}

export function LayersPanel({
  activePanel,
  onPanelChange,
  onResourceIconSelect,
  onToolModeChange,
}: LayersPanelProps) {
  const document = useEditorStore((state) => state.document)
  const moveLayerBackward = useEditorStore((state) => state.moveLayerBackward)
  const moveLayerForward = useEditorStore((state) => state.moveLayerForward)
  const selectNode = useEditorStore((state) => state.selectNode)
  const setLayerLocked = useEditorStore((state) => state.setLayerLocked)
  const setLayerVisible = useEditorStore((state) => state.setLayerVisible)
  const toggleNodeSelection = useEditorStore((state) => state.toggleNodeSelection)
  const rootNode = document.nodes[document.rootNodeId]
  const orderedNodes = [
    rootNode,
    ...rootNode.children.map((nodeId) => document.nodes[nodeId]),
  ]

  return (
    <aside className="flex min-h-0 flex-col border-r border-neutral-200 bg-white">
      <div className="flex h-12 items-end gap-5 border-b border-neutral-200 px-4 text-sm font-semibold text-neutral-500">
        <button
          aria-selected={activePanel === 'layers'}
          className={panelTabClass(activePanel === 'layers')}
          onClick={() => onPanelChange('layers')}
          role="tab"
          type="button"
        >
          图层
        </button>
        <button
          aria-selected={activePanel === 'components'}
          className={panelTabClass(activePanel === 'components')}
          onClick={() => onPanelChange('components')}
          role="tab"
          type="button"
        >
          组件
        </button>
        <button
          aria-selected={activePanel === 'resources'}
          className={panelTabClass(activePanel === 'resources')}
          onClick={() => onPanelChange('resources')}
          role="tab"
          type="button"
        >
          资源
        </button>
        <button className="pb-3" role="tab" type="button">
          AI <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-blue-500">New</span>
        </button>
      </div>
      {activePanel === 'artboard' ? (
        <ArtboardPresetPanel />
      ) : activePanel === 'components' ? (
        <ComponentLibraryPanel onToolModeChange={onToolModeChange} />
      ) : activePanel === 'resources' ? (
        <ResourceLibraryPanel onResourceIconSelect={onResourceIconSelect} />
      ) : (
        <>
      <div className="flex h-[202px] flex-col border-b border-neutral-100 px-4 py-3">
        <div className="mb-3 flex items-center justify-between text-sm text-neutral-500">
          <span>页数：1</span>
          <div className="flex gap-3 text-lg text-neutral-700">
            <button aria-label="新增页面" type="button">
              +
            </button>
            <button aria-label="收起页面" type="button">
              ⌃
            </button>
          </div>
        </div>
        <button className="flex items-center gap-2 px-2 py-1 text-sm font-semibold text-neutral-900" type="button">
          <span>✓</span>
          <span>页面 1</span>
        </button>
      </div>
      <div className="flex h-11 items-center gap-2 border-b border-neutral-100 px-3 text-sm text-neutral-500">
        <span className="text-lg">⌕</span>
        <span>搜索</span>
        <span className="ml-auto">⌄</span>
      </div>
      <ul className="space-y-1 p-3 text-sm text-neutral-600">
        {orderedNodes.map((node) => (
          <li
            aria-label={layerDisplayName(node)}
            className="rounded-lg border border-transparent"
            key={node.id}
          >
            <button
              className={
                document.selectedNodeIds.includes(node.id)
                  ? 'flex w-full items-center gap-2 rounded-md bg-blue-50 px-2 py-1.5 text-left font-medium text-blue-600'
                  : 'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-neutral-100'
              }
              onClick={() => selectNode(node.id)}
              type="button"
            >
              <span className="text-neutral-400">
                {node.type === 'page' ? '◇' : node.children.length > 0 ? '▾' : '□'}
              </span>
              <span>
                {layerDisplayName(node)}
                {node.meta.visible === false ? ' · 隐藏' : ''}
                {node.meta.locked ? ' · 锁定' : ''}
              </span>
            </button>
            {node.id !== document.rootNodeId ? (
              <div className="mt-1 grid grid-cols-4 gap-1 px-1 pb-1">
                <button
                  aria-label={`多选 ${layerDisplayName(node)}`}
                  className="rounded border border-neutral-200 px-1 py-0.5 text-xs"
                  onClick={() => toggleNodeSelection(node.id)}
                  type="button"
                >
                  多
                </button>
                <button
                  aria-label={`隐藏 ${layerDisplayName(node)}`}
                  className="rounded border border-neutral-200 px-1 py-0.5 text-xs"
                  hidden={node.meta.visible === false}
                  onClick={() => setLayerVisible(node.id, false)}
                  type="button"
                >
                  隐
                </button>
                <button
                  aria-label={`显示 ${layerDisplayName(node)}`}
                  className="rounded border border-neutral-200 px-1 py-0.5 text-xs"
                  hidden={node.meta.visible !== false}
                  onClick={() => setLayerVisible(node.id, true)}
                  type="button"
                >
                  显
                </button>
                <button
                  aria-label={`锁定 ${layerDisplayName(node)}`}
                  className="rounded border border-neutral-200 px-1 py-0.5 text-xs"
                  hidden={node.meta.locked === true}
                  onClick={() => setLayerLocked(node.id, true)}
                  type="button"
                >
                  锁
                </button>
                <button
                  aria-label={`解锁 ${layerDisplayName(node)}`}
                  className="rounded border border-neutral-200 px-1 py-0.5 text-xs"
                  hidden={node.meta.locked !== true}
                  onClick={() => setLayerLocked(node.id, false)}
                  type="button"
                >
                  解
                </button>
                <button
                  aria-label={`上移 ${layerDisplayName(node)}`}
                  className="rounded border border-neutral-200 px-1 py-0.5 text-xs"
                  onClick={() => moveLayerForward(node.id)}
                  type="button"
                >
                  上
                </button>
                <button
                  aria-label={`下移 ${layerDisplayName(node)}`}
                  className="rounded border border-neutral-200 px-1 py-0.5 text-xs"
                  onClick={() => moveLayerBackward(node.id)}
                  type="button"
                >
                  下
                </button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
        </>
      )}
    </aside>
  )
}
