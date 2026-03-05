# 🚀 Future Enhancements: Enterprise-Grade Roadmap

This document outlines the strategic roadmap to transform the `markdown-viewer-app` into a truly **Enterprise-Grade** web application.

---

## ✅ Completed Enhancements (Phase 1.5 Polish)

- **UI/UX:** Implemented Glassmorphism transparency on Toolbar and Modals (`color-mix` + `backdrop-filter`).
- **Mobile Experience:** Added "Mobile Tabs" (Edit/Preview toggle) to replace awkward vertical stacking.
- **Animations:** Added subtle keyframe animations for Modals and Fade-ins.
- **Syntax Highlighting:** Fully future-proofed with `vite-plugin-prismjs`.

## 🏗️ Phase 1: Robust Application Architecture (Modernization)

To support enterprise scale, we must move beyond the "Vanilla JS" constraints suitable for prototypes and adopt a robust, type-safe ecosystem.

### 1.1 Migrate to TypeScript

- **Why:** Enterprise apps require type safety to prevent runtime errors (undefined is not ...).
- **Plan:** Rename `.js` to `.ts`. Define interfaces for `Theme`, `FileNode`, and `AppConfig`. Strict null checks.

### 1.2 Component-Based Architecture (Web Components or Framework)

- **Why:** The `script.js` monolith is unmaintainable.
- **Plan:**
  - **Option A (Vanilla):** Adopt Web Components (`<markdown-editor>`, `<file-tree>`).
  - **Option B (Standard):** Migrate to **React** or **Vue**. This allows us to use massive ecosystems of tested components (e.g., `Monaco Editor` for better markdown editing).

### 1.3 State Management

- **Why:** Passing `globalRenderMarkdown` around is fragile.
- **Plan:** Implement a centralized store (e.g., `Redux`, `Zustand`, or a simple `StateService` observable) to manage:
  - `currentFile`
  - `theme`
  - `settings`
  - `folderStructure`

---

## 🛡️ Phase 2: Enterprise Security & Compliance

### 2.1 Content Security Policy (CSP)

- **Goal:** Prevent XSS and Data Exfiltration.
- **Action:** implement strict CSP headers (or `<meta>` tags):
  ```html
  <meta
    http-equiv="Content-Security-Policy"
    content="default-src 'self'; script-src 'self' 'unsafe-eval' (for mermaid); style-src 'self' 'unsafe-inline';"
  />
  ```

### 2.2 Input Sanitization Layer

- **Goal:** trust No Input.
- **Action:** Integrate `DOMPurify` deeply into the rendering pipeline. Create a `SanitizationService` that all HTML output must pass through.

---

## ⚡ Phase 3: Performance & Scalability

### 3.1 Web Workers for Parsing

- **Issue:** Parsing large markdown files (1000+ lines) freezes the UI.
- **Solution:** Move `marked.parse` and syntax highlighting logic to a **Web Worker**. The main thread should only handle User Input and DOM updates.

### 3.2 Virtualized Rendering

- **Issue:** The File Browser and Large Preview will lag with thousands of items.
- **Solution:** Implement "Virtual Scrolling" (Windowing). Only render the DOM nodes currently visible on screen.

### 3.3 Offline-First (PWA)

- **Goal:** Native-like reliability.
- **Action:**
  - Add a Service Worker to cache App Shell and Assets (Fonts, CSS).
  - Use `IndexedDB` instead of `localStorage` for saving files (allows saving images/blobs).

---

## 🧩 Phase 4: Advanced Features (The "Wow" Factor)

### 4.1 Collaborative Editing (Real-Time)

- **Tech:** `Yjs` or `Automerge` (CRDTs).
- **Feature:** Allow two users to edit the same doc via WebRTC (local peer-to-peer) without a central server.

### 4.2 Semantic Search (AI)

- **Start:** Implement client-side full-text search (FlexSearch).
- **Upgrade:** Use a local LLM or Embedding model (via WebGPU) to allow "Chat with my Docs".

### 4.3 Plugin System

- **Architecture:** Allow users to write JavaScript "plugins" to extend functionality (e.g., a "Date Picker" markdown extension).
- **Security:** Run plugins in a Sandboxed Iframe.

---

## 📈 Roadmap Estimate

| Feature           | Complexity | Impact | Timeline |
| ----------------- | ---------- | ------ | -------- |
| **TS Migration**  | Medium     | High   | Q1       |
| **PWA / Offline** | Low        | High   | Q1       |
| **Web Workers**   | High       | Medium | Q2       |
| **Collaboration** | Very High  | High   | Q3       |
