import { useEffect, useMemo, useState } from 'react'
import type { EditorToolMode } from '../EditorScreen'

type ActiveTool =
  | 'select'
  | 'artboard'
  | 'frame'
  | 'shape'
  | 'slice'
  | 'pen'
  | 'text'
  | 'brush'
  | 'component'
  | 'resource'
  | 'zoom'

type OpenMenu = 'insert' | 'pen' | 'select' | 'shape' | null

interface ToolButtonProps {
  active: boolean
  label: string
  onClick: () => void
  children: React.ReactNode
  hasMenu?: boolean
  tooltipLabel?: string
  tooltipShortcut?: string
}

interface DesignToolbarProps {
  toolMode: EditorToolMode
  onToolModeChange: (toolMode: EditorToolMode) => void
}

interface MenuItemProps {
  children: React.ReactNode
  icon?: string
  onClick: () => void
  role?: 'menuitem' | 'menuitemradio'
  selected?: boolean
  shortcut?: string
}

function activeToolFromMode(toolMode: EditorToolMode): ActiveTool {
  if (toolMode === 'hand' || toolMode === 'scale') return 'select'
  if (toolMode === 'artboard') return 'artboard'
  if (
    toolMode === 'rect' ||
    toolMode === 'ellipse' ||
    toolMode === 'triangle' ||
    toolMode === 'star' ||
    toolMode === 'polygon' ||
    toolMode === 'image'
  ) {
    return 'shape'
  }
  if (toolMode === 'slice') return 'slice'
  if (toolMode === 'pencil') return 'pen'
  if (
    toolMode === 'button' ||
    toolMode === 'component-card' ||
    toolMode === 'component-input' ||
    toolMode === 'component-list' ||
    toolMode === 'resource-icon' ||
    toolMode === 'container' ||
    toolMode === 'frame'
  ) {
    return 'component'
  }
  return toolMode
}

function ChevronCorner() {
  return (
    <span
      aria-hidden="true"
      className="absolute bottom-1 right-1 h-0 w-0 border-l-[4px] border-t-[4px] border-l-transparent border-t-current opacity-50"
    />
  )
}

function IconBase({ children }: { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      className="h-[19px] w-[19px]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {children}
    </svg>
  )
}

function CursorIcon() {
  return (
    <IconBase>
      <path d="M5 4l12 8-6 1.5L8 20z" />
    </IconBase>
  )
}

function HandIcon() {
  return (
    <IconBase>
      <path d="M8 12V6.5a1.5 1.5 0 0 1 3 0V11" />
      <path d="M11 11V5.5a1.5 1.5 0 0 1 3 0V12" />
      <path d="M14 12V7.5a1.5 1.5 0 0 1 3 0v7" />
      <path d="M8 12l-1.4-1.4a1.6 1.6 0 0 0-2.2 2.3l4.4 5.4A5 5 0 0 0 12.7 20H14a5 5 0 0 0 5-5" />
    </IconBase>
  )
}

function ScaleIcon() {
  return (
    <IconBase>
      <path d="M7 17h10V7" />
      <path d="M7 17L17 7" />
      <path d="M7 11v6h6" />
    </IconBase>
  )
}

function ArtboardIcon() {
  return (
    <IconBase>
      <rect height="14" rx="1.5" width="14" x="5" y="5" />
      <path d="M9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4" />
    </IconBase>
  )
}

function RectIcon() {
  return (
    <IconBase>
      <rect height="13" rx="2" width="15" x="4.5" y="5.5" />
    </IconBase>
  )
}

function EllipseIcon() {
  return (
    <IconBase>
      <ellipse cx="12" cy="12" rx="7.5" ry="6.5" />
    </IconBase>
  )
}

function TriangleIcon() {
  return (
    <IconBase>
      <path d="M12 5l8 14H4z" />
    </IconBase>
  )
}

