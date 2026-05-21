import type { LayoutProps, PageDocument, StyleProps, UINode } from '../model/types'
import { nodeMappingAttribute } from './codeMapping'

type HtmlRenderableNodeType =
  | 'text'
  | 'button'
  | 'image'
  | 'input'
  | 'list'
  | 'card'
  | 'container'
  | 'frame'
  | 'rect'
  | 'ellipse'
  | 'triangle'
  | 'star'
  | 'polygon'
  | 'path'
  | 'slice'
  | 'icon'
  | 'group'
export type HtmlRenderableNode = UINode & { type: HtmlRenderableNodeType }

export function isHtmlRenderableNode(node: UINode): node is HtmlRenderableNode {
  return (
    node.type === 'text' ||
    node.type === 'button' ||
    node.type === 'image' ||
    node.type === 'input' ||
    node.type === 'list' ||
    node.type === 'card' ||
    node.type === 'container' ||
    node.type === 'frame' ||
    node.type === 'rect' ||
    node.type === 'ellipse' ||
    node.type === 'triangle' ||
    node.type === 'star' ||
    node.type === 'polygon' ||
    node.type === 'path' ||
    node.type === 'slice' ||
    node.type === 'icon' ||
    node.type === 'group'
  )
}

function resolveRenderableNode(document: PageDocument, nodeId: string) {
  const node = document.nodes[nodeId]

  if (!node) {
    throw new Error(`Export node not found: ${nodeId}`)
  }

  if (!isHtmlRenderableNode(node)) {
    throw new Error(`HTML export does not support node type: ${node.type}`)
  }

  return node
}

