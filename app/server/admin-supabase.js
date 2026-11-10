import { createClient } from "@supabase/supabase-js";
import { calculateCustomerPrice } from "./pricing.js";

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

export function cleanMarkup(value) {
  if (value === undefined || value === null || value === "") return null;
  const markup = Number(value);
  if (!Number.isFinite(markup) || markup < 0 || markup > 500) {
    throw new Error("Markup override must be between 0 and 500 percent.");
  }
  return markup;
}

export function cleanColors(value) {
  const values = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
  return [...new Set(values.map(item => cleanText(item, 40)).filter(Boolean))].slice(0, 12);
}

export function calculateProductPrice(supplierPrice, markupPercent) {
  return calculateCustomerPrice(cleanNumber(supplierPrice, NaN), cleanMarkup(markupPercent));
}

export function cleanProduct(product = {}) {
  const cleaned = {
    sku: cleanText(product.sku, 24).toUpperCase(),
    name: cleanText(product.name, 160),
    category: cleanText(product.category, 80),
    // Stock is managed separately through the inventory action, never through
    // the add/edit product form.
    stock: 0,
    reserved: 0,
    image: cleanText(product.image, 200000) || "images/product-wrist.jpg",
    trend: Array.isArray(product.trend) ? product.trend.slice(0, 30).map(value => cleanNumber(value)) : [0, 0, 0, 0, 0, 0, 0],
    gender: cleanText(product.gender, 30) || "Unisex",
    product_type: cleanText(product.productType || product.product_type, 40) || "Watches",
    is_new: product.isNew === undefined ? true : !!product.isNew,
    sort_order: Math.max(0, Math.trunc(cleanNumber(product.sortOrder, 0))),
    ...(product.brand !== undefined ? { brand: cleanText(product.brand, 120) || null } : {}),
    ...(product.description !== undefined ? { description: cleanText(product.description, 1000) || null } : {}),
    colors: cleanColors(product.colors),
  };
  cleaned.price = Math.max(0, cleanNumber(product.price));
  return cleaned;
}

export function cleanPublicProduct(row = {}) {
  return {
    sku: cleanText(row.sku, 24).toUpperCase(),
    name: cleanText(row.name, 160),
    category: cleanText(row.category, 80),
    price: Math.max(0, cleanNumber(row.price)),
    stock: Math.max(0, Math.trunc(cleanNumber(row.stock))),
    reserved: Math.max(0, Math.trunc(cleanNumber(row.reserved))),
    image: cleanText(row.image, 200000) || "images/product-wrist.jpg",
    brand: row.brand == null ? undefined : cleanText(row.brand, 120),
    description: row.description == null ? undefined : cleanText(row.description, 1000),
    colors: cleanColors(row.colors),
    gender: cleanText(row.gender, 30) || "Unisex",
    productType: cleanText(row.product_type, 40) || "Watches",
    isNew: !!row.is_new,
    trend: Array.isArray(row.trend) ? row.trend.slice(0, 30).map(Number) : [0, 0, 0, 0, 0, 0, 0],
    availability: cleanText(row.availability, 100) || "Available to order",
    favoriteCount: Math.max(0, Math.trunc(cleanNumber(row.favoriteCount))),
  };
}
