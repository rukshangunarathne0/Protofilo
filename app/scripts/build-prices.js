import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateCustomerPrice, compareReferencePrice, MINIMUM_PROFIT, verifyPricingExamples } from "../server/pricing.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const costPath = resolve(root, "private/products-cost.json");
const contentPath = resolve(root, "src/data/product-content.json");
const outputPath = resolve(root, "src/data/products.json");

// These fields may be present in the ignored private source, but must never be
// copied to the customer-facing catalogue.
const PRIVATE_FIELDS = new Set([
  "watch_price",
  "supplier_price",
  "supplierPrice",
  "landed_cost",
  "landedCost",
  "markup_percent",
  "markupPercent",
  "price_override",
  "priceOverride",
  "reference_price",
  "referencePrice",
  "pricing",
  "raw_price",
  "rawPrice",
  "formula_price",
  "formulaPrice",
  "finalPrice",
  "retail_price",
  "retailPrice",
  "customer_price",
  "customerPrice",
  "price",
  "profit",
  "profit_percent",
  "profitPercent",
  "warnings",
  "reference_comparison",
  "referenceComparison",
  "packing",
  "courier",
  "minimum_profit",
  "minimumProfit",
]);

// Keep the current content schema intact, while also allowing future
// customer-facing catalogue metadata such as SKU/category/brand/presentation
// to pass through from product-content.json or an existing public row.
const KNOWN_PUBLIC_FIELDS = [
  "sku",
  "category",
  "brand",
  "presentation",
  "image",
  "image_back",
  "imageBack",
  "images",
  "description",
  "colors",
  "gender",
  "product_type",
  "productType",
  "is_new",
  "isNew",
  "is_high_value",
  "isHighValue",
  "availability",
  "sort_order",
  "sortOrder",
  "created_at",
  "slug",
  "tags",
  "material",
  "size",
  "movement",
  "water_resistance",
];

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, "utf8"));
}

function normalizeCostRows(value) {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.products)) return value.products;
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).map(([name, product]) => (
    product && typeof product === "object"
      ? { ...product, name: product.name || name }
      : { name, watch_price: product }
  ));
}

function optionalNumber(item, key, label, minimum = 0) {
  const value = item[key];
  if (value === undefined || value === null || value === "") return undefined;
  const number = Number(value);
  if (!Number.isFinite(number) || number < minimum) {
    throw new Error(`Invalid ${label} for ${item.name || "unnamed product"}.`);
  }
  return number;
}

function formatPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  const rounded = Math.abs(number) < 0.05 ? 0 : number;
  return `${rounded.toFixed(1)}%`;
}

function formatReferenceComparison(comparison) {
  if (!comparison) return "—";
  if (comparison.direction === "same price") return "0.0% same price";
  return `${formatPercent(comparison.differencePercent)} ${comparison.direction}`;
}

function warningsFor(pricing, referenceComparison) {
  const warnings = [];
  if (referenceComparison && pricing.finalPrice > pricing.referencePrice * 0.9) {
    warnings.push("WARNING: TOO HIGH");
  }
  if (pricing.profit < MINIMUM_PROFIT) warnings.push("WARNING: LOW PROFIT");
  return warnings;
}

function publicFieldNames(contentRows, existingRows) {
  return [...new Set([
    ...KNOWN_PUBLIC_FIELDS,
    ...contentRows.flatMap(item => Object.keys(item || {})),
    ...existingRows.flatMap(item => Object.keys(item || {})),
  ])].filter(field => field !== "name" && field !== "final_price" && !PRIVATE_FIELDS.has(field));
}

function publicMetadata(item, metadata, existing, publicFields) {
  const name = String(item.name || "").trim();
  const merged = {
    ...(existing.get(name) || {}),
    ...(metadata.get(name) || {}),
    ...item,
  };
  const content = {
    name,
    images: Array.isArray(merged.images) ? merged.images : [],
    description: String(merged.description || "").trim(),
    colors: Array.isArray(merged.colors) ? merged.colors : [],
    availability: String(merged.availability || "Available to order").trim(),
  };

  for (const field of publicFields) {
    if (content[field] !== undefined || merged[field] === undefined) continue;
    content[field] = merged[field];
  }
  return content;
}

function cleanProduct(item = {}, metadata, existing, publicFields) {
  const name = String(item.name || "").trim();
  const supplierPrice = Number(item.watch_price);
  if (!name || !Number.isFinite(supplierPrice) || supplierPrice < 0) {
    throw new Error(`Invalid private product cost for ${name || "unnamed product"}.`);
  }

  const markupPercent = optionalNumber(item, "markup_percent", "markup_percent");
  if (markupPercent !== undefined && markupPercent > 500) {
    throw new Error(`Invalid markup_percent for ${name}. It must be between 0 and 500.`);
  }
  const priceOverride = optionalNumber(item, "price_override", "price_override");
  const referencePrice = optionalNumber(item, "reference_price", "reference_price");
  if (referencePrice !== undefined && referencePrice <= 0) {
    throw new Error(`Invalid reference_price for ${name}. It must be greater than 0.`);
  }

  const pricing = calculateCustomerPrice(supplierPrice, {
    markupPercent,
    priceOverride,
    referencePrice,
  });
  const referenceComparison = compareReferencePrice(pricing.finalPrice, referencePrice);
  const warnings = warningsFor(pricing, referenceComparison);
  return {
    ...publicMetadata(item, metadata, existing, publicFields),
    final_price: pricing.finalPrice,
    pricing: {
      ...pricing,
      referenceComparison,
      warnings,
    },
  };
}

const examples = verifyPricingExamples();
console.log("Pricing checks");
console.table(examples.map(row => ({
  "watch price": row.watchPrice,
  expected: row.expected,
  actual: row.actual,
  result: row.pass ? "PASS" : "FAIL",
})));
if (examples.some(row => !row.pass)) process.exitCode = 1;

if (!existsSync(costPath)) {
  console.warn(`\nCreate ${costPath} before building product prices.`);
} else {
  const costs = normalizeCostRows(readJson(costPath, []));
  if (costs.length === 0) {
    console.warn("\nNo private product costs configured. The public products.json file was not changed.");
  } else {
    const contentRows = readJson(contentPath, []);
    const existingRows = readJson(outputPath, []);
    const metadata = new Map(contentRows.map(item => [String(item?.name || "").trim(), item]));
    const existing = new Map(existingRows.map(item => [String(item?.name || "").trim(), item]));
    const publicFields = publicFieldNames(contentRows, existingRows);
    const rows = costs.map(item => cleanProduct(item, metadata, existing, publicFields));

    console.log("\nCustomer pricing table (private terminal output)");
    console.table(rows.map(({ pricing, name }) => ({
      name,
      "watch price": pricing.watchPrice,
      "landed cost": pricing.landedCost,
      "markup used": `${pricing.markupPercent}%`,
      "final price": pricing.finalPrice,
      profit: pricing.profit,
      "profit %": formatPercent(pricing.profitPercent),
      "vs reference": formatReferenceComparison(pricing.referenceComparison),
      warning: pricing.warnings.join(" · ") || "—",
    })));

    // Deliberately whitelist the public shape. Private supplier price, landed
    // cost, markup, price overrides, reference prices, formula data, and
    // warnings never reach the committed public catalogue.
    const publicRows = rows.map(({ pricing: _privatePricing, name, final_price, ...publicFields }) => ({
      name,
      final_price,
      ...publicFields,
    }));
    writeFileSync(outputPath, `${JSON.stringify(publicRows, null, 2)}\n`);
    console.log(`\nWrote ${publicRows.length} public products to ${outputPath}.`);
  }
}
