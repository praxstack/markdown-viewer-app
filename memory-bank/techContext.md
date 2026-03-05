# Tech Context: Markdown Viewer Pro

## Technology Stack Overview

Markdown Viewer Pro is built using **vanilla web technologies** with carefully selected external libraries for specific functionality. The stack prioritizes simplicity, browser compatibility, and zero-setup deployment.

## Programming Languages & Runtimes

### HTML5

**Version**: HTML5 (Living Standard)

**Usage**: Document structure and semantic markup

**Key Features Used**:

- Semantic elements (`<textarea>`, `<button>`, `<select>`)
- Data attributes for configuration (`data-var`)
- Modal dialogs (custom implementation)
- Form elements for color inputs

**Rationale**: Industry standard, universal browser support, accessibility features

---

### CSS3

**Version**: CSS3 (Living Standard)

**Usage**: Visual styling and layout

**Key Features Used**:

- CSS Custom Properties (CSS Variables) for theming
- Flexbox for layout
- Grid for color picker layout
- Media queries for responsive design
- Pseudo-classes and pseudo-elements
- CSS animations/transitions
- Custom scrollbar styling

**Browser Compatibility**:

- Chrome 49+
- Firefox 31+
- Safari 9.1+
- Edge 15+

**Rationale**: Native styling with excellent performance, no preprocessor needed

---

### JavaScript ES6+

**Version**: ECMAScript 2015+ (ES6/ES2015 and later)

**Usage**: Application logic and interactivity

**Key ES6+ Features Used**:

- `const`/`let` declarations
- Arrow functions
- Template literals
- Destructuring assignment
- Promises
- `async`/`await` (for Mermaid rendering)
- Default parameters
- Spread operator
- Array methods (`forEach`, `map`, `filter`)

**Browser Compatibility**:

- Chrome 51+
- Firefox 54+
- Safari 10+
- Edge 15+

**Rationale**: Modern JavaScript features improve code quality while maintaining broad compatibility

**No Transpilation**: Code runs natively without Babel or TypeScript compilation

---

## Frameworks & Libraries

### Core Libraries

#### 1. Marked.js v11.0.0

**Purpose**: Markdown to HTML parsing

**Source**: <https://cdn.jsdelivr.net/npm/marked@11.0.0/marked.min.js>

**Features Used**:

- Full GFM (GitHub Flavored Markdown) support
- Configurable parsing options
- Safe HTML rendering
- Extension support (not currently used)

**API Usage**:

```javascript
marked.parse(markdownText); // Returns HTML string
```

**Why Marked.js**:

- ✅ Lightweight (~30KB minified)
- ✅ Fast parsing performance
- ✅ Active maintenance
- ✅ Standard-compliant
- ✅ No dependencies

**Alternatives Considered**:

- markdown-it: More complex API, heavier
- Showdown: Older, less actively maintained
- Remark: Requires more setup

---

#### 2. Prism.js v1.29.0

**Purpose**: Syntax highlighting for code blocks

**Source**: <https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js>

**Language Components Loaded**:

- Core: Base syntax highlighting engine
- Java: `prism-java.min.js`
- C++: `prism-cpp.min.js`
- Python: `prism-python.min.js`
- JavaScript: `prism-javascript.min.js`
- TypeScript: `prism-typescript.min.js`
- Rust: `prism-rust.min.js`
- Go: `prism-go.min.js`
- SQL: `prism-sql.min.js`

**Theme**: Prism Tomorrow (`prism-tomorrow.min.css`)

**API Usage**:

```javascript
Prism.highlightElement(codeBlock); // Highlights single element
```

**Why Prism.js**:

- ✅ Lightweight core (~2KB)
- ✅ Modular language loading
- ✅ Excellent syntax coverage
- ✅ Beautiful default themes
- ✅ Active community

**Alternatives Considered**:

- Highlight.js: Heavier, auto-detection overhead
- CodeMirror: Full editor, overkill
- Monaco Editor: Too heavy for highlighting only

---

#### 3. Mermaid.js v10.6.1

**Purpose**: Diagram rendering from text descriptions

**Source**: <https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js>

**Diagram Types Supported**:

- Flowcharts
- Sequence diagrams
- Class diagrams
- State diagrams
- Entity Relationship diagrams
- User Journey
- Gantt charts
- Pie charts
- Git graph

**Configuration**:

```javascript
mermaid.initialize({
  startOnLoad: false, // Manual rendering
  theme: 'default', // Theme selection
});
```

