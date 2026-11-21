// Server-only R.S.D. customer pricing. Never import this module from the
// browser bundle: supplier costs, reference prices, and the pricing rule are
// private operations data.
export const PACKING = 200;
export const COURIER = 400;
export const MINIMUM_PROFIT = 800;

export function defaultMarkupPercent(watchPrice) {
  const price = Number(watchPrice);
  if (price < 1000) return 80;
  if (price < 2500) return 55;
  if (price < 6000) return 45;
  return 25;
}

export function roundUpToNearest50(value) {
  return Math.ceil(Number(value) / 50) * 50;
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== "";
}

function cleanOptionalNumber(value, label, { minimum = 0 } = {}) {
  if (!hasValue(value)) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < minimum) {
    throw new Error(`${label} must be a valid number greater than or equal to ${minimum}.`);
  }
  return number;
}

function resolveOptions(markupOrOptions, legacyPriceOverride) {
  if (markupOrOptions && typeof markupOrOptions === "object") {
    return {
      markupPercent: markupOrOptions.markupPercent ?? markupOrOptions.markup_percent,
      priceOverride: markupOrOptions.priceOverride ?? markupOrOptions.price_override,
      referencePrice: markupOrOptions.referencePrice ?? markupOrOptions.reference_price,
    };
  }
  return {
    markupPercent: markupOrOptions,
    priceOverride: legacyPriceOverride,
    referencePrice: undefined,
  };
}

/**
 * Calculate the customer price without exposing the private inputs to the
 * browser bundle. The second argument remains backwards-compatible with the
 * old numeric markup override; it can also be an options object containing
 * markupPercent, priceOverride, and referencePrice.
 */
export function calculateCustomerPrice(watchPrice, markupOrOptions, legacyPriceOverride) {
  const supplierPrice = Number(watchPrice);
  if (!Number.isFinite(supplierPrice) || supplierPrice < 0) {
    throw new Error("Supplier watch price must be a non-negative number.");
  }

  const options = resolveOptions(markupOrOptions, legacyPriceOverride);
  const markupPercent = cleanOptionalNumber(options.markupPercent, "Markup override");
  if (markupPercent !== null && markupPercent > 500) {
    throw new Error("Markup override must be between 0 and 500 percent.");
  }
  const priceOverride = cleanOptionalNumber(options.priceOverride, "Price override");
  const referencePrice = cleanOptionalNumber(options.referencePrice, "Reference price");
  if (referencePrice !== null && referencePrice <= 0) {
    throw new Error("Reference price must be greater than 0 when provided.");
  }

  const appliedMarkup = markupPercent ?? defaultMarkupPercent(supplierPrice);
  const landedCost = supplierPrice + PACKING + COURIER;
  const rawPrice = landedCost * (1 + appliedMarkup / 100);
  const formulaPrice = Math.max(
    roundUpToNearest50(rawPrice),
    roundUpToNearest50(landedCost + MINIMUM_PROFIT),
  );
  // A special deal is deliberately allowed to sit below the minimum-profit
  // guard. The terminal report will flag it as LOW PROFIT instead.
  const finalPrice = priceOverride === null ? formulaPrice : priceOverride;
  const profit = finalPrice - landedCost;

  return {
    watchPrice: supplierPrice,
    packing: PACKING,
    courier: COURIER,
    landedCost,
    markupPercent: appliedMarkup,
    rawPrice,
    formulaPrice,
    priceOverride,
    referencePrice,
    finalPrice,
    profit,
    profitPercent: landedCost > 0 ? (profit / landedCost) * 100 : 0,
  };
}

export function compareReferencePrice(finalPrice, referencePrice) {
  const price = Number(finalPrice);
  const reference = Number(referencePrice);
  if (!Number.isFinite(price) || !Number.isFinite(reference) || reference <= 0) return null;
  const differencePercent = ((price - reference) / reference) * 100;
  const direction = differencePercent > 0 ? "dearer" : differencePercent < 0 ? "cheaper" : "same price";
  return {
    differencePercent,
    direction,
  };
}

export function verifyPricingExamples() {
  const examples = [
    [300, 1700],
    [525, 2050],
    [750, 2450],
    [2000, 4050],
    [4450, 7350],
    [8000, 10750],
  ];
  return examples.map(([watchPrice, expected]) => {
    const result = calculateCustomerPrice(watchPrice);
    return { watchPrice, expected, actual: result.finalPrice, pass: result.finalPrice === expected };
  });
}
