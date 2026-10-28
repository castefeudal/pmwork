import type { Locale } from "@/domain/schemas";
import { Arrow, ControlPoint, Defs, Node, Rail, danger, faint, hair, point, route, strong, success, warning } from "./atlas-marks";
import { RiskMatrix } from "./atlas-graphics";

export type FeatureKind = "attention" | "board" | "risk" | "model" | "method" | "library";

const featureTitles: Record<FeatureKind, { ru: string; en: string }> = {
  attention: {
    ru: "Карта внимания: сигналы выстроены по ближайшим датам, критичная точка отмечена медным маркером",
    en: "Attention map: signals ordered by their nearest dates, with the critical point marked in copper",
  },
  board: {
    ru: "Доска потока: три колонки с ограничением незавершённой работы и переносом карточки",
    en: "Flow board: three columns with a work-in-progress limit and one card moving forward",
  },
  risk: {
    ru: "Матрица рисков: вероятность по горизонтали, последствия по вертикали, три размеченных риска",
    en: "Risk matrix: likelihood across, consequence up, with three plotted risks",
  },
  model: {
    ru: "Модель расчёта: плановая и фактическая кривые с замеренным отклонением",
    en: "Calculation model: planned and actual curves with the variance measured between them",
  },
  method: {
    ru: "Поле выбора метода: пять подходов размещены по устойчивости требований и частоте обратной связи",
    en: "Method field: five approaches placed by requirements stability and feedback cadence",
  },
  library: {
    ru: "Хранилище материалов: три документа в общей рамке шаблона",
    en: "Material store: three documents inside a shared template frame",
  },
};

export function FeatureGraphic({ kind, locale }: { kind: FeatureKind; locale: Locale }) {
  const label = featureTitles[kind][locale === "ru" ? "ru" : "en"];
  return (
    <svg className="atlas-graphic atlas-feature" viewBox="0 0 320 176" role="img" aria-label={label} focusable="false">
      <Defs />
      {kind === "attention" && <AttentionMap />}
      {kind === "board" && <FlowBoard />}
      {kind === "risk" && <RiskMatrix />}
      {kind === "model" && <VarianceModel />}
      {kind === "method" && <MethodField />}
      {kind === "library" && <DocumentPlates />}
    </svg>
  );
}

function AttentionMap() {
  const signals = [
    { x: 96, y: 58, tone: danger, drop: 1 },
    { x: 158, y: 96, tone: warning, drop: 1 },
    { x: 236, y: 74, tone: route, drop: 1 },
    { x: 274, y: 112, tone: faint, drop: 0 },
  ];
  return (
    <g>
      <Rail x={22} y1={26} y2={150} ticks={7} />
      <line x1={40} y1={132} x2={304} y2={132} stroke={hair} />
      {Array.from({ length: 11 }, (_, i) => (
        <line key={i} x1={40 + i * 26.4} y1={132} x2={40 + i * 26.4} y2={132 + (i % 5 === 0 ? 9 : 4)} stroke={i % 5 === 0 ? strong : hair} strokeWidth="1" />
      ))}
      <line x1={128} y1={22} x2={128} y2={132} stroke={point} strokeWidth="1" strokeDasharray="3 4" />
      {signals.map((s) => (
        <g key={`${s.x}-${s.y}`}>
          {s.drop ? <line x1={s.x} y1={s.y + 8} x2={s.x} y2={131} stroke={s.tone} strokeOpacity=".4" strokeDasharray="2 3" /> : null}
          <Node cx={s.x} cy={s.y} tone={s.tone} r={s.tone === danger ? 4.6 : 3.4} />
        </g>
      ))}
      <ControlPoint cx={96} cy={58} tone={point} size={15} />
      <path d="M96 58 C132 40 176 96 236 74" fill="none" stroke={route} strokeWidth="1.4" strokeOpacity=".55" strokeDasharray="5 4" />
    </g>
  );
}