**API Usage**:

```javascript
mermaid.render(elementId, diagramCode).then(result => {
  element.innerHTML = result.svg;
});
```

**Why Mermaid.js**:

- ✅ Rich diagram support
- ✅ Text-based (version control friendly)
- ✅ Active development
- ✅ Professional output
- ✅ SVG rendering

**Alternatives Considered**:

- PlantUML: Requires Java backend
- D3.js: Too low-level for this use case
- Chart.js: Limited to charts only

---

### No Framework Decision

**Decision**: Use vanilla JavaScript instead of React/Vue/Angular

**Rationale**:

1. **Simplicity**: Single-page app with minimal state management
2. **Performance**: No framework overhead or virtual DOM
3. **Bundle Size**: Keep total JS minimal
4. **Learning Curve**: Standard web APIs are universal
5. **Portability**: No build step or toolchain

**Trade-offs Accepted**:

- Manual DOM manipulation (acceptable for this scale)
- No component reusability (not needed)
- No reactive state management (simple enough without)

---

## Development Tooling

### Code Editor

**Primary**: Visual Studio Code

**Extensions Used** (recommendations):

- ESLint: JavaScript linting
- Prettier: Code formatting
- Live Server: Local development server
- HTMLHint: HTML validation
- CSS Peek: CSS class navigation

### Version Control

**System**: Git

**Hosting**: GitHub (recommended)

**Branching Strategy**: Not enforced (single developer project)

**Commit Convention**: Conventional Commits (as per .clinerules)

### Linting & Formatting

**ESLint** (optional, not required):

```json
{
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 2021,
    "sourceType": "module"
  }
}
```

**Prettier** (optional, not required):

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 4,
  "trailingComma": "none"
}
```

**Note**: No build process means linting/formatting are developer choice, not enforced

### Build Tools

**Decision**: Zero build tools

**No Usage Of**:

- Webpack
- Rollup
- Parcel
- Vite
- Gulp
- Grunt

**Rationale**:

- Direct browser execution
- No transpilation needed
- No bundling needed
- Maximum simplicity

---

## Testing Frameworks & Strategies

### Current Testing Approach

**Manual Testing**: Primary testing method

**Test Browsers**:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Test Matrix**:

| Feature            | Chrome | Firefox | Safari | Edge |
| ------------------ | ------ | ------- | ------ | ---- |
| Markdown rendering | ✅     | ✅      | ✅     | ✅   |
| Theme switching    | ✅     | ✅      | ✅     | ✅   |
| Color customizer   | ✅     | ✅      | ✅     | ✅   |
| HTML export        | ✅     | ✅      | ✅     | ✅   |
| localStorage       | ✅     | ✅      | ✅     | ✅   |
| Mermaid diagrams   | ✅     | ✅      | ✅     | ✅   |

### Future Testing Strategy (If Implemented)

**Unit Testing Framework Options**:

- Jest: Industry standard, great for vanilla JS
- Mocha + Chai: Flexible, composable
- Vitest: Modern, fast

**Example Test Structure**:

````javascript
// renderMarkdown.test.js
describe('renderMarkdown', () => {
  it('should convert markdown to HTML', () => {
    const input = '# Hello';
    const output = renderMarkdown(input);
    expect(output).toContain('<h1>Hello</h1>');
  });

  it('should handle code blocks', () => {
    const input = '```js\nconst x = 5;\n```';
    const output = renderMarkdown(input);
    expect(output).toContain('<pre>');
  });
});
````

**E2E Testing Framework Options**:

- Playwright: Modern, cross-browser
- Cypress: Developer-friendly
- Puppeteer: Chrome-focused

---

## CI/CD Pipeline Configuration

### Current State

**CI/CD**: Not implemented (manual deployment)

**Deployment**: Copy files to web server or GitHub Pages

### Recommended CI/CD Setup (Future)

**GitHub Actions Example**:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Validate HTML
        run: |
          npm install -g htmlhint
          htmlhint index.html

      - name: Validate CSS
        run: |
          npm install -g stylelint
          stylelint "**/*.css"

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: .
```

**Benefits**:

- Automated deployment on push
- Pre-deployment validation
- Zero manual steps

---

## Environment Management

### Development Environment

**Requirements**:

- Modern web browser (Chrome/Firefox/Safari/Edge)
- Code editor (VS Code recommended)
- Local web server (optional but recommended)

**Local Development Server Options**:

