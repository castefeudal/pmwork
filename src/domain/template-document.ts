import type {Template} from '@/content/catalog';
import {templateExamples} from '@/content/template-examples';
import type {Locale,Workspace} from './schemas';
export type TemplateDepth='minimal'|'standard'|'detailed';
export function templateDocument(template:Template,w:Workspace,projectId:string,locale:Locale,depth:TemplateDepth){
 const p=w.projects.find(p=>p.id===projectId);if(!p)throw Error('Project missing');const ru=locale==='ru';
 const section=(title:string,value:string)=>`## ${title}\n\n${value||(ru?'Уточните перед согласованием.':'Clarify before approval.')}`;
 const rows=<T extends {projectId:string}>(items:T[],format:(item:T)=>string)=>items.filter(x=>x.projectId===p.id).map(format).join('\n');
 const known=[section(ru?'Проект':'Project',p.name),section(ru?'Ожидаемый результат':'Expected outcome',p.objective),section(ru?'Владелец':'Owner',p.owner),section(ru?'Целевая дата':'Target date',p.targetDate)];
 const fields=template.fields.slice(0,depth==='minimal'?2:undefined).map(f=>{const name=f.en.toLowerCase();let value='';if(/owner/.test(name))value=p.owner;else if(/outcome/.test(name))value=p.objective;else if(/success/.test(name))value=p.successMeasures.join('\n');else if(/scope|boundar/.test(name))value=`${p.scopeIn}\n${p.scopeOut}`.trim();else if(/milestone/.test(name))value=rows(w.milestones,x=>`${x.title} · ${x.date} · ${x.progress}%`);else if(/budget|cost/.test(name))value=rows(w.budgets,x=>`${x.category}: ${x.planned} / ${x.actual} / ${x.forecast??(x.actual+x.committed)} ${p.currency}`);else if(/risk/.test(name))value=rows(w.risks,x=>`${x.title} · ${x.probability} × ${x.impact} · ${x.owner} · ${x.actions}`);else if(/dependenc/.test(name))value=rows(w.dependencies,x=>`${x.predecessorId} → ${x.successorId} · ${x.type} ${x.lag}`);else if(/decision/.test(name))value=rows(w.decisions,x=>`${x.question} · ${x.decision} · ${x.owner}`);return section(f[locale],value)});
 const extra=depth==='detailed'?[section(ru?'Спонсор':'Sponsor',p.sponsor),section(ru?'Команда':'Team',rows(w.teamMembers,x=>`${x.name} · ${x.role}`)),section(ru?'Участники согласования':'Stakeholders',rows(w.stakeholders,x=>`${x.name} · ${x.role}`)),section(ru?'Ограничения':'Constraints',p.constraints)]:[];
 return [`# ${template.title[locale]}`,template.purpose[locale],...known,...fields,...extra].join('\n\n');
}
export function templateExample(slug:string,locale:Locale){return templateExamples[slug]?.[locale]}
