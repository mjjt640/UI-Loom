import type { PageDocument } from '../model/types'
import type { ExportBundle } from './exportTypes'
import { mappingsForRootFile } from './codeMapping'
import { renderCss, renderHtmlBody } from './htmlRenderEngine'

function renderIndexHtml(document: PageDocument) {
  return [
    '<!doctype html>',
    '<html lang="zh-CN">',
    '  <head>',
    '    <meta charset="UTF-8" />',
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    `    <title>${document.name}</title>`,
    '    <link rel="stylesheet" href="./styles.css" />',
    '  </head>',
    '  <body>',
    '    <main class="ui-loom-page">',
    renderHtmlBody(document)
      .split('\n')
      .map((line) => `      ${line}`)
      .join('\n'),
    '    </main>',
    '    <script src="./script.js"></script>',
    '  </body>',
    '</html>',
  ].join('\n')
}

export function exportToHtmlCssJsBundle(document: PageDocument): ExportBundle {
  return {
    target: 'html-css-js',
    files: [
      {
        path: 'index.html',
        language: 'html',
        content: renderIndexHtml(document),
      },
      {
        path: 'styles.css',
        language: 'css',
        content: renderCss(document),
      },
      {
        path: 'script.js',
        language: 'js',
        content: [
          "const uiLoomRoot = document.querySelector('.ui-loom-page')",
          '',
          "if (!uiLoomRoot) {",
          "  throw new Error('UI Loom export root is missing')",
          '}',
        ].join('\n'),
      },
    ],
    mappings: mappingsForRootFile(document, 'index.html'),
  }
}
