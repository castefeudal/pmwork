import {expect,it} from "vitest";
import {emptyWorkspace} from "@/data/demo";
import {operationSchema} from "./management-entities";
import {recordOperationReview} from "./operation-review";
it("turns an explicit review action and open question into linked shared records",()=>{
  const workspace=emptyWorkspace("en");workspace.operations=[operationSchema.parse({id:"service",name:"Support",purpose:"Restore service"})];
  const next=recordOperationReview(workspace,"service",{id:"review",at:"2026-10-06",cadence:"weekly",findings:"Queue response exceeds target",decision:"Add weekend coverage?",nextAction:"Investigate queue bottleneck",owner:"Alex"},"2026-10-06T12:00:00Z");
  expect(next.projects).toEqual([]);expect(next.operations[0].reviews[0].workItemId).toBe(next.workItems[0].id);expect(next.decisions[0].status).toBe("pending");expect(next.decisions[0].evidenceIds).toEqual(["review"]);expect(next.workItems[0].workScope).toEqual({kind:"operation",id:"service"});expect(workspace.workItems).toEqual([]);
});
