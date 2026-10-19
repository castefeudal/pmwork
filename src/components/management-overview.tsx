import type { Locale } from "@/domain/schemas";
import type { Program, Operation } from "@/domain/management-entities";

export function ManagementOverview({ program, operation, locale, asOf }: { program?: Program; operation?: Operation; locale: Locale; asOf: string }) {
  const ru = locale === "ru";
  const observed = operation?.metrics.map(metric => ({ metric, latest: metric.observations.filter(row => row.at <= asOf).toSorted((a,b) => a.at.localeCompare(b.at)).at(-1) })) ?? [];
  const stats = program ? [
    { label: ru ? "Связанные проекты" : "Linked projects", value: program.projectIds.length },
    { label: ru ? "Открытые зависимости" : "Open dependencies", value: program.dependencies.filter(row => row.status !== "resolved").length },
    { label: ru ? "Измеренные выгоды" : "Measured benefits", value: `${program.benefits.filter(row => row.actual !== undefined && row.measuredAt && row.measuredAt <= asOf).length} / ${program.benefits.length}` },
    { label: ru ? "Нерешённые ресурсные конфликты" : "Unresolved resource conflicts", value: program.resourceConflicts.filter(row => !row.resolution.trim()).length },
  ] : [
    { label: ru ? "Метрики с наблюдениями" : "Metrics with observations", value: `${observed.filter(row => row.latest).length} / ${observed.length}` },
    { label: ru ? "Нарушения целей по последнему замеру" : "Latest observations outside target", value: observed.filter(({metric, latest}) => latest && (metric.direction === "at-least" ? latest.value < metric.target : latest.value > metric.target)).length },
    { label: ru ? "Открытые инциденты" : "Open incidents", value: operation?.incidents.filter(row => !row.resolvedAt).length ?? 0 },
    { label: ru ? "Контроли к выполнению" : "Controls due", value: operation?.controls.filter(row => row.dueDate <= asOf && !row.completedAt).length ?? 0 },
  ];
  return <section className="management-overview panel"><h3>{ru ? "Рабочий обзор" : "Operating overview"}</h3><p className="muted">{ru ? "На дату" : "As of"}: {asOf}</p><dl className="cockpit-stat-grid">{stats.map(stat => <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}</dl><p className="muted">{ru ? "Счётчики отражают записи, а не оценку здоровья. Отсутствие наблюдений не означает стабильность." : "Counts describe recorded evidence, not a health score. Missing observations do not imply stability."}</p></section>;
}
