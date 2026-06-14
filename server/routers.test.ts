import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock db module
vi.mock("./db", () => ({
  getUserByOpenId: vi.fn().mockResolvedValue({
    id: 1, openId: "test-user", name: "Test User", email: "test@test.com",
    loginMethod: "email", role: "user", displayName: null, avatarUrl: null,
    subscriptionPlan: "free", subscriptionStatus: "trial", freeTrialUsed: false,
    promoCodeUsed: null, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
  }),
  updateUserProfile: vi.fn().mockResolvedValue(undefined),
  getMeetingsByUser: vi.fn().mockResolvedValue([]),
  getMeetingById: vi.fn().mockResolvedValue(null),
  createMeeting: vi.fn().mockResolvedValue({ insertId: 42 }),
  updateMeeting: vi.fn().mockResolvedValue(undefined),
  getTranscriptsByMeeting: vi.fn().mockResolvedValue([]),
  getActionItemsByMeeting: vi.fn().mockResolvedValue([]),
  toggleActionItem: vi.fn().mockResolvedValue(undefined),
  getSubscriptionByUser: vi.fn().mockResolvedValue(undefined),
  upsertSubscription: vi.fn().mockResolvedValue(undefined),
  getAllUsers: vi.fn().mockResolvedValue([]),
  getAllMeetings: vi.fn().mockResolvedValue([]),
  getAllSubscriptions: vi.fn().mockResolvedValue([]),
  getDb: vi.fn().mockResolvedValue(null),
  upsertUser: vi.fn().mockResolvedValue(undefined),
}));

// Mock storage
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ key: "test-key", url: "/manus-storage/test-key" }),
}));

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: JSON.stringify({ summary: "Test summary", highlights: ["h1"] }) } }],
  }),
}));

function makeCtx(overrides: Partial<TrpcContext> = {}): TrpcContext {
  const clearedCookies: unknown[] = [];
  return {
    user: {
      id: 1, openId: "test-user", name: "Test User", email: "test@test.com",
      loginMethod: "email", role: "user",
      createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: (_name: string, _opts: unknown) => clearedCookies.push({ _name, _opts }),
    } as TrpcContext["res"],
    ...overrides,
  };
}

function makeAdminCtx(): TrpcContext {
  return makeCtx({ user: { ...makeCtx().user!, role: "admin" } });
}

describe("auth router", () => {
  it("auth.me returns null when unauthenticated", async () => {
    const caller = appRouter.createCaller(makeCtx({ user: null }));
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("auth.me returns user when authenticated", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.openId).toBe("test-user");
  });

  it("auth.logout clears cookie and returns success", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});

describe("profile router", () => {
  it("profile.get returns user profile", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.profile.get();
    expect(result).toBeDefined();
    expect(result.openId).toBe("test-user");
  });

  it("profile.update succeeds with valid data", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.profile.update({ displayName: "New Name" });
    expect(result.success).toBe(true);
  });

  it("profile.update rejects unauthenticated users", async () => {
    const caller = appRouter.createCaller(makeCtx({ user: null }));
    await expect(caller.profile.update({ displayName: "x" })).rejects.toThrow();
  });
});

describe("meetings router", () => {
  it("meetings.list returns empty array for new user", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.meetings.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("meetings.create creates a meeting record", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.meetings.create({
      meetingUrl: "https://zoom.us/j/123456789",
      botName: "Test Bot",
    });
    expect(result.success).toBe(true);
    expect(result.meetingId).toBe(42);
  });

  it("meetings.create detects Zoom platform", async () => {
    const { createMeeting } = await import("./db");
    const caller = appRouter.createCaller(makeCtx());
    await caller.meetings.create({ meetingUrl: "https://zoom.us/j/123" });
    expect(createMeeting).toHaveBeenCalledWith(
      expect.objectContaining({ platform: "zoom" })
    );
  });

  it("meetings.create detects Google Meet platform", async () => {
    const { createMeeting } = await import("./db");
    const caller = appRouter.createCaller(makeCtx());
    await caller.meetings.create({ meetingUrl: "https://meet.google.com/abc-def" });
    expect(createMeeting).toHaveBeenCalledWith(
      expect.objectContaining({ platform: "google_meet" })
    );
  });

  it("meetings.get throws NOT_FOUND for missing meeting", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.meetings.get({ id: 999 })).rejects.toThrow("NOT_FOUND");
  });

  it("meetings.list rejects unauthenticated users", async () => {
    const caller = appRouter.createCaller(makeCtx({ user: null }));
    await expect(caller.meetings.list()).rejects.toThrow();
  });
});

describe("transcripts router", () => {
  it("transcripts.list throws NOT_FOUND for missing meeting", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.transcripts.list({ meetingId: 999 })).rejects.toThrow("NOT_FOUND");
  });

  it("transcripts.search throws NOT_FOUND for missing meeting", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.transcripts.search({ meetingId: 999, query: "test" })).rejects.toThrow("NOT_FOUND");
  });
});

describe("subscription router", () => {
  it("subscription.get returns undefined for new user", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.subscription.get();
    expect(result).toBeUndefined();
  });

  it("subscription.activate with promo code 'blabla' succeeds", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.subscription.activate({ plan: "monthly", promoCode: "blabla" });
    expect(result.success).toBe(true);
  });

  it("subscription.activate monthly plan succeeds", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.subscription.activate({ plan: "monthly" });
    expect(result.success).toBe(true);
  });

  it("subscription.activate annual plan succeeds", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.subscription.activate({ plan: "annual" });
    expect(result.success).toBe(true);
  });

  it("subscription.activate pay_per_use plan succeeds", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.subscription.activate({ plan: "pay_per_use" });
    expect(result.success).toBe(true);
  });

  it("subscription.cancel succeeds", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.subscription.cancel();
    expect(result.success).toBe(true);
  });
});

describe("admin router", () => {
  it("admin.stats is accessible by admin", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.admin.stats();
    expect(result).toHaveProperty("totalUsers");
    expect(result).toHaveProperty("totalMeetings");
    expect(result).toHaveProperty("activeSubscriptions");
  });

  it("admin.stats throws FORBIDDEN for non-admin", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.admin.stats()).rejects.toThrow();
  });

  it("admin.promoteUser throws INTERNAL_SERVER_ERROR when db unavailable", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    await expect(caller.admin.promoteUser({ userId: 1, role: "admin" })).rejects.toThrow();
  });
});
