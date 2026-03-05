# Markdown Viewer Pro — UI/UX Complete Overhaul Blueprint

**Date:** February 20, 2026
**Role:** Frontend Principal Engineer
**Approach:** Design-system-first, phased overhaul
**Stack:** Vanilla JS + CSS Custom Properties (no framework migration)

---

## Table of Contents

1. [Design System Foundation](#1-design-system-foundation)
2. [Current UI Audit Findings](#2-current-ui-audit-findings)
3. [Typography Overhaul](#3-typography-overhaul)
4. [Color System Redesign](#4-color-system-redesign)
5. [Layout & Spatial Architecture](#5-layout--spatial-architecture)
6. [Component Redesign](#6-component-redesign)
7. [Accessibility Overhaul](#7-accessibility-overhaul)
8. [Animation & Motion System](#8-animation--motion-system)
9. [Responsive Strategy](#9-responsive-strategy)
10. [Implementation Phases](#10-implementation-phases)

---

## 1. Design System Foundation

### Aesthetic Direction: "Refined Developer Studio"

Not cyberpunk. Not brutalist. Not generic SaaS. This is a **precision instrument for developers** — think VS Code meets Notion meets iA Writer. The aesthetic is:

- **Intentional minimalism** — every pixel earns its place
- **Warm dark mode as default** — not pure black (#000), warm charcoal (#1a1b26)
- **Surgical color accents** — one dominant accent per theme, never competing
- **Typographic hierarchy as the primary design element** — the text IS the product
- **Depth through subtle layering** — not flat, not skeuomorphic, but layered with purpose

### Design Tokens (CSS Custom Properties)

```css
/* === Z-INDEX SCALE (replacing arbitrary values) === */
--z-base: 0;
--z-raised: 10; /* Cards, panels above base */
--z-sidebar: 20; /* Sidebar overlay */
--z-toolbar: 30; /* Sticky toolbar */
--z-dropdown: 40; /* Dropdowns, tooltips */
--z-modal-backdrop: 50; /* Modal overlay */
--z-modal: 60; /* Modal content */
--z-toast: 70; /* Toast notifications */
--z-max: 100; /* Critical overlays only */

/* === SPACING SCALE (8px grid) === */
--space-1: 4px; /* Tight: icon gaps */
--space-2: 8px; /* Default: inline spacing */
--space-3: 12px; /* Compact: button padding */
--space-4: 16px; /* Standard: section padding */
--space-5: 24px; /* Comfortable: card padding */
--space-6: 32px; /* Roomy: section gaps */
--space-7: 48px; /* Large: major sections */
--space-8: 64px; /* XL: page-level spacing */

/* === BORDER RADIUS SCALE === */
--radius-sm: 4px; /* Buttons, inputs */
--radius-md: 8px; /* Cards, panels */
--radius-lg: 12px; /* Modals, large containers */
--radius-xl: 16px; /* Feature cards */
--radius-full: 9999px; /* Pills, avatars */

/* === SHADOW SCALE === */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
--shadow-inner: inset 0 2px 4px rgba(0, 0, 0, 0.06);
--shadow-glow: 0 0 20px rgba(var(--accent-rgb), 0.15);

/* === TRANSITION PRESETS === */
--ease-default: cubic-bezier(0.4, 0, 0.2, 1); /* General */
--ease-in: cubic-bezier(0.4, 0, 1, 1); /* Exiting */
--ease-out: cubic-bezier(0, 0, 0.2, 1); /* Entering */
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1); /* Playful */
--duration-fast: 150ms; /* Micro-interactions */
--duration-normal: 250ms; /* Standard transitions */
--duration-slow: 400ms; /* Layout changes */

/* === TOUCH TARGETS === */
--touch-min: 44px; /* Minimum interactive element size */
--touch-comfortable: 48px; /* Preferred interactive element size */
```

---

## 2. Current UI Audit Findings

### 🔴 Critical Issues (Must Fix)

| #   | Issue                                                                                                                                                                                                                       | Location             | Impact                                                                    |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------- |
| 1   | **No focus styles on most interactive elements** — `.btn`, `.view-btn`, `.zoom-btn`, `.mobile-tab-btn`, `.support-button`, `#theme-selector`, `.tree-item`, modal close buttons all lack `:focus` / `:focus-visible` styles | `style.css` globally | Keyboard users cannot see which element is focused — WCAG 2.4.7 violation |
| 2   | **Textarea `outline: none` with no replacement** — `#markdown-editor` at line 165 removes outline with no custom focus indicator                                                                                            | `style.css:165`      | Editor textarea is invisible to keyboard navigation                       |
| 3   | **No skip-to-content link** — nav-heavy toolbar requires many tabs to reach content                                                                                                                                         | `index.html`         | Keyboard users must tab through 15+ toolbar buttons to reach editor       |
| 4   | **No `prefers-reduced-motion` support** — zero instances of `@media (prefers-reduced-motion)` in any CSS file                                                                                                               | All CSS              | Motion-sensitive users have no way to disable animations — WCAG 2.3.3     |
| 5   | **Buttons without aria-labels** — icon-only buttons like zoom +/−, view mode toggles, sidebar collapse have no text alternative                                                                                             | `index.html`         | Screen readers announce "button" with no context                          |
| 6   | **No `role` attributes** — zero `role=` found in `index.html`                                                                                                                                                               | `index.html`         | Landmark regions not identified for assistive tech                        |

### 🟡 Moderate Issues

| #   | Issue                                                                                                                    | Location                  | Impact                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------- | ---------------------------------------------------------- |
| 7   | **Z-index chaos** — values are 100, 10, 1000, 50, -1, 1001, 200, 3, 100000 with no system                                | `style.css`               | Stacking bugs, elements hidden behind others unpredictably |
| 8   | **Inconsistent border-radius** — 30+ declarations with values: 3px, 4px, 5px, 6px, 8px, 10px, 12px, 50%, no scale        | `style.css`               | Visual inconsistency across components                     |
| 9   | **Inconsistent transitions** — mix of 0.2s, 0.3s, 0.25s, 0.4s, 0.15s, 0.5s, 200ms, 300ms with varying easing             | `style.css`               | Animations feel disconnected, no unified motion language   |
| 10  | **Touch targets too small** — toolbar buttons are ~32px, below 44px minimum                                              | `style.css`, `index.html` | Touch users struggle to tap toolbar buttons                |
| 11  | **Font stack is generic** — `system-ui, -apple-system, sans-serif` for UI, `Consolas, Monaco, Courier New` for editor    | `style.css`               | No distinctive typography, looks like every other app      |
| 12  | **No error announcements** — error states use visual-only indicators (red borders) with no `aria-live` or `role="alert"` | `index.html`              | Screen readers don't announce errors                       |

### 🟢 What's Already Good

| #   | Strength                                     | Notes                                                                |
| --- | -------------------------------------------- | -------------------------------------------------------------------- |
| ✅  | CSS custom properties for theming            | 25+ variables per theme — excellent foundation                       |
| ✅  | Heading anchor `:focus-visible`              | Lines 250-261 correctly implement focus rings on heading links       |
| ✅  | Form input focus states                      | Lines 1893-1929 replace outline with box-shadow ring — acceptable    |
| ✅  | Browser actions button focus                 | Line 1984 has proper `:focus` / `:focus:not(:focus-visible)` pairing |
| ✅  | `cursor: pointer` on most clickable elements | ~15 instances across buttons, tree items, modals                     |
| ✅  | Hover states on key elements                 | ~40+ `:hover` rules with background/color transitions                |

---

## 3. Typography Overhaul

### Current Problem

The app uses generic system fonts (`system-ui, -apple-system, sans-serif`) for UI and (`Consolas, Monaco, Courier New`) for the editor. These are safe but forgettable — they make the app look like a browser default.

### Recommended Font Pairing: **"Developer Mono"**

| Role             | Font           | Weights                 | Usage                                               |
| ---------------- | -------------- | ----------------------- | --------------------------------------------------- |
| **UI / Body**    | IBM Plex Sans  | 300, 400, 500, 600, 700 | Toolbar labels, sidebar text, modal content, footer |
| **Headings**     | JetBrains Mono | 500, 600, 700           | App title, section headers, feature labels          |
| **Editor**       | JetBrains Mono | 400, 500                | Markdown editor textarea                            |
| **Preview Code** | JetBrains Mono | 400                     | Code blocks in rendered markdown                    |
| **Preview Body** | IBM Plex Sans  | 400, 500                | Rendered markdown prose                             |

**Why this pairing:**

- JetBrains Mono is the gold standard for code editors — ligatures, clear distinction between similar characters (0/O, 1/l/I)
- IBM Plex Sans is the most readable humanist sans-serif designed specifically for developer UIs (used by IBM Carbon Design System)
- Both have excellent Unicode coverage, mathematical symbols, and icon support
- Both are free, open-source, and on Google Fonts

### CSS Implementation

```css
/* Load via Google Fonts (add to index.html <head>) */
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

/* Typography scale (based on 1.25 ratio) */
:root {
  --font-ui: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;

  --text-xs: 0.75rem; /* 12px — captions, badges */
  --text-sm: 0.875rem; /* 14px — secondary text, sidebar */
  --text-base: 1rem; /* 16px — body text */
  --text-lg: 1.125rem; /* 18px — emphasized body */
  --text-xl: 1.25rem; /* 20px — section titles */
  --text-2xl: 1.5rem; /* 24px — page titles */
  --text-3xl: 1.875rem; /* 30px — hero text */

  --leading-tight: 1.25; /* Headings */
  --leading-normal: 1.5; /* UI text */
  --leading-relaxed: 1.75; /* Long-form reading (preview) */

  --tracking-tight: -0.02em; /* Large headings */
  --tracking-normal: 0; /* Body */
  --tracking-wide: 0.025em; /* Small caps, labels */
}

/* Application */
body {
  font-family: var(--font-ui);
}
#markdown-editor {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}
.preview-content code {
  font-family: var(--font-mono);
}
.top-bar {
  font-family: var(--font-ui);
  font-weight: 500;
}
```

### Line Length Control

```css
/* Optimal reading width: 65-75 characters */
.preview-content .markdown-body {
  max-width: 72ch; /* ~720px at 16px base */
  margin: 0 auto;
  padding: 0 var(--space-5);
}
```

---

## 4. Color System Redesign

### Current State

Your theme system is already excellent — 25+ CSS variables per theme, 7 theme families. The problem isn't the themes themselves but the **base semantic layer** that the themes plug into.

### Proposed Semantic Color Architecture

Every theme must provide these semantic tokens. The app references ONLY semantic tokens, never raw hex:

```css
:root {
  /* === SURFACE LAYERS (background hierarchy) === */
  --surface-0: /* deepest background (app shell) */;
  --surface-1: /* primary panels (editor, preview) */;
  --surface-2: /* elevated elements (cards, dropdowns) */;
  --surface-3: /* highest elevation (tooltips, popovers) */;

  /* === TEXT HIERARCHY === */
  --text-primary: /* main content — contrast ≥ 7:1 on surface-1 */;
  --text-secondary: /* descriptions, labels — contrast ≥ 4.5:1 */;
  --text-tertiary: /* placeholders, disabled — contrast ≥ 3:1 */;
  --text-inverse: /* text on accent/CTA backgrounds */;

  /* === INTERACTIVE STATES === */
  --accent: /* primary brand/action color */;
  --accent-hover: /* hover state of accent */;
  --accent-active: /* active/pressed state */;
  --accent-subtle: /* low-emphasis accent backgrounds */;
  --accent-rgb: /* RGB triplet for rgba() usage, e.g., 59, 130, 246 */;

  /* === SEMANTIC FEEDBACK === */
  --success: #22c55e;
  --success-subtle: rgba(34, 197, 94, 0.1);
  --warning: #f59e0b;
  --warning-subtle: rgba(245, 158, 11, 0.1);
  --error: #ef4444;
  --error-subtle: rgba(239, 68, 68, 0.1);
  --info: #3b82f6;
  --info-subtle: rgba(59, 130, 246, 0.1);

  /* === BORDERS & DIVIDERS === */
  --border-default: /* subtle divider lines */;
  --border-strong: /* emphasized borders (focus, active) */;
  --border-interactive: /* borders on interactive elements */;

  /* === FOCUS RING (used globally) === */
  --focus-ring: var(--accent);
  --focus-ring-offset: var(--surface-1);
}
```

### Default Dark Theme: "Midnight Studio"

```css
[data-theme='default-dark'] {
  --surface-0: #0f1117; /* App background — warm near-black */
  --surface-1: #1a1b26; /* Panels — warm charcoal (NOT pure #1e1e1e) */
  --surface-2: #24283b; /* Elevated — subtle blue undertone */
  --surface-3: #2f3348; /* Highest — dropdown/tooltip */

  --text-primary: #c0caf5; /* Soft lavender-white (not harsh #fff) */
  --text-secondary: #7982a9; /* Muted blue-gray */
  --text-tertiary: #565f89; /* Subtle hint text */

  --accent: #7aa2f7; /* Calm blue — professional, not playful */
  --accent-hover: #89b4fa;
  --accent-active: #6a92e7;
  --accent-subtle: rgba(122, 162, 247, 0.1);
  --accent-rgb: 122, 162, 247;

  --border-default: rgba(255, 255, 255, 0.06);
  --border-strong: rgba(255, 255, 255, 0.12);
  --border-interactive: var(--accent);
}
```

### Default Light Theme: "Paper Studio"

```css
[data-theme='default-light'] {
  --surface-0: #f0f0f3; /* Warm off-white (not pure #fff) */
  --surface-1: #ffffff; /* Panels — clean white */
  --surface-2: #f8f9fc; /* Elevated — barely warm */
  --surface-3: #ffffff; /* Highest — white with shadow for depth */

  --text-primary: #1a1b26; /* Same charcoal as dark bg — creates visual bridge */
  --text-secondary: #6b7280; /* True mid-gray — contrast 4.5:1 ✓ */
  --text-tertiary: #9ca3af; /* Light gray — contrast 3:1 ✓ */

  --accent: #4f6df5; /* Slightly deeper blue for light bg contrast */
  --accent-hover: #4361ee;
  --accent-active: #3a56d4;
  --accent-subtle: rgba(79, 109, 245, 0.08);
  --accent-rgb: 79, 109, 245;

  --border-default: rgba(0, 0, 0, 0.06);
  --border-strong: rgba(0, 0, 0, 0.12);
  --border-interactive: var(--accent);
}
```

### Migration Path

The existing `--bg-primary`, `--text-primary` etc. variables map directly to the new semantic tokens. Create an alias layer in `variables.css`:

```css
/* Backward compatibility — map old names to new semantic tokens */
:root {
  --bg-primary: var(--surface-1);
  --bg-secondary: var(--surface-2);
  /* ... migrate one variable at a time */
}
```

---

## 5. Layout & Spatial Architecture

### Current Layout Problems

1. **Toolbar is visually cramped** — buttons are packed with inconsistent spacing
2. **Sidebar has no visual hierarchy** — flat list of files with minimal depth
3. **Split-view resizer is thin and hard to grab** — only a few pixels wide
4. **Footer competes for attention** — always visible, not contextual
5. **Modals lack backdrop blur** — appear without depth

### Proposed Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  [Skip to Content]  (hidden, visible on focus)              │
├─────────────────────────────────────────────────────────────┤
│  TOOLBAR (48px height, var(--z-toolbar))                    │
│  ┌──────┬──────────────────────┬───────────────────────┐    │
│  │ Logo │  Actions (grouped)   │  Theme │ View │ Export │    │
│  └──────┴──────────────────────┴───────────────────────┘    │
├──────────┬─────────────────────┬────────────────────────────┤
│ SIDEBAR  │  EDITOR             │  PREVIEW                   │
│ (240px)  │  (flex: 1)          │  (flex: 1)                 │
│          │                     │                            │
│ File     │  Markdown textarea  │  Rendered output           │
│ Browser  │  with line numbers  │  with scroll sync          │
│          │                     │                            │
│ Tree     │  JetBrains Mono     │  IBM Plex Sans             │
│ View     │  14px               │  16px, max-width: 72ch     │
│          │                     │                            │
│ Resize ──┤  ────── Resizer ────┤                            │
│ Handle   │  (8px, cursor: col) │                            │
├──────────┴─────────────────────┴────────────────────────────┤
│  FOOTER (contextual — auto-hide after 3s, show on hover)    │
└─────────────────────────────────────────────────────────────┘
```

### Toolbar Redesign

```css
/* Toolbar: grouped actions with visual separators */
.top-bar {
  height: var(--touch-comfortable); /* 48px */
  padding: 0 var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--surface-1);
  border-bottom: 1px solid var(--border-default);
  z-index: var(--z-toolbar);
}

/* Action groups separated by subtle dividers */
.toolbar-group {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: 0 var(--space-2);
}

.toolbar-group + .toolbar-group {
  border-left: 1px solid var(--border-default);
}

.toolbar-group:last-child {
  margin-left: auto; /* Push right-side actions to edge */
}
```

### Split-View Resizer Upgrade

```css
/* Wider grab area with visual indicator */
.split-resizer {
  width: 8px;
  cursor: col-resize;
  background: var(--surface-0);
  position: relative;
  transition: background var(--duration-fast) var(--ease-default);
  flex-shrink: 0;
}

.split-resizer::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--border-strong);
  transition: background var(--duration-fast) var(--ease-default);
}

.split-resizer:hover,
.split-resizer:active {
  background: var(--accent-subtle);
}

.split-resizer:hover::after,
.split-resizer:active::after {
  background: var(--accent);
}
```

### Contextual Footer

```css
/* Footer auto-hides, appears on hover at bottom */
.app-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  transform: translateY(100%);
  transition: transform var(--duration-normal) var(--ease-out);
  background: var(--surface-2);
  backdrop-filter: blur(12px);
  z-index: var(--z-raised);
}

.app-footer:hover,
.app-footer:focus-within {
  transform: translateY(0);
}
```

---

## 6. Component Redesign

### Button System

Three variants, one consistent system:

```css
/* === BASE BUTTON === */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  min-height: var(--touch-min); /* 44px touch target */
  min-width: var(--touch-min);
  padding: var(--space-2) var(--space-3);
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  font-weight: 500;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-default);
  user-select: none;
}

/* Primary: filled accent */
.btn--primary {
  background: var(--accent);
  color: var(--text-inverse);
  border-color: var(--accent);
}
.btn--primary:hover {
  background: var(--accent-hover);
}
.btn--primary:active {
  background: var(--accent-active);
  transform: scale(0.98);
}

/* Secondary: outlined */
.btn--secondary {
  background: transparent;
  color: var(--text-primary);
  border-color: var(--border-strong);
}
.btn--secondary:hover {
  background: var(--surface-2);
  border-color: var(--accent);
}

/* Ghost: minimal */
.btn--ghost {
  background: transparent;
  color: var(--text-secondary);
  border-color: transparent;
}
.btn--ghost:hover {
  background: var(--surface-2);
  color: var(--text-primary);
}

/* Icon-only button (toolbar) */
.btn--icon {
  padding: var(--space-2);
  min-width: var(--touch-min);
  min-height: var(--touch-min);
  border-radius: var(--radius-sm);
}

/* Active state for toggle buttons (view mode, zen) */
.btn--active,
.btn[aria-pressed='true'] {
  background: var(--accent-subtle);
  color: var(--accent);
  border-color: var(--accent);
}
```

### Theme Selector Redesign

Replace the native `<select>` with a custom dropdown for visual consistency:

```css
/* Custom theme selector with theme preview swatches */
.theme-selector {
  position: relative;
  min-width: 180px;
}

.theme-selector__trigger {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  min-height: var(--touch-min);
  background: var(--surface-2);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.theme-selector__swatch {
  width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  border: 2px solid var(--border-strong);
  /* Color set dynamically per theme */
}

.theme-selector__dropdown {
  position: absolute;
  top: calc(100% + var(--space-1));
  left: 0;
  right: 0;
  background: var(--surface-3);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-dropdown);
  max-height: 320px;
  overflow-y: auto;
}

.theme-selector__option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-default);
}

.theme-selector__option:hover {
  background: var(--accent-subtle);
}
```

### Modal Redesign

```css
/* Modal with backdrop blur and smooth entrance */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  z-index: var(--z-modal-backdrop);
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-default);
}

.modal-backdrop.active {
  opacity: 1;
}

.modal-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.95);
  background: var(--surface-2);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  z-index: var(--z-modal);
  max-width: 560px;
  width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
  opacity: 0;
  transition: all var(--duration-normal) var(--ease-out);
}

