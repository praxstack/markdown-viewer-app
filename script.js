// Markdown Viewer Pro - Main Script

// Import constants, utilities, services, and core modules
import DOMPurify from 'dompurify';
import html2pdf from 'html2pdf.js';
import katex from 'katex';
import 'katex/dist/katex.min.css'; // Import KaTeX CSS
import { marked } from 'marked';
import markedFootnote from 'marked-footnote';
import mermaid from 'mermaid';
import Prism from 'prismjs';

// PrismJS is now handled by vite-plugin-prismjs
// which automatically loads all languages and themes

import { StorageManager } from './src/js/core/StorageManager.js';
import { ThemeManager } from './src/js/core/ThemeManager.js';
import { FolderBrowserService } from './src/js/services/FolderBrowserService.js';
import { HTMLService } from './src/js/services/HTMLService.js';
import { LinkNavigationService } from './src/js/services/LinkNavigationService.js';
import { MermaidService } from './src/js/services/MermaidService.js';
import { PDFService } from './src/js/services/PDFService.js';
import { PrismService } from './src/js/services/PrismService.js';

// Make libraries available globally for services if needed (backward compatibility)
window.marked = marked;
window.Prism = Prism;
window.mermaid = mermaid;
window.katex = katex;
window.html2pdf = html2pdf;
window.markedFootnote = markedFootnote;

// ==================== ANCHOR NAVIGATION ====================
// Heading slug tracking (module-level singleton for marked.js singleton)
const headingSlugMap = new Map();

// Pre-compiled slug replacements (zero GC pressure per render)
const SLUG_REPLACEMENTS = [
  [/c\+\+/gi, 'cpp'],
  [/c#/gi, 'csharp'],
  [/f#/gi, 'fsharp'],
  [/\.net/gi, 'dotnet'],
];

/**
 * Reset slug map (call before each parse)
 */
function resetSlugMap() {
  headingSlugMap.clear();
}

/**
 * Generate URL-safe slug from heading text
 * @param {string} text - Raw heading text (may include HTML)
 * @param {Map<string, number>} seen - Duplicate tracking map
 * @returns {string} URL-safe slug
 */
function generateSlug(text, seen = headingSlugMap) {
  // Strip HTML tags
  let slug = text.replace(/<[^>]*>/g, '');

  // Normalize Unicode
  slug = slug.normalize('NFC').toLowerCase();

  // Replace programming terms (pre-compiled patterns)
  for (const [pattern, replacement] of SLUG_REPLACEMENTS) {
    slug = slug.replace(pattern, replacement);
  }

  // Clean up: remove non-word chars, spaces to hyphens, collapse hyphens
  slug = slug
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Fallback for empty result
  if (!slug) {
    slug = 'section';
  }

  // Handle duplicates (header, header-1, header-2)
  const baseSlug = slug;
  const count = seen.get(baseSlug) || 0;
  if (count > 0) {
    slug = `${baseSlug}-${count}`;
  }
  seen.set(baseSlug, count + 1);

  return slug;
}

/**
 * Anchor Navigation Module
 * Handles in-document anchor navigation with scoped selection
 */
const AnchorNavigation = {
  container: null,
  pendingScroll: null,

  /**
   * Initialize anchor navigation
   * @param {HTMLElement} previewContainer - Scrollable preview container
   */
  init(previewContainer) {
    this.container = previewContainer;

    // Event delegation for anchor clicks
    this.container.addEventListener('click', this.handleClick.bind(this));

    // Browser back/forward navigation
    window.addEventListener('hashchange', this.handleHashChange.bind(this));

    // Initial page load with hash
    if (window.location.hash) {
      requestAnimationFrame(() => {
        this.scrollToHash(window.location.hash.slice(1), false);
      });
    }

    console.log('✅ Anchor navigation initialized');
  },

  /**
   * Handle click events (delegated)
   */
  handleClick(event) {
    const link = event.target.closest('a[href^="#"]');
    if (!link) {
      return;
    }

    // Ignore external links
    if (link.hostname && link.hostname !== window.location.hostname) {
      return;
    }

    event.preventDefault();

    const hash = link.getAttribute('href').slice(1);
    this.scrollToHash(hash, true);

    // Update URL without triggering hashchange
    history.pushState(null, '', `#${hash}`);
  },

  /**
   * Handle hashchange (browser back/forward)
   */
  handleHashChange() {
    const hash = window.location.hash.slice(1);
    if (hash) {
      this.scrollToHash(hash, true);
    } else {
      this.scrollToTop(true);
    }
  },

  /**
   * Scroll to element by hash
   * @param {string} hash - URL hash (without #)
   * @param {boolean} smooth - Use smooth scrolling
   */
  scrollToHash(hash, smooth = true) {
    // Cancel pending scroll (handle concurrent clicks)
    if (this.pendingScroll) {
      clearTimeout(this.pendingScroll);
      this.pendingScroll = null;
    }

    if (!hash) {
      this.scrollToTop(smooth);
      return;
    }

    const target = this.resolveTarget(hash);
    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: smooth ? 'smooth' : 'instant',
      block: 'start',
    });

    this.manageFocus(target, smooth);
  },

  /**
   * Scroll to top of container
   */
  scrollToTop(smooth = true) {
    this.container.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'instant',
    });
  },

  /**
   * Resolve target element - SCOPED to container (prevents app shell collision)
   * @param {string} hash - URL hash
   * @returns {Element|null} Target element or null
   */
  resolveTarget(hash) {
    if (!hash) {
      return null;
    }

    // Decode URI components safely
    let decodedHash;
    try {
      decodedHash = decodeURIComponent(hash);
    } catch {
      decodedHash = hash;
    }

    // Priority 1: Exact ID (SCOPED to container)
    let target = this.container.querySelector(`#${CSS.escape(decodedHash)}`);
    if (target) {
      return target;
    }

    // Priority 2: Normalized ID with our custom replacements (C++ → cpp)
    const normalized = this.normalizeHash(decodedHash);
    target = this.container.querySelector(`#${CSS.escape(normalized)}`);
    if (target) {
      return target;
    }

    // Priority 3: GitHub-style normalization (C++ → c, keeps double hyphens)
    const githubStyle = this.normalizeHashGitHub(decodedHash);
    target = this.container.querySelector(`#${CSS.escape(githubStyle)}`);
    if (target) {
      return target;
    }

    // Priority 4: Try all headings for fuzzy match (last resort)
    const fuzzyTarget = this.fuzzyMatchHeading(decodedHash);
    if (fuzzyTarget) {
      return fuzzyTarget;
    }

    console.warn(`[AnchorNav] Target not found: "${hash}"`);
    return null;
  },

  /**
   * Normalize hash with our custom replacements (C++ → cpp)
   * @param {string} hash - Raw hash string
   * @returns {string} Normalized hash
   */
  normalizeHash(hash) {
    let slug = hash.normalize('NFC').toLowerCase();

    // Apply our custom transformations (C++ → cpp, etc.)
    for (const [pattern, replacement] of SLUG_REPLACEMENTS) {
      slug = slug.replace(pattern, replacement);
    }

    return (
      slug
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '') || 'section'
    );
  },

  /**
   * GitHub-style normalization (more lenient, keeps structure)
   * @param {string} hash - Raw hash string
   * @returns {string} GitHub-style normalized hash
   */
  normalizeHashGitHub(hash) {
    // GitHub algorithm: lowercase, remove non-alphanumeric except hyphens
    // Does NOT collapse multiple hyphens, does NOT replace C++ with cpp
    return (
      hash
        .normalize('NFC')
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/^-+|-+$/g, '') || 'section'
    );
  },

  /**
   * Fuzzy match heading by text content similarity
   * @param {string} hash - Hash to find
   * @returns {Element|null} Matching heading or null
   */
  fuzzyMatchHeading(hash) {
    const headings = this.container.querySelectorAll(
      'h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]',
    );
    const normalizedSearch = hash.toLowerCase().replace(/[^\w]/g, '');

    for (const heading of headings) {
      const headingId = heading.id.toLowerCase().replace(/[^\w]/g, '');
      // Check if the search term is contained in the ID or vice versa
      if (headingId.includes(normalizedSearch) || normalizedSearch.includes(headingId)) {
        console.log(`[AnchorNav] Fuzzy matched "${hash}" → "${heading.id}"`);
        return heading;
      }
    }
    return null;
  },

  /**
   * Manage focus after scroll (accessibility)
   * @param {Element} target - Target element
   * @param {boolean} smooth - Was smooth scroll used
   */
  manageFocus(target, smooth) {
    const focusTarget = () => {
      // Make heading focusable if not already
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }
      target.focus({ preventScroll: true });
    };

    if (!smooth) {
      focusTarget();
      return;
    }

    // Modern browsers: use scrollend event
    if ('onscrollend' in this.container) {
      this.container.addEventListener('scrollend', focusTarget, { once: true });
    } else {
      // Fallback: estimate scroll duration (max 1000ms for safety)
      const distance = Math.abs(target.getBoundingClientRect().top);
      const duration = Math.min(Math.max(distance / 2, 300), 1000);
      this.pendingScroll = setTimeout(focusTarget, duration + 50);
    }
  },
};

