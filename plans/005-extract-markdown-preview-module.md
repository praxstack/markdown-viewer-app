# Plan 005: Extract MarkdownPreview module from script.js

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 16ce3a5..HEAD -- script.js src/js/preview/ src/js/features/`

## Status

- **Priority**: P2
- **Effort**: L
- **Risk**: MED
- **Depends on**: plans/002-characterization-tests-markdown-preview.md, plans/003-tighten-dompurify-sanitize-policy.md
- **Category**: tech-debt
- **Planned at**: commit `16ce3a5`, 2026-08-29

## Why this matters

`script.js` is 2649 lines; `setupEditor` alone is 1217 lines (ESLint warning).
The Markdown Preview path mixes marked configuration, sanitization, mermaid
placeholder substitution, and DOM updates with no module depth — interface
surface equals implementation spread across nested functions. Extracting a
**deep** MarkdownPreview module (small interface, behavior behind one seam)
delivers locality for the core domain and matches the architecture review top
recommendation (`/tmp/architecture-review-20260829-143243.html` candidate 1).

Deferred plan reference: `docs/09-temp/legacy-code-refactoring-plan.md` Phase 1–2.

## Current state

- `script.js:593-904` — `configureMarkedExtensions()`
- `script.js:1092-1182` — nested `renderMarkdown()` in `setupEditor`
- `script.js:340-364` — services wired at module scope; `globalRenderMarkdown` ref for theme listener
- After plans 002–003: `src/js/preview/markdownPreviewHarness.js` and `sanitizePolicy.js` should exist
- Characterization tests: `tests/unit/preview/markdownPreview.characterization.test.js`

Architecture vocabulary (from codebase-design skill):

- **Module**: MarkdownPreview — one interface, deep implementation
- **Seam**: `render(markdownText) → { html, mermaidBlocks }` or DOM adapter variant
- **Adapters**: in-memory (tests) + DOM preview element (production)

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Tests | `npm test -- --run` | exit 0; characterization tests still pass |
| Lint | `npm run lint` | exit 0 or same 4 warnings (no new warnings in new module) |
| Dev smoke | `npm run dev` | server starts; manual preview works |

## Scope

**In scope**:
- `src/js/preview/MarkdownPreview.js` (new)
- `src/js/preview/markdownPreviewHarness.js` (merge/replace into MarkdownPreview)
- `src/js/preview/sanitizePolicy.js` (import from MarkdownPreview)
- `script.js` (slim bootstrap + delegate to MarkdownPreview)
- `tests/unit/preview/` (update imports if needed)

**Out of scope**:
- Extracting full `setupEditor` UI (zen, split, folder browser UI) — future plan
- `configureMarkedExtensions` consumers outside preview
- README badge updates

## Git workflow

- Branch: `advisor/005-extract-markdown-preview-module`
- Commits: incremental — e.g. `refactor(preview): add MarkdownPreview module`, then `refactor(script): delegate render to MarkdownPreview`
- Do NOT push unless instructed.

## Steps

### Step 1: Define MarkdownPreview class

Create `src/js/preview/MarkdownPreview.js`:

```javascript
export class MarkdownPreview {
  constructor({ sanitizePolicy, prismService, mermaidService }) {}
  configureMarked() { /* move from configureMarkedExtensions */ }
  renderToHtml(markdownText) { /* parse + mermaid replace + sanitize; pure HTML string */ }
  renderToDom(markdownText, previewElement) { /* renderToHtml + innerHTML + mermaid + prism */ }
}
```

Move logic from harness + `configureMarkedExtensions` + nested `renderMarkdown`
core into this class. Keep side effects (mermaid.render, prism highlight) in
`renderToDom` only; `renderToHtml` must stay pure enough for characterization tests.

**Verify**: `npm test -- --run tests/unit/preview/` → pass.

### Step 2: Wire script.js

- Instantiate `MarkdownPreview` alongside other services (~line 340).
- Replace `configureMarkedExtensions()` call with `markdownPreview.configureMarked()`.
- Replace nested `renderMarkdown` body with `markdownPreview.renderToDom(...)`.
- Set `globalRenderMarkdown` to bound `renderToDom` method.

**Verify**: `npm test -- --run` → all pass.

### Step 3: Remove dead code

Delete inlined duplicate logic from `script.js` once delegated. Target: reduce
`configureMarkedExtensions` and nested render function from script.js entirely.

**Verify**:

```bash
npm run lint 2>&1 | grep -E 'configureMarkedExtensions|setupEditor' || true
```

Line-count warning for `setupEditor` may remain (expected — UI still nested).

### Step 4: Smoke test

**Verify**: `npm run dev` → load app, type markdown with mermaid + math, confirm preview updates; theme switch re-renders diagrams.

## Test plan

- Existing characterization tests must pass unchanged (or import path updates only).
- Optional: `tests/unit/preview/MarkdownPreview.test.js` for class-level unit tests.
- Verification: `npm test -- --run` → exit 0.

## Done criteria

- [ ] `MarkdownPreview.js` exists; script.js delegates preview render
- [ ] No duplicate DOMPurify/marked config blocks remain in script.js
- [ ] All tests pass
- [ ] `script.js` line count reduced by ≥300 lines vs 2649 baseline
- [ ] `plans/README.md` row 005 → DONE

## STOP conditions

Stop and report if:

- Characterization tests fail after refactor — fix implementation, not tests, unless behavior intentionally changed.
- `renderToHtml` cannot be made testable without major marked.js refactor — report with proposed slimmer seam.
- Extraction requires modifying `setupEditor` UI event handlers beyond render delegation.

## Maintenance notes

- Next deepening candidate: collapse `setupEditor` UI modules (architecture report candidate 2).
- Feature flags in `src/js/config/featureFlags.js` available for gradual rollout if needed.
- Reviewers: confirm theme-change listener still triggers re-render via `globalRenderMarkdown`.
