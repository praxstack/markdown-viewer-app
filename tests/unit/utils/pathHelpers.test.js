/**
 * @file pathHelpers.test.js
 * @description Comprehensive test suite for path resolution utilities
 * @module tests/unit/utils/pathHelpers
 */

import { describe, expect, it } from 'vitest';
import {
  getDirectory,
  getFilename,
  isAnchorLink,
  isExternalUrl,
  isMarkdownFile,
  isWithinRoot,
  normalizePath,
  resolveRelativePath,
} from '../../../src/js/utils/pathHelpers.js';

describe('pathHelpers', () => {
  describe('resolveRelativePath', () => {
    it('should resolve ../ correctly', () => {
      expect(resolveRelativePath('docs/folder/current.md', '../other.md')).toBe('docs/other.md');
    });

    it('should resolve ./ correctly', () => {
      expect(resolveRelativePath('docs/folder/current.md', './sibling.md')).toBe(
        'docs/folder/sibling.md',
      );
    });

    it('should resolve ../../ correctly', () => {
      expect(resolveRelativePath('docs/folder/subfolder/current.md', '../../other.md')).toBe(
        'docs/other.md',
      );
    });

    it('should handle multiple ../ segments', () => {
      expect(resolveRelativePath('a/b/c/d/file.md', '../../../other.md')).toBe('a/other.md');
    });

    it('should ignore . (current directory marker)', () => {
      expect(resolveRelativePath('docs/folder/current.md', './././file.md')).toBe(
        'docs/folder/file.md',
      );
    });

    it('should handle backslashes on Windows paths', () => {
      expect(resolveRelativePath('docs\\\\folder\\\\current.md', '..\\\\other.md')).toBe(
        'docs/other.md',
      );
    });

    it('should handle edge case: ../ beyond root', () => {
      expect(resolveRelativePath('file.md', '../other.md')).toBe('other.md');
    });

    it('should handle empty relative path', () => {
      expect(resolveRelativePath('docs/folder/current.md', '')).toBe('docs/folder');
    });

    it('should handle absolute-style relative path', () => {
      expect(resolveRelativePath('docs/current.md', 'folder/file.md')).toBe('docs/folder/file.md');
    });
  });

  describe('normalizePath', () => {
    it('should convert backslashes to forward slashes', () => {
      expect(normalizePath('folder\\\\file.md')).toBe('folder/file.md');
    });

    it('should collapse multiple slashes', () => {
      expect(normalizePath('folder///file.md')).toBe('folder/file.md');
    });

    it('should remove leading slash', () => {
      expect(normalizePath('/folder/file.md')).toBe('folder/file.md');
    });

    it('should remove trailing slash', () => {
      expect(normalizePath('folder/file.md/')).toBe('folder/file.md');
    });

    it('should handle mixed slashes', () => {
      expect(normalizePath('/folder\\\\\\\\subfolder//file.md/')).toBe('folder/subfolder/file.md');
    });

    it('should return empty string for null/undefined', () => {
      expect(normalizePath(null)).toBe('');
      expect(normalizePath(undefined)).toBe('');
      expect(normalizePath('')).toBe('');
    });

    it('should handle single filename', () => {
      expect(normalizePath('file.md')).toBe('file.md');
    });
  });

  describe('isExternalUrl', () => {
    it('should detect http:// URLs', () => {
      expect(isExternalUrl('http://example.com')).toBe(true);
    });

    it('should detect https:// URLs', () => {
      expect(isExternalUrl('https://example.com')).toBe(true);
    });

    it('should detect protocol-relative URLs', () => {
      expect(isExternalUrl('//example.com')).toBe(true);
    });

    it('should return false for relative paths', () => {
      expect(isExternalUrl('./file.md')).toBe(false);
      expect(isExternalUrl('../file.md')).toBe(false);
      expect(isExternalUrl('folder/file.md')).toBe(false);
    });

    it('should return false for anchor links', () => {
      expect(isExternalUrl('#heading')).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(isExternalUrl(null)).toBe(false);
      expect(isExternalUrl(undefined)).toBe(false);
      expect(isExternalUrl('')).toBe(false);
    });
  });

  describe('isMarkdownFile', () => {
    it('should detect .md extension', () => {
      expect(isMarkdownFile('file.md')).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(isMarkdownFile('file.MD')).toBe(true);
      expect(isMarkdownFile('file.Md')).toBe(true);
    });

    it('should detect .md in paths', () => {
      expect(isMarkdownFile('folder/file.md')).toBe(true);
    });

    it('should return false for non-markdown files', () => {
      expect(isMarkdownFile('file.txt')).toBe(false);
      expect(isMarkdownFile('file.html')).toBe(false);
      expect(isMarkdownFile('file.mdx')).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(isMarkdownFile(null)).toBe(false);
      expect(isMarkdownFile(undefined)).toBe(false);
      expect(isMarkdownFile('')).toBe(false);
    });
  });

  describe('isAnchorLink', () => {
    it('should detect anchor links', () => {
      expect(isAnchorLink('#heading')).toBe(true);
    });

    it('should detect anchor links with complex IDs', () => {
      expect(isAnchorLink('#complex-heading-id')).toBe(true);
    });

    it('should return false for regular paths', () => {
      expect(isAnchorLink('file.md')).toBe(false);
      expect(isAnchorLink('./file.md#heading')).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(isAnchorLink(null)).toBe(false);
      expect(isAnchorLink(undefined)).toBe(false);
      expect(isAnchorLink('')).toBe(false);
    });
  });

  describe('getDirectory', () => {
    it('should extract directory from file path', () => {
      expect(getDirectory('docs/folder/file.md')).toBe('docs/folder');
    });

    it('should handle single-level paths', () => {
      expect(getDirectory('folder/file.md')).toBe('folder');
    });

    it('should handle root-level files', () => {
      expect(getDirectory('file.md')).toBe('');
    });

    it('should normalize paths first', () => {
      expect(getDirectory('docs\\\\folder\\\\file.md')).toBe('docs/folder');
    });
  });

  describe('getFilename', () => {
    it('should extract filename from path', () => {
      expect(getFilename('docs/folder/file.md')).toBe('file.md');
    });

    it('should handle single filenames', () => {
      expect(getFilename('file.md')).toBe('file.md');
    });

    it('should handle paths with backslashes', () => {
      expect(getFilename('docs\\\\folder\\\\file.md')).toBe('file.md');
    });

    it('should return last segment for directory paths with trailing slash', () => {
      // Normalization removes trailing slash, so 'folder/' becomes 'folder'
      expect(getFilename('docs/folder/')).toBe('folder');
    });
  });

  describe('isWithinRoot', () => {
    it('should return true for paths within root', () => {
      expect(isWithinRoot('docs/folder/file.md', 'docs')).toBe(true);
    });

    it('should return true for exact root match', () => {
      expect(isWithinRoot('docs', 'docs')).toBe(true);
    });

    it('should return false for path traversal attempts', () => {
      expect(isWithinRoot('../etc/passwd', 'docs')).toBe(false);
    });

    it('should return false for paths starting with ../', () => {
      expect(isWithinRoot('../../secret', 'docs')).toBe(false);
    });

    it('should return false for empty paths', () => {
      expect(isWithinRoot('', 'docs')).toBe(false);
    });

    it('should handle paths outside root', () => {
      expect(isWithinRoot('other/file.md', 'docs')).toBe(false);
    });

    it('should handle normalized paths that resolve outside root', () => {
      // Normalization converts 'docs/../secret' to 'secret'
      // The implementation checks if the path starts with the root folder
      // Since 'secret' does not start with 'docs', it should return false
      expect(isWithinRoot('docs/../secret', 'docs')).toBe(false); // 'secret' is outside 'docs'
    });

    it('should allow nested paths within root', () => {
      expect(isWithinRoot('docs/a/b/c/file.md', 'docs')).toBe(true);
    });
  });
});
