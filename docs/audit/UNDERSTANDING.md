# markdown-viewer-app: Understanding (comprehension lead)

Repo: praxstack/markdown-viewer-app (public). HEAD f954a6e (2026-08-30). 294 commits, 2025-11-06 to 2026-08-30, single human author (Prax Lannister) plus bot PRs (Jules-style "Bolt/Sentinel/Palette" PRs, ImgBot, Cursor cloud agents).

## 1. What it is
"Markdown Viewer Pro": a client-only SPA (no backend). Vite + vanilla JS. Split editor/preview, themes, Mermaid, KaTeX, Prism, folder browser (File System Access API), HTML/PDF export, TOC anchor nav, zen mode, split-view resizer. Deployed to GitHub Pages (base `/markdown-viewer-app/`, vite.config.js:7).

## 2. Size reality: 3.9k tracked files, ~3.5k are vendored agent skills
`git ls-files` by top dir: .claude 3515, .github 166 (148 are `skills/impeccable`), docs 53, .specify 20, themes 15, src 15, tests 14. The actual app is: script.js (2649 lines, monolith), index.html (2325), style.css (3491), variables.css, animations.css, 15 files in src/js (3567 lines), 15 theme CSS, 14 test files. `.agents/skills` and `.cursor/skills` are symlinks to `.claude/skills` (git mode 120000).

