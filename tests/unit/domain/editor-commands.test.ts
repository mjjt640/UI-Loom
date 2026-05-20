import { describe, expect, it } from 'vitest'
import { createEmptyDocument } from '../../../src/domain/model/factories'
import {
  createButtonNode,
  createContainerNode,
  createImageNode,
  createTextNode,
  insertChildNode,
  removeNode,
} from '../../../src/domain/commands/editorCommands'

describe('editor commands', () => {
  it('inserts a child node under the root', () => {
    const document = createEmptyDocument('Demo')
    const textNode = createTextNode('标题')
    const next = insertChildNode(document, document.rootNodeId, textNode)

    expect(next.nodes[document.rootNodeId].children).toContain(textNode.id)
    expect(next.nodes[textNode.id].content.text).toBe('标题')
  })

  it('creates basic node types with useful defaults', () => {
    expect(createButtonNode('提交').type).toBe('button')
    expect(createButtonNode('提交').content.text).toBe('提交')
    expect(createImageNode().type).toBe('image')
    expect(createImageNode().content.alt).toBe('图片描述')
    expect(createContainerNode().type).toBe('container')
    expect(createContainerNode().layout.mode).toBe('flex-column')
  })

  it('removes a node from the document tree', () => {
    const document = createEmptyDocument('Demo')
    const textNode = createTextNode('标题')
    const withText = insertChildNode(document, document.rootNodeId, textNode)
    const next = removeNode(withText, textNode.id)

    expect(next.nodes[textNode.id]).toBeUndefined()
    expect(next.nodes[document.rootNodeId].children).not.toContain(textNode.id)
  })
})
