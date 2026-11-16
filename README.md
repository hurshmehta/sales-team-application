# Join Our Sales Team

A complete landing page with a multi-step "Join our Sales Team" application
form for a life insurance recruiting team. Typeform-style, one question per
screen, with a Calendly booking step, Supabase backend, and a simple admin
page.

**Important:** this is a new, standalone Next.js app. It does **not** replace
the live hurshmehta.com site until you choose to deploy it and point the
domain at it.

## Stack

- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS
- Supabase (Postgres) for storage
- Zod for validation (client + server)
- Resend (email) and Twilio (SMS) notifications, both optional
- Calendly inline embed for the intro call

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Supabase project at https://supabase.com, then run the
   migration in the Supabase SQL editor:

   - `supabase/migrations/001_create_applications.sql`

   The migration creates the `applications` table plus the `application_status`
   and `licensing_status` enums. Row Level Security is enabled with no public
   policies; all access goes through the API routes with the service role key.

3. Copy the env template and fill it in:

   ```bash
   cp .env.example .env.local
   ```

   Required:
   - `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (Supabase
     Project Settings > API)
   - `ADMIN_PASSWORD` (password for `/admin`)
   - `ADMIN_SESSION_SECRET` (random string, for example `openssl rand -hex 32`)

   Optional:
   - `NEXT_PUBLIC_CALENDLY_URL` (defaults to
     `https://calendly.com/hurshmehta2/30min`)
   - `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NOTIFY_EMAIL` (email on booked)
   - `SEND_APPLICANT_CONFIRMATION=true` (confirmation email to the applicant)
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`,
     `NOTIFY_PHONE` (SMS on booked)

   If the Resend/Twilio variables are absent, notifications are skipped
   gracefully with a logged warning and the save still succeeds.

4. Run locally:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000. The admin page is at
   http://localhost:3000/admin.

## How it works

- The form is a multi-step flow: Welcome, 8 questions, Calendly booking,
  complete screen. Progress bar, Enter to advance, A/B/C shortcuts for
  choices, back button, mobile-first.
- The first answer creates a row in the `applications` table. Every step
  upserts it (resume works via a session id stored in localStorage; a
  returning applicant picks up at the first unanswered question).
- Branching: eligibility "No" ends on the not-eligible screen and saves as
  `disqualified_eligibility`; licensing "No, and I'm not interested in
  getting licensed" ends on the license-required screen and saves as
  `disqualified_license`. Disqualified applicants are still saved.
- The booking step embeds Calendly inline, prefilled with the applicant's
  name and email. It listens for Calendly's `calendly.event_scheduled`
  postMessage event; only then is Finish enabled. Finish saves the status
  as `booked` with the Calendly event URI and sends the owner notification.
- UTM params (`utm_source`, `utm_medium`, `utm_campaign`) and a `?ref=`
  recruiter code are captured from the URL as hidden fields.
- Server validation mirrors the client (zod). The save route is rate
  limited (20/min per IP) and has a honeypot field: bots that fill the
  hidden `website` field get a fake success and nothing is saved.
- `/admin` is password protected (single password from `ADMIN_PASSWORD`,
  cookie session, 7 days). It lists applications with filters by status,
  licensing, and availability, expands rows to show full answers, and has a
  CSV export button (same filters apply).

## Editing questions and branches

Edit `lib/config.ts` only. It holds the questions (ids, order, wording,
options), the branch rules, the end screens, and the booking copy. No
component code needs to change to edit a question or a branch. If you add or
rename an answer field, add the matching column to the `applications` table
and to `lib/validation.ts`.

## Deploy

Vercel is recommended (native Next.js support):

1. Push this folder to a Git repo.
2. Import the repo in Vercel, set the environment variables from
   `.env.example`, and deploy. No build settings need changing
   (`npm run build`).

Netlify also works for Next.js: import the repo in Netlify with the
`@netlify/plugin-nextjs` runtime (or the Essential Next.js build plugin),
set the same environment variables, and deploy.

After deploying, the Calendly embed, the form saves, and the admin page all
work the same as locally. The live hurshmehta.com site is untouched until you
decide to switch the domain to this app.
