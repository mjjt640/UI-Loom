import { describe, expect, it } from 'vitest'
import {
  createButtonNode,
  createRectNode,
  groupSelectedNodes,
  insertChildNode,
  selectNodes,
  ungroupSelectedNode,
} from '../../../src/domain/commands/editorCommands'
import { exportToReactTailwind } from '../../../src/domain/exporter/reactTailwindExporter'
import { createEmptyDocument } from '../../../src/domain/model/factories'

describe('group commands', () => {
  it('groups selected sibling nodes into a relative group', () => {
    const document = createEmptyDocument('Group Test')
    const rect = createRectNode()
    const button = createButtonNode('购买')
    const withRect = insertChildNode(document, document.rootNodeId, rect)
    const withButton = insertChildNode(withRect, withRect.rootNodeId, button)
    const selected = selectNodes(withButton, [rect.id, button.id])
    const grouped = groupSelectedNodes(selected)
    const [groupId] = grouped.selectedNodeIds
    const group = grouped.nodes[groupId]

    expect(group.type).toBe('group')
    expect(group.name).toBe('Group')
    expect(group.children).toEqual([rect.id, button.id])
    expect(grouped.nodes[grouped.rootNodeId].children).toEqual([groupId])
    expect(grouped.nodes[rect.id].parentId).toBe(groupId)
    expect(grouped.nodes[button.id].parentId).toBe(groupId)
    expect(grouped.nodes[button.id].layout.x).toBe(0)
    expect(grouped.nodes[button.id].layout.y).toBe(0)
    expect(grouped.nodes[rect.id].layout.x).toBe(56)
    expect(grouped.nodes[rect.id].layout.y).toBe(24)
  })

  it('ungroups the selected group back into its parent', () => {
    const document = createEmptyDocument('Ungroup Test')
    const rect = createRectNode()
    const button = createButtonNode('购买')
    const grouped = groupSelectedNodes(
      selectNodes(
        insertChildNode(
          insertChildNode(document, document.rootNodeId, rect),
          document.rootNodeId,
          button,
        ),
        [rect.id, button.id],
      ),
    )
    const ungrouped = ungroupSelectedNode(grouped)

    expect(ungrouped.nodes[grouped.selectedNodeIds[0]]).toBeUndefined()
    expect(ungrouped.nodes[ungrouped.rootNodeId].children).toEqual([
      rect.id,
      button.id,
    ])
    expect(ungrouped.nodes[button.id].parentId).toBe(ungrouped.rootNodeId)
    expect(ungrouped.nodes[button.id].layout.x).toBe(40)
    expect(ungrouped.nodes[rect.id].layout.x).toBe(96)
  })

  it('exports grouped children explicitly', () => {
    const document = createEmptyDocument('Grouped Export Test')
    const rect = createRectNode()
    const button = createButtonNode('购买')
    const withRect = insertChildNode(document, document.rootNodeId, rect)
    const withButton = insertChildNode(withRect, withRect.rootNodeId, button)
    const grouped = groupSelectedNodes(selectNodes(withButton, [rect.id, button.id]))

    expect(exportToReactTailwind(grouped)).toContain('购买')
    expect(exportToReactTailwind(grouped)).toContain('aria-label="图层组"')
  })
})
