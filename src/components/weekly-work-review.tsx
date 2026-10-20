"use client";
import { useState } from "react";
import { formatDate } from "@/domain/format-date";
import { localDay } from "@/domain/work-views";
import type { ViewProps } from "./workspace-views";
import { CollectionPager } from "./collection-pager";
import { displayLabel } from "@/content/workspace-i18n";

export function WeeklyWorkReview({workspace,project,locale,onEdit}: ViewProps) {
  const ru = locale === "ru";
  const [page,setPage] = useState(0);
  const now = new Date(), since = new Date(now);
  since.setDate(since.getDate()-6);
  const today = localDay(now), start = localDay(since);
  const items = workspace.workItems.filter(item => item.projectId === project.id && !item.archived);
  const recent = items.filter(item => item.updatedAt.slice(0,10) >= start && item.updatedAt.slice(0,10) <= today)
    .sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)||a.id.localeCompare(b.id));
  const overdue = items.filter(item => !item.done && item.dueDate && item.dueDate < today).length;
  const completed = items.filter(item => item.done && item.completedAt && item.completedAt.slice(0,10) >= start && item.completedAt.slice(0,10) <= today).length;
  const currentPage = Math.min(page,Math.max(0,Math.ceil(recent.length/5)-1));
  return <details className="panel weekly-work-review">
    <summary>{ru ? "Обзор работы за неделю" : "Weekly work review"}</summary>
    <p className="muted">{formatDate(start,locale)} — {formatDate(today,locale)}. {ru ? "По текущим неархивным записям. Изменение записи не обязательно означает изменение обязательств." : "From current unarchived records. An updated record does not necessarily mean a changed commitment."}</p>
    <dl className="weekly-review-counts">
      <div><dt>{ru ? "Обновлено" : "Updated"}</dt><dd>{recent.length}</dd></div>
      <div><dt>{ru ? "Зафиксировано завершений" : "Recorded completions"}</dt><dd>{completed}</dd></div>
      <div><dt>{ru ? "Просрочено сейчас" : "Overdue now"}</dt><dd>{overdue}</dd></div>
    </dl>
    <h3>{ru ? "Последние изменения работы" : "Recently updated work"}</h3>
    {recent.length ? <ul className="weekly-review-records">{recent.slice(currentPage*5,(currentPage+1)*5).map(item=><li key={item.id}>
      <button className="work-title-button" onClick={()=>onEdit("work",item.id)}>{item.title}</button>
      <span className="muted">{displayLabel(locale,"workStatus",item.status)} · <time dateTime={item.updatedAt}>{formatDate(item.updatedAt.slice(0,10),locale)}</time></span>
    </li>)}</ul> : <p>{ru ? "За этот период нет обновлённых рабочих записей. Проверьте актуальность проекта перед обзором." : "No updated work records in this period. Check that the project is current before reviewing."}</p>}
    <CollectionPager page={currentPage} size={5} total={recent.length} locale={locale} label={ru ? "Изменения за неделю" : "Weekly updates"} onPage={setPage}/>
  </details>;
}
