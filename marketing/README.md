# R.S.D. Premium Watches — social starter pack

A launch-ready starter campaign for Instagram, Facebook, and TikTok using the real catalogue photography already stored in the site.

## Campaign direction

**Campaign:** The R.S.D. Edit  
**Tone:** quiet luxury, precise, modern, confident  
**Audience:** Sri Lankan watch and style buyers  
**Primary action:** browse the collection or order through WhatsApp Business at **0711368623**  
**Languages:** English on the artwork; English + Sinhala in the captions and video text plan

The artwork avoids unverified claims such as “official retailer”, “authenticity guaranteed”, or a fixed stock quantity. Product availability labels mirror the current catalogue at the time of preparation; verify them again before publishing.

## Deliverables

### Feed posts — 1080 × 1350, PNG

- `assets/posts/01-mechanical-in-full-view.png` — Hublot Round Skeleton Chronograph, limited availability
- `assets/posts/02-colour-that-keeps-time.png` — Tissot PRX Chronograph Turquoise Dial, limited availability
- `assets/posts/03-quietly-iconic.png` — Chanel Square Quartz, Silver Belt, available to order

### Carousel — five slides, 1080 × 1350, PNG

1. `assets/carousel/01-cover-the-rsd-edit.png`
2. `assets/carousel/02-the-statement-hublot.png`
3. `assets/carousel/03-the-colour-tissot.png`
4. `assets/carousel/04-the-silhouette-chanel.png`
5. `assets/carousel/05-cta-find-yours.png`

### Video concept covers — 1080 × 1920, PNG

- `assets/video-covers/reel-01-the-detail-reveal.png`
- `assets/video-covers/reel-02-choose-your-mood.png`

The complete shot lists, on-screen copy, edit pacing, and audio guidance are in `video-concepts.md`. The two silent MP4 edits are included in `assets/videos/`; add platform-cleared music or an approved English/Sinhala voiceover when publishing.

## Suggested rollout

1. **Day 1 — Feed post 01:** Hublot detail-led launch.
2. **Day 2 — Reel concept 01:** close-up product reveal.
3. **Day 4 — Carousel:** saveable “three ways to wear your time” edit.
4. **Day 6 — Feed post 02:** Tissot colour story.
5. **Day 8 — Reel concept 02:** “choose your mood” comparison.
6. **Day 10 — Feed post 03:** Chanel understated-style story.

For Instagram and Facebook, publish the full bilingual caption from `captions.md`. For TikTok, use the shorter hook and CTA version in the same file.

## Re-rendering the pack

`render-starter-pack.sh` is a small ImageMagick renderer kept beside the assets. It uses only local catalogue images, the existing R.S.D. banner/logo, and the brand palette. Run it from the repository root:

```bash
marketing/render-starter-pack.sh
```
