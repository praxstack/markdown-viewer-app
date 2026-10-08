/**
 * Application Constants
 *
 * All magic numbers and strings centralized here.
 * Provides single source of truth for app configuration.
 */

// App Configuration
export const APP_CONFIG = {
  NAME: 'Markdown Viewer Pro',
  VERSION: '2.0.0',
  PORT: 3000,
};

// Zoom Configuration
export const ZOOM = {
  MIN: 50,
  MAX: 200,
  DEFAULT: 100,
  STEP: 10,
};

// View Modes
export const VIEW_MODES = {
  EDITOR_ONLY: 'editor-only',
  SPLIT_VIEW: 'split-view',
  PREVIEW_ONLY: 'preview-only',
  DEFAULT: 'split-view',
};

// LocalStorage Keys
export const STORAGE_KEYS = {
  MARKDOWN_CONTENT: 'markdownContent',
  SELECTED_THEME: 'selectedTheme',
  CUSTOM_THEME: 'customTheme',
  VIEW_MODE: 'viewMode',
  PREVIEW_ZOOM: 'previewZoom',
};

// Theme Names
export const THEMES = {
  NEBULA_DARK: 'nebula-dark',
  NEBULA_LIGHT: 'nebula-light',
  DEFAULT_LIGHT: 'default-light',
  DEFAULT_DARK: 'default-dark',
  OCEAN_LIGHT: 'ocean-light',
  OCEAN_DARK: 'ocean-dark',
  NEON_LIGHT: 'neon-light',
  NEON_DARK: 'neon-dark',
  FOREST_LIGHT: 'forest-light',
  FOREST_DARK: 'forest-dark',
  SUNSET_LIGHT: 'sunset-light',
  SUNSET_DARK: 'sunset-dark',
  OBSIDIAN_LIGHT: 'obsidian-light',
  OBSIDIAN_DARK: 'obsidian-dark',
  CUSTOM: 'custom',
};

// HTML Export Configuration
export const HTML_EXPORT = {
  FILENAME: 'markdown-export.html',
};

// Mermaid Configuration
export const MERMAID_CONFIG = {
  START_ON_LOAD: false,
  THEME: 'base',
  RENDER_TIMEOUT: 100, // ms
};

// App Initialization
export const INIT_CONFIG = {
  RETRY_DELAY: 100, // ms - delay before retrying library load
  THEME_CHANGE_DELAY: 100, // ms - delay before re-rendering after theme change
};

// DOM Element IDs (for reference/validation)
export const ELEMENT_IDS = {
  EDITOR: 'markdown-editor',
  PREVIEW: 'markdown-preview',
  THEME_SELECTOR: 'theme-selector',
  THEME_STYLESHEET: 'theme-stylesheet',
  CUSTOMIZE_BTN: 'customize-btn',
  EXPORT_HTML_BTN: 'export-html-btn',
  MODAL: 'customizer-modal',
  CLOSE_MODAL: 'close-modal',
  RESET_BTN: 'reset-btn',
  SAVE_THEME_BTN: 'save-theme-btn',
  EDITOR_ONLY_BTN: 'editor-only-btn',
  SPLIT_VIEW_BTN: 'split-view-btn',
  PREVIEW_ONLY_BTN: 'preview-only-btn',
  ZOOM_IN_BTN: 'zoom-in-btn',
  ZOOM_OUT_BTN: 'zoom-out-btn',
  ZOOM_RESET_BTN: 'zoom-reset-btn',
  ZOOM_LEVEL: 'zoom-level',
};

// CSS Custom Property Names (for reference)
export const CSS_VARS = {
  BG_PRIMARY: '--bg-primary',
  BG_SECONDARY: '--bg-secondary',
  BG_TERTIARY: '--bg-tertiary',
  TEXT_PRIMARY: '--text-primary',
  TEXT_SECONDARY: '--text-secondary',
  H1_COLOR: '--h1-color',
  H2_COLOR: '--h2-color',
  H3_COLOR: '--h3-color',
  H4_COLOR: '--h4-color',
  H5_COLOR: '--h5-color',
  H6_COLOR: '--h6-color',
  LINK_COLOR: '--link-color',
  BOLD_COLOR: '--bold-color',
  ITALIC_COLOR: '--italic-color',
  CODE_TEXT: '--code-text',
  CODE_BG: '--code-bg',
  CODE_BLOCK_BG: '--code-block-bg',
  BLOCKQUOTE_BORDER: '--blockquote-border',
  SYNTAX_KEYWORD: '--syntax-keyword',
  SYNTAX_STRING: '--syntax-string',
  SYNTAX_NUMBER: '--syntax-number',
  SYNTAX_FUNCTION: '--syntax-function',
  SYNTAX_COMMENT: '--syntax-comment',
  SYNTAX_OPERATOR: '--syntax-operator',
  SYNTAX_PUNCTUATION: '--syntax-punctuation',
};

// Default Markdown Content
export const DEFAULT_MARKDOWN = `# Welcome to Markdown Viewer Pro! 🚀

This is a powerful markdown viewer with **syntax highlighting**, *italic text*, and much more!

## Features

- ✅ Real-time preview
- ✅ Syntax highlighting for 20+ languages
- ✅ Mermaid diagram support
- ✅ 12 built-in themes (6 themes × 2 variants each)
- ✅ Custom color customization
- ✅ Export to HTML & PDF

## Code Examples

### Java
\`\`\`java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
\`\`\`

### C++
\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
\`\`\`

### Python
\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
\`\`\`

## Mermaid Diagram Example

\`\`\`mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> A
    C --> E[End]
\`\`\`

## Tables

| Language | Type | Year |
|----------|------|------|
| JavaScript | Dynamic | 1995 |
| Python | Dynamic | 1991 |
| Java | Static | 1995 |
| Rust | Static | 2010 |

## Quotes

> "The best way to predict the future is to invent it." - Alan Kay

## Lists

### Ordered List
1. First item
2. Second item
3. Third item

### Unordered List
- Bullet point one
- Bullet point two
- Bullet point three

---

**Try switching themes** from the dropdown menu! 🎨
`;
