import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Serve the built client (dist/public) in production. Kept free of any Vite /
 * dev-dependency imports so the production server never loads them.
 *
 * Derives its own directory from import.meta.url (works on Node 18+) instead of
 * import.meta.dirname (Node 20.11+ only), so it never receives `undefined`.
 */
export function serveStatic(app: Express) {
  const here = path.dirname(fileURLToPath(import.meta.url));
  // In the bundled prod server (dist/index.js), `here` is `dist`, so assets are dist/public.
  const distPath = path.resolve(here, "public");

  if (!fs.existsSync(distPath)) {
    console.error(`[static] Build directory not found: ${distPath}`);
  }

  app.use(express.static(distPath));

  // SPA fallback: any non-file route returns index.html.
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
