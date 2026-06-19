import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerWebhookRoutes } from "../webhook";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { ensureSchema } from "./migrate";
import { ENV } from "./env";

function logBootDiagnostics() {
  const warn: string[] = [];
  if (!ENV.databaseUrl) warn.push("DATABASE_URL is missing — data will not persist.");
  if (!ENV.cookieSecret) warn.push("JWT_SECRET is missing — logins will be insecure/broken. Set a strong secret.");
  if (!ENV.anthropicApiKey && !ENV.forgeApiKey) warn.push("No AI key (ANTHROPIC_API_KEY) — 'Generate AI Notes' will fail.");
  if (warn.length) {
    console.warn("\n[boot] Configuration warnings:");
    for (const w of warn) console.warn("  ⚠ " + w);
    console.warn("");
  } else {
    console.log("[boot] All core configuration present.");
  }
}

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  logBootDiagnostics();
  await ensureSchema();
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  registerWebhookRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // In production (Railway/host), bind the platform-provided PORT directly on
  // 0.0.0.0 — the host routes only to that port. The free-port scan is dev-only.
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = ENV.isProduction ? preferredPort : await findAvailablePort(preferredPort);

  if (!ENV.isProduction && port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port} (NODE_ENV=${process.env.NODE_ENV})`);
  });
}

startServer().catch(console.error);
