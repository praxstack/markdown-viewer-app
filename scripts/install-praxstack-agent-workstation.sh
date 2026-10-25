#!/usr/bin/env bash
# PraxStack full agent workstation setup — idempotent master installer.
# Runs gstack runtime, skill arsenal, 2026 discovery/research/UI skills,
# OpenSpec + Graphify + Impeccable when tools are available, and prints verification.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

log() { printf 'praxstack-setup: %s\n' "$*"; }
warn() { printf 'praxstack-setup: [warn] %s\n' "$*" >&2; }

install_global_skill() {
  local repo="$1"
  shift
  log "Global skill: $repo $*"
  npx skills@latest add "$repo" "$@" -g -a cursor -a claude-code -y 2>/dev/null \
    || warn "Global install failed for $repo (may land in ~/.agents/skills only)"
}

install_project_skill() {
  local repo="$1"
  shift
  log "Project skill: $repo $*"
  npx skills@latest add "$repo" "$@" -a cursor -a claude-code -y \
    || warn "Project install failed for $repo"
}

ensure_skills_symlinks() {
  if [ ! -L .cursor/skills ] || [ "$(readlink .cursor/skills)" != "../.claude/skills" ]; then
    log "Restoring .cursor/skills → .claude/skills symlink"
    rm -rf .cursor/skills
    ln -sf ../.claude/skills .cursor/skills
  fi
  if [ ! -L .agents/skills ] || [ "$(readlink .agents/skills)" != "../.claude/skills" ]; then
    log "Restoring .agents/skills → .claude/skills symlink"
    rm -rf .agents/skills
    ln -sf ../.claude/skills .agents/skills
  fi
}

# npx skills can leave self-referential broken symlinks (e.g. ai-debt-detector).
repair_broken_skill_entries() {
  local skill
  for skill in ai-debt-detector session-guard; do
    for base in .claude/skills .agents/skills; do
      if [ -L "${base}/${skill}" ] && [ ! -e "${base}/${skill}" ]; then
        warn "Removing broken symlink ${base}/${skill}"
        rm -f "${base}/${skill}"
      fi
    done
  done
}

write_pstack_models() {
  local dest="${HOME}/.cursor/rules/pstack-models.mdc"
  if [ -f "$dest" ]; then
    log "pstack-models.mdc already exists — skipping (run /setup-pstack to customize)"
    return 0
  fi
  mkdir -p "$(dirname "$dest")"
  cat > "$dest" << 'EOF'
---
description: pstack per-role model choices (overrides skill defaults)
alwaysApply: true
---
# pstack model configuration. Re-run /setup-pstack in Cursor to customize per model.
feature, refactoring: inherit-parent
bug-fix: inherit-parent
perf-issue: inherit-parent
hillclimb: inherit-parent
judgment and prose: inherit-parent
hardest tasks: inherit-parent
how explorer: inherit-parent
how explainer: inherit-parent
how critics: inherit-parent, inherit-parent, inherit-parent, inherit-parent
why investigators: inherit-parent
why synthesizer: inherit-parent
reflect tooling: inherit-parent
reflect judgment, divergent, synthesizer: inherit-parent
arena runners: inherit-parent, inherit-parent, inherit-parent, inherit-parent
arena cross-judge pool: inherit-parent, inherit-parent, inherit-parent, inherit-parent
swarm workers: inherit-parent
architect runners: inherit-parent, inherit-parent, inherit-parent, inherit-parent
interrogate reviewers: inherit-parent, inherit-parent, inherit-parent, inherit-parent
EOF
  log "Wrote default $dest (inherit-parent — customize via /setup-pstack)"
}

init_openspec() {
  if ! command -v npx >/dev/null 2>&1; then
    warn "npx missing — skip OpenSpec"
    return 0
  fi
  if [ ! -f package.json ]; then
    warn "No package.json — skip OpenSpec npm install"
    return 0
  fi
  log "Installing OpenSpec (dev dependency)"
  npm install -D @fission-ai/openspec@latest 2>/dev/null \
    || warn "OpenSpec npm install failed (global npm may lack permissions; use project-local npx)"
  if [ -d openspec/config.yaml ] || [ -f openspec/config.yaml ]; then
    log "OpenSpec already initialized"
  else
    log "Initializing OpenSpec"
    npx openspec init --force 2>/dev/null || npx openspec init 2>/dev/null \
      || warn "openspec init failed — run manually: npx openspec init --force"
  fi
}

init_graphify() {
  export PATH="${HOME}/.local/bin:${PATH}"
  if ! command -v graphify >/dev/null 2>&1; then
    if command -v uv >/dev/null 2>&1; then
      log "Installing graphify via uv"
      uv tool install graphifyy 2>/dev/null || warn "uv tool install graphifyy failed"
    else
      warn "graphify not found and uv missing — skip (see docs/agents/mcp-recommendations.md)"
      return 0
    fi
  fi
  if command -v graphify >/dev/null 2>&1; then
    log "Running graphify install --project"
    graphify install --project 2>/dev/null || true
    graphify cursor install 2>/dev/null || true
  fi
}

