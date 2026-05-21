# Design-to-Code Studio v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade UI Loom from a small MVP editor into a design-to-code studio with advanced graphic editing primitives and selectable export targets for HTML/CSS/JS, single-file HTML, Vue 3, and React + Tailwind.

**Architecture:** The editor uses a design-tree model as the source of truth, command functions as the only mutation path, and a codegen pipeline that converts the design tree into an export bundle of generated files. Canvas tools create and edit design nodes; exporters consume a normalized design tree and return deterministic file bundles.

**Tech Stack:** React 19, TypeScript, Zustand, Tailwind CSS, Vitest, Testing Library, Playwright.

---

## Non-Negotiables

- Do not introduce permanent fallback or catch-all code paths.
- Temporary legacy compatibility is allowed only when the same plan section removes or isolates it.
- Exporters must return explicit `ExportBundle` objects, not ad-hoc strings.
- Each behavior change starts with a failing test.
- Each task ends with `pnpm test` for the touched area, and each milestone ends with `pnpm test`, `pnpm build`, and `pnpm e2e`.

## Target File Structure

- Create: `src/domain/exporter/exportTypes.ts`
- Create: `src/domain/exporter/htmlCssJsExporter.ts`
- Create: `src/domain/exporter/singleFileHtmlExporter.ts`
- Create: `src/domain/exporter/vue3Exporter.ts`
- Create: `src/domain/exporter/reactTailwindBundleExporter.ts`
- Create: `src/domain/exporter/exportRegistry.ts`
- Modify: `src/domain/exporter/reactTailwindExporter.ts`
- Modify: `src/features/preview/CodePreviewPanel.tsx`
- Modify: `src/features/editor/toolbar/Toolbar.tsx`
- Create: `src/platform/file-system/browserDownloadAdapter.ts`
- Modify: `src/domain/model/types.ts`
- Modify: `src/domain/model/schema.ts`
- Modify: `src/domain/commands/editorCommands.ts`
- Modify: `src/store/editorStore.ts`
- Modify: `src/features/editor/canvas/CanvasNode.tsx`
- Modify: `src/features/editor/inspector/InspectorPanel.tsx`
- Modify: `tests/unit/domain/react-tailwind-exporter.test.ts`
- Create: `tests/unit/domain/export-bundle.test.ts`
- Create: `tests/integration/export-target-flow.test.tsx`
- Create: `tests/integration/graphic-editing-flow.test.tsx`

## Milestone 1: Export Bundle Architecture

### Task 1: Define export targets and bundle types

**Files:**
- Create: `src/domain/exporter/exportTypes.ts`
- Create: `tests/unit/domain/export-bundle.test.ts`

- [x] **Step 1: Write failing tests for export target metadata**

Add `tests/unit/domain/export-bundle.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { exportTargets } from '../../../src/domain/exporter/exportRegistry'

describe('exportTargets', () => {
  it('lists selectable code export targets', () => {
    expect(exportTargets.map((target) => target.id)).toEqual([
      'html-css-js',
      'single-file-html',
      'vue3-sfc',
      'react-tailwind',
    ])
  })
})
```

- [x] **Step 2: Verify RED**

Run: `pnpm vitest run tests/unit/domain/export-bundle.test.ts`

Expected: FAIL because `exportRegistry` does not exist.

- [x] **Step 3: Add export bundle types**

Create `src/domain/exporter/exportTypes.ts`:

```ts
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

export interface ExportBundle {
  target: ExportTargetId
  files: GeneratedFile[]
}

export interface ExportTargetDefinition {
  id: ExportTargetId
  label: string
  description: string
}
```

- [x] **Step 4: Add registry metadata**

Create `src/domain/exporter/exportRegistry.ts`:

```ts
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
```

- [x] **Step 5: Verify GREEN**

Run: `pnpm vitest run tests/unit/domain/export-bundle.test.ts`

Expected: PASS.

### Task 2: Convert React exporter into bundle exporter

**Files:**
- Modify: `src/domain/exporter/reactTailwindExporter.ts`
- Create: `src/domain/exporter/reactTailwindBundleExporter.ts`
- Modify: `tests/unit/domain/react-tailwind-exporter.test.ts`
- Modify: `tests/unit/domain/export-bundle.test.ts`

- [x] **Step 1: Add failing bundle test**

Append to `tests/unit/domain/export-bundle.test.ts`:

```ts
import { createButtonNode, insertChildNode } from '../../../src/domain/commands/editorCommands'
import { exportToReactTailwindBundle } from '../../../src/domain/exporter/reactTailwindBundleExporter'
import { createEmptyDocument } from '../../../src/domain/model/factories'

it('exports React Tailwind as a generated file bundle', () => {
  const document = createEmptyDocument('Bundle Test')
  const next = insertChildNode(document, document.rootNodeId, createButtonNode('购买'))
  const bundle = exportToReactTailwindBundle(next)

  expect(bundle.target).toBe('react-tailwind')
  expect(bundle.files.map((file) => file.path)).toEqual([
    'src/GeneratedPage.tsx',
    'README.md',
  ])
  expect(bundle.files[0].content).toContain('export function GeneratedPage()')
  expect(bundle.files[0].content).toContain('购买')
})
```

