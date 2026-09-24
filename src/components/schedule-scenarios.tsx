"use client";
import { useState } from 'react';
import { applyScheduleScenario, previewScheduleScenario, type ScheduleScenario } from '@/domain/schedule-scenarios';
import { WorkspaceMore } from './workspace-more';
import { CollectionPager } from './collection-pager';
import type { ViewProps } from './workspace-views';

export default function ScheduleScenarios({workspace,project,locale,onChange}:ViewProps) {
  const ru=locale==='ru';
  const [choices,setChoices]=useState([{days:7,workId:'',milestones:false},{days:14,workId:'',milestones:false}]);
  const [pending,setPending]=useState<ScheduleScenario|null>(null),[undo,setUndo]=useState<ScheduleScenario|null>(null),[message,setMessage]=useState(''),[page,setPage]=useState(0);
  const items=workspace.workItems.filter(x=>x.projectId===project.id&&!x.done&&!x.archived);
  const previews=choices.map((choice,index)=>previewScheduleScenario(workspace,project.id,`${ru?'Сценарий':'Scenario'} ${index===0?'A':'B'} (${choice.days>0?'+':''}${choice.days} ${ru?'дн.':'days'})`,choice.days,items.some(x=>x.id===choice.workId)?choice.workId:undefined,choice.milestones));
  const apply=(draft:ScheduleScenario,isUndo=false)=>{
    try {
      const result=applyScheduleScenario(workspace,draft);
      onChange(result.workspace);setUndo(isUndo?null:result.undo);setPending(null);
      setMessage(ru?'Изменения сохранены. Базовый план не изменён.':'Changes saved. Baselines are unchanged.');
    } catch { setMessage(ru?'План изменился после предпросмотра. Сравните сценарии заново.':'The schedule changed after preview. Compare the scenarios again.');setPending(null); }
  };
  return <section className="panel">
    <h3>{ru?'Сравнить сценарии сроков':'Compare schedule scenarios'}</h3>
    <p className="muted">{ru?'Проверьте перенос дат перед изменением проекта. Черновики существуют только на этом экране; данные изменятся после просмотра и подтверждения.':'Test date changes before updating the project. Drafts exist only on this screen; records change after review and confirmation.'}</p>
    <div className="scenario-comparison">
      {choices.map((choice,index)=>{const preview=previews[index];return <section className="scenario-option" key={index}>
        <h4>{ru?'Сценарий':'Scenario'} {index===0?'A':'B'}</h4>
        <label className="view-control">{ru?'Работа':'Work'}<select className="input" value={items.some(x=>x.id===choice.workId)?choice.workId:''} onChange={e=>setChoices(choices.map((c,i)=>i===index?{...c,workId:e.target.value}:c))}><option value="">{ru?'Вся незавершённая работа':'All unfinished work'}</option>{items.map(x=><option key={x.id} value={x.id}>{x.id} · {x.title}</option>)}</select></label>
        <label className="view-control">{ru?'Сдвиг, календарных дней':'Shift, calendar days'}<input className="input" type="number" min={-3650} max={3650} step={1} value={choice.days} onChange={e=>{const days=Number(e.target.value);if(Number.isInteger(days)&&Math.abs(days)<=3650)setChoices(choices.map((c,i)=>i===index?{...c,days}:c));}}/></label>
        <label className="scenario-checkbox"><input type="checkbox" checked={choice.milestones} onChange={e=>setChoices(choices.map((c,i)=>i===index?{...c,milestones:e.target.checked}:c))}/>{ru?'Также сдвинуть прогноз контрольных точек':'Also shift milestone forecasts'}</label>
        <p>{ru?'Изменится работа':'Work items changed'}: <strong>{preview.work.length}</strong> · {ru?'Контрольные точки':'Milestones'}: <strong>{preview.milestones.length}</strong></p>
        <p>{ru?'Конфликты зависимостей':'Dependency conflicts'}: {preview.conflictsBefore} → <strong>{preview.conflictsAfter}</strong></p>
        <p>{ru?'Работа без дат (остаётся без изменений)':'Unscheduled work (unchanged)'}: {preview.unscheduled}</p>
        <button className="button" disabled={!preview.work.length&&!preview.milestones.length} onClick={()=>{setPending(preview);setPage(0);}}>{ru?'Просмотреть изменения':'Review changes'} {index===0?'A':'B'}</button>
      </section>})}
    </div>
    <p className="muted">{ru?'Сдвиг дат не рассчитывает загрузку, стоимость или вероятность соблюдения срока. Зависимости проверяются без автоматического перепланирования. Базовый план, факт и целевая дата проекта сохраняются.':'Date shifts do not calculate capacity, cost or deadline probability. Dependencies are checked without automatic rescheduling. Baselines, actuals and the project target date are preserved.'}</p>
    {message&&<p role="status">{message}</p>}
    {undo&&undo.projectId===project.id&&<button className="button" onClick={()=>apply(undo,true)}>{ru?'Отменить последний сценарий':'Undo last scenario'}</button>}
    {pending&&<WorkspaceMore title={ru?'Подтвердить изменение плана':'Confirm schedule changes'} onClose={()=>setPending(null)}>
      <p>{pending.name}</p>
      <p>{ru?'Изменятся только показанные даты. Базовый план и фактические даты сохраняются.':'Only the listed dates will change. Baselines and actual dates are preserved.'}</p>
      <CollectionPager page={page} size={50} total={pending.work.length+pending.milestones.length} locale={locale} label={ru?'Страницы изменений':'Change pages'} onPage={setPage}/>
      <ul className="scenario-diff">{[...pending.work.map(x=>({id:x.id,title:x.title,before:`${x.before.startDate||'—'} → ${x.before.dueDate||'—'}`,after:`${x.after.startDate||'—'} → ${x.after.dueDate||'—'}`})),...pending.milestones.map(x=>({id:x.id,title:x.title,before:x.before,after:x.after}))].slice(page*50,(page+1)*50).map(x=><li key={x.id}><strong>{x.id} · {x.title}</strong><div>{x.before} ⇒ {x.after}</div></li>)}</ul>
      <p>{ru?'Конфликты зависимостей':'Dependency conflicts'}: {pending.conflictsBefore} → {pending.conflictsAfter}</p>
      <button className="button primary" onClick={()=>apply(pending)}>{ru?'Применить показанные изменения':'Apply reviewed changes'}</button>
    </WorkspaceMore>}
  </section>;
}
