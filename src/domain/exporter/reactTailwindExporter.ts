import type { PageDocument, UINode } from '../model/types'
import { nodeMappingAttribute } from './codeMapping'
import {
  boxStyleToClassName,
  layoutAlignmentToClassName,
  layoutPositionToClassName,
  layoutSizingToClassName,
  layoutToClassName,
  paddingToClassName,
  textStyleToClassName,
} from './tailwindMapping'

function escapeText(value = '') {
  return value.replaceAll('{', '&#123;').replaceAll('}', '&#125;')
}

export function indentReact(value: string) {
  return value
    .split('\n')
    .map((line) => `  ${line}`)
    .join('\n')
}

function className(...values: string[]) {
  return values.filter(Boolean).join(' ')
}

function ariaLabelForNode(node: UINode, defaultLabel: string) {
  if (node.name === defaultLabel) return defaultLabel
  if (node.type === 'rect' && node.name === '矩形 1') return defaultLabel
  return node.name
}

function isVectorNode(node: UINode) {
  return (
    node.type === 'triangle' ||
    node.type === 'star' ||
    node.type === 'polygon' ||
    node.type === 'path' ||
    node.type === 'icon'
  )
}

function vectorLabel(node: UINode) {
  if (node.type === 'triangle') return '三角形图层'
  if (node.type === 'star') return '星形图层'
  if (node.type === 'polygon') return '多边形图层'
  if (node.type === 'path') return '路径图层'
  if (node.type === 'icon') return `${node.name} 图标`
  return node.name
}

function vectorPolygonPoints(node: UINode) {
  if (node.type === 'triangle') return '50 8 92 92 8 92'
  if (node.type === 'star') {
    return '50 6 61 36 94 36 67 56 78 90 50 70 22 90 33 56 6 36 39 36'
  }
  return '50 6 94 30 94 70 50 94 6 70 6 30'
}

function vectorViewBox(node: UINode) {
  if (node.type === 'icon') {
    return node.content.viewBox ?? '0 0 24 24'
  }

  if (
    node.type === 'path' &&
    typeof node.layout.width === 'number' &&
    typeof node.layout.height === 'number'
  ) {
    return `0 0 ${node.layout.width} ${node.layout.height}`
  }

  return '0 0 100 100'
}

function nodeLayoutClassName(document: PageDocument, node: UINode) {
  return className(
    layoutPositionToClassName(node.layout, node.parentId === document.rootNodeId),
    layoutSizingToClassName(node.layout),
  )
}

export function resolveReactRenderableNode(document: PageDocument, nodeId: string) {
  const node = document.nodes[nodeId]

  if (!node) {
    throw new Error(`Export node not found: ${nodeId}`)
  }

  if (
    node.type !== 'text' &&
    node.type !== 'button' &&
    node.type !== 'image' &&
    node.type !== 'input' &&
    node.type !== 'list' &&
    node.type !== 'card' &&
    node.type !== 'container' &&
    node.type !== 'frame' &&
    node.type !== 'rect' &&
    node.type !== 'ellipse' &&
    node.type !== 'triangle' &&
    node.type !== 'star' &&
    node.type !== 'polygon' &&
    node.type !== 'path' &&
    node.type !== 'slice' &&
    node.type !== 'icon' &&
    node.type !== 'group'
  ) {
    throw new Error(`React Tailwind export does not support node type: ${node.type}`)
  }

  return node
}

export function visibleReactChildNodes(document: PageDocument, node: UINode) {
  return node.children
    .map((childId) => resolveReactRenderableNode(document, childId))
    .filter((childNode) => childNode.meta.visible !== false)
}

