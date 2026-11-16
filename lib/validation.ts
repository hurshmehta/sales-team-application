import { z } from "zod";

// Shared validation, used on the client before advancing and on the server
// in the API route. Keep the two in sync by importing from this file.

// A US phone number: 10 digits, or 11 digits starting with 1.
// Returns the number formatted as E.164 (+1XXXXXXXXXX), or null if invalid.
export function formatPhoneE164(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }
  return null;
}

// Light display formatting while typing: (555) 123-4567
export function formatPhoneDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  const d = digits.startsWith("1") ? digits.slice(1) : digits;
  if (d.length === 0) return "";
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
}

const phoneSchema = z
  .string()
  .transform((val) => formatPhoneE164(val))
  .refine((val) => val !== null, {
    message: "Enter a valid US phone number.",
  })
  .transform((val) => val as string);

export const licensingStatusSchema = z.enum([
  "licensed",
  "willing",
  "not_interested",
]);

export const availabilitySchema = z.enum(["3-5", "6-8", "10-12"]);

export const statusSchema = z.enum([
  "in_progress",
  "disqualified_eligibility",
  "disqualified_license",
  "completed_no_booking",
  "booked",
]);

// Individual field validators, mirrored on client and server.
export const fieldSchemas = {
  eligibility: z.enum(["yes", "no"]),
  full_name: z.string().trim().min(2, "Please enter your full name."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: phoneSchema,
  licensing: licensingStatusSchema,
  motivation: z.string().trim().min(1, "Please answer this question."),
  commitment: z.string().trim().min(1, "Please answer this question."),
  availability: availabilitySchema,
} as const;

export type AnswerKey = keyof typeof fieldSchemas;

// Validate one answer. Returns the cleaned value or an error message.
export function validateAnswer(
  key: AnswerKey,
  value: unknown
): { ok: true; value: string } | { ok: false; error: string } {
  const result = fieldSchemas[key].safeParse(value);
  if (result.success) {
    return { ok: true, value: result.data as string };
  }
  const message =
    result.error.issues[0]?.message || "This answer is not valid.";
  return { ok: false, error: message };
}

// Partial answers accepted by the API on every step save.
// Unknown keys are stripped. Phone is normalized to E.164.
export const partialAnswersSchema = z
  .object({
    eligibility: fieldSchemas.eligibility.optional(),
    full_name: fieldSchemas.full_name.optional(),
    email: fieldSchemas.email.optional(),
    phone: fieldSchemas.phone.optional(),
    licensing: fieldSchemas.licensing.optional(),
    motivation: fieldSchemas.motivation.optional(),
    commitment: fieldSchemas.commitment.optional(),
    availability: fieldSchemas.availability.optional(),
  })
  .strict();

export const saveApplicationSchema = z.object({
  sessionId: z.string().uuid("Invalid session id."),
  answers: partialAnswersSchema,
  status: statusSchema.optional(),
  calendlyEventUri: z.string().url().optional(),
  utmSource: z.string().max(200).optional(),
  utmMedium: z.string().max(200).optional(),
  utmCampaign: z.string().max(200).optional(),
  referrer: z.string().max(200).optional(),
  // Honeypot field. Humans leave it empty; bots fill it in.
  website: z.string().max(500).optional(),
});

export type SaveApplicationInput = z.infer<typeof saveApplicationSchema>;
export type PartialAnswers = z.infer<typeof partialAnswersSchema>;
