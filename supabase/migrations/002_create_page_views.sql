-- Link opens for the "Join our Sales Team" landing page.
-- One row per page load (a reload counts as another open).
-- Unique visitors = distinct session_id. Run in the Supabase SQL editor.

create table public.page_views (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  created_at timestamptz not null default now(),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer text,
  user_agent text
);

create index page_views_created_at_idx on public.page_views (created_at desc);
create index page_views_session_idx on public.page_views (session_id);

-- Row Level Security is on, with no public policies. All access goes
-- through the Next.js API routes using the service role key, which
-- bypasses RLS. The browser never talks to Supabase directly.
alter table public.page_views enable row level security;
