import {expect,it} from "vitest";
import {operationSchema} from "./management-entities";
import {completeControl} from "./operational-control";
it("preserves evidence and missed schedules when advancing recurring checks",()=>{
  const operation=operationSchema.parse({id:"service",name:"Support",purpose:"Restore service",controls:[{id:"check",name:"Monthly audit",dueDate:"2026-01-31",recurrence:"monthly"}]});
  const next=completeControl(operation.controls[0],"2026-03-05");
  expect(completeControl(next,"2026-03-05").dueDate).toBe("2026-03-31");
  expect(next.dueDate).toBe("2026-02-28");expect(next.completedAt).toBeUndefined();
  expect(next.completions).toEqual([{dueDate:"2026-01-31",completedAt:"2026-03-05"}]);
  expect(()=>completeControl(next,"2026-02-30")).toThrow();
});
