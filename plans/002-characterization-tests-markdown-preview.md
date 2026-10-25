# Plan 002: Add Markdown Preview characterization tests

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 16ce3a5..HEAD -- script.js tests/`
> Compare excerpts if `script.js` render/sanitize logic changed.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: plans/001-fix-vitest-skill-excludes.md
- **Category**: tests
- **Planned at**: commit `16ce3a5`, 2026-08-29

## Why this matters

The Markdown Preview path (`configureMarkedExtensions` + nested `renderMarkdown`
in `setupEditor`) is the app's core domain and security surface (DOMPurify), but
**zero tests** import or exercise `script.js`. Refactoring the 2649-line monolith
without a test seam at the preview pipeline guarantees regressions in math, mermaid
placeholders, footnotes, and XSS sanitization. Characterization tests document
current behavior as a contract before extraction (plan 005).

## Current state

- `script.js:593-904` — `configureMarkedExtensions()` registers marked extensions
  (footnotes, admonitions, math, sub/superscript, custom heading/link renderers).
- `script.js:1092-1182` — nested `renderMarkdown()` inside `setupEditor`:
  - calls `marked.parse`
  - replaces mermaid code blocks with `.mermaid-diagram` placeholders
  - sanitizes via `DOMPurify.sanitize` with `ADD_TAGS: ['iframe', 'img']`
  - writes `preview.innerHTML`, renders mermaid, calls `prismService.highlightAll`
- `tests/baseline/current-functionality.test.js` — documents localStorage keys and
  constants but does **not** invoke render logic (grep for `script.js` in tests/ → no matches).
- Existing service test pattern: `tests/unit/services/MermaidService.test.js` — Vitest + jsdom.

Exemplar test structure to match:

```javascript
// tests/unit/services/MermaidService.test.js (opening pattern)
import { describe, it, expect, beforeEach } from 'vitest';
import { MermaidService } from '../../../src/js/services/MermaidService.js';
```

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Tests | `npm test -- --run` | exit 0; new test file counted |
| Lint | `npm run lint` | exit 0 |

## Scope

**In scope**:
- `tests/unit/preview/` (new directory)
- `tests/unit/preview/markdownPreview.characterization.test.js` (new)
- `src/js/preview/markdownPreviewHarness.js` (new, test-only extraction of pure steps OR minimal exported helpers — see Step 1)

**Out of scope**:
- Refactoring `script.js` production wiring (plan 005)
- Changing DOMPurify policy (plan 003)
- Modifying `tests/baseline/current-functionality.test.js`

## Git workflow

- Branch: `advisor/002-markdown-preview-characterization-tests`
- Commit: `test(preview): add markdown render characterization tests`
- Do NOT push unless instructed.

## Steps

### Step 1: Extract testable pure functions without changing app behavior

Create `src/js/preview/markdownPreviewHarness.js` exporting **pure** helpers
lifted from `renderMarkdown` / `configureMarkedExtensions` logic. Minimum exports:

1. `replaceMermaidBlocks(html)` — the regex replacement at `script.js:1104-1113`
2. `getSanitizeConfig()` — returns the DOMPurify options object from `script.js:1116-1133`
3. `sanitizePreviewHtml(html)` — wraps `DOMPurify.sanitize(html, getSanitizeConfig())`
4. `createMarkedInstance()` — returns a configured `marked` instance with the same
   extensions as `configureMarkedExtensions()` (import marked, markedFootnote, katex as in script.js)

Wire `script.js` to import and use these helpers **without changing output**.
Keep `renderMarkdown` nested in `setupEditor` but delegate to harness functions.

**Verify**: `npm test -- --run` → still 456+ tests pass (count increases after Step 2).

### Step 2: Write characterization tests

Create `tests/unit/preview/markdownPreview.characterization.test.js` with cases:

| Case | Assert |
|------|--------|
| Basic markdown | `# Hi` → contains `<h1` |
| Mermaid fence | ` ```mermaid\ngraph TD\nA-->B\n``` ` → contains `mermaid-diagram`, `data-code` |
| Inline math | `$x^2$` → KaTeX markup or marked output (match current behavior) |
| Footnote | `[^1]` syntax → footnote markup present |
| Admonition | `> [!NOTE]` block → `admonition-note` class |
| XSS script tag | `<script>alert(1)</script>` in markdown → sanitized out of output |
| iframe in markdown | `<iframe src="...">` → document whether allowed (current: allowed per ADD_TAGS) |

Use `createMarkedInstance()` + `sanitizePreviewHtml(replaceMermaidBlocks(html))` pipeline.

**Verify**: `npm test -- --run tests/unit/preview/markdownPreview.characterization.test.js` → all pass.

### Step 3: Full suite

**Verify**: `npm test -- --run` → exit 0; test count ≥ 456 + new tests.

## Test plan

- New file: `tests/unit/preview/markdownPreview.characterization.test.js`
- Pattern: `tests/unit/services/MermaidService.test.js`
- Minimum 7 characterization cases listed in Step 2.
- Verification: `npm test -- --run` → all pass.

## Done criteria

- [ ] Harness module exists; `script.js` delegates without behavior change
- [ ] Characterization test file with ≥7 cases passes
- [ ] `npm test -- --run` exits 0
- [ ] `npm run lint` exits 0
- [ ] `plans/README.md` row 002 → DONE

## STOP conditions

Stop and report if:

- Extracting helpers requires touching unrelated `setupEditor` UI code beyond render pipeline.
- Any characterization test fails and behavior is ambiguous (document actual vs expected).
- Test count for app drops or vendored skill tests reappear (plan 001 regression).

## Maintenance notes

- These are **characterization** tests — do not "fix" failing assertions by changing
  product behavior without explicit approval; update tests only when intentionally changing preview.
- Plan 005 will move harness into `MarkdownPreview` module; keep harness path stable until then.
- Reviewers: confirm XSS/iframe test documents current policy (feeds plan 003).
