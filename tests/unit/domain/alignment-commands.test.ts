import { describe, expect, it } from 'vitest'
import {
  alignNodesLeft,
  distributeNodesHorizontally,
  insertChildNode,
  selectNodes,
} from '../../../src/domain/commands/editorCommands'
import { createEmptyDocument } from '../../../src/domain/model/factories'
import { testButtonNode, testRectNode } from './nodeTestFactories'

describe('alignment commands', () => {
  it('aligns selected nodes to the left edge of the selection bounds', () => {
    const document = createEmptyDocument('Align Test')
    const rect = testRectNode()
    const button = testButtonNode('购买')
    const withRect = insertChildNode(document, document.rootNodeId, rect)
    const withButton = insertChildNode(withRect, withRect.rootNodeId, button)
    const selected = selectNodes(withButton, [rect.id, button.id])
    const aligned = alignNodesLeft(selected)

    expect(aligned.nodes[rect.id].layout.x).toBe(40)
    expect(aligned.nodes[button.id].layout.x).toBe(40)
  })

  it('distributes selected nodes horizontally in selection order', () => {
    const document = createEmptyDocument('Distribute Test')
    const left = testRectNode()
    const middle = testRectNode()
    const right = testRectNode()
    const withLeft = insertChildNode(document, document.rootNodeId, {
      ...left,
      layout: { ...left.layout, x: 0, width: 100 },
    })
    const withMiddle = insertChildNode(withLeft, withLeft.rootNodeId, {
      ...middle,
      layout: { ...middle.layout, x: 20, width: 100 },
    })
    const withRight = insertChildNode(withMiddle, withMiddle.rootNodeId, {
      ...right,
      layout: { ...right.layout, x: 400, width: 100 },
    })
    const selected = selectNodes(withRight, [middle.id, left.id, right.id])
    const distributed = distributeNodesHorizontally(selected)

    expect(distributed.nodes[middle.id].layout.x).toBe(0)
    expect(distributed.nodes[left.id].layout.x).toBe(200)
    expect(distributed.nodes[right.id].layout.x).toBe(400)
  })
})
