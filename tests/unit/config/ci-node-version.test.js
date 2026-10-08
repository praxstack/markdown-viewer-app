import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../..');

function parseVersion(v) {
  const [major = 0, minor = 0, patch = 0] = v
    .trim()
    .replace(/^v/, '')
    .split('.')
    .map(n => Number.parseInt(n, 10) || 0);
  return [major, minor, patch];
}

function cmp(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

// Minimal matcher for the engines.node forms used in package-lock.json:
// "*", ">=X.Y.Z", "^X.Y.Z", bare "X", joined by "||".
function satisfies(version, range) {
  return range.split('||').some(alt => {
    const part = alt.trim();
    if (part === '*') return true;
    if (part.startsWith('>=')) return cmp(version, parseVersion(part.slice(2))) >= 0;
    if (part.startsWith('^')) {
      const min = parseVersion(part.slice(1));
      return version[0] === min[0] && cmp(version, min) >= 0;
    }
    if (/^\d+$/.test(part)) return version[0] === Number(part);
    throw new Error(`Unsupported engines range "${range}"`);
  });
}

describe('CI Node version (review M4)', () => {
  const workflow = readFileSync(resolve(root, '.github/workflows/deploy.yml'), 'utf8');
  const match = workflow.match(/node-version:\s*['"]?(\d+(?:\.\d+){0,2})['"]?/);
  const lock = JSON.parse(readFileSync(resolve(root, 'package-lock.json'), 'utf8'));

  it('deploy workflow pins a Node version', () => {
    expect(match).not.toBeNull();
  });

  it('satisfies engines.node of every non-optional package in the lockfile', () => {
    const ciNode = parseVersion(match[1]);
    const unsatisfied = Object.entries(lock.packages)
      .filter(([name, pkg]) => name && !pkg.optional && pkg.engines?.node)
      .filter(([, pkg]) => !satisfies(ciNode, pkg.engines.node))
      .map(([name, pkg]) => `${name} (${pkg.engines.node})`);
    expect(unsatisfied).toEqual([]);
  });
});
