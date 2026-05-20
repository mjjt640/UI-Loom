import { describe, expect, it } from 'vitest'
import { pageDocumentSchema } from '../../../src/domain/model/schema'
import { createEmptyDocument } from '../../../src/domain/model/factories'

describe('pageDocumentSchema', () => {
  it('accepts a valid empty document', () => {
    const document = createEmptyDocument('Demo Page')
    const result = pageDocumentSchema.safeParse(document)
    expect(result.success).toBe(true)
  })
})
