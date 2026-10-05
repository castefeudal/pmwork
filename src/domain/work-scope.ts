import { workspaceSchema, type Project, type Scope, type Workspace } from "./schemas";
import { assertWorkspaceGraph } from "./workspace-integrity";

export const scopedCollections = ["workItems","risks","decisions","stakeholders","budgets","documents","milestones","issues","objectives","assumptions","dependencies","iterations","teamMembers","capacityAllocations","changes","vendors","meetings","statusReports","lessons","communications","qualityGates","activities","toolRuns","projectSettings","savedWorkViews","workViewPreferences"] as const;
export const scopeKey = (scope:Scope) => scope.kind==="project"?scope.id:`@${scope.kind}/${scope.id}`;
export function contextProject(workspace:Workspace,scope:Scope):Project {
  if(scope.kind==="project") {const project=workspace.projects.find(row=>row.id===scope.id);if(!project)throw Error("Unknown project");return project;}
  const record=scope.kind==="program"?workspace.programs.find(row=>row.id===scope.id):workspace.operations.find(row=>row.id===scope.id);
  if(!record)throw Error("Unknown operating context");
  const key=scopeKey(scope);
  if(workspace.projects.some(project=>project.id===key))throw Error("Scope key collides with a project id");
  return {id:key,name:record.name,status:"status" in record?record.status:"active",owner:record.owner,sponsor:"sponsor" in record?record.sponsor:"",approach:scope.kind==="operation"?"flow":"hybrid",governance:"standard",type:scope.kind==="operation"?"operations":"transformation",startDate:"",targetDate:"",purpose:"purpose" in record?record.purpose:record.outcome,objective:"purpose" in record?record.purpose:record.outcome,successMeasures:[],health:{},demo:false,currency:"USD",scopeIn:"scope" in record?record.scope:"",scopeOut:"",constraints:"",definitionOfDone:""};
}
/** Temporary UI adapter. The synthetic context descriptor is never persisted as a project. */
export function contextWorkspace(workspace:Workspace,scope:Scope):Workspace {
  const project=contextProject(workspace,scope);
  return scope.kind==="project"?workspace:{...workspace,projects:[...workspace.projects,project]};
}
/** Apply only records in the requested context; preserve every other source record. */
export function applyContextWorkspace(current:Workspace,next:Workspace,scope:Scope):Workspace {
  if(scope.kind==="project")return assertWorkspaceGraph(workspaceSchema.parse(next));
  const key=scopeKey(scope),candidate={...current};
  for(const collection of scopedCollections) {
    const outside=current[collection].filter(row=>row.projectId!==key);
    const inside=next[collection].filter(row=>row.projectId===key).map(row=>({...row,workScope:scope}));
    (candidate as unknown as Record<string,unknown>)[collection]=[...outside,...inside];
  }
  return assertWorkspaceGraph(workspaceSchema.parse(candidate));
}
