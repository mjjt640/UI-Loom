import { describe, expect, it } from 'vitest'
import {
  createButtonNode,
  createContainerNode,
  createFrameNode,
  createImageNode,
  createTextNode,
  insertChildNode,
  moveNode,
} from '../../../src/domain/commands/editorCommands'
import { renderReactNode } from '../../../src/domain/exporter/reactTailwindExporter'
import { createEmptyDocument } from '../../../src/domain/model/factories'

describe('renderReactNode', () => {
  it('exports a text node into jsx', () => {
    const document = createEmptyDocument('导出测试')
    const next = insertChildNode(
      document,
      document.rootNodeId,
      createTextNode('欢迎回来'),
    )
    const [textId] = next.nodes[next.rootNodeId].children
    const code = renderReactNode(next, next.nodes[textId])

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
    const code = next.nodes[next.rootNodeId].children
      .map((nodeId) => renderReactNode(next, next.nodes[nodeId]))
      .join('\n')

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
    const code = renderReactNode(next, next.nodes[containerNode.id])

    expect(code).toContain('absolute left-[320px] top-[72px] w-[280px] h-[180px]')
    expect(code).toContain(
      'rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3 p-4',
    )
    expect(code).toContain('立即开始')
    expect(code.indexOf('className="rounded-2xl')).toBeLessThan(
      code.indexOf('立即开始'),
    )
  })

  it('exports frame children as a semantic auto layout wrapper', () => {
    const document = createEmptyDocument('Frame React Test')
    const frameNode = createFrameNode()
    const buttonNode = createButtonNode('确认')
    const withFrame = insertChildNode(document, document.rootNodeId, frameNode)
    const next = insertChildNode(withFrame, frameNode.id, buttonNode)
    const code = renderReactNode(next, next.nodes[frameNode.id])

    expect(code).toContain(
      'aria-label="Frame 节点" className="absolute left-[120px] top-[120px] w-[320px] h-[240px]',
    )
    expect(code).toContain(
      'rounded-3xl bg-white border border-stone-300 flex flex-col gap-4 p-6 items-stretch',
    )
    expect(code).toContain('确认')
    expect(code.indexOf('Frame 节点')).toBeLessThan(code.indexOf('确认'))
  })

  it('exports custom frame spacing as explicit Tailwind arbitrary values', () => {
    const document = createEmptyDocument('Frame Custom Spacing Test')
    const frameNode = createFrameNode({
      gap: 20,
      padding: { top: 20, right: 28, bottom: 36, left: 44 },
    })
    const next = insertChildNode(document, document.rootNodeId, frameNode)
    const code = renderReactNode(next, next.nodes[frameNode.id])

    expect(code).toContain(
      'flex flex-col gap-[20px] pt-[20px] pr-[28px] pb-[36px] pl-[44px]',
    )
  })
})
