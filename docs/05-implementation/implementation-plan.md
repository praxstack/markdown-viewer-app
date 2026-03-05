# 🏗️ Phase-Wise Implementation Plan - Professional Frontend Architecture

## 📋 Executive Summary

**Timeline:** 6 weeks
**Approach:** Incremental, non-breaking refactoring
**Risk Level:** Low (using Strangler Fig pattern)
**Expected Outcome:** Production-grade, testable, scalable codebase

---

## 🎯 Phase 1: Foundation & Tooling (Week 1)

**Goal:** Setup infrastructure without touching production code

### **Tasks:**

#### 1.1 NPM & Package Management

```bash
# Already done: npm init -y
npm install --save-dev vite vitest @vitest/ui @vitest/coverage-v8
npm install --save-dev eslint prettier
npm install --save-dev husky @commitlint/cli @commitlint/config-conventional
```

**Deliverables:**

- ✅ package.json with scripts
- ✅ node_modules/ (gitignored)
- ✅ Development dependencies installed

#### 1.2 Update package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "lint": "eslint . --ext .js",
    "lint:fix": "eslint . --ext .js --fix",
    "format": "prettier --write \"**/*.{js,css,html,md}\"",
    "format:check": "prettier --check \"**/*.{js,css,html,md}\""
  }
}
```

#### 1.3 ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
    eqeqeq: ['error', 'always'],
    curly: ['error', 'all'],
  },
};
```

#### 1.4 Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}
```

#### 1.5 Vite Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

#### 1.6 Vitest Configuration

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules/', 'tests/', 'dist/'],
    },
  },
});
```

#### 1.7 Update .gitignore

```
# Dependencies
node_modules/
package-lock.json

# Build
dist/
.vite/

# Testing
coverage/
.vitest/

# IDE
.vscode/
.idea/

# OS
.DS_Store
```

#### 1.8 Git Checkpoint

```bash
git tag -a v1.0-stable -m "Stable version before refactor"
git push origin v1.0-stable
```

**Success Criteria:**

- ✅ All tools installed
- ✅ Configurations in place
- ✅ `npm run dev` starts dev server
- ✅ App still works identically
- ✅ Git checkpoint created

**Time Estimate:** 2-3 hours

---

## 🧪 Phase 2: Baseline Test Suite (Week 2)

**Goal:** Document all current functionality with tests

### **Tasks:**

#### 2.1 Create Test Structure

```bash
mkdir -p tests/{unit,integration,e2e,baseline}
mkdir -p tests/unit/{utils,core,services}
```

#### 2.2 Setup Test Utilities

```javascript
// tests/setup.js
import { beforeEach, afterEach } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock DOM methods
global.getComputedStyle = vi.fn();

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});
```

#### 2.3 Baseline Feature Tests

```javascript
// tests/baseline/current-features.test.js
import { describe, it, expect, beforeEach } from 'vitest';

describe('Baseline: All Current Features', () => {
  describe('Markdown Rendering', () => {
    it('renders headings H1-H6', () => {});
    it('renders bold and italic text', () => {});
    it('renders code blocks', () => {});
    it('renders lists (ordered/unordered)', () => {});
    it('renders tables', () => {});
    it('renders blockquotes', () => {});
    it('renders links', () => {});
    it('handles HTML entities in Mermaid', () => {});
  });

  describe('Theme System', () => {
    it('loads default-light theme', () => {});
    it('loads default-dark theme', () => {});
    it('loads all 12 built-in themes', () => {});
    it('creates custom theme', () => {});
    it('persists theme selection', () => {});
    it('applies theme colors to elements', () => {});
  });

  describe('View Modes', () => {
    it('switches to editor-only mode', () => {});
    it('switches to split-view mode', () => {});
    it('switches to preview-only mode', () => {});
    it('persists view mode', () => {});
  });

  describe('Zoom Controls', () => {
    it('zooms in (100% -> 110%)', () => {});
    it('zooms out (100% -> 90%)', () => {});
    it('resets zoom to 100%', () => {});
    it('constrains zoom min 50%', () => {});
    it('constrains zoom max 200%', () => {});
    it('persists zoom level', () => {});
  });

  describe('Export Functionality', () => {
    it('exports HTML with theme', () => {});
    it('exports PDF with theme', () => {});
    it('PDF has 0.25" margins', () => {});
  });

  describe('LocalStorage Persistence', () => {
    it('saves markdown content', () => {});
    it('saves selected theme', () => {});
    it('saves custom theme colors', () => {});
    it('saves view mode', () => {});
    it('saves zoom level', () => {});
  });
});
```

