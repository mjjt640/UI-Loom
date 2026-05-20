import { describe, expect, it } from 'vitest'
import {
  createButtonNode,
  createContainerNode,
  createImageNode,
  createTextNode,
  insertChildNode,
  moveNode,
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

  it('exports container children inside the container markup', () => {
    const document = createEmptyDocument('导出测试')
    const buttonNode = createButtonNode('立即开始')
    const containerNode = createContainerNode()
    const withContainer = insertChildNode(
      document,
      document.rootNodeId,
      containerNode,
    )
    const withButton = insertChildNode(
      withContainer,
      withContainer.rootNodeId,
      buttonNode,
    )
    const next = moveNode(withButton, buttonNode.id, containerNode.id)
    const code = exportToReactTailwind(next)

    expect(code).toContain('<div className="rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3 p-4">')
    expect(code).toContain('立即开始')
    expect(code.indexOf('<div className="rounded-2xl')).toBeLessThan(
      code.indexOf('立即开始'),
    )
  })
})
