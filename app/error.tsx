"use client";

import { useEffect, useState } from "react";

const LOCAL_KEY = "pmwork:workspace:v3";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [locale, setLocale] = useState<"ru" | "en">("en");
  const [hasRecovery, setHasRecovery] = useState(false);

  useEffect(() => {
    setLocale(window.location.pathname.includes("/ru/") ? "ru" : "en");
    try {
      setHasRecovery(Boolean(localStorage.getItem(LOCAL_KEY)));
    } catch {
      setHasRecovery(false);
    }
    console.error("PMWORK route error", error);
  }, [error]);

  const ru = locale === "ru";
  const downloadRecovery = () => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (!raw) return;
      const blob = new Blob([raw], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `pmwork-recovery-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      // Recovery download is best-effort; never mutate storage from the error boundary.
    }
  };

  return (
    <main className="language-gate first-run-gate" role="main">
      <p className="eyebrow">PMWORK · {ru ? "ВОССТАНОВЛЕНИЕ" : "RECOVERY"}</p>
      <h1>{ru ? "Интерфейс не смог продолжить работу" : "The interface could not continue"}</h1>
      <p className="lead">
        {ru
          ? "Локальные данные не очищались. Попробуйте перезапустить интерфейс; при необходимости сначала сохраните сырую recovery-копию."
          : "Local data was not cleared. Retry the interface; if needed, download the raw recovery copy first."}
      </p>
      <div className="button-row">
        <button className="button primary" onClick={reset}>
          {ru ? "Перезапустить интерфейс" : "Retry interface"}
        </button>
        {hasRecovery && (
          <button className="button" onClick={downloadRecovery}>
            {ru ? "Скачать recovery-копию" : "Download recovery copy"}
          </button>
        )}
        <a className="button" href={ru ? "/ru/workspace/" : "/en/workspace/"}>
          {ru ? "Открыть рабочее пространство" : "Open workspace"}
        </a>
      </div>
      {error.digest && <p className="muted">Reference: {error.digest}</p>}
    </main>
  );
}
