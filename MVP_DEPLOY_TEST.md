# Meeting Agent — Lean MVP Deploy & Test Runbook

Goal: get a working end-to-end test on **Railway** — email login → create meeting →
load transcript → **real Claude AI notes** → view & export. Meeting bot runs in
**demo mode** (no MeetingBaaS needed yet).

---

## 1. What this lean MVP includes

- **Email login** (no Manus OAuth, no Google setup) — `/login` page.
- **MySQL database** via Railway.
- **Claude (Anthropic) AI** for summaries + action items.
- **Demo transcript** button so you can test the AI pipeline without a live bot.
- Everything served from one Railway service (frontend + API + DB).

---

## 2. Deploy on Railway (≈15 min)

### a) Create the database
1. Railway → **New Project** → **Add MySQL**.
2. Open the MySQL service → **Variables** → copy the `MYSQL_URL` (looks like
   `mysql://user:pass@host:port/railway`). This is your `DATABASE_URL`.

### b) Create the app service
1. In the same project → **New** → **GitHub Repo** → pick **zaiwin-lab/ZOOM-Agent**,
   branch **`claude/pensive-faraday-j3csiq`**.
2. Build & start commands are **auto-configured** via `railway.json` (no need to set them manually).
3. **Variables** → add:

| Key | Value |
|---|---|
| `DATABASE_URL` | *(paste the MySQL URL from step a)* |
| `JWT_SECRET` | *(a long random string — see below)* |
| `ANTHROPIC_API_KEY` | *(your Claude key, `sk-ant-…`)* |
| `OWNER_OPEN_ID` | `email:youremail@gmail.com` *(makes you admin)* |
| `NODE_ENV` | `production` |
| `ANTHROPIC_MODEL` | `claude-haiku-4-5-20251001` *(optional; cheap & fast)* |

Generate a strong `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### c) Database tables — automatic ✅
No manual step. The app **creates its tables on first boot** (idempotent
`CREATE TABLE IF NOT EXISTS`). Just make sure `DATABASE_URL` is set before deploy.

### d) Open the app
Railway gives you a URL like `https://zoom-agent-production.up.railway.app`.

---

## 3. Test script (the actual MVP test)

Run these in order and tick them off:

- [ ] **Landing loads** — open the Railway URL, the homepage renders.
- [ ] **Login** — click *Start free* → `/login` → enter your email (the one in
      `OWNER_OPEN_ID`) + name → **Continue** → lands on **/dashboard**.
- [ ] **Session persists** — refresh the page; you stay logged in.
- [ ] **Create meeting** — Dashboard → *New Meeting* → paste any Zoom/Meet URL
      (e.g. `https://zoom.us/j/123456789`) → create. Status shows `pending`/`joining`
      (demo mode — no real bot is charged).
- [ ] **Open the meeting** → click into it (`/meetings/:id`).
- [ ] **Load transcript** — click **“Load demo transcript”** (appears when empty).
- [ ] **Generate AI notes** — click **“Generate AI Notes”**. This calls Claude.
      Within a few seconds you should see a **summary**, **highlights**, and
      **action items** generated from the transcript. ✅ This is the core test.
- [ ] **Toggle action items** — tick one; it persists on refresh.
- [ ] **Export** — click *Export*; a notes file downloads.
- [ ] **Admin** — visit `/admin`; you (the `OWNER_OPEN_ID` user) can see stats.
- [ ] **Logout** — confirm it returns you to the landing page.

If the AI step works, **the MVP pipeline is proven end-to-end.**

---

## 4. Known limits of this lean test (by design)

- **No real meeting bot yet** — bot join is simulated. Next step: wire **Vexa**
  (self-host) or set `MEETINGBAAS_API_KEY` to have a bot actually join calls.
- **No payment** — `subscription.activate` is not gated on payment yet (MVP).
- **Email login has no password/verification** — fine for a controlled test;
  add magic-link/OTP before public launch.
- Security hardening items from the red-team report still apply before going public.

---

## 5. Troubleshooting

- **Login does nothing / 401 on refresh:** check `JWT_SECRET` is set (same value
  across restarts) and `DATABASE_URL` is reachable. Run `pnpm db:push`.
- **“No transcript available” on Generate:** click *Load demo transcript* first.
- **AI error:** verify `ANTHROPIC_API_KEY` is valid and has credit; check logs.
- **Tables missing:** run `pnpm db:push`.
