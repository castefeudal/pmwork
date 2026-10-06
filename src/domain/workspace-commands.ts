import { workspaceSchema,workItemSchema,type Workspace,type WorkItem } from './schemas';
import {nextOccurrence} from './recurrence';
import { assertWorkspaceGraph } from './workspace-integrity';
import { buildStatusReport } from './status-report';
function finish(workspace:Workspace,projectId:string,type:string,message:string):Workspace {
 return assertWorkspaceGraph(workspaceSchema.parse({...workspace,activities:[...workspace.activities,{id:crypto.randomUUID(),projectId,type,message,at:new Date().toISOString()}]}));
}
export function updateWork(workspace:Workspace,id:string,patch:Partial<WorkItem>):Workspace {
 const item=workspace.workItems.find(x=>x.id===id);if(!item)throw new Error('Work item not found');
 const ownerPatch={...patch};
 if('owner' in patch && patch.owner!==item.owner && !('ownerId' in patch)) {
  const matches=workspace.teamMembers.filter(m=>m.projectId===item.projectId&&m.name===patch.owner);
  ownerPatch.ownerId=matches.length===1?matches[0].id:undefined;
  ownerPatch.ownerLabel=patch.owner;
 }
 const ownerId='ownerId' in ownerPatch?ownerPatch.ownerId:item.ownerId;
 if(ownerId) {
  const member=workspace.teamMembers.find(m=>m.id===ownerId&&m.projectId===item.projectId);
  if(!member && 'ownerId' in patch)throw new Error('Owner does not belong to project');
  if(member){ownerPatch.owner=member.name;ownerPatch.ownerLabel=member.name;}
  else {ownerPatch.ownerId=undefined;ownerPatch.ownerLabel=ownerPatch.owner??item.ownerLabel??item.owner;}
 }
 const at=new Date().toISOString(),status=patch.status??item.status,statusChanged=status!==item.status;
 const blocked=status==='done'?false:patch.blocked??item.blocked;ownerPatch.blocked=blocked;
 if(blocked!==item.blocked) {
  if(blocked)ownerPatch.blockedIntervals=[...(item.blockedIntervals??[]),{from:at}];
  else if(item.blockedIntervals?.at(-1)&&!item.blockedIntervals.at(-1)!.to)ownerPatch.blockedIntervals=item.blockedIntervals.map((entry,index)=>index===item.blockedIntervals!.length-1?{...entry,to:at}:entry);
 }
 const requestedEstimate=patch.currentEstimate??patch.estimate;
 if(requestedEstimate!==undefined&&requestedEstimate!==item.currentEstimate){
  ownerPatch.originalEstimate=item.originalEstimate??item.currentEstimate??item.estimate??requestedEstimate;
  ownerPatch.currentEstimate=requestedEstimate;
  ownerPatch.estimate=requestedEstimate;
  ownerPatch.estimateHistory=[...item.estimateHistory,{value:requestedEstimate,timestamp:at}];
 }
 const enteredActive=statusChanged&&['in-progress','review'].includes(status);
 const startedAt=item.startedAt??(enteredActive?at:undefined);
 const statusHistory=statusChanged?[...(item.statusHistory??[]),{at,from:item.status,to:status}]:item.statusHistory;
 const updatedItems=workspace.workItems.map(x=>x.id===id?{...x,...ownerPatch,id:x.id,projectId:x.projectId,updatedAt:at,startedAt,statusHistory,done:status==='done',completedAt:status==='done'?x.completedAt??at:undefined}:x);
 const updated=updatedItems.find(row=>row.id===id)!,cadence=updated.recurrence??'once';
 if(statusChanged&&status==='done'&&cadence!=='once'&&!workspace.workItems.some(row=>row.recurrenceOf===id)) {
  const anchor=updated.recurrenceAnchor??Number(updated.dueDate?.slice(-2));
  const dueDate=nextOccurrence(updated.dueDate??'',cadence,anchor);
  updatedItems.push(workItemSchema.parse({...updated,id:`WORK-${crypto.randomUUID()}`,status:'ready',done:false,blocked:false,blockerReason:undefined,blockedIntervals:undefined,reworkEvidence:undefined,actualEffort:undefined,completedAt:undefined,startedAt:undefined,statusHistory:[],estimateHistory:[],iterationId:undefined,createdAt:at,updatedAt:at,recurrenceOf:id,recurrenceAnchor:anchor,dueDate,archived:false}));
 }
 return finish({...workspace,workItems:updatedItems},item.projectId,'work-updated',item.title);
}
export const changeWorkStatus=(w:Workspace,id:string,status:WorkItem['status'])=>updateWork(w,id,{status});
export const archiveWork=(w:Workspace,id:string)=>updateWork(w,id,{archived:true});
export function updateWorkOwner(w:Workspace,id:string,ownerId:string|undefined,ownerLabel=''){
 const item=w.workItems.find(x=>x.id===id);if(!item)throw Error('Work item not found');
 const member=w.teamMembers.find(m=>m.id===ownerId&&m.projectId===item.projectId);
 if(ownerId&&!member)throw Error('Owner does not belong to project');
 return updateWork(w,id,{ownerId,ownerLabel:member?.name??ownerLabel,owner:member?.name??ownerLabel});
}
export function convertRiskToIssue(w:Workspace,id:string):Workspace {
 const risk=w.risks.find(r=>r.id===id);if(!risk)throw Error('Risk not found');
 if(w.issues.some(i=>i.relatedRiskId===id))return w;
 return finish({...w,risks:w.risks.map(r=>r.id===id?{...r,status:'closed'}:r),issues:[...w.issues,{id:`ISS-${crypto.randomUUID()}`,projectId:risk.projectId,title:risk.title,description:risk.description,impact:risk.impact,urgency:risk.impact,owner:risk.owner,plan:risk.actions,dueDate:risk.reviewDate,escalation:'',relatedRiskId:id,relatedWorkIds:[],status:'open'}]},risk.projectId,'risk-realized',risk.title);
}
export function generateStatusDraft(w:Workspace,projectId:string,locale:'ru'|'en'):Workspace {
 const p=w.projects.find(p=>p.id===projectId);if(!p)throw Error('Project not found');
 const at=new Date().toISOString(),report=buildStatusReport(w,p,locale,at);
 return finish({...w,documents:[...w.documents,{id:`DOC-${crypto.randomUUID()}`,projectId,title:locale==='ru'?'Черновик статуса':'Status report draft',type:'status-report',...report,updatedAt:at}]},projectId,'status-draft',p.name);
}
export function createWork(w:Workspace,item:WorkItem){
 if(!w.projects.some(p=>p.id===item.projectId)||w.workItems.some(x=>x.id===item.id))throw Error('Invalid work identity');
 const at=new Date().toISOString();return finish({...w,workItems:[...w.workItems,{...item,createdAt:at,updatedAt:at}]},item.projectId,'work-created',item.title);
}
export function createRisk(w:Workspace,risk:Workspace['risks'][number]){
 if(!w.projects.some(p=>p.id===risk.projectId)||w.risks.some(r=>r.id===risk.id))throw Error('Invalid risk identity');
 return finish({...w,risks:[...w.risks,risk]},risk.projectId,'risk-created',risk.title);
}
export function createDecision(w:Workspace,decision:Workspace['decisions'][number]){
 if(!w.projects.some(p=>p.id===decision.projectId)||w.decisions.some(d=>d.id===decision.id))throw Error('Invalid decision identity');
 return finish({...w,decisions:[...w.decisions,decision]},decision.projectId,'decision-created',decision.question);
}
export function updateMilestone(w:Workspace,id:string,patch:Partial<Workspace['milestones'][number]>){
 const item=w.milestones.find(m=>m.id===id);if(!item)throw Error('Milestone not found');
 const at=new Date().toISOString(),tracked=['baselineDate','forecastDate','actualDate','confidence','status','progress','owner'] as const;
 const history=tracked.flatMap(field=>field in patch&&patch[field]!==item[field]?[{at,field,from:item[field]??null,to:patch[field]??null,reason:field==='forecastDate'?patch.forecastReason:undefined}]:[]);
 const forecastDate=patch.forecastDate??item.forecastDate;
 return finish({...w,milestones:w.milestones.map(m=>m.id===id?{...m,...patch,date:forecastDate,updatedAt:at,history:[...m.history,...history],id:m.id,projectId:m.projectId}:m)},item.projectId,'milestone-updated',item.title);
}
export function applyTemplate(w:Workspace,document:Workspace['documents'][number]){
 if(!w.projects.some(p=>p.id===document.projectId)||w.documents.some(d=>d.id===document.id))throw Error('Invalid document identity');
 return finish({...w,documents:[...w.documents,{...document,updatedAt:new Date().toISOString()}]},document.projectId,'template-applied',document.title);
}
export function approveChange(w:Workspace,id:string,approver:string,decision:string){
 const item=w.changes.find(c=>c.id===id);if(!item||!approver.trim()||!decision.trim())throw Error('Approval needs a change, approver and rationale');
 return finish({...w,changes:w.changes.map(c=>c.id===id?{...c,status:'approved',approver,decision}:c)},item.projectId,'change-approved',item.change);
}


