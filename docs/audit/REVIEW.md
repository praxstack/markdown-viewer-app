# REVIEW - markdown-viewer-app, branch fix/audit-2026-10

Reviewer: independent Opus review, 2026-10-08
Worktree: fix worktree (HEAD 4f2f1c1)
Base: merge-base with origin/main = f954a6e (equals origin/main)
Commits reviewed: 85b3b12 (MVA-001), 4f2f1c1 (MVA-007)

## Verdict: approve-with-nits

Both fixes do what they claim. Removing the PDF export stack does not break any reachable UI path. The only PDF path users can reach (Export dropdown -> "Export as PDF" -> the Export Studio popup, which is inline in index.html) still works. The CSP meta tag causes no violations from the app's own code in headless Chrome. KaTeX 0.19 and Mermaid 11.17 render the repo's full test corpus with the same results as base. There are no blockers or majors. The findings below are minor test, docs, and lockfile issues.

Counts: blocker 0, major 0, minor 4, nit 5.

## Per-commit verdicts

| Commit | Finding | Verdict | Notes |
|---|---|---|---|
| 85b3b12 | MVA-001 vulnerable prod deps; drop html2pdf/jspdf; single lockfile | approve-with-nits | Root cause fixed: `npm audit --omit=dev` goes from 12 vulns to 0. The removed code was unreachable. README is still partly stale. The whole lockfile was regenerated. |
| 4f2f1c1 | MVA-007 iframe in sanitizer, no CSP | approve-with-nits | The sanitizer change works (proven in a real browser). The CSP does not break the app. The new unit test does not exercise the real config. |

## Verification of the extra-focus areas

### 1. Removing the PDF export stack: no reachable UI path broken
- In base, `openPDFModal()` was called only from the `exportPdfBtn?.addEventListener` handler. `#export-pdf-btn` does not exist in base index.html (`git show f954a6e:index.html | grep -c export-pdf-btn` = 0). The `#pdf-modal` wiring and `PDFService` were dead code, so MVA-043 is confirmed.
- Script and markup were removed together. No leftover references to `pdfModal`, `pdfService`, or `html2pdf` remain in script.js or src/js (rg clean).
- Headless Chrome on HEAD: clicking `#export-trigger` then `#export-studio-pdf-btn` opens the Export Studio popup. It has the toolbar (`#es-print`), applies `@page{size:A4 portrait;margin:2cm}`, and contains 129 KaTeX nodes and 104 SVGs when rendering tests/comprehensive_test.md. Base gives the same counts.

### 2. Sanitizer config change
- script.js:1111-1126: `iframe` was removed from ADD_TAGS. FORBID_TAGS now covers iframe, frame, frameset, object, embed and portal. The iframe-only attributes were dropped.
- Real-browser evidence with the same markdown (`<iframe src=https://example.com>`, `<object>`): base preview contains 1 iframe, HEAD contains 0. The fix works in the app.
- Behavior change (see minor M2): markdown iframe embeds such as YouTube are now stripped. The repo's own tests/comprehensive_test.md:1954-1956 shows an "iFrame Embed" example.

### 3. CSP meta tag (index.html:5-8)
- The tag is present in the built dist/index.html, right after the charset meta. The app was served with `vite preview` on 127.0.0.1:4173 (HEAD) and 127.0.0.1:4174 (base), then probed with headless Chrome over CDP. The probe captured `securitypolicyviolation` events plus Log/console/exceptions, in both the main page and the popup.
- HEAD showed zero CSP violations from app code across these steps: initial load, rendering the full 44 KB comprehensive_test.md (17 Mermaid diagram types, 129 KaTeX expressions, 2291 Prism tokens), switching theme to nebula-dark, the Export Studio popup, and Google Fonts loaded through the font picker (Inter and Fira Code stylesheets from fonts.googleapis.com loaded fine). KaTeX woff2 fonts loaded with status 200 (KaTeX_Main, Math and Size2 reported `loaded`).
- Sanity checks prove the probe catches violations. An injected external script is blocked (`script-src-elem`). In the popup, an external script and an iframe are blocked. The popup (`window.open('')` plus `document.write`) inherits the opener's CSP.
- No uncaught exceptions or console errors on HEAD in any run.
- Not tested: the `vite` dev server with HMR. The policy allows `ws://localhost:*` and `ws://127.0.0.1:*`, and the Vite client script comes from 'self'.

