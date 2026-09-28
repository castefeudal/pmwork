"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  CircleAlert,
  CircleCheck,
  Clock3,
  Command,
  FileText,
  LayoutDashboard,
  ListChecks,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { Locale } from "@/domain/schemas";

type ShowcaseView = "overview" | "delivery" | "decisions";

const viewCopy = {
  ru: {
    app: "Рабочее пространство",
    saved: "Сохранено на устройстве",
    project: "Запуск цифрового продукта",
    location: "ПРОЕКТ / ОБЗОР",
    greeting: "Доброе утро, команда",
    intro: "Вот что важно в проекте сегодня.",
    views: ["Обзор", "Работа", "Решения"],
    indicators: ["Активные задачи", "Открытые риски", "До запуска"],
    tasks: "Работа по запуску",
    tasksSub: "12 записей · обновлено сегодня",
    health: "Состояние проекта",
    healthy: "В фокусе",
    next: "Следующая точка",
    launch: "Пилотный запуск",
    days: "через 8 дней",
    signal: "Нужно внимание",
    signalBody: "Согласование API может сдвинуть тестирование",
    inspect: "Посмотреть риск",
    workTitle: "Очередь команды",
    workSub: "Работа в движении · лимит WIP 5",
    columns: ["ПЛАН", "В РАБОТЕ", "ГОТОВО"],
    cards: ["Сценарий пилота", "Интеграция API", "Карта онбординга", "События аналитики"],
    decisionTitle: "Решения на этой неделе",
    decisionSub: "Каждое решение связано с проектной записью",
    decisionOpen: "Срок пилота",
    decisionStatus: "Ожидает владельца",
    decisionClosed: "Граница первой версии",
    decisionResolved: "Зафиксировано · 24 сен",
    insight: "Никакой магии. Только понятные сигналы и их источники.",
    weekdays: ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"],
    sampleDate: "ДЕМО · 25 СЕН 2026",
    risk: "Риск",
    milestone: "Контрольная точка",
  },
  en: {
    app: "Project workspace",
    saved: "Saved on this device",
    project: "Digital product launch",
    location: "PROJECT / OVERVIEW",
    greeting: "Good morning, team",
    intro: "Here is what matters in your project today.",
    views: ["Overview", "Work", "Decisions"],
    indicators: ["Active work", "Open risks", "To launch"],
    tasks: "Launch workstream",
    tasksSub: "12 records · updated today",
    health: "Project health",
    healthy: "In focus",
    next: "Next milestone",
    launch: "Pilot launch",
    days: "in 8 days",
    signal: "Needs attention",
    signalBody: "API approval could move the testing window",
    inspect: "Review risk",
    workTitle: "Team work queue",
    workSub: "Work in progress · WIP limit 5",
    columns: ["UP NEXT", "IN PROGRESS", "DONE"],
    cards: ["Pilot scenario", "API integration", "Onboarding map", "Analytics events"],
    decisionTitle: "Decisions this week",
    decisionSub: "Every decision stays linked to its project record",
    decisionOpen: "Pilot date",
    decisionStatus: "Waiting on an owner",
    decisionClosed: "First release scope",
    decisionResolved: "Recorded · Sep 24",
    insight: "No mystery scores. Just clear signals and their sources.",
    weekdays: ["M", "T", "W", "T", "F", "S"],
    sampleDate: "DEMO · SEP 25, 2026",
    risk: "Risk",
    milestone: "Milestone",
  },
} as const;

