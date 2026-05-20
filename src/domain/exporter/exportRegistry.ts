import type { ExportTargetDefinition } from './exportTypes'

export const exportTargets: ExportTargetDefinition[] = [
  {
    id: 'html-css-js',
    label: 'HTML + CSS + JS',
    description: '生成 index.html、styles.css、script.js 三个文件',
  },
  {
    id: 'single-file-html',
    label: '单文件 HTML',
    description: '生成可直接打开的 index.html',
  },
  {
    id: 'vue3-sfc',
    label: 'Vue 3 SFC',
    description: '生成 GeneratedPage.vue 单文件组件',
  },
  {
    id: 'react-tailwind',
    label: 'React + Tailwind',
    description: '生成 React 组件和 Tailwind 使用说明',
  },
]
