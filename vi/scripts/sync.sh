#!/bin/sh
# Merges an upstream release into the Vietnamese fork through a reviewable sync branch.
#
#   vi/scripts/sync.sh            merge the newest upstream release tag
#   vi/scripts/sync.sh v2.2.5     merge a specific tag
#
# Steps: fetch upstream, mirror upstream/main onto origin/main, branch sync/<tag> from vi, merge
# the tag, refresh the string catalogs and the SQL override, then print what still needs a
# translation. It never pushes vi itself; open a PR from the sync branch and merge it after CI.
set -eu

repo=$(git rev-parse --show-toplevel)
cd "$repo"

if ! git remote get-url upstream >/dev/null 2>&1; then
  git remote add upstream https://github.com/gzxx-2025/aid-studio.git
  git remote set-url --push upstream DISABLED
fi
git config rerere.enabled true

if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "Working tree has uncommitted changes; commit or stash them first." >&2
  exit 1
fi

git fetch --quiet upstream --tags
git fetch --quiet origin

tag=${1:-$(git tag -l 'v*' --sort=-v:refname | head -n 1)}
git rev-parse --verify --quiet "$tag^{commit}" >/dev/null || { echo "Unknown tag: $tag" >&2; exit 1; }

# Keep origin/main a pristine mirror of upstream (fast-forward only).
git push --quiet origin "refs/remotes/upstream/main:refs/heads/main" || \
  echo "warning: origin/main is not a fast-forward of upstream/main; left unchanged" >&2

git switch --quiet vi
git merge --quiet --ff-only origin/vi
if git merge-base --is-ancestor "$tag" vi; then
  echo "vi already contains $tag; nothing to do."
  exit 0
fi

branch="sync/$tag"
git switch --quiet -c "$branch"
if ! git merge --no-edit -m "chore(sync): merge upstream $tag" "$tag"; then
  cat >&2 <<EOF

Merge stopped on conflicts. Upstream files should never conflict because the fork only adds
files under vi/ and .github/workflows/vi-*.yml; resolve by taking upstream's version:
  git checkout --theirs -- <file>   (for upstream files)
then: git add -A && git commit --no-edit && vi/scripts/sync.sh $tag
EOF
  exit 1
fi

# Dependencies may have changed upstream; the scanner needs typescript from either app.
for app in web admin; do
  if ! git diff --quiet "HEAD@{1}" HEAD -- "frontend/$app/package-lock.json" || [ ! -d "frontend/$app/node_modules" ]; then
    npm ci --no-audit --no-fund --prefix "frontend/$app"
  fi
done

mkdir -p vi/reports
node vi/scripts/extract.mjs --missing vi/reports/missing.json || true
node vi/scripts/sql.mjs extract
node vi/scripts/sql.mjs build
node vi/scripts/apply.mjs all --strict >/dev/null || echo "warning: a locale patch in vi/patches.mjs no longer matches; update it" >&2

git add vi/catalog vi/sql
git diff --cached --quiet || git commit --quiet -m "chore(vi): refresh string catalog for $tag"

cat <<EOF

Merged $tag into $branch.
Untranslated strings are listed in vi/reports/missing.json. To translate them:
  node vi/scripts/batch.mjs split vi/reports/tr      # then translate vi/reports/tr/batch-*.in.tsv
  node vi/scripts/batch.mjs merge vi/reports/tr      # writes vi/dict/ui.vi.json
  node vi/scripts/sql.mjs build && git add vi && git commit -m "feat(vi): translate strings from $tag"
Then: git push -u origin $branch && gh pr create --repo Kong-Travis/aid-studio --base vi --head $branch
EOF
