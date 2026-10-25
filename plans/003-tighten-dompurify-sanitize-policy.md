# Plan 003: Unify and tighten DOMPurify sanitize policy

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 16ce3a5..HEAD -- script.js src/js/services/PDFService.js src/js/preview/`

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: MED
- **Depends on**: plans/002-characterization-tests-markdown-preview.md
- **Category**: security
- **Planned at**: commit `16ce3a5`, 2026-08-29

## Why this matters

Preview rendering allows `iframe` tags via DOMPurify `ADD_TAGS` while PDF export
uses a stricter profile (`USE_PROFILES: { html: true }` only). HTML export embeds
preview innerHTML with no second sanitize pass. Divergent policies mean XSS review
must hunt three call sites. A single sanitize module with an explicit, documented
policy improves locality and gives one interface for tests to lock down.

## Current state

Preview sanitize (`script.js:1116-1133`):

```javascript
const cleanHtml = DOMPurify.sanitize(html, {
  ADD_TAGS: ['iframe', 'img'],
  ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target',
    'data-code', 'src', 'alt', 'title', 'width', 'height', 'loading'],
  USE_PROFILES: { html: true, svg: true, mathml: true },
});
```

PDF sanitize (`src/js/services/PDFService.js:194-196`):

```javascript
contentWrapper.innerHTML = DOMPurify.sanitize(content, {
  USE_PROFILES: { html: true },
});
```

HTML export (`src/js/services/HTMLService.js:15-18`) accepts `contentHtml` and
embeds it in a template without sanitization.

After plan 002, `getSanitizeConfig()` / `sanitizePreviewHtml()` should exist in
`src/js/preview/markdownPreviewHarness.js`.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Tests | `npm test -- --run` | exit 0 |
| Lint | `npm run lint` | exit 0 |

## Scope

**In scope**:
- `src/js/preview/sanitizePolicy.js` (new — single policy source)
- `src/js/preview/markdownPreviewHarness.js` (or successor)
- `script.js` (import shared policy)
- `src/js/services/PDFService.js` (import shared policy for string path)
- `src/js/services/HTMLService.js` (sanitize before embed)
- `tests/unit/preview/sanitizePolicy.test.js` (new)
- Update iframe characterization test from plan 002 if policy changes

**Out of scope**:
- CSP headers for GitHub Pages deployment
- Removing DOMPurify dependency

## Git workflow

- Branch: `advisor/003-unify-dompurify-policy`
- Commit: `fix(security): unify DOMPurify sanitize policy across preview and export`
- Do NOT push unless instructed.

## Steps

### Step 1: Create shared sanitize module

Create `src/js/preview/sanitizePolicy.js` exporting:

```javascript
export const PREVIEW_SANITIZE_CONFIG = { /* moved from script.js */ };
export function sanitizeForPreview(html) { /* DOMPurify.sanitize */ }
export function sanitizeForExport(html) { /* same policy OR stricter variant with comment */ }
```

**Decision (document in module JSDoc):** Either (A) remove `iframe` from `ADD_TAGS`
unless product requires embeds — preferred for security — or (B) keep iframe but
restrict `ADD_ATTR` and document threat model. Default recommendation: **remove iframe**
unless a characterization test proves user-facing iframe embeds are required.

**Verify**: `npm run lint` → exit 0.

### Step 2: Wire all three paths

- `script.js` / harness → `sanitizeForPreview`
- `PDFService.js:194` → `sanitizeForExport` (same config)
- `HTMLService.generateHTML` → sanitize `contentHtml` before template insertion

**Verify**: `npm test -- --run` → exit 0.

### Step 3: Add security-focused unit tests

Create `tests/unit/preview/sanitizePolicy.test.js`:

- `<script>alert(1)</script>` stripped
- `<img onerror="...">` stripped (event handlers)
- `<iframe ...>` behavior matches chosen policy (removed if option A)
- SVG/mathml from KaTeX still allowed (regression)

**Verify**: `npm test -- --run tests/unit/preview/sanitizePolicy.test.js` → all pass.

## Test plan

- New: `tests/unit/preview/sanitizePolicy.test.js` (≥4 cases)
- Update plan 002 iframe case if policy changes
- Pattern: `tests/unit/services/FolderBrowserService.test.js` (security edge cases)

## Done criteria

- [ ] Single `sanitizePolicy.js` module; no inline DOMPurify config duplicates
- [ ] HTML export sanitizes content before embed
- [ ] All tests pass; new sanitize tests pass
- [ ] `plans/README.md` row 003 → DONE

## STOP conditions

Stop and report if:

- Removing iframe breaks documented product feature — capture evidence (README feature list
  does not mention iframe embeds; if tests/docs require them, stop and ask operator).
- KaTeX or Mermaid output is stripped by tightened policy (adjust ALLOW_TAGS/PROFILES, retest).
- Plan 002 harness not merged — complete 002 first.

## Maintenance notes

- Any new HTML sink (new export format, copy-to-clipboard) must call `sanitizeForExport`.
- Reviewers: confirm no secret URLs or tokens in test fixtures.
- README Security section claims "Input sanitization via DOMPurify" — update if iframe removed.
