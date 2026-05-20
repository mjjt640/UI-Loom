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

  if (node.type === 'container') {
    const children = node.children
      .map((childId) => document.nodes[childId])
      .filter(Boolean)
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

  return ''
}

export function exportToReactTailwind(document: PageDocument) {
  const body = document.nodes[document.rootNodeId].children
    .map((nodeId) => document.nodes[nodeId])
    .filter(Boolean)
    .map((node) => renderNode(document, node))
    .filter(Boolean)
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
