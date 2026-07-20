#!/usr/bin/env bash
# site-sync.sh — keep local clone + GitHub Pages in step with origin
#
# 1. Pull main (ff-only)
# 2. Run publications sync from data/publications.json
# 3. If dirty: commit + push (so Pages rebuilds)
#
# Install as launchd (see scripts/install-site-sync-launchd.sh) or cron:
#   0 */6 * * * /Users/vaquez/templetwo.github.io/scripts/site-sync.sh >>~/.temple-site-sync.log 2>&1

set -euo pipefail

REPO="${TEMPLE_SITE_REPO:-$HOME/templetwo.github.io}"
LOG_PREFIX="[site-sync $(date -u +%Y-%m-%dT%H:%MZ)]"

cd "$REPO"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "$LOG_PREFIX ERROR: not a git repo: $REPO" >&2
  exit 1
fi

# Stash only if dirty and not our own half-finished work we should preserve
if ! git diff --quiet || ! git diff --cached --quiet; then
  if [[ "${TEMPLE_SITE_SYNC_FORCE:-}" != "1" ]]; then
    echo "$LOG_PREFIX skip: working tree dirty (set TEMPLE_SITE_SYNC_FORCE=1 to stash/pull)"
    exit 0
  fi
  git stash push -u -m "site-sync auto-stash $(date -u +%Y%m%dT%H%M%SZ)"
fi

git fetch origin main
git checkout main
git pull --ff-only origin main

python3 scripts/sync_publications.py

if git diff --quiet && git diff --cached --quiet; then
  echo "$LOG_PREFIX ok: already in sync with publications.json @ $(git rev-parse --short HEAD)"
  exit 0
fi

git add -A
git commit -m "chore(site): sync publications surfaces from data/publications.json

Auto-run by site-sync (local launchd / manual). Source of truth: data/publications.json."
git push origin main
echo "$LOG_PREFIX pushed: $(git rev-parse --short HEAD) — Pages will rebuild"
