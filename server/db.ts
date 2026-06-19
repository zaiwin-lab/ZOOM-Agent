import { eq, desc, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  users, meetings, transcripts, actionItems, subscriptions,
  type InsertUser, type InsertMeeting, type InsertTranscript,
  type InsertActionItem, type InsertSubscription,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: DB not available"); return; }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const fields = ["name", "email", "loginMethod"] as const;
  for (const f of fields) {
    const v = user[f];
    if (v !== undefined) { values[f] = v ?? null; updateSet[f] = v ?? null; }
  }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function updateUserProfile(userId: number, data: { displayName?: string; avatarUrl?: string }) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, userId));
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

// ─── Meetings ─────────────────────────────────────────────────────────────────

export async function createMeeting(data: InsertMeeting) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(meetings).values(data);
  return result[0];
}

export async function getMeetingsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(meetings).where(eq(meetings.userId, userId)).orderBy(desc(meetings.createdAt));
}

export async function getMeetingById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(meetings).where(eq(meetings.id, id)).limit(1);
  return result[0];
}

export async function updateMeeting(id: number, data: Partial<InsertMeeting>) {
  const db = await getDb();
  if (!db) return;
  await db.update(meetings).set(data).where(eq(meetings.id, id));
}

export async function getMeetingByBaasJobId(baasJobId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(meetings).where(eq(meetings.baasJobId, baasJobId)).limit(1);
  return result[0];
}

export async function getAllMeetings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(meetings).orderBy(desc(meetings.createdAt));
}

// ─── Transcripts ──────────────────────────────────────────────────────────────

export async function createTranscripts(items: InsertTranscript[]) {
  const db = await getDb();
  if (!db) return;
  if (items.length === 0) return;
  await db.insert(transcripts).values(items);
}

export async function getTranscriptsByMeeting(meetingId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(transcripts)
    .where(eq(transcripts.meetingId, meetingId))
    .orderBy(transcripts.timestampMs);
}

export async function searchTranscripts(meetingId: number, query: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(transcripts)
    .where(
      eq(transcripts.meetingId, meetingId)
    )
    .orderBy(transcripts.timestampMs);
}

// ─── Action Items ─────────────────────────────────────────────────────────────

export async function createActionItems(items: InsertActionItem[]) {
  const db = await getDb();
  if (!db) return;
  if (items.length === 0) return;
  await db.insert(actionItems).values(items);
}

export async function getActionItemsByMeeting(meetingId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(actionItems).where(eq(actionItems.meetingId, meetingId));
}

export async function getActionItemById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(actionItems).where(eq(actionItems.id, id)).limit(1);
  return result[0];
}

export async function toggleActionItem(id: number, isCompleted: boolean) {
  const db = await getDb();
  if (!db) return;
  await db.update(actionItems).set({ isCompleted }).where(eq(actionItems.id, id));
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export async function getSubscriptionByUser(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return result[0];
}

export async function upsertSubscription(data: InsertSubscription) {
  const db = await getDb();
  if (!db) return;
  await db.insert(subscriptions).values(data).onDuplicateKeyUpdate({
    set: { plan: data.plan, status: data.status, promoCode: data.promoCode, endDate: data.endDate, meetingCredits: data.meetingCredits },
  });
}

export async function getAllSubscriptions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt));
}
