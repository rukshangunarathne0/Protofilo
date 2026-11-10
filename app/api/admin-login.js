import { authenticateAdmin } from "../server/admin-auth.js";

export default function handler(req, res) {
  authenticateAdmin(req, res);
}
