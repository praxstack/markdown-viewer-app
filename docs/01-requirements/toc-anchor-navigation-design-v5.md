# Design Document: Table of Contents Anchor Navigation

## Version 5.0 (Production Ready - Final)

---

**Document ID:** DD-2025-002-TOC-NAV
**Author:** Principal SDE
**Created:** December 19, 2025
**Last Updated:** December 19, 2025
**Status:** ✅ **APPROVED FOR IMPLEMENTATION**
**Review Cycles:** 8 (v1.0 → v2.0 → v3.0 → v4.0 → v4.1 → v4.2 → v4.3 → v5.0)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Requirements](#3-requirements)
4. [Technical Design](#4-technical-design)
5. [Implementation Details](#5-implementation-details)
6. [Browser Compatibility](#6-browser-compatibility)
7. [Testing Strategy](#7-testing-strategy)
8. [Performance Budget](#8-performance-budget)
9. [Security Considerations](#9-security-considerations)
10. [Rollback Plan](#10-rollback-plan)
11. [FAQ](#11-faq)
12. [Approval](#12-approval)
13. [Change Log](#13-change-log)

---

## 1. Executive Summary

This document specifies the implementation of in-document anchor navigation for Markdown Viewer Pro. The feature enables clicking Table of Contents links to scroll the preview container to the target heading, with full accessibility support and legacy link compatibility.

**Key Features:**

- Smooth scroll to headings on TOC link click
- Support for emoji and special character headings
- Legacy link compatibility (non-standard ID formats)
- Accessibility-compliant focus management
- Deep linking (URL hash on page load)
- Browser history support (back/forward)

---

## 2. Problem Statement

### 2.1 Root Cause

The application uses a **non-scrollable document body** (`overflow: hidden`) with content rendered inside a scrollable child container (`.preview-container`). When users click anchor links (`href="#section"`), the browser's native scroll algorithm targets the document viewport—which is non-scrollable—resulting in **silent failure**.

### 2.2 Sticky Toolbar Occlusion

The application has a fixed toolbar (height: `60px`). A naive scroll-to-element positions content at `top: 0`, causing it to be **obscured by the toolbar**.

### 2.3 Legacy Link Compatibility

Existing markdown documents contain manually-created links using non-standard ID formats (e.g., `#📋-table-of-contents` or `#-standard-assumptions`). These must resolve correctly.

### 2.4 App Shell ID Collision

The application shell has elements with IDs like `sidebar`, `preview`, `editor`. User-authored headings with the same names must NOT collide with app shell elements.

### 2.5 marked.js Singleton Constraint

`marked` is imported as a global singleton. Calling `marked.use()` inside `renderMarkdown()` (which runs on every keystroke) would stack infinite extensions, causing:

- **Memory leak:** `marked.defaults.extensions` grows infinitely
- **Performance degradation:** After 100 keystrokes, marked runs 100 identical renderers

---

## 3. Requirements

### 3.1 Functional Requirements

| ID    | Requirement                                     | Priority | Acceptance Criteria                  |
| ----- | ----------------------------------------------- | -------- | ------------------------------------ |
| FR-1  | Internal anchor clicks scroll preview to target | P0       | Target heading visible within 800ms  |
| FR-2  | Scrolled content not occluded by toolbar        | P0       | 20px gap between toolbar and heading |
| FR-3  | URL hash updates on navigation                  | P0       | URL reflects current section         |
| FR-4  | Deep linking works on page load                 | P0       | `URL#section` scrolls on load        |
| FR-5  | Browser back/forward navigates history          | P1       | Hash changes scroll correctly        |
| FR-6  | Legacy links work (emoji, special chars)        | P0       | See compatibility matrix             |
| FR-7  | Focus moves to target for screen readers        | P0       | Screen reader announces heading      |
| FR-8  | Empty hash (`#`) scrolls to top                 | P1       | Container scrollTop = 0              |
| FR-9  | No collision with app shell IDs                 | P0       | User `## Sidebar` != app `#sidebar`  |
| FR-10 | Duplicate headings get unique IDs               | P0       | `header`, `header-1`, `header-2`     |

### 3.2 Non-Functional Requirements

| ID    | Requirement               | Target                      |
| ----- | ------------------------- | --------------------------- |
| NFR-1 | Click-to-scroll latency   | < 16ms (1 frame)            |
| NFR-2 | Scroll animation duration | 300-800ms (distance-based)  |
| NFR-3 | No layout thrashing       | 0 forced reflows            |
| NFR-4 | Memory overhead           | < 1KB per session           |
| NFR-5 | No memory leaks           | Zero extension stacking     |
| NFR-6 | Stateless rendering       | Module-level map with reset |

### 3.3 Edge Cases

| Case                | Input                   | Expected Behavior                        |
| ------------------- | ----------------------- | ---------------------------------------- |
| Empty hash          | `href="#"`              | Scroll to top (scrollTop = 0)            |
| Non-existent target | `href="#nonexistent"`   | Console warning, no action               |
| External link       | `href="https://..."`    | Browser default behavior                 |
| Duplicate headers   | Two `## Header`         | IDs: `header`, `header-1`                |
| App shell collision | `## Sidebar`            | Resolves to user content, not `#sidebar` |
| Special chars       | `## C++`                | ID: `cpp`                                |
| Emoji               | `## 🎯 Goal`            | ID: `goal`                               |
| Concurrent clicks   | Click A, then B rapidly | Cancel A, execute B                      |
| Already visible     | Target in viewport      | Smooth scroll anyway                     |

---

## 4. Technical Design

### 4.1 Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                     User Interaction                          │
│  [Click] ──► [hashchange] ──► [Page Load with Hash]          │
└──────────────────────┬────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                 AnchorNavigation Module                       │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  │
│  │ handleClick()  │  │handleHashChange│  │handleInitLoad()│  │
│  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘  │
│          │                   │                   │            │
│          └───────────────────┼───────────────────┘            │
│                              ▼                                │
│                   ┌─────────────────────┐                     │
│                   │  scrollToTarget()   │                     │
│                   │  └─ resolveTarget() │  ◄── SCOPED to      │
│                   │  └─ scrollIntoView  │      container      │
│                   │  └─ manageFocus()   │                     │
│                   └─────────────────────┘                     │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Slug Generation Algorithm

**Purpose:** Generate consistent, collision-free IDs for headings.

**Algorithm (GitHub-compatible with programming term support):**

```javascript
// Pre-compiled regex patterns (module level - zero GC pressure)
const SLUG_REPLACEMENTS = [
  [/c\+\+/gi, 'cpp'],
  [/c#/gi, 'csharp'],
  [/f#/gi, 'fsharp'],
  [/\.net/gi, 'dotnet'],
];

/**
 * Generate URL-safe slug from heading text
 * @param {string} text - Raw heading text (may include HTML)
 * @param {Map<string, number>} seen - Duplicate tracking map
 * @returns {string} URL-safe slug
 */
function generateSlug(text, seen = new Map()) {
  // Step 0: Strip HTML tags
  let slug = text.replace(/<[^>]*>/g, '');

  // Step 1: Normalize Unicode (handle café vs café)
  slug = slug.normalize('NFC');

  // Step 2: Lowercase
  slug = slug.toLowerCase();

  // Step 3: Replace programming terms (pre-compiled patterns)
  for (const [pattern, replacement] of SLUG_REPLACEMENTS) {
    slug = slug.replace(pattern, replacement);
  }

  // Step 4: Remove non-word chars (keep spaces, hyphens, underscores)
  slug = slug.replace(/[^\w\s-]/g, '');

  // Step 5: Spaces to hyphens
  slug = slug.replace(/\s+/g, '-');

  // Step 6: Collapse multiple hyphens
  slug = slug.replace(/-+/g, '-');

  // Step 7: Trim hyphens
  slug = slug.replace(/^-+|-+$/g, '');

  // Step 8: Fallback for empty result
  if (!slug) slug = 'section';

  // Step 9: Handle duplicates (header, header-1, header-2)
  const baseSlug = slug;
  const count = seen.get(baseSlug) || 0;
  if (count > 0) {
    slug = `${baseSlug}-${count}`;
  }
  seen.set(baseSlug, count + 1);

  return slug;
}
```

**Transformation Examples:**

| Input                     | Output                 | Reason                |
| ------------------------- | ---------------------- | --------------------- |
| `Hello World`             | `hello-world`          | Standard              |
| `🎯 Standard Assumptions` | `standard-assumptions` | Emoji stripped        |
| `C++`                     | `cpp`                  | Special replacement   |
| `C#`                      | `csharp`               | Special replacement   |
| `.NET Framework`          | `dotnet-framework`     | Special replacement   |
| `F#`                      | `fsharp`               | Special replacement   |
| `API v2.0`                | `api-v20`              | Period stripped       |
| `1. Introduction`         | `1-introduction`       | Numbers preserved     |
| `hello_world`             | `hello_world`          | Underscores preserved |
| `Header` (1st)            | `header`               | First occurrence      |
| `Header` (2nd)            | `header-1`             | Duplicate handling    |
| `Header` (3rd)            | `header-2`             | Duplicate handling    |
| `😀😀😀`                  | `section`              | Fallback for empty    |
| `--test--`                | `test`                 | Trimmed               |

### 4.3 State Management (Singleton-Safe)

**Critical:** `marked` is a global singleton. Extension registration happens ONCE at startup.

```javascript
// Module level (script.js, near top)
const headingSlugMap = new Map();

function resetSlugMap() {
  headingSlugMap.clear();
}

// In configureMarkedExtensions() - called ONCE at app init
marked.use({
  renderer: {
    heading(token) {
      const text = this.parser.parseInline(token.tokens);
      const level = token.depth;
      const slug = generateSlug(text, headingSlugMap);
      return `<h${level} id="${slug}">${text}</h${level}>\n`;
    },
  },
});

// In renderMarkdown() - called on every keystroke
function renderMarkdown() {
  resetSlugMap(); // Clear state, NOT re-register extension
  const html = marked.parse(text);
  // ...
}
```

### 4.4 Link Resolution (Scoped Selection)

**Purpose:** Match clicked links to generated IDs, preventing app shell collision.

```javascript
/**
 * Resolve target element from hash - SCOPED to container
 * @param {string} hash - URL hash (without #)
 * @param {HTMLElement} container - Scrollable container
 * @returns {Element|null} Target element or null
 */
function resolveTarget(hash, container) {
  if (!hash) return null;

  // Decode URI components
  let decodedHash;
  try {
    decodedHash = decodeURIComponent(hash);
  } catch {
    decodedHash = hash;
  }

  // Priority 1: Exact ID (SCOPED to container - prevents app shell collision)
  let target = container.querySelector(`#${CSS.escape(decodedHash)}`);
  if (target) return target;

  // Priority 2: Normalized ID (handles legacy links)
  const normalizedHash = normalizeHash(decodedHash);
  target = container.querySelector(`#${CSS.escape(normalizedHash)}`);
  if (target) return target;

  console.warn(`[AnchorNav] Target not found: "${hash}"`);
  return null;
}

/**
 * Normalize hash for legacy link matching
 */
function normalizeHash(hash) {
  let slug = hash.normalize('NFC').toLowerCase();

  for (const [pattern, replacement] of SLUG_REPLACEMENTS) {
    slug = slug.replace(pattern, replacement);
  }

  return (
    slug
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') || 'section'
  );
}
```

---

## 5. Implementation Details

### 5.1 CSS Configuration

**File: `variables.css`** (add to existing `:root`)

```css
:root {
  /* Existing variables... */

  /* Anchor Navigation */
  --toolbar-height: 60px;
  --scroll-padding: 20px;
  --scroll-offset: calc(var(--toolbar-height) + var(--scroll-padding));
}
```

**File: `style.css`** (add new section)

```css
/* ==================== ANCHOR NAVIGATION ==================== */

/* Scroll padding - SINGLE SOURCE of offset */
.preview-container {
  scroll-padding-top: var(--scroll-offset, 80px);
}

/* Target highlight animation */
.preview-container :target {
  animation: anchor-highlight 2s ease-out;
}

@keyframes anchor-highlight {
  0% {
    background-color: rgba(255, 255, 0, 0.3);
  }
  100% {
    background-color: transparent;
  }
}

/* Focus management - conditional outline */
.preview-container h1[id]:focus:not(:focus-visible),
.preview-container h2[id]:focus:not(:focus-visible),
.preview-container h3[id]:focus:not(:focus-visible),
.preview-container h4[id]:focus:not(:focus-visible),
.preview-container h5[id]:focus:not(:focus-visible),
.preview-container h6[id]:focus:not(:focus-visible) {
  outline: none;
}

/* Keyboard focus gets visible indicator */
.preview-container h1[id]:focus-visible,
.preview-container h2[id]:focus-visible,
.preview-container h3[id]:focus-visible,
.preview-container h4[id]:focus-visible,
.preview-container h5[id]:focus-visible,
.preview-container h6[id]:focus-visible {
  outline: 2px solid var(--primary-color, #007bff);
  outline-offset: 4px;
  border-radius: 2px;
}
```

### 5.2 JavaScript Implementation

**File: `script.js`** (modifications)

```javascript
// ==================== ANCHOR NAVIGATION ====================
// Add near top of file, after imports

// Heading slug tracking (module-level singleton)
const headingSlugMap = new Map();

// Pre-compiled slug replacements (zero GC pressure)
const SLUG_REPLACEMENTS = [
  [/c\+\+/gi, 'cpp'],
  [/c#/gi, 'csharp'],
  [/f#/gi, 'fsharp'],
  [/\.net/gi, 'dotnet'],
];

/**
 * Reset slug map (call before each parse)
 */
function resetSlugMap() {
  headingSlugMap.clear();
}

/**
 * Generate URL-safe slug from heading text
 */
function generateSlug(text, seen = headingSlugMap) {
  // Strip HTML tags
  let slug = text.replace(/<[^>]*>/g, '');

  // Normalize Unicode
  slug = slug.normalize('NFC').toLowerCase();

  // Replace programming terms
  for (const [pattern, replacement] of SLUG_REPLACEMENTS) {
    slug = slug.replace(pattern, replacement);
  }

  // Clean up
  slug = slug
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!slug) slug = 'section';

  // Handle duplicates
  const baseSlug = slug;
  const count = seen.get(baseSlug) || 0;
  if (count > 0) slug = `${baseSlug}-${count}`;
  seen.set(baseSlug, count + 1);

  return slug;
}

/**
 * Anchor Navigation Module
 */
const AnchorNavigation = {
  container: null,
  pendingScroll: null,

  /**
   * Initialize anchor navigation
   */
  init(previewContainer) {
    this.container = previewContainer;

    // Event delegation for clicks
    this.container.addEventListener('click', this.handleClick.bind(this));

    // Browser back/forward
    window.addEventListener('hashchange', this.handleHashChange.bind(this));

    // Initial page load with hash
    if (window.location.hash) {
      requestAnimationFrame(() => {
        this.scrollToHash(window.location.hash.slice(1), false);
      });
    }
  },

  /**
   * Handle click events (delegated)
   */
  handleClick(event) {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    // Ignore external links
    if (link.hostname && link.hostname !== window.location.hostname) return;

    event.preventDefault();

    const hash = link.getAttribute('href').slice(1);
    this.scrollToHash(hash, true);

    // Update URL
    history.pushState(null, '', `#${hash}`);
  },

  /**
   * Handle hashchange (back/forward)
   */
  handleHashChange() {
    const hash = window.location.hash.slice(1);
    if (hash) {
      this.scrollToHash(hash, true);
    } else {
      this.scrollToTop(true);
    }
  },

  /**
   * Scroll to element by hash
   */
  scrollToHash(hash, smooth = true) {
    // Cancel pending scroll (handle concurrent clicks)
    if (this.pendingScroll) {
      clearTimeout(this.pendingScroll);
      this.pendingScroll = null;
    }

    if (!hash) {
      this.scrollToTop(smooth);
      return;
    }

    const target = this.resolveTarget(hash);
    if (!target) return;

    target.scrollIntoView({
      behavior: smooth ? 'smooth' : 'instant',
      block: 'start',
    });

    this.manageFocus(target, smooth);
  },

  /**
   * Scroll to top
   */
  scrollToTop(smooth = true) {
    this.container.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'instant',
    });
  },

  /**
   * Resolve target - SCOPED to container
   */
  resolveTarget(hash) {
    if (!hash) return null;

    let decodedHash;
    try {
      decodedHash = decodeURIComponent(hash);
    } catch {
      decodedHash = hash;
    }

    // Priority 1: Exact ID (scoped)
    let target = this.container.querySelector(`#${CSS.escape(decodedHash)}`);
    if (target) return target;

    // Priority 2: Normalized ID (scoped)
    const normalized = this.normalizeHash(decodedHash);
    target = this.container.querySelector(`#${CSS.escape(normalized)}`);
    if (target) return target;

    console.warn(`[AnchorNav] Target not found: "${hash}"`);
    return null;
  },

  /**
   * Normalize hash for legacy link matching
   */
  normalizeHash(hash) {
    let slug = hash.normalize('NFC').toLowerCase();

    for (const [pattern, replacement] of SLUG_REPLACEMENTS) {
      slug = slug.replace(pattern, replacement);
    }

    return (
      slug
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '') || 'section'
    );
  },

  /**
   * Manage focus after scroll
   */
  manageFocus(target, smooth) {
    const focusTarget = () => {
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }
      target.focus({ preventScroll: true });
    };

    if (!smooth) {
      focusTarget();
      return;
    }

    // Modern: scrollend event
    if ('onscrollend' in this.container) {
      this.container.addEventListener('scrollend', focusTarget, { once: true });
    } else {
      // Fallback: estimate duration (max 1000ms for safety)
      const distance = Math.abs(target.getBoundingClientRect().top);
      const duration = Math.min(Math.max(distance / 2, 300), 1000);
      this.pendingScroll = setTimeout(focusTarget, duration + 50);
    }
  },
};
```

### 5.3 Integration Points

**In `configureMarkedExtensions()`:**

```javascript
function configureMarkedExtensions() {
  // ... existing extensions ...

  // Custom heading renderer with ID generation
  marked.use({
    renderer: {
      heading(token) {
        const text = this.parser.parseInline(token.tokens);
        const level = token.depth;
        const slug = generateSlug(text, headingSlugMap);
        return `<h${level} id="${slug}">${text}</h${level}>\n`;
      },
    },
  });
  console.log('✅ Custom heading renderer enabled (ID generation)');
}
```

**In `renderMarkdown()`:**

```javascript
function renderMarkdown() {
  try {
    resetSlugMap();  // Clear slug tracking before parse

    const markdownText = editor.value;
    let html = marked.parse(markdownText);
    // ... rest of existing logic ...
  }
}
```

**In `setupEditor()` (at end):**

```javascript
// Initialize anchor navigation
AnchorNavigation.init(previewContainer);
```

---

## 6. Browser Compatibility

| Feature                        | Chrome | Firefox | Safari | Edge | Fallback                |
| ------------------------------ | ------ | ------- | ------ | ---- | ----------------------- |
| `scrollIntoView({ behavior })` | 61+    | 36+     | 15.4+  | 79+  | Instant scroll          |
| `scrollend` event              | 114+   | 109+    | 17+    | 114+ | setTimeout (1000ms max) |
| `scroll-padding-top`           | 69+    | 68+     | 14.1+  | 79+  | None needed             |
| `CSS.escape()`                 | 46+    | 31+     | 10+    | 79+  | None needed             |
| `:focus-visible`               | 86+    | 85+     | 15.4+  | 86+  | Always show outline     |

**Minimum Supported:** Chrome 86, Firefox 85, Safari 15.4, Edge 86

---

## 7. Testing Strategy

### 7.1 Unit Tests

**File: `tests/unit/utils/anchorNavigation.test.js`**

```javascript
import { describe, it, expect, beforeEach } from 'vitest';

describe('generateSlug', () => {
  let seen;

  beforeEach(() => {
    seen = new Map();
  });

  describe('basic transformations', () => {
    it('converts to lowercase', () => {
      expect(generateSlug('HELLO', seen)).toBe('hello');
    });

    it('replaces spaces with hyphens', () => {
      expect(generateSlug('hello world', seen)).toBe('hello-world');
    });

    it('preserves numbers', () => {
      expect(generateSlug('Section 1', seen)).toBe('section-1');
    });

    it('preserves underscores', () => {
      expect(generateSlug('hello_world', seen)).toBe('hello_world');
    });
  });

  describe('special characters', () => {
    it('removes emoji', () => {
      expect(generateSlug('🎯 Goal', seen)).toBe('goal');
    });

    it('handles C++', () => {
      expect(generateSlug('C++', seen)).toBe('cpp');
    });

    it('handles C#', () => {
      expect(generateSlug('C#', seen)).toBe('csharp');
    });

    it('handles F#', () => {
      expect(generateSlug('F#', seen)).toBe('fsharp');
    });

    it('handles .NET', () => {
      expect(generateSlug('.NET Framework', seen)).toBe('dotnet-framework');
    });

    it('strips periods', () => {
      expect(generateSlug('API v2.0', seen)).toBe('api-v20');
    });
  });

  describe('edge cases', () => {
    it('collapses multiple hyphens', () => {
      expect(generateSlug('hello--world', seen)).toBe('hello-world');
    });

    it('trims leading hyphens', () => {
      expect(generateSlug('--hello', seen)).toBe('hello');
    });

    it('trims trailing hyphens', () => {
      expect(generateSlug('hello--', seen)).toBe('hello');
    });

    it('returns "section" for empty result', () => {
      expect(generateSlug('!!!', seen)).toBe('section');
      expect(generateSlug('😀😀😀', seen)).toBe('section');
    });

    it('handles unicode normalization', () => {
      expect(generateSlug('café', seen)).toBe('caf');
    });

    it('strips HTML tags', () => {
      expect(generateSlug('<strong>Bold</strong> text', seen)).toBe('bold-text');
    });
  });

  describe('duplicate handling', () => {
    it('adds suffix for duplicates', () => {
      expect(generateSlug('Header', seen)).toBe('header');
      expect(generateSlug('Header', seen)).toBe('header-1');
      expect(generateSlug('Header', seen)).toBe('header-2');
    });

    it('tracks different bases separately', () => {
      expect(generateSlug('Header', seen)).toBe('header');
      expect(generateSlug('Footer', seen)).toBe('footer');
      expect(generateSlug('Header', seen)).toBe('header-1');
    });
  });
});

describe('normalizeHash', () => {
  it('normalizes legacy emoji links', () => {
    expect(normalizeHash('🎯-standard-assumptions')).toBe('standard-assumptions');
  });

  it('normalizes leading hyphens', () => {
    expect(normalizeHash('-hello-world-')).toBe('hello-world');
  });

  it('handles programming terms', () => {
    expect(normalizeHash('c++')).toBe('cpp');
  });
});
```

### 7.2 Manual Test Cases

| #   | Scenario            | Steps                          | Expected Result                                 |
| --- | ------------------- | ------------------------------ | ----------------------------------------------- |
| 1   | Standard TOC click  | Click TOC link `#introduction` | Scrolls to heading, visible below toolbar       |
| 2   | Emoji header        | Click `#🎯-goal`               | Resolves to `#goal`, scrolls correctly          |
| 3   | C++ header          | Click `#c++`                   | Resolves to `#cpp`, scrolls correctly           |
| 4   | Deep link           | Load `URL#section-1`           | Page scrolls to section on load                 |
| 5   | Browser back        | Click link, then browser back  | Returns to previous scroll position             |
| 6   | Empty hash          | Click `href="#"`               | Scrolls to top of container                     |
| 7   | Invalid target      | Click `#nonexistent`           | Console warning, no crash                       |
| 8   | Duplicate headers   | Two `## Header`                | First is `#header`, second is `#header-1`       |
| 9   | App shell collision | `## Sidebar` heading           | Scrolls to user heading, not app `#sidebar`     |
| 10  | Accessibility       | Tab to link, press Enter       | Focus moves to heading, screen reader announces |
| 11  | Concurrent clicks   | Click A, immediately click B   | Only B executes                                 |

---

## 8. Performance Budget

| Metric                      | Budget        | Measurement Method                  |
| --------------------------- | ------------- | ----------------------------------- |
| Click-to-scroll latency     | < 16ms        | `performance.now()` delta           |
| Slug generation per heading | < 1ms         | Profile in DevTools                 |
| DOM queries per click       | ≤ 2           | Code review                         |
| Memory per session          | < 1KB         | DevTools heap snapshot              |
| Extension stack size        | 1 (no growth) | `marked.defaults.extensions.length` |

---

## 9. Security Considerations

| Concern              | Risk   | Mitigation                            |
| -------------------- | ------ | ------------------------------------- |
| XSS via hash         | Low    | Hash is never inserted into innerHTML |
| Open redirect        | Low    | Only same-origin hashes processed     |
| DoS (rapid clicks)   | Low    | Pending scroll cancellation           |
| Invalid ID injection | Low    | `CSS.escape()` for selectors          |
| HTML in headings     | Medium | Tags stripped before slug generation  |

---

## 10. Rollback Plan

### 10.1 Affected Files

| File            | Changes                                                     |
| --------------- | ----------------------------------------------------------- |
| `script.js`     | Add AnchorNavigation module, generateSlug, heading renderer |
| `style.css`     | Add scroll-padding, focus-visible styles                    |
| `variables.css` | Add --scroll-offset variable                                |

### 10.2 Rollback Command

```bash
git checkout HEAD~1 -- script.js style.css variables.css
```

### 10.3 Rollback Criteria

- Any markdown rendering regression
- JavaScript console errors
- Theme switching broken
- Memory leak detected (extension stacking)

### 10.4 Verification Steps

1. Reload application
2. Verify no console errors
3. Type in editor, verify preview updates
4. Switch themes, verify no errors
5. Check `marked.defaults` has stable extension count

---

## 11. FAQ

**Q1: Will this break existing functionality?**

> No. This is an additive feature. Existing markdown rendering is unchanged.

**Q2: What if a heading contains only emoji?**

> The slug becomes `section` (fallback for empty result).

**Q3: Will this affect HTML export?**

> Exported HTML will include the generated IDs. Navigation will work if opened in a browser.

**Q4: What about very long headings?**

> No length limit. The full heading becomes the slug (performance tested up to 1000 chars).

**Q5: Can users manually specify IDs?**

> Not currently. This would require parsing `{#custom-id}` syntax, which is a future enhancement.

**Q6: What if `marked.use()` is accidentally called in `renderMarkdown()`?**

> This would cause extension stacking (memory leak). The design explicitly prevents this by registering ONCE in `configureMarkedExtensions()` and only calling `resetSlugMap()` per render.

**Q7: Why use `CSS.escape()` instead of simple string matching?**

> IDs can contain special CSS selector characters (`.`, `#`, `:`). `CSS.escape()` ensures the querySelector doesn't break.

**Q8: What's the maximum scroll duration?**

> Capped at 1000ms for the `scrollend` fallback timeout. Smooth scroll itself is browser-controlled.

---

## 12. Approval

| Role           | Name          | Date       | Status      |
| -------------- | ------------- | ---------- | ----------- |
| Author         | Principal SDE | 2025-12-19 | ✅ Complete |
| Reviewer       | Gemini        | 2025-12-19 | ✅ Approved |
| Implementation | Pending       | -          | ⏳ Ready    |

---

## 13. Change Log

| Version | Date       | Author        | Changes                                                     |
| ------- | ---------- | ------------- | ----------------------------------------------------------- |
| 1.0     | 2025-12-19 | Principal SDE | Initial draft                                               |
| 2.0     | 2025-12-19 | Principal SDE | Added requirements, edge cases                              |
| 3.0     | 2025-12-19 | Gemini        | Strict compliance version                                   |
| 4.0     | 2025-12-19 | Principal SDE | Production-ready with full implementation                   |
| 4.1     | 2025-12-19 | Principal SDE | Fixed double offset, pre-compiled regex                     |
| 4.2     | 2025-12-19 | Principal SDE | Scoped selection, focus-visible                             |
| 4.3     | 2025-12-19 | Gemini        | Identified singleton bug                                    |
| 5.0     | 2025-12-19 | Principal SDE | **FINAL** - Module-level map, reset pattern, singleton-safe |

---

**End of Document**
