"use client";

import { useState } from "react";

// FAQ answers use the approved wording.
const FAQS = [
  {
    question: "Do I need sales experience?",
    answer:
      "No. Most of our agents started with none. You'll learn the products, follow proven scripts and practice with your mentor before you talk to a single client.",
  },
  {
    question: "What does it cost to get started?",
    answer:
      "You pay the state fees for your exam, license, and fingerprinting, usually $200–$400 total depending on your state. We cover the $200 pre-licensing course ourselves, and there's no fee to join the team.",
  },
  {
    question: "Is this salary or commission?",
    answer:
      "Commission. You're an independent contractor and you earn on every policy you write. There's no ceiling, and your income depends on the work you put in.",
  },
  {
    question: "Is this an MLM?",
    answer:
      "No. You earn from selling real insurance policies to real clients, with no product to buy or inventory to stock. Agents who choose to build a team can also earn on their team's sales, which is how insurance agencies have always worked.",
  },
  {
    question: "Can I do this part-time?",
    answer:
      "Yes. Plenty of agents start with 10–15 hours a week around school or another job, then go full-time once it's working.",
  },
  {
    question: "Will I have to call friends and family?",
    answer:
      "You don't have to. We show you how to work with people who have already asked for coverage, so your conversations start warm.",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white">
      {FAQS.map((faq, idx) => {
        const isOpen = open === idx;
        return (
          <div key={faq.question}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : idx)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="font-display text-lg font-bold text-neutral-900 sm:text-xl">
                {faq.question}
              </span>
              <span className="shrink-0 text-xl text-neutral-400">
                {isOpen ? "−" : "+"}
              </span>
            </button>
            {isOpen && (
              <p className="px-6 pb-6 leading-relaxed text-neutral-600">
                {faq.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
