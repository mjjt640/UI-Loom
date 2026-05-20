import { describe, expect, it } from 'vitest'
import { createEmptyDocument } from '../../../src/domain/model/factories'
import {
  loadDocument,
  saveDocument,
} from '../../../src/domain/persistence/documentStorage'

describe('documentStorage', () => {
  it('round-trips a document', () => {
    const document = createEmptyDocument('保存测试')
    saveDocument(document)
    const restored = loadDocument()
    expect(restored?.name).toBe('保存测试')
  })
})
