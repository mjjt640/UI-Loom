import type { PageDocument } from '../model/types'
import { exportToHtmlCssJsBundle } from './htmlCssJsExporter'
import { exportToReactTailwindBundle } from './reactTailwindBundleExporter'
import { exportToSingleFileHtmlBundle } from './singleFileHtmlExporter'
import type { ExportBundle, ExportTargetId } from './exportTypes'
import { exportToVue3Bundle } from './vue3Exporter'

function assertNeverTarget(target: never): never {
  throw new Error(`Unsupported export target: ${target}`)
}

export function createExportBundle(
  document: PageDocument,
  target: ExportTargetId,
): ExportBundle {
  if (target === 'html-css-js') {
    return exportToHtmlCssJsBundle(document)
  }

  if (target === 'single-file-html') {
    return exportToSingleFileHtmlBundle(document)
  }

  if (target === 'vue3-sfc') {
    return exportToVue3Bundle(document)
  }

  if (target === 'react-tailwind') {
    return exportToReactTailwindBundle(document)
  }

  return assertNeverTarget(target)
}
