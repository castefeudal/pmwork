import type { Locale } from "@/domain/schemas";
import { Arrow, ControlPoint, Defs, Node, Rail, danger, faint, hair, point, route, strong, success, warning } from "./atlas-marks";

export type MethodKind = "scrum" | "kanban" | "cpm" | "pert" | "evm" | "risk" | "priority";

const methodTitles: Record<MethodKind, { ru: string; en: string }> = {
  scrum: { ru: "Итерационный цикл: повтор коротких поставок с обзором и разбором по каждому проходу", en: "Iteration cycle: repeated short deliveries with a review and a retrospective each pass" },
  kanban: { ru: "Поток с ограничением незавершённой работы: очередь, узкое место и выход", en: "Flow with a work-in-progress limit: queue, constraint and exit" },
  cpm: { ru: "Сеть зависимостей: критический путь выделен, резерв показан пунктиром", en: "Dependency network: the critical path is emphasised, float shown dashed" },
  pert: { ru: "Неопределённость оценки: оптимистичная, наиболее вероятная и пессимистичная точки на распределении", en: "Estimate uncertainty: optimistic, most likely and pessimistic points on a distribution" },
  evm: { ru: "Освоение: плановый объём, фактическое освоение и фактические затраты расходятся во времени", en: "Earned value: planned value, earned value and actual cost diverge over time" },
  risk: { ru: "Матрица вероятности и последствий с зонами реакции", en: "Likelihood and consequence matrix with response bands" },
  priority: { ru: "Логика приоритизации: вклад, уверенность, сложность и их соотношение", en: "Prioritisation logic: reach, confidence, effort and their ratio" },
};

/** The sentence a sheet is drawn to carry, for use as a visible figcaption. */
export function methodDiagramCaption(kind: MethodKind, locale: Locale) {
  return methodTitles[kind][locale === "ru" ? "ru" : "en"];
}

export function MethodDiagram({ kind, locale }: { kind: MethodKind; locale: Locale }) {
  const label = methodTitles[kind][locale === "ru" ? "ru" : "en"];
  return (
    <svg className="atlas-graphic atlas-diagram" viewBox="0 0 360 200" role="img" aria-label={label} focusable="false">
      <Defs />
      {kind === "scrum" && <ScrumCycle />}
      {kind === "kanban" && <KanbanFlow />}
      {kind === "cpm" && <CpmNetwork />}
      {kind === "pert" && <PertDistribution />}
      {kind === "evm" && <EarnedValueCurves />}
      {kind === "risk" && <RiskMatrix />}
      {kind === "priority" && <PriorityLogic />}
    </svg>
  );
}

