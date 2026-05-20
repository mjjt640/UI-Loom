import type { PageDocument } from '../model/types'
import type { ExportBundle } from './exportTypes'
import { exportToReactComponentBundle } from './reactComponentBundleExporter'

export function exportToReactTailwindBundle(
  document: PageDocument,
): ExportBundle {
  return exportToReactComponentBundle(document)
}
