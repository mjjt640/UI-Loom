import { pageDocumentSchema } from '../model/schema'
import type { PageDocument } from '../model/types'

const STORAGE_KEY = 'ui-loom.document'

export function saveDocument(document: PageDocument) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(document))
}

export function loadDocument(): PageDocument | null {
  const raw = localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return null
  }

  const result = pageDocumentSchema.safeParse(JSON.parse(raw))
  return result.success ? result.data : null
}
