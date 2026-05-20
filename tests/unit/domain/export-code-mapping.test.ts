import { describe, expect, it } from 'vitest'
import {
  createButtonNode,
  createFrameNode,
  insertChildNode,
} from '../../../src/domain/commands/editorCommands'
import { exportToHtmlCssJsBundle } from '../../../src/domain/exporter/htmlCssJsExporter'
import { exportToReactTailwindBundle } from '../../../src/domain/exporter/reactTailwindBundleExporter'
import { exportToSingleFileHtmlBundle } from '../../../src/domain/exporter/singleFileHtmlExporter'
import { exportToVue3Bundle } from '../../../src/domain/exporter/vue3Exporter'
import { createEmptyDocument } from '../../../src/domain/model/factories'

describe('export code mapping', () => {
  it('maps nodes to generated React component files', () => {
    const document = createEmptyDocument('React Mapping Test')
    const frame = {
      ...createFrameNode(),
      id: 'hero-frame',
      meta: { componentHint: 'hero-section' },
    }
    const button = { ...createButtonNode('开始'), id: 'hero-button' }
    const withFrame = insertChildNode(document, document.rootNodeId, frame)
    const next = insertChildNode(withFrame, frame.id, button)
    const bundle = exportToReactTailwindBundle(next)

    expect(bundle.mappings).toContainEqual({
      filePath: 'src/components/HeroSection.tsx',
      nodeId: 'hero-frame',
      token: 'data-ui-node-id="hero-frame"',
    })
    expect(bundle.mappings).toContainEqual({
      filePath: 'src/components/HeroSection.tsx',
      nodeId: 'hero-button',
      token: 'data-ui-node-id="hero-button"',
    })
  })

  it('maps nodes to generated Vue and HTML files', () => {
    const document = createEmptyDocument('Cross Target Mapping Test')
    const button = { ...createButtonNode('保存'), id: 'save-button' }
    const next = insertChildNode(document, document.rootNodeId, button)
    const vueBundle = exportToVue3Bundle(next)
    const htmlBundle = exportToHtmlCssJsBundle(next)
    const singleFileBundle = exportToSingleFileHtmlBundle(next)

    expect(vueBundle.mappings).toContainEqual({
      filePath: 'GeneratedPage.vue',
      nodeId: 'save-button',
      token: 'data-ui-node-id="save-button"',
    })
    expect(htmlBundle.mappings).toContainEqual({
      filePath: 'index.html',
      nodeId: 'save-button',
      token: 'data-ui-node-id="save-button"',
    })
    expect(singleFileBundle.mappings).toContainEqual({
      filePath: 'index.html',
      nodeId: 'save-button',
      token: 'data-ui-node-id="save-button"',
    })
  })
})
