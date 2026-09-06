import {describe,it,expect} from 'vitest';
import {demoWorkspace} from '@/data/demo';
import {saveScenario} from './tool-scenario';
import {workspaceSchema} from './schemas';
describe('portable tool scenarios',()=>{
 it('preserves inputs and output through JSON export/import without changing the plan',()=>{
  const w=demoWorkspace('en'),next=saveScenario(w,w.projects[0].id,'emv','Expected loss: 250',{probability:25,impact:1000,currency:'USD'},'en');
  const restored=workspaceSchema.parse(JSON.parse(JSON.stringify(next)));
  expect(restored.documents.at(-1)?.body).toContain('Expected loss: 250');expect(restored.documents.at(-1)?.body).toContain('"probability": 25');
  expect(restored.workItems).toEqual(w.workItems);expect(restored.projects).toEqual(w.projects);
 });
 it('rejects an unknown destination',()=>expect(()=>saveScenario(demoWorkspace('en'),'missing','emv','250',{},'en')).toThrow());
});

it.each(['cpm','evm','forecast','priority','flow','ownership','calibration'])('persists a %s decision scenario using the portable document contract',tool=>{
 const w=demoWorkspace('en');const next=saveScenario(w,'atlas',tool,'Reviewed result',{assumptions:'Explicit assumptions'},'en');
 expect(next.documents.at(-1)?.type).toBe(`scenario:${tool}`);expect(next.documents.at(-1)?.body).toContain('Explicit assumptions');
 expect(next.workItems).toEqual(w.workItems);
});
