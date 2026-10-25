# Agent Skills

This directory holds reusable **agent skills** (SOP-style `SKILL.md` files) that coding
agents (Claude Code, Cursor, Codex, and other harnesses) can discover and invoke.

The canonical skill tree lives under `.claude/skills/`. Agent-agnostic harnesses
(Cursor, Codex, Gemini, etc.) discover the same content via a relative symlink:

- `.claude/skills/` — canonical tree (Claude Code / Anthropic-style discovery)
- `.agents/skills` → `../.claude/skills` — symlink for cross-runtime discovery

Edit skills only under `.claude/skills/`; changes are visible through both paths.

Cursor-native discovery also uses `.cursor/skills` → `.claude/skills` (symlink).

Each skill is a directory containing a `SKILL.md` with YAML frontmatter (`name`,
`description`, optional `triggers`/`allowed-tools`). Supporting `references/`,
`sections/`, and templates live alongside it.

## Installed skill packs

| Pack | Source | License | Install | Skills |
| --- | --- | --- | --- | --- |
| `superpowers/` | [obra/superpowers](https://github.com/obra/superpowers) | MIT | full tree | 14 |
| `mattpocock/` | [mattpocock/skills](https://github.com/mattpocock/skills) | MIT | full tree | 37 |
| `pstack/` | [cursor/plugins · pstack](https://github.com/cursor/plugins/tree/main/pstack) | MIT | full tree | 45 |
| `gstack/` | [garrytan/gstack](https://github.com/garrytan/gstack) | MIT | slimmed | 54 |
| `improve/` | [shadcn/improve](https://github.com/shadcn/improve) | MIT | full | 1 |
| **Flat skills** | see below | various | `npx skills add` | 470+ |

### Flat skills (on-demand discovery)

The [vercel-labs/skills](https://github.com/vercel-labs/skills) CLI installs individual
skill directories at `.claude/skills/<skill-name>/` (not nested under a pack folder).
Use **`find-skills`** to search this library; do not load every skill into context.

| Source repo | Installed via | Examples |
| --- | --- | --- |
| [vercel-labs/skills](https://github.com/vercel-labs/skills) | `find-skills` only | skill discovery |
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | `--skill '*'` | `vercel-react-best-practices`, `web-design-guidelines` |
| [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser) | `--skill agent-browser` | real-browser QA |
| [trailofbits/skills](https://github.com/trailofbits/skills) | `--skill '*'` | `differential-review`, `semgrep`, `second-opinion` |
| [anthropics/skills](https://github.com/anthropics/skills) | `--skill '*'` | reference Agent Skills, document workflows |
| [github/awesome-copilot](https://github.com/github/awesome-copilot) | `--skill '*'` | `acquire-codebase-knowledge`, GitHub workflows |

**Workflow pipeline:** see [`docs/agents/workflow-pipeline.md`](../docs/agents/workflow-pipeline.md).

**Matt Pocock config:** `docs/agents/issue-tracker.md`, `triage-labels.md`, `domain.md`.

**pstack models:** `~/.cursor/rules/pstack-models.mdc` (run `/setup-pstack` to regenerate).

### Project verification

| Skill | Purpose |
| --- | --- |
| `verify-markdown-viewer/` | Browser QA for Vite dev server (agent-browser) |

### Not vendored (native plugins — enable in Cursor)

See [`docs/agents/native-plugins.md`](../../docs/agents/native-plugins.md) and [`docs/agents/spec-kit.md`](../../docs/agents/spec-kit.md).

| Plugin | Install |
| --- | --- |
| pstack | `/add-plugin pstack` → `/setup-pstack` |
| superpowers | `/add-plugin superpowers` |
| compound-engineering | `/add-plugin compound-engineering` |
| Spec Kit | Installed in repo — see [`docs/agents/spec-kit.md`](../../docs/agents/spec-kit.md) |

### Stack cartridges (install per project when needed)

| Stack | Command |
| --- | --- |
| Supabase | `npx skills add supabase/agent-skills --skill '*' -y` |
| Cloudflare | `npx skills add cloudflare/skills --skill '*' -y` |
| AWS | `npx skills add aws/agent-toolkit-for-aws/skills --skill '*' -y` |
| Microsoft | `npx skills add microsoft/skills` (selective — avoid full `*`) |

### gstack is a slimmed install

Only the skill **markdown/templates** (the SOP content) are vendored here. The Bun
runtime that powers gstack's executable tooling — `lib/`, `bin/`, `scripts/`,
`browse/` (Chromium automation), `extension/`, `hosts/`, and tests — is **not**
included in git (~26MB). Fetch the runtime at setup time instead.

**Recommended (repo script — idempotent, Cloud Agent friendly):**

```bash
bash scripts/setup-gstack-full.sh
```

The script installs [Bun](https://bun.sh) if missing, clones/updates upstream
gstack into a cache directory (`$XDG_CACHE_HOME/gstack-upstream` by default),
builds the runtime if needed, symlinks `bin/`, `lib/`, and `browse/` into:

- `.claude/skills/gstack/` (and via symlink, `.agents/skills/gstack/`)
- `~/.claude/skills/gstack/` (global binary paths referenced by skill preambles)

Then **always** runs `./setup --host cursor` (default) to register **Cursor slash commands**
under `~/.cursor/skills/gstack-*`. Without that step, agents can read vendored `SKILL.md`
files but `/plan-ceo-review` will not appear in chat autocomplete.

Override the cache location with `GSTACK_CACHE_DIR`, the upstream ref with
`GSTACK_REF` (default `main`), or the host with `GSTACK_HOST` (e.g. `codex`, `claude`).
Set `GSTACK_INSTALL_HOST_SKILLS=0` to link runtime sidecars only (Cloud Agents that do not
need global Cursor slash commands).

Cloud Agents: this repo's `.cursor/environment.json` runs the script during
`install` after `npm ci`.

**Cursor skill names:** After setup, flat `gstack-*` symlinks (e.g. `gstack-plan-ceo-review`)
appear under `.claude/skills/` for Cursor discovery. Claude Code uses short slash names
(`/plan-ceo-review`); Cursor uses the `gstack-` prefix. Nested vendored paths
(`gstack/plan-ceo-review/`) work when you attach or invoke by path either way.

**Cursor host:** Upstream [gstack#2361](https://github.com/garrytan/gstack/issues/2361) fixed `./setup --host cursor` rejection. If an older cache rejects `cursor`, run `GSTACK_REF=main bash scripts/setup-gstack-full.sh`.

**Manual upstream install** (alternative):

```bash
git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack \
  && cd ~/.claude/skills/gstack && ./setup --host cursor
```

`superpowers`, `mattpocock`, `pstack`, and `improve` are full skill trees (Markdown SOPs
with no mandatory runtime), so they work as-is.

### shadcn/improve — codebase advisor (read-only)

Install/update with the open [skills CLI](https://github.com/vercel-labs/skills):

```bash
npx skills add shadcn/improve --yes
```

Use `/improve` for read-only audits that produce handoff plans under `plans/`. The skill
never modifies source code — it writes self-contained specs for other agents to execute.
High value for security review, tech-debt triage, and roadmap suggestions on this Markdown
renderer (XSS surface via DOMPurify, Mermaid/KaTeX rendering, etc.).

## Recommended for this project (Markdown Viewer Pro)

This is a Vite + vanilla-JS frontend (marked / DOMPurify / Prism / Mermaid / KaTeX /
html2pdf) with Vitest, ESLint, Prettier, and GitHub Pages deploy. The highest-value
skills for this codebase:

**Plan & design**
- `superpowers/brainstorming`, `superpowers/writing-plans`
- `gstack/office-hours`, `gstack/plan-eng-review`
- `mattpocock/engineering/to-spec`, `mattpocock/engineering/to-tickets`
- `pstack/architect`

**Build & verify**
- `superpowers/test-driven-development`, `mattpocock/engineering/tdd` — Vitest is already set up
- `superpowers/systematic-debugging`, `mattpocock/engineering/diagnosing-bugs`
- `superpowers/verification-before-completion`, `pstack/principle-prove-it-works`

**Review & security** (this app renders untrusted Markdown → XSS surface via DOMPurify)
- `gstack/cso` — OWASP/STRIDE security review
- `gstack/review`, `mattpocock/engineering/code-review`, `pstack/unslop`

**Frontend QA & release**
- `gstack/qa`, `gstack/design-review` — browser-based UI testing
- `gstack/make-pdf` — relevant to the app's html2pdf export feature
- `gstack/ship`, `gstack/land-and-deploy` — GitHub Pages release flow

### Companion plugins available in this Cursor environment

These MCP/skill plugins are already enabled for the workspace and pair well here:

- **CodeRabbit** — automated code review (`code-review` skill / code-reviewer agent)
- **Browser Use** — real-browser QA/automation for the rendered app
- **Mobbin** — production UI/UX design references
- **shadcn** — component registry (if the UI moves to a component framework)
- **Superdesign** — design/redesign canvas for UI work

Enable additional MCP servers or Claude/Cursor plugins from the marketplace as needed;
those require per-user configuration (and any secrets) and are not vendored here.

## Recommended external packs (not vendored)

Install selectively with `npx skills add <owner/repo> --yes`. These are widely used,
credible ecosystems that complement the packs above without duplicating them:

| Ecosystem | Source | Why install |
| --- | --- | --- |
| **Agent Skills spec + CLI** | [agentskills/agentskills](https://github.com/agentskills/agentskills) · [vercel-labs/skills](https://github.com/vercel-labs/skills) | Open standard (Linux Foundation); `npx skills` installs into 70+ agents |
| **Anthropic official skills** | [anthropics/skills](https://github.com/anthropics/skills) | Reference implementations: PDF/DOCX, webapp testing (Playwright), MCP builder |
| **Vercel agent skills** | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | React/Next.js performance rules, composition patterns, web design guidelines |
| **Addy Osmani agent-skills** | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | 25 skills + `/spec`, `/plan`, `/build`, `/test`, `/review`, `/ship` commands |
| **Cursor plugins marketplace** | [cursor/plugins](https://github.com/cursor/plugins) | Official Cursor plugin monorepo (pstack is one subtree; others: Vercel, Linear, etc.) |
| **CodeRabbit** | Cursor plugin (MCP) | Automated PR code review — already enabled in this Cloud Agent environment |
| **Browser Use / Browserbase** | Cursor plugin (MCP) | Real-browser QA — pairs with gstack QA and this app's rendered Markdown UI |

**Not recommended to vendor wholesale:** packs that overlap heavily with installed ones
(e.g. another TDD/planning methodology) or stack-specific packs unrelated to this repo
(e.g. Supabase/Remotion skills unless you adopt those stacks).

## Verification

```bash
# Count discoverable skills (expect 500+)
find .claude/skills -name 'SKILL.md' | wc -l

# Confirm cross-runtime symlinks
test -L .agents/skills && test -L .cursor/skills && echo "symlinks OK"

# Skill discovery
head -5 .claude/skills/find-skills/SKILL.md

# Browser QA CLI (devDependency)
npx agent-browser --help

# gstack runtime (after setup script)
bash scripts/setup-gstack-full.sh
```

## Reinstall flat skill packs

```bash
bash scripts/install-skill-arsenal.sh
```

## Provenance

All packs are MIT-licensed; each pack keeps its upstream `LICENSE`. Sources were
vendored from a shallow clone of each upstream repository. To refresh a pack, re-copy
from upstream (see each row above) and keep this table's install/notes in sync.
