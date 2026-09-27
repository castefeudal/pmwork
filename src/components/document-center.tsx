"use client";

import { useMemo, useState } from "react";
import { FileText, Pin, Search, Plus } from "lucide-react";
import type { Locale, Workspace } from "@/domain/schemas";
import type { EditableKind } from "./record-editor";
import type { CreateType } from "./workspace-types";
import { formatDate } from "@/domain/format-date";

type DocumentKind = Workspace["documents"][number];
type Category = "all" | "plan" | "status" | "decision" | "meeting" | "notes";
const categoryOf = (type: string): Exclude<Category, "all"> => {
  if (/status|report/iu.test(type)) return "status";
  if (/decision/iu.test(type)) return "decision";
  if (/meeting/iu.test(type)) return "meeting";
  if (/charter|plan|scope|closure|quality|risk|vendor|change|milestone/iu.test(type)) return "plan";
  return "notes";
};

function linkedRecord(workspace: Workspace, id: string): { kind: EditableKind; title: string } | undefined {
  const collections: Array<[EditableKind, Array<{ id: string; title?: string; name?: string; question?: string; text?: string }>] > = [
    ["work", workspace.workItems], ["risk", workspace.risks], ["issue", workspace.issues],
    ["decision", workspace.decisions], ["milestone", workspace.milestones], ["assumption", workspace.assumptions],
    ["dependency", workspace.dependencies], ["team", workspace.teamMembers], ["stakeholder", workspace.stakeholders],
    ["vendor", workspace.vendors], ["communication", workspace.communications],
    ["document", workspace.documents], ["budget", workspace.budgets], ["change", workspace.changes], ["quality", workspace.qualityGates],
  ];
  for (const [kind, rows] of collections) {
    const row = rows.find(item => item.id === id);
    if (row) return { kind, title: row.title ?? row.name ?? row.question ?? row.text ?? id };
  }
}

