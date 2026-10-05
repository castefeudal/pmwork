import type { Locale, Workspace, Project } from "./schemas";
import { projectActions } from "./action-signals";

/** Index scoped records once, avoiding a full-workspace scan for each project. */
export function acrossProjectSignals(workspace:Workspace,locale:Locale,asOf:string) {
  return acrossContextSignals(workspace,workspace.projects,locale,asOf);
}
export function acrossContextSignals(workspace:Workspace,projects:Project[],locale:Locale,asOf:string) {
  const scoped=["workItems","risks","issues","decisions","milestones","assumptions","dependencies","qualityGates","changes"] as const;
  const contexts=new Map(projects.map(project=>[project.id,{...workspace,projects,workItems:[],risks:[],issues:[],decisions:[],milestones:[],assumptions:[],dependencies:[],qualityGates:[],changes:[]} as Workspace]));
  for(const key of scoped) for(const row of workspace[key]) {
    const context=contexts.get(row.projectId);
    if(context) (context[key] as Array<typeof row>).push(row);
  }
  return projects.flatMap(project=>projectActions(contexts.get(project.id)!,project.id,locale,asOf).map(signal=>({project,signal})));
}
