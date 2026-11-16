import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { saveApplicationSchema } from "@/lib/validation";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { notifyBooked } from "@/lib/notify";

// POST /api/application
// Creates the row after the first answer, then upserts on every step.
// Body: { sessionId, answers (partial), status?, calendlyEventUri?,
//         utmSource?, utmMedium?, utmCampaign?, referrer?, website? (honeypot) }
export async function POST(req: Request) {
  // Rate limit: 20 saves per minute per IP.
  const ip = clientIp(req);
  const limit = rateLimit(`application:${ip}`, 20, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = saveApplicationSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Honeypot: if the hidden "website" field is filled, it is a bot.
  // Return success without saving anything, so the bot learns nothing.
  if (data.website && data.website.trim() !== "") {
    return NextResponse.json({ ok: true, saved: false });
  }

  const supabase = getSupabase();

  // Load the existing row for this session, if any.
  const { data: existing, error: fetchError } = await supabase
    .from("applications")
    .select("*")
    .eq("session_id", data.sessionId)
    .maybeSingle();

  if (fetchError) {
    console.error("Supabase fetch error:", fetchError);
    return NextResponse.json(
      { ok: false, error: "Could not save your application. Please try again." },
      { status: 500 }
    );
  }

  const existingAnswers: Record<string, string | undefined> = {
    eligibility: existing?.eligibility ?? undefined,
    full_name: existing?.full_name ?? undefined,
    email: existing?.email ?? undefined,
    phone: existing?.phone ?? undefined,
    licensing: existing?.licensing ?? undefined,
    motivation: existing?.motivation ?? undefined,
    commitment: existing?.commitment ?? undefined,
    availability: existing?.availability ?? undefined,
  };
  const merged = { ...existingAnswers, ...data.answers };
  const answers = merged as Record<string, string | undefined>;

  // Status: explicit status from the client wins; otherwise keep the
  // existing status, or start as in_progress.
  const status = data.status ?? existing?.status ?? "in_progress";

  // licensing_status mirrors the licensing answer.
  const licensing = answers.licensing as string | undefined;
  const licensingStatus =
    licensing === "licensed" ||
    licensing === "willing" ||
    licensing === "not_interested"
      ? licensing
      : (existing?.licensing_status ?? null);

  const row = {
    session_id: data.sessionId,
    updated_at: new Date().toISOString(),
    status,
    eligibility: answers.eligibility ?? existing?.eligibility ?? null,
    full_name: answers.full_name ?? existing?.full_name ?? null,
    email: answers.email ?? existing?.email ?? null,
    phone: answers.phone ?? existing?.phone ?? null,
    licensing: answers.licensing ?? existing?.licensing ?? null,
    licensing_status: licensingStatus,
    motivation: answers.motivation ?? existing?.motivation ?? null,
    commitment: answers.commitment ?? existing?.commitment ?? null,
    availability: answers.availability ?? existing?.availability ?? null,
    calendly_event_uri:
      data.calendlyEventUri ?? existing?.calendly_event_uri ?? null,
    utm_source: data.utmSource ?? existing?.utm_source ?? null,
    utm_medium: data.utmMedium ?? existing?.utm_medium ?? null,
    utm_campaign: data.utmCampaign ?? existing?.utm_campaign ?? null,
    referrer: data.referrer ?? existing?.referrer ?? null,
  };

  const { data: saved, error: upsertError } = await supabase
    .from("applications")
    .upsert(row, { onConflict: "session_id" })
    .select()
    .single();

  if (upsertError || !saved) {
    console.error("Supabase upsert error:", upsertError);
    return NextResponse.json(
      { ok: false, error: "Could not save your application. Please try again." },
      { status: 500 }
    );
  }

  // On booking, notify the owner (email via Resend and/or SMS via Twilio).
  // Notifications never block or fail the save.
  const wasAlreadyBooked = existing?.status === "booked";
  if (status === "booked" && !wasAlreadyBooked) {
    await notifyBooked(saved);
  }

  return NextResponse.json({ ok: true, saved: true, id: saved.id });
}

// GET /api/application?sessionId=...
// Returns the saved answers for a session so the form can resume where
// the applicant left off.
export async function GET(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit(`application-get:${ip}`, 30, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many requests." },
      { status: 429 }
    );
  }

  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json(
      { ok: false, error: "Missing sessionId." },
      { status: 400 }
    );
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (error) {
    console.error("Supabase fetch error:", error);
    return NextResponse.json(
      { ok: false, error: "Could not load your application." },
      { status: 500 }
    );
  }
  if (!data) {
    return NextResponse.json({ ok: true, found: false });
  }

  const answers: Record<string, string> = {};
  for (const key of [
    "eligibility",
    "full_name",
    "email",
    "phone",
    "licensing",
    "motivation",
    "commitment",
    "availability",
  ]) {
    const value = (data as Record<string, unknown>)[key];
    if (typeof value === "string" && value !== "") answers[key] = value;
  }

  return NextResponse.json({
    ok: true,
    found: true,
    status: data.status,
    answers,
    calendlyEventUri: data.calendly_event_uri,
  });
}
