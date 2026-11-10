import { methodNotAllowed, readSession, sendJson } from "../server/admin-auth.js";

export default function handler(req, res) {
  if (req.method !== "GET") {
    methodNotAllowed(req, res, "GET");
    return;
  }
  sendJson(res, 200, { authenticated: !!readSession(req) });
}
