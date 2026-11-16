import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-side Supabase client using the service role key.
// All database access goes through API routes with this client, so the
// anon key is never used from the browser and RLS stays locked down.
// (The migration enables RLS with no public policies.)

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

export interface PageViewRow {
  id?: string;
  session_id: string;
  created_at: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
}

export type ApplicationStatus =
  | "in_progress"
  | "disqualified_eligibility"
  | "disqualified_license"
  | "completed_no_booking"
  | "booked";

export interface ApplicationRow {
  id: string;
  session_id: string;
  created_at: string;
  updated_at: string;
  status: ApplicationStatus;
  eligibility: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  licensing: string | null;
  licensing_status: string | null;
  motivation: string | null;
  commitment: string | null;
  availability: string | null;
  calendly_event_uri: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
}
