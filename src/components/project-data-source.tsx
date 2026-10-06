"use client";
import {useState} from 'react';
import {workspaceScopes,contextProject,scopeKey} from '@/domain/work-scope';
import {loadWorkspace} from '@/data/storage';
import type {Locale,Workspace} from '@/domain/schemas';
export function ProjectDataSource({locale,onLoad}:{locale:Locale;onLoad:(w:Workspace,id:string)=>string}){
const ru=locale==='ru',[workspace,setWorkspace]=useState<Workspace|null>(null),[project,setProject]=useState(''),[message,setMessage]=useState('');
const contexts=workspace?workspaceScopes(workspace):[];
return <div className="project-data-source"><button className="button small" onClick={async()=>{try{const w=await loadWorkspace();setWorkspace(w);setProject(w?scopeKey(workspaceScopes(w)[0]??{kind:'project',id:''}):'');if(!w||!workspaceScopes(w).length)setMessage(ru?'Создайте проект или вводите данные вручную.':'Create a project or enter values manually.')}catch{setMessage(ru?'Не удалось прочитать данные. Откройте рабочее пространство и проверьте данные.':'Could not read projects. Open Workspace and check data.')}}}>{ru?'Выбрать рабочие данные':'Choose workspace data'}</button>{workspace&&contexts.length?<><label>{ru?'Контекст':'Context'}<select value={project} onChange={e=>setProject(e.target.value)}>{contexts.map(scope=><option key={scopeKey(scope)} value={scopeKey(scope)}>{contextProject(workspace,scope).name}</option>)}</select></label><button className="button small" onClick={()=>{try{setMessage(onLoad(workspace,project))}catch{setMessage(ru?'Данных недостаточно или связи несовместимы. Проверьте даты, единицы и зависимости; доступен ручной ввод.':'Insufficient data or incompatible links. Check dates, units and dependencies; manual input is available.')}}}>{ru?'Использовать данные контекста':'Use context data'}</button></>:null}{message&&<p role="status">{message}</p>}</div>
}
