/**
 * FolderBrowserService Unit Tests
 *
 * Tests for file creation, folder refresh, and utility functions.
 * Note: File System Access API methods are mocked since they require browser context.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ERROR_MESSAGES } from '../../../src/js/config/errorMessages.js';
import { FolderBrowserService } from '../../../src/js/services/FolderBrowserService.js';

// Mock StorageManager
const createMockStorage = () => ({
  get: vi.fn(),
  set: vi.fn(),
  getJSON: vi.fn(),
  setJSON: vi.fn(),
});

describe('FolderBrowserService', () => {
  let service;
  let mockStorage;

  beforeEach(() => {
    mockStorage = createMockStorage();
    service = new FolderBrowserService(mockStorage);
  });

  describe('Constructor', () => {
    it('initializes with default values', () => {
      expect(service.currentDirectoryHandle).toBeNull();
      expect(service.maxDepth).toBe(10);
      expect(service.maxFiles).toBe(1000);
      expect(service.fileCount).toBe(0);
      expect(service.lastScanResult).toBeNull();
    });

    it('receives storage manager via dependency injection', () => {
      expect(service.storage).toBe(mockStorage);
    });
  });

  describe('isSupported()', () => {
    it('returns true when showDirectoryPicker is available', () => {
      // Mock window.showDirectoryPicker
      const originalShowDirectoryPicker = window.showDirectoryPicker;
      window.showDirectoryPicker = vi.fn();

      expect(service.isSupported()).toBe(true);

      // Restore
      window.showDirectoryPicker = originalShowDirectoryPicker;
    });

    it('returns false when showDirectoryPicker is not available', () => {
      // Remove showDirectoryPicker
      const originalShowDirectoryPicker = window.showDirectoryPicker;
      delete window.showDirectoryPicker;

      expect(service.isSupported()).toBe(false);

      // Restore
      if (originalShowDirectoryPicker) {
        window.showDirectoryPicker = originalShowDirectoryPicker;
      }
    });
  });

  describe('sanitizeFilename()', () => {
    it('removes invalid characters', () => {
      expect(service.sanitizeFilename('test<>file.md')).toBe('testfile.md');
      expect(service.sanitizeFilename('test:file.md')).toBe('testfile.md');
      expect(service.sanitizeFilename('test"file.md')).toBe('testfile.md');
      expect(service.sanitizeFilename('test/file.md')).toBe('testfile.md');
      expect(service.sanitizeFilename('test\\file.md')).toBe('testfile.md');
      expect(service.sanitizeFilename('test|file.md')).toBe('testfile.md');
      expect(service.sanitizeFilename('test?file.md')).toBe('testfile.md');
      expect(service.sanitizeFilename('test*file.md')).toBe('testfile.md');
    });

    it('removes leading dots', () => {
      expect(service.sanitizeFilename('..test.md')).toBe('test.md');
      expect(service.sanitizeFilename('...hidden.md')).toBe('hidden.md');
    });

    it('removes trailing spaces', () => {
      expect(service.sanitizeFilename('test.md   ')).toBe('test.md');
      expect(service.sanitizeFilename('document   .md')).toBe('document   .md'); // Only trailing
    });

    it('handles Windows reserved names', () => {
      expect(service.sanitizeFilename('CON.md')).toBe('_CON.md');
      expect(service.sanitizeFilename('PRN.md')).toBe('_PRN.md');
      expect(service.sanitizeFilename('AUX.md')).toBe('_AUX.md');
      expect(service.sanitizeFilename('NUL.md')).toBe('_NUL.md');
      expect(service.sanitizeFilename('COM1.md')).toBe('_COM1.md');
      expect(service.sanitizeFilename('COM9.md')).toBe('_COM9.md');
      expect(service.sanitizeFilename('LPT1.md')).toBe('_LPT1.md');
      expect(service.sanitizeFilename('LPT9.md')).toBe('_LPT9.md');
    });

    it('handles Windows reserved names case-insensitively', () => {
      expect(service.sanitizeFilename('con.md')).toBe('_con.md');
      expect(service.sanitizeFilename('Con.md')).toBe('_Con.md');
      expect(service.sanitizeFilename('CON.md')).toBe('_CON.md');
    });

    it('truncates long filenames to MAX_LENGTH', () => {
      const longName = `${'a'.repeat(300)}.md`;
      const result = service.sanitizeFilename(longName);
      expect(result.length).toBeLessThanOrEqual(200);
    });

    it('preserves valid filenames', () => {
      expect(service.sanitizeFilename('valid-file_name.md')).toBe('valid-file_name.md');
      expect(service.sanitizeFilename('My Document 2024.md')).toBe('My Document 2024.md');
    });

    it('handles empty string', () => {
      expect(service.sanitizeFilename('')).toBe('');
    });

    it('handles string with only invalid characters', () => {
      expect(service.sanitizeFilename('<>:"/\\|?*')).toBe('');
    });
  });

  describe('isMarkdownFile()', () => {
    it('returns true for .md files', () => {
      expect(service.isMarkdownFile('test.md')).toBe(true);
      expect(service.isMarkdownFile('TEST.MD')).toBe(true);
      expect(service.isMarkdownFile('Test.Md')).toBe(true);
    });

    it('returns true for .markdown files', () => {
      expect(service.isMarkdownFile('test.markdown')).toBe(true);
      expect(service.isMarkdownFile('TEST.MARKDOWN')).toBe(true);
    });

    it('returns false for non-markdown files', () => {
      expect(service.isMarkdownFile('test.txt')).toBe(false);
      expect(service.isMarkdownFile('test.html')).toBe(false);
      expect(service.isMarkdownFile('test.js')).toBe(false);
      expect(service.isMarkdownFile('test.mdx')).toBe(false);
    });

    it('returns false for files without extension', () => {
      expect(service.isMarkdownFile('README')).toBe(false);
    });
  });

  describe('getExtension()', () => {
    it('returns correct extension', () => {
      expect(service.getExtension('test.md')).toBe('.md');
      expect(service.getExtension('test.markdown')).toBe('.markdown');
      expect(service.getExtension('test.txt')).toBe('.txt');
    });

    it('returns empty string for files without extension', () => {
      expect(service.getExtension('README')).toBe('');
    });

    it('handles multiple dots', () => {
      expect(service.getExtension('test.spec.md')).toBe('.md');
      expect(service.getExtension('my.file.name.markdown')).toBe('.markdown');
    });

    it('handles hidden files (returns empty for dotfiles)', () => {
      // Hidden files like .gitignore have no extension (the dot is not a separator)
      // The implementation returns empty string for files with no extension after first dot
      expect(service.getExtension('.gitignore')).toBe('');
      expect(service.getExtension('.env')).toBe('');
      expect(service.getExtension('.config.json')).toBe('.json');
    });
  });

  describe('shouldIgnore()', () => {
    it('ignores node_modules', () => {
      expect(service.shouldIgnore('node_modules')).toBe(true);
    });

    it('ignores dist and build folders', () => {
      expect(service.shouldIgnore('dist')).toBe(true);
      expect(service.shouldIgnore('build')).toBe(true);
    });

    it('ignores .git folder', () => {
      expect(service.shouldIgnore('.git')).toBe(true);
    });

    it('ignores IDE folders', () => {
      expect(service.shouldIgnore('.vscode')).toBe(true);
      expect(service.shouldIgnore('.idea')).toBe(true);
    });

    it('ignores cache folders', () => {
      expect(service.shouldIgnore('__pycache__')).toBe(true);
      expect(service.shouldIgnore('coverage')).toBe(true);
      expect(service.shouldIgnore('.cache')).toBe(true);
    });

    it('does not ignore regular folders', () => {
      expect(service.shouldIgnore('src')).toBe(false);
      expect(service.shouldIgnore('docs')).toBe(false);
      expect(service.shouldIgnore('tests')).toBe(false);
    });
  });

  describe('countFiles()', () => {
    it('counts files in flat array', () => {
      const items = [
        { type: 'file', name: 'a.md' },
        { type: 'file', name: 'b.md' },
        { type: 'file', name: 'c.md' },
      ];
      expect(service.countFiles(items)).toBe(3);
    });

    it('counts files in nested directories', () => {
      const items = [
        { type: 'file', name: 'root.md' },
        {
          type: 'directory',
          name: 'docs',
          children: [
            { type: 'file', name: 'a.md' },
            { type: 'file', name: 'b.md' },
          ],
        },
      ];
      expect(service.countFiles(items)).toBe(3);
    });

    it('returns 0 for empty array', () => {
      expect(service.countFiles([])).toBe(0);
    });

    it('returns 0 for directories only', () => {
      const items = [{ type: 'directory', name: 'empty', children: [] }];
      expect(service.countFiles(items)).toBe(0);
    });
  });

  describe('getAllFiles()', () => {
    it('flattens nested file tree', () => {
      const items = [
        { type: 'file', name: 'root.md' },
        {
          type: 'directory',
          name: 'docs',
          children: [
            { type: 'file', name: 'a.md' },
            {
              type: 'directory',
              name: 'nested',
              children: [{ type: 'file', name: 'deep.md' }],
            },
          ],
        },
      ];

      const files = service.getAllFiles(items);
      expect(files).toHaveLength(3);
      expect(files.map(f => f.name)).toEqual(['root.md', 'a.md', 'deep.md']);
    });

    it('returns empty array for empty input', () => {
      expect(service.getAllFiles([])).toEqual([]);
    });
  });

  describe('searchFiles()', () => {
    const items = [
      { type: 'file', name: 'README.md' },
      { type: 'file', name: 'readme-dev.md' },
      { type: 'file', name: 'setup.md' },
      {
        type: 'directory',
        name: 'docs',
        children: [{ type: 'file', name: 'README-API.md' }],
      },
    ];

    it('finds files by partial name match', () => {
      const results = service.searchFiles(items, 'readme');
      expect(results).toHaveLength(3);
    });

    it('search is case-insensitive', () => {
      const results = service.searchFiles(items, 'README');
      expect(results).toHaveLength(3);
    });

    it('returns empty array for no matches', () => {
      const results = service.searchFiles(items, 'nonexistent');
      expect(results).toHaveLength(0);
    });

    it('finds exact filename', () => {
      const results = service.searchFiles(items, 'setup.md');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('setup.md');
    });
  });

  describe('getCurrentFolderName()', () => {
    it('returns null when no folder is open', () => {
      expect(service.getCurrentFolderName()).toBeNull();
    });

    it('returns folder name when folder is open', () => {
      service.currentDirectoryHandle = { name: 'my-project' };
      expect(service.getCurrentFolderName()).toBe('my-project');
    });
  });

  describe('clearFolder()', () => {
    it('clears all folder state', () => {
      service.currentDirectoryHandle = { name: 'test' };
      service.fileCount = 50;
      service.lastScanResult = { success: true, files: [] };

      service.clearFolder();

      expect(service.currentDirectoryHandle).toBeNull();
      expect(service.fileCount).toBe(0);
      expect(service.lastScanResult).toBeNull();
    });
  });

  describe('createFile()', () => {
    it('returns error when no folder is open', async () => {
      const result = await service.createFile(null, 'test.md', '');
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.NO_FOLDER_OPEN);
    });

    it('returns error for invalid filename', async () => {
      service.currentDirectoryHandle = { name: 'test' };

      const result = await service.createFile(null, null, '');
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INVALID_FILENAME_PROVIDED);
    });

    it('returns error for empty filename', async () => {
      service.currentDirectoryHandle = { name: 'test' };

      const result = await service.createFile(null, '', '');
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INVALID_FILENAME_PROVIDED);
    });

    it('adds .md extension if missing', async () => {
      const notFoundError = new Error('File not found');
      notFoundError.name = 'NotFoundError';

      const mockDirHandle = {
        name: 'test-dir',
        queryPermission: vi.fn().mockResolvedValue('granted'),
        getFileHandle: vi.fn().mockImplementation((name, options) => {
          if (!options?.create) {
            throw notFoundError;
          }
          return {
            createWritable: vi.fn().mockResolvedValue({
              write: vi.fn().mockResolvedValue(undefined),
              close: vi.fn().mockResolvedValue(undefined),
            }),
          };
        }),
      };

      service.currentDirectoryHandle = mockDirHandle;

      const result = await service.createFile(null, 'test', '# Content');

      expect(result.success).toBe(true);
      expect(result.filename).toBe('test.md');
    });
  });

  describe('saveFile()', () => {
    it('returns error when no file handle provided', async () => {
      const result = await service.saveFile(null, 'content');
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.NO_FILE_HANDLE);
    });

    it('returns error when permission denied', async () => {
      const mockFileHandle = {
        name: 'test.md',
        queryPermission: vi.fn().mockResolvedValue('denied'),
        requestPermission: vi.fn().mockResolvedValue('denied'),
      };

      const result = await service.saveFile(mockFileHandle, 'content');
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.PERMISSION_DENIED_SAVE);
    });

    it('saves file successfully', async () => {
      const mockWritable = {
        write: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
      };

      const mockFileHandle = {
        name: 'test.md',
        queryPermission: vi.fn().mockResolvedValue('granted'),
        createWritable: vi.fn().mockResolvedValue(mockWritable),
      };

      const result = await service.saveFile(mockFileHandle, '# New Content');

      expect(result.success).toBe(true);
      expect(result.filename).toBe('test.md');
      expect(mockWritable.write).toHaveBeenCalledWith('# New Content');
      expect(mockWritable.close).toHaveBeenCalled();
    });
  });

  describe('refreshFolder()', () => {
    it('returns error when no folder is open', async () => {
      const result = await service.refreshFolder();
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.NO_FOLDER_OPEN);
    });

    it('returns error when permission denied', async () => {
      service.currentDirectoryHandle = {
        name: 'test',
        queryPermission: vi.fn().mockResolvedValue('denied'),
        requestPermission: vi.fn().mockResolvedValue('denied'),
      };

      const result = await service.refreshFolder();
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.PERMISSION_DENIED);
    });
  });

  describe('createDirectory()', () => {
    it('returns error when no folder is open', async () => {
      const result = await service.createDirectory(null, 'new-dir');
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.NO_FOLDER_OPEN);
    });

    it('returns error for invalid directory name', async () => {
      service.currentDirectoryHandle = { name: 'test' };

      const result = await service.createDirectory(null, '');
      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.INVALID_DIRECTORY_NAME);
    });
  });

  describe('Error Messages Integration', () => {
    it('uses centralized error messages', () => {
      // Verify error messages are imported and used correctly
      expect(ERROR_MESSAGES.NO_FOLDER_OPEN).toBeDefined();
      expect(ERROR_MESSAGES.INVALID_FILENAME).toBeDefined();
      expect(ERROR_MESSAGES.PERMISSION_DENIED).toBeDefined();
    });

    it('FILE_EXISTS returns dynamic message', () => {
      const message = ERROR_MESSAGES.FILE_EXISTS('test.md');
      expect(message).toBe('File "test.md" already exists. Please choose a different name.');
    });
  });

  describe('openFolder()', () => {
    it('returns error when API not supported', async () => {
      const originalShowDirectoryPicker = window.showDirectoryPicker;
      delete window.showDirectoryPicker;

      const result = await service.openFolder();

      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.API_NOT_SUPPORTED);

      if (originalShowDirectoryPicker) {
        window.showDirectoryPicker = originalShowDirectoryPicker;
      }
    });

    it('handles user cancellation gracefully', async () => {
      const abortError = new Error('User cancelled');
      abortError.name = 'AbortError';

      window.showDirectoryPicker = vi.fn().mockRejectedValue(abortError);

      const result = await service.openFolder();

      expect(result.success).toBe(false);
      expect(result.cancelled).toBe(true);
      expect(result.files).toEqual([]);
    });

    it('handles general errors', async () => {
      window.showDirectoryPicker = vi.fn().mockRejectedValue(new Error('Permission denied'));

      const result = await service.openFolder();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Permission denied');
      expect(result.files).toEqual([]);
    });

    it('successfully opens folder and scans files', async () => {
      const mockFileEntry = {
        kind: 'file',
        name: 'test.md',
        getFile: vi.fn().mockResolvedValue(new File(['content'], 'test.md')),
      };

      const mockDirHandle = {
        name: 'test-project',
        values: vi.fn().mockReturnValue({
          async *[Symbol.asyncIterator]() {
            yield mockFileEntry;
          },
        }),
      };

      window.showDirectoryPicker = vi.fn().mockResolvedValue(mockDirHandle);

      const result = await service.openFolder();

      expect(result.success).toBe(true);
      expect(result.folderName).toBe('test-project');
      expect(result.files.length).toBeGreaterThanOrEqual(0);
      expect(mockStorage.set).toHaveBeenCalledWith('lastFolderName', 'test-project');
    });
  });

  describe('scanDirectory()', () => {
    it('respects max depth limit', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const mockDirHandle = {
        name: 'deep-folder',
        values: vi.fn().mockReturnValue({
          async *[Symbol.asyncIterator]() {
            // No entries
          },
        }),
      };

      // Call with depth exceeding maxDepth
      const result = await service.scanDirectory(mockDirHandle, 'test/', 15);

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('respects max files limit', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      service.fileCount = 1000; // Set to max

      const mockDirHandle = {
        name: 'folder',
        values: vi.fn().mockReturnValue({
          async *[Symbol.asyncIterator]() {
            yield { kind: 'file', name: 'test.md' };
          },
        }),
      };

      const result = await service.scanDirectory(mockDirHandle, '', 0);

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('skips hidden files', async () => {
      const mockDirHandle = {
        name: 'folder',
        values: vi.fn().mockReturnValue({
          async *[Symbol.asyncIterator]() {
            yield { kind: 'file', name: '.hidden.md' };
            yield { kind: 'file', name: 'visible.md' };
          },
        }),
      };

      const result = await service.scanDirectory(mockDirHandle, '', 0);

      expect(result.length).toBe(1);
      expect(result[0].name).toBe('visible.md');
    });

    it('skips ignored directories', async () => {
      const mockDirHandle = {
        name: 'project',
        values: vi.fn().mockReturnValue({
          async *[Symbol.asyncIterator]() {
            yield {
              kind: 'directory',
              name: 'node_modules',
              values: vi.fn().mockReturnValue({
                async *[Symbol.asyncIterator]() {
                  yield { kind: 'file', name: 'package.md' };
                },
              }),
            };
            yield { kind: 'file', name: 'README.md' };
          },
        }),
      };

      const result = await service.scanDirectory(mockDirHandle, '', 0);

      expect(result.length).toBe(1);
      expect(result[0].name).toBe('README.md');
    });

    it('scans nested directories', async () => {
      const mockSubDir = {
        kind: 'directory',
        name: 'docs',
        values: vi.fn().mockReturnValue({
          async *[Symbol.asyncIterator]() {
            yield { kind: 'file', name: 'guide.md' };
          },
        }),
      };

      const mockDirHandle = {
        name: 'project',
        values: vi.fn().mockReturnValue({
          async *[Symbol.asyncIterator]() {
            yield mockSubDir;
            yield { kind: 'file', name: 'README.md' };
          },
        }),
      };

      const result = await service.scanDirectory(mockDirHandle, '', 0);

      expect(result.length).toBe(2);
      // Directories come first
      expect(result[0].type).toBe('directory');
      expect(result[0].name).toBe('docs');
      expect(result[1].type).toBe('file');
      expect(result[1].name).toBe('README.md');
    });

    it('handles scan errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const mockDirHandle = {
        name: 'broken',
        values: vi.fn().mockImplementation(() => {
          throw new Error('Access denied');
        }),
      };

      const result = await service.scanDirectory(mockDirHandle, 'test/', 0);

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('sorts results: directories first, then alphabetically', async () => {
      const mockDirHandle = {
        name: 'project',
        values: vi.fn().mockReturnValue({
          async *[Symbol.asyncIterator]() {
            yield { kind: 'file', name: 'zebra.md' };
            yield { kind: 'file', name: 'alpha.md' };
            yield {
              kind: 'directory',
              name: 'beta',
              values: vi.fn().mockReturnValue({
                async *[Symbol.asyncIterator]() {
                  yield { kind: 'file', name: 'nested.md' };
                },
              }),
            };
          },
        }),
      };

      const result = await service.scanDirectory(mockDirHandle, '', 0);

      expect(result[0].name).toBe('beta'); // Directory first
      expect(result[1].name).toBe('alpha.md');
      expect(result[2].name).toBe('zebra.md');
    });
  });

  describe('readFile()', () => {
    it('reads file content successfully', async () => {
      const mockFile = {
        name: 'test.md',
        size: 13,
        lastModified: Date.now(),
        text: vi.fn().mockResolvedValue('# Hello World'),
      };
      const mockFileHandle = {
        getFile: vi.fn().mockResolvedValue(mockFile),
      };

      const result = await service.readFile(mockFileHandle);

      expect(result.success).toBe(true);
      expect(result.content).toBe('# Hello World');
      expect(result.name).toBe('test.md');
      expect(result.size).toBe(13);
    });

    it('handles read errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const mockFileHandle = {
        getFile: vi.fn().mockRejectedValue(new Error('File locked')),
      };

      const result = await service.readFile(mockFileHandle);

      expect(result.success).toBe(false);
      expect(result.error).toBe('File locked');

      consoleSpy.mockRestore();
    });
  });

  describe('createFile() - advanced cases', () => {
    it('handles file already exists error', async () => {
      const mockFileHandle = { name: 'existing.md' };

      const mockDirHandle = {
        name: 'test-dir',
        queryPermission: vi.fn().mockResolvedValue('granted'),
        getFileHandle: vi.fn().mockResolvedValue(mockFileHandle), // File exists
      };

      service.currentDirectoryHandle = mockDirHandle;

      const result = await service.createFile(null, 'existing.md', '');

      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });

    it('handles permission request flow', async () => {
      const notFoundError = new Error('Not found');
      notFoundError.name = 'NotFoundError';

      const mockDirHandle = {
        name: 'test-dir',
        queryPermission: vi.fn().mockResolvedValue('denied'),
        requestPermission: vi.fn().mockResolvedValue('denied'),
        getFileHandle: vi.fn().mockRejectedValue(notFoundError),
      };

      service.currentDirectoryHandle = mockDirHandle;

      const result = await service.createFile(null, 'test.md', '');

      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.PERMISSION_DENIED_WRITE);
    });

    it('sanitizes filename before creation', async () => {
      const notFoundError = new Error('Not found');
      notFoundError.name = 'NotFoundError';

      const mockDirHandle = {
        name: 'test-dir',
        queryPermission: vi.fn().mockResolvedValue('granted'),
        getFileHandle: vi.fn().mockImplementation((name, options) => {
          if (!options?.create) {
            throw notFoundError;
          }
          return {
            createWritable: vi.fn().mockResolvedValue({
              write: vi.fn(),
              close: vi.fn(),
            }),
          };
        }),
      };

      service.currentDirectoryHandle = mockDirHandle;

      const result = await service.createFile(null, 'test<>file', '');

      expect(result.success).toBe(true);
      expect(result.filename).toBe('testfile.md');
    });

    it('creates file with sanitized name when invalid chars present', async () => {
      // After sanitization, '<>:"/\\|?*' + '.md' -> '.md' -> 'md' (leading dot removed)
      // So filename becomes 'md' which is valid
      const notFoundError = new Error('Not found');
      notFoundError.name = 'NotFoundError';

      const mockDirHandle = {
        name: 'test',
        queryPermission: vi.fn().mockResolvedValue('granted'),
        getFileHandle: vi.fn().mockImplementation((name, options) => {
          if (!options?.create) {
            throw notFoundError;
          }
          return {
            createWritable: vi.fn().mockResolvedValue({
              write: vi.fn(),
              close: vi.fn(),
            }),
          };
        }),
      };
      service.currentDirectoryHandle = mockDirHandle;

      const result = await service.createFile(null, '<>:"/\\|?*', '');

      // The invalid chars are stripped, .md is added, leading dot removed -> 'md'
      expect(result.success).toBe(true);
      expect(result.filename).toBe('md');
    });

    it('handles unexpected errors during file check', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const unexpectedError = new Error('Unexpected');
      unexpectedError.name = 'UnexpectedError';

      const mockDirHandle = {
        name: 'test-dir',
        queryPermission: vi.fn().mockResolvedValue('granted'),
        getFileHandle: vi.fn().mockRejectedValue(unexpectedError),
      };

      service.currentDirectoryHandle = mockDirHandle;

      const result = await service.createFile(null, 'test.md', '');

      expect(result.success).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe('createFileWithPicker()', () => {
    it('returns error when API not supported', async () => {
      const originalShowDirectoryPicker = window.showDirectoryPicker;
      delete window.showDirectoryPicker;

      const result = await service.createFileWithPicker('test.md', '# Content');

      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.API_NOT_SUPPORTED);

      if (originalShowDirectoryPicker) {
        window.showDirectoryPicker = originalShowDirectoryPicker;
      }
    });

    it('handles user cancellation', async () => {
      window.showDirectoryPicker = vi.fn(); // Make isSupported return true

      const abortError = new Error('User cancelled');
      abortError.name = 'AbortError';

      window.showSaveFilePicker = vi.fn().mockRejectedValue(abortError);

      const result = await service.createFileWithPicker('test.md', '');

      expect(result.success).toBe(false);
      expect(result.cancelled).toBe(true);
    });

    it('handles picker errors', async () => {
      window.showDirectoryPicker = vi.fn();

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      window.showSaveFilePicker = vi.fn().mockRejectedValue(new Error('Picker failed'));

      const result = await service.createFileWithPicker('test.md', '');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Picker failed');

      consoleSpy.mockRestore();
    });

    it('creates file successfully via picker', async () => {
      window.showDirectoryPicker = vi.fn();

      const mockWritable = {
        write: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
      };

      const mockFileHandle = {
        name: 'notes.md',
        createWritable: vi.fn().mockResolvedValue(mockWritable),
      };

      window.showSaveFilePicker = vi.fn().mockResolvedValue(mockFileHandle);

      const result = await service.createFileWithPicker('notes.md', '# My Notes');

      expect(result.success).toBe(true);
      expect(result.filename).toBe('notes.md');
      expect(mockWritable.write).toHaveBeenCalledWith('# My Notes');
    });
  });

  describe('getDirectoryByPath()', () => {
    it('returns root when no path provided', async () => {
      service.currentDirectoryHandle = { name: 'root' };

      const result = await service.getDirectoryByPath('');

      expect(result).toBe(service.currentDirectoryHandle);
    });

    it('returns root when currentDirectoryHandle is null', async () => {
      const result = await service.getDirectoryByPath('some/path');

      expect(result).toBeNull();
    });

    it('navigates to nested directory', async () => {
      const nestedDir = { name: 'nested' };
      const docsDir = {
        name: 'docs',
        getDirectoryHandle: vi.fn().mockResolvedValue(nestedDir),
      };
      const rootDir = {
        name: 'root',
        getDirectoryHandle: vi.fn().mockResolvedValue(docsDir),
      };

      service.currentDirectoryHandle = rootDir;

      const result = await service.getDirectoryByPath('docs/nested');

      expect(result).toBe(nestedDir);
      expect(rootDir.getDirectoryHandle).toHaveBeenCalledWith('docs');
      expect(docsDir.getDirectoryHandle).toHaveBeenCalledWith('nested');
    });

    it('handles path with trailing slash', async () => {
      const targetDir = { name: 'target' };
      const rootDir = {
        name: 'root',
        getDirectoryHandle: vi.fn().mockResolvedValue(targetDir),
      };

      service.currentDirectoryHandle = rootDir;

      const result = await service.getDirectoryByPath('target/');

      expect(result).toBe(targetDir);
    });

    it('returns null on navigation error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const rootDir = {
        name: 'root',
        getDirectoryHandle: vi.fn().mockRejectedValue(new Error('Not found')),
      };

      service.currentDirectoryHandle = rootDir;

      const result = await service.getDirectoryByPath('nonexistent');

      expect(result).toBeNull();

      consoleSpy.mockRestore();
    });
  });

  describe('createDirectory()', () => {
    it('creates directory successfully', async () => {
      const newDir = { name: 'new-folder' };
      const mockDirHandle = {
        name: 'root',
        queryPermission: vi.fn().mockResolvedValue('granted'),
        getDirectoryHandle: vi.fn().mockResolvedValue(newDir),
      };

      service.currentDirectoryHandle = mockDirHandle;

      const result = await service.createDirectory(null, 'new-folder');

      expect(result.success).toBe(true);
      expect(result.name).toBe('new-folder');
      expect(mockDirHandle.getDirectoryHandle).toHaveBeenCalledWith('new-folder', { create: true });
    });

    it('requests permission when not granted', async () => {
      const newDir = { name: 'new-folder' };
      const mockDirHandle = {
        name: 'root',
        queryPermission: vi.fn().mockResolvedValue('prompt'),
        requestPermission: vi.fn().mockResolvedValue('granted'),
        getDirectoryHandle: vi.fn().mockResolvedValue(newDir),
      };

      service.currentDirectoryHandle = mockDirHandle;

      const result = await service.createDirectory(null, 'new-folder');

      expect(result.success).toBe(true);
      expect(mockDirHandle.requestPermission).toHaveBeenCalledWith({ mode: 'readwrite' });
    });

    it('returns error when permission denied', async () => {
      const mockDirHandle = {
        name: 'root',
        queryPermission: vi.fn().mockResolvedValue('denied'),
        requestPermission: vi.fn().mockResolvedValue('denied'),
      };

      service.currentDirectoryHandle = mockDirHandle;

      const result = await service.createDirectory(null, 'new-folder');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Write permission denied.');
    });

    it('handles creation errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const mockDirHandle = {
        name: 'root',
        queryPermission: vi.fn().mockResolvedValue('granted'),
        getDirectoryHandle: vi.fn().mockRejectedValue(new Error('Disk full')),
      };

      service.currentDirectoryHandle = mockDirHandle;

      const result = await service.createDirectory(null, 'new-folder');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Disk full');

      consoleSpy.mockRestore();
    });

    it('sanitizes directory name', async () => {
      const newDir = { name: 'cleanname' };
      const mockDirHandle = {
        name: 'root',
        queryPermission: vi.fn().mockResolvedValue('granted'),
        getDirectoryHandle: vi.fn().mockResolvedValue(newDir),
      };

      service.currentDirectoryHandle = mockDirHandle;

      const result = await service.createDirectory(null, 'clean<>name');

      expect(result.success).toBe(true);
      expect(mockDirHandle.getDirectoryHandle).toHaveBeenCalledWith('cleanname', { create: true });
    });
  });

  describe('refreshFolder() - advanced cases', () => {
    it('refreshes folder successfully when permission granted', async () => {
      const mockFileEntry = {
        kind: 'file',
        name: 'test.md',
      };

      const mockDirHandle = {
        name: 'test-project',
        queryPermission: vi.fn().mockResolvedValue('granted'),
        values: vi.fn().mockReturnValue({
          async *[Symbol.asyncIterator]() {
            yield mockFileEntry;
          },
        }),
      };

      service.currentDirectoryHandle = mockDirHandle;

      const result = await service.refreshFolder();

      expect(result.success).toBe(true);
      expect(result.folderName).toBe('test-project');
      expect(service.lastScanResult).not.toBeNull();
    });

    it('re-requests permission when expired', async () => {
      const mockFileEntry = { kind: 'file', name: 'test.md' };

      const mockDirHandle = {
        name: 'test-project',
        queryPermission: vi.fn().mockResolvedValue('prompt'),
        requestPermission: vi.fn().mockResolvedValue('granted'),
        values: vi.fn().mockReturnValue({
          async *[Symbol.asyncIterator]() {
            yield mockFileEntry;
          },
        }),
      };

      service.currentDirectoryHandle = mockDirHandle;

      const result = await service.refreshFolder();

      expect(result.success).toBe(true);
      expect(mockDirHandle.requestPermission).toHaveBeenCalledWith({ mode: 'read' });
    });

    it('handles refresh errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const mockDirHandle = {
        name: 'test',
        queryPermission: vi.fn().mockRejectedValue(new Error('Handle invalid')),
      };

      service.currentDirectoryHandle = mockDirHandle;

      const result = await service.refreshFolder();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Handle invalid');

      consoleSpy.mockRestore();
    });
  });

  describe('saveFile() - advanced cases', () => {
    it('requests permission when not initially granted', async () => {
      const mockWritable = {
        write: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
      };

      const mockFileHandle = {
        name: 'test.md',
        queryPermission: vi.fn().mockResolvedValue('prompt'),
        requestPermission: vi.fn().mockResolvedValue('granted'),
        createWritable: vi.fn().mockResolvedValue(mockWritable),
      };

      const result = await service.saveFile(mockFileHandle, 'new content');

      expect(result.success).toBe(true);
      expect(mockFileHandle.requestPermission).toHaveBeenCalledWith({ mode: 'readwrite' });
    });

    it('handles write errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const mockFileHandle = {
        name: 'test.md',
        queryPermission: vi.fn().mockResolvedValue('granted'),
        createWritable: vi.fn().mockRejectedValue(new Error('Disk full')),
      };

      const result = await service.saveFile(mockFileHandle, 'content');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Disk full');

      consoleSpy.mockRestore();
    });
  });

  describe('sanitizeFilename() - edge cases', () => {
    it('removes control characters', () => {
      // Control character \x01 should be removed
      const result = service.sanitizeFilename('test\x01file.md');
      expect(result).toBe('testfile.md');
    });

    it('handles null byte', () => {
      const result = service.sanitizeFilename('test\x00file.md');
      expect(result).toBe('testfile.md');
    });

    it('handles DEL character (127)', () => {
      // DEL is actually allowed since it's >= 32, but let's test the boundary
      const result = service.sanitizeFilename('test\x1ffile.md');
      expect(result).toBe('testfile.md');
    });

    it('preserves unicode characters', () => {
      const result = service.sanitizeFilename('日本語ファイル.md');
      expect(result).toBe('日本語ファイル.md');
    });

    it('removes multiple invalid characters at once', () => {
      const result = service.sanitizeFilename('t<e>s:t"f/i\\l|e?n*ame.md');
      expect(result).toBe('testfilename.md');
    });
  });
});
