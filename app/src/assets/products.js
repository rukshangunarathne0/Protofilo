// Product artwork catalogue.
//
// The optimiser (scripts/optimize-images.mjs) writes files into ./products/.
// Every file is picked up automatically at build time — nothing to register,
// no import list to maintain as the catalogue grows past 50 or 500 photos.
//
// File name = SKU. "HT-W-214.webp" belongs to SKU HT-W-214. Matching is
// case-insensitive and also works for plain slugs, so "blue-watch.webp" is
// found by a product whose SKU is "blue-watch".
const files = import.meta.glob("./products/*.webp", { eager: true, import: "default" });

/** @type {Map<string, {large?: string, small?: string}>} */
const catalogue = new Map();

for (const [filePath, url] of Object.entries(files)) {
  const base = filePath.split("/").pop().replace(/\.webp$/i, "");
  const isSmall = /-480$/i.test(base);
  const key = base.replace(/-480$/i, "").toLowerCase();
  const entry = catalogue.get(key) ?? {};
  entry[isSmall ? "small" : "large"] = url;
  catalogue.set(key, entry);
}

/** True when we hold a locally optimised photo for this SKU / slug. */
export function hasProductImage(sku) {
  if (!sku) return false;
  return catalogue.has(String(sku).trim().toLowerCase());
}

/**
 * Locally optimised URL for a SKU / slug, or null when we do not have one.
 * Callers fall back to the existing remote artwork.
 */
export function productImageSrc(sku) {
  if (!sku) return null;
  const entry = catalogue.get(String(sku).trim().toLowerCase());
  return entry?.large ?? entry?.small ?? null;
}

/**
 * Responsive descriptor for an <img>. Returns undefined when there is only one
 * size, so React omits the attribute entirely.
 */
export function productImageSrcSet(sku) {
  if (!sku) return undefined;
  const entry = catalogue.get(String(sku).trim().toLowerCase());
  if (!entry?.large || !entry?.small) return undefined;
  return `${entry.small} 480w, ${entry.large} 960w`;
}

/** How many products currently have local artwork (used by the console).   */
export function productImageCount() {
  return catalogue.size;
}

// ---------------------------------------------------------------------------
// Photos that live in the database (uploaded from the admin console).
//
// The dealer UI calls a single helper, Lr(sku, category), from a dozen places.
// Rather than thread a new argument through every one of them, the store
// registers each product's photo here once per sync and Lr() consults it.
const registry = new Map();

/** True for a real URL or inline image, false for the old placeholder values. */
export function isUsablePhoto(value) {
  if (typeof value !== "string") return false;
  const v = value.trim();
  if (!v) return false;
  if (/product-wrist\.jpg$/i.test(v)) return false; // legacy placeholder
  return /^(https?:\/\/|\/|data:image\/)/.test(v);
}

/** Remember (or forget) the photos of the products just loaded or saved. */
export function registerProductPhotos(products) {
  if (!Array.isArray(products)) return;
  for (const product of products) {
    if (!product?.sku) continue;
    const key = String(product.sku).toUpperCase();
    const photo = product.image;
    if (isUsablePhoto(photo)) registry.set(key, photo.trim());
    else if (photo === undefined) continue; // patch without an image
    else registry.delete(key);
  }
}

/** Database photo for a SKU, if one has been uploaded. */
export function productPhoto(sku) {
  if (!sku) return null;
  return registry.get(String(sku).toUpperCase()) ?? null;
}
