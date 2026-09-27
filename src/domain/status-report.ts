import type { Locale, Workspace } from "./schemas";

type Project = Workspace["projects"][number];

/** Build an editable local snapshot and its source-record references. */
export function buildStatusReport(
  workspace: Workspace,
  project: Project,
  locale: Locale,
  snapshotAt: string,
): { body: string; relatedIds: string[] } {
  const ru = locale === "ru";
  const t = (russian: string, english: string) => ru ? russian : english;
  const projectId = project.id;
  const work = workspace.workItems.filter(item => item.projectId === projectId && !item.archived);
  const milestones = workspace.milestones.filter(item => item.projectId === projectId);
  const risks = workspace.risks.filter(item => item.projectId === projectId && item.status !== "closed");
  const issues = workspace.issues.filter(item => item.projectId === projectId);
  const decisions = workspace.decisions.filter(item => item.projectId === projectId);
  const budgets = workspace.budgets.filter(item => item.projectId === projectId);
  const changes = workspace.changes.filter(item => item.projectId === projectId);
  const assumptions = workspace.assumptions.filter(item => item.projectId === projectId);
  const qualityGates = workspace.qualityGates.filter(item => item.projectId === projectId);
  const date = snapshotAt.slice(0, 10);
  const section = (title: string, rows: string[]) =>
    `## ${title}\n${rows.length ? rows.map(row => `- ${row}`).join("\n") : t("Нет записей", "No records")}\n`;
  const daysBetween = (baseline: string, forecast: string): number | undefined => {
    const start = Date.parse(`${baseline}T00:00:00Z`);
    const end = Date.parse(`${forecast}T00:00:00Z`);
    return Number.isFinite(start) && Number.isFinite(end)
      ? Math.round((end - start) / 86400000)
      : undefined;
  };
  const budgetTotal = (key: "planned" | "actual" | "committed" | "forecast") =>
    budgets.reduce((sum, item) => sum + (item[key] ?? 0), 0);
  const sourceRows = [
    ...work.filter(item => item.done || ["in-progress", "review", "ready"].includes(item.status) || item.blocked)
      .map(item => `Work ${item.id} — ${item.title}`),
    ...milestones.map(item => `Milestone ${item.id} — ${item.title}`),
    ...risks.map(item => `Risk ${item.id} — ${item.title}`),
    ...issues.filter(item => item.status !== "closed").map(item => `Issue ${item.id} — ${item.title}`),
    ...decisions.filter(item => item.status === "pending").map(item => `Decision ${item.id} — ${item.question}`),
  ];

  const body = [
    `# ${project.name} — ${t("Черновик статуса", "Status draft")}`,
    `**${t("Дата среза", "Snapshot date")}:** ${date}`,
    `**${t("Период отчёта", "Reporting period")}:** ${t("Уточнить перед отправкой", "Set before sharing")}`,
    section(t("Краткая сводка", "Executive summary"), [
      `${t("Статус", "Status")}: ${project.status}; ${t("здоровье (сроки / затраты / объём)", "health (schedule / cost / scope)")}: ${project.health.schedule} / ${project.health.cost} / ${project.health.scope}`,
      `${t("Цель", "Outcome")}: ${project.objective || t("не задана", "not set")}`,
    ]),
    section(t("Завершено", "Completed"), work.filter(item => item.done).map(item => item.title)),
    section(t("В работе", "Current work"), work.filter(item => ["in-progress", "review"].includes(item.status)).map(item => `${item.title}${item.owner ? ` — ${item.owner}` : ""}`)),
    section(t("Дальше", "Next up"), work.filter(item => item.status === "ready").map(item => `${item.title}${item.dueDate ? ` — ${item.dueDate}` : ""}`)),
    section(t("Контрольные точки и отклонения", "Milestones and variance"), milestones.map(item => {
      const variance = daysBetween(item.baselineDate, item.forecastDate);
      return `${item.title}: ${t("база", "baseline")} ${item.baselineDate}; ${t("прогноз", "forecast")} ${item.forecastDate}; ${t("факт", "actual")} ${item.actualDate || t("нет", "none")}${variance === undefined ? "" : `; ${t("отклонение, дней", "variance, days")} ${variance}`}`;
    })),
    section(t("Критические риски", "Critical risks"), risks.filter(item => item.impact * item.probability >= 15).map(item => {
      const exposure = item.probabilityPct !== undefined && item.impactAmount !== undefined
        ? `; ${t("валовая экспозиция", "gross exposure")} ${((item.probabilityPct / 100) * item.impactAmount).toFixed(2)} ${item.currency || project.currency}`
        : "";
      return `${item.title}${item.owner ? ` — ${item.owner}` : ""}; ${t("ответ", "response")}: ${item.actions || t("не задан", "not set")}${exposure}`;
    })),
    section(t("Проблемы", "Issues"), issues.filter(item => item.status !== "closed").map(item => `${item.title}${item.owner ? ` — ${item.owner}` : ""}${item.dueDate ? `; ${t("срок", "due")} ${item.dueDate}` : ""}`)),
    section(t("Нужны решения", "Decisions needed"), decisions.filter(item => item.status === "pending").map(item => `${item.question}${item.owner ? ` — ${item.owner}` : ""}${item.date ? `; ${t("целевая дата", "target date")} ${item.date}` : ""}`)),
    section(t("Нужна помощь / блокеры", "Help needed / blockers"), work.filter(item => item.blocked).map(item => `${item.title}: ${item.blockerReason || t("причина не указана", "reason not recorded")}`)),
    section(t("Бюджет: план / факт / обязательства / прогноз", "Budget: planned / actual / committed / forecast"), [
      `${budgetTotal("planned")} / ${budgetTotal("actual")} / ${budgetTotal("committed")} / ${budgetTotal("forecast")} ${project.currency}`,
      ...budgets.map(item => `${item.category}: ${item.planned} / ${item.actual} / ${item.committed} / ${item.forecast ?? t("нет прогноза", "no forecast")} ${project.currency}`),
    ]),
    section(t("Изменения на согласовании", "Changes awaiting approval"), changes.filter(item => item.status === "assessing").map(item => `${item.change}: ${item.reason}`)),
    section(t("Допущения на проверке", "Assumptions to validate"), assumptions.filter(item => item.status !== "validated" && item.status !== "invalidated").map(item => `${item.text}${item.validationDate ? `; ${t("проверить до", "validate by")} ${item.validationDate}` : ""}`)),
    section(t("Качество и выпуск", "Quality and release"), qualityGates.filter(item => item.status !== "passed").map(item => `${item.title}: ${item.status}${item.owner ? ` — ${item.owner}` : ""}`)),
    section(t("Исходные записи", "Source records"), sourceRows),
    t(
      "Снимок собран из локально сохранённых записей на указанную дату. Уточните период и проверьте формулировки до распространения.",
      "Snapshot assembled from locally stored records as of the date above. Set the reporting period and review wording before sharing.",
    ),
  ].join("\n");

  const relatedIds = [
    ...work.map(item => item.id), ...milestones.map(item => item.id), ...risks.map(item => item.id),
    ...issues.map(item => item.id), ...decisions.map(item => item.id), ...budgets.map(item => item.id),
    ...changes.map(item => item.id), ...assumptions.map(item => item.id), ...qualityGates.map(item => item.id),
  ];
  return { body, relatedIds };
}
