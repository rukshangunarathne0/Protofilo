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
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("jspdf") || id.includes("@babel/runtime") || id.includes("/fflate/") || id.includes("/fast-png/")) return "pdf";
          if (id.includes("react-dom") || id.includes("/react/")) return "react";
          return "vendor";
        },
      },
    },
  },
});
