import { clearSessionCookie, methodNotAllowed, sendJson } from "../server/admin-auth.js";

export default function handler(req, res) {
  if (req.method !== "POST") {
    methodNotAllowed(req, res);
    return;
  }
  clearSessionCookie(res);
  sendJson(res, 200, { ok: true });
}