#### 2.4 Create Testing Documentation

```markdown
// tests/README.md

# Testing Guide

## Running Tests

- `npm run test` - Run all tests
- `npm run test:ui` - Open test UI
- `npm run test:coverage` - Generate coverage report

## Test Structure

- baseline/ - Tests documenting current behavior
- unit/ - Tests for individual functions
- integration/ - Tests for feature interactions
- e2e/ - Tests for complete user workflows
```

**Success Criteria:**

- ✅ 50+ baseline tests written
- ✅ All tests pass
- ✅ Tests document every feature
- ✅ App still works identically

**Time Estimate:** 8-10 hours

---

## 📦 Phase 3: Extract Constants & Utilities (Week 3)

**Goal:** Extract pure data and helper functions (lowest risk)

### **Tasks:**

#### 3.1 Create Directory Structure

```bash
mkdir -p src/js/{config,utils}
```

#### 3.2 Extract Constants

```javascript
// src/js/config/constants.js
export const APP_CONFIG = {
  NAME: 'Markdown Viewer Pro',
  VERSION: '2.0.0',
};

export const ZOOM = {
  MIN: 50,
  MAX: 200,
  DEFAULT: 100,
  STEP: 10,
};

export const VIEW_MODES = {
  EDITOR_ONLY: 'editor-only',
  SPLIT_VIEW: 'split-view',
  PREVIEW_ONLY: 'preview-only',
  DEFAULT: 'split-view',
};

export const STORAGE_KEYS = {
  MARKDOWN_CONTENT: 'markdownContent',
  SELECTED_THEME: 'selectedTheme',
  CUSTOM_THEME: 'customTheme',
  VIEW_MODE: 'viewMode',
  PREVIEW_ZOOM: 'previewZoom',
};

export const PDF_CONFIG = {
  MARGIN: [0.25, 0.25, 0.25, 0.25],
  FILENAME: 'markdown-export.pdf',
  FORMAT: 'a4',
  ORIENTATION: 'portrait',
  SCALE: 2,
  QUALITY: 0.98,
};

export const THEMES = {
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

export const DEFAULT_MARKDOWN = `# Welcome to Markdown Viewer Pro! 🚀
// ... (move from script.js)
`;
```

#### 3.3 Extract Utility Helpers

```javascript
// src/js/utils/htmlHelpers.js
/**
 * Decodes HTML entities in text
 * @param {string} text - Text with HTML entities
 * @returns {string} Decoded text
 */
export function decodeHtmlEntities(text) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

/**
 * Creates a blob URL for download
 * @param {string} content - File content
 * @param {string} type - MIME type
 * @returns {string} Blob URL
 */
export function createBlobUrl(content, type) {
  const blob = new Blob([content], { type });
  return URL.createObjectURL(blob);
}

/**
 * Triggers file download
 * @param {string} url - File URL
 * @param {string} filename - Download filename
 */
export function downloadFile(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

```javascript
// src/js/utils/colorHelpers.js
/**
 * Extracts CSS variable value from document
 * @param {string} varName - CSS variable name
 * @returns {string} Color value
 */
