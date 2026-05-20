import { pageDocumentSchema } from '../model/schema'
import type { PageDocument } from '../model/types'
import { browserStorageAdapter } from '../../platform/storage/browserStorageAdapter'

const STORAGE_KEY = 'ui-loom.document'
const storage = browserStorageAdapter

export function saveDocument(document: PageDocument) {
  storage.setItem(STORAGE_KEY, JSON.stringify(document))
}

export function loadDocument(): PageDocument | null {
  const raw = storage.getItem(STORAGE_KEY)

  if (!raw) {
    return null
  }

  const result = pageDocumentSchema.safeParse(JSON.parse(raw))
  return result.success ? result.data : null
}
