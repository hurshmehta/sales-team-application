-- Applications table for the "Join our Sales Team" form.
-- Run this in the Supabase SQL editor, or save it under
-- supabase/migrations/ and apply it with the Supabase CLI.

create type application_status as enum (
  'in_progress',
  'disqualified_eligibility',
  'disqualified_license',
  'completed_no_booking',
  'booked'
);

create type licensing_status as enum (
  'licensed',
  'willing',
  'not_interested'
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  -- Browser session id (localStorage). Used to upsert partial progress
  -- and resume the form. Unique so one session maps to one row.
  session_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status application_status not null default 'in_progress',
  eligibility text,
  full_name text,
  email text,
  phone text,
  licensing text,
  licensing_status licensing_status,
  motivation text,
  commitment text,
  availability text,
  calendly_event_uri text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer text
);

create index applications_created_at_idx on public.applications (created_at desc);
create index applications_status_idx on public.applications (status);
create index applications_email_idx on public.applications (email);

-- Keep updated_at current on every write.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

-- Row Level Security is on, with no public policies. All access goes
-- through the Next.js API routes using the service role key, which
-- bypasses RLS. The browser never talks to Supabase directly.
alter table public.applications enable row level security;
