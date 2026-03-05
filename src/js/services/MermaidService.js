/**
 * MermaidService - Mermaid Diagram Rendering Service
 *
 * Handles all Mermaid diagram rendering with theme-aware configuration.
 * Automatically detects light/dark themes and adjusts for optimal readability.
 * Isolated service for better testability and maintainability.
 */

import { MERMAID_CONFIG } from '../config/constants.js';
import { getCssVariable } from '../utils/colorHelpers.js';

// Default fallback colors (light theme)
const DEFAULT_COLORS = {
  bgPrimary: '#ffffff',
  bgSecondary: '#f5f5f5',
  bgTertiary: '#e8e8e8',
  textPrimary: '#1a1a2e',
  textSecondary: '#666666',
  h1: '#0969da',
  h2: '#8250df',
  h3: '#1a7f37',
};

/**
 * Calculate relative luminance of a color
 * Used to detect if theme is light or dark
 *
 * @param {string} color - Hex color (#rrggbb)
 * @returns {number} Luminance value (0-1)
 * @private
 */
function getRelativeLuminance(color) {
  // Handle empty or invalid colors - default to light theme
  if (!color || typeof color !== 'string' || color.trim() === '') {
    return 0.9; // Light theme default
  }

  // Remove # if present
  const hex = color.replace('#', '');

  // Validate hex format
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
    return 0.9; // Light theme default for invalid hex
  }

  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  // Apply sRGB gamma correction
  const rsRGB = r <= 0.03928 ? r / 12.92 : ((r + 0.055) / 1.055) ** 2.4;
  const gsRGB = g <= 0.03928 ? g / 12.92 : ((g + 0.055) / 1.055) ** 2.4;
  const bsRGB = b <= 0.03928 ? b / 12.92 : ((b + 0.055) / 1.055) ** 2.4;

  // Calculate relative luminance
  return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
}

/**
 * Detect if current theme is light or dark
 *
 * @param {string} bgColor - Background color
 * @returns {boolean} True if light theme
 * @private
 */
function isLightTheme(bgColor) {
  const luminance = getRelativeLuminance(bgColor);
  return luminance > 0.5; // Threshold for light/dark
}

/**
 * Wait for CSS to be fully loaded
 * Safari loads CSS asynchronously, so CSS variables may not be available immediately
 *
 * @returns {Promise<void>} Resolves when CSS is loaded
 * @private
 */
function waitForCSS() {
  return new Promise(resolve => {
    const maxAttempts = 50; // Max 500ms wait
    let attempts = 0;

    const checkCSS = () => {
      const testColor = getCssVariable('--bg-primary');
      if (testColor && testColor.trim() !== '') {
        resolve();
      } else if (attempts < maxAttempts) {
        attempts++;
        requestAnimationFrame(checkCSS);
      } else {
        // Timeout - proceed anyway with defaults
        console.warn('⚠️ CSS loading timeout - using default colors');
        resolve();
      }
    };
    checkCSS();
  });
}

/**
 * Get CSS variable with safe fallback
 *
 * @param {string} varName - CSS variable name
 * @param {string} fallback - Fallback value
 * @returns {string} Color value
 * @private
 */
function getSafeColor(varName, fallback) {
  const value = getCssVariable(varName);
  // Check for empty, undefined, or whitespace-only values
  if (!value || value.trim() === '' || value === 'undefined') {
    return fallback;
  }
  return value;
}

/**
 * @class MermaidService
 * @description Service for rendering Mermaid diagrams with theme integration
 *
 * @example
 * const service = new MermaidService();
 * service.initialize();
 * const svg = await service.render('diagram-1', 'graph TD\n A-->B');
 */
