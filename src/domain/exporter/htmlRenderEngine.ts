import type { LayoutProps, PageDocument, StyleProps, UINode } from '../model/types'

type HtmlRenderableNodeType =
  | 'text'
  | 'button'
  | 'image'
  | 'container'
  | 'frame'
  | 'rect'
  | 'group'
export type HtmlRenderableNode = UINode & { type: HtmlRenderableNodeType }

export function isHtmlRenderableNode(node: UINode): node is HtmlRenderableNode {
  return (
    node.type === 'text' ||
    node.type === 'button' ||
    node.type === 'image' ||
    node.type === 'container' ||
    node.type === 'frame' ||
    node.type === 'rect' ||
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

function layoutToCss(layout: LayoutProps, isRootChild: boolean) {
  const declarations = [
    ...(isRootChild ? ['  position: absolute;'] : []),
    ...optionalCssDeclaration('left', layout.x),
    ...optionalCssDeclaration('top', layout.y),
    ...(typeof layout.width === 'number'
      ? [cssDeclaration('width', layout.width)]
      : []),
    ...(typeof layout.height === 'number'
      ? [cssDeclaration('height', layout.height)]
      : []),
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
  return `<p class="${nodeClassName(node)}">${escapeHtml(node.content.text)}</p>`
}

function renderButtonNode(node: HtmlRenderableNode) {
  return `<button class="${nodeClassName(node)}" type="button">${escapeHtml(
    node.content.text,
  )}</button>`
}

function renderImageNode(node: HtmlRenderableNode) {
  return `<img class="${nodeClassName(node)}" src="${escapeHtml(
    node.content.src,
  )}" alt="${escapeHtml(node.content.alt)}" />`
}

function renderRectNode(node: HtmlRenderableNode) {
  return `<div class="${nodeClassName(node)}" aria-label="矩形图层"></div>`
}

function renderContainerNode(document: PageDocument, node: HtmlRenderableNode) {
  const children = renderChildren(document, node)

  if (!children) {
    return `<div class="${nodeClassName(node)}"></div>`
  }

  return [
    `<div class="${nodeClassName(node)}">`,
    indent(children),
    '</div>',
  ].join('\n')
}

function renderFrameNode(document: PageDocument, node: HtmlRenderableNode) {
  const children = renderChildren(document, node)

  if (!children) {
    return `<div class="${nodeClassName(node)}" aria-label="Frame 节点"></div>`
  }

  return [
    `<div class="${nodeClassName(node)}" aria-label="Frame 节点">`,
    indent(children),
    '</div>',
  ].join('\n')
}

function renderGroupNode(document: PageDocument, node: HtmlRenderableNode) {
  const children = renderChildren(document, node)

  if (!children) {
    return `<div class="${nodeClassName(node)}" aria-label="图层组"></div>`
  }

  return [
    `<div class="${nodeClassName(node)}" aria-label="图层组">`,
    indent(children),
    '</div>',
  ].join('\n')
}

function renderHtmlNode(document: PageDocument, node: HtmlRenderableNode): string {
  if (node.type === 'text') return renderTextNode(node)
  if (node.type === 'button') return renderButtonNode(node)
  if (node.type === 'image') return renderImageNode(node)
  if (node.type === 'rect') return renderRectNode(node)
  if (node.type === 'group') return renderGroupNode(document, node)
  if (node.type === 'frame') return renderFrameNode(document, node)
  if (node.type === 'container') return renderContainerNode(document, node)
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
