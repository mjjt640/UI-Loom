import { describe, expect, it } from 'vitest'
import {
  insertChildNode,
} from '../../../src/domain/commands/editorCommands'
import { exportToHtmlCssJsBundle } from '../../../src/domain/exporter/htmlCssJsExporter'
import { renderReactNode } from '../../../src/domain/exporter/reactTailwindExporter'
import { exportToReactTailwindBundle } from '../../../src/domain/exporter/reactTailwindBundleExporter'
import { exportToVue3Bundle } from '../../../src/domain/exporter/vue3Exporter'
import { createEmptyDocument } from '../../../src/domain/model/factories'
import type { LayoutProps } from '../../../src/domain/model/types'
import { testButtonNode, testFrameNode } from './nodeTestFactories'

describe('responsive layout export', () => {
  it('exports fill and hug sizing with min/max bounds as Tailwind classes', () => {
    const document = createEmptyDocument('Responsive Tailwind Test')
    const frame = testFrameNode({
      width: 'fill',
      height: 'hug',
      minWidth: 320,
      maxWidth: 960,
      minHeight: 240,
      maxHeight: 720,
    })
    const next = insertChildNode(document, document.rootNodeId, frame)
    const code = renderReactNode(next, next.nodes[frame.id])

    expect(code).toContain('w-full h-auto')
    expect(code).toContain('min-w-[320px] max-w-[960px]')
    expect(code).toContain('min-h-[240px] max-h-[720px]')
  })

  it('exports absolute constraints as deterministic Tailwind positioning classes', () => {
    const document = createEmptyDocument('Constraint Tailwind Test')
    const button = testButtonNode('约束按钮')
    const constrainedButton = {
      ...button,
      layout: {
        ...button.layout,
        constraints: {
          horizontal: 'stretch',
          vertical: 'bottom',
        } satisfies LayoutProps['constraints'],
      },
    }
    const next = insertChildNode(document, document.rootNodeId, constrainedButton)
    const code = renderReactNode(next, next.nodes[constrainedButton.id])

    expect(code).toContain('absolute left-[40px] right-[40px] bottom-[72px]')
    expect(code).not.toContain('top-[72px]')
  })

  it('exports the same responsive semantics to HTML CSS and Vue style output', () => {
    const document = createEmptyDocument('Responsive CSS Test')
    const frame = {
      ...testFrameNode({
        width: 'fill',
        height: 'hug',
        minWidth: 360,
        maxWidth: 1080,
        constraints: {
          horizontal: 'center',
          vertical: 'top',
        },
      }),
      id: 'responsive-frame',
    }
    const withFrame = insertChildNode(document, document.rootNodeId, frame)
    const next = insertChildNode(withFrame, frame.id, testButtonNode('继续'))
    const htmlBundle = exportToHtmlCssJsBundle(next)
    const vueBundle = exportToVue3Bundle(next)
    const reactBundle = exportToReactTailwindBundle(next)

    expect(htmlBundle.files[1].content).toContain('width: 100%;')
    expect(htmlBundle.files[1].content).toContain('height: auto;')
    expect(htmlBundle.files[1].content).toContain('min-width: 360px;')
    expect(htmlBundle.files[1].content).toContain('max-width: 1080px;')
    expect(htmlBundle.files[1].content).toContain('left: 50%;')
    expect(htmlBundle.files[1].content).toContain('transform: translateX(-50%);')
    expect(vueBundle.files[1].content).toContain('width: 100%;')
    expect(vueBundle.files[1].content).toContain('max-width: 1080px;')
    expect(reactBundle.files[1].content).toContain(
      'absolute left-1/2 -translate-x-1/2 top-[120px]',
    )
    expect(reactBundle.files[1].content).toContain('w-full h-auto')
  })
})
