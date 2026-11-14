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
  if (!(await enforceRateLimit(req, res, { name: "favorite", limit: 120, windowMs: 10 * 60 * 1000 }))) return;
  const body = typeof req.body === "string" ? (() => {
    try { return JSON.parse(req.body); } catch { return {}; }
  })() : (req.body || {});
  const sku = cleanText(body.sku, 24).toUpperCase();
  const visitorId = cleanText(body.visitorId, 120);
  const favorite = body.favorite !== false;
  if (!sku || !/^[A-Za-z0-9_-]{16,120}$/.test(visitorId)) {
    sendJson(res, 400, { error: "A valid product and visitor id are required." });
    return;
  }
  try {
    const db = getAdminDb();
    const result = favorite
      ? await db.from("ht_product_favorites").upsert({ sku, visitor_id: visitorId }, { onConflict: "sku,visitor_id", ignoreDuplicates: true })
      : await db.from("ht_product_favorites").delete().eq("sku", sku).eq("visitor_id", visitorId);
    if (result.error) {
      sendJson(res, 400, { error: "The favourite could not be saved." });
      return;
    }
    const countResult = await db.from("ht_product_favorites").select("sku", { count: "exact", head: true }).eq("sku", sku);
    sendJson(res, 200, { ok: true, count: countResult.count || 0 });
  } catch {
    sendJson(res, 503, { error: "The favourites service is unavailable." });
  }
}
