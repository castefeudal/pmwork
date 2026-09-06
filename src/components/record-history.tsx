import type {Locale,Workspace} from '@/domain/schemas';
import {milestoneVariance,riskExposure} from '@/domain/record-lifecycle';
import {formatDate} from '@/domain/format-date';
export function MilestoneSummary({item,workspace,locale}:{item:Workspace['milestones'][number];workspace:Workspace;locale:Locale}) {
 const ru=locale==='ru',delta=milestoneVariance(item),owner=workspace.teamMembers.find(x=>x.id===item.ownerId&&x.projectId===item.projectId)?.name||item.ownerLabel;
 return <div className="record-summary"><p>{ru?'Обещали':'Baseline'}: {formatDate(item.baselineDate,locale)} · {ru?'Прогноз':'Forecast'}: {formatDate(item.date,locale)}</p><p>{ru?'Факт':'Actual'}: {formatDate(item.actualDate,locale)} · {ru?'Ответственный':'Owner'}: {owner||(ru?'Не назначен':'Unassigned')}</p><p>{delta===null?(ru?'Отклонение не рассчитано: нет исходной или фактической даты.':'Variance unavailable: baseline or actual date is missing.'):delta===0?(ru?'По исходному сроку':'On baseline date'):delta>0?(ru?`Позже на ${delta} дн.`:`${delta} days later`):(ru?`Раньше на ${-delta} дн.`:`${-delta} days earlier`)}</p><p>{ru?'Уверенность':'Confidence'}: {ru?({unknown:'Не оценена',low:'Низкая',medium:'Средняя',high:'Высокая'}[item.confidence??'unknown']):item.confidence??'unknown'}</p>{item.varianceReason&&<p>{item.varianceReason}</p>}</div>;
}
export function RecordHistory({workspace,id,kind,locale}:{workspace:Workspace;id:string;kind:string;locale:Locale}) {
 const ru=locale==='ru';
 if(kind==='work'){
  const item=workspace.workItems.find(x=>x.id===id);if(!item)return null;
  return <details className="wide"><summary>{ru?'История оценок':'Estimate history'}</summary><p>{ru?'Исходная оценка':'Original estimate'}: {item.originalEstimate??(ru?'Не зафиксирована':'Not recorded')} · {ru?'Факт':'Actual'}: {item.actualEffort??'—'}</p><ul>{item.estimateHistory?.map((x,i)=><li key={i}>{x.at} · {x.value??'—'} · {ru?({original:'Исходная',revised:'Пересмотр',imported:'Сохранённая оценка при миграции'}[x.kind]):x.kind}</li>)}</ul><p>{ru?'Старая сохранённая оценка не доказывает, что она была исходной. Сравнивайте записи только в одинаковых единицах.':'A previously saved estimate does not establish the original commitment. Compare records only in consistent units.'}</p></details>;
 }
 if(kind==='milestone'){const item=workspace.milestones.find(x=>x.id===id);return item?<MilestoneSummary item={item} workspace={workspace} locale={locale}/>:null;}
 if(kind==='risk'){
  const item=workspace.risks.find(x=>x.id===id);if(!item)return null;const exposure=riskExposure(item),currency=item.currency??workspace.projects.find(p=>p.id===item.projectId)?.currency;
  return <div className="wide record-summary"><p>{ru?'Ожидаемое денежное влияние':'Expected monetary exposure'}: {exposure.expected===null?'—':Math.round(exposure.expected).toLocaleString(locale)} {currency} · {ru?'После мер':'Residual'}: {exposure.residual===null?'—':Math.round(exposure.residual).toLocaleString(locale)} {currency}</p><p>{ru?'Формула: вероятность (%) / 100 × денежное влияние. Балл 1–5 не переводится в проценты. Для расчёта заполните сумму и вероятность. Итог обновится после сохранения.':'Formula: probability (%) / 100 × monetary impact. The 1–5 score is not converted to a percentage. Enter both amount and probability. Results update after saving.'}</p></div>;
 }
 return null;
}
