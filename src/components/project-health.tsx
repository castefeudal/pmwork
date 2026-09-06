import type { ViewProps } from "./workspace-views";
import { dependencyConflicts } from "@/domain/planning";
import { localDay } from "@/domain/work-views";

export function ProjectHealth({workspace,project,locale,onView}: Pick<ViewProps,"workspace"|"project"|"locale"|"onView">) {
  const ru=locale==="ru", today=localDay();
  const items=workspace.workItems.filter(x=>x.projectId===project.id&&!x.archived), open=items.filter(x=>!x.done);
  const overdue=open.filter(x=>x.dueDate&&x.dueDate<today).length, conflicts=dependencyConflicts(workspace,project.id).length;
  const risks=workspace.risks.filter(x=>x.projectId===project.id&&x.status!=="closed"&&x.probability*x.impact>=15).length;
  const budgets=workspace.budgets.filter(x=>x.projectId===project.id), planned=budgets.reduce((s,x)=>s+x.planned,0), forecast=budgets.reduce((s,x)=>s+(x.forecast??x.actual+x.committed),0);
  const unowned=open.filter(x=>!x.owner.trim()).length, blocked=open.filter(x=>x.blocked).length;
  const decisions=workspace.decisions.filter(x=>x.projectId===project.id&&x.status==="pending"&&x.date&&x.date<=today).length;
  const labels=ru?{schedule:"Сроки",scope:"Объём",delivery:"Выполнение",risk:"Риски",finance:"Финансы",team:"Ответственность",governance:"Решения"}:{schedule:"Schedule",scope:"Scope",delivery:"Delivery",risk:"Risks",finance:"Finance",team:"Ownership",governance:"Decisions"};
  const rows: {key:keyof typeof labels; bad:boolean; unknown?:boolean; why:string; view:Parameters<typeof onView>[0]}[] = [
    {key:"schedule",unknown:!items.some(x=>x.dueDate),bad:overdue+conflicts>0,why:ru?`${overdue} просрочено · ${conflicts} конфликтов зависимостей`:`${overdue} overdue · ${conflicts} dependency conflicts`,view:"planning"},
    {key:"scope",bad:!project.scopeIn||!project.scopeOut,why:ru?(project.scopeIn&&project.scopeOut?"Границы проекта описаны":"Не зафиксировано, что входит и не входит в проект"):(project.scopeIn&&project.scopeOut?"Project boundaries recorded":"Scope in/out is incomplete"),view:"control"},
    {key:"delivery",unknown:!items.length,bad:blocked>0,why:ru?`${blocked} блокеров · ${open.length} незавершённых`:`${blocked} blockers · ${open.length} open items`,view:"work"},
    {key:"risk",unknown:!workspace.risks.some(x=>x.projectId===project.id),bad:risks>0,why:ru?`${risks} открытых рисков с P × I ≥ 15`:`${risks} open risks with P × I ≥ 15`,view:"raid"},
    {key:"finance",bad:forecast>planned,unknown:!budgets.length,why:budgets.length?(ru?`Прогноз − план: ${Math.round(forecast-planned)} ${project.currency}`:`Forecast − plan: ${Math.round(forecast-planned)} ${project.currency}`):(ru?"Бюджет ещё не задан":"Budget not recorded"),view:"finance"},
    {key:"team",unknown:!open.length,bad:unowned>0,why:ru?`${unowned} открытых работ без владельца`:`${unowned} open items are unassigned`,view:"people"},
    {key:"governance",bad:decisions>0,why:ru?`${decisions} решений требуют ответа к сегодняшнему дню`:`${decisions} decisions are due by today`,view:"raid"},
  ];
  const known=rows.filter(r=>!r.unknown), unknown=rows.filter(r=>r.unknown).length, bad=known.filter(r=>r.bad).length;
  const state=bad>=3?"critical":bad>0?"attention":known.length?"healthy":"unknown";
  const stateLabel=ru?{critical:"Критично",attention:"Требует внимания",healthy:"Без критических сигналов",unknown:"Недостаточно данных"}[state]:{critical:"Critical",attention:"Needs attention",healthy:"No critical signals",unknown:"Insufficient data"}[state];
  const confidence=Math.round((known.length/rows.length)*100);
  return <section className="panel span-4 project-health-v2">
    <div className="section-line"><div><p className="eyebrow">{ru?"Состояние":"State"}</p><h3>{stateLabel}</h3></div><span className={`status ${state==='healthy'?'good':state==='unknown'?'info':'warn'}`}>{bad} {ru?"сигналов":"signals"}</span></div>
    <div className="health-confidence"><p className="eyebrow">{ru?"Уверенность в данных":"Data confidence"}</p><strong>{confidence}%</strong><p className="muted compact">{unknown? (ru?`${unknown} из ${rows.length} областей требуют данных`:`${unknown} of ${rows.length} areas need data`):(ru?"Ключевые области покрыты текущими записями":"Key areas are covered by current records")}</p></div>
    <div className="health-evidence">{rows.map(r=><button key={r.key} onClick={()=>onView(r.view)}><span><strong>{labels[r.key]}</strong><span className={`status ${r.unknown?"info":r.bad?"warn":"good"}`}>{r.unknown?(ru?"Нет данных":"No data"):r.bad?(ru?"Внимание":"Attention"):(ru?"Без сигналов":"No signals")}</span></span><small>{r.why}</small></button>)}</div>
    <p className="muted compact">{ru?"Это состояние по текущим записям, а не гарантия здоровья проекта. Неполные данные снижают уверенность выводов.":"This state is derived from current records, not a guarantee of project health. Missing data lowers confidence."}</p>
  </section>;
}
