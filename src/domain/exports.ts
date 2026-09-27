import type { Locale, Workspace } from "./schemas";

export type CsvCollection = "work" | "risks" | "issues" | "decisions" | "milestones" | "budget";
type CsvColumn = { key: string; label: [string, string] };

const columns: Record<CsvCollection, CsvColumn[]> = {
  work: [
    { key: "id", label: ["ID", "ID"] }, { key: "title", label: ["Название", "Title"] },
    { key: "type", label: ["Тип", "Type"] }, { key: "status", label: ["Статус", "Status"] },
    { key: "priority", label: ["Приоритет", "Priority"] }, { key: "owner", label: ["Владелец", "Owner"] },
    { key: "startDate", label: ["Начало", "Start date"] }, { key: "dueDate", label: ["Срок", "Due date"] },
    { key: "originalEstimate", label: ["Исходная оценка", "Original estimate"] },
    { key: "currentEstimate", label: ["Текущая оценка", "Current estimate"] },
    { key: "actualEffort", label: ["Факт трудоёмкости", "Actual effort"] },
    { key: "milestone", label: ["Контрольная точка", "Milestone"] }, { key: "blocked", label: ["Блокер", "Blocked"] },
  ],
  risks: [
    { key: "id", label: ["ID", "ID"] }, { key: "title", label: ["Риск", "Risk"] },
    { key: "category", label: ["Категория", "Category"] }, { key: "probability", label: ["Вероятность 1–5", "Probability 1–5"] },
    { key: "impact", label: ["Влияние 1–5", "Impact 1–5"] }, { key: "heuristic", label: ["P × I · эвристика", "P × I · heuristic"] },
    { key: "owner", label: ["Владелец", "Owner"] }, { key: "trigger", label: ["Триггер", "Trigger"] },
    { key: "actions", label: ["Ответ", "Response"] }, { key: "reviewDate", label: ["Дата обзора", "Review date"] },
    { key: "grossExposure", label: ["Денежная экспозиция", "Monetary exposure"] },
    { key: "residualExposure", label: ["Остаточная экспозиция", "Residual exposure"] },
    { key: "currency", label: ["Валюта", "Currency"] }, { key: "status", label: ["Статус", "Status"] },
  ],
  issues: [
    { key: "id", label: ["ID", "ID"] }, { key: "title", label: ["Проблема", "Issue"] },
    { key: "description", label: ["Описание", "Description"] }, { key: "impact", label: ["Влияние", "Impact"] },
    { key: "urgency", label: ["Срочность", "Urgency"] }, { key: "owner", label: ["Владелец", "Owner"] },
    { key: "dueDate", label: ["Срок", "Due date"] }, { key: "plan", label: ["План", "Plan"] },
    { key: "escalation", label: ["Эскалация", "Escalation"] }, { key: "relatedRiskId", label: ["Связанный риск", "Related risk"] },
    { key: "status", label: ["Статус", "Status"] },
  ],
  decisions: [
    { key: "id", label: ["ID", "ID"] }, { key: "question", label: ["Вопрос", "Question"] },
    { key: "context", label: ["Контекст", "Context"] }, { key: "alternatives", label: ["Альтернативы", "Alternatives"] },
    { key: "criteria", label: ["Критерии", "Criteria"] }, { key: "decision", label: ["Решение", "Decision"] },
    { key: "rationale", label: ["Обоснование", "Rationale"] }, { key: "owner", label: ["Владелец", "Owner"] },
    { key: "date", label: ["Дата", "Date"] }, { key: "consequences", label: ["Последствия", "Consequences"] },
    { key: "revisitTrigger", label: ["Условие пересмотра", "Revisit trigger"] }, { key: "status", label: ["Статус", "Status"] },
  ],
  milestones: [
    { key: "id", label: ["ID", "ID"] }, { key: "title", label: ["Контрольная точка", "Milestone"] },
    { key: "owner", label: ["Владелец", "Owner"] }, { key: "baselineDate", label: ["Базовая дата", "Baseline date"] },
    { key: "forecastDate", label: ["Прогноз", "Forecast"] }, { key: "actualDate", label: ["Факт", "Actual"] },
    { key: "varianceDays", label: ["Отклонение, дни", "Variance, days"] }, { key: "confidence", label: ["Уверенность, %", "Confidence, %"] },
    { key: "progress", label: ["Прогресс, %", "Progress, %"] }, { key: "status", label: ["Статус", "Status"] },
  ],
  budget: [
    { key: "id", label: ["ID", "ID"] }, { key: "category", label: ["Категория", "Category"] },
    { key: "planned", label: ["План", "Planned"] }, { key: "committed", label: ["Обязательства", "Committed"] },
    { key: "actual", label: ["Факт", "Actual"] }, { key: "forecast", label: ["Прогноз", "Forecast"] },
    { key: "variance", label: ["Отклонение плана от прогноза", "Plan less forecast"] },
  ],
};

