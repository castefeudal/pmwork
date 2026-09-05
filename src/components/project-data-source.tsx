"use client";
import {useState} from 'react';
import {loadWorkspace} from '@/data/storage';
import type {Locale,Workspace} from '@/domain/schemas';
export function ProjectDataSource({locale,onLoad}:{locale:Locale;onLoad:(w:Workspace,id:string)=>string}){
const ru=locale==='ru',[workspace,setWorkspace]=useState<Workspace|null>(null),[project,setProject]=useState(''),[message,setMessage]=useState('');
return <div className="project-data-source"><button className="button small" onClick={async()=>{try{const w=await loadWorkspace();setWorkspace(w);setProject(w?.projects[0]?.id??'');if(!w?.projects.length)setMessage(ru?'Создайте проект или вводите данные вручную.':'Create a project or enter values manually.')}catch{setMessage(ru?'Не удалось прочитать проекты. Откройте Workspace и проверьте данные.':'Could not read projects. Open Workspace and check data.')}}}>{ru?'Выбрать данные проекта':'Choose project data'}</button>{workspace?.projects.length?<><label>{ru?'Проект':'Project'}<select value={project} onChange={e=>setProject(e.target.value)}>{workspace.projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><button className="button small" onClick={()=>{try{setMessage(onLoad(workspace,project))}catch{setMessage(ru?'Данных недостаточно или связи несовместимы. Проверьте даты, единицы и зависимости; доступен ручной ввод.':'Insufficient data or incompatible links. Check dates, units and dependencies; manual input is available.')}}}>{ru?'Использовать данные проекта':'Use project data'}</button></>:null}{message&&<p role="status">{message}</p>}</div>
}
