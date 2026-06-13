# MeetingClone - Project TODO

## Rebrand & Localisation (Phase 2)
- [x] KOBIS Berhad logo integrated in navbar and sidebar
- [x] Corporate blue (#1B6CB5) and gold (#B8922A) design system applied
- [x] Montserrat font for display headings
- [x] AI tagline: "Powered by KOBIS AI Intelligence"
- [x] 4-language toggle: English, Bahasa Malaysia, Chinese, Bahasa Iban
- [x] Full translation dictionary for all UI strings
- [x] Language persisted to localStorage
- [x] Language toggle in navbar (dropdown) and footer (compact pill)
- [x] KOBIS credential strip in hero section
- [x] All 14 tests passing

## Phase 1: Design System, Schema & Landing Page
- [x] Database schema: users (extended), meetings, transcripts, action_items, subscriptions
- [x] Global design system: fonts, colors, CSS variables, animations
- [x] Public landing page: hero, features, pricing (first month free), CTA
- [x] Navigation: public top nav with login/signup CTA

## Phase 2: Auth, Profile & Dashboard
- [x] User auth: login/signup via Manus OAuth
- [x] Profile setup: display name + avatar upload
- [x] Dashboard: meeting history table (status, date, duration, notes link)
- [x] Dashboard layout with sidebar navigation

## Phase 3: Meeting Submission, Bot Deployment & Notes Detail
- [x] Meeting submission form: paste Zoom/Google Meet link
- [x] Bot config: confirm bot display name and avatar before deploying
- [x] Bot deployment: integrate MeetingBaaS API to join meeting
- [x] Webhook endpoint: receive bot status updates and transcript data
- [x] Meeting notes detail page: full transcript with speaker labels
- [x] Search functionality across transcript content

## Phase 4: AI Processing, Export
- [x] AI post-processing: generate summary from transcript
- [x] AI post-processing: extract key highlights
- [x] AI post-processing: extract action items
- [x] Export as PDF
- [x] Export as plain text

## Phase 5: Subscription & Admin
- [x] Subscription management page: current plan, billing status, upgrade/cancel
- [x] First month free logic and display
- [x] Admin dashboard: all users, total meetings, subscription statuses
- [x] Admin-only route protection

## Phase 6: Polish & Tests
- [x] Vitest unit tests for core procedures (14 tests passing)
- [x] Loading states and error handling across all pages
- [x] Responsive design verification
- [x] Final checkpoint
