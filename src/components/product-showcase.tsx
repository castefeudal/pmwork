"use client";

import { useState, type CSSProperties } from "react";
import { ArrowUpRight, CalendarDays, Check, CircleAlert, CircleCheck, Clock3, Command, FileText, LayoutDashboard, ListChecks, ShieldCheck, Sparkles } from "lucide-react";
import type { Decision, Locale, Risk, WorkItem, Workspace } from "@/domain/schemas";
import { formatDate } from "@/domain/format-date";
import { displayLabel } from "@/content/workspace-i18n";

type ShowcaseView = "overview" | "delivery" | "decisions";
type PreviewWorkItem = Pick<WorkItem, "id" | "title" | "status" | "owner" | "dueDate" | "priority" | "blocked" | "blockerReason" | "done">;
type ShowcasePreview = {
  project: { name: string; objective: string };
  work: PreviewWorkItem[];
  risks: Pick<Risk, "id" | "title" | "trigger" | "status">[];
  decisions: Pick<Decision, "id" | "question" | "context" | "status">[];
  milestones: Pick<Workspace["milestones"][number], "title" | "forecastDate" | "status" | "progress" | "confidence">[];
};

const viewCopy = {
  ru: {
    app: "Рабочее пространство", saved: "Демо · локальные данные", views: ["Обзор", "Работа", "Решения"],
    openWork: "Открытая работа", blockers: "Блокеры", decisions: "Решения на рассмотрении",
    records: "записей проекта", byStatus: "Работа по статусу", milestone: "Контрольная точка",
    forecast: "Прогноз", progress: "Готово", confidence: "Уверенность", signal: "Блокер", risk: "Основание риска", inspect: "Открыть запись",
    owner: "Владелец", noOwner: "Не назначен", objective: "Цель проекта",
    columns: ["Следующая", "В работе", "Готово"], statuses: ["backlog", "in-progress", "done"],
    waiting: "Ожидает решения", pending: "Ожидает решения", recorded: "Исходная запись демо-проекта",
    insight: "Демо-проект · каждый сигнал ведёт к исходной записи.", local: "Локально и приватно",
    sample: "ДЕМО · ПРОЕКТНЫЕ ДАННЫЕ", date: "СРОК", noMilestone: "Контрольная точка не задана",
  },
  en: {
    app: "Project workspace", saved: "Demo · local data", views: ["Overview", "Work", "Decisions"],
    openWork: "Open work", blockers: "Blockers", decisions: "Open decisions",
    records: "project records", byStatus: "Work by status", milestone: "Milestone",
    forecast: "Forecast", progress: "Complete", confidence: "Confidence", signal: "Blocker", risk: "Risk evidence", inspect: "Open source record",
    owner: "Owner", noOwner: "Unassigned", objective: "Project objective",
    columns: ["Up next", "In progress", "Done"], statuses: ["backlog", "in-progress", "done"],
    waiting: "Waiting for a decision", pending: "Pending", recorded: "Source record from the demo project",
    insight: "Demo project · every signal links to a source record.", local: "Local by design",
    sample: "DEMO · PROJECT DATA", date: "DUE", noMilestone: "No milestone recorded",
  },
} as const;

