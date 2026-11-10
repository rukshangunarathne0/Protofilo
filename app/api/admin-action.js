import { methodNotAllowed, readSession, requestIsSameOrigin, sendJson } from "../server/admin-auth.js";
import { calculateProductPrice, cleanColors, cleanMarkup, cleanNumber, cleanProduct, cleanText, getAdminDb } from "../server/admin-supabase.js";

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

const ORDER_STATUSES = new Set(["Submitted", "Confirmed", "Packing", "Ready", "Completed"]);

function costPatch(product = {}) {
  const pricing = calculateProductPrice(product.supplierPrice, product.markupPercent);
  return {
    pricing,
    cost: {
      sku: cleanText(product.sku, 24).toUpperCase(),
      supplier_price: pricing.watchPrice,
      markup_percent: cleanMarkup(product.markupPercent),
      updated_at: new Date().toISOString(),
    },
  };
}

async function saveProductWithCost(db, product) {
  const { pricing, cost } = costPatch(product);
  const publicProduct = {
    ...cleanProduct({
      ...product,
      price: pricing.finalPrice,
      stock: 0,
      reserved: 0,
      availability: product.availability || "Available to order",
    }),
    price: pricing.finalPrice,
    availability: cleanText(product.availability, 100) || "Available to order",
  };
  if (!publicProduct.sku || !publicProduct.name || !publicProduct.category) {
    throw new Error("SKU, product name, and category are required.");
  }
  const insert = await db.from("ht_products").insert(publicProduct);
  if (insert.error) return insert;
  const costResult = await db.from("ht_product_costs").upsert(cost);
  if (costResult.error) {
    await db.from("ht_products").delete().eq("sku", publicProduct.sku);
  }
  return costResult;
}

async function cleanOrder(db, input = {}) {
  const rawLines = Array.isArray(input.lines) ? input.lines.slice(0, 50) : [];
  if (!rawLines.length) throw new Error("An order needs at least one product line.");
  const requested = new Map();
  for (const line of rawLines) {
    const sku = cleanText(line?.sku, 24).toUpperCase();
    const quantity = Math.trunc(cleanNumber(line?.qty, 0));
    if (!sku || quantity < 1 || quantity > 999) throw new Error("Each order line needs a valid SKU and quantity.");
    requested.set(sku, (requested.get(sku) || 0) + quantity);
  }
  const productResult = await db.from("ht_products").select("sku,name,price").in("sku", [...requested.keys()]);
  if (productResult.error) throw new Error("The order products could not be verified.");
  const products = new Map((productResult.data || []).map(product => [product.sku, product]));
  if (products.size !== requested.size) throw new Error("One or more order products are no longer available.");
  const lines = [...requested.entries()].map(([sku, quantity]) => {
    const product = products.get(sku);
    const price = Number(product.price);
    if (!Number.isFinite(price) || price < 0) throw new Error("One or more order prices are invalid.");
    return { sku, name: cleanText(product.name, 160), qty: quantity, price, reservedQty: 0 };
  });
  const order = {
    id: cleanText(input.id, 80),
    dealer: cleanText(input.dealer, 160),
    city: cleanText(input.city, 120) || "Colombo",
    date: new Date().toISOString().slice(0, 10),
    amount: lines.reduce((total, line) => total + line.qty * line.price, 0),
    units: lines.reduce((total, line) => total + line.qty, 0),
    status: "Submitted",
    channel: cleanText(input.channel, 80) || "Wholesale",
    delivery: cleanText(input.delivery, 120) || null,
    reference: cleanText(input.reference, 160) || null,
    lines,
  };
  if (!order.id || !order.dealer) throw new Error("Order id and dealer are required.");
  return order;
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
      case "placeOrder": {
        const order = await cleanOrder(db, payload.order || {});
        result = await db.rpc("ht_place_order", { p_order: order });
        break;
      }
      case "setOrderStatus": {
        const nextStatus = cleanText(payload.status, 40);
        if (!ORDER_STATUSES.has(nextStatus)) {
          sendJson(res, 400, { error: "Choose a valid order status." });
          return;
        }
        result = await db.rpc("ht_set_order_status", { p_id: cleanText(payload.id, 80), p_status: nextStatus });
        break;
      }
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
        result = await saveProductWithCost(db, payload.product || {});
        break;
      case "updateProduct": {
        const sku = cleanText(payload.sku, 24).toUpperCase();
        const patch = payload.patch && typeof payload.patch === "object" ? payload.patch : {};
        const allowed = ["name", "category", "image", "brand", "description", "colors", "trend", "gender", "product_type", "productType", "is_new", "isNew", "availability", "sort_order", "sortOrder"];
        const safePatch = Object.fromEntries(Object.entries(patch).filter(([key]) => allowed.includes(key)));
        if ("productType" in safePatch) {
          safePatch.product_type = cleanText(safePatch.productType, 40) || "Watches";
          delete safePatch.productType;
        }
        if ("isNew" in safePatch) {
          safePatch.is_new = !!safePatch.isNew;
          delete safePatch.isNew;
        }
        if ("is_new" in safePatch) safePatch.is_new = !!safePatch.is_new;
        if ("sortOrder" in safePatch) {
          safePatch.sort_order = Math.max(0, Math.trunc(cleanNumber(safePatch.sortOrder)));
          delete safePatch.sortOrder;
        }
        if ("sort_order" in safePatch) safePatch.sort_order = Math.max(0, Math.trunc(cleanNumber(safePatch.sort_order)));
        if ("trend" in safePatch) {
          safePatch.trend = Array.isArray(safePatch.trend) ? safePatch.trend.slice(0, 30).map(value => cleanNumber(value)) : [];
        }
        if ("colors" in safePatch) safePatch.colors = cleanColors(safePatch.colors);
        for (const key of ["name", "category", "image", "brand", "description", "gender", "product_type", "availability"]) {
          if (key in safePatch) {
            const max = key === "description" ? 1000 : key === "image" ? 200000 : 200;
            safePatch[key] = cleanText(safePatch[key], max) || (key === "brand" || key === "description" ? null : safePatch[key]);
          }
        }
        let finalPricePatch = {};
        if (patch.supplierPrice !== undefined && patch.supplierPrice !== "") {
          const { pricing, cost } = costPatch({ sku, supplierPrice: patch.supplierPrice, markupPercent: patch.markupPercent });
          finalPricePatch = { price: pricing.finalPrice };
          const costResult = await db.from("ht_product_costs").upsert(cost);
          if (costResult.error) {
            result = costResult;
            break;
          }
        } else if (patch.markupPercent !== undefined && patch.markupPercent !== null && patch.markupPercent !== "") {
          const existingCost = await db.from("ht_product_costs").select("supplier_price").eq("sku", sku).maybeSingle();
          if (existingCost.error || !existingCost.data) {
            result = { error: new Error("Add a supplier watch price before using a markup override.") };
            break;
          }
          const { pricing, cost } = costPatch({ sku, supplierPrice: existingCost.data.supplier_price, markupPercent: patch.markupPercent });
          finalPricePatch = { price: pricing.finalPrice };
          const costResult = await db.from("ht_product_costs").upsert(cost);
          if (costResult.error) {
            result = costResult;
            break;
          }
        }
        result = await db.from("ht_products").update({ ...safePatch, ...finalPricePatch, updated_at: new Date().toISOString() }).eq("sku", sku);
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
      sendJson(res, 400, { error: result.error.message || "The administrator action could not be completed." });
      return;
    }
    sendJson(res, 200, { ok: true });
  } catch (error) {
    sendJson(res, 400, { error: error?.message || "The administrator action could not be completed." });
  }
}
