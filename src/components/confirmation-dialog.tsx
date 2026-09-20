"use client";
import type { Locale } from "@/domain/schemas";
import { WorkspaceMore } from "./workspace-more";

export function ConfirmationDialog({
  locale,
  title,
  message,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  locale: Locale;
  title: string;
  message: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  }) {
  const ru = locale === "ru";
  return (
    <WorkspaceMore title={title} onClose={onCancel}>
      <div className="stack">
        <p>{message}</p>
        <div className="dialog-actions">
          <span className="spacer" />
          <button className="button" type="button" onClick={onCancel}>
            {ru ? "Отмена" : "Cancel"}
          </button>
          <button className="button danger" type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </WorkspaceMore>
  );
}
