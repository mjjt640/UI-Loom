import { describe, expect, it } from 'vitest'
import {
  insertChildNode,
} from '../../../src/domain/commands/editorCommands'
import { exportToHtmlCssJsBundle } from '../../../src/domain/exporter/htmlCssJsExporter'
import { renderReactNode } from '../../../src/domain/exporter/reactTailwindExporter'
import { createEmptyDocument } from '../../../src/domain/model/factories'
import { testFrameNode, testRectNode } from './nodeTestFactories'

describe('advanced graphic properties', () => {
  it('exports deterministic React classes for arbitrary graphic styles', () => {
    const document = createEmptyDocument('Advanced Graphic Test')
    const rect = {
      ...testRectNode(),
      style: {
        background: '#f97316',
        borderColor: '#0f172a',
        borderWidth: 3,
        opacity: 0.72,
        radius: 14,
        shadow: '0 18px 40px rgba(15, 23, 42, 0.24)',
      },
    }
    const next = insertChildNode(document, document.rootNodeId, rect)
    const code = renderReactNode(next, next.nodes[rect.id])

    expect(code).toContain('rounded-[14px]')
    expect(code).toContain('bg-[#f97316]')
    expect(code).toContain('border-[3px]')
    expect(code).toContain('border-[#0f172a]')
    expect(code).toContain('shadow-[0_18px_40px_rgba(15,_23,_42,_0.24)]')
    expect(code).toContain('opacity-[0.72]')
  })

  it('exports advanced graphic styles through HTML CSS output', () => {
    const document = createEmptyDocument('Advanced CSS Test')
    const baseFrame = testFrameNode()
    const frame = {
      ...baseFrame,
      style: {
        ...baseFrame.style,
        background: '#ecfeff',
        borderColor: '#0891b2',
        borderWidth: 2,
        opacity: 0.8,
        radius: 28,
        shadow: '0 24px 60px rgba(8, 145, 178, 0.24)',
      },
    }
    const next = insertChildNode(document, document.rootNodeId, frame)
    const bundle = exportToHtmlCssJsBundle(next)
    const css = bundle.files.find((file) => file.path === 'styles.css')?.content

    expect(css).toContain('background: #ecfeff;')
    expect(css).toContain('border-color: #0891b2;')
    expect(css).toContain('border-width: 2px;')
    expect(css).toContain('border-radius: 28px;')
    expect(css).toContain('box-shadow: 0 24px 60px rgba(8, 145, 178, 0.24);')
    expect(css).toContain('opacity: 0.8;')
  })
})
