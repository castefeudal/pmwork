import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ChartNoAxesCombined,
  GitBranch,
  LayoutDashboard,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Locale } from "@/domain/schemas";
import { ui } from "@/content/ui";
import { contentCounts } from "@/content/catalog";
import { PublicHeader } from "@/components/public-header";
import { Footer } from "@/components/footer";
export function generateStaticParams() {
  return [{ locale: "ru" }, { locale: "en" }];
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{
    locale: string;
  }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title:
      locale === "ru"
        ? "PMWORK — операционная система руководителя проекта"
        : "PMWORK — Project Management Operating System",
    description:
      locale === "ru"
        ? "Ведите проекты, бэклог, риски, сроки и решения в одной системе с локальным хранением данных."
        : "Run projects, backlog, risks, schedule, and decisions in one local-first system.",
    alternates: {
      canonical: `https://castefeudal.github.io/pmwork/${locale}/`,
      languages: {
        ru: "https://castefeudal.github.io/pmwork/ru/",
        en: "https://castefeudal.github.io/pmwork/en/",
      },
    },
    openGraph: {
      title:
        locale === "ru"
          ? "PMWORK — операционная система руководителя проекта"
          : "PMWORK — Project Management Operating System",
      description:
        locale === "ru"
          ? "Практическая система управления проектами с локальным хранением данных."
          : "A practical local-first project management system.",
      url: `https://castefeudal.github.io/pmwork/${locale}/`,
      type: "website",
      images: [
        {
          url: "https://castefeudal.github.io/pmwork/og-image.png",
          width: 1200,
          height: 630,
          alt:
            locale === "ru"
              ? "PMWORK — система управления проектами"
              : "PMWORK project management system",
        },
      ],
    },
  };
}
export default async function Home({
  params,
}: {
  params: Promise<{
    locale: string;
  }>;
}) {
  const { locale: raw } = await params;
  if (raw !== "ru" && raw !== "en") notFound();
  const locale = raw as Locale,
    t = ui(locale),
    ru = locale === "ru";
  return (
    <div className="shell">
      <PublicHeader locale={locale} />
      <main id="main">
        <section className="hero">
          <div>
            <p className="eyebrow">{t.hero.eyebrow}</p>
            <h1>{t.hero.title}</h1>
            <p className="lead">{t.hero.lead}</p>
            <div className="button-row">
              <Link className="button primary" href={`/${locale}/workspace`}>
                {t.hero.open}
                <ArrowRight size={18} />
              </Link>
              <Link className="button secondary" href={`/${locale}/tools#fit`}>
                {t.hero.choose}
              </Link>
            </div>
            <div className="trust-line">
              <span>{ru ? "Локальное хранение" : "Local-first"}</span>
              <span>RU / EN</span>
            </div>
          </div>
          <div
            className="cockpit-preview"
            aria-label={
              ru ? "Пример интерфейса PMWORK" : "PMWORK interface preview"
            }
          >
            <div className="cockpit-head">
              <strong>{ru ? "Запуск Atlas" : "Atlas launch"}</strong>
              <span className="status warn">
                {ru ? "Есть риски" : "At risk"}
              </span>
            </div>
            <div className="cockpit-body">
              <div className="mini-side">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="mini-main">
                <div className="metric-grid">
                  <div className="metric">
                    <small>WIP</small>
                    <strong>7</strong>
                  </div>
                  <div className="metric">
                    <small>{ru ? "Риски" : "Risks"}</small>
                    <strong>4</strong>
                  </div>
                  <div className="metric">
                    <small>SPI</small>
                    <strong>0.94</strong>
                  </div>
                </div>
                <div className="preview-board">
                  <div className="preview-column">
                    <small>{ru ? "ГОТОВО · 3" : "READY · 3"}</small>
                    <div className="preview-card">
                      {ru
                        ? "Согласовать границы релиза"
                        : "Align release scope"}
                    </div>
                  </div>
                  <div className="preview-column">
                    <small>{ru ? "В РАБОТЕ · 2/3" : "IN PROGRESS · 2/3"}</small>
                    <div className="preview-card">
                      {ru ? "Миграция каталога" : "Catalog migration"}
                    </div>
                    <div className="preview-card">
                      {ru ? "План приёмки" : "Acceptance plan"}
                    </div>
                  </div>
                  <div className="preview-column">
                    <small>{ru ? "НА ПРОВЕРКЕ · 1" : "REVIEW · 1"}</small>
                    <div className="preview-card">
                      {ru ? "Проверка безопасности" : "Security review"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">
                {ru
                  ? "ПОНЯТЬ → РЕШИТЬ → СДЕЛАТЬ → КОНТРОЛИРОВАТЬ → НАУЧИТЬСЯ"
                  : "UNDERSTAND → DECIDE → DO → CONTROL → LEARN"}
              </p>
              <h2>
                {ru ? "Знания становятся работой" : "Knowledge becomes work"}
              </h2>
            </div>
            <p>
              {ru
                ? "PMWORK помогает вести риск от оценки до реагирования: вероятность, влияние, владелец, триггер, действия и дата следующей проверки."
                : "PMWORK supports risk assessment and response: probability, impact, owner, trigger, actions and next review date."}
            </p>
          </div>
          <div className="feature-grid">
            {[
              [
                LayoutDashboard,
                ru ? "Центр управления проектом" : "Project cockpit",
                ru
                  ? "Цели, контрольные точки, блокеры, решения и показатели состояния без загадочной единой оценки."
                  : "Objectives, milestones, blockers, decisions, and health dimensions without a mysterious score.",
              ],
              [
                Workflow,
                ru ? "Система выполнения" : "Work system",
                ru
                  ? "Бэклог, Kanban, список и план-график с лимитами незавершённой работы, зависимостями и явными правилами."
                  : "Backlog, Kanban, list, and timeline with WIP, dependencies, and explicit policies.",
              ],
              [
                ShieldCheck,
                ru ? "RAID и управление" : "RAID & governance",
                ru
                  ? "Риски, проблемы, допущения, контроль изменений и уровень управления под контекст."
                  : "Risks, issues, assumptions, change control, and context-fit governance.",
              ],
              [
                GitBranch,
                ru ? "Подбор подхода" : "Approach fit",
                ru
                  ? "Сравните подходы по требованиям, срокам, зависимостям и устройству команды."
                  : "Compare approaches using requirements, deadlines, dependencies and team context.",
              ],
              [
                ChartNoAxesCombined,
                ru ? "Расчёты" : "Calculations",
                ru
                  ? "CPM, PERT, EVM, RICE, WSJF, Little’s Law и Monte Carlo в браузере."
                  : "CPM, PERT, EVM, RICE, WSJF, Little’s Law, and Monte Carlo in-browser.",
              ],
              [
                BookOpen,
                ru ? "Профессиональная база" : "Professional library",
                `${contentCounts.methods} ${ru ? "методов" : "methods"}, ${contentCounts.templates} ${ru ? "шаблонов" : "templates"}, ${contentCounts.playbooks} ${ru ? "практических сценариев" : "playbooks"}, ${contentCounts.glossary} ${ru ? "терминов" : "terms"}.`,
              ],
            ].map(([Icon, title, copy], i) => {
              const I = Icon as typeof LayoutDashboard;
              return (
                <article className="feature" key={String(title)}>
                  <span className="num">0{i + 1}</span>
                  <I size={22} />
                  <h3>{String(title)}</h3>
                  <p>{String(copy)}</p>
                </article>
              );
            })}
          </div>
        </section>
        <section className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">
                {ru ? "Контекст важнее догмы" : "Context over dogma"}
              </p>
              <h2>
                {ru
                  ? "Подход — это система допущений"
                  : "An approach is a system of assumptions"}
              </h2>
            </div>
            <p>
              {ru
                ? "Используйте предиктивный, адаптивный, потоковый или гибридный подход осмысленно. Управление, планирование, ритм поставки и практики улучшений можно сочетать, если их исходные допущения не конфликтуют."
                : "Use predictive, adaptive, flow, or hybrid intentionally. Governance, planning, delivery cadence, and improvement practices can be composed when their operating assumptions do not conflict."}
            </p>
          </div>
          <div className="method-strip">
            {(ru
              ? ["Предиктивный", "Scrum", "Kanban", "Гибридный", "PRINCE2"]
              : ["Predictive", "Scrum", "Kanban", "Hybrid", "PRINCE2"]
            ).map((x, i) => (
              <div key={x}>
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                <strong>{x}</strong>
                <small>
                  {i === 0
                    ? ru
                      ? "контроль"
                      : "control"
                    : i === 1
                      ? ru
                        ? "эмпирика"
                        : "empiricism"
                      : i === 2
                        ? ru
                          ? "поток"
                          : "flow"
                        : i === 3
                          ? ru
                            ? "адаптация"
                            : "tailoring"
                          : ru
                            ? "управление"
                            : "governance"}
                </small>
              </div>
            ))}
          </div>
        </section>
        <section className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">
                {ru ? "Принципы PMWORK" : "PMWORK principles"}
              </p>
              <h2>
                {ru
                  ? "Минимально достаточный контроль"
                  : "Minimum sufficient control"}
              </h2>
            </div>
            <div>
              <p>
                <strong>
                  {ru ? "Контекст важнее догмы." : "Context over dogma."}
                </strong>{" "}
                {ru
                  ? "Нет одной методологии для всех проектов."
                  : "No method fits every project."}
              </p>
              <p>
                <strong>
                  {ru ? "Ценность важнее активности." : "Value over activity."}
                </strong>{" "}
                {ru
                  ? "Выполненные задачи не равны результату."
                  : "Completed tasks are not the outcome."}
              </p>
              <p>
                <strong>
                  {ru
                    ? "Прозрачность важнее бюрократии."
                    : "Transparency over bureaucracy."}
                </strong>{" "}
                {ru
                  ? "Артефакт нужен, когда помогает решению."
                  : "An artifact matters when it supports a decision."}
              </p>
              <p>
                <strong>
                  {ru ? "Явная ответственность." : "Explicit ownership."}
                </strong>{" "}
                {ru
                  ? "Критичная работа, риск и решение имеют владельца."
                  : "Critical work, risks, and decisions have owners."}
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
