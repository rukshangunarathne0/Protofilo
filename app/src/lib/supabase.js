import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://unbhwpcpprornqvvlfxo.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuYmh3cGNwcHJvcm5xdnZsZnhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3NjAwMzIsImV4cCI6MjEwOTMzNjAzMn0.vLODMQmtF_fFkIw85Rqij4peQ2_AEd0QJoAnL3Pwfhs";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
