const STEPS = [
  {
    when: "Today",
    title: "Apply",
    text: "Answer a few questions, then a 30-minute intro call.",
  },
  {
    when: "Weeks 1-2",
    title: "Get licensed",
    text: "A clear study plan and help booking your state exam.",
  },
  {
    when: "Weeks 3-4",
    title: "Train",
    text: "Learn the products, sit in on real calls, then lead your own.",
  },
  {
    when: "Week 5 on",
    title: "Help families",
    text: "Write your first policies and grow at your own pace.",
  },
];

export default function PathSection() {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STEPS.map((step, idx) => (
        <li
          key={step.title}
          className="rounded-2xl border border-neutral-200 bg-white p-6"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            {step.when}
          </p>
          <p className="mt-3 font-display text-2xl font-bold text-neutral-900">
            <span className="mr-2 text-neutral-300">{idx + 1}.</span>
            {step.title}
          </p>
          <p className="mt-2 leading-relaxed text-neutral-600">{step.text}</p>
        </li>
      ))}
    </ol>
  );
}
