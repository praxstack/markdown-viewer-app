# Plan 001: Fix Vitest vendored skill test pollution

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 16ce3a5..HEAD -- vitest.config.js`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `16ce3a5`, 2026-08-29

## Why this matters

`npm test -- --run` currently exits non-zero because Vitest discovers test files
under `.cursor/skills/` (symlink to `.claude/skills/`). ESLint already ignores
both paths; Vitest only ignores `.claude/skills/**` and `.agents/skills/**`.
This breaks the one-command verification baseline and blocks CI from gating on
tests. Fixing excludes restores a trustworthy `npm test` gate for all downstream
plans (characterization tests, modularization).

## Current state

- `vitest.config.js` — Vitest config; `exclude` array omits `.cursor/skills/**`:

```javascript
// vitest.config.js:8
exclude: ['**/node_modules/**', '**/.claude/skills/**', '**/.agents/skills/**'],
```

- `eslint.config.js:16-24` — ESLint ignores `.claude/skills/**` and `.agents/skills/**` (and resolves `.agents` symlink); `.cursor/skills` is not listed but symlink target is ignored.
- `.cursor/skills` → `.claude/skills` (symlink per AGENTS.md).
- Failing test files (when running bare `npm test -- --run`):
  - `.cursor/skills/pstack/poteto-mode/scripts/orch/orch.test.ts` (imports `bun:test`)
  - `.cursor/skills/webmcpify/templates/webmcp.spec.ts`
  - Additional `poteto-mode/scripts/watch-pr/*.test.ts` files

- App tests (12 files, 456 tests) all pass when vendored paths are excluded.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Tests | `npm test -- --run` | exit 0; 12 test files passed; 456 tests passed |
| Lint | `npm run lint` | exit 0 (4 warnings acceptable) |

## Scope

**In scope**:
- `vitest.config.js`

**Out of scope**:
- Deleting or modifying anything under `.claude/skills/`
- Changing ESLint config (already sufficient via symlink target)
- Adding CI workflow changes (plan 004)

## Git workflow

- Branch: `advisor/001-fix-vitest-skill-excludes` (or operator-specified)
- Commit message style: match repo — e.g. `fix(test): exclude .cursor/skills from Vitest discovery`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add `.cursor/skills/**` to Vitest exclude list

In `vitest.config.js`, extend the `exclude` array to mirror ESLint coverage for
all skill discovery symlinks:

```javascript
exclude: [
  '**/node_modules/**',
  '**/.claude/skills/**',
  '**/.agents/skills/**',
  '**/.cursor/skills/**',
],
```

**Verify**: `grep -n "cursor/skills" vitest.config.js` → shows the new entry.

### Step 2: Confirm full test suite passes

**Verify**: `npm test -- --run` → exit 0; output includes `Test Files  12 passed (12)` and `Tests  456 passed (456)` with no FAIL lines referencing `.cursor/skills` or `.claude/skills`.

### Step 3: Confirm Vitest still finds app tests

**Verify**: `npm test -- --run tests/unit/services/LinkNavigationService.test.js` → exit 0.

## Test plan

- No new tests required — this plan restores the existing suite's exit code.
- Verification: `npm test -- --run` → all 456 app tests pass, 0 vendored skill failures.

## Done criteria

- [ ] `vitest.config.js` excludes `**/.cursor/skills/**`
- [ ] `npm test -- --run` exits 0 with 12 test files / 456 tests
- [ ] No files outside scope modified
- [ ] `plans/README.md` status row for 001 updated to DONE

## STOP conditions

Stop and report if:

- `vitest.config.js` structure differs (e.g. exclude moved to a shared config import).
- After adding the exclude, `npm test -- --run` still reports failures under any `skills/` path.
- App test count drops below 456 (regression in discovery).

## Maintenance notes

- If a fourth skill symlink path is added (per AGENTS.md), add it to both
  `eslint.config.js` ignores and `vitest.config.js` exclude in the same PR.
- Reviewers should confirm no vendored `*.test.ts` / `*.spec.ts` under skill paths
  are intended to run in this app's CI.
