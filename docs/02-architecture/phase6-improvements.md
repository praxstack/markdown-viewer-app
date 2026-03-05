# 🎯 Addressing Senior SDE Review - Complete Specifications

## 📋 Table of Contents

1. [Phase 6: Feature Modules (Complete Details)](#phase-6-complete)
2. [Performance Monitoring Strategy](#performance-strategy)
3. [Error Handling Patterns](#error-handling)
4. [LocalStorage Migration Strategy](#storage-migration)
5. [Detailed Testing Plan](#testing-plan)

---

## 🎨 Phase 6: Feature Modules (Complete Details) {#phase-6-complete}

### **Timeline:** Week 6 (40-50 hours)

### **Goal:** Extract all feature controllers with zero functionality loss

---

### **6.1 ZoomController (Complete Implementation)**

```javascript
// src/js/features/preview/ZoomController.js
import { ZOOM, STORAGE_KEYS } from '../../config/constants.js';
import { constrainZoom } from '../../utils/validators.js';

/**
 * @class ZoomController
 * @description Manages preview zoom functionality
 *
 * @example
 * const zoom = new ZoomController(previewEl, displayEl, storage);
 * zoom.zoomIn(); // Zoom to 110%
 * zoom.zoomOut(); // Zoom to 90%
 * zoom.reset(); // Back to 100%
 */
export class ZoomController {
  constructor(previewElement, levelDisplay, storageManager) {
    this.preview = previewElement;
    this.levelDisplay = levelDisplay;
    this.storage = storageManager;
    this.currentZoom = ZOOM.DEFAULT;

    // Bind methods
    this.zoomIn = this.zoomIn.bind(this);
    this.zoomOut = this.zoomOut.bind(this);
    this.reset = this.reset.bind(this);
  }

  /**
   * Initialize zoom from saved state
   */
  initialize() {
    const savedZoom = this.storage.get(STORAGE_KEYS.PREVIEW_ZOOM);
    if (savedZoom) {
      this.setZoom(parseInt(savedZoom, 10));
    }
  }

  /**
   * Set zoom level
   * @param {number} level - Zoom level percentage
   */
  setZoom(level) {
    this.currentZoom = constrainZoom(level, ZOOM.MIN, ZOOM.MAX);

    // Apply CSS transform
    this.preview.style.transform = `scale(${this.currentZoom / 100})`;
    this.preview.style.transformOrigin = 'top left';
    this.preview.style.width = `${10000 / this.currentZoom}%`;

    // Update display
    this.levelDisplay.textContent = `${this.currentZoom}%`;

    // Persist
    this.storage.set(STORAGE_KEYS.PREVIEW_ZOOM, this.currentZoom.toString());
  }

  /**
   * Zoom in by step amount
   */
  zoomIn() {
    this.setZoom(this.currentZoom + ZOOM.STEP);
  }

  /**
   * Zoom out by step amount
   */
  zoomOut() {
    this.setZoom(this.currentZoom - ZOOM.STEP);
  }

  /**
   * Reset to default zoom
   */
  reset() {
    this.setZoom(ZOOM.DEFAULT);
  }

  /**
   * Get current zoom level
   * @returns {number} Current zoom percentage
   */
  getCurrentZoom() {
    return this.currentZoom;
  }

  /**
   * Setup keyboard shortcuts
   * @param {Document} document - Document object
   */
  setupKeyboardShortcuts(document) {
    // Ctrl/Cmd + Plus/Minus/0
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.target.tagName !== 'TEXTAREA') {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          this.zoomIn();
        } else if (e.key === '-') {
          e.preventDefault();
          this.zoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          this.reset();
        }
      }
    });

    // Mouse wheel zoom
    this.preview.addEventListener('wheel', e => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          this.zoomIn();
        } else {
          this.zoomOut();
        }
      }
    });
  }
}
```

**Tests:**

```javascript
// tests/unit/features/ZoomController.test.js
describe('ZoomController', () => {
  let controller, mockPreview, mockDisplay, mockStorage;

  beforeEach(() => {
    mockPreview = { style: {} };
    mockDisplay = { textContent: '' };
    mockStorage = { get: vi.fn(), set: vi.fn() };
    controller = new ZoomController(mockPreview, mockDisplay, mockStorage);
  });

  it('should zoom in by 10%', () => {
    controller.setZoom(100);
    controller.zoomIn();
    expect(controller.getCurrentZoom()).toBe(110);
  });

  it('should not exceed max zoom', () => {
    controller.setZoom(200);
    controller.zoomIn();
    expect(controller.getCurrentZoom()).toBe(200);
  });
});
```

---

### **6.2 ViewModeController**

```javascript
// src/js/features/viewMode/ViewModeController.js
import { VIEW_MODES, STORAGE_KEYS } from '../../config/constants.js';

/**
 * @class ViewModeController
 * @description Manages editor/preview view modes
 */
export class ViewModeController {
  constructor(editorContainer, previewContainer, storageManager) {
    this.editor = editorContainer;
    this.preview = previewContainer;
    this.storage = storageManager;
    this.currentMode = VIEW_MODES.DEFAULT;
    this.buttons = new Map();
  }

  /**
   * Register view mode button
   * @param {string} mode - View mode name
   * @param {HTMLElement} button - Button element
   */
  registerButton(mode, button) {
    this.buttons.set(mode, button);
  }

  /**
   * Set view mode
   * @param {string} mode - Mode to set
   */
  setMode(mode) {
    // Remove active from all buttons
    this.buttons.forEach(btn => btn.classList.remove('active'));

    // Apply mode
    switch (mode) {
      case VIEW_MODES.EDITOR_ONLY:
        this.editor.style.display = 'flex';
        this.preview.style.display = 'none';
        break;
      case VIEW_MODES.SPLIT_VIEW:
        this.editor.style.display = 'flex';
        this.preview.style.display = 'flex';
        break;
      case VIEW_MODES.PREVIEW_ONLY:
        this.editor.style.display = 'none';
        this.preview.style.display = 'flex';
        break;
      default:
        console.warn(`Unknown view mode: ${mode}`);
        return;
    }

    // Set active button
    const button = this.buttons.get(mode);
    if (button) {
      button.classList.add('active');
    }

    this.currentMode = mode;
    this.storage.set(STORAGE_KEYS.VIEW_MODE, mode);
  }

  /**
   * Initialize from saved state
   */
  initialize() {
    const savedMode = this.storage.get(STORAGE_KEYS.VIEW_MODE) || VIEW_MODES.DEFAULT;
    this.setMode(savedMode);
  }

  /**
   * Get current view mode
   * @returns {string} Current mode
   */
  getCurrentMode() {
    return this.currentMode;
  }
}
```

---

### **6.3 ExportController (HTML & PDF)**

```javascript
// src/js/features/export/ExportController.js
import { PDF_CONFIG, STORAGE_KEYS } from '../../config/constants.js';
import { createBlobUrl, downloadFile } from '../../utils/htmlHelpers.js';
import { getCssVariable } from '../../utils/colorHelpers.js';

/**
 * @class ExportController
 * @description Manages HTML and PDF export functionality
 */
export class ExportController {
  constructor(previewElement, themeManager, storageManager) {
    this.preview = previewElement;
    this.themeManager = themeManager;
    this.storage = storageManager;
  }

  /**
   * Export as HTML
   * @returns {Promise<void>}
   */
  async exportHTML() {
    const currentTheme = this.storage.get(STORAGE_KEYS.SELECTED_THEME);
    let themeCSS = '';

    if (currentTheme === 'custom') {
      themeCSS = this.generateCustomThemeCSS();
    } else {
      themeCSS = await this.fetchThemeCSS(currentTheme);
    }

    const html = this.generateHTMLDocument(themeCSS);
    const url = createBlobUrl(html, 'text/html');
    downloadFile(url, 'markdown-export.html');
  }

  /**
   * Export as PDF
   * @returns {Promise<void>}
   */
  async exportPDF() {
    if (typeof html2pdf === 'undefined') {
      throw new Error('PDF library not loaded');
    }

    const element = this.preview.cloneNode(true);
    const container = this.createPDFContainer(element);

    const options = {
      margin: PDF_CONFIG.MARGIN,
      filename: PDF_CONFIG.FILENAME,
      image: { type: 'jpeg', quality: PDF_CONFIG.QUALITY },
      html2canvas: {
        scale: PDF_CONFIG.SCALE,
        useCORS: true,
        letterRendering: true,
        backgroundColor: getCssVariable('--bg-primary'),
      },
      jsPDF: {
        unit: 'in',
        format: PDF_CONFIG.FORMAT,
        orientation: PDF_CONFIG.ORIENTATION,
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    return html2pdf().set(options).from(container).save();
  }

  /**
   * Create container for PDF with theme styles
   * @param {HTMLElement} content - Content to wrap
   * @returns {HTMLElement} Styled container
   * @private
   */
  createPDFContainer(content) {
    const container = document.createElement('div');
    container.style.fontFamily =
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    container.style.maxWidth = '800px';
    container.style.margin = '0 auto';
    container.style.padding = '40px 20px';
    container.style.lineHeight = '1.7';
    container.style.backgroundColor = getCssVariable('--bg-primary');
    container.style.color = getCssVariable('--text-primary');
    container.appendChild(content);
    return container;
  }

  /**
   * Generate custom theme CSS
   * @returns {string} CSS string
   * @private
   */
  generateCustomThemeCSS() {
    const customTheme = this.storage.getJSON(STORAGE_KEYS.CUSTOM_THEME);
    if (!customTheme) return '';

    let css = ':root {\n';
    Object.entries(customTheme).forEach(([property, value]) => {
      css += `    ${property}: ${value};\n`;
    });
    css += '}';
    return css;
  }

  /**
   * Fetch theme CSS file
   * @param {string} themeName - Theme name
   * @returns {Promise<string>} CSS content
   * @private
   */
  async fetchThemeCSS(themeName) {
    try {
      const response = await fetch(`themes/${themeName}.css`);
      return await response.text();
    } catch (error) {
      console.error('Failed to fetch theme CSS:', error);
      return '';
    }
  }

  /**
   * Generate complete HTML document
   * @param {string} themeCSS - Theme CSS content
   * @returns {string} Complete HTML document
   * @private
   */
  generateHTMLDocument(themeCSS) {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Exported Markdown</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            line-height: 1.7;
        }
        ${themeCSS}
        body {
            background-color: var(--bg-primary);
            color: var(--text-primary);
        }
        h1 { color: var(--h1-color); font-size: 2.5em; }
        /* ... all styles ... */
    </style>
</head>
<body>
    ${this.preview.innerHTML}
</body>
</html>`;
  }
}
```

**Tests:**

```javascript
// tests/unit/features/ExportController.test.js
describe('ExportController', () => {
  describe('exportHTML', () => {
    it('should generate HTML with theme', async () => {});
    it('should handle custom theme', async () => {});
  });

  describe('exportPDF', () => {
    it('should configure PDF with correct margins', async () => {});
    it('should throw error if html2pdf not loaded', async () => {});
  });
});
```

---

### **6.4 MarkdownEditorController**

```javascript
// src/js/features/editor/MarkdownEditorController.js
import { STORAGE_KEYS } from '../../config/constants.js';

/**
 * @class MarkdownEditorController
 * @description Manages markdown editor functionality
 */
export class MarkdownEditorController {
  constructor(editorElement, storageManager) {
    this.editor = editorElement;
    this.storage = storageManager;
    this.changeListeners = [];
  }

  /**
   * Initialize editor
   * @param {string} defaultContent - Default markdown content
   */
  initialize(defaultContent = '') {
    const saved = this.storage.get(STORAGE_KEYS.MARKDOWN_CONTENT);
    this.setValue(saved || defaultContent);
    this.setupEventListeners();
  }

  /**
   * Get editor value
   * @returns {string} Markdown content
   */
  getValue() {
    return this.editor.value;
  }

  /**
   * Set editor value
   * @param {string} content - Markdown content
   */
  setValue(content) {
    this.editor.value = content;
    this.notifyChange(content);
  }

  /**
   * Setup event listeners
   * @private
   */
  setupEventListeners() {
    this.editor.addEventListener('input', () => {
      const content = this.getValue();
      this.storage.set(STORAGE_KEYS.MARKDOWN_CONTENT, content);
      this.notifyChange(content);
    });
  }

  /**
   * Subscribe to content changes
   * @param {Function} callback - Change handler
   */
  onChange(callback) {
    this.changeListeners.push(callback);
  }

  /**
   * Notify all change listeners
   * @param {string} content - New content
   * @private
   */
  notifyChange(content) {
    this.changeListeners.forEach(cb => cb(content));
  }
}
```

---

### **6.5 Feature Module Integration Pattern**

```javascript
// script.js - Integration with feature flags
const FEATURE_FLAGS = {
  USE_ZOOM_CONTROLLER: false,
  USE_VIEW_MODE_CONTROLLER: false,
  USE_EXPORT_CONTROLLER: false,
  USE_EDITOR_CONTROLLER: false,
};

// Instantiate controllers
const zoomController = new ZoomController(preview, zoomDisplay, storageManager);
const viewModeController = new ViewModeController(
  editorContainer,
  previewContainer,
  storageManager
);
const exportController = new ExportController(preview, themeManager, storageManager);
const editorController = new MarkdownEditorController(editor, storageManager);

// Zoom button handlers
zoomInBtn.addEventListener('click', () => {
  if (FEATURE_FLAGS.USE_ZOOM_CONTROLLER) {
    zoomController.zoomIn();
  } else {
    // OLD CODE
    zoomIn();
  }
});

// Export button handlers
exportPdfBtn.addEventListener('click', async () => {
  if (FEATURE_FLAGS.USE_EXPORT_CONTROLLER) {
    await exportController.exportPDF();
  } else {
    // OLD CODE
    exportPDF();
  }
});
```

---

## 📊 Performance Monitoring Strategy (Complete) {#performance-strategy}

### **Implementation:**

#### **1. Performance Monitor Class**

```javascript
// src/js/core/PerformanceMonitor.js

/**
 * @class PerformanceMonitor
 * @description Tracks and reports performance metrics
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.thresholds = {
      'markdown-render': 50, // ms
      'theme-switch': 100, // ms
      'pdf-export': 3000, // ms
      'html-export': 500, // ms
      'mermaid-render': 200, // ms
      'zoom-change': 10, // ms
    };
  }

  /**
   * Start timing an operation
   * @param {string} name - Operation name
   * @returns {string} Timing ID
   */
  start(name) {
    const id = `${name}-${Date.now()}`;
    this.metrics.set(id, {
      name,
      startTime: performance.now(),
      endTime: null,
      duration: null,
    });
    return id;
  }

  /**
   * End timing an operation
   * @param {string} id - Timing ID from start()
   * @returns {number} Duration in milliseconds
   */
  end(id) {
    const metric = this.metrics.get(id);
    if (!metric) {
      console.warn(`No metric found for ID: ${id}`);
      return 0;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    // Check against threshold
    const threshold = this.thresholds[metric.name];
    if (threshold && metric.duration > threshold) {
      console.warn(
        `⚠️ Performance: ${metric.name} took ${metric.duration.toFixed(2)}ms ` +
          `(threshold: ${threshold}ms)`
      );
    }

    return metric.duration;
  }

  /**
   * Benchmark a function
   * @param {string} name - Operation name
   * @param {Function} fn - Function to benchmark
   * @returns {any} Function result
   */
  benchmark(name, fn) {
    const id = this.start(name);
    try {
      const result = fn();
      this.end(id);
      return result;
    } catch (error) {
      this.end(id);
      throw error;
    }
  }

  /**
   * Benchmark async function
   * @param {string} name - Operation name
   * @param {Function} fn - Async function to benchmark
   * @returns {Promise<any>} Function result
   */
  async benchmarkAsync(name, fn) {
    const id = this.start(name);
    try {
      const result = await fn();
      this.end(id);
      return result;
    } catch (error) {
      this.end(id);
      throw error;
    }
  }

  /**
   * Get performance report
   * @returns {Object} Performance statistics
   */
  getReport() {
    const report = {};

    this.metrics.forEach((metric, id) => {
      if (!report[metric.name]) {
        report[metric.name] = {
          count: 0,
          total: 0,
          avg: 0,
          min: Infinity,
          max: 0,
        };
      }

      const stats = report[metric.name];
      stats.count++;
      stats.total += metric.duration;
      stats.min = Math.min(stats.min, metric.duration);
      stats.max = Math.max(stats.max, metric.duration);
      stats.avg = stats.total / stats.count;
    });

    return report;
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear();
  }
}
```

#### **2. Usage in Code:**

```javascript
// Initialize monitor
const perfMonitor = new PerformanceMonitor();

// Benchmark markdown rendering
function renderMarkdown() {
  return perfMonitor.benchmark('markdown-render', () => {
    const html = marked.parse(editor.value);
    preview.innerHTML = html;
    return html;
  });
}

// Benchmark async PDF export
async function exportPDF() {
  return perfMonitor.benchmarkAsync('pdf-export', async () => {
    return await html2pdf().from(preview).save();
  });
}

// Get performance report
console.table(perfMonitor.getReport());
```

#### **3. Performance Testing:**

```javascript
// tests/performance/benchmark.test.js
describe('Performance Benchmarks', () => {
  const perfMonitor = new PerformanceMonitor();

  it('markdown rendering should be <50ms', () => {
    const duration = perfMonitor.benchmark('markdown-render', () => {
      renderMarkdown(SAMPLE_DOCUMENT);
    });
    expect(duration).toBeLessThan(50);
  });

  it('theme switching should be <100ms', () => {
    const duration = perfMonitor.benchmark('theme-switch', () => {
      changeTheme('ocean-dark');
    });
    expect(duration).toBeLessThan(100);
  });

  it('should not regress more than 10%', () => {
    const baseline = loadBaselineMetrics();
    const current = perfMonitor.getReport();

    Object.keys(baseline).forEach(metric => {
      const increase = (current[metric].avg - baseline[metric].avg) / baseline[metric].avg;
      expect(increase).toBeLessThan(0.1); // <10% increase
    });
  });
});
```

---

## 🚨 Error Handling Patterns (Complete) {#error-handling}

### **1. Error Boundary Pattern**

```javascript
// src/js/core/ErrorBoundary.js

/**
 * @class ErrorBoundary
 * @description Wraps functions with error handling
 */
export class ErrorBoundary {
  /**
   * Wrap function with try-catch
   * @param {Function} fn - Function to wrap
   * @param {Function} fallback - Fallback function on error
   * @param {string} context - Error context for logging
   * @returns {Function} Wrapped function
   */
  static wrap(fn, fallback = null, context = 'Unknown') {
    return (...args) => {
      try {
        return fn(...args);
      } catch (error) {
        console.error(`[ErrorBoundary] ${context}:`, error);

        // Track error
        if (window.errorTracker) {
          window.errorTracker.trackError(error, context);
        }

        // Execute fallback
        if (fallback) {
          return fallback(...args);
        }

        return null;
      }
    };
  }

  /**
   * Wrap async function with error handling
   * @param {Function} fn - Async function to wrap
   * @param {Function} fallback - Fallback function on error
   * @param {string} context - Error context
   * @returns {Function} Wrapped async function
   */
  static wrapAsync(fn, fallback = null, context = 'Unknown') {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        console.error(`[ErrorBoundary] ${context}:`, error);

        if (window.errorTracker) {
          window.errorTracker.trackError(error, context);
        }

        if (fallback) {
          return await fallback(...args);
        }

        return null;
      }
    };
  }
}
```

#### **2. Error Handling Strategy by Layer:**

```javascript
// Application Layer Errors
const safeRenderMarkdown = ErrorBoundary.wrap(
  renderMarkdown,
  () => '<p>Failed to render markdown. Please check your syntax.</p>',
  'Markdown Rendering'
);

// Service Layer Errors
const safeMermaidRender = ErrorBoundary.wrapAsync(
  mermaidService.render.bind(mermaidService),
  async (id, code) => '<p style="color: red;">Diagram rendering failed</p>',
  'Mermaid Service'
);

// Storage Layer Errors
const safeStorageGet = ErrorBoundary.wrap(
  storageManager.get.bind(storageManager),
  () => null,
  'Storage Get'
);

// Export Layer Errors
const safePDFExport = ErrorBoundary.wrapAsync(
  exportController.exportPDF.bind(exportController),
  async () => {
    alert('PDF export failed. Please try HTML export instead.');
    return exportController.exportHTML();
  },
  'PDF Export'
);
```

#### **3. Error Tracking System:**

```javascript
// src/js/core/ErrorTracker.js

/**
 * @class ErrorTracker
 * @description Tracks and reports errors
 */
export class ErrorTracker {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
  }

  /**
   * Track an error
   * @param {Error} error - Error object
   * @param {string} context - Where error occurred
   * @param {Object} metadata - Additional data
   */
  trackError(error, context, metadata = {}) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      context,
      metadata,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.errors.push(errorEntry);

    // Limit array size
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log to console in dev
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorTracker]', errorEntry);
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(errorEntry);
    }
  }

  /**
   * Get error report
   * @returns {Array} List of errors
   */
  getErrors() {
    return [...this.errors];
  }

  /**
   * Clear error history
   */
  clear() {
    this.errors = [];
  }

  /**
   * Send error to monitoring service
   * @param {Object} errorEntry - Error data
   * @private
   */
  sendToMonitoring(errorEntry) {
    // Implement based on monitoring service
    // Example: Sentry, LogRocket, etc.
    console.log('Would send to monitoring:', errorEntry);
  }
}

