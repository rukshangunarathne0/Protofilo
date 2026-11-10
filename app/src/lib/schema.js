// Runtime probe for optional product columns.
//
// The console can grow fields (brand, description, retail price) without
// breaking on a database that has not been migrated yet: we ask PostgREST for
// the columns once per session and show the fields only when they exist.
import { supabase } from "./supabase.js";

let pending = null;

export const OPTIONAL_PRODUCT_COLUMNS = ["brand", "description", "retail_price"];

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

/** Forget a cached "no" so the fields appear after the SQL has been run. */
export function resetProductColumnProbe() {
  pending = null;
}
