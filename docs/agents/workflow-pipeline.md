# Agent workflow pipeline (2026 PraxStack)

This repo uses a **layered skill stack**. Do not activate every methodology on the same task.

## 2026 architecture overview

```
DISCOVERY          find-skills, last30days, deep-research
       ↓
SPEC (pick ONE)    OpenSpec (default)  |  Spec Kit (greenfield)  |  gstack spec  |  CE
       ↓
STRUCTURE          Graphify + Serena (MCP — desktop) + Context7 (library docs)
       ↓
INTERROGATION      Matt Pocock + shadcn/improve + Hallmark + Impeccable
       ↓
IMPLEMENTATION     pstack + Superpowers
       ↓
TEST / REVIEW      Superpowers + Matt Pocock + Trail of Bits (on demand)
       ↓
SECURITY           trailofbits/skills
       ↓
UI LOOP            Vercel web guidelines + agent-browser (+ Hallmark polish)
       ↓
SHIP               gstack ship + GitHub Actions
       ↓
RETRO (optional)   Compound Engineering /ce-compound
```

## Spec methodologies — pick one per task

| Tool | When | Commands |
| --- | --- | --- |
| **OpenSpec** (default) | Iterative changes, brownfield, PR-sized work | `/openspec-propose`, `/openspec-apply-change`, `/opsx-propose` |
| **Spec Kit** | Large greenfield features, constitution-first | `/speckit.specify`, `/speckit.plan`, `/speckit.implement` |
| **gstack spec** | Product/design/CEO review loop with browser QA | `/spec`, `/plan-ceo-review`, `/ship` |
| **Compound Engineering** | Compound learning, `/ce-*` native plugin | `/ce-compound`, `/ce-review` |

**Conflict warning:** Running **gstack + superpowers + pstack + Compound Engineering + ECC** planning on the same ticket wastes context and produces conflicting plans. Choose **one spec layer**, then one execution layer (pstack **or** superpowers discipline — both can coexist lightly, but not two full planning stacks).

## Knowledge layers (desktop MCP)

See [`mcp-recommendations.md`](./mcp-recommendations.md). User must approve MCP in Cursor Settings.

| Layer | Tool | Purpose |
| --- | --- | --- |
| Library docs | **Context7** | Fresh framework/API docs |
| Repo graph | **Graphify** | Codebase topology (`/graphify .`) |
| LSP navigation | **Serena** | Symbol-level retrieval and edits |

Cloud Agents: Graphify project rules may be committed; MCP servers are not auto-added.

## UI / design loop

| Tool | Role |
| --- | --- |
| **Hallmark** | Design polish, UI refinement prompts |
| **Impeccable** | Design-system-aware UI generation (`/impeccable init`) |
| **Vercel agent-skills** | react-best-practices, web-design-guidelines |
| **agent-browser** | Headless/real Chrome proof (`npx agent-browser`) |
| **verify-markdown-viewer** | Project-specific Vite UI harness |

## Pipeline (classic)

```
find-skills          → discover capabilities on demand
        ↓
PRODUCT / SPEC       → OpenSpec (default) OR Spec Kit OR gstack OR CE (pick one)
        ↓
DEEP INTERROGATION   → Matt Pocock + shadcn/improve + Hallmark
        ↓
IMPLEMENTATION       → pstack + Superpowers
        ↓
TEST / REVIEW        → Superpowers + Matt Pocock + Trail of Bits (on demand)
        ↓
SECURITY GATE        → trailofbits/skills (differential-review, semgrep, etc.)
        ↓
REAL BROWSER QA      → agent-browser (or browse / Browser Use MCP)
        ↓
SHIP / DEPLOY        → gstack ship skills + GitHub Actions
        ↓
RETRO / COMPOUND     → Compound Engineering /ce-compound (optional)
```

## Core stack (always available in `.claude/skills/`)