function StarIcon() {
  return (
    <IconBase>
      <path d="M12 4l2.2 5 5.4.5-4.1 3.6 1.2 5.3L12 15.6l-4.7 2.8 1.2-5.3-4.1-3.6 5.4-.5z" />
    </IconBase>
  )
}

function PolygonIcon() {
  return (
    <IconBase>
      <path d="M12 4l7 4v8l-7 4-7-4V8z" />
    </IconBase>
  )
}

function SliceIcon() {
  return (
    <IconBase>
      <path d="M6 4v16M18 4v16M4 8h16M4 16h16" />
    </IconBase>
  )
}

function ImageIcon() {
  return (
    <IconBase>
      <rect height="14" rx="2" width="16" x="4" y="5" />
      <path d="M7 15l3-3 2 2 2.5-3L18 15" />
      <circle cx="9" cy="9" r="1" />
    </IconBase>
  )
}

function PenIcon() {
  return (
    <IconBase>
      <path d="M4 20l4.5-1 9.8-9.8a2.1 2.1 0 0 0-3-3L5.5 16z" />
      <path d="M13.8 7.2l3 3" />
      <path d="M5.5 16l2.5 2.5" />
    </IconBase>
  )
}

function PencilIcon() {
  return (
    <IconBase>
      <path d="M4 20l4.2-1.1L19 8.1a2 2 0 0 0-2.8-2.8L5.4 16.1z" />
      <path d="M14.8 6.8l2.4 2.4" />
      <path d="M4 20c3-4 6-1 9-5" />
    </IconBase>
  )
}

function TextIcon() {
  return (
    <IconBase>
      <path d="M5 6h14M12 6v13M9 19h6" />
    </IconBase>
  )
}

function BrushIcon() {
  return (
    <IconBase>
      <path d="M15 4l5 5-8.5 8.5a3.5 3.5 0 0 1-5-5z" />
      <path d="M6 18c-1.5 0-2 .8-2 2 1.2-.3 2.7-.2 3.7-1.2" />
    </IconBase>
  )
}

function ComponentIcon() {
  return (
    <IconBase>
      <rect height="6" rx="1" width="6" x="4" y="4" />
      <rect height="6" rx="1" width="6" x="14" y="4" />
      <rect height="6" rx="1" width="6" x="4" y="14" />
      <rect height="6" rx="1" width="6" x="14" y="14" />
    </IconBase>
  )
}

function ButtonIcon() {
  return (
    <span className="text-[13px] font-semibold leading-none">B</span>
  )
}

function ResourceIcon() {
  return (
    <IconBase>
      <path d="M12 3l7 4v10l-7 4-7-4V7z" />
      <path d="M12 8l3 2v4l-3 2-3-2v-4z" />
    </IconBase>
  )
}

function ZoomIcon() {
  return (
    <IconBase>
      <circle cx="10.5" cy="10.5" r="5.5" />
      <path d="M15 15l5 5M8.5 10.5h4M10.5 8.5v4" />
    </IconBase>
  )
}

function MoreIcon() {
  return (
    <IconBase>
      <circle cx="6" cy="12" fill="currentColor" r="1" stroke="none" />
      <circle cx="12" cy="12" fill="currentColor" r="1" stroke="none" />
      <circle cx="18" cy="12" fill="currentColor" r="1" stroke="none" />
    </IconBase>
  )
}

function shapeToolIcon(toolMode: EditorToolMode) {
  if (toolMode === 'ellipse') return <EllipseIcon />
  if (toolMode === 'triangle') return <TriangleIcon />
  if (toolMode === 'star') return <StarIcon />
  if (toolMode === 'polygon') return <PolygonIcon />
  if (toolMode === 'image') return <ImageIcon />
  return <RectIcon />
}

function penToolIcon(toolMode: EditorToolMode) {
  return toolMode === 'pencil' ? <PencilIcon /> : <PenIcon />
}

function insertToolIcon(toolMode: EditorToolMode) {
  if (toolMode === 'button') return <ButtonIcon />
  if (toolMode === 'text') return <TextIcon />
  if (toolMode === 'image') return <ImageIcon />
  if (toolMode === 'frame') return <ArtboardIcon />
  return <ComponentIcon />
}

