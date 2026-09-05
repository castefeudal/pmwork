import { describe,it,expect } from 'vitest';
import {demoWorkspace,emptyWorkspace} from '@/data/demo';
import {convertRiskToIssue,generateStatusDraft,changeWorkStatus,updateWorkOwner} from './workspace-commands';
import {migrateWorkspace} from '@/data/storage';
describe('safe workspace commands',()=>{
 it('starts without demo records',()=>{const w=emptyWorkspace('en');for(const value of Object.values(w))if(Array.isArray(value))expect(value).toEqual([]);});
 it('migrates v3 preferences without coupling guidance and density',()=>{const old={...demoWorkspace('en'),schemaVersion:3,density:undefined,experience:'advanced'};const w=migrateWorkspace(old);expect(w.density).toBe('comfortable');expect(w.experience).toBe('advanced');expect(migrateWorkspace(JSON.parse(JSON.stringify(w)))).toEqual(w);});
 it('converts a risk once and retains source linkage',()=>{const w={...demoWorkspace('en'),issues:[]},risk=w.risks[0];const next=convertRiskToIssue(w,risk.id);expect(next.issues.find(i=>i.relatedRiskId===risk.id)?.title).toBe(risk.title);expect(convertRiskToIssue(next,risk.id)).toEqual(next);expect(w.risks[0].status).not.toBe('closed');});
 it('creates an editable status document and records activity',()=>{const w=demoWorkspace('en');const next=generateStatusDraft(w,'atlas','en');expect(next.documents.at(-1)?.body).toContain('Decisions needed');expect(next.activities).toHaveLength(w.activities.length+1);});
 it('keeps completion fields consistent and rejects foreign owner references',()=>{const w=demoWorkspace('en'),item=w.workItems[0];expect(changeWorkStatus(w,item.id,'done').workItems[0].completedAt).toBeTruthy();expect(()=>updateWorkOwner(w,item.id,'missing')).toThrow();});
});
