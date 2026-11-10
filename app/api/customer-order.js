import { randomUUID } from "node:crypto";
import { methodNotAllowed, requestIsSameOrigin, sendJson } from "../server/admin-auth.js";
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
    const db = getAdminDb();
    const productResult = await db.from("ht_products").select("sku,name,price,stock").eq("sku", sku).maybeSingle();
    if (productResult.error || !productResult.data) {
      sendJson(res, 404, { error: "That product is no longer available." });
      return;
    }
    const product = productResult.data;
    const order = {
      id: `WEB-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 6).toUpperCase()}`,
      dealer: "Website customer",
      city: "Online",
      date: new Date().toISOString().slice(0, 10),
      amount: Number(product.price) * quantity,
      units: quantity,
      status: "Submitted",
      channel: "Website order",
      delivery: "Free delivery",
      reference: `Colour: ${colour}`,
      lines: [{ sku: product.sku, name: product.name, qty: quantity, price: Number(product.price), reservedQty: 0 }],
    };
    const result = await db.rpc("ht_place_order", { p_order: order });
    if (result.error) {
      sendJson(res, 400, { error: "The order could not be recorded." });
      return;
    }
    sendJson(res, 200, { ok: true, orderId: order.id, price: Number(product.price) });
  } catch {
    sendJson(res, 503, { error: "The order service is unavailable." });
  }
}