.modal-content.active {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}
```

### Sidebar File Tree Redesign

```css
/* File tree with depth indicators and hover states */
.tree-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  min-height: 36px;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-default);
  margin: 1px 0;
}

.tree-item:hover {
  background: var(--surface-2);
  color: var(--text-primary);
}

.tree-item--active {
  background: var(--accent-subtle);
  color: var(--accent);
  font-weight: 500;
}

/* Indent levels via CSS nesting */
.tree-item[data-depth='1'] {
  padding-left: calc(var(--space-3) + 16px);
}
.tree-item[data-depth='2'] {
  padding-left: calc(var(--space-3) + 32px);
}
.tree-item[data-depth='3'] {
  padding-left: calc(var(--space-3) + 48px);
}

/* File type icons via SVG (not emoji) */
.tree-item__icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  opacity: 0.7;
}
```

---

## 7. Accessibility Overhaul

### Global Focus Ring System

One rule to fix the biggest WCAG violation:

```css
/* === UNIVERSAL FOCUS RING === */
/* Applied to ALL interactive elements via :focus-visible */
:focus-visible {
  outline: 2px solid var(--focus-ring, var(--accent));
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* Remove default outline only when custom focus is active */
:focus:not(:focus-visible) {
  outline: none;
}

/* Editor textarea — subtle inner glow instead of outline */
#markdown-editor:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 2px var(--accent);
}
```

### Skip-to-Content Link

Add as the FIRST element inside `<body>`:

```html
<a href="#markdown-editor" class="skip-link"> Skip to editor </a>
<a href="#preview" class="skip-link"> Skip to preview </a>
```

```css
.skip-link {
  position: absolute;
  top: -100%;
  left: var(--space-4);
  padding: var(--space-2) var(--space-4);
  background: var(--accent);
  color: var(--text-inverse);
  font-family: var(--font-ui);
  font-weight: 600;
  border-radius: 0 0 var(--radius-sm) var(--radius-sm);
  z-index: var(--z-max);
  transition: top var(--duration-fast) var(--ease-out);
}

