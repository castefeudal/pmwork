"use client";
import { formatDate, formatDayMonth, formatMonth } from "@/domain/format-date";
import { useState } from "react";
import { dependencyConflicts } from "@/domain/planning";
import { localDay } from "@/domain/work-views";
import type { Locale } from "@/domain/schemas";
import type { ViewProps } from "./workspace-views";

const DAY_MS = 86400000;
/** Keep short projects readable: never compress the scale below 100 days. */
const MIN_SPAN_MS = 100 * DAY_MS;

type Tick = { key: string; pos: number; label: string; strong?: boolean };

/** Calendar ticks for the visible window. Deterministic: UTC days, no locale drift. */
function buildTicks(startMs: number, endMs: number, unit: "month" | "week" | "day", locale: Locale, position: (ms: number) => number): Tick[] {
  const ticks: Tick[] = [];
  const startDate = new Date(startMs);
  if (unit === "month") {
    let cursor = Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1);
    if (cursor < startMs) cursor = startMs;
    while (cursor <= endMs) {
      ticks.push({ key: `m${cursor}`, pos: position(cursor), label: formatMonth(cursor, locale), strong: true });
      const d = new Date(cursor);
      cursor = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1);
    }
    return ticks;
  }
  if (unit === "week") {
    const startWeek = new Date(startMs);
    const offset = (startWeek.getUTCDay() + 6) % 7; // Monday-first weeks
    let cursor = Date.UTC(startWeek.getUTCFullYear(), startWeek.getUTCMonth(), startWeek.getUTCDate() - offset);
    if (cursor < startMs) cursor += 7 * DAY_MS;
    while (cursor <= endMs) {
      ticks.push({ key: `w${cursor}`, pos: position(cursor), label: formatDayMonth(cursor, locale) });
      cursor += 7 * DAY_MS;
    }
    return ticks;
  }
  let cursor = startMs;
  let index = 0;
  while (cursor <= endMs) {
    ticks.push({ key: `d${cursor}`, pos: position(cursor), label: formatDayMonth(cursor, locale), strong: index % 7 === 0 });
    cursor += DAY_MS;
    index += 1;
  }
  return ticks;
}

