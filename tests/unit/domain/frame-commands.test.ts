import { describe, expect, it } from 'vitest'
import {
  createButtonNode,
  createFrameNode,
  createRectNode,
  frameSelectedNodes,
  insertChildNode,
  selectNodes,
} from '../../../src/domain/commands/editorCommands'
import { createEmptyDocument } from '../../../src/domain/model/factories'

describe('frame commands', () => {
  it('creates a frame node with auto layout defaults', () => {
    const frame = createFrameNode()

    expect(frame.type).toBe('frame')
    expect(frame.name).toBe('Frame')
    expect(frame.layout).toMatchObject({
      mode: 'flex-column',
      x: 120,
      y: 120,
      width: 320,
      height: 240,
      gap: 16,
      padding: { top: 24, right: 24, bottom: 24, left: 24 },
      align: 'stretch',
      justify: 'start',
    })
  })

  it('wraps selected sibling layers into a frame', () => {
    const document = createEmptyDocument('Frame Test')
    const withRect = insertChildNode(
      document,
      document.rootNodeId,
      createRectNode(),
    )
    const withButton = insertChildNode(
      withRect,
      withRect.rootNodeId,
      createButtonNode('确认'),
    )
    const [rectId, buttonId] = withButton.nodes[withButton.rootNodeId].children
    const selected = selectNodes(withButton, [rectId, buttonId])

    const next = frameSelectedNodes(selected)
    const [frameId] = next.nodes[next.rootNodeId].children
    const frame = next.nodes[frameId]

    expect(frame.type).toBe('frame')
    expect(frame.children).toEqual([rectId, buttonId])
    expect(next.selectedNodeIds).toEqual([frameId])
    expect(next.nodes[rectId]).toMatchObject({
      parentId: frameId,
      layout: { x: 56, y: 24 },
    })
    expect(next.nodes[buttonId]).toMatchObject({
      parentId: frameId,
      layout: { x: 0, y: 0 },
    })
  })
})
