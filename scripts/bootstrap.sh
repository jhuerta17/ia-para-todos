#!/usr/bin/env bash
# bootstrap.sh — Initialize and validate the ia-para-todos repository.
#
# Local-only by default. Remote creation requires explicit flags plus
# interactive confirmation. Idempotent: safe to run more than once.
# Never overwrites content, never force-pushes, never deletes repos.
#
# Usage:
#   ./scripts/bootstrap.sh [--local-only] [--help]
#   ./scripts/bootstrap.sh --create-remote --repo-name ia-para-todos --public --confirm-public
#
# SPDX-License-Identifier: MIT
set -euo pipefail

REPO_NAME="ia-para-todos"
MODE="local"
VISIBILITY="private"
CONFIRM_PUBLIC="no"

usage() {
  cat <<'EOF'
Usage: bootstrap.sh [OPTIONS]

  --local-only            Initialize/verify locally only (default).
  --create-remote         Also create the GitHub repo and set origin (needs gh).
  --repo-name NAME        Remote repository name (default: ia-para-todos).
  --public                Create the remote as public (requires --confirm-public
                          plus an interactive yes). Default is private.
  --confirm-public        Acknowledge you intend a PUBLIC repository.
  -h, --help              Show this help.

Examples:
  ./scripts/bootstrap.sh
  ./scripts/bootstrap.sh --create-remote --repo-name ia-para-todos
  ./scripts/bootstrap.sh --create-remote --repo-name ia-para-todos --public --confirm-public
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --local-only) MODE="local"; shift ;;
    --create-remote) MODE="remote"; shift ;;
    --repo-name) REPO_NAME="${2:?--repo-name needs a value}"; shift 2 ;;
    --public) VISIBILITY="public"; shift ;;
    --confirm-public) CONFIRM_PUBLIC="yes"; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage; exit 1 ;;
  esac
done

# --- Platform check (macOS and Linux) -------------------------------------
OS="$(uname -s)"
if [ "$OS" != "Darwin" ] && [ "$OS" != "Linux" ]; then
  echo "Unsupported OS: $OS (macOS and Linux only)." >&2
  exit 1
fi
echo "Platform: $OS"

# --- Git check / init ------------------------------------------------------
if ! command -v git >/dev/null 2>&1; then
  echo "ERROR: git is not installed. Install git first." >&2
  exit 1
fi

if [ ! -d ".git" ]; then
  echo "No git repository found. Initializing..."
  git init
else
  echo "Git repository already initialized."
fi

# Default branch: main (local rename only; never touches remotes).
CURRENT_BRANCH="$(git branch --show-current 2>/dev/null || true)"
if [ -z "$CURRENT_BRANCH" ]; then
  # Unborn HEAD (no commits yet): point it at main without renaming anything.
  git symbolic-ref HEAD refs/heads/main
  echo "Default branch set to main."
elif [ "$CURRENT_BRANCH" != "main" ]; then
  git branch -M main
  echo "Renamed local branch '$CURRENT_BRANCH' to main."
else
  echo "Already on branch main."
fi

# --- Verify structure (create missing dirs, never touch files) --------------
REQUIRED_DIRS="docs/organization docs/strategy docs/nonprofit docs/roadmap docs/operations docs/safety docs/brand workshops templates assets scripts .github"
MISSING_FILES=""
for d in $REQUIRED_DIRS; do
  if [ ! -d "$d" ]; then
    echo "Creating missing directory: $d"
    mkdir -p "$d"
  fi
done

REQUIRED_FILES="README.md README.es.md CONTRIBUTING.md CODE_OF_CONDUCT.md SECURITY.md LICENSE .gitignore .editorconfig docs/README.md scripts/bootstrap.sh scripts/validate-docs.sh"
for f in $REQUIRED_FILES; do
  if [ ! -f "$f" ]; then
    MISSING_FILES="$MISSING_FILES $f"
  fi
done
if [ -n "$MISSING_FILES" ]; then
  echo "ERROR: required files are missing (not created automatically):$MISSING_FILES" >&2
  exit 1
fi
echo "Required directories and files verified."

# --- Validate docs if the checker exists ------------------------------------
if [ -x "scripts/validate-docs.sh" ]; then
  echo "Running docs validation..."
  ./scripts/validate-docs.sh
else
  echo "WARNING: scripts/validate-docs.sh not executable; skipping." >&2
fi

if [ "$MODE" = "local" ]; then
  echo "Local setup complete. Nothing was pushed anywhere."
  exit 0
fi

# --- Remote creation (explicit, confirmed, non-destructive) ------------------
if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: GitHub CLI (gh) is not installed. Install it or stay local-only." >&2
  exit 1
fi
if ! gh auth status >/dev/null 2>&1; then
  echo "ERROR: gh is not authenticated. Run 'gh auth login' first." >&2
  exit 1
fi

if git remote get-url origin >/dev/null 2>&1; then
  echo "Remote 'origin' already set to: $(git remote get-url origin)"
  echo "Nothing to create. Push manually with 'git push -u origin main' if desired."
  exit 0
fi

if [ "$VISIBILITY" = "public" ]; then
  if [ "$CONFIRM_PUBLIC" != "yes" ]; then
    echo "ERROR: creating a PUBLIC repository requires --confirm-public." >&2
    exit 1
  fi
  printf 'Type the repository name to confirm PUBLIC creation of "%s": ' "$REPO_NAME"
  read -r ANSWER
  if [ "$ANSWER" != "$REPO_NAME" ]; then
    echo "Confirmation did not match. Aborting — nothing was created." >&2
    exit 1
  fi
fi

echo "Creating $VISIBILITY repository '$REPO_NAME' (no push performed)..."
if [ "$VISIBILITY" = "public" ]; then
  gh repo create "$REPO_NAME" --public --source=. --remote=origin \
    --description "An open community initiative making AI and digital literacy education accessible to everyone, starting with Spanish-speaking and underserved communities."
else
  gh repo create "$REPO_NAME" --private --source=. --remote=origin \
    --description "An open community initiative making AI and digital literacy education accessible to everyone, starting with Spanish-speaking and underserved communities."
fi

echo "Remote created and set as origin. Review, commit, then push with:"
echo "  git push -u origin main"
echo "This script never pushes automatically."
