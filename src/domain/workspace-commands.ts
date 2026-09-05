import { workspaceSchema,type Workspace,type WorkItem } from './schemas';
function finish(workspace:Workspace,projectId:string,type:string,message:string):Workspace {
 return workspaceSchema.parse({...workspace,activities:[...workspace.activities,{id:crypto.randomUUID(),projectId,type,message,at:new Date().toISOString()}]});
}
export function updateWork(workspace:Workspace,id:string,patch:Partial<WorkItem>):Workspace {
 const item=workspace.workItems.find(x=>x.id===id);if(!item)throw new Error('Work item not found');
 const at=new Date().toISOString(),status=patch.status??item.status;
 return finish({...workspace,workItems:workspace.workItems.map(x=>x.id===id?{...x,...patch,id:x.id,projectId:x.projectId,updatedAt:at,done:status==='done',completedAt:status==='done'?x.completedAt??at:undefined}:x)},item.projectId,'work-updated',item.title);
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
 const ru=locale==='ru',items=w.workItems.filter(x=>x.projectId===projectId&&!x.archived),at=new Date().toISOString();
 const section=(title:string,rows:string[])=>`## ${title}\n${rows.length?rows.map(x=>`- ${x}`).join('\n'):(ru?'Нет записей':'No records')}\n`;
 const body=[`# ${p.name} — ${ru?'Черновик статуса':'Status draft'}`,section(ru?'Завершено':'Completed',items.filter(x=>x.done).map(x=>x.title)),section(ru?'В работе':'Current work',items.filter(x=>['in-progress','review'].includes(x.status)).map(x=>x.title)),section(ru?'Следующий период':'Next period',items.filter(x=>x.status==='ready').map(x=>x.title)),section(ru?'Контрольные точки':'Milestones',w.milestones.filter(x=>x.projectId===projectId).map(x=>`${x.date}: ${x.title}`)),section(ru?'Критические риски':'Critical risks',w.risks.filter(x=>x.projectId===projectId&&x.status!=='closed'&&x.impact*x.probability>=15).map(x=>x.title)),section(ru?'Проблемы':'Issues',w.issues.filter(x=>x.projectId===projectId&&x.status!=='closed').map(x=>x.title)),section(ru?'Нужны решения':'Decisions needed',w.decisions.filter(x=>x.projectId===projectId&&x.status==='pending').map(x=>x.question)),section(ru?'Нужна помощь':'Help needed',items.filter(x=>x.blocked).map(x=>`${x.title}: ${x.blockerReason??''}`)),`${ru?'Сигнал сроков':'Schedule signal'}: ${p.health.schedule}\n${ru?'Сигнал бюджета':'Budget signal'}: ${p.health.cost??'unknown'}`].join('\n');
 return finish({...w,documents:[...w.documents,{id:`DOC-${crypto.randomUUID()}`,projectId,title:ru?'Черновик статуса':'Status report draft',type:'status-report',body,relatedIds:[],updatedAt:at}]},projectId,'status-draft',p.name);
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
 return finish({...w,milestones:w.milestones.map(m=>m.id===id?{...m,...patch,id:m.id,projectId:m.projectId}:m)},item.projectId,'milestone-updated',item.title);
}
export function applyTemplate(w:Workspace,document:Workspace['documents'][number]){
 if(!w.projects.some(p=>p.id===document.projectId)||w.documents.some(d=>d.id===document.id))throw Error('Invalid document identity');
 return finish({...w,documents:[...w.documents,{...document,updatedAt:new Date().toISOString()}]},document.projectId,'template-applied',document.title);
}
export function approveChange(w:Workspace,id:string,approver:string,decision:string){
 const item=w.changes.find(c=>c.id===id);if(!item||!approver.trim()||!decision.trim())throw Error('Approval needs a change, approver and rationale');
 return finish({...w,changes:w.changes.map(c=>c.id===id?{...c,status:'approved',approver,decision}:c)},item.projectId,'change-approved',item.change);
}
