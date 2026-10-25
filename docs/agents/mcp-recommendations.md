# MCP recommendations (governance)

Cloud Agents and CI **must not** add shadow MCP servers to `.cursor/mcp.json` without explicit user approval. Document official install paths here; enable each server in **Cursor Settings → MCP** on desktop.

## Approved candidates (install manually)

### Context7 — live library docs

**Package:** `@upstash/context7-mcp`  
**Use:** Up-to-date framework/library documentation in agent context (React, Next.js, etc.).

**Cursor desktop (`~/.cursor/mcp.json` or project `.cursor/mcp.json`):**

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

**Verify:** Ask the agent to fetch docs for a library version; Context7 should return current API references.

---

### Serena — semantic code retrieval

**Repo:** [oraios/serena](https://github.com/oraios/serena)  
**Use:** LSP-backed symbol search, definition lookup, and codebase navigation (pairs with Graphify).

**Install (follow upstream README):**

```bash
# Example — check serena repo for current install command
uv tool install serena   # or pip install per upstream
serena mcp --help
```

**Cursor:** Add the MCP entry documented in Serena's README (typically a `uvx` or `serena mcp` command).

**Verify:** Symbol lookup on a known function in this repo.

---

### Graphify MCP — knowledge graph

**CLI:** `graphify` / `graphify-mcp` (from `uv tool install graphifyy`)  
**Use:** Pre-built codebase knowledge graph; reduces hallucinated file paths.

**Project setup (already scripted):**

```bash
uv tool install graphifyy
graphify install --project
graphify cursor install    # writes .cursor/rules/graphify.mdc
```

**MCP server (optional — if using Runlayer or approved MCP config):**

```json
{
  "mcpServers": {
    "graphify": {
      "command": "graphify-mcp",
      "args": []
    }
  }
}
```

**Verify:** Run `/graphify .` then ask a codebase structure question; agent should cite graph-backed paths.

---

## Layering with the 2026 stack

| Layer | Tool | Role |
| --- | --- | --- |
| Docs freshness | Context7 | External API/docs not in repo |
| Code structure | Graphify (+ MCP) | Repo topology, call graphs |
| Deep navigation | Serena | LSP symbols, precise edits |
| UI proof | agent-browser / Browser Use MCP | Real browser QA |

Do **not** enable redundant codebase MCPs (Serena + Graphify + default codebase search) on every task — pick based on task type.

## Governance rules

1. **No unauthorized `.cursor/mcp.json` commits** — propose entries in this doc; user adds in Settings.
2. **Runlayer / team MCP** — if your org uses Runlayer, route through approved connectors only.
3. **Credentials** — Context7 and third-party MCPs may need API keys; store in Cursor Secrets, not git.
4. **Cloud Agents** — MCP tools available in Cloud are pre-configured by Cursor; do not duplicate with shadow configs.

## Related

- [workflow-pipeline.md](./workflow-pipeline.md) — when to use which layer
- [native-plugins.md](./native-plugins.md) — marketplace plugins vs MCP
