#!/usr/bin/env bash
# Set the real production domain in one command, everywhere it's used:
# index.html, legal pages, sitemap.xml, robots.txt, site.config.json.
#
# Usage:
#   scripts/set-domain.sh pomazkov.ru
#
# By default this only updates the URLs — it does NOT flip the site
# to indexable. Pass --go-live as a second argument to also switch
# robots.txt/meta robots from noindex to allowing search engines,
# once you're actually ready to launch:
#
#   scripts/set-domain.sh pomazkov.ru --go-live

set -euo pipefail
cd "$(dirname "$0")/.."

if [ $# -lt 1 ]; then
  echo "Usage: $0 <domain, e.g. pomazkov.ru> [--go-live]" >&2
  exit 1
fi

DOMAIN="$1"
DOMAIN="${DOMAIN#https://}"
DOMAIN="${DOMAIN#http://}"
DOMAIN="${DOMAIN%/}"
NEW_BASE="https://${DOMAIN}"
OLD_BASE="https://SET-DOMAIN-BEFORE-LAUNCH.invalid"

FILES=(index.html legal/privacy.html legal/cookie-policy.html sitemap.xml robots.txt site.config.json)

for f in "${FILES[@]}"; do
  if [ -f "$f" ]; then
    sed -i '' "s#${OLD_BASE}#${NEW_BASE}#g" "$f"
    echo "updated $f"
  fi
done

if [ "${2:-}" = "--go-live" ]; then
  sed -i '' 's/<meta name="robots" content="noindex, nofollow">/<meta name="robots" content="index,follow">/' index.html legal/privacy.html legal/cookie-policy.html
  cat > robots.txt << EOF
User-agent: *
Allow: /

Sitemap: ${NEW_BASE}/sitemap.xml
EOF
  echo "robots/meta switched to indexable — site is now allowed to be crawled"
else
  echo "Domain set, but the site is still noindex. Re-run with --go-live when ready to launch."
fi
