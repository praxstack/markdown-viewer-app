# Quick Reference - File Structure

## 📁 Your Markdown Viewer App Structure

```
markdown-viewer-app/
│
├── 📄 index.html              ← Open this file to start!
│
├── 🎨 style.css               ← Base styling (layout, spacing)
│
├── ⚙️  script.js               ← All functionality
│
├── 📖 README.md               ← Full documentation
│
└── 📁 themes/                 ← Theme directory (10 themes)
    │
    ├── default-light.css      ← 🌞 Professional light theme
    ├── default-dark.css       ← 🌙 GitHub-style dark theme
    │
    ├── ocean-light.css        ← 🌊 Light cyan theme
    ├── ocean-dark.css         ← 🌊 Deep ocean theme
    │
    ├── neon-light.css         ← 💜 Vibrant light neon
    ├── neon-dark.css          ← 💜 Cyberpunk dark neon
    │
    ├── forest-light.css       ← 🌲 Natural light green
    ├── forest-dark.css        ← 🌲 Deep forest green
    │
    ├── sunset-light.css       ← 🌅 Warm light orange
    └── sunset-dark.css        ← 🌅 Deep sunset theme
```

## 🚀 Getting Started

### Step 1: Open the App

Double-click `index.html` in your browser

### Step 2: Start Writing

Type markdown in the left panel → See preview on right

### Step 3: Choose a Theme

Use the dropdown menu to select from 10 themes

### Step 4: Customize (Optional)

Click "🎨 Customize Colors" to modify any theme

### Step 5: Export

Click "💾 Export HTML" to save your work

## 🎨 Theme Overview

| Theme   | Light          | Dark            | Best For          |
| ------- | -------------- | --------------- | ----------------- |
| Default | ✅ Blue/White  | ✅ Gray/Blue    | Professional docs |
| Ocean   | ✅ Cyan/Blue   | ✅ Navy/Cyan    | Technical content |
| Neon    | ✅ Purple/Pink | ✅ Pink/Purple  | Creative work     |
| Forest  | ✅ Light Green | ✅ Dark Green   | Nature content    |
| Sunset  | ✅ Orange/Red  | ✅ Brown/Orange | Personal writing  |

## 📝 File Details

### index.html (Main File)

- Contains the HTML structure
- Theme selector with all options
- Modal for color customization
- Links to style.css and script.js

### style.css (Base Styles)

- Layout and positioning
- Typography and spacing
- Component styling
- No colors (uses CSS variables from themes)

### script.js (Functionality)

- Markdown parsing with Marked.js
- Syntax highlighting with Prism.js
- Mermaid diagram rendering
- Theme switching logic
- Color customizer
- Export functionality
- Auto-save to browser

### themes/\*.css (Color Definitions)

- Each file defines only CSS custom properties
- 24 color variables per theme
- Easy to modify
- Instantly switchable

## 🎯 Quick Tips

1. **No Installation Required** - Just open index.html
2. **Works Offline** - After first load (libraries cached)
3. **Auto-Saves** - Your content is saved automatically
4. **10 Themes** - 5 theme families × 2 variants each
5. **Custom Themes** - Create and save your own
6. **Export** - Share as standalone HTML file

## 🔧 Customization

### Want to add a new theme?

1. Copy any theme file (e.g., `default-light.css`)
2. Rename it (e.g., `mytheme-light.css`)
3. Change the colors inside
4. Add to dropdown in `index.html`

### Want different colors?

1. Click "🎨 Customize Colors"
2. Pick new colors
3. Save as custom theme

### Want to change layout?

Edit `style.css` - all layout code is there

### Want to add features?

Edit `script.js` - all JavaScript is there

## 📚 Supported Features

### Markdown

✅ Headers (H1-H6)
✅ Bold, Italic, Strikethrough
✅ Lists (ordered & unordered)
✅ Links & Images
✅ Code blocks
✅ Tables
✅ Blockquotes
✅ Horizontal rules

### Code Highlighting

✅ Java, C++, Python
✅ JavaScript, TypeScript
✅ Rust, Go, SQL
✅ HTML, CSS, Bash
✅ 20+ languages total

### Diagrams

✅ Flowcharts
✅ Sequence diagrams
✅ Class diagrams
✅ State diagrams
✅ And more with Mermaid!

## 💾 Storage

All data stored in browser's localStorage:

- Your markdown content
- Selected theme
- Custom theme colors

## 🌐 Browser Compatibility

✅ Chrome / Edge (Best)
✅ Firefox
✅ Safari
✅ Opera

## 🎨 Color Variables

Each theme defines these 24 variables:

**Backgrounds** (3)

- --bg-primary
- --bg-secondary
- --bg-tertiary

**Text** (3)

- --text-primary
- --text-secondary
- --border-color

**Headers** (6)

- --h1-color through --h6-color

**Elements** (12)

- Links, Code, Blockquotes
- Bold, Italic, Tables
- And more!

## 🎯 Use Cases

- 📝 Note-taking
- 📚 Documentation
- 🎨 Blog post drafting
- 📊 README creation
- 🎓 Study guides
- 💼 Technical writing
- 🎤 Presentations

## ⚡ Performance

- **Fast loading** - Minimal dependencies
- **Smooth rendering** - Optimized JavaScript
- **No lag** - Real-time preview
- **Lightweight** - Small file sizes

## 🔒 Privacy

- **No tracking** - Zero analytics
- **Local storage** - Nothing sent to servers
- **Offline capable** - Works without internet
- **No accounts** - No sign-up required

---

**Ready to start?** Open `index.html` now! 🚀
