"use client";
import { CollectionPager } from "./collection-pager";
import {OutcomeCenter} from "./outcome-center";
import {EmptyStateGraphic} from "./atlas-empty";
import { updateWork, setWorkArchived } from "@/domain/workspace-commands";
import { formatDate } from "@/domain/format-date";
import { useMemo, useRef, useState } from "react";
import { Plus, Search, SlidersHorizontal, Bookmark, RotateCcw, Check, RotateCw, X } from "lucide-react";
import { workViewConfigSchema, type WorkViewConfig, type WorkItem } from "@/domain/schemas";
import { localDay, selectWork } from "@/domain/work-views";
import { displayLabel } from "@/content/workspace-i18n";
import { BoardView, type ViewProps } from "./workspace-views";
import { ConfirmationDialog } from "./confirmation-dialog";
import { ProjectCalendar } from "./project-calendar";
import { QuickWorkCreate } from "./quick-work-create";
const statuses = ["backlog", "ready", "in-progress", "review", "done"] as const;
const presets = { all: ["Вся работа", "All work"], my: ["Моя работа", "My work"], attention: ["Внимание", "Attention"], soon: ["Ближайшие 7 дней", "Due soon"], overdue: ["Просрочено", "Overdue"], blocked: ["Блокеры", "Blocked"], priority: ["Высокий приоритет", "High priority"], unassigned: ["Без владельца", "Unassigned"], recent: ["Обновлено за неделю", "Recently updated"] } as const;
const properties = { owner: ["Владелец", "Owner"], due: ["Срок", "Due"], priority: ["Приоритет", "Priority"], effort: ["Трудоёмкость", "Effort"], milestone: ["Контрольная точка", "Milestone"] } as const;

function WorkDeadline({ item, locale }: { item: WorkItem; locale: ViewProps["locale"] }) {
  const ru = locale === "ru";
  const overdue = !item.done && !!item.dueDate && item.dueDate < localDay();
  const dueToday = !item.done && item.dueDate === localDay();
  return <span className={`work-card-deadline${overdue ? " is-overdue" : dueToday ? " is-today" : ""}`}>
    {item.dueDate ? <time dateTime={item.dueDate}>{formatDate(item.dueDate, locale)}</time> : (ru ? "Без срока" : "No due date")}
    {(overdue || dueToday) && <strong>{overdue ? (ru ? "Просрочено" : "Overdue") : (ru ? "Сегодня" : "Due today")}</strong>}
  </span>;
}

export function WorkSurface(props: ViewProps & { layout?: "list" | "board" }) {
  return <ProjectWorkSurface key={props.project.id} {...props}/>;
}

