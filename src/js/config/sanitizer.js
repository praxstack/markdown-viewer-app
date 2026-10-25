/**
 * DOMPurify options for rendering untrusted markdown in the preview.
 * Shared by script.js and the sanitizer regression tests.
 */
export const SANITIZE_OPTIONS = Object.freeze({
  ADD_TAGS: ['img'],
  // Never allow embedded browsing contexts from untrusted markdown (MVA-007)
  FORBID_TAGS: ['iframe', 'frame', 'frameset', 'object', 'embed', 'portal'],
  ADD_ATTR: [
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
