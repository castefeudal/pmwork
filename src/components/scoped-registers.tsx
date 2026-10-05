"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { Locale, Scope, Workspace } from "@/domain/schemas";
import { contextProject, contextWorkspace, applyContextWorkspace } from "@/domain/work-scope";
import { useUrlChoice, useUrlValue } from "./use-url-state";
import { workspaceRecordUrl, readWorkspaceRecord } from "@/domain/workspace-url";
import type { CreateType, WorkspaceView } from "./workspace-types";
import type { EditableKind } from "./record-editor";
import { WorkView, BoardView, PlanningView, RaidView, PeopleView, FinanceView, ControlView, type ViewProps } from "./workspace-views";
import { DocumentCenter } from "./document-center";

const Editor=dynamic(()=>import("./record-editor").then(module=>module.RecordEditor));
const Create=dynamic(()=>import("./workspace-dialog").then(module=>module.WorkspaceDialog));
const registers=["work","board","planning","raid","people","finance","control","documents"] as const;
export function ScopedRegisters({workspace,scope,locale,onChange}:{workspace:Workspace;scope:Scope;locale:Locale;onChange:(workspace:Workspace)=>void}) {
  const ru=locale==="ru",[register,setRegister]=useUrlChoice("register",registers,"work"),[dialog,setDialog]=useState<CreateType|null>(null),[error,setError]=useState(""),[expanded,setExpanded]=useState(false);
  const [item]=useUrlValue("item"),[kind]=useUrlValue("kind");
  const project=contextProject(workspace,scope),view=contextWorkspace(workspace,scope);
  const editor=readWorkspaceRecord(new URLSearchParams({item,kind}).toString(),view,project.id);
  const change=(next:Workspace)=>{try{onChange(applyContextWorkspace(workspace,next,scope));setError("");}catch(error){setError(ru?"Изменение не применено: проверьте связи и обязательные данные.":"Change was not applied. Check related records and required evidence.");throw error;}};
  const edit=(kind:EditableKind,id:string)=>{const next=workspaceRecordUrl(window.location.href,{kind,id});history.pushState(null,"",next);dispatchEvent(new Event("pmwork-url"));};
  const close=()=>{history.replaceState(null,"",workspaceRecordUrl(window.location.href,null));dispatchEvent(new Event("pmwork-url"));};
  const onView=(next:WorkspaceView)=>{if(registers.includes(next as typeof registers[number]))setRegister(next);};
  const props:ViewProps={workspace:view,project,locale,onChange:change,onCreate:type=>{if(type!=="project")setDialog(type);},onView,onEdit:edit,onProject:()=>undefined};
  const labels={work:ru?"Работа":"Work",board:ru?"Доска":"Board",planning:ru?"План":"Plan",raid:ru?"Риски и решения":"Risks & decisions",people:ru?"Люди и поставщики":"People & vendors",finance:ru?"Финансы":"Finance",control:ru?"Контроль":"Control",documents:ru?"Документы":"Documents"};
  return <details className="panel" open={Boolean(item)||expanded} onToggle={event=>setExpanded(event.currentTarget.open)}><summary>{ru?"Работа, риски, люди и документы":"Work, risks, people and documents"}</summary><h3>{ru?"Общие рабочие регистры":"Shared working registers"}</h3><p className="muted">{ru?"Записи принадлежат выбранному контексту. Общие редакторы, связи и расчёты работают без копирования исходных данных.":"Records belong to the selected context. Shared editors, relationships and calculations use the same source data."}</p><div className="tabs" role="group" aria-label={ru?"Регистры контекста":"Context registers"}>{registers.filter(value=>value!=="board").map(value=><button key={value} className={register===value?"active":""} aria-pressed={register===value} onClick={()=>setRegister(value)}>{labels[value]}</button>)}</div>{error&&<p role="alert">{error}</p>}
    {(expanded||Boolean(item))&&<> {register==="work"&&<WorkView {...props}/>} {register==="board"&&<BoardView {...props}/>} {register==="planning"&&<PlanningView {...props}/>} {register==="raid"&&<RaidView {...props}/>} {register==="people"&&<PeopleView {...props}/>} {register==="finance"&&<FinanceView {...props}/>} {register==="control"&&<ControlView {...props}/>} {register==="documents"&&<DocumentCenter {...props}/>}
    {dialog&&<Create type={dialog} workspace={view} locale={locale} projectId={project.id} onClose={()=>setDialog(null)} onCommit={next=>{change(next);setDialog(null);}}/>}
    {editor&&<Editor key={`${editor.kind}-${editor.id}`} kind={editor.kind} id={editor.id} workspace={view} locale={locale} projectId={project.id} onClose={close} onChange={change}/>}
    </>}
  </details>;
}
