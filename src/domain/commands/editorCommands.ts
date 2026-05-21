import { createId } from '../../utils/id'
import type {
  LayoutProps,
  PageDocument,
  PathNodePoint,
  UINode,
} from '../model/types'

interface NodeCreationOptions {
  layout: LayoutProps
}

interface TextNodeCreationOptions extends NodeCreationOptions {
  text: string
}

interface ButtonNodeCreationOptions extends NodeCreationOptions {
  text: string
}

interface ImageNodeCreationOptions extends NodeCreationOptions {
  alt: string
  src: string
}

interface IconNodeCreationOptions extends NodeCreationOptions {
  name: string
  svgPath: string
  viewBox: string
}

interface PathNodeCreationOptions extends NodeCreationOptions {
  pathData: string
  pathNodes?: PathNodePoint[]
}

interface InputNodeCreationOptions extends NodeCreationOptions {
  placeholder: string
}

interface ElementPlusNodeCreationOptions extends NodeCreationOptions {
  component: 'button' | 'input' | 'card' | 'table'
}

type AlignableNode = UINode & {
  layout: UINode['layout'] & {
    width: number
    x: number
  }
}

type AbsoluteLayerNode = UINode & {
  layout: UINode['layout'] & {
    height: number
    width: number
    x: number
    y: number
  }
}

export function createTextNode({
  layout,
  text,
}: TextNodeCreationOptions): UINode {
  return {
    id: createId(),
    type: 'text',
    name: 'Text',
    parentId: null,
    children: [],
    layout,
    style: { color: '#111827', fontSize: 24, fontWeight: 600 },
    content: { text },
    meta: {},
  }
}

export function createButtonNode({
  layout,
  text,
}: ButtonNodeCreationOptions): UINode {
  return {
    id: createId(),
    type: 'button',
    name: 'Button',
    parentId: null,
    children: [],
    layout,
    style: {
      background: '#111827',
      color: '#ffffff',
      radius: 12,
      fontSize: 16,
      fontWeight: 600,
    },
    content: { text },
    meta: {},
  }
}

export function createImageNode({
  alt,
  layout,
  src,
}: ImageNodeCreationOptions): UINode {
  return {
    id: createId(),
    type: 'image',
    name: 'Image',
    parentId: null,
    children: [],
    layout,
    style: { radius: 16 },
    content: {
      src,
      alt,
    },
    meta: {},
  }
}

export function createContainerNode({ layout }: NodeCreationOptions): UINode {
  return {
    id: createId(),
    type: 'container',
    name: 'Container',
    parentId: null,
    children: [],
    layout,
    style: {
      background: '#f8fafc',
      radius: 20,
      borderWidth: 1,
      borderColor: '#e2e8f0',
    },
    content: {},
    meta: {},
  }
}

export function createFrameNode({ layout }: NodeCreationOptions): UINode {
  return {
    id: createId(),
    type: 'frame',
    name: 'Frame',
    parentId: null,
    children: [],
    layout,
    style: {
      background: '#ffffff',
      radius: 24,
      borderWidth: 1,
      borderColor: '#d6d3d1',
    },
    content: {},
    meta: {},
  }
}

export function createRectNode({ layout }: NodeCreationOptions): UINode {
  return {
    id: createId(),
    type: 'rect',
    name: '矩形 1',
    parentId: null,
    children: [],
    layout,
    style: {
      background: '#dbeafe',
      radius: 18,
      borderWidth: 1,
      borderColor: '#60a5fa',
    },
    content: {},
    meta: {},
  }
}

export function createEllipseNode({ layout }: NodeCreationOptions): UINode {
  return {
    id: createId(),
    type: 'ellipse',
    name: '圆形 1',
    parentId: null,
    children: [],
    layout,
    style: {
      background: '#dbeafe',
      borderWidth: 1,
      borderColor: '#60a5fa',
    },
    content: {},
    meta: {},
  }
}