export type RemovableRecordKind =
 | 'work' | 'objective' | 'dependency' | 'milestone' | 'iteration' | 'risk' | 'issue'
 | 'assumption' | 'decision' | 'stakeholder' | 'team' | 'communication'
 | 'vendor' | 'budget' | 'change' | 'quality' | 'document';

const removableCollectionByKind = {
 work:'workItems',objective:'objectives',dependency:'dependencies',milestone:'milestones',iteration:'iterations',
 risk:'risks',issue:'issues',assumption:'assumptions',decision:'decisions',
 stakeholder:'stakeholders',team:'teamMembers',communication:'communications',
 vendor:'vendors',budget:'budgets',change:'changes',quality:'qualityGates',document:'documents',
} as const satisfies Record<RemovableRecordKind,keyof Workspace>;

/**
 * Remove one editable record without leaving dangling graph references.
 * Substantive related records are preserved; only references and records that
 * cannot exist independently (explicit dependencies/capacity allocations) are detached.
 */
export function removeWorkspaceRecord(w:Workspace,kind:RemovableRecordKind,id:string):Workspace {
 const collection=removableCollectionByKind[kind];
 const rows=w[collection] as unknown as Array<{id:string;projectId?:string}>;
 const target=rows.find(row=>row.id===id);
 if(!target)throw new Error('Record not found');
 let next={...w,[collection]:rows.filter(row=>row.id!==id)} as Workspace;

 if(kind==='work'){
  const removedDependencyIds=new Set(next.dependencies.filter(dep=>dep.predecessorId===id||dep.successorId===id).map(dep=>dep.id));
  next={...next,
   workItems:next.workItems.map(item=>({
    ...item,
    parentId:item.parentId===id?undefined:item.parentId,
    recurrenceOf:item.recurrenceOf===id?undefined:item.recurrenceOf,
    dependencies:item.dependencies.filter(ref=>ref!==id),
   })),
   dependencies:next.dependencies.filter(dep=>!removedDependencyIds.has(dep.id)),
   issues:next.issues.map(issue=>({...issue,relatedWorkIds:issue.relatedWorkIds.filter(ref=>ref!==id)})),
   objectives:next.objectives.map(objective=>({...objective,deliverableIds:objective.deliverableIds.filter(ref=>ref!==id)})),
   iterations:next.iterations.map(iteration=>({...iteration,workItemIds:iteration.workItemIds.filter(ref=>ref!==id)})),
   vendors:next.vendors.map(vendor=>({...vendor,dependencyIds:vendor.dependencyIds.filter(ref=>!removedDependencyIds.has(ref))})),
  };
 }
 if(kind==='risk'){
  next={...next,
   workItems:next.workItems.map(item=>({...item,riskIds:item.riskIds.filter(ref=>ref!==id)})),
   issues:next.issues.map(issue=>issue.relatedRiskId===id?{...issue,relatedRiskId:undefined}:issue),
   vendors:next.vendors.map(vendor=>({...vendor,riskIds:vendor.riskIds.filter(ref=>ref!==id)})),
  };
 }
 if(kind==='objective')next={...next,workItems:next.workItems.map(item=>({...item,objectiveIds:item.objectiveIds.filter(ref=>ref!==id)}))};
 if(kind==='milestone'){
  next={...next,
   workItems:next.workItems.map(item=>item.milestoneId===id?{...item,milestoneId:undefined}:item),
   vendors:next.vendors.map(vendor=>({...vendor,milestones:vendor.milestones.filter(ref=>ref!==id)})),
  };
 }
 if(kind==='iteration'){
  next={...next,workItems:next.workItems.map(item=>item.iterationId===id?{...item,iterationId:undefined}:item)};
 }
 if(kind==='dependency'){
  next={...next,vendors:next.vendors.map(vendor=>({...vendor,dependencyIds:vendor.dependencyIds.filter(ref=>ref!==id)}))};
 }
 if(kind==='team'){
  next={...next,
   workItems:next.workItems.map(item=>item.ownerId===id?{...item,ownerId:undefined,ownerLabel:item.ownerLabel??item.owner}:item),
   capacityAllocations:next.capacityAllocations.filter(allocation=>allocation.memberId!==id),
   projectSettings:next.projectSettings.map(settings=>settings.localMemberId===id?{...settings,localMemberId:undefined}:settings),
  };
 }

 next={...next,
  operations:next.operations.map(operation=>({...operation,reviews:operation.reviews.map(review=>({...review,workItemId:review.workItemId===id?undefined:review.workItemId,decisionId:review.decisionId===id?undefined:review.decisionId}))})),
  decisions:next.decisions.map(decision=>({...decision,evidenceIds:decision.evidenceIds?.filter(ref=>ref!==id),affectedIds:decision.affectedIds?.filter(ref=>ref!==id)})),
  documents:next.documents.map(document=>({...document,relatedIds:document.relatedIds.filter(ref=>ref!==id)})),
  toolRuns:next.toolRuns.map(run=>({...run,appliedRecordIds:run.appliedRecordIds.filter(ref=>ref!==id)})),
 };
 return assertWorkspaceGraph(workspaceSchema.parse(next));
}
