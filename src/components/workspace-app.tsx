"use client";
import {undoStarterBundle} from "@/domain/starter-bundle";
import Link from "next/link";
import {ContextFields} from "./context-fields";
import {defaultContext} from "@/content/project-context";
import { TodayView } from "./today-view";
import { readWorkspaceUrl, workspaceUrl } from "@/domain/workspace-url";
import { WorkspaceMore } from "./workspace-more";
import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardCheck,
  Download,
  FileText,
  Home,
  LayoutDashboard,
  ListChecks,
  Plus,
  Search,
  Settings,
  ShieldAlert,
  Upload,
  Users,
  WalletCards,
  WandSparkles,
} from "lucide-react";
import type { Locale, Workspace } from "@/domain/schemas";
import { workspaceSchema } from "@/domain/schemas";
import { demoWorkspace, emptyWorkspace, localizeBundledDemo } from "@/data/demo";
import { displayLabel, enumLabels } from "@/content/workspace-i18n";
import {
  exportWorkspace,
  importWorkspace,
  listSnapshots,
  loadWorkspace,
  restoreSnapshot,
  saveWorkspace,
} from "@/data/storage";
import { knowledgeGuides } from "@/content/knowledge";
import { Brand } from "./brand";
import { ThemeToggle } from "./theme-toggle";
import { WorkspaceDialog } from "./workspace-dialog";
import { RecordEditor, type EditableKind } from "./record-editor";
import type { CreateType, WorkspaceView } from "./workspace-types";
import {
  BoardView,
  CommandPalette,
  ControlView,
  DocumentsView,
  FinanceView,
  GuideView,
  PeopleView,
  PlanningView,
  PortfolioView,
  RaidView,
  WorkView,
  type ViewProps,
} from "./workspace-views";

const navIcons = {
  portfolio: BriefcaseBusiness,
  overview: LayoutDashboard,
  guide: WandSparkles,
  work: ListChecks,
  board: ListChecks,
  planning: CalendarDays,
  raid: ShieldAlert,
  people: Users,
  finance: WalletCards,
  control: ClipboardCheck,
  documents: FileText,
  setup: Settings,
};
const navLabels = {
  ru: {
    portfolio: "Портфель",
    overview: "Сейчас",
    guide: "Проведи меня",
    work: "Работа",
    board: "Доска",
    planning: "План",
    raid: "Риски и решения",
    people: "Люди",
    finance: "Финансы",
    control: "Контроль",
    documents: "Документы",
    setup: "Настройки",
  },
  en: {
    portfolio: "Portfolio",
    overview: "Today",
    guide: "Guide me",
    work: "Work",
    board: "Board",
    planning: "Plan",
    raid: "Risks & decisions",
    people: "People",
    finance: "Finance",
    control: "Control",
    documents: "Documents",
    setup: "Settings",
  },
};

const addGroups: {id:string; types:CreateType[]}[] = [
  {id:"work",types:["work","iteration"]},
  {id:"plan",types:["objective","milestone","dependency"]},
  {id:"raid",types:["risk","issue","assumption","decision"]},
  {id:"people",types:["team","stakeholder","communication","meeting","vendor"]},
  {id:"control",types:["budget","change","quality"]},
  {id:"document",types:["document"]},
];
const createLabels={
 ru:{work:"Работа",iteration:"Итерация",objective:"Цель",milestone:"Контрольная точка",dependency:"Зависимость",risk:"Риск",issue:"Проблема",assumption:"Допущение",decision:"Решение",team:"Участник команды",stakeholder:"Заинтересованная сторона",communication:"Коммуникация",meeting:"Встреча",vendor:"Поставщик",budget:"Статья бюджета",change:"Запрос на изменение",quality:"Контроль качества",document:"Документ",project:"Проект"},
 en:{work:"Work item",iteration:"Iteration",objective:"Objective",milestone:"Milestone",dependency:"Dependency",risk:"Risk",issue:"Issue",assumption:"Assumption",decision:"Decision",team:"Team member",stakeholder:"Stakeholder",communication:"Communication",meeting:"Meeting",vendor:"Vendor",budget:"Budget line",change:"Change request",quality:"Quality gate",document:"Document",project:"Project"},
} as const;

