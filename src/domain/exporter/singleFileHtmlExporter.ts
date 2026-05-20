import type { PageDocument } from '../model/types'
import type { ExportBundle } from './exportTypes'
import { renderCss, renderHtmlBody } from './htmlRenderEngine'

export function exportToSingleFileHtmlBundle(
  document: PageDocument,
): ExportBundle {
  return {
    target: 'single-file-html',
    files: [
      {
        path: 'index.html',
        language: 'html',
        content: [
          '<!doctype html>',
          '<html lang="zh-CN">',
          '  <head>',
          '    <meta charset="UTF-8" />',
          '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
          `    <title>${document.name}</title>`,
          '    <style>',
          renderCss(document)
            .split('\n')
            .map((line) => `      ${line}`)
            .join('\n'),
          '    </style>',
          '  </head>',
          '  <body>',
          '    <main class="ui-loom-page">',
          renderHtmlBody(document)
            .split('\n')
            .map((line) => `      ${line}`)
            .join('\n'),
          '    </main>',
          '  </body>',
          '</html>',
        ].join('\n'),
      },
    ],
  }
}