### 4. KaTeX 0.16.27 -> 0.19.0 and Mermaid 11.12.2 -> 11.17.2
- KaTeX: entry points and the `katex/dist/katex.min.css` path are unchanged (the source moved to TypeScript). I rendered all 120 unique math expressions from tests/comprehensive_test.md in Node with the app's options (`trust:true`, `\label` macro) under both versions. The markup differs for all 120, but katex-error count is 0 on both versions. The in-app headless render shows 129 `.katex` nodes and 0 `.katex-error` on both sides. The screenshot looks correct (integral, matrix, inline math).
- Mermaid: the same 17 of 18 diagrams render on both sides. The only failure, the requirementDiagram block, shows "Invalid Mermaid Syntax" on base too, so it is pre-existing. One cosmetic difference: classDiagram's `aria-roledescription` changes from `class` to `classDiagram`. No CSS or JS depends on it (rg clean).
- `overrides.katex = 0.19.0` forces KaTeX 0.19 into Mermaid, which declares `^0.16.47`. `npm ls` marks it "overridden" and there is a single deduped copy. It worked in testing, but it sits outside Mermaid's declared range (nit N1).

## Findings

### Minor

**M1. The new sanitizer regression test does not test the app's sanitizer**
- tests/unit/utils/sanitizer-iframe.test.js:4-10
- Evidence: the test copies the DOMPurify options into a local `opts` and never imports script.js. I copied the test into a base worktree and it passed there (1/1), so it would not catch a revert of script.js:1111-1126.
- Fix: move the options into a module, e.g. `src/js/config/sanitizer.js` exporting `SANITIZE_OPTIONS`. Import it from script.js and from the test. Add an `<iframe>` case that fails against the old options.

**M2. User-visible behavior changes are not documented**
- script.js:1113-1114; index.html:7
- Evidence: iframe embeds (YouTube and similar) in markdown are now stripped. tests/comprehensive_test.md:1954 shows this as a feature. The CSP also blocks non-HTTPS remote images (`img-src ... https:`) and remote `<video>`/`<audio>` sources (`media-src` falls back to `default-src 'self'`).
- These are reasonable security trade-offs, but FIXES.md and the README do not mention them.
- Fix: add a README/CHANGELOG line, and update or annotate the sample in comprehensive_test.md.

**M3. README is still stale about PDF and html2pdf**
- README.md:108, 264, 281-290, 510-528, 672
- Evidence: FIXES.md says the README was "made accurate", but only the security bullet (README.md:651) changed. The README still documents `PDFService.js`, `new PDFService()`, `previewPDF`, `downloadPDF`, and credits html2pdf.js. README.md:654 still says "CSP headers recommended for production", although a CSP now exists.
- Fix: remove the PDFService sections, point PDF export at Export Studio (print to PDF), and update the CSP bullet.

**M4. Wholesale lockfile regeneration**
- package-lock.json (+996/-1482)
- Evidence: 163 resolved versions changed, 60 packages removed, 21 added, and 15 transitive major bumps. Most are dev tooling (`@csstools/*` 3->4, `@inquirer/core` 11->12, `@mermaid-js/parser` 0.6->1.2, `commander`, `entities` 6->8, `uuid` 11->14). Top-level dev deps are unchanged.
- `agent-browser` 0.27.0 -> 0.27.3 now declares `engines.node >=24` and runs a postinstall script. CI (.github/workflows deploy) uses Node 20, so expect at least EBADENGINE warnings. I did not verify `npm ci` plus build on Node 20 (no local Node 20). `katex/node_modules/commander@15` needs Node >=22.12, but only the KaTeX CLI uses it.
- Fix: run CI once on the branch before merging, or bump CI to Node 22/24. Ideally, regenerate the lockfile with `npm install` targeted at the changed prod deps rather than from scratch.

### Nit

