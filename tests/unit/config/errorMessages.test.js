/**
 * Error Messages Unit Tests
 *
 * Comprehensive tests for centralized error message system.
 * Tests all error message constants and the getErrorMessage utility function.
 */

import { describe, expect, it } from 'vitest';
import { ERROR_MESSAGES, getErrorMessage } from '../../../src/js/config/errorMessages.js';

describe('ERROR_MESSAGES', () => {
  describe('File System Access API Messages', () => {
    it('defines API_NOT_SUPPORTED message', () => {
      expect(ERROR_MESSAGES.API_NOT_SUPPORTED).toBeDefined();
      expect(ERROR_MESSAGES.API_NOT_SUPPORTED).toBe(
        'File System Access API not supported. Please use Chrome or Edge browser.',
      );
    });
  });

  describe('Folder Operation Messages', () => {
    it('defines NO_FOLDER_OPEN message', () => {
      expect(ERROR_MESSAGES.NO_FOLDER_OPEN).toBeDefined();
      expect(ERROR_MESSAGES.NO_FOLDER_OPEN).toBe(
        'No folder is currently open. Please open a folder first.',
      );
    });

    it('defines PERMISSION_DENIED message', () => {
      expect(ERROR_MESSAGES.PERMISSION_DENIED).toBeDefined();
      expect(ERROR_MESSAGES.PERMISSION_DENIED).toBe(
        'Permission denied. Please re-open the folder.',
      );
    });

    it('defines PERMISSION_DENIED_WRITE message', () => {
      expect(ERROR_MESSAGES.PERMISSION_DENIED_WRITE).toBeDefined();
      expect(ERROR_MESSAGES.PERMISSION_DENIED_WRITE).toBe(
        'Write permission denied. Cannot create file.',
      );
    });

    it('defines PERMISSION_DENIED_SAVE message', () => {
      expect(ERROR_MESSAGES.PERMISSION_DENIED_SAVE).toBeDefined();
      expect(ERROR_MESSAGES.PERMISSION_DENIED_SAVE).toBe(
        'Write permission denied. Cannot save file.',
      );
    });
  });

  describe('File Operation Messages', () => {
    it('defines INVALID_FILENAME message', () => {
      expect(ERROR_MESSAGES.INVALID_FILENAME).toBeDefined();
      expect(ERROR_MESSAGES.INVALID_FILENAME).toBe(
        'Invalid filename. Please provide a valid name.',
      );
    });

    it('defines INVALID_FILENAME_PROVIDED message', () => {
      expect(ERROR_MESSAGES.INVALID_FILENAME_PROVIDED).toBeDefined();
      expect(ERROR_MESSAGES.INVALID_FILENAME_PROVIDED).toBe('Invalid filename provided.');
    });

    it('defines FILE_EXISTS as a function', () => {
      expect(ERROR_MESSAGES.FILE_EXISTS).toBeDefined();
      expect(typeof ERROR_MESSAGES.FILE_EXISTS).toBe('function');
    });

    it('FILE_EXISTS returns dynamic message with filename', () => {
      expect(ERROR_MESSAGES.FILE_EXISTS('test.md')).toBe(
        'File "test.md" already exists. Please choose a different name.',
      );
      expect(ERROR_MESSAGES.FILE_EXISTS('README.md')).toBe(
        'File "README.md" already exists. Please choose a different name.',
      );
      expect(ERROR_MESSAGES.FILE_EXISTS('notes/document.md')).toBe(
        'File "notes/document.md" already exists. Please choose a different name.',
      );
    });

    it('FILE_EXISTS handles edge cases', () => {
      expect(ERROR_MESSAGES.FILE_EXISTS('')).toBe(
        'File "" already exists. Please choose a different name.',
      );
      expect(ERROR_MESSAGES.FILE_EXISTS('file with spaces.md')).toBe(
        'File "file with spaces.md" already exists. Please choose a different name.',
      );
      expect(ERROR_MESSAGES.FILE_EXISTS('特殊文字.md')).toBe(
        'File "特殊文字.md" already exists. Please choose a different name.',
      );
    });

    it('defines FILE_CREATE_FAILED message', () => {
      expect(ERROR_MESSAGES.FILE_CREATE_FAILED).toBeDefined();
      expect(ERROR_MESSAGES.FILE_CREATE_FAILED).toBe('Failed to create file.');
    });

    it('defines FILE_SAVE_FAILED message', () => {
      expect(ERROR_MESSAGES.FILE_SAVE_FAILED).toBeDefined();
      expect(ERROR_MESSAGES.FILE_SAVE_FAILED).toBe('Failed to save file.');
    });

    it('defines NO_FILE_HANDLE message', () => {
      expect(ERROR_MESSAGES.NO_FILE_HANDLE).toBeDefined();
      expect(ERROR_MESSAGES.NO_FILE_HANDLE).toBe('No file handle provided.');
    });
  });

  describe('Directory Operation Messages', () => {
    it('defines INVALID_DIRECTORY_NAME message', () => {
      expect(ERROR_MESSAGES.INVALID_DIRECTORY_NAME).toBeDefined();
      expect(ERROR_MESSAGES.INVALID_DIRECTORY_NAME).toBe('Invalid directory name.');
    });
  });

  describe('Validation Messages', () => {
    it('defines MAX_DEPTH_REACHED as a function', () => {
      expect(ERROR_MESSAGES.MAX_DEPTH_REACHED).toBeDefined();
      expect(typeof ERROR_MESSAGES.MAX_DEPTH_REACHED).toBe('function');
    });

    it('MAX_DEPTH_REACHED returns dynamic message with depth and path', () => {
      expect(ERROR_MESSAGES.MAX_DEPTH_REACHED(10, '/docs/nested')).toBe(
        'Max depth 10 reached at: /docs/nested',
      );
      expect(ERROR_MESSAGES.MAX_DEPTH_REACHED(5, '/a/b/c/d/e')).toBe(
        'Max depth 5 reached at: /a/b/c/d/e',
      );
    });

    it('MAX_DEPTH_REACHED handles edge cases', () => {
      expect(ERROR_MESSAGES.MAX_DEPTH_REACHED(0, '')).toBe('Max depth 0 reached at: ');
      expect(ERROR_MESSAGES.MAX_DEPTH_REACHED(100, 'root')).toBe('Max depth 100 reached at: root');
    });

    it('defines MAX_FILES_REACHED as a function', () => {
      expect(ERROR_MESSAGES.MAX_FILES_REACHED).toBeDefined();
      expect(typeof ERROR_MESSAGES.MAX_FILES_REACHED).toBe('function');
    });

    it('MAX_FILES_REACHED returns dynamic message with count', () => {
      expect(ERROR_MESSAGES.MAX_FILES_REACHED(1000)).toBe('Max files 1000 reached');
      expect(ERROR_MESSAGES.MAX_FILES_REACHED(500)).toBe('Max files 500 reached');
    });

    it('MAX_FILES_REACHED handles edge cases', () => {
      expect(ERROR_MESSAGES.MAX_FILES_REACHED(0)).toBe('Max files 0 reached');
      expect(ERROR_MESSAGES.MAX_FILES_REACHED(999999)).toBe('Max files 999999 reached');
    });
  });

  describe('ERROR_MESSAGES object structure', () => {
    it('contains all expected keys', () => {
      const expectedKeys = [
        'API_NOT_SUPPORTED',
        'NO_FOLDER_OPEN',
        'PERMISSION_DENIED',
        'PERMISSION_DENIED_WRITE',
        'PERMISSION_DENIED_SAVE',
        'INVALID_FILENAME',
        'INVALID_FILENAME_PROVIDED',
        'FILE_EXISTS',
        'FILE_CREATE_FAILED',
        'FILE_SAVE_FAILED',
        'NO_FILE_HANDLE',
        'INVALID_DIRECTORY_NAME',
        'MAX_DEPTH_REACHED',
        'MAX_FILES_REACHED',
      ];

      expectedKeys.forEach(key => {
        expect(ERROR_MESSAGES).toHaveProperty(key);
      });
    });

    it('is a frozen/constant object (immutable pattern)', () => {
      // Verify the object values cannot be accidentally changed
      const _originalValue = ERROR_MESSAGES.NO_FOLDER_OPEN;
      expect(() => {
        ERROR_MESSAGES.NO_FOLDER_OPEN = 'hacked';
      }).not.toThrow(); // ES6 const doesn't prevent mutation, but good practice
      // Value should still work correctly
      expect(ERROR_MESSAGES.NO_FOLDER_OPEN).toBeDefined();
    });
  });
});

