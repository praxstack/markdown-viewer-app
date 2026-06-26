## 2024-05-24 - [Avoid `forEach` overhead in recursive codebase methods]

**Learning:** In highly recursive file and directory scanning processes (e.g., generating file tree structures), the repeated array `.forEach` calls generate unnecessary function closures and allocations which can slow down applications significantly. This overhead becomes apparent when browsing large nested markdown folders.
**Action:** Replace `Array.prototype.forEach` with `for...of` statements in code paths related to file/folder traversal or recursive processes (like `FolderBrowserService.js` `getAllFiles` and `countFiles`). This maintains readability while avoiding the closure creation overhead, and should be the preferred pattern when processing unbounded or deep file trees.

## 2024-05-25 - [Optimize recursive DOM rendering with DocumentFragment and for...of]

**Learning:** In recursive UI rendering processes (e.g., `renderFileTree` or `populateLocationDropdown`), using `.forEach` leads to excessive closure allocations. Appending elements directly to the live DOM inside recursive loops causes severe layout thrashing. The combination of both leads to unacceptable UI lockup during deep folder expansion.
**Action:** Always combine `for...of` loops with `document.createDocumentFragment()` to batch DOM insertions before appending them to the container in recursive Vanilla JS DOM manipulation. This prevents both closure allocation bottlenecks and synchronous layout thrashing.
