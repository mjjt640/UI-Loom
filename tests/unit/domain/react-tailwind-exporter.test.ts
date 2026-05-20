import { describe, expect, it } from 'vitest'
import { createTextNode, insertChildNode } from '../../../src/domain/commands/editorCommands'
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
})