## 3. Module map
| Path | Role |
|---|---|
| script.js | Entry/controller. Imports libs + services (script.js:4-23). `setupEditor()` is 1217 lines (script.js:911), `configureMarkedExtensions()` 271 lines (593). Holds marked config, render pipeline (DOMPurify then innerHTML, ~1115-1135), Mermaid post-render, view modes, zen mode (1880), split resizer (1425), file create/save UI, support modal + support widget (387-580), export wiring. |
| src/js/core/StorageManager.js | localStorage wrapper. |
| src/js/core/ThemeManager.js | Theme load/apply, custom theme save, 12+ built-in themes; uses colorHelpers, validators, constants. |
| src/js/services/FolderBrowserService.js (775) | showDirectoryPicker (line 77), scan tree, flattened-file cache (42), create/refresh files. |
| LinkNavigationService.js (360) | Relative .md link navigation, modal, uses pathHelpers (heaviest cross-module coupling, 8 call edges). |
| MermaidService.js (369) | Theme-aware mermaid init, waits for CSS. |
| PDFService.js (422) | html2pdf export, sanitizes string input with DOMPurify (:194). |
| HTMLService.js, PrismService.js | Standalone HTML export, Prism autoloader. |
| src/js/utils/{pathHelpers,validators,colorHelpers,htmlHelpers}.js | pure helpers. htmlHelpers is not imported by app code. |
| src/js/config/{constants,errorMessages,featureFlags}.js | featureFlags.js has no importers in app or tests (only a re-declared local object in tests/baseline). |
| themes/*.css | 15 files (default, ocean, neon, forest, sunset, obsidian, nebula + nebula-elements). Copied to dist/themes by custom Vite plugin (vite.config.js:20-41). |
| verify_fix.js | Stray 31-line scratch script at repo root (re-implements escapeHTML), not wired anywhere. |

## 4. Flows
- Typing: textarea input (debounced) -> marked (+footnote, custom math/admonition/heading-slug extensions) -> DOMPurify.sanitize (ADD_TAGS iframe,img; USE_PROFILES html+svg+mathml; script.js:1116-1132) -> `preview.innerHTML` -> Mermaid render per `.mermaid`/data-code element (`element.innerHTML = result.svg`, 1152) -> Prism, KaTeX.
- Folder browser: Chromium-only `showDirectoryPicker`; Firefox/Safari have no folder browser (README table itself says Firefox lacks it, but README:73 and 409 claim Safari "full support").
- Export: HTML (HTMLService, Blob) and PDF (PDFService/html2pdf).
- Support/donation: one-time modal after 5 s; footer widget does a third-party `fetch('https://ipapi.co/json/')` for geo (script.js:487) to pick India vs global donation links.
- Persistence: localStorage (theme, custom theme, support_modal_shown) and sessionStorage (support region). No server, no DB.

## 5. Build / run / test
- `npm ci`, `npm run dev` (vite :3000, `open:true`), `npm run build` (OK, verified, exit 0), `npm test` (vitest, jsdom), `npm run lint`, `npm run format:check`.
- Verified in a clean copy (see note on install below): vitest 455/456 pass; 1 timing-flaky test (MermaidService.test.js:51 `expected 110 < 100`). `vitest --coverage`: All files 94.62% stmts / **83.72% branches** -> fails its own 85% threshold (vitest.config.js:23-28). Coverage only includes src/js; script.js (2649 lines, the bulk of logic) is not measured or tested at all.
- `eslint src tests script.js vite.config.js`: 0 errors, 4 warnings. `npm run lint` (eslint . --ext .js) in the repo: ~4.9k errors, all in `.github/skills/impeccable/**` (not in eslint.config.js ignores, which cover only .claude/.agents skills; eslint.config.js:16-24).
- `npm audit --omit=dev`: 11 vulns (1 critical jspdf via html2pdf.js, 1 high lodash-es via mermaid, dompurify direct moderate, mermaid direct moderate).
- Environment note: `npm ci` inside the live repo dir repeatedly left a corrupt node_modules (ENOTEMPTY, missing .bin/eslint) because the audit pre-pass and sibling jobs touch the same tree concurrently. I ran installs/tests in a scratch copy (scratchpad/mva) instead. No tracked file changed (`git status` clean).

## 6. CI
Only `.github/workflows/deploy.yml`: on push to main -> Node 20, `npm ci`, `npm run build`, upload + deploy Pages. No test, lint, audit step; PRs get no checks. Recent runs: last success 2026-08-30; many "cancelled" (concurrency group 'pages', cancel-in-progress false but queued runs superseded). Two runs lasted 8h (queued behind pending deployments). plans/004 (CI gates) is TODO.

## 7. GitHub backlog
0 open issues. PRs: 28 total; open: #27 ImgBot (since 2026-08-29), #24 draft "gstack Cursor skill discovery" (superseded by #25?). Remote branches with unmerged commits: dev-prax (4+ commits, "restore ALL missing event listeners lost during refactoring"), markdown-preview-ee (4, resets branch), perf-concurrent-cache-build-... (1), prax-markdown-filenavigation (2), refactor-folder-browser-traversal-... (1), imgbot (1).

## 8. Document authority
Authoritative-ish: AGENTS.md (agent/skill layout), README.md (user-facing, partly stale), plans/README.md + plans/00x (improve-audit, 2026-08-29, current), package.json, vitest/eslint/vite configs. Historical/stale: memory-bank/* (Dec 2025), codebase_audit/* (2025-12-09, says Stored XSS CRITICAL, since patched), docs/09-temp/*, root AI_REVIEW.md / CODE_REVIEW_AND_FINDINGS.md / SERVICE_AUDIT.md / RELEASE.md, docs/01-05 design docs. openspec/ has only config.yaml (no changes/specs); .specify/ is a Spec Kit scaffold with no feature specs. No CHANGELOG at repo root.

## 9. Roadmap vs reality (spot checks)
1. README:305 "Total Tests 155+ ... Coverage >85%" vs actual 456 tests and branch coverage 83.72% (fails threshold). Stale and wrong.
2. memory-bank/progress.md:61-62 "95.3% coverage, 368 tests, Production Ready" vs 456 tests / 94.6% stmts / 83.7% branches.
3. memory-bank "ESLint 0 errors" true only for app code; `npm run lint` fails (vendored .github skills).
4. README:651 "No dependencies with known vulnerabilities" vs npm audit 11 prod vulns incl. 1 critical, 1 high.
5. README:73/409 "Safari full support" vs `showDirectoryPicker` Chromium-only (FolderBrowserService.js:52); README:408 admits Firefox lacks it.
6. README project structure / package.json `description` contains a pasted file tree (package.json:4), version 0.1.0 vs RELEASE.md "1.0.0".
7. package.json repository/bugs/homepage still point to PrakharMNNIT/markdown-viewer-app (old owner), while the repo and CI live under praxstack.
8. plans/README.md: 002 characterization tests, 003 tighten DOMPurify policy, 004 CI gates, 005 extract MarkdownPreview: all TODO, confirmed in code (no CI tests; script.js still monolithic; sanitize ADD_TAGS iframe still present). 001 DONE confirmed (vitest.config.js excludes).
9. PR #4 "path traversal in pathHelpers" claimed fixed: isPathWithinRoot (pathHelpers.js:137-157) rejects leading `..` and `../`. Confirmed in code.
10. PR #12 PDF XSS fixed: PDFService.js:194 sanitizes strings. Confirmed. (PDFService was later removed by the audit PR.)
11. PR #14 "remove debug console.log from AnchorNav": script.js still has 32 console.log calls (support modal etc.). Partial, cosmetic.
12. PR #15 flattened-file cache: confirmed (FolderBrowserService.js:42).
13. Feature flags (featureFlags.js) USE_UTILS/USE_NEW_CODE refactor toggles: module is dead code.
14. Zen mode, split resizer, folder browser, mermaid theme service, KaTeX: all present in code.
15. README claims "12 themes (6x2)" in memory-bank vs 7 families (13 CSS + nebula-elements) in README table and repo: minor drift.

## 10. Risk areas (where bugs likely live)
1. script.js `setupEditor` (1217 lines, untested, coverage-excluded): render pipeline, event wiring (a past regression "restore ALL missing event listeners" lives on branch dev-prax), file create/save.
2. Sanitization policy and HTML rendering paths (tightened by the audit PR; further details kept privately).
3. Third-party calls: Google Fonts links injected into exported HTML (1855, 2092), Razorpay/Ko-fi links.
4. FolderBrowserService (775 lines, async tree scan, createFile complexity 17).
5. Dependency vulns in jspdf/html2pdf.js (export path), mermaid.
6. CI absent for tests/lint; coverage gate unenforced and currently failing.
7. Repo hygiene: ~3.5k vendored skill files, broken lint config, stray verify_fix.js.

## 11. Secrets scan (prepass so far)
Secret-scan results are kept privately by the owner.
