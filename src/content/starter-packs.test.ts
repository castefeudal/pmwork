import {describe,expect,it} from 'vitest';
import {demoWorkspace,emptyWorkspace} from '@/data/demo';
import {workspaceSchema} from '@/domain/schemas';
import {applyStarterPackBundle,starterPacks,starterSections} from './starter-packs';
describe('starter packs',()=>{
 for(const pack of starterPacks)it(`${pack.id} creates a coherent selectable bundle`,()=>{const empty=emptyWorkspace('en'),project={...demoWorkspace('en').projects[0],id:`p-${pack.id}`,demo:false,type:pack.type};const seeded={...empty,projects:[project],projectSettings:[{projectId:project.id,enabledTypes:['task' as const],wipLimits:{},governance:project.governance,probabilityScale:5,impactScale:5}]};const result=workspaceSchema.parse(applyStarterPackBundle(seeded,pack.id,project.id,'en',[...starterSections],'2026-09-14T00:00:00.000Z'));const milestoneIds=new Set(result.milestones.map(x=>x.id)),decisionIds=new Set(result.decisions.map(x=>x.id));expect(result.workItems.length).toBeGreaterThan(0);expect(result.workItems[0].status).toBe('ready');expect(result.workItems.every(x=>!x.milestoneId||milestoneIds.has(x.milestoneId))).toBe(true);expect(result.documents.flatMap(x=>x.relatedIds).every(id=>milestoneIds.has(id)||decisionIds.has(id))).toBe(true);expect(result.stakeholders.every(x=>x.name.startsWith('Role:'))).toBe(true);});
});
