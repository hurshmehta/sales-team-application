import { NextResponse, type NextRequest } from "next/server";
import {
  getSupabase,
  type ApplicationRow,
  type PageViewRow,
} from "@/lib/supabase";
import { isAdminRequest } from "@/lib/adminAuth";
import {
  dropOffCounts,
  funnelCounts,
  lastStepForRow,
} from "@/lib/funnel";

// GET /api/admin/stats?status=&licensing=&availability=
// Live stats for the admin dashboard. Requires the admin session cookie.
// Totals and funnel are computed on the full set; the rows list honors
// the filters. Capped at 5000 rows per table, far above current volume.
export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  const status = req.nextUrl.searchParams.get("status") || undefined;
  const licensing = req.nextUrl.searchParams.get("licensing") || undefined;
  const availability =
    req.nextUrl.searchParams.get("availability") || undefined;

  const supabase = getSupabase();

  const [viewsRes, appsRes] = await Promise.all([
    supabase
      .from("page_views")
      .select("session_id, created_at, utm_source, utm_medium, utm_campaign, referrer")
      .order("created_at", { ascending: false })
      .limit(5000),
    supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5000),
  ]);

  if (viewsRes.error) {
    return NextResponse.json(
      { ok: false, error: viewsRes.error.message },
      { status: 500 }
    );
  }
  if (appsRes.error) {
    return NextResponse.json(
      { ok: false, error: appsRes.error.message },
      { status: 500 }
    );
  }

  const views = (viewsRes.data || []) as PageViewRow[];
  const apps = (appsRes.data || []) as ApplicationRow[];

  const uniqueVisitors = new Set(views.map((v) => v.session_id)).size;
  const started = apps.filter((a) => !!a.eligibility).length;
  const booked = apps.filter((a) => a.status === "booked").length;
  const disqualifiedEligibility = apps.filter(
    (a) => a.status === "disqualified_eligibility"
  ).length;
  const disqualifiedLicense = apps.filter(
    (a) => a.status === "disqualified_license"
  ).length;
  const inProgress = apps.filter((a) => a.status === "in_progress").length;
  const completedNoBooking = apps.filter(
    (a) => a.status === "completed_no_booking"
  ).length;

  const funnel = funnelCounts(apps, views.length);

  const dropOff = dropOffCounts(apps);
  const sessionsWithApplication = new Set(apps.map((a) => a.session_id));
  const neverStarted = new Set(
    views.map((v) => v.session_id).filter((s) => !sessionsWithApplication.has(s))
  ).size;
  if (neverStarted > 0) {
    dropOff.unshift({
      step: "welcome",
      label: "Opened the link, never started",
      count: neverStarted,
    });
  }

  const filtered = apps.filter((a) => {
    if (status && a.status !== status) return false;
    if (licensing && a.licensing !== licensing) return false;
    if (availability && a.availability !== availability) return false;
    return true;
  });

  const rows = filtered.slice(0, 500).map((a) => ({
    ...a,
    last_step: lastStepForRow(a),
  }));

  return NextResponse.json({
    ok: true,
    totals: {
      opens: views.length,
      uniqueVisitors,
      started,
      booked,
      disqualifiedEligibility,
      disqualifiedLicense,
      inProgress,
      completedNoBooking,
      applications: apps.length,
    },
    funnel,
    dropOff,
    rows,
    recentOpens: views.slice(0, 20),
    fetchedAt: new Date().toISOString(),
  });
}
