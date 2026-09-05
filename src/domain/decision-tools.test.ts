import {describe,it,expect} from 'vitest';
import {riskEMV,decisionMatrix,deadlineConfidence,capacityPlan,estimateCalibration,dailyHistory,ownershipCoverage} from './decision-tools';
import {demoWorkspace} from '@/data/demo';
describe('decision tools',()=>{
it('separates monetary and residual exposure',()=>{expect(riskEMV([{probability:25,impact:1000,residualProbability:10,residualImpact:500}])).toMatchObject({total:250,residual:50,allOccur:1000});expect(riskEMV([]).total).toBe(0)});
it('rejects invalid monetary probability and nonfinite input',()=>{expect(()=>riskEMV([{probability:101,impact:10,residualProbability:0,residualImpact:0}])).toThrow();expect(()=>capacityPlan(NaN,1,1,1,1)).toThrow()});
it('ranks alternatives with normalized contributions and tests sensitivity',()=>{const r=decisionMatrix([50,50],[[10,0],[0,9]]);expect(r.ranking[0].index).toBe(0);expect(r.ranking[0].contributions.reduce((a,b)=>a+b,0)).toBe(5);expect(r.sensitivity.some(s=>s.winner===1)).toBe(true)});
it('rejects zero weights and mismatched scores',()=>{expect(()=>decisionMatrix([0],[[1]])).toThrow();expect(()=>decisionMatrix([1,2],[[1]])).toThrow()});
it('forecasts reproducibly using full calendar-day samples',()=>{const args=[Array(14).fill(1),10,'2026-01-01','2026-01-11'] as const;expect(deadlineConfidence(...args)).toMatchObject({p50:'2026-01-11',proportion:1});expect(deadlineConfidence(...args)).toEqual(deadlineConfidence(...args));expect(deadlineConfidence(Array(14).fill(1),0,'2026-01-01','2026-01-01').proportion).toBe(1)});
it('rejects short/empty/zero histories and past targets',()=>{for(const s of [[],[1,2,3],Array(14).fill(0)])expect(()=>deadlineConfidence(s,5,'2026-01-01','2026-01-20')).toThrow();expect(()=>deadlineConfidence(Array(14).fill(1),1,'2026-02-01','2026-01-01')).toThrow()});
it('keeps capacity unknown without denominators',()=>{expect(capacityPlan(0,10,3,0,5)).toEqual({overload:10,utilization:null,impliedDays:null,wipTarget:null});expect(capacityPlan(40,50,4,2,3).wipTarget).toBe(6)});
it('requires ten comparable estimates',()=>{const w=demoWorkspace('en');w.workItems=[];expect(estimateCalibration(w,w.projects[0].id)).toMatchObject({count:0,medianRatio:null,minimum:10});expect(dailyHistory(w,w.projects[0].id,'2026-01-01')).toBeNull()});
it('finds unassigned work without inventing missing milestones owners',()=>{const w=demoWorkspace('en'),x=w.workItems[0];x.owner='';x.ownerId=undefined;x.done=false;expect(ownershipCoverage(w,x.projectId).some(r=>r.id===x.id&&r.reason==='unassigned')).toBe(true)});
});
