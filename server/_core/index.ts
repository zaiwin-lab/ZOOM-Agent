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
import { serveStatic } from "./static";
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

// Refuse to start an insecure production server: a weak/empty JWT_SECRET would
// let anyone forge session tokens.
function assertSecureConfig() {
  if (ENV.isProduction && (!ENV.cookieSecret || ENV.cookieSecret.length < 16)) {
    console.error(
      "[boot] FATAL: JWT_SECRET must be set to a strong value (>= 16 chars) in production. Refusing to start.",
    );
    process.exit(1);
  }
}

function securityHeaders(): express.RequestHandler {
  return (_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-DNS-Prefetch-Control", "off");
    if (ENV.isProduction) {
      res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
    }
    next();
  };
}

// Lightweight in-memory fixed-window rate limiter (no external dependency).
function rateLimit(maxPerWindow: number, windowMs: number): express.RequestHandler {
  const buckets = new Map<string, { count: number; reset: number }>();
  return (req, res, next) => {
    const ip = (req.ip || req.socket.remoteAddress || "unknown").toString();
    const now = Date.now();
    if (buckets.size > 20000) buckets.clear(); // guard against unbounded growth
    let b = buckets.get(ip);
    if (!b || now > b.reset) { b = { count: 0, reset: now + windowMs }; buckets.set(ip, b); }
    b.count++;
    if (b.count > maxPerWindow) {
      res.setHeader("Retry-After", Math.ceil((b.reset - now) / 1000).toString());
      return res.status(429).json({ error: "Too many requests" });
    }
    next();
  };
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
  assertSecureConfig();
  await ensureSchema();
  const app = express();
  app.set("trust proxy", 1); // behind Railway's proxy — needed for correct req.ip / secure
  const server = createServer(app);
  app.use(securityHeaders());
  // Body limits: enough for a 2MB avatar (base64) and webhook payloads, not 50MB.
  app.use(express.json({ limit: "6mb" }));
  app.use(express.urlencoded({ limit: "6mb", extended: true }));
  // Basic rate limiting on the API surface (per IP).
  app.use("/api", rateLimit(300, 60_000));
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
    const { setupVite } = await import("./vite");
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
