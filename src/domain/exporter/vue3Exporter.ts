import type { PageDocument } from '../model/types'
import type { ExportBundle } from './exportTypes'
import { renderCss, renderHtmlBody } from './htmlRenderEngine'

export function exportToVue3Bundle(document: PageDocument): ExportBundle {
  return {
    target: 'vue3-sfc',
    files: [
      {
        path: 'GeneratedPage.vue',
        language: 'vue',
        content: [
          '<template>',
          '  <main class="ui-loom-page">',
          renderHtmlBody(document)
            .split('\n')
            .map((line) => `    ${line}`)
            .join('\n'),
          '  </main>',
          '</template>',
          '',
          '<script setup lang="ts">',
          `const pageName = '${document.name.replaceAll("'", "\\'")}'`,
          '</script>',
          '',
          '<style scoped>',
          renderCss(document),
          '</style>',
        ].join('\n'),
      },
    ],
  }
}
