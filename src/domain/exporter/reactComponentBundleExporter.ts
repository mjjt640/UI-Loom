import type { PageDocument, UINode } from '../model/types'
import type { ExportBundle, GeneratedFile } from './exportTypes'
import { uniqueComponentNamesForNodes } from './componentNaming'
import {
  indentReact,
  renderReactNode,
  visibleReactChildNodes,
} from './reactTailwindExporter'

interface ReactComponentBoundary {
  componentName: string
  fileName: string
  node: UINode
}

function isComponentBoundary(node: UINode) {
  return node.parentId !== null && (node.type === 'frame' || node.type === 'container')
}

function rootVisibleNodes(document: PageDocument) {
  return visibleReactChildNodes(document, document.nodes[document.rootNodeId])
}

function componentBoundaries(document: PageDocument): ReactComponentBoundary[] {
  const boundaryNodes = rootVisibleNodes(document).filter(isComponentBoundary)
  const names = uniqueComponentNamesForNodes(boundaryNodes)

  return boundaryNodes.map((node) => {
    const name = names.find((entry) => entry.nodeId === node.id)

    if (!name) {
      throw new Error(`Component name not found for node: ${node.id}`)
    }

    return {
      componentName: name.componentName,
      fileName: name.fileName,
      node,
    }
  })
}

function renderGeneratedPage(
  document: PageDocument,
  boundaries: ReactComponentBoundary[],
) {
  const boundaryByNodeId = new Map(
    boundaries.map((boundary) => [boundary.node.id, boundary]),
  )
  const imports = boundaries.map(
    (boundary) =>
      `import { ${boundary.componentName} } from './components/${boundary.fileName}'`,
  )
  const body = rootVisibleNodes(document)
    .map((node) => {
      const boundary = boundaryByNodeId.get(node.id)

      return boundary
        ? `      <${boundary.componentName} />`
        : renderReactNode(document, node)
    })
    .join('\n')

  return [
    ...imports,
    ...(imports.length > 0 ? [''] : []),
    'export function GeneratedPage() {',
    '  return (',
    '    <main className="min-h-screen bg-white">',
    body,
    '    </main>',
    '  );',
    '}',
  ].join('\n')
}

function renderComponentFile(document: PageDocument, boundary: ReactComponentBoundary) {
  const markup = renderReactNode(document, boundary.node)

  return [
    `export function ${boundary.componentName}() {`,
    '  return (',
    indentReact(markup),
    '  );',
    '}',
  ].join('\n')
}

function reactReadme() {
  return [
    '# UI Loom React Export',
    '',
    '把 `src/GeneratedPage.tsx` 和 `src/components/` 放入 React + Tailwind 项目中使用。',
  ].join('\n')
}

export function exportToReactComponentBundle(
  document: PageDocument,
): ExportBundle {
  const boundaries = componentBoundaries(document)
  const componentFiles: GeneratedFile[] = boundaries.map((boundary) => ({
    path: `src/components/${boundary.fileName}.tsx`,
    language: 'tsx',
    content: renderComponentFile(document, boundary),
  }))

  return {
    target: 'react-tailwind',
    files: [
      {
        path: 'src/GeneratedPage.tsx',
        language: 'tsx',
        content: renderGeneratedPage(document, boundaries),
      },
      ...componentFiles,
      {
        path: 'README.md',
        language: 'md',
        content: reactReadme(),
      },
    ],
  }
}
