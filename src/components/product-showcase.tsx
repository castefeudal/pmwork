"use client";

import { useState } from "react";
import { Check, CircleAlert, Database, FileText, LayoutDashboard, ListChecks } from "lucide-react";
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
    insight: "Пример проекта · записи задач, рисков и решений.", local: "Работает офлайн",
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
    insight: "Sample project · work, risks, and decisions.", local: "Works offline",
    sample: "DEMO · PROJECT DATA", date: "DUE", noMilestone: "No milestone recorded",
  },
} as const;

export function ProductShowcase({ locale, preview }: { locale: Locale; preview: ShowcasePreview }) {
  const t = viewCopy[locale];
  const [view, setView] = useState<ShowcaseView>("overview");
  const [groupIndex, setGroupIndex] = useState(1);
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
    <section className="product-showcase" id="product-preview" aria-label={locale === "ru" ? "Интерактивный демо-проект PMWORK" : "Interactive PMWORK demo project"}>
      <header className="showcase-projectline"><span className="showcase-mini-label">{t.sample}</span><h2>{project.name}</h2><p>{project.objective}</p></header>
      <div className="showcase-tabs" role="group" aria-label={locale === "ru" ? "Раздел демо-проекта" : "Demo project view"}>
        {options.map(({id,label,icon:Icon})=><button key={id} type="button" aria-pressed={view===id} onClick={()=>setView(id)}><Icon size={18} aria-hidden="true"/>{label}</button>)}
      </div>
      <div className="showcase-panel" aria-live="polite">
        {view==="overview"&&<>
          <div className="showcase-metrics">{[{label:t.openWork,value:work.filter(item=>!item.done).length},{label:t.blockers,value:work.filter(item=>item.blocked).length},{label:t.decisions,value:pendingDecisions.length}].map(item=><article key={item.label}><strong>{item.value}</strong><span>{item.label}</span></article>)}</div>
          {blocker&&<article className="showcase-signal"><CircleAlert size={22} aria-hidden="true"/><div><span className="showcase-mini-label">{t.signal} · {displayLabel(locale,"priority",blocker.priority)}</span><h3>{blocker.title}</h3><p>{blocker.blockerReason}</p><p className="showcase-meta">{t.owner}: {blocker.owner||t.noOwner} · {formatDate(blocker.dueDate,locale)}</p></div></article>}
          <article className="showcase-card"><span className="showcase-mini-label">{t.milestone}</span><h3>{upcoming?.title??t.noMilestone}</h3>{upcoming&&<><p>{t.forecast}: {formatDate(upcoming.forecastDate,locale)}</p><progress max="100" value={upcoming.progress} aria-label={t.progress}/><p className="showcase-meta">{displayLabel(locale,"milestoneStatus",upcoming.status)} · {t.progress}: {upcoming.progress}% · {t.confidence}: {upcoming.confidence??"—"}%</p></>}</article>
        </>}
        {view==="delivery"&&<div className="showcase-board">
          <div className="showcase-statuses" role="group" aria-label={t.byStatus}>{statusGroups.map((group,index)=><button type="button" key={group.label} aria-pressed={index===groupIndex} onClick={()=>setGroupIndex(index)}>{group.label} · {group.items.length}</button>)}</div>
          <ul className="showcase-work-list">{statusGroups[groupIndex].items.map(item=><li key={item.id}><h3>{item.title}</h3><p className="showcase-meta">{t.owner}: {item.owner||t.noOwner} · {formatDate(item.dueDate,locale)}</p>{item.blocked&&<p className="showcase-blocker"><CircleAlert size={18} aria-hidden="true"/>{item.blockerReason}</p>}</li>)}</ul>
          <p className="showcase-meta">{work.length} {t.records} · {t.recorded}</p>
        </div>}
        {view==="decisions"&&<div className="showcase-decision-list">
          {pendingDecisions.slice(0,2).map(decision=><article className="showcase-card" key={decision.id}><span className="showcase-mini-label">{decision.id} · {t.pending}</span><h3>{decision.question}</h3><p>{decision.context}</p></article>)}
          {projectRisks.slice(0,1).map(risk=><article className="showcase-card" key={risk.id}><span className="showcase-mini-label">{t.risk} · {displayLabel(locale,"riskStatus",risk.status)}</span><h3>{risk.title}</h3><p>{risk.trigger}</p></article>)}
        </div>}
      </div>
      <footer className="showcase-foot"><Database size={18} aria-hidden="true"/><span>{t.insight}</span><span><Check size={16} aria-hidden="true"/>{t.local}</span></footer>
    </section>
  );
}
