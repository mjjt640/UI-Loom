import type { PageDocument, UINode } from '../model/types'
import { textStyleToClassName } from './tailwindMapping'

function escapeText(value = '') {
  return value.replaceAll('{', '&#123;').replaceAll('}', '&#125;')
}

function renderNode(node: UINode) {
  if (node.type === 'text') {
    return `      <div className="${textStyleToClassName(node.style)}">${escapeText(
      node.content.text,
    )}</div>`
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
