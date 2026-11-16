import { NextResponse, type NextRequest } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { isAdminRequest } from "@/lib/adminAuth";

// GET /api/admin/export?status=&licensing=&availability= -> CSV download.
// Requires the admin session cookie.
export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  const status = req.nextUrl.searchParams.get("status") || undefined;
  const licensing = req.nextUrl.searchParams.get("licensing") || undefined;
  const availability = req.nextUrl.searchParams.get("availability") || undefined;

  const supabase = getSupabase();
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
    "status",
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

  const escape = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    const text = String(value).replace(/"/g, '""');
    return /[",\n]/.test(text) ? `"${text}"` : text;
  };

  const lines = [
    columns.join(","),
    ...(data || []).map((row) =>
      columns.map((col) => escape((row as Record<string, unknown>)[col])).join(",")
    ),
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="applications-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