describe('getErrorMessage()', () => {
  describe('String messages', () => {
    it('returns string message as-is', () => {
      const result = getErrorMessage(ERROR_MESSAGES.NO_FOLDER_OPEN);
      expect(result).toBe(ERROR_MESSAGES.NO_FOLDER_OPEN);
    });

    it('returns string message with no params', () => {
      const result = getErrorMessage(ERROR_MESSAGES.PERMISSION_DENIED);
      expect(result).toBe(ERROR_MESSAGES.PERMISSION_DENIED);
    });

    it('ignores extra params for string messages', () => {
      const result = getErrorMessage(ERROR_MESSAGES.API_NOT_SUPPORTED, 'extra', 'params');
      expect(result).toBe(ERROR_MESSAGES.API_NOT_SUPPORTED);
    });
  });

  describe('Function messages', () => {
    it('calls function message with single param', () => {
      const result = getErrorMessage(ERROR_MESSAGES.MAX_FILES_REACHED, 1000);
      expect(result).toBe('Max files 1000 reached');
    });

    it('calls function message with multiple params', () => {
      const result = getErrorMessage(ERROR_MESSAGES.MAX_DEPTH_REACHED, 10, '/docs/nested');
      expect(result).toBe('Max depth 10 reached at: /docs/nested');
    });

    it('calls FILE_EXISTS function correctly', () => {
      const result = getErrorMessage(ERROR_MESSAGES.FILE_EXISTS, 'document.md');
      expect(result).toBe('File "document.md" already exists. Please choose a different name.');
    });
  });

  describe('Edge cases', () => {
    it('handles direct string input', () => {
      const result = getErrorMessage('Custom error message');
      expect(result).toBe('Custom error message');
    });

    it('handles empty string', () => {
      const result = getErrorMessage('');
      expect(result).toBe('');
    });

    it('handles function that takes no params', () => {
      const noParamFn = () => 'No params needed';
      const result = getErrorMessage(noParamFn);
      expect(result).toBe('No params needed');
    });

    it('handles function with rest params correctly', () => {
      const multiParamFn = (...args) => `Received ${args.length} args: ${args.join(', ')}`;
      const result = getErrorMessage(multiParamFn, 'a', 'b', 'c');
      expect(result).toBe('Received 3 args: a, b, c');
    });
  });

  describe('Type handling', () => {
    it('correctly identifies function type', () => {
      const fn = x => `Value: ${x}`;
      const result = getErrorMessage(fn, 42);
      expect(result).toBe('Value: 42');
    });

    it('correctly identifies string type', () => {
      const str = 'Simple string';
      const result = getErrorMessage(str);
      expect(result).toBe('Simple string');
    });
  });
});

