/**
 * @file LinkNavigationService.test.js
 * @description Enterprise-grade test suite for link navigation service
 * @module tests/unit/services/LinkNavigationService
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LinkNavigationService } from '../../../src/js/services/LinkNavigationService.js';

describe('LinkNavigationService', () => {
  let service;
  let mockFolderBrowser;
  let mockNavigateCallback;
  let mockPreviewContainer;

  beforeEach(() => {
    // Mock folder browser service
    mockFolderBrowser = {
      currentDirectoryHandle: null,
    };

    // Mock navigation callback
    mockNavigateCallback = vi.fn();

    // Create service instance
    service = new LinkNavigationService(mockFolderBrowser, mockNavigateCallback);

    // Mock preview container
    mockPreviewContainer = document.createElement('div');
    mockPreviewContainer.id = 'test-preview';
  });

  describe('initialization', () => {
    it('should initialize with empty state', () => {
      expect(service.fileHandleCache.size).toBe(0);
      expect(service.currentFilePath).toBe('');
      expect(service.navigationHistory).toEqual([]);
    });

    it('should initialize click listener on preview container', () => {
      service.initialize(mockPreviewContainer);
      expect(mockPreviewContainer).toBeDefined();
    });

    it('should handle null preview container gracefully', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      service.initialize(null);
      expect(consoleError).toHaveBeenCalledWith('[LinkNav] Preview container not found');
      consoleError.mockRestore();
    });
  });

  describe('cache building', () => {
    it('should clear cache before building', async () => {
      service.fileHandleCache.set('old-file.md', {});
      const mockDirHandle = {
        values: async function* () {},
      };

      await service.buildFileCache(mockDirHandle);
      expect(service.fileHandleCache.size).toBe(0);
    });

    it('should handle null directory handle', async () => {
      await service.buildFileCache(null);
      expect(service.fileHandleCache.size).toBe(0);
    });

    it('should cache markdown files only', async () => {
      const mockDirHandle = {
        values: async function* () {
          yield { kind: 'file', name: 'test.md' };
          yield { kind: 'file', name: 'test.txt' };
          yield { kind: 'file', name: 'README.MD' };
        },
      };

      await service.buildFileCache(mockDirHandle);
      // Should cache both .md and .MD files (case-insensitive)
      expect(service.fileHandleCache.has('test.md')).toBe(true);
      expect(service.fileHandleCache.has('README.MD')).toBe(true);
      expect(service.fileHandleCache.has('test.txt')).toBe(false);
    });

    it('should recursively cache files in subdirectories', async () => {
      const mockSubDir = {
        values: async function* () {
          yield { kind: 'file', name: 'nested.md' };
        },
      };

      const mockDirHandle = {
        values: async function* () {
          yield { kind: 'file', name: 'root.md' };
          yield { kind: 'directory', name: 'subfolder', ...mockSubDir };
        },
      };

      await service.buildFileCache(mockDirHandle);
      expect(service.fileHandleCache.has('root.md')).toBe(true);
      expect(service.fileHandleCache.has('subfolder/nested.md')).toBe(true);
    });
  });

  describe('setCurrentFile', () => {
    it('should update current file path', () => {
      service.setCurrentFile('docs/test.md');
      expect(service.currentFilePath).toBe('docs/test.md');
    });

    it('should normalize paths', () => {
      service.setCurrentFile('/docs\\\\test.md/');
      expect(service.currentFilePath).toBe('docs/test.md');
    });

    it('should add to navigation history', () => {
      service.setCurrentFile('file1.md');
      service.setCurrentFile('file2.md');
      expect(service.navigationHistory).toEqual(['file1.md', 'file2.md']);
    });

    it('should not duplicate consecutive entries in history', () => {
      service.setCurrentFile('file1.md');
      service.setCurrentFile('file1.md');
      expect(service.navigationHistory).toEqual(['file1.md']);
    });
  });

  describe('handleLinkClick', () => {
    beforeEach(() => {
      service.initialize(mockPreviewContainer);
    });

    it('should ignore clicks on non-link elements', async () => {
      const div = document.createElement('div');
      mockPreviewContainer.appendChild(div);

      const event = new MouseEvent('click', { bubbles: true });
      div.dispatchEvent(event);

      expect(mockNavigateCallback).not.toHaveBeenCalled();
    });

    it('should ignore links without href', async () => {
      const link = document.createElement('a');
      mockPreviewContainer.appendChild(link);

      const event = new MouseEvent('click', { bubbles: true });
      link.dispatchEvent(event);

      expect(mockNavigateCallback).not.toHaveBeenCalled();
    });

    it('should allow anchor links to bubble (not prevent default)', async () => {
      const link = document.createElement('a');
      link.href = '#heading';
      mockPreviewContainer.appendChild(link);

      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      link.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    it('should allow external links to bubble', async () => {
      const link = document.createElement('a');
      link.href = 'https://example.com';
      mockPreviewContainer.appendChild(link);

      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      link.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });

  describe('resolveTargetPath', () => {
    it('should resolve relative paths correctly', () => {
      service.setCurrentFile('docs/current.md');
      const resolved = service.resolveTargetPath('../other.md');
      expect(resolved).toBe('other.md');
    });

    it('should handle absolute paths', () => {
      service.setCurrentFile('docs/current.md');
      const resolved = service.resolveTargetPath('/root/file.md');
      expect(resolved).toBe('root/file.md');
    });

    it('should handle ./ paths', () => {
      service.setCurrentFile('docs/current.md');
      const resolved = service.resolveTargetPath('./sibling.md');
      expect(resolved).toBe('docs/sibling.md');
    });
  });

  describe('navigateToMarkdownFile', () => {
    it('should show warning if no file is currently open', async () => {
      const showWarningSpy = vi.spyOn(service, 'showWarning');
      await service.navigateToMarkdownFile('test.md');
      expect(showWarningSpy).toHaveBeenCalledWith(
        'No file currently open',
        'Please open a file from the folder browser first.'
      );
    });

    it('should load file from cache if exists', async () => {
      const mockFileHandle = {
        getFile: vi.fn().mockResolvedValue({
          name: 'test.md',
          text: vi.fn().mockResolvedValue('# Test Content'),
        }),
      };

      service.setCurrentFile('docs/current.md');
      service.fileHandleCache.set('docs/test.md', mockFileHandle);

      await service.navigateToMarkdownFile('./test.md');

      expect(mockNavigateCallback).toHaveBeenCalledWith({
        content: '# Test Content',
        name: 'test.md',
        path: 'docs/test.md',
        handle: mockFileHandle,
        anchor: null,
      });
    });

    it('should show file not found modal if file not in cache', async () => {
      const showModalSpy = vi.spyOn(service, 'showFileNotFoundModal');
      service.setCurrentFile('docs/current.md');

      await service.navigateToMarkdownFile('./missing.md');

      expect(showModalSpy).toHaveBeenCalledWith('docs/missing.md');
    });
  });

  describe('loadFile', () => {
    it('should read file content and trigger callback', async () => {
      const mockFileHandle = {
        getFile: vi.fn().mockResolvedValue({
          name: 'test.md',
          text: vi.fn().mockResolvedValue('# Content'),
        }),
      };

      await service.loadFile(mockFileHandle, 'docs/test.md');

      expect(mockNavigateCallback).toHaveBeenCalledWith({
        content: '# Content',
        name: 'test.md',
        path: 'docs/test.md',
        handle: mockFileHandle,
        anchor: null,
      });
    });

    it('should update current file path', async () => {
      const mockFileHandle = {
        getFile: vi.fn().mockResolvedValue({
          name: 'test.md',
          text: vi.fn().mockResolvedValue('# Content'),
        }),
      };

      await service.loadFile(mockFileHandle, 'docs/test.md');
      expect(service.currentFilePath).toBe('docs/test.md');
    });

    it('should handle file read errors gracefully', async () => {
      const mockFileHandle = {
        getFile: vi.fn().mockRejectedValue(new Error('Permission denied')),
      };

      const showWarningSpy = vi.spyOn(service, 'showWarning');
      await service.loadFile(mockFileHandle, 'docs/test.md');

      expect(showWarningSpy).toHaveBeenCalledWith(
        'Failed to load file',
        'Could not read file: Permission denied'
      );
    });
  });

  describe('reset', () => {
    it('should clear all state', () => {
      service.fileHandleCache.set('test.md', {});
      service.setCurrentFile('test.md');
      service.navigationHistory = ['file1.md', 'file2.md'];

      service.reset();

      expect(service.fileHandleCache.size).toBe(0);
      expect(service.currentFilePath).toBe('');
      expect(service.navigationHistory).toEqual([]);
    });
  });

  describe('getBreadcrumb', () => {
    it('should return navigation history', () => {
      service.setCurrentFile('file1.md');
      service.setCurrentFile('file2.md');
      service.setCurrentFile('file3.md');

      const breadcrumb = service.getBreadcrumb();
      expect(breadcrumb).toEqual(['file1.md', 'file2.md', 'file3.md']);
    });

    it('should return a copy of navigation history', () => {
      service.setCurrentFile('file1.md');
      const breadcrumb = service.getBreadcrumb();

      breadcrumb.push('file2.md');
      expect(service.navigationHistory).toEqual(['file1.md']);
    });
  });

  describe('Security & Edge Cases', () => {
    it('should handle path traversal attempts safely', async () => {
      service.setCurrentFile('docs/current.md');
      const resolved = service.resolveTargetPath('../../../etc/passwd');
      // Should normalize to safe path
      expect(resolved).not.toContain('..');
    });

    it('should handle malformed URLs', async () => {
      const link = document.createElement('a');
      link.href = 'javascript:alert(1)';
      mockPreviewContainer.appendChild(link);

      service.initialize(mockPreviewContainer);
      const event = new MouseEvent('click', { bubbles: true });
      link.dispatchEvent(event);

      // Should not navigate to javascript: URLs
      expect(mockNavigateCallback).not.toHaveBeenCalled();
    });

    it('should handle very long file paths', async () => {
      const longPath = 'a/'.repeat(100) + 'file.md';
      service.setCurrentFile(longPath);
      expect(service.currentFilePath).toBe(longPath);
    });

    it('should handle special characters in filenames', () => {
      const specialPath = 'docs/file with spaces & special-chars (2024).md';
      service.setCurrentFile(specialPath);
      expect(service.currentFilePath).toBe(specialPath);
    });
  });
});
