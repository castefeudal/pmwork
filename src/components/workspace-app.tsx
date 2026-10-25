"use client";
import "../../app/deferred-operational.css";
import "../../app/workspace.css";
import "../../app/management.css";
import "../../app/excellence-workspace.css";
import Link from "next/link";
import dynamic from "next/dynamic";
import { readWorkspaceUrl, workspaceUrl, readWorkspaceRecord, workspaceRecordUrl } from "@/domain/workspace-url";
import { WorkspaceMore } from "./workspace-more";
import { RecoveryConfirmDialog } from "./recovery-confirm-dialog";
import { Suspense, useEffect, useRef, useState } from "react";
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
} from "lucide-react";
import type { Locale, Workspace } from "@/domain/schemas";
import { workspaceSchema } from "@/domain/schemas";
import { roleMobileViews, roleQuestions, type ManagementRole } from "@/domain/management-role";
import { assertWorkspaceGraph } from "@/domain/workspace-integrity";
import { demoWorkspace, emptyWorkspace } from "@/data/demo";
import { displayLabel } from "@/content/workspace-i18n";
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
import { WorkspaceBoot } from "./workspace-boot";
import { WorkspaceWelcome, type WorkspaceIntent } from "./workspace-welcome";
import { ThemeToggle } from "./theme-toggle";
import type { EditableKind } from "./record-editor";
import {useUrlValue} from "./use-url-state";
import {registerForCreate} from "./workspace-types";
import {contextProject} from "@/domain/work-scope";
import type { CreateType, WorkspaceView } from "./workspace-types";
import type { ViewProps } from "./workspace-views";
const TodayView = dynamic(()=>import("./today-view").then(module=>module.TodayView));
const WorkspaceSettingsView = dynamic(()=>import("./workspace-settings-view").then(module=>module.WorkspaceSettingsView));
const DocumentCenter = dynamic(()=>import("./document-center").then(module=>module.DocumentCenter));
const CommandPalette = dynamic(()=>import("./command-menu").then(module=>module.CommandMenu));
const ControlView = dynamic(()=>import("./workspace-views").then(module=>module.ControlView));
const FinanceView = dynamic(()=>import("./workspace-views").then(module=>module.FinanceView));
const GuideView = dynamic(()=>import("./workspace-views").then(module=>module.GuideView));
const PeopleView = dynamic(()=>import("./workspace-views").then(module=>module.PeopleView));
const PlanningView = dynamic(()=>import("./workspace-views").then(module=>module.PlanningView));
const PortfolioView = dynamic(()=>import("./workspace-views").then(module=>module.PortfolioView));
const RaidView = dynamic(()=>import("./workspace-views").then(module=>module.RaidView));
const WorkView = dynamic(()=>import("./workspace-views").then(module=>module.WorkView));


