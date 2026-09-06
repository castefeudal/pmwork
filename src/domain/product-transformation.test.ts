import {describe,it,expect} from 'vitest';
import {migrateWorkspace} from '@/data/storage';
import {demoWorkspace} from '@/data/demo';
import {templates} from '@/content/catalog';
import {templateDocument} from './template-document';
import {intentRank} from './search-intent';
import {projectNetwork} from './project-tool-data';
import {defaultContext} from '@/content/project-context';
describe('contextual workbench',()=>{
it('migrates v4 without changing ownership, views or locale and round trips context',()=>{const original=demoWorkspace('ru');original.projectSettings[0].context=defaultContext;const migrated=migrateWorkspace({...original,schemaVersion:4});expect(migrated.schemaVersion).toBe(6);for(const key of ['projects','savedWorkViews','locale','projectSettings'] as const)expect(migrated[key]).toEqual(original[key]);expect(migrated.workItems.map(({estimateHistory,...item})=>{expect(estimateHistory?.[0].kind).toBe("imported");return item})).toEqual(original.workItems);expect(migrateWorkspace(JSON.parse(JSON.stringify(migrated)))).toEqual(migrated)});
it('rejects malformed context and unknown future schema',()=>{const w=demoWorkspace('en');expect(()=>migrateWorkspace({...w,schemaVersion:999})).toThrow();w.projectSettings[0].context={...defaultContext,uncertainty:6};expect(()=>migrateWorkspace(w)).toThrow()});
it('personalizes templates without inserting demonstration facts',()=>{const w=demoWorkspace('en'),t=templates[0],body=templateDocument(t,w,'atlas','en','minimal');expect(body).toContain(w.projects[0].objective);expect(body).not.toContain('Course launch');expect(templateDocument(t,w,'atlas','en','detailed').length).toBeGreaterThan(body.length);expect(()=>templateDocument(t,w,'missing','en','minimal')).toThrow()});
it('finds relevant mixed resources from problem language',()=>{expect(intentRank('проект опаздывает','playbooks-project-late')).toBeGreaterThan(0);expect(intentRank('проект опаздывает','cpm')).toBeGreaterThan(0);expect(intentRank('заказчик меняет требования','templates-change-request')).toBeGreaterThan(0);expect(intentRank('WBS','cpm')).toBe(0)});
it('does not reinterpret effort as duration or drop unsupported dependency semantics',()=>{const w=demoWorkspace('en');w.workItems=[{...w.workItems[0],done:false,dependencies:[],startDate:'2026-01-01',dueDate:'2026-01-04',estimate:99}];w.dependencies=[];expect(projectNetwork(w,w.workItems[0].projectId)[0].duration).toBe(3);w.dependencies=[{id:'dep',projectId:w.workItems[0].projectId,predecessorId:'a',successorId:'b',type:'SS',lag:0,owner:'',dueDate:'',status:'open'}];expect(()=>projectNetwork(w,w.workItems[0].projectId)).toThrow()});
});
