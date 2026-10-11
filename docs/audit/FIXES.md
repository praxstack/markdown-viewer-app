# FIXES - markdown-viewer-app (branch fix/audit-2026-10-02 -> fix/audit-2026-10)

Scope: all kept P0/P1 (only MVA-001) plus adjacent MVA-007. Nothing pushed.

| ID | Status | Commit | Evidence | Remaining |
|---|---|---|---|---|
| MVA-001 | fixed | 85b3b12 | `npm audit --omit=dev`: 12 vulns -> 0. vitest 12 files/456 tests pass; `npm run build` ok (npm 10). | See notes |
| MVA-007 | fixed (partial) | 4f2f1c1 | vitest 13 files/457 pass (+1 sanitizer regression test); build ok | not browser-tested manually (later verified in REVIEW.md) |

## MVA-001 details
- Removed html2pdf.js (and jspdf) - export stack was dead (no #export-pdf-btn in index.html, MVA-043): deleted PDFService.js, script.js PDF modal wiring/import/window.html2pdf, orphaned #pdf-modal markup, eslint global.
- dompurify -> ^3.4.16, mermaid -> ^11.17.2 (clears lodash-es/chevrotain/langium chain), katex pinned 0.19.0 via dependency + overrides (GHSA-238p-pmpm-9mq7, incl. mermaid's nested copy), uuid fixed by npm audit fix.
- Removed pnpm-lock.yaml; single regenerated package-lock.json.
- README security bullet and AGENTS.md stack line made accurate.
- Remaining: katex 0.16 -> 0.19 and mermaid 11.12 -> 11.17 not visually verified in a browser (unit tests/build only). Export Studio (inline index.html) was not touched. HTMLService.js still imported but only used by now-dead exportHTML (MVA-043 remainder). No npm-audit CI gate added (P-lower).

## MVA-007 details
- Sanitizer: iframe removed from ADD_TAGS, FORBID_TAGS for iframe/frame/frameset/object/embed/portal, iframe-only attrs dropped. PDF Node branch removed with PDFService.
- Added CSP meta in index.html (frame-src none, object-src none, base-uri self, connect/img limited to self/https). Risk: CSP is untested in a real browser; if Export Studio or Google Fonts misbehave, relax directive.