function escapeHtml(value = '') {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function indent(value: string, spaces = 2) {
  const padding = ' '.repeat(spaces)

  return value
    .split('\n')
    .map((line) => (line ? `${padding}${line}` : line))
    .join('\n')
}

function kebabCase(value: string) {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}

function cssDeclaration(property: string, value: string | number) {
  return `  ${kebabCase(property)}: ${typeof value === 'number' ? `${value}px` : value};`
}

function optionalCssDeclaration(
  property: string,
  value: string | number | undefined,
) {
  return value === undefined || value === '' ? [] : [cssDeclaration(property, value)]
}

function layoutSizeDeclaration(
  property: 'height' | 'width',
  value: LayoutProps['height'] | LayoutProps['width'],
) {
  if (typeof value === 'number') return [cssDeclaration(property, value)]
  if (value === 'fill') return [`  ${property}: 100%;`]
  return [`  ${property}: auto;`]
}

function constrainedPositionCss(layout: LayoutProps) {
  const horizontal = layout.constraints?.horizontal ?? 'left'
  const vertical = layout.constraints?.vertical ?? 'top'
  const declarations: string[] = []
  const transforms: string[] = []

  if (horizontal === 'center') {
    declarations.push('  left: 50%;')
    transforms.push('translateX(-50%)')
  } else if (horizontal === 'right') {
    declarations.push(...optionalCssDeclaration('right', layout.x))
  } else if (horizontal === 'stretch') {
    declarations.push(...optionalCssDeclaration('left', layout.x))
    declarations.push(...optionalCssDeclaration('right', layout.x))
  } else {
    declarations.push(...optionalCssDeclaration('left', layout.x))
  }

  if (vertical === 'center') {
    declarations.push('  top: 50%;')
    transforms.push('translateY(-50%)')
  } else if (vertical === 'bottom') {
    declarations.push(...optionalCssDeclaration('bottom', layout.y))
  } else if (vertical === 'stretch') {
    declarations.push(...optionalCssDeclaration('top', layout.y))
    declarations.push(...optionalCssDeclaration('bottom', layout.y))
  } else {
    declarations.push(...optionalCssDeclaration('top', layout.y))
  }

  if (transforms.length > 0) {
    declarations.push(`  transform: ${transforms.join(' ')};`)
  }

  return declarations
}

function styleToCss(style: StyleProps) {
  return [
    ...optionalCssDeclaration('background', style.background),
    ...optionalCssDeclaration('color', style.color),
    ...optionalCssDeclaration('borderRadius', style.radius),
    ...optionalCssDeclaration('borderWidth', style.borderWidth),
    ...optionalCssDeclaration('borderColor', style.borderColor),
    ...optionalCssDeclaration('fontSize', style.fontSize),
    ...optionalCssDeclaration('fontWeight', style.fontWeight),
    ...optionalCssDeclaration('boxShadow', style.shadow),
    ...optionalCssDeclaration(
      'opacity',
      style.opacity === undefined ? undefined : String(style.opacity),
    ),
  ]
}

function shapeCss(node: UINode) {
  if (node.type === 'icon') {
    return ['  background: transparent;', '  color: currentColor;']
  }

  if (node.type === 'ellipse') {
    return ['  border-radius: 9999px;']
  }

  if (node.type === 'slice') {
    return ['  background: transparent;', '  border-style: dashed;']
  }

  if (
    node.type === 'triangle' ||
    node.type === 'star' ||
    node.type === 'polygon' ||
    node.type === 'path'
  ) {
    return ['  background: transparent;']
  }

  return []
}

function layoutToCss(layout: LayoutProps, isRootChild: boolean) {
  const declarations = [
    ...(isRootChild ? ['  position: absolute;'] : []),
    ...(isRootChild ? constrainedPositionCss(layout) : []),
    ...layoutSizeDeclaration('width', layout.width),
    ...layoutSizeDeclaration('height', layout.height),
    ...optionalCssDeclaration('minWidth', layout.minWidth),
    ...optionalCssDeclaration('maxWidth', layout.maxWidth),
    ...optionalCssDeclaration('minHeight', layout.minHeight),
    ...optionalCssDeclaration('maxHeight', layout.maxHeight),
  ]

  if (layout.mode === 'flex-column') {
    declarations.push('  display: flex;')
    declarations.push('  flex-direction: column;')
  }

  if (layout.mode === 'flex-row') {
    declarations.push('  display: flex;')
    declarations.push('  flex-direction: row;')
  }

  declarations.push(...optionalCssDeclaration('gap', layout.gap))
  declarations.push(...optionalCssDeclaration('padding', layout.padding?.top))

  if (layout.align === 'center') declarations.push('  align-items: center;')
  if (layout.align === 'end') declarations.push('  align-items: flex-end;')
  if (layout.align === 'stretch') declarations.push('  align-items: stretch;')
  if (layout.justify === 'center') declarations.push('  justify-content: center;')
  if (layout.justify === 'end') declarations.push('  justify-content: flex-end;')
  if (layout.justify === 'between') {
    declarations.push('  justify-content: space-between;')
  }

  return declarations
}

function nodeClassName(node: UINode) {
  return `ui-loom-node-${node.id.replaceAll(/[^a-zA-Z0-9_-]/g, '-')}`
}

function ariaLabelForNode(node: UINode, defaultLabel: string, localizedLabel: string) {
  if (node.name === defaultLabel) return localizedLabel
  if (node.type === 'rect' && node.name === '矩形 1') return localizedLabel
  return node.name
}

function vectorLabel(node: UINode) {
  if (node.type === 'triangle') return '三角形图层'
  if (node.type === 'star') return '星形图层'
  if (node.type === 'polygon') return '多边形图层'
  if (node.type === 'path') return '路径图层'
  if (node.type === 'icon') return `${node.name} 图标`
  return node.name
}

function vectorStrokeWidth(node: UINode) {
  return node.style.borderWidth ?? 1
}

function vectorStrokeColor(node: UINode) {
  return node.style.borderColor ?? '#2563eb'
}

function vectorFillColor(node: UINode) {
  return node.type === 'path' ? 'none' : (node.style.background ?? '#dbeafe')
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

function renderChildren(document: PageDocument, node: HtmlRenderableNode): string {
  return visibleChildNodes(document, node)
    .map((childNode) => renderHtmlNode(document, childNode))
    .join('\n')
}

function visibleChildNodes(document: PageDocument, node: UINode) {
  return node.children
    .map((childId) => resolveRenderableNode(document, childId))
    .filter((childNode) => childNode.meta.visible !== false)
}

function renderTextNode(node: HtmlRenderableNode) {
  return `<p ${nodeMappingAttribute(node)} class="${nodeClassName(node)}">${escapeHtml(node.content.text)}</p>`
}

function renderButtonNode(node: HtmlRenderableNode) {
  return `<button ${nodeMappingAttribute(node)} class="${nodeClassName(node)}" type="button">${escapeHtml(
    node.content.text,
  )}</button>`
}

function renderImageNode(node: HtmlRenderableNode) {
  return `<img ${nodeMappingAttribute(node)} class="${nodeClassName(node)}" src="${escapeHtml(
    node.content.src,
  )}" alt="${escapeHtml(node.content.alt)}" />`
}

function renderInputNode(node: HtmlRenderableNode) {
  return `<input ${nodeMappingAttribute(node)} class="${nodeClassName(node)}" aria-label="${escapeHtml(
    node.name,
  )}" placeholder="${escapeHtml(node.content.placeholder)}" />`
}

function renderRectNode(node: HtmlRenderableNode) {
  return `<div ${nodeMappingAttribute(node)} class="${nodeClassName(node)}" aria-label="${escapeHtml(
    ariaLabelForNode(node, 'Rectangle', '矩形图层'),
  )}"></div>`
}

function renderEllipseNode(node: HtmlRenderableNode) {
  return `<div ${nodeMappingAttribute(node)} class="${nodeClassName(node)}" aria-label="${escapeHtml(
    ariaLabelForNode(node, '圆形 1', '圆形图层'),
  )}"></div>`
}

function renderVectorShapeNode(node: HtmlRenderableNode) {
  if (node.type === 'icon') {
    return `<svg ${nodeMappingAttribute(node)} class="${nodeClassName(node)}" aria-label="${escapeHtml(
      vectorLabel(node),
    )}" role="img" viewBox="${escapeHtml(
      vectorViewBox(node),
    )}" preserveAspectRatio="xMidYMid meet"><path d="${escapeHtml(
      node.content.svgPath,
    )}" fill="currentColor" /></svg>`
  }

  if (node.type === 'path') {
    return `<svg ${nodeMappingAttribute(node)} class="${nodeClassName(node)}" aria-label="${escapeHtml(
      vectorLabel(node),
    )}" role="img" viewBox="${vectorViewBox(node)}" preserveAspectRatio="none"><path d="${escapeHtml(
      node.content.pathData,
    )}" fill="none" stroke="${escapeHtml(
      vectorStrokeColor(node),
    )}" stroke-linecap="round" stroke-width="${vectorStrokeWidth(
      node,
    )}" vector-effect="non-scaling-stroke" /></svg>`
  }

  return `<svg ${nodeMappingAttribute(node)} class="${nodeClassName(node)}" aria-label="${escapeHtml(
    vectorLabel(node),
  )}" role="img" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="${vectorPolygonPoints(
    node,
  )}" fill="${escapeHtml(vectorFillColor(node))}" stroke="${escapeHtml(
    vectorStrokeColor(node),
  )}" stroke-width="${vectorStrokeWidth(
    node,
  )}" vector-effect="non-scaling-stroke" /></svg>`
}

function renderSliceNode(node: HtmlRenderableNode) {
  return `<div ${nodeMappingAttribute(node)} class="${nodeClassName(node)}" aria-label="${escapeHtml(
    ariaLabelForNode(node, '切片 1', '切片图层'),
  )}"></div>`
}

function renderContainerNode(document: PageDocument, node: HtmlRenderableNode) {
  const children = renderChildren(document, node)

  if (!children) {
    return `<div ${nodeMappingAttribute(node)} class="${nodeClassName(node)}" aria-label="${escapeHtml(
      node.name,
    )}">${escapeHtml(node.content.text)}</div>`
  }

  return [
    `<div ${nodeMappingAttribute(node)} class="${nodeClassName(node)}" aria-label="${escapeHtml(
      node.name,
    )}">`,
    indent(children),
    '</div>',
  ].join('\n')
}

function renderFrameNode(document: PageDocument, node: HtmlRenderableNode) {
  const children = renderChildren(document, node)

  if (!children) {
    return `<section ${nodeMappingAttribute(node)} class="${nodeClassName(node)}" aria-label="${escapeHtml(
      ariaLabelForNode(node, 'Frame', 'Frame 节点'),
    )}"></section>`
  }

  return [
    `<section ${nodeMappingAttribute(node)} class="${nodeClassName(node)}" aria-label="${escapeHtml(
      ariaLabelForNode(node, 'Frame', 'Frame 节点'),
    )}">`,
    indent(children),
    '</section>',
  ].join('\n')
}

function renderGroupNode(document: PageDocument, node: HtmlRenderableNode) {
  const children = renderChildren(document, node)

  if (!children) {
    return `<div ${nodeMappingAttribute(node)} class="${nodeClassName(node)}" aria-label="图层组"></div>`
  }

  return [
    `<div ${nodeMappingAttribute(node)} class="${nodeClassName(node)}" aria-label="图层组">`,
    indent(children),
    '</div>',
  ].join('\n')
}

function renderHtmlNode(document: PageDocument, node: HtmlRenderableNode): string {
  if (node.type === 'text') return renderTextNode(node)
  if (node.type === 'button') return renderButtonNode(node)
  if (node.type === 'image') return renderImageNode(node)
  if (node.type === 'input') return renderInputNode(node)
  if (node.type === 'rect') return renderRectNode(node)
  if (node.type === 'ellipse') return renderEllipseNode(node)
  if (
    node.type === 'triangle' ||
    node.type === 'star' ||
    node.type === 'polygon' ||
    node.type === 'icon' ||
    node.type === 'path'
  ) {
    return renderVectorShapeNode(node)
  }
  if (node.type === 'slice') return renderSliceNode(node)
  if (node.type === 'group') return renderGroupNode(document, node)
  if (node.type === 'frame') return renderFrameNode(document, node)
  if (node.type === 'card' || node.type === 'container' || node.type === 'list') {
    return renderContainerNode(document, node)
  }
  throw new Error(`HTML export does not support node type: ${node.type}`)
}

export function renderCssRule(
  document: PageDocument,
  node: HtmlRenderableNode,
  isRootChild: boolean,
): string[] {
  const ownRule = [
    `.${nodeClassName(node)} {`,
    ...layoutToCss(node.layout, isRootChild),
    ...styleToCss(node.style),
    ...shapeCss(node),
    '}',
  ].join('\n')

  return [
    ownRule,
    ...visibleChildNodes(document, node).flatMap((childNode) =>
      renderCssRule(document, childNode, false),
    ),
  ]
}

export function renderHtmlBody(document: PageDocument) {
  const root = document.nodes[document.rootNodeId]

  return visibleChildNodes(document, root)
    .map((node) => renderHtmlNode(document, node))
    .join('\n')
}

export function renderCss(document: PageDocument) {
  const root = document.nodes[document.rootNodeId]
  const nodeRules = visibleChildNodes(document, root).flatMap((node) =>
    renderCssRule(document, node, true),
  )

  return [
    '* {',
    '  box-sizing: border-box;',
    '}',
    '',
    'body {',
    '  margin: 0;',
    '  font-family: ui-sans-serif, system-ui, sans-serif;',
    '  background: #f5f5f4;',
    '}',
    '',
    '.ui-loom-page {',
    '  position: relative;',
    '  min-height: 100vh;',
    '  width: 100%;',
    '  overflow: hidden;',
    `  background: ${root.style.background ?? '#ffffff'};`,
    '}',
    '',
    ...nodeRules,
  ].join('\n\n')
}
