import type { Locale, Workspace } from "./schemas";
import { projectActions } from "./action-signals";

/** Index scoped records once, avoiding a full-workspace scan for each project. */
export function acrossProjectSignals(workspace:Workspace,locale:Locale,asOf:string) {
  const scoped=["workItems","risks","issues","decisions","milestones","assumptions","dependencies","qualityGates","changes"] as const;
  const contexts=new Map(workspace.projects.map(project=>[project.id,{...workspace,workItems:[],risks:[],issues:[],decisions:[],milestones:[],assumptions:[],dependencies:[],qualityGates:[],changes:[]} as Workspace]));
  for(const key of scoped) for(const row of workspace[key]) {
    const context=contexts.get(row.projectId);
    if(context) (context[key] as Array<typeof row>).push(row);
  }
  return workspace.projects.flatMap(project=>projectActions(contexts.get(project.id)!,project.id,locale,asOf).map(signal=>({project,signal})));
}
