#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/marketing/assets"
PUB="$ROOT/app/public"
FONT_SANS="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_SANS_BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_SERIF_BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"

mkdir -p "$OUT/posts" "$OUT/carousel" "$OUT/video-covers"

# These graphics use real catalogue images from app/public/products.
# English stays on-image for clean rendering; bilingual captions live in captions.md.

brand_header() {
  local file="$1" number="$2"
  convert "$file" \
    -font "$FONT_SANS_BOLD" -pointsize 21 -fill '#d6bf87' \
    -gravity northwest -annotate +72+65 "R.S.D.  /  PREMIUM WATCHES" \
    -font "$FONT_SANS" -pointsize 17 -fill '#8d8679' \
    -gravity northeast -annotate +72+70 "$number  /  THE EDIT" \
    "$file"
}

footer() {
  local file="$1"
  convert "$file" \
    -stroke '#b79a5c' -strokewidth 2 -fill none -draw 'rectangle 1,1 1078,1348' \
    -stroke '#b79a5c' -strokewidth 2 -draw 'line 72,1188 1008,1188' \
    -font "$FONT_SANS_BOLD" -pointsize 17 -fill '#d6bf87' \
    -gravity southwest -annotate +72+78 "ORDER BY WHATSAPP  0711368623" \
    -font "$FONT_SANS" -pointsize 16 -fill '#8d8679' \
    -gravity southeast -annotate +72+78 "RSD-WATCHES-MAIN.VERCEL.APP" \
    "$file"
}

post_hublot() {
  local out="$OUT/posts/01-mechanical-in-full-view.png"
  convert -size 1080x1350 gradient:'#090a0a-#1b1915' \
    -fill '#b79a5c' -stroke none -draw 'rectangle 72,182 78,492' "$out"
  convert "$out" \
    \( "$PUB/products/RSD-WS-143.webp" -resize 720x720 -colorspace sRGB -bordercolor '#b79a5c' -border 2x2 \) \
    -geometry +380+270 -compose over -composite "$out"
  convert "$out" -fill '#080909e5' -stroke none -draw 'roundrectangle 48,210 590,830 12,12' "$out"
  convert "$out" \
    -font "$FONT_SANS_BOLD" -pointsize 18 -fill '#d6bf87' \
    -gravity northwest -annotate +98+238 "R.S.D. EDIT  /  01" \
    -font "$FONT_SERIF_BOLD" -pointsize 57 -fill '#f4f0e6' \
    -gravity northwest -annotate +94+345 "MECHANICAL," \
    -gravity northwest -annotate +94+422 "IN FULL VIEW." \
    -font "$FONT_SANS" -pointsize 18 -fill '#b8b1a2' \
    -gravity northwest -annotate +98+535 "HUBLOT ROUND SKELETON" \
    -gravity northwest -annotate +98+565 "CHRONOGRAPH" \
    -font "$FONT_SANS_BOLD" -pointsize 17 -fill '#d6bf87' \
    -gravity northwest -annotate +98+650 "LIMITED AVAILABILITY" "$out"
  brand_header "$out" "01"
  footer "$out"
}

post_tissot() {
  local out="$OUT/posts/02-colour-that-keeps-time.png"
  convert -size 1080x1350 gradient:'#15191b-#302b23' \
    -fill '#b79a5c' -stroke none -draw 'rectangle 72,182 78,492' "$out"
  convert "$out" \
    \( "$PUB/products/RSD-WS-165.webp" -resize 720x720 -colorspace sRGB -bordercolor '#b79a5c' -border 2x2 \) \
    -geometry +380+270 -compose over -composite "$out"
  convert "$out" -fill '#0b0d0ee5' -stroke none -draw 'roundrectangle 48,210 590,830 12,12' "$out"
  convert "$out" \
    -font "$FONT_SANS_BOLD" -pointsize 18 -fill '#d6bf87' \
    -gravity northwest -annotate +98+238 "R.S.D. EDIT  /  02" \
    -font "$FONT_SERIF_BOLD" -pointsize 54 -fill '#f4f0e6' \
    -gravity northwest -annotate +94+345 "COLOUR THAT" \
    -gravity northwest -annotate +94+422 "KEEPS TIME." \
    -font "$FONT_SANS" -pointsize 18 -fill '#b8b1a2' \
    -gravity northwest -annotate +98+535 "TISSOT PRX CHRONOGRAPH" \
    -gravity northwest -annotate +98+565 "TURQUOISE DIAL" \
    -font "$FONT_SANS_BOLD" -pointsize 17 -fill '#d6bf87' \
    -gravity northwest -annotate +98+650 "LIMITED AVAILABILITY" "$out"
  brand_header "$out" "02"
  footer "$out"
}

