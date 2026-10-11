# Agent instructions (Markdown Viewer Pro)

This repository uses the open [Agent Skills](https://agentskills.io) format. Skills are
standard operating procedures (`SKILL.md` files) that coding agents load when a task matches
their description.

## Skill discovery paths

| Path | Role |
| --- | --- |
| `.claude/skills/` | **Canonical** skill tree (edit here) |
| `.agents/skills` → `.claude/skills` | Cross-runtime discovery (Cursor, Codex, Gemini CLI) |
| `.cursor/skills` → `.claude/skills` | Cursor-native discovery |

Do not duplicate skills across paths. Changes under `.claude/skills/` are visible everywhere.

## Installed skill packs

See [`.claude/skills/README.md`](.claude/skills/README.md) for the full inventory, install
notes, and recommended skills for this codebase.

| Pack | Skills | Notes |
| --- | ---: | --- |
| [superpowers](https://github.com/obra/superpowers) | 14 | Plan-before-code, TDD, debugging, code review |
| [mattpocock/skills](https://github.com/mattpocock/skills) | 37 | Engineering workflows, TDD, code review, triage |
| [pstack](https://github.com/cursor/plugins/tree/main/pstack) | 45 | Principles, architecture, TypeScript, verification |
| [gstack](https://github.com/garrytan/gstack) | 54 | QA, design review, ship, browser automation (slimmed) |
| [shadcn/improve](https://github.com/shadcn/improve) | 1 | Read-only codebase audit → handoff plans |
| **Flat library** | 470+ | find-skills, ToB, Vercel, Anthropic, awesome-copilot |

See [`docs/agents/workflow-pipeline.md`](docs/agents/workflow-pipeline.md) for the layered pipeline.
Use **`find-skills`** to discover capabilities; do not load all ~693 skills into every session.

**Native plugins** (Compound Engineering, pstack plugin UI): [`docs/agents/native-plugins.md`](docs/agents/native-plugins.md) — Cloud Agents cannot `/add-plugin`; install locally.

**Verification:** [`verify-markdown-viewer`](.claude/skills/verify-markdown-viewer/SKILL.md) drives the Vite UI for proof artifacts.

**gstack runtime:** Skill markdown is vendored; Bun runtime sidecars (`bin/`, `lib/`, `browse/`)
are fetched at setup time. Cloud Agents run `bash scripts/setup-gstack-full.sh` via
`.cursor/environment.json`.

**Full workstation setup:** `bash scripts/install-praxstack-agent-workstation.sh` — gstack slash
commands, skill arsenal, 2026 discovery/research/UI skills, OpenSpec, Graphify, Impeccable,
and praxstack skills/personas.

**praxstack skills & personas:** [`docs/agents/praxstack-skills-personas.md`](docs/agents/praxstack-skills-personas.md) —
41 canonical skills from [praxstack/skills-and-personas](https://github.com/praxstack/skills-and-personas)
(kingmode, constellation-team, backend-pe-*, teach-pro-max, etc.). Install:

```bash
bash scripts/setup-praxstack-skills-personas.sh
```

Persona source material links to `.claude/skills/_praxstack-source/`. Skills install under
`.claude/skills/praxstack/`. The `/goal` autonomous work pattern is documented there (paste
prompt — no dedicated skill).

**MCP governance:** [`docs/agents/mcp-recommendations.md`](docs/agents/mcp-recommendations.md) —
Context7, Serena, Graphify MCP documented for desktop approval; no shadow MCP in git.

**gstack slash commands (Cursor desktop):** Vendored `.claude/skills/gstack/` gives agents
**Skill-tool discovery only** — it does **not** register chat slash commands like
`/plan-ceo-review`. Those come from upstream `./setup --host cursor`, which installs flat
skill folders under `~/.cursor/skills/gstack-*` on your machine. Run locally once:

```bash
bash scripts/setup-gstack-full.sh
```

Then reload Cursor and type `/plan-ceo-review` in chat (or ask the agent to use the
`plan-ceo-review` skill). See [`docs/agents/native-plugins.md`](docs/agents/native-plugins.md#gstack).

## Agent skills

### Issue tracker

GitHub Issues for `praxstack/markdown-viewer-app` via `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default mattpocock vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout (`CONTEXT.md` + `docs/adr/` at repo root, created lazily). See `docs/agents/domain.md`.

### Workflow pipeline

Layered skill stack (discover → spec → implement → review → security → browser QA → ship). See `docs/agents/workflow-pipeline.md`.

## Project context

- **Stack:** Vite + vanilla JavaScript (marked, DOMPurify, Prism, Mermaid, KaTeX)
- **Tests:** Vitest (`npm test`)
- **Lint:** ESLint (`npm run lint`)
- **Deploy:** GitHub Pages

When auditing or planning improvements, prefer `/improve` (shadcn/improve skill) for read-only
surveys and handoff plans. Implementation stays in separate agent sessions.

## Verification

Project-local browser verification: **`verify-markdown-viewer`** (`.claude/skills/verify-markdown-viewer/`).
Use after UI changes; complements Vitest unit tests.

## Companion Cursor plugins (not vendored)

Native marketplace plugins require Cursor desktop — see [`docs/agents/native-plugins.md`](docs/agents/native-plugins.md).

These MCP/skill plugins are enabled in Cursor Cloud and pair well with this repo:

- **CodeRabbit** — automated code review
- **Browser Use** — real-browser QA for rendered Markdown
- **Mobbin** — production UI/UX references
- **shadcn** — component registry (if UI moves to a component framework)

Additional credible skill ecosystems are listed in `.claude/skills/README.md` under
**Recommended external packs** — install selectively with `npx skills add <owner/repo>`.

**Spec Kit:** see [`docs/agents/spec-kit.md`](docs/agents/spec-kit.md) for install and init steps.