export function WorkspaceApp({ locale }: { locale: Locale }) {
  const ru = locale === "ru",
    [workspace, setWorkspace] = useState<Workspace>(() => demoWorkspace(locale)),
    [projectId, setProjectId] = useState("atlas"),
    [view, setView] = useState<WorkspaceView>("overview"),
    [ready, setReady] = useState(false),
    [recovery, setRecovery] = useState(false),
    [firstRun, setFirstRun] = useState(true),
    [dialog, setDialog] = useState<CreateType | null>(null),
    [editor, setEditor] = useState<{ kind: EditableKind; id: string } | null>(null),
    [palette, setPalette] = useState(false),
    [more, setMore] = useState(false),
    [addMenu, setAddMenu] = useState(false),
    [creationUndo,setCreationUndo] = useState<{before:Workspace;after:Workspace}|null>(null),
    [toast, setToast] = useState(""),
    [lastSaved, setLastSaved] = useState(""),
    [snapshots, setSnapshots] = useState<{key:string;at:string}[]>([]),
    fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadWorkspace()
      .then((value) => {
        if (value) {
          const normalized = localizeBundledDemo(value, locale);
          setWorkspace(normalized);
          setFirstRun(false);
          setView("overview");
          let remembered: string | null = null;
          try { remembered = sessionStorage.getItem("pmwork-project"); } catch {}
          setProjectId(normalized.projects.some((p) => p.id === remembered) ? remembered! : (normalized.projects[0]?.id ?? ""));
          const context = readWorkspaceUrl(window.location.search, value);
          setProjectId(context.project); setView(context.view);
          const itemId=new URLSearchParams(window.location.search).get('item');
          if(itemId){
            const collections:[EditableKind,Array<{id:string;projectId?:string}>][]=[['document',value.documents],['work',value.workItems],['risk',value.risks],['issue',value.issues],['decision',value.decisions],['team',value.teamMembers],['milestone',value.milestones],['change',value.changes]];
            const found=collections.find(([,rows])=>rows.some(row=>row.id===itemId&&row.projectId===context.project));
            if(found)setEditor({kind:found[0],id:itemId});
          }
        }
        setReady(true);
        listSnapshots().then(setSnapshots).catch(() => undefined);
      })
      .catch(() => {
        setRecovery(true); setFirstRun(false); setReady(true);
        listSnapshots().then(setSnapshots).catch(() => undefined);
        setToast(ru ? "Локальные данные повреждены — открыт безопасный пример" : "Local data was invalid — safe demo opened");
      });
  }, [locale, ru]);
  useEffect(() => {
    if (!ready || recovery || firstRun) return;
    const id = setTimeout(() => saveWorkspace(workspace).then(() => setLastSaved(new Date().toLocaleTimeString(locale))).catch(() => setToast(ru ? "Не удалось сохранить" : "Could not save")),350);
    return () => clearTimeout(id);
  }, [workspace, ready, ru, locale, recovery, firstRun]);
  useEffect(() => {
    if (!ready || recovery || firstRun) return;
    const flush = () => { void saveWorkspace(workspace).catch(() => undefined); };
    const hidden = () => { if (document.visibilityState === "hidden") flush(); };
    addEventListener("pagehide", flush); document.addEventListener("visibilitychange", hidden);
    return () => { removeEventListener("pagehide", flush); document.removeEventListener("visibilitychange", hidden); };
  }, [workspace, ready, recovery, firstRun]);
  useEffect(() => { if (ready && view === "setup") listSnapshots().then(setSnapshots).catch(() => undefined); }, [ready, view]);
  useEffect(() => { if (!toast) return; const id=setTimeout(()=>setToast(""),2200); return()=>clearTimeout(id); }, [toast]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setPalette(true); }
      if (event.key === "Escape") { setDialog(null); setEditor(null); setPalette(false); setAddMenu(false); }
    };
    addEventListener("keydown", onKey); return () => removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    if (!ready || firstRun) return;
    const restore = () => { const context = readWorkspaceUrl(window.location.search, workspace); setProjectId(context.project); setView(context.view); };
    addEventListener("popstate", restore); return () => removeEventListener("popstate", restore);
  }, [ready, firstRun, workspace]);
  useEffect(() => {
    if (!ready || firstRun || !projectId) return;
    const next = workspaceUrl(window.location.href, projectId, view);
    if (next.href !== window.location.href) history.pushState(null, "", next);
  }, [ready, firstRun, projectId, view]);

  // Loading and first run are separate screens. Reusing the centered brand
  // moves it upward when the taller first-run content arrives from local storage.
  if (!ready) return <main key="loading" className="language-gate" aria-busy="true"><p role="status">{ru ? "Загрузка рабочего пространства…" : "Loading local workspace…"}</p></main>;

  if (firstRun) return (
    <main key="first-run" className="language-gate first-run-gate">
      <Brand />
      <p className="eyebrow">{ru?"PMWORK · ПЕРВЫЙ ЗАПУСК":"PMWORK · FIRST RUN"}</p>
      <h1>{ru ? "Начните с реального проекта" : "Start with a real project"}</h1>
      <p className="lead">{ru ? "За несколько минут PMWORK соберёт рабочий контур: результат, ближайшую работу, контрольную точку и ключевые риски." : "In a few minutes PMWORK will create a usable project frame: outcome, next work, milestone and key risks."}</p>
      <div className="first-run-actions">
        <button className="button primary" onClick={() => { setWorkspace(emptyWorkspace(locale)); setDialog("project"); }}><span>{ru ? "Начать свой проект" : "Start my project"}</span><small>{ru?"Рекомендуется · около 2–3 минут":"Recommended · about 2–3 minutes"}</small></button>
        <button className="button" onClick={() => { setWorkspace(demoWorkspace(locale)); setProjectId("atlas"); setFirstRun(false); }}><span>{ru ? "Посмотреть готовый пример" : "Explore a completed example"}</span><small>{ru?"Понять PMWORK примерно за минуту":"Understand PMWORK in about a minute"}</small></button>
        <button className="button ghost" onClick={() => fileRef.current?.click()}>{ru ? "Восстановить резервную копию" : "Restore backup"}</button>
      </div>
      <p className="muted compact">{ru?"Данные остаются на этом устройстве. Резервную копию можно скачать в любой момент.":"Data stays on this device. You can download a backup at any time."}</p>
      <input hidden ref={fileRef} type="file" accept="application/json" onChange={async e => {const file=e.target.files?.[0];if(!file)return;try{const restored=await importWorkspace(file);setWorkspace({...restored,locale});setProjectId(restored.projects[0]?.id??"");setView("overview");setFirstRun(false);}catch{setToast(ru?"Файл не прошёл проверку":"File did not pass validation");}}}/>
      {toast&&<p role="alert">{toast}</p>}
      {dialog&&<WorkspaceDialog type="project" locale={locale} workspace={workspace} projectId="" onClose={()=>setDialog(null)} onCommit={(next,id)=>{const parsed=workspaceSchema.parse(next);setCreationUndo({before:workspace,after:parsed});setWorkspace(parsed);setProjectId(id??"");setView("overview");setFirstRun(false);}}/>}
    </main>
  );

  const project = workspace.projects.find((p) => p.id === projectId) ?? workspace.projects[0];
  if (!project) return <main className="language-gate"><Brand/><h1>{ru ? "Создайте первый проект" : "Create your first project"}</h1><button className="button primary" onClick={() => setDialog("project")}>{ru ? "Создать проект" : "Create project"}</button>{dialog&&<WorkspaceDialog type="project" locale={locale} workspace={workspace} projectId="" onClose={()=>setDialog(null)} onCommit={(next,id)=>{setWorkspace(workspaceSchema.parse(next));if(id)setProjectId(id);}}/>}</main>;

  const commit = (next: Workspace) => setWorkspace(workspaceSchema.parse(next));
  const selectProject = (id: string) => { setProjectId(id); try { sessionStorage.setItem("pmwork-project", id); } catch {} };
  const common: ViewProps = {workspace,project,locale,onView:setView,onCreate:setDialog,onEdit:(kind,id)=>setEditor({kind,id}),onChange:commit,onProject:selectProject};
  const render = () => {
    switch (view) {
      case "portfolio": return <PortfolioView {...common}/>;
      case "overview": return <TodayView {...common}/>;
      case "guide": return <GuideView {...common}/>;
      case "work": return <WorkView {...common}/>;
      case "board": return <BoardView {...common}/>;
      case "planning": return <PlanningView {...common}/>;
      case "raid": return <RaidView {...common}/>;
      case "people": return <PeopleView {...common}/>;
      case "finance": return <FinanceView {...common}/>;
      case "control": return <ControlView {...common}/>;
      case "documents": return <DocumentsView {...common}/>;
      case "setup": return <SetupView {...common} snapshots={snapshots} onExport={()=>exportWorkspace(workspace)} onImport={()=>fileRef.current?.click()} onRestore={async(key)=>{const snapshot=snapshots.find(item=>item.key===key);if(!window.confirm(ru?`Восстановить снимок от ${snapshot?new Date(snapshot.at).toLocaleString(locale):"выбранной даты"}? Текущее состояние будет заменено. Сначала рекомендуется скачать резервную копию.`:`Restore the snapshot from ${snapshot?new Date(snapshot.at).toLocaleString(locale):"the selected date"}? Current state will be replaced. Download a backup first.`))return;try{const restored=await restoreSnapshot(key);if(!recovery)await saveWorkspace(workspace,true);commit({...restored,locale});setRecovery(false);selectProject(restored.projects[0]?.id??"");setToast(ru?"Снимок данных восстановлен":"Snapshot restored");}catch{setToast(ru?"Не удалось восстановить снимок данных":"Could not restore snapshot");}}}/>;
    }
  };
  const onImport = async (file?: File) => {if(!file)return;try{const imported=await importWorkspace(file);if(!window.confirm(ru?"Импорт заменит текущее рабочее пространство. Продолжить?":"Import will replace the current workspace. Continue?"))return;if(!recovery)await saveWorkspace(workspace,true);commit({...imported,locale});setRecovery(false);selectProject(imported.projects[0]?.id??"");setToast(ru?"Резервная копия восстановлена":"Backup restored");}catch{setToast(ru?"Файл не прошёл проверку":"File did not pass validation");}};
  const navGroups:[string,WorkspaceView[]][] = workspace.experience==="foundation" ? [
    [ru?"ДЕЙСТВОВАТЬ":"ACT",["overview","work","planning"]],
    [ru?"УПРАВЛЯТЬ":"MANAGE",["raid","control","finance"]],
    [ru?"КОМАНДА И ЗНАНИЯ":"TEAM & KNOWLEDGE",["people","documents","guide"]],
    [ru?"СИСТЕМА":"SYSTEM",["portfolio","setup"]],
  ] : [
    [ru?"ДЕЙСТВОВАТЬ":"ACT",workspace.experience==="advanced"?["overview","work","planning"]:["overview","guide","work","planning"]],
    [ru?"УПРАВЛЯТЬ":"MANAGE",["raid","control","finance"]],
    [ru?"КОМАНДА И ЗНАНИЯ":"TEAM & KNOWLEDGE",["people","documents"]],
    [ru?"СИСТЕМА":"SYSTEM",["portfolio","setup"]],
  ];

  return (
    <div className={`workspace-shell density-${workspace.density} experience-${workspace.experience}`}>
      <aside className="sidebar">
        <Link href={`/${locale}`} aria-label={ru ? "PMWORK — главная" : "PMWORK home"}><Brand/></Link>
        <select className="project-switch" value={project.id} onChange={(e)=>selectProject(e.target.value)} aria-label={ru?"Выбрать проект":"Select project"}>{workspace.projects.map(p=><option value={p.id} key={p.id}>{p.demo?(ru?"ПРИМЕР · ":"DEMO · "):""}{p.name}</option>)}</select>
        <nav className="side-nav" aria-label={ru?"Разделы рабочего пространства":"Workspace sections"}>{navGroups.map(([label,ids])=><div className="nav-group" key={label}><small>{label}</small>{ids.map(id=>{const Icon=navIcons[id];return <button key={id} aria-label={navLabels[locale][id]} className={view===id||(id==="work"&&view==="board")?"active":""} onClick={()=>setView(id)} aria-current={view===id||(id==="work"&&view==="board")?"page":undefined}><Icon size={19}/><span>{navLabels[locale][id]}</span></button>})}</div>)}</nav>
        <div className="side-foot"><Link className="button small" href={`/${locale}/knowledge`}><BookOpen size={16}/><span>{ru?"База знаний":"Knowledge"}</span></Link><button className="button small" onClick={()=>setDialog("project")}><Plus size={16}/><span>{ru?"Проект":"Project"}</span></button></div>
      </aside>

      <nav className="mobile-workspace-nav" aria-label={ru?"Рабочее пространство":"Workspace"}>{(["overview","work","planning","control"] as WorkspaceView[]).map(id=><button key={id} aria-current={view===id||(id==="work"&&view==="board")?"page":undefined} onClick={()=>setView(id)}>{id==="overview"?(ru?"Сейчас":"Today"):navLabels[locale][id]}</button>)}<button onClick={()=>setMore(true)} aria-haspopup="dialog">{ru?"Ещё":"More"}</button></nav>
      {more&&<WorkspaceMore title={ru?"Ещё":"More"} onClose={()=>setMore(false)}>{(["raid","people","finance","documents","guide","portfolio","setup"] as WorkspaceView[]).map(id=><button className="button" key={id} onClick={()=>{setView(id);setMore(false)}}>{navLabels[locale][id]}</button>)}<Link className="button" href={`/${locale}/knowledge`}>{ru?"База знаний":"Knowledge"}</Link><div className="button-row">          <button className="button small" onClick={async()=>{if(!recovery)await saveWorkspace(workspace);const next=workspaceUrl(window.location.href,project.id,view);next.pathname=next.pathname.replace(`/${locale}/workspace`,`/${ru?"en":"ru"}/workspace`);window.location.assign(next.href)}}>{ru?"EN":"RU"}</button>
          <ThemeToggle locale={locale}/>
</div></WorkspaceMore>}
      {addMenu&&<WorkspaceMore title={ru?"Добавить":"Add"} onClose={()=>setAddMenu(false)}><div className="global-add-grid">{addGroups.map(group=><section key={group.id}><h3>{ru?({work:"Работа",plan:"Планирование",raid:"Риски и решения",people:"Люди",control:"Контроль",document:"Документы"} as Record<string,string>)[group.id]:({work:"Work",plan:"Planning",raid:"Risks & decisions",people:"People",control:"Control",document:"Documents"} as Record<string,string>)[group.id]}</h3><div className="button-row">{group.types.map(type=><button className="button" key={type} onClick={()=>{setAddMenu(false);setDialog(type)}}>{createLabels[locale][type as keyof typeof createLabels[typeof locale]]}</button>)}</div></section>)}</div></WorkspaceMore>}

      <main className="workspace-main">
        <header className="workspace-top">
          <Link className="button small workspace-home-mobile" href={`/${locale}/`} aria-label={ru?"PMWORK — главная":"PMWORK home"}><Home size={18} aria-hidden="true"/></Link>
          <select className="input mobile-project-switch" value={project.id} onChange={(e)=>selectProject(e.target.value)} aria-label={ru?"Выбрать проект":"Select project"}>{workspace.projects.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select>
          <h1>{project.name}</h1><span className="status info"><span className="sr-only">{ru?"Статус проекта: ":"Project status: "}</span>{displayLabel(locale,"projectStatus",project.status)}</span><div className="spacer"/>
          <small className="muted desktop-only" title={lastSaved}>{recovery?(ru?"Сохранение приостановлено":"Autosave paused"):lastSaved?(ru?"Сохранено локально":"Saved locally"):(ru?"Локально":"Local")}</small>
          <button className="button small command-trigger" aria-label={ru?"Открыть поиск":"Open search"} onClick={()=>setPalette(true)}><Search size={16}/><span>{ru?"Поиск":"Search"}</span><kbd>Ctrl K</kbd></button>
          <div className="desktop-only button-row">          <button className="button small" onClick={async()=>{if(!recovery)await saveWorkspace(workspace);const next=workspaceUrl(window.location.href,project.id,view);next.pathname=next.pathname.replace(`/${locale}/workspace`,`/${ru?"en":"ru"}/workspace`);window.location.assign(next.href)}}>{ru?"EN":"RU"}</button>
          <ThemeToggle locale={locale}/>
</div>
          <button className="button small workspace-home-mobile" aria-label={ru?"Параметры пространства":"Workspace options"} onClick={()=>setMore(true)}>…</button>
          <button className="button small primary" aria-label={ru?"Добавить":"Add"} aria-haspopup="dialog" onClick={()=>setAddMenu(true)}><Plus size={17}/><span className="desktop-only">{ru?"Добавить":"Add"}</span></button>
          <button className="button small desktop-only" onClick={()=>exportWorkspace(workspace)}><Download size={17}/>{ru?"Экспорт":"Export"}</button>
          <button className="button small desktop-only" onClick={()=>fileRef.current?.click()}><Upload size={17}/>{ru?"Импорт":"Import"}</button>
          <input hidden ref={fileRef} type="file" accept="application/json" onChange={(e)=>onImport(e.target.files?.[0])}/>
        </header>
        <div className="workspace-content">
          {creationUndo&&<div className="notice" role="status"><span>{ru?"Проект создан. Проверьте даты, владельцев и оценки стартовых записей.":"Project created. Review dates, owners and estimates in the starter records."}</span><button className="button small" onClick={async()=>{try{const previous=undoStarterBundle(workspace,creationUndo.before,creationUndo.after);await saveWorkspace(previous);setWorkspace(previous);setFirstRun(!previous.projects.length);setProjectId(previous.projects[0]?.id??'');setCreationUndo(null);}catch{setToast(ru?"После создания были изменения. Отмена остановлена, чтобы сохранить правки.":"The workspace changed after creation. Undo stopped to preserve edits.");}}}>{ru?"Отменить создание проекта":"Undo project creation"}</button><button className="button small" onClick={()=>setCreationUndo(null)}>{ru?"Готово":"Done"}</button></div>}
          {recovery&&<section className="recovery-banner" role="alert"><strong>{ru?"Автосохранение приостановлено":"Autosave paused"}</strong><p>{ru?"Исходные данные сохранены без изменений. Сейчас открыт пример. Импортируйте проверенную копию или восстановите снимок в настройках.":"Original data is untouched. A demo is open. Import a valid backup or restore a snapshot in Settings."}</p><button className="button" onClick={()=>fileRef.current?.click()}>{ru?"Импортировать копию":"Import backup"}</button><button className="button" onClick={()=>setView("setup")}>{ru?"Снимки данных":"Recovery snapshots"}</button></section>}
          {view!=="portfolio"&&<div className="page-title page-context"><div><p className="eyebrow">{project.demo?(ru?"ПРИМЕР · ":"DEMO · "):""}{displayLabel(locale,"approach",project.approach)} · {displayLabel(locale,"governance",project.governance)}</p><h2>{view==="board"?navLabels[locale].work:navLabels[locale][view]}</h2><p className="muted">{project.objective}</p></div>{(view==="work"||view==="board")&&<div className="button-row work-mode-switch"><button className={`button small ${view==="work"?"primary":""}`} aria-pressed={view==="work"} onClick={()=>setView("work")}>{ru?"Список":"List"}</button><button className={`button small ${view==="board"?"primary":""}`} aria-pressed={view==="board"} onClick={()=>setView("board")}>{ru?"Доска":"Board"}</button></div>}</div>}
          {workspace.experience==="foundation"&&(()=>{const domain=({overview:"Value",guide:"Fundamentals",work:"Requirements",board:"Flow",planning:"Schedule",raid:"Risk",people:"Stakeholders",finance:"Cost",control:"Governance",documents:"Communication",portfolio:"Portfolio basics",setup:"Fundamentals"} as Record<string,string>)[view];const help=knowledgeGuides[domain]??knowledgeGuides.Fundamentals;return <details className="panel foundation-help"><summary>{ru?"Что сделать сейчас":"What to do now"}</summary><h3>{ru?"Зачем это нужно":"Why this matters"}</h3><p>{help.summary[locale]}</p><h3>{ru?"Действие":"Action"}</h3><p>{help.steps[locale]}</p><h3>{ru?"Что получится":"Expected output"}</h3><p>{help.output[locale]}</p><h3>{ru?"Типичная ошибка":"Common mistake"}</h3><p>{help.mistake[locale]}</p><Link className="button small" href={`/${locale}/glossary/`}>{ru?"Объяснения терминов":"Term explanations"}</Link></details>})()}
          {render()}
        </div>
      </main>
      {dialog&&<WorkspaceDialog type={dialog} locale={locale} workspace={workspace} projectId={project.id} onClose={()=>setDialog(null)} onCommit={(next,id)=>{if(dialog==="project")setCreationUndo({before:workspace,after:workspaceSchema.parse(next)});commit(next);if(id)selectProject(id)}}/>}
      {editor&&<RecordEditor kind={editor.kind} id={editor.id} locale={locale} workspace={workspace} projectId={project.id} onClose={()=>setEditor(null)} onChange={commit}/>} 
      {palette&&<CommandPalette workspace={workspace} project={project} locale={locale} onClose={()=>setPalette(false)} onView={setView} onCreate={setDialog} onProject={selectProject} onEdit={(kind,id)=>setEditor({kind,id})}/>} 
      {toast&&<div className="toast" role="status">{toast}</div>}
    </div>
  );
}

