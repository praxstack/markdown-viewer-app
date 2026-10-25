#!/usr/bin/env bash
# Install praxstack/skills-and-personas into the project skill tree.
# - Clones/updates a shallow cache under .cache/
# - Symlinks canonical new-skills/ into .claude/skills/ (collision-safe)
# - Symlinks legacy public skills from skills/ (teach-pro-max, superimprove, etc.)
# - Links persona source material under .claude/skills/_praxstack-source/
#
# Idempotent. Re-run to refresh after upstream updates.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

REPO_URL="${PRAXSTACK_SKILLS_REPO:-https://github.com/praxstack/skills-and-personas.git}"
CACHE_DIR="${REPO_ROOT}/.cache/praxstack-skills-and-personas"
SKILLS_DEST="${REPO_ROOT}/.claude/skills"
PACK_DEST="${SKILLS_DEST}/praxstack"
SOURCE_LINK="${SKILLS_DEST}/_praxstack-source"

# Legacy skills/ entries promoted in upstream README (not duplicated in new-skills/).
LEGACY_PUBLIC_SKILLS=(
  teach-pro-max
  superimprove
  coding-agent-leadership-principles
  cross-agent-handoff
)

log() { printf 'praxstack-skills: %s\n' "$*"; }
warn() { printf 'praxstack-skills: [warn] %s\n' "$*" >&2; }

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

clone_or_update() {
  if [ -d "$CACHE_DIR/.git" ]; then
    log "Updating cache: $CACHE_DIR"
    git -C "$CACHE_DIR" fetch --depth 1 origin main
    git -C "$CACHE_DIR" checkout -q main
    git -C "$CACHE_DIR" reset --hard -q origin/main
  else
    log "Cloning $REPO_URL → $CACHE_DIR"
    mkdir -p "$(dirname "$CACHE_DIR")"
    git clone --depth 1 --branch main "$REPO_URL" "$CACHE_DIR"
  fi
}

link_skill_dir() {
  local src="$1"
  local name
  name="$(basename "$src")"
  local dest="${PACK_DEST}/${name}"

  if [ ! -f "${src}/SKILL.md" ]; then
    return 0
  fi

  mkdir -p "$PACK_DEST"

  if [ -e "$dest" ]; then
    if [ -L "$dest" ] && [ "$(readlink "$dest")" = "$src" ]; then
      log "  ✓ ${name} (already linked)"
      return 0
    fi
    warn "  skip ${name} — ${dest} exists (not our symlink; preserving local copy)"
    return 0
  fi

  ln -sf "$src" "$dest"
  log "  + ${name}"
}

install_new_skills() {
  log "Installing canonical new-skills/ (41 production skills)"
  local src_dir
  for src_dir in "$CACHE_DIR"/new-skills/*/; do
    local name
    name="$(basename "$src_dir")"
    [[ "$name" == _* ]] && continue
    link_skill_dir "${src_dir%/}"
  done
}

install_legacy_public_skills() {
  log "Installing legacy public skills/ (README-promoted only)"
  local name
  for name in "${LEGACY_PUBLIC_SKILLS[@]}"; do
    link_skill_dir "${CACHE_DIR}/skills/${name}"
  done
}

link_persona_sources() {
  log "Linking persona source material → ${SOURCE_LINK}"
  mkdir -p "$SKILLS_DEST"
  rm -rf "$SOURCE_LINK"
  mkdir -p "$SOURCE_LINK"

  for sub in personas md-personas team-personas knowledge-packs prompts; do
    if [ -d "${CACHE_DIR}/${sub}" ]; then
      ln -sf "${CACHE_DIR}/${sub}" "${SOURCE_LINK}/${sub}"
      log "  + ${sub}/"
    fi
  done

  if [ -d "${CACHE_DIR}/.claude/agents" ]; then
    ln -sf "${CACHE_DIR}/.claude/agents" "${SOURCE_LINK}/claude-agents"
    log "  + claude-agents/ (constellation subagents)"
  fi
}

print_summary() {
  local before="${1:-0}"
  local after
  after="$(count_skills)"

  cat << EOF

=== praxstack/skills-and-personas summary ===

Cache:     ${CACHE_DIR}
Skills:    ${PACK_DEST}/
Personas:  ${SOURCE_LINK}/

SKILL.md count: ${before} → ${after} (+$((after - before)))

Canonical pack (new-skills/): kingmode, constellation-team, backend-pe-*, teach via techtutor, etc.
Legacy public: teach-pro-max, superimprove, coding-agent-leadership-principles, cross-agent-handoff
Persona sources: md-personas/, personas/, team-personas/ (reference — converted skills preferred)

Goals: no /goal skill — use paste prompts from docs/agents/praxstack-skills-personas.md

Smoke test (optional):
  python3 ${CACHE_DIR}/new-skills/_audit/smoke_test.py

Reload Cursor after install to refresh skill discovery.
EOF
}

count_skills() {
  # praxstack pack + nested vendored packs; follow symlinks.
  # find may exit 1 on circular symlinks (ai-debt-detector) — ignore with || true.
  { find -L "$SKILLS_DEST" -name 'SKILL.md' \
      ! -path '*/_praxstack-source/*' 2>/dev/null || true; } | wc -l | tr -d ' '
}

main() {
  local count_before
  count_before="$(count_skills)"

  ensure_skills_symlinks
  clone_or_update
  install_new_skills
  install_legacy_public_skills
  link_persona_sources
  ensure_skills_symlinks

  print_summary "$count_before"
}

main "$@"
