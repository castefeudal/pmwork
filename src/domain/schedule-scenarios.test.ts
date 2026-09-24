import { describe, it, expect } from 'vitest';
import { demoWorkspace } from '@/data/demo';
import { previewScheduleScenario, applyScheduleScenario } from './schedule-scenarios';

describe('isolated schedule scenarios',()=>{
  it('compares two scenarios without mutations and preserves unknown dates',()=>{
    const w=demoWorkspace('en'),before=JSON.stringify(w);
    const a=previewScheduleScenario(w,'atlas','A',7,undefined,true),b=previewScheduleScenario(w,'atlas','B',14,undefined,true);
    expect(a.work.length).toBeGreaterThan(0);
    expect(a.milestones.length).toBeGreaterThan(0);
    expect(a.work[0].after).not.toEqual(b.work[0].after);
    expect(JSON.stringify(w)).toBe(before);
    const item=w.workItems.find(x=>x.projectId==='atlas'&&!x.done)!;
    item.startDate=undefined;item.dueDate=undefined;
    const unscheduled=previewScheduleScenario(w,'atlas','Unknown',7,item.id);
    expect(unscheduled.work).toEqual([]);
    expect(unscheduled.unscheduled).toBe(1);
  });
  it('applies dates transactionally, records history, and supports an inverse without resetting unrelated edits',()=>{
    const w=demoWorkspace('en'),draft=previewScheduleScenario(w,'atlas','A',7,undefined,true);
    const {workspace:next,undo}=applyScheduleScenario(w,draft);
    expect(next.milestones.map(x=>x.baselineDate)).toEqual(w.milestones.map(x=>x.baselineDate));
    expect(next.milestones.map(x=>x.actualDate)).toEqual(w.milestones.map(x=>x.actualDate));
    expect(next.budgets).toEqual(w.budgets);
    expect(next.projects).toEqual(w.projects);
    expect(next.workItems.filter(x=>x.done)).toEqual(w.workItems.filter(x=>x.done));
    const m=next.milestones.find(x=>x.id===draft.milestones[0].id)!;
    expect(m.history.at(-1)?.reason).toBe('A');
    next.documents[0]={...next.documents[0],title:'Independent document edit'};
    const restored=applyScheduleScenario(next,undo).workspace;
    expect(restored.workItems.map(x=>[x.startDate,x.dueDate])).toEqual(w.workItems.map(x=>[x.startDate,x.dueDate]));
    expect(restored.milestones.map(x=>x.forecastDate)).toEqual(w.milestones.map(x=>x.forecastDate));
    expect(restored.documents[0].title).toBe('Independent document edit');
    expect(restored.activities).toHaveLength(w.activities.length+2);
  });
  it('rejects stale previews and undo after another schedule edit',()=>{
    const w=demoWorkspace('en'),draft=previewScheduleScenario(w,'atlas','A',7);
    const result=applyScheduleScenario(w,draft);
    expect(()=>applyScheduleScenario(result.workspace,draft)).toThrow('stale');
    const changed=structuredClone(result.workspace);
    changed.workItems.find(x=>x.id===draft.work[0].id)!.dueDate='2027-01-01';
    expect(()=>applyScheduleScenario(changed,result.undo)).toThrow('stale');
  });
  it('checks dependency consequences of changing just one record and restricts milestone changes to its links',()=>{
    const w=demoWorkspace('en');
    const d=w.dependencies.find(x=>x.projectId==='atlas')!;
    const target=w.workItems.find(x=>x.id===d.predecessorId)!;
    const draft=previewScheduleScenario(w,'atlas','Dependency delay',30,target.id,true);
    expect(draft.work.map(x=>x.id)).toEqual([target.id]);
    expect(draft.milestones.every(x=>x.id===target.milestoneId)).toBe(true);
    expect(draft.conflictsAfter).toBeGreaterThanOrEqual(draft.conflictsBefore);
  });
});
