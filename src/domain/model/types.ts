export type NodeType =
  | 'page'
  | 'frame'
  | 'group'
  | 'container'
  | 'rect'
  | 'text'
  | 'image'
  | 'button'
  | 'input'
  | 'list'
  | 'card'

export type LayoutMode = 'absolute' | 'flex-row' | 'flex-column'

export interface BoxSpacing {
  top: number
  right: number
  bottom: number
  left: number
}

export interface LayoutProps {
  mode: LayoutMode
  x?: number
  y?: number
  width: number | 'hug' | 'fill'
  height: number | 'hug' | 'fill'
  gap?: number
  padding?: BoxSpacing
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between'
}

export interface StyleProps {
  background?: string
  color?: string
  radius?: number
  borderWidth?: number
  borderColor?: string
  fontSize?: number
  fontWeight?: number
  shadow?: string
  opacity?: number
}

export interface ContentProps {
  text?: string
  src?: string
  alt?: string
  placeholder?: string
}

export interface UINode {
  id: string
  type: NodeType
  name: string
  parentId: string | null
  children: string[]
  layout: LayoutProps
  style: StyleProps
  content: ContentProps
  meta: {
    locked?: boolean
    visible?: boolean
    componentHint?: string
  }
}

export interface PageDocument {
  version: 1
  projectId: string
  pageId: string
  name: string
  rootNodeId: string
  nodes: Record<string, UINode>
  selectedNodeIds: string[]
  createdAt: string
  updatedAt: string
}
