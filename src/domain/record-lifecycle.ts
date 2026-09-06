import type {Risk,Workspace} from './schemas';
export function riskExposure(r:Risk) {
 const expected=r.monetaryImpact!==undefined&&r.probabilityPercent!==undefined?r.monetaryImpact*r.probabilityPercent/100:null;
 const residual=r.residualMonetaryImpact!==undefined&&r.residualProbabilityPercent!==undefined?r.residualMonetaryImpact*r.residualProbabilityPercent/100:null;
 return {expected,residual};
}
export function milestoneVariance(m:Workspace['milestones'][number]) {
 const current=m.status==='done'?m.actualDate:m.date;
 if(!m.baselineDate||!current)return null;
 const delta=(Date.parse(current)-Date.parse(m.baselineDate))/86400000;
 return Number.isFinite(delta)?Math.round(delta):null;
}
