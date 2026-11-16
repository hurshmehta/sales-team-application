import { cookies } from "next/headers";
import { ADMIN_COOKIE, makeSessionToken } from "@/lib/adminAuth";
import AdminLogin from "@/components/AdminLogin";
import AdminDashboard from "@/components/AdminDashboard";

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

export default function AdminPage({
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

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-neutral-900">
            Applications
          </h1>
          <p className="mt-1 text-neutral-600">
            Link opens, funnel, drop-offs and every response, live.
          </p>
        </div>
        <form action="/api/admin/logout" method="post">
          <button
            type="submit"
            className="rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-800 transition hover:border-neutral-500"
          >
            Log out
          </button>
        </form>
      </div>

      <div className="mt-8">
        <AdminDashboard initialFilters={searchParams} />
      </div>
    </main>
  );
}
