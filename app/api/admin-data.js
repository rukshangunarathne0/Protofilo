import { methodNotAllowed, readSession, requestIsSameOrigin, sendJson } from "../server/admin-auth.js";
import { getAdminDb } from "../server/admin-supabase.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    methodNotAllowed(req, res, "GET");
    return;
  }
  if (!requestIsSameOrigin(req) || !readSession(req)) {
    sendJson(res, 401, { error: "Administrator session required." });
    return;
  }
  try {
    const db = getAdminDb();
    const [prodRes, dealRes, ordRes, preRes, feedbackRes] = await Promise.all([
      db.from("ht_products").select("*").order("sort_order", { ascending: true }).order("sku", { ascending: true }),
      db.from("ht_dealers").select("*").order("sort_order", { ascending: true }).order("name", { ascending: true }),
      db.from("ht_orders").select("*").order("date", { ascending: false }).order("id", { ascending: false }),
      db.from("ht_preorders").select("*").order("sort_order", { ascending: true }).order("id", { ascending: true }),
      db.from("feedback").select("*").order("created_at", { ascending: false }).limit(500),
    ]);
    const failed = [prodRes, dealRes, ordRes, preRes, feedbackRes].find(result => result.error);
    if (failed) {
      sendJson(res, 502, { error: "The administrator data could not be loaded." });
      return;
    }
    sendJson(res, 200, {
      products: prodRes.data || [],
      dealers: dealRes.data || [],
      orders: ordRes.data || [],
      preorders: preRes.data || [],
      feedback: feedbackRes.data || [],
    });
  } catch {
    sendJson(res, 503, { error: "The administrator data service is unavailable." });
  }
}
