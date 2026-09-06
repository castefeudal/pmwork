import {starterPacks} from '@/content/starter-packs';
import {workspaceSchema,type Workspace,type Locale} from './schemas';
export function applyStarterBundle(workspace:Workspace,projectId:string,packId:string,locale:Locale):Workspace {
 const p=workspace.projects.find(x=>x.id===projectId),pack=starterPacks.find(x=>x.id===packId);
 if(!p||!pack)throw Error('Unknown project or starter pack');
 if(workspace.workItems.some(x=>x.projectId===projectId)||workspace.objectives.some(x=>x.projectId===projectId))throw Error('Starter needs an empty project');
 const text=pack[locale],at=new Date().toISOString(),objectiveId=crypto.randomUUID(),milestoneId=crypto.randomUUID();
 const titles=text[3].split(';').map(x=>x.trim()),ids=titles.map(()=>crypto.randomUUID());
 const risks=text[5].split(';').map((title)=>({id:crypto.randomUUID(),projectId,title:title.trim(),category:pack.type,description:locale==='ru'?`Проверьте, может ли фактор «${title.trim()}» сорвать результат проекта.`:`Check whether ${title.trim().toLowerCase()} could prevent the project outcome.`,probability:3,impact:3,owner:p.owner,strategy:'mitigate' as const,actions:locale==='ru'?'Проверить исходные данные, выбрать меру и уточнить оценку на первом обзоре.':'Check evidence, choose a response and refine the assessment at the first review.',trigger:'',reviewDate:p.startDate,status:'open' as const}));
 return workspaceSchema.parse({...workspace,
  projects:workspace.projects.map(x=>x.id===projectId?{...x,definitionOfDone:x.definitionOfDone||text[2],successMeasures:x.successMeasures.length?x.successMeasures:[text[2]]}:x),
  objectives:[...workspace.objectives,{id:objectiveId,projectId,description:p.objective,type:'outcome',baseline:'',target:p.objective,measure:text[2],dueDate:p.targetDate,owner:p.owner,deliverableIds:ids,status:'planned'}],
  milestones:[...workspace.milestones,{id:milestoneId,projectId,title:text[2],date:p.targetDate,baselineDate:p.targetDate||undefined,ownerLabel:p.owner,confidence:'unknown',status:'planned',progress:0}],
  workItems:[...workspace.workItems,...titles.map((title,i)=>({id:ids[i],projectId,title,description:'',type:'task',status:i===0?'ready':'backlog',priority:'medium',owner:p.owner,contributors:[],labels:[],dependencies:i?[ids[i-1]]:[],acceptanceCriteria:[],done:false,blocked:false,riskIds:risks.map(r=>r.id),objectiveIds:[objectiveId],milestoneId,order:i,createdAt:at,updatedAt:at,archived:false}))],
  risks:[...workspace.risks,...risks],
  communications:[...workspace.communications,{id:crypto.randomUUID(),projectId,audience:locale==='ru'?'Участники проекта':'Project participants',purpose:text[6],channel:'',cadence:locale==='ru'?'Еженедельно':'Weekly',owner:p.owner,successSignal:text[2]}],
  activities:[...workspace.activities,{id:crypto.randomUUID(),projectId,at,type:'starter-bundle',message:packId}]
 });
}
export function undoStarterBundle(current:Workspace,before:Workspace,after:Workspace):Workspace {
 if(JSON.stringify(current)!==JSON.stringify(after))throw Error('Workspace changed after starter creation');
 return workspaceSchema.parse(before);
}
