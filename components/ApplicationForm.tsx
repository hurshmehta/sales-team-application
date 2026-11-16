"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BOOKING,
  END_SCREENS,
  QUESTIONS,
  TOTAL_STEPS,
  WELCOME,
  findBranchRule,
  type EndScreenId,
} from "@/lib/config";
import {
  formatPhoneDisplay,
  validateAnswer,
  type AnswerKey,
} from "@/lib/validation";
import ProgressBar from "./ProgressBar";
import CalendlyEmbed from "./CalendlyEmbed";

type Screen =
  | "welcome"
  | "question"
  | "booking"
  | "not_eligible"
  | "license_required"
  | "complete";

const SESSION_KEY = "sales-team-application-session";

interface Utm {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
}

const SHORTCUT_KEYS = ["a", "b", "c"];

export default function ApplicationForm() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>("welcome");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [booked, setBooked] = useState(false);
  const [utm, setUtm] = useState<Utm>({});
  const resumedRef = useRef(false);

  const question = QUESTIONS[qIndex];
  const isLastQuestion = qIndex === QUESTIONS.length - 1;

  // Session id + UTM capture + resume.
  useEffect(() => {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    setSessionId(id);

    const params = new URLSearchParams(window.location.search);
    const utm = {
      utmSource: params.get("utm_source") || undefined,
      utmMedium: params.get("utm_medium") || undefined,
      utmCampaign: params.get("utm_campaign") || undefined,
      referrer: params.get("ref") || undefined,
    };
    setUtm(utm);

    // Record one link open. Fire-and-forget; failures never block the form.
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: id,
        utmSource: utm.utmSource,
        utmMedium: utm.utmMedium,
        utmCampaign: utm.utmCampaign,
        referrer: utm.referrer,
        userAgent: navigator.userAgent,
      }),
    }).catch(() => {});

    if (resumedRef.current) return;
    resumedRef.current = true;
    fetch(`/api/application?sessionId=${encodeURIComponent(id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data?.found) return;
        const saved = (data.answers || {}) as Record<string, string>;
        const cleaned: Record<string, string> = {};
        for (const [key, value] of Object.entries(saved)) {
          if (typeof value === "string" && value !== "") cleaned[key] = value;
        }
        if (Object.keys(cleaned).length === 0) return;
        setAnswers(cleaned);
        if (data.status === "booked") {
          setBooked(true);
          setScreen("complete");
          return;
        }
        if (data.status === "disqualified_eligibility") {
          setScreen("not_eligible");
          return;
        }
        if (data.status === "disqualified_license") {
          setScreen("license_required");
          return;
        }
        const firstUnanswered = QUESTIONS.findIndex(
          (q) => !cleaned[q.id]
        );
        if (firstUnanswered === -1) {
          setScreen("booking");
        } else {
          setQIndex(firstUnanswered);
          setScreen("question");
        }
      })
      .catch(() => {
        // Resume is a convenience; a failed fetch just starts fresh.
      });
  }, []);

  // Keep the draft input in sync with the current question.
  useEffect(() => {
    if (screen !== "question") return;
    const saved = answers[question.id] || "";
    if (question.type === "phone") {
      setDraft(saved ? formatPhoneDisplay(saved) : "");
    } else {
      setDraft(saved);
    }
    setSelected(question.type === "single_choice" ? saved || null : null);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIndex, screen]);

  const save = useCallback(
    async (
      nextAnswers: Record<string, string>,
      status?: string,
      calendlyEventUri?: string
    ): Promise<boolean> => {
      if (!sessionId) return false;
      setSaving(true);
      try {
        const res = await fetch("/api/application", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            answers: nextAnswers,
            status,
            calendlyEventUri,
            utmSource: utm.utmSource,
            utmMedium: utm.utmMedium,
            utmCampaign: utm.utmCampaign,
            referrer: utm.referrer,
            website: "",
          }),
        });
        const data = await res.json();
        return res.ok && data?.ok === true;
      } catch {
        return false;
      } finally {
        setSaving(false);
      }
    },
    [sessionId, utm]
  );

  const advance = useCallback(async () => {
    if (screen !== "question" || saving) return;
    const raw = question.type === "single_choice" ? selected : draft;
    const result = validateAnswer(question.id as AnswerKey, raw ?? "");
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const nextAnswers = { ...answers, [question.id]: result.value };
    setAnswers(nextAnswers);

    const rule = findBranchRule(question.id, result.value);
    if (rule) {
      const ok = await save(nextAnswers, rule.status);
      if (!ok) {
        setError("Could not save your answer. Please check your connection and try again.");
        return;
      }
      setScreen(rule.goto);
      return;
    }

    const ok = await save(nextAnswers);
    if (!ok) {
      setError("Could not save your answer. Please check your connection and try again.");
      return;
    }
    if (isLastQuestion) {
      setScreen("booking");
    } else {
      setQIndex((i) => i + 1);
    }
  }, [screen, saving, question, selected, draft, answers, isLastQuestion, save]);

  const goBack = useCallback(() => {
    if (screen === "booking") {
      setQIndex(QUESTIONS.length - 1);
      setScreen("question");
      return;
    }
    if (screen === "question" && qIndex > 0) {
      setQIndex((i) => i - 1);
    }
  }, [screen, qIndex]);

  const start = useCallback(() => {
    setScreen("question");
  }, []);

  const finish = useCallback(async () => {
    if (!booked || saving) return;
    setScreen("complete");
  }, [booked, saving]);

  const onScheduled = useCallback(
    async (eventUri: string) => {
      setBooked(true);
      await save(answers, "booked", eventUri);
    },
    [answers, save]
  );

  // Keyboard shortcuts: A/B/C for choices, Enter to advance.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (screen === "welcome" && event.key === "Enter") {
        event.preventDefault();
        start();
        return;
      }
      if (screen === "question") {
        if (question.type === "single_choice") {
          const key = event.key.toLowerCase();
          const idx = SHORTCUT_KEYS.indexOf(key);
          if (idx >= 0 && question.options && question.options[idx]) {
            event.preventDefault();
            setSelected(question.options[idx].value);
            setError(null);
            return;
          }
          if (event.key === "Enter" && selected) {
            event.preventDefault();
            advance();
            return;
          }
        } else if (question.type === "long_text") {
          if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            advance();
            return;
          }
        } else if (event.key === "Enter") {
          event.preventDefault();
          advance();
          return;
        }
      }
      if (screen === "booking" && event.key === "Enter" && booked) {
        event.preventDefault();
        finish();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [screen, question, selected, booked, advance, start, finish]);

  const answeredCount = QUESTIONS.filter((q) => answers[q.id]).length;
  const progressPercent =
    screen === "welcome"
      ? 0
      : screen === "booking"
        ? Math.round((QUESTIONS.length / TOTAL_STEPS) * 100)
        : Math.round((answeredCount / TOTAL_STEPS) * 100);

  const progressLabel =
    screen === "welcome"
      ? "Getting started"
      : screen === "booking"
        ? "Book your call"
        : `Question ${qIndex + 1} of ${QUESTIONS.length}`;

  const showProgress =
    screen === "welcome" || screen === "question" || screen === "booking";
  const showBack =
    (screen === "question" && qIndex > 0) || screen === "booking";

  const inputClass =
    "w-full rounded-xl border border-neutral-300 bg-white px-5 py-4 text-lg text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-200";

  return (
    <div>
      {showProgress && (
        <ProgressBar percent={progressPercent} label={progressLabel} />
      )}

      {showBack && (
        <button
          type="button"
          onClick={goBack}
          className="mb-6 text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
        >
          ← Back
        </button>
      )}

      {screen === "welcome" && (
        <section key="welcome" className="animate-fade-slide">
          <h2 className="font-display text-3xl font-bold leading-tight text-neutral-900 sm:text-4xl">
            {WELCOME.title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-neutral-600">
            {WELCOME.text}
          </p>
          <button
            type="button"
            onClick={start}
            className="mt-8 w-full rounded-full bg-accent px-8 py-4 text-lg font-semibold text-white transition hover:bg-accent-dark sm:w-auto"
          >
            {WELCOME.button}
          </button>
          <p className="mt-4 text-center text-xs text-neutral-400 sm:text-left">
            Press Enter to start
          </p>
        </section>
      )}

      {screen === "question" && (
        <section key={question.id} className="animate-fade-slide">
          <h2 className="font-display text-2xl font-bold leading-tight text-neutral-900 sm:text-3xl">
            {question.title}
          </h2>

          <div className="mt-8">
            {question.type === "single_choice" &&
              question.options?.map((option, idx) => {
                const active = selected === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSelected(option.value);
                      setError(null);
                    }}
                    className={`mb-3 flex w-full items-center gap-4 rounded-xl border px-5 py-4 text-left text-lg transition ${
                      active
                        ? "border-neutral-900 bg-neutral-100 text-neutral-900"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-sm font-bold ${
                        active
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-300 text-neutral-500"
                      }`}
                    >
                      {SHORTCUT_KEYS[idx].toUpperCase()}
                    </span>
                    <span>{option.label}</span>
                  </button>
                );
              })}

            {question.type === "short_text" && (
              <input
                type="text"
                value={draft}
                autoFocus
                placeholder={question.placeholder}
                onChange={(e) => setDraft(e.target.value)}
                className={inputClass}
              />
            )}

            {question.type === "email" && (
              <input
                type="email"
                value={draft}
                autoFocus
                inputMode="email"
                autoComplete="email"
                placeholder={question.placeholder}
                onChange={(e) => setDraft(e.target.value)}
                className={inputClass}
              />
            )}

            {question.type === "phone" && (
              <input
                type="tel"
                value={draft}
                autoFocus
                inputMode="tel"
                autoComplete="tel"
                placeholder={question.placeholder}
                onChange={(e) => setDraft(formatPhoneDisplay(e.target.value))}
                className={inputClass}
              />
            )}

            {question.type === "long_text" && (
              <textarea
                value={draft}
                autoFocus
                rows={5}
                placeholder={question.placeholder}
                onChange={(e) => setDraft(e.target.value)}
                className={`${inputClass} resize-y`}
              />
            )}
          </div>

          {error && (
            <p role="alert" className="mt-3 text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={advance}
            disabled={saving}
            className="mt-6 w-full rounded-full bg-accent px-8 py-4 text-lg font-semibold text-white transition hover:bg-accent-dark disabled:opacity-50 sm:w-auto"
          >
            {saving
              ? "Saving..."
              : isLastQuestion
                ? "Continue to booking"
                : "Continue"}
          </button>
          <p className="mt-4 text-xs text-neutral-400">
            {question.type === "single_choice"
              ? "Press A, B, or C to choose, then Enter to continue"
              : question.type === "long_text"
                ? "Press Ctrl+Enter to continue"
                : "Press Enter to continue"}
          </p>
        </section>
      )}

      {screen === "booking" && (
        <section key="booking" className="animate-fade-slide">
          <h2 className="font-display text-2xl font-bold leading-tight text-neutral-900 sm:text-3xl">
            {BOOKING.title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-neutral-600">
            {BOOKING.text}
          </p>

          <div className="mt-8 overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <CalendlyEmbed
              name={answers.full_name || ""}
              email={answers.email || ""}
              onScheduled={onScheduled}
            />
          </div>

          {booked && (
            <p role="status" className="mt-4 font-medium text-neutral-800">
              Your call is booked. Press Finish to complete your application.
            </p>
          )}
          {!booked && (
            <p className="mt-4 text-sm text-neutral-500">
              Pick a time above. The Finish button unlocks once your call is
              booked.
            </p>
          )}

          <button
            type="button"
            onClick={finish}
            disabled={!booked || saving}
            className="mt-6 w-full rounded-full bg-accent px-8 py-4 text-lg font-semibold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            {BOOKING.finishButton}
          </button>
        </section>
      )}

      {(screen === "not_eligible" ||
        screen === "license_required" ||
        screen === "complete") && (
        <section key={screen} className="animate-fade-slide">
          <h2 className="font-display text-2xl font-bold leading-tight text-neutral-900 sm:text-3xl">
            {END_SCREENS[screen as EndScreenId].title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-neutral-600">
            {END_SCREENS[screen as EndScreenId].text}
          </p>
        </section>
      )}
    </div>
  );
}
