import { cookies } from "next/headers";
import { getSupabase, type ApplicationRow } from "@/lib/supabase";
import { ADMIN_COOKIE, makeSessionToken } from "@/lib/adminAuth";
import AdminLogin from "@/components/AdminLogin";
import AdminTable from "@/components/AdminTable";

export const dynamic = "force-dynamic";

interface SearchParams {
  status?: string;
  licensing?: string;
  availability?: string;
}

function isAuthed(): boolean {
  try {
    const token = cookies().get(ADMIN_COOKIE)?.value;
    return !!token && token === makeSessionToken();
  } catch {
    return false;
  }
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  if (!isAuthed()) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
        <h1 className="font-display text-3xl font-bold text-neutral-900">
          Admin
        </h1>
        <p className="mt-2 text-neutral-600">
          Sign in to view applications.
        </p>
        <AdminLogin />
      </main>
    );
  }

  let rows: ApplicationRow[] = [];
  let loadError: string | null = null;
  try {
    const supabase = getSupabase();
    let query = supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (searchParams.status) query = query.eq("status", searchParams.status);
    if (searchParams.licensing)
      query = query.eq("licensing", searchParams.licensing);
    if (searchParams.availability)
      query = query.eq("availability", searchParams.availability);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    rows = (data || []) as ApplicationRow[];
  } catch (err) {
    loadError =
      err instanceof Error ? err.message : "Could not load applications.";
  }

  const exportHref = `/api/admin/export?${new URLSearchParams(
    Object.fromEntries(
      Object.entries(searchParams).filter(([, v]) => v !== undefined)
    ) as Record<string, string>
  ).toString()}`;

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-neutral-900">
            Applications
          </h1>
          <p className="mt-1 text-neutral-600">
            {rows.length} application{rows.length === 1 ? "" : "s"} shown.
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href={exportHref}
            className="rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-800 transition hover:border-neutral-500"
          >
            Export CSV
          </a>
          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-800 transition hover:border-neutral-500"
            >
              Log out
            </button>
          </form>
        </div>
      </div>

      {loadError ? (
        <p role="alert" className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {loadError}
        </p>
      ) : (
        <AdminTable rows={rows} filters={searchParams} />
      )}
    </main>
  );
}
