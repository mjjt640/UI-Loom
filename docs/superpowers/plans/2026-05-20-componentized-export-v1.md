# Componentized Export v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Export semantic design frames as maintainable React and Vue component file trees instead of one monolithic page file.

**Architecture:** The design tree remains the source of truth. Frame/container nodes use existing `meta.componentHint` and `name` to derive component boundaries; bundle exporters produce a page file plus child component files. The preview panel consumes `createExportBundle()` so the UI shows the actual files that will download, not a separate preview-only path.

**Tech Stack:** React 19, TypeScript, Zustand, Tailwind CSS, Vitest, Testing Library, Playwright.

---

## Non-Negotiables

- No duplicate old/new export implementations for the same target; React/Vue bundle exporters should call the componentized path directly.
- No clipboard export or JSON manifest export.
- Unsupported node types must continue to throw explicit errors in render/export paths.
- Every behavior change starts with a failing test.
- Keep HTML/CSS/JS and single-file HTML export behavior stable unless a test proves a required change.

## Target File Structure

- Create: `src/domain/exporter/componentNaming.ts`
- Create: `src/domain/exporter/reactComponentBundleExporter.ts`
- Create: `src/domain/exporter/vueComponentBundleExporter.ts`
- Modify: `src/domain/exporter/reactTailwindBundleExporter.ts`
- Modify: `src/domain/exporter/vue3Exporter.ts`
- Modify: `src/domain/exporter/exportRegistry.ts`
- Modify: `src/features/preview/CodePreviewPanel.tsx`
- Modify: `tests/unit/domain/export-bundle.test.ts`
- Create: `tests/unit/domain/componentized-export.test.ts`
- Modify: `tests/integration/export-target-flow.test.tsx`
- Create: `tests/integration/export-preview-file-tree.test.tsx`

## Task 1: Component Naming And Boundaries

- [x] Add failing unit tests in `tests/unit/domain/componentized-export.test.ts` that create a `frame` with `meta.componentHint: 'hero-section'` and assert generated component names are `HeroSection`, file stems are `HeroSection`, and duplicate hints become stable unique names.
- [x] Verify the test fails because `componentNaming.ts` does not exist.
- [x] Implement `componentNaming.ts` with exported `componentNameForNode(node)` and `componentFileNameForNode(node)` helpers.
- [x] Include rules: prefer `meta.componentHint`, then node `name`; strip non-alphanumeric separators; PascalCase words; append deterministic numeric suffixes only when resolving duplicate names in a bundle.
- [x] Run the focused unit test and verify it passes.

## Task 2: React Componentized Bundle

- [x] Add failing unit tests proving `exportToReactTailwindBundle(document)` returns `src/GeneratedPage.tsx`, one component file per semantic top-level frame/container, and `README.md`.
- [x] Test expected React output: `GeneratedPage.tsx` imports `HeroSection` from `./components/HeroSection`, renders `<HeroSection />`, and `src/components/HeroSection.tsx` contains the frame children markup.
- [x] Verify the test fails because React bundle still returns only `src/GeneratedPage.tsx` and `README.md`.
- [x] Implement `reactComponentBundleExporter.ts` so top-level visible `frame`/`container` nodes become component files, while non-component root nodes still render inline in `GeneratedPage.tsx`.
- [x] Update `reactTailwindBundleExporter.ts` to use the new componentized exporter directly.
- [x] Run React export tests and verify they pass.

## Task 3: Vue Componentized Bundle

- [x] Add failing unit tests proving `exportToVue3Bundle(document)` returns `GeneratedPage.vue` plus `components/HeroSection.vue` for semantic top-level frame/container nodes.
- [x] Test expected Vue output: page imports child components through `<script setup lang="ts">`, template renders `<HeroSection />`, component file contains scoped markup and styles for that subtree.
- [x] Verify the test fails because Vue bundle still returns only `GeneratedPage.vue`.
- [x] Implement `vueComponentBundleExporter.ts` reusing `renderHtmlBody`/`renderCss` semantics where possible, but scoped to component subtrees.
- [x] Update `vue3Exporter.ts` to use the new componentized exporter directly.
- [x] Run Vue export tests and verify they pass.

## Task 4: Export Preview File Tree

- [x] Add failing integration test that selects `React + Tailwind`, creates a Frame, and sees a preview file list containing `src/GeneratedPage.tsx`, `src/components/Frame.tsx`, and `README.md`.
- [x] Verify the test fails because `CodePreviewPanel` only renders a single React code block.
- [x] Update `CodePreviewPanel.tsx` to call `createExportBundle(document, selectedTarget)` and render file tabs/list plus the active file content.
- [x] Pass selected export target from `Toolbar`/editor state or lift export target state so preview and download use the same target.
- [x] Run preview integration tests and verify they pass.

## Final Verification

- [x] Run `pnpm test`.
- [x] Run `pnpm build`.
- [x] Run `pnpm lint`.
- [x] Run `pnpm e2e`.
- [x] Scan for `console.log`, clipboard export, JSON manifest export, hidden catch-all renderers, and duplicate old/new implementations for the same export target.
