/**
 * @file LinkNavigationService.js
 * @description Intelligent markdown link navigation with File System Access API integration
 * @module services/LinkNavigationService
 */

import {
  isAnchorLink,
  isExternalUrl,
  isMarkdownFile,
  normalizePath,
  resolveRelativePath,
} from '../utils/pathHelpers.js';

/**
 * @class LinkNavigationService
 * @description Handles intelligent routing of markdown links within folder browser context
 */
export class LinkNavigationService {
  /**
   * @constructor
   * @param {Object} folderBrowserService - FolderBrowserService instance
   * @param {Function} onNavigate - Callback when file should be loaded
   */
  constructor(folderBrowserService, onNavigate) {
    this.folderService = folderBrowserService;
    this.onNavigate = onNavigate;

    // File handle cache: normalized_path -> FileSystemFileHandle
    this.fileHandleCache = new Map();

    // Current file context
    this.currentFilePath = '';
    this.currentFolderHandle = null;

    // Breadcrumb navigation stack
    this.navigationHistory = [];
  }

  /**
   * Initialize link interceptor on preview container
   * @param {HTMLElement} previewContainer - Preview container element
   */
  initialize(previewContainer) {
    if (!previewContainer) {
      console.error('[LinkNav] Preview container not found');
      return;
    }

    // Event delegation for link clicks
    previewContainer.addEventListener('click', this.handleLinkClick.bind(this));

    console.log('✅ Link navigation initialized');
  }

  /**
   * Build file handle cache from folder structure
   * @param {FileSystemDirectoryHandle} dirHandle - Root directory handle
   * @param {string} basePath - Base path for recursion
   */
  async buildFileCache(dirHandle, basePath = '') {
    if (!dirHandle) {
      return;
    }

    this.currentFolderHandle = dirHandle;
    this.fileHandleCache.clear();

    try {
      await this._recursiveCacheBuild(dirHandle, basePath);
      console.log(`[LinkNav] Cached ${this.fileHandleCache.size} markdown files`);
    } catch (error) {
      console.error('[LinkNav] Cache build failed:', error);
    }
  }

  /**
   * Recursive cache building
   * @private
   */
  async _recursiveCacheBuild(dirHandle, basePath) {
    for await (const entry of dirHandle.values()) {
      const fullPath = basePath ? `${basePath}/${entry.name}` : entry.name;
      const normalized = normalizePath(fullPath);

      if (entry.kind === 'file' && isMarkdownFile(entry.name)) {
        this.fileHandleCache.set(normalized, entry);
      } else if (entry.kind === 'directory') {
        await this._recursiveCacheBuild(entry, fullPath);
      }
    }
  }

  /**
   * Maximum navigation history size to prevent unbounded memory growth
   * @private
   */
  static MAX_HISTORY_SIZE = 100;

  /**
   * Set current file context (call when file is opened)
   * @param {string} filePath - Current file path
   */
  setCurrentFile(filePath) {
    this.currentFilePath = normalizePath(filePath);

    // Add to navigation history (avoid duplicates)
    if (
      this.navigationHistory.length === 0 ||
      this.navigationHistory[this.navigationHistory.length - 1] !== this.currentFilePath
    ) {
      // Limit history size to prevent unbounded memory growth
      if (this.navigationHistory.length >= LinkNavigationService.MAX_HISTORY_SIZE) {
        this.navigationHistory.shift(); // Remove oldest entry
      }
      this.navigationHistory.push(this.currentFilePath);
    }
  }

  /**
   * Handle link click events
   * @param {Event} event - Click event
   */
  async handleLinkClick(event) {
    const link = event.target.closest('a');
    if (!link) {
      return;
    }

    const href = link.getAttribute('href');
    if (!href) {
      return;
    }

    // Anchor links - let default handler scroll
    if (isAnchorLink(href)) {
      return;
    }

    // External links - open in new tab (default behavior)
    if (isExternalUrl(href)) {
      return;
    }

    // Markdown file links (with optional anchor) - intercept and handle
    // Supports: file.md, ./file.md, ../folder/file.md, file.md#heading
    if (isMarkdownFile(href) || this.isMarkdownFileWithAnchor(href)) {
      event.preventDefault();
      await this.navigateToMarkdownFile(href);
    }
  }

  /**
   * Check if href is a markdown file with anchor (e.g., file.md#heading)
   * @param {string} href - Link href
   * @returns {boolean} True if markdown file with anchor
   */
  isMarkdownFileWithAnchor(href) {
    if (!href) {
      return false;
    }
    // Match patterns like: file.md#heading, ./path/file.md#section
    return /\.md#/i.test(href);
  }

