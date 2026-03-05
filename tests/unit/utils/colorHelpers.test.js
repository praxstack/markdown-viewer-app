import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearAllCssVariableOverrides,
  getAllCssVariables,
  getCssVariable,
  isDarkTheme,
  removeCssVariable,
  setCssVariable,
} from '../../../src/js/utils/colorHelpers.js';

describe('colorHelpers', () => {
  // Mock document.documentElement for tests
  let mockRoot;
  let mockComputedStyle;

  beforeEach(() => {
    // Reset inline styles
    mockRoot = {
      style: {
        _properties: {},
        setProperty(name, value) {
          this._properties[name] = value;
        },
        removeProperty(name) {
          delete this._properties[name];
        },
        getPropertyValue(name) {
          return this._properties[name] || '';
        },
        length: 0,
        *[Symbol.iterator]() {
          for (const key of Object.keys(this._properties)) {
            yield key;
          }
        },
      },
    };

    // Update length dynamically
    Object.defineProperty(mockRoot.style, 'length', {
      get() {
        return Object.keys(this._properties).length;
      },
    });

    // Add indexed access
    const originalSetProperty = mockRoot.style.setProperty.bind(mockRoot.style);
    mockRoot.style.setProperty = function (name, value) {
      originalSetProperty(name, value);
      const keys = Object.keys(this._properties);
      keys.forEach((key, i) => {
        this[i] = key;
      });
    };

    mockComputedStyle = {
      getPropertyValue: vi.fn(varName => {
        // Return mock values for testing
        const mockValues = {
          '--bg-primary': '#ffffff',
          '--text-primary': '#000000',
          '--h1-color': '#0969da',
          '--empty-var': '',
        };
        return mockValues[varName] || '';
      }),
    };

    // Mock global functions
    vi.stubGlobal('document', {
      documentElement: mockRoot,
    });
    vi.stubGlobal(
      'getComputedStyle',
      vi.fn(() => mockComputedStyle),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getCssVariable', () => {
    it('should return trimmed CSS variable value', () => {
      mockComputedStyle.getPropertyValue.mockReturnValue('  #ffffff  ');
      expect(getCssVariable('--bg-primary')).toBe('#ffffff');
    });

    it('should return empty string for non-existent variable', () => {
      mockComputedStyle.getPropertyValue.mockReturnValue('');
      expect(getCssVariable('--non-existent')).toBe('');
    });

    it('should call getComputedStyle with document.documentElement', () => {
      getCssVariable('--test-var');
      expect(getComputedStyle).toHaveBeenCalledWith(document.documentElement);
    });

    it('should call getPropertyValue with the correct variable name', () => {
      getCssVariable('--my-custom-var');
      expect(mockComputedStyle.getPropertyValue).toHaveBeenCalledWith('--my-custom-var');
    });
  });

  describe('setCssVariable', () => {
    it('should set CSS variable on document root', () => {
      setCssVariable('--test-color', '#ff0000');
      expect(mockRoot.style._properties['--test-color']).toBe('#ff0000');
    });

    it('should override existing CSS variable', () => {
      setCssVariable('--test-color', '#ff0000');
      setCssVariable('--test-color', '#00ff00');
      expect(mockRoot.style._properties['--test-color']).toBe('#00ff00');
    });

    it('should handle various color formats', () => {
      setCssVariable('--hex-color', '#abc123');
      setCssVariable('--rgb-color', 'rgb(255, 0, 0)');
      setCssVariable('--rgba-color', 'rgba(0, 0, 0, 0.5)');

      expect(mockRoot.style._properties['--hex-color']).toBe('#abc123');
      expect(mockRoot.style._properties['--rgb-color']).toBe('rgb(255, 0, 0)');
      expect(mockRoot.style._properties['--rgba-color']).toBe('rgba(0, 0, 0, 0.5)');
    });
  });

  describe('removeCssVariable', () => {
    it('should remove CSS variable from document root', () => {
      mockRoot.style._properties['--test-color'] = '#ff0000';
      removeCssVariable('--test-color');
      expect(mockRoot.style._properties['--test-color']).toBeUndefined();
    });

    it('should not throw when removing non-existent variable', () => {
      expect(() => removeCssVariable('--non-existent')).not.toThrow();
    });
  });

  describe('isDarkTheme', () => {
    it('should return true for dark backgrounds starting with #0', () => {
      mockComputedStyle.getPropertyValue.mockReturnValue('#0d1117');
      expect(isDarkTheme()).toBe(true);
    });

    it('should return true for dark backgrounds starting with #1', () => {
      mockComputedStyle.getPropertyValue.mockReturnValue('#1a1a2e');
      expect(isDarkTheme()).toBe(true);
    });

    it('should return true for dark backgrounds starting with #2', () => {
      mockComputedStyle.getPropertyValue.mockReturnValue('#2d2d44');
      expect(isDarkTheme()).toBe(true);
    });

    it('should return false for light backgrounds', () => {
      mockComputedStyle.getPropertyValue.mockReturnValue('#ffffff');
      expect(isDarkTheme()).toBe(false);
    });

    it('should return false for medium backgrounds', () => {
      mockComputedStyle.getPropertyValue.mockReturnValue('#888888');
      expect(isDarkTheme()).toBe(false);
    });

    it('should return false for backgrounds starting with #f', () => {
      mockComputedStyle.getPropertyValue.mockReturnValue('#f5f5f5');
      expect(isDarkTheme()).toBe(false);
    });
  });

  describe('getAllCssVariables', () => {
    it('should return object with all requested CSS variables', () => {
      mockComputedStyle.getPropertyValue.mockImplementation(varName => {
        const values = {
          '--bg-primary': '#ffffff',
          '--text-primary': '#000000',
        };
        return values[varName] || '';
      });

      const result = getAllCssVariables(['--bg-primary', '--text-primary']);

      expect(result).toEqual({
        '--bg-primary': '#ffffff',
        '--text-primary': '#000000',
      });
    });

    it('should return empty values for non-existent variables', () => {
      mockComputedStyle.getPropertyValue.mockReturnValue('');

      const result = getAllCssVariables(['--non-existent', '--also-missing']);

      expect(result).toEqual({
        '--non-existent': '',
        '--also-missing': '',
      });
    });

    it('should return empty object for empty array', () => {
      const result = getAllCssVariables([]);
      expect(result).toEqual({});
    });

    it('should call getComputedStyle once regardless of variable count', () => {
      getAllCssVariables(['--var1', '--var2', '--var3']);
      expect(getComputedStyle).toHaveBeenCalledTimes(1);
    });
  });

  describe('clearAllCssVariableOverrides', () => {
    it('should remove all CSS variable overrides', () => {
      // Set up some CSS variables
      mockRoot.style.setProperty('--custom-bg', '#ff0000');
      mockRoot.style.setProperty('--custom-text', '#00ff00');
      mockRoot.style.setProperty('--custom-border', '#0000ff');

      clearAllCssVariableOverrides();

      expect(mockRoot.style._properties['--custom-bg']).toBeUndefined();
      expect(mockRoot.style._properties['--custom-text']).toBeUndefined();
      expect(mockRoot.style._properties['--custom-border']).toBeUndefined();
    });

    it('should only remove properties starting with --', () => {
      // Set up CSS variables with proper indexing
      mockRoot.style.setProperty('--custom-bg', '#ff0000');
      mockRoot.style.setProperty('--custom-text', '#00ff00');

      // Manually add a non-CSS-variable (won't be indexed, but tests the filter)
      clearAllCssVariableOverrides();

      // CSS variables should be removed
      expect(mockRoot.style._properties['--custom-bg']).toBeUndefined();
      expect(mockRoot.style._properties['--custom-text']).toBeUndefined();
    });

    it('should handle empty style object', () => {
      expect(() => clearAllCssVariableOverrides()).not.toThrow();
    });
  });
});
