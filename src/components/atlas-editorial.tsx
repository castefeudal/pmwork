import type { Locale } from "@/domain/schemas";
import { Arrow, ControlPoint, Defs, Node, hair, route, strong } from "./atlas-marks";

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
