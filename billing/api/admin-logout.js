import { forwardJson } from "../server/main-api.js";

export default function handler(req, res) {
  forwardJson(req, res, "/api/admin-logout", "POST");
}