// Initialize services and managers
const storageManager = new StorageManager();
const themeManager = new ThemeManager(storageManager);
const mermaidService = new MermaidService();
const prismService = new PrismService();
const pdfService = new PDFService();
const htmlService = new HTMLService();
const folderBrowserService = new FolderBrowserService(storageManager);

// Link navigation service (callback will be wired in setupEditor)
let linkNavigationService = null;

// Folder browser state (these are managed within setupEditor scope)
const _currentFolderFiles = [];
const _currentFileHandle = null;

// Global render function reference (will be set in setupEditor)
let globalRenderMarkdown = null;

// Configure theme change listener to update Mermaid and force re-render
themeManager.setThemeChangeListener(() => {
  mermaidService.reinitialize();

  // Force re-render of markdown to apply new Mermaid colors
  // No timeout needed - waiting for next microtask is sufficient
  if (globalRenderMarkdown) {
    console.log('🔄 Re-rendering diagrams with new theme colors');
    globalRenderMarkdown();
  }
});

// Wait for DOM to be ready
window.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

function initializeApp() {
  console.log('🚀 Initializing Enterprise Markdown Viewer...');

  // Configure marked.js extensions
  configureMarkedExtensions();

  // Setup the editor
  setupEditor();

  // Initialize support widget (donation button in footer)
  initSupportWidget();

  // Initialize support modal (one-time popup)
  initSupportModal();
}

// ==================== SUPPORT MODAL (ONE-TIME POPUP) ====================
const SUPPORT_MODAL_SHOWN_KEY = 'support_modal_shown';
const SUPPORT_MODAL_DELAY_MS = 5000; // 5 seconds

/**
 * Initialize support modal - shows once after 5 seconds
 */
function initSupportModal() {
  const modal = document.getElementById('support-modal');
  const closeBtn = document.getElementById('close-support-modal');
  const dontShowAgainCheckbox = document.getElementById('support-dont-show-again');

  if (!modal || !closeBtn) {
    console.warn('[SupportModal] Modal elements not found');
    return;
  }

  // Check if already shown before
  const alreadyShown = localStorage.getItem(SUPPORT_MODAL_SHOWN_KEY);
  if (alreadyShown === 'true') {
    console.log('[SupportModal] Already shown before, skipping');
    return;
  }

  // Show modal after delay
  setTimeout(() => {
    modal.classList.add('active');
    console.log('[SupportModal] Showing support modal');
  }, SUPPORT_MODAL_DELAY_MS);

  // Close button handler
  closeBtn.addEventListener('click', () => {
    closeSupportModal(modal, dontShowAgainCheckbox);
  });

  // Click outside to close
  modal.addEventListener('click', e => {
    if (e.target === modal) {
      closeSupportModal(modal, dontShowAgainCheckbox);
    }
  });

  // Escape key to close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeSupportModal(modal, dontShowAgainCheckbox);
    }
  });

  // Track clicks on support options
  modal.querySelectorAll('.support-option').forEach(option => {
    option.addEventListener('click', () => {
      // Mark as shown when user clicks a support option
      localStorage.setItem(SUPPORT_MODAL_SHOWN_KEY, 'true');
      console.log('[SupportModal] User clicked support option, marking as shown');
    });
  });
}

/**
 * Close the support modal
 */
function closeSupportModal(modal, checkbox) {
  modal.classList.remove('active');

  // If "Don't show again" is checked, remember it
  if (checkbox && checkbox.checked) {
    localStorage.setItem(SUPPORT_MODAL_SHOWN_KEY, 'true');
    console.log('[SupportModal] User opted out of future modals');
  }
}

// ==================== SUPPORT WIDGET (DONATION ROUTER) ====================
/**
 * Enterprise-grade geo-based donation routing
 * - 300ms timeout with fail-safe to global
 * - Session caching to avoid repeated API calls
 * - CLS mitigation via skeleton loader
 */
const SUPPORT_TIMEOUT_MS = 300;
const SUPPORT_FALLBACK_REGION = 'global';
const SUPPORT_CACHE_KEY = 'support_user_region';

/**
 * Detect user region with fail-safe pattern
 * @returns {Promise<string>} 'india' or 'global'
 */
async function detectSupportRegion() {
  // 1. Check session cache first (FR-1.4)
  const cached = sessionStorage.getItem(SUPPORT_CACHE_KEY);
  if (cached) {
    console.log(`[SupportWidget] Using cached region: ${cached}`);
    return cached;
  }

  try {
    // 2. Race: Network vs Timeout (300ms)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SUPPORT_TIMEOUT_MS);

    const response = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json();
    const region = data.country_code === 'IN' ? 'india' : 'global';

    // 3. Cache result for session
    sessionStorage.setItem(SUPPORT_CACHE_KEY, region);
    console.log(`[SupportWidget] Detected region: ${region} (${data.country_code})`);
    return region;
  } catch (error) {
    // 4. Fail open - silent fail to global
    console.warn(
      '[SupportWidget] Geo-lookup failed/timed-out, defaulting to Global.',
      error.message,
    );
    return SUPPORT_FALLBACK_REGION;
  }
}

/**
 * Toggle between India and Global support options
 */
function toggleSupportRegion() {
  const currentRegion = sessionStorage.getItem(SUPPORT_CACHE_KEY) || SUPPORT_FALLBACK_REGION;
  const newRegion = currentRegion === 'india' ? 'global' : 'india';
  sessionStorage.setItem(SUPPORT_CACHE_KEY, newRegion);
  renderSupportWidget(newRegion);
  console.log(`[SupportWidget] Toggled region: ${currentRegion} → ${newRegion}`);
}

// Make toggle function globally accessible for onclick
window.toggleSupportRegion = toggleSupportRegion;

/**
 * Render support widget based on region
 * @param {string} region - 'india' or 'global'
 */
function renderSupportWidget(region) {
  const container = document.getElementById('support-widget');
  if (!container) {
    return;
  }

  const config =
    region === 'india'
      ? {
          text: '🇮🇳 Support via UPI',
          url: 'https://razorpay.me/@prakharshekharparthasarthi?notes[source]=webapp_footer',
          className: 'support-button--india',
          toggleText: 'Not in India?',
        }
      : {
          text: '☕ Support via Ko-fi',
          url: 'https://ko-fi.com/praxlannister?ref=webapp_footer',
          className: 'support-button--global',
          toggleText: 'In India? Use UPI',
        };

  container.innerHTML = `
    <a href="${config.url}" target="_blank" rel="noopener noreferrer" class="support-button ${config.className}">
      ${config.text}
    </a>
    <button class="support-toggle" onclick="toggleSupportRegion()">${config.toggleText}</button>
  `;
}

/**
 * Initialize support widget with skeleton loader and geo detection
 */
async function initSupportWidget() {
  const container = document.getElementById('support-widget');
  if (!container) {
    console.warn('[SupportWidget] Container not found, skipping initialization');
    return;
  }

  console.log('[SupportWidget] Initializing...');

  // Skeleton is already in HTML (CLS mitigation)
  // Now detect region and hydrate
  const region = await detectSupportRegion();
  renderSupportWidget(region);

  console.log(`[SupportWidget] ✅ Initialized with region: ${region}`);
}

