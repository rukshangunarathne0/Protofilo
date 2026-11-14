import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://olyqqpoddwfpimpieixr.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9seXFxcG9kZHdmcGltcGllaXhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQyODQ2NTMsImV4cCI6MjEwOTg2MDY1M30.Bvl0zctuJvxid8hlLGJG7yksyP6F2NKxhpIWiyU1QP4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
