import { projectFinancials } from "./finance";
import type { Project, Workspace, WorkItem } from "./schemas";
import { projectActions } from "./action-signals";
export { projectActions, type ActionSignal } from "./action-signals";

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
const percentile = (values: number[], p: number) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(p * sorted.length) - 1)]!;
};

/**
 * Flow metrics are evidence-based. Legacy records without a stored work-start transition stay unknown.
 * New status transitions persist `startedAt` and `statusHistory`, enabling prospective cycle/aging metrics.
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
        const created = Date.parse(x.createdAt), completedAt = Date.parse(x.completedAt!);
        return Number.isFinite(created) && completedAt >= created
          ? (completedAt - created) / 86400000
          : null;
      })
      .filter((value): value is number => value !== null),
    cycleDays = completed
      .map((x) => {
        if (!x.startedAt) return null;
        const started = Date.parse(x.startedAt), completedAt = Date.parse(x.completedAt!);
        return Number.isFinite(started) && completedAt >= started
          ? (completedAt - started) / 86400000
          : null;
      })
      .filter((value): value is number => value !== null),
    agingWip = wip
      .map((x) => {
        if (!x.startedAt) return null;
        const started = Date.parse(x.startedAt);
        return Number.isFinite(started) && asOfMs >= started
          ? { id: x.id, ageDays: (asOfMs - started) / 86400000 }
          : null;
      })
      .filter((value): value is { id: string; ageDays: number } => value !== null)
      .sort((a, b) => b.ageDays - a.ageDays),
    completedWithin = (days: number) =>
      completed.filter((x) => {
        const completedAt = Date.parse(x.completedAt!);
        return completedAt <= asOfMs && completedAt > asOfMs - days * 86400000;
      }).length;
  const completed7 = completedWithin(7), completed14 = completedWithin(14), completed28 = completedWithin(28);
  const percentileReady = cycleDays.length >= 10;
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
    cycleSampleSize: cycleDays.length,
    averageCycleDays: cycleDays.length
      ? cycleDays.reduce((sum, value) => sum + value, 0) / cycleDays.length
      : null,
    medianCycleDays: median(cycleDays),
    p80CycleDays: percentileReady ? percentile(cycleDays, 0.8) : null,
    p90CycleDays: percentileReady ? percentile(cycleDays, 0.9) : null,
    /** @deprecated Use medianCycleDays/sample fields. */
    cycleTimeDays: median(cycleDays),
    cycleTimeReason: cycleDays.length ? null : "No reliable stored startedAt evidence for completed work",
    agingWip,
    agingWipKnown: agingWip.length,
    agingWipUnknown: wip.length - agingWip.length,
    medianWipAgeDays: median(agingWip.map((item) => item.ageDays)),
    maxWipAgeDays: agingWip.length ? agingWip[0]!.ageDays : null,
  };
}

export function portfolioSummary(workspace: Workspace, project: Project) {
  const items = workspace.workItems.filter(
      (x) => x.projectId === project.id && !x.archived,
    ),
    actions = projectActions(workspace, project.id, workspace.locale),
    { planned, forecast } = projectFinancials(workspace, project.id),
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
