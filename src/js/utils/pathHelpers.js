/**
 * @file pathHelpers.js
 * @description Path resolution utilities for markdown link navigation
 * @module utils/pathHelpers
 */

/**
 * Resolve relative path against base path
 * @param {string} basePath - Current file path (e.g., "docs/folder/current.md")
 * @param {string} relativePath - Relative target path (e.g., "../other/file.md")
 * @returns {string} Resolved absolute path
 * @example
 * resolveRelativePath('docs/folder/current.md', '../other/file.md')
 * // Returns: 'docs/other/file.md'
 */
export function resolveRelativePath(basePath, relativePath) {
  // Normalize paths to use forward slashes
  basePath = basePath.replace(/\\/g, '/');
  relativePath = relativePath.replace(/\\/g, '/');

  // Split into segments
  const baseSegments = basePath.split('/').filter(Boolean);
  const relativeSegments = relativePath.split('/').filter(Boolean);

  // Remove current filename from base (keep only directory path)
  if (baseSegments.length > 0) {
    baseSegments.pop();
  }

  // Process relative segments
  for (const segment of relativeSegments) {
    if (segment === '..') {
      // Go up one directory
      if (baseSegments.length > 0) {
        baseSegments.pop();
      }
    } else if (segment !== '.') {
      // Add segment (skip '.' as it means current directory)
      baseSegments.push(segment);
    }
  }

  // Join and return
  return baseSegments.join('/');
}

/**
 * Normalize path for consistent cache lookup
 * @param {string} path - File path to normalize
 * @returns {string} Normalized path (forward slashes, no leading/trailing slashes)
 * @example
 * normalizePath('\\folder\\file.md')
 * // Returns: 'folder/file.md'
 */
export function normalizePath(path) {
  if (!path) {return '';}

  return path
    .replace(/\\/g, '/') // Convert backslashes to forward slashes
    .replace(/\/+/g, '/') // Collapse multiple slashes
    .replace(/^\/|\/$/g, ''); // Remove leading/trailing slashes
}

/**
 * Check if path is external URL
 * @param {string} path - Path to check
 * @returns {boolean} True if external URL
 */
export function isExternalUrl(path) {
  if (!path) {return false;}
  return /^https?:\/\//.test(path) || /^\/\//.test(path);
}

/**
 * Check if path is markdown file
 * @param {string} path - Path to check
 * @returns {boolean} True if markdown file
 */
export function isMarkdownFile(path) {
  if (!path) {return false;}
  return /\.md$/i.test(path);
}

/**
 * Check if path is anchor link
 * @param {string} path - Path to check
 * @returns {boolean} True if anchor link
 */
export function isAnchorLink(path) {
  if (!path) {return false;}
  return path.startsWith('#');
}

/**
 * Extract directory path from file path
 * @param {string} filePath - Full file path
 * @returns {string} Directory path
 * @example
 * getDirectory('docs/folder/file.md')
 * // Returns: 'docs/folder'
 */
export function getDirectory(filePath) {
  const normalized = normalizePath(filePath);
  const segments = normalized.split('/');
  segments.pop(); // Remove filename
  return segments.join('/');
}

/**
 * Extract filename from path
 * @param {string} filePath - Full file path
 * @returns {string} Filename
 * @example
 * getFilename('docs/folder/file.md')
 * // Returns: 'file.md'
 */
export function getFilename(filePath) {
  const normalized = normalizePath(filePath);
  const segments = normalized.split('/');
  return segments[segments.length - 1] || '';
}

/**
 * Check if path is within allowed root (prevents path traversal attacks)
 * @param {string} path - Path to validate
 * @param {string} rootPath - Root directory path
 * @returns {boolean} True if path is within root
 */
export function isWithinRoot(path, rootPath) {
  const normalizedPath = normalizePath(path);
  const normalizedRoot = normalizePath(rootPath);

  // Empty path or trying to escape root
  if (!normalizedPath) {return false;}
  if (normalizedPath.startsWith('..')) {return false;}
  if (normalizedPath.includes('../')) {return false;}

  // Security: Detect path traversal attempts that resolve outside root
  // e.g., 'docs/../secret' normalizes to 'secret' which is outside 'docs'
  if (normalizedPath.includes('../')) {return false;}

  // Check if path starts with root
  return normalizedPath === normalizedRoot || normalizedPath.startsWith(`${normalizedRoot}/`);
}