export function getCssVariable(varName) {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

/**
 * Sets CSS variable on document root
 * @param {string} varName - CSS variable name
 * @param {string} value - Color value
 */
export function setCssVariable(varName, value) {
  document.documentElement.style.setProperty(varName, value);
}

/**
 * Removes CSS variable from document root
 * @param {string} varName - CSS variable name
 */
export function removeCssVariable(varName) {
  document.documentElement.style.removeProperty(varName);
}

/**
 * Checks if current theme is dark based on background color
 * @returns {boolean} True if dark theme
 */
export function isDarkTheme() {
  const bgColor = getCssVariable('--bg-primary');
  return bgColor.startsWith('#0') || bgColor.startsWith('#1') || bgColor.startsWith('#2');
}
```

```javascript
// src/js/utils/validators.js
/**
 * Validates zoom level is within bounds
 * @param {number} zoom - Zoom level to validate
 * @param {number} min - Minimum allowed
 * @param {number} max - Maximum allowed
 * @returns {number} Constrained zoom level
 */
export function constrainZoom(zoom, min, max) {
  return Math.max(min, Math.min(max, zoom));
}

/**
 * Validates theme name exists
 * @param {string} themeName - Theme name to validate
 * @param {string[]} validThemes - Array of valid theme names
 * @returns {boolean} True if valid
 */
export function isValidTheme(themeName, validThemes) {
  return validThemes.includes(themeName);
}
```

#### 3.4 Write Unit Tests for Utilities

```javascript
// tests/unit/utils/htmlHelpers.test.js
import { describe, it, expect } from 'vitest';
import { decodeHtmlEntities, createBlobUrl, downloadFile } from '@/utils/htmlHelpers';

describe('HTML Helpers', () => {
  describe('decodeHtmlEntities', () => {
    it('should decode &lt; to <', () => {
      expect(decodeHtmlEntities('&lt;')).toBe('<');
    });

    it('should decode &gt; to >', () => {
      expect(decodeHtmlEntities('&gt;')).toBe('>');
    });

    it('should decode &lbrace; to {', () => {
      expect(decodeHtmlEntities('&lbrace;')).toBe('{');
    });

    it('should handle plain text unchanged', () => {
      expect(decodeHtmlEntities('hello')).toBe('hello');
    });

    it('should handle mixed content', () => {
      const input = 'graph TD\n    A{Start}';
      expect(decodeHtmlEntities(input)).toBe(input);
    });
  });
});
```

```javascript
// tests/unit/utils/colorHelpers.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCssVariable, isDarkTheme } from '@/utils/colorHelpers';

describe('Color Helpers', () => {
  beforeEach(() => {
    // Mock getComputedStyle
    global.getComputedStyle = vi.fn(() => ({
      getPropertyValue: vi.fn(name => {
        if (name === '--bg-primary') return '#0d1117';
        return '';
      }),
    }));
  });

  describe('isDarkTheme', () => {
    it('should detect dark theme', () => {
      expect(isDarkTheme()).toBe(true);
    });
  });
});
```

#### 3.5 Integrate Constants into script.js (Feature Flag OFF)

```javascript
// Add to top of script.js
import { ZOOM, STORAGE_KEYS, VIEW_MODES } from './src/js/config/constants.js';

// Replace magic numbers
// OLD: let currentZoom = 100;
// NEW: let currentZoom = ZOOM.DEFAULT;

// OLD: localStorage.setItem('viewMode', mode);
// NEW: localStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode);
```

**Feature Flag:** Not needed (constants are data, no logic change)

**Success Criteria:**

- ✅ Constants extracted and documented
- ✅ Utilities tested (100% coverage)
- ✅ Old code uses new constants
- ✅ All features work identically
- ✅ No console errors

**Time Estimate:** 6-8 hours

---

## 🔧 Phase 4: Service Layer Extraction (Week 4)

**Goal:** Extract isolated services (Mermaid, Prism)

### **Tasks:**

#### 4.1 Create MermaidService

```javascript
// src/js/services/MermaidService.js
import { getCssVariable } from '../utils/colorHelpers.js';

export class MermaidService {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize Mermaid with theme colors
   */
  initialize() {
    const h1Color = getCssVariable('--h1-color');
    const h2Color = getCssVariable('--h2-color');
    const h3Color = getCssVariable('--h3-color');
    const bgSecondary = getCssVariable('--bg-secondary');
    const textPrimary = getCssVariable('--text-primary');

    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        primaryColor: bgSecondary,
        primaryTextColor: textPrimary,
        primaryBorderColor: h1Color,
        lineColor: h2Color,
        nodeBorder: h1Color,
        clusterBorder: h3Color,
        // ... all theme variables
      },
    });

    this.initialized = true;
  }

  /**
   * Render Mermaid diagram
   * @param {string} id - Element ID
   * @param {string} code - Mermaid code
   * @returns {Promise<string>} Rendered SVG
   */
  async render(id, code) {
    if (!this.initialized) {
      this.initialize();
    }

    try {
      const result = await mermaid.render(id, code);
      return result.svg;
    } catch (error) {
      console.error('Mermaid render error:', error);
      throw error;
    }
  }
}
```

#### 4.2 Create PrismService

```javascript
// src/js/services/PrismService.js
export class PrismService {
  /**
   * Highlight all code blocks in container
   * @param {HTMLElement} container - Container element
   */
  highlightAll(container) {
    if (typeof Prism === 'undefined') {
      console.warn('Prism not loaded');
      return;
    }

    container.querySelectorAll('pre code').forEach(block => {
      Prism.highlightElement(block);
    });
  }

  /**
   * Highlight single code block
   * @param {HTMLElement} block - Code block element
   */
  highlightElement(block) {
    if (typeof Prism === 'undefined') {
      console.warn('Prism not loaded');
      return;
    }

    Prism.highlightElement(block);
  }
}
```

#### 4.3 Write Service Tests

```javascript
// tests/unit/services/MermaidService.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MermaidService } from '@/services/MermaidService';