function spreadsheetSafe(value: unknown): string {
  let text = value === null || value === undefined ? "" : Array.isArray(value) ? value.join("; ") : String(value);
  // Spreadsheet applications may execute untrusted CSV values as formulas.
  if (/^[\s\u0000-\u001f]*[=+@-]/u.test(text)) text = `'${text}`;
  return /[",\r\n]/u.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function daysBetween(start: string, end: string): number | "" {
  const a = Date.parse(`${start}T00:00:00Z`), b = Date.parse(`${end}T00:00:00Z`);
  return Number.isFinite(a) && Number.isFinite(b) ? Math.round((b - a) / 86400000) : "";
}

export function projectCsv(workspace: Workspace, projectId: string, kind: CsvCollection, locale: Locale): string {
  const rows: Record<string, unknown>[] = [];
  if (kind === "work") {
    for (const item of workspace.workItems.filter(x => x.projectId === projectId && !x.archived)) rows.push({
      ...item, originalEstimate: item.originalEstimate ?? "", currentEstimate: item.currentEstimate ?? item.estimate ?? "",
      milestone: workspace.milestones.find(m => m.id === item.milestoneId)?.title ?? "", blocked: item.blocked ? "Yes" : "No",
    });
  } else if (kind === "risks") {
    for (const x of workspace.risks.filter(x => x.projectId === projectId)) {
      const gross = x.probabilityPct !== undefined && x.impactAmount !== undefined ? x.probabilityPct / 100 * x.impactAmount : "";
      const residual = x.residualProbabilityPct !== undefined && x.residualImpactAmount !== undefined ? x.residualProbabilityPct / 100 * x.residualImpactAmount : "";
      rows.push({ ...x, heuristic: x.probability * x.impact, grossExposure: gross, residualExposure: residual });
    }
  } else if (kind === "issues") rows.push(...workspace.issues.filter(x => x.projectId === projectId));
  else if (kind === "decisions") rows.push(...workspace.decisions.filter(x => x.projectId === projectId));
  else if (kind === "milestones") rows.push(...workspace.milestones.filter(x => x.projectId === projectId).map(x => ({ ...x, varianceDays: daysBetween(x.baselineDate, x.forecastDate) })));
  else rows.push(...workspace.budgets.filter(x => x.projectId === projectId).map(x => ({ ...x, variance: x.forecast === undefined ? "" : x.planned - x.forecast })));
  return `\uFEFF${columns[kind].map(x => spreadsheetSafe(x.label[locale === "ru" ? 0 : 1])).join(",")}\r\n${rows.map(row => columns[kind].map(column => spreadsheetSafe(row[column.key])).join(",")).join("\r\n")}`;
}

type CalendarExportEvent = { uid: string; date: string; summary: string; description: string; kind: string; stamp: string };
const validDay = (day: string) => /^\d{4}-\d{2}-\d{2}$/u.test(day) && Number.isFinite(Date.parse(`${day}T00:00:00Z`)) && new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10) === day;
const escapeIcs = (value: string) => value.replaceAll("\\", "\\\\").replaceAll("\r\n", "\n").replaceAll("\r", "\n").replaceAll("\n", "\\n").replaceAll(";", "\\;").replaceAll(",", "\\,");
function foldLine(line: string): string {
  const encoder = new TextEncoder();
  const chunks: string[] = [];
  let current = "", bytes = 0;
  for (const character of line) {
    const size = encoder.encode(character).length;
    if (bytes + size > 73 && current) { chunks.push(current); current = " "; bytes = 1; }
    current += character; bytes += size;
  }
  chunks.push(current);
  return chunks.join("\r\n");
}
const nextDay = (day: string) => {
  const date = new Date(`${day}T00:00:00Z`); date.setUTCDate(date.getUTCDate() + 1); return date.toISOString().slice(0, 10).replaceAll("-", "");
};
const icsDay = (day: string) => day.replaceAll("-", "");

