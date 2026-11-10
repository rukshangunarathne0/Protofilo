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
  const contact = cleanText(body.contact, 160);
  const name = cleanText(body.name, 80);
  const message = cleanText(body.message, 2000);
  if (!name || message.length < 3) {
    sendJson(res, 400, { error: "Name and a short message are required." });
    return;
  }
  try {
    const db = getAdminDb();
    const result = await db.from("feedback").insert({
      name,
      email: contact.includes("@") ? contact : null,
      phone: contact && !contact.includes("@") ? contact : null,
      rating: Number(body.rating) >= 1 && Number(body.rating) <= 5 ? Math.round(Number(body.rating)) : null,
      message,
      status: "new",
      is_dealer: !!body.isDealer,
      role_label: cleanText(body.roleLabel, 80) || "Visitor",
    });
    if (result.error) {
      sendJson(res, 400, { error: "Your feedback could not be saved." });
      return;
    }
    sendJson(res, 200, { ok: true });
  } catch {
    sendJson(res, 503, { error: "The feedback service is unavailable." });
  }
}
