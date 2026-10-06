import {expect,it,vi} from "vitest";
import {demoWorkspace} from "@/data/demo";
import {updateWork} from "./workspace-commands";
import {deliveryEvidence} from "./delivery-evidence";
it("records prospective blockage without backfilling legacy time or inferring rework",()=>{
  vi.useFakeTimers();
  try {
    let workspace=demoWorkspace("en"),item=workspace.workItems.find(row=>!row.blocked)!;
    expect(deliveryEvidence([item],"2026-10-06T12:00:00Z").blockedHours).toBeNull();
    vi.setSystemTime(new Date("2026-10-06T12:00:00Z"));workspace=updateWork(workspace,item.id,{blocked:true});
    vi.setSystemTime(new Date("2026-10-06T14:00:00Z"));workspace=updateWork(workspace,item.id,{blocked:false});item=workspace.workItems.find(row=>row.id===item.id)!;
    expect(deliveryEvidence([item],"2026-10-06T15:00:00Z")).toEqual({blockedHours:2,observedItems:1,unobservedItems:0,reworkCount:0});
    expect(deliveryEvidence([item],"2026-10-06T13:00:00Z").blockedHours).toBe(1);
  } finally {vi.useRealTimers();}
});
