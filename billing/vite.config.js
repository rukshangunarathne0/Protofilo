import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5174,
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 4174,
    allowedHosts: true,
  },
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        entryFileNames: "assets/app-v2.js",
        chunkFileNames: "assets/[name]-v2.js",
        assetFileNames: "assets/[name]-v2[extname]",
        // Keep third-party code in one chunk. Splitting React, jsPDF, and their
        // shared dependencies into separate manual chunks creates a circular
        // ESM graph (pdf -> vendor -> react -> vendor) that fails before the
        // billing UI can mount in a browser.
        manualChunks(id) {
          if (id.includes("node_modules")) return "vendor";
        },
      },
    },
  },
});
