#!/usr/bin/env bash
set -euo pipefail

site_root=${1:?Expected the absolute domain directory}
release=${2:?Expected a release identifier}
commit=${3:?Expected the source commit}
[[ "$site_root" = /*/domains/ui.highwren.com && "$site_root" != *'..'* ]] || exit 1
[[ "$release" =~ ^[a-f0-9]{40}-[0-9]+-[0-9]+$ && "$commit" =~ ^[a-f0-9]{40}$ ]] || exit 1
[[ -d "$site_root" && ! -L "$site_root" ]] || exit 1
[[ "$(cd "$site_root" && pwd -P)" = "$site_root" ]] || exit 1

live="$site_root/public_html"
stage="$site_root/.deploy/$release/site"
backup="$site_root/.deploy/$release/previous"
[[ -d "$live" && ! -L "$live" && -d "$stage" && ! -e "$backup" ]] || exit 1
for file in index.html 404.html .htaccess version.json r/button.json api/search; do
  [[ -f "$stage/$file" && ! -L "$stage/$file" ]] || exit 1
done
[[ -z "$(find "$stage" -type l -print -quit)" ]] || exit 1
grep -q "\"commit\": \"$commit\"" "$stage/version.json"
grep -q '"dirty": false' "$stage/version.json"

lock="$site_root/.deploy/lock"
mkdir "$lock" || { echo 'Another deployment is running; inspect the lock before retrying' >&2; exit 1; }
trap 'rmdir "$lock"' EXIT
mkdir "$backup"
rsync -a "$live/" "$backup/"

rollback() {
  trap - ERR INT TERM
  echo 'Deployment failed; restoring the previous site' >&2
  rsync -ac --delete-delay --delay-updates --exclude '/.well-known/' "$backup/" "$live/"
  exit 1
}
trap rollback ERR INT TERM
rsync -ac --delete-delay --delay-updates --exclude '/.well-known/' \
  --filter 'P /_next/static/***' "$stage/" "$live/"

for attempt in 1 2 3; do
  if curl --fail --silent --show-error --max-time 20 \
    "https://ui.highwren.com/version.json?release=$release&attempt=$attempt" | grep -q "\"commit\": \"$commit\""; then
    trap - ERR INT TERM
    echo "Deployed $commit to https://ui.highwren.com"
    exit 0
  fi
  sleep 3
done
rollback
