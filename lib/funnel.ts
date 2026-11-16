import type { ApplicationRow } from "./supabase";

// Question steps in form order. Each maps to one applications column.
export const QUESTION_STEPS = [
  { id: "eligibility", label: "US citizen / 18+" },
  { id: "full_name", label: "Full name" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "licensing", label: "Licensed?" },
  { id: "motivation", label: "Motivation" },
  { id: "commitment", label: "Commitment" },
  { id: "availability", label: "Hours per day" },
] as const;

export type QuestionId = (typeof QUESTION_STEPS)[number]["id"];

// Where an applicant got to: the first unanswered question, "booking"
// (all questions answered, no call booked yet), "booked", or a
// disqualification status.
export function lastStepForRow(row: ApplicationRow): string {
  if (row.status === "booked") return "booked";
  if (row.status === "disqualified_eligibility")
    return "disqualified_eligibility";
  if (row.status === "disqualified_license") return "disqualified_license";
  for (const step of QUESTION_STEPS) {
    if (!row[step.id]) return step.id;
  }
  return "booking";
}

export function lastStepLabel(step: string): string {
  if (step === "welcome") return "Opened the link, never started";
  if (step === "booking") return "Reached booking, did not book";
  if (step === "booked") return "Booked a call";
  if (step === "disqualified_eligibility")
    return "Disqualified: not eligible (citizen / 18+)";
  if (step === "disqualified_license")
    return "Disqualified: not interested in licensing";
  const found = QUESTION_STEPS.find((s) => s.id === step);
  return found ? `Left at: ${found.label}` : step;
}

// Cumulative funnel: how many applicants answered each question.
export function funnelCounts(
  rows: ApplicationRow[],
  opens: number
): { step: string; label: string; count: number }[] {
  const out: { step: string; label: string; count: number }[] = [
    { step: "opened", label: "Opened the link", count: opens },
  ];
  for (const step of QUESTION_STEPS) {
    out.push({
      step: step.id,
      label: `Answered: ${step.label}`,
      count: rows.filter((r) => !!r[step.id]).length,
    });
  }
  out.push({
    step: "booked",
    label: "Booked a call",
    count: rows.filter((r) => r.status === "booked").length,
  });
  return out;
}

// Drop-off breakdown: how many applicants stopped at each step.
// Sessions that opened the link but never started are counted as
// "welcome" by the caller (opens minus sessions with an application row).
export function dropOffCounts(
  rows: ApplicationRow[]
): { step: string; label: string; count: number }[] {
  const byStep = new Map<string, number>();
  for (const row of rows) {
    const step = lastStepForRow(row);
    byStep.set(step, (byStep.get(step) || 0) + 1);
  }
  const order = [
    "welcome",
    ...QUESTION_STEPS.map((s) => s.id),
    "booking",
    "disqualified_eligibility",
    "disqualified_license",
    "booked",
  ];
  return order
    .filter((step) => byStep.has(step))
    .map((step) => ({
      step,
      label: lastStepLabel(step),
      count: byStep.get(step) || 0,
    }));
}