1. **VS Code Live Server Extension**: One-click server
2. **Python**: `python -m http.server 8000`
3. **Node.js**: `npx http-server`
4. **PHP**: `php -S localhost:8000`

**Why Local Server**:

- Proper CORS handling
- Mimics production environment
- Hot reload capability

### Staging Environment

**Not Applicable**: No staging environment needed for static site

**Testing Approach**: Test locally across browsers

### Production Environment

**Hosting Options**:

1. **GitHub Pages**: Free, easy setup, custom domains
2. **Netlify**: Free tier, CDN included
3. **Vercel**: Free for personal projects
4. **Amazon S3 + CloudFront**: Scalable, professional
5. **Any static file hosting**: Apache, Nginx, etc.

**Requirements**:

- HTTP server capable of serving static files
- Support for custom error pages (optional)
- SSL/TLS certificate (recommended)

**Configuration**:

- No server-side configuration needed
- All files served as-is
- Optional: Set cache headers for theme files

---

## Deployment Architecture & Orchestration

### Deployment Model

**Architecture**: Static file hosting (JAMstack approach)

**Components**:

```
┌─────────────────────────────────────┐
│         CDN / Web Server            │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   Static Files                │ │
│  │   - index.html                │ │
│  │   - style.css                 │ │
│  │   - script.js                 │ │
│  │   - themes/*.css              │ │
│  │   - README.md                 │ │
│  │   - QUICK-REFERENCE.md        │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
              │
              ▼
        ┌──────────┐
        │  Users   │
        └──────────┘
```

**No Orchestration Needed**: Single-tier static deployment

---

## Observability Stack

### Logging

**Current**: Browser console logging only

**Log Levels Used**:

- `console.error()`: Critical failures
- `console.warn()`: Non-critical issues
- `console.log()`: Debugging (minimal in production)

**Production Logging**: Errors visible in browser DevTools

**No Server Logs**: Client-side only application

### Metrics

**Current**: No metrics collection

**Future Options** (if needed):

- Google Analytics (privacy concerns)
- Plausible Analytics (privacy-friendly)
- Self-hosted analytics (most privacy-preserving)

**Key Metrics to Track**:

- Page views
- Theme switches
- Export usage
- Error rates
- Performance timing

### Tracing

**Not Applicable**: Single-user, client-side application

**Browser DevTools**: Built-in performance profiling

### Alerting

**Not Applicable**: No backend to monitor

**Browser Error Monitoring Options** (if needed):

- Sentry: Error tracking service
- LogRocket: Session replay
- Rollbar: Error monitoring

---

## Security Tools & Compliance

### Security Measures

**Client-Side Security**:

1. **No Inline Scripts**: External JS file (CSP-friendly)
2. **Marked.js Sanitization**: Built-in HTML escaping
3. **No External Data**: No API calls to external services
4. **localStorage Only**: No cookies or external storage

**Content Security Policy** (Recommended):

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self';
               script-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com;
               style-src 'self' https://cdnjs.cloudflare.com 'unsafe-inline';
               img-src 'self' data: https:;"
