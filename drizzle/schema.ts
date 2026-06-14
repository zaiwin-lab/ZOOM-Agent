import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  displayName: varchar("displayName", { length: 128 }),
  avatarUrl: text("avatarUrl"),
  subscriptionPlan: mysqlEnum("subscriptionPlan", ["free", "monthly", "annual", "pay_per_use"]).default("free").notNull(),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["active", "inactive", "trial", "cancelled"]).default("trial").notNull(),
  freeTrialUsed: boolean("freeTrialUsed").default(false).notNull(),
  promoCodeUsed: varchar("promoCodeUsed", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const meetings = mysqlTable("meetings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  meetingUrl: text("meetingUrl").notNull(),
  platform: mysqlEnum("platform", ["zoom", "google_meet", "other"]).default("other").notNull(),
  botName: varchar("botName", { length: 128 }),
  botAvatarUrl: text("botAvatarUrl"),
  status: mysqlEnum("status", ["pending", "joining", "in_progress", "processing", "completed", "failed"]).default("pending").notNull(),
  baasJobId: varchar("baasJobId", { length: 256 }),
  title: varchar("title", { length: 256 }),
  summary: text("summary"),
  highlights: text("highlights"),
  durationSeconds: int("durationSeconds"),
  startedAt: timestamp("startedAt"),
  endedAt: timestamp("endedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = typeof meetings.$inferInsert;

export const transcripts = mysqlTable("transcripts", {
  id: int("id").autoincrement().primaryKey(),
  meetingId: int("meetingId").notNull(),
  speakerName: varchar("speakerName", { length: 128 }),
  content: text("content").notNull(),
  timestampMs: int("timestampMs"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Transcript = typeof transcripts.$inferSelect;
export type InsertTranscript = typeof transcripts.$inferInsert;

export const actionItems = mysqlTable("action_items", {
  id: int("id").autoincrement().primaryKey(),
  meetingId: int("meetingId").notNull(),
  content: text("content").notNull(),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ActionItem = typeof actionItems.$inferSelect;
export type InsertActionItem = typeof actionItems.$inferInsert;

export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  plan: mysqlEnum("plan", ["free", "monthly", "annual", "pay_per_use"]).default("free").notNull(),
  status: mysqlEnum("status", ["active", "inactive", "trial", "cancelled"]).default("trial").notNull(),
  promoCode: varchar("promoCode", { length: 64 }),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate"),
  meetingCredits: int("meetingCredits").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;
