import { formatDate } from "./format-date";
import { dependencyConflicts } from "./planning";
import type { Locale, Project, Workspace, WorkItem } from "./schemas";

export type ActionSignal = {
  id: string;
  severity: "critical" | "high" | "medium";
  title: string;
  why: string;
  action: string;
  view: "work" | "planning" | "raid" | "people" | "finance" | "control";
};

const today = () => new Date().toISOString().slice(0, 10);
export function projectActions(
  workspace: Workspace,
  projectId: string,
  locale: Locale,
): ActionSignal[] {
  const ru = locale === "ru",
    items = workspace.workItems.filter(
      (x) => x.projectId === projectId && !x.archived,
    ),
    risks = workspace.risks.filter((x) => x.projectId === projectId),
    issues = workspace.issues.filter((x) => x.projectId === projectId),
    decisions = workspace.decisions.filter((x) => x.projectId === projectId),
    milestones = workspace.milestones.filter((x) => x.projectId === projectId),
    assumptions = workspace.assumptions.filter(
      (x) => x.projectId === projectId,
    ),
    quality = workspace.qualityGates.filter((x) => x.projectId === projectId);
  const out: ActionSignal[] = [];
  items
    .filter((x) => x.blocked && !x.done)
    .forEach((x) =>
      out.push({
        id: `block-${x.id}`,
        severity: "critical",
        title: `${ru ? "Снять блокировку" : "Unblock"}: ${x.title}`,
        why: x.blockerReason || (ru ? "Работа остановлена" : "Work is stopped"),
        action: ru
          ? "Назначить решение, владельца и срок эскалации."
          : "Assign a decision, owner, and escalation date.",
        view: "work",
      }),
    );
  issues
    .filter((x) => x.status !== "closed" && x.dueDate && x.dueDate < today())
    .forEach((x) =>
      out.push({
        id: `issue-${x.id}`,
        severity: "critical",
        title: `${ru ? "Просроченная проблема" : "Overdue issue"}: ${x.title}`,
        why: `${ru ? "Срок" : "Due"}: ${x.dueDate}`,
        action: ru
          ? "Обновить план восстановления или эскалировать."
          : "Update the recovery plan or escalate.",
        view: "raid",
      }),
    );
  decisions
    .filter((x) => x.status === "pending" && x.date && x.date < today())
    .forEach((x) =>
      out.push({
        id: `decision-${x.id}`,
        severity: "high",
        title: `${ru ? "Нужно решение" : "Decision needed"}: ${x.question}`,
        why: `${ru ? "Владелец" : "Owner"}: ${x.owner || "—"}`,
        action: ru
          ? "Отправить пакет для решения: варианты, рекомендацию и последствия бездействия."
          : "Send a decision pack: options, recommendation, and consequence of no action.",
        view: "raid",
      }),
    );
  risks
    .filter((x) => x.status !== "closed" && x.probability * x.impact >= 15)
    .forEach((x) =>
      out.push({
        id: `risk-${x.id}`,
        severity: "high",
        title: `${ru ? "Высокая экспозиция" : "High exposure"}: ${x.title}`,
        why: `P × I = ${x.probability * x.impact}`,
        action: ru
          ? "Проверить условие срабатывания, меры реагирования, владельца и остаточный риск."
          : "Review trigger, response, owner, and residual risk.",
        view: "raid",
      }),
    );
  milestones
    .filter((x) => x.status === "at-risk")
    .forEach((x) =>
      out.push({
        id: `milestone-${x.id}`,
        severity: "high",
        title: `${ru ? "Контрольная точка под риском" : "Milestone at risk"}: ${x.title}`,
        why: `${x.progress}% · ${formatDate(x.date, locale)}`,
        action: ru
          ? "Пересчитать критическую цепочку и предложить допустимые компромиссы."
          : "Recalculate the critical chain and offer trade-offs.",
        view: "planning",
      }),
    );
  assumptions
    .filter((x) => x.status === "untested" && x.validationDate && x.validationDate <= today())
    .forEach((x) =>
      out.push({
        id: `assumption-${x.id}`,
        severity: "medium",
        title: `${ru ? "Непроверенное допущение" : "Untested assumption"}: ${x.text}`,
        why: x.effectIfFalse,
        action: ru
          ? "Провести минимальную проверку до нового обязательства."
          : "Run the smallest validation before a new commitment.",
        view: "raid",
      }),
    );
  quality
    .filter((x) => x.status === "failed")
    .forEach((x) =>
      out.push({
        id: `quality-${x.id}`,
        severity: "critical",
        title: `${ru ? "Контроль качества не пройден" : "Quality gate failed"}: ${x.title}`,
        why: x.evidence,
        action: ru
          ? "Не выпускать результат до решения или явного принятия риска."
          : "Do not release until resolved or risk is explicitly accepted.",
        view: "control",
      }),
    );
  const unowned = items.filter((x) => !x.done && !x.owner);
  if (unowned.length)
    out.push({
      id: "unowned",
      severity: "medium",
      title: ru
        ? `${unowned.length} элементов без владельца`
        : `${unowned.length} unowned items`,
      why: ru
        ? "Без владельца нет управляемого обязательства."
        : "Without ownership there is no managed commitment.",
      action: ru
        ? "Назначить владельца или убрать элемент из активного горизонта."
        : "Assign an owner or remove the item from the active horizon.",
      view: "work",
    });
  dependencyConflicts(workspace, projectId).forEach((conflict) =>
    out.push({
      id: `dependency-${conflict.id}`,
      severity: "high",
      title: `${ru ? "Конфликт зависимости" : "Dependency conflict"}: ${conflict.from} → ${conflict.to}`,
      why: conflict.missing
        ? ru
          ? "Связанная работа недоступна."
          : "Linked work is unavailable."
        : `${conflict.type} · ${conflict.days} ${ru ? "дн. нарушения связи" : "days of timing conflict"}`,
      action: ru
        ? "Согласовать даты или уточнить тип связи и лаг."
        : "Align dates or review relationship type and lag.",
      view: "planning",
    }),
  );
  workspace.changes
    .filter((x) => x.projectId === projectId && x.status === "assessing")
    .forEach((x) =>
      out.push({
        id: `change-${x.id}`,
        severity: "high",
        title: `${ru ? "Согласовать изменение" : "Approve change"}: ${x.change}`,
        why: x.reason,
        action: ru
          ? "Сравнить влияние на сроки, стоимость и объём; зафиксировать решение."
          : "Compare schedule, cost and scope impact; record the decision.",
        view: "control",
      }),
    );
  return out.sort(
    (a, b) =>
      ({ critical: 0, high: 1, medium: 2 })[a.severity] -
      { critical: 0, high: 1, medium: 2 }[b.severity],
  );
}

