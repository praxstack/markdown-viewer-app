# Plan 004: Add CI test and lint gates

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 16ce3a5..HEAD -- .github/workflows/`

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001-fix-vitest-skill-excludes.md
- **Category**: dx
- **Planned at**: commit `16ce3a5`, 2026-08-29

## Why this matters

GitHub Actions workflow `.github/workflows/deploy.yml` runs `npm ci` and
`npm run build` on every push to `main` but never runs `npm test` or
`npm run lint`. Broken tests or lint errors can deploy to GitHub Pages.
Adding gates after plan 001 ensures CI matches local verification.

## Current state

`.github/workflows/deploy.yml` — build job steps:

```yaml
- run: npm ci
- run: npm run build
# no test or lint steps
```

Local verification commands (from `package.json`):

- `npm test` → vitest (must exit 0 after plan 001)
- `npm run lint` → eslint (currently 0 errors, 4 warnings)

Node version in CI: `'20'`.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Tests | `npm test -- --run` | exit 0 |
| Lint | `npm run lint` | exit 0 |
| Build | `npm run build` | exit 0 |

## Scope

**In scope**:
- `.github/workflows/deploy.yml` OR new `.github/workflows/ci.yml`

**Out of scope**:
- Enforcing `--max-warnings 0` (would fail on 4 existing script.js warnings)
- Coverage thresholds in CI
- npm audit in CI

## Git workflow

- Branch: `advisor/004-ci-test-lint-gates`
- Commit: `ci: run tests and lint before GitHub Pages deploy`
- Do NOT push unless instructed.

## Steps

### Step 1: Add verify job or steps

Option A (minimal): Insert before Build in existing workflow:

```yaml
- name: Lint
  run: npm run lint

- name: Test
  run: npm test -- --run
```

Option B (preferred): Separate `ci.yml` on `pull_request` + `push` to `main`
with lint+test; keep deploy depending on ci success.

**Verify**: YAML valid; steps reference `npm test -- --run` (non-watch).

### Step 2: Local simulation

**Verify**:

```bash
npm ci
npm run lint
npm test -- --run
npm run build
```

All exit 0.

## Test plan

- No new unit tests.
- Verification: push to branch and confirm GitHub Actions runs new steps (if operator pushes).

## Done criteria

- [ ] CI workflow runs `npm run lint` and `npm test -- --run` before deploy (or in parallel required job)
- [ ] Local simulation commands all exit 0
- [ ] `plans/README.md` row 004 → DONE

## STOP conditions

Stop and report if:

- Plan 001 not done and `npm test -- --run` still fails locally.
- Operator wants warnings-as-errors but 4 max-lines-per-function warnings remain — do not add `--max-warnings 0` without separate cleanup plan.

## Maintenance notes

- When plan 005 lands, CI automatically covers new preview tests.
- Consider separate workflow for PRs vs deploy if deploy latency becomes an issue.