export function createTriangleNode({ layout }: NodeCreationOptions): UINode {
  return {
    id: createId(),
    type: 'triangle',
    name: '三角形 1',
    parentId: null,
    children: [],
    layout,
    style: {
      background: '#dbeafe',
      borderWidth: 1,
      borderColor: '#60a5fa',
    },
    content: {},
    meta: {},
  }
}

export function createStarNode({ layout }: NodeCreationOptions): UINode {
  return {
    id: createId(),
    type: 'star',
    name: '星形 1',
    parentId: null,
    children: [],
    layout,
    style: {
      background: '#dbeafe',
      borderWidth: 1,
      borderColor: '#60a5fa',
    },
    content: {},
    meta: {},
  }
}

export function createPolygonNode({ layout }: NodeCreationOptions): UINode {
  return {
    id: createId(),
    type: 'polygon',
    name: '多边形 1',
    parentId: null,
    children: [],
    layout,
    style: {
      background: '#dbeafe',
      borderWidth: 1,
      borderColor: '#60a5fa',
    },
    content: {},
    meta: {},
  }
}

export function createPathNode({
  layout,
  pathData,
  pathNodes,
}: PathNodeCreationOptions): UINode {
  return {
    id: createId(),
    type: 'path',
    name: '路径 1',
    parentId: null,
    children: [],
    layout,
    style: {
      background: '#dbeafe',
      borderWidth: 3,
      borderColor: '#2563eb',
    },
    content: {
      pathData,
      pathNodes,
    },
    meta: {},
  }
}

export function createSliceNode({ layout }: NodeCreationOptions): UINode {
  return {
    id: createId(),
    type: 'slice',
    name: '切片 1',
    parentId: null,
    children: [],
    layout,
    style: {
      borderWidth: 1,
      borderColor: '#22c55e',
    },
    content: {},
    meta: {},
  }
}

export function createIconNode({
  layout,
  name,
  svgPath,
  viewBox,
}: IconNodeCreationOptions): UINode {
  return {
    id: createId(),
    type: 'icon',
    name,
    parentId: null,
    children: [],
    layout,
    style: {
      color: '#6b7280',
    },
    content: {
      svgPath,
      viewBox,
    },
    meta: { componentHint: 'remix-icon' },
  }
}

export function createInputNode({
  layout,
  placeholder,
}: InputNodeCreationOptions): UINode {
  return {
    id: createId(),
    type: 'input',
    name: 'Input',
    parentId: null,
    children: [],
    layout,
    style: {
      background: '#ffffff',
      color: '#111827',
      radius: 10,
      borderWidth: 1,
      borderColor: '#d1d5db',
      fontSize: 14,
    },
    content: { placeholder },
    meta: { componentHint: 'shadcn-input' },
  }
}

export function createCardNode({ layout }: NodeCreationOptions): UINode {
  return {
    id: createId(),
    type: 'card',
    name: 'Card',
    parentId: null,
    children: [],
    layout: {
      ...layout,
      mode: 'flex-column',
      gap: 12,
      padding: { top: 24, right: 24, bottom: 24, left: 24 },
      align: 'stretch',
      justify: 'start',
    },
    style: {
      background: '#ffffff',
      radius: 16,
      borderWidth: 1,
      borderColor: '#e5e7eb',
      shadow: '0 18px 45px rgba(15, 23, 42, 0.08)',
    },
    content: {
      text: 'Card title\nUse this shadcn/ui inspired surface for content blocks.',
    },
    meta: { componentHint: 'shadcn-card' },
  }
}

export function createListNode({ layout }: NodeCreationOptions): UINode {
  return {
    id: createId(),
    type: 'list',
    name: 'List',
    parentId: null,
    children: [],
    layout: {
      ...layout,
      mode: 'flex-column',
      gap: 8,
      padding: { top: 16, right: 16, bottom: 16, left: 16 },
      align: 'stretch',
      justify: 'start',
    },
    style: {
      background: '#ffffff',
      radius: 14,
      borderWidth: 1,
      borderColor: '#e5e7eb',
    },
    content: {
      text: 'Dashboard\nSettings\nBilling',
    },
    meta: { componentHint: 'shadcn-list' },
  }
}

