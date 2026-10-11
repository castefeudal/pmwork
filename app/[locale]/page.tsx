import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChartNoAxesCombined,
  Check,
  Compass,
  LayoutDashboard,
  LockKeyhole,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Locale } from "@/domain/schemas";
import { contentCounts } from "@/content/catalog";
import { demoWorkspace } from "@/data/demo";
import { PublicHeader } from "@/components/public-header";
import { RoleShowcase } from "@/components/role-showcase";
import { ProductShowcase } from "@/components/product-showcase";
import { Footer } from "@/components/footer";

export function generateStaticParams() {
  return [{ locale: "ru" }, { locale: "en" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const ru = locale === "ru";
  const title = ru
    ? "PMWORK — ясность в управлении работой"
    : "PMWORK — clarity for complex work";
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
    kicker: "ПРОЕКТЫ · ПРОГРАММЫ · ПОСТАВКА · ОПЕРАЦИИ",
    titleTop: "Задачи, сроки",
    titleBottom: "и решения — в одном месте.",
    lead: "Ведите работу, фиксируйте риски и решения, следите за сроками. PMWORK связывает записи и показывает, что требует внимания. Данные хранятся в браузере — аккаунт не нужен.",
    start: "Открыть рабочее пространство",
    startAccessible: "Открыть рабочее пространство",
    explore: "Интерактивный пример",
    value: ["Без аккаунта", "Работает офлайн", "Резервную копию можно скачать"],
    created: "Независимый продукт Павла Маркова",
    scroll: "ИНТЕРАКТИВНЫЙ ПРИМЕР PMWORK",
    libraryLabel: "ИНСТРУМЕНТЫ И ЗНАНИЯ",
    capabilityTitle: "Что можно делать в PMWORK",
    capabilityLead: "Создавайте задачи, следите за сроками, связывайте риски и решения. В сводке видны блокеры и ближайшие контрольные точки.",
    features: [
      { icon: LayoutDashboard, label: "Сводка", title: "Найдите блокеры и ближайшие сроки", body: "Смотрите задачи, контрольные точки и причины задержек. Сигналы ведут к исходным записям.", href: "/workspace/", link: "Открыть пример" },
      { icon: Workflow, label: "Работа", title: "Ведите задачи списком, на доске или в календаре", body: "Это одни и те же записи: смените вид, чтобы спланировать неделю или разобрать очередь.", href: "/workspace/", link: "Посмотреть задачи" },
      { icon: ShieldCheck, label: "Риски и решения", title: "Назначайте владельцев и фиксируйте договорённости", body: "Укажите, что может случиться, по какому признаку действовать и какое решение принято.", href: "/workspace/", link: "Посмотреть управление" },
      { icon: ChartNoAxesCombined, label: "Расчёты", title: "Проверяйте сроки и оценки", body: "CPM, PERT, EVM, RICE, WSJF и Monte Carlo. Расчёты показывают исходные данные и допущения.", href: "/tools/", link: "Открыть инструменты" },
      { icon: Compass, label: "Методы", title: "Выбирайте способ работы по условиям проекта", body: "Сравните подходы по стабильности требований, срокам, зависимостям и частоте обратной связи.", href: "/methods/", link: "Сравнить методы" },
      { icon: BookOpen, label: "Шаблоны и инструкции", title: "Начните с готовой структуры", body: `${contentCounts.methods} методов, ${contentCounts.templates} шаблонов, ${contentCounts.playbooks} практических сценариев и ${contentCounts.glossary} терминов.`, href: "/knowledge/", link: "Открыть библиотеку" },
    ],
    privacyEyebrow: "ХРАНЕНИЕ ДАННЫХ",
    privacyTitle: "Проект хранится в этом браузере",
    privacyLead: "PMWORK работает без аккаунта и сети. Данные сохраняются на устройстве; для переноса скачайте резервную копию и восстановите её в другом браузере.",
    privacyPoints: ["Автоматическое сохранение на устройстве", "Скачивание резервной копии", "Проверка файла перед восстановлением", "Перенос связей и истории записей"],
    privacyBadge: "ЛОКАЛЬНОЕ ХРАНЕНИЕ",
    privacyStatus: "Устройство · доступно офлайн",
    privacyHint: "Данные не покидают браузер без вашего действия",
    libraryEyebrow: "СПРАВОЧНИКИ И ШАБЛОНЫ",
    librarySectionTitle: "Материалы для повседневной работы",
    libraryLead: "Откройте нужный раздел, чтобы сравнить методы, взять шаблон или найти определение.",
    library: [
      ["Методы", `${contentCounts.methods}`, "Выбрать, сравнить и адаптировать", "/methods/"],
      ["Шаблоны", `${contentCounts.templates}`, "Начать с хорошей структуры", "/templates/"],
      ["Практические сценарии", `${contentCounts.playbooks}`, "Разобрать реальную ситуацию", "/playbooks/"],
      ["Глоссарий", `${contentCounts.glossary}`, "Говорить с командой точнее", "/glossary/"],
    ],
    approachEyebrow: "ВЫБОР МЕТОДА",
    approachTitle: "Выбирайте метод по условиям проекта",
    approachLead: "Сравните, как разные подходы справляются с изменением требований, зависимостями и сроками. В описаниях указаны ограничения и варианты адаптации.",
    approaches: [["Предиктивный", "Стабильность"], ["Scrum", "Обратная связь"], ["Kanban", "Поток"], ["Гибридный", "Адаптация"], ["PRINCE2", "Управление"]],
    principles: ["Требования стабильны — планируйте этапы и критерии приёмки.", "Нужна частая обратная связь — проверяйте результат короткими циклами.", "Работа идёт непрерывно — ограничьте число незавершённых задач."],
    finalEyebrow: "НАЧАТЬ",
    finalTitle: "Сначала посмотрите пример или создайте проект",
    finalLead: "Откройте рабочее пространство: там можно выбрать демонстрационный проект, создать свой или восстановить резервную копию.",
    finalStart: "Открыть рабочее пространство",
    finalDemo: "Перейти к примеру",
    noSetup: "Без регистрации",
  },
  en: {
    kicker: "PROJECTS · PROGRAMS · DELIVERY · OPERATIONS",
    titleTop: "Work, deadlines,",
    titleBottom: "and decisions in one place.",
    lead: "Track work, risks, decisions, and dates. PMWORK links related records and shows what needs attention. Your data stays in this browser; no account is required.",
    start: "Open your workspace",
    startAccessible: "Open workspace",
    explore: "Interactive example",
    value: ["No account", "Works offline", "Download a backup"],
    created: "An independent product by Pavel Markov",
    scroll: "INTERACTIVE PMWORK EXAMPLE",
    libraryLabel: "TOOLS AND KNOWLEDGE",
    capabilityTitle: "What you can do in PMWORK",
    capabilityLead: "Create work items, track dates, and link risks to decisions. The overview shows blockers and upcoming milestones.",
    features: [
      { icon: LayoutDashboard, label: "Overview", title: "Find blockers and upcoming dates", body: "See work items, milestones, and reasons for delays. Signals link to their source records.", href: "/workspace/", link: "Open the example" },
      { icon: Workflow, label: "Work", title: "Use a list, board, or calendar", body: "Each view shows the same work items. Switch views to plan a week or review the queue.", href: "/workspace/", link: "View work items" },
      { icon: ShieldCheck, label: "Risks and decisions", title: "Assign owners and record decisions", body: "Note what could happen, what would trigger action, and which decision was made.", href: "/workspace/", link: "View risk management" },
      { icon: ChartNoAxesCombined, label: "Calculations", title: "Check schedules and estimates", body: "CPM, PERT, EVM, RICE, WSJF, and Monte Carlo show their inputs and assumptions.", href: "/tools/", link: "Open the tools" },
      { icon: Compass, label: "Methods", title: "Choose an approach for your constraints", body: "Compare methods by requirements stability, deadlines, dependencies, and feedback cadence.", href: "/methods/", link: "Compare methods" },
      { icon: BookOpen, label: "Templates and guides", title: "Start with a working structure", body: `${contentCounts.methods} methods, ${contentCounts.templates} templates, ${contentCounts.playbooks} practical guides, and ${contentCounts.glossary} terms.`, href: "/knowledge/", link: "Open the library" },
    ],
    privacyEyebrow: "DATA STORAGE",
    privacyTitle: "Your project stays in this browser",
    privacyLead: "PMWORK works without an account or network connection. Data is stored on this device. To move it, download a backup and restore it in another browser.",
    privacyPoints: ["Automatic saving on this device", "Downloadable backups", "Backup checked before restore", "Record links and history are included"],
    privacyBadge: "LOCAL STORAGE",
    privacyStatus: "This device · available offline",
    privacyHint: "Your data stays in the browser until you choose to move it",
    libraryEyebrow: "REFERENCE AND TEMPLATES",
    librarySectionTitle: "Material for everyday project work",
    libraryLead: "Open a section to compare methods, use a template, work through a scenario, or look up a term.",
    library: [
      ["Methods", `${contentCounts.methods}`, "Choose, compare, and tailor", "/methods/"],
      ["Templates", `${contentCounts.templates}`, "Start with a strong structure", "/templates/"],
      ["Playbooks", `${contentCounts.playbooks}`, "Work through a real situation", "/playbooks/"],
      ["Glossary", `${contentCounts.glossary}`, "Give the team a shared language", "/glossary/"],
    ],
    approachEyebrow: "CHOOSING A METHOD",
    approachTitle: "Choose a method for the project conditions",
    approachLead: "Compare how approaches handle changing requirements, dependencies, and deadlines. Each guide covers limits and ways to adapt it.",
    approaches: [["Predictive", "Stability"], ["Scrum", "Feedback"], ["Kanban", "Flow"], ["Hybrid", "Adaptation"], ["PRINCE2", "Governance"]],
    principles: ["Stable requirements: plan phases and acceptance criteria.", "Frequent feedback: review results in short cycles.", "Continuous flow: limit unfinished work."],
    finalEyebrow: "GET STARTED",
    finalTitle: "Open the example or create a project",
    finalLead: "Open the workspace to choose a sample project, create your own, or restore a backup.",
    finalStart: "Open the workspace",
    finalDemo: "Go to the example",
    noSetup: "No account required",
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

        <RoleShowcase locale={locale}/>
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
