import { describe, it, expect } from "vitest";
import { demoWorkspace } from "@/data/demo";
import { workViewConfigSchema, workspaceSchema } from "./schemas";
import { selectWork } from "./work-views";
import { dependencyConflicts } from "./planning";
describe("operational views",()=>{
  const now=new Date("2026-09-05T12:00:00Z");
  const base=demoWorkspace("en").workItems[0]!;
  const items=[{...base,id:"late",status:"in-progress" as const,done:false,dueDate:"2026-09-04",owner:"Ada",priority:"high" as const},{...base,id:"done",status:"done" as const,done:true,dueDate:"2026-09-01"},{...base,id:"soon",done:false,status:"ready" as const,dueDate:"2026-09-09",owner:"",priority:"low" as const}];
  it("excludes completed work from overdue and includes seven-day deadlines",()=>{
    expect(selectWork(items,workViewConfigSchema.parse({preset:"overdue"}),now).map(x=>x.id)).toEqual(["late"]);
    expect(selectWork(items,workViewConfigSchema.parse({preset:"soon"}),now).map(x=>x.id)).toEqual(["soon"]);
  });
  it("does not infer a user identity and preserves source entities",()=>{
    expect(selectWork(items,workViewConfigSchema.parse({preset:"my"}),now)).toEqual([]);
    expect(selectWork(items,workViewConfigSchema.parse({preset:"my",owner:"Ada"}),now).map(x=>x.id)).toEqual(["late"]);
    expect(items[0]!.id).toBe("late");
  });
  it("round trips saved view configuration and upgrades existing v3 backups",()=>{
    const workspace=demoWorkspace("en"),config=workViewConfigSchema.parse({preset:"blocked",sort:"due",group:"owner",type:"board",properties:["owner"]});
    workspace.savedWorkViews=[{id:"v1",projectId:"atlas",name:"Release blockers",config}];
    expect(workspaceSchema.parse(JSON.parse(JSON.stringify(workspace))).savedWorkViews[0]!.config).toEqual(config);
    const legacy={...workspace} as Record<string,unknown>;delete legacy.savedWorkViews;delete legacy.workViewPreferences;
    expect(workspaceSchema.parse(legacy).savedWorkViews).toEqual([]);
  });
  it("detects finish/start lag conflicts and handles other relationship types",()=>{
    const w=demoWorkspace("en");w.workItems=[{...base,id:"a",startDate:"2026-09-01",dueDate:"2026-09-05"},{...base,id:"b",startDate:"2026-09-04",dueDate:"2026-09-10"}];
    w.dependencies=[{id:"d",projectId:base.projectId,predecessorId:"a",successorId:"b",type:"FS",lag:2,owner:"",dueDate:"",status:"open"}];
    expect(dependencyConflicts(w,base.projectId)[0]!.days).toBe(3);
    w.dependencies[0]!.type="SS";expect(dependencyConflicts(w,base.projectId)).toEqual([]);
    w.dependencies[0]!.predecessorId="unknown";expect(dependencyConflicts(w,base.projectId)[0]!.missing).toBe(true);
  });
});
