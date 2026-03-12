import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createBlobUrl,
  decodeHtmlEntities,
  downloadFile,
  generateId,
} from '../../../src/js/utils/htmlHelpers.js';

describe('htmlHelpers', () => {
  describe('decodeHtmlEntities', () => {
    it('should decode basic HTML entities', () => {
      expect(decodeHtmlEntities('&lt;div&gt;')).toBe('<div>');
    });

    it('should decode complex entities', () => {
      expect(decodeHtmlEntities('&quot;Hello &amp; World&quot;')).toBe('"Hello & World"');
    });

    it('should return original text if no entities present', () => {
      expect(decodeHtmlEntities('Plain text')).toBe('Plain text');
      expect(decodeHtmlEntities('A{Start}')).toBe('A{Start}');
    });

    it('should handle empty string', () => {
      expect(decodeHtmlEntities('')).toBe('');
    });
  });

  describe('createBlobUrl', () => {
    beforeEach(() => {
      vi.stubGlobal('Blob', vi.fn().mockImplementation((content, options) => ({ content, options })));
      vi.stubGlobal('URL', {
        createObjectURL: vi.fn().mockReturnValue('blob:mock-url'),
        revokeObjectURL: vi.fn(),
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should create a blob with correct content and type', () => {
      const content = '<html></html>';
      const mimeType = 'text/html';
      const url = createBlobUrl(content, mimeType);

      expect(global.Blob).toHaveBeenCalledWith([content], { type: mimeType });
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(url).toBe('blob:mock-url');
    });
  });

  describe('downloadFile', () => {
    let mockAnchor;

    beforeEach(() => {
      mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      vi.stubGlobal('document', {
        createElement: vi.fn().mockReturnValue(mockAnchor),
      });
      vi.stubGlobal('URL', {
        revokeObjectURL: vi.fn(),
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should create an anchor, set attributes, click it, and revoke URL', () => {
      const url = 'blob:test-url';
      const filename = 'test.md';

      downloadFile(url, filename);

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockAnchor.href).toBe(url);
      expect(mockAnchor.download).toBe(filename);
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(url);
    });
  });

  describe('generateId', () => {
    it('should start with the given prefix', () => {
      const id = generateId('test');
      expect(id.startsWith('test-')).toBe(true);
    });

    it('should use default prefix "id" if none provided', () => {
      const id = generateId();
      expect(id.startsWith('id-')).toBe(true);
    });

    it('should generate unique-looking IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('should have the correct format (prefix followed by random string)', () => {
      const id = generateId('prefix');
      const parts = id.split('-');
      expect(parts.length).toBe(2);
      expect(parts[0]).toBe('prefix');
      expect(parts[1].length).toBeGreaterThanOrEqual(1);
    });
  });
});