export function renderReactNode(document: PageDocument, node: UINode): string {
  if (node.type === 'text') {
    const classes = className(
      nodeLayoutClassName(document, node),
      textStyleToClassName(node.style),
    )

    return `      <div ${nodeMappingAttribute(node)} className="${classes}">${escapeText(
      node.content.text,
    )}</div>`
  }

  if (node.type === 'button') {
    const classes = className(
      nodeLayoutClassName(document, node),
      boxStyleToClassName(node.style),
      'px-4 py-2',
    )

    return `      <button ${nodeMappingAttribute(node)} type="button" className="${classes}">${escapeText(
      node.content.text,
    )}</button>`
  }

  if (node.type === 'image') {
    const classes = className(
      nodeLayoutClassName(document, node),
      boxStyleToClassName(node.style),
    )

    return `      <img ${nodeMappingAttribute(node)} className="${classes}" src="${escapeText(
      node.content.src,
    )}" alt="${escapeText(node.content.alt)}" />`
  }

  if (node.type === 'input') {
    const classes = className(
      nodeLayoutClassName(document, node),
      boxStyleToClassName(node.style),
      textStyleToClassName(node.style),
      'px-3 py-2 outline-none',
    )

    return `      <input ${nodeMappingAttribute(node)} aria-label="${escapeText(
      node.name,
    )}" className="${classes}" placeholder="${escapeText(
      node.content.placeholder,
    )}" />`
  }

  if (node.type === 'rect') {
    const classes = className(
      nodeLayoutClassName(document, node),
      boxStyleToClassName(node.style),
    )

    return `      <div ${nodeMappingAttribute(node)} aria-label="${escapeText(
      ariaLabelForNode(node, 'Rectangle') === 'Rectangle'
        ? '矩形图层'
        : ariaLabelForNode(node, 'Rectangle'),
    )}" className="${classes}"></div>`
  }

  if (node.type === 'ellipse') {
    const classes = className(
      nodeLayoutClassName(document, node),
      boxStyleToClassName({ ...node.style, radius: 9999 }),
    )

    return `      <div ${nodeMappingAttribute(node)} aria-label="${escapeText(
      node.name === '圆形 1' ? '圆形图层' : node.name,
    )}" className="${classes}"></div>`
  }

  if (isVectorNode(node)) {
    const classes = className(nodeLayoutClassName(document, node), 'overflow-visible')
    const stroke = node.style.borderColor ?? '#2563eb'
    const strokeWidth = node.style.borderWidth ?? 1

    if (node.type === 'path') {
      return `      <svg ${nodeMappingAttribute(node)} aria-label="${escapeText(
        vectorLabel(node),
      )}" role="img" viewBox="${vectorViewBox(node)}" preserveAspectRatio="none" className="${classes}"><path d="${escapeText(
        node.content.pathData,
      )}" fill="none" stroke="${escapeText(
        stroke,
      )}" strokeLinecap="round" strokeWidth="${strokeWidth}" vectorEffect="non-scaling-stroke" /></svg>`
    }

    if (node.type === 'icon') {
      return `      <svg ${nodeMappingAttribute(node)} aria-label="${escapeText(
        vectorLabel(node),
      )}" role="img" viewBox="${escapeText(
        vectorViewBox(node),
      )}" preserveAspectRatio="xMidYMid meet" className="${classes}"><path d="${escapeText(
        node.content.svgPath,
      )}" fill="currentColor" /></svg>`
    }

    return `      <svg ${nodeMappingAttribute(node)} aria-label="${escapeText(
      vectorLabel(node),
    )}" role="img" viewBox="0 0 100 100" preserveAspectRatio="none" className="${classes}"><polygon points="${vectorPolygonPoints(
      node,
    )}" fill="${escapeText(node.style.background ?? '#dbeafe')}" stroke="${escapeText(
      stroke,
    )}" strokeWidth="${strokeWidth}" vectorEffect="non-scaling-stroke" /></svg>`
  }

  if (node.type === 'slice') {
    const classes = className(
      nodeLayoutClassName(document, node),
      'border border-dashed bg-transparent',
      node.style.borderColor ? `border-[${node.style.borderColor}]` : 'border-green-500',
    )

    return `      <div ${nodeMappingAttribute(node)} aria-label="${escapeText(
      node.name === '切片 1' ? '切片图层' : node.name,
    )}" className="${classes}"></div>`
  }

  if (node.type === 'card' || node.type === 'container' || node.type === 'list') {
    const children = visibleReactChildNodes(document, node)
      .map((childNode) => renderReactNode(document, childNode))
      .join('\n')
    const classes = className(
      nodeLayoutClassName(document, node),
      boxStyleToClassName(node.style),
      layoutToClassName(node.layout),
      paddingToClassName(node.layout),
      layoutAlignmentToClassName(node.layout),
    )

    if (!children) {
      return `      <div ${nodeMappingAttribute(node)} aria-label="${escapeText(
        node.name,
      )}" className="${classes}">${escapeText(node.content.text)}</div>`
    }

    return [
      `      <div ${nodeMappingAttribute(node)} aria-label="${escapeText(
        node.name,
      )}" className="${classes}">`,
      indentReact(children),
      '      </div>',
    ].join('\n')
  }

  if (node.type === 'frame') {
    const children = visibleReactChildNodes(document, node)
      .map((childNode) => renderReactNode(document, childNode))
      .join('\n')
    const classes = className(
      nodeLayoutClassName(document, node),
      boxStyleToClassName(node.style),
      layoutToClassName(node.layout),
      paddingToClassName(node.layout),
      layoutAlignmentToClassName(node.layout),
    )

    if (!children) {
      return `      <section ${nodeMappingAttribute(node)} aria-label="${escapeText(
        ariaLabelForNode(node, 'Frame') === 'Frame'
          ? 'Frame 节点'
          : ariaLabelForNode(node, 'Frame'),
      )}" className="${classes}"></section>`
    }

    return [
      `      <section ${nodeMappingAttribute(node)} aria-label="${escapeText(
        ariaLabelForNode(node, 'Frame') === 'Frame'
          ? 'Frame 节点'
          : ariaLabelForNode(node, 'Frame'),
      )}" className="${classes}">`,
      indentReact(children),
      '      </section>',
    ].join('\n')
  }

  if (node.type === 'group') {
    const children = visibleReactChildNodes(document, node)
      .map((childNode) => renderReactNode(document, childNode))
      .join('\n')
    const classes = nodeLayoutClassName(document, node)

    if (!children) {
      return `      <div ${nodeMappingAttribute(node)} aria-label="图层组" className="${classes}"></div>`
    }

    return [`      <div ${nodeMappingAttribute(node)} aria-label="图层组" className="${classes}">`, indentReact(children), '      </div>'].join(
      '\n',
    )
  }

  throw new Error(`React Tailwind export does not support node type: ${node.type}`)
}
