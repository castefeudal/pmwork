"use client";
import { useState } from "react";
import { CollectionPager } from "./collection-pager";
import { acrossProjectSignals } from "@/domain/across-work-signals";
import { managementSignals } from "@/domain/management-signals";
import { localDay } from "@/domain/work-views";
import type { ViewProps } from "./workspace-views";

export function TodayAcrossWork({workspace,locale,onView,onProject,onEdit}:Pick<ViewProps,"workspace"|"locale"|"onView"|"onProject"|"onEdit">) {
  const [pages,setPages]=useState<Record<string,number>>({});
  const ru=locale==="ru", asOf=localDay();
  const projectSignals=acrossProjectSignals(workspace,locale,asOf).map(({project,signal})=>({id:`${project.id}-${signal.id}`,context:project.name,title:signal.title,why:signal.why,action:signal.action,owner:signal.source?.owner??"",priority:signal.severity==="critical"?100:signal.severity==="high"?80:40,group:signal.category==="decision"?"decide":signal.category==="review"||signal.category==="control"?"check":"act",dueDate:signal.dueDate,open:()=>{onProject(project.id);onView(signal.view);if(signal.source)onEdit(signal.source.kind,signal.source.id);},rule:signal.evidence.rule,missingEvidence:signal.evidence.missing}));
  const otherSignals=managementSignals(workspace,locale,asOf).map(signal=>{const context=(signal.source.collection==="programs"?workspace.programs:workspace.operations).find(row=>row.id===signal.source.id)?.name??"";return {...signal,context,title:signal.title.startsWith(`${context} · `)?signal.title.slice(context.length+3):signal.title,open:()=>{const next=new URL(window.location.href);next.searchParams.set("context",signal.source.id);next.hash=signal.source.recordId?`evidence-${signal.source.id}-${signal.source.recordId}`:"";for(const key of ["item","kind","register","evidence"])next.searchParams.delete(key);if(signal.source.recordId&&!signal.source.kind)next.searchParams.set("evidence",signal.source.recordId);if(signal.source.kind&&signal.source.recordId){next.searchParams.set("item",signal.source.recordId);next.searchParams.set("kind",signal.source.kind);if(signal.source.register)next.searchParams.set("register",signal.source.register);}history.pushState(null,"",next);dispatchEvent(new Event("pmwork-url"));onView(signal.source.collection==="programs"?"program":"operations");}};});
  const signals=[...projectSignals,...otherSignals].sort((a,b)=>b.priority-a.priority||(a.dueDate??"9999").localeCompare(b.dueDate??"9999")||a.id.localeCompare(b.id));
  const top=signals[0];
  const labels={decide:ru?"Требуется решение":"Requires a decision",act:ru?"Требуется действие":"Requires action",check:ru?"Проверки и пересмотры":"Checks and reviews"};
  const summaryLabels:Record<string,string>={decide:ru?"Решения":"Decisions",act:ru?"Действия":"Actions",check:ru?"Проверки":"Checks"};
  return <div className="management-center today-command-center">
    <div className="today-signal-summary" role="group" aria-label={ru?"Обзор сигналов":"Signal overview"}>
      {Object.keys(labels).map(group=><a key={group} href={`#today-${group}`}><strong>{signals.filter(signal=>signal.group===group).length}</strong><span>{summaryLabels[group]}</span></a>)}
      <p><span>{ru?"На дату":"As of"}</span><time dateTime={asOf}>{asOf}</time></p>
    </div>
    <section className="panel priority-focus"><p className="eyebrow">{ru?"Главное по всей работе":"Top priority across all work"}</p>{top?<>
      <p className="muted">{top.context}</p><h3>{top.title}</h3><p>{top.why}</p>
      <div className="today-next-step"><span className="eyebrow">{ru?"Следующее действие":"Next action"}</span><p>{top.action}</p><p>{ru?"Владелец":"Owner"}: {top.owner||(ru?"не назначен":"unassigned")}</p><button className="button primary" onClick={top.open}>{ru?"Открыть источник":"Open source"}</button></div>
      <details><summary>{ru?"Почему это главное":"Why this ranks first"}</summary><p>{ru?"Приоритет правила, срок, затем стабильный ID. Это правила PMWORK, а не вероятность успеха.":"Rule priority, due date, then stable ID. These are PMWORK rules, not success probabilities."}</p><p>{top.rule}</p><p>{ru?"На дату":"As of"}: {asOf}</p><p>{ru?"Недостающие данные":"Missing evidence"}: {top.missingEvidence.join(", ")||"—"}</p></details>
    </>:<><h3>{ru?"Нет срочных сигналов по текущим записям":"No immediate signals in current records"}</h3><p>{ru?"Проверьте полноту и актуальность данных. Отсутствие сигнала не подтверждает стабильность.":"Review evidence completeness and freshness. Absence of a signal does not confirm stability."}</p></>}</section>
    {Object.entries(labels).map(([group,label])=>{
      const rows=signals.slice(1).filter(signal=>signal.group===group);
      const page=Math.min(pages[group]??0,Math.max(0,Math.ceil(rows.length/5)-1));
      return <section className="panel today-signal-group" id={`today-${group}`} key={group} aria-labelledby={`today-heading-${group}`}>
        <h3 id={`today-heading-${group}`}>{label} <span className="pill">{rows.length}</span></h3>
        {rows.length?<ul className="clean-list">{rows.slice(page*5,(page+1)*5).map(signal=><li key={signal.id}><div><small className="today-signal-context">{signal.context}</small><button className="work-title-button" onClick={signal.open}>{signal.title}</button><p>{signal.why}</p><small>{ru?"Владелец":"Owner"}: {signal.owner||(ru?"не назначен":"unassigned")}{signal.dueDate&&<> · <time dateTime={signal.dueDate}>{signal.dueDate}</time></>}</small><details><summary>{ru?"Следующее действие":"Next action"}</summary><p>{signal.action}</p></details></div></li>)}</ul>:<p className="muted">{ru?"Других сигналов в этой группе нет.":"No other signals in this group."}</p>}
        <CollectionPager page={page} size={5} total={rows.length} locale={locale} label={label} onPage={next=>setPages({...pages,[group]:next})}/>
      </section>;
    })}
    <p className="muted">{ru?"Стабильность подтверждается наблюдениями. Отсутствие данных не считается положительным статусом.":"Stability requires recorded observations. Missing evidence is not treated as a positive status."}</p>
  </div>;
}
