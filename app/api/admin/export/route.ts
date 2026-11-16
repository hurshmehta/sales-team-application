import { NextResponse, type NextRequest } from "next/server";
import { getSupabase, type ApplicationRow } from "@/lib/supabase";
import { isAdminRequest } from "@/lib/adminAuth";
import { lastStepForRow } from "@/lib/funnel";

// GET /api/admin/export?status=&licensing=&availability= -> applications CSV.
// GET /api/admin/export?type=page_views -> link-opens CSV.
// Requires the admin session cookie.
export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  const supabase = getSupabase();
  const escape = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    const text = String(value).replace(/"/g, '""');
    return /[",\n]/.test(text) ? `"${text}"` : text;
  };

  if (req.nextUrl.searchParams.get("type") === "page_views") {
    const { data, error } = await supabase
      .from("page_views")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5000);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    const columns = [
      "id",
      "created_at",
      "session_id",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "referrer",
      "user_agent",
    ];
    const lines = [
      columns.join(","),
      ...(data || []).map((row) =>
        columns.map((col) => escape((row as Record<string, unknown>)[col])).join(",")
      ),
    ];
    return new NextResponse(lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="page-views-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  const status = req.nextUrl.searchParams.get("status") || undefined;
  const licensing = req.nextUrl.searchParams.get("licensing") || undefined;
  const availability = req.nextUrl.searchParams.get("availability") || undefined;

  let query = supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5000);
  if (status) query = query.eq("status", status);
  if (licensing) query = query.eq("licensing", licensing);
  if (availability) query = query.eq("availability", availability);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const columns = [
    "id",
    "created_at",
    "updated_at",
    "status",
    "last_step",
    "eligibility",
    "full_name",
    "email",
    "phone",
    "licensing",
    "licensing_status",
    "motivation",
    "commitment",
    "availability",
    "calendly_event_uri",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "referrer",
  ];

  const lines = [
    columns.join(","),
    ...(data || []).map((row) => {
      const record = row as Record<string, unknown>;
      const withLastStep: Record<string, unknown> = {
        ...record,
        last_step: lastStepForRow(row as ApplicationRow),
      };
      return columns.map((col) => escape(withLastStep[col])).join(",");
    }),
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="applications-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