/>
```

### Dependency Security

**Dependency Scanning**:

- Manual review of CDN-loaded libraries
- Version pinning in HTML
- Periodic update checks

**Known Vulnerabilities**: None in current versions

**Update Strategy**:

- Check for security advisories quarterly
- Test new versions before updating
- Document version changes

### Compliance Requirements

**GDPR Compliance**:

- ✅ No personal data collection
- ✅ No tracking or analytics
- ✅ No cookies
- ✅ Local storage only (user's device)
- ✅ No data transmission

**Accessibility Compliance**:

- Target: WCAG 2.1 AA
- Color contrast ratios tested
- Keyboard navigation supported
- Semantic HTML structure

---

## Performance Profiling Tools

### Browser DevTools

**Chrome DevTools**:

- **Performance Tab**: Record runtime performance
- **Network Tab**: Monitor resource loading
- **Lighthouse**: Automated audits
- **Memory Tab**: Profile memory usage

**Key Metrics**:

- First Contentful Paint (FCP): Target <1.5s
- Time to Interactive (TTI): Target <2s
- Total Blocking Time (TBT): Target <300ms
- Cumulative Layout Shift (CLS): Target <0.1

### Lighthouse Scores

**Target Scores**:

- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

**Current Performance Characteristics**:

- Initial Load: ~1.5s (including CDN resources)
- Markdown Render: <100ms typical
- Theme Switch: <50ms
- Export Generation: <500ms

---

## Library Versions & Migration Paths

### Version Management

**Current Versions**:

- Marked.js: 11.0.0
- Prism.js: 1.29.0
- Mermaid.js: 10.6.1

**Version Pinning Strategy**: Pin major versions, allow minor/patch updates

**Update Process**:

1. Review changelog for breaking changes
2. Update version in HTML
3. Test all functionality
4. Update memory bank documentation
5. Deploy to production

### Migration Paths

#### Marked.js Migration

**Current**: v11.x
**Next Major**: v12.x (when released)

**Breaking Changes to Watch**:

- API changes in parsing options
- Renderer modifications
- Extension system changes

**Migration Steps**:

1. Review v12 migration guide
2. Update API calls if needed
3. Test all markdown features
4. Update documentation

#### Prism.js Migration

**Current**: v1.29.x
**Next Major**: v2.x (if released)

**Stable API**: Prism has stable API, minimal breaking changes expected

#### Mermaid.js Migration

**Current**: v10.x
**Next Major**: v11.x (when released)

**Breaking Changes to Watch**:

- Configuration options
- Theme system changes
- Rendering API modifications

---

## Browser Compatibility Matrix

### Minimum Supported Versions

| Browser | Minimum Version  | Current Version Tested |
| ------- | ---------------- | ---------------------- |
| Chrome  | 51 (ES6 support) | 119                    |
| Firefox | 54 (ES6 support) | 119                    |
| Safari  | 10 (ES6 support) | 17                     |
| Edge    | 15 (ES6 support) | 119                    |

### Feature Support

| Feature       | Chrome | Firefox | Safari | Edge | Notes               |
| ------------- | ------ | ------- | ------ | ---- | ------------------- |
| CSS Variables | ✅     | ✅      | ✅     | ✅   | Core requirement    |
| ES6 Syntax    | ✅     | ✅      | ✅     | ✅   | Core requirement    |
| localStorage  | ✅     | ✅      | ✅     | ✅   | Core requirement    |
| Fetch API     | ✅     | ✅      | ✅     | ✅   | For export          |
| Flexbox       | ✅     | ✅      | ✅     | ✅   | Layout              |
| Grid          | ✅     | ✅      | ✅     | ✅   | Color picker layout |

### Unsupported Browsers

- ❌ Internet Explorer (all versions) - No ES6 support
- ❌ Opera Mini - Limited JavaScript support
- ❌ UC Browser - Inconsistent standards compliance

---

## Technology Decision Rationale

### Why Vanilla JavaScript?

1. **Zero Build Complexity**: No webpack, no babel, no config
2. **Maximum Portability**: Works anywhere with a browser
3. **Fast Load Times**: No framework overhead
4. **Long-term Stability**: Web standards don't break
5. **Learning Value**: Pure web platform APIs

### Why CDN Dependencies?

1. **No Build Step**: Direct browser loading
2. **Browser Caching**: Shared across sites
3. **Automatic Updates**: Can update versions easily
4. **Performance**: CDN edge locations
5. **Simplicity**: No npm, no package.json

### Why CSS Custom Properties?

1. **Runtime Theme Switching**: Change colors without reload
2. **Clean Separation**: Colors separate from structure
3. **Easy Customization**: Users can modify themes
4. **Performance**: Native browser feature
5. **Standard**: Widely supported

### Why localStorage?

1. **Simple API**: Synchronous, straightforward
2. **Sufficient Storage**: 5-10MB typical
3. **Universal Support**: All modern browsers
4. **Privacy**: Local-only, no transmission
5. **Perfect for Text**: Ideal for markdown content

---

## Future Technology Considerations

### Potential Additions (Not Planned)

**Service Worker**:

- Offline capability after first load
- Cache static resources
- Background sync

**Web Workers**:

- Offload markdown parsing
- Large document handling
- Background processing

**IndexedDB**:

- Larger storage capacity
- Structured data queries
- Multiple document management

**WebAssembly**:

- Faster markdown parsing
- Advanced diagram rendering
- Performance optimization

---

## Conclusion

Markdown Viewer Pro's technology stack represents a **deliberate minimalism** philosophy. By using vanilla web technologies with carefully selected libraries, the project achieves:

1. **Maximum Simplicity**: No build tools, no complex config
2. **Broad Compatibility**: Works on all modern browsers
3. **Easy Maintenance**: Standard technologies, clear code
4. **Great Performance**: No framework overhead
5. **Long-term Stability**: Built on web standards

This tech stack directly supports the product mission: instant, professional markdown editing without complexity or compromise.
