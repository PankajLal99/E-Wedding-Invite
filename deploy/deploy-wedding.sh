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

if [ ! -d "$APP_DIR/dist/groom" ] || [ ! -d "$APP_DIR/dist/bride" ] || [ ! -d "$APP_DIR/dist/groom-reception" ]; then
  echo "ERROR: missing dist/groom, dist/bride, or dist/groom-reception under $APP_DIR"
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
  local alias_domain="${5:-}"

  echo "→ (re)starting $name for $domain ($dist_subdir)"
  docker stop "$name" 2>/dev/null || true
  docker rm "$name" 2>/dev/null || true

  local host_rule="Host(\`$domain\`)"
  if [ -n "$alias_domain" ]; then
    host_rule="Host(\`$domain\`) || Host(\`$alias_domain\`)"
  fi

  docker run -d \
    --name "$name" \
    --restart always \
    --network "$NETWORK" \
    -v "$APP_DIR/dist/$dist_subdir:/usr/share/nginx/html:ro" \
    -v "$APP_DIR/deploy/nginx-spa.conf:/etc/nginx/conf.d/default.conf:ro" \
    -l "traefik.enable=true" \
    -l "traefik.http.routers.$router.rule=$host_rule" \
    -l "traefik.http.routers.$router.entrypoints=web" \
    -l "traefik.http.services.$router.loadbalancer.server.port=80" \
    "$IMAGE"

  echo "  started $name"
}

# Blessings API — host Postgres, new database only. Does not touch other databases.
psql_admin() {
  if sudo -u postgres psql -c 'SELECT 1' >/dev/null 2>&1; then
    sudo -u postgres psql -v ON_ERROR_STOP=1 "$@"
  elif command -v psql >/dev/null 2>&1; then
    psql -d postgres -v ON_ERROR_STOP=1 "$@"
  else
    echo "ERROR: psql is not available — cannot create the blessings database"
    exit 1
  fi
}

setup_blessings_db() {
  local env_file="$APP_DIR/deploy/blessings.env"
  psql_admin -c 'SELECT 1' >/dev/null

  if [ -f "$env_file" ]; then
    echo "Using existing $env_file"
  else
    local pass
    pass=$(openssl rand -hex 24)
    echo "Creating role and database wedding_blessings"
    psql_admin <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'wedding_blessings') THEN
    CREATE ROLE wedding_blessings LOGIN PASSWORD '${pass}';
  ELSE
    ALTER ROLE wedding_blessings WITH LOGIN PASSWORD '${pass}';
  END IF;
END
\$\$;
SELECT 'CREATE DATABASE wedding_blessings OWNER wedding_blessings'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'wedding_blessings')\\gexec
GRANT ALL PRIVILEGES ON DATABASE wedding_blessings TO wedding_blessings;
SQL
    psql_admin -d wedding_blessings -c 'ALTER SCHEMA public OWNER TO wedding_blessings;'
    local socket
    socket=$(psql_admin -tAc 'SHOW unix_socket_directories' | cut -d',' -f1 | tr -d ' ')
    local admin_token
    admin_token=$(openssl rand -hex 24)
    umask 077
    cat > "$env_file" <<EOF
DATABASE_URL=postgresql://wedding_blessings:${pass}@/wedding_blessings?host=${socket}
PORT=8788
ADMIN_TOKEN=${admin_token}
EOF
    echo "Wrote $env_file (kept out of git)"
    echo "  Blessings ADMIN_TOKEN saved in $env_file — use it at /admin/blessings"
  fi

  if [ -f "$env_file" ] && ! grep -q '^ADMIN_TOKEN=' "$env_file"; then
    local admin_token
    admin_token=$(openssl rand -hex 24)
    umask 077
    printf '\nADMIN_TOKEN=%s\n' "$admin_token" >> "$env_file"
    echo "Added ADMIN_TOKEN to $env_file — use it at /admin/blessings"
  fi

  local hba
  hba=$(psql_admin -tAc 'SHOW hba_file' | tr -d ' ')
  if [ -n "$hba" ] && [ -f "$hba" ]; then
    sudo cp -a "$hba" "$BACKUP_DIR/pg_hba.conf.bak"
    if ! sudo grep -q 'wedding_blessings wedding_blessings' "$hba"; then
      local method
      method=$(psql_admin -tAc 'SHOW password_encryption' | tr -d ' ')
      [ -n "$method" ] || method="scram-sha-256"
      echo "Allowing the blessings role on the local Postgres socket ($method)"
      sudo sed -i "1i local wedding_blessings wedding_blessings ${method}" "$hba"
      psql_admin -c 'SELECT pg_reload_conf();' >/dev/null
    fi
  fi
}

