# 📋 Release Notes - Markdown Viewer Pro

## Current Version: 1.0.0

**Release Date**: December 19, 2025

---

## 🎉 What's New

### Major Features

#### 📁 Folder Browser

A powerful local file system integration for browsing and managing markdown files.

- **Open Folder** - Browse local folders using File System Access API
- **File Tree Navigation** - Click to navigate through nested directories
- **Create Files** - Create new markdown files with 5 templates (empty, basic, readme, notes, blog)
- **Folder Refresh** - Refresh contents without reopening the folder
- **Resizable Sidebar** - Drag to resize, auto-collapse when dragged to edge
- **Expand Button** - Premium animated button to quickly expand collapsed sidebar
- **State Persistence** - Sidebar width and collapsed state saved to localStorage

#### 🧘 Zen Mode

Distraction-free reading mode for focused content consumption.

- **Full Screen Preview** - 100% width and height coverage
- **Hidden UI** - Toolbar, sidebar, and footer automatically hidden
- **ESC to Exit** - Press Escape or click exit button to return
- **Centered Content** - Max-width 900px for optimal readability

#### ↔️ Split View Resizer

Flexible panel sizing for comfortable editing.

- **Draggable Divider** - Resize editor and preview panels
- **Custom Ratio** - Set anywhere from 20% to 80%
- **Ratio Persistence** - Split position saved across sessions
- **Visual Feedback** - Animated handles on hover and drag

#### 🔗 TOC Anchor Navigation

Smart in-document navigation for table of contents links.

