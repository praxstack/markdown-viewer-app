/**
 * FolderBrowserService - File System Browser Service (Enterprise Grade)
 *
 * Handles folder access, recursive scanning, and file management using
 * the File System Access API (Chrome 86+, Edge 86+).
 *
 * Features:
 * - Recursive directory scanning
 * - File filtering (.md, .markdown)
 * - Tree structure generation
 * - Permission management
 * - Error handling and graceful degradation
 *
 * Architecture:
 * - Single Responsibility: Folder/file operations only
 * - Dependency Injection: Receives StorageManager
 * - Error Handling: Never throws, returns error states
 * - Performance: Depth limiting, file count caps
 */

import { ERROR_MESSAGES, getErrorMessage } from '../config/errorMessages.js';

/**
 * @class FolderBrowserService
 * @description Enterprise-grade service for browsing markdown files in folders
 *
 * @example
 * const service = new FolderBrowserService(storageManager);
 * const result = await service.openFolder();
 * if (result.success) {
 *   renderTree(result.files);
 * }
 */
export class FolderBrowserService {
  constructor(storageManager) {
    this.storage = storageManager;
    this.currentDirectoryHandle = null;
    this.maxDepth = 10; // Prevent infinite recursion
    this.maxFiles = 1000; // Performance cap
    this.fileCount = 0;
    this.lastScanResult = null; // Cache for refresh operations
    this.flattenedFilesCache = null;
    this.itemsCache = null;
  }

  /**
   * Check if File System Access API is supported
   *
   * @returns {boolean} True if supported
   */
  isSupported() {
    return 'showDirectoryPicker' in window;
  }

  /**
   * Request user to select a folder
   *
   * @returns {Promise<Object>} Result with success, files, or error
   *
   * @example
   * const result = await service.openFolder();
   * if (result.success) {
   *   console.log(`Found ${result.files.length} markdown files`);
   * }
   */
  async openFolder() {
    if (!this.isSupported()) {
      return {
        success: false,
        error: ERROR_MESSAGES.API_NOT_SUPPORTED,
        files: [],
      };
    }

    try {
      // Request folder access
      const dirHandle = await window.showDirectoryPicker({
        mode: 'read', // Only read access needed
      });

      this.currentDirectoryHandle = dirHandle;
      this.fileCount = 0;

      // Reset caches
      this.flattenedFilesCache = null;
      this.itemsCache = null;

      // Scan directory recursively
      const files = await this.scanDirectory(dirHandle);

      // Store permission for future use
      this.storage.set('lastFolderName', dirHandle.name);

      // Cache result for refresh
      this.lastScanResult = {
        success: true,
        files,
        folderName: dirHandle.name,
        totalFiles: this.fileCount,
      };

      return this.lastScanResult;
    } catch (error) {
      if (error.name === 'AbortError') {
        // User cancelled - not an error
        return {
          success: false,
          cancelled: true,
          files: [],
        };
      }

      console.error('Folder access error:', error);
      return {
        success: false,
        error: error.message,
        files: [],
      };
    }
  }

