// Server-only R.S.D. customer pricing. Never import this module from the
// browser bundle: supplier costs and the pricing rule are private operations data.
export const PACKING = 200;
export const COURIER = 400;
export const MINIMUM_PROFIT = 800;

export function defaultMarkupPercent(watchPrice) {
  if (watchPrice < 1000) return 80;
  if (watchPrice <= 2500) return 50;
  if (watchPrice <= 6000) return 30;
  return 22;
}

export function roundUpToNearest50(value) {
  return Math.ceil(value / 50) * 50;
}

export function calculateCustomerPrice(watchPrice, markupPercent) {
  const supplierPrice = Number(watchPrice);
  if (!Number.isFinite(supplierPrice) || supplierPrice < 0) {
    throw new Error("Supplier watch price must be a non-negative number.");
  }
  const override = markupPercent === undefined || markupPercent === null || markupPercent === ""
    ? null
    : Number(markupPercent);
  if (override !== null && (!Number.isFinite(override) || override < 0 || override > 500)) {
    throw new Error("Markup override must be between 0 and 500 percent.");
  }
  const appliedMarkup = override ?? defaultMarkupPercent(supplierPrice);
  const landedCost = supplierPrice + PACKING + COURIER;
  const rawPrice = landedCost * (1 + appliedMarkup / 100);
  const markedPrice = roundUpToNearest50(rawPrice);
  const minimumPrice = roundUpToNearest50(landedCost + MINIMUM_PROFIT);
  const finalPrice = Math.max(markedPrice, minimumPrice);
  return {
    watchPrice: supplierPrice,
    packing: PACKING,
    courier: COURIER,
    landedCost,
    markupPercent: appliedMarkup,
    rawPrice,
    finalPrice,
    profit: finalPrice - landedCost,
  };
}

export function verifyPricingExamples() {
  const examples = [
    [525, 2050],
    [575, 2150],
    [2000, 3900],
    [4450, 6600],
    [8000, 10500],
  ];
  return examples.map(([watchPrice, expected]) => {
    const result = calculateCustomerPrice(watchPrice);
    return { watchPrice, expected, actual: result.finalPrice, pass: result.finalPrice === expected };
  });
}
