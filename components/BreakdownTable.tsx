// Comparison table copied faithfully from the live site's "Breakdown" table
// (hurshmehta.com): 6 metrics, 4 models plus the Ideal Model row.

const MODELS = ["TikTok Shop", "Selling AI", "Trading", "HTS", "Ideal Model"];

const ROWS: { metric: string; values: string[] }[] = [
  {
    metric: "Startup Cost",
    values: ["$0–250", "$2–5k", "$5–10k", "$0–500", "$0–250"],
  },
  {
    metric: "Time To First $$",
    values: ["2–5m", "2–4m", "Huge variability", "2–5m", "Fast (14–30 days)"],
  },
  {
    metric: "Proven / Copycat",
    values: [
      "Need course / high risk",
      "Lots of skills to learn",
      "Need course / high risk",
      "Depends on offer",
      "Recession-proof, plug & play",
    ],
  },
  {
    metric: "Skill Requirement",
    values: [
      "Content mastery",
      "Marketing + sales",
      "High",
      "Mastery 1–2 yrs",
      "Low (<1 week to learn)",
    ],
  },
  {
    metric: "Fulfillment",
    values: ["Zero", "High", "N/A", "Zero", "Low (one-time)"],
  },
  {
    metric: "Scalability",
    values: [
      "Low (time for money)",
      "Medium (more ads = more cost)",
      "High",
      "Low (time for money)",
      "High ($100M potential)",
    ],
  },
];

export default function BreakdownTable() {
  return (
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
                  model === "Ideal Model"
                    ? "bg-accent-light text-neutral-900"
                    : "text-neutral-900"
                }`}
              >
                {model === "Ideal Model" ? (
                  <span>
                    <span className="mr-1 text-accent">★</span> Ideal Model
                    <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-white">
                      Best fit
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
  );
}
