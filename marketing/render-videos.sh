#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ASSETS="$ROOT/marketing/assets"
OUT="$ASSETS/videos"
PUB="$ROOT/app/public"
FFMPEG_BIN="${FFMPEG:-ffmpeg}"
FONT_SANS="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_SANS_BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_SERIF_BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
WORK="$(mktemp -d /tmp/rsd-video-scenes.XXXXXX)"
trap 'rm -rf "$WORK"' EXIT
mkdir -p "$OUT"

# These scenes use local catalogue photography only. The exported MP4s are
# silent so Instagram/TikTok audio can be selected from their licensed music
# libraries at publish time.

make_product_scene() {
  local out="$1" source="$2" label="$3" title="$4" detail="$5"
  convert -size 1080x1920 gradient:'#080909-#171613' "$out"
  convert "$out" \
    \( "$source" -resize 900x900 -colorspace sRGB -bordercolor '#b79a5c' -border 2x2 \) \
    -geometry +90+460 -compose over -composite "$out"
  convert "$out" \
    -fill '#090a0add' -stroke none -draw 'roundrectangle 45,90 1035,400 12,12' \
    -fill '#b79a5c' -draw 'rectangle 72,150 78,318' \
    -font "$FONT_SANS_BOLD" -pointsize 22 -fill '#d6bf87' \
    -gravity northwest -annotate +104+130 "$label" \
    -font "$FONT_SERIF_BOLD" -pointsize 64 -fill '#f4f0e6' \
    -gravity northwest -annotate +100+205 "$title" \
    -font "$FONT_SANS" -pointsize 20 -fill '#b8b1a2' \
    -gravity northwest -annotate +104+320 "$detail" \
    -font "$FONT_SANS_BOLD" -pointsize 19 -fill '#d6bf87' \
    -gravity southwest -annotate +72+110 "R.S.D. PREMIUM WATCHES  ·  0711368623" "$out"
}

make_cta_scene() {
  local out="$1" eyebrow="$2" title="$3" subtitle="$4"
  convert -size 1080x1920 gradient:'#080909-#171613' "$out"
  convert "$out" \
    \( "$PUB/rsd-logo.png" -resize 220x220 \) \
    -geometry +430+300 -compose over -composite "$out"
  convert "$out" \
    -fill '#b79a5c' -stroke none -draw 'rectangle 72,675 78,930' \
    -font "$FONT_SANS_BOLD" -pointsize 21 -fill '#d6bf87' \
    -gravity northwest -annotate +104+682 "$eyebrow" \
    -font "$FONT_SERIF_BOLD" -pointsize 75 -fill '#f4f0e6' \
    -gravity northwest -annotate +100+765 "$title" \
    -font "$FONT_SANS" -pointsize 21 -fill '#b8b1a2' \
    -gravity northwest -annotate +104+935 "$subtitle" \
    -font "$FONT_SANS_BOLD" -pointsize 20 -fill '#d6bf87' \
    -gravity northwest -annotate +104+1030 "WHATSAPP  0711368623" \
    -font "$FONT_SANS" -pointsize 18 -fill '#8d8679' \
    -gravity southwest -annotate +72+110 "R.S.D. PREMIUM WATCHES  ·  MODERN TIMEPIECES" "$out"
}

make_intro_scene() {
  local out="$1" label="$2" title="$3" subtitle="$4"
  convert -size 1080x1920 gradient:'#080909-#171613' "$out"
  convert "$out" \
    \( "$PUB/rsd-logo.png" -resize 220x220 \) \
    -geometry +430+255 -compose over -composite "$out"
  convert "$out" \
    -fill '#b79a5c' -stroke none -draw 'rectangle 72,620 78,910' \
    -font "$FONT_SANS_BOLD" -pointsize 20 -fill '#d6bf87' \
    -gravity northwest -annotate +104+628 "R.S.D.  /  $label" \
    -font "$FONT_SERIF_BOLD" -pointsize 74 -fill '#f4f0e6' \
    -gravity northwest -annotate +100+730 "$title" \
    -font "$FONT_SANS" -pointsize 20 -fill '#b8b1a2' \
    -gravity northwest -annotate +104+900 "$subtitle" \
    -font "$FONT_SANS" -pointsize 17 -fill '#8d8679' \
    -gravity southwest -annotate +72+92 "R.S.D. PREMIUM WATCHES  ·  0711368623" "$out"
}

