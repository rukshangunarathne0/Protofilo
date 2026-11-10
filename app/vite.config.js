import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    allowedHosts: true,
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    // Raise slightly above the 500 kB default: the app shell is intentionally
    // one chunk until the admin/de dealer screens are extracted.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split the three heavy vendors so the browser can download them in
        // parallel and keep them cached between deploys.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("react-dom") || id.includes("/react/")) return "react";
          if (id.includes("framer-motion") || id.includes("motion-dom") || id.includes("motion-utils")) {
            return "motion";
          }
          if (id.includes("@supabase") || id.includes("postgrest") || id.includes("gotrue")) {
            return "supabase";
          }
          if (id.includes("tailwind-merge") || id.includes("clsx")) return "ui-utils";
          if (id.includes("jspdf") || id.includes("@babel/runtime") || id.includes("/fflate/") || id.includes("/fast-png/")) return "pdf";
          return "vendor";
        },
      },
    },
  },
});
