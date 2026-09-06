"use client";
import Link from 'next/link';
import { projectActions } from '@/domain/insights';
import { ProjectHealth } from './project-health';
import type { ViewProps } from './workspace-views';
import type { EditableKind } from './record-editor';
import { scoreApproaches, governanceLevel } from '@/domain/method-fit';
import { displayLabel } from '@/content/workspace-i18n';
import { contextQuestions } from '@/content/project-context';

const actionLabel=(ru:boolean,id:string,hasRef:boolean)=>{
 if(id.startsWith('decision-')) return ru?'Принять решение':'Decide';
 if(id.startsWith('change-')) return ru?'Разобрать изменение':'Review change';
 if(id.startsWith('risk-')) return ru?'Обновить риск':'Update risk';
 if(id.startsWith('issue-')||id.startsWith('block-')) return ru?'Разобрать блокер':'Resolve blocker';
 if(id.startsWith('milestone-')||id.startsWith('dependency-')) return ru?'Проверить план':'Review plan';
 if(id.startsWith('quality-')) return ru?'Проверить качество':'Review quality';
 return hasRef?(ru?'Открыть детали':'Open details'):(ru?'Перейти к действию':'Go to action');
};

export function TodayView({workspace,project,locale,onView,onEdit,onCreate}:ViewProps){
 const ru=locale==='ru',signals=projectActions(workspace,project.id,locale),foundation=workspace.experience==='foundation';
 const context=workspace.projectSettings.find(s=>s.projectId===project.id)?.context;
 const references:Record<string,{kind:EditableKind;id:string;owner:string}>={};
 for(const [prefix,kind,rows] of [['block','work',workspace.workItems],['issue','issue',workspace.issues],['risk','risk',workspace.risks],['decision','decision',workspace.decisions],['assumption','assumption',workspace.assumptions],['milestone','milestone',workspace.milestones],['quality','quality',workspace.qualityGates],['dependency','dependency',workspace.dependencies],['change','change',workspace.changes]] as const){for(const row of rows)references[`${prefix}-${row.id}`]={kind,id:row.id,owner:'owner' in row?row.owner:''};}
 const groups=[{id:'decision',title:ru?'Требуется решение':'Requires a decision',items:signals.filter(s=>s.id.startsWith('decision-')||s.id.startsWith('change-'))},{id:'action',title:ru?'Требуется действие':'Requires action',items:signals.filter(s=>!s.id.startsWith('decision-')&&!s.id.startsWith('change-')&&s.severity!=='medium')},{id:'check',title:ru?'Стоит проверить':'Worth checking',items:signals.filter(s=>s.severity==='medium')}];
 const top=signals[0],topRef=top?references[top.id]:undefined;
 const openSignal=(signal:typeof signals[number])=>{const ref=references[signal.id];if(ref)onEdit(ref.kind,ref.id);else onView(signal.view)};
 return <>
  <div className="page-title"><div><h2>{ru?'Приоритеты проекта':'Project priorities'}</h2><p className="muted">{ru?'PMWORK сводит записи проекта в следующий полезный шаг. Сначала главное, затем остальные сигналы.':'PMWORK turns project records into the next useful action. Start with the highest-priority signal.'}</p></div><div className="button-row"><button className="button" onClick={()=>onCreate('work')}>{ru?'Добавить работу':'Add work'}</button><button className="button" onClick={()=>onView('control')}>{ru?'Подготовить статус':'Prepare status'}</button></div></div>
  {top&&<section className="panel priority-focus"><p className="eyebrow">{ru?'Главное сейчас':'Top priority now'}</p><div className="priority-focus-grid"><div><span className={`signal-rank ${top.severity}`}>{top.severity==='critical'?(ru?'Критично':'Critical'):top.severity==='high'?(ru?'Высокий приоритет':'High priority'):(ru?'Проверить':'Review')}</span><h3>{top.title}</h3><p>{top.why}</p>{topRef&&<p><strong>{ru?'Владелец':'Owner'}:</strong> {topRef.owner||(ru?'не назначен':'unassigned')}</p>}<p><strong>{ru?'Следующее действие':'Next action'}:</strong> {top.action}</p></div><div className="priority-focus-action"><button className="button primary" onClick={()=>openSignal(top)}>{actionLabel(ru,top.id,Boolean(topRef))}</button></div></div></section>}
  {!workspace.workItems.some(x=>x.projectId===project.id)&&<section className="panel"><h3>{ru?'Первые три действия':'First three actions'}</h3><ol><li><button className="button small" onClick={()=>onEdit('project',project.id)}>{ru?'Уточнить результат и критерий успеха':'Clarify outcome and success measure'}</button></li><li><button className="button small" onClick={()=>onCreate('milestone')}>{ru?'Зафиксировать ближайшую контрольную точку':'Record the next milestone'}</button></li><li><button className="button small" onClick={()=>onCreate('work')}>{ru?'Добавить ближайшую работу и владельца':'Add the next work item and owner'}</button></li></ol></section>}
  {context&&<details className="panel" open={foundation}><summary>{ru?'Рабочий профиль проекта':'Project operating profile'}</summary><p><strong>{displayLabel(locale,'approach',scoreApproaches(context)[0].approach)}</strong> · {displayLabel(locale,'governance',governanceLevel(context).toLowerCase())}</p><p>{ru?'Причины соответствия: ':'Fit reasons: '}{scoreApproaches(context)[0].reasons.map(k=>contextQuestions[k][locale][0]+` (${context[k]}/5)`).join('; ')}</p><p>{context.volatility>=4?(ru?'Детальный план: 1–2 недели, дальнейшая работа укрупнённо. Причина: изменчивость ≥ 4.':'Detailed plan: 1–2 weeks, broader later milestones. Rule: volatility ≥ 4.'):(ru?'Детальный план до следующей контрольной точки. Причина: изменчивость < 4.':'Plan in detail to the next milestone. Rule: volatility < 4.')}</p><p>{context.dependencies>=4?(ru?'Проверяйте передачи между командами дважды в неделю: зависимости ≥ 4.':'Review cross-team handoffs twice a week: dependencies ≥ 4.'):(ru?'Еженедельный обзор сроков, рисков и решений: зависимости < 4.':'Weekly schedule, risk and decision review: dependencies < 4.')}</p><Link className="button small" href={`/${locale}/tools/?tool=fit`}>{ru?'Сравнить подходы':'Compare approaches'}</Link></details>}
  <div className="today-layout"><div>{groups.map(group=><section className="panel" key={group.id}><h3>{group.title} <span className="muted">{group.items.length}</span></h3>{group.items.length?<ol className="action-list">{group.items.map(signal=>{const ref=references[signal.id];return <li key={signal.id}><span className={`signal-rank ${signal.severity}`}>{signal.severity==='critical'?(ru?'Критично':'Critical'):signal.severity==='high'?(ru?'Высокий':'High'):(ru?'Проверка':'Check')}</span><div><strong>{signal.title}</strong><p>{signal.why}</p>{ref&&<small>{ru?'Владелец':'Owner'}: {ref.owner||(ru?'не указан':'unassigned')}</small>}<p>{signal.action}</p></div><button className="button small" onClick={()=>openSignal(signal)}>{actionLabel(ru,signal.id,Boolean(ref))}</button></li>})}</ol>:<p className="muted">{ru?'Сигналов по текущим записям нет.':'No signals in current records.'}</p>}</section>)}</div><aside><ProjectHealth workspace={workspace} project={project} locale={locale} onView={onView}/></aside></div>
 </>;
}