export function createElementPlusNode({
  component,
  layout,
}: ElementPlusNodeCreationOptions): UINode {
  if (component === 'button') {
    return {
      ...createButtonNode({ layout, text: '保存' }),
      name: 'Element Plus 按钮',
      meta: { componentHint: 'element-plus-button' },
      style: {
        background: '#409eff',
        color: '#ffffff',
        radius: 4,
        fontSize: 14,
        fontWeight: 500,
      },
    }
  }

  if (component === 'input') {
    return {
      ...createInputNode({ layout, placeholder: '请输入内容' }),
      name: 'Element Plus 输入框',
      meta: { componentHint: 'element-plus-input' },
      style: {
        background: '#ffffff',
        color: '#303133',
        radius: 4,
        borderWidth: 1,
        borderColor: '#dcdfe6',
        fontSize: 14,
      },
    }
  }

  if (component === 'card') {
    return {
      ...createCardNode({ layout }),
      name: 'Element Plus 卡片',
      content: {
        text: '卡片标题\nElement Plus 内容区域',
      },
      meta: { componentHint: 'element-plus-card' },
      style: {
        background: '#ffffff',
        radius: 4,
        borderWidth: 1,
        borderColor: '#e4e7ed',
        shadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
      },
    }
  }

  return {
    ...createListNode({ layout }),
    name: 'Element Plus 表格',
    content: {
      text: '姓名\n角色\n状态',
    },
    meta: { componentHint: 'element-plus-table' },
    style: {
      background: '#ffffff',
      radius: 4,
      borderWidth: 1,
      borderColor: '#ebeef5',
    },
  }
}

function createGroupNode(layout: LayoutProps): UINode {
  return {
    id: createId(),
    type: 'group',
    name: 'Group',
    parentId: null,
    children: [],
    layout,
    style: {},
    content: {},
    meta: {},
  }
}

export function insertChildNode(
  document: PageDocument,
  parentId: string,
  node: UINode,
): PageDocument {
  const parent = document.nodes[parentId]

  if (!parent) {
    throw new Error(`Parent node not found: ${parentId}`)
  }

  return {
    ...document,
    updatedAt: new Date().toISOString(),
    nodes: {
      ...document.nodes,
      [parentId]: {
        ...parent,
        children: [...parent.children, node.id],
      },
      [node.id]: {
        ...node,
        parentId,
      },
    },
  }
}

export function updateNodeLayout(
  document: PageDocument,
  nodeId: string,
  layout: Partial<LayoutProps>,
): PageDocument {
  const node = document.nodes[nodeId]

  if (!node) {
    throw new Error(`Node not found: ${nodeId}`)
  }

  return {
    ...document,
    nodes: {
      ...document.nodes,
      [nodeId]: {
        ...node,
        layout: {
          ...node.layout,
          ...layout,
        },
      },
    },
    updatedAt: new Date().toISOString(),
  }
}

function updateNodeMeta(
  document: PageDocument,
  nodeId: string,
  meta: Partial<UINode['meta']>,
): PageDocument {
  const node = document.nodes[nodeId]

  if (!node) {
    throw new Error(`Node not found: ${nodeId}`)
  }

  return {
    ...document,
    nodes: {
      ...document.nodes,
      [nodeId]: {
        ...node,
        meta: {
          ...node.meta,
          ...meta,
        },
      },
    },
    updatedAt: new Date().toISOString(),
  }
}

export function setNodeVisible(
  document: PageDocument,
  nodeId: string,
  visible: boolean,
): PageDocument {
  const next = updateNodeMeta(document, nodeId, { visible })

  return visible
    ? next
    : {
        ...next,
        selectedNodeIds: next.selectedNodeIds.filter((id) => id !== nodeId),
      }
}

