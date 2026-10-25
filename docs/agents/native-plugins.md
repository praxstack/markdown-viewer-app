# Native Cursor / Claude / Codex plugins

Some capabilities ship as **marketplace plugins** rather than vendored skill trees in git. Cloud Agents cannot run `/add-plugin` — install these on your local Cursor (or equivalent) IDE.

## Compound Engineering

**Purpose:** Spec-driven product workflow (`/ce-*` commands), compound learning, structured reviews.

**Cannot automate in Cloud Agent:** `/add-plugin compound-engineering` requires the Cursor desktop marketplace.

### Cursor (local)

1. Open **Cursor Settings → Plugins** (or command palette: `Add Plugin`).
2. Search **Compound Engineering** and enable it.
3. Reload the window if prompted.
4. Verify: slash commands such as `/ce-compound`, `/ce-review` appear in chat.

### Claude Code (local)

1. Install from the Anthropic plugin marketplace if listed, or clone [every-to/compound-engineering-plugin](https://github.com/every-to/compound-engineering-plugin) per upstream README.
2. Place skills under `~/.claude/skills/` or use the plugin's documented install path.
3. Run the plugin's setup skill if provided.

### Codex CLI (local)

1. Follow Compound Engineering upstream docs for Codex/OpenAI agent integration.
2. Typically: copy skill pack to the Codex skills directory documented in that repo.

**Workflow note:** Use Compound Engineering **or** gstack spec **or** Spec Kit for a given task — not all three (see [workflow-pipeline.md](./workflow-pipeline.md)).

## pstack

**Purpose:** Principles, architecture panels, swarm/arena workflows.

### Cursor (local)

1. `/add-plugin pstack` (or enable **pstack** in Settings → Plugins).
2. Run `/setup-pstack` once to write `~/.cursor/rules/pstack-models.mdc`.
3. This repo already vendors pstack skills under `.claude/skills/pstack/`; the plugin adds Task-tool integration and slash routing.

### Claude Code / Codex

Use vendored `.claude/skills/pstack/` — no separate plugin required for markdown SOPs. Model routing overrides are Cursor-specific (`pstack-models.mdc`).

## superpowers

**Purpose:** Plan-before-code, TDD, debugging, code review discipline.

### Cursor (local)

1. `/add-plugin superpowers`
2. Skills are also vendored at `.claude/skills/superpowers/` for discovery without the plugin.

### Claude Code

Install via `npx skills add obra/superpowers` or use the vendored copy in this repo.

## gstack

**Purpose:** CEO/design/eng review, QA in a real browser, ship/PR workflow — 54 specialist skills from [garrytan/gstack](https://github.com/garrytan/gstack).

This repo **vendors gstack skill markdown** under `.claude/skills/gstack/` (slimmed — no
`bin/`/`lib/`/`browse/` in git). Runtime sidecars are linked by `bash scripts/setup-gstack-full.sh`.

### Why `/plan-ceo-review` may not appear

Three separate mechanisms — do not confuse them:

| Mechanism | What it enables | Where |
| --- | --- | --- |
| **Vendored markdown** | Agent reads `SKILL.md` via Skill tool / `@` mention | `.claude/skills/gstack/plan-ceo-review/` |
| **Runtime sidecar** | Preamble bash (`gstack-config`, `browse`, etc.) | Symlinks in `.claude/skills/gstack/bin` → cache |
| **Cursor slash commands** | `/plan-ceo-review` in chat autocomplete | `~/.cursor/skills/gstack-plan-ceo-review/` (global) |

Project `.cursor/skills` is a symlink to `.claude/skills`, so gstack skills stay **nested**
(`gstack/plan-ceo-review/`). Cursor slash-command discovery needs **top-level** folders in
`~/.cursor/skills/` — created only by upstream `./setup --host cursor`, not by vendoring alone.

There is **no gstack Cursor marketplace plugin**; use the setup script (not `/add-plugin`).

### Cursor (local) — enable slash commands

1. Install [Bun](https://bun.sh) if missing (`curl -fsSL https://bun.sh/install | bash`).
2. From this repo root:

   ```bash
   bash scripts/setup-gstack-full.sh
   ```

   This clones/updates upstream gstack into `~/.cache/gstack-upstream`, links runtime into
   `.claude/skills/gstack/`, and runs `./setup --host cursor` to populate `~/.cursor/skills/gstack-*`.

3. **Reload Cursor** (Developer: Reload Window).
4. In chat, type `/plan-ceo-review` — autocomplete should list it (skill `name:` is
   `plan-ceo-review`; install folder is `gstack-plan-ceo-review`).

**Troubleshooting**

- **`./setup --host cursor` rejected:** Fixed upstream in [gstack#2361](https://github.com/garrytan/gstack/issues/2361). Refresh cache: `GSTACK_REF=main bash scripts/setup-gstack-full.sh`.
- **Runtime OK but no slash commands:** You linked sidecars only. Re-run the script; it always runs the Cursor host install step.
- **Prefer prefixed names:** `cd ~/.cache/gstack-upstream && ./setup --host cursor --prefix` → `/gstack-plan-ceo-review`.
- **Without slash commands:** Ask the agent to *"use the plan-ceo-review skill"* or `@plan-ceo-review` — vendored markdown still works for Cloud Agents.

### Claude Code / Codex

```bash
GSTACK_HOST=claude bash scripts/setup-gstack-full.sh   # or codex, opencode, …
```

Or manual: clone [garrytan/gstack](https://github.com/garrytan/gstack) and `./setup --host claude`.

## wshobson/agents marketplace

**Purpose:** Large plugin marketplace (94 plugins, 175+ skills) — architecture, debugging, PPTX, session guard, AI debt, etc.

**Do not install the full pack** in this repo (context explosion). Select 1–2 skills per need:

```bash
npx skills add wshobson/agents --skill ai-debt-detector --skill session-guard -a cursor -y
```

Browse [wshobson/agents](https://github.com/wshobson/agents) for the catalog. Cloud Agents cannot browse the Cursor marketplace UI — use `npx skills add` with explicit `--skill` names.

## google-labs-code/stitch-skills

**Purpose:** Google's Stitch UI/design skills for agent-driven interface work.

### Cursor (local)

1. Search **Stitch** or **google-labs-code** in Cursor Settings → Plugins / marketplace.
2. Or install skills via upstream README if published to the skills registry.
3. Pair with **Hallmark** + **Impeccable** + Vercel web guidelines for the UI loop (see [workflow-pipeline.md](./workflow-pipeline.md)).

## OpenSpec / Graphify / Impeccable (repo-local, not marketplace)

These ship as CLI + project skills, installed by `bash scripts/install-praxstack-agent-workstation.sh`:

| Tool | Slash / command | Notes |
| --- | --- | --- |
| OpenSpec | `/openspec-propose`, `/opsx-propose` | Default brownfield spec; `npm install -D @fission-ai/openspec` |
| Graphify | `/graphify .` | `uv tool install graphifyy`; writes `.cursor/rules/graphify.mdc` |
| Impeccable | `/impeccable init` | `npx impeccable skills install` (project scope) |

## MCP plugins (user approval required)

**Context7**, **Serena**, **Graphify MCP** — official install documented in [`mcp-recommendations.md`](./mcp-recommendations.md). Do not commit shadow `.cursor/mcp.json` entries without approval.

## CodeRabbit / Browser Use / Mobbin / shadcn

These are **MCP-backed Cursor plugins**, enabled per workspace or user in Cursor Cloud/local settings. They are listed in root `AGENTS.md` under companion plugins. No git vendoring — configure credentials and toggles in the IDE.

## Verification checklist (local)

After enabling plugins locally:

```bash
# Global discovery skill
npx skills@latest list -g | grep find-skills

# pstack models rule exists
test -f ~/.cursor/rules/pstack-models.mdc && head ~/.cursor/rules/pstack-models.mdc

# gstack Cursor slash skills (global — not in repo symlink tree)
test -e ~/.cursor/skills/gstack-plan-ceo-review/SKILL.md && echo "gstack slash skills OK"

# Project verification skill
test -f .claude/skills/verify-markdown-viewer/SKILL.md && echo OK
```
