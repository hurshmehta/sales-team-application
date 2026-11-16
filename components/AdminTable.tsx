"use client";

import { useState } from "react";
import type { ApplicationRow } from "@/lib/supabase";

const STATUS_OPTIONS = [
  "",
  "in_progress",
  "disqualified_eligibility",
  "disqualified_license",
  "completed_no_booking",
  "booked",
];

const LICENSING_OPTIONS = ["", "licensed", "willing", "not_interested"];
const AVAILABILITY_OPTIONS = ["", "3-5", "6-8", "10-12"];

interface Filters {
  status?: string;
  licensing?: string;
  availability?: string;
}

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

export default function AdminTable({
  rows,
  filters,
}: {
  rows: ApplicationRow[];
  filters: Filters;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div>
      <form
        method="get"
        className="mt-8 flex flex-wrap gap-3"
        aria-label="Filter applications"
      >
        <label className="flex flex-col text-xs font-medium text-neutral-500">
          Status
          <select
            name="status"
            defaultValue={filters.status || ""}
            className="mt-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900"
          >
            {STATUS_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value === "" ? "All statuses" : value}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-xs font-medium text-neutral-500">
          Licensing
          <select
            name="licensing"
            defaultValue={filters.licensing || ""}
            className="mt-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900"
          >
            {LICENSING_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value === "" ? "All licensing" : value}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-xs font-medium text-neutral-500">
          Availability
          <select
            name="availability"
            defaultValue={filters.availability || ""}
            className="mt-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900"
          >
            {AVAILABILITY_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value === "" ? "All availability" : `${value} hours`}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="self-end rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700"
        >
          Filter
        </button>
      </form>

      {rows.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-neutral-200 bg-white p-8 text-center text-neutral-500">
          No applications match these filters yet.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-neutral-200 text-sm text-neutral-500">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Licensing</th>
                <th className="px-5 py-3 font-medium">Availability</th>
                <th className="px-5 py-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isOpen = openId === row.id;
                return (
                  <>
                    <tr
                      key={row.id}
                      className="border-b border-neutral-100 text-sm"
                    >
                      <td className="whitespace-nowrap px-5 py-3 text-neutral-600">
                        {formatDate(row.created_at)}
                      </td>
                      <td className="px-5 py-3 font-medium text-neutral-900">
                        {row.full_name || "-"}
                      </td>
                      <td className="px-5 py-3 text-neutral-600">
                        {row.email || "-"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-neutral-600">
                        {row.phone || "-"}
                      </td>
                      <td className="px-5 py-3">
                        <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
                          {row.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-neutral-600">
                        {row.licensing || "-"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-neutral-600">
                        {row.availability ? `${row.availability} hours` : "-"}
                      </td>
                      <td className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => setOpenId(isOpen ? null : row.id)}
                          aria-expanded={isOpen}
                          className="font-medium text-accent hover:underline"
                        >
                          {isOpen ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr key={`${row.id}-detail`} className="border-b border-neutral-100 bg-neutral-50">
                        <td colSpan={8} className="px-5 py-4 text-sm text-neutral-700">
                          <dl className="grid gap-2 sm:grid-cols-2">
                            <div>
                              <dt className="font-medium text-neutral-500">Eligibility (US citizen / authorized, 18+)</dt>
                              <dd>{row.eligibility || "-"}</dd>
                            </div>
                            <div>
                              <dt className="font-medium text-neutral-500">Licensing status</dt>
                              <dd>{row.licensing_status || "-"}</dd>
                            </div>
                            <div className="sm:col-span-2">
                              <dt className="font-medium text-neutral-500">Motivation</dt>
                              <dd className="whitespace-pre-wrap">{row.motivation || "-"}</dd>
                            </div>
                            <div className="sm:col-span-2">
                              <dt className="font-medium text-neutral-500">Commitment</dt>
                              <dd className="whitespace-pre-wrap">{row.commitment || "-"}</dd>
                            </div>
                            <div>
                              <dt className="font-medium text-neutral-500">Calendly event</dt>
                              <dd className="break-all">{row.calendly_event_uri || "-"}</dd>
                            </div>
                            <div>
                              <dt className="font-medium text-neutral-500">Referrer / UTM</dt>
                              <dd>
                                {[row.referrer, row.utm_source, row.utm_medium, row.utm_campaign]
                                  .filter(Boolean)
                                  .join(" / ") || "-"}
                              </dd>
                            </div>
                            <div>
                              <dt className="font-medium text-neutral-500">Session</dt>
                              <dd className="break-all font-mono text-xs">{row.session_id}</dd>
                            </div>
                            <div>
                              <dt className="font-medium text-neutral-500">Last updated</dt>
                              <dd>{formatDate(row.updated_at)}</dd>
                            </div>
                          </dl>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