init_impeccable() {
  log "Installing Impeccable (project-local, non-interactive)"
  printf '1\nproject\n' | npx impeccable skills install 2>/dev/null \
    || warn "impeccable skills install failed — run: npx impeccable skills install"
}

print_verification() {
  cat << 'EOF'

=== PraxStack verification checklist ===

Skills count (global + project):
EOF
  find "${HOME}/.cursor/skills" "${REPO_ROOT}/.claude/skills" -name 'SKILL.md' 2>/dev/null \
    | sort -u | wc -l | xargs -I{} echo "  SKILL.md files (deduped): {}"

  echo ""
  echo "gstack slash commands (global):"
  ls "${HOME}/.cursor/skills"/gstack-* 2>/dev/null | head -5 | sed 's/^/  /' || echo "  (none — re-run setup-gstack-full.sh)"

  echo ""
  echo "praxstack skills (project):"
  for s in kingmode constellation-team teach-pro-max superimprove backend-pe techtutor; do
    if [ -f "${REPO_ROOT}/.claude/skills/praxstack/${s}/SKILL.md" ]; then
      echo "  ✓ ${s}"
    else
      echo "  ✗ ${s} (missing — run setup-praxstack-skills-personas.sh)"
    fi
  done

  echo ""
  echo "2026 stack skills (project):"
  for s in deep-research last30days hallmark openspec-propose graphify impeccable ai-debt-detector session-guard; do
    if [ -f "${REPO_ROOT}/.claude/skills/${s}/SKILL.md" ]; then
      echo "  ✓ ${s}"
    else
      echo "  ✗ ${s} (missing)"
    fi
  done

  echo ""
  echo "CLI tools:"
  command -v graphify >/dev/null && echo "  ✓ graphify: $(command -v graphify)" || echo "  ✗ graphify"
  (command -v openspec >/dev/null || npx openspec --version >/dev/null 2>&1) \
    && echo "  ✓ openspec (npx or PATH)" || echo "  ✗ openspec"

  echo ""
  echo "Rules:"
  test -f "${HOME}/.cursor/rules/pstack-models.mdc" && echo "  ✓ ~/.cursor/rules/pstack-models.mdc" \
    || echo "  ✗ pstack-models.mdc"
  test -f "${REPO_ROOT}/.cursor/rules/graphify.mdc" && echo "  ✓ .cursor/rules/graphify.mdc" \
    || echo "  ✗ graphify.mdc (optional)"

  echo ""
  echo "Matt Pocock agent docs:"
  for f in issue-tracker.md triage-labels.md domain.md; do
    test -f "${REPO_ROOT}/docs/agents/${f}" && echo "  ✓ docs/agents/${f}" \
      || echo "  ✗ docs/agents/${f} — run /setup-matt-pocock-skills"
  done

  echo ""
  echo "Tests (exclude vendored skills):"
  echo "  npm test -- --run --exclude '.cursor/skills/**'"

  echo ""
  echo "MCP (desktop only — user must approve in Cursor Settings):"
  echo "  See docs/agents/mcp-recommendations.md"

  echo ""
  echo "Native plugins (desktop /add-plugin):"
  echo "  See docs/agents/native-plugins.md"
}

main() {
  log "Phase 1: gstack runtime + slash commands"
  bash "$SCRIPT_DIR/setup-gstack-full.sh"

  log "Phase 2: praxstack skills-and-personas"
  bash "$SCRIPT_DIR/setup-praxstack-skills-personas.sh"

  log "Phase 3: flat skill arsenal"
  bash "$SCRIPT_DIR/install-skill-arsenal.sh"

  log "Phase 4: 2026 discovery / research / UI skills"
  install_global_skill 24601/agent-deep-research --skill deep-research
  install_global_skill mvanhorn/last30days-skill --skill last30days
  install_global_skill nutlope/hallmark --skill hallmark \
    || install_global_skill Nutlope/hallmark --skill hallmark
  install_project_skill 24601/agent-deep-research --skill deep-research
  install_project_skill mvanhorn/last30days-skill --skill last30days
  install_project_skill nutlope/hallmark --skill hallmark

  log "Phase 5: selective wshobson/agents examples (not full 94-plugin pack)"
  repair_broken_skill_entries
  install_project_skill wshobson/agents --skill ai-debt-detector --skill session-guard \
    || warn "wshobson/agents selective install failed — pick skills manually from marketplace"

  ensure_skills_symlinks

  log "Phase 6: pstack model defaults"
  write_pstack_models

  log "Phase 7: repo-local tools"
  init_openspec
  init_graphify
  init_impeccable
  ensure_skills_symlinks

  log "Setup complete."
  print_verification
}

main "$@"
