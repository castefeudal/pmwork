import type { Workspace } from "./schemas";
type Conflict = { id:string; from:string; to:string; type:string; days:number|null; missing:boolean };
export function dependencyConflicts(workspace: Workspace, projectId: string) {
  const items = new Map(workspace.workItems.filter(x=>x.projectId===projectId&&!x.archived).map(x=>[x.id,x]));
  return workspace.dependencies.filter(d=>d.projectId===projectId&&d.status!=="met").flatMap<Conflict>(d=>{
    const from=items.get(d.predecessorId), to=items.get(d.successorId);
    if(!from||!to)return [{id:d.id,from:d.predecessorId,to:d.successorId,type:d.type,days:null,missing:true}];
    const a=d.type[0]==="F"?from.dueDate:from.startDate, b=d.type[1]==="F"?to.dueDate:to.startDate;
    if(!a||!b)return [];
    const delta=(Date.parse(a)-Date.parse(b))/86400000+d.lag;
    return delta>0?[{id:d.id,from:from.id,to:to.id,type:d.type,days:Math.ceil(delta),missing:false}]:[];
  });
}
