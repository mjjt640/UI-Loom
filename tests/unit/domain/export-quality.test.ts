import { describe, expect, it } from 'vitest'
import {
  createButtonNode,
  createFrameNode,
  createImageNode,
  createRectNode,
  insertChildNode,
} from '../../../src/domain/commands/editorCommands'
import { exportToHtmlCssJsBundle } from '../../../src/domain/exporter/htmlCssJsExporter'
import { exportToReactTailwindBundle } from '../../../src/domain/exporter/reactTailwindBundleExporter'
import { exportToVue3Bundle } from '../../../src/domain/exporter/vue3Exporter'
import { createEmptyDocument } from '../../../src/domain/model/factories'

describe('export quality', () => {
  it('exports named frames as semantic sections across React and HTML', () => {
    const document = createEmptyDocument('Semantic Export Test')
    const frame = {
      ...createFrameNode(),
      id: 'hero-frame',
      name: 'Hero Section',
      meta: { componentHint: 'hero-section' },
    }
    const withFrame = insertChildNode(document, document.rootNodeId, frame)
    const reactBundle = exportToReactTailwindBundle(withFrame)
    const htmlBundle = exportToHtmlCssJsBundle(withFrame)

    expect(reactBundle.files[1].content).toContain(
      '<section data-ui-node-id="hero-frame" aria-label="Hero Section"',
    )
    expect(htmlBundle.files[0].content).toContain(
      '<section data-ui-node-id="hero-frame"',
    )
    expect(htmlBundle.files[0].content).toContain('aria-label="Hero Section"')
  })

  it('keeps button and image accessibility deterministic', () => {
    const document = createEmptyDocument('Accessibility Export Test')
    const button = { ...createButtonNode('购买'), id: 'buy-button' }
    const image = {
      ...createImageNode('https://example.com/product.png'),
      id: 'product-image',
      content: { alt: '产品图', src: 'https://example.com/product.png' },
    }
    const rect = { ...createRectNode(), id: 'accent-rect', name: 'Accent Glow' }
    const withButton = insertChildNode(document, document.rootNodeId, button)
    const withImage = insertChildNode(withButton, withButton.rootNodeId, image)
    const next = insertChildNode(withImage, withImage.rootNodeId, rect)
    const reactBundle = exportToReactTailwindBundle(next)
    const code = reactBundle.files[0].content
    const readme = reactBundle.files.find((file) => file.path === 'README.md')?.content

    expect(code).toContain('<button data-ui-node-id="buy-button" type="button"')
    expect(code).toContain('alt="产品图"')
    expect(code).toContain('aria-label="Accent Glow"')
    expect(readme).toContain('Tailwind CSS')
    expect(readme).toContain('data-ui-node-id')
  })

  it('documents Vue componentized export usage', () => {
    const document = createEmptyDocument('Vue README Test')
    const frame = {
      ...createFrameNode(),
      id: 'hero-frame',
      meta: { componentHint: 'hero-section' },
    }
    const next = insertChildNode(document, document.rootNodeId, frame)
    const bundle = exportToVue3Bundle(next)

    expect(bundle.files.map((file) => file.path)).toContain('README.md')
    expect(bundle.files.find((file) => file.path === 'README.md')?.content)
      .toContain('components/HeroSection.vue')
  })
})
