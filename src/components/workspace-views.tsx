"use client";
import { ProjectHealth } from "./project-health";
import { convertRiskToIssue, generateStatusDraft } from "@/domain/workspace-commands";
import { PlanningTimeline } from "./planning-timeline";
import { localDay } from "@/domain/work-views";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileText,
  Plus,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import type { Locale, Project, Workspace, WorkItem } from "@/domain/schemas";
import {
  flowMetrics,
  portfolioSummary,
  projectActions,
  projectCompleteness,
} from "@/domain/insights";
import type { CreateType, WorkspaceView } from "./workspace-types";
import type { EditableKind } from "./record-editor";
import { displayLabel } from "@/content/workspace-i18n";
const columns = ["backlog", "ready", "in-progress", "review", "done"] as const;
const statusLabel = {
  ru: {
    backlog: "Бэклог",
    ready: "Готово",
    "in-progress": "В работе",
    review: "Проверка",
    done: "Завершено",
  },
  en: {
    backlog: "Backlog",
    ready: "Ready",
    "in-progress": "In progress",
    review: "Review",
    done: "Done",
  },
};
const healthClass = (v: string) =>
  v === "green"
    ? "good"
    : v === "amber"
      ? "warn"
      : v === "red"
        ? "bad"
        : "info";
const formatMoney = (locale: Locale, currency: string, value: number) => {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${Math.round(value)} ${currency}`;
  }
};
const download = (name: string, body: string, type = "text/markdown") => {
  const blob = new Blob([body], { type }),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};
export type ViewProps = {
  workspace: Workspace;
  project: Project;
  locale: Locale;
  onView: (view: WorkspaceView) => void;
  onCreate: (type: CreateType) => void;
  onChange: (workspace: Workspace) => void;
  onProject: (id: string) => void;
  onEdit: (kind: EditableKind, id: string) => void;
};
export function PortfolioView({
  workspace,
  locale,
  onView,
  onProject,
  onCreate,
  onEdit,
}: ViewProps) {
  const ru = locale === "ru";
  return (
    <>
      <div className="page-title">
        <div>
          <p className="eyebrow">
            {ru ? "Центр управления портфелем" : "Portfolio control tower"}
          </p>
          <h2>{ru ? "Все проекты" : "All projects"}</h2>
          <p className="muted">
            {ru
              ? "Сравнивайте не активность, а результат, риск и качество управления."
              : "Compare outcomes, risk, and control quality—not activity."}
          </p>
        </div>
        <button className="button primary" onClick={() => onCreate("project")}>
          <Plus size={18} />
          {ru ? "Создать проект" : "Create project"}
        </button>
      </div>
      <div className="portfolio-grid">
        {workspace.projects.map((p) => {
          const s = portfolioSummary(workspace, p),
            over = s.forecast > s.planned && s.planned > 0;
          return (
            <article className="project-card" key={p.id}>
              <div className="project-card-head">
                <div>
                  <span className={`status ${healthClass(p.health.schedule)}`}>
                    {displayLabel(locale, "projectStatus", p.status)}
                  </span>
                  <h3>{p.name}</h3>
                </div>
                <strong
                  className="score-ring"
                  aria-label={`${s.completeness}%`}
                >
                  {s.completeness}
                </strong>
              </div>
              <p>{p.objective}</p>
              <div className="project-metrics">
                <span>
                  <b>{s.progress}%</b>
                  {ru ? "готово" : "complete"}
                </span>
                <span>
                  <b>{s.open}</b>
                  {ru ? "открыто" : "open"}
                </span>
                <span className={s.critical ? "bad-text" : ""}>
                  <b>{s.critical}</b>
                  {ru ? "критично" : "critical"}
                </span>
                <span className={over ? "bad-text" : ""}>
                  <b>{formatMoney(locale, p.currency, s.forecast)}</b>
                  {ru ? "прогноз" : "forecast"}
                </span>
              </div>
              <div className="card-foot">
                <span className="muted">
                  {displayLabel(locale, "approach", p.approach)} ·{" "}
                  {p.targetDate}
                </span>
                <button
                  className="button small"
                  onClick={() => onEdit("project", p.id)}
                >
                  {ru ? "Изменить" : "Edit"}
                </button>
                <button
                  className="button small"
                  onClick={() => {
                    onProject(p.id);
                    onView("overview");
                  }}
                >
                  {ru ? "Открыть" : "Open"}
                  <ArrowRight size={15} />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
export function OverviewView({
  workspace,
  project,
  locale,
  onView,
}: ViewProps) {
  const ru = locale === "ru",
    items = workspace.workItems.filter(
      (x) => x.projectId === project.id && !x.archived,
    ),
    actions = projectActions(workspace, project.id, locale),
    complete = projectCompleteness(workspace, project.id),
    flow = flowMetrics(items),
    milestones = workspace.milestones.filter((x) => x.projectId === project.id),
    objectives = workspace.objectives.filter((x) => x.projectId === project.id),
    activity = workspace.activities
      .filter((x) => x.projectId === project.id)
      .slice(-6)
      .reverse();
  return (
    <>
      <div className="metric-cards">
        <Metric
          name={ru ? "Покрытие контура управления" : "Management coverage"}
          value={`${complete.score}%`}
          detail={
            (ru ? "Полнота заполнения, не вероятность успеха. " : "Completeness, not probability of success. ") + (complete.gaps.length
              ? `${complete.gaps.length} ${ru ? "пробелов" : "gaps"}`
              : ru
                ? "контур полный"
                : "complete")
          }
        />
        <Metric
          name="WIP"
          value={String(flow.wip)}
          detail={`${flow.blocked} ${ru ? "заблокировано" : "blocked"}`}
        />
        <Metric
          name={ru ? "Прогресс" : "Progress"}
          value={`${Math.round((items.filter((x) => x.done).length / Math.max(1, items.length)) * 100)}%`}
          detail={`${flow.throughput} ${ru ? "завершено" : "done"}`}
        />
        <Metric
          name={ru ? "Сигналы" : "Signals"}
          value={String(actions.length)}
          detail={`${actions.filter((x) => x.severity === "critical").length} ${ru ? "критичных" : "critical"}`}
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel span-8">
          <div className="section-line">
            <div>
              <p className="eyebrow">
                {ru ? "Что делать сейчас" : "What to do now"}
              </p>
              <h3>
                {ru
                  ? "Приоритетные управленческие действия"
                  : "Priority management actions"}
              </h3>
            </div>
            <button className="button small" onClick={() => onView("guide")}>
              {ru ? "Открыть гид" : "Open guide"}
            </button>
          </div>
          {actions.length ? (
            <ol className="action-list">
              {actions.slice(0, 6).map((a) => (
                <li key={a.id}>
                  <span className={`signal-rank ${a.severity}`}>
                    {a.severity === "critical"
                      ? ru
                        ? "Критично"
                        : "Critical"
                      : a.severity === "high"
                        ? ru
                          ? "Внимание"
                          : "Warning"
                        : ru
                          ? "Информация"
                          : "Information"}
                  </span>
                  <div>
                    <strong>{a.title}</strong>
                    <p>{a.why}</p>
                    <small>{a.action}</small>
                  </div>
                  <button
                    className="button small"
                    onClick={() => onView(a.view)}
                  >
                    {ru ? "Перейти" : "Open"}
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <div className="empty-state">
              <CheckCircle2 />
              <h3>{ru ? "Критичных сигналов нет" : "No critical signals"}</h3>
              <p>
                {ru
                  ? "Проверьте актуальность данных на следующем обзоре."
                  : "Review data freshness at the next review."}
              </p>
            </div>
          )}
        </section>
        <ProjectHealth workspace={workspace} project={project} locale={locale} onView={onView} />
        <section className="panel span-6">
          <h3>
            {ru ? "Измеримые результаты и выгоды" : "Outcomes and benefits"}
          </h3>
          {objectives.length ? (
            <ul className="clean-list">
              {objectives.map((o) => (
                <li key={o.id}>
                  <strong>{o.description}</strong>
                  <br />
                  <span className="muted">
                    {o.baseline || "—"} → {o.target || "—"} · {o.measure} ·{" "}
                    {o.owner || "—"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">
              {ru
                ? "Нет измеримого результата. Создайте его до детализации границ проекта."
                : "No measurable outcome. Create one before detailing scope."}
            </p>
          )}
        </section>
        <section className="panel span-6">
          <h3>{ru ? "Контрольные точки" : "Milestones"}</h3>
          <ul className="clean-list">
            {milestones.map((m) => (
              <li key={m.id}>
                <div className="section-line">
                  <strong>{m.title}</strong>
                  <span
                    className={`status ${m.status === "at-risk" ? "warn" : m.status === "done" ? "good" : "info"}`}
                  >
                    {displayLabel(locale, "milestoneStatus", m.status)}
                  </span>
                </div>
                <span className="muted">
                  {m.date} · {m.progress}%
                </span>
                <div className="progress">
                  <span style={{ width: `${m.progress}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel span-12">
          <h3>{ru ? "Журнал изменений" : "Activity trail"}</h3>
          {activity.length ? (
            <ul className="activity-list">
              {activity.map((a) => (
                <li key={a.id}>
                  <time>{new Date(a.at).toLocaleString(locale)}</time>
                  <span>{a.message}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">
              {ru ? "Изменений пока нет." : "No changes yet."}
            </p>
          )}
        </section>
      </div>
    </>
  );
}
export function GuideView({
  workspace,
  project,
  locale,
  onView,
  onCreate,
}: ViewProps) {
  const ru = locale === "ru",
    complete = projectCompleteness(workspace, project.id),
    actions = projectActions(workspace, project.id, locale),
    stages = [
      {
        name: ru ? "1. Инициировать" : "1. Initiate",
        view: "control" as const,
        done: Boolean(project.purpose && project.objective && project.sponsor),
        copy: ru
          ? "Цель, измеримый результат, спонсор, границы и ограничения."
          : "Purpose, outcome, sponsor, boundaries, and constraints.",
      },
      {
        name: ru ? "2. Спланировать" : "2. Plan",
        view: "planning" as const,
        done:
          workspace.milestones.some((x) => x.projectId === project.id) &&
          workspace.workItems.some((x) => x.projectId === project.id),
        copy: ru
          ? "Результаты, контрольные точки, зависимости, загрузка и риски."
          : "Deliverables, milestones, dependencies, capacity, and risks.",
      },
      {
        name: ru ? "3. Выполнять" : "3. Deliver",
        view: "board" as const,
        done: workspace.workItems.some(
          (x) =>
            x.projectId === project.id &&
            ["in-progress", "review", "done"].includes(x.status),
        ),
        copy: ru
          ? "Ограничить незавершённую работу, завершать ценность, собирать обратную связь."
          : "Limit WIP, finish value, and collect feedback.",
      },
      {
        name: ru ? "4. Контролировать" : "4. Control",
        view: "overview" as const,
        done: actions.filter((x) => x.severity === "critical").length === 0,
        copy: ru
          ? "Сигналы, решения, прогноз, изменения и качество."
          : "Signals, decisions, forecast, change, and quality.",
      },
      {
        name: ru ? "5. Закрыть" : "5. Close",
        view: "control" as const,
        done: project.status === "completed",
        copy: ru
          ? "Приёмка, передача, финансы, уроки и контроль выгод."
          : "Acceptance, handover, finance, lessons, and benefits follow-up.",
      },
    ];
  return (
    <div className="guide-layout">
      <section className="panel guide-score">
        <p className="eyebrow">
          {ru
            ? "ПОНЯТЬ → РЕШИТЬ → СДЕЛАТЬ → КОНТРОЛИРОВАТЬ → НАУЧИТЬСЯ"
            : "UNDERSTAND → DECIDE → DO → CONTROL → LEARN"}
        </p>
        <h2>{ru ? "Проведи меня" : "Guide me"}</h2>
        <strong>{complete.score}%</strong>
        <p>
          {ru
            ? "полнота управленческого контура"
            : "management control completeness"}
        </p>
        <div className="progress">
          <span style={{ width: `${complete.score}%` }} />
        </div>
        {complete.gaps.length > 0 && (
          <p className="muted">
            {ru ? "Пробелы" : "Gaps"}: {complete.gaps.join(", ")}
          </p>
        )}
        <button
          className="button primary"
          onClick={() =>
            actions[0] ? onView(actions[0].view) : onCreate("objective")
          }
        >
          {actions[0]
            ? ru
              ? "Взять главное действие"
              : "Take top action"
            : ru
              ? "Уточнить измеримый результат"
              : "Define outcome"}
        </button>
      </section>
      <div className="stage-list">
        {stages.map((stage) => (
          <article className="panel" key={stage.name}>
            <span className={`status ${stage.done ? "good" : "info"}`}>
              {stage.done
                ? ru
                  ? "готово"
                  : "complete"
                : ru
                  ? "следующий шаг"
                  : "next"}
            </span>
            <h3>{stage.name}</h3>
            <p>{stage.copy}</p>
            <button className="button small" onClick={() => onView(stage.view)}>
              {ru ? "Открыть" : "Open"}
              <ArrowRight size={15} />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
export { WorkSurface as WorkView } from "./work-surface";
export function BoardView({
  workspace,
  project,
  locale,
  onCreate,
  onChange,
  onEdit,
  visibleItems,
}: ViewProps & { visibleItems?: WorkItem[] }) {
  const ru = locale === "ru",
    items = workspace.workItems.filter(
      (x) => x.projectId === project.id && !x.archived,
    ),
    settings = workspace.projectSettings.find(
      (x) => x.projectId === project.id,
    ),
    update = (id: string, status: WorkItem["status"]) =>
      onChange({
        ...workspace,
        workItems: workspace.workItems.map((x) =>
          x.id === id
            ? {
                ...x,
                status,
                done: status === "done",
                updatedAt: new Date().toISOString(),
                completedAt:
                  status === "done"
                    ? (x.completedAt ?? new Date().toISOString())
                    : undefined,
              }
            : x,
        ),
      });
  return (
    <>
      <div className="toolbar">
        <span className="pill">
          {ru ? "Незавершено (WIP)" : "WIP"}{" "}
          {
            items.filter((x) => ["in-progress", "review"].includes(x.status))
              .length
          }
        </span>
        <span className="pill">
          {ru ? "Заблокировано" : "Blocked"}{" "}
          {items.filter((x) => x.blocked && !x.done).length}
        </span>
        <button className="button primary" onClick={() => onCreate("work")}>
          <Plus size={17} />
          {ru ? "Новая работа" : "New work"}
        </button>
      </div>
      <div className="board">
        {columns.map((col, ci) => {
          const rows = (visibleItems ?? items).filter((x) => x.status === col),
            limit = settings?.wipLimits[col];
          return (
            <section
              className="board-column"
              key={col}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const id = e.dataTransfer.getData("text/plain");
                if (id) update(id, col);
              }}
            >
              <div className="board-column-head">
                <span>{statusLabel[locale][col]}</span>
                <span
                  className={
                    limit && items.filter(x => x.status === col).length > limit ? "status bad" : "pill"
                  }
                >
                  {rows.length}
                  {limit ? ` / ${limit}` : ""}
                </span>
              </div>
              {limit && items.filter(x => x.status === col).length > limit && <p className="bad-text">{ru ? "Превышен лимит WIP" : "WIP limit exceeded"}: {items.filter(x => x.status === col).length} / {limit}</p>}
              {rows.map((x) => (
                <article
                  className={`work-card ${x.blocked ? "blocked" : ""}`}
                  key={x.id}
                  draggable
                  onDragStart={(e) =>
                    e.dataTransfer.setData("text/plain", x.id)
                  }
                >
                  <small>
                    {x.id} · {displayLabel(locale, "workType", x.type)}
                  </small>
                  <button className="work-title-button" onClick={() => onEdit("work", x.id)}>{x.title}</button>
                  {x.blocked && <span className="status bad">{ru ? "Блокер" : "Blocked"}</span>}
                  {x.dueDate && x.dueDate < localDay() && !x.done && <span className="status warn">{ru ? "Просрочено" : "Overdue"}</span>}
                  <div className="card-meta">
                    <span>{x.owner || (ru ? "Без владельца" : "Unowned")}</span>
                    <span>{displayLabel(locale, "priority", x.priority)}</span>
                  </div>
                  {x.dueDate && <p className="card-date">{x.dueDate}</p>}
                  <div
                    className="button-row"
                    aria-label={ru ? "Переместить карточку" : "Move card"}
                  >
                    {ci > 0 && (
                      <button
                        className="button small"
                        onClick={() => update(x.id, columns[ci - 1]!)}
                        aria-label={ru ? "Переместить влево" : "Move left"}
                      >
                        ←
                      </button>
                    )}
                    {ci < columns.length - 1 && (
                      <button
                        className="button small"
                        onClick={() => update(x.id, columns[ci + 1]!)}
                        aria-label={ru ? "Переместить вправо" : "Move right"}
                      >
                        →
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </section>
          );
        })}
      </div>
    </>
  );
}
export function PlanningView({
  workspace,
  project,
  locale,
  onCreate,
  onEdit,
}: ViewProps) {
  const ru = locale === "ru",
    [tab, setTab] = useState("timeline"),
    milestones = workspace.milestones.filter((x) => x.projectId === project.id),
    iterations = workspace.iterations.filter((x) => x.projectId === project.id),
    deps = workspace.dependencies.filter((x) => x.projectId === project.id);

  const tabs = [
    ["timeline", ru ? "План-график" : "Timeline"],
    ["milestones", ru ? "Контрольные точки" : "Milestones"],
    ["iterations", ru ? "Итерации" : "Iterations"],
    ["dependencies", ru ? "Зависимости" : "Dependencies"],
  ];
  return (
    <>
      <div className="tabs">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            className={tab === id ? "active" : ""}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "timeline" && <PlanningTimeline workspace={workspace} project={project} locale={locale} onCreate={onCreate} onEdit={onEdit} />}
      {tab === "milestones" && (
        <>
          <button
            className="button primary section-action"
            onClick={() => onCreate("milestone")}
          >
            <Plus size={17} />
            {ru ? "Добавить" : "Add"}
          </button>
          <div className="catalog-grid inline-grid">
            {milestones.map((m) => (
              <article className="catalog-card" key={m.id}>
                <CalendarDays />
                <p className="eyebrow">{m.date}</p>
                <h3>{m.title}</h3>
                <strong>{m.progress}%</strong>
                <span
                  className={`status ${m.status === "at-risk" ? "warn" : m.status === "done" ? "good" : "info"}`}
                >
                  {displayLabel(locale, "milestoneStatus", m.status)}
                </span>
                <button
                  className="button small"
                  onClick={() => onEdit("milestone", m.id)}
                >
                  {ru ? "Изменить" : "Edit"}
                </button>
              </article>
            ))}
          </div>
        </>
      )}
      {tab === "iterations" && (
        <>
          <button
            className="button primary section-action"
            onClick={() => onCreate("iteration")}
          >
            <Plus size={17} />
            {ru ? "Добавить итерацию" : "Add iteration"}
          </button>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{ru ? "Итерация" : "Iteration"}</th>
                  <th>{ru ? "Цель" : "Goal"}</th>
                  <th>{ru ? "Период" : "Period"}</th>
                  <th>{ru ? "Доступная мощность" : "Capacity"}</th>
                  <th>{ru ? "Статус" : "Status"}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {iterations.map((x) => (
                  <tr key={x.id}>
                    <td>
                      <strong>{x.title}</strong>
                    </td>
                    <td>{x.goal}</td>
                    <td>
                      {x.startDate} → {x.endDate}
                    </td>
                    <td>{x.capacity}</td>
                    <td>{displayLabel(locale, "iterationStatus", x.status)}</td>
                    <td>
                      <button
                        className="button small"
                        onClick={() => onEdit("iteration", x.id)}
                      >
                        {ru ? "Изменить" : "Edit"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {tab === "dependencies" && (
        <>
          <div className="callout">
            <ShieldAlert />
            <div>
              <strong>
                {ru ? "Согласование зависимости" : "Dependency handshake"}
              </strong>
              <p>
                {ru
                  ? "Укажите предшественника, последователя, владельца, срок и резервный план."
                  : "State predecessor output, successor need, owner, due date, and fallback."}
              </p>
            </div>
          </div>
          <button
            className="button primary section-action"
            onClick={() => onCreate("dependency")}
          >
            <Plus size={17} />
            {ru ? "Добавить зависимость" : "Add dependency"}
          </button>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{ru ? "Предшественник" : "Predecessor"}</th>
                  <th>{ru ? "Последователь" : "Successor"}</th>
                  <th>{ru ? "Тип" : "Type"}</th>
                  <th>{ru ? "Владелец" : "Owner"}</th>
                  <th>{ru ? "Статус" : "Status"}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {deps.map((d) => (
                  <tr key={d.id}>
                    <td>{d.id}</td>
                    <td>{d.predecessorId}</td>
                    <td>{d.successorId}</td>
                    <td>
                      {d.type}
                      {d.lag ? ` +${d.lag}` : ""}
                    </td>
                    <td>{d.owner || "—"}</td>
                    <td>
                      {displayLabel(locale, "dependencyStatus", d.status)}
                    </td>
                    <td>
                      <button
                        className="button small"
                        onClick={() => onEdit("dependency", d.id)}
                      >
                        {ru ? "Изменить" : "Edit"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
export function RaidView({
  workspace,
  project,
  locale,
  onCreate,
  onChange,
  onEdit,
}: ViewProps) {
  const ru = locale === "ru",
    [tab, setTab] = useState<CreateType>("risk"),
    map = {
      dependency: workspace.dependencies.filter((x) => x.projectId === project.id),
      risk: workspace.risks.filter((x) => x.projectId === project.id),
      issue: workspace.issues.filter((x) => x.projectId === project.id),
      assumption: workspace.assumptions.filter(
        (x) => x.projectId === project.id,
      ),
      decision: workspace.decisions.filter((x) => x.projectId === project.id),
    };
  const archive = (kind: CreateType, id: string) => {
    if (kind === "risk")
      onChange({
        ...workspace,
        risks: workspace.risks.filter((x) => x.id !== id),
      });
    if (kind === "issue")
      onChange({
        ...workspace,
        issues: workspace.issues.filter((x) => x.id !== id),
      });
    if (kind === "assumption")
      onChange({
        ...workspace,
        assumptions: workspace.assumptions.filter((x) => x.id !== id),
      });
    if (kind === "decision")
      onChange({
        ...workspace,
        decisions: workspace.decisions.filter((x) => x.id !== id),
      });
  };
  return (
    <>
      <div className="tabs">
        {(["risk", "assumption", "issue", "dependency", "decision"] as CreateType[]).map(
          (k) => (
            <button
              key={k}
              className={tab === k ? "active" : ""}
              onClick={() => setTab(k)}
            >
              {
                (ru
                  ? {
                      dependency: "Зависимости",
                      risk: "Риски",
                      issue: "Проблемы",
                      assumption: "Допущения",
                      decision: "Решения",
                    }
                  : {
                      dependency: "Dependencies",
                      risk: "Risks",
                      issue: "Issues",
                      assumption: "Assumptions",
                      decision: "Decisions",
                    })[k as "risk" | "issue" | "assumption" | "decision" | "dependency"]
              }{" "}
              · {map[k as keyof typeof map]?.length ?? 0}
            </button>
          ),
        )}
      </div>
      <button
        className="button primary section-action"
        onClick={() => onCreate(tab)}
      >
        <Plus size={17} />
        {ru ? "Добавить запись" : `Add ${tab}`}
      </button>
      {tab === "dependency" && <EntityTable rows={map.dependency.map(d => ({id:d.id,title:`${d.predecessorId} → ${d.successorId}`,meta:`${d.type} · ${d.lag} ${ru ? "дн. лага" : "lag days"} · ${d.dueDate || "—"}`,owner:d.owner,status:displayLabel(locale,"dependencyStatus",d.status)}))} locale={locale} onEdit={id => onEdit("dependency",id)} />}
      {tab === "risk" && (
        <div className="dashboard-grid">
          <div className="panel span-8">
            <details><summary>{ru ? "Риск наступил" : "Convert risk to issue"}</summary>{map.risk.filter(r=>r.status!=="closed").map(r=><button className="button small" key={r.id} onClick={()=>onChange(convertRiskToIssue(workspace,r.id))}>{r.title} → Issue</button>)}</details>
            <EntityTable
              rows={map.risk.map((r) => ({
                id: r.id,
                title: r.title,
                meta: `P × I = ${r.probability * r.impact} · ${displayLabel(locale, "riskStrategy", r.strategy)}`,
                owner: r.owner,
                status: displayLabel(locale, "riskStatus", r.status),
              }))}
              locale={locale}
              onEdit={(id) => onEdit("risk", id)}
              onDelete={(id) => archive(tab, id)}
            />
          </div>
          <div className="panel span-4">
            <h3>{ru ? "Матрица риска" : "Risk matrix"}</h3>
            <p className="muted compact">{ru ? "Вероятность: 5 сверху → 1 снизу. Влияние: 1 слева → 5 справа. Число — открытые риски." : "Probability: 5 at top → 1 at bottom. Impact: 1 left → 5 right. Count: open risks."}</p>
            <div className="risk-matrix">
              {Array.from({ length: 25 }, (_, i) => {
                const p = 5 - Math.floor(i / 5),
                  impact = (i % 5) + 1,
                  score = p * impact;
                return (
                  <div
                    role="img"
                    className={`risk-cell ${score >= 15 ? "risk-high" : score >= 8 ? "risk-mid" : "risk-low"}`}
                    key={i}
                    aria-label={`${ru ? "Вероятность" : "Probability"} ${p}, ${ru ? "влияние" : "impact"} ${impact}: ${map.risk.filter(r => r.status !== "closed" && r.probability === p && r.impact === impact).length}`}
                    title={`P${p} × I${impact}`}
                  >
                    {map.risk.filter(
                      (r) => r.status !== "closed" && r.probability === p && r.impact === impact,
                    ).length || ""}
                  </div>
                );
              })}
            </div>
            <p className="muted">
              {ru
                ? "Экспозиция риска помогает расставить приоритеты, но не делает исходные оценки точными."
                : "Exposure orders attention but cannot create input precision."}
            </p>
          </div>
        </div>
      )}
      {tab === "issue" && (
        <EntityTable
          rows={map.issue.map((x) => ({
            id: x.id,
            title: x.title,
            meta: `${ru ? "Влияние" : "Impact"} ${x.impact} · ${ru ? "Срочность" : "Urgency"} ${x.urgency} · ${x.dueDate}`,
            owner: x.owner,
            status: displayLabel(locale, "issueStatus", x.status),
            detail: x.plan,
          }))}
          locale={locale}
          onEdit={(id) => onEdit("issue", id)}
          onDelete={(id) => archive(tab, id)}
        />
      )}{" "}
      {tab === "assumption" && (
        <EntityTable
          rows={map.assumption.map((x) => ({
            id: x.id,
            title: x.text,
            meta: `${x.validationMethod} · ${x.validationDate}`,
            owner: x.owner,
            status: displayLabel(locale, "assumptionStatus", x.status),
            detail: x.effectIfFalse,
          }))}
          locale={locale}
          onEdit={(id) => onEdit("assumption", id)}
          onDelete={(id) => archive(tab, id)}
        />
      )}{" "}
      {tab === "decision" && (
        <EntityTable
          rows={map.decision.map((x) => ({
            id: x.id,
            title: x.question,
            meta: x.date,
            owner: x.owner,
            status: displayLabel(locale, "decisionStatus", x.status),
            detail: x.context,
          }))}
          locale={locale}
          onEdit={(id) => onEdit("decision", id)}
          onDelete={(id) => archive(tab, id)}
        />
      )}
    </>
  );
}
export function PeopleView({
  workspace,
  project,
  locale,
  onCreate,
  onEdit,
}: ViewProps) {
  const ru = locale === "ru",
    [tab, setTab] = useState("stakeholders"),
    stakeholders = workspace.stakeholders.filter(
      (x) => x.projectId === project.id,
    ),
    team = workspace.teamMembers.filter((x) => x.projectId === project.id),
    comms = workspace.communications.filter((x) => x.projectId === project.id),
    vendors = workspace.vendors.filter((x) => x.projectId === project.id);
  return (
    <>
      <div className="tabs">
        {[
          ["stakeholders", ru ? "Заинтересованные стороны" : "Stakeholders"],
          ["team", ru ? "Команда" : "Team"],
          ["communications", ru ? "Коммуникации" : "Communications"],
          ["vendors", ru ? "Поставщики" : "Vendors"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={tab === id ? "active" : ""}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "stakeholders" && (
        <>
          <button
            className="button primary section-action"
            onClick={() => onCreate("stakeholder")}
          >
            <Plus size={17} />
            {ru ? "Добавить заинтересованную сторону" : "Add stakeholder"}
          </button>
          <div className="dashboard-grid">
            <div className="panel span-8">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{ru ? "Заинтересованная сторона" : "Stakeholder"}</th>
                      <th>{ru ? "Роль" : "Role"}</th>
                      <th>I / I</th>
                      <th>{ru ? "Стратегия" : "Strategy"}</th>
                      <th>{ru ? "Владелец" : "Owner"}</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {stakeholders.map((x) => (
                      <tr key={x.id}>
                        <td>
                          <strong>{x.name}</strong>
                          <br />
                          <span className="muted">
                            {displayLabel(locale, "attitude", x.attitude)}
                          </span>
                        </td>
                        <td>{x.role}</td>
                        <td>
                          {x.influence} / {x.interest}
                        </td>
                        <td>{x.strategy}</td>
                        <td>{x.owner}</td>
                        <td>
                          <button
                            className="button small"
                            onClick={() => onEdit("stakeholder", x.id)}
                          >
                            {ru ? "Изменить" : "Edit"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="panel span-4">
              <h3>{ru ? "Влияние × интерес" : "Influence × Interest"}</h3>
              <div className="stakeholder-matrix">
                {stakeholders.map((x) => (
                  <span
                    key={x.id}
                    style={{
                      left: `${(x.influence - 1) * 23}%`,
                      bottom: `${(x.interest - 1) * 23}%`,
                    }}
                    title={x.name}
                  >
                    {x.name.slice(0, 2)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
      {tab === "team" && (
        <>
          <p className="muted">{ru ? "Число работ показывает ответственность, а не часы загрузки. Для процента загрузки нужны согласованные оценки и период; имя владельца должно совпадать с именем участника." : "Work counts show ownership, not hours of load. Capacity percentages require aligned estimates and a period; owner names must match team member names."}</p>
          <button
            className="button primary section-action"
            onClick={() => onCreate("team")}
          >
            <Plus size={17} />
            {ru ? "Добавить участника" : "Add member"}
          </button>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{ru ? "Участник" : "Member"}</th>
                  <th>{ru ? "Роль" : "Role"}</th>
                  <th>{ru ? "Ответственность" : "Responsibility"}</th>
                  <th>{ru ? "Мощность" : "Capacity"}</th>
                  <th>{ru ? "Назначено / блокеры" : "Assigned / blocked"}</th>
                  <th>{ru ? "Часовой пояс" : "Timezone"}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {team.map((x) => (
                  <tr key={x.id}>
                    <td>
                      <strong>{x.name}</strong>
                      <br />
                      <span className="muted">{x.skills.join(", ")}</span>
                    </td>
                    <td>{x.role}</td>
                    <td>{x.responsibility}</td>
                    <td>{x.weeklyCapacity} {ru ? "ч/нед." : "h/week"}</td>
                    <td>{workspace.workItems.filter(w => w.projectId === project.id && !w.archived && !w.done && w.owner === x.name).length} / {workspace.workItems.filter(w => w.projectId === project.id && !w.archived && !w.done && w.owner === x.name && w.blocked).length}</td>
                    <td>{x.timezone}</td>
                    <td>
                      <button
                        className="button small"
                        onClick={() => onEdit("team", x.id)}
                      >
                        {ru ? "Изменить" : "Edit"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {tab === "communications" && (
        <>
          <button
            className="button primary section-action"
            onClick={() => onCreate("communication")}
          >
            <Plus size={17} />
            {ru ? "Добавить план" : "Add plan"}
          </button>
          <EntityTable
            rows={comms.map((x) => ({
              id: x.id,
              title: `${x.audience} · ${x.purpose}`,
              meta: `${x.channel} · ${x.cadence}`,
              owner: x.owner,
              status: x.successSignal,
            }))}
            locale={locale}
            onEdit={(id) => onEdit("communication", id)}
          />
        </>
      )}{" "}
      {tab === "vendors" && (
        <>
          <button
            className="button primary section-action"
            onClick={() => onCreate("vendor")}
          >
            <Plus size={17} />
            {ru ? "Добавить поставщика" : "Add vendor"}
          </button>
          <EntityTable
            rows={vendors.map((x) => ({
              id: x.id,
              title: x.name,
              meta: `${x.scope} · ${formatMoney(locale, project.currency, x.cost)}`,
              owner: x.owner,
              status: displayLabel(locale, "vendorStatus", x.status),
              detail: x.reviewNotes,
            }))}
            locale={locale}
            onEdit={(id) => onEdit("vendor", id)}
          />
        </>
      )}
    </>
  );
}
export function FinanceView({
  workspace,
  project,
  locale,
  onCreate,
  onEdit,
}: ViewProps) {
  const ru = locale === "ru",
    rows = workspace.budgets.filter((x) => x.projectId === project.id),
    planned = rows.reduce((s, x) => s + x.planned, 0),
    actual = rows.reduce((s, x) => s + x.actual, 0),
    committed = rows.reduce((s, x) => s + x.committed, 0),
    forecast = rows.reduce(
      (s, x) => s + (x.forecast ?? x.actual + x.committed),
      0,
    ),
    variance = planned - forecast;
  return (
    <>
      <div className="metric-cards">
        <Metric
          name={ru ? "План" : "Baseline"}
          value={formatMoney(locale, project.currency, planned)}
        />
        <Metric
          name={ru ? "Факт" : "Actual"}
          value={formatMoney(locale, project.currency, actual)}
        />
        <Metric
          name={ru ? "Обязательства" : "Committed"}
          value={formatMoney(locale, project.currency, committed)}
        />
        <Metric
          name={ru ? "Отклонение прогноза" : "Forecast variance"}
          value={formatMoney(locale, project.currency, variance)}
          detail={
            variance < 0
              ? ru
                ? "прогноз перерасхода"
                : "forecast overrun"
              : ru
                ? "резерв"
                : "headroom"
          }
        />
      </div>
      <button
        className="button primary section-action"
        onClick={() => onCreate("budget")}
      >
        <Plus size={17} />
        {ru ? "Добавить статью" : "Add line"}
      </button>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{ru ? "Категория" : "Category"}</th>
              <th>{ru ? "План" : "Planned"}</th>
              <th>{ru ? "Факт" : "Actual"}</th>
              <th>{ru ? "Обязательства" : "Committed"}</th>
              <th>{ru ? "Прогноз" : "Forecast"}</th>
              <th>{ru ? "Отклонение" : "Variance"}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((x) => {
              const f = x.forecast ?? x.actual + x.committed;
              return (
                <tr key={x.id}>
                  <td>
                    <strong>{x.category}</strong>
                  </td>
                  <td>{formatMoney(locale, project.currency, x.planned)}</td>
                  <td>{formatMoney(locale, project.currency, x.actual)}</td>
                  <td>{formatMoney(locale, project.currency, x.committed)}</td>
                  <td>{formatMoney(locale, project.currency, f)}</td>
                  <td className={x.planned - f < 0 ? "bad-text" : "good-text"}>
                    {formatMoney(locale, project.currency, x.planned - f)}
                  </td>
                  <td>
                    <button
                      className="button small"
                      onClick={() => onEdit("budget", x.id)}
                    >
                      {ru ? "Изменить" : "Edit"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="callout">
        <AlertTriangle />
        <div>
          <strong>{ru ? "Финансовое правило" : "Financial rule"}</strong>
          <p>
            {ru
              ? "Факт показывает прошлое; обязательства и прогноз нужны для решения до возникновения перерасхода."
              : "Actual shows the past; committed and forecast enable action before an overrun occurs."}
          </p>
        </div>
      </div>
    </>
  );
}
export function ControlView({
  workspace,
  project,
  locale,
  onCreate,
  onChange,
  onEdit,
}: ViewProps) {
  const ru = locale === "ru",
    [tab, setTab] = useState("status"),
    items = workspace.workItems.filter(
      (x) => x.projectId === project.id && !x.archived,
    ),
    risks = workspace.risks.filter(
      (x) => x.projectId === project.id && x.status !== "closed",
    ),
    issues = workspace.issues.filter(
      (x) => x.projectId === project.id && x.status !== "closed",
    ),
    decisions = workspace.decisions.filter(
      (x) => x.projectId === project.id && x.status === "pending",
    ),
    changes = workspace.changes.filter((x) => x.projectId === project.id),
    quality = workspace.qualityGates.filter((x) => x.projectId === project.id),
    closure = workspace.closureRecords.find(
      (x) => x.projectId === project.id,
    ) ?? {
      projectId: project.id,
      finalAcceptance: false,
      handover: false,
      contractsAndBudget: false,
      remainingRisks: false,
      archiveAndEvidence: false,
      lessonsLearned: false,
      benefitsOwner: "",
      benefitsReviewDate: "",
      updatedAt: "",
    };
  const updateClosure = (patch: Partial<typeof closure>) =>
    onChange({
      ...workspace,
      closureRecords: [
        ...workspace.closureRecords.filter((x) => x.projectId !== project.id),
        { ...closure, ...patch, updatedAt: new Date().toISOString() },
      ],
    });
  const updateProject = (fd: FormData) => {
    const val = (key: string) => String(fd.get(key) ?? "").trim();
    onChange({
      ...workspace,
      projects: workspace.projects.map((p) =>
        p.id === project.id
          ? {
              ...p,
              purpose: val("purpose"),
              objective: val("objective"),
              owner: val("owner"),
              sponsor: val("sponsor"),
              scopeIn: val("scopeIn"),
              scopeOut: val("scopeOut"),
              constraints: val("constraints"),
              definitionOfDone: val("definitionOfDone"),
              successMeasures: val("successMeasures")
                .split("\n")
                .map((x) => x.trim())
                .filter(Boolean),
            }
          : p,
      ),
    });
  };
  return (
    <>
      <div className="tabs">
        {[
          ["status", ru ? "Статус" : "Status"],
          ["charter", ru ? "Устав" : "Charter"],
          ["change", ru ? "Изменения" : "Change"],
          ["quality", ru ? "Качество" : "Quality"],
          ["closure", ru ? "Закрытие" : "Closure"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={tab === id ? "active" : ""}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "status" && (
        <article className="panel print-sheet">
          <div className="section-line">
            <div>
              <p className="eyebrow">{new Date().toLocaleDateString(locale)}</p>
              <h2>{project.name}</h2>
            </div>
            <button className="button primary" onClick={() => onChange(generateStatusDraft(workspace,project.id,locale))}>{ru ? "Сформировать черновик статуса" : "Generate status report draft"}</button>
            <button className="button" onClick={() => window.print()}>
              {ru ? "Печать / PDF" : "Print / PDF"}
            </button>
          </div>
          <p className={`status ${healthClass(project.health.schedule)}`}>
            {displayLabel(locale, "health", project.health.schedule)}
          </p>
          <div className="dashboard-grid">
            <ReportBlock
              title={ru ? "Завершено" : "Accomplishments"}
              rows={items
                .filter((x) => x.done)
                .slice(-5)
                .map((x) => x.title)}
            />
            <ReportBlock
              title={ru ? "В работе" : "Current work"}
              rows={items
                .filter((x) => ["in-progress", "review"].includes(x.status))
                .map((x) => x.title)}
            />
            <ReportBlock
              title={ru ? "Риски и проблемы" : "Risks and issues"}
              rows={[...risks, ...issues].map((x) => x.title)}
            />
            <ReportBlock
              title={ru ? "Нужны решения" : "Decisions needed"}
              rows={decisions.map((x) => `${x.question} · ${x.owner}`)}
            />
          </div>
        </article>
      )}
      {tab === "charter" && (
        <form action={updateProject} className="panel form-grid">
          <h2 className="wide">
            {ru ? "Редактируемый устав" : "Editable charter"}
          </h2>
          <TextArea
            name="purpose"
            label={ru ? "Назначение / проблема" : "Purpose / problem"}
            value={project.purpose}
          />
          <TextArea
            name="objective"
            label={ru ? "Измеримый результат" : "Measurable outcome"}
            value={project.objective}
          />
          <Field
            name="owner"
            label={ru ? "Руководитель проекта" : "Project lead"}
            value={project.owner}
          />
          <Field
            name="sponsor"
            label={ru ? "Спонсор" : "Sponsor"}
            value={project.sponsor}
          />
          <TextArea
            name="scopeIn"
            label={ru ? "В границах проекта" : "In scope"}
            value={project.scopeIn}
          />
          <TextArea
            name="scopeOut"
            label={ru ? "Вне границ проекта" : "Out of scope"}
            value={project.scopeOut}
          />
          <TextArea
            name="constraints"
            label={
              ru ? "Ограничения и допущения" : "Constraints and assumptions"
            }
            value={project.constraints}
          />
          <TextArea
            name="definitionOfDone"
            label={ru ? "Критерии готовности" : "Definition of Done"}
            value={project.definitionOfDone}
          />
          <TextArea
            name="successMeasures"
            label={
              ru
                ? "Метрики успеха — по строке"
                : "Success measures — one per line"
            }
            value={project.successMeasures.join("\n")}
          />
          <div className="wide">
            <button className="button primary" type="submit">
              {ru ? "Сохранить устав" : "Save charter"}
            </button>
          </div>
        </form>
      )}
      {tab === "change" && (
        <>
          <button
            className="button primary section-action"
            onClick={() => onCreate("change")}
          >
            <Plus size={17} />
            {ru ? "Создать запрос на изменение" : "Create change request"}
          </button>
          <EntityTable
            rows={changes.map((x) => ({
              id: x.id,
              title: x.change,
              meta: `${x.scopeImpact} · ${x.scheduleImpact} · ${x.costImpact}`,
              owner: x.approver || x.requester,
              status: displayLabel(locale, "changeStatus", x.status),
              detail: x.recommendation,
            }))}
            locale={locale}
            onEdit={(id) => onEdit("change", id)}
          />
        </>
      )}
      {tab === "quality" && (
        <>
          <div className="metric-cards">
            <Metric
              name={ru ? "Покрытие критериями приёмки" : "Acceptance coverage"}
              value={`${Math.round((items.filter((x) => x.acceptanceCriteria.length).length / Math.max(1, items.length)) * 100)}%`}
            />
            <Metric
              name={ru ? "Проверки качества" : "Quality gates"}
              value={`${quality.filter((x) => x.status === "passed").length}/${quality.length}`}
            />
            <Metric
              name={ru ? "Заблокировано" : "Blocked"}
              value={String(items.filter((x) => x.blocked && !x.done).length)}
            />
            <Metric
              name={ru ? "Открытые проблемы" : "Open issues"}
              value={String(issues.length)}
            />
          </div>
          <button
            className="button primary section-action"
            onClick={() => onCreate("quality")}
          >
            <Plus size={17} />
            {ru ? "Добавить контроль качества" : "Add quality gate"}
          </button>
          <EntityTable
            rows={quality.map((x) => ({
              id: x.id,
              title: x.title,
              meta: `${x.criteria.length} ${ru ? "критериев" : "criteria"} · ${x.dueDate}`,
              owner: x.owner,
              status: displayLabel(locale, "qualityStatus", x.status),
              detail: x.evidence,
            }))}
            locale={locale}
            onEdit={(id) => onEdit("quality", id)}
          />
        </>
      )}
      {tab === "closure" && (
        <div className="panel">
          <h2>{ru ? "Закрытие проекта" : "Project closure"}</h2>
          <ul className="check-list">
            {(
              [
                [
                  "finalAcceptance",
                  ru
                    ? "Финальная приёмка подтверждена"
                    : "Final acceptance confirmed",
                ],
                [
                  "handover",
                  ru
                    ? "Ответственность и доступы переданы"
                    : "Ownership and access transferred",
                ],
                [
                  "contractsAndBudget",
                  ru
                    ? "Договоры и бюджет закрыты"
                    : "Contracts and budget closed",
                ],
                [
                  "remainingRisks",
                  ru ? "Открытые риски переданы" : "Open risks transferred",
                ],
                [
                  "archiveAndEvidence",
                  ru
                    ? "Архив и подтверждения сохранены"
                    : "Archive and evidence retained",
                ],
                [
                  "lessonsLearned",
                  ru
                    ? "Извлечённые уроки сформулированы"
                    : "Lessons learned captured",
                ],
              ] as const
            ).map(([key, label]) => (
              <li key={key}>
                <input
                  type="checkbox"
                  id={`closure-${key}`}
                  checked={closure[key]}
                  onChange={(event) =>
                    updateClosure({ [key]: event.target.checked })
                  }
                />
                <label htmlFor={`closure-${key}`}>{label}</label>
              </li>
            ))}
          </ul>
          <div className="form-grid closure-fields">
            <div className="field">
              <label htmlFor="closure-benefits-owner">
                {ru ? "Владелец оценки выгод" : "Benefits owner"}
              </label>
              <input
                id="closure-benefits-owner"
                value={closure.benefitsOwner}
                onChange={(event) =>
                  updateClosure({ benefitsOwner: event.target.value })
                }
              />
            </div>
            <div className="field">
              <label htmlFor="closure-benefits-date">
                {ru ? "Дата оценки выгод" : "Benefits review date"}
              </label>
              <input
                id="closure-benefits-date"
                type="date"
                value={closure.benefitsReviewDate}
                onChange={(event) =>
                  updateClosure({ benefitsReviewDate: event.target.value })
                }
              />
            </div>
          </div>
          <p className="muted">
            {ru
              ? "Завершение работ не означает получение выгод. Ответственность за измерение сохраняется после закрытия проекта."
              : "Delivery completion does not mean benefits realization. Measurement ownership continues after project closure."}
          </p>
        </div>
      )}
    </>
  );
}
export function DocumentsView({
  workspace,
  project,
  locale,
  onCreate,
  onEdit,
}: ViewProps) {
  const ru = locale === "ru",
    rows = workspace.documents.filter((x) => x.projectId === project.id);
  return (
    <>
      <button
        className="button primary section-action"
        onClick={() => onCreate("document")}
      >
        <Plus size={17} />
        {ru ? "Создать документ" : "Create document"}
      </button>
      <div className="catalog-grid inline-grid">
        {rows.map((x) => (
          <article className="catalog-card" key={x.id}>
            <FileText size={22} />
            <p className="eyebrow">{x.type.startsWith("template:") ? (ru ? "Шаблон" : "Template") : ({charter: ru ? "Устав" : "Charter", note: ru ? "Заметка" : "Note"}[x.type] ?? x.type)}</p>
            <h3>{x.title}</h3>
            <p>
              {x.body.replaceAll("#", "").slice(0, 180) ||
                (ru ? "Пустой документ" : "Empty document")}
            </p>
            <div className="card-foot">
              <span className="muted">
                {new Date(x.updatedAt).toLocaleDateString(locale)}
              </span>
              <div className="button-row">
                <button
                  className="button small"
                  onClick={() => onEdit("document", x.id)}
                >
                  {ru ? "Открыть / изменить" : "Open / edit"}
                </button>
                <button
                  className="button small"
                  onClick={() => download(`${x.title}.md`, x.body)}
                >
                  Markdown
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
export function EntityTable({
  rows,
  locale,
  onEdit,
  onDelete,
}: {
  rows: {
    id: string;
    title: string;
    meta: string;
    owner?: string;
    status: string;
    detail?: string;
  }[];
  locale: Locale;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  const ru = locale === "ru";
  if (!rows.length)
    return (
      <div className="empty-state panel">
        <FileText />
        <h3>{ru ? "Записей пока нет" : "No records yet"}</h3>
        <p>
          {ru
            ? "Добавьте только то, что меняет решение, снижает риск или подтверждает результат."
            : "Add only what changes a decision, reduces risk, or verifies an outcome."}
        </p>
      </div>
    );
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>{ru ? "Содержание" : "Record"}</th>
            <th>{ru ? "Владелец" : "Owner"}</th>
            <th>{ru ? "Статус" : "Status"}</th>
            {(onEdit || onDelete) && <th>{ru ? "Действия" : "Actions"}</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((x) => (
            <tr key={x.id}>
              <td>{x.id}</td>
              <td>
                <strong>{x.title}</strong>
                <br />
                <span className="muted">{x.meta}</span>
                {x.detail && (
                  <>
                    <br />
                    <small>{x.detail}</small>
                  </>
                )}
              </td>
              <td>{x.owner || "—"}</td>
              <td>{x.status}</td>
              {(onEdit || onDelete) && (
                <td>
                  <div className="button-row">
                    {onEdit && (
                      <button
                        className="button small"
                        onClick={() => onEdit(x.id)}
                      >
                        {ru ? "Изменить" : "Edit"}
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className="icon-button"
                        onClick={() => {
                          if (
                            window.confirm(
                              ru
                                ? `Удалить «${x.title}»? Это действие нельзя отменить.`
                                : `Delete “${x.title}”? This cannot be undone.`,
                            )
                          )
                            onDelete(x.id);
                        }}
                        aria-label={`${ru ? "Удалить" : "Delete"} ${x.title}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Metric({
  name,
  value,
  detail,
}: {
  name: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="metric-card">
      <small>{name}</small>
      <strong>{value}</strong>
      {detail && <span className="muted">{detail}</span>}
    </div>
  );
}
function ReportBlock({ title, rows }: { title: string; rows: string[] }) {
  return (
    <section className="panel span-6">
      <h3>{title}</h3>
      {rows.length ? (
        <ul>
          {rows.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      ) : (
        <p className="muted">—</p>
      )}
    </section>
  );
}
function Field({
  name,
  label,
  value,
}: {
  name: string;
  label: string;
  value: string;
}) {
  return (
    <div className="field">
      <label htmlFor={`charter-${name}`}>{label}</label>
      <input id={`charter-${name}`} name={name} defaultValue={value} />
    </div>
  );
}
function TextArea({
  name,
  label,
  value,
}: {
  name: string;
  label: string;
  value: string;
}) {
  return (
    <div className="field wide">
      <label htmlFor={`charter-${name}`}>{label}</label>
      <textarea id={`charter-${name}`} name={name} defaultValue={value} />
    </div>
  );
}
export { CommandMenu as CommandPalette } from "./command-menu";
