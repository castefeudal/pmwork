import type { Locale, Workspace } from "@/domain/schemas";
import type { WorkspaceView } from "./workspace-types";

/** A live index of project records, not a synthetic health score. */
export function ProjectAtlas({ workspace, projectId, locale, onView }: {
  workspace: Workspace; projectId: string; locale: Locale; onView: (view: WorkspaceView) => void;
}) {
  const ru = locale === "ru";
  const work = workspace.workItems.filter(item => item.projectId === projectId && !item.archived);
  const done = work.filter(item => item.status === "done").length;
  const risks = workspace.risks.filter(item => item.projectId === projectId && item.status !== "closed").length;
  const milestones = workspace.milestones.filter(item => item.projectId === projectId && item.status !== "done" && item.status !== "cancelled").length;
  const rows = [
    { code: "01", label: ru ? "Работа" : "Work", value: work.length - done, detail: ru ? `${done} из ${work.length} завершено` : `${done} of ${work.length} completed`, view: "work" as const },
    { code: "02", label: ru ? "Открытые риски" : "Open risks", value: risks, detail: ru ? "Проверить реакции" : "Review responses", view: "raid" as const },
    { code: "03", label: ru ? "Контрольные точки" : "Milestones", value: milestones, detail: ru ? "Открыть маршрут" : "Open the schedule", view: "planning" as const },
  ];
  return <section className="project-atlas" aria-label={ru ? "Карта проекта" : "Project map"}>
    <div className="project-atlas-intro"><span className="eyebrow">{ru ? "АТЛАС ПРОЕКТА" : "PROJECT ATLAS"}</span><svg viewBox="0 0 220 88" fill="none" aria-hidden="true"><path className="atlas-index-grid" d="M0 20H220M0 44H220M0 68H220M30 0V88M80 0V88M130 0V88M180 0V88"/><path className="atlas-index-route" d="M8 68H48L80 44H130L166 20H212"/><path className="atlas-index-branch" d="M80 44 114 72H190"/>{[[8,68],[80,44],[130,44],[166,20],[212,20]].map(([x,y])=><circle key={x} cx={x} cy={y} r="4" className="atlas-index-node"/>)}</svg><small>{ru ? "Записи → связи → действия" : "Records → links → action"}</small></div>
    {rows.map(row => <button className="atlas-index" key={row.code} onClick={() => onView(row.view)}><span className="atlas-index-head"><span><span className="atlas-index-code" aria-hidden="true">{row.code} / </span>{row.label}</span><span aria-hidden="true">↗</span></span><strong>{row.value}</strong><small>{row.detail}</small></button>)}
  </section>;
}