post_chanel() {
  local out="$OUT/posts/03-quietly-iconic.png"
  convert -size 1080x1350 gradient:'#0d0d0c-#251b20' \
    -fill '#b79a5c' -stroke none -draw 'rectangle 72,182 78,492' "$out"
  convert "$out" \
    \( "$PUB/products/RSD-WS-147.webp" -resize 720x720 -colorspace sRGB -bordercolor '#b79a5c' -border 2x2 \) \
    -geometry +380+270 -compose over -composite "$out"
  convert "$out" -fill '#0b090be5' -stroke none -draw 'roundrectangle 48,210 590,830 12,12' "$out"
  convert "$out" \
    -font "$FONT_SANS_BOLD" -pointsize 18 -fill '#d6bf87' \
    -gravity northwest -annotate +98+238 "R.S.D. EDIT  /  03" \
    -font "$FONT_SERIF_BOLD" -pointsize 62 -fill '#f4f0e6' \
    -gravity northwest -annotate +94+345 "QUIETLY" \
    -gravity northwest -annotate +94+422 "ICONIC." \
    -font "$FONT_SANS" -pointsize 18 -fill '#b8b1a2' \
    -gravity northwest -annotate +98+535 "CHANEL SQUARE QUARTZ" \
    -gravity northwest -annotate +98+565 "SILVER BELT" \
    -font "$FONT_SANS_BOLD" -pointsize 17 -fill '#d6bf87' \
    -gravity northwest -annotate +98+650 "AVAILABLE TO ORDER" "$out"
  brand_header "$out" "03"
  footer "$out"
}

carousel_cover() {
  local out="$OUT/carousel/01-cover-the-rsd-edit.png"
  convert -size 1080x1350 gradient:'#080909-#171613' "$out"
  convert "$out" \
    \( "$PUB/rsd-banner.png" -resize 1080x430! -brightness-contrast -8x-4 \) \
    -geometry +0+0 -compose over -composite "$out"
  convert "$out" \
    -fill '#b79a5c' -stroke none -draw 'rectangle 72,556 78,780' \
    -font "$FONT_SANS_BOLD" -pointsize 18 -fill '#d6bf87' \
    -gravity northwest -annotate +98+562 "R.S.D.  /  CURATED TIMEPIECES" \
    -font "$FONT_SERIF_BOLD" -pointsize 76 -fill '#f4f0e6' \
    -gravity northwest -annotate +94+675 "THE NEW" \
    -gravity northwest -annotate +94+770 "EDIT." \
    -font "$FONT_SANS" -pointsize 20 -fill '#b8b1a2' \
    -gravity northwest -annotate +98+910 "Three ways to wear your time." \
    -font "$FONT_SANS" -pointsize 19 -fill '#d6bf87' \
    -gravity northwest -annotate +98+1010 "SWIPE TO FIND YOURS" "$out"
  brand_header "$out" "CAROUSEL"
  footer "$out"
}