function FlowBoard() {
  const columns = [
    { x: 30, cards: [0, 1, 2], limit: 3 },
    { x: 132, cards: [0, 1], limit: 2 },
    { x: 234, cards: [0], limit: 0 },
  ];
  return (
    <g>
      {columns.map((col) => (
        <g key={col.x}>
          <rect x={col.x} y={40} width={76} height={116} rx={7} fill="none" stroke={hair} />
          <g transform={`translate(${col.x + 9} 22)`}>
            {Array.from({ length: 3 }, (_, i) => (
              <rect key={i} x={i * 11} y={0} width={8} height={5} rx={2.5} fill={i < col.cards.length && col.limit ? col.x === 132 ? warning : route : faint} />
            ))}
          </g>
          {col.cards.map((row) => (
            <g key={row}>
              <rect x={col.x + 8} y={50 + row * 26} width={60} height={19} rx={4.5} fill={strong} fillOpacity=".07" stroke={hair} />
              <line x1={col.x + 13} y1={57 + row * 26} x2={col.x + 47} y2={57 + row * 26} stroke={strong} strokeOpacity=".5" />
              <line x1={col.x + 13} y1={63 + row * 26} x2={col.x + 34} y2={63 + row * 26} stroke={hair} />
            </g>
          ))}
        </g>
      ))}
      <path d="M170 76 C170 104 210 116 240 116" fill="none" stroke={route} strokeWidth="1.6" strokeDasharray="4 4" markerEnd="url(#atlas-head)" />
      <rect x={240} y={106} width={60} height={19} rx={4.5} fill={route} fillOpacity=".12" stroke={route} strokeDasharray="3 3" />
      <line x1={132} y1={160} x2={208} y2={160} stroke={warning} strokeWidth="1.6" />
      <text x={212} y={164} fill={warning} fontSize="9" fontWeight="700" fontFamily="var(--font-sans)" aria-hidden="true">
        WIP
      </text>
    </g>
  );
}

function VarianceModel() {
  const baseline = 146;
  return (
    <g>
      <line x1={30} y1={baseline} x2={300} y2={baseline} stroke={hair} />
      {Array.from({ length: 10 }, (_, i) => (
        <line key={i} x1={30 + i * 30} y1={baseline} x2={30 + i * 30} y2={baseline + 6} stroke={i % 3 === 0 ? strong : hair} />
      ))}
      <line x1={30} y1={baseline} x2={30} y2={26} stroke={hair} />
      <path d="M30 142 C108 128 168 92 216 62 C252 40 274 34 296 30" fill="none" stroke={strong} strokeOpacity=".55" strokeWidth="1.5" strokeDasharray="6 5" />
      <path d="M30 142 C96 136 142 122 182 104 C224 84 262 70 296 62" fill="none" stroke={route} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M30 142 C104 130 156 112 202 88 C240 68 270 58 296 52" fill="none" stroke={warning} strokeWidth="1.4" strokeDasharray="2 3" />
      <line x1={216} y1={62} x2={216} y2={88} stroke={point} strokeWidth="1.4" />
      <line x1={211} y1={62} x2={221} y2={62} stroke={point} strokeWidth="1.4" />
      <line x1={211} y1={88} x2={221} y2={88} stroke={point} strokeWidth="1.4" />
      <ControlPoint cx={216} cy={75} tone={point} size={16} />
      <Node cx={296} cy={62} tone={route} r={3.6} />
      <Node cx={296} cy={30} tone={strong} r={2.6} />
    </g>
  );
}

function MethodField() {
  const nodes = [
    { x: 74, y: 42, tone: route, label: "01" },
    { x: 138, y: 68, tone: route, label: "02" },
    { x: 206, y: 108, tone: warning, label: "03" },
    { x: 246, y: 74, tone: route, label: "04" },
    { x: 116, y: 122, tone: point, label: "05" },
  ];
  return (
    <g>
      <rect x={150} y={26} width={140} height={68} rx={8} fill={success} fillOpacity=".07" stroke={success} strokeOpacity=".3" strokeDasharray="4 4" />
      <line x1={44} y1={148} x2={302} y2={148} stroke={strong} strokeWidth="1.2" markerEnd="url(#atlas-head-faint)" />
      <line x1={44} y1={148} x2={44} y2={20} stroke={strong} strokeWidth="1.2" markerEnd="url(#atlas-head-faint)" />
      {Array.from({ length: 4 }, (_, i) => (
        <line key={i} x1={44} y1={148 - (i + 1) * 25.6} x2={302} y2={148 - (i + 1) * 25.6} stroke={hair} strokeOpacity=".45" strokeDasharray="2 5" />
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <line key={i} x1={44 + (i + 1) * 43} y1={20} x2={44 + (i + 1) * 43} y2={148} stroke={hair} strokeOpacity=".45" strokeDasharray="2 5" />
      ))}
      {nodes.map((n) => (
        <g key={n.label}>
          <line x1={n.x} y1={n.y} x2={n.x} y2={148} stroke={n.tone} strokeOpacity=".28" strokeDasharray="2 3" />
          <Node cx={n.x} cy={n.y} tone={n.tone} r={4} />
        </g>
      ))}
      <path d="M74 42 C140 60 190 92 246 74" fill="none" stroke={route} strokeWidth="1.2" strokeOpacity=".5" strokeDasharray="5 4" />
    </g>
  );
}