.skip-link:focus {
  top: 0;
}
```

### ARIA Landmarks

Add to `index.html`:

```html
<header role="banner" class="top-bar">...</header>
<nav role="navigation" aria-label="File browser" class="sidebar">...</nav>
<main role="main" id="main-content">
  <section aria-label="Markdown editor" class="editor-container">...</section>
  <section aria-label="Preview" class="preview-container">...</section>
</main>
<footer role="contentinfo" class="app-footer">...</footer>
```

### Icon Button Aria Labels

Every icon-only button needs an `aria-label`:

```html
<!-- Zoom controls -->
<button class="btn btn--icon" aria-label="Zoom in">
  <svg><!-- + icon --></svg>
</button>
<button class="btn btn--icon" aria-label="Zoom out">
  <svg><!-- - icon --></svg>
</button>

<!-- View mode toggles -->
<button class="btn btn--icon" aria-label="Editor only" aria-pressed="false">
  <svg><!-- editor icon --></svg>
</button>
<button class="btn btn--icon" aria-label="Split view" aria-pressed="true">
  <svg><!-- split icon --></svg>
</button>
<button class="btn btn--icon" aria-label="Preview only" aria-pressed="false">
  <svg><!-- preview icon --></svg>
</button>

<!-- Sidebar toggle -->
<button class="btn btn--icon" aria-label="Toggle file browser" aria-expanded="true">
  <svg><!-- sidebar icon --></svg>
