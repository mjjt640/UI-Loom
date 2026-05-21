export type ExportTargetId =
  | 'html-css-js'
  | 'single-file-html'
  | 'vue3-sfc'
  | 'react-tailwind'

export type GeneratedFileLanguage =
  | 'html'
  | 'css'
  | 'js'
  | 'ts'
  | 'tsx'
  | 'vue'
  | 'md'

export interface GeneratedFile {
  path: string
  language: GeneratedFileLanguage
  content: string
}

export interface ExportCodeMapping {
  filePath: string
  nodeId: string
  token: string
}

export interface ExportBundle {
  target: ExportTargetId
  files: GeneratedFile[]
  mappings: ExportCodeMapping[]
}

export interface ExportTargetDefinition {
  id: ExportTargetId
  label: string
  description: string
}
