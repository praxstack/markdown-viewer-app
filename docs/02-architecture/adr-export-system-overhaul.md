# ADR: Export System Overhaul — Replace html2pdf.js with Browser Print API

**Date:** February 20, 2026  
**Status:** Proposed  
**Deciders:** Prax Lannister  
**Supersedes:** Current html2pdf.js-based PDF export

---

## Context

The current PDF export uses `html2pdf.js` (which wraps html2canvas + jsPDF). It has multiple issues:

- Crashes on CSS `color-mix()` — required a `pdf-export-mode` hack
- Rasterizes DOM to canvas — losing text selectability and vector quality
- Font picker fonts don't survive export (no font embedding)
- Mermaid SVG diagrams may fail (timing/rendering issues)
- KaTeX math rendering is fragile
- Safari needs special color sanitization hacks
- Adds ~150KB to bundle size
- Complex PDF modal recreates settings the browser print dialog already provides

## Decision

**Replace html2pdf.js with Browser Print API (`window.print()`) + `@media print` CSS.**

### How It Works

1. User clicks "Export PDF"
2. A new window opens with ONLY the rendered markdown content + print stylesheet
3. `window.print()` is called — browser shows native Save as PDF dialog
4. User saves — gets a perfect vector PDF

### What Changes

| Removed                              | Added                              |
| ------------------------------------ | ---------------------------------- |
| `html2pdf.js` dependency (~150KB)    | `print.css` (~50 lines)            |
| `PDFService.js` (410 lines)          | Print preview function (~30 lines) |
| PDF settings modal (HTML + CSS + JS) | Export dropdown component          |
| `pdf-export-mode` CSS hack           | —                                  |
| Safari color sanitization            | —                                  |

### Export Dropdown (replaces two buttons)

```
[Export ▼]
├── PDF — Opens print-optimized view with Save as PDF
├── HTML — Downloads standalone .html file
└── Copy HTML — Copies rendered HTML to clipboard
```

## Why This Is Better

| Dimension             | html2pdf.js (current)        | Print CSS (proposed)           |
| --------------------- | ---------------------------- | ------------------------------ |
| **Text quality**      | Rasterized (blurry at zoom)  | Vector (crisp at any zoom)     |
| **Text selectable**   | No (it's an image)           | Yes                            |
| **Font picker fonts** | Not supported                | Automatic (browser loads them) |
| **Mermaid diagrams**  | Fragile (canvas rendering)   | Perfect (SVG → vector)         |
| **KaTeX math**        | Fragile                      | Perfect (HTML/CSS)             |
| **Bundle size**       | +150KB                       | 0KB (browser API)              |
| **Browser compat**    | Needs hacks for Safari       | Works natively everywhere      |
| **Page settings**     | Custom modal (buggy)         | Native print dialog (reliable) |
| **Code complexity**   | ~500 lines + hacks           | ~80 lines total                |
| **Dark theme**        | Exports dark (bad for print) | Forces light mode for print    |

## Trade-offs

**Con: User sees print dialog**  
This is intentional. The native print dialog handles page size, orientation, margins, headers/footers — all things the current PDF modal tries to replicate badly. Users are familiar with Ctrl+P → Save as PDF.

**Con: No programmatic PDF blob**  
True — we can't programmatically create a PDF file without user interaction. This is acceptable for a markdown viewer where export is an explicit user action.

## Revised Design: "Export Studio" Window

The Export Studio is a new browser window with a toolbar + fully-resolved content:

```
┌─────────────────────────────────────────────────┐
│ EXPORT STUDIO TOOLBAR (hidden in print)         │
│ [A4 ▼] [Portrait ▼] [Normal margins ▼] [Light] │
│ [ Print / Save PDF ]  [ Download HTML ]         │
├─────────────────────────────────────────────────┤
│                                                 │
│   RENDERED MARKDOWN (all styles resolved)       │
│   • Font picker fonts via Google Fonts @import  │
│   • All CSS vars → computed hex values          │
│   • KaTeX CSS embedded                          │
│   • Mermaid SVGs inline                         │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Style Preservation Strategy

For EVERY export, we resolve ALL CSS variables to computed values:

| What             | How                                                             | Result                                      |
| ---------------- | --------------------------------------------------------------- | ------------------------------------------- |
| Font picker font | Read `--font-picker-preview` → computed `'Merriweather', serif` | `<link>` Google Font + inline `font-family` |
| Font size        | Read `--font-picker-size` → `18px`                              | Inline `font-size: 18px`                    |
| Theme colors     | Read all `--h1-color`, `--bg-primary` etc → hex                 | Inline CSS block                            |
| Syntax theme     | Resolve `--syntax-*` vars → values                              | Inline `<style>`                            |
| Code font        | Read `--font-picker-code` → computed                            | Inline on `pre, code`                       |

The exported content is **self-contained** — no CSS variables, no external deps except Google Fonts CDN.

### PDF Page Controls (via dynamic `@page` CSS)

| Control     | Options                                | Injected CSS                    |
| ----------- | -------------------------------------- | ------------------------------- |
| Page Size   | A4, Letter, Legal                      | `@page { size: A4; }`           |
| Orientation | Portrait, Landscape                    | `@page { size: A4 landscape; }` |
| Margins     | Narrow (1cm), Normal (2cm), Wide (3cm) | `@page { margin: 2cm; }`        |
| Theme       | Light (forced), Current theme          | Inline color overrides          |

User selects in toolbar → content updates live → click "Print / Save PDF" → browser dialog with settings pre-applied.

### Both Exports Produce Identical Output

- PDF = `window.print()` on the resolved content with `@page` rules
- HTML = download the same resolved content as `.html` file
- Font picker fonts, theme colors, size, margins — all preserved in both formats

## Implementation Plan

1. Build Export Studio window (HTML template + toolbar + resolved content)
2. Build style resolution engine (`getComputedStyle` → inline CSS)
3. Build `@page` CSS injection (page size, orientation, margins)
4. Build Export dropdown trigger in toolbar
5. Wire PDF export (`window.print()` on Export Studio)
6. Wire HTML export (download Export Studio content)
7. Wire Copy HTML (clipboard)
8. Remove html2pdf.js, PDFService.js, PDF modal, pdf-export-mode hack
9. Update package.json, tests, docs

**Estimated effort:** 3-4 hours  
**Bundle savings:** ~150KB  
**Lines removed:** ~500+  
**Lines added:** ~250
