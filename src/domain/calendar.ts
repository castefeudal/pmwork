import type { Locale, Workspace } from "./schemas";

export type ProjectCalendarEvent = {
  id: string;
  kind: "work-start" | "work-due" | "milestone" | "risk-review";
  date: string;
  title: string;
  detail: string;
};

function isRealDate(value: string | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/u.test(value)) return false;
  const parsed = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(parsed) && new Date(parsed).toISOString().slice(0, 10) === value;
}

/** Calendar records are projected only from dates already stored in the project graph. */
export function projectCalendarEvents(workspace: Workspace, projectId: string, locale: Locale, workItemIds?: ReadonlySet<string>): ProjectCalendarEvent[] {
  const ru = locale === "ru";
  const events: ProjectCalendarEvent[] = [];
  for (const item of workspace.workItems) {
    if (item.projectId !== projectId || item.archived || (workItemIds && !workItemIds.has(item.id))) continue;
    if (isRealDate(item.startDate)) events.push({ id: `${item.id}:start`, kind: "work-start", date: item.startDate, title: item.title, detail: ru ? "Начало работы" : "Work start" });
    if (isRealDate(item.dueDate)) events.push({ id: `${item.id}:due`, kind: "work-due", date: item.dueDate, title: item.title, detail: ru ? "Срок работы" : "Work deadline" });
  }
  for (const item of workspace.milestones) {
    if (item.projectId === projectId && !["done", "cancelled"].includes(item.status) && isRealDate(item.forecastDate)) events.push({
      id: item.id, kind: "milestone", date: item.forecastDate, title: item.title, detail: `${ru ? "Контрольная точка · прогноз" : "Milestone · forecast"}${item.owner ? ` · ${item.owner}` : ""}`,
    });
  }
  for (const item of workspace.risks) {
    if (item.projectId === projectId && item.status !== "closed" && isRealDate(item.reviewDate)) events.push({
      id: item.id, kind: "risk-review", date: item.reviewDate, title: item.title, detail: ru ? "Обзор риска" : "Risk review",
    });
  }
  return events.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}
