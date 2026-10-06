"use client";
import {useState} from "react";
import {filterDecisions,decisionFilters,type DecisionFilter} from "@/domain/decision-center";
import {localDay} from "@/domain/work-views";
import type {Locale,Decision} from "@/domain/schemas";
import {CollectionPager} from "./collection-pager";

export function DecisionCenter({decisions,locale,onEdit}:{decisions:Decision[];locale:Locale;onEdit:(id:string)=>void}) {
  const ru=locale==="ru",[filter,setFilter]=useState<DecisionFilter>("pending"),[page,setPage]=useState(0),asOf=localDay();
  const labels={pending:ru?"Ожидают решения":"Pending",overdue:ru?"Просрочены":"Overdue",upcoming:ru?"На ближайшую неделю":"Next seven days",decided:ru?"Приняты за 30 дней":"Decided in 30 days",revisit:ru?"Пора пересмотреть":"Revisit due",unowned:ru?"Без владельца":"Without owner",evidence:ru?"Без вариантов / критериев":"Missing options / criteria",affected:ru?"Затрагивают несколько записей":"Affect multiple records"};
  const rows=filterDecisions(decisions,filter,asOf),current=Math.min(page,Math.max(0,Math.ceil(rows.length/10)-1));
  return <section className="panel"><h3>{ru?"Центр решений":"Decision Center"}</h3><p className="muted">{ru?"Вопрос → варианты → критерии → подтверждения → решение → последствия → пересмотр.":"Question → options → criteria → evidence → decision → consequences → revisit."}</p><label className="field"><span>{ru?"Показать решения":"Show decisions"}</span><select aria-label={ru?"Показать решения":"Show decisions"} value={filter} onChange={e=>{setFilter(e.target.value as DecisionFilter);setPage(0);}}>{decisionFilters.map(value=><option value={value} key={value}>{labels[value]} ({filterDecisions(decisions,value,asOf).length})</option>)}</select></label>{rows.length?<ul className="clean-list">{rows.slice(current*10,current*10+10).map(row=><li key={row.id}><button className="button small" onClick={()=>onEdit(row.id)}>{row.question}</button><p>{ru?"Владелец":"Owner"}: {row.owner||(ru?"не назначен":"unassigned")} · {ru?"Дата":"Date"}: {row.date||"—"}</p><p>{row.rationale||row.context}</p>{row.revisitDate&&<p>{ru?"Пересмотр":"Revisit"}: {row.revisitDate}</p>}</li>)}</ul>:<p>{ru?"Нет решений в этой группе. Отсутствующие даты и владельцы проверяются отдельно.":"No decisions in this group. Missing dates and owners are checked separately."}</p>}<CollectionPager page={current} total={rows.length} size={10} label={ru?"Страницы решений":"Decision pages"} onPage={setPage} locale={locale}/></section>;
}
