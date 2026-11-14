import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { hashPassword } from "../server/admin-auth.js";

const rl = createInterface({ input, output });
try {
  const password = await rl.question("Admin password (not saved): ");
  if (!password || password.length > 512) throw new Error("Password must be 1–512 characters.");
  console.log(`RSD_ADMIN_PASSWORD_HASH=${hashPassword(password)}`);
} finally {
  rl.close();
}
