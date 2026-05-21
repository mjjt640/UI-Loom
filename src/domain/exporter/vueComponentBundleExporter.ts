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

function escapeHtml(value = '') {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function escapeVueAttribute(value = '') {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function elementPlusLines(node: HtmlRenderableNode) {
  const text = node.content.text ?? ''

  if (node.meta.componentHint === 'element-plus-button') {
    return [`<el-button type="primary">${escapeVueAttribute(text)}</el-button>`]
  }

  if (node.meta.componentHint === 'element-plus-input') {
    return [
      `<el-input placeholder="${escapeVueAttribute(
        node.content.placeholder,
      )}" aria-label="${escapeVueAttribute(node.name)}" />`,
    ]
  }

  if (node.meta.componentHint === 'element-plus-card') {
    const [header = node.name, ...bodyLines] = text.split('\n')
    const body = bodyLines.join('\n').trim()

    return [
      `<el-card aria-label="${escapeVueAttribute(node.name)}">`,
      `  <template #header>${escapeVueAttribute(header)}</template>`,
      `  <p>${escapeVueAttribute(body)}</p>`,
      '</el-card>',
    ]
  }

  if (node.meta.componentHint === 'element-plus-table') {
    return [
      '<el-table :data="tableData" style="width: 100%">',
      '  <el-table-column prop="name" label="姓名" />',
      '  <el-table-column prop="role" label="角色" />',
      '  <el-table-column prop="status" label="状态" />',
      '</el-table>',
    ]
  }

  return null
}

function renderElementPlusNode(node: HtmlRenderableNode) {
  const lines = elementPlusLines(node)

  return lines?.join('\n') ?? null
}

function replaceRenderedNode(
  content: string,
  node: HtmlRenderableNode,
  replacement: string,
) {
  const escapedNodeId = node.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const nodePattern = new RegExp(
    `<([a-z]+)\\b[^>]*data-ui-node-id="${escapedNodeId}"[^>]*(?:>[\\s\\S]*?<\\/\\1>|\\s\\/>)`,
  )

  return content.replace(nodePattern, replacement)
}

function replaceRootElementPlusNodes(content: string, nodes: HtmlRenderableNode[]) {
  return nodes.reduce((currentContent, node) => {
    const renderedElementPlus = renderElementPlusNode(node)

    if (!renderedElementPlus) {
      return currentContent
    }

    return replaceRenderedNode(currentContent, node, renderedElementPlus)
  }, content)
}

function replaceElementPlusNodesInSubtree(
  document: PageDocument,
  content: string,
  node: HtmlRenderableNode,
): string {
  const childNodes = node.children
    .map((childId) => document.nodes[childId])
    .filter((childNode): childNode is HtmlRenderableNode =>
      childNode ? isHtmlRenderableNode(childNode) : false,
    )

  return childNodes.reduce((currentContent, childNode) => {
    const replacedChildrenContent = replaceElementPlusNodesInSubtree(
      document,
      currentContent,
      childNode,
    )
    const renderedElementPlus = renderElementPlusNode(childNode)

    if (!renderedElementPlus) {
      return replacedChildrenContent
    }

    return replaceRenderedNode(
      replacedChildrenContent,
      childNode,
      renderedElementPlus,
    )
  }, content)
}

function hasElementPlusTable(document: PageDocument) {
  return Object.values(document.nodes).some(
    (node) => node.meta.componentHint === 'element-plus-table',
  )
}

function tableDataScript(document: PageDocument) {
  if (!hasElementPlusTable(document)) {
    return []
  }

  const tableNode = Object.values(document.nodes).find(
    (node) => node.meta.componentHint === 'element-plus-table',
  )
  const labels = (tableNode?.content.text ?? '姓名\n角色\n状态')
    .split('\n')
    .map((value) => value.trim())
    .filter(Boolean)
  const [name = '姓名', role = '角色', status = '状态'] = labels

  return [
    'const tableData = [',
    `  { name: '${escapeHtml(name)}', role: '${escapeHtml(
      role,
    )}', status: '${escapeHtml(status)}' },`,
    ']',
  ]
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
    ...tableDataScript(componentDocument),
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
    '如果导出内容包含 Element Plus 组件，请在目标项目安装并注册 Element Plus：',
    '',
    '```bash',
    'pnpm add element-plus',
    '```',
    '',
    '```ts',
    "import ElementPlus from 'element-plus'",
    "import 'element-plus/dist/index.css'",
    '',
    'app.use(ElementPlus)',
    '```',
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
  const rootNodes = visibleRootNodes(document)
  const boundaryIds = new Set(boundaries.map((boundary) => boundary.node.id))
  const componentFiles: GeneratedFile[] = boundaries.map((boundary) => ({
        path: `components/${boundary.fileName}.vue`,
        language: 'vue',
        content: replaceElementPlusNodesInSubtree(
          document,
          renderComponentFile(document, boundary),
          boundary.node,
        ),
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
        content: replaceRootElementPlusNodes(
          renderGeneratedPage(document, boundaries).replace(
            '</script>',
            [...tableDataScript(document), '</script>'].join('\n'),
          ),
          rootNodes.filter((node) => !boundaryIds.has(node.id)),
        ),
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
