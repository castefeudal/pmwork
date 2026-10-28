import type { Locale } from "@/domain/schemas";
import { ControlPoint, Defs, Rail, hair, point, route, strong, success } from "./atlas-marks";

export type EmptyKind = "no-work" | "no-risks" | "no-filter" | "no-records";

const emptyTitles: Record<EmptyKind, { ru: string; en: string }> = {
  "no-work": { ru: "Пустой участок карты: одна нанесённая точка отсчёта и начало маршрута", en: "An unmapped area: one plotted origin and the start of a route" },
  "no-risks": { ru: "Свободное поле наблюдений: рамка обследования без отмеченных отклонений", en: "An open survey field: a review frame with no recorded deviations" },
  "no-filter": { ru: "Маршрут не найден: пунктирный поиск по пустой сетке", en: "No route found: a dashed search across an empty grid" },
  "no-records": { ru: "Чистый лист реестра с нанесённой сеткой и разметкой полей", en: "A blank register sheet with a plotted grid and field marks" },
};

export function EmptyStateGraphic({ kind, locale }: { kind: EmptyKind; locale: Locale }) {
  const label = emptyTitles[kind][locale === "ru" ? "ru" : "en"];
  return (
    <svg className="atlas-graphic atlas-empty" viewBox="0 0 200 120" role="img" aria-label={label} focusable="false">
      <Defs />
      {kind === "no-work" && (
        <g>
          <rect x={14} y={12} width={172} height={96} rx={9} fill="none" stroke={hair} strokeDasharray="4 5" />
          <Rail x={26} y1={24} y2={96} ticks={5} />
          <line x1={40} y1={96} x2={176} y2={96} stroke={hair} />
          <ControlPoint cx={54} cy={80} tone={point} size={13} />
          <path d="M54 80 C78 74 92 60 112 48" fill="none" stroke={route} strokeWidth="1.8" strokeLinecap="round" markerEnd="url(#atlas-head)" />
          <line x1={128} y1={40} x2={164} y2={40} stroke={hair} strokeDasharray="3 4" />
          <line x1={140} y1={54} x2={168} y2={54} stroke={hair} strokeDasharray="3 4" strokeOpacity=".7" />
        </g>
      )}
      {kind === "no-risks" && (
        <g>
          <rect x={44} y={16} width={112} height={88} rx={8} fill="none" stroke={hair} />
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => (
              <rect key={`${r}-${c}`} x={52 + c * 34} y={24 + r * 28} width={28} height={22} rx={4} fill={route} fillOpacity={0.05 + (r + c) * 0.012} stroke={hair} strokeOpacity=".55" />
            )),
          )}
          <line x1={38} y1={108} x2={162} y2={108} stroke={hair} />
          <line x1={38} y1={108} x2={38} y2={12} stroke={hair} />
          <path d="M158 30 L172 44 M172 30 L158 44" stroke={success} strokeWidth="1.6" strokeLinecap="round" />
        </g>
      )}
      {kind === "no-filter" && (
        <g>
          {Array.from({ length: 5 }, (_, i) => (
            <line key={`v${i}`} x1={30 + i * 35} y1={16} x2={30 + i * 35} y2={104} stroke={hair} strokeOpacity=".45" strokeDasharray="2 5" />
          ))}
          {Array.from({ length: 3 }, (_, i) => (
            <line key={`h${i}`} x1={22} y1={28 + i * 30} x2={178} y2={28 + i * 30} stroke={hair} strokeOpacity=".45" strokeDasharray="2 5" />
          ))}
          <circle cx={92} cy={56} r={26} fill="none" stroke={route} strokeWidth="1.8" />
          <line x1={111} y1={75} x2={130} y2={94} stroke={route} strokeWidth="2.4" strokeLinecap="round" />
          <ControlPoint cx={92} cy={56} tone={point} size={15} />
          <line x1={140} y1={94} x2={172} y2={94} stroke={hair} />
        </g>
      )}
      {kind === "no-records" && (
        <g>
          <rect x={54} y={12} width={92} height={96} rx={7} fill="none" stroke={strong} strokeWidth="1.3" />
          <line x1={54} y1={34} x2={146} y2={34} stroke={hair} />
          <line x1={64} y1={23} x2={104} y2={23} stroke={route} strokeWidth="2.4" />
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={64} y1={48 + i * 15} x2={i % 2 ? 110 : 136} y2={48 + i * 15} stroke={hair} />
          ))}
          <line x1={64} y1={98} x2={84} y2={98} stroke={point} strokeWidth="2" />
          <ControlPoint cx={156} cy={70} tone={point} size={11} />
        </g>
      )}
    </svg>
  );
}