</button>

<!-- Zen mode -->
<button class="btn btn--icon" aria-label="Toggle zen mode" aria-pressed="false">
  <svg><!-- zen icon --></svg>
</button>
```

### Error Announcements

```html
<!-- Add to index.html for dynamic error messages -->
<div id="live-region" aria-live="polite" aria-atomic="true" class="sr-only"></div>
```

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

```javascript
// Announce errors to screen readers
function announce(message) {
  const region = document.getElementById('live-region');
  region.textContent = message;
  setTimeout(() => {
    region.textContent = '';
  }, 5000);
}
```

### Color Contrast Requirements

| Element            | Min Contrast       | Current                | Fix                                   |
| ------------------ | ------------------ | ---------------------- | ------------------------------------- |
| Body text on dark  | 7:1                | Check per theme        | Audit all 16 theme files              |
| Body text on light | 7:1                | Check per theme        | Audit all 16 theme files              |
| Secondary text     | 4.5:1              | Varies                 | Ensure `--text-secondary` meets ratio |
| Placeholder text   | 3:1                | Not checked            | Add `--text-tertiary` with 3:1 min    |
| Error text         | 4.5:1              | Red on dark — may fail | Use `--error` with contrast check     |
| Link text          | 3:1 vs surrounding | Not distinguished      | Add underline OR 3:1 contrast         |

---

## 8. Animation & Motion System

### Unified Motion Language

Replace the 8+ different durations/easings scattered across `style.css` with a single system:

```css
/* === MOTION TOKENS (already defined in Section 1) === */
/* Use ONLY these — never raw duration/easing values */

