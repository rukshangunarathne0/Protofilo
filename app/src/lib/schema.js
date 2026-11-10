// Optional catalogue metadata probe kept for older installations.
// Customer prices and supplier costs are never read by the public client.
import { supabase } from "./supabase.js";

let pending = null;
export const OPTIONAL_PRODUCT_COLUMNS = ["brand", "description"];

export function detectProductColumns() {
  if (!pending) {
    pending = supabase
      .from("ht_products")
      .select(OPTIONAL_PRODUCT_COLUMNS.join(","))
      .limit(1)
      .then(({ error }) => !error)
      .catch(() => false);
  }
  return pending;
}

export function resetProductColumnProbe() {
  pending = null;
}
