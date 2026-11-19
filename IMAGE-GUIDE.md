# Adding product photos — the 50-image plan

You asked what happens "when I publish it and add at least 50 images". Short
answer: **nothing breaks, but do not upload 50 phone photos as they come off the
camera.** Each one is 3–5 MB, so 50 of them is a 200 MB shop that no phone will
open. The repo now has a one-command tool that turns them into web-sized files,
and the app picks them up by itself.

---

## Adding a photo from the admin page (no code, no rebuild)

The console's **Products → Add product** form now takes the photo itself:

1. Open the console → **Products** → **Add product** (top right). A full page opens.
2. Fill in the title, brand, category, description, retail and wholesale price, and stock. The SKU is generated from the category — edit it if you want your own code.
3. Under **Product image** press **Choose file** and pick the photo.
4. The form shows the new size straight away, e.g. `4.2 MB → 96 kB · 1000×750 px`.
5. Press **Add product to catalogue**. It saves to Supabase, returns you to the catalogue, and the item is live in the dealer shop.

### The limits

| Limit | Value | What happens |
| --- | --- | --- |
| Photo you may pick | **5 MB** | bigger files are refused with a message, nothing is uploaded |
| Accepted formats | JPG, PNG, WebP, AVIF | anything else is refused |
| Stored size | ~120 kB, 1000 px longest edge | the browser resizes and re-encodes as WebP for you |
| Database copy (fallback) | 24 kB | only used when storage uploads are blocked |
| Database row guard | 200 000 characters | the SQL check constraint refuses a bloated row |

You do not need to crop or resize anything yourself — the browser does it. A
4 MB phone photo becomes roughly 60–100 kB before it leaves the device, so
adding products on a weak connection still works.

### Brand, description and retail price

These three fields need three new database columns. Run
`app/sql/admin-product-fields.sql` once in Supabase (**SQL Editor → New query →
paste → Run**), then reload the console. Until you do, the form hides those
fields and shows a note instead — the photo field works either way.

The same SQL file also adds the storage policy that lets the console upload
photos. Without it the console still saves the picture, just as a small inline
copy (24 kB) instead of a full-size file.

### Two ways to add products — which to use

| | Admin page (no rebuild) | `npm run images` folder |
| --- | --- | --- |
| Who | shop owner, on a phone or laptop | developer, before a launch |
| Photo lives in | Supabase Storage + the `image` column | the app bundle, served from the Vercel edge |
| Loading speed | good | fastest |
| Needs SQL run once | yes, for full-size photos | no |
| Best for | day-to-day additions | the launch catalogue of 50 photos |

They cooperate: if a product has an uploaded photo it wins, otherwise the app
falls back to the SKU file, then to the category picture.

---

## The rule in one line

**Name the photo after the product's SKU, drop it in `app/raw-images/`, run
`npm run images`.**

| Photo file | Product SKU in the database | Result |
| --- | --- | --- |
| `HT-W-214.jpg` | `HT-W-214` | ✅ matched automatically |
| `HT-W-214.jpg` | `HT-W-215` | ❌ not matched — falls back to the category photo |
| `blue watch.png` | `blue-watch` | ✅ matched (spaces and case are ignored) |

Matching ignores capitals and spaces. If a product has no photo, the tile shows
the category photo, so **you never get a broken image**, only a generic one.

---

## The steps, click by click

1. On your computer, open the folder `ht-ws-project/app/raw-images/`.
2. Copy your 50 photos there. Rename each one to the SKU of the product
   (`HT-W-214.jpg`, `HT-C-042.jpg`, …).
3. Open a terminal in `ht-ws-project/app`.
4. Run `npm install` once (first time only).
5. Run `npm run images`.
6. Wait. You will see a line per photo: original size, new size, and the
   percentage kept.
7. The finished files appear in `ht-ws-project/app/src/assets/products/` —
   two per photo: `HT-W-214.webp` and `HT-W-214-480.webp`.
8. Delete nothing in `raw-images/` yet; it is ignored by git, so your 200 MB of
   originals never reach GitHub.
