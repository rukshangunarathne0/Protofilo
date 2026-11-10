import { createClient } from "@supabase/supabase-js";

export function getAdminDb() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Admin database is not configured.");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function cleanText(value, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function cleanNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function cleanProduct(product = {}) {
  return {
    sku: cleanText(product.sku, 24).toUpperCase(),
    name: cleanText(product.name, 160),
    category: cleanText(product.category, 80),
    price: Math.max(0, cleanNumber(product.price)),
    stock: Math.max(0, Math.trunc(cleanNumber(product.stock))),
    reserved: Math.max(0, Math.trunc(cleanNumber(product.reserved))),
    image: cleanText(product.image, 200000) || "images/product-wrist.jpg",
    trend: Array.isArray(product.trend) ? product.trend.slice(0, 30).map(value => cleanNumber(value)) : [0, 0, 0, 0, 0, 0, 0],
    ...(product.brand !== undefined ? { brand: cleanText(product.brand, 120) || null } : {}),
    ...(product.description !== undefined ? { description: cleanText(product.description, 1000) || null } : {}),
    ...(product.retailPrice !== undefined ? { retail_price: Math.max(0, cleanNumber(product.retailPrice)) } : {}),
  };
}