export function setNodeLocked(
  document: PageDocument,
  nodeId: string,
  locked: boolean,
): PageDocument {
  const next = updateNodeMeta(document, nodeId, { locked })

  return locked
    ? {
        ...next,
        selectedNodeIds: next.selectedNodeIds.filter((id) => id !== nodeId),
      }
    : next
}

export function updateNodeName(
  document: PageDocument,
  nodeId: string,
  name: string,
): PageDocument {
  const node = document.nodes[nodeId]

  if (!node) {
    throw new Error(`Node not found: ${nodeId}`)
  }

  return {
    ...document,
    nodes: {
      ...document.nodes,
      [nodeId]: {
        ...node,
        name,
      },
    },
    updatedAt: new Date().toISOString(),
  }
}

export function setNodeComponentHint(
  document: PageDocument,
  nodeId: string,
  componentHint: string,
): PageDocument {
  return updateNodeMeta(document, nodeId, {
    componentHint: componentHint.trim() || undefined,
  })
}

function moveChildInParent(
  document: PageDocument,
  nodeId: string,
  direction: 'forward' | 'backward',
): PageDocument {
  const node = document.nodes[nodeId]

  if (!node?.parentId) {
    throw new Error(`Node parent not found: ${nodeId}`)
  }

  const parent = document.nodes[node.parentId]

  if (!parent) {
    throw new Error(`Parent node not found: ${node.parentId}`)
  }

  const currentIndex = parent.children.indexOf(nodeId)

  if (currentIndex === -1) {
    throw new Error(`Node is not a child of parent: ${nodeId}`)
  }

  const nextIndex =
    direction === 'forward' ? currentIndex + 1 : currentIndex - 1

  if (nextIndex < 0 || nextIndex >= parent.children.length) {
    return document
  }

  const nextChildren = [...parent.children]
  const [movedNodeId] = nextChildren.splice(currentIndex, 1)
  nextChildren.splice(nextIndex, 0, movedNodeId)

  return {
    ...document,
    nodes: {
      ...document.nodes,
      [parent.id]: {
        ...parent,
        children: nextChildren,
      },
    },
    updatedAt: new Date().toISOString(),
  }
}

export function moveNodeForward(document: PageDocument, nodeId: string): PageDocument {
  return moveChildInParent(document, nodeId, 'forward')
}

export function moveNodeBackward(
  document: PageDocument,
  nodeId: string,
): PageDocument {
  return moveChildInParent(document, nodeId, 'backward')
}

function assertAlignableNode(node: UINode): asserts node is AlignableNode {
  if (typeof node.layout.x !== 'number' || typeof node.layout.width !== 'number') {
    throw new Error(`Node cannot be aligned: ${node.id}`)
  }
}

function selectedAbsoluteNodes(document: PageDocument): AlignableNode[] {
  return document.selectedNodeIds.map((nodeId) => {
    const node = document.nodes[nodeId]

    if (!node) {
      throw new Error(`Node not found: ${nodeId}`)
    }

    assertAlignableNode(node)

    return node
  })
}

export function alignNodesLeft(document: PageDocument): PageDocument {
  const nodes = selectedAbsoluteNodes(document)

  if (nodes.length < 2) {
    return document
  }

  const left = Math.min(...nodes.map((node) => node.layout.x))
  const nextNodes = Object.fromEntries(
    nodes.map((node) => [
      node.id,
      {
        ...node,
        layout: {
          ...node.layout,
          x: left,
        },
      },
    ]),
  )

  return {
    ...document,
    nodes: {
      ...document.nodes,
      ...nextNodes,
    },
    updatedAt: new Date().toISOString(),
  }
}