export function ProductShowcase({ locale, preview }: { locale: Locale; preview: ShowcasePreview }) {
  const t = viewCopy[locale];
  const [view, setView] = useState<ShowcaseView>("overview");
  const { project, work, risks, decisions, milestones } = preview;
  const blocker = work.find((item) => item.blocked);
  const projectRisks = risks;
  const pendingDecisions = decisions.filter((item) => item.status === "pending");
  const upcoming = milestones
    .filter((item) => item.status !== "done" && item.status !== "cancelled")
    .sort((a, b) => a.forecastDate.localeCompare(b.forecastDate))[0];
  const [overview, delivery, decisionView] = t.views;
  const options: { id: ShowcaseView; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "overview", label: overview, icon: LayoutDashboard },
    { id: "delivery", label: delivery, icon: ListChecks },
    { id: "decisions", label: decisionView, icon: FileText },
  ];
  const statusGroups: { label: string; statuses: readonly string[]; items: PreviewWorkItem[] }[] = t.statuses.map((status, index) => ({
    label: t.columns[index],
    statuses: index === 0 ? ["backlog", "ready"] : index === 1 ? ["in-progress", "review"] : [status],
    items: [],
  }));
  for (const item of work) {
    const group = statusGroups.find((candidate) => candidate.statuses.includes(item.status));
    group?.items.push(item);
  }

  return (
    <div className="product-showcase" id="product-preview" aria-label={locale === "ru" ? "Интерактивный демо-проект PMWORK" : "Interactive PMWORK demo project"}>
      <div className="showcase-windowbar" aria-hidden="true">
        <div className="window-dots"><i /><i /><i /></div>
        <span>PMWORK <span className="window-divider">/</span> {t.app}</span>
        <span className="showcase-saved"><span />{t.saved}</span>
      </div>
      <div className="showcase-workspace">
        <aside className="showcase-sidebar" aria-hidden="true">
          <div className="showcase-project-mark">M</div>
          <span className="showcase-side-active"><LayoutDashboard size={16} /></span>
          <span><ListChecks size={16} /></span>
          <span><CalendarDays size={16} /></span>
          <span><ShieldCheck size={16} /></span>
          <span><FileText size={16} /></span>
        </aside>
        <div className="showcase-content">
          <div className="showcase-projectline">
            <div><span className="showcase-crumb">{project.name}</span><p>{t.sample}</p></div>
            <span className="showcase-search"><Command size={13} /> K</span>
          </div>
          <div className="showcase-tabs" role="group" aria-label={locale === "ru" ? "Раздел демо-проекта" : "Demo project view"}>
            {options.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" className={view === id ? "active" : ""} aria-pressed={view === id} onClick={() => setView(id)}>
                <Icon size={14} aria-hidden="true" />{label}
              </button>
            ))}
          </div>
          <div className="showcase-panel" key={view} aria-live="polite" aria-atomic="true">
            {view === "overview" && <>
              <div className="showcase-welcome"><div><h2>{project.name}</h2><p>{project.objective}</p></div><span className="showcase-date"><CalendarDays size={13} /> {t.sample}</span></div>
              <div className="showcase-metrics">
                {[
                  { label: t.openWork, value: work.filter((item) => !item.done).length, note: `${work.length} ${t.records}`, color: "teal" },
                  { label: t.blockers, value: work.filter((item) => item.blocked).length, note: t.signal, color: "amber" },
                  { label: t.decisions, value: pendingDecisions.length, note: projectRisks.length ? `${projectRisks.length} ${t.risk.toLocaleLowerCase(locale)}` : t.pending, color: "blue" },
                ].map((item) => <article className="showcase-metric" key={item.label}><span>{item.label}</span><div><strong>{item.value}</strong><small className={`metric-${item.color}`}>{item.note}</small></div></article>)}
              </div>
              <div className="showcase-lower-grid">
                <article className="showcase-card showcase-workload">
                  <div className="showcase-card-head"><div><strong>{t.byStatus}</strong><span>{work.length} {t.records}</span></div><span className="showcase-open" aria-hidden="true"><ArrowUpRight size={15} /></span></div>
                  <div className="showcase-work-bars" role="img" aria-label={statusGroups.map((group) => `${group.label}: ${group.items.length}`).join(", ")}>
                    {statusGroups.map((group) => <span key={group.label} style={{ "--bar": `${Math.max(10, (group.items.length / Math.max(1, work.length)) * 100)}%` } as CSSProperties} />)}
                  </div>
                  <div className="showcase-week">{statusGroups.map((group) => <span key={group.label}>{group.label} · {group.items.length}</span>)}</div>
                </article>
                <article className="showcase-card showcase-next"><span className="showcase-icon"><CalendarDays size={15} /></span><span className="showcase-mini-label">{t.milestone}</span><strong>{upcoming?.title ?? t.noMilestone}</strong><span className="showcase-date-note"><Clock3 size={12} />{t.forecast}: {upcoming ? formatDate(upcoming.forecastDate, locale) : "—"}</span><div className="showcase-progress"><span style={{ width: `${upcoming?.progress ?? 0}%` }} /></div><small>{upcoming ? `${displayLabel(locale, "milestoneStatus", upcoming.status)} · ${t.progress.toLocaleLowerCase(locale)} ${upcoming.progress}% · ${t.confidence.toLocaleLowerCase(locale)} ${upcoming.confidence ?? "—"}%` : t.noMilestone}</small></article>
              </div>
              {blocker && <div className="showcase-signal"><span className="showcase-alert-icon"><CircleAlert size={15} /></span><div><strong>{t.signal}: {blocker.title}</strong><span>{blocker.blockerReason}</span></div><span className="showcase-signal-tag">{displayLabel(locale, "priority", blocker.priority)}</span></div>}
            </>}
            {view === "delivery" && <>
              <div className="showcase-welcome"><div><h2>{project.name}</h2><p>{t.objective}: {project.objective}</p></div><span className="showcase-date"><ListChecks size={13} /> {work.length} {t.records}</span></div>
              <div className="showcase-board">{statusGroups.map((group) => <div className="showcase-board-column" key={group.label}><div className="showcase-board-label"><span>{group.label}</span><b>{group.items.length}</b></div>{group.items.slice(0, 3).map((item) => <div className={`showcase-board-card ${item.blocked ? "board-card-1" : item.done ? "board-card-2" : ""}`} key={item.id}><span>{item.blocked ? <CircleAlert size={13} /> : item.done ? <CircleCheck size={13} /> : <span className="showcase-card-dot" />}</span><strong>{item.title}</strong><div><i>{item.owner || t.noOwner}</i><small>{formatDate(item.dueDate, locale)}</small></div></div>)}</div>)}</div>
              <div className="showcase-inline-note"><Check size={15} /><span>{locale === "ru" ? "Задачи, владельцы и сроки взяты из демо-проекта." : "Work items, owners, and dates come from the bundled demo project."}</span></div>
            </>}
            {view === "decisions" && <>
              <div className="showcase-welcome"><div><h2>{locale === "ru" ? "Решения и основания" : "Decisions and evidence"}</h2><p>{project.name}</p></div><span className="showcase-date"><FileText size={13} /> {t.sample}</span></div>
              <div className="showcase-decision-list">
                {pendingDecisions.slice(0, 2).map((decision) => <article className="showcase-decision showcase-decision-open" key={decision.id}><span className="showcase-decision-icon"><Clock3 size={16} /></span><div><span className="showcase-mini-label">{decision.id} · {t.pending}</span><strong>{decision.question}</strong><p>{decision.context}</p></div><span className="showcase-decision-state">{t.pending}</span></article>)}
                {projectRisks.slice(0, 1).map((risk) => <article className="showcase-decision" key={risk.id}><span className="showcase-decision-icon"><ShieldCheck size={16} /></span><div><span className="showcase-mini-label">{risk.id} · {t.risk}</span><strong>{risk.title}</strong><p>{risk.trigger}</p></div><span className="showcase-decision-state state-done">{displayLabel(locale, "riskStatus", risk.status)}</span></article>)}
              </div>
              <div className="showcase-inline-note"><ShieldCheck size={15} /><span>{t.recorded}</span></div>
            </>}
          </div>
        </div>
      </div>
      <div className="showcase-foot"><Sparkles size={14} /><span>{t.insight}</span><span className="showcase-foot-link"><Check size={13} />{t.local}</span></div>
    </div>
  );
}
