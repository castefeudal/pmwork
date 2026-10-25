"use client";
import { formatDate } from "@/domain/format-date";
import { useId, useState } from "react";
import { dependencyConflicts } from "@/domain/planning";
import { localDay } from "@/domain/work-views";
import { timelineTicks } from "@/domain/timeline-scale";
import type { ViewProps } from "./workspace-views";

const DAY_MS = 86400000;
/** Give short plans breathing room without inventing a hundred-day horizon. */
const MIN_SPAN_MS = 14 * DAY_MS;

export function PlanningTimeline({workspace,project,locale,onEdit,onCreate}: Pick<ViewProps,"workspace"|"project"|"locale"|"onEdit"|"onCreate">) {
  const timelineId=useId();
  const ru=locale==="ru", [zoom,setZoom]=useState("project"), [full,setFull]=useState(false);
  const items=workspace.workItems.filter(x=>x.projectId===project.id&&!x.archived);
  const scheduled=items.filter(x=>x.startDate||x.dueDate);
  const milestones=workspace.milestones.filter(x=>x.projectId===project.id);
  // A milestone-only plan is still a valid schedule. Do not hide its timeline.
  const hasTimelineRecords=scheduled.length>0||milestones.length>0;
  const conflicts=dependencyConflicts(workspace,project.id);
  const dates=[project.startDate,project.targetDate,...scheduled.flatMap(x=>[x.startDate,x.dueDate]),...milestones.flatMap(x=>[x.baselineDate,x.forecastDate,x.actualDate,x.date])].filter((x):x is string=>!!x).map(Date.parse).filter(Number.isFinite);
  const start=dates.length?Math.min(...dates):Date.parse(localDay()), end=Math.max(start+MIN_SPAN_MS,...dates), days=Math.ceil((end-start)/DAY_MS)+1;
  const positionByMs=(ms:number)=>Math.max(0,Math.min(100,(ms-start)/DAY_MS/days*100));
  const position=(value:string)=>positionByMs(Date.parse(value));
  const today=localDay(), todayMs=Date.parse(today), marker=position(today), todayVisible=todayMs>=start&&todayMs<=end;
  const width=zoom==="day"?Math.min(12000,days*44):zoom==="week"?Math.min(6000,days*14):920;
  const unit:"month"|"week"|"day"=zoom==="day"?"day":zoom==="week"?"week":days<=21?"day":days<=90?"week":"month";
  const ticks=timelineTicks(start,end,unit,locale,Math.max(128,width-260));
  const milestoneDates=(m:typeof milestones[number])=>[
    {kind:"baseline",label:ru?"Базовый план":"Baseline",date:m.baselineDate,symbol:"◇"},
    {kind:"forecast",label:ru?"Прогноз":"Forecast",date:m.forecastDate||m.date,symbol:"◆"},
    {kind:"actual",label:ru?"Факт":"Actual",date:m.actualDate,symbol:"●"},
  ];
  const milestoneSummary=(m:typeof milestones[number])=>milestoneDates(m).map(d=>`${d.label}: ${formatDate(d.date,locale)}`).join(" · ");
  const barLabel=(id:string,blocked:boolean,barWidth:number)=>barWidth<9?null:(blocked?(ru?"Блокер":"Blocked"):id);
  return <section className="panel planning-panel">
    <div className="section-line">
      <label className="view-control">{ru?"Масштаб":"Scale"}<select className="input" value={zoom} onChange={e=>setZoom(e.target.value)}><option value="project">{ru?"Весь проект":"Project"}</option><option value="week">{ru?"Недели":"Weeks"}</option><option value="day">{ru?"Дни":"Days"}</option></select></label>
      <ul className="timeline-legend" aria-label={ru?"Обозначения шкалы":"Timeline legend"}>
        <li><span className="legend-swatch legend-work" aria-hidden="true"/>{ru?"Работа":"Work"}</li>
        <li><span className="legend-swatch legend-blocked" aria-hidden="true"/>{ru?"Блокер":"Blocked"}</li>
        <li><span aria-hidden="true">◇</span>{ru?"Базовый план":"Baseline"}</li>
        <li><span aria-hidden="true">◆</span>{ru?"Прогноз":"Forecast"}</li>
        <li><span aria-hidden="true">●</span>{ru?"Факт":"Actual"}</li>
        {todayVisible&&<li><span className="legend-swatch legend-today" aria-hidden="true"/>{ru?"Сегодня":"Today"}</li>}
      </ul>
      <button className="button" onClick={()=>onCreate("milestone")}>{ru?"Добавить контрольную точку":"Add milestone"}</button>
    </div>
    {conflicts.length>0&&<div className="notice" role="status"><strong>{ru?"Конфликты зависимостей":"Dependency conflicts"} · {conflicts.length}</strong>{conflicts.map(c=><p key={c.id}><button className="work-title-button" onClick={()=>onEdit("dependency",c.id)}>{c.from} → {c.to} · {c.type}: {c.missing?(ru?"связанная работа недоступна":"linked work unavailable"):`${c.days} ${ru?"дн. нарушения связи":"days of timing conflict"}`}</button></p>)}</div>}
    <div className="mobile-planning-agenda"><h3>{ru ? "Ближайшая работа и контрольные точки" : "Upcoming work and milestones"}</h3>{[...scheduled.map(x=>({id:x.id,title:x.title,date:x.dueDate||x.startDate!,kind:"work" as const})),...milestones.map(x=>({id:x.id,title:x.title,date:x.date,kind:"milestone" as const}))].sort((a,b)=>a.date.localeCompare(b.date)).map(x=><button className="mobile-work-card" key={x.id} onClick={()=>onEdit(x.kind,x.id)}><small>{formatDate(x.date,locale)}</small><strong>{x.title}</strong>{x.kind==="milestone"&&<span>{milestoneSummary(milestones.find(m=>m.id===x.id)!)}</span>}</button>)}<button className="button" aria-expanded={full} aria-controls={timelineId} onClick={()=>setFull(!full)}>{full?(ru?"Скрыть timeline":"Hide timeline"):(ru?"Открыть полный timeline":"Open full timeline")}</button></div>
    {hasTimelineRecords?<div id={timelineId} role="region" aria-label={ru?"Календарный график":"Schedule timeline"} tabIndex={0} className={`timeline-scroll ${full ? "mobile-expanded" : ""}`}><div className="date-timeline" style={{minWidth:width}}>
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
          return <div className="date-timeline-row" key={x.id}><button className="work-title-button" onClick={()=>onEdit("work",x.id)}><small>{x.id}</small> {x.title}<span className="timeline-date-label">{formatDate(x.startDate||x.dueDate!,locale)} → {formatDate(x.dueDate||x.startDate!,locale)}</span></button><div className="date-track"><button className={`date-bar ${blocked?"conflict":""}`} style={{left:`${left}%`,width:`${barWidth}%`}} onClick={()=>onEdit("work",x.id)} aria-label={`${x.title}: ${x.startDate||"—"} → ${x.dueDate||"—"}`} title={`${x.title}: ${formatDate(x.startDate,locale)} → ${formatDate(x.dueDate,locale)}`}>{barLabel(x.id,blocked,barWidth)}</button></div></div>;
        })}
        {milestones.map(m=><div className="date-timeline-row" key={m.id}><button className="work-title-button" onClick={()=>onEdit("milestone",m.id)}>{m.title}<span className="timeline-date-label">{milestoneSummary(m)} · {m.progress}%</span></button><div className="date-track">{milestoneDates(m).filter(d=>d.date&&Number.isFinite(Date.parse(d.date))).map(d=><button key={d.kind} className={`milestone-marker milestone-${d.kind}`} style={{left:`${position(d.date!)}%`}} aria-label={`${m.title} · ${d.label}: ${formatDate(d.date,locale)}`} title={`${m.title} · ${d.label}: ${formatDate(d.date,locale)}`} onClick={()=>onEdit("milestone",m.id)}>{d.symbol}</button>)}</div></div>)}
      </div>
    </div></div>:<div className="empty-state"><h3>{ru?"Нет запланированных задач и вех":"No scheduled work or milestones"}</h3><p>{ru?"Добавьте сроки задач или контрольные точки, чтобы увидеть график.":"Add work dates or milestones to see the schedule."}</p><button className="button" onClick={()=>onCreate("work")}>{ru?"Добавить работу":"Add work"}</button></div>}
    <p className="muted compact">{ru?"Календарные дни. Связь FS допускает начало в день окончания предшественника; лаг добавляет дни. Линия «сегодня» отмечена на шкале. Работа без дат: ":"Calendar days. FS permits a same-day finish/start; lag adds days. The today line is marked on the scale. Unscheduled work: "}{items.length-scheduled.length}.</p>
  </section>;
}
