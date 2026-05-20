import { describe, expect, it } from 'vitest'
import {
  createButtonNode,
  createContainerNode,
  createImageNode,
  createTextNode,
  insertChildNode,
} from '../../../src/domain/commands/editorCommands'
import { exportToReactTailwind } from '../../../src/domain/exporter/reactTailwindExporter'
import { createEmptyDocument } from '../../../src/domain/model/factories'

describe('exportToReactTailwind', () => {
  it('exports a text node into jsx', () => {
    const document = createEmptyDocument('导出测试')
    const next = insertChildNode(
      document,
      document.rootNodeId,
      createTextNode('欢迎回来'),
    )
    const code = exportToReactTailwind(next)

    expect(code).toContain('export function GeneratedPage()')
    expect(code).toContain('欢迎回来')
  })

  it('exports button, image, and container nodes into jsx', () => {
    const document = createEmptyDocument('导出测试')
    const withButton = insertChildNode(
      document,
      document.rootNodeId,
      createButtonNode('开始使用'),
    )
    const withImage = insertChildNode(
      withButton,
      withButton.rootNodeId,
      createImageNode('https://example.com/hero.png'),
    )
    const next = insertChildNode(
      withImage,
      withImage.rootNodeId,
      createContainerNode(),
    )
    const code = exportToReactTailwind(next)

    expect(code).toContain('<button')
    expect(code).toContain('开始使用')
    expect(code).toContain('<img')
    expect(code).toContain('https://example.com/hero.png')
    expect(code).toContain('<div')
    expect(code).toContain('rounded-2xl')
  })
})
