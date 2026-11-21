import { enforceRateLimit, methodNotAllowed, requestIsSameOrigin, sendJson } from "../server/admin-auth.js";
import { calculateCustomerPrice } from "../server/pricing.js";

function parseBody(body) {
  if (typeof body !== "string") return body || {};
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    methodNotAllowed(req, res);
    return;
  }
  if (!requestIsSameOrigin(req)) {
    sendJson(res, 403, { error: "Request rejected." });
    return;
  }
  if (!(await enforceRateLimit(req, res, { name: "price-calculator", limit: 60, windowMs: 10 * 60 * 1000 }))) return;

  const body = parseBody(req.body);
  const watchPrice = Number(body.watchPrice ?? body.cost);
  if (!Number.isFinite(watchPrice) || watchPrice < 0 || watchPrice > 100000000) {
    sendJson(res, 400, { error: "Enter a valid watch price in LKR." });
    return;
  }

  try {
    const pricing = calculateCustomerPrice(watchPrice);
    // Only the customer-facing result is returned. Private operations inputs
    // and the pricing formula stay on the server.
    sendJson(res, 200, { ok: true, finalPrice: pricing.finalPrice });
  } catch {
    sendJson(res, 400, { error: "That price could not be calculated." });
  }
}
