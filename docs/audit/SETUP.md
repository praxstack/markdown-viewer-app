# markdown-viewer-app setup (macOS, verified 2026-10-05)

Stack: static browser app (Vite 7 + vanilla JS, marked, mermaid, KaTeX, DOMPurify, html2pdf). No env vars, no server, no Xcode.
Repo: praxstack/markdown-viewer-app (commands below run from the repo root)

## Install (IMPORTANT: use npm 10, not the system npm 12)
System npm 12.2.0 corrupts node_modules here (hundreds of `TAR_ENTRY_ERROR ENOENT` warnings, exit 0, but vite/vitest/eslint missing from .bin).
    rm -rf node_modules
    npx -y npm@10 ci --no-audit --no-fund      # 527 packages, ~30s, zero tar errors
Install scripts (esbuild, core-js, agent-browser) are not needed for the below.

## Build
    npm run build        # exit 0, output dist/ (index.html, assets/, themes/ with 15 css)

## Test
    npx vitest run       # 12 files, 456 tests passed, 0 failed/skipped (~4s). stderr noise is expected (mocked error paths).

## Lint
    npm run lint         # FAILS: 5090 problems (4942 errors) - ~all in .github/skills/** (77 files, not in eslint ignores)
    npx eslint script.js src tests vite.config.js   # first-party code: 0 errors, 4 warnings (max-lines/complexity)
    (these are not CI-gated: deploy.yml only runs npm ci + npm run build)

## Run
Dev server: `npx vite --host 127.0.0.1 --port 3000` (config has open:true, which opens a browser).
Production preview (verified): 
    npx vite preview --host 127.0.0.1 --port 4173
    open http://127.0.0.1:4173/markdown-viewer-app/      # NOTE base path /markdown-viewer-app/
Verified: `/` -> 302, `/markdown-viewer-app/` -> 200 (93 KB, title "Markdown Viewer Pro"), `/markdown-viewer-app/themes/ocean-dark.css` -> 200. Server stopped afterwards.

## Known issues / workarounds
- npm 12 install corruption (above).
- `npm run lint` unusable as-is (see findings).
- `npm audit --omit=dev`: 11 vulns (1 critical jspdf<=4.2.0 via html2pdf.js 0.14.0, 1 high, dompurify<=3.4.12 moderate, fflate moderate).
- 3.5k of the 3.9k tracked files are `.claude/skills/**` (vendored agent skills), 154 in `.github/skills`; unrelated to the app.
- package.json "description" is a pasted README tree; repository URL points to old owner PrakharMNNIT.
- No GUI/manual browser interaction (editor, export PDF, mermaid rendering) was performed; only HTTP-level smoke.
