import type { Locale, Workspace } from './schemas';

type Milestone = Workspace['milestones'][number];
const day = 86_400_000;
export function milestoneVarianceDays(milestone: Milestone) {
  const comparison = milestone.actualDate || milestone.forecastDate;
  const baseline = Date.parse(`${milestone.baselineDate}T00:00:00Z`);
  const current = Date.parse(`${comparison}T00:00:00Z`);
  return Number.isFinite(baseline) && Number.isFinite(current) ? Math.round((current-baseline)/day) : null;
}
export function formatMilestoneVariance(milestone: Milestone, locale: Locale) {
  const days=milestoneVarianceDays(milestone),ru=locale==='ru',completed=Boolean(milestone.actualDate);
  if(days===null)return ru?'Отклонение неизвестно':'Variance unknown';
  if(days===0)return ru?(completed?'Завершено по базовому плану':'По базовому плану'):(completed?'Completed on baseline':'On baseline');
  const amount=Math.abs(days);
  if(completed)return ru?`Завершено на ${amount} дн. ${days<0?'раньше':'позже'}`:`Completed ${amount} day${amount===1?'':'s'} ${days<0?'early':'late'}`;
  return ru?`${days>0?'+':''}${days} дн. к базовому плану`:`${days>0?'+':''}${days} day${amount===1?'':'s'} vs baseline`;
}
