import { it,expect } from 'vitest';
import { demoWorkspace } from '@/data/demo';
import { projectActions } from './action-signals';
import { selectWork } from './work-views';
import { workViewConfigSchema } from './schemas';
import { previewScheduleScenario } from './schedule-scenarios';

for(const [projects,count] of [[1,20],[10,1000],[50,10000]])it(`queries ${projects} projects / ${count} work records without mutation`,()=>{
  const w=demoWorkspace('en'),seed=w.workItems[0],project=w.projects[0];
  w.projects=Array.from({length:projects},(_,i)=>({...project,id:`project-${i}`}));
  w.workItems=Array.from({length:count},(_,i)=>({...seed,id:`work-${i}`,projectId:`project-${i%projects}`,blocked:false,done:false,status:'ready' as const,dueDate:'2026-09-24',startDate:'2026-09-01',dependencies:[],riskIds:[],milestoneId:undefined}));
  w.dependencies=[];w.milestones=[];
  const started=performance.now();
  const selected=selectWork(w.workItems,workViewConfigSchema.parse({query:'work-',preset:'overdue'}),new Date('2026-09-25T12:00:00Z'));
  expect(selected).toHaveLength(count);
  const signals=projectActions(w,'project-0','en','2026-09-25');
  expect(signals.filter(x=>x.category==='due')).toHaveLength(count/projects);
  const scenario=previewScheduleScenario(w,'project-0','large',7);
  expect(scenario.work).toHaveLength(count/projects);
  expect(performance.now()-started).toBeLessThan(1000);
  expect(w.workItems[0].dueDate).toBe('2026-09-24');
});
