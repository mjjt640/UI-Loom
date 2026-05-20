import { describe, expect, it } from 'vitest'
import {
  createButtonNode,
  createRectNode,
  insertChildNode,
  moveNodeBackward,
  moveNodeForward,
  setNodeLocked,
  setNodeVisible,
} from '../../../src/domain/commands/editorCommands'
import { exportToReactTailwindBundle } from '../../../src/domain/exporter/reactTailwindBundleExporter'
import { createEmptyDocument } from '../../../src/domain/model/factories'

describe('layer commands', () => {
  it('moves a layer forward and backward within the parent children order', () => {
    const document = createEmptyDocument('Layer Order Test')
    const rect = createRectNode()
    const button = createButtonNode('购买')
    const withRect = insertChildNode(document, document.rootNodeId, rect)
    const withButton = insertChildNode(withRect, withRect.rootNodeId, button)

    const movedForward = moveNodeForward(withButton, rect.id)
    expect(movedForward.nodes[movedForward.rootNodeId].children).toEqual([
      button.id,
      rect.id,
    ])

    const movedBackward = moveNodeBackward(movedForward, rect.id)
    expect(movedBackward.nodes[movedBackward.rootNodeId].children).toEqual([
      rect.id,
      button.id,
    ])
  })

  it('stores layer visibility and excludes hidden nodes from export', () => {
    const document = createEmptyDocument('Layer Visibility Test')
    const button = createButtonNode('隐藏按钮')
    const withButton = insertChildNode(document, document.rootNodeId, button)
    const hidden = setNodeVisible(withButton, button.id, false)
    const bundle = exportToReactTailwindBundle(hidden)
    const code = bundle.files.map((file) => file.content).join('\n')

    expect(hidden.nodes[button.id].meta.visible).toBe(false)
    expect(code).not.toContain('隐藏按钮')
  })

  it('stores layer locked state and clears selection when the selected layer is locked', () => {
    const document = createEmptyDocument('Layer Lock Test')
    const rect = createRectNode()
    const withRect = insertChildNode(document, document.rootNodeId, rect)
    const selected = {
      ...withRect,
      selectedNodeIds: [rect.id],
    }
    const locked = setNodeLocked(selected, rect.id, true)

    expect(locked.nodes[rect.id].meta.locked).toBe(true)
    expect(locked.selectedNodeIds).toEqual([])
  })
})
