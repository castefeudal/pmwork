"use client";
import { useId, useMemo, useState, useSyncExternalStore } from "react";
import Fuse from "fuse.js";
import { Search, X } from "lucide-react";
import { useDialogFocus } from "./use-dialog-focus";
import type { ViewProps } from "./workspace-views";
import type { CreateType, WorkspaceView } from "./workspace-types";
import type { EditableKind } from "./record-editor";
const recentStorageKey = "pmwork:command-recent:v1";
const subscribeRecent = (notify: () => void) => {
  window.addEventListener("storage", notify);
  window.addEventListener("pmwork:command-recent", notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener("pmwork:command-recent", notify);
  };
};
const readRecentSnapshot = () => {
  try { return localStorage.getItem(recentStorageKey) ?? "[]"; }
  catch { return "[]"; }
};
export function CommandMenu({workspace, project, locale, onClose, onView, onCreate, onProject, onEdit}: Omit<ViewProps,"onChange"> & {onClose: () => void}) {
  const ru = locale === "ru", prefix = useId(), dialogRef = useDialogFocus(), base = process.env.NEXT_PUBLIC_PMWORK_BASE_PATH ?? "";
  const [query, setQuery] = useState(""), [selected, setSelected] = useState(0);
  const recentSnapshot = useSyncExternalStore(subscribeRecent,readRecentSnapshot,()=>"[]");
  const recentIds = useMemo(() => {
    try {
      const saved = JSON.parse(recentSnapshot);
      return Array.isArray(saved) ? saved.filter((id): id is string => typeof id === "string").slice(0, 8) : [];
    } catch { return []; }
  },[recentSnapshot]);
  const entries = useMemo(() => {
    const rows: {id:string; label:string; meta:string; search?:string; run:()=>void}[] = [];
    const intent:Partial<Record<WorkspaceView,string>>={overview:"today сейчас главное приоритет сигнал",work:"task задача работа backlog бэклог",planning:"deadline срок успеем прогноз forecast milestone веха",raid:"risk риск денег EMV решение decision",people:"owner владелец кто отвечает ответственность",finance:"budget бюджет деньги cost стоимость",control:"status статус change изменение quality качество",guide:"guide помощь подход method"};
    const views: [WorkspaceView,string,string][] = [["program","Программы","Programs"],["delivery","Поставка","Delivery"],["operations","Операции","Operations"],["overview","Обзор","Overview"],["work","Работа","Work"],["board","Доска","Board"],["planning","Планирование","Planning"],["raid","RAID","RAID"],["people","Люди","People"],["finance","Финансы","Finance"],["control","Контроль","Control"],["documents","Документы","Documents"],["portfolio","Портфель","Portfolio"],["guide","Проведи меня","Guide me"],["setup","Настройка","Setup"]];
    views.forEach(([id,r,e]) => rows.push({id,label:ru?r:e,meta:ru?"Раздел":"View",search:intent[id],run:()=>onView(id)}));
    const creates: [CreateType,string,string][] = [["work","Создать работу","Create work"],["risk","Создать риск","Create risk"],["issue","Создать проблему","Create issue"],["decision","Создать решение","Create decision"],["milestone","Создать контрольную точку","Create milestone"],["document","Создать документ","Create document"]];
    creates.forEach(([id,r,e]) => rows.push({id:`create-${id}`,label:ru?r:e,meta:ru?"Действие":"Action",run:()=>onCreate(id)}));
    workspace.projects.forEach(p => rows.push({id:`project-${p.id}`,label:p.name,meta:ru?"Переключить проект":"Switch project",run:()=>{onProject(p.id);onView("overview");}}));
    for(const [collection,view,label] of [[workspace.programs,"program",ru?"Программа":"Program"],[workspace.operations,"operations",ru?"Процесс":"Operation"]] as const) collection.forEach(record=>rows.push({id:`${view}-${record.id}`,label:record.name,meta:label,run:()=>{const url=new URL(window.location.href);url.searchParams.set("context",record.id);history.pushState(null,"",url);dispatchEvent(new Event("pmwork-url"));onView(view);}}));
    const add = (kind:EditableKind,id:string,label:string,pid:string) => rows.push({id:`${kind}-${id}`,label,meta:`${id} · ${workspace.projects.find(p=>p.id===pid)?.name ?? ""}`,run:()=>{onProject(pid);onEdit(kind,id);}});
    workspace.workItems.filter(x=>!x.archived).forEach(x=>add("work",x.id,x.title,x.projectId));
    workspace.risks.forEach(x=>add("risk",x.id,x.title,x.projectId));
    workspace.issues.forEach(x=>add("issue",x.id,x.title,x.projectId));
    workspace.decisions.forEach(x=>add("decision",x.id,x.question,x.projectId));
    workspace.milestones.forEach(x=>add("milestone",x.id,x.title,x.projectId));
    workspace.documents.forEach(x=>add("document",x.id,x.title,x.projectId));
    const tools=[
      ["deadline","Deadline confidence","срок успеем deadline forecast прогноз P50 P80 P90"],
      ["emv","Risk EMV","риск денег monetary contingency резерв EMV"],
      ["capacity","Capacity & WIP","загрузка команды capacity WIP мощность"],
      ["ownership","Ownership coverage","кто отвечает owner владелец ответственность"],
      ["markovmade","MARKOVMADE priority","ограничение constraint приоритет evidence ROI"],
    ];
    tools.forEach(([id,label,search])=>rows.push({id:`tool-${id}`,label,meta:ru?"Инструмент":"Tool",search,run:()=>{
      // A full navigation intentionally leaves the workspace application for the public tools bundle.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`${base}/${locale}/tools/?tool=${id}`);
    }}));
    return rows;
  },[workspace,ru,onView,onCreate,onProject,onEdit,base,locale]);
  const index = useMemo(()=>new Fuse(entries,{keys:[{name:"label",weight:2},"meta","search"],threshold:.4,ignoreLocation:true}),[entries]);
  const results = useMemo(() => {
    if (query.trim()) return index.search(query,{limit:30}).map(x=>x.item).sort((a,b)=>Number(b.meta.includes(project.name))-Number(a.meta.includes(project.name)));
    const byId = new Map(entries.map(entry => [entry.id, entry]));
    const recent = recentIds.map(id => byId.get(id)).filter((item): item is (typeof entries)[number] => Boolean(item));
    const suggestions = entries.filter(item => !recentIds.includes(item.id)).slice(0, Math.max(0, 21 - recent.length));
    return [...recent, ...suggestions];
  }, [entries,index,project.name,query,recentIds]);
  const active = Math.min(selected, Math.max(0,results.length-1));
  const execute = (i:number) => { const item=results[i]; if(item){ const next=[item.id,...recentIds.filter(id=>id!==item.id)].slice(0,8);try{localStorage.setItem(recentStorageKey,JSON.stringify(next));window.dispatchEvent(new Event("pmwork:command-recent"));}catch{/* Recent navigation is best-effort only. */}onClose();item.run();} };
  const groups = useMemo(() => {
    const output: {label:string; items:{item:(typeof results)[number];index:number}[]}[]=[];
    const labels = new Map<string,string>([[ru?"Раздел":"View",ru?"Разделы":"Views"],[ru?"Действие":"Action",ru?"Действия":"Actions"],[ru?"Переключить проект":"Switch project",ru?"Проекты":"Projects"],[ru?"Инструмент":"Tool",ru?"Инструменты":"Tools"]]);
    results.forEach((item,index)=>{
      const label=!query.trim()&&recentIds.includes(item.id)?(ru?"Недавние":"Recent"):labels.get(item.meta)??(item.meta.includes(" · ")?(ru?"Записи":"Records"):item.meta);
      let group=output.find(entry=>entry.label===label);if(!group){group={label,items:[]};output.push(group);}group.items.push({item,index});
    });
    return output;
  },[query,recentIds,results,ru]);
  const highlighted=(label:string)=>{const needle=query.trim();if(!needle)return label;const start=label.toLocaleLowerCase().indexOf(needle.toLocaleLowerCase());if(start<0)return label;return <>{label.slice(0,start)}<mark>{label.slice(start,start+needle.length)}</mark>{label.slice(start+needle.length)}</>;};
  return <div className="dialog-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
    <section className="command-palette" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={ru?"Командная палитра":"Command palette"}>
      <div className="search-input"><Search/><input role="combobox" aria-label={ru?"Найти запись или действие":"Find a record or action"} aria-expanded="true" aria-controls={`${prefix}-results`} aria-activedescendant={results.length ? `${prefix}-${active}`:undefined} autoComplete="off" value={query} onChange={e=>{setQuery(e.target.value);setSelected(0);}} placeholder={ru?"Название, ID, действие…":"Title, ID, action…"} onKeyDown={e=>{if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();setSelected((active+(e.key==="ArrowDown"?1:-1)+results.length)%Math.max(1,results.length));}if(e.key==="Enter"){e.preventDefault();execute(active);}if(e.key==="Escape")onClose();}}/><button className="icon-button" onClick={onClose} aria-label={ru?"Закрыть":"Close"}><X size={18}/></button></div>
      <p className="muted compact">{project.name} · {ru?"↑ ↓ выбор · Enter открыть · Esc закрыть":"↑ ↓ select · Enter open · Esc close"}</p>
      <div className="command-results" role="listbox" id={`${prefix}-results`} aria-label={ru?"Результаты поиска":"Search results"}>{groups.map(group=><div className="command-result-group" role="presentation" key={group.label}><p className="command-group-label" role="presentation">{group.label}</p>{group.items.map(({item,index})=><button role="option" aria-selected={index===active} id={`${prefix}-${index}`} key={item.id} onClick={()=>execute(index)}><span>{highlighted(item.label)}</span><small>{item.meta}</small></button>)}</div>)}{!results.length&&<p role="status">{ru?"Совпадений нет. Попробуйте название, ID или «Создать».":"No matches. Try a title, ID or “Create”."}</p>}</div>
      <div className="button-row"><a className="button small" href={`${base}/${locale}/tools/`}>{ru?"Инструменты":"Tools"}</a><a className="button small" href={`${base}/${locale}/knowledge/`}>{ru?"База знаний":"Knowledge"}</a></div>
    </section>
  </div>;
}
