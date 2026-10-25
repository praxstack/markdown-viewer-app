#!/usr/bin/env bash
# Idempotent full gstack runtime setup: Bun + upstream gstack build + sidecar links.
# Keeps vendored skill markdown in git; fetches bin/lib/browse at setup time.
set -euo pipefail

GSTACK_REPO_URL="${GSTACK_REPO_URL:-https://github.com/garrytan/gstack.git}"
GSTACK_REF="${GSTACK_REF:-main}"
GSTACK_CACHE="${GSTACK_CACHE_DIR:-${XDG_CACHE_HOME:-$HOME/.cache}/gstack-upstream}"
GSTACK_HOST="${GSTACK_HOST:-cursor}"
BUN_VERSION="${BUN_VERSION:-1.2.21}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

log() {
  printf 'setup-gstack-full: %s\n' "$*"
}

ensure_bun() {
  if command -v bun >/dev/null 2>&1; then
    log "bun already installed ($(bun --version))"
    return 0
  fi

  log "Installing Bun ${BUN_VERSION}..."
  export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
  curl -fsSL "https://bun.sh/install" | bash -s "bun-v${BUN_VERSION}"
  export PATH="$BUN_INSTALL/bin:$PATH"

  if ! command -v bun >/dev/null 2>&1; then
    echo "setup-gstack-full: bun install finished but bun is not on PATH" >&2
    exit 1
  fi
  log "bun installed ($(bun --version))"
}

sync_gstack_cache() {
  if [ -d "$GSTACK_CACHE" ] && [ ! -d "$GSTACK_CACHE/.git" ]; then
    log "Removing invalid gstack cache at $GSTACK_CACHE"
    rm -rf "$GSTACK_CACHE"
  fi

  if [ -d "$GSTACK_CACHE/.git" ]; then
    log "Updating gstack cache at $GSTACK_CACHE (ref: $GSTACK_REF)"
    git -C "$GSTACK_CACHE" fetch --depth 1 origin "$GSTACK_REF"
    git -C "$GSTACK_CACHE" checkout -q FETCH_HEAD
    git -C "$GSTACK_CACHE" reset -q --hard FETCH_HEAD
  else
    log "Cloning gstack into $GSTACK_CACHE (ref: $GSTACK_REF)"
    mkdir -p "$(dirname "$GSTACK_CACHE")"
    git clone --depth 1 --branch "$GSTACK_REF" "$GSTACK_REPO_URL" "$GSTACK_CACHE" 2>/dev/null \
      || git clone --depth 1 "$GSTACK_REPO_URL" "$GSTACK_CACHE"
    if [ "$GSTACK_REF" != "main" ]; then
      git -C "$GSTACK_CACHE" fetch --depth 1 origin "$GSTACK_REF"
      git -C "$GSTACK_CACHE" checkout -q FETCH_HEAD
    fi
  fi
}

link_or_replace() {
  local src="$1"
  local dst="$2"

  if [ ! -e "$src" ]; then
    log "skip link (missing source): $src"
    return 0
  fi

  mkdir -p "$(dirname "$dst")"
  if [ -e "$dst" ] || [ -L "$dst" ]; then
    rm -rf "$dst"
  fi
  ln -sf "$src" "$dst"
}

link_runtime_sidecar() {
  local cache_root="$1"
  local target_root="$2"

  mkdir -p "$target_root"

  for asset in bin lib; do
    if [ -d "$cache_root/$asset" ]; then
      link_or_replace "$cache_root/$asset" "$target_root/$asset"
    fi
  done

  if [ -d "$cache_root/browse/dist" ] || [ -d "$cache_root/browse/bin" ]; then
    mkdir -p "$target_root/browse"
    if [ -d "$cache_root/browse/dist" ]; then
      link_or_replace "$cache_root/browse/dist" "$target_root/browse/dist"
    fi
    if [ -d "$cache_root/browse/bin" ]; then
      link_or_replace "$cache_root/browse/bin" "$target_root/browse/bin"
    fi
  fi

  if [ -f "$cache_root/VERSION" ]; then
    link_or_replace "$cache_root/VERSION" "$target_root/VERSION"
  fi

  if [ -f "$cache_root/supabase/config.sh" ]; then
    mkdir -p "$target_root/supabase"
    link_or_replace "$cache_root/supabase/config.sh" "$target_root/supabase/config.sh"
  fi

  if [ -f "$cache_root/gstack-upgrade/SKILL.md" ]; then
    mkdir -p "$target_root/gstack-upgrade"
    link_or_replace "$cache_root/gstack-upgrade/SKILL.md" "$target_root/gstack-upgrade/SKILL.md"
  fi
}