/* Micro-interactions: button hover, toggle, icon color change */
.micro-transition {
  transition-duration: var(--duration-fast); /* 150ms */
  transition-timing-function: var(--ease-default);
}

/* Standard transitions: panel slide, dropdown open, card expand */
.standard-transition {
  transition-duration: var(--duration-normal); /* 250ms */
  transition-timing-function: var(--ease-out);
}

/* Layout transitions: sidebar collapse, view mode switch, modal */
.layout-transition {
  transition-duration: var(--duration-slow); /* 400ms */
  transition-timing-function: var(--ease-out);
}
```

### `prefers-reduced-motion` (Critical Missing Feature)

Add to the END of `style.css`:

```css
/* === REDUCED MOTION === */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Key Animations

```css
/* Modal entrance */
@keyframes modal-enter {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

/* Sidebar slide */
@keyframes slide-in-left {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Toast notification */
@keyframes slide-in-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Skeleton loading pulse */
@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
}

.skeleton {
  background: var(--surface-2);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm);
}
```

### Performance Rules

1. **ONLY animate `transform` and `opacity`** — never width, height, top, left, margin, padding
2. **Use `will-change` sparingly** — only on elements that actively animate
3. **Avoid `transition: all`** — explicitly list properties: `transition: background var(--duration-fast), color var(--duration-fast)`
4. **Cap animation duration at 400ms** for UI elements — longer feels sluggish