// Global error tracker
window.errorTracker = new ErrorTracker();

// Catch unhandled errors
window.addEventListener('error', event => {
  window.errorTracker.trackError(new Error(event.message), 'Unhandled Error', {
    filename: event.filename,
    lineno: event.lineno,
  });
});

// Catch unhandled promise rejections
window.addEventListener('unhandledrejection', event => {
  window.errorTracker.trackError(new Error(event.reason), 'Unhandled Promise Rejection');
});
```

---

## 💾 LocalStorage Migration Strategy (Complete) {#storage-migration}

### **Problem:**

User upgrades to new version with refactored storage format. Old data might be incompatible.

### **Solution: Migration System**

#### **1. Version Tracking:**

```javascript
// src/js/core/StorageManager.js (Enhanced)

export class StorageManager {
  constructor() {
    this.CURRENT_VERSION = 2; // Bump when format changes
    this.VERSION_KEY = '__storage_version';
  }

  /**
   * Initialize storage with migration
   */
  initialize() {
    const version = this.getVersion();

    if (version === null) {
      // First time user or v1 user
      this.migrateFromV1ToV2();
      this.setVersion(this.CURRENT_VERSION);
    } else if (version < this.CURRENT_VERSION) {
      // Old version, needs migration
      this.migrate(version, this.CURRENT_VERSION);
      this.setVersion(this.CURRENT_VERSION);
    }
  }

