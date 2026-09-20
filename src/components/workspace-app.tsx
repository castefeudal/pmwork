"use client";
import Link from "next/link";
import { TodayView } from "./today-view";
import { readWorkspaceUrl, workspaceUrl } from "@/domain/workspace-url";
import { WorkspaceMore } from "./workspace-more";
import { WorkspaceSettingsView } from "./workspace-settings-view";
import { RecoveryConfirmDialog } from "./recovery-confirm-dialog";
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
import { assertWorkspaceGraph } from "@/domain/workspace-integrity";
import { demoWorkspace, emptyWorkspace, localizeBundledDemo } from "@/data/demo";
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

type PendingRecovery =
  | { kind: "import"; candidate: Workspace; replacing: boolean }
  | { kind: "snapshot"; key: string; label: string };

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
    [toast, setToast] = useState(""),
    [lastSaved, setLastSaved] = useState(""),
    [snapshots, setSnapshots] = useState<{key:string;at:string}[]>([]),
    [pendingRecovery,setPendingRecovery]=useState<PendingRecovery|null>(null),
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

  const stageImport=async(file?:File,replacing=!firstRun)=>{if(!file)return;try{const candidate=await importWorkspace(file);setPendingRecovery({kind:"import",candidate,replacing});}catch{setToast(ru?"Файл не прошёл проверку":"File did not pass validation");}finally{if(fileRef.current)fileRef.current.value='';}};
  const confirmRecovery=async()=>{
    const pending=pendingRecovery;if(!pending)return;
    try{
      if(pending.kind==="import"){
        if(pending.replacing&&!recovery)await saveWorkspace(workspace,true);
        const next=assertWorkspaceGraph(workspaceSchema.parse({...pending.candidate,locale}));
        setWorkspace(next);setProjectId(next.projects[0]?.id??"");setView("overview");setFirstRun(false);setRecovery(false);setToast(ru?"Резервная копия восстановлена":"Backup restored");
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

  if (!ready) return <main className="language-gate first-run-gate" aria-busy="true"><Brand/><p role="status">{ru ? "Загрузка рабочего пространства…" : "Loading local workspace…"}</p></main>;

  if (firstRun) return (
    <main className="language-gate first-run-gate">
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
      <input hidden ref={fileRef} type="file" accept="application/json" onChange={e=>void stageImport(e.target.files?.[0],false)}/>
      {toast&&<p role="alert">{toast}</p>}
      {dialog&&<WorkspaceDialog type="project" locale={locale} workspace={workspace} projectId="" onClose={()=>setDialog(null)} onCommit={(next,id)=>{setWorkspace(assertWorkspaceGraph(workspaceSchema.parse(next)));setProjectId(id??"");setView("overview");setFirstRun(false);}}/>}
      {recoveryDialog}
    </main>
  );

  const project = workspace.projects.find((p) => p.id === projectId) ?? workspace.projects[0];
  if (!project) return <main className="language-gate"><Brand/><h1>{ru ? "Создайте первый проект" : "Create your first project"}</h1><button className="button primary" onClick={() => setDialog("project")}>{ru ? "Создать проект" : "Create project"}</button>{dialog&&<WorkspaceDialog type="project" locale={locale} workspace={workspace} projectId="" onClose={()=>setDialog(null)} onCommit={(next,id)=>{setWorkspace(assertWorkspaceGraph(workspaceSchema.parse(next)));if(id)setProjectId(id);}}/>}{recoveryDialog}</main>;

  const commit = (next: Workspace) => setWorkspace(assertWorkspaceGraph(workspaceSchema.parse(next)));
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

  return (
    <div className={`workspace-shell density-${workspace.density} experience-${workspace.experience}`}>
      <aside className="sidebar">
        <Link href={`/${locale}`} aria-label={ru ? "PMWORK — главная" : "PMWORK home"}><Brand/></Link>
        <select className="project-switch" value={project.id} onChange={(e)=>selectProject(e.target.value)} aria-label={ru?"Выбрать проект":"Select project"}>{workspace.projects.map(p=><option value={p.id} key={p.id}>{p.demo?(ru?"ПРИМЕР · ":"DEMO · "):""}{p.name}</option>)}</select>
        <nav className="side-nav" aria-label={ru?"Разделы рабочего пространства":"Workspace sections"}>{navGroups.map(([label,ids])=><div className="nav-group" key={label}><small>{label}</small>{ids.map(id=>{const Icon=navIcons[id];return <button key={id} aria-label={navLabels[locale][id]} className={view===id||(id==="work"&&view==="board")?"active":""} onClick={()=>setView(id)} aria-current={view===id||(id==="work"&&view==="board")?"page":undefined}><Icon size={19}/><span>{navLabels[locale][id]}</span></button>})}</div>)}</nav>
        <div className="side-foot"><Link className="button small" href={`/${locale}/knowledge`}><BookOpen size={16}/><span>{ru?"База знаний":"Knowledge"}</span></Link><button className="button small" onClick={()=>setDialog("project")}><Plus size={16}/><span>{ru?"Проект":"Project"}</span></button></div>
      </aside>

      <nav className="mobile-workspace-nav" aria-label={ru?"Рабочее пространство":"Workspace"}>{(["overview","work","planning","control"] as WorkspaceView[]).map(id=><button key={id} aria-current={view===id||(id==="work"&&view==="board")?"page":undefined} onClick={()=>setView(id)}>{id==="overview"?(ru?"Сейчас":"Today"):navLabels[locale][id]}</button>)}<button onClick={()=>setMore(true)} aria-haspopup="dialog">{ru?"Ещё":"More"}</button></nav>
      {more&&<WorkspaceMore title={ru?"Ещё":"More"} onClose={()=>setMore(false)}>{(["raid","people","finance","documents","guide","portfolio","setup"] as WorkspaceView[]).map(id=><button className="button" key={id} onClick={()=>{setView(id);setMore(false)}}>{navLabels[locale][id]}</button>)}<Link className="button" href={`/${locale}/knowledge`}>{ru?"База знаний":"Knowledge"}</Link></WorkspaceMore>}
      {addMenu&&<WorkspaceMore title={ru?"Добавить":"Add"} onClose={()=>setAddMenu(false)}><div className="global-add-grid">{addGroups.map(group=><section key={group.id}><h3>{ru?({work:"Работа",plan:"Планирование",raid:"Риски и решения",people:"Люди",control:"Контроль",document:"Документы"} as Record<string,string>)[group.id]:({work:"Work",plan:"Planning",raid:"Risks & decisions",people:"People",control:"Control",document:"Documents"} as Record<string,string>)[group.id]}</h3><div className="button-row">{group.types.map(type=><button className="button" key={type} onClick={()=>{setAddMenu(false);setDialog(type)}}>{createLabels[locale][type as keyof typeof createLabels[typeof locale]]}</button>)}</div></section>)}</div></WorkspaceMore>}

      <main className="workspace-main">
        <header className="workspace-top">
          <Link className="button small workspace-home-mobile" href={`/${locale}/`} aria-label={ru?"PMWORK — главная":"PMWORK home"}><Home size={18} aria-hidden="true"/></Link>
          <select className="input mobile-project-switch" value={project.id} onChange={(e)=>selectProject(e.target.value)} aria-label={ru?"Выбрать проект":"Select project"}>{workspace.projects.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select>
          <h1>{project.name}</h1><span className="status info"><span className="sr-only">{ru?"Статус проекта: ":"Project status: "}</span>{displayLabel(locale,"projectStatus",project.status)}</span><div className="spacer"/>
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
          {view!=="portfolio"&&<div className="page-title page-context"><div><p className="eyebrow">{project.demo?(ru?"ПРИМЕР · ":"DEMO · "):""}{displayLabel(locale,"approach",project.approach)} · {displayLabel(locale,"governance",project.governance)}</p><h2>{view==="board"?navLabels[locale].work:navLabels[locale][view]}</h2><p className="muted">{project.objective}</p></div>{(view==="work"||view==="board")&&<div className="button-row work-mode-switch"><button className={`button small ${view==="work"?"primary":""}`} aria-pressed={view==="work"} onClick={()=>setView("work")}>{ru?"Список":"List"}</button><button className={`button small ${view==="board"?"primary":""}`} aria-pressed={view==="board"} onClick={()=>setView("board")}>{ru?"Доска":"Board"}</button></div>}</div>}
          {workspace.experience==="foundation"&&(()=>{const domain=({overview:"Value",guide:"Fundamentals",work:"Requirements",board:"Flow",planning:"Schedule",raid:"Risk",people:"Stakeholders",finance:"Cost",control:"Governance",documents:"Communication",portfolio:"Portfolio basics",setup:"Fundamentals"} as Record<string,string>)[view];const help=knowledgeGuides[domain]??knowledgeGuides.Fundamentals;return <details className="panel foundation-help"><summary>{ru?"Что сделать сейчас":"What to do now"}</summary><h3>{ru?"Зачем это нужно":"Why this matters"}</h3><p>{help.summary[locale]}</p><h3>{ru?"Действие":"Action"}</h3><p>{help.steps[locale]}</p><h3>{ru?"Что получится":"Expected output"}</h3><p>{help.output[locale]}</p><h3>{ru?"Типичная ошибка":"Common mistake"}</h3><p>{help.mistake[locale]}</p><Link className="button small" href={`/${locale}/glossary/`}>{ru?"Объяснения терминов":"Term explanations"}</Link></details>})()}
          {render()}
        </div>
      </main>
      {dialog&&<WorkspaceDialog type={dialog} locale={locale} workspace={workspace} projectId={project.id} onClose={()=>setDialog(null)} onCommit={(next,id)=>{commit(next);if(id)selectProject(id)}}/>}
      {editor&&<RecordEditor kind={editor.kind} id={editor.id} locale={locale} workspace={workspace} projectId={project.id} onClose={()=>setEditor(null)} onChange={commit}/>} 
      {palette&&<CommandPalette workspace={workspace} project={project} locale={locale} onClose={()=>setPalette(false)} onView={setView} onCreate={setDialog} onProject={selectProject} onEdit={(kind,id)=>setEditor({kind,id})}/>} 
      {recoveryDialog}
      {toast&&<div className="toast" role="status">{toast}</div>}
    </div>
  );
}
