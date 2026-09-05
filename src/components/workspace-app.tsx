"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardCheck,
  Download,
  FileText,
  KanbanSquare,
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
import { demoWorkspace, localizeBundledDemo } from "@/data/demo";
import { displayLabel, enumLabels } from "@/content/workspace-i18n";
import {
  exportWorkspace,
  importWorkspace,
  listSnapshots,
  loadWorkspace,
  restoreSnapshot,
  saveWorkspace,
} from "@/data/storage";
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
  OverviewView,
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
  board: KanbanSquare,
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
    overview: "Обзор",
    guide: "Проведи меня",
    work: "Работа",
    board: "Доска",
    planning: "Планирование",
    raid: "RAID",
    people: "Люди",
    finance: "Финансы",
    control: "Контроль",
    documents: "Документы",
    setup: "Настройка",
  },
  en: {
    portfolio: "Portfolio",
    overview: "Overview",
    guide: "Guide me",
    work: "Work",
    board: "Board",
    planning: "Planning",
    raid: "RAID",
    people: "People",
    finance: "Finance",
    control: "Control",
    documents: "Documents",
    setup: "Setup",
  },
};
const views = Object.keys(navIcons) as WorkspaceView[];
export function WorkspaceApp({ locale }: { locale: Locale }) {
  const ru = locale === "ru",
    [workspace, setWorkspace] = useState<Workspace>(() =>
      demoWorkspace(locale),
    ),
    [projectId, setProjectId] = useState("atlas"),
    [view, setView] = useState<WorkspaceView>("overview"),
    [ready, setReady] = useState(false),
    [recovery, setRecovery] = useState(false),
    [dialog, setDialog] = useState<CreateType | null>(null),
    [editor, setEditor] = useState<{ kind: EditableKind; id: string } | null>(
      null,
    ),
    [palette, setPalette] = useState(false),
    [toast, setToast] = useState(""),
    [snapshots, setSnapshots] = useState<
      {
        key: string;
        at: string;
      }[]
    >([]),
    fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    loadWorkspace()
      .then((value) => {
        if (value) {
          const normalized = localizeBundledDemo(value, locale);
          setWorkspace(normalized);
          let remembered: string | null = null;
          try {
            remembered = sessionStorage.getItem("pmwork-project");
          } catch {}
          setProjectId(
            normalized.projects.some((p) => p.id === remembered)
              ? remembered!
              : (normalized.projects[0]?.id ?? ""),
          );
        }
        setReady(true);
        listSnapshots()
          .then(setSnapshots)
          .catch(() => undefined);
      })
      .catch(() => {
        setRecovery(true);
        setReady(true);
        listSnapshots().then(setSnapshots).catch(() => undefined);
        setToast(
          ru
            ? "Локальные данные повреждены — открыт безопасный пример"
            : "Local data was invalid — safe demo opened",
        );
      });
  }, [locale, ru]);
  useEffect(() => {
    if (!ready || recovery) return;
    const id = setTimeout(
      () =>
        saveWorkspace(workspace)
          .then(() =>
            setToast(ru ? "Сохранено на устройстве" : "Saved on this device"),
          )
          .catch(() =>
            setToast(ru ? "Не удалось сохранить" : "Could not save"),
          ),
      350,
    );
    return () => clearTimeout(id);
  }, [workspace, ready, ru, recovery]);
  useEffect(() => {
    if (!ready || recovery) return;
    const flush = () => { void saveWorkspace(workspace).catch(() => undefined); };
    const hidden = () => { if (document.visibilityState === "hidden") flush(); };
    addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", hidden);
    return () => { removeEventListener("pagehide", flush); document.removeEventListener("visibilitychange", hidden); };
  }, [workspace, ready, recovery]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPalette(true);
      }
      if (event.key === "Escape") {
        setDialog(null);
        setEditor(null);
        setPalette(false);
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);
  if (!ready)
    return (
      <main className="language-gate" aria-busy="true">
        <Brand />
        <p role="status">
          {ru ? "Загрузка рабочего пространства…" : "Loading local workspace…"}
        </p>
      </main>
    );
  const project =
    workspace.projects.find((p) => p.id === projectId) ?? workspace.projects[0];
  if (!project)
    return (
      <main className="language-gate">
        <Brand />
        <h1>{ru ? "Создайте первый проект" : "Create your first project"}</h1>
        <button className="button primary" onClick={() => setDialog("project")}>
          {ru ? "Создать проект" : "Create project"}
        </button>
        {dialog && (
          <WorkspaceDialog
            type="project"
            locale={locale}
            workspace={workspace}
            projectId=""
            onClose={() => setDialog(null)}
            onCommit={(next, id) => {
              setWorkspace(workspaceSchema.parse(next));
              if (id) setProjectId(id);
            }}
          />
        )}
      </main>
    );
  const commit = (next: Workspace) => setWorkspace(workspaceSchema.parse(next));
  const selectProject = (id: string) => {
    setProjectId(id);
    try {
      sessionStorage.setItem("pmwork-project", id);
    } catch {}
  };
  const common: ViewProps = {
    workspace,
    project,
    locale,
    onView: setView,
    onCreate: setDialog,
    onEdit: (kind, id) => setEditor({ kind, id }),
    onChange: commit,
    onProject: selectProject,
  };
  const render = () => {
    switch (view) {
      case "portfolio":
        return <PortfolioView {...common} />;
      case "overview":
        return <OverviewView {...common} />;
      case "guide":
        return <GuideView {...common} />;
      case "work":
        return <WorkView {...common} />;
      case "board":
        return <BoardView {...common} />;
      case "planning":
        return <PlanningView {...common} />;
      case "raid":
        return <RaidView {...common} />;
      case "people":
        return <PeopleView {...common} />;
      case "finance":
        return <FinanceView {...common} />;
      case "control":
        return <ControlView {...common} />;
      case "documents":
        return <DocumentsView {...common} />;
      case "setup":
        return (
          <SetupView
            {...common}
            snapshots={snapshots}
            onExport={() => exportWorkspace(workspace)}
            onImport={() => fileRef.current?.click()}
            onRestore={async (key) => {
              const snapshot = snapshots.find((item) => item.key === key);
              if (
                !window.confirm(
                  ru
                    ? `Восстановить снимок от ${snapshot ? new Date(snapshot.at).toLocaleString(locale) : "выбранной даты"}? Текущее состояние будет заменено. Сначала рекомендуется скачать резервную копию.`
                    : `Restore the snapshot from ${snapshot ? new Date(snapshot.at).toLocaleString(locale) : "the selected date"}? Current state will be replaced. Download a backup first.`,
                )
              )
                return;
              try {
                const restored = await restoreSnapshot(key);
                if (!recovery) await saveWorkspace(workspace, true);
                commit({ ...restored, locale });
                setRecovery(false);
                selectProject(restored.projects[0]?.id ?? "");
                setToast(
                  ru ? "Снимок данных восстановлен" : "Snapshot restored",
                );
              } catch {
                setToast(
                  ru
                    ? "Не удалось восстановить снимок данных"
                    : "Could not restore snapshot",
                );
              }
            }}
          />
        );
    }
  };
  const onImport = async (file?: File) => {
    if (!file) return;
    try {
      const imported = await importWorkspace(file);
      if (
        !window.confirm(
          ru
            ? "Импорт заменит текущее рабочее пространство. Продолжить?"
            : "Import will replace the current workspace. Continue?",
        )
      )
        return;
      if (!recovery) await saveWorkspace(workspace, true);
      commit({ ...imported, locale });
      setRecovery(false);
      selectProject(imported.projects[0]?.id ?? "");
      setToast(ru ? "Резервная копия восстановлена" : "Backup restored");
    } catch {
      setToast(ru ? "Файл не прошёл проверку" : "File did not pass validation");
    }
  };
  return (
    <div className="workspace-shell">
      <aside className="sidebar">
        <Link
          href={`/${locale}`}
          aria-label={ru ? "PMWORK — главная" : "PMWORK home"}
        >
          <Brand />
        </Link>
        <select
          className="project-switch"
          value={project.id}
          onChange={(e) => selectProject(e.target.value)}
          aria-label={ru ? "Выбрать проект" : "Select project"}
        >
          {workspace.projects.map((p) => (
            <option value={p.id} key={p.id}>
              {p.demo ? (ru ? "ПРИМЕР · " : "DEMO · ") : ""}
              {p.name}
            </option>
          ))}
        </select>
        <nav
          className="side-nav"
          aria-label={
            ru ? "Разделы рабочего пространства" : "Workspace sections"
          }
        >
          {views.map((id) => {
            const Icon = navIcons[id];
            return (
              <button
                key={id}
                className={view === id ? "active" : ""}
                onClick={() => setView(id)}
                aria-current={view === id ? "page" : undefined}
                title={navLabels[locale][id]}
              >
                <Icon size={19} />
                <span>{navLabels[locale][id]}</span>
              </button>
            );
          })}
        </nav>
        <div className="side-foot">
          <Link className="button small" href={`/${locale}/methods`}>
            <BookOpen size={16} />
            <span>{ru ? "База знаний" : "Knowledge"}</span>
          </Link>
          <button className="button small" onClick={() => setDialog("project")}>
            <Plus size={16} />
            <span>{ru ? "Проект" : "Project"}</span>
          </button>
        </div>
      </aside>
      <main className="workspace-main">
        <header className="workspace-top">
          <select
            className="input mobile-project-switch"
            value={project.id}
            onChange={(e) => selectProject(e.target.value)}
            aria-label={ru ? "Выбрать проект" : "Select project"}
          >
            {workspace.projects.map((p) => (
              <option value={p.id} key={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <h1>{project.name}</h1>
          <span
            className={`status ${project.health.schedule === "green" ? "good" : project.health.schedule === "red" ? "bad" : project.health.schedule === "amber" ? "warn" : "info"}`}
          >
            {displayLabel(locale, "projectStatus", project.status)}
          </span>
          <div className="spacer" />
          <button
            className="button small command-trigger"
            aria-label={ru ? "Открыть поиск" : "Open search"}
            onClick={() => setPalette(true)}
          >
            <Search size={16} />
            <span>{ru ? "Поиск" : "Search"}</span>
            <kbd>Ctrl K</kbd>
          </button>
          <ThemeToggle locale={locale} />
          <button
            className="button small"
            aria-label={ru ? "Добавить работу" : "Add work"}
            onClick={() => setDialog("work")}
          >
            <Plus size={17} />
            <span className="desktop-only" aria-hidden="true">
              {ru ? "Добавить" : "Add"}
            </span>
          </button>
          <button
            className="button small desktop-only"
            onClick={() => exportWorkspace(workspace)}
          >
            <Download size={17} />
            {ru ? "Экспорт" : "Export"}
          </button>
          <button
            className="button small desktop-only"
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={17} />
            {ru ? "Импорт" : "Import"}
          </button>
          <input
            hidden
            ref={fileRef}
            type="file"
            accept="application/json"
            onChange={(e) => onImport(e.target.files?.[0])}
          />
        </header>
        <div className="workspace-content">
          {recovery && <section className="recovery-banner" role="alert">
            <strong>{ru ? "Автосохранение приостановлено" : "Autosave paused"}</strong>
            <p>{ru ? "Исходные данные сохранены без изменений. Сейчас открыт пример. Импортируйте проверенную копию или восстановите снимок в настройках." : "Original data is untouched. A demo is open. Import a valid backup or restore a snapshot in Setup."}</p>
            <button className="button" onClick={() => fileRef.current?.click()}>{ru ? "Импортировать копию" : "Import backup"}</button>
            <button className="button" onClick={() => setView("setup")}>{ru ? "Снимки данных" : "Recovery snapshots"}</button>
          </section>}

          {view !== "portfolio" && (
            <div className="page-title page-context">
              <div>
                <p className="eyebrow">
                  {project.demo ? (ru ? "ПРИМЕР · " : "DEMO · ") : ""}
                  {displayLabel(locale, "approach", project.approach)} ·{" "}
                  {displayLabel(locale, "governance", project.governance)}
                </p>
                <h2>{navLabels[locale][view]}</h2>
                <p className="muted">{project.objective}</p>
              </div>
            </div>
          )}
          {render()}
        </div>
      </main>
      {dialog && (
        <WorkspaceDialog
          type={dialog}
          locale={locale}
          workspace={workspace}
          projectId={project.id}
          onClose={() => setDialog(null)}
          onCommit={(next, id) => {
            commit(next);
            if (id) selectProject(id);
          }}
        />
      )}{" "}
      {editor && (
        <RecordEditor
          kind={editor.kind}
          id={editor.id}
          locale={locale}
          workspace={workspace}
          projectId={project.id}
          onClose={() => setEditor(null)}
          onChange={commit}
        />
      )}{" "}
      {palette && (
        <CommandPalette
          workspace={workspace}
          project={project}
          locale={locale}
          onClose={() => setPalette(false)}
          onView={setView}
          onCreate={setDialog}
          onProject={selectProject}
          onEdit={(kind, id) => setEditor({kind, id})}
        />
      )}{" "}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
function SetupView({
  workspace,
  project,
  locale,
  onChange,
  onCreate,
  snapshots,
  onExport,
  onImport,
  onRestore,
}: {
  workspace: Workspace;
  project: Workspace["projects"][number];
  locale: Locale;
  onChange: (workspace: Workspace) => void;
  onCreate: (type: CreateType) => void;
  snapshots: {
    key: string;
    at: string;
  }[];
  onExport: () => void;
  onImport: () => void;
  onRestore: (key: string) => void;
}) {
  const ru = locale === "ru",
    settings = workspace.projectSettings.find(
      (x) => x.projectId === project.id,
    ),
    updateLimit = (column: string, value: number) =>
      onChange({
        ...workspace,
        projectSettings: settings
          ? workspace.projectSettings.map((x) =>
              x.projectId === project.id
                ? {
                    ...x,
                    wipLimits: { ...x.wipLimits, [column]: Math.max(1, value) },
                  }
                : x,
            )
          : [
              ...workspace.projectSettings,
              {
                projectId: project.id,
                enabledTypes: [
                  "initiative",
                  "epic",
                  "feature",
                  "story",
                  "task",
                  "subtask",
                  "bug",
                  "spike",
                  "deliverable",
                ],
                wipLimits: { [column]: Math.max(1, value) },
                governance: project.governance,
                probabilityScale: 5,
                impactScale: 5,
              },
            ],
      });
  return (
    <div className="dashboard-grid">
      <section className="panel span-6">
        <h3>{ru ? "Уровень подсказок" : "Guidance level"}</h3>
        <p className="muted">
          {workspace.experience === "foundation"
            ? ru
              ? "К каждому разделу добавлены пояснения: зачем он нужен, что сделать и какой ошибки избежать."
              : "Each area includes purpose, next action, and a common mistake."
            : workspace.experience === "advanced"
              ? ru
                ? "Компактный режим: приоритет сигналам и контрольным данным."
                : "Compact mode: signals and control data first."
              : ru
                ? "Сбалансированные подсказки для регулярной проектной работы."
                : "Balanced guidance for regular project delivery."}
        </p>
        <select
          className="input"
          aria-label={ru ? "Уровень подсказок" : "Guidance level"}
          value={workspace.experience}
          onChange={(e) =>
            onChange({
              ...workspace,
              experience: e.target.value as Workspace["experience"],
            })
          }
        >
          {Object.entries(enumLabels[locale].experience).map(
            ([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ),
          )}
        </select>
      </section>
      <section className="panel span-6">
        <h3>{ru ? "Локальные данные" : "Local data"}</h3>
        <p className="muted">
          {ru
            ? "Данные остаются на этом устройстве. Перед очисткой браузера экспортируйте резервную копию."
            : "Data stays on this device. Export a backup before clearing the browser."}
        </p>
        <div className="button-row">
          <button className="button" onClick={onExport}>
            <Download size={16} />
            {ru ? "Скачать резервную копию" : "Download backup"}
          </button>
          <button className="button" onClick={onImport}>
            <Upload size={16} />
            {ru ? "Восстановить" : "Restore"}
          </button>
        </div>
      </section>
      <section className="panel span-6">
        <h3>{ru ? "Лимиты незавершённой работы (WIP)" : "WIP limits"}</h3>
        <div className="form-grid">
          <label className="field">
            <span>{ru ? "В работе" : "In progress"}</span>
            <input
              type="number"
              min="1"
              value={settings?.wipLimits["in-progress"] ?? 3}
              onChange={(e) =>
                updateLimit("in-progress", Number(e.target.value))
              }
            />
          </label>
          <label className="field">
            <span>{ru ? "На проверке" : "Review"}</span>
            <input
              type="number"
              min="1"
              value={settings?.wipLimits.review ?? 2}
              onChange={(e) => updateLimit("review", Number(e.target.value))}
            />
          </label>
        </div>
        <p className="muted">
          {ru
            ? "Лимит должен отражать доступную мощность системы, а не желаемое количество задач."
            : "A limit should reflect system capacity, not desired task count."}
        </p>
      </section>
      <section className="panel span-6">
        <h3>{ru ? "Автоматические снимки данных" : "Automatic snapshots"}</h3>
        {snapshots.length ? (
          <ul className="clean-list">
            {snapshots.map((s) => (
              <li key={s.key}>
                <div className="section-line">
                  <time>{new Date(s.at).toLocaleString(locale)}</time>
                  <button
                    className="button small"
                    onClick={() => onRestore(s.key)}
                  >
                    {ru ? "Восстановить" : "Restore"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">
            {ru
              ? "Первый снимок создаётся после сохранения."
              : "The first snapshot is created after saving."}
          </p>
        )}
      </section>
      <section className="panel span-12">
        <h3>
          {ru ? "Создать связанную сущность" : "Create a connected record"}
        </h3>
        <div className="button-row">
          {(
            [
              "objective",
              "milestone",
              "dependency",
              "team",
              "stakeholder",
              "communication",
              "budget",
              "change",
              "quality",
              "document",
              "meeting",
              "vendor",
            ] as CreateType[]
          ).map((type) => (
            <button
              className="button small"
              key={type}
              onClick={() => onCreate(type)}
            >
              {
                (
                  {
                    objective: ru ? "Цель" : "Objective",
                    milestone: ru ? "Контрольная точка" : "Milestone",
                    dependency: ru ? "Зависимость" : "Dependency",
                    team: ru ? "Участник команды" : "Team member",
                    stakeholder: ru
                      ? "Заинтересованная сторона"
                      : "Stakeholder",
                    communication: ru ? "Коммуникация" : "Communication",
                    budget: ru ? "Статья бюджета" : "Budget line",
                    change: ru ? "Запрос на изменение" : "Change request",
                    quality: ru ? "Контроль качества" : "Quality gate",
                    document: ru ? "Документ" : "Document",
                    meeting: ru ? "Встреча" : "Meeting",
                    vendor: ru ? "Поставщик" : "Vendor",
                  } as Record<CreateType, string>
                )[type]
              }
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
