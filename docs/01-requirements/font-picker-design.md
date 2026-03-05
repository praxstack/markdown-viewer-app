# Font Picker Component — Design Document

**Date:** February 20, 2026  
**Status:** Ready for implementation  
**Estimated effort:** 2-3 hours

---

## Problem

Users can't customize fonts. The app uses hardcoded Outfit/JetBrains Mono everywhere. Users want to pick reading fonts for the preview (serif for literary, sans-serif for technical) and coding fonts for the editor — independent of which theme they're using.

## Design Decision: CSS Variable Override Layer

The font picker writes to **new** CSS custom properties (`--font-picker-*`) at the `:root` level via inline styles. These sit ABOVE theme fonts in CSS specificity. When unset, theme fonts apply. When set, user choice wins.

```
Specificity: inline style > theme CSS file > variables.css fallback
```

This means: **zero changes to any of the 16 theme CSS files** (except 3 lines in nebula-elements.css).

## What It Offers

| Control           | Target              | Options                       |
| ----------------- | ------------------- | ----------------------------- |
| Preview Body Font | `#markdown-preview` | 23 fonts across 4 categories  |
| Editor Font       | `#markdown-editor`  | 6 monospace fonts             |
| Code Block Font   | `pre code` blocks   | 6 monospace fonts (same list) |
| Base Size         | Preview body text   | 12–24px slider                |

**NOT included (YAGNI):** UI font, per-heading fonts, line-height control.

## Font Catalog (23 fonts)

### Sans-Serif

- System Default, Inter, IBM Plex Sans, DM Sans, Figtree, Noto Sans, Atkinson Hyperlegible

### Serif

- Merriweather, Lora, Crimson Text, Source Serif 4, Literata

### Monospace

- JetBrains Mono, Fira Code, Source Code Pro, IBM Plex Mono, Cascadia Code, Space Mono

### Quirky/Display

- Outfit, Space Grotesk, Recursive, Comic Neue, Caveat

## UX: Popover Panel

- Triggered by "Aa" typography button in toolbar
- **NOT** a modal — a floating popover panel (right-aligned, max-height 500px)
- 3 sections: Preview Font (card grid), Editor Font (dropdown), Code Font (dropdown), Base Size (stepper)
- Changes apply LIVE as user clicks
- "Reset to defaults" removes all overrides
- Persists in localStorage

## CSS Integration

```css
/* style.css — override cascade: font-picker > theme > fallback */
#markdown-preview {
  font-family: var(--font-picker-preview, var(--font-primary, sans-serif));
  font-size: var(--font-picker-size, 16px);
}
#markdown-editor {
  font-family: var(--font-picker-editor, var(--font-code, monospace));
}
#markdown-preview pre code {
  font-family: var(--font-picker-code, var(--font-code, monospace));
}
```

## localStorage Schema

```json
{
  "fontSettings": {
    "previewBody": "Merriweather",
    "editor": "Fira Code",
    "codeBlock": "Source Code Pro",
    "baseSize": 16
  }
}
```

## Risks & Mitigations

| Risk                          | Mitigation                                                      |
| ----------------------------- | --------------------------------------------------------------- |
| Nebula `!important` conflicts | Update 3 lines in nebula-elements.css to check picker var first |
| HTML Export missing fonts     | Inject Google Fonts @import into exported HTML                  |
| PDF Export font not loaded    | Await `document.fonts.ready` before PDF render                  |
| Loading 23 Google Fonts       | Lazy load: only load font on hover/click, not on page load      |
| Size slider vs zoom conflict  | They're independent and multiplicative — document it            |

## Implementation Order

1. Add font catalog data + CSS override vars
2. Update style.css references (3 key selectors)
3. Build HTML popover component
4. Build CSS styles
5. Build JS (lazy loading, localStorage, live preview)
6. Fix nebula-elements.css (3 lines)
7. Test across all 16 themes
