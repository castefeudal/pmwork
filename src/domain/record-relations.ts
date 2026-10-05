import type {Scope,Workspace} from "./schemas";
const collections={project:"projects",work:"workItems",risk:"risks",issue:"issues",decision:"decisions",assumption:"assumptions",stakeholder:"stakeholders",team:"teamMembers",milestone:"milestones",iteration:"iterations",dependency:"dependencies",document:"documents",budget:"budgets",vendor:"vendors",communication:"communications",change:"changes",quality:"qualityGates",objective:"objectives"} as const;
export type RecordRelation={id:string;kind:string;title:string;scope:Scope;view:string;direction:"incoming"|"outgoing"};
type Indexed=Omit<RecordRelation,"direction">&{refs:string[]};
const referenceFields=["dependencies","riskIds","objectiveIds","relatedIds","relatedWorkIds","deliverableIds","workItemIds","milestones","dependencyIds","evidenceIds","affectedIds","projectIds","parentId","recurrenceOf","milestoneId","iterationId","ownerId","relatedRiskId","predecessorId","successorId","workItemId","decisionId"];
const viewFor=(kind:string)=>kind==="work"||kind==="objective"?"work":kind==="milestone"||kind==="iteration"?"planning":kind==="document"?"documents":kind==="budget"?"finance":["team","stakeholder","vendor","communication"].includes(kind)?"people":["quality","change"].includes(kind)?"control":"raid";
export function recordRelations(workspace:Workspace,kind:string,id:string):RecordRelation[] {
  const rows:Indexed[]=[];
  const add=(kind:string,row:Record<string,unknown>,scope:Scope,view=viewFor(kind))=>{
    rows.push({kind,id:String(row.id),title:String(row.title??row.question??row.text??row.description??row.name??row.change??row.category??row.id),scope,view,refs:referenceFields.flatMap(field=>Array.isArray(row[field])?(row[field] as unknown[]).filter((value):value is string=>typeof value==="string"):typeof row[field]==="string"?[row[field] as string]:[])});
  };
  for(const [kind,collection] of Object.entries(collections))for(const value of workspace[collection]) {
    const row=value as unknown as Record<string,unknown>;
    if(kind==="project"&&String(row.id).startsWith("@"))continue;
    const scope=(row.workScope as Scope|undefined)??{kind:"project" as const,id:String(row.projectId??row.id)};add(kind,row,scope);
  }
  for(const program of workspace.programs) {
    const scope={kind:"program" as const,id:program.id};add("program",program as unknown as Record<string,unknown>,scope,"program");
    for(const benefit of program.benefits)add("benefit",benefit as unknown as Record<string,unknown>,scope,"program");
  }
  for(const operation of workspace.operations)for(const [type,values] of [["review",operation.reviews],["metric",operation.metrics],["control",operation.controls],["incident",operation.incidents]] as const)for(const row of values)add(type,row as unknown as Record<string,unknown>,{kind:"operation",id:operation.id},"operations");
  const selected=rows.find(row=>row.kind===kind&&row.id===id);if(!selected)return [];
  return rows.filter(row=>row!==selected&&(row.refs.includes(id)||selected.refs.includes(row.id))).map(row=>({...row,direction:row.refs.includes(id)?"incoming" as const:"outgoing" as const})).sort((a,b)=>a.direction.localeCompare(b.direction)||a.title.localeCompare(b.title)||a.id.localeCompare(b.id));
}
export function relationPath(row:RecordRelation,locale:string) {
  const params=new URLSearchParams(row.scope.kind==="project"?{project:row.scope.id,view:row.view,item:row.id,kind:row.kind}:{view:row.scope.kind==="program"?"program":"operations",context:row.scope.id,register:row.view,item:row.id,kind:row.kind});
  if(["review","metric","control","incident","benefit","program"].includes(row.kind)){params.delete("item");params.delete("kind");params.set("evidence",row.id);}
  return `/${locale}/workspace/?${params}#evidence-${row.scope.id}-${row.id}`;
}
