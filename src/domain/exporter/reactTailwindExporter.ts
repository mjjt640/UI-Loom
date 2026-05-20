import type { PageDocument, UINode } from '../model/types'
import {
  boxStyleToClassName,
  layoutToClassName,
  textStyleToClassName,
} from './tailwindMapping'

function escapeText(value = '') {
  return value.replaceAll('{', '&#123;').replaceAll('}', '&#125;')
}

function indent(value: string) {
  return value
    .split('\n')
    .map((line) => `  ${line}`)
    .join('\n')
}

function className(...values: string[]) {
  return values.filter(Boolean).join(' ')
}

function resolveRenderableNode(document: PageDocument, nodeId: string) {
  const node = document.nodes[nodeId]

  if (!node) {
    throw new Error(`Export node not found: ${nodeId}`)
  }

  if (
    node.type !== 'text' &&
    node.type !== 'button' &&
    node.type !== 'image' &&
    node.type !== 'container' &&
    node.type !== 'rect' &&
    node.type !== 'group'
  ) {
    throw new Error(`React Tailwind export does not support node type: ${node.type}`)
  }

  return node
}

function visibleChildNodes(document: PageDocument, node: UINode) {
  return node.children
    .map((childId) => resolveRenderableNode(document, childId))
    .filter((childNode) => childNode.meta.visible !== false)
}

function renderNode(document: PageDocument, node: UINode): string {
  if (node.type === 'text') {
    return `      <div className="${textStyleToClassName(node.style)}">${escapeText(
      node.content.text,
    )}</div>`
  }

  if (node.type === 'button') {
    return `      <button className="${boxStyleToClassName(node.style)} px-4 py-2">${escapeText(
      node.content.text,
    )}</button>`
  }

  if (node.type === 'image') {
    return `      <img className="${boxStyleToClassName(
      node.style,
    )}" src="${escapeText(node.content.src)}" alt="${escapeText(node.content.alt)}" />`
  }

  if (node.type === 'rect') {
    return `      <div aria-label="矩形图层" className="${boxStyleToClassName(
      node.style,
    )}"></div>`
  }

  if (node.type === 'container') {
    const children = visibleChildNodes(document, node)
      .map((childNode) => renderNode(document, childNode))
      .join('\n')
    const classes = className(
      boxStyleToClassName(node.style),
      layoutToClassName(node.layout),
      'p-4',
    )

    if (!children) {
      return `      <div className="${classes}"></div>`
    }

    return [`      <div className="${classes}">`, indent(children), '      </div>'].join(
      '\n',
    )
  }

  if (node.type === 'group') {
    const children = visibleChildNodes(document, node)
      .map((childNode) => renderNode(document, childNode))
      .join('\n')

    if (!children) {
      return '      <div aria-label="图层组"></div>'
    }

    return ['      <div aria-label="图层组">', indent(children), '      </div>'].join(
      '\n',
    )
  }

  throw new Error(`React Tailwind export does not support node type: ${node.type}`)
}

export function exportToReactTailwind(document: PageDocument) {
  const body = visibleChildNodes(document, document.nodes[document.rootNodeId])
    .map((node) => renderNode(document, node))
    .join('\n')

  return [
    'export function GeneratedPage() {',
    '  return (',
    '    <main className="min-h-screen bg-white">',
    body,
    '    </main>',
    '  );',
    '}',
  ].join('\n')
}