function SetupView({workspace,project,locale,onChange,snapshots,onExport,onImport,onRestore}:{workspace:Workspace;project:Workspace["projects"][number];locale:Locale;onChange:(workspace:Workspace)=>void;snapshots:{key:string;at:string}[];onExport:()=>void;onImport:()=>void;onRestore:(key:string)=>void;}) {
  const ru=locale==="ru",settings=workspace.projectSettings.find(x=>x.projectId===project.id),updateLimit=(column:string,value:number)=>onChange({...workspace,projectSettings:settings?workspace.projectSettings.map(x=>x.projectId===project.id?{...x,wipLimits:{...x.wipLimits,[column]:Math.max(1,value)}}:x):[...workspace.projectSettings,{projectId:project.id,enabledTypes:["initiative","epic","feature","story","task","subtask","bug","spike","deliverable"],wipLimits:{[column]:Math.max(1,value)},governance:project.governance,probabilityScale:5,impactScale:5}]});
  return <div className="dashboard-grid">
    <details className="panel span-12"><summary>{ru?"Контекст проекта и рекомендации":"Project context and recommendations"}</summary><p>{ru?"Ответы меняют рекомендации на экране «Сейчас». Сохранённый подход проекта изменяется отдельно в карточке проекта.":"Answers change Today recommendations. Change the recorded project approach separately in the project editor."}</p><ContextFields locale={locale} value={settings?.context??defaultContext} onChange={context=>onChange({...workspace,projectSettings:[...workspace.projectSettings.filter(x=>x.projectId!==project.id),{projectId:project.id,enabledTypes:["task"],wipLimits:{},governance:project.governance,probabilityScale:5,impactScale:5,...settings,context}]})}/></details>
    <section className="panel span-6"><h3>{ru?"Это я в этом проекте":"This is me in this project"}</h3><select className="input" aria-label={ru?"Это я в этом проекте":"This is me in this project"} value={workspace.projectSettings.find(s=>s.projectId===project.id)?.localMemberId??""} onChange={e=>{const existing=workspace.projectSettings.find(s=>s.projectId===project.id);onChange({...workspace,projectSettings:[...workspace.projectSettings.filter(s=>s.projectId!==project.id),{projectId:project.id,enabledTypes:["task"],wipLimits:{},governance:project.governance,probabilityScale:5,impactScale:5,...existing,localMemberId:e.target.value||undefined}]})}}><option value="">{ru?"Не выбрано":"Not selected"}</option>{workspace.teamMembers.filter(m=>m.projectId===project.id).map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select><p className="muted">{ru?"Локальная настройка для представления «Моя работа».":"A local preference for the My work view."}</p></section>
    <section className="panel span-6"><h3>{ru?"Уровень подсказок":"Guidance level"}</h3><p className="muted">{workspace.experience==="foundation"?(ru?"Пошаговые объяснения и упрощённая первичная навигация.":"Step-by-step explanations and simplified primary navigation."):workspace.experience==="advanced"?(ru?"Контрольные данные и действия без лишнего учебного слоя.":"Control data and actions with minimal teaching layer."):(ru?"Сбалансированные подсказки для регулярной проектной работы.":"Balanced guidance for regular project delivery.")}</p><select className="input" aria-label={ru?"Уровень подсказок":"Guidance level"} value={workspace.experience} onChange={e=>onChange({...workspace,experience:e.target.value as Workspace["experience"]})}>{Object.entries(enumLabels[locale].experience).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></section>
    <section className="panel span-6"><h3>{ru?"Плотность интерфейса":"Interface density"}</h3><p className="muted">{ru?"Независима от уровня подсказок.":"Independent from guidance level."}</p><select className="input" aria-label={ru?"Плотность интерфейса":"Interface density"} value={workspace.density} onChange={e=>onChange({...workspace,density:e.target.value as Workspace["density"]})}><option value="comfortable">{ru?"Комфортная":"Comfortable"}</option><option value="compact">{ru?"Компактная":"Compact"}</option></select></section>
    <section className="panel span-6"><h3>{ru?"Локальные данные":"Local data"}</h3><p className="muted">{ru?"Данные сохраняются на этом устройстве. Перед очисткой браузера скачайте резервную копию.":"Data is stored on this device. Download a backup before clearing the browser."}</p><div className="button-row"><button className="button" onClick={onExport}><Download size={16}/>{ru?"Скачать резервную копию":"Download backup"}</button><button className="button" onClick={onImport}><Upload size={16}/>{ru?"Восстановить":"Restore"}</button></div></section>
    <section className="panel span-6"><h3>{ru?"Лимиты незавершённой работы (WIP)":"WIP limits"}</h3><div className="form-grid"><label className="field"><span>{ru?"В работе":"In progress"}</span><input type="number" min="1" value={settings?.wipLimits["in-progress"]??3} onChange={e=>updateLimit("in-progress",Number(e.target.value))}/></label><label className="field"><span>{ru?"На проверке":"Review"}</span><input type="number" min="1" value={settings?.wipLimits.review??2} onChange={e=>updateLimit("review",Number(e.target.value))}/></label></div><p className="muted">{ru?"Лимит должен отражать доступную мощность системы, а не желаемое количество задач.":"A limit should reflect system capacity, not desired task count."}</p></section>
    <section className="panel span-6"><h3>{ru?"Автоматические снимки данных":"Automatic snapshots"}</h3>{snapshots.length?<ul className="clean-list">{snapshots.map(s=><li key={s.key}><div className="section-line"><time>{new Date(s.at).toLocaleString(locale)}</time><button className="button small" onClick={()=>onRestore(s.key)}>{ru?"Восстановить":"Restore"}</button></div></li>)}</ul>:<p className="muted">{ru?"Первый снимок создаётся после сохранения.":"The first snapshot is created after saving."}</p>}</section>
  </div>;
}
