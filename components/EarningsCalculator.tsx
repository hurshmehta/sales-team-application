"use client";

import { useMemo, useState } from "react";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function EarningsCalculator() {
  const [policiesPerWeek, setPoliciesPerWeek] = useState(2);
  const [avgPremium, setAvgPremium] = useState(1000);
  const [commissionRate, setCommissionRate] = useState(70);

  const result = useMemo(() => {
    const safePolicies = Math.max(0, policiesPerWeek || 0);
    const safePremium = Math.max(0, avgPremium || 0);
    const safeRate = Math.min(100, Math.max(0, commissionRate || 0));
    const policiesPerMonth = (safePolicies * 52) / 12;
    const earnedPerPolicy = safePremium * (safeRate / 100);
    const monthlyCommission = policiesPerMonth * earnedPerPolicy;
    // Rough estimate: about 10 hours of work per policy each week
    // (calls, follow-ups, applications).
    const hoursPerWeek = safePolicies * 10;
    return { policiesPerMonth, earnedPerPolicy, monthlyCommission, hoursPerWeek };
  }, [policiesPerWeek, avgPremium, commissionRate]);

  return (
    <div>
      <div className="grid gap-6 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 md:grid-cols-2">
        <div className="space-y-6">
          <div>
            <label
              htmlFor="policies-per-week"
              className="mb-2 block text-sm font-medium text-neutral-700"
            >
              Policies per week
            </label>
            <input
              id="policies-per-week"
              type="number"
              min={0}
              max={50}
              step={1}
              value={policiesPerWeek}
              onChange={(e) => setPoliciesPerWeek(Number(e.target.value))}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-lg text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-200"
            />
          </div>
          <div>
            <label
              htmlFor="avg-premium"
              className="mb-2 block text-sm font-medium text-neutral-700"
            >
              Average yearly premium per policy
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-neutral-400">
                $
              </span>
              <input
                id="avg-premium"
                type="number"
                min={0}
                max={100000}
                step={50}
                value={avgPremium}
                onChange={(e) => setAvgPremium(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-300 bg-white py-3 pl-9 pr-4 text-lg text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-200"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="commission-rate"
              className="mb-2 block text-sm font-medium text-neutral-700"
            >
              Commission rate
            </label>
            <div className="relative">
              <input
                id="commission-rate"
                type="number"
                min={0}
                max={100}
                step={1}
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-300 bg-white py-3 pl-4 pr-9 text-lg text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-200"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg text-neutral-400">
                %
              </span>
            </div>
          </div>
          <p className="text-sm text-neutral-500">
            Hours a week assumes about 10 hours of work per policy (calls,
            follow-ups, applications). Adjust the inputs to match your pace.
          </p>
        </div>

        <div className="flex flex-col justify-center rounded-xl bg-neutral-50 p-6">
          <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
            Estimated monthly commission
          </p>
          <p className="mt-1 font-display text-4xl font-bold text-neutral-900 sm:text-5xl">
            {money.format(result.monthlyCommission)}
          </p>
          <dl className="mt-6 space-y-3 border-t border-neutral-200 pt-6 text-neutral-700">
            <div className="flex items-baseline justify-between gap-4">
              <dt>Policies per month</dt>
              <dd className="font-semibold text-neutral-900">
                {result.policiesPerMonth.toFixed(1)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt>Earned per policy</dt>
              <dd className="font-semibold text-neutral-900">
                {money.format(result.earnedPerPolicy)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt>Roughly hours a week</dt>
              <dd className="font-semibold text-neutral-900">
                {result.hoursPerWeek}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <p className="mt-6 text-sm leading-relaxed text-neutral-500">
        Hypothetical illustration only, not a promise or typical result. Agents
        are independent contractors paid by commission, with no salary. Earnings
        depend on effort, skill, contract level, carrier, product mix, policy
        persistency and state. Many new agents earn little in their first
        months, and commissions can be charged back if a policy lapses.
      </p>
    </div>
  );
}
