#!/usr/bin/env bash
# validate-docs.sh — Lightweight repository checks.
#
# Checks: required files, relative Markdown links, workshop file
# completeness, shell syntax, credential-like patterns, empty/placeholder docs.
# Exit 0 when all checks pass, 1 otherwise.
#
# SPDX-License-Identifier: MIT
set -euo pipefail

FAIL=0
fail() { echo "FAIL: $1"; FAIL=1; }
pass() { echo "ok: $1"; }

# --- 1. Required files -------------------------------------------------------
REQUIRED_FILES="README.md README.es.md CONTRIBUTING.md CODE_OF_CONDUCT.md SECURITY.md LICENSE .gitignore .editorconfig docs/README.md"
MISSING=""
for f in $REQUIRED_FILES; do
  [ -f "$f" ] || MISSING="$MISSING $f"
done
if [ -n "$MISSING" ]; then
  fail "missing required files:$MISSING"
else
  pass "required files present"
fi

# --- 2. Relative Markdown links ----------------------------------------------
BROKEN=0
while IFS= read -r f; do
  while IFS= read -r link; do
    base="$(dirname "$f")"
    if [ ! -e "$base/$link" ]; then
      echo "FAIL: dead link: $f -> $link"
      BROKEN=1
    fi
  done <<EOF
$(grep -o '\]([^)]*)' "$f" | grep -o '([^)]*)' | tr -d '()' | grep -v '^http' | grep -v '^#' | grep -v '^contact@' | grep -v '^mailto:' || true)
EOF
done <<EOF
$(find . -name '*.md' -not -path './.git/*')
EOF
if [ "$BROKEN" -eq 0 ]; then
  pass "no broken relative links"
else
  FAIL=1
fi

# --- 3. Workshop documentation completeness ------------------------------------
for d in 01-introduccion-ia 02-ia-vida-diaria 03-ia-trabajo-negocios 04-ia-padres-familias; do
  for f in README.md curriculum.md facilitator-notes.md exercises.md; do
    if [ ! -f "workshops/$d/$f" ]; then
      fail "missing workshops/$d/$f"
    fi
  done
done
[ -f "workshops/README.md" ] || fail "missing workshops/README.md"
pass "workshop file check done (see failures above, if any)"

# --- 4. Shell syntax -----------------------------------------------------------
for s in scripts/*.sh; do
  if bash -n "$s"; then
    pass "syntax ok: $s"
  else
    fail "syntax error: $s"
  fi
done

# --- 5. Credential-like patterns (allowlist-aware) -----------------------------
# Flags suspicious assignments while ignoring policy prose and placeholders.
HITS="$(grep -rniE '(password|passwd|api[_-]?key|secret[_-]?key|access[_-]?token|aws_secret|private[_-]?key)[[:space:]]*[:=][[:space:]]*[^[:space:]<>"'"'"']+' \
  --include='*.md' --include='*.sh' --include='*.yml' . 2>/dev/null | grep -v './.git/' \
  | grep -viE 'example\.org|placeholder|never|must never|do not|no .*required|your password|contrase' || true)"
if [ -n "$HITS" ]; then
  echo "$HITS"
  fail "suspicious credential-like patterns found"
else
  pass "no credential-like patterns"
fi

# --- 6. Empty / placeholder documents -------------------------------------------
EMPTY="$(find . -name '*.md' -not -path './.git/*' \( -empty -o -size -50c \) || true)"
if [ -n "$EMPTY" ]; then
  echo "$EMPTY"
  fail "empty or near-empty documents found"
else
  pass "no empty documents"
fi
PLACEHOLDERS="$(grep -rliE 'lorem ipsum|TODO: write|coming soon|TBD document' --include='*.md' . 2>/dev/null | grep -v './.git/' || true)"
if [ -n "$PLACEHOLDERS" ]; then
  echo "$PLACEHOLDERS"
  fail "placeholder documents found"
else
  pass "no placeholder documents"
fi

if [ "$FAIL" -eq 0 ]; then
  echo "ALL CHECKS PASSED"
else
  echo "VALIDATION FAILED"
fi
exit "$FAIL"
