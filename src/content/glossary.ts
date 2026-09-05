import {glossaryPractice} from './glossary-practice.ts';
import { glossary } from './glossary-seed.ts';
import type { Bi } from './catalog';
export const glossaryCategories = [
 ['core','Основы и управление','Core PM & Governance','Project|Project Brief|Project Lifecycle|Charter|Governance|Business Case|Baseline|Constraint|Artifact|Checklist|Compliance|Gate|Steering Committee|Tolerance|Tailoring|Predictive|Hybrid|Waterfall|Stage-Gate|Escalation|Escalation Path|Decision Log|Status Report|Corrective Action|Lesson Learned'],
 ['value','Ценность и результаты','Value / Outcomes / Benefits','Benefit|Benefit Owner|Benefits Management|Outcome|Output|Value|Goal|Objective|Success Criteria|Feasibility|Impact Mapping|Experiment|Discovery'],
 ['scope','Содержание и требования','Scope & Requirements','Scope|Scope Creep|Acceptance Criteria|Acceptance|Requirements Volatility|Work Breakdown Structure|Work Package|Deliverable|Change Control|Change Request|Validation|MoSCoW'],
 ['schedule','Сроки и зависимости','Schedule & Dependencies','Schedule|Critical Path|Critical Chain|Float|Lag|Lead|Milestone|Activity|Duration|Early Finish|Early Start|Late Finish|Late Start|Finish-to-Finish|Finish-to-Start|Start-to-Start|Dependency|Buffer|Rolling-wave Planning|Roadmap'],
 ['work','Работа и поставка','Work & Delivery','Task|Work Item|Epic|Feature|Story|User Story|Theme|Backlog|Blocker|Priority|Release|Increment|Definition of Done|Definition of Ready'],
 ['agile','Agile и поток','Agile / Flow / Product','Adaptive|Agile|Affinity Mapping|Cadence|Iteration|Kanban|Product Backlog|Retrospective|Scrum|Scrum Master|Sprint|Sprint Backlog|Sprint Goal|Sprint Review|Swimlane|WIP|Velocity|SLE|Cycle Time|Throughput|Work Item Age|Burn-down|Burn-up'],
 ['risk','Риски, RAID и качество','Risk / RAID / Quality','Risk|Issue|RAID|Assumption|Quality|Quality Gate|Impact|Probability|Mitigation|Opportunity|Residual Risk|Risk Appetite|Risk Exposure|Risk Owner|Risk Register|Trigger|Uncertainty'],
 ['finance','Стоимость и EVM','Cost / Finance / EVM','BAC|CPI|EAC|EV|PV|SPI|VAC|Actual Cost|Budget|Contingency Reserve|Management Reserve|ETC|Cost of Delay|Variance'],
 ['people','Люди и коммуникации','People / Stakeholders / Communication','Accountable|Action Owner|Capacity|Communication Plan|Consulted|Influence|Informed|Owner|RACI|RACI Matrix|Resource|Responsible|Sponsor|Stakeholder|Team Autonomy'],
 ['procurement','Закупки и поставщики','Procurement / Vendors','Contract|Procurement|Vendor'],
 ['portfolio','Программы, портфель и PMO','Program / Portfolio / PMO','PMO|Portfolio|Program|Initiative|SAFe'],
 ['metrics','Метрики и прогнозирование','Metrics / Analytics / Forecasting','Estimate|Dashboard|Dependency Density|Forecast|KPI|Little\'s Law|Monte Carlo Simulation|PERT|RICE|Story Point|WSJF'],
] as const;
export type GuidanceLevel = 'foundation' | 'practitioner' | 'advanced';
export type GlossaryTerm = {
 slug: string; term: string; ruTerm: string; acronym?: string; aliases: string[];
 category: string; subcategory?: string; level: GuidanceLevel; definition: Bi; plainLanguage: Bi;
 whyItMatters: Bi; example: Bi; whenUsed: Bi; related: string[]; confusedWith: string[]; tags: string[];
 workspaceLinks: string[]; methodLinks: string[]; templateLinks: string[]; toolLinks: string[]; sourceIds: string[]; reviewedAt: string;
};
const slug = (term: string) => term.toLowerCase().replace(/'/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const aliases: Record<string,string[]> = {
 'Work Breakdown Structure':['WBS','ИСР','структура декомпозиции работ','иерархическая структура работ','work breakdown'],
 CPI:['Cost Performance Index','индекс выполнения стоимости'], SPI:['Schedule Performance Index','индекс выполнения по срокам'],
 EV:['Earned Value','освоенный объём'], PV:['Planned Value','плановый объём'], BAC:['Budget at Completion'], EAC:['Estimate at Completion'], VAC:['Variance at Completion'],
 WIP:['Work in Progress','незавершённая работа'], RACI:['Responsible Accountable Consulted Informed'], PERT:['Program Evaluation and Review Technique'], SLE:['Service Level Expectation'],
 RAID:['Risks Assumptions Issues Decisions'], RICE:['Reach Impact Confidence Effort'], WSJF:['Weighted Shortest Job First'], PMO:['Project Management Office'], KPI:['Key Performance Indicator'], ETC:['Estimate to Complete'], SAFe:['Scaled Agile Framework'],
 'Actual Cost':['AC'], 'Critical Path':['критический путь','CPM'], 'Monte Carlo Simulation':['Монте-Карло'],
};
const foundations = new Set('Project|Outcome|Output|Value|Scope|Task|Work Item|Deliverable|Milestone|Risk|Issue|Stakeholder|Sponsor|Owner|Backlog|Blocker|Acceptance Criteria|Definition of Done|Dependency|Estimate|Budget|Priority|Goal|Objective|Project Lifecycle|Change Request'.split('|'));
const advanced = new Set('BAC|CPI|EAC|EV|PV|SPI|VAC|ETC|Critical Chain|Dependency Density|Monte Carlo Simulation|Little\'s Law|SAFe|Risk Appetite|Risk Exposure|Management Reserve|WSJF|PERT'.split('|'));
const contexts: Record<string,[string,string,string,string,string]> = {
 core:['control','Перед согласованием обязательств и на управленческом обзоре.','Before committing and during governance reviews.','Помогает сделать полномочия и основания решений проверяемыми.','Makes decision rights and rationale inspectable.'],
 value:['overview','При выборе цели и проверке результата после поставки.','When choosing objectives and checking outcomes after delivery.','Связывает выполненную работу с изменением для получателя.','Connects delivered work to a change for its recipient.'],
 scope:['control','При согласовании границ и рассмотрении изменений.','When agreeing boundaries and assessing changes.','Делает обязательства и условия приёмки явными.','Makes commitments and acceptance conditions explicit.'],
 schedule:['planning','При построении расписания и проверке угроз срокам.','When building schedules and checking delivery threats.','Помогает проверить последовательность работ и последствия задержки.','Helps check work sequence and consequences of delay.'],
 work:['work','При подготовке, выполнении и приёмке работы.','When preparing, delivering and accepting work.','Уточняет единицу работы и условия перехода к следующему действию.','Clarifies work units and conditions for the next action.'],
 agile:['board','При управлении потоком и обзоре рабочего цикла.','When managing flow and reviewing delivery cycles.','Помогает выявлять очереди и выбирать улучшение процесса.','Helps reveal queues and choose a process improvement.'],
 risk:['raid','При проверке неопределённости, проблем и качества.','When reviewing uncertainty, issues and quality.','Помогает назначить реакцию до потери управляемости.','Helps assign a response before losing control.'],
 finance:['finance','При обновлении бюджета и прогноза завершения.','When updating budgets and completion forecasts.','Позволяет отделить план, факт и прогноз в финансовом решении.','Separates plan, actuals and forecast in financial decisions.'],
 people:['people','При назначении ответственности и согласовании взаимодействия.','When assigning accountability and agreeing collaboration.','Помогает избежать потерянных решений и неясных ожиданий.','Helps prevent missing decisions and unclear expectations.'],
 procurement:['people','При согласовании поставки и проверке обязательств контрагента.','When agreeing deliveries and reviewing supplier commitments.','Делает внешние обязательства частью управляемого плана.','Makes external commitments part of a controlled plan.'],
 portfolio:['portfolio','При распределении ресурсов между инициативами.','When allocating resources across initiatives.','Помогает согласовать локальные решения с общими приоритетами.','Aligns local decisions with shared priorities.'],
 metrics:['planning','При выборе измерения или формировании прогноза.','When choosing measures or constructing forecasts.','Помогает проверить допущения до использования числа в решении.','Helps check assumptions before using a number in a decision.'],
};
const confused: Record<string,string[]> = {Risk:['Issue'],Issue:['Risk'],Outcome:['Output'],Output:['Outcome'],CPI:['SPI'],SPI:['CPI'],'Lead':['Lag'],'Lag':['Lead'],'Acceptance Criteria':['Definition of Done'],'Definition of Done':['Acceptance Criteria'],'Critical Path':['Critical Chain'],'Critical Chain':['Critical Path'],'Cycle Time':['Throughput'],'Throughput':['Cycle Time'],'Portfolio':['Program'],'Program':['Portfolio']};
export const glossaryTerms: GlossaryTerm[] = glossary.map(entry => {
 const category = glossaryCategories.find(c => c[3].split('|').includes(entry.term))?.[0] ?? 'core';
 const context = contexts[category], practice=glossaryPractice[entry.term];
 return { slug: slug(entry.term), term: entry.term, ruTerm: entry.ru, acronym: /^[A-Z]{2,5}$/.test(entry.term) ? entry.term : entry.term === 'Work Breakdown Structure' ? 'WBS' : undefined,
 aliases: aliases[entry.term] ?? [], category, level: foundations.has(entry.term) ? 'foundation' : advanced.has(entry.term) ? 'advanced' : 'practitioner',
 definition: entry.definition, plainLanguage: entry.definition, example: entry.example,
 whyItMatters: {ru:practice?.[0]??context[3],en:practice?.[1]??context[4]}, whenUsed:{ru:practice?.[2]??context[1],en:practice?.[3]??context[2]},
 related: [...new Set([...(confused[entry.term] ?? []),...entry.related])].filter(t=>glossary.some(g=>g.term===t)).map(slug),
 confusedWith:(confused[entry.term] ?? []).map(slug), tags:[category], workspaceLinks:[context[0]],methodLinks:[],templateLinks:practice?.[4]?[practice[4]]:[],toolLinks:practice?.[5]?[practice[5]]:[],sourceIds:[],reviewedAt:'2026-09-05' };
});
export function validateGlossary(terms: GlossaryTerm[], sourceIds: string[]) {
 const errors: string[]=[]; const slugs=new Set<string>(); const names=new Set<string>(); const all=new Set(terms.map(t=>t.slug));
 for(const term of terms) {
  if(slugs.has(term.slug))errors.push(`duplicate slug: ${term.slug}`); slugs.add(term.slug);
  const name=term.term.toLowerCase();if(names.has(name))errors.push(`duplicate term: ${name}`);names.add(name);
  if(!glossaryCategories.some(c=>c[0]===term.category))errors.push(`category: ${term.slug}`);
  if(!['foundation','practitioner','advanced'].includes(term.level))errors.push(`level: ${term.slug}`);
  if(!term.term.trim()||!term.ruTerm.trim()||!term.definition.ru.trim()||!term.definition.en.trim())errors.push(`translation: ${term.slug}`);
  for(const rel of [...term.related,...term.confusedWith])if(!all.has(rel))errors.push(`relation: ${rel}`);
  for(const source of term.sourceIds)if(!sourceIds.includes(source))errors.push(`source: ${source}`);
  if(term.aliases.some(a=>!a.trim()))errors.push(`orphan alias: ${term.slug}`);
  if(/\b(TODO|placeholder|lorem|TBD)\b/i.test(JSON.stringify(term)))errors.push(`placeholder: ${term.slug}`);
 } return errors;
}