  /**
   * Recursively scan directory for markdown files
   *
   * @param {FileSystemDirectoryHandle} dirHandle - Directory to scan
   * @param {string} path - Current path (for display)
   * @param {number} depth - Current recursion depth
   * @returns {Promise<Array>} Array of file and directory objects
   * @private
   */
  async scanDirectory(dirHandle, path = '', depth = 0) {
    // Prevent excessive recursion
    if (depth > this.maxDepth) {
      console.warn(getErrorMessage(ERROR_MESSAGES.MAX_DEPTH_REACHED, this.maxDepth, path));
      return [];
    }

    // Prevent scanning too many files
    if (this.fileCount >= this.maxFiles) {
      console.warn(getErrorMessage(ERROR_MESSAGES.MAX_FILES_REACHED, this.maxFiles));
      return [];
    }

    const items = [];

    try {
      for await (const entry of dirHandle.values()) {
        // Skip hidden files/folders
        if (entry.name.startsWith('.')) {
          continue;
        }

        // Skip common ignore patterns
        if (this.shouldIgnore(entry.name)) {
          continue;
        }

        if (entry.kind === 'file') {
          // Check if markdown file
          if (this.isMarkdownFile(entry.name)) {
            this.fileCount++;

            items.push({
              type: 'file',
              name: entry.name,
              path: path + entry.name,
              handle: entry,
              extension: this.getExtension(entry.name),
              size: 0, // Will be loaded on demand
            });
          }
        } else if (entry.kind === 'directory') {
          // Recursively scan subdirectory
          const children = await this.scanDirectory(entry, `${path + entry.name}/`, depth + 1);

          // Only include folders with markdown files
          if (children.length > 0) {
            items.push({
              type: 'directory',
              name: entry.name,
              path: `${path + entry.name}/`,
              handle: entry,
              children,
              expanded: false,
              fileCount: this.countFiles(children),
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning ${path}:`, error);
    }

    // Sort: folders first, then files, alphabetically
    return items.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name, undefined, { numeric: true });
    });
  }

  /**
   * Read content from a file handle
   *
   * @param {FileSystemFileHandle} fileHandle - File to read
   * @returns {Promise<Object>} Result with content or error
   *
   * @example
   * const result = await service.readFile(fileHandle);
   * if (result.success) {
   *   editor.value = result.content;
   * }
   */
  async readFile(fileHandle) {
    try {
      const file = await fileHandle.getFile();
      const content = await file.text();

      return {
        success: true,
        content,
        name: file.name,
        size: file.size,
        lastModified: new Date(file.lastModified),
      };
    } catch (error) {
      console.error('Error reading file:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Check if filename is a markdown file
   *
   * @param {string} filename - Filename to check
   * @returns {boolean} True if markdown file
   * @private
   */
  isMarkdownFile(filename) {
    const lower = filename.toLowerCase();
    return lower.endsWith('.md') || lower.endsWith('.markdown');
  }

  /**
   * Get file extension
   *
   * @param {string} filename - Filename
   * @returns {string} Extension (e.g., '.md')
   * @private
   */
  getExtension(filename) {
    const lastDot = filename.lastIndexOf('.');
    return lastDot > 0 ? filename.substring(lastDot) : '';
  }

  /**
   * Check if file/folder should be ignored
   *
   * @param {string} name - File or folder name
   * @returns {boolean} True if should be ignored
   * @private
   */
  shouldIgnore(name) {
    const ignorePatterns = [
      'node_modules',
      'dist',
      'build',
      '.git',
      '.vscode',
      '.idea',
      '__pycache__',
      'coverage',
      '.cache',
    ];

    return ignorePatterns.some(pattern => name === pattern || name.startsWith(pattern));
  }

  /**
   * Count total files in tree
   *
   * @param {Array} items - Tree items
   * @returns {number} Total file count
   * @private
   */
  countFiles(items) {
    let count = 0;

    // ⚡ Bolt Optimization: Using for...of instead of .forEach in recursive
    // path avoids creating new closure scopes and function allocations per item
    for (const item of items) {
      if (item.type === 'file') {
        count++;
      } else if (item.type === 'directory' && item.children) {
        count += this.countFiles(item.children);
      }
    }

    return count;
  }

  /**
   * Flatten tree structure to get all files
   *
   * @param {Array} items - Tree items
   * @returns {Array} Flat array of files only
   */
  getAllFiles(items) {
    const files = [];

    // ⚡ Bolt Optimization: Using for...of instead of .forEach in recursive
    // path avoids creating new closure scopes and function allocations per item
    for (const item of items) {
      if (item.type === 'file') {
        files.push(item);
      } else if (item.type === 'directory' && item.children) {
        files.push(...this.getAllFiles(item.children));
      }
    }

    return files;
  }

  /**
   * Search for files by name
   *
   * @param {Array} items - Tree items
   * @param {string} query - Search query
   * @returns {Array} Matching files
   */
  searchFiles(items, query) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    // ⚡ Bolt Optimization: Cache the flattened file list if items haven't changed.
    // This avoids redundant recursive tree traversal on every keystroke.
    if (this.itemsCache !== items) {
      this.itemsCache = items;
      this.flattenedFilesCache = this.getAllFiles(items);
    }

    // ⚡ Bolt Optimization: Using for...of instead of .forEach to avoid
    // closure creation overhead during potentially large array iteration
    for (const file of this.flattenedFilesCache) {
      if (file.name.toLowerCase().includes(lowerQuery)) {
        results.push(file);
      }
    }

    return results;
  }

  /**
   * Get current folder name
   *
   * @returns {string|null} Folder name or null
   */
  getCurrentFolderName() {
    return this.currentDirectoryHandle?.name || null;
  }

  /**
   * Clear current folder
   */
  clearFolder() {
    this.currentDirectoryHandle = null;
    this.fileCount = 0;
    this.lastScanResult = null;
    this.flattenedFilesCache = null;
    this.itemsCache = null;
  }

  /**
   * Refresh the current folder - re-scan to sync with filesystem changes
   *
   * @returns {Promise<Object>} Result with success, files, or error
   *
   * @example
   * const result = await service.refreshFolder();
   * if (result.success) {
   *   renderTree(result.files);
   * }
   */
  async refreshFolder() {
    if (!this.currentDirectoryHandle) {
      return {
        success: false,
        error: ERROR_MESSAGES.NO_FOLDER_OPEN,
        files: [],
      };
    }

    try {
      // Verify we still have permission
      const permissionStatus = await this.currentDirectoryHandle.queryPermission({ mode: 'read' });

      if (permissionStatus !== 'granted') {
        // Try to re-request permission
        const requestStatus = await this.currentDirectoryHandle.requestPermission({ mode: 'read' });
        if (requestStatus !== 'granted') {
          return {
            success: false,
            error: ERROR_MESSAGES.PERMISSION_DENIED,
            files: [],
          };
        }
      }

      // Reset file count and caches before re-scanning
      this.fileCount = 0;
      this.flattenedFilesCache = null;
      this.itemsCache = null;

      const files = await this.scanDirectory(this.currentDirectoryHandle);

      // Update cached result
      this.lastScanResult = {
        success: true,
        files,
        folderName: this.currentDirectoryHandle.name,
        totalFiles: this.fileCount,
      };

      return this.lastScanResult;
    } catch (error) {
      console.error('Folder refresh error:', error);
      return {
        success: false,
        error: error.message,
        files: [],
      };
    }
  }

  /**
   * Create a new markdown file in the specified directory
   *
   * @param {FileSystemDirectoryHandle} directoryHandle - Directory to create file in (null for root)
   * @param {string} filename - Name of the file to create
   * @param {string} content - Initial content for the file
   * @returns {Promise<Object>} Result with success, fileHandle, or error
   *
   * @example
   * const result = await service.createFile(null, 'notes.md', '# My Notes');
   * if (result.success) {
   *   console.log('File created:', result.fileHandle.name);
   * }
   */
  async createFile(directoryHandle, filename, content = '') {
    if (!this.currentDirectoryHandle) {
      return {
        success: false,
        error: ERROR_MESSAGES.NO_FOLDER_OPEN,
      };
    }

    // Use provided directory or root
    const targetDir = directoryHandle || this.currentDirectoryHandle;

    // Validate filename
    if (!filename || typeof filename !== 'string') {
      return {
        success: false,
        error: ERROR_MESSAGES.INVALID_FILENAME_PROVIDED,
      };
    }

    // Ensure .md extension
    let finalFilename = filename.trim();
    if (
      !finalFilename.toLowerCase().endsWith('.md') &&
      !finalFilename.toLowerCase().endsWith('.markdown')
    ) {
      finalFilename += '.md';
    }

    // Sanitize filename (remove dangerous characters)
    finalFilename = this.sanitizeFilename(finalFilename);

    if (!finalFilename || finalFilename === '.md') {
      return {
        success: false,
        error: ERROR_MESSAGES.INVALID_FILENAME,
      };
    }

    try {
      // Check if we need write permission
      let permissionStatus = await targetDir.queryPermission({ mode: 'readwrite' });

      if (permissionStatus !== 'granted') {
        // Request write permission
        permissionStatus = await targetDir.requestPermission({ mode: 'readwrite' });
        if (permissionStatus !== 'granted') {
          return {
            success: false,
            error: ERROR_MESSAGES.PERMISSION_DENIED_WRITE,
          };
        }
      }

      // Check if file already exists
      try {
        await targetDir.getFileHandle(finalFilename, { create: false });
        return {
          success: false,
          error: getErrorMessage(ERROR_MESSAGES.FILE_EXISTS, finalFilename),
        };
      } catch (e) {
        // File doesn't exist - good, we can create it
        if (e.name !== 'NotFoundError') {
          throw e;
        }
      }

      // Create the file
      const fileHandle = await targetDir.getFileHandle(finalFilename, { create: true });

      // Write initial content
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();

      console.log(`✅ Created file: ${finalFilename}`);

      return {
        success: true,
        fileHandle,
        filename: finalFilename,
        path: targetDir === this.currentDirectoryHandle ? finalFilename : null,
      };
    } catch (error) {
      console.error('File creation error:', error);
      return {
        success: false,
        error: error.message || ERROR_MESSAGES.FILE_CREATE_FAILED,
      };
    }
  }

  /**
   * Save content to an existing file
   *
   * @param {FileSystemFileHandle} fileHandle - File to save to
   * @param {string} content - Content to write
   * @returns {Promise<Object>} Result with success or error
   *
   * @example
   * const result = await service.saveFile(fileHandle, '# Updated content');
   * if (result.success) {
   *   console.log('File saved!');
   * }
   */
  async saveFile(fileHandle, content) {
    if (!fileHandle) {
      return {
        success: false,
        error: ERROR_MESSAGES.NO_FILE_HANDLE,
      };
    }

    try {
      // Request write permission if needed
      let permissionStatus = await fileHandle.queryPermission({ mode: 'readwrite' });

      if (permissionStatus !== 'granted') {
        permissionStatus = await fileHandle.requestPermission({ mode: 'readwrite' });
        if (permissionStatus !== 'granted') {
          return {
            success: false,
            error: ERROR_MESSAGES.PERMISSION_DENIED_SAVE,
          };
        }
      }

      // Write content
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();

      console.log(`✅ Saved file: ${fileHandle.name}`);

      return {
        success: true,
        filename: fileHandle.name,
      };
    } catch (error) {
      console.error('File save error:', error);
      return {
        success: false,
        error: error.message || ERROR_MESSAGES.FILE_SAVE_FAILED,
      };
    }
  }

  /**
   * Create a new file using the system file picker
   * Allows user to choose location and filename
   *
   * @param {string} suggestedName - Suggested filename
   * @param {string} content - Initial content
   * @returns {Promise<Object>} Result with success, fileHandle, or error
   */
  async createFileWithPicker(suggestedName = 'untitled.md', content = '') {
    if (!this.isSupported()) {
      return {
        success: false,
        error: ERROR_MESSAGES.API_NOT_SUPPORTED,
      };
    }

    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName,
        types: [
          {
            description: 'Markdown Files',
            accept: {
              'text/markdown': ['.md', '.markdown'],
            },
          },
        ],
      });

      // Write content
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();

      console.log(`✅ Created file via picker: ${fileHandle.name}`);

      return {
        success: true,
        fileHandle,
        filename: fileHandle.name,
      };
    } catch (error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          cancelled: true,
        };
      }

      console.error('File picker error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Sanitize filename to remove dangerous characters
   *
   * @param {string} filename - Filename to sanitize
   * @returns {string} Sanitized filename
   * @private
   */
  sanitizeFilename(filename) {
    const MAX_LENGTH = 200; // Safe limit for most filesystems
    const WINDOWS_RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
    const INVALID_CHARS = '<>:"/\\|?*';

    // Remove dangerous characters including control chars (0-31)
    let sanitized = filename
      .split('')
      .filter(char => {
        const code = char.charCodeAt(0);
        return code >= 32 && !INVALID_CHARS.includes(char);
      })
      .join('')
      .replace(/^\.+/, '') // Remove leading dots
      .replace(/\.+$/, '') // Remove trailing dots (except extension)
      .replace(/\s+$/, '') // Remove trailing spaces
      .trim();

    // Handle Windows reserved names
    const baseName = sanitized.replace(/\..*$/, '');
    if (WINDOWS_RESERVED.test(baseName)) {
      sanitized = `_${sanitized}`;
    }

    // Truncate to safe length
    return sanitized.slice(0, MAX_LENGTH);
  }

  /**
   * Get a subdirectory handle by path
   *
   * @param {string} path - Relative path to directory (e.g., 'docs/notes')
   * @returns {Promise<FileSystemDirectoryHandle|null>} Directory handle or null
   */
  async getDirectoryByPath(path) {
    if (!this.currentDirectoryHandle || !path) {
      return this.currentDirectoryHandle;
    }

    try {
      let currentDir = this.currentDirectoryHandle;
      const parts = path.split('/').filter(p => p && p !== '');

      for (const part of parts) {
        currentDir = await currentDir.getDirectoryHandle(part);
      }

      return currentDir;
    } catch (error) {
      console.error(`Failed to get directory: ${path}`, error);
      return null;
    }
  }

  /**
   * Create a new directory
   *
   * @param {FileSystemDirectoryHandle} parentDir - Parent directory (null for root)
   * @param {string} dirName - Name of directory to create
   * @returns {Promise<Object>} Result with success, directoryHandle, or error
   */
  async createDirectory(parentDir, dirName) {
    if (!this.currentDirectoryHandle) {
      return {
        success: false,
        error: ERROR_MESSAGES.NO_FOLDER_OPEN,
      };
    }

    const targetDir = parentDir || this.currentDirectoryHandle;

    if (!dirName || typeof dirName !== 'string') {
      return {
        success: false,
        error: ERROR_MESSAGES.INVALID_DIRECTORY_NAME,
      };
    }

    const sanitizedName = this.sanitizeFilename(dirName);

    try {
      // Request write permission
      let permissionStatus = await targetDir.queryPermission({ mode: 'readwrite' });

      if (permissionStatus !== 'granted') {
        permissionStatus = await targetDir.requestPermission({ mode: 'readwrite' });
        if (permissionStatus !== 'granted') {
          return {
            success: false,
            error: 'Write permission denied.',
          };
        }
      }

      const directoryHandle = await targetDir.getDirectoryHandle(sanitizedName, { create: true });

      console.log(`✅ Created directory: ${sanitizedName}`);

      return {
        success: true,
        directoryHandle,
        name: sanitizedName,
      };
    } catch (error) {
      console.error('Directory creation error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