# Reel 01: detail reveal.
make_intro_scene "$WORK/reel01-01.png" "THE DETAIL REVEAL" "LOOK CLOSER." "A mechanical story in blue."

make_product_scene "$WORK/reel01-02.png" "$PUB/products/RSD-WS-143.webp" "LOOK CLOSER." "MECHANICAL DETAIL." "Hublot Round Skeleton Chronograph · limited availability"
make_cta_scene "$WORK/reel01-03.png" "LIMITED AVAILABILITY" "ORDER DIRECT." "Browse the collection or message R.S.D. on WhatsApp."

# Reel 02: choose your mood.
make_intro_scene "$WORK/reel02-01.png" "CHOOSE YOUR MOOD" "MAKE IT YOURS." "Statement · colour · silhouette."
make_product_scene "$WORK/reel02-02.png" "$PUB/products/RSD-WS-143.webp" "01  /  THE STATEMENT" "LOOK CLOSER." "Hublot Round Skeleton Chronograph"
make_product_scene "$WORK/reel02-03.png" "$PUB/products/RSD-WS-165.webp" "02  /  THE COLOUR" "MAKE IT YOURS." "Tissot PRX Chronograph · turquoise dial"
make_product_scene "$WORK/reel02-04.png" "$PUB/products/RSD-WS-147.webp" "03  /  THE SILHOUETTE" "KEEP IT CLOSE." "Chanel Square Quartz · silver belt"
make_cta_scene "$WORK/reel02-05.png" "THE R.S.D. EDIT" "WHICH ONE?" "Comment: statement, colour, or silhouette."

encode() {
  local output="$1" fps="$2"; shift 2
  local inputs=() durations=() scene
  while [[ $# -gt 0 ]]; do
    scene="$1"; durations+=("$2"); shift 2
    inputs+=("-framerate" "$fps" "-loop" "1" "-t" "${durations[-1]}" "-i" "$scene")
  done
  local filter="" concat="" index=0
  for scene in "${inputs[@]}"; do :; done
  # Each still is already looped at the output frame rate. One zoompan frame
  # per input frame keeps the requested scene duration instead of multiplying it.
  local i=0
  while (( i < ${#durations[@]} )); do
    filter+="[$i:v]scale=1080:1920,zoompan=z='min(1+on/1200,1.055)':d=1:s=1080x1920:fps=$fps,setsar=1[v$i];"
    concat+="[v$i]"
    ((i+=1))
  done
  filter+="$concat concat=n=${#durations[@]}:v=1:a=0,format=yuv420p[v]"
  "$FFMPEG_BIN" -y "${inputs[@]}" -filter_complex "$filter" -map '[v]' \
    -an -c:v libx264 -preset medium -crf 20 -movflags +faststart -pix_fmt yuv420p "$output"
}

encode "$OUT/reel-01-the-detail-reveal.mp4" 30 \
  "$WORK/reel01-01.png" 2 \
  "$WORK/reel01-02.png" 4 \
  "$WORK/reel01-03.png" 3

encode "$OUT/reel-02-choose-your-mood.mp4" 30 \
  "$WORK/reel02-01.png" 2 \
  "$WORK/reel02-02.png" 3 \
  "$WORK/reel02-03.png" 3 \
  "$WORK/reel02-04.png" 3 \
  "$WORK/reel02-05.png" 2

printf 'Rendered videos to %s\n' "$OUT"
