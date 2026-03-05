# Legacy Code Refactoring Plan

**Status:** 📋 Deferred - Future Enhancement
**Created:** December 16, 2025
**Priority:** Low (Code functions correctly, only ESLint warnings)

---

## Current Warnings (4)

| #   | File                          | Function                      | Issue                   | Severity |
| --- | ----------------------------- | ----------------------------- | ----------------------- | -------- |
| 1   | `script.js:92`                | `configureMarkedExtensions()` | 247 lines (max: 100)    | Medium   |
| 2   | `script.js:370`               | `setupEditor()`               | 1148 lines (max: 100)   | High     |
| 3   | `FolderBrowserService.js:429` | `createFile()`                | Complexity 17 (max: 15) | Low      |
| 4   | `MermaidService.js:139`       | `initialize()`                | 144 lines (max: 100)    | Low      |

---

## Why Deferred?

1. **No Functional Impact** - All code works correctly
2. **Risk vs Reward** - Major refactoring has regression risk
3. **Test Coverage is High** - 95.3% coverage provides safety net
4. **Zero Errors** - Only warnings, no blocking issues

---

## Proposed Architecture (For Future Implementation)

### Phase 1: Extract Marked Extensions

Create `src/js/config/markedExtensions.js`:

- `admonitionExtension`
- `mathBlockExtension`
- `mathEnvironmentExtension`
- `mathInlineExtension`
- `subscriptExtension`
- `superscriptExtension`

### Phase 2: Modularize setupEditor()

Create `src/js/features/` directory:

- `EditorManager.js` (~150 lines)
- `ViewModeManager.js` (~100 lines)
- `ZoomManager.js` (~80 lines)
- `SyncScrollManager.js` (~80 lines)
- `SplitViewManager.js` (~100 lines)
- `MobileManager.js` (~60 lines)
- `FolderBrowserUI.js` (~200 lines)
- `PDFExportUI.js` (~100 lines)
- `CustomizerUI.js` (~80 lines)
- `ZenModeManager.js` (~30 lines)

### Phase 3: Reduce createFile() Complexity

Extract helper methods:

- `_validateCreateFileInput()`
- `_ensureWritePermission()`
- `_checkFileExists()`
- `_performFileCreation()`

### Phase 4: Simplify MermaidService.initialize()

Split into:

- `_waitForNebulaCSS()`
- `_extractThemeColors()`
- `_configureMermaid()`

---

## Safety Measures (When Implemented)

1. **Feature Flags** - Use existing `featureFlags.js` for gradual rollout
2. **Incremental Extraction** - One module at a time
3. **Atomic Commits** - Each change in separate commit
4. **Test Verification** - Run full suite after each change
5. **Visual Regression** - Manual UI testing

---

## Estimated Effort

| Phase     | Time           | Priority |
| --------- | -------------- | -------- |
| Phase 1   | 2-3 hours      | Medium   |
| Phase 2   | 4-6 hours      | High     |
| Phase 3   | 1 hour         | Low      |
| Phase 4   | 1 hour         | Low      |
| **Total** | **8-11 hours** |          |

---

## Decision Log

**2025-12-16:** Decision to defer refactoring. Current state:

- 0 ESLint errors
- 4 ESLint warnings (legacy code)
- 95.3% test coverage
- 368 tests passing
- All functionality working

Refactoring deferred due to:

- High risk of breaking changes for a complex UI
- Code works correctly as-is
- Better to wait for a dedicated refactoring sprint
