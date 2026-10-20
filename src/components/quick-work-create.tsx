"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { workItemSchema, type Locale, type Workspace } from "@/domain/schemas";
import { createWork } from "@/domain/workspace-commands";

/** Uses the same command and persistence boundary as the full work editor. */
export function QuickWorkCreate({workspace, projectId, locale, onChange, onEdit}: {
  workspace: Workspace;
  projectId: string;
  locale: Locale;
  onChange: (next: Workspace) => void;
  onEdit: (id: string) => void;
}) {
  const ru = locale === "ru";
  const [title, setTitle] = useState("");
  const [createdId, setCreatedId] = useState<string>();
  const [error, setError] = useState("");
  const accepted = !!createdId && workspace.workItems.some(item => item.id === createdId);
  return <details className="quick-work-create">
    <summary><Plus size={16} aria-hidden="true"/>{ru ? "Быстро добавить задачу" : "Quick add task"}</summary>
    <form onSubmit={event => {
      event.preventDefault();
      const name = title.trim();
      if (name.length < 2) {
        setError(ru ? "Введите название из двух или более символов." : "Enter a title of at least two characters.");
        return;
      }
      try {
        const at = new Date().toISOString();
        const item = workItemSchema.parse({id:`WORK-${crypto.randomUUID()}`,projectId,title:name,type:"task",status:"backlog",priority:"medium",createdAt:at,updatedAt:at});
        onChange(createWork(workspace,item));
        setCreatedId(item.id);
        setError("");
      } catch {
        setError(ru ? "Не удалось добавить задачу. Название сохранено в поле — попробуйте ещё раз." : "Could not add the task. Your title is still here; try again.");
      }
    }}>
      <label>{ru ? "Название задачи" : "Task title"}<input className="input" value={accepted ? "" : title} required minLength={2} maxLength={240} onChange={event => {setTitle(event.target.value);setCreatedId(undefined);setError("");}} placeholder={ru ? "Какой следующий шаг?" : "What is the next step?"}/></label>
      <button type="submit" className="button primary">{ru ? "Добавить задачу" : "Add task"}</button>
      <p className="muted">{ru ? "Создаётся в текущем проекте, в бэклоге. Владельца, срок и критерии приёмки можно уточнить в деталях." : "Added to this project's backlog. Set the owner, due date and acceptance criteria in details."}</p>
      {error && <p role="alert">{error}</p>}
      {accepted && createdId && <div className="button-row"><span role="status">{ru ? "Задача добавлена." : "Task added."}</span><button type="button" className="button small" onClick={() => onEdit(createdId)}>{ru ? "Уточнить детали" : "Add details"}</button></div>}
    </form>
  </details>;
}
