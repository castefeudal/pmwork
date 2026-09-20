"use client";
import {DocumentBodyField} from "./document-body-field";
import { useDialogFocus } from "./use-dialog-focus";
import { removeWorkspaceRecord, updateWork } from "@/domain/workspace-commands";

import { useId, useState } from "react";
import { Trash2, X } from "lucide-react";
import type { Locale, Workspace } from "@/domain/schemas";
import { workspaceSchema } from "@/domain/schemas";
import { displayLabel } from "@/content/workspace-i18n";
import { ConfirmationDialog } from "./confirmation-dialog";

export type EditableKind =
  | "project"
  | "work"
  | "dependency"
  | "milestone"
  | "iteration"
  | "risk"
  | "issue"
  | "assumption"
  | "decision"
  | "stakeholder"
  | "team"
  | "communication"
  | "vendor"
  | "budget"
  | "change"
  | "quality"
  | "document";
type FieldType = "text" | "textarea" | "date" | "number" | "list" | "select";
type Field = {
  name: string;
  label: string;
  type?: FieldType;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
};

const collectionByKind: Record<EditableKind, keyof Workspace> = {
  project: "projects",
  work: "workItems",
  dependency: "dependencies",
  milestone: "milestones",
  iteration: "iterations",
  risk: "risks",
  issue: "issues",
  assumption: "assumptions",
  decision: "decisions",
  stakeholder: "stakeholders",
  team: "teamMembers",
  communication: "communications",
  vendor: "vendors",
  budget: "budgets",
  change: "changes",
  quality: "qualityGates",
  document: "documents",
};

const titleByKind = {
  ru: {
    project: "проект",
    work: "рабочий элемент",
    dependency: "зависимость",
    milestone: "контрольную точку",
    iteration: "итерацию",
    risk: "риск",
    issue: "проблему",
    assumption: "допущение",
    decision: "решение",
    stakeholder: "заинтересованную сторону",
    team: "участника команды",
    communication: "план коммуникации",
    vendor: "поставщика",
    budget: "статью бюджета",
    change: "запрос на изменение",
    quality: "контроль качества",
    document: "документ",
  },
  en: {
    project: "project",
    work: "work item",
    dependency: "dependency",
    milestone: "milestone",
    iteration: "iteration",
    risk: "risk",
    issue: "issue",
    assumption: "assumption",
    decision: "decision",
    stakeholder: "stakeholder",
    team: "team member",
    communication: "communication plan",
    vendor: "vendor",
    budget: "budget line",
    change: "change request",
    quality: "quality gate",
    document: "document",
  },
} as const;

const options = (
  locale: Locale,
  group: Parameters<typeof displayLabel>[1],
  values: string[],
) =>
  values.map((value) => ({ value, label: displayLabel(locale, group, value) }));

