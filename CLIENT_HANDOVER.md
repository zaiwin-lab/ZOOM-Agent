# Meeting Agent — Client Handover

A working AI meeting assistant: an agent joins Zoom / Google Meet calls,
transcribes them, and produces a summary + action items in 4 languages
(English, Bahasa Malaysia, Chinese, Iban).

This document covers what's done, how it's hosted, the keys to set, and how to test.

---

## 1. Live system

- **App URL:** https://zoom-agent-production.up.railway.app
- **Hosting:** Railway (project `kb-launchhub`) — one web service + one MySQL database.
- **Code:** GitHub `zaiwin-lab/ZOOM-Agent`, branch `claude/pensive-faraday-j3csiq`.
- **Auto-deploy:** every push to that branch redeploys automatically.

The app serves both the website and the API from one service. The database tables
are created automatically on first boot (no manual migration).

---

## 2. What works today

| Capability | Status |
|---|---|
| Landing site, 4 languages, enterprise section | ✅ Live |
| Email login + 30-day sessions | ✅ Live |
| Dashboard, meeting history, profile, subscription pages | ✅ Live |
| Create meeting + deploy agent | ✅ Live |
| **AI summary + highlights + action items (Claude)** | ✅ Live & verified |
| Real bot joining Zoom/Meet (MeetingBaaS) | ✅ Coded — needs API key |
| Payments (Billplz: FPX/DuitNow/cards) | ✅ Coded — needs API keys |
| Meeting quota gating (3 free, then paid) | ✅ Live |
| Security: auth guard, rate limiting, secure cookies, webhook auth, upload limits | ✅ Live |

---

## 3. Environment variables (set in Railway → service → Variables)

**Required (already set):**
| Key | Purpose |
|---|---|
| `DATABASE_URL` | MySQL connection (`${{MySQL.MYSQL_URL}}`) |
| `JWT_SECRET` | Signs login sessions. **Must stay set** — app refuses to boot without it. |
| `ANTHROPIC_API_KEY` | Claude — generates the AI notes |
| `OWNER_OPEN_ID` | `email:<owner-email>` — makes that user admin |
| `NODE_ENV` | `production` |

**To enable the real meeting bot:**
| Key | Where to get it |
|---|---|
| `MEETINGBAAS_API_KEY` | Sign up at meetingbaas.com → API Keys |

**To enable payments (Billplz):**
| Key | Where to get it |
|---|---|
| `BILLPLZ_API_KEY` | billplz.com → Settings → API |
| `BILLPLZ_COLLECTION_ID` | billplz.com → create a Collection |
| `BILLPLZ_SANDBOX` | `true` while testing, remove/false for live |

The app auto-detects its own public URL on Railway for webhooks. If you move to a
custom domain, set `APP_URL=https://yourdomain` as well.

---

## 4. How to operate it

- **Make someone admin:** set `OWNER_OPEN_ID=email:their@email`, or have an existing
  admin use the Admin page to promote them.
- **Admin page:** `/admin` — totals for users, meetings, subscriptions.
- **Plans & pricing:** Free (3 meetings) · Pro RM59/mo · Team RM49/seat · Pay-per-use RM12.
  Amounts charged via Billplz are defined in `server/_core/billplz.ts`.
- **Logs / restarts:** Railway → service → Deployments / Metrics.

---

## 5. How to test

**AI notes (no bot needed):** log in → New Meeting → open it → "Load demo transcript"
→ "Generate AI Notes" → summary appears.

**Real bot (after MEETINGBAAS_API_KEY is set):**
1. Start a real Zoom or Google Meet.
2. App → New Meeting → paste the real link → Deploy AI Agent.
3. A participant "AI Agent" joins within ~30s and records.
4. End the call → open the meeting → Generate AI Notes.

**Payments (after Billplz keys, sandbox):** Subscription page → choose a plan →
redirected to Billplz → pay (sandbox) → plan activates via verified callback.

---

## 6. Known limitations / roadmap

- Email login has no password/OTP yet — fine for controlled use; add OTP before
  wide public signups.
- Session tokens (30 days) have no server-side revocation list yet.
- Vexa (self-hosted bot) can replace MeetingBaaS later to remove per-meeting cost.
- e-invoice (LHDN/MyInvois) integration not yet built.

---

## 7. Key files (for any developer taking over)

| Area | File |
|---|---|
| API routes | `server/routers.ts` |
| Auth / sessions | `server/_core/sdk.ts`, `server/_core/cookies.ts` |
| AI (Claude) | `server/_core/llm.ts` |
| Payments | `server/_core/billplz.ts`, `server/_core/entitlements.ts` |
| Webhooks (bot + payment) | `server/webhook.ts` |
| DB schema | `drizzle/schema.ts`, auto-create in `server/_core/migrate.ts` |
| Frontend pages | `client/src/pages/` |
| Deploy config | `railway.json` |