const navIcons = {
  program: BriefcaseBusiness,
  delivery: ListChecks,
  operations: ClipboardCheck,
  portfolio: BriefcaseBusiness,
  overview: LayoutDashboard,
  guide: BookOpen,
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
    program: "Программы",
    delivery: "Поставка",
    operations: "Операции",
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
    program: "Programs",
    delivery: "Delivery",
    operations: "Operations",
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

type PendingRecovery =
  | { kind: "import"; candidate: Workspace; replacing: boolean }
  | { kind: "snapshot"; key: string; label: string };

const ContextWorkspaceShell=dynamic(()=>import("./context-workspace-shell").then(module=>module.ContextWorkspaceShell));
const ManagementCenter = dynamic(()=>import("./management-center").then(module=>module.ManagementCenter),{loading:()=> <p role="status">…</p>});
const DeliveryCenter = dynamic(()=>import("./delivery-center").then(module=>module.DeliveryCenter),{loading:()=> <p role="status">…</p>});
const WorkspaceDialog = dynamic(()=>import("./workspace-dialog").then(module=>module.WorkspaceDialog),{loading:()=> <p role="status">…</p>});
const RecordEditor = dynamic(()=>import("./record-editor").then(module=>module.RecordEditor),{loading:()=> <p role="status">…</p>});

export function WorkspaceApp({ locale, initialIntent }: { locale: Locale; initialIntent?:WorkspaceIntent }) {
  const [contextId]=useUrlValue("context");
  const [contextRegister]=useUrlValue("register");
  const ru = locale === "ru",
    [workspace, setWorkspace] = useState<Workspace>(() => demoWorkspace(locale)),
    [projectId, setProjectId] = useState("atlas"),
    [view, setView] = useState<WorkspaceView>("overview"),
    [ready, setReady] = useState(false),
    [recovery, setRecovery] = useState(false),
    [firstRun, setFirstRun] = useState(true),
    [firstRole, setFirstRole] = useState<ManagementRole>(initialIntent?.role??"project"),
    [firstPriority, setFirstPriority] = useState(initialIntent?.priority??"attention"),
    [dialog, setDialog] = useState<CreateType | null>(null),
    [editor, setEditor] = useState<{ kind: EditableKind; id: string } | null>(null),
    [palette, setPalette] = useState(false),
    [more, setMore] = useState(false),
    [sidebarCollapsed,setSidebarCollapsed]=useState(false),
    [addMenu, setAddMenu] = useState(false),
    [toast, setToast] = useState(""),
    [lastSaved, setLastSaved] = useState(""),
    [snapshots, setSnapshots] = useState<{key:string;at:string}[]>([]),
    [pendingRecovery,setPendingRecovery]=useState<PendingRecovery|null>(null),
    fileRef = useRef<HTMLInputElement>(null);
  const intentConsumed=useRef(false);

  useEffect(() => {
    loadWorkspace()
      .then((value) => {
        if (value) {
          const normalized = value;
          setWorkspace(normalized);
          setFirstRun(false);
          setView("overview");
          let remembered: string | null = null;
          try { remembered = sessionStorage.getItem("pmwork-project"); } catch {}
          setProjectId(normalized.projects.some((p) => p.id === remembered) ? remembered! : (normalized.projects[0]?.id ?? ""));
          const context = readWorkspaceUrl(window.location.search, value);
          setProjectId(context.project); setView(context.view);
          setEditor(readWorkspaceRecord(window.location.search, value, context.project));
        } else if (initialIntent && !intentConsumed.current) {
          intentConsumed.current = true;
          const { role, priority, kind, file } = initialIntent;
          if (kind === "restore") {
            if (file) void importWorkspace(file)
              .then(candidate => setPendingRecovery({ kind: "import", candidate, replacing: false }))
              .catch(() => setToast(ru ? "Файл не прошёл проверку" : "File did not pass validation"));
          } else {
            setWorkspace({ ...(kind === "demo" ? demoWorkspace(locale) : emptyWorkspace(locale)), managementRole: role });
            if (kind === "demo") {
              setProjectId("atlas");
              setView(priority === "learn" ? "guide" : priority === "deadline" ? "planning" : priority === "organize" ? "work" : "overview");
              setFirstRun(false);
            } else if (role === "operations" || role === "program") {
              setFirstRun(false);
              setView(role);
            } else setDialog("project");
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
  }, [locale, ru, initialIntent]);
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
      if (event.key === "Escape") { setDialog(null); setEditor(null); history.replaceState(null, "", workspaceRecordUrl(window.location.href,null)); dispatchEvent(new Event("pmwork-url")); setPalette(false); setAddMenu(false); }
    };
    addEventListener("keydown", onKey); return () => removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    if (!ready || firstRun) return;
    const restore = () => { const context = readWorkspaceUrl(window.location.search, workspace); setProjectId(context.project); setView(context.view); setEditor(readWorkspaceRecord(window.location.search,workspace,context.project)); };
    addEventListener("popstate", restore); return () => removeEventListener("popstate", restore);
  }, [ready, firstRun, workspace]);
  useEffect(() => {
    if (!ready || firstRun || !projectId) return;
    const next = workspaceUrl(window.location.href, projectId, view);
    if (next.href !== window.location.href) history.pushState(null, "", next);
  }, [ready, firstRun, projectId, view]);

  const stageImport=async(file?:File,replacing=!firstRun)=>{if(!file)return;try{const candidate=await importWorkspace(file);setPendingRecovery({kind:"import",candidate,replacing});}catch{setToast(ru?"Файл не прошёл проверку":"File did not pass validation");}finally{if(fileRef.current)fileRef.current.value='';}};
  const confirmRecovery=async()=>{
    const pending=pendingRecovery;if(!pending)return;
    try{
      if(pending.kind==="import"){
        if(pending.replacing&&!recovery)await saveWorkspace(workspace,true);
        const next=assertWorkspaceGraph(workspaceSchema.parse({...pending.candidate,locale}));
        setWorkspace(next);setProjectId(next.projects[0]?.id??"");setView(firstPriority==="learn"?"guide":firstPriority==="deadline"?"planning":firstPriority==="organize"?"work":"overview");setFirstRun(false);setRecovery(false);setToast(ru?"Резервная копия восстановлена":"Backup restored");
      }else{
        const restored=await restoreSnapshot(pending.key);
        if(!recovery)await saveWorkspace(workspace,true);
        const next=assertWorkspaceGraph(workspaceSchema.parse({...restored,locale}));
        setWorkspace(next);setProjectId(next.projects[0]?.id??"");setRecovery(false);setToast(ru?"Снимок данных восстановлен":"Snapshot restored");
      }
      setPendingRecovery(null);
    }catch{setToast(ru?"Не удалось восстановить данные. Исходные данные не удалены.":"Could not restore data. Original data was not deleted.");}
  };
  const recoveryDialog=pendingRecovery&&<RecoveryConfirmDialog locale={locale} candidate={pendingRecovery.kind==="import"?pendingRecovery.candidate:undefined} snapshotLabel={pendingRecovery.kind==="snapshot"?pendingRecovery.label:undefined} replacing={pendingRecovery.kind==="snapshot"||pendingRecovery.replacing} canExportCurrent={(pendingRecovery.kind==="snapshot"||pendingRecovery.replacing)&&!recovery&&!firstRun} onExportCurrent={()=>exportWorkspace(workspace)} onCancel={()=>setPendingRecovery(null)} onConfirm={()=>void confirmRecovery()}/>;

  if (!ready) return <WorkspaceBoot locale={locale}/>;

  if (firstRun) return <WorkspaceWelcome locale={locale} role={firstRole} onRole={setFirstRole} priority={firstPriority} onPriority={setFirstPriority} notice={toast}
    onCreate={()=>{setWorkspace({...emptyWorkspace(locale),managementRole:firstRole});if(firstRole==="operations"||firstRole==="program"){setFirstRun(false);setView(firstRole);}else setDialog("project");}}
    onDemo={()=>{setWorkspace({...demoWorkspace(locale),managementRole:firstRole});setProjectId("atlas");setView(firstPriority==="learn"?"guide":firstPriority==="deadline"?"planning":firstPriority==="organize"?"work":"overview");setFirstRun(false);}}
    onImport={file=>void stageImport(file,false)}>
      {dialog&&<WorkspaceDialog type="project" locale={locale} workspace={workspace} projectId="" onClose={()=>setDialog(null)} onCommit={(next,id)=>{setWorkspace(assertWorkspaceGraph(workspaceSchema.parse(next)));setProjectId(id??"");setView(firstPriority==="learn"?"guide":firstPriority==="deadline"?"planning":firstPriority==="organize"?"work":"overview");setFirstRun(false);}}/>}
    {recoveryDialog}
  </WorkspaceWelcome>;

  const project = workspace.projects.find((p) => p.id === projectId) ?? workspace.projects[0];
  if (!project) return <ContextWorkspaceShell workspace={workspace} locale={locale} onChange={next=>setWorkspace(assertWorkspaceGraph(workspaceSchema.parse(next)))} onExport={()=>exportWorkspace(workspace)} onRestore={()=>fileRef.current?.click()} onCreateProject={()=>setDialog("project")} palette={palette} onClosePalette={()=>setPalette(false)}><input hidden ref={fileRef} type="file" accept="application/json" onChange={event=>void stageImport(event.target.files?.[0],true)}/>{dialog&&<WorkspaceDialog type="project" locale={locale} workspace={workspace} projectId="" onClose={()=>setDialog(null)} onCommit={(next,id)=>{setWorkspace(assertWorkspaceGraph(workspaceSchema.parse(next)));if(id)setProjectId(id);}}/>}{recoveryDialog}</ContextWorkspaceShell>;

  const commit = (next: Workspace) => { try { setWorkspace(assertWorkspaceGraph(workspaceSchema.parse(next))); } catch { setToast(ru ? "Изменение не применено: нарушена целостность связанных данных" : "Change was not applied because related data would become inconsistent"); } };
  const selectProject = (id: string) => { const url=new URL(window.location.href);for(const key of ["context","register","item","kind","create","evidence"])url.searchParams.delete(key);history.replaceState(null,"",url);dispatchEvent(new Event("pmwork-url"));if(view==="program"||view==="operations")setView("overview");setProjectId(id); try { sessionStorage.setItem("pmwork-project", id); } catch {} };
  const openRecord = (kind: EditableKind, id: string) => {
    const record={kind,id};
    const next=workspaceRecordUrl(window.location.href,record);
    if(next.href!==window.location.href)history.pushState(null,"",next);
    setEditor(record);
  };
  const closeRecord = () => {
    history.replaceState(null,"",workspaceRecordUrl(window.location.href,null));
    setEditor(null);
  };
  const managementRecord=view==="program"?(workspace.programs.find(row=>row.id===contextId)??workspace.programs[0]):view==="operations"?(workspace.operations.find(row=>row.id===contextId)??workspace.operations[0]):undefined;
  const activeNavigation=managementRecord&&contextRegister?contextRegister:view;
  const navigateView=(destination:WorkspaceView)=>{
    const context=managementRecord??workspace.programs.find(row=>row.id===contextId)??workspace.operations.find(row=>row.id===contextId);
    if(context&&["work","board","planning","raid","people","finance","control","documents"].includes(destination)) {
      const url=new URL(window.location.href);url.searchParams.set("view","outcome" in context?"program":"operations");url.searchParams.set("context",context.id);url.searchParams.set("register",destination);for(const key of ["item","kind","create","evidence"])url.searchParams.delete(key);history.pushState(null,"",url);setView("outcome" in context?"program":"operations");dispatchEvent(new Event("pmwork-url"));return;
    }
    if(destination==="program"||destination==="operations"){
      const url=new URL(window.location.href);for(const key of ["register","item","kind","create","evidence"])url.searchParams.delete(key);history.replaceState(null,"",url);dispatchEvent(new Event("pmwork-url"));
    }
    const rememberedLayout = workspace.workViewPreferences.find(preference => preference.projectId === project.id)?.config.type;
    setView(destination === "work" && rememberedLayout === "board" ? "board" : destination);
  };
  const createRecord=(type:CreateType)=>{
    if(type!=="project"&&(view==="program"||view==="operations")) {
      if(!managementRecord){setToast(ru?"Сначала создайте или выберите рабочий контекст.":"Create or select a working context first.");return;}
      const url=new URL(window.location.href);url.searchParams.set("context",managementRecord.id);url.searchParams.set("create",type);for(const key of ["item","kind","evidence"])url.searchParams.delete(key);url.hash="";url.searchParams.set("register",registerForCreate(type));history.pushState(null,"",url);dispatchEvent(new Event("pmwork-url"));return;
    }
    if(editor)closeRecord();
    setDialog(type);
  };
  const common: ViewProps = {workspace,project,locale,onView:setView,onCreate:createRecord,onEdit:openRecord,onChange:commit,onProject:selectProject};
  const render = () => {
    switch (view) {
      case "program": return <ManagementCenter workspace={workspace} locale={locale} onChange={commit} kind="program"/>;
      case "operations": return <ManagementCenter workspace={workspace} locale={locale} onChange={commit} kind="operations"/>;
      case "delivery": return <DeliveryCenter {...common}/>;
      case "portfolio": return <PortfolioView {...common}/>;
      case "overview": return <TodayView {...common}/>;
      case "guide": return <GuideView {...common}/>;
      case "work": return <WorkView {...common} layout="list"/>;
      case "board": return <WorkView {...common} layout="board"/>;
      case "planning": return <PlanningView {...common}/>;
      case "raid": return <RaidView {...common}/>;
      case "people": return <PeopleView {...common}/>;
      case "finance": return <FinanceView {...common}/>;
      case "control": return <ControlView {...common}/>;
      case "documents": return <DocumentCenter {...common}/>;
      case "setup": return <WorkspaceSettingsView {...common} snapshots={snapshots} onExport={()=>exportWorkspace(workspace)} onImport={()=>fileRef.current?.click()} onRestore={(key)=>{const snapshot=snapshots.find(item=>item.key===key);setPendingRecovery({kind:"snapshot",key,label:snapshot?new Date(snapshot.at).toLocaleString(locale):(ru?"выбранная дата":"selected date")});}}/>;
    }
  };
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

  const lenses=[workspace.managementRole,...workspace.roleLenses];
  const lensViews=lenses.filter(role=>role!=="project") as WorkspaceView[];
  navGroups[0][1]=["overview",...lensViews,...navGroups[0][1].filter(id=>id!=="overview")];
  return (
    <div className={`workspace-shell density-${workspace.density} experience-${workspace.experience} ${sidebarCollapsed?"sidebar-collapsed":""}`}>
      <aside className="sidebar">
        <button className="button small sidebar-toggle" aria-label={ru?"Свернуть / развернуть меню":"Collapse / expand sidebar"} aria-expanded={!sidebarCollapsed} onClick={()=>setSidebarCollapsed(!sidebarCollapsed)}>{sidebarCollapsed?"→":"←"}</button>
        <Link href={`/${locale}`} aria-label={ru ? "PMWORK — главная" : "PMWORK home"}><Brand/></Link>
        <select className="project-switch" value={project.id} onChange={(e)=>selectProject(e.target.value)} aria-label={ru?"Выбрать проект":"Select project"} title={project.demo?(ru?`Пример: ${project.name}`:`Demo: ${project.name}`):project.name}>{workspace.projects.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select>
        <nav className="side-nav" aria-label={ru?"Разделы рабочего пространства":"Workspace sections"}>{navGroups.map(([label,ids])=><div className="nav-group" key={label}><small>{label}</small>{ids.map(id=>{const Icon=navIcons[id];return <button key={id} aria-label={navLabels[locale][id]} className={activeNavigation===id||(id==="work"&&activeNavigation==="board")?"active":""} onClick={()=>navigateView(id)} aria-current={activeNavigation===id||(id==="work"&&activeNavigation==="board")?"page":undefined}><Icon size={19}/><span>{navLabels[locale][id]}</span></button>})}</div>)}</nav>
        <div className="side-foot"><Link className="button small" href={`/${locale}/knowledge`}><BookOpen size={16}/><span>{ru?"База знаний":"Knowledge"}</span></Link><button className="button small" onClick={()=>setDialog("project")}><Plus size={16}/><span>{ru?"Проект":"Project"}</span></button></div>
      </aside>

      <nav className="mobile-workspace-nav" aria-label={ru?"Рабочее пространство":"Workspace"}>
        {roleMobileViews[workspace.managementRole].map((id)=>{
          const Icon=id==="overview"?Home:navIcons[id];
          return <button key={id} aria-current={activeNavigation===id||(id==="work"&&activeNavigation==="board")?"page":undefined} onClick={()=>navigateView(id)}><Icon size={19} aria-hidden="true"/><span>{id==="overview"?(ru?"Сейчас":"Today"):id==="planning"?(ru?"План":"Plan"):navLabels[locale][id]}</span></button>;
        })}
        <button onClick={()=>setMore(true)} aria-haspopup="dialog"><Plus size={19} aria-hidden="true"/><span>{ru?"Ещё":"More"}</span></button>
      </nav>
      {more&&<WorkspaceMore title={ru?"Ещё":"More"} onClose={()=>setMore(false)}>{[...new Set([...lensViews,"planning","raid","people","finance","control","documents","guide","portfolio","setup"] as WorkspaceView[])].filter(id=>!(roleMobileViews[workspace.managementRole] as readonly WorkspaceView[]).includes(id)).map(id=><button className="button" key={id} onClick={()=>{navigateView(id);setMore(false)}}>{navLabels[locale][id]}</button>)}<Link className="button" href={`/${locale}/knowledge`}>{ru?"База знаний":"Knowledge"}</Link></WorkspaceMore>}
      {addMenu&&<WorkspaceMore title={ru?"Добавить":"Add"} onClose={()=>setAddMenu(false)}><div className="global-add-grid">{addGroups.map(group=><section key={group.id}><h3>{ru?({work:"Работа",plan:"Планирование",raid:"Риски и решения",people:"Люди",control:"Контроль",document:"Документы"} as Record<string,string>)[group.id]:({work:"Work",plan:"Planning",raid:"Risks & decisions",people:"People",control:"Control",document:"Documents"} as Record<string,string>)[group.id]}</h3><div className="button-row">{group.types.map(type=><button className="button" key={type} onClick={()=>{setAddMenu(false);createRecord(type)}}>{createLabels[locale][type as keyof typeof createLabels[typeof locale]]}</button>)}</div></section>)}</div></WorkspaceMore>}

      <main className="workspace-main">
        <header className="workspace-top">
          <Link className="button small workspace-home-mobile" href={`/${locale}/`} aria-label={ru?"PMWORK — главная":"PMWORK home"}><Home size={18} aria-hidden="true"/></Link>
          {view!=="program"&&view!=="operations"&&<select className="input mobile-project-switch" value={project.id} onChange={(e)=>selectProject(e.target.value)} aria-label={ru?"Выбрать проект":"Select project"}>{workspace.projects.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select>}
          <h1 className={managementRecord?"management-context-heading":undefined}>{managementRecord?.name??project.name}</h1><span className="status info"><span className="sr-only">{ru?"Состояние: ":"Status: "}</span>{managementRecord?("status" in managementRecord?displayLabel(locale,"projectStatus",managementRecord.status):(ru?"Постоянный процесс":"Ongoing process")):displayLabel(locale,"projectStatus",project.status)}</span><div className="spacer"/>
          <small className="muted desktop-only" title={lastSaved}>{recovery?(ru?"Сохранение приостановлено":"Autosave paused"):lastSaved?(ru?"Сохранено локально":"Saved locally"):(ru?"Локально":"Local")}</small>
          <button className="button small command-trigger" aria-label={ru?"Открыть поиск":"Open search"} onClick={()=>setPalette(true)}><Search size={16}/><span>{ru?"Поиск":"Search"}</span><kbd>Ctrl K</kbd></button>
          <button className="button small" onClick={async()=>{if(!recovery)await saveWorkspace(workspace);const next=workspaceUrl(window.location.href,project.id,view);next.pathname=next.pathname.replace(`/${locale}/workspace`,`/${ru?"en":"ru"}/workspace`);window.location.assign(next.href)}}>{ru?"EN":"RU"}</button>
          <ThemeToggle locale={locale}/>
          <button className="button small primary" aria-label={ru?"Создать запись":"Global create"} aria-haspopup="dialog" onClick={()=>setAddMenu(true)}><Plus size={17}/><span className="desktop-only">{ru?"Создать":"Create"}</span></button>
          <button className="button small desktop-only" onClick={()=>exportWorkspace(workspace)}><Download size={17}/>{ru?"Экспорт":"Export"}</button>
          <button className="button small desktop-only" onClick={()=>fileRef.current?.click()}><Upload size={17}/>{ru?"Импорт":"Import"}</button>
          <input hidden ref={fileRef} type="file" accept="application/json" onChange={(e)=>void stageImport(e.target.files?.[0],true)}/>
        </header>
        <div className="workspace-content">
          {recovery&&<section className="recovery-banner" role="alert"><strong>{ru?"Автосохранение приостановлено":"Autosave paused"}</strong><p>{ru?"Исходные данные сохранены без изменений. Сейчас открыт пример. Импортируйте проверенную копию или восстановите снимок в настройках.":"Original data is untouched. A demo is open. Import a valid backup or restore a snapshot in Settings."}</p><button className="button" onClick={()=>fileRef.current?.click()}>{ru?"Импортировать копию":"Import backup"}</button><button className="button" onClick={()=>setView("setup")}>{ru?"Снимки данных":"Recovery snapshots"}</button></section>}
          {view!=="portfolio"&&<div className="page-title page-context"><div><p className="eyebrow">{!managementRecord&&project.demo?(ru?"ПРИМЕР · ":"DEMO · "):""}{managementRecord?navLabels[locale][view]:`${displayLabel(locale,"approach",project.approach)} · ${displayLabel(locale,"governance",project.governance)}`}</p><h2>{view==="board"?navLabels[locale].work:navLabels[locale][view]}</h2>{view==="overview"&&<p>{roleQuestions[locale][workspace.managementRole]}</p>}{view==="overview"&&<p className="muted">{managementRecord?("outcome" in managementRecord?managementRecord.outcome:managementRecord.purpose):project.objective}</p>}</div></div>}
          {workspace.experience==="foundation"&&(()=>{const domain=({program:"Program basics",operations:"Metrics",delivery:"Flow",overview:"Value",guide:"Fundamentals",work:"Requirements",board:"Flow",planning:"Schedule",raid:"Risk",people:"Stakeholders",finance:"Cost",control:"Governance",documents:"Communication",portfolio:"Portfolio basics",setup:"Fundamentals"} as Record<string,string>)[view];const help=knowledgeGuides[domain]??knowledgeGuides.Fundamentals;return <details className="panel foundation-help"><summary>{ru?"Что сделать сейчас":"What to do now"}</summary><h3>{ru?"Зачем это нужно":"Why this matters"}</h3><p>{help.summary[locale]}</p><h3>{ru?"Действие":"Action"}</h3><p>{help.steps[locale]}</p><h3>{ru?"Что получится":"Expected output"}</h3><p>{help.output[locale]}</p><h3>{ru?"Типичная ошибка":"Common mistake"}</h3><p>{help.mistake[locale]}</p><Link className="button small" href={`/${locale}/glossary/`}>{ru?"Объяснения терминов":"Term explanations"}</Link></details>})()}
          <Suspense fallback={<p role="status">{ru?"Открываем раздел…":"Opening section…"}</p>}>{render()}</Suspense>
        </div>
      </main>
      {dialog&&<WorkspaceDialog type={dialog} locale={locale} workspace={workspace} projectId={project.id} onClose={()=>setDialog(null)} onCommit={(next,id)=>{commit(next);if(id)selectProject(id)}}/>}
      {editor&&<RecordEditor key={`${editor.kind}:${editor.id}`} kind={editor.kind} id={editor.id} locale={locale} workspace={workspace} projectId={project.id} onClose={closeRecord} onChange={commit}/>}
      {palette&&<Suspense fallback={<div className="toast" role="status">{ru?"Открываем поиск…":"Opening search…"}</div>}><CommandPalette workspace={workspace} project={managementRecord?contextProject(workspace,{kind:view==="program"?"program":"operation",id:managementRecord.id}):project} locale={locale} onClose={()=>setPalette(false)} onView={navigateView} onCreate={createRecord} onProject={selectProject} onEdit={openRecord}/></Suspense>}
      {recoveryDialog}
      {toast&&<div className="toast" role="status">{toast}</div>}
    </div>
  );
}
