# System Patterns: Markdown Viewer Pro

## Architecture Overview

Markdown Viewer Pro follows a **client-side monolithic architecture** with strict separation of concerns. The entire application runs in the browser without any backend dependencies.

### Core Architectural Principles

1. **Zero Backend**: Pure client-side execution using browser APIs
2. **Separation of Concerns**: HTML (structure), CSS (presentation), JavaScript (behavior)
3. **Progressive Enhancement**: Core functionality works without JavaScript, enhanced experience with it
4. **Modular Theming**: CSS custom properties enable runtime theme switching
5. **Stateless Design**: No server-side state, all persistence via browser localStorage

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Browser Window                       │
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │              Toolbar Component                      │ │
│  │  [Theme Selector] [Customize] [Export]             │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌────────────────────┐  ┌─────────────────────────────┐│
│  │  Editor Panel      │  │    Preview Panel            ││
│  │                    │  │                             ││
│  │  ┌──────────────┐ │  │  ┌───────────────────────┐ ││
│  │  │              │ │  │  │   Rendered HTML       │ ││
│  │  │   Textarea   │ │  │  │   + Syntax Highlight  │ ││
│  │  │   (Markdown) │ │  │  │   + Mermaid Diagrams  │ ││
│  │  │              │ │  │  │                       │ ││
│  │  └──────────────┘ │  │  └───────────────────────┘ ││
│  └────────────────────┘  └─────────────────────────────┘│
│                                                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │          Theme Customizer Modal (Hidden)           │ │
│  │  [Color Pickers] [Reset] [Save Custom Theme]      │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   ┌──────────┐       ┌──────────┐        ┌──────────┐
   │ Marked.js│       │ Prism.js │        │ Mermaid  │
   │ (Parser) │       │ (Syntax) │        │(Diagrams)│
   └──────────┘       └──────────┘        └──────────┘
         │                    │                    │
         └────────────────────┴────────────────────┘
                              │
                              ▼
                      ┌───────────────┐
                      │  localStorage │
                      │  - content    │
                      │  - theme      │
                      │  - custom     │
                      └───────────────┘