9. Commit and push as usual. Vercel rebuilds and the photos are live.

That is the whole job. There is no list of imports to maintain — the build
scans the folder, so photo 51 works exactly like photo 1.

---

## What your customers actually download

The tool makes two sizes per product, and the browser picks the right one:

- **`-480.webp`** — 480 px wide, ~15–25 kB. Used on phones.
- **`HT-….webp`** — 960 px wide, ~30–60 kB. Used on tablets and desktops.

50 products at ~45 kB each is **about 2.2 MB in total in the repo** — but a phone
only downloads the pictures it can see. Six tiles on screen ≈ **270 kB**, and
anything already seen is cached forever (the file names are fingerprinted).

For comparison, before this change the app downloaded **1.5 MB of images before
showing a single product**.

---

## Which storage to use — pick by how often the shop changes

| | Photos in the repo (what we just built) | Photos in Supabase Storage |
| --- | --- | --- |
| Best for | up to ~100 products, catalogue changes monthly | hundreds of products, staff add photos weekly without a developer |
| Cost | free, part of the deploy | free tier is fine, but you must compress before uploading |
| Speed in Sri Lanka | fastest — served from the same Vercel edge as the app | slower — one more hop to Supabase |
| To add a photo | put the file in `raw-images/`, run `npm run images`, push | upload the *already optimised* WebP to the bucket, paste the URL into the `products.image` column |

**My recommendation:** stay in the repo until you pass roughly 100 products, or
until someone other than a developer needs to add photos. Then move to Supabase
Storage — but keep running `npm run images` first. Uploading raw camera files to
the bucket is exactly what made the app slow in the first place.

Both can coexist: if a product has no local file, the app uses the remote URL /
category photo, so you can migrate one product at a time.

---

## The five things that actually make photos slow

1. **Original size.** A 4032 × 3024 phone photo is 4 MB. The tool fixes this.
2. **Format.** JPEG and PNG are old. WebP is 25–35 % smaller at the same look.
3. **Wrong dimensions.** Never serve more pixels than the slot displays. A tile
   is ~320 px wide; 4000 px is 12× wasted.
4. **No caching.** Fingerprinted file names mean a phone downloads each photo
   once, ever.
5. **Lazy loading.** Only the tiles on screen load. Already set on the grid.

---

## Rules of thumb for the photos themselves

- **Crop to 4:3 or square** before running the tool. The tile is not square, so
  an off-centre watch ends up half out of frame.
- **Shoot on a plain background.** A busy background needs more bytes to look
  good.
- **No screenshots or WhatsApp forwards** — they arrive compressed twice and
  look soft. Ask for the original file.
- **Keep names boring.** Letters, numbers, dashes. No "IMG_20240114 (1).jpeg".
- **Do not edit the files in `src/assets/products/` by hand** — rerun the tool
  instead, so both sizes stay in sync.

---

## If something goes wrong

| Symptom | Cause | Fix |
| --- | --- | --- |
| `No source images found` | nothing in `raw-images/` | copy the photos in; check the folder name |
| Tile still shows the old photo | file name does not match the SKU | rename the file to the exact SKU |
| `npm run images` crashes on install | `sharp` needs a first-time download | run `npm install` again with internet on |
| Photos look blurry on desktop | 960 px is the cap for full-size use | raise `width` in `scripts/optimize-images.mjs` |
| Repo feels heavy | originals were committed by mistake | `git rm --cached` them; `.gitignore` already blocks `raw-images/` |

---

## Where the pieces live

| File | What it does |
| --- | --- |
| `app/raw-images/` | your untouched originals (ignored by git) |
| `app/scripts/optimize-images.mjs` | resizes + converts + writes `MANIFEST.md` |
| `app/src/assets/products/` | the finished WebP files that ship with the app |
| `app/src/assets/products.js` | finds the photo for a SKU, builds the `srcset` |
| `app/src/App.jsx` → `Lr()` | uses the local photo first, else the category photo |
