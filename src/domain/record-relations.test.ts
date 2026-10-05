import {expect,it} from "vitest";
import {demoWorkspace} from "@/data/demo";
import {recordRelations,relationPath} from "./record-relations";
it("traces outcome, work and evidence in both directions without copying records",()=>{
  const workspace=demoWorkspace("en"),work=workspace.workItems[0];
  workspace.documents=[{id:"evidence",projectId:work.projectId,title:"Acceptance evidence",type:"note",body:"Observed acceptance",relatedIds:[work.id],updatedAt:"2026-10-06T12:00:00Z"}];
  const incoming=recordRelations(workspace,"work",work.id).find(row=>row.id==="evidence");expect(incoming?.direction).toBe("incoming");
  expect(recordRelations(workspace,"document","evidence").some(row=>row.id===work.id&&row.direction==="outgoing")).toBe(true);
  expect(relationPath(incoming!,"en")).toContain("view=documents");expect(workspace.documents[0].relatedIds).toEqual([work.id]);
});
