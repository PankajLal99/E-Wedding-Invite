#!/bin/bash
# Deploy Pankaj & Muskan static sites to Traefik + host Nginx.
# Safe: only adds/replaces wedding-* containers; backs up nginx before edits.
# Does NOT touch inventory gunicorn, other django containers, or Portainer/Traefik.
#
# Usage (on EC2, from /srv/apps/E-Wedding-Invite):
#   ./deploy/deploy-wedding.sh
#   ./deploy/deploy-wedding.sh --skip-certbot   # containers + HTTP nginx only
#   ./deploy/rollback-wedding.sh               # undo

set -euo pipefail

APP_DIR="/srv/apps/E-Wedding-Invite"
BACKUP_DIR="/srv/apps/backups/wedding-$(date +%Y%m%d-%H%M%S)"
NGINX_CONF="/etc/nginx/conf.d/docker-apps.conf"
NETWORK="traefik_network"
IMAGE="nginx:alpine"
SKIP_CERTBOT=0

for arg in "$@"; do
  case "$arg" in
    --skip-certbot) SKIP_CERTBOT=1 ;;
  esac
done

if [ ! -d "$APP_DIR/dist/groom" ] || [ ! -d "$APP_DIR/dist/bride" ]; then
  echo "ERROR: missing dist/groom or dist/bride under $APP_DIR"
  echo "Build on a machine with Node, then sync dist/ here."
  exit 1
fi

if [ ! -f "$APP_DIR/deploy/nginx-spa.conf" ]; then
  echo "ERROR: missing $APP_DIR/deploy/nginx-spa.conf"
  exit 1
fi

if ! docker network inspect "$NETWORK" >/dev/null 2>&1; then
  echo "ERROR: docker network $NETWORK not found — aborting (no changes)"
  exit 1
fi

mkdir -p "$BACKUP_DIR"
echo "Backup dir: $BACKUP_DIR"
echo "$BACKUP_DIR" > /srv/apps/backups/wedding-LATEST

# Record currently running wedding containers (if any) for rollback metadata
docker ps -a --filter 'name=wedding-' --format '{{.Names}} {{.Image}} {{.Status}}' > "$BACKUP_DIR/containers.txt" || true
sudo cp -a "$NGINX_CONF" "$BACKUP_DIR/docker-apps.conf.bak"
echo "Saved nginx backup → $BACKUP_DIR/docker-apps.conf.bak"

run_side() {
  local name="$1"
  local domain="$2"
  local dist_subdir="$3"
  local router="$4"

  echo "→ (re)starting $name for $domain ($dist_subdir)"
  docker stop "$name" 2>/dev/null || true
  docker rm "$name" 2>/dev/null || true

  docker run -d \
    --name "$name" \
    --restart always \
    --network "$NETWORK" \
    -v "$APP_DIR/dist/$dist_subdir:/usr/share/nginx/html:ro" \
    -v "$APP_DIR/deploy/nginx-spa.conf:/etc/nginx/conf.d/default.conf:ro" \
    -l "traefik.enable=true" \
    -l "traefik.http.routers.$router.rule=Host(\`$domain\`)" \
    -l "traefik.http.routers.$router.entrypoints=web" \
    -l "traefik.http.services.$router.loadbalancer.server.port=80" \
    "$IMAGE"

  echo "  started $name"
}

# Pull image once (small) so we don't fail mid-way
docker pull "$IMAGE"

run_side "wedding-pankaj" "pankaj.intratechno.com" "groom" "wedding-pankaj"
run_side "wedding-muskan" "muskan.intratechno.com" "bride" "wedding-muskan"

sleep 2

echo "Traefik smoke (HTTP via :8090)…"
for host in pankaj.intratechno.com muskan.intratechno.com; do
  code=$(curl -s -o /dev/null -w '%{http_code}' -H "Host: $host" http://127.0.0.1:8090/ || echo fail)
  echo "  $host → $code"
  if [ "$code" != "200" ]; then
    echo "ERROR: Traefik did not return 200 for $host — leaving nginx untouched. Containers are up for debug."
    exit 1
  fi
done

# Append HTTP vhosts only if not already present
if grep -q 'server_name pankaj.intratechno.com' "$NGINX_CONF"; then
  echo "Nginx already has pankaj.intratechno.com — skipping append"
else
  echo "Appending HTTP server blocks to nginx…"
  {
    echo ""
    echo "# BEGIN wedding-invite $(date -u +%Y-%m-%dT%H:%MZ)"
    cat "$APP_DIR/deploy/nginx-wedding-http.conf.snippet"
    echo "# END wedding-invite"
  } | sudo tee -a "$NGINX_CONF" >/dev/null
fi

echo "nginx -t…"
if ! sudo nginx -t; then
  echo "ERROR: nginx -t failed — restoring backup"
  sudo cp -a "$BACKUP_DIR/docker-apps.conf.bak" "$NGINX_CONF"
  sudo nginx -t && sudo systemctl reload nginx
  exit 1
fi
sudo systemctl reload nginx
echo "Nginx reloaded (HTTP vhosts active)"

if [ "$SKIP_CERTBOT" -eq 1 ]; then
  echo "Skipped Certbot (--skip-certbot). Sites should work on http://"
  exit 0
fi

# Certbot: one domain at a time so a failure doesn't leave a half-broken multi-cert
EMAIL="${CERTBOT_EMAIL:-admin@intratechnosolutions.com}"

for domain in pankaj.intratechno.com muskan.intratechno.com; do
  if [ -d "/etc/letsencrypt/live/$domain" ]; then
    echo "Cert already exists for $domain — ensuring nginx SSL via certbot --nginx"
  fi
  echo "Certbot for $domain…"
  if ! sudo certbot --nginx -d "$domain" --non-interactive --agree-tos -m "$EMAIL" --redirect; then
    echo "ERROR: certbot failed for $domain"
    echo "HTTP may still work. Rollback nginx with: ./deploy/rollback-wedding.sh"
    exit 1
  fi
  sudo nginx -t && sudo systemctl reload nginx
done

echo ""
echo "Deploy complete."
echo "  https://pankaj.intratechno.com"
echo "  https://muskan.intratechno.com"
echo "Rollback: $APP_DIR/deploy/rollback-wedding.sh"
echo "Backup:   $BACKUP_DIR"
