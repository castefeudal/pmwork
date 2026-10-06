import {expect,it} from "vitest";
import {demoWorkspace} from "@/data/demo";
import {filterDecisions} from "./decision-center";
it("distinguishes overdue, upcoming, evidence gaps and explicitly scheduled revisits",()=>{
  const source=demoWorkspace("en").decisions[0],decisions=[{...source,id:"late",status:"pending" as const,date:"2026-10-05",owner:""},{...source,id:"next",status:"pending" as const,date:"2026-10-07"},{...source,id:"review",status:"decided" as const,date:"2026-10-01",revisitDate:"2026-10-06",affectedIds:["a","b"]}];
  expect(filterDecisions(decisions,"overdue","2026-10-06").map(row=>row.id)).toEqual(["late"]);
  expect(filterDecisions(decisions,"upcoming","2026-10-06").map(row=>row.id)).toEqual(["next"]);
  expect(filterDecisions(decisions,"revisit","2026-10-06").map(row=>row.id)).toEqual(["review"]);
  expect(filterDecisions(decisions,"unowned","2026-10-06").map(row=>row.id)).toEqual(["late"]);
  expect(filterDecisions(decisions,"affected","2026-10-06").map(row=>row.id)).toEqual(["review"]);
  expect(()=>filterDecisions(decisions,"pending","2026-02-30")).toThrow();
});