export function ProductShowcase({ locale }: { locale: Locale }) {
  const t = viewCopy[locale];
  const [view, setView] = useState<ShowcaseView>("overview");
  const [overview, delivery, decisions] = t.views;
  const options: { id: ShowcaseView; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "overview", label: overview, icon: LayoutDashboard },
    { id: "delivery", label: delivery, icon: ListChecks },
    { id: "decisions", label: decisions, icon: FileText },
  ];

  return (
    <div className="product-showcase" id="product-preview" aria-label={locale === "ru" ? "Интерактивный пример PMWORK" : "Interactive PMWORK preview"}>
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
            <div><span className="showcase-crumb">MARKOVMADE <span>/</span> {t.project}</span><p>{t.location}</p></div>
            <span className="showcase-search"><Command size={13} /> K</span>
          </div>
          <div className="showcase-tabs" role="group" aria-label={locale === "ru" ? "Раздел примера" : "Preview section"}>
            {options.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" className={view === id ? "active" : ""} aria-pressed={view === id} onClick={() => setView(id)}>
                <Icon size={14} aria-hidden="true" />{label}
              </button>
            ))}
          </div>
          <div className="showcase-panel" key={view} aria-live="polite" aria-atomic="true">
            {view === "overview" && <>
              <div className="showcase-welcome"><div><h2>{t.greeting}</h2><p>{t.intro}</p></div><span className="showcase-date"><CalendarDays size={13} /> {t.sampleDate}</span></div>
              <div className="showcase-metrics">
                {[{ label: t.indicators[0], value: "12", note: locale === "ru" ? "4 на этой неделе" : "4 due this week", color: "teal" }, { label: t.indicators[1], value: "03", note: locale === "ru" ? "1 требует внимания" : "1 needs attention", color: "amber" }, { label: t.indicators[2], value: "08", note: locale === "ru" ? "дней до пилота" : "days to pilot", color: "blue" }].map(item => <article className="showcase-metric" key={item.label}><span>{item.label}</span><div><strong>{item.value}</strong><small className={`metric-${item.color}`}>{item.note}</small></div></article>)}
              </div>
              <div className="showcase-lower-grid">
                <article className="showcase-card showcase-workload"><div className="showcase-card-head"><div><strong>{t.tasks}</strong><span>{t.tasksSub}</span></div><span className="showcase-open" aria-hidden="true"><ArrowUpRight size={15} /></span></div><div className="showcase-work-bars"><span style={{ "--bar": "72%" } as CSSProperties} /><span style={{ "--bar": "54%" } as CSSProperties} /><span style={{ "--bar": "84%" } as CSSProperties} /><span style={{ "--bar": "42%" } as CSSProperties} /><span style={{ "--bar": "65%" } as CSSProperties} /><span style={{ "--bar": "33%" } as CSSProperties} /></div><div className="showcase-week">{t.weekdays.map((day, i) => <span key={`${day}-${i}`}>{day}</span>)}</div></article>
                <article className="showcase-card showcase-next"><span className="showcase-icon"><CalendarDays size={15} /></span><span className="showcase-mini-label">{t.next}</span><strong>{t.launch}</strong><span className="showcase-date-note"><Clock3 size={12} />{t.days}</span><div className="showcase-progress"><span /></div><small>{locale === "ru" ? "Подготовка · 72%" : "Preparation · 72%"}</small></article>
              </div>
              <div className="showcase-signal"><span className="showcase-alert-icon"><CircleAlert size={15} /></span><div><strong>{t.signal}</strong><span>{t.signalBody}</span></div><span className="showcase-signal-tag">{t.risk}</span></div>
            </>}
            {view === "delivery" && <>
              <div className="showcase-welcome"><div><h2>{t.workTitle}</h2><p>{t.workSub}</p></div><span className="showcase-date"><ListChecks size={13} /> {locale === "ru" ? "12 ЗАДАЧ" : "12 ITEMS"}</span></div>
              <div className="showcase-board">{t.columns.map((column, index) => <div className="showcase-board-column" key={column}><div className="showcase-board-label"><span>{column}</span><b>{[4, 3, 5][index]}</b></div>{t.cards.slice(index, index + (index === 1 ? 2 : 1)).map((card, cardIndex) => <div className={`showcase-board-card board-card-${index}`} key={card}><span>{index === 2 ? <CircleCheck size={13} /> : index === 1 && cardIndex === 0 ? <CircleAlert size={13} /> : <span className="showcase-card-dot" />}</span><strong>{card}</strong><div><i>{["UX", "API", "PM"][cardIndex % 3]}</i><small>{cardIndex % 2 ? "24 SEP" : "26 SEP"}</small></div></div>)}</div>)}</div>
              <div className="showcase-inline-note"><Check size={15} /><span>{locale === "ru" ? "Ограничение незавершённой работы помогает команде сохранять фокус." : "Work-in-progress limits help the team keep its focus."}</span></div>
            </>}
            {view === "decisions" && <>
              <div className="showcase-welcome"><div><h2>{t.decisionTitle}</h2><p>{t.decisionSub}</p></div><span className="showcase-date"><FileText size={13} /> {locale === "ru" ? "ЖУРНАЛ" : "DECISION LOG"}</span></div>
              <div className="showcase-decision-list"><article className="showcase-decision showcase-decision-open"><span className="showcase-decision-icon"><Clock3 size={16} /></span><div><span className="showcase-mini-label">{locale === "ru" ? "КОНТРОЛЬ СРОКОВ · 25 СЕН" : "SCHEDULE CONTROL · SEP 25"}</span><strong>{t.decisionOpen}</strong><p>{t.decisionStatus}</p></div><span className="showcase-decision-state">{locale === "ru" ? "ОЖИДАЕТ" : "PENDING"}</span></article><article className="showcase-decision"><span className="showcase-decision-icon"><CircleCheck size={16} /></span><div><span className="showcase-mini-label">{locale === "ru" ? "ПРОДУКТ · 24 СЕН" : "PRODUCT · SEP 24"}</span><strong>{t.decisionClosed}</strong><p>{t.decisionResolved}</p></div><span className="showcase-decision-state state-done">{locale === "ru" ? "ГОТОВО" : "RECORDED"}</span></article></div>
              <div className="showcase-inline-note"><ShieldCheck size={15} /><span>{locale === "ru" ? "Видно, что решено, кто отвечает и что нужно сделать дальше." : "See what was decided, who owns it, and what needs to happen next."}</span></div>
            </>}
          </div>
        </div>
      </div>
      <div className="showcase-foot"><Sparkles size={14} /><span>{t.insight}</span><span className="showcase-foot-link"><Check size={13} />{locale === "ru" ? "Локально и приватно" : "Local by design"}</span></div>
    </div>
  );
}
