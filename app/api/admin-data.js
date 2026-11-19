import { methodNotAllowed, readSession, requestIsSameOrigin, sendJson } from "../server/admin-auth.js";
import { getAdminDb } from "../server/admin-supabase.js";

const PRODUCT_COLUMNS = "sku,name,category,price,stock,reserved,image,brand,description,colors,trend,sort_order,gender,product_type,is_new,availability,created_at,updated_at";

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
    const [prodRes, costRes, favoritesRes, dealRes, ordRes, feedbackRes] = await Promise.all([
      db.from("ht_products").select(PRODUCT_COLUMNS).order("sort_order", { ascending: true }).order("sku", { ascending: true }),
      db.from("ht_product_costs").select("sku,supplier_price,markup_percent,updated_at"),
      db.from("ht_product_favorites").select("sku"),
      db.from("ht_dealers").select("*").order("sort_order", { ascending: true }).order("name", { ascending: true }),
      db.from("ht_orders").select("*").order("date", { ascending: false }).order("id", { ascending: false }),
      db.from("feedback").select("*").order("created_at", { ascending: false }).limit(500),
    ]);
    const failed = [prodRes, costRes, favoritesRes, dealRes, ordRes, feedbackRes].find(result => result.error);
    if (failed) {
      sendJson(res, 502, { error: "The administrator data could not be loaded." });
      return;
    }
    const costs = new Map((costRes.data || []).map(row => [row.sku, row]));
    const favorites = (favoritesRes.data || []).reduce((counts, row) => {
      counts[row.sku] = (counts[row.sku] || 0) + 1;
      return counts;
    }, {});
    const products = (prodRes.data || []).map(row => ({
      ...row,
      favorite_count: favorites[row.sku] || 0,
      supplier_price: costs.get(row.sku)?.supplier_price ?? null,
      markup_percent: costs.get(row.sku)?.markup_percent ?? null,
    }));
    sendJson(res, 200, {
      products,
      dealers: dealRes.data || [],
      orders: ordRes.data || [],
      feedback: feedbackRes.data || [],
    });
  } catch {
    sendJson(res, 503, { error: "The administrator data service is unavailable." });
  }
}
