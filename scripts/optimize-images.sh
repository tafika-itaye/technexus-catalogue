#!/usr/bin/env bash
# optimize-images.sh
# ------------------------------------------------------------------
# Shrinks oversized JPEGs/PNGs in the TechNexus repo and creates
# responsive WebP variants (-400, -800, -1200). Non-destructive:
# originals are moved to ./_backup_images/<path>/<file>.orig before
# being re-encoded in place.
#
# Requirements:
#   brew install libvips imagemagick  # macOS
#   or: apt install libvips-tools imagemagick  # Ubuntu
#
# Usage:
#   cd /path/to/technexus-catalogue
#   bash scripts/optimize-images.sh
# ------------------------------------------------------------------
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

BACKUP="_backup_images"
mkdir -p "$BACKUP"

# Target JPEG/PNG quality settings
JPEG_Q=78          # good quality, ~60-70 % smaller
WEBP_Q=72
MAX_WIDTH=1600     # hero images cap
CARD_WIDTH=1200    # product card cap
THUMB_WIDTH=400    # grid thumbnails

echo "▶ Optimising JPEGs over 200KB..."
find images products products_medical products_medicalsupplies \
     products_services products_software products_spares \
     Products_logos Products_placeholders index_main \
     -type f \( -iname '*.jpg' -o -iname '*.jpeg' \) -size +200k 2>/dev/null | \
while IFS= read -r f; do
    size_kb=$(( $(stat -c%s "$f" 2>/dev/null || stat -f%z "$f") / 1024 ))
    echo "  $f  (${size_kb}KB)"
    mkdir -p "$BACKUP/$(dirname "$f")"
    cp "$f" "$BACKUP/$f.orig"
    # Resize largest dimension to $MAX_WIDTH and re-encode.
    vipsthumbnail "$f" --size "${MAX_WIDTH}x" -o "$f"[Q=$JPEG_Q,strip,optimize_coding]
done

echo "▶ Optimising PNGs over 200KB..."
find products products_medical products_medicalsupplies \
     products_services products_software Products_logos -type f -iname '*.png' -size +200k 2>/dev/null | \
while IFS= read -r f; do
    mkdir -p "$BACKUP/$(dirname "$f")"
    cp "$f" "$BACKUP/$f.orig"
    magick "$f" -resize "${CARD_WIDTH}x${CARD_WIDTH}>" -strip -quality 90 "$f"
done

echo "▶ Generating responsive WebP variants..."
find images products Products_logos -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) 2>/dev/null | \
while IFS= read -r f; do
    base="${f%.*}"
    # Skip if already webp variants exist
    [[ -f "${base}-800.webp" ]] && continue
    vipsthumbnail "$f" --size "${CARD_WIDTH}x" -o "${base}-1200.webp"[Q=$WEBP_Q]
    vipsthumbnail "$f" --size 800x   -o "${base}-800.webp"[Q=$WEBP_Q]
    vipsthumbnail "$f" --size 400x   -o "${base}-400.webp"[Q=$WEBP_Q]
done

echo "▶ Summary"
echo "  Original total:  $(du -sh "$BACKUP" 2>/dev/null | cut -f1)"
echo "  Optimized total: $(du -sh images products Products_logos products_medical \
                             products_medicalsupplies products_services \
                             products_software products_spares Products_placeholders \
                             index_main 2>/dev/null | tail -1)"
echo "✓ done"
