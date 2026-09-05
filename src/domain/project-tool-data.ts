import type {Workspace} from './schemas';
import {calculateCPM} from './calculations';
export function projectNetwork(w:Workspace,id:string){
 const items=w.workItems.filter(x=>x.projectId===id&&!x.archived&&!x.done);if(!items.length)throw Error('No open work');
 const links=w.dependencies.filter(x=>x.projectId===id);if(links.some(x=>x.type!=='FS'||x.lag!==0))throw Error('Manual CPM supports only FS with zero lag');
 const known=new Set(items.map(x=>x.id)),completed=new Set(w.workItems.filter(x=>x.projectId===id&&x.done).map(x=>x.id));
 const tasks=items.map(x=>{if(!x.startDate||!x.dueDate)throw Error('Calendar dates required');const duration=(Date.parse(x.dueDate)-Date.parse(x.startDate))/86400000;if(!Number.isFinite(duration)||duration<0)throw Error('Invalid dates');const all=[...x.dependencies,...links.filter(l=>l.successorId===x.id).map(l=>l.predecessorId)];if(all.some(p=>!known.has(p)&&!completed.has(p)))throw Error('Missing predecessor');return {id:x.id,duration,predecessors:[...new Set(all.filter(p=>known.has(p)))]}});
 calculateCPM(tasks);return tasks;
}
