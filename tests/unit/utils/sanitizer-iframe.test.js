import { describe, it, expect } from 'vitest';
import DOMPurify from 'dompurify';

// Mirrors the sanitizer options used in script.js renderMarkdown (MVA-007)
const opts = {
  ADD_TAGS: ['img'],
  FORBID_TAGS: ['iframe', 'frame', 'frameset', 'object', 'embed', 'portal'],
  ADD_ATTR: ['target', 'data-code', 'src', 'alt', 'title', 'width', 'height', 'loading'],
  USE_PROFILES: { html: true, svg: true, mathml: true },
};

describe('markdown sanitizer', () => {
  it('strips iframe, object and embed', () => {
    const out = DOMPurify.sanitize(
      '<iframe src="https://evil.example" allow="camera"></iframe><object data="x"></object><embed src="x"><p>ok</p>',
      opts,
    );
    expect(out).not.toMatch(/iframe|object|embed/i);
    expect(out).toContain('<p>ok</p>');
  });
});
