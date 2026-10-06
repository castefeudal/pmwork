import {workspaceSchema,workItemSchema,decisionSchema,type Workspace,type Locale} from "./schemas";
import type {Operation} from "./management-entities";
import {assertWorkspaceGraph} from "./workspace-integrity";
export function recordOperationReview(workspace:Workspace,operationId:string,review:Operation["reviews"][number],at:string,locale:Locale="en"):Workspace {
  const operation=workspace.operations.find(row=>row.id===operationId);if(!operation)throw Error("Unknown operation");
  const projectId=`@operation/${operationId}`,workScope={kind:"operation" as const,id:operationId};
  const work=review.nextAction.trim()?workItemSchema.parse({id:`WORK-${crypto.randomUUID()}`,projectId,workScope,title:review.nextAction,description:review.findings,type:"task",priority:"medium",status:"ready",owner:review.owner,createdAt:at,updatedAt:at}):undefined;
  const decision=review.decision.trim()?decisionSchema.parse({id:`DEC-${crypto.randomUUID()}`,projectId,workScope,question:review.decision,context:review.findings,alternatives:[],criteria:[],decision:"",rationale:"",owner:review.owner,participants:[],date:"",consequences:"",revisitTrigger:"",status:"pending",evidenceIds:[review.id]}):undefined;
  return assertWorkspaceGraph(workspaceSchema.parse({...workspace,workItems:work?[...workspace.workItems,work]:workspace.workItems,decisions:decision?[...workspace.decisions,decision]:workspace.decisions,operations:workspace.operations.map(row=>row.id===operationId?{...row,reviews:[...row.reviews,{...review,workItemId:work?.id,decisionId:decision?.id}],history:[...row.history,{at,summary:locale==="ru"?"Записан операционный обзор со связанными действиями":"Operations review recorded with linked actions"}]}:row)}));
}
