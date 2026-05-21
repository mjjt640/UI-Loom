import { describe, expect, it } from 'vitest'
import {
  insertChildNode,
} from '../../../src/domain/commands/editorCommands'
import {
  componentFileNameForNode,
  componentNameForNode,
  uniqueComponentNamesForNodes,
} from '../../../src/domain/exporter/componentNaming'
import { exportToReactTailwindBundle } from '../../../src/domain/exporter/reactTailwindBundleExporter'
import { exportToVue3Bundle } from '../../../src/domain/exporter/vue3Exporter'
import { createEmptyDocument } from '../../../src/domain/model/factories'
import { testButtonNode, testContainerNode, testFrameNode } from './nodeTestFactories'

describe('componentized export naming', () => {
  it('uses component hints as stable PascalCase component names', () => {
    const frame = {
      ...testFrameNode(),
      meta: { componentHint: 'hero-section' },
    }

    expect(componentNameForNode(frame)).toBe('HeroSection')
    expect(componentFileNameForNode(frame)).toBe('HeroSection')
  })

  it('falls back to node names when no component hint exists', () => {
    const container = {
      ...testContainerNode(),
      name: 'pricing cards',
    }

    expect(componentNameForNode(container)).toBe('PricingCards')
    expect(componentFileNameForNode(container)).toBe('PricingCards')
  })

  it('deduplicates component names deterministically within one bundle', () => {
    const first = {
      ...testFrameNode(),
      id: 'first',
      meta: { componentHint: 'hero-section' },
    }
    const second = {
      ...testFrameNode(),
      id: 'second',
      meta: { componentHint: 'Hero Section' },
    }
    const third = {
      ...testFrameNode(),
      id: 'third',
      name: 'hero section',
    }

    expect(uniqueComponentNamesForNodes([first, second, third])).toEqual([
      { nodeId: 'first', componentName: 'HeroSection', fileName: 'HeroSection' },
      {
        nodeId: 'second',
        componentName: 'HeroSection2',
        fileName: 'HeroSection2',
      },
      {
        nodeId: 'third',
        componentName: 'HeroSection3',
        fileName: 'HeroSection3',
      },
    ])
  })
})

describe('React componentized export', () => {
  it('exports semantic top-level frames as component files', () => {
    const document = createEmptyDocument('Componentized React Test')
    const heroFrame = {
      ...testFrameNode(),
      id: 'hero-frame',
      name: 'Hero Section',
      meta: { componentHint: 'hero-section' },
    }
    const button = {
      ...testButtonNode('开始体验'),
      id: 'hero-button',
    }
    const withHero = insertChildNode(document, document.rootNodeId, heroFrame)
    const next = insertChildNode(withHero, heroFrame.id, button)
    const bundle = exportToReactTailwindBundle(next)

    expect(bundle.files.map((file) => file.path)).toEqual([
      'src/GeneratedPage.tsx',
      'src/components/HeroSection.tsx',
      'README.md',
    ])
    expect(bundle.files[0].content).toContain(
      "import { HeroSection } from './components/HeroSection'",
    )
    expect(bundle.files[0].content).toContain('<HeroSection />')
    expect(bundle.files[1].content).toContain('export function HeroSection()')
    expect(bundle.files[1].content).toContain('aria-label="Hero Section"')
    expect(bundle.files[1].content).toContain('开始体验')
  })
})

describe('Vue componentized export', () => {
  it('exports semantic top-level frames as Vue component files', () => {
    const document = createEmptyDocument('Componentized Vue Test')
    const heroFrame = {
      ...testFrameNode(),
      id: 'hero-frame',
      name: 'Hero Section',
      meta: { componentHint: 'hero-section' },
    }
    const button = {
      ...testButtonNode('立即开始'),
      id: 'hero-button',
    }
    const withHero = insertChildNode(document, document.rootNodeId, heroFrame)
    const next = insertChildNode(withHero, heroFrame.id, button)
    const bundle = exportToVue3Bundle(next)

    expect(bundle.files.map((file) => file.path)).toEqual([
      'GeneratedPage.vue',
      'components/HeroSection.vue',
      'README.md',
    ])
    expect(bundle.files[0].content).toContain(
      "import HeroSection from './components/HeroSection.vue'",
    )
    expect(bundle.files[0].content).toContain('<HeroSection />')
    expect(bundle.files[1].content).toContain('<template>')
    expect(bundle.files[1].content).toContain('aria-label="Hero Section"')
    expect(bundle.files[1].content).toContain('立即开始')
    expect(bundle.files[1].content).toContain('<style scoped>')
  })
})
