import { createHash, randomUUID } from "node:crypto";
import { enforceRateLimit, methodNotAllowed, requestIsSameOrigin, sendJson } from "../server/admin-auth.js";
import { cleanText, getAdminDb } from "../server/admin-supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    methodNotAllowed(req, res);
    return;
  }
  if (!requestIsSameOrigin(req)) {
    sendJson(res, 403, { error: "Request rejected." });
    return;
  }
  if (!(await enforceRateLimit(req, res, { name: "customer-order", limit: 20, windowMs: 10 * 60 * 1000 }))) return;
  const body = typeof req.body === "string" ? (() => {
    try { return JSON.parse(req.body); } catch { return {}; }
  })() : (req.body || {});
  const sku = cleanText(body.sku, 24).toUpperCase();
  const quantity = Math.min(99, Math.max(1, Math.trunc(Number(body.quantity) || 1)));
  const colour = cleanText(body.colour, 60) || "Not selected";
  if (!sku) {
    sendJson(res, 400, { error: "A product is required." });
    return;
  }
  try {
    const requestedKey = cleanText(req.headers["idempotency-key"], 120);
    const idempotencyKey = /^[A-Za-z0-9._~-]{8,120}$/.test(requestedKey) ? requestedKey : randomUUID();
    const orderId = `WEB-${createHash("sha256").update(idempotencyKey).digest("hex").slice(0, 32).toUpperCase()}`;
    const order = {
      id: orderId,
      dealer: "Website customer",
      city: "Online",
      date: new Date().toISOString().slice(0, 10),
      // The RPC derives price, product name, and totals from the locked product row.
      amount: 0,
      units: quantity,
      status: "Submitted",
      channel: "Website order",
      delivery: "Free delivery",
      reference: `Colour: ${colour}`,
      lines: [{ sku, name: sku, qty: quantity, price: 0, reservedQty: 0 }],
    };
    const result = await getAdminDb().rpc("ht_place_order", { p_order: order });
    if (result.error) {
      const unavailable = result.error.code === "P0001" && /stock/i.test(result.error.message || "");
      sendJson(res, unavailable ? 409 : 400, {
        error: unavailable ? "That product is currently unavailable." : "The order could not be recorded.",
      });
      return;
    }
    const price = Number(result.data?.unitPrice);
    sendJson(res, 200, {
      ok: true,
      orderId: result.data?.orderId || order.id,
      price: Number.isFinite(price) ? price : 0,
    });
  } catch {
    sendJson(res, 503, { error: "The order service is unavailable." });
  }
}