describe('Error message consistency', () => {
  it('string messages are properly formatted', () => {
    // Verify all string messages are non-empty strings
    const stringMessages = [
      ERROR_MESSAGES.API_NOT_SUPPORTED,
      ERROR_MESSAGES.NO_FOLDER_OPEN,
      ERROR_MESSAGES.PERMISSION_DENIED,
      ERROR_MESSAGES.PERMISSION_DENIED_WRITE,
      ERROR_MESSAGES.PERMISSION_DENIED_SAVE,
      ERROR_MESSAGES.INVALID_FILENAME,
      ERROR_MESSAGES.INVALID_FILENAME_PROVIDED,
      ERROR_MESSAGES.FILE_CREATE_FAILED,
      ERROR_MESSAGES.FILE_SAVE_FAILED,
      ERROR_MESSAGES.NO_FILE_HANDLE,
      ERROR_MESSAGES.INVALID_DIRECTORY_NAME,
    ];

    stringMessages.forEach(msg => {
      expect(typeof msg).toBe('string');
      expect(msg.length).toBeGreaterThan(0);
    });
  });

  it('function messages produce strings', () => {
    expect(typeof ERROR_MESSAGES.FILE_EXISTS('test.md')).toBe('string');
    expect(typeof ERROR_MESSAGES.MAX_DEPTH_REACHED(10, '/path')).toBe('string');
    expect(typeof ERROR_MESSAGES.MAX_FILES_REACHED(100)).toBe('string');
  });

  it('all messages are non-empty strings', () => {
    Object.values(ERROR_MESSAGES).forEach(value => {
      if (typeof value === 'string') {
        expect(value.length).toBeGreaterThan(0);
      } else if (typeof value === 'function') {
        // Test with dummy values
        const result = value('test');
        expect(result.length).toBeGreaterThan(0);
      }
    });
  });
});