export class MermaidService {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize Mermaid with COMPREHENSIVE theme configuration
   * Reads ALL 60+ variables from theme CSS with smart fallbacks
   * Based on official Mermaid.js theming documentation
   *
   * @returns {Promise<void>}
   */
  async initialize() {
    // Wait for CSS to be loaded (Safari compatibility)
    await waitForCSS();

    // Extract core theme colors with Safari-safe fallbacks
    const bgPri = getSafeColor('--bg-primary', DEFAULT_COLORS.bgPrimary);
    const bgSec = getSafeColor('--bg-secondary', DEFAULT_COLORS.bgSecondary);
    const bgTer = getSafeColor('--bg-tertiary', DEFAULT_COLORS.bgTertiary);
    const txtPri = getSafeColor('--text-primary', DEFAULT_COLORS.textPrimary);
    const txtSec = getSafeColor('--text-secondary', DEFAULT_COLORS.textSecondary);
    const h1 = getSafeColor('--h1-color', DEFAULT_COLORS.h1);
    const h2 = getSafeColor('--h2-color', DEFAULT_COLORS.h2);
    const h3 = getSafeColor('--h3-color', DEFAULT_COLORS.h3);

    // Helper to get variable with fallback (for Mermaid-specific vars)
    const get = (varName, fallback) => getSafeColor(varName, fallback);

    const isLight = isLightTheme(bgPri);
    const nodeBkg = isLight ? bgTer : bgSec;
    const clusterBkg = isLight ? bgSec : bgTer;

    if (typeof mermaid !== 'undefined') {
      mermaid.initialize({
        startOnLoad: MERMAID_CONFIG.START_ON_LOAD,
        theme: MERMAID_CONFIG.THEME,
        securityLevel: 'loose', // Allow HTML/style tags inside diagram nodes
        htmlLabels: true, // Force enable HTML rendering
        themeVariables: {
          // Core Global
          background: get('--mermaid-background', bgPri),
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: '16px',
          darkMode: !isLight,
          textColor: get('--mermaid-text-color', txtPri),
          lineColor: get('--mermaid-line-color', h2),
          mainBkg: get('--mermaid-main-bkg', nodeBkg),

          // Primary Set
          primaryColor: get('--mermaid-primary-color', nodeBkg),
          primaryTextColor: get('--mermaid-primary-text-color', txtPri),
          primaryBorderColor: get('--mermaid-primary-border-color', h1),

          // Secondary Set
          secondaryColor: get('--mermaid-secondary-color', clusterBkg),
          secondaryTextColor: get('--mermaid-secondary-text-color', txtPri),
          secondaryBorderColor: get('--mermaid-secondary-border-color', h2),

          // Tertiary Set
          tertiaryColor: get('--mermaid-tertiary-color', bgPri),
          tertiaryTextColor: get('--mermaid-tertiary-text-color', txtPri),
          tertiaryBorderColor: get('--mermaid-tertiary-border-color', h3),

          // Flowchart
          nodeBorder: get('--mermaid-node-border', h1),
          clusterBkg: get('--mermaid-cluster-bkg', clusterBkg),
          clusterBorder: get('--mermaid-cluster-border', h2),
          defaultLinkColor: get('--mermaid-default-link-color', h2),
          titleColor: get('--mermaid-title-color', txtPri),
          edgeLabelBackground: get('--mermaid-edge-label-background', bgPri),
          nodeTextColor: get('--mermaid-node-text-color', txtPri),

          // Sequence Diagram
          actorBkg: get('--mermaid-actor-bkg', nodeBkg),
          actorBorder: get('--mermaid-actor-border', h1),
          actorTextColor: get('--mermaid-actor-text-color', txtPri),
          actorLineColor: get('--mermaid-actor-line-color', h1),
          signalColor: get('--mermaid-signal-color', h2),
          signalTextColor: get('--mermaid-signal-text-color', txtPri),
          labelBoxBkgColor: get('--mermaid-label-box-bkg-color', nodeBkg),
          labelBoxBorderColor: get('--mermaid-label-box-border-color', h1),
          labelTextColor: get('--mermaid-label-text-color', txtPri),
          loopTextColor: get('--mermaid-loop-text-color', txtPri),
          activationBorderColor: get('--mermaid-activation-border-color', h2),
          activationBkgColor: get('--mermaid-activation-bkg-color', clusterBkg),
          sequenceNumberColor: get('--mermaid-sequence-number-color', txtPri),

          // Pie Chart
          pie1: get('--mermaid-pie1', h1),
          pie2: get('--mermaid-pie2', h2),
          pie3: get('--mermaid-pie3', h3),
          pie4: get('--mermaid-pie4', txtSec),
          pie5: get('--mermaid-pie5', h1),
          pie6: get('--mermaid-pie6', h2),
          pie7: get('--mermaid-pie7', h3),
          pie8: get('--mermaid-pie8', txtSec),
          pie9: get('--mermaid-pie9', h1),
          pie10: get('--mermaid-pie10', h2),
          pie11: get('--mermaid-pie11', h3),
          pie12: get('--mermaid-pie12', txtSec),
          pieTitleTextSize: '25px',
          pieTitleTextColor: get('--mermaid-pie-title-text-color', txtPri),
          pieSectionTextSize: '17px',
          pieSectionTextColor: get('--mermaid-pie-section-text-color', bgPri),
          pieLegendTextSize: '17px',
          pieLegendTextColor: get('--mermaid-pie-legend-text-color', txtPri),
          pieStrokeColor: get('--mermaid-pie-stroke-color', h1),
          pieStrokeWidth: '2px',
          pieOuterStrokeWidth: '2px',
          pieOuterStrokeColor: get('--mermaid-pie-outer-stroke-color', h1),
          pieOpacity: '0.9',

          // State Diagram
          labelColor: get('--mermaid-label-color', txtPri),
          altBackground: get('--mermaid-alt-background', clusterBkg),

          // Class Diagram
          classText: get('--mermaid-class-text', txtPri),

          // User Journey
          fillType0: get('--mermaid-fill-type0', h1),
          fillType1: get('--mermaid-fill-type1', h2),
          fillType2: get('--mermaid-fill-type2', h3),
          fillType3: get('--mermaid-fill-type3', txtSec),
          fillType4: get('--mermaid-fill-type4', h1),
          fillType5: get('--mermaid-fill-type5', h2),
          fillType6: get('--mermaid-fill-type6', h3),
          fillType7: get('--mermaid-fill-type7', txtSec),

          // Gantt Chart
          sectionBkgColor: get('--mermaid-section-bkg-color', bgSec),
          altSectionBkgColor: get('--mermaid-alt-section-bkg-color', bgTer),
          sectionBkgColor2: get('--mermaid-section-bkg-color2', bgSec),
          taskTextColor: get('--mermaid-task-text-color', txtPri),
          taskTextLightColor: get('--mermaid-task-text-light-color', txtPri),
          taskTextOutsideColor: get('--mermaid-task-text-outside-color', txtPri),
          taskTextClickableColor: get('--mermaid-task-text-clickable-color', h1),
          activeTaskBkgColor: get('--mermaid-active-task-bkg-color', h1),
          activeTaskBorderColor: get('--mermaid-active-task-border-color', h1),
          doneTaskBkgColor: get('--mermaid-done-task-bkg-color', h3),
          doneTaskBorderColor: get('--mermaid-done-task-border-color', h3),
          critBorderColor: get('--mermaid-crit-border-color', h2),
          critBkgColor: get('--mermaid-crit-bkg-color', h2),
          todayLineColor: get('--mermaid-today-line-color', h2),
          gridColor: get('--mermaid-grid-color', bgTer),
          sectionTextColor: get('--mermaid-section-text-color', txtPri),
          taskBorderColor: get('--mermaid-task-border-color', h1),

          // ER Diagram
          attributeBackgroundColorOdd: get('--mermaid-attribute-background-color-odd', bgSec),
          attributeBackgroundColorEven: get('--mermaid-attribute-background-color-even', bgPri),
          relationshipLabelBackground: get('--mermaid-relationship-label-background', bgPri),
          relationshipLabelColor: get('--mermaid-relationship-label-color', txtPri),
          entityBackground: get('--mermaid-entity-background', nodeBkg),
          entityBorderColor: get('--mermaid-entity-border-color', h1),

          // Git Graph
          git0: get('--mermaid-git0', h1),
          git1: get('--mermaid-git1', h2),
          git2: get('--mermaid-git2', h3),
          git3: get('--mermaid-git3', txtSec),
          git4: get('--mermaid-git4', h1),
          git5: get('--mermaid-git5', h2),
          git6: get('--mermaid-git6', h3),
          git7: get('--mermaid-git7', txtSec),
          gitInv0: get('--mermaid-git-inv0', bgPri),
          gitBranchLabel0: get('--mermaid-git-branch-label0', txtPri),
          gitBranchLabel1: get('--mermaid-git-branch-label1', txtPri),
          gitBranchLabel2: get('--mermaid-git-branch-label2', txtPri),
          gitBranchLabel3: get('--mermaid-git-branch-label3', txtPri),
          gitBranchLabel4: get('--mermaid-git-branch-label4', txtPri),
          commitLabelColor: get('--mermaid-commit-label-color', txtPri),
          commitLabelBackground: get('--mermaid-commit-label-background', bgPri),
          tagLabelColor: get('--mermaid-tag-label-color', txtPri),
          tagLabelBackground: get('--mermaid-tag-label-background', nodeBkg),
          tagLabelBorder: get('--mermaid-tag-label-border', h1),
        },
      });

      this.initialized = true;

      // Debug: Log sample of loaded variables
      console.log(`✅ Mermaid initialized`);
      console.log(`  - Background: ${get('--mermaid-background', bgPri)}`);
      console.log(`  - Text: ${get('--mermaid-text-color', txtPri)}`);
      console.log(`  - Line: ${get('--mermaid-line-color', h2)}`);
      console.log(`  - Primary: ${get('--mermaid-primary-color', nodeBkg)}`);
      console.log(`  - Pie1: ${get('--mermaid-pie1', h1)}`);
    } else {
      console.warn('Mermaid library not loaded');
    }
  }

  /**
   * Render a Mermaid diagram
   *
   * @param {string} id - Unique ID for the diagram
   * @param {string} code - Mermaid diagram code
   * @returns {Promise<string>} Rendered SVG string
   * @throws {Error} If rendering fails
   *
   * @example
   * const svg = await service.render('diagram-1', 'graph TD\n A-->B');
   */
  async render(id, code) {
    // Initialize if not already done
    if (!this.initialized) {
      this.initialize();
    }

    // Check if Mermaid is available
    if (typeof mermaid === 'undefined') {
      throw new Error('Mermaid library not loaded');
    }

    try {
      const result = await mermaid.render(id, code);
      return result.svg;
    } catch (error) {
      console.error('Mermaid render error:', error);
      throw new Error(`Mermaid diagram error: ${error.message}`);
    }
  }

  /**
   * Check if service is ready to render
   *
   * @returns {boolean} True if initialized
   */
  isReady() {
    return this.initialized && typeof mermaid !== 'undefined';
  }

  /**
   * Reinitialize with new theme colors
   * Call this when theme changes
   *
   * @returns {void}
   */
  reinitialize() {
    this.initialized = false;
    this.initialize();
  }
}