function ToolButton({
  active,
  children,
  hasMenu,
  label,
  onClick,
  tooltipLabel = label,
  tooltipShortcut,
}: ToolButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipName = tooltipShortcut
    ? `${tooltipLabel} ${tooltipShortcut}`
    : tooltipLabel

  return (
    <div className="relative">
      <button
        aria-label={label}
        aria-pressed={active}
        className={
          active
            ? 'relative flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#1677ff] text-white shadow-[0_8px_18px_rgba(22,119,255,0.28)]'
            : 'relative flex h-9 w-9 items-center justify-center rounded-[11px] text-[#2b2f36] transition-colors hover:bg-[#edf4ff] hover:text-[#1677ff]'
        }
        onBlur={() => setShowTooltip(false)}
        onClick={onClick}
        onFocus={() => setShowTooltip(true)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        type="button"
      >
        {children}
        {hasMenu ? <ChevronCorner /> : null}
      </button>
      {showTooltip ? (
        <div
          aria-label={tooltipName}
          className="pointer-events-none absolute left-[44px] top-1/2 z-40 flex -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-md bg-[#20242c] px-2 py-1 text-xs font-semibold leading-none text-white shadow-[0_10px_22px_rgba(15,23,42,0.24)]"
          role="tooltip"
        >
          <span>{tooltipLabel}</span>
          {tooltipShortcut ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded bg-white/10 px-1 text-[11px] leading-none text-white/85">
              {tooltipShortcut}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function MenuShortcut({ children }: { children: React.ReactNode }) {
  return <span className="ml-auto text-xs text-neutral-400">{children}</span>
}

function MenuItem({
  children,
  icon,
  onClick,
  role = 'menuitem',
  selected,
  shortcut,
}: MenuItemProps) {
  return (
    <button
      aria-checked={role === 'menuitemradio' ? selected : undefined}
      className={
        selected
          ? 'flex w-full items-center gap-3 rounded-lg bg-[#e8f2ff] px-3 py-2 text-left text-[#1677ff]'
          : 'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[#2b2f36] hover:bg-[#f3f6fa]'
      }
      onClick={onClick}
      role={role}
      type="button"
    >
      {icon ? <span className="w-5 text-lg text-center">{icon}</span> : null}
      <span>{children}</span>
      {shortcut ? <MenuShortcut>{shortcut}</MenuShortcut> : null}
    </button>
  )
}

function floatingMenuClass(width: number) {
  return [
    'absolute left-[46px] top-0 z-20 rounded-[14px] border border-[#dfe4ec] bg-white/95 p-2 text-sm text-[#2b2f36] shadow-[0_18px_45px_rgba(15,23,42,0.14)] backdrop-blur',
    width === 188 ? 'w-[188px]' : 'w-[190px]',
  ].join(' ')
}

export function DesignToolbar({
  onToolModeChange,
  toolMode,
}: DesignToolbarProps) {
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null)
  const activeTool = activeToolFromMode(toolMode)
  const shortcutActions = useMemo(
    () => ({
      onToolModeChange,
    }),
    [onToolModeChange],
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target

      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLSelectElement ||
        target instanceof HTMLTextAreaElement
      ) {
        return
      }

      const key = event.key.toLowerCase()

      if (key === 'v') {
        shortcutActions.onToolModeChange('select')
        setOpenMenu(null)
      } else if (key === 'h') {
        shortcutActions.onToolModeChange('hand')
        setOpenMenu(null)
      } else if (key === 'k') {
        shortcutActions.onToolModeChange('scale')
        setOpenMenu(null)
      } else if (key === 'f') {
        shortcutActions.onToolModeChange('frame')
        setOpenMenu(null)
      } else if (key === 'r') {
        shortcutActions.onToolModeChange('rect')
        setOpenMenu(null)
      } else if (key === 'o') {
        shortcutActions.onToolModeChange('ellipse')
        setOpenMenu(null)
      } else if (key === 'b') {
        shortcutActions.onToolModeChange('button')
        setOpenMenu(null)
      } else if (key === 'c') {
        shortcutActions.onToolModeChange('container')
        setOpenMenu(null)
      } else if (key === 'i' && event.shiftKey) {
        shortcutActions.onToolModeChange('image')
        setOpenMenu(null)
      } else if (key === 'p') {
        shortcutActions.onToolModeChange(event.shiftKey ? 'pencil' : 'pen')
        setOpenMenu(null)
      } else if (key === 't') {
        shortcutActions.onToolModeChange('text')
        setOpenMenu(null)
      } else if (key === 's') {
        shortcutActions.onToolModeChange('slice')
        setOpenMenu(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcutActions])

  const chooseTool = (mode: EditorToolMode) => {
    onToolModeChange(mode)
    setOpenMenu(null)
  }

  return (
    <nav
      aria-label="设计工具栏"
      className="relative flex w-[52px] flex-col items-center gap-1 border-r border-[#d9dde5] bg-[#fbfcfe] py-2 shadow-[1px_0_0_rgba(15,23,42,0.03)]"
      role="toolbar"
    >
      <div className="relative">
        <ToolButton
          active={activeTool === 'select'}
          hasMenu
          label="选择工具"
          onClick={() => {
            if (activeTool !== 'select') {
              onToolModeChange('select')
            }
            setOpenMenu(openMenu === 'select' ? null : 'select')
          }}
          tooltipLabel="选择"
          tooltipShortcut="V"
        >
          {toolMode === 'hand' ? (
            <HandIcon />
          ) : toolMode === 'scale' ? (
            <ScaleIcon />
          ) : (
            <CursorIcon />
          )}
        </ToolButton>
        {openMenu === 'select' ? (
          <div
            aria-label="选择工具菜单"
            className={floatingMenuClass(188)}
            role="menu"
          >
            <MenuItem
              icon="↖"
              onClick={() => chooseTool('select')}
              role="menuitemradio"
              selected={toolMode === 'select'}
              shortcut="V"
            >
              选择工具
            </MenuItem>
            <MenuItem
              icon="✋"
              onClick={() => chooseTool('hand')}
              role="menuitemradio"
              selected={toolMode === 'hand'}
              shortcut="H"
            >
              移动视图
            </MenuItem>
            <MenuItem
              icon="⤢"
              onClick={() => chooseTool('scale')}
              role="menuitemradio"
              selected={toolMode === 'scale'}
              shortcut="K"
            >
              等比缩放
            </MenuItem>
          </div>
        ) : null}
      </div>
      <ToolButton
        active={activeTool === 'artboard'}
        label="画板工具"
        onClick={() => chooseTool('artboard')}
        tooltipLabel="画板"
      >
        <ArtboardIcon />
      </ToolButton>
      <div className="relative">
        <ToolButton
          active={activeTool === 'shape'}
          hasMenu
          label="形状工具"
          onClick={() => {
            if (activeTool !== 'shape') {
              onToolModeChange('rect')
            }
            setOpenMenu(openMenu === 'shape' ? null : 'shape')
          }}
          tooltipLabel="矩形"
          tooltipShortcut="R"
        >
          {shapeToolIcon(toolMode)}
        </ToolButton>
      {openMenu === 'shape' ? (
          <div
            aria-label="形状工具菜单"
            className={floatingMenuClass(190)}
            role="menu"
          >
            <MenuItem icon="□" onClick={() => chooseTool('rect')} shortcut="R">
              矩形
            </MenuItem>
            <MenuItem icon="○" onClick={() => chooseTool('ellipse')} shortcut="O">
              圆形
            </MenuItem>
            <MenuItem icon="△" onClick={() => chooseTool('triangle')}>
              三角形
            </MenuItem>
            <MenuItem icon="☆" onClick={() => chooseTool('star')}>
              星形
            </MenuItem>
            <MenuItem icon="⬠" onClick={() => chooseTool('polygon')}>
              多边形
            </MenuItem>
            <MenuItem
              icon="▣"
              onClick={() => chooseTool('image')}
              shortcut="Shift I"
            >
              图片
            </MenuItem>
          </div>
        ) : null}
      </div>
      <ToolButton
        active={activeTool === 'slice'}
        label="切片工具"
        onClick={() => chooseTool('slice')}
        tooltipLabel="切片"
        tooltipShortcut="S"
      >
        <SliceIcon />
      </ToolButton>
      <div className="relative">
        <ToolButton
          active={activeTool === 'pen'}
          hasMenu
          label="钢笔工具"
          onClick={() => {
            if (activeTool !== 'pen') {
              onToolModeChange('pen')
            }
            setOpenMenu(openMenu === 'pen' ? null : 'pen')
          }}
          tooltipLabel={toolMode === 'pencil' ? '铅笔' : '钢笔'}
          tooltipShortcut={toolMode === 'pencil' ? 'Shift P' : 'P'}
        >
          {penToolIcon(toolMode)}
        </ToolButton>
        {openMenu === 'pen' ? (
          <div
            aria-label="钢笔工具菜单"
            className={floatingMenuClass(188)}
            role="menu"
          >
            <MenuItem icon="✒" onClick={() => chooseTool('pen')} shortcut="P">
              钢笔
            </MenuItem>
            <MenuItem
              icon="╱"
              onClick={() => chooseTool('pencil')}
              shortcut="Shift P"
            >
              铅笔
            </MenuItem>
          </div>
        ) : null}
      </div>
      <ToolButton
        active={activeTool === 'text'}
        label="文本工具"
        onClick={() => chooseTool('text')}
        tooltipLabel="文本"
        tooltipShortcut="T"
      >
        <TextIcon />
      </ToolButton>
      <ToolButton
        active={activeTool === 'brush'}
        label="画笔工具"
        onClick={() => chooseTool('brush')}
        tooltipLabel="画笔"
      >
        <BrushIcon />
      </ToolButton>
      <div className="relative">
        <ToolButton
          active={activeTool === 'component'}
          hasMenu
          label="插入工具"
          onClick={() => {
            if (activeTool !== 'component') {
              onToolModeChange('container')
            }
            setOpenMenu(openMenu === 'insert' ? null : 'insert')
          }}
          tooltipLabel="组件"
          tooltipShortcut="C"
        >
          {insertToolIcon(toolMode)}
        </ToolButton>
        {openMenu === 'insert' ? (
          <div
            aria-label="插入工具菜单"
            className={floatingMenuClass(190)}
            role="menu"
          >
            <MenuItem onClick={() => chooseTool('container')} shortcut="C">
              容器
            </MenuItem>
            <MenuItem onClick={() => chooseTool('frame')} shortcut="F">
              Frame
            </MenuItem>
            <MenuItem onClick={() => chooseTool('button')} shortcut="B">
              按钮
            </MenuItem>
            <MenuItem onClick={() => chooseTool('text')} shortcut="T">
              文本
            </MenuItem>
            <MenuItem
              onClick={() => chooseTool('image')}
              shortcut="Shift I"
            >
              图片
            </MenuItem>
          </div>
        ) : null}
      </div>
      <ToolButton
        active={activeTool === 'resource'}
        label="资源工具"
        onClick={() => chooseTool('resource')}
        tooltipLabel="资源"
      >
        <ResourceIcon />
      </ToolButton>
      <ToolButton
        active={activeTool === 'zoom'}
        label="缩放工具"
        onClick={() => chooseTool('zoom')}
        tooltipLabel="缩放"
      >
        <ZoomIcon />
      </ToolButton>
      <div className="mt-auto flex h-9 w-9 items-center justify-center text-[#2b2f36]">
        <MoreIcon />
      </div>
    </nav>
  )
}