export function DocumentCenter({ workspace, project, locale, onCreate, onEdit, onChange }: {
  workspace: Workspace;
  project: Workspace["projects"][number];
  locale: Locale;
  onCreate: (type: CreateType) => void;
  onEdit: (kind: EditableKind, id: string) => void;
  onChange: (workspace: Workspace) => void;
}) {
  const ru = locale === "ru";
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [sort, setSort] = useState<"recent" | "title">("recent");
  const rows = useMemo(() => workspace.documents.filter(document => {
    if (document.projectId !== project.id) return false;
    if (category !== "all" && categoryOf(document.type) !== category) return false;
    const search = `${document.title} ${document.type} ${document.body} ${document.relatedIds.join(" ")}`.toLocaleLowerCase(locale);
    return search.includes(query.trim().toLocaleLowerCase(locale));
  }).sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || (sort === "recent" ? b.updatedAt.localeCompare(a.updatedAt) : a.title.localeCompare(b.title, locale))), [workspace.documents, project.id, category, query, sort, locale]);
  const setPinned = (document: DocumentKind) => onChange({
    ...workspace,
    documents: workspace.documents.map(item => item.id === document.id ? { ...item, pinned: !document.pinned } : item),
  });
  const categories: Array<[Category, string]> = [
    ["all", ru ? "Все" : "All"], ["plan", ru ? "План и контроль" : "Plan & control"],
    ["status", ru ? "Статусы" : "Status"], ["decision", ru ? "Решения" : "Decisions"],
    ["meeting", ru ? "Встречи" : "Meetings"], ["notes", ru ? "Заметки и прочее" : "Notes & other"],
  ];
  return <>
    <div className="documents-heading">
      <div><p className="eyebrow">{ru ? "БИБЛИОТЕКА ПРОЕКТА · ЛОКАЛЬНО" : "LOCAL PROJECT LIBRARY"}</p><p className="muted">{ru ? "Находите рабочие документы и переходите к связанным записям." : "Find project documents and open the records they reference."}</p></div>
      <button className="button primary" onClick={() => onCreate("document")}><Plus size={17}/>{ru ? "Создать документ" : "Create document"}</button>
    </div>
    <div className="documents-toolbar">
      <label className="search-input"><Search size={17}/><span className="sr-only">{ru ? "Поиск документов" : "Search documents"}</span><input className="input" value={query} onChange={event => setQuery(event.target.value)} placeholder={ru ? "Название, текст, тип или ID связи…" : "Title, text, type, or linked ID…"}/></label>
      <label className="view-control">{ru ? "Сортировка" : "Sort"}<select className="input" value={sort} onChange={event => setSort(event.target.value as typeof sort)}><option value="recent">{ru ? "Сначала недавние" : "Recently updated"}</option><option value="title">{ru ? "По названию" : "Title"}</option></select></label>
    </div>
    <nav className="documents-categories" aria-label={ru ? "Категории документов" : "Document categories"}>
      {categories.map(([id, label]) => <button className={category === id ? "active" : ""} aria-pressed={category === id} key={id} onClick={() => setCategory(id)}>{label}</button>)}
      <span className="muted">{rows.length} / {workspace.documents.filter(item => item.projectId === project.id).length}</span>
    </nav>
    {rows.length ? <div className="catalog-grid inline-grid document-grid">
      {rows.map(document => {
        const linked = document.relatedIds.map(id => ({ id, record: linkedRecord(workspace, id) })).filter((x): x is { id: string; record: NonNullable<ReturnType<typeof linkedRecord>> } => Boolean(x.record));
        return <article className={`catalog-card document-card ${document.pinned ? "pinned" : ""}`} key={document.id}>
          <div className="document-card-head"><FileText size={21}/><span className="eyebrow">{document.type.startsWith("template:") ? (ru ? "Шаблон" : "Template") : document.type}</span><button className="icon-button pin-button" aria-pressed={Boolean(document.pinned)} aria-label={`${document.pinned ? (ru ? "Открепить" : "Unpin") : (ru ? "Закрепить" : "Pin")} ${document.title}`} title={document.pinned ? (ru ? "Открепить" : "Unpin") : (ru ? "Закрепить" : "Pin")} onClick={() => setPinned(document)}><Pin size={16}/></button></div>
          <h3>{document.title}</h3>
          <p className="document-preview">{document.body.replaceAll("#", "").slice(0, 180) || (ru ? "Документ пока пуст. Откройте его, чтобы добавить содержание." : "This document is empty. Open it to add content.")}</p>
          {linked.length > 0 && <div className="document-links"><span className="muted">{ru ? "Связи" : "Linked records"}</span>{linked.slice(0, 4).map(({ id, record }) => <button className="button small" key={id} onClick={() => onEdit(record.kind, id)}>{record.title}</button>)}{linked.length > 4 && <span className="muted">+{linked.length - 4}</span>}</div>}
          <div className="card-foot"><span className="muted">{formatDate(document.updatedAt.slice(0, 10), locale)}</span><div className="button-row"><button className="button small" onClick={() => onEdit("document", document.id)}>{ru ? "Открыть / изменить" : "Open / edit"}</button><button className="button small" onClick={() => downloadMarkdown(document.title, document.body)}>{ru ? "Скачать Markdown" : "Download Markdown"}</button></div></div>
        </article>;
      })}
    </div> : <section className="portfolio-empty" role="status"><strong>{query || category !== "all" ? (ru ? "Подходящие документы не найдены" : "No matching documents") : (ru ? "Документы проекта появятся здесь" : "Project documents will appear here")}</strong><p>{query || category !== "all" ? (ru ? "Измените поиск или категорию." : "Adjust the search or category.") : (ru ? "Создайте заметку, устав или статусный документ либо примените шаблон." : "Create a note, charter, status report, or apply a template.")}</p><button className="button small" onClick={() => query || category !== "all" ? (setQuery(""), setCategory("all")) : onCreate("document")}>{query || category !== "all" ? (ru ? "Сбросить фильтры" : "Reset filters") : (ru ? "Создать документ" : "Create document")}</button></section>}
  </>;
}

function downloadMarkdown(title: string, body: string) {
  const blob = new Blob([body], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = `${title.replace(/[\\/:*?"<>|]/gu, "-")}.md`; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
