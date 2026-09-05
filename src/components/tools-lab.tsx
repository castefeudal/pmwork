"use client";
import { useUrlChoice } from "./use-url-state";
import { useId, useMemo, useState } from "react";
import { displayLabel } from "@/content/workspace-i18n";
import type { Locale } from "@/domain/schemas";
import {
  calculateCPM,
  calculateEVM,
  calculatePERT,
  littleLaw,
  monteCarlo,
  rice,
  wsjf,
} from "@/domain/calculations";
import {
  governanceLevel,
  scoreApproaches,
  type Context,
} from "@/domain/method-fit";
type Tool =
  | "fit"
  | "composer"
  | "cpm"
  | "pert"
  | "evm"
  | "forecast"
  | "priority"
  | "flow";
const contextLabels: Record<keyof Context, { ru: string; en: string }> = {
  uncertainty: { ru: "Неопределённость", en: "Uncertainty" },
  volatility: { ru: "Изменчивость требований", en: "Requirements volatility" },
  feedback: { ru: "Доступность обратной связи", en: "Feedback availability" },
  frequency: { ru: "Частота поставки", en: "Delivery frequency" },
  compliance: { ru: "Регуляторные требования", en: "Compliance" },
  dependencies: { ru: "Плотность зависимостей", en: "Dependency density" },
  autonomy: { ru: "Автономность команды", en: "Team autonomy" },
  scopeRigidity: { ru: "Жёсткость границ", en: "Scope rigidity" },
  deadlineRigidity: { ru: "Жёсткость срока", en: "Deadline rigidity" },
  stakeholders: {
    ru: "Сложность состава заинтересованных сторон",
    en: "Stakeholder complexity",
  },
};
export function ToolsLab({ locale }: { locale: Locale }) {
  const ru = locale === "ru",
    [tool, setTool] = useUrlChoice<Tool>("tool",["fit","composer","cpm","pert","evm","forecast","priority","flow"],"fit");
  const titles: Record<Tool, string> = {
    fit: ru ? "Подбор подхода" : "Approach fit",
    composer: ru ? "Конструктор метода" : "Method composer",
    cpm: ru ? "Критический путь · CPM" : "Critical Path",
    pert: "PERT",
    evm: ru ? "Освоенный объём · EVM" : "Earned Value",
    forecast: "Monte Carlo",
    priority: ru ? "Приоритизация" : "Prioritization",
    flow: ru ? "Закон Литтла" : "Little’s Law",
  };
  return (
    <>
      <header className="catalog-hero" id="fit">
        <p className="eyebrow">{ru ? "Прозрачные расчёты · локально" : "Deterministic · explainable · local"}</p>
        <h1>{ru ? "Инструменты решений" : "Decision tools"}</h1>
        <p className="lead">
          {ru
            ? "Расчёты выполняются в браузере. PMWORK показывает формулу, допущения и ограничения — число не маскируется под достоверность."
            : "Calculations run in-browser. PMWORK shows formulas, assumptions, and limits—the number never pretends to be certainty."}
        </p>
        <div className="tabs">
          {(Object.keys(titles) as Tool[]).map((k) => (
            <button
              key={k}
              onClick={() => setTool(k)}
              className={tool === k ? "active" : ""}
            >
              {titles[k]}
            </button>
          ))}
        </div>
      </header>
      <section className="section" style={{ paddingTop: "1rem" }}>
        {tool === "fit" && <Fit locale={locale} />}{" "}
        {tool === "composer" && <Composer locale={locale} />}{" "}
        {tool === "cpm" && <CPM locale={locale} />}{" "}
        {tool === "pert" && <PERT locale={locale} />}{" "}
        {tool === "evm" && <EVM locale={locale} />}{" "}
        {tool === "forecast" && <Forecast locale={locale} />}{" "}
        {tool === "priority" && <Priority locale={locale} />}{" "}
        {tool === "flow" && <Flow locale={locale} />}
      </section>
    </>
  );
}
function NumberField({
  label,
  value,
  onChange,
  min = 0,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
function Fit({ locale }: { locale: Locale }) {
  const ru = locale === "ru",
    [c, setC] = useState<Context>({
      uncertainty: 4,
      volatility: 4,
      feedback: 4,
      frequency: 3,
      compliance: 3,
      dependencies: 3,
      autonomy: 4,
      scopeRigidity: 2,
      deadlineRigidity: 4,
      stakeholders: 3,
    });
  const scores = scoreApproaches(c),
    best = scores[0]!;
  return (
    <div className="calculator-grid">
      <div className="panel">
        <h2>{ru ? "Контекст проекта" : "Project context"}</h2>
        <p className="muted">{ru ? "1 — низкий уровень · 5 — высокий" : "1 = low · 5 = high"}</p>
        <div className="form-grid">
          {(Object.keys(c) as (keyof Context)[]).map((k) => (
            <div className="field" key={k}>
              <label htmlFor={`fit-${k}`}>
                {contextLabels[k][locale]} · {c[k]}
              </label>
              <input
                id={`fit-${k}`}
                aria-valuetext={`${c[k]} / 5`}
                type="range"
                min="1"
                max="5"
                value={c[k]}
                onChange={(e) => setC({ ...c, [k]: Number(e.target.value) })}
              />
              <div className="range-endpoints"><span>{ru ? "Низкий · 1" : "Low · 1"}</span><span>{ru ? "Высокий · 5" : "High · 5"}</span></div>
            </div>
          ))}
        </div>
      </div>
      <div className="result-box">
        <small>{ru ? "Лучшее соответствие" : "Best fit"}</small>
        <strong>
          {scores.filter(x => best.score - x.score <= 3).map(x => displayLabel(locale, "approach", x.approach)).join(" / ")} · {best.score} / 100
        </strong>
        <p>
          {ru ? "Почему" : "Why"}:{" "}
          {best.reasons.map((k) => contextLabels[k][locale]).join(", ")}{" "}
          {ru ? "близки профилю подхода." : "match this approach profile."}
          {ru ? " Эвристическая оценка соответствия контексту. Это не вероятность успеха проекта." : " Heuristic context-fit score. This is not a probability of project success."}
        </p>
        <p>
          {ru ? "Управление" : "Governance"}: <b>{displayLabel(locale,"governance",governanceLevel(c))}</b>
        </p>
        <table>
          <thead>
            <tr>
              <th>{ru ? "Подход" : "Approach"}</th>
              <th>{ru ? "Соответствие" : "Fit"}</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((x) => (
              <tr key={x.approach}>
                <td>{displayLabel(locale,"approach",x.approach)}</td>
                <td>{x.score} / 100</td>
              </tr>
            ))}
          </tbody>
        </table>
        <small>
          {ru
            ? "Контекстная эвристика на основе рекомендаций методик и зрелых практик реализации; не универсальная научная формула."
            : "A context-fit heuristic based on framework guidance and established delivery practice; not a universal scientific formula."}
        </small>
      </div>
    </div>
  );
}
function Composer({ locale }: { locale: Locale }) {
  const ru = locale === "ru",
    [governance, setGovernance] = useState("Milestone governance"),
    [planning, setPlanning] = useState("Rolling-wave planning"),
    [delivery, setDelivery] = useState("Kanban flow"),
    [cadence, setCadence] = useState("Continuous pull");
  const conflict = delivery === "Scrum" && cadence === "Continuous pull";
  const optionLabel = (value: string) =>
    !ru
      ? value
      : ({
          "Milestone governance": "Управление по контрольным точкам",
          "Rolling-wave planning": "Планирование набегающей волной",
          "Kanban flow": "Поток Kanban",
          "Continuous pull": "Непрерывное вытягивание",
          Lightweight: "Облегчённое",
          "PRINCE2 governance": "Управление PRINCE2",
          "Predictive baseline": "Предиктивный базовый план",
          "Outcome roadmap": "Карта измеримых результатов",
          "Milestone execution": "Выполнение по контрольным точкам",
          "Two-week Sprint": "Двухнедельный спринт",
          "Monthly stage review": "Ежемесячный обзор этапа",
          Scrum: "Scrum",
        }[value] ?? value);
  return (
    <div className="calculator-grid">
      <div className="panel">
        <h2>
          {ru ? "Соберите операционную модель" : "Compose the operating model"}
        </h2>
        <div className="form-grid">
          {[
            [
              ru ? "Управление" : "Governance",
              governance,
              setGovernance,
              ["Lightweight", "Milestone governance", "PRINCE2 governance"],
            ],
            [
              ru ? "Планирование" : "Planning",
              planning,
              setPlanning,
              [
                "Predictive baseline",
                "Rolling-wave planning",
                "Outcome roadmap",
              ],
            ],
            [
              ru ? "Рабочий процесс" : "Workflow",
              delivery,
              setDelivery,
              ["Kanban flow", "Scrum", "Milestone execution"],
            ],
            [
              ru ? "Ритм" : "Cadence",
              cadence,
              setCadence,
              ["Continuous pull", "Two-week Sprint", "Monthly stage review"],
            ],
          ].map(([label, val, set, opts]) => (
            <div className="field" key={String(label)}>
              <label htmlFor={`composer-${String(label)}`}>{String(label)}</label>
              <select
                id={`composer-${String(label)}`}
                value={String(val)}
                onChange={(e) => (set as (x: string) => void)(e.target.value)}
              >
                {(opts as string[]).map((x) => (
                  <option key={x} value={x}>
                    {optionLabel(x)}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
      <div className="result-box">
        <small>{ru ? "Ваш подход" : "Your approach"}</small>
        <strong>{optionLabel(governance)}</strong>
        <p>
          {optionLabel(planning)} + {optionLabel(delivery)} +{" "}
          {optionLabel(cadence)}
        </p>
        {conflict ? (
          <p className="status bad">
            {ru
              ? "Конфликт: Scrum использует спринт как временной контейнер; непрерывное вытягивание требует явных правил для срочных задач и обязательств."
              : "Conflict: Scrum uses the Sprint as its cadence container; continuous pull needs an explicit interrupt and commitment policy."}
          </p>
        ) : (
          <p className="status good">
            {ru
              ? "Явного конфликта не найдено. После одного цикла проверьте, решает ли каждая практика реальную проблему."
              : "No explicit conflict found. After one cycle, check whether each practice solves a real problem."}
          </p>
        )}
      </div>
    </div>
  );
}
function CPM({ locale }: { locale: Locale }) {
  const ru = locale === "ru",
    [raw, setRaw] = useState("A,3,\nB,5,A\nC,4,A\nD,2,B|C");
  let result: ReturnType<typeof calculateCPM> = [],
    error = "";
  try {
    const tasks = raw
      .split("\n")
      .map((line) => {
        const [id, duration, preds = ""] = line.split(",").map((x) => x.trim());
        return {
          id: id ?? "",
          duration: Number(duration),
          predecessors: preds
            ? preds
                .split("|")
                .map((x) => x.trim())
                .filter(Boolean)
            : [],
        };
      })
      .filter((x) => x.id);
    result = calculateCPM(tasks);
  } catch (e) {
    error = e instanceof Error ? e.message : "Invalid model";
  }
  return (
    <div className="calculator-grid">
      <div className="panel">
        <h2>
          {ru ? "Редактируемая сетевая модель" : "Editable network model"}
        </h2>
        <div className="field">
          <label htmlFor="cpm-input">
            {ru
              ? "По строке: идентификатор, длительность, предшественники через |"
              : "One per line: ID, duration, predecessors separated by |"}
          </label>
          <textarea
            id="cpm-input"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={8}
          />
        </div>
        <p className="muted">A,3, · B,5,A · D,2,B|C</p>
        {error && (
          <p className="status bad" role="alert">
            {error}
          </p>
        )}
      </div>
      <div className="result-box">
        <small>{ru ? "Критический путь" : "Critical path"}</small>
        <strong>
          {result
            .filter((x) => x.critical)
            .map((x) => x.id)
            .join(" → ") || "—"}
        </strong>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>ES</th>
              <th>EF</th>
              <th>LS</th>
              <th>LF</th>
              <th>Float</th>
            </tr>
          </thead>
          <tbody>
            {result.map((x) => (
              <tr key={x.id}>
                <td>
                  {x.id}
                  {x.critical ? " *" : ""}
                </td>
                <td>{x.es}</td>
                <td>{x.ef}</td>
                <td>{x.ls}</td>
                <td>{x.lf}</td>
                <td>{x.float}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          <small>
            {ru
              ? "CPM — модель, не обещание даты. Ошибки оценок и зависимостей переходят в результат."
              : "CPM is a model, not a date promise. Estimate and dependency errors flow into the result."}
          </small>
        </p>
      </div>
    </div>
  );
}
function PERT({ locale }: { locale: Locale }) {
  const ru = locale === "ru",
    [o, setO] = useState(3),
    [m, setM] = useState(5),
    [p, setP] = useState(10);
  let r;
  try {
    r = calculatePERT(o, m, p);
  } catch {
    r = null;
  }
  return (
    <div className="calculator-grid">
      <div className="panel">
        <h2>PERT</h2>
        <div className="form-grid">
          <NumberField
            label={ru ? "Оптимистично (O)" : "Optimistic (O)"}
            value={o}
            onChange={setO}
          />
          <NumberField
            label={ru ? "Наиболее вероятно (M)" : "Most likely (M)"}
            value={m}
            onChange={setM}
          />
          <NumberField
            label={ru ? "Пессимистично (P)" : "Pessimistic (P)"}
            value={p}
            onChange={setP}
          />
        </div>
      </div>
      <div className="result-box">
        {!r && <p role="alert">{ru ? "Требуется 0 ≤ O ≤ M ≤ P." : "Required: 0 ≤ O ≤ M ≤ P."}</p>}
        <small>TE = (O + 4M + P) / 6</small>
        <strong>{r ? r.expected.toFixed(2) : "—"}</strong>
        <p>
          σ = {r ? r.standardDeviation.toFixed(2) : "—"} · σ² ={" "}
          {r ? r.variance.toFixed(2) : "—"}
        </p>
        <small>
          {ru
            ? "Три оценки не делают распределение истинным; используйте PERT для структурирования неопределённости."
            : "Three estimates do not make the distribution true; use PERT to structure uncertainty."}
        </small>
      </div>
    </div>
  );
}
function EVM({ locale }: { locale: Locale }) {
  const ru = locale === "ru",
    [v, setV] = useState({ pv: 100, ev: 90, ac: 110, bac: 300 }),
    valid = Object.values(v).every(n => Number.isFinite(n) && n >= 0),
    r = valid ? calculateEVM(v.pv, v.ev, v.ac, v.bac) : null;
  return (
    <div className="calculator-grid">
      <div className="panel">
        <h2>{ru ? "Освоенный объём · EVM" : "Earned Value"}</h2>
        <div className="form-grid">
          {(Object.keys(v) as (keyof typeof v)[]).map((k) => (
            <NumberField
              key={k}
              label={k.toUpperCase()}
              value={v[k]}
              onChange={(n) => setV({ ...v, [k]: n })}
            />
          ))}
        </div>
      </div>
      <div className="result-box">
        {!r && <p role="alert">{ru ? "Введите конечные неотрицательные значения." : "Enter finite non-negative values."}</p>}
        {r && <p>{ru ? (r.cv < 0 ? "Перерасход относительно освоенного объёма." : "Затраты в пределах освоенного объёма.") : (r.cv < 0 ? "Over budget for earned work." : "Cost is within earned value.")} {ru ? (r.sv < 0 ? "Объём выполненного отстаёт от плана." : "Освоенный объём не отстаёт от плана.") : (r.sv < 0 ? "Earned work is behind plan." : "Earned work is on or ahead of plan.")}</p>}
        <small>CPI = EV / AC · SPI = EV / PV</small>
        <strong>
          CPI {r?.cpi?.toFixed(2) ?? "—"} · SPI {r?.spi?.toFixed(2) ?? "—"}
        </strong>
        <p>
          CV {r?.cv.toFixed(0) ?? "—"} · SV {r?.sv.toFixed(0) ?? "—"} · EAC{" "}
          {r?.eac?.toFixed(0) ?? "—"} · VAC {r?.vac?.toFixed(0) ?? "—"}
        </p>
        <small>
          {ru
            ? "EAC = BAC / CPI предполагает сохранение текущей эффективности затрат. Не применяйте EVM автоматически к любому адаптивному проекту."
            : "EAC = BAC / CPI assumes current cost efficiency continues. Do not apply EVM automatically to every adaptive project."}
        </small>
      </div>
    </div>
  );
}
function Forecast({ locale }: { locale: Locale }) {
  const ru = locale === "ru",
    [raw, setRaw] = useState("5,7,6,8,4,7,9,6"),
    [weeks, setWeeks] = useState(8);
  const r = useMemo(() => {
    const tokens = raw.split(",").map(x => x.trim());
    if (tokens.some(x => x === "")) return null;
    try { return monteCarlo(tokens.map(Number), weeks, 5000, Math.random, "itemsByDate"); } catch { return null; }
  }, [raw, weeks]);
  return (
    <div className="calculator-grid">
      <div className="panel">
        <h2>
          Monte Carlo · {ru ? "сколько элементов к дате" : "items by date"}
        </h2>
        <div className="field">
          <label htmlFor="forecast-samples">
            {ru
              ? "Историческая пропускная способность по неделям"
              : "Historical weekly throughput"}
          </label>
          <input id="forecast-samples" value={raw} onChange={(e) => setRaw(e.target.value)} />
        </div>
        <NumberField
          label={ru ? "Горизонт, недель" : "Horizon, weeks"}
          value={weeks}
          onChange={setWeeks}
          min={1}
        />
      </div>
      <div className="result-box">
        {!r && <p role="alert">{ru ? "Введите минимум 3 неотрицательных наблюдения, включая положительное, и целый горизонт 1–1000 недель." : "Enter at least 3 non-negative observations including a positive value, and an integer horizon of 1–1000 weeks."}</p>}
        <small>{ru ? "5 000 симуляций" : "5,000 simulations"}</small>
        <strong>
          P80 · {r?.p80 ?? "—"} {ru ? "элементов" : "items"}
        </strong>
        <p>
          P50 {r?.p50 ?? "—"} · P80 {r?.p80 ?? "—"} · P90 {r?.p90 ?? "—"}
        </p>
        <small>
          {ru
            ? "P80: около 80% симуляций завершили не меньше указанного числа элементов. Исторические недели выбираются независимо с возвращением. Это не гарантия: нужны репрезентативная история, одинаковые единицы и стабильный поток."
            : "P80: about 80% of simulations delivered at least this many items. Historical weeks are sampled independently with replacement. This is not a guarantee; representative history, consistent units and stable flow are required."}
        </small>
      </div>
    </div>
  );
}
function Priority({ locale }: { locale: Locale }) {
  const ru = locale === "ru",
    [v, setV] = useState({
      reach: 100,
      impact: 2,
      confidence: 80,
      effort: 4,
      value: 8,
      time: 6,
      risk: 4,
      size: 3,
    });
  let r: number | null = null, w: number | null = null;
  try { r = rice(v.reach,v.impact,v.confidence,v.effort); w = wsjf(v.value,v.time,v.risk,v.size); } catch { /* Inline validation below. */ }
  const inputLabels: Record<string, string> = ru ? { reach:"Охват", impact:"Влияние", confidence:"Уверенность, %", effort:"Усилия", value:"Ценность", time:"Срочность", risk:"Снижение риска", size:"Размер работы" } : { reach:"Reach", impact:"Impact", confidence:"Confidence, %", effort:"Effort", value:"Value", time:"Time criticality", risk:"Risk reduction", size:"Job size" };
  return (
    <div className="calculator-grid">
      <div className="panel">
        <h2>RICE + WSJF</h2>
        <div className="form-grid">
          {Object.entries(v).map(([k, n]) => (
            <NumberField
              key={k}
              label={inputLabels[k]!}
              value={n}
              onChange={(x) => setV({ ...v, [k]: x })}
            />
          ))}
        </div>
      </div>
      <div className="result-box">
        {(r === null || w === null) && <p role="alert">{ru ? "Усилия и размер должны быть > 0; уверенность — 0–100%; остальные оценки — ≥ 0." : "Effort and size must be > 0; confidence 0–100%; other scores ≥ 0."}</p>}
        <p>{ru ? "RICE — для продуктовых инициатив с оценкой охвата; WSJF — для порядка работ с учётом стоимости задержки." : "RICE fits product initiatives with reach estimates; WSJF sequences work using relative cost of delay."}</p>
        <small>RICE = Reach × Impact × (Confidence / 100) / Effort</small>
        <strong>
          RICE · {r?.toFixed(1) ?? "—"}
        </strong>
        <p>WSJF · {w?.toFixed(1) ?? "—"}</p>
        <small>
          {ru
            ? "Оценки помогают сделать допущения явными, но не превращают стратегию в арифметику. Не сравнивайте несопоставимые элементы."
            : "Scores expose assumptions but do not turn strategy into arithmetic. Do not compare unlike items."}
        </small>
      </div>
    </div>
  );
}
function Flow({ locale }: { locale: Locale }) {
  const ru = locale === "ru",
    [wip, setWip] = useState(12),
    [throughput, setThroughput] = useState(3),
    r = Number.isFinite(wip) && wip >= 0 && Number.isFinite(throughput) && throughput > 0 ? littleLaw(wip, throughput) : null;
  return (
    <div className="calculator-grid">
      <div className="panel">
        <h2>{ru ? "Закон Литтла" : "Little’s Law"}</h2>
        <div className="form-grid">
          <NumberField label="WIP" value={wip} onChange={setWip} />
          <NumberField
            label={
              ru ? "Пропускная способность / период" : "Throughput / period"
            }
            value={throughput}
            onChange={setThroughput}
          />
        </div>
      </div>
      <div className="result-box">
        {!r && <p role="alert">{ru ? "WIP должен быть ≥ 0, пропускная способность — > 0." : "WIP must be ≥ 0 and throughput > 0."}</p>}
        <small>WIP = Throughput × Cycle Time</small>
        <strong>
          {r ? r.cycleTime.toFixed(1) : "—"} {ru ? "периода" : "periods"}
        </strong>
        <small>
          {ru
            ? "Применимо к достаточно стабильной системе, согласованным границам и сопоставимым единицам за осмысленный период."
            : "Applicable to a reasonably stable system with consistent boundaries and comparable units over a meaningful period."}
        </small>
      </div>
    </div>
  );
}
