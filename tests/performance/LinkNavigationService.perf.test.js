
import { describe, it, expect, vi } from 'vitest';
import { LinkNavigationService } from '../../src/js/services/LinkNavigationService.js';

describe('LinkNavigationService Performance', () => {
  const createMockDir = (depth, width, delay = 1) => {
    return {
      kind: 'directory',
      name: `dir-${depth}-${width}`,
      values: async function* () {
        // Yield files
        for (let i = 0; i < width; i++) {
          yield { kind: 'file', name: `file-${depth}-${i}.md` };
        }
        // Yield directories
        if (depth > 0) {
          for (let i = 0; i < width; i++) {
            // Artificial delay to simulate I/O
            await new Promise(resolve => setTimeout(resolve, delay));
            yield createMockDir(depth - 1, width, delay);
          }
        }
      },
    };
  };

  it('measures baseline performance of buildFileCache', async () => {
    const service = new LinkNavigationService({}, () => {});
    const depth = 2;
    const width = 5;
    const delay = 10; // 10ms delay per entry
    const mockDir = createMockDir(depth, width, delay);

    const start = performance.now();
    await service.buildFileCache(mockDir);
    const end = performance.now();

    console.log(`Cache build took ${end - start}ms for ${service.fileHandleCache.size} files`);
  });
});
