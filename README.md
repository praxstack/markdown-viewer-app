# 🚀 Markdown Viewer Pro

**A professional markdown viewer with modular architecture, comprehensive testing, and scalable design patterns.**

[![Tests](https://img.shields.io/badge/tests-155%20passing-brightgreen)](./tests)
[![Coverage](https://img.shields.io/badge/coverage-%3E85%25-brightgreen)]()
[![Code Quality](https://img.shields.io/badge/code%20quality-A+-brightgreen)]()
[![Zero Technical Debt](https://img.shields.io/badge/technical%20debt-zero-brightgreen)]()

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-%E2%9D%A4-pink?logo=github)](https://github.com/sponsors/PrakharMNNIT)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support-blue?logo=ko-fi)](https://ko-fi.com/praxlannister)
[![Razorpay](https://img.shields.io/badge/Razorpay-₹_Support-brightgreen)](https://razorpay.me/@prakharshekharparthasarthi)

---

## ✨ Features

### Core Functionality

- 📝 **Real-time Markdown Preview** - Instant rendering as you type
- 🎨 **12 Beautiful Themes** - 6 themes × 2 variants (light/dark) including Nebula theme
- 🎯 **Syntax Highlighting** - 20+ programming languages supported via PrismJS
- 📊 **Mermaid Diagrams** - Flowcharts, sequences, class diagrams, and more
- ➗ **LaTeX Math Support** - Full KaTeX rendering with `$...$`, `$$...$$`, `\(...\)`, and `\[...\]` delimiters
- 🎨 **Custom Theme Builder** - Create and save your own color schemes
- 📤 **Export Options** - HTML and PDF with theme preservation
- 👁️ **View Modes** - Editor-only, split-view, or preview-only
- 🔍 **Zoom Controls** - Scale preview from 50% to 200%
- 💾 **Auto-save** - Content automatically saved to localStorage

### 📁 Folder Browser (NEW)

- 📂 **Open Folder** - Browse and open local folders with markdown files
- 🗂️ **File Tree** - Navigate through nested directories
- 📄 **Quick File Access** - Click to open any markdown file
- ➕ **Create Files** - Create new markdown files with templates (empty, basic, readme, notes, blog)
- 🔄 **Folder Refresh** - Refresh folder contents without reopening
- 📐 **Resizable Sidebar** - Drag to resize, auto-collapse at edge
- ➡️ **Expand Button** - Quick sidebar expand with premium animations
- 💾 **State Persistence** - Sidebar width and collapsed state saved

### 🧘 Zen Mode (NEW)

- 🖥️ **Full Screen Preview** - 100% width and height distraction-free reading
- 🚫 **Hidden UI** - Toolbar, sidebar, and footer hidden
- ⌨️ **ESC to Exit** - Press Escape or click exit button to return
- 📖 **Centered Content** - Max-width 900px for optimal readability

### ↔️ Split View Resizer (NEW)

- 🔀 **Draggable Divider** - Resize editor and preview panels
- 📏 **Custom Ratio** - Set 20% to 80% split ratio
- 💾 **Ratio Persistence** - Split position saved across sessions
- 🎨 **Visual Feedback** - Animated handles on hover/drag

### 🔗 TOC Anchor Navigation (NEW)

- 📑 **Click-to-Navigate** - Click TOC links to smooth scroll to headings
- 🎯 **Smart Targeting** - 4-priority resolution (exact → normalized → GitHub → fuzzy)
- 🔙 **Browser History** - Back/forward navigation support
- ♿ **Accessibility** - Focus management and keyboard navigation
- 🔤 **Special Characters** - C++ → cpp, C# → csharp handling
- 🔗 **Deep Linking** - Direct URL hash support

### Professional Architecture

- 🏗️ **Modular Design** - 9 organized modules with clear separation of concerns
- 🧪 **Comprehensive Testing** - 155+ tests with >85% coverage
- 🔧 **Modern Tooling** - Vite, Vitest, ESLint, Prettier
- 📐 **Design Patterns** - Service layer, observer, dependency injection
- 🎯 **Zero Technical Debt** - Clean, maintainable, production-ready code
- 🤖 **AI Code Review** - Automated quality checks with every commit
- 🍎 **Safari Compatible** - Enterprise-grade CSS loading for all browsers
- 📱 **Mobile Responsive** - Optimized for iPhone/iPad/Android

---

## 📁 Project Structure

```
markdown-viewer-app/
├── index.html                      # Main HTML file
├── style.css                       # Base styles
├── script.js                       # Main application entry (~2300 lines)
├── animations.css                  # Premium animations
├── variables.css                   # CSS custom properties
├── package.json                    # Dependencies and scripts
├── vite.config.js                  # Vite configuration
├── vitest.config.js                # Vitest configuration
├── .eslintrc.js                    # ESLint rules
├── .prettierrc                     # Prettier configuration
│
├── src/js/                         # Source modules
│   ├── config/                     # Configuration files
│   │   ├── constants.js            # App constants (12 groups)
│   │   ├── errorMessages.js        # Centralized error messages
│   │   └── featureFlags.js         # Feature flag system
│   │
│   ├── utils/                      # Utility functions
│   │   ├── htmlHelpers.js          # HTML manipulation (4 functions)
│   │   ├── colorHelpers.js         # CSS variable helpers (6 functions)
│   │   └── validators.js           # Input validation (5 functions)
│   │
│   ├── services/                   # Business logic services
│   │   ├── FolderBrowserService.js # File system access (NEW)
│   │   ├── HTMLService.js          # HTML export
│   │   ├── MermaidService.js       # Mermaid diagram rendering
│   │   ├── PDFService.js           # PDF export with preview
│   │   └── PrismService.js         # Syntax highlighting
│   │
│   └── core/                       # Core application modules
│       ├── StorageManager.js       # LocalStorage abstraction (11 methods)
│       └── ThemeManager.js         # Theme management (11 methods)
│
├── tests/                          # Test suite (155+ tests)
│   ├── setup.js                    # Test configuration
│   ├── baseline/                   # Baseline functionality tests (98)
│   │   └── current-functionality.test.js
│   └── unit/                       # Unit tests (57+)
│       ├── config/                 # Config tests
│       │   └── errorMessages.test.js
│       ├── services/               # Service tests
│       │   ├── FolderBrowserService.test.js
│       │   ├── MermaidService.test.js
│       │   └── PrismService.test.js
│       ├── core/                   # Core module tests
│       │   ├── StorageManager.test.js
│       │   └── ThemeManager.test.js
│       └── utils/                  # Utility tests
│           ├── colorHelpers.test.js
│           └── validators.test.js
│
├── themes/                         # Theme files (15 files)
│   ├── default-light.css           # Professional light theme
│   ├── default-dark.css            # GitHub-inspired dark theme
│   ├── ocean-light.css             # Fresh cyan theme
│   ├── ocean-dark.css              # Deep navy theme
│   ├── neon-light.css              # Vibrant purple theme
│   ├── neon-dark.css               # Cyberpunk theme
│   ├── forest-light.css            # Natural green theme
│   ├── forest-dark.css             # Deep forest theme
│   ├── sunset-light.css            # Warm orange theme
│   ├── sunset-dark.css             # Sunset theme
│   ├── obsidian-light.css          # Clean minimal theme
│   ├── obsidian-dark.css           # Dark minimal theme
│   ├── nebula-light.css            # Cosmic purple theme (NEW)
│   ├── nebula-dark.css             # Deep space theme (NEW)
│   └── nebula-elements.css         # Shared Nebula elements
│
└── docs/                           # Documentation
    ├── 01-requirements/            # Feature specifications
    ├── 02-architecture/            # Architecture docs
    ├── 05-implementation/          # Implementation guides
    ├── 08-deployment/              # Deployment guides
    └── 09-temp/                    # Temporary docs
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Modern browser (Chrome 86+, Firefox 90+, Safari 14+, Edge 86+)

### Installation

```bash
# Clone the repository
git clone https://github.com/PrakharMNNIT/markdown-viewer-app.git
cd markdown-viewer-app

# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage

1. Open your browser to `http://localhost:5173`
2. Start typing markdown in the left panel
3. See live preview on the right
4. **Open Folder** - Click to browse local markdown files
5. **Zen Mode** - Click for distraction-free reading
6. Switch themes from the dropdown
7. Customize colors with the theme builder
8. Export to HTML or PDF

### Keyboard Shortcuts

| Shortcut       | Action        |
| -------------- | ------------- |
| `Ctrl/Cmd + +` | Zoom in       |
| `Ctrl/Cmd + -` | Zoom out      |
| `Ctrl/Cmd + 0` | Reset zoom    |
| `Escape`       | Exit Zen Mode |

---

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start Vite dev server with hot reload
npm run build        # Build production bundle
npm run preview      # Preview production build

# Testing
npm test             # Run all tests (155+ tests)
npm run test:ui      # Open Vitest UI dashboard
npm run test:coverage # Generate coverage report

# Code Quality
npm run lint         # Check code with ESLint
npm run format       # Format code with Prettier
npm run review       # Run AI code review
```

### Development Workflow

1. **Make changes** to source files
2. **Run tests**: `npm test` (ensure all pass)
3. **Check quality**: `npm run lint`
4. **AI review**: `npm run review` (analyze AI_REVIEW.md)
5. **Commit**: Use conventional commit format

---

## 🏗️ Architecture

### Design Patterns

- **Service Layer Pattern** - Isolated business logic (MermaidService, PrismService, FolderBrowserService)
- **Observer Pattern** - Theme change notifications to dependent services
- **Dependency Injection** - ThemeManager receives StorageManager instance
- **Facade Pattern** - Clean API abstractions for complex operations
- **Strategy Pattern** - Pluggable theme loading strategies
- **Singleton Pattern** - Anchor navigation heading slug map

### Module Organization

#### **config/** - Configuration and Constants

- `constants.js`: 12 constant groups (ZOOM, STORAGE_KEYS, THEMES, etc.)
- `errorMessages.js`: Centralized error message definitions
- `featureFlags.js`: Feature toggle system for safe rollouts

#### **utils/** - Reusable Utilities

- `htmlHelpers.js`: DOM manipulation, blob URLs, file downloads
- `colorHelpers.js`: CSS variable getters/setters
- `validators.js`: Input validation and constraints

#### **services/** - Business Logic

- `FolderBrowserService.js`: File System Access API integration
- `HTMLService.js`: HTML export with theme embedding
- `MermaidService.js`: Theme-aware diagram rendering (5 methods)
- `PDFService.js`: PDF generation with html2pdf.js
- `PrismService.js`: Syntax highlighting with error recovery (5 methods)

#### **core/** - Core Modules

- `StorageManager.js`: LocalStorage abstraction with error handling (11 methods)
- `ThemeManager.js`: Theme loading, switching, and persistence (11 methods)

### Integration Points

```javascript
// Main application entry (script.js)
import { StorageManager } from './src/js/core/StorageManager.js';
import { ThemeManager } from './src/js/core/ThemeManager.js';
import { MermaidService } from './src/js/services/MermaidService.js';
import { PrismService } from './src/js/services/PrismService.js';
import { FolderBrowserService } from './src/js/services/FolderBrowserService.js';
import { PDFService } from './src/js/services/PDFService.js';
import { HTMLService } from './src/js/services/HTMLService.js';

// Initialize with dependency injection
const storageManager = new StorageManager();
const themeManager = new ThemeManager(storageManager);
const mermaidService = new MermaidService();
const prismService = new PrismService();
const folderBrowserService = new FolderBrowserService(storageManager);
const pdfService = new PDFService();
const htmlService = new HTMLService();

// Configure observer pattern
themeManager.setThemeChangeListener(() => {
  mermaidService.reinitialize();
});
```

---

## 🧪 Testing

### Test Coverage

- **Total Tests**: 155+ (all passing ✅)
- **Baseline Tests**: 98 (functional integrity)
- **Unit Tests**: 57+ (module-specific)
  - Services: 23+ tests
  - Core: 34 tests
  - Utils: 20+ tests
  - Config: 5+ tests
- **Coverage**: >85% across all modules

### Test Structure

```bash
tests/
├── baseline/
│   └── current-functionality.test.js  # 98 integration tests
└── unit/
    ├── config/
    │   └── errorMessages.test.js
    ├── services/
    │   ├── FolderBrowserService.test.js
    │   ├── MermaidService.test.js
    │   └── PrismService.test.js
    ├── core/
    │   ├── StorageManager.test.js
    │   └── ThemeManager.test.js
    └── utils/
        ├── colorHelpers.test.js
        └── validators.test.js
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Open interactive UI
npm run test:ui

# Watch mode
npm test -- --watch
```

---

## 🎨 Themes

### Available Themes

| Theme            | Light | Dark | Best For                              |
| ---------------- | ----- | ---- | ------------------------------------- |
| **Default**      | ✅    | ✅   | Professional documents, general use   |
| **Ocean**        | ✅    | ✅   | Technical content, calming atmosphere |
| **Neon**         | ✅    | ✅   | Creative work, presentations          |
| **Forest**       | ✅    | ✅   | Environmental content, natural topics |
| **Sunset**       | ✅    | ✅   | Warm content, personal writing        |
| **Obsidian**     | ✅    | ✅   | Clean minimal design, focus mode      |
| **Nebula** (NEW) | ✅    | ✅   | Cosmic themes, sci-fi content         |

### Creating Custom Themes

#### Method 1: Visual Customizer

1. Click "🎨 Customize Colors"
2. Adjust colors with color pickers
3. Click "Save Custom Theme"

#### Method 2: CSS File

1. Copy existing theme file
2. Modify color values
3. Add to dropdown in `index.html`

```css
:root {
  /* Backgrounds */
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;

  /* Text */
  --text-primary: #212529;

  /* Headers */
  --h1-color: #2563eb;
  --h2-color: #7c3aed;

  /* Elements */
  --link-color: #2563eb;
  --code-bg: #f1f5f9;
  --blockquote-border: #7c3aed;
}
```

---

## 📱 Browser Compatibility

| Browser    | Version | Status                               |
| ---------- | ------- | ------------------------------------ |
| Chrome     | 86+     | ✅ Full support                      |
| Firefox    | 90+     | ✅ Full support (no folder browser)  |
| Safari     | 14+     | ✅ Full support (enterprise CSS fix) |
| Edge       | 86+     | ✅ Full support                      |
| Safari iOS | 14+     | ✅ Mobile optimized                  |

**Note**: Folder Browser feature requires File System Access API (Chrome/Edge 86+)

---

## 📚 API Reference

### FolderBrowserService (NEW)

```javascript
const folderService = new FolderBrowserService(storageManager);

// Check support
if (folderService.isSupported()) {
  // Open folder dialog
  const result = await folderService.openFolder();
  // result: { success, files, folderName, totalFiles }

  // Read file
  const fileResult = await folderService.readFile(fileHandle);
  // fileResult: { success, content, name, size }

  // Create new file
  const createResult = await folderService.createFile(dirHandle, filename, content);
  // createResult: { success, filename, fileHandle }

  // Refresh folder
  const refreshResult = await folderService.refreshFolder();
}
```

### StorageManager

```javascript
const storage = new StorageManager();

// Basic operations
storage.set('key', 'value'); // Store string
const value = storage.get('key'); // Retrieve string
storage.remove('key'); // Remove item
storage.has('key'); // Check existence

// JSON operations
storage.setJSON('data', { a: 1 }); // Store object
const obj = storage.getJSON('data'); // Retrieve object

// Utility methods
storage.getAllKeys(); // Get all keys
storage.getSize(); // Storage size in bytes
storage.clear(); // Clear all (USE WITH CAUTION)
storage.isAvailable(); // Check localStorage availability
```

### ThemeManager

```javascript
const themeManager = new ThemeManager(storageManager);

// Theme operations
await themeManager.loadTheme('ocean-dark'); // Load theme
themeManager.saveCustomTheme({ '--h1': '#f00' }); // Save custom
const current = themeManager.getCurrentTheme(); // Get current name
const colors = themeManager.getCurrentColors(); // Get all colors

// Observer pattern
themeManager.setThemeChangeListener(themeName => {
  console.log('Theme changed to:', themeName);
});

// Utility methods
const themes = themeManager.getAvailableThemes(); // List all themes
const exists = themeManager.themeExists('neon-dark'); // Check existence
```

### MermaidService

```javascript
const mermaidService = new MermaidService();

// Initialize with current theme
mermaidService.initialize();

// Render diagram
const svg = await mermaidService.render(
  'diagram-1',
  `
  graph TD
    A[Start] --> B[Process]
    B --> C[End]
`
);

// Check readiness and reinitialize
if (mermaidService.isReady()) {
  mermaidService.reinitialize(); // Call after theme change
}
```

### PDFService (NEW)

```javascript
const pdfService = new PDFService();

// Generate PDF with options
const blob = await pdfService.generatePDF(previewElement, {
  pageSize: 'A4',
  orientation: 'portrait',
  margins: [10, 10, 10, 10],
  fontSize: 12,
});

// Preview PDF in iframe
const url = await pdfService.previewPDF(previewElement, config);

// Download PDF
pdfService.downloadPDF();
```

---

## 🤝 Contributing

### Code Standards

- **ES6+ JavaScript** with module imports
- **JSDoc comments** for all public methods
- **Conventional Commits** for commit messages
- **Zero warnings** from ESLint
- **Prettier formatting** enforced
- **100% test pass rate** required

### Commit Message Format

```
<emoji> <type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`

**Emojis**:

- ✨ `feat` - New feature
- 🐛 `fix` - Bug fix
- 📝 `docs` - Documentation
- ♻️ `refactor` - Code refactoring
- ✅ `test` - Tests
- 🔧 `chore` - Maintenance

**Example**:

```
✨ feat(browser): add file creation with templates

- Implement createFile method in FolderBrowserService
- Add 5 templates (empty, basic, readme, notes, blog)
- Add create file modal with form validation
- Add unit tests for new functionality

Closes #45
```

### Pull Request Process

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes with tests
4. Run `npm test` (all must pass)
5. Run `npm run lint` (zero warnings)
6. Run `npm run review` (address AI feedback)
7. Commit with conventional format
8. Push to branch
9. Open Pull Request

---

## 🐛 Troubleshooting

### Common Issues

**Tests failing?**

```bash
npm test -- --reporter=verbose  # Detailed output
```

**Linting errors?**

```bash
npm run lint -- --fix  # Auto-fix issues
```

**Build errors?**

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Theme not loading?**

- Check browser console for errors
- Verify theme file exists in `themes/`
- Clear browser cache

**Mermaid diagrams not rendering?**

- Check internet connection (CDN required)
- Verify diagram syntax
- Check browser console for errors

**Folder Browser not working?**

- Requires Chrome 86+ or Edge 86+
- Firefox/Safari don't support File System Access API
- Check for permission prompts

**PDF export fails on Safari?**

- This is fixed in the latest version
- Uses fallback colors for Safari compatibility

---

## 📊 Performance

- **Bundle Size**: <500KB (gzipped) - includes Mermaid, KaTeX, Prism
- **First Paint**: <500ms
- **Time to Interactive**: <1s
- **Lighthouse Score**: 95+

---

## 🔒 Security

- No dependencies with known vulnerabilities
- Input sanitization via DOMPurify
- XSS prevention with proper encoding
- CSP headers recommended for production
- Regular security audits with `npm audit`
- File system access scoped to selected folders only

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- [Marked.js](https://marked.js.org/) - Markdown parsing
- [Prism.js](https://prismjs.com/) - Syntax highlighting
- [Mermaid.js](https://mermaid-js.github.io/) - Diagram rendering
- [KaTeX](https://katex.org/) - LaTeX math rendering
- [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) - PDF generation
- [DOMPurify](https://github.com/cure53/DOMPurify) - HTML sanitization
- [Vite](https://vitejs.dev/) - Build tooling
- [Vitest](https://vitest.dev/) - Testing framework

---

## 📞 Support

- 📖 [Documentation](./docs/README.md)
- 🏗️ [Architecture Guide](./docs/02-architecture/architecture.md)
- 🐛 [Issue Tracker](https://github.com/PrakharMNNIT/markdown-viewer-app/issues)
- 💬 [Discussions](https://github.com/PrakharMNNIT/markdown-viewer-app/discussions)

---

---

## 💖 Support This Project

If you find Markdown Viewer Pro useful, consider supporting its development:

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-%E2%9D%A4-pink?logo=github&style=for-the-badge)](https://github.com/sponsors/PrakharMNNIT)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support-blue?logo=ko-fi&style=for-the-badge)](https://ko-fi.com/praxlannister)
[![Razorpay](https://img.shields.io/badge/Razorpay-₹_UPI-brightgreen?style=for-the-badge)](https://razorpay.me/@prakharshekharparthasarthi)

### Support Tiers

| Tier        | Amount (USD) | Amount (INR) | Perks                 |
| ----------- | ------------ | ------------ | --------------------- |
| ☕ Coffee   | $1           | ₹50          | My gratitude!         |
| 🍕 Pizza    | $5           | ₹250         | Name in SUPPORTERS.md |
| 🎉 Patron   | $20          | ₹1000        | Name in README        |
| 💎 Champion | $50+         | ₹2500+       | Logo in README        |

Your support helps maintain and improve this project. Every contribution is appreciated! 🙏

---

**Built with ❤️ using modern JavaScript, comprehensive testing, and scalable architecture.**

**Status**: Production-ready ✅ | Tests: 155+/155+ passing ✅ | Technical Debt: Zero ✅
