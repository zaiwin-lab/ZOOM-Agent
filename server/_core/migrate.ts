import { ENV } from "./env";

/**
 * Idempotent schema bootstrap. Runs on server start so a fresh database
 * (e.g. a new Railway MySQL) is provisioned automatically — no manual
 * `drizzle-kit` / shell step required. Safe to run on every boot.
 */
const DDL = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT NOT NULL,
  openId VARCHAR(64) NOT NULL,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user','admin') NOT NULL DEFAULT 'user',
  displayName VARCHAR(128),
  avatarUrl TEXT,
  subscriptionPlan ENUM('free','monthly','annual','pay_per_use') NOT NULL DEFAULT 'free',
  subscriptionStatus ENUM('active','inactive','trial','cancelled') NOT NULL DEFAULT 'trial',
  freeTrialUsed BOOLEAN NOT NULL DEFAULT false,
  promoCodeUsed VARCHAR(64),
  createdAt TIMESTAMP NOT NULL DEFAULT (now()),
  updatedAt TIMESTAMP NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP NOT NULL DEFAULT (now()),
  CONSTRAINT users_id PRIMARY KEY (id),
  CONSTRAINT users_openId_unique UNIQUE (openId)
);
CREATE TABLE IF NOT EXISTS meetings (
  id INT AUTO_INCREMENT NOT NULL,
  userId INT NOT NULL,
  meetingUrl TEXT NOT NULL,
  platform ENUM('zoom','google_meet','other') NOT NULL DEFAULT 'other',
  botName VARCHAR(128),
  botAvatarUrl TEXT,
  status ENUM('pending','joining','in_progress','processing','completed','failed') NOT NULL DEFAULT 'pending',
  baasJobId VARCHAR(256),
  title VARCHAR(256),
  summary TEXT,
  highlights TEXT,
  durationSeconds INT,
  startedAt TIMESTAMP NULL,
  endedAt TIMESTAMP NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT (now()),
  updatedAt TIMESTAMP NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT meetings_id PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS transcripts (
  id INT AUTO_INCREMENT NOT NULL,
  meetingId INT NOT NULL,
  speakerName VARCHAR(128),
  content TEXT NOT NULL,
  timestampMs INT,
  createdAt TIMESTAMP NOT NULL DEFAULT (now()),
  CONSTRAINT transcripts_id PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS action_items (
  id INT AUTO_INCREMENT NOT NULL,
  meetingId INT NOT NULL,
  content TEXT NOT NULL,
  isCompleted BOOLEAN NOT NULL DEFAULT false,
  createdAt TIMESTAMP NOT NULL DEFAULT (now()),
  updatedAt TIMESTAMP NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT action_items_id PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS subscriptions (
  id INT AUTO_INCREMENT NOT NULL,
  userId INT NOT NULL,
  plan ENUM('free','monthly','annual','pay_per_use') NOT NULL DEFAULT 'free',
  status ENUM('active','inactive','trial','cancelled') NOT NULL DEFAULT 'trial',
  promoCode VARCHAR(64),
  startDate TIMESTAMP NOT NULL DEFAULT (now()),
  endDate TIMESTAMP NULL,
  meetingCredits INT NOT NULL DEFAULT 0,
  createdAt TIMESTAMP NOT NULL DEFAULT (now()),
  updatedAt TIMESTAMP NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT subscriptions_id PRIMARY KEY (id),
  CONSTRAINT subscriptions_userId_unique UNIQUE (userId)
);
`;

export async function ensureSchema(): Promise<void> {
  if (!ENV.databaseUrl) {
    console.warn("[migrate] DATABASE_URL not set — skipping schema bootstrap.");
    return;
  }
  try {
    const mysql = await import("mysql2/promise");
    const conn = await mysql.createConnection({ uri: ENV.databaseUrl, multipleStatements: true });
    await conn.query(DDL);
    await conn.end();
    console.log("[migrate] Schema ensured (tables created if missing).");
  } catch (err) {
    console.error("[migrate] Schema bootstrap failed:", err);
  }
}
