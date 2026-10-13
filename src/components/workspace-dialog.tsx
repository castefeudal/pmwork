"use client";
import { ProjectSetup } from "./project-setup";
import { useDialogFocus } from "./use-dialog-focus";
import { useId, useState } from "react";
import { X } from "lucide-react";
import type { Locale, Workspace, WorkItem } from "@/domain/schemas";
import {
  governanceLevel,
  scoreApproaches,
  type Context,
} from "@/domain/method-fit";
import type { CreateType } from "./workspace-types";
import { displayLabel } from "@/content/workspace-i18n";
import {applyStarterPackBundle,starterSections,type StarterSection} from "@/content/starter-packs";
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
const optionalNumber = (fd: FormData, key: string) => {
  const raw = fd.get(key);
  if (raw === null || raw === "") return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
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
  const dialogRef = useDialogFocus();
  const [error,setError]=useState("");
  const ru = locale === "ru",
    prefix = useId(),
    today = new Date().toISOString().slice(0, 10),
    label = titles[type][locale];
  const field = (
    name: string,
    labelText: string,
    kind: "text" | "textarea" | "date" | "number" = "text",
    required = false,
    constraints: { min?: number; max?: number; step?: number | "any" } = {},
  ) => {
    const id = `${prefix}-${name}`;
    const placeholder = name === "title"
      ? type === "work"
        ? (ru ? "Например: согласовать план с командой" : "For example: agree the plan with the team")
        : type === "risk"
          ? (ru ? "Например: поставка может задержаться" : "For example: delivery may be delayed")
          : (ru ? "Короткое и конкретное название" : "A short, specific name")
      : name === "description"
        ? (ru ? "Что важно знать, чтобы продолжить работу?" : "What should someone know to move this forward?")
        : name === "owner"
          ? (ru ? "Имя ответственного" : "Person responsible")
          : undefined;
    return (
      <div className={`field ${kind === "textarea" ? "wide" : ""}`}>
        <label htmlFor={id}>{labelText}</label>
        {kind === "textarea" ? (
          <textarea id={id} name={name} required={required} placeholder={placeholder} />
        ) : (
          <input id={id} name={name} type={kind} required={required} placeholder={placeholder} min={constraints.min} max={constraints.max} step={constraints.step} />
        )}
      </div>
    );
  };
  const submit = (fd: FormData) => {
    const at = new Date().toISOString(),
      title = text(fd, "title"),
      owner = text(fd, "owner"),
      description = text(fd, "description"),
      due = text(fd, "dueDate");
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
            targetDate: text(fd, "dueDate"),
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
            context,
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
      const packId=text(fd,"starterPack"),selected=fd.getAll("packSections").map(String).filter((value):value is StarterSection=>starterSections.includes(value as StarterSection));
      if(packId)next=applyStarterPackBundle(next,packId,id,locale,selected,at);
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
            estimate: optionalNumber(fd, "estimate"),
            originalEstimate: optionalNumber(fd, "estimate"),
            currentEstimate: optionalNumber(fd, "estimate"),
            estimateHistory: optionalNumber(fd, "estimate") === undefined ? [] : [{value: optionalNumber(fd, "estimate")!,timestamp:at}],
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
            probabilityPct: optionalNumber(fd, "probabilityPct"),
            impactAmount: optionalNumber(fd, "impactAmount"),
            residualProbabilityPct: optionalNumber(fd, "residualProbabilityPct"),
            residualImpactAmount: optionalNumber(fd, "residualImpactAmount"),
            responseCost: optionalNumber(fd, "responseCost"),
            currency: optionalNumber(fd, "impactAmount") === undefined ? undefined : (text(fd,"currency") || workspace.projects.find(p=>p.id===projectId)?.currency),
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
            owner,
            baselineDate: due,
            forecastDate: due,
            confidence: optionalNumber(fd,"confidence"),
            status: "planned",
            progress: 0,
            createdAt: at,
            updatedAt: at,
            history: [],
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
    try { onCommit(next); onClose(); }
    catch { setError(ru ? "Проверьте обязательные данные и связи записей." : "Check required evidence and linked records."); }
  };
  const workOptions = workspace.workItems.filter(
    (item) => item.projectId === projectId && !item.archived,
  );
  if(type === "project") return <ProjectSetup locale={locale} onClose={onClose} onSubmit={submit}/>;
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
        ref={dialogRef}
        tabIndex={-1}
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
          {type === "work" && (
            <p className="form-intro wide">
              {ru
                ? "Достаточно указать название. Владелец и срок помогут команде понять следующий шаг; детали можно добавить позже."
                : "Start with a title. An owner and due date help clarify the next step; you can add detail later."}
            </p>
          )}
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
              type === "risk"
                ? ru ? "Контекст риска (необязательно)" : "Risk context (optional)"
                : type === "meeting"
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
              type === "risk"
                ? ru ? "Владелец (необязательно)" : "Owner (optional)"
                : ru ? "Владелец" : "Owner",
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
              type === "work"
                ? ru ? "Срок (необязательно)" : "Due date (optional)"
                : type === "risk"
                  ? ru ? "Дата пересмотра (необязательно)" : "Review date (optional)"
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
              <details className="form-optional wide">
                <summary>
                  {ru
                    ? "Планирование и критерии — необязательно"
                    : "Planning and acceptance criteria — optional"}
                </summary>
                <div className="form-grid">
                  {field("startDate", ru ? "Начало" : "Start", "date")}
                  {field(
                    "estimate",
                    ru ? "Оценка трудоёмкости" : "Effort estimate",
                    "number",
                  )}
                  {field(
                    "acceptance",
                    ru
                      ? "Критерии приёмки — один пункт на строку"
                      : "Acceptance criteria — one item per line",
                    "textarea",
                  )}
                </div>
              </details>
            </>
          )}
          {type === "risk" && (
            <>
              <div className="field">
                <label htmlFor={`${prefix}-category`}>{ru ? "Категория" : "Category"}</label>
                <input id={`${prefix}-category`} name="category" type="text" placeholder={ru ? "Например: сроки, поставка, люди" : "For example: schedule, supplier, people"} />
              </div>
              <div className="form-note wide">
                <strong>{ru ? "Качественная оценка" : "Qualitative assessment"}</strong>
                <p>{ru ? "Выберите оценки по текущим данным. 3 — начальная оценка, которую стоит уточнить перед обзором." : "Rate from the evidence you have. 3 is a starting estimate to review before relying on it."}</p>
              </div>
              <div className="field">
                <label htmlFor={`${prefix}-probability`}>{ru ? "Вероятность (1–5)" : "Likelihood (1–5)"}</label>
                <input id={`${prefix}-probability`} name="probability" type="number" min={1} max={5} step={1} defaultValue={3} />
                <small className="field-hint">{ru ? "1 — маловероятно · 5 — очень вероятно" : "1 — unlikely · 5 — very likely"}</small>
              </div>
              <div className="field">
                <label htmlFor={`${prefix}-impact`}>{ru ? "Влияние (1–5)" : "Impact (1–5)"}</label>
                <input id={`${prefix}-impact`} name="impact" type="number" min={1} max={5} step={1} defaultValue={3} />
                <small className="field-hint">{ru ? "1 — ограниченное · 5 — серьёзное" : "1 — limited · 5 — severe"}</small>
              </div>
              <details className="form-optional wide">
                <summary>{ru ? "План реагирования — необязательно" : "Response plan — optional"}</summary>
                <div className="form-grid">
                  {field("trigger", ru ? "Сигнал для пересмотра" : "Review trigger")}
                  {field("actions", ru ? "Действия по снижению риска" : "Risk response actions", "textarea")}
                </div>
              </details>
              <details className="form-optional wide">
                <summary>{ru ? "Денежная оценка — необязательно" : "Financial estimate — optional"}</summary>
                <p className="muted wide">{ru ? "Заполните вероятность и влияние вместе. Ожидаемое денежное влияние появится только при наличии обоих значений; суммы используют валюту проекта." : "Enter probability and impact together. Expected monetary exposure appears only when both are known; amounts use the project currency."}</p>
                <div className="form-grid">
                  {field("probabilityPct", ru ? "Вероятность, % (0–100)" : "Probability, % (0–100)", "number", false, { min: 0, max: 100, step: "any" })}
                  {field("impactAmount", ru ? "Денежное влияние" : "Monetary impact", "number", false, { min: 0, step: "any" })}
                  {field("residualProbabilityPct", ru ? "Остаточная вероятность, %" : "Residual probability, %", "number", false, { min: 0, max: 100, step: "any" })}
                  {field("residualImpactAmount", ru ? "Остаточное денежное влияние" : "Residual monetary impact", "number", false, { min: 0, step: "any" })}
                  {field("responseCost", ru ? "Стоимость реагирования" : "Response cost", "number", false, { min: 0, step: "any" })}
                </div>
              </details>
            </>
          )}
          {type === "milestone" && field("confidence", ru ? "Уверенность в прогнозе, %" : "Forecast confidence, %", "number")}
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
          {error&&<p role="alert" className="form-error wide">{error}</p>}
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