---

## 9. Responsive Strategy

### Breakpoint System

```css
/* Mobile-first breakpoints (min-width) */
--bp-sm: 640px; /* Large phones */
--bp-md: 768px; /* Tablets */
--bp-lg: 1024px; /* Small laptops */
--bp-xl: 1280px; /* Desktops */
--bp-2xl: 1536px; /* Large monitors */
```

### Layout Behavior by Breakpoint

| Breakpoint      | Sidebar             | Editor               | Preview              | Toolbar             |
| --------------- | ------------------- | -------------------- | -------------------- | ------------------- |
| **< 768px**     | Hidden (overlay)    | Full width OR hidden | Full width OR hidden | Compact (hamburger) |
| **768–1024px**  | Collapsible (240px) | 50%                  | 50%                  | Full, single row    |
| **1024–1280px** | Persistent (240px)  | Flex                 | Flex                 | Full with labels    |
| **> 1280px**    | Persistent (280px)  | Flex                 | Flex                 | Full with labels    |

### Mobile Adaptations

```css
/* === MOBILE (< 768px) === */
@media (max-width: 767px) {
  /* Stack editor/preview as tabs, not side-by-side */
  .main-content {
    flex-direction: column;
  }

  /* Sidebar becomes overlay drawer */
  .sidebar {
    position: fixed;
    inset: 0;
    z-index: var(--z-sidebar);
    transform: translateX(-100%);
    transition: transform var(--duration-normal) var(--ease-out);
    background: var(--surface-1);
    width: 280px;
    max-width: 85vw;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  /* Overlay backdrop when sidebar is open */
  .sidebar-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: calc(var(--z-sidebar) - 1);
  }

  /* Compact toolbar */
  .top-bar {
    padding: 0 var(--space-2);
  }

  .toolbar-group--hideable {
    display: none;
  }

  /* Bottom tab bar for view switching */
  .mobile-tab-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: var(--touch-comfortable);
    display: flex;
    background: var(--surface-1);
    border-top: 1px solid var(--border-default);
    z-index: var(--z-toolbar);
  }

  .mobile-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: var(--touch-min);
  }

  /* Hide split resizer on mobile */
  .split-resizer {
    display: none;
  }

  /* Ensure minimum font size */
  body {
    font-size: var(--text-base);
  } /* 16px minimum */
  #markdown-editor {
    font-size: var(--text-base);
  } /* Prevent zoom on focus */
}

/* === TABLET (768–1024px) === */
@media (min-width: 768px) and (max-width: 1023px) {
  .sidebar {
    width: 200px;
  }

  .mobile-tab-bar {
    display: none;
  }
}

/* === DESKTOP (1024px+) === */
@media (min-width: 1024px) {
  .sidebar {
    width: 240px;
  }

  .mobile-tab-bar {
    display: none;
  }
}
```