```

## Component Architecture

### 1. Presentation Layer (HTML/CSS)

**Responsibilities**:

- Define semantic document structure
- Provide accessible HTML elements
- Implement responsive layout grid
- Establish visual styling framework

**Key Components**:

- `index.html`: Single-page application structure
- `style.css`: Layout, typography, component styling
- `themes/*.css`: Color palette definitions via CSS custom properties

**Design Patterns**:

- **CSS Custom Properties Pattern**: All colors defined as CSS variables
- **BEM-like Naming**: Component-based class naming (.toolbar, .editor-container)
- **Mobile-First Responsive**: Breakpoints for tablet/desktop layouts

### 2. Business Logic Layer (JavaScript)

**Responsibilities**:

- Markdown parsing and rendering
- Theme management and switching
- User interaction handling
- State persistence
- Export functionality

**Key Modules** (all in `script.js`):

- `initializeApp()`: Bootstrap and dependency checking
- `setupEditor()`: Editor initialization and event binding
- `renderMarkdown()`: Markdown-to-HTML conversion pipeline
- `changeTheme()`: Theme loading and application
- `exportHTML()`: HTML document generation
- Event handlers for user interactions

**Design Patterns**:

- **Module Pattern**: Functions encapsulate specific responsibilities
- **Event-Driven Architecture**: User actions trigger event handlers
- **Pipeline Pattern**: Markdown → HTML → Syntax Highlighting → Mermaid
- **Observer Pattern**: Input event triggers preview update

### 3. Data Layer (localStorage)

**Responsibilities**:

- Persist user content across sessions
- Store theme preferences
- Save custom theme configurations

**Data Schema**:

```javascript
localStorage = {
  markdownContent: 'string', // Current editor content
  selectedTheme: 'string', // Active theme identifier
  customTheme: 'JSON string', // Custom color palette object
};
```

## Data Flow Architecture

### Primary Data Flows

#### 1. Markdown Rendering Flow

```
User Types
    ↓
Textarea Input Event
    ↓
renderMarkdown()
    ↓
marked.parse(text)
    ↓
Mermaid Block Detection & Replacement
    ↓
Set innerHTML
    ↓
Prism.highlightElement()
    ↓
Mermaid.render() (async)
    ↓
Visual Update
    ↓
localStorage.setItem()
```

#### 2. Theme Switching Flow

```
User Selects Theme
    ↓
Change Event Handler
    ↓
changeTheme(themeName)
    ↓
    ├─→ Custom Theme?
    │      ↓
    │   Load from localStorage
    │      ↓
    │   Apply inline CSS variables
    │
    └─→ Built-in Theme?
           ↓
        Update <link> href
           ↓
        Browser loads CSS file
           ↓
        Visual Update
    ↓
localStorage.setItem()
```

#### 3. Export Flow

```
User Clicks Export
    ↓
exportHTML()
    ↓
    ├─→ Fetch Current Theme CSS
    │      ↓
    │   Theme file or custom colors
    │
    └─→ Generate HTML Template
           ↓
        Embed CSS + Content
           ↓
        Create Blob
           ↓
        Trigger Download
```

## Domain Boundaries

### Core Domain: Markdown Processing

**Responsibilities**:

- Parse markdown syntax
- Generate HTML output
- Apply syntax highlighting
- Render diagrams

**Dependencies**: Marked.js, Prism.js, Mermaid.js

### Supporting Domain: Theme Management

**Responsibilities**:

- Load theme CSS files
- Apply custom color values
- Persist theme preferences
- Provide theme customization UI

**Dependencies**: CSS custom properties, localStorage

### Supporting Domain: User Interface

**Responsibilities**:

- Handle user input
- Display content
- Manage modal dialogs
- Provide controls

**Dependencies**: DOM APIs, Event system

### Supporting Domain: Persistence

**Responsibilities**:

- Save content to localStorage
- Restore content on load
- Manage storage quota
- Handle storage errors

**Dependencies**: localStorage API

## State Management Strategy

### Application State

**State Location**: Browser memory (DOM + JavaScript variables)

**State Components**:

1. **Editor State**: Textarea value (ephemeral, backed by localStorage)
2. **Preview State**: Rendered HTML (derived from editor state)
3. **Theme State**: Active theme identifier (persisted)
4. **Custom Theme State**: Color values JSON (persisted)
5. **Modal State**: Open/closed (ephemeral)

**State Flow**:

```
User Input → State Update → DOM Update → localStorage Sync
```

**State Persistence Strategy**:

- **Eager Write**: Save to localStorage on every input event
- **Lazy Read**: Load from localStorage only on page load
- **No Versioning**: Overwrite strategy (last write wins)

## Inter-Component Communication

### Communication Patterns

1. **DOM Events**: User interactions propagate through event system
2. **Function Calls**: Direct function invocation for synchronous operations
3. **Callbacks**: Asynchronous operations use callbacks (Mermaid rendering)
4. **Global State**: Shared access to localStorage

### Event Flow Diagram

```
┌──────────────┐
│ User Action  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Event Listener│
└──────┬────────┘
       │
       ▼
┌──────────────┐
│ Handler Fn   │
└──────┬────────┘
       │
       ├─→ Update DOM
       ├─→ Call Helper Fn
       └─→ Save to Storage
```

## Dependency Management Philosophy

### External Dependencies

**Philosophy**: Minimize dependencies, prefer battle-tested libraries, use CDN delivery

**Core Dependencies**:

1. **Marked.js** (v11.0.0): Markdown parsing
   - Rationale: Industry standard, reliable, actively maintained
   - Alternative considered: markdown-it (more complex)

2. **Prism.js** (v1.29.0): Syntax highlighting
   - Rationale: Lightweight, extensive language support
   - Alternative considered: Highlight.js (heavier)

3. **Mermaid.js** (v10.6.1): Diagram rendering
   - Rationale: Rich diagram types, good documentation
   - Alternative considered: PlantUML (requires backend)

**Dependency Loading Strategy**:

- CDN-first approach (jsDelivr/Cloudflare)
- `defer` attribute for non-blocking load
- Dependency availability check before initialization
- Graceful degradation if CDN fails

### Zero Build Dependencies

**Philosophy**: No build step, no npm packages, no compilation

**Benefits**:

- Instant deployment (single file)
- Zero setup time
- No version conflicts
- Maximum portability

## Concurrency & Asynchronous Patterns

### Asynchronous Operations

1. **Mermaid Diagram Rendering**: Async with promise-based API
2. **Theme CSS Loading**: Async via browser's CSS engine
3. **Export Theme Fetching**: Async fetch API call

### Concurrency Handling

**Pattern**: Callback-based for Mermaid, promise-based for fetch

```javascript
// Mermaid rendering - async callback
mermaid
  .render(id, code)
  .then(result => {
    element.innerHTML = result.svg;
  })
  .catch(err => {
    element.innerHTML = errorMessage;
  });

// Theme fetching - promise chain
fetch(`themes/${themeName}.css`)
  .then(response => response.text())
  .then(css => generateHTML(css))
  .catch(err => fallbackGeneration());
```

**Race Condition Prevention**:

- Mermaid renders have unique IDs
- Theme changes clear previous inline styles
- No concurrent writes to localStorage

## Error Propagation & Recovery

### Error Handling Strategy

**Philosophy**: Fail gracefully, provide user feedback, maintain functionality

### Error Categories & Handling

#### 1. Dependency Load Failure

```javascript
if (typeof marked === 'undefined') {
  console.error('Required libraries not loaded. Retrying...');
  setTimeout(initializeApp, 100); // Retry
  return;
}
```

**Recovery**: Retry mechanism with timeout

#### 2. Markdown Parsing Error

```javascript
try {
  html = marked.parse(markdownText);
} catch (error) {
  console.error('Render error:', error);
  preview.innerHTML = '<p style="color: red;">Error rendering markdown</p>';
}
```

**Recovery**: Display error message, maintain UI

#### 3. Mermaid Rendering Error

```javascript
mermaid.render(id, code).catch(err => {
  element.innerHTML = '<p style="color: red;">Mermaid diagram error</p>';
});
```

**Recovery**: Show error message, continue with other content

#### 4. localStorage Quota Exceeded

```javascript
try {
  localStorage.setItem('markdownContent', text);
} catch (e) {
  if (e.name === 'QuotaExceededError') {
    console.warn('Storage quota exceeded');
    // Notify user (future enhancement)
  }
}
```

**Recovery**: Silent failure with console warning

#### 5. Export Failure

```javascript
fetch(`themes/${theme}.css`).catch(err => {
  console.error('Error loading theme:', err);
  generateHTML(); // Continue without theme CSS
});
```

**Recovery**: Generate export without theme styling

### Error Logging

**Strategy**: Console logging only (no external error tracking)

**Log Levels**:

- `console.error()`: Critical failures
- `console.warn()`: Non-critical issues
- `console.log()`: Debugging information (minimal in production)

## Scalability Considerations

### Performance Optimization

#### 1. Rendering Performance

**Challenge**: Large documents (>5000 lines) may cause lag

**Strategy**:

- Debouncing not implemented (instant feedback prioritized)
- Browser's event loop handles rendering queue
- Virtual scrolling not needed (browser handles well)

**Load Characteristics**: O(n) where n = document length

#### 2. Theme Switching Performance

**Strategy**: Instant switching via CSS file replacement

**Load Characteristics**: O(1) - just a file reference change

#### 3. localStorage Performance

**Strategy**: Synchronous writes are acceptable for this use case

**Constraint**: 5MB typical localStorage limit

### Horizontal Scalability

**N/A**: Single-user, client-side application. No horizontal scaling needed.

### Vertical Scalability

**Limitations**:

- Browser memory limits (typically 1-2GB per tab)
- localStorage quota (5-10MB depending on browser)
- Maximum document size: ~10,000 lines practical limit

## Design Patterns Applied

### 1. Observer Pattern

**Usage**: Editor input triggers preview updates

```javascript
editor.addEventListener('input', renderMarkdown);
```

### 2. Strategy Pattern

**Usage**: Theme loading strategy (built-in vs custom)

```javascript
if (themeName === 'custom') {
  applyCustomTheme();
} else {
  loadThemeFile(themeName);
}
```

### 3. Template Method Pattern

**Usage**: Export HTML generation

```javascript
function generateHTML() {
  const template = `<!DOCTYPE html>...`;
  // Fill in theme and content
  return template;
}
```

### 4. Singleton Pattern

**Usage**: Single application instance per page

```javascript
window.addEventListener('DOMContentLoaded', function () {
  initializeApp(); // Called once
});
```

### 5. Facade Pattern

**Usage**: Simplified API over complex libraries

```javascript
function renderMarkdown() {
  // Facade over Marked, Prism, Mermaid
  const html = marked.parse(text);
  applyPrism(html);
  renderMermaid(html);
}
```

## Architectural Decisions (ADRs)

### ADR-001: Client-Side Only Architecture

**Decision**: Implement as pure client-side application with no backend

**Rationale**:

- Eliminates deployment complexity
- Ensures user privacy (no data transmission)
- Enables offline functionality
- Simplifies architecture

**Trade-offs**:

- ✅ Gains: Simplicity, privacy, portability
- ❌ Loses: Collaboration features, cloud sync

---

### ADR-002: CSS Custom Properties for Theming

**Decision**: Use CSS custom properties instead of class-based theming

**Rationale**:

- Runtime theme switching without reloading
- Easy custom theme creation
- Clean separation between structure and color

**Trade-offs**:

- ✅ Gains: Flexibility, performance, simplicity
- ❌ Loses: IE11 support (acceptable)

---

### ADR-003: CDN Dependencies

**Decision**: Load libraries from CDN instead of bundling

**Rationale**:

- Keeps file size minimal
- Leverages browser caching across sites
- No build step required
- Easy version updates

**Trade-offs**:

- ✅ Gains: Simplicity, smaller files
- ❌ Loses: Guaranteed offline first-load

---

### ADR-004: localStorage for Persistence

**Decision**: Use localStorage instead of IndexedDB or files

**Rationale**:

- Simple synchronous API
- Sufficient storage (5MB+)
- Universal browser support
- Perfect for text content

**Trade-offs**:

- ✅ Gains: Simplicity, reliability
- ❌ Loses: Large file support, structured querying

---

### ADR-005: Single File Architecture

**Decision**: Keep HTML, CSS, JS separate but reference-minimal

**Rationale**:

- Clear separation of concerns
- Easy to understand and modify
- Standard web development practices
- Good for version control

**Trade-offs**:

- ✅ Gains: Maintainability, clarity
- ❌ Loses: Single-file portability (acceptable)

## Code Quality Standards

### Naming Conventions

- **Variables**: camelCase (`themeSelector`, `markdownText`)
- **Functions**: camelCase with verb prefix (`renderMarkdown`, `changeTheme`)
- **CSS Classes**: kebab-case with component prefix (`.toolbar`, `.editor-container`)
- **CSS Variables**: kebab-case with double dash (`--bg-primary`, `--link-color`)

### Function Design

- **Single Responsibility**: Each function does one thing well
- **Maximum Length**: ~50 lines per function (guideline, not rule)
- **Maximum Complexity**: <10 cyclomatic complexity
- **Pure Functions**: Prefer pure functions where possible
- **Side Effects**: Document side effects in comments

### Error Handling

- **Try-Catch**: Wrap risky operations
- **User Feedback**: Display errors in UI where appropriate
- **Console Logging**: Always log errors for debugging
- **Graceful Degradation**: Continue operating despite errors

### Documentation

- **Inline Comments**: Explain "why" not "what"
- **Function Headers**: Describe purpose, params, returns
- **Complex Logic**: Extra comments for non-obvious code
- **ADRs**: Document architectural decisions

## Testing Strategy

### Current State

**Manual Testing**: All testing done manually in browser

**Test Coverage**:

- ✅ Functional testing across browsers
- ✅ Theme switching validation
- ✅ Export functionality verification
- ✅ Markdown rendering accuracy

### Future Testing Strategy

**Unit Testing** (if implemented):

- Markdown parsing accuracy
- Theme loading logic
- localStorage operations
- Export generation

**Integration Testing**:

- End-to-end user workflows
- Cross-browser compatibility
- Performance benchmarks

**Acceptance Testing**:

- User story validation
- Accessibility compliance
- Visual regression testing

## Conclusion

Markdown Viewer Pro's architecture prioritizes simplicity, maintainability, and user experience. The client-side monolithic design with strict separation of concerns enables rapid development while maintaining code quality. The modular theme system and clean data flow patterns ensure the application remains easy to understand, modify, and extend.

Key architectural strengths:

1. Zero backend complexity
2. Clear separation of concerns
3. Minimal dependencies
4. Graceful error handling
5. Performance-optimized rendering

This architecture supports the product vision of providing an instant, beautiful, privacy-respecting markdown editing experience.
