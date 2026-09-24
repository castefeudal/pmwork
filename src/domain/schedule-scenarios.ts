import { workspaceSchema, type Workspace } from './schemas';
import { assertWorkspaceGraph } from './workspace-integrity';
import { dependencyConflicts } from './planning';

type Dates = { startDate?: string; dueDate?: string };
type WorkChange = { id: string; title: string; before: Dates; after: Dates };
type MilestoneChange = { id: string; title: string; baseline: string; before: string; after: string };
export type ScheduleScenario = {
  projectId: string;
  name: string;
  source: string;
  work: WorkChange[];
  milestones: MilestoneChange[];
  conflictsBefore: number;
  conflictsAfter: number;
  unscheduled: number;
};

/** Compare scheduling inputs, including links, before applying a reviewed draft. */
function scheduleSource(w: Workspace, projectId: string) {
  return JSON.stringify({
    project: w.projects.find(p=>p.id===projectId),
    work: w.workItems.filter(x=>x.projectId===projectId).map(x=>[x.id,x.startDate,x.dueDate,x.done,x.archived,x.milestoneId]),
    milestones: w.milestones.filter(x=>x.projectId===projectId).map(x=>[x.id,x.baselineDate,x.forecastDate,x.actualDate,x.status]),
    dependencies: w.dependencies.filter(x=>x.projectId===projectId),
  });
}
function shift(date: string | undefined, days: number) {
  if (!date) return date;
  const ms=Date.parse(`${date}T00:00:00Z`);
  if(!Number.isFinite(ms))throw new Error('Invalid schedule date');
  const result=new Date(ms+days*86400000).toISOString().slice(0,10);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(result)||result.startsWith('0000'))throw new Error('Date outside supported range');
  return result;
}
function projectDraft(w:Workspace, work:WorkChange[], milestones:MilestoneChange[]) {
  const workById=new Map(work.map(x=>[x.id,x])),milestonesById=new Map(milestones.map(x=>[x.id,x]));
  return {...w,
    workItems:w.workItems.map(x=>workById.has(x.id)?{...x,...workById.get(x.id)!.after}:x),
    milestones:w.milestones.map(x=>milestonesById.has(x.id)?{...x,date:milestonesById.get(x.id)!.after,forecastDate:milestonesById.get(x.id)!.after}:x),
  };
}

/** A date-shift scenario is deliberately not a capacity, cost or probabilistic model. */
export function previewScheduleScenario(w:Workspace, projectId:string, name:string, days:number, workId?:string, shiftMilestones=false):ScheduleScenario {
  if(!w.projects.some(p=>p.id===projectId)||!Number.isInteger(days)||Math.abs(days)>3650)throw new Error('Invalid scenario inputs');
  const items=w.workItems.filter(x=>x.projectId===projectId&&!x.done&&!x.archived);
  if(workId&&!items.some(x=>x.id===workId))throw new Error('Work is unavailable');
  const selected=items.filter(x=>!workId||x.id===workId);
  const work:WorkChange[]=days===0?[]:selected.filter(x=>x.startDate||x.dueDate).map(x=>({
    id:x.id,title:x.title,before:{startDate:x.startDate,dueDate:x.dueDate},after:{startDate:shift(x.startDate,days),dueDate:shift(x.dueDate,days)},
  }));
  const linkedMilestones=new Set(selected.map(x=>x.milestoneId).filter(Boolean));
  const milestones:MilestoneChange[]=!shiftMilestones||days===0?[]:w.milestones.filter(x=>x.projectId===projectId&&!!x.forecastDate&&x.status!=='done'&&x.status!=='cancelled'&&(!workId||linkedMilestones.has(x.id))).map(x=>({id:x.id,title:x.title,baseline:x.baselineDate,before:x.forecastDate,after:shift(x.forecastDate,days)!}));
  return {projectId,name,source:scheduleSource(w,projectId),work,milestones,
    conflictsBefore:dependencyConflicts(w,projectId).length,
    conflictsAfter:dependencyConflicts(projectDraft(w,work,milestones),projectId).length,
    unscheduled:selected.filter(x=>!x.startDate&&!x.dueDate).length,
  };
}

/** One validated transaction; never touches baseline, actuals, owners or budgets. */
export function applyScheduleScenario(w:Workspace, draft:ScheduleScenario, at=new Date().toISOString()):{workspace:Workspace;undo:ScheduleScenario} {
  if(scheduleSource(w,draft.projectId)!==draft.source)throw new Error('Scenario is stale');
  if(!draft.work.length&&!draft.milestones.length)throw new Error('Scenario has no changes');
  const projected=projectDraft(w,draft.work,draft.milestones);
  const workIds=new Set(draft.work.map(x=>x.id)),milestones=new Map(draft.milestones.map(x=>[x.id,x]));
  const next=assertWorkspaceGraph(workspaceSchema.parse({...projected,
    workItems:projected.workItems.map(x=>workIds.has(x.id)?{...x,updatedAt:at}:x),
    milestones:projected.milestones.map(x=>{
      const change=milestones.get(x.id);
      return change?{...x,updatedAt:at,forecastReason:draft.name,history:[...x.history,{at,field:'forecastDate',from:change.before,to:change.after,reason:draft.name}]}:x;
    }),
    activities:[...w.activities,{id:crypto.randomUUID(),projectId:draft.projectId,at,type:'schedule-scenario',message:draft.name}],
  }));
  return {workspace:next,undo:{...draft,name:`Undo: ${draft.name}`,source:scheduleSource(next,draft.projectId),
    work:draft.work.map(x=>({...x,before:x.after,after:x.before})),milestones:draft.milestones.map(x=>({...x,before:x.after,after:x.before})),
    conflictsBefore:draft.conflictsAfter,conflictsAfter:draft.conflictsBefore,
  }};
}