function fieldsFor(
  kind: EditableKind,
  locale: Locale,
  workspace: Workspace,
  projectId: string,
): Field[] {
  const ru = locale === "ru";
  const text = (
    name: string,
    ruLabel: string,
    enLabel: string,
    type: FieldType = "text",
  ): Field => ({ name, label: ru ? ruLabel : enLabel, type });
  const work = workspace.workItems
    .filter((item) => item.projectId === projectId && !item.archived)
    .map((item) => ({ value: item.id, label: `${item.id} · ${item.title}` }));
  switch (kind) {
    case "project":
      return [
        text("name", "Название", "Name"),
        text("status", "Статус", "Status", "select"),
        text("owner", "Руководитель проекта", "Project lead"),
        text("sponsor", "Спонсор", "Sponsor"),
        text("startDate", "Дата начала", "Start date", "date"),
        text("targetDate", "Целевая дата", "Target date", "date"),
        text("purpose", "Назначение", "Purpose", "textarea"),
        text(
          "objective",
          "Измеримый результат",
          "Measurable outcome",
          "textarea",
        ),
        text("successMeasures", "Метрики успеха", "Success measures", "list"),
        text("scopeIn", "В границах проекта", "In scope", "textarea"),
        text("scopeOut", "Вне границ проекта", "Out of scope", "textarea"),
        text("constraints", "Ограничения", "Constraints", "textarea"),
        text(
          "definitionOfDone",
          "Критерии готовности",
          "Definition of Done",
          "textarea",
        ),
        text("currency", "Валюта", "Currency"),
      ].map((field) =>
        field.name === "status"
          ? {
              ...field,
              options: options(locale, "projectStatus", [
                "planned",
                "active",
                "on-hold",
                "completed",
                "cancelled",
              ]),
            }
          : field,
      );
    case "work":
      return [
        text("title", "Название", "Title"),
        text("description", "Описание", "Description", "textarea"),
        {
          ...text("type", "Тип", "Type", "select"),
          options: options(locale, "workType", [
            "initiative",
            "epic",
            "feature",
            "story",
            "task",
            "subtask",
            "bug",
            "spike",
            "deliverable",
          ]),
        },
        {
          ...text("status", "Статус", "Status", "select"),
          options: options(locale, "workStatus", [
            "backlog",
            "ready",
            "in-progress",
            "review",
            "done",
          ]),
        },
        {
          ...text("priority", "Приоритет", "Priority", "select"),
          options: options(locale, "priority", [
            "critical",
            "high",
            "medium",
            "low",
          ]),
        },
        text("owner", "Владелец", "Owner"),
        text("contributors", "Участники", "Contributors", "list"),
        text("labels", "Метки", "Labels", "list"),
        text("startDate", "Дата начала", "Start date", "date"),
        text("dueDate", "Срок", "Due date", "date"),
        text("currentEstimate", "Текущая оценка", "Current estimate", "number"),
        text(
          "actualEffort",
          "Фактическая трудоёмкость",
          "Actual effort",
          "number",
        ),
        text(
          "acceptanceCriteria",
          "Критерии приёмки",
          "Acceptance criteria",
          "list",
        ),
        text(
          "blockerReason",
          "Причина блокировки",
          "Blocker reason",
          "textarea",
        ),
      ];
    case "dependency":
      return [
        {
          ...text("predecessorId", "Предшественник", "Predecessor", "select"),
          options: work,
        },
        {
          ...text("successorId", "Последователь", "Successor", "select"),
          options: work,
        },
        {
          ...text("type", "Тип связи", "Relationship type", "select"),
          options: ["FS", "SS", "FF", "SF"].map((value) => ({
            value,
            label: value,
          })),
        },
        text("lag", "Сдвиг, дней", "Lag, days", "number"),
        text("owner", "Владелец", "Owner"),
        text("dueDate", "Контрольная дата", "Due date", "date"),
        {
          ...text("status", "Статус", "Status", "select"),
          options: options(locale, "dependencyStatus", [
            "open",
            "met",
            "breached",
          ]),
        },
      ];
    case "milestone":
      return [
        text("title", "Название", "Title"),
        text("owner", "Владелец", "Owner"),
        text("baselineDate", "Базовая дата", "Baseline date", "date"),
        text("forecastDate", "Прогнозная дата", "Forecast date", "date"),
        text("actualDate", "Фактическая дата", "Actual date", "date"),
        {...text("confidence", "Уверенность, %", "Confidence, %", "number"),min:0,max:100},
        text("forecastReason", "Причина изменения прогноза", "Forecast change reason", "textarea"),
        {
          ...text("status", "Статус", "Status", "select"),
          options: options(locale, "milestoneStatus", [
            "planned",
            "on-track",
            "at-risk",
            "done",
            "cancelled",
          ]),
        },
        {
          ...text("progress", "Прогресс, %", "Progress, %", "number"),
          min: 0,
          max: 100,
        },
      ];
    case "iteration":
      return [
        text("title", "Название", "Title"),
        text("goal", "Цель", "Goal", "textarea"),
        text("startDate", "Начало", "Start", "date"),
        text("endDate", "Окончание", "End", "date"),
        text("capacity", "Доступная мощность", "Capacity", "number"),
        text(
          "workItemIds",
          "Связанные задачи — ID по строке",
          "Linked work item IDs",
          "list",
        ),
        {
          ...text("status", "Статус", "Status", "select"),
          options: options(locale, "iterationStatus", [
            "planned",
            "active",
            "closed",
          ]),
        },
      ];
    case "risk":
      return [
        text("title", "Название", "Title"),
        text("category", "Категория", "Category"),
        text("description", "Описание", "Description", "textarea"),
        {
          ...text(
            "probability",
            "Вероятность 1–5",
            "Probability 1–5",
            "number",
          ),
          min: 1,
          max: 5,
        },
        {
          ...text("impact", "Влияние 1–5", "Impact 1–5", "number"),
          min: 1,
          max: 5,
        },
        {
          ...text("strategy", "Стратегия", "Strategy", "select"),
          options: options(locale, "riskStrategy", [
            "avoid",
            "mitigate",
            "transfer",
            "accept",
            "escalate",
            "exploit",
            "enhance",
            "share",
          ]),
        },
        text("actions", "План реагирования", "Response plan", "textarea"),
        text("trigger", "Триггер", "Trigger"),
        text("owner", "Владелец", "Owner"),
        text("reviewDate", "Дата пересмотра", "Review date", "date"),
        {...text("probabilityPct", "Денежная вероятность, %", "Monetary probability, %", "number"),min:0,max:100},
        text("impactAmount", "Денежное влияние", "Monetary impact", "number"),
        {...text("residualProbabilityPct", "Остаточная вероятность, %", "Residual probability, %", "number"),min:0,max:100},
        text("residualImpactAmount", "Остаточное денежное влияние", "Residual monetary impact", "number"),
        text("responseCost", "Стоимость реагирования", "Response cost", "number"),
        text("currency", "Валюта", "Currency"),
        {
          ...text(
            "residualProbability",
            "Остаточная вероятность",
            "Residual probability",
            "number",
          ),
          min: 1,
          max: 5,
        },
        {
          ...text(
            "residualImpact",
            "Остаточное влияние",
            "Residual impact",
            "number",
          ),
          min: 1,
          max: 5,
        },
        {
          ...text("status", "Статус", "Status", "select"),
          options: options(locale, "riskStatus", [
            "open",
            "watching",
            "responding",
            "closed",
          ]),
        },
      ];
    case "issue":
      return [
        text("title", "Название", "Title"),
        text("description", "Описание", "Description", "textarea"),
        {
          ...text("impact", "Влияние 1–5", "Impact 1–5", "number"),
          min: 1,
          max: 5,
        },
        {
          ...text("urgency", "Срочность 1–5", "Urgency 1–5", "number"),
          min: 1,
          max: 5,
        },
        text("plan", "План восстановления", "Recovery plan", "textarea"),
        text("escalation", "Эскалация", "Escalation"),
        text("owner", "Владелец", "Owner"),
        text("dueDate", "Срок", "Due date", "date"),
        {
          ...text("status", "Статус", "Status", "select"),
          options: options(locale, "issueStatus", [
            "open",
            "resolving",
            "closed",
          ]),
        },
      ];
    case "assumption":
      return [
        text("text", "Допущение", "Assumption", "textarea"),
        text("rationale", "Основание", "Rationale", "textarea"),
        text("validationMethod", "Метод проверки", "Validation method"),
        text("validationDate", "Дата проверки", "Validation date", "date"),
        text(
          "effectIfFalse",
          "Последствие ошибки",
          "Effect if false",
          "textarea",
        ),
        text("owner", "Владелец", "Owner"),
        {
          ...text("status", "Статус", "Status", "select"),
          options: options(locale, "assumptionStatus", [
            "untested",
            "validating",
            "validated",
            "invalidated",
          ]),
        },
      ];
    case "decision":
      return [
        text("question", "Вопрос", "Question", "textarea"),
        text("context", "Контекст", "Context", "textarea"),
        text("alternatives", "Альтернативы", "Alternatives", "list"),
        text("criteria", "Критерии", "Criteria", "list"),
        text("decision", "Итоговое решение", "Final decision", "textarea"),
        text("rationale", "Обоснование", "Rationale", "textarea"),
        text("owner", "Владелец", "Owner"),
        text("participants", "Участники", "Participants", "list"),
        text("consequences", "Последствия", "Consequences", "textarea"),
        text("revisitTrigger", "Условие пересмотра", "Revisit trigger"),
        text("date", "Дата", "Date", "date"),
        {
          ...text("status", "Статус", "Status", "select"),
          options: options(locale, "decisionStatus", [
            "pending",
            "decided",
            "superseded",
          ]),
        },
      ];
    case "stakeholder":
      return [
        text("name", "Имя / группа", "Name / group"),
        text("role", "Роль", "Role"),
        {
          ...text("influence", "Влияние 1–5", "Influence 1–5", "number"),
          min: 1,
          max: 5,
        },
        {
          ...text("interest", "Интерес 1–5", "Interest 1–5", "number"),
          min: 1,
          max: 5,
        },
        {
          ...text("attitude", "Отношение", "Attitude", "select"),
          options: options(locale, "attitude", [
            "resistant",
            "neutral",
            "supportive",
          ]),
        },
        text("expectations", "Ожидания", "Expectations", "textarea"),
        text(
          "communicationNeeds",
          "Потребности в коммуникации",
          "Communication needs",
          "textarea",
        ),
        text(
          "strategy",
          "Стратегия взаимодействия",
          "Engagement strategy",
          "textarea",
        ),
        text("owner", "Владелец", "Owner"),
      ];
    case "team":
      return [
        text("name", "Имя", "Name"),
        text("role", "Роль", "Role"),
        text("responsibility", "Ответственность", "Responsibility", "textarea"),
        text("weeklyCapacity", "Часов в неделю", "Hours per week", "number"),
        text("timezone", "Часовой пояс", "Timezone"),
        text("skills", "Навыки", "Skills", "list"),
      ];
    case "communication":
      return [
        text("audience", "Аудитория", "Audience"),
        text("purpose", "Цель", "Purpose", "textarea"),
        text("channel", "Канал", "Channel"),
        text("cadence", "Периодичность", "Cadence"),
        text("owner", "Владелец", "Owner"),
        text("successSignal", "Признак успеха", "Success signal", "textarea"),
      ];
    case "vendor":
      return [
        text("name", "Поставщик", "Vendor"),
        text("scope", "Объём работ", "Scope", "textarea"),
        text("owner", "Владелец", "Owner"),
        text("deliverables", "Результаты", "Deliverables", "list"),
        text("cost", "Стоимость", "Cost", "number"),
        {
          ...text("status", "Статус", "Status", "select"),
          options: options(locale, "vendorStatus", [
            "prospect",
            "active",
            "at-risk",
            "closed",
          ]),
        },
        text(
          "reviewNotes",
          "Заметки и риски",
          "Review notes and risks",
          "textarea",
        ),
      ];
    case "budget":
      return [
        text("category", "Категория", "Category"),
        text("planned", "План", "Planned", "number"),
        text("actual", "Факт", "Actual", "number"),
        text("committed", "Обязательства", "Committed", "number"),
        text("forecast", "Прогноз", "Forecast", "number"),
      ];
    case "change":
      return [
        text("change", "Изменение", "Change", "textarea"),
        text("requester", "Инициатор", "Requester"),
        text("reason", "Причина", "Reason", "textarea"),
        text("scopeImpact", "Влияние на объём работ", "Scope impact"),
        text("scheduleImpact", "Влияние на сроки", "Schedule impact"),
        text("costImpact", "Влияние на стоимость", "Cost impact"),
        text("riskImpact", "Влияние на риски", "Risk impact"),
        text("qualityImpact", "Влияние на качество", "Quality impact"),
        text("alternatives", "Альтернативы", "Alternatives", "textarea"),
        text("recommendation", "Рекомендация", "Recommendation", "textarea"),
        text("approver", "Утверждающий", "Approver"),
        text("decision", "Решение", "Decision", "textarea"),
        {
          ...text("status", "Статус", "Status", "select"),
          options: options(locale, "changeStatus", [
            "draft",
            "assessing",
            "approved",
            "rejected",
            "implemented",
          ]),
        },
      ];
    case "quality":
      return [
        text("title", "Название", "Title"),
        text("criteria", "Критерии", "Criteria", "list"),
        text("evidence", "Подтверждения", "Evidence", "textarea"),
        text("owner", "Владелец", "Owner"),
        text("dueDate", "Срок", "Due date", "date"),
        {
          ...text("status", "Статус", "Status", "select"),
          options: options(locale, "qualityStatus", [
            "planned",
            "ready",
            "passed",
            "failed",
          ]),
        },
      ];
    case "document":
      return [
        text("title", "Название", "Title"),
        text("type", "Тип", "Type"),
        text("body", "Содержание", "Content", "textarea"),
        text("relatedIds", "Связанные ID", "Linked IDs", "list"),
      ];
  }
}

