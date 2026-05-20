import type { PageDocument } from '../model/types'
import type { ExportBundle, GeneratedFile } from './exportTypes'
import { uniqueComponentNamesForNodes } from './componentNaming'
import type { HtmlRenderableNode } from './htmlRenderEngine'
import {
  isHtmlRenderableNode,
  renderCss,
  renderCssRule,
  renderHtmlBody,
} from './htmlRenderEngine'

interface VueComponentBoundary {
  componentName: string
  fileName: string
  node: HtmlRenderableNode
}

function isComponentBoundary(node: HtmlRenderableNode) {
  return node.parentId !== null && (node.type === 'frame' || node.type === 'container')
}

function visibleRootNodes(document: PageDocument): HtmlRenderableNode[] {
  return document.nodes[document.rootNodeId].children
    .map((nodeId) => {
      const node = document.nodes[nodeId]

      if (!node) {
        throw new Error(`Root child node not found: ${nodeId}`)
      }

      if (!isHtmlRenderableNode(node)) {
        throw new Error(`Vue export does not support node type: ${node.type}`)
      }

      return node
    })
    .filter((node) => node.meta.visible !== false)
}

function componentBoundaries(document: PageDocument): VueComponentBoundary[] {
  const boundaryNodes = visibleRootNodes(document).filter(isComponentBoundary)
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

function renderGeneratedPage(document: PageDocument, boundaries: VueComponentBoundary[]) {
  const boundaryByNodeId = new Map(
    boundaries.map((boundary) => [boundary.node.id, boundary]),
  )
  const imports = boundaries.map(
    (boundary) =>
      `import ${boundary.componentName} from './components/${boundary.fileName}.vue'`,
  )
  const templateBody = visibleRootNodes(document)
    .map((node) => {
      const boundary = boundaryByNodeId.get(node.id)

      if (boundary) {
        return `    <${boundary.componentName} />`
      }

      const inlineDocument = {
        ...document,
        nodes: {
          ...document.nodes,
          [document.rootNodeId]: {
            ...document.nodes[document.rootNodeId],
            children: [node.id],
          },
        },
      }

      return renderHtmlBody(inlineDocument)
        .split('\n')
        .map((line) => `    ${line}`)
        .join('\n')
    })
    .join('\n')

  return [
    '<template>',
    '  <main class="ui-loom-page">',
    templateBody,
    '  </main>',
    '</template>',
    '',
    '<script setup lang="ts">',
    ...imports,
    `const pageName = '${document.name.replaceAll("'", "\\'")}'`,
    '</script>',
    '',
    '<style scoped>',
    renderCss(document),
    '</style>',
  ].join('\n')
}

function renderComponentStyle(document: PageDocument, node: HtmlRenderableNode) {
  return renderCssRule(document, node, true).join('\n\n')
}

function renderComponentFile(document: PageDocument, boundary: VueComponentBoundary) {
  const componentDocument = {
    ...document,
    nodes: {
      ...document.nodes,
      [document.rootNodeId]: {
        ...document.nodes[document.rootNodeId],
        children: [boundary.node.id],
      },
    },
  }

  return [
    '<template>',
    renderHtmlBody(componentDocument)
      .split('\n')
      .map((line) => `  ${line}`)
      .join('\n'),
    '</template>',
    '',
    '<script setup lang="ts">',
    `const componentName = '${boundary.componentName}'`,
    '</script>',
    '',
    '<style scoped>',
    renderComponentStyle(document, boundary.node),
    '</style>',
  ].join('\n')
}

export function exportToVueComponentBundle(document: PageDocument): ExportBundle {
  const boundaries = componentBoundaries(document)
  const componentFiles: GeneratedFile[] = boundaries.map((boundary) => ({
    path: `components/${boundary.fileName}.vue`,
    language: 'vue',
    content: renderComponentFile(document, boundary),
  }))

  return {
    target: 'vue3-sfc',
    files: [
      {
        path: 'GeneratedPage.vue',
        language: 'vue',
        content: renderGeneratedPage(document, boundaries),
      },
      ...componentFiles,
    ],
  }
}
