import { describe, expect, it } from 'vitest'
import { createEmptyDocument } from '../../../src/domain/model/factories'
import {
  createTextNode,
  insertChildNode,
} from '../../../src/domain/commands/editorCommands'

describe('editor commands', () => {
  it('inserts a child node under the root', () => {
    const document = createEmptyDocument('Demo')
    const textNode = createTextNode('标题')
    const next = insertChildNode(document, document.rootNodeId, textNode)

    expect(next.nodes[document.rootNodeId].children).toContain(textNode.id)
    expect(next.nodes[textNode.id].content.text).toBe('标题')
  })
})
