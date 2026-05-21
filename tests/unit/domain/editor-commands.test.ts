import { describe, expect, it } from 'vitest'
import { createEmptyDocument } from '../../../src/domain/model/factories'
import {
  insertChildNode,
  moveNode,
  removeNode,
  updateNodeLayout,
} from '../../../src/domain/commands/editorCommands'
import {
  testButtonNode,
  testContainerNode,
  testImageNode,
  testTextNode,
} from './nodeTestFactories'

describe('editor commands', () => {
  it('inserts a child node under the root', () => {
    const document = createEmptyDocument('Demo')
    const textNode = testTextNode('标题')
    const next = insertChildNode(document, document.rootNodeId, textNode)

    expect(next.nodes[document.rootNodeId].children).toContain(textNode.id)
    expect(next.nodes[textNode.id].content.text).toBe('标题')
  })

  it('creates basic node types with useful defaults', () => {
    expect(testButtonNode('提交').type).toBe('button')
    expect(testButtonNode('提交').content.text).toBe('提交')
    expect(testImageNode().type).toBe('image')
    expect(testImageNode().content.alt).toBe('图片描述')
    expect(testContainerNode().type).toBe('container')
    expect(testContainerNode().layout.mode).toBe('flex-column')
  })

  it('removes a node from the document tree', () => {
    const document = createEmptyDocument('Demo')
    const textNode = testTextNode('标题')
    const withText = insertChildNode(document, document.rootNodeId, textNode)
    const next = removeNode(withText, textNode.id)

    expect(next.nodes[textNode.id]).toBeUndefined()
    expect(next.nodes[document.rootNodeId].children).not.toContain(textNode.id)
  })

  it('updates node layout without mutating the original document', () => {
    const document = createEmptyDocument('Demo')
    const textNode = testTextNode('标题')
    const withText = insertChildNode(document, document.rootNodeId, textNode)
    const next = updateNodeLayout(withText, textNode.id, {
      x: 64,
      y: 96,
      width: 240,
    })

    expect(next.nodes[textNode.id].layout.x).toBe(64)
    expect(next.nodes[textNode.id].layout.y).toBe(96)
    expect(next.nodes[textNode.id].layout.width).toBe(240)
    expect(withText.nodes[textNode.id].layout.x).toBe(0)
  })

  it('moves a node into a container', () => {
    const document = createEmptyDocument('Demo')
    const buttonNode = testButtonNode('提交')
    const containerNode = testContainerNode()
    const withButton = insertChildNode(document, document.rootNodeId, buttonNode)
    const withContainer = insertChildNode(
      withButton,
      withButton.rootNodeId,
      containerNode,
    )
    const next = moveNode(withContainer, buttonNode.id, containerNode.id)

    expect(next.nodes[buttonNode.id].parentId).toBe(containerNode.id)
    expect(next.nodes[containerNode.id].children).toContain(buttonNode.id)
    expect(next.nodes[document.rootNodeId].children).not.toContain(buttonNode.id)
  })
})
