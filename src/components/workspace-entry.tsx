"use client";
import {lazy,Suspense,useEffect,useState} from "react";
import type {Locale} from "@/domain/schemas";
import type {ManagementRole} from "@/domain/management-role";
import {hasWorkspaceData} from "@/data/workspace-presence";
import {WorkspaceBoot} from "./workspace-boot";
import {WorkspaceWelcome,type WorkspaceIntent} from "./workspace-welcome";

const WorkspaceApp=lazy(()=>import("./workspace-app").then(module=>({default:module.WorkspaceApp})));

export function WorkspaceEntry({locale}:{locale:Locale}) {
  const [existing,setExisting]=useState<boolean|null>(null);
  const [role,setRole]=useState<ManagementRole>("project");
  const [priority,setPriority]=useState("attention");
  const [intent,setIntent]=useState<WorkspaceIntent>();
  useEffect(()=>{
    let active=true;
    void hasWorkspaceData().then(value=>{if(active)setExisting(value);},()=>{if(active)setExisting(true);});
    return()=>{active=false;};
  },[locale]);
  if(existing===null)return <WorkspaceBoot locale={locale}/>;
  if(existing||intent)return <Suspense fallback={<WorkspaceBoot locale={locale}/>}><WorkspaceApp locale={locale} initialIntent={intent}/></Suspense>;
  return <WorkspaceWelcome locale={locale} role={role} onRole={setRole} priority={priority} onPriority={setPriority}
    onCreate={()=>setIntent({kind:"project",role,priority})}
    onDemo={()=>setIntent({kind:"demo",role,priority})}
    onImport={file=>setIntent({kind:"restore",role,priority,file})}/>;
}
