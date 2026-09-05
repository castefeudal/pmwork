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
  const labels=ru?{schedule:"Сроки",scope:"Объём",delivery:"Выполнение",risk:"Риск",finance:"Финансы",team:"Ответственность",governance:"Управление"}:{schedule:"Schedule",scope:"Scope",delivery:"Delivery",risk:"Risk",finance:"Finance",team:"Ownership",governance:"Governance"};
  const rows: {key:keyof typeof labels; bad:boolean; unknown?:boolean; why:string; view:Parameters<typeof onView>[0]}[] = [
    {key:"schedule",unknown:!items.some(x=>x.dueDate),bad:overdue+conflicts>0,why:ru?`${overdue} просрочено · ${conflicts} конфликтов связей`:`${overdue} overdue · ${conflicts} dependency conflicts`,view:"planning"},
    {key:"scope",bad:!project.scopeIn||!project.scopeOut,why:ru?(project.scopeIn&&project.scopeOut?"Границы включения и исключения описаны":"Уточните, что входит и не входит в проект"):(project.scopeIn&&project.scopeOut?"In/out boundaries recorded":"Define scope in and scope out"),view:"control"},
    {key:"delivery",unknown:!items.length,bad:blocked>0,why:ru?`${blocked} блокеров · ${open.length} незавершённых`:`${blocked} blockers · ${open.length} open items`,view:"board"},
    {key:"risk",unknown:!workspace.risks.some(x=>x.projectId===project.id),bad:risks>0,why:ru?`${risks} открытых рисков с P × I ≥ 15`:`${risks} open risks with P × I ≥ 15`,view:"raid"},
    {key:"finance",bad:forecast>planned,unknown:!budgets.length,why:budgets.length?(ru?`Прогноз − план: ${Math.round(forecast-planned)} ${project.currency}`:`Forecast − plan: ${Math.round(forecast-planned)} ${project.currency}`):(ru?"Бюджет ещё не задан":"Budget not recorded"),view:"finance"},
    {key:"team",unknown:!open.length,bad:unowned>0,why:ru?`${unowned} без владельца. Это не оценка загрузки.`:`${unowned} unassigned. This is not a capacity estimate.`,view:"people"},
    {key:"governance",bad:decisions>0,why:ru?`${decisions} решений требуют ответа к сегодняшнему дню`:`${decisions} decisions due by today`,view:"raid"},
  ];
  return <section className="panel span-4"><h3>{ru?"Здоровье проекта":"Project health"}</h3><div className="health-evidence">{rows.map(r=><button key={r.key} onClick={()=>onView(r.view)}><span><strong>{labels[r.key]}</strong><span className={`status ${r.unknown?"info":r.bad?"warn":"good"}`}>{r.unknown?(ru?"Нет данных":"No data"):r.bad?(ru?"Внимание":"Attention"):(ru?"Без сигналов":"No signals")}</span></span><small>{r.why}</small></button>)}</div><p className="muted compact">{ru?"Правила PMWORK по текущим записям. Отсутствие сигнала не подтверждает отсутствие риска.":"PMWORK rules applied to current records. No signal does not prove absence of risk."}</p></section>;
}
