import type { PageDocument, UINode } from '../model/types'
import { boxStyleToClassName, textStyleToClassName } from './tailwindMapping'

function escapeText(value = '') {
  return value.replaceAll('{', '&#123;').replaceAll('}', '&#125;')
}

function renderNode(node: UINode) {
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
    return `      <div className="${boxStyleToClassName(node.style)} p-4"></div>`
  }

  return ''
}

export function exportToReactTailwind(document: PageDocument) {
  const body = Object.values(document.nodes)
    .filter((node) => node.type !== 'page')
    .map(renderNode)
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