function createsCycle(
  workspace: Workspace,
  projectId: string,
  recordId: string,
  predecessorId: string,
  successorId: string,
): boolean {
  const edges = workspace.dependencies
    .filter((item) => item.projectId === projectId && item.id !== recordId)
    .map((item) => [item.predecessorId, item.successorId] as const);
  edges.push([predecessorId, successorId]);
  const graph = new Map<string, string[]>();
  for (const [from, to] of edges)
    graph.set(from, [...(graph.get(from) ?? []), to]);
  const visit = (node: string, seen = new Set<string>()): boolean => {
    if (node === predecessorId && seen.size) return true;
    if (seen.has(node)) return false;
    seen.add(node);
    return (graph.get(node) ?? []).some((next) => visit(next, new Set(seen)));
  };
  return visit(successorId);
}

export function RecordEditor({
  kind,
  id,
  locale,
  workspace,
  projectId,
  onClose,
  onChange,
}: {
  kind: EditableKind;
  id: string;
  locale: Locale;
  workspace: Workspace;
  projectId: string;
  onClose: () => void;
  onChange: (workspace: Workspace) => void;
}) {
  const dialogRef = useDialogFocus();
  const prefix = useId();
  const [error, setError] = useState(""), [confirming, setConfirming] = useState<"project" | "record" | null>(null);
  const collection = collectionByKind[kind];
  const records = workspace[collection] as unknown as Array<
    Record<string, unknown>
  >;
  const record = records.find(
    (item) => item.id === id || (kind === "project" && item.id === id),
  );
  if (!record) return null;
  const fields = fieldsFor(kind, locale, workspace, projectId);
  const ru = locale === "ru";
  const valueOf = (field: Field) =>
    Array.isArray(record[field.name])
      ? (record[field.name] as unknown[]).join("\n")
      : String(record[field.name] ?? "");
  const submit = (data: FormData) => {
    setError("");
    const nextRecord: Record<string, unknown> = { ...record };
    for (const field of fields) {
      const raw = String(data.get(field.name) ?? "").trim();
      nextRecord[field.name] =
        field.type === "number"
          ? raw === ""
            ? undefined
            : Number(raw)
          : field.type === "list"
            ? raw
                .split(/\n|,/)
                .map((item) => item.trim())
                .filter(Boolean)
            : (["actualDate", "forecastReason", "currency"].includes(field.name) && raw === "" ? undefined : raw);
    }
    if (kind === "dependency") {
      const predecessor = String(nextRecord.predecessorId),
        successor = String(nextRecord.successorId);
      const known = new Set(
        workspace.workItems
          .filter((item) => item.projectId === projectId)
          .map((item) => item.id),
      );
      if (!known.has(predecessor) || !known.has(successor))
        return setError(
          ru
            ? "Выберите существующие рабочие элементы."
            : "Select existing work items.",
        );
      if (predecessor === successor)
        return setError(
          ru
            ? "Элемент не может зависеть от самого себя."
            : "An item cannot depend on itself.",
        );
      if (createsCycle(workspace, projectId, id, predecessor, successor))
        return setError(
          ru
            ? "Эта связь создаёт цикл зависимостей."
            : "This relationship creates a dependency cycle.",
        );
    }
    if (kind === "iteration") {
      const known = new Set(
        workspace.workItems
          .filter((item) => item.projectId === projectId)
          .map((item) => item.id),
      );
      if ((nextRecord.workItemIds as string[]).some((item) => !known.has(item)))
        return setError(
          ru
            ? "Список содержит неизвестный ID задачи."
            : "The list contains an unknown work item ID.",
        );
    }
    const start = String(nextRecord.startDate || ""), end = String(nextRecord.dueDate || nextRecord.endDate || nextRecord.targetDate || "");
    if (start && end && end < start) return setError(ru ? "Дата окончания не может быть раньше начала." : "End date cannot precede start date.");
    if (kind === "work") {
      const done = nextRecord.status === "done";
      nextRecord.done = done;
      nextRecord.completedAt = done
        ? String(record.completedAt || new Date().toISOString())
        : undefined;
      nextRecord.updatedAt = new Date().toISOString();
    }
    if (kind === "milestone") {
      const at=new Date().toISOString();
      nextRecord.date=nextRecord.forecastDate;
      nextRecord.updatedAt=at;
      const tracked=["baselineDate","forecastDate","actualDate","confidence","status","progress","owner"] as const;
      const additions=tracked.flatMap(field=>nextRecord[field]!==record[field]?[{at,field,from:record[field]??null,to:nextRecord[field]??null,reason:field==="forecastDate"?nextRecord.forecastReason:undefined}]:[]);
      nextRecord.history=[...(record.history as unknown[]),...additions];
    }
    if (kind === "document") nextRecord.updatedAt = new Date().toISOString();
    const validation = workspaceSchema.safeParse({
      ...workspace,
      [collection]: records.map((item) =>
        item === record ? nextRecord : item,
      ),
    });
    if (!validation.success) {
      setError(ru ? "Проверьте обязательные поля и допустимые значения." : "Check required fields and allowed values.");
      return;
    }
    if(kind === "work") {
      const updated=validation.data.workItems.find(item=>item.id===id)!;
      const {ownerId: _ownerId, ...patch}=updated;
      void _ownerId;
      onChange(updateWork(workspace,id,patch));
    } else onChange(validation.data);
    onClose();
  };
  const performRemove = () => {
    if (kind === "project") {
      onChange(
        workspaceSchema.parse({
          ...workspace,
          projects: workspace.projects.map((project) =>
            project.id === id ? { ...project, status: "cancelled" } : project,
          ),
        }),
      );
      onClose();
      return;
    }
    try {
      onChange(removeWorkspaceRecord(workspace, kind, id));
      onClose();
    } catch {
      setError(
        ru
          ? "Запись не удалена: связанные данные не удалось безопасно обновить."
          : "Record was not deleted because related data could not be updated safely.",
      );
    }
  };
  const remove = () => setConfirming(kind === "project" ? "project" : "record");
  return (
    <>
    <div
      className="dialog-backdrop drawer-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="dialog record-editor record-drawer"
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${prefix}-heading`}
      >
        <div className="page-title">
          <div>
            <p className="eyebrow">{id}</p>
            <h2 id={`${prefix}-heading`}>
              {ru
                ? `Изменить: ${titleByKind.ru[kind]}`
                : `Edit ${titleByKind.en[kind]}`}
            </h2>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label={ru ? "Закрыть" : "Close"}
          >
            <X size={18} />
          </button>
        </div>
        <form action={submit} className="form-grid">
          {kind === "work" && <div className="notice wide"><strong>{ru ? "Оценки: исходная → текущая → факт" : "Estimates: original → current → actual"}</strong><p>{String(record.originalEstimate ?? "—")} → {String(record.currentEstimate ?? record.estimate ?? "—")} → {String(record.actualEffort ?? "—")}</p><small>{ru ? `Изменений: ${(record.estimateHistory as unknown[]).length}` : `Changes: ${(record.estimateHistory as unknown[]).length}`}</small></div>}
          {fields.map((field) => (
            <div
              className={`field ${field.type === "textarea" || field.type === "list" ? "wide" : ""}`}
              key={field.name}
            >
              <label htmlFor={`${prefix}-${field.name}`}>{field.label}</label>
              {kind === "document" && field.name === "body" ? <DocumentBodyField id={`${prefix}-${field.name}`} name={field.name} value={String(valueOf(field))} ru={ru}/> : field.type === "textarea" || field.type === "list" ? (
                <textarea
                  id={`${prefix}-${field.name}`}
                  name={field.name}
                  defaultValue={valueOf(field)}
                />
              ) : field.type === "select" ? (
                <select
                  id={`${prefix}-${field.name}`}
                  name={field.name}
                  defaultValue={valueOf(field)}
                >
                  {field.options?.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={`${prefix}-${field.name}`}
                  name={field.name}
                  type={field.type ?? "text"}
                  min={field.min}
                  max={field.max}
                  defaultValue={valueOf(field)}
                />
              )}
            </div>
          ))}
          {error && (
            <p className="form-error wide" role="alert">
              {error}
            </p>
          )}
          <div className="dialog-actions wide">
            <button type="button" className="button danger" onClick={remove}>
              <Trash2 size={16} />
              {kind === "project"
                ? ru
                  ? "Отменить проект"
                  : "Cancel project"
                : ru
                  ? "Удалить"
                  : "Delete"}
            </button>
            <span className="spacer" />
            <button type="button" className="button" onClick={onClose}>
              {ru ? "Отмена" : "Cancel"}
            </button>
            <button type="submit" className="button primary">
              {ru ? "Сохранить" : "Save"}
            </button>
          </div>
        </form>
      </section>
    </div>
    {confirming && <ConfirmationDialog locale={locale} title={confirming === "project" ? (ru ? "Отменить проект?" : "Cancel project?") : (ru ? "Удалить запись?" : "Delete record?")} message={confirming === "project" ? (ru ? "Связанные данные сохранятся, а проект получит статус «Отменён». Его можно вернуть в работу." : "Linked data will be preserved and the project will be marked cancelled. It can be reactivated later.") : (ru ? `Удалить ${titleByKind.ru[kind]}? Это действие нельзя отменить.` : `Delete this ${titleByKind.en[kind]}? This cannot be undone.`)} confirmLabel={confirming === "project" ? (ru ? "Отменить проект" : "Cancel project") : (ru ? "Удалить" : "Delete")} onCancel={() => setConfirming(null)} onConfirm={() => {setConfirming(null);performRemove();}}/>}
    </>
  );
}