- **Smooth Scrolling** - Click TOC links to scroll to headings
- **4-Priority Resolution** - Exact → normalized → GitHub-style → fuzzy matching
- **Browser History** - Back/forward navigation support
- **Accessibility** - Focus management and keyboard navigation
- **Special Characters** - C++ → cpp, C# → csharp handling
- **Deep Linking** - Direct URL hash support (#section-name)

#### ➗ LaTeX Math Support (Enhanced)

Full mathematical formula rendering with multiple delimiter formats.

- **Inline Math** - `$...$` and `\(...\)` delimiters
- **Display Math** - `$$...$$` and `\[...\]` delimiters
- **LaTeX Environments** - Support for align, gather, and more
- **KaTeX Rendering** - Fast, high-quality math typesetting

---

## 🐛 Bug Fixes

### Safari Compatibility

- **CSS Loading Fix** - Enterprise-grade CSS loading for Safari browsers
- **Color Parsing Fix** - Resolved color parsing errors on Safari
- **iPhone Preview Fix** - Fixed preview rendering issues on Safari iOS
- **PDF Export Fix** - Fixed color-mix() function compatibility

### UI/UX Fixes

- **Sidebar Collapse Layout** - Fixed blank space when sidebar collapses in split view
- **Sidebar Resize in Split View** - Resize handle now works correctly in split view mode
- **Resize Handle UX** - Improved drag handle visibility and interaction
- **Zen Mode Full Screen** - Fixed 100% width/height coverage
- **Zen Mode Resizer** - Hide split resizer in Zen mode
- **Mobile Layout** - Improved responsive design for mobile devices
- **PDF Modal** - Better modal sizing and controls on mobile

### Core Fixes

- **Active File Refresh** - Refresh folder now updates the content of currently open file
- **Theme Restoration** - Proper theme loading on page reload

---

## ✨ Improvements

### Testing & Quality

- **Zero Technical Debt** - All ESLint errors fixed
- **Comprehensive Tests** - 155+ tests with >85% coverage
- **Centralized Error Messages** - All error strings in errorMessages.js
- **New Test Suites** - validators.test.js, colorHelpers.test.js, errorMessages.test.js

### Performance

- **Optimized Rendering** - Faster markdown parsing and preview updates
- **Lazy Loading** - Mermaid diagrams render on demand
- **Debounced Input** - 300ms debounce on editor input

### Code Quality

- **Modular Architecture** - 9 well-organized modules
- **Service Layer Pattern** - Clear separation of concerns
- **Documentation** - Comprehensive JSDoc comments

---

## 📦 New Dependencies

| Package           | Purpose                        |
| ----------------- | ------------------------------ |
| `marked-footnote` | Footnote support in markdown   |
| `dompurify`       | HTML sanitization for security |

---

## 🔧 Technical Changes

### New Services

- `FolderBrowserService.js` - File System Access API wrapper
- `HTMLService.js` - HTML export functionality
- `PDFService.js` - PDF generation and preview

### New Config Files

- `errorMessages.js` - Centralized error message definitions

### New Test Files

- `FolderBrowserService.test.js`
- `errorMessages.test.js`
- `validators.test.js`
- `colorHelpers.test.js`

### CSS Updates

- `animations.css` - Premium animations for UI elements
- `variables.css` - New CSS custom properties for theming

---

## 📝 Changelog by Commit

### December 2025

```
eabf346 - ✨ feat(toc): implement anchor navigation for TOC links
46d4457 - 📝 docs: add legacy code refactoring plan and update memory bank
60ec56c - ✅ chore: achieve zero technical debt - fix ESLint errors and increase test coverage
fae4bb8 - ✨ feat(sidebar): add expand button with premium animations
ca1a798 - 🐛 fix(folder-browser): refresh active file content and fix sidebar collapse layout
98d0b61 - 🐛 fix(ui): fix blank space when sidebar collapses in split view
c3dc8ad - 🐛 fix(ui): improve sidebar collapse and split view layout
2fd32e7 - ✅ test(coverage): add comprehensive errorMessages tests
fe1b400 - 🐛 fix(ui): sidebar resize now works in split view mode
d991bd3 - 🐛 fix(ui): improve sidebar resize handle UX
292bc1e - 🐛 fix(ui): zen mode full screen 100% width/height
75ab176 - 🐛 fix(ui): zen mode shows only preview + hide split resizer
3a31114 - ✅ test(coverage): add comprehensive tests for validators and colorHelpers
f3f1f48 - ♻️ refactor(safari): enterprise-grade CSS loading fix for Mermaid
874a0b5 - 🐛 fix(safari): resolve color parsing error on Safari
1568915 - 🐛 fix(mobile): resolve Safari iPhone preview rendering issue
a8c0556 - ✅ fix(tests): resolve all failing test cases
c70842a - ✅ test(browser): add unit tests and centralize error messages
ef9746f - ✨ feat(browser): improve file creation with code review fixes
c5cddf8 - ✨ feat(browser): add file creation and folder refresh features
ce49ba0 - 🐛 fix(pdf): Safari color compatibility for PDF generation
62db7b0 - 📱 fix(mobile): improve mobile layout and PDF modal
99e3702 - ✨ feat(split-view): add draggable resizer for editor/preview panels
576afea - fix: add support for latex delimiters \[ and \(
9284410 - Fix Nebula Light theme variables, white spot artifact, and Zen Mode
c8d43b2 - Fix export crash, styling issues, and white margins in PDF
97d0ef4 - fix(pdf): resolve html2canvas color-mix parsing error
b9f2f36 - 📝 docs(review): update AI code review documentation
46ea09e - 🐛 fix(ui): fix sidebar toggle button and remove duplicate close button
7fc20f1 - feat(sidebar): unify toggle logic and smooth collapse animation
```

---

## 🚀 Upgrade Guide

### From Previous Versions

1. **Pull latest changes**

   ```bash
   git pull origin main
   ```

2. **Install new dependencies**

   ```bash
   npm install
   ```

3. **Clear browser cache** - Required for CSS and theme updates

4. **Test the build**
   ```bash
   npm run build
   npm run preview
   ```

### Breaking Changes

None in this release.

---

## 🔮 Roadmap

### Planned for v1.1.0

- [ ] Real-time collaboration support
- [ ] Cloud storage integration (Google Drive, Dropbox)
- [ ] Plugin system for custom extensions
- [ ] Vim/Emacs keybinding modes
- [ ] Presentation mode (slide-by-slide)

### Planned for v1.2.0

- [ ] Image paste and upload
- [ ] Version history for documents
- [ ] AI-powered writing assistance
- [ ] Collaborative editing

---

## 🙏 Contributors

- [PrakharMNNIT](https://github.com/PrakharMNNIT) - Lead Developer

---

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details.

---

**Thank you for using Markdown Viewer Pro!** 🎉

For issues or feature requests, please visit our [GitHub Issues](https://github.com/PrakharMNNIT/markdown-viewer-app/issues).