carousel_product() {
  local num="$1" sku="$2" kicker="$3" title="$4" detail="$5" out="$OUT/carousel/$6"
  convert -size 1080x1350 gradient:'#0a0b0b-#201d18' "$out"
  convert "$out" \
    \( "$PUB/products/$sku.webp" -resize 820x820 -colorspace sRGB -bordercolor '#b79a5c' -border 2x2 \) \
    -geometry +130+150 -compose over -composite "$out"
  convert "$out" \
    -fill '#b79a5c' -stroke none -draw 'rectangle 72,1050 78,1190' \
    -font "$FONT_SANS_BOLD" -pointsize 18 -fill '#d6bf87' \
    -gravity northwest -annotate +98+1050 "$num  /  $kicker" \
    -font "$FONT_SERIF_BOLD" -pointsize 55 -fill '#f4f0e6' \
    -gravity northwest -annotate +98+1120 "$title" \
    -font "$FONT_SANS" -pointsize 17 -fill '#b8b1a2' \
    -gravity northwest -annotate +98+1210 "$detail" "$out"
}

carousel_cta() {
  local out="$OUT/carousel/05-cta-find-yours.png"
  convert -size 1080x1350 gradient:'#0a0b0b-#171613' "$out"
  convert "$out" \
    \( "$PUB/rsd-logo.png" -resize 190x190 \) \
    -geometry +445+185 -compose over -composite "$out"
  convert "$out" \
    -fill '#b79a5c' -stroke none -draw 'rectangle 72,498 78,742' \
    -font "$FONT_SANS_BOLD" -pointsize 18 -fill '#d6bf87' \
    -gravity northwest -annotate +98+505 "R.S.D. PREMIUM WATCHES" \
    -font "$FONT_SERIF_BOLD" -pointsize 76 -fill '#f4f0e6' \
    -gravity northwest -annotate +94+620 "FIND" \
    -gravity northwest -annotate +94+715 "YOURS." \
    -font "$FONT_SANS" -pointsize 20 -fill '#b8b1a2' \
    -gravity northwest -annotate +98+860 "Browse the collection or order directly." \
    -font "$FONT_SANS_BOLD" -pointsize 19 -fill '#d6bf87' \
    -gravity northwest -annotate +98+950 "WHATSAPP  0711368623" \
    -font "$FONT_SANS" -pointsize 18 -fill '#8d8679' \
    -gravity northwest -annotate +98+995 "Modern timepieces · Colombo, Sri Lanka" "$out"
  brand_header "$out" "05"
  footer "$out"
}

post_hublot
post_tissot
post_chanel
carousel_cover
carousel_product "02" "RSD-WS-143" "THE STATEMENT" "Look closer." "Hublot skeleton chronograph · limited availability" "02-the-statement-hublot.png"
carousel_product "03" "RSD-WS-165" "THE COLOUR" "Make it yours." "Tissot PRX chronograph · turquoise dial" "03-the-colour-tissot.png"
carousel_product "04" "RSD-WS-147" "THE SILHOUETTE" "Keep it close." "Chanel square quartz · silver belt" "04-the-silhouette-chanel.png"
carousel_cta

# Still cover frames for the two short-video concepts. Keep the 4:5 artwork
# undistorted inside a native 9:16 story/reel canvas.
video_cover() {
  local source="$1" out="$2" label="$3"
  convert -size 1080x1920 gradient:'#080909-#171613' "$out"
  convert "$out" \
    \( "$source" -resize 960x1200 \) \
    -geometry +60+350 -compose over -composite "$out"
  convert "$out" \
    -font "$FONT_SANS_BOLD" -pointsize 20 -fill '#d6bf87' \
    -gravity northwest -annotate +72+105 "R.S.D.  /  $label" \
    -font "$FONT_SANS" -pointsize 17 -fill '#8d8679' \
    -gravity southwest -annotate +72+92 "VERTICAL REEL COVER  ·  1080 × 1920" "$out"
}
video_cover "$OUT/posts/01-mechanical-in-full-view.png" "$OUT/video-covers/reel-01-the-detail-reveal.png" "THE DETAIL REVEAL"
video_cover "$OUT/posts/02-colour-that-keeps-time.png" "$OUT/video-covers/reel-02-choose-your-mood.png" "CHOOSE YOUR MOOD"

# Social platforms do not need 16-bit PNGs; keep the pack lightweight to upload.
find "$OUT" -type f -name '*.png' -exec mogrify -depth 8 {} +

printf 'Rendered starter pack to %s\n' "$OUT"
