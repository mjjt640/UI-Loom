# UI Loom

UI Loom is a browser-based design-to-code editor built with React, TypeScript,
Zustand, Tailwind CSS, Vitest, and Playwright. The editor keeps a normalized
design tree as the source of truth, mutates it through domain commands, renders
it on an interactive canvas, and exports deterministic code bundles.

## Current Capabilities

- Visual canvas with selection, drag placement, resize handles, layers, and
  inspector-driven edits.
- Design node primitives for text, buttons, images, containers, frames, groups,
  basic shapes, slices, icons, and higher-level component placeholders.
- Auto-layout frame and container editing with direction, gap, padding, align,
  and justify controls.
- Export targets for `HTML + CSS + JS`, single-file HTML, `Vue 3 SFC`, and
  `React + Tailwind`.
- Componentized React and Vue exports for semantic top-level frames and
  containers.
- File-tree code preview that displays the same generated bundle used by
  downloads.

## Project Structure

```text
src/domain/model       Design tree types, schema, and factories
src/domain/commands    Pure mutation commands for editor behavior
src/domain/exporter    Code generation targets and bundle creation
src/features/editor    Toolbar, canvas, layers, and inspector UI
src/features/preview   Export bundle preview UI
src/platform           Browser adapters such as download handling
tests/unit             Domain and exporter tests
tests/integration      React interaction tests
tests/e2e              Playwright browser flows
```

## Development

Install dependencies:

```bash
pnpm install
```

Run the dev server:

```bash
pnpm dev
```

Build for production:

```bash
pnpm build
```

Run verification:

```bash
pnpm test
pnpm lint
pnpm e2e
```

## Notes

- The app is currently a pure web implementation. Desktop packaging should use
  the existing platform adapter boundary instead of hard-coding filesystem
  behavior into editor UI.
- Generated exports should keep returning explicit `ExportBundle` objects.
- Unsupported design node types should fail explicitly in render and export
  paths rather than falling through hidden catch-all logic.
