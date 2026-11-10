import { methodNotAllowed, readSession, requestIsSameOrigin, sendJson } from "../server/admin-auth.js";
import { getAdminDb } from "../server/admin-supabase.js";

const PRODUCT_COLUMNS = "sku,name,category,price,image,description,colors,gender,product_type,is_new,availability";

function publicProduct(row = {}) {
  return {
    sku: row.sku,
    name: row.name,
    category: row.category,
    price: row.price,
    image: row.image,
    description: row.description,
    colors: Array.isArray(row.colors) ? row.colors : [],
    gender: row.gender,
    product_type: row.product_type,
    is_new: !!row.is_new,
    availability: row.availability,
  };
}

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
    const [productsResult, ordersResult] = await Promise.all([
      db.from("ht_products").select(PRODUCT_COLUMNS).order("sort_order", { ascending: true }).order("sku", { ascending: true }),
      db.from("ht_orders").select("*").order("date", { ascending: false }).order("id", { ascending: false }),
    ]);
    if (productsResult.error || ordersResult.error) {
      sendJson(res, 502, { error: "Billing data could not be loaded." });
      return;
    }
    // Keep this endpoint deliberately smaller than the full admin data feed:
    // billing needs customer-facing prices, never supplier costs or markup inputs.
    sendJson(res, 200, {
      products: (productsResult.data || []).map(publicProduct),
      orders: ordersResult.data || [],
    });
  } catch {
    sendJson(res, 503, { error: "The billing data service is unavailable." });
  }
}
