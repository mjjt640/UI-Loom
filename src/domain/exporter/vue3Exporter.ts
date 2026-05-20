import type { PageDocument } from '../model/types'
import type { ExportBundle } from './exportTypes'
import { exportToVueComponentBundle } from './vueComponentBundleExporter'

export function exportToVue3Bundle(document: PageDocument): ExportBundle {
  return exportToVueComponentBundle(document)
}
