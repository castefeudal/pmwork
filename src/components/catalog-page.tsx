"use client";
import { useMemo, useState } from "react";
import {
  BookOpen,
  Copy,
  ExternalLink,
  FileDown,
  Search,
  Wrench,
} from "lucide-react";
import type { Locale } from "@/domain/schemas";
import {
  glossary,
  knowledgeDomains,
  methods,
  pick,
  playbooks,
  sources,
  templates,
} from "@/content/catalog";
import { demoWorkspace, localizeBundledDemo } from "@/data/demo";
import { loadWorkspace, saveWorkspace } from "@/data/storage";

type Kind = "methods" | "templates" | "playbooks" | "knowledge" | "glossary";
export function CatalogPage({ kind, locale }: { kind: Kind; locale: Locale }) {
  const [query, setQuery] = useState(""),
    [feedback, setFeedback] = useState("");
  const ru = locale === "ru";
  const meta = {
    methods: [
      ru ? "Библиотека методов" : "Methods library",
      ru
        ? "Выбирайте подход по контексту, а не по моде."
        : "Choose an approach by context, not fashion.",
    ],
    templates: [
      ru ? "Рабочие шаблоны" : "Practical templates",
      ru
        ? "Готовые поля, рекомендации и типичные ошибки — не пустые документы."
        : "Real fields, guidance, and anti-patterns—not empty documents.",
    ],
    playbooks: [
      ru ? "Практические сценарии руководителя проекта" : "PM playbooks",
      ru
        ? "Проблема → диагностика → действие → стабилизация."
        : "Problem → diagnosis → action → stabilization.",
    ],
    knowledge: [
      ru ? "База знаний" : "Knowledge base",
      ru
        ? "Коротко настолько, насколько возможно; полно настолько, насколько нужно."
        : "As concise as possible; as complete as necessary.",
    ],
    glossary: [
      ru ? "Профессиональный глоссарий" : "Professional glossary",
      ru
        ? "Естественные термины на русском и английском с практическим примером."
        : "Natural RU/EN terminology with a practical example.",
    ],
  }[kind];
  const copy = async (value: string) => {
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard)
        throw new Error();
      await navigator.clipboard.writeText(value);
      setFeedback(ru ? "Шаблон скопирован" : "Template copied");
    } catch {
      setFeedback(
        ru
          ? "Не удалось скопировать — скачайте Markdown"
          : "Could not copy — download Markdown instead",
      );
    }
    setTimeout(() => setFeedback(""), 2400);
  };
  const applyTemplate = async (template: (typeof templates)[number]) => {
    try {
      const stored = await loadWorkspace(),
        workspace = stored
          ? localizeBundledDemo(stored, locale)
          : demoWorkspace(locale),
        project = workspace.projects[0];
      if (!project) throw new Error();
      const at = new Date().toISOString(),
        body = `# ${pick(template.title, locale)}\n\n${template.fields.map((field) => `## ${pick(field, locale)}\n\n_${pick(template.guidance, locale)}_`).join("\n\n")}`;
      await saveWorkspace({
        ...workspace,
        locale,
        documents: [
          ...workspace.documents,
          {
            id: `DOC-${crypto.randomUUID().slice(0, 8)}`,
            projectId: project.id,
            title: pick(template.title, locale),
            type: `template:${template.slug}`,
            body,
            relatedIds: [],
            updatedAt: at,
          },
        ],
        activities: [
          ...workspace.activities,
          {
            id: `ACT-${crypto.randomUUID().slice(0, 8)}`,
            projectId: project.id,
            at,
            type: "template",
            message: ru
              ? `Шаблон «${pick(template.title, locale)}» применён как документ`
              : `Template “${pick(template.title, locale)}” applied as a document`,
          },
        ],
      });
      setFeedback(
        ru
          ? `Шаблон добавлен в документы проекта «${project.name}»`
          : `Template added to “${project.name}” documents`,
      );
    } catch {
      setFeedback(
        ru ? "Не удалось применить шаблон" : "Could not apply template",
      );
    }
    setTimeout(() => setFeedback(""), 3200);
  };
  const data = useMemo(() => {
    const q = query.toLowerCase();
    if (kind === "methods")
      return methods.filter((x) =>
        (pick(x.title, locale) + pick(x.summary, locale))
          .toLowerCase()
          .includes(q),
      );
    if (kind === "templates")
      return templates.filter((x) =>
        (pick(x.title, locale) + pick(x.purpose, locale))
          .toLowerCase()
          .includes(q),
      );
    if (kind === "playbooks")
      return playbooks.filter((x) =>
        pick(x.title, locale).toLowerCase().includes(q),
      );
    if (kind === "knowledge")
      return knowledgeDomains.filter((x) =>
        pick(x, locale).toLowerCase().includes(q),
      );
    return glossary.filter((x) =>
      (x.term + x.ru + pick(x.definition, locale)).toLowerCase().includes(q),
    );
  }, [kind, locale, query]);
  const kindLabel = {
    methods: ru ? "методы" : "methods",
    templates: ru ? "шаблоны" : "templates",
    playbooks: ru ? "практические сценарии" : "playbooks",
    knowledge: ru ? "база знаний" : "knowledge",
    glossary: ru ? "глоссарий" : "glossary",
  }[kind];
  return (
    <>
      <header className="catalog-hero">
        <p className="eyebrow">PMWORK · {kindLabel}</p>
        <h1>{meta[0]}</h1>
        <p className="lead">{meta[1]}</p>
        <div className="catalog-controls">
          <label className="field">
            <span className="sr-only">{ru ? "Поиск" : "Search"}</span>
            <span className="search-input">
              <Search size={18} />
              <input
                className="input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  ru
                    ? "Найти по названию или смыслу…"
                    : "Search by title or meaning…"
                }
              />
            </span>
          </label>
          <span className="pill">
            {data.length} {ru ? "материалов" : "items"}
          </span>
        </div>
      </header>
      <section className="catalog-grid" aria-live="polite">
        {kind === "methods" &&
          (data as typeof methods).map((x) => (
            <details className="catalog-card" key={x.slug}>
              <summary>
                <span className="pill">{x.version}</span>
                <h2>{pick(x.title, locale)}</h2>
                <p>{pick(x.summary, locale)}</p>
              </summary>
              <h3>{ru ? "Как течёт работа" : "How work flows"}</h3>
              <p>{pick(x.flow, locale)}</p>
              <h3>{ru ? "Лучший контекст" : "Best fit"}</h3>
              <p>{pick(x.bestFit, locale)}</p>
              <h3>{ru ? "Ограничения" : "Limitations"}</h3>
              <p>{pick(x.limitations, locale)}</p>
              <h3>{ru ? "Типичные ошибки" : "Anti-patterns"}</h3>
              <p>{pick(x.antiPatterns, locale)}</p>
              <h3>{ru ? "Адаптация" : "Tailoring"}</h3>
              <p>{pick(x.tailoring, locale)}</p>
              <h3>{ru ? "Чек-лист внедрения" : "Implementation checklist"}</h3>
              <ol>
                {x.checklist.map((y) => (
                  <li key={pick(y, locale)}>{pick(y, locale)}</li>
                ))}
              </ol>
              <div className="card-foot">
                <small>
                  {ru ? "Проверено" : "Reviewed"}: {x.updatedAt}
                </small>
                <span>
                  {x.sourceIds.map((id) => (
                    <a
                      key={id}
                      href={sources.find((s) => s.id === id)?.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink size={15} />
                      <span className="sr-only">{id}</span>
                    </a>
                  ))}
                </span>
              </div>
            </details>
          ))}
        {kind === "templates" &&
          (data as typeof templates).map((x) => (
            <article className="catalog-card" key={x.slug}>
              <span className="pill">
                {ru
                  ? ({
                      core: "основа",
                      planning: "планирование",
                      delivery: "выполнение",
                      control: "контроль",
                      people: "люди",
                      closure: "закрытие",
                    }[x.category.toLowerCase()] ?? x.category)
                  : x.category}
              </span>
              <h2>{pick(x.title, locale)}</h2>
              <p>{pick(x.purpose, locale)}</p>
              <details>
                <summary>
                  {ru ? "Поля и рекомендации" : "Fields and guidance"}
                </summary>
                <ul>
                  {x.fields.map((f) => (
                    <li key={pick(f, locale)}>{pick(f, locale)}</li>
                  ))}
                </ul>
                <p>
                  <strong>{ru ? "Когда использовать" : "When to use"}:</strong>{" "}
                  {pick(x.when, locale)}
                </p>
                <p>
                  <strong>{ru ? "Типичная ошибка" : "Anti-pattern"}:</strong>{" "}
                  {pick(x.antiPattern, locale)}
                </p>
              </details>
              <div className="card-foot">
                <button
                  className="button small primary"
                  onClick={() => applyTemplate(x)}
                >
                  <FileDown size={15} />
                  {ru ? "Применить в проекте" : "Apply to project"}
                </button>
                <button
                  className="button small"
                  onClick={() =>
                    copy(
                      `# ${pick(x.title, locale)}\n\n${x.fields.map((f) => `## ${pick(f, locale)}\n`).join("\n")}`,
                    )
                  }
                >
                  <Copy size={15} />
                  {ru ? "Копировать" : "Copy"}
                </button>
                <button
                  className="button small"
                  onClick={() =>
                    download(
                      `${x.slug}.md`,
                      `# ${pick(x.title, locale)}\n\n${x.fields.map((f) => `## ${pick(f, locale)}\n\n_${pick(x.guidance, locale)}_`).join("\n\n")}`,
                    )
                  }
                >
                  <FileDown size={15} />
                  Markdown
                </button>
              </div>
            </article>
          ))}
        {kind === "playbooks" &&
          (data as typeof playbooks).map((x) => (
            <article className="catalog-card" key={x.slug}>
              <span className="pill">
                {ru
                  ? "Диагностика → действие → стабилизация"
                  : "Diagnose → Act → Stabilize"}
              </span>
              <h2>{pick(x.title, locale)}</h2>
              <p>
                <strong>{ru ? "Диагностика" : "Diagnose"}:</strong>{" "}
                {pick(x.diagnose[0]!, locale)}
              </p>
              <details>
                <summary>
                  {ru ? "Открыть практический сценарий" : "Open playbook"}
                </summary>
                <h3>{ru ? "Сразу" : "Immediate"}</h3>
                <ol>
                  {x.immediate.map((y) => (
                    <li key={pick(y, locale)}>{pick(y, locale)}</li>
                  ))}
                </ol>
                <h3>{ru ? "Следующий цикл" : "Next working cycle"}</h3>
                <p>{pick(x.next[0]!, locale)}</p>
                <h3>{ru ? "Стабилизировать" : "Stabilize"}</h3>
                <p>{pick(x.stabilize[0]!, locale)}</p>
                <h3>{ru ? "Предотвратить" : "Prevent recurrence"}</h3>
                <p>{pick(x.prevent[0]!, locale)}</p>
                <h3>{ru ? "Метрики" : "Metrics"}</h3>
                <ul>
                  {x.metrics.map((y) => (
                    <li key={pick(y, locale)}>{pick(y, locale)}</li>
                  ))}
                </ul>
                <h3>{ru ? "Типичные ошибки" : "Anti-patterns"}</h3>
                <ul>
                  {x.antiPatterns.map((y) => (
                    <li key={pick(y, locale)}>{pick(y, locale)}</li>
                  ))}
                </ul>
              </details>
            </article>
          ))}
        {kind === "knowledge" &&
          (data as typeof knowledgeDomains).map((x, i) => (
            <article className="catalog-card" key={pick(x, locale)}>
              <BookOpen size={22} />
              <p className="eyebrow">{String(i + 1).padStart(2, "0")}</p>
              <h2>{pick(x, locale)}</h2>
              <p>
                {ru
                  ? "Раздел связывает понятия, практические решения, применимость, ограничения и связанные инструменты PMWORK."
                  : "This domain connects concepts, practical decisions, applicability, limitations, and related PMWORK tools."}
              </p>
              <div className="card-foot">
                <span className="pill">
                  {ru ? "От основ к углублению" : "Foundation → Advanced"}
                </span>
              </div>
            </article>
          ))}
        {kind === "glossary" &&
          (data as typeof glossary).map((x) => (
            <article className="catalog-card" key={x.term}>
              <span className="pill">{ru ? x.term : x.ru}</span>
              <h2>{ru ? x.ru : x.term}</h2>
              <p>{pick(x.definition, locale)}</p>
              <p>
                <strong>{ru ? "Пример" : "Example"}:</strong>{" "}
                {pick(x.example, locale)}
              </p>
            </article>
          ))}
        {!data.length && (
          <div className="panel">
            <Wrench />
            <h2>{ru ? "Ничего не найдено" : "No matches"}</h2>
            <p className="muted">
              {ru
                ? "Измените запрос или очистите поиск."
                : "Change or clear the search query."}
            </p>
          </div>
        )}
      </section>
      {feedback && (
        <div className="toast" role="status">
          {feedback}
        </div>
      )}
    </>
  );
}
function download(name: string, body: string) {
  const blob = new Blob([body], { type: "text/markdown" });
  const u = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = u;
  a.download = name;
  a.click();
  URL.revokeObjectURL(u);
}
