# praxstack/skills-and-personas integration

Canonical upstream: [github.com/praxstack/skills-and-personas](https://github.com/praxstack/skills-and-personas)

Install or refresh in this repo:

```bash
bash scripts/setup-praxstack-skills-personas.sh
```

The script shallow-clones to `.cache/praxstack-skills-and-personas/` (gitignored), symlinks
skills into `.claude/skills/praxstack/`, and links persona source material under
`.claude/skills/_praxstack-source/`.

## What lives upstream

| Area | Path (upstream) | Integrated here |
| --- | --- | --- |
| **Canonical skills** | `new-skills/` (41 skills) | Symlinked into `.claude/skills/praxstack/<name>/` |
| **Legacy public skills** | `skills/` (4 promoted) | `teach-pro-max`, `superimprove`, `coding-agent-leadership-principles`, `cross-agent-handoff` |
| **Persona packs** | `personas/`, `md-personas/`, `team-personas/` | Reference only → `_praxstack-source/` |
| **Knowledge packs** | `knowledge-packs/` | Reference only → `_praxstack-source/knowledge-packs/` |
| **Paste prompts** | `prompts/` | Reference only → `_praxstack-source/prompts/` |
| **Claude subagents** | `.claude/agents/` | Reference → `_praxstack-source/claude-agents/` |
| **Goals system** | docs only | Paste `/goal` prompts (see below) — no SKILL.md |

Older `skills/` entries (brain-ingest, bulk-ingestion, etc.) are **superseded** by
`new-skills/` and are not installed by default. Install individually with:

```bash
npx skills add praxstack/skills-and-personas --skill <name>
```

## Canonical skill inventory (new-skills/)

**Orchestrators & modes:** `kingmode`, `super-mode-core`, `ultrathink-frontend`, `apex-autonomous-mode`, `autonomous-orchestrion`, `orchestrion-universal-agent-router`, `constellation-team`

**Backend PE (language variants):** `backend-pe`, `backend-pe-cpp`, `backend-pe-java`, `backend-pe-javascript`, `backend-pe-nodejs`, `backend-pe-python`, `backend-pe-python-ml`, `backend-pe-typescript`, `backend-architecture-standards`

**Constellation team roles:** `principal-engineer`, `backend-system-design-expert`, `devops-sre-engineer`, `frontend-uiux-designer`, `product-manager`, `qa-security-engineer`, `security-compliance-standards`, `frontend-excellence-standards`

**Design & docs:** `frontend-design-excellence`, `frontend-pe`, `svg-logo-designer`, `blueprint-creator`, `spec-creator`, `transcript-pipeline`, `transcribe-refiner`, `baron-von-markup`

**Learning:** `techtutor`, `gabriel-petersson-topdown-mentor`, `lecture-alchemist`, `professor-alex-interview`, `teach-pro-max` (legacy public)

**Personal intelligence:** `chronicle`, `idea-capturer`, `concept-cartographer`

**Other:** `obsidian-cli`, `mental-health-screening-companion` (see upstream [SAFETY.md](https://github.com/praxstack/skills-and-personas/blob/main/SAFETY.md))

## Personas (source material)

Raw persona packs are preserved for lineage. Prefer the converted skills above.

| Source | Examples |
| --- | --- |
| `md-personas/` | `KINGMODE.md`, `SUPER-MODE.md`, `CONSTELLATION-TEAM.md`, `FRONTEND-DESIGN.md` |
| `personas/` | `teach-pro-max-agent-persona/`, `ren-nakamura-all-agents-persona/` |
| `team-personas/constellation-team/` | Six role SKILL sources (now in `new-skills/`) |

Browse locally: `.claude/skills/_praxstack-source/`

## Goals (`/goal` paste pattern)

There is **no** dedicated `goal` skill in the upstream repo. Autonomous goal execution uses
a paste-ready prompt block documented in upstream research (e.g.
`docs/teach-pro-max/research/10-zero-api-autonomous-goal.md`).

Pattern:

```text
/goal <objective statement>

WORKING ROOT
<repo path>

MISSION
<scoped deliverables, authority, prohibitions, truthfulness gates>
```

Use with skills like `apex-autonomous-mode`, `super-mode-core`, or gstack `ship`/`spec` for
gated autonomous work. Copy templates from `_praxstack-source/` or upstream docs; customize
paths for this repo.

## Collision policy

The installer **skips** any skill name that already exists in `.claude/skills/` unless it is
already our symlink to the cache. Existing packs (superpowers, gstack, pstack, mattpocock,
flat library) are never overwritten.

Known overlap: `skill-creator` exists in both repos — local copy is preserved.

## Quality gates (optional, run from cache)

```bash
cd .cache/praxstack-skills-and-personas/new-skills
python3 _audit/lint.py
python3 _audit/smoke_test.py   # after install
```

## MCP needs

No MCP servers are required for praxstack skills. Skills are plain Markdown SOPs.

- **teach-pro-max** may reference Flint/SkillOpt integrations — optional, not wired here.
- Do not add shadow MCP configs to git; follow [`mcp-recommendations.md`](mcp-recommendations.md).

## Teach Pro Max

Full teaching system with runtime tools and research archive:

```bash
npx skills add praxstack/skills-and-personas --skill teach-pro-max
```

Docs: [skills.sh page](https://skills.sh/praxstack/skills-and-personas/teach-pro-max)
