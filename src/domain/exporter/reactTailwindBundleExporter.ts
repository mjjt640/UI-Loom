import type { PageDocument } from '../model/types'
import type { ExportBundle } from './exportTypes'
import { exportToReactTailwind } from './reactTailwindExporter'

export function exportToReactTailwindBundle(
  document: PageDocument,
): ExportBundle {
  return {
    target: 'react-tailwind',
    files: [
      {
        path: 'src/GeneratedPage.tsx',
        language: 'tsx',
        content: exportToReactTailwind(document),
      },
      {
        path: 'README.md',
        language: 'md',
        content: [
          '# UI Loom React Export',
          '',
          '把 `src/GeneratedPage.tsx` 放入 React + Tailwind 项目中使用。',
        ].join('\n'),
      },
    ],
  }
}