export function projectCompleteness(workspace: Workspace, projectId: string) {
  const p = workspace.projects.find((x) => x.id === projectId);
  if (!p) return { score: 0, passed: 0, total: 1, gaps: ["project"] };
  const items = workspace.workItems.filter(
    (x) => x.projectId === projectId && !x.archived,
  );
  const committed = items.filter((x) => x.status !== "backlog");
  const checks: Array<[boolean, string]> = [
    [Boolean(p.purpose), "purpose"],
    [Boolean(p.objective), "outcome"],
    [p.successMeasures.length > 0, "success measures"],
    [Boolean(p.owner), "project owner"],
    [Boolean(p.sponsor), "sponsor"],
    [Boolean(p.scopeIn), "scope in"],
    [Boolean(p.scopeOut), "scope out"],
    [Boolean(p.definitionOfDone), "definition of done"],
    [items.length > 0, "work breakdown"],
    [
      items.length > 0 && items.every((x) => Boolean(x.owner) || x.status === "backlog"),
      "work ownership",
    ],
    [
      committed.length > 0 && committed.every((x) => x.acceptanceCriteria.length > 0),
      "acceptance criteria",
    ],
    [workspace.risks.some((x) => x.projectId === projectId), "risk review"],
    [workspace.stakeholders.some((x) => x.projectId === projectId), "stakeholders"],
    [workspace.milestones.some((x) => x.projectId === projectId), "milestones"],
  ];
  const passed = checks.filter(([ok]) => ok).length;
  return {
    score: Math.round((passed / checks.length) * 100),
    passed,
    total: checks.length,
    gaps: checks.filter(([ok]) => !ok).map(([, name]) => name),
  };
}

const median = (values: number[]) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]!
    : (sorted[middle - 1]! + sorted[middle]!) / 2;
};

/**
 * Flow metrics use only evidence that the current schema actually stores.
 * `createdAt → completedAt` is lead time, not cycle time. True cycle time remains unknown
 * until a future additive schema records a reliable startedAt/status history.
 */
export function flowMetrics(items: WorkItem[], asOf = new Date().toISOString()) {
  const asOfMs = Date.parse(asOf);
  if (!Number.isFinite(asOfMs)) throw new Error("Invalid flow metric date");
  const active = items.filter((x) => !x.archived),
    done = active.filter((x) => x.done),
    wip = active.filter((x) => x.status === "in-progress" || x.status === "review"),
    completed = done.filter((x) => x.completedAt && Number.isFinite(Date.parse(x.completedAt))),
    leadDays = completed
      .map((x) => {
        const created = Date.parse(x.createdAt),
          completedAt = Date.parse(x.completedAt!);
        return Number.isFinite(created) && completedAt >= created
          ? (completedAt - created) / 86400000
          : null;
      })
      .filter((value): value is number => value !== null),
    completedWithin = (days: number) =>
      completed.filter((x) => {
        const completedAt = Date.parse(x.completedAt!);
        return completedAt <= asOfMs && completedAt > asOfMs - days * 86400000;
      }).length;
  const completed7 = completedWithin(7),
    completed14 = completedWithin(14),
    completed28 = completedWithin(28);
  return {
    wip: wip.length,
    blocked: active.filter((x) => x.blocked && !x.done).length,
    completedTotal: done.length,
    completed7,
    completed14,
    completed28,
    throughput7: completed7 / 7,
    throughput14: completed14 / 14,
    throughput28: completed28 / 28,
    /** @deprecated Use throughput28. Kept temporarily for compatibility. */
    throughput: completed28 / 28,
    averageLeadDays: leadDays.length
      ? leadDays.reduce((sum, value) => sum + value, 0) / leadDays.length
      : null,
    medianLeadDays: median(leadDays),
    cycleTimeDays: null as number | null,
    cycleTimeReason: "startedAt/status history is not available in schema v6",
  };
}

export function portfolioSummary(workspace: Workspace, project: Project) {
  const items = workspace.workItems.filter(
      (x) => x.projectId === project.id && !x.archived,
    ),
    budget = workspace.budgets.filter((x) => x.projectId === project.id),
    actions = projectActions(workspace, project.id, workspace.locale),
    planned = budget.reduce((s, x) => s + x.planned, 0),
    forecast = budget.reduce(
      (s, x) => s + (x.forecast ?? x.actual + x.committed),
      0,
    ),
    coverage = projectCompleteness(workspace, project.id);
  return {
    progress: Math.round(
      (items.filter((x) => x.done).length / Math.max(1, items.length)) * 100,
    ),
    open: items.filter((x) => !x.done).length,
    critical: actions.filter((x) => x.severity === "critical").length,
    planned,
    forecast,
    completeness: coverage.score,
    covered: coverage.passed,
    total: coverage.total,
  };
}
