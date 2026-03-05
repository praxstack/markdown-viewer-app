# 💡 Phase 5: Recommendations & Roadmap

Based on the consolidated findings, here are the strategic recommendations for the `markdown-viewer-app`.

## 🧠 Strategic Recommendations

### 1. Security Hardening (Immediate)

- **Mitigate XSS:** The application **must** integrate a sanitization library (e.g., `DOMPurify`) before rendering any Markdown content. This is non-negotiable for a viewer app.
- **Content Security Policy (CSP):** Implement a strict CSP in `index.html` to prevent unauthorized script execution, especially since we rely on CDNs.

### 2. Architectural Refactoring (Short Term)

- **Adopt MVC/MVVM:** Move away from the "Giant Script" pattern.
  - **Model:** `StorageManager.js` (Already exists, good).
  - **View:** Create `UIManager.js` to handle all DOM updates.
  - **Controller:** Slim down `script.js` to only handle event orchestration.
- **Event-Driven Architecture:** Expand the `ThemeManager`'s observer pattern to a global `EventManager` to decouple components.

### 3. Modernization (Medium Term)

- **Migrate to TypeScript:** The project checks for TS in `package.json` but uses JS. Migrating to TypeScript will eliminate type-related bugs and self-document the code.
- **Bundle Management:** Move from CDN links in `index.html` to a built bundle (Vite). This ensures the app works offline (a key value prop) and stabilizes dependency versions.

### 4. Quality Assurance (Long Term)

- **Automated E2E Testing:** Implement Playwright or Cypress tests to verify the "Sync Scroll" and "Theme Switching" features automatically, reducing manual testing burden.

## 🗺️ Proposed Roadmap

### Phase A: Stability & Security (Week 1)

- [ ] Install `dompurify`
- [ ] Implement input sanitization
- [ ] Replace `setTimeout` with `Promise` chains
- [ ] Fix race conditions in Theme/Mermaid loading

### Phase B: decoupling (Week 2)

- [ ] Extract `FolderBrowser` logic to `src/js/components/FileTree.js`
- [ ] Extract global event listeners to `src/js/core/EventManager.js`
- [ ] Refactor `script.js` to use these new modules

### Phase C: Infrastructure (Week 3)

- [ ] Migrate runtime deps (Marked, Mermaid) to `npm`
- [ ] Configure Vite for production bundling
- [ ] Set up basic E2E tests for critical paths (Render, Export)
