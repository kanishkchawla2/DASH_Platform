#!/bin/bash
# generate_pack.sh — runs on Mac via Tailscale SSH from Railway
# Usage: bash generate_pack.sh SYMBOL

SYMBOL=$1
if [ -z "$SYMBOL" ]; then
  echo "Usage: $0 SYMBOL"
  exit 1
fi

DASH_DIR="$HOME/DASH_Platform"
cd "$DASH_DIR" || { echo "DASH_Platform directory not found"; exit 1; }

echo "[$(date)] Starting pack generation for $SYMBOL"

# 1. Fetch NSE announcements
echo "[1/5] Fetching NSE announcements..."
python3 nse_stock_announcements_1y.py "$SYMBOL" --days 365 --out "scratch/${SYMBOL}_announcements_1y.json" 2>/dev/null

# 2. Log the command for the manual opencode step
echo "[2/5] Ready for agent"
echo ""
echo "============================================"
echo "  Run this in your terminal:"
echo ""
echo "  MAKE_STOCK_PACK: $SYMBOL"
echo ""
echo "  (Run in the DASH_Platform directory)"
echo "============================================"
echo ""

# 3. Generate podcast audio
echo "[3/5] Checking for pack.json..."
PACK_JSON="site/public/research-packs/${SYMBOL}/pack.json"
if [ -f "$PACK_JSON" ]; then
  echo "pack.json found — generating podcast..."
  python3 scripts/generate_podcast_tts.py \
    --pack "$PACK_JSON" \
    --out "site/public/research-packs/${SYMBOL}/podcast.mp3" \
    --update-pack \
    --script-md "site/public/research-packs/${SYMBOL}/podcast_script.md" 2>/dev/null || true
else
  echo "pack.json not found yet. Run MAKE_STOCK_PACK: $SYMBOL first."
fi

# 4. Rebuild index
echo "[4/5] Rebuilding dashboard index..."
python3 scripts/build_dashboard_data.py 2>/dev/null

# 5. Done
echo "[5/5] Done!"
echo "Pack location: site/public/research-packs/${SYMBOL}/"
