// Photo intake for the admin console.
//
// A phone photo is 3–5 MB. We never send that anywhere: it is decoded in the
// browser, downscaled to 1000 px, re-encoded as WebP, and quality-stepped until
// it fits the budget below. Only the small result is uploaded.
import { supabase } from "./supabase.js";

/** Hard ceiling for the file the admin picks. */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
/** Budget for what actually gets stored. */
export const TARGET_BYTES = 120 * 1024;
/** Budget when the photo has to live inside the database row instead. */
export const INLINE_BYTES = 24 * 1024;

const MAX_EDGE = 1000;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const QUALITY_LADDER = [0.82, 0.72, 0.62, 0.52];

export const ACCEPT_ATTRIBUTE = ACCEPTED.join(",");

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 kB";
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} kB`;
}

/** Reject obviously unusable files before doing any decoding work. */
export function checkPhotoFile(file) {
  if (!file) return "Choose a photo first.";
  if (!ACCEPTED.includes(file.type)) return "That file is not a JPG, PNG, WebP or AVIF image.";
  if (file.size > MAX_UPLOAD_BYTES) {
    // Round up, so a 5.01 MB file never reads as "5.0 MB" while being refused.
    const mb = (Math.ceil((file.size / (1024 * 1024)) * 10) / 10).toFixed(1);
    return `That photo is ${mb} MB. The limit is 5 MB — please use a smaller one.`;
  }
  return null;
}

async function decode(file) {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // Older Safari rejects the options bag; the fallback below handles EXIF.
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function draw(source, width, height) {
  const canvas =
    typeof OffscreenCanvas === "function"
      ? new OffscreenCanvas(width, height)
      : Object.assign(document.createElement("canvas"), { width, height });
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, width, height);
  return canvas;
}

function encode(canvas, quality) {
  if (typeof canvas.convertToBlob === "function") {
    return canvas.convertToBlob({ type: "image/webp", quality });
  }
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error("The browser could not encode this image."))),
      "image/webp",
      quality
    );
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the image."));
    reader.readAsDataURL(blob);
  });
}

/**
 * Downscale + re-encode. Returns the smallest acceptable WebP plus a preview.
 * Throws a human-readable Error when the file cannot be used.
 */
export async function optimisePhoto(file, { maxEdge = MAX_EDGE, budget = TARGET_BYTES } = {}) {
  const problem = checkPhotoFile(file);
  if (problem) throw new Error(problem);

  const source = await decode(file);
  const srcW = source.width || source.naturalWidth;
  const srcH = source.height || source.naturalHeight;
  if (!srcW || !srcH) throw new Error("That image could not be read. Try another file.");

  const scale = Math.min(1, maxEdge / Math.max(srcW, srcH));
  let width = Math.max(1, Math.round(srcW * scale));
  let height = Math.max(1, Math.round(srcH * scale));

  let blob = null;
  let quality = QUALITY_LADDER[0];

  // Shrink the dimensions before destroying the quality: a 600 px photo looks
  // better than a 1000 px one dragged down to 30 % quality.
  for (let shrink = 0; shrink < 3; shrink += 1) {
    const canvas = draw(source, width, height);
    for (const q of QUALITY_LADDER) {
      blob = await encode(canvas, q);
      quality = q;
      if (blob.size <= budget) break;
    }
    if (blob.size <= budget) break;
    width = Math.round(width * 0.8);
    height = Math.round(height * 0.8);
  }

  return {
    blob,
    dataUrl: await blobToDataUrl(blob),
    width,
    height,
    bytes: blob.size,
    originalBytes: file.size,
    quality
  };
}

/**
 * Store the optimised photo.
 *
 * Primary route: Supabase Storage, which keeps the catalogue query light.
 * Fallback: a very small inline data URL in the product row, so adding a
 * product still works when storage writes are not permitted.
 */
export async function publishProductPhoto(sku, optimised) {
  const safeSku = String(sku || "product").replace(/[^\w.-]+/g, "-").toLowerCase();
  const path = `ht-connect/products/${safeSku}-${Date.now()}.webp`;

  try {
    const { error } = await supabase.storage.from("product-images").upload(path, optimised.blob, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: true
    });
    if (error) throw error;
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    if (data?.publicUrl) return { url: data.publicUrl, mode: "storage", bytes: optimised.bytes };
    throw new Error("No public URL returned");
  } catch {
    // Storage is read-only for this key: keep a thumbnail-sized copy inline.
    if (optimised.bytes <= INLINE_BYTES) {
      return { url: optimised.dataUrl, mode: "inline", bytes: optimised.bytes };
    }
    let small;
    try {
      // Re-encode hard for the inline case so the row stays tiny.
      const file = new File([optimised.blob], "photo.webp", { type: "image/webp" });
      small = await optimisePhoto(file, { maxEdge: 480, budget: INLINE_BYTES });
    } catch {
      return { url: null, mode: "failed", bytes: 0 };
    }
    if (small.bytes > INLINE_BYTES) return { url: null, mode: "failed", bytes: small.bytes };
    return { url: small.dataUrl, mode: "inline", bytes: small.bytes };
  }
}
