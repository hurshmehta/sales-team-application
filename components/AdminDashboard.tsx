"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ApplicationRow, PageViewRow } from "@/lib/supabase";
import AdminTable from "@/components/AdminTable";

interface Totals {
  opens: number;
  uniqueVisitors: number;
  started: number;
  booked: number;
  disqualifiedEligibility: number;
  disqualifiedLicense: number;
  inProgress: number;
  completedNoBooking: number;
  applications: number;
}

interface FunnelStep {
  step: string;
  label: string;
  count: number;
}

interface StatsData {
  ok: boolean;
  totals: Totals;
  funnel: FunnelStep[];
  dropOff: FunnelStep[];
  rows: (ApplicationRow & { last_step: string })[];
  recentOpens: PageViewRow[];
  fetchedAt: string;
}

interface Filters {
  status?: string;
  licensing?: string;
  availability?: string;
}

const POLL_MS = 10_000;

function formatTime(value: string): string {
  try {
    return new Date(value).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function pct(part: number, whole: number): string {
  if (!whole) return "0%";
  return `${Math.round((part / whole) * 100)}%`;
}

export default function AdminDashboard({
  initialFilters,
}: {
  initialFilters: Filters;
}) {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [data, setData] = useState<StatsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchStats = useCallback(async (showSpinner = false) => {
    if (document.hidden) return;
    if (showSpinner) setRefreshing(true);
    try {
      const params = new URLSearchParams();
      const f = filtersRef.current;
      if (f.status) params.set("status", f.status);
      if (f.licensing) params.set("licensing", f.licensing);
      if (f.availability) params.set("availability", f.availability);
      const query = params.toString();
      const res = await fetch(`/api/admin/stats${query ? `?${query}` : ""}`);
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Could not load stats.");
      }
      setData(json as StatsData);
      setUpdatedAt(new Date().toISOString());
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load stats."
      );
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const id = setInterval(() => fetchStats(), POLL_MS);
    return () => clearInterval(id);
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
  }, [filters, fetchStats]);

  const totals = data?.totals;
  const droppedOff = totals
    ? totals.started -
      totals.booked -
      totals.disqualifiedEligibility -
      totals.disqualifiedLicense -
      totals.completedNoBooking
    : 0;

  const exportHref = `/api/admin/export?${new URLSearchParams(
    Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined)
    ) as Record<string, string>
  ).toString()}`;

  const cards: { label: string; value: string; sub?: string }[] = totals
    ? [
        { label: "Link opens", value: String(totals.opens) },
        { label: "Unique visitors", value: String(totals.uniqueVisitors) },
        {
          label: "Started applications",
          value: String(totals.started),
          sub: `${pct(totals.started, totals.opens)} of opens`,
        },
        {
          label: "Booked a call",
          value: String(totals.booked),
          sub: `${pct(totals.booked, totals.started)} of starters`,
        },
        {
          label: "Dropped off",
          value: String(Math.max(0, droppedOff)),
          sub: "Started but did not finish or book",
        },
        {
          label: "Disqualified",
          value: String(
            totals.disqualifiedEligibility + totals.disqualifiedLicense
          ),
        },
      ]
    : [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm text-neutral-600">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
          Live, refreshing every 10 seconds
          {updatedAt && (
            <span className="text-neutral-400">
              Last updated {formatTime(updatedAt)}
            </span>
          )}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className="rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-800 transition hover:border-neutral-500 disabled:opacity-50"
          >
            {refreshing ? "Refreshing..." : "Refresh now"}
          </button>
          <a
            href={exportHref}
            className="rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-800 transition hover:border-neutral-500"
          >
            Export applications CSV
          </a>
          <a
            href="/api/admin/export?type=page_views"
            className="rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-800 transition hover:border-neutral-500"
          >
            Export opens CSV
          </a>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
        >
          {error}
        </p>
      )}

      {!data && !error && (
        <p className="mt-8 text-neutral-500">Loading stats...</p>
      )}

      {data && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-neutral-200 bg-white p-5"
              >
                <p className="text-sm font-medium text-neutral-500">
                  {card.label}
                </p>
                <p className="mt-1 font-display text-4xl font-bold text-neutral-900">
                  {card.value}
                </p>
                {card.sub && (
                  <p className="mt-1 text-sm text-neutral-500">{card.sub}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-neutral-200 bg-white p-6">
              <h2 className="font-display text-xl font-bold text-neutral-900">
                Funnel
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                How far each link open got.
              </p>
              <ul className="mt-5 space-y-4">
                {data.funnel.map((step) => {
                  const max = data.funnel[0]?.count || 1;
                  return (
                    <li key={step.step}>
                      <div className="flex items-baseline justify-between gap-4 text-sm">
                        <span className="text-neutral-700">{step.label}</span>
                        <span className="font-semibold text-neutral-900">
                          {step.count} · {pct(step.count, max)}
                        </span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{
                            width: `${Math.max(
                              step.count > 0 ? 2 : 0,
                              (step.count / max) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="rounded-2xl border border-neutral-200 bg-white p-6">
              <h2 className="font-display text-xl font-bold text-neutral-900">
                Where they left
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Last step reached before dropping off.
              </p>
              <ul className="mt-5 space-y-3">
                {data.dropOff.map((step) => (
                  <li
                    key={step.step}
                    className="flex items-baseline justify-between gap-4 border-b border-neutral-100 pb-3 text-sm last:border-b-0 last:pb-0"
                  >
                    <span className="text-neutral-700">{step.label}</span>
                    <span className="font-semibold text-neutral-900">
                      {step.count}
                    </span>
                  </li>
                ))}
                {data.dropOff.length === 0 && (
                  <li className="text-sm text-neutral-500">
                    No drop-offs yet.
                  </li>
                )}
              </ul>

              <h3 className="mt-8 font-display text-lg font-bold text-neutral-900">
                Recent link opens
              </h3>
              <ul className="mt-3 space-y-2">
                {data.recentOpens.map((view) => (
                  <li
                    key={`${view.session_id}-${view.created_at}`}
                    className="flex items-baseline justify-between gap-4 text-sm"
                  >
                    <span className="text-neutral-600">
                      {[view.utm_source, view.utm_medium, view.utm_campaign, view.referrer]
                        .filter(Boolean)
                        .join(" / ") || "Direct link open"}
                    </span>
                    <span className="whitespace-nowrap text-neutral-400">
                      {formatTime(view.created_at)}
                    </span>
                  </li>
                ))}
                {data.recentOpens.length === 0 && (
                  <li className="text-sm text-neutral-500">
                    No link opens recorded yet. Opens are counted from now on.
                  </li>
                )}
              </ul>
            </section>
          </div>

          <section className="mt-10">
            <h2 className="font-display text-2xl font-bold text-neutral-900">
              Responses
            </h2>
            <p className="mt-1 text-neutral-600">
              {data.rows.length} application
              {data.rows.length === 1 ? "" : "s"} shown, newest first.
            </p>
            <AdminTable
              rows={data.rows}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </section>

          <p className="mt-10 text-sm text-neutral-400">
            Note: link opens are counted from Nov 16, 2026, when tracking
            went live. Applications submitted before then don&apos;t have a
            matching open.
          </p>
        </>
      )}
    </div>
  );
}