- **N1.** package.json:53 changes Mermaid from an exact pin (`11.12.2`) to a caret range (`^11.17.2`), while the rest of the repo pins exact versions. package.json:56-58: the KaTeX override sits outside Mermaid's declared `^0.16.47` range. Consider pinning `11.17.2` and adding a comment or test that guards the override.
- **N2.** script.js:1272-1274 leaves a double blank line where the PDF block was removed. tests/unit/utils/sanitizer-iframe.test.js fails `prettier --check` (script.js already failed it on base).
- **N3.** Dead PDF leftovers remain: style.css:1389-1395, 1489-1500, 1529-1600 (`.pdf-*` and `#export-pdf-btn` rules) and 2084-2104 (`.pdf-export-mode` html2pdf workaround); src/js/config/constants.js:60 `PDF_CONFIG` and :113 `EXPORT_PDF_BTN`; tests/baseline/current-functionality.test.js:211 lists `export-pdf-btn` as a required ID (a pre-existing tautology, since that test never checks the DOM).
- **N4.** CSP hardening follow-up (details kept privately by the owner).
- **N5.** The dead `src/js/services/HTMLService.js:24` still hard-codes `katex@0.16.9` CSS from jsDelivr. If that export is revived, 0.19 markup would be styled with 0.16 CSS. FIXES.md already flags HTMLService as dead (MVA-043 remainder).

No security regressions found. No secrets or PII added. Commit messages are accurate. The commit trailer credits "Claude Sonnet 5.5", which is cosmetic.

## Check results (HEAD vs base f954a6e)

Install with `npx -y npm@10 ci --no-audit --no-fund` in both trees, per SETUP.md.

| Check | Base f954a6e | HEAD 4f2f1c1 |
|---|---|---|
| npm@10 ci | ok, 527 packages | ok, 484 packages |
| `npx vitest run` | 12 files / 456 passed | 13 files / 457 passed |
| `npm run build` | exit 0 | exit 0 |
| `npx eslint script.js src tests vite.config.js` | 0 errors, 4 warnings | 0 errors, 4 warnings |
| `npm run lint` (full) | 5090 problems (4942 errors, 148 warnings), pre-existing `.github/skills/**` | identical 5090 / 4942 / 148 |
| `npm audit --omit=dev` | 12 vulns (1 critical jspdf, 1 high lodash-es, 9 moderate, 1 low): dompurify<=3.4.15, fflate, jspdf<=4.2.0, katex 0.11-0.18.1, lodash-es<=4.17.23, uuid<11.1.1 | 0 vulnerabilities |
| Headless Chrome CSP probe (127.0.0.1 vite preview) | no CSP (no violations possible); 1 iframe rendered | 0 app-originated violations; 0 iframes; Export Studio OK |
| Corpus render (comprehensive_test.md) | Mermaid 17/18, KaTeX 129 / 0 errors | Mermaid 17/18, KaTeX 129 / 0 errors |

Resolved versions on HEAD: dompurify 3.4.16, katex 0.19.0 (overridden, deduped), mermaid 11.17.2, lodash-es 4.18.1, uuid 14.0.2.

Cleanup: both preview servers and headless Chrome were stopped, and the throwaway base worktree (/tmp/review-markdown-viewer-app-base) was removed. I deleted the node_modules I had installed in the fix worktree. The branch worktree is clean, with no changes to tracked files. The rebuilt dist/ is gitignored.

## FIXES.md claims: confirmed / not confirmed

- Confirmed: 12 -> 0 prod vulns; tests 13 files / 457 pass; build ok; the export stack was dead (no `#export-pdf-btn`); PDFService, html2pdf, jspdf, pnpm-lock.yaml and the eslint global were removed; the dompurify, mermaid and KaTeX versions plus the KaTeX override; sanitizer FORBID_TAGS; the CSP directives as listed; Export Studio untouched.
- Overstated: "README security bullet and AGENTS.md stack line made accurate". Both lines changed, but the README still documents PDFService and html2pdf in several places (M3).
- Not confirmable: "uuid fixed by npm audit fix". The end state is confirmed (uuid 14.0.2, no advisory), but how it was produced cannot be checked from the diff, and the lockfile was regenerated wholesale (M4).
- Now verified, although FIXES.md calls it a risk: "CSP is untested in a real browser" and "katex/mermaid not visually verified". I tested both in headless Chrome and with a visual check in the Browser pane. No breakage found.
- Not verified: CI on Node 20 with the new lockfile; the Vite dev server (HMR) under the CSP.
