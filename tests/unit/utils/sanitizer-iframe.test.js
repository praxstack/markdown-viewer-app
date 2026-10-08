import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import DOMPurify from 'dompurify';
import { describe, expect, it } from 'vitest';
import { SANITIZE_OPTIONS } from '../../../src/js/config/sanitizer.js';

const EMBED_PAYLOAD =
  '<iframe src="https://evil.example" allow="camera"></iframe>' +
  '<frameset><frame src="x"></frameset>' +
  '<object data="x"></object><embed src="x"><portal src="x"></portal><p>ok</p>';

describe('markdown sanitizer (MVA-007)', () => {
  it('script.js sanitizes the preview with the shared SANITIZE_OPTIONS', () => {
    const src = readFileSync(resolve(__dirname, '../../../script.js'), 'utf8');
    expect(src).toMatch(
      /import\s*\{\s*SANITIZE_OPTIONS\s*\}\s*from\s*'\.\/src\/js\/config\/sanitizer\.js'/
    );
    expect(src).toMatch(/DOMPurify\.sanitize\(\s*html\s*,\s*SANITIZE_OPTIONS\s*\)/);
  });

  it('does not re-allow embedded browsing contexts via ADD_TAGS', () => {
    for (const tag of ['iframe', 'frame', 'frameset', 'object', 'embed', 'portal']) {
      expect(SANITIZE_OPTIONS.ADD_TAGS).not.toContain(tag);
      expect(SANITIZE_OPTIONS.FORBID_TAGS).toContain(tag);
    }
  });

  it('strips iframe, frame, object, embed and portal', () => {
    const out = DOMPurify.sanitize(EMBED_PAYLOAD, SANITIZE_OPTIONS);
    expect(out).not.toMatch(/iframe|frame|object|embed|portal/i);
    expect(out).toContain('<p>ok</p>');
  });

  it('keeps images and mermaid data attributes', () => {
    const out = DOMPurify.sanitize(
      '<img src="https://example.com/a.png" alt="a" loading="lazy"><div class="mermaid-diagram" data-code="graph%20TD">x</div>',
      SANITIZE_OPTIONS
    );
    expect(out).toContain('src="https://example.com/a.png"');
    expect(out).toContain('loading="lazy"');
    expect(out).toContain('data-code="graph%20TD"');
  });
});
