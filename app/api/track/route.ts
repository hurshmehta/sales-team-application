import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { clientIp, rateLimit } from "@/lib/rateLimit";

// POST /api/track
// Records one landing-page open in page_views. Fire-and-forget from the
// landing page; failures are swallowed client-side and never block the form.
export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit(`track:${ip}`, 60, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const sessionId =
    typeof body.sessionId === "string" ? body.sessionId.slice(0, 200) : "";
  if (!sessionId) {
    return NextResponse.json(
      { ok: false, error: "Missing sessionId." },
      { status: 400 }
    );
  }

  const text = (value: unknown, max = 200): string | null => {
    if (typeof value !== "string" || value.trim() === "") return null;
    return value.slice(0, max);
  };

  try {
    const supabase = getSupabase();
    const { error } = await supabase.from("page_views").insert({
      session_id: sessionId,
      utm_source: text(body.utmSource),
      utm_medium: text(body.utmMedium),
      utm_campaign: text(body.utmCampaign),
      referrer: text(body.referrer),
      user_agent: text(body.userAgent, 500),
    });
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error("Track error:", err);
    return NextResponse.json(
      { ok: false, error: "Could not record visit." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