start_blessings_api() {
  echo "→ building blessings API"
  docker build -t wedding-blessings:local "$APP_DIR/api/blessings"
  docker stop wedding-blessings 2>/dev/null || true
  docker rm wedding-blessings 2>/dev/null || true
  local socket=""
  socket=$(grep -o 'host=[^& ]*' "$APP_DIR/deploy/blessings.env" | head -1 | cut -d= -f2- || true)
  local -a run_args=(
    -d
    --name wedding-blessings
    --restart always
    --network "$NETWORK"
    --env-file "$APP_DIR/deploy/blessings.env"
  )
  if [ -n "$socket" ]; then
    run_args+=(-v "${socket}:${socket}")
  fi
  docker run "${run_args[@]}" wedding-blessings:local
  echo "  waiting for blessings API"
  local ok=0
  for _ in 1 2 3 4 5 6 7 8 9 10; do
    if docker exec wedding-blessings node -e "fetch('http://127.0.0.1:8788/api/blessings/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" >/dev/null 2>&1; then
      ok=1
      break
    fi
    sleep 1
  done
  if [ "$ok" != "1" ]; then
    echo "ERROR: blessings API did not become healthy. Recent logs:"
    docker logs --tail 40 wedding-blessings || true
    exit 1
  fi
  echo "  blessings API is up"
}

setup_blessings_db
start_blessings_api

# Pull image once (small) so we don't fail mid-way
docker pull "$IMAGE"

GROOM_DOMAIN="wedding.pankajlal.in"
BRIDE_DOMAIN="wedding.muskanraj.in"
RECEPTION_DOMAIN="reception.pankajlal.in"
GROOM_ALIAS="pankaj.intratechno.com"
BRIDE_ALIAS="muskan.intratechno.com"

run_side "wedding-pankaj" "$GROOM_DOMAIN" "groom" "wedding-pankaj" "$GROOM_ALIAS"
run_side "wedding-muskan" "$BRIDE_DOMAIN" "bride" "wedding-muskan" "$BRIDE_ALIAS"
run_side "wedding-reception" "$RECEPTION_DOMAIN" "groom-reception" "wedding-reception"

sleep 2

echo "Traefik smoke (HTTP via :8090)…"
for host in "$GROOM_DOMAIN" "$BRIDE_DOMAIN" "$RECEPTION_DOMAIN" "$GROOM_ALIAS" "$BRIDE_ALIAS"; do
  code=$(curl -s -o /dev/null -w '%{http_code}' -H "Host: $host" http://127.0.0.1:8090/ || echo fail)
  echo "  $host → $code"
  if [ "$code" != "200" ]; then
    echo "ERROR: Traefik did not return 200 for $host — leaving nginx untouched. Containers are up for debug."
    exit 1
  fi
done

# Append HTTP vhosts only if not already present
if grep -q "server_name $GROOM_DOMAIN" "$NGINX_CONF"; then
  echo "Nginx already has $GROOM_DOMAIN — skipping full snippet append"
else
  echo "Appending HTTP server blocks to nginx…"
  {
    echo ""
    echo "# BEGIN wedding-invite-v2 $(date -u +%Y-%m-%dT%H:%MZ)"
    cat "$APP_DIR/deploy/nginx-wedding-http.conf.snippet"
    echo "# END wedding-invite-v2"
  } | sudo tee -a "$NGINX_CONF" >/dev/null
fi

# Reception hostname may be added after an earlier deploy that only had wedding + bride
if ! grep -q "server_name $RECEPTION_DOMAIN" "$NGINX_CONF"; then
  echo "Appending HTTP server block for $RECEPTION_DOMAIN…"
  {
    echo ""
    echo "# BEGIN wedding-reception $(date -u +%Y-%m-%dT%H:%MZ)"
    cat <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${RECEPTION_DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:8090;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    echo "# END wedding-reception"
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

# pankajlal.in hostnames use Cloudflare SSL at the edge; still issue origin certs if nginx terminates TLS.
# For reception.pankajlal.in: add DNS in Cloudflare first (see deploy/CLOUDFLARE-reception.md).
for domain in "$GROOM_DOMAIN" "$BRIDE_DOMAIN" "$RECEPTION_DOMAIN" "$GROOM_ALIAS" "$BRIDE_ALIAS"; do
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
echo "  https://$GROOM_DOMAIN       (groom · full)"
echo "  https://$RECEPTION_DOMAIN   (groom · Reception only)"
echo "  https://$BRIDE_DOMAIN       (bride)"
echo "  https://$GROOM_ALIAS        (groom alias)"
echo "  https://$BRIDE_ALIAS        (bride alias)"
echo "Rollback: $APP_DIR/deploy/rollback-wedding.sh"
echo "Backup:   $BACKUP_DIR"
echo "Cloudflare DNS for reception: $APP_DIR/deploy/CLOUDFLARE-reception.md"
