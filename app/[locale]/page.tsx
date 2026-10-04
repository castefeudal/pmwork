import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChartNoAxesCombined,
  Check,
  CircleDot,
  Compass,
  LayoutDashboard,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Locale } from "@/domain/schemas";
import { contentCounts } from "@/content/catalog";
import { demoWorkspace } from "@/data/demo";
import { PublicHeader } from "@/components/public-header";
import { ProductShowcase } from "@/components/product-showcase";
import { Footer } from "@/components/footer";

export function generateStaticParams() {
  return [{ locale: "ru" }, { locale: "en" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const ru = locale === "ru";
  const title = ru
    ? "PMWORK — ясность в сложных проектах"
    : "PMWORK — clarity for complex projects";
  const description = ru
    ? "Ведите работу, риски, решения и сроки в одной практической системе. Без аккаунта: данные проекта остаются на вашем устройстве."
    : "Bring work, risks, decisions, and schedules into one practical system. No account: your project data stays on your device.";
  return {
    title,
    description,
    authors: [{ name: "Pavel Markov" }],
    creator: "Pavel Markov",
    alternates: {
      canonical: `https://castefeudal.github.io/pmwork/${locale}/`,
      languages: {
        ru: "https://castefeudal.github.io/pmwork/ru/",
        en: "https://castefeudal.github.io/pmwork/en/",
      },
    },
    openGraph: {
      title,
      description,
      url: `https://castefeudal.github.io/pmwork/${locale}/`,
      type: "website",
      images: [{
        url: "https://castefeudal.github.io/pmwork/og-image.png",
        width: 1200,
        height: 630,
        alt: ru ? "PMWORK — практическая система управления проектами" : "PMWORK — practical project management system",
      }],
    },
  };
}

const copy = {
  ru: {
    kicker: "ПРАКТИЧЕСКАЯ СИСТЕМА РУКОВОДИТЕЛЯ ПРОЕКТА",
    titleTop: "От хаоса проекта",
    titleBottom: "— к ясному следующему решению.",
    lead: "PMWORK связывает реальные сигналы проекта с решениями, действиями и контролем результата. Рабочие данные остаются на вашем устройстве.",
    start: "Открыть рабочее пространство",
    startAccessible: "Создать / открыть проект",
    explore: "Посмотреть продукт",
    value: ["Без аккаунта и обязательного сервера", "Работает офлайн", "Проект хранится у вас"],
    created: "Независимый продукт Павла Маркова",
    scroll: "ПРОДУКТ, КОТОРЫЙ ДУМАЕТ ВМЕСТЕ С ВАМИ",
    libraryLabel: "ИНСТРУМЕНТЫ И ЗНАНИЯ",
    capabilityTitle: "Всё необходимое — в одном рабочем ритме.",
    capabilityLead: "Не ещё одна доска задач. Связанный контур от сигнала до решения и следующего действия.",
    features: [
      { icon: LayoutDashboard, label: "Обзор проекта", title: "Важное видно сразу", body: "Сроки, контрольные точки, блокеры и здоровье проекта — с объяснением каждого сигнала.", href: "/workspace/", link: "Посмотреть обзор" },
      { icon: Workflow, label: "Ежедневная работа", title: "План становится движением", body: "Бэклог, Kanban, список и календарь связаны с исходными записями и зависимостями.", href: "/workspace/", link: "Войти в работу" },
      { icon: ShieldCheck, label: "Риски и решения", title: "Ничего важного не теряется", body: "RAID, владельцы, триггеры и история решений рядом с действиями команды.", href: "/workspace/", link: "Открыть управление" },
      { icon: ChartNoAxesCombined, label: "Расчёты и выбор", title: "Математика без чёрного ящика", body: "CPM, PERT, EVM, RICE, WSJF и Monte Carlo — с видимыми допущениями.", href: "/tools/", link: "Изучить инструменты" },
      { icon: Compass, label: "Выбор подхода", title: "Практика под контекст", body: "Сопоставляйте ограничения, ритм поставки и потребности команды.", href: "/methods/", link: "Сравнить подходы" },
      { icon: BookOpen, label: "База практик", title: "Знания, которые можно применить", body: `${contentCounts.methods} методов, ${contentCounts.templates} шаблонов, ${contentCounts.playbooks} сценариев и ${contentCounts.glossary} терминов.`, href: "/knowledge/", link: "Открыть библиотеку" },
    ],
    flowEyebrow: "ОДИН СВЯЗАННЫЙ ЦИКЛ",
    flowTitle: "От сигнала — к проверяемому результату.",
    flowLead: "Один связанный цикл на примере записей демо-проекта PMWORK.",
    flow: [
      ["СИГНАЛ", "Today показывает блокер «Провести проверку безопасности» и причину ожидания внешнего решения."],
      ["РЕШЕНИЕ", "В журнале виден открытый вопрос: переносить ли устаревший раздел вопросов и ответов."],
      ["ДЕЙСТВИЕ", "Рабочая запись связывает блокер с владельцем и следующим шагом команды."],
      ["КОНТРОЛЬ", "Контрольная точка готовности пилота содержит прогноз, статус и уверенность."],
      ["РЕЗУЛЬТАТ", "У проекта есть проверяемая цель: к Q1 не менее 60% типовых запросов решаются без оператора."],
    ],
    privacyEyebrow: "ВАША РАБОТА — ВАША",
    privacyTitle: "С самого начала всё под вашим контролем.",
    privacyLead: "Рабочее пространство создаётся на устройстве. PMWORK не просит регистрацию, не отправляет проект на обязательный сервер и продолжает работать без сети.",
    privacyPoints: ["Автоматическое локальное сохранение", "Экспортируемые резервные копии", "Импорт с предварительной проверкой", "Связи и историю можно перенести"],
    privacyBadge: "ЛОКАЛЬНОЕ ХРАНЕНИЕ",
    privacyStatus: "Устройство · доступно офлайн",
    privacyHint: "Данные не покидают браузер без вашего действия",
    libraryEyebrow: "БИБЛИОТЕКА PMWORK",
    librarySectionTitle: "Учитесь на практике. Действуйте увереннее.",
    libraryLead: "От точного термина — к методу, шаблону и действию в проекте.",
    library: [
      ["Методы", `${contentCounts.methods}`, "Выбрать, сравнить и адаптировать", "/methods/"],
      ["Шаблоны", `${contentCounts.templates}`, "Начать с хорошей структуры", "/templates/"],
      ["Практические сценарии", `${contentCounts.playbooks}`, "Разобрать реальную ситуацию", "/playbooks/"],
      ["Глоссарий", `${contentCounts.glossary}`, "Говорить с командой точнее", "/glossary/"],
    ],
    approachEyebrow: "КОНТЕКСТ ВАЖНЕЕ ДОГМЫ",
    approachTitle: "Нет одной методологии для всех проектов.",
    approachLead: "Соберите достаточный уровень управления из реальных ограничений, а не из модного названия.",
    approaches: [["Предиктивный", "Стабильность"], ["Scrum", "Обратная связь"], ["Kanban", "Поток"], ["Гибридный", "Адаптация"], ["PRINCE2", "Управление"]],
    principles: ["Ценность важнее активности.", "Прозрачность важнее бюрократии.", "Каждый критичный риск — с владельцем."],
    finalEyebrow: "НАЧНИТЕ С ТОГО, ЧТО ЕСТЬ",
    finalTitle: "Верните себе ясность в проекте.",
    finalLead: "Посмотрите интерактивный обзор продукта или откройте своё рабочее пространство — без регистрации и лишней настройки.",
    finalStart: "Открыть PMWORK",
    finalDemo: "Посмотреть обзор продукта",
    noSetup: "Данные останутся на этом устройстве",
  },
  en: {
    kicker: "THE PRACTICAL OPERATING SYSTEM FOR PROJECT MANAGERS",
    titleTop: "From project noise",
    titleBottom: "to a clear next decision.",
    lead: "PMWORK connects real project signals to decisions, actions, and outcome control. Your working data stays on your device.",
    start: "Open your workspace",
    startAccessible: "Create / open project",
    explore: "See the product",
    value: ["No account or required server", "Works offline", "Your project stays yours"],
    created: "An independent product by Pavel Markov",
    scroll: "A PRODUCT THAT THINKS ALONG WITH YOU",
    libraryLabel: "TOOLS AND KNOWLEDGE",
    capabilityTitle: "Everything you need, in one working rhythm.",
    capabilityLead: "More than another task board. One connected path from signal to decision to next action.",
    features: [
      { icon: LayoutDashboard, label: "Project overview", title: "See what matters first", body: "Schedule, milestones, blockers, and project health, with every signal explained.", href: "/workspace/", link: "Explore the overview" },
      { icon: Workflow, label: "Daily delivery", title: "Turn the plan into progress", body: "Backlog, Kanban, list, and calendar connect to source records and dependencies.", href: "/workspace/", link: "Open your work" },
      { icon: ShieldCheck, label: "Risks and decisions", title: "Keep important things in view", body: "RAID, owners, triggers, and decision history stay close to the work.", href: "/workspace/", link: "Explore governance" },
      { icon: ChartNoAxesCombined, label: "Models and estimates", title: "Math without the black box", body: "CPM, PERT, EVM, RICE, WSJF, and Monte Carlo, with assumptions in view.", href: "/tools/", link: "Explore the tools" },
      { icon: Compass, label: "Approach fit", title: "Practice shaped around context", body: "Match constraints, delivery cadence, and team needs before choosing a method.", href: "/methods/", link: "Compare approaches" },
      { icon: BookOpen, label: "Practice library", title: "Knowledge you can put to work", body: `${contentCounts.methods} methods, ${contentCounts.templates} templates, ${contentCounts.playbooks} playbooks, and ${contentCounts.glossary} terms.`, href: "/knowledge/", link: "Open the library" },
    ],
    flowEyebrow: "ONE CONNECTED LOOP",
    flowTitle: "From signal to a verifiable result.",
    flowLead: "One connected loop, grounded in records from the PMWORK demo project.",
    flow: [
      ["SIGNAL", "Today surfaces the Complete security review blocker and the reason it is waiting on an external decision."],
      ["DECISION", "The decision log shows the open question: should legacy FAQ content be migrated?"],
      ["ACTION", "The work record connects the blocker to its owner and the team's next step."],
      ["CONTROL", "The Pilot ready milestone carries a forecast, status, and confidence value."],
      ["RESULT", "The project has a testable objective: by Q1, resolve at least 60% of routine requests without an agent."],
    ],
    privacyEyebrow: "YOUR WORK IS YOURS",
    privacyTitle: "You stay in control from the very first click.",
    privacyLead: "Your workspace lives on your device. PMWORK needs no account, sends no project to a required server, and keeps working offline.",
    privacyPoints: ["Automatic local saving", "Portable backup exports", "Imports validated before replacement", "Relationships and history stay portable"],
    privacyBadge: "LOCAL STORAGE",
    privacyStatus: "This device · available offline",
    privacyHint: "Your data stays in the browser until you choose to move it",
    libraryEyebrow: "THE PMWORK LIBRARY",
    librarySectionTitle: "Build expertise by putting it into practice.",
    libraryLead: "Move from a useful term to a method, a template, and a next step in your project.",
    library: [
      ["Methods", `${contentCounts.methods}`, "Choose, compare, and tailor", "/methods/"],
      ["Templates", `${contentCounts.templates}`, "Start with a strong structure", "/templates/"],
      ["Playbooks", `${contentCounts.playbooks}`, "Work through a real situation", "/playbooks/"],
      ["Glossary", `${contentCounts.glossary}`, "Give the team a shared language", "/glossary/"],
    ],
    approachEyebrow: "CONTEXT OVER DOGMA",
    approachTitle: "No single method fits every project.",
    approachLead: "Build just enough governance from real constraints, not a fashionable label.",
    approaches: [["Predictive", "Stability"], ["Scrum", "Feedback"], ["Kanban", "Flow"], ["Hybrid", "Adaptation"], ["PRINCE2", "Governance"]],
    principles: ["Value over activity.", "Transparency over bureaucracy.", "Every critical risk has an owner."],
    finalEyebrow: "START WHERE YOU ARE",
    finalTitle: "Bring clarity back to your project.",
    finalLead: "Explore the interactive product preview or open a workspace of your own. No signup and no setup overhead.",
    finalStart: "Open PMWORK",
    finalDemo: "See the product preview",
    noSetup: "Your data stays on this device",
  },
} as const;

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (raw !== "ru" && raw !== "en") notFound();
  const locale = raw as Locale;
  const ru = locale === "ru";
  const t = copy[locale];
  const demo = demoWorkspace(locale);
  const project = demo.projects.find((item) => item.id === "atlas");
  if (!project) notFound();
  const preview = {
    project: { name: project.name, objective: project.objective },
    work: demo.workItems.filter((item) => item.projectId === project.id && !item.archived).map(({ id, title, status, owner, dueDate, priority, blocked, blockerReason, done }) => ({ id, title, status, owner, dueDate, priority, blocked, blockerReason, done })),
    risks: demo.risks.filter((item) => item.projectId === project.id).map(({ id, title, trigger, status }) => ({ id, title, trigger, status })),
    decisions: demo.decisions.filter((item) => item.projectId === project.id).map(({ id, question, context, status }) => ({ id, question, context, status })),
    milestones: demo.milestones.filter((item) => item.projectId === project.id).map(({ title, forecastDate, status, progress, confidence }) => ({ title, forecastDate, status, progress, confidence })),
  };
  const featureLinks = t.features;

  return (
    <div className="shell site-shell">
      <PublicHeader locale={locale} />
      <main id="main" className="marketing-home">
        <section className="hero marketing-hero">
          <div className="hero-copy">
            <p className="hero-kicker"><span className="hero-kicker-dot" />{t.kicker}</p>
            <h1><span>{t.titleTop}</span><span className="hero-title-accent">{t.titleBottom}</span></h1>
            <p className="lead">{t.lead}</p>
            <div className="button-row hero-actions">
              <Link className="button primary" aria-label={t.startAccessible} href={`/${locale}/workspace/`}>{t.start}<ArrowRight size={17} aria-hidden="true" /></Link>
              <a className="button hero-secondary" href="#product-preview"><span className="hero-play" aria-hidden="true">▶</span>{t.explore}</a>
            </div>
            <ul className="hero-value-list">
              {t.value.map(item => <li key={item}><Check size={14} aria-hidden="true" />{item}</li>)}
            </ul>
            <p className="hero-author">{t.created} · <Link href={`/${locale}/about/`}>{ru ? "О продукте" : "About"}</Link></p>
          </div>
          <ProductShowcase locale={locale} preview={preview} />
          <a className="hero-scroll-cue" href="#capabilities"><span>{t.scroll}</span><ArrowDown size={14} aria-hidden="true" /></a>
        </section>

        <section className="proof-ribbon" aria-label={ru ? "Библиотека PMWORK" : "PMWORK library"}>
          <div className="proof-ribbon-inner">
            <div className="proof-ribbon-intro"><Sparkles size={17} aria-hidden="true" /><span>{ru ? "СИЛЬНАЯ ПРАКТИЧЕСКАЯ БАЗА" : "A PRACTICAL FOUNDATION"}</span></div>
            {[
              [contentCounts.methods, ru ? "методов" : "methods", "/methods/"],
              [contentCounts.templates, ru ? "шаблонов" : "templates", "/templates/"],
              [contentCounts.playbooks, ru ? "сценариев" : "playbooks", "/playbooks/"],
              [contentCounts.glossary, ru ? "терминов" : "terms", "/glossary/"],
            ].map(([value, label, href]) => <Link className="proof-ribbon-stat" href={`/${locale}${href}`} key={String(label)}><strong>{value}</strong><span>{label}</span><ArrowUpRight size={13} aria-hidden="true" /></Link>)}
          </div>
        </section>

        <section className="section marketing-section" id="capabilities">
          <div className="marketing-section-head">
            <div><p className="eyebrow">{t.libraryLabel}</p><h2>{t.capabilityTitle}</h2></div>
            <p>{t.capabilityLead}</p>
          </div>
          <div className="capability-grid">
            {featureLinks.map((feature, i) => {
              const Icon = feature.icon;
              return <Link className={`capability-card capability-card-${i + 1}`} href={`/${locale}${feature.href}`} key={feature.label}>
                <div className="capability-topline"><span className="capability-icon"><Icon size={19} strokeWidth={1.8} aria-hidden="true" /></span><span className="capability-number">0{i + 1}</span></div>
                <span className="capability-label">{feature.label}</span><h3>{feature.title}</h3><p>{feature.body}</p>
                <span className="capability-link">{feature.link}<ArrowUpRight size={15} aria-hidden="true" /></span>
              </Link>;
            })}
          </div>
        </section>

        <section className="section flow-section">
          <div className="marketing-section-head flow-head">
            <div><p className="eyebrow">{t.flowEyebrow}</p><h2>{t.flowTitle}</h2></div><p>{t.flowLead}</p>
          </div>
          <div className="flow-steps">
            {t.flow.map(([title, body], i) => <article className="flow-step" key={title}>
              <span className="flow-step-index"><span>0{i + 1}</span>{i < t.flow.length - 1 && <span className="flow-connector" aria-hidden="true" />}</span>
              <h3>{title}</h3><p>{body}</p>
            </article>)}
          </div>
          <div className="flow-proof"><span className="flow-proof-icon"><CircleDot size={18} /></span><p><strong>{ru ? "Каждый сигнал объясним." : "Every signal is explainable."}</strong> {ru ? "Каждый вывод ведёт к конкретной записи проекта, которую можно проверить и изменить." : "Every insight leads to a specific project record you can inspect and update."}</p><Link className="text-link" href={`/${locale}/workspace/`}>{ru ? "Посмотреть на примере" : "See it in the workspace"}<ArrowRight size={15} /></Link></div>
        </section>

        <section className="section privacy-section">
          <div className="privacy-copy"><p className="eyebrow">{t.privacyEyebrow}</p><h2>{t.privacyTitle}</h2><p className="privacy-lead">{t.privacyLead}</p><ul>{t.privacyPoints.map(item => <li key={item}><Check size={16} aria-hidden="true" />{item}</li>)}</ul><Link className="text-link" href={`/${locale}/privacy/`}>{ru ? "Как PMWORK обращается с данными" : "How PMWORK handles data"}<ArrowRight size={15} /></Link></div>
          <div className="privacy-visual" aria-label={t.privacyStatus}>
            <div className="privacy-orbit privacy-orbit-one" /><div className="privacy-orbit privacy-orbit-two" />
            <div className="privacy-device-card"><span className="privacy-lock"><LockKeyhole size={19} /></span><span className="privacy-card-label">{t.privacyBadge}</span><strong>{t.privacyStatus}</strong><span className="privacy-card-divider" /><span className="privacy-device-row"><span className="privacy-device-led" />{t.privacyHint}</span><span className="privacy-device-meta"><span>PMWORK</span><span>{ru ? "БРАУЗЕРНОЕ ХРАНИЛИЩЕ" : "BROWSER STORAGE"}</span></span></div>
            <span className="privacy-check privacy-check-one"><Check size={14} /></span><span className="privacy-check privacy-check-two"><ShieldCheck size={15} /></span>
          </div>
        </section>

        <section className="section library-section">
          <div className="marketing-section-head"><div><p className="eyebrow">{t.libraryEyebrow}</p><h2>{t.librarySectionTitle}</h2></div><p>{t.libraryLead}</p></div>
          <div className="library-grid">{t.library.map(([name, amount, description, href], i) => <Link className="library-card" href={`/${locale}${href}`} key={name}><span className="library-count">{amount}<small>{ru ? " материалов" : " resources"}</small></span><span className="library-name">{name}</span><span className="library-description">{description}</span><span className="library-arrow"><ArrowUpRight size={16} aria-hidden="true" /></span><span className="library-index">0{i + 1}</span></Link>)}</div>
        </section>

        <section className="section approach-section">
          <div className="approach-heading"><p className="eyebrow">{t.approachEyebrow}</p><h2>{t.approachTitle}</h2><p>{t.approachLead}</p></div>
          <div className="approach-content"><div className="approach-ribbon">{t.approaches.map(([title, quality], i) => <Link href={`/${locale}/methods/`} key={title} className="approach-item"><span className="approach-count">0{i + 1}</span><strong>{title}</strong><span>{quality}</span><ArrowUpRight size={14} aria-hidden="true" /></Link>)}</div><div className="approach-principles">{t.principles.map((principle, i) => <span key={principle}><span>0{i + 1}</span>{principle}</span>)}</div><Link className="text-link" href={`/${locale}/methods/`}>{ru ? "Найти подход для своего проекта" : "Find an approach for your project"}<ArrowRight size={15} /></Link></div>
        </section>

        <section className="closing-section">
          <div className="closing-glow" aria-hidden="true" />
          <p className="eyebrow">{t.finalEyebrow}</p><h2>{t.finalTitle}</h2><p>{t.finalLead}</p>
          <div className="button-row"><Link className="button primary" href={`/${locale}/workspace/`}>{t.finalStart}<ArrowRight size={17} aria-hidden="true" /></Link><a className="button closing-secondary" href="#product-preview">{t.finalDemo}<ArrowUpRight size={16} aria-hidden="true" /></a></div>
          <span className="closing-note"><LockKeyhole size={13} aria-hidden="true" />{t.noSetup}</span>
        </section>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
