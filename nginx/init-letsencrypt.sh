#!/bin/bash
# VibeDrop — first-time Let's Encrypt certificate issuance
#
# Run ONCE after the production stack is up, before DNS is fully resolving,
# to obtain the initial TLS certificate. After this, renewal is automatic
# (certbot renew via cron in the certbot container).
#
# Usage:
#   DOMAIN=vibedrop.example.com EMAIL=you@example.com ./nginx/init-letsencrypt.sh
#
# Prerequisites:
#   - docker-compose.prod.yml stack is running (nginx + app + worker)
#   - DNS A record for $DOMAIN points to this server's public IP
#   - Ports 80 and 443 are open in the ECS security group

set -euo pipefail

DOMAIN="${DOMAIN:?Set DOMAIN env var, e.g. DOMAIN=vibedrop.example.com}"
EMAIL="${EMAIL:?Set EMAIL env var for Let's Encrypt}"
COMPOSE="docker compose -f docker-compose.prod.yml"

echo "=== VibeDrop Let's Encrypt setup ==="
echo "Domain: $DOMAIN"
echo "Email:  $EMAIL"
echo ""

# 1. Get a self-signed placeholder so nginx can start with SSL enabled
echo "[1/4] Creating placeholder certificate..."
$COMPOSE exec nginx sh -c "
  mkdir -p /etc/letsencrypt/live/$DOMAIN && \
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
    -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
    -subj '/CN=localhost' 2>/dev/null
" || true

# 2. Start nginx with the placeholder
echo "[2/4] Restarting nginx with placeholder cert..."
$COMPOSE up -d --force-recreate nginx

# 3. Delete placeholder and request the real cert
echo "[3/4] Deleting placeholder and requesting real certificate..."
$COMPOSE exec nginx rm -rf /etc/letsencrypt/live/$DOMAIN /etc/letsencrypt/archive/$DOMAIN /etc/letsencrypt/renewal/$DOMAIN.conf
$COMPOSE run --rm certbot certonly --webroot --webroot-path=/var/www/certbot/ \
  --email "$EMAIL" --agree-tos --no-eff-email \
  -d "$DOMAIN"

# 4. Reload nginx to serve with the real cert
echo "[4/4] Reloading nginx..."
$COMPOSE exec nginx nginx -s reload

echo ""
echo "✅ Certificate issued for $DOMAIN"
echo "Automatic renewal is handled by the certbot container's cron job."
