# Frame Auto Layout v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Promote `frame` into a first-class design-to-code layout node with Auto Layout controls and semantic export output.

**Architecture:** The design tree remains the single source of truth. Command functions create and transform frame nodes; canvas and inspector consume the same layout fields; exporters render `frame` as structural layout containers instead of unknown nodes.

**Tech Stack:** React 19, TypeScript, Zustand, Tailwind CSS, Vitest, Testing Library, Playwright.

---

## Non-Negotiables

- No clipboard export, JSON manifest export, or hidden fallback renderer.
- Unsupported node types must throw explicit errors in render/export paths.
- Do not keep duplicate old/new implementations for the same feature as a safety net; replace the old path once the new path is verified.
- Normal empty-state handling and explicit input defaults are allowed when they are part of the intended behavior.
- Every behavior change starts with a failing test.
- Preserve the existing design-tree mutation pattern through `editorCommands` and `editorStore`.

## Target File Structure

- Modify: `src/domain/commands/editorCommands.ts`
- Modify: `src/domain/exporter/htmlRenderEngine.ts`
- Modify: `src/domain/exporter/reactTailwindExporter.ts`
- Modify: `src/features/editor/canvas/CanvasNode.tsx`
- Modify: `src/features/editor/inspector/InspectorPanel.tsx`
- Modify: `src/features/editor/toolbar/Toolbar.tsx`
- Modify: `src/store/editorStore.ts`
- Create: `tests/unit/domain/frame-commands.test.ts`
- Modify: `tests/unit/domain/export-bundle.test.ts`
- Create: `tests/integration/frame-auto-layout-flow.test.tsx`

## Task 1: Frame Node Commands

- [x] Add failing unit tests for `createFrameNode()` and `frameSelectedNodes()`.
- [x] Verify tests fail because commands do not exist.
- [x] Implement `createFrameNode()` with `type: 'frame'`, flex-column layout, numeric bounds, padding, gap, border, and background.
- [x] Implement `frameSelectedNodes()` to wrap same-parent absolute selected nodes into a new frame and convert children to frame-local layout.
- [x] Verify unit tests pass.

## Task 2: Canvas And Toolbar

- [x] Add failing integration test that clicks `Frame` and sees `Frame` in layers plus `Frame 节点` on canvas.
- [x] Add failing integration test that selects two layers and clicks `成 Frame`, then sees one selected Frame with both children.
- [x] Implement store actions `addFrameNode()` and `frameSelectedNodes()`.
- [x] Render `frame` in canvas as a structural layout node with no catch-all fallback.
- [x] Add toolbar buttons `Frame` and `成 Frame`.
- [x] Verify integration tests pass.

## Task 3: Auto Layout Inspector

- [x] Add failing integration test that selects a Frame, changes `布局方向` to row, sets `间距` and `内边距`, and observes exported CSS/React classes reflect row/gap/padding semantics.
- [x] Implement inspector controls for frame/container layout mode, gap, padding, align, and justify.
- [x] Verify the Auto Layout test passes.

## Task 4: Export Semantics

- [x] Add failing export tests proving HTML/CSS, Vue, and React + Tailwind render `frame` explicitly.
- [x] Extend HTML renderer supported node types to include `frame`.
- [x] Extend React Tailwind renderer supported node types to include `frame`.
- [x] Ensure nested frame children are exported structurally and unsupported node types still throw.
- [x] Verify export tests pass.

## Final Verification

- [x] Run `pnpm test`.
- [x] Run `pnpm build`.
- [x] Run `pnpm lint`.
- [x] Run `pnpm e2e`.
- [x] Scan for `console.log`, clipboard export, JSON manifest export, hidden catch-all renderers, and duplicate old/new implementations for the same feature.