---

## 10. Implementation Phases

### Phase 1: Foundation (Week 1) — Zero Visual Change

**Goal:** Lay the design token infrastructure without changing any visible UI.

| Task                                                                                       | Files                     | Risk                                  |
| ------------------------------------------------------------------------------------------ | ------------------------- | ------------------------------------- |
| Add design tokens to `variables.css` (z-index, spacing, radius, shadow, transition, touch) | `variables.css`           | None — just adding new vars           |
| Add Google Fonts link for JetBrains Mono + IBM Plex Sans                                   | `index.html`              | None — fonts load in background       |
| Add `prefers-reduced-motion` media query                                                   | `style.css`               | None — only affects motion-pref users |
| Add skip-to-content links (hidden by default)                                              | `index.html`, `style.css` | None — invisible until focused        |
| Add `aria-label` to all icon-only buttons                                                  | `index.html`              | None — invisible to sighted users     |
| Add ARIA landmark roles                                                                    | `index.html`              | None — invisible to sighted users     |
| Add `aria-live` region for announcements                                                   | `index.html`              | None — invisible                      |
| Add `.sr-only` utility class                                                               | `style.css`               | None                                  |

**Verification:** Run test suite — all 446 tests should still pass. Visually identical.

### Phase 2: Token Migration (Week 2) — Gradual Swap

**Goal:** Replace hardcoded values with design tokens, one property at a time.