export function distributeNodesHorizontally(document: PageDocument): PageDocument {
  const nodes = selectedAbsoluteNodes(document)

  if (nodes.length < 3) {
    return document
  }

  const left = Math.min(...nodes.map((node) => node.layout.x))
  const right = Math.max(...nodes.map((node) => node.layout.x))
  const step = (right - left) / (nodes.length - 1)
  const nextNodes = Object.fromEntries(
    nodes.map((node, index) => [
      node.id,
      {
        ...node,
        layout: {
          ...node.layout,
          x: left + step * index,
        },
      },
    ]),
  )

  return {
    ...document,
    nodes: {
      ...document.nodes,
      ...nextNodes,
    },
    updatedAt: new Date().toISOString(),
  }
}

function assertAbsoluteLayer(node: UINode): asserts node is AbsoluteLayerNode {
  if (
    typeof node.layout.x !== 'number' ||
    typeof node.layout.y !== 'number' ||
    typeof node.layout.width !== 'number' ||
    typeof node.layout.height !== 'number'
  ) {
    throw new Error(`Node cannot be grouped: ${node.id}`)
  }
}

function resolveAbsoluteLayer(
  document: PageDocument,
  nodeId: string,
  errorMessage: string,
): AbsoluteLayerNode {
  const node = document.nodes[nodeId]

  if (!node) {
    throw new Error(errorMessage)
  }

  assertAbsoluteLayer(node)
  return node
}

export function groupSelectedNodes(document: PageDocument): PageDocument {
  if (document.selectedNodeIds.length < 2) {
    return document
  }

  const selectedIds = new Set(document.selectedNodeIds)
  const selectedNodes = document.selectedNodeIds.map((nodeId) => {
    const node = document.nodes[nodeId]

    if (!node || node.id === document.rootNodeId || !node.parentId) {
      throw new Error(`Node cannot be grouped: ${nodeId}`)
    }

    assertAbsoluteLayer(node)

    return node
  })
  const parentId = selectedNodes[0].parentId

  if (!parentId || selectedNodes.some((node) => node.parentId !== parentId)) {
    throw new Error('Cannot group nodes from different parents')
  }

  const parent = document.nodes[parentId]

  if (!parent) {
    throw new Error(`Parent node not found: ${parentId}`)
  }

  const orderedSelectedNodes: AbsoluteLayerNode[] = parent.children
    .filter((childId) => selectedIds.has(childId))
    .map((childId) =>
      resolveAbsoluteLayer(
        document,
        childId,
        `Selected child node not found: ${childId}`,
      ),
    )

  if (orderedSelectedNodes.length !== selectedNodes.length) {
    throw new Error('Selected nodes are not direct siblings')
  }

  const left = Math.min(...orderedSelectedNodes.map((node) => node.layout.x))
  const top = Math.min(...orderedSelectedNodes.map((node) => node.layout.y))
  const right = Math.max(
    ...orderedSelectedNodes.map(
      (node) => node.layout.x + node.layout.width,
    ),
  )
  const bottom = Math.max(
    ...orderedSelectedNodes.map(
      (node) => node.layout.y + node.layout.height,
    ),
  )
  const groupNode = createGroupNode({
    mode: 'absolute',
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  })
  const firstSelectedIndex = parent.children.findIndex((childId) =>
    selectedIds.has(childId),
  )
  const nextParentChildren = parent.children.filter(
    (childId) => !selectedIds.has(childId),
  )

  nextParentChildren.splice(firstSelectedIndex, 0, groupNode.id)

  const groupedChildren = Object.fromEntries(
    orderedSelectedNodes.map((node) => [
      node.id,
      {
        ...node,
        parentId: groupNode.id,
        layout: {
          ...node.layout,
          x: node.layout.x - left,
          y: node.layout.y - top,
        },
      },
    ]),
  )

  return {
    ...document,
    nodes: {
      ...document.nodes,
      [parent.id]: {
        ...parent,
        children: nextParentChildren,
      },
      [groupNode.id]: {
        ...groupNode,
        parentId,
        children: orderedSelectedNodes.map((node) => node.id),
      },
      ...groupedChildren,
    },
    selectedNodeIds: [groupNode.id],
    updatedAt: new Date().toISOString(),
  }
}