/**
 * Debounce utility function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function truncated(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

// Configure marked.js extensions (math + footnotes + admonitions)
function configureMarkedExtensions() {
  // Enable footnote support
  marked.use(markedFootnote());
  console.log('✅ Footnotes enabled');

  // Add GitHub-style admonitions
  marked.use({
    extensions: [
      {
        name: 'admonition',
        level: 'block',
        start(src) {
          return src.match(/^> \[!/i)?.index;
        },
        tokenizer(src) {
          // Updated regex to catch the case where title and text are ALL ON ONE LINE (with no line breaks except the end of the line)
          // Match `> [!tip] Title and potentially text here\n> More text`
          const rule =
            /^> \[!(note|tip|important|warning|caution)\][ \t]*(.*)\n?((?:> .*(?:\n|$))*)/i;
          const match = src.match(rule);

          if (match) {
            const raw = match[0];
            const type = match[1].toUpperCase();
            const titleContent = match[2].trim();
            let parsedTitle = type;
            const content = match[3] ? match[3].replace(/^> ?/gm, '').trim() : '';

            if (titleContent) {
              parsedTitle = titleContent;
            }

            return {
              type: 'admonition',
              raw,
              admonitionType: type,
              title: parsedTitle,
              text: content,
            };
          }
        },
        renderer(token) {
          const typeClass = token.admonitionType.toLowerCase();

          const icons = {
            NOTE: `<svg class="octicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>`,
            TIP: `<svg class="octicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.537.896.621 1.49a.75.75 0 0 1-1.484.211c-.04-.282-.163-.547-.37-.847a8.456 8.456 0 0 0-.542-.68c-.084-.1-.173-.205-.268-.32C3.201 7.75 2.5 6.766 2.5 5.25 2.5 2.31 4.863 0 8 0s5.5 2.31 5.5 5.25c0 1.516-.701 2.5-1.328 3.259-.095.115-.184.22-.268.319-.207.245-.383.453-.541.681-.208.3-.33.565-.37.847a.751.751 0 0 1-1.485-.212c.084-.593.337-1.078.621-1.489.203-.292.45-.584.673-.848.075-.088.147-.173.213-.253.561-.679.985-1.32.985-2.304 0-2.06-1.637-3.75-4-3.75ZM5.75 12h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5ZM6 15.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z"></path></svg>`,
            IMPORTANT: `<svg class="octicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v9.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-9.5a.25.25 0 0 0-.25-.25Zm7 2.25v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path></svg>`,
            WARNING: `<svg class="octicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.397A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.556Zm1.763 1.256a.25.25 0 0 0-.44 0L1.698 13.69a.25.25 0 0 0 .22.36h12.164a.25.25 0 0 0 .22-.36Zm.905 3.947a.75.75 0 0 1-1.5 0v3.5a.75.75 0 0 1 1.5 0ZM8 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>`,
            CAUTION: `<svg class="octicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path fill-rule="evenodd" d="M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>`,
          };

          const icon = icons[token.admonitionType] || icons.NOTE;

          // Parse the title inline
          const parsedTitle = marked.parseInline(token.title);

          let contentHtml = '';
          if (token.text && token.text.trim().length > 0) {
            contentHtml = `<div class="admonition-content">${marked.parse(token.text)}</div>`;
          }

          return `<div class="admonition admonition-${typeClass}">
            <div class="admonition-title">
              <span class="admonition-icon">${icon}</span>
              <span class="admonition-title-text">${parsedTitle}</span>
            </div>${contentHtml ? `\n            ${ contentHtml}` : ''}
          </div>\n`;
        },
      },
    ],
  });
  console.log('✅ GitHub admonitions enabled');

  // Configure math formulas (KaTeX is now imported at top level)

  // Add inline math and text formatting extensions only
  // LaTeX environments (align, gather, etc.) are not supported by KaTeX
  marked.use({
    extensions: [
      {
        name: 'mathBlock',
        level: 'block',
        start(src) {
          return src.match(/^\$\$|\\\[/)?.index;
        },
        tokenizer(src) {
          const doubleDollar = src.match(/^\$\$([\s\S]+?)\$\$/);
          if (doubleDollar) {
            return {
              type: 'mathBlock',
              raw: doubleDollar[0],
              text: doubleDollar[1].trim(),
            };
          }

          const bracket = src.match(/^\\\[([\s\S]+?)\\\]/);
          if (bracket) {
            return {
              type: 'mathBlock',
              raw: bracket[0],
              text: bracket[1].trim(),
            };
          }
        },
        renderer(token) {
          try {
            return `<div style="margin: 1.5em 0;">${katex.renderToString(token.text, {
              displayMode: true,
              throwOnError: false,
              output: 'html',
              trust: true, // Allow custom styling
              macros: {
                '\\label': '\\phantom', // Hide \label
              },
            })}</div>`;
          } catch (e) {
            console.warn('KaTeX display math error:', e);
            return `<div style="color: red; padding: 10px;">Math Error: ${e.message}</div>`;
          }
        },
      },
      {
        name: 'mathEnvironment',
        level: 'block',
        start(src) {
          // Allow whitespace before \begin
          return src.match(/^\s*\\begin/)?.index;
        },
        tokenizer(src) {
          // Robust regex for LaTeX environments (tolerant to whitespace)
          // Capture group 1: Full content, Group 2: Env Name, Group 3: Inner Content
          const match = src.match(/^\s*(\\begin\s*\{([a-zA-Z]+\*?)\}([\s\S]*?)\\end\s*\{\2\})/);
          if (match) {
            let text = match[1];
            const env = match[2];
            // Shim 'multline' (not supported by KaTeX core) to 'gathered'
            if (env === 'multline' || env === 'multline*') {
              console.warn('Shimming multline to gathered for KaTeX compatibility');
              text = `\\begin{gathered}${match[3]}\\end{gathered}`;
            }

            return {
              type: 'mathEnvironment',
              raw: match[0],
              text,
            };
          }
        },
        renderer(token) {
          try {
            return `<div style="margin: 1.5em 0;">${katex.renderToString(token.text, {
              displayMode: true,
              throwOnError: false,
              output: 'html',
              trust: true,
              macros: {
                '\\label': '\\phantom', // Hide \label
                '\\eqref': '\\text', // Plain text for refs (or link if needed)
                '\\cite': '\\text',
                '\\ref': '\\text',
              },
            })}</div>`;
          } catch (e) {
            console.warn('KaTeX environment error:', e);
            return `<div style="color: red;">LaTeX Error: ${e.message}</div>`;
          }
        },
      },
      {
        name: 'mathInline',
        level: 'inline',
        start(src) {
          return src.match(/\$|\\\(/)?.index;
        },
        tokenizer(src) {
          // Try display math first ($$...$$)
          const displayMatch = src.match(/^\$\$([\s\S]+?)\$\$/);
          if (displayMatch) {
            return {
              type: 'mathInline',
              raw: displayMatch[0],
              text: displayMatch[1].trim(),
              displayMode: true,
            };
          }

          // Try LaTeX display math (\[...\]) - should be handled by block, but just in case
          const bracketMatch = src.match(/^\\\[([\s\S]+?)\\\]/);
          if (bracketMatch) {
            return {
              type: 'mathInline',
              raw: bracketMatch[0],
              text: bracketMatch[1].trim(),
              displayMode: true,
            };
          }

          // Try LaTeX inline math (\(...\))
          const parenMatch = src.match(/^\\\(([\s\S]+?)\\\)/);
          if (parenMatch) {
            return {
              type: 'mathInline',
              raw: parenMatch[0],
              text: parenMatch[1].trim(),
              displayMode: false,
            };
          }

          // Then try inline math ($...$)
          const inlineMatch = src.match(/^\$([^$\n]+?)\$/);
          if (inlineMatch) {
            return {
              type: 'mathInline',
              raw: inlineMatch[0],
              text: inlineMatch[1].trim(),
              displayMode: false,
            };
          }
        },
        renderer(token) {
          try {
            const rendered = katex.renderToString(token.text, {
              displayMode: token.displayMode || false,
              throwOnError: false,
              output: 'html',
              macros: {
                '\\label': '\\phantom',
              },
            });

            // Wrap display math in a div for proper spacing
            if (token.displayMode) {
              return `<div style="margin: 1.5em 0;">${rendered}</div>`;
            }
            return rendered;
          } catch (e) {
            console.warn('KaTeX math error:', e);
            return `<span style="color: red;">Math Error</span>`;
          }
        },
      },
      {
        name: 'subscript',
        level: 'inline',
        start(src) {
          return src.match(/~/)?.index;
        },
        tokenizer(src) {
          const match = src.match(/^~([^~\s]+)~/);
          if (match) {
            return {
              type: 'subscript',
              raw: match[0],
              text: match[1],
            };
          }
        },
        renderer(token) {
          return `<sub>${token.text}</sub>`;
        },
      },
      {
        name: 'superscript',
        level: 'inline',
        start(src) {
          return src.match(/\^/)?.index;
        },
        tokenizer(src) {
          const match = src.match(/^\^([^^\s]+)\^/);
          if (match) {
            return {
              type: 'superscript',
              raw: match[0],
              text: match[1],
            };
          }
        },
        renderer(token) {
          return `<sup>${token.text}</sup>`;
        },
      },
    ],
  });

  console.log('✅ Marked.js configured with all extensions (LaTeX, subscript, superscript)');

  // Custom heading renderer with ID generation for anchor navigation
  marked.use({
    renderer: {
      heading(token) {
        const text = this.parser.parseInline(token.tokens);
        const level = token.depth;
        const slug = generateSlug(text, headingSlugMap);
        return `<h${level} id="${slug}">${text}</h${level}>\n`;
      },
      link(token) {
        // Extract properties from token object (marked.js v12+ API)
        const href = token.href;
        const title = token.title;

        // CRITICAL: Parse nested tokens (e.g., images inside links)
        // This handles [![img](url)](link) syntax correctly
        const text = token.tokens ? this.parser.parseInline(token.tokens) : token.text;

        // Defensive: only catch truly broken cases (null/undefined)
        if (href === null || href === undefined) {
          return `<a>${text}</a>`;
        }

        // Anchor links - unchanged
        if (href.startsWith('#')) {
          return `<a href="${href}" title="${title || ''}">${text}</a>`;
        }

        // External links - open in new tab
        if (/^https?:\/\//.test(href) || /^\/\//.test(href)) {
          return `<a href="${href}" target="_blank" rel="noopener noreferrer" title="${title || ''}">${text}</a>`;
        }

        // Relative markdown file links - add class and data attribute for router
        if (href.endsWith('.md')) {
          return `<a href="${href}" class="md-link" data-md-path="${href}" title="${title || ''}">${text}</a>`;
        }

        // Default - regular link
        return `<a href="${href}" title="${title || ''}">${text}</a>`;
      },
    },
  });
  console.log('✅ Custom heading renderer enabled (anchor navigation IDs)');
  console.log('✅ Custom link renderer enabled (markdown file navigation)');
}

// Initialize Mermaid using MermaidService (prefixed to indicate future use)
async function _initMermaidTheme() {
  await mermaidService.initialize();
}

function setupEditor() {
  // Default markdown content
  const defaultMarkdown = `# Welcome to Markdown Viewer Pro! 🚀

This is a powerful markdown viewer with **syntax highlighting**, *italic text*, and much more!

## Features

- ✅ Real-time preview
- ✅ Syntax highlighting for 20+ languages
- ✅ Mermaid diagram support
- ✅ 10 built-in themes (5 themes × 2 variants each)
- ✅ Custom color customization
- ✅ Export to HTML

## Code Examples

### Java
\`\`\`java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
\`\`\`

### C++
\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
\`\`\`

### Python
\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
\`\`\`

## Mermaid Diagram Example

\`\`\`mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> A
    C --> E[End]
\`\`\`

## Tables

| Language | Type | Year |
|----------|------|------|
| JavaScript | Dynamic | 1995 |
| Python | Dynamic | 1991 |
| Java | Static | 1995 |
| Rust | Static | 2010 |

## Quotes

> "The best way to predict the future is to invent it." - Alan Kay

## Lists

### Ordered List
1. First item
2. Second item
3. Third item

### Unordered List
- Bullet point one
- Bullet point two
- Bullet point three

---

**Try switching themes** from the dropdown menu! 🎨
`;

  // DOM Elements
  const editor = document.getElementById('markdown-editor');
  const preview = document.getElementById('markdown-preview');
  const themeSelector = document.getElementById('theme-selector');
  const customizeBtn = document.getElementById('customize-btn');
  const exportHtmlBtn = document.getElementById('export-html-btn');
  const exportPdfBtn = document.getElementById('export-pdf-btn');
  const modal = document.getElementById('customizer-modal');
  const closeModal = document.getElementById('close-modal');
  const resetBtn = document.getElementById('reset-btn');
  const saveThemeBtn = document.getElementById('save-theme-btn');
  const _themeStylesheet = document.getElementById('theme-stylesheet');

  // View mode buttons
  const editorOnlyBtn = document.getElementById('editor-only-btn');
  const splitViewBtn = document.getElementById('split-view-btn');
  const previewOnlyBtn = document.getElementById('preview-only-btn');
  const syncScrollBtn = document.getElementById('sync-scroll-btn');
  const editorContainer = document.querySelector('.editor-container');
  const previewContainer = document.querySelector('.preview-container');

  // Sync scroll state (unused placeholders for future features)
  const _isSyncScrollEnabled = false;
  const _isScrolling = false;

  // Zoom controls
  const zoomInBtn = document.getElementById('zoom-in-btn');
  const zoomOutBtn = document.getElementById('zoom-out-btn');
  const zoomResetBtn = document.getElementById('zoom-reset-btn');
  const zoomLevelDisplay = document.getElementById('zoom-level');
  let currentZoom = 100; // Default zoom level

  // Set default content using StorageManager
  const savedContent = storageManager.get('markdownContent');
  editor.value = savedContent || defaultMarkdown;

  // Helper function to decode HTML entities
  function decodeHtmlEntities(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  }

  // Keep only subscript and superscript extensions
  // Remove LaTeX environment extensions that don't work with KaTeX
  marked.use({
    extensions: [
      {
        name: 'subscript',
        level: 'inline',
        start(src) {
          return src.match(/~/)?.index;
        },
        tokenizer(src) {
          const match = src.match(/^~([^~\s]+)~/);
          if (match) {
            return {
              type: 'subscript',
              raw: match[0],
              text: match[1],
            };
          }
        },
        renderer(token) {
          return `<sub>${token.text}</sub>`;
        },
      },
      {
        name: 'superscript',
        level: 'inline',
        start(src) {
          return src.match(/\^/)?.index;
        },
        tokenizer(src) {
          const match = src.match(/^\^([^^\s]+)\^/);
          if (match) {
            return {
              type: 'superscript',
              raw: match[0],
              text: match[1],
            };
          }
        },
        renderer(token) {
          return `<sup>${token.text}</sup>`;
        },
      },
    ],
  });

  console.log('✅ Subscript and superscript enabled (LaTeX environments display as-is)');

  // Render markdown (expose globally for theme changes)
  function renderMarkdown() {
    try {
      // Reset slug map before parsing (singleton-safe pattern)
      resetSlugMap();

      const markdownText = editor.value;

      // Parse markdown with all extensions
      let html = marked.parse(markdownText);

      // Replace mermaid code blocks with placeholders
      // Use 'mermaid-diagram' class to avoid auto-rendering conflicts
      html = html.replace(
        /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
        (match, code) => {
          // Decode HTML entities before passing to Mermaid
          const decodedCode = decodeHtmlEntities(code);
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          // Return placeholder div
          return `<div class="mermaid-diagram" id="${id}" data-code="${encodeURIComponent(decodedCode)}">${code}</div>`;
        },
      );

      // Sanitize HTML using DOMPurify
      const cleanHtml = DOMPurify.sanitize(html, {
        ADD_TAGS: ['iframe', 'img'], // Allow iframe and img tags
        ADD_ATTR: [
          'allow',
          'allowfullscreen',
          'frameborder',
          'scrolling',
          'target',
          'data-code', // Mermaid diagrams
          'src',
          'alt',
          'title',
          'width',
          'height',
          'loading', // Image attributes
        ],
        USE_PROFILES: { html: true, svg: true, mathml: true },
      });

      preview.innerHTML = cleanHtml;

      // Render Mermaid diagrams synchronously after DOM update
      const mermaidElements = preview.querySelectorAll('.mermaid-diagram');
      mermaidElements.forEach(element => {
        const id = element.id;
        const code = decodeURIComponent(element.dataset.code);

        if (!code || !code.trim()) {
          element.innerHTML = '';
          return;
        }

        if (typeof mermaid !== 'undefined') {
          mermaid
            .render(`mermaid-svg-${id}`, code)
            .then(result => {
              element.innerHTML = result.svg;
            })
            .catch(err => {
              console.warn('Mermaid error:', err);
              // Graceful failure: small warning instead of giant red text
              element.innerHTML = `<div style="color: var(--text-secondary); font-size: 0.8em; text-align: center; border: 1px dashed var(--border-color); padding: 8px; border-radius: 6px; opacity: 0.8; margin: 10px 0;">
                <span style="font-size: 1.2em;">⚠️</span> Invalid Mermaid Syntax
              </div>`;
            });
        }
      });

      // Apply Prism syntax highlighting using PrismService
      prismService.highlightAll(preview);

      // NOTE: KaTeX auto-render is DISABLED
      // We handle all math via marked.js extensions ($...$ and $$...$$)
      // KaTeX auto-render was causing issues with unsupported LaTeX environments

      // Save content using StorageManager
      storageManager.set('markdownContent', markdownText);
    } catch (error) {
      console.error('Render error:', error);
      preview.innerHTML = `<p style="color: red;">Error rendering markdown: ${error.message}</p>`;
    }
  }

  // Change theme using ThemeManager
  async function changeTheme(themeName) {
    await themeManager.loadTheme(themeName);
    // ThemeManager listener (above) will handle the re-render automatically
  }

  // Initialize color inputs
  function initColorInputs() {
    document.querySelectorAll('.color-control input[type="color"]').forEach(input => {
      const varName = input.dataset.var;
      const textInput = document.getElementById(`${input.id}-text`);
      const currentValue = getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim();

      input.value = currentValue;
      textInput.value = currentValue;

      input.addEventListener('input', e => {
        const color = e.target.value;
        document.documentElement.style.setProperty(varName, color);
        textInput.value = color;
      });
    });
  }

  // Export to HTML
  async function exportHTML() {
    const originalText = exportHtmlBtn.textContent;
    exportHtmlBtn.textContent = '⏳ Exporting...';
    exportHtmlBtn.disabled = true;

    try {
      const themeName = themeSelector.value;
      const customTheme = themeName === 'custom' ? storageManager.getJSON('customTheme') : null;

      const blob = await htmlService.generateHTML(preview.innerHTML, themeName, customTheme);
      htmlService.downloadHTML(blob, 'markdown-export.html');

      console.log('✅ HTML Export successful');
    } catch (error) {
      console.error('HTML Export failed:', error);
      alert(`Failed to export HTML: ${error.message}`);
    } finally {
      exportHtmlBtn.textContent = originalText;
      exportHtmlBtn.disabled = false;
    }
  }

  // Event Listeners
  const debouncedRender = debounce(renderMarkdown, 300);
  editor.addEventListener('input', debouncedRender);

  themeSelector.addEventListener('change', async e => {
    await changeTheme(e.target.value);
  });

  customizeBtn.addEventListener('click', () => {
    modal.classList.add('active');
    initColorInputs();
  });

  closeModal.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', e => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  resetBtn.addEventListener('click', async () => {
    const currentTheme = themeSelector.value === 'custom' ? 'default-light' : themeSelector.value;
    await changeTheme(currentTheme);
    initColorInputs();
  });

  saveThemeBtn.addEventListener('click', async () => {
    const customTheme = {};
    document.querySelectorAll('.color-control input[type="color"]').forEach(input => {
      const varName = input.dataset.var;
      customTheme[varName] = input.value;
    });

    // Save and load custom theme using ThemeManager
    themeManager.saveCustomTheme(customTheme);
    await themeManager.loadTheme('custom');
    themeSelector.value = 'custom';

    alert('Custom theme saved and applied!');
    modal.classList.remove('active');
  });

  // PDF Modal and Controls
  const pdfModal = document.getElementById('pdf-modal');
  const closePdfModal = document.getElementById('close-pdf-modal');
  const pdfPreviewFrame = document.getElementById('pdf-preview-frame');
  const pdfPageSize = document.getElementById('pdf-page-size');
  const pdfOrientation = document.getElementById('pdf-orientation');
  const pdfMarginTop = document.getElementById('pdf-margin-top');
  const pdfMarginRight = document.getElementById('pdf-margin-right');
  const pdfMarginBottom = document.getElementById('pdf-margin-bottom');
  const pdfMarginLeft = document.getElementById('pdf-margin-left');
  const pdfFontDecrease = document.getElementById('pdf-font-decrease');
  const pdfFontIncrease = document.getElementById('pdf-font-increase');
  const pdfFontSizeDisplay = document.getElementById('pdf-font-size-display');
  const pdfPreviewBtn = document.getElementById('pdf-preview-btn');
  const pdfDownloadBtn = document.getElementById('pdf-download-btn');

  let currentFontSize = 12;

  // Open PDF modal
  function openPDFModal() {
    if (!pdfService.isReady()) {
      alert('PDF library is still loading. Please try again in a moment.');
      return;
    }
    pdfModal.classList.add('active');
    updatePDFPreview();
  }

  // Close PDF modal
  closePdfModal.addEventListener('click', () => {
    pdfModal.classList.remove('active');
    // Clean up iframe
    pdfPreviewFrame.src = '';
  });

  pdfModal.addEventListener('click', e => {
    if (e.target === pdfModal) {
      pdfModal.classList.remove('active');
      pdfPreviewFrame.src = '';
    }
  });

  // Get current PDF configuration from UI
  function getPDFConfig() {
    return {
      pageSize: pdfPageSize.value,
      orientation: pdfOrientation.value,
      margins: [
        parseFloat(pdfMarginTop.value),
        parseFloat(pdfMarginRight.value),
        parseFloat(pdfMarginBottom.value),
        parseFloat(pdfMarginLeft.value),
      ],
      fontSize: currentFontSize,
    };
  }

  // Update PDF preview
  async function updatePDFPreview() {
    try {
      pdfPreviewBtn.textContent = '⏳ Generating Preview...';
      pdfPreviewBtn.disabled = true;

      const config = getPDFConfig();
      const previewUrl = await pdfService.previewPDF(preview, config);
      pdfPreviewFrame.src = previewUrl;

      pdfPreviewBtn.textContent = '👁️ Update Preview';
      pdfPreviewBtn.disabled = false;
    } catch (error) {
      console.error('PDF preview error:', error);
      alert(`Error generating preview: ${error.message}`);
      pdfPreviewBtn.textContent = '👁️ Update Preview';
      pdfPreviewBtn.disabled = false;
    }
  }

  // Download PDF
  async function downloadPDF() {
    try {
      pdfDownloadBtn.textContent = '⏳ Downloading...';
      pdfDownloadBtn.disabled = true;

      const success = pdfService.downloadPDF();
      if (success) {
        setTimeout(() => {
          pdfModal.classList.remove('active');
          pdfPreviewFrame.src = '';
        }, 500);
      }

      pdfDownloadBtn.textContent = '💾 Download PDF';
      pdfDownloadBtn.disabled = false;
    } catch (error) {
      console.error('PDF download error:', error);
      alert(`Error downloading PDF: ${error.message}`);
      pdfDownloadBtn.textContent = '💾 Download PDF';
      pdfDownloadBtn.disabled = false;
    }
  }

  // Font size controls with auto-update
  pdfFontDecrease.addEventListener('click', () => {
    if (currentFontSize > 8) {
      currentFontSize -= 1;
      pdfFontSizeDisplay.textContent = `${currentFontSize}pt`;
      updatePDFPreview();
    }
  });

  pdfFontIncrease.addEventListener('click', () => {
    if (currentFontSize < 24) {
      currentFontSize += 1;
      pdfFontSizeDisplay.textContent = `${currentFontSize}pt`;
      updatePDFPreview();
    }
  });

  // Auto-update preview when settings change
  pdfPageSize.addEventListener('change', updatePDFPreview);
  pdfOrientation.addEventListener('change', updatePDFPreview);
  pdfMarginTop.addEventListener('input', updatePDFPreview);
  pdfMarginRight.addEventListener('input', updatePDFPreview);
  pdfMarginBottom.addEventListener('input', updatePDFPreview);
  pdfMarginLeft.addEventListener('input', updatePDFPreview);

  // PDF Event Listeners
  pdfPreviewBtn.addEventListener('click', updatePDFPreview);
  pdfDownloadBtn.addEventListener('click', downloadPDF);

  // Event listeners for export buttons
  exportHtmlBtn?.addEventListener('click', exportHTML);
  exportPdfBtn?.addEventListener('click', () => {
    console.log('Export PDF button clicked');
    openPDFModal();
  });

  // Debug: Verify elements are found
  console.log('Export PDF Button:', exportPdfBtn);
  console.log('PDF Modal:', pdfModal);
  console.log('PDF Service Ready:', pdfService.isReady());

  // Check if mobile view (defined early for setViewMode)
  function isMobileView() {
    return window.innerWidth <= 768;
  }

  // Split view resizer
  const splitResizer = document.getElementById('split-resizer');
  const mainContent = document.querySelector('.main-content');
  let isSplitResizing = false;
  let splitRatio = 0.5; // Default 50/50 split

  // Load saved split ratio
  const savedSplitRatio = storageManager.get('splitRatio');
  if (savedSplitRatio) {
    splitRatio = parseFloat(savedSplitRatio);
  }

  // Apply split ratio to containers
  function applySplitRatio() {
    if (!mainContent.classList.contains('split-view-active')) {
      return;
    }

    const mainContentWidth = mainContent.offsetWidth;
    const sidebarWidth = document.getElementById('file-browser').offsetWidth || 0;
    const availableWidth = mainContentWidth - sidebarWidth - 8; // 8px for resizer

    const editorWidth = availableWidth * splitRatio;
    const previewWidth = availableWidth * (1 - splitRatio);

    editorContainer.style.flex = 'none';
    editorContainer.style.width = `${editorWidth}px`;
    previewContainer.style.flex = 'none';
    previewContainer.style.width = `${previewWidth}px`;
  }

  // Reset to flex layout (equal split)
  function resetSplitLayout() {
    editorContainer.style.flex = '1';
    editorContainer.style.width = '';
    previewContainer.style.flex = '1';
    previewContainer.style.width = '';
  }

  // Split resizer drag handlers
  if (splitResizer) {
    splitResizer.addEventListener('mousedown', e => {
      if (!mainContent.classList.contains('split-view-active')) {
        return;
      }

      isSplitResizing = true;
      splitResizer.classList.add('dragging');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });
  }

  document.addEventListener('mousemove', e => {
    if (!isSplitResizing) {
      return;
    }

    const mainContentRect = mainContent.getBoundingClientRect();
    const sidebarWidth = document.getElementById('file-browser').offsetWidth || 0;
    const availableStart = mainContentRect.left + sidebarWidth;
    const availableWidth = mainContentRect.width - sidebarWidth - 8; // 8px for resizer

    // Calculate new ratio based on mouse position
    const mouseX = e.clientX - availableStart;
    let newRatio = mouseX / availableWidth;

    // Constrain ratio between 20% and 80%
    newRatio = Math.max(0.2, Math.min(0.8, newRatio));

    splitRatio = newRatio;
    applySplitRatio();
  });

  document.addEventListener('mouseup', () => {
    if (isSplitResizing) {
      isSplitResizing = false;
      splitResizer.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      // Save split ratio
      storageManager.set('splitRatio', splitRatio.toString());
    }
  });

  // View mode switching
  function setViewMode(mode) {
    // Skip view mode changes on mobile - mobile tabs handle this
    if (isMobileView()) {
      // Just save the preference for desktop
      storageManager.set('viewMode', mode);
      return;
    }

    // Remove active class from all buttons
    editorOnlyBtn.classList.remove('active');
    splitViewBtn.classList.remove('active');
    previewOnlyBtn.classList.remove('active');

    // Apply view mode (desktop only)
    switch (mode) {
      case 'editor-only':
        editorOnlyBtn.classList.add('active');
        editorContainer.style.display = 'flex';
        previewContainer.style.display = 'none';
        mainContent.classList.remove('split-view-active');
        resetSplitLayout();
        break;
      case 'split-view':
        splitViewBtn.classList.add('active');
        editorContainer.style.display = 'flex';
        previewContainer.style.display = 'flex';
        mainContent.classList.add('split-view-active');
        // Apply saved split ratio after a brief delay to ensure layout is ready
        setTimeout(() => applySplitRatio(), 0);
        break;
      case 'preview-only':
        previewOnlyBtn.classList.add('active');
        editorContainer.style.display = 'none';
        previewContainer.style.display = 'flex';
        mainContent.classList.remove('split-view-active');
        resetSplitLayout();
        break;
    }

    // Save view mode preference
    storageManager.set('viewMode', mode);
  }

  // Handle window resize to maintain split ratio
  window.addEventListener('resize', () => {
    if (mainContent.classList.contains('split-view-active')) {
      applySplitRatio();
    }
  });

  // ==================== SYNC SCROLL FUNCTIONALITY ====================

  // Sync scroll state (using var to avoid formatter issues)
  let syncScrollEnabled = storageManager.get('syncScrollEnabled') === 'true';
  let syncScrolling = false;

  // Load saved state and update button
  if (syncScrollEnabled) {
    syncScrollBtn.classList.add('active');
  }

  // Show sync scroll button only in split view
  function updateSyncScrollVisibility() {
    const currentView = storageManager.get('viewMode') || 'split-view';
    if (currentView === 'split-view') {
      syncScrollBtn.style.display = 'inline-block';
    } else {
      syncScrollBtn.style.display = 'none';
    }
  }

  // Sync scroll toggle
  syncScrollBtn.addEventListener('click', () => {
    syncScrollEnabled = !syncScrollEnabled;
    storageManager.set('syncScrollEnabled', syncScrollEnabled.toString());

    if (syncScrollEnabled) {
      syncScrollBtn.classList.add('active');
      console.log('✅ Sync scroll enabled');
    } else {
      syncScrollBtn.classList.remove('active');
      console.log('❌ Sync scroll disabled');
    }
  });

  // Editor scroll handler with smooth sync
  editor.addEventListener('scroll', () => {
    if (!syncScrollEnabled || syncScrolling) {
      return;
    }

    syncScrolling = true;

    requestAnimationFrame(() => {
      const editorHeight = editor.scrollHeight - editor.clientHeight;
      const previewHeight = previewContainer.scrollHeight - previewContainer.clientHeight;

      // Handle edge cases for perfect alignment
      if (editor.scrollTop <= 0) {
        // At top
        previewContainer.scrollTop = 0;
      } else if (editor.scrollTop >= editorHeight) {
        // At bottom
        previewContainer.scrollTop = previewHeight;
      } else {
        // Middle - proportional scroll
        const scrollPercent = editor.scrollTop / editorHeight;
        previewContainer.scrollTop = scrollPercent * previewHeight;
      }

      setTimeout(() => {
        syncScrolling = false;
      }, 10); // Reduced from 50ms for more responsive feel
    });
  });

  // Preview container scroll handler with smooth sync
  previewContainer.addEventListener('scroll', () => {
    if (!syncScrollEnabled || syncScrolling) {
      return;
    }

    syncScrolling = true;

    requestAnimationFrame(() => {
      const editorHeight = editor.scrollHeight - editor.clientHeight;
      const previewHeight = previewContainer.scrollHeight - previewContainer.clientHeight;

      // Handle edge cases for perfect alignment
      if (previewContainer.scrollTop <= 0) {
        // At top
        editor.scrollTop = 0;
      } else if (previewContainer.scrollTop >= previewHeight) {
        // At bottom
        editor.scrollTop = editorHeight;
      } else {
        // Middle - proportional scroll
        const scrollPercent = previewContainer.scrollTop / previewHeight;
        editor.scrollTop = scrollPercent * editorHeight;
      }

      setTimeout(() => {
        syncScrolling = false;
      }, 10); // Reduced from 50ms for more responsive feel
    });
  });

  // View mode button event listeners with sync button update
  editorOnlyBtn.addEventListener('click', () => {
    setViewMode('editor-only');
    updateSyncScrollVisibility();
  });
  splitViewBtn.addEventListener('click', () => {
    setViewMode('split-view');
    updateSyncScrollVisibility();
  });
  previewOnlyBtn.addEventListener('click', () => {
    setViewMode('preview-only');
    updateSyncScrollVisibility();
  });

  // Mobile Tabs Logic
  const mobileTabBtns = document.querySelectorAll('.mobile-tab-btn');
  // Re-select containers to ensure we have the right elements
  const editorContainerEl = document.querySelector('.editor-container');
  const previewContainerEl = document.querySelector('.preview-container');

  // Initialize mobile view state
  function initializeMobileView() {
    if (isMobileView()) {
      // On mobile, default to editor tab
      const activeTab = document.querySelector('.mobile-tab-btn.active');
      const tab = activeTab ? activeTab.dataset.tab : 'editor';

      if (tab === 'editor') {
        editorContainerEl.classList.add('mobile-visible');
        previewContainerEl.classList.remove('mobile-visible');
      } else {
        editorContainerEl.classList.remove('mobile-visible');
        previewContainerEl.classList.add('mobile-visible');
        // Force Safari to recalculate layout
        previewContainerEl.style.display = 'none';
        void previewContainerEl.offsetHeight; // Trigger reflow
        previewContainerEl.style.display = '';
      }

      // Reset zoom on mobile (causes issues on Safari iOS)
      preview.style.transform = 'none';
      preview.style.width = '100%';
      preview.style.height = 'auto';
    }
  }

  mobileTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      mobileTabBtns.forEach(b => b.classList.remove('active'));
      // Add active to clicked
      btn.classList.add('active');

      const tab = btn.dataset.tab;
      if (tab === 'editor') {
        editorContainerEl.classList.add('mobile-visible');
        previewContainerEl.classList.remove('mobile-visible');
      } else {
        editorContainerEl.classList.remove('mobile-visible');
        previewContainerEl.classList.add('mobile-visible');

        // Force Safari to recalculate layout (fixes rendering issue on iOS)
        previewContainerEl.style.display = 'none';
        void previewContainerEl.offsetHeight; // Trigger reflow
        previewContainerEl.style.display = '';

        // Reset zoom on mobile
        preview.style.transform = 'none';
        preview.style.width = '100%';
        preview.style.height = 'auto';

        // Scroll to top of preview
        previewContainerEl.scrollTop = 0;
      }
    });
  });

  // Initialize mobile visibility on page load
  initializeMobileView();

  // Re-initialize on window resize
  window.addEventListener(
    'resize',
    debounce(() => {
      if (isMobileView()) {
        initializeMobileView();
      }
    }, 250),
  );

  // Initialize visibility

  updateSyncScrollVisibility();

  // Load saved theme FIRST, then initialize Mermaid with correct colors
  const savedTheme = storageManager.get('selectedTheme');

  async function initializeWithTheme() {
    if (savedTheme) {
      try {
        // Load theme first
        await themeManager.loadTheme(savedTheme);
        // Theme loaded successfully - sync dropdown
        themeSelector.value = savedTheme;
        console.log(`✅ Theme restored: ${savedTheme}`);
      } catch (err) {
        console.error('Failed to load saved theme:', err);
        // Fallback to default-light on error
        await themeManager.loadTheme('default-light');
        themeSelector.value = 'default-light';
      }
    }

    // NOW initialize Mermaid with correct theme colors (after CSS is loaded)
    await mermaidService.initialize();

    // Re-render to apply theme
    renderMarkdown();
  }

  // Start async initialization
  initializeWithTheme();

  // Zoom functionality
  function setZoom(zoomLevel) {
    // Constrain zoom level between 50% and 200%
    currentZoom = Math.max(50, Math.min(200, zoomLevel));

    // Apply zoom using CSS transform with proper container sizing
    preview.style.transform = `scale(${currentZoom / 100})`;
    preview.style.transformOrigin = 'top left';
    preview.style.width = `${10000 / currentZoom}%`;
    preview.style.height = `${10000 / currentZoom}%`;

    // Ensure scrollbar remains visible and functional
    const previewParentEl = preview.parentElement;
    if (previewParentEl) {
      previewParentEl.style.overflow = 'auto';
    }

    // Update display
    zoomLevelDisplay.textContent = `${currentZoom}%`;

    // Save to localStorage
    storageManager.set('previewZoom', currentZoom.toString());
  }

  function zoomIn() {
    setZoom(currentZoom + 10);
  }

  function zoomOut() {
    setZoom(currentZoom - 10);
  }

  function resetZoom() {
    setZoom(100);
  }

  // Zoom event listeners
  zoomInBtn.addEventListener('click', zoomIn);
  zoomOutBtn.addEventListener('click', zoomOut);
  zoomResetBtn.addEventListener('click', resetZoom);

  // Keyboard shortcuts for zoom (Ctrl/Cmd + Plus/Minus/0)
  preview.addEventListener('wheel', e => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    }
  });

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.target.tagName !== 'TEXTAREA') {
      if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        zoomIn();
      } else if (e.key === '-') {
        e.preventDefault();
        zoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        resetZoom();
      }
    }
  });

  // Load saved zoom level
  const savedZoom = storageManager.get('previewZoom');
  if (savedZoom) {
    currentZoom = parseInt(savedZoom, 10);
    setZoom(currentZoom);
  }

  // Load saved view mode
  const savedViewMode = storageManager.get('viewMode') || 'split-view';
  setViewMode(savedViewMode);

  // ==================== FOLDER BROWSER FUNCTIONALITY ====================

  // Folder browser DOM elements
  const fileBrowser = document.getElementById('file-browser');
  const openFolderBtn = document.getElementById('open-folder-btn');
  const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn'); // Toolbar button
  const refreshFolderBtn = document.getElementById('refresh-folder-btn');
  const createFileBtn = document.getElementById('create-file-btn');

  // Create file modal elements
  const createFileModal = document.getElementById('create-file-modal');
  const closeCreateFileModal = document.getElementById('close-create-file-modal');
  const cancelCreateFileBtn = document.getElementById('cancel-create-file-btn');
  const confirmCreateFileBtn = document.getElementById('confirm-create-file-btn');
  const newFileNameInput = document.getElementById('new-file-name');
  const newFileLocationSelect = document.getElementById('new-file-location');
  const newFileTemplateSelect = document.getElementById('new-file-template');

  // Zen Mode Functionality
  const zenModeBtn = document.getElementById('zen-mode-btn');
  const exitZenBtn = document.getElementById('exit-zen-btn');

  function toggleZenMode() {
    document.body.classList.toggle('zen-mode');

    // Auto-resize editor in Zen mode
    if (document.body.classList.contains('zen-mode')) {
      // Force refresh editor layout if needed
      if (typeof editor.refresh === 'function') {
        editor.refresh();
      }
    }
  }

  if (zenModeBtn) {
    zenModeBtn.addEventListener('click', toggleZenMode);
  }

  if (exitZenBtn) {
    exitZenBtn.addEventListener('click', toggleZenMode);
  }

  // Escape key to exit Zen Mode
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.body.classList.contains('zen-mode')) {
      toggleZenMode();
    }
  });
  const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn'); // Sidebar header button
  const resizeHandle = document.getElementById('resize-handle');
  const fileTree = document.getElementById('file-tree');
  const currentFolderNameEl = document.getElementById('current-folder-name');
  const fileCountEl = document.getElementById('file-count');

  // Folder browser state (using let to allow reassignment)
  let folderFiles = [];
  let activeFileHandle = null;
  let isResizing = false;
  let sidebarWidth = 280; // Default width
  const minWidth = 100; // Allow squeezing to very narrow
  const maxWidth = 600;
  const collapseThreshold = 80; // Auto-collapse at very left edge only

  // Load saved sidebar width
  const savedWidth = storageManager.get('sidebarWidth');
  if (savedWidth) {
    sidebarWidth = parseInt(savedWidth, 10);
  }

  // Resize functionality
  resizeHandle.addEventListener('mousedown', e => {
    isResizing = true;
    fileBrowser.classList.add('resizing');
    resizeHandle.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!isResizing) {
      return;
    }

    const newWidth = e.clientX;

    // Check if dragged to leftmost (auto-collapse)
    if (newWidth < collapseThreshold) {
      // Auto-collapse with smooth animation
      fileBrowser.classList.remove('resizing');
      fileBrowser.classList.add('collapsed');
      storageManager.set('sidebarCollapsed', 'true');
      isResizing = false;
      resizeHandle.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      // Recalculate split view layout after sidebar collapses
      if (mainContent.classList.contains('split-view-active')) {
        // Reset to flex layout to fill available space
        editorContainer.style.flex = '1';
        editorContainer.style.width = '';
        previewContainer.style.flex = '1';
        previewContainer.style.width = '';

        // After transition completes, re-apply the saved ratio
        setTimeout(() => {
          applySplitRatio();
        }, 350); // Wait for CSS transition (300ms) + buffer
      }
      return;
    }

    // Constrain width
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      sidebarWidth = newWidth;
      fileBrowser.style.width = `${sidebarWidth}px`;

      // Recalculate split view layout when sidebar is resized
      if (typeof applySplitRatio === 'function') {
        applySplitRatio();
      }
    }
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      fileBrowser.classList.remove('resizing');
      resizeHandle.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      // Save width
      storageManager.set('sidebarWidth', sidebarWidth.toString());
    }
  });

  // Open folder handler
  openFolderBtn.addEventListener('click', async () => {
    if (!folderBrowserService.isSupported()) {
      alert(
        'Folder browsing requires File System Access API.\n\n' +
          'Please use Chrome 86+ or Edge 86+.\n\n' +
          'Firefox and Safari are not currently supported.',
      );
      return;
    }

    const result = await folderBrowserService.openFolder();

    if (result.cancelled) {
      return; // User cancelled
    }

    if (!result.success) {
      alert(`Error opening folder: ${result.error}`);
      return;
    }

    // Store files
    folderFiles = result.files;

    // Show browser sidebar (expand)
    fileBrowser.classList.remove('collapsed');
    storageManager.set('sidebarCollapsed', 'false');

    // Update UI
    currentFolderNameEl.textContent = result.folderName;
    fileCountEl.textContent = `${result.totalFiles} file${result.totalFiles !== 1 ? 's' : ''}`;

    // Render tree
    renderFileTree(result.files);

    // Build file cache for link navigation
    if (linkNavigationService && folderBrowserService.currentDirectoryHandle) {
      await linkNavigationService.buildFileCache(folderBrowserService.currentDirectoryHandle);
    }

    // Update expand button visibility
    updateExpandButtonVisibility();

    console.log(`✅ Loaded ${result.totalFiles} markdown files from ${result.folderName}`);
  });

  // ==================== REFRESH FOLDER FUNCTIONALITY ====================
  // Track refresh state to prevent spam clicks
  let isRefreshing = false;

  refreshFolderBtn.addEventListener('click', async () => {
    // Debounce: Prevent multiple simultaneous refreshes
    if (isRefreshing) {
      console.log('⏳ Refresh already in progress, skipping...');
      return;
    }

    if (!folderBrowserService.getCurrentFolderName()) {
      showToast('No folder is open. Please open a folder first.', 'info');
      return;
    }

    // Set refreshing state
    isRefreshing = true;
    refreshFolderBtn.disabled = true;
    refreshFolderBtn.classList.add('refreshing');

    try {
      const result = await folderBrowserService.refreshFolder();

      if (!result.success) {
        showToast(`Error refreshing folder: ${result.error}`, 'error');
        return;
      }

      // Update state
      folderFiles = result.files;

      // Update UI
      fileCountEl.textContent = `${result.totalFiles} file${result.totalFiles !== 1 ? 's' : ''}`;
      renderFileTree(result.files);

      // Re-read the currently open file to get updated content
      if (activeFileHandle) {
        const readResult = await folderBrowserService.readFile(activeFileHandle);
        if (readResult.success) {
          editor.value = readResult.content;
          renderMarkdown();
          console.log(`🔄 Reloaded active file: ${readResult.name}`);
        } else {
          // File may have been deleted - clear the editor
          console.warn(`⚠️ Could not reload active file: ${readResult.error}`);
          // Don't clear the editor - user may have unsaved changes
        }
      }

      showToast(`✅ Folder refreshed: ${result.totalFiles} files found`, 'success');
      console.log(`🔄 Refreshed folder: ${result.totalFiles} markdown files`);
    } finally {
      // Always reset state, even on error
      isRefreshing = false;
      refreshFolderBtn.disabled = false;
      refreshFolderBtn.classList.remove('refreshing');
    }
  });

  // ==================== CREATE FILE FUNCTIONALITY ====================

  // File templates - DYNAMIC: returns fresh templates with current date
  function getFileTemplates() {
    return {
      empty: '',
      basic: `# Document Title

## Introduction

Write your introduction here...

## Content

Your main content goes here.

## Conclusion

Summarize your points here.
`,
      readme: `# Project Name

Brief description of your project.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

\`\`\`bash
npm install your-package
\`\`\`

## Usage

\`\`\`javascript
import { something } from 'your-package';
\`\`\`

## License

MIT
`,
      notes: `# Meeting Notes

**Date:** ${new Date().toLocaleDateString()}
**Attendees:**

## Agenda

1. Topic 1
2. Topic 2
3. Topic 3

## Discussion

### Topic 1


### Topic 2


### Topic 3


## Action Items

- [ ] Action item 1 - @person
- [ ] Action item 2 - @person

## Next Meeting

Date: TBD
`,
      blog: `---
title: "Your Blog Post Title"
date: ${new Date().toISOString().split('T')[0]}
author: Your Name
tags: [tag1, tag2]
---

# Your Blog Post Title

![Featured Image](image-url)

## Introduction

Hook your readers with an engaging introduction...

## Main Content

### Subheading 1

Your content here...

### Subheading 2

More content...

## Conclusion

Wrap up your thoughts and include a call to action.

---

*Thanks for reading! Feel free to share your thoughts in the comments.*
`,
    };
  }

  // Open create file modal
  createFileBtn.addEventListener('click', () => {
    if (!folderBrowserService.getCurrentFolderName()) {
      showToast('Please open a folder first before creating files.', 'info');
      return;
    }

    // Populate location dropdown with directories
    populateLocationDropdown();

    // Reset form
    newFileNameInput.value = '';
    newFileTemplateSelect.value = 'empty';

    // Show modal
    createFileModal.classList.add('active');

    // Focus input
    setTimeout(() => newFileNameInput.focus(), 100);
  });

  // Close modal handlers
  closeCreateFileModal.addEventListener('click', () => {
    createFileModal.classList.remove('active');
  });

  cancelCreateFileBtn.addEventListener('click', () => {
    createFileModal.classList.remove('active');
  });

  createFileModal.addEventListener('click', e => {
    if (e.target === createFileModal) {
      createFileModal.classList.remove('active');
    }
  });

  // Handle Enter key in filename input
  newFileNameInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      confirmCreateFileBtn.click();
    }
  });

  // Confirm create file
  confirmCreateFileBtn.addEventListener('click', async () => {
    const filename = newFileNameInput.value.trim();

    if (!filename) {
      showToast('Please enter a filename.', 'error');
      newFileNameInput.focus();
      return;
    }

    // Get selected directory
    const locationPath = newFileLocationSelect.value;
    let targetDir = null;

    if (locationPath) {
      targetDir = await folderBrowserService.getDirectoryByPath(locationPath);
      if (!targetDir) {
        showToast('Could not access the selected directory.', 'error');
        return;
      }
    }

    // Get template content (dynamically generated for fresh dates)
    const templateKey = newFileTemplateSelect.value;
    const templates = getFileTemplates();
    const content = templates[templateKey] || '';

    // Disable ALL form inputs while creating (prevents double submission)
    confirmCreateFileBtn.disabled = true;
    confirmCreateFileBtn.textContent = 'Creating...';
    cancelCreateFileBtn.disabled = true;
    newFileNameInput.disabled = true;
    newFileLocationSelect.disabled = true;
    newFileTemplateSelect.disabled = true;

    // Small delay to ensure filesystem sync before refresh
    const result = await folderBrowserService.createFile(targetDir, filename, content);

    // Re-enable ALL form inputs
    confirmCreateFileBtn.disabled = false;
    confirmCreateFileBtn.textContent = 'Create File';
    cancelCreateFileBtn.disabled = false;
    newFileNameInput.disabled = false;
    newFileLocationSelect.disabled = false;
    newFileTemplateSelect.disabled = false;

    if (!result.success) {
      showToast(`Error: ${result.error}`, 'error');
      return;
    }

    // Success - close modal
    createFileModal.classList.remove('active');
    showToast(`✅ Created: ${result.filename}`, 'success');

    // Wait a tick to ensure filesystem sync before refresh
    await new Promise(resolve => setTimeout(resolve, 100));

    // Refresh folder to show new file
    const refreshResult = await folderBrowserService.refreshFolder();
    if (refreshResult.success) {
      folderFiles = refreshResult.files;
      fileCountEl.textContent = `${refreshResult.totalFiles} file${refreshResult.totalFiles !== 1 ? 's' : ''}`;
      renderFileTree(refreshResult.files);
    }

    // Load the new file into editor
    const readResult = await folderBrowserService.readFile(result.fileHandle);
    if (readResult.success) {
      editor.value = readResult.content;
      activeFileHandle = result.fileHandle;
      renderMarkdown();
    }
  });

  // Populate location dropdown with directories from the file tree
  function populateLocationDropdown() {
    // Clear existing options except root
    newFileLocationSelect.innerHTML = '<option value="">📁 Root folder</option>';

    // Recursively add directories
    function addDirectories(items, path = '', indent = 0) {
      items.forEach(item => {
        if (item.type === 'directory') {
          const fullPath = path ? `${path}/${item.name}` : item.name;
          const option = document.createElement('option');
          option.value = fullPath;
          option.textContent = `${'  '.repeat(indent)}📁 ${item.name}`;
          newFileLocationSelect.appendChild(option);

          if (item.children) {
            addDirectories(item.children, fullPath, indent + 1);
          }
        }
      });
    }

    addDirectories(folderFiles);
  }

  // Toast notification helper
  function showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
      existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto-remove after delay
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Expand sidebar button
  const expandSidebarBtn = document.getElementById('expand-sidebar-btn');

  // Update expand button visibility based on folder state and sidebar state
  function updateExpandButtonVisibility() {
    const hasFolderOpen = folderBrowserService.getCurrentFolderName() !== null;
    const isCollapsed = fileBrowser.classList.contains('collapsed');

    if (hasFolderOpen && isCollapsed) {
      expandSidebarBtn.classList.add('visible');
    } else {
      expandSidebarBtn.classList.remove('visible');
    }
  }

  // Expand sidebar button click handler
  if (expandSidebarBtn) {
    expandSidebarBtn.addEventListener('click', () => {
      fileBrowser.classList.remove('collapsed');
      storageManager.set('sidebarCollapsed', 'false');
      updateExpandButtonVisibility();

      // Recalculate layout after expansion
      if (mainContent.classList.contains('split-view-active')) {
        setTimeout(() => {
          applySplitRatio();
        }, 350);
      }
    });
  }

  // Toggle Sidebar
  function toggleSidebar() {
    fileBrowser.classList.toggle('collapsed');
    const isCollapsed = fileBrowser.classList.contains('collapsed');
    storageManager.set('sidebarCollapsed', isCollapsed.toString());
    updateExpandButtonVisibility();

    // When sidebar collapses/expands, we need to recalculate the layout
    // First, reset to flex layout to let containers fill available space
    if (mainContent.classList.contains('split-view-active')) {
      // Temporarily reset to flex (fills available space)
      editorContainer.style.flex = '1';
      editorContainer.style.width = '';
      previewContainer.style.flex = '1';
      previewContainer.style.width = '';

      // After transition completes, re-apply the saved ratio
      setTimeout(() => {
        applySplitRatio();
      }, 350); // Wait for CSS transition (300ms) + buffer
    }
  }

  // Attach event listeners to BOTH toggle buttons
  if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener('click', toggleSidebar);
  }

  if (toggleSidebarBtn) {
    toggleSidebarBtn.addEventListener('click', toggleSidebar);
  }

  // Render file tree
  function renderFileTree(items, container = fileTree, indent = 0) {
    // Clear container on first render
    if (indent === 0) {
      container.innerHTML = '';
    }

    if (items.length === 0 && indent === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>📂 No markdown files found</p>
          <p class="hint">This folder doesn't contain any .md files</p>
        </div>
      `;
      return;
    }

    items.forEach(item => {
      if (item.type === 'directory') {
        const folderDiv = createFolderElement(item, indent);
        container.appendChild(folderDiv);

        if (item.expanded && item.children) {
          const childContainer = document.createElement('div');
          childContainer.className = 'tree-children';
          renderFileTree(item.children, childContainer, indent + 1);
          container.appendChild(childContainer);
        }
      } else if (item.type === 'file') {
        const fileDiv = createFileElement(item, indent);
        container.appendChild(fileDiv);
      }
    });
  }

  // Create folder element
  function createFolderElement(item, indent) {
    const div = document.createElement('div');
    div.className = 'tree-item folder';
    div.style.paddingLeft = `${indent * 20 + 12}px`;

    const icon = item.expanded ? '📂' : '📁';
    const folderIcon = document.createElement('span');
    folderIcon.className = 'folder-icon';
    folderIcon.textContent = icon;

    const folderName = document.createElement('span');
    folderName.className = 'folder-name';
    folderName.textContent = item.name;

    const fileCount = document.createElement('span');
    fileCount.className = 'file-count';
    fileCount.textContent = item.fileCount;

    div.appendChild(folderIcon);
    div.appendChild(folderName);
    div.appendChild(fileCount);

    div.addEventListener('click', e => {
      e.stopPropagation();
      toggleFolder(item);
    });

    return div;
  }

  // Create file element
  function createFileElement(item, indent) {
    const div = document.createElement('div');
    div.className = 'tree-item file';
    div.style.paddingLeft = `${indent * 20 + 12}px`;

    // Mark as active if this is the current file
    if (activeFileHandle === item.handle) {
      div.classList.add('active');
    }

    const fileIcon = document.createElement('span');
    fileIcon.className = 'file-icon';
    fileIcon.textContent = '📄';

    const fileName = document.createElement('span');
    fileName.className = 'file-name';
    fileName.textContent = item.name;

    div.appendChild(fileIcon);
    div.appendChild(fileName);

    div.addEventListener('click', async e => {
      e.stopPropagation();
      await loadFileFromBrowser(item);
    });

    return div;
  }

  // Toggle folder expand/collapse
  function toggleFolder(folder) {
    folder.expanded = !folder.expanded;
    renderFileTree(folderFiles);
  }

  // Load file from browser
  async function loadFileFromBrowser(fileItem) {
    const result = await folderBrowserService.readFile(fileItem.handle);

    if (!result.success) {
      alert(`Error loading file: ${result.error}`);
      return;
    }

    // Load content into editor
    editor.value = result.content;

    // Mark as active file
    activeFileHandle = fileItem.handle;

    // Update link navigation context with current file path
    if (linkNavigationService && fileItem.path) {
      linkNavigationService.setCurrentFile(fileItem.path);
    }

    // Re-render tree to update active state
    renderFileTree(folderFiles);

    // Render markdown
    renderMarkdown();

    console.log(`✅ Loaded file: ${fileItem.name} (${result.size} bytes)`);
  }

  // Expose renderMarkdown globally for theme changes
  globalRenderMarkdown = renderMarkdown;

  // Initialize expand button visibility on load
  updateExpandButtonVisibility();

  // Initialize anchor navigation for TOC links
  AnchorNavigation.init(previewContainer);

  // Initialize Link Navigation Service
  linkNavigationService = new LinkNavigationService(folderBrowserService, fileData => {
    // Callback when file should be loaded from link navigation
    editor.value = fileData.content;
    renderMarkdown();

    // Highlight file in tree if possible
    const fileItems = document.querySelectorAll('.tree-item.file');
    fileItems.forEach(item => {
      const fileName = item.querySelector('.file-name');
      if (fileName && fileName.textContent === fileData.name) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Handle anchor navigation (file.md#heading support)
    if (fileData.anchor) {
      // Wait for render to complete, then scroll to anchor
      requestAnimationFrame(() => {
        setTimeout(() => {
          AnchorNavigation.scrollToHash(fileData.anchor, true);
        }, 100); // Small delay for DOM to update
      });
    }

    console.log(
      `[App] Loaded from link: ${fileData.path}${fileData.anchor ? `#${fileData.anchor}` : ''}`,
    );
  });

  // Initialize link interceptor on preview container
  const markdownPreview = document.getElementById('markdown-preview');
  linkNavigationService.initialize(markdownPreview);

  // DON'T render immediately - wait for theme to load
  // renderMarkdown will be called after theme loads above
}
