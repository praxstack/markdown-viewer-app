import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    exclude: [
      '**/node_modules/**',
      '**/.cache/**',
      '**/.claude/skills/**',
      '**/.agents/skills/**',
      '**/.cursor/skills/**',
      '**/.cache/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules/', 'tests/', 'dist/', 'memory-bank/', '*.config.js'],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },
    },
  },
});
