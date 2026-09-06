import {it,expect} from 'vitest';
import {demoWorkspace} from '@/data/demo';
import {migrateWorkspace} from '@/data/storage';
import {updateWork} from './workspace-commands';
import {workspaceSchema,riskSchema} from './schemas';
import {riskExposure,milestoneVariance} from './record-lifecycle';
it('migrates v5 without inventing original commitments or losing dates',()=>{
 const old=demoWorkspace('en');const w=migrateWorkspace({...old,schemaVersion:5});
 expect(w.schemaVersion).toBe(6);expect(w.milestones).toEqual(old.milestones);
 expect(w.workItems[0].originalEstimate).toBeUndefined();expect(w.workItems[0].estimateHistory?.[0].kind).toBe('imported');
 expect(migrateWorkspace(JSON.parse(JSON.stringify(w)))).toEqual(w);
});
it('appends estimate revisions and preserves the initial estimate',()=>{
 let w=demoWorkspace('en');const item=w.workItems[0];item.estimate=undefined;
 w=updateWork(w,item.id,{estimate:4});w=updateWork(w,item.id,{estimate:7});w=updateWork(w,item.id,{actualEffort:6});
 expect(w.workItems[0].originalEstimate).toBe(4);expect(w.workItems[0].estimateHistory?.map(x=>x.value)).toEqual([4,7]);
 expect(workspaceSchema.parse(JSON.parse(JSON.stringify(w)))).toEqual(w);
});
it('calculates monetary exposure only from explicit percentages and amounts',()=>{
 const risk=demoWorkspace('en').risks[0];expect(riskExposure(risk).expected).toBeNull();
 expect(riskExposure({...risk,monetaryImpact:1000,probabilityPercent:25,residualMonetaryImpact:500,residualProbabilityPercent:10})).toEqual({expected:250,residual:50});
 expect(()=>riskSchema.parse({...risk,probabilityPercent:101})).toThrow();
});
it('uses actual dates for completed milestones and never fabricates a baseline',()=>{
 const m=demoWorkspace('en').milestones[0];expect(milestoneVariance(m)).toBeNull();
 expect(milestoneVariance({...m,baselineDate:'2026-09-01',date:'2026-09-04',status:'planned'})).toBe(3);
 expect(milestoneVariance({...m,baselineDate:'2026-09-01',actualDate:'2026-09-02',date:'2026-09-04',status:'done'})).toBe(1);
});
