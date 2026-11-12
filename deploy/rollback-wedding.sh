#!/bin/bash
# Rollback wedding deploy: remove wedding containers + restore nginx backup.
# Does NOT touch other apps, Traefik, Portainer, or legacy gunicorn.

set -euo pipefail

APP_DIR="/srv/apps/E-Wedding-Invite"
NGINX_CONF="/etc/nginx/conf.d/docker-apps.conf"
LATEST_FILE="/srv/apps/backups/wedding-LATEST"

echo "Stopping wedding containers…"
docker stop wedding-pankaj wedding-muskan 2>/dev/null || true
docker rm wedding-pankaj wedding-muskan 2>/dev/null || true
echo "Containers removed."

if [ -f "$LATEST_FILE" ]; then
  BACKUP_DIR=$(cat "$LATEST_FILE")
else
  BACKUP_DIR=$(ls -1d /srv/apps/backups/wedding-* 2>/dev/null | tail -1 || true)
fi

if [ -n "${BACKUP_DIR:-}" ] && [ -f "$BACKUP_DIR/docker-apps.conf.bak" ]; then
  echo "Restoring nginx from $BACKUP_DIR/docker-apps.conf.bak"
  sudo cp -a "$BACKUP_DIR/docker-apps.conf.bak" "$NGINX_CONF"
  if sudo nginx -t; then
    sudo systemctl reload nginx
    echo "Nginx restored and reloaded."
  else
    echo "ERROR: restored config failed nginx -t — investigate manually"
    exit 1
  fi
else
  echo "WARNING: no nginx backup found. Removing wedding server blocks by marker if present…"
  if grep -q '# BEGIN wedding-invite' "$NGINX_CONF"; then
    sudo cp -a "$NGINX_CONF" "/tmp/docker-apps.conf.before-wedding-strip"
    # shellcheck disable=SC2016
    sudo sed -i '/# BEGIN wedding-invite/,/# END wedding-invite/d' "$NGINX_CONF"
    # Certbot may have rewritten blocks outside markers — manual check advised
    sudo nginx -t && sudo systemctl reload nginx
  fi
fi

echo ""
echo "Rollback done. Leftover Let's Encrypt certs (if any) are harmless:"
echo "  /etc/letsencrypt/live/pankaj.intratechno.com"
echo "  /etc/letsencrypt/live/muskan.intratechno.com"
echo "Remove later with: sudo certbot delete --cert-name <name>"
