import { methodNotAllowed, readSession, requestIsSameOrigin, sendJson } from "../server/admin-auth.js";
import { cleanNumber, cleanProduct, cleanText, getAdminDb } from "../server/admin-supabase.js";

function parseBody(body) {
  if (typeof body !== "string") return body || {};
  try { return JSON.parse(body); } catch { return {}; }
}

function profilePatch(profile = {}) {
  return {
    email: "admin@rsd.com",
    name: cleanText(profile.name, 120) || "Admin",
    role: cleanText(profile.role, 80) || "Administrator",
    phone: cleanText(profile.phone, 40),
    warehouse: cleanText(profile.warehouse, 120),
    prefs: profile.prefs && typeof profile.prefs === "object" ? profile.prefs : {},
    updated_at: new Date().toISOString(),
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    methodNotAllowed(req, res);
    return;
  }
  if (!requestIsSameOrigin(req) || !readSession(req)) {
    sendJson(res, 401, { error: "Administrator session required." });
    return;
  }
  const body = parseBody(req.body);
  const action = cleanText(body.action, 40);
  const payload = body.payload && typeof body.payload === "object" ? body.payload : {};
  try {
    const db = getAdminDb();
    let result;
    switch (action) {
      case "placeOrder":
        result = await db.rpc("ht_place_order", { p_order: payload.order || {} });
        break;
      case "setOrderStatus":
        result = await db.rpc("ht_set_order_status", { p_id: cleanText(payload.id, 80), p_status: cleanText(payload.status, 40) });
        break;
      case "setDealer": {
        const patch = payload.patch && typeof payload.patch === "object" ? payload.patch : {};
        const dealerPatch = Object.fromEntries(Object.entries(patch).filter(([key]) => ["email", "city", "since", "status", "terms", "sort_order"].includes(key)));
        for (const key of ["email", "city", "since", "status", "terms"]) {
          if (key in dealerPatch) dealerPatch[key] = cleanText(dealerPatch[key], 160);
        }
        result = await db.from("ht_dealers").update({ ...dealerPatch, updated_at: new Date().toISOString() }).eq("name", cleanText(payload.name, 160));
        break;
      }
      case "adjustStock":
        result = await db.rpc("ht_adjust_stock", { p_sku: cleanText(payload.sku, 24).toUpperCase(), p_delta: Math.trunc(cleanNumber(payload.delta)) });
        break;
      case "addProduct":
        result = await db.from("ht_products").insert(cleanProduct(payload.product));
        break;
      case "updateProduct": {
        const patch = { ...payload.patch };
        if ("retailPrice" in patch) {
          patch.retail_price = Math.max(0, cleanNumber(patch.retailPrice));
          delete patch.retailPrice;
        }
        const allowed = ["name", "category", "price", "stock", "reserved", "image", "brand", "description", "retail_price", "trend"];
        const safePatch = Object.fromEntries(Object.entries(patch).filter(([key]) => allowed.includes(key)));
        if ("name" in safePatch) safePatch.name = cleanText(safePatch.name, 160);
        if ("category" in safePatch) safePatch.category = cleanText(safePatch.category, 80);
        if ("image" in safePatch) safePatch.image = cleanText(safePatch.image, 200000);
        if ("brand" in safePatch) safePatch.brand = cleanText(safePatch.brand, 120) || null;
        if ("description" in safePatch) safePatch.description = cleanText(safePatch.description, 1000) || null;
        result = await db.from("ht_products").update({ ...safePatch, updated_at: new Date().toISOString() }).eq("sku", cleanText(payload.sku, 24).toUpperCase());
        break;
      }
      case "sendFeedback": {
        const contact = cleanText(payload.contact, 160);
        result = await db.from("feedback").insert({
          name: cleanText(payload.name, 80),
          email: contact.includes("@") ? contact : null,
          phone: contact && !contact.includes("@") ? contact : null,
          rating: Number(payload.rating) >= 1 && Number(payload.rating) <= 5 ? Math.round(Number(payload.rating)) : null,
          message: cleanText(payload.message, 2000),
          status: "new",
          is_dealer: !!payload.isDealer,
          role_label: cleanText(payload.roleLabel, 80) || "Visitor",
        });
        break;
      }
      case "setFeedbackStatus":
        result = await db.from("feedback").update({ status: payload.status === "read" ? "read" : "new" }).eq("id", payload.id);
        break;
      case "deleteFeedback":
        result = await db.from("feedback").delete().eq("id", payload.id);
        break;
      case "reset":
        result = await db.rpc("ht_reset_ledger");
        break;
      case "getProfile":
        result = await db.from("ht_admin_profile").select("*").eq("email", "admin@rsd.com").maybeSingle();
        if (!result.error) {
          sendJson(res, 200, { ok: true, profile: result.data || null });
          return;
        }
        break;
      case "saveProfile":
        result = await db.from("ht_admin_profile").upsert(profilePatch(payload.profile));
        break;
      default:
        sendJson(res, 400, { error: "Unknown administrator action." });
        return;
    }
    if (result?.error) {
      sendJson(res, 400, { error: "The administrator action could not be completed." });
      return;
    }
    sendJson(res, 200, { ok: true });
  } catch {
    sendJson(res, 503, { error: "The administrator action service is unavailable." });
  }
}
