# MeetingClone WebDev - Project TODO

## Phase 1: Database Schema & Server Infrastructure
- [x] Extended users table (avatar, displayName, subscriptionPlan, subscriptionStatus, promoCode, freeTrialUsed)
- [x] Meetings table (userId, meetingUrl, botName, botAvatar, status, platform, baasJobId, startedAt, endedAt, duration)
- [x] Transcripts table (meetingId, speakerName, content, timestampMs)
- [x] Action items table (meetingId, content, isCompleted)
- [x] Subscriptions table (userId, plan, status, startDate, endDate, promoCode)
- [x] DB migrations applied via webdev_execute_sql
- [x] Server routers: meetings, transcripts, subscriptions, admin, profile

## Phase 2: Landing Page
- [x] Global CSS with KOBIS colors (#1B6CB5, #B8922A), Montserrat font, CSS variables
- [x] Navbar with logo, nav links, language toggle dropdown, sign in / start free
- [x] Hero section: dark navy bg, gold badge, headline, CTA buttons, trust badges
- [x] Features section: 6 cards in 3x2 grid
- [x] How it works section: 3 step cards
- [x] Pricing section: 3 plan cards with first-month-free banner
- [x] CTA section: dark navy with gold button
- [x] Footer: logo, language pills, copyright
- [x] 4-language toggle (EN, BM, 中文, IBAN) with localStorage persistence
- [x] Full translation dictionary for all UI strings

## Phase 3: Authenticated Dashboard & Profile
- [x] Dashboard layout with sidebar navigation
- [x] Meeting history table (status, date, duration, notes link)
- [x] User profile page: display name + avatar upload
- [x] Protected routes

## Phase 4: Meeting Submission & Bot
- [x] Meeting submission form: paste Zoom/Google Meet link
- [x] Bot config: display name and avatar before deploying
- [x] MeetingBaaS API integration for bot deployment
- [x] Webhook endpoint for bot status updates and transcript data

## Phase 5: Meeting Notes Detail
- [x] Full transcript view with speaker labels
- [x] Full-text search across transcript
- [x] AI summary, highlights, action items display
- [x] PDF export
- [x] Plain text export

## Phase 6: Subscription & Admin
- [x] Subscription management page (3 plans, first-month-free, promo code "blabla")
- [x] Admin dashboard: all users, total meetings, subscription statuses
- [x] Admin-only route protection

## Phase 7: Polish & Tests
- [x] Vitest unit tests (1 passing)
- [x] Loading states and error handling
- [x] Responsive design
- [x] Final checkpoint

## Round 2: Premium Polish & New Features

- [x] Premium corporate colour palette redesign (deep navy authority + gold trust + clean white space)
- [x] Mobile hamburger menu with slide-out drawer on navbar
- [x] Owner email notifications: new user signup + meeting processing complete
- [x] MeetingBaaS API key secret wired to bot deployment
