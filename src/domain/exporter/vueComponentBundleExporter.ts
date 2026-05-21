import type { PageDocument } from '../model/types'
import type { ExportBundle, GeneratedFile } from './exportTypes'
import { mappingsForSubtree } from './codeMapping'
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

function vueReadme(boundaries: VueComponentBoundary[]) {
  const componentPaths = boundaries.map(
    (boundary) => `- \`components/${boundary.fileName}.vue\``,
  )

  return [
    '# UI Loom Vue Export',
    '',
    '把 `GeneratedPage.vue` 和 `components/` 放入 Vue 3 项目中使用。',
    '',
    '导出的 `width: 100%`、`height: auto`、`min-width`、`max-width` 和约束定位来自设计节点的响应式布局语义。',
    '',
    '组件文件:',
    ...componentPaths,
    '',
    '`data-ui-node-id` 用于把设计节点稳定映射到生成代码。',
  ].join('\n')
}

export function exportToVueComponentBundle(document: PageDocument): ExportBundle {
  const boundaries = componentBoundaries(document)
  const boundaryIds = new Set(boundaries.map((boundary) => boundary.node.id))
  const componentFiles: GeneratedFile[] = boundaries.map((boundary) => ({
    path: `components/${boundary.fileName}.vue`,
    language: 'vue',
    content: renderComponentFile(document, boundary),
  }))
  const pageMappings = visibleRootNodes(document)
    .filter((node) => !boundaryIds.has(node.id))
    .flatMap((node) => mappingsForSubtree(document, node, 'GeneratedPage.vue'))
  const componentMappings = boundaries.flatMap((boundary) =>
    mappingsForSubtree(
      document,
      boundary.node,
      `components/${boundary.fileName}.vue`,
    ),
  )

  return {
    target: 'vue3-sfc',
    files: [
      {
        path: 'GeneratedPage.vue',
        language: 'vue',
        content: renderGeneratedPage(document, boundaries),
      },
      ...componentFiles,
      {
        path: 'README.md',
        language: 'md',
        content: vueReadme(boundaries),
      },
    ],
    mappings: [...pageMappings, ...componentMappings],
  }
}
