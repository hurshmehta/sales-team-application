import ApplicationForm from "@/components/ApplicationForm";
import WhatYouGet from "@/components/WhatYouGet";
import EarningsCalculator from "@/components/EarningsCalculator";
import BreakdownTable from "@/components/BreakdownTable";
import PathSection from "@/components/PathSection";
import FaqSection from "@/components/FaqSection";

const NAV_LINKS = [
  { label: "Apply", href: "#apply" },
  { label: "Why insurance", href: "#why-insurance" },
  { label: "The path", href: "#path" },
  { label: "Earnings", href: "#earnings" },
  { label: "FAQ", href: "#faq" },
];

const TRUST_CHIPS = ["No experience needed", "18 or older", "A phone and a laptop"];

function SectionHeading({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-neutral-900 sm:text-4xl">
        {title}
      </h2>
      {intro && <p className="mt-4 text-lg text-neutral-600">{intro}</p>}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-paper font-sans text-neutral-900">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <a href="#top" className="font-display text-xl font-bold text-neutral-900">
            Hursh Mehta
          </a>
          <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-neutral-600 transition hover:text-neutral-900"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <a
            href="#apply"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark"
          >
            Apply
          </a>
        </div>
      </header>

      <main id="top">
        {/* Hero with the form open immediately */}
        <section className="mx-auto max-w-3xl px-5 pb-16 pt-14 text-center sm:pt-20">
          <p className="inline-block rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-sm font-medium text-neutral-700">
            Now accepting applications
          </p>
          <h1 className="mt-6 font-display text-5xl font-bold leading-tight text-neutral-900 sm:text-6xl">
            See if you qualify.
          </h1>
          <p className="mt-4 text-xl text-neutral-600">
            A few quick questions. About two minutes.
          </p>

          <div
            id="apply"
            className="mt-10 scroll-mt-24 rounded-2xl border border-neutral-200 bg-white p-6 text-left shadow-sm sm:p-8"
          >
            <ApplicationForm />
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {TRUST_CHIPS.map((chip) => (
              <li
                key={chip}
                className="rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-sm text-neutral-600"
              >
                {chip}
              </li>
            ))}
          </ul>

          <dl className="mx-auto mt-12 grid max-w-xl grid-cols-3 gap-4 border-t border-neutral-200 pt-8">
            <div>
              <dt className="sr-only">Work location</dt>
              <dd className="font-display text-3xl font-bold text-neutral-900">
                100%
              </dd>
              <dd className="mt-1 text-sm text-neutral-600">Remote</dd>
            </div>
            <div>
              <dt className="sr-only">Mentorship</dt>
              <dd className="font-display text-3xl font-bold text-neutral-900">
                1:1
              </dd>
              <dd className="mt-1 text-sm text-neutral-600">
                Weekly mentorship
              </dd>
            </div>
            <div>
              <dt className="sr-only">Pre-licensing course</dt>
              <dd className="font-display text-3xl font-bold text-neutral-900">
                $200
              </dd>
              <dd className="mt-1 text-sm text-neutral-600">Course covered</dd>
            </div>
          </dl>
        </section>

        {/* What you get */}
        <section className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
          <SectionHeading
            eyebrow="What you get"
            title="Everything to start."
            intro="Six things most new agents figure out alone. Pick one to see it."
          />
          <WhatYouGet />
        </section>

        {/* Earnings calculator */}
        <section id="earnings" className="scroll-mt-24 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-5">
            <SectionHeading
              eyebrow="Earnings"
              title="Run your own numbers."
              intro="You're paid commission on every policy you write."
            />
            <EarningsCalculator />
          </div>
        </section>

        {/* Quote */}
        <section className="mx-auto max-w-3xl px-5 py-16 text-center sm:py-20">
          <p className="font-display text-2xl font-bold leading-snug text-neutral-900 sm:text-3xl">
            Every family needs life insurance. Most have never had someone sit
            down and explain it.{" "}
            <em>That&apos;s where you come in.</em> We&apos;ll license you,
            train you and stand beside you while you build something
            that&apos;s yours.
          </p>
        </section>

        {/* Why insurance: the comparison table */}
        <section id="why-insurance" className="mx-auto max-w-5xl scroll-mt-24 px-5 py-16 sm:py-20">
          <SectionHeading
            eyebrow="Why insurance"
            title="Compare it to everything else online."
            intro="Less money up front. Faster to your first paycheck. A credential that's yours for life."
          />
          <BreakdownTable />
        </section>

        {/* The path */}
        <section id="path" className="scroll-mt-24 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-5">
            <SectionHeading
              eyebrow="The path"
              title="From zero to licensed."
              intro="A clear path, one step at a time."
            />
            <PathSection />
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-5 py-16 sm:py-20">
          <SectionHeading
            eyebrow="Questions"
            title="Straight answers."
          />
          <FaqSection />
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-3xl px-5 pb-20 pt-4 text-center">
          <h2 className="font-display text-3xl font-bold leading-tight text-neutral-900 sm:text-4xl">
            A few questions. Two minutes. One intro call.
          </h2>
          <a
            href="#apply"
            className="mt-8 inline-block rounded-full bg-accent px-8 py-4 text-lg font-semibold text-white transition hover:bg-accent-dark"
          >
            See if you qualify
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-10">
          <p className="font-display text-lg font-bold text-neutral-900">
            Hursh Mehta
          </p>
          <p className="mt-1">
            <a href="https://hurshmehta.com" className="text-accent hover:underline">
              hurshmehta.com
            </a>
          </p>
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-neutral-500">
            Hursh Mehta is an independent insurance agent. Agents are
            independent contractors compensated by commission. Any earnings
            figures shown are hypothetical illustrations and are not
            guarantees of income; individual results vary widely. Licensing
            requirements and costs vary by state.
          </p>
          <p className="mt-4 text-sm text-neutral-400">
            Copyright 2026 Hursh Mehta
          </p>
        </div>
      </footer>
    </div>
  );
}