function ScrumCycle() {
  const cx = 150;
  const cy = 100;
  const r = 62;
  const stops = [
    { a: -90, tone: route },
    { a: 0, tone: point },
    { a: 90, tone: warning },
    { a: 180, tone: route },
  ];
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={hair} />
      <circle cx={cx} cy={cy} r={r - 14} fill="none" stroke={hair} strokeOpacity=".5" strokeDasharray="3 5" />
      <path d={`M${cx} ${cy - r} A${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={route} strokeWidth="2.2" markerEnd="url(#atlas-head)" />
      <path d={`M${cx + r} ${cy} A${r} ${r} 0 0 1 ${cx} ${cy + r}`} fill="none" stroke={route} strokeWidth="2.2" markerEnd="url(#atlas-head)" />
      <path d={`M${cx} ${cy + r} A${r} ${r} 0 0 1 ${cx - r} ${cy}`} fill="none" stroke={route} strokeWidth="2.2" markerEnd="url(#atlas-head)" />
      <path d={`M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx} ${cy - r}`} fill="none" stroke={point} strokeWidth="1.6" strokeDasharray="5 4" markerEnd="url(#atlas-head)" />
      {stops.map((s) => {
        const rad = (s.a * Math.PI) / 180;
        return <Node key={s.a} cx={cx + Math.cos(rad) * r} cy={cy + Math.sin(rad) * r} tone={s.tone} r={4.4} />;
      })}
      <ControlPoint cx={cx} cy={cy} tone={strong} size={10} />
      <g transform="translate(252 44)">
        <Rail x={0} y1={0} y2={112} ticks={9} />
        {[18, 46, 74, 102].map((y, i) => (
          <g key={y}>
            <rect x={8} y={y} width={78} height={16} rx={4} fill={i === 1 ? route : strong} fillOpacity={i === 1 ? 0.14 : 0.06} stroke={i === 1 ? route : hair} />
            <line x1={14} y1={y + 8} x2={i === 1 ? 62 : 50} y2={y + 8} stroke={i === 1 ? route : hair} strokeWidth="1.6" />
          </g>
        ))}
      </g>
    </g>
  );
}

function KanbanFlow() {
  const lanes = [
    { x: 40, w: 70, load: 3, limit: 3 },
    { x: 130, w: 70, load: 2, limit: 3 },
    { x: 220, w: 70, load: 1, limit: 3 },
  ];
  return (
    <g>
      <line x1={16} y1={100} x2={344} y2={100} stroke={hair} strokeDasharray="4 5" />
      {lanes.map((lane) => (
        <g key={lane.x}>
          <rect x={lane.x} y={44} width={lane.w} height={112} rx={8} fill="none" stroke={lane.load === lane.limit ? warning : hair} strokeWidth={lane.load === lane.limit ? 1.6 : 1} />
          {Array.from({ length: lane.load }, (_, i) => (
            <g key={i}>
              <rect x={lane.x + 10} y={54 + i * 24} width={lane.w - 20} height={17} rx={4} fill={strong} fillOpacity=".07" stroke={hair} />
              <line x1={lane.x + 15} y1={63 + i * 24} x2={lane.x + lane.w - 28} y2={63 + i * 24} stroke={strong} strokeOpacity=".45" />
            </g>
          ))}
          <g transform={`translate(${lane.x + 10} 34)`}>
            {Array.from({ length: lane.limit }, (_, i) => (
              <rect key={i} x={i * 12} y={0} width={9} height={5} rx={2.5} fill={i < lane.load ? (lane.load === lane.limit ? warning : route) : faint} />
            ))}
          </g>
        </g>
      ))}
      <Arrow d="M110 100 H128" />
      <Arrow d="M200 100 H218" />
      <g transform="translate(300 62)">
        <line x1={0} y1={0} x2={0} y2={76} stroke={point} strokeWidth="1.4" />
        <ControlPoint cx={0} cy={38} tone={point} size={13} />
      </g>
      <path d="M290 100 C306 100 312 88 320 76" fill="none" stroke={route} strokeWidth="1.6" markerEnd="url(#atlas-head)" />
    </g>
  );
}

function CpmNetwork() {
  const nodes = { a: [46, 100], b: [130, 56], c: [130, 148], d: [214, 100], e: [298, 60], f: [298, 142] };
  return (
    <g>
      <g stroke={hair} strokeWidth="1.4" fill="none" strokeDasharray="5 4">
        <path d="M130 148 L214 100" markerEnd="url(#atlas-head-faint)" />
        <path d="M214 100 L298 142" markerEnd="url(#atlas-head-faint)" />
      </g>
      <g stroke={route} strokeWidth="2.4" fill="none">
        <path d="M46 100 L130 56" markerEnd="url(#atlas-head)" />
        <path d="M130 56 L214 100" markerEnd="url(#atlas-head)" />
        <path d="M214 100 L298 60" markerEnd="url(#atlas-head)" />
      </g>
      {(Object.keys(nodes) as (keyof typeof nodes)[]).map((key) => {
        const [x, y] = nodes[key];
        const critical = key === "a" || key === "b" || key === "d" || key === "e";
        return (
          <g key={key}>
            <circle cx={x} cy={y} r={13} fill="var(--surface-0)" stroke={critical ? route : hair} strokeWidth={critical ? 2 : 1.2} />
            <circle cx={x} cy={y} r={critical ? 4.2 : 2.6} fill={critical ? route : hair} />
          </g>
        );
      })}
      <ControlPoint cx={298} cy={60} tone={point} size={22} />
      <g stroke={hair} fill="none">
        <line x1={326} y1={100} x2={344} y2={100} />
        <line x1={335} y1={91} x2={335} y2={109} />
      </g>
      <path d="M46 128 C110 168 200 168 262 132" fill="none" stroke={point} strokeOpacity=".5" strokeWidth="1.2" strokeDasharray="3 4" />
    </g>
  );
}

function PertDistribution() {
  const base = 152;
  return (
    <g>
      <line x1={30} y1={base} x2={330} y2={base} stroke={strong} strokeWidth="1.2" markerEnd="url(#atlas-head-faint)" />
      {Array.from({ length: 13 }, (_, i) => (
        <line key={i} x1={44 + i * 22} y1={base} x2={44 + i * 22} y2={base + (i % 3 === 0 ? 9 : 4)} stroke={i % 3 === 0 ? strong : hair} />
      ))}
      <path d={`M44 ${base} C120 ${base} 140 56 186 56 C246 56 268 ${base} 320 ${base} Z`} fill={route} fillOpacity=".1" stroke="none" />
      <path d={`M44 ${base} C120 ${base} 140 56 186 56 C246 56 268 ${base} 320 ${base}`} fill="none" stroke={route} strokeWidth="2.2" />
      <path d={`M60 ${base} C150 ${base - 6} 176 82 214 82 C262 82 288 ${base} 328 ${base}`} fill="none" stroke={warning} strokeWidth="1.3" strokeDasharray="4 4" />
      {[
        { x: 84, tone: success, h: base - 96 },
        { x: 186, tone: route, h: base - 56 },
        { x: 286, tone: danger, h: base - 116 },
      ].map((p) => (
        <g key={p.x}>
          <line x1={p.x} y1={base} x2={p.x} y2={p.h} stroke={p.tone} strokeWidth="1.4" />
          <Node cx={p.x} cy={p.h} tone={p.tone} r={4} />
        </g>
      ))}
      <line x1={84} y1={base + 16} x2={286} y2={base + 16} stroke={point} strokeWidth="1.4" />
      <line x1={84} y1={base + 11} x2={84} y2={base + 21} stroke={point} strokeWidth="1.4" />
      <line x1={286} y1={base + 11} x2={286} y2={base + 21} stroke={point} strokeWidth="1.4" />
      <ControlPoint cx={185} cy={base + 16} tone={point} size={13} />
    </g>
  );
}

function EarnedValueCurves() {
  const base = 158;
  return (
    <g>
      <line x1={34} y1={base} x2={336} y2={base} stroke={hair} />
      <line x1={34} y1={base} x2={34} y2={24} stroke={hair} />
      {Array.from({ length: 7 }, (_, i) => (
        <line key={i} x1={34} y1={base - (i + 1) * 19} x2={336} y2={base - (i + 1) * 19} stroke={hair} strokeOpacity=".4" strokeDasharray="2 5" />
      ))}
      <path d="M34 158 C110 132 190 96 262 66 C296 52 318 46 334 42" fill="none" stroke={strong} strokeOpacity=".6" strokeWidth="1.6" strokeDasharray="7 5" />
      <path d="M34 158 C104 140 166 118 224 94 C272 74 306 62 334 54" fill="none" stroke={route} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M34 158 C96 136 150 116 206 92 C258 70 300 50 334 36" fill="none" stroke={danger} strokeWidth="1.6" strokeDasharray="3 3" />
      <line x1={224} y1={94} x2={224} y2={66} stroke={point} strokeWidth="1.4" />
      <line x1={219} y1={94} x2={229} y2={94} stroke={point} />
      <line x1={219} y1={66} x2={229} y2={66} stroke={point} />
      <line x1={206} y1={92} x2={206} y2={110} stroke={warning} strokeWidth="1.4" strokeDasharray="2 2" />
      <ControlPoint cx={224} cy={80} tone={point} size={17} />
      <g transform="translate(300 122)">
        <rect x={0} y={0} width={44} height={30} rx={5} fill="none" stroke={hair} />
        <line x1={7} y1={10} x2={30} y2={10} stroke={route} strokeWidth="2.2" />
        <line x1={7} y1={19} x2={24} y2={19} stroke={danger} strokeWidth="1.4" />
      </g>
    </g>
  );
}

function PriorityLogic() {
  const bars = [
    { x: 52, h: 96, tone: route },
    { x: 116, h: 68, tone: route },
    { x: 180, h: 118, tone: point },
    { x: 244, h: 44, tone: warning },
  ];
  return (
    <g>
      <line x1={34} y1={162} x2={330} y2={162} stroke={strong} strokeWidth="1.2" />
      {bars.map((bar, i) => (
        <g key={bar.x}>
          <rect x={bar.x} y={162 - bar.h} width={44} height={bar.h} rx={5} fill={bar.tone} fillOpacity=".13" stroke={bar.tone} strokeWidth="1.3" />
          <line x1={bar.x + 8} y1={162 - bar.h + 12} x2={bar.x + 36} y2={162 - bar.h + 12} stroke={bar.tone} strokeWidth="2.4" />
          <g stroke={bar.tone} strokeOpacity=".55">
            {[0, 1, 2].map((r) => (
              <line key={r} x1={bar.x + 8} y1={162 - bar.h + 26 + r * 12} x2={bar.x + 8 + [30, 22, 27][r]} y2={162 - bar.h + 26 + r * 12} />
            ))}
          </g>
          <text x={bar.x + 22} y={176} textAnchor="middle" fill={i === 2 ? point : hair} fontSize="10" fontWeight="750" fontFamily="var(--font-sans)" aria-hidden="true">
            {`0${i + 1}`}
          </text>
        </g>
      ))}
      <path d="M180 30 C214 22 258 40 292 66" fill="none" stroke={point} strokeWidth="1.3" strokeDasharray="4 4" markerEnd="url(#atlas-head)" />
      <ControlPoint cx={180} cy={30} tone={point} size={13} />
      <g transform="translate(296 100)" stroke={hair} fill="none">
        <rect x={0} y={0} width={40} height={54} rx={6} />
        <line x1={8} y1={14} x2={32} y2={14} stroke={route} strokeWidth="2" />
        <line x1={8} y1={26} x2={26} y2={26} />
        <line x1={8} y1={38} x2={30} y2={38} />
      </g>
    </g>
  );
}

/** Likelihood against consequence, shared by the method sheets and the capability board. */
export function RiskMatrix() {
  const cells = 4;
  const size = 26;
  const origin = { x: 46, y: 148 };
  const plotted = [
    { c: 3, r: 0, tone: danger },
    { c: 1, r: 2, tone: warning },
    { c: 0, r: 3, tone: route },
  ];
  return (
    <g>
      {Array.from({ length: cells }, (_, row) =>
        Array.from({ length: cells }, (_, col) => {
          const score = (col + 1) * (row + 1);
          const tone = score >= 9 ? danger : score >= 5 ? warning : route;
          return (
            <rect
              key={`${row}-${col}`}
              x={origin.x + col * size}
              y={origin.y - (row + 1) * size}
              width={size - 2}
              height={size - 2}
              rx={3}
              fill={tone}
              fillOpacity={0.06 + score * 0.017}
              stroke={hair}
              strokeOpacity=".5"
            />
          );
        }),
      )}
      <line x1={origin.x - 8} y1={origin.y - cells * size - 6} x2={origin.x - 8} y2={origin.y} stroke={strong} strokeWidth="1.2" markerEnd="url(#atlas-head-faint)" />
      <line x1={origin.x - 6} y1={origin.y + 8} x2={origin.x + cells * size + 4} y2={origin.y + 8} stroke={strong} strokeWidth="1.2" markerEnd="url(#atlas-head-faint)" />
      {plotted.map((p) => (
        <ControlPoint key={`${p.c}-${p.r}`} cx={origin.x + p.c * size + 12} cy={origin.y - p.r * size - 13} tone={p.tone} size={11} />
      ))}
      <path d={`M${origin.x + 4} ${origin.y - 4} L${origin.x + cells * size - 6} ${origin.y - cells * size + 6}`} stroke={point} strokeWidth="1" strokeDasharray="4 4" />
      <g stroke={hair} fill="none">
        <line x1={212} y1={54} x2={286} y2={54} />
        <line x1={212} y1={54} x2={212} y2={126} />
      </g>
      <path d="M222 116 C240 96 258 82 280 62" fill="none" stroke={route} strokeWidth="1.4" strokeDasharray="3 3" />
      <Node cx={280} cy={62} tone={danger} r={3} />
    </g>
  );
}
