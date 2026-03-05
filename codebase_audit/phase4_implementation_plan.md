# 🛡️ Audit Phase 4: Consolidation & Implementation Plan

## 🚨 Critical Priority (Immediate Action Required)

### 1. Fix Stored XSS Vulnerability

- **Severity:** Critical
- **Location:** `script.js` (Line 512)
- **Issue:** Markdown is parsed and injected directly into `innerHTML` without sanitization. Malicious markdown files can execute arbitrary JavaScript.
- **Action Plan:**
  1. Install `dompurify`: `npm install dompurify`
  2. Import it in `script.js` (or load via CDN if sticking to hybrid approach).
  3. Wrap parsing: `preview.innerHTML = DOMPurify.sanitize(marked.parse(markdownText));`

### 2. Remove Race Conditions in Threading

- **Severity:** High
- **Location:** `script.js` (Lines 490, 535)
- **Issue:** `setTimeout` (100ms) used to guess when libraries are ready. This leads to flaky rendering and "pop-in" effects.
- **Action Plan:**
  1. Refactor `MermaidService.render()` to return a Promise that resolves _only_ when rendering is complete.
  2. Await this promise in `renderMarkdown()` instead of using `setTimeout`.

---

## 🏗️ High Priority (Architectural Refactoring)

### 3. Decompose Monolithic `script.js`

- **Severity:** High
- **Location:** `script.js` (1372 lines)
- **Issue:** File violates Single Responsibility Principle. Handles initialization, event binding, UI rendering, logic, and service orchestration.
- **Action Plan:**
  1. **Extract `UIManager`**: Move all `document.getElementById` and UI toggling logic here.
  2. **Extract `FileTreeView`**: Move the 200+ lines of DOM generation for the folder browser out of `script.js`.
  3. **Extract `EventManager`**: Centralize event listener bindings.

### 4. Standardize Dependency Management

- **Severity:** Medium
- **Location:** `index.html`
- **Issue:** Runtime dependencies (Marked, Prism, Mermaid, KaTeX) are loaded via CDNs, while dev tools are in `package.json`. This creates a fragility where internet access is required for the "local" app to run.
- **Action Plan:**
  1. Install runtime deps: `npm install marked prismjs mermaid katex html2pdf.js`
  2. Update `vite.config.js` to bundle these assets.
  3. Remove CDN links from `index.html`.

---

## 🧹 Medium Priority (Cleanup)

### 5. Update Documentation

- **Severity:** Low
- **Location:** `README.md`
- **Issue:** Documentation mentions Java/Python support, implying backend code, but the repo is purely static frontend.
- **Action Plan:**
  1. Clarify "Client-Side Only" architecture in README.
  2. Update "Tech Stack" section to reflect actual discovered files.

### 6. Centralize Configuration

- **Severity:** Low
- **Issue:** Some magic numbers (sidebar widths, zoom limits) are still hardcoded in `script.js`.
- **Action Plan:**
  1. Move all remaining constants to `src/js/config/constants.js`.

---

## 📅 Roadmap

| Phase      | Task                                              | Est. Effort |
| ---------- | ------------------------------------------------- | ----------- |
| **Week 1** | Security Fixes (XSS) + `setTimeout` Removal       | 1 Day       |
| **Week 2** | Split `script.js` -> `UIManager`, `AppController` | 3 Days      |
| **Week 3** | Dependency Migration (CDN -> NPM)                 | 2 Days      |
| **Week 4** | Documentation & Final Polish                      | 1 Day       |
