import type { ApplicationRow } from "./supabase";

// Notifications sent when an application reaches "booked".
// Email via Resend and SMS via Twilio are both optional and env-gated:
// if the relevant variables are absent, the notification is skipped with a
// console warning and the request still succeeds. Nothing here throws.

function answerLines(row: ApplicationRow): string {
  const lines: string[] = [];
  if (row.full_name) lines.push(`Name: ${row.full_name}`);
  if (row.email) lines.push(`Email: ${row.email}`);
  if (row.phone) lines.push(`Phone: ${row.phone}`);
  if (row.eligibility)
    lines.push(`US citizen / authorized to work, 18+: ${row.eligibility}`);
  if (row.licensing) lines.push(`Licensing: ${row.licensing}`);
  if (row.availability) lines.push(`Availability: ${row.availability} hours/day`);
  if (row.motivation) lines.push(`Motivation: ${row.motivation}`);
  if (row.commitment) lines.push(`Commitment: ${row.commitment}`);
  if (row.calendly_event_uri)
    lines.push(`Calendly event: ${row.calendly_event_uri}`);
  if (row.referrer) lines.push(`Referrer code: ${row.referrer}`);
  const utm = [row.utm_source, row.utm_medium, row.utm_campaign]
    .filter(Boolean)
    .join(" / ");
  if (utm) lines.push(`UTM: ${utm}`);
  return lines.join("\n");
}

export async function notifyBooked(row: ApplicationRow): Promise<void> {
  const subject = `New sales team application booked: ${row.full_name || row.email || "applicant"}`;
  const body = `A new applicant booked a 1-on-1 call.\n\n${answerLines(row)}`;

  // Email via Resend
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const notifyEmail = process.env.NOTIFY_EMAIL;
  if (resendKey && from && notifyEmail) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from,
        to: notifyEmail,
        subject,
        text: body,
      });
    } catch (err) {
      console.warn("Resend notification failed:", err);
    }
  } else {
    console.warn(
      "Resend notification skipped: set RESEND_API_KEY, RESEND_FROM_EMAIL, and NOTIFY_EMAIL to enable it."
    );
  }

  // Optional confirmation email to the applicant
  if (
    resendKey &&
    from &&
    row.email &&
    process.env.SEND_APPLICANT_CONFIRMATION === "true"
  ) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from,
        to: row.email,
        subject: "Your call is booked, thanks for applying!",
        text: `Hi ${row.full_name || ""},\n\nThanks for applying to join our life insurance team. Your 1-on-1 call is booked and we look forward to speaking with you.\n\nIf you need to reschedule, use the link in your Calendly confirmation email.`,
      });
    } catch (err) {
      console.warn("Applicant confirmation email failed:", err);
    }
  }

  // SMS via Twilio
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_FROM_NUMBER;
  const notifyPhone = process.env.NOTIFY_PHONE;
  if (sid && token && twilioFrom && notifyPhone) {
    try {
      const twilio = (await import("twilio")).default;
      const twilioClient = twilio(sid, token);
      const shortBody = `New booked application: ${row.full_name || "applicant"} (${row.email || "no email"}, ${row.phone || "no phone"}). Licensing: ${row.licensing || "n/a"}.`;
      await twilioClient.messages.create({
        from: twilioFrom,
        to: notifyPhone,
        body: shortBody,
      });
    } catch (err) {
      console.warn("Twilio notification failed:", err);
    }
  } else {
    console.warn(
      "Twilio notification skipped: set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, and NOTIFY_PHONE to enable it."
    );
  }
}
