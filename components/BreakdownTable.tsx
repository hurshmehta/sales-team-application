// Comparison table mirroring the reference site's table:
// 6 metrics, TikTok Shop / Trading / Selling AI / Dropshipping plus the
// Best fit (life insurance) column, highlighted.

const MODELS = ["TikTok Shop", "Trading", "Selling AI", "Dropshipping", "Life insurance"];

const ROWS: { metric: string; values: string[] }[] = [
  {
    metric: "Startup cost",
    values: ["$0–250", "$5–10k", "$2–5k", "$500–2k", "$200–400"],
  },
  {
    metric: "First paycheck",
    values: ["2–5 months", "Unpredictable", "2–4 months", "2–6 months", "Often month one"],
  },
  {
    metric: "Learning curve",
    values: [
      "Content skills",
      "Years",
      "Sales and marketing",
      "Ads and suppliers",
      "Weeks, with scripts",
    ],
  },
  {
    metric: "Demand",
    values: ["Trend-driven", "Market-driven", "Crowded", "Crowded", "Every family"],
  },
  {
    metric: "Credential",
    values: ["None", "None", "None", "None", "State license"],
  },
  {
    metric: "Room to grow",
    values: ["Low", "Capital-limited", "Medium", "Medium", "Lead a team"],
  },
];

export default function BreakdownTable() {
  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="px-5 py-4 text-sm font-medium text-neutral-500">
                Metric
              </th>
              {MODELS.map((model) => (
                <th
                  key={model}
                  className={`px-5 py-4 text-sm font-semibold ${
                    model === "Life insurance"
                      ? "bg-accent-light text-neutral-900"
                      : "text-neutral-900"
                  }`}
                >
                  {model === "Life insurance" ? (
                    <span>
                      <span className="mr-1 text-accent">★</span> Best fit
                      <span className="block text-sm font-semibold text-neutral-900">
                        Life insurance
                      </span>
                    </span>
                  ) : (
                    model
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr
                key={row.metric}
                className="border-b border-neutral-100 last:border-b-0"
              >
                <th className="px-5 py-4 text-sm font-semibold text-neutral-900">
                  {row.metric}
                </th>
                {row.values.map((value, idx) => (
                  <td
                    key={idx}
                    className={`px-5 py-4 text-sm ${
                      idx === row.values.length - 1
                        ? "bg-accent-light font-medium text-neutral-900"
                        : "text-neutral-600"
                    }`}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-right text-sm text-neutral-500">
        Swipe to compare ›
      </p>
    </div>
  );
}
