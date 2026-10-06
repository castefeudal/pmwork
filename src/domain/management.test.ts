import { describe, expect, it } from "vitest";
import { demoWorkspace, emptyWorkspace } from "@/data/demo";
import { migrateWorkspace } from "@/data/storage";
import { programSchema, operationSchema } from "./management-entities";
import { managementSignals } from "./management-signals";
import { assertWorkspaceGraph, validateWorkspaceGraph } from "./workspace-integrity";
import { acrossProjectSignals } from "./across-work-signals";
import { projectActions } from "./action-signals";

describe("management operating contexts",()=>{
  it("indexes all-work signals without changing project rule evidence",()=>{
    const workspace=demoWorkspace("en"),day="2026-10-06";
    const expected=workspace.projects.flatMap(project=>projectActions(workspace,project.id,"en",day).map(signal=>({project,signal})));
    expect(acrossProjectSignals(workspace,"en",day)).toEqual(expected);
  });
  it("migrates true v6 payloads without inventing role or operational evidence",()=>{
    const current=demoWorkspace("ru");
    const old:Record<string,unknown>={...current}; for(const key of ["managementRole","roleLenses","programs","operations"]) delete old[key];
    const result=migrateWorkspace({...old,schemaVersion:6});
    expect(result.schemaVersion).toBe(7);
    expect(result.managementRole).toBe("project");
    expect(result.projects).toEqual(current.projects);
    expect(result.workItems).toEqual(current.workItems);
    expect(result.operations).toEqual([]);
  });
  it("keeps role, experience, density and additional lenses independent through backups",()=>{
    const w=demoWorkspace("en");w.managementRole="operations";w.roleLenses=["delivery"];w.experience="advanced";w.density="comfortable";
    expect(migrateWorkspace(JSON.parse(JSON.stringify(w)))).toEqual(w);
  });
  it("supports ongoing operations with no project or final date",()=>{
    const w=emptyWorkspace("en");w.operations=[operationSchema.parse({id:"service",name:"Customer support",purpose:"Restore service",metrics:[{id:"sla",name:"Resolution",unit:"hours",target:4,direction:"at-most"}]})];
    expect(()=>assertWorkspaceGraph(w)).not.toThrow();
    const signals=managementSignals(w,"en","2026-10-06");
    expect(signals).toHaveLength(1);expect(signals[0].confidence).toBe("insufficient-evidence");expect(signals[0].missingEvidence).toEqual(["observation"]);
    expect(migrateWorkspace(JSON.parse(JSON.stringify(w)))).toEqual(w);
  });
  it("rejects missing components, self dependencies and duplicated nested ids",()=>{
    const w=demoWorkspace("en");w.programs=[programSchema.parse({id:"program",name:"Transformation",outcome:"Reduce customer waiting",projectIds:["atlas"],dependencies:[{id:"d",fromProjectId:"atlas",toProjectId:"atlas",description:"Handoff",status:"open"}]})];
    expect(validateWorkspaceGraph(w).map(issue=>issue.code)).toContain("self-dependency");
    w.programs[0].dependencies[0].toProjectId="missing";
    expect(validateWorkspaceGraph(w).map(issue=>issue.code)).toContain("missing-component");
    w.programs[0].dependencies=[];
    w.programs[0].benefits=[{id:"b",name:"Waiting time",owner:"",unit:"",measurementPlan:"",projectIds:[]},{id:"b",name:"Cost savings",owner:"",unit:"",measurementPlan:"",projectIds:[]}];
    expect(validateWorkspaceGraph(w).map(issue=>issue.code)).toContain("duplicate-id");
  });
  it("ranks deterministically, preserves source and excludes future observations",()=>{
    const w=emptyWorkspace("en");w.operations=[operationSchema.parse({id:"ops",name:"Customer support",purpose:"Restore service",incidents:[{id:"i",title:"Repeat outage",openedAt:"2026-10-01",recurring:true}],metrics:[{id:"m",name:"Response",unit:"hours",target:4,direction:"at-most",observations:[{at:"2026-10-01",value:5},{at:"2026-10-07",value:1}]}]})];
    const signals=managementSignals(w,"en","2026-10-06");
    expect(signals.map(s=>s.group)).toEqual(["act","act"]);
    expect(signals[0].id).toBe("incident-ops-i");expect(signals[1].why).toContain("5 hours");
    expect(signals[1].source).toEqual({collection:"operations",id:"ops",recordId:"m"});
    expect(managementSignals(w,"en","2026-10-06")).toEqual(signals);
    expect(managementSignals(w,"ru","2026-10-06").map(s=>s.id)).toEqual(signals.map(s=>s.id));
    expect(()=>managementSignals(w,"en","2026-02-30")).toThrow();
  });
  it("does not combine missing capacity evidence with a healthy status",()=>{
    const w=emptyWorkspace("en");w.operations=[operationSchema.parse({id:"ops",name:"Customer support",purpose:"Restore service",demand:10,capacity:4})];
    expect(managementSignals(w,"en","2026-10-06")[0].confidence).toBe("insufficient-evidence");
  });
});

it("keeps undated and future program benefit observations unknown",()=>{
 const w=emptyWorkspace("en");w.programs=[programSchema.parse({id:"p",name:"Service change",outcome:"Reduce waiting",benefits:[{id:"b",name:"Waiting time",owner:"Alex",unit:"h",baseline:8,target:4,actual:3,measurementPlan:"Monthly customer sample",reviewDate:"2026-10-06"}]})];
 expect(managementSignals(w,"en","2026-10-06")[0].missingEvidence).toContain("measuredAt");
 w.programs[0].benefits[0].measuredAt="2026-10-07";expect(managementSignals(w,"en","2026-10-06")[0].confidence).toBe("insufficient-evidence");
 w.programs[0].benefits[0].measuredAt="2026-10-05";expect(managementSignals(w,"en","2026-10-06")[0].confidence).toBe("known");
});