export function PlanningTimeline({workspace,project,locale,onEdit,onCreate}: Pick<ViewProps,"workspace"|"project"|"locale"|"onEdit"|"onCreate">) {
  const ru=locale==="ru", [zoom,setZoom]=useState("project"), [full,setFull]=useState(false);
  const items=workspace.workItems.filter(x=>x.projectId===project.id&&!x.archived);
  const scheduled=items.filter(x=>x.startDate||x.dueDate);
  const milestones=workspace.milestones.filter(x=>x.projectId===project.id);
  const conflicts=dependencyConflicts(workspace,project.id);
  const dates=[project.startDate,project.targetDate,...scheduled.flatMap(x=>[x.startDate,x.dueDate]),...milestones.map(x=>x.date)].filter((x):x is string=>!!x).map(Date.parse).filter(Number.isFinite);
  const start=Math.min(...dates), end=Math.max(start+MIN_SPAN_MS,...dates), days=Math.ceil((end-start)/DAY_MS)+1;
  const positionByMs=(ms:number)=>Math.max(0,Math.min(100,(ms-start)/DAY_MS/days*100));
  const position=(value:string)=>positionByMs(Date.parse(value));
  const today=localDay(), todayMs=Date.parse(today), marker=position(today), todayVisible=todayMs>=start&&todayMs<=end;
  const width=zoom==="day"?Math.min(12000,days*44):zoom==="week"?Math.min(6000,days*14):920;
  const unit:"month"|"week"|"day"=zoom==="day"?"day":zoom==="week"?"week":"month";
  const ticks=buildTicks(start,end,unit,locale,positionByMs);
  const barLabel=(id:string,blocked:boolean,barWidth:number)=>barWidth<9?null:(blocked?(ru?"Блокер":"Blocked"):id);
  return <section className="panel planning-panel">
    <div className="section-line">
      <label className="view-control">{ru?"Масштаб":"Scale"}<select className="input" value={zoom} onChange={e=>setZoom(e.target.value)}><option value="project">{ru?"Весь проект":"Project"}</option><option value="week">{ru?"Недели":"Weeks"}</option><option value="day">{ru?"Дни":"Days"}</option></select></label>
      <ul className="timeline-legend" aria-label={ru?"Обозначения шкалы":"Timeline legend"}>
        <li><span className="legend-swatch legend-work" aria-hidden="true"/>{ru?"Работа":"Work"}</li>
        <li><span className="legend-swatch legend-blocked" aria-hidden="true"/>{ru?"Блокер":"Blocked"}</li>
        <li><span className="legend-swatch legend-milestone" aria-hidden="true"/>{ru?"Веха":"Milestone"}</li>
        {todayVisible&&<li><span className="legend-swatch legend-today" aria-hidden="true"/>{ru?"Сегодня":"Today"}</li>}
      </ul>
      <button className="button" onClick={()=>onCreate("milestone")}>{ru?"Добавить контрольную точку":"Add milestone"}</button>
    </div>
    {conflicts.length>0&&<div className="notice" role="status"><strong>{ru?"Конфликты зависимостей":"Dependency conflicts"} · {conflicts.length}</strong>{conflicts.map(c=><p key={c.id}><button className="work-title-button" onClick={()=>onEdit("dependency",c.id)}>{c.from} → {c.to} · {c.type}: {c.missing?(ru?"связанная работа недоступна":"linked work unavailable"):`${c.days} ${ru?"дн. нарушения связи":"days of timing conflict"}`}</button></p>)}</div>}
    <div className="mobile-planning-agenda"><h3>{ru ? "Ближайшая работа и контрольные точки" : "Upcoming work and milestones"}</h3>{[...scheduled.map(x=>({id:x.id,title:x.title,date:x.dueDate||x.startDate!,kind:"work" as const})),...milestones.map(x=>({id:x.id,title:x.title,date:x.date,kind:"milestone" as const}))].sort((a,b)=>a.date.localeCompare(b.date)).map(x=><button className="mobile-work-card" key={x.id} onClick={()=>onEdit(x.kind,x.id)}><small>{formatDate(x.date,locale)}</small><strong>{x.title}</strong></button>)}<button className="button" onClick={()=>setFull(!full)}>{full?(ru?"Скрыть timeline":"Hide timeline"):(ru?"Открыть полный timeline":"Open full timeline")}</button></div>
    {scheduled.length?<div className={`timeline-scroll ${full ? "mobile-expanded" : ""}`}><div className="date-timeline" style={{minWidth:width}}>
      <div className="timeline-axis">
        <span className="timeline-axis-caption">{formatDate(new Date(start).toISOString(),locale)} — {formatDate(new Date(end).toISOString(),locale)}</span>
        <div className="timeline-axis-track" aria-hidden="true">
          {ticks.map(tick=><span className={`timeline-tick ${tick.strong?"is-strong":""}`} key={tick.key} style={{left:`${tick.pos}%`}}><span className="timeline-tick-label">{tick.label}</span></span>)}
          {todayVisible&&<span className="timeline-tick-today" style={{left:`${marker}%`}}>{ru?"Сегодня":"Today"}</span>}
        </div>
      </div>
      <div className="timeline-body">
        <div className="timeline-ticks-grid" aria-hidden="true">{ticks.map(tick=><span className={`timeline-grid-line ${tick.strong?"is-strong":""}`} key={tick.key} style={{left:`${tick.pos}%`}}/>)}{todayVisible&&<span className="timeline-grid-today" style={{left:`${marker}%`}}/>}</div>
        {scheduled.map(x=>{
          const left=position(x.startDate||x.dueDate!), right=position(x.dueDate||x.startDate!), barWidth=Math.max(.6,right-left+100/days);
          const blocked=Boolean(x.blocked)||conflicts.some(c=>c.to===x.id);
          return <div className="date-timeline-row" key={x.id}><button className="work-title-button" onClick={()=>onEdit("work",x.id)}><small>{x.id}</small> {x.title}<span className="timeline-date-label">{formatDayMonth(x.startDate||x.dueDate!,locale)} → {formatDayMonth(x.dueDate||x.startDate!,locale)}</span></button><div className="date-track"><button className={`date-bar ${blocked?"conflict":""}`} style={{left:`${left}%`,width:`${barWidth}%`}} onClick={()=>onEdit("work",x.id)} aria-label={`${x.title}: ${x.startDate||"—"} → ${x.dueDate||"—"}`} title={`${x.title}: ${formatDate(x.startDate,locale)} → ${formatDate(x.dueDate,locale)}`}>{barLabel(x.id,blocked,barWidth)}</button></div></div>;
        })}
        {milestones.map(m=><div className="date-timeline-row" key={m.id}><button className="work-title-button" onClick={()=>onEdit("milestone",m.id)}>{m.title}<span className="timeline-date-label">{formatDayMonth(m.date,locale)} · {m.progress}%</span></button><div className="date-track"><button className="milestone-marker" style={{left:`${position(m.date)}%`}} aria-label={`${m.title} ${m.date}`} title={`${m.title}: ${formatDate(m.date,locale)}`} onClick={()=>onEdit("milestone",m.id)}>◆</button></div></div>)}
      </div>
    </div></div>:<div className="empty-state"><h3>{ru?"Нет запланированной работы":"No scheduled work"}</h3><p>{ru?"Задайте начало и срок работы, чтобы увидеть её на шкале.":"Set work start and due dates to see it on the timeline."}</p><button className="button" onClick={()=>onCreate("work")}>{ru?"Добавить работу":"Add work"}</button></div>}
    <p className="muted compact">{ru?"Календарные дни. Связь FS допускает начало в день окончания предшественника; лаг добавляет дни. Линия «сегодня» отмечена на шкале. Работа без дат: ":"Calendar days. FS permits a same-day finish/start; lag adds days. The today line is marked on the scale. Unscheduled work: "}{items.length-scheduled.length}.</p>
  </section>;
}