export function frameSelectedNodes(document: PageDocument): PageDocument {
  if (document.selectedNodeIds.length < 2) {
    return document
  }

  const selectedIds = new Set(document.selectedNodeIds)
  const selectedNodes = document.selectedNodeIds.map((nodeId) => {
    const node = document.nodes[nodeId]

    if (!node || node.id === document.rootNodeId || !node.parentId) {
      throw new Error(`Node cannot be framed: ${nodeId}`)
    }

    assertAbsoluteLayer(node)

    return node
  })
  const parentId = selectedNodes[0].parentId

  if (!parentId || selectedNodes.some((node) => node.parentId !== parentId)) {
    throw new Error('Cannot frame nodes from different parents')
  }

  const parent = document.nodes[parentId]

  if (!parent) {
    throw new Error(`Parent node not found: ${parentId}`)
  }

  const orderedSelectedNodes: AbsoluteLayerNode[] = parent.children
    .filter((childId) => selectedIds.has(childId))
    .map((childId) =>
      resolveAbsoluteLayer(
        document,
        childId,
        `Selected child node not found: ${childId}`,
      ),
    )

  if (orderedSelectedNodes.length !== selectedNodes.length) {
    throw new Error('Selected nodes are not direct siblings')
  }

  const left = Math.min(...orderedSelectedNodes.map((node) => node.layout.x))
  const top = Math.min(...orderedSelectedNodes.map((node) => node.layout.y))
  const right = Math.max(
    ...orderedSelectedNodes.map(
      (node) => node.layout.x + node.layout.width,
    ),
  )
  const bottom = Math.max(
    ...orderedSelectedNodes.map(
      (node) => node.layout.y + node.layout.height,
    ),
  )
  const frameNode = createFrameNode({
    layout: {
      mode: 'flex-column',
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
      gap: 16,
      padding: { top: 24, right: 24, bottom: 24, left: 24 },
      align: 'stretch',
      justify: 'start',
    },
  })
  const firstSelectedIndex = parent.children.findIndex((childId) =>
    selectedIds.has(childId),
  )
  const nextParentChildren = parent.children.filter(
    (childId) => !selectedIds.has(childId),
  )

  nextParentChildren.splice(firstSelectedIndex, 0, frameNode.id)

  const framedChildren = Object.fromEntries(
    orderedSelectedNodes.map((node) => [
      node.id,
      {
        ...node,
        parentId: frameNode.id,
        layout: {
          ...node.layout,
          x: node.layout.x - left,
          y: node.layout.y - top,
        },
      },
    ]),
  )

  return {
    ...document,
    nodes: {
      ...document.nodes,
      [parent.id]: {
        ...parent,
        children: nextParentChildren,
      },
      [frameNode.id]: {
        ...frameNode,
        parentId,
        children: orderedSelectedNodes.map((node) => node.id),
      },
      ...framedChildren,
    },
    selectedNodeIds: [frameNode.id],
    updatedAt: new Date().toISOString(),
  }
}

