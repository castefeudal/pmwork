import type { Metadata } from 'next';
import type { Locale } from './schemas';
export const publicBasePath = process.env.PMWORK_BASE_PATH === 'github' ? '/pmwork' : '';
export const publicOrigin = 'https://castefeudal.github.io';
export function publicMetadata(locale: Locale, path: string, title: string, description: string): Metadata {
  const base = publicOrigin + publicBasePath;
  const url = `${base}/${locale}/${path ? path + '/' : ''}`;
  return { title, description, alternates: { canonical: url, languages: { ru: `${base}/ru/${path ? path + '/' : ''}`, en: `${base}/en/${path ? path + '/' : ''}` } }, openGraph: { type: 'website', title, description, url, siteName: 'PMWORK', locale: locale === 'ru' ? 'ru_RU' : 'en_US' } };
}
const pages = {
 methods: ['Методы управления проектами','Project management methods','Выберите подход по изменчивости требований, срокам и зависимостям.','Choose an approach by requirements volatility, deadlines and dependencies.'],
 templates: ['Рабочие шаблоны','Project templates','Выберите документ для конкретной задачи и примените его к своему проекту.','Choose a document for a specific task and apply it to your project.'],
 playbooks: ['Практические сценарии','Problem playbooks','Разберите задержку, блокер или конфликт и определите ближайшее действие.','Investigate a delay, blocker or conflict and choose the next action.'],
 knowledge: ['База знаний руководителя проекта','Project management knowledge','Практики планирования, рисков, ответственности и контроля результата.','Practical guidance for planning, risk, ownership and delivery control.'],
 glossary: ['Глоссарий управления проектами','Project management glossary','Термины, сокращения, примеры и различия между близкими понятиями.','Terms, acronyms, examples and distinctions between related concepts.'],
 tools: ['Инструменты для решений','Decision tools','Рассчитайте сроки, приоритеты, риски, мощность и освоенный объём.','Calculate schedules, priorities, risk, capacity and earned value.'],
 sources: ['Источники и границы применения','Sources and scope','Первоисточники методов и стандартов, использованных в PMWORK.','Primary sources for methods and standards referenced by PMWORK.'],
 about: ['О PMWORK','About PMWORK','Независимая локальная система для работы руководителя проекта.','An independent local-first workbench for project managers.'],
 privacy: ['Хранение и конфиденциальность данных','Data storage and privacy','Как PMWORK хранит проекты, резервные копии и снимки восстановления.','How PMWORK stores projects, backups and recovery snapshots.'],
} as const;
export async function catalogMetadata(params: Promise<{locale:string}>, path: keyof typeof pages) {
 const {locale} = await params; if (locale !== 'ru' && locale !== 'en') return {};
 const p=pages[path]; return publicMetadata(locale,path,p[locale==='ru'?0:1],p[locale==='ru'?2:3]);
}
