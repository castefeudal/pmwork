import {describe,expect,it} from 'vitest';
import {demoWorkspace} from '@/data/demo';
import {formatMilestoneVariance,milestoneVarianceDays} from './milestones';
import {updateMilestone} from './workspace-commands';
describe('milestone lifecycle',()=>{
 it('distinguishes baseline, forecast and actual variance',()=>{const m=demoWorkspace('en').milestones[0];expect(milestoneVarianceDays(m)).toBe(4);expect(formatMilestoneVariance(m,'en')).toBe('+4 days vs baseline');expect(formatMilestoneVariance({...m,actualDate:'2026-09-22',status:'done'},'en')).toBe('Completed 2 days early');});
 it('reports an unchanged baseline honestly',()=>{const m=demoWorkspace('en').milestones[1];expect(formatMilestoneVariance(m,'en')).toBe('On baseline');});
 it('records clearing an actual date without losing lifecycle history',()=>{const w=demoWorkspace('en'),milestone={...w.milestones[0],actualDate:'2026-09-22'};w.milestones[0]=milestone;const updated=updateMilestone(w,milestone.id,{actualDate:undefined});expect(updated.milestones[0].actualDate).toBeUndefined();expect(updated.milestones[0].history.at(-1)).toMatchObject({field:'actualDate',from:'2026-09-22',to:null});});
});