| Task                                             | Strategy                                    | Risk                                  |
| ------------------------------------------------ | ------------------------------------------- | ------------------------------------- |
| Replace all z-index values with `--z-*` tokens   | Find-and-replace in `style.css`             | Low — values map 1:1                  |
| Replace border-radius values with `--radius-*`   | Map: 3-4px→sm, 6-8px→md, 10-12px→lg         | Low — visual change is subtle         |
| Replace transition durations with `--duration-*` | Map: 0.15s→fast, 0.2-0.3s→normal, 0.4s→slow | Low — timing changes are subtle       |
| Replace font-family declarations with `--font-*` | Map existing stacks to new variables        | Medium — typography change is visible |
| Add universal `:focus-visible` rule              | One CSS rule fixes all focus states         | Low — only affects keyboard users     |

**Verification:** Visual regression test each change. Run test suite.

### Phase 3: Semantic Colors (Week 3) — Theme Layer

**Goal:** Add semantic color layer that existing themes plug into.

| Task                                                                    | Strategy                         | Risk                             |
| ----------------------------------------------------------------------- | -------------------------------- | -------------------------------- |
| Add `--surface-*`, `--accent-*`, `--border-*` tokens to each theme file | Extend existing CSS variables    | Medium — must test all 16 themes |
| Add backward-compatible aliases in `variables.css`                      | `--bg-primary: var(--surface-1)` | Low — old names still work       |
| Migrate `style.css` selectors to use semantic tokens                    | One section at a time            | Medium — need visual testing     |
| Add `--success`, `--warning`, `--error`, `--info` to all themes         | Consistent feedback colors       | Low                              |

**Verification:** Test every theme in both light and dark mode. Contrast checker on all text.

### Phase 4: Component Overhaul (Week 4) — Visual Change

**Goal:** Redesign individual components using the token system.

| Task                                               | Order                            | Risk   |
| -------------------------------------------------- | -------------------------------- | ------ |
| Button system (`.btn`, variants)                   | First — affects most UI elements | Medium |
| Toolbar layout (grouped actions, 48px height)      | Second — high visibility         | Medium |
| Split-view resizer (wider grab, visual indicator)  | Third — usability improvement    | Low    |
| Modal system (backdrop blur, scale entrance)       | Fourth — infrequent interaction  | Low    |
| Sidebar file tree (depth indicators, active state) | Fifth — moderate visibility      | Medium |
| Theme selector (custom dropdown with swatches)     | Last — complex JS change         | High   |

**Verification:** Manual testing of all interactions. Keyboard navigation audit.

### Phase 5: Responsive & Polish (Week 5) — Final

**Goal:** Mobile adaptations, performance, and final polish.

| Task                                                  | Risk                              |
| ----------------------------------------------------- | --------------------------------- |
| Add responsive breakpoints and mobile layout          | Medium — new CSS, test on devices |
| Mobile tab bar for view switching                     | Medium — new component            |
| Sidebar overlay drawer on mobile                      | Medium — animation + backdrop     |
| Touch target audit (44px minimum everywhere)          | Low — sizing adjustments          |
| Contrast audit across all 16 themes                   | Low — color value adjustments     |
| Performance audit (Lighthouse 90+ target)             | Low — optimization only           |
| Cross-browser testing (Chrome, Firefox, Safari, Edge) | Low — CSS compatibility           |

---

## Summary: What Changes, What Stays

### Stays the Same

- All JavaScript logic and services (no JS changes in Phase 1-3)
- All markdown rendering features (KaTeX, Mermaid, Prism, callouts)
- Theme file structure (16 CSS files, same organization)
- File browser functionality
- Export functionality (HTML, PDF)
- localStorage auto-save
- Test suite (446 tests)

### Changes

- **Typography:** System fonts → JetBrains Mono + IBM Plex Sans
- **Colors:** Raw hex → semantic token layer (backward compatible)
- **Spacing:** Arbitrary px → 8px grid scale
- **Z-index:** Chaos (100, 1000, 100000) → ordered scale (10-100)
- **Radius:** 8 different values → 5-step scale
- **Motion:** 8+ durations → 3 presets + reduced-motion support
- **Focus:** Missing → universal `:focus-visible` ring
- **Touch targets:** 32px → 44px minimum
- **ARIA:** None → full landmarks, labels, live regions
- **Buttons:** Inconsistent → 3-variant system (primary, secondary, ghost)
- **Modals:** Flat overlay → backdrop blur with scale entrance
- **Resizer:** Thin line → 8px grab area with visual indicator
- **Footer:** Always visible → contextual auto-hide

---

_Blueprint generated using UI/UX Pro Max design intelligence with data from: styles database (50+ styles), typography database (57 pairings), color database (97 palettes), UX guidelines (99 rules), and comprehensive audit of the current codebase._
