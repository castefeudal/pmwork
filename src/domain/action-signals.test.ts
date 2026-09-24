import { describe, expect, it } from 'vitest';
import { demoWorkspace } from '@/data/demo';
import { projectActions } from './action-signals';

describe('explainable project priorities', () => {
  const day = '2026-09-25';
  it('surfaces overdue and today work without duplicating blockers or including archived/completed records', () => {
    const w = demoWorkspace('en'), seed = w.workItems[0]!;
    w.workItems = [
      {...seed, id:'overdue', done:false, blocked:false, dueDate:'2026-09-24'},
      {...seed, id:'today', done:false, blocked:false, dueDate:day},
      {...seed, id:'tomorrow', done:false, blocked:false, dueDate:'2026-09-26'},
      {...seed, id:'blocked', done:false, blocked:true, dueDate:'2026-09-24'},
      {...seed, id:'archived', archived:true, done:false, dueDate:'2026-09-24'},
      {...seed, id:'done', done:true, dueDate:'2026-09-24'},
    ];
    const signals = projectActions(w,seed.projectId,'en',day);
    expect(signals.filter(x=>x.source?.kind==='work').map(x=>x.id)).toEqual(['block-blocked','due-overdue','due-today']);
    expect(signals.find(x=>x.id==='due-today')?.severity).toBe('medium');
  });
  it('surfaces low-score reviews and pending decisions without inventing dates or consequences', () => {
    const w = demoWorkspace('en'), seed=w.risks[0]!, decision=w.decisions[0]!;
    w.risks=[{...seed,id:'review',probability:1,impact:1,status:'open',reviewDate:day},{...seed,id:'closed',status:'closed',reviewDate:'2026-01-01'}];
    w.decisions=[{...decision,id:'unknown',status:'pending',date:'',consequences:'',owner:''}];
    const signals=projectActions(w,seed.projectId,'en',day);
    expect(signals.find(x=>x.id==='risk-review')?.evidence.basis).toBe('heuristic');
    expect(signals.some(x=>x.id==='risk-closed')).toBe(false);
    const unknown=signals.find(x=>x.id==='decision-unknown')!;
    expect(unknown.dueDate).toBeUndefined();
    expect(unknown.evidence.missing).toHaveLength(3);
    expect(unknown.consequence).toMatch(/not recorded/);
  });
  it('exposes linked records and deterministic provenance in both languages without mutating data', () => {
    const w=demoWorkspace('en'), before=JSON.stringify(w);
    const en=projectActions(w,'atlas','en',day), ru=projectActions(w,'atlas','ru',day);
    expect(en.map(x=>x.id)).toEqual(ru.map(x=>x.id));
    expect(en.every(x=>x.evidence.asOf===day && x.evidence.rule && x.affectedIds.length)).toBe(true);
    expect(en.filter(x=>x.source).every(x=>x.affectedIds.includes(x.source!.id))).toBe(true);
    expect(projectActions(w,'atlas','en',day)).toEqual(en);
    expect(JSON.stringify(w)).toBe(before);
  });
  it('rejects invalid evaluation dates', () => {
    const w=demoWorkspace('en');
    for (const day of ['not-a-date','2026-02-30','2026-09-25T00:00:00Z']) expect(()=>projectActions(w,'atlas','en',day)).toThrow('Invalid signal date');
  });
  it('never surfaces cancelled or completed milestones as overdue', () => {
    const w=demoWorkspace('en'), seed=w.milestones[0]!;
    w.milestones=[{...seed,id:'late',status:'on-track',forecastDate:'2026-09-24'},{...seed,id:'cancelled',status:'cancelled',forecastDate:'2026-09-24'},{...seed,id:'done',status:'done',forecastDate:'2026-09-24'}];
    expect(projectActions(w,seed.projectId,'en',day).filter(x=>x.source?.kind==='milestone').map(x=>x.id)).toEqual(['milestone-late']);
    w.milestones=[{...seed,forecastDate:'',date:'',status:'planned'}];
    expect(projectActions(w,seed.projectId,'en',day).filter(x=>x.source?.kind==='milestone')).toEqual([]);
  });
});
