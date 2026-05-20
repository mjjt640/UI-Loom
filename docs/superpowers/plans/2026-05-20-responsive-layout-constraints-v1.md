# Responsive Layout Constraints v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make UI Loom export responsive layout semantics from the design graph instead of relying on fixed visual placement.

**Architecture:** The page document remains the only layout source of truth. `LayoutProps` stores sizing and constraint intent, the canvas and inspector edit those fields, and each exporter maps the same fields into deterministic code without a parallel layout path.

**Tech Stack:** React 19, TypeScript, Zustand, Tailwind CSS, Vitest, Testing Library, Playwright.

---

## Non-Negotiables

- Do not add AI drawing or prompt-to-image work.
- Do not keep old and new layout exporters for the same target.
- Exported layout must come from `LayoutProps`, not inferred from rendered DOM.
- Behavior changes start with failing tests.
- Keep direct file export behavior; no clipboard export or JSON manifest export.

## Task 1: Layout Model Semantics

- [x] Add `LayoutConstraints` and min/max size fields to `LayoutProps`.
- [x] Extend persistence schema for the new fields.
- [x] Add command/store coverage for editing constraints and size modes through existing layout update flow.

## Task 2: Inspector And Canvas Editing

- [x] Add failing integration coverage for selecting a frame and editing width mode, min/max width, and horizontal constraint.
- [x] Add inspector controls for width/height mode, min/max sizes, and horizontal/vertical constraints.
- [x] Render fill/hug/min/max and constraints on the canvas using the same layout fields.

## Task 3: Export Mapping

- [x] Add failing unit coverage for responsive Tailwind classes from `fill`, `hug`, min/max, and constraints.
- [x] Add failing unit coverage for HTML/CSS and Vue output using the same layout semantics.
- [x] Implement shared Tailwind mapping for sizing and constraints.
- [x] Implement shared CSS mapping for sizing and constraints.
- [x] Update React/Vue README guidance to mention responsive layout semantics.

## Final Verification

- [x] Run targeted red/green tests.
- [x] Run `pnpm test`.
- [x] Run `pnpm build`.
- [x] Run `pnpm lint`.
- [x] Run `pnpm e2e`.
- [x] Scan for clipboard export, JSON manifest export, hidden fallback renderers, and duplicate old/new layout paths.