function DocumentPlates() {
  const sheets = [
    { x: 44, y: 44, tone: hair },
    { x: 104, y: 34, tone: hair },
    { x: 164, y: 44, tone: strong },
  ];
  return (
    <g>
      <rect x={26} y={22} width={232} height={134} rx={10} fill="none" stroke={hair} strokeDasharray="4 5" />
      {sheets.map((s, i) => (
        <g key={s.x}>
          <rect x={s.x} y={s.y} width={88} height={112} rx={6} fill={i === 2 ? "var(--surface-0)" : "transparent"} stroke={s.tone} strokeWidth={i === 2 ? 1.4 : 1} />
          <line x1={s.x + 10} y1={s.y + 18} x2={s.x + 62} y2={s.y + 18} stroke={i === 2 ? route : hair} strokeWidth="2.4" />
          {Array.from({ length: 5 }, (_, r) => (
            <line key={r} x1={s.x + 10} y1={s.y + 36 + r * 13} x2={s.x + 78 - (r % 3) * 14} y2={s.y + 36 + r * 13} stroke={hair} />
          ))}
          <line x1={s.x + 10} y1={s.y + 100} x2={s.x + 40} y2={s.y + 100} stroke={point} strokeWidth="2" />
        </g>
      ))}
      <g transform="translate(248 40)">
        <path d="M0 0 h54 v104 h-54 z" fill="none" stroke={hair} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <line x1={8} y1={16 + i * 24} x2={46} y2={16 + i * 24} stroke={i === 1 ? route : hair} strokeWidth={i === 1 ? 2 : 1} />
            <line x1={8} y1={24 + i * 24} x2={30} y2={24 + i * 24} stroke={hair} strokeOpacity=".7" />
          </g>
        ))}
      </g>
    </g>
  );
}

export type LibraryKind = "method" | "template" | "scenario" | "term";

const libraryTitles: Record<LibraryKind, { ru: string; en: string }> = {
  method: { ru: "Поле подходов: три нанесённых варианта на осях изменчивости и срока", en: "Approach field: three plotted options on volatility and deadline axes" },
  template: { ru: "Стопка готовых структур: лист шаблона поверх реестра", en: "A stack of ready structures: a template sheet over a register" },
  scenario: { ru: "Развилка сценария: два маршрута из одного события", en: "Scenario fork: two routes from one event" },
  term: { ru: "Указатель терминов: шкала с отметками разной длины", en: "Term index: a rail with ticks of varying length" },
};

/** Small distinct sigil per library surface, so the four cards are not one card. */
export function LibraryMotif({ kind, locale }: { kind: LibraryKind; locale: Locale }) {
  const label = libraryTitles[kind][locale === "ru" ? "ru" : "en"];
  return (
    <svg className="atlas-graphic atlas-motif" viewBox="0 0 132 44" role="img" aria-label={label} focusable="false">
      <Defs />
      {kind === "method" && (
        <g>
          <line x1="10" y1="36" x2="122" y2="36" stroke={hair} />
          <line x1="10" y1="36" x2="10" y2="6" stroke={hair} />
          <Arrow d="M22 30 C48 26 62 16 92 13" />
          <Node cx={22} cy={30} />
          <Node cx={62} cy={20} />
          <ControlPoint cx={92} cy={13} size={9} />
        </g>
      )}
      {kind === "template" && (
        <g>
          <rect x="14" y="10" width="46" height="28" rx="4" fill="none" stroke={hair} strokeDasharray="3 4" />
          <rect x="30" y="6" width="46" height="32" rx="4" fill="none" stroke={hair} />
          <rect x="46" y="2" width="48" height="38" rx="5" fill="none" stroke={strong} strokeWidth="1.2" />
          <line x1="54" y1="12" x2="82" y2="12" stroke={route} strokeWidth="2" />
          <line x1="54" y1="21" x2="86" y2="21" stroke={hair} />
          <line x1="54" y1="29" x2="74" y2="29" stroke={hair} />
          <ControlPoint cx={108} cy={34} size={8} />
        </g>
      )}
      {kind === "scenario" && (
        <g>
          <Node cx={12} cy={22} />
          <Arrow d="M12 22 H44" />
          <path d="M44 22 C64 22 66 10 86 10 H112" fill="none" stroke={route} strokeWidth="1.6" strokeLinecap="round" markerEnd="url(#atlas-head)" />
          <path d="M44 22 C64 22 66 34 86 34 H108" fill="none" stroke={hair} strokeWidth="1.4" strokeDasharray="4 4" />
          <ControlPoint cx={118} cy={10} size={9} />
          <Node cx={114} cy={34} tone={hair} r={2.6} />
        </g>
      )}
      {kind === "term" && (
        <g>
          <line x1="8" y1="22" x2="124" y2="22" stroke={hair} />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <line key={i} x1={14 + i * 15} y1="22" x2={14 + i * 15} y2={i % 4 === 0 ? 6 : i % 2 === 0 ? 12 : 15} stroke={i % 4 === 0 ? route : hair} strokeWidth={i % 4 === 0 ? 1.6 : 1} />
          ))}
          <ControlPoint cx={44} cy={22} size={9} />
          <ControlPoint cx={89} cy={22} size={9} />
        </g>
      )}
    </svg>
  );
}
