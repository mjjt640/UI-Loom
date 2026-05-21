# Design To Code Core v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade UI Loom around the graph-to-code core: richer editable shape properties, explicit component semantics, stable node-to-code mapping, and higher-quality deterministic exports.

**Architecture:** The page document remains the only source of truth. Editor commands mutate typed node fields, canvas renders those fields, and exporters consume the same model without parallel fallback implementations.

**Tech Stack:** React 19, TypeScript, Zustand, Tailwind CSS, Vitest, Testing Library, Playwright.

---

## Non-Negotiables

- Do not add AI drawing or prompt-to-image work in this pass.
- Do not keep old and new implementations for the same export behavior.
- Export improvements must be deterministic mappings from node data.
- Behavior changes start with failing tests.
- Keep direct file export behavior; no clipboard export or JSON manifest export.

## Task 1: Advanced Graphic Properties

- [x] Add failing tests for border width/color, radius, shadow, and opacity across canvas-visible style and export output.
- [x] Extend canvas rendering so rect, frame, container, button, image, and text consistently apply relevant advanced styles.
- [x] Extend the inspector with explicit controls for border width, border color, radius, shadow, opacity, and fill where applicable.
- [x] Extend React/Tailwind mapping to emit deterministic arbitrary-value classes for unsupported color, radius, border, shadow, and opacity values.
- [x] Verify HTML/CSS/Vue exports already preserve the same style fields through shared CSS rendering.

## Task 2: Component Semantic Annotation

- [x] Add failing tests for editing selected Frame/Container display name and component hint from the inspector.
- [x] Add command/store support for updating selected node name and meta component hint.
- [x] Add inspector controls for component-capable nodes.
- [x] Verify React and Vue componentized exports use the edited component hint as component/file name.

## Task 3: Stable Code Mapping

- [x] Add failing tests proving generated files expose stable node-code mapping metadata.
- [x] Add a shared code mapping model to `ExportBundle`.
- [x] Emit mapping entries from React, Vue, HTML/CSS/JS, and single-file HTML exporters using node ids and file paths.
- [x] Update code preview so selecting a node can reveal the generated file that contains its code.

## Task 4: Export Quality Enhancement

- [x] Add failing tests for semantic HTML element choices and clearer generated class naming.
- [x] Improve deterministic labels and accessibility attributes for frames, groups, rects, images, and buttons.
- [x] Improve generated README guidance for React/Vue bundles.
- [x] Verify all export targets remain file-based and preserve existing basic flows.

## Final Verification

- [x] Run `pnpm test`.
- [x] Run `pnpm build`.
- [x] Run `pnpm lint`.
- [x] Run `pnpm e2e`.
- [x] Scan for `console.log`, clipboard export, JSON manifest export, hidden fallback renderers, and duplicate old/new implementations.
