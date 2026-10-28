"use client";
import type { MouseEvent } from "react";

/**
 * The only client-side part of the role showcase: four tab buttons that reveal
 * the matching pre-rendered sheet. React holds no state because the DOM already
 * carries every sheet, so nothing but this handler is transferred as code.
 */
export function RoleTabs({ label, roles }: { label: string; roles: { value: string; label: string }[] }) {
  function select(event: MouseEvent<HTMLDivElement>) {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-role]");
    const value = button?.dataset.role;
    const group = button?.closest(".role-showcase");
    if (!button || !value || !group) return;
    for (const sheet of group.querySelectorAll<HTMLElement>("[data-role-view]")) {
      sheet.hidden = sheet.dataset.roleView !== value;
    }
    for (const tab of group.querySelectorAll<HTMLButtonElement>(".button-row button[data-role]")) {
      tab.setAttribute("aria-pressed", String(tab.dataset.role === value));
    }
  }
  return (
    <div className="button-row" role="group" aria-label={label} onClick={select}>
      {roles.map((role, index) => (
        <button className="button" type="button" key={role.value} data-role={role.value} aria-pressed={index === 0}>{role.label}</button>
      ))}
    </div>
  );
}