function ProjectWorkSurface(props: ViewProps & { layout?: "list" | "board" }) {
  const {workspace, project, locale, onChange, onCreate, onEdit} = props;
  const ru = locale === "ru", lang = ru ? 0 : 1;
  const [name, setName] = useState(""), [undo, setUndo] = useState<string[]>([]), [pendingDelete, setPendingDelete] = useState<string | null>(null), [calendarOpen, setCalendarOpen] = useState(false);
  const [selection,setSelection]=useState<{ context: string; ids: string[] }>({context:"",ids:[]});
  const [selectionMode,setSelectionMode]=useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const preferences = workspace.workViewPreferences.find(x => x.projectId === project.id)?.config ?? workViewConfigSchema.parse({});
  const config = { ...preferences, type: props.layout ?? preferences.type };
  const [paging,setPaging] = useState({key:"",index:0});
  const pageKey=project.id+JSON.stringify(config);
  const saved = workspace.savedWorkViews.filter(x => x.projectId === project.id);
  const all = useMemo(() => {
    const members=new Map(workspace.teamMembers.filter(m=>m.projectId===project.id).map(m=>[m.id,m]));
    return workspace.workItems.filter(x => x.projectId === project.id && !x.archived).map(item => {
    const member=members.get(item.ownerId??"");
    return member?{...item,owner:member.name}:item;
    });
  }, [workspace.workItems,workspace.teamMembers,project.id]);
  const self = workspace.teamMembers.find(m => m.projectId===project.id && m.id === workspace.projectSettings.find(s => s.projectId === project.id)?.localMemberId);
  const items = config.preset === "my" && !self ? [] : selectWork(all, config.preset === "my" && self ? {...config, owner:self.name} : config, new Date(), self?.id);
  const page=Math.min(paging.key===pageKey?paging.index:0,Math.max(0,Math.ceil(items.length/100)-1));
  const visible=items.slice(page*100,(page+1)*100);
  const selectionContext=pageKey+":"+page;
  const selectedIds=selection.context===selectionContext?selection.ids:[];
  const selectIds=(ids:string[])=>setSelection({context:selectionContext,ids});
  const selected=visible.filter(row=>selectedIds.includes(row.id));
  const toggleSelected=(id:string)=>selectIds(selectedIds.includes(id)?selectedIds.filter(value=>value!==id):[...selectedIds,id]);
  const archiveSelection=()=>{const ids=selected.map(row=>row.id);onChange(setWorkArchived(workspace,ids,true));setUndo(ids);selectIds([]);};
  const filteredWorkIds=new Set(items.map(item=>item.id));
  const owners = [...new Set(all.map(x => x.owner).filter(Boolean))].sort();
  const configure = (patch: Partial<WorkViewConfig>) => {
    selectIds([]);
    onChange({...workspace, workViewPreferences: [...workspace.workViewPreferences.filter(x => x.projectId !== project.id), {projectId: project.id, config: {...config, ...patch}}]});
    if (props.layout && patch.type) props.onView(patch.type === "board" ? "board" : "work");
  };
  const resetFilters = () => { configure({ query: "", preset: "all", status: "all", owner: "" }); searchRef.current?.focus(); };
  const filters: { key: string; label: string; clear: Partial<WorkViewConfig> }[] = [];
  if (config.preset !== "all") filters.push({ key: "preset", label: presets[config.preset][lang], clear: { preset: "all" } });
  if (config.query) filters.push({ key: "query", label: `${ru ? "Поиск" : "Search"}: ${config.query}`, clear: { query: "" } });
  if (config.status !== "all") filters.push({ key: "status", label: `${ru ? "Статус" : "Status"}: ${displayLabel(locale, "workStatus", config.status)}`, clear: { status: "all" } });
  if (config.owner && config.preset !== "my") filters.push({ key: "owner", label: `${ru ? "Владелец" : "Owner"}: ${config.owner}`, clear: { owner: "" } });
  const update = (id: string, patch: Partial<WorkItem>) => onChange(updateWork(workspace,id,patch));
  const groups = new Map<string, WorkItem[]>();
  for (const item of visible) {
    const key = config.group === "none" ? "" : item[config.group];
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  return <>
    {config.preset === "my" && !self && <p className="notice" role="status">{ru ? "Выберите «Это я в этом проекте» в настройках проекта, чтобы увидеть свою работу." : "Choose ‘This is me in this project’ in project settings to see your work."}</p>}
    <div className="view-presets" aria-label={ru ? "Быстрые представления" : "Quick views"}>
      {Object.entries(presets).map(([id, label]) => <button key={id} className={config.preset === id ? "active" : ""} aria-pressed={config.preset === id} onClick={() => configure({preset: id as WorkViewConfig["preset"], ...(id === "my" ? { owner: "" } : {})})}>{label[lang]}</button>)}
    </div>
    <div className="toolbar work-toolbar">
      <div className="search-input"><Search size={17} aria-hidden="true"/><input ref={searchRef} aria-label={ru ? "Поиск работы" : "Search work"} className="input" value={config.query} onChange={e => configure({query:e.target.value})} placeholder={ru ? "Название, ID, владелец, метка…" : "Title, ID, owner, label…"}/>{config.query && <button type="button" className="work-search-clear" aria-label={ru ? "Очистить поиск" : "Clear search"} onClick={() => { configure({query:""}); searchRef.current?.focus(); }}><X size={16} aria-hidden="true"/></button>}</div>
      <div className="work-view-toggle" role="group" aria-label={ru ? "Представление работы" : "Work view"}>
        <button type="button" className={`button ${!calendarOpen && config.type === "list" ? "active" : ""}`} aria-pressed={!calendarOpen && config.type === "list"} onClick={() => {setCalendarOpen(false);configure({type:"list"});}}>{ru ? "Список" : "List"}</button>
        <button type="button" className={`button ${!calendarOpen && config.type === "board" ? "active" : ""}`} aria-pressed={!calendarOpen && config.type === "board"} onClick={() => {setCalendarOpen(false);configure({type:"board"});}}>{ru ? "Доска" : "Board"}</button>
        <button type="button" className={`button small ${calendarOpen ? "primary" : ""}`} aria-pressed={calendarOpen} onClick={()=>setCalendarOpen(value=>!value)}>{calendarOpen ? (ru ? "К списку / доске" : "Back to list / board") : (ru ? "Календарь" : "Calendar")}</button>
      </div>

      {(all.length > 0 || calendarOpen) && <button className="button primary" aria-label={ru ? "Добавить рабочий элемент" : "Add work item"} onClick={() => onCreate("work")}><Plus size={17}/><span className="work-create-label">{ru ? "Добавить работу" : "Add work item"}</span></button>}
    </div>
    <QuickWorkCreate workspace={workspace} projectId={project.id} locale={locale} onChange={onChange} onEdit={id=>onEdit("work",id)}/>
    <div className="view-options-row">      <details className="work-filter-disclosure"><summary><SlidersHorizontal size={16}/>{ru ? "Фильтры" : "Filters"}</summary><div className="work-filter-panel">
        <label className="view-control">{ru ? "Статус" : "Status"}<select aria-label={ru ? "Статус" : "Status"} className="input" value={config.status} onChange={e => configure({status:e.target.value as WorkViewConfig["status"]})}><option value="all">{ru ? "Все статусы" : "All statuses"}</option>{statuses.map(s => <option key={s} value={s}>{displayLabel(locale,"workStatus",s)}</option>)}</select></label>
        <label className="view-control">{ru ? "Владелец" : "Owner"}<select aria-label={ru ? "Владелец" : "Owner"} className="input" disabled={config.preset === "my"} value={config.preset === "my" ? "" : config.owner} onChange={e => configure({owner:e.target.value})}><option value="">{config.preset === "my" ? (ru ? "Я в этом проекте" : "Me in this project") : (ru ? "Все владельцы" : "All owners")}</option>{owners.map(s => <option key={s}>{s}</option>)}</select></label>
      </div></details>
      <span className="muted" role="status">{ru ? `Показано ${items.length} из ${all.length}` : `Showing ${items.length} of ${all.length} items`}</span>
      <details className="view-display"><summary><SlidersHorizontal size={16}/>{ru ? "Вид и сортировка" : "Display and sorting"}</summary><div className="view-config"><button type="button" className="button small mobile-selection-toggle" aria-pressed={selectionMode} onClick={()=>{setSelectionMode(value=>!value);selectIds([]);}}>{ru?"Выбрать работу":"Select work"}</button>
        <label className="view-control">{ru ? "Сортировка" : "Sort"}<select aria-label={ru ? "Сортировка" : "Sort"} className="input" value={config.sort} onChange={e => configure({sort:e.target.value as WorkViewConfig["sort"]})}>{[["priority","Приоритет","Priority"],["due","Срок","Due date"],["updated","Последнее изменение","Recently updated"],["title","Название","Title"]].map(([id,r,e]) => <option key={id} value={id}>{ru?r:e}</option>)}</select></label>
        <label className="view-control">{ru ? "Группировка списка" : "List grouping"}<select aria-label={ru ? "Группировка списка" : "List grouping"} className="input" value={config.group} onChange={e => configure({group:e.target.value as WorkViewConfig["group"]})}>{[["none","Без группировки","None"],["status","Статус","Status"],["owner","Владелец","Owner"],["priority","Приоритет","Priority"]].map(([id,r,e]) => <option key={id} value={id}>{ru?r:e}</option>)}</select></label>
        <fieldset className="property-options"><legend>{ru ? "Колонки списка" : "List properties"}</legend>{Object.entries(properties).map(([id,label]) => <label key={id}><input type="checkbox" checked={config.properties.includes(id as WorkViewConfig["properties"][number])} onChange={e => configure({properties: e.target.checked ? [...config.properties,id as WorkViewConfig["properties"][number]] : config.properties.filter(x => x !== id)})}/>{label[lang]}</label>)}</fieldset>
      </div></details>
      <details className="view-display"><summary><Bookmark size={16}/>{ru ? "Сохранённые виды" : "Saved views"}{saved.length > 0 && ` · ${saved.length}`}</summary><div className="saved-view-menu">
        {saved.map(v => <div className="section-line" key={v.id}><button className="button small" onClick={() => configure(v.config)}>{v.name}</button><button className="button small" aria-label={`${ru ? "Удалить представление" : "Delete view"} ${v.name}`} onClick={() => setPendingDelete(v.id)}>{ru ? "Удалить" : "Delete"}</button></div>)}
        <form onSubmit={e => {e.preventDefault();if(!name.trim())return;onChange({...workspace,savedWorkViews:[...workspace.savedWorkViews,{id:crypto.randomUUID(),projectId:project.id,name:name.trim(),config}]});setName("");}}><label className="view-control">{ru ? "Название представления" : "View name"}<input className="input" required maxLength={80} value={name} onChange={e => setName(e.target.value)}/></label><button className="button primary" type="submit">{ru ? "Сохранить вид" : "Save view"}</button></form>
      </div></details>
    </div>
    {filters.length > 0 && <div className="work-active-filters" role="group" aria-label={ru ? "Активные фильтры" : "Active filters"}>
      {filters.map(filter => <button type="button" className="work-filter-chip" key={filter.key} aria-label={`${ru ? "Убрать фильтр" : "Remove filter"}: ${filter.label}`} onClick={() => { configure(filter.clear); searchRef.current?.focus(); }}><span>{filter.label}</span><X size={14} aria-hidden="true"/></button>)}
      <button type="button" className="button small" onClick={resetFilters}><RotateCcw size={14} aria-hidden="true"/>{ru ? "Сбросить фильтры" : "Reset filters"}</button>
    </div>}
    {undo.length > 0 && <div className="notice" role="status">{ru ? "Работа в архиве." : "Work archived."} <button className="button small" onClick={() => {onChange(setWorkArchived(workspace,undo,false));setUndo([]);}}>{ru ? "Отменить архивацию" : "Undo archive"}</button></div>}
    {!calendarOpen && config.type === "list" && selected.length > 0 && <div className="work-selection-bar" role="group" aria-label={ru?"Действия с выбранной работой":"Selected work actions"}><span role="status">{ru?`Выбрано: ${selected.length}`:`Selected: ${selected.length}`}</span><button className="button small" onClick={archiveSelection}>{ru?"В архив":"Archive"}</button><button className="button small" onClick={()=>selectIds([])}>{ru?"Снять выделение":"Clear selection"}</button></div>}
    {pendingDelete && <ConfirmationDialog locale={locale} title={ru ? "Удалить представление?" : "Delete saved view?"} message={ru ? "Будет удалено только представление. Рабочие элементы сохранятся." : "Only the saved view will be deleted. Work items will be preserved."} confirmLabel={ru ? "Удалить" : "Delete"} onCancel={() => setPendingDelete(null)} onConfirm={() => {onChange({...workspace,savedWorkViews:workspace.savedWorkViews.filter(x => x.id !== pendingDelete)});setPendingDelete(null);}}/>}
    {!calendarOpen && config.type === "list" && <CollectionPager page={page} size={100} total={items.length} locale={locale} label={ru?"Страницы работы":"Work pages"} onPage={index=>{selectIds([]);setPaging({key:pageKey,index});}}/>}
    {calendarOpen ? <ProjectCalendar workspace={workspace} projectId={project.id} locale={locale} workItemIds={filteredWorkIds} onEdit={onEdit}/> : !items.length ? <div className="empty-state atlas-empty-state"><EmptyStateGraphic kind={all.length ? "no-filter" : "no-work"} locale={locale}/><div className="atlas-empty-copy"><h3>{all.length ? (ru ? "Нет подходящей работы" : "No matching work") : (ru ? "Добавьте первую работу" : "Add your first work item")}</h3><p>{all.length ? (ru ? "Уберите часть фильтров или измените поисковый запрос. Сохранённые элементы остаются в проекте." : "Remove a filter or change your search. Your saved items are still in this project.") : (ru ? "Начните с конкретного следующего шага. Названия достаточно; владельца и срок можно добавить позже." : "Start with a concrete next step. A title is enough; add an owner and due date later.")}</p>{all.length ? <button className="button" onClick={resetFilters}>{ru ? "Показать всё" : "Show all"}</button> : <button className="button primary" aria-label={ru ? "Добавить рабочий элемент" : "Add work item"} onClick={() => onCreate("work")}><Plus size={17} aria-hidden="true"/>{ru ? "Добавить работу" : "Add work item"}</button>}</div></div>
      : config.type === "board" ? <BoardView {...props} visibleItems={items}/>
      : <><div className="mobile-work-list">{visible.map(x => <article className="mobile-work-item" key={x.id}>{selectionMode&&<label className="work-select-mobile"><input type="checkbox" aria-label={`${ru?"Выбрать":"Select"} ${x.title}`} checked={selectedIds.includes(x.id)} onChange={()=>toggleSelected(x.id)}/><span>{ru?"Выбрать":"Select"}</span></label>}<button className="mobile-work-card" aria-label={`${ru ? "Открыть детали" : "Open details"}: ${x.title}`} onClick={() => onEdit("work",x.id)}><small>{x.id} · {displayLabel(locale,"priority",x.priority)}</small><strong>{x.title}</strong><span className="work-card-state">{displayLabel(locale,"workStatus",x.status)}{x.blocked && !x.done && <span className="status bad">{ru ? "Блокер" : "Blocked"}</span>}</span><span>{x.owner || (ru ? "Без владельца" : "Unassigned")}</span><WorkDeadline item={x} locale={locale}/></button><div className="mobile-work-card-actions"><label><span>{ru ? "Статус" : "Status"}</span><select className="input" aria-label={`${ru ? "Статус" : "Status"} ${x.title}`} value={x.status} onChange={e => update(x.id,{status:e.target.value as WorkItem["status"]})}>{statuses.map(s => <option key={s} value={s}>{displayLabel(locale,"workStatus",s)}</option>)}</select></label><button className="button small" onClick={() => update(x.id,{status:x.done?"ready":"done"})}>{x.done?<RotateCw size={15}/>:<Check size={15}/>}<span>{x.done?(ru?"Вернуть в работу":"Reopen"):(ru?"Завершить":"Complete")}</span></button></div></article>)}</div><div className="table-wrap work-table"><table><thead><tr><th className="work-select-cell"><input type="checkbox" aria-label={ru?"Выбрать текущую страницу":"Select current page"} checked={visible.length>0&&selected.length===visible.length} onChange={e=>selectIds(e.target.checked?visible.map(row=>row.id):[])}/></th><th>{ru ? "Работа" : "Work"}</th>{config.properties.map(p => <th key={p}>{properties[p][lang]}</th>)}<th>{ru ? "Статус" : "Status"}</th><th>{ru ? "Действия" : "Actions"}</th></tr></thead>{[...groups].map(([group, rows]) => <tbody key={group}>{config.group !== "none" && <tr className="group-row"><th colSpan={config.properties.length+4}>{config.group === "owner" ? group || (ru ? "Без владельца" : "Unassigned") : displayLabel(locale,config.group === "status" ? "workStatus" : "priority",group)} <span className="pill">{rows.length}</span></th></tr>}{rows.map(x => <tr key={x.id}><td className="work-select-cell"><input type="checkbox" aria-label={`${ru?"Выбрать":"Select"} ${x.title}`} checked={selectedIds.includes(x.id)} onChange={()=>toggleSelected(x.id)}/></td><td className="work-title-cell"><small className="muted">{x.id}</small><button className="work-title-button" onClick={() => onEdit("work",x.id)}>{x.title}</button>{x.blocked && <span className="status bad">{ru ? "Блокер" : "Blocked"}</span>}{x.dueDate && x.dueDate < localDay() && !x.done && <span className="status warn">{ru ? "Просрочено" : "Overdue"}</span>}</td>{config.properties.map(p => <td key={p}>{p === "owner" ? <input className="cell-input" aria-label={`${ru ? "Владелец" : "Owner"} ${x.title}`} value={x.owner} onChange={e => update(x.id,{owner:e.target.value})}/> : p === "due" ? <input type="date" className="cell-input" aria-label={`${ru ? "Срок" : "Due date"} ${x.title}`} value={x.dueDate??""} onChange={e=>update(x.id,{dueDate:e.target.value})}/> : p === "priority" ? <select className="cell-input" aria-label={`${ru ? "Приоритет" : "Priority"} ${x.title}`} value={x.priority} onChange={e=>update(x.id,{priority:e.target.value as WorkItem["priority"]})}>{["critical","high","medium","low"].map(priority=><option key={priority} value={priority}>{displayLabel(locale,"priority",priority)}</option>)}</select> : p === "effort" ? x.estimate ?? "—" : workspace.milestones.find(m => m.id === x.milestoneId)?.title || "—"}</td>)}<td><select className="input" aria-label={`${ru ? "Статус" : "Status"} ${x.title}`} value={x.status} onChange={e => update(x.id,{status:e.target.value as WorkItem["status"]})}>{statuses.map(s => <option key={s} value={s}>{displayLabel(locale,"workStatus",s)}</option>)}</select></td><td><details><summary aria-label={`${ru ? "Действия" : "Actions"}: ${x.title}`}>…</summary><button className="button small" onClick={() => {update(x.id,{archived:true});setUndo([x.id]);}}>{ru ? "В архив" : "Archive"}</button></details></td></tr>)}</tbody>)}</table></div></>}
    <details className="panel"><summary>{ru?"Результаты и выгоды":"Outcomes and benefits"}</summary><OutcomeCenter {...props}/></details>
  </>;
}
