import type { Decision } from "./schemas";
export const decisionFilters=["pending","overdue","upcoming","decided","revisit","unowned","evidence","affected"] as const;
export type DecisionFilter=typeof decisionFilters[number];
export function filterDecisions(decisions:Decision[],filter:DecisionFilter,asOf:string) {
  const at=Date.parse(asOf);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(asOf)||!Number.isFinite(at)||new Date(at).toISOString().slice(0,10)!==asOf)throw Error("Invalid decision review date");
  const nextWeek=new Date(at+7*86400000).toISOString().slice(0,10),lastMonth=new Date(at-30*86400000).toISOString().slice(0,10);
  return decisions.filter(row=>{
    switch(filter) {
      case "pending":return row.status==="pending";
      case "overdue":return row.status==="pending"&&Boolean(row.date)&&row.date<asOf;
      case "upcoming":return row.status==="pending"&&Boolean(row.date)&&row.date>=asOf&&row.date<=nextWeek;
      case "decided":return row.status==="decided"&&Boolean(row.decidedAt)&&row.decidedAt!.slice(0,10)>=lastMonth&&row.decidedAt!.slice(0,10)<=asOf;
      case "revisit":return row.status==="decided"&&Boolean(row.revisitDate)&&row.revisitDate! <= asOf;
      case "unowned":return !row.owner.trim()&&row.status!=="superseded";
      case "evidence":return row.status==="pending"&&(!row.alternatives.length||!row.criteria.length);
      case "affected":return (row.affectedIds?.length??0)>1;
    }
  }).sort((a,b)=>(a.date||"9999").localeCompare(b.date||"9999")||a.id.localeCompare(b.id));
}