| Layer | Pack | Invoke |
| --- | --- | --- |
| Discovery | `find-skills`, `last30days`, `deep-research` | global + project |
| Spec (default) | `openspec-*` | `/openspec-propose` |
| Execution OS | `pstack` | `/add-plugin pstack`; `/setup-pstack` |
| Discipline | `superpowers` | brainstorming → writing-plans → TDD → review |
| Engineering | `mattpocock` | triage, to-spec, code-review, TDD |
| Company workflow | `gstack` | CEO/design/QA/ship (`scripts/setup-gstack-full.sh`) |
| Audit | `shadcn/improve` | `/improve` (read-only) |
| UI craft | `hallmark`, `impeccable`, `vercel-*` | on demand |
| Security | `trailofbits/*` | differential-review, semgrep |
| Browser QA | `agent-browser` | `npx agent-browser` + skill |
| Structure | `graphify` | `/graphify .` |
| Examples | `wshobson/agents` | selective (`ai-debt-detector`, `session-guard`) — not full pack |

## Master installer

```bash
bash scripts/install-praxstack-agent-workstation.sh
```

Runs gstack setup, skill arsenal, 2026 skills, OpenSpec/Graphify/Impeccable when available, and prints verification.

## Stack-specific cartridges (install per project)

Install with `npx skills add <owner/repo> --skill <name> -y` when the stack applies:

- **Supabase** — `supabase/agent-skills`
- **Cloudflare** — `cloudflare/skills`
- **AWS** — `aws/agent-toolkit-for-aws/skills`
- **NVIDIA** — `nvidia/skills` (selective CUDA/Nemo skills only — never `--skill '*'`)
- **Microsoft/Azure** — `microsoft/skills` (selective; avoid `--skill '*'`)

## wshobson/agents — selective install only

The marketplace ships **94 plugins / 175+ skills**. Do **not** vendor or `--skill '*'`.

Example selective install:

```bash
npx skills add wshobson/agents --skill ai-debt-detector --skill session-guard -a cursor -y
```

Browse the [wshobson/agents](https://github.com/wshobson/agents) catalog and add 1–2 skills per need.

## Native plugins (not vendored in git)

See [`native-plugins.md`](./native-plugins.md) for desktop install steps (`/add-plugin`).

## Spec Kit (large / greenfield features)

See [`spec-kit.md`](./spec-kit.md). CLI installs via `uv tool`; repo init requires `--force` on non-empty trees.

Commands (after init): `/speckit.constitution`, `/speckit.specify`, `/speckit.plan`, `/speckit.implement`.

## Context hygiene

- Do **not** load all ~700+ vendored skills into every session.
- Use **`find-skills`** globally (`npx skills@latest list -g`) or project-local to pull capabilities on demand.
- **`microsoft/skills`**, **`nvidia/skills`**, **`wshobson/agents`**: selective install only — never `--skill '*'`.
- **One spec/planning methodology per task** (OpenSpec **or** gstack **or** Spec Kit **or** CE).
- **Browser proof**: use [`verify-markdown-viewer`](../../.claude/skills/verify-markdown-viewer/SKILL.md) for the Vite UI.

## Global vs project skills

| Scope | Example | Purpose |
| --- | --- | --- |
| Global (`-g`) | `find-skills`, `last30days`, `deep-research`, `hallmark` | Discovery in every repo (`~/.agents/skills/`) |
| Global (gstack) | `gstack-plan-ceo-review` | Slash commands in `~/.cursor/skills/gstack-*` |
| Project | `bash scripts/install-skill-arsenal.sh` | Flat library in `.claude/skills/` |
| Rules | `~/.cursor/rules/pstack-models.mdc`, `.cursor/rules/graphify.mdc` | Model + graph context |

## Skipped in this repo (by design)

| Pack | Reason |
| --- | --- |
| `remotion-dev/skills` | Not a video project |
| `dbillion/manim-storytelling-skills` | Not relevant |
| Full `wshobson/agents` | Context explosion — selective only |
| Full `microsoft/skills` | Context explosion — selective only |