  /**
   * Navigate to relative markdown file
   * @param {string} relativePath - Relative path from current file (may include #anchor)
   */
  async navigateToMarkdownFile(relativePath) {
    if (!this.currentFilePath) {
      this.showWarning(
        'No file currently open',
        'Please open a file from the folder browser first.',
      );
      return;
    }

    // Extract anchor if present (e.g., "file.md#heading" → "file.md" + "heading")
    const { filePath: cleanPath, anchor } = this.parsePathWithAnchor(relativePath);

    // Resolve absolute path
    const targetPath = this.resolveTargetPath(cleanPath);
    console.log(
      `[LinkNav] Navigating: ${this.currentFilePath} → ${targetPath}${anchor ? `#${anchor}` : ''}`,
    );

    // Check cache
    if (this.fileHandleCache.has(targetPath)) {
      const fileHandle = this.fileHandleCache.get(targetPath);
      await this.loadFile(fileHandle, targetPath, anchor);
      return;
    }

    // File not found in cache
    this.showFileNotFoundModal(targetPath);
  }

  /**
   * Parse path with optional anchor (e.g., "file.md#heading")
   * @param {string} href - Full href with optional anchor
   * @returns {{filePath: string, anchor: string|null}} Parsed path and anchor
   */
  parsePathWithAnchor(href) {
    if (!href) {
      return { filePath: '', anchor: null };
    }

    const hashIndex = href.indexOf('#');
    if (hashIndex === -1) {
      return { filePath: href, anchor: null };
    }

    return {
      filePath: href.substring(0, hashIndex),
      anchor: href.substring(hashIndex + 1) || null,
    };
  }

  /**
   * Resolve target path from relative link
   * @param {string} relativePath - Relative path
   * @returns {string} Absolute normalized path
   */
  resolveTargetPath(relativePath) {
    // If already absolute (starts with /), use as-is
    if (relativePath.startsWith('/')) {
      return normalizePath(relativePath.slice(1));
    }

    // Resolve relative to current file
    return normalizePath(resolveRelativePath(this.currentFilePath, relativePath));
  }

  /**
   * Load file from handle
   * @param {FileSystemFileHandle} fileHandle - File handle
   * @param {string} filePath - File path for context
   * @param {string|null} anchor - Optional anchor to scroll to after load
   */
  async loadFile(fileHandle, filePath, anchor = null) {
    try {
      const file = await fileHandle.getFile();
      const content = await file.text();

      // Update current context
      this.setCurrentFile(filePath);

      // Trigger callback to load in editor
      if (this.onNavigate) {
        this.onNavigate({
          content,
          name: file.name,
          path: filePath,
          handle: fileHandle,
          anchor, // Pass anchor for scroll-to-section after render
        });
      }

      console.log(`[LinkNav] ✅ Loaded: ${filePath}${anchor ? `#${anchor}` : ''}`);
    } catch (error) {
      console.error('[LinkNav] File load error:', error);
      this.showWarning('Failed to load file', `Could not read file: ${error.message}`);
    }
  }

  /**
   * Show file not found modal
   * @param {string} filePath - Missing file path
   */
  showFileNotFoundModal(filePath) {
    // Check if modal exists, create if not
    let modal = document.getElementById('file-not-found-modal');

    if (!modal) {
      modal = this.createFileNotFoundModal();
      document.body.appendChild(modal);
    }

    // Update modal content
    const pathElement = modal.querySelector('#missing-file-path');
    if (pathElement) {
      pathElement.textContent = filePath;
    }

    // Show modal
    modal.classList.add('active');

    console.warn(`[LinkNav] File not found: ${filePath}`);
  }

  /**
   * Create file not found modal element
   * @private
   * @returns {HTMLElement} Modal element
   */
  createFileNotFoundModal() {
    const modal = document.createElement('div');
    modal.id = 'file-not-found-modal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>📂 File Not Found</h2>
          <button class="close-btn" id="close-file-not-found-modal">&times;</button>
        </div>
        <p>The linked file <code id="missing-file-path"></code> was not found in the current folder.</p>
        <p class="hint">This file may be in a different folder or may not exist.</p>
        <div class="modal-actions">
          <button class="btn" id="close-modal-btn">Close</button>
        </div>
      </div>
    `;

    // Event listeners
    const closeBtn = modal.querySelector('#close-file-not-found-modal');
    const closeModalBtn = modal.querySelector('#close-modal-btn');

    const closeHandler = () => modal.classList.remove('active');

    closeBtn?.addEventListener('click', closeHandler);
    closeModalBtn?.addEventListener('click', closeHandler);

    modal.addEventListener('click', e => {
      if (e.target === modal) {
        closeHandler();
      }
    });

    return modal;
  }

  /**
   * Show warning message
   * @param {string} title - Warning title
   * @param {string} message - Warning message
   */
  showWarning(title, message) {
    alert(`${title}\n\n${message}`);
  }

  /**
   * Clear cache and reset state
   */
  reset() {
    this.fileHandleCache.clear();
    this.currentFilePath = '';
    this.currentFolderHandle = null;
    this.navigationHistory = [];
    console.log('[LinkNav] Reset complete');
  }

  /**
   * Get current navigation breadcrumb
   * @returns {string[]} Navigation history
   */
  getBreadcrumb() {
    return [...this.navigationHistory];
  }
}