  /**
   * Get storage version
   * @returns {number|null} Version number
   * @private
   */
  getVersion() {
    const version = localStorage.getItem(this.VERSION_KEY);
    return version ? parseInt(version, 10) : null;
  }

  /**
   * Set storage version
   * @param {number} version - Version number
   * @private
   */
  setVersion(version) {
    localStorage.setItem(this.VERSION_KEY, version.toString());
  }

  /**
   * Migrate from V1 to V2
   * @private
   */
  migrateFromV1ToV2() {
    console.log('[Migration] Migrating from V1 to V2');

    // V1 format: direct localStorage access
    // V2 format: managed by StorageManager

    // Example: Rename old keys if needed
    const oldThemeKey = 'theme'; // hypothetical old key
    const oldTheme = localStorage.getItem(oldThemeKey);

    if (oldTheme) {
      localStorage.setItem('selectedTheme', oldTheme);
      localStorage.removeItem(oldThemeKey);
      console.log('[Migration] Migrated theme data');
    }

    // Validate all existing data
    this.validateV2Data();
  }

  /**
   * Migrate between versions
   * @param {number} fromVersion - Source version
   * @param {number} toVersion - Target version
   * @private
   */
  migrate(fromVersion, toVersion) {
    console.log(`[Migration] Migrating from V${fromVersion}
```
