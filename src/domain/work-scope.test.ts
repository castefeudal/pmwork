import {expect,it} from "vitest";
import {emptyWorkspace,demoWorkspace} from "@/data/demo";
import {operationSchema} from "./management-entities";
import {contextWorkspace,applyContextWorkspace,scopeKey} from "./work-scope";
import {assertWorkspaceGraph} from "./workspace-integrity";
import {migrateWorkspace} from "@/data/storage";
it("persists shared operation work without creating a project",()=>{
  const source=emptyWorkspace("en");source.operations=[operationSchema.parse({id:"service",name:"Customer support",purpose:"Restore service"})];
  const scope={kind:"operation",id:"service"} as const,view=contextWorkspace(source,scope);
  view.workItems=[{...demoWorkspace("en").workItems[0],id:"service-work",projectId:scopeKey(scope),dependencies:[],riskIds:[],objectiveIds:[],ownerId:undefined,milestoneId:undefined,iterationId:undefined}];
  const result=applyContextWorkspace(source,view,scope);
  expect(result.projects).toEqual([]);expect(result.workItems[0].workScope).toEqual(scope);expect(result.workItems[0].projectId).toBe("@operation/service");
  expect(migrateWorkspace(JSON.parse(JSON.stringify(result)))).toEqual(result);
});
it("preserves unrelated project work and prevents cross-context references",()=>{
  const source=demoWorkspace("en");source.operations=[operationSchema.parse({id:"service",name:"Customer support",purpose:"Restore service"})];
  const scope={kind:"operation",id:"service"} as const,view=contextWorkspace(source,scope);
  view.workItems=[...source.workItems,{...source.workItems[0],id:"service-work",projectId:scopeKey(scope),dependencies:[],riskIds:[],objectiveIds:[],ownerId:undefined,milestoneId:undefined,iterationId:undefined}];
  const result=applyContextWorkspace(source,view,scope);
  expect(result.workItems.filter(row=>!row.workScope)).toEqual(source.workItems);
  result.workItems.at(-1)!.dependencies=[source.workItems[0].id];expect(()=>assertWorkspaceGraph(result)).toThrow(/belongs to another project/);
});
it("rejects unknown contexts and mismatched compatibility keys",()=>{
  const source=emptyWorkspace("en");source.operations=[operationSchema.parse({id:"service",name:"Customer support",purpose:"Restore service"})];
  const row={...demoWorkspace("en").workItems[0],projectId:"wrong",workScope:{kind:"operation",id:"service"} as const,dependencies:[],riskIds:[],objectiveIds:[],ownerId:undefined,milestoneId:undefined};source.workItems=[row];
  expect(()=>assertWorkspaceGraph(source)).toThrow(/Context key/);
  source.workItems[0].projectId="@operation/missing";source.workItems[0].workScope={kind:"operation",id:"missing"};expect(()=>assertWorkspaceGraph(source)).toThrow(/Unknown operating context/);
});