- [x] **Step 2: Verify RED**

Run: `pnpm vitest run tests/unit/domain/export-bundle.test.ts`

Expected: FAIL because `reactTailwindBundleExporter` does not exist.

- [x] **Step 3: Implement bundle exporter**

Create `src/domain/exporter/reactTailwindBundleExporter.ts`:

```ts
import type { PageDocument } from '../model/types'
import { exportToReactTailwind } from './reactTailwindExporter'
import type { ExportBundle } from './exportTypes'

export function exportToReactTailwindBundle(document: PageDocument): ExportBundle {
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
          'Copy `src/GeneratedPage.tsx` into a React + Tailwind project.',
        ].join('\n'),
      },
    ],
  }
}
```

- [x] **Step 4: Verify GREEN**

Run: `pnpm vitest run tests/unit/domain/export-bundle.test.ts tests/unit/domain/react-tailwind-exporter.test.ts`

Expected: PASS.

### Task 3: Add HTML/CSS/JS, single-file HTML, and Vue 3 exporters

**Files:**
- Create: `src/domain/exporter/htmlCssJsExporter.ts`
- Create: `src/domain/exporter/singleFileHtmlExporter.ts`
- Create: `src/domain/exporter/vue3Exporter.ts`
- Modify: `tests/unit/domain/export-bundle.test.ts`

- [x] **Step 1: Add failing exporter tests**

Append to `tests/unit/domain/export-bundle.test.ts`:

```ts
import { exportToHtmlCssJsBundle } from '../../../src/domain/exporter/htmlCssJsExporter'
import { exportToSingleFileHtmlBundle } from '../../../src/domain/exporter/singleFileHtmlExporter'
import { exportToVue3Bundle } from '../../../src/domain/exporter/vue3Exporter'

it('exports HTML CSS JS as three files', () => {
  const document = createEmptyDocument('HTML Test')
  const next = insertChildNode(document, document.rootNodeId, createButtonNode('开始'))
  const bundle = exportToHtmlCssJsBundle(next)

  expect(bundle.target).toBe('html-css-js')
  expect(bundle.files.map((file) => file.path)).toEqual([
    'index.html',
    'styles.css',
    'script.js',
  ])
  expect(bundle.files[0].content).toContain('styles.css')
  expect(bundle.files[0].content).toContain('script.js')
  expect(bundle.files[1].content).toContain('.ui-loom-page')
  expect(bundle.files[0].content).toContain('开始')
})

it('exports a standalone HTML file', () => {
  const document = createEmptyDocument('Single HTML Test')
  const next = insertChildNode(document, document.rootNodeId, createButtonNode('提交'))
  const bundle = exportToSingleFileHtmlBundle(next)

  expect(bundle.target).toBe('single-file-html')
  expect(bundle.files.map((file) => file.path)).toEqual(['index.html'])
  expect(bundle.files[0].content).toContain('<style>')
  expect(bundle.files[0].content).toContain('提交')
})

it('exports Vue 3 as a single file component', () => {
  const document = createEmptyDocument('Vue Test')
  const next = insertChildNode(document, document.rootNodeId, createButtonNode('保存'))
  const bundle = exportToVue3Bundle(next)

  expect(bundle.target).toBe('vue3-sfc')
  expect(bundle.files.map((file) => file.path)).toEqual(['GeneratedPage.vue'])
  expect(bundle.files[0].content).toContain('<template>')
  expect(bundle.files[0].content).toContain('<script setup')
  expect(bundle.files[0].content).toContain('保存')
})
```

- [x] **Step 2: Verify RED**

Run: `pnpm vitest run tests/unit/domain/export-bundle.test.ts`

Expected: FAIL because exporters do not exist.

- [x] **Step 3: Implement explicit exporters**

Create each exporter with direct mappings for `text`, `button`, `image`, and `container`. Unknown node types must be ignored only if they are not renderable design nodes yet; do not add a catch-all renderer.

- [x] **Step 4: Verify GREEN**

Run: `pnpm vitest run tests/unit/domain/export-bundle.test.ts`

Expected: PASS.

## Milestone 2: Export Target UI

### Task 4: Let users choose export target

**Files:**
- Modify: `src/features/editor/toolbar/Toolbar.tsx`
- Modify: `src/features/preview/CodePreviewPanel.tsx`
- Create: `tests/integration/export-target-flow.test.tsx`

- [x] **Step 1: Add failing interaction test**