describe('MermaidService', () => {
  let service;

  beforeEach(() => {
    service = new MermaidService();
    global.mermaid = {
      initialize: vi.fn(),
      render: vi.fn().mockResolvedValue({ svg: '<svg></svg>' }),
    };
  });

  describe('initialize', () => {
    it('should initialize Mermaid with theme colors', () => {
      service.initialize();
      expect(global.mermaid.initialize).toHaveBeenCalled();
      expect(service.initialized).toBe(true);
    });
  });

  describe('render', () => {
    it('should render Mermaid diagram', async () => {
      const svg = await service.render('test-id', 'graph TD\n A-->B');
      expect(svg).toContain('<svg>');
      expect(global.mermaid.render).toHaveBeenCalledWith('test-id', 'graph TD\n A-->B');
    });

    it('should handle render errors', async () => {
      global.mermaid.render.mockRejectedValue(new Error('Parse error'));
      await expect(service.render('test-id', 'invalid')).rejects.toThrow('Parse error');
    });
  });
});
```

#### 4.4 Integrate Services (With Feature Flags)

```javascript
// Add to script.js
import { MermaidService } from './src/js/services/MermaidService.js';
import { PrismService } from './src/js/services/PrismService.js';

const FEATURE_FLAGS = {
  USE_SERVICE_LAYER: false, // Start with OFF
};

const mermaidService = new MermaidService();
const prismService = new PrismService();

// In renderMarkdown():
if (FEATURE_FLAGS.USE_SERVICE_LAYER) {
  // NEW: Use services
  await mermaidService.render(id, decodedCode);
  prismService.highlightAll(preview);
} else {
  // OLD: Existing code (untouched)
  mermaid.render(id, decodedCode);
  Prism.highlightElement(block);
}
```

**Success Criteria:**

- ✅ Services extracted and tested
- ✅ Feature flag OFF = old code runs
- ✅ Feature flag ON = new code runs
- ✅ Both paths produce identical results
- ✅ All baseline tests pass

**Time Estimate:** 6-8 hours

---

## 🏛️ Phase 5: Core Module Extraction (Week 5)

**Goal:** Extract core business logic

### **Tasks:**

#### 5.1 Create StorageManager

```javascript
// src/js/core/StorageManager.js
import { STORAGE_KEYS } from '../config/constants.js';

export class StorageManager {
  /**
   * Get item from localStorage
   * @param {string} key - Storage key
   * @returns {string|null} Stored value
   */
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }

  /**
   * Set item in localStorage
   * @param {string} key - Storage key
   * @param {string} value - Value to store
   * @returns {boolean} Success status
   */
  set(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  }

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  }

  /**
   * Check if key exists
   * @param {string} key - Storage key
   * @returns {boolean} True if exists
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Get JSON from storage
   * @param {string} key - Storage key
   * @returns {any} Parsed JSON or null
   */
  getJSON(key) {
    const value = this.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value);
    } catch (error) {
      console.error('JSON parse error:', error);
      return null;
    }
  }

  /**
   * Set JSON in storage
   * @param {string} key - Storage key
   * @param {any} value - Value to stringify and store
   * @returns {boolean} Success status
   */
  setJSON(key, value) {
    try {
      return this.set(key, JSON.stringify(value));
    } catch (error) {
      console.error('JSON stringify error:', error);
      return false;
    }
  }
}
```

#### 5.2 Create ThemeManager

```javascript
// src/js/core/ThemeManager.js
import { THEMES, STORAGE_KEYS } from '../config/constants.js';
import { setCssVariable, removeCssVariable } from '../utils/colorHelpers.js';

export class ThemeManager {
  constructor(storageManager) {
    this.storage = storageManager;
    this.currentTheme = null;
  }

  /**
   * Load and apply theme
   * @param {string} themeName - Theme to load
   * @returns {Promise<void>}
   */
  async loadTheme(themeName) {
    if (themeName === THEMES.CUSTOM) {
      return this.loadCustomTheme();
    }

    return this.loadBuiltInTheme(themeName);
  }

  /**
   * Load built-in theme from CSS file
   * @param {string} themeName - Theme name
   * @private
   */
  async loadBuiltInTheme(themeName) {
    // Remove custom inline styles
    this.clearInlineStyles();

    // Load theme CSS
    const stylesheet = document.getElementById('theme-stylesheet');
    stylesheet.href = `themes/${themeName}.css`;

    this.currentTheme = themeName;
    this.storage.set(STORAGE_KEYS.SELECTED_THEME, themeName);
  }

