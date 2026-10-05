import {expect,it,vi} from "vitest";
import {demoWorkspace} from "@/data/demo";
import {nextOccurrence} from "./recurrence";
import {updateWork} from "./workspace-commands";
it("keeps the monthly anchor across short months and preserves missed dates",()=>{
  expect(nextOccurrence("2026-01-31","monthly",31)).toBe("2026-02-28");
  expect(nextOccurrence("2026-02-28","monthly",31)).toBe("2026-03-31");
  expect(()=>nextOccurrence("2026-02-30","weekly")).toThrow();
});
it("creates one next occurrence only after explicit completion",()=>{
  vi.useFakeTimers();try {
    vi.setSystemTime(new Date("2026-10-06T12:00:00Z"));const workspace=demoWorkspace("en"),item=workspace.workItems.find(row=>!row.done&&!row.blocked)!;
    const scheduled=updateWork(workspace,item.id,{recurrence:"weekly",dueDate:"2026-10-01"}),completed=updateWork(scheduled,item.id,{status:"done"});
    const next=completed.workItems.find(row=>row.recurrenceOf===item.id)!;expect(next.dueDate).toBe("2026-10-08");expect(next.status).toBe("ready");expect(next.actualEffort).toBeUndefined();
    expect(updateWork(completed,item.id,{status:"done"}).workItems).toHaveLength(completed.workItems.length);
  }finally{vi.useRealTimers();}
});