export function ungroupSelectedNode(document: PageDocument): PageDocument {
  const [groupId] = document.selectedNodeIds
  const group = groupId ? document.nodes[groupId] : null

  if (!group || group.type !== 'group' || !group.parentId) {
    return document
  }

  assertAbsoluteLayer(group)

  const parent = document.nodes[group.parentId]

  if (!parent) {
    throw new Error(`Parent node not found: ${group.parentId}`)
  }

  const childNodes = group.children.map((childId) => {
    const child = document.nodes[childId]

    if (!child) {
      throw new Error(`Group child not found: ${childId}`)
    }

    assertAbsoluteLayer(child)

    return child
  })
  const groupIndex = parent.children.indexOf(group.id)

  if (groupIndex === -1) {
    throw new Error(`Group is not a child of parent: ${group.id}`)
  }

  const nextParentChildren = parent.children.filter((childId) => childId !== group.id)
  nextParentChildren.splice(groupIndex, 0, ...group.children)

  const nextNodes = {
    ...document.nodes,
    [parent.id]: {
      ...parent,
      children: nextParentChildren,
    },
    ...Object.fromEntries(
      childNodes.map((child) => [
        child.id,
        {
          ...child,
          parentId: parent.id,
          layout: {
            ...child.layout,
            x: group.layout.x + child.layout.x,
            y: group.layout.y + child.layout.y,
          },
        },
      ]),
    ),
  }

  delete nextNodes[group.id]

  return {
    ...document,
    nodes: nextNodes,
    selectedNodeIds: group.children,
    updatedAt: new Date().toISOString(),
  }
}

function isDescendant(
  document: PageDocument,
  nodeId: string,
  candidateParentId: string,
): boolean {
  const candidateParent = document.nodes[candidateParentId]

  if (!candidateParent) {
    return false
  }

  if (candidateParent.parentId === nodeId) {
    return true
  }

  return candidateParent.parentId
    ? isDescendant(document, nodeId, candidateParent.parentId)
    : false
}

export function moveNode(
  document: PageDocument,
  nodeId: string,
  nextParentId: string,
): PageDocument {
  const node = document.nodes[nodeId]
  const nextParent = document.nodes[nextParentId]

  if (
    !node ||
    !nextParent ||
    nodeId === document.rootNodeId ||
    nodeId === nextParentId ||
    isDescendant(document, nodeId, nextParentId)
  ) {
    return document
  }

  const previousParentId = node.parentId
  const previousParent = previousParentId ? document.nodes[previousParentId] : null

  return {
    ...document,
    nodes: {
      ...document.nodes,
      ...(previousParent
        ? {
            [previousParent.id]: {
              ...previousParent,
              children: previousParent.children.filter((childId) => childId !== nodeId),
            },
          }
        : {}),
      [nextParentId]: {
        ...nextParent,
        children: nextParent.children.includes(nodeId)
          ? nextParent.children
          : [...nextParent.children, nodeId],
      },
      [nodeId]: {
        ...node,
        parentId: nextParentId,
        layout:
          nextParent.layout.mode === 'absolute'
            ? node.layout
            : { ...node.layout, mode: 'absolute', x: undefined, y: undefined },
      },
    },
    updatedAt: new Date().toISOString(),
  }
}

function collectDescendantIds(document: PageDocument, nodeId: string): string[] {
  const node = document.nodes[nodeId]

  if (!node) {
    return []
  }

  return [
    nodeId,
    ...node.children.flatMap((childId) => collectDescendantIds(document, childId)),
  ]
}

export function removeNode(document: PageDocument, nodeId: string): PageDocument {
  const node = document.nodes[nodeId]

  if (!node || nodeId === document.rootNodeId) {
    return document
  }

  const idsToRemove = new Set(collectDescendantIds(document, nodeId))
  const nextNodes = Object.fromEntries(
    Object.entries(document.nodes)
      .filter(([id]) => !idsToRemove.has(id))
      .map(([id, currentNode]) => [
        id,
        {
          ...currentNode,
          children: currentNode.children.filter((childId) => !idsToRemove.has(childId)),
        },
      ]),
  )

  return {
    ...document,
    nodes: nextNodes,
    selectedNodeIds: document.selectedNodeIds.filter((id) => !idsToRemove.has(id)),
    updatedAt: new Date().toISOString(),
  }
}

export function selectNodes(
  document: PageDocument,
  selectedNodeIds: string[],
): PageDocument {
  return {
    ...document,
    selectedNodeIds,
    updatedAt: new Date().toISOString(),
  }
}