  /**
   * Load custom theme from localStorage
   * @private
   */
  loadCustomTheme() {
    const customTheme = this.storage.getJSON(STORAGE_KEYS.CUSTOM_THEME);

    if (!customTheme) {
      console.warn('No custom theme found');
      return this.loadTheme(THEMES.DEFAULT_LIGHT);
    }

    Object.entries(customTheme).forEach(([property, value]) => {
      setCssVariable(property, value);
    });

    this.currentTheme = THEMES.CUSTOM;
    this.storage.set(STORAGE_KEYS.SELECTED_THEME, THEMES.CUSTOM);
  }

  /**
   * Save custom theme
   * @param {Object} colors - Color variables object
   * @returns {boolean} Success status
   */
  saveCustomTheme(colors) {
    return this.storage.setJSON(STORAGE_KEYS.CUSTOM_THEME, colors);
  }

  /**
   * Get current theme colors
   * @returns {Object} Theme colors
   */
  getCurrentColors() {
    // Extract all CSS variables
    const colors = {};
    const style = getComputedStyle(document.documentElement);

    // Get all theme variables
    ['--bg-primary', '--bg-secondary', '--text-primary' /* etc */].forEach(varName => {
      colors[varName] = style.getPropertyValue(varName).trim();
    });

    return colors;
  }

  /**
   * Clear inline CSS variable overrides
   * @private
   */
  clearInlineStyles() {
    const root = document.documentElement;
    const styles = root.style;

    for (let i = styles.length - 1; i >= 0; i--) {
      const prop = styles[i];
      if (prop.startsWith('--')) {
        removeCssVariable(prop);
      }
    }
  }
}
```

#### 5.3 Write Core Module Tests

```javascript
// tests/unit/core/ThemeManager.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeManager } from '@/core/ThemeManager';

describe('ThemeManager', () => {
  let themeManager;
  let mockStorage;

  beforeEach(() => {
    mockStorage = {
      get: vi.fn(),
      set: vi.fn(),
      getJSON: vi.fn(),
      setJSON: vi.fn(),
    };
    themeManager = new ThemeManager(mockStorage);
  });

  describe('loadTheme', () => {
    it('should load built-in theme', async () => {
      await themeManager.loadTheme('default-dark');
      expect(mockStorage.set).toHaveBeenCalledWith('selectedTheme', 'default-dark');
    });

    it('should load custom theme from storage', async () => {
      mockStorage.getJSON.mockReturnValue({ '--h1-color': '#ff0000' });
      await themeManager.loadTheme('custom');
      expect(mockStorage.getJSON).toHaveBeenCalledWith('customTheme');
    });
  });

  describe('saveCustomTheme', () => {
    it('should save theme to storage', () => {
      const colors = { '--h1-color': '#00ff00' };
      themeManager.saveCustomTheme(colors);
      expect(mockStorage.setJSON).toHaveBeenCalledWith('customTheme', colors);
    });
  });
});
```

#### 5.4 Integrate with Feature Flags

```javascript
// script.js
const FEATURE_FLAGS = {
  USE_CORE_MODULES: false, // Start OFF
};

const storageManager = new StorageManager();
const themeManager = new ThemeManager(storageManager);

function changeTheme(themeName) {
  if (FEATURE_FLAGS.USE_CORE_MODULES) {
    // NEW PATH
    return themeManager.loadTheme(themeName);
  }

  // OLD PATH (existing code - untouched)
  // ... original changeTheme logic ...
}
```

**Success Criteria:**

- ✅ Core modules extracted
- ✅ 90%+ test coverage
- ✅ Feature flag OFF = old behavior
- ✅ Feature flag ON = new behavior
- ✅ Both paths identical
- ✅ No regression

**Time Estimate:** 10-12 hours

---

## 🎨 Phase 6: Feature Module Extraction (Week 6)

**Goal:** Extract feature controllers

### **Tasks:**

#### 6.1 Create ZoomController

```javascript
// src/js/features/preview/ZoomController.js
import { ZOOM, STORAGE_KEYS } from '../../config/constants.js';
import { constrainZoom } from '../../utils/validators.js';

export class ZoomController {
  constructor(previewElement, levelDisplay, storageManager) {
    this.preview = previewElement;
    this.levelDisplay = levelDisplay;
    this.storage = storageManager;
    this.currentZoom = ZOOM.DEFAULT;
  }
```