export function projectCalendarIcs(workspace: Workspace, projectId: string, locale: Locale): string {
  const ru = locale === "ru", events: CalendarExportEvent[] = [];
  const add = (event: CalendarExportEvent) => { if (validDay(event.date)) events.push(event); };
  for (const x of workspace.workItems.filter(x => x.projectId === projectId && !x.archived && !x.done && x.dueDate)) add({
    uid: `work-${x.id}`, date: x.dueDate!, summary: `${ru ? "Срок" : "Due"}: ${x.title}`,
    description: [x.owner && `${ru ? "Владелец" : "Owner"}: ${x.owner}`, x.blockerReason && `${ru ? "Блокер" : "Blocker"}: ${x.blockerReason}`].filter(Boolean).join("\n"),
    kind: "WORK_DEADLINE", stamp: x.updatedAt || x.createdAt,
  });
  for (const x of workspace.milestones.filter(x => x.projectId === projectId && !["done", "cancelled"].includes(x.status))) add({
    uid: `milestone-${x.id}`, date: x.forecastDate, summary: `${ru ? "Контрольная точка" : "Milestone"}: ${x.title}`,
    description: `${ru ? "Базовая дата" : "Baseline date"}: ${x.baselineDate}${x.owner ? `\n${ru ? "Владелец" : "Owner"}: ${x.owner}` : ""}`,
    kind: "MILESTONE", stamp: x.updatedAt || x.createdAt,
  });
  for (const x of workspace.risks.filter(x => x.projectId === projectId && x.status !== "closed" && x.reviewDate)) add({
    uid: `risk-review-${x.id}`, date: x.reviewDate, summary: `${ru ? "Обзор риска" : "Risk review"}: ${x.title}`,
    description: [x.owner && `${ru ? "Владелец" : "Owner"}: ${x.owner}`, x.trigger && `${ru ? "Триггер" : "Trigger"}: ${x.trigger}`].filter(Boolean).join("\n"),
    kind: "RISK_REVIEW", stamp: new Date().toISOString(),
  });
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//PMWORK//Local Project Calendar//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
  for (const event of events) {
    const stamp = Date.parse(event.stamp);
    const dtstamp = Number.isFinite(stamp) ? new Date(stamp).toISOString().replaceAll("-", "").replaceAll(":", "").replace(/\.\d{3}/u, "") : "19700101T000000Z";
    lines.push("BEGIN:VEVENT", `UID:${escapeIcs(event.uid)}@pmwork.local`, `DTSTAMP:${dtstamp}`, `DTSTART;VALUE=DATE:${icsDay(event.date)}`, `DTEND;VALUE=DATE:${nextDay(event.date)}`, `SUMMARY:${escapeIcs(event.summary)}`, `DESCRIPTION:${escapeIcs(event.description)}`, `CATEGORIES:${event.kind}`, "END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return `${lines.map(foldLine).join("\r\n")}\r\n`;
}
