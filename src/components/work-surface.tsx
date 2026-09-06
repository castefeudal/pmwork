"use client";
import { updateWork } from "@/domain/workspace-commands";
import { formatDate } from "@/domain/format-date";
import { useState } from "react";
import { Plus, Search, SlidersHorizontal, Bookmark, RotateCcw } from "lucide-react";
import { workViewConfigSchema, type WorkViewConfig, type WorkItem } from "@/domain/schemas";
import { localDay, selectWork } from "@/domain/work-views";
import { displayLabel } from "@/content/workspace-i18n";
import { BoardView, type ViewProps } from "./workspace-views";
const statuses = ["backlog", "ready", "in-progress", "review", "done"] as const;
const presets = { all: ["Вся работа", "All work"], my: ["Моя работа", "My work"], attention: ["Внимание", "Attention"], soon: ["Ближайшие 7 дней", "Due soon"], overdue: ["Просрочено", "Overdue"], blocked: ["Блокеры", "Blocked"], priority: ["Высокий приоритет", "High priority"], unassigned: ["Без владельца", "Unassigned"], recent: ["Обновлено за неделю", "Recently updated"] } as const;
const properties = { owner: ["Владелец", "Owner"], due: ["Срок", "Due"], priority: ["Приоритет", "Priority"], effort: ["Трудоёмкость", "Effort"], milestone: ["Контрольная точка", "Milestone"] } as const;
export function WorkSurface(props: ViewProps) {
  const {workspace, project, locale, onChange, onCreate, onEdit} = props;
  const ru = locale === "ru", lang = ru ? 0 : 1;
  const [name, setName] = useState(""), [undo, setUndo] = useState<string | null>(null);
  const config = workspace.workViewPreferences.find(x => x.projectId === project.id)?.config ?? workViewConfigSchema.parse({});
  const saved = workspace.savedWorkViews.filter(x => x.projectId === project.id);
  const all = workspace.workItems.filter(x => x.projectId === project.id && !x.archived).map(item => {
    const member=workspace.teamMembers.find(m=>m.id===item.ownerId&&m.projectId===project.id);
    return member?{...item,owner:member.name}:item;
  });
  const self = workspace.teamMembers.find(m => m.projectId===project.id && m.id === workspace.projectSettings.find(s => s.projectId === project.id)?.localMemberId);
  const items = config.preset === "my" && !self ? [] : selectWork(all, config.preset === "my" && self ? {...config, owner:self.name} : config, new Date(), self?.id);
  const owners = [...new Set(all.map(x => x.owner).filter(Boolean))].sort();
  const configure = (patch: Partial<WorkViewConfig>) => onChange({...workspace, workViewPreferences: [...workspace.workViewPreferences.filter(x => x.projectId !== project.id), {projectId: project.id, config: {...config, ...patch}}]});
  const update = (id: string, patch: Partial<WorkItem>) => onChange(updateWork(workspace,id,patch));
  const groups = new Map<string, WorkItem[]>();
  for (const item of items) {
    const key = config.group === "none" ? "" : item[config.group];
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return <>
    {config.preset === "my" && !self && <p className="notice" role="status">{ru ? "Выберите «Это я в этом проекте» в настройках проекта, чтобы увидеть свою работу." : "Choose ‘This is me in this project’ in project settings to see your work."}</p>}
    <div className="view-presets" aria-label={ru ? "Быстрые представления" : "Quick views"}>
      {Object.entries(presets).map(([id, label]) => <button key={id} className={config.preset === id ? "active" : ""} aria-pressed={config.preset === id} onClick={() => configure({preset: id as WorkViewConfig["preset"]})}>{label[lang]}</button>)}
    </div>
    <div className="toolbar work-toolbar">
      <label className="search-input"><Search size={17}/><span className="sr-only">{ru ? "Поиск работы" : "Search work"}</span><input className="input" value={config.query} onChange={e => configure({query:e.target.value})} placeholder={ru ? "Название, ID, владелец, метка…" : "Title, ID, owner, label…"}/></label>
      <label className="view-control">{ru ? "Статус" : "Status"}<select aria-label={ru ? "Статус" : "Status"} className="input" value={config.status} onChange={e => configure({status:e.target.value as WorkViewConfig["status"]})}><option value="all">{ru ? "Все статусы" : "All statuses"}</option>{statuses.map(s => <option key={s} value={s}>{displayLabel(locale,"workStatus",s)}</option>)}</select></label>
      <label className="view-control">{ru ? "Владелец" : "Owner"}<select aria-label={ru ? "Владелец" : "Owner"} className="input" value={config.owner} onChange={e => configure({owner:e.target.value})}><option value="">{ru ? "Все владельцы" : "All owners"}</option>{owners.map(s => <option key={s}>{s}</option>)}</select></label>
      <button className="button" aria-label={ru ? "Добавить работу" : "Add work item"} onClick={() => onCreate("work")}><Plus size={17}/>{ru ? "Добавить работу" : "Add work item"}</button>
    </div>
    {config.preset === "my" && !config.owner && <p className="notice">{ru ? "Выберите себя в поле «Владелец»: пространство локальное, учётной записи здесь нет." : "Choose yourself in Owner: this local workspace has no signed-in identity."}</p>}
    <div className="view-options-row">
      <span className="muted" role="status">{items.length} / {all.length} {ru ? "элементов" : "items"}</span>
      <details className="view-display"><summary><SlidersHorizontal size={16}/>{ru ? "Вид и сортировка" : "Display and sorting"}</summary><div className="view-config">
        <label className="view-control">{ru ? "Представление" : "Layout"}<select aria-label={ru ? "Представление" : "Layout"} className="input" value={config.type} onChange={e => configure({type:e.target.value as WorkViewConfig["type"]})}><option value="list">{ru ? "Список" : "List"}</option><option value="board">{ru ? "Доска" : "Board"}</option></select></label>
        <label className="view-control">{ru ? "Сортировка" : "Sort"}<select aria-label={ru ? "Сортировка" : "Sort"} className="input" value={config.sort} onChange={e => configure({sort:e.target.value as WorkViewConfig["sort"]})}>{[["priority","Приоритет","Priority"],["due","Срок","Due date"],["updated","Последнее изменение","Recently updated"],["title","Название","Title"]].map(([id,r,e]) => <option key={id} value={id}>{ru?r:e}</option>)}</select></label>
        <label className="view-control">{ru ? "Группировка списка" : "List grouping"}<select aria-label={ru ? "Группировка списка" : "List grouping"} className="input" value={config.group} onChange={e => configure({group:e.target.value as WorkViewConfig["group"]})}>{[["none","Без группировки","None"],["status","Статус","Status"],["owner","Владелец","Owner"],["priority","Приоритет","Priority"]].map(([id,r,e]) => <option key={id} value={id}>{ru?r:e}</option>)}</select></label>
        <fieldset className="property-options"><legend>{ru ? "Колонки списка" : "List properties"}</legend>{Object.entries(properties).map(([id,label]) => <label key={id}><input type="checkbox" checked={config.properties.includes(id as WorkViewConfig["properties"][number])} onChange={e => configure({properties: e.target.checked ? [...config.properties,id as WorkViewConfig["properties"][number]] : config.properties.filter(x => x !== id)})}/>{label[lang]}</label>)}</fieldset>
      </div></details>
      <details className="view-display"><summary><Bookmark size={16}/>{ru ? "Сохранённые виды" : "Saved views"}{saved.length > 0 && ` · ${saved.length}`}</summary><div className="saved-view-menu">
        {saved.map(v => <div className="section-line" key={v.id}><button className="button small" onClick={() => configure(v.config)}>{v.name}</button><button className="button small" aria-label={`${ru ? "Удалить представление" : "Delete view"} ${v.name}`} onClick={() => {if(window.confirm(ru ? "Удалить только представление? Рабочие элементы сохранятся." : "Delete only this view? Work items will be preserved.")) onChange({...workspace,savedWorkViews:workspace.savedWorkViews.filter(x => x.id !== v.id)});}}>{ru ? "Удалить" : "Delete"}</button></div>)}
        <form onSubmit={e => {e.preventDefault();if(!name.trim())return;onChange({...workspace,savedWorkViews:[...workspace.savedWorkViews,{id:crypto.randomUUID(),projectId:project.id,name:name.trim(),config}]});setName("");}}><label className="view-control">{ru ? "Название представления" : "View name"}<input className="input" required maxLength={80} value={name} onChange={e => setName(e.target.value)}/></label><button className="button primary" type="submit">{ru ? "Сохранить вид" : "Save view"}</button></form>
      </div></details>
      <button className="button small" onClick={() => configure(workViewConfigSchema.parse({}))}><RotateCcw size={14}/>{ru ? "Сбросить фильтры" : "Reset filters"}</button>
    </div>
    {undo && <div className="notice" role="status">{ru ? "Работа в архиве." : "Work archived."} <button className="button small" onClick={() => {update(undo,{archived:false});setUndo(null);}}>{ru ? "Отменить архивацию" : "Undo archive"}</button></div>}
    {!items.length ? <div className="empty-state"><Search/><h3>{ru ? "Нет подходящей работы" : "No matching work"}</h3><p>{ru ? "Здесь появятся элементы выбранного представления. Измените фильтры или добавьте работу." : "Items matching this view appear here. Adjust filters or add work."}</p><button className="button" onClick={() => configure(workViewConfigSchema.parse({}))}>{ru ? "Показать всё" : "Show all"}</button></div>
      : config.type === "board" ? <BoardView {...props} visibleItems={items}/>
      : <><div className="mobile-work-list">{items.map(x => <button className="mobile-work-card" key={x.id} onClick={() => onEdit("work",x.id)}><small>{x.id} · {displayLabel(locale,"priority",x.priority)}</small><strong>{x.title}</strong><span>{displayLabel(locale,"workStatus",x.status)}{x.blocked ? (ru ? " · Блокер" : " · Blocked") : ""}</span><span>{x.owner || (ru ? "Без владельца" : "Unassigned")} · {formatDate(x.dueDate,locale)}</span></button>)}</div><div className="table-wrap work-table"><table><thead><tr><th>{ru ? "Работа" : "Work"}</th>{config.properties.map(p => <th key={p}>{properties[p][lang]}</th>)}<th>{ru ? "Статус" : "Status"}</th><th>{ru ? "Действия" : "Actions"}</th></tr></thead>{[...groups].map(([group, rows]) => <tbody key={group}>{config.group !== "none" && <tr className="group-row"><th colSpan={config.properties.length+3}>{config.group === "owner" ? group || (ru ? "Без владельца" : "Unassigned") : displayLabel(locale,config.group === "status" ? "workStatus" : "priority",group)} <span className="pill">{rows.length}</span></th></tr>}{rows.map(x => <tr key={x.id}><td className="work-title-cell"><small className="muted">{x.id}</small><button className="work-title-button" onClick={() => onEdit("work",x.id)}>{x.title}</button>{x.blocked && <span className="status bad">{ru ? "Блокер" : "Blocked"}</span>}{x.dueDate && x.dueDate < localDay() && !x.done && <span className="status warn">{ru ? "Просрочено" : "Overdue"}</span>}</td>{config.properties.map(p => <td key={p}>{p === "owner" ? <input className="cell-input" aria-label={`${ru ? "Владелец" : "Owner"} ${x.title}`} value={x.owner} onChange={e => update(x.id,{owner:e.target.value})}/> : p === "due" ? formatDate(x.dueDate,locale) : p === "priority" ? displayLabel(locale,"priority",x.priority) : p === "effort" ? x.estimate ?? "—" : workspace.milestones.find(m => m.id === x.milestoneId)?.title || "—"}</td>)}<td><select className="input" aria-label={`${ru ? "Статус" : "Status"} ${x.title}`} value={x.status} onChange={e => update(x.id,{status:e.target.value as WorkItem["status"]})}>{statuses.map(s => <option key={s} value={s}>{displayLabel(locale,"workStatus",s)}</option>)}</select></td><td><details><summary aria-label={`${ru ? "Действия" : "Actions"}: ${x.title}`}>…</summary><button className="button small" onClick={() => {update(x.id,{archived:true});setUndo(x.id);}}>{ru ? "В архив" : "Archive"}</button></details></td></tr>)}</tbody>)}</table></div></>}
  </>;
}
