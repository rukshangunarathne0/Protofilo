import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { readSession, requestIsSameOrigin } from "./server/admin-auth.js";
import { calculateCustomerPrice } from "./server/pricing.js";

function localPriceCalculatorApi() {
  const handler = (req, res, next) => {
    if (req.method !== "POST") {
      res.statusCode = 405;
      res.setHeader("Allow", "POST");
      res.end(JSON.stringify({ error: "Method not allowed." }));
      return;
    }
    if (!requestIsSameOrigin(req) || !readSession(req)) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ error: "Administrator authentication required." }));
      return;
    }
    const chunks = [];
    let size = 0;
    req.on("data", chunk => {
      size += chunk.length;
      if (size <= 4096) chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
        const watchPrice = Number(body.watchPrice ?? body.cost);
        if (!Number.isFinite(watchPrice) || watchPrice < 0 || watchPrice > 100000000) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: "Enter a valid watch price in LKR." }));
          return;
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({ ok: true, finalPrice: calculateCustomerPrice(watchPrice).finalPrice }));
      } catch {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "That price could not be calculated." }));
      }
    });
  };
  return {
    name: "local-price-calculator-api",
    configureServer(server) {
      server.middlewares.use("/api/calculate-price", handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/api/calculate-price", handler);
    },
  };
}

export default defineConfig({
  plugins: [localPriceCalculatorApi(), react(), tailwindcss()],
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
          return "vendor";
        },
      },
    },
  },
});
