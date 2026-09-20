import { describe,it,expect } from 'vitest';
import {demoWorkspace,emptyWorkspace} from '@/data/demo';
import {convertRiskToIssue,generateStatusDraft,changeWorkStatus,removeWorkspaceRecord,updateWorkOwner,updateWork} from './workspace-commands';
import {migrateWorkspace} from '@/data/storage';
describe('safe workspace commands',()=>{
 it('starts without demo records',()=>{const w=emptyWorkspace('en');for(const value of Object.values(w))if(Array.isArray(value))expect(value).toEqual([]);});
 it('migrates v3 preferences without coupling guidance and density',()=>{const old={...demoWorkspace('en'),schemaVersion:3,density:undefined,experience:'advanced'};const w=migrateWorkspace(old);expect(w.density).toBe('comfortable');expect(w.experience).toBe('advanced');expect(migrateWorkspace(JSON.parse(JSON.stringify(w)))).toEqual(w);});
 it('converts a risk once and retains source linkage',()=>{const w={...demoWorkspace('en'),issues:[]},risk=w.risks[0];const next=convertRiskToIssue(w,risk.id);expect(next.issues.find(i=>i.relatedRiskId===risk.id)?.title).toBe(risk.title);expect(convertRiskToIssue(next,risk.id)).toEqual(next);expect(w.risks[0].status).not.toBe('closed');});
 it('creates an editable status document and records activity',()=>{const w=demoWorkspace('en');const next=generateStatusDraft(w,'atlas','en');expect(next.documents.at(-1)?.body).toContain('Decisions needed');expect(next.activities).toHaveLength(w.activities.length+1);});
 it('keeps completion fields consistent and rejects foreign owner references',()=>{const w=demoWorkspace('en'),item=w.workItems[0];expect(changeWorkStatus(w,item.id,'done').workItems[0].completedAt).toBeTruthy();expect(()=>updateWorkOwner(w,item.id,'missing')).toThrow();});
 it('records prospective status evidence without fabricating legacy start times',()=>{
  const w=demoWorkspace('en'),item=w.workItems.find(x=>x.status==='ready'||x.status==='backlog')!;
  expect(item.startedAt).toBeUndefined();expect(item.statusHistory).toBeUndefined();
  const started=changeWorkStatus(w,item.id,'in-progress').workItems.find(x=>x.id===item.id)!;
  expect(started.startedAt).toBeTruthy();expect(started.statusHistory?.at(-1)).toMatchObject({from:item.status,to:'in-progress'});
  const done=changeWorkStatus({...w,workItems:w.workItems.map(x=>x.id===item.id?started:x)},item.id,'done').workItems.find(x=>x.id===item.id)!;
  expect(done.completedAt).toBeTruthy();expect(done.startedAt).toBe(started.startedAt);expect(done.statusHistory).toHaveLength(2);
  const legacy={...item,status:'in-progress' as const};
  const legacyWorkspace={...w,workItems:w.workItems.map(x=>x.id===item.id?legacy:x)};
  const untouched=updateWork(legacyWorkspace,item.id,{priority:'high'}).workItems.find(x=>x.id===item.id)!;
  expect(untouched.startedAt).toBeUndefined();expect(untouched.statusHistory).toBeUndefined();
 });
 it('reconciles text reassignment with stable owner references',()=>{
  const w=demoWorkspace('en'),item=w.workItems[0],members=w.teamMembers.filter(m=>m.projectId===item.projectId);
  const assigned=updateWorkOwner(w,item.id,members[0].id);
  const reassigned=updateWork(assigned,item.id,{owner:members[1].name}).workItems[0];
  expect(reassigned.ownerId).toBe(members[1].id);expect(reassigned.ownerLabel).toBe(members[1].name);
  const external=updateWork(assigned,item.id,{owner:'External partner'}).workItems[0];
  expect(external.ownerId).toBeUndefined();expect(external.ownerLabel).toBe('External partner');
 });
 it('retains ownership through renaming and falls back after member removal',()=>{
  const w=demoWorkspace('en'),item=w.workItems[0],member=w.teamMembers.find(m=>m.projectId===item.projectId)!;
  const assigned=updateWorkOwner(w,item.id,member.id);
  assigned.teamMembers=assigned.teamMembers.map(m=>m.id===member.id?{...m,name:'New name'}:m);
  expect(updateWork(assigned,item.id,{priority:'high'}).workItems[0].owner).toBe('New name');
  assigned.teamMembers=assigned.teamMembers.filter(m=>m.id!==member.id);
  const retained=changeWorkStatus(assigned,item.id,'review').workItems[0];
  expect(retained.ownerId).toBeUndefined();expect(retained.owner).toBe(member.name);
 });

 it('removes referenced records without corrupting the workspace graph',()=>{
  const w=demoWorkspace('en');
  const withoutWork=removeWorkspaceRecord(w,'work','PW-103');
  expect(withoutWork.workItems.some(item=>item.id==='PW-103')).toBe(false);
  expect(withoutWork.dependencies.some(dep=>dep.predecessorId==='PW-103'||dep.successorId==='PW-103')).toBe(false);
  expect(withoutWork.issues.some(issue=>issue.relatedWorkIds.includes('PW-103'))).toBe(false);
  expect(withoutWork.iterations.some(iteration=>iteration.workItemIds.includes('PW-103'))).toBe(false);
  const withoutRisk=removeWorkspaceRecord(w,'risk','R-1');
  expect(withoutRisk.issues.find(issue=>issue.id==='I-1')?.relatedRiskId).toBeUndefined();
  expect(withoutRisk.workItems.every(item=>!item.riskIds.includes('R-1'))).toBe(true);
 });
});
