"use client";
import { useId } from "react";
import { X } from "lucide-react";
import type { Locale, Workspace, WorkItem } from "@/domain/schemas";
import {
  governanceLevel,
  scoreApproaches,
  type Context,
} from "@/domain/method-fit";
import type { CreateType } from "./workspace-types";
import { displayLabel } from "@/content/workspace-i18n";
const titles: Record<
  CreateType,
  {
    ru: string;
    en: string;
  }
> = {
  work: { ru: "Новый рабочий элемент", en: "New work item" },
  risk: { ru: "Новый риск", en: "New risk" },
  issue: { ru: "Новая проблема", en: "New issue" },
  decision: { ru: "Новое решение", en: "New decision" },
  assumption: { ru: "Новое допущение", en: "New assumption" },
  milestone: { ru: "Новая контрольная точка", en: "New milestone" },
  dependency: { ru: "Новая зависимость", en: "New dependency" },
  stakeholder: { ru: "Новая заинтересованная сторона", en: "New stakeholder" },
  budget: { ru: "Новая статья бюджета", en: "New budget line" },
  document: { ru: "Новый документ", en: "New document" },
  team: { ru: "Новый участник команды", en: "New team member" },
  communication: {
    ru: "Новый план коммуникации",
    en: "New communication plan",
  },
  change: { ru: "Новый запрос на изменение", en: "New change request" },
  quality: { ru: "Новый контроль качества", en: "New quality gate" },
  meeting: { ru: "Новая встреча", en: "New meeting" },
  vendor: { ru: "Новый поставщик", en: "New vendor" },
  objective: { ru: "Новый измеримый результат / KPI", en: "New outcome / KPI" },
  iteration: { ru: "Новая итерация", en: "New iteration" },
  project: { ru: "Создать проект", en: "Create project" },
};
const uid = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const number = (fd: FormData, key: string, fallback = 0) => {
  const raw = fd.get(key);
  if (raw === null || raw === "") return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const lines = (value: string) =>
  value
    .split(/\n|,/)
    .map((x) => x.trim())
    .filter(Boolean);
export function WorkspaceDialog({
  type,
  locale,
  workspace,
  projectId,
  onClose,
  onCommit,
}: {
  type: CreateType;
  locale: Locale;
  workspace: Workspace;
  projectId: string;
  onClose: () => void;
  onCommit: (workspace: Workspace, projectId?: string) => void;
}) {
  const ru = locale === "ru",
    prefix = useId(),
    today = new Date().toISOString().slice(0, 10),
    label = titles[type][locale];
  const field = (
    name: string,
    labelText: string,
    kind: "text" | "textarea" | "date" | "number" = "text",
    required = false,
  ) => {
    const id = `${prefix}-${name}`;
    return (
      <div className={`field ${kind === "textarea" ? "wide" : ""}`}>
        <label htmlFor={id}>{labelText}</label>
        {kind === "textarea" ? (
          <textarea id={id} name={name} required={required} />
        ) : (
          <input id={id} name={name} type={kind} required={required} />
        )}
      </div>
    );
  };
  const submit = (fd: FormData) => {
    const at = new Date().toISOString(),
      title = text(fd, "title"),
      owner = text(fd, "owner"),
      description = text(fd, "description"),
      due = text(fd, "dueDate") || today;
    let next = { ...workspace };
    const activity = (message: string) => ({
      id: uid("ACT"),
      projectId,
      at,
      type,
      message,
    });
    if (type === "project") {
      if (!title) return;
      const read = (key: keyof Context) => number(fd, key, 3);
      const context: Context = {
        uncertainty: read("uncertainty"),
        volatility: read("volatility"),
        feedback: read("feedback"),
        frequency: read("frequency"),
        compliance: read("compliance"),
        dependencies: read("dependencies"),
        autonomy: read("autonomy"),
        scopeRigidity: read("scopeRigidity"),
        deadlineRigidity: read("deadlineRigidity"),
        stakeholders: read("stakeholders"),
      };
      const fit = scoreApproaches(context)[0]!.approach.toLowerCase();
      const approach =
        fit === "adaptive"
          ? "adaptive"
          : fit === "predictive"
            ? "predictive"
            : fit === "flow"
              ? "flow"
              : "hybrid";
      const governance = governanceLevel(context).toLowerCase() as
        "lightweight" | "standard" | "controlled";
      const id = uid("project");
      next = {
        ...workspace,
        projects: [
          ...workspace.projects,
          {
            id,
            name: title,
            status: "active",
            owner,
            sponsor: text(fd, "sponsor"),
            approach,
            governance,
            type: (text(fd, "projectType") ||
              "general") as Workspace["projects"][number]["type"],
            startDate: today,
            targetDate: due,
            purpose: description,
            objective: text(fd, "objective"),
            successMeasures: lines(text(fd, "successMeasures")),
            health: {
              schedule: "unknown",
              scope: "unknown",
              budget: "unknown",
              risks: "unknown",
              blockers: "green",
              capacity: "unknown",
              alignment: "unknown",
            },
            demo: false,
            currency: text(fd, "currency") || "USD",
            scopeIn: text(fd, "scopeIn"),
            scopeOut: text(fd, "scopeOut"),
            constraints: text(fd, "constraints"),
            definitionOfDone: text(fd, "definitionOfDone"),
          },
        ],
        projectSettings: [
          ...workspace.projectSettings,
          {
            projectId: id,
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
            wipLimits: { "in-progress": 3, review: 2 },
            governance,
            probabilityScale: 5,
            impactScale: 5,
          },
        ],
        activities: [
          ...workspace.activities,
          {
            id: uid("ACT"),
            projectId: id,
            at,
            type: "project",
            message: ru ? "Проект создан" : "Project created",
          },
        ],
      };
      onCommit(next, id);
      onClose();
      return;
    }
    if (type === "work")
      next = {
        ...workspace,
        workItems: [
          ...workspace.workItems,
          {
            id: uid("WI"),
            projectId,
            title,
            description,
            type: (text(fd, "workType") || "task") as WorkItem["type"],
            status: "backlog",
            priority: (text(fd, "priority") ||
              "medium") as WorkItem["priority"],
            owner,
            contributors: [],
            labels: lines(text(fd, "labels")),
            startDate: text(fd, "startDate") || undefined,
            dueDate: due || undefined,
            estimate: number(fd, "estimate", 0) || undefined,
            dependencies: [],
            acceptanceCriteria: lines(text(fd, "acceptance")),
            done: false,
            blocked: false,
            riskIds: [],
            objectiveIds: [],
            order: workspace.workItems.length,
            createdAt: at,
            updatedAt: at,
            archived: false,
          },
        ],
        activities: [
          ...workspace.activities,
          activity(
            `${ru ? "Создан рабочий элемент" : "Created item"}: ${title}`,
          ),
        ],
      };
    if (type === "risk")
      next = {
        ...workspace,
        risks: [
          ...workspace.risks,
          {
            id: uid("R"),
            projectId,
            title,
            category: text(fd, "category") || "General",
            description,
            probability: Math.max(1, Math.min(5, number(fd, "probability", 3))),
            impact: Math.max(1, Math.min(5, number(fd, "impact", 3))),
            owner,
            strategy: "mitigate",
            actions: text(fd, "actions"),
            trigger: text(fd, "trigger"),
            reviewDate: due,
            status: "open",
          },
        ],
        activities: [
          ...workspace.activities,
          activity(`${ru ? "Создан риск" : "Created risk"}: ${title}`),
        ],
      };
    if (type === "issue")
      next = {
        ...workspace,
        issues: [
          ...workspace.issues,
          {
            id: uid("I"),
            projectId,
            title,
            description,
            impact: Math.max(1, Math.min(5, number(fd, "impact", 3))),
            urgency: Math.max(1, Math.min(5, number(fd, "urgency", 3))),
            owner,
            plan: text(fd, "actions"),
            dueDate: due,
            escalation: text(fd, "escalation"),
            relatedWorkIds: [],
            status: "open",
          },
        ],
        activities: [
          ...workspace.activities,
          activity(`${ru ? "Создана проблема" : "Created issue"}: ${title}`),
        ],
      };
    if (type === "decision")
      next = {
        ...workspace,
        decisions: [
          ...workspace.decisions,
          {
            id: uid("D"),
            projectId,
            question: title,
            context: description,
            alternatives: lines(text(fd, "alternatives")),
            criteria: lines(text(fd, "criteria")),
            decision: "",
            rationale: "",
            owner,
            date: due,
            participants: [],
            consequences: text(fd, "consequences"),
            revisitTrigger: "",
            status: "pending",
          },
        ],
        activities: [
          ...workspace.activities,
          activity(
            `${ru ? "Запрошено решение" : "Decision requested"}: ${title}`,
          ),
        ],
      };
    if (type === "assumption")
      next = {
        ...workspace,
        assumptions: [
          ...workspace.assumptions,
          {
            id: uid("A"),
            projectId,
            text: title,
            rationale: description,
            owner,
            validationMethod: text(fd, "method"),
            validationDate: due,
            status: "untested",
            effectIfFalse: text(fd, "consequences"),
          },
        ],
        activities: [
          ...workspace.activities,
          activity(
            `${ru ? "Добавлено допущение" : "Assumption added"}: ${title}`,
          ),
        ],
      };
    if (type === "milestone")
      next = {
        ...workspace,
        milestones: [
          ...workspace.milestones,
          {
            id: uid("M"),
            projectId,
            title,
            date: due,
            status: "planned",
            progress: 0,
          },
        ],
        activities: [
          ...workspace.activities,
          activity(
            `${ru ? "Добавлена контрольная точка" : "Milestone added"}: ${title}`,
          ),
        ],
      };
    if (type === "dependency") {
      const predecessorId = text(fd, "predecessorId"),
        successorId = text(fd, "successorId");
      const known = new Set(
        workspace.workItems
          .filter((item) => item.projectId === projectId)
          .map((item) => item.id),
      );
      if (
        !known.has(predecessorId) ||
        !known.has(successorId) ||
        predecessorId === successorId
      )
        return;
      const edges = [
        ...workspace.dependencies
          .filter((item) => item.projectId === projectId)
          .map((item) => [item.predecessorId, item.successorId] as const),
        [predecessorId, successorId] as const,
      ];
      const reachable = (
        from: string,
        target: string,
        seen = new Set<string>(),
      ): boolean =>
        from === target ||
        (!seen.has(from) &&
          (seen.add(from),
          edges
            .filter(([start]) => start === from)
            .some(([, end]) => reachable(end, target, seen))));
      if (reachable(successorId, predecessorId)) return;
      next = {
        ...workspace,
        dependencies: [
          ...workspace.dependencies,
          {
            id: uid("DEP"),
            projectId,
            predecessorId,
            successorId,
            type: (text(fd, "dependencyType") ||
              "FS") as Workspace["dependencies"][number]["type"],
            lag: number(fd, "lag"),
            owner,
            dueDate: due,
            status: "open",
          },
        ],
        activities: [
          ...workspace.activities,
          activity(
            `${ru ? "Добавлена зависимость" : "Dependency added"}: ${predecessorId} → ${successorId}`,
          ),
        ],
      };
    }
    if (type === "stakeholder")
      next = {
        ...workspace,
        stakeholders: [
          ...workspace.stakeholders,
          {
            id: uid("S"),
            projectId,
            name: title,
            role: description,
            influence: Math.max(1, Math.min(5, number(fd, "influence", 3))),
            interest: Math.max(1, Math.min(5, number(fd, "interest", 3))),
            attitude: "neutral",
            expectations: text(fd, "expectations"),
            communicationNeeds: text(fd, "communication"),
            owner,
            strategy: text(fd, "strategy"),
          },
        ],
        activities: [
          ...workspace.activities,
          activity(
            `${ru ? "Добавлена заинтересованная сторона" : "Stakeholder added"}: ${title}`,
          ),
        ],
      };
    if (type === "budget")
      next = {
        ...workspace,
        budgets: [
          ...workspace.budgets,
          {
            id: uid("B"),
            projectId,
            category: title,
            planned: number(fd, "planned"),
            actual: number(fd, "actual"),
            committed: number(fd, "committed"),
            forecast: number(fd, "forecast") || undefined,
          },
        ],
        activities: [
          ...workspace.activities,
          activity(
            `${ru ? "Добавлена статья бюджета" : "Budget line added"}: ${title}`,
          ),
        ],
      };
    if (type === "document")
      next = {
        ...workspace,
        documents: [
          ...workspace.documents,
          {
            id: uid("DOC"),
            projectId,
            title,
            type: text(fd, "documentType") || "note",
            body: description,
            relatedIds: [],
            updatedAt: at,
          },
        ],
        activities: [
          ...workspace.activities,
          activity(`${ru ? "Создан документ" : "Document created"}: ${title}`),
        ],
      };
    if (type === "team")
      next = {
        ...workspace,
        teamMembers: [
          ...workspace.teamMembers,
          {
            id: uid("TM"),
            projectId,
            name: title,
            role: description,
            responsibility: text(fd, "responsibility"),
            weeklyCapacity: number(fd, "capacity", 40),
            timezone: text(fd, "timezone") || "UTC",
            skills: lines(text(fd, "skills")),
          },
        ],
        activities: [
          ...workspace.activities,
          activity(
            `${ru ? "Добавлен участник" : "Team member added"}: ${title}`,
          ),
        ],
      };
    if (type === "communication")
      next = {
        ...workspace,
        communications: [
          ...workspace.communications,
          {
            id: uid("COM"),
            projectId,
            audience: title,
            purpose: description,
            channel: text(fd, "channel"),
            cadence: text(fd, "cadence"),
            owner,
            successSignal: text(fd, "successSignal"),
          },
        ],
        activities: [
          ...workspace.activities,
          activity(
            `${ru ? "Добавлен план коммуникации" : "Communication plan added"}: ${title}`,
          ),
        ],
      };
    if (type === "change")
      next = {
        ...workspace,
        changes: [
          ...workspace.changes,
          {
            id: uid("CR"),
            projectId,
            change: title,
            requester: owner,
            reason: description,
            scopeImpact: text(fd, "scopeImpact"),
            scheduleImpact: text(fd, "scheduleImpact"),
            costImpact: text(fd, "costImpact"),
            riskImpact: text(fd, "riskImpact"),
            qualityImpact: text(fd, "qualityImpact"),
            alternatives: text(fd, "alternatives"),
            recommendation: text(fd, "recommendation"),
            decision: "",
            approver: text(fd, "approver"),
            status: "assessing",
          },
        ],
        activities: [
          ...workspace.activities,
          activity(
            `${ru ? "Создан запрос на изменение" : "Change request created"}: ${title}`,
          ),
        ],
      };
    if (type === "quality")
      next = {
        ...workspace,
        qualityGates: [
          ...workspace.qualityGates,
          {
            id: uid("QG"),
            projectId,
            title,
            criteria: lines(text(fd, "criteria")),
            owner,
            dueDate: due,
            status: "planned",
            evidence: text(fd, "evidence"),
          },
        ],
        activities: [
          ...workspace.activities,
          activity(
            `${ru ? "Добавлен контроль качества" : "Quality gate added"}: ${title}`,
          ),
        ],
      };
    if (type === "meeting")
      next = {
        ...workspace,
        meetings: [
          ...workspace.meetings,
          {
            id: uid("MEET"),
            projectId,
            title,
            date: due,
            attendees: lines(text(fd, "attendees")),
            agenda: lines(description),
            notes: "",
            outputs: [],
          },
        ],
        activities: [
          ...workspace.activities,
          activity(
            `${ru ? "Запланирована встреча" : "Meeting scheduled"}: ${title}`,
          ),
        ],
      };
    if (type === "vendor")
      next = {
        ...workspace,
        vendors: [
          ...workspace.vendors,
          {
            id: uid("V"),
            projectId,
            name: title,
            scope: description,
            owner,
            deliverables: lines(text(fd, "deliverables")),
            milestones: [],
            cost: number(fd, "cost"),
            status: "active",
            riskIds: [],
            dependencyIds: [],
            reviewNotes: text(fd, "notes"),
          },
        ],
        activities: [
          ...workspace.activities,
          activity(`${ru ? "Добавлен поставщик" : "Vendor added"}: ${title}`),
        ],
      };
    if (type === "objective")
      next = {
        ...workspace,
        objectives: [
          ...workspace.objectives,
          {
            id: uid("O"),
            projectId,
            description: title,
            type: (text(fd, "objectiveType") ||
              "outcome") as Workspace["objectives"][number]["type"],
            baseline: text(fd, "baseline"),
            target: text(fd, "target"),
            measure: description,
            dueDate: due,
            owner,
            deliverableIds: [],
            status: "tracking",
          },
        ],
        activities: [
          ...workspace.activities,
          activity(
            `${ru ? "Добавлен измеримый результат" : "Outcome added"}: ${title}`,
          ),
        ],
      };
    if (type === "iteration")
      next = {
        ...workspace,
        iterations: [
          ...workspace.iterations,
          {
            id: uid("IT"),
            projectId,
            title,
            goal: description,
            startDate: text(fd, "startDate") || today,
            endDate: due,
            capacity: number(fd, "capacity"),
            workItemIds: [],
            status: "planned",
          },
        ],
        activities: [
          ...workspace.activities,
          activity(
            `${ru ? "Добавлена итерация" : "Iteration added"}: ${title}`,
          ),
        ],
      };
    onCommit(next);
    onClose();
  };
  const workOptions = workspace.workItems.filter(
    (item) => item.projectId === projectId && !item.archived,
  );
  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${prefix}-heading`}
      >
        <div className="page-title">
          <h2 id={`${prefix}-heading`}>{label}</h2>
          <button
            className="button small"
            onClick={onClose}
            aria-label={ru ? "Закрыть" : "Close"}
          >
            <X size={18} />
          </button>
        </div>
        <form action={submit} className="form-grid">
          {type !== "dependency" &&
            field(
              "title",
              type === "decision"
                ? ru
                  ? "Вопрос"
                  : "Question"
                : type === "objective"
                  ? ru
                    ? "Измеримый результат / KPI"
                    : "Outcome / KPI"
                  : type === "communication"
                    ? ru
                      ? "Аудитория"
                      : "Audience"
                    : ru
                      ? "Название"
                      : "Title",
              "text",
              true,
            )}
          {!["budget", "team", "milestone", "dependency", "quality"].includes(
            type,
          ) &&
            field(
              "description",
              type === "meeting"
                ? ru
                  ? "Повестка — один вопрос на строку"
                  : "Agenda — one question per line"
                : ru
                  ? "Контекст / описание"
                  : "Context / description",
              "textarea",
            )}
          {[
            "work",
            "risk",
            "issue",
            "decision",
            "assumption",
            "stakeholder",
            "team",
            "communication",
            "vendor",
            "objective",
            "quality",
            "dependency",
            "project",
          ].includes(type) &&
            field(
              "owner",
              type === "project"
                ? ru
                  ? "Руководитель проекта"
                  : "Project lead"
                : ru
                  ? "Владелец"
                  : "Owner",
            )}
          {[
            "work",
            "risk",
            "issue",
            "decision",
            "assumption",
            "milestone",
            "objective",
            "iteration",
            "quality",
            "dependency",
            "project",
            "meeting",
          ].includes(type) &&
            field(
              "dueDate",
              type === "project"
                ? ru
                  ? "Целевая дата"
                  : "Target date"
                : ru
                  ? "Срок / дата пересмотра"
                  : "Due / review date",
              "date",
            )}
          {type === "work" && (
            <>
              <div className="field">
                <label htmlFor={`${prefix}-workType`}>
                  {ru ? "Тип" : "Type"}
                </label>
                <select id={`${prefix}-workType`} name="workType">
                  {(
                    [
                      "task",
                      "story",
                      "feature",
                      "deliverable",
                      "bug",
                      "spike",
                    ] as const
                  ).map((value) => (
                    <option value={value} key={value}>
                      {displayLabel(locale, "workType", value)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor={`${prefix}-priority`}>
                  {ru ? "Приоритет" : "Priority"}
                </label>
                <select id={`${prefix}-priority`} name="priority">
                  {(["medium", "high", "critical", "low"] as const).map(
                    (value) => (
                      <option value={value} key={value}>
                        {displayLabel(locale, "priority", value)}
                      </option>
                    ),
                  )}
                </select>
              </div>
              {field("startDate", ru ? "Начало" : "Start", "date")}
              {field(
                "estimate",
                ru ? "Оценка трудоёмкости" : "Effort estimate",
                "number",
              )}
              {field(
                "acceptance",
                ru
                  ? "Критерии приёмки — по строке"
                  : "Acceptance criteria — one per line",
                "textarea",
              )}
            </>
          )}
          {type === "risk" && (
            <>
              {field("category", ru ? "Категория" : "Category")}
              {field(
                "probability",
                ru ? "Вероятность 1–5" : "Probability 1–5",
                "number",
              )}
              {field("impact", ru ? "Влияние 1–5" : "Impact 1–5", "number")}
              {field("trigger", ru ? "Триггер" : "Trigger")}
              {field(
                "actions",
                ru ? "Меры реагирования" : "Response actions",
                "textarea",
              )}
            </>
          )}
          {type === "dependency" && (
            <>
              <div className="field">
                <label htmlFor={`${prefix}-predecessorId`}>
                  {ru ? "Предшественник" : "Predecessor"}
                </label>
                <select
                  id={`${prefix}-predecessorId`}
                  name="predecessorId"
                  required
                >
                  {workOptions.map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.id} · {item.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor={`${prefix}-successorId`}>
                  {ru ? "Последователь" : "Successor"}
                </label>
                <select
                  id={`${prefix}-successorId`}
                  name="successorId"
                  required
                >
                  {workOptions.map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.id} · {item.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor={`${prefix}-dependencyType`}>
                  {ru ? "Тип связи" : "Relationship type"}
                </label>
                <select id={`${prefix}-dependencyType`} name="dependencyType">
                  {["FS", "SS", "FF", "SF"].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </div>
              {field("lag", ru ? "Сдвиг, дней" : "Lag, days", "number")}
            </>
          )}
          {type === "issue" && (
            <>
              {field("impact", ru ? "Влияние 1–5" : "Impact 1–5", "number")}
              {field("urgency", ru ? "Срочность 1–5" : "Urgency 1–5", "number")}
              {field(
                "actions",
                ru ? "План восстановления" : "Recovery plan",
                "textarea",
              )}
              {field("escalation", ru ? "Эскалация" : "Escalation")}
            </>
          )}
          {type === "decision" && (
            <>
              {field(
                "alternatives",
                ru ? "Альтернативы — по строке" : "Alternatives — one per line",
                "textarea",
              )}
              {field(
                "criteria",
                ru ? "Критерии — по строке" : "Criteria — one per line",
                "textarea",
              )}
              {field(
                "consequences",
                ru
                  ? "Последствие отсутствия решения"
                  : "Consequence of no decision",
                "textarea",
              )}
            </>
          )}
          {type === "assumption" && (
            <>
              {field("method", ru ? "Как проверить" : "Validation method")}
              {field(
                "consequences",
                ru ? "Что будет, если неверно" : "Effect if false",
                "textarea",
              )}
            </>
          )}
          {type === "stakeholder" && (
            <>
              {field(
                "influence",
                ru ? "Влияние 1–5" : "Influence 1–5",
                "number",
              )}
              {field("interest", ru ? "Интерес 1–5" : "Interest 1–5", "number")}
              {field("expectations", ru ? "Ожидания" : "Expectations")}
              {field("communication", ru ? "Коммуникация" : "Communication")}
              {field(
                "strategy",
                ru ? "Стратегия вовлечения" : "Engagement strategy",
              )}
            </>
          )}
          {type === "budget" && (
            <>
              {field("planned", ru ? "План" : "Planned", "number")}
              {field("actual", ru ? "Факт" : "Actual", "number")}
              {field("committed", ru ? "Обязательства" : "Committed", "number")}
              {field("forecast", ru ? "Прогноз" : "Forecast", "number")}
            </>
          )}
          {type === "team" && (
            <>
              {field(
                "responsibility",
                ru ? "Ответственность" : "Responsibility",
              )}
              {field(
                "capacity",
                ru ? "Часов в неделю" : "Hours per week",
                "number",
              )}
              {field("timezone", ru ? "Часовой пояс" : "Timezone")}
              {field(
                "skills",
                ru ? "Навыки через запятую" : "Skills, comma separated",
              )}
            </>
          )}
          {type === "communication" && (
            <>
              {field("channel", ru ? "Канал" : "Channel")}
              {field("cadence", ru ? "Периодичность" : "Cadence")}
              {field(
                "successSignal",
                ru ? "Признак успеха" : "Success signal",
                "textarea",
              )}
            </>
          )}
          {type === "document" &&
            field("documentType", ru ? "Тип документа" : "Document type")}
          {type === "meeting" &&
            field(
              "attendees",
              ru ? "Участники через запятую" : "Attendees, comma separated",
            )}
          {type === "vendor" && (
            <>
              {field(
                "deliverables",
                ru
                  ? "Результаты через запятую"
                  : "Deliverables, comma separated",
              )}
              {field("cost", ru ? "Стоимость" : "Cost", "number")}
              {field(
                "notes",
                ru ? "Контрольные заметки" : "Review notes",
                "textarea",
              )}
            </>
          )}
          {type === "objective" && (
            <>
              <div className="field">
                <label htmlFor={`${prefix}-objectiveType`}>
                  {ru ? "Тип" : "Type"}
                </label>
                <select id={`${prefix}-objectiveType`} name="objectiveType">
                  <option value="outcome">
                    {ru ? "Измеримый результат" : "Outcome"}
                  </option>
                  <option value="benefit">{ru ? "Выгода" : "Benefit"}</option>
                  <option value="kpi">KPI</option>
                  <option value="output">
                    {ru ? "Результат работы" : "Output"}
                  </option>
                  <option value="objective">{ru ? "Цель" : "Objective"}</option>
                </select>
              </div>
              {field("baseline", ru ? "Исходный уровень" : "Baseline")}
              {field("target", ru ? "Целевое значение" : "Target")}
            </>
          )}
          {type === "iteration" && (
            <>
              {field("startDate", ru ? "Начало" : "Start", "date")}
              {field(
                "capacity",
                ru ? "Доступная мощность" : "Capacity",
                "number",
              )}
            </>
          )}
          {type === "change" && (
            <>
              {field(
                "scopeImpact",
                ru ? "Влияние на объём работ" : "Scope impact",
              )}
              {field(
                "scheduleImpact",
                ru ? "Влияние на сроки" : "Schedule impact",
              )}
              {field("costImpact", ru ? "Влияние на стоимость" : "Cost impact")}
              {field("riskImpact", ru ? "Влияние на риски" : "Risk impact")}
              {field(
                "qualityImpact",
                ru ? "Влияние на качество" : "Quality impact",
              )}
              {field(
                "alternatives",
                ru ? "Альтернативы" : "Alternatives",
                "textarea",
              )}
              {field(
                "recommendation",
                ru ? "Рекомендация" : "Recommendation",
                "textarea",
              )}
              {field("approver", ru ? "Утверждающий" : "Approver")}
            </>
          )}
          {type === "quality" && (
            <>
              {field(
                "criteria",
                ru ? "Критерии — по строке" : "Criteria — one per line",
                "textarea",
              )}
              {field("evidence", ru ? "Подтверждения" : "Evidence", "textarea")}
            </>
          )}
          {type === "project" && (
            <>
              <div className="field">
                <label htmlFor={`${prefix}-projectType`}>
                  {ru ? "Тип проекта" : "Project type"}
                </label>
                <select id={`${prefix}-projectType`} name="projectType">
                  {(
                    [
                      "software",
                      "marketing",
                      "operations",
                      "education",
                      "agency",
                      "transformation",
                      "infrastructure",
                      "research",
                      "general",
                    ] as const
                  ).map((value) => (
                    <option value={value} key={value}>
                      {displayLabel(locale, "projectType", value)}
                    </option>
                  ))}
                </select>
              </div>
              {field("sponsor", ru ? "Спонсор" : "Sponsor")}
              {field(
                "objective",
                ru ? "Измеримый результат" : "Measurable outcome",
                "textarea",
                true,
              )}
              {field(
                "successMeasures",
                ru
                  ? "Метрики успеха — по строке"
                  : "Success measures — one per line",
                "textarea",
              )}
              {field(
                "scopeIn",
                ru ? "В границах проекта" : "In scope",
                "textarea",
              )}
              {field(
                "scopeOut",
                ru ? "Вне границ проекта" : "Out of scope",
                "textarea",
              )}
              {field(
                "constraints",
                ru ? "Ограничения" : "Constraints",
                "textarea",
              )}
              {field(
                "definitionOfDone",
                ru ? "Критерии готовности" : "Definition of Done",
                "textarea",
              )}
              {field("currency", ru ? "Валюта, ISO код" : "Currency, ISO code")}
              <p className="wide muted">
                {ru
                  ? "Контекст 1–5: система правил прозрачно выберет рабочий подход и уровень управления."
                  : "Context 1–5: the rule engine transparently selects an operating approach and governance level."}
              </p>
              {(
                [
                  "uncertainty",
                  "volatility",
                  "feedback",
                  "frequency",
                  "compliance",
                  "dependencies",
                  "autonomy",
                  "scopeRigidity",
                  "deadlineRigidity",
                  "stakeholders",
                ] as (keyof Context)[]
              ).map((k) => (
                <div className="field" key={k}>
                  <label htmlFor={`${prefix}-${k}`}>
                    {ru
                      ? (
                          {
                            uncertainty: "Неопределённость",
                            volatility: "Изменчивость",
                            feedback: "Частота обратной связи",
                            frequency: "Частота поставки",
                            compliance: "Регуляторные требования",
                            dependencies: "Зависимости",
                            autonomy: "Автономность команды",
                            scopeRigidity: "Жёсткость границ",
                            deadlineRigidity: "Жёсткость сроков",
                            stakeholders: "Заинтересованные стороны",
                          } as Record<keyof Context, string>
                        )[k]
                      : k}
                  </label>
                  <input
                    id={`${prefix}-${k}`}
                    name={k}
                    type="range"
                    min="1"
                    max="5"
                    defaultValue="3"
                  />
                </div>
              ))}
            </>
          )}
          <div className="button-row wide">
            <button type="button" className="button" onClick={onClose}>
              {ru ? "Отмена" : "Cancel"}
            </button>
            <button className="button primary" type="submit">
              {ru ? "Создать" : "Create"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
