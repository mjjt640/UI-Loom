import { describe, expect, it } from 'vitest'
import {
  insertChildNode,
} from '../../../src/domain/commands/editorCommands'
import { exportToHtmlCssJsBundle } from '../../../src/domain/exporter/htmlCssJsExporter'
import { exportToReactTailwindBundle } from '../../../src/domain/exporter/reactTailwindBundleExporter'
import { exportTargets } from '../../../src/domain/exporter/exportRegistry'
import { exportToSingleFileHtmlBundle } from '../../../src/domain/exporter/singleFileHtmlExporter'
import { exportToVue3Bundle } from '../../../src/domain/exporter/vue3Exporter'
import { createEmptyDocument } from '../../../src/domain/model/factories'
import type { UINode } from '../../../src/domain/model/types'
import { testButtonNode, testFrameNode } from './nodeTestFactories'

describe('export bundle architecture', () => {
  it('lists selectable code export targets', () => {
    expect(exportTargets.map((target) => target.id)).toEqual([
      'html-css-js',
      'single-file-html',
      'vue3-sfc',
      'react-tailwind',
    ])
  })

  it('exports React Tailwind as a generated file bundle', () => {
    const document = createEmptyDocument('Bundle Test')
    const next = insertChildNode(
      document,
      document.rootNodeId,
      testButtonNode('购买'),
    )
    const bundle = exportToReactTailwindBundle(next)

    expect(bundle.target).toBe('react-tailwind')
    expect(bundle.files.map((file) => file.path)).toEqual([
      'src/GeneratedPage.tsx',
      'README.md',
    ])
    expect(bundle.files[0].content).not.toMatch(/^\n/)
    expect(bundle.files[0].content).toContain('export function GeneratedPage()')
    expect(bundle.files[0].content).toContain('购买')
  })

  it('exports HTML CSS JS as three files', () => {
    const document = createEmptyDocument('HTML Test')
    const next = insertChildNode(
      document,
      document.rootNodeId,
      testButtonNode('开始'),
    )
    const bundle = exportToHtmlCssJsBundle(next)

    expect(bundle.target).toBe('html-css-js')
    expect(bundle.files.map((file) => file.path)).toEqual([
      'index.html',
      'styles.css',
      'script.js',
    ])
    expect(bundle.files[0].content).toContain('styles.css')
    expect(bundle.files[0].content).toContain('script.js')
    expect(bundle.files[1].content).toContain('.ui-loom-page')
    expect(bundle.files[0].content).toContain('开始')
  })

  it('exports a standalone HTML file', () => {
    const document = createEmptyDocument('Single HTML Test')
    const next = insertChildNode(
      document,
      document.rootNodeId,
      testButtonNode('提交'),
    )
    const bundle = exportToSingleFileHtmlBundle(next)

    expect(bundle.target).toBe('single-file-html')
    expect(bundle.files.map((file) => file.path)).toEqual(['index.html'])
    expect(bundle.files[0].content).toContain('<style>')
    expect(bundle.files[0].content).toContain('提交')
  })

  it('exports Vue 3 as a generated page with README guidance', () => {
    const document = createEmptyDocument('Vue Test')
    const next = insertChildNode(
      document,
      document.rootNodeId,
      testButtonNode('保存'),
    )
    const bundle = exportToVue3Bundle(next)

    expect(bundle.target).toBe('vue3-sfc')
    expect(bundle.files.map((file) => file.path)).toEqual([
      'GeneratedPage.vue',
      'README.md',
    ])
    expect(bundle.files[0].content).toContain('<template>')
    expect(bundle.files[0].content).toContain('<script setup')
    expect(bundle.files[0].content).toContain('保存')
  })

  it('exports Element Plus hinted nodes as Vue component tags', () => {
    const document = createEmptyDocument('Element Plus Vue Test')
    const elementPlusButton: UINode = {
      ...testButtonNode('保存'),
      name: 'Element Plus 按钮',
      meta: { componentHint: 'element-plus-button' },
    }
    const elementPlusInput: UINode = {
      ...testButtonNode(''),
      type: 'input',
      name: 'Element Plus 输入框',
      content: { placeholder: '请输入邮箱' },
      meta: { componentHint: 'element-plus-input' },
    }
    const elementPlusTable: UINode = {
      ...testButtonNode(''),
      type: 'list',
      name: 'Element Plus 表格',
      content: { text: '姓名\n角色\n状态' },
      meta: { componentHint: 'element-plus-table' },
    }
    const withButton = insertChildNode(
      document,
      document.rootNodeId,
      elementPlusButton,
    )
    const next = insertChildNode(
      withButton,
      withButton.rootNodeId,
      elementPlusInput,
    )
    const withTable = insertChildNode(
      next,
      next.rootNodeId,
      elementPlusTable,
    )
    const bundle = exportToVue3Bundle(withTable)
    const page = bundle.files.find((file) => file.path === 'GeneratedPage.vue')
    const readme = bundle.files.find((file) => file.path === 'README.md')

    expect(page?.content).toContain('<el-button')
    expect(page?.content).toContain('type="primary"')
    expect(page?.content).toContain('>保存</el-button>')
    expect(page?.content).toContain(
      '<el-input placeholder="请输入邮箱" aria-label="Element Plus 输入框" />',
    )
    expect(page?.content).toContain('<el-table :data="tableData"')
    expect(page?.content).toContain('const tableData =')
    expect(readme?.content).toContain('pnpm add element-plus')
    expect(readme?.content).toContain("import ElementPlus from 'element-plus'")
  })

  it('exports nested Element Plus nodes inside Vue component files', () => {
    const document = createEmptyDocument('Nested Element Plus Vue Test')
    const frameNode = testFrameNode()
    const elementPlusButton: UINode = {
      ...testButtonNode('确认'),
      name: 'Element Plus 按钮',
      meta: { componentHint: 'element-plus-button' },
    }
    const withFrame = insertChildNode(document, document.rootNodeId, frameNode)
    const next = insertChildNode(withFrame, frameNode.id, elementPlusButton)
    const bundle = exportToVue3Bundle(next)
    const frameFile = bundle.files.find(
      (file) => file.path === 'components/Frame.vue',
    )

    expect(frameFile?.content).toContain('<el-button')
    expect(frameFile?.content).toContain('>确认</el-button>')
    expect(frameFile?.content).not.toContain('<button')
  })

  it('exports frame auto layout semantics across code targets', () => {
    const document = createEmptyDocument('Frame Export Test')
    const frameNode = testFrameNode()
    const withFrame = insertChildNode(document, document.rootNodeId, frameNode)
    const next = insertChildNode(
      withFrame,
      frameNode.id,
      testButtonNode('继续'),
    )

    const htmlBundle = exportToHtmlCssJsBundle(next)
    const vueBundle = exportToVue3Bundle(next)
    const reactBundle = exportToReactTailwindBundle(next)

    expect(htmlBundle.files[0].content).toContain('aria-label="Frame 节点"')
    expect(htmlBundle.files[1].content).toContain('flex-direction: column;')
    expect(htmlBundle.files[1].content).toContain('gap: 16px;')
    expect(htmlBundle.files[1].content).toContain('padding: 24px;')
    expect(vueBundle.files[0].content).toContain('<Frame />')
    expect(vueBundle.files[1].content).toContain('aria-label="Frame 节点"')
    expect(vueBundle.files[1].content).toContain('flex-direction: column;')
    expect(reactBundle.files[0].content).toContain('<Frame />')
    expect(reactBundle.files[1].content).toContain('aria-label="Frame 节点"')
    expect(reactBundle.files[1].content).toContain('flex flex-col gap-4 p-6')
    expect(reactBundle.files[1].content).toContain('继续')
  })
})
