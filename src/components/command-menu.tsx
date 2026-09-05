"use client";
import { useId, useMemo, useState } from "react";
import Fuse from "fuse.js";
import { Search, X } from "lucide-react";
import { useDialogFocus } from "./use-dialog-focus";
import type { ViewProps } from "./workspace-views";
import type { CreateType, WorkspaceView } from "./workspace-types";
import type { EditableKind } from "./record-editor";
export function CommandMenu({workspace, project, locale, onClose, onView, onCreate, onProject, onEdit}: Omit<ViewProps,"onChange"> & {onClose: () => void}) {
  const ru = locale === "ru", prefix = useId(), dialogRef = useDialogFocus();
  const [query, setQuery] = useState(""), [selected, setSelected] = useState(0);
  const entries = useMemo(() => {
    const rows: {id:string; label:string; meta:string; run:()=>void}[] = [];
    const views: [WorkspaceView,string,string][] = [["overview","Обзор","Overview"],["work","Работа","Work"],["board","Доска","Board"],["planning","Планирование","Planning"],["raid","RAID","RAID"],["people","Люди","People"],["finance","Финансы","Finance"],["control","Контроль","Control"],["documents","Документы","Documents"],["portfolio","Портфель","Portfolio"],["guide","Проведи меня","Guide me"],["setup","Настройка","Setup"]];
    views.forEach(([id,r,e]) => rows.push({id,label:ru?r:e,meta:ru?"Раздел":"View",run:()=>onView(id)}));
    const creates: [CreateType,string,string][] = [["work","Создать работу","Create work"],["risk","Создать риск","Create risk"],["issue","Создать проблему","Create issue"],["decision","Создать решение","Create decision"],["milestone","Создать контрольную точку","Create milestone"],["document","Создать документ","Create document"]];
    creates.forEach(([id,r,e]) => rows.push({id:`create-${id}`,label:ru?r:e,meta:ru?"Действие":"Action",run:()=>onCreate(id)}));
    workspace.projects.forEach(p => rows.push({id:`project-${p.id}`,label:p.name,meta:ru?"Переключить проект":"Switch project",run:()=>{onProject(p.id);onView("overview");}}));
    const add = (kind:EditableKind,id:string,label:string,pid:string) => rows.push({id:`${kind}-${id}`,label,meta:`${id} · ${workspace.projects.find(p=>p.id===pid)?.name ?? ""}`,run:()=>{onProject(pid);onEdit(kind,id);}});
    workspace.workItems.filter(x=>!x.archived).forEach(x=>add("work",x.id,x.title,x.projectId));
    workspace.risks.forEach(x=>add("risk",x.id,x.title,x.projectId));
    workspace.issues.forEach(x=>add("issue",x.id,x.title,x.projectId));
    workspace.decisions.forEach(x=>add("decision",x.id,x.question,x.projectId));
    workspace.milestones.forEach(x=>add("milestone",x.id,x.title,x.projectId));
    workspace.documents.forEach(x=>add("document",x.id,x.title,x.projectId));
    return rows;
  },[workspace,ru,onView,onCreate,onProject,onEdit]);
  const index = useMemo(()=>new Fuse(entries,{keys:[{name:"label",weight:2},"meta"],threshold:.35,ignoreLocation:true}),[entries]);
  const results = query.trim() ? index.search(query,{limit:30}).map(x=>x.item) : entries.slice(0,21);
  const active = Math.min(selected, Math.max(0,results.length-1));
  const execute = (i:number) => { const item=results[i]; if(item){onClose();item.run();} };
  const base = process.env.NEXT_PUBLIC_PMWORK_BASE_PATH ?? "";
  return <div className="dialog-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
    <section className="command-palette" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={ru?"Командная палитра":"Command palette"}>
      <div className="search-input"><Search/><input role="combobox" aria-label={ru?"Найти запись или действие":"Find a record or action"} aria-expanded="true" aria-controls={`${prefix}-results`} aria-activedescendant={results.length ? `${prefix}-${active}`:undefined} autoComplete="off" value={query} onChange={e=>{setQuery(e.target.value);setSelected(0);}} placeholder={ru?"Название, ID, действие…":"Title, ID, action…"} onKeyDown={e=>{if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();setSelected((active+(e.key==="ArrowDown"?1:-1)+results.length)%Math.max(1,results.length));}if(e.key==="Enter"){e.preventDefault();execute(active);}if(e.key==="Escape")onClose();}}/><button className="icon-button" onClick={onClose} aria-label={ru?"Закрыть":"Close"}><X size={18}/></button></div>
      <p className="muted compact">{project.name} · {ru?"↑ ↓ выбор · Enter открыть · Esc закрыть":"↑ ↓ select · Enter open · Esc close"}</p>
      <div className="command-results" role="listbox" id={`${prefix}-results`} aria-label={ru?"Результаты поиска":"Search results"}>{results.map((x,i)=><button role="option" aria-selected={i===active} id={`${prefix}-${i}`} key={x.id} onClick={()=>execute(i)}><span>{x.label}</span><small>{x.meta}</small></button>)}{!results.length&&<p role="status">{ru?"Совпадений нет. Попробуйте название, ID или «Создать».":"No matches. Try a title, ID or “Create”."}</p>}</div>
      <div className="button-row"><a className="button small" href={`${base}/${locale}/tools/`}>{ru?"Инструменты":"Tools"}</a><a className="button small" href={`${base}/${locale}/knowledge/`}>{ru?"База знаний":"Knowledge"}</a></div>
    </section>
  </div>;
}
