"use client";

import { useState } from "react";

const ITEMS = [
  {
    title: "Licensing",
    summary: "Your course is covered.",
    detail:
      "We cover the $200 pre-licensing course ourselves. You pay only the government costs for testing, the license, and fingerprinting directly to your state.",
  },
  {
    title: "Training",
    summary: "Weekly coaching and real call scripts.",
    detail:
      "Weekly 1:1 coaching, word-for-word call scripts, and sitting in on live calls before you lead your own.",
  },
  {
    title: "Leads",
    summary: "Leads are provided for you.",
    detail:
      "The team covers leads that cost thousands per month, so you are not buying leads yourself and never have to call friends and family.",
  },
  {
    title: "Quoting",
    summary: "Quote with top A+ rated carriers.",
    detail:
      "Quote life insurance with Ethos, Mutual of Omaha, and American Amicable, all top A+ rated carriers.",
  },
  {
    title: "Commissions",
    summary: "Paid by the carrier, not the client.",
    detail:
      "Commissions are paid by the carrier, not the client, and your contract level rises with production.",
  },
  {
    title: "Your team",
    summary: "Grow with a team behind you.",
    detail:
      "Build alongside other agents on the team, with coaching and support as you grow at your own pace.",
  },
];

export default function WhatYouGet() {
  const [selected, setSelected] = useState(0);
  const item = ITEMS[selected];

  return (
    <div>
      <div
        role="tablist"
        aria-label="What you get"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {ITEMS.map((entry, idx) => {
          const isSelected = selected === idx;
          return (
            <button
              key={entry.title}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelected(idx)}
              className={`rounded-2xl border p-5 text-left transition ${
                isSelected
                  ? "border-accent bg-accent-light shadow-sm"
                  : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm"
              }`}
            >
              <span className="font-display text-lg font-bold text-neutral-900">
                {entry.title}
              </span>
              <span className="mt-1 block text-sm text-neutral-600">
                {entry.summary}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
        <h3 className="font-display text-2xl font-bold text-neutral-900">
          {item.title}
        </h3>
        <p className="mt-3 text-lg leading-relaxed text-neutral-600">
          {item.detail}
        </p>
        <a
          href="#apply"
          className="mt-5 inline-block text-sm font-semibold text-accent hover:underline"
        >
          See if you qualify
        </a>
      </div>
    </div>
  );
}