Create `tests/integration/export-target-flow.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEmptyDocument } from '../../src/domain/model/factories'
import { EditorScreen } from '../../src/features/editor/EditorScreen'
import { useEditorStore } from '../../src/store/editorStore'

describe('export target flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    useEditorStore.setState({ document: createEmptyDocument('Export Target Test') })
  })

  it('exports the selected Vue 3 target as a vue file', async () => {
    const user = userEvent.setup()
    let exportedBlob: Blob | undefined
    let downloadedFilename = ''
    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
      exportedBlob = blob
      return 'blob:vue-export'
    })
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
      downloadedFilename = this.download
    })

    render(<EditorScreen />)
    await user.click(screen.getByText('新增按钮'))
    await user.selectOptions(screen.getByLabelText('导出格式'), 'vue3-sfc')
    await user.click(screen.getByText('导出代码'))

    expect(downloadedFilename).toBe('GeneratedPage.vue')
    if (!(exportedBlob instanceof Blob)) {
      throw new Error('Expected Vue export to create a Blob')
    }
    await expect(exportedBlob.text()).resolves.toContain('<template>')
    await expect(exportedBlob.text()).resolves.toContain('按钮')
  })
})
```

- [x] **Step 2: Verify RED**

Run: `pnpm vitest run tests/integration/export-target-flow.test.tsx`

Expected: FAIL because export format selector does not exist.

- [x] **Step 3: Implement target selector**

Update toolbar to include a `select` with label `导出格式`, options from `exportTargets`, and a `导出代码` button. The button should export the selected bundle and directly download every generated code file in that bundle. Do not use clipboard export or JSON manifest export for multi-file targets.

- [x] **Step 4: Verify GREEN**

Run: `pnpm vitest run tests/integration/export-target-flow.test.tsx`

Expected: PASS.

## Milestone 3: Advanced Graphic Editing Core

### Task 5: Add design node primitives

**Files:**
- Modify: `src/domain/model/types.ts`
- Modify: `src/domain/model/schema.ts`
- Modify: `src/domain/commands/editorCommands.ts`
- Modify: `src/store/editorStore.ts`
- Create: `tests/integration/graphic-editing-flow.test.tsx`

- [x] **Step 1: Add failing test for rectangle creation**

Create `tests/integration/graphic-editing-flow.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { createEmptyDocument } from '../../src/domain/model/factories'
import { EditorScreen } from '../../src/features/editor/EditorScreen'
import { useEditorStore } from '../../src/store/editorStore'

describe('graphic editing flow', () => {
  beforeEach(() => {
    localStorage.clear()
    useEditorStore.setState({ document: createEmptyDocument('Graphic Test') })
  })

  it('creates a rectangle layer from the toolbar', async () => {
    const user = userEvent.setup()
    render(<EditorScreen />)

    await user.click(screen.getByText('矩形'))

    expect(screen.getByLabelText('矩形图层')).toBeInTheDocument()
    expect(screen.getByText('Rectangle')).toBeInTheDocument()
  })
})
```

- [x] **Step 2: Verify RED**

Run: `pnpm vitest run tests/integration/graphic-editing-flow.test.tsx`

Expected: FAIL because rectangle tool does not exist.

- [x] **Step 3: Add explicit primitive type**

Extend `NodeType` with `rect` and `group`. Add `createRectNode()` and `addRectNode()` without changing existing node behavior.

- [x] **Step 4: Render rect node**

Render `rect` in `CanvasNode` with `aria-label="矩形图层"`.

- [x] **Step 5: Verify GREEN**

Run: `pnpm vitest run tests/integration/graphic-editing-flow.test.tsx`

Expected: PASS.

### Task 6: Add resize handles for absolute graphic layers

**Files:**
- Modify: `src/features/editor/canvas/CanvasNode.tsx`
- Modify: `tests/integration/graphic-editing-flow.test.tsx`

- [x] **Step 1: Add failing resize test**

Append:

```tsx
it('resizes a selected rectangle from the bottom-right handle', async () => {
  const user = userEvent.setup()
  render(<EditorScreen />)

  await user.click(screen.getByText('矩形'))
  const rect = screen.getByLabelText('矩形图层')
  await user.click(rect)
  const handle = screen.getByLabelText('调整右下尺寸')
  await user.pointer([
    { keys: '[MouseLeft>]', target: handle, coords: { x: 160, y: 120 } },
    { coords: { x: 220, y: 170 } },
    { keys: '[/MouseLeft]' },
  ])

  expect(rect).toHaveStyle({
    width: '220px',
    height: '170px',
  })
})
```

- [x] **Step 2: Verify RED**

Run: `pnpm vitest run tests/integration/graphic-editing-flow.test.tsx`

Expected: FAIL because resize handle does not exist.

- [x] **Step 3: Implement resize handle**

Only selected absolute nodes with numeric width and height show the bottom-right handle. Pointer drag updates width and height through `updateSelectedNodeLayout`.

- [x] **Step 4: Verify GREEN**

Run: `pnpm vitest run tests/integration/graphic-editing-flow.test.tsx`

Expected: PASS.

## Final Verification

- [x] Run `pnpm test`
- [x] Run `pnpm build`
- [x] Run `pnpm e2e`
- [x] Confirm `git status --short` contains only intended files
- [x] Commit in logical chunks:
  - `feat: add export bundle targets`
  - `feat: add selectable code export flow`
  - `feat: add graphic rectangle editing`
  - `feat: add canvas resize handles`
