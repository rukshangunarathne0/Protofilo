import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateCustomerPrice, verifyPricingExamples } from "../server/pricing.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const costPath = resolve(root, "private/products-cost.json");
const contentPath = resolve(root, "src/data/product-content.json");
const outputPath = resolve(root, "src/data/products.json");

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, "utf8"));
}

function cleanProduct(item = {}) {
  const name = String(item.name || "").trim();
  const supplierPrice = Number(item.watch_price);
  if (!name || !Number.isFinite(supplierPrice) || supplierPrice < 0) {
    throw new Error(`Invalid private product cost for ${name || "unnamed product"}.`);
  }
  const pricing = calculateCustomerPrice(supplierPrice, item.markup_percent);
  const content = {
    name,
    images: Array.isArray(item.images) ? item.images : [],
    description: String(item.description || "").trim(),
    colors: Array.isArray(item.colors) ? item.colors : [],
    availability: String(item.availability || "Available to order").trim(),
  };
  return { ...content, final_price: pricing.finalPrice, pricing };
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
  process.exit(0);
}

const costs = readJson(costPath, []);
if (!Array.isArray(costs) || costs.length === 0) {
  console.warn("\nNo private product costs configured. The public products.json file was not changed.");
  process.exit(0);
}
const metadata = new Map(readJson(contentPath, []).map(item => [item.name, item]));
const rows = costs.map(item => cleanProduct({ ...metadata.get(item.name), ...item }));
console.log("\nCustomer pricing table (private terminal output)");
console.table(rows.map(({ pricing, name }) => ({
  name,
  "watch price": pricing.watchPrice,
  "landed cost": pricing.landedCost,
  "markup %": pricing.markupPercent,
  "final price": pricing.finalPrice,
  profit: pricing.profit,
})));

const publicRows = rows.map(({ name, final_price, images, description, colors, availability }) => ({
  name,
  final_price,
  images,
  description,
  colors,
  availability,
}));
writeFileSync(outputPath, `${JSON.stringify(publicRows, null, 2)}\n`);
console.log(`\nWrote ${publicRows.length} public products to ${outputPath}.`);
