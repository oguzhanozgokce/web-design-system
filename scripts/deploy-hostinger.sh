#!/usr/bin/env bash
set -euo pipefail

: "${HOSTINGER_SSH_HOST:?Set the production SSH host}"
: "${HOSTINGER_SSH_USER:?Set the production SSH user}"
: "${HOSTINGER_SSH_PORT:?Set the production SSH port}"
: "${HOSTINGER_SSH_KEY:?Set the deployment private key}"
: "${HOSTINGER_KNOWN_HOSTS:?Set the independently verified SSH host key}"
: "${GITHUB_SHA:?Expected the verified source commit}"
: "${GITHUB_RUN_ID:?Expected the workflow run ID}"
: "${GITHUB_RUN_ATTEMPT:?Expected the workflow attempt}"
[[ "$HOSTINGER_SSH_HOST" =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]*$ ]] || exit 1
[[ "$HOSTINGER_SSH_USER" =~ ^[a-z_][a-z0-9_-]*$ ]] || exit 1
[[ "$HOSTINGER_SSH_PORT" =~ ^[0-9]{1,5}$ && "$HOSTINGER_SSH_PORT" -gt 0 && "$HOSTINGER_SSH_PORT" -le 65535 ]] || exit 1
[[ "$GITHUB_SHA" =~ ^[a-f0-9]{40}$ && "$GITHUB_RUN_ID" =~ ^[0-9]+$ && "$GITHUB_RUN_ATTEMPT" =~ ^[0-9]+$ ]] || exit 1

node --input-type=module <<'NODE'
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const manifest = JSON.parse(readFileSync('.hostinger/manifest.json', 'utf8'));
const digest = createHash('sha256').update(readFileSync('.hostinger/highwren-ui.tar.gz')).digest('hex');
if (manifest.dirty !== false || manifest.commit !== process.env.GITHUB_SHA || manifest.site !== 'https://ui.highwren.com' || manifest.sha256 !== digest)
  throw new Error('The artifact must match this clean, verified commit and its checksum');
NODE

ssh_dir=$(mktemp -d)
trap 'rm -rf "$ssh_dir"' EXIT
chmod 700 "$ssh_dir"
umask 077
printf '%s\n' "$HOSTINGER_SSH_KEY" > "$ssh_dir/key"
printf '%s\n' "$HOSTINGER_KNOWN_HOSTS" > "$ssh_dir/known_hosts"
unset HOSTINGER_SSH_KEY HOSTINGER_KNOWN_HOSTS
cat > "$ssh_dir/config" <<EOF
Host highwren-production
  HostName $HOSTINGER_SSH_HOST
  User $HOSTINGER_SSH_USER
  Port $HOSTINGER_SSH_PORT
  IdentityFile $ssh_dir/key
  UserKnownHostsFile $ssh_dir/known_hosts
  StrictHostKeyChecking yes
  IdentitiesOnly yes
  BatchMode yes
  ConnectTimeout 20
  ServerAliveInterval 15
  ServerAliveCountMax 4
  LogLevel ERROR
EOF

release="$GITHUB_SHA-$GITHUB_RUN_ID-$GITHUB_RUN_ATTEMPT"
site_root="/home/$HOSTINGER_SSH_USER/domains/ui.highwren.com"
ssh -F "$ssh_dir/config" highwren-production \
  "test -d '$site_root/public_html' && command -v rsync >/dev/null && mkdir -p '$site_root/.deploy/$release/site'"
mkdir "$ssh_dir/site"
tar -xzf .hostinger/highwren-ui.tar.gz -C "$ssh_dir/site"
rsync -rz --chmod=D755,F644 -e "ssh -F $ssh_dir/config" \
  "$ssh_dir/site/" "highwren-production:$site_root/.deploy/$release/site/"
ssh -F "$ssh_dir/config" highwren-production \
  "bash -s -- '$site_root' '$release' '$GITHUB_SHA'" < scripts/activate-hostinger.sh
