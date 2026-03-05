# ⚖️ Impact Analysis: CDN to NPM Migration

## 🚀 Pros (Why we should do it)

1.  **Offline Capability (Major)**: The app will work without internet. Currently, if you are on a plane or have spotty Wi-Fi, the app is broken.
2.  **Reliability**: CDNs can go down (rare, but fatal). NPM packages are saved in your `node_modules` and bundled into your final `dist` folder.
3.  **Speed**: Instead of the browser opening 6 parallel connections to `cdn.jsdelivr.net` (costing DNS + SSL time for each), Vite bundles everything into a single efficient file.
4.  **Security**: You can run `npm audit` to check for specific vulnerability in your dependencies. CDN links are opaque.
5.  **Better Coding Experience**: Importing modules (`import { parse } from 'marked'`) gives you **Autocomplete** and **Type Checking** in VS Code.

## ⚠️ Cons & Risks (What could go wrong)

1.  **Initial Breakage**: The current code relies on global variables (e.g., `window.marked`). We will need to refactor `script.js` to use `import` variables.
2.  **Prism Autoloader Complexity**: PrismJS's "Download languages on the fly" feature hates bundlers. It tries to fetch files from a URL. We will need to configure Vite to copy language files to the `dist` folder manually, or import common languages explicitly.
3.  **Local "Start" Requirement**: You won't be able to just "Double Click index.html" to run the app anymore. You **must** use a local server (`npm run dev` or `npm run preview`). _Note: This is already true for ES Modules usually._

## ❓ Will it become outdated?

**No.** In fact, the opposite.

- **Current State:** Your HTML hardcodes `marked@11.0.0`. It is _already_ outdated and will stay that way forever until you manually edit the HTML string.
- **NPM State:** You run `npm update` and everything upgrades to the latest stable versions automatically. You have **more control**.

## 🛡️ Verdict

**Proceed.** The "Prism Autoloader" risk is the only technical hurdle, but solvable. The benefits for an "Enterprise Grade" app (Security, Offline support) appear to outweigh the configuration effort.
