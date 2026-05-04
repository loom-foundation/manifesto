#!/usr/bin/env bash
# Post-merge attestation. Stamps a `verification` block into each merged Mill
# file, re-deriving the facts from the merged state. Weavers are not stamped.
# Expects env: REPO, SHA, BEFORE, GH_TOKEN. Leaves changes in the working tree
# for the workflow's commit step.
set -euo pipefail
here="$(dirname "${BASH_SOURCE[0]}")"
# shellcheck source=lib.sh
. "$here/lib.sh"

now="$(date -u +%Y-%m-%d)"

# A field from a local (checked-out) file's frontmatter. Case preserved.
fm_field() { # $1=path  $2=field
  awk '/^---[[:space:]]*$/{n++; next} n==1' "$1" \
    | grep -iE "^$2:" | head -1 \
    | sed -E "s/^$2:[[:space:]]*//I" | tr -d "\"'\r" || true
}

# Mill files added/modified in this push (skip deletions).
if git rev-parse --verify -q "$BEFORE^{commit}" >/dev/null 2>&1; then
  files="$(git diff --name-only --diff-filter=AM "$BEFORE" "$SHA" -- signatories/mills)"
else
  files="$(git show --name-only --diff-filter=AM --format= "$SHA" -- signatories/mills)"
fi
[ -n "$files" ] || { echo "No Mill files in this push."; exit 0; }

# The PR that introduced this commit gives the true signer.
pr_author="$(gh api "repos/$REPO/commits/$SHA/pulls" -q '.[0].user.login' 2>/dev/null || true)"

while IFS= read -r path; do
  [ -n "$path" ] && [ -f "$path" ] || continue
  case "$path" in signatories/mills/*.md) : ;; *) continue ;; esac
  IFS=$'\t' read -r org team < <(mill_split "$path")
  sig="$(sig_id "$org" "$team")"

  signer="$pr_author"
  [ -n "$signer" ] || signer="$(git log -1 --format='%an' -- "$path")"
  signer="$(lc "$signer")"

  membership="unverified"; proof=""
  if gh api "orgs/$org/public_members/$signer" --silent 2>/dev/null; then
    membership="public-member"
  else
    url="$(fm_field "$path" url)"
    [ -n "$url" ] && proof="$(control_proof "$org" "$sig" "$url")"
    [ -n "$proof" ] && membership="control-file"
  fi

  KIND=mill SIGNED_BY="$signer" ORG="$org" MEMBERSHIP="$membership" \
  VERIFIED_VIA="$proof" SIGNED="$now" \
    python3 "$here/inject-verification.py" "$path"
  echo "Stamped $path (signer=$signer, $membership)."
done <<< "$files"
