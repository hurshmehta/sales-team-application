"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
        prefill?: Record<string, string>;
      }) => void;
    };
  }
}

interface CalendlyEmbedProps {
  name: string;
  email: string;
  onScheduled: (eventUri: string) => void;
}

const WIDGET_SCRIPT = "https://assets.calendly.com/assets/external/widget.js";

export default function CalendlyEmbed({ name, email, onScheduled }: CalendlyEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  const baseUrl =
    process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/hurshmehta2/30min";
  const params = new URLSearchParams();
  if (name) params.set("name", name);
  if (email) params.set("email", email);
  const url = `${baseUrl}?${params.toString()}`;

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!event.data || typeof event.data !== "object") return;
      if (event.origin !== "https://calendly.com") return;
      if (event.data.event === "calendly.event_scheduled") {
        const uri = event.data?.payload?.event?.uri as string | undefined;
        if (uri) onScheduled(uri);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
    // onScheduled is stable enough via useCallback in the parent; include it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onScheduled]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function init() {
      if (window.Calendly && container) {
        container.innerHTML = "";
        window.Calendly.initInlineWidget({
          url,
          parentElement: container,
        });
      }
    }

    const existing = document.querySelector(
      `script[src="${WIDGET_SCRIPT}"]`
    ) as HTMLScriptElement | null;
    if (window.Calendly) {
      init();
      return;
    }
    if (existing) {
      existing.addEventListener("load", init);
      return;
    }
    const script = document.createElement("script");
    script.src = WIDGET_SCRIPT;
    script.async = true;
    script.onload = init;
    script.onerror = () => setFailed(true);
    document.head.appendChild(script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  if (failed) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-6 text-center">
        <p className="mb-4 text-neutral-600">
          The booking widget could not load. You can book your call directly:
        </p>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-block rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-dark"
        >
          Open booking page
        </a>
      </div>
    );
  }

  return <div ref={containerRef} className="calendly-inline-widget w-full" />;
}
