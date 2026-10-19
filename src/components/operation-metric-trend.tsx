import type { Locale } from "@/domain/schemas";
import type { Operation } from "@/domain/management-entities";

export function OperationMetricTrend({ metric, locale, asOf }: { metric: Operation["metrics"][number]; locale: Locale; asOf: string }) {
  const ru = locale === "ru";
  const rows = metric.observations.filter(row => row.at <= asOf).toSorted((a, b) => a.at.localeCompare(b.at));
  const latest = rows.at(-1);
  const values = [...rows.map(row => row.value), metric.target];
  const min = Math.min(...values), range = Math.max(...values) - min || 1;
  const first = rows[0] ? Date.parse(rows[0].at) : 0;
  const duration = latest ? Date.parse(latest.at) - first || 1 : 1;
  const x = (at: string) => 12 + (Date.parse(at) - first) / duration * 296;
  const y = (value: number) => 100 - (value - min) / range * 80;
  return <figure className="metric-trend">
    <figcaption><strong>{metric.name}</strong><span>{latest ? `${latest.value} ${metric.unit} · ${latest.at}` : (ru ? "Недостаточно данных" : "Insufficient evidence")}</span></figcaption>
    {rows.length >= 2 ? <><svg viewBox="0 0 320 112" role="img" aria-label={`${metric.name}: ${rows.map(row => `${row.at}: ${row.value} ${metric.unit}`).join("; ")}`}>
      <line x1="12" x2="308" y1={y(metric.target)} y2={y(metric.target)} stroke="var(--semantic-warning)" strokeDasharray="5 4"/>
      <polyline points={rows.map(row => `${x(row.at)},${y(row.value)}`).join(" ")} fill="none" stroke="var(--accent-primary)" strokeWidth="2"/>
      {rows.map((row, index) => <circle key={`${row.at}-${index}`} cx={x(row.at)} cy={y(row.value)} r="3" fill="var(--accent-primary)"/>)}
    </svg><div className="metric-trend-dates"><span>{rows[0].at}</span><span>{latest!.at}</span></div></> : <p>{ru ? "Для тренда нужны наблюдения минимум за две даты." : "A trend needs observations on at least two dates."}</p>}
    <p>{ru ? "Цель" : "Target"}: {metric.direction === "at-least" ? "≥" : "≤"} {metric.target} {metric.unit} · {ru ? "Наблюдений на дату" : "Observations as of"} {asOf}: {rows.length}</p>
  </figure>;
}