ensure_upstream_build() {
  local config_bin="$GSTACK_CACHE/bin/gstack-config"
  if [ -x "$config_bin" ] && [ -f "$GSTACK_CACHE/VERSION" ]; then
    log "Upstream runtime already built, skipping initial build"
    return 0
  fi

  log "Building upstream gstack runtime in $GSTACK_CACHE"
  (
    cd "$GSTACK_CACHE"
    ./setup --host "$GSTACK_HOST"
  )
}

install_host_skills() {
  # Slash commands (e.g. /plan-ceo-review) are registered by upstream ./setup into
  # host-specific global skill dirs (~/.cursor/skills/gstack-* for Cursor).
  # Vendored .claude/skills/gstack/ markdown alone does NOT create slash commands.
  if [ "${GSTACK_INSTALL_HOST_SKILLS:-1}" != "1" ]; then
    log "Skipping host skill install (GSTACK_INSTALL_HOST_SKILLS=0)"
    return 0
  fi

  log "Installing gstack skills for host '$GSTACK_HOST' (slash-command discovery)"
  (
    cd "$GSTACK_CACHE"
    ./setup --host "$GSTACK_HOST"
  )
}

link_repo_and_global_sidecars() {
  local target

  for target in \
    "$REPO_ROOT/.claude/skills/gstack" \
    "$REPO_ROOT/.agents/skills/gstack"; do
    if [ -d "$target" ]; then
      log "Linking runtime sidecar into $target"
      link_runtime_sidecar "$GSTACK_CACHE" "$target"
    fi
  done

  mkdir -p "$HOME/.claude/skills/gstack"
  log "Linking runtime sidecar into $HOME/.claude/skills/gstack"
  link_runtime_sidecar "$GSTACK_CACHE" "$HOME/.claude/skills/gstack"
}

# Cursor discovers flat gstack-* skill dirs (e.g. gstack-plan-ceo-review), not the
# nested gstack/plan-ceo-review/ tree used for Claude Code. Link generated cursor
# skills into the project skill tree so .cursor/skills (→ .claude/skills) picks them up.
link_cursor_project_skills() {
  local cursor_src="$GSTACK_CACHE/.cursor/skills"
  local project_skills="$REPO_ROOT/.claude/skills"
  local skill_dir skill_name linked=0

  if [ ! -d "$cursor_src" ]; then
    log "skip cursor project skills (missing $cursor_src — re-run upstream ./setup --host cursor)"
    return 0
  fi

  for skill_dir in "$cursor_src"/gstack-*/; do
    [ -d "$skill_dir" ] || continue
    [ -f "$skill_dir/SKILL.md" ] || continue
    skill_name="$(basename "$skill_dir")"
    link_or_replace "$skill_dir" "$project_skills/$skill_name"
    linked=$((linked + 1))
  done

  if [ "$linked" -gt 0 ]; then
    log "Linked $linked Cursor gstack skill(s) into $project_skills (e.g. gstack-plan-ceo-review)"
  fi
}

verify_runtime() {
  local browse_bin="$GSTACK_CACHE/browse/dist/browse"
  local config_bin="$GSTACK_CACHE/bin/gstack-config"

  if [ ! -x "$config_bin" ]; then
    echo "setup-gstack-full: expected executable missing: $config_bin" >&2
    exit 1
  fi

  if [ ! -x "$browse_bin" ]; then
    echo "setup-gstack-full: browse binary missing or not executable: $browse_bin" >&2
    exit 1
  fi

  log "gstack-config: OK"
  log "browse binary: $browse_bin"
}

verify_cursor_skills() {
  if [ "$GSTACK_HOST" != "cursor" ]; then
    return 0
  fi

  local cursor_skills="${CURSOR_SKILLS_DIR:-$HOME/.cursor/skills}"
  if [ -d "$cursor_skills/gstack-plan-ceo-review" ] || [ -L "$cursor_skills/gstack-plan-ceo-review" ]; then
    log "Cursor slash skills: OK (~/.cursor/skills/gstack-*)"
    return 0
  fi

  echo "setup-gstack-full: expected Cursor skill missing: $cursor_skills/gstack-plan-ceo-review" >&2
  echo "setup-gstack-full: re-run with GSTACK_REF=main if an old cache rejected --host cursor (gstack#2361)" >&2
  exit 1
}

main() {
  ensure_bun
  sync_gstack_cache
  ensure_upstream_build
  link_repo_and_global_sidecars
  link_cursor_project_skills
  verify_runtime
  install_host_skills
  verify_cursor_skills
  log "Full gstack runtime is ready (cache: $GSTACK_CACHE, ref: $GSTACK_REF, host: $GSTACK_HOST)"
}

main "$@"
